// SW-26: native page code rehearses before activation. Playwright evaluate()
// grants activation, so neither setup nor polling may use it for this check.
const probe=()=>{
 const R=window.__soundNativeProbe={events:0,starts:[],done:false,framed:window!==window.top};
 try{localStorage.getItem('native-sound-surface');R.storageBlocked=false;}catch(e){R.storageBlocked=e.name==='SecurityError';}
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
 const sandbox=String(t.args.sandbox)==='1';
 if(sandbox)await t.openInSandbox(target.href);
 // Opaque app frames can be separate Chrome targets (OOPIFs). Observe the
 // actual app target so Runtime contexts and fresh-document hooks reach it.
 const context=t.page.context();
 const cdp=await context.newCDPSession(sandbox?t.root:t.page).catch(e=>{
  if(sandbox&&String(e.message).includes('part of the parent frame'))return context.newCDPSession(t.page);
  throw e;
 }),contexts=new Set();
 cdp.on('Runtime.executionContextCreated',({context})=>{if(context.auxData?.isDefault)contexts.add(context.id);});
 cdp.on('Runtime.executionContextDestroyed',({executionContextId})=>contexts.delete(executionContextId));
 cdp.on('Runtime.executionContextsCleared',()=>contexts.clear());
 await cdp.send('Runtime.enable');await cdp.send('Page.enable');
 await cdp.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+probe.toString()+')()'});
 // Navigate the app target only; the approved wrapper and its flags stay.
 const {frameTree}=await cdp.send('Page.getFrameTree');
 // In-process iframes share their parent's CDP target; choose the actual app
 // frame in that tree too, never navigate the wrapper in its place.
 const findApp=tree=>(tree.childFrames||[]).map(findApp).find(Boolean)||(new URL(tree.frame.url,'file://').pathname===target.pathname?tree.frame:null);
 const app=findApp(frameTree);
 if(!app)throw new Error('native sound probe cannot find the requested app frame');
 await cdp.send('Page.navigate',{url:target.href,frameId:app.id});
 let R=null;const deadline=Date.now()+60000;
 while(Date.now()<deadline&&!R){
  for(const contextId of contexts){
   try{const x=await cdp.send('Runtime.evaluate',{expression:'JSON.stringify(window.__soundNativeProbe)',contextId,userGesture:false,returnByValue:true});const value=x.result.value&&JSON.parse(x.result.value);if(value?.done){R=value;break;}}catch(_){}
  }
  if(!R)await t.page.waitForTimeout(100);
 }
 t.log('native sound rehearsal probe: '+JSON.stringify(R));
 await t.check('native rehearsal setup completed',!!R,JSON.stringify(R));
 if(R){
  await t.check('native observation kept the requested surface',sandbox?R.framed&&R.storageBlocked:!R.framed&&!R.storageBlocked,JSON.stringify(R));
  await t.check('setup stayed free of trusted input and activation',R.events===0&&!R.beforeActive&&!R.afterActive,JSON.stringify(R));
  await t.check('offline prime scheduled a source before the first gesture',R.starts.length>0&&R.starts.every(x=>x.offline&&!x.active&&x.events===0),JSON.stringify(R));
  await t.check('offline rehearsal emitted no live callout',!R.liveCallout,JSON.stringify(R));
 }
 await cdp.detach();
}
