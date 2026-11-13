// The chat's Stop chip changes its breathing pace at once and smoothly, with no loop-end listener (lane S, 2026-11-13;
// Jared's choice PERF-STOP2 = A; 5.6 Pro/send-stop.js and send-stop.css).
//
// While a run works the send button is a Stop square that breathes, quicker while words arrive (data-flow="flowing",
// 2200 ms a loop) and slower while the run waits (data-flow="waiting", 3200 ms; both times Settings' Animation speed).
// Until this change the pace changed only at a loop's end, which the chip learnt from an animationiteration listener on
// the document; one such listener makes Chrome wake the main thread at every loop end of every CSS animation on the
// page, for the page's whole life (Windows, 120 Hz, at rest: about 35 main frames a second with it, 12 without). Now
// the pace changes the moment the wanted cadence does and the loop keeps its place, so no loop end is needed.
//
// REST (fails on main 6bd8294726, where the listener exists): after the page has settled, no animationiteration
// listener on the document or the window (DevTools names them; not on the sandbox surface, where the app is a frame),
// and in a 3 s DevTools trace on Home no animationiteration event is dispatched.
// PACE, per look: a Working run on Home with the check feeding the chip's word hook (PM56_SENDSTOP.token) from a frame
// callback every 100 ms, as turn-stream.js and thought-stream.js release their words, the chip sampled every frame (its loops' place and length, the glyph's
// scale and the backlight's opacity, as the page computes them; the films show the pixels). Changes: a word while
// waiting, early in the loop and just before its end; 900 ms without a word while flowing, landing near a loop's end
// and in its middle; Settings' Animation speed set to Fast mid-loop, then a word right after it and the quiet after
// that, then Measured again; a word followed by a 200 ms long task before the next frame; the onboarding window opened mid-loop (it holds the app's animations; no words under it,
// so the pace turns to waiting while held), closed, then a word. For each change:
//   - at once: a word changes data-flow and the loop's length by the frame after it; the quiet one comes 900 ms after
//     the last word (the module's timer on the word's age; up to --set late=<ms>, default 150, later on a busy page);
//   - no jump, on what the compositor shows: at every sample (taken after each frame), the loop's place on the wall
//     clock under the timing just sampled equals its place under the timing of the sample before to within one frame
//     at the faster pace (no allowance for a sample two back) (the step the square makes when the frame hands the new timing over); the main thread's own view
//     too (place within a frame, two right after the chip re-placed its loop; scale and opacity within the fastest
//     ordinary frame of the same look), except in a frame after a long task, whose time is from before the task.
//     A new loop (a restart) at a change fails.
// Every frame from the first change on is judged the same way, not only the frames that hold a change.
// The onboarding window's open and close make every loop it holds jump by about the window's page-wide restyle (its
// pause and resume are taken by a late frame's time): the lead's call A (2026-11-13), the window's, not the chip's.
// The check samples another loop the window holds and, within 3 s of the open and of the close, names a jump of the
// chip no larger (in time) than that loop's largest, instead of failing on it (windowSpans below).
// What it cannot see directly is the compositor; the hand-over above is computed from the timings the page reports.
// The Node model (tests/stop-chip-beat-verify.mjs) and lane S's films (share 2026-11-13-pm7-stop-chip-pace) judge it
// on a model of the compositor and on pixels.
// After the run ends nothing of the chip's is armed (PM56_SENDSTOP.debug(): no quiet timer, no speed listener, no pending frame callback).
// Each look is SAVED through Settings before its run: a Settings save (the speed change) repaints the saved look, and
// with the kit's unsaved look() the page went back to Basic Dark mid-run (first runs: a look change, read as a jump).
// REDUCED (first look only): with Reduce motion on, the app's (Settings) and then the system's (prefers-reduced-motion),
// there is no loop and a word still changes data-flow; off again, the loop comes back at that cadence's length.
// Failed on main 6bd8294726: the listener (document, the chip's script), 41 loop ends dispatched in 3 s at rest, no
// change before a loop's end and a new loop at each, and Settings' speed change jumping a whole loop at the hand-over.
// Failed on lane S's 4bbe9d0551 (loops re-placed by the frame's time): the speed change jumped 0.15 of a loop.
//
// --set looks=<a,b>   default basic-dark,glass-dark,retro-dark,nier-dark,friendly-dark,basic-light
// --set parts=<a,b>   rest,pace,reduced (default all)   --set settle=<ms> (default 30000)   --set late=<ms> (default 150)
// --set chat=<url>    the chat alone (its standalone build): no Settings, no onboarding window; looks by PM56_DEMO.setTheme
// Both surfaces (--set sandbox=0 and 1). No Stop chip, or a change that did not happen, fails as "could not judge".
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

