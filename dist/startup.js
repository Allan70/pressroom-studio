const overlay = document.getElementById('startupScreen');
const status = document.getElementById('startupStatus');
function unlock() {
  document.querySelector('header').inert = false;
  document.querySelector('main').inert = false;
  document.querySelector('main').removeAttribute('aria-busy');
  overlay.hidden = true;
}
document.addEventListener('studio-loading', event => { status.textContent = event.detail; });
document.addEventListener('studio-ready', () => {
  document.body.dataset.startup = 'ready';
  unlock();
});
document.addEventListener('studio-error', () => {
  document.body.dataset.startup = 'error';
  document.getElementById('startupTitle').textContent = 'The studio could not start';
  status.textContent = 'Check your connection and reload to try again.';
  overlay.querySelector('.startup-spinner').hidden = true;
  const retry = document.getElementById('startupRetry');
  retry.hidden = false;
  retry.onclick = () => location.reload();
  retry.focus();
});
