/* pip_loops.mjs: Pip's chat loops rest when nobody can see them, and the sheet's Pip carries no SVG ids (W4, PM7 build;
 * Astra M1 review, Major 2 and Minor 1). OWNER: pm7-chatpip. Read-only on the repository; headless GPU Chrome through
 * agent-browser (chrome.mjs).
 *
 * The chat has two Pip loops of its own (5.6 Pro pip.css): the sheet's Pip sways at rest (pmx-pip-sway, pmx-pip-card;
 * PC1) and the live Orbit's thinking dots bob (pmx-pip-dot). pip.js marks their host data-pip-run="on"/"off" from an
 * IntersectionObserver and the tab's visibility; a drag pauses them through pm7-port 95-perf-scope.css; Reduced Motion
 * removes them. This compares the loops' animation clocks (Animation.currentTime) before, during and after each case:
 *
 *   orbit-in-view       a live Orbit on screen: dots running, clock advancing
 *   orbit-offscreen     the transcript wheeled to its top, the Orbit out of its clip: run off, paused, clock still
 *   orbit-back          wheeled back down: run on, running, clock advancing again
 *   drag                the chat resizer held mid-drag (a body drag class): run off, the dots paused, clock still
 *   drag-released       let go: running again
 *   orbit-hidden-tab    the window minimized (the page hidden): run off, clock still
 *   sheet-in-view       the Crew sheet open: sway and sign running, clock advancing
 *   sheet-hidden-tab    the window minimized: run off, clock still
 *   sheet-back          restored: running, clock advancing
 *   reduced             prefers-reduced-motion: reduce: no loop animation on either host
 *   sheet-head-no-ids   in all ten looks, the sheet's Pip (PM56_SHELL.pmxPipHost, eight faces) has no SVG id and no
 *                       url(#...) reference, draws the same twice, and the open sheet's live head has none either
 * A hidden-tab case is a SKIP where the browser keeps a minimized page visible. A modal sheet can't be scrolled away
 * or have its page hidden while open (its scrim covers the app); the observer that would pause it is the Orbit's.
 *
 * Usage: node pip_loops.mjs <PMConcept7.html> [--out report.json]
 * Exits 0 when every case passes (a SKIP is reported, not failed), 1 when a case fails, 2 on a crash. */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch, sleep } from './chrome.mjs';

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith('--'));
const outAt = argv.indexOf('--out');
const out = outAt >= 0 ? argv[outAt + 1] : null;
if (!file) { console.error('usage: node pip_loops.mjs <PMConcept7.html> [--out report.json]'); process.exit(2); }

const ORBIT = '#pmRoot .orbit-core-face.is-live';
const SHEET = '.pmx-sheet:not(.pmx-ghost) > .pmx-head > .pmx-pip-host';
const DOTS = ['pmx-pip-dot'], SWAY = ['pmx-pip-sway', 'pmx-pip-card'];
const LOOKS = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
const results = [];
function record(name, pass, detail) { results.push({ name, result: pass === null ? 'SKIP' : pass ? 'PASS' : 'FAIL', detail }); console.log((pass === null ? 'SKIP' : pass ? 'PASS' : 'FAIL') + '  ' + name + '  ' + JSON.stringify(detail)); }

