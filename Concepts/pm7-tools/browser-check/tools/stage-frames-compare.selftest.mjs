// tools/stage-frames-compare.mjs and diagnostics/stage-frames.check.mjs on constructed run folders and a stub stage.
//   node tools/stage-frames-compare.selftest.mjs [--compare <stage-frames-compare.mjs>] [--check <stage-frames.check.mjs>]
// (the two options point the cases at another copy of either file, for a red run against an older one)
// PM7PERF-STAGEFRAMES-EMPTY-INDEX: an empty base index, or one that lacks part of what the run was asked for, compared
// as "0 captures" or as the part it had, with exit 0. The compare now refuses an empty index (exit 2) and judges the
// run's capture matrix (<out>/matrix.json, written by the diagnostic): every requested look x screen x variant must be
// in both runs' indexes and on disk, and both runs must have been asked for the same thing.
// PM7PERF-STAGEFRAMES-HEX-AS-ID: the diagnostic's DOM normalisation renamed every attribute value of the form #... as an
// id reference, so fill="#211F1B" became fill="#id1" and a colour change between two builds vanished from the DOM
// comparison. Only fragment references are renamed now (href / xlink:href "#id", url(#id) anywhere); its DOM() is run
// here on a stub stage.
// PM7PERF-STAGEFRAMES-PIXEL-MIX: a changed picture whose every pixel equals the base's at that place in one of its
// pictures passed like one equal to a base picture, though it may be a mixture of two and equal to neither. It is now
// its own weaker class (PIXELWISE) in the rows, the summary and the verdict line, and --strict fails it; and since the
// frozen pictures say nothing about a running animation, the diagnostic adds one unfrozen capture per look, which the
// compare requires in both runs and reports without judging.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const opt = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? path.resolve(process.argv[i + 1]) : d; };
const TOOL = opt('--compare', path.join(here, 'stage-frames-compare.mjs'));
const CHECK = opt('--check', path.join(here, '..', 'diagnostics', 'stage-frames.check.mjs'));

