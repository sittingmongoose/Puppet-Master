/* Sound verification: offline render of every kit x event x variant (O55.sound.renderBuffer, an OfflineAudioContext,
 * so it works under --mute-audio and ignores the mute), plus live checks in the page.
 *   node tools/sound_render.mjs <out-dir> [--page <built.html>] [--no-wav] [--no-live] [--no-pip | --pip-only]
 * Writes <out>/<kit>/<event>[-<n>].wav (16-bit mono) and sound.json:
 *   renders[kit][event] = [{ variant, peak, peakDb, rmsDb, lk, seconds, trim }]   (one per variant)
 *     rmsDb  RMS over the 10 ms windows within 20 dB of the loudest one (the sound's body, not its silence)
 *     lk     the same over a K-weighted signal (ITU-R BS.1770 pre-filter: +4 dB shelf above ~1.7 kHz, high-pass at
 *            38 Hz), a closer guess at how loud it sounds; tools/sound_catalog.py levels the kits on it
 *   depths[kit][event] = [{ depth, variant, peak, peakDb, rmsDb, lk, seconds }]   the stings ('chapter', and NieR's
 *     'quest' takes) rendered at every depth 0..4 (the library previews depth 4), so a 1-note sting is levelled too
 *   catalog: the CATALOG length and a render check of every entry (finite, not silent, peak < 0.9, a title and an about)
 *   live: a real click unlocks audio; every event in every kit plays (log played:true, no error) with NieR off and on;
 *         unknown events fall back; the NieR kit follows NieR Mode and its Menu sounds part; the mute, reload binding;
 *         and the hero pass's rules: runs, claimed stings and re-entry, the depth by chapter, rest, the found/success
 *         deferral, the celebration's layer after commit/finish/save, foley under texture and its Reduced Motion and
 *         landing limits, a stage sound's pan from its voice, and Pod 042's 8-bit Show Me voice
 * tools/sound_board.py then builds listening boards and spectrograms (--pip: Pip's board); tools/sound_catalog.py writes
 * TRIM and DUR (--pip: the TRIM and MAKEUP blocks of 15-sound-pip.js).
 *   voice: Pip's voice (O55.sound.pip) in each look, a line and two vocals, dry and with its look's room (Q1 B):
 *          voice.rows[] = { voice, key, send, dry: stats, room: stats, tail: [{ at, dry, room }] } and
 *          <out>/pip-voice/<voice>/<key>-dry.wav and -room.wav (tools/sound_board.py --pip puts them on a board)
 *   pip: Pip's kits (lane onb, 15-sound-pip.js), the six looks' stage events and loops as O55.sound.pip plays them (the
 *        same registered event functions, offline, at their trims): pip.rows[] = { kit, kind, name, key, target, raw
 *        (untrimmed stats), rmsDb, rmsZ, peakDb, dc, hfDb, dur, nan, buzz, wobble, drones } and <out>/pip/<kit>/<key>.wav;
 *        F3-599's checks (no NaN, peak under -1 dB, not silent, no DC) and the concept's texture checks (no drone in a
 *        loop; buzz and wobble reported). --pip-only skips everything else.
 * Chrome comes from tools/chrome.mjs (set CHROME to a GPU wrapper on the VM). */
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (k) => args.includes('--' + k);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const pageFile = resolve(opt('page', resolve(here, '../../../PMConcept7.html')));
const out = resolve(args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--page')) || '/tmp/o55/sound');
mkdirSync(out, { recursive: true });
const { page, close } = await launch({ width: 1440, height: 900 });
const report = { page: pageFile, renders: {}, catalog: null, live: {} };

/* in the page: render one entry and measure it (and encode the WAV when asked) */
const measure = async (kit, ev, v, wav, ro) => {
  const S = window.O55.sound, buf = await S.renderBuffer(kit, ev, v, ro || undefined);
  if (!buf) return null;
  const n = buf.length, rate = buf.sampleRate, m = new Float32Array(n);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) m[i] += d[i] / buf.numberOfChannels; }
  let peak = 0, finite = true;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < n; i++) { const a = Math.abs(d[i]); if (!Number.isFinite(a)) finite = false; else if (a > peak) peak = a; } }
  const biquad = (x, b0, b1, b2, a1, a2) => { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v0 = x[i], o = b0 * v0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v0; y2 = y1; y1 = o; y[i] = o; } return y; };
  const rbj = (type, f0, q, gainDb) => {
    const A = Math.pow(10, gainDb / 40), w = 2 * Math.PI * f0 / rate, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'highshelf') { const r = 2 * Math.sqrt(A) * al; b0 = A * ((A + 1) + (A - 1) * c + r); b1 = -2 * A * ((A - 1) + (A + 1) * c); b2 = A * ((A + 1) + (A - 1) * c - r); a0 = (A + 1) - (A - 1) * c + r; a1 = 2 * ((A - 1) - (A + 1) * c); a2 = (A + 1) - (A - 1) * c - r; }
    else { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  };
  const kw = biquad(biquad(m, ...rbj('highshelf', 1681.97, 0.7072, 4)), ...rbj('highpass', 38.14, 0.5003, 0));
  const gated = (x) => { const W = Math.round(rate * 0.01), w = []; for (let i = 0; i + W <= x.length; i += W) { let p = 0; for (let j = i; j < i + W; j++) p += x[j] * x[j]; w.push(p / W); } const top = w.length ? Math.max(...w) : 0, act = w.filter((p) => p > top / 100); return act.length ? Math.sqrt(act.reduce((a, b) => a + b, 0) / act.length) : 0; };
  const db = (x) => +(20 * Math.log10(Math.max(1e-9, x))).toFixed(2);
  const res = { variant: v, peak: +peak.toFixed(4), peakDb: db(peak), rmsDb: db(gated(m)), lk: db(gated(kw)), seconds: +(n / rate).toFixed(3), finite };
  if (wav) {
    const bytes = new DataView(new ArrayBuffer(44 + n * 2)), w = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); bytes.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true);
    bytes.setUint32(24, rate, true); bytes.setUint32(28, rate * 2, true); bytes.setUint16(32, 2, true); bytes.setUint16(34, 16, true); w(36, 'data'); bytes.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, m[i])) * 0x7fff, true);
    let bin = ''; const u8 = new Uint8Array(bytes.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    res.base64 = btoa(bin);
  }
  return res;
};

