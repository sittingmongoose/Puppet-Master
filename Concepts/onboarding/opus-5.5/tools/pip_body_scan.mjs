/* FO-30 / FO-43 paint scan: is Pip's head (and its controller) painted in every film frame where the page says it
 * should be, judged against the look that frame shows? Reads a film made by
 * Concepts/pm7-tools/browser-check/checks/pip-steady.check.mjs (--record) and that run's witness log
 * (pip-witness-<surface>.jsonl, written by helpers/pip-witness.mjs).
 *   node tools/pip_body_scan.mjs <film.mp4> --witness <log.jsonl> [--out scan.json] [--counts frames.csv]
 *        [--min-coverage 0.9] [--qbits 4]
 *   node tools/pip_body_scan.mjs <film.mp4> --witness <log.jsonl> --dump 1979,1980 --dir <fresh dir>
 *
 * The model, in order:
 * 1. Every frame is decoded (software, -fps_mode passthrough: frame n is the stream's frame n). Its tag (sync cells,
 *    20 bits and their complements, painted by the page in the same end-of-frame callback that wrote the witness
 *    record) names the page frame it shows. A frame with no valid tag names nothing.
 * 2. Per look, a reference from the page itself: the look's calibration frames (Pip painted / head and controller
 *    hidden by the witness, same look, same place) give the colours, in quantised RGB, that Pip's head adds to its own
 *    box in that look (P >= 4 A in every calibrated context), and so a score for any frame: for the head, how much of
 *    Pip's own mix of those colours its box shows (each colour counted up to its share in the painted calibration
 *    frames: 1 looks like Pip, 0 like its background, a patch of one of Pip's colours only that colour's share); for
 *    the thin controller bar, the share of its box in its colours. The threshold sits 40 % of the way from the hidden
 *    frames' highest score to the painted frames' median. Before it is used it must hold on held-out frames (each
 *    calibration's odd page frames judged by a reference learned from the even ones, and back): every held-out hidden
 *    frame under it and 99 % of held-out painted frames over it, or the look cannot be evaluated. Each calibration
 *    judged by the others alone is reported as well (a context no other covers, such as Pip asleep on the floor).
 * 3. Every film frame whose page frame was declared visible (window open, no look cover or product animation on Pip's
 *    ancestors) is judged with the reference of the look its own record names, and no other: head or controller under
 *    threshold is a missing paint. Where the product's own overlays (bubble, tip, Retro's printer, NieR's HUD) or a
 *    clipping ancestor cover part of the head box (overlays: the controller's box too), the threshold scales with what
 *    is left; under half left, the frame is counted as covered by the product rather than judged.
 * 4. Fail closed: exit 2 when the film or the log cannot be read, no frame carries a tag, a look shown in a visible
 *    frame has no calibration or its reference does not separate painted from hidden, or a visible frame's box lies
 *    outside the decoded area. Exit 1 when any frame misses Pip's paint, when a run of untagged frames hides a page
 *    frame that was visible, when fewer than --min-coverage of a look's visible page frames reach the film, or when a
 *    tag runs backwards. Exit 0 only when every visible page frame that reached the film was judged and painted.
 * --dump writes the named frames' decoded area (tag strip over the stage) as PPM files, for native viewing. */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';

const a = process.argv.slice(2), film = a[0], opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const die = (code, msg, extra = {}) => { const o = { video: film, verdict: 'cannot-evaluate', error: msg, ...extra }; console.log(JSON.stringify(o)); if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(o, null, 1) + '\n'); process.exit(code); };
if (!film || !opt('witness')) { console.error('usage: node pip_body_scan.mjs <film.mp4> --witness <pip-witness.jsonl> [--out scan.json] [--counts csv] [--min-coverage 0.9] [--qbits 4] [--dump n,n --dir d]'); process.exit(2); }
if (!fs.existsSync(film)) die(2, 'film missing');
let W;
try { W = readLog(fs.readFileSync(opt('witness'), 'utf8')); } catch (e) { die(2, `witness log unreadable: ${e.message}`); }
const { header, recs, strings, F } = W, calLabel = new Map(W.cals.map((c) => [c.id, c.label]));
const S = (i) => (i >= 0 ? strings[i] : '');
const QB = Number(opt('qbits', 4)), QS = 8 - QB, NBIN = 1 << (3 * QB);
const minCoverage = Number(opt('min-coverage', 0.9));

