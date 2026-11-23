// Pip's stage at rest builds no node and writes no value twice (pm7-perf lane W, 2026-11-15: steps 1, 3 and 4 of the
// stage's rest plan, share puppet-master/2026-11-11-pm7-performance/followups/W2-onboarding-rest.md).
//
// At rest the onboarding window's stage still draws every frame (Stage.loop, js/58-rig.js): Pip sways and breathes for
// as long as the window is open. On main d69850c150 each of those draws wrote Friendly's and Glass's floor shadows,
// Basic's protractor, plumb line and ruler, and NieR's target brackets anew with innerHTML (new elements to style, lay
// out and paint 119 times a second), wrote attributes with the values they already held (Pip's eyes and blink, every
// prop's transform, opacity and strings), and NieR read its dialogue box's place (getBoundingClientRect) after those
// writes, laying the page out twice in every frame. Owner's PC, 120 Hz: 430 to 660 ms of main thread a second at rest,
// 4,000 to 14,500 style elements a second.
//
// Per look and screen, at rest (the window open, no input since a pointer journey that wakes Pip past Welcome, Pip's
// line typed and its props settled; on Welcome Pip asleep, as it is first seen), two windows of
// --set ms (default 3000) ms each: a DevTools trace (nothing added to the page), then an observer of the check's own on
// the stage's root, with the stage's render() counted (its drawn frames). Judged:
//   nodes    no node is created in the stage: no element or text node is added that was not in it when the window
//            began, outside its particles (.pst-fx: Pip's sleeping z's, about one every 0.9 s on Welcome) and Retro
//            Dark's phosphor trail (.pst-trail: copies of Pip while it moves), which are logged. A target change's
//            word resets do not count: the HUD target word and the bracket label replace their text nodes in the
//            record that removes the old words, and the kept bracket parts are not new nodes
//            (PM7PERF-ONBREST-NIER-LABEL-NODES-FLAP; helpers/onb-rest-created.mjs). A failure names the nodes created;
//   same     no attribute or text is written with the value it already held (at most --set same=0 a second), outside
//            the speech bubble and Pip's note, which placeBubble and placeTip place (the bubble's data-side is written
//            with the same value in every frame there: logged, not judged; another lane's);
//   writes   at most --set writes (default 22) attribute and text writes per drawn frame of the stage, the same groups
//            (per drawn frame, not per second: Retro draws 10 or 20 times a second, and a 238 Hz display draws up to
//            twice as often as the owner's 120 Hz);
//   layouts  NieR only: at most --set forced (default 0.1) forced layouts per drawn frame (a Layout event inside a script
//            task of the trace: NieR's box measured after the frame's writes). A trace that names no renderer main
//            thread, or that carries no Layout category, measured nothing: could not judge, and the row FAILS
//            (PM7PERF-ONBREST-NO-RENDERER-READS-ZERO; helpers/onb-rest-rows.mjs);
//   counts   the kept nodes stay in step with the stage: Friendly's and Glass's shadows are Pip's and one per placed prop,
//            Basic's protractor its seven parts, NieR's brackets 6 to 9 parts with a target and none without.
//   draw     a second pass after the cost cells (so its inputs never perturb them): the cached draw equals a fresh draw
//            (TOOLS-STAGEREST-K2, opus-review-stagerest's oracle): at frames 0,1,2,4,8,16,30 after each input the stage draws on its caches,
//            its kept nodes are serialised, every cache lane W added is dropped (gShadow.__pt, gHud.__b, hudEl.__tg/__co)
//            and it draws again from scratch at the same stage time; the two must match, and NieR's kept box must equal
//            a fresh boxInScene (nierKey is not dropped: that would heal the box). Inputs: at rest, a note open and
//            closed, a new long line typing and typed, resize across the layout change and back, resize within the
//            layout, a live look switch away and back, Reduced Motion on and off. --set draw=0 leaves the rows out;
//            --set drawFrames= picks the frames (helpers/onb-rest-draw.mjs).
// Before each sample (the trace, then the observer) the cell must be at rest as it says (PM7PERF-ONBREST-AWAKE-NOT-
// ASSERTED): Pip awake past Welcome (the stage's sleepZ off and its pose not asleep) and asleep on Welcome; its line typed
// and every prop in and settled; and its pose settled: no hop under way, no passing feeling on show (the wake's alert and
// happy), the hand within its sway (and NieR's bob) of its spot, not still rising from the floor. The stage is polled for
// that (up to 10 s before the trace, 5 s before the observer); a cell that never gets there FAILS as could not judge
// and is not measured, and after the observer Pip must still be as it was asked. --set journey=0 leaves out the
// pointer journey (a negative: Pip sleeps on past Welcome and those cells must fail).
// Logged per cell: main thread ms a second, style elements a second, layouts and forced layouts a second, forced style
// recalcs a second, main frames a second, the stage's draws a second and its writes by group.
// --set looks= (default all ten; `dark` the five Dark looks) --set screens= (default welcome,where,ready)
// --set settle= (default 20000) --set viewSettle= (default 6000) --set ms= --set same= --set writes= --set forced= --set draw=0 --set drawFrames=
// --set journey=0
// Both surfaces. About 11 minutes with the defaults (the draw rows add about 4).
import { traceEvents, summarise } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { forcedLayoutRow } from '../helpers/onb-rest-rows.mjs';
import { createdAdded } from '../helpers/onb-rest-created.mjs';
import { DRAW_WATCH } from '../helpers/onb-rest-draw.mjs';

