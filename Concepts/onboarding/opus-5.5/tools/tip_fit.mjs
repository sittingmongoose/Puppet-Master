/* Every ? note against the window: for each look, window size and version (Plain English, Expert), every screen is
 * opened and each ? it shows is opened in turn; the note on Pip's stage (a wide window) must stay whole on the stage, and
 * the check records whether its words fit or have to scroll inside it. A note in the form (a short or narrow window)
 * scrolls with the pane, so only its width is checked there.
 *   node tools/tip_fit.mjs <out.json> [--page <path>] [--looks basic,friendly,glass,retro,nier] [--sizes 1100x760,1280x720]
 * Exit 1 when a note leaves the stage. (The pattern review, 2026-10-30: an Expert note ran off a 1080 by 720 window.)
 * Exit 1 too when a note's words are wider than the note (final run FO-14: OPENCODE_SERVER_PASSWORD ran past Pip's note
 * and a sideways scrollbar hid its end): scrollWidth over clientWidth on the note, its text and its title, on the stage
 * and in the form. Besides the ? a screen shows at first, every tip the copy defines for that screen is opened on the
 * stage (a tip behind a choice, like OpenCode's "Use a server I already run" fields, is never shown at first), and the
 * shared ones (pip.tips.common, pip.tips.chrome) once per look, size and version, on the AI list. */
