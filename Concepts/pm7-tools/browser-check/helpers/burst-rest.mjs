// A stationary wheel burst's precondition: every gap between the page's wheel events stays within the pause's rest
// (150 ms). A driver gap longer than the rest lets the page's pause end legitimately mid-burst, so a row that judges
// the pause's survival across the whole burst cannot be judged from that input (PM7PERF-HOVERPAUSE-R5-CASCADE, batch 6:
// stream F's batch 13 runs read driver gaps of 222-258 ms on a loaded host, and the dependent rows then failed a pause
// that had ended correctly).
//
// Used by every stationary-burst group in checks/usage-hover-pause.check.mjs: R1/R2's window, R5's keyboard mounts, and
// R121's wheel proxies. The group's own could-judge row still fails when the burst broke, so a run is never green by
// accident: only the rows that depend on the burst report `could not judge: burst broke (max gap N ms)`.
export const REST_MS = 150;

export function burstState(wheels, rest = REST_MS) {
	const ts = (wheels || []).map((w) => (typeof w === 'number' ? w : w && w.t)).filter((t) => Number.isFinite(t));
	const gaps = ts.slice(1).map((t, i) => t - ts[i]);
	const maxGap = gaps.length ? Math.max(...gaps) : 0;
	return { maxGap: Math.round(maxGap), rest, broke: maxGap > rest };
}

export function burstWhy(b) {
	return `could not judge: burst broke (max gap ${b.maxGap} ms)`;
}
