import {Object3D,Vector3} from 'three';
import {TransformControls} from './vendor/addons/controls/TransformControls.js';

export function createProjectorControls({scene,camera,element,orbit,invalidate,read,onChange,onEnd,onCursor=()=>{}}) {
  const object=new Object3D();scene.add(object);
  const controls=new TransformControls(camera,element),helper=controls.getHelper();scene.add(helper);
  controls.setSize(.85);controls.setSpace('local');
  let enabled=false,syncing=false,frame=0,pending=null;
  function notifyCursor(){let handleCursor=null;const axis=controls.axis;if(controls.mode==='scale'&&axis?.length===1){const origin=object.getWorldPosition(new Vector3()),direction=new Vector3(axis==='X'?1:0,axis==='Y'?1:0,axis==='Z'?1:0);direction.applyQuaternion(object.getWorldQuaternion(object.quaternion.clone()));const end=origin.clone().add(direction).project(camera),start=origin.project(camera),angle=Math.atan2(-(end.y-start.y),end.x-start.x);handleCursor=['ew-resize','nwse-resize','ns-resize','nesw-resize'][(Math.round(angle/(Math.PI/4))%4+4)%4]}onCursor({enabled,mode:controls.mode,dragging:controls.dragging,handleCursor})}
  controls.addEventListener('axis-changed',notifyCursor);controls.addEventListener('mode-changed',notifyCursor);
  const commit=()=>{frame=0;if(pending){const value=pending;pending=null;onChange(value)}};
  controls.addEventListener('change',invalidate);
  controls.addEventListener('dragging-changed',e=>{notifyCursor();orbit.enabled=!e.value;if(!e.value){cancelAnimationFrame(frame);commit();onEnd?.()}});
  controls.addEventListener('objectChange',()=>{if(syncing)return;pending={point:object.position.toArray(),quaternion:object.quaternion.toArray(),scale:object.scale.toArray()};if(!frame)frame=requestAnimationFrame(commit)});
  function sync(){if(!enabled||controls.dragging)return;const value=read();if(!value)return;syncing=true;object.position.fromArray(value.point);object.quaternion.fromArray(value.quaternion);object.scale.fromArray(value.scale);object.updateMatrixWorld(true);syncing=false;invalidate()}
  return {
    sync,
    flush(){if(pending){cancelAnimationFrame(frame);commit()}},
    enable(value){enabled=!!value;if(enabled){sync();controls.attach(object)}else{cancelAnimationFrame(frame);pending=null;frame=0;controls.detach();orbit.enabled=true}helper.visible=enabled;notifyCursor();invalidate()},
    mode(value){if(['translate','rotate','scale'].includes(value))controls.setMode(value);invalidate()},
    space(value){controls.setSpace(value==='world'?'world':'local');invalidate()},
    snap(value,unit){controls.setTranslationSnap(value?unit:null);controls.setRotationSnap(value?Math.PI/12:null);controls.setScaleSnap(value?.1:null)},
    hide(){const visible=helper.visible;helper.visible=false;return()=>{helper.visible=visible;invalidate()}},
    get dragging(){return controls.dragging},
    get enabled(){return enabled}
  };
}
