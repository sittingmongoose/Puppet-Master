// Frame accounting from a DevTools trace, with nothing added to the page: what the renderer's main thread, the
// renderer's compositor, the raster workers, the display compositor and the GPU thread each cost per second of wall
// time, how the main thread's time splits (script, style, layout, pre-paint, paint, layerize, commit), how many main
// frames ran and how long each took, and how many frames the display compositor drew and Chrome counted as dropped.
// A probe in the page (a rAF loop, a timer) would itself make the page render frames; a trace does not.
export const TRACE_CATEGORIES = [
	'toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame',
	'blink', 'blink.animations', 'cc', 'viz', 'gpu', 'benchmark', 'blink.user_timing', 'v8.execute'
].join(',');

const GROUPS = [
	['style', /^(UpdateLayoutTree|Document::updateStyle|Document::recalcStyle|RecalculateStyles|Document::rebuildLayoutTree|StyleEngine::|InvalidateStyle)/],
	['layout', /^(Layout|LocalFrameView::layout|LocalFrameView::performLayout|UpdateLayout)/],
	['prepaint', /^(PrePaint|LocalFrameView::RunPrePaintLifecyclePhase)/],
	['paint', /^(Paint$|PaintImage|LocalFrameView::RunPaintLifecyclePhase|PaintArtifactCompositor::|Paint::)/],
	['layerize', /^(Layerize|UpdateLayer$|UpdateLayerTree|CompositeLayers|PaintArtifactCompositor::Update|LayerTreeHost::UpdateLayers)/],
	['commit', /^(Commit$|ProxyMain::BeginMainFrame::commit|LayerTreeHost::.*Commit|ProxyImpl::.*Commit)/],
	['gc', /^(V8\.GC|MajorGC|MinorGC|BlinkGC|V8\.GCScavenger|CppGC)/],
	['script', /^(FunctionCall|EvaluateScript|v8\.|V8\.|FireAnimationFrame|TimerFire|EventDispatch|RunMicrotasks|FireIdleCallback|XHR|v8::|Document::serviceScriptedAnimations|PageAnimator::serviceScriptedAnimations|ResizeObserver|IntersectionObserver|MutationObserver)/],
	['hittest', /^(HitTest|EventHandler::)/],
	['animate', /^(Animation$|DocumentAnimations::|Animation::|CSSAnimations::|LocalFrameView::.*Animat)/]
];
const groupOf = (name) => { for (const [g, re] of GROUPS) if (re.test(name)) return g; return 'other'; };

// Chrome's reasons for keeping an animation on the main thread (CompositorAnimations::FailureReason)
const WHY = { 0: 'accelerated animations disabled', 1: 'suppressed by DevTools', 2: 'invalid animation or effect', 3: 'unsupported timing', 4: 'non-replace composite mode', 5: 'target has invalid compositing state', 6: 'target has incompatible animations', 7: 'target has CSS offset', 8: 'multiple transform properties', 9: 'animates non-CSS properties', 10: 'transform cannot be accelerated on this target', 12: 'filter may move pixels', 13: 'unsupported CSS property', 15: 'mixed keyframe value types', 16: 'timeline source not composited', 17: 'compositor property animations have no effect', 18: 'affects an !important property', 19: 'SVG target has an independent transform property' };
export const whyNot = (mask) => { const out = []; for (let b = 0; b < 24; b++) if (mask & (1 << b)) out.push(WHY[b] || 'bit ' + b); return out.join(' + ') || 'reason ' + mask; };
const q = (sorted, f) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(f * sorted.length))] : 0;
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

// Complete ('X') events of one thread, with B/E pairs folded in, sorted by start
function threadEvents(events, pid, tid) {
	const out = [], open = [];
	for (const e of events) {
		if (e.pid !== pid || e.tid !== tid) continue;
		if (e.ph === 'X') out.push({ name: e.name, ts: e.ts, dur: e.dur || 0, args: e.args });
		else if (e.ph === 'B') open.push(e);
		else if (e.ph === 'E') { const b = open.pop(); if (b) out.push({ name: b.name, ts: b.ts, dur: e.ts - b.ts, args: b.args }); }
	}
	out.sort((a, b) => a.ts - b.ts || b.dur - a.dur);
	return out;
}

