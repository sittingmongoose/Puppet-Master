// Whether a frame-trace summary measured the numbers a check is about to judge (PM7PERF-NO-RENDERER-READS-ZERO, R124 O-1).
//
// helpers/frame-trace.mjs names the page's renderer main thread in `renderer`. A trace that names none summarises with
// split {}, mainFrames 0 and layout counts 0, and judged as zeros those read as a PASS that measured nothing: seen once
// on a real run (renderer: null, lane W 2026-11-16). A trace taken without devtools.timeline, the category that carries
// Layout events, measures no layouts either. A trace that cannot be judged FAILS its row ("could not judge"), never a
// pass: the same rule batch 4's helpers/onb-rest-rows.mjs forcedLayoutRow applies to the NieR row.
//
// layouts: true for a check that judges Layout counts (perf-rest's whole-document layouts); the paint ratio and the
// main-frame rows do not need the category.
export function traceJudgeable(sum, { layouts = false } = {}) {
	if (!sum) return { ok: false, why: 'could not judge: no trace' };
	if (!sum.renderer) return { ok: false, why: 'could not judge: no renderer thread' };
	if (layouts && !sum.layoutCategory) return { ok: false, why: 'could not judge: no Layout category' };
	return { ok: true, why: '' };
}
