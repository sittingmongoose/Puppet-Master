// Compares two folders written by diagnostics/stage-frames.check.mjs (a base build and a changed one): per capture,
// whether the stage's pixels are the same and whether its DOM is the same, and where they differ.
//   node tools/stage-frames-compare.mjs <base dir> <changed dir> [--json <file>]
// Pixels: the PNGs decoded and compared exactly (RGB); a difference is reported with its pixel count, its largest
// channel step and its bounding box. DOM: the .dom.txt files compared line by line; a difference is reported with its
// first differing line from each side. Exit 0 when every capture of the base is in the changed folder and both are the
// same in every one, 1 otherwise.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

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

function pixels(a, b) {
	if (a.equals(b)) return { same: true, n: 0 };
	const A = png(a), B = png(b);
	if (A.w !== B.w || A.h !== B.h) return { same: false, size: `${A.w}x${A.h} vs ${B.w}x${B.h}` };
	let n = 0, max = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
	for (let i = 0; i < A.w * A.h; i++) {
		const d = Math.max(Math.abs(A.px[i * 3] - B.px[i * 3]), Math.abs(A.px[i * 3 + 1] - B.px[i * 3 + 1]), Math.abs(A.px[i * 3 + 2] - B.px[i * 3 + 2]));
		if (!d) continue;
		n++; max = Math.max(max, d);
		const x = i % A.w, y = (i / A.w) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
	}
	return n ? { same: false, n, max, box: [x0, y0, x1, y1] } : { same: true, n: 0, bytes: 'differ, pixels same' };
}

function dom(a, b) {
	if (a === b) return { same: true };
	const A = a.split('\n'), B = b.split('\n');
	for (let i = 0; i < Math.max(A.length, B.length); i++) if (A[i] !== B[i]) return { same: false, line: i + 1, base: (A[i] || '(end)').trim().slice(0, 240), changed: (B[i] || '(end)').trim().slice(0, 240), lines: `${A.length} vs ${B.length}` };
	return { same: true };
}

const [baseDir, changedDir] = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const jsonAt = process.argv.indexOf('--json'), jsonOut = jsonAt > 0 ? process.argv[jsonAt + 1] : null;
if (!baseDir || !changedDir) { console.error('usage: node tools/stage-frames-compare.mjs <base dir> <changed dir> [--json <file>]'); process.exit(2); }
const index = JSON.parse(fs.readFileSync(path.join(baseDir, 'index.json'), 'utf8'));
const rows = []; let px = 0, dm = 0, missing = 0;
for (const e of index) {
	const a = path.join(baseDir, e.look, e.file), b = path.join(changedDir, e.look, e.file);
	if (!fs.existsSync(b + '.png') || !fs.existsSync(b + '.dom.txt')) { missing++; rows.push({ ...e, missing: true }); continue; }
	const p = pixels(fs.readFileSync(a + '.png'), fs.readFileSync(b + '.png'));
	const d = dom(fs.readFileSync(a + '.dom.txt', 'utf8'), fs.readFileSync(b + '.dom.txt', 'utf8'));
	if (p.same) px++; if (d.same) dm++;
	rows.push({ look: e.look, file: e.file, props: e.props, target: e.target, pixels: p, dom: d });
}
const bad = rows.filter((r) => r.missing || !r.pixels.same || !r.dom.same);
console.log(`${index.length} captures: pixels the same in ${px}, DOM the same in ${dm}, missing ${missing}`);
for (const r of bad) {
	if (r.missing) { console.log(`MISSING ${r.look}/${r.file}`); continue; }
	if (!r.pixels.same) console.log(`PIXELS ${r.look}/${r.file}: ${r.pixels.size || `${r.pixels.n} px differ, up to ${r.pixels.max} a channel, box ${r.pixels.box.join(',')}`}`);
	if (!r.dom.same) console.log(`DOM    ${r.look}/${r.file}: line ${r.dom.line} (${r.dom.lines})\n  base:    ${r.dom.base}\n  changed: ${r.dom.changed}`);
}
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(rows, null, 1));
process.exit(bad.length ? 1 : 0);
