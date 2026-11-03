import {installTooltips} from './tooltips.js';
import { icon } from './vendor/icons.js';
const $ = id => document.getElementById(id);
const studio = $('studio');
const library = document.createElement('section');
library.className = 'asset-library';
library.setAttribute('aria-label', 'Product library');
library.innerHTML = `<div class="library-heading"><span>ASSETS</span><span>11 blanks</span></div><h2>Product library</h2><label class="asset-search">${icon('search')}<input id="assetSearch" type="search" placeholder="Find a product…" aria-label="Search products"></label><div id="libraryGrid"></div><p id="searchEmpty" hidden>No matching products.</p>`;
studio.prepend(library);
$('libraryGrid').append($('products'));
document.querySelector('[data-panel="design"] .field-head').remove();
const inspector = studio.querySelector('aside');
inspector.setAttribute('aria-label', 'Design properties');
const syncLoading=()=>{const busy=$('scene').getAttribute('aria-busy')==='true';for(const panel of inspector.querySelectorAll('.workflow-panel'))panel.inert=busy;inspector.classList.toggle('model-pending',busy)};
new MutationObserver(syncLoading).observe($('scene'),{attributes:true,attributeFilter:['aria-busy']});syncLoading();
inspector.querySelector('.step-label').innerHTML = 'PROPERTIES <span>LIVE PREVIEW</span>';
inspector.querySelector('h2').textContent = 'Design settings';
inspector.querySelector('.muted').textContent = 'Artwork, placement and output.';
const labels = {design:'Design',place:'Placement',scene:'Scene',share:'Export'};
for (const button of document.querySelectorAll('[data-step]')) {
  button.lastChild.textContent = labels[button.dataset.step];
  button.title = `${labels[button.dataset.step]} · ${['design','place','share'].indexOf(button.dataset.step)+1}`;
}
const topbar = document.createElement('div');
topbar.className = 'document-bar';
topbar.innerHTML = `<div><input id="projectName" type="text" maxlength="80" value="Untitled project" aria-label="Project name" autocomplete="off" spellcheck="false"><span id="autosaveStatus" class="document-type" role="status" aria-live="polite">Autosave ready</span></div><div class="document-actions"><button id="undoEdit" disabled aria-label="Undo" aria-keyshortcuts="Control+z Meta+z" title="Undo (Ctrl/Cmd+Z)">${icon('undo')}<span>Undo</span></button><button id="redoEdit" disabled aria-label="Redo" aria-keyshortcuts="Control+Shift+z Meta+Shift+z Control+y" title="Redo (Ctrl/Cmd+Shift+Z or Ctrl+Y)">${icon('redo')}<span>Redo</span></button><button id="themeToggle" aria-label="Switch to light theme">Light UI</button><button id="saveProject" aria-keyshortcuts="Control+s Meta+s">${icon('save')}Save project</button><button id="openDesign">${icon('file')}Open design</button><button id="exportDesign" class="export-action">${icon('export')}Export image</button></div>`;
studio.before(topbar);
$('openDesign').onclick = () => document.dispatchEvent(new Event('open-project'));
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
for(const [id,name,label] of [['zoomOut','zoomOut','Zoom out'],['reset','focus','Reset camera'],['zoomIn','zoom','Zoom in']])tool($(id),name,label);

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
dock.innerHTML=`<div role="tablist" aria-label="Viewport properties"><button id="viewport-tab-view" role="tab" aria-controls="viewport-panel-view" aria-selected="false" tabindex="0">${icon('window')}View</button><button id="viewport-tab-transform" role="tab" aria-controls="viewport-panel-transform" aria-selected="false" tabindex="-1">${icon('transform')}Transform</button><button id="viewport-tab-scene" role="tab" aria-controls="viewport-panel-scene" aria-selected="false" tabindex="-1">${icon('settings')}Scene</button><button class="dock-close" aria-label="Close viewport properties" hidden>${icon('close')}</button></div><div id="viewport-panel-view" role="tabpanel" aria-labelledby="viewport-tab-view" hidden></div><div id="viewport-panel-transform" role="tabpanel" aria-labelledby="viewport-tab-transform" hidden></div><div id="viewport-panel-scene" role="tabpanel" aria-labelledby="viewport-tab-scene" hidden></div>`;
shell.append(dock);
const viewPanel=dock.querySelector('#viewport-panel-view'),transformPanel=dock.querySelector('#viewport-panel-transform'),scenePanel=dock.querySelector('#viewport-panel-scene');
viewPanel.innerHTML='<h4>Camera orientation</h4><p class="panel-help">Drag to orbit. Shift + drag to pan. Scroll or pinch to zoom.</p>';
viewPanel.append(document.querySelector('.camera-presets'));
transformPanel.innerHTML='<label class="control-label" for="surfaceMapping">Artwork mapping</label><select id="surfaceMapping"><option value="wrap">Wrap around surface</option><option value="project">Flat projection</option></select><p class="panel-help">Surface wrap follows the model without a depth clipping box.</p>';transformPanel.append(...optionsBody.childNodes);
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

