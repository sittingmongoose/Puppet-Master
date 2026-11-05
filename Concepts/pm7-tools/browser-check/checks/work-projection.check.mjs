// SW-09/10: real owner controls must project their changed scopes.
export const tests={
 async 'Studio work changes preserve the conversation (SW-10)'(t){
  const f=await t.app.open();await t.app.look('basic-dark');
  await f.locator('.pmds-entry').click();await f.locator('[data-pmds-tab="activity"]').click();
  await f.evaluate(()=>{window.__projectionPhases=[];window.__projectionApps=[];window.PM56_EXT._slots.afterRender.push((ctx,info)=>{window.__projectionPhases.push(info.phase);if(info.phase==='app'){const limit=Error.stackTraceLimit;Error.stackTraceLimit=40;window.__projectionApps.push(new Error().stack);Error.stackTraceLimit=limit;}});window.__transcript=document.querySelector('#pmRoot .transcript');});
  const scenes=await f.locator('[data-pmds-do="act-scene"]').evaluateAll(es=>es.map(e=>e.dataset.arg));
  for(let repeat=0;repeat<Number(t.args.workRepeats||1);repeat++)for(const scene of scenes){
   await f.evaluate(()=>{window.__projectionPhases=[];window.__projectionApps=[];});
   await f.locator(`[data-pmds-do="act-scene"][data-arg="${scene}"]`).click();
   await t.until('work scene selected',s=>PM_WORK.scenario()===s,scene);
   await t.page.waitForTimeout(150);
   const result=await f.evaluate(()=>({phases:window.__projectionPhases,apps:window.__projectionApps,kept:window.__transcript===document.querySelector('#pmRoot .transcript')}));
   if(result.apps.length)t.log('Studio app callback provenance '+repeat+'/'+scene+': '+JSON.stringify(result.apps));
   await t.check(`${scene}: work projection uses scopes`,result.phases.includes('scope')&&!result.phases.includes('app'),JSON.stringify(result));
   await t.check(`${scene}: transcript scroll host retained`,result.kept);
   const dock=await f.evaluate(()=>{
    const W=PM_WORK,tid=PM56_EXT.ctx().state.selectedThread;
    const items=W.items({thread:tid,kind:['process','agent','scheduled'],view:'thread:'+tid});
    const rows=[...document.querySelectorAll('#pmRoot .composer [data-action="work-dock-review"]')].map(b=>({id:b.dataset.id,review:b.textContent.trim()==='Review'}));
    return {needs:items.filter(W.needsYou).length,rows,valid:rows.every(b=>{const it=W.item(b.id);return !!it&&(b.review?W.needsYou(it):W.isLive(it)||(it.kind==='scheduled'&&it.state==='pending'));})};
   });
   await t.check(`${scene}: composer work rows match current projection`,dock.valid&&(dock.needs===0?!dock.rows.some(r=>r.review):dock.rows.some(r=>r.review)),JSON.stringify(dock));
  }
 }
};
