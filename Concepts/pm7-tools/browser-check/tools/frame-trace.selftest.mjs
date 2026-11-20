// helpers/frame-trace.mjs on constructed traces (microseconds). node tools/frame-trace.selftest.mjs [frame-trace.mjs]
// (1) PM7PERF-STILL-FRAMES-STARTS: main frame STARTS, those abandoned with nothing to update, and the rendered rest;
// (2) PM7PERF-FRAMETRACE-STALE-TOP: after a navigation in one browser the frame list can still hold an old frame at the
//     page's address; the live frame (exact URL, the renderer that did the work) is the one summarised;
// (3) frameStarts names what asked for each start;
// (4) R67-T2: a DroppedFrame's hasPartialUpdate says the frame depended on a partial update, not that it was shown
//     (Chrome still reports kDropped for kDidNotPresentFrame / kReplacedByNewReporter). Each DroppedFrame is classified by
//     its frame reporter's final state (PipelineReporter frame_reporter / chrome_frame_reporter, matched by renderer,
//     layer tree, frame sequence and timestamp): dropped = not presented, presented partial = partial; with no reporter the
//     presentation is unknown, and the events without the flag are only that, never called fully dropped.
// (5) PM7PERF-FRAMETRACE-PAC-AS-PAINT: PaintArtifactCompositor::Update is Chrome's layerization of the whole page,
//     not Blink paint; the old paint pattern matched it before layerize was tried, so 83-89% of the stage's "paint"
//     was layerization (lane X). PAC is its own group, full and repainted-layers updates split by event name.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const given = process.argv[2];
const ft = await import(given ? pathToFileURL(resolve(given)).href : '../helpers/frame-trace.mjs');

const meta = (pid, tid, name) => ({ ph: 'M', name: 'thread_name', pid, tid, args: { name } });
const page = 'http://h/p.html?cb=2&o55=off';
const frames = [
	{ frame: 'OLD', url: 'http://h/p.html?cb=1&o55=off', processId: 10 },   // the earlier normal page's top frame, stale
	{ frame: 'TOP', url: 'http://h/sandbox-wrapper.html', processId: 30 },
	{ frame: 'APP', url: page, processId: 20, parent: 'TOP' }
];
const ev = [meta(10, 1, 'CrRendererMain'), meta(20, 2, 'CrRendererMain'), meta(30, 3, 'CrRendererMain'),
	{ name: 'TracingStartedInBrowser', ph: 'I', ts: 1, pid: 1, tid: 1, args: { data: { frames } } }];
// pid 20: 20 frame starts over 2 s, 14 abandoned with nothing to update, 1 deferred, 5 committed; one asked by a timer
for (let i = 0; i < 20; i++) {
	const ts = 1000 + i * 100000;
	ev.push({ name: 'ProxyMain::BeginMainFrame', ph: 'X', ts, dur: 3000, pid: 20, tid: 2 });
	if (i < 14) ev.push({ name: 'EarlyOut_NoUpdates', ph: 'I', ts: ts + 2500, pid: 20, tid: 2 });
	else if (i === 14) ev.push({ name: 'EarlyOut_DeferCommit', ph: 'I', ts: ts + 2500, pid: 20, tid: 2 });
	else ev.push({ name: 'ProxyMain::BeginMainFrame::commit', ph: 'X', ts: ts + 2000, dur: 500, pid: 20, tid: 2 });
	if (i === 3) {   // a timer's function asked for frame 3 (before it starts)
		ev.push({ name: 'TimerFire', ph: 'X', ts: ts - 20000, dur: 1000, pid: 20, tid: 2 });
		ev.push({ name: 'FunctionCall', ph: 'X', ts: ts - 19900, dur: 800, pid: 20, tid: 2, args: { data: { functionName: 'checkShown', lineNumber: 321576, columnNumber: 22 } } });
		ev.push({ name: 'LocalFrameView::ScheduleAnimation', ph: 'X', ts: ts - 19500, dur: 10, pid: 20, tid: 2 });
	}
}
ev.push({ name: 'Idle', ph: 'X', ts: 2000000, dur: 1000, pid: 20, tid: 2 });

const s = ft.summarise(ev, { url: page });
if (given) console.log(`given helper: mainFrames ${JSON.stringify(s.mainFrames)}`);
assert.equal(s.mainFrames.perSec, 10, '(2) the live app frame\'s renderer is summarised, not the stale top frame at the same address (20 starts in 2 s)');
assert.equal(s.mainFrames.noUpdatePerSec, 7, '(1) 14 starts abandoned with nothing to update');
assert.equal(s.mainFrames.renderedPerSec, 3, '(1) rendered = starts less the NoUpdates aborts (a deferred one counts as rendered)');
assert.equal(s.mainFrames.commitsPerSec, 2.5, '(1) the commit events themselves');
assert.deepEqual(s.mainFrames.aborts, { EarlyOut_DeferCommit: 1 }, '(1) any other early out is named');
assert.deepEqual(s.renderer, { pid: 20, tid: 2 });

// (1) a Chrome that wrote no abort events reads every start as rendered: high (a false fail), never low
const noOuts = ft.summarise(ev.filter((e) => !String(e.name).startsWith('EarlyOut_')), { url: page });
assert.equal(noOuts.mainFrames.renderedPerSec, 10);

// (2) without the exact URL the address alone picks the frame whose renderer did the work
const byPath = ft.summarise(ev, { url: 'http://h/p.html?cb=9' });
assert.equal(byPath.mainFrames.perSec, 10, 'by address: the busy renderer, not the stale idle one');

// (3) what asked for each start
const by = ft.frameStarts(ev, s.renderer);
const timer = by.find(([what]) => what === 'timer checkShown@321576:22');
assert.ok(timer && timer[1] === 1 && timer[2] === 1, `a timer's function named for the start it asked for: ${JSON.stringify(by)}`);
assert.equal(by.reduce((a, r) => a + r[1], 0), 20, 'every start is counted once');
assert.equal(by.reduce((a, r) => a + r[3], 0), 6, 'rendered per row adds up (5 commits + 1 deferred)');
// (4) twenty DroppedFrame events on the app's renderer over the 2 s window, each with the partial-update flag
const drops = (state, key = 'frame_reporter', flag = true) => {
	const out = [];
	for (let k = 0; k < 20; k++) {
		const ts = 5000 + k * 90000, seq = 900 + k;
		out.push({ name: 'DroppedFrame', ph: 'I', ts, pid: 20, tid: 4, args: { frameSeqId: seq, hasPartialUpdate: flag, layerTreeId: 1 } });
		if (state) out.push({ name: 'PipelineReporter', ph: 'b', ts, pid: 20, tid: 4, id2: { local: '0x' + seq }, args: { [key]: { state, frame_sequence: seq, layer_tree_host_id: 1 } } });
	}
	return out;
};
const dropped = ft.summarise([...ev, ...drops('STATE_DROPPED')], { url: page }).frames;
assert.equal(dropped.droppedPerSec, 10, '(4) every DroppedFrame event still counts in droppedPerSec');
assert.equal(dropped.notPresentedPerSec, 10, `(4) 20 flagged drops whose reporter ended DROPPED are 20 frames never presented, not 0: ${JSON.stringify(dropped)}`);
assert.equal(dropped.partialPerSec, 0, '(4) none of them was presented partially');
assert.equal(dropped.fullDroppedPerSec, undefined, '(4) no field claims "fully dropped" from the flag any more');
const partial = ft.summarise([...ev, ...drops('STATE_PRESENTED_PARTIAL')], { url: page }).frames;
assert.equal(partial.partialPerSec, 10, `(4) the same 20 with reporter state presented-partial are partial: ${JSON.stringify(partial)}`);
assert.equal(partial.notPresentedPerSec, 0, '(4) and none is a frame never presented');
const legacy = ft.summarise([...ev, ...drops('STATE_DROPPED', 'chrome_frame_reporter')], { url: page }).frames;
assert.equal(legacy.notPresentedPerSec, 10, '(4) the older chrome_frame_reporter key classifies the same way');
const unknown = ft.summarise([...ev, ...drops(null)], { url: page }).frames;
assert.equal(unknown.presentationUnknownPerSec, 10, `(4) with no reporter in the trace the presentation is unknown: ${JSON.stringify(unknown)}`);
assert.equal(unknown.notPresentedPerSec + unknown.partialPerSec, 0, '(4) and is not guessed either way');
const bare = ft.summarise([...ev, ...drops(null, 'frame_reporter', false)], { url: page }).frames;
assert.equal(bare.unflaggedPerSec, 10, '(4) DroppedFrame events without the flag are reported under that name');
assert.equal(bare.presentationUnknownPerSec, 10, '(4) and their presentation is still unknown without a reporter');

// A reused sequence in the same renderer and tree belongs to a different frame when its timestamp differs.
const [firstDrop, firstReporter] = drops('STATE_DROPPED');
const forkReporter = (ts, source, state) => ({
	...firstReporter, ts, args: { frame_reporter: {
		...firstReporter.args.frame_reporter, frame_source: source, state
	} }
});
const originalReporter = forkReporter(firstDrop.ts, 1, 'STATE_DROPPED');
const reusedReporter = forkReporter(firstDrop.ts + 1000000, 2, 'STATE_PRESENTED_ALL');
const reused = ft.summarise([...ev, reusedReporter, firstDrop, originalReporter], { url: page }).frames;
assert.equal(reused.notPresentedPerSec, 0.5, 'a reused frame sequence at a different time cannot override a drop');
assert.equal(reused.presentedAllPerSec, 0, 'the later frame did not present the earlier frame');
const sameFrameFork = forkReporter(firstDrop.ts, 1, 'STATE_PRESENTED_PARTIAL');
const forked = ft.summarise([...ev, firstDrop, originalReporter, sameFrameFork], { url: page }).frames;
assert.equal(forked.partialPerSec, 0.5, 'reporters that share the frame identity still combine their final states');

// (5) one renderer, a 1 s window: Blink Paint 300 ms, a full PAC Update 100 ms holding a 60 ms Layerize (self 40 ms),
// a repainted-layers update 150 ms, another PAC event 50 ms. The old helper filed all 240 ms of PAC under paint.
const pev = [meta(20, 2, 'CrRendererMain'),
	{ name: 'TracingStartedInBrowser', ph: 'I', ts: 1, pid: 1, tid: 1, args: { data: { frames: [{ frame: 'APP', url: page, processId: 20 }] } } },
	{ name: 'Paint', ph: 'X', ts: 10000, dur: 200000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'PaintArtifactCompositor::Update', ph: 'X', ts: 300000, dur: 100000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'Layerize', ph: 'X', ts: 320000, dur: 60000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'PaintArtifactCompositor::UpdateRepaintedLayers', ph: 'X', ts: 500000, dur: 150000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'Paint', ph: 'X', ts: 700000, dur: 100000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'PaintArtifactCompositor::Rebuild', ph: 'X', ts: 900000, dur: 50000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'Idle', ph: 'X', ts: 999999, dur: 1, pid: 20, tid: 2, cat: 'devtools.timeline' }];
const ps = ft.summarise(pev, { url: page });
assert.equal(ps.split.paint, 300, `(5) paint is Blink's own Paint only (300 ms/s), not PAC layerization: ${JSON.stringify(ps.split)}`);
assert.equal(ps.split.layerize, 60, '(5) the Layerize inside the PAC Update keeps its own group (60 ms/s self time)');
assert.equal(ps.split.pac, 240, `(5) PAC Update is its own group (240 ms/s): ${JSON.stringify(ps.split)}`);
assert.deepEqual(ps.pac, { full: 40, repainted: 150, other: 50 }, `(5) full and repainted-layers updates split when the trace names them: ${JSON.stringify(ps.pac)}`);
const noPac = ft.summarise(pev.filter((e) => !/PaintArtifactCompositor/.test(e.name || '')), { url: page });
assert.equal(noPac.split.pac, undefined, '(5) a trace with no PAC events has no pac group');
assert.deepEqual(noPac.pac, { full: 0, repainted: 0, other: 0 }, '(5) and its split reads zero, not a guess');

console.log('PASS frame starts, NoUpdates aborts and rendered frames counted per renderer; the live frame wins over a stale record at the same address; frameStarts names the asking task; DroppedFrame events classified by their reporter\'s final state (not presented, partial, unknown); PAC Update is its own group split full/repainted, paint is Blink paint only');
