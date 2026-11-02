import assert from 'node:assert/strict';
import {EditHistory} from './dist/edit-history.js';
const history=new EditHistory(3),image='data:image/png;base64,immutable-artwork';
const state=x=>({product:'tee',surfaces:{front:{image,placement:{x,y:0,w:160,h:180,angle:0},anchor:{point:[x,0,1],normal:[0,0,1]}}}});
history.push(state(0));assert.equal(history.canUndo,false);history.push(state(10));assert.equal(history.push(state(10)),false);assert.equal(history.undo().surfaces.front.placement.x,0);const redo=history.redo();assert.equal(redo.surfaces.front.placement.x,10);assert.deepEqual(redo.surfaces.front.anchor.point,[10,0,1]);history.undo();history.push(state(20));assert.equal(history.canRedo,false);history.push(state(30));history.push(state(40));assert.equal(history.entries.length,3);assert.equal(history.undo().surfaces.front.placement.x,30);assert.equal(history.undo().surfaces.front.placement.x,20);assert.equal(history.undo(),null);assert.equal(history.entries[0].surfaces.front.image,image);
console.log('Edit history verified: placement restoration, duplicate suppression, redo invalidation, history bounds and shared artwork.');