/* film geometry */
const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', film], { encoding: 'utf8' });
let FW, FH;
try { ({ width: FW, height: FH } = JSON.parse(probe.stdout).streams[0]); } catch { die(2, 'ffprobe could not read the film', { stderr: (probe.stderr || '').slice(0, 400), status: probe.status }); }
const tg = header.tag, TW = Math.ceil(tg.cells * tg.block), TH = Math.ceil(tg.block), TX = Math.round(tg.x), TY = Math.round(tg.y);
if (TX < 0 || TY < 0 || TX + TW > FW || TY + TH > FH) die(2, `tag ${TX},${TY} ${TW}x${TH} outside the ${FW}x${FH} film`);
const bySeq = new Map(recs.map((r) => [r[F.seq], r]));
/* Where to look for Pip in each frame. A visible frame whose box collapsed (display:none, a scale to nothing, a box under
   a quarter of its look's usual size) is looked at where its look last had a whole box, up to 30 page frames back: a
   Pip that loses its box loses its paint, and must not be excused as too small to judge. No such box: the frame counts
   as missing paint. */
const PARTS = { head: ['hx', 'hy', 'hw', 'hh'], ctl: ['cx', 'cy', 'cw', 'ch'] };
const boxAt = new Map();
{
	const usual = {}, med = (a) => { const t = [...a].sort((x, y) => x - y); return t[t.length >> 1] || 0; };
	for (const part in PARTS) { const by = {}; for (const r of recs) if (r[F.cls] === 'v' || r[F.cls] === 'h') (by[r[F.look]] ||= []).push(r[F[PARTS[part][2]]] * r[F[PARTS[part][3]]]); usual[part] = Object.fromEntries(Object.entries(by).map(([k, a]) => [k, med(a)])); }
	const last = {};
	for (const r of recs) {
		if (r[F.cls] !== 'v' && r[F.cls] !== 'h') continue;
		const at = {};
		for (const part in PARTS) {
			const [x, y, w, h] = PARTS[part].map((k) => r[F[k]]), key = `${part}:${r[F.look]}`, whole = w >= 6 && h >= 6 && w * h >= 0.25 * (usual[part][r[F.look]] || 0);
			if (whole) { at[part] = { box: [x, y, w, h] }; last[key] = { box: [x, y, w, h], seq: r[F.seq] }; }
			else at[part] = last[key] && r[F.seq] - last[key].seq <= 30 ? { box: last[key].box, collapsed: true } : { collapsed: true, none: true };
		}
		boxAt.set(r[F.seq], at);
	}
}
/* the decoded area: every box of a visible or calibration frame, padded */
let ux0 = Infinity, uy0 = Infinity, ux1 = -Infinity, uy1 = -Infinity;
for (const r of recs) if ((r[F.cls] === 'v' || r[F.cls] === 'h') && r[F.hw] > 0) for (const [x, y, w, h] of [[r[F.hx], r[F.hy], r[F.hw], r[F.hh]], [r[F.cx], r[F.cy], r[F.cw], r[F.ch]]]) { if (w <= 0 || h <= 0) continue; ux0 = Math.min(ux0, x); uy0 = Math.min(uy0, y); ux1 = Math.max(ux1, x + w); uy1 = Math.max(uy1, y + h); }
if (!Number.isFinite(ux0)) die(2, 'the witness has no visible frame with a box');
ux0 = Math.max(0, Math.floor(ux0) - 6); uy0 = Math.max(0, Math.floor(uy0) - 6); ux1 = Math.min(FW, Math.ceil(ux1) + 6); uy1 = Math.min(FH, Math.ceil(uy1) + 6);
const UW = ux1 - ux0, UH = uy1 - uy0, PW = Math.max(TW, UW), FR = PW * (TH + UH) * 3;
const graph = `[0:v]format=rgb24,split=2[a][b];[a]crop=${TW}:${TH}:${TX}:${TY},pad=${PW}:${TH}:0:0[t];[b]crop=${UW}:${UH}:${ux0}:${uy0},pad=${PW}:${UH}:0:0[u];[t][u]vstack=inputs=2[o]`;

