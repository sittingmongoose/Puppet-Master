// Diagnostic (G6 studio-scroll-overflow bisect): what happens to Home's visible scrollers while
// studio-scroll-overflow walks them. Same start as that check (1920x1080, Glass Light, the same scroller census),
// then an in-page tracker records, per scroller: detachment (the element leaves the document, and what now sits at its
// enumerated path), path shifts (its nth-of-type path now names another element while it stays attached), hidden
// spells, and, for every DOM call that detaches or moves a tracked scroller or inserts beside one of its ancestors,
// the call and its JS stack. It then walks the scrollers exactly as the check does (by the census path), recording
// each throw instead of stopping, and finally watches an idle window. Instrumentation only: it patches DOM methods in
// the page to read stacks, which costs time, so rates from it are compared only with each other.
//   --set out=<file.json>   where the record goes (default: the run log only)
//   --set idleMs=<ms>       idle window after the walk (default 8000)
//   --set walk=0            skip the walk (idle window only)
//   --set light=1           no DOM-method patching and no MutationObserver: detachment read once per frame only
//   --set rects=1           record each tracked scroller's box whenever it changes (exact values)
import fs from 'node:fs';

function tracker([paths, rects, light]) {
	Error.stackTraceLimit = 40;
	const T = window.__hst = { rects, frames: [], t0: performance.now(), paths, cur: [], role: [], desc: [], events: [], calls: [], pathOk: [], vis: [], replaced: [], shifts: [], hiddenSpells: [], callCount: 0 };
	const describe = (e) => !e || e.nodeType !== 1 ? String(e && e.nodeName) : e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 4).join('.') : '');
	const anc = (e) => { const out = []; for (let n = e; n && n.nodeType === 1 && out.length < 7; n = n.parentElement) out.push(describe(n)); return out.join(' < '); };
	const roleOf = (e) => e.id ? '#' + CSS.escape(e.id) : e.tagName.toLowerCase() + [...e.classList].slice(0, 3).map((c) => '.' + CSS.escape(c)).join('');
	T.describe = describe; T.anc = anc;
	const now = () => Math.round(performance.now() - T.t0);
	paths.forEach((p, i) => { const e = document.querySelector(p); T.cur[i] = e; T.role[i] = e ? roleOf(e) : null; T.desc[i] = anc(e); T.pathOk[i] = true; T.vis[i] = true; T.replaced[i] = 0; T.shifts[i] = 0; T.hiddenSpells[i] = 0; });
	const stack = () => new Error().stack.split('\n').slice(3, 40).map((s) => s.trim());
	const idxInside = (node, strict) => { const out = []; if (!node || !node.contains) return out; T.cur.forEach((e, i) => { if (e && node.contains(e) && (!strict || node !== e)) out.push(i); }); return out; };
	const idxAncestorOf = (parent) => { const out = []; if (!parent || !parent.contains) return out; T.cur.forEach((e, i) => { if (e && parent !== e && parent.contains(e) && !e.contains(parent)) out.push(i); }); return out; };
	const record = (kind, target, idx, extra) => { if (!idx.length) return; T.callCount++; if (T.calls.length < 400) T.calls.push({ t: now(), kind, idx, target: anc(target).slice(0, 220), extra, stack: stack() }); };
	const wrap = (proto, name, pre) => { const orig = proto[name]; if (typeof orig !== 'function') return; proto[name] = function (...a) { try { pre.call(this, a); } catch {} return orig.apply(this, a); }; };
	const wrapSetter = (proto, name, pre) => { const d = Object.getOwnPropertyDescriptor(proto, name); if (!d || !d.set) return; Object.defineProperty(proto, name, { ...d, set(v) { try { pre.call(this, v); } catch {} return d.set.call(this, v); } }); };
	const ins = (kind) => function (a) {
		const nodes = a.filter((x) => x && x.nodeType);
		for (const n of nodes) { const m = idxInside(n, false); if (m.length && n.isConnected) record(kind + ':move', n, m); }
		const parent = /before|after|replaceWith/.test(kind) ? this.parentNode : this;
		const m2 = idxAncestorOf(parent); if (m2.length && nodes.length) record(kind + ':insertNearAncestor', parent, m2, nodes.map(describe).slice(0, 3).join(','));
	};
	if (!light) {
	wrap(Node.prototype, 'appendChild', ins('appendChild'));
	wrap(Node.prototype, 'insertBefore', ins('insertBefore'));
	wrap(Element.prototype, 'append', ins('append'));
	wrap(Element.prototype, 'prepend', ins('prepend'));
	wrap(Element.prototype, 'before', ins('before'));
	wrap(Element.prototype, 'after', ins('after'));
	wrap(Node.prototype, 'removeChild', function (a) { record('removeChild', a[0], idxInside(a[0], false)); });
	wrap(Node.prototype, 'replaceChild', function (a) { record('replaceChild', a[1], idxInside(a[1], false), describe(a[0])); });
	wrap(Element.prototype, 'remove', function () { record('remove', this, idxInside(this, false)); });
	wrap(Element.prototype, 'replaceWith', function (a) { record('replaceWith', this, idxInside(this, false), a.map(describe).slice(0, 3).join(',')); });
	wrap(Element.prototype, 'replaceChildren', function (a) { record('replaceChildren', this, idxInside(this, true), a.map(describe).slice(0, 3).join(',')); });
	wrap(Element.prototype, 'insertAdjacentHTML', function (a) { const p = /^(beforebegin|afterend)$/i.test(a[0]) ? this.parentNode : this; record('insertAdjacentHTML:' + a[0], p, idxAncestorOf(p)); });
	wrap(Element.prototype, 'insertAdjacentElement', function (a) { const p = /^(beforebegin|afterend)$/i.test(a[0]) ? this.parentNode : this; record('insertAdjacentElement:' + a[0], p, idxAncestorOf(p), describe(a[1])); });
	wrapSetter(Element.prototype, 'innerHTML', function () { record('innerHTML', this, idxInside(this, true)); });
	wrapSetter(Element.prototype, 'outerHTML', function () { record('outerHTML', this, idxInside(this, false)); });
	wrapSetter(Node.prototype, 'textContent', function () { if (this.nodeType === 1) record('textContent', this, idxInside(this, true)); });
	}
	const poll = (why) => {
		T.cur.forEach((e, i) => {
			if (!e) return;
			const atPath = document.querySelector(T.paths[i]);
			if (!e.isConnected) {
				T.replaced[i]++;
				const byRole = [...document.querySelectorAll(T.role[i])].filter((x) => x.isConnected);
				const next = byRole.length === 1 ? byRole[0] : atPath;
				T.events.push({ t: now(), i, kind: 'detached', why, atPath: anc(atPath).slice(0, 220), byRole: byRole.length, next: anc(next).slice(0, 220) });
				T.cur[i] = next; if (next) T.role[i] = roleOf(next);
				return;
			}
			const ok = atPath === e;
			if (ok !== T.pathOk[i]) { T.pathOk[i] = ok; if (!ok) T.shifts[i]++; T.events.push({ t: now(), i, kind: ok ? 'pathRestored' : 'pathShift', why, atPath: anc(atPath).slice(0, 220), atPathVisible: !!(atPath && atPath.checkVisibility({ visibilityProperty: true })) }); }
			const vis = e.checkVisibility({ visibilityProperty: true });
			if (vis !== T.vis[i]) { T.vis[i] = vis; if (!vis) T.hiddenSpells[i]++; T.events.push({ t: now(), i, kind: vis ? 'shown' : 'hidden', why }); }
		});
	};
	T.poll = poll;
	if (!light) new MutationObserver(() => poll('mutation')).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
	// --set rects=1: each frame, each tracked scroller's box (rounded to 0.1 px), stored only when it changed
	T.last = [];
	const raf = () => {
		poll('frame');
		if (T.rects) T.cur.forEach((e, i) => { if (!e) return; const r = e.getBoundingClientRect(); const k = [r.x, r.y, r.width, r.height].join(','); if (k !== T.last[i]) { T.last[i] = k; if (T.frames.length < 4000) T.frames.push({ t: now(), i, r: k }); } });
		T.raf = requestAnimationFrame(raf);
	}; raf();
	return { desc: T.desc, role: T.role };
}

