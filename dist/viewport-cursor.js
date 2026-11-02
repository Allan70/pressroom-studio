const symbolCursor=(paths,fallback)=>{const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${paths}" stroke="white" stroke-width="4"/><path d="${paths}" stroke="#17191f" stroke-width="1.8"/></g></svg>`;return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, ${fallback}`};
const orbit=symbolCursor('M16 8a8 8 0 1 1-7 4M5 9l4 3 4-3M5 17c3 7 18 8 22 0M13 16h6m-3-3v6','grab');
const rotate=symbolCursor('M8 10a10 10 0 1 1-1 13M3 6l5 4 4-5M14 13h6v6h-6Z','crosshair');
export function createViewportCursor(element){
 let navigation='orbit',picking=false,busy=false,shift=false,navigating=false,button=0,wheelCursor='',wheelTimer=0;
 let transform={enabled:false,mode:'translate',dragging:false,handleCursor:null};
 function update(){let value;if(busy)value='progress';else if(transform.enabled&&transform.dragging)value=tool();else if(navigating)value=button===2||navigation==='pan'||shift?'grabbing':navigation==='zoom'||button===1?'zoom-in':'grabbing';else if(picking)value='crosshair';else if(transform.enabled)value=tool();else if(wheelCursor)value=wheelCursor;else value=navigation==='pan'||shift?'grab':navigation==='zoom'?'zoom-in':orbit;if(element.style.cursor!==value)element.style.cursor=value}
 function tool(){return transform.mode==='rotate'?rotate:transform.mode==='scale'?(transform.handleCursor||'nwse-resize'):'move'}
 element.addEventListener('pointerdown',e=>{button=e.button},{capture:true});
 element.addEventListener('wheel',e=>{wheelCursor=e.deltaY>0?'zoom-out':'zoom-in';clearTimeout(wheelTimer);update();wheelTimer=setTimeout(()=>{wheelCursor='';update()},180)},{passive:true});
 window.addEventListener('keydown',e=>{if(e.key==='Shift'){shift=true;update()}});window.addEventListener('keyup',e=>{if(e.key==='Shift'){shift=false;update()}});
 window.addEventListener('blur',()=>{shift=navigating=false;update()});element.addEventListener('pointercancel',()=>{navigating=false;update()});
 update();return {navigation(value){navigation=value;wheelCursor='';update()},picking(value){picking=value;update()},busy(value){busy=value;update()},transform(value){transform={...transform,...value};update()},navigating(value){navigating=value;update()}};
}
