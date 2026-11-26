// The still page (PERF-3, the owner's choice B, 2026-11-11: "pause the icons after a while without input").
//
// Before it, the page's endless decorative loops (breathing marks, spinning rings, loaders, working pulses) kept the
// compositor drawing on every refresh with nobody at the page: about 119 frames a second at 120 Hz in every look, Glass
// Dark Home 450 ms a second of GPU-thread time against 62 with them paused (pm7-perf lane E's P1). Now, after
// STILL_AFTER (20 s) with no pointer move, press, wheel, key or touch, src/js/14-shell-still.js puts data-pm-still on
// <html> and marks the element of every endless CSS animation (data-pm-held), and css/21-shell-still.css holds what is
// marked where it is, until the next input.
//
// TEST HOOK, not a product setting: the page is opened with ?pm-still=<ms> (read once by the script, as ?pm-warm=0 is)
// so a cell waits 3 s instead of 20. One cell (Basic Dark Home, --set real=0 skips it) runs without it and judges the
// real 20 s: not still at 18 s, still at 23 s.
//
// Per look and view (Settings, Home, Usage), after a real pointer move:
//   (b) before the wait is up the page is not still, nothing is marked and its endless loops run as before;
//   (a) STILL_AFTER + 3 s after the input: no endless animation is running in document.getAnimations() (the code
//       editor's caret is exempt: it is a text cursor, in a closed shadow root no page rule reaches), every mark holds
//       an endless loop (no stray mark), no finite animation is held; and, once no finite animation runs, the display
//       compositor draws at most 15 frames a second (--set drawn=), the main thread renders at most 10 (--set main=:
//       frame starts less those Chrome abandons with nothing to update) and starts at most 0.45 of the refresh
//       measured before the page goes still, capped at 60 (--set starts= is that cap; Settings)
//       in at least one of three 2 s traces (a toast leaving or a live update between them is not a loop). Usage shows
//       live data (its numbers tween after each demo update, the demo engine ticks every 250 ms): its frames are logged
//       with the script blocks that draw them, never judged. Home's dashboard is live too (the hosted Usage board beats
//       every 3 demo ticks): its still window is placed between two beats, and a beat that still lands in it has its own
//       frames taken out of the draw count and the window (PM7PERF-STILLPAGE-HOME-LIVE-TICKS, helpers/still-home-live.mjs);
//       its compositor frames are judged and its main frames logged. Jared's card held the icons, not live data;
//   (c) one real pointer move wakes it in that event: every animation it held is running again within 100 ms of the
//       move, its currentTime ahead of where it was held by the time since the wake less that start (not reset, no
//       jump);
//   the toggle's own cost: the frame that holds the loops and the first frame after the waking move each restyle at
//   most 3H + 19 elements, H the unique elements actually marked for this toggle. Across 42+60 measured toggles,
//   H=21–92 and R/H=2.033–2.792, with max(R-2H)=19: about two per held element plus nineteen independent of H.
//   The lead's bound allows three per held element so a few unrelated elements in the frame do not fail it.
//   Every toggle logs its exact marked population and animation names. The old selector generator's 650–730
//   elements at about fifty loops still exceeds its limit169 widely, and Usage118/H21 still exceeds82.
//   Controlled 17-product-loader validation adds68 marked groups (H=92,R=187–192), versus H=24/R=51–58.
//   the frame's length and the next frames' recalcs are logged.
//   Before each look's measured cells, visit Usage and let its real first-drag prewarm finish once. That six-frame
//   cloned-card rehearsal has its own 1200ms timer -> PM_BUSY.idle admission, not PM_WARM's queue (pm-warm=0 does not
//   disable it). PREWARMED is cached per board/look/Reduced-Motion state, never per idle interval or Usage revisit.
//   Consuming it keeps that independent job out of the toggle frame without disabling, canceling or altering it.
//   A counter assertion exposes any repeat. One forced real step-three collision is retained as a logged control;
//   its restyle count is not judged as the toggle's cost. perf-still-prewarm forces five and measures 30 after completion.
//   Attribution: five forced R=135,114,116,114,116 (H=24, median116 near the recorded118); 30 after completion R=51–54,
//   H=24, all within91, with one rehearsal across those toggles, 12 more resting seconds and a same-look Usage revisit.
// Key, window resize and a real hidden/visible tab round trip each wake from a separately asserted still state.
// Then (d) with Reduced Motion on the page never goes still, marks nothing and its running loops stay as they were;
// and (e) with the onboarding window open, and during the Guided Tour, the page never goes still: an open while still
// lets the loops go at once (the app beneath is held by the window's own rule, and the stage keeps its own loop; the
// tour shows the app and its words describe marks that move), and after the window closes the page goes still again.
//
// --set looks=<a,b|all>  default all ten; --set views=settings,dashboard,usage; --set after=<ms> (default 3000)
// --set ms=<ms>          rest trace length (default 2000)
// --set framesBy=1       diagnosis, off by default: each rest trace also says what asked for its main frame starts
//                        (logged per try, and named in a failing frames row)
// Runs on both surfaces (--set sandbox=0 and 1). Main's page (no still page) fails (a), (c), (e) and the 20 s cell.
// A try whose trace names no renderer main thread measured no main frames (they and the layouts read 0): Settings'
// main-frame rows fail as could not judge, never pass on the zeros (PM7PERF-NO-RENDERER-READS-ZERO). Home's drawn row
// fails the same way when a live beat covered all three tries, instead of judging a rate the beat's own draws fill (F5-1).
import { TRACE_CATEGORIES, summarise, frameStarts } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { pageSource, blocksOf, blockAt } from '../helpers/built-source.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { toggleCost } from '../helpers/still-toggle-cost.mjs';
import { installUsageLiveWatch, usageWritesBeforeRecalc } from '../helpers/still-usage-live.mjs';
import { installToggleFiniteWatch } from '../helpers/still-finite.mjs';
import { installPrewarmProbe, prewarmSnapshot, consumeUsagePrewarm } from '../helpers/still-prewarm.mjs';
import { forcedPrewarm } from '../helpers/still-prewarm-control.mjs';
import { installHomeLiveWatch, readHomeLive, homeBeatPlan, beatFreeDrawn, homeDrawnRow } from '../helpers/still-home-live.mjs';
import { traceJudgeable } from '../helpers/trace-guard.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
// a Home beat's draws last about this long after it (patch slices, lead light, the 600 ms Live-mark pulse, odometer)
const HOME_BEAT_TAIL = 1200;

