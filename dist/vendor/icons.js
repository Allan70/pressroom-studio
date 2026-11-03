// Local interface icons with original editing-tool glyphs and Lucide symbols. ISC license: ../assets/lucide-LICENSE.txt.
// Move, rotate and pick use bundled lucide-static v0.468.0 move, rotate-3d and crosshair SVGs.
const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  export: '<path d="M12 3v12m-4-8 4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8"/>',

  undo: '<path d="M3 10h11a6 6 0 0 1 0 12M3 10l6-6m-6 6 6 6"/>',
  redo: '<path d="M21 10H10a6 6 0 0 0 0 12m11-12-6-6m6 6-6 6"/>',

  orbit: '<circle cx="12" cy="12" r="6"/><path d="M2 12a10 5 0 0 0 18 3m2-3a10 5 0 0 0-18-3M2 12V7m0 5h5m15 0v5m0-5h-5"/>',
  pan: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v7c0 4-2 7-6 7h-2c-2 0-4-1-5-3l-4-6a1.6 1.6 0 0 1 2.5-2L8 14Z"/>',
  zoom: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',
  zoomOut: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6M7 10h6"/>',
  move: '<path d="M12 2v20" /><path d="m15 19-3 3-3-3" /><path d="m19 9 3 3-3 3" /><path d="M2 12h20" /><path d="m5 9-3 3 3 3" /><path d="m9 5 3-3 3 3" />',
  rotate: '<path d="M16.466 7.5C15.643 4.237 13.952 2 12 2 9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2" /><path d="m15.194 13.707 3.814 1.86-1.86 3.814" /><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4" />',
  scale: '<path d="M5 5h14v14H5Z"/><path d="m9 15 6-6m-5 0h5v5"/><path fill="currentColor" stroke="none" d="M3 3h4v4H3zm14 0h4v4h-4zM3 17h4v4H3zm14 0h4v4h-4z"/>',
  transform: '<path d="M5 5h14v14H5Z"/><path fill="currentColor" stroke="none" d="M3 3h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 10h4v4H3zm14 0h4v4h-4zM3 17h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4z"/>',
  pick: '<circle cx="12" cy="12" r="10" /><line x1="22" x2="18" y1="12" y2="12" /><line x1="6" x2="2" y1="12" y2="12" /><line x1="12" x2="12" y1="6" y2="2" /><line x1="12" x2="12" y1="22" y2="18" />',
  settings: '<path d="M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-7 0v6"/>',
  cube: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5m-9 5L3 7m9 5v10"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18m-6 0v11M6 6.5h.01m3 0h.01"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  grid: '<path d="M3 3h18v18H3Zm0 6h18M3 15h18M9 3v18m6-18v18"/>',
  focus: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M8 8h8v8H8Z"/>',

  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.25 6.25 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>'
};
export function icon(name) {
  return `<svg class="ui-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
