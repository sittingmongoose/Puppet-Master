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
    crt: true, curvature: 0.12, burnIn: false, noise: 0.06, flicker: true, inactiveDim: false, smoothScroll: true, bell: 'off',
    stickyHeader: false, copyOnSelect: true, sixtyfourScan: 45, sixtyfourBleed: 40,
    bgStrength: 0.65, bgScale: 'coarse', bgMotion: 'lively', bgFit: 'center', bgDesat: 1, bezel: 'case', bezelWidth: 30, bezelColor: 'gunmetal',
    bezelReflect: 'high', crtMask: true };
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
  /* round 5's rows: canon's words, a style's own width, Reflection's Auto and round 3's numbers */
  assert.equal(A.LINK.bezel.in('Monitor'), 'case');
  assert.equal(A.LINK.bezelWidth.in('Style default'), null);
  assert.equal(A.LINK.bezelColor.in('Brushed aluminium'), 'aluminium');
  assert.equal(A.LINK.bezelReflect.in('Auto'), null);
  assert.equal(A.LINK.bezelReflect.in(0.45), 'medium');
  assert.equal(A.LINK.bezelReflect.in('0.2'), 'low');
  assert.equal(A.LINK.bezelReflect.out('medium'), 0.5);
  assert.equal(A.LINK.bgFit.in('Centre'), 'center');
  assert.equal(A.LINK.bgMotion.out('off'), 'Off');
  assert.equal(A.LINK.crtMask.in('true'), true);
  /* retired (Jared, 2026-10-16): no Flicker Amount row; Bell's Visual reads as Follow look and is never written */
  assert.equal(A.LINK.flickerAmount, undefined);
  assert.equal(A.FIELDS.flickerAmount, undefined);
  assert.equal(A.LINK.bell.in('Visual'), 'follow');
  assert.equal(A.LINK.bell.out('follow'), 'Follow look');
  assert.deepEqual(A.FIELDS.bell.values, ['follow', 'off']);
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

test('retired choices still read (Jared, 2026-10-16): a stored Flicker amount is Flicker on, Visual is Follow look', () => {
  clear();
  put('flicker-amount', 0.025);
  assert.equal(A.get(view(), 'flicker'), true);
  assert.equal(A.get(view(), 'effects'), 'custom');
  put('flicker', 'Off');
  assert.equal(A.get(view(), 'flicker'), false);            /* Flicker itself stored wins */
  clear();
  put('flicker-amount', 0);
  assert.equal(A.get(view(), 'flicker'), false);
  clear();
  const tab = { flickerAmount: 0.01 };
  assert.equal(A.get(view(tab), 'flicker'), true);
  assert.deepEqual(tab, { flicker: true });                  /* written back once as this terminal's own Flicker */
  assert.equal(A.get(view({ bell: 'visual' }), 'bell'), 'follow');
  put('bell', 'Visual');
  assert.equal(A.get(view(), 'bell'), 'follow');
  assert.equal(A.presets.patch({ flickerAmount: 0.02, bell: 'visual' }).flicker, true);
  assert.equal(A.presets.patch({ flickerAmount: 0.02, bell: 'visual' }).bell, 'follow');
  clear();
});

test('All terminals: an amount the host model keeps is Flicker on, though the host answers Flicker\'s default', () => {
  clear(); store.clear();
  const host = new Map([['terminal.flickerAmount', 0.02]]), defs = { 'terminal.flicker': false, 'terminal.bell': 'follow' };
  window.PM_HOME = { settings: {
    get: k => (host.has(k) ? host.get(k) : defs[k]), defaults: () => Object.assign({}, defs),
    set: (k, v) => { if (v === null || v === undefined) host.delete(k); else host.set(k, v); } } };
  ready = false;
  try {
    assert.equal(A.get(view(), 'flicker'), true);
    assert.equal(A.layerOf(view(), 'flicker'), 'app');
    assert.equal(host.get('terminal.flicker'), true);         /* written back once as Flicker itself */
    assert.equal(host.has('terminal.flickerAmount'), false);
    A.reset('app', null);
    assert.equal(A.get(view(), 'flicker'), false);            /* so a reset leaves it off */
    host.set('terminal.flickerAmount', 0.02); host.set('terminal.flicker', true);
    A.set('app', 'flicker', false, null);
    assert.equal(A.get(view(), 'flicker'), false);            /* Flicker of its own wins */
  } finally { delete window.PM_HOME; ready = true; store.clear(); A.reset('app', null); }
  clear();
});

test('a row this Settings does not carry keeps its field on this computer (round 5)', () => {
  clear();
  window.PM_TERMINAL_SETTINGS.has = id => id !== 'code.terminal.bezel';
  A.setMany('app', { bezel: 'case', bezelColor: 'glass' }, view());
  assert.equal(rows['code.terminal.bezel'], undefined);          /* not sent where it would be dropped */
  assert.equal(rows['code.terminal.bezel-material'], 'Glass');
  assert.equal(A.get(view(), 'bezel'), 'case');                   /* kept here, and still drawn */
  assert.equal(A.get(view(), 'bezelColor'), 'glass');
  delete window.PM_TERMINAL_SETTINGS.has;
  A.setMany('app', { bezel: null, bezelColor: null }, view());
  clear();
});

test('setMany writes one Settings transaction', () => {
  clear(); sets = 0;
  A.setMany('app', { effects: 'custom', glow: true, glowStrength: 0.8 }, null);
  assert.equal(sets, 1);
  assert.deepEqual([rows['code.terminal.effects'], rows['code.terminal.glow'], rows['code.terminal.glow-strength']], ['Custom', 'On', 0.8]);
});

test('weights follow the face; bold stays heavier', () => {
  clear();
  /* JetBrains Mono runs its full 100-800 (Jared, 2026-10-14); the system monospace still starts at 400 */
  let R = A.resolve(view({ font: 'jetbrains-mono', fontWeight: 100 }));
  assert.equal(R.font.weight, 100);
  R = A.resolve(view({ font: 'system', fontWeight: 200 }));
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

/* the retired Flicker Amount row is written back once as the Flicker row and forgotten, so putting Flicker back to its
   default afterwards leaves it off */
await new Promise(r => setTimeout(r, 5));
await (async () => {
  try {
    clear();
    put('flicker-amount', 0.02);
    assert.equal(A.get(view(), 'flicker'), true);
    await new Promise(r => setTimeout(r, 5));
    assert.equal(rows['code.terminal.flicker'], true);
    assert.equal('code.terminal.flicker-amount' in rows, false);
    A.set('app', 'flicker', null, null);
    assert.equal(A.get(view(), 'flicker'), false);
    put('flicker-amount', 0);                                /* no amount: forgotten, Flicker untouched */
    assert.equal(A.get(view(), 'flicker'), false);
    await new Promise(r => setTimeout(r, 5));
    assert.equal('code.terminal.flicker-amount' in rows, false);
    assert.equal('code.terminal.flicker' in rows, false);
    clear(); passed++;
  } catch (e) { console.error('FAIL a Settings amount is written back once as Flicker itself'); throw e; }
})();

console.log(`customize.test: ${passed} passed`);
