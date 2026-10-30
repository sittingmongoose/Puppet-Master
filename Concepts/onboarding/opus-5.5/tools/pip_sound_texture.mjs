#!/usr/bin/env node
/* Pip's sound texture (F3-599, DL-238): what makes a quiet UI sound unpleasant, measured, for ears that cannot listen.
   From the approved concept's tools/sound_texture.mjs, on the product's src/js/15-sound-pip.js (O55.pipVoice).
   Renders every kit x event (and Pip's voice, and every loop) offline in a headless GPU browser
   (agent-browser) and reports, per take:
     buzz     the fast ripple inside a held sound (30-150 Hz amplitude modulation in any octave band that carries the
              sound, as a depth): a gated or ring-modulated tone, a low sawtooth's harmonics beating. Heard as buzzing,
              or a speaker breaking up. (A voice's own syllables, 20-25 a second, add a little.)
     wobble   slow ripple inside a held sound (3-15 Hz): two tones a hair apart beating. Heard as a hum or a warble.
     drone    for loops: a pitch that never stops (present in at least 70 % of the take). Heard as a hum.
   Fails (exit 1) on a drone in any loop. Buzz and wobble are rankings, not gates: a knock or a run of ticks scores
   too, so compare a take with its earlier self and with the same event in other kits, and listen to the worst.

     PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node tools/pip_sound_texture.mjs [--src 15-sound-pip.js] [--json out.json]
       [--wav DIR [--only kit/event,kit/loop:bed,...]]   also write the takes (or only those named) as WAV files */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright-core'); } catch (e) { pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core'); }
const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SRC = arg('--src') || path.join(HERE, 'src', 'js', '15-sound-pip.js'), JSON_OUT = arg('--json'), WAV = arg('--wav'), ONLY = (arg('--only') || '').split(',').filter(Boolean);