// Self time per event name on one thread, and the time under top-level tasks
function selfTimes(evs) {
	const self = new Map(); const stack = []; let busy = 0;
	const close = (upto) => {
		while (stack.length && stack[stack.length - 1].end <= upto) {
			const s = stack.pop();
			self.set(s.name, (self.get(s.name) || 0) + Math.max(0, s.dur - s.child));
			if (stack.length) stack[stack.length - 1].child += s.dur; else busy += s.dur;
		}
	};
	for (const e of evs) {
		close(e.ts);
		// an event that runs past its parent (clock skew between categories) is clipped to it
		const parent = stack[stack.length - 1];
		const end = parent ? Math.min(e.ts + e.dur, parent.end) : e.ts + e.dur;
		stack.push({ name: e.name, end, dur: end - e.ts, child: 0 });
	}
	close(Infinity);
	return { self, busy };
}

export function summarise(trace, { url, allScripts = false } = {}) {
	const events = Array.isArray(trace) ? trace : trace.traceEvents || [];
	const threads = new Map(), procs = new Map();
	let t0 = Infinity, t1 = -Infinity, started = null;
	for (const e of events) {
		if (e.ph === 'M') {
			if (e.name === 'thread_name') threads.set(e.pid + ':' + e.tid, e.args.name);
			else if (e.name === 'process_name') procs.set(e.pid, e.args.name);
			continue;
		}
		if (e.name === 'TracingStartedInBrowser') started = e;
		if (!e.ts || e.cat === '__metadata') continue;
		if (e.ts < t0) t0 = e.ts;
		const end = e.ts + (e.dur || 0); if (end > t1) t1 = end;
	}
	// The window starts when tracing did (TracingStartedInBrowser), not at the oldest timestamp in the trace: a renderer that
	// draws rarely (T3's sandbox wrapper around the app's frame) reports a few async begins (PipelineReporter,
	// BeginImplFrameToSendBeginMainFrame) seconds old, and a 3 s sandbox window read as 21.6 s, every rate about 7 times too
	// low (lane V, 2026-11-15, Alexis; on the normal surface the two clocks agreed within 10 ms). Busy time is clipped there too.
	if (started && started.ts > t0 && started.ts < t1) t0 = started.ts;
	const secs = Math.max(0.001, (t1 - t0) / 1e6);
	// time under each thread's outermost events: task events nest across categories, so summing them counts twice
	const byThread = new Map();
	{
		const per = new Map();
		for (const e of events) {
			if (e.ph !== 'X' || !e.dur) continue;
			const k = e.pid + ':' + e.tid; let a = per.get(k); if (!a) per.set(k, a = []);
			a.push(e);
		}
		for (const [k, a] of per) {
			a.sort((x, y) => x.ts - y.ts || y.dur - x.dur);
			let end = -Infinity, sum = 0;
			for (const e of a) {
				const ts = Math.max(e.ts, t0), te = e.ts + e.dur; if (te <= ts) continue;
				if (ts >= end) { sum += te - ts; end = te; } else if (te > end) { sum += te - end; end = te; }
			}
			byThread.set(k, sum);
		}
	}
	// the renderer that holds the page: named by the trace's frame list, else the busiest renderer main thread. The
	// frame whose URL is exactly the page's (a load's cache-buster makes it unique) wins; else, among frames at the same
	// address, the one whose renderer's main thread did the most (PM7PERF-FRAMETRACE-STALE-TOP: after a normal ->
	// sandbox navigation in one browser the list still held the old top frame at that address, and preferring a top frame
	// by address alone read its idle renderer: 0 main frames, where the live child frame had 289)
	let rpid = null;
	const frames = started?.args?.data?.frames || [];
	if (url) {
		const path = (u) => String(u).split(/[?#]/)[0];
		const mainBusy = (p) => { let v = 0; for (const [k, us] of byThread) if (Number(k.split(':')[0]) === p && threads.get(k) === 'CrRendererMain') v = Math.max(v, us); return v; };
		const exact = frames.filter((f) => f.url === url);
		const same = exact.length ? exact : frames.filter((f) => f.url && path(f.url) === path(url));
		const want = same.slice().sort((a, b) => mainBusy(b.processId) - mainBusy(a.processId) || (a.parent ? 1 : 0) - (b.parent ? 1 : 0))[0];
		if (want) rpid = want.processId;
	}
	if (rpid == null) {
		let best = 0;
		for (const [k, v] of byThread) if (threads.get(k) === 'CrRendererMain' && v > best) { best = v; rpid = Number(k.split(':')[0]); }
	}
	const perSec = (us) => r1(us / 1000 / secs);
	const sumThreads = (test) => { let s = 0; for (const [k, v] of byThread) if (test(Number(k.split(':')[0]), threads.get(k) || '')) s += v; return s; };
	const gpuPid = [...procs].find(([, n]) => /GPU/i.test(n))?.[0];
	const cost = {
		main: perSec(sumThreads((p, n) => p === rpid && n === 'CrRendererMain')),
		compositor: perSec(sumThreads((p, n) => p === rpid && n === 'Compositor')),
		raster: perSec(sumThreads((p, n) => p === rpid && /^CompositorTileWorker/.test(n))),
		otherRenderers: perSec(sumThreads((p, n) => p !== rpid && n === 'CrRendererMain')),
		viz: perSec(sumThreads((p, n) => n === 'VizCompositorThread')),
		gpuMain: perSec(sumThreads((p, n) => p === gpuPid && n === 'CrGpuMain'))
	};
	// main thread split
	const mainKey = [...threads].find(([k, n]) => n === 'CrRendererMain' && Number(k.split(':')[0]) === rpid)?.[0];
	const split = {}, other = new Map(); let frameMs = [], mainFrames = 0, styleCount = 0, layoutCount = 0, wholeLayouts = 0, styleElems = 0; const dispatched = {};
	const scripts = new Map();
	// What each main frame came to (PM7PERF-STILL-FRAMES-STARTS). A ProxyMain::BeginMainFrame is a frame START: Chrome
	// runs the lifecycle and, when nothing changed, abandons it with an EarlyOut_NoUpdates instant inside it and commits
	// nothing; a frame that commits holds a ProxyMain::BeginMainFrame::commit. Rendered = starts less the NoUpdates
	// aborts, so a Chrome that stopped writing the abort event would read high (a false fail), never low. Any other early
	// out (deferred, not visible) still counts as rendered and is named in `aborts`. Lane M's still-page traces on Alexis
	// (2026-11-13): 282 starts, 216 NoUpdates, 66 commits in about 15 s; every start was one or the other.
	let noUpdates = 0, commits = 0; const aborts = {};
	if (mainKey) {
		const [pid, tid] = mainKey.split(':').map(Number);
		const evs = threadEvents(events, pid, tid);
		{
			const starts = evs.filter((e) => e.name === 'ProxyMain::BeginMainFrame');
			const outs = [];
			for (const e of events) {
				if (e.pid !== pid || e.tid !== tid || typeof e.name !== 'string') continue;
				if (e.name.startsWith('EarlyOut_') && e.ph !== 'M') outs.push(e);
				else if (e.name === 'ProxyMain::BeginMainFrame::commit' && e.ph === 'X') commits++;
			}
			// one verdict per start: the first early out inside it (a start holds at most one)
			for (const s of starts) {
				const o = outs.find((x) => x.ts >= s.ts && x.ts <= s.ts + s.dur);
				if (!o) continue;
				if (o.name === 'EarlyOut_NoUpdates') noUpdates++; else aborts[o.name] = (aborts[o.name] || 0) + 1;
			}
		}
		const { self } = selfTimes(evs);
		for (const [name, us] of self) {
			const g = groupOf(name); split[g] = (split[g] || 0) + us;
			if (g === 'other') other.set(name, (other.get(name) || 0) + us);
		}
		for (const e of evs) {
			if (e.name === 'ProxyMain::BeginMainFrame') { mainFrames++; frameMs.push(e.dur / 1000); }
			else if (e.name === 'UpdateLayoutTree') { styleCount++; styleElems += e.args?.elementCount || 0; }
			else if (e.name === 'Layout') { layoutCount++; if (e.args?.beginData?.partialLayout === false) wholeLayouts++; }
			else if (e.name === 'EventDispatch') { const ty = e.args?.data?.type; if (ty) dispatched[ty] = (dispatched[ty] || 0) + 1; }
			else if (e.name === 'FunctionCall' || e.name === 'FireAnimationFrame' || e.name === 'TimerFire') {
				const d = e.args?.data || {};
				const k = e.name === 'FunctionCall' ? `${d.functionName || '(anonymous)'}@${d.lineNumber ?? '?'}:${d.columnNumber ?? '?'}` : null;
				if (k) { const s = scripts.get(k) || { ms: 0, n: 0 }; s.ms += e.dur / 1000; s.n++; scripts.set(k, s); }
			}
		}
	}
	for (const k of Object.keys(split)) split[k] = perSec(split[k]);
	frameMs.sort((a, b) => a - b);
	// frames the display compositor drew, and Chrome's own verdict per frame
	const vizKeys = new Set([...threads].filter(([, n]) => n === 'VizCompositorThread').map(([k]) => k));
	const draws = events.filter((e) => vizKeys.has(e.pid + ':' + e.tid) && e.name === 'Display::DrawAndSwap' && (e.ph === 'X' || e.ph === 'B')).map((e) => e.ts).sort((a, b) => a - b);
	const gaps = draws.slice(1).map((x, i) => (x - draws[i]) / 1000).sort((a, b) => a - b);
	const drawDur = events.filter((e) => vizKeys.has(e.pid + ':' + e.tid) && e.name === 'Display::DrawAndSwap' && e.ph === 'X').map((e) => e.dur / 1000).sort((a, b) => a - b);
	let drawFrames = 0, droppedFrames = 0, partialFrames = 0, beginFrames = 0, animStarted = 0;
	const failed = new Map(), animNode = new Map(), composited = new Set();
	for (const e of events) {
		if (e.pid === rpid) {
			if (e.name === 'DrawFrame') drawFrames++;
			else if (e.name === 'DroppedFrame') { droppedFrames++; if (e.args?.hasPartialUpdate) partialFrames++; }
			else if (e.name === 'BeginFrame') beginFrames++;
		}
		if (e.name === 'Animation') {
			// the begin event names the node; a later event of the same async id carries Chrome's verdict
			const id = e.id2?.local || e.id2?.global || e.id, d = e.args?.data;
			if (d?.nodeName) animNode.set(id, d.nodeName);
			if (d && (d.compositeFailed || d.unsupportedProperties?.length)) {
				const k = `${animNode.get(id) || '?'} | ${(d.unsupportedProperties || []).join(',')} | ${whyNot(d.compositeFailed)}`;
				failed.set(k, (failed.get(k) || 0) + 1);
			} else if (d && d.compositeFailed === 0) composited.add(id);
			if (e.ph === 'b') animStarted++;
		}
	}
	const states = {}; let smooth = 0, smoothDropped = 0;
	for (const e of events) {
		if (e.name !== 'PipelineReporter' || (e.ph !== 'b' && e.ph !== 'B')) continue;
		// (Chrome 15x writes the reporter as frame_reporter; older builds as chrome_frame_reporter)
		const rep = e.args?.frame_reporter || e.args?.chrome_frame_reporter; if (!rep) continue;
		const s = String(rep.state || '').replace(/^STATE_/, '');
		states[s] = (states[s] || 0) + 1;
		if (rep.affects_smoothness) { smooth++; if (s === 'DROPPED') smoothDropped++; }
	}
	return {
		secs: r2(secs),
		gpuPid: gpuPid ?? null,
		// the page's renderer main thread these numbers are of (for frameStarts below)
		renderer: mainKey ? { pid: Number(mainKey.split(':')[0]), tid: Number(mainKey.split(':')[1]) } : null,
		cost,
		split,
		other: [...other].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, us]) => [n, perSec(us)]),
		// perSec counts frame STARTS (what every check judged before 2026-11-15); renderedPerSec the starts that were not
		// abandoned with nothing to update, noUpdatePerSec those that were, commitsPerSec the commit events themselves
		mainFrames: { perSec: r1(mainFrames / secs), renderedPerSec: r1((mainFrames - noUpdates) / secs), noUpdatePerSec: r1(noUpdates / secs), commitsPerSec: r1(commits / secs), aborts, p50: r2(q(frameMs, 0.5)), p95: r2(q(frameMs, 0.95)), max: r2(frameMs[frameMs.length - 1] || 0) },
		style: { perSec: r1(styleCount / secs), elementsPerSec: Math.round(styleElems / secs) },
		layoutPerSec: r1(layoutCount / secs),
		// layouts that started at the document's root rather than at a boundary inside it (a glyph's svg, a contained card)
		wholeLayoutsPerSec: r1(wholeLayouts / secs),
		// DOM events the page's listeners were called for, by type, in the window (Chrome dispatches one only where a listener hears it)
		dispatched,
		drawn: { perSec: r1(draws.length / secs), gapP50: r2(q(gaps, 0.5)), gapP95: r2(q(gaps, 0.95)), gapMax: r2(gaps[gaps.length - 1] || 0), drawP50: r2(q(drawDur, 0.5)), drawP95: r2(q(drawDur, 0.95)) },
		// droppedPerSec counts every DroppedFrame event, as every table has; of those, partialPerSec went out on time with a
		// partial update (the compositor's part, a scroll say, was shown; some main-thread change missed the frame) and
		// fullDroppedPerSec showed nothing new (lane V, 2026-11-15: a composited Usage scroll on Alexis, 238 Hz, 139 partial and
		// 3 full a second against 59 and 8 for the same scroll on the main thread)
		frames: { beginPerSec: r1(beginFrames / secs), drawPerSec: r1(drawFrames / secs), droppedPerSec: r1(droppedFrames / secs), partialPerSec: r1(partialFrames / secs), fullDroppedPerSec: r1((droppedFrames - partialFrames) / secs) },
		notComposited: [...failed].sort((a, b) => b[1] - a[1]).slice(0, 12),
		animations: { started: animStarted, composited: composited.size },
		reporter: { states, smooth, smoothDropped },
		// [function@line:col of the built page, ms a second, calls a second]: the ten dearest, or every one with allScripts
		scripts: [...scripts].sort((a, b) => b[1].ms - a[1].ms).slice(0, allScripts ? Infinity : 10).map(([k, v]) => [k, allScripts ? Math.round(v.ms / secs * 100) / 100 : r1(v.ms / secs), r1(v.n / secs)])
	};
}

