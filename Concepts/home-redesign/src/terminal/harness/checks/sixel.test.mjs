// Sixel codec tests: node harness/checks/sixel.test.mjs (from src/terminal). Exits 1 on any failure.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', '..', 'js', '32-sixel.js'), 'utf8');
const T = {};
new Function('window', 'T', src)({}, T);
const S = T.Sixel;

let failed = 0, passed = 0;
const timings = {};
function test(name, fn) {
  try { fn(); passed++; console.log('ok   ' + name); }
  catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + (e && e.message)); }
}
const px = (r, x, y) => Array.from(r.rgba.subarray((y * r.width + x) * 4, (y * r.width + x) * 4 + 4));
const pct = (v) => Math.round(v * 255 / 100);

// deterministic PRNG (mulberry32)
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// strip the DCS wrapper produced by encode into (params, data)
function split(seq) {
  assert.ok(seq.startsWith('\x1bP'), 'starts with DCS');
  assert.ok(seq.endsWith('\x1b\\'), 'ends with ST');
  const q = seq.indexOf('q');
  return { params: seq.slice(2, q).split(';').map(Number), data: seq.slice(q + 1, -2) };
}
function roundTrip(rgba, w, h, opts) {
  const seq = S.encode(rgba, w, h, opts);
  const { params, data } = split(seq);
  return { seq, res: S.decode(params, data) };
}
function meanErr(a, b, n, skipTransparent) {
  let sum = 0, cnt = 0;
  for (let p = 0; p < n; p++) {
    const o = p * 4;
    if (skipTransparent && a[o + 3] < 128) continue;
    sum += Math.abs(a[o] - b[o]) + Math.abs(a[o + 1] - b[o + 1]) + Math.abs(a[o + 2] - b[o + 2]);
    cnt += 3;
  }
  return sum / cnt;
}
// mean error of 4x4 block averages: what the eye sees of a dithered image
function blockErr(a, b, w, h) {
  let e = 0, n = 0;
  for (let y = 0; y + 4 <= h; y += 4) for (let x = 0; x + 4 <= w; x += 4) for (let c = 0; c < 3; c++) {
    let sa = 0, sb = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const o = ((y + j) * w + x + i) * 4 + c; sa += a[o]; sb += b[o]; }
    e += Math.abs(sa - sb) / 16; n++;
  }
  return e / n;
}
function gradient(w, h) {
  const a = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    a[o] = Math.round(255 * x / (w - 1)); a[o + 1] = Math.round(255 * y / (h - 1)); a[o + 2] = 128; a[o + 3] = 255;
  }
  return a;
}
function procedural(w, h) {
  const a = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 4;
    const u = x / w, v = y / h;
    const ring = Math.sin(Math.hypot(u - 0.5, v - 0.5) * 30);
    a[o] = 128 + 127 * Math.sin(u * 6.28 + ring);
    a[o + 1] = 128 + 127 * Math.cos(v * 9.0 - ring * 0.5);
    a[o + 2] = 255 * (0.5 + 0.5 * Math.sin((u + v) * 12));
    a[o + 3] = 255;
  }
  return a;
}

// ---------------------------------------------------------------- decode basics

test('LIMITS are the settled numbers', () => {
  assert.deepEqual({ ...S.LIMITS }, { maxWidth: 10000, maxHeight: 10000, maxPixels: 16777216, maxRegisters: 1024, maxBytes: 16777216 });
  assert.ok(Object.isFrozen(S.LIMITS));
});

test('default VT340 palette and a single sixel', () => {
  const r = S.decode([0, 0, 0], '#1~');
  assert.equal(r.ok, true); assert.equal(r.width, 1); assert.equal(r.height, 6);
  for (let y = 0; y < 6; y++) assert.deepEqual(px(r, 0, y), [pct(20), pct(20), pct(80), 255]);
  const r2 = S.decode([0, 0, 0], '#2~#15!2~');
  assert.deepEqual(px(r2, 0, 0), [pct(80), pct(13), pct(13), 255]);
  assert.deepEqual(px(r2, 2, 5), [pct(80), pct(80), pct(80), 255]);
});

