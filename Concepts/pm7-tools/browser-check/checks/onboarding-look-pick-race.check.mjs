// FO-243: a mode picked on onboarding's look step while the family just picked is still being revealed applies to that
// new family. The reveal writes the theme only in its view-transition update, which the browser runs after it has taken
// the old picture: on a slow GPU (the GTX 1070 Ti) or a loaded machine that is seconds after the click. Light picked
// inside that time went to the old family (Basic Light), or, when the press's own work held its release back past the
// reveal-press redirect's 1.5 s, did nothing at all (Glass Dark, the bug as seen).
//
// A fresh window (Basic Dark) is opened at the look step; the page's main thread is slowed with CDP
// Emulation.setCPUThrottlingRate (the sandbox's frame too when it has its own target); the family tile and then the
// mode button are clicked with page.mouse at their centres, `gap` ms apart. Once the reveal has ended and the look has
// held for a second, O55.theme() is that family and mode and the main draft says the same.
//
// Cells: Glass Light (the bug), Glass Dark and Friendly Light (the ordinary path) at gaps 0, 50, 120 and 220 ms and
// rate 6, plus Glass Light at gap 0 and rate 14 (the dropped click). --set looks=all runs every one of the ten looks
// (browser-check.config.mjs LOOKS) at each gap instead; --set looks=glass-light,friendly-dark picks some.
// --set gaps=0,220, --set cpu=<rate> (the main rate) and --set slow=<rate> (0 drops the slow cell) narrow a run.
import { LOOKS } from '../browser-check.config.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAYER = '.o55-layer:not(.o55-out)';

export default async function (t) {
  const rate = Number(t.args.cpu || 6), slow = t.args.slow === undefined ? 14 : Number(t.args.slow);
  const gaps = String(t.args.gaps || '0,50,120,220').split(',').filter((x) => x !== '').map(Number);
  const looks = !t.args.looks ? ['glass-light', 'glass-dark', 'friendly-light'] : t.args.looks === 'all' ? LOOKS : String(t.args.looks).split(',');
  const cells = [];
  for (const look of looks) for (const gap of gaps) cells.push({ look, gap, rate });
  if (!t.args.looks && slow > 0) cells.push({ look: 'glass-light', gap: 0, rate: slow });

  for (const { look, gap, rate: r } of cells) {
    const [fam, mode] = look.split('-');
    await t.step(`${fam} then ${mode}, ${gap} ms apart, CPU ${r}x`, async () => {
      const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', settleMs: 1500 });
      await f.waitForFunction(() => window.O55 && O55.S && O55.S.sess && O55.S.sess.screen === 'welcome', null, { timeout: 40000 });
      await f.locator(`${LAYER}:not(.o55-hold) [data-o55-do="start"]`).filter({ visible: true }).first().click({ timeout: 15000 });
      await f.waitForFunction(() => O55.S.sess.screen === 'look' && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-hold')
        && document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer').length === 1, null, { timeout: 20000 });
      await sleep(600);
      const tile = f.locator(`${LAYER} .o55-tile[data-o55-do="pickFamily"][data-arg="${fam}"]`).filter({ visible: true }).first();
      const seg = f.locator(`${LAYER} [data-o55-do="pickMode"][data-arg="${mode}"]`).filter({ visible: true }).first();
      await tile.scrollIntoViewIfNeeded();
      const bt = await tile.boundingBox(), bs = await seg.boundingBox();
      const start = await f.evaluate(() => O55.theme().slug);
      // the page's main thread, and the sandbox's frame when it is a target of its own
      const cdps = [await t.page.context().newCDPSession(t.page)];
      if (f !== t.page.mainFrame()) { try { cdps.push(await t.page.context().newCDPSession(f)); } catch (_) { /* same process as the page */ } }
      const spin = () => f.evaluate(() => { const a = performance.now(); let x = 0; for (let i = 0; i < 3e6; i++) x += i % 7; return performance.now() - a + (x < 0 ? 1 : 0); });
      const before = await spin();
      for (const c of cdps) await c.send('Emulation.setCPUThrottlingRate', { rate: r });
      let slowed = 0;
      try {
        slowed = (await spin()) / Math.max(before, 0.1);
        await t.page.mouse.click(bt.x + bt.width / 2, bt.y + bt.height / 2);
        if (gap) await sleep(gap);
        await t.page.mouse.click(bs.x + bs.width / 2, bs.y + bs.height / 2);
      } finally {
        for (const c of cdps) { await c.send('Emulation.setCPUThrottlingRate', { rate: 1 }).catch(() => {}); await c.detach().catch(() => {}); }
      }
      // settled: no reveal waiting or playing, and the same look for a whole second
      const read = () => f.evaluate(() => ({ th: O55.theme(), vt: !!O55.S.vt || document.documentElement.hasAttribute('data-o55-vt'),
        draft: [O55.S.sess.drafts.main.theme_family, O55.S.sess.drafts.main.theme_mode] }));
      let s = await read(), held = 0;
      const until = Date.now() + 90000;
      while (Date.now() < until) {
        await sleep(250);
        const n = await read();
        held = !n.vt && !s.vt && n.th.slug === s.th.slug && n.th.selectedMode === s.th.selectedMode ? held + 250 : 0;
        s = n;
        if (held >= 1000) break;
      }
      const got = `from ${start}: ${JSON.stringify(s.th)}, draft ${s.draft.join('/')}, settled ${held >= 1000}, CPU slowed ${slowed.toFixed(1)}x on ${cdps.length} target(s)`;
      t.log(`${look} gap ${gap} rate ${r}: ${got}`);
      await t.check(`${fam} ${mode} applied (${gap} ms, CPU ${r}x)`, held >= 1000 && s.th.chosen === fam && s.th.selectedMode === mode && s.draft[0] === fam && s.draft[1] === mode, got);
    });
  }
  /* pre-existing on main in T3's sandbox, not FO-243's: a screen the page's own timer settles focuses its heading
     without user activation, which the sandbox's permissions policy refuses and logs (as fresh-reset-project). Consumed
     by its exact message; any other console error still fails the run-wide console check. */
  if (t.app.sandboxed(false)) await t.noConsoleErrors('console (sandbox focus policy)', { allow: [/Permissions policy violation: focus-without-user-activation/] });
}