// What asked for each main frame START on one renderer main thread (`renderer`, from summarise), and what it came to:
// [[what, starts, abandoned with nothing to update, rendered, ms]], most starts first. "What" is the first frame request
// (LocalFrameView::ScheduleAnimation, ProxyMain::SetNeeds*, RequestAnimationFrame) after the previous start ended, else
// the last one inside that start (a loop asking again from its own frame), named by the task around it: a timer, rAF,
// idle callback or event with the innermost script function (function@line:col of the built page), an observer, or
// 'in-frame' (asked from inside a frame: an animation ticking on the main thread, named by the element it restyled when
// the trace has disabled-by-default-devtools.timeline.invalidationTracking). Diagnosis only: logged, never judged.
const REQUESTS = new Set(['LocalFrameView::ScheduleAnimation', 'ProxyMain::SetNeedsAnimate', 'ProxyMain::SetNeedsUpdateLayers', 'ProxyMain::SetNeedsCommit', 'RequestAnimationFrame']);
const TASKS = { TimerFire: 'timer', FireAnimationFrame: 'rAF', FireIdleCallback: 'idle', EventDispatch: 'event', 'ResizeObserverController::DeliverObservations': 'ResizeObserver', 'IntersectionObserverController::deliverNotifications': 'IntersectionObserver', 'MutationObserver::deliverMutations': 'MutationObserver', RunMicrotasks: 'microtask', 'ProxyMain::BeginMainFrame': 'in-frame' };
export function frameStarts(events, renderer) {
	if (!renderer) return [];
	const xs = threadEvents(events, renderer.pid, renderer.tid);
	const starts = xs.filter((e) => e.name === 'ProxyMain::BeginMainFrame');
	const outs = events.filter((e) => e.pid === renderer.pid && e.tid === renderer.tid && e.name === 'EarlyOut_NoUpdates').map((e) => e.ts);
	const reqs = xs.filter((e) => REQUESTS.has(e.name));
	const invals = events.filter((e) => e.pid === renderer.pid && e.tid === renderer.tid && e.name === 'StyleRecalcInvalidationTracking' && /Animation/.test(e.args?.data?.reason || '')).sort((a, b) => a.ts - b.ts);
	const around = (ts) => xs.filter((e) => e.ts <= ts && e.ts + e.dur >= ts && !REQUESTS.has(e.name));
	const name = (ts) => {
		const chain = around(ts);
		const task = [...chain].reverse().find((e) => TASKS[e.name]);
		if (!task) return 'no task';
		const fn = [...chain].reverse().find((e) => e.name === 'FunctionCall' && e.ts >= task.ts);
		const d = (e) => e.args?.data || {};
		const kind = TASKS[task.name] + (task.name === 'EventDispatch' && d(task).type ? ' ' + d(task).type : '');
		if (fn) return `${kind} ${d(fn).functionName || '(anonymous)'}@${d(fn).lineNumber ?? '?'}:${d(fn).columnNumber ?? '?'}`;
		if (task.name !== 'ProxyMain::BeginMainFrame') return kind;
		// with invalidation tracking on, the element an animation restyled in that frame names it
		const inv = invals.find((e) => e.ts >= task.ts && e.ts <= task.ts + task.dur);
		return inv ? `in-frame animation on ${String(inv.args.data.nodeName || '?').replace(/\s+/g, ' ').slice(0, 60)}` : 'in-frame';
	};
	const rows = new Map();
	let prev = -Infinity, prevEnd = -Infinity;
	for (const s of starts) {
		const r = reqs.find((q) => q.ts >= prevEnd && q.ts < s.ts) || reqs.filter((q) => q.ts >= prev && q.ts < prevEnd).pop();
		const what = r ? name(r.ts) : 'no request seen';
		const row = rows.get(what) || [what, 0, 0, 0, 0];
		row[1]++; row[4] += s.dur / 1000;
		if (outs.some((t) => t >= s.ts && t <= s.ts + s.dur)) row[2]++; else row[3]++;
		rows.set(what, row);
		prev = s.ts; prevEnd = s.ts + s.dur;
	}
	return [...rows.values()].sort((a, b) => b[1] - a[1]).map((r) => [r[0], r[1], r[2], r[3], r2(r[4])]);
}

