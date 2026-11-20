// FO-165: visible frame positions only. Instrumented builds are diagnostic only; no product flag or hook ships.
import fs from 'node:fs/promises';
import { LOOKS } from '../browser-check.config.mjs';
import {setLookBySetting, guardPaintedLook, setMotionMedia, setMotionApp} from '../helpers/settings-look.mjs';
const SW = '[data-continuous-workspace-body="web"] .toggle[data-setting="web.providers.web-search-enable"]';
const arm = ({sw, ms}) => {
 const el = document.querySelector(sw), sec = el.closest('[id^="section-"]');
 const own = el.closest('.setting-row'), rows = [...sec.querySelectorAll('.setting-row')];
 const below = rows[rows.indexOf(own)+1] || own;
 const sc = el.closest('#settings-document');
 const S = window.__fo165 = {frames:[], paths:[], shifts:[]};
 const read = (path) => {
  const v={t:performance.now(),sw:el.getBoundingClientRect().top,sec:sec.getBoundingClientRect().top,below:below.getBoundingClientRect().top,scroll:sc.scrollTop,connected:el.isConnected,on:el.classList.contains('on')};
  if(path) S.paths.push({...v,path}); else S.frames.push(v);
 };
 window.__fo165trace=(path)=>read(path);
 const observer = new PerformanceObserver(l=>S.shifts.push(...l.getEntries().map(e=>({t:e.startTime,value:e.value,input:e.hadRecentInput,sources:(e.sources||[]).map(s=>({node:s.node?.id||s.node?.className,previous:s.previousRect.toJSON(),current:s.currentRect.toJSON()}))}))));
 observer.observe({type:'layout-shift', buffered:false});
 const ch=new MessageChannel(); ch.port1.onmessage=()=>read(); read();
 const start=performance.now();
 window.__fo165done=new Promise(resolve=>{
  const tick=()=>{ch.port2.postMessage(0); if(performance.now()-start<ms) requestAnimationFrame(tick); else ch.port2.postMessage('end');};
  ch.port1.onmessage=e=>{read(); if(e.data==='end'){observer.disconnect();ch.port1.close();ch.port2.close();window.__fo165trace=null;resolve();}};
  requestAnimationFrame(tick);
 });
};
export const tests={
 async 'FO-165 declared real input save matrix'(t){
  const surface=String(t.args.sandbox)==='1'?'sandbox':'normal';
  const looks=t.args.looks?String(t.args.looks).split(','):(t.args.matrix?LOOKS:['basic-dark']);
  const sizes=(t.args.sizes?String(t.args.sizes).split(','):(t.args.matrix?['1920x1080','1280x900']:['1920x1080'])).map(v=>v.split('x').map(Number));
  const motions=t.args.motion?String(t.args.motion).split(','):(t.args.matrix?['no-preference','reduce','app']:['no-preference']);
  const reps=Number(t.args.reps || 1);
  const records=[];
  t.log(`Chrome version ${t.page.context().browser().version()}`);
  t.log(`DECLARED ${looks.length*sizes.length*motions.length*4*reps} cells ${surface}; real click and keyboard Space; ${await t.page.evaluate(()=>navigator.userAgent)}`);
  for(const look of looks) for(const [w,h] of sizes) for(const motion of motions){
   await setMotionMedia(t,motion); await t.viewport(w,h);
   const f=await t.app.open({sandbox:surface==='sandbox'});
   await f.locator('#tab-settings').click(); await t.settle();
   if(look!=='basic-dark') await setLookBySetting(t,f,look); await setMotionApp(t,f,motion);
   await f.evaluate(()=>PM51.go('ai','web'));
   await f.waitForSelector('[data-continuous-workspace-body="web"][data-workspace-mounted="true"]');
   await t.settle(); await t.page.waitForTimeout(900); // arrival only, before measured input
   for(let rep=1;rep<=reps;rep++) for(const input of ['click','Space']) for(const step of ['off','on']){
    const tag=`${surface} ${look} ${w}x${h} ${motion} ${input} ${step} rep${rep}`;
    if(!await guardPaintedLook(t,f,look,tag)) continue;
    await f.locator(SW).scrollIntoViewIfNeeded();
    if(input==='Space') await f.locator(SW).focus();
    await f.evaluate(arm,{sw:SW,ms:1100});
    if(input==='click') await f.locator(SW).click(); else await f.locator(SW).press('Space');
    await f.evaluate(()=>window.__fo165done);
    const r=await f.evaluate(()=>window.__fo165);
    const span=k=>Math.max(...r.frames.map(v=>v[k]))-Math.min(...r.frames.map(v=>v[k]));
    await t.check(`${tag}: the painted switch state changes`,r.frames[0].on!==r.frames.at(-1).on);
    const moves={sw:span('sw'),sec:span('sec'),below:span('below')};
    records.push({tag,moves,...r});
    t.log(`${tag} ${JSON.stringify(moves)} paths ${r.paths.map(v=>v.path).join(',')}`);
    await t.check(`${tag}: switch and next row stay within 1px every sampled frame`,moves.sw<=1&&moves.below<=1&&r.frames.every(v=>v.connected),JSON.stringify(moves));
   }
   await t.app.resetLayout();
   if(t.args.traceOut) await fs.writeFile(String(t.args.traceOut),JSON.stringify(records,null,2));
  }
 }
};