const main=document.querySelector('main');
const editorScreen=document.createElement('section');editorScreen.className='editor-screen';editorScreen.setAttribute('aria-label','Design studio screen');
main.prepend(editorScreen);editorScreen.append(topbar,studio,footer);
const collectionScreen=document.createElement('section');collectionScreen.className='collection-screen';collectionScreen.setAttribute('aria-label','Collection screen');
main.append(collectionScreen);collectionScreen.append($('collection'),document.querySelector('.creator'),main.querySelector('footer'));
const collectionHeading=$('collection').querySelector('h2');collectionHeading.tabIndex=-1;
const screenLinks=[...document.querySelectorAll('header a[href="#studio"],header a[href="#collection"]')];
document.querySelector('header .brand').setAttribute('href','#studio');
function showScreen(){const collection=location.hash==='#collection';document.body.dataset.screen=collection?'collection':'studio';editorScreen.hidden=collection;collectionScreen.hidden=!collection;for(const link of screenLinks){const active=link.hash===(collection?'#collection':'#studio');link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}if(collection)collectionScreen.scrollTop=0;else document.querySelector('.asset-library').scrollTop=0;}
window.addEventListener('hashchange',()=>{showScreen();if(document.body.dataset.screen==='collection')collectionHeading.focus({preventScroll:true});else $('projectName').focus({preventScroll:true})});

showScreen();

document.addEventListener('history-restored',()=>{syncTools();$('projectorDepth').disabled=$('surfaceMapping').value==='wrap'});
$('projectorDepth').disabled=true;$('projectorOffset').disabled=true;

document.querySelector('.guide-note').textContent='Print outlines and handles are guides. Surface wrap can continue beyond the outline; flat projection crops at the boundary. Guides are omitted from exports.';

const help=installTooltips();
const toolHelp={
 orbit:['Orbit view','Drag to rotate the camera around the model. Your artwork stays in place.','Drag · Shift + drag to pan'],
 pan:['Hand tool','Drag to move the camera across the canvas without moving the artwork.','Drag · Two-finger touch to pan'],
 zoom:['Zoom tool','Drag up or down to zoom the camera. This changes the view, not the artwork size.','Drag · Scroll or pinch to zoom']
};
for(const button of rail.querySelectorAll('[data-navigation]'))help(button,...toolHelp[button.dataset.navigation]);
help($('pickFreeSurface'),'Surface picker','Click a point on the model to attach artwork. Use the surface selector for overlapping parts.');
for(const button of rail.querySelectorAll('[data-transform-mode]')){
 const descriptions={translate:['Move artwork','Drag a coloured arrow to move along one axis, or a square handle to move across a plane.'],rotate:['Rotate artwork','Drag a coloured rotation ring to turn the design around that axis.'],scale:['Scale artwork','Drag a handle to resize the artwork. Use the centre handle to scale uniformly.']};
 help(button,...descriptions[button.dataset.transformMode]);
}
help($('focusDesign'),'Frame artwork','Turn the camera toward the active design so you can inspect its placement.');
help($('zoomIn'),'Zoom in','Move the camera closer without changing the design dimensions.');
help($('zoomOut'),'Zoom out','Move the camera farther away without changing the design dimensions.');
help($('reset'),'Reset camera','Return to the front view, reset the camera distance and centre the model.');
help($('viewport-tab-view'),'View panel','Open camera presets and exact orbit angles.');
help($('viewport-tab-transform'),'Transform panel','Open artwork mapping, surface selection, axes, snapping and precise 3D coordinates.');
help($('viewport-tab-scene'),'Scene panel','Adjust lighting, exposure, shadows and the background used for your export.');
help(closeDock,'Close panel','Collapse the viewport settings to give the canvas more room.','Esc');
help($('surfaceMapping'),'Artwork mapping','Surface wrap follows the model. Flat projection uses a localized decal and depth range.');
help($('transformSpace'),'Transform axes','Local axes follow the artwork surface. World axes stay aligned with the model.');
help($('transformSnap'),'Snap transforms','Snap moves to 1 mm, rotations to 15° and scaling to 10% increments.');
help($('undoEdit'),'Undo','Restore the previous edit. An artwork drag is restored as one action.','Ctrl/Cmd + Z');
help($('redoEdit'),'Redo','Reapply the last undone edit. Making a new edit clears redo.','Ctrl/Cmd + Shift + Z · Ctrl + Y');
help($('openDesign'),'Open design','Load an editable Pressroom design file with its artwork and settings.');
help($('exportDesign'),'Export mockup','Open export settings to create a PNG of the current design and scene.');
for(const button of viewPanel.querySelectorAll('[data-view]'))help(button,button.textContent+' view','Turn the camera to this preset without changing artwork placement.');
for(const key of ['x','y','z','rx','ry','rz'])help($('decal-'+key),key.startsWith('r')?'Rotation about '+key.slice(1).toUpperCase():'Position on '+key.toUpperCase(),key.startsWith('r')?'Set the artwork orientation in degrees. Undo and redo include these edits.':'Set the artwork position in millimetres. Undo and redo include these edits.');