const ALL = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCRIPT = new Set(['FireAnimationFrame', 'FunctionCall', 'TimerFire', 'EventDispatch', 'RunMicrotasks', 'FireIdleCallback', 'v8.callFunction', 'V8.Execute']);

// Layouts and style recalcs run inside a script task (forced by a read after a write), on the page's main thread
function forcedWork(events, renderer) {
	if (!renderer) return { layouts: 0, styles: 0 };
	const evs = [], open = [];
	for (const e of events) {
		if (e.pid !== renderer.pid || e.tid !== renderer.tid || typeof e.name !== 'string') continue;
		if (e.ph === 'X') evs.push({ name: e.name, ts: e.ts, end: e.ts + (e.dur || 0) });
		else if (e.ph === 'B') open.push(e);
		else if (e.ph === 'E') { const b = open.pop(); if (b) evs.push({ name: b.name, ts: b.ts, end: e.ts }); }
	}
	evs.sort((a, b) => a.ts - b.ts || b.end - a.end);
	const stack = []; let layouts = 0, styles = 0;
	for (const e of evs) {
		while (stack.length && stack[stack.length - 1].end <= e.ts) stack.pop();
		const inScript = stack.some((s) => SCRIPT.has(s.name));
		if (inScript && e.name === 'Layout') layouts++;
		if (inScript && e.name === 'UpdateLayoutTree') styles++;
		stack.push(e);
	}
	return { layouts, styles };
}

