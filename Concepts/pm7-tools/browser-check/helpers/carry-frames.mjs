// The switcher's chip, frame by frame, as the compositor draws it (FO-195 / FO-197, Jared 2026-11-13: "it almost jumps
// twice ... film it at 60fps and watch it back frame by frame").
//
// A carried chip (Friendly's hop, Basic's snap) is a block whose transform is keyframed every 1/60 s and runs on the
// compositor, so it keeps moving while the app's click holds the main thread for 200-700 ms; a rAF probe sees nothing in
// that window, and the jump Jared saw (the block rebuilt at a new place after the app chose the tab) happens exactly at
// its end. So the page records each carry animation as it is made (its keyframes, its block's box, when it started on the
// animation clock and when it was cancelled), and every rAF frame records the chip it can see (the block's own rect, or
// the chip under the labels once the block has gone). frames() then rebuilds every 60 Hz frame of the run: a rAF frame as
// sampled, and the frames inside a long task from the live block's keyframes, which is what the compositor drew.
//
// steps() judges each step from one drawn frame to the next by the chip's own speed at that moment: an edge may move no
// further than the faster of the two drawn sources moves in that time (its keyframes' own speed; 0 for the chip at rest),
// plus a small tolerance. A rebuild that puts the block somewhere else, or a landed block replaced by the chip at another
// box, moves an edge further than the motion itself does in that frame, and fails.

