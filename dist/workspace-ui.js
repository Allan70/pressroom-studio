import { icon } from './vendor/icons.js';
const $ = id => document.getElementById(id);
const studio = $('studio');
const library = document.createElement('section');
library.className = 'asset-library';
library.setAttribute('aria-label', 'Product library');
library.innerHTML = `<div class="library-heading"><span>ASSETS</span><span>11 blanks</span></div><h2>Product library</h2><label class="asset-search"><span>⌕</span><input id="assetSearch" type="search" placeholder="Find a product…" aria-label="Search products"></label><div id="libraryGrid"></div><p id="searchEmpty" hidden>No matching products.</p>`;
studio.prepend(library);
$('libraryGrid').append($('products'));
document.querySelector('[data-panel="design"] .field-head').remove();
const inspector = studio.querySelector('aside');
inspector.setAttribute('aria-label', 'Design properties');
const syncLoading=()=>{const busy=$('scene').getAttribute('aria-busy')==='true';for(const panel of inspector.querySelectorAll('.workflow-panel'))panel.inert=busy;inspector.classList.toggle('model-pending',busy)};
new MutationObserver(syncLoading).observe($('scene'),{attributes:true,attributeFilter:['aria-busy']});syncLoading();
inspector.querySelector('.step-label').innerHTML = 'PROPERTIES <span>LIVE PREVIEW</span>';
inspector.querySelector('h2').textContent = 'Object properties';
inspector.querySelector('.muted').textContent = 'Artwork, placement and output.';
const labels = {design:'Design',place:'Layout',scene:'Scene',share:'Export'};
for (const button of document.querySelectorAll('[data-step]')) {
  button.lastChild.textContent = labels[button.dataset.step];
  button.title = `${labels[button.dataset.step]} · ${['design','place','share'].indexOf(button.dataset.step)+1}`;
}
const topbar = document.createElement('div');
topbar.className = 'document-bar';
topbar.innerHTML = `<div><strong>Untitled design</strong><span class="document-type">Merchandise / 3D studio</span></div><div class="document-actions"><button id="themeToggle" aria-label="Switch to light theme">Light UI</button><button id="openDesign">${icon('file')}Open design</button><button id="exportDesign" class="export-action">Export mockup ↗</button></div>`;
studio.before(topbar);
$('openDesign').onclick = () => $('loadDesign').click();
$('exportDesign').onclick = () => document.querySelector('[data-step="share"]').click();
function syncTheme() { const dark = document.documentElement.dataset.theme !== 'light'; $('themeToggle').innerHTML = icon(dark ? 'sun' : 'moon') + (dark ? 'Light UI' : 'Dark UI'); $('themeToggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); }
$('themeToggle').onclick = () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; try {localStorage.setItem('pressroom-theme', document.documentElement.dataset.theme)} catch {} syncTheme(); };
syncTheme();
$('assetSearch').oninput = e => {let count=0; for(const b of $('products').children) {b.hidden = !b.textContent.toLowerCase().includes(e.target.value.trim().toLowerCase()); if(!b.hidden)count++} $('searchEmpty').hidden = count > 0;};
document.addEventListener('keydown', e => {if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable],dialog')||$('modal').open)return; const button = document.querySelector(`[data-step="${['design','place','share'][Number(e.key)-1]}"]`); if(button){e.preventDefault();button.click()}});
const footer = document.createElement('div');
footer.className = 'workspace-status';
footer.innerHTML = '<span><i class="live-dot"></i> Local workspace · artwork stays on your device</span><span>1–3 Switch panels <b>·</b> Drag to orbit <b>·</b> Scroll to zoom</span>';
studio.after(footer);

// Move the existing controls so their state and event handlers stay shared.
const scene = $('scene');
scene.setAttribute('role', 'region');
const shell = document.createElement('div');
shell.className = 'viewport-shell';
scene.before(shell); shell.append(scene);
const rail = document.createElement('div');
rail.className = 'viewport-tools'; rail.setAttribute('role','toolbar');
rail.setAttribute('aria-label','Viewport tools');
shell.append(rail);
const hint = document.querySelector('.canvas-top .pill');
hint.className = 'viewport-hint'; hint.textContent = 'Drag to orbit · Shift + drag to pan · Scroll to zoom';
const tool = (button, name, label) => {
  button.innerHTML = icon(name); button.title = label;
  button.setAttribute('aria-label',label); button.classList.add('viewport-tool');
  return button;
};
for (const [mode,label] of [['orbit','Orbit view'],['pan','Pan view'],['zoom','Zoom view']]) {
  const button = tool(document.createElement('button'),mode,label);
  button.dataset.navigation = mode; button.setAttribute('aria-pressed',mode==='orbit');
  button.onclick = () => {document.dispatchEvent(new CustomEvent('viewport-navigation',{detail:mode})); syncTools(mode)};
  rail.append(button);
}
const divider = document.createElement('span');divider.className='tool-divider';rail.append(divider);
rail.append(tool($('pickFreeSurface'),'pick','Pick print surface'));
for(const button of document.querySelectorAll('[data-transform-mode]'))rail.append(tool(button,button.dataset.transformMode==='translate'?'move':button.dataset.transformMode,button.textContent+' artwork'));
rail.append(tool($('focusDesign'),'focus','Frame artwork'));
const optionsBody=document.createElement('div');
optionsBody.append(document.querySelector('.free-transform-controls'));
optionsBody.append($('movePrintArea').closest('label'));
optionsBody.append($('printGuides').closest('label'));
const viewControls=document.querySelector('.view-controls');
viewControls.querySelector('.drag-hint').remove();
viewControls.querySelector('.seg').setAttribute('aria-label','Artwork side');
for(const [id,name,label] of [['zoomOut','zoom','Zoom out'],['reset','focus','Reset camera'],['zoomIn','zoom','Zoom in']])tool($(id),name,label);
$('zoomOut').innerHTML='<span aria-hidden="true">−</span>';
const foot=document.querySelector('.scene-foot');foot.querySelector('span').textContent='PERSPECTIVE · STUDIO';
const panel=document.querySelector('[data-panel="place"]');panel.querySelector('h3').textContent='Placement';panel.querySelector('.panel-help').textContent='Use the viewport tools to place artwork. Set exact dimensions here.';
const area=document.querySelector('.move-area-controls');const advanced=document.createElement('details');advanced.className='area-properties';advanced.innerHTML='<summary>Print area settings</summary>';area.before(advanced);advanced.append(area);
$('moveAreaHelp').remove();
function syncTools(navigation) {
  const transform=$('freeTransform').checked, picking=$('movePrintArea').checked;
  for(const button of rail.querySelectorAll('button')) {
    const active=button.dataset.navigation ? !transform&&!picking&&button.dataset.navigation===(navigation||rail.dataset.navigation||'orbit') : button.id==='pickFreeSurface' ? picking : button.dataset.transformMode ? transform&&button.classList.contains('selected') : false;
    button.setAttribute('aria-pressed',active);
  }
  if(navigation)rail.dataset.navigation=navigation;
}
rail.addEventListener('click',()=>syncTools());
new MutationObserver(()=>{const busy=scene.getAttribute('aria-busy')==='true';for(const button of rail.querySelectorAll('button'))button.disabled=busy;optionsBody.inert=busy;syncTools()}).observe(scene,{attributes:true,attributeFilter:['aria-busy']});
document.querySelector('.workflow-tabs').addEventListener('click',()=>syncTools());

// Viewport settings replace the scene and 3D transform sections in the inspector.
const dock=document.createElement('section');dock.className='viewport-dock';dock.setAttribute('aria-label','Viewport properties');
dock.innerHTML=`<div role="tablist" aria-label="Viewport properties"><button id="viewport-tab-view" role="tab" aria-controls="viewport-panel-view" aria-selected="false" tabindex="0">${icon('cube')}View</button><button id="viewport-tab-transform" role="tab" aria-controls="viewport-panel-transform" aria-selected="false" tabindex="-1">${icon('move')}Transform</button><button id="viewport-tab-scene" role="tab" aria-controls="viewport-panel-scene" aria-selected="false" tabindex="-1">${icon('sun')}Scene</button><button class="dock-close" aria-label="Close viewport properties" hidden>×</button></div><div id="viewport-panel-view" role="tabpanel" aria-labelledby="viewport-tab-view" hidden></div><div id="viewport-panel-transform" role="tabpanel" aria-labelledby="viewport-tab-transform" hidden></div><div id="viewport-panel-scene" role="tabpanel" aria-labelledby="viewport-tab-scene" hidden></div>`;
shell.append(dock);
const viewPanel=dock.querySelector('#viewport-panel-view'),transformPanel=dock.querySelector('#viewport-panel-transform'),scenePanel=dock.querySelector('#viewport-panel-scene');
viewPanel.innerHTML='<h4>Camera orientation</h4><p class="panel-help">Drag to orbit. Shift + drag to pan. Scroll or pinch to zoom.</p>';
viewPanel.append(document.querySelector('.camera-presets'));
transformPanel.append(...optionsBody.childNodes);
transformPanel.append($('resetPrintArea'),$('printAnchorStatus'));
const sceneSettings=document.querySelector('[data-panel="scene"]');scenePanel.append(...sceneSettings.childNodes);sceneSettings.remove();
const cameraHeading=scenePanel.querySelector('h4');while(cameraHeading?.nextSibling)viewPanel.append(cameraHeading.nextSibling);cameraHeading?.remove();
document.querySelector('[data-step="scene"]').remove();
const tabs=[...dock.querySelectorAll('[role="tab"]')],closeDock=dock.querySelector('.dock-close');
function openDock(name){for(const tab of tabs){const selected=tab.id==='viewport-tab-'+name;tab.setAttribute('aria-selected',selected);tab.tabIndex=selected?0:-1;$(tab.getAttribute('aria-controls')).hidden=!selected}dock.classList.toggle('expanded',!!name);closeDock.hidden=!name;}
for(const tab of tabs){tab.onclick=()=>openDock(tab.getAttribute('aria-selected')==='true'?null:tab.id.replace('viewport-tab-',''));tab.onkeydown=e=>{const i=tabs.indexOf(tab);let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();tabs[next].focus();openDock(tabs[next].id.replace('viewport-tab-',''))}}}
closeDock.onclick=()=>{const active=tabs.find(t=>t.getAttribute('aria-selected')==='true');openDock(null);active?.focus()};
dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();closeDock.click()}});
document.addEventListener('viewport-panel',e=>openDock(e.detail));
rail.addEventListener('click',e=>{if(e.target.closest('[data-transform-mode],#pickFreeSurface'))openDock('transform')});
dock.addEventListener('change',()=>syncTools());
new MutationObserver(()=>{const busy=scene.getAttribute('aria-busy')==='true';for(const panel of dock.querySelectorAll('[role="tabpanel"]'))panel.inert=busy}).observe(scene,{attributes:true,attributeFilter:['aria-busy']});
