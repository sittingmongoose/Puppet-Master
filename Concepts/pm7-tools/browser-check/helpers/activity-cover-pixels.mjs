// Detect the cover's existing title glyphs in native PNG frames. The reference
// images come from before input and the settled cover; no product marker/mask.
import {decodePng} from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
export {decodePng};
const light=(im,x,y)=>{
 if(x<0||y<0||x>=im.width||y>=im.height)return 0;
 const p=(y*im.width+x)*4;
 return .2126*im.data[p]+.7152*im.data[p+1]+.0722*im.data[p+2];
};
const near=(im,x,y)=>{
 let n=0;
 for(let dy=-4;dy<=4;dy++)for(let dx=-1;dx<=1;dx++)n=Math.max(n,light(im,x+dx,y+dy));
 return n;
};
export function coverTitleClassifier(before,after,stage){
 const background=im=>{
  const values=[];
  for(let y=Math.round(stage.y+24);y<stage.y+31;y++)for(let x=Math.round(stage.x+154);x<stage.x+162;x++)values.push(light(im,x,y));
  values.sort((a,b)=>a-b);return values[Math.floor(values.length/2)];
 };
 const beforeBackground=background(before);
 const points=[];
 for(let y=Math.round(stage.y+8);y<stage.y+35;y++)for(let x=Math.round(stage.x+40);x<stage.x+152;x++){
  const end=light(after,x,y),start=near(before,x,y);
  if(end>=150&&start<75&&end-start>=45)points.push({x,y,start});
 }
 if(points.length<20)throw Error('Insufficient distinct title pixels: '+points.length);
 return {
  pixels:points.length,
  score(frame){const bg=background(frame);return points.filter(p=>near(frame,p.x,p.y)-bg>p.start-beforeBackground+12).length/points.length;},
  visible(frame){return this.score(frame)>=.2;}
 };
}
