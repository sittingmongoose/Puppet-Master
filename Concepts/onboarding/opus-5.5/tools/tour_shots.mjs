/* Guided Tour screenshots: every step in every theme, taken once the spotlight and the callout have settled, plus the
 * after-state of steps that have one and the dock step mid-drag (the "Let go" state). Themes run in parallel browsers.
 * node tools/tour_shots.mjs <out-dir> [--themes basic-dark,glass-light] [--width 1600] [--height 1000]
 * Writes <out>/<theme>/NN-<step>[-after|-drag].png and <out>/shots.json; tools/tour_sheets.py tiles them. */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
/* Remove a run's Chrome profile (~150 MB). The helper's close() kills Chrome without waiting, and Chrome's helpers
   keep writing for a moment, so wait for the exit, then retry the removal; cleanup never fails the run. */
const dropProfile = async (dir, chrome) => {
  if (chrome && chrome.exitCode === null && chrome.signalCode === null) await new Promise((r) => { chrome.once('exit', r); setTimeout(r, 3000); });
  for (let i = 0; i < 25; i++) { try { rmSync(dir, { recursive: true, force: true }); return; } catch (_) { await new Promise((r) => setTimeout(r, 200)); } }
};

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/tourshots');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const ALL = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
const themes = opt('themes', '') ? opt('themes', '').split(',') : ALL;
const W = Number(opt('width', 1600)), H = Number(opt('height', 1000));

async function run(theme) {
  const dir = join(out, theme); mkdirSync(dir, { recursive: true });
  /* one Chrome profile per browser: parallel browsers sharing a profile directory crash each other */
  const profile = `${tmpdir()}/pm-cdp-profile-${process.pid}-${theme}`;
  const { page, close, chrome } = await launch({ width: W, height: H, profile });
  const shots = []; let n = 0;
  const ev = (fn, ...a) => page.evaluate(fn, ...a);
  const step = () => ev(() => window.O55.tour.state().step);
  const until = async (fn, what, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(fn)) return; await sleep(120); } throw new Error(theme + ': timeout ' + what + ' at ' + await step()); };
  /* settled: no spotlight spring, the callout at its placed position, no transition running on it */
  const settle = async () => {
    let ok = 0; const t0 = Date.now();
    while (Date.now() - t0 < 3500 && ok < 2) {
      const s = await ev(() => { const st = window.O55.tour.st, c = document.querySelector('#pm-o55-tour .o55t-callout'); if (!st || !c) return true; const a = c.getBoundingClientRect(); return !st.spring && (!st.cpos || (Math.abs(a.left - st.cpos.x) < 1 && Math.abs(a.top - st.cpos.y) < 1)) && !c.getAnimations().some((x) => x.playState === 'running' && isFinite(x.effect.getComputedTiming().endTime)); });
      ok = s ? ok + 1 : 0; await sleep(110);
    }
    await sleep(160);
  };
  const shot = async (label) => { const f = `${String(++n).padStart(2, '0')}-${label}.png`; await page.screenshot(join(dir, f)); shots.push(f); };
  const clickSel = async (sel) => {
    let c = null; const t0 = Date.now();
    while (Date.now() - t0 < 4000) { c = await ev((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return top && (top === el || el.contains(top)) ? { x, y } : null; }, sel); if (c) break; await sleep(100); }
    if (!c) throw new Error(theme + ': cannot click ' + sel + ' at ' + await step());
    await page.mouse(c.x, c.y);
  };
  const callout = (a, arg) => clickSel(`#pm-o55-tour .o55t-callout [data-o55t="${a}"]${arg ? `[data-arg="${arg}"]` : ''}`);

  const [fam, mode] = theme.split('-');
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
  await page.goto(pathToFileURL(PAGE).href + '?o55=off'); await sleep(1300);
  await ev((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); localStorage.removeItem('pm.o55.tour.v1'); }, fam, mode);
  await sleep(400);
  await ev(() => window.PM7_GUIDED_TOUR.start({ project: 'tastebook' }));
  for (let guard = 0; guard < 40; guard++) {
    const id = await step();
    const def = await ev((i) => { const d = window.O55.tour.byId[i]; return { kind: d.kind, after: !!d.after, stay: !!d.stay, ready: !!d.ready }; }, id);
    await settle(); await shot(id);
    if (id === 'completion_boundary') { await callout('finish', 'restore'); await sleep(1500); await shot('landed'); break; }
    if (def.kind === 'info') {
      await until(() => !!document.querySelector('#pm-o55-tour .o55t-callout [data-o55t="next"]'), 'Next on ' + id, 12000);
      await callout('next');
    } else {
      if (id === 'same_answer_eli5') await until(() => window.O55.tour.chat.answered('a1'), 'answer before ELI5');
      const stackedDock = id === 'move_or_dock_chat' && await ev(() => { const b = window.O55.tour.dockBand(); return !!(b && b.stacked); });
      if (stackedDock) {
        /* a stacked (narrow) workspace: the reachable version is the Move Chat to the top button */
        await callout('moveChatTop');
      } else if (id === 'move_or_dock_chat') {
        /* a real drag, held over the left dock until the workspace adopts it, captured before letting go */
        const a = await ev(() => { const r = document.querySelector('[data-pm-home-handle="chat"]').getBoundingClientRect(); const w = document.getElementById('pm-home-workspace').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, tx: w.left + 12, ty: w.top + w.height * 0.45 }; });
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x, y: a.y });
        await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: a.x, y: a.y, button: 'left', clickCount: 1 });
        const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
        for (let i = 1; i <= 36; i++) { const k = ease(i / 36); await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.x + (a.tx - a.x) * k, y: a.y + (a.ty - a.y) * k, button: 'left', buttons: 1 }); await sleep(18); }
        for (let j = 0; j < 5; j++) { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: a.tx + (j % 2), y: a.ty + j * 0.5, button: 'left', buttons: 1 }); await sleep(45); }
        await sleep(500); await shot(id + '-drag');
        await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: a.tx, y: a.ty, button: 'left', clickCount: 1 });
      } else {
        await callout('showMe');
      }
      await until(new Function(`return window.O55.tour.state().done.includes(${JSON.stringify(id)})`), 'done ' + id, 20000);
      /* the after-line holds for about two seconds: catch it once the callout shows it, before the step moves on */
      if (def.after) { await until(() => !!document.querySelector('#pm-o55-tour .o55t-callout.o55t-success'), 'after-line on ' + id, 4000); await sleep(650); await shot(id + '-after'); }
      if (def.stay) { await sleep(900); await callout('next'); }
    }
    await until(new Function(`return window.O55.tour.state().step !== ${JSON.stringify(id)}`), 'leave ' + id, 12000);
  }
  const errors = page.errors.slice(0, 10);
  await close(); await dropProfile(profile, chrome);
  return { theme, shots, errors };
}

mkdirSync(out, { recursive: true });
const results = await Promise.all(themes.map((t) => run(t).catch((e) => ({ theme: t, error: String(e.message || e) }))));
writeFileSync(join(out, 'shots.json'), JSON.stringify(results, null, 1));
for (const r of results) console.log(r.theme, r.error ? 'ERROR ' + r.error : `${r.shots.length} shots` + (r.errors.length ? ' page errors: ' + r.errors.join(' | ') : ''));
