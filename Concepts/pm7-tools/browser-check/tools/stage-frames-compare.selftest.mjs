// tools/stage-frames-compare.mjs and diagnostics/stage-frames.check.mjs on constructed run folders and a stub stage.
//   node tools/stage-frames-compare.selftest.mjs [--compare <stage-frames-compare.mjs>] [--check <stage-frames.check.mjs>]
// (the two options point the cases at another copy of either file, for a red run against an older one)
// PM7PERF-STAGEFRAMES-EMPTY-INDEX: an empty base index, or one that lacks part of what the run was asked for, compared
// as "0 captures" or as the part it had, with exit 0. The compare now refuses an empty index (exit 2) and judges the
// run's capture matrix (<out>/matrix.json, written by the diagnostic): every requested look x screen x variant must be
// in both runs' indexes and on disk, and both runs must have been asked for the same thing.
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
		ok('EMPTY-INDEX: the summary names the matrix it checked', /4 captures/.test(r.out) && /matrix/i.test(r.out), r.out.trim());
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
} finally { fs.rmSync(root, { recursive: true, force: true }); }

console.log(failed ? `${failed} case(s) FAILED` : 'all cases pass');
process.exit(failed ? 1 : 0);