// Trace `ms` of whatever `during` does (or of nothing), and summarise it. One trace per window keeps each small.
export async function traceWindow(cdp, { ms = 3000, during, url, keep, allScripts = false } = {}) {
	await cdp.send('Tracing.start', { categories: TRACE_CATEGORIES, transferMode: 'ReturnAsStream', bufferUsageReportingInterval: 0 });
	// `at` (wall clock, ms) and the summary's `gpuPid` let a sampler outside the browser be matched to this window: the
	// GPU thread's busy time in a trace is the GPU process's CPU side, not the load on the graphics card itself
	const at = Date.now();
	const until = at + ms;
	try { if (during) await during(until); } finally {
		const left = until - Date.now(); if (left > 0) await new Promise((r) => setTimeout(r, left));
	}
	const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
	await cdp.send('Tracing.end');
	const done = await complete, { stream } = done;
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	const text = parts.join('');
	if (keep) (await import('node:fs')).writeFileSync(keep, text);
	// dataLoss: Chrome's own word that the trace buffer filled and events were dropped (lane V, 2026-11-15: two 3 s wheel
	// windows on Alexis came back with main 6 and 94 ms/s while the board scrolled); a caller that judges a window can
	// refuse or repeat one that lost data
	return { at, dataLoss: !!done.dataLossOccurred, ...summarise(JSON.parse(text), { url, allScripts }) };
}