test('RGB and HLS colour introducers (DEC hue: 0 blue, 120 red, 240 green)', () => {
  const rgb = S.decode([], '#5;2;100;50;0~');
  assert.deepEqual(px(rgb, 0, 0), [255, 128, 0, 255]);
  const red = S.decode([], '#5;1;120;50;100~'), blue = S.decode([], '#5;1;0;50;100~'), green = S.decode([], '#5;1;240;50;100~');
  assert.deepEqual(px(red, 0, 0), [255, 0, 0, 255]);
  assert.deepEqual(px(blue, 0, 0), [0, 0, 255, 255]);
  assert.deepEqual(px(green, 0, 0), [0, 255, 0, 255]);
  const grey = S.decode([], '#7;1;77;50;0~');
  assert.deepEqual(px(grey, 0, 0), [128, 128, 128, 255]);
  const clamped = S.decode([], '#3;2;900;100;100~');
  assert.deepEqual(px(clamped, 0, 0), [255, 255, 255, 255]);
});

test('repeat, carriage return and new line', () => {
  const r = S.decode([], '#1!10@$#2!3?!2A-#3~');
  assert.equal(r.width, 10); assert.equal(r.height, 12);
  assert.deepEqual(px(r, 0, 0), [pct(20), pct(20), pct(80), 255]);   // bit 0 of '@'
  assert.deepEqual(px(r, 3, 1), [pct(80), pct(13), pct(13), 255]);   // 'A' = bit 1, after 3 blanks
  assert.deepEqual(px(r, 0, 6).slice(0, 3), [pct(20), pct(80), pct(20)]);
  assert.equal(r.lastBandY, 6);
  const zero = S.decode([], '#1!0~');
  assert.equal(zero.width, 1, '!0 counts as 1');
  const dropped = S.decode([], '#1!5$~');
  assert.equal(dropped.width, 1, 'a repeat followed by a non-sixel is dropped');
});

test('raster attributes size the image; P2 selects background vs transparent', () => {
  const r = S.decode([0, 0, 0], '"1;1;20;10#1~');
  assert.equal(r.width, 20); assert.equal(r.height, 10); assert.equal(r.transparentBg, false);
  assert.deepEqual(px(r, 19, 9), [0, 0, 0, 255], 'unset pixel takes register 0');
  const redef = S.decode([0, 2, 0], '"1;1;4;4#0;2;100;100;100#1~');
  assert.deepEqual(px(redef, 3, 3), [255, 255, 255, 255], 'register 0 as redefined');
  const t = S.decode([0, 1, 0], '"1;1;20;10#1~');
  assert.equal(t.transparentBg, true);
  assert.deepEqual(px(t, 19, 9), [0, 0, 0, 0]);
  assert.deepEqual(px(t, 0, 0), [pct(20), pct(20), pct(80), 255]);
  const grow = S.decode([], '"1;1;2;2#1!5~');
  assert.equal(grow.width, 5); assert.equal(grow.height, 6, 'data past the raster grows the image');
  const late = S.decode([], '#1~"1;1;50;50~');
  assert.equal(late.width, 2); assert.equal(late.height, 6, 'raster after data is ignored');
  const strParams = S.decode(['0', '1', '0'], '#1~');
  assert.equal(strParams.transparentBg, true);
});

test('registers are private per image and wrap at maxRegisters', () => {
  S.decode([], '#1;2;100;0;0~');
  const r = S.decode([], '#1~');
  assert.deepEqual(px(r, 0, 0), [pct(20), pct(20), pct(80), 255]);
  const w = S.decode([], '#1025;2;0;100;0#1~');
  assert.deepEqual(px(w, 0, 0), [0, 255, 0, 255], '1025 wraps to register 1');
  const small = S.decode([], '#20;2;0;0;100~', { maxRegisters: 16 });
  assert.equal(small.ok, true);
});

// ---------------------------------------------------------------- errors and hostile input

function isErr(r, code) {
  assert.equal(r.ok, false); assert.equal(r.code, code);
  assert.deepEqual(Object.keys(r).sort(), ['code', 'ok'], 'errors carry no input text');
}

