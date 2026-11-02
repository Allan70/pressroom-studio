import assert from 'node:assert/strict';
import {Vector3,Euler} from './dist/vendor/three.module.js';
import {wrapFrame,wrapUV,createWrapMaterial,updateWrapMaterial} from './dist/surface-wrap.js';
const center=new Vector3(),point=new Vector3(0,0,1),orientation=new Euler(),placement={x:0,y:0,w:Math.PI*2,h:2,angle:0};
const frame=wrapFrame(center,point,orientation,1,placement,1),uv=p=>wrapUV(p,center,frame);
assert.deepEqual(uv(new Vector3(0,0,1)),[.5,.5]);assert.ok(Math.abs(uv(new Vector3(1,0,0))[0]-.75)<1e-5);assert.equal(uv(new Vector3(0,.5,1))[1],.75);
const distant=wrapFrame(center,new Vector3(0,0,500),orientation,1,placement,1);assert.deepEqual(wrapUV(point,center,distant),[.5,.5]);
const translated=wrapFrame(center,point,orientation,1,{...placement,x:Math.PI*2},1);assert.ok(Math.abs(wrapUV(point,center,translated)[0]-.5)<1e-5);
const rotated=wrapFrame(center,point,orientation,1,{...placement,angle:90},1);assert.ok(Math.abs(wrapUV(new Vector3(0,.5,1),center,rotated)[0]-(.5+.5/(Math.PI*2)))<1e-5);
console.log('Surface wrapping verified: front-to-side continuity, height, rotation, repeat-around movement and no depth-box clipping.');

const flat=wrapFrame(center,new Vector3(0,0,.15),orientation,1,placement,1,[2,.15]);
const left=wrapUV(new Vector3(-.25,0,.15),center,flat),right=wrapUV(new Vector3(.25,0,.15),center,flat);
const mappedWidth=(right[0]-left[0])*placement.w;
assert.ok(Math.abs(mappedWidth-.5)/.5<.02,'A flat shirt patch must retain its width within 2%.');
const vertical=wrapUV(new Vector3(0,.5,.15),center,flat);
assert.ok(Math.abs((vertical[1]-.5)*placement.h-.5)<1e-6);
console.log('Flat garment proportions verified: horizontal and vertical physical scale agree within 2%.');

const material=createWrapMaterial({map:null,center:center.clone(),frame:flat}),materialID=material.id;
const moved=wrapFrame(center,new Vector3(0,0,.15),orientation,1,{...placement,x:.1},1,[2,.15]);
assert.equal(flat.arc,moved.arc,'Translation must reuse the arc-length lookup.');
updateWrapMaterial(material,{map:null,center,frame:moved});
assert.equal(material.id,materialID);assert.equal(material.uniforms.artOffset.value[0],.1);material.dispose();
console.log('Wrap material reuse verified: movement updates uniforms and reuses the surface profile.');
