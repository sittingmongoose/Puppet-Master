// FO-69: the active chip must be placed by the resize task, then remain on its painted tab.
// The native 60 fps film remains the first-painted-frame witness; a DOM sample alone is not one.
import { pathToFileURL } from 'node:url';
export default async function(t) {
 const page = t.args.page || new URL('../../../PMConcept7.html', import.meta.url).href;
 await t.goto(/^[a-z][a-z0-9+.-]*:/i.test(page) ? page : pathToFileURL(page).href);
 await t.viewport(1024, 768);
 const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
 await f.waitForFunction(() => window.O55?.S?.open && !!O55.S.sess);
 await f.evaluate(() => { O55.ui.applyLook('retro', 'dark'); O55.ui.go('name', { noHistory: true }); });
 await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]'));
 await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]').fill('First cancellation');
 await t.page.mouse.move(1900, 1060); await f.waitForTimeout(2500);
 await f.evaluate(() => {
  const rect = e => { if(!e)return null; const b=e.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}; };
  const measure = () => {
   const root=document.querySelector('#pm-o55-onboarding'), tab=root.querySelector('.o55-railitem[data-state="current"]');
   const label=tab.querySelector('.o55-raillabel'), lb=rect(label);
   // Pip replaces the current bead. At narrow widths the words are hidden and the chip wraps the nonzero tab.
   const target=lb.width>0&&lb.height>0 ? label : tab;
   const chip=root.querySelector('.lg-lens[data-lg-for="onboarding-steps"]');
   const box=rect(target), ink=rect(chip), c=getComputedStyle(tab);
   const error=box&&ink ? Math.max(Math.abs(ink.x-(box.x-6)),Math.abs(ink.y-(box.y-6)),Math.abs(ink.width-(box.width+12)),Math.abs(ink.height-(box.height+12))) : Infinity;
   return {width:innerWidth,text:label.textContent,font:c.fontSize,scale:c.scale,tab:rect(tab),target:box,chip:ink,error};
  };
  const state=window.__foHeader={measure,events:[]};
  state.onResize=()=>state.events.push(measure());
  // Registered after the owner's handler: asserts same-task placement, independent of ResizeObserver ordering.
  addEventListener('resize',state.onResize);
 });
 const judge = async (name,state) => {
  t.log(`${name} ${JSON.stringify(state)}`);
  await t.check(`${name}: painted tab and chip have nonzero boxes`, !!state?.target?.width && !!state?.target?.height && !!state?.chip?.width && !!state?.chip?.height);
  await t.check(`${name}: chip matches tab plus 6px padding`, state?.error <= 1.1, JSON.stringify(state));
  await t.check(`${name}: Project font and scale`, /project/i.test(state?.text||'') && state.font==='11px' && (state.scale==='none'||state.scale==='1'));
 };
 try {
  for(let rep=0; rep<+(t.args.reps || 12); rep++) for(const width of [740,1024]) {
   await f.evaluate(()=>{window.__foHeader.events=[];});
   await t.mark(`rep ${rep} before ${width}`); await t.viewport(width,768); await f.waitForTimeout(1600);
   const state=await f.evaluate(()=>({events:window.__foHeader.events,rest:window.__foHeader.measure()}));
   await t.check(`rep ${rep} ${width}: resize event observed`,state.events.length>0);
   for(const e of state.events) await judge(`rep ${rep} ${width} resize task`,e);
   await judge(`rep ${rep} ${width} settled`,state.rest);
   await t.mark(`rep ${rep} settled ${width}`);
  }
 } finally { await f.evaluate(()=>{removeEventListener('resize',window.__foHeader.onResize);delete window.__foHeader;}); }
}
