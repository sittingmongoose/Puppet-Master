// The replay of the idle warm-up queue's watch counter over its log (IDLE-WARM-RULE, src/js/11-motion-start.js), shared
// by checks/perf-warm-watch.check.mjs and its node test tools/warm-watch-replay.selftest.mjs. What it replays and what it
// fails on is written in the check's header.
export const KEEP = 16, STEADY_MS = 25;
// the least the queue's slow bar can be (lateMs() in 11-motion-start.js: Math.max(40, 3 * median()))
export const SLOW_FLOOR_MS = 40;

// steps: PM_WARM.log rows, oldest first. A row that records slow1/steady1/slow2/steady2/resetAt (the bars its two
// intervals were judged against, and which of them reset the count) is judged from those, unless a logged bar is
// under the product's floor (slow 40 ms, steady 25 ms, less the 0.1 ms logging rounding): impossible metadata is
// bracketed like an older row (R59 C1). An older row, which has only the bar of its last interval, is bracketed
// between that bar and the row before it. Rows with neither fall back to hz, the later display-rate sample.
export function replayWatch(steps, hz) {
	const gap = 1000 / hz, fallbackSteady = Math.max(STEADY_MS, 1.5 * gap), fallbackSlow = Math.max(40, 3 * gap);
	let steady = fallbackSteady, slow = fallbackSlow, adaptive = 0;
	// hi and lo: the highest and the lowest value the product's counter can have here (see the header). Logged intervals
	// are rounded to 1 ms, so a value within 1 ms of a bar counts for whichever side keeps the check from a false failure.
	let hi = 0, lo = 0, longest = 0, gpu = 0, watched = 0, unwatched = 0, overSlow = 0, resets = 0;
	const early = [], needless = [];
	// PM7PERF-WARMWATCH-BAR-IN-STEP (R18-4) and R53-C4. A row without per-interval bars logs the slow bar of its LAST
	// interval. The bar a step's d1 met can lie between that and the previous row's bar or, when the median dips and
	// recovers inside the step, under both (R53-C4). Those rows are bracketed: lo against the lower bar, hi against
	// the higher. A row with the per-interval fields and possible bars is not bracketed: resetAt is 1 or 2 for the interval that set the
	// count back to zero, or 0 when neither did, and slow1/slow2 are the bars that comparison used.
	let prevSlow = null;
	// PM7PERF-WARMWATCH-BARS-TRUSTED (R59 C1): the product's bars cannot be under their floors — lateMs() is
	// max(40, 3 x median) and the steady bar max(25, 1.5 x median) — and they are logged rounded to 0.1 ms.
	// A row logging a bar under its floor is impossible metadata, not an exact row: it is judged by the bracket
	// path below, as a row without the fields is, so a low logged bar cannot excuse a needless watch.
	// PM7PERF-WARMWATCH-ABOVE-FLOOR-BARS (R74 C1): the floors alone do not certify a plausible bar. The product
	// computes both bars from one shared median (note() in 11-motion-start.js: slow = max(40, 3m), steady =
	// max(25, 1.5m), each logged rounded to 0.1 ms), so a pair no median can produce (slow1 50 with steady1 45:
	// 50 implies m 16.7 and steady 25) is impossible metadata. Such a row falls to the bracket path and is judged
	// against the row's own bar, so a fabricated low bar cannot excuse a needless watch. Below 50 ms the steady
	// bar is at its 25 ms floor; at 50 and above it is half the slow bar. 0.2 ms covers both 0.1 ms roundings.
	const pairedBars = (s, st) => s < 50 ? Math.abs(st - STEADY_MS) <= 0.2 : Math.abs(st - s / 2) <= 0.2;
	const exactRow = (e) => [e.slow1, e.steady1, e.slow2, e.steady2].every((n) => Number.isFinite(n) && n > 0)
		&& e.slow1 >= SLOW_FLOOR_MS - 0.1 && e.slow2 >= SLOW_FLOOR_MS - 0.1
		&& e.steady1 >= STEADY_MS - 0.1 && e.steady2 >= STEADY_MS - 0.1
		&& pairedBars(e.slow1, e.steady1) && pairedBars(e.slow2, e.steady2)
		&& (e.resetAt === 0 || e.resetAt === 1 || e.resetAt === 2);
	for (const e of steps) {
		steady = Number.isFinite(e.steadyMs) && e.steadyMs > 0 ? e.steadyMs : fallbackSteady;
		slow = Number.isFinite(e.slowMs) && e.slowMs > 0 ? e.slowMs : fallbackSlow;
		if (steady === e.steadyMs && slow === e.slowMs) adaptive++;
		const slowLo = prevSlow == null ? slow : Math.min(prevSlow, slow), slowHi = prevSlow == null ? slow : Math.max(prevSlow, slow);
		prevSlow = slow;
		// the product's own word that the counter went back to zero since the row before, by an interval no row shows (an
		// admission frame, or a step the page's hiding left unjudged): it holds on any row, one without frameMs too
		if (e.watchReset === true) { hi = 0; lo = 0; resets++; }
		const fm = e.frameMs; if (!fm || !fm.length) continue;
		const worst = Math.max(...fm);
		if (exactRow(e)) {
			// resetAt is the decision, believed only when the interval it names reached its bar (within the 1 ms
			// rounding): a flag its own bar contradicts excuses nothing, and the row is then judged by its intervals
			// as a row without the fields is (R58 T3-2: a reset test that fires too eagerly logs its own excuse). An
			// interval that is plainly over its own bar counts as a reset too, so a row whose flag and bars disagree
			// the other way cannot hide a watch the bar required.
			const over = (v, bar) => v > bar + 1;
			const flagged = (k) => e.resetAt === k && fm.length >= k && fm[k - 1] >= (k === 1 ? e.slow1 : e.slow2) - 1;
			const reset1 = flagged(1) || over(fm[0], e.slow1), reset2 = flagged(2) || (fm.length > 1 && over(fm[1], e.slow2));
			const reset = reset1 || reset2;
			if (e.watched === false) {
				gpu++; unwatched++;
				// R58 T3-1: only a d1 reset proves the watch was dropped while it was needed. A step that is not light
				// is asked after both intervals, but a light chain's last step is asked after d1 only and notes d2
				// afterwards (unwatched() in 11-motion-start.js), so "unwatched, reset at interval 2" is the correct
				// queue's record, and the log does not say which kind a [d1, d2] row is. The d2 reset still sets the
				// count back for the steps that follow.
				if (reset1 || hi < KEEP) early.push(`${e.owner}:${e.name} at ${Math.round(e.t)} ms: at most ${hi} steady watches before it${reset1 ? ', and its first interval reset the count' : ''}`);
				if (reset) { hi = 0; lo = 0; overSlow++; }
			} else if (fm.length === 3) {
				gpu++; watched++;
				if (!reset && lo >= KEEP) needless.push(`${e.owner}:${e.name} at ${Math.round(e.t)} ms [${fm.join(', ')}] after ${lo} or more steady watches`);
				if (reset || worst > slow + 1) overSlow++;
				if (reset) { hi = 0; lo = 0; }
				// steadyMs is the bar watched() used after the watch's later frames. steady1 and steady2 are the bars
				// at d1 and d2, which are not that bar.
				// PM7PERF-WARMWATCH-WATCH-RESET-LOST (R60-T3-C1): a watch interval after d2 that was over the slow bar
				// of its moment set the product's count back to zero before watched() counted the step, and no field
				// records it (the median can rise afterwards, so the final steady bar hides it). No bar the row logs
				// bounds the bar of that moment: the median can dip and recover between them (R62-C1: every logged bar
				// 90, the reset against 40). Only the product's own floor does, max(40 ms, 3 x median): when the watch's
				// worst frame reaches it, the count may be 1, so the lower bound starts again from this step. The upper
				// bound keeps counting: only what is certain fails.
				const watchMayReset = fm[2] >= SLOW_FLOOR_MS - 1;
				if (worst <= steady - 1) { hi++; lo = watchMayReset ? 1 : lo + 1; }
				else if (worst <= steady + 1) { hi++; lo = 0; }
				else { hi = 0; lo = 0; }
			} else if (fm.length === 2) {
				// a cpu step. A light chain's last watched step has no d2 bar, so it is not an exact row.
				if (reset) { hi = 0; lo = 0; overSlow++; }
			}
			longest = Math.max(longest, lo);
			continue;
		}
		if (worst > slowHi + 1) { hi = 0; lo = 0; overSlow++; if (e.watched === false) { gpu++; unwatched++; } else if (fm.length === 3) { gpu++; watched++; } continue; }
		if (worst >= slowLo - 1) lo = 0;
		if (e.watched === false) {
			gpu++; unwatched++;
			if (hi < KEEP) early.push(`${e.owner}:${e.name} at ${Math.round(e.t)} ms: at most ${hi} steady watches before it`);
			continue;
		}
		if (fm.length === 3) {
			gpu++; watched++;
			if (lo >= KEEP && Math.max(fm[0], fm[1]) < slowLo - 1) needless.push(`${e.owner}:${e.name} at ${Math.round(e.t)} ms [${fm.join(', ')}] after ${lo} or more steady watches`);
			if (worst <= steady - 1) { hi++; lo++; } else if (worst <= steady + 1) { hi++; lo = 0; } else { hi = 0; lo = 0; }
		} else if (fm.length === 2) {
			// a cpu step (not counted) or a light chain's last watched step (counted, or a reset when over the steady bar)
			if (worst <= steady + 1) hi++; else lo = 0;
		}
		longest = Math.max(longest, lo);
	}
	return { steady, slow, adaptive, gpu, watched, unwatched, overSlow, resets, longest, early, needless };
}
