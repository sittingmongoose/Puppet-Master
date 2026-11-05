// FO-69: repeated real relayouts at the reported Name/Project header. Film is the painted-frame authority.
export default async function(t) {
 await t.viewport(1024, 768);
 const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
 await f.evaluate(() => { O55.ui.applyLook('retro', 'dark'); O55.ui.go('name', { noHistory: true }); });
 await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]'));
 await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]').fill('First cancellation');
 await t.page.mouse.move(1900, 1060); await f.waitForTimeout(2500);
 for(let rep=0; rep<+(t.args.reps || 12); rep++) {
  for (const width of [740, 1024]) {
   await t.mark(`rep ${rep} before ${width}`);
   await t.viewport(width, 768);
   await f.waitForTimeout(1600);
   const state = await f.evaluate(() => {
    const e = document.querySelector('.o55-railitem[data-state="current"] .o55-raillabel'), b=e.getBoundingClientRect(), c=getComputedStyle(e);
    return { text:e.textContent, font:c.fontSize, scale:c.scale, rect:{x:b.x,y:b.y,width:b.width,height:b.height} };
   });
   t.log(`HEADER ${rep} ${width} ${JSON.stringify(state)}`);
   await t.check(`rep ${rep} ${width} Project label retains font`, /project/i.test(state.text) && state.font === '11px' && (state.scale === 'none' || state.scale === '1'), JSON.stringify(state));
   await t.mark(`rep ${rep} settled ${width}`);
  }
 }
}
