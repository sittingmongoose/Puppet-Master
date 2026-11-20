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
// share). They stay below the bite thresholds so a sustained regression of 50 ms (firstNewMs / retainedMs) or 100 ms
// (settledMs) always puts the resolved paired median past its tolerance. No run-time noise estimate widens them.
export const RASTER_AB_TOL_MS = Object.freeze({firstNewMs: 25, retainedMs: 25, settledMs: 25});
export const RASTER_AB_BITE_MS = Object.freeze({firstNewMs: 50, retainedMs: 50, settledMs: 100});
// resolution: an edge gap above R is unresolved. R = min(factor x median frame interval, capMs).
export const RASTER_AB_RES = Object.freeze({factor: 3, capMs: 50});

export const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
export const r1 = v => v == null ? null : Math.round(v * 10) / 10;

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
// Returns one verdict per measure: {ok, rule, tolMs, medianDiffMs, diffs, nResolved, nTotal, couldNotJudge}. ok is false
// when fewer than minResolved pairs are resolved (could not judge) or the resolved paired median exceeds the tolerance.
export function rasterAbVerdict(pairsByMeasure, {tolMs = RASTER_AB_TOL_MS, minResolved = 6} = {}) {
	const out = {};
	for (const [key, raw] of Object.entries(pairsByMeasure)) {
		const all = raw || [];
		const diffs = all.filter(p => p.resolved && p.diff != null).map(p => r1(p.diff));
		const nResolved = diffs.length, nTotal = all.length;
		const med = r1(median(diffs));
		const tol = tolMs[key];
		const couldNotJudge = nResolved < minResolved;
		out[key] = {
			ok: couldNotJudge ? false : med <= tol,
			rule: couldNotJudge
				? `could not judge: capture gaps, ${nResolved} of ${nTotal} pairs resolved (need ${minResolved})`
				: `paired median(head - control) over ${nResolved} resolved pairs <= ${tol} ms`,
			tolMs: tol, medianDiffMs: med, diffs, nResolved, nTotal, couldNotJudge
		};
	}
	return out;
}

// The old strict rule, kept for the log only: head median <= control median, no tolerance, over all measured values.
export function rasterAbStrict(headValues, controlValues) {
	const h = r1(median((headValues || []).filter(v => v != null)));
	const c = r1(median((controlValues || []).filter(v => v != null)));
	return {ok: h != null && c != null && h <= c, headMedianMs: h, controlMedianMs: c};
}