// In the page: count the stage's writes on its root and its draws
// (exported for tools/onb-rest-arm.selftest.mjs, which runs it against a stub stage)
export const ARM = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.root || typeof st.render !== 'function') return 'no stage (#pm-o55-onboarding .o55-stage with its __pipStage)';
	if (window.__onbr) { window.__onbr.mo.disconnect(); window.__onbr.unwrap(); }
	const root = st.root, seen = new WeakSet(), groupOfEl = new WeakMap();
	const walk = (n, f) => { f(n); for (let c = n.firstChild; c; c = c.nextSibling) walk(c, f); };
	walk(root, (n) => seen.add(n));
	// NieR's bracket parts are made once and kept in gHud.__b (54-art-nier.js): a target change takes them out and
	// puts them back in their place; they are not new nodes even when detached at arm time. R124 F4-2: seed each
	// part's subtree too, not only the part: show(8, true) re-inserts __b[8] with the text node it already had, and
	// that old text is not created (the label can be detached at arm time in a fly-in or when the target hides it).
	if (st.gHud && st.gHud.__b) for (const p of st.gHud.__b) walk(p, (n) => seen.add(n));
	const desc = (e) => { if (!e || e.nodeType !== 1) return e && e.parentElement ? desc(e.parentElement) + ' text' : '(detached)'; const c = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || ''; return e.tagName.toLowerCase() + (c.trim() ? '.' + c.trim().split(/\s+/).slice(0, 2).join('.') : ''); };
	const GROUPS = [['shadows', '.pst-shadows'], ['hud', '.pst-hud'], ['fx', '.pst-fx'], ['trail', '.pst-trail'], ['props', '.pst-props, .pst-pstr'], ['pip', '.pst-pip'], ['bubble', '.pst-bubble'], ['tip', '.pst-tip'], ['hudhtml', '.pst-hudhtml'], ['terrain', '.pst-terrain'], ['back', '.pst-back']];
	const groupOf = (n) => {
		const e = n && (n.nodeType === 1 ? n : n.parentElement); if (!e) return 'detached';
		let g = groupOfEl.get(e); if (g) return g;
		g = 'other'; for (const [k, sel] of GROUPS) if (e.closest(sel)) { g = k; break; }
		groupOfEl.set(e, g); return g;
	};
	const W = window.__onbr = { st, attrs: [], text: [], childRecords: [], lists: {}, renders: 0, t0: performance.now() };
	const take = (list) => {
		for (const r of list) {
			if (r.type === 'childList') {
				const g = groupOf(r.target);
				W.lists[g] = (W.lists[g] || 0) + 1;
				// a target change re-sets the target's words: the HUD target word (b.pst-target, hudTarget) and the
				// bracket label (gHud.__b[8], renderBrackets' innerHTML) each replace their text node in one record
				// that removes the old words; the decision is helpers/onb-rest-created.mjs, on this side of the wire,
				// and it compares the words: R124 F4-1, a page that re-creates the same text every frame is not a change
				const b = st.gHud && st.gHud.__b, label = b && b[8], word = st.hudEl && st.hudEl.querySelector('.pst-target');
				const under = (el) => !!el && (el === r.target || (el.contains && el.contains(r.target)));
				const textOf = (nodes) => [...nodes].map((n) => n.textContent || '').join('');
				const reset = r.removedNodes.length > 0 && (under(label) || under(word)) ? { removedText: textOf(r.removedNodes), addedText: textOf(r.addedNodes) } : null;
				const added = [];
				r.addedNodes.forEach((n) => walk(n, (m) => { added.push({ text: m.nodeType === 3, seen: seen.has(m), desc: desc(m) }); seen.add(m); }));
				W.childRecords.push({ g, reset, added });
			} else if (r.type === 'attributes') W.attrs.push([r.target, r.attributeName, r.oldValue, groupOf(r.target)]);
			else W.text.push([r.target, r.oldValue, groupOf(r.target)]);
		}
	};
	W.take = take;
	W.mo = new MutationObserver(take);
	W.mo.observe(root, { subtree: true, childList: true, attributes: true, attributeOldValue: true, characterData: true, characterDataOldValue: true });
	const own = Object.prototype.hasOwnProperty.call(st, 'render'), orig = st.render;
	st.render = function () { W.renders++; return orig.apply(this, arguments); };
	W.unwrap = () => { if (own) st.render = orig; else delete st.render; };
	return '';
};