// In the page: every animation, endless or not, with what it is; the endless ones that run are kept for (c)
export const CENSUS = async () => {
	const desc = (el) => { if (!el) return 'none'; const c = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || ''; return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c.trim() ? '.' + c.trim().split(/\s+/).slice(0, 3).join('.') : ''); };
	const out = { still: document.documentElement.hasAttribute('data-pm-still'), hasScript: !!window.PM_STILL, marks: document.querySelectorAll('[data-pm-held]').length, marked: [], run: [], runAt: [], held: 0, exempt: [], finPaused: [], finRun: 0, finList: [], stray: [], now: performance.now(), stillAt: window.__stillOnAt ?? null };
	const keep = [];
	const pending = [];
	const catalog = new Map();
	for (const a of document.getAnimations()) {
		let it = 1; try { it = a.effect.getTiming().iterations; } catch (e) { /* none */ }
		const el = a.effect && a.effect.target;
		const name = (a.animationName || (a.constructor && a.constructor.name) || '?') + (a.effect && a.effect.pseudoElement ? ' ' + a.effect.pseudoElement : '');
		const what = `${name} on ${desc(el)}`;
		if (it === Infinity) {
			if (el) { if (!catalog.has(el)) catalog.set(el, []); catalog.get(el).push({ part: a.effect.pseudoElement ? a.effect.pseudoElement.replace(/^::?/, '') : 'self', name: a.animationName || '?', iterations: 'infinite' }); }
			const caret = !!(el && el.getRootNode && el.getRootNode() !== document && el.classList && el.classList.contains('pmw-ed-caret'));
			// held by the still state: paused on an element marked for the part it runs on (the page holds some loops of
			// its own, NieR's motes on Usage for one: those stay held after the wake)
			const markedPart = !!(el && el.getAttribute && (el.getAttribute('data-pm-held') || '').split(' ').includes(a.effect.pseudoElement ? a.effect.pseudoElement.replace(/^::?/, '') : 'self'));
			// each running loop's start (document timeline time, performance.now()'s clock), its mark and whether a finite
			// animation runs on the same element (the page waits for that to end before it holds the loop)
			if (a.playState === 'running') {
				if (caret) out.exempt.push(what);
				else {
					out.run.push(what); keep.push(a);
					const rec = { what, start: a.startTime, state: a.playState, pending: !!a.pending, currentTime: a.currentTime ?? null, held: (el && el.getAttribute && el.getAttribute('data-pm-held')) || '', finite: !!(el && el.getAnimations && el.getAnimations().some((x) => { try { return x !== a && x.effect && x.effect.target === el && x.playState === 'running' && x.effect.getTiming().iterations !== Infinity; } catch (e) { return false; } })) };
					out.runAt.push(rec);
					if (rec.pending && rec.start == null && (rec.currentTime == null || rec.currentTime === 0)) pending.push([a, rec]);
				}
			} else if (a.playState === 'paused' && markedPart) { out.held++; keep.push(a); }
		} else if (a.playState === 'paused') out.finPaused.push(what);
		else if (a.playState === 'running') { out.finRun++; if (out.finList.length < 6) { let d = 0; try { d = Math.round(a.effect.getComputedTiming().activeDuration); } catch (e) { /* none */ } out.finList.push(`${what} (${d} ms)`); } }
	}
	window.__stillKeep = keep;
	window.__stillCatalog = catalog;
	// every mark holds an endless loop on the part it names (a stray mark could hold something finite)
	for (const el of document.querySelectorAll('[data-pm-held]')) {
		const item = { element: desc(el), parts: [] };
		for (const p of (el.getAttribute('data-pm-held') || '').split(' ').filter(Boolean)) {
			const anims = el.getAnimations({ subtree: true }).filter((x) => x.effect && x.effect.target === el && (x.effect.pseudoElement ? x.effect.pseudoElement.replace(/^::?/, '') : 'self') === p);
			item.parts.push({ part: p, animations: anims.map((x) => ({ name: x.animationName || x.constructor?.name || '?', state: x.playState, iterations: x.effect.getTiming().iterations === Infinity ? 'infinite' : x.effect.getTiming().iterations })) });
			if (!anims.some((x) => { try { return x.effect.getTiming().iterations === Infinity; } catch (e) { return false; } })) out.stray.push(`${p} on ${desc(el)}`);
		}
		out.marked.push(item);
	}
	if (pending.length) {
		const pendingAfterFrames = 4;
		for (let i = 0; i < pendingAfterFrames; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
		for (const [a, rec] of pending) {
			rec.pendingAfterFrames = pendingAfterFrames;
			rec.stillPending = !!(a.pending && a.start == null && (a.currentTime == null || a.currentTime === 0));
		}
		out.pendingRecheckMs = Math.round(performance.now() - out.now);
	}
	return out;
};

// The try the frame rows judge (R51 F2): the first one that meets every bound its view judges ends the tries and is the
// one judged; while none has, the quietest so far by the view's own ranking. Ranking a passing try against an earlier
// failing one kept (drawn 1, rendered 1, starts 80) over (2, 1, 40), and the starts row then failed what one of the
// three tries had met. j is stillJudged(view, bounds): { rows, meets(r), score(r) }; a smaller score (compared in
// order) is quieter.
export function stillPick(x, r, j) {
	if (j.meets(r)) return { x: r, done: true };
	if (!x) return { x: r, done: false };
	const a = j.score(r), b = j.score(x);
	const i = a.findIndex((v, k) => v !== b[k]);
	return { x: i >= 0 && a[i] < b[i] ? r : x, done: false };
}
// The frame rows each view judges, and so what ends its tries (R53-C1, R54 F1): Settings judges drawn, rendered and
// starts; Home only what the compositor draws (its widgets tick, so its main frames are logged, not judged), ranked by
// drawn first; Usage is live data and judges none of them: its tries still stop at the first quiet one by drawn and
// rendered frames, as before, so its logged numbers stay comparable (nothing is judged from them).
// At most `share` starts per refresh, and never more than `cap` a second. 0.45 of 60 Hz is 27, so a
// do-nothing loop on a 60 Hz display fails; 0.45 of 238 Hz is above 60, so the cap keeps main's 3 to 41.
export function stillStartsBound(hz, { share = 0.45, cap = 60 } = {}) {
	if (!(hz > 0)) return NaN;
	return Math.min(cap, share * hz);
}
export function stillJudged(view, { drawn = 15, main = 10, starts = 60, hz = null, share = 0.45 } = {}) {
	const startCap = hz == null ? starts : stillStartsBound(hz, { share, cap: starts });
	const d = (q) => q.drawn.perSec, m = (q) => q.mainFrames.renderedPerSec, s = (q) => q.mainFrames.perSec;
	const startsOk = (q) => Number.isFinite(startCap) && s(q) <= startCap;
	if (view === 'usage') return { rows: [], meets: (q) => d(q) <= drawn && m(q) <= main, score: (q) => [d(q) + m(q), s(q)], startCap, hz };
	if (view === 'dashboard') return { rows: ['drawn'], meets: (q) => d(q) <= drawn, score: (q) => [d(q), m(q), s(q)], startCap, hz };
	return { rows: ['drawn', 'rendered', 'starts'], meets: (q) => d(q) <= drawn && m(q) <= main && startsOk(q), score: (q) => [d(q) + m(q), s(q)], startCap, hz };
}

// The 23 s Home census split (PM7PERF-STILL-PENDING-AGE): a queued animation (Chrome's pending flag, null start,
// current time 0) is rechecked after four frames. One that starts in that budget is logged, not judged; one still
// pending is due. An older loop (started before the still mark, or more than lookAgain before the census, or an
// unclassified null start) is due; one that began after the still mark and less than lookAgain before the census is
// young, logged. Exported for tools/still-home-census.selftest.mjs.
export function stillHomeDue(runAt, { stillAt, now, lookAgain = 5000 }) {
	const queued = runAt.filter((r) => r.pending && r.start == null && (r.currentTime == null || r.currentTime === 0) && !r.stillPending);
	const due = runAt.filter((r) => !queued.includes(r) && (stillAt == null || r.start == null || r.start < stillAt || now - r.start > lookAgain));
	const young = runAt.filter((r) => !due.includes(r) && !queued.includes(r));
	return { due, young, queued };
}

