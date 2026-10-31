// One active job and one replaceable pending job keep rapid edits from filling a worker queue.
export function createArtworkRenderer() {
  if(!globalThis.Worker || !globalThis.OffscreenCanvas || !globalThis.createImageBitmap) return null;
  let worker;
  try {worker = new Worker(new URL('./artwork-worker.js',import.meta.url),{type:'module'})} catch {return null}
  let active=null, pending=null, serial=0, failed=false;
  function start(job) {active=job;worker.postMessage({...job.data,id:++serial})}
  function rejectAll(error) {failed=true;active?.reject(error);pending?.reject(error);active=pending=null;worker.terminate()}
  worker.onerror=()=>rejectAll(new Error('Artwork worker unavailable'));
  worker.onmessage=({data})=>{const job=active;active=null;if(data.error)job?.reject(new Error(data.error));else job?.resolve(data);if(pending){const next=pending;pending=null;start(next)}};
  return {
    render(data) {return new Promise((resolve,reject)=>{if(failed)return reject(new Error('Artwork worker unavailable'));const job={data,resolve,reject};if(active){pending?.resolve(null);pending=job}else start(job)})},
    dispose(){rejectAll(new Error('Artwork renderer disposed'))}
  };
}
