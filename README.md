# Pressroom Studio

A browser-based merchandise storefront and 3D design studio built with HTML, CSS, JavaScript, and Three.js. Includes neutral product models, artwork upload, editable print maps, movable and resizable print areas, custom colours, text formatting, scene controls, and PNG mockup exports.

## Run locally

Install Node.js 22 or later, then run from CMD:

```cmd
node preview.cjs
```

Open http://127.0.0.1:4173/#studio. If another copy is already running on port 4173, stop that copy before starting this one.

For development on a remote machine over SSH:

```sh
npm run dev-host
# Optional custom port:
PORT=5173 npm run dev-host
```

`dev-host` binds to `0.0.0.0` and watches the server for changes. Static file edits appear on browser refresh. Set `HOST` to override the bind address. For private access, run `HOST=127.0.0.1 npm run dev-host` remotely and `ssh -N -L 4173:127.0.0.1:4173 user@host` locally, then open http://127.0.0.1:4173/#studio. To debug the Node server through an SSH tunnel, run `node --inspect=127.0.0.1:9229 preview.cjs --host` and forward port 9229 with `ssh -N -L 9229:127.0.0.1:9229 user@host`; browser developer tools debug the client app.

The app is static and its runtime libraries are bundled under `dist/vendor/`. No package installation or build step is required.

## Check the project

```cmd
node --check dist/app.js
node --check dist/engine.js
node --check dist/surface-editor.js
node verify-neutral.mjs
```

## Project layout

- `dist/`: deployable storefront, editor, models, thumbnails, icons, and bundled libraries.
- `dist/app.js`: UI state, artwork and text editing, session colours, and design files.
- `dist/engine.js`: Three.js rendering, print projection, surface positioning, and capture.
- `dist/surface-editor.js`: flat printable-surface editor.
- `dist/products.js`: product catalogue and default printable dimensions.
- `preview.cjs`: local static preview server.
- `.openai/hosting.json`: configuration for the existing private Sites deployment.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys the `dist/` directory after a push to `main`, or when run manually from GitHub Actions. In repository **Settings → Pages**, select **GitHub Actions** as the publishing source. GitHub Pages must be available for the repository's visibility and account plan.

The site uses relative asset URLs so it works under the repository's Pages subdirectory.

## Scope and assets

This is a UI prototype. Checkout, payment, production ordering, and fulfilment are not connected. Product dimensions and prices are illustrative.

Uploaded designs are processed in the browser. Saved design JSON includes the artwork and settings; saved custom colours remain in the current tab session.

Third-party model rights remain with their original authors. Source archives and library notices are documented in `dist/assets/credits.html`. No additional rights to those assets are granted by this repository.

## Creative workspace

Dark appearance is the default. The Light UI / Dark UI control remembers an explicit preference in localStorage. Product search lives in the left library. The right inspector contains Design, Layout and Export; keys 1–3 switch these panels outside text fields. The viewport tool rail provides Orbit, Pan, Zoom, surface picking, Move, Rotate, Scale and Frame Artwork. Self-contained View, Transform and Scene tabs hold camera presets, 3D placement options, lighting and backdrop settings. Shift-drag or right-drag pans the view; scroll or pinch zooms. The layout stacks on small screens.

Artwork composition uses an OffscreenCanvas worker with a bounded latest-edit queue and a main-thread fallback. Meshopt model decoding uses up to two workers, with original neutral GLBs as a compatibility fallback. The preview renders on changes instead of continuously and pauses outside the viewport. See [compression tooling](tools/model-codec/README.md) for reproducible encoding and validation.

## Direct 3D artwork placement

The Transform inspector includes a surface picker, local/world Move/Rotate/Scale gizmos, optional snapping, numeric 3D pose, projection reach and surface offset. A picked ray can expose multiple outward-facing surfaces; choose a deeper layer to target geometry beneath an overlap. The selected mesh and projection reach restrict where the decal appears. Actual geometry depth controls occlusion; hidden artwork is not rendered through an overlapping part. Transform handles and guides are omitted from PNG exports. On mugs, free transform switches to a surface decal; Reset print area position restores the handle-safe wrap. Pose, selected mesh, reach and offset are saved per print side in editable design files. Coordinates use the approximate model scale, not a manufacturing template.

