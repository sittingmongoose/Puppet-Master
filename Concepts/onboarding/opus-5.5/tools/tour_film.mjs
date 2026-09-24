/* Slow-motion filming of Guided Tour moments: the tour opening, every Show Me, the ELI5 rewrite and the finish.
 * node tools/tour_film.mjs <out-dir> [--scenes sm-dock,finish] [--themes basic-dark,...] [--rate 0.1] [--size 1440x900]
 * Same method as tools/film.mjs: CDP Animation.setPlaybackRate slows CSS and Web Animations, O55.motion.setTimeScale
 * slows the tour's own timers, tweens and springs (the Show Me pointer, the spotlight spring, the callout). One
 * screenshot per 16.667/rate ms of wall time is one 60 fps frame; frames.json keeps each frame's real motion time.
 * The shell's own timers are not on the tour clock, so they run fast in these films (chat streaming, the workspace's
 * 420 ms drop fallback): read those as film artifacts, not as defects. Themes film in parallel browsers.
 * Output: <out>/<theme>/<scene>/f000.jpg ... + frames.json, and <out>/film.json. */
import { launch, sleep } from '../../../pm7-tools/verify/pm_cdp.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const pageFile = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/tourfilm');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const RATE = Number(opt('rate', '0.1'));
const STEP = 16.667 / RATE;
const ALL = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light'];
const themes = opt('themes', '') ? opt('themes', '').split(',') : ALL;
const [W, H] = opt('size', '1440x900').split('x').map(Number);

/* in-page helpers, installed once per page */
const HELPERS = `window.__f = {
  wait: (ms) => new Promise((r) => setTimeout(r, ms)),
  async until(fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (fn()) return true; await __f.wait(80); } return false; },
  click(sel) { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (el) el.click(); return !!el; },
  async start() { if (window.O55.tour.running) await window.O55.tour.skip(); localStorage.removeItem('pm.o55.tour.v1'); await window.PM7_GUIDED_TOUR.start({ project: 'tastebook', fresh: true }); await __f.wait(900); },
  async go(id) { await window.O55.tour.go(id); await __f.wait(700); },
  chatOn() { const api = window.PM_HOME_WORKSPACE, s = api.layout.surfaces.find((x) => x.surface_kind === 'chat'); if (!s.visible) api.setSurfaceVisible('chat', true, 'cmd.panel.switch'); },
  async teacher() { __f.chatOn(); await window.O55.tour.chat.ensureThread(); await __f.wait(300); if (!/Teacher/.test(window.O55.tour.chat.persona())) { __f.click('.pm6-chat-personabtn'); await __f.wait(300); __f.click('.pm6-chat-personaitem[data-persona="Teacher"]'); await __f.wait(300); } },
  async asked() { await __f.teacher(); await __f.go('send_question'); __f.click('#pm-o55-tour [data-o55t="fillQuestion"]'); await __f.wait(200); __f.click('#chatPanel .pm6-chat-send'); await __f.until(() => window.O55.tour.chat.answered('a1'), 9000); await __f.wait(600); },
  async practice() { await __f.go('book_club_goal'); __f.click('#o55pGoal .o55p-use'); await __f.until(() => window.O55.tour.practice.active); await __f.wait(700); },
  async outcome() { await __f.practice(); await __f.go('three_outcomes'); __f.click('.o55p-outcome[data-arg="o1"]'); await __f.wait(700); },
  async reviewed() { await __f.outcome(); await __f.go('access_answer'); __f.click('[data-o55p="answer"][data-arg="few"]'); await __f.wait(500); await __f.go('review'); __f.click('[data-o55p="review"]'); await __f.wait(700); },
  showMe() { return __f.click('#pm-o55-tour .o55t-callout [data-o55t="showMe"]'); }
};`;

