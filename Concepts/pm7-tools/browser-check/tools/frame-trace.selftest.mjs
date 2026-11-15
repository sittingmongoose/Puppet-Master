// helpers/frame-trace.mjs on constructed traces (microseconds). node tools/frame-trace.selftest.mjs [frame-trace.mjs]
// (1) PM7PERF-STILL-FRAMES-STARTS: main frame STARTS, those abandoned with nothing to update, and the rendered rest;
// (3) frameStarts names what asked for each start.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const given = process.argv[2];
const ft = await import(given ? pathToFileURL(resolve(given)).href : '../helpers/frame-trace.mjs');

const meta = (pid, tid, name) => ({ ph: 'M', name: 'thread_name', pid, tid, args: { name } });
const page = 'http://h/p.html?cb=2&o55=off';
const frames = [
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
assert.equal(s.mainFrames.perSec, 10, '(1) the app frame\'s renderer: 20 starts in 2 s');
assert.equal(s.mainFrames.noUpdatePerSec, 7, '(1) 14 starts abandoned with nothing to update');
assert.equal(s.mainFrames.renderedPerSec, 3, '(1) rendered = starts less the NoUpdates aborts (a deferred one counts as rendered)');
assert.equal(s.mainFrames.commitsPerSec, 2.5, '(1) the commit events themselves');
assert.deepEqual(s.mainFrames.aborts, { EarlyOut_DeferCommit: 1 }, '(1) any other early out is named');
assert.deepEqual(s.renderer, { pid: 20, tid: 2 });

// (1) a Chrome that wrote no abort events reads every start as rendered: high (a false fail), never low
const noOuts = ft.summarise(ev.filter((e) => !String(e.name).startsWith('EarlyOut_')), { url: page });
assert.equal(noOuts.mainFrames.renderedPerSec, 10);

// (3) what asked for each start
const by = ft.frameStarts(ev, s.renderer);
const timer = by.find(([what]) => what === 'timer checkShown@321576:22');
assert.ok(timer && timer[1] === 1 && timer[2] === 1, `a timer's function named for the start it asked for: ${JSON.stringify(by)}`);
assert.equal(by.reduce((a, r) => a + r[1], 0), 20, 'every start is counted once');
assert.equal(by.reduce((a, r) => a + r[3], 0), 6, 'rendered per row adds up (5 commits + 1 deferred)');
console.log('PASS frame starts, NoUpdates aborts and rendered frames counted per renderer; frameStarts names the asking task');