const READ = () => {
	const W = window.__onbr; if (!W) return null;
	W.take(W.mo.takeRecords()); W.mo.disconnect(); W.unwrap(); delete window.__onbr;
	const secs = (performance.now() - W.t0) / 1000;
	const desc = (e) => { if (!e || e.nodeType !== 1) return e && e.parentElement ? desc(e.parentElement) + ' text' : '(detached)'; const c = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || ''; return e.tagName.toLowerCase() + (c.trim() ? '.' + c.trim().split(/\s+/).slice(0, 2).join('.') : ''); };
	const writes = {}, same = {}, eg = {}, next = new Map();
	const bump = (m, g) => { m[g] = (m[g] || 0) + 1; };
	for (let i = W.attrs.length - 1; i >= 0; i--) {
		const [e, a, old, g] = W.attrs[i];
		let m = next.get(e); if (!m) next.set(e, m = new Map());
		const after = m.has(a) ? m.get(a) : e.getAttribute(a);
		m.set(a, old); bump(writes, g);
		if (after === old) { bump(same, g); const k = desc(e) + ' @' + a; eg[g] = eg[g] || {}; eg[g][k] = (eg[g][k] || 0) + 1; }
	}
	for (let i = W.text.length - 1; i >= 0; i--) {
		const [n, old, g] = W.text[i];
		let m = next.get(n); if (!m) next.set(n, m = new Map());
		const after = m.has('#text') ? m.get('#text') : n.data;
		m.set('#text', old); bump(writes, g);
		if (after === old) { bump(same, g); const k = desc(n); eg[g] = eg[g] || {}; eg[g][k] = (eg[g][k] || 0) + 1; }
	}
	return { secs, renders: W.renders, childRecords: W.childRecords, lists: W.lists, writes, same, eg };
};

// The kept nodes against what the stage shows
const COUNTS = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st) return null;
	const f = st.famName, placed = [...st.props.values()].filter((p) => p.pos).length;
	if (f === 'friendly' || f === 'glass') return { what: 'floor shadows', ok: st.gShadow.childElementCount === 1 + placed, got: st.gShadow.childElementCount, want: `${1 + placed} (Pip and ${placed} placed props)` };
	if (f === 'basic') { const want = st.L.w > 300 ? 7 : 6; return { what: 'protractor, plumb line and ruler parts', ok: st.gShadow.childElementCount === want, got: st.gShadow.childElementCount, want: String(want) }; }
	if (f === 'nier') { const pr = st.target && st.props.get(st.target), n = st.gHud.childElementCount, on = !!(pr && pr.pos); return { what: 'target bracket parts', ok: on ? n >= 6 && n <= 9 : n === 0, got: n, want: on ? `6 to 9 (target ${st.target})` : '0 (no target)' }; }
	return { what: 'nothing kept (Retro)', ok: true, got: 0, want: '0' };
};

// In the page: is Pip asleep, its line typed, its props settled, and its pose at rest (exported for
// tools/onb-rest-pose.selftest.mjs, which runs it against a stub stage). The hand's spot is where Stage.step springs it
// (58-rig.js): ps.Ct, less the lift, plus a sway of up to fam.sway across and NieR's bob of up to 0.6 fam.bob; a hand
// further off than its sway and bob and 3 units is still on its way there (rising as Pip wakes, or a move).
export const POSE = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.ps || !st.ps.C || !st.ps.Ct) return null;
	const ps = st.ps, F = st.fam || {}, num = (v) => (typeof v === 'number' && isFinite(v) ? v : 0), r2 = (v) => Math.round(v * 100) / 100;
	let propsOut = 0; for (const p of st.props ? st.props.values() : []) if (p.state === 'out' || !p.settled) propsOut++;
	const dx = num(ps.C.x) - num(ps.Ct.x), dy = num(ps.C.y) - (num(ps.Ct.y) - num(ps.lift));
	const band = [Math.abs(num(F.sway)) + 3, Math.abs(num(F.bob)) * .6 + 3];
	const feeling = !st.moodOverride || num(st.t) > num(st.moodUntil);
	return {
		asleep: !!st.sleepZ || !!ps.asleep, sleepZ: !!st.sleepZ, poseAsleep: !!ps.asleep,
		line: !(st.bubble && st.bubble.classList && st.bubble.classList.contains('typing')), propsOut,
		hop: Math.abs(num(ps.dy)) < 1 && Math.abs(num(ps.dyv)) < 20, dyHop: r2(num(ps.dy)), dyv: r2(num(ps.dyv)),
		feeling, mood: feeling ? null : String(st.moodOverride),
		hand: Math.abs(dx) <= band[0] && Math.abs(dy) <= band[1], off: [r2(dx), r2(dy)], band: band.map(r2),
		t: r2(num(st.t))
	};
};

// A POSE reading against what the cell wants (want: 'asleep' on Welcome, else 'awake'): { ok, why }
export function restVerdict(r, want) {
	if (!r) return { ok: false, why: 'no stage to read (#pm-o55-onboarding .o55-stage with its __pipStage and its pose)' };
	const why = [];
	if (want === 'awake' && r.asleep) why.push(`Pip asleep, want awake (sleepZ ${r.sleepZ}, pose asleep ${r.poseAsleep})`);
	if (want === 'asleep' && !r.asleep) why.push('Pip awake, want asleep (Welcome before any arrival)');
	if (!r.line) why.push("Pip's line still typing");
	if (r.propsOut) why.push(`${r.propsOut} prop(s) not in and settled`);
	if (!r.hop) why.push(`a hop under way (dy ${r.dyHop}, dyv ${r.dyv})`);
	if (!r.feeling) why.push(`a passing feeling on show (${r.mood})`);
	if (!r.hand) why.push(`the hand ${r.off.join(', ')} from its spot, more than its sway and bob (${r.band.join(', ')})`);
	return { ok: !why.length, why: why.length ? why.join('; ') : `${r.asleep ? 'asleep' : 'awake'} and settled (hand ${r.off.join(', ')} within ${r.band.join(', ')}, t ${r.t})` };
}

// Poll POSE until restVerdict holds or ms pass; the last reading and its verdict
async function restWait(f, want, ms) {
	const end = Date.now() + ms; let r = null, v = null;
	for (;;) {
		r = await f.evaluate(POSE).catch(() => null); v = restVerdict(r, want);
		if (v.ok || Date.now() >= end) return { r, v };
		await new Promise((res) => setTimeout(res, 250));
	}
}