// The still state's marks in a trace's events and, per mark, the style recalcs of the page's main thread after it
// (exported for tools/still-toggle-recalc.selftest.mjs): { marks, after(first, last) }
export function toggleRecalcs(events, keep = null) {
	// the marks come from the page's own main thread: its style recalcs and main frames are those of the same thread
	const marks = {}, styles = [], frames = [];
	let pid = null, tid = null;
	for (const e of events) {
		if (e.cat && e.cat.includes('blink.user_timing') && /^pm-still:/.test(e.name) && !(e.name in marks)) { marks[e.name] = e.ts; pid = e.pid; tid = e.tid; }
	}
	for (const e of events) {
		if (e.pid !== pid || e.tid !== tid || e.ph !== 'X') continue;
		// a recalc with no element count is unmeasured (null), never a measured zero (PM7PERF-STILL-MISSING-COUNT); the
		// toggle's cost is then unjudgeable, as perf-hover-restyle treats such a sample
		if (e.name === 'UpdateLayoutTree') { const n = e.args?.elementCount ?? e.args?.endData?.elementCount; styles.push({ ts: e.ts, dur: (e.dur || 0) / 1000, n: Number.isFinite(n) && n >= 0 ? n : null }); }
		if (e.name === 'ProxyMain::BeginMainFrame') frames.push({ ts: e.ts, dur: (e.dur || 0) / 1000 });
	}
	// the style recalcs from the mark to a few frames after it: the first (the one that carries the toggle; for a wake,
	// the first frame after the pointer move) is judged, the largest and the total are logged (a live update in Usage can
	// land in the same frames)
	// The first recalc after the mark is the toggle's however late it comes (the invalidation stays pending until a
	// recalc runs), and the logged spread is the 60 ms after it (PM7PERF-PREWARM-CONTROL-NULL: the window used to end
	// 60 ms after the MARK, and with the forced prewarm step and three browsers on Alexis one toggle's recalc came later,
	// so it read "no recalc" (R=null) though one ran). `delayMs` says how late it was.
	const spread = (first, last) => {
		const a = marks[first], b = marks[last]; if (a === undefined) return null;
		const head = styles.filter((x) => x.ts >= a).sort((p, q) => p.ts - q.ts)[0];
		if (!head) return { found: false, markTs: a };
		const end = Math.max(b === undefined ? a : b, head.ts) + 60000;
		const ss = styles.filter((x) => x.ts >= a && x.ts <= end).sort((p, q) => p.ts - q.ts);
		const big = ss.reduce((m, x) => (m.n == null || (x.n != null && x.n > m.n) ? x : m), ss[0]);
		const fr = frames.find((f) => f.ts <= ss[0].ts && f.ts + f.dur * 1000 >= ss[0].ts);
		const r2 = (x) => Math.round(x * 100) / 100;
		return { found: true, steps: ss.length, max: big.n, maxMs: r2(big.dur), total: ss.some((x) => x.n == null) ? null : ss.reduce((t2, x) => t2 + x.n, 0), totalMs: r2(ss.reduce((t2, x) => t2 + x.dur, 0)), first: ss[0].n, firstFrameMs: fr ? r2(fr.dur) : null, markTs: a, recalcTs: ss[0].ts, recalcEndTs: ss[0].ts + ss[0].dur * 1000, delayMs: r2((ss[0].ts - a) / 1000), traceFile: keep, done: b !== undefined };
	};
	return { marks, after: spread };
}

