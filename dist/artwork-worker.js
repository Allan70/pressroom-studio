import {paintText} from './text-layout.js';
let source = null, image = null;
self.onmessage = async ({data}) => {
  try {
    if(data.source !== source) {
      image?.close(); image = null; source = data.source;
      if(source) image = await createImageBitmap(await (await fetch(source)).blob());
    }
    const canvas = new OffscreenCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    let overflow = false;
    if(data.hasArt) {
      ctx.translate(data.width/2, data.height/2); ctx.scale(data.scale, data.scale);
      if(data.mode === 'text') overflow = paintText(ctx, data.text, data.style, {width:data.width,height:data.height,frameWidthMm:data.frameWidth,color:data.color}).overflow;
      else if(image) {const r=Math.min(data.width/image.width,data.height/image.height);ctx.drawImage(image,-image.width*r/2,-image.height*r/2,image.width*r,image.height*r)}
    }
    const bitmap = canvas.transferToImageBitmap();
    self.postMessage({id:data.id,bitmap,overflow}, [bitmap]);
  } catch(error) {self.postMessage({id:data.id,error:String(error)})}
};
