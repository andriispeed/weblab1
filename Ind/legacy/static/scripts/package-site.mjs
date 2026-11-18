import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'dist');await mkdir(resolve(output,'assets'),{recursive:true});
const files=['index.html','courses.html','course-details.html','contact.html','site.css','app.js','assets/InterVariable.woff2','assets/Inter-LICENSE.txt','assets/favicon.svg'];
for(const file of files)await writeFile(resolve(output,file),await readFile(resolve(root,file)));
await writeFile(resolve(output,'.nojekyll'),'');
console.log('Prepared Ind/dist with the four pages, CSS, JS and local assets.');
