# Pressroom Studio

A browser-based merchandise storefront and 3D design studio built with HTML, CSS, JavaScript, and Three.js. Includes neutral product models, artwork upload, editable print maps, movable and resizable print areas, custom colours, text formatting, scene controls, and PNG mockup exports.

## Run locally

Install Node.js 22 or later, then run from CMD:

```cmd
node preview.cjs
```

Open http://127.0.0.1:4173/#studio. If another copy is already running on port 4173, stop that copy before starting this one.

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

Dark appearance is the default. The Light UI / Dark UI control remembers an explicit preference in localStorage. Product search lives in the left library; design, transform, scene and export controls live in the right inspector. Keys 1–4 switch panels outside text fields. The layout stacks on small screens.

Artwork composition uses an OffscreenCanvas worker with a bounded latest-edit queue and a main-thread fallback. Meshopt model decoding uses up to two workers, with original neutral GLBs as a compatibility fallback. The preview renders on changes instead of continuously and pauses outside the viewport. See [compression tooling](tools/model-codec/README.md) for reproducible encoding and validation.

## Direct 3D artwork placement

The Transform inspector includes a surface picker, local/world Move/Rotate/Scale gizmos, optional snapping, numeric 3D pose, projection reach and surface offset. A picked ray can expose multiple outward-facing surfaces; choose a deeper layer to target geometry beneath an overlap. The selected mesh and projection reach restrict where the decal appears. Actual geometry depth controls occlusion; hidden artwork is not rendered through an overlapping part. Transform handles and guides are omitted from PNG exports. On mugs, free transform switches to a surface decal; Reset print area position restores the handle-safe wrap. Pose, selected mesh, reach and offset are saved per print side in editable design files. Coordinates use the approximate model scale, not a manufacturing template.

During a gizmo drag, projection updates are coalesced to at most 30 per second and the preview temporarily uses a smaller composed texture. Full artwork resolution is restored on release. Run `node verify-surface-picking.mjs` for overlap ordering, interior-face rejection and rotated-pivot checks.
