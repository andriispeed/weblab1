import { colors, components, devices, getKitIntro, getScreens, Item, Device } from './design';
const screens=getScreens();
const componentMap=new Map(components.map(c=>[c.key,c]));
const history:string[]=[];
let current='Desktop.home';
const artboard=document.getElementById('artboard')!;
const deviceSelect=document.getElementById('device') as HTMLSelectElement;
const screenSelect=document.getElementById('screen') as HTMLSelectElement;
function mergeOverrides(spec:Item, overrides:Record<string,string>):Item {
  return {...spec,text:overrides[spec.name] ?? spec.text,children:spec.children?.map(c=>mergeOverrides(c,overrides))};
}
function render(original:Item):HTMLElement {
  let item=original;
  if (item.kind === 'instance') {
    const c=componentMap.get(item.ref!);
    if (!c) throw new Error(`Unknown component ${item.ref}`);
    item={...mergeOverrides(c.spec,item.overrides || {}),w:item.w,target:item.target,action:item.action,name:item.name};
  }
  const el=document.createElement('div');
  el.className=`node ${item.kind === 'text' ? 'text' : 'box'}`;
  el.dataset.name=item.name;
  if (typeof item.w === 'number') el.style.width=`${item.w}px`;
  else {el.style.flex='1 1 0';el.style.alignSelf='stretch';}
  if (item.h) el.style.height=`${item.h}px`;
  if (item.kind === 'text') {
    el.textContent=item.text || '';
    el.style.fontSize=`${item.size || 16}px`;
    el.style.lineHeight=String(item.line || 1.5);
    el.style.fontWeight=String({'Regular':400,'Medium':500,'Semi Bold':600,'Bold':700}[item.weight || 'Regular']);
    el.style.color=colors[item.color || 'ink'];
    el.style.letterSpacing=`${item.tracking || 0}px`;
    el.style.textAlign=item.textAlign || 'left';
  } else {
    el.style.flexDirection=item.direction === 'row' ? 'row' : 'column';
    el.style.alignItems=item.align === 'center' ? 'center' : 'flex-start';
    el.style.gap=`${item.gap ?? 16}px`;
    if (item.between) el.style.justifyContent='space-between';
    el.style.padding=Array.isArray(item.pad) ? item.pad.map(n=>`${n}px`).join(' ') : `${item.pad || 0}px`;
    for (const child of item.children || []) {
      const node=render(child);
      if (item.direction !== 'row' && (child.w === 'fill' || child.w === undefined)) { node.style.flex='0 0 auto';node.style.width='100%'; }
      el.appendChild(node);
    }
  }
  if (item.bg) el.style.background=colors[item.bg];
  if (item.stroke) {el.style.outline=`1px solid ${colors[item.stroke]}`;el.style.outlineOffset='-1px';}
  if (item.radius) el.style.borderRadius=`${item.radius}px`;
  if (item.focus) el.style.boxShadow=`0 0 0 2px white,0 0 0 4px ${colors.primary}`;
  if (item.opacity !== undefined) el.style.opacity=String(item.opacity);
  if (item.target || item.action) {
    el.classList.add('interactive');el.tabIndex=0;el.setAttribute('role','link');
    el.dataset.target=item.target || 'back';
    const activate=()=>item.action === 'back' ? goBack() : show(item.target!);
    el.addEventListener('click',e=>{e.stopPropagation();activate();});
    el.addEventListener('keydown',e=>{if(e.key === 'Enter' || e.key === ' '){e.preventDefault();activate();}});
  }
  return el;
}
function updateOptions(d:Device) {
  deviceSelect.value=d;
  screenSelect.innerHTML='';
  for (const s of screens.filter(s=>s.device === d)) {
    const option=document.createElement('option');option.value=s.key;option.textContent=s.name;screenSelect.append(option);
  }
}
function show(key:string,push=true) {
  const s=screens.find(s=>s.key === key);
  if (!s) throw new Error(`Unknown route ${key}`);
  if(push && key!==current) history.push(current);
  current=key;updateOptions(s.device);screenSelect.value=key;
  artboard.replaceChildren(render(s.spec));artboard.style.width=`${devices[s.device].width}px`;
  artboard.dataset.screen=key;
  window.scrollTo(0,0);document.getElementById('canvas')!.scrollLeft=0;
  location.hash=key;
}
function goBack(){show(history.pop() || `${deviceSelect.value}.home`,false);}
function showKit(){
  history.push(current);artboard.replaceChildren();artboard.style.width='1440px';artboard.dataset.screen='kit';
  const kit=document.createElement('div');kit.className='kit';kit.append(render(getKitIntro()));
  for(const group of [...new Set(components.map(c=>c.group))]){
    const section=document.createElement('section');section.className='kit-group';
    const title=document.createElement('h2');title.textContent=group;section.append(title);
    const samples=document.createElement('div');samples.className='kit-samples';
    for(const c of components.filter(c=>c.group === group)){
      const example=document.createElement('div');example.className='kit-example';const caption=document.createElement('small');caption.textContent=c.variant || c.key;
      example.append(caption,render(c.spec));samples.append(example);
    }
    section.append(samples);kit.append(section);
  }
  artboard.append(kit);window.scrollTo(0,0);
}
deviceSelect.addEventListener('change',()=>show(`${deviceSelect.value}.${current.split('.').slice(1).join('.') === 'menu' && deviceSelect.value!=='Mobile' ? 'home' : current.split('.').slice(1).join('.')}`));
screenSelect.addEventListener('change',()=>show(screenSelect.value));
document.getElementById('kit')!.addEventListener('click',showKit);
document.getElementById('back')!.addEventListener('click',goBack);
window.addEventListener('hashchange',()=>{
  const key=decodeURIComponent(location.hash.slice(1));
  if(key!==current && screens.some(s=>s.key === key)) show(key,false);
});
const initial=decodeURIComponent(location.hash.slice(1));
show(screens.some(s=>s.key === initial) ? initial : current,false);