// The trace's events, parsed, for a caller that measures windows of its own (traceWindow summarises the whole trace).
export async function traceEvents(cdp, { ms = 3000, during } = {}) {
	await cdp.send('Tracing.start', { categories: TRACE_CATEGORIES, transferMode: 'ReturnAsStream', bufferUsageReportingInterval: 0 });
	const until = Date.now() + ms;
	try { if (during) await during(until); } finally {
		const left = until - Date.now(); if (left > 0) await new Promise((r) => setTimeout(r, left));
	}
	const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
	await cdp.send('Tracing.end');
	const { stream } = await complete;
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	const t = JSON.parse(parts.join(''));
	return Array.isArray(t) ? t : t.traceEvents || [];
}

// What the page's main thread did in the `span` ms after each user-timing mark whose name starts with `prefix`
// (performance.mark in the page, e.g. just before a click): its busy time, its main frames and the longest, and the
// elements restyled (UpdateLayoutTree elementCount) with the time those restyles took, each restyle on its own, and the
// ten dearest event names by self time. The renderer is the one that wrote the marks. Returns [{ name, mainMs, frames,
// longestFrameMs, styleElements, styleMs, layouts, styles: [[ms after the mark, elements, ms]], top: [[name, ms]] }].
export function afterMarks(events, { prefix, span = 300 } = {}) {
	const marks = events.filter((e) => (e.cat || '').includes('blink.user_timing') && typeof e.name === 'string' && e.name.startsWith(prefix) && (e.ph === 'R' || e.ph === 'I' || e.ph === 'n' || e.ph === 'b'));
	if (!marks.length) return [];
	const pid = marks[0].pid;
	const names = new Map(); for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') names.set(e.pid + ':' + e.tid, e.args.name);
	const mainTid = [...names].find(([k, n]) => n === 'CrRendererMain' && Number(k.split(':')[0]) === pid)?.[0]?.split(':')[1];
	const evs = threadEvents(events, pid, Number(mainTid));
	const out = [];
	for (const m of marks) {
		const a = m.ts, b = m.ts + span * 1000;
		let busy = 0, end = -Infinity, frames = 0, longest = 0, elems = 0, styleUs = 0, layouts = 0;
		const styles = [], inWin = [];
		for (const e of evs) {
			if (e.ts + e.dur < a || e.ts > b) continue;
			inWin.push(e);
			const s = Math.max(a, e.ts), f = Math.min(b, e.ts + e.dur);
			if (f > end) { busy += f - Math.max(s, end); end = f; }
			if (e.name === 'ProxyMain::BeginMainFrame') { frames++; longest = Math.max(longest, e.dur); }
			else if (e.name === 'UpdateLayoutTree') { const n = e.args?.elementCount || 0; elems += n; styleUs += e.dur; styles.push([Math.round((e.ts - a) / 1000), n, r1(e.dur / 1000)]); }
			else if (e.name === 'Layout') layouts++;
		}
		// the dearest names by self time in the window, and each restyle: [ms after the mark, elements, ms]
		const { self } = selfTimes(inWin);
		const top = [...self].sort((x, y) => y[1] - x[1]).slice(0, 10).map(([n, us]) => [n, r1(us / 1000)]);
		out.push({ name: m.name, mainMs: r1(busy / 1000), frames, longestFrameMs: r1(longest / 1000), styleElements: elems, styleMs: r1(styleUs / 1000), layouts, styles, top });
	}
	return out;
}
