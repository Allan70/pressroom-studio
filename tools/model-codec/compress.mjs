import fs from 'node:fs/promises';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {NodeIO} from '@gltf-transform/core';
import {EXTMeshoptCompression,ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const dist=path.resolve('dist');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
await fs.mkdir(path.join(dist,'assets/optimized'),{recursive:true});
const ids=['tee','tee-fitted','hoodie','hoodie-alt','sweater','quarter-zip','mug','sling','leather-sling','cap','magnet'];
const report=[];
function snapshot(doc){return doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives().map(p=>({attributes:Object.fromEntries(p.listSemantics().map(s=>[s,p.getAttribute(s).getArray().slice()])),indices:p.getIndices()?.getArray().slice()})))}
function triangleKey(a,b,c){return a<=b&&a<=c?`${a},${b},${c}`:b<=a&&b<=c?`${b},${c},${a}`:`${c},${a},${b}`}
for(const id of ids){
 const source=path.join(dist,'assets',id+'.glb'),target=path.join(dist,'assets/optimized',id+'.glb');
 const document=await io.read(source),before=snapshot(document);
 // No quantization, simplification, welding or vertex reorder: retain original geometry precision.
 document.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
 await io.write(target,document);
 const t=performance.now(),decoded=await io.read(target),decodeMs=performance.now()-t,after=snapshot(decoded);
 if(before.length!==after.length)throw Error(id+': primitive count changed');
 for(let j=0;j<before.length;j++){
  for(const [semantic,a] of Object.entries(before[j].attributes)){const b=after[j].attributes[semantic];if(a.length!==b.length||a.some((v,i)=>v!==b[i]))throw Error(id+': '+semantic+' changed')}
  const a=before[j].indices,b=after[j].indices;if(a?.length!==b?.length)throw Error(id+': index count changed');
  if(a)for(let k=0;k<a.length;k+=3)if(triangleKey(...a.slice(k,k+3))!==triangleKey(...b.slice(k,k+3)))throw Error(id+': triangle changed');
 }
 const originalBytes=(await fs.stat(source)).size,encodedBytes=(await fs.stat(target)).size;
 report.push({id,originalBytes,encodedBytes,reductionPercent:+(100*(1-encodedBytes/originalBytes)).toFixed(1),decodeMs:+decodeMs.toFixed(2),exactAttributes:true,identicalTriangles:true});
}
await fs.copyFile('tools/model-codec/node_modules/meshoptimizer/meshopt_decoder.mjs',path.join(dist,'vendor/meshopt_decoder.mjs'));
await fs.copyFile('tools/model-codec/node_modules/meshoptimizer/LICENSE.md',path.join(dist,'vendor/meshoptimizer-LICENSE.md'));
const totals=report.reduce((a,r)=>({originalBytes:a.originalBytes+r.originalBytes,encodedBytes:a.encodedBytes+r.encodedBytes}),{originalBytes:0,encodedBytes:0});
const result={method:'EXT_meshopt_compression, without quantization or simplification',...totals,reductionPercent:+(100*(1-totals.encodedBytes/totals.originalBytes)).toFixed(1),models:report};
await fs.writeFile(path.join(dist,'assets/optimized/report.json'),JSON.stringify(result,null,2));

console.log(JSON.stringify(result));
