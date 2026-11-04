// SW-26: the advertised offline rehearsal must really synthesize before any gesture.
export default async function(t){
 await t.page.addInitScript(()=>{
  window.__primeStarts=[];window.__primeGestures=0;
  document.addEventListener('pointerdown',e=>{if(e.isTrusted)window.__primeGestures++;},true);
  const real=AudioScheduledSourceNode.prototype.start;
  AudioScheduledSourceNode.prototype.start=function(...a){const stack=new Error().stack;if(stack.includes('primePlayback'))window.__primeStarts.push({offline:this.context instanceof OfflineAudioContext,gestures:window.__primeGestures});return real.apply(this,a);};
 });
 const f=await t.app.open();
 await f.waitForFunction(()=>!!window.O55?.sound?.ctx,null,{timeout:30000});
 await f.evaluate(()=>O55.sound.prepare(O55.sound.ctx.sampleRate,'basic'));
 const starts=await f.evaluate(()=>window.__primeStarts);
 await t.check('offline prime synthesized before the first gesture',starts.some(x=>x.offline&&x.gestures===0),JSON.stringify(starts));
 await t.check('every rehearsed source stayed offline',starts.length>0&&starts.every(x=>x.offline),JSON.stringify(starts));
 await t.check('offline rehearsal emitted no live callout',await f.evaluate(()=>!O55.sound.log.some(x=>x.event==='callout'&&x.played)), 'private entry and bookkeeping stay out of the live log');
}
