// SW-26: the advertised offline rehearsal must really synthesize before any gesture.
export default async function(t){
 await t.page.addInitScript(()=>{
  window.__primeStarts=[];window.__primeGestures=0;
  for(const type of ['pointerdown','keydown','touchstart'])document.addEventListener(type,e=>{if(e.isTrusted)window.__primeGestures++;},true);
  for(const proto of [AudioScheduledSourceNode.prototype,AudioBufferSourceNode.prototype]){
   if(!Object.hasOwn(proto,'start'))continue;
   const real=proto.start;
   proto.start=function(...a){const stack=new Error().stack;if(stack.includes('primePlayback'))window.__primeStarts.push({offline:this.context instanceof OfflineAudioContext,gestures:window.__primeGestures});return real.apply(this,a);};
  }
 });
 const target=new URL(t.args.page,'file://');target.searchParams.set('o55','off');target.searchParams.set('cb',String(Date.now()));
 if(String(t.args.sandbox)==='1')await t.openInSandbox(target.href);else await t.goto(target.href);
 const f=t.root||t.page;
 await f.waitForFunction(()=>!!window.O55?.sound?.ctx&&window.PM56_PORT?.ready,null,{timeout:30000});
 const before=await f.evaluate(()=>({events:window.__primeGestures,active:navigator.userActivation.hasBeenActive}));
 await t.check('setup has no trusted gesture or sticky activation',before.events===0&&!before.active,JSON.stringify(before));
 await f.evaluate(()=>O55.sound.prepare(O55.sound.ctx.sampleRate,O55.sound.kitFor('tap',{})));
 const starts=await f.evaluate(()=>window.__primeStarts);
 await t.check('offline prime synthesized before the first gesture',starts.some(x=>x.offline&&x.gestures===0),JSON.stringify(starts));
 await t.check('every rehearsed source stayed offline',starts.length>0&&starts.every(x=>x.offline),JSON.stringify(starts));
 await t.check('offline rehearsal emitted no live callout',await f.evaluate(()=>!O55.sound.log.some(x=>x.event==='callout'&&x.played)), 'private entry and bookkeeping stay out of the live log');
}
