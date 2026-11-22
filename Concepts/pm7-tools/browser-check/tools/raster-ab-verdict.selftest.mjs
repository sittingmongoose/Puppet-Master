// F12E-SB-AB-RASTER-NOISE: the gap-aware paired A/B verdict. Fixtures are measured values of the RN runs on the Mac
// (Apple M3, pages served from the 1070ti) and the 1070ti; run folders are named in RN-REPORT.md
// (2026-11-11-pm7-performance share). The old strict rule must false-fail real main-against-main data (red); the
// gap-aware paired rule must pass resolved main-against-main pairs and fail injected-delay pairs (green/bite fixtures
// from the new-check proof runs are appended below once those runs land).
import test from 'node:test';
import assert from 'node:assert/strict';
import {rasterAbVerdict, rasterAbStrict, captureResolution, edgeResolution, shrinkResolution, median, r1, iqr, RASTER_AB_TOL_MS, RASTER_AB_BITE_MS, RASTER_AB_RETAINED_IQR_MAX_MS} from '../helpers/raster-ab-verdict.mjs';

const pairsOf = (head, control) => Object.fromEntries(Object.keys(head).map(k => [k, head[k].map((v, i) => ({diff: v - control[k][i], resolved: true}))]));

// run-macproof: old check, reps=1, opaque, main vs main, alone. The old strict rule false-fails retainedMs:
// head 66.7 ms vs control 0 ms — the parent/child clip race flipped between two shrinks of the same page.
const PROOF = {
	head: {firstNewMs: [130.9], settledMs: [130.9], retainedMs: [66.7]},
	control: {firstNewMs: [147.0], settledMs: [147.0], retainedMs: [0]}
};

// run-baseline: old check, reps=6, both surfaces, main vs main, alone on the Mac. 1071 s, 76 checks, 3 false FAILs.
// Per-shrink firstNewMs spans 44.3-407.4 ms (normal) on identical pages. Values in run order.
const BASELINE = {
	normal: {
		head: {firstNewMs: [116.4, 407.4, 97.6, 186.7, 191.9, 126.8], settledMs: [149.8, 407.4, 131.0, 186.7, 191.9, 126.8]},
		control: {firstNewMs: [44.3, 126.4, 207.1, 55.4, 56.9, 160.9], settledMs: [211.0, 143.1, 207.1, 172.0, 190.2, 160.9]}
	},
	opaque: {
		head: {firstNewMs: [131.9, 211.9, 114.1, 406.8, 163.7, 260.8], settledMs: [131.9, 211.9, 114.1, 406.8, 163.7, 260.8], retainedMs: [0, 0, 16.7, 0, 0, 0]},
		control: {firstNewMs: [197.4, 109.0, 111.0, 424.0, 153.0, 360.3], settledMs: [197.4, 109.0, 111.0, 424.0, 153.0, 360.3], retainedMs: [0, 50.0, 50.0, 366.7, 0, 0]}
	}
};

test('red: the old strict rule false-fails real main-against-main data', () => {
	assert.equal(rasterAbStrict(PROOF.head.retainedMs, PROOF.control.retainedMs).ok, false, 'retainedMs head 66.7 > control 0 on identical pages');
	const base = surf => Object.fromEntries(Object.keys(BASELINE[surf].head).map(k => [k, rasterAbStrict(BASELINE[surf].head[k], BASELINE[surf].control[k])]));
	assert.equal(base('normal').firstNewMs.ok, false, 'normal firstNewMs head median 156.8 > control 91.7');
	assert.equal(base('opaque').firstNewMs.ok, false, 'opaque firstNewMs head median 187.8 > control 175.2');
	assert.equal(base('opaque').settledMs.ok, false, 'opaque settledMs head median 187.8 > control 175.2');
});

// Real screencast samples of run-red-4 normal head-1 (old check, no marker): a frame at 11.8 ms then NOTHING until
// 895.1 ms — an 883.3 ms delivery gap. firstNewMs 895.1 is therefore unresolved. Later frames flow at ~16.7 ms.
const GAP_SAMPLES = [
	{ms: -21.6, kind: 'old'}, {ms: -4.9, kind: 'old'}, {ms: 11.8, kind: 'old'}, {ms: 895.1, kind: 'final'},
	{ms: 911.7, kind: 'final'}, {ms: 928.4, kind: 'final'}, {ms: 945.1, kind: 'final'}, {ms: 961.7, kind: 'final'},
	{ms: 1045.1, kind: 'final'}, {ms: 1061.7, kind: 'final'}, {ms: 1078.4, kind: 'final'}, {ms: 1095.1, kind: 'final'}
];
// A regular capture: frames every ~16.7 ms across the resize, first new frame at 33.3 ms bounded by an old frame.
const REGULAR_SAMPLES = [
	{ms: -33.4, kind: 'old'}, {ms: -16.7, kind: 'old'}, {ms: 0, kind: 'old'}, {ms: 16.7, kind: 'old'},
	{ms: 33.3, kind: 'intermediate'}, {ms: 50, kind: 'final'}, {ms: 66.7, kind: 'final'}, {ms: 83.3, kind: 'final'}
];

