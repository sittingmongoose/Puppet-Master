// Compares two folders written by diagnostics/stage-frames.check.mjs (a base build and a changed one): per capture,
// whether the stage's pixels are the same and whether its DOM is the same, and where they differ.
//   node tools/stage-frames-compare.mjs <base dir> <changed dir> [--also <second base dir>] [--json <file>] [--no-matrix] [--strict]
// Pixels: the PNGs decoded and compared exactly (RGB); a difference is reported with its pixel count, its largest
// channel step and its bounding box. DOM: the .dom.txt files compared line by line; a difference is reported with its
// first differing line from each side. A capture whose first pictures differ but where one of the changed build's two
// pictures is the same to the pixel as one of the base's is counted as the same picture (matched). A changed pixel that equals the base's pixel in another of its pictures of the
// same state (its .b.png, 20 frames later in the same run, and, with --also, a second run's two) is within the base's own
// variation (the compositor's: two runs of one build
// with the same DOM differ by a level or a few in places), and the capture is reported as within the base's variation
// when every pixel is. Exit 0 when every capture of the run's matrix is in both folders and its DOM is the same and its
// pixels are the same (or, with --also, within the base's variation), 1 otherwise.
// What was asked for (PM7PERF-STAGEFRAMES-EMPTY-INDEX): the base's index alone said nothing about what the run was asked
// to capture, so an empty index compared as "0 captures" and a partial one as the part it had, both with exit 0. Now an
// empty index is refused, and each run's <dir>/matrix.json (written by the diagnostic: the requested looks x screens x
// variants, named as the files are, and the freeze settings) is judged: both runs asked for the same thing, and every
// capture of it in both indexes and on disk; a base capture that is not there is MISSING base, a changed one MISSING
// changed. A run made before the matrix was written is refused unless --no-matrix, which compares the base's index
// alone and says so. A live run (--set live=1: nothing frozen, animations running) is not a pixel comparison: refused.
// Exit 2: could not judge (usage, an empty index, no matrix, two different requests, a live run).
// Picture classes (PM7PERF-STAGEFRAMES-PIXEL-MIX): "within the base's variation" is pixel by pixel, so a changed picture
// in it may be a mixture of two base pictures and equal to none of them. Each capture's class is named in its row, the
// summary and the closing VERDICT line: same (the first pictures equal), equal (one picture of each build equal),
// PIXELWISE (only pixelwise within the base's pictures: a weaker pass, listed one by one; --strict fails it), differ.
// The frozen pictures are taken with animations disabled and say nothing about a running animation: the run's one
// unfrozen capture per look (variant "unfrozen", animations running) must be in both runs and is reported, not judged.
// Not frozen (PM7PERF-STAGEFRAMES-SAMEBUILD-UNFROZEN, R135-F1 / F's H1): a capture whose own two frozen pictures (.png
// and .b.png, 20 frames apart in the same run) differ by more than the compositor's variation, in EITHER run, was not
// frozen by the harness: something in it keeps moving, so the pair cannot be pixel-judged. It is a could-not-judge row
// (NOT FROZEN), and every could-not-judge row is a failing row (17-MAX-ITEMS.md:63): the VERDICT says FAIL and the exit
// is non-zero, always — no --strict switch, no weaker pass. The OR over the two runs is safe because both sides fail: a
// head that breaks freezing on a frozen base, and a paint regression on a base that moves, are differences the
// capture's own pictures cannot excuse. Its DOM is still judged. The compositor's own variation is a level or a few:
// over 8 levels in at least 16 pixels is motion, not raster noise.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const SELF_LEVEL = 8, SELF_MIN = 16;

// A screenshot's pixels (Playwright's PNGs: 8-bit RGB or RGBA, not interlaced), with nothing but zlib
function png(buf) {
	let o = 8, w = 0, h = 0, ct = 0; const idat = [];
	while (o < buf.length) {
		const len = buf.readUInt32BE(o), type = buf.toString('latin1', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
		if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); if (d[8] !== 8 || d[12] !== 0) throw new Error('png: 8-bit, not interlaced only'); ct = d[9]; }
		else if (type === 'IDAT') idat.push(d); else if (type === 'IEND') break;
		o += 12 + len;
	}
	const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (!bpp) throw new Error('png: RGB or RGBA only');
	const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 3), cur = Buffer.alloc(stride), prev = Buffer.alloc(stride);
	for (let y = 0, i = 0; y < h; y++) {
		const f = raw[i++];
		for (let x = 0; x < stride; x++, i++) {
			const r = raw[i], a = x >= bpp ? cur[x - bpp] : 0, u = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
			let v = r;
			if (f === 1) v = r + a; else if (f === 2) v = r + u; else if (f === 3) v = r + ((a + u) >> 1);
			else if (f === 4) { const pp = a + u - c, pa = Math.abs(pp - a), pb = Math.abs(pp - u), pc = Math.abs(pp - c); v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? u : c); }
			cur[x] = v & 255;
		}
		for (let x = 0; x < w; x++) { out[(y * w + x) * 3] = cur[x * bpp]; out[(y * w + x) * 3 + 1] = cur[x * bpp + 1]; out[(y * w + x) * 3 + 2] = cur[x * bpp + 2]; }
		cur.copy(prev);
	}
	return { w, h, px: out };
}

