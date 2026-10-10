// Effects tests: node harness/checks/fx.test.mjs (from src/terminal). Exits 1 on any failure.
// Covers js/50-fx-gl.js (no-GPU detection, parameter clamping, presets, flicker cap, curvature mapping and its inverse,
// the animation clock) and js/51-fx-trail.js (kitty trigger rule, durations, frame lifecycle), plus the source bans.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const T = {};
new Function('window', 'T', read('js/50-fx-gl.js'))({ devicePixelRatio: 1 }, T);
new Function('window', 'T', read('js/51-fx-trail.js'))({ devicePixelRatio: 1 }, T);
const G = T.FXGL, R = T.FXTrail;

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok   ' + name); }
  catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + (e && e.message)); }
}
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- create: the no-GPU path ---- */
test('create returns null without a canvas or WebGL', () => {
  assert.equal(G.create(null), null);
  assert.equal(G.create({}), null);
  const asked = [];
  const c = { getContext(type, attrs) { asked.push([type, attrs]); return null; } };
  assert.equal(G.create(c), null);
  assert.equal(asked[0][0], 'webgl2');
  assert.ok(asked.some((a) => a[0] === 'webgl'), 'falls back to WebGL1');
  assert.equal(asked[0][1].failIfMajorPerformanceCaveat, true);
  assert.equal(asked[0][1].premultipliedAlpha, true);
});
test('create returns null on a software rasterizer even when the caveat flag is ignored', () => {
  for (const name of ['Google SwiftShader', 'llvmpipe (LLVM 17.0.6, 256 bits)', 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)']) {
    let lost = false;
    const gl = {
      getExtension(n) {
        if (n === 'WEBGL_debug_renderer_info') return { UNMASKED_RENDERER_WEBGL: 1, UNMASKED_VENDOR_WEBGL: 2 };
        if (n === 'WEBGL_lose_context') return { loseContext() { lost = true; } };
        return null;
      },
      getParameter(x) { return x === 1 ? name : 'Google Inc.'; }
    };
    const c = { getContext(type) { return type === 'webgl2' ? gl : null; } };
    assert.equal(G.create(c), null, name);
    assert.equal(lost, true, 'the context is released');
  }
});

/* ---- parameters ---- */
test('defaults are the Retro dark defaults from the brief', () => {
  const d = G.defaults();
  assert.deepEqual(d.scanlines, { on: true, strength: 0.30, period: 3 });
  assert.deepEqual(d.glow, { on: true, strength: 0.45, radius: 2.5 });
  assert.deepEqual(d.curvature, { on: false, amount: 0.08 });
  assert.deepEqual(d.bezel, { on: false });
  assert.deepEqual(d.vignette, { on: false, strength: 0.25 });
  assert.deepEqual(d.burnIn, { on: false, persistMs: 450 });
  assert.deepEqual(d.noise, { on: false, amount: 0.035 });
  assert.deepEqual(d.flicker, { on: false, amount: 0.02 });
  assert.equal(d.degauss, null); assert.equal(d.dim, 0);
});
test('normalize clamps every number and enforces the flicker cap', () => {
  const p = G.normalize({ flicker: { on: true, amount: 0.5 }, scanlines: { strength: 9, period: 0 }, glow: { radius: -1 },
    curvature: { on: true, amount: 2 }, noise: { amount: NaN }, dim: 7, burnIn: { persistMs: 1e9 }, degauss: { startMs: 5 } });
  assert.equal(p.flicker.amount, 0.03);
  assert.equal(p.scanlines.strength, 0.6); assert.equal(p.scanlines.period, 2);
  assert.equal(p.glow.radius, 0.5); assert.equal(p.curvature.amount, 0.3);
  assert.equal(p.noise.amount, 0.035, 'NaN falls back to the default');
  assert.equal(p.dim, 0.9); assert.equal(p.burnIn.persistMs, 1600);
  assert.deepEqual(p.degauss, { startMs: 5 });
  assert.equal(G.normalize({ degauss: { startMs: 'x' } }).degauss, null);
});
test('presets: Retro dark default, Full CRT (opt-in tier), Off', () => {
  const r = G.preset('retroDark'), f = G.preset('fullCRT'), o = G.preset('off');
  assert.ok(r.scanlines.on && r.glow.on);
  assert.ok(!r.curvature.on && !r.bezel.on && !r.vignette.on && !r.burnIn.on && !r.noise.on && !r.flicker.on);
  assert.ok(f.curvature.on && f.bezel.on && f.vignette.on && f.burnIn.on && f.noise.on);
  assert.ok(!f.flicker.on, 'flicker stays off in Full CRT');
  for (const k of ['scanlines', 'glow', 'curvature', 'bezel', 'vignette', 'burnIn', 'noise', 'flicker']) assert.ok(!o[k].on, k);
});

