// IndexedDB holds artwork and file handles without localStorage's small quota.
export function createProjectStore(){
 let database;
 const open=()=>database??=new Promise((resolve,reject)=>{const request=indexedDB.open('pressroom-projects',1);request.onupgradeneeded=()=>request.result.createObjectStore('projects');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
 return {
  async read(){const db=await open();return new Promise((resolve,reject)=>{const request=db.transaction('projects').objectStore('projects').get('active');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})},
  async write(value){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(value,'active');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
 };
}
export class ProjectAutosave{
 constructor({store=createProjectStore(),onStatus=()=>{}}={}){this.store=store;this.onStatus=onStatus;this.handle=null;this.queue=Promise.resolve();this.revision=0}
 async restore(){const record=await this.store.read();this.handle=record?.handle||null;return record}
 save(state,payload){
  const revision=++this.revision,handle=this.handle,record={...structuredClone({state,payload}),handle,updatedAt:Date.now()};
  this.onStatus('Saving…');
  const task=this.queue.catch(()=>{}).then(async()=>{
   let browserSaved=false,fileSaved=false,fileError=false;
   try{await this.store.write(record);browserSaved=true}catch{}
   if(handle){try{if(await handle.queryPermission({mode:'readwrite'})==='granted'){const writer=await handle.createWritable();try{await writer.write(JSON.stringify(payload));await writer.close();fileSaved=true}catch(error){await writer.abort().catch(()=>{});throw error}}}catch{fileError=true}}
   if(revision===this.revision)this.onStatus(fileSaved?'Saved to file':browserSaved?(handle?(fileError?'Saved in browser · file save failed':'Saved in browser · reconnect file'):'Saved in browser'):'Save failed · use Save project');
   return {browserSaved,fileSaved};
  });
  this.queue=task;return task;
 }
}
