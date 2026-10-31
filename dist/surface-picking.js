import {Vector3} from './vendor/three.module.js';

// Ignore back-facing interiors and duplicate triangle hits at the same surface.
export function exposedSurfaceHits(hits,direction){
  let previous=-Infinity;
  return hits.filter(hit=>{const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);if(normal.dot(direction)>-.001||hit.distance-previous<.001)return false;previous=hit.distance;return true});
}
export function pickSurfaceLayer(hits,index){return hits[Math.min(Math.max(0,Math.floor(Number(index)||0)),hits.length-1)]||null}
export function artworkPivot(point,quaternion,placement,unit,offsetMm=0){return point.clone().add(new Vector3(placement.x*unit,placement.y*unit,offsetMm*unit).applyQuaternion(quaternion))}