// One Working run, driven and sampled inside the page; returns every frame's sample, the marks and the flips.
const PACE = async ({ speed, windowPart }) => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const frame = () => new Promise((r) => requestAnimationFrame(r));
	const SS = window.PM56_SENDSTOP, D = window.PM56_DEMO;
	const chip = () => document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
	const ids = new WeakMap(); let nid = 0;
	const idOf = (a) => { if (!ids.has(a)) ids.set(a, ++nid); return ids.get(a); };
	const rows = [], marks = [], flips = [], errors = [];
	const placeOf = (a) => { const c = a.effect.getComputedTiming(); return c.currentIteration == null ? null : c.currentIteration + c.progress; };
	const read = () => {
		const b = chip(), host = b && b.closest('[data-theme]');
		const r = { t: document.timeline.currentTime, w: performance.now(), ss: b && b.getAttribute('data-ss'), flow: b && b.getAttribute('data-flow'), th: host ? host.getAttribute('data-theme') : null, nier: document.documentElement.getAttribute('data-o55-nier'), win: document.documentElement.hasAttribute('data-o55-open') };
		if (!b) return r;
		const all = b.getAnimations({ subtree: true });
		const g = all.find((a) => /^ss-breathe/.test(a.animationName)), l = all.find((a) => /^ss-glow/.test(a.animationName));
		if (g) { const cs = getComputedStyle(b.querySelector('.ss-g')), m = cs.transform; r.ease = cs.animationTimingFunction; r.g = { id: idOf(g), name: g.animationName, dur: +g.effect.getTiming().duration, delay: +g.effect.getTiming().delay, s: g.startTime, c: g.currentTime, rate: g.playbackRate, place: placeOf(g), state: g.playState, v: m && m.startsWith('matrix(') ? parseFloat(m.slice(7)) : 1 }; }
		if (others.length) r.os = others.map((o) => ({ id: idOf(o), dur: +o.effect.getTiming().duration, delay: +o.effect.getTiming().delay, s: o.startTime, c: o.currentTime, rate: o.playbackRate, place: placeOf(o), state: o.playState, v: 0 }));
		if (l) r.b = { id: idOf(l), name: l.animationName, dur: +l.effect.getTiming().duration, delay: +l.effect.getTiming().delay, s: l.startTime, c: l.currentTime, rate: l.playbackRate, place: placeOf(l), state: l.playState, v: parseFloat(getComputedStyle(b.querySelector('.ss-bl'), '::before').opacity) };
		return r;
	};
	let sampling = true, others = [], otherDesc = 'none';
	// sampled in a task posted from each frame callback, so after every frame callback of that frame (the chip's own
	// re-placement among them) and after the frame was handed over
	const mc = new MessageChannel();
	mc.port1.onmessage = () => { if (!sampling) return; try { rows.push(read()); } catch (e) { errors.push(String(e)); } };
	const tick = () => { if (!sampling) return; mc.port2.postMessage(0); requestAnimationFrame(tick); };
	const mo = new MutationObserver((ms) => { for (const m of ms) { const v = m.target.getAttribute('data-flow'); if (m.attributeName === 'data-flow' && v !== m.oldValue && m.target.getAttribute('data-ss') === 'stop') flips.push({ i: rows.length, now: performance.now(), to: v }); } });
	const last = () => rows[rows.length - 1] || {};
	const frac = () => { const g = last().g; return g && g.place != null ? g.place % 1 : null; };
	const until = async (pred, ms = 9000) => { const end = performance.now() + ms; while (!pred()) { if (performance.now() > end) return false; await frame(); } return true; };
	let feeding = false, nextWord = 0, lastWord = 0;
	const word = () => { SS.token(); lastWord = performance.now(); };
	const mark = (name, extra) => marks.push({ name, i: rows.length, now: performance.now(), frac: frac(), ...extra });
	// words are released inside a frame callback every 100 ms, as turn-stream.js:352 and thought-stream.js:229 release
	// them (R32 F4: a timer released them between frames, a path the app does not use)
	const feedTick = () => { if (!feeding) return; if (performance.now() >= nextWord) { word(); nextWord = performance.now() + 100; } requestAnimationFrame(feedTick); };
	const feedOn = () => { if (feeding) return; feeding = true; nextWord = performance.now() + 100; requestAnimationFrame(feedTick); };
	const feedOff = () => { feeding = false; };
	// a word between two frames, as a mark
	// a word inside a frame callback (the code after `await frame()` runs in that callback's microtask checkpoint)
	const wordAt = async (name) => { await frame(); mark(name, { kind: 'word' }); word(); feedOn(); };
	// the same, then a long task before the next frame (R32 F2: the change handed over by this frame was re-placed again
	// by the next one, by the old timing, and the square stepped back by the task's length times the change of rate)
	const wordThenTask = async (name, ms) => {
		await frame(); mark(name, { kind: 'word', task: ms }); word();
		setTimeout(() => { const end = performance.now() + ms; while (performance.now() < end) { /* a long task */ } }, 0);
		feedOn();
	};
	// stop the words so that the quiet change (900 ms later) lands near `target` of a loop at the flowing length
	const quietAt = async (name, target) => {
		await sleep(400);
		const ahead = 901 / (last().g ? last().g.dur : 2200);
		const stopAt = ((target - ahead) % 1 + 1) % 1;
		if (!(await until(() => { const f = frac(); return f != null && Math.abs(f - stopAt) < 0.02; }))) return false;
		feedOff(); word();                                            // the last word, now
		marks.push({ name, i: -1, kind: 'quiet', wordAt: lastWord, aim: target });
		return until(() => last().flow === 'waiting', 3000);
	};
	const inLoop = (lo, hi) => until(() => { const f = frac(); return f != null && f >= lo && f <= hi && last().g.place >= 1; });

	try {
		D.pauseWorking(); await sleep(300);
		mo.observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-flow'] });
		requestAnimationFrame(tick);
		D.startWorking();
		if (!(await until(() => last().ss === 'stop' && last().g && last().g.place >= 1.0, 12000))) throw new Error(`no breathing Stop chip: ${JSON.stringify(last())}`);
		if (last().flow !== 'waiting') { await until(() => last().flow === 'waiting', 3000); }
		// a word while waiting, early in the loop; then quiet landing near the loop's end
		if (!(await inLoop(0.2, 0.3))) throw new Error('early: the loop never reached .2-.3');
		await wordAt('word while waiting, early in the loop');
		if (!(await quietAt('quiet while flowing, landing near the loop end', 0.95))) throw new Error('quiet near the end: no change');
		// a word just before the loop's end; then quiet landing mid-loop
		if (!(await inLoop(0.955, 0.99))) throw new Error('late: the loop never reached .955-.99');
		await wordAt('word while waiting, just before the loop end');
		if (!(await quietAt('quiet while flowing, landing mid-loop', 0.5))) throw new Error('quiet mid-loop: no change');
		// a word from a frame callback, then a 200 ms long task before the next frame; then quiet again
		if (!(await inLoop(0.3, 0.4))) throw new Error('long task: the loop never reached .3-.4');
		await wordThenTask('word while waiting, then a 200 ms long task', 200);
		if (!(await quietAt('quiet after the long task', 0.6))) throw new Error('quiet after the long task: no change');
		if (speed) {
			if (!(await inLoop(0.3, 0.4))) throw new Error('speed: the loop never reached .3-.4');
			await sleep(2); mark('Animation speed Fast, waiting, mid-loop', { kind: 'speed' });
			const ok = window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Fast');
			if (!ok) throw new Error('Settings refused Fast');
			await sleep(150);
			await wordAt('word right after the speed change');
			if (!(await quietAt('quiet after the speed change', 0.7))) throw new Error('quiet after speed: no change');
			if (!(await inLoop(0.3, 0.4))) throw new Error('speed back: the loop never reached .3-.4');
			await sleep(2); mark('Animation speed Measured, waiting, mid-loop', { kind: 'speed' });
			window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Measured');
			await sleep(300);
		}
		if (windowPart) {
			await wordAt('word before the window');
			await sleep(500);
			if (!(await until(() => { const f = frac(); return f != null && f >= 0.3 && f <= 0.45; }))) throw new Error('window: the loop never reached .3-.45');
			feedOff(); word();                                            // the last word before the window
			const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
			const loopOf = (state) => (a) => a.animationName && a.playState === state && a.effect && a.effect.getTiming().iterations === Infinity && a.effect.target && !a.effect.pseudoElement && !(a.effect.target.closest && (a.effect.target.closest('.sendstop') || a.effect.target.closest('#pm-o55-onboarding')));
			// the references: up to 12 running loops of the app, taken BEFORE the window opens so the open's own pause is
			// sampled; a pair in which a reference's length or delay changed (NieR restyles some as the window opens) is
			// not counted (windowSpans)
			// from the chip's own part of the page (the child of <body> it lives in), which the window holds with the chip
			let top = chip(); while (top && top.parentElement && top.parentElement !== document.body) top = top.parentElement;
			others = document.getAnimations().filter((a) => loopOf('running')(a) && top && top.contains(a.effect.target)).slice(0, 12);
			await sleep(2); mark('onboarding window opens (holds the glyph), no more words', { kind: 'window' });
			window.O55.ui.open();
			marks.push({ name: 'quiet under the window', i: -1, kind: 'quiet', wordAt: lastWord });
			// another loop the window holds, sampled with the chip as the page-wide reference for what the window's
			// close does to every held loop (an infinite CSS loop on an element of the app, not the chip)
			await until(() => document.documentElement.hasAttribute('data-o55-open'), 3000); await frame(); await frame();
			const held = others.filter((o) => o.playState === 'paused');
			otherDesc = `${held.length} of ${others.length} held: ${held.slice(0, 4).map((o) => `${o.animationName} on ${desc(o.effect.target)} (${o.effect.getTiming().duration} ms)`).join(', ')}${held.length > 4 ? ', ...' : ''}`;
			await until(() => last().flow === 'waiting', 3000);
			await sleep(1500);
			await sleep(2); mark('onboarding window closes', { kind: 'window' });
			window.O55.ui.close();
			await until(() => !document.documentElement.hasAttribute('data-o55-open'), 5000);
			await sleep(400);
			await wordAt('word after the window');
			await sleep(400); feedOff();
		}
		await sleep(300);
	} catch (e) { errors.push(String(e && e.message || e)); }
	feedOff();
	sampling = false; mo.disconnect();
	await frame();
	D.pauseWorking();
	await sleep(400);
	const after = { ss: chip() && chip().getAttribute('data-ss'), debug: SS.debug() };
	// tie each quiet change to its flip
	for (const m of marks) if (m.kind === 'quiet') { const fl = flips.find((x) => x.to === 'waiting' && x.now >= m.wordAt); if (fl) { m.i = fl.i; m.flipMs = Math.round(fl.now - m.wordAt); } }
	return { rows, marks, flips, errors, after, otherDesc };
};

