import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { components, getScreens, devices } from './qa/design.mjs';

const screens=getScreens();
const routes=new Set(screens.map(s=>s.key));
const refs=new Set(components.map(c=>c.key));
assert.equal(screens.filter(s=>!s.auxiliary).length,12);
assert.equal(routes.size,screens.length);
let links=0;
function inspect(item,source){
  if(item.target){assert(routes.has(item.target),`${source}: unknown target ${item.target}`);links++;}
  if(item.ref) assert(refs.has(item.ref),`Unknown component ${item.ref}`);
  for(const child of item.children || []) inspect(child,source);
}
screens.forEach(s=>inspect(s.spec,s.key));
components.forEach(c=>inspect(c.spec,c.key));
await mkdir('qa',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:1080},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const report=[];
try{
  for(const screen of screens){
    await page.goto(pathToFileURL(resolve('preview.html')).href+'#'+screen.key);
    await page.waitForSelector(`#artboard[data-screen="${screen.key}"]`);
    await page.evaluate(()=>document.fonts.ready);
    const geometry=await page.locator('#artboard').evaluate(el=>{
      const bounds=el.getBoundingClientRect();
      const overflow=[];
      for(const child of el.querySelectorAll('.node')){
        const rect=child.getBoundingClientRect();
        if(rect.right>bounds.right+1 || rect.left<bounds.left-1) overflow.push({name:child.dataset.name,x:rect.x,width:rect.width,reason:'outside artboard'});
        // Natural text line boxes may have a few pixels of font-metric overhang;
        // only fixed-height clipping and horizontal overflow are errors here.
        if(child.classList.contains('text') && (child.scrollWidth>child.clientWidth+1 || (child.style.height && child.scrollHeight>child.clientHeight+1))) overflow.push({name:child.dataset.name,width:rect.width,reason:'text overflow'});
      }
      return {width:bounds.width,height:bounds.height,overflow};
    });
    assert.equal(geometry.width,devices[screen.device].width);
    report.push({screen:screen.key,...geometry});
    if(!screen.auxiliary) await page.locator('#artboard').screenshot({path:`qa/${screen.key}.png`,style:'.toolbar,.note{visibility:hidden}'});
  }
  for(const d of Object.keys(devices)){
    await page.goto(pathToFileURL(resolve('preview.html')).href+`#${d}.home`);
    await page.locator(`[data-target="${d}.catalog"]`).first().click();
    await page.locator(`[data-target="${d}.catalog-dev"]`).click();
    assert.equal(await page.locator('#artboard').getAttribute('data-screen'),`${d}.catalog-dev`);
    await page.locator(`[data-target="${d}.course"]`).first().click();
    await page.locator(`[data-target="${d}.contact-python"]`).first().click();
    await page.locator(`[data-target="${d}.contact-error-python"]`).click();
    assert.equal(await page.locator('#artboard').getAttribute('data-screen'),`${d}.contact-error-python`);
    await page.locator(`[data-target="${d}.contact-filled-python"]`).first().click();
    assert(await page.getByText('Python Development',{exact:true}).count()>0);
    await page.locator(`[data-target="${d}.success"]`).click();
    assert.equal(await page.locator('#artboard').getAttribute('data-screen'),`${d}.success`);
  }
  await page.goto(pathToFileURL(resolve('preview.html')).href+'#Mobile.home');
  await page.locator('[data-target="Mobile.menu"]').click();
  await page.locator('[data-target="back"]').click();
  assert.equal(await page.locator('#artboard').getAttribute('data-screen'),'Mobile.home');
  await page.locator('#kit').click();
  await page.locator('#artboard').screenshot({path:'qa/UI-kit.png',style:'.toolbar,.note{visibility:hidden}'});
  const overflows=report.filter(r=>r.overflow.length);
  await writeFile('qa/report.json',JSON.stringify({screens:screens.length,components:components.length,links,errors,report},null,2));
  assert.deepEqual(errors,[]);
  assert.deepEqual(overflows,[],`Layout overflow: ${JSON.stringify(overflows)}`);
  console.log(`Verified ${screens.length} screens, ${components.length} components, ${links} navigation targets. All 12 primary frames fit; desktop/tablet/mobile journeys and mobile menu pass.`);
}finally{await browser.close();}
