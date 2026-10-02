/* railfilm.mjs — slow-motion 60 fps films of one rail motion moment on the Mac GPU.
 *   node railfilm.mjs --html index.html --scene scene.mjs --out films/<name>
 *        [--concept a] [--theme basic-dark] [--nier] [--panel files] [--size 1440x900] [--rate 0.1] [--ms 900]
 *        [--step 16.667] [--reduced] [--cols 6] [--width 300] [--slow 4] [--extra 0] [--param k=v ...]
 * A scene module exports default (params) => ({ setup?: async (pm) => {}, trigger: string | async (pm, cdp) => {},
 *   ms?: number, extra?: px of room to the right of the rail (for the Lens) }).
 * Method: setup at normal speed and settle; slow every CSS / Web Animation with CDP Animation.setPlaybackRate(rate);
 * fire the trigger; screenshot as fast as the GPU allows and keep one frame per `step` ms of MOTION time
 * ((now - t0) * rate), so the kept frames are a true 60 fps sample. JS timers are not slowed: sequencing done with
 * setTimeout plays early in the film. Outputs: f####.png, film.json, sheet.png, film.mp4, film-slow<N>x.mp4.
 * Media is review evidence only: delete it when finished. */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { pathToFileURL } from 'url';
import { openPage } from './railkit.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const HTML = path.resolve(opt('html', 'index.html'));
const SCENE = path.resolve(opt('scene'));
const OUT = path.resolve(opt('out', 'films/x'));
const [W, H] = opt('size', '1440x900').split('x').map(Number);
const RATE = Number(opt('rate', 0.1)), STEP = Number(opt('step', 16.667)), COLS = Number(opt('cols', 6));
const TW = Number(opt('width', 300)), SLOW = Number(opt('slow', 4));
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', process.env.HOME + '/.cargo/bin/ffmpeg', 'ffmpeg'].find((p) => p === 'ffmpeg' || fs.existsSync(p));
const PARAMS = {}; argv.forEach((a, i) => { if (a === '--param' && argv[i + 1]) { const [k, ...v] = argv[i + 1].split('='); PARAMS[k] = v.join('='); } });
const mod = (await import(pathToFileURL(SCENE).href)).default;
const scene = typeof mod === 'function' ? mod(PARAMS) : mod;
const MS = Number(opt('ms', scene.ms || 900));
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });

const pm = await openPage(HTML, { width: W, height: H, reduced: has('reduced') });
try {
  await pm.concept(opt('concept', 'a'));
  await pm.theme(opt('theme', 'basic-dark'), has('nier'));
  await pm.panel(opt('panel', 'files'));
  if (scene.setup) await scene.setup(pm);
  await pm.wait(700);
  const extra = Number(opt('extra', scene.extra || 0));
  const clip = await pm.railClip(extra);
  const cdp = await pm.ctx.newCDPSession(pm.page);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
  await cdp.send('Runtime.evaluate', { expression: 'window.__filmT0 = performance.now();' });
  if (typeof scene.trigger === 'string') await cdp.send('Runtime.evaluate', { expression: scene.trigger, awaitPromise: true });
  else if (scene.trigger) await scene.trigger(pm, cdp);
  const motionT = async () => (await cdp.send('Runtime.evaluate', { expression: `(performance.now() - window.__filmT0) * ${RATE}`, returnByValue: true })).result.value;
  const kept = []; let next = 0, n = 0, guard = 0;
  while (guard++ < 6000) {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: Object.assign({ scale: 1 }, clip) });
    const t = await motionT();
    if (t >= next) { fs.writeFileSync(path.join(OUT, `f${String(n).padStart(4, '0')}.png`), Buffer.from(shot.data, 'base64')); kept.push(Math.round(t)); n++; next = Math.max(next + STEP, t + STEP * 0.5); }
    if (t > MS) break;
  }
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
  const gaps = kept.slice(1).map((t, i) => t - kept[i]);
  fs.writeFileSync(path.join(OUT, 'film.json'), JSON.stringify({ scene: path.basename(SCENE), concept: opt('concept', 'a'), theme: opt('theme', 'basic-dark'), nier: has('nier'), rate: RATE, frames: n, maxGapMs: gaps.length ? Math.max(...gaps) : 0, clip, times: kept, errors: pm.errors }, null, 1));
  const fps = Math.round(1000 / STEP);
  try {
    if (n > 1) {
      execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(OUT, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', path.join(OUT, 'film.mp4')]);
      if (SLOW > 1) execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps / SLOW), '-i', path.join(OUT, 'f%04d.png'), '-r', String(fps), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', path.join(OUT, `film-slow${SLOW}x.mp4`)]);
      for (let i = 0; i < n; i++) execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(OUT, `f${String(i).padStart(4, '0')}.png`), '-vf', `scale=${TW}:-2,drawtext=text='${kept[i]}ms':x=5:y=5:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.65`, path.join(OUT, `l${String(i).padStart(4, '0')}.png`)]);
      execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '30', '-i', path.join(OUT, 'l%04d.png'), '-vf', `tile=${COLS}x${Math.ceil(n / COLS)}:padding=3:color=gray`, '-frames:v', '1', path.join(OUT, 'sheet.png')]);
      for (let i = 0; i < n; i++) fs.rmSync(path.join(OUT, `l${String(i).padStart(4, '0')}.png`), { force: true });
    }
  } catch (e) { pm.errors.push('ffmpeg: ' + String(e).slice(0, 300)); }
  console.log(JSON.stringify({ out: OUT, frames: n, span: kept[kept.length - 1], maxGapMs: gaps.length ? Math.max(...gaps) : 0, errors: pm.errors.slice(0, 4) }));
} finally { await pm.browser.close(); }