function analyse() {
  // runs in the page: window.__tex(buf) -> { buzz, wobble, drones }
  const lp2 = (sr, fc) => { const w0 = 2 * Math.PI * fc / sr, al = Math.sin(w0) / Math.SQRT2, cw = Math.cos(w0), a0 = 1 + al; return [(1 - cw) / 2 / a0, (1 - cw) / a0, (1 - cw) / 2 / a0, -2 * cw / a0, (1 - al) / a0]; };
  const bp2 = (sr, fc, Q) => { const w0 = 2 * Math.PI * fc / sr, al = Math.sin(w0) / (2 * Q), cw = Math.cos(w0), a0 = 1 + al; return [al / a0, 0, -al / a0, -2 * cw / a0, (1 - al) / a0]; };
  const run = (x, c) => { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = c[0] * x[i] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
    }
  }
  // the ripple depth of an envelope in a modulation band, over windows that sit inside a held sound (held: its slow
  // envelope, the gross shape, stays up; the fast one may dip to nothing, which is the buzz being measured)
  function ripple(e, es, er, N, f0, f1, still, floor) {
    const w = new Float32Array(N); for (let i = 0; i < N; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
    let best = 0;
    for (let s = 0; s + N <= e.length; s += N >> 2) {
      let mu = 0, ms = 0, mn = Infinity; for (let i = 0; i < N; i++) { mu += e[s + i]; ms += es[s + i]; if (es[s + i] < mn) mn = es[s + i]; } mu /= N; ms /= N;
      if (ms < floor || mn < still * ms) continue;
      const re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N; i++) re[i] = (e[s + i] - mu) * w[i];
      fft(re, im);
      let p = 0; for (let k = Math.ceil(f0 * N / er); k <= Math.floor(f1 * N / er); k++) p += re[k] * re[k] + im[k] * im[k];
      best = Math.max(best, (4 / N) * Math.sqrt(p / 1.5) / mu);
    }
    return best;
  }
  window.__tex = (buf, loop) => {
    const sr = buf.sampleRate, n = buf.length, L = buf.getChannelData(0), Rr = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
    const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = (L[i] + Rr[i]) / 2;
    const dec = 12, er = sr / dec, bands = [125, 250, 500, 1000, 2000, 4000], env = [];
    bands.forEach((fc) => {
      const b = run(run(x, bp2(sr, fc, 1.41)), bp2(sr, fc, 1.41)), r = new Float32Array(n); for (let i = 0; i < n; i++) r[i] = Math.abs(b[i]);
      const s1 = run(run(r, lp2(sr, 320)), lp2(sr, 320)), e = new Float32Array(Math.floor(n / dec)); let m = 0, sum = 0;
      for (let i = 0; i < e.length; i++) { e[i] = Math.max(0, s1[i * dec]); m = Math.max(m, e[i]); sum += e[i]; }
      const sl = (fc) => run(run(e, lp2(er, fc)), lp2(er, fc));
      env.push({ fc, e, s40: sl(40), s15: sl(15), s2: sl(1.5), m, mean: sum / e.length });
    });
    const top = Math.max(...env.map((b) => b.mean));
    let buzz = 0, wobble = 0, bz = 0, wb = 0;
    env.forEach((b) => {
      if (b.mean < top * 0.25) return; // a band 12 dB under the one that carries the sound is not what you hear
      // buzz at two scales: 60-150 Hz inside 24 ms of a held sound (so a voice's own syllables, or a run of ticks, are
      // not counted), and 30-60 Hz inside 64 ms; wobble inside half a second
      const r1 = Math.max(ripple(b.e, b.s40, er, 96, 60, 150, 0.55, b.m * 0.15), ripple(b.e, b.s15, er, 256, 30, 60, 0.55, b.m * 0.15)), r2 = ripple(b.e, b.s2, er, 2048, 3, 15, 0.35, b.m * 0.15);
      if (r1 > buzz) { buzz = r1; bz = b.fc; } if (r2 > wobble) { wobble = r2; wb = b.fc; }
    });
    // drones: spectral peaks that are there in nearly every frame
    const drones = [];
    if (loop) {
      const N = 8192, hop = sr / 2, count = new Map(); let frames = 0;
      for (let s = Math.floor(sr * 0.7); s + N <= n; s += hop) {
        const re = new Float64Array(N), im = new Float64Array(N); let e = 0;
        for (let i = 0; i < N; i++) { const v = x[s + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); re[i] = v; e += x[s + i] * x[s + i]; }
        if (Math.sqrt(e / N) < 1e-4) { frames++; continue; }
        fft(re, im); frames++;
        const mag = new Float64Array(N / 2); let mx = 0; for (let k = 1; k < N / 2; k++) { mag[k] = Math.hypot(re[k], im[k]); if (mag[k] > mx) mx = mag[k]; }
        const seen = new Set();
        // a tone, not noise: a peak standing well above its neighbourhood
        const prom = (k) => { let a = 0, c = 0; for (let j = Math.max(1, k - 30); j < Math.min(N / 2, k + 31); j++) if (Math.abs(j - k) > 3) { a += mag[j]; c++; } return mag[k] / (a / c + 1e-12); };
        for (let k = 2; k < N / 2 - 1; k++) if (mag[k] > mx * 0.25 && mag[k] >= mag[k - 1] && mag[k] >= mag[k + 1] && mag[k] * 2 / (N / 2) > 3e-4 && prom(k) > 8) { const key = Math.round(k / 2); if (!seen.has(key)) { seen.add(key); count.set(key, (count.get(key) || 0) + 1); } }
      }
      count.forEach((c, key) => { if (frames >= 6 && c >= frames * 0.7) drones.push(Math.round(key * 2 * sr / N)); });
    }
    return { buzz: +buzz.toFixed(3), buzzBand: bz, wobble: +wobble.toFixed(3), wobbleBand: wb, drones };
  };
}

