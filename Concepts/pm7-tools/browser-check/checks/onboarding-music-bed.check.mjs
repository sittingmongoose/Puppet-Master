// FO-190: keep setup's requested music through temporary sound/part gates. The production Pip popup is opened as a
// fixture so onboarding stays active underneath it; every part/sound change and Start is a real press. No reload,
// synthetic click, music() call or extra gesture is used to rescue an enable. Run with explicit sandbox=0 and 1.
const MUSIC = '#pipe-pop [data-pipe-part="setup-music"]';
async function editor(f) {
  await f.evaluate(() => PM_PIP_EDITOR.popup({ returnFocus: document.activeElement }));
  await f.locator(MUSIC).waitFor({ state: 'visible' });
}
async function playing(t, name, on) {
  await t.until(name, (want) => !!O55.sound.pip.playing().music === want, on, { timeout: 1000 });
}
export const tests = {
  'Setup music off at Start then on, off and on again': async t => {
    const f = await t.app.open();
    await editor(f);
    await t.equal('Setup music initially on', await f.locator(MUSIC).getAttribute('aria-checked'), 'true');
    await f.locator(MUSIC).click();
    await f.locator('.pipe-pop-done').click();
    await f.evaluate(() => O55.ui.open({ fresh: true }));
    await f.locator('.o55-layer:not(.o55-out) [data-o55-do="start"]').click();
    await t.equal('master sound stays on', await f.evaluate(() => O55.sound.muted), false);
    await playing(t, 'Setup music off at Start is silent', false);
    await editor(f);
    await f.locator(MUSIC).click();
    await playing(t, 'enabling Setup music starts the wanted bed within 1 s', true);
    await f.locator(MUSIC).click();
    await playing(t, 'disabling Setup music stops the bed', false);
    await f.locator(MUSIC).click();
    await playing(t, 're-enabling Setup music restarts the bed within 1 s', true);
    await f.locator('.pipe-pop-done').click();
    await t.equal('same onboarding session remains on Look', await f.evaluate(() => O55.S.sess.screen), 'look');
  },
  'sound off at Start then on, off and on again': async t => {
    const f = await t.app.open();
    await f.evaluate(() => O55.ui.open({ fresh: true }));
    const sound = f.locator('#pm-o55-onboarding .o55-sound');
    await sound.click();
    await t.equal('sound off before Start', await f.evaluate(() => O55.sound.muted), true);
    await f.locator('.o55-layer:not(.o55-out) [data-o55-do="start"]').click();
    await playing(t, 'sound off at Start is silent', false);
    await sound.click();
    await playing(t, 'unmuting starts the wanted bed within 1 s', true);
    await sound.click();
    await playing(t, 'muting stops the bed', false);
    await sound.click();
    await playing(t, 'unmuting again restarts the bed within 1 s', true);
  }
};
