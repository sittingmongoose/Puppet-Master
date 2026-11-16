// The verdict of checks/perf-usage-scroll.check.mjs from its four measured windows (as built, control, control, as built),
// kept apart from the browser so tools/usage-scroll-verdict.selftest.mjs can judge it on constructed windows.
// A window: { name: 'as built' | 'control', scrolls, whole, lost: [why], paint, full (frames never presented a second),
// partial, unknown, restFrames, restLost }. Returns { rows: [{ name, ok, detail }] the judged rows (could judge, the paint
// ratio), logs: [text], warnings: [text] (a guard breached: logged as WARNING by the check, never a failed row) }.
export function usageScrollVerdict(windows, { ratio = 0.85, rm = false } = {}) {
	const rows = [], logs = [], warnings = [];
	const judged = windows.length > 0 && windows.every((w) => w.scrolls > 0 && w.whole);
	rows.push({ name: 'could judge: the wheel scrolled the board in all four windows and each trace is whole', ok: judged, detail: windows.map((w) => `${w.name} ${w.scrolls} scroll events${w.whole ? '' : ' (' + (w.lost || []).join(', ') + ')'}`).join(', ') });
	if (!judged) return { rows, logs, warnings };
	const mean = (name, k) => { const v = windows.filter((w) => w.name === name).map((w) => w[k] || 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
	const [bp, cp] = [mean('as built', 'paint'), mean('control', 'paint')];
	const detail = `as built ${Math.round(bp)} ms/s, control ${Math.round(cp)} ms/s (paint + pre-paint + layerize): ratio ${(bp / Math.max(1, cp)).toFixed(2)}`;
	// under Reduced Motion a wheel tick is one instant step, not a smooth scroll of several frames: both builds paint about
	// the same (Alexis Basic Dark: 55 and 56 ms/s), so the ratio is logged there and the layer row carries the line
	if (rm) logs.push('Reduced Motion: main-thread paint while scrolling, not judged: ' + detail);
	else rows.push({ name: `main-thread paint while scrolling is at most ${ratio} of the control's`, ok: bp <= ratio * cp, detail });
	const [bf, cf] = [mean('as built', 'full'), mean('control', 'full')];
	const [bpa, cpa] = [mean('as built', 'partial'), mean('control', 'partial')];
	const [bu, cu] = [mean('as built', 'unknown'), mean('control', 'unknown')];
	const dd = `never presented: as built ${bf.toFixed(1)}/s, control ${cf.toFixed(1)}/s; presented with a partial update: as built ${bpa.toFixed(1)}/s, control ${cpa.toFixed(1)}/s; presentation unknown: as built ${bu.toFixed(1)}/s, control ${cu.toFixed(1)}/s`;
	// the two guards are diagnostics (R67-T1): on a shared host frames never presented and resting frames swing between
	// identical windows (two on origin/main read 27.4 and 18.6 a second), so a breach is a WARNING with its numbers, never a
	// failed row; within them the numbers are logged
	const dropOk = bf <= 1.5 * cf + 4;
	(dropOk ? logs : warnings).push(`${dropOk ? '' : 'WARNING '}frames never presented while scrolling ${dropOk ? 'within' : 'past'} 1.5 times the control's plus 4 a second: ${dd}`);
	const [br, cr] = [mean('as built', 'restFrames'), mean('control', 'restFrames')];
	const restLost = windows.some((w) => w.restLost);
	const restOk = br <= cr + 5;
	(restOk ? logs : warnings).push(`${restOk ? '' : 'WARNING '}at rest ${restOk ? 'within' : 'past'} 5 rendered main frames a second over the control's: as built ${br.toFixed(1)}, control ${cr.toFixed(1)} rendered main frames a second with the pointer parked${restLost ? ' (a rest trace lost data: these numbers are partial)' : ''}`);
	return { rows, logs, warnings };
}
