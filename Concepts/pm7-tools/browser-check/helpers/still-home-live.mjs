// Home's live beat, for the still window of checks/perf-still-page.check.mjs (PM7PERF-STILLPAGE-HOME-LIVE-TICKS).
//
// Home hosts the Usage board: the demo engine (PM_DEMO) emits usage.tick every 2 s of demo time, and the live film
// (usage-redesign 15-film.js hostedTick) beats every 3rd tick while a shown dashboard holds a Usage widget. A beat
// patches the matching cards in ~6 ms slices, lights the lead and pulses the kind's Live mark (600 ms); the changed
// numbers tween. Those are the draws perf-still-page counted on Home at rest: the old row read whether a try's 2 s
// window held a beat (its phase), not a property of the page (lane V: 15.5 to 70.9 draws/s across consecutive windows
// on a correct page, both main's and the fixed one).
//
// The watch records the rhythm from the page's own events: usage.tick times (the product ignores ticks closer than
// half a period, and so does this) and every shown board's 'beat' event (40-board.js liveTry emits it when it
// patches, with detail.at on the performance.now() clock), marking each beat pm-still:beat so a trace carries it.
// homeBeatPlan places a window between two beats; beatFreeDrawn takes a beat's own frames out of a window a beat
// still landed in. Nothing here changes the page's state: listeners and marks only.
export const installHomeLiveWatch = () => {
	if (window.__stillHomeLive) return true;
	const w = window.__stillHomeLive = { ticks: [], beats: [], period: null, error: null };
	try {
		if (window.PM_DEMO && typeof PM_DEMO.on === 'function') {
			// the bus returns PM_DEMO, not an off function: the listener lives with the page (one per run)
			PM_DEMO.on('usage.tick', () => {
				const t = performance.now(), last = w.ticks[w.ticks.length - 1];
				if (last != null && t - last < (w.period || 2000) * 0.5) return;
				w.ticks.push(t);
				if (w.ticks.length > 12) w.ticks.shift();
				if (w.ticks.length >= 3) {
					const gaps = w.ticks.slice(1).map((x, i) => x - w.ticks[i]).sort((a, b) => a - b);
					w.period = gaps[Math.floor(gaps.length / 2)];
				}
			});
		}
		if (window.PMU && PMU.boards && typeof PMU.boards.each === 'function') {
			PMU.boards.each((b) => {
				if (!b.on) return;
				return b.on('beat', (d) => {
					w.beats.push({ at: d.at, cards: (d.cards || []).slice(0, 8), shares: d.shares });
					if (w.beats.length > 12) w.beats.shift();
					try { performance.mark('pm-still:beat'); } catch (e) { /* marks are best effort */ }
				});
			});
		}
	} catch (e) { w.error = String(e); }
	return true;
};

// The watch's reading for a plan (a page function: serializable, no DOM work beyond the clock)
export const readHomeLive = () => {
	const s = window.__stillHomeLive;
	return { beats: s ? s.beats : [], period: s ? s.period : null, now: performance.now(), error: s ? s.error : 'no live watch installed' };
};

// Where to start a still window of `ms` so it holds no beat: a beat at B draws until about B + tail (the patch
// slices, the lead light, the 600 ms Live-mark pulse, the odometer tweens), and the next beat comes about
// 3 * period after the last (hostedTick). w is readHomeLive's reading. Returns { waitMs, placed, why }: wait
// waitMs, then trace; placed:false means the rhythm cannot fit a clean window (judge with beatFreeDrawn instead).
export function homeBeatPlan(w, { ms, tail = 1200, margin = 400, maxWait = 15000 }) {
	const last = w.beats.length ? w.beats[w.beats.length - 1].at : null;
	if (last == null || !(w.period > 0)) return { waitMs: 0, placed: false, why: 'no beat rhythm observed yet' };
	const interval = 3 * w.period;
	if (interval - tail < ms + margin) return { waitMs: 0, placed: false, why: `beats every ${Math.round(interval)} ms leave ${Math.round(interval - tail)} ms between their tails, too little for a ${ms} ms window plus ${margin} ms margin` };
	let start = Math.max(w.now, last + tail);
	let next = last + interval;
	if (start + ms + margin > next) { start = next + tail; next += interval; }
	const waitMs = start - w.now;
	if (waitMs > maxWait) return { waitMs: 0, placed: false, why: `the next beat-free window is ${Math.round(waitMs)} ms away (over the ${maxWait} ms wait cap)` };
	return { waitMs: Math.max(0, Math.round(waitMs)), placed: true, why: `start ${Math.round(start - w.now)} ms from now, next beat about ${Math.round(next - w.now)} ms from now (beats every ${Math.round(interval)} ms, tail ${tail} ms)` };
}

// A beat landed in the window despite the plan (or no plan fitted): take the beat's own frames out. The watch's
// pm-still:beat marks are on the trace's clock; a draw inside [mark, mark + tail] is the beat's. The rate is the
// kept draws over the window less the beat spans (both numerator and denominator, so a real loop still reads high).
// events: the trace's events; returns null when the trace holds no beat mark, { drawnPerSec: null } when under
// 0.25 s of the window is left to judge.
export function beatFreeDrawn(events, { tail = 1200 } = {}) {
	const beats = events.filter((e) => e.name === 'pm-still:beat' && e.cat && e.cat.includes('blink.user_timing')).map((e) => e.ts).sort((a, b) => a - b);
	if (!beats.length) return null;
	let t0 = Infinity, t1 = -Infinity, started = null;
	const viz = new Set();
	for (const e of events) {
		if (e.ph === 'M') { if (e.name === 'thread_name' && e.args.name === 'VizCompositorThread') viz.add(e.pid + ':' + e.tid); continue; }
		if (!e.ts || e.cat === '__metadata') continue;
		if (e.name === 'TracingStartedInBrowser') started = e;
		if (e.ts < t0) t0 = e.ts;
		const end = e.ts + (e.dur || 0); if (end > t1) t1 = end;
	}
	if (started && started.ts > t0 && started.ts < t1) t0 = started.ts;
	// the beat spans, merged, clipped to the window
	const spans = [];
	for (const b of beats) {
		const a = b, z = b + tail * 1000;
		const prev = spans[spans.length - 1];
		if (prev && a <= prev[1]) prev[1] = Math.max(prev[1], z); else spans.push([a, z]);
	}
	let covered = 0;
	for (const [a, z] of spans) { const lo = Math.max(a, t0), hi = Math.min(z, t1); if (hi > lo) covered += hi - lo; }
	const draws = events.filter((e) => viz.has(e.pid + ':' + e.tid) && e.name === 'Display::DrawAndSwap' && (e.ph === 'X' || e.ph === 'B')).map((e) => e.ts);
	const inSpan = (ts) => spans.some(([a, z]) => ts >= a && ts <= z);
	const kept = draws.filter((ts) => !inSpan(ts));
	const secs = (t1 - t0 - covered) / 1e6;
	return { drawnPerSec: secs >= 0.25 ? Math.round(kept.length / secs * 10) / 10 : null, kept: kept.length, draws: draws.length, beats: beats.length, secs: Math.round(secs * 100) / 100 };
}