const s = JSON.parse(execFileSync('agent-browser', ['start', '--url', 'about:blank']).toString());
let browser, failed = 0;
try {
  browser = await pw.chromium.connectOverCDP(s.cdp_endpoint);
  const page = browser.contexts()[0].pages()[0];
  page.on('pageerror', (e) => { console.log('pageerror', String(e)); failed++; });
  await page.addScriptTag({ content: 'window.O55 = window.O55 || { sound: { ctx: null, master: null, muted: false, unlock() { return false; } } };' });
  await page.addScriptTag({ content: readFileSync(SRC, 'utf8') });
  await page.addScriptTag({ content: '(() => { const V = window.O55.pipVoice; window.PipSound = { KITS: V.KITS, EVENTS: V.EVENTS, LOOPS: V.LOOPS, TARGET: V.TARGET, SUBTLE: V.SUBTLE, OFFSET: V.OFFSET, TRIM: V.TRIM, _render: V.render, _stats: V.stats, _wav: V.wav, _chainGain: V.chainGain, _MAKEUP: V.MAKEUP }; })();' });
  await page.addScriptTag({ content: `(${analyse.toString()})();` });
  const rows = await page.evaluate(async ({ wavAll, only }) => {
    const P = window.PipSound, out = [];
    for (const kit of P.KITS) {
      const jobs = P.EVENTS.map((e) => ['play', e]).concat(P.LOOPS.map((l) => ['loop', l])); /* (Pip's lines are O55.sound.pip's: found measures them) */
      for (const [kind, name] of jobs) {
        const key = kind === 'loop' ? 'loop:' + name : name;
        const buf = await P._render(kit, kind, name, {}, { seconds: kind === 'loop' ? 10 : undefined });
        const r = Object.assign({ kit, key }, window.__tex(buf, kind === 'loop'));
        if (wavAll || only.indexOf(kit + '/' + key) >= 0) r.wav = P._wav(buf);
        out.push(r);
      }
    }
    return out;
  }, { wavAll: !!WAV && !ONLY.length, only: ONLY });
  if (WAV) {
    mkdirSync(WAV, { recursive: true });
    rows.filter((r) => r.wav).forEach((r) => { writeFileSync(path.join(WAV, `${r.kit}-${r.key.replace(':', '-')}.wav`), Buffer.from(r.wav, 'base64')); delete r.wav; });
  }
  const bad = [];
  rows.forEach((r) => {
    const why = [];
    if (r.drones.length) why.push(`drone ${r.drones.join(', ')} Hz`);
    if (why.length) bad.push(`${r.kit}/${r.key}: ${why.join('; ')}`);
  });
  const kits = [...new Set(rows.map((r) => r.kit))];
  console.log('kit        buzz median/max (worst)                    wobble median/max (worst)');
  kits.forEach((k) => {
    const rs = rows.filter((r) => r.kit === k), b = rs.map((r) => r.buzz).sort((p, q) => p - q), w = rs.map((r) => r.wobble).sort((p, q) => p - q);
    const wb = rs.reduce((a, r) => (r.buzz > a.buzz ? r : a), rs[0]), ww = rs.reduce((a, r) => (r.wobble > a.wobble ? r : a), rs[0]);
    console.log(`${k.padEnd(10)} ${b[b.length >> 1].toFixed(3)} / ${b[b.length - 1].toFixed(3)} (${wb.key})`.padEnd(54) + `${w[w.length >> 1].toFixed(3)} / ${w[w.length - 1].toFixed(3)} (${ww.key})`);
  });
  if (bad.length) { console.log('\nFLAGGED:\n  ' + bad.join('\n  ')); failed += bad.length; }
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(rows, null, 1));
  console.log(`\n${rows.length} takes from ${path.relative(process.cwd(), SRC) || SRC}; ${bad.length} flagged`);
} finally {
  if (browser) await browser.close().catch(() => {});
  execFileSync('agent-browser', ['stop', s.id]);
}
process.exit(failed ? 1 : 0);
