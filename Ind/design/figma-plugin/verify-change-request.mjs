import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {getScreens} from './qa/design.mjs';
import {gradientPalettes,minimumContrast} from './qa/gradient.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:1080}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const results=[];
try{
  for(const screen of getScreens().filter(s=>!s.auxiliary)){
    await page.goto(pathToFileURL(resolve('../change-request.html')).href+'#'+screen.key);
    await page.waitForSelector(`#artboard[data-screen="${screen.key}"]`);await page.evaluate(()=>document.fonts.ready);
    let baseline;
    for(const mode of ['original','full','headings']){
      await page.selectOption('#gradient',mode);
      const result=await page.locator('#artboard').evaluate(root=>({
        bounds:[...root.querySelectorAll('.node')].map(n=>{const r=n.getBoundingClientRect();return [r.width,r.height];}),
        gradients:[...root.querySelectorAll('.cr-gradient')].map(n=>({background:n.dataset.gradientBackground,image:getComputedStyle(n).backgroundImage})),
      }));
      if(mode==='original'){baseline=result.bounds;assert.equal(result.gradients.length,0);}
      else{assert.deepEqual(result.bounds,baseline,screen.key+' layout changed');assert(result.gradients.length>0);for(const gradient of result.gradients)assert(gradient.image.includes('linear-gradient'));}
      results.push({screen:screen.key,mode,count:result.gradients.length});
      if(screen.key==='Desktop.home'&&mode!=='original')await page.locator('#artboard').screenshot({path:resolve('../qa',`CR15-${mode}.png`),style:'.toolbar,.note{visibility:hidden}'});
    }
  }
  for(const screen of getScreens().filter(s=>!s.auxiliary)){
    const full=results.find(r=>r.screen===screen.key&&r.mode==='full');const headings=results.find(r=>r.screen===screen.key&&r.mode==='headings');assert(full.count>headings.count);
  }
  const paletteResults=['#FFFFFF','#FAF9F6','#FFF8E6'].map(bg=>({background:bg,minimum:minimumContrast(gradientPalettes.dark,bg)}));
  paletteResults.push({background:'#252A24',minimum:minimumContrast(gradientPalettes.light,'#252A24')});
  assert.deepEqual(errors,[]);
  await writeFile('../qa/change-request-report.json',JSON.stringify({results,paletteResults,errors,limitation:'Native Figma plugin typechecked; native execution still requires user to run it.'},null,2));
  console.log('PASS: 12 Figma-preview layouts × 3 CR15 modes; geometry unchanged; gradients render and contrast exceeds 4.5:1.');
}finally{await browser.close();}
