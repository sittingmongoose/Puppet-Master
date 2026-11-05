// FO-54: splitting selector lists preserves the plate and schedule-manager look tokens and painted surfaces.
const LOOKS = ['glass-dark', 'glass-light', 'nier-dark', 'nier-light'];
export default async function(t) {
 const f=await t.app.open();
 async function wand(group, action) {
  await f.locator('[data-action="open-menu"][data-menu="wand"]').click();
  if(!await f.locator(action).isVisible()) await f.locator(`[data-action="polish-wand-group"][data-group="${group}"]`).click();
  await f.locator(action).click();
 }
 async function inspect(selector, name) {
  for(const look of LOOKS) {
   await t.app.look(look);
   await f.waitForFunction(()=>!(window.PM_THEME_TRANSITION?.busy()||window.PM_LOOK_COVERED?.()||window.PM_NIER?.wanted?.()!==window.PM_NIER?.on?.()),null,{timeout:20000});
   const style=await f.locator(selector).first().evaluate(e=>{const c=getComputedStyle(e);return {lit:c.getPropertyValue('--pmx-lit').trim(),ink:c.getPropertyValue('--o55-nier-ink').trim(),outline:c.getPropertyValue('--pmx-lit-outline').trim()};});
   const shadows=(style.outline.match(/drop-shadow\(/g)||[]).length;
   await t.check(`${name} ${look}: outline vocabulary`,shadows===(look.startsWith('glass-')?5:4),JSON.stringify(style));
   if(look.startsWith('nier-'))await t.equal(`${name} ${look}: ink`,style.lit,style.ink);
   await t.painted(selector,`${name} ${look}: painted`);
   t.log(JSON.stringify({name,look,...style}));
  }
 }
 await wand('work','[data-action="collab-open-configure"][data-kind="crew"]:not([data-auto])');
 await inspect('.pmx-sheet:not(.pmx-ghost) .pmx-plate','Crew');
 await t.page.keyboard.press('Escape');
 await wand('schedule','[data-action="sched-open-manage"]');
 await inspect('.pmx-sheet.pmx-sched-mgr:not(.pmx-ghost)','Schedules');
}