/* --dump: write the decoded area of some frames, same decode and numbering */
const dump = opt('dump') ? new Set(opt('dump').split(',').map(Number)) : null, dir = opt('dir');
if (dump && !dir) die(2, '--dump needs --dir <fresh directory>');
if (dump) fs.mkdirSync(dir, { recursive: true });
const last = dump ? Math.max(...dump) : Infinity;

const ff = spawn('ffmpeg', ['-v', 'error', '-i', film, '-filter_complex', graph, '-map', '[o]', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { stdio: ['ignore', 'pipe', 'pipe'] });
let ffErr = '';
ff.stderr.on('data', (d) => { if (ffErr.length < 4000) ffErr += d; });
let buf = Buffer.alloc(0), n = 0, stopped = false;
const frames = [];          // per film frame: { seq | null, head: {bins, counts, px} | null, ctl, ... }
const hist = new Uint32Array(NBIN);
const region = (fr, x, y, w, h) => {
	/* the box, in decoded-area coordinates; null when it is not wholly inside */
	const rx = Math.round(x) - ux0, ry = Math.round(y) - uy0 + TH, rw = Math.round(w), rh = Math.round(h);
	if (rw < 6 || rh < 6) return { tiny: true };
	if (rx < 0 || ry < TH || rx + rw > UW || ry + rh > TH + UH) return { outside: true };
	const touched = [];
	for (let yy = ry; yy < ry + rh; yy++) {
		let o = (yy * PW + rx) * 3;
		for (let xx = 0; xx < rw; xx++, o += 3) { const b = ((fr[o] >> QS) << (2 * QB)) | ((fr[o + 1] >> QS) << QB) | (fr[o + 2] >> QS); if (!hist[b]++) touched.push(b); }
	}
	const bins = new Uint16Array(touched.length), counts = new Uint32Array(touched.length);
	touched.forEach((b, i) => { bins[i] = b; counts[i] = hist[b]; hist[b] = 0; });
	return { bins, counts, px: rw * rh };
};
const readTag = (fr) => {
	const B = tg.block, lum = (i) => {
		const x0 = Math.round(i * B + B / 4), y0 = Math.round(B / 4), s = Math.max(1, Math.round(B / 2));
		let sum = 0; for (let y = y0; y < y0 + s; y++) for (let x = x0; x < x0 + s; x++) { const o = (y * PW + x) * 3; sum += 0.299 * fr[o] + 0.587 * fr[o + 1] + 0.114 * fr[o + 2]; }
		return sum / (s * s);
	};
	const bit = (i) => { const l = lum(i); return l > 168 ? 1 : l < 88 ? 0 : -1; };
	if (bit(0) !== 1 || bit(1) !== 0) return null;
	let seq = 0;
	for (let i = 0; i < tg.bits; i++) { const b = bit(2 + i), c = bit(2 + tg.bits + i); if (b < 0 || c < 0 || b === c) return null; seq |= b << i; }
	return seq;
};
ff.stdout.on('data', (d) => {
	if (stopped) return;
	buf = buf.length ? Buffer.concat([buf, d]) : d;
	while (buf.length >= FR) {
		const fr = buf.subarray(0, FR);
		if (dump) { if (dump.has(n)) fs.writeFileSync(`${dir}/f${String(n).padStart(6, '0')}.ppm`, Buffer.concat([Buffer.from(`P6\n${PW} ${TH + UH}\n255\n`), fr])); }
		else {
			const seq = readTag(fr), r = seq != null ? bySeq.get(seq) : null, e = { seq: r ? seq : null, raw: seq };
			if (r && (r[F.cls] === 'v' || r[F.cls] === 'h')) {
				const at = boxAt.get(seq);
				for (const part in PARTS) { const b = at[part]; e[part] = b.none ? { none: true } : { ...region(fr, ...b.box), collapsed: !!b.collapsed }; }
			}
			frames.push(e);
		}
		buf = buf.subarray(FR); n++;
		if (n > last) { stopped = true; ff.kill(); return; }
	}
});
ff.on('error', (error) => die(2, `decoder could not start: ${error.message}`));
ff.on('close', (code, signal) => {
	if ((!stopped && (code !== 0 || signal)) || !n || (!stopped && buf.length)) die(2, 'incomplete or failed decode', { code, signal, frames: n, trailingBytes: buf.length, stderr: ffErr.slice(0, 600) });
	if (dump) { console.log(JSON.stringify({ video: film, dumped: [...dump].filter((k) => k < n), dir, layout: { tag: [TX, TY, TW, TH], area: [ux0, uy0, UW, UH], width: PW } })); return; }
	judge();
});

function judge() {
	const tagged = frames.filter((e) => e.raw != null).length;
	if (!tagged) die(2, 'no film frame carries a readable tag (wrong film, offset or a page without the witness)', { frames: frames.length });
	const unknown = frames.filter((e) => e.raw != null && e.seq == null).length;
	/* references, per look */
	const frac = (h) => { const m = new Map(); for (let i = 0; i < h.bins.length; i++) m.set(h.bins[i], h.counts[i] / h.px); return m; };
	/* a colour is Pip's in a look when it is at least 4 times as common in the painted box as in the hidden box of every
	   context (calibration) of that look: hanging on Welcome, asleep on the floor, on each screen */
	const learn = (P, A) => {
		const pb = new Map(), ab = new Map(), groups = new Map();
		for (const i of P) for (const [b, v] of frac(i.h)) pb.set(b, (pb.get(b) || 0) + v / P.length);
		for (const i of A) { if (!groups.has(i.id)) groups.set(i.id, []); groups.get(i.id).push(i.h); }
		for (const g of groups.values()) { const m = new Map(); for (const h of g) for (const [b, v] of frac(h)) m.set(b, (m.get(b) || 0) + v / g.length); for (const [b, v] of m) ab.set(b, Math.max(ab.get(b) || 0, v)); }
		const D = new Map(); for (const [b, v] of pb) if (v >= 0.002 && v >= 4 * (ab.get(b) || 0) + 0.002) D.set(b, v);
		D.total = [...D.values()].reduce((x, y) => x + y, 0);
		return D;
	};
	/* how much of Pip's own mix of colours the box shows: each of Pip's colours counts up to its share in the look's
	   painted calibration frames (a histogram intersection over Pip's colours, 1 for a box that looks like Pip, 0 for
	   its background). A box filled with one of Pip's colours scores only that colour's share, so a patch in Pip's
	   colour cannot stand in for Pip */
	const intersect = (D, h) => { if (!D.total) return 0; let s = 0; for (let i = 0; i < h.bins.length; i++) { const w = D.get(h.bins[i]); if (w !== undefined) s += Math.min(w, h.counts[i] / h.px); } return s / D.total; };
	/* the controller is a thin bar whose box it fills more or less as it swings: the plain share of its colours in the
	   box is the steadier measure there (a fast swing took the intersection to 0.34 against 0.38, the share stayed 0.55) */
	const share = (D, h) => { let s = 0; for (let i = 0; i < h.bins.length; i++) if (D.has(h.bins[i])) s += h.counts[i]; return s / h.px; };
	let part = 'head';
	const score = (D, h) => (part === 'head' ? intersect(D, h) : share(D, h));
	const q = (arr, p) => { const s = [...arr].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.floor(p * (s.length - 1))))] : NaN; };
	const fit = (P, A, D) => { const sp = P.map((i) => score(D, i.h)), sa = A.map((i) => score(D, i.h)); const pm = q(sp, 0.5), am = Math.max(...sa); return { pm, am, p01: q(sp, 0.01), thr: am + 0.4 * (pm - am) }; };
	const test = (trP, trA, teP, teA) => { const D = learn(trP, trA), m = fit(trP, trA, D); return { painted: teP.length, paintedUnder: teP.filter((i) => score(D, i.h) < m.thr).length, hidden: teA.length, hiddenOver: teA.filter((i) => score(D, i.h) >= m.thr).length }; };
	/* calibration frames per look, one per page frame */
	const cal = new Map();
	const seen = new Set();
	for (const e of frames) {
		if (e.seq == null || seen.has(e.seq)) continue;
		const r = bySeq.get(e.seq); if (!r[F.cal]) continue;
		seen.add(e.seq);
		const k = S(r[F.look]); if (!cal.has(k)) cal.set(k, []);
		cal.get(k).push({ r, e, id: r[F.cal], hidden: r[F.calPhase] === 2 });
	}
	const refs = {};
	for (const [k, items] of cal) {
		const ref = refs[k] = { calibrations: [...new Set(items.map((i) => i.id))].length, painted: items.filter((i) => !i.hidden).length, hidden: items.filter((i) => i.hidden).length, regions: {} };
		for (part of ['head', 'ctl']) {
			const ok = items.filter((i) => i.e[part] && i.e[part].bins && !i.e[part].collapsed).map((i) => ({ ...i, h: i.e[part] }));
			const P = ok.filter((i) => !i.hidden), A = ok.filter((i) => i.hidden);
			const R = ref.regions[part] = { painted: P.length, hidden: A.length };
			if (P.length < 20 || A.length < 10) { R.error = `too few calibration frames on film (${P.length} painted, ${A.length} hidden)`; continue; }
			/* held out, the gate: every calibration's odd page frames judged by a reference learned from the even ones of
			   every calibration, and the other way round (each context seen, its frames not) */
			const odd = (i) => i.r[F.seq] % 2 === 1, ho = { painted: 0, paintedUnder: 0, hidden: 0, hiddenOver: 0 };
			for (const side of [true, false]) { const t = test(P.filter((i) => odd(i) !== side), A.filter((i) => odd(i) !== side), P.filter((i) => odd(i) === side), A.filter((i) => odd(i) === side)); for (const n in ho) ho[n] += t[n]; }
			/* held out by context, reported: each calibration judged by a reference learned from the others only. A context
			   no other one covers (Pip asleep on the floor) is judged by its own calibration in the final reference */
			const ids = [...new Set(ok.map((i) => i.id))];
			const contexts = ids.length > 1 ? ids.map((id) => ({ calibration: calLabel.get(id) || `#${id}`, ...test(P.filter((i) => i.id !== id), A.filter((i) => i.id !== id), P.filter((i) => i.id === id), A.filter((i) => i.id === id)) })) : [];
			const D = learn(P, A), m = fit(P, A, D);
			Object.assign(R, { colours: D.size, paintedMedian: +m.pm.toFixed(4), hiddenMax: +m.am.toFixed(4), threshold: +m.thr.toFixed(4), paintedP01: +m.p01.toFixed(4), heldOut: ho,
				contextsCoveredOnlyByTheirOwnCalibration: contexts.filter((c) => c.hiddenOver || c.paintedUnder > 0.01 * c.painted).map((c) => `${c.calibration} (${c.hiddenOver}/${c.hidden} hidden over, ${c.paintedUnder}/${c.painted} painted under)`), contexts: contexts.length });
			const pN = ho.painted, aN = ho.hidden, pMiss = ho.paintedUnder, aHit = ho.hiddenOver;
			R.D = D; R.thr = m.thr; R.pm = m.pm; R.am = m.am;
			R.calVis = q(P.map((i) => (part === 'head' ? (i.r[F.clipFrac] / 1000) * (1 - i.r[F.occl] / 1000) : 1 - (i.r[F.occlCtl] || 0) / 1000)), 0.5);
			R.calArea = q(P.map((i) => i.r[part === 'head' ? F.hw : F.cw] * i.r[part === 'head' ? F.hh : F.ch]), 0.5);
			const why = [];
			if (!D.size) why.push('no colour separates Pip from its background');
			if (m.pm < 0.08) why.push(`painted median ${m.pm.toFixed(3)} under 0.08`);
			if (m.am > 0.5 * m.pm) why.push(`hidden max ${m.am.toFixed(3)} over half the painted median ${m.pm.toFixed(3)}`);
			if (m.p01 < m.thr) why.push(`1 % of painted calibration frames under the threshold`);
			if (pN < 10 || aN < 5) why.push(`held-out test too small (${pN} painted, ${aN} hidden)`);
			if (pMiss > 0.01 * pN) why.push(`${pMiss} of ${pN} held-out painted frames under threshold`);
			if (aHit) why.push(`${aHit} of ${aN} held-out hidden frames over threshold`);
			if (why.length) R.error = why.join('; ');
		}
	}
	/* judge every tagged frame by its own look */
	const dips = [], covered = new Map(), out = new Map(), lookStat = {}, unevaluable = new Map(), counts = [];
	const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
	const ls = (k) => (lookStat[k] ||= { visiblePageFrames: 0, observedPageFrames: 0, judgedFilmFrames: 0, missing: 0, coveredByProduct: 0 });
	for (const r of recs) if (r[F.cls] === 'v') ls(S(r[F.look])).visiblePageFrames++;
	const observed = new Set();
	let prevSeq = -1, backwards = 0;
	for (let i = 0; i < frames.length; i++) {
		const e = frames[i];
		if (e.seq == null) { counts.push(`${i},,,`); continue; }
		if (e.seq < prevSeq) backwards++;
		prevSeq = e.seq;
		const r = bySeq.get(e.seq), cls = r[F.cls], k = S(r[F.look]);
		if (cls !== 'v') { bump(out, `${cls}: ${S(r[F.why])}`); counts.push(`${i},${e.seq},${cls},`); continue; }
		const st = ls(k);
		if (!observed.has(e.seq)) { observed.add(e.seq); st.observedPageFrames++; }
		const ref = refs[k], miss = [];
		let judged = false, line = `${i},${e.seq},v,`;
		for (part of ['head', 'ctl']) {
			const R = ref && ref.regions[part], h = e[part];
			if (!R || R.error) { bump(unevaluable, `${k} ${part}: ${!ref ? 'no calibration on film' : R ? R.error : 'no reference'}`); continue; }
			if (!h || h.outside) { bump(unevaluable, `${k} ${part}: box outside the decoded area`); continue; }
			if (h.none) { judged = true; miss.push({ part, collapsed: true, why: 'box collapsed with no whole box in the 30 page frames before' }); continue; }
			if (h.tiny) { bump(unevaluable, `${k} ${part}: box under 6 px`); continue; }
			/* (a collapsed box's own clip and overlay shares say nothing: it is judged whole where Pip last was) */
			/* a missing Pip (its record holds the last box it had, and no clip or overlay share of its own) is judged whole
			   where it was, as is a collapsed box: neither may be excused as covered */
			const whole = h.collapsed || (F.gone !== undefined && r[F.gone]);
			const vis = whole ? 1 : part === 'head' ? (r[F.clipFrac] / 1000) * (1 - r[F.occl] / 1000) : 1 - (r[F.occlCtl] || 0) / 1000, rel = Math.min(1, vis / Math.max(0.05, R.calVis || 1));
			if (rel < 0.5) { bump(covered, `${part} under half visible (product overlay or clip)`); st.coveredByProduct++; continue; }
			const thr = rel >= 0.9 ? R.thr : R.am + 0.4 * (R.pm * rel - R.am), s = score(R.D, h);
			judged = true; line += `${part}=${s.toFixed(4)}/${thr.toFixed(4)} `;
			if (s < thr) miss.push({ part, score: +s.toFixed(4), threshold: +thr.toFixed(4), ...(h.collapsed ? { collapsed: true } : {}) });
		}
		counts.push(line.trim());
		if (judged) st.judgedFilmFrames++;
		if (miss.length) {
			st.missing++;
			const d = dips[dips.length - 1];
			if (d && d.lastFrame === i - 1 && d.look === k) { d.lastFrame = i; d.len++; d.seqs.push(e.seq); d.frames.push(...miss.map((m) => ({ frame: i, ...m }))); }
			else dips.push({ frame: i, lastFrame: i, len: 1, look: k, screen: S(r[F.screen]), label: S(r[F.label]), seqs: [e.seq], frames: miss.map((m) => ({ frame: i, ...m })) });
		}
	}
	/* untagged runs: allowed only where every page frame they hide was declared not visible */
	const hiddenVisible = [];
	let firstTag = frames.findIndex((e) => e.raw != null), lastTag = frames.length - 1 - [...frames].reverse().findIndex((e) => e.raw != null);
	for (let i = firstTag + 1; i < lastTag; i++) {
		if (frames[i].raw != null) continue;
		let j = i; while (j < lastTag && frames[j].raw == null) j++;
		/* the untagged frames show page frames between the tags on either side. They are explained only when every
		   one of them can be a page frame the page declared not visible; a visible page frame of the gap that none of
		   them needs is counted as never filmed (coverage), not as hidden */
		const a0 = frames[i - 1].raw, b0 = frames[j].raw, inGap = [];
		let nonVisible = 0;
		for (let s = Math.min(a0, b0) + 1; s < Math.max(a0, b0); s++) { const r = bySeq.get(s); if (r && r[F.cls] === 'v' && !observed.has(s)) inGap.push(s); else if (r && r[F.cls] !== 'v') nonVisible++; }
		if (a0 === b0 && bySeq.get(a0) && bySeq.get(a0)[F.cls] === 'v') inGap.push(a0);
		if (inGap.length && j - i > nonVisible) hiddenVisible.push({ frames: [i, j - 1], pageFrames: [a0, b0], untagged: j - i, notVisibleInGap: nonVisible, visibleInGap: inGap.length });
		i = j;
	}
	const coverage = {};
	for (const [k, st] of Object.entries(lookStat)) coverage[k] = st.visiblePageFrames ? +(st.observedPageFrames / st.visiblePageFrames).toFixed(4) : null;
	const lowCov = Object.entries(coverage).filter(([, c]) => c != null && c < minCoverage);
	const lookErrors = Object.entries(refs).flatMap(([k, R]) => Object.entries(R.regions).filter(([, x]) => x.error && lookStat[k] && lookStat[k].visiblePageFrames).map(([p, x]) => `${k} ${p}: ${x.error}`));
	const shownLooks = Object.keys(lookStat).filter((k) => lookStat[k].visiblePageFrames);
	const uncal = shownLooks.filter((k) => !refs[k]);
	const cannot = [...(unknown ? [`${unknown} film frames name page frames the witness log does not have`] : []), ...lookErrors, ...uncal.map((k) => `${k}: no calibration on film`), ...[...unevaluable.entries()].map(([k, v]) => `${v} frames: ${k}`)];
	const fails = [];
	if (dips.length) fails.push(`${dips.length} runs of frames with Pip's paint missing`);
	if (hiddenVisible.length) fails.push(`${hiddenVisible.length} runs of untagged frames hide visible page frames`);
	if (lowCov.length) fails.push(`coverage under ${minCoverage}: ${lowCov.map(([k, c]) => `${k} ${c}`).join(', ')}`);
	if (backwards) fails.push(`${backwards} tags run backwards`);
	const verdict = cannot.length ? 'cannot-evaluate' : fails.length ? 'fail' : 'pass';
	const strip = (R) => Object.fromEntries(Object.entries(R).filter(([k]) => !['D', 'thr', 'pm', 'am', 'calVis', 'calArea'].includes(k)));
	const result = {
		video: film, witness: opt('witness'), verdict, frames: frames.length, tagged, unknownTags: unknown, decodedArea: [ux0, uy0, UW, UH], qbits: QB,
		pageFrames: recs.length, visiblePageFrames: recs.filter((r) => r[F.cls] === 'v').length, observedVisiblePageFrames: observed.size, minCoverage, coverage,
		looks: Object.fromEntries(Object.entries(lookStat).map(([k, st]) => [k, { ...st, reference: refs[k] ? { ...refs[k], regions: Object.fromEntries(Object.entries(refs[k].regions).map(([p, R]) => [p, strip(R)])) } : null }])),
		notJudged: Object.fromEntries([...out.entries()].sort((x, y) => y[1] - x[1])), coveredByProduct: Object.fromEntries(covered), cannotEvaluate: cannot, failures: fails,
		dips: dips.map((d) => ({ ...d, seqs: d.seqs.length > 6 ? [...d.seqs.slice(0, 6), '...'] : d.seqs, frames: d.frames.slice(0, 8) })), untaggedVisible: hiddenVisible.slice(0, 20), backwards
	};
	if (opt('counts')) fs.writeFileSync(opt('counts'), 'frame,seq,class,scores\n' + counts.join('\n') + '\n');
	if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(result, null, 1) + '\n');
	console.log(JSON.stringify({ video: film, verdict, frames: frames.length, tagged, visiblePageFrames: result.visiblePageFrames, observedVisiblePageFrames: observed.size, coverage, dips: result.dips.slice(0, 10), failures: fails, cannotEvaluate: cannot.slice(0, 10) }));
	process.exitCode = verdict === 'pass' ? 0 : verdict === 'fail' ? 1 : 2;
}

