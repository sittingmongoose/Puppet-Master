// Selftest for helpers/tab-face-pixels.mjs: the part mask, settled-core strict-majority reading, and required-part check
// of FO-229's Home/Agents tab face, on synthetic pixels so every case is the same on any host.
// Cases: FO236-WIN158-FIVE-PIXEL-REFERENCE (five-position four-dot press is judged), FO-236 polarity (pre-press paper
// pixels excluded), per-group bar (blank dot, missing dot, blank settled ref, size guard), NM19-TABFACE-SYNTHETIC-PARTIAL
// (10-11 px top cover on 15 px multi-pixel label, opacity 0.35, 1 px dimmed shift, clip-right-50 all fail while a real
// pressed-chip fringe drop still passes), FO236-PARTIAL-GLYPH (half-bright core on dark chip fails on both c and median:
// right colon erased, half of each 2-px dot erased, and 4-of-8 single group), and FO229-MISSING-PARTS (Home glyph and
// Agents label/glyph required; Home icon-only label exception preserved).
import assert from 'node:assert/strict';
import { partMask, partContrast, missingTabParts, contrast, PAINTED, MIN_GLYPH, STRONG } from '../helpers/tab-face-pixels.mjs';

const W = 12, H = 14;
const image = (w, h) => ({ width: w, height: h, channels: 3, data: Buffer.alloc(w * h * 3) });
const fill = (img, c) => { for (let i = 0; i < img.data.length; i += 3) { img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; } return img; };
const put = (img, x, y, c) => { const i = (y * img.width + x) * 3; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; };
const blend = (a, b, alpha) => [0, 1, 2].map((k) => Math.round(a[k] * alpha + b[k] * (1 - alpha)));

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
// the judged frame draws the chosen tab's dots: every dot's core is the ink, so the part is painted
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

