// The idle warm-up queue watches the frames after a GPU step only while this computer shows it is needed
// (IDLE-WARM-RULE, src/js/11-motion-start.js; 2026-11-11, lane B, 288d8dabc8).
//
// After each GPU step the queue used to hold a frame loop for 300 ms on every computer, because on the VM's Quadro
// P1000 a program links 100 to 350 ms after the step's frame. On a computer whose frames come back on time that watch
// catches nothing and is the queue's whole cost: on the RTX 3090 the queue worked for 317 s after a load and asked for
// 33,600 frames; with the rule below 111 s and 9,000. The rule, one for every computer: a GPU step is watched from the
// start; after 16 watched steps in a row with every interval on time (25 ms, or 1.5x the refresh interval on a slower
// screen) a GPU step is judged by its two intervals alone and logged `watched: false`; an interval over that bar brings
// the watch back for the next 16.
//
// The check loads the page with the queue ON and the pointer parked, takes no trace (a trace's own hitches would be
// blamed on the queue's steps), and reads the queue's own log (PM_WARM.log, the last 200 steps: polled and joined, so
// the whole run from the load is judged). It replays the rule's counter over the log. The counter goes up by one for a
// watched GPU step whose every interval is within the steady bar, back to zero for a watched step with one over it, and
// back to zero for ANY judged interval over the slow bar (max(40 ms, 3x the refresh interval)). The log does not say
// whether a two-interval row is a cpu step (no part in the counter) or a light chain's last watched step (counted), so
// Product rows carry steadyMs/slowMs from the queue's rolling median; older logs fall back to the later sampled
// display rate. The replay keeps the highest and the lowest value the counter can have had, and fails only on what is certain.
// Intervals the queue notes but no row shows set the counter back to zero too: the two frames it looks at before
// admitting a step (an admission attempt, admitted or not, writes no row) and those of a step whose judging the page's
// hiding cut short (its row has frameMs null). For those the product writes watchReset: true on the next row it logs,
// whatever that row is (a step, or one 'skipped' or 'dropped' without frameMs): since the row before it, an interval
// over the slow bar that no row's frameMs shows set the count of steady watches back to zero. The replay sets both
// bounds to zero on such a row, before judging it (lane C3, the R1 review: without it a slow admission frame after 16
// steady watches made the next, rightly watched, step "needless"; tools/warm-watch-replay.selftest.mjs replays that):
//   a. a step logged `watched: false` while even the highest possible count is under 16: the watch was dropped early;
//   b. a three-interval row (a watched GPU step, certainly) whose own first two intervals are within the slow bar while
//      even the lowest possible count is 16 or more: the watch was kept when the rule drops it. This is what the page
//      before the fix fails: there every GPU step is watched.
// On a computer that never shows 16 steady watches in a row (the P1000: its longest run was 11 in 1,855 steps) rule b
// has nothing to judge; the check says so in a NOTE and judges rule a alone. --set need=steady makes that a failure,
// for a run that is meant to prove rule b (the Windows host, the Mac).
//
// --set wait=<s>   how long to follow the queue at most (default 200; it ends earlier when the queue is empty)
// --set look=<look> (default glass-dark: Liquid Glass's catalog is the long GPU owner)
// Both surfaces. Fewer than 40 GPU steps judged (warming off, software rendering, a page that never went idle) fails as
// "could not judge".
import { muteSound, refreshRate, parkPointer } from '../helpers/quiet-page.mjs';
import { KEEP, replayWatch } from '../helpers/warm-watch-replay.mjs';

export default async function (t) {
	const W = 1920, H = 1080, look = String(t.args.look || 'glass-dark'), waitS = Number(t.args.wait || 200);
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open();
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.app.look(look);
	await parkPointer(t.page, W, H);

	const seen = new Map(); let state = null, lastNew = Date.now();
	const until = Date.now() + waitS * 1000;
	while (Date.now() < until) {
		const snap = await f.evaluate(() => {
			const w = window.PM_WARM; if (!w) return null;
			return { state: w.state(), log: (w.log || []).map((e) => ({ t: e.t, owner: e.owner, name: e.name, frameMs: e.frameMs || null, outcome: e.outcome, watched: e.watched, watchReset: e.watchReset, steadyMs: e.steadyMs, slowMs: e.slowMs })) };
		});
		if (!snap) { await t.check('the page has the warm-up queue (PM_WARM)', false, 'window.PM_WARM is missing: could not judge'); return; }
		state = snap.state;
		for (const e of snap.log) { const k = `${e.t}|${e.owner}|${e.name}`; if (!seen.has(k)) { seen.set(k, e); lastNew = Date.now(); } }
		// the queue is done: nothing queued, nothing running, and no new step for 8 s
		if (seen.size && state && !state.queued && !state.running && Date.now() - lastNew > 8000) break;
		if (state && (state.off || state.session)) break;
		await t.page.waitForTimeout(3000);
	}
	const hz = await refreshRate(f);
	const steps = [...seen.values()].sort((a, b) => a.t - b.t);
	const { steady, slow, adaptive, gpu, watched, unwatched, overSlow, resets, longest, early, needless } = replayWatch(steps, hz);
	t.log(`${look}: ${hz.toFixed(0)} Hz, last steady bar ${steady.toFixed(1)} ms, slow bar ${slow.toFixed(1)} ms (${adaptive} rows carry adaptive bars; older rows use the display rate); ${steps.length} steps logged, ${gpu} GPU steps (${watched} watched, ${unwatched} not), ${overSlow} rows with an interval over the slow bar, ${resets} rows saying watchReset, longest certain run of steady watches ${longest}; queue ${JSON.stringify(state)}`);
	const judged = gpu >= 40;
	await t.check('the queue ran GPU steps here', judged, `${gpu} GPU steps in ${steps.length} logged steps${judged ? '' : ` (queue ${JSON.stringify(state)}): could not judge`}`);
	if (!judged) return;
	await t.check('a. no GPU step goes unwatched before 16 watches in a row came back on time', early.length === 0, early.length ? `${early.length}: ${early.slice(0, 4).join('; ')}` : `${unwatched} unwatched steps, each after 16 or more steady watches`);
	if (longest >= KEEP) {
		await t.check('b. after 16 steady watches a GPU step with its own two intervals on time is not watched', needless.length === 0 && unwatched > 0, needless.length ? `${needless.length} watched needlessly: ${needless.slice(0, 3).join('; ')}` : `${unwatched} steps judged by their two intervals`);
	} else if (String(t.args.need || '') === 'steady') {
		await t.check('b. this computer shows 16 steady watches in a row (--set need=steady)', false, `longest run ${longest}: rule b could not be judged here`);
	} else t.log(`NOTE this computer never showed ${KEEP} steady watches in a row (longest ${longest}): the watch rightly stays, and rule b (dropping it) is not judged here. Run on the Windows host or the Mac with --set need=steady to prove it.`);
}
