/* Slow-motion 60 fps filming of onboarding moments for frame-by-frame review.
 * node tools/film.mjs <out-dir> [--scenes open,next,pick-family,...] [--themes basic-dark,...] [--rate 0.05]
 *      [--size 1440x900] [--freeze]   (--freeze films with playback rate 0: every frame must be identical)
 * Method (validated for the Settings refresh films, 2026-09-08): CDP Animation.setPlaybackRate slows CSS and Web
 * Animations; O55.motion.setTimeScale slows every JS timer, tween and spring on the onboarding's own clock.
 * One screenshot per 16.667/rate ms of wall time = one true 60 fps frame. frames.json records each frame's motion
 * time. Output: <out>/<theme>/<scene>/f000.jpg... plus film.json. */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pageFile = resolve(here, '../../../TestOpus5.5PmConcept.html');
const argv = process.argv.slice(2);
const out = resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : '/tmp/o55/film');
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const flag = (k) => argv.includes('--' + k);
const RATE = flag('freeze') ? 0 : Number(opt('rate', '0.05'));
const STEP = 16.667 / (RATE || 0.05);
const themes = opt('themes', 'basic-dark').split(',');
const [W, H] = opt('size', '1440x900').split('x').map(Number);

/* setup(): bring the page to the state before the moment (runs at normal speed, then settles).
   trigger(): the one action filmed at t = 0.  frames: how many 60 fps frames to keep. */
const SCENES = {
  open: { frames: 96, setup: () => { window.O55.store.clear('onboarding'); if (window.O55.S.open) window.O55.ui.close('close'); },
    trigger: () => window.O55.ui.open({ fresh: true }) },
  next: { frames: 54, setup: () => { window.O55.ui.open({ fresh: true }); },
    trigger: () => document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-primary').click() },
  'pick-family': { frames: 66, setup: () => { window.O55.ui.open({ fresh: true }); window.O55.ui.go('look', { silent: true }); },
    trigger: () => { const cur = window.O55.theme().family; const next = cur === 'friendly' ? 'glass' : 'friendly'; document.querySelector(`#pm-o55-onboarding .o55-tile[data-arg="${next}"]`).click(); } },
  'look-next': { frames: 54, setup: () => { window.O55.ui.open({ fresh: true }); window.O55.ui.go('look', { silent: true }); },
    trigger: () => document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-primary').click() },
  'pick-card': { frames: 60, setup: () => { window.O55.ui.open({ fresh: true }); window.O55.ui.go('where', { silent: true }); },
    trigger: () => document.querySelector('#pm-o55-onboarding .o55-card[data-arg="connect"]').click() },
  back: { frames: 48, setup: () => { window.O55.ui.open({ fresh: true }); window.O55.ui.go('look', { silent: true }); window.O55.ui.go('where', { silent: true }); },
    trigger: () => document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-back').click() },
  close: { frames: 36, setup: () => { window.O55.ui.open({ fresh: true }); },
    trigger: () => window.O55.ui.close('close') }
};
const scenes = opt('scenes', Object.keys(SCENES).join(',')).split(',').filter((s) => SCENES[s]);
const summary = { page: pageFile, rate: RATE, size: `${W}x${H}`, films: [] };

for (const theme of themes) {
  const [fam, mode] = theme.split('-');
  const { page, close } = await launch({ width: W, height: H });
  try {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: mode }] });
    await page.goto(pathToFileURL(pageFile).href + '?o55=off');
    await sleep(1200);
    await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); }, fam, mode);
    if (page.bringToFront) await page.bringToFront();
    await page.send('Animation.enable');
    for (const name of scenes) {
      const sc = SCENES[name];
      const dir = join(out, theme, name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
      await page.evaluate((f, m) => { window.PM_THEME.setFamily(f, { persist: false }); window.PM_THEME.setMode(m, { persist: false }); }, fam, mode);
      await page.evaluate(`(${sc.setup.toString()})()`);
      await sleep(2600);
      /* the window's bounds are fixed (PWIZ-022), so a closed window's clip is computed from its sizing rule */
      const clip = await page.evaluate(() => {
        const el = document.querySelector('#pm-o55-onboarding .o55-win'); let r = el && el.getBoundingClientRect();
        if (!r || !r.width) { const w = Math.min(1080, innerWidth - 48), h = Math.min(720, innerHeight - 48); r = { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h }; }
        return { x: Math.max(0, r.left - 12), y: Math.max(0, r.top - 12), width: r.width + 24, height: r.height + 24 };
      });
      clip.width = Math.min(clip.width, W - clip.x); clip.height = Math.min(clip.height, H - clip.y);
      await page.send('Animation.setPlaybackRate', { playbackRate: RATE });
      await page.evaluate((k) => window.O55.motion.setTimeScale(k), RATE);
      const t0 = Date.now(); const frames = [];
      await page.evaluate(`(${sc.trigger.toString()})()`);
      for (let i = 0; i < sc.frames; i++) {
        const target = t0 + i * STEP; const wait = target - Date.now(); if (wait > 0) await sleep(wait);
        const before = Date.now();
        await page.screenshot(join(dir, `f${String(i).padStart(3, '0')}.jpg`), { format: 'jpeg', quality: 86, clip });
        frames.push({ i, motionMs: +(((before - t0) * (RATE || 0))).toFixed(1), wallMs: before - t0 });
      }
      await page.send('Animation.setPlaybackRate', { playbackRate: 1 });
      await page.evaluate(() => window.O55.motion.setTimeScale(1));
      await sleep(900);
      writeFileSync(join(dir, 'frames.json'), JSON.stringify({ scene: name, theme, rate: RATE, stepMs: 16.667, clip, frames }, null, 1));
      summary.films.push({ theme, scene: name, dir, frames: frames.length, lastMotionMs: frames[frames.length - 1].motionMs });
      console.log(theme, name, frames.length, 'frames, last', frames[frames.length - 1].motionMs, 'ms');
    }
    summary.errors = (summary.errors || []).concat(page.errors.map((e) => `${theme}: ${e}`));
  } finally { await close(); }
}
writeFileSync(join(out, 'film.json'), JSON.stringify(summary, null, 2));
console.log('errors', (summary.errors || []).length, (summary.errors || []).slice(0, 5));
