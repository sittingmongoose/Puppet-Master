// SW-09: a cached look's sheet exit still follows Animation speed.
export default async function(t) {
 const f=await t.app.open();
 await t.app.look('basic-dark');
 await f.evaluate(()=>{window.__sheetExitTimings=[];window.__sheetAnimate=Element.prototype.animate;Element.prototype.animate=function(...args){const a=window.__sheetAnimate.apply(this,args);if(this.matches('.pmx-sheet.pmx-ghost'))window.__sheetExitTimings.push(a.effect.getTiming().duration);return a;};});
 const values={};
 try {
  for(const speed of ['Fast','Measured','Cinematic']) {
   await t.check(speed+' accepted by Settings owner',await f.evaluate(v=>PM12_KIMI.setSettingFromHost('general.visual.animation-speed',v),speed));
   await f.locator('[data-action="open-menu"][data-menu="wand"]').click();
   if(!await f.locator('[data-action="collab-open-configure"][data-kind="crew"]:not([data-auto])').isVisible())await f.locator('[data-action="polish-wand-group"][data-group="work"]').click();
   await f.locator('[data-action="collab-open-configure"][data-kind="crew"]:not([data-auto])').click();
   await t.painted('.pmx-sheet:not(.pmx-ghost)',speed+' sheet painted');
   await f.evaluate(()=>{window.__sheetExitTimings=[];});
   await t.page.keyboard.press('Escape');
   await f.waitForFunction(()=>window.__sheetExitTimings.length>0,null,{timeout:5000});
   values[speed]=await f.evaluate(()=>Math.max(...window.__sheetExitTimings));
   await f.locator('.pmx-sheet.pmx-ghost').waitFor({state:'detached',timeout:5000});
  }
  await t.check('cached exit scales Fast / Measured',Math.abs(values.Fast/values.Measured-.6)<.01,JSON.stringify(values));
  await t.check('cached exit scales Cinematic / Measured',Math.abs(values.Cinematic/values.Measured-1.6)<.01,JSON.stringify(values));
  t.log(JSON.stringify(values));
 } finally {
  await f.evaluate(()=>{Element.prototype.animate=window.__sheetAnimate;PM12_KIMI.setSettingFromHost('general.visual.animation-speed','Measured');});
 }
}