test('resolution: a regular capture resolves its edges, a delivery gap does not', () => {
	const reg = captureResolution(REGULAR_SAMPLES);
	assert.ok(reg.medianIntervalMs >= 16 && reg.medianIntervalMs <= 17, 'median frame interval ~16.7 ms');
	assert.equal(reg.RMs, 50, 'R = min(3 x 16.7, 50) = 50 ms cap');
	assert.equal(edgeResolution(REGULAR_SAMPLES, 33.3, reg.RMs).resolved, true, 'firstNew bounded by the old frame 16.7 ms before');
	assert.equal(edgeResolution(REGULAR_SAMPLES, 50, reg.RMs).resolved, true, 'settled edge bounded');
	const gap = captureResolution(GAP_SAMPLES);
	const e = edgeResolution(GAP_SAMPLES, 895.1, gap.RMs);
	assert.equal(e.gapMs, 883.3, 'the gap ending at firstNew is 895.1 - 11.8');
	assert.equal(e.resolved, false, '883.3 ms > R, so firstNewMs 895.1 is unresolved');
});

test('resolution: an edge with no preceding frame is unresolved, never a free pass', () => {
	// run-baseline opaque head-1: the first captured frame is already the new cover at 131.9 ms; no old frame bounds it.
	const firstOnly = [{ms: 131.9, kind: 'final'}, {ms: 148.6, kind: 'final'}, {ms: 165.2, kind: 'final'}];
	const {RMs} = captureResolution(firstOnly);
	assert.equal(edgeResolution(firstOnly, 131.9, RMs).resolved, false);
	assert.equal(edgeResolution(firstOnly, null, RMs).resolved, false, 'an unmeasured edge is unresolved');
});

test('shrinkResolution: retainedMs needs both its edges resolved', () => {
	const r = {samples: REGULAR_SAMPLES, firstNewMs: 33.3, firstClipMs: 16.7, settledMs: 50};
	const res = shrinkResolution(r, ['firstNewMs', 'settledMs', 'retainedMs']);
	assert.equal(res.firstNewMs.resolved, true);
	assert.equal(res.retainedMs.resolved, true, 'firstClip 16.7 and firstNew 33.3 both bounded');
	const bad = shrinkResolution({error: 'no contrast'}, ['firstNewMs']);
	assert.equal(bad.firstNewMs.resolved, false, 'a failed classification is unresolved');
});

test('verdict: resolved main-against-main pairs within tolerance pass', () => {
	const pairs = {firstNewMs: [3.2, -8.1, 12.4, -2.2, 6.7, -4.9].map(d => ({diff: d, resolved: true})),
		settledMs: [15, -22, 31, -9, 12, -18].map(d => ({diff: d, resolved: true}))};
	const v = rasterAbVerdict(pairs, {minResolved: 6});
	assert.equal(v.firstNewMs.ok, true);
	assert.equal(v.firstNewMs.nResolved, 6);
	assert.equal(v.settledMs.ok, true);
});

test('verdict: fewer than minResolved resolved pairs is a failing could-not-judge row, never a silent pass', () => {
	const pairs = {firstNewMs: [{diff: 1, resolved: true}, {diff: 2, resolved: true}, {diff: 999, resolved: false}, {diff: 999, resolved: false}, {diff: 999, resolved: false}, {diff: 999, resolved: false}]};
	const v = rasterAbVerdict(pairs, {minResolved: 6}).firstNewMs;
	assert.equal(v.ok, false);
	assert.equal(v.couldNotJudge, true);
	assert.equal(v.nResolved, 2);
	assert.match(v.rule, /could not judge: capture gaps, 2 of 6 pairs resolved \(need 6\)/);
	// the unresolved 999 ms diffs must not enter the median
	assert.deepEqual(v.diffs, [1, 2]);
});

test('verdict: an unresolved pair is dropped even when its diff is huge', () => {
	const pairs = {firstNewMs: [5, 5, 5, 5, 5, 800].map((d, i) => ({diff: d, resolved: i < 5}))};
	const v = rasterAbVerdict(pairs, {minResolved: 5}).firstNewMs;
	assert.equal(v.nResolved, 5);
	assert.equal(v.medianDiffMs, 5);
	assert.equal(v.ok, true, 'the 800 ms unresolved outlier does not move the resolved median');
});

test('tolerances are stated in ms and capped below the bite thresholds', () => {
	for (const k of Object.keys(RASTER_AB_BITE_MS)) {
		assert.ok(Number.isFinite(RASTER_AB_TOL_MS[k]) && RASTER_AB_TOL_MS[k] > 0, k);
		assert.ok(RASTER_AB_TOL_MS[k] < RASTER_AB_BITE_MS[k], `${k}: tol ${RASTER_AB_TOL_MS[k]} must stay under ${RASTER_AB_BITE_MS[k]}`);
	}
});

test('bite: a sustained shift at the bite threshold fails on top of real resolved noise', () => {
	// a bite-threshold shift on top of real six-pair noise must fail (a single noisy pair can cancel part of the
	// shift, so the property is asserted on the resolved six-pair samples below, not on one pair)
	// six resolved pairs of real baseline noise, shifted by the bite threshold, still fail
	const noise = pairsOf(BASELINE.opaque.head, BASELINE.opaque.control);
	for (const k of Object.keys(RASTER_AB_BITE_MS)) {
		const shifted = {[k]: noise[k].map(p => ({diff: p.diff + RASTER_AB_BITE_MS[k], resolved: true}))};
		assert.equal(rasterAbVerdict(shifted, {minResolved: 6})[k].ok, false, `${k}: bite over baseline noise`);
	}
});

