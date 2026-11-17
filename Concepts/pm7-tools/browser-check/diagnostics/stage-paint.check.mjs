// What Pip's stage paints at rest, and how much of it is the backdrop (diagnostic, asserts nothing about speed; pm7-perf
// lane X, 2026-11-17, step 1 of W2's step 6: "split the SVG so the backdrop does not repaint with Pip").
//   browser-check run diagnostics/stage-paint.check.mjs --set page=<build> [--set out=<file.json>]
//   --set looks=basic-dark,glass-dark,nier-dark,friendly-dark   --set screens=welcome,ready   --set ms=3000
//   --set variants=as,noback,still,paused,split,split-paused   --set keep=<dir> keeps each raw trace
// Per look and screen, at rest (the window open, Pip's line typed, its props settled, no input since a pointer journey
// that wakes Pip past Welcome), and per trial variant made in the page for the window and undone after it:
//   as            the page as built;
//   noback        the stage's backdrop group (.pst-back) not drawn: what painting it costs while Pip sways;
//   still         the motion clock stopped (O55.motion.setTimeScale(0)): Pip, its strings and props stand still, the
//                 backdrop's own CSS loops (motes, radar, data column, clouds, flies, drifts, bubbles, glow) run on;
//   paused        the backdrop's CSS loops paused, Pip swaying;
//   split         the backdrop group (and Glass's reflection and Retro's terrain) moved into an svg of its own behind
//                 the stage's svg, as W2 proposes (a trial in the page, not the product's change);
//   split-paused  the same with the backdrop's loops paused (the backdrop then holds nothing that changes);
//   split-layer   split, and the stage's own svg (Pip, its strings, props) on a compositor layer of its own (will-change);
//   only:<k+k>    the stage writes only those kinds, every other write it makes dropped (diagnosis: which write makes
//                 Chrome re-layerize the whole page); freeze:<k+k> drops only those. Kinds: pose (Pip's control and head
//                 transforms and their parts), strings (Pip's strings and power glow d), face (eyes, blink), props (props
//                 and their strings), shadows, fx (particles, the z's), hud (NieR's brackets), trail, ripples, terrain,
//                 bubble (the bubble's, note's and HTML HUD's attributes and style), other (anything else in the stage);
//                 each frame is classed as a full PaintArtifactCompositor::Update, the repaint-only path, or neither;
//   --set layers=0 skips the LayerTree reading;
//   noapp         the page behind the onboarding window not painted (content-visibility: hidden on body's other
//                 children): how much of the cost is the page's other layers, not the stage;
// it reads a DevTools trace (main-thread paint, pre-paint, layerize and commit ms a second, the paint group by event name,
// raster and GPU ms a second, main frames) and then the compositor's layers twice (LayerTree: paintCount per layer, so the
// layers that were painted again in every frame, with their size and the DOM node Chrome names for each).
// Normal surface only (the layers' DOM nodes are read through the top document).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { traceEvents, summarise, TRACE_CATEGORIES } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

const PAINT = /^(Paint$|PaintImage|LocalFrameView::RunPaintLifecyclePhase|PaintArtifactCompositor::|Paint::)/;

// X2 diagnosis: attribute writers outside the visible stage, and reversible layer trials. These hooks are enabled
// only when requested. Counted writes and invalidation traces are separate from uninstrumented cost measurements.
const WATCH_WRITES = (mode) => {
	const sa = Element.prototype.setAttribute, rows = new Map(), start = performance.now();
	const name = (e) => { const a = []; for (let n = e; n && n.nodeType === 1 && a.length < 5; n = n.parentElement) { a.unshift(n.localName + (n.id ? '#' + n.id : '') + (n.getAttribute('class') ? '.' + n.getAttribute('class').trim().split(/\s+/).slice(0, 3).join('.') : '')); if (n.id) break; } return a.join(' > '); };
	Element.prototype.setAttribute = function (k, v) {
		if (this.isConnected && (mode === 'all' || !this.closest('#pm-o55-onboarding .o55-stage'))) {
			const key = name(this) + ' @' + k; let r = rows.get(key);
			if (!r) rows.set(key, r = { node: name(this), attr: k, n: 0, changed: 0, example: String(v), stack: new Error().stack });
			r.n++; if (this.getAttribute(k) !== String(v)) r.changed++;
		}
		return sa.call(this, k, v);
	};
	const proxies = [];
	for (const e of document.querySelectorAll('.o55-railpip, .o55-railnode, .pst-bubble, .pst-tip, .pst-hudhtml, .pst-hudhtml *')) {
		if (mode !== 'all' && e.closest('#pm-o55-onboarding .o55-stage')) continue;
		const real = e.style, old = Object.getOwnPropertyDescriptor(e, 'style');
		const record = (k, v) => { const key = name(e) + ' style.' + k; let r = rows.get(key); if (!r) rows.set(key, r = { node: name(e), attr: 'style.' + k, n: 0, changed: 0, example: String(v), stack: new Error().stack }); r.n++; if (real[k] !== String(v)) r.changed++; };
		const proxy = new Proxy(real, { get(target, k) { const v = Reflect.get(target, k, target); return typeof v === 'function' ? v.bind(target) : v; }, set(target, k, v) { record(k, v); return Reflect.set(target, k, v, target); } });
		Object.defineProperty(e, 'style', { configurable: true, get: () => proxy }); proxies.push(() => { if (old) Object.defineProperty(e, 'style', old); else delete e.style; });
	}
	window.__spWatchEnd = () => { Element.prototype.setAttribute = sa; for (const undo of proxies) undo(); const secs = (performance.now() - start) / 1000; return { secs, rows: [...rows.values()].sort((a, b) => b.changed - a.changed) }; };

};
const END_WATCH = () => { const fn = window.__spWatchEnd; delete window.__spWatchEnd; return fn ? fn() : null; };

