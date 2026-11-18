// The switcher's chip as the page has it after each frame (FO-227 / FO-231 / FO-234, stream F batch 12e).
//
// carry-frames.mjs reads the chip inside a frame callback. A frame callback can run in a frame the main thread began
// before the compositor started a carried block's animation; when the start arrives in that frame, the block's start
// time is later than the frame's own time and the main thread computes it in its before phase, untransformed, at the
// box it is bound for (one tab pitch away: 120 px on Friendly's Home tabs, 31 px on Usage's pages). So this sampler reads
// in a task queued from each frame callback (a MessageChannel message, which runs after the frame's paint), with the
// timeline's own time at the read, and keeps the layout shifts the page reports beside it.
//
// In the page: CHIP_SAMPLER({ strips: [{ sel, active, items }], raf }) installs it (idempotent; raf: 1 also reads inside
// the frame callback, for comparison), CHIP_TAKE() returns { rows, shifts }, CHIP_RESET() empties both.
// Each row: { k: 'task' | 'raf', ts: the frame's time, tl: document.timeline.currentTime at the read, now, s: { [sel]: {
//   chip: [x, y, w, h] the visible chip (a carried or stepped block above the labels, else the lens under them, else a
//   lens in a shared layer over the strip), src: 'carry' | 'hop' | 'lens', rec: the carry record id (carry-frames RECORD),
//   st / ct: the block's transform animation's start time and current time, on: the chosen item's box, items: every
//   item's box } }.
import { poseAt, edges } from './carry-frames.mjs';

