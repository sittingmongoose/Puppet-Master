// Kitty diacritics table tests: node harness/checks/kitty-diacritics.test.mjs (from src/terminal). Exits 1 on failure.
// Checks js/31-kitty-diacritics.js against facts from kitty's gen/rowcolumn-diacritics.txt (fetched 2026-10-09,
// SHA-256 a80368b3272c41d8b50f3f640cf4305b6423e5a1aae6b72a405129bc29425f2c).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', '..', 'js', '31-kitty-diacritics.js'), 'utf8');
const T = {};
new Function('window', 'T', src)({}, T);

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok   ' + name); }
  catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + (e && e.message)); }
}

const D = T.KITTY_DIACRITICS, I = T.KITTY_DIACRITIC_INDEX;

test('297 entries, no duplicates', () => {
  assert.equal(D.length, 297);
  assert.equal(new Set(D).size, 297);
  assert.equal(I.size, 297);
});
test('known positions from the kitty spec and table', () => {
  assert.equal(D[0], 0x0305);   // row/column 0
  assert.equal(D[1], 0x030D);   // 1
  assert.equal(D[2], 0x030E);   // 2
  assert.equal(D[3], 0x0310);
  assert.equal(D[4], 0x0312);
  assert.equal(D[5], 0x033D);
  assert.equal(D[296], 0x1D244);
});
test('index is the inverse of the array', () => {
  D.forEach((c, i) => assert.equal(I.get(c), i));
  assert.equal(I.get(0x0300), undefined); // grave is excluded (normalisation fuses it)
  assert.equal(I.get(0x0301), undefined);
});
test('every entry is a combining mark (Mn), so it never takes a cell', () => {
  for (const c of D) assert.match(String.fromCodePoint(c), /^\p{Mn}$/u, c.toString(16));
});
test('source has no emoji and is one IIFE', () => {
  assert.ok(!/\p{Extended_Pictographic}/u.test(src));
  assert.ok(/^\(function \(\) \{/.test(src.trimStart().replace(/^\/\/.*\n/gm, '')));
  assert.ok(src.trimEnd().endsWith('})();'));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