// What a person sees is the compositor's: a retimed loop reaches it only with the next frame, and until then it keeps
// moving the square on the OLD timing by the wall clock, also through a long task. So at each sample the loop's place
// is taken on the wall clock (performance.now at the sample) under the timing just sampled and under the timing of
// the sample before: the difference is the step the square makes when the frame hands the new timing over (0 when
// nothing was retimed). The main thread's own view (its place by the frame's time, the computed scale and opacity) is
// judged too, except in a frame that comes after a long task: its time is the frame's BEGINNING, from before the task.
const shownAt = (x, w) => (x.state === 'paused' || x.s == null ? (x.c - x.delay) / x.dur : ((w - x.s) * (x.rate || 1) - x.delay) / x.dur);
const medianFrame = (rows) => { const d = []; for (let i = 1; i < rows.length; i++) d.push(rows[i].w - rows[i - 1].w); d.sort((a, b) => a - b); return d[d.length >> 1] || 8.33; };
function pair(R, i, layer, maxRate, frame) {
	const r0 = R.rows[i - 1], r1 = R.rows[i], a = r0[layer], b = r1[layer];
	if (!a || !b) return null;
	if (a.id !== b.id) return { restart: true };
	const out = {};
	// Every shown frame against the frame before it (R32 F4: no allowance for a sample two back, which hid F2). A loop
	// pending its start time (just made, not yet started by a frame) has no place to judge and is skipped.
	const placed = (x) => x.state === 'paused' || x.s != null;
	if (placed(a) && placed(b)) {
		const h0 = shownAt(a, r1.w), h1 = shownAt(b, r1.w);
		if (h0 >= 0 || h1 >= 0) { out.hand = +Math.abs(h1 - h0).toFixed(5); out.handBound = +(frame / Math.min(a.dur, b.dur) * 1.1 + 0.002).toFixed(5); }
	}
	out.stale = r1.w - r0.w > 3 * frame;
	if (!out.stale && a.place != null && b.place != null) {
		// a loop the chip has just re-placed is put by the wall clock, which runs up to a frame ahead of the frame's own
		// time: the main thread's view may then move up to two frames (the hand-over above stays at one)
		const dt = r1.t - r0.t, k = a.dur !== b.dur || a.delay !== b.delay || (a.s != null && b.s != null && Math.abs(a.s - b.s) > 0.5) ? 2 : 1;
		out.place = +(b.place - a.place).toFixed(5); out.placeBound = +(k * Math.max(dt, frame) / Math.min(a.dur, b.dur) * 1.1 + 0.002).toFixed(5);
		out.value = +Math.abs(b.v - a.v).toFixed(5); out.valueBound = +(maxRate * k * Math.max(dt, frame) * 1.15 + 0.002).toFixed(5);
		// re-placed by the wall clock, the main thread's view may also sit a hair behind (its frame's time began before
		// the task that re-placed it): within the bound either way then, never backwards otherwise
		out.floor = k === 2 ? -out.placeBound : -1e-6;
	}
	out.ok = (out.hand == null || out.hand <= out.handBound) && (out.place == null || (out.place >= out.floor && out.place <= out.placeBound && out.value <= out.valueBound));
	return out;
}
function rates(R) {
	const out = {};
	for (const layer of ['g', 'b']) {
		const changes = new Set(R.marks.map((m) => m.i).filter((i) => i > 0));
		let maxRate = 0;
		for (let i = 1; i < R.rows.length; i++) {
			const a = R.rows[i - 1][layer], b = R.rows[i][layer];
			if (!a || !b || a.id !== b.id || changes.has(i) || R.rows[i - 1].flow !== 'flowing' || R.rows[i].flow !== 'flowing' || a.dur !== b.dur || a.place == null || b.place == null) continue;
			const dt = R.rows[i].t - R.rows[i - 1].t; if (dt <= 0) continue;
			maxRate = Math.max(maxRate, Math.abs(b.v - a.v) / dt);
		}
		out[layer] = maxRate;
	}
	return out;
}
// The onboarding window pauses the app's loops as it opens and resumes them as it closes, each time with a page-wide
// restyle (~240 ms on the Windows PC) in the same task: the frame after it is late, and Chrome takes the pause's hold
// (or the resume's start) by that frame's time, from before the restyle, so EVERY held loop jumps when that frame is
// handed over (back at the open, forward at the close) by about the restyle's length. The lead's call A (2026-11-13):
// the window's, not the chip's (main's page shows it for the chip and another held loop alike). So within 3 s of the
// open and of the close a jump of the chip is named, not failed, when it is no larger (in time) than the largest jump of
// other held loops sampled in the same run (up to 12, taken before the open; pairs in which a loop's own timing
// changed are not counted) plus a frame; any
// other jump of the chip fails.
function windowSpans(R, frame) {
	const out = [];
	for (const name of ['onboarding window opens (holds the glyph), no more words', 'onboarding window closes']) {
		const m = R.marks.find((x) => x.name === name);
		if (!m || m.i <= 0) continue;
		const from = m.i, until = R.rows.findIndex((r, i) => i > from && r.w - R.rows[from].w > 3000);
		const to = until < 0 ? R.rows.length : until;
		let other = 0, otherAt = null;
		// a pause or resume taken by a late frame's time moves a loop by at most the time between the two samples around
		// it: a reference step past that (its own timing changed: NieR restyles it) is not a measure of the window's jump
		for (let i = from; i < to; i++) {
			const r0 = R.rows[i - 1], r1 = R.rows[i];
			if (!r0.os || !r1.os) continue;
			for (let k = 0; k < Math.min(r0.os.length, r1.os.length); k++) {
				const a = r0.os[k], b = r1.os[k];
				if (a.id !== b.id || a.dur !== b.dur || a.delay !== b.delay || !(b.dur > 0)) continue;
				const h0 = shownAt(a, r1.w), h1 = shownAt(b, r1.w);
				if (!(h0 >= 0 || h1 >= 0)) continue;
				const ms = Math.abs(h1 - h0) * b.dur;
				if (ms > r1.w - r0.w + frame) continue;
				if (ms > other) { other = ms; otherAt = Math.round(r1.w - R.rows[from].w); }
			}
		}
		out.push({ what: /opens/.test(name) ? 'open' : 'close', from, to, otherMs: other, otherAt, limitMs: other + frame });
	}
	return out;
}
const spanOf = (spans, i) => spans.find((x) => i >= x.from && i < x.to) || null;
// Every frame from the first change to the end, not only the frames that hold a change: the loop is never made anew,
// never jumps at a hand-over, and (outside the frames after a long task) its place never moves more than one frame at
// the faster pace (a retime that something else did at a moment no mark names shows here).
function everyFrame(R) {
	const out = { worst: 0, where: null, restarts: [], known: [] }, frame = medianFrame(R.rows), mr = rates(R), spans = windowSpans(R, frame);
	out.spans = spans;
	const first = Math.max(1, Math.min(...R.marks.map((m) => m.i).filter((i) => i > 0)));
	for (const layer of ['g', 'b']) {
		for (let i = first; i < R.rows.length; i++) {
			const x = pair(R, i, layer, mr[layer], frame); if (!x) continue;
			const t = Math.round(R.rows[i].w - R.rows[first].w);
			if (x.restart) { out.restarts.push(`${layer === 'g' ? 'glyph' : 'backlight'} +${t} ms`); continue; }
			const wc = spanOf(spans, i);
			if (wc && x.hand != null && x.hand > x.handBound) {
				const ms = x.hand * R.rows[i][layer].dur;
				if (ms <= wc.limitMs && ms <= R.rows[i].w - R.rows[i - 1].w + frame) { out.known.push(`${layer === 'g' ? 'glyph' : 'backlight'} ${Math.round(ms)} ms (${x.hand} of a loop) at +${Math.round(R.rows[i].w - R.rows[wc.from].w)} ms after the ${wc.what}`); continue; }
			}
			const over = Math.max(x.hand != null ? x.hand / x.handBound : 0, x.place != null ? (x.place < x.floor ? 99 : Math.abs(x.place) / x.placeBound) : 0);
			if (over > out.worst) { const a = R.rows[i - 1][layer], b = R.rows[i][layer]; out.worst = over; out.where = `${layer === 'g' ? 'glyph' : 'backlight'} +${t} ms: hand-over ${x.hand ?? '-'} (bound ${x.handBound ?? '-'}), main-thread place ${x.place ?? 'stale frame'} (bound ${x.placeBound ?? '-'}), length ${a.dur} -> ${b.dur}, delay ${a.delay} -> ${b.delay}, start ${a.s == null ? '-' : Math.round(a.s)} -> ${b.s == null ? '-' : Math.round(b.s)}, ${a.state} -> ${b.state}, window ${R.rows[i - 1].win ? 'open' : 'closed'} -> ${R.rows[i].win ? 'open' : 'closed'}, ${Math.round(R.rows[i].w - R.rows[i - 1].w)} ms between samples, theme ${R.rows[i - 1].th} -> ${R.rows[i].th}`; }
		}
	}
	return out;
}