// run-baseline-mac: NEW check, reps=6, both surfaces, main vs main, alone on the Mac with a LOCAL client and file://
// pages (76 checks PASS, 448 s). The vsync marker + free client give regular ~16.7 ms frames; 6/6 pairs resolved per
// measure. These are the resolved paired differences (head - control), sorted. Classification unchanged from the old
// baseline (normal firstNewKind intermediate, opaque final), so the marker measures the same painting.
const GREEN_MAC = {
	normal: {firstNewMs: [-16.2, -6.5, -3.1, -2.3, 2.3, 6.2], settledMs: [-35.6, -23.1, -16.2, 2.3, 6.2, 13.6]},
	opaque: {firstNewMs: [-16.9, -14.9, -14.5, -8.2, -0.7, 27.5], settledMs: [-16.9, -14.9, -14.5, -8.2, -0.7, 27.5], retainedMs: [-33.3, -16.7, -16.7, -16.7, 0, 33.3]}
};
const greenPairs = surf => Object.fromEntries(Object.keys(GREEN_MAC[surf]).map(k => [k, GREEN_MAC[surf][k].map(d => ({diff: d, resolved: true}))]));

test('green: real resolved main-against-main pairs pass on both surfaces', () => {
	for (const surf of ['normal', 'opaque']) {
		const v = rasterAbVerdict(greenPairs(surf), {minResolved: 6});
		for (const k of Object.keys(v)) {
			assert.equal(v[k].nResolved, 6, `${surf} ${k}`);
			assert.equal(v[k].ok, true, `${surf} ${k}: resolved paired median ${v[k].medianDiffMs} within tol`);
		}
	}
});

test('bite: the bite-threshold shift fails on top of the real resolved green noise', () => {
	for (const surf of ['normal', 'opaque']) {
		const g = greenPairs(surf);
		for (const k of Object.keys(g)) {
			const shifted = {[k]: g[k].map(p => ({diff: p.diff + RASTER_AB_BITE_MS[k], resolved: true}))};
			assert.equal(rasterAbVerdict(shifted, {minResolved: 6})[k].ok, false, `${surf} ${k}: +${RASTER_AB_BITE_MS[k]} ms over green noise must fail`);
		}
	}
});

const reverseVerdictOf = diffs => rasterAbVerdict({firstNewMs: diffs.map(diff => ({diff, resolved: true}))}).firstNewMs;

test('reverse gate: more than one eighth of the resolved pairs below -60 withholds, one in a large sample does not', () => {
	const verdictOf = reverseVerdictOf;
	// 1 of 6: the loaded run-green3-r2-2 opaque row (median 43.2) stays refused
	const oneOfSix = verdictOf([-69.5, 0.2, 18.6, 67.8, 85.9, 135.3]);
	assert.equal(oneOfSix.couldNotJudge, true);
	assert.match(oneOfSix.rule, /1 of 6 resolved pairs below -60/);
	// 1 of 8: run-greenC-r1-2 opaque firstNewMs (TIMING_RECORDS below) shifted +50 ms, in run order
	// (median 43.7, IQR 97.0, min -150.1), is judged, not withheld
	const oneOfEight = verdictOf([185, -27.5, 35.9, -16.1, -150.1, 75.1, 51.5, 86.9]);
	assert.equal(oneOfEight.couldNotJudge, false);
	assert.equal(oneOfEight.ok, false);
	// 1 of 12 is 8.3%, 2 of 12 is 16.7%
	const twelve = two => [-70, ...(two ? [-70] : [41]), 41, 41, 41, 41, 41, 41, 41, 41, 41, 41];
	assert.equal(twelve(false).length, 12);
	assert.equal(twelve(true).length, 12);
	assert.equal(reverseVerdictOf(twelve(false)).couldNotJudge, false, 'one reverse pair in 12 is judged');
	assert.equal(reverseVerdictOf(twelve(true)).couldNotJudge, true, 'two reverse pairs in 12 refuse');
});

