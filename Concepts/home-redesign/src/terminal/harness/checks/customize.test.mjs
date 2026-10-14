// The Customize screen's model (42-appearance.js, 2026-10-13): the Settings rows (SSYS-051) read and written through
// window.PM_TERMINAL_SETTINGS, the layer order tab > Settings > earlier stores > look, an effect set in Settings
// switching Terminal Effects to Custom, the earlier Settings words (Match App Theme, Light, Dark, Solarized, High
// Contrast, Fira Code, Custom...), each face's weight range, Opacity only under Glass, Text drawing, and "All terminals"
// written to Settings (falling back to this machine without it).
// Run: node harness/checks/customize.test.mjs
import assert from 'node:assert/strict';
import { loadT } from './load.mjs';

const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const attrs = { 'data-theme': 'basic-dark' };
const fakeCtx = { font: '', measureText: () => ({ width: 100 }) };
const document = {
  documentElement: { getAttribute: n => (n in attrs ? attrs[n] : null) },
  createElement: () => ({ getContext: () => fakeCtx, width: 0, height: 0 }),
  styleSheets: [], fonts: null
};
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
/* a Settings stand-in: rows a person changed, a version that moves on each save, one transaction per set() */
const rows = {}, listeners = [];
let ver = 0, sets = 0, ready = true;
const window = {
  PM_TERMINAL_SETTINGS: {
    ready: () => ready, values: () => Object.assign({}, rows), version: () => ver,
    set: w => { sets++; for (const k of Object.keys(w)) { if (w[k] === null) delete rows[k]; else rows[k] = w[k]; } ver++; listeners.forEach(f => f()); return true; },
    onChange: f => { listeners.push(f); return () => {}; }
  }
};
const warn = console.warn; console.warn = () => {};
const T = loadT(['00-core.js', '41-schemes-data.js', '42-appearance.js', '44-import.js'], { window, document });
console.warn = warn;
const A = T.Appearance;
const put = (id, v) => { rows['code.terminal.' + id] = v; ver++; };
const clear = () => { for (const k of Object.keys(rows)) delete rows[k]; ver++; };
const view = (tab, look) => ({ tabAppearance: tab || {}, previewAppearance: null, state: {}, api: { look: () => look || {} }, applyAppearance() {} });

let passed = 0;
function test(name, fn) { try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; } }

test('every field has one Settings row, and its words go both ways (round 2 fields with no canon row are listed)', () => {
  const ids = new Set();
  for (const k of Object.keys(A.FIELDS)) {
    if (k === 'scheme' || k === 'font') continue;
    if (A.LOCAL_FIELDS.includes(k)) { assert.ok(!A.LINK[k], k + ' is listed as local but has a row'); continue; }
    assert.ok(A.LINK[k], 'no row for ' + k);
    assert.ok(!ids.has(A.LINK[k].id), 'row used twice: ' + A.LINK[k].id); ids.add(A.LINK[k].id);
  }
  const samples = { schemePair: false, minContrast: 7, fontSize: 24, fontWeight: 600, lineHeight: 1.5, letterSpacing: 1.25, ligatures: false, boldBright: true,
    fontRendering: 'crisp', cursorShape: 'bar', cursorBlink: false, cursorTrail: 'trace', background: 'gradient', bgColor: '#123456', bgGradient: 'deep',
    bgImage: 'grid', bgDim: 0.6, bgBlur: 12, opacity: 0.5, padding: 14, effects: 'custom', scanlines: true, scanStrength: 0.5, glow: false, glowStrength: 0.8,
    crt: true, curvature: 0.12, burnIn: false, noise: 0.06, flicker: true, flickerAmount: 0.025, inactiveDim: false, smoothScroll: true, bell: 'off',
    stickyHeader: false, copyOnSelect: true, sixtyfourScan: 45, sixtyfourBleed: 40 };
  for (const k of Object.keys(samples)) {
    const L = A.LINK[k], out = L.out(samples[k]);
    assert.notEqual(out, undefined, k + ' has no words for ' + samples[k]);
    assert.equal(L.in(out), samples[k], k + ' round trip through ' + JSON.stringify(out));
  }
  assert.equal(A.LINK.scheme.in(A.LINK.scheme.out('dracula')), 'dracula');
  assert.equal(A.LINK.font.in(A.LINK.font.out('vt323')), 'vt323');
});

test('Settings words: Follow look, numbers as text, the earlier choices', () => {
  assert.equal(A.LINK.scanlines.in('Follow look'), null);
  assert.equal(A.LINK.fontSize.in('24'), 24);
  assert.equal(A.LINK.fontSize.in('Font default'), undefined);
  assert.equal(A.LINK.fontSize.in(99), 32);
  assert.equal(A.LINK.fontSize.in(14.25), 14.25);          /* Departure's 13.75 + 0.5 stays on its quarter */
  assert.equal(A.LINK.lineHeight.in(1.45), 1.45);          /* no binary remainder from the step */
  assert.equal(A.LINK.flickerAmount.in('0.025'), 0.025);
  assert.equal(A.LINK.minContrast.in('4.5:1'), 4.5);
  assert.equal(A.LINK.scheme.in('Match App Theme'), 'follow');
  assert.equal(A.LINK.scheme.in('Light'), 'follow:light');
  assert.equal(A.LINK.scheme.in('Solarized'), 'solarized-dark');
  assert.equal(A.LINK.scheme.in('High Contrast'), 'pm-high-contrast-dark');
  assert.equal(A.LINK.scheme.in('Custom', 'dracula.json'), 'dracula');
  assert.equal(A.LINK.scheme.in('Catppuccin Mocha'), 'catppuccin-mocha');
  assert.equal(A.LINK.font.in('JetBrains Mono'), 'jetbrains-mono');
  assert.equal(A.LINK.font.in('System Monospace'), 'system');
  assert.equal(A.LINK.font.in('Fira Code'), 'local:Fira Code');
  assert.equal(A.LINK.font.in('Custom…', 'Cascadia Code'), 'local:Cascadia Code');
  assert.equal(A.LINK.bgColor.in('red'), undefined);
  assert.equal(A.LINK.bgImageData.in('/Users/me/pic.png'), 'path:/Users/me/pic.png');
});