export const CHIP_SAMPLER = (opts) => {
	const W = window.__chipSmp || (window.__chipSmp = { rows: [], shifts: [], strips: [], on: true, ids: 0 });
	for (const s of opts.strips) if (!W.strips.some((x) => x.sel === s.sel)) W.strips.push({ sel: s.sel, active: s.active, items: s.items, el: null });
	if (opts.raf) W.raf = true;
	if (W.installed) return true;
	W.installed = true;
	const rr = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
	const shown = (e) => { if (!e.getClientRects().length) return false; const cs = getComputedStyle(e); return +cs.opacity > 0.5 && cs.visibility !== 'hidden'; };
	const stripOf = (s) => (s.el && s.el.isConnected && s.el.getClientRects().length ? s.el : (s.el = [...document.querySelectorAll(s.sel)].find((e) => e.getClientRects().length) || null));
	const leadOf = (b) => b.getAnimations().find((a) => a.effect && a.effect.getTiming().duration > 0 && a.playState !== 'idle') || null;
	const read = (k) => {
		const row = { k, ts: W.ts, tl: document.timeline.currentTime, now: performance.now(), s: {} };
		for (const s of W.strips) {
			const el = stripOf(s); if (!el) continue;
			const sr = el.getBoundingClientRect();
			let chip = null, src = null, rec = null, st = null, ct = null, lenses = 0;
			const blocks = [...el.querySelectorAll(':scope > lg-over > .lg-hop')].filter(shown);
			const b = blocks.pop();
			if (b) {
				chip = rr(b); src = b.classList.contains('lg-carry') ? 'carry' : 'hop'; rec = b.__carryRec != null ? b.__carryRec : null;
				const a = leadOf(b); if (a) { st = a.startTime; ct = a.currentTime; }
			} else {
				const ul = el.querySelector(':scope > lg-under > .lg-lens');
				if (ul && shown(ul)) { chip = rr(ul); src = 'lens'; }
				else {
					// a lens in a shared layer (Glass): the one over this strip, the same element read after read while it is shown
					// over it (followed by identity, never by where it is, so a step of the lens is not mistaken for another lens)
					const over = (q) => q[0] < sr.right && q[0] + q[2] > sr.left && q[1] < sr.bottom && q[1] + q[3] > sr.top;
					const cands = [...document.querySelectorAll('.lg-lens:not(.lg-hop):not(.lg-bead)')].filter((l) => !l.closest('lg-under') && shown(l) && over(rr(l)));
					const keep = s.lensEl && cands.includes(s.lensEl) ? s.lensEl : cands[0] || null;
					s.lensEl = keep;
					if (keep) { chip = rr(keep); src = 'lens'; lenses = cands.length; }
				}
			}
			const on = el.querySelector(s.active);
			const items = s.items ? [...el.querySelectorAll(s.items)].filter((e) => e.getClientRects().length).map(rr) : [];
			row.s[s.sel] = { chip, src, rec, st, ct, on: on ? rr(on) : null, items, so: [sr.left, sr.top], lenses };
		}
		W.rows.push(row);
	};
	const ch = new MessageChannel();
	ch.port1.onmessage = () => { if (W.on) read('task'); };
	const tick = (ts) => { if (!W.on) return; W.ts = ts; if (W.raf) read('raf'); ch.port2.postMessage(0); requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	try {
		new PerformanceObserver((list) => {
			for (const e of list.getEntries()) {
				const src = (e.sources || []).map((x) => ({ node: x.node ? (x.node.id || x.node.className || x.node.nodeName || '').toString().slice(0, 60) : null, prev: x.previousRect ? [x.previousRect.x, x.previousRect.y, x.previousRect.width, x.previousRect.height] : null, cur: x.currentRect ? [x.currentRect.x, x.currentRect.y, x.currentRect.width, x.currentRect.height] : null }));
				W.shifts.push({ t: e.startTime, v: e.value, input: e.hadRecentInput, src });
			}
		}).observe({ type: 'layout-shift', buffered: false });
	} catch (e) { W.shiftErr = String(e); }
	return true;
};
export const CHIP_TAKE = () => { const W = window.__chipSmp; return W ? { rows: W.rows, shifts: W.shifts, shiftErr: W.shiftErr || null } : null; };
export const CHIP_RESET = () => { const W = window.__chipSmp; if (W) { W.rows.length = 0; W.shifts.length = 0; } return true; };

const FRAME = 1000 / 60;
// a block whose start never reached the main thread (it was replaced first) starts, like every block that waits for its
// first frame, at the time of the frame that first drew it less its hold: carry-frames' probe in the same commit
// (where both are known they agree to the 0.1 ms)
const started = (anims) => anims.map((r) => (r.start == null && r.drawnAt != null && !r.explicit ? { ...r, start: r.drawnAt - (r.hold || 0), startFromProbe: true } : r));
const near = (a, b, tol) => a && b && edges(a).every((v, i) => Math.abs(v - edges(b)[i]) <= tol);

// one strip's task reads: { t (timeline time at the read), now, box, src, rec, st, ct, on, items, so: the strip's origin }
export function chipRows(data, sel, kind = 'task') {
	return data.rows.filter((r) => r.k === kind && r.s[sel]).map((r) => ({ t: r.tl, ts: r.ts, now: r.now, ...r.s[sel], box: r.s[sel].chip }));
}
// a box in the strip's own coordinates (the strip can move: Usage's rooms slide in)
const rel = (b, o) => (b && o ? [b[0] - o[0], b[1] - o[1], b[2], b[3]] : b);
// the strip's origin at time t: from the last read at or before t
function originAt(rows, t) { let o = null; for (const r of rows) { if (r.ts > t && o) break; if (r.so) o = r.so; } return o; }

// a read the main thread can vouch for: the lens, or a carried block whose start it already has and whose start is not
// later than the read (a block waiting for its first frame reads at its hold while the compositor already moves it; one
// in its before phase reads untransformed, at the box it is bound for)
export const trusted = (r) => r.box && (r.src !== 'carry' || (r.st != null && r.st <= r.t));

// every frame drawn, on the frame grid the reads give (each read's frame time; frames inside a long task every 1/60 s):
// a carried block from the first frame that draws it (a block that waited for it starts at that frame's time less its
// hold; one given its trip's start time, from the frame after it was made) until the first frame of the block that
// replaced it, or, replaced by none, the frame after it was cancelled; its pose from its keyframes on its own clock (a
// change's keyframes are the trip under way up to where the change starts, so its last keyframes hold at every time).
// Otherwise the chip the read of that frame saw (the lens).
export function drawnFrames(smp, sel, anims0) {
	const anims = started(anims0);
	const rows = smp.rows.filter((r) => r.k === 'task' && r.s[sel]);
	const recs = anims.filter((r) => r.strip === sel && r.start != null).sort((a, b) => a.created - b.created);
	const after = (t) => { const r = rows.find((x) => x.ts > t); return r ? r.ts : Infinity; };
	// (drawnAt: the frame that first drew the block's commit, from carry-frames' probe)
	const D = new Map(recs.map((r) => [r, r.drawnAt != null ? r.drawnAt : r.explicit ? after(r.created) : r.start + (r.hold || 0)]));
	const replaced = new Set(recs.filter((r, i) => r.cancelled != null && recs[i + 1] && recs[i + 1].created - r.cancelled <= 200 && recs[i + 1].created >= r.cancelled - 0.5));
	const ts = [...new Set(rows.map((r) => r.ts))].sort((a, b) => a - b), byTs = new Map(rows.map((r) => [r.ts, r]));
	// a block's keyframes place it from its box when it was made, in the strip as it was then
	const sr = rows.map((r) => ({ ts: r.now, so: r.s[sel].so }));
	const originOf = (rec) => originAt(sr, rec.created);
	const grid = [];
	ts.forEach((T, i) => { if (i) for (let u = ts[i - 1] + FRAME; u < T - FRAME / 2; u += FRAME) grid.push(u); grid.push(T); });
	const out = [];
	for (const T of grid) {
		let cur = null;
		for (const r of recs) if (D.get(r) <= T + 0.01 && (!cur || D.get(r) >= D.get(cur))) cur = r;
		if (cur && cur.cancelled != null && !replaced.has(cur) && T >= after(cur.cancelled)) cur = null;
		// a change is drawn from the frame that first drew its commit (rebDrawn); before that, the frames it replaced
		const early = cur && cur.rebDrawn != null && T < cur.rebDrawn - 0.01 && cur.kfPrev;
		if (cur) { const b = poseAt(early ? { ...cur, kf: cur.kfPrev, dur: cur.durPrev } : cur, T); if (b) { out.push({ t: T, box: rel(b, originOf(cur)), src: 'rec:' + cur.id, rec: cur }); continue; } }
		const row = byTs.get(T), x = row && row.s[sel];
		if (x && x.chip && x.src !== 'carry') out.push({ t: T, box: rel(x.chip, x.so), src: x.src, rec: null });
	}
	return out;
}

// the rebuild against the page: where a read can vouch for a carried block, its box against its keyframes at the read's time
export function modelWitness(smp, sel, anims) {
	let worst = 0, n = 0;
	for (const r of chipRows(smp, sel)) {
		if (r.src !== 'carry' || r.rec == null || !trusted(r)) continue;
		const rec = anims.find((a) => a.id === r.rec && a.strip === sel); if (!rec || rec.start == null) continue;
		const m0 = poseAt(rec, r.t); if (!m0) continue;
		const all = chipRows(smp, sel).map((x) => ({ ts: x.now, so: x.so }));
		const m = rel(m0, originAt(all, rec.created)), b = rel(r.box, r.so);
		n++; worst = Math.max(worst, ...edges(m).map((v, i) => Math.abs(v - edges(b)[i])));
	}
	return { worst: +worst.toFixed(2), n };
}

// an edge that goes out and comes back within two reads (each under maxGap ms apart): out and back by more than tol each
// way, ending nearer where it started than either move (ratio of the smaller move)
export function spikes(rows, { tol = 6, ratio = 0.3, maxGap = 40 } = {}) {
	const out = [];
	const R = rows.filter(trusted);
	for (let i = 1; i < R.length - 1; i++) {
		const a = R[i - 1], b = R[i], c = R[i + 1];
		if (b.t - a.t > maxGap || c.t - b.t > maxGap) continue;
		const ea = edges(rel(a.box, a.so)), eb = edges(rel(b.box, b.so)), ec = edges(rel(c.box, c.so));
		for (let k = 0; k < 4; k++) {
			const d1 = eb[k] - ea[k], d2 = ec[k] - eb[k], d3 = ec[k] - ea[k], m = Math.min(Math.abs(d1), Math.abs(d2));
			if (Math.sign(d1) !== Math.sign(d2) && m > tol && Math.abs(d3) < ratio * m) { out.push({ t: +b.t.toFixed(1), edge: k, out: +d1.toFixed(2), back: +d2.toFixed(2), src: `${a.src}${a.rec ?? ''}>${b.src}${b.rec ?? ''}>${c.src}${c.rec ?? ''}` }); break; }
		}
	}
	return out;
}

// a carried block that takes over from another (a press while the chip moves, or its tab resized under it) draws the
// trip under way where the block it replaced would have drawn it, at every frame from its first: its first keyframes
// (the trip under way, before its change) on its own clock, against the replaced block's last keyframes on that block's
// clock. A block whose start the page set (on the trip's clock) is judged from the moment it was made; one that waited
// for its first frame from the time the compositor reports for that frame (its start plus its hold) on.
export function takeovers(anims0, sel, { span = 100 } = {}) {
	const recs = started(anims0).filter((r) => r.strip === sel).sort((a, b) => a.created - b.created);
	const out = [];
	for (const n of recs) {
		if (n.start == null || !n.kf0) continue;
		// the block it replaced: the one made before it and cancelled for it (the carry measures and copies the labels
		// between the two, 12 ms and more)
		const i = recs.indexOf(n), p = i > 0 ? recs[i - 1] : null;
		if (!p || p.cancelled == null || p.start == null || p.cancelled > n.created + 0.5 || n.created - p.cancelled > 200) continue;
		if (!p) continue;
		const goes = n.explicit || n.hold != null;   // a block that goes on with a trip (carry's go)
		const first = n.drawnAt != null ? n.drawnAt : n.explicit ? n.created : n.start + (n.hold || 0);
		const last = Math.min(first + span, n.rebDrawn != null ? n.rebDrawn : n.rebTl != null ? n.rebTl : Infinity, n.cancelled != null ? n.cancelled : Infinity);
		const n0 = { ...n, kf: n.kf0, dur: n.dur0 };
		let worst = 0, at = first;
		const T1 = goes ? Math.max(first, last) : first;
		for (let T = first; T <= T1; T += 1) {
			const a = poseAt(p, T), b = poseAt(n0, T); if (!a || !b) continue;
			const e = Math.max(...edges(a).map((v, i) => Math.abs(v - edges(b)[i])));
			if (e > worst) { worst = e; at = T; }
		}
		out.push({ id: n.id, from: p.id, goes, explicit: !!n.explicit, lagMs: !n.explicit && n.hold != null ? +(n.start + n.hold - n.created).toFixed(1) : 0, worst: +worst.toFixed(2), at: +at.toFixed(1) });
	}
	return out;
}

// when a block's change (glass.js carry's change: a retarget or a new trip blended into the trip under way) starts on
// screen, against the moment it was committed (the page's clock when its keyframes were set): the last keyframe that
// still draws the trip under way, minus that moment. Keyframes sit a frame apart, so a change that starts when it is
// committed has its last unchanged keyframe at most a frame later (its first changed one can round to unchanged)
export function changeStarts(anims, sel) {
	const out = [];
	for (const r of anims.filter((x) => x.strip === sel && x.rebTl != null && x.start != null && x.kf0)) {
		let lastSame = null;
		for (const k of r.kf) {
			const T = r.start + k.o * r.dur;
			const o0 = Math.max(0, Math.min(1, (T - r.start) / r.dur0)), kf = r.kf0;
			let i = 1; while (i < kf.length - 1 && kf[i].o < o0) i++;
			const a = kf[i - 1], b = kf[i], u = b.o > a.o ? Math.max(0, Math.min(1, (o0 - a.o) / (b.o - a.o))) : 1, L = (q) => a[q] + (b[q] - a[q]) * u;
			const same = Math.abs(k.dx - L('dx')) <= 0.006 && Math.abs(k.dy - L('dy')) <= 0.006 && Math.abs(k.kx - L('kx')) <= 0.00015 && Math.abs(k.ky - L('ky')) <= 0.00015 && Math.abs(k.r - L('r')) <= 0.0015;
			if (!same) break;
			lastSame = T;
		}
		if (lastSame == null) continue;
		const at = r.rebased != null ? r.rebased : r.rebTl;
		out.push({ id: r.id, commit: +at.toFixed(1), frame: +r.rebTl.toFixed(1), drawn: r.rebDrawn != null ? +r.rebDrawn.toFixed(1) : null, lastSame: +lastSame.toFixed(1), late: +(lastSame - at).toFixed(1) });
	}
	return out;
}

// under Reduce Motion the chip is only ever on an item (one the strip shows in that read or the one before), never
// between two
export function offItems(rows, { tol = 2 } = {}) {
	const out = [];
	for (let i = 0; i < rows.length; i++) {
		const r = rows[i]; if (!r.box) continue;
		const boxes = [...(r.items || []), ...((rows[i - 1] && rows[i - 1].items) || [])];
		if (!boxes.length) continue;
		// a lens has the strip's padding round its item: judged by its centre and size against the item's
		const c = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
		const ok = boxes.some((b) => { const p = c(b), q = c(r.box); return Math.abs(p[0] - q[0]) <= tol + 4 && Math.abs(p[1] - q[1]) <= tol + 4; });
		if (!ok) out.push({ t: +r.t.toFixed(1), box: r.box.map((v) => +v.toFixed(1)), src: r.src });
	}
	return out;
}

// layout shifts whose sources lie in the strip's box
export function stripShifts(shifts, stripBox) {
	if (!stripBox) return [];
	const [x, y, w, h] = stripBox;
	const inside = (q) => q && q[0] < x + w && q[0] + q[2] > x && q[1] < y + h && q[1] + q[3] > y;
	return shifts.filter((s) => s.src.some((q) => inside(q.prev) || inside(q.cur)));
}
export { near, FRAME };