During a gizmo drag, projection updates are coalesced to at most 30 per second and the preview temporarily uses a smaller composed texture. Full artwork resolution is restored on release. Run `node verify-surface-picking.mjs` for overlap ordering, interior-face rejection and rotated-pivot checks.

## Interaction performance checks

Run `node verify-projection-cache.mjs` to check decal output, cache invalidation, separate print sides, resource disposal, and synthetic geometry timings. Texture and guide edits reuse projection geometry; model, anchor, projection size, mesh selection, or surface-offset changes rebuild it. Empty designs skip artwork textures and decal geometry. Surface dragging raycasts at most once per animation frame.

To measure browser responsiveness, record the same product selection, panel changes, artwork edits, and surface drags in Chrome DevTools Performance before and after a change. Repeat with CPU and network throttling; record the interaction target and Event Timing duration. Synthetic geometry timings are not INP measurements.

UI updates keep palette buttons in place, update quantity independently, and debounce colour persistence. The 2D surface map draws once per frame only when visible. Thumbnail delivery uses 240 px WebP images with asynchronous decoding; PNG sources remain available. The two most recently used prepared models retain their geometry and materials; eviction disposes GPU resources. Existing model normals are preserved. Preview print textures are capped at 2048 px (1024 while using the gizmo), and PNG capture restores the 4096 px projection limit before rendering the export.

The editor and collection are separate hash-routed screens (`#studio` and `#collection`). Editing fills the viewport; only its library, inspector and tool settings scroll. On phones, the product strip sits above the viewport and the inspector scrolls below it. Collection browsing has its own scroll container. Opening a collection product returns to the editor without reloading the app. A startup screen blocks editing until the initial model, artwork and fonts are ready; failed initialization offers Reload studio. Wheel scrolling a focused numeric field first removes focus to prevent accidental value changes.

## Undo, redo and surface mapping

Use Undo / Redo in the document toolbar, Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo, or Ctrl+Y on Windows/Linux. History keeps the latest 50 states, groups a pointer drag into one action and groups consecutive typing. It restores artwork, text styling, 2D placement, 3D anchors and pose, scale, rotation, product colours, model selection, print surfaces and scene settings. Camera navigation is independent of edit history. A new edit after undo clears the redo branch. Run `node verify-edit-history.mjs` for the history regression checks.

New artwork defaults to **Wrap around surface** in the viewport Transform tab. This maps artwork around the model's surface using a calibrated elliptical profile (circular for mugs) and the original mesh, without a projector depth box or print-guide crop. Horizontal movement continues around the circumference; vertical placement and rotation remain editable. The mesh's actual silhouette and depth still determine visibility. Full-circumference artwork has a seam opposite its anchor; this is profile-based wrapping rather than a UV-unwrapped painting system. **Flat projection** remains available for localized decals, with projection reach and surface offset controls. Mapping is saved per print side in editable design files. Legacy files without a mapping field retain flat projection. Run `node verify-surface-wrap.mjs` for coordinate continuity, positioning and depth checks.

Garment wrapping calibrates its depth to the picked surface rather than treating a thin shirt as a cylinder. Arc-length coordinates keep the physical horizontal and vertical scale consistent near the print anchor. Wrapped overlays keep their meshes and materials during transforms; only shader uniforms change. Transform changes coalesce at animation frames, flush before rendering, and update the inspector, artwork composition and history when the drag finishes.

Editing labels and controls use readable 13–16 px type with stronger secondary-text contrast, larger hit areas and a simplified Design → Placement → Export workflow. Advanced 3D positioning is collapsed by default. The viewport palette uses familiar editing symbols for Move, Hand, Zoom, Rotate and Scale; hover or keyboard focus shows a description of the action and relevant controls. Tooltips close with Escape or when editing begins and do not attach work to the render loop.
