const names={scale:'Design size',visualSize:'Artwork size',visualRotation:'Artwork rotation',lightIntensity:'Light intensity',lightAzimuth:'Light direction',lightElevation:'Light height',exposure:'Exposure',cameraAzimuth:'Camera rotation',cameraElevation:'Camera elevation'};
const controls=[];
for(const range of document.querySelectorAll('input[type="range"]')){
 const name=names[range.id]||range.id,unit=/Rotation|Azimuth|Elevation/.test(range.id)?'°':/scale|Size/.test(range.id)?'%':'';
 const group=document.createElement('div');group.className='range-control';
 const label=range.closest('label')||document.querySelector('label[for="'+range.id+'"]');
 if(label){
  label.before(group);label.htmlFor=range.id;label.classList.add('range-title');
  group.append(label,range);
  for(const readout of label.querySelectorAll('output,span[id$="Value"]'))readout.hidden=true;
 }else{range.before(group);group.append(range)}
 const field=document.createElement('div');field.className='range-number';
 const number=document.createElement('input');number.type='number';number.id=range.id+'Number';number.min=range.min;number.max=range.max;number.step=range.step||'1';number.value=range.value;number.setAttribute('aria-label',name+(unit?' in '+(unit==='°'?'degrees':'percent'):''));
 const suffix=document.createElement('span');suffix.textContent=unit;suffix.setAttribute('aria-hidden','true');
 field.append(number,suffix);
 const reset=document.createElement('button');reset.type='button';reset.className='range-reset';reset.textContent='↺';reset.setAttribute('aria-label','Reset '+name.toLowerCase()+' to default');reset.title='Reset '+name.toLowerCase()+' to default';
 group.append(reset,field);
 function sync(){if(document.activeElement!==number)number.value=range.value;number.disabled=range.disabled;reset.disabled=range.disabled}
 function apply(){if(number.value===''||!number.validity.valid){number.value=range.value;return}range.dispatchEvent(new Event('pointerdown'));range.value=number.value;range.dispatchEvent(new Event('input',{bubbles:true}));range.dispatchEvent(new Event('pointerup'));range.dispatchEvent(new Event('change',{bubbles:true}));number.value=range.value;sync()}
 number.addEventListener('change',apply);
 number.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();number.blur()}else if(event.key==='Escape'){number.value=range.value;number.blur()}});
 reset.addEventListener('click',event=>{event.preventDefault();if(range.id==='scale'||range.id==='visualSize'){document.dispatchEvent(new Event('reset-artwork-size'));return}number.value=range.defaultValue;apply()});
 range.addEventListener('input',()=>requestAnimationFrame(sync));range.addEventListener('pointerup',()=>requestAnimationFrame(sync));
 controls.push(sync);
}
// Existing readouts also update after undo, surface changes, and 3D camera gestures.
const sync=()=>controls.forEach(update=>update());
const observer=new MutationObserver(sync);
for(const node of document.querySelectorAll('[id$="Value"],#cameraReadout'))observer.observe(node,{childList:true,subtree:true,characterData:true});
document.addEventListener('studio-ready',sync);
document.addEventListener('reset-artwork-size',()=>requestAnimationFrame(sync));
