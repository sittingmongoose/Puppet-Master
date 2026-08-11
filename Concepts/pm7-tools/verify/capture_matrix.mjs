/* capture_matrix.mjs -- deterministic screenshot matrix for PM6-vs-PM7
 * pixel-parity verification (and the PM6-vs-PM6 flake control).
 *
 * Determinism recipe (identical for every file under test):
 *   - seeded Math.random (LCG) via addInitScript
 *   - frozen Date (fixed epoch; Date.now and zero-arg new Date())
 *   - PM_DEMO virtual clock paused the moment the engine object is assigned
 *     (before the first 250ms tick, hence before the first ambient beat)
 *   - localStorage preset (pm.theme / pm.glassBg) before any page script
 *   - fresh browser context per shot (no state bleed between shots)
 *   - waits: load + PM_DEMO ready + document.fonts.ready + status-bar index
 *     ticker completion (a real-420ms-interval progress ticker; waiting for
 *     its terminal state removes elapsed-time jitter) + fixed settle
 *   - right before capture: clear ALL real timers (the demo clock is already
 *     paused; the cooldown countdowns tick on real 1s intervals and their
 *     display depends on wall-seconds since load), then normalize the two
 *     cooldown countdown texts (#pm6DashCooldown / #pm6UsageCd) to a fixed
 *     string on BOTH files, then inject animation:none / transition:none /
 *     caret-color:transparent and wait two rAF turns
 *   - viewport 1920x1080, DPR 1, PNG full-viewport screenshot
 *
 * Usage:
 *   node capture_matrix.mjs --file <name served at 8741> --outdir <dir>
 *        --modules <dir with node_modules/playwright-core> [--only id1,id2]
 * Emits <outdir>/<shot-id>.png + <outdir>/capture_log.json (console errors
 * per shot; a shot that throws marks the whole run failed).
 */

import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
for (const k of ['file', 'outdir', 'modules']) {
  if (!args[k]) { console.error('missing --' + k); process.exit(2); }
}
const require2 = createRequire(join(args.modules, 'noop.js'));
const { chromium } = require2('playwright-core');

const SERVER = 'http://127.0.0.1:8741/';

function glassShots() {
  const out = [];
  for (const t of ['glass-dark', 'glass-light']) {
    for (const m of ['mesh', 'depth', 'minimal']) {
      out.push({ id: `e-${t}-${m}-full`, theme: t, glassBg: m, loose: true });
      out.push({ id: `e-${t}-${m}-hidden`, theme: t, glassBg: m,
                 hideWallpaper: true });
    }
  }
  return out;
}

