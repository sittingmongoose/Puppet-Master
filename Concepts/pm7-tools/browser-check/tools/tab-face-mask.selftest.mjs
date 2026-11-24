// Selftest for helpers/tab-face-pixels.mjs: the part mask and the per-frame reading of FO-229's Home/Agents tab face,
// on synthetic pixels so every case is the same on any host.
// Cases: FO236-WIN158-FIVE-PIXEL-REFERENCE (a real press whose narrowed mask keeps one pixel of each of a colon's four
// dots, five positions in all, is judged), FO-236's polarity (pixels that are paper in the frame before the press are
// never glyph positions), the bar itself (a blank dot, one dot missing, and a blank settled reference), and the
// pre-existing size guard.
import assert from 'node:assert/strict';
import { partMask, partContrast, contrast, PAINTED, MIN_GLYPH, STRONG } from '../helpers/tab-face-pixels.mjs';

const W = 12, H = 14;
const image = (w, h) => ({ width: w, height: h, channels: 3, data: Buffer.alloc(w * h * 3) });
const fill = (img, c) => { for (let i = 0; i < img.data.length; i += 3) { img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; } return img; };
const put = (img, x, y, c) => { const i = (y * img.width + x) * 3; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; };

// Retro Dark's chip and the chosen tab's ink (the real pair: the dot's own ink is about 2.8:1 on the chip)
const CHIP = [118, 156, 88], INK = [45, 82, 18];
assert.ok(contrast(INK, CHIP) > STRONG, 'the dot ink is stronger than the mask threshold');
// a dot drawn on the phosphor chip; four dots, one pixel of core and one antialiasing edge each
const DOTS = [[2, 3], [2, 9], [9, 3], [9, 9]];
const drawDots = (img, core, edge, more = DOTS) => { for (const [x, y] of more) { put(img, x, y, core); put(img, x + 1, y, edge); } };
const edgeOf = (core, ground) => { const m = [0, 1, 2].map((k) => Math.round((core[k] + ground[k]) / 2)); assert.ok(contrast(m, ground) < STRONG, 'the edge stays under the glyph threshold'); return m; };

// 1. FO236-WIN158: the settled reference shows two core pixels per dot (eight); the frame before the press draws the
//    other polarity a pixel over, so the narrowed mask keeps one pixel of each dot: four positions, five with the edge.
const settled = fill(image(W, H), CHIP), before = fill(image(W, H), [26, 30, 21]);
drawDots(settled, INK, edgeOf(INK, CHIP));
for (const [x, y] of DOTS) put(settled, x + 1, y + 1, INK); // the second core pixel, off the pre-press dot
drawDots(before, [232, 232, 220], [120, 140, 100]);
for (const [x, y] of DOTS) put(before, x + 1, y, [232, 232, 220]); // the pre-press dot sits one pixel over
const five = partMask(settled, [0, 0, W, H], before);
assert.equal(five.gSettled, 8, 'the settled reference has two core pixels per dot');
assert.equal(five.groupsSettled, 4, 'four dots in the settled reference');
assert.ok(five.g.length >= 4 && five.g.length < MIN_GLYPH, `the narrowed mask keeps a core, not six positions (${five.g.length})`);
assert.equal(five.groupsKept, 4, 'every dot keeps a pixel');
assert.equal(five.ok, true, 'a five-pixel real press is judged, not unread');
// the judged frame draws the chosen tab's dots: every dot's strongest pixel is the ink, so the part is painted
const painted = fill(image(W, H), CHIP);
drawDots(painted, INK, edgeOf(INK, CHIP));
const good = partContrast(painted, five);
assert.ok(good.c >= PAINTED, `a drawn part reads at or above ${PAINTED}:1 (${good.c})`);
assert.equal(good.groups, 4);
// the frame where the switcher left the tab blank (FO-229's double paint): ink the colour of the chip
const blank = fill(image(W, H), CHIP);
assert.ok(partContrast(blank, five).c < PAINTED, 'a part painted in its ground colour reads blank');

// 2. one of four dots missing is not a pass (the per-frame reading is per dot, never a median over all of them)
const half = fill(image(W, H), CHIP);
drawDots(half, INK, edgeOf(INK, CHIP), DOTS.slice(0, 3));
const halfRead = partContrast(half, five);
assert.ok(halfRead.c < PAINTED, `three of four dots fails on the missing dot (${halfRead.c}:1)`);
assert.ok(halfRead.median >= PAINTED, 'the median over all glyph pixels would have passed it: that is why the reading is per group');

// 3. FO-236: the settled frame's extra paper-coloured pixels near the dots are ground in the frame before the press, so
//    they are not glyph positions; the settled-only mask includes them and under-reads a correctly drawn dot.
const paper = [235, 235, 225];
assert.ok(contrast(paper, CHIP) > STRONG, 'the paper-coloured edge would pass the glyph threshold on its own');
const ref3 = fill(image(W, H), CHIP), pre3 = fill(image(W, H), [26, 30, 21]), f3 = fill(image(W, H), CHIP);
for (const [x, y] of DOTS) { put(ref3, x, y, INK); put(ref3, x + 2, y, paper); put(pre3, x, y, [232, 232, 220]); put(pre3, x + 2, y, [30, 34, 26]); put(f3, x, y, INK); }
const both = partMask(ref3, [0, 0, W, H], pre3), settledOnly = partMask(ref3, [0, 0, W, H]);
assert.equal(both.g.length, 4, 'the paper-coloured pixels are not glyph positions');
assert.equal(settledOnly.g.length, 8, 'the settled-only mask took them');
assert.ok(partContrast(f3, both).c >= PAINTED, 'the two-frame mask reads the drawn dots');
assert.ok(partContrast(f3, settledOnly).median < PAINTED, 'the settled-only mask under-reads the same frame (FO-236)');

// 4. a part blank in its settled reference is unread, never judged: the mask has no glyph to place
const blankRef = fill(image(W, H), CHIP), blankPre = fill(image(W, H), [26, 30, 21]);
assert.equal(partMask(blankRef, [0, 0, W, H], blankPre).ok, false, 'no glyph pixels at settle is unread');
// ... and one that keeps only three of the settled dots is unread too (a dot was never seen before the press)
const partly = fill(image(W, H), CHIP);
drawDots(partly, INK, edgeOf(INK, CHIP));
const narrow = partMask(partly, [0, 0, W, H], fill(image(W, H), [26, 30, 21]));
assert.equal(narrow.ok, false, 'a mask that does not keep every settled dot is unread');
// 5. the size guard: a frame of another size has no reading
const small = fill(image(6, 6), CHIP);
assert.equal(partContrast(small, five).c, 0, 'a frame that does not match the mask size reads 0');
console.log(`PASS FO236: a five-position four-dot mask is judged; every dot must show its own ink (${PAINTED}:1); paper-coloured pixels in the pre-press frame are not glyph positions; a blank part, a missing dot and a blank settled reference all fail; a size mismatch reads 0`);
