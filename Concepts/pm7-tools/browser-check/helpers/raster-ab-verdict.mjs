// SW-36 A/B verdict under load (F12E-SB-AB-RASTER-NOISE), lead decision 1120211013-9f5c.
//
// The old rule, head median <= control median with no tolerance, is a coin flip per measure when main is compared
// against itself on a busy machine. Two things made it unsound, and both are addressed here:
//
// 1. Capture gaps. firstNewMs / settledMs / retainedMs are read from screencast frames. When no frame is delivered
//    for a while (a busy client acking slowly, or an idle compositor) the first new-sized frame is captured late and
//    the sample is biased by up to hundreds of ms. The check now keeps a tiny compositor-only animation on the test
//    parent's ground so a frame exists every vsync; a remaining gap is delivery loss, not page timing. Each measure
//    edge carries its resolution (the frame interval ending at that edge); an edge whose gap exceeds R = min(3 x the
//    capture's median frame interval, 50 ms) is UNRESOLVED and its pair is not judged.
//
// 2. The judgement. Over the RESOLVED pairs of the balanced order (C H / H C, adjacent in time, same load) the median
//    of head - control must stay within a fixed millisecond tolerance. Pairing cancels load drift; the median survives
//    a single spiked pair; dropping unresolved pairs removes the capture-loss bias. The check keeps shrinking until
//    `minResolved` pairs are resolved or 2 x that many pairs were attempted (the 2 x run-time cap). Fewer than
//    minResolved resolved pairs is a FAILING "could not judge" row, never a silent pass.
//
// Tolerances are hard caps in ms, chosen from measured resolved-pair noise (RN-REPORT.md, 2026-11-11-pm7-performance
// share). They stay below the bite thresholds of 50 ms (firstNewMs / retainedMs) and 100 ms (settledMs).
// No run-time noise estimate widens them.
// Measured on the Mac (Apple M3, local client, file://), 3 concurrent runs as the load, uncontended (lead rulings
// 1120225932-bad7, 1121031239-e11a):
//   clean green max resolved paired median  firstNewMs/settledMs 25.8 ms, retainedMs 16.7 ms
//   clean bite minimum shifted median       firstNewMs/settledMs 34.8 ms (bite50C-3), retainedMs 41.7 ms
// so 30/30/25 ms sit between the green noise and the bite signal, inside the 50/50/100 ms caps: green margin 4.2 ms,
// bite margin 4.8 ms. The bar puts a false PASS of the real fault first — at 35 ms the 50 ms bite (bite50C-3, 34.8)
// passed, at 30 ms it fails and every clean green still passes. It is the gap-aware capture marker, NOT the tolerance,
// that protects frame resolution under load. Even when edges resolve, the timing-noise gates can withhold the
// median verdict. See RN-REPORT.md and RN-SPREAD-REPORT.md.
export const RASTER_AB_TOL_MS = Object.freeze({firstNewMs: 30, retainedMs: 25, settledMs: 30});
export const RASTER_AB_BITE_MS = Object.freeze({firstNewMs: 50, retainedMs: 50, settledMs: 100});
// resolution: an edge gap above R is unresolved. R = min(factor x median frame interval, capMs).
export const RASTER_AB_RES = Object.freeze({factor: 3, capMs: 50});
// retainedMs is judged only when the clip race is quiet: the IQR of the resolved paired differences must be <= this
// bound, else the row is a named "could not judge: clip-race noise" infrastructure failure (never a numeric false fail).
// Set from the alone baseline's resolved retained IQR (12.5 ms on the Mac local client); 2 x that = 25 ms, under the
// 50 ms ceiling (2 x the 25 ms tolerance). Lead ruling 1120233156-26c3. Under load the race stretches the IQR past
// this, so retained reads could-not-judge; the opaque firstNewMs row carries the child-side slowdown under load.
export const RASTER_AB_RETAINED_IQR_MAX_MS = 25;
// RN-GREEN and RN-SPREAD: archived delay failures need up to 120.1 ms IQR. Above the 30 ms median tolerance,
// the most negative resolved pair was -48.4 ms in a real bite and -69.5 ms or lower in the remaining false fails.
const RASTER_AB_TIMING_IQR_MAX_MS = 125;
const RASTER_AB_TIMING_REVERSE_MIN_MS = -60;
// RN-REPS12: one reverse pair decided a 6-pair verdict at the minimum's 0% breakdown point. Refuse a numeric timing
// failure only when MORE than this fraction of the resolved differences are below the reverse floor. One reverse pair
// in 6 or 7 (1/6, 1/7 > 1/8) still refuses the loaded false failures; one in 8 (12.5%, not > 1/8) is judged, as is one
// in the 12 pairs reps=12 resolves (8.3%). Two in 12 (16.7%) refuse. Fitted on the archived rows and the 2026-11-22
// Alexis reps=12 rows; PM7PERF-RASTER-REVERSE-PAIR-BREAKDOWN, R126, RN-REVPAIR, RN-REPS12.
const RASTER_AB_TIMING_REVERSE_FRACTION = 1 / 8;

