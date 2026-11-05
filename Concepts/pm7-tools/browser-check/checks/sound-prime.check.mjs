// SW-26: native page code rehearses before activation. Playwright evaluate()
// grants activation, so neither setup nor polling may use it for this check.
const probe=()=>{
 const R=window.__soundNativeProbe={events:0,starts:[],done:false};
 for(const type of ['pointerdown','keydown','touchstart'])document.addEventListener(type,e=>{if(e.isTrusted)R.events++;},true);
 for(const proto of [AudioScheduledSourceNode.prototype,AudioBufferSourceNode.prototype]){
  if(!Object.hasOwn(proto,'start'))continue;
  const real=proto.start;
  proto.start=function(...a){if(new Error().stack.includes('primePlayback'))R.starts.push({offline:this.context instanceof OfflineAudioContext,events:R.events,active:navigator.userActivation.hasBeenActive});return real.apply(this,a);};
 }
 window.addEventListener('load',()=>{
  if(!window.O55?.sound){R.wrapper=true;return;}
  const from=performance.now();
  const prepare=()=>{
   const S=O55.sound;
   if(!S.ctx){if(performance.now()-from<30000)setTimeout(prepare,25);else{R.error='no context';R.done=true;}return;}
   R.beforeActive=navigator.userActivation.hasBeenActive;
   S.prepare(S.ctx.sampleRate,S.kitFor('tap',{})).then(()=>{
    R.afterActive=navigator.userActivation.hasBeenActive;
    R.liveCallout=S.log.some(x=>x.event==='callout'&&x.played);R.done=true;
   }).catch(e=>{R.error=String(e);R.done=true;});
  };prepare();
 },{once:true});
};
export default async function(t){
 const target=new URL(t.args.page,'file://');target.searchParams.set('o55','off');target.searchParams.set('cb',String(Date.now()));
 const cdp=await t.page.context().newCDPSession(t.page),contexts=new Set();
 cdp.on('Runtime.executionContextCreated',({context})=>{if(context.auxData?.isDefault)contexts.add(context.id);});
 cdp.on('Runtime.executionContextDestroyed',({executionContextId})=>contexts.delete(executionContextId));
 cdp.on('Runtime.executionContextsCleared',()=>contexts.clear());
 await cdp.send('Runtime.enable');await cdp.send('Page.enable');
 if(String(t.args.sandbox)==='1')await t.openInSandbox(target.href);
 await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+probe.toString()+')()'});
 if(String(t.args.sandbox)==='1')await cdp.send('Page.reload');else await cdp.send('Page.navigate',{url:target.href});
 let R=null;const deadline=Date.now()+60000;
 while(Date.now()<deadline&&!R){
  for(const contextId of contexts){
   try{const x=await cdp.send('Runtime.evaluate',{expression:'JSON.stringify(window.__soundNativeProbe)',contextId,userGesture:false,returnByValue:true});const value=x.result.value&&JSON.parse(x.result.value);if(value?.done){R=value;break;}}catch(_){}
  }
  if(!R)await t.page.waitForTimeout(100);
 }
 await t.check('native rehearsal setup completed',!!R,JSON.stringify(R));
 if(R){
  await t.check('setup stayed free of trusted input and activation',R.events===0&&!R.beforeActive&&!R.afterActive,JSON.stringify(R));
  await t.check('offline prime synthesized before the first gesture',R.starts.length>0&&R.starts.every(x=>x.offline&&!x.active&&x.events===0),JSON.stringify(R));
  await t.check('offline rehearsal emitted no live callout',!R.liveCallout,JSON.stringify(R));
 }
 await cdp.detach();
}
