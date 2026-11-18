import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '../../../design/figma-plugin/node_modules/playwright/index.mjs';
import {gradientPalettes,minimumContrast} from '../figma-plugin/qa/gradient.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const qa=resolve(root,'qa');await mkdir(qa,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+sep))throw Error('outside root');const data=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2'})[extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({acceptDownloads:true});
const page=await context.newPage();const errors=[];const networkErrors=[];const geometry=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)networkErrors.push(r.url());});
const urls=['index.html','courses.html','course-details.html?course=python','course-details.html?course=frontend','course-details.html?course=qa','contact.html'];
try{
  for(const width of [320,390,640,768,1000,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const url of urls){
      await page.goto(base+'/'+url);await page.evaluate(()=>document.fonts.ready);
      const result=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,overflow:[...document.querySelectorAll('main *')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).map(n=>n.className||n.tagName)}));
      assert.equal(result.h1,1,url);assert(result.scroll<=width,`${url} @ ${width}: horizontal page scroll ${result.scroll}`);assert.deepEqual(result.overflow,[],`${url} @ ${width}: content overflow`);geometry.push({url,...result});
      if([390,768,1440].includes(width)&&!url.includes('frontend')&&!url.includes('qa'))await page.screenshot({path:resolve(qa,`${width}-${url.split('.')[0]}.png`),fullPage:true});
      const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>h&&!h.startsWith('#')&&!/^https?:|mailto:/.test(h)));
      for(const href of new Set(links)){const response=await page.request.get(new URL(href,page.url()).href);assert.equal(response.status(),200,`Broken link ${href}`);}
      const gradient=await page.locator('h1').evaluate(n=>getComputedStyle(n).backgroundImage);assert(gradient.includes('linear-gradient'),url+' heading must be gradient');
      assert.equal(await page.locator('main p').first().evaluate(n=>getComputedStyle(n).backgroundImage),'none');
    }
  }
  // Real filtering, combined search, empty state and price ordering.
  await page.goto(base+'/courses.html');await page.locator('[data-filter=dev]').click();assert.equal(await page.locator('.course-card:visible').count(),2);
  await page.locator('#course-search').fill('python');assert.equal(await page.locator('.course-card:visible').count(),1);
  await page.locator('#course-search').fill('немає такого курсу');assert(await page.locator('#empty-state').isVisible());
  await page.locator('#reset-filters').click();assert.equal(await page.locator('.course-card:visible').count(),3);
  await page.selectOption('#course-sort','price-asc');assert.equal(await page.locator('.course-card').first().getAttribute('data-course'),'qa');
  // Every course carries the correct identity to the contact form.
  for(const id of ['frontend','python','qa']){await page.goto(base+`/course-details.html?course=${id}`);await page.locator('[data-enroll]').first().click();assert.equal(await page.inputValue('#student-course'),id);}
  await page.goto(base+'/course-details.html?course=__proto__');assert.equal(await page.locator('#course-name').textContent(),'Python Development');
  await page.locator('summary').first().click();assert(await page.locator('details').first().getAttribute('open')!==null);
  // Form validation, local persistence, download, reload and erasure.
  await page.goto(base+'/contact.html?course=python');await page.locator('#submit-application').click();assert(await page.locator('#form-error-summary').isVisible());assert.equal(await page.locator('[aria-invalid=true]').count(),3);
  await page.fill('#student-name','Тестова Команда');await page.fill('#student-email','team@example.com');await page.fill('#student-message','Перевірка навчальної форми.');await page.check('#student-consent');await page.locator('#submit-application').click();assert(await page.locator('#application-receipt').isVisible());assert.equal(await page.locator('#receipt-course').textContent(),'Python Development');
  const downloadPromise=page.waitForEvent('download');await page.locator('#download-application').click();const download=await downloadPromise;assert(download.suggestedFilename().endsWith('.txt'));
  await page.reload();await page.locator('#show-saved').click();assert.equal(await page.locator('#receipt-name').textContent(),'Тестова Команда');await page.locator('#delete-application').click();assert.equal(await page.evaluate(()=>localStorage.getItem('it-school.application.v1')),null);
  // Keyboard menu and Escape return focus; navigation survives without JS.
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/index.html');await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');assert(await page.locator('#main-navigation').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#main-navigation').isVisible()));assert(await page.locator('.menu-toggle').evaluate(n=>n===document.activeElement));
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const plain=await noJS.newPage();await plain.goto(base+'/index.html');assert(await plain.locator('#main-navigation').isVisible());await plain.goto(base+'/courses.html');assert.equal(await plain.locator('.course-card:visible').count(),3);await noJS.close();
  // High-contrast mode and printing keep headings readable.
  await page.emulateMedia({forcedColors:'active'});await page.goto(base+'/index.html');assert.equal(await page.locator('h1').evaluate(n=>getComputedStyle(n).backgroundImage),'none');assert.notEqual(await page.locator('h1').evaluate(n=>getComputedStyle(n).webkitTextFillColor),'rgba(0, 0, 0, 0)');await page.emulateMedia({forcedColors:'none',media:'print'});assert.equal(await page.locator('h1').evaluate(n=>getComputedStyle(n).backgroundImage),'none');await page.emulateMedia({media:'screen'});
  const denied=await browser.newContext();await denied.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});const blocked=await denied.newPage();await blocked.goto(base+'/contact.html');await blocked.fill('#student-name','Тест');await blocked.fill('#student-email','test@example.com');await blocked.check('#student-consent');await blocked.click('#submit-application');assert.equal(await blocked.locator('#receipt-title').textContent(),'Заявку підготовлено.');assert((await blocked.locator('#receipt-status').textContent()).includes('не дозволив'));await denied.close();
  const contrast=['#FFFFFF','#FAF9F6','#FFF8E6'].map(bg=>({background:bg,minimum:minimumContrast(gradientPalettes.dark,bg)}));contrast.push({background:'#252A24',minimum:minimumContrast(gradientPalettes.light,'#252A24')});contrast.forEach(r=>assert(r.minimum>=4.5));
  assert.deepEqual(errors,[]);assert.deepEqual(networkErrors,[]);
  await writeFile(resolve(qa,'site-report.json'),JSON.stringify({testedAt:'2026-11-18',browser:'Microsoft Edge, Playwright',geometry,contrast,checks:['navigation','filters/search/sort','course identity','form validation','localStorage persistence','download','erasure','blocked storage','mobile keyboard menu','no JavaScript','forced colors','print'],errors,networkErrors},null,2));
  console.log(`PASS: ${geometry.length} page/viewport checks (320–1440 px), all internal links, course journeys, storage and keyboard behavior. Gradient minimum ${Math.min(...contrast.map(r=>r.minimum)).toFixed(2)}:1.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
