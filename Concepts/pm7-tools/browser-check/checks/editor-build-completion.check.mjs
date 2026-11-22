import {writeFileSync} from 'node:fs';import {join} from 'node:path';
import {localBrowserSlots} from '../helpers/browser-slots.mjs';
export const EDITOR_BUILD_WAIT_MS = 60000;

export function instrument(){
 window.__ownerIdle=[];window.__inputs=[];for(const type of ['pointermove','pointerdown','keydown','wheel','touchstart'])window.addEventListener(type,e=>window.__inputs.push({type,at:performance.now(),stamp:e.timeStamp,trusted:e.isTrusted}),{capture:true,passive:true});
 const generator = Object.getPrototypeOf(Object.getPrototypeOf((function* () {})()));
 let busy;
 Object.defineProperty(window,'PM_BUSY',{configurable:true,get:()=>busy,set(v){
  busy=v;
  let idle;
  Object.defineProperty(v,'idle',{configurable:true,get:()=>idle,set(fn){
   idle=function(cb,timeout,opts){
    const rec={name:cb.name,asked:performance.now(),timeout,opts};
    window.__ownerIdle.push(rec);
    return fn.call(this,function(dl){
     rec.ran=performance.now();
     rec.lastInput=window.__inputs.at(-1)?.at;
     const next=generator.next;
     if(cb.name==='build'){
      performance.mark('sw01-editor-phase');
      rec.complete=false;
      // The sheet mounts before all the yields. Its generator returns the prepared handle at completion.
      generator.next=function(...args){
       const step=next.apply(this,args);
       if(step.done && step.value?.el?.matches?.('.pmed-cz.pmed-prepared')) rec.complete=true;
       return step;
      };
     }
     try{return cb(dl);}
     finally{
      if(cb.name==='build') generator.next=next;
      rec.done=performance.now();
     }
    },timeout,opts);
   };
  }});
 }});
}
async function owners(t){
 const trace=await t.window.context().newCDPSession(t.window);
 await trace.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing',transferMode:'ReturnAsStream'});
 await t.page.context().addInitScript(instrument);
 let moving=true,k=0;const moves=(async()=>{while(moving){await t.window.mouse.move(200+(k%30)*9,140+(k%8)*8).catch(()=>{});k++;await new Promise(r=>setTimeout(r,35));}})();
 let f;try{f=await t.app.open();await t.window.waitForTimeout(3600);}finally{moving=false;await moves;}
 const during=await f.evaluate(()=>({jobs:__ownerIdle,inputs:__inputs.length,last:__inputs.at(-1),prepared:!!document.querySelector('.pmed-prepared'),audio:!!O55.sound.ctx}));
 const completed=await f.waitForFunction(()=>__ownerIdle.some(j=>j.complete),null,{timeout:EDITOR_BUILD_WAIT_MS}).then(()=>true,e=>{
  if(e.name!=='TimeoutError') throw e;
  return false;
 });
 const after=await f.evaluate(()=>({jobs:__ownerIdle,inputs:__inputs.length,last:__inputs.at(-1),prepared:!!document.querySelector('.pmed-prepared'),audio:!!O55.sound.ctx,muted:O55.sound.muted,at:performance.now()}));
 const complete=new Promise(r=>trace.once('Tracing.tracingComplete',r));await trace.send('Tracing.end');const {stream}=await complete;let data='';for(;;){const chunk=await trace.send('IO.read',{handle:stream});data+=chunk.data;if(chunk.eof)break;}await trace.send('IO.close',{handle:stream});writeFileSync(join(t.run.dir,'tasks.trace.json'),data);await trace.detach();const events=JSON.parse(data).traceEvents;const tasks=events.filter(e=>e.name==='sw01-editor-phase').flatMap(m=>events.filter(e=>e.name==='FireIdleCallback'&&e.pid===m.pid&&e.tid===m.tid&&e.ts<=m.ts&&m.ts<e.ts+(e.dur||0)).map(e=>e.dur/1000));writeFileSync(join(t.run.dir,'editor-task-durations.json'),JSON.stringify(tasks));await t.check('traced full editor idle tasks stay under 30 ms',tasks.length===10&&tasks.every(ms=>ms<=30),JSON.stringify(tasks));
 writeFileSync(join(t.run.dir,'owner-idle.json'),JSON.stringify({during,after},null,2));
 await t.check('idle editor returns its prepared handle',completed,completed ? undefined :
  `no completed handle within ${EDITOR_BUILD_WAIT_MS / 1000} s, ${after.jobs.filter(j=>j.name==='build'&&j.done).length} of 10 callbacks finished, ${await localBrowserSlots({ host: t.run.host || null, attached: t.run.session?.kind === 'cdp' })}`);
 for(const name of ['build']){
  const a=during.jobs.filter(j=>j.name===name),b=after.jobs.filter(j=>j.name===name);
  await t.check(name+' requested at the actual owner',a.length>0,JSON.stringify(a));
  await t.check(name+' deferred through real pointer motion',a.length>0&&a.every(j=>!j.ran),JSON.stringify(a));
  await t.check(name+' runs once the pointer is still',b.length>0&&b.every(j=>j.ran&&j.ran-j.lastInput>=600),JSON.stringify(b));
 }
 await t.check('prepared editor cache and audio exist after stillness',after.prepared&&after.audio,JSON.stringify({prepared:after.prepared,audio:after.audio,muted:after.muted}));
 await t.equal('all ten construction phases completed',after.jobs.filter(j=>j.name==='build'&&j.done).length,10);
 await t.check('editor construction phases stay under 30 ms',after.jobs.filter(j=>j.name==='build'&&j.done).every(j=>j.done-j.ran<=30),JSON.stringify(after.jobs.filter(j=>j.name==='build').map(j=>j.done-j.ran)));
 // A click-demanded opening can build synchronously before an idle preparation; optional cache only.
 await f.evaluate(()=>PM_EDITOR_CUSTOMIZE.open({from:'settings'}));
 await f.waitForFunction(()=>!!document.querySelector('.pmed-cz:not(.pmed-prepared):not([aria-hidden="true"])'));
 await t.painted('.pmed-cz');
}
export const tests={
 'demand completes an interrupted construction':async t=>{
  await t.window.context().addInitScript(instrument);
  const f=await t.app.open();
  await f.waitForFunction(()=>__ownerIdle.some(j=>j.name==='build'&&j.done),null,{timeout:EDITOR_BUILD_WAIT_MS});
  await f.evaluate(()=>PM_EDITOR_CUSTOMIZE.open({from:'settings'}));
  await t.painted('.pmed-cz');
  await t.equal('demand leaves one sheet',await f.locator('.pmed-cz').count(),1);
  const before=await f.locator('.pmed-cz [data-out="fontSize"]').textContent();
  await f.locator('.pmed-cz [data-step="0.5"]').click();
  await t.check('editor control changes the font size',await f.locator('.pmed-cz [data-out="fontSize"]').textContent()!==before);
  await f.locator('.pmed-cz [data-act="close"]').last().click();
  await f.waitForFunction(()=>!!document.querySelector('.pmed-cz.pmed-prepared'));
  await t.equal('close retains one reusable sheet',await f.locator('.pmed-cz').count(),1);
 },
 'actual owner deferral and completion':owners,
 'early demanded editor and audio work':async t=>{
  let moving=true,k=0;const motion=(async()=>{while(moving){await t.window.mouse.move(160+(k++%30)*8,150).catch(()=>{});await new Promise(r=>setTimeout(r,35));}})();
  let f;try{
   f=await t.app.open();
   const state=await f.evaluate(()=>{const before={prepared:!!document.querySelector('.pmed-prepared'),audio:!!O55.sound.ctx};PM_EDITOR_CUSTOMIZE.open({from:'settings'});const unlocked=O55.sound.unlock();return {before,unlocked,audio:!!O55.sound.ctx};});
   writeFileSync(join(t.run.dir,'early-demand.json'),JSON.stringify(state,null,2));
   await t.check('editor and audio began with their idle caches deferred',!state.before.prepared&&!state.before.audio,JSON.stringify(state));
   await t.check('sound can construct and unlock on demand',state.unlocked&&state.audio,JSON.stringify(state));
   await f.waitForFunction(()=>!!document.querySelector('.pmed-cz:not(.pmed-prepared):not([aria-hidden="true"])'));
   await t.painted('.pmed-cz');
  }finally{moving=false;await motion;}
 }
};