// The trace that must contain the still toggle (PM7PERF-STILLPAGE-TOGGLE-TRACE-START, TB5 note): the old trace was a
// fixed 1200 ms from 400 ms before the nominal toggle, so a still timer late under load landed its mark after
// Tracing.end and the cost row read restyled:null (unjudgeable; TB5 saw it on 1-3 cells in each of four runs, and in
// its old-code A/B). While the trace is open, poll the page's still state until it is set (or --set toggleWait passes)
// and keep the trace open `settleMs` more for the toggle's recalc and its first frame, so the toggle is inside it.
// Returns { saw, sawAfterMs }; the caller reports could not judge by name when no mark reached the trace.
export const waitStill = async (isStill, { waitMs = 8000, pollMs = 50, settleMs = 300, now = () => Date.now(), sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) => {
	const t0 = now();
	let saw = false, sawAfterMs = null;
	for (;;) {
		if (await isStill()) { saw = true; sawAfterMs = Math.round(now() - t0); break; }
		if (now() - t0 >= waitMs) break;
		await sleep(pollMs);
	}
	await sleep(settleMs);
	return { saw, sawAfterMs };
}

// One trace of `ms`, with what `during` does, summarised, plus the marks and the style recalcs of the page's renderer
export async function trace(cdp, { ms, during, url, keep, track = false, by = false }) {
	await cdp.send('Tracing.start', { categories: TRACE_CATEGORIES + (track ? ',disabled-by-default-devtools.timeline.invalidationTracking,disabled-by-default-devtools.timeline.stack' : ''), transferMode: 'ReturnAsStream', bufferUsageReportingInterval: 0 });
	const until = Date.now() + ms;
	try { if (during) await during(); } finally { const left = until - Date.now(); if (left > 0) await new Promise((r) => setTimeout(r, left)); }
	const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
	await cdp.send('Tracing.end');
	const { stream } = await complete;
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	const raw = parts.join('');
	if (keep) { mkdirSync(dirname(keep), { recursive: true }); writeFileSync(keep, gzipSync(raw)); }
	const json = JSON.parse(raw);
	const sum = summarise(json, { url });
	const events = json.traceEvents || json;
	if (by) sum.startsBy = frameStarts(events, sum.renderer);
	const { after, marks } = toggleRecalcs(events, keep);
	return { sum, after, marks, events };
}

// Time the idle row in the app frame. The toggle trace can still be open after this deadline.
export const installStillDeadline = () => {
	const root = document.documentElement;
	window.__stillOnAt = null;
	window.__stillDeadline = null;
	new MutationObserver(() => {
		const idle = window.__stillDeadline;
		if (!idle) return;
		const now = performance.now();
		const still = root.hasAttribute('data-pm-still');
		if (still && window.__stillOnAt == null) window.__stillOnAt = now;
		if (now <= idle.deadlineAt) idle.still = still;
	}).observe(root, { attributes: true, attributeFilter: ['data-pm-still'] });
	window.__armStillDeadline = (idleMs) => {
		window.__stillOnAt = null;
		window.__stillDeadline = null;
		window.addEventListener('pointermove', (event) => {
			if (!event.isTrusted) return;
			const inputAt = performance.now();
			window.__stillDeadline = { inputAt, deadlineAt: inputAt + idleMs, still: root.hasAttribute('data-pm-still') };
		}, { capture: true, once: true });
	};
};

// Marks the state's changes in the trace (a check-side observer: the product writes no marks)
export const MARKER = () => {
	if (window.__stillMarker) return true;
	window.__stillMarker = new MutationObserver(() => {
		try {
			const on = document.documentElement.hasAttribute('data-pm-still');
			performance.mark(on ? 'pm-still:on' : 'pm-still:off');
			window.__stillToggleFinite = null;
			if (on) {
				window.__stillTogglePopulation = null;
				// DOM attributes and the pre-toggle animation catalog only: no style/geometry read in the measured task.
				const marked = [...document.querySelectorAll('[data-pm-held]')].map((el) => {
					const cls = typeof el.className === 'string' ? el.className : el.className?.baseVal || '';
					const animations = window.__stillCatalog?.get(el) || [];
					return { element: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${cls.trim().split(/\s+/).join('.')}`,
						parts: el.getAttribute('data-pm-held').split(' ').filter(Boolean).map((part) => ({ part, animations: animations.filter((a) => a.part === part) })) };
				});
				window.__stillTogglePopulation = { marks: marked.length, marked, held: marked.reduce((n, e) => n + e.parts.reduce((m, p) => m + p.animations.length, 0), 0) };
			}
			window.__stillToggleFinite = window.__stillFiniteAtMark ? window.__stillFiniteAtMark() : null;
		} catch (e) { /* a missing population makes the cost unjudgeable */ }
	});
	window.__stillMarker.observe(document.documentElement, { attributes: true, attributeFilter: ['data-pm-still'] });
	return true;
};

// Until no finite animation runs (a toast leaving, an entrance), at most `ms`
const QUIET = (ms) => new Promise((resolve) => {
	const t0 = performance.now();
	const look = () => {
		const busy = document.getAnimations().some((a) => { try { return a.playState === 'running' && a.effect.getTiming().iterations !== Infinity; } catch (e) { return false; } });
		if (!busy || performance.now() - t0 > ms) resolve(!busy); else setTimeout(look, 200);
	};
	look();
});

export default async function (t) {
	const looks = String(t.args.looks || 'all') === 'all' ? ALL : String(t.args.looks).split(',').filter(Boolean);
	const views = String(t.args.views || 'settings,dashboard,usage').split(',').filter(Boolean);
	const after = Number(t.args.after || 3000), ms = Number(t.args.ms || 2000);
	const toggleWaitArg = String(t.args.toggleWait ?? 8000).trim();
	const toggleWait = Number(toggleWaitArg);
	if (!toggleWaitArg || !Number.isFinite(toggleWait) || toggleWait < 0) {
		throw new Error('--set toggleWait must be a finite nonnegative number of milliseconds');
	}
	const drawnMax = Number(t.args.drawn || 15), mainMax = Number(t.args.main || 10), startsMax = Number(t.args.starts || 60);
	// --set framesBy=1 (diagnosis, logged only): each rest trace also says what asked for its main frame starts
	const framesBy = String(t.args.framesBy || '0') === '1';
	const W = 1920, H = 1080;
	const toggleRows = [];
	let toggleTraceSeq = 0;
	const toggleTraceOptions = (look, view, phase) => ({ track: String(t.args.toggleTrack || '0') === '1', keep: t.args.toggleTraceDir ? join(String(t.args.toggleTraceDir), `${look}-${view}-${phase}-${toggleTraceSeq++}.json.gz`) : null });
	const recordToggle = (look, view, phase, recalc, state) => {
		const animations = {};
		for (const item of state.marked) for (const p of item.parts) for (const a of p.animations) animations[a.name] = (animations[a.name] || 0) + 1;
		const row = { look, view, phase, restyled: recalc?.found ? recalc.first : null, markedElements: state.marks, heldAnimations: state.held, animations, marked: state.marked, traceFile: recalc?.traceFile, markTs: recalc?.markTs, recalcTs: recalc?.recalcTs, liveWrites: recalc?.liveWrites, liveWatchKnown: recalc?.liveWatchKnown, finiteSnapshot: recalc?.finiteSnapshot };
		row.cost = toggleCost(row.restyled, row.markedElements);
		toggleRows.push(row);
		t.log(`${look} ${view} TOGGLE ${phase}: ${JSON.stringify({ restyled: row.restyled, markedElements: row.markedElements, heldAnimations: row.heldAnimations, animations, cost: row.cost, liveWrites: row.liveWrites, liveWatchKnown: row.liveWatchKnown, finiteSnapshot: row.finiteSnapshot, traceFile: row.traceFile, markTs: row.markTs, recalcTs: row.recalcTs })}`);
		return row.cost;
	};
	let px = 0; // the waking moves go to a new point each time, so each is a real move
	const move = async () => { px = (px + 1) % 6; await t.page.mouse.move(W - 6, Math.round(H / 2) + px * 24 - 60); };
	await t.viewport(W, H);
	await muteSound(t.page);

	// A separate fresh document keeps the actual-callback control from affecting the measured matrix's cache.
	await forcedPrewarm(t, { after, settle: Number(t.args.settle ?? 40000), CENSUS, MARKER, trace,
		traceDir: t.args.toggleTraceDir ? join(String(t.args.toggleTraceDir), 'prewarm-control') : null });

	// ---- the real wait: one cell without the hook ----
	if (String(t.args.real ?? '1') !== '0') {
		const f0 = await t.app.open({ query: 'pm-warm=0' });
		// when the page went still (PM7PERF-STILL-OBS-ENDLESS-ONCE: one Alexis run read five loops running at 23 s and
		// kept neither that time nor their starts, so loops that began after the still mark, which the page marks as
		// they start or at its next look 4 s on, could not be told from loops it never held)
		await f0.evaluate(() => { window.__stillOnAt = null; new MutationObserver(() => { if (window.__stillOnAt == null && document.documentElement.hasAttribute('data-pm-still')) window.__stillOnAt = performance.now(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-pm-still'] }); });
		await t.app.look('basic-dark');
		await f0.evaluate(() => PM_PAGES.go('dashboard'));
		await move();
		await t.page.waitForTimeout(18000);
		const at18 = await f0.evaluate(CENSUS);
		await t.page.waitForTimeout(5000);
		const at23 = await f0.evaluate(CENSUS);
		// judged: a loop running at 23 s that began before the still mark (held at the toggle) or more than LOOK_AGAIN
		// (4 s) + 1 s before the census (its next look would have held it); logged: one that began since, with its age
	const lookAgain = 5000;
	const age = (r) => r.start == null ? null : Math.round(at23.now - r.start);
	const { due, young, queued } = stillHomeDue(at23.runAt, { stillAt: at23.stillAt, now: at23.now, lookAgain });
	const fmt = (rs) => rs.slice(0, 4).map((r) => `${r.what} (started ${age(r) == null ? '?' : age(r) + ' ms'} before the census${r.held ? ', marked ' + r.held : ''}${r.finite ? ', a finite animation on it' : ''})`).join('; ');
	const fmtQueued = (rs) => rs.slice(0, 5).map((r) => `${r.what} (pending, current time ${r.currentTime ?? '?'}, no start)`).join('; ');
	const stillFor = at23.stillAt == null ? null : Math.round(at23.now - at23.stillAt);
	if (queued.length) t.log(`basic-dark Home, no hook: NOTE ${queued.length} endless animations queued at the 23 s census (pending, null start, current time 0), logged, not judged: ${fmtQueued(queued)}`);
	if (young.length) t.log(`basic-dark Home, no hook: NOTE ${young.length} loops began after the page went still and less than ${lookAgain} ms before the 23 s census, logged, not judged: ${fmt(young)}`);
	await t.check('basic-dark Home, no hook: not still 18 s after the last input', !at18.still && at18.run.length > 0, `still ${at18.still}, ${at18.run.length} endless running`);
	await t.check('basic-dark Home, no hook: still 23 s after the last input, nothing endless running', at23.still && due.length === 0, `still ${at23.still}${at23.hasScript ? '' : ' (no still-page script in this page)'}${stillFor == null ? '' : ` (for ${stillFor} ms)`}, ${due.length} endless running that the page should hold by now${due.length ? ': ' + fmt(due) : ''}${queued.length ? `; ${queued.length} queued logged` : ''}${young.length ? `; ${young.length} younger logged` : ''}`);
	}

	const f = await t.app.open({ query: `pm-warm=0&pm-still=${after}` });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await f.evaluate(installStillDeadline);
	const watchFinite = String(t.args.toggleWatchFinite || '0') === '1';
	if (watchFinite) await f.evaluate(installToggleFiniteWatch);
	await f.evaluate(MARKER);
	await f.evaluate(installHomeLiveWatch);
	await f.evaluate(installPrewarmProbe, { park: false });
	const watchUsage = String(t.args.toggleWatchLive || '0') === '1';
	if (watchUsage) await f.evaluate(installUsageLiveWatch);
	// Diagnostic only: if a view cannot stay still, report its spontaneous inputs and the caller of .focus().
	await f.evaluate(() => {
		window.__stillInputs = [];
		const focus = HTMLElement.prototype.focus;
		HTMLElement.prototype.focus = function (...args) {
			window.__stillFocusCaller = new Error('focus caller').stack;
			try { return focus.apply(this, args); } finally { window.__stillFocusCaller = null; }
		};
		for (const type of ['focus', 'focusin', 'resize', 'input', 'compositionstart', 'compositionupdate', 'visibilitychange']) {
			window.addEventListener(type, (e) => {
				if (!e.isTrusted) return;
				window.__stillInputs.push({ type, t: Math.round(performance.now()), target: e.target?.id || e.target?.tagName || 'window', visibility: document.visibilityState, caller: window.__stillFocusCaller });
				if (window.__stillInputs.length > 30) window.__stillInputs.shift();
			}, true);
		}
	});
	const cdp = await t.page.context().newCDPSession(t.page);
	const url = f.url();
	// The display's refresh, from the draw gaps while the page is still moving. summarise already
	// records drawn.gapP50 (the median milliseconds between Display::DrawAndSwap). This trace is taken
	// before the settle that lets the page go still; once it is still those gaps are the pauses.
	const moving = (await trace(cdp, { ms: 800, url })).sum;
	const refreshRaw = moving.drawn && moving.drawn.gapP50 > 0 ? 1000 / moving.drawn.gapP50 : NaN;
	const refreshHz = refreshRaw > 20 && refreshRaw < 400 ? refreshRaw : NaN;
	t.log(`refresh before still: ${Number.isFinite(refreshHz) ? refreshHz.toFixed(1) : 'unread'} Hz (draw gap p50 ${moving.drawn ? moving.drawn.gapP50 : '?'} ms)`);
	const traceToggle = async (options, view) => {
		const watching = watchUsage && view === 'usage';
		if (watching) await f.evaluate(() => { const s = window.__stillUsageLive; s.observer.takeRecords(); s.records = []; s.error = null; s.active = true; });
		let result, snapshot, finiteSnapshot;
		try { result = await trace(cdp, options); }
		finally { if (watching) snapshot = await f.evaluate(() => { const s = window.__stillUsageLive; s.active = false; return { records: s.records, error: s.error }; }); }
		if (watchFinite) finiteSnapshot = await f.evaluate(() => window.__stillToggleFinite);
		const after = result.after;
		result.after = (...args) => {
			const x = after(...args); if (!x) return x;
			x.liveWatchKnown = view !== 'usage' || (watching && !snapshot.error);
			x.liveWrites = watching ? usageWritesBeforeRecalc(x.markTs, x.recalcTs, result.marks, snapshot.records) : [];
			x.finiteSnapshot = finiteSnapshot;
			return x;
		};
		return result;
	};
	// the script blocks that draw while still, by the id the build gives each block
	let blocks = []; try { blocks = blocksOf(await pageSource(t)); } catch (e) { t.log('NOTE the page source could not be read: drawing scripts are named by line only'); }
	const named = (x) => (x.scripts || []).slice(0, 3).map((r) => { const m = /@(\d+):/.exec(r[0]); const blk = m && blockAt(blocks, Number(m[1])); return `${r[0]} ${blk ? '[' + blk.kind + '#' + (blk.id || '?') + '] ' : ''}${r[1]} ms/s`; }).join(', ');
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));
	const loaderProbe = String(t.args.loaderProbe || '0') === '1';
	if (loaderProbe) await f.evaluate(() => {
		// Controlled population: 17 real 16px think loaders supply the same 68 pml-flip4 frame groups as the review.
		// This is a check fixture, not a loader implementation or a change to normal-page state.
		const el = document.createElement('div'); el.id = '__still_loader_probe';
		el.style.cssText = 'position:fixed;left:100px;top:110px;display:flex;gap:8px;font-size:16px;z-index:2147483000';
		el.innerHTML = Array.from({ length: 17 }, () => PM_PIP_LOADER.html({ px: 16, motion: 'think' })).join('');
		document.body.append(el); PM_PIP_LOADER.mount(el);
	});

	// Red control for the rendered count: a finite main-thread animation the check runs itself (left on a fixed box,
	// laid out and committed every frame; the Web Animations API, so the still page neither marks nor holds it) must
	// read as more than the bound, so a trace whose frame events were renamed or lost cannot pass the row by reading 0.
	{
		await f.evaluate(() => { const el = document.createElement('div'); el.id = '__still_main_control'; el.style.cssText = 'position:fixed;left:0;top:0;width:40px;height:40px;background:#888;z-index:2147483000;pointer-events:none'; document.body.append(el); el.animate([{ left: '0px' }, { left: '300px' }], { duration: 2500 }); });
		const c = (await trace(cdp, { ms, url })).sum;
		await f.evaluate(() => document.getElementById('__still_main_control')?.remove());
		await t.check(`control: a main-thread animation the check runs reads as more than ${mainMax} rendered main frames a second`, c.mainFrames.renderedPerSec > mainMax,
			`${c.mainFrames.renderedPerSec}/s rendered (${c.mainFrames.perSec}/s started, ${c.mainFrames.commitsPerSec}/s commits), drawn ${c.drawn.perSec}/s`);
	}
	for (const look of looks) {
		await f.evaluate((label) => { window.__stillPrewarm.label = label; }, look);
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await move();
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		await consumeUsagePrewarm(t, f, look);
		for (const view of views) {
			const at = `${look} ${view === 'dashboard' ? 'home' : view}`;
			await f.evaluate((id) => PM_PAGES.go(id), view);
			// Calibration can explicitly include the Agents population left active by the hover check's tab scenario.
			if (view === 'dashboard' && t.args.homeTab === 'agents') {
				await f.locator('.pmw-tab').filter({ hasText: 'Agents' }).first().click();
				await t.page.waitForTimeout(800);
			}
			const idleMs = after + 3000;
			await f.evaluate((duration) => {
				window.__stillInputs = [];
				window.__stillTogglePopulation = null;
				window.__armStillDeadline(duration);
			}, idleMs);
			await move();
			const t0 = Date.now();
			await t.page.waitForTimeout(Math.min(1500, after / 2));

			// (b) before the wait is up
			const b = await f.evaluate(CENSUS);
			await t.check(`${at}: before ${after} ms without input the page is not still and nothing is marked`, !b.still && b.marks === 0,
				`still ${b.still}, ${b.run.length} endless running, ${b.marks} marked`);
			if (!b.run.length) t.log(`${at}: NOTE no endless animation runs in this view: (a) and (c) judge frames and the state only`);

			// going still, inside a trace: the toggle's style recalc. PM7PERF-STILLPAGE-TOGGLE-TRACE-START (TB5 note):
			// the old fixed 1200 ms trace from after-400 ended at after+800 and a still timer late under load landed
			// its mark after Tracing.end, so the cost row read restyled:null (unjudgeable). The trace starts before the
			// nominal toggle and stays open until the page reports data-pm-still (bounded by --set toggleWait), then a
			// settle for the recalc and its first frame; if no mark is in the trace the row says could not judge by name.
			const stillNow = () => f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
			await t.page.waitForTimeout(Math.max(0, after - 400 - (Date.now() - t0)));
			let tg = null, toggleMiss = null;
			if (await stillNow()) toggleMiss = 'the page was already still when the trace was to start';
			else {
				tg = await traceToggle({ ms: 0, url, during: async () => {
					const w = await waitStill(stillNow, { waitMs: toggleWait });
					if (!w.saw) t.log(`${at}: NOTE the page did not report data-pm-still within ${toggleWait} ms of the trace opening`);
				}, ...toggleTraceOptions(look, view, 'on') }, view);
				if (tg.marks['pm-still:on'] === undefined) toggleMiss = `the pm-still:on mark did not land inside the trace (waited up to ${toggleWait} ms from before the toggle)`;
			}
			const on = tg ? tg.after('pm-still:on', 'pm-still:on') : null;

			// (a) STILL_AFTER + 3 s
			await t.page.waitForTimeout(Math.max(0, idleMs - (Date.now() - t0)));
			const a = await f.evaluate(CENSUS);
			const { onPopulation, idle } = await f.evaluate(() => ({ onPopulation: window.__stillTogglePopulation, idle: window.__stillDeadline }));
			const onCost = recordToggle(look, view, 'on', on, onPopulation || { marks: null, marked: [], held: 0 });
			const newlyPaused = a.finPaused.filter((x) => !b.finPaused.includes(x));
			const deadlineRead = idle && a.now >= idle.deadlineAt;
			const idleDetail = deadlineRead ? `data-pm-still ${idle.still ? 'on' : 'off'} at the deadline` : 'could not judge: no completed idle window from a trusted pointer move';
			const idleToggle = idle && a.stillAt != null ? `; observed on ${Math.round(a.stillAt - idle.inputAt)} ms after input` : '';
			await t.check(`${at}: ${idleMs} ms after the last input the page is still`, Boolean(deadlineRead && idle.still), idleDetail + idleToggle + (a.hasScript ? '' : ' (no still-page script in this page)'));
			await t.check(`${at}: no endless animation runs while still`, a.run.length === 0, a.run.length ? `${a.run.length} running: ${a.run.slice(0, 6).join('; ')}` : `${a.held} held, ${a.marks} elements marked${a.exempt.length ? `, exempt: ${a.exempt.join('; ')}` : ''}`);
			await t.check(`${at}: every mark holds an endless loop (no stray mark)`, a.stray.length === 0, a.stray.length ? a.stray.slice(0, 6).join('; ') : `${a.marks} marks`);
			await t.check(`${at}: no finite animation is held by the state`, newlyPaused.length === 0, newlyPaused.length ? newlyPaused.slice(0, 6).join('; ') : `${a.finRun} finite running`);
			const stillTime = a.stillAt == null ? '' : `; data-pm-still observed at ${Math.round(a.stillAt)} ms in the app frame`;
			const onDetail = toggleMiss ? `could not judge: ${toggleMiss}` : `${JSON.stringify(onCost)}; ${on?.found ? `${on.firstFrameMs} ms frame; largest following recalc ${on.max}, ${on.total} in ${on.steps}` : 'no recalc or mark: unjudgeable'}`;
			await t.check(`${at}: going still cost stays within its marked population`, onCost.pass, onDetail + stillTime);
			// frames while still: up to three 2 s traces, each once no finite animation runs; the quietest is judged
			const live = view === 'usage';
			// main frames are the RENDERED ones (PM7PERF-STILL-FRAMES-STARTS): frame starts less those Chrome abandons with
			// nothing to update (frame-trace.mjs). Counting starts read 11-17 a second on main's own still Settings in T3's
			// sandbox (lb3-12, 2026-11-14) where 1 to 4 frames a second rendered; the starts are logged beside it.
			const rendered = (r) => r.mainFrames.renderedPerSec;
			// Starts are at most 0.45 of the refresh measured above, capped at --set starts= (60). A loop that asks
			// for a frame every frame and changes no pixel reads about the refresh rate and renders nothing. At 60 Hz
			// the bound is 27 a second, so that loop fails. At 238 Hz the cap is 60, and main's page (lb2, Alexis)
			// stays under it: sandbox 9-41 a second, normal 2.2-8.4.
			const judgeStarts = !live && view !== 'dashboard';
			const startCap = stillStartsBound(refreshHz, { cap: startsMax });
			const askers = (r) => (r.startsBy || []).slice(0, 4).map(([w, n]) => `${w} ${Math.round(n / r.secs * 10) / 10}/s`).join(', ');
			let x = null; const tries = [], recs = [];
			const home = view === 'dashboard';
			for (let k = 0; k < 3; k++) {
				const quiet = await f.evaluate(QUIET, 3000);
				// Home: place the window between two beats of the hosted Usage board (the old row read the beat's phase)
				let plan = null, now0 = 0;
				if (home) {
					plan = homeBeatPlan(await f.evaluate(readHomeLive), { ms, tail: HOME_BEAT_TAIL });
					if (plan.waitMs > 0) await t.page.waitForTimeout(plan.waitMs);
					now0 = await f.evaluate(() => performance.now());
				}
				const tr = await trace(cdp, { ms, url, track: framesBy, by: framesBy || home });
				const r = tr.sum;
				let beatNote = '';
				if (home) {
					const beatsIn = await f.evaluate((span) => { const s = window.__stillHomeLive; return s ? s.beats.filter((b) => b.at >= span[0] && b.at <= span[1]).length : 0; }, [now0 - HOME_BEAT_TAIL, now0 + ms + 250]);
					if (beatsIn > 0) {
						const adj = beatFreeDrawn(tr.events, { tail: HOME_BEAT_TAIL });
						if (adj && adj.drawnPerSec != null) { r.drawn = { ...r.drawn, perSec: adj.drawnPerSec }; beatNote = ` (a beat landed in the window: its ${adj.draws - adj.kept} draws taken out, ${adj.kept} draws over ${adj.secs} s left)`; }
						else { r.beatUnjudgeable = true; beatNote = ' (beats covered the window: could not judge, taken again)'; }
					} else if (plan && plan.placed) beatNote = ' (placed between beats)';
				}
				if (framesBy) t.log(`${at}: NOTE try ${k + 1} main frame starts by what asked for them [what, starts, nothing to update, rendered, ms]: ${JSON.stringify(r.startsBy.slice(0, 8))}`);
				tries.push(`${r.drawn.perSec}/${rendered(r)} (starts ${r.mainFrames.perSec}, ${r.mainFrames.noUpdatePerSec} with nothing to update)${quiet ? '' : ' (a finite animation still ran)'}${beatNote}${r.drawn.perSec > drawnMax || rendered(r) > mainMax ? ' by ' + named(r) + (home && r.startsBy ? '; asked by ' + (askers(r) || 'nothing named') : '') : ''}`);
				const j = stillJudged(view, { drawn: drawnMax, main: mainMax, starts: startsMax, hz: refreshHz });
				if (home) { const meets = j.meets; j.meets = (q) => !q.beatUnjudgeable && meets(q); }
				// Settings judges main frames and starts, which a renderer-less trace reads as 0 (PM7PERF-NO-RENDERER-READS-ZERO):
				// such a try never meets the bounds, so it cannot end the tries as a pass; the row below fails as could not judge.
				else if (!live) { const meets = j.meets; j.meets = (q) => traceJudgeable(q).ok && meets(q); }
				recs.push(r);
				const pick = stillPick(x, r, j);
				x = pick.x;
				if (pick.done) break;
			}
			t.log(`${at}: STILL drawn ${x.drawn.perSec}/s, main frames rendered ${rendered(x)}/s (starts ${x.mainFrames.perSec}/s, ${x.mainFrames.noUpdatePerSec}/s with nothing to update, commits ${x.mainFrames.commitsPerSec}/s${Object.keys(x.mainFrames.aborts).length ? ', other early outs ' + JSON.stringify(x.mainFrames.aborts) : ''}), main ${Math.round(x.cost.main)} ms/s, GPU ${Math.round(x.cost.gpuMain)} ms/s, viz ${Math.round(x.cost.viz)} ms/s (drawn/rendered per try: ${tries.join('; ')}); toggle ${on && on.found ? `${on.first} elements, ${on.firstFrameMs} ms frame` : 'not seen'}`);
			if (live) t.log(`${at}: NOTE live data (Usage): frames logged, not judged; quietest try draws ${x.drawn.perSec}/s, main renders ${rendered(x)}/s (starts ${x.mainFrames.perSec}/s), by ${named(x) || 'no script'}`);
			else {
				// Home: every try's window covered by a live beat is could not judge, never a raw-rate pass or fail (R124 F5-1)
				const hd = homeDrawnRow(recs, { drawnMax, quietest: x });
				await t.check(`${at}: still, the compositor draws at most ${drawnMax} frames a second`, hd.ok, `${hd.detail} (${tries.join('; ')})`);
				// Home's dashboard is live too (its widgets tick with the demo engine): its main frames are logged, the loops'
				// cost is judged by what the compositor draws
				if (view === 'dashboard') t.log(`${at}: NOTE Home is live (its widgets tick): main frames rendered ${rendered(x)}/s (starts ${x.mainFrames.perSec}/s) logged, not judged${named(x) ? '; by ' + named(x) : ''}`);
				else if (!traceJudgeable(x).ok) {
					// a renderer-less trace reads main frames and layouts as 0 (PM7PERF-NO-RENDERER-READS-ZERO): could not judge
					const why = traceJudgeable(x).why;
					await t.check(`${at}: still, the main thread renders at most ${mainMax} frames a second`, false, `${why}: the trace measured no main thread, so main frames and layouts read 0 (quietest of ${tries.length} tries: ${tries.join('; ')})`);
					if (judgeStarts) await t.check(`${at}: still, the main thread starts at most 0.45 per refresh (${Number.isFinite(startCap) ? startCap.toFixed(1) : '?'} a second at ${Number.isFinite(refreshHz) ? refreshHz.toFixed(0) : '?'} Hz, capped at ${startsMax})`, false, `${why}: the trace measured no main thread, so frame starts read 0 (${tries.join('; ')})`);
				}
				else {
					await t.check(`${at}: still, the main thread renders at most ${mainMax} frames a second`, rendered(x) <= mainMax, `${rendered(x)}/s rendered (${x.mainFrames.perSec}/s started, ${x.mainFrames.noUpdatePerSec}/s of them with nothing to update), ${Math.round(x.cost.main)} ms/s in the quietest try${named(x) ? '; by ' + named(x) : ''}${framesBy ? '; asked for by ' + (askers(x) || 'nothing named') : ''}`);
					if (judgeStarts) await t.check(`${at}: still, the main thread starts at most 0.45 per refresh (${Number.isFinite(startCap) ? startCap.toFixed(1) : '?'} a second at ${Number.isFinite(refreshHz) ? refreshHz.toFixed(0) : '?'} Hz, capped at ${startsMax})`, Number.isFinite(startCap) && x.mainFrames.perSec <= startCap, `${x.mainFrames.perSec}/s started (${x.mainFrames.noUpdatePerSec}/s of them with nothing to update, ${rendered(x)}/s rendered), bound ${Number.isFinite(startCap) ? startCap.toFixed(1) : 'unread'}/s = 0.45 of ${Number.isFinite(refreshHz) ? refreshHz.toFixed(0) : '?'} Hz, cap ${startsMax}/s; ${framesBy ? 'asked for by ' + (askers(x) || 'nothing named') : 'run with --set framesBy=1 to name what asks for them'}`);
				}
			}
			const stable = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), inputs: window.__stillInputs }));
			await t.check(`${at}: the view stays still throughout its rest traces`, a.still && stable.still,
				`still ${a.still} -> ${stable.still}; new wake events ${JSON.stringify(stable.inputs)}`);

			// (c) one real move wakes it, and each held loop goes on from where it was
			const wakePopulation = await f.evaluate(CENSUS);
			// The reading is taken in the page 100 ms after the waking move, by a timer the move's own capture listener arms,
			// and read back after the trace (PM7PERF-STILL-OBS-WAKE-ONCE). Read only after the trace was collected, as it
			// was, a collection over 3 s (Alexis with three browsers: 3.3 and 3.6 s in the failing cells, 2.1 and 2.6 s in
			// passing ones) let the page go still again by design (?pm-still=3000), and the row read "still after the move".
			const held = await f.evaluate(() => {
				const out = []; window.__stillKeep.forEach((an, i) => { if (an.playState === 'paused') out.push([i, an.currentTime]); });
				window.__stillHeld = out; window.__stillWake = 0; window.__stillWoke = null;
				const read = () => {
					const w = window.__stillWake, now = performance.now(), bad = [], late = [];
					let worst = 0;
					for (const [i, ct] of window.__stillHeld) {
						const an = window.__stillKeep[i];
						if (!an || an.playState === 'idle') continue; // gone with its element
						if (an.playState !== 'running') { bad.push(`${an.animationName || '?'} ${an.playState}`); continue; }
						// ahead of the held time by the time since the wake, less the moment it took to start again: a reset
						// (ahead below 0), a jump forward (ahead past the time since the wake) or a late start shows here
						const ahead = an.currentTime - ct, lag = (now - w) - ahead;
						worst = Math.max(worst, lag);
						if (ahead < 0 || lag < -20 || lag > 100) late.push(`${an.animationName || '?'} ahead ${Math.round(ahead)} ms, ${Math.round(now - w)} ms after the wake (started ${Math.round(lag)} ms late)`);
					}
					window.__stillWoke = { still: document.documentElement.hasAttribute('data-pm-still'), woke: w > 0, bad, late, worst: Math.round(worst), n: window.__stillHeld.length, readMs: Math.round(now - w) };
				};
				window.addEventListener('pointermove', (e) => { if (window.__stillWake) return; window.__stillWake = e.timeStamp; setTimeout(read, Math.max(0, e.timeStamp + 100 - performance.now())); }, { capture: true, once: true });
				return out.length;
			});
			const wk = await traceToggle({ ms: 900, url, ...toggleTraceOptions(look, view, 'off'), during: async () => { await t.page.waitForTimeout(150); await move(); } }, view);
			const woke = await f.waitForFunction(() => window.__stillWoke || (!window.__stillWake ? { still: document.documentElement.hasAttribute('data-pm-still'), woke: false, bad: [], late: [], worst: 0, n: window.__stillHeld.length, readMs: null } : null), null, { timeout: 5000, polling: 50 }).then((h) => h.jsonValue(), () => ({ still: null, woke: false, bad: ['no reading 5 s after the trace'], late: [], worst: 0, n: 0, readMs: null }));
			const off = wk.after('pm-still:off', 'pm-still:off');
			const offCost = recordToggle(look, view, 'off', off, wakePopulation);
			if (a.still) t.log(`${at}: WAKE ${off && off.found ? `${off.first} elements, ${off.firstFrameMs} ms first frame` : 'no recalc seen'}; loops on again at most ${woke.worst} ms after the move; wake trace longest main frame ${wk.sum.mainFrames.max} ms, by ${named(wk.sum) || 'no script'}`);
			if (a.still) {
				await t.check(`${at}: one pointer move wakes the page and every held loop runs again within 100 ms`, woke.woke && !woke.still && woke.bad.length === 0, `${woke.n} held; ${woke.bad.length ? 'not running: ' + woke.bad.slice(0, 5).join('; ') : 'all running'}${woke.still ? '; still after the move' : ''}; read in the page ${woke.readMs} ms after the move`);
				await t.check(`${at}: each loop goes on from where it was held (no restart, no jump)`, woke.late.length === 0, woke.late.length ? woke.late.slice(0, 5).join('; ') : `each started again at most ${woke.worst} ms after the waking move`);
				await t.check(`${at}: waking cost stays within its marked population`, offCost.pass, `${JSON.stringify(offCost)}; ${off?.found ? `${off.firstFrameMs} ms frame; largest following recalc ${off.max}, ${off.total} in ${off.steps}` : 'no recalc or mark: unjudgeable'}`);
			}
		}
		const prewarm = await f.evaluate(prewarmSnapshot);
		const sameLook = prewarm.runs.filter((r) => r.usage && r.look === look);
		await t.check(`${look}: no repeat Usage prewarm during the measured cells`, sameLook.length === 1 && prewarm.errors.length === 0,
			JSON.stringify(sameLook));
	}
	await f.evaluate(() => window.__stillPrewarm.dispose());

	// Every additional wake starts from still. No synthetic events or focus-based proxy for visibility.
	if (loaderProbe) await f.evaluate(() => document.getElementById('__still_loader_probe')?.remove());
	await t.app.look('basic-dark');
	await f.evaluate(() => PM_PAGES.go('settings'));
	await move();
	const stillBefore = async (name) => {
		await t.page.waitForTimeout(after + 1800);
		const state = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), inputs: window.__stillInputs }));
		await t.check(`${name}: page is still before the wake`, state.still, JSON.stringify(state));
		return state.still;
	};
	// The opaque app can be hovered while keyboard focus stays in its wrapper. Put focus in the app before the wait.
	await f.locator('#themeSelect').focus();
	await stillBefore('key');
	await f.evaluate(() => {
		window.__stillKey = null;
		window.addEventListener('keydown', (e) => { window.__stillKey = { key: e.key, trusted: e.isTrusted }; }, { capture: true, once: true });
	});
	await t.page.keyboard.press('Shift');
	const keyed = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), event: window.__stillKey, focused: document.activeElement?.id }));
	await t.check('one key wakes the still page', keyed.event?.trusted && keyed.event.key === 'Shift' && !keyed.still, JSON.stringify(keyed));
	await stillBefore('resize');
	await t.viewport(1900, 1060);
	await t.page.waitForTimeout(150);
	await t.check('one window resize wakes the still page', !(await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'))));
	await t.viewport(1920, 1080);
	await stillBefore('visibilitychange');
	await f.evaluate(() => {
		window.__stillVisibility = [];
		window.addEventListener('visibilitychange', (e) => {
			const row = { trusted: e.isTrusted, visible: document.visibilityState === 'visible', before: document.documentElement.hasAttribute('data-pm-still') };
			window.__stillVisibility.push(row);
		}, true);
		// Registered after the product's document listener: read after it handles this same event, before focus can run.
		document.addEventListener('visibilitychange', () => {
			window.__stillVisibility.at(-1).after = document.documentElement.hasAttribute('data-pm-still');
		});
	});
	// Focus emulation is per CDP session: disable the harness's own keeper, too.
	const focusCdp = await t.run.cdpFor(t.top);
	await focusCdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
	await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
	try {
		// A second headless target need not hide the first. Chromium's frozen transition calls WasHidden();
		// unfreeze while hidden to inspect it, then restore visibility with focus emulation (real browser events).
		await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
		await cdp.send('Page.setWebLifecycleState', { state: 'active' });
		await f.waitForFunction(() => document.visibilityState === 'hidden', null, { timeout: 5000, polling: 100 });
		await t.check('becoming hidden leaves the page still', await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still')));
		await focusCdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
		await f.waitForFunction(() => document.visibilityState === 'visible', null, { timeout: 5000, polling: 100 });
		const changes = await f.evaluate(() => window.__stillVisibility);
		await t.check('becoming visible itself wakes the still page', changes.some((x) => x.trusted && x.visible && x.before && x.after === false), JSON.stringify(changes));
	} finally {
		await cdp.send('Page.setWebLifecycleState', { state: 'active' });
		await focusCdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	}

	// ---- (e) the onboarding window and the tour: never still while either is open ----
	await t.app.look('basic-dark');
	await f.evaluate(() => PM_PAGES.go('dashboard'));
	await move();
	await t.page.waitForTimeout(after + 1500);
	const before = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await f.evaluate(() => O55.ui.open({ screen: 'welcome' }));
	await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).catch(() => {});
	await t.page.waitForTimeout(200);
	const opened = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await t.page.waitForTimeout(after + 2000);
	const under = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), open: document.documentElement.hasAttribute('data-o55-open') }));
	await t.check('onboarding window opened while still: the state goes off at once and stays off while it is open', before && !opened && under.open && !under.still, `still before ${before}, 200 ms after the open ${opened}, ${after + 2000} ms later ${under.still} (window open ${under.open})`);
	await f.evaluate(() => O55.ui.close('close'));
	await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).catch(() => {});
	await t.page.waitForTimeout(after + 2500);
	const closed = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await t.check('after the window closes, with no input, the page goes still again by itself', closed, `still ${closed}`);
	await f.evaluate(() => O55.tour.start({ fresh: true }));
	await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-tour'), null, { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(200);
	const tourAt = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await t.page.waitForTimeout(after + 2000);
	const tour = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), tour: document.documentElement.hasAttribute('data-o55-tour') }));
	await t.check('Guided Tour started while still: the state goes off at once and stays off during the tour', !tourAt && tour.tour && !tour.still, `200 ms after the start ${tourAt}, ${after + 2000} ms later ${tour.still} (tour on ${tour.tour})`);
	await f.evaluate(() => O55.tour.skip && O55.tour.skip()).catch(() => {});
	await cdp.detach().catch(() => {});

	// ---- (d) Reduced Motion: nothing changes ----
	await t.emulate({ reducedMotion: 'reduce' });
	const fr = await t.app.open({ query: `pm-warm=0&pm-still=${after}` });
	for (const look of ['basic-dark', 'glass-dark']) {
		await t.app.look(look);
		await fr.evaluate(() => PM_PAGES.go('dashboard'));
		await move();
		await t.page.waitForTimeout(1000);
		const r0 = await fr.evaluate(CENSUS);
		await t.page.waitForTimeout(after + 3000);
		const r1 = await fr.evaluate(CENSUS);
		await t.check(`${look} home, Reduced Motion: the page never goes still, marks nothing, and its running loops stay as they were`, !r1.still && r1.marks === 0 && r1.run.length === r0.run.length,
			`still ${r1.still}, endless running ${r0.run.length} -> ${r1.run.length}, ${r1.marks} marked`);
	}
	await t.emulate({ reducedMotion: 'no-preference' });
	if (t.args.toggleOut) writeFileSync(String(t.args.toggleOut), JSON.stringify(toggleRows, null, 1));
}
