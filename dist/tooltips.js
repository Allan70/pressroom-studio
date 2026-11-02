// A single, delegated tooltip avoids per-frame work and keeps tool help accessible.
export function installTooltips(root=document){
 const bubble=document.createElement('div');bubble.id='editor-tool-help';bubble.className='editor-tooltip';bubble.role='tooltip';bubble.hidden=true;document.body.append(bubble);
 let current=null,openTimer=0,closeTimer=0,touch=false;
 function hide(){clearTimeout(openTimer);clearTimeout(closeTimer);if(current){const ids=(current.getAttribute('aria-describedby')||'').split(' ').filter(id=>id&&id!==bubble.id);if(ids.length)current.setAttribute('aria-describedby',ids.join(' '));else current.removeAttribute('aria-describedby')}current=null;bubble.hidden=true}
 function show(target){if(!target.isConnected||!target.checkVisibility())return;current=target;bubble.replaceChildren();const title=document.createElement('strong');title.textContent=target.dataset.tooltip;const body=document.createElement('span');body.textContent=target.dataset.tooltipBody||'';bubble.append(title,body);if(target.dataset.tooltipKeys){const keys=document.createElement('kbd');keys.textContent=target.dataset.tooltipKeys;bubble.append(keys)}bubble.hidden=false;const rect=target.getBoundingClientRect(),bounds=bubble.getBoundingClientRect(),padding=10;let left=rect.right+10,top=rect.top;if(!target.closest('.viewport-tools')){left=rect.left;top=rect.bottom+8}if(left+bounds.width>innerWidth-padding)left=rect.left-bounds.width-10;if(top+bounds.height>innerHeight-padding)top=rect.top-bounds.height-8;bubble.style.left=Math.max(padding,Math.min(left,innerWidth-bounds.width-padding))+'px';bubble.style.top=Math.max(padding,Math.min(top,innerHeight-bounds.height-padding))+'px';target.setAttribute('aria-describedby',[target.getAttribute('aria-describedby'),bubble.id].filter(Boolean).join(' '))}
 function schedule(target,delay){clearTimeout(closeTimer);if(current===target&&!bubble.hidden)return;hide();current=target;openTimer=setTimeout(()=>show(target),delay)}
 root.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const target=e.target.closest('[data-tooltip]');if(target&&!target.contains(e.relatedTarget))schedule(target,350)});
 root.addEventListener('pointerout',e=>{const target=e.target.closest('[data-tooltip]');if(target&&!target.contains(e.relatedTarget)&&e.relatedTarget!==bubble)closeTimer=setTimeout(hide,150)});
 root.addEventListener('focusin',e=>{if(!touch){const target=e.target.closest('[data-tooltip]');if(target)schedule(target,0)}});
 root.addEventListener('focusout',hide);
 root.addEventListener('pointerdown',e=>{touch=e.pointerType==='touch';hide()},true);
 root.addEventListener('keydown',e=>{if(e.key==='Escape')hide();if(e.key==='Tab')touch=false});
 root.addEventListener('scroll',hide,true);root.addEventListener('wheel',hide,{passive:true});window.addEventListener('resize',hide);window.addEventListener('blur',hide);
 bubble.addEventListener('pointerenter',()=>clearTimeout(closeTimer));bubble.addEventListener('pointerleave',hide);
 return (element,title,description,keys='')=>{if(!element)return;element.dataset.tooltip=title;element.dataset.tooltipBody=description;if(keys)element.dataset.tooltipKeys=keys;element.removeAttribute('title')};
}
