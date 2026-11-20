// Listens to every DOM write in the document for a while and says which of them wrote a value the page already held.
//
// A same-value write is an attribute or text record whose new value equals its old one, or a child list record that
// took nodes out and put the same ones back (what `el.textContent = same` and `el.innerHTML = same` do). The value a
// write left behind is the old value of the next write to the same thing, or what the thing holds when read.
// Such a write is not free: the element is restyled and every MutationObserver on the document wakes.
//
// In the page: evaluate(DOM_LISTEN), wait, then evaluate(DOM_READ, places) with places = [[key, selector], ...]. A
// record belongs to the first place whose selector matches its target or an ancestor (closest). Returns
// { secs, records, same, places: { key: { found, records, same, batches, eg } }, others: [[where what, n], ...],
//   otherSame, otherPerSecond: [n, ...], otherMedian }.
// `found` counts the elements the selector matches now, so a caller can fail a place that is not in the page.
// `batches` is how many separate deliveries to the observer held a record for the place: one patch of a card is one
// batch however many nodes it rewrites, eight ticks are eight. `otherPerSecond` is the same-value writes outside every
// place in each second listened to, and `otherMedian` their median: a writer that rewrites every second shows in the
// median, one redraw that rewrites two hundred attributes once does not (it shows in `otherSame` and `others`).
export const DOM_LISTEN = () => {
	const recs = [], when = []; let batch = 0;
	const mo = new MutationObserver((list) => { batch++; const now = performance.now(); for (const r of list) { recs.push(r); when.push([batch, now]); } });
	mo.observe(document.documentElement, { subtree: true, attributes: true, attributeOldValue: true, characterData: true, characterDataOldValue: true, childList: true });
	window.__domw = { mo, recs, when, t0: performance.now(), last: () => batch };
};

export const DOM_READ = (places) => {
	const { mo, recs, when, t0, last } = window.__domw; const end = performance.now();
	for (const r of mo.takeRecords()) { recs.push(r); when.push([last() + 1, end]); }
	mo.disconnect(); delete window.__domw;
	const secs = (end - t0) / 1000;
	const el = (n) => (n && n.nodeType === 1 ? n : n && n.parentElement);
	const desc = (e) => { if (!e) return '(detached)'; const c = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || ''; return e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (c.trim() ? '.' + c.trim().split(/\s+/).slice(0, 2).join('.') : ''); };
	const where = (e) => { const out = []; for (let p = e, i = 0; p && p !== document.documentElement && i < 3; p = p.parentElement, i++) out.unshift(desc(p)); return out.join(' > '); };
	const ser = (nodes) => Array.prototype.map.call(nodes, (n) => (n.nodeType === 1 ? n.outerHTML : n.nodeType === 3 ? 'T:' + n.data : 'N' + n.nodeType)).join('\u0001');
	const same = new Set(), what = new Map(), next = new Map();
	for (let i = recs.length - 1; i >= 0; i--) {
		const r = recs[i];
		if (r.type === 'attributes' || r.type === 'characterData') {
			const k = r.type === 'attributes' ? 'a:' + r.attributeName : 'text';
			let m = next.get(r.target); if (!m) next.set(r.target, m = new Map());
			const after = m.has(k) ? m.get(k) : (r.type === 'attributes' ? r.target.getAttribute(r.attributeName) : r.target.data);
			m.set(k, r.oldValue);
			if (after === r.oldValue) { same.add(r); what.set(r, r.type === 'attributes' ? '[' + r.attributeName + ']' : 'text'); }
		} else if (r.type === 'childList' && r.removedNodes.length && r.removedNodes.length === r.addedNodes.length && ser(r.removedNodes) === ser(r.addedNodes)) { same.add(r); what.set(r, 'children'); }
	}
	const out = { secs, records: recs.length, same: same.size, places: {}, others: [] };
	for (const [key, sel] of places) out.places[key] = { found: document.querySelectorAll(sel).length, records: 0, same: 0, batches: 0, eg: [] };
	const others = new Map(), seen = {}, bins = new Array(Math.max(1, Math.ceil(secs))).fill(0);
	for (let i = 0; i < recs.length; i++) {
		const r = recs[i], e = el(r.target); if (!e) continue;
		const p = places.find(([, sel]) => e.closest(sel));
		if (p) {
			const o = out.places[p[0]]; o.records++;
			const set = seen[p[0]] || (seen[p[0]] = new Set()); if (!set.has(when[i][0])) { set.add(when[i][0]); o.batches++; }
			if (same.has(r)) { o.same++; if (o.eg.length < 4) o.eg.push(desc(e) + ' ' + what.get(r)); }
		} else if (same.has(r)) {
			const k = where(e) + ' ' + what.get(r); others.set(k, (others.get(k) || 0) + 1);
			bins[Math.min(bins.length - 1, Math.max(0, Math.floor((when[i][1] - t0) / 1000)))]++;
		}
	}
	out.others = [...others].sort((a, b) => b[1] - a[1]).slice(0, 12);
	out.otherSame = [...others].reduce((a, [, n]) => a + n, 0);
	out.otherPerSecond = bins;
	out.otherMedian = bins.slice().sort((x, y) => x - y)[bins.length >> 1];
	return out;
};
