// The replay of the idle warm-up queue's watch counter over its log (IDLE-WARM-RULE, src/js/11-motion-start.js), shared
// by checks/perf-warm-watch.check.mjs and its node test tools/warm-watch-replay.selftest.mjs. What it replays and what it
// fails on is written in the check's header.
export const KEEP = 16, STEADY_MS = 25;

// steps: PM_WARM.log rows ({ t, owner, name, frameMs, watched }), oldest first; hz: the display's refresh rate.
export function replayWatch(steps, hz) {
	const gap = 1000 / hz, steady = Math.max(STEADY_MS, 1.5 * gap), slow = Math.max(40, 3 * gap);
	// hi and lo: the highest and the lowest value the product's counter can have here (see the header). Logged intervals
	// are rounded to 1 ms, so a value within 1 ms of a bar counts for whichever side keeps the check from a false failure.
	let hi = 0, lo = 0, longest = 0, gpu = 0, watched = 0, unwatched = 0, overSlow = 0, resets = 0;
	const early = [], needless = [];
	for (const e of steps) {
		// the product's own word that the counter went back to zero since the row before, by an interval no row shows (an
		// admission frame, or a step the page's hiding left unjudged): it holds on any row, one without frameMs too
		if (e.watchReset === true) { hi = 0; lo = 0; resets++; }
		const fm = e.frameMs; if (!fm || !fm.length) continue;
		const worst = Math.max(...fm);
		if (worst > slow + 1) { hi = 0; lo = 0; overSlow++; if (e.watched === false) { gpu++; unwatched++; } else if (fm.length === 3) { gpu++; watched++; } continue; }
		if (worst >= slow - 1) lo = 0;
		if (e.watched === false) {
			gpu++; unwatched++;
			if (hi < KEEP) early.push(`${e.owner}:${e.name} at ${Math.round(e.t)} ms: at most ${hi} steady watches before it`);
			continue;
		}
		if (fm.length === 3) {
			gpu++; watched++;
			if (lo >= KEEP && Math.max(fm[0], fm[1]) < slow - 1) needless.push(`${e.owner}:${e.name} at ${Math.round(e.t)} ms [${fm.join(', ')}] after ${lo} or more steady watches`);
			if (worst <= steady - 1) { hi++; lo++; } else if (worst <= steady + 1) { hi++; lo = 0; } else { hi = 0; lo = 0; }
		} else if (fm.length === 2) {
			// a cpu step (not counted) or a light chain's last watched step (counted, or a reset when over the steady bar)
			if (worst <= steady + 1) hi++; else lo = 0;
		}
		longest = Math.max(longest, lo);
	}
	return { steady, slow, gpu, watched, unwatched, overSlow, resets, longest, early, needless };
}
