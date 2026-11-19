// FO-67 / FO-52 dependency: real mouse and keyboard opening independently keep the entire popup in view.
const LOOKS = ['basic','friendly','retro','glass','nier'].flatMap(f => [`${f}-light`,`${f}-dark`]);
const SIZES = [[740,900],[860,900],[1024,900],[1280,500],[1390,900],[1920,900]];
/* PM7KIT-LOOK-PALETTE-TOAST-20261118 (F12E-NORMAL-TOAST-COVER-20261118): a live notice under the title bar — its action
   row div.pmn-acts "Open Usage" — can paint over this trigger when the quick click runs, and Jared ruled toasts may
   cover controls, so the check clears its own way instead: every staged toast whose box meets the trigger's box is
   dismissed by its own button (a real click on .pmn-x, the only way a person clears one; the toast itself is never
   moved). An entering card is waited for first, because it takes no clicks until its entrance has shown; a leaving or
   flying one is already out of the way. A card that will not take its dismiss click is left there: quickClick then
   reports the cover, exactly as before — the fix never forces a click through or past a toast. */
async function clearToastsOver(t, f, trigger, label) {
  for (let round = 0; round < 5; round++) {
    const cover = await trigger.evaluate(el => {
      if (!document.querySelector('#rsStage')) return [];
      const r = el.getBoundingClientRect();
      return [...document.querySelectorAll('#rsStage .pmn-toast')]
        .filter(c => !c.classList.contains('pmn-leaving') && !c.classList.contains('pmn-flying'))
        .map(c => {
          const b = c.getBoundingClientRect();
          return { id: c.getAttribute('data-pmn-id') || '', entering: c.classList.contains('pmn-entering'),
            over: !!b.width && !!b.height && !(b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom),
            title: (c.querySelector('.pmn-title')?.textContent || c.textContent || '').trim().slice(0, 48) };
        })
        .filter(x => x.over && x.id);
    }).catch(() => []);
    if (!cover.length) return;
    for (const c of cover) {
      if (c.entering) await f.waitForFunction(id => { const e = document.querySelector(`#rsStage .pmn-toast[data-pmn-id="${id}"]`); return !e || !e.classList.contains('pmn-entering'); }, c.id, { timeout: 4000 }).catch(() => {});
      const clicked = await f.locator(`#rsStage .pmn-toast[data-pmn-id="${c.id}"] .pmn-x`).click({ timeout: 3000 }).then(() => true).catch(() => false);
      if (!clicked) { t.log(`${label}: a toast over the trigger ("${c.title}") would not take its dismiss click; quickClick will report it`); continue; }
      await f.waitForFunction(id => { const e = document.querySelector(`#rsStage .pmn-toast[data-pmn-id="${id}"]`); return !e || !e.isConnected; }, c.id, { timeout: 4000 }).catch(() => {});
      t.log(`${label}: dismissed a toast over the trigger ("${c.title}") by its own button`);
    }
  }
}
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
    await t.viewport(1920,900);
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
      const popup = route === 'settings' ? '.pm51-dd-list' : '.o55-lookmenu';
      for (const input of ['mouse','keyboard']) {
        const label = `${route} ${look} ${w}x${h} ${input}`;
        await trigger.scrollIntoViewIfNeeded();
        if (input === 'mouse') { await clearToastsOver(t, f, trigger, label); await t.quickClick(trigger); }
        else { await trigger.focus(); await trigger.press('Enter'); }
        const opened = await f.locator(popup).isVisible();
        await t.check(`${label}: palette opened`, opened);
        if (!opened) continue; // retain the failed mouse assertion; never recover it with a keyboard press
        await t.settle();
        const box = await f.locator(popup).evaluate(e => { const r=e.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight}; });
        t.log(`${label}: ${JSON.stringify(box)}`);
        await t.check(`${label}: entire look palette inside viewport`,box.left>=0 && box.right<=box.w && box.top>=0 && box.bottom<=box.h,JSON.stringify(box));
        if (look.startsWith('nier') && w===860) await t.crop(`${route}-${look}-${input}`,popup,'NieR palette viewport edge');
        // Settings portals own keyboard events while open; leave focus in the active listbox.
        await (route === 'settings' ? f.locator(popup) : trigger).press('Escape');
        await f.locator(popup).waitFor({state:'hidden'});
        await t.check(`${label}: Escape closed palette`, !(await f.locator(popup).isVisible()));
      }
    }
  }
} ]));
