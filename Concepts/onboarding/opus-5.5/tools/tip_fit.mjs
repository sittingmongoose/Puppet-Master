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
 * shared ones (pip.tips.common, pip.tips.chrome) once per look, size and version, on the AI list.
 * Exit 1 too when Pip's stage moves where it is painted (final run FO-15: Glass's stage, a scroll container whose world
 * reached past its box, was scrolled 250 px left and 60 up after a note closed, another opened and Expert was chosen,
 * while every width measured fine): before and after each note opens and closes, and across a switch between Plain
 * English and Expert with a note open, the stage's rect, the overlay that carries Pip's world and the scroll offset of
 * the stage and every ancestor must stay put; so must they when the note's x is scrolled into view and the stage's controls
 * are focused while the note moves (what Tab and a driver's hover do), and no box from the stage up may take a scroll. */
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
/* --screens a,b: only those screens' notes (a merge that changed a few); 'common' or 'chrome' measures the shared notes on ai-all */
const only = opt('screens', '') ? new Set(opt('screens', '').split(',')) : null;
const rows = [];
let leaves = 0, wide = 0, moved = 0, switches = 0;
/* in the page: open one note and measure it (on the stage, or in the form where the stage is a strip) */
const MEASURE = async (s, ids, defined) => {
  const sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.getElementById('pm-o55-onboarding');
  if (!root) return { missing: true, why: 'no onboarding window' };
  const layout = root.getAttribute('data-o55-layout');
  const L = root.querySelector(`.o55-pane > .o55-layer[data-screen="${s}"]:not(.o55-out)`);
  if (!L) return { missing: true };
  /* the stage's base is taken once the window has finished opening: a look's first screen measured mid-opening read the
     window's own scale-in (1-2 px) and Retro's unfolding (the overlay 114,273 then 24,24) as the stage moving */
  const win = root.querySelector('.o55-win');
  for (let i = 0; i < 40 && (root.classList.contains('o55-opening') || (win && win.getAnimations && win.getAnimations().some((x) => x.playState === 'running'))); i++) await sleep2(100);
  const over = (els) => els.filter(Boolean).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.className.split(' ')[0] + ' ' + e.scrollWidth + '>' + e.clientWidth);
  /* where the stage is painted: its rect, the overlay's (Pip's world rides on it), and every scrolled box from the stage up */
  const anchor = () => {
    const st = root.querySelector('.o55-stage'); if (!st) return null;
    const ov = st.querySelector('.pst-overlay') || st.firstElementChild, a = st.getBoundingClientRect(), o = ov ? ov.getBoundingClientRect() : a;
    const scrolled = []; for (let e = st; e; e = e.parentElement) if (e.scrollLeft || e.scrollTop) scrolled.push(String(e.className).split(' ')[0] + ' ' + e.scrollLeft + ',' + e.scrollTop);
    /* (the stage's place in its panel by layout, which the window's opening scale and a look's preview leave alone; the
       painted offset is the overlay's from the stage, and every box's scroll) */
    return { st: [st.offsetLeft, st.offsetTop, st.offsetWidth, st.offsetHeight], ov: [o.left - a.left, o.top - a.top].map(Math.round), scrolled };
  };
  const shifted = (b, a) => !!(b && a && (a.scrolled.length || a.st.some((v, i) => Math.abs(v - b.st[i]) > 1) || a.ov.some((v, i) => Math.abs(v - b.ov[i]) > 1)));
  const base = anchor();
  const got = [];
  for (const id of ids) {
    if (defined && !window.O55.tips.of(id)) continue;
    window.O55.ui.tip(id); await sleep2(160);
    const stage = root.querySelector('.o55-stage'), note = root.querySelector('.o55-stage .pst-tip.on, .o55-stage .pst-ntip.on');
    if (note && stage) {
      const sr = stage.getBoundingClientRect(), nr = note.getBoundingClientRect(), t = note.querySelector('.pst-tip-t');
      const rr = (x) => [x.left, x.top, x.right, x.bottom].map(Math.round), hx = over([note, t, note.querySelector('.pst-tip-h')]);
      const now = anchor();
      got.push({ id, where: 'stage', defined: !!defined, h: Math.round(nr.height), room: Math.round(sr.height), note: rr(nr), stage: rr(sr), out: nr.top < sr.top - 1 || nr.bottom > sr.bottom + 1 || nr.left < sr.left - 1 || nr.right > sr.right + 1, scrolls: !!(t && t.scrollHeight > t.clientHeight + 1), wide: hx.length ? hx : null, moved: shifted(base, now) ? { base, now } : null });
    } else if (!defined) {
      const ex = L.querySelector('#pm7ob-explainer'), pr = L.getBoundingClientRect(), er = ex && ex.getBoundingClientRect();
      const hx = ex ? over([ex, ex.querySelector('.o55-explainer-t'), ex.querySelector('.o55-explainer-h')]) : [];
      got.push({ id, where: 'form', out: !!(er && (er.left < pr.left - 1 || er.right > pr.right + 1)), wide: hx.length ? hx : null });
    }
    window.O55.ui.closeTip(false); await sleep2(60);
    const after = anchor(); if (shifted(base, after)) got.push({ id: id + ' (closed)', where: 'stage', defined: !!defined, moved: { base, now: after } });
  }
  return { layout, got };
};
/* a note open, then the other version and back: the stage stays where it is painted */
const SWITCH = async (s, id) => {
  const sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.getElementById('pm-o55-onboarding'); if (!root) return null;
  const anchor = () => {
    const st = root.querySelector('.o55-stage'); if (!st) return null;
    const ov = st.querySelector('.pst-overlay') || st.firstElementChild, a = st.getBoundingClientRect(), o = ov ? ov.getBoundingClientRect() : a;
    const scrolled = []; for (let e = st; e; e = e.parentElement) if (e.scrollLeft || e.scrollTop) scrolled.push(String(e.className).split(' ')[0] + ' ' + e.scrollLeft + ',' + e.scrollTop);
    /* (the stage's place in its panel by layout, which the window's opening scale and a look's preview leave alone; the
       painted offset is the overlay's from the stage, and every box's scroll) */
    return { st: [st.offsetLeft, st.offsetTop, st.offsetWidth, st.offsetHeight], ov: [o.left - a.left, o.top - a.top].map(Math.round), scrolled };
  };
  const shifted = (b, a) => !!(b && a && (a.scrolled.length || a.st.some((v, i) => Math.abs(v - b.st[i]) > 1) || a.ov.some((v, i) => Math.abs(v - b.ov[i]) > 1)));
  /* the mechanism itself: a box that clips the stage must not take a scroll (focus, scrollIntoView and scroll anchoring
     all scroll such a box; a clipped-but-scrollable stage moved in FO-15). Each box from the stage up is nudged by 40 px
     and put back; any that moves is reported. */
  const can = [];
  const boxes = []; for (let e = root.querySelector('.o55-stage'); e && e !== root; e = e.parentElement) boxes.push(e);
  /* (and the clipped boxes inside the stage, Retro's tube and sheet among them; the note's text is meant to scroll) */
  root.querySelectorAll('.o55-stage *').forEach((e) => {
    if (e.matches('.pst-tip-t') || e.closest('.pst-tip-t')) return;
    const cs = getComputedStyle(e); if (!/hidden|auto|scroll/.test(cs.overflow)) return;
    if (/inset\(50%/.test(cs.clipPath) || (e.offsetWidth <= 1 && e.offsetHeight <= 1)) return; /* a screen reader's copy: nothing painted moves */
    boxes.push(e);
  });
  for (const e of boxes) {
    const l = e.scrollLeft, t = e.scrollTop; e.scrollLeft = l + 40; e.scrollTop = t + 40;
    if (e.scrollLeft !== l || e.scrollTop !== t) can.push(String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).split(' ')[0] + ' took ' + (e.scrollLeft - l) + ',' + (e.scrollTop - t));
    e.scrollLeft = l; e.scrollTop = t;
  }
  const base = anchor(), was = window.O55.talk.mode(), other = was === 'ELI5' ? 'Expert' : 'ELI5';
  const out = can.length ? [{ step: 'the stage can be scrolled: ' + can.join('; '), base, now: base }] : [];
  if (!id) return out;
  /* what Tab and a driver's hover do: a note just opened (still easing in), its x scrolled into view and every control in
     the stage focused in turn, several times while it moves; every box from the stage up stays at 0 */
  window.O55.ui.tip(id); await sleep2(30);
  for (let i = 0; i < 6; i++) {
    const st = root.querySelector('.o55-stage'), x = st && st.querySelector('.pst-tip.on .pst-tip-x, .pst-ntip.on .pst-tip-x');
    if (x) x.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (st) st.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"]), input').forEach((el) => { try { el.focus(); } catch (_) {} });
    await sleep2(50);
    const a = anchor(); if (a && a.scrolled.length) { out.push({ step: id + ' x scrolled into view and stage controls focused while it moves', base, now: a }); break; }
  }
  window.O55.ui.closeTip(false); await sleep2(80);
  for (let e = root.querySelector('.o55-stage'); e && e !== root; e = e.parentElement) { e.scrollLeft = 0; e.scrollTop = 0; }
  window.O55.ui.tip(id); await sleep2(200);
  window.O55.talk.set(other, 'tip_fit'); await sleep2(350); const a1 = anchor(); if (shifted(base, a1)) out.push({ step: id + ' open, then ' + other, base, now: a1 });
  window.O55.talk.set(was, 'tip_fit'); await sleep2(350); const a2 = anchor(); if (shifted(base, a2)) out.push({ step: id + ' open, then back to ' + was, base, now: a2 });
  window.O55.ui.closeTip(false); await sleep2(60);
  return out;
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
      const screens = (await page.evaluate(() => Object.keys(window.O55.screens.defs))).filter((x) => !only || only.has(x));
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
          for (const g of res.got.concat(res2.got || [])) { rows.push(Object.assign({ look, size: `${w}x${h}`, mode, screen, layout: res.layout }, g)); if (g.out) leaves++; if (g.wide) wide++; if (g.moved) moved++; }
          const sw = await page.evaluate(`(${SWITCH.toString()})(${JSON.stringify(screen)}, ${JSON.stringify(shown[shown.length - 1] || own[0] || null)})`);
          for (const m of sw || []) { rows.push({ look, size: `${w}x${h}`, mode, screen, layout: res.layout, id: m.step, where: 'stage', switch: true, moved: { base: m.base, now: m.now } }); moved++; }
          switches++;
        }
        /* the shared tips (provider, field, group and chrome ones), once on the AI list */
        await page.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'ai-all' })); await sleep(1300);
        const shared = await page.evaluate(() => Object.keys(window.O55.tx('pip.tips.common') || {}).concat(Object.keys(window.O55.tx('pip.tips.chrome') || {})));
        const res3 = await page.evaluate(`(${MEASURE.toString()})("ai-all", ${JSON.stringify(shared)}, true)`);
        for (const g of res3.got || []) { rows.push(Object.assign({ look, size: `${w}x${h}`, mode, screen: 'shared (on ai-all)', layout: res3.layout }, g)); if (g.out) leaves++; if (g.wide) wide++; if (g.moved) moved++; }
      }
    }
  } finally { await close(); }
}
const scrolls = rows.filter((r) => r.scrolls), outs = rows.filter((r) => r.out), wides = rows.filter((r) => r.wide), moves = rows.filter((r) => r.moved);
writeFileSync(out, JSON.stringify({ notes: rows.filter((r) => !r.switch && !/\(closed\)$/.test(r.id || '')).length, leaves: outs.length, scrolls: scrolls.length, wider_than_note: wides.length, stage_moved: moves.length, version_switches: switches, outs, scrolls_list: scrolls, wide_list: wides, moved_list: moves, rows }, null, 1));
const miss = rows.filter((r) => r.missing), notes = rows.filter((r) => !r.missing && !r.switch && !/\(closed\)$/.test(r.id || ''));
console.log(JSON.stringify({ out, notes: notes.length, shown_at_first: notes.filter((r) => !r.defined).length, defined_only: notes.filter((r) => r.defined).length, leave_the_window: outs.length, scroll_inside: scrolls.length, wider_than_note: wides.length, stage_moved: moves.length, version_switches_checked: switches, missing: miss.length, missing_screens: Array.from(new Set(miss.map((r) => r.screen + ' (' + r.why + ')'))) }));
process.exit(leaves || wide || moved ? 1 : 0);
