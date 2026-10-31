import {Object3D} from 'three';
import {TransformControls} from './vendor/addons/controls/TransformControls.js';

export function createProjectorControls({scene,camera,element,orbit,invalidate,read,onChange,onEnd}) {
  const object=new Object3D();scene.add(object);
  const controls=new TransformControls(camera,element),helper=controls.getHelper();scene.add(helper);
  controls.setSize(.85);controls.setSpace('local');
  let enabled=false,syncing=false,frame=0,pending=null;
  const commit=()=>{frame=0;if(pending){const value=pending;pending=null;onChange(value)}};
  controls.addEventListener('change',invalidate);
  controls.addEventListener('dragging-changed',e=>{orbit.enabled=!e.value;if(!e.value){clearTimeout(frame);commit();onEnd?.()}});
  controls.addEventListener('objectChange',()=>{if(syncing)return;pending={point:object.position.toArray(),quaternion:object.quaternion.toArray(),scale:object.scale.toArray()};if(!frame)frame=setTimeout(commit,33)});
  function sync(){if(!enabled||controls.dragging)return;const value=read();if(!value)return;syncing=true;object.position.fromArray(value.point);object.quaternion.fromArray(value.quaternion);object.scale.fromArray(value.scale);object.updateMatrixWorld(true);syncing=false;invalidate()}
  return {
    sync,
    enable(value){enabled=!!value;if(enabled){sync();controls.attach(object)}else{clearTimeout(frame);pending=null;frame=0;controls.detach();orbit.enabled=true}helper.visible=enabled;invalidate()},
    mode(value){if(['translate','rotate','scale'].includes(value))controls.setMode(value);invalidate()},
    space(value){controls.setSpace(value==='world'?'world':'local');invalidate()},
    snap(value,unit){controls.setTranslationSnap(value?unit:null);controls.setRotationSnap(value?Math.PI/12:null);controls.setScaleSnap(value?.1:null)},
    hide(){const visible=helper.visible;helper.visible=false;return()=>{helper.visible=visible;invalidate()}},
    get dragging(){return controls.dragging},
    get enabled(){return enabled}
  };
}
