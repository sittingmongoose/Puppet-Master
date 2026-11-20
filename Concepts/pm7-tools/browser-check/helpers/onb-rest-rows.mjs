// The NieR forced-layout row of checks/perf-onb-rest.check.mjs, kept apart from the browser so
// tools/onb-rest-rows.selftest.mjs can judge it on constructed traces.
//
// PM7PERF-ONBREST-NO-RENDERER-READS-ZERO: helpers/frame-trace.mjs names the page's renderer main thread in `renderer`;
// when the trace names none, forcedWork counts nothing and the old row read 0 forced layouts a draw — a PASS that
// measured nothing (seen once on a real run, lane W 2026-11-16). A trace taken without the Layout category
// (devtools.timeline, the category that carries Layout events) measures nothing either. Both are "could not judge"
// and FAIL the row; only a trace that names the renderer and carries the category is judged.
export function forcedLayoutRow({ summary, forced, drawsPerSec, max = 0.1 }) {
	if (!summary) return { ok: false, detail: 'no trace: could not judge' };
	if (!summary.renderer) return { ok: false, detail: 'the trace names no renderer main thread: forced layouts unmeasured, could not judge' };
	if (!summary.layoutCategory) return { ok: false, detail: 'the trace has no Layout category (devtools.timeline): forced layouts unmeasured, could not judge' };
	const draws = drawsPerSec > 0 ? drawsPerSec : summary.mainFrames.perSec;
	if (!(draws > 0)) return { ok: false, detail: 'no drawn frames to divide by: could not judge' };
	const k = forced.layouts / summary.secs / draws;
	return { ok: k <= max, detail: `${(forced.layouts / summary.secs).toFixed(1)} forced layouts/s at ${draws.toFixed(1)} draws/s (${k.toFixed(2)} a draw); all layouts ${summary.layoutPerSec}/s` };
}