test('the layers: tab over Settings over the earlier stores over the look', () => {
  clear(); store.clear();
  const v = view();
  assert.equal(A.get(v, 'fontSize'), null);
  A.set('app', 'fontSize', 15, null);                  /* All terminals: Settings */
  assert.equal(rows['code.terminal.font-size'], 15);
  assert.equal(A.get(v, 'fontSize'), 15);
  assert.equal(A.layerOf(v, 'fontSize'), 'settings');
  v.tabAppearance.fontSize = 18;
  assert.equal(A.get(v, 'fontSize'), 18);
  assert.equal(A.layerOf(v, 'fontSize'), 'tab');
  put('font-size', '24');                               /* Settings > Editor & Terminal, as text */
  assert.equal(A.get(view(), 'fontSize'), 24);
  assert.equal(A.resolve(view()).font.size, 24);
});

test('All terminals without Settings goes to this machine; with Settings it clears that copy', () => {
  clear(); store.clear();
  ready = false;
  A.set('app', 'padding', 20, null);
  assert.equal(rows['code.terminal.padding'], undefined);
  assert.equal(JSON.parse(store.get('pm.home.terminal:v1:app')).padding, 20);
  assert.equal(A.get(view(), 'padding'), 20);
  ready = true;
  A.set('app', 'padding', 6, null);
  assert.equal(rows['code.terminal.padding'], 6);
  assert.equal(JSON.parse(store.get('pm.home.terminal:v1:app')).padding, undefined);
  A.reset('app', null);
  assert.equal(rows['code.terminal.padding'], undefined);
  assert.equal(A.get(view(), 'padding'), 0); // round 2: the default padding is 0 (Jared, 2026-10-14)
});

test('an effect switched in Settings while Terminal Effects follows the look means Custom', () => {
  clear();
  put('scanlines', 'On');
  assert.equal(A.get(view(), 'effects'), 'custom');
  assert.equal(A.resolve(view()).effects.scanlines.on, true);
  put('effects', 'Follow look');
  assert.equal(A.resolve(view()).effects.scanlines.on, false);   /* Basic's own: none */
  put('effects', 'Off');
  assert.equal(A.resolve(view()).effects.off, true);
});

test('setMany writes one Settings transaction', () => {
  clear(); sets = 0;
  A.setMany('app', { effects: 'custom', glow: true, glowStrength: 0.8 }, null);
  assert.equal(sets, 1);
  assert.deepEqual([rows['code.terminal.effects'], rows['code.terminal.glow'], rows['code.terminal.glow-strength']], ['Custom', 'On', 0.8]);
});

test('weights follow the face; bold stays heavier', () => {
  clear();
  let R = A.resolve(view({ font: 'jetbrains-mono', fontWeight: 200 }));
  assert.equal(R.font.weight, 400);
  R = A.resolve(view({ font: 'atkinson', fontWeight: 200 }));
  assert.equal(R.font.weight, 200);
  assert.equal(R.font.boldWeight, 700);
  R = A.resolve(view({ font: 'jetbrains-mono', fontWeight: 700 }));
  assert.equal(R.font.boldWeight, 800);
  R = A.resolve(view({ font: 'vt323', fontWeight: 700 }));
  assert.equal(R.font.weight, 400);
});

test('Opacity is Glass’s; Text drawing reaches the renderer', () => {
  clear();
  assert.equal(A.resolve(view({ opacity: 0.5 })).theme.bgAlpha, 1);
  attrs['data-theme'] = 'glass-dark';
  assert.equal(A.resolve(view({ opacity: 0.5 })).theme.bgAlpha, 0.5);
  assert.equal(A.resolve(view()).theme.bgAlpha, 0.74);
  attrs['data-theme'] = 'basic-dark';
  assert.equal(A.resolve(view({ fontRendering: 'smooth' })).opts.textRendering, 'geometricPrecision');
  const c = A.resolve(view({ fontRendering: 'crisp' }));
  assert.equal(c.font.crisp, true);
});

test('Light and Dark from Settings pin the look’s own scheme of that appearance', () => {
  clear();
  put('theme', 'Light');
  assert.equal(A.resolve(view()).scheme.id, 'one-half-light');
  put('theme', 'Dark');
  assert.equal(A.resolve(view()).scheme.id, 'one-half-dark');
});

test('a hovered scheme previews as it is; a stored pick still switches with light and dark', () => {
  clear();
  const v = view({ scheme: 'catppuccin-latte' });            /* the app is dark (basic-dark) */
  assert.equal(A.resolve(v).scheme.id, 'catppuccin-mocha');
  v.previewAppearance = { scheme: 'catppuccin-latte' };
  assert.equal(A.resolve(v).scheme.id, 'catppuccin-latte');
  v.previewAppearance = null; v.tabAppearance.schemePair = false;
  assert.equal(A.resolve(v).scheme.id, 'catppuccin-latte');
});

console.log(`customize.test: ${passed} passed`);