const EXTRA_TRIAL = (v) => {
	const U = window.__spU, info = window.__spExtra = { variant: v, nodes: [] };
	if (v.startsWith('drop@')) {
		// selector|attribute: freeze one candidate at its existing value; diagnosis, never a pixel-equivalence claim.
		const [sel, attr = 'transform'] = v.slice(5).split('|'), sa = Element.prototype.setAttribute;
		Element.prototype.setAttribute = function (k, val) { if (k === attr && this.matches(sel)) return; return sa.call(this, k, val); };
		U.push(() => { Element.prototype.setAttribute = sa; });
		return;
	}
	if (v.startsWith('dedupe@')) {
		const [sel, attr = 'all'] = v.slice(7).split('|'), sa = Element.prototype.setAttribute;
		Element.prototype.setAttribute = function (k, val) { if ((attr === 'all' || k === attr) && this.matches(sel) && this.getAttribute(k) === String(val)) return; return sa.call(this, k, val); };
		U.push(() => { Element.prototype.setAttribute = sa; }); return;
	}
	if (v.startsWith('dropstyle@')) {
		const [sel, prop = 'transform'] = v.slice(10).split('|');
		for (const e of document.querySelectorAll(sel)) {
			const real = e.style, old = Object.getOwnPropertyDescriptor(e, 'style');
			const proxy = new Proxy(real, { get(target, k) { const val = Reflect.get(target, k, target); return typeof val === 'function' ? val.bind(target) : val; }, set(target, k, val) { return k === prop ? true : Reflect.set(target, k, val, target); } });
			Object.defineProperty(e, 'style', { configurable: true, get: () => proxy }); U.push(() => { if (old) Object.defineProperty(e, 'style', old); else delete e.style; });
		}
		return;
	}
	if (v === 'bubble-wrapper') {
		const e = document.querySelector('#pm-o55-onboarding .pst-bubble'), real = e.style, old = Object.getOwnPropertyDescriptor(e, 'style');
		const wrapper = document.createElement('div'); wrapper.className = 'sp-bubble-wrapper'; wrapper.style.cssText = 'position:absolute;inset:0;pointer-events:none;will-change:transform';
		e.before(wrapper); wrapper.appendChild(e);
		let translated = real.translate;
		const place = (val) => { translated = val; const a = String(val).trim().split(/\s+/); wrapper.style.transform = val && val !== 'none' ? `translate(${a[0]}, ${a[1] || '0px'})` : 'none'; };
		place(translated); real.translate = 'none';
		const proxy = new Proxy(real, { get(target, k) { if (k === 'translate') return translated; const val = Reflect.get(target, k, target); return typeof val === 'function' ? val.bind(target) : val; }, set(target, k, val) { if (k === 'translate') { place(val); return true; } return Reflect.set(target, k, val, target); } });
		Object.defineProperty(e, 'style', { configurable: true, get: () => proxy });
		U.push(() => { if (old) Object.defineProperty(e, 'style', old); else delete e.style; wrapper.before(e); real.translate = translated; wrapper.remove(); });
		info.nodes.push({ node: '.pst-bubble', wrapper: true }); return;
	}
	if (v === 'bubble-transform') {
		// Rest-only equivalence trial: independent scale precedes transform during the entrance. Keep the product's
		// translate throughout that entrance; this diagnostic is applied only after it has settled (scale = 1).
		const e = document.querySelector('#pm-o55-onboarding .pst-bubble'), real = e.style, old = Object.getOwnPropertyDescriptor(e, 'style'), oldTransform = real.transform;
		let translated = real.translate;
		const place = (val) => { translated = val; const a = String(val).trim().split(/\s+/); real.transform = val && val !== 'none' ? `translate(${a[0]}, ${a[1] || '0px'})` : 'none'; };
		place(translated); real.translate = 'none';
		const proxy = new Proxy(real, { get(target, k) { if (k === 'translate') return translated; const val = Reflect.get(target, k, target); return typeof val === 'function' ? val.bind(target) : val; }, set(target, k, val) { if (k === 'translate') { place(val); return true; } return Reflect.set(target, k, val, target); } });
		Object.defineProperty(e, 'style', { configurable: true, get: () => proxy });
		U.push(() => { if (old) Object.defineProperty(e, 'style', old); else delete e.style; real.transform = oldTransform; real.translate = translated; });
		info.nodes.push({ node: '.pst-bubble', restOnlyTransform: true }); return;
	}
	if (v === 'bubble-waapi') {
		// Same translation order through the pop: two full-size outer wrappers, each driven by a paused transform
		// animation. Existing stage writes seek those animations; no new clock, cadence or keyframes per frame.
		const e = document.querySelector('#pm-o55-onboarding .pst-bubble'), real = e.style, old = Object.getOwnPropertyDescriptor(e, 'style');
		const x = document.createElement('div'), y = document.createElement('div');
		for (const [el, axis] of [[x, 'x'], [y, 'y']]) { el.className = 'sp-bubble-waapi-' + axis; el.style.cssText = 'position:absolute;inset:0;pointer-events:none'; }
		e.before(x); x.appendChild(y); y.appendChild(e);
		const ax = x.animate([{ transform: 'translateX(-10000px)' }, { transform: 'translateX(10000px)' }], { duration: 20000, fill: 'both' });
		const ay = y.animate([{ transform: 'translateY(-10000px)' }, { transform: 'translateY(10000px)' }], { duration: 20000, fill: 'both' });
		ax.pause(); ay.pause(); let translated = real.translate;
		const place = (val) => { translated = val; const p = String(val).trim().split(/\s+/).map(parseFloat); ax.currentTime = 10000 + (p[0] || 0); ay.currentTime = 10000 + (p[1] || 0); };
		place(translated); real.translate = 'none';
		const proxy = new Proxy(real, { get(target, k) { if (k === 'translate') return translated; const val = Reflect.get(target, k, target); return typeof val === 'function' ? val.bind(target) : val; }, set(target, k, val) { if (k === 'translate') { place(val); return true; } return Reflect.set(target, k, val, target); } });
		Object.defineProperty(e, 'style', { configurable: true, get: () => proxy });
		U.push(() => { if (old) Object.defineProperty(e, 'style', old); else delete e.style; x.before(e); real.translate = translated; ax.cancel(); ay.cancel(); x.remove(); });
		info.nodes.push({ node: '.pst-bubble', pausedTransformSeek: true }); return;
	}
	if (v === 'hold-rail') {
		const rail = O55.pipStage.rail, tick = rail.tick; if (rail.raf) cancelAnimationFrame(rail.raf); rail.raf = 0; rail.tick = () => {};
		U.push(() => { rail.tick = tick; rail.kick(); }); return;
	}
	if (!/^demote-(wc|paused|both|vt|3d)(@.*)?$/.test(v)) return;
	const [demotion, scope] = v.split('@'); v = demotion;
	const outside = (e) => e && e.nodeType === 1 && !e.closest('#pm-o55-onboarding') && (!scope || e.closest(scope));
	const saved = new Map(), times = [], remember = (e) => { if (!saved.has(e)) saved.set(e, e.getAttribute('style')); };
	U.push(() => {
		for (const [e, s] of saved) { if (s == null) e.removeAttribute('style'); else e.setAttribute('style', s); }
		// Restoring animation CSS creates a fresh effect. Restore its paused time too, otherwise the next control
		// has a different picture (and layer count) from the first control.
		const anims = document.getAnimations(), used = new Set();
		for (const old of times) { const a = anims.find((a) => !used.has(a) && a instanceof CSSAnimation && a.effect && a.effect.target === old.el && a.animationName === old.name); if (a) { a.currentTime = old.time; if (a.playState !== 'paused') a.pause(); used.add(a); } }
	});
	if (v === 'demote-wc' || v === 'demote-both' || v === 'demote-vt') {
		const changes = [];
		for (const e of document.querySelectorAll('body *')) if (outside(e)) {
			const cs = getComputedStyle(e), key = v === 'demote-vt' ? 'view-transition-name' : 'will-change';
			const was = cs.getPropertyValue(key); if (was && was !== (v === 'demote-vt' ? 'none' : 'auto')) changes.push([e, key, was]);
		}
		for (const [e, k, was] of changes) { remember(e); e.style.setProperty(k, k === 'will-change' ? 'auto' : 'none', 'important'); info.nodes.push({ node: e.localName + '#' + e.id + '.' + e.getAttribute('class'), key: k, was }); }
	}
	if (v === 'demote-3d') {
		const changes = [];
		for (const e of document.querySelectorAll('body *')) if (outside(e)) {
			const tr = getComputedStyle(e).transform; if (!tr.startsWith('matrix3d(')) continue;
			const m = new DOMMatrix(tr);
			if ([m.m13, m.m14, m.m23, m.m24, m.m31, m.m32, m.m34, m.m43].some((x) => x !== 0) || m.m33 !== 1 || m.m44 !== 1) continue;
			changes.push([e, `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.e}, ${m.f})`, tr]);
		}
		for (const [e, val, was] of changes) { remember(e); e.style.setProperty('transform', val, 'important'); info.nodes.push({ node: e.localName + '#' + e.id + '.' + e.getAttribute('class'), was, val }); }
	}
	if (v === 'demote-paused' || v === 'demote-both') {
		// Remove paused CSS animation effects only after preserving every animated computed property. No visible
		// element is hidden. Running animations, pseudo elements and transitions are deliberately left alone.
		const targets = new Map();
		for (const a of document.getAnimations()) {
			const fx = a.effect, e = fx && fx.target;
			if (!(a instanceof CSSAnimation) || a.playState !== 'paused' || !outside(e) || fx.pseudoElement) continue;
			times.push({ el: e, name: a.animationName, time: a.currentTime });
			let ps = targets.get(e); if (!ps) targets.set(e, ps = new Set());
			for (const kf of fx.getKeyframes()) for (const p of Object.keys(kf)) if (!['offset', 'computedOffset', 'easing', 'composite'].includes(p)) ps.add(p);
		}
		const changes = [];
		for (const [e, ps] of targets) { const cs = getComputedStyle(e), props = [...ps].map((p) => { const k = p.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()); return [k, cs.getPropertyValue(k)]; }); changes.push([e, props]); }
		for (const [e, props] of changes) { remember(e); for (const [k, val] of props) e.style.setProperty(k, val, 'important'); e.style.setProperty('animation', 'none', 'important'); info.nodes.push({ node: e.localName + '#' + e.id + '.' + e.getAttribute('class'), props }); }
	}
};

