// helpers/trace-guard.mjs on a renderer-less trace, built by helpers/frame-trace.mjs itself.
// node tools/trace-guard.selftest.mjs [trace-guard.mjs] [frame-trace.mjs]
//
// PM7PERF-NO-RENDERER-READS-ZERO (R124 O-1): a trace that names no renderer main thread summarises with split {},
// mainFrames 0 and layout counts 0, and the three checks judged those zeros as passes. Below, the old judging logic of
// each check is written out where it stood (perf-usage-scroll's helper, perf-rest:126-134, perf-still-page's
// rendered/starts rows) and passes the renderer-less summary; traceJudgeable fails it as could not judge.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const arg = (n) => (process.argv[n] ? pathToFileURL(resolve(process.argv[n])).href : null);
const tg = await import(arg(2) || '../helpers/trace-guard.mjs');
const ft = await import(arg(3) || '../helpers/frame-trace.mjs');

const page = 'http://h/p.html?cb=3';
const meta = (pid, tid, name) => ({ ph: 'M', name: 'thread_name', pid, tid, args: { name } });
// the page's renderer (pid 20) is named by the frame list but has no CrRendererMain thread event: renderer: null
const base = [
	meta(30, 3, 'VizCompositorThread'),
	{ name: 'TracingStartedInBrowser', ph: 'I', ts: 1, pid: 1, tid: 1, args: { data: { frames: [{ frame: 'APP', url: page, processId: 20 }] } } },
	// a devtools.timeline event from another process: the Layout category is present, the renderer still is not
	{ name: 'Idle', ph: 'X', ts: 990000, dur: 1, pid: 40, tid: 4, cat: 'devtools.timeline' }
];
for (let i = 0; i < 40; i++) base.push({ name: 'Display::DrawAndSwap', ph: 'X', ts: 100000 + i * 100000, dur: 0, pid: 30, tid: 3, cat: 'viz' });
const blind = ft.summarise(base, { url: page });
assert.equal(blind.renderer, null, `a trace that names no renderer main thread summarises renderer: null: ${JSON.stringify(blind.renderer)}`);
assert.equal(blind.layoutCategory, true, 'and the category guard is not what caught it here (devtools.timeline is present)');
assert.equal(blind.mainFrames.perSec, 0, 'main frames read 0');
assert.equal(blind.wholeLayoutsPerSec, 0, 'whole-document layouts read 0');
assert.deepEqual(blind.split, {}, 'and the main-thread split is empty');

// perf-usage-scroll's old "could judge" (helpers/usage-scroll-verdict.mjs): every window scrolled and was whole. One
// renderer-less as-built window halves the paint mean: 100 against a control's 200 passes 0.85.
const oldScrollJudge = (ws) => ws.length > 0 && ws.every((w) => w.scrolls > 0 && w.whole);
const ws = [
	{ name: 'as built', scrolls: 48, whole: true, paint: 0 },
	{ name: 'control', scrolls: 48, whole: true, paint: 200 },
	{ name: 'control', scrolls: 48, whole: true, paint: 200 },
	{ name: 'as built', scrolls: 48, whole: true, paint: 200 }
];
assert.equal(oldScrollJudge(ws), true, 'OLD: a renderer-less window passed "could judge" (its 0 paint is what halves the mean)');
const mean = (name) => { const v = ws.filter((w) => w.name === name).map((w) => w.paint); return v.reduce((a, b) => a + b, 0) / v.length; };
assert.ok(mean('as built') / Math.max(1, mean('control')) <= 0.85, 'OLD: and the 0.5 ratio PASSED the 0.85 bound without measuring the as-built scroll');
assert.equal(tg.traceJudgeable(blind).ok, false, 'NEW: the same renderer-less summary is could not judge, so the window fails');
assert.match(tg.traceJudgeable(blind).why, /could not judge: no renderer thread/);

// perf-rest:126-134's old judged predicate, then its two rows on the zeros
const oldRestJudged = blind.secs > 4000 / 1000 * 0.8 && 238 > 20 && 238 < 400;
assert.equal(oldRestJudged, true, 'OLD: the renderer-less trace passed "the rest trace could be judged"');
assert.ok(blind.mainFrames.perSec / 238 * 100 <= 65, 'OLD: main-thread frames at rest passed at 0% of the refresh');
assert.ok(blind.wholeLayoutsPerSec <= 10, 'OLD: whole-document layouts at rest passed at 0 a second');
assert.equal(tg.traceJudgeable(blind, { layouts: true }).ok, false, 'NEW: perf-rest cannot judge main frames or layouts from it');

// perf-still-page's Settings rows: rendered <= 10 a second, starts <= 0.45 of the refresh capped at 60
const startCap = Math.min(60, 0.45 * 238);
assert.ok(blind.mainFrames.renderedPerSec <= 10, 'OLD: Settings rendered frames passed at 0/s');
assert.ok(blind.mainFrames.perSec <= startCap, `OLD: Settings starts passed at 0/s against ${startCap}`);
assert.equal(tg.traceJudgeable(blind).ok, false, 'NEW: perf-still-page cannot judge its main-frame rows from it');

// a measured trace carries the renderer and both flags; a renderer without the Layout category fails only where layouts are judged
const measured = ft.summarise([...base, meta(20, 2, 'CrRendererMain'),
	{ name: 'ProxyMain::BeginMainFrame', ph: 'X', ts: 200000, dur: 2000, pid: 20, tid: 2, cat: 'devtools.timeline' },
	{ name: 'Layout', ph: 'X', ts: 210000, dur: 1000, pid: 20, tid: 2, cat: 'devtools.timeline', args: { beginData: { partialLayout: false } } }], { url: page });
assert.deepEqual(measured.renderer, { pid: 20, tid: 2 }, 'a measured trace names its renderer');
assert.deepEqual(tg.traceJudgeable(measured, { layouts: true }), { ok: true, why: '' }, 'and can be judged');
const noCat = ft.summarise([...base.filter((e) => e.cat !== 'devtools.timeline'), meta(20, 2, 'CrRendererMain'),
	{ name: 'ProxyMain::BeginMainFrame', ph: 'X', ts: 200000, dur: 2000, pid: 20, tid: 2 }], { url: page });
assert.equal(noCat.renderer !== null, true, 'a trace can name the renderer without the Layout category');
assert.match(tg.traceJudgeable(noCat, { layouts: true }).why, /could not judge: no Layout category/, 'perf-rest refuses it');
assert.equal(tg.traceJudgeable(noCat).ok, true, 'a check that judges no layouts (paint, main frames) still judges it');
assert.equal(tg.traceJudgeable(null).ok, false, 'no trace is could not judge');

console.log('PASS a renderer-less trace (split {}, 0 main frames, 0 layouts) passed all three checks\' old judging logic (usage-scroll\'s ratio even passed at 0.50); traceJudgeable fails it as could not judge, and the Layout category is required only where layouts are judged');
