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
	const secs = Math.max(0.001, (t1 - t0) / 1e6);
	// the renderer that holds the page: named by the trace's frame list, else the busiest renderer main thread
	let rpid = null;
	const frames = started?.args?.data?.frames || [];
	const want = url ? frames.find((f) => f.url && f.url.split('?')[0] === url.split('?')[0] && !f.parent) || frames.find((f) => f.url && f.url.split('?')[0] === url.split('?')[0]) : null;
	if (want) rpid = want.processId;
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
			for (const e of a) { if (e.ts >= end) { sum += e.dur; end = e.ts + e.dur; } else if (e.ts + e.dur > end) { sum += e.ts + e.dur - end; end = e.ts + e.dur; } }
			byThread.set(k, sum);
		}
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
	if (mainKey) {
		const [pid, tid] = mainKey.split(':').map(Number);
		const evs = threadEvents(events, pid, tid);
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
	let drawFrames = 0, droppedFrames = 0, beginFrames = 0, animStarted = 0;
	const failed = new Map(), animNode = new Map(), composited = new Set();
	for (const e of events) {
		if (e.pid === rpid) {
			if (e.name === 'DrawFrame') drawFrames++;
			else if (e.name === 'DroppedFrame') droppedFrames++;
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
		const rep = e.args?.chrome_frame_reporter; if (!rep) continue;
		const s = String(rep.state || '').replace(/^STATE_/, '');
		states[s] = (states[s] || 0) + 1;
		if (rep.affects_smoothness) { smooth++; if (s === 'DROPPED') smoothDropped++; }
	}
	return {
		secs: r2(secs),
		gpuPid: gpuPid ?? null,
		cost,
		split,
		other: [...other].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, us]) => [n, perSec(us)]),
		mainFrames: { perSec: r1(mainFrames / secs), p50: r2(q(frameMs, 0.5)), p95: r2(q(frameMs, 0.95)), max: r2(frameMs[frameMs.length - 1] || 0) },
		style: { perSec: r1(styleCount / secs), elementsPerSec: Math.round(styleElems / secs) },
		layoutPerSec: r1(layoutCount / secs),
		// layouts that started at the document's root rather than at a boundary inside it (a glyph's svg, a contained card)
		wholeLayoutsPerSec: r1(wholeLayouts / secs),
		// DOM events the page's listeners were called for, by type, in the window (Chrome dispatches one only where a listener hears it)
		dispatched,
		drawn: { perSec: r1(draws.length / secs), gapP50: r2(q(gaps, 0.5)), gapP95: r2(q(gaps, 0.95)), gapMax: r2(gaps[gaps.length - 1] || 0), drawP50: r2(q(drawDur, 0.5)), drawP95: r2(q(drawDur, 0.95)) },
		frames: { beginPerSec: r1(beginFrames / secs), drawPerSec: r1(drawFrames / secs), droppedPerSec: r1(droppedFrames / secs) },
		notComposited: [...failed].sort((a, b) => b[1] - a[1]).slice(0, 12),
		animations: { started: animStarted, composited: composited.size },
		reporter: { states, smooth, smoothDropped },
		// [function@line:col of the built page, ms a second, calls a second]: the ten dearest, or every one with allScripts
		scripts: [...scripts].sort((a, b) => b[1].ms - a[1].ms).slice(0, allScripts ? Infinity : 10).map(([k, v]) => [k, allScripts ? Math.round(v.ms / secs * 100) / 100 : r1(v.ms / secs), r1(v.n / secs)])
	};
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
	const { stream } = await complete;
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	const text = parts.join('');
	if (keep) (await import('node:fs')).writeFileSync(keep, text);
	return { at, ...summarise(JSON.parse(text), { url, allScripts }) };
}