async function invalidationTrace(cdp, ms) {
	await cdp.send('Tracing.start', { categories: TRACE_CATEGORIES + ',disabled-by-default-devtools.timeline.invalidationTracking', transferMode: 'ReturnAsStream' });
	await new Promise((r) => setTimeout(r, ms));
	const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
	await cdp.send('Tracing.end'); const { stream } = await done, chunks = [];
	try { for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); chunks.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString() : r.data); if (r.eof) break; } }
	finally { await cdp.send('IO.close', { handle: stream }); }
	const t = JSON.parse(chunks.join('')); return Array.isArray(t) ? t : t.traceEvents || [];
}

// self time per event name on the renderer's main thread, for the names of one group
function selfByName(events, renderer, re) {
	if (!renderer) return [];
	const evs = [], open = [];
	for (const e of events) {
		if (e.pid !== renderer.pid || e.tid !== renderer.tid || typeof e.name !== 'string') continue;
		if (e.ph === 'X') evs.push({ name: e.name, ts: e.ts, end: e.ts + (e.dur || 0) });
		else if (e.ph === 'B') open.push(e);
		else if (e.ph === 'E') { const b = open.pop(); if (b) evs.push({ name: b.name, ts: b.ts, end: e.ts }); }
	}
	evs.sort((a, b) => a.ts - b.ts || b.end - a.end);
	const self = new Map(), stack = [];
	const close = (upto) => { while (stack.length && stack[stack.length - 1].end <= upto) { const s = stack.pop(); self.set(s.name, (self.get(s.name) || 0) + Math.max(0, s.end - s.ts - s.child)); if (stack.length) stack[stack.length - 1].child += s.end - s.ts; } };
	for (const e of evs) { close(e.ts); const p = stack[stack.length - 1]; stack.push({ name: e.name, ts: e.ts, end: p ? Math.min(e.end, p.end) : e.end, child: 0 }); }
	close(Infinity);
	return [...self].filter(([n]) => re.test(n)).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

const SETTLED = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.ps) return false;
	if (st.bubble && st.bubble.classList.contains('typing')) return false;
	for (const p of st.props.values()) if (p.state === 'out' || !p.settled) return false;
	return true;
};