/* ---- flicker: below WCAG 2.3.1 ---- */
test('flicker gain never modulates relative luminance by more than 0.03', () => {
  const r = rng(7);
  let lo = 1, hi = 0;
  for (let i = 0; i < 20000; i++) {
    const amount = r() * 2, t = r() * 1e7, g = G.flickerGain(amount, t);
    lo = Math.min(lo, g); hi = Math.max(hi, g);
    assert.ok(g <= 1 && g >= 1 - G.FLICKER_CAP - 1e-12, 'gain ' + g);
  }
  // the worst case between two frames for a white pixel (L = 1) is hi - lo <= cap, far under the 0.10 flash threshold
  assert.ok(hi - lo <= 0.03 + 1e-12);
  assert.equal(G.flickerGain(0, 1234), 1);
  // held for one ambient step (30 fps): equal values inside a step
  assert.equal(G.flickerGain(0.03, 1000), G.flickerGain(0.03, 1000 + 1000 / 30 - 0.5));
});
test('degauss envelope: full at the press, zero from 600 ms, monotone', () => {
  assert.equal(G.degaussEnvelope(0), 1); assert.equal(G.degaussEnvelope(1), 0); assert.equal(G.degaussEnvelope(-0.1), 0);
  let prev = 2;
  for (let t = 0; t < 1; t += 0.01) { const e = G.degaussEnvelope(t); assert.ok(e <= prev); prev = e; }
  assert.equal(G.DEGAUSS_MS, 600);
});

/* ---- curvature and pointer mapping ---- */
function geom(curv, bezel, W = 2000, H = 1000, dpr = 2) {
  const p = G.normalize({ curvature: { on: curv > 0, amount: curv }, bezel: { on: bezel } });
  return G.geometry(p, W, H, W, H, dpr);
}
test('flat screen maps the pointer to itself', () => {
  const g = geom(0, false);
  for (const [u, v] of [[0.001, 0.001], [0.5, 0.5], [0.999, 0.25]]) {
    const s = G.mapUV(u, v, g); assert.ok(Math.abs(s[0] - u) < 1e-12 && Math.abs(s[1] - v) < 1e-12);
  }
});
test('unmapUV inverts mapUV to 1e-9 with curvature 0.08 and 0.3, bezel on and off', () => {
  const r = rng(11);
  for (const [k, bz] of [[0.08, false], [0.08, true], [0.3, true], [0.3, false]]) {
    const g = geom(k, bz);
    let n = 0;
    for (let i = 0; i < 4000; i++) {
      const su = 0.01 + r() * 0.98, sv = 0.01 + r() * 0.98;
      const o = G.unmapUV(su, sv, g); if (!o) continue;
      const s = G.mapUV(o[0], o[1], g); if (!s) continue;
      assert.ok(Math.abs(s[0] - su) < 1e-9 && Math.abs(s[1] - sv) < 1e-9, `k=${k} bz=${bz}`);
      n++;
    }
    assert.ok(n > 3000, 'most points round-trip');
  }
});
test('outside the curved screen (corners, bezel) maps to null', () => {
  const g = geom(0.08, true);
  assert.equal(G.mapUV(0.001, 0.001, g), null);      // inside the bezel
  assert.equal(G.mapUV(0.999, 0.5, g), null);
  const g2 = geom(0.3, false);
  assert.equal(G.mapUV(0.0005, 0.0005, g2), null);   // the warp bends the corner away
  assert.ok(G.mapUV(0.5, 0.5, g2));
});
test('corner cells: the screen point of each corner cell centre maps back to that cell', () => {
  const W = 2000, H = 1000, dpr = 2, cssW = 1000, cssH = 500, pad = { x: 12, y: 10 }, cw = 8, ch = 22;
  const cols = Math.floor((cssW - 24) / cw), rows = Math.floor((cssH - 20) / ch);
  for (const [k, bz] of [[0.08, false], [0.08, true], [0.3, true]]) {
    const g = geom(k, bz, W, H, dpr);
    for (const [c, r] of [[0, 0], [cols - 1, 0], [0, rows - 1], [cols - 1, rows - 1]]) {
      const sx = pad.x + (c + 0.5) * cw, sy = pad.y + (r + 0.5) * ch;
      const o = G.unmapUV(sx / cssW, sy / cssH, g); assert.ok(o, 'on screen');
      const s = G.mapUV(o[0], o[1], g);
      assert.equal(Math.floor((s[0] * cssW - pad.x) / cw), c); assert.equal(Math.floor((s[1] * cssH - pad.y) / ch), r);
    }
  }
});

