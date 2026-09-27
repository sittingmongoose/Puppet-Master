/* Sound verification: offline WAV render of every event in every family kit, plus a live trace + analyser check.
 * node tools/sound_render.mjs <out-dir>
 * Writes <out>/<family>/<event>.wav, sound.json (peaks, durations, live checks). tools/sound_board.py then builds
 * the listening boards and spectrograms. Rendering uses OfflineAudioContext, so it works under --mute-audio. */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pageFile = resolve(here, '../../../TestOpus5.5PmConcept.html');
const out = resolve(process.argv[2] || '/tmp/o55/sound');
mkdirSync(out, { recursive: true });
const { page, close } = await launch({ width: 1440, height: 900 });
const report = { renders: {}, live: {} };
try {
  await page.goto(pathToFileURL(pageFile).href + '?o55=off');
  await sleep(1200);
  const events = await page.evaluate(() => window.O55.sound.EVENTS);
  for (const fam of ['basic', 'friendly', 'glass', 'retro']) {
    mkdirSync(join(out, fam), { recursive: true });
    report.renders[fam] = {};
    for (const ev of events) {
      const r = await page.evaluate((f, e) => window.O55.sound.renderWav(f, e), fam, ev);
      if (!r) { report.renders[fam][ev] = null; continue; }
      writeFileSync(join(out, fam, `${ev}.wav`), Buffer.from(r.base64, 'base64'));
      report.renders[fam][ev] = { peak: r.peak, seconds: r.seconds };
    }
  }
  /* live: a real click unlocks audio, events are traced with the active family, the analyser sees signal, mute
     stops playback but keeps the trace, and reload reads the active Project value (no-Project preview is discarded) */
  await page.evaluate(() => { window.O55.ui.open({ fresh: true }); });
  await sleep(1400);
  if (await page.evaluate(() => window.O55.sound.muted)) await page.click('#pm-o55-onboarding .o55-sound');
  await page.click('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-primary');
  await sleep(120);
  report.live.afterClick = await page.evaluate(async () => {
    const S = window.O55.sound; const buf = new Float32Array(S.tap ? S.tap.fftSize : 0); let rms = 0;
    if (S.tap) { for (let k = 0; k < 6 && rms < 1e-4; k++) { await new Promise(r => setTimeout(r, 25)); S.tap.getFloatTimeDomainData(buf); rms = Math.sqrt(buf.reduce((a, v) => a + v * v, 0) / buf.length); } }
    return { ctx: S.ctx && S.ctx.state, rms: +rms.toFixed(5), last: S.log.slice(-3) };
  });
  await sleep(900);
  await page.click('#pm-o55-onboarding .o55-sound');
  await sleep(200);
  await page.click('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-tile[data-arg="retro"]');
  await sleep(300);
  report.live.afterMute = await page.evaluate(() => ({ muted: window.O55.sound.muted, stored: localStorage.getItem('pm.o55.sound'), pressed: document.querySelector('#pm-o55-onboarding .o55-sound').getAttribute('aria-pressed'), last: window.O55.sound.log.slice(-2), setting: (() => { try { return window.O55.sound.binding(); } catch (e) { return 'err'; } })() }));
  await page.goto(pathToFileURL(pageFile).href + '?o55=off');
  await sleep(1000);
  report.live.afterReload = await page.evaluate(() => ({ muted: window.O55.sound.muted, binding: window.O55.sound.binding(), legacyStored: localStorage.getItem('pm.o55.sound') }));
  report.errors = page.errors;
} finally { await close(); }
writeFileSync(join(out, 'sound.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ live: report.live, errors: report.errors, silent: Object.entries(report.renders).flatMap(([f, m]) => Object.entries(m).filter(([, v]) => !v || v.peak < 0.005).map(([e]) => f + ':' + e)) }, null, 1));
