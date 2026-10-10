// The colour-scheme catalog the code editor shares (D27): editorTokens for a curated, an imported and an unknown id,
// palette, schemes(), retroPhosphor before and after Retro dark becomes Amber, and the event firing once.
// Run: node harness/checks/catalog.test.mjs
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
import assert from 'node:assert/strict';
import { loadT } from './load.mjs';

const here = path.dirname(url.fileURLToPath(import.meta.url));
/* 42-appearance.js keeps its app layer and user schemes in localStorage */
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const window = {};
/* 90-kind.js builds window.PMT; with no host it only warns that the kind is not registered */
const warn = console.warn; console.warn = () => {};
const T = loadT(['00-core.js', '41-schemes-data.js', '42-appearance.js', '44-import.js', '90-kind.js'], { window });
console.warn = warn;
const PMT = window.PMT;
const A = PMT.Appearance;

let passed = 0;
function test(name, fn) { try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; } }
const HEX = /^#[0-9a-f]{6}$/;
const TOKENS = ['kw', 'str', 'num', 'com', 'fn', 'ty', 'var', 'prop', 'op', 'pun', 'tag', 'attr', 'esc', 'mac', 'link', 'head', 'code'];
const syntax = JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'schemes', 'editor-syntax.json'), 'utf8'));

test('api shape', () => {
  for (const k of ['schemes', 'editorTokens', 'palette', 'retroPhosphor', 'on']) assert.equal(typeof A[k], 'function', k);
  assert.equal(typeof PMT.AppearancePopover.open, 'function');
});

test('every curated scheme carries all 17 editor tokens from editor-syntax.json', () => {
  assert.equal(T.SCHEMES.length, 34);
  for (const s of T.SCHEMES) {
    assert.deepEqual(Object.keys(s.editor), TOKENS, s.id);
    for (const t of TOKENS) assert.equal(s.editor[t], syntax.schemes[s.id][t], s.id + ' ' + t);
  }
});

test('editorTokens: curated', () => {
  const e = A.editorTokens('catppuccin-mocha');
  assert.deepEqual(Object.keys(e), TOKENS);
  for (const t of TOKENS) { assert.match(e[t], HEX); assert.equal(e[t], syntax.schemes['catppuccin-mocha'][t]); }
  /* a copy: the caller cannot change the catalog */
  e.kw = '#000000';
  assert.equal(A.editorTokens('catppuccin-mocha').kw, syntax.schemes['catppuccin-mocha'].kw);
});

let importedId;
test('editorTokens: imported (derived from the ANSI 16)', () => {
  const text = fs.readFileSync(path.join(here, '..', 'fixtures', 'import', 'base16-solarized-dark.yaml'), 'utf8');
  const r = T.SchemeImport.parse(text, 'base16-solarized-dark.yaml');
  assert.equal(r.ok, true, r.error);
  const entry = T.Appearance.addUserScheme(r.scheme);
  importedId = entry.id;
  const c = r.scheme.colors, a = c.ansi;
  const want = { kw: a[5], str: a[2], num: a[3], com: a[8], fn: a[4], ty: a[6], var: c.foreground, prop: a[4], op: c.foreground,
    pun: c.foreground, tag: a[1], attr: a[3], esc: a[6], mac: a[5], link: a[4], head: a[4], code: a[2] };
  const e = A.editorTokens(importedId);
  assert.deepEqual(Object.keys(e), TOKENS);
  assert.deepEqual(e, want);
  /* a user scheme saved before D27 has no editor block: it is derived on read */
  const old = { id: 'user-old', name: 'Old', family: 'Imported', appearance: 'dark', licence: 'user', colors: c };
  store.set('pm.home.terminal:v1:schemes', JSON.stringify([old]));
  const T2 = loadT(['00-core.js', '41-schemes-data.js', '42-appearance.js'], { window: {} });
  assert.deepEqual(T2.Appearance.editorTokens('user-old'), want);
  store.delete('pm.home.terminal:v1:schemes');
});

test('unknown ids give null', () => {
  assert.equal(A.editorTokens('no-such-scheme'), null);
  assert.equal(A.palette('no-such-scheme'), null);
  assert.equal(A.editorTokens(undefined), null);
});

test('palette shape', () => {
  for (const id of ['pm-phosphor-amber', 'dracula', importedId]) {
    const p = A.palette(id);
    assert.deepEqual(Object.keys(p), ['background', 'foreground', 'cursor', 'selection', 'ansi'], id);
    for (const k of ['background', 'foreground', 'cursor', 'selection']) assert.match(p[k], HEX, id + ' ' + k);
    assert.equal(p.ansi.length, 16);
    for (const x of p.ansi) assert.match(x, HEX);
  }
  const s = T.Appearance.scheme('dracula');
  assert.equal(A.palette('dracula').selection, s.colors.selectionBackground);
  /* a scheme without a selection colour falls back the way the renderer does (a quarter of the way to the foreground) */
  const no = T.SCHEMES.find(x => !x.colors.selectionBackground);
  if (no) assert.equal(A.palette(no.id).selection, T.color.toHex(T.Appearance.toTheme(no).selBg));
});

test('schemes(): every scheme, with mode and pair', () => {
  const list = A.schemes();
  assert.equal(list.length, 35);
  for (const s of list) {
    assert.deepEqual(Object.keys(s), ['id', 'name', 'mode', 'pair']);
    assert.ok(s.mode === 'light' || s.mode === 'dark');
  }
  assert.equal(list.find(s => s.id === 'catppuccin-mocha').pair, 'catppuccin-latte');
  assert.equal(list.find(s => s.id === 'pm-phosphor-amber').pair, 'pm-paper-teletype');
  assert.equal(list.find(s => s.id === importedId).pair, null);
});

test('retroPhosphor and its event', () => {
  assert.equal(A.retroPhosphor(), 'green');
  const seen = [];
  const off = A.on('retro-phosphor', v => seen.push(v));
  assert.equal(typeof off, 'function');
  /* another app-scope change that leaves Retro dark green does not fire */
  T.Appearance.set('app', 'fontSize', 14);
  assert.deepEqual(seen, []);
  /* Retro dark becomes Amber at the All terminals scope */
  T.Appearance.set('app', 'scheme', 'pm-phosphor-amber');
  assert.equal(A.retroPhosphor(), 'amber');
  assert.deepEqual(seen, ['amber']);
  /* another write that keeps Amber does not fire again */
  T.Appearance.set('app', 'fontSize', 15);
  T.Appearance.refreshAll();
  assert.deepEqual(seen, ['amber']);
  /* a tab's own scheme is not the Retro look's choice */
  const view = { state: {}, applyAppearance() {} };
  T.Appearance.set('tab', 'scheme', 'pm-phosphor-green', view);
  assert.equal(A.retroPhosphor(), 'amber');
  /* back to Follow theme: green, fired once more; then unsubscribed */
  T.Appearance.set('app', 'scheme', 'follow');
  assert.equal(A.retroPhosphor(), 'green');
  assert.deepEqual(seen, ['amber', 'green']);
  off();
  T.Appearance.set('app', 'scheme', 'pm-phosphor-amber');
  assert.deepEqual(seen, ['amber', 'green']);
  T.Appearance.set('app', 'scheme', null);
  /* the light sibling chosen with Switch with light and dark on still pairs to green */
  T.Appearance.set('app', 'scheme', 'pm-paper-teletype');
  assert.equal(A.retroPhosphor(), 'green');
  T.Appearance.set('app', 'scheme', null);
  T.Appearance.set('app', 'fontSize', null);
  assert.equal(typeof A.on('nothing', () => {}), 'function');
});

console.log('catalog tests ok (' + passed + ')');