function pipTexture() {
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
  window.__pipTex = (buf, loop) => {
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

/* Pip's kits, in the page: the list of takes, then one take at a time (untrimmed for the level, and as heard, with its
   WAV), so no single answer from the page is large */
const pipList = () => {
  const V = window.O55.pipVoice; if (!V || !V.render) return null;
  const jobs = [];
  V.KITS.forEach((kit) => V.EVENTS.map((e) => ['play', e]).concat(V.LOOPS.map((l) => ['loop', l])).forEach(([kind, name]) => jobs.push([kit, kind, name])));
  return jobs;
};
const pipTake = async (kit, kind, name, wav) => {
  const V = window.O55.pipVoice, key = kind === 'loop' ? 'loop:' + name : name, loop = kind === 'loop';
  const subtle = (V.SUBTLE[kit] || []).indexOf(name) >= 0;
  const target = V.TARGET[key] - (subtle ? 7 : 0) + (((V.OFFSET || {})[kit] || {})[key] || 0);
  const raw = V.stats(await V.render(kit, kind, name, {}, { raw: true, notrim: true, seconds: loop ? 8 : undefined }), { whole: loop });
  const buf = await V.render(kit, kind, name, {}, { seconds: loop ? 10 : undefined });
  const r = Object.assign({ kit, kind, name, key, target, raw }, V.stats(buf, { whole: loop }), window.__pipTex(buf, loop));
  if (wav) r.base64 = V.wav(buf);
  return r;
};

/* Pip's voice, dry and in its room: stats from the pip tools' measure (A-weighted body RMS, peak, duration), the tail as
   the level after the dry take has ended (dB of its 0.1 s windows), and the room's share of the energy */
const VOICE_LINE = 'Hello! I am Pip. Let us set this up together.';
const voiceTake = async (voice, what, wav) => {
  const P = window.O55.sound.pip, V = window.O55.pipVoice, o = { voice, look: voice === 'phosphor' ? 'retro-dark' : voice === 'teletype' ? 'retro-light' : voice + '-dark' };
  const dry = await P.render(what, Object.assign({ dry: true }, o)), room = await P.render(what, o);
  if (!dry || !room) return null;
  const last = (b) => { const d = b.getChannelData(0), e = b.getChannelData(1); for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > 0.001 || Math.abs(e[i]) > 0.001) return i; return 0; };
  const win = (b, from, sec) => { const d = b.getChannelData(0), n = Math.min(d.length, from + Math.round(sec * b.sampleRate)); let acc = 0; for (let i = from; i < n; i++) acc += d[i] * d[i]; return n > from ? 10 * Math.log10(acc / (n - from) + 1e-20) : -200; };
  const end = last(dry), rnd = (v) => Math.round(v * 10) / 10;
  const tail = [0, 0.25, 0.5, 1].map((t) => ({ at: t, dry: rnd(win(dry, end + Math.round(t * 48000), 0.1)), room: rnd(win(room, end + Math.round(t * 48000), 0.1)) }));
  const side = (b) => Object.assign(V.stats(b), { lastSec: Math.round((last(b) / b.sampleRate) * 100) / 100 }, wav ? { base64: V.wav(b) } : {});
  return { dry: side(dry), room: side(room), tail };
};

try {
  await page.goto(pathToFileURL(pageFile).href + '?o55=off');
  await page.waitFor(() => !!(window.O55 && window.O55.sound && window.O55.sound.CATALOG), { timeout: 30000 });
  await sleep(800);
  if (!flag('no-pip')) {
    await page.evaluate(pipTexture);
    const jobs = await page.evaluate(pipList);
    if (jobs) {
      report.pip = { kits: [...new Set(jobs.map((j) => j[0]))], rows: [] };
      for (const [kit, kind, name] of jobs) {
        const r = await page.evaluate(pipTake, kit, kind, name, !flag('no-wav'));
        if (r.base64) { mkdirSync(join(out, 'pip', kit), { recursive: true }); writeFileSync(join(out, 'pip', kit, r.key.replace(':', '-') + '.wav'), Buffer.from(r.base64, 'base64')); delete r.base64; }
        report.pip.rows.push(r);
      }
      Object.assign(report.pip, await page.evaluate(async () => ({ chain: await window.O55.pipVoice.chainGain(), makeup: window.O55.pipVoice.MAKEUP })));
    }
    /* Pip's voice in its look's room (Q1 B): each voice says a line and two vocals, dry and with the room, through the
       one player's own chain (O55.sound.pip.render); the room may not make it louder or clip, and its tail must exist */
    const vjobs = await page.evaluate(() => { const P = window.O55.sound.pip; return P && P.render ? P.VOICES.map((v) => [v, P.roomSend(v)]) : null; });
    if (vjobs) {
      report.voice = { line: VOICE_LINE, rows: [] };
      for (const [voice, send] of vjobs) for (const what of [VOICE_LINE, 'happy', 'wake']) {
        const r = await page.evaluate(voiceTake, voice, what, !flag('no-wav'));
        if (!r) continue;
        const key = what === VOICE_LINE ? 'say' : what;
        for (const side of ['dry', 'room']) if (r[side].base64) { mkdirSync(join(out, 'pip-voice', voice), { recursive: true }); writeFileSync(join(out, 'pip-voice', voice, key + '-' + side + '.wav'), Buffer.from(r[side].base64, 'base64')); delete r[side].base64; }
        report.voice.rows.push(Object.assign({ voice, key, send }, r));
      }
    }
  }
  if (!flag('pip-only')) {
  const { kits, events } = await page.evaluate(() => {
    const S = window.O55.sound, kits = {};
    S.KIT_NAMES.forEach((k) => { kits[k] = {}; S.EVENTS.forEach((e) => { const n = S.variants(k, e); if (n) kits[k][e] = n; }); });
    return { kits, events: S.EVENTS };
  });
  report.events = events;
  for (const [kit, evs] of Object.entries(kits)) {
    mkdirSync(join(out, kit), { recursive: true });
    report.renders[kit] = {};
    for (const [ev, n] of Object.entries(evs)) {
      report.renders[kit][ev] = [];
      for (let v = 0; v < n; v++) {
        const r = await page.evaluate(measure, kit, ev, v, !flag('no-wav'));
        if (!r) { report.renders[kit][ev].push(null); continue; }
        if (r.base64) { writeFileSync(join(out, kit, `${ev}${n > 1 ? '-' + (v + 1) : ''}.wav`), Buffer.from(r.base64, 'base64')); delete r.base64; }
        report.renders[kit][ev].push(r);
      }
    }
  }
  /* the stings at every depth: every kit's chapter (variant 0) and each of NieR's quest takes */
  report.depths = {};
  for (const kit of Object.keys(kits)) {
    report.depths[kit] = {};
    for (const ev of ['chapter', 'quest']) {
      const n = kits[kit][ev]; if (!n) continue;
      report.depths[kit][ev] = [];
      for (let v = 0; v < n; v++) for (let depth = 0; depth <= 4; depth++) {
        const r = await page.evaluate(measure, kit, ev, v, false, { depth });
        if (r) report.depths[kit][ev].push(Object.assign({ depth }, r));
      }
    }
  }
  /* every library entry renders: finite, not silent, peak under 0.9, with a title and an about line */
  report.catalog = await page.evaluate(async () => {
    const S = window.O55.sound, bad = [];
    for (const e of S.CATALOG) {
      const b = await S.renderBuffer(e.kit, e.event, e.variant);
      let peak = 0, finite = true;
      for (let ch = 0; ch < b.numberOfChannels; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (!Number.isFinite(a)) finite = false; else if (a > peak) peak = a; } }
      if (!finite || peak < 0.003 || peak >= 0.9) bad.push({ id: e.id, peak, finite });
      if (!e.title || !e.about || /^soundLibrary\./.test(e.about) || /^soundLibrary\./.test(e.title)) bad.push({ id: e.id, copy: { title: e.title, about: e.about } });
    }
    const styles = {}; S.CATALOG.forEach((e) => { styles[e.style] = (styles[e.style] || 0) + 1; });
    return { entries: S.CATALOG.length, styles, bad, sample: S.CATALOG.filter((e, i) => i % 40 === 0).map((e) => ({ id: e.id, name: e.name, style: e.style, duration: e.duration })) };
  });

  }
  if (!flag('no-live') && !flag('pip-only')) {
    /* a real click is the gesture that unlocks audio; then the onboarding preview is unmuted */
    await page.mouse(700, 450);
    report.live.start = await page.evaluate(() => ({ muted: window.O55.sound.muted, binding: window.O55.sound.binding() }));
    await page.evaluate(() => { if (window.O55.sound.muted) window.O55.sound.setMuted(false, 'check'); });
    /* every event in every kit (forced by opts.kit), spaced past the merge window and the rate limits */
    report.live.events = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), res = { played: 0, failed: [] };
      for (const kit of S.KIT_NAMES) {
        for (const ev of S.EVENTS) {
          const n0 = S.log.length;
          S.play(ev, { kit });
          /* a finish rests 150 ms and then plays (and the rest would drop what follows it): wait past both */
          await wait(ev === 'finish' ? 480 : ev === 'hover' || ev === 'type' ? 140 : 130);
          const e = S.log.slice(n0).find((x) => x.event === ev || x.asked === ev);
          const silentOk = ev === 'hover' && kit !== 'nier';
          if (silentOk ? !(e && e.dropped === 'silent') : !(e && e.played && !e.error)) res.failed.push({ kit, ev, entry: e || null });
          else if (!silentOk) res.played++;
        }
      }
      return res;
    });
    /* the analyser sees signal while a sound plays */
    report.live.analyser = await page.evaluate(async () => {
      const S = window.O55.sound; S.play('commit'); const buf = new Float32Array(S.tap ? S.tap.fftSize : 0); let rms = 0;
      if (S.tap) for (let k = 0; k < 10 && rms < 1e-4; k++) { await new Promise((r) => setTimeout(r, 25)); S.tap.getFloatTimeDomainData(buf); rms = Math.sqrt(buf.reduce((a, v) => a + v * v, 0) / buf.length); }
      return { ctx: S.ctx && S.ctx.state, rms: +rms.toFixed(5) };
    });
    /* unknown events fall back (a new event in a kit that lacks it plays its fallback; a typo stays silent) */
    report.live.fallback = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
      await wait(250); /* past the merge window of the check before */
      for (const ev of ['pod', 'decode', 'glitch', 'quest', 'nierOn', 'nierOff', 'reboot', 'hover', 'wake', 'showPointer', 'showInterrupt', 'noSuchEvent']) {
        const n0 = S.log.length; S.play(ev, { kit: 'basic' }); await wait(130);
        const e = S.log.slice(n0).find((x) => x.event === ev) || null;
        out[ev] = e && { resolved: e.resolved || null, played: !!e.played, dropped: e.dropped || null };
      }
      return out;
    });
    /* which kit plays: NieR off, NieR on (sounds part on), NieR on with the part off */
    report.live.kit = await page.evaluate(async () => {
      const S = window.O55.sound, N = window.PM_NIER, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
      const kitNow = () => S.kitFor('select', {});
      out.off = kitNow();
      if (N && N.set) {
        N.set(true); await wait(1800);
        out.on = kitNow(); out.onAttr = document.documentElement.getAttribute('data-o55-nier-parts');
        const n0 = S.log.length; S.play('select'); await wait(120); out.onPlayed = S.log.slice(n0).map((x) => x.kit + ':' + x.event + ':' + !!x.played);
        const parts = N.parts(); N.setParts(parts.filter((p) => p !== 'sounds')); await wait(900);
        out.partOff = kitNow(); out.nierOnWithPartOff = S.kitFor('nierOn', {});
        N.setParts(parts); await wait(900);
        out.partBack = kitNow();
        out.menuSfxThroughO55 = await (async () => { const before = S.log.filter((x) => x.event === 'synth').length; window.PM_NIER_PARTS.play('select'); await wait(60); return S.log.filter((x) => x.event === 'synth').length - before; })();
        S.suppress(300); out.suppressed = S.suppressed(); out.heldWhileSuppressed = window.PM_NIER_PARTS.play('select'); await wait(350); out.releasedAfter = !S.suppressed();
        N.set(false); await wait(1800);
        out.after = kitNow();
      }
      return out;
    });
    /* intensity: quiet and dark, and bright, both play */
    report.live.intensity = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [];
      for (const i of [0.05, 0.5, 0.95]) { await wait(160); const n0 = S.log.length; S.play('checkpoint', { intensity: i, kit: 'nier' }); await wait(20); const e = S.log.slice(n0)[0]; out.push({ intensity: i, played: !!(e && e.played) }); }
      return out;
    });
    /* the chapter sting: a forward move into a new chapter plays 'chapter' */
    report.live.chapter = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(200); S.setContext({ chapter: 'welcome', step: 0 }); S.setContext({ chapter: 'computer', step: 1 });
      const n0 = S.log.length; S.play('next'); await wait(120); S.setContext({ step: 2 }); S.play('next'); await wait(20);
      return S.log.slice(n0).map((x) => ({ event: x.event, asked: x.asked || null, played: !!x.played }));
    });
    /* merging: commit + next + celebrate in one task play commit, with the celebration's sparkles layered */
    report.live.merge = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(200); const n0 = S.log.length;
      S.play('next'); S.play('commit'); S.play('celebrate'); S.play('success');
      await wait(700); /* past a success's deferral behind the chapter check's sting: it then gives way to the commit */
      return S.log.slice(n0).map((x) => ({ event: x.event, played: !!x.played, layer: !!x.layer, dropped: x.dropped || null, by: x.by || null }));
    });
    /* the hero pass's rules, each in its own moment (waits keep them past the merge window and the rate limits) */
    report.live.hero = await page.evaluate(async () => {
      const S = window.O55.sound, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {}, k = 'basic';
      const since = (n0) => S.log.slice(n0).map((x) => { const o = { event: x.event }; ['asked', 'kit', 'played', 'dropped', 'by', 'layer', 'layerOf', 'depth', 'voice', 'pan', 'step', 'deferred', 'resolved'].forEach((f) => { if (x[f] != null && x[f] !== false) o[f] = x[f]; }); return o; });
      /* a run: the chapters sting at depths 1, 2, 3; Back across a boundary and forward again is a plain next; Ready
         rests 150 ms and resolves at depth 4 */
      await wait(300); let n0 = S.log.length;
      S.setContext({ run: 'check-1', chapter: 'welcome', step: 0 });
      const walk = ['computer', 'project', 'ai'];
      for (let i = 0; i < walk.length; i++) { await wait(900); S.setContext({ chapter: walk[i], step: i + 1 }); S.play('next', { kit: k }); }
      await wait(900); S.setContext({ chapter: 'project', step: 2 }); S.play('back', { kit: k });
      await wait(900); S.setContext({ chapter: 'ai', step: 3 }); S.play('next', { kit: k });
      await wait(900); S.setContext({ chapter: 'ready', step: 4 }); S.play('next', { kit: k });
      await wait(700); out.run = since(n0);
      /* a claimed sting (sting: false): the move plays plain, the chapter counts, the caller's quest carries the depth;
         a found asked for 100 ms after the quest waits until 500 ms after it */
      n0 = S.log.length;
      S.setContext({ run: 'check-2', chapter: 'welcome', step: 0 }); await wait(200);
      S.setContext({ chapter: 'computer', step: 1, sting: false }); S.play('next', { kit: 'nier' });
      out.claimDepth = S.context().depth;
      await wait(300); S.play('quest', { kit: 'nier', chapter: 'computer', depth: S.context().depth });
      await wait(100); const askedFound = performance.now(); S.play('found', { kit: 'nier' });
      await wait(700); out.claim = since(n0); out.foundWait = Math.round(performance.now() - askedFound);
      /* rest: what is under PRIO 75 is dropped while it lasts; the resolution after it plays */
      await wait(300); n0 = S.log.length;
      S.play('select', { kit: k }); await wait(40); S.rest(150); S.play('tap', { kit: k }); await wait(80); S.play('cheer', { kit: k, voice: 2 }); await wait(120); S.play('chapter', { kit: k, chapter: 'ready', depth: 4 });
      await wait(300); out.rest = since(n0);
      /* the celebration: sparkles 650 ms after a commit, full 650 ms after a save (the Project made), sparkles 1.1 s
         after a resolution (a depth-4 sting) */
      await wait(1500); n0 = S.log.length;
      S.play('commit', { kit: k }); await wait(650); S.play('celebrate', { kit: k });
      await wait(2200); S.play('save', { kit: k }); await wait(650); S.play('celebrate', { kit: k });
      await wait(2600); S.play('chapter', { kit: k, chapter: 'ready', depth: 4 }); await wait(1100); S.play('celebrate', { kit: k });
      await wait(300); out.celebrate = since(n0);
      /* foley sits under texture and under a move; at most three landings in 400 ms; a stage sound sits at its voice */
      await wait(400); n0 = S.log.length;
      S.play('move', { kit: 'nier' }); S.play('string', { kit: 'nier', voice: 0 });
      await wait(150);
      for (let i = 0; i < 4; i++) { S.play('land', { kit: 'friendly', voice: i % 3 }); await wait(95); }
      await wait(300); S.play('next', { kit: k }); S.play('bow', { kit: k, voice: 2 });
      await wait(300); out.foley = since(n0);
      /* Reduced Motion: foley is skipped, a state sound still plays */
      const html = document.documentElement, motionWas = html.getAttribute('data-motion');
      html.setAttribute('data-motion', 'reduced');
      await wait(200); n0 = S.log.length;
      S.play('land', { kit: k, voice: 0 }); S.play('string', { kit: k }); await wait(150); S.play('wake', { kit: 'nier' });
      await wait(150); out.reduced = since(n0);
      if (motionWas == null) html.removeAttribute('data-motion'); else html.setAttribute('data-motion', motionWas);
      /* the name sign: each letter's string one step up */
      await wait(1000); n0 = S.log.length;
      for (let i = 1; i <= 9; i++) { S.play('string', { kit: 'friendly', step: i }); await wait(130); }
      out.name = since(n0);
      /* Show Me under NieR: the pointer while the tour demonstrates, the hand-back while it runs, a plain pointer after */
      const T = window.O55.tour; n0 = S.log.length;
      if (T && T.st) {
        const was = T.st.show, running = T.running;
        T.st.show = { cancelled: false }; S.play('pointer', { kit: 'nier' }); await wait(220);
        T.st.show = was; T.running = true; S.play('interrupt', { kit: 'nier' }); await wait(220);
        T.running = running; S.play('pointer', { kit: 'nier' }); await wait(220);
      }
      out.show = since(n0);
      /* the tour is another journey: a run of its own, its chapters from depth 1, and a finish after a rest */
      n0 = S.log.length;
      S.setContext({ chapter: 'tour-ask', step: 0 }); await wait(200);
      S.setContext({ chapter: 'tour-workspace', step: 6 }); S.play('next', { kit: k }); await wait(900);
      S.setContext({ chapter: 'tour-plan', step: 9 }); S.play('next', { kit: k }); await wait(900);
      S.play('finish', { kit: k }); await wait(500);
      out.tour = since(n0);
      /* the Project made: a commit asked for on the Creating screen plays as the save (the Create press commits from
         Review); then the confetti's celebration 650 ms later plays in full */
      const SS = window.O55.S;
      await wait(400); n0 = S.log.length;
      if (SS) {
        /* a stand-in session for the two moments (the page runs with the window closed) */
        const open = SS.open, sess = SS.sess; SS.sess = Object.assign({}, sess || {}, { screen: 'review' }); SS.open = true;
        S.play('commit', { kit: k, intensity: 0.8 }); await wait(1300);
        SS.sess.screen = 'creating'; S.play('commit', { kit: k, intensity: 1 }); await wait(650); S.play('celebrate', { kit: k }); await wait(300);
        SS.open = open; SS.sess = sess;
      }
      out.save = since(n0);
      /* under NieR with its quests part, inside the window: the chapter card owns the sting, so 'next' stays plain */
      const html2 = document.documentElement, N = window.PM_NIER;
      n0 = S.log.length;
      if (N && N.set) {
        N.set(true); await wait(1800);
        html2.setAttribute('data-o55-open', 'true');
        S.setContext({ run: 'check-q', chapter: 'welcome', step: 0 }); await wait(200);
        S.setContext({ chapter: 'computer', step: 1 }); S.play('next'); await wait(300);
        html2.removeAttribute('data-o55-open');
        S.setContext({ run: 'check-q2', chapter: 'welcome', step: 0 }); await wait(200);
        S.setContext({ chapter: 'computer', step: 1 }); S.play('next'); await wait(300);
        N.set(false); await wait(1800);
      }
      out.quests = since(n0);
      return out;
    });
    /* the verdict, rule by rule */
    {
      const h = report.live.hero, V = {}, pl = (x) => x.filter((e) => e.played);
      const stings = h.run.filter((e) => e.event === 'chapter');
      V.depthsInOrder = stings.map((e) => e.depth).join(',') === '1,2,3,4';
      V.reentryPlain = h.run.filter((e) => e.event === 'next' && e.played).length === 1 && h.run.some((e) => e.event === 'back' && e.played);
      V.readyRests = h.run.some((e) => e.event === 'rest') && stings.length === 4 && stings[3].deferred === 150 && !!stings[3].played;
      V.claimPlain = h.claim.some((e) => e.event === 'next' && !e.asked && e.played) && h.claimDepth === 1 && h.claim.some((e) => e.event === 'quest' && e.depth === 1 && e.played);
      const fd = h.claim.find((e) => e.event === 'found');
      V.foundDeferred = !!(fd && fd.played && fd.deferred >= 350 && fd.deferred <= 450);
      const r = h.rest;
      V.rest = !!(r.find((e) => e.event === 'select' && e.played) && r.find((e) => e.event === 'tap' && e.dropped === 'rest') && r.find((e) => e.event === 'cheer' && e.dropped === 'rest') && r.find((e) => e.event === 'chapter' && e.played));
      const ce = h.celebrate.filter((e) => e.event === 'celebrate');
      V.celebrate = ce.length === 3 && ce[0].layerOf === 'commit' && ce[0].layer && !ce[1].layer && ce[1].played && ce[2].layerOf === 'resolve' && ce[2].layer;
      const f = h.foley;
      V.foleyUnder = !!(f.find((e) => e.event === 'move' && e.played) && f.find((e) => e.event === 'string' && e.played) && f.find((e) => e.event === 'next' && e.played) && f.find((e) => e.event === 'bow' && e.played && e.pan === 0.35));
      const lands = f.filter((e) => e.event === 'land');
      V.landLimit = lands.length === 4 && lands.slice(0, 3).every((e) => e.played) && lands[3].dropped === 'rate' && lands[0].pan === -0.35 && lands[1].pan === 0 && lands[2].pan === 0.35;
      V.reducedFoley = h.reduced.filter((e) => e.event === 'land' || e.event === 'string').every((e) => e.dropped === 'reduced') && h.reduced.some((e) => e.event === 'wake' && e.played && e.kit === 'nier');
      V.nameClimb = h.name.length === 9 && h.name.every((e, i) => e.played && e.step === i + 1);
      V.show = h.show.length === 3 && h.show[0].event === 'showPointer' && h.show[0].asked === 'pointer' && h.show[1].event === 'showInterrupt' && h.show[2].event === 'pointer';
      const ts = h.tour.filter((e) => e.event === 'chapter'), fin = h.tour.find((e) => e.event === 'finish');
      V.tourRun = ts.map((e) => e.depth).join(',') === '1,2' && !!(fin && fin.deferred === 150 && fin.played) && h.tour.some((e) => e.event === 'rest');
      const sv = h.save.filter((e) => e.event === 'commit' || e.event === 'save' || e.event === 'celebrate');
      V.saveOnCreating = sv.length === 3 && sv[0].event === 'commit' && sv[0].played && sv[1].event === 'save' && sv[1].asked === 'commit' && sv[1].played && sv[2].event === 'celebrate' && sv[2].played && !sv[2].layer;
      const qn = h.quests.filter((e) => e.asked === 'next' || e.event === 'next');
      V.questsOwnSting = qn.length === 2 && qn[0].event === 'next' && qn[0].kit === 'nier' && qn[1].event === 'chapter' && qn[1].kit === 'nier';
      report.live.heroVerdict = V;
    }
    /* mute stops playback but keeps the trace; the binding stays a session preview without a Project */
    await page.evaluate(() => window.O55.sound.setMuted(true, 'check'));
    report.live.afterMute = await page.evaluate(() => { const S = window.O55.sound; S.play('select'); const e = S.log[S.log.length - 1]; return { muted: S.muted, last: e, binding: S.binding() }; });
    await page.goto(pathToFileURL(pageFile).href + '?o55=off');
    await sleep(1200);
    report.live.afterReload = await page.evaluate(() => ({ muted: window.O55.sound.muted, binding: window.O55.sound.binding(), legacyStored: localStorage.getItem('pm.o55.sound') }));
  }
  report.errors = page.errors;
} finally { await close(); }
writeFileSync(join(out, 'sound.json'), JSON.stringify(report, null, 1));
const silent = [], loud = [];
for (const [k, m] of Object.entries(report.renders)) for (const [e, vs] of Object.entries(m)) vs.forEach((r, i) => { if (!r || r.peak < 0.003) silent.push(`${k}:${e}:${i + 1}`); else if (r.peak >= 0.9) loud.push(`${k}:${e}:${i + 1}`); });
console.log(JSON.stringify({ out, renders: Object.values(report.renders).reduce((a, m) => a + Object.values(m).reduce((b, v) => b + v.length, 0), 0), silent, loud, catalog: report.catalog && { entries: report.catalog.entries, bad: report.catalog.bad.length, styles: report.catalog.styles }, live: report.live, errors: report.errors }, null, 1));
/* Pip's kits: F3-599's checks and the texture checks (tools/sound_catalog.py --pip levels them) */
if (report.pip) {
  const bad = [], warn = [];
  report.pip.rows.forEach((r) => {
    const why = [];
    if (r.nan) why.push(`NaN x${r.nan}`);
    if (r.peakDb > -1) why.push(`peak ${r.peakDb}`);
    if (r.rmsDb < -70) why.push('silent');
    if (Math.abs(r.dc) > 0.005) why.push(`DC ${r.dc}`);
    if (r.drones && r.drones.length) why.push(`drone ${r.drones.join(', ')} Hz`);
    if (why.length) bad.push(`${r.kit}/${r.key}: ${why.join(', ')}`);
    if (r.hfDb > -10 && r.dur > 0.3) warn.push(`${r.kit}/${r.key}: bright above 10 kHz (${r.hfDb} dB)`);
  });
  const worst = (k) => report.pip.rows.reduce((a, r) => (r[k] > a[k] ? r : a), report.pip.rows[0]);
  console.log(JSON.stringify({ pip: { takes: report.pip.rows.length, kits: report.pip.kits, failures: bad, warnings: warn, buzzMax: worst('buzz').buzz, buzzWorst: worst('buzz').kit + '/' + worst('buzz').key, wobbleMax: worst('wobble').wobble, wobbleWorst: worst('wobble').kit + '/' + worst('wobble').key, chain: report.pip.chain, makeup: report.pip.makeup } }));
  if (bad.length) process.exitCode = 1;
}
