// Snapshots share immutable artwork strings instead of serializing image data.
export function equalState(a,b){
  if(a===b)return true;
  if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
  const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&equalState(a[key],b[key]));
}
export class EditHistory {
  constructor(limit=50){this.limit=limit;this.entries=[];this.index=-1}
  get canUndo(){return this.index>0}
  get canRedo(){return this.index<this.entries.length-1}
  push(state){if(equalState(this.entries[this.index],state))return false;this.entries.splice(this.index+1);this.entries.push(state);if(this.entries.length>this.limit)this.entries.shift();this.index=this.entries.length-1;return true}
  undo(){if(!this.canUndo)return null;return this.entries[--this.index]}
  redo(){if(!this.canRedo)return null;return this.entries[++this.index]}
}
