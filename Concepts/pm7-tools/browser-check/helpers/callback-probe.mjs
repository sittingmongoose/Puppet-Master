// Counts, in the page, every animation-frame callback and timer callback that runs while armed, by the place that asked
// for it (the two innermost page frames of the asking stack, with their built-page lines), and every DOM record by
// where it landed. Install with page.addInitScript(CALLBACK_PROBE) before the page loads; then in the page
// __cbp.arm() and __cbp.read() -> { secs, raf: [[n, site]], timers: [[n, site]], idle: [[n, site]] } (idle: the
// requestIdleCallback callbacks). helpers/built-source.mjs turns a
// site's lines into the script block that owns it.
// The wrappers add a function call to each callback and nothing else: they ask for no frame of their own.
export const CALLBACK_PROBE = () => {
	const P = window.__cbp = { armed: false, raf: new Map(), timer: new Map(), idle: new Map(), t0: 0 };
	const site = () => {
		const lines = String(new Error().stack || '').split('\n').slice(3, 7).map((l) => l.trim().replace(/^at /, '').replace(/\(?(file|https?|about):[^:)]*(?=:\d+:\d+)/, '').replace(/[()]/g, ''));
		return lines.filter(Boolean).slice(0, 2).join(' < ') || '?';
	};
	const bump = (map, k) => map.set(k, (map.get(k) || 0) + 1);
	const raf = window.requestAnimationFrame;
	window.requestAnimationFrame = function (fn) {
		if (!P.armed || typeof fn !== 'function') return raf.call(window, fn);
		const k = site();
		return raf.call(window, function (ts) { if (P.armed) bump(P.raf, k); return fn.call(this, ts); });
	};
	for (const kind of ['setTimeout', 'setInterval']) {
		const real = window[kind];
		window[kind] = function (fn, ...rest) {
			if (typeof fn !== 'function') return real.call(window, fn, ...rest);
			const k = kind + ' ' + (rest[0] | 0) + 'ms ' + site();
			return real.call(window, function (...a) { if (P.armed) bump(P.timer, k); return fn.apply(this, a); }, ...rest);
		};
	}
	const ric = window.requestIdleCallback;
	if (ric) window.requestIdleCallback = function (fn, opts) {
		if (typeof fn !== 'function') return ric.call(window, fn, opts);
		const k = site();
		return ric.call(window, function (d) { if (P.armed) bump(P.idle, k); return fn.call(this, d); }, opts);
	};
	P.arm = () => { P.raf.clear(); P.timer.clear(); P.idle.clear(); P.t0 = performance.now(); P.armed = true; };
	P.read = () => {
		P.armed = false; const secs = (performance.now() - P.t0) / 1000;
		const rows = (m) => [...m].sort((a, b) => b[1] - a[1]).map(([k, v]) => [v, k]);
		return { secs, raf: rows(P.raf), timers: rows(P.timer), idle: rows(P.idle) };
	};
};
