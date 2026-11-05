// SW-04-R1: the shared Guided Tour palette must retain the selected mode on a family-only pick.
const FAMILIES = ['basic', 'friendly', 'glass', 'retro', 'nier'];
export default async function (t) {
  for (const os of ['light', 'dark']) {
    const f = await t.app.open();
    await t.viewport(1280, 900);
    await t.page.emulateMedia({colorScheme: os, reducedMotion: 'reduce'});
    await f.locator('#tab-settings').click();
    await f.locator('#pm-settings-root [data-domain="general"][data-action="navigate-domain"]').first().click();
    await f.locator('select[data-setting="general.visual.theme-mode"]').locator('..').locator('.pm51-dd-trigger').click();
    await f.getByRole('option', {name: 'Match my computer', exact: true}).click();
    await f.evaluate(() => O55.tour.start({fresh: true}));
    await f.locator('[data-o55t="lookMenu"]').click();
    for (const mode of ['auto', 'light', 'dark']) {
      if (mode !== 'auto') await f.locator(`[data-o55t="lookMode"][data-arg="${mode}"]`).click();
      const current = await f.evaluate(() => PM_THEME.getFamily());
      const start = FAMILIES.indexOf(current);
      for (const family of FAMILIES.slice(start + 1).concat(FAMILIES.slice(0, start + 1))) {
        await t.step(`header OS ${os}, hold ${mode}, pick ${family}`, async () => {
          await f.waitForFunction(() => !window.PM_LOOK_COVERED?.() && !window.PM_THEME_TRANSITION?.busy());
          await t.check('different family picked', await f.evaluate(() => PM_THEME.getFamily()) !== family);
          await f.locator(`[data-o55t="lookFamily"][data-arg="${family}"]`).click();
          await f.waitForFunction(family => PM_THEME.getFamily() === family && PMLogo.look().startsWith(family + '-') && !window.PM_LOOK_COVERED?.() && !window.PM_THEME_TRANSITION?.busy(), family);
          await t.equal('runtime mode retained', await f.evaluate(() => PM_THEME.getMode()), mode);
          await t.equal('saved mode retained', await f.evaluate(() => PM51.value('general.visual.theme-mode')), mode[0].toUpperCase() + mode.slice(1));
          await t.equal('saved family changed', await f.evaluate(() => PM51.value('general.visual.theme').split(' ')[0].toLowerCase()), family);
          await t.equal('resolved look', await f.evaluate(() => PMLogo.look()), family + '-' + (mode === 'auto' ? os : mode));
          await t.equal('titlebar mode retained', await f.locator('#themeSelect').getAttribute('data-mode-icon'), mode === 'auto' ? 'auto' : mode === 'light' ? 'sun' : 'moon');
          await t.equal('selected header family', await f.locator('[data-o55t="lookFamily"][aria-checked="true"]').getAttribute('data-arg'), family);
        });
      }
    }
    await f.locator('[data-o55t="skip"]').click();
  }
}
