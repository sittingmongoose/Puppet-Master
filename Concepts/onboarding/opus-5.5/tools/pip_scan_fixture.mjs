// Synthetic, lossless films with real frame tags and witness logs, for the FO-30 scanner and gate self-tests (no browser;
// no motion evidence). Two looks: A (red head on grey) and B (blue head on a ground striped with A's red), so a frame of
// B judged by A's colours would pass with its head gone.
//   const { film, log, v } = await makeFixture(dir, 'clean', { dropB: true })
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { FIELDS } from '../../../pm7-tools/browser-check/helpers/pip-witness.mjs';

const F = Object.fromEntries(FIELDS.map((k, i) => [k, i]));
export const W = 400, H = 240, BL = 8, BITS = 20, CELLS = 2 + 2 * BITS;
const HEAD = [200, 120, 56, 56], CTL = [188, 60, 80, 16];
const LOOK = {
	A: { bg: [128, 128, 128], head: [220, 40, 40], ctl: [30, 30, 30], stripe: null },
	B: { bg: [230, 210, 60], head: [40, 60, 220], ctl: [20, 120, 40], stripe: [220, 40, 40] }
};

/* a page script: [{look, cls, why, cal, calPhase, head:'on'|'off', ctl, tag:'ok'|'grey', occl, onFilm}] */
function script(v = {}) {
	const s = [];
	const add = (n, o) => { for (let i = 0; i < n; i++) s.push({ head: 'on', ctl: 'on', tag: 'ok', occl: 0, onFilm: 1, cal: 0, calPhase: 0, cls: 'v', why: '', ...o }); };
	let cal = 0;
	const calibrate = (look) => { cal++; add(30, { look, cal, calPhase: 1 }); add(15, { look, cal, calPhase: 2, cls: 'h', why: 'calibration', head: 'off', ctl: 'off' }); add(30, { look, cal, calPhase: 3 }); };
	add(8, { look: 'A', cls: 'o', why: 'stage closed', head: 'off', ctl: 'off', tag: 'grey' });
	add(20, { look: 'A' }); calibrate('A'); add(40, { look: 'A' }); calibrate('A');
	add(60, { look: 'A' });
	add(10, { look: 'A', occl: 800, head: 'half' });          // the product's bubble over most of the head: not judged
	add(20, { look: 'A' });
	add(14, { look: 'B', cls: 'x', why: 'look cover', head: 'off', ctl: 'off', tag: 'grey' });  // cover: untagged, head gone
	add(20, { look: 'B' });
	if (!v.uncalB) { calibrate('B'); add(40, { look: 'B' }); calibrate('B'); }
	add(120, { look: 'B' });
	add(6, { look: 'B', cls: 'o', why: 'stage closed', tag: 'grey' });
	return s;
}
function paint(buf, x, y, w, h, c) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { const o = (yy * W + xx) * 3; buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; } }
function frame(st, seq, v) {
	const L = LOOK[st.look], buf = Buffer.alloc(W * H * 3);
	paint(buf, 0, 0, W, H, L.bg);
	if (L.stripe) for (let y = 0; y < H; y += 12) paint(buf, 0, y, W, 5, L.stripe);
	const head = v.inseparable && st.look === 'B' ? L.bg : L.head;
	if (st.head === 'on') paint(buf, HEAD[0], HEAD[1], HEAD[2], HEAD[3], head);
	if (st.head === 'half') paint(buf, HEAD[0], HEAD[1] + 45, HEAD[2], HEAD[3] - 45, head);
	if (st.head === 'half') paint(buf, HEAD[0], HEAD[1], HEAD[2], 45, [250, 250, 250]);
	if (st.ctl === 'on') paint(buf, CTL[0], CTL[1], CTL[2], CTL[3], L.ctl);
	paint(buf, 0, 0, CELLS * BL, BL, [128, 128, 128]);
	if (st.tag === 'ok') {
		const bits = [1, 0]; for (let i = 0; i < BITS; i++) bits.push((seq >> i) & 1); for (let i = 0; i < BITS; i++) bits.push(1 - ((seq >> i) & 1));
		bits.forEach((b, i) => paint(buf, i * BL, 0, BL, BL, b ? [255, 255, 255] : [0, 0, 0]));
	}
	return buf;
}
export async function makeFixture(root, name, v = {}) {
	const s = script(v);
	if (v.dropB) { const i = s.findIndex((x, k) => k > 400 && x.look === 'B' && x.cls === 'v' && !x.cal); s[i].head = 'off'; v.dropAt = i + 1; }
	if (v.goneB) { const i = s.findIndex((x, k) => k > 440 && x.look === 'B' && x.cls === 'v' && !x.cal); s[i].head = 'off'; s[i].gone = true; v.dropAt = i + 1; }
	if (v.collapseB) { const i = s.findIndex((x, k) => k > 430 && x.look === 'B' && x.cls === 'v' && !x.cal); s[i].head = 'off'; s[i].ctl = 'off'; s[i].zeroBox = true; v.dropAt = i + 1; }
	if (v.collapseLong) { const i = s.findIndex((x, k) => k > 560 && x.look === 'B' && x.cls === 'v' && !x.cal); for (let k = 0; k < 40; k++) { s[i + k].head = 'off'; s[i + k].zeroBox = true; } v.dropAt = i + 1; }
	if (v.dropCtlA) { const i = s.findIndex((x, k) => k > 230 && x.look === 'A' && x.cls === 'v' && !x.cal && x.occl === 0); s[i].ctl = s[i + 1].ctl = 'off'; v.dropAt = i + 1; }
	if (v.greyB) { const i = s.findIndex((x, k) => k > 420 && x.look === 'B' && x.cls === 'v' && !x.cal); for (let k = 0; k < 3; k++) s[i + k].tag = 'grey'; }
	if (v.skipB) { let k = 0; s.forEach((x, i) => { if (x.look === 'B' && x.cls === 'v' && !x.cal && i > 300 && k++ % 5 === 0) x.onFilm = 0; }); }
	if (v.backwards) v.swap = s.findIndex((x, k) => k > 260 && x.look === 'A' && x.cls === 'v' && !x.cal);
	const film = path.join(root, name + '.nut'), log = path.join(root, name + '.jsonl');
	const enc = spawn('ffmpeg', ['-v', 'error', '-f', 'rawvideo', '-pixel_format', 'rgb24', '-video_size', `${W}x${H}`, '-framerate', '60', '-i', 'pipe:0', '-c:v', 'ffv1', '-y', film], { stdio: ['pipe', 'ignore', 'inherit'] });
	const order = s.map((_, i) => i).filter((i) => s[i].onFilm);
	if (v.backwards) { const a = order.indexOf(v.swap); [order[a], order[a + 1]] = [order[a + 1], order[a]]; }
	for (const i of order) { const ok = enc.stdin.write(frame(s[i], i + 1, v)); if (i === order[40]) enc.stdin.write(frame(s[i], i + 1, v)); /* a repeated frame */ if (!ok) await new Promise((r) => enc.stdin.once('drain', r)); }
	enc.stdin.end();
	assert.equal(await new Promise((r) => enc.on('close', r)), 0);
	const strings = [''], ix = (x) => { let i = strings.indexOf(x); if (i < 0) { i = strings.length; strings.push(x); } return i; };
	const recs = s.map((st, i) => {
		const r = new Array(FIELDS.length).fill(0);
		r[F.seq] = i + 1; r[F.t] = i * 16.7; r[F.look] = ix(st.look === 'A' ? 'look-a' : 'look-b'); r[F.pipTheme] = r[F.look]; r[F.cls] = st.cls; r[F.why] = ix(st.why);
		r[F.cal] = st.cal; r[F.calPhase] = st.calPhase; r[F.label] = ix('selftest'); r[F.screen] = ix('synthetic');
		[r[F.hx], r[F.hy], r[F.hw], r[F.hh]] = HEAD; [r[F.cx], r[F.cy], r[F.cw], r[F.ch]] = CTL;
		if (st.zeroBox) { [r[F.hx], r[F.hy], r[F.hw], r[F.hh]] = [0, 0, 0, 0]; r[F.clipFrac] = 0; }
		r[F.placed] = st.gone ? 0 : 1; r[F.headVis] = r[F.ctlVis] = r[F.strVis] = 1; r[F.opHead] = r[F.opCtl] = r[F.opStr] = 1000; r[F.clipFrac] = st.zeroBox ? 0 : 1000; r[F.occl] = st.occl; r[F.dim] = 1000; r[F.leafArea] = 2000;
		if (st.gone) { r[F.gone] = 1; r[F.why] = ix('Pip missing from the stage'); r[F.clipFrac] = 0; r[F.occl] = 0; r[F.headVis] = r[F.ctlVis] = r[F.strVis] = 0; r[F.opHead] = r[F.opCtl] = r[F.opStr] = 0; }
		return r;
	});
	const header = { kind: 'header', v: 2, fields: FIELDS, dpr: 1, ox: 0, oy: 0, viewport: [W, H], tag: { x: 0, y: 0, block: BL, cells: CELLS, bits: BITS, sync: [1, 0] } };
	const half = recs.length >> 1, s1 = strings.slice(0, 3);
	const lines = [JSON.stringify(header), JSON.stringify({ kind: 'recs', stringsFrom: 0, recs: recs.slice(0, half), strings: s1, cals: [] }), JSON.stringify({ kind: 'recs', stringsFrom: s1.length, recs: recs.slice(half), strings: strings.slice(s1.length), cals: [] })];
	if (v.extraTail) lines[2] = JSON.stringify({ kind: 'recs', stringsFrom: s1.length, recs: recs.slice(half, -v.extraTail), strings: strings.slice(s1.length), cals: [] });
	if (!v.noEnd) lines.push(JSON.stringify({ kind: 'end', count: recs.length - (v.extraTail || 0) }));
	fs.writeFileSync(log, lines.join('\n') + '\n');
	return { film, log, v };
}