export default async function (t) {
	const lookArg = String(t.args.looks || 'all');
	const looks = lookArg === 'all' ? ALL : lookArg === 'dark' ? ALL.filter((l) => l.endsWith('-dark')) : lookArg.split(',').filter(Boolean);
	const screens = String(t.args.screens || 'welcome,where,ready').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 3000), sameMax = Number(t.args.same ?? 0), writesMax = Number(t.args.writes ?? 22), forcedMax = Number(t.args.forced ?? 0.1);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const cdp = await t.page.context().newCDPSession(t.page);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screens[0] + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, open ? screens[0] : 'no #pm-o55-onboarding .o55-win after 60 s: could not judge');
	if (!open) return;
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 20000));
	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		await t.check(`${look}: the look is applied in the window`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme') + ', NieR ' + document.documentElement.getAttribute('data-o55-nier')));
		if (!ok) continue;
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		for (const screen of screens) {
			const at = await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, screen);
			if (at !== screen) { await t.check(`${look} ${screen}: the screen opened`, false, String(at)); continue; }
			/* Welcome puts Pip to sleep until a real arrival (59-cheer.js wake), and it sleeps on through the later screens
			   until one: past Welcome a pointer journey over the window wakes it, then the pointer rests off the window */
			const want = screen === 'welcome' ? 'asleep' : 'awake';
			if (screen !== 'welcome' && t.args.journey !== '0' && t.args.journey !== 0) {
				await t.page.waitForTimeout(1200);
				for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
				await t.page.mouse.move(W - 6, Math.round(H / 2));
			}
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			const cell = `${look} ${screen}`;
			// Pip as the cell says (awake past Welcome, asleep on it) and at rest, before the trace
			const pre = await restWait(f, want, 10000);
			t.log(`${cell}: before the trace: ${pre.v.why}`);
			if (!pre.v.ok) { await t.check(`${cell}: Pip ${want} and at rest before the trace sample`, false, `${pre.v.why} 16 s after the screen opened: could not judge`); continue; }
			// the trace first, with nothing of the check's in the page
			let x = null, fw = null, err = '';
			try { const ev = await traceEvents(cdp, { ms }); x = summarise(ev, { url: f.url() }); fw = forcedWork(ev, x.renderer); } catch (e) { err = String(e && e.message || e); }
			// then the observer, with the stage's draws counted: Pip still as the cell says and at rest first
			const mid = await restWait(f, want, 5000);
			t.log(`${cell}: before the observer: ${mid.v.why}`);
			if (!mid.v.ok) { await t.check(`${cell}: Pip ${want} and at rest before each sample`, false, `before the observer: ${mid.v.why}: could not judge`); continue; }
			const armed = await f.evaluate(ARM);
			if (armed) { await t.check(`${cell}: the stage could be watched`, false, armed + ': could not judge'); continue; }
			await t.page.waitForTimeout(ms);
			const r = await f.evaluate(READ);
			const counts = await f.evaluate(COUNTS);
			const post = await f.evaluate(POSE).catch(() => null);
			const stayed = !!post && post.asleep === (want === 'asleep');
			await t.check(`${cell}: Pip ${want} and at rest before each sample, and still ${want} after`, stayed, `before the trace and the observer: ${want} and at rest; after: ${post ? (post.asleep ? 'asleep' : 'awake') : 'no stage'}${stayed ? '' : ': could not judge'}`);
			if (!stayed) continue;
			if (!r || !(r.secs > 1)) { await t.check(`${cell}: the stage was watched`, false, 'no reading: could not judge'); continue; }
			const per = (n) => (n / r.secs).toFixed(1), sum = (m, skip) => Object.entries(m).filter(([g]) => !skip.includes(g)).reduce((a, [, v]) => a + v, 0);
			const list = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([g, v]) => `${g} ${per(v)}`).join(', ') || 'none';
			const drawsPerSec = r.renders / r.secs;
			// which added nodes count as created (the word-reset exclusion), and which they were for a failure
			const created = {}, createdEg = {};
			for (const rec of r.childRecords) for (const n of createdAdded(rec)) { created[rec.g] = (created[rec.g] || 0) + 1; const eg = createdEg[rec.g] || (createdEg[rec.g] = {}); eg[n.desc] = (eg[n.desc] || 0) + 1; }
			if (x) t.log(`${cell}: main ${Math.round(x.cost.main)} ms/s (script ${x.split.script || 0}, style ${x.split.style || 0}, layout ${x.split.layout || 0}, paint ${x.split.paint || 0}, layerize ${x.split.layerize || 0}, PAC ${x.split.pac || 0} [full ${x.pac.full}, repainted ${x.pac.repainted}]), style ${x.style.elementsPerSec} elements/s, layouts ${x.layoutPerSec}/s, forced layouts ${(fw.layouts / x.secs).toFixed(1)}/s, forced style ${(fw.styles / x.secs).toFixed(1)}/s, main frames ${x.mainFrames.perSec}/s (rendered ${x.mainFrames.renderedPerSec})`);
			else t.log(`${cell}: NOTE the trace failed (${err}); the observer's rows are still judged`);
			t.log(`${cell}: the stage drew ${drawsPerSec.toFixed(1)} frames/s; created a second: ${list(created)}; child lists a second: ${list(r.lists)}; writes a second: ${list(r.writes)}; same-value writes a second: ${list(r.same)}`);
			for (const [g, m] of Object.entries(r.eg)) t.log(`${cell}: same-value writes in ${g}: ${Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${per(v)}/s`).join(', ')}`);
			if (!(r.renders > 0)) { await t.check(`${cell}: the stage drew while watched`, false, '0 draws: could not judge'); continue; }
			const createdCount = sum(created, ['fx', 'trail']);
			const egText = Object.entries(createdEg).filter(([g]) => g !== 'fx' && g !== 'trail').map(([g, m]) => `${g}: ${Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} x${v}`).join(', ')}`).join('; ');
			await t.check(`${cell}: the stage creates no node at rest (outside its particles and phosphor trail)`, createdCount === 0, `${createdCount} nodes in ${r.secs.toFixed(1)} s: ${list(Object.fromEntries(Object.entries(created).filter(([g]) => g !== 'fx' && g !== 'trail')))}${egText ? ' [' + egText + ']' : ''}; particles and trail ${per((created.fx || 0) + (created.trail || 0))}/s`);
			const same = sum(r.same, ['bubble', 'tip']) / r.secs;
			await t.check(`${cell}: no attribute or text of the stage is written with the value it already held (at most ${sameMax} a second, outside the bubble and the note)`, same <= sameMax, `${same.toFixed(1)} a second: ${list(Object.fromEntries(Object.entries(r.same).filter(([g]) => g !== 'bubble' && g !== 'tip')))}; bubble and note ${per((r.same.bubble || 0) + (r.same.tip || 0))}/s (logged)`);
			const perDraw = sum(r.writes, ['bubble', 'tip']) / r.renders;
			await t.check(`${cell}: at most ${writesMax} attribute and text writes per drawn frame of the stage (outside the bubble and the note)`, perDraw <= writesMax, `${perDraw.toFixed(1)} a draw over ${r.renders} draws (${per(sum(r.writes, ['bubble', 'tip']))}/s)`);
			if (fam === 'nier') {
				if (!x) await t.check(`${cell}: forced layouts could be read`, false, `trace failed: ${err}: could not judge`);
				else {
					const row = forcedLayoutRow({ summary: x, forced: fw, drawsPerSec, max: forcedMax });
					await t.check(`${cell}: at most ${forcedMax} forced layouts per drawn frame`, row.ok, row.detail);
				}
			}
			await t.check(`${cell}: the stage's kept ${counts ? counts.what : 'nodes'} match what it shows`, !!counts && counts.ok, counts ? `${counts.got}, want ${counts.want}` : 'no stage');
		}
	}
	// The cached draw against a fresh draw (TOOLS-STAGEREST-K2), in a second pass after every cost cell above: the
	// oracle's inputs (resize, live look switch, Reduced Motion) can park the stage's loop, which would read as 0 draws
	// in a later cost cell. The oracle draws on demand (render()), so it judges a parked stage too; the cost cells stay
	// unperturbed. Each look is re-applied and opened at the last screen, awake and settled, before the inputs.
	if (String(t.args.draw ?? '1') !== '0') {
		const dframes = String(t.args.drawFrames || '0,1,2,4,8,16,30').split(',').map(Number);
		const lastScreen = screens[screens.length - 1];
		const dwant = lastScreen === 'welcome' ? 'asleep' : 'awake';
		for (const look of looks) {
			const [fam0, mode0] = look.split('-');
			await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam0, mode0]);
			await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam0, mode0], { timeout: 20000 }).catch(() => {});
			await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
			await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { /* judged below */ } }, lastScreen);
			if (lastScreen !== 'welcome' && t.args.journey !== '0' && t.args.journey !== 0) {
				await t.page.waitForTimeout(1200);
				for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
				await t.page.mouse.move(W - 6, Math.round(H / 2));
			}
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			const watch = async (label, expect) => {
				const r = await f.evaluate(DRAW_WATCH, expect ? Object.assign({ frames: dframes }, expect) : dframes);
				await t.check(`${look} ${label}: the cached draw equals a fresh draw (${r.fam}, ${r.layout}, ${r.checks} draws, ${r.boxes} NieR boxes)`, r.nbad === 0 && r.checks > 0, r.nbad ? `${r.nbad} differences: ${r.bad.join(' || ')}` : 'same');
			};
			const checkStill = async (label) => {
				await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return !!st && st.reduced && !st.raf; }, null, { timeout: 600 }).catch(() => {});
				const read = () => {
					const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					const head = st && st.gHead ? st.gHead.getAttribute('transform') : null;
					const app = !!(window.O55 && O55.motion && O55.motion.reduced && O55.motion.reduced());
					const media = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
					const attr = document.documentElement.getAttribute('data-motion') === 'reduced';
					return { app, media, attr, reduced: !!(st && st.reduced), dom: st && st.root ? st.root.dataset.reduced : null, still: !!(st && st.still && st.still()), raf: st ? st.raf || 0 : null, head };
				};
				const s0 = await f.evaluate(read);
				await t.page.waitForTimeout(350);
				const s1 = await f.evaluate(read);
				const ok = s0.app && s0.reduced && s0.dom === '1' && s0.still && s0.raf === 0 && s1.reduced && s1.dom === '1' && s1.still && s1.raf === 0 && s0.head === s1.head;
				await t.check(`${look} ${label}: live Reduced Motion parks the mounted stage and holds Pip still`, ok, `t0=${JSON.stringify(s0)} t1=${JSON.stringify(s1)}`);
			};
			const dw = await restWait(f, dwant, 10000);
			t.log(`${look} draw oracle: before the inputs: ${dw.v.why}`);
			if (!dw.v.ok) { await t.check(`${look}: the draw oracle's cell is at rest`, false, `${dw.v.why}: could not judge`); continue; }
			await watch('at rest');
			await f.evaluate(() => { document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.tip({ id: 'onbr-draw-tip', title: 'A note', text: 'What this choice means, in a few words.' }); });
			await watch('note open');
			await f.evaluate(() => { document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.tip(null); });
			await watch('note closed');
			await f.evaluate(() => { document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.say('A longer line now, one that takes two or three lines in the box so the box grows taller than it was before.', null, false); });
			await watch('new long line');
			await t.page.waitForTimeout(3000);
			await watch('long line typed');
			await t.viewport(740, 900); await watch('resized to 740 (the layout change)');
			await t.page.waitForTimeout(800);
			await t.viewport(W, H); await watch('back to 1920');
			await t.page.waitForTimeout(800);
			await t.viewport(1280, H - 120); await watch('resized within the layout');
			await t.viewport(W, H); await watch('back again');
			await t.page.waitForTimeout(800);
			const painted = (fm, m) => f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fm, m], { timeout: 20000 }).then(() => true, () => false);
			await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam0, mode0 === 'light' ? 'dark' : 'light']);
			await painted(fam0, mode0 === 'light' ? 'dark' : 'light');
			await watch('live look switch away');
			await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam0, mode0]);
			await painted(fam0, mode0);
			await t.page.waitForTimeout(1500);
			await watch('live look switch back');
			try {
				await t.emulate({ reducedMotion: 'reduce' }); await t.page.waitForTimeout(500);
				await checkStill('Reduced Motion on');
				await watch('Reduced Motion on', { reduced: true, media: true });
				await t.emulate({ reducedMotion: 'no-preference' }); await t.page.waitForTimeout(500);
				await watch('Reduced Motion off', { reduced: false, media: false });
				await f.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduced')); await t.page.waitForTimeout(500);
				await checkStill('app Reduced Motion on');
				await watch('app Reduced Motion on', { reduced: true, attr: true });
				await f.evaluate(() => document.documentElement.removeAttribute('data-motion')); await t.page.waitForTimeout(500);
				await watch('app Reduced Motion off', { reduced: false, attr: false });
			} finally {
				await t.emulate({ reducedMotion: null }).catch(() => {});
				await f.evaluate(() => document.documentElement.removeAttribute('data-motion')).catch(() => {});
			}
		}
	}
	await cdp.detach().catch(() => {});
}
