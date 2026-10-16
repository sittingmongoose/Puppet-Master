// The lens's wallpaper (44-grounds-glass.js): the watch on the root never reads style, so a wallpaper pick with no lens
// shown costs no style recalc (pm7-motion-settings' trace: about 98 ms a pick before). The print comes from the app's
// cache (PM_WALLPAPERS.sourceUrl(id, mode): a URL, undefined while not cached, null for none; '' taken as not known);
// only a lens that is drawing reads the print's custom property, and only when the cache does not know.
// Run: node harness/checks/wall.test.mjs
import assert from 'node:assert/strict';
import { loadT } from './load.mjs';

const attrs = {};
let styleReads = 0, observe = null;
const vars = { '--lg-wall-ribbons-dark': 'url("ribbons-dark.jpg")', '--lg-wall-ribbons-light': 'url(ribbons-light.jpg)', '--lg-wall-dunes-dark': 'url(dunes-dark.jpg)' };
const images = [], events = [];
globalThis.getComputedStyle = () => { styleReads++; return { getPropertyValue: k => vars[k] || '' }; };
globalThis.MutationObserver = class { constructor(fn) { observe = fn; } observe() {} };
globalThis.Image = class { set src(v) { this._src = v; images.push(this); } get src() { return this._src; } };
globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
const document = {
  documentElement: { getAttribute: n => (n in attrs ? attrs[n] : null), hasAttribute: n => n in attrs, clientWidth: 1600, clientHeight: 900 },
  createElement: () => ({ getContext: () => null })
};
const window = { dispatchEvent: e => events.push(e.type) };
const T = loadT(['00-core.js', '43-grounds.js', '44-grounds-glass.js'], { window, document });
const lens = T.Grounds.kit.PAINT.lens;
const set = o => { for (const k of Object.keys(o)) { if (o[k] === null) delete attrs[k]; else attrs[k] = o[k]; } observe([]); };
const reset = () => { styleReads = 0; images.length = 0; events.length = 0; };

let passed = 0;
function test(name, fn) { try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; } }

test('a wallpaper pick with no lens shown reads no style (a host with no cache)', () => {
  reset();
  set({ 'data-theme': 'glass-dark', 'data-lg-wall': 'ribbons' });
  set({ 'data-lg-wall-hold': '' }); set({ 'data-lg-wall-hold': null });
  set({ 'data-theme': 'glass-light' }); set({ 'data-theme': 'glass-dark' });
  assert.equal(styleReads, 0);
  assert.ok(events.includes('pmt-wall'));                       /* the lenses are told, and read it as they draw */
  assert.equal(images.length, 0);
});

test('a lens that draws reads the print once, loads it, and repaints when it arrives', () => {
  reset();
  assert.equal(lens.needs({ rect: {} }), 'own');               /* not loaded yet */
  assert.equal(styleReads, 1);
  assert.equal(images.length, 1); assert.equal(images[0].src, 'ribbons-dark.jpg');
  lens.needs({ rect: {} }); lens.needs({ rect: {} });
  assert.equal(styleReads, 1);                                  /* once per print */
  images[0].onload();
  assert.ok(events.includes('pmt-wall'));
  assert.match(lens.needs({ rect: { x: 0, y: 0 } }), /^ribbons-dark@/);
});

test('the app\'s cache: a known print loads at once with no style read, before any lens draws', () => {
  reset();
  window.PM_WALLPAPERS = { sourceUrl: (id, mode) => (id === 'dunes' ? 'cache/' + id + '-' + mode + '.jpg' : undefined) };
  set({ 'data-lg-wall': 'dunes' });
  assert.equal(styleReads, 0);
  assert.equal(images.length, 1); assert.equal(images[0].src, 'cache/dunes-dark.jpg');
  images[0].onload();
  assert.match(lens.needs({ rect: {} }), /^dunes-dark@/);
  assert.equal(styleReads, 0);
});

test('null from the cache is no image: nothing read, nothing loaded', () => {
  reset();
  window.PM_WALLPAPERS = { sourceUrl: () => null };
  set({ 'data-lg-wall': 'plain' });
  assert.equal(lens.needs({ rect: {} }), 'own');
  assert.equal(styleReads, 0); assert.equal(images.length, 0);
});

test('undefined or \'\' from the cache falls back to the print\'s custom property, read only by a drawing lens', () => {
  for (const answer of [undefined, '']) {
    reset();
    window.PM_WALLPAPERS = { sourceUrl: () => answer };
    set({ 'data-lg-wall': answer === '' ? 'ribbons' : 'dunes' });
    assert.equal(styleReads, 0);
    lens.needs({ rect: {} });
    assert.equal(styleReads, 1);
    assert.equal(images.length, 1);
  }
});

test('NieR, and a look that shows no wallpaper, show none and read nothing', () => {
  delete window.PM_WALLPAPERS;
  reset();
  set({ 'data-o55-nier': 'on', 'data-lg-wall': 'ribbons' });
  assert.equal(lens.needs({ rect: {} }), 'own');
  set({ 'data-o55-nier': null, 'data-theme': 'basic-dark' });
  assert.equal(lens.needs({ rect: {} }), 'own');
  assert.equal(styleReads, 0); assert.equal(images.length, 0);
  set({ 'data-lg-wall-any': '', 'data-theme': 'basic-light' }); /* a look that lays the wallpaper too (a print not read yet) */
  lens.needs({ rect: {} });
  assert.equal(styleReads, 1);
});

console.log(`wall.test: ${passed} passed`);
