// Measures rendered WAV files (tools/checks/render.check.mjs writes them). No model in it and nothing to listen with:
// it reports loudness (BS.1770 K-weighted, gated), true-ish peak, where the energy sits, and the three textures that
// were rejected before in PMConcept7's sound:
//   hum    a narrow tone that holds its level for seconds (a drone)
//   wobble a tone whose level beats a few times a second (two partials a hair apart)
//   buzz   level switching on and off tens of times a second (a gated tone, "breaking up")
// usage: node tools/measure.mjs <folder or files...> [--json]
import fs from 'node:fs'; import path from 'node:path';

function readWav(file) {
  const b = fs.readFileSync(file); let o = 12, fmt = null, data = null;
  while (o + 8 <= b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) }; if (id === 'data') { data = b.subarray(o + 8, o + 8 + n); break; } o += 8 + n + (n & 1); }
  const n = data.length / (2 * fmt.ch), ch = []; for (let c = 0; c < fmt.ch; c++) ch.push(new Float32Array(n));
  for (let i = 0; i < n; i++) for (let c = 0; c < fmt.ch; c++) ch[c][i] = data.readInt16LE((i * fmt.ch + c) * 2) / 32768;
  return { sr: fmt.sr, ch, n };
}
const dB = (x) => 20 * Math.log10(Math.max(x, 1e-9));
function biq(x, b, a) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
// BS.1770 K-weighting at 48 kHz
const K1 = [[1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]], K2 = [[1, -2, 1], [1, -1.99004745483398, 0.99007225036621]];
function lufs(w) {
  const k = w.ch.map((c) => biq(biq(c, K1[0], K1[1]), K2[0], K2[1])), blk = Math.round(0.4 * w.sr), hop = Math.round(0.1 * w.sr), z = [];
  for (let s = 0; s + blk <= w.n; s += hop) { let e = 0; for (const c of k) { let q = 0; for (let i = s; i < s + blk; i++) q += c[i] * c[i]; e += q / blk; } z.push(e); }
  const L = (e) => -0.691 + 10 * Math.log10(Math.max(e, 1e-12)), abs = z.filter((e) => L(e) > -70); if (!abs.length) return { I: -99, max: -99, lra: 0 };
  const rel = L(abs.reduce((a, b) => a + b, 0) / abs.length) - 10, g = abs.filter((e) => L(e) > rel), I = L(g.reduce((a, b) => a + b, 0) / g.length);
  const st = []; const sb = Math.round(3 * w.sr); for (let s = 0; s + sb <= w.n; s += w.sr) { let e = 0; for (const c of k) { let q = 0; for (let i = s; i < s + sb; i++) q += c[i] * c[i]; e += q / sb; } st.push(L(e)); }
  const so = st.filter((v) => v > -70).sort((a, b) => a - b), lra = so.length > 3 ? so[Math.floor(so.length * 0.95)] - so[Math.floor(so.length * 0.1)] : 0;
  return { I, max: Math.max(...z.map(L)), lra };
}
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
function analyse(file) {
  const w = readWav(file), mono = new Float32Array(w.n); let peak = 0, sq = 0, dc = 0;
  for (let i = 0; i < w.n; i++) { let m = 0; for (const c of w.ch) { m += c[i]; if (Math.abs(c[i]) > peak) peak = Math.abs(c[i]); } mono[i] = m / w.ch.length; sq += mono[i] * mono[i]; dc += mono[i]; }
  const L = lufs(w), N = 8192, hop = 2048, frames = Math.max(1, Math.floor((w.n - N) / hop)), win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
  const bands = [[20, 80], [80, 250], [250, 2000], [2000, 6000], [6000, 20000]], be = bands.map(() => 0), re = new Float32Array(N), im = new Float32Array(N), spec = [];
  for (let f = 0; f < frames; f++) { for (let i = 0; i < N; i++) { re[i] = mono[f * hop + i] * win[i]; im[i] = 0; } fft(re, im); const m = new Float32Array(N / 2); for (let i = 0; i < N / 2; i++) { m[i] = re[i] * re[i] + im[i] * im[i]; const hz = i * w.sr / N; for (let b = 0; b < bands.length; b++) if (hz >= bands[b][0] && hz < bands[b][1]) be[b] += m[i]; } spec.push(m); }
  const tot = be.reduce((a, b) => a + b, 0) || 1, share = be.map((v) => Math.round(100 * v / tot));
  // hum: the longest time any one narrow band stays within 4 dB of its own level while it is among the loudest things sounding
  const fps = w.sr / hop; let hum = { s: 0, hz: 0 };
  const lo = Math.floor(60 * N / w.sr), hi = Math.floor(6000 * N / w.sr), frameE = spec.map((m) => { let e = 0; for (let i = lo; i < hi; i++) e += m[i]; return e; });
  const medE = frameE.slice().sort((a, b) => a - b)[Math.floor(frameE.length / 2)] || 1e-12;
  for (let i = lo; i < hi; i++) {
    let run = 0, ref = 0;
    for (let f = 0; f < spec.length; f++) {
      const v = spec[f][i] + (spec[f][i - 1] || 0) + (spec[f][i + 1] || 0), strong = v > frameE[f] * 0.05 && v > medE * 0.02;
      if (strong && (run === 0 || Math.abs(10 * Math.log10(v / ref)) < 4)) { if (run === 0) ref = v; run++; if (run / fps > hum.s) hum = { s: run / fps, hz: Math.round(i * w.sr / N) }; } else run = 0;
    }
  }
  // wobble and buzz: how strongly the overall level is modulated at 3-14 Hz and at 18-90 Hz, while something sounds
  const er = 1000, step = Math.round(w.sr / er), env = new Float32Array(Math.floor(w.n / step)); let lp = 0; const k = 1 - Math.exp(-1 / (0.002 * w.sr));
  for (let i = 0; i < w.n; i++) { lp += (Math.abs(mono[i]) - lp) * k; if (i % step === 0) env[i / step] = lp; }
  const M = 2048; let wob = 0, buzz = 0, cnt = 0; const r2 = new Float32Array(M), i2 = new Float32Array(M);
  for (let s = 0; s + M <= env.length; s += M / 2) {
    let mean = 0; for (let i = 0; i < M; i++) mean += env[s + i] / M; if (mean < 0.004) continue;
    for (let i = 0; i < M; i++) { r2[i] = (env[s + i] - mean) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / M)); i2[i] = 0; } fft(r2, i2);
    const amp = (h) => 4 * Math.hypot(r2[h], i2[h]) / (M * mean); let a = 0, b = 0;
    for (let h = 1; h < M / 2; h++) { const hz = h * er / M; if (hz >= 3 && hz <= 14) a = Math.max(a, amp(h)); if (hz >= 18 && hz <= 90) b = Math.max(b, amp(h)); }
    wob += a; buzz += b; cnt++;
  }
  // silence: the share of the file below -60 dBFS (a tune with holes in it)
  let quiet = 0; for (let i = 0; i < env.length; i++) if (env[i] < 0.001) quiet++;
  return { file: path.basename(file), seconds: +(w.n / w.sr).toFixed(1), lufs: +L.I.toFixed(1), momentaryMax: +L.max.toFixed(1), range: +L.lra.toFixed(1), peakDb: +dB(peak).toFixed(1), rmsDb: +dB(Math.sqrt(sq / w.n)).toFixed(1), dc: +(dc / w.n).toFixed(5),
    share, hum, wobble: cnt ? +(wob / cnt).toFixed(2) : 0, buzz: cnt ? +(buzz / cnt).toFixed(2) : 0, quiet: Math.round(100 * quiet / Math.max(1, env.length)) };
}
const args = process.argv.slice(2), json = args.includes('--json'), files = [];
args.filter((a) => !a.startsWith('--')).forEach((a) => { if (fs.statSync(a).isDirectory()) fs.readdirSync(a).filter((f) => f.endsWith('.wav')).sort().forEach((f) => files.push(path.join(a, f))); else files.push(a); });
const rows = files.map(analyse);
if (json) console.log(JSON.stringify(rows, null, 1));
else {
  console.log('file'.padEnd(30) + ' sec   LUFS  mom.max range  peak   sub/low/mid/pres/air %   hum(s @Hz)   wobble buzz quiet%');
  rows.forEach((r) => console.log(r.file.padEnd(30) + String(r.seconds).padStart(5) + String(r.lufs).padStart(7) + String(r.momentaryMax).padStart(8) + String(r.range).padStart(6) + String(r.peakDb).padStart(7) + '   ' + r.share.join('/').padEnd(18) + (r.hum.s.toFixed(1) + ' @' + r.hum.hz).padStart(12) + String(r.wobble).padStart(8) + String(r.buzz).padStart(6) + String(r.quiet).padStart(6)));
}