function pixels(a, b, refs) {
	if (a.equals(b)) return { same: true, n: 0 };
	const A = png(a), B = png(b), Rs = (refs || []).map(png).filter((r) => r.w === A.w && r.h === A.h);
	if (A.w !== B.w || A.h !== B.h) return { same: false, size: `${A.w}x${A.h} vs ${B.w}x${B.h}` };
	let n = 0, max = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1, out = 0, outMax = 0;
	for (let i = 0; i < A.w * A.h; i++) {
		const d = Math.max(Math.abs(A.px[i * 3] - B.px[i * 3]), Math.abs(A.px[i * 3 + 1] - B.px[i * 3 + 1]), Math.abs(A.px[i * 3 + 2] - B.px[i * 3 + 2]));
		if (!d) continue;
		n++; max = Math.max(max, d);
		let d2 = d; for (const R of Rs) d2 = Math.min(d2, Math.max(Math.abs(R.px[i * 3] - B.px[i * 3]), Math.abs(R.px[i * 3 + 1] - B.px[i * 3 + 1]), Math.abs(R.px[i * 3 + 2] - B.px[i * 3 + 2])));
		if (d2) { out++; outMax = Math.max(outMax, d2); }
		const x = i % A.w, y = (i / A.w) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
	}
	return n ? { same: false, n, max, box: [x0, y0, x1, y1], within: Rs.length ? out === 0 : false, outside: out, outsideMax: outMax, refs: Rs.length } : { same: true, n: 0, bytes: 'differ, pixels same' };
}

function dom(a, b) {
	if (a === b) return { same: true };
	const A = a.split('\n'), B = b.split('\n');
	for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) return { same: false, line: i + 1, base: (A[i] || '(end)').trim().slice(0, 240), changed: (B[i] || '(end)').trim().slice(0, 240), lines: `${A.length} vs ${B.length}` };
	return { same: true };
}

