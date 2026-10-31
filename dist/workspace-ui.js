const $ = id => document.getElementById(id);
const studio = $('studio');
const library = document.createElement('section');
library.className = 'asset-library';
library.setAttribute('aria-label', 'Product library');
library.innerHTML = `<div class="library-heading"><span>ASSETS</span><span>11 blanks</span></div><h2>Product library</h2><label class="asset-search"><span>⌕</span><input id="assetSearch" type="search" placeholder="Find a product…" aria-label="Search products"></label><div id="libraryGrid"></div><p id="searchEmpty" hidden>No matching products.</p><div class="library-note"><span class="live-dot"></span> Your canvas, in real 3D.<small>Choose a blank. Bring your own design.</small></div>`;
studio.prepend(library);
$('libraryGrid').append($('products'));
document.querySelector('[data-panel="design"] .field-head').remove();
const inspector = studio.querySelector('aside');
inspector.setAttribute('aria-label', 'Design properties');
const syncLoading=()=>{const busy=$('scene').getAttribute('aria-busy')==='true';for(const panel of inspector.querySelectorAll('.workflow-panel'))panel.inert=busy;inspector.classList.toggle('model-pending',busy)};
new MutationObserver(syncLoading).observe($('scene'),{attributes:true,attributeFilter:['aria-busy']});syncLoading();
inspector.querySelector('.step-label').innerHTML = 'PROPERTIES <span>LIVE PREVIEW</span>';
inspector.querySelector('h2').textContent = 'Make it yours.';
inspector.querySelector('.muted').textContent = 'Everything you need. Right here.';
const labels = {design:'Design',place:'Transform',scene:'Scene',share:'Export'};
for (const button of document.querySelectorAll('[data-step]')) {
  button.lastChild.textContent = labels[button.dataset.step];
  button.title = `${labels[button.dataset.step]} · ${Object.keys(labels).indexOf(button.dataset.step)+1}`;
}
const topbar = document.createElement('div');
topbar.className = 'document-bar';
topbar.innerHTML = `<div><span class="document-mark">✳</span><strong>Your next creation</strong><span class="document-type">Merchandise / 3D studio</span></div><div class="document-actions"><button id="themeToggle" aria-label="Switch to light theme">Light UI</button><button id="openDesign">Open design</button><button id="exportDesign" class="export-action">Export mockup ↗</button></div>`;
studio.before(topbar);
$('openDesign').onclick = () => $('loadDesign').click();
$('exportDesign').onclick = () => document.querySelector('[data-step="share"]').click();
function syncTheme() { const dark = document.documentElement.dataset.theme !== 'light'; $('themeToggle').textContent = dark ? 'Light UI' : 'Dark UI'; $('themeToggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); }
$('themeToggle').onclick = () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; try {localStorage.setItem('pressroom-theme', document.documentElement.dataset.theme)} catch {} syncTheme(); };
syncTheme();
$('assetSearch').oninput = e => {let count=0; for(const b of $('products').children) {b.hidden = !b.textContent.toLowerCase().includes(e.target.value.trim().toLowerCase()); if(!b.hidden)count++} $('searchEmpty').hidden = count > 0;};
document.addEventListener('keydown', e => {if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable],dialog')||$('modal').open)return; const button = document.querySelector(`[data-step="${Object.keys(labels)[Number(e.key)-1]}"]`); if(button){e.preventDefault();button.click()}});
const footer = document.createElement('div');
footer.className = 'workspace-status';
footer.innerHTML = '<span><i class="live-dot"></i> Local workspace · artwork stays on your device</span><span>1–4 Switch panels <b>·</b> Drag to orbit <b>·</b> Scroll to zoom</span>';
studio.after(footer);