// RN-REPS12, 2026-11-22, Alexis PC (RTX 3080), local headless Chrome, file://, 2 concurrent, --set reps=12.
// Resolved paired differences (head - control) in run order. Folders C:\Users\lexxm\pm7-reps12\run-green-q1-1/-2.
// Every row passed at 30 ms unshifted. Shifted +50 ms, b6026c4b94's minimum gate withheld 2 of the 8 timing rows:
// q1-2 normal firstNewMs (one reverse pair in 12, -210.5 ms) and q1-2 normal settledMs (one in 16, -66.8 ms).
// The fraction gate judges both and both rows fail.
const REPS12_GREEN = {
	'q1-1 normal firstNewMs': [-7.7, -21.7, -0.1, 13.6, 21.7, 157.4, -5, 0.5, -3.1, -3.8, -0.2, 25.1],
	'q1-1 normal settledMs': [11.2, -13.4, 15, 12.9, 8, -7.6, -103.3, 27.5, -22.1, 6.8, -23, -22.1, -57.6, -3.2, 27.4],
	'q1-1 opaque firstNewMs': [0, -27.9, 52.8, -93.9, -64.9, -31.7, 18, -2.7, 55.7, -13.3, -14.5, 4.5, 2.3, -5.9, 11.9, 37, 36.8],
	'q1-2 normal firstNewMs': [-260.5, -20.6, 14.6, -25.6, 27.6, -1, -28.9, -24.9, -0.3, 3.9, -13.2, -14.1],
	'q1-2 normal settledMs': [-44.3, -31.5, -4, 1.8, -16.5, 31.9, -12.5, -116.8, -76.9, -4.2, 27.1, 13.9, -15.3, -36.7, -20.8, -5],
	'q1-2 opaque firstNewMs': [33.2, -31.6, 13.3, -1.4, 35.7, 9.7, -18.3, -18.9, -4.2, 15.8, 30.6, -16.4, -14.1, -4.5]
};
const reps12Pairs = diffs => ({firstNewMs: diffs.map(diff => ({diff, resolved: true}))});

test('reps12: real green timing rows pass and one reverse pair in 12 does not withhold a +50 fault', () => {
	for (const [label, diffs] of Object.entries(REPS12_GREEN)) {
		const green = rasterAbVerdict(reps12Pairs(diffs), {minResolved: 12}).firstNewMs;
		assert.equal(green.ok, true, label + ': green must pass');
		const shifted = rasterAbVerdict(reps12Pairs(diffs.map(diff => r1(diff + RASTER_AB_BITE_MS.firstNewMs))), {minResolved: 12}).firstNewMs;
		assert.equal(shifted.ok, false, label + ': a +50 ms fault must fail');
		assert.equal(shifted.couldNotJudge, false, label + ': one reverse pair in 12 must not withhold the fault');
	}
});

// RN-REPS12 bite round 1, delay50 vs main, same conditions. normal firstNew is not moved by the 50 ms resize
// busy-wait and passes; normal settled and opaque firstNew/settled are moved. q1-1 normal settled is the row the
// one-outlier minimum withheld as "reverse pair -65.7 ms below -60" (1 of 16); the fraction gate judges it and it
// fails on the median, so a real fault is not hidden. Folders C:\Users\lexxm\pm7-reps12\run-bite-q1-1/-2.
const REPS12_BITE = {
	'q1-1 normal settledMs': [-65.7, 82.5, 43.5, 42.1, 38.8, 57.9, 68.5, 10.7, 48.4, 24.6, 64, 29.7, 43.5, -13.6, 39.1, 69.6],
	'q1-1 opaque firstNewMs': [70.2, 84.3, 67.5, 87.2, 101.2, 139.1, 32.7, 105.7, 80.5, 44.9, 50, 115.6, -0.8],
	'q1-2 normal settledMs': [-1.8, 58.7, 42.1, 41.6, 72.2, 76, 27.7, 3, 27.3, 47.4, 11.2, 30.6],
	'q1-2 opaque firstNewMs': [48.8, 51.6, -57.3, -55.7, 6.7, 73.9, 96.7, 72.2, 113.6, 95.7, 2.5, 69.5, 47.2, 14.4, 157]
};
const REPS12_BITE_UNMOVED = {
	'q1-1 normal firstNewMs': [-24.6, 0, -8.7, -2.2, -3.9, -3.8, 4.8, 10, 23.2, -7.6, 8.2, -14.3],
	'q1-2 normal firstNewMs': [23.6, -3.3, 4.2, 23.9, -10.4, 13, 6.1, 15.9, 8.5, 3.1, -24.6, -3.1]
};
const REPS12_BITE_RETAINED = {
	'q1-1 opaque retainedMs': [88.9, 76.6, 67.7, 93.3, 144.6, 33.9, 105.8, 85.4, 40.9, 28.3, 84.7, 2.5],
	'q1-2 opaque retainedMs': [64.1, 56.5, -60.3, -24.6, 7.3, 71.6, 97.8, 83.4, 92, 68.5, 48.5, 178.1]
};

test('reps12: real delay50 rows fail their moved measures numerically, and normal firstNew still passes', () => {
	for (const [label, diffs] of Object.entries(REPS12_BITE)) {
		const v = rasterAbVerdict(reps12Pairs(diffs), {minResolved: 12}).firstNewMs;
		assert.equal(v.ok, false, label + ': moved measure must fail');
		assert.equal(v.couldNotJudge, false, label + ': the real fault must not be withheld');
	}
	for (const [label, diffs] of Object.entries(REPS12_BITE_UNMOVED)) {
		const v = rasterAbVerdict(reps12Pairs(diffs), {minResolved: 12}).firstNewMs;
		assert.equal(v.ok, true, label + ': delay50 did not move this measure');
	}
	for (const [label, diffs] of Object.entries(REPS12_BITE_RETAINED)) {
		const v = rasterAbVerdict({retainedMs: diffs.map(diff => ({diff, resolved: true}))}, {minResolved: 12}).retainedMs;
		assert.equal(v.ok, false, label + ': moved retained must fail');
		assert.match(v.rule, /clip-race noise/, label + ': retained fails through the clip-race gate');
	}
});

