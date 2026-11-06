// SW-47: the Friendly Dark Studio scroller clips the selected sound-kit label at its inner border.
import pixels from '../helpers/studio-contrast-pixels.cjs';

export default async function (t) {
  await t.viewport(1600, 1000);
  const f = await t.app.open();
  await t.app.look('friendly-dark');
  await f.locator('.pmds-entry').click();
  const tab = f.locator('[data-pmds-tab="pip"]');
  await tab.scrollIntoViewIfNeeded(); await tab.click();
  const target = f.locator('#pmds-main [data-pmds-do="pip-kit"][data-arg="look"]');
  await target.scrollIntoViewIfNeeded();
  await target.click();
  // Wheel the actual scroller until the label crosses its lower clip edge.
  const g = await f.evaluate(() => {
    const sc = document.querySelector('#pmds-main'), e = sc.querySelector('[data-pmds-do="pip-kit"][data-arg="look"] span');
    const s = sc.getBoundingClientRect(), r = e.getBoundingClientRect();
    return { x: s.left + s.width / 2, y: s.top + s.height / 2, delta: r.bottom - (s.top + sc.clientTop + sc.clientHeight) - 2 };
  });
  await t.page.mouse.move(g.x, g.y); await t.page.mouse.wheel(0, g.delta); await f.waitForTimeout(600);
  const sc = await f.evaluate(() => { const e = document.querySelector('#pmds-main'), r = e.getBoundingClientRect(), b = e.querySelector('[data-pmds-do="pip-kit"][data-arg="look"] span').getBoundingClientRect(); return { left: r.left + e.clientLeft, top: r.top + e.clientTop, right: r.left + e.clientLeft + e.clientWidth, bottom: r.top + e.clientTop + e.clientHeight, targetTop: b.top, targetBottom: b.bottom }; });
  await t.check('kit label crosses the lower clip edge', sc.targetTop < sc.bottom && sc.targetBottom > sc.bottom, JSON.stringify(sc), { hard: true });
  const options = { legacyClip: String(t.args.legacyClip) === '1' };
  const before = await f.evaluate(pixels.textSnapshot, options);
  const shot = await t.page.screenshot();
  const after = await f.evaluate(pixels.textSnapshot, options);
  const rows = pixels.worstPixels({ shot, before, after, auditClip: sc });
  const row = rows.find(x => /The look.s \(Friendly\)/.test(x.text) && x.worst);
  t.log('edge sample ' + JSON.stringify({ clip: sc, worst: row && row.worst, outsideClip: row && row.outsideClip, legacyClip: options.legacyClip }));
  await t.check('clipped selected kit text is sampled', !!row, row ? JSON.stringify(row.worst) : 'no stable painted sample');
  if (row) {
    const {x, y} = row.worst;
    await t.check('every sample is inside the scroller clip', row.outsideClip === 0 && x >= sc.left && x < sc.right && y >= sc.top && y < sc.bottom, JSON.stringify({ outside: row.outsideClip, point: [x, y], clip: sc }));
    await t.check('clipped selected kit contrast is at least 4.5:1', row.pass === true, JSON.stringify(row.worst));
  }
}
