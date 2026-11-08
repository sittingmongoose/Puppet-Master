// Activity Detail layout across shared looks, host widths and reduced motion.
import {LOOKS} from '../browser-check.config.mjs';
export default async function(t){
 const f=await t.app.open();
 // FO92-N1 (opus-recheck-look8, look8b): History's resize separator's values follow the chat column. Since FO-92 a
 // narrow flip (the column crossing 560 px) no longer re-renders the chat, and a column or window resize never did: after
 // each change the separator must already carry what a render writes (aria-valuemax, aria-valuenow). The work clock is
 // held (PM56_DEMO.setWorkStep) and every render counted (the afterRender slot). The hold stops the primary work record
 // only (other running records keep the 500 ms tick), so a change a render followed is made again from 9 px away, up to
 // four times; one still followed by a render (the drawer closing or coming back) is not judged, and each group must
 // still judge enough changes, so no redraw can refresh the values for the build under test. Floating (open), the column aimed at host widths across 560 both ways and
 // at plain widths; pinned, where the separator is what screen readers reach (the pinned column stops at about 639
 // px, so plain widths only); then window resizes while pinned, the column wide and the window narrowed under it, and
 // each window size with the column aimed at 700 again (opus-recheck-look8b's). Before Activity opens (its reserved
 // width keeps the column wide). Fails 30a9756711 (3c4236e2a9.. on the flips; c4ba49b137 on the plain and window
 // resizes), every run.
 if(!t.args.shortOnly){
  await t.viewport(1920,900);
  await f.evaluate(()=>{PMW.chatCol.show();PMW.chatCol.setWidth(760);});
  await f.waitForTimeout(400);
  const held=await f.evaluate(async()=>{const s=PM56_DEMO.getState();PM56_DEMO.setWorkStep(s.work.step||0);
   window.__fo92n1=0;if(!window.__fo92n1Slot){window.__fo92n1Slot=true;window.PM56_EXT.slot('afterRender',(c,i)=>{if(i&&(i.phase==='overlay'||i.phase==='app'))window.__fo92n1++;});}
   await new Promise(r=>setTimeout(r,1200));const settling=window.__fo92n1;window.__fo92n1=0;
   await new Promise(r=>setTimeout(r,3000));const q=PM56_DEMO.getState();return {running:!!q.work.running,rendersAfterHold:settling,rendersIn3s:window.__fo92n1};});
  await t.check('FO92-N1 fixture: the work clock held (the primary work record stopped; renders in 3 s logged)',!held.running,JSON.stringify(held));
  const drawer=(want)=>f.evaluate(async want=>{
   const up=()=>!!document.querySelector('[data-ph-resize]')&&(document.body.dataset.phDrawer||'')===want;
   if(want==='open'){const b=document.querySelector('#pmRoot [data-action="toggle-history"]');if(b&&!/^(open|pinned)$/.test(document.body.dataset.phDrawer||''))b.click();}
   else if(want==='pinned'){const b=document.querySelector('[data-action="ph-toggle-pin"], [data-action="pin-history"]');if(b)b.click();}
   /* (history.js paints the drawer 'shut' for a frame, then 'open') */
   for(let i=0;i<120&&!up();i++)await new Promise(r=>requestAnimationFrame(r));
   await new Promise(r=>setTimeout(r,400));
   return {drawer:document.body.dataset.phDrawer||'',handle:!!document.querySelector('[data-ph-resize]')};},want);
  /* one change (the column aimed so the host width reads about `want`, the column has padding of its own; or the window
     already resized), then its read, a render's, and the renders between */
  const step=(want,kind)=>f.evaluate(async([want,kind])=>{
   const H=window.PM56_HOST, two=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))), settle=async()=>{await two();await new Promise(r=>setTimeout(r,300));await two();};
   const h=()=>document.querySelector('[data-ph-resize]'),read=()=>{const e=h();return e?[e.getAttribute('aria-valuemax'),e.getAttribute('aria-valuenow')]:null;};
   const row=(want,renders)=>{const before=read();window.PM56_EXT.ctx().renderOverlays();const render=read();return {kind,want,host:Math.round(H.width()),narrow:H.width()<560,mode:document.body.dataset.phDrawer||'',renders,before,render};};
   const aim=async w=>{let set=w;for(let i=0;i<4;i++){PMW.chatCol.setWidth(set);await two();set+=w-H.width();}await settle();};
   const out=[];
   /* (after a window resize, counted since before it: the window's own change, read once its renders have stopped for
      1 s, up to 3 s; then the column aimed again from there) */
   if(kind==='window'){await settle();const t0=performance.now();let last=window.__fo92n1,since=t0;
    while(performance.now()-t0<3000&&performance.now()-since<1000){await new Promise(r=>setTimeout(r,100));if(window.__fo92n1!==last){last=window.__fo92n1;since=performance.now();}}
    out.push(row(null,window.__fo92n1));}
   let r=null,tries=0;
   for(;tries<4;tries++){if(tries)await aim(want+9);window.__fo92n1=0;await aim(want);r=row(want,window.__fo92n1);if(r.renders===0)break;}
   r.tries=Math.min(tries+1,4);out.push(r);
   return out;
  },[want,kind||'column']).then(rows=>(kind==='window'?rows:rows[0]));
  const same=r=>!!(r.before&&r.render&&r.before.join()===r.render.join());
  /* judged: the steps with a separator and no render after the change; of those, the ones whose values changed (a
     render writes other values than the step before's render did) must number at least `min`, flips both ways among
     them where asked */
  const judge=async(name,rows,flips,min)=>{
   const ok=r=>!!(r.before&&r.render)&&r.renders===0;
   const changed=rows.filter((r,i)=>ok(r)&&(i===0||!rows[i-1].render||rows[i-1].render.join()!==r.render.join()));
   const flipped=(dir)=>rows.some((r,i)=>i>0&&ok(r)&&r.narrow===dir&&rows[i-1].narrow!==dir);
   t.log(`FO92-N1 ${name} `+JSON.stringify(rows));
   await t.check(`FO92-N1 ${name}: fixture: ${min} or more changes judged with no render after them${flips?', narrow flips both ways among them':''}`,changed.length>=min&&(!flips||(flipped(true)&&flipped(false))),
    JSON.stringify({judged:rows.filter(ok).length,changed:changed.length,skipped:rows.filter(r=>!ok(r)).map(r=>({want:r.want,host:r.host,mode:r.mode,renders:r.renders}))}));
   await t.check(`FO92-N1 ${name}: the History separator carries what a render writes after each change${flips?', narrow flips both ways included':''}`,rows.filter(ok).every(same),JSON.stringify(rows.filter(r=>ok(r)&&!same(r))));
  };
  const o1=await drawer('open');
  await t.check('FO92-N1 fixture: History drawer floating (open), its separator drawn',o1.handle&&o1.drawer==='open',JSON.stringify(o1));
  const fl=[];for(const w of [530,600,545,580,640,520,700]) fl.push(await step(w));
  await judge('floating, column resizes',fl,true,5);
  await step(900);
  const o2=await drawer('pinned');
  await t.check('FO92-N1 fixture: History drawer pinned, its separator drawn',o2.handle&&o2.drawer==='pinned',JSON.stringify(o2));
  const pn=[];for(const w of [900,700,640,760,1000,680,1100,650]) pn.push(await step(w));
  await judge('pinned, column resizes',pn,false,5);
  await step(1100);
  const win=[];for(const [w,h] of [[1700,900],[1500,900],[1390,900],[1180,900],[1024,768],[1920,900]]){await f.evaluate(()=>{window.__fo92n1=0;});await t.viewport(w,h);win.push(...await step(700,'window'));}
  await judge('pinned, window resizes (each window size, then the column aimed at 700 there)',win,false,2);
  await f.evaluate(async()=>{const b=document.querySelector('[data-action="ph-toggle-pin"], [data-action="unpin-history"]');if(b&&(document.body.dataset.phDrawer||'')==='pinned')b.click();await new Promise(r=>setTimeout(r,400));
   const c=document.querySelector('#pmRoot [data-action="toggle-history"]');if(c&&/^(open|pinned)$/.test(document.body.dataset.phDrawer||''))c.click();await new Promise(r=>setTimeout(r,400));PMW.chatCol.setWidth(760);});
 }
 for(const look of LOOKS){
  await t.app.look(look);
  for(const reducedMotion of ['reduce','no-preference']){
   await t.emulate({reducedMotion});
   for(const [w,h] of (t.args.shortOnly?[[1280,500]]:[...[740,860,1024,1280,1390,1920].map(w=>[w,900]),[1280,500]])){
    await t.viewport(w,h);
    await f.evaluate(()=>{PMW.chatCol.setWidth(760);PM56_DEMO.openActivity('subagents','agent-schema');});
    const r=await f.evaluate(()=>({w:document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().width,cover:!!document.querySelector('#pmRoot .activity-panel.cover')}));
    await t.check(`${look} ${reducedMotion} ${w}x${h} messages >=360 or covered`,r.cover||r.w>=360);
   }
  }
 }
}