// retainedMs IQR gate (lead 1120233156-26c3): judged only when the clip race is quiet. Real records:
// quiet = run-baseline-mac alone (IQR 12.5 <= 25, median -16.7 -> PASS); noisy = run-green3-r1-1 opaque under 3-way
// load (IQR 45.8 > 25 -> could-not-judge clip-race noise, never a numeric false fail even though median 33.4 > 25).
const QUIET_RETAINED = [-33.3, -16.7, -16.7, -16.7, 0, 33.3];
const NOISY_RETAINED = [-150.0, 16.7, 16.7, 50.0, 66.7, 133.3];
const retPairs = a => ({retainedMs: a.map(d => ({diff: d, resolved: true}))});

test('retained: a quiet real record is judged on the median and passes', () => {
	const v = rasterAbVerdict(retPairs(QUIET_RETAINED), {minResolved: 6}).retainedMs;
	assert.equal(v.iqrMs, 12.5);
	assert.equal(v.couldNotJudge, false);
	assert.equal(v.ok, true);
	assert.equal(v.medianDiffMs, -16.7);
});

test('retained: a noisy real record is could-not-judge clip-race noise, never a numeric false fail', () => {
	const v = rasterAbVerdict(retPairs(NOISY_RETAINED), {minResolved: 6}).retainedMs;
	assert.equal(v.iqrMs, 45.8);
	assert.equal(v.couldNotJudge, true);
	assert.equal(v.ok, false);
	assert.match(v.rule, /could not judge: clip-race noise, IQR 45\.8 ms over 25 \(6 of 6 resolved\)/);
	assert.equal(v.medianDiffMs, 33.4, 'the median is reported but not judged as a numeric fail');
});

test('retained: the IQR bound is set from the alone baseline and never above 50', () => {
	assert.ok(RASTER_AB_RETAINED_IQR_MAX_MS <= 50);
	assert.equal(RASTER_AB_RETAINED_IQR_MAX_MS, 25, '2 x the alone baseline IQR 12.5');
	assert.equal(iqr(QUIET_RETAINED), 12.5);
	// a noisy record whose median is within tolerance is still could-not-judge (the race, not the median, blocks it)
	const noisyButSmallMedian = [-50, -20, 0, 20, 40, 60];
	const v = rasterAbVerdict(retPairs(noisyButSmallMedian), {minResolved: 6}).retainedMs;
	assert.equal(v.medianDiffMs, 10);
	assert.equal(v.iqrMs, 50);
	assert.equal(v.couldNotJudge, true);
});

// Real bite records: run-bite50C-1/-2 opaque (delay50 vs main, 3 concurrent, clean Mac). The 50 ms child-side
// busy-wait shifts firstNewMs by a resolved median of 61.9 / 70.2 ms — far past the tolerance — while retainedMs
// reads could-not-judge (clip-race IQR 104.1 / 70.8 > 25). Both are failing bite rows.
const BITE50C_1_FIRSTNEW = [-48.4, 2.9, 12.3, 29.2, 61.9, 92.8, 122.5, 129, 185.4];
const BITE50C_2_FIRSTNEW = [13.8, 19.4, 37.5, 70.2, 83, 85.3, 113.3];
const BITE50C_1_RETAINED = [0, 16.7, 50, 116.7, 133.3, 183.3];

test('bite: real delay50 records fail firstNewMs and retained reads could-not-judge', () => {
	const fn1 = rasterAbVerdict({firstNewMs: BITE50C_1_FIRSTNEW.map(d => ({diff: d, resolved: true}))}, {minResolved: 6}).firstNewMs;
	assert.equal(fn1.medianDiffMs, 61.9);
	assert.equal(fn1.ok, false, 'delay50 shifts firstNew past the tolerance');
	const fn2 = rasterAbVerdict({firstNewMs: BITE50C_2_FIRSTNEW.map(d => ({diff: d, resolved: true}))}, {minResolved: 6}).firstNewMs;
	assert.equal(fn2.medianDiffMs, 70.2);
	assert.equal(fn2.ok, false);
	const ret = rasterAbVerdict(retPairs(BITE50C_1_RETAINED), {minResolved: 6}).retainedMs;
	assert.equal(ret.couldNotJudge, true);
	assert.equal(ret.ok, false, 'retained bite fails as could-not-judge clip-race noise');
	assert.match(ret.rule, /clip-race noise, IQR 104\.1 ms over 25/);
});

// bite50C-3 opaque firstNewMs: the 50 ms delay's resolved median shift is only 34.8 ms (frame quantization + noise).
// At the old 35 ms tolerance this PASSED (a false pass of the real fault); the lead ruled 30 ms so it fails
// (1121031239-e11a). Every clean green still passes at 30 (max median 25.8). This record pins that ruling.
const BITE50C_3_FIRSTNEW = [2.9, 9.2, 29.9, 39.6, 67, 105];
test('bite: the 34.8 ms delay50 shift fails at the ruled 30 ms tolerance (passed at 35)', () => {
	const pairs = {firstNewMs: BITE50C_3_FIRSTNEW.map(d => ({diff: d, resolved: true}))};
	const v30 = rasterAbVerdict(pairs, {minResolved: 6}).firstNewMs;
	assert.equal(v30.medianDiffMs, 34.8);
	assert.equal(v30.ok, false, '34.8 > 30: the real 50 ms fault must not pass');
	const v35 = rasterAbVerdict(pairs, {tolMs: {firstNewMs: 35}, minResolved: 6}).firstNewMs;
	assert.equal(v35.ok, true, 'at 35 it passed — the false pass the 30 ms ruling fixes');
	assert.equal(RASTER_AB_TOL_MS.firstNewMs, 30);
	assert.equal(RASTER_AB_TOL_MS.settledMs, 30);
});