// One trial variant on, in the page; returns what it did. UNDO restores hooks/styles; CSS cancellation can also
// dispatch page handlers, so broad animation demotions need fresh-page isolation (the native controls expose drift).
const APPLY = (v) => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st) return 'no stage';
	const U = window.__spU = []; delete window.__spExtra;
	const parts = v.split('~'); v = parts.shift();
	if (/^control-/.test(v)) v = 'as';
	if (/^(demote-|drop@|dedupe@|dropstyle@|hold-rail|bubble-wrapper|bubble-transform|bubble-waapi)/.test(v)) { parts.unshift(v); v = 'as'; }
	const pause = () => { for (const a of document.getAnimations()) { const el = a.effect && a.effect.target; if (el && el.closest && el.closest('.pst-back') && a.playState === 'running') { a.pause(); U.push(() => a.play()); } } };
	const split = () => {
		const NS = 'http://www.w3.org/2000/svg', svg = st.svg, back = document.createElementNS(NS, 'svg');
		for (const a of svg.attributes) back.setAttribute(a.name, a.value);
		back.classList.add('pst-trial-back');
		svg.parentNode.insertBefore(back, svg);
		const moved = [st.gBack, st.gTerrain, st.gReflect].filter(Boolean);
		const marks = moved.map((g) => { const m = document.createComment('x'); g.parentNode.insertBefore(m, g); return m; });
		moved.forEach((g) => back.appendChild(g));
		U.push(() => { moved.forEach((g, i) => marks[i].parentNode.insertBefore(g, marks[i])); marks.forEach((m) => m.remove()); back.remove(); });
		return moved.length;
	};
	if (v === 'noback') { st.gBack.style.display = 'none'; U.push(() => { st.gBack.style.display = ''; }); }
	else if (v === 'still') { O55.motion.setTimeScale(0); U.push(() => O55.motion.setTimeScale(1)); }
	else if (v === 'paused') pause();
	else if (v === 'split') split();
	else if (v === 'split-paused') { split(); pause(); }
	else if (v === 'split-layer') { split(); st.svg.style.willChange = 'transform'; U.push(() => { st.svg.style.willChange = ''; }); }
	else if (v === 'noapp') {
		/* the page behind the window not painted (content-visibility: hidden on every child of body that does not hold
		   the onboarding window): how much of the cost is the rest of the page's layers */
		const o = document.getElementById('pm-o55-onboarding');
		for (const el of document.body.children) { if (el.contains(o) || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue; const was = el.style.contentVisibility; el.style.contentVisibility = 'hidden'; U.push(() => { el.style.contentVisibility = was; }); }
	}
	else if (/^(only|freeze):/.test(v)) {
		/* only:<kinds> lets the stage write only those kinds (a+b), freeze:<kinds> stops only those; every other write
		   the stage makes (an attribute, a node added, the bubble's or note's style) is dropped, so those parts stand where
		   they were while the stage goes on drawing. Diagnosis only: the picture is not one the page draws */
		const [mode, rest] = v.split(':'), [list, mod] = rest.split('!'), want = new Set(list.split('+'));
		/* !translate: Pip's control and head transforms written without their rotate() (a translate-and-scale only
		   matrix); !wc: those two groups given will-change: transform (their own compositor layers). Diagnosis only */
		if (mod === 'wc') for (const g of [st.gCtl, st.gHead]) { g.style.willChange = 'transform'; U.push(() => { g.style.willChange = ''; }); }
		const inS = (n) => n && n.nodeType === 1 && st.root.contains(n);
		const kindOf = (e) => {
			if (e === st.gCtl || e === st.gHead || (st.gCtl && st.gCtl.contains(e) && e !== st.eyesEl && e !== st.blinkEl) || (st.gHead && st.gHead.contains(e) && e !== st.eyesEl && e !== st.blinkEl && !(st.eyesEl && st.eyesEl.contains(e)) && !(st.blinkEl && st.blinkEl.contains(e)))) return 'pose';
			if ((st.pstrs || []).includes(e) || (st.pglow || []).includes(e)) return 'strings';
			if (e === st.eyesEl || e === st.blinkEl || (st.eyesEl && st.eyesEl.contains(e)) || (st.blinkEl && st.blinkEl.contains(e))) return 'face';
			const c = (sel) => e.closest && e.closest(sel);
			if (c('.pst-props') || c('.pst-pstr')) return 'props';
			if (c('.pst-shadows')) return 'shadows';
			if (c('.pst-fx')) return 'fx';
			if (c('.pst-hud')) return 'hud';
			if (c('.pst-trail')) return 'trail';
			if (c('.pst-ripples')) return 'ripples';
			if (c('.pst-terrain')) return 'terrain';
			if (c('.pst-bubble') || c('.pst-tip') || c('.pst-hudhtml')) return 'bubble';
			return 'other';
		};
		const drop = (e) => { if (!inS(e)) return false; const k = kindOf(e); return mode === 'only' ? !want.has(k) : want.has(k); };
		const D = window.__spDrops = {};
		const note = (e, what) => { const k = kindOf(e) + ' ' + what; D[k] = (D[k] || 0) + 1; };
		const EP = Element.prototype, NP = Node.prototype, sa = EP.setAttribute, ra = EP.removeAttribute, ac = NP.appendChild, ib = NP.insertBefore, rm = EP.remove;
		EP.setAttribute = function (a, val) { if (drop(this)) { note(this, '@' + a); return; } if (mod === 'translate' && a === 'transform' && (this === st.gCtl || this === st.gHead)) val = String(val).replace(/rotate\([^)]*\)/g, '').replace(/scale\([^)]*\)/g, ''); return sa.call(this, a, val); };
		EP.removeAttribute = function (a) { if (drop(this)) { note(this, '-@' + a); return; } return ra.call(this, a); };
		NP.appendChild = function (n) { if (inS(this) && drop(this)) { note(this, '+child'); return n; } return ac.call(this, n); };
		NP.insertBefore = function (n, r) { if (inS(this) && drop(this)) { note(this, '+child'); return n; } return ib.call(this, n, r); };
		EP.remove = function () { if (drop(this)) { note(this, 'remove'); return; } return rm.call(this); };
		const CP = CSSStyleDeclaration.prototype, sp = CP.setProperty;
		const owners = [...st.root.querySelectorAll('.pst-bubble, .pst-tip, .pst-hudhtml, .pst-hudhtml *')];
		const byStyle = new Map(owners.map((e) => [e.style, e]));
		const owner = (cs) => byStyle.get(cs) || null;
		CP.setProperty = function (k, val, pr) { const el = owner(this); if (el && drop(el)) { note(el, 'style ' + k); return; } return sp.call(this, k, val, pr); };
		const props = ['translate', 'transform'];
		const descs = props.map((k) => [k, Object.getOwnPropertyDescriptor(CP, k)]).filter(([, d]) => d && d.set);
		if (mod === 'legacy') for (const [k, d] of descs) Object.defineProperty(CP, k, { configurable: true, enumerable: d.enumerable, get: d.get, set(val) { const el = owner(this); if (el && drop(el)) { note(el, 'style ' + k); return; } return d.set.call(this, val); } });
		const proxies = [];
		if (mod !== 'legacy') for (const e of owners) {
			const real = e.style, old = Object.getOwnPropertyDescriptor(e, 'style');
			const proxy = new Proxy(real, {
				get(target, k) { if (k === 'setProperty') return (p, val, pr) => { if (drop(e)) { note(e, 'style ' + p); return; } return sp.call(target, p, val, pr); }; const val = Reflect.get(target, k, target); return typeof val === 'function' ? val.bind(target) : val; },
				set(target, k, val) { if (drop(e)) { note(e, 'style ' + String(k)); return true; } return Reflect.set(target, k, val, target); }
			});
			Object.defineProperty(e, 'style', { configurable: true, get: () => proxy }); proxies.push(() => { if (old) Object.defineProperty(e, 'style', old); else delete e.style; });
		}
		U.push(() => { EP.setAttribute = sa; EP.removeAttribute = ra; NP.appendChild = ac; NP.insertBefore = ib; EP.remove = rm; CP.setProperty = sp; for (const [k, d] of descs) Object.defineProperty(CP, k, d); for (const undo of proxies) undo(); });
	}
	else if (v !== 'as') return 'unknown variant ' + v;
	for (const p of parts) window.__spExtraTrial(p);
	return '';
};
const DROPS = () => { const d = window.__spDrops || {}; delete window.__spDrops; return Object.entries(d).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => k + ' ' + n).join(', '); };

