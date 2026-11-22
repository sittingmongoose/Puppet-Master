// The still toggle's recalc in a trace (perf-still-page's toggleRecalcs) and the forced prewarm control's verdict
// (still-prewarm-control's forcedInToggle). PM7PERF-PREWARM-CONTROL-NULL: on a loaded Alexis one forced control read
// R=null because the window ended 60 ms after the toggle's mark. Constructed events, in microseconds.
// node tools/still-toggle-recalc.selftest.mjs [perf-still-page.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const page = process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-still-page.check.mjs';
const { toggleRecalcs } = await import(page);
const { forcedInToggle } = await import('../helpers/still-prewarm-control.mjs');

const ev = (name, ts, extra = {}) => ({ name, ts, pid: 1, tid: 1, ...extra });
const mark = (name, ts) => ev(name, ts, { cat: 'blink.user_timing', ph: 'R' });
const recalc = (ts, n) => ev('UpdateLayoutTree', ts, { ph: 'X', dur: 900, args: { elementCount: n } });
const frame = (ts, dur) => ev('ProxyMain::BeginMainFrame', ts, { ph: 'X', dur });
const probe = { forced: [{ id: 2, stage: 3 }], errors: [] };

// 1. the toggle's recalc 84 ms after its mark (the forced step ran 5 ms after the mark): found, and the control passes
const late = [mark('pm-still:on', 1000000), mark('pm-still:prewarm:forced:2:3', 1005000), frame(1080000, 9000), recalc(1084000, 135), recalc(1300000, 40)];
const r1 = toggleRecalcs(late).after('pm-still:on', 'pm-still:on');
assert.equal(r1.found, true, 'a recalc 84 ms after the mark is the toggle\'s');
assert.equal(r1.first, 135);
assert.equal(r1.delayMs, 84);
assert.equal(r1.steps, 1, 'the logged spread is the 60 ms after the first recalc, not the next frame\'s 40');
assert.equal(forcedInToggle(r1, ['pm-still:prewarm:forced:2:3', 1005000], probe), true);

// 2. the same input in the old window (mark + 60 ms) read no recalc: shown with the check on main when given
if (process.argv[2]) {
	const old = toggleRecalcs(late).after('pm-still:on', 'pm-still:on');
	console.log(`given check: found ${old?.found}, first ${old?.first}`);
}

// 3. still bites: the forced step after the toggle's recalc, before the mark, missing, twice, or with an error fails
const r3 = toggleRecalcs([mark('pm-still:on', 1000000), recalc(1010000, 51), mark('pm-still:prewarm:forced:2:3', 1020000)]).after('pm-still:on', 'pm-still:on');
assert.equal(forcedInToggle(r3, ['f', 1020000], probe), false, 'forced step after the recalc');
assert.equal(forcedInToggle(r3, ['f', 990000], probe), false, 'forced step before the mark');
assert.equal(forcedInToggle(r3, null, probe), false, 'no forced step');
assert.equal(forcedInToggle(r3, ['f', 1005000], { forced: [{ stage: 3 }, { stage: 3 }], errors: [] }), false, 'forced twice');
assert.equal(forcedInToggle(r3, ['f', 1005000], { forced: [{ stage: 2 }], errors: [] }), false, 'not step three');
assert.equal(forcedInToggle(r3, ['f', 1005000], { forced: [{ stage: 3 }], errors: ['x'] }), false, 'an error');
assert.equal(forcedInToggle(r3, ['f', 1005000], probe), true, 'between them');

// 4. no mark in the trace, or no recalc after it: unjudged (null / found false), and the control fails
const noMark = toggleRecalcs([recalc(1010000, 51)]).after('pm-still:on', 'pm-still:on');
assert.equal(noMark, null);
assert.equal(forcedInToggle(noMark, ['f', 1005000], probe), false);
const noRecalc = toggleRecalcs([recalc(990000, 51), mark('pm-still:on', 1000000)]).after('pm-still:on', 'pm-still:on');
assert.equal(noRecalc.found, false, 'a recalc before the mark is not the toggle\'s');
assert.equal(forcedInToggle(noRecalc, ['f', 1005000], probe), false);