test('fixed error codes', () => {
  isErr(S.decode([], ''), 'EINVAL');
  isErr(S.decode([], '$-$-#3'), 'EINVAL');
  isErr(S.decode([], null), 'EINVAL');
  isErr(S.decode([], 12), 'EINVAL');
  isErr(S.decode([], '"1;1;10001;1#1~'), 'EFBIG');
  isErr(S.decode([], '"1;1;5000;5000#1~'), 'EFBIG');           // 25 M pixels
  isErr(S.decode([], '#1!10001~'), 'EFBIG');
  isErr(S.decode([], '-'.repeat(1700) + '#1~'), 'EFBIG');       // 10200 rows
  isErr(S.decode([], '#1~', { maxBytes: 2 }), 'EFBIG');
  isErr(S.decode([], '#1!100~', { maxWidth: 50 }), 'EFBIG');
  isErr(S.decode([], '#1!4000~' + '-#1!4000~'.repeat(700)), 'EFBIG'); // 4000 x 4206 > maxPixels
  const ok = S.decode([], '"1;1;4096;4096');
  assert.equal(ok.ok, true); assert.equal(ok.width * ok.height, 16777216, 'exactly maxPixels is allowed');
});

test('hostile sequences from published crashes do not throw', () => {
  // Contour #2049: huge Pan (aspect) then one sixel
  let r = S.decode([], '"2147483904;1A');
  assert.equal(r.ok, true); assert.equal(r.width, 1); assert.equal(r.height, 2);
  assert.deepEqual(r.aspect, [1000000000, 1], 'aspect parsed, capped, not applied');
  // CVE-2022-24130 shape: repeat counts that overflow 32-bit maths against the image width
  isErr(S.decode([], '"1;1;10;10#1!4294967295~'), 'EFBIG');
  isErr(S.decode([], '#1!' + '9'.repeat(100000) + '~'), 'EFBIG');
  isErr(S.decode([], '"1;1;' + '9'.repeat(5000) + ';' + '9'.repeat(5000)), 'EFBIG');
  r = S.decode([], '#' + '9'.repeat(5000) + ';2;' + '9'.repeat(5000) + ';0;0~');
  assert.equal(r.ok, true);
  r = S.decode([0, 0, 0], '#1;1;-5;50;50~#1;3;1;1;1~#;;;;;;;;~!-3~');
  assert.equal(r.ok, true);
});

test('time is linear in the input', () => {
  const cases = {
    'newlines 4 MiB': '-'.repeat(4 << 20),
    'carriage returns 4 MiB': '$'.repeat(4 << 20),
    'colour selects 2 MiB': '#9'.repeat(1 << 20),
    'semicolons 4 MiB': '#' + ';'.repeat(4 << 20),
    'repeat digits 4 MiB': '!' + '1'.repeat(4 << 20),
    'blank sixels 4 MiB': '?'.repeat(4 << 20)
  };
  for (const [name, data] of Object.entries(cases)) {
    const t0 = performance.now();
    S.decode([], data);
    const ms = performance.now() - t0;
    timings['linear: ' + name] = ms.toFixed(1) + ' ms';
    assert.ok(ms < 400, name + ' took ' + ms.toFixed(1) + ' ms');
  }
});

// ---------------------------------------------------------------- encode and round trips

test('encode emits the complete sequence', () => {
  const img = gradient(8, 7);
  const seq = S.encode(img, 8, 7, {});
  assert.ok(seq.startsWith('\x1bP0;0;0q"1;1;8;7#0;2;'));
  assert.ok(seq.endsWith('\x1b\\'));
  assert.ok(!/[^\x20-\x7e\x1b\\]/.test(seq.slice(2, -2)), 'printable sixel data only');
  assert.ok(S.encode(img, 8, 7, { transparent: true }).startsWith('\x1bP0;1;0q"1;1;8;7'));
  const flat = new Uint8ClampedArray(100 * 6 * 4).fill(255);
  assert.ok(S.encode(flat, 100, 6).includes('!100~'), 'repeat compression');
  assert.equal(S.encode(img, 0, 7), '');
  assert.equal(S.encode(new Uint8ClampedArray(4), 8, 7), '');
});

test('round trip: 64x48 gradient', () => {
  const img = gradient(64, 48);
  const t0 = performance.now();
  const { seq, res } = roundTrip(img, 64, 48);
  timings['round trip 64x48 gradient'] = (performance.now() - t0).toFixed(1) + ' ms, ' + seq.length + ' bytes';
  assert.equal(res.ok, true); assert.equal(res.width, 64); assert.equal(res.height, 48);
  const err = meanErr(img, res.rgba, 64 * 48);
  timings['mean error 64x48 gradient'] = err.toFixed(2) + ' / 255 per channel';
  assert.ok(err < 4, 'mean error ' + err);
});

