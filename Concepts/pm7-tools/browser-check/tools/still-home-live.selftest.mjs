// Home's live-beat placement and exclusion (helpers/still-home-live.mjs) on constructed readings and traces.
// node tools/still-home-live.selftest.mjs [still-home-live.mjs]
// PM7PERF-STILLPAGE-HOME-LIVE-TICKS: the old Home row read the beat's phase (lane V's 2 s windows on a correct page:
// 15.5, 40.9, 0, 70.9, 5.5, 55.9 draws/s; the red browser run run-item5-red on main.html read first tries of 55.7,
// 66.1, 16.3 and 29.8). The window goes between two beats; a beat that still lands in it has its own frames taken
// out of both the draw count and the window's length.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const m = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/still-home-live.mjs');

// placement: beats every 6 s (3 ticks of 2 s), a beat's draws end about 1.2 s after it
const w = { beats: [{ at: 10000 }], period: 2000, now: 10500 };
const p1 = m.homeBeatPlan(w, { ms: 2000 });
assert.equal(p1.placed, true, `a 2 s window fits between the tails: ${p1.why}`);
assert.equal(p1.waitMs, 700, 'wait out the last beat\'s tail (10000 + 1200 - 10500), then trace before the next beat at 16000');
const p2 = m.homeBeatPlan({ ...w, now: 15000 }, { ms: 2000 });
assert.equal(p2.placed, true);
assert.equal(p2.waitMs, 2200, 'too close to the next beat: wait for it (16000) and its tail, then trace before the one after (22000)');
const fast = m.homeBeatPlan({ beats: [{ at: 10000 }], period: 1000, now: 10500 }, { ms: 2000 });
assert.equal(fast.placed, false, 'beats every 3 s leave 1.8 s between tails: no clean 2 s window, the exclusion judges instead');
assert.match(fast.why, /too little/);
assert.equal(m.homeBeatPlan({ beats: [], period: 2000, now: 10500 }, { ms: 2000 }).placed, false, 'no beat observed yet: no plan');
assert.equal(m.homeBeatPlan({ beats: [{ at: 10000 }], period: null, now: 10500 }, { ms: 2000 }).placed, false, 'no tick period: no plan');
assert.equal(m.homeBeatPlan(w, { ms: 2000, maxWait: 500 }).placed, false, 'a wait over the cap is not a plan');

// exclusion: a 4 s window, 40 draws (one every 100 ms), one beat mark at 1.5 s with a 1.2 s tail
const meta = { ph: 'M', name: 'thread_name', pid: 30, tid: 3, args: { name: 'VizCompositorThread' } };
const start = { name: 'TracingStartedInBrowser', ph: 'I', ts: 1, pid: 1, tid: 1, args: { data: { frames: [] } } };
const draws = [];
for (let i = 0; i < 40; i++) draws.push({ name: 'Display::DrawAndSwap', ph: 'X', ts: 100000 + i * 100000, dur: 0, pid: 30, tid: 3, cat: 'viz' });
const mark = (ts) => ({ name: 'pm-still:beat', ph: 'I', ts, pid: 20, tid: 2, cat: 'blink.user_timing' });
const ev = [meta, start, ...draws, mark(1500000)];
const a = m.beatFreeDrawn(ev);
assert.deepEqual({ rate: a.drawnPerSec, kept: a.kept, draws: a.draws, beats: a.beats, secs: a.secs }, { rate: 9.6, kept: 27, draws: 40, beats: 1, secs: 2.8 },
	`the beat's 13 draws (1.5-2.7 s) come out of both the count and the window: 27 over 2.8 s, not 40 over 4 s: ${JSON.stringify(a)}`);
assert.equal(m.beatFreeDrawn([meta, start, ...draws]), null, 'a trace with no beat mark has nothing to take out');
const two = m.beatFreeDrawn([meta, start, ...draws, mark(1500000), mark(2000000)]);
assert.equal(two.kept, 22, 'overlapping beat spans merge (1.5-3.2 s): 18 draws out');
assert.equal(two.secs, 2.3, 'and the covered time is counted once');
const full = m.beatFreeDrawn([meta, start, ...draws, ...[200000, 700000, 1200000, 1700000, 2200000, 2700000, 3200000, 3700000].map(mark)]);
assert.equal(full.drawnPerSec, null, 'beats covering the whole window leave under 0.25 s: could not judge, the try is taken again');

console.log('PASS the Home still window is placed between two live beats (wait out the tail, skip a too-close beat); a beat that lands in it has its own draws and span taken out of the rate, and a covered window is could-not-judge');