export const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
export const r1 = v => v == null ? null : Math.round(v * 10) / 10;
// interquartile range (Q3 - Q1, linear interpolation) of a list of numbers; null when empty.
export const iqr = a => { const s = [...a].sort((x, y) => x - y); const n = s.length; if (!n) return null; const q = p => { const pos = (n - 1) * p, lo = Math.floor(pos), f = pos - lo; return lo + 1 < n ? s[lo] + f * (s[lo + 1] - s[lo]) : s[lo]; }; return r1(q(0.75) - q(0.25)); };

// The capture's frame cadence: median interval between consecutive screencast samples, and the resolution radius R.
// samples: [{ms}] in any order. Pure.
export function captureResolution(samples, {factor = RASTER_AB_RES.factor, capMs = RASTER_AB_RES.capMs} = {}) {
	const ms = (samples || []).map(s => s.ms).filter(v => v != null).sort((a, b) => a - b);
	const intervals = [];
	for (let i = 1; i < ms.length; i++) intervals.push(ms[i] - ms[i - 1]);
	const medInt = median(intervals);
	return {medianIntervalMs: r1(medInt), RMs: medInt == null ? capMs : r1(Math.min(factor * medInt, capMs))};
}

// The gap ending at a measure edge: the interval between the edge's frame and the frame before it. A large gap means
// the edge timestamp is only known to within that gap (a frame was produced but not delivered, or none was produced).
// edgeMs null (edge not measured) => gap null, unresolved. The edge is itself a sample; match it within rounding.
// An edge with no preceding captured frame (i === 0) has no old frame to bound it => unresolved, never a free pass.
export function edgeResolution(samples, edgeMs, RMs) {
	if (edgeMs == null || !samples || !samples.length) return {gapMs: null, resolved: false};
	const ms = samples.map(s => s.ms).filter(v => v != null).sort((a, b) => a - b);
	let i = -1, best = Infinity;
	for (let j = 0; j < ms.length; j++) { const d = Math.abs(ms[j] - edgeMs); if (d < best) { best = d; i = j; } }
	if (i < 0 || best > 0.5) return {gapMs: null, resolved: false};
	if (i === 0) return {gapMs: null, resolved: false};
	const gap = r1(ms[i] - ms[i - 1]);
	return {gapMs: gap, resolved: gap <= RMs};
}

