import {iconMarkup} from './vendor/icons.js?v=rotate-match-2';
// Cursor and dock use the same SVG geometry; the white halo keeps it visible on any model.
export function toolCursor(name,fallback){
 const paths=iconMarkup(name);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g transform="translate(4 4)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g color="white" stroke="white" stroke-width="3.6">${paths}</g><g color="#17191f" stroke="#17191f" stroke-width="1.6">${paths}</g></g></svg>`;
 return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, ${fallback}`;
}
const cursors={orbit:toolCursor('orbit','grab'),pan:toolCursor('pan','grab'),zoom:toolCursor('zoom','zoom-in'),zoomOut:toolCursor('zoomOut','zoom-out'),move:toolCursor('move','move'),rotate:toolCursor('rotate','crosshair'),scale:toolCursor('scale','nwse-resize'),pick:toolCursor('pick','crosshair')};
export function createViewportCursor(element){
 let navigation='orbit',picking=false,busy=false,shift=false,navigating=false,button=0,wheelCursor='',wheelTimer=0;
 let transform={enabled:false,mode:'translate',dragging:false,handleCursor:null};
 function update(){let value;if(busy)value='progress';else if(transform.enabled&&transform.dragging)value=tool();else if(navigating)value=button===2||navigation==='pan'||shift?'grabbing':navigation==='zoom'||button===1?'zoom-in':'grabbing';else if(picking)value=cursors.pick;else if(transform.enabled)value=tool();else if(wheelCursor)value=wheelCursor;else value=navigation==='pan'||shift?cursors.pan:navigation==='zoom'?cursors.zoom:cursors.orbit;if(element.style.cursor!==value)element.style.cursor=value}
 function tool(){return transform.mode==='rotate'?cursors.rotate:transform.mode==='scale'?(transform.handleCursor||cursors.scale):cursors.move}
 element.addEventListener('pointerdown',e=>{button=e.button},{capture:true});
 element.addEventListener('wheel',e=>{wheelCursor=e.deltaY>0?cursors.zoomOut:cursors.zoom;clearTimeout(wheelTimer);update();wheelTimer=setTimeout(()=>{wheelCursor='';update()},180)},{passive:true});
 window.addEventListener('keydown',e=>{if(e.key==='Shift'){shift=true;update()}});window.addEventListener('keyup',e=>{if(e.key==='Shift'){shift=false;update()}});
 window.addEventListener('blur',()=>{shift=navigating=false;update()});element.addEventListener('pointercancel',()=>{navigating=false;update()});
 update();return {navigation(value){navigation=value;wheelCursor='';update()},picking(value){picking=value;update()},busy(value){busy=value;update()},transform(value){transform={...transform,...value};update()},navigating(value){navigating=value;update()}};
}
