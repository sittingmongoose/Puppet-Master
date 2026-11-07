// Activity Detail layout across shared looks, host widths and reduced motion.
import {LOOKS} from '../browser-check.config.mjs';
export default async function(t){
 const f=await t.app.open();
 // FO92-N1 (opus-recheck-look8): with History's drawer open, its resize separator's values follow the chat column. Since
 // FO-92 a narrow flip (the column crossing 560 px) no longer re-renders the chat, and a column resize never did: after each
 // change the separator must already carry what a render writes (aria-valuemax, aria-valuenow). Before Activity opens (its
 // reserved width keeps the column wide). Fails 3c4236e2a9..30a9756711 on the flips; c4ba49b137 on the plain resize.
 if(!t.args.shortOnly){
  await t.viewport(1920,900);
  await f.evaluate(()=>{PMW.chatCol.show();PMW.chatCol.setWidth(760);});
  const opened=await f.evaluate(async()=>{const b=document.querySelector('#pmRoot [data-action="toggle-history"]');if(b)b.click();
   /* (history.js paints the drawer 'shut' for a frame, then 'open') */
   const up=()=>!!document.querySelector('[data-ph-resize]')&&/^(open|pinned)$/.test(document.body.dataset.phDrawer||'');
   for(let i=0;i<120&&!up();i++)await new Promise(r=>requestAnimationFrame(r));return {drawer:document.body.dataset.phDrawer||'',handle:!!document.querySelector('[data-ph-resize]')};});
  await t.check('FO92-N1 fixture: History drawer open, its separator drawn',opened.handle&&/^(open|pinned)$/.test(opened.drawer),JSON.stringify(opened));
  const rows=[];
  for(const want of [530,600,545,580,640]){
   rows.push(await f.evaluate(async want=>{
    const H=window.PM56_HOST, two=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    /* aim the column so the host width reads about `want` (the column has padding of its own) */
    let set=want;for(let i=0;i<3;i++){PMW.chatCol.setWidth(set);await two();set+=want-H.width();}
    await two();
    const h=()=>document.querySelector('[data-ph-resize]'),read=()=>{const e=h();return e?[e.getAttribute('aria-valuemax'),e.getAttribute('aria-valuenow')]:null;};
    const before=read();window.PM56_EXT.ctx().renderOverlays();const render=read();
    return {want,host:Math.round(H.width()),narrow:H.width()<560,before,render};
   },want));
  }
  t.log('FO92-N1 '+JSON.stringify(rows));
  await t.check('FO92-N1 the History separator carries what a render writes after each column change, narrow flips included',rows.length===5&&rows.every(r=>r.before&&r.render&&r.before.join()===r.render.join())&&rows.some((r,i)=>i>0&&r.narrow!==rows[i-1].narrow),JSON.stringify(rows));
  await f.evaluate(async()=>{const b=document.querySelector('#pmRoot [data-action="toggle-history"]');if(b&&/^(open|pinned)$/.test(document.body.dataset.phDrawer||''))b.click();await new Promise(r=>setTimeout(r,400));PMW.chatCol.setWidth(760);});
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