const flag = (k) => process.argv.includes(k);
const [baseDir, changedDir] = process.argv.slice(2).filter((x, i, all) => !x.startsWith('--') && !['--json', '--also'].includes(all[i - 1]));
const jsonAt = process.argv.indexOf('--json'), jsonOut = jsonAt > 0 ? process.argv[jsonAt + 1] : null;
const alsoAt = process.argv.indexOf('--also'), also = alsoAt > 0 ? process.argv[alsoAt + 1] : null;
const noMatrix = flag('--no-matrix'), strict = flag('--strict');
const refuse = (why) => { console.log(`COULD NOT JUDGE: ${why}`); process.exit(2); };
if (!baseDir || !changedDir) { console.error('usage: node tools/stage-frames-compare.mjs <base dir> <changed dir> [--also <second base dir>] [--json <file>] [--no-matrix] [--strict]'); process.exit(2); }
const readJson = (dir, name) => { const f = path.join(dir, name); if (!fs.existsSync(f)) return null; try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { refuse(`${f} is not JSON: ${e.message}`); } };
const baseIndex = readJson(baseDir, 'index.json'), changedIndex = readJson(changedDir, 'index.json');
if (!Array.isArray(baseIndex)) refuse(`no index in the base run (${path.join(baseDir, 'index.json')})`);
if (!baseIndex.length) refuse(`the base run's index is empty (${path.join(baseDir, 'index.json')}): nothing to compare`);
if (!Array.isArray(changedIndex)) refuse(`no index in the changed run (${path.join(changedDir, 'index.json')})`);
const key = (e) => `${e.look}/${e.file}`;
const baseListed = new Map(baseIndex.map((e) => [key(e), e])), changedListed = new Set(changedIndex.map(key));
// the request both runs were made for
const SETTINGS = ['looks', 'screens', 'variants', 'frames', 'cssT', 'motion', 'repaint', 'nudge', 'live', 'unfrozen'];
let index = baseIndex, matrixNote = 'capture matrix not checked (--no-matrix): the base\'s index alone';
if (!noMatrix) {
	const bm = readJson(baseDir, 'matrix.json'), cm = readJson(changedDir, 'matrix.json');
	if (!bm || !cm) refuse(`no capture matrix (matrix.json) in the ${!bm ? 'base' : 'changed'} run: a run made before the diagnostic wrote one; --no-matrix compares the base's index alone`);
	const differs = SETTINGS.filter((k) => JSON.stringify(bm[k]) !== JSON.stringify(cm[k]));
	if (differs.length) refuse(`the two runs were asked for different things: ${differs.map((k) => `${k} ${JSON.stringify(bm[k])} vs ${JSON.stringify(cm[k])}`).join('; ')}`);
	if (bm.live) refuse('a live run (--set live=1): pictures of a swaying stage with its animations running are not compared to the pixel');
	if (!Array.isArray(bm.expected) || !bm.expected.length) refuse('the capture matrix asks for nothing');
	if (JSON.stringify(bm.expected.map(key)) !== JSON.stringify((cm.expected || []).map(key))) refuse('the two runs\' capture matrices name different captures');
	index = bm.expected.map((e) => ({ ...e, ...(baseListed.get(key(e)) || {}) }));
	matrixNote = `capture matrix checked: ${bm.looks.length} looks x ${bm.screens.length} screens x ${bm.variants.length} variants = ${bm.expected.length}`;
}
const extra = noMatrix ? [] : baseIndex.filter((e) => !index.some((x) => key(x) === key(e)));
const rows = []; let px = 0, dm = 0, missing = 0, within = 0, matched = 0, unfrozen = 0;
for (const e of index) {
	const a = path.join(baseDir, e.look, e.file), b = path.join(changedDir, e.look, e.file);
	const gone = (dir, listed) => (listed ? '' : 'not in its index') || ['.png', '.b.png', '.dom.txt'].filter((x) => !fs.existsSync(path.join(dir, e.look, e.file) + x)).join(', ');
	const goneBase = gone(baseDir, baseListed.has(key(e))), goneChanged = gone(changedDir, changedListed.has(key(e)));
	if (goneBase || goneChanged) { missing++; rows.push({ ...e, class: 'missing', missing: [goneBase && `base: ${goneBase}`, goneChanged && `changed: ${goneChanged}`].filter(Boolean).join('; ') }); continue; }
	/* an unfrozen capture (animations running, the stage swaying): for eyes, side by side; how far each build's own two
	   pictures differ, and the base's from the changed one, is logged, not judged */
	if (e.unfrozen) {
		unfrozen++;
		const rd = (f) => fs.readFileSync(f), n = (x, y) => { const q = pixels(rd(x), rd(y)); return q.size || q.n; };
		rows.push({ look: e.look, file: e.file, class: 'unfrozen', unfrozen: { base: n(a + '.png', a + '.b.png'), changed: n(b + '.png', b + '.b.png'), across: n(a + '.png', b + '.png') } });
		continue;
	}
	/* the base's other pictures of this state: its second picture in the same run (.b.png) and both of the --also run's */
	const refs = [a + '.b.png'].concat(also ? [path.join(also, e.look, e.file) + '.png', path.join(also, e.look, e.file) + '.b.png'] : []).filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f));
	const p = pixels(fs.readFileSync(a + '.png'), fs.readFileSync(b + '.png'), refs);
	/* matched: one of the changed build's pictures of the state (.png, .b.png) is the same to the pixel as one of the
	   base's (a picture taken at a moment the compositor was still finishing differs from the one 20 frames later) */
	if (!p.same) {
		const mine = [b + '.png', b + '.b.png'].filter((f) => fs.existsSync(f)).map((f) => fs.readFileSync(f)), base = [fs.readFileSync(a + '.png')].concat(refs);
		p.matched = mine.some((m) => base.some((r) => pixels(r, m).same));
		if (p.matched) matched++; else if (p.within) within++;
	}
	const d = dom(fs.readFileSync(a + '.dom.txt', 'utf8'), fs.readFileSync(b + '.dom.txt', 'utf8'));
	if (p.same) px++; if (d.same) dm++;
	/* did the harness freeze this capture at all? its own two pictures, 20 frames apart in the same run, in either run */
	const selfDiff = (x, y) => { if (!fs.existsSync(y)) return null; const q = pixels(fs.readFileSync(x), fs.readFileSync(y)); return q.size ? { size: q.size } : { n: q.n, max: q.max || 0 }; };
	const sb = selfDiff(a + '.png', a + '.b.png'), sc = selfDiff(b + '.png', b + '.b.png');
	const moving = (s) => !!s && (s.size ? true : s.n >= SELF_MIN && s.max > SELF_LEVEL);
	let cls = p.same ? 'same' : p.matched ? 'equal' : p.within ? 'pixelwise' : 'differ';
	if (moving(sb) || moving(sc)) cls = 'not-frozen';
	rows.push({ look: e.look, file: e.file, props: e.props, target: e.target, class: cls, pixels: p, dom: d, notFrozen: cls === 'not-frozen' ? { base: sb, changed: sc } : null });
}
for (const e of extra) rows.push({ ...e, class: 'extra', extra: true });
const judged = rows.filter((r) => r.pixels), weak = judged.filter((r) => r.class === 'pixelwise'), notFrozen = judged.filter((r) => r.class === 'not-frozen');
const bad = rows.filter((r) => r.missing || r.extra || r.class === 'not-frozen' || (r.pixels && (r.class === 'differ' || !r.dom.same)) || (strict && r.class === 'pixelwise'));
console.log(matrixNote);
console.log(`${index.length - unfrozen} frozen captures: equal to one base picture in ${px + matched} (the first pictures the same in ${px}, another picture of each build the same in ${matched}); PIXELWISE only in ${within} (weaker: every pixel equals the base's at that place in one of its pictures, but the picture equals none of them: it may be a mixture); differ in ${judged.filter((r) => r.class === 'differ').length}; NOT FROZEN (could not judge: fails) in ${notFrozen.length}; DOM the same in ${dm}; missing ${missing}${extra.length ? `; not asked for ${extra.length}` : ''}`);
if (unfrozen || !noMatrix) console.log(`unfrozen ${unfrozen} (animations running, one per look: for eyes, not judged; the frozen pictures above say nothing about a running animation)`);
for (const r of rows.filter((x) => x.unfrozen)) console.log(`UNFROZEN ${r.look}/${r.file}: its own two pictures differ by ${r.unfrozen.base} px in the base, ${r.unfrozen.changed} px in the changed run; base and changed ${r.unfrozen.across} px (logged)`);
for (const r of weak) console.log(`PIXELWISE ${r.look}/${r.file}: equal to none of the base's ${1 + r.pixels.refs} pictures; each of its pixels equals the base's at that place in one of them (${r.pixels.n} px differ from the first, up to ${r.pixels.max} a channel, box ${r.pixels.box.join(',')})${strict ? ': fails under --strict' : ''}`);
for (const r of notFrozen) {
	const one = (s) => s ? (s.size ? `a size change (${s.size})` : `${s.n} px (up to ${s.max} a channel)`) : 'no second picture';
	console.log(`NOT FROZEN ${r.look}/${r.file}: could not judge — the harness did not freeze this capture: its own two pictures differ by ${one(r.notFrozen.base)} in the base, ${one(r.notFrozen.changed)} in the changed run; a could-not-judge row, so the compare fails`);
}
for (const r of bad) {
	if (r.missing) { console.log(`MISSING ${r.look}/${r.file} (${r.missing})`); continue; }
	if (r.extra) { console.log(`EXTRA  ${r.look}/${r.file}: in the base's index but not in its capture matrix`); continue; }
	if (r.class === 'differ') console.log(`PIXELS ${r.look}/${r.file}: ${r.pixels.size || `${r.pixels.n} px differ, up to ${r.pixels.max} a channel, box ${r.pixels.box.join(',')}; outside the base's variation (${r.pixels.refs} more pictures of it) ${r.pixels.outside} px, up to ${r.pixels.outsideMax}`}`);
	if (!r.dom.same) console.log(`DOM    ${r.look}/${r.file}: line ${r.dom.line} (${r.dom.lines})\n  base:    ${r.dom.base}\n  changed: ${r.dom.changed}`);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 1));
const frozenN = judged.length + missing;
if (bad.length) console.log(`VERDICT: FAIL: ${bad.length} of ${rows.length} captures (missing ${missing}, pixels differ ${judged.filter((r) => r.class === 'differ').length}, DOM differs ${judged.filter((r) => !r.dom.same).length}${extra.length ? `, not asked for ${extra.length}` : ''}, not frozen ${notFrozen.length}${strict ? `, PIXELWISE only under --strict ${weak.length}` : ''})`);
else if (weak.length) console.log(`VERDICT: PASS (weaker): ${weak.length} of ${frozenN} frozen captures only pixelwise within the base's pictures, equal to none of them; the other ${frozenN - weak.length} equal to one base picture; DOM the same in all`);
else console.log(`VERDICT: PASS: every capture equal to one base picture (${frozenN} frozen), DOM the same in all${unfrozen ? `; ${unfrozen} unfrozen not judged` : ''}`);
process.exit(bad.length ? 1 : 0);