/* the newest host of a kind, its run mark, its box and its clip's box, and its named loops' clocks */
function sample(page, sel, names) {
  return page.evaluate((sel, names) => {
    const all = [...document.querySelectorAll(sel)], el = all[all.length - 1];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    let sc = el.closest('.transcript');
    for (let p = el.parentElement; p && !sc; p = p.parentElement) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowY) && p.clientHeight < p.scrollHeight) sc = p; }
    const q = sc && sc.getBoundingClientRect(), clip = q ? [Math.round(q.top), Math.round(q.bottom)] : null;
    return { run: el.getAttribute('data-pip-run'), n: all.length, box: [Math.round(r.top), Math.round(r.bottom), Math.round(r.width)], clip, view: innerHeight,
      anims: el.getAnimations({ subtree: true }).filter((a) => names.includes(a.animationName)).map((a) => ({ name: a.animationName, state: a.playState, t: Math.round(a.currentTime * 10) / 10 })) };
  }, sel, names);
}
/* a press where a person's pointer would land, without scrolling anything into view first */
async function press(page, sel) {
  const at = await page.evaluate((sel) => { const el = [...document.querySelectorAll(sel)].find((e) => e.getClientRects().length); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
  if (!at) throw new Error('press: nothing visible at ' + sel);
  await page.mouse(at.x, at.y);
}
const DRAGS = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
/* three samples 350 ms apart: does each loop's clock move? */
async function watch(page, sel, names) {
  const s = [];
  for (let i = 0; i < 3; i++) { if (i) await sleep(350); s.push(await sample(page, sel, names)); }
  const first = s[0], last = s[2];
  if (!first || !last) return { gone: true, samples: s };
  const moved = first.anims.map((a, i) => (last.anims[i] ? last.anims[i].t - a.t : 0));
  return { run: last.run, n: last.n, states: [...new Set(last.anims.map((a) => a.state))], loops: last.anims.length, moved, box: last.box, clip: last.clip, view: last.view };
}
const running = (w) => !w.gone && w.loops > 0 && w.states.length === 1 && w.states[0] === 'running' && w.moved.every((d) => d > 250);
const resting = (w, run) => !w.gone && w.loops > 0 && (!run || w.run === run) && w.states.every((s) => s === 'paused') && w.moved.every((d) => Math.abs(d) < 1);

let b = null, code = 0;
try {
  b = await launch({ width: 1920, height: 600 });
  const { page } = b;
  await page.goto(pathToFileURL(resolve(file)).href + '?o55=off&cb=' + Date.now());
  await page.waitFor(() => !!(window.PM56_EXT && window.PM56_EXT.ctx && window.PM56_PIP && document.querySelector('#pmRoot .composer-box, #pmRoot .chat-stage')), { timeout: 90000 });
  await sleep(1200);
  const gpu = await page.evaluate(() => { const g = document.createElement('canvas').getContext('webgl'); const x = g && g.getExtension('WEBGL_debug_renderer_info'); return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : 'none'; });
  console.log('renderer: ' + gpu);

  /* the window minimized and restored (the page's visibilityState goes hidden where the browser supports it) */
  const { targetInfos } = await b.send('Target.getTargets');
  const tg = targetInfos.find((t) => t.type === 'page' && t.url.startsWith('file:'));
  const { windowId } = tg ? await b.send('Browser.getWindowForTarget', { targetId: tg.targetId }).catch(() => ({})) : {};
  async function hiddenTab(name, sel, names) {
    if (!windowId) return record(name, null, 'no browser window to minimize');
    await b.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
    await sleep(500);
    const hidden = await page.evaluate(() => document.visibilityState === 'hidden');
    if (hidden) { const w = await watch(page, sel, names); record(name, resting(w, 'off'), w); }
    else record(name, null, 'the page stays visible when its window is minimized in this browser');
    await b.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    await sleep(600);
  }
  async function reducedNow(sel, names) {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await sleep(500);
    const r = await sample(page, sel, names);
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await sleep(300);
    return r ? r.anims.length : null;
  }

  /* ---- the live Orbit: a recorded agent turn ("fix the rollback path") at the end of the open thread, whose earlier
     turns give the transcript room to scroll the Orbit away */
  await page.evaluate(() => { const c = PM56_EXT.ctx(); c.state.mode = 'Agent'; c.renderApp(); });
  await press(page, '#pmRoot textarea[data-input="composer"]');
  await page.type('Please fix the rollback path');
  await press(page, '#pmRoot .composer [data-action="send"]');
  await page.waitFor((sel) => !!document.querySelector(sel), { args: [ORBIT], timeout: 20000 });
  await sleep(700);
  let w = await watch(page, ORBIT, DOTS);
  record('orbit-in-view', running(w) && w.run === 'on', w);

  /* wheel the transcript to its top: the Orbit leaves the transcript's clip */
  /* the pointer rests near the transcript's top left (over the transcript, clear of the Orbit's own panel), then wheels */
  const tx = await page.evaluate(() => { const q = document.querySelector('#pmRoot .transcript').getBoundingClientRect(); return { x: q.left + 40, y: q.top + 30 }; });
  const wheel = async (dy, n) => { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: tx.x, y: tx.y }); for (let i = 0; i < n; i++) { await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: tx.x, y: tx.y, deltaX: 0, deltaY: dy }); await sleep(60); } await sleep(500); };
  const metrics = () => page.evaluate(() => { const t = document.querySelector('#pmRoot .transcript'); return [Math.round(t.scrollTop), t.scrollHeight, t.clientHeight]; });
  const before = await metrics();
  await wheel(-600, 6);
  w = await watch(page, ORBIT, DOTS);
  w.scroll = [before, await metrics()];
  record('orbit-offscreen', !w.gone && !!w.clip && (w.box[0] >= w.clip[1] || w.box[1] <= w.clip[0]) && resting(w, 'off'), w);
  await wheel(600, 8);
  w = await watch(page, ORBIT, DOTS);
  w.scroll = await metrics();
  record('orbit-back', running(w) && w.run === 'on', w);

  /* a drag: the chat's resizer held part way (registerResizer puts body.pm-resizing on) */
  const rz = await page.evaluate(() => { const r = document.getElementById('chatResizer'); if (!r) return null; const q = r.getBoundingClientRect(); return q.width ? { x: q.left + q.width / 2, y: q.top + q.height / 2 } : null; });
  if (rz) {
    await page.mouse(rz.x, rz.y, { up: false });
    for (let i = 1; i <= 6; i++) { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rz.x - i * 2, y: rz.y, button: 'left', buttons: 1 }); await sleep(30); }
    await sleep(250);
    const drag = await page.evaluate((d) => d.filter((c) => document.body.classList.contains(c)), DRAGS);
    w = await watch(page, ORBIT, DOTS);
    await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rz.x - 12, y: rz.y, button: 'left', clickCount: 1 });
    record('drag', drag.length > 0 && resting(w, 'off'), Object.assign({ bodyDrag: drag }, w));
    await sleep(500);
    w = await watch(page, ORBIT, DOTS);
    record('drag-released', running(w), w);
  } else record('drag', false, 'no chat resizer on screen');

  await hiddenTab('orbit-hidden-tab', ORBIT, DOTS);
  const redOrbit = await reducedNow(ORBIT, DOTS);

  /* ---- the sheet's Pip: the Crew sheet, as Demo Studio's "Pip · the sheet's faces" opens it. A modal sheet can't be
     scrolled away or its page hidden while it is open (its scrim covers the app and holds the chat's shortcuts), so
     its out-of-view case is the hidden tab; the observer that pauses it is the Orbit's, proven above. */
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.kind = 'crew'; b.dataset.auto = '0'; PM56_EXT.run('collab-open-configure', b, new Event('click')); const c = PM56_EXT.ctx(); if (c.renderOverlays) c.renderOverlays(); });
  await page.waitFor((sel) => !!document.querySelector(sel), { args: [SHEET], timeout: 15000 });
  await sleep(900);
  w = await watch(page, SHEET, SWAY);
  record('sheet-in-view', running(w) && w.run === 'on', w);
  await hiddenTab('sheet-hidden-tab', SHEET, SWAY);
  w = await watch(page, SHEET, SWAY);
  record('sheet-back', running(w) && w.run === 'on', w);
  const redSheet = await reducedNow(SHEET, SWAY);
  record('reduced', redSheet === 0 && redOrbit === 0, { sheetLoops: redSheet, orbitLoops: redOrbit });

  /* ---- the sheet's Pip is drawn with no SVG ids (an exit copy strips ids; W4), the same each time, in every look */
  const bad = [];
  for (const lk of LOOKS) {
    const [family, mode] = lk.split('-'), nier = family === 'nier', painted = nier ? 'basic-' + mode : lk;
    await page.evaluate((family, mode, nier) => {
      PM_THEME.setFamily(nier ? 'basic' : family, { persist: false }); PM_THEME.setMode(mode, { persist: false });
      PM_NIER.preview({ on: nier }, { within: null, instant: true, sound: false });
    }, family, mode, nier);
    await page.waitFor((painted, nier) => document.documentElement.dataset.theme === painted && (document.documentElement.dataset.o55Nier === 'on') === nier, { args: [painted, nier], timeout: 15000 });
    await sleep(600);
    const r = await page.evaluate((moods) => {
      const S = window.PM56_SHELL, out = { drawn: 0, ids: [], unequal: [], live: null };
      for (const m of moods) {
        const a = S.pmxPipHost('crew', m), b2 = S.pmxPipHost('crew', m);
        if (!a) continue;
        out.drawn++;
        if (/\sid="|url\(#/.test(a)) out.ids.push(m + ': ' + (a.match(/\sid="[^"]*"|url\(#[^)]*\)/) || [''])[0]);
        if (a !== b2) out.unequal.push(m);
      }
      const h = document.querySelector('.pmx-sheet:not(.pmx-ghost) > .pmx-head > .pmx-pip-host');
      out.live = h ? { ids: h.querySelectorAll('[id]').length, urls: /url\(#/.test(h.innerHTML), fam: (h.querySelector('svg') || {}).getAttribute && h.querySelector('svg').getAttribute('data-fam') } : null;
      return out;
    }, ['idle', 'watch', 'wonder', 'oops', 'happy', 'think', 'sleep', 'dots']);
    if (!r.drawn || r.ids.length || r.unequal.length || !r.live || r.live.ids || r.live.urls) bad.push(Object.assign({ look: lk }, r));
  }
  record('sheet-head-no-ids', bad.length === 0, bad.length ? bad : { looks: LOOKS.length, faces: 8 });

  if (page.errors.length) console.log('page errors: ' + page.errors.slice(0, 5).join(' | '));
  code = results.some((r) => r.result === 'FAIL') ? 1 : 0;
  if (out) writeFileSync(out, JSON.stringify({ file: resolve(file), renderer: gpu, results, errors: page.errors.slice(0, 20) }, null, 2));
} catch (e) {
  console.error('crash: ' + (e && e.stack || e));
  code = 2;
} finally {
  if (b) await b.close();
}
console.log(code === 0 ? 'pip_loops: ok' : code === 1 ? 'pip_loops: FAIL' : 'pip_loops: crash');
process.exit(code);