// 6. NM19-TABFACE-SYNTHETIC-PARTIAL: 15 px multi-pixel letter strokes (like the 6-letter "Agents" label).
//    Settled frame: dark ink on bright phosphor chip (1 peak pixel ~8.5:1 so opacity 0.35 still leaves a >=1.89:1 peak
//    that passed the old strongest-pixel bar, main core ~6.5:1 whose 0.35 blend falls below 1.8:1, and ~2.4:1 AA fringe).
//    Pre-press frame: bright phosphor ink on dark paper.
const LW = 44, LH = 15;
const LCHIP = [138, 194, 111], LPEAK = [14, 28, 10], LINK = [28, 52, 18], LFRINGE = [80, 120, 62];
const LPRE_BG = [20, 30, 14], LPRE_INK = [150, 220, 120];
assert.ok(contrast(LPEAK, LCHIP) > 8 && contrast(LINK, LCHIP) > 5.5, 'settled label peak and core are high contrast');
assert.ok(contrast(blend(LPEAK, LCHIP, 0.35), LCHIP) >= PAINTED, 'opacity 0.35 peak stays >= PAINTED (would pass old strongest-pixel bar)');
assert.ok(contrast(blend(LINK, LCHIP, 0.35), LCHIP) < PAINTED, 'opacity 0.35 body core drops below PAINTED');
assert.ok(contrast(LFRINGE, LCHIP) >= STRONG && contrast(LFRINGE, LCHIP) < 3.5, 'settled label fringe passes STRONG but sits below settled core midpoint');
const LETTERS = [2, 9, 16, 23, 30, 37];
const drawLabel = (img, peakCol, coreCol, fringeCol, bgCol, opts = {}) => {
	fill(img, bgCol);
	for (const lx of LETTERS) {
		for (let y = 2; y <= 12; y++) {
			if (opts.topCover && y < opts.topCover) continue;
			if (opts.rightClip && lx >= LW / 2) continue;
			const dy = opts.shiftY || 0;
			if (y + dy < 0 || y + dy >= LH) continue;
			put(img, lx, y + dy, y === 12 ? peakCol : coreCol);
			put(img, lx + 1, y + dy, coreCol);
			if (!opts.skipFringe) {
				put(img, lx + 2, y + dy, fringeCol);
				if (y === 2 || y === 12) put(img, lx - 1, y + dy, fringeCol);
			}
		}
	}
	return img;
};
const lRef = drawLabel(image(LW, LH), LPEAK, LINK, LFRINGE, LCHIP);
const lPre = drawLabel(image(LW, LH), LPRE_INK, LPRE_INK, LPRE_INK, LPRE_BG);
const lMask = partMask(lRef, [0, 0, LW, LH], lPre);
assert.equal(lMask.ok, true);
assert.equal(lMask.clusters.length, 6, 'six letter groups');
assert.ok(lMask.cores.every((c) => c.length >= 20), 'each letter keeps its solid settled core, not one pixel');
// Intact settled frame passes
assert.ok(partContrast(lRef, lMask).c >= PAINTED, 'intact label passes');
// Pressed-chip uniform dimming where core stays ~2.8:1 and AA fringe drops to ~1.3:1 still passes (Windows Chrome 158 pressed chip)
const PCHIP = [117, 155, 88], PINK = [45, 80, 20], PFRINGE = [95, 132, 70];
assert.ok(contrast(PINK, PCHIP) >= 2.2 && contrast(PFRINGE, PCHIP) < 1.5, 'pressed-chip core strong, fringe weak');
const lPressed = drawLabel(image(LW, LH), PINK, PINK, PFRINGE, PCHIP);
assert.ok(partContrast(lPressed, lMask).c >= PAINTED, `pressed-chip frame with dimmed fringe passes (${partContrast(lPressed, lMask).c}:1)`);
// Synthetic partials that previously falsely passed the strongest-pixel bar must now FAIL:
const lTop10 = drawLabel(image(LW, LH), LPEAK, LINK, LFRINGE, LCHIP, { topCover: 10 });
const lTop11 = drawLabel(image(LW, LH), LPEAK, LINK, LFRINGE, LCHIP, { topCover: 11 });
assert.ok(partContrast(lTop10, lMask).c < PAINTED, `10 px top cover fails (${partContrast(lTop10, lMask).c}:1)`);
assert.ok(partContrast(lTop11, lMask).c < PAINTED, `11 px top cover fails (${partContrast(lTop11, lMask).c}:1)`);
const lOp35 = drawLabel(image(LW, LH), blend(LPEAK, LCHIP, 0.35), blend(LINK, LCHIP, 0.35), blend(LFRINGE, LCHIP, 0.35), LCHIP);
assert.ok(partContrast(lOp35, lMask).c < PAINTED, `opacity 0.35 fails (${partContrast(lOp35, lMask).c}:1)`);
// 1 px dimmed shift on horizontal-bar letters (vertical shift moves bar out of core rows)
const HBAR_REF = fill(image(LW, LH), LCHIP), HBAR_PRE = fill(image(LW, LH), LPRE_BG);
for (const lx of LETTERS) {
	for (let x = lx; x <= lx + 3; x++) {
		for (const y of [3, 7, 11]) { put(HBAR_REF, x, y, LINK); put(HBAR_PRE, x, y, LPRE_INK); }
	}
}
const hbarMask = partMask(HBAR_REF, [0, 0, LW, LH], HBAR_PRE);
const hbarShiftDim = fill(image(LW, LH), LCHIP);
for (const lx of LETTERS) {
	for (let x = lx; x <= lx + 3; x++) {
		for (const y of [3, 7, 11]) put(hbarShiftDim, x, y + 1, blend(LINK, LCHIP, 0.55));
	}
}
assert.ok(partContrast(hbarShiftDim, hbarMask).c < PAINTED, `1 px dimmed y-shift fails (${partContrast(hbarShiftDim, hbarMask).c}:1)`);
const lClipR50 = drawLabel(image(LW, LH), LPEAK, LINK, LFRINGE, LCHIP, { rightClip: true });
assert.ok(partContrast(lClipR50, lMask).c < PAINTED, `clip-right-50 fails (${partContrast(lClipR50, lMask).c}:1)`);

