// FO-67: the entire popup must fit, with no overflow allowance. Keyboard activation also exercises narrow headers.
const LOOKS = ['basic','friendly','retro','glass','nier'].flatMap(f => [`${f}-light`,`${f}-dark`]);
const SIZES = [[740,900],[860,900],[1024,900],[1280,500]];
export const tests = Object.fromEntries(['onboarding','tour','settings'].map(route => [route, async t => {
  await t.emulate({reducedMotion:'reduce'});
  const f = await t.app.open(route === 'onboarding' ? {onboarding:true,query:'o55=screen=welcome'} : {});
  if (route === 'onboarding') await f.locator('[data-o55-do="start"]').click();
  else {
    await f.locator('#tab-settings').click();
    if (route === 'tour') {
      await f.locator('#pm-settings-root .side-link[data-action="home"]').click();
      await f.locator('[data-action="restart-guided-tour"]').click();
    } else await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
  }
  for (const look of (t.args.looks ? String(t.args.looks).split(',') : LOOKS)) {
    const [family,mode] = look.split('-');
    if (route === 'onboarding') {
      for (const [action,arg] of [['pickFamily',family],['pickMode',mode]]) {
        const b = f.locator(`[data-o55-do="${action}"][data-arg="${arg}"]`);
        await b.focus(); await b.press('Enter');
      }
    } else if (route === 'settings') {
      for (const [setting,value] of [['theme',(family === 'nier' ? 'NieR' : family[0].toUpperCase()+family.slice(1))],['theme-mode',mode === 'light' ? 'Light' : 'Dark']]) {
        const b = f.locator(`select[data-setting="general.visual.${setting}"]`).locator('..').locator('.pm51-dd-trigger');
        const labels = await f.locator(`select[data-setting="general.visual.${setting}"] option`).allTextContents();
        const name = labels.includes(value) ? value : `${value} ${mode === 'light' ? 'Light' : 'Dark'}`;
        await b.scrollIntoViewIfNeeded(); await b.click();
        await f.getByRole('option',{name,exact:true}).click();
      }
    }
    else await t.app.look(look);
    await f.waitForFunction(() => !window.PM_LOOK_COVERED?.() && !window.PM_THEME_TRANSITION?.busy());
    await f.waitForFunction(([r,l]) => r === 'onboarding' ? `${O55.theme().chosen}-${O55.theme().mode}` === l : PMLogo.look() === l,[route,look]);
    for (const [w,h] of SIZES) {
      await t.viewport(w,h);
      const trigger = route === 'settings' ? f.locator('select[data-setting="general.visual.theme"]').locator('..').locator('.pm51-dd-trigger') : f.locator(`[${route === 'tour' ? 'data-o55t' : 'data-o55-do'}="lookMenu"]`);
      await trigger.scrollIntoViewIfNeeded(); await trigger.focus(); await trigger.press('Enter');
      const popup = route === 'settings' ? '.pm51-dd-list' : '.o55-lookmenu';
      await f.locator(popup).waitFor({state:'visible'}); await t.settle();
      const box = await f.locator(popup).evaluate(e => { const r=e.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight}; });
      t.log(`${route} ${look} ${w}x${h}: ${JSON.stringify(box)}`);
      await t.check(`${route} ${look} ${w}x${h}: entire look palette inside viewport`,box.left>=0 && box.right<=box.w && box.top>=0 && box.bottom<=box.h,JSON.stringify(box));
      if (look.startsWith('nier') && w===860) await t.crop(`${route}-${look}`,popup,'NieR palette viewport edge');
      await trigger.press('Escape');
    }
  }
} ]));
