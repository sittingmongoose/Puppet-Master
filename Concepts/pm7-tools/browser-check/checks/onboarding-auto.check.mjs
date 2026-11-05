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
  await click('lookMenu');
  if (!await f.locator('[data-o55-do="pickMode"][data-arg="auto"]').count()) return;
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
