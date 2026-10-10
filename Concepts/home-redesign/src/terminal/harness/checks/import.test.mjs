// Tests for js/44-import.js (T.SchemeImport). Run: node harness/checks/import.test.mjs
// Loads the file on its own with new Function('window', 'T', src) and a plain T, so it needs no other module.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
import assert from 'node:assert/strict';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '..', '..', 'js', '44-import.js'), 'utf8');
const T = {};
new Function('window', 'T', '"use strict";' + src)({}, T);
const SI = T.SchemeImport;
const FIX = path.join(here, '..', 'fixtures', 'import');
const expected = JSON.parse(fs.readFileSync(path.join(FIX, 'expected.json'), 'utf8'));

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; } catch (e) { console.error('FAIL ' + name); throw e; }
}
const HEX = /^#[0-9a-f]{6}$/;
const FIXED_ERRORS = new Set();

/* API shape */
test('api shape', () => {
  assert.equal(typeof SI.detect, 'function');
  assert.equal(typeof SI.parse, 'function');
  const ids = SI.formats.map(f => f.id);
  assert.deepEqual(ids, ['iterm2', 'windows-terminal', 'kitty', 'ghostty', 'alacritty', 'base16', 'base24', 'xresources']);
  for (const f of SI.formats) { assert.equal(typeof f.label, 'string'); assert.ok(Array.isArray(f.extensions)); }
  assert.equal(SI.maxBytes, 262144);
});

/* every fixture is listed, and every listed fixture exists */
test('fixture list', () => {
  const files = fs.readdirSync(FIX).filter(f => f !== 'expected.json' && f !== 'README.md').sort();
  assert.deepEqual(files, Object.keys(expected).sort());
});

/* every fixture against its hand-written expectation */
for (const [file, exp] of Object.entries(expected)) {
  test(file, () => {
    const text = fs.readFileSync(path.join(FIX, file), 'utf8');
    const r = SI.parse(text, file);
    if (!exp.ok) {
      assert.equal(r.ok, false, file + ' should fail');
      assert.equal(r.code, exp.code, file + ' error code');
      assert.equal(typeof r.error, 'string');
      FIXED_ERRORS.add(r.error);
      assert.equal(r.scheme, undefined);
      return;
    }
    assert.equal(r.ok, true, file + ': ' + r.error);
    assert.equal(r.format, exp.format);
    assert.equal(SI.detect(text, file), exp.format, file + ' detect');
    assert.equal(r.scheme.name, exp.name);
    assert.equal(r.scheme.appearance, exp.appearance);
    assert.deepEqual(r.scheme.colors, exp.colors);
    assert.equal(r.scheme.colors.ansi.length, 16);
    for (const c of r.scheme.colors.ansi) assert.match(c, HEX);
    for (const k of ['background', 'foreground', 'cursor', 'cursorText', 'selectionBackground', 'selectionForeground']) {
      const v = r.scheme.colors[k];
      assert.ok(v === null || HEX.test(v), file + ' ' + k);
    }
    const w = r.warnings.join('\n');
    if (!exp.warnings.length) assert.deepEqual(r.warnings, [], file + ' warnings');
    for (const s of exp.warnings) assert.ok(w.includes(s), file + ' warning should mention ' + JSON.stringify(s) + ': ' + w);
  });
}

/* detection by content wins over a misleading or missing file name */
test('detect without names', () => {
  const read = f => fs.readFileSync(path.join(FIX, f), 'utf8');
  assert.equal(SI.detect(read('solarized-dark.conf'), 'theme.txt'), 'kitty');
  assert.equal(SI.detect(read('ghostty-solarized-dark'), 'x.conf'), 'ghostty');
  assert.equal(SI.detect(read('solarized-dark.itermcolors')), 'iterm2');
  assert.equal(SI.detect(read('alacritty-solarized-light.yml'), 'a.yaml'), 'alacritty');
  assert.equal(SI.detect(read('base16-solarized-dark.yaml'), 'scheme.yml'), 'base16');
  assert.equal(SI.detect(read('base24-solarized-dark.yaml'), 'scheme.yml'), 'base24');
  assert.equal(SI.detect(read('solarized-dark.Xresources'), ''), 'xresources');
  assert.equal(SI.detect('random words', 'notes.md'), null);
  assert.equal(SI.detect('', 'a.json'), null);
});

/* format override */
test('format override', () => {
  const r = SI.parse('background #000000\nforeground #ffffff\n', 'x', 'kitty');
  assert.equal(r.ok, true); assert.equal(r.format, 'kitty');
});