// Keep the first decisions simple; less common controls remain available on demand.
const advancedPositioning=document.createElement('details');advancedPositioning.className='advanced-positioning';advancedPositioning.innerHTML='<summary>Advanced positioning</summary>';
const freeControls=transformPanel.querySelector('.free-transform-controls');freeControls.before(advancedPositioning);advancedPositioning.append(freeControls,$('movePrintArea').closest('label'));
$('resetPrintArea').textContent='Reset 3D position';
transformPanel.querySelector(':scope > .panel-help').textContent='Choose how your design follows the product.';
$('printAnchorStatus').hidden=true;
$('artTab').textContent='Image';$('textTab').textContent='Text';
const designPanel=document.querySelector('[data-panel="design"]');
for(const heading of designPanel.querySelectorAll('.field-head'))if(heading.textContent.includes('Leave your mark'))heading.textContent='Your design';
$('saveProductColour').nextElementSibling.textContent='Saved for this session. Click × on a colour to remove it.';
$('saveProductColour').textContent='Save colour';
designPanel.querySelector('.upload strong').textContent='Add your image';designPanel.querySelector('.upload small').textContent='Choose a PNG or JPG · up to 10 MB';
const exportPanel=document.querySelector('[data-panel="share"]');exportPanel.querySelector('h3').textContent='Export your design';exportPanel.querySelector('.panel-help').textContent='Save a PNG of the current view. Editing guides are excluded.';
exportPanel.querySelector('.capture-note').remove();
scenePanel.querySelector('h3').textContent='Lighting and background';scenePanel.querySelector('.panel-help').textContent='These settings affect the preview and exported image.';
footer.innerHTML='<span>Changes stay in this browser. Save a design file to keep your work.</span>';
for(const [id,title,description]of [['surfaceLayer','Overlapping surfaces','Choose which surface receives the design after picking a point.'],['printSide','Design side','The front and back can have separate artwork.'],['resetPlacement','Reset placement','Return the design to its original size, position and rotation. You can undo this action.']])help($(id),title,description);
$('exportDesign').innerHTML=icon('export')+'Export image';
$('exportDesign').setAttribute('aria-label','Export image');
$('how').textContent='Help';
document.querySelector('header a[href="#collection"]').textContent='Collection';
footer.firstElementChild.textContent='Save a design file to keep your work.';
const compactViewport=matchMedia('(max-width:540px)');
const navigationHint=()=>hint.textContent=compactViewport.matches?'Drag to rotate · Pinch to zoom':'Drag to rotate · Shift + drag to pan · Scroll to zoom';
compactViewport.addEventListener('change',navigationHint);navigationHint();
help($('clearArt'),'Remove image','Remove the current image. Undo restores it if you change your mind.');

