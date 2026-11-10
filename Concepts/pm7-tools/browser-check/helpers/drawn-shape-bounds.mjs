// Browser-side conservative bounds of SVG paint, before ancestor clipping. Paths are
// sampled by arc length; half a sample interval bounds the unobserved extrema.
// Stroke expansion includes square caps and the configured miter limit.
export function drawnShapeBounds(group) {
	const cache = window.__drawnShapePointCache ||= new WeakMap();
	const alpha = (value) => {
		if (!value || value === 'none' || value === 'transparent') return 0;
		const m = /rgba?\(([^)]*)\)/.exec(value);
		if (!m) return 1;
		const a = m[1].split(/[\s,/]+/).filter(Boolean);
		return a.length < 4 ? 1 : a[3].endsWith('%') ? parseFloat(a[3]) / 100 : +a[3];
	};
	let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity, count = 0;
	for (const e of group.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,line')) {
		if (e.closest('defs,clipPath,mask,pattern,marker,symbol')) continue;
		let shown = true;
		for (let p = e; p && p !== group.parentElement; p = p.parentElement) {
			const c = getComputedStyle(p);
			if (c.display === 'none' || c.visibility !== 'visible' || +c.opacity <= .05) { shown = false; break; }
		}
		if (!shown) continue;
		const c = getComputedStyle(e), fill = alpha(c.fill) * +c.fillOpacity > .05;
		const stroke = alpha(c.stroke) * +c.strokeOpacity > .05 && parseFloat(c.strokeWidth) > 0;
		if (!fill && !stroke) continue;
		const m = e.getScreenCTM(), length = e.getTotalLength();
		if (!m || !Number.isFinite(length)) throw Error('Invalid drawn shape geometry');
		if (length <= 0) continue;
		const norm = Math.hypot(m.a, m.b, m.c, m.d); // upper bound of the matrix operator norm
		const signature = e.outerHTML + '|' + c.d;
		let entry = cache.get(e);
		if (!entry || entry.signature !== signature) {
			const n = Math.max(8, Math.ceil(length * norm / .1)), points = [];
			for (let i = 0; i <= n; i++) { const p = e.getPointAtLength(length * i / n); points.push([p.x, p.y]); }
			entry = { signature, points, step: length / n }; cache.set(e, entry);
		}
		// A line, circle, ellipse or one open path segment has no join. A default
		// miter limit does not expand the round-ended single strokes of Pip's bar.
		const rawD = c.d && c.d !== 'none' ? c.d : e.getAttribute('d') || '';
		const d = (/^path\(\s*["']([\s\S]*)["']\s*\)$/.exec(rawD) || [null, rawD])[1];
		const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?/g) || [];
		const sizes = {L:6,H:5,V:5,C:10,S:8,Q:8,T:6,A:11};
		const oneSegment = /^[Mm]$/.test(tokens[0] || '') &&
			(tokens.length === sizes[(tokens[3] || '').toUpperCase()] || tokens.length === 5 && Number.isFinite(+tokens[3]) && Number.isFinite(+tokens[4]));
		const noJoin = ['line','circle','ellipse'].includes(e.tagName) || e.tagName === 'path' && oneSegment;
		const join = !noJoin && c.strokeLinejoin === 'miter' ? Math.max(1, +c.strokeMiterlimit) : 1;
		const cap = c.strokeLinecap === 'square' ? Math.SQRT2 : 1;
		const pad = entry.step * norm / 2 + (stroke ? parseFloat(c.strokeWidth) * norm / 2 * Math.max(join, cap) : 0);
		for (const [x, y] of entry.points) {
			const X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f;
			l = Math.min(l, X - pad); t = Math.min(t, Y - pad); r = Math.max(r, X + pad); b = Math.max(b, Y + pad);
		}
		count++;
	}
	if (!count || ![l, t, r, b].every(Number.isFinite)) throw Error('No usable drawn shapes');
	return { l, t, r, b, count };
}
