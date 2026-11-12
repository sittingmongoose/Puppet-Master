// The fresh role marker keeps the Run team's inherited 20px line-height (R3-1).
export default async function (t) {
 await t.viewport(1920, 1080);
 const f = await t.app.open({ query: 'pm-warm=0' });
 await f.waitForFunction(() => typeof window.PM_HOME?.open === 'function');
 await f.evaluate(() => {
  PM_PAGES.go('dashboard');
  PM_HOME.open({ id: 'crew-work:crew-query-perf', kind: 'run', tab: 'team' });
  PM_HOME.open({ id: 'crew-work:crew-query-perf', kind: 'run', tab: 'team' });
 });
 try {
 await f.waitForFunction(() => !!document.querySelector('.pmw-run-tname b'), null, { timeout: 10000 });
 const roles = await f.locator('.pmw-run-tname b').evaluateAll((els) => els.map((e) => ({ text: e.textContent, cls: e.className, lineHeight: getComputedStyle(e).lineHeight, display: getComputedStyle(e).display })));
 await t.check('Run team role names inherit 20px line-height', roles.length > 0 && roles.every((r) => r.lineHeight === '20px'), JSON.stringify(roles));
 } finally {
  // The next check must not inherit the Run panel and its live cast.
  await f.evaluate(() => PM_HOME.close('crew-work:crew-query-perf'));
 }
}
