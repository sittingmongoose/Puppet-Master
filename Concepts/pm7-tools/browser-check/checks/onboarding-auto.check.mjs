// Q2: selected Auto survives onboarding; resolved colours remain live.
export default async function(t) {
  const f = await t.app.open();
  await t.page.emulateMedia({colorScheme: 'light', reducedMotion: 'reduce'});
  await f.evaluate(() => { PM7_SETTINGS_TOME.setChromeThemeMode('auto'); O55.ui.open({fresh: true}); });
  const click = async (act, arg) => {
    const sel = `[data-o55-do="${act}"]` + (arg ? `[data-arg="${arg}"]` : '');
    await f.locator(sel).filter({visible:true}).first().click();
    await f.waitForFunction(() => !document.querySelector('.o55-layer.o55-out,.o55-layer.o55-hold') && !window.PM_LOOK_COVERED?.());
  };
  await click('start');
  await t.equal('prior Auto kept on entering look', await f.evaluate(() => O55.S.sess.drafts.main.theme_mode), 'auto');
  await t.equal('look screen offers Auto', await f.locator('[data-o55-do="pickMode"][data-arg="auto"]').count(), 1);
  await click('lookMenu');
  await t.equal('onboarding header offers Auto', await f.locator('[data-o55-do="lookMode"][data-arg="auto"]').count(), 1);
  await t.equal('header modes share one row', await f.locator('.o55-lookmodes button').evaluateAll(bs => new Set(bs.map(b => Math.round(b.getBoundingClientRect().top))).size), 1);
  await click('lookMenu');
  if (!await f.locator('[data-o55-do="pickMode"][data-arg="auto"]').count()) return;
  // The two Auto help buttons share copy in both wordings, including their accessible names.
  for (const wording of ['ELI5', 'Expert']) {
    await f.evaluate(wording => O55.talk.set(wording), wording);
    let screenTip;
    for (const id of ['pickMode:auto', 'lookMode:auto']) {
      if (id.startsWith('lookMode')) await click('lookMenu');
      const help = f.locator(`[data-o55-do="tip"][data-arg="${id}"]`).filter({visible:true}).first();
      await t.equal(`${wording} ${id}: accessible help name`, await help.getAttribute('aria-label'), 'About Follow your computer');
      await help.click();
      const note = f.locator('#pm7ob-explainer');
      await note.waitFor({state:'visible'});
      await t.equal(`${wording} ${id}: note heading`, await note.getAttribute('aria-label'), 'Follow your computer');
      const text = await note.locator('.o55-sr').textContent();
      await t.check(`${wording} ${id}: explains Auto and system following`, /Auto/.test(text) && /computer|system/i.test(text) && /follows|live/i.test(text) && !/starts in Basic Dark/.test(text));
      if (screenTip) await t.equal(`${wording}: both surfaces share Auto copy`, text, screenTip);
      else screenTip = text;
      await f.locator('#pm7ob-explainer [data-o55-do="tip"]').click();
      if (await f.evaluate(() => O55.S.lookOpen)) await click('lookMenu');
    }
  }
  await f.evaluate(() => O55.talk.set('ELI5'));
  for (const family of ['basic','friendly','retro','glass','nier']) {
    await click('pickFamily',family);
    for (const os of ['dark','light']) {
      await t.page.emulateMedia({colorScheme:os,reducedMotion:'reduce'});
      await f.waitForFunction(([family,os]) => PMLogo.look() === `${family}-${os}`, [family,os]);
      await t.equal(`${family} ${os}: draft retains Auto`, await f.evaluate(() => O55.S.sess.drafts.main.theme_mode), 'auto');
      await t.equal(`${family} ${os}: owner retains Auto`, await f.evaluate(() => PM_THEME.getMode()), 'auto');
    }
  }
  await click('pickMode','dark');
  await click('lookMenu');
  await click('lookMode','auto');
  await click('lookMenu');
  await click('next');
  await click('back');
  await t.equal('Back restores Auto', await f.evaluate(() => O55.S.sess.drafts.main.theme_mode), 'auto');
  await t.equal('Back selects Auto control', await f.locator('[data-o55-do="pickMode"][data-arg="auto"]').getAttribute('aria-checked'), 'true');
  await click('pickMode','light');
  await t.equal('explicit Light replaces Auto', await f.evaluate(() => O55.S.sess.drafts.main.theme_mode), 'light');
  await t.equal('explicit Light selected even when paint is unchanged', await f.locator('[data-o55-do="pickMode"][data-arg="light"]').getAttribute('aria-checked'), 'true');
  await click('pickMode','auto');
  await t.equal('Auto selected even when paint is unchanged', await f.locator('[data-o55-do="pickMode"][data-arg="auto"]').getAttribute('aria-checked'), 'true');
  await t.equal('look screen can choose Auto again', await f.evaluate(() => PM_THEME.getMode()), 'auto');
}