$('saveProject').onclick=()=>$('saveDesign').click();
$('saveDesign').textContent='Save project to this computer';
$('loadDesign').previousElementSibling.textContent='Open a saved project';
help($('projectName'),'Project name','Click to rename. Press Enter to finish, or Ctrl/Cmd+S to save the project with this name.');
help($('saveProject'),'Save project','Download an editable project file with your artwork, placement and scene settings. Open the file later to continue editing.','Ctrl/Cmd + S');
scene.tabIndex=0;
scene.setAttribute('aria-label','3D viewport. Drag to rotate, Shift-drag to pan, and scroll to zoom. Press question mark for keyboard controls.');
const shortcutHelp=document.createElement('details');shortcutHelp.className='viewport-shortcuts';
shortcutHelp.innerHTML='<summary>Mouse and keyboard controls</summary><p>Tools act on the current design. Camera navigation does not change your artwork.</p><dl><dt>Rotate view</dt><dd>O · drag</dd><dt>Pan view</dt><dd>H · drag, or Shift + drag</dd><dt>Zoom view</dt><dd>Z · drag, scroll, or + / −</dd><dt>Move design</dt><dd>V · drag a handle</dd><dt>Rotate design</dt><dd>R · drag a ring</dd><dt>Scale design</dt><dd>S · drag a handle</dd><dt>Pick a surface</dt><dd>I · click the model</dd><dt>Frame design</dt><dd>F</dd><dt>Reset camera</dt><dd>Home</dd><dt>Remove artwork</dt><dd>Delete / Backspace · Undo restores it</dd><dt>Return to view tool</dt><dd>Esc</dd><dt>Save project</dt><dd>Ctrl/Cmd + S</dd><dt>Open project</dt><dd>Ctrl/Cmd + O</dd></dl>';
viewPanel.append(shortcutHelp);
const shortcutButtons={o:rail.querySelector('[data-navigation="orbit"]'),h:rail.querySelector('[data-navigation="pan"]'),z:rail.querySelector('[data-navigation="zoom"]'),v:rail.querySelector('[data-transform-mode="translate"]'),r:rail.querySelector('[data-transform-mode="rotate"]'),s:rail.querySelector('[data-transform-mode="scale"]'),i:$('pickFreeSurface'),f:$('focusDesign')};
for(const [key,button]of Object.entries(shortcutButtons)){button.dataset.tooltipKeys=key.toUpperCase();button.setAttribute('aria-keyshortcuts',key)}
$('reset').dataset.tooltipKeys='Home';$('zoomIn').dataset.tooltipKeys='+';$('zoomOut').dataset.tooltipKeys='−';$('openDesign').dataset.tooltipKeys='Ctrl/Cmd + O';$('clearArt').dataset.tooltipKeys='Delete / Backspace';
let temporaryPan=null;
function restoreTool(){if(temporaryPan){const previous=temporaryPan;temporaryPan=null;previous.click()}}
function canUseViewportKeys(event){return document.body.dataset.screen==='studio'&&document.body.dataset.startup==='ready'&&scene.getAttribute('aria-busy')!=='true'&&!$('modal').open&&!event.isComposing&&!event.target.closest('input,textarea,select,[contenteditable],dialog')}
document.addEventListener('keydown',event=>{
 if(!canUseViewportKeys(event)||event.ctrlKey||event.metaKey||event.altKey||event.defaultPrevented)return;
 const key=event.key.toLowerCase();
 if(key===' '){event.preventDefault();if(!event.repeat&&!temporaryPan){temporaryPan=rail.querySelector('[aria-pressed="true"]')||shortcutButtons.o;shortcutButtons.h.click()}return}
 if(event.repeat&&!['+','=','-'].includes(key))return;
 if(shortcutButtons[key]){event.preventDefault();shortcutButtons[key].click();return}
 if(key==='+'||key==='='){event.preventDefault();$('zoomIn').click()}else if(key==='-'){event.preventDefault();$('zoomOut').click()}else if(key==='home'){event.preventDefault();$('reset').click()}else if(key==='escape'){event.preventDefault();temporaryPan=null;shortcutButtons.o.click();openDock(null)}else if(key==='?'){event.preventDefault();openDock('view');shortcutHelp.open=true;shortcutHelp.querySelector('summary').focus()}
});
document.addEventListener('keyup',event=>{if(event.key===' '&&temporaryPan){event.preventDefault();restoreTool()}});
window.addEventListener('blur',restoreTool);
const projectLabel=document.createElement('label');projectLabel.htmlFor='projectName';projectLabel.className='project-name-label';projectLabel.textContent='Project';$('projectName').before(projectLabel);
$('openDesign').innerHTML=icon('file')+'Open project';
help($('openDesign'),'Open project','Open a saved Pressroom project from this computer to continue editing.','Ctrl/Cmd + O');

import './range-controls.js';
