// The NieR forced-layout row (helpers/onb-rest-rows.mjs) on constructed traces.
// node tools/onb-rest-rows.selftest.mjs [onb-rest-rows.mjs] [frame-trace.mjs]
// PM7PERF-ONBREST-NO-RENDERER-READS-ZERO: a trace that names no renderer main thread, or that carries no Layout
// category (devtools.timeline), measured nothing: the row must FAIL as "could not judge", never pass as 0 a draw.
// The old row logic (count 0 when the renderer is absent, divide, compare) passes both traces; run this self-test
// against it to see the false PASS.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const rows = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/onb-rest-rows.mjs');
const ft = await import(process.argv[3] ? pathToFileURL(resolve(process.argv[3])).href : '../helpers/frame-trace.mjs');

const meta = (pid, tid, name) => ({ ph: 'M', name: 'thread_name', pid, tid, args: { name } });
const page = 'http://h/p.html?cb=1';
// a 2 s window on one renderer main thread: 100 frame starts, a Layout inside a script task in 20 of them
const base = [meta(20, 2, 'CrRendererMain'),
	{ name: 'TracingStartedInBrowser', ph: 'I', ts: 1, pid: 1, tid: 1, args: { data: { frames: [{ frame: 'APP', url: page, processId: 20 }] } } }];
for (let i = 0; i < 100; i++) {
	const ts = 1000 + i * 20000;
	base.push({ name: 'ProxyMain::BeginMainFrame', ph: 'X', ts, dur: 3000, pid: 20, tid: 2, cat: 'devtools.timeline' });
	if (i < 20) {
		base.push({ name: 'FunctionCall', ph: 'X', ts: ts + 100, dur: 900, pid: 20, tid: 2, cat: 'devtools.timeline' });
		base.push({ name: 'Layout', ph: 'X', ts: ts + 200, dur: 300, pid: 20, tid: 2, cat: 'devtools.timeline', args: { beginData: { partialLayout: false } } });
	}
}
// the same window with no renderer main thread named: only the display compositor's draws
const noRenderer = [meta(30, 3, 'VizCompositorThread'),
	{ name: 'TracingStartedInBrowser', ph: 'I', ts: 1, pid: 1, tid: 1, args: { data: { frames: [{ frame: 'APP', url: page, processId: 20 }] } } }];
for (let i = 0; i < 100; i++) noRenderer.push({ name: 'Display::DrawAndSwap', ph: 'X', ts: 1000 + i * 20000, dur: 500, pid: 30, tid: 3, cat: 'viz' });
// the renderer is named but the trace carries no devtools.timeline category (its events are cc only)
const noLayoutCat = base.map((e) => e.ph === 'M' || e.name === 'TracingStartedInBrowser' ? e : { ...e, cat: 'cc' });

// the false PASS first: no renderer named, the old logic read 0 forced layouts and passed
const nr = ft.summarise(noRenderer, { url: page });
assert.equal(nr.renderer, null, 'the trace names no renderer main thread');
const nrRow = rows.forcedLayoutRow({ summary: nr, forced: { layouts: 0 }, drawsPerSec: 100, max: 0.1 });
assert.equal(nrRow.ok, false, `PM7PERF-ONBREST-NO-RENDERER-READS-ZERO: a trace with no renderer main thread could not judge forced layouts and must FAIL the row, not pass as 0 a draw: ${nrRow.detail}`);
assert.match(nrRow.detail, /could not judge/);

// the same when the Layout category is absent: the renderer is named, but no Layout event could appear
const nc = ft.summarise(noLayoutCat, { url: page });
assert.deepEqual(nc.renderer, { pid: 20, tid: 2 }, 'the renderer is still named');
const ncRow = rows.forcedLayoutRow({ summary: nc, forced: { layouts: 0 }, drawsPerSec: 100, max: 0.1 });
assert.equal(ncRow.ok, false, `a trace without the Layout category could not judge forced layouts and must FAIL the row, not pass as 0 a draw: ${ncRow.detail}`);
assert.match(ncRow.detail, /could not judge/);
assert.equal(nc.layoutCategory, false, 'the trace carries no devtools.timeline category');

// a measured trace is judged: 19 forced layouts in about 2 s at 100 draws a second is under 0.1 a draw, 22 is over
const s = ft.summarise(base, { url: page });
assert.deepEqual(s.renderer, { pid: 20, tid: 2 }, 'the renderer main thread is named');
assert.equal(s.layoutCategory, true, 'the trace carries the Layout category (devtools.timeline)');
const judged = rows.forcedLayoutRow({ summary: s, forced: { layouts: 19 }, drawsPerSec: 100, max: 0.1 });
assert.equal(judged.ok, true, `a measured trace under the bound passes: ${judged.detail}`);
const over = rows.forcedLayoutRow({ summary: s, forced: { layouts: 22 }, drawsPerSec: 100, max: 0.1 });
assert.equal(over.ok, false, `a measured trace over the bound fails: ${over.detail}`);

// no trace at all, and no draws to divide by: could not judge, never a pass
assert.equal(rows.forcedLayoutRow({ summary: null, forced: { layouts: 0 }, drawsPerSec: 100 }).ok, false);
const noFrames = { renderer: { pid: 20, tid: 2 }, layoutCategory: true, secs: 2, mainFrames: { perSec: 0 }, layoutPerSec: 0 };
assert.equal(rows.forcedLayoutRow({ summary: noFrames, forced: { layouts: 0 }, drawsPerSec: 0, max: 0.1 }).ok, false, 'with no drawn frames the row could not judge (the check fails the draws row first)');

console.log('PASS the NieR forced-layout row judges a measured trace and FAILS as could-not-judge a trace with no renderer main thread or no Layout category (the old zero-read false PASS)');