let failed = 0;
const ok = (name, cond, detail) => { if (!cond) failed++; console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ` (${detail})`}`); };

// a PNG of w x h 8-bit RGB pixels from f(x, y) -> [r, g, b], with nothing but zlib (as the compare reads them)
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4), sum = Buffer.alloc(4), td = Buffer.concat([Buffer.from(type, 'latin1'), data]); len.writeUInt32BE(data.length); sum.writeUInt32BE(crc(td)); return Buffer.concat([len, td, sum]); };
function png(w, h, f) {
	const raw = Buffer.alloc((w * 3 + 1) * h);
	for (let y = 0, o = 0; y < h; y++) { raw[o++] = 0; for (let x = 0; x < w; x++) { const [r, g, b] = f(x, y); raw[o++] = r; raw[o++] = g; raw[o++] = b; } }
	const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
	return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const GREY = png(8, 6, () => [40, 40, 40]);

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stage-frames-selftest-'));
let runs = 0;
// A run folder as the diagnostic writes it: <dir>/<look>/<file>.png, .b.png, .dom.txt, index.json and matrix.json.
//   index: the entries the index lists (default all of matrix.expected); files: the entries written to disk (default
//   the index's); pics(e) -> { a, b } the two pictures; matrix: null for a run made before the matrix was written
function run({ matrix, index, files, pics, dom }) {
	const dir = path.join(root, `run${++runs}`);
	fs.mkdirSync(dir, { recursive: true });
	const listed = index || (matrix ? matrix.expected : []);
	for (const e of files || listed) {
		fs.mkdirSync(path.join(dir, e.look), { recursive: true });
		const p = pics ? pics(e) : { a: GREY, b: GREY };
		fs.writeFileSync(path.join(dir, e.look, e.file + '.png'), p.a);
		fs.writeFileSync(path.join(dir, e.look, e.file + '.b.png'), p.b);
		fs.writeFileSync(path.join(dir, e.look, e.file + '.dom.txt'), dom ? dom(e) : '<g id="id0">');
	}
	fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify(listed.map((e) => ({ ...e, props: [], target: null }))));
	if (matrix) fs.writeFileSync(path.join(dir, 'matrix.json'), JSON.stringify(matrix));
	return dir;
}
const compare = (...args) => { const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8' }); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };

// the matrix the diagnostic writes for one request (settings beside the expected captures)
const request = { looks: ['basic-dark'], screens: ['welcome', 'ready'], variants: ['base', 'blink'], frames: 90, cssT: 1500, motion: '', repaint: false, nudge: false, live: false };
const E = (look, file, screen, variant) => ({ look, file, screen, variant });
const expected = [E('basic-dark', '01-welcome-asleep-base', 'welcome-asleep', 'base'), E('basic-dark', '02-welcome-asleep-blink', 'welcome-asleep', 'blink'), E('basic-dark', '03-ready-base', 'ready', 'base'), E('basic-dark', '04-ready-blink', 'ready', 'blink')];
const matrix = { version: 1, ...request, expected };

try {
	const check = await import(pathToFileURL(CHECK).href);

	// -- the matrix the diagnostic asks for, named as it names its files (one source for both)
	{
		const m = typeof check.captureMatrix === 'function' ? check.captureMatrix({ looks: ['basic-dark', 'nier-light'], screens: ['welcome', 'ready', 'welcome'], variants: ['base', 'quiet'] }) : null;
		const files = m && m.map((e) => `${e.look}/${e.file}`);
		ok('EMPTY-INDEX: the diagnostic exports its capture matrix', !!m, 'no captureMatrix export');
		ok('EMPTY-INDEX: the matrix is every look x screen x variant, in the run\'s file names', !!files && files.length === 12 && files[0] === 'basic-dark/01-welcome-asleep-base' && files[3] === 'basic-dark/04-ready-quiet' && files[5] === 'basic-dark/06-welcome-awake-quiet' && files[6] === 'nier-light/01-welcome-asleep-base', JSON.stringify(files));
	}

	// -- the transition variants (TOOLS-STAGEREST-K1) flow through the matrix naming like any variant
	{
		const m = check.captureMatrix({ looks: ['nier-dark'], screens: ['ready'], variants: ['base', 'textsize', 'resized', 'motion'], unfrozen: true });
		const files = m.map((e) => e.file);
		ok('K1: the transition variants are named in the matrix, unfrozen last', files.length === 5 && files[0] === '01-ready-base' && files[1] === '02-ready-textsize' && files[2] === '03-ready-resized' && files[3] === '04-ready-motion' && files[4] === '05-ready-unfrozen' && m[4].unfrozen === true, JSON.stringify(files));
	}

	// -- an empty base index is refused
	{
		const base = run({ matrix: { ...matrix, expected: [] }, index: [] }), changed = run({ matrix });
		const r = compare(base, changed);
		ok('EMPTY-INDEX: an empty base index is refused (exit 2)', r.code === 2, `exit ${r.code}: ${r.out.trim().split('\n')[0]}`);
		const r2 = compare(run({ matrix: null, index: [] }), changed, '--no-matrix');
		ok('EMPTY-INDEX: an empty base index is refused without a matrix too', r2.code === 2, `exit ${r2.code}: ${r2.out.trim().split('\n')[0]}`);
	}

	// -- a base run that lacks part of its matrix (index and files) is not a pass
	{
		const part = expected.slice(0, 1);
		const base = run({ matrix, index: part }), changed = run({ matrix });
		const r = compare(base, changed);
		ok('EMPTY-INDEX: a base index short of its matrix fails (exit 1)', r.code === 1, `exit ${r.code}: ${r.out.trim().split('\n')[0]}`);
		ok('EMPTY-INDEX: the missing base captures are named', /MISSING basic-dark\/02-welcome-asleep-blink \(base/.test(r.out) && /MISSING basic-dark\/04-ready-blink \(base/.test(r.out), r.out.trim());
	}

	// -- a capture listed in the base index but not written to disk is named, not a crash
	{
		const base = run({ matrix, files: expected.slice(0, 3) }), changed = run({ matrix });
		const r = compare(base, changed);
		ok('EMPTY-INDEX: a base capture listed but not on disk fails (exit 1) and is named', r.code === 1 && /MISSING basic-dark\/04-ready-blink \(base: \.png/.test(r.out), `exit ${r.code}: ${r.out.trim()}`);
	}

	// -- a changed run short of the matrix fails (as before), in its index or on disk
	{
		const base = run({ matrix }), changed = run({ matrix, index: expected.slice(0, 3) });
		const r = compare(base, changed);
		ok('EMPTY-INDEX: a changed run short of the matrix fails (exit 1)', r.code === 1 && /MISSING basic-dark\/04-ready-blink \(changed/.test(r.out), `exit ${r.code}: ${r.out.trim()}`);
	}

	// -- the whole matrix in both runs, the same: a pass
	{
		const r = compare(run({ matrix }), run({ matrix }));
		ok('EMPTY-INDEX: the whole matrix in both runs, the same, passes (exit 0)', r.code === 0, `exit ${r.code}: ${r.out.trim()}`);
		ok('EMPTY-INDEX: the summary names the matrix it checked', /4 frozen captures/.test(r.out) && /matrix/i.test(r.out), r.out.trim());
	}

	// -- two runs asked for different things are not compared
	{
		const other = { ...matrix, variants: ['base'], expected: expected.filter((e) => e.variant === 'base') };
		const r = compare(run({ matrix }), run({ matrix: other }));
		ok('EMPTY-INDEX: two runs asked for different matrices are refused (exit 2)', r.code === 2, `exit ${r.code}: ${r.out.trim().split('\n')[0]}`);
		const r2 = compare(run({ matrix }), run({ matrix: { ...matrix, frames: 30 } }));
		ok('EMPTY-INDEX: two runs with different freeze settings are refused (exit 2)', r2.code === 2, `exit ${r2.code}: ${r2.out.trim().split('\n')[0]}`);
	}

	// -- a run made before the matrix was written: refused unless --no-matrix, which says what it did not check
	{
		const r = compare(run({ matrix: null, index: expected }), run({ matrix: null, index: expected }));
		ok('EMPTY-INDEX: runs without a matrix are refused (exit 2)', r.code === 2, `exit ${r.code}: ${r.out.trim().split('\n')[0]}`);
		const r2 = compare(run({ matrix: null, index: expected }), run({ matrix: null, index: expected }), '--no-matrix');
		ok('EMPTY-INDEX: --no-matrix compares the index alone and says the matrix was not checked', r2.code === 0 && /matrix not checked/i.test(r2.out), `exit ${r2.code}: ${r2.out.trim()}`);
	}

	// -- a live run (animations running) is not a pixel comparison
	{
		const live = { ...matrix, live: true };
		const r = compare(run({ matrix: live }), run({ matrix: live }));
		ok('EMPTY-INDEX: a live run is refused for a pixel comparison (exit 2)', r.code === 2, `exit ${r.code}: ${r.out.trim().split('\n')[0]}`);
	}

	// -- the picture classes: equal to one base picture, only pixelwise within the base's pictures, different
	{
		const G = [40, 40, 40], RED = [200, 0, 0], BLUE = [0, 0, 200];
		const pic = (spots) => png(8, 6, (x, y) => spots[`${x},${y}`] || G);
		const A = pic({ '1,1': RED }), B = pic({ '5,4': BLUE }), MIX = pic({ '1,1': RED, '5,4': BLUE }), PLAIN = pic({}), OFF = pic({ '2,2': [41, 40, 40] });
		const one = { ...matrix, variants: ['base'], screens: ['ready'], expected: [E('basic-dark', '01-ready-base', 'ready', 'base')] };
		// the base's two pictures differ at two places; the changed one has both places changed: a mixture, equal to neither
		const base = run({ matrix: one, pics: () => ({ a: A, b: B }) });
		const mixed = compare(base, run({ matrix: one, pics: () => ({ a: MIX, b: MIX }) }));
		ok('PIXEL-MIX: a mixture of two base pictures is reported as its own weaker class', /^PIXELWISE basic-dark\/01-ready-base/m.test(mixed.out), mixed.out.trim());
		ok('PIXEL-MIX: the verdict names the weaker class (exit 0 without --strict)', mixed.code === 0 && /^VERDICT: PASS \(weaker\): 1 of 1/m.test(mixed.out), `exit ${mixed.code}: ${mixed.out.trim()}`);
		const strict = compare(base, run({ matrix: one, pics: () => ({ a: MIX, b: MIX }) }), '--strict');
		ok('PIXEL-MIX: --strict fails a capture that is only pixelwise within (exit 1)', strict.code === 1 && /^VERDICT: FAIL/m.test(strict.out), `exit ${strict.code}: ${strict.out.trim()}`);
		// the changed picture equals the base's second one: the stronger class, no weaker note
		const equal = compare(base, run({ matrix: one, pics: () => ({ a: B, b: B }) }));
		ok('PIXEL-MIX: a capture equal to one base picture passes in the stronger class', equal.code === 0 && /^VERDICT: PASS: every capture equal to one base picture/m.test(equal.out) && !/^PIXELWISE/m.test(equal.out), `exit ${equal.code}: ${equal.out.trim()}`);
		const strict2 = compare(base, run({ matrix: one, pics: () => ({ a: B, b: B }) }), '--strict');
		ok('PIXEL-MIX: --strict passes a capture equal to one base picture', strict2.code === 0, `exit ${strict2.code}: ${strict2.out.trim()}`);
		const json = path.join(root, 'rows.json'); compare(base, run({ matrix: one, pics: () => ({ a: MIX, b: MIX }) }), '--json', json);
		const rows = fs.existsSync(json) ? JSON.parse(fs.readFileSync(json, 'utf8')) : [];
		ok('PIXEL-MIX: the JSON rows carry the class', rows.length === 1 && rows[0].class === 'pixelwise', JSON.stringify(rows.map((r) => r.class)));
		const differ = compare(run({ matrix: one, pics: () => ({ a: PLAIN, b: PLAIN }) }), run({ matrix: one, pics: () => ({ a: OFF, b: OFF }) }));
		ok('PIXEL-MIX: a capture outside the base\'s pictures fails (exit 1)', differ.code === 1 && /^PIXELS basic-dark\/01-ready-base/m.test(differ.out) && /^VERDICT: FAIL/m.test(differ.out), `exit ${differ.code}: ${differ.out.trim()}`);
	}

	// -- one unfrozen capture per look: asked for, required in both runs, not judged
	{
		const m = typeof check.captureMatrix === 'function' ? check.captureMatrix({ looks: ['basic-dark', 'nier-light'], screens: ['welcome', 'ready', 'welcome'], variants: ['base', 'quiet'], unfrozen: true }) : [];
		const un = m.filter((e) => e.unfrozen);
		ok('PIXEL-MIX: the matrix asks for one unfrozen capture per look, after the walk', un.length === 2 && un[0].file === '07-welcome-awake-unfrozen' && un[1].look === 'nier-light' && m[6] === un[0], JSON.stringify(un));
		const req = { ...matrix, screens: ['ready'], variants: ['base'], unfrozen: true, expected: [E('basic-dark', '01-ready-base', 'ready', 'base'), { ...E('basic-dark', '02-ready-unfrozen', 'ready', 'unfrozen'), unfrozen: true }] };
		const swayed = (e) => (e.unfrozen ? { a: png(8, 6, () => [runs * 7 % 255, 0, 0]), b: png(8, 6, () => [0, runs * 7 % 255, 0]) } : { a: GREY, b: GREY });
		const r = compare(run({ matrix: req, pics: swayed, dom: (e) => (e.unfrozen ? `<g transform="${runs}">` : '<g>') }), run({ matrix: req, pics: swayed, dom: (e) => (e.unfrozen ? `<g transform="${runs}">` : '<g>') }));
		ok('PIXEL-MIX: unfrozen captures that differ are not judged (exit 0) and are reported', r.code === 0 && /unfrozen 1/.test(r.out) && /not judged/.test(r.out), `exit ${r.code}: ${r.out.trim()}`);
		const r2 = compare(run({ matrix: req }), run({ matrix: req, index: req.expected.slice(0, 1) }));
		ok('PIXEL-MIX: an unfrozen capture missing from the changed run fails (exit 1)', r2.code === 1 && /MISSING basic-dark\/02-ready-unfrozen \(changed/.test(r2.out), `exit ${r2.code}: ${r2.out.trim()}`);
	}

	// -- PM7PERF-STAGEFRAMES-SAMEBUILD-UNFROZEN / R135-F1 / F's H1: a capture whose own two frozen pictures differ in
	// EITHER run was not frozen by the harness, so the pair cannot be pixel-judged. Every could-not-judge row is a
	// failing row (17-MAX-ITEMS.md:63): NOT FROZEN fails the compare always — there is no --strict switch for it and no
	// weaker pass. The OR over the two runs is safe once both sides fail, which is what these cases pin: a frozen RED
	// base against a moving BLUE head (F's OR-hole: 35c2e1745f exited 0 here), a moving base against a frozen head, and
	// a fully frozen equal pair that still passes.
	{
		const RED = [200, 30, 30], BLUE = [30, 30, 200];
		const block = (bx, by, c) => png(8, 6, (x, y) => (x >= bx && x < bx + 5 && y >= by && y < by + 4 ? c : [40, 40, 40]));
		const one = { ...matrix, variants: ['base'], screens: ['ready'], expected: [E('basic-dark', '01-ready-base', 'ready', 'base')] };
		const frozen = (c) => () => ({ a: block(1, 1, c), b: block(1, 1, c) });  // one picture twice: the harness froze it
		const moving = (c) => () => ({ a: block(0, 0, c), b: block(3, 3, c) });   // its own two pictures differ: it did not
		const a = compare(run({ matrix: one, pics: frozen(RED) }), run({ matrix: one, pics: moving(BLUE) }));
		ok('R135-H1: a frozen base against a moving changed run fails (exit 1) with a NOT FROZEN could-not-judge row', a.code === 1 && /^NOT FROZEN basic-dark\/01-ready-base: could not judge/m.test(a.out), `exit ${a.code}: ${a.out.trim()}`);
		ok('R135-H1: the verdict line of that failure names the not-frozen capture and says FAIL', /^VERDICT: FAIL: 1 of 1 captures .*not frozen 1/m.test(a.out), a.out.trim().split('\n').filter((l) => l.startsWith('VERDICT:')).join(' | '));
		const b = compare(run({ matrix: one, pics: moving(RED) }), run({ matrix: one, pics: frozen(RED) }));
		ok('R135-H1: a moving base against a frozen changed run fails (exit 1) with a NOT FROZEN row', b.code === 1 && /^NOT FROZEN basic-dark\/01-ready-base: could not judge/m.test(b.out), `exit ${b.code}: ${b.out.trim()}`);
		const st = compare(run({ matrix: one, pics: frozen(RED) }), run({ matrix: one, pics: moving(BLUE) }), '--strict');
		ok('R135-H1: it is not --strict that fails a not-frozen capture (same exit either way)', st.code === 1 && /^NOT FROZEN basic-dark\/01-ready-base: could not judge/m.test(st.out) && !/NOT FROZEN[^\n]*--strict/.test(st.out), `exit ${st.code}: ${st.out.trim()}`);
		const c = compare(run({ matrix: one, pics: frozen(RED) }), run({ matrix: one, pics: frozen(RED) }));
		ok('R135-H1: a fully frozen equal pair still passes (exit 0), with no NOT FROZEN row', c.code === 0 && /^VERDICT: PASS: every capture equal to one base picture/m.test(c.out) && !/^NOT FROZEN/m.test(c.out), `exit ${c.code}: ${c.out.trim()}`);
		// a level or two of compositor variation in a run's own two pictures is not motion (the threshold is 8 levels)
		const noise = compare(run({ matrix: one, pics: () => ({ a: block(1, 1, RED), b: png(8, 6, (x, y) => (x >= 1 && x < 6 && y >= 1 && y < 5 ? [202, 31, 31] : [41, 40, 40])) }) }), run({ matrix: one, pics: frozen(RED) }));
		ok('R135-H1: compositor-level noise in a run\'s own two pictures is not NOT FROZEN (still a pass)', noise.code === 0 && !/^NOT FROZEN/m.test(noise.out), `exit ${noise.code}: ${noise.out.trim()}`);
		// the DOM is judged on a not-frozen capture too
		const dm = compare(run({ matrix: one, pics: frozen(RED) }), run({ matrix: one, pics: moving(BLUE), dom: () => '<g transform="1">' }));
		ok('R135-H1: the DOM is still judged on a not-frozen capture', dm.code === 1 && /^DOM    basic-dark\/01-ready-base/m.test(dm.out), `exit ${dm.code}: ${dm.out.trim()}`);
	}

	// -- R132-FOLLOWUPS 2: the freeze parks nextBlink/idleNext at 1e9 and THAW never restored them, so the
	// "unfrozen" capture after the walk showed a stage that never blinks and has no idle life, not the stage as a
	// person sees it. THAW must reschedule both as the product itself does (58-rig.js:1249 and :1106).
	{
		const src = fs.readFileSync(CHECK, 'utf8');
		const s = src.indexOf('const THAW ='), e = src.indexOf('// The stage\'s DOM', s);
		ok('R132-2: THAW found in the diagnostic', s >= 0 && e > s, 'no THAW');
		const vm = await import('node:vm');
		const played = [], scales = [], tips = [];
		const st = { t: 40, ps: { nextBlink: 1e9 }, idleNext: 1e9, idleUntil: 5, idleLook: 'up', tip: (x) => tips.push(x) };
		const ctx = vm.createContext({
			window: { __frzA: [{ play: () => played.push(1) }] },
			document: { querySelector: () => ({ __pipStage: st }) },
			O55: { motion: { setTimeScale: (x) => scales.push(x) } }
		});
		vm.runInContext(src.slice(s, e) + '\nTHAW(true);', ctx);
		ok('R132-2: THAW restores the clock and plays the parked animations', scales.includes(1) && played.length === 1, JSON.stringify({ scales, played }));
		ok('R132-2: THAW closes the tip when asked', tips.length === 1 && tips[0] === null, JSON.stringify(tips));
		ok('R132-2: THAW reschedules the blink as the product does (t + 2.2..5.6), not 1e9', st.ps.nextBlink >= 42.2 && st.ps.nextBlink <= 45.6, String(st.ps.nextBlink));
		ok('R132-2: THAW reschedules idle life as the product does (t + 7..13), not 1e9', st.idleNext >= 47 && st.idleNext <= 53, String(st.idleNext));
		ok('R132-2: THAW clears the idle pose', st.idleUntil === 0 && st.idleLook === null, JSON.stringify({ idleUntil: st.idleUntil, idleLook: st.idleLook }));
	}

	// -- the DOM normalisation: ids renamed in order of appearance, colours left as they are
	{
		// a stub of the stage's root as DOM() walks it: nodeType, tagName, attributes, firstChild / nextSibling, data
		const el = (tag, attrs, kids = []) => { const n = { nodeType: 1, tagName: tag, attributes: Object.entries(attrs).map(([name, value]) => ({ name, value })), firstChild: kids[0] || null, nextSibling: null }; kids.forEach((k, i) => { k.nextSibling = kids[i + 1] || null; }); return n; };
		const txt = (data) => ({ nodeType: 3, data, nextSibling: null });
		const stage = (id, fill, stroke) => el('g', { class: 'pst-root' }, [
			el('defs', {}, [el('linearGradient', { id: `${id}grad` }), el('clipPath', { id: `${id}clip` })]),
			el('path', { fill, stroke, 'clip-path': `url(#${id}clip)`, d: 'M0 0L4 4' }),
			el('rect', { fill: `url(#${id}grad)`, style: 'opacity:.5' }),
			el('use', { href: `#${id}clip` }), el('use', { 'xlink:href': `#${id}grad` }),
			el('text', { fill: '#fff' }, [txt('#hashtag')])
		]);
		const domOf = (root) => { globalThis.document = { querySelector: () => ({ __pipStage: { root } }) }; try { return check.DOM(); } finally { delete globalThis.document; } };
		if (typeof check.DOM !== 'function') ok('HEX-AS-ID: the diagnostic exports DOM()', false, 'no DOM export');
		else {
			const a = domOf(stage('pm-a-', '#211F1B', '#F2E8D5')), b = domOf(stage('pm-a-', '#312F2B', '#F2E8D5')), c = domOf(stage('pm-zz9-', '#211F1B', '#F2E8D5'));
			ok('HEX-AS-ID: a fill colour change shows in the DOM', a !== b, 'the two DOMs are the same:\n' + a);
			ok('HEX-AS-ID: literal colours are kept as written', /fill="#211F1B"/.test(a) && /stroke="#F2E8D5"/.test(a) && /fill="#fff"/.test(a), a);
			ok('HEX-AS-ID: id references are still renamed (two builds\' different ids, the same DOM)', a === c, 'ids not renamed alike:\n' + a + '\n---\n' + c);
			ok('HEX-AS-ID: href, xlink:href and url() name the renamed ids', /href="#id\d+"/.test(a) && /xlink:href="#id\d+"/.test(a) && /clip-path="url\(#id\d+\)"/.test(a) && /fill="url\(#id\d+\)"/.test(a), a);
		}
	}
} finally { fs.rmSync(root, { recursive: true, force: true }); }

console.log(failed ? `${failed} case(s) FAILED` : 'all cases pass');
process.exit(failed ? 1 : 0);
