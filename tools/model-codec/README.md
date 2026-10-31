# Model compression

From the repository root:

```
npm ci --prefix tools/model-codec
node tools/model-codec/compress.mjs
```

This writes the 11 active product models to `dist/assets/optimized/` and copies the MIT-licensed Meshopt decoder into `dist/vendor/`. Original neutral GLBs are retained as a browser compatibility fallback. No quantization or simplification is performed. The script decodes each output and checks exact vertex attributes, primitive counts, and triangle topology (allowing cyclic index rotation).

`dist/assets/optimized/report.json` records sizes and local Node decode timings. These timings are not end-user download or browser load benchmarks.

The browser requests only the selected product and caches in-flight loads. Meshopt uses at most two decoding workers. Artwork composition uses a separate module worker with one active job and one replaceable pending job, a main-thread compatibility fallback, and stale-result rejection. The 3D canvas renders on changes and stops while idle or outside the viewport. Export waits for pending artwork composition.

Run `node verify-artwork-queue.mjs` to validate queue replacement and failure handling.
