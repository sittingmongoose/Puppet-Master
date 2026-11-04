// SW-09/10: real owner controls must project their changed scopes.
export const tests={
 async 'Studio work changes preserve the conversation (SW-10)'(t){
  const f=await t.app.open();await t.app.look('basic-dark');
  await f.locator('.pmds-entry').click();await f.locator('[data-pmds-tab="activity"]').click();
  await f.evaluate(()=>{window.__projectionPhases=[];window.PM56_EXT._slots.afterRender.push((ctx,info)=>window.__projectionPhases.push(info.phase));window.__transcript=document.querySelector('#pmRoot .transcript');});
  const scenes=await f.locator('[data-pmds-do="act-scene"]').evaluateAll(es=>es.map(e=>e.dataset.arg));
  for(const scene of scenes){
   await f.evaluate(()=>{window.__projectionPhases=[];});
   await f.locator(`[data-pmds-do="act-scene"][data-arg="${scene}"]`).click();
   await t.until('work scene selected',s=>PM_WORK.scenario()===s,scene);
   await t.page.waitForTimeout(150);
   const result=await f.evaluate(()=>({phases:window.__projectionPhases,kept:window.__transcript===document.querySelector('#pmRoot .transcript')}));
   await t.check(`${scene}: work projection uses scopes`,result.phases.includes('scope')&&!result.phases.includes('app'),JSON.stringify(result));
   await t.check(`${scene}: transcript scroll host retained`,result.kept);
  }
 }
};
