// PM7PERF-GLASS-AGENTS-REFLOW: on opaque Glass Dark the docked Agents timer's plural-to-singular tick ("17 minutes
// 0 seconds" wraps above "Running"; "17 minutes 1 second" fits one line) reflows the next row between the baseline
// plate and the read-through plate. The own-glyph mask is taken at the NEW position only, so the row's OLD position
// in the baseline counted as read-through: 1,111 own-pane pixels, 0.7006% of the judged area against the 0.20% bar
// (sol-max-15 L1, pixel replay SHA-256 58b0dd75202e1a33261fafd43f13d5980c5f50a1d41cff9b3770ec218db2439b, crops
// agents-footer-a2.png be68c50f... / agents-footer-b.png 61c61386...). The verdict must mask the own glyphs at
// their baseline position too (a surface-text-transparent plate taken with the baseline), keeping the 0.20% bar and
// still failing genuine read-through.
// node tools/glass-backing-reflow.selftest.mjs [glass-backing.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { backingVerdict } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/glass-backing.check.mjs');
const W = 100, H = 100;
// plates: dim backdrop (20,20,24); the surface's own row is sharp light text (230,230,230); read-through page text
// behind the glass is dimmer but far above the 12-level threshold when it disappears (90,90,96)
const plate = (draw) => { const data = new Uint8Array(W * H * 4); for (let p = 0; p < W * H; p++) { data[p * 4] = 20; data[p * 4 + 1] = 20; data[p * 4 + 2] = 24; data[p * 4 + 3] = 255; } draw((x, y, rgb) => { const i = (y * W + x) * 4; data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2]; }); return { data, width: W, height: H }; };
const row = (set, y, rgb, n = 71) => { for (let x = 10; x < 10 + n; x++) set(x, y, rgb); };
const OWN = [230, 230, 230], THROUGH = [90, 90, 96];
// the real shape: the own row at y40 in the baseline, reflowed to y30 in the read-through plate; no read-through
const a1 = plate((s) => row(s, 40, OWN));
const a2 = plate((s) => row(s, 40, OWN));
const b = plate((s) => row(s, 30, OWN));
const c = plate(() => {});
const c0 = plate(() => {}); // surface text transparent, page behind still painted: no own glyphs, no through text
assert.equal(typeof backingVerdict, 'function', 'the backing verdict needs the baseline own-glyph plate; the base counted the reflowed row as read-through');
// what the base judged (no baseline plate): the moved row counts at both positions, over the 0.20% bar
const old = backingVerdict({ a1, a2, b, c, width: W, height: H });
assert.ok(old.share > 0.002, `the base shape reads ${old.share} read-through`);
// with the baseline plate the reflowed own row is masked at both positions: 0 read-through, under the bar
const fixed = backingVerdict({ a1, a2, b, c, c0, width: W, height: H });
assert.equal(fixed.n, 0, 'the reflowed own row is not read-through');
assert.equal(fixed.share, 0);
// genuine read-through still fails: page text behind the glass in the baseline, gone when the outside text is
// transparent; the baseline plate keeps it (only the surface text was transparent for c0)
const bt = plate((s) => row(s, 30, OWN));
const at = plate((s) => { row(s, 40, OWN); row(s, 60, THROUGH); });
const ct = plate(() => {});
const c0t = plate((s) => row(s, 60, THROUGH));
const through = backingVerdict({ a1: at, a2: at, b: bt, c: ct, c0: c0t, width: W, height: H });
assert.ok(through.share > 0.002, 'read-through text still fails with the baseline plate');
// a quiet surface with no reflow and no read-through keeps its pass
const quiet = plate((s) => row(s, 40, OWN));
const quietC = plate(() => {});
const q = backingVerdict({ a1: quiet, a2: quiet, b: quiet, c: quietC, c0: quietC, width: W, height: H });
assert.equal(q.share, 0);
console.log('PASS the reflowed own row (71 px at y40 -> y30) is masked at both positions with the baseline own-glyph plate (0 read-through vs the base over-bar shape), genuine read-through still fails, and a quiet surface keeps its pass');