// Per main frame on the renderer: did it run a full PaintArtifactCompositor::Update, the repaint-only path, or no
// layerization at all; every PaintArtifactCompositor/Repainted event name with its count; the args of the first few
function pacFrames(events, renderer) {
	if (!renderer) return null;
	const mine = events.filter((e) => e.pid === renderer.pid && e.tid === renderer.tid && typeof e.name === 'string');
	const starts = mine.filter((e) => e.name === 'ProxyMain::BeginMainFrame' && e.ph === 'X').sort((a, b) => a.ts - b.ts);
	const pac = mine.filter((e) => /PaintArtifactCompositor|Repainted|Layerize/.test(e.name) && (e.ph === 'X' || e.ph === 'B'));
	const names = {}; for (const e of pac) names[e.name] = (names[e.name] || 0) + 1;
	const out = { frames: starts.length, full: 0, repainted: 0, none: 0, noUpdates: 0, names, args: [] };
	const noUp = mine.filter((e) => e.name === 'EarlyOut_NoUpdates').map((e) => e.ts);
	for (const s of starts) {
		const inside = pac.filter((e) => e.ts >= s.ts && e.ts <= s.ts + s.dur);
		if (inside.some((e) => e.name === 'PaintArtifactCompositor::Update')) out.full++;
		else if (inside.some((e) => /Repainted/.test(e.name))) out.repainted++;
		else if (noUp.some((t) => t >= s.ts && t <= s.ts + s.dur)) out.noUpdates++;
		else out.none++;
	}
	for (const e of pac.filter((e) => e.args && Object.keys(e.args).length).slice(0, 3)) out.args.push(e.name + ' ' + JSON.stringify(e.args).slice(0, 200));
	return out;
}
const UNDO = () => { const U = window.__spU || []; while (U.length) { try { U.pop()(); } catch (e) { /* gone */ } } };

