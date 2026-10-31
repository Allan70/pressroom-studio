import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
import {exposedSurfaceHits,pickSurfaceLayer,artworkPivot} from './dist/surface-picking.js';
const outer=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({side:T.DoubleSide}));outer.position.z=.2;outer.updateMatrixWorld();
const inner=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({side:T.DoubleSide}));inner.updateMatrixWorld();
const reverse=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({side:T.DoubleSide}));reverse.rotation.y=Math.PI;reverse.position.z=-.2;reverse.updateMatrixWorld();
const ray=new T.Raycaster(new T.Vector3(.1,.2,2),new T.Vector3(0,0,-1));
const hits=exposedSurfaceHits(ray.intersectObjects([outer,inner,reverse]),ray.ray.direction);
assert.equal(hits.length,2);assert.equal(pickSurfaceLayer(hits,0).object,outer);assert.equal(pickSurfaceLayer(hits,1).object,inner);assert.equal(pickSurfaceLayer(hits,99).object,inner);assert.equal(pickSurfaceLayer([],0),null);
const point=new T.Vector3(1,2,3),q=new T.Quaternion().setFromEuler(new T.Euler(.4,.2,-.3)),placement={x:20,y:-30};const pivot=artworkPivot(point,q,placement,.005,2);
const restored=pivot.clone().sub(new T.Vector3(.1,-.15,.01).applyQuaternion(q));assert.ok(restored.distanceTo(point)<1e-12);
for(const m of [outer,inner,reverse]){m.geometry.dispose();m.material.dispose()}
console.log('Verified overlap ordering, back-face rejection, layer clamping and rotated artwork pivot coordinates.');
