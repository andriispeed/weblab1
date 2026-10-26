import { colors, components, devices, getKitIntro, getScreens, Item, Color, Device } from './design';

const PREFIX = 'IT School / ';
const masters = new Map<string, ComponentNode>();
const variables = new Map<string, Variable>();
const textStyles = new Map<string, TextStyle>();
type Container = FrameNode | ComponentNode;
const pending: { node: SceneNode & ReactionMixin; target?: string; back?: boolean }[] = [];
const frames = new Map<string, FrameNode>();
const created: SceneNode[] = [];

function rgb(hex: string): RGB {
  return { r: parseInt(hex.slice(1,3),16)/255, g:parseInt(hex.slice(3,5),16)/255, b:parseInt(hex.slice(5,7),16)/255 };
}
function paint(key: Color): SolidPaint {
  const p: SolidPaint = { type:'SOLID', color:rgb(colors[key]) };
  const v = variables.get(key);
  return v ? figma.variables.setBoundVariableForPaint(p,'color',v) : p;
}
function padding(item: Item): [number,number,number,number] {
  return Array.isArray(item.pad) ? item.pad : [item.pad || 0,item.pad || 0,item.pad || 0,item.pad || 0];
}
function token(node: Container, field: 'itemSpacing' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft', value: number) {
  node[field] = value;
  const v = variables.get(`space/${value}`);
  if (v) node.setBoundVariable(field,v);
}
function styleKey(item: Item) { return `${item.size || 16}/${item.weight || 'Regular'}/${item.line || 1.5}/${item.tracking || 0}`; }
async function setText(node: TextNode, item: Item) {
  const key=styleKey(item);
  let style=textStyles.get(key);
  if (!style) {
    style=figma.createTextStyle();
    style.name=PREFIX+'Type/'+key;
    style.fontName={family:'Inter',style:item.weight || 'Regular'};
    style.fontSize=item.size || 16;
    style.lineHeight={unit:'PERCENT',value:100*(item.line || 1.5)};
    style.letterSpacing={unit:'PIXELS',value:item.tracking || 0};
    textStyles.set(key,style);
  }
  await node.setTextStyleIdAsync(style.id);
  node.characters=item.text || '';
  node.fills=[paint(item.color || 'ink')];
  node.textAlignHorizontal=item.textAlign === 'center' ? 'CENTER' : 'LEFT';
}
function attachReaction(node: SceneNode, item: Item) {
  if ((item.target || item.action) && 'setReactionsAsync' in node) {
    pending.push({node:node as SceneNode & ReactionMixin,target:item.target,back:item.action === 'back'});
  }
}
function childrenWidths(item: Item, width: number): number[] {
  const children=item.children || [];
  const p=padding(item);
  const available=width-p[1]-p[3];
  if (item.direction !== 'row') return children.map(c=>typeof c.w === 'number' ? c.w : available);
  const fixed=children.reduce((total,c)=>total+(typeof c.w === 'number' ? c.w : 0),0);
  const fills=children.filter(c=>typeof c.w !== 'number').length;
  const flexible=(available-fixed-Math.max(0,children.length-1)*(item.gap ?? 16))/Math.max(1,fills);
  if (flexible < 0 && fills) throw new Error(`Немає місця в рядку: ${item.name}`);
  return children.map(c=>typeof c.w === 'number' ? c.w : Math.max(1,flexible));
}
async function populate(node: Container, item: Item, width: number) {
  node.name=item.name;
  node.layoutMode=item.direction === 'row' ? 'HORIZONTAL' : 'VERTICAL';
  node.resize(width,item.h || 1);
  node.primaryAxisSizingMode=node.layoutMode === 'VERTICAL' && !item.h ? 'AUTO' : 'FIXED';
  node.counterAxisSizingMode=node.layoutMode === 'HORIZONTAL' && !item.h ? 'AUTO' : 'FIXED';
  node.counterAxisAlignItems=item.align === 'center' ? 'CENTER' : 'MIN';
  node.primaryAxisAlignItems=item.between ? 'SPACE_BETWEEN' : 'MIN';
  const p=padding(item);
  token(node,'paddingTop',p[0]); token(node,'paddingRight',p[1]);
  token(node,'paddingBottom',p[2]); token(node,'paddingLeft',p[3]);
  token(node,'itemSpacing',item.gap ?? 16);
  node.fills=item.bg ? [paint(item.bg)] : [];
  node.strokes=item.stroke ? [paint(item.stroke)] : [];
  node.strokeWeight=1;
  node.strokeAlign='INSIDE';
  node.cornerRadius=item.radius || 0;
  if (item.focus) node.effects=[
    {type:'DROP_SHADOW',color:{r:1,g:1,b:1,a:1},offset:{x:0,y:0},radius:0,spread:2,visible:true,blendMode:'NORMAL'},
    {type:'DROP_SHADOW',color:{...rgb(colors.primary),a:1},offset:{x:0,y:0},radius:0,spread:4,visible:true,blendMode:'NORMAL'},
  ];
  node.clipsContent=false;
  if (item.opacity !== undefined) node.opacity=item.opacity;
  const widths=childrenWidths(item,width);
  for (const [i,child] of (item.children || []).entries()) {
    const rendered=await render(child,widths[i]);
    node.appendChild(rendered);
    if (child.w === 'fill' || child.w === undefined) rendered.layoutSizingHorizontal='FILL';
  }
  if (!node.children.length && !item.h) node.resize(width,1);
}
async function render(item: Item, availableWidth: number): Promise<SceneNode & LayoutMixin> {
  const width=typeof item.w === 'number' ? item.w : availableWidth;
  if (item.kind === 'text') {
    const node=figma.createText();
    node.name=item.name;
    await setText(node,item);
    node.resize(width,item.h || 1);
    node.textAutoResize=item.h ? 'NONE' : 'HEIGHT';
    attachReaction(node,item);
    return node;
  }
  if (item.kind === 'instance') {
    const master=masters.get(item.ref!);
    if (!master) throw new Error(`Компонент не знайдено: ${item.ref}`);
    const node=master.createInstance();
    node.name=item.name;
    node.resize(width,node.height);
    node.primaryAxisSizingMode=master.primaryAxisSizingMode;
    node.counterAxisSizingMode=master.counterAxisSizingMode;
    for (const [name,value] of Object.entries(item.overrides || {})) {
      const label=node.findOne(n=>n.type === 'TEXT' && n.name === name) as TextNode | null;
      if (!label) throw new Error(`Шар ${name} не знайдено у ${item.ref}`);
      label.characters=value;
    }
    attachReaction(node,item);
    return node;
  }
  const node=figma.createFrame();
  await populate(node,item,width);
  attachReaction(node,item);
  return node;
}
function makeSection(name:string,x:number,y:number): SectionNode {
  const section=figma.createSection();
  section.name=name;
  section.x=x; section.y=y;
  section.fills=[{type:'SOLID',color:rgb('#EBECE7')}];
  created.push(section);
  return section;
}
function place(section:SectionNode,node:SceneNode,x:number,y:number) {
  section.appendChild(node); node.x=x; node.y=y;
}
async function createTokens() {
  const collections=await figma.variables.getLocalVariableCollectionsAsync();
  const collection=collections.find(c=>c.name === PREFIX+'Tokens') || figma.variables.createVariableCollection(PREFIX+'Tokens');
  const existing=await figma.variables.getLocalVariablesAsync();
  for (const [key,hex] of Object.entries(colors)) {
    // Existing collections are respected; no user-edited values are overwritten.
    let v=existing.find(v=>v.variableCollectionId === collection.id && v.name === `color/${key}` && v.resolvedType === 'COLOR');
    if (!v) { v=figma.variables.createVariable(`color/${key}`,collection,'COLOR'); v.setValueForMode(collection.defaultModeId,{...rgb(hex),a:1}); }
    variables.set(key,v);
  }
  for (const amount of [0,4,6,8,10,12,16,20,24,26,28,32,40,48,56,64,80,96,100,120]) {
    let v=existing.find(v=>v.variableCollectionId === collection.id && v.name === `space/${amount}` && v.resolvedType === 'FLOAT');
    if (!v) { v=figma.variables.createVariable(`space/${amount}`,collection,'FLOAT'); v.setValueForMode(collection.defaultModeId,amount); }
    variables.set(`space/${amount}`,v);
  }
  for (const style of await figma.getLocalTextStylesAsync()) if (style.name.startsWith(PREFIX+'Type/')) textStyles.set(style.name.slice((PREFIX+'Type/').length),style);
}
async function makeKit(x:number,y:number) {
  const kit=makeSection('00 · IT.SCHOOL / UI Kit',x,y);
  const intro=await render(getKitIntro(),1440);
  place(kit,intro,40,64);
  let cursor=64+intro.height+64;
  const groups=new Map<string,ComponentNode[]>();
  for (const spec of components) {
    const master=figma.createComponent();
    await populate(master,spec.spec,typeof spec.spec.w === 'number' ? spec.spec.w : 320);
    master.name=spec.variant || spec.group;
    master.description=spec.description;
    masters.set(spec.key,master);
    const values=groups.get(spec.group) || [];
    values.push(master); groups.set(spec.group,values);
  }
  for (const [group,items] of groups) {
    const label=await render({kind:'text',name:group,text:group.toUpperCase(),size:16,weight:'Semi Bold',color:'primary'},1440);
    place(kit,label,40,cursor); cursor+=44;
    if (items.length>1) {
      const set=figma.combineAsVariants(items,kit);
      set.name=PREFIX+group;
      set.fills=[paint('white')];
      set.cornerRadius=4;
      const cols=group === 'Button' ? 4 : group === 'Input' ? 2 : group === 'Course card' ? 3 : 2;
      let rowY=24; let rowH=0;
      items.forEach((node,index)=>{
        if (index>0 && index%cols === 0) { rowY+=rowH+24; rowH=0; }
        const col=index%cols;
        node.x=24+col*(node.width+24); node.y=rowY;
        rowH=Math.max(rowH,node.height);
      });
      set.resize(Math.max(...items.map(n=>n.x+n.width))+24,rowY+rowH+24);
      set.x=40;set.y=cursor;
      cursor+=set.height+48;
    } else {
      place(kit,items[0],40,cursor);
      cursor+=items[0].height+48;
    }
  }
  kit.resizeWithoutConstraints(1520,cursor+40);
  return kit;
}
function layoutGrids(d:Device): LayoutGrid[] {
  return [{pattern:'COLUMNS',alignment:'STRETCH',count:devices[d].columns,gutterSize:24,offset:devices[d].margin,visible:false,color:{...rgb(colors.primary),a:0.08}}];
}
async function main() {
  const status=figma.notify('Створюю UI-kit і макети IT.SCHOOL…',{timeout:Infinity});
  await Promise.all(['Regular','Medium','Semi Bold','Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
  await createTokens();
  const right=Math.max(0,...figma.currentPage.children.map(n=>n.x+n.width));
  const originX=right ? right+240 : 0;
  const kit=await makeKit(originX,0);
  const screens=getScreens();
  const mainScreens=screens.filter(s=>!s.auxiliary);
  const mainNodes=new Map<string,FrameNode>();
  let designY=0;
  for (const d of Object.keys(devices) as Device[]) {
    const section=makeSection(`${d} · 4 повні сторінки`,originX+kit.width+160,designY);
    let offsetX=40;let tallest=0;
    for (const spec of mainScreens.filter(s=>s.device === d)) {
      const frame=await render(spec.spec,devices[d].width) as FrameNode;
      frame.name=`${d} / ${spec.name}`;
      frame.layoutGrids=layoutGrids(d);
      frame.setPluginData('it-school.screen',spec.key);
      place(section,frame,offsetX,64);
      offsetX+=frame.width+80; tallest=Math.max(tallest,frame.height);
      mainNodes.set(spec.key,frame);
    }
    section.resizeWithoutConstraints(offsetX-40,tallest+104);
    designY+=section.height+160;
  }
  // Separate fixed viewports preserve the full-page canvas designs and provide
  // real vertical scrolling in Present. All routes stay within one device.
  let protoY=Math.max(designY,kit.height+160);
  const starts: {nodeId:string;name:string}[]=[];
  for (const d of Object.keys(devices) as Device[]) {
    const section=makeSection(`Prototype / ${d} · сценарії та стани`,originX,protoY);
    const width=devices[d].width;
    const height=devices[d].viewport;
    const perRow=d === 'Desktop' ? 4 : d === 'Tablet' ? 5 : 6;
    const list=screens.filter(s=>s.device === d);
    for (const [i,spec] of list.entries()) {
      const viewport=figma.createFrame();
      viewport.name=`${d} / ${spec.name} / Prototype`;
      viewport.resize(width,height);
      viewport.fills=[paint('paper')];
      viewport.clipsContent=true;
      viewport.overflowDirection='VERTICAL';
      viewport.setPluginData('it-school.route',spec.key);
      const content=await render(spec.spec,width);
      viewport.appendChild(content); content.x=0;content.y=0;
      place(section,viewport,40+(i%perRow)*(width+80),64+Math.floor(i/perRow)*(height+100));
      frames.set(spec.key,viewport);
      if (spec.key === `${d}.home`) starts.push({nodeId:viewport.id,name:`IT.SCHOOL / ${d}`});
    }
    section.resizeWithoutConstraints(80+perRow*(width+80)-80,104+Math.ceil(list.length/perRow)*(height+100)-100);
    protoY+=section.height+160;
  }
  for (const reaction of pending) {
    const dest=reaction.target ? frames.get(reaction.target) : undefined;
    if (!dest && !reaction.back) throw new Error(`Перехід не знайдено: ${reaction.target}`);
    const action: Action=reaction.back ? {type:'BACK'} : {type:'NODE',destinationId:dest!.id,navigation:'NAVIGATE',transition:null,preserveScrollPosition:false};
    await reaction.node.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[action]}]);
  }
  figma.currentPage.flowStartingPoints=[...figma.currentPage.flowStartingPoints,...starts];
  const first=mainNodes.get('Desktop.home')!;
  figma.currentPage.selection=[first];
  figma.viewport.scrollAndZoomIntoView([first]);
  status.cancel();
  figma.closePlugin(`Готово: 12 макетів, ${components.length} компонентів, ${screens.length} екранів прототипу. Відкрий Present → IT.SCHOOL / Desktop, Tablet або Mobile.`);
}
main().catch(error=>{
  console.error(error);
  figma.closePlugin(`Помилка генератора: ${error instanceof Error ? error.message : String(error)}. Створені елементи можна скасувати через Undo.`);
});
