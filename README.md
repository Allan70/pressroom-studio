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