// error of a plain uniform 6x7x6 colour cube (252 colours), the yardstick for the quantizer
function uniformErr(img, n) {
  const lv = [6, 7, 6];
  let sum = 0;
  for (let p = 0; p < n; p++) for (let c = 0; c < 3; c++) {
    const v = img[p * 4 + c], step = 255 / (lv[c] - 1);
    sum += Math.abs(v - Math.round(v / step) * step);
  }
  return sum / (n * 3);
}

test('round trip: 300x200 procedural (more than 256 colours, median cut)', () => {
  const img = procedural(300, 200);
  const yard = uniformErr(img, 300 * 200);
  timings['mean error 300x200, uniform 252-colour cube for comparison'] = yard.toFixed(2) + ' / 255 per channel';
  const block = {};
  for (const dither of [false, true]) {
    const t0 = performance.now();
    const { seq, res } = roundTrip(img, 300, 200, { colors: 256, dither });
    const label = '300x200 procedural' + (dither ? ' dithered' : '');
    timings['round trip ' + label] = (performance.now() - t0).toFixed(1) + ' ms, ' + seq.length + ' bytes';
    assert.equal(res.ok, true); assert.equal(res.width, 300); assert.equal(res.height, 200);
    const err = meanErr(img, res.rgba, 300 * 200);
    block[dither] = blockErr(img, res.rgba, 300, 200);
    timings['mean error ' + label] = err.toFixed(2) + ' / 255 per channel, 4x4 block average ' + block[dither].toFixed(2);
    if (dither) assert.ok(err < 12 && block[true] < block[false], 'dithered error ' + err + ', block ' + block[true]);
    else assert.ok(err < 0.85 * yard, 'mean error ' + err + ' vs uniform ' + yard);
  }
});

