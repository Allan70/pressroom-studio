import {Matrix4,Quaternion,ShaderMaterial,FrontSide} from './vendor/three.module.js';

// Cylindrical surface coordinates are independent of projector depth. Geometry
// stays on the original model, so folds, curvature and depth occlusion survive.
export function wrapFrame(center,point,orientation,radius,placement,unit){
  const rotation=new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(orientation));
  const inverse=rotation.clone().invert(),anchor=point.clone().sub(center).applyMatrix4(inverse);
  return {inverse,anchorAngle:Math.atan2(anchor.x,anchor.z),anchorHeight:anchor.y,radius,
    offset:[placement.x*unit,placement.y*unit],size:[placement.w*unit,placement.h*unit],angle:placement.angle*Math.PI/180};
}
export function wrapUV(position,center,frame){
  const p=position.clone().sub(center).applyMatrix4(frame.inverse);
  const angle=Math.atan2(p.x,p.z)-frame.anchorAngle-frame.offset[0]/frame.radius;
  const difference=Math.atan2(Math.sin(angle),Math.cos(angle));
  const x=difference*frame.radius,y=p.y-frame.anchorHeight-frame.offset[1],c=Math.cos(frame.angle),s=Math.sin(frame.angle);
  return [.5+(c*x+s*y)/frame.size[0],.5+(-s*x+c*y)/frame.size[1]];
}
export function createWrapMaterial({map,center,frame}){
  return new ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:FrontSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,
    uniforms:{artwork:{value:map},wrapCenter:{value:center},wrapInverse:{value:frame.inverse},anchorAngle:{value:frame.anchorAngle},anchorHeight:{value:frame.anchorHeight},wrapRadius:{value:frame.radius},artOffset:{value:frame.offset},artSize:{value:frame.size},artAngle:{value:frame.angle}},
    vertexShader:`varying vec3 surfacePosition;
      void main(){vec4 world=modelMatrix*vec4(position,1.0);surfacePosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`uniform sampler2D artwork;uniform vec3 wrapCenter;uniform mat4 wrapInverse;uniform float anchorAngle;uniform float anchorHeight;uniform float wrapRadius;uniform vec2 artOffset;uniform vec2 artSize;uniform float artAngle;varying vec3 surfacePosition;
      void main(){vec3 p=(wrapInverse*vec4(surfacePosition-wrapCenter,1.0)).xyz;float delta=atan(p.x,p.z)-anchorAngle-artOffset.x/wrapRadius;delta=atan(sin(delta),cos(delta));vec2 local=vec2(delta*wrapRadius,p.y-anchorHeight-artOffset.y);float c=cos(artAngle),s=sin(artAngle);vec2 uv=vec2(c*local.x+s*local.y,-s*local.x+c*local.y)/artSize+0.5;if(any(lessThan(uv,vec2(0.0)))||any(greaterThan(uv,vec2(1.0))))discard;vec4 color=texture2D(artwork,uv);if(color.a<0.001)discard;gl_FragColor=color;
      #include <colorspace_fragment>
      }`
  });
}
