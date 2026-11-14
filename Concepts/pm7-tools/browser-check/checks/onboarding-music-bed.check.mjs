// FO-190: real Start/part/sound presses, plus actual music signal. No quiet-page import (it suspends contexts).
// --audio (also exported below) keeps the device clock running. The kit may mute its destination: we sample upstream
// at the master, with a pulled analyser branch. Speech, UI effects and non-bed loops cannot satisfy the music check.
export const audio = true;
const MUSIC = '#pipe-pop [data-pipe-part="setup-music"]';
const FLOOR = 0.001; // RMS, -60 dBFS: above residual tails, below the music's -43 dBFS whole-loop target.
async function musicOnly(f) {
  await f.evaluate(() => {
    O55.sound.play = () => false; // fixture: UI/chapter stings must not make silent music pass
    PM_PIP_PARTS.toggle('setup-voice', false);
    O55.sound.pip.hush();
    O55.pipVoice.play = () => false;
    const loop = O55.pipVoice.loop;
    O55.pipVoice.loop = (name, level) => loop(name, name === 'bed' ? level : 0);
    ['snore', 'work', 'power', 'swing'].forEach(name => loop(name, 0));
  });
}
async function editor(f) {
  await f.evaluate(() => PM_PIP_EDITOR.popup({ returnFocus: document.activeElement }));
  await f.locator(MUSIC).waitFor({ state: 'visible' });
}
async function audible(t, f, name) {
  const result = await f.evaluate(async floor => {
    const S = O55.sound, c = S.ctx;
    if (!c || c.state !== 'running') return { state: c?.state || 'missing', peakRms: 0, elapsed: 0, advanced: 0 };
    const a = c.createAnalyser(), pull = c.createGain(); a.fftSize = 2048; pull.gain.value = 0;
    S.master.connect(a); a.connect(pull); pull.connect(c.destination);
    const b = new Float32Array(a.fftSize), start = performance.now(), clock = c.currentTime;
    let peakRms = 0, samples = 0, firstAboveMs = null;
    try {
      do {
        a.getFloatTimeDomainData(b);
        const rms = Math.sqrt(b.reduce((n, v) => n + v * v, 0) / b.length);
        peakRms = Math.max(peakRms, rms); samples++;
        if (rms >= floor && firstAboveMs === null) firstAboveMs = performance.now() - start;
        if (firstAboveMs !== null && samples >= 3) break;
        await new Promise(resolve => setTimeout(resolve, 20));
      } while (performance.now() - start < 2000);
      return { state: c.state, peakRms, samples, firstAboveMs, elapsed: performance.now() - start, advanced: c.currentTime - clock, music: S.pip.playing().music };
    } finally { S.master.disconnect(a); a.disconnect(); pull.disconnect(); }
  }, FLOOR);
  t.log(name + ': ' + JSON.stringify({ floorRms: FLOOR, ...result }));
  await t.check(name + ': running audio clock', result.state === 'running' && result.advanced > 0, JSON.stringify(result));
  await t.check(name + ': master RMS >= 0.001 within 2 s', result.peakRms >= FLOOR && result.firstAboveMs !== null && result.firstAboveMs <= 2000, JSON.stringify(result));
}
async function playing(t, name, on) {
  await t.until(name, want => !!O55.sound.pip.playing().music === want, on, { timeout: 1000 });
}
export const tests = {
  'Setup music off at Start then on, off and on again': async t => {
    const f = await t.app.open(); await musicOnly(f);
    await editor(f);
    await t.equal('Setup music initially on', await f.locator(MUSIC).getAttribute('aria-checked'), 'true');
    await f.locator(MUSIC).click(); await f.locator('.pipe-pop-done').click();
    await f.evaluate(() => O55.ui.open({ fresh: true }));
    await f.locator('.o55-layer:not(.o55-out) [data-o55-do="start"]').click();
    await t.equal('master sound stays on', await f.evaluate(() => O55.sound.muted), false);
    await playing(t, 'Setup music off at Start is silent', false);
    await editor(f); await f.locator(MUSIC).click();
    await playing(t, 'enabling Setup music starts the wanted bed within 1 s', true);
    await audible(t, f, 'Setup music enabled');
    await f.locator(MUSIC).click(); await playing(t, 'disabling Setup music stops the bed', false);
    await f.locator(MUSIC).click();
    await playing(t, 're-enabling Setup music restarts the bed within 1 s', true);
    await audible(t, f, 'Setup music re-enabled');
    await f.locator('.pipe-pop-done').click();
    await t.equal('same onboarding session remains on Look', await f.evaluate(() => O55.S.sess.screen), 'look');
  },
  'sound off at Start then on, off and on again': async t => {
    const f = await t.app.open(); await musicOnly(f);
    await f.evaluate(() => O55.ui.open({ fresh: true }));
    const sound = f.locator('#pm-o55-onboarding .o55-sound');
    await sound.click(); await t.equal('sound off before Start', await f.evaluate(() => O55.sound.muted), true);
    await f.locator('.o55-layer:not(.o55-out) [data-o55-do="start"]').click();
    await playing(t, 'sound off at Start is silent', false);
    await sound.click(); await playing(t, 'unmuting starts the wanted bed within 1 s', true);
    await audible(t, f, 'Sound enabled');
    await sound.click(); await playing(t, 'muting stops the bed', false);
    await sound.click(); await playing(t, 'unmuting again restarts the bed within 1 s', true);
    await audible(t, f, 'Sound re-enabled');
  },
  'fresh Start and every music kit have an audible bed': async t => {
    const f = await t.app.open(); await musicOnly(f);
    await f.evaluate(() => O55.ui.open({ fresh: true }));
    await f.locator('.o55-layer:not(.o55-out) [data-o55-do="start"]').click();
    // Let startup and any pre-fixture tails die: the two-second signal window must measure continuing music.
    await f.waitForTimeout(5000);
    await audible(t, f, 'Fresh Basic after 5 s settle');
    for (const [family, mode, kit] of [['friendly','dark','friendly'],['glass','dark','glass'],['retro','dark','phosphor'],['retro','light','teletype'],['nier','dark','nier']]) {
      await f.locator(`[data-o55-do="pickFamily"][data-arg="${family}"]`).click();
      await f.locator(`[data-o55-do="pickMode"][data-arg="${mode}"]`).click();
      await f.waitForFunction(kit => O55.sound.pip.playing().music === 'pip-' + kit, kit, { timeout: 3000 }).catch(() => {});
      await audible(t, f, kit + ' music');
    }
  }
};