// 5. only the marking thread's recalcs count
const other = toggleRecalcs([mark('pm-still:on', 1000000), { ...recalc(1004000, 900), tid: 2 }, recalc(1020000, 60)]).after('pm-still:on', 'pm-still:on');
assert.equal(other.first, 60);
// 6. PM7PERF-STILL-MISSING-COUNT: a recalc with no element count is unmeasured, never a measured zero, so the toggle's
// cost (3H+19) is unjudgeable and fails; an explicit 0 (Chrome writes it: 5 and 16 of the recalcs in two saved Home
// traces) is a measurement. Main's check read the missing count as 0 and passed it.
const { toggleCost } = await import('../helpers/still-toggle-cost.mjs');
const missing = toggleRecalcs([mark('pm-still:on', 1000000), ev('UpdateLayoutTree', 1008000, { ph: 'X', dur: 900, args: {} }), recalc(1030000, 70)]).after('pm-still:on', 'pm-still:on');
assert.equal(missing.first, null, 'no count is unmeasured');
assert.equal(missing.total, null, 'a total over an unmeasured recalc is unmeasured');
assert.equal(missing.max, 70, 'the largest measured recalc is still logged');
assert.equal(toggleCost(missing.first, 24).pass, false, 'and the toggle\'s cost cannot pass');
const zero = toggleRecalcs([mark('pm-still:on', 1000000), recalc(1008000, 0)]).after('pm-still:on', 'pm-still:on');
assert.equal(zero.first, 0);
assert.equal(toggleCost(zero.first, 24).pass, true, 'an explicit zero is measured');
if (process.argv[2]) console.log(`given check: missing count read as ${toggleRecalcs([mark('pm-still:on', 1000000), ev('UpdateLayoutTree', 1008000, { ph: 'X', dur: 900, args: {} })]).after('pm-still:on', 'pm-still:on').first}`);
// 7. PM7PERF-PREWARM-CONTROL-ARM-RACE (TIB-P1's real late-arm replays, reviews/TIB-P1-REPORT.md: the base diagnostic
// armed 3044.2 ms after the waking move, the head diagnostic 3055.7 ms, against the 3000 ms still deadline; the page
// went still before the arm, the trace carried no pm-still:on mark and no forced mark, and the callback stayed
// parked). The base row judged forcedInToggle(null, undefined, probe) = false: a FAIL, "no still mark in the trace",
// although the product was right. The control must read could-not-judge for that replay instead.
const { prewarmControlVerdict } = await import('../helpers/still-prewarm-control.mjs');
const parkedProbe = { forced: [], errors: [], parked: { id: 2, stage: 3 } };
assert.equal(forcedInToggle(null, undefined, parkedProbe), false, 'what the base row judged on the late replay');
assert.equal(typeof prewarmControlVerdict, 'function', 'the control needs a late-arm verdict; the base fails the 3044/3056 ms arm as a missed mark');
const lateArm = prewarmControlVerdict({ armStill: true, recalc: null, forcedMark: undefined, probe: parkedProbe });
assert.equal(lateArm.couldNotJudge, true, 'an arm after the page went still is could-not-judge, not a missed mark');
assert.equal(lateArm.pass, false);
// the passing base diagnostic armed at 2692.8 ms with the page awake: the real marks keep their pass
const onTime = prewarmControlVerdict({ armStill: false, recalc: r1, forcedMark: ['pm-still:prewarm:forced:2:3', 1005000], probe });
assert.equal(onTime.pass, true); assert.equal(onTime.couldNotJudge, false);
// the forced step ran but its mark never reached the trace (the trace opened after the transition): could-not-judge
const traceMiss = prewarmControlVerdict({ armStill: false, recalc: null, forcedMark: undefined, probe });
assert.equal(traceMiss.couldNotJudge, true); assert.equal(traceMiss.pass, false);
// real misses keep failing: the forced step after the recalc with both marks in the trace, or no forced step at all
const outside = prewarmControlVerdict({ armStill: false, recalc: r3, forcedMark: ['f', 1020000], probe });
assert.equal(outside.pass, false); assert.equal(outside.couldNotJudge, false);
const absent = prewarmControlVerdict({ armStill: false, recalc: r3, forcedMark: ['f', 1005000], probe: { forced: [], errors: [] } });
assert.equal(absent.pass, false); assert.equal(absent.couldNotJudge, false);
console.log('PASS the toggle\'s recalc is the first after its mark however late (84 ms read), the spread is the 60 ms after it; the control fails when the forced step is outside mark..recalc, missing, repeated or erroring; a recalc with no count is unmeasured, an explicit 0 measured; a late arm (3044/3056 ms vs the 3000 ms deadline) and a forced step outside the trace are could-not-judge, an on-time arm keeps its pass');