// Judge one look's samples at its changes.
function judge(R, look) {
	const out = [], frame = medianFrame(R.rows), mr = rates(R), spans = windowSpans(R, frame);
	for (const layer of ['g', 'b']) {
		for (const m of R.marks) {
			if (m.i <= 0 || m.i >= R.rows.length) continue;
			const r0 = R.rows[m.i - 1], r1 = R.rows[m.i], a = r0[layer], b = r1[layer];
			if (!a && !b) continue;
			const themes = [...new Set(R.rows.slice(Math.max(0, m.i - 2), m.i + 3).map((r) => `${r.th}${r.nier === 'on' ? '+nier' : ''} ${r.ease}`))].join(' > ');
			const row = { look, layer: layer === 'g' ? 'glyph' : 'backlight', name: m.name, kind: m.kind, themes, frac: a && a.place != null ? +(a.place % 1).toFixed(3) : null, dt: +(r1.w - r0.w).toFixed(1), from: a && a.dur, to: b && b.dur, flowTo: r1.flow, flipMs: m.flipMs };
			const x = pair(R, m.i, layer, mr[layer], frame);
			if (!x || x.restart) { row.restart = true; out.push(row); continue; }
			Object.assign(row, x);
			// the page-wide jump around the window's open and close (windowSpans): named, not failed, when the rest is fine
			const wc = spanOf(spans, m.i);
			if (!row.ok && wc && row.hand > row.handBound && row.hand * b.dur <= wc.limitMs && row.hand * b.dur <= r1.w - r0.w + frame && (row.place == null || (row.place >= row.floor && row.place <= row.placeBound && row.value <= row.valueBound))) { row.ok = true; row.known = true; }
			out.push(row);
		}
	}
	return out;
}

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark,friendly-dark,basic-light').split(',').filter(Boolean);
	const parts = new Set(String(t.args.parts || 'rest,pace,reduced').split(','));
	const late = Number(t.args.late || 150);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	// the chat alone (its standalone build, `--set chat=<url>`): no Settings, no onboarding window, no pages
	const alone = !!t.args.chat;
	let f;
	if (alone) { await t.goto(String(t.args.chat)); f = t.page.mainFrame(); } else f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	const ready = alone
		? await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP), null, { timeout: 60000 }).then(() => true, () => false)
		: await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP && window.PM_PAGES && window.PM12_KIMI && window.O55 && O55.ui), null, { timeout: 60000 }).then(() => true, () => false);
	await t.check(alone ? 'the standalone chat\'s demo and its send button module are in the page' : 'the chat\'s demo, its send button module, Settings and the onboarding window are in the page', ready, ready ? 'ok' : 'missing after 60 s: could not judge');
	if (!ready) return;
	await t.page.waitForTimeout(Number(t.args.settle ?? (alone ? 8000 : 30000)));
	const sandbox = f !== t.page.mainFrame();
	const home = () => (alone ? Promise.resolve() : f.evaluate(() => PM_PAGES.go('dashboard')));

	if (parts.has('rest')) {
		const cdp = await t.page.context().newCDPSession(t.page);
		if (!sandbox) {
			const heard = [];
			for (const expr of ['document', 'window']) {
				const { result } = await cdp.send('Runtime.evaluate', { expression: expr, objectGroup: 'stop-beat' });
				const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
				for (const l of listeners) if (/^(webkit)?animationiteration$/i.test(l.type)) heard.push(`${expr} script ${l.scriptId} line ${l.lineNumber}`);
			}
			await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'stop-beat' }).catch(() => {});
			await t.check('rest: no animationiteration listener on the document or the window', heard.length === 0, heard.length ? heard.join('; ') : 'none');
		} else t.log('NOTE sandbox surface: the app is a frame, whose listeners DevTools does not name here; the dispatch count judges');
		await home();
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(4000);
		let x = null, err = '';
		try { x = await traceWindow(cdp, { ms: 3000, url: f.url() }); } catch (e) { err = String(e && e.message || e); }
		const it = x && x.dispatched ? (x.dispatched.animationiteration || 0) : null;
		await t.check('rest: no animationiteration event is dispatched on Home in 3 s', it === 0, x ? `${it} dispatched in ${x.secs} s (main frames ${x.mainFrames.perSec}/s)` : `no trace: ${err}: could not judge`);
		await cdp.detach().catch(() => {});
	}

	// The look is SAVED through Settings first: a Settings save (the speed change below) repaints the saved look, and
	// the kit's look() alone is not saved, so the page went back to Basic Dark in the middle of the run (first runs).
	const savedLook = async (look) => {
		if (alone) { await f.evaluate((id) => window.PM56_DEMO.setTheme(id), look); await t.page.waitForTimeout(800); return; }
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => { PM12_KIMI.setSettingFromHost('general.visual.theme', fm === 'nier' ? 'NieR' : fm[0].toUpperCase() + fm.slice(1)); PM12_KIMI.setSettingFromHost('general.visual.theme-mode', m === 'light' ? 'Light' : 'Dark'); }, [fam, mode]);
		await t.page.waitForTimeout(800);
		await t.app.look(look);
	};
	if (parts.has('pace')) {
		for (const [n, look] of looks.entries()) {
			await savedLook(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await home();
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(3000);
			const R = await f.evaluate(PACE, { speed: !alone, windowPart: !alone && (n === 0 || look.startsWith('nier')) });
			const rows = judge(R, look);
			for (const e of R.errors) t.log(`${look}: ${e}`);
			await t.check(`${look}: the run went through every change`, R.errors.length === 0 && R.rows.length > 60, R.errors.join('; ') || `${R.rows.length} frames sampled`);
			for (const r of rows) t.log(`${look} ${r.layer}: ${r.name}${r.frac != null ? ` at ${r.frac} of the loop` : ''}: ${r.restart ? 'NEW LOOP' : `hand-over ${r.hand ?? '-'} (bound ${r.handBound ?? '-'}), ${r.stale ? 'main thread: a frame after a long task, not judged' : `main-thread place +${r.place} (bound ${r.placeBound}), value ${r.value} (bound ${r.valueBound})`}`}, length ${r.from} -> ${r.to}, ${r.dt} ms between samples, theme ${r.themes}${r.flipMs != null ? `, ${r.flipMs} ms after the last word` : ''}`);
			const bad = rows.filter((r) => r.restart || (r.ok === false));
			await t.check(`${look}: no change makes the loop jump (at the hand-over within a frame at the faster pace; on the main thread place within a frame, scale and opacity within the fastest ordinary frame)`, rows.length > 0 && bad.length === 0,
				bad.length ? bad.map((r) => `${r.layer} ${r.name}: ${r.restart ? 'a new loop' : `hand-over ${r.hand}/${r.handBound}, place ${r.place ?? 'stale'}/${r.placeBound ?? '-'}, value ${r.value ?? '-'}/${r.valueBound ?? '-'}`}`).join('; ') : `${rows.length} changes judged`);
			const ev = everyFrame(R);
			t.log(`${look}: every frame from the first change on: worst step ${(ev.worst * 100).toFixed(0)}% of its bound${ev.where ? ` (${ev.where})` : ''}; new loops: ${ev.restarts.join(', ') || 'none'}`);
			for (const sp of ev.spans) t.log(`${look}: NOTE the onboarding window's ${sp.what}: the other held loops (${R.otherDesc}) jumped up to ${Math.round(sp.otherMs)} ms at +${sp.otherAt} ms after it (a page-wide jump, the window's: known, not judged); the chip's jumps within 3 s up to ${Math.round(sp.limitMs)} ms are named, not failed`);
			if (ev.spans.length) t.log(`${look}: NOTE the chip's jumps named as the window's: ${ev.known.join('; ') || 'none'}`);
			await t.check(`${look}: in every frame from the first change on, the loop is never made anew and never jumps (hand-over and main-thread place)`, ev.restarts.length === 0 && ev.worst <= 1,
				`${ev.restarts.length ? 'new loops ' + ev.restarts.join(', ') + '; ' : ''}worst ${(ev.worst * 100).toFixed(0)}%${ev.where ? ': ' + ev.where : ''}`);
			// at once: a word -> flowing with the flowing length in the next frame; the quiet change on time
			const words = R.marks.filter((m) => m.kind === 'word' && m.i > 0 && m.i < R.rows.length);
			// a word released inside frame N's callbacks shows by frame N + 1 (the sample after it)
			const by = (m) => R.rows[Math.min(m.i + 1, R.rows.length - 1)];
			const slow = words.filter((m) => { const p = R.rows[m.i - 1], r = by(m); if (!p.g || !r.g) return true; const want = p.flow === 'waiting' ? p.g.dur * 2200 / 3200 : p.g.dur; return r.flow !== 'flowing' || Math.abs(r.g.dur - want) > 1; });
			await t.check(`${look}: a word turns the pace to flowing by the next frame`, words.length >= (alone ? 2 : 3) && slow.length === 0, slow.length ? slow.map((m) => `${m.name}: the frame after ${JSON.stringify(by(m).flow)} ${by(m).g && by(m).g.dur}`).join('; ') : `${words.length} words`);
			const quiet = R.marks.filter((m) => m.kind === 'quiet');
			const off = quiet.filter((m) => m.flipMs == null || m.flipMs < 880 || m.flipMs > 900 + late);
			await t.check(`${look}: 900 ms without a word turns it to waiting (within ${late} ms after)`, quiet.length >= 2 && off.length === 0, quiet.map((m) => `${m.name}: ${m.flipMs == null ? 'no change' : m.flipMs + ' ms'}`).join('; '));
			const d = R.after.debug || {};
			await t.check(`${look}: once the run has ended nothing of the chip's is armed`, R.after.ss !== 'stop' && d.quiet === false && d.watching === false && d.pending !== true, JSON.stringify(R.after));
		}
	}

	if (parts.has('reduced')) {
		const look = looks[0];
		await savedLook(look);
		await home();
		await t.page.waitForTimeout(2000);
		// one Reduced Motion route at a time: the app's own (Settings' Reduce motion; not in the chat alone), then the
		// system's (prefers-reduced-motion)
		const routes = alone ? ['system'] : ['app', 'system'];
		for (const route of routes) {
			const step = (what) => f.evaluate(async ([what, route]) => {
				const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
				const chip = () => document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
				const loops = () => { const b = chip(); return b ? b.getAnimations({ subtree: true }).filter((a) => /^ss-(breathe|glow)/.test(a.animationName)).map((a) => `${a.animationName} ${a.effect.getTiming().duration}`) : null; };
				const D = window.PM56_DEMO, SS = window.PM56_SENDSTOP, K = window.PM12_KIMI;
				const now = () => ({ ss: chip() && chip().getAttribute('data-ss'), flow: chip() && chip().getAttribute('data-flow'), loops: loops() });
				if (what === 'start') { D.pauseWorking(); await sleep(300); D.startWorking(); await sleep(1500); return now(); }
				if (what === 'on' && route === 'app') { const ok = K.setSettingFromHost('general.visual.reduce-animations', true); await sleep(600); return { set: ok, ...now() }; }
				if (what === 'off' && route === 'app') { K.setSettingFromHost('general.visual.reduce-animations', false); await sleep(600); return now(); }
				if (what === 'word') { SS.token(); await sleep(50); return now(); }
				if (what === 'end') { D.pauseWorking(); await sleep(300); return now(); }
				await sleep(600); return now();
			}, [what, route]);
			const out = { before: await step('start') };
			if (route === 'system') await t.emulate({ reducedMotion: 'reduce' });
			out.on = await step('on');
			out.word = await step('word');
			if (route === 'system') await t.emulate({ reducedMotion: 'no-preference' });
			out.off = await step('off');
			await step('end');
			t.log(`reduced (${route}) ${look}: ${JSON.stringify(out)}`);
			await t.check(`reduced (${route}) ${look}: with Reduce motion on the chip has no loop and a word still turns it to flowing`, out.on.set !== false && out.on.ss === 'stop' && Array.isArray(out.on.loops) && out.on.loops.length === 0 && out.word.flow === 'flowing', JSON.stringify({ on: out.on, word: out.word }));
			const want = out.off.flow === 'flowing' ? 2200 : 3200;
			await t.check(`reduced (${route}) ${look}: off again, the loops come back at the ${out.off.flow} length`, Array.isArray(out.off.loops) && out.off.loops.length >= 1 && out.off.loops.every((x) => Number(x.split(' ')[1]) === want), JSON.stringify(out.off));
		}
	}
}
