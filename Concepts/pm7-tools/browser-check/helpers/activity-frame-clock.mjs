// Samples Chrome compositor PNG frames, not JS callbacks or a CPU video recorder.
// ScreencastFrameMetadata.timestamp is the frame-swap epoch time. Decode only
// after capture, so the pixel comparison cannot delay the measured paint.
import {decodePng,coverTitleClassifier} from './activity-cover-pixels.mjs';
export async function beginActivityFrameClock(page){
 const client=await page.context().newCDPSession(page);
 const frames=[];
 const reference=await client.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
 const beforePng=Buffer.from(reference.data,'base64');
 const onFrame=event=>{
  client.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});
  frames.push({wall:event.metadata.timestamp*1000,metadata:event.metadata,png:Buffer.from(event.data,'base64')});
 };
 client.on('Page.screencastFrame',onFrame);
 await client.send('Page.startScreencast',{format:'png',everyNthFrame:1});
 return {
  frames,beforePng,
  async stop(){await client.send('Page.stopScreencast');client.off('Page.screencastFrame',onFrame);await client.detach();},
  analyze(input,stage){
   const ordered=frames.filter(f=>Number.isFinite(f.wall)).sort((a,b)=>a.wall-b.wall);
   const before={png:beforePng};
   const after=ordered.at(-1);
   if(!before||!after)throw Error('No pre-input and final compositor frames');
   const model=coverTitleClassifier(decodePng(before.png),decodePng(after.png),stage);
   const samples=ordered.filter(f=>f.wall>=input.wall).map(f=>({wall:f.wall,elapsed:f.wall-input.wall,score:model.score(decodePng(f.png))}));
   const index=samples.findIndex(f=>f.score>=.2);
   const first=samples[index];
   if(!first)throw Error('No painted cover title in compositor frames');
   const previousMs=index>0?samples[index-1].elapsed:0;
   const verdict=first.elapsed<=500?'on-time':previousMs>=500?'late':'boundary-unresolved';
   return {input,elapsed:first.elapsed,previousMs,verdict,wall:first.wall,titlePixels:model.pixels,samples};
  }
 };
}