const SHOTS = [
  /* A: non-glass themes x dashboard (strict; glass dashboards live in E) */
  { id: 'a1-dash-friendly-dark', theme: 'friendly-dark' },
  { id: 'a2-dash-friendly-light', theme: 'friendly-light' },
  { id: 'a3-dash-retro-dark', theme: 'retro-dark' },
  { id: 'a4-dash-retro-light', theme: 'retro-light' },
  { id: 'a5-dash-basic-light', theme: 'basic-light' },
  { id: 'a6-dash-basic-dark', theme: 'basic-dark' },
  /* B: friendly-dark deep pass (strict) */
  { id: 'b01-projects', theme: 'friendly-dark', page: 'projects' },
  { id: 'b02-wizard-entry', theme: 'friendly-dark', page: 'wizard' },
  { id: 'b03-wizard-workspace', theme: 'friendly-dark',
    ensure: 'c1_wizard_done', page: 'wizard' },
  { id: 'b04-orch-graph', theme: 'friendly-dark', page: 'orchestrator',
    orchTab: 'node_graph' },
  { id: 'b05-orch-plan-compile', theme: 'friendly-dark',
    page: 'orchestrator', orchTab: 'plan_compile' },
  { id: 'b06-usage', theme: 'friendly-dark', page: 'usage' },
  { id: 'b07-settings-home', theme: 'friendly-dark', page: 'settings' },
  { id: 'b08-settings-bloom', theme: 'friendly-dark', page: 'settings',
    bloom: true },
  { id: 'b09-floating-chat', theme: 'friendly-dark', floatingChat: true },
  { id: 'b10-terminal-split', theme: 'friendly-dark', termSplit: true },
  { id: 'b11-chat-model-popout', theme: 'friendly-dark', modelPopout: true },
  /* C: retro-dark spot checks (strict) */
  { id: 'c1-retro-orch-graph', theme: 'retro-dark', page: 'orchestrator',
    orchTab: 'node_graph' },
  { id: 'c2-retro-wizard-workspace', theme: 'retro-dark',
    ensure: 'c1_wizard_done', page: 'wizard' },
  /* D: basic-light settings (strict) */
  { id: 'd1-basic-settings-home', theme: 'basic-light', page: 'settings' },
  /* E: glass full (loose) + wallpaper-hidden (strict) */
  ...glassShots(),
  /* F: chapter-jump state equivalence (strict) */
  { id: 'f1-c5-dashboard', theme: 'friendly-dark', ensure: 'c5_published',
    page: 'dashboard' },
  { id: 'f2-c5-orch-history', theme: 'friendly-dark',
    ensure: 'c5_published', page: 'orchestrator', orchTab: 'history' },
  /* G: reduced motion (strict) */
  { id: 'g1-reduced-dashboard', theme: 'friendly-dark', reducedMotion: true },
];

const only = args.only ? new Set(args.only.split(',')) : null;
const shots = only ? SHOTS.filter(s => only.has(s.id)) : SHOTS;

mkdirSync(args.outdir, { recursive: true });
const browser = await chromium.launch();
const log = { file: args.file, shots: {} };
let failed = false;

