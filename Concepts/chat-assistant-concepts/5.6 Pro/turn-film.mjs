/* turn-film.mjs -- slow-motion films of the Chat WOW choreography, for frame-by-frame review.
 *
 *   node turn-film.mjs --scene send --theme basic-dark --out /tmp/x
 *        [--rate 0.1] [--ms 900] [--step 16.667] [--file index.html] [--size 1440x900]
 *        [--crop 0,0.48,1,0.5] [--cols 6] [--width 320] [--msg "..."] [--voice auto|basic|friendly|glass|retro]
 *        [--from 0]   keep only frames at or after this motion time (past 1.5s the
 *                     scene runs at full speed until a second before it)
 *        [--wide]     close the editor first, so the chat has the whole width
 *        [--gpu]      new headless mode with GPU compositing (the Mac); default is software
 *        --scene arrive --family deliverable|needs|people|time|ledger   a live arrival
 *        --scene switch --to <thread>                                  a thread switch
 *
 * Method: the scene's setup runs at normal speed and settles. Then CSS and Web
 * Animations are slowed with CDP Animation.setPlaybackRate(rate) and every
 * JS-driven motion with PM56_CLOCK.setScale(rate) (the one clock the live-turn
 * modules time themselves by), and the trigger fires. Screenshots are taken as
 * fast as the browser returns them; each is labelled with the MOTION time since
 * the trigger (PM56_CLOCK), and one frame is kept per `step` ms of motion time,
 * so at rate 0.1 a ~60ms capture still yields a true 60 fps sample.
 * (CDP virtual time was tried first: in this headless build it advances
 * performance.now and timers but not rAF or the animation timeline, so CSS and
 * JS motion drift apart. Do not use it for this page.)
 * Frames are PNG crops; with ffmpeg on PATH a labelled contact sheet is tiled.
 * Media is review evidence only: delete it when finished.
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const ROOT = decodeURIComponent(path.dirname(new URL(import.meta.url).pathname));
const FILE = path.resolve(opt('file', path.join(ROOT, 'index.html')));
const SCENE = opt('scene', 'send');
const THEME = opt('theme', 'basic-dark');
const OUT = path.resolve(opt('out', '/tmp/turn-film'));
const RATE = Number(opt('rate', 0.1));
const MS = Number(opt('ms', 900));
const STEP = Number(opt('step', 16.667));
const [W, H] = opt('size', '1440x900').split('x').map(Number);
const CROP = opt('crop', '0,0,1,1').split(',').map(Number);
const COLS = Number(opt('cols', 6));
const TW = Number(opt('width', 320));
const VOICE = opt('voice', 'auto');
const MSG = opt('msg', 'Walk me through the steps for the rollout.');
const FROM = Number(opt('from', 0));
const WIDE = argv.includes('--wide');
const GPU = argv.includes('--gpu');          // new headless mode with the GPU (use on the Mac)
const FAMILY = opt('family', 'deliverable');
const TO = opt('to', 'query');

const SCENES = {
  /* the composer text flies into its bubble, then the reply waits and streams */
  send: {
    setup: `(() => { PM56_DEMO.selectThread('plain'); const ta=document.querySelector('textarea[data-input="composer"]'); ta.focus(); ta.value=${JSON.stringify(MSG)}; ta.dispatchEvent(new Event('input',{bubbles:true})); })()`,
    trigger: `document.querySelector('[data-action="send"]').click()`
  },
  /* a whole live agent turn: send, think, the card born from the mark, parallel
     subjects, narration tucking into the caption, the fold and the answer */
  live: {
    setup: `(() => { PM56_DEMO.selectThread('live-turn'); const ta=document.querySelector('textarea[data-input="composer"]'); ta.focus(); ta.value=${JSON.stringify(opt('msg', "Add the composite index and prove it's faster."))}; ta.dispatchEvent(new Event('input',{bubbles:true})); })()`,
    trigger: `document.querySelector('[data-action="send"]').click()`
  },
  /* one existing item of a family replayed as a live arrival (its entrance) */
  arrive: {
    setup: `(() => { PM56_DEMO.arrivePrepare(${JSON.stringify(FAMILY)}); })()`,
    trigger: `PM56_DEMO.arrive(${JSON.stringify(FAMILY)})`
  },
  /* switching threads: one crossfade of the whole list, no per-item entrances */
  switch: {
    setup: `(() => { PM56_DEMO.selectThread('plain'); })()`,
    trigger: `PM56_DEMO.selectThread(${JSON.stringify(TO)})`
  },
  multi: {
    setup: `(() => { PM56_DEMO.selectThread('plain'); })()`,
    trigger: `PM56_DEMO.trigger('Multi-orbit turn')`
  }
};
const sc = SCENES[SCENE];
if (!sc) { console.error('unknown scene', SCENE); process.exit(2); }
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const browser = GPU
  ? await chromium.launch({ channel: 'chromium', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist'] })
  : await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + FILE);
  await page.bringToFront();
  await page.waitForTimeout(1200);
  await page.evaluate(([t, v]) => { PM56_DEMO.completeWorking(); PM56_DEMO.setTheme(t); if (v !== 'auto' && PM56_DEMO.setVoice) PM56_DEMO.setVoice(v); }, [THEME, VOICE]);
  await page.waitForTimeout(400);
  if (WIDE) for (let i = 0; i < 4; i++) { const b = await page.$('[data-action="close-editor"]'); if (!b) break; await b.click(); await page.waitForTimeout(150); }
  await page.evaluate(sc.setup);
  await page.waitForTimeout(900);
  const stage = await page.evaluate(() => { const r = document.querySelector('.chat-stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  const clip = { x: Math.round(stage.x + stage.width * CROP[0]), y: Math.round(stage.y + stage.height * CROP[1]), width: Math.round(stage.width * CROP[2]), height: Math.round(stage.height * CROP[3]), scale: 1 };
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Animation.enable');
  /* a late window (--from past 1.5s) runs at full speed until a second before it,
     so the screenshot budget is spent on the frames that are kept */
  const lead = FROM > 1500 ? FROM - 1000 : 0, r0 = lead ? 1 : RATE;
  await cdp.send('Animation.setPlaybackRate', { playbackRate: r0 });
  await cdp.send('Runtime.evaluate', { expression: `PM56_CLOCK.setScale(${r0}); window.__filmT0 = PM56_CLOCK.now(); ${sc.trigger}` });
  const clockT = async () => (await cdp.send('Runtime.evaluate', { expression: 'PM56_CLOCK.now() - window.__filmT0', returnByValue: true })).result.value;
  if (lead) {
    while (await clockT() < lead) await page.waitForTimeout(40);
    await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
    await cdp.send('Runtime.evaluate', { expression: `PM56_CLOCK.setScale(${RATE})` });
  }
  const kept = [];
  let next = FROM, n = 0, guard = 0;
  while (guard++ < 5000) {
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip });
    const t = (await cdp.send('Runtime.evaluate', { expression: 'PM56_CLOCK.now() - window.__filmT0', returnByValue: true })).result.value;
    if (t >= next) {
      fs.writeFileSync(path.join(OUT, `f${String(n).padStart(4, '0')}.png`), Buffer.from(shot.data, 'base64'));
      kept.push(Math.round(t)); n++; next = Math.max(next + STEP, t + STEP * 0.5);
    }
    if (t > MS) break;
  }
  await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
  await cdp.send('Runtime.evaluate', { expression: 'PM56_CLOCK.setScale(1)' });
  fs.writeFileSync(path.join(OUT, 'film.json'), JSON.stringify({ scene: SCENE, theme: THEME, rate: RATE, step: STEP, frames: n, times: kept, errors: errs }, null, 1));
  try {
    for (let i = 0; i < n; i++) {
      const f = path.join(OUT, `f${String(i).padStart(4, '0')}.png`), l = path.join(OUT, `l${String(i).padStart(4, '0')}.png`);
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', f, '-vf', `scale=${TW}:-2,drawtext=text='${kept[i]}ms':x=5:y=5:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.65`, l]);
    }
    const rows = Math.ceil(n / COLS);
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '30', '-i', path.join(OUT, 'l%04d.png'), '-vf', `tile=${COLS}x${rows}:padding=3:color=gray`, '-frames:v', '1', path.join(OUT, 'sheet.png')]);
    for (let i = 0; i < n; i++) fs.rmSync(path.join(OUT, `l${String(i).padStart(4, '0')}.png`), { force: true });
  } catch (e) { console.error('sheet failed', String(e).slice(0, 300)); }
  console.log(JSON.stringify({ out: OUT, frames: n, span: kept[kept.length - 1], errors: errs.slice(0, 3) }));
} finally { await browser.close(); }
