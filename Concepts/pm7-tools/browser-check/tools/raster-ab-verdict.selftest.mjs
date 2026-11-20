// F12E-SB-AB-RASTER-NOISE: the gap-aware paired A/B verdict. Fixtures are measured values of the RN runs on the Mac
// (Apple M3, pages served from the 1070ti) and the 1070ti; run folders are named in RN-REPORT.md
// (2026-11-11-pm7-performance share). The old strict rule must false-fail real main-against-main data (red); the
// gap-aware paired rule must pass resolved main-against-main pairs and fail injected-delay pairs (green/bite fixtures
// from the new-check proof runs are appended below once those runs land).
import test from 'node:test';
import assert from 'node:assert/strict';
import {rasterAbVerdict, rasterAbStrict, captureResolution, edgeResolution, shrinkResolution, RASTER_AB_TOL_MS, RASTER_AB_BITE_MS} from '../helpers/raster-ab-verdict.mjs';

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
	const base = pairsOf(PROOF.head, PROOF.control);
	for (const k of Object.keys(RASTER_AB_BITE_MS)) {
		const shifted = {[k]: base[k].map(p => ({diff: p.diff + RASTER_AB_BITE_MS[k], resolved: true}))};
		assert.equal(rasterAbVerdict(shifted, {minResolved: 1})[k].ok, false, `${k}: +${RASTER_AB_BITE_MS[k]} ms must fail`);
	}
	// six resolved pairs of real baseline noise, shifted by the bite threshold, still fail
	const noise = pairsOf(BASELINE.opaque.head, BASELINE.opaque.control);
	for (const k of Object.keys(RASTER_AB_BITE_MS)) {
		const shifted = {[k]: noise[k].map(p => ({diff: p.diff + RASTER_AB_BITE_MS[k], resolved: true}))};
		assert.equal(rasterAbVerdict(shifted, {minResolved: 6})[k].ok, false, `${k}: bite over baseline noise`);
	}
});