// RN-SPREAD calibration, archived run.log summaries under pm7-tib-20261121 (paths and hashes in RN-SPREAD-REPORT.md).
// Each measure carries its expected decision, recorded resolved differences, and attempted count when it differs.
// Opaque firstNew and settled share the same frame. The 1070ti red records predate resolution logging, so their six
// diffs are replayed unfiltered as a stress case.
const TIMING_RECORDS = [
	["run-baseline-mac", "normal", ["pass", [-16.2, -3.1, -2.3, 6.2, 2.3, -6.5]], ["pass", [-16.2, 13.6, -35.6, 6.2, 2.3, -23.1]]],
	["run-baseline-mac", "opaque", ["pass", [27.5, -14.9, -8.2, -0.7, -14.5, -16.9]]],
	["run-greenC-r1-1", "normal", ["pass", [22.2, -89.4, -4.6, 63.5, 14.9, -0.8, 11.6], 8], ["pass", [-44.5, 10.6, -4.5, 14.9, 32.5, -5.1], 8]],
	["run-greenC-r1-1", "opaque", ["pass", [-26.7, 1.9, -22.2, -31.1, -91.9, -60.6, 110.1], 12]],
	["run-greenC-r1-2", "normal", ["pass", [-2.3, -35.2, 35, -180.6, -29.4, 74.6], 11], ["pass", [65.1, -18.9, 7.9, -35.2, 12.6, -29.4, -25.4], 11]],
	["run-greenC-r1-2", "opaque", ["pass", [135, -77.5, -14.1, -66.1, -200.1, 25.1, 1.5, 36.9], 11]],
	["run-greenC-r1-3", "normal", ["pass", [-22.7, 17.1, -7.4, -13.4, 36.3, -11.3, 81.8, -24.9], 10], ["pass", [50.4, -24, -13.4, 19.6, 181.8, -8.2], 10]],
	["run-greenC-r1-3", "opaque", ["pass", [67.5, 53, -139, 53.5, -15.6, -1.5], 12]],
	["run-greenC-r2-1", "normal", ["pass", [16.7, -31.8, -34.1, 18.2, -14.2, -2.5], 11], ["pass", [426.5, -33.3, -48.5, -17.4, 34.9, 35.8], 11]],
	["run-greenC-r2-1", "opaque", ["pass", [53.2, 36.8, 8.8, -18.6, -117, -48.5]]],
	["run-greenC-r2-2", "normal", ["pass", [-53.6, -18, 37.2, 8.9, -16.5, 35.7, -0.1, -0.5], 10], ["pass", [20.5, -44.3, 8.9, 19.1, 16.5, -0.5], 10]],
	["run-greenC-r2-2", "opaque", ["gaps", [-19.9, 14.1, 3.2, 17.1, -14.8], 12]],
	["run-greenC-r2-3", "normal", ["pass", [8.1, -20, 16.6, -0.7, -2.1, -13.1, 0.5], 10], ["pass", [8.1, 13.4, -0.1, -2.1, 3.6, 0.5], 10]],
	["run-greenC-r2-3", "opaque", ["pass", [-1.2, 3.2, -7.2, 75.2, -8.7, 5], 9]],
	["run-bite50-1", "normal", ["pass", [263, 9.4, 27.2, -15.3, -13.3, -35.9]], ["fail", [79.6, 76.1, 60.5, 18, 86.7, 30.7]]],
	["run-bite50-1", "opaque", ["fail", [70.8, 81.8, 73.9, 9.1, 22, 41.5, 83.2, 58, 66.6], 11]],
	["run-bite50-2", "normal", ["pass", [36.4, -29.8, -54.9, 26.5, -7.1, 31.7], 9], ["fail", [119.7, 41.4, 86.9, 11.8, 9.5, 81.7], 9]],
	["run-bite50-2", "opaque", ["fail", [44.7, -8, 48.5, 76.3, 25.9, 166.8], 7]],
	["run-bite50-3", "normal", ["pass", [-12.7, 19.1, -6.3, 10.6, -138.7, -1.8, 20.4, 17.6, 122.9]], ["fail", [103.9, 28, 64.9, 53.7, 67.6, 22.9], 9]],
	["run-bite50-3", "opaque", ["fail", [66.3, 42, 125.2, 96.7, 64.4, 73.4, -11.1], 12]],
	["run-bite50-4", "normal", ["pass", [-46.2, 53.2, -32, -8.9, 11.2, -8.2], 8], ["fail", [37.1, 136.6, 18, 74.4, 44.5, 41.8], 8]],
	["run-bite50-4", "opaque", ["fail", [101.3, 2.6, 65.7, 60.9, 22.9, 64.9, 68.6, -41.8], 12]],
	["run-bite50C-1", "normal", ["pass", [33.1, -40.5, 15.1, 2.7, -14.5, -5.6], 12], ["gaps", [133.1, 59.5, 19.4, 35.5, 44.4], 12]],
	["run-bite50C-1", "opaque", ["fail", [92.8, 2.9, 29.2, 129, 61.9, -48.4, 122.5, 12.3, 185.4], 10]],
	["run-bite50C-2", "normal", ["pass", [129.9, 10.3, -48.7, 15.9, -47.8, -3.2], 12], ["fail", [29.9, 43.6, 208.8, -15.4, 140.1, -47.8], 12]],
	["run-bite50C-2", "opaque", ["fail", [13.8, 70.2, 85.3, 113.3, 83, 37.5, 19.4]]],
	["run-bite50C-3", "normal", ["gaps", [-44.3, -12.3, -5.3, 191.6], 12], ["gaps", [-10.9, -8.5, 52.7, -93.3, 116.2], 12]],
	["run-bite50C-3", "opaque", ["fail", [29.9, 2.9, 67, 105, 39.6, 9.2], 8]],
	["run-alone-1", "normal", ["iqr", [32.3, 10.1, -321.4, 36.2, 3.1, -274.1], 7], ["reverse", [32.3, -6.6, 11.9, 186.2, 36.4, -233.6, 125.9]]],
	["run-alone-1", "opaque", ["iqr", [-47.1, -116, 71.8, 123.8, 135.5, 57.5]]],
	["run-alone-2", "normal", ["pass", [43.3, 272.8, 1, 3.6, 34.8, -16.8]], ["pass", [26.7, -27.2, -15.7, 3.6, 151.5, -33.5]]],
	["run-alone-2", "opaque", ["iqr", [-110.3, -213.2, -186.8, 165.6, 108, -22.4, -95.1]]],
	["run-green3-r2-2", "normal", ["pass", [16.2, 12.6, -29.2, -66.9, -7.6, -18.8], 8], ["reverse", [199.6, 112.6, -12.6, -86.6, 75.7, -18.8], 8]],
	["run-green3-r2-2", "opaque", ["reverse", [85.9, 0.2, 18.6, 135.3, -69.5, 67.8]]],
	["run-red-1", "normal", ["iqr", [-217.4, -188.9, -110.5, -70.5, -27.7, -23.8]], ["iqr", [-443.8, -370.6, -5.6, 142.9, 155.6, 265.9]]],
	["run-red-1", "opaque", ["iqr", [-166.8, -69.5, -38.9, 106.4, 116.4, 162.8]]],
	["run-red-2", "normal", ["iqr", [-89, -79.8, -5.9, 75.2, 125.8, 143]], ["pass", [-272.5, -89, -40.3, 8.5, 36.8, 109.1]]],
	["run-red-2", "opaque", ["pass", [-259.6, -114.1, -50.1, -38.7, -1.2, 26.1]]],
	["run-red-3", "normal", ["pass", [-158.3, -62.7, -26.7, 13.9, 56.2, 92]], ["iqr", [-229.3, -158.3, -26.7, 56.2, 63.9, 108.7]]],
	["run-red-3", "opaque", ["pass", [-190.1, -12.9, 3.5, 8, 24.1, 63.7]]],
	["run-red-4", "normal", ["iqr", [-707.1, -240.8, -204.6, -139.4, -78.3, 818.6]], ["iqr", [-457.1, -187.9, -157.5, -44.9, 77.2, 618.7]]],
	["run-red-4", "opaque", ["iqr", [-383.9, -349.3, -123.7, -16.8, 7.5, 105.8]]],
];

