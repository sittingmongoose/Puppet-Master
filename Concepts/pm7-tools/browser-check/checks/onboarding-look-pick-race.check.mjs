// FO-243: a mode picked on onboarding's look step while the family just picked is still being revealed applies to that
// new family. The reveal writes the theme only in its view-transition update, which the browser runs after it has taken
// the old picture: on a slow GPU (the GTX 1070 Ti) or a loaded machine that is seconds after the click. Light picked
// inside that time went to the old family (Basic Light), or, when the press's own work held its release back past the
// reveal-press redirect's 1.5 s, did nothing at all (Glass Dark, the bug as seen).
//
// A fresh window (Basic Dark) is opened at the look step; the page's main thread is slowed with CDP
// Emulation.setCPUThrottlingRate (the sandbox's frame too when it has its own target); the family tile and then the
// mode button are clicked with page.mouse at their centres, `gap` ms apart. The mode is pressed at the button's own
// centre once the element there is the button or the page root (which takes every hit while a reveal plays and hands
// the press on to what is under it): a family's reveal leaves it so at once, while NieR's moment covers the window with
// its plate until its reveal, so there Light can be seen and pressed only then (and sits 8 px lower in NieR's window).
// Once the reveal has ended and the look has held for a second, O55.theme() is that family and mode and the main draft
// says the same.
//
// Cells: Glass Light (the bug), Glass Dark and Friendly Light (the ordinary path) at gaps 0, 50, 120 and 220 ms and
// rate 6, plus Glass Light at gap 0 and rate 14 (the dropped click). --set looks=all runs every one of the ten looks
// (browser-check.config.mjs LOOKS) at each gap instead; --set looks=glass-light,friendly-dark picks some.
// The other presses a reveal hands on are covered at both rates by default: the window's look menu (its Glass row,
// then its Light row) and Continue pressed inside Glass's reveal (the look stays Glass Dark and Where opens).
// A press held through the reveal is covered at both rates too, for Light and for Continue (round 2): held 2.6 s and
// released on the same control it applies; held, dragged off onto the screen's heading and released there it is cancelled,
// as on any button (Light: the look stays Glass Dark; Continue: the screen stays Look). Each such cell also asserts that
// the press began inside the reveal (the page's root took it) and that the release point is the heading.
// A mode that is already the window's (Dark, in a fresh window's Basic Dark) is changed first to the other one, so that a
// dropped press of it shows: Glass Dark starts from Basic Light.
// --set gaps=0,220, --set cpu=<rate> (the main rate), --set slow=<rate> (0 drops the slow cells), --set paths=0 (no
// look menu or Continue cells) and --set press=0 (no held or dragged-off cells) narrow a run.
import { LOOKS } from '../browser-check.config.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAYER = '.o55-layer:not(.o55-out)';