export default async function (t) {
	const out = t.args?.out || (t.state && t.state.out);
	const args = t.args || {};
	await t.viewport(1920, 1080);
	const f = await t.app.open(); await t.app.look('glass-light');
	const paths = await f.evaluate(() => {
		const nodes = [document.scrollingElement, ...document.querySelectorAll('body *')].filter((e, i, a) => a.indexOf(e) === i && e.clientHeight > 40 && e.scrollHeight > e.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.checkVisibility({ visibilityProperty: true }));
		return nodes.map((e) => { const path = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const tag = n.tagName.toLowerCase(); const siblings = n.parentElement ? [...n.parentElement.children].filter((x) => x.tagName === n.tagName) : [n]; path.unshift(tag + ':nth-of-type(' + (siblings.indexOf(n) + 1) + ')'); } return path.join(' > '); });
	});
	const info = await f.evaluate(tracker, [paths, String(args.rects ?? '0') === '1', String(args.light ?? '0') === '1']);
	t.log('scrollers ' + JSON.stringify(info));
	const walk = [];
	const tWalk0 = Date.now();
	if (String(args.walk ?? '1') !== '0') {
		for (let i = 0; i < paths.length; i++) {
			const rec = { i, ok: false };
			rec.at = await f.evaluate(() => Math.round(performance.now() - window.__hst.t0));
			try {
				const selector = paths[i], e = f.locator(selector); const s0 = Date.now(); await e.scrollIntoViewIfNeeded(); rec.scrollMs = Date.now() - s0;
				const r = await e.boundingBox(); rec.boxMs = Date.now() - s0 - rec.scrollMs; if (!r) throw Error('Scroller vanished');
				await t.page.mouse.move(r.x + r.width / 2, r.y + Math.min(r.height / 2, 200)); await t.page.mouse.wheel(0, -100000); await f.waitForTimeout(100);
				let n = 0;
				for (; n < 200; n++) {
					await t.noOverflow(`Home scroller ${i} segment ${n}`, { scope: selector });
					const pos = await e.evaluate((x) => ({ top: x.scrollTop, height: x.clientHeight, total: x.scrollHeight }));
					if (pos.top + pos.height >= pos.total - 2) { rec.ok = true; break; }
					await t.page.mouse.wheel(0, Math.max(40, Math.min(pos.height, 900) * .8)); await f.waitForTimeout(100);
				}
				rec.segments = n + 1;
			} catch (err) { rec.error = String(err.message || err).split('\n')[0]; }
			rec.ms = Date.now() - tWalk0;
			walk.push(rec);
		}
	}
	const walkMs = Date.now() - tWalk0;
	const idleMs = Number(args.idleMs ?? 8000);
	const mark = await f.evaluate(() => performance.now() - window.__hst.t0);
	await f.waitForTimeout(idleMs);
	const res = await f.evaluate((m) => { const T = window.__hst; T.poll('final'); cancelAnimationFrame(T.raf); return { tracked: T.desc, role: T.role, replaced: T.replaced, shifts: T.shifts, hiddenSpells: T.hiddenSpells, idleFrom: Math.round(m), elapsed: Math.round(performance.now() - T.t0), events: T.events, frames: T.frames, callCount: T.callCount, calls: T.calls }; }, mark);
	res.walk = walk; res.walkMs = walkMs; res.idleMs = idleMs; res.page = t.args?.page || null;
	t.log('summary ' + JSON.stringify({ replaced: res.replaced, shifts: res.shifts, hiddenSpells: res.hiddenSpells, walk, callCount: res.callCount, events: res.events.length }));
	if (out) fs.writeFileSync(out, JSON.stringify(res, null, 1));
	await t.check('diagnostic recorded', true, '');
}
