// checks/perf-onb-rest.check.mjs's rest gate (POSE in the page, restVerdict in node) on a stub stage.
//   node tools/onb-rest-pose.selftest.mjs [perf-onb-rest.check.mjs]
// PM7PERF-ONBREST-AWAKE-NOT-ASSERTED: the check woke Pip with a pointer journey and waited, but never asserted that Pip
// was awake or its pose settled before a sample: a cell measured Pip asleep past Welcome, or mid-wake (rising from the
// floor, hopping, the wake's feeling on show), exactly as it measured Pip at rest. Each sample now waits for the gate.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const m = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-onb-rest.check.mjs');
assert.equal(typeof m.POSE, 'function', 'the check exports POSE (its in-page rest reading)');
assert.equal(typeof m.restVerdict, 'function', 'the check exports restVerdict');

// a stage at rest as Stage.step leaves it (58-rig.js): the hand on its spot plus a little sway, no hop, no feeling
const stage = (o = {}) => ({
	sleepZ: false, t: 40, moodOverride: null, moodUntil: 0, fam: { sway: 5 },
	bubble: { classList: { contains: (c) => c === 'typing' && !!o.typing } },
	props: new Map([['a', { state: 'in', settled: true }]]),
	...o,
	ps: { C: { x: 103, y: 50 }, Ct: { x: 100, y: 50 }, lift: 0, dy: 0, dyv: 0, asleep: false, ...(o.ps || {}) }
});
const read = (st) => { globalThis.document = { querySelector: () => (st ? { __pipStage: st } : null) }; try { return m.POSE(); } finally { delete globalThis.document; } };
const verdict = (st, want) => m.restVerdict(read(st), want);

// at rest and awake: the gate opens past Welcome and stays shut on Welcome (Pip must be asleep there)
assert.equal(verdict(stage(), 'awake').ok, true, verdict(stage(), 'awake').why);
assert.match(verdict(stage(), 'asleep').why, /awake, want asleep/);
// asleep past Welcome (no arrival woke it): the old check measured this as at rest
const asleep = stage({ sleepZ: true, ps: { asleep: true, C: { x: 100, y: 50 }, Ct: { x: 100, y: 50 } } });
assert.equal(verdict(asleep, 'awake').ok, false);
assert.match(verdict(asleep, 'awake').why, /Pip asleep, want awake/);
assert.equal(verdict(asleep, 'asleep').ok, true, verdict(asleep, 'asleep').why);
// the pose asleep alone (a scene's pip.pose 'asleep') counts as asleep
assert.match(verdict(stage({ ps: { asleep: true } }), 'awake').why, /Pip asleep/);
// mid-wake: sleepZ just cleared, the hand still low on its way up from the floor (rope 184 x .72 below its spot)
const rising = stage({ ps: { C: { x: 100, y: 180 }, Ct: { x: 100, y: 50 } } });
assert.equal(verdict(rising, 'awake').ok, false);
assert.match(verdict(rising, 'awake').why, /the hand 0, 130 from its spot/);
// the lift raises the spot the hand springs to (ty = Ct.y - lift): a lifted hand on its spot is at rest
assert.equal(verdict(stage({ ps: { C: { x: 100, y: 30 }, Ct: { x: 100, y: 50 }, lift: 20 } }), 'awake').ok, true);
// NieR's bob widens the band across y by 0.6 bob; sway across x
assert.equal(verdict(stage({ fam: { sway: 2.4, bob: 3.2 }, ps: { C: { x: 105, y: 54.5 }, Ct: { x: 100, y: 50 } } }), 'awake').ok, true);
assert.equal(verdict(stage({ fam: { sway: 2.4, bob: 3.2 }, ps: { C: { x: 106, y: 50 }, Ct: { x: 100, y: 50 } } }), 'awake').ok, false);
// the wake's hop and its feeling
assert.match(verdict(stage({ ps: { dyv: -105 } }), 'awake').why, /a hop under way/);
assert.match(verdict(stage({ moodOverride: 'happy', moodUntil: 41.2 }), 'awake').why, /a passing feeling on show \(happy\)/);
assert.equal(verdict(stage({ moodOverride: 'happy', moodUntil: 39 }), 'awake').ok, true, 'a feeling past its time is over');
// the line typing, a prop still coming in
assert.match(verdict(stage({ typing: true }), 'awake').why, /line still typing/);
assert.match(verdict(stage({ props: new Map([['a', { state: 'in', settled: false }], ['b', { state: 'out', settled: true }]]) }), 'awake').why, /2 prop\(s\) not in and settled/);
// no stage at all: could not judge
assert.equal(read(null), null);
assert.match(m.restVerdict(null, 'awake').why, /no stage to read/);
console.log('onb-rest-pose: 18 cases pass');