// Boxes on the page: the stage's, its svg(s), Pip's and each prop's (for the layers' sizes against them)
const BOXES = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
	return { stylePrototype: { name: Object.getPrototypeOf(st.bubble.style).constructor.name, baseTranslate: !!Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'translate'), ownTranslate: !!Object.getOwnPropertyDescriptor(Object.getPrototypeOf(st.bubble.style), 'translate') }, window: r(document.querySelector('#pm-o55-onboarding .o55-win')), stage: r(st.root), svgs: [...st.root.querySelectorAll('svg.pst-svg')].map(r), pip: r(st.gPip), props: r(st.gProps), back: r(st.gBack), speed: typeof o55SpeedFactor === 'number' ? o55SpeedFactor : 1, rail: { raf: O55.pipStage.rail.raf, x: O55.pipStage.rail.x, dip: O55.pipStage.rail.dip, ang: O55.pipStage.rail.ang }, dpr: devicePixelRatio, fam: st.famName, asleep: !!st.sleepZ, nProps: st.props.size };
};

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,nier-dark,friendly-dark').split(',').filter(Boolean);
	const screens = String(t.args.screens || 'welcome,ready').split(',').filter(Boolean);
	const variants = t.args.variants === 'none' ? [] : String(t.args.variants || 'as,noback,still,paused,split,split-paused').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 3000);
	const layerMs = Number(t.args.layerMs || ms);
	const keep = t.args.keep ? path.resolve(String(t.args.keep)) : null;
	if (keep) mkdirSync(keep, { recursive: true });
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const cdp = await t.page.context().newCDPSession(t.page);
	if (String(t.args.censusDOM || '') === '1') { await cdp.send('DOM.enable'); await cdp.send('LayerTree.enable'); }
	const gpu = await t.page.evaluate(() => { try { const c = document.createElement('canvas').getContext('webgl'); const e = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(e.UNMASKED_RENDERER_WEBGL); } catch (e) { return String(e); } });
	t.log('GPU ' + gpu + ' | ' + (await t.page.evaluate(() => navigator.userAgent)));
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screens[0] + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, open ? screens[0] : 'no window after 60 s');
	if (!open) return;
	await f.evaluate('window.__spExtraTrial = ' + EXTRA_TRIAL.toString());
	if (f !== t.page.mainFrame()) t.log('NOTE the app is in a frame: layers are named through the top document only');
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 20000));

	// the compositor's layers: paintCount per layer over a window, with the DOM node each names
	const snapshot = () => new Promise((resolve) => {
		const on = (e) => { if (e.layers) { cdp.off('LayerTree.layerTreeDidChange', on); resolve(e.layers); } };
		cdp.on('LayerTree.layerTreeDidChange', on);
		cdp.send('LayerTree.enable').catch(() => resolve(null));
		setTimeout(() => { cdp.off('LayerTree.layerTreeDidChange', on); resolve(null); }, 4000);
	});
	const layers = async () => {
		const painted = []; const onP = (e) => painted.push(e);
		cdp.on('LayerTree.layerPainted', onP);
		const a = await snapshot(); const t0 = Date.now();
		await t.page.waitForTimeout(layerMs);
		await cdp.send('LayerTree.disable').catch(() => {});
		const b = await snapshot(); const secs = (Date.now() - t0) / 1000;
		await cdp.send('LayerTree.disable').catch(() => {});
		cdp.off('LayerTree.layerPainted', onP);
		if (!a || !b) return { error: 'no layer tree' };
		const before = new Map(a.map((l) => [l.layerId, l.paintCount || 0]));
		const rows = [];
		for (const l of b) {
			if (!l.drawsContent) continue;
			const d = (l.paintCount || 0) - (before.get(l.layerId) ?? 0);
			let node = '';
			if (l.backendNodeId) { try { const n = (await cdp.send('DOM.describeNode', { backendNodeId: l.backendNodeId })).node; node = n.localName + (n.attributes ? (() => { const at = {}; for (let i = 0; i < n.attributes.length; i += 2) at[n.attributes[i]] = n.attributes[i + 1]; return (at.id ? '#' + at.id : '') + (at.class ? '.' + at.class.trim().split(/\s+/).slice(0, 3).join('.') : ''); })() : ''); } catch (e) { node = 'node ' + l.backendNodeId; } }
			rows.push({ id: l.layerId, w: Math.round(l.width), h: Math.round(l.height), x: Math.round(l.offsetX), y: Math.round(l.offsetY), paintsPerSec: Math.round(d / secs * 10) / 10, node });
		}
		rows.sort((x, y) => y.paintsPerSec - x.paintsPerSec || y.w * y.h - x.w * x.h);
		const pe = new Map();
		for (const e of painted) { const k = e.layerId, s = pe.get(k) || { n: 0, area: 0, max: [0, 0] }; s.n++; const c = e.clip || {}; s.area += (c.width || 0) * (c.height || 0); if ((c.width || 0) * (c.height || 0) > s.max[0] * s.max[1]) s.max = [c.width, c.height]; pe.set(k, s); }
		return { secs: Math.round(secs * 10) / 10, n: b.length, drawn: rows.length, repainted: rows.filter((r) => r.paintsPerSec > 0).slice(0, 8), layerPainted: painted.length ? [...pe].map(([k, s]) => ({ id: k, perSec: Math.round(s.n / secs * 10) / 10, areaPerPaint: Math.round(s.area / s.n), max: s.max })) : 'none (Chrome sent no LayerTree.layerPainted)' };
	};

	/* --set census=1: every drawn compositor layer with Chrome's compositing reasons, the DOM node it names, that node's
	   box and whether it is inside the onboarding window or behind it; grouped by reason (step 2 of the diagnosis: what
	   makes the page's layers, so which could be held as fewer with the same pixels) */
	const census = async (label) => {
		const ls = await snapshot();
		if (!ls) return null;
		const rows = [];
		for (const l of ls.filter((x) => x.drawsContent)) {
			let reasons = '?', reasonTexts = [], node = '', where = '?', vis = '', detail = null;
			try { const r = await cdp.send('LayerTree.compositingReasons', { layerId: l.layerId }); reasons = (r.compositingReasonIds || r.compositingReasons || []).join('+') || 'none'; reasonTexts = r.compositingReasons || []; } catch (e) { /* none */ }
			if (l.backendNodeId) {
				try {
					const { object } = await cdp.send('DOM.resolveNode', { backendNodeId: l.backendNodeId });
					const r = await cdp.send('Runtime.callFunctionOn', { objectId: object.objectId, returnByValue: true, functionDeclaration: `function () {
 const e = this.nodeType === 1 ? this : this.parentElement; if (!e) return null;
 const cls = (n) => (n.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean).slice(0, 3).join('.');
 const label = (n) => n.localName + (n.id ? '#' + n.id : '') + (cls(n) ? '.' + cls(n) : '');
 const parts = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { parts.unshift(label(n)); if (n.id) break; }
 const b = e.getBoundingClientRect(), win = document.querySelector('#pm-o55-onboarding .o55-win').getBoundingClientRect(), cs = getComputedStyle(e);
 const inWin = !!e.closest('#pm-o55-onboarding'), intersects = b.right > win.left && b.left < win.right && b.bottom > win.top && b.top < win.bottom;
 const inside = b.left >= win.left && b.right <= win.right && b.top >= win.top && b.bottom <= win.bottom;
 return { node: label(e), path: parts.join(' > '), where: inWin ? 'window' : intersects ? (inside ? 'behind' : 'behind+beside') : 'beside',
 box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], wc: cs.willChange,
 anim: cs.animationName !== 'none' ? cs.animationName + ' ' + cs.animationPlayState : '', vt: cs.viewTransitionName && cs.viewTransitionName !== 'none' ? cs.viewTransitionName : '',
 pos: cs.position, filter: cs.filter !== 'none' ? cs.filter : '', bf: cs.backdropFilter && cs.backdropFilter !== 'none' ? cs.backdropFilter : '', ov: cs.overflowY, transform: cs.transform };
 }` });
					const v = r.result && r.result.value; if (v) { detail = v; node = v.node; where = v.where; vis = [v.box.join(','), v.wc !== 'auto' ? 'will-change:' + v.wc : '', v.anim, v.vt ? 'vt:' + v.vt : '', v.pos === 'fixed' || v.pos === 'sticky' ? v.pos : '', v.filter, v.bf, /auto|scroll/.test(v.ov) ? 'scroll:' + v.ov : ''].filter(Boolean).join(' '); }
					await cdp.send('Runtime.releaseObject', { objectId: object.objectId }).catch(() => {});
				} catch (e) { node = 'node ' + l.backendNodeId; }
			}
			rows.push({ id: l.layerId, parent: l.parentLayerId, backendNodeId: l.backendNodeId, transform: l.transform, w: Math.round(l.width), h: Math.round(l.height), reasons, reasonTexts, node, where, vis, detail });
		}
		const by = new Map();
		for (const r of rows) { const k = r.where + ' | ' + r.reasons; const g = by.get(k) || { n: 0, px: 0, eg: [] }; g.n++; g.px += r.w * r.h; if (g.eg.length < 4) g.eg.push(r.node + ' ' + r.w + 'x' + r.h + (r.vis ? ' [' + r.vis + ']' : '')); by.set(k, g); }
		const groups = [...by].sort((a, b) => b[1].n - a[1].n);
		t.log(`${label} CENSUS: ${rows.length} drawn layers (${rows.filter((r) => r.where === 'window').length} in the window, ${rows.filter((r) => r.where !== 'window' && r.where !== '?').length} outside it, ${rows.filter((r) => r.where === '?').length} unnamed)`);
		for (const [k, g] of groups) t.log(`${label} CENSUS ${String(g.n).padStart(3)} x ${k} (${Math.round(g.px / 1e4) / 100} MP): ${g.eg.join(' ; ')}`);
		await cdp.send('LayerTree.disable').catch(() => {});
		return { rows, groups: groups.map(([k, g]) => ({ k, ...g })) };
	};

	const out = [];
	let pixelFreeze = null;
	if (t.args.pixels && String(t.args.nativeClockOnly || '') !== '1') {
		// Use lane W's exact freeze, without changing a second diagnostic. The named, top-level function is read
		// from its source so the pose/props/clock fixes stay shared; refuse if that source boundary changes.
		const source = readFileSync(new URL('./stage-frames.check.mjs', import.meta.url), 'utf8'), marker = 'const FREEZE = ';
		const start = source.indexOf(marker), end = source.indexOf('\n};', start);
		if (start < 0 || end < start) throw new Error('stage-frames FREEZE source boundary changed');
		pixelFreeze = source.slice(start + marker.length, end + 3).trim().replace(/;$/, '');
	}
	for (const look of looks) {
		const [fam, mode] = look.split('-');
		if (String(t.args.censusDOM || '') === '1') await cdp.send('LayerTree.enable');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${look}: the look is applied`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme')));
		if (!ok) continue;
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		for (const screen of screens) {
			if (String(t.args.censusDOM || '') === '1') await cdp.send('LayerTree.enable');
			const at = await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, screen);
			if (at !== screen) { await t.check(`${look} ${screen}: the screen opened`, false, String(at)); continue; }
			if (screen !== 'welcome') {
				await t.page.waitForTimeout(1200);
				for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
				await t.page.mouse.move(W - 6, Math.round(H / 2));
			}
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).catch(() => t.log(`${look} ${screen}: NOTE not settled after 16 s; measured as it was`));
			const boxes = await f.evaluate(BOXES);
			if (String(t.args.census || '') === '1') out.push({ look, screen, census: await census(`${look} ${screen}`) });
			if (String(t.args.writes || '') === '1') {
				await f.evaluate(WATCH_WRITES); await t.page.waitForTimeout(ms);
				const writes = await f.evaluate(END_WATCH); out.push({ look, screen, writes });
				t.log(`${look} ${screen} WRITES ${JSON.stringify(writes)}`);
			}
			if (t.args.pixels) {
				const dir = path.resolve(String(t.args.pixels)); mkdirSync(dir, { recursive: true });
				// Native full-window images. Stop the existing clock and park running CSS effects; no element is hidden,
				// and Playwright must leave the paused effects alone when capturing (animations: 'allow').
				if (pixelFreeze) {
					// Lane W captures only the stage. Park the app's running effects at their present times and leave
					// its already-held effects untouched; limit W's finish/seek pass to the onboarding subtree.
					await f.evaluate(() => { window.__spOutsideAnims = document.getAnimations().filter((a) => a.effect && a.effect.target && !a.effect.target.closest('#pm-o55-onboarding')).map((a) => ({ a, time: a.currentTime, paused: a.playState === 'paused' })); for (const r of window.__spOutsideAnims) if (!r.paused) { r.a.pause(); r.a.currentTime = r.time; } });
					const options = JSON.stringify({ t: 40, frames: 90, cssT: 1500 });
					await f.evaluate(`(async () => { const original = document.getAnimations; document.getAnimations = function (...args) { return original.apply(this, args).filter((a) => a.effect && a.effect.target && a.effect.target.closest('#pm-o55-onboarding')); }; try { return await (${pixelFreeze})(${options}); } finally { document.getAnimations = original; } })()`);
				}
				else await f.evaluate(() => { O55.motion.setTimeScale(0); window.__spFrozen = []; for (const a of document.getAnimations()) { if (a.playState === 'running') { const tm = a.effect.getComputedTiming(); if (tm.iterations === Infinity) { a.pause(); a.currentTime = 1500; window.__spFrozen.push(a); } else { try { a.finish(); } catch (_) {} } } } });
				const frames = () => f.evaluate(() => new Promise((r) => { let n = 0; const go = () => ++n < 40 ? requestAnimationFrame(go) : r(); requestAnimationFrame(go); }));
				await frames();
				for (const v of variants) {
					const err = await f.evaluate(APPLY, v); if (err) throw new Error(err);
					await frames();
					const pixelCensus = await census(`${look} ${screen} frozen ${v}`);
					await frames();
					for (const suffix of ['a', 'b']) { const file = path.join(dir, `${look}-${screen}-${v.replace(/[^a-z0-9+-]/gi, '_')}-${suffix}.png`); writeFileSync(file, await t.page.screenshot({ animations: 'allow' })); await frames(); }
					out.push({ look, screen, variant: v, boxes: await f.evaluate(BOXES), pixelTrial: await f.evaluate(() => window.__spExtra || null), census: pixelCensus });
					await f.evaluate(UNDO);
				}
				await f.evaluate(() => { O55.motion.setTimeScale(1); const outside = window.__spOutsideAnims || [], byAnim = new Map(outside.map((r) => [r.a, r])); for (const a of [...(window.__spFrozen || []), ...(window.__frzA || [])]) { if (byAnim.has(a) && byAnim.get(a).paused) continue; try { a.play(); } catch (_) {} } for (const r of outside) if (!r.paused) { try { r.a.play(); } catch (_) {} } delete window.__spOutsideAnims; delete window.__spFrozen; window.__frzA = []; });
				if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(out, null, 1));
				continue;
			}
			t.log(`${look} ${screen}: stage ${boxes.stage} svgs ${JSON.stringify(boxes.svgs)} Pip ${boxes.pip} props ${boxes.props} (${boxes.nProps}) dpr ${boxes.dpr}${boxes.asleep ? ' asleep' : ''}`);
			for (const v of variants) {
				const err = await f.evaluate(APPLY, v);
				if (err) { t.log(`${look} ${screen} ${v}: NOTE ${err}`); await f.evaluate(UNDO); continue; }
				await t.page.waitForTimeout(700);
				let variantWrites = null;
				if (t.args.variantWrites) { await f.evaluate(WATCH_WRITES, String(t.args.variantWrites)); await t.page.waitForTimeout(ms); variantWrites = await f.evaluate(END_WATCH); t.log(`${look} ${screen} ${v} VARIANT WRITES ${JSON.stringify(variantWrites)}`); }
				let x = null, names = [], e = '', pf = null;
				let invalidations = null;
				try { const ev = String(t.args.invalidations || '') === '1' ? await invalidationTrace(cdp, ms) : await traceEvents(cdp, { ms }); if (keep) writeFileSync(path.join(keep, `${look}-${screen}-${v.replace(/[^a-z0-9+-]/gi, '_')}.json`), JSON.stringify(ev)); x = summarise(ev, { url: f.url() }); names = selfByName(ev, x.renderer, PAINT).map(([n, us]) => [n, Math.round(us / 1000 / x.secs * 10) / 10]); pf = pacFrames(ev, x.renderer); if (String(t.args.invalidations || '') === '1') { const inv = ev.filter((e) => /InvalidationTracking/.test(e.name)); const groups = new Map(); for (const e of inv) { const k = JSON.stringify([e.name, e.args?.data?.nodeName, e.args?.data?.reason, e.args?.data?.nodeId]); const r = groups.get(k) || { n: 0, example: e }; r.n++; groups.set(k, r); } invalidations = [...groups.values()].sort((a, b) => b.n - a.n); } } catch (er) { e = String(er && er.message || er); }
				const drops = /^(only|freeze):/.test(v) ? await f.evaluate(DROPS) : '';
				const ly = String(t.args.layers ?? '1') === '0' ? { skipped: true } : await layers().catch((er) => ({ error: String(er) }));
				const variantCensus = String(t.args.variantCensus || '') === '1' ? await census(`${look} ${screen} ${v}`) : null;
				const extra = await f.evaluate(() => window.__spExtra || null);
				await f.evaluate(UNDO);
				const n = (k) => Math.round((x && x.split[k]) || 0);
				const fr = x ? Math.max(1, x.mainFrames.renderedPerSec || x.mainFrames.perSec) : 1;
				const row = { look, screen, variant: v, boxes, pac: pf, drops, extra, invalidations, variantWrites, census: variantCensus, trace: x && { main: x.cost.main, split: x.split, raster: x.cost.raster, gpu: x.cost.gpuMain, viz: x.cost.viz, frames: x.mainFrames, drawn: x.drawn, style: x.style, layoutPerSec: x.layoutPerSec }, paintNames: names, layers: ly, error: e || undefined };
				out.push(row);
				if (x) t.log(`${look} ${screen} ${v.padEnd(12)}: main ${Math.round(x.cost.main)} ms/s | paint ${n('paint')} (${(n('paint') / fr).toFixed(2)} ms/frame) prepaint ${n('prepaint')} layerize ${n('layerize')} commit ${n('commit')} style ${n('style')} layout ${n('layout')} script ${n('script')} | raster ${Math.round(x.cost.raster)} gpu ${Math.round(x.cost.gpuMain)} viz ${Math.round(x.cost.viz)} | frames ${x.mainFrames.perSec}/s (rendered ${x.mainFrames.renderedPerSec}) drawn ${x.drawn.perSec}/s | paint by name: ${names.map(([k, v]) => `${k} ${v}`).join(', ')}`);
				else t.log(`${look} ${screen} ${v}: NOTE trace failed: ${e}`);
				if (pf) t.log(`${look} ${screen} ${v.padEnd(12)}: main frames ${pf.frames}: full PAC Update ${pf.full}, repaint-only ${pf.repainted}, no PAC ${pf.none}, nothing to update ${pf.noUpdates} | names ${JSON.stringify(pf.names)}${pf.args.length ? ' | args ' + pf.args.join(' ; ') : ''}${drops ? ' | dropped writes: ' + drops : ''}`);
				if (ly && ly.skipped) { /* --set layers=0 */ }
				else if (ly && !ly.error) t.log(`${look} ${screen} ${v.padEnd(12)}: layers ${ly.drawn} drawn of ${ly.n}; painted again: ${ly.repainted.map((r) => `${r.paintsPerSec}/s ${r.w}x${r.h}@${r.x},${r.y} ${r.node}`).join(' | ') || 'none'}; layerPainted: ${typeof ly.layerPainted === 'string' ? ly.layerPainted : ly.layerPainted.map((p) => `${p.id} ${p.perSec}/s ${p.areaPerPaint} px a paint (max ${p.max})`).join(' | ')}`);
				else t.log(`${look} ${screen} ${v}: NOTE layers: ${ly && ly.error}`);
				if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(out, null, 1));
			}
		}
	}
	await cdp.detach().catch(() => {});
	if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(out, null, 1));
	await t.check('stage paint rows written', out.length > 0, String(out.length));
}