const resolvedPairs = (diffs, total = diffs.length) => [
	...diffs.map(diff => ({diff, resolved: true})),
	...Array.from({length: total - diffs.length}, () => ({diff: null, resolved: false}))
];

test('timing gate: preserve archived green and bite verdicts and withhold noisy identical-page failures', () => {
	const expectedRules = {
		pass: /^paired median/,
		fail: /^paired median/,
		gaps: /^could not judge: capture gaps/,
		iqr: /^could not judge: timing noise, IQR/,
		reverse: /^could not judge: timing noise, \d+ of \d+ resolved pairs below -60/
	};
	for (const [run, surface, firstNew, settled = firstNew] of TIMING_RECORDS) {
		for (const [key, [expected, diffs, total]] of Object.entries({firstNewMs: firstNew, settledMs: settled})) {
			const verdict = rasterAbVerdict({[key]: resolvedPairs(diffs, total)})[key];
			const label = run + ' ' + surface + ' ' + key;
			assert.match(verdict.rule, expectedRules[expected], label);
			assert.equal(verdict.ok, expected === 'pass', label);
			assert.equal(verdict.couldNotJudge, expected !== 'pass' && expected !== 'fail', label);
		}
	}
});

test('timing gate: numeric bounds are inclusive, and refusals identify the gate and pair count', () => {
	const iqrRecord = TIMING_RECORDS.find(([run, surface]) => run === 'run-alone-1' && surface === 'opaque');
	const reverseRecord = TIMING_RECORDS.find(([run, surface]) => run === 'run-green3-r2-2' && surface === 'opaque');
	const verdictOf = (diffs, total) => rasterAbVerdict({firstNewMs: resolvedPairs(diffs, total)}).firstNewMs;
	assert.equal(verdictOf(iqrRecord[2][1]).rule, 'could not judge: timing noise, IQR 131.8 ms over 125 (6 of 6 resolved)');
	assert.equal(verdictOf(reverseRecord[2][1]).rule, 'could not judge: timing noise, 1 of 6 resolved pairs below -60 ms (more than 1/8)');
	const boundary = verdictOf([-60, -60, 31, 31, 65, 65]);
	assert.equal(boundary.iqrMs, 93.8);
	assert.equal(boundary.couldNotJudge, false, '-60 ms is allowed');
	assert.equal(boundary.ok, false);
	const iqrBoundary = verdictOf([-65, -65, -65, 60, 60, 60]);
	assert.equal(iqrBoundary.iqrMs, 125);
	assert.equal(iqrBoundary.ok, true, 'IQR 125 is allowed and the reverse gate applies only to numeric failures');
	assert.equal(verdictOf([-66, -66, -66, 60, 60, 60]).couldNotJudge, true, 'IQR 126 withholds a pass');
	const ignoredReverse = {diff: -200, resolved: false};
	const failed = rasterAbVerdict({settledMs: [...resolvedPairs([31, 31, 31, 31, 31, 31]), ignoredReverse]}).settledMs;
	assert.equal(failed.couldNotJudge, false, 'unresolved reverse pairs do not withhold a failure');
	assert.equal(failed.ok, false);
});