test('round trip: transparency and few colours', () => {
  const w = 40, h = 25, img = new Uint8ClampedArray(w * h * 4);
  for (let p = 0; p < w * h; p++) {
    const x = p % w, y = (p / w) | 0, inside = (x - 20) ** 2 + (y - 12) ** 2 < 100;
    img.set(inside ? [200, 40, 90, 255] : [0, 0, 0, 0], p * 4);
  }
  const { res } = roundTrip(img, w, h, { transparent: true, colors: 16 });
  assert.equal(res.ok, true); assert.equal(res.transparentBg, true);
  assert.equal(res.width, w); assert.equal(res.height, h);
  for (let p = 0; p < w * h; p++) {
    assert.equal(res.rgba[p * 4 + 3] === 255, img[p * 4 + 3] === 255, 'alpha at ' + p);
  }
  assert.ok(meanErr(img, res.rgba, w * h, true) < 2);
  const two = S.encode(gradient(30, 30), 30, 30, { colors: 2 });
  const back = S.decode(...Object.values(split(two)));
  assert.equal(back.ok, true);
  assert.ok((two.match(/#\d+;2;/g) || []).length <= 2);
});

// ---------------------------------------------------------------- performance

test('decode 1000x600 256-colour image under 50 ms', () => {
  const w = 1000, h = 600, img = procedural(w, h);
  let t0 = performance.now();
  const seq = S.encode(img, w, h, { colors: 256 });
  timings['encode 1000x600 256 colours'] = (performance.now() - t0).toFixed(1) + ' ms, ' + (seq.length / 1024).toFixed(0) + ' KiB';
  t0 = performance.now();
  const seqD = S.encode(img, w, h, { colors: 256, dither: true });
  timings['encode 1000x600 256 colours dithered'] = (performance.now() - t0).toFixed(1) + ' ms, ' + (seqD.length / 1024).toFixed(0) + ' KiB';
  for (const [label, s] of [['', seq], [' dithered', seqD]]) {
    const { params, data } = split(s);
    const runs = [];
    for (let k = 0; k < 7; k++) {
      const t = performance.now();
      const r = S.decode(params, data);
      runs.push(performance.now() - t);
      assert.equal(r.ok, true); assert.equal(r.width, w); assert.equal(r.height, h);
    }
    const sorted = runs.slice().sort((a, b) => a - b), median = sorted[3];
    timings['decode 1000x600' + label] = 'first ' + runs[0].toFixed(1) + ' ms, median ' + median.toFixed(1) +
      ' ms, best ' + sorted[0].toFixed(1) + ' ms';
    assert.ok(median < 50, 'median decode ' + median.toFixed(1) + ' ms');
  }
});

// ---------------------------------------------------------------- fuzz

test('fuzz: 2000 cases, random bytes and mutations of valid images, no throw, each under 50 ms', () => {
  const rand = rng(0x5eed51);
  const ri = (n) => Math.floor(rand() * n);
  const alphabet = '0123456789;#!"$-?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
  const seeds = [];
  for (let s = 0; s < 12; s++) {
    const w = 1 + ri(80), h = 1 + ri(60);
    const img = s % 2 ? gradient(Math.max(2, w), Math.max(2, h)) : procedural(w, h);
    const ww = s % 2 ? Math.max(2, w) : w, hh = s % 2 ? Math.max(2, h) : h;
    seeds.push(split(S.encode(img, ww, hh, { colors: 2 + ri(255), dither: s % 3 === 0, transparent: s % 4 === 0 })));
  }
  let worst = 0, okCount = 0, codes = {}, retimed = 0;
  for (let c = 0; c < 2000; c++) {
    let data, params = [ri(10), ri(3), ri(2)];
    if (c % 2 === 0) {
      const len = ri(c % 10 === 0 ? 20000 : 600);
      const chars = new Array(len);
      for (let k = 0; k < len; k++) chars[k] = rand() < 0.7 ? alphabet[ri(alphabet.length)] : String.fromCharCode(ri(256));
      data = chars.join('');
    } else {
      const base = seeds[ri(seeds.length)];
      params = base.params.slice();
      const arr = base.data.split('');
      const muts = 1 + ri(12);
      for (let m = 0; m < muts; m++) {
        const at = ri(arr.length + 1), kind = ri(6);
        if (kind === 0) arr.splice(at, 0, alphabet[ri(alphabet.length)]);
        else if (kind === 1) arr.splice(at, 1 + ri(4));
        else if (kind === 2) arr[at] = String.fromCharCode(ri(256));
        else if (kind === 3) arr.splice(at, 0, ...String(ri(2) ? ri(100000) : 4294967295 + ri(1000)).split(''));
        else if (kind === 4) { const from = ri(arr.length), n = ri(200); arr.splice(at, 0, ...arr.slice(from, from + n)); }
        else arr.splice(at, 0, ['"', '#', '!', '$', '-', ';'][ri(6)]);
      }
      data = arr.join('');
    }
    let r, ms = Infinity;
    // a case over budget is timed twice more and judged by its best run, so scheduler or GC noise on a
    // shared machine does not fail it; the count of re-timed cases is reported
    for (let attempt = 0; attempt < 3 && ms >= 50; attempt++) {
      if (attempt) retimed++;
      const t0 = performance.now();
      try { r = S.decode(params, data); }
      catch (e) { throw new Error('case ' + c + ' threw'); }
      ms = Math.min(ms, performance.now() - t0);
    }
    if (ms > worst) worst = ms;
    assert.ok(ms < 50, 'case ' + c + ' took ' + ms.toFixed(1) + ' ms (' + data.length + ' chars, ' + (r.ok ? r.width + 'x' + r.height : r.code) + ')');
    if (r.ok) {
      okCount++;
      assert.equal(r.rgba.length, r.width * r.height * 4);
      assert.ok(r.width <= 10000 && r.height <= 10000 && r.width * r.height <= 16777216);
    } else {
      assert.ok(['EFBIG', 'EINVAL', 'ENOMEM'].includes(r.code));
      assert.deepEqual(Object.keys(r).sort(), ['code', 'ok']);
      codes[r.code] = (codes[r.code] || 0) + 1;
    }
  }
  timings['fuzz 2000 cases'] = 'worst ' + worst.toFixed(1) + ' ms (' + retimed + ' re-timed runs), ' + okCount + ' decoded, errors ' + JSON.stringify(codes);
});

test('encode never throws on odd input', () => {
  assert.equal(S.encode(null, 3, 3), '');
  assert.equal(S.encode(new Uint8ClampedArray(36), 3, 3, { colors: 0 }).endsWith('\x1b\\'), true);
  assert.equal(S.encode(new Uint8ClampedArray(36), 3, 3, { colors: 99999, transparent: true }), '\x1bP0;1;0q"1;1;3;3\x1b\\');
});

console.log('\nTimings (node ' + process.version + '):');
for (const [k, v] of Object.entries(timings)) console.log('  ' + k + ': ' + v);
console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