/* ---- the animation clock ---- */
test('animating(): idle with static effects, on with noise or flicker', () => {
  const tl = new G.Timeline();
  assert.equal(tl.animating(G.normalize({}), 0), false);
  assert.equal(tl.animating(G.normalize({ noise: { on: true } }), 0), true);
  assert.equal(tl.animating(G.normalize({ flicker: { on: true } }), 0), true);
  assert.equal(tl.animating(G.normalize({ flicker: { on: true, amount: 0 } }), 0), false);
});
test('animating(): burn-in decays to nothing, then stops after its clean frame', () => {
  const tl = new G.Timeline(), p = G.normalize({ burnIn: { on: true, persistMs: 450 } });
  tl.rendered(p, 1000, true);
  assert.equal(tl.animating(p, 1100), true);
  tl.rendered(p, 1300, false);
  assert.equal(tl.animating(p, 1449), true);
  assert.equal(tl.animating(p, 1460), true, 'the clean frame is still owed');
  tl.rendered(p, 1460, false);
  assert.equal(tl.animating(p, 1461), false);
  assert.equal(tl.animating(p, 99999), false);
});
test('animating(): degauss runs 600 ms and owes one clean frame', () => {
  const tl = new G.Timeline(), p = G.normalize({ degauss: { startMs: 0 } });
  assert.equal(tl.animating(p, 0), true);
  tl.rendered(p, 300, false); assert.equal(tl.animating(p, 300), true);
  assert.equal(tl.animating(p, 700), true);
  tl.rendered(p, 700, false); assert.equal(tl.animating(p, 701), false);
});