// The verdict before RN-SPREAD. The old retained gate is part of the oracle.
function previousDecision(key, pairs, {minResolved = 6, tolMs = RASTER_AB_TOL_MS, retainedIqrMaxMs = 25} = {}) {
	const diffs = pairs.filter(pair => pair.resolved && pair.diff != null).map(pair => r1(pair.diff));
	const couldNotJudge = diffs.length < minResolved || (key === 'retainedMs' && iqr(diffs) > retainedIqrMaxMs);
	return {couldNotJudge, ok: !couldNotJudge && r1(median(diffs)) <= tolMs[key]};
}

function assertMonotonic(pairsByMeasure, label, options) {
	const verdicts = rasterAbVerdict(pairsByMeasure, options);
	for (const [key, pairs] of Object.entries(pairsByMeasure)) {
		const before = previousDecision(key, pairs, options);
		const after = verdicts[key];
		const detail = label + ' ' + key;
		if (after.couldNotJudge) assert.equal(after.ok, false, detail);
		else assert.deepEqual({couldNotJudge: after.couldNotJudge, ok: after.ok}, before, detail);
		if (after.ok) assert.equal(before.ok, true, detail);
	}
}

test('timing gate only withholds old verdicts on real records and 4096 seeded random sets', () => {
	for (const [run, surface, firstNew, settled = firstNew] of TIMING_RECORDS) {
		const [, firstDiffs, firstTotal] = firstNew;
		const [, settledDiffs, settledTotal] = settled;
		assertMonotonic({firstNewMs: resolvedPairs(firstDiffs, firstTotal), settledMs: resolvedPairs(settledDiffs, settledTotal)}, run + ' ' + surface);
	}
	assertMonotonic(pairsOf(PROOF.head, PROOF.control), 'run-macproof');
	for (const surface of ['normal', 'opaque']) {
		assertMonotonic(pairsOf(BASELINE[surface].head, BASELINE[surface].control), 'run-baseline ' + surface);
		assertMonotonic(greenPairs(surface), 'run-baseline-mac ' + surface);
	}
	assertMonotonic(retPairs(QUIET_RETAINED), 'quiet retained');
	assertMonotonic(retPairs(NOISY_RETAINED), 'noisy retained');
	assertMonotonic(retPairs(BITE50C_1_RETAINED), 'bite50C-1 retained');
	for (const [index, diffs] of [BITE50C_1_FIRSTNEW, BITE50C_2_FIRSTNEW, BITE50C_3_FIRSTNEW].entries()) {
		assertMonotonic({firstNewMs: resolvedPairs(diffs)}, 'bite50C-' + (index + 1));
	}
	for (const [label, diffs] of Object.entries({...REPS12_GREEN, ...REPS12_BITE})) {
		assertMonotonic({firstNewMs: resolvedPairs(diffs)}, 'reps12 ' + label, {minResolved: 12});
	}

	let seed = 0xd85be76d;
	const nextInt = limit => {
		seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
		return Math.floor(seed / 0x100000000 * limit);
	};
	const randomPairs = () => {
		const attempts = nextInt(15);
		const centre = nextInt(181) - 90;
		const amplitude = nextInt(241);
		return Array.from({length: attempts}, () => ({
			diff: nextInt(12) === 0 ? null : centre + (nextInt(2001) - 1000) * amplitude / 1000,
			resolved: nextInt(8) !== 0
		}));
	};
	for (let i = 0; i < 4096; i++) {
		const options = i % 2 === 0 ? undefined : {minResolved: nextInt(9) + 1};
		assertMonotonic({firstNewMs: randomPairs(), settledMs: randomPairs(), retainedMs: randomPairs()}, 'random set ' + i, options);
	}
});