export default async function (t) {
  const rate = Number(t.args.cpu || 6), slow = t.args.slow === undefined ? 14 : Number(t.args.slow);
  const gaps = String(t.args.gaps || '0,50,120,220').split(',').filter((x) => x !== '').map(Number);
  const looks = !t.args.looks ? ['glass-light', 'glass-dark', 'friendly-light'] : t.args.looks === 'all' ? LOOKS : String(t.args.looks).split(',');
  const cells = [];
  for (const look of looks) for (const gap of gaps) cells.push({ via: 'tiles', look, gap, rate });
  if (!t.args.looks && slow > 0) cells.push({ via: 'tiles', look: 'glass-light', gap: 0, rate: slow });
  /* the other presses the reveal hands on (60-ui-core.js, the document's click handler after a press in a reveal): the
     window's look menu (its Glass row, then its Light row) and a control that is no look at all (Continue) */
  if (!t.args.looks && t.args.paths !== '0') for (const r of [rate, slow].filter((x) => x > 0)) {
    cells.push({ via: 'menu', look: 'glass-light', gap: 0, rate: r });
    cells.push({ via: 'continue', look: 'glass-dark', gap: 0, rate: r });
  }
  /* FO-243 round 2: a press held through the reveal, released on its own control (applies) or dragged off onto the
     heading and released there (cancelled) */
  if (!t.args.looks && t.args.press !== '0') for (const r of [rate, slow].filter((x) => x > 0)) for (const press of ['hold', 'off']) {
    cells.push({ via: 'tiles', look: 'glass-light', gap: 0, rate: r, press });
    cells.push({ via: 'continue', look: 'glass-dark', gap: 0, rate: r, press });
  }
  const HOLD_MS = 2600, HEAD = '#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-title';
  const R = '#pm-o55-onboarding';
  const VIA = {
    tiles: (fam, mode) => [`${R} ${LAYER} .o55-tile[data-o55-do="pickFamily"][data-arg="${fam}"]`, `${R} ${LAYER} [data-o55-do="pickMode"][data-arg="${mode}"]`],
    menu: (fam, mode) => [`${R} .o55-lookmenu [data-o55-do="lookFamily"][data-arg="${fam}"]`, `${R} .o55-lookmenu [data-o55-do="lookMode"][data-arg="${mode}"]`],
    continue: (fam) => [`${R} ${LAYER} .o55-tile[data-o55-do="pickFamily"][data-arg="${fam}"]`, `${R} .o55-foot [data-o55-do="next"]`]
  };
  const NAME = { tiles: (fam, mode) => `${fam} then ${mode}`, menu: (fam, mode) => `look menu ${fam} then ${mode}`, continue: (fam) => `${fam} then Continue` };

  const PRESS = { click: '', hold: ', held and released on it', off: ', held, dragged off and released on the heading' };
  for (const { via, look, gap, rate: r, press = 'click' } of cells) {
    const [fam, mode] = look.split('-');
    const [sel1, sel2] = VIA[via](fam, mode), name = NAME[via](fam, mode) + PRESS[press];
    await t.step(`${name}, ${gap} ms apart, CPU ${r}x`, async () => {
      const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', settleMs: 1500 });
      await f.waitForFunction(() => window.O55 && O55.S && O55.S.sess && O55.S.sess.screen === 'welcome', null, { timeout: 40000 });
      await f.locator(`${LAYER}:not(.o55-hold) [data-o55-do="start"]`).filter({ visible: true }).first().click({ timeout: 15000 });
      await f.waitForFunction(() => O55.S.sess.screen === 'look' && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-hold')
        && document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer').length === 1, null, { timeout: 20000 });
      await sleep(600);
      /* a mode the window already has would look applied even if its press were lost: change to the other one first */
      let pre = '';
      const had = await f.evaluate(() => O55.theme().selectedMode);
      if (via !== 'continue' && press === 'click' && had === mode && (mode === 'light' || mode === 'dark')) {
        const other = mode === 'dark' ? 'light' : 'dark';
        await f.locator(`${R} ${LAYER} [data-o55-do="pickMode"][data-arg="${other}"]`).filter({ visible: true }).first().click({ timeout: 10000 });
        await f.waitForFunction((m) => O55.theme().selectedMode === m && !O55.S.vt && !document.documentElement.hasAttribute('data-o55-vt'), other, { timeout: 30000 });
        await sleep(600);
        pre = `, ${other} first`;
      }
      if (via === 'menu') {
        await f.locator(`${R} .o55-lookslot [data-o55-do="lookMenu"]`).filter({ visible: true }).first().click({ timeout: 10000 });
        await f.locator(sel1).filter({ visible: true }).first().waitFor({ timeout: 10000 });
        await sleep(400);
      }
      const one = f.locator(sel1).filter({ visible: true }).first();
      await one.scrollIntoViewIfNeeded();
      // the frame's offset on the page (0 on the normal page): boxes are read inside the frame, clicks are the page's
      const bp = await one.boundingBox(), fr = await one.evaluate((b) => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y }; });
      const off = { x: bp.x - fr.x, y: bp.y - fr.y };
      const at = (sel) => f.evaluate((q) => {
        const b = [...document.querySelectorAll(q)].find((n) => n.getClientRects().length);
        if (!b) return null;
        const r = b.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2, e = document.elementFromPoint(x, y);
        /* (while a reveal plays the browser gives every hit to the page root, and the page hands the press on to what is
           under it: that is the press under test, not a cover) */
        return { x, y, hit: !!(e && (b.contains(e) || e === document.documentElement)), at: e ? (e.className && e.className.baseVal === undefined ? String(e.className) : e.tagName).slice(0, 40) : null };
      }, sel);
      const p1 = await at(sel1), p2 = await at(sel2);
      if (!p1 || !p2) throw new Error(`no control for ${!p1 ? sel1 : sel2}`);
      const start = await f.evaluate(() => O55.theme().slug);
      // the page's main thread, and the sandbox's frame when it is a target of its own
      const cdps = [await t.page.context().newCDPSession(t.page)];
      if (f !== t.page.mainFrame()) { try { cdps.push(await t.page.context().newCDPSession(f)); } catch (_) { /* same process as the page */ } }
      const spin = () => f.evaluate(() => { const a = performance.now(); let x = 0; for (let i = 0; i < 3e6; i++) x += i % 7; return performance.now() - a + (x < 0 ? 1 : 0); });
      const before = await spin();
      for (const c of cdps) await c.send('Emulation.setCPUThrottlingRate', { rate: r });
      let slowed = 0, cover = '';
      try {
        slowed = (await spin()) / Math.max(before, 0.1);
        await t.page.mouse.click(p1.x + off.x, p1.y + off.y);
        if (gap) await sleep(gap);
        const t0 = Date.now();
        let m = await at(sel2);
        const first = m && !m.hit ? m.at : null;
        while (!(m && m.hit) && Date.now() - t0 < 30000) { await sleep(100); m = await at(sel2); }
        cover = !(m && m.hit) ? `second control never clear (under ${m && m.at})` : first ? `second control under ${first} for ${Date.now() - t0} ms` : 'second control clear at once';
        m = m || p2;
        if (press === 'click') await t.page.mouse.click(m.x + off.x, m.y + off.y);
        else {
          /* the page's own view of the press: did its root take it (a reveal playing), and how long was it held */
          await f.evaluate(() => {
            const w = window.__fo243 = { down: null, up: null };
            addEventListener('pointerdown', (e) => { if (!w.down) w.down = { t: performance.now(), vt: !!O55.S.vt, root: e.target === document.documentElement }; }, { capture: true, once: true });
            addEventListener('pointerup', (e) => { if (!w.up) w.up = { t: performance.now(), x: e.clientX, y: e.clientY }; }, { capture: true, once: true });
          });
          const x0 = m.x + off.x, y0 = m.y + off.y, d0 = Date.now();
          await t.page.mouse.move(x0, y0);
          await t.page.mouse.down();
          if (press === 'hold') await t.page.mouse.move(x0 + 3, y0 + 2);
          else {
            const h = await f.evaluate((q) => { const n = document.querySelector(q); if (!n) return null; const b = n.getBoundingClientRect(); return { x: b.x + Math.min(b.width / 2, 60), y: b.y + b.height / 2 }; }, HEAD);
            if (!h) throw new Error('no heading to release on');
            await t.page.mouse.move(h.x + off.x, h.y + off.y, { steps: 3 });
          }
          const left = HOLD_MS - (Date.now() - d0);
          if (left > 0) await sleep(left);
          await t.page.mouse.up();
        }
      } finally {
        for (const c of cdps) { await c.send('Emulation.setCPUThrottlingRate', { rate: 1 }).catch(() => {}); await c.detach().catch(() => {}); }
      }
      // settled: no reveal waiting or playing, and the same look and screen for a whole second
      const read = () => f.evaluate(() => ({ th: O55.theme(), vt: !!O55.S.vt || document.documentElement.hasAttribute('data-o55-vt'), screen: O55.S.sess.screen,
        draft: [O55.S.sess.drafts.main.theme_family, O55.S.sess.drafts.main.theme_mode] }));
      let s = await read(), held = 0;
      const until = Date.now() + 90000;
      while (Date.now() < until) {
        await sleep(250);
        const n = await read();
        held = !n.vt && !s.vt && n.th.slug === s.th.slug && n.th.selectedMode === s.th.selectedMode && n.screen === s.screen ? held + 250 : 0;
        s = n;
        if (held >= 1000) break;
      }
      /* a held press: it began in the reveal (the root took it), and the point it was released at is the heading itself
         (no control), read on the settled page; a press 2.6 s held but released on its own control is in that control */
      let pr = null, how = '';
      if (press !== 'click') {
        pr = await f.evaluate(([q2, qh]) => {
          const w = window.__fo243 || {}, d = w.down, u = w.up;
          const e = u ? document.elementFromPoint(u.x, u.y) : null, c = document.querySelector(q2), h = document.querySelector(qh);
          return { inReveal: !!(d && d.vt && d.root), heldMs: d && u ? Math.round(u.t - d.t) : null,
            onHeading: !!(e && h && h.contains(e) && !e.closest('button, a[href], input, [data-o55-do], [role="button"]')), onControl: !!(e && c && c.contains(e)),
            at: e ? (e.className && e.className.baseVal === undefined ? String(e.className) : e.tagName).slice(0, 40) : null };
        }, [sel2, HEAD]);
        how = `, pressed in the reveal ${pr.inReveal}, held ${pr.heldMs} ms, released on ${pr.at} (heading ${pr.onHeading}, its control ${pr.onControl})`;
      }
      const got = `from ${start}${pre}: ${JSON.stringify(s.th)}, draft ${s.draft.join('/')}, screen ${s.screen}, settled ${held >= 1000}, ${cover}${how}, CPU slowed ${slowed.toFixed(1)}x on ${cdps.length} target(s)`;
      t.log(`${via} ${look} gap ${gap} rate ${r} ${press}: ${got}`);
      const is = (fm, md) => held >= 1000 && s.th.chosen === fm && s.th.selectedMode === md && s.draft[0] === fm && s.draft[1] === md;
      const looked = is(fam, mode), real = !pr || (pr.inReveal && (press === 'off' ? pr.onHeading : pr.onControl));
      if (press === 'off' && via === 'continue') await t.check(`Continue dragged off in ${fam}'s reveal is cancelled: Look stays (CPU ${r}x)`, real && is(fam, 'dark') && s.screen === 'look', got);
      else if (press === 'off') await t.check(`${mode} dragged off in ${fam}'s reveal is cancelled: ${fam} dark stays (CPU ${r}x)`, real && is(fam, 'dark') && s.screen === 'look', got);
      else if (via === 'continue') await t.check(`${fam} kept and Continue went on (${gap} ms${PRESS[press]}, CPU ${r}x)`, real && looked && s.screen === 'where', got);
      else await t.check(`${via === 'menu' ? 'look menu ' : ''}${fam} ${mode} applied (${gap} ms${PRESS[press]}, CPU ${r}x)`, real && looked, got);
    });
  }
  /* pre-existing on main in T3's sandbox, not FO-243's: a screen the page's own timer settles focuses its heading
     without user activation, which the sandbox's permissions policy refuses and logs (as fresh-reset-project). Consumed
     by its exact message; any other console error still fails the run-wide console check. */
  if (t.app.sandboxed(false)) await t.noConsoleErrors('console (sandbox focus policy)', { allow: [/Permissions policy violation: focus-without-user-activation/] });
}