/* ---- trail ---- */
const cell = (c, r) => ({ x: c * 8, y: r * 17, w: 8, h: 17 });
test('trail trigger: more than 2 cells, after a 60 ms rest (kitty semantics)', () => {
  assert.equal(R.shouldFire(cell(0, 0), cell(2, 0), 1000), false, '2 cells');
  assert.equal(R.shouldFire(cell(0, 0), cell(3, 0), 1000), true, '3 cells');
  assert.equal(R.shouldFire(cell(0, 0), cell(0, 3), 1000), true, '3 rows');
  assert.equal(R.shouldFire(cell(0, 0), cell(2, 2), 1000), false, '2 and 2');
  assert.equal(R.shouldFire(cell(0, 0), cell(30, 0), 59), false, 'not rested');
  assert.equal(R.shouldFire(cell(0, 0), cell(30, 0), 60), true, 'rested 60 ms');
});
function fakeCanvas() {
  const calls = [];
  const grad = { addColorStop() {} };
  const ctx = new Proxy({}, { get(t, k) { if (k in t) return t[k]; if (k === 'createLinearGradient') return () => grad; return (...a) => calls.push([k, a]); },
    set(t, k, v) { t[k] = v; return true; } });
  const attrs = {};
  return { canvas: { width: 800, height: 400, clientWidth: 400, getContext: () => ctx, setAttribute(k, v) { attrs[k] = v; }, removeAttribute(k) { delete attrs[k]; } }, calls, attrs };
}
test('trail jump() tracks rest time from every move', () => {
  const { canvas } = fakeCanvas(); const tr = R.create(canvas);
  assert.equal(tr.jump(cell(0, 0), cell(1, 0), '#fff', 'phosphor', 1000), false, 'one cell (typing)');
  assert.equal(tr.jump(cell(1, 0), cell(40, 0), '#fff', 'phosphor', 1020), false, 'only 20 ms after the last move');
  assert.equal(tr.jump(cell(40, 0), cell(2, 9), '#fff', 'phosphor', 1100), true, 'rested 80 ms');
  assert.equal(tr.jump(cell(2, 9), cell(60, 1), '#fff', 'off', 2000), false, 'off');
});
test('trail frames: true while moving, false and cleared at the style duration', () => {
  for (const [style, ms, blend] of [['soft', 120, 'over'], ['glow', 160, 'add'], ['phosphor', 200, 'add'], ['trace', 140, 'over']]) {
    const { canvas, calls, attrs } = fakeCanvas(); const tr = R.create(canvas);
    assert.equal(tr.jump(cell(0, 0), cell(50, 10), 0x7eff8c, style, 0), true);
    assert.equal(tr.blend, blend); assert.equal(attrs['data-pmt-trail'], style);
    assert.equal(tr.frame(1), true); assert.equal(tr.frame(ms - 1), true, style + ' still moving');
    const n = calls.length;
    assert.equal(tr.frame(ms), false, style + ' done at ' + ms);
    assert.ok(calls.slice(n).some((c) => c[0] === 'clearRect'), 'its pixels are cleared');
    assert.equal(tr.changed, true, 'the clearing frame counts as a change');
    assert.equal(tr.frame(ms + 50), false);
    assert.equal(tr.changed, false, 'an idle trail is not a change');
    assert.equal(attrs['data-pmt-trail'], undefined);
    if (style === 'trace') assert.ok(calls.some((c) => c[0] === 'stroke'), 'trace strokes a line');
    else assert.ok(calls.some((c) => c[0] === 'fill'), style + ' fills a smear');
  }
  assert.equal(R.STYLES.soft.ms, 120); assert.equal(R.STYLES.phosphor.ms, 200); assert.equal(R.STYLES.trace.ms, 140);
});
test('trail corners: the leading corners finish first', () => {
  const d = R.cornerDurations(cell(0, 0), cell(50, 0), 200);   // moving right: TR and BR lead
  assert.ok(d[1] < d[0] && d[2] < d[3]);
  assert.ok(Math.abs(Math.min(...d) - 200 * R.LEAD) < 1e-9 && Math.max(...d) === 200);
  assert.deepEqual(R.parseColor('#7eff8c'), [126, 255, 140]); assert.deepEqual(R.parseColor('rgb(1, 2, 3)'), [1, 2, 3]);
});

/* ---- bans (D22) ---- */
test('sources carry no emoji, pills, side stripes, :has( or viewport-width media', () => {
  const files = ['js/50-fx-gl.js', 'js/51-fx-trail.js', 'css/50-fx.css', 'harness/fx-lab.html'];
  const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
  for (const f of files) {
    const s = read(f);
    assert.ok(!emoji.test(s), f + ': emoji');
    assert.ok(!/pill/i.test(s), f + ': pill');
    assert.ok(!/:has\(/.test(s), f + ': :has(');
    assert.ok(!/border-(left|inline-start)\s*:\s*([2-9]|\d\d)/.test(s), f + ': side stripe');
    if (f.endsWith('.css')) assert.ok(!/@media[^{]*width/.test(s), f + ': viewport-width media query');
  }
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
