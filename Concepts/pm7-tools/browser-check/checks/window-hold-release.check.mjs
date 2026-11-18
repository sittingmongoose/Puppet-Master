// FO-226: the wake layout notification, rather than a count of frames, arms release.
// Hold only that notification back; all ordinary frames and other observers keep running.
export default async function (t) {
  const f = await t.app.open({ query: 'pm-still=off&pm-warm=0', settleMs: 1500 });
  await f.locator('[data-pm-home-top-action="home-menu"]').filter({ visible: true }).first().click();
  await f.locator('[data-pm-home-action="run-onboarding"]').filter({ visible: true }).first().click();
  await f.waitForFunction(() => document.querySelector('#pm-o55-onboarding[data-open="true"] .o55-pane > .o55-layer[data-screen]:not(.o55-hold)'));
  await f.evaluate(() => {
    const Native = window.ResizeObserver;
    window.__fo226 = { pending: null, deliveries: 0 };
    window.ResizeObserver = class extends Native {
      constructor(cb) { super((entries, obs) => {
        if (entries.some(e => e.target.id === 'o55-wake-layout')) {
          window.__fo226.deliveries++;
          window.__fo226.pending = () => cb(entries, obs);
        } else cb(entries, obs);
      }); }
    };
  });
  await f.locator('#pm-o55-onboarding .o55-close').filter({ visible: true }).first().click();
  await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'));
  const before = await f.evaluate(async () => {
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    return { held: PM_WINDOW_HOLD.on(), marked: PM_WINDOW_HOLD.marked(), deliveries: __fo226.deliveries };
  });
  await t.check('wake layout notification owns release across five free frames', before.held && before.marked > 0 && before.deliveries === 1, JSON.stringify(before));
  const after = await f.evaluate(async () => {
    if (__fo226.pending) __fo226.pending();
    await new Promise(requestAnimationFrame);
    return { held: PM_WINDOW_HOLD.on(), marked: PM_WINDOW_HOLD.marked(), probe: !!document.getElementById('o55-wake-layout') };
  });
  await t.check('notification releases at the next frame and removes its observer probe', !after.held && after.marked === 0 && !after.probe, JSON.stringify(after));
}