import { launch, sleep } from './chrome.mjs';
import { writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const raw = process.argv.slice(2);
const opt = (k, d) => { const i = raw.indexOf('--' + k); return i >= 0 ? raw[i + 1] : d; };
const pageFile = resolve(opt('page', resolve(here, '../../../PMConcept7.html')));
const out = resolve(raw[0] && !raw[0].startsWith('--') ? raw[0] : '/tmp/o55/tip_fit.json');
const looks = opt('looks', 'basic,friendly,glass,retro,nier').split(',');
const sizes = opt('sizes', '1100x760,1280x720').split(',').map((s) => s.split('x').map(Number));
const rows = [];
let leaves = 0, wide = 0;
/* in the page: open one note and measure it (on the stage, or in the form where the stage is a strip) */
const MEASURE = async (s, ids, defined) => {
  const sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.getElementById('pm-o55-onboarding');
  if (!root) return { missing: true, why: 'no onboarding window' };
  const layout = root.getAttribute('data-o55-layout');
  const L = root.querySelector(`.o55-pane > .o55-layer[data-screen="${s}"]:not(.o55-out)`);
  if (!L) return { missing: true };
  const over = (els) => els.filter(Boolean).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.className.split(' ')[0] + ' ' + e.scrollWidth + '>' + e.clientWidth);
  const got = [];
  for (const id of ids) {
    if (defined && !window.O55.tips.of(id)) continue;
    window.O55.ui.tip(id); await sleep2(160);
    const stage = root.querySelector('.o55-stage'), note = root.querySelector('.o55-stage .pst-tip.on, .o55-stage .pst-ntip.on');
    if (note && stage) {
      const sr = stage.getBoundingClientRect(), nr = note.getBoundingClientRect(), t = note.querySelector('.pst-tip-t');
      const rr = (x) => [x.left, x.top, x.right, x.bottom].map(Math.round), hx = over([note, t, note.querySelector('.pst-tip-h')]);
      got.push({ id, where: 'stage', defined: !!defined, h: Math.round(nr.height), room: Math.round(sr.height), note: rr(nr), stage: rr(sr), out: nr.top < sr.top - 1 || nr.bottom > sr.bottom + 1 || nr.left < sr.left - 1 || nr.right > sr.right + 1, scrolls: !!(t && t.scrollHeight > t.clientHeight + 1), wide: hx.length ? hx : null });
    } else if (!defined) {
      const ex = L.querySelector('#pm7ob-explainer'), pr = L.getBoundingClientRect(), er = ex && ex.getBoundingClientRect();
      const hx = ex ? over([ex, ex.querySelector('.o55-explainer-t'), ex.querySelector('.o55-explainer-h')]) : [];
      got.push({ id, where: 'form', out: !!(er && (er.left < pr.left - 1 || er.right > pr.right + 1)), wide: hx.length ? hx : null });
    }
    window.O55.ui.closeTip(false); await sleep2(60);
  }
  return { layout, got };
};
for (const [w, h] of sizes) {
  const { page, close } = await launch({ width: w, height: h });
  try {
    for (const look of looks) {
      await page.goto(pathToFileURL(pageFile).href + '?o55=off&o55scenario=fresh&cb=' + Date.now());
      await sleep(1200);
      await page.evaluate(async (l) => {
        const nier = l === 'nier', fam = nier ? 'basic' : l;
        window.PM_THEME.setFamily(fam, { persist: false }); window.PM_THEME.setMode('dark', { persist: false });
        try { window.PM7_SETTINGS_TOME.setChromeThemeFamily(fam); window.PM7_SETTINGS_TOME.setChromeThemeMode('dark'); } catch (_) {}
        if (window.PM_NIER) { const on = window.PM_NIER.on() || window.PM_NIER.wanted(); if (nier !== on) { window.PM_NIER.set(nier, { sound: false }); await new Promise((r) => setTimeout(r, 3200)); } }
      }, look);
      await sleep(500);
      const screens = await page.evaluate(() => Object.keys(window.O55.screens.defs));
      for (const mode of ['ELI5', 'Expert']) {
        await page.evaluate((m) => window.O55.talk.set(m, 'tip_fit'), mode);
        for (const screen of screens) {
          await page.evaluate((s) => window.O55.ui.open({ fresh: true, screen: s }), screen);
          await sleep(1300);
          const shownOf = () => page.evaluate((s) => { const L = document.querySelector(`#pm-o55-onboarding .o55-pane > .o55-layer[data-screen="${s}"]:not(.o55-out)`); return L ? Array.from(new Set(Array.from(L.querySelectorAll('[data-o55-do="tip"]')).filter((b) => b.offsetParent).map((b) => b.getAttribute('data-arg')))) : []; }, screen);
          let shown = await shownOf();
          const own = await page.evaluate((s) => Object.keys(window.O55.tx('pip.tips.' + s) || {}), screen);
          let res = await page.evaluate(`(${MEASURE.toString()})(${JSON.stringify(screen)}, ${JSON.stringify(shown)}, false)`);
          /* (a window still opening when measured: open it again once before calling the screen missing) */
          if (res.missing) { await page.evaluate((s) => window.O55.ui.open({ fresh: true, screen: s }), screen); await sleep(2000); shown = await shownOf(); res = await page.evaluate(`(${MEASURE.toString()})(${JSON.stringify(screen)}, ${JSON.stringify(shown)}, false)`); }
          if (res.missing) { rows.push({ look, size: `${w}x${h}`, mode, screen, missing: true, why: res.why || 'no layer' }); continue; }
          const res2 = await page.evaluate(`(${MEASURE.toString()})(${JSON.stringify(screen)}, ${JSON.stringify(own.filter((id) => !shown.includes(id)))}, true)`);
          for (const g of res.got.concat(res2.got || [])) { rows.push(Object.assign({ look, size: `${w}x${h}`, mode, screen, layout: res.layout }, g)); if (g.out) leaves++; if (g.wide) wide++; }
        }
        /* the shared tips (provider, field, group and chrome ones), once on the AI list */
        await page.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'ai-all' })); await sleep(1300);
        const shared = await page.evaluate(() => Object.keys(window.O55.tx('pip.tips.common') || {}).concat(Object.keys(window.O55.tx('pip.tips.chrome') || {})));
        const res3 = await page.evaluate(`(${MEASURE.toString()})("ai-all", ${JSON.stringify(shared)}, true)`);
        for (const g of res3.got || []) { rows.push(Object.assign({ look, size: `${w}x${h}`, mode, screen: 'shared (on ai-all)', layout: res3.layout }, g)); if (g.out) leaves++; if (g.wide) wide++; }
      }
    }
  } finally { await close(); }
}
const scrolls = rows.filter((r) => r.scrolls), outs = rows.filter((r) => r.out), wides = rows.filter((r) => r.wide);
writeFileSync(out, JSON.stringify({ notes: rows.length, leaves: outs.length, scrolls: scrolls.length, wider_than_note: wides.length, outs, scrolls_list: scrolls, wide_list: wides, rows }, null, 1));
const miss = rows.filter((r) => r.missing);
console.log(JSON.stringify({ out, notes: rows.length - miss.length, shown_at_first: rows.filter((r) => !r.missing && !r.defined).length, defined_only: rows.filter((r) => r.defined).length, leave_the_window: outs.length, scroll_inside: scrolls.length, wider_than_note: wides.length, missing: miss.length, missing_screens: Array.from(new Set(miss.map((r) => r.screen + ' (' + r.why + ')'))) }));
process.exit(leaves || wide ? 1 : 0);