/* setup(): bring the page to the moment (normal speed, then it settles). trigger(): the action filmed at t = 0. */
const SCENES = {
  'handoff': { frames: 110, setup: async () => { if (window.O55.tour.running) await window.O55.tour.skip(); localStorage.removeItem('pm.o55.tour.v1'); window.O55.ui.open({ fresh: true }); await __f.wait(1200); window.O55.ui.go('ready', { silent: true }); await __f.wait(1600); },
    trigger: () => __f.click('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-primary') },
  'tour-open': { frames: 96, setup: async () => { if (window.O55.tour.running) await window.O55.tour.skip(); localStorage.removeItem('pm.o55.tour.v1'); },
    trigger: () => window.PM7_GUIDED_TOUR.start({ project: 'tastebook', fresh: true }) },
  'sm-open-chat': { frames: 150, setup: async () => { await __f.start(); await __f.go('open_chat'); }, trigger: () => __f.showMe() },
  'sm-teacher': { frames: 150, setup: async () => { await __f.start(); __f.chatOn(); await __f.go('select_teacher'); await window.O55.tour.chat.ensureThread(); }, trigger: () => __f.showMe() },
  'sm-send': { frames: 170, setup: async () => { await __f.start(); await __f.teacher(); await __f.go('send_question'); }, trigger: () => __f.showMe() },
  'eli5': { frames: 150, setup: async () => { await __f.start(); await __f.asked(); await __f.go('same_answer_eli5'); }, trigger: () => __f.click('span.chat-toggle-btn.toggle-eli5') },
  'step-next': { frames: 80, setup: async () => { await __f.start(); await __f.asked(); await __f.go('answer_stream'); await __f.wait(500); }, trigger: () => __f.click('#pm-o55-tour .o55t-callout [data-o55t="next"]') },
  'sm-dock': { frames: 210, setup: async () => { await __f.start(); await __f.go('move_or_dock_chat'); }, trigger: () => __f.showMe() },
  'sm-widget': { frames: 300, setup: async () => { await __f.start(); await __f.go('widget_action'); }, trigger: () => __f.showMe() },
  'sm-plan': { frames: 120, setup: async () => { await __f.start(); await __f.go('open_planning'); }, trigger: () => __f.showMe() },
  'sm-goal': { frames: 150, setup: async () => { await __f.start(); await __f.go('book_club_goal'); }, trigger: () => __f.showMe() },
  'sm-outcome': { frames: 130, setup: async () => { await __f.start(); await __f.practice(); await __f.go('three_outcomes'); }, trigger: () => __f.showMe() },
  'sm-answer': { frames: 230, setup: async () => { await __f.start(); await __f.outcome(); await __f.go('access_answer'); }, trigger: () => __f.showMe() },
  'sm-edit': { frames: 200, setup: async () => { await __f.start(); await __f.reviewed(); await __f.go('answer_edit'); }, trigger: () => __f.showMe() },
  'finish': { frames: 150, setup: async () => { await __f.start(); await __f.reviewed(); await __f.go('completion_boundary'); }, trigger: () => __f.click('#pm-o55-tour .o55t-callout [data-o55t="finish"][data-arg="restore"]') }
};
const scenes = opt('scenes', Object.keys(SCENES).join(',')).split(',').filter((s) => SCENES[s]);

async function filmTheme(theme) {
  const [fam, mode] = theme.split('-'); const films = [];
  const { page, close } = await launch({ width: W, height: H, profile: `${tmpdir()}/pm-tourfilm-${process.pid}-${theme}` });
  try {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
    await page.goto(pathToFileURL(pageFile).href + '?o55=off');
    await sleep(1300);
    await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); }, fam, mode);
    await page.evaluate(HELPERS);
    await page.send('Animation.enable');
    for (const name of scenes) {
      const sc = SCENES[name];
      const dir = join(out, theme, name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
      /* each scene starts from a clean page so no earlier scene's layout leaks in */
      await page.goto(pathToFileURL(pageFile).href + '?o55=off'); await sleep(1300);
      await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); }, fam, mode);
      await page.evaluate(HELPERS);
      await page.evaluate(`(${sc.setup.toString()})()`);
      await sleep(2400);
      await page.send('Animation.setPlaybackRate', { playbackRate: RATE });
      await page.evaluate((k) => window.O55.motion.setTimeScale(k), RATE);
      const t0 = Date.now(); const frames = [];
      await page.evaluate(`(${sc.trigger.toString()})()`);
      for (let i = 0; i < sc.frames; i++) {
        const target = t0 + i * STEP; const wait = target - Date.now(); if (wait > 0) await sleep(wait);
        const before = Date.now();
        await page.screenshot(join(dir, `f${String(i).padStart(3, '0')}.jpg`), { format: 'jpeg', quality: 82 });
        frames.push({ i, motionMs: +((before - t0) * RATE).toFixed(1), wallMs: before - t0 });
      }
      await page.send('Animation.setPlaybackRate', { playbackRate: 1 });
      await page.evaluate(() => window.O55.motion.setTimeScale(1));
      writeFileSync(join(dir, 'frames.json'), JSON.stringify({ scene: name, theme, rate: RATE, stepMs: 16.667, frames }, null, 1));
      films.push({ theme, scene: name, dir, frames: frames.length, lastMotionMs: frames[frames.length - 1].motionMs, lateFrames: frames.filter((f, k) => k && f.wallMs - frames[k - 1].wallMs > STEP * 1.5).length });
    }
    return { theme, films, errors: page.errors.slice(0, 10) };
  } finally { await close(); }
}

mkdirSync(out, { recursive: true });
const results = await Promise.all(themes.map((t) => filmTheme(t).catch((e) => ({ theme: t, error: String(e.stack || e) }))));
writeFileSync(join(out, 'film.json'), JSON.stringify({ page: pageFile, rate: RATE, size: `${W}x${H}`, results }, null, 1));
for (const r of results) console.log(r.theme, r.error ? 'ERROR ' + r.error.slice(0, 300) : r.films.map((f) => `${f.scene}:${f.frames}${f.lateFrames ? `(late ${f.lateFrames})` : ''}`).join(' ') + (r.errors.length ? ' | page errors: ' + r.errors.join(' | ') : ''));
