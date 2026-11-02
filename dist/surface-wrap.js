import {Matrix4,Quaternion,ShaderMaterial,FrontSide} from './vendor/three.module.js';

// Cylindrical surface coordinates are independent of projector depth. Geometry
// stays on the original model, so folds, curvature and depth occlusion survive.
const arcCache=new Map();
export function ellipseArc(a,b){const key=a.toFixed(5)+','+b.toFixed(5);if(arcCache.has(key))return arcCache.get(key);const values=new Float32Array(129),step=Math.PI*2/128;for(let i=1;i<=128;i++){const t=(i-.5)*step;values[i]=values[i-1]+Math.hypot(a*Math.cos(t),b*Math.sin(t))*step}if(arcCache.size>=32)arcCache.delete(arcCache.keys().next().value);arcCache.set(key,values);return values}
function arcAt(angle,values){const t=((angle%(Math.PI*2)+Math.PI*2)%(Math.PI*2))*128/(Math.PI*2),i=Math.floor(t);return values[i]+(values[i+1]-values[i])*(t-i)}
export function wrapFrame(center,point,orientation,radius,placement,unit,radii=[radius,radius]){
  const rotation=new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(orientation));
  const inverse=rotation.clone().invert(),anchor=point.clone().sub(center).applyMatrix4(inverse);
  const arc=ellipseArc(...radii),anchorAngle=Math.atan2(anchor.x/radii[0],anchor.z/radii[1]);
  return {inverse,arc,radii,anchorArc:arcAt(anchorAngle,arc),anchorAngle,anchorHeight:anchor.y,radius,
    offset:[placement.x*unit,placement.y*unit],size:[placement.w*unit,placement.h*unit],angle:placement.angle*Math.PI/180};
}
export function wrapUV(position,center,frame){
  const p=position.clone().sub(center).applyMatrix4(frame.inverse);
  const circumference=frame.arc[128];let x=arcAt(Math.atan2(p.x/frame.radii[0],p.z/frame.radii[1]),frame.arc)-arcAt(frame.anchorAngle,frame.arc)-frame.offset[0];x=((x+circumference/2)%circumference+circumference)%circumference-circumference/2;
  const y=p.y-frame.anchorHeight-frame.offset[1],c=Math.cos(frame.angle),s=Math.sin(frame.angle);
  return [.5+(c*x+s*y)/frame.size[0],.5+(-s*x+c*y)/frame.size[1]];
}
export function createWrapMaterial({map,center,frame}){
  return new ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:FrontSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,
    uniforms:{artwork:{value:map},wrapCenter:{value:center},wrapInverse:{value:frame.inverse},anchorAngle:{value:frame.anchorAngle},anchorHeight:{value:frame.anchorHeight},wrapRadius:{value:frame.radius},wrapRadii:{value:frame.radii},wrapArc:{value:frame.arc},wrapAnchorArc:{value:frame.anchorArc},artOffset:{value:frame.offset},artSize:{value:frame.size},artAngle:{value:frame.angle}},
    vertexShader:`varying vec3 surfacePosition;
      void main(){vec4 world=modelMatrix*vec4(position,1.0);surfacePosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`uniform sampler2D artwork;uniform vec3 wrapCenter;uniform mat4 wrapInverse;uniform float anchorAngle;uniform float anchorHeight;uniform float wrapRadius;uniform vec2 wrapRadii;uniform float wrapArc[129];uniform float wrapAnchorArc;uniform vec2 artOffset;uniform vec2 artSize;uniform float artAngle;varying vec3 surfacePosition;
      float arcAt(float angle){float t=mod(angle+6.28318530718,6.28318530718)*128.0/6.28318530718;int i=int(floor(t));return mix(wrapArc[i],wrapArc[min(i+1,128)],fract(t));}
      void main(){vec3 p=(wrapInverse*vec4(surfacePosition-wrapCenter,1.0)).xyz;float x=arcAt(atan(p.x/wrapRadii.x,p.z/wrapRadii.y))-wrapAnchorArc-artOffset.x;float circumference=wrapArc[128];x=mod(x+circumference*0.5,circumference)-circumference*0.5;vec2 local=vec2(x,p.y-anchorHeight-artOffset.y);float c=cos(artAngle),s=sin(artAngle);vec2 uv=vec2(c*local.x+s*local.y,-s*local.x+c*local.y)/artSize+0.5;if(any(lessThan(uv,vec2(0.0)))||any(greaterThan(uv,vec2(1.0))))discard;vec4 color=texture2D(artwork,uv);if(color.a<0.001)discard;gl_FragColor=color;
      #include <colorspace_fragment>
      }`
  });
}

export function updateWrapMaterial(material,{map,center,frame}){
 const u=material.uniforms;u.artwork.value=map;u.wrapCenter.value.copy(center);u.wrapInverse.value.copy(frame.inverse);u.anchorAngle.value=frame.anchorAngle;u.anchorHeight.value=frame.anchorHeight;u.wrapRadius.value=frame.radius;u.wrapRadii.value=frame.radii;u.wrapArc.value=frame.arc;u.wrapAnchorArc.value=frame.anchorArc;u.artOffset.value=frame.offset;u.artSize.value=frame.size;u.artAngle.value=frame.angle;
}