// 7. FO236-PARTIAL-GLYPH: bright-on-dark chip (Retro Light settled: cream [209,212,200] on dark green [39,101,51]),
//    4 dots of 2 core pixels each (8 core pixels total, matching the retained Alexis crop).
const DARK_CHIP = [39, 101, 51], CREAM = [209, 212, 200], LIGHT_PAPER = [218, 213, 206], GREEN_INK = [47, 122, 61];
const A_DOTS = [[[2, 5], [3, 5]], [[8, 5], [9, 5]], [[2, 10], [3, 10]], [[8, 10], [9, 10]]];
const aRef = fill(image(W, H), DARK_CHIP), aPre = fill(image(W, H), LIGHT_PAPER);
for (const dot of A_DOTS) for (const [x, y] of dot) { put(aRef, x, y, CREAM); put(aPre, x, y, GREEN_INK); }
const aMask = partMask(aRef, [0, 0, W, H], aPre);
assert.equal(aMask.ok, true);
assert.equal(aMask.g.length, 8);
assert.ok(partContrast(aRef, aMask).c >= PAINTED, 'intact Alexis-like settled colon passes');
assert.ok(partContrast(aPre, aMask).c >= PAINTED, 'intact Alexis-like hover colon passes');
// 7a. Only left colon remains (4 of 8 pixels bright on dark chip): BOTH c and median must fail (never 4.66:1)
const aLeftOnly = fill(image(W, H), DARK_CHIP);
for (const dot of [A_DOTS[0], A_DOTS[2]]) for (const [x, y] of dot) put(aLeftOnly, x, y, CREAM);
const leftRes = partContrast(aLeftOnly, aMask);
assert.ok(leftRes.c < PAINTED, `left-colon-only fails c (${leftRes.c}:1)`);
assert.ok(leftRes.median < PAINTED, `left-colon-only fails lower-median too, never upper-median 4.66:1 (${leftRes.median}:1)`);
// 7b. Half of each dot erased (1 of 2 core pixels per dot = 4 of 8 bright): must fail
const aHalfEach = fill(image(W, H), DARK_CHIP);
for (const dot of A_DOTS) put(aHalfEach, dot[0][0], dot[0][1], CREAM);
assert.ok(partContrast(aHalfEach, aMask).c < PAINTED, `half-of-each-dot fails (${partContrast(aHalfEach, aMask).c}:1)`);
// 7c. Single connected 8-pixel core with 4 of 8 pixels bright on dark chip: must fail
const singleMask = { ...aMask, clusters: [aMask.g], cores: [aMask.g] };
const singleHalf = partContrast(aLeftOnly, singleMask);
assert.ok(singleHalf.c < PAINTED && singleHalf.median < PAINTED, `half of a single 8-px core fails (c=${singleHalf.c}, med=${singleHalf.median})`);

// 8. FO229-MISSING-PARTS: require Home glyph, Agents label and Agents glyph; keep Home's icon-only label exception.
assert.deepEqual(missingTabParts({ Home: { label: null, glyph: [0, 0, 12, 14] }, Agents: { label: [0, 0, 42, 15], glyph: [0, 0, 12, 14] } }), []);
assert.deepEqual(missingTabParts({ Home: { label: null, glyph: null }, Agents: { label: [0, 0, 42, 15], glyph: null } }), ['Home glyph', 'Agents glyph']);
assert.deepEqual(missingTabParts({ Home: { label: null, glyph: [0, 0, 12, 14] }, Agents: { label: null, glyph: [0, 0, 12, 14] } }), ['Agents label']);
assert.deepEqual(missingTabParts({}), ['Home glyph', 'Agents label', 'Agents glyph']);

console.log(`PASS tab-face-mask: five-pixel real press judged; settled-core strict-majority (${PAINTED}:1) catches 10-11 px top cover, opacity 0.35, 1 px dimmed shift, clip-right-50, and half-bright dark-chip glyphs; FO-236 polarity and FO229-MISSING-PARTS required-part checks verified`);