/* the witness log (helpers/pip-witness.mjs readWitness, repeated here so this tool stands alone) */
function readLog(text) {
	let header = null, end = null;
	const recs = [], strings = [], cals = [];
	for (const line of text.split('\n')) {
		if (!line.trim()) continue;
		const o = JSON.parse(line);
		if (o.kind === 'header') header = o;
		else if (o.kind === 'recs') { for (const r of o.recs) recs.push(r); if (o.cals) cals.push(...o.cals); if (o.strings) { if (o.stringsFrom !== strings.length) throw new Error(`strings out of order at ${o.stringsFrom}`); strings.push(...o.strings); } }
		else if (o.kind === 'end') end = o;
	}
	if (!header) throw new Error('no header');
	if (!end) throw new Error('no end record: the run stopped before the witness was read out');
	if (end.lost) throw new Error(`the page was lost before its last records were read (${end.lost})`);
	if (end.count !== recs.length) throw new Error(`${recs.length} records, the end says ${end.count}`);
	const F = Object.fromEntries(header.fields.map((k, i) => [k, i]));
	for (let i = 1; i < recs.length; i++) if (recs[i][F.seq] !== recs[i - 1][F.seq] + 1) throw new Error(`records skip from ${recs[i - 1][F.seq]} to ${recs[i][F.seq]}`);
	if (!recs.length) throw new Error('no records');
	return { header, recs, strings: strings.length ? strings : end.strings || [], cals, F };
}