// Resolution of one shrink's measure edges. r is classifyResize's result (samples + firstNewMs/settledMs/firstClipMs).
// retainedMs is resolved only when BOTH its edges (first clip and first new frame) are resolved.
export function shrinkResolution(r, measures) {
	const out = {};
	if (!r || r.error || !r.samples) { for (const k of measures) out[k] = {gapMs: null, resolved: false, RMs: null}; return out; }
	const {RMs} = captureResolution(r.samples);
	for (const k of measures) {
		if (k === 'retainedMs') {
			const fn = edgeResolution(r.samples, r.firstNewMs, RMs);
			const fc = edgeResolution(r.samples, r.firstClipMs, RMs);
			out[k] = {gapMs: fn.gapMs == null || fc.gapMs == null ? null : r1(Math.max(fn.gapMs, fc.gapMs)), resolved: fn.resolved && fc.resolved, RMs};
		} else {
			out[k] = {...edgeResolution(r.samples, r[k], RMs), RMs};
		}
	}
	return out;
}

// pairsByMeasure: {firstNewMs: [{diff, resolved}, ...], settledMs: [...], retainedMs?: [...]}. diff is head - control
// for one balanced-order pair (null when either side was not measured); resolved says both sides' edges were resolved.
// Returns one verdict per measure: {ok, rule, tolMs, medianDiffMs, iqrMs, diffs, nResolved, nTotal, couldNotJudge}.
// The median is judged only with enough resolved pairs and a bounded IQR. A numeric failure of firstNewMs or
// settledMs also requires reverse pairs below the bound to stay at or under an eighth of the resolved pairs; one
// outlier in a large enough sample does not withhold the verdict. Refusals are failing infrastructure rows.
export function rasterAbVerdict(pairsByMeasure, {tolMs = RASTER_AB_TOL_MS, minResolved = 6, retainedIqrMaxMs = RASTER_AB_RETAINED_IQR_MAX_MS} = {}) {
	const out = {};
	for (const [key, raw] of Object.entries(pairsByMeasure)) {
		const all = raw || [];
		const diffs = all.filter(p => p.resolved && p.diff != null).map(p => r1(p.diff));
		const nResolved = diffs.length, nTotal = all.length;
		const med = r1(median(diffs));
		const spread = iqr(diffs);
		const tol = tolMs[key];
		const withinTolerance = med <= tol;
		const timing = key === 'firstNewMs' || key === 'settledMs';
		const resolvedCount = `${nResolved} of ${nTotal} resolved`;
		let refusal;
		if (nResolved < minResolved) refusal = `capture gaps, ${nResolved} of ${nTotal} pairs resolved (need ${minResolved})`;
		else if (key === 'retainedMs' && spread != null && spread > retainedIqrMaxMs) refusal = `clip-race noise, IQR ${spread} ms over ${retainedIqrMaxMs} (${resolvedCount})`;
		else if (timing && spread > RASTER_AB_TIMING_IQR_MAX_MS) refusal = `timing noise, IQR ${spread} ms over ${RASTER_AB_TIMING_IQR_MAX_MS} (${resolvedCount})`;
		else if (timing && !withinTolerance) {
			const reverse = diffs.filter(diff => diff < RASTER_AB_TIMING_REVERSE_MIN_MS).length;
			if (reverse > nResolved * RASTER_AB_TIMING_REVERSE_FRACTION) {
				refusal = `timing noise, ${reverse} of ${nResolved} resolved pairs below ${RASTER_AB_TIMING_REVERSE_MIN_MS} ms (more than 1/8)`;
			}
		}
		const couldNotJudge = refusal != null;
		let rule;
		if (couldNotJudge) rule = `could not judge: ${refusal}`;
		else rule = `paired median(head - control) over ${nResolved} resolved pairs <= ${tol} ms`;
		out[key] = {ok: !couldNotJudge && withinTolerance, rule, tolMs: tol, medianDiffMs: med, iqrMs: spread, diffs, nResolved, nTotal, couldNotJudge};
	}
	return out;
}

// The old strict rule, kept for the log only: head median <= control median, no tolerance, over all measured values.
export function rasterAbStrict(headValues, controlValues) {
	const h = r1(median((headValues || []).filter(v => v != null)));
	const c = r1(median((controlValues || []).filter(v => v != null)));
	return {ok: h != null && c != null && h <= c, headMedianMs: h, controlMedianMs: c};
}