/* safety: size cap, non-text, never echo input */
test('size cap', () => {
  const big = 'background #000000\nforeground #ffffff\n' + '#'.repeat(262144);
  const r = SI.parse(big, 'big.conf');
  assert.equal(r.ok, false); assert.equal(r.code, 'size');
  FIXED_ERRORS.add(r.error);
  /* multi-byte text: fewer than 256 K characters but more than 256 KB of UTF-8 */
  const r2 = SI.parse('# ' + '\u00e9'.repeat(140000) + '\nbackground #000000\nforeground #ffffff\n', 'w.conf');
  assert.equal(r2.code, 'size');
  /* exactly at the cap is accepted */
  const head = 'background #000000\nforeground #ffffff\n#';
  const r3 = SI.parse(head + 'x'.repeat(262144 - head.length), 'cap.conf');
  assert.equal(r3.ok, true);
  assert.equal(SI.parse(new Uint8Array(262145), 'b.conf').code, 'size');
});
test('non-text input', () => {
  for (const v of [null, undefined, 42, {}, ['a']]) {
    const r = SI.parse(v, 'x.conf');
    assert.equal(r.ok, false); assert.equal(r.code, 'input');
    FIXED_ERRORS.add(r.error);
  }
  const r = SI.parse('   \n\t\n', 'x.conf');
  assert.equal(r.code, 'empty'); FIXED_ERRORS.add(r.error);
  const bytes = new TextEncoder().encode('background #102030\nforeground #fafafa\n');
  const rb = SI.parse(bytes, 'b.conf');
  assert.equal(rb.ok, true); assert.equal(rb.scheme.colors.background, '#102030');
  assert.equal(SI.parse(new Uint8Array([0xff, 0xfe, 0xfd]), 'b.conf').code, 'input');
});
test('errors never echo input', () => {
  const marker = 'PMT_MARKER_7f3a';
  const evil = [
    ['{ "name": "' + marker + '", "background": "' + marker + '" ', 'a.json'],
    ['{ "name": "' + marker + '", "background": "' + marker + '", "foreground": "#fff" }', 'a.json'],
    ['<plist><dict><key>' + marker + '</key><real>' + marker + '</real></dict></plist>', 'a.itermcolors'],
    ['[colors.primary]\nbackground = "' + marker + '\n', 'a.toml'],
    ['base00: "' + marker + '"\n\tbase05: x\n', 'a.yaml'],
    [marker + ' ' + marker, marker + '.txt'],
    ['*background: ' + marker + '\n*foreground: ' + marker + '\n', 'a.Xresources'],
    ['palette = ' + marker + '\nbackground = #000\n', 'g']
  ];
  for (const [text, name] of evil) {
    const r = SI.parse(text, name);
    const blob = JSON.stringify(r);
    if (!r.ok) { FIXED_ERRORS.add(r.error); assert.ok(!r.error.includes(marker)); }
    /* a failed colour may be named by its key, never by its value */
    assert.ok(!(r.warnings || []).join('').includes(marker), 'warning echoed input: ' + blob);
    if (r.ok) assert.ok(!JSON.stringify(r.scheme.colors).includes(marker));
  }
});
test('error messages are a small fixed set', () => {
  /* every message seen is one of the module's fixed strings: none has a quote, angle bracket or digit run from input */
  assert.ok(FIXED_ERRORS.size >= 6);
  for (const m of FIXED_ERRORS) assert.match(m, /^[A-Z][A-Za-z0-9 .,:'()-]+\.$/);
});

/* no eval, no prototype pollution */
test('no prototype pollution', () => {
  SI.parse('{ "__proto__": { "polluted": 1 }, "background": "#000", "foreground": "#fff" }', 'p.json');
  SI.parse('[__proto__]\npolluted = 1\n[colors.__proto__]\nx = 1\n[colors.primary]\nbackground = "#000"\nforeground="#fff"\n', 'p.toml');
  SI.parse('__proto__:\n  polluted: 1\nbase00: "000000"\nbase05: "ffffff"\n', 'p.yaml');
  SI.parse('<plist><dict><key>__proto__</key><dict><key>polluted</key><true/></dict></dict></plist>', 'p.itermcolors');
  assert.equal(({}).polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.ok(!/\beval\s*\(|new Function|setTimeout\s*\(\s*['"]/.test(src));
});
test('deep nesting is rejected, not a crash', () => {
  const deep = '<plist>' + '<array>'.repeat(5000) + '</array>'.repeat(5000) + '</plist>';
  assert.equal(SI.parse(deep, 'd.itermcolors').code, 'syntax');
  const toml = 'x = ' + '{ a = '.repeat(2000) + '1' + ' }'.repeat(2000) + '\n';
  assert.equal(SI.parse('[colors.primary]\n' + toml, 'd.toml').code, 'syntax');
  const json = '{"schemes":' + '['.repeat(20000) + ']'.repeat(20000) + '}';
  const r = SI.parse(json, 'd.json');
  assert.equal(r.ok, false);
});

/* format details */
test('iTerm2 colour spaces and alpha', () => {
  const comp = (r, g, b, extra = '') => '<dict><key>Red Component</key><real>' + r + '</real><key>Green Component</key><real>' +
    g + '</real><key>Blue Component</key><real>' + b + '</real>' + extra + '</dict>';
  const doc = (extra) => '<?xml version="1.0"?><plist version="1.0"><dict>' +
    '<key>Background Color</key>' + comp(0, 0, 0, extra) + '<key>Foreground Color</key>' + comp(1, 1, 1.5) +
    '<key>Ansi 1 Color</key>' + comp('0.5', '1e-1', '.25') + '<key>Ansi 16 Color</key>' + comp(1, 0, 0) + '</dict></plist>';
  let r = SI.parse(doc('<key>Color Space</key><string>Calibrated</string><key>Alpha Component</key><real>0.5</real>'), 'x.itermcolors');
  assert.equal(r.ok, true);
  assert.equal(r.scheme.colors.foreground, '#ffffff'); /* clamped */
  assert.equal(r.scheme.colors.ansi[1], '#801a40');
  assert.ok(r.warnings.some(w => w.includes('Calibrated')));
  assert.ok(r.warnings.some(w => w.includes('transparency')));
  r = SI.parse(doc('<key>Color Space</key><string>P3</string>'), 'x.itermcolors');
  assert.ok(r.warnings.some(w => w.includes('Display P3')));
  /* entity in a key, comment between entries */
  r = SI.parse('<plist><dict><!-- c --><key>Background&#32;Color</key>' + comp(0, 0, 0) +
    '<key>Foreground Color</key>' + comp(1, 1, 1) + '</dict></plist>', 'e.itermcolors');
  assert.equal(r.ok, true); assert.equal(r.scheme.colors.background, '#000000');
});
test('Windows Terminal JSONC', () => {
  const r = SI.parse('/* c */ { "name": "A // b", "background": "#000000", // x\n "foreground": "#ffffff", }', 'a.json');
  assert.equal(r.ok, true); assert.equal(r.scheme.name, 'A // b');
  assert.equal(SI.parse('{ "schemes": [] }', 's.json').code, 'noschemes');
  assert.equal(SI.parse('{ "profiles": {} }', 's.json').code, 'noschemes');
  /* many schemes: names listed up to the cap */
  const schemes = Array.from({ length: 30 }, (_, i) => ({ name: 'S' + i, background: '#000', foreground: '#fff' }));
  const rr = SI.parse(JSON.stringify({ schemes }), 's.json');
  assert.equal(rr.scheme.name, 'S0');
  assert.ok(rr.warnings[0].includes('S20') && !rr.warnings[0].includes('S21') && rr.warnings[0].includes('and 9 more'));
  /* long or control-character names are cleaned */
  const rn = SI.parse(JSON.stringify({ name: 'x'.repeat(500) + '\u0007', background: '#000', foreground: '#fff' }), 'n.json');
  assert.equal(rn.scheme.name.length, 64);
});
test('kitty keywords and Alacritty cell colours', () => {
  const k = SI.parse('background #000\nforeground #fff\ncursor none\ncursor_text_color background\nselection_foreground none\n', 'k.conf');
  assert.equal(k.ok, true); assert.equal(k.scheme.colors.cursor, null); assert.equal(k.scheme.colors.cursorText, null);
  assert.deepEqual(k.warnings.filter(w => w.includes('invalid')), []);
  const a = SI.parse('[colors.primary]\nbackground = "#000000"\nforeground = "#ffffff"\n[colors.cursor]\ntext = "CellBackground"\ncursor = "CellForeground"\n', 'a.toml');
  assert.equal(a.ok, true); assert.equal(a.scheme.colors.cursor, null);
  const d = SI.parse('colors.primary.background = "0x000000"\ncolors.primary.foreground = "0xffffff"\n', 'd.toml');
  assert.equal(d.ok, true); assert.equal(d.scheme.colors.foreground, '#ffffff');
});
test('invalid values are dropped with a warning naming the key', () => {
  const r = SI.parse('background #000000\nforeground #ffffff\ncolor1 #12345\ncolor2 red\n', 'k.conf');
  assert.equal(r.ok, true);
  assert.ok(r.warnings[0].includes('ANSI 1') && r.warnings[0].includes('ANSI 2'));
  assert.equal(r.scheme.colors.ansi[1], '#cd0000');
});
test('appearance from luminance', () => {
  const mk = bg => SI.parse('background ' + bg + '\nforeground #808080\n', 'k.conf').scheme.appearance;
  assert.equal(mk('#000000'), 'dark');
  assert.equal(mk('#ffffff'), 'light');
  assert.equal(mk('#757575'), 'dark');  /* luminance 0.178 */
  assert.equal(mk('#777777'), 'light'); /* luminance 0.184 */
});
test('base24 falls back to base16 slots', () => {
  const y = 'system: base24\nname: Partial\npalette:\n  base00: "000000"\n  base05: "ffffff"\n  base08: "ff0000"\n  base12: "ff8080"\n';
  const r = SI.parse(y, 'p.yaml');
  assert.equal(r.format, 'base24');
  assert.equal(r.scheme.colors.ansi[9], '#ff8080');
  assert.equal(r.scheme.colors.ansi[1], '#ff0000');
});

console.log('import.test.mjs: ' + passed + ' passed');
