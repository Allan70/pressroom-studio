import fs from 'node:fs/promises';
import {PRODUCTS} from './dist/products.js';
import crypto from 'node:crypto';
const names={tee:'t-shirt-3d-model-free.zip','tee-fitted':'t-shirt-for-female.zip',hoodie:'hoodie.zip','hoodie-alt':'hoodie-black.zip',sweater:'sweater-pack.zip','quarter-zip':'ed6e5a1b-a18b-4b47-8c2d-856c077ec73b.obj',mug:'pac-man-ceramic-coffee-mug-paladone.zip',sling:'sling-bag (1).zip','leather-sling':'leather-sun-wing-sling-bag.zip',cap:'baseball-cap.zip',magnet:'fridge-magnet-kayu-motif-ketam.zip'};
const report=[];
for(const p of PRODUCTS){const bytes=await fs.readFile('dist/assets/'+p.id+'.glb');const j=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));if(j.images?.length||j.textures?.length||j.meshes.some(m=>m.primitives.some(x=>'COLOR_0'in x.attributes)))throw Error('Non-neutral asset '+p.id);for(const m of j.materials||[])if(JSON.stringify(m).includes('Texture'))throw Error('Texture material '+p.id);report.push({id:p.id,file:p.id+'.glb',sourceArchive:names[p.id],bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),textures:0,vertexColors:0})}
await fs.writeFile('dist/assets/asset-manifest.json',JSON.stringify(report,null,2));console.log('Verified '+report.length+' neutral models: zero textures, image references or vertex colours.');
