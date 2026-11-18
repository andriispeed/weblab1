import { gradientPalettes, rgbFromHex, paletteForBackground, minimumContrast, isControlOrChrome, isHeading, GradientMode } from './gradient';

type Source = FrameNode;
function hex(rgb: RGB): string {return '#'+[rgb.r,rgb.g,rgb.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();}
function nearestBackground(node:SceneNode):string|null {
  let parent:BaseNode|null=node.parent;
  while(parent && parent.type!=='PAGE' && parent.type!=='DOCUMENT') {
    if('opacity' in parent && typeof parent.opacity==='number' && parent.opacity<1) return null;
    if('fills' in parent && Array.isArray(parent.fills)) {
      const fills=parent.fills.filter((p:Paint)=>p.visible!==false && (p.opacity??1)>0);
      if(fills.length) {
        const fill=fills[fills.length-1] as Paint;
        if(fill.type!=='SOLID' || (fill.opacity??1)<1) return null;
        return hex(fill.color);
      }
    }
    parent=parent.parent;
  }
  return null;
}
function excluded(node:TextNode,root:FrameNode):boolean {
  let n:BaseNode|null=node;
  while(n && n!==root) {
    if(isControlOrChrome(n.name)) return true;
    n=n.parent;
  }
  return false;
}
function paint(palette:readonly string[]):GradientPaint {
  return {type:'GRADIENT_LINEAR',gradientTransform:[[1,0,0],[0,1,0]],gradientStops:palette.map((color,i)=>{
    const [r,g,b]=rgbFromHex(color);return {position:i/2,color:{r,g,b,a:1}};
  })};
}
async function label(section:SectionNode,value:string,x:number,y:number,width:number):Promise<TextNode> {
  const n=figma.createText();n.fontName={family:'Inter',style:'Medium'};n.fontSize=18;
  n.characters=value;n.fills=[{type:'SOLID',color:{r:0.14,g:0.14,b:0.12}}];
  n.resize(width,1);n.textAutoResize='HEIGHT';section.appendChild(n);n.x=x;n.y=y;return n;
}
async function main() {
  const selected=figma.currentPage.selection;
  const sources:Source[]=[];
  for(const node of selected) {
    if(node.type==='FRAME') sources.push(node);
    if(node.type==='SECTION') for(const child of node.children) if(child.type==='FRAME') sources.push(child);
  }
  const unique=sources.filter((n,i,a)=>a.findIndex(x=>x.id===n.id)===i);
  if(!unique.length || unique.length>12) {
    figma.closePlugin('Виділи від 1 до 12 фреймів сторінок або секції Desktop / Tablet / Mobile. UI-kit виділяти не потрібно.');return;
  }
  await figma.loadFontAsync({family:'Inter',style:'Medium'});
  const progress=figma.notify('CR15: створюю копії вибраних макетів…',{timeout:Infinity});
  const command=figma.command || 'compare';
  const modes:GradientMode[]=command==='full' ? ['full'] : command==='headings' ? ['headings'] : ['original','full','headings'];
  const titles={original:'A · Початковий макет',full:'B · Повна вимога: градієнт основного тексту',headings:'C · Компроміс: градієнт заголовків'};
  const right=Math.max(0,...figma.currentPage.children.map(n=>n.x+n.width));
  const section=figma.createSection();section.name='CR15 · Триколірний текст / порівняння';section.x=right+160;section.y=0;
  section.fills=[{type:'SOLID',color:{r:0.92,g:0.93,b:0.9}}];
  const clones=new Map<GradientMode,Map<string,FrameNode>>();
  let cursorY=80,maxRight=0,changed=0,unknown=0,lowContrast=0,minimum=21;
  const contrastCache=new Map<string,number>();
  for(const source of unique) {
    let x=40,rowHeight=0;
    for(const mode of modes) {
      const heading=await label(section,titles[mode],x,cursorY,source.width);
      const copy=source.clone();section.appendChild(copy);
      copy.name=`CR15 / ${mode} / ${source.name}`;copy.x=x;copy.y=cursorY+Math.max(72,heading.height+20);
      const map=clones.get(mode)||new Map<string,FrameNode>();map.set(source.id,copy);clones.set(mode,map);
      if(mode!=='original') {
        for(const node of copy.findAllWithCriteria({types:['TEXT']})) {
          if(excluded(node,copy) || !node.visible || !node.characters.trim()) continue;
          if(mode==='headings') {
            if(typeof node.fontSize!=='number' || node.fontName===figma.mixed || !isHeading(node.fontSize,node.fontName.style)) continue;
          }
          const background=nearestBackground(node);
          if(!background){unknown++;continue;}
          const palette=paletteForBackground(background);
          const key=palette.join(',')+background;
          let ratio=contrastCache.get(key);
          if(ratio===undefined){ratio=minimumContrast(palette,background);contrastCache.set(key,ratio);}
          if(ratio<4.5){lowContrast++;continue;}
          node.fills=[paint(palette)];
          node.setPluginData('it-school.cr15','gradient-main-text');
          minimum=Math.min(minimum,ratio);changed++;
        }
      }
      copy.setPluginData('it-school.cr15-mode',mode);
      rowHeight=Math.max(rowHeight,copy.y-cursorY+copy.height);
      x+=copy.width+80;maxRight=Math.max(maxRight,x);
    }
    cursorY+=rowHeight+100;
  }
  // Preserve existing desktop connections, remapping destinations to copies of
  // the same mode when those destination frames were selected too.
  for(const map of clones.values()) for(const copy of map.values()) {
    const nodes:SceneNode[]=[copy,...copy.findAll()];
    for(const node of nodes) if('reactions' in node && node.reactions.length) {
      const reactions:Reaction[]=node.reactions.map(reaction=>({trigger:reaction.trigger,actions:(reaction.actions||(reaction.action?[reaction.action]:[])).map(action=>{
        if(action.type==='NODE' && action.destinationId && map.has(action.destinationId)) return {...action,destinationId:map.get(action.destinationId)!.id};
        return action;
      })}));
      await node.setReactionsAsync(reactions);
    }
  }
  const notes=`Змінено текстових шарів: ${changed}. Мінімальний розрахований контраст: ${changed?minimum.toFixed(2):'—'}:1.\nНевідомий фон: ${unknown}; недостатній контраст: ${lowContrast} — такі шари залишені без змін та потребують ручної перевірки.\nТемний текст: ${gradientPalettes.dark.join(' → ')}. Світлий текст: ${gradientPalettes.light.join(' → ')}.\nОригінали збережені. Навігація, кнопки, поля та футер не входять до основного інформаційного тексту.\nЦе перевірка палітри на суцільному фоні, а не повний аудит WCAG. Перевір Present після імпорту.`;
  const note=await label(section,notes,40,cursorY,Math.min(1440,maxRight-80));
  note.fontSize=14;section.resizeWithoutConstraints(maxRight-40,cursorY+note.height+48);
  const first=clones.get(modes.includes('full')?'full':modes[0])!.get(unique[0].id)!;
  figma.currentPage.selection=[first];figma.viewport.scrollAndZoomIntoView([first]);progress.cancel();
  figma.closePlugin(`CR15: готово, ${changed} текстових шарів. Пропущено ${unknown+lowContrast}; подробиці під макетами.`);
}
main().catch(error=>{console.error(error);figma.closePlugin(`CR15: ${error instanceof Error?error.message:String(error)}. За потреби скасуй створені копії через Undo.`);});