for (const shot of shots) {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 200)));

  await page.addInitScript(({ theme, glassBg }) => {
    /* seeded LCG */
    (() => {
      let s = 0x9E3779B9 | 0;
      Math.random = function () {
        s = (Math.imul(s, 1664525) + 1013904223) | 0;
        return (s >>> 0) / 4294967296;
      };
    })();
    /* frozen Date */
    (() => {
      const FIXED = 1789000000000;
      const RealDate = Date;
      function FDate(...a) {
        if (!(this instanceof FDate)) return new RealDate(FIXED).toString();
        return a.length ? new RealDate(...a) : new RealDate(FIXED);
      }
      FDate.prototype = RealDate.prototype;
      FDate.now = () => FIXED;
      FDate.parse = RealDate.parse.bind(RealDate);
      FDate.UTC = RealDate.UTC.bind(RealDate);
      window.Date = FDate;
    })();
    /* pause the demo clock the moment the real engine lands */
    (() => {
      let pd;
      Object.defineProperty(window, 'PM_DEMO', {
        configurable: true,
        get() { return pd; },
        set(v) {
          pd = v;
          try {
            if (v && v.clock && v.clock.pause && !v._shim) v.clock.pause();
          } catch (e) {}
        },
      });
    })();
    /* preset persisted prefs */
    try {
      localStorage.clear();
      localStorage.setItem('pm.theme', theme);
      if (glassBg) localStorage.setItem('pm.glassBg', glassBg);
    } catch (e) {}
  }, { theme: shot.theme, glassBg: shot.glassBg || null });

  try {
    await page.goto(SERVER + args.file, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(
      () => window.PM_DEMO && !window.PM_DEMO._shim && window.PM_PAGES,
      null, { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    /* status-bar index ticker runs on a real 420ms interval for ~3.5s; wait
       for its terminal state so capture timing cannot flake it */
    await page.waitForFunction(() => {
      const el = document.getElementById('pm6StatusIndex');
      return !el || el.classList.contains('pm6-index-done');
    }, null, { timeout: 20000 });
    await page.waitForTimeout(1500);

    if (shot.reducedMotion) {
      /* same attribute the settings live-apply writes */
      await page.evaluate(() =>
        document.documentElement.setAttribute('data-motion', 'reduced'));
      await page.waitForTimeout(300);
    }
    if (shot.ensure) {
      await page.evaluate(
        c => window.PM_DEMO.director.ensure(c), shot.ensure);
      await page.waitForTimeout(1200);
    }
    if (shot.page) {
      await page.evaluate(p => window.PM_PAGES.go(p), shot.page);
      await page.waitForTimeout(800);
    }
    if (shot.orchTab) {
      await page.evaluate(t => {
        const el = document.getElementById('orch-tab-' + t);
        if (!el) throw new Error('orch tab missing: ' + t);
        el.click();
      }, shot.orchTab);
      await page.waitForTimeout(800);
    }
    if (shot.bloom) {
      await page.evaluate(() => {
        const chip = document.querySelector('#s4-chips .s4-chip');
        if (!chip) throw new Error('no settings chip');
        chip.click();
      });
      await page.waitForTimeout(900);
    }
    if (shot.floatingChat) {
      await page.evaluate(() => {
        const btn = document.querySelector('.popOutBtn');
        if (!btn) throw new Error('no .popOutBtn');
        btn.click();
      });
      await page.waitForTimeout(800);
    }
    if (shot.termSplit) {
      await page.evaluate(() => {
        const v = document.querySelector(
          'button[title="Split Active Tab Vertically"]');
        if (!v) throw new Error('no vertical split button');
        v.click();
      });
      await page.waitForTimeout(400);
      await page.evaluate(() => {
        const h = document.querySelector(
          'button[title="Split Active Tab Horizontally"]');
        if (!h) throw new Error('no horizontal split button');
        h.click();
      });
      await page.waitForTimeout(600);
    }
    if (shot.modelPopout) {
      await page.evaluate(() => {
        const btns = document.querySelectorAll('.pm6-chat-selbtn');
        for (const b of btns) {
          if (b.querySelector('.model-label')) { b.click(); return; }
        }
        throw new Error('no model selector button');
      });
      await page.waitForTimeout(700);
    }
    if (shot.hideWallpaper) {
      await page.addStyleTag({
        content: '#glass-bg { display: none !important; }' });
      await page.waitForTimeout(200);
    }

    /* stop every real timer, then normalize the two real-time cooldown
       countdowns (their value depends on wall-seconds since load) */
    await page.evaluate(() => {
      const top = setTimeout(() => {}, 0);
      for (let i = 1; i <= top; i++) { clearInterval(i); clearTimeout(i); }
      const dc = document.getElementById('pm6DashCooldown');
      if (dc) dc.textContent = '41:12';
      const uc = document.getElementById('pm6UsageCd');
      if (uc) uc.textContent = '41:12';
    });

    /* freeze residual motion right before capture */
    await page.addStyleTag({ content:
      '*, *::before, *::after { animation: none !important; ' +
      'transition: none !important; caret-color: transparent !important; } ' +
      'html { scroll-behavior: auto !important; }' });
    await page.evaluate(() => new Promise(r =>
      requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(200);

    await page.screenshot({
      path: join(args.outdir, shot.id + '.png'), fullPage: false });
    log.shots[shot.id] = { ok: true, consoleErrors: errors };
    console.error(shot.id + ' ok' +
      (errors.length ? ' (CONSOLE ERRORS: ' + errors.length + ')' : ''));
  } catch (e) {
    failed = true;
    log.shots[shot.id] = { ok: false, error: String(e).slice(0, 400),
                           consoleErrors: errors };
    console.error(shot.id + ' FAILED: ' + e);
  }
  await ctx.close();
}

await browser.close();
writeFileSync(join(args.outdir, 'capture_log.json'),
  JSON.stringify(log, null, 2));
process.exit(failed ? 1 : 0);