// in the page (the app's frame): install the recorder for one strip selector; idempotent per strip
export const RECORD = (stripSel) => {
	const W = window.__carryRec || (window.__carryRec = { anims: [], samples: [], strips: [], on: true });
	if (!W.patched) {
		W.patched = true;
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (kf, timing) {
			const a = animate.call(this, kf, timing);
			try {
				if (W.on && this.classList && this.classList.contains('lg-carry') && Array.isArray(kf) && kf.length && kf[0].transform) {
					const strip = W.strips.find((s) => s.el && s.el.contains(this));
					const par = this.parentElement, pr = par.getBoundingClientRect(), st = this.style;
					const num = (re, s) => { const m = re.exec(s || ''); return m ? m.slice(1).map(Number) : null; };
					const rec = {
						id: W.anims.length, strip: strip ? strip.sel : null, created: performance.now(), dur: typeof timing === 'number' ? timing : timing.duration, fill: typeof timing === 'object' ? timing.fill || 'none' : 'none',
						box: { x: pr.left + par.clientLeft + parseFloat(st.left), y: pr.top + par.clientTop + parseFloat(st.top), w: parseFloat(st.width), h: parseFloat(st.height) },
						kf: null, start: null, cancelled: null, rebased: null, explicit: false
					};
					const parse = (list) => list.map((k) => {
						const tr = num(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/, k.transform) || [0, 0], ro = num(/rotate\(([-\d.]+)deg\)/, k.transform) || [0], sc = num(/scale\(([-\d.]+),\s*([-\d.]+)\)/, k.transform) || [1, 1];
						return { o: k.offset, dx: tr[0], dy: tr[1], r: ro[0], kx: sc[0], ky: sc[1] };
					});
					rec.kf = parse(kf);
					// a block whose trip is rebased at its first frame (glass.js carry's rebase) takes new keyframes and timing
					const eff = a.effect, sk = eff.setKeyframes, ut = eff.updateTiming;
					eff.setKeyframes = function (k) { rec.kf = parse(k); rec.rebased = performance.now(); return sk.call(eff, k); };
					eff.updateTiming = function (tm) { if (tm && tm.duration != null) rec.dur = tm.duration; return ut.call(eff, tm); };
					// a start time the page sets itself (glass.js carry's go) puts the animation in its before phase until then
					const stDesc = Object.getOwnPropertyDescriptor(Animation.prototype, 'startTime');
					Object.defineProperty(a, 'startTime', { configurable: true, get() { return stDesc.get.call(a); }, set(v) { rec.explicit = true; stDesc.set.call(a, v); } });
					// a waiting animation is drawn at its hold (its current time) until it starts
					const ctDesc = Object.getOwnPropertyDescriptor(Animation.prototype, 'currentTime');
					Object.defineProperty(a, 'currentTime', { configurable: true, get() { return ctDesc.get.call(a); }, set(v) { if (a.startTime == null) { rec.hold = v; rec.held = performance.now(); } ctDesc.set.call(a, v); } });
					W.live = W.live || new Map(); W.live.set(rec.id, a);
					const cancel = a.cancel;
					a.cancel = function () { if (a.startTime != null) rec.start = a.startTime; if (rec.cancelled == null) rec.cancelled = performance.now(); return cancel.call(a); };
					W.anims.push(rec);
				}
			} catch (e) { /* recording must never break the page */ }
			return a;
		};
		const tick = (ts) => {
			if (!W.on) return;
			if (W.live) W.live.forEach((a, id) => { const r = W.anims[id]; if (a.startTime != null) r.start = a.startTime; if (r.cancelled != null || a.playState === 'finished') W.live.delete(id); });
			const row = { t: ts, now: performance.now(), s: {} };
			W.strips.forEach((s) => {
				const el = s.el && s.el.isConnected ? s.el : (s.el = [...document.querySelectorAll(s.sel)].find((e) => e.getClientRects().length));
				if (!el) return;
				const rr = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
				const block = [...el.querySelectorAll(':scope > lg-over > .lg-carry')].pop();
				const lens = el.querySelector(':scope > lg-under > .lg-lens');
				const on = el.querySelector(s.active);
				row.s[s.sel] = {
					block: block ? rr(block) : null,
					lens: lens ? rr(lens) : null, lensOp: lens ? +getComputedStyle(lens).opacity : 0,
					on: on ? (on.getAttribute('data-tab') || on.textContent.trim().slice(0, 24)) : null, onBox: on ? rr(on) : null
				};
			});
			W.samples.push(row);
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}
	if (!W.strips.some((s) => s.sel === stripSel.sel)) W.strips.push({ sel: stripSel.sel, active: stripSel.active, el: null });
	return true;
};

// in the page: take the record so far (and keep recording); the Animation objects stay in the page
export const TAKE = () => {
	const W = window.__carryRec; if (!W) return null;
	if (W.live) W.live.forEach((a, id) => { const r = W.anims[id]; if (r.start == null && a.startTime != null) r.start = a.startTime; });
	return { anims: W.anims, samples: W.samples };
};
export const RESET = () => { const W = window.__carryRec; if (W) { W.anims.length = 0; W.samples.length = 0; } return true; };

const FRAME = 1000 / 60;
// a start the page set itself, with nothing filled backwards: before it, the block is drawn untransformed
// (records made before rec.explicit existed: a start at or before the block was made, or at or before its rebase, was set
// by the page; a block that waits for its first frame starts after both)
const beforeBare = (rec) => (rec.explicit != null ? rec.explicit : rec.start <= rec.created + 0.5 || (rec.rebased != null && rec.start <= rec.rebased + 1)) && !/both|backwards/.test(rec.fill || 'forwards');
// a carry animation's drawn box (viewport px, axis-aligned, rotation included) at timeline time T; null before it starts
function poseAt(rec, T) {
	if (rec.start == null) return null;
	// before its start time an animation filled only forwards has no effect: the block is drawn at its own box, untransformed
	// (an explicit start time later than the frame drawn: two frames of the block on the tab it was bound for, head film)
	// (a pending animation is drawn at its first keyframe, or its hold, until it starts)
	if (T < rec.start && beforeBare(rec)) return [rec.box.x, rec.box.y, rec.box.w, rec.box.h];
	const o = Math.max(0, Math.min(1, (T < rec.start ? rec.hold || 0 : T - rec.start) / rec.dur)), kf = rec.kf;
	let i = 1; while (i < kf.length - 1 && kf[i].o < o) i++;
	const a = kf[i - 1], b = kf[i], u = b.o > a.o ? Math.max(0, Math.min(1, (o - a.o) / (b.o - a.o))) : 1;
	const L = (k) => a[k] + (b[k] - a[k]) * u;
	const B = rec.box, W = B.w * L('kx'), H = B.h * L('ky'), r = Math.abs(L('r')) * Math.PI / 180;
	const cx = B.x + B.w / 2 + L('dx'), cy = B.y + B.h / 2 + L('dy'), AW = W * Math.cos(r) + H * Math.sin(r), AH = W * Math.sin(r) + H * Math.cos(r);
	return [cx - AW / 2, cy - AH / 2, AW, AH];
}
const edges = (b) => (b ? [b[0], b[1], b[0] + b[2], b[1] + b[3]] : null);
// px per ms of an edge of a carry at T, from its keyframes (the speed the compositor draws it at)
function speedAt(rec, T) {
	const p = poseAt(rec, T), q = poseAt(rec, T + 4);
	if (!p || !q) return 0;
	const e = edges(p), f = edges(q);
	return Math.max(...e.map((v, i) => Math.abs(f[i] - v))) / 4;
}

// every drawn frame of one strip's chip: { t, box, src: 'rec:<id>' | 'lens', rec? }. A frame's state is what the page had
// at its frame callback: the live block (from its keyframes, at the time the compositor draws it), or the chip under
// the labels. A frame callback that runs late (the main thread was busy past the frame's start: 175 ms after a rebuild
// on Alexis) is drawn about when the callback runs, not at its timestamp, so it is placed there. Between two callbacks
// further apart than a frame (a long task), the compositor drew the block it had at the earlier one, every 1/60 s: a
// block the task cancels or makes is drawn only from the commit after it (a rebuild ran 72 ms of measuring and copying
// between its cancel and its new block, Alexis, main).
export function frames(data, sel) {
	const recs = data.anims.filter((r) => r.strip === sel);
	const liveAt = (now) => recs.filter((r) => r.created <= now && (r.cancelled == null || r.cancelled > now)).pop() || null;
	const out = [];
	let prev = null;
	for (const row of data.samples) {
		const s = row.s[sel]; if (!s) continue;
		const Td = row.now - row.t > FRAME * 1.5 ? row.now : row.t;
		// (a block's change, glass.js carry's, takes new keyframes that match the old up to where the change starts, so
		// its latest keyframes are its frames at every time)
		const r0 = s.block ? liveAt(row.now) : null;
		if (prev && prev.rec && prev.rec.start != null && Td - prev.t > FRAME * 1.5) {
			for (let T = prev.t + FRAME; T < Td - FRAME / 2; T += FRAME) { const b = poseAt(prev.rec, T); if (b) out.push({ t: T, box: b, src: 'rec:' + prev.rec.id, rec: prev.rec, model: true, gap: true }); }
		}
		// the block as measured, unless the frame is drawn later than it was measured (a late callback): then its keyframes
		// at the time it is drawn
		// (a block whose hold or frames the page changed after this callback measured it, in the same frame, was measured in a
		// state no frame drew: glass.js sets a waiting block's hold, and a block's change, in a frame callback of its own;
		// it is not compared with the model)
		const r = r0, m = r && Td !== row.t ? poseAt(r, Td) : null, after = (x) => x != null && x > row.now && x - row.now < FRAME * 2;
		const stale = r && (after(r.held) || after(r.rebased));
		const f = s.block ? { t: Td, box: m || s.block, src: r ? 'rec:' + r.id : 'block', rec: r, real: s.block, modelBox: r && !stale ? poseAt(r, row.t) : null, late: Td !== row.t }
			: s.lens && s.lensOp > 0.5 ? { t: Td, box: s.lens, src: 'lens', rec: null } : null;
		// a frame drawn later than its callback's own time: if at that time the block was in its before phase with
		// nothing filled backwards (a start the page set past the frame's time), the compositor may draw it at its own
		// box, untransformed (it did, for two frames, head film F1344-F1345): that frame is judged too
		if (f && m && r && row.t < r.start && beforeBare(r)) out.push({ t: Td - 1, box: [r.box.x, r.box.y, r.box.w, r.box.h], src: 'rec:' + r.id, rec: r, early: true });
		if (f) out.push(f);
		prev = { t: Td, rec: s.block ? r : null };
	}
	return out;
}

// the model against the block's own rect where a rAF frame saw both (how far the keyframe rebuild is from the page)
export function modelError(fr) {
	let worst = 0;
	for (const f of fr) if (f.modelBox && f.real) { const e = edges(f.modelBox), g = edges(f.real); worst = Math.max(worst, ...e.map((v, i) => Math.abs(v - g[i]))); }
	return worst;
}

// steps that move an edge further than the chip's own motion does in that frame
// tol: 3 px. A block that takes over from another starts on the compositor's clock, which runs a millisecond or a few
// off the page's under a recording's load: head's worst swap moved 1.4-1.75 px past its motion (Alexis, both surfaces);
// main's jumps are 8-28 px past it.
export function steps(fr, { tol = 3, from = -Infinity, to = Infinity } = {}) {
	const bad = []; let worst = { excess: 0 };
	for (let i = 1; i < fr.length; i++) {
		const a = fr[i - 1], b = fr[i]; if (b.t < from || a.t > to) continue;
		const dt = b.t - a.t; if (dt <= 0 || dt > 80) continue;
		const ea = edges(a.box), eb = edges(b.box);
		const v = Math.max(a.rec ? speedAt(a.rec, a.t) : 0, a.rec ? speedAt(a.rec, b.t) : 0, b.rec ? speedAt(b.rec, b.t) : 0, b.rec ? speedAt(b.rec, a.t) : 0);
		const allow = v * dt * 1.25 + tol;
		const moved = Math.max(...ea.map((x, k) => Math.abs(eb[k] - x)));
		const step = { t: +b.t.toFixed(1), dt: +dt.toFixed(1), moved: +moved.toFixed(2), allow: +allow.toFixed(2), excess: +(moved - allow).toFixed(2), from: a.src, to: b.src, a: ea.map((x) => +x.toFixed(1)), b: eb.map((x) => +x.toFixed(1)) };
		if (step.excess > worst.excess) worst = step;
		if (moved > allow) bad.push(step);
	}
	return { bad, worst };
}
