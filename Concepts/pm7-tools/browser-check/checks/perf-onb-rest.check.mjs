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
//            Dark's phosphor trail (.pst-trail: copies of Pip while it moves), which are logged;
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
// Logged per cell: main thread ms a second, style elements a second, layouts and forced layouts a second, forced style
// recalcs a second, main frames a second, the stage's draws a second and its writes by group.
// --set looks= (default all ten; `dark` the five Dark looks) --set screens= (default welcome,where,ready)
// --set settle= (default 20000) --set viewSettle= (default 6000) --set ms= --set same= --set writes= --set forced=
// Both surfaces. About 7 minutes with the defaults.
import { traceEvents, summarise } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { forcedLayoutRow } from '../helpers/onb-rest-rows.mjs';

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
const ARM = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.root || typeof st.render !== 'function') return 'no stage (#pm-o55-onboarding .o55-stage with its __pipStage)';
	if (window.__onbr) { window.__onbr.mo.disconnect(); window.__onbr.unwrap(); }
	const root = st.root, seen = new WeakSet(), groupOfEl = new WeakMap();
	const walk = (n, f) => { f(n); for (let c = n.firstChild; c; c = c.nextSibling) walk(c, f); };
	walk(root, (n) => seen.add(n));
	const GROUPS = [['shadows', '.pst-shadows'], ['hud', '.pst-hud'], ['fx', '.pst-fx'], ['trail', '.pst-trail'], ['props', '.pst-props, .pst-pstr'], ['pip', '.pst-pip'], ['bubble', '.pst-bubble'], ['tip', '.pst-tip'], ['hudhtml', '.pst-hudhtml'], ['terrain', '.pst-terrain'], ['back', '.pst-back']];
	const groupOf = (n) => {
		const e = n && (n.nodeType === 1 ? n : n.parentElement); if (!e) return 'detached';
		let g = groupOfEl.get(e); if (g) return g;
		g = 'other'; for (const [k, sel] of GROUPS) if (e.closest(sel)) { g = k; break; }
		groupOfEl.set(e, g); return g;
	};
	const W = window.__onbr = { st, attrs: [], text: [], created: {}, lists: {}, renders: 0, t0: performance.now() };
	const take = (list) => {
		for (const r of list) {
			if (r.type === 'childList') {
				const g = groupOf(r.target);
				W.lists[g] = (W.lists[g] || 0) + 1;
				r.addedNodes.forEach((n) => walk(n, (m) => { if (!seen.has(m)) { seen.add(m); W.created[g] = (W.created[g] || 0) + 1; } }));
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
	return { secs, renders: W.renders, created: W.created, lists: W.lists, writes, same, eg };
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

// Pip's line typed, every prop in and settled
const SETTLED = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st) return false;
	if (st.bubble && st.bubble.classList.contains('typing')) return false;
	for (const p of st.props.values()) if (p.state === 'out' || !p.settled) return false;
	return true;
};

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
			if (screen !== 'welcome') {
				await t.page.waitForTimeout(1200);
				for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
				await t.page.mouse.move(W - 6, Math.round(H / 2));
			}
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			const settled = await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).then(() => true, () => false);
			if (!settled) t.log(`${look} ${screen}: NOTE Pip's line or a prop had not settled 16 s after the screen opened; measured as it was`);
			const cell = `${look} ${screen}`;
			// the trace first, with nothing of the check's in the page
			let x = null, fw = null, err = '';
			try { const ev = await traceEvents(cdp, { ms }); x = summarise(ev, { url: f.url() }); fw = forcedWork(ev, x.renderer); } catch (e) { err = String(e && e.message || e); }
			// then the observer, with the stage's draws counted
			const armed = await f.evaluate(ARM);
			if (armed) { await t.check(`${cell}: the stage could be watched`, false, armed + ': could not judge'); continue; }
			await t.page.waitForTimeout(ms);
			const r = await f.evaluate(READ);
			const counts = await f.evaluate(COUNTS);
			if (!r || !(r.secs > 1)) { await t.check(`${cell}: the stage was watched`, false, 'no reading: could not judge'); continue; }
			const per = (n) => (n / r.secs).toFixed(1), sum = (m, skip) => Object.entries(m).filter(([g]) => !skip.includes(g)).reduce((a, [, v]) => a + v, 0);
			const list = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([g, v]) => `${g} ${per(v)}`).join(', ') || 'none';
			const drawsPerSec = r.renders / r.secs;
			if (x) t.log(`${cell}: main ${Math.round(x.cost.main)} ms/s (script ${x.split.script || 0}, style ${x.split.style || 0}, layout ${x.split.layout || 0}, paint ${x.split.paint || 0}, layerize ${x.split.layerize || 0}, PAC ${x.split.pac || 0} [full ${x.pac.full}, repainted ${x.pac.repainted}]), style ${x.style.elementsPerSec} elements/s, layouts ${x.layoutPerSec}/s, forced layouts ${(fw.layouts / x.secs).toFixed(1)}/s, forced style ${(fw.styles / x.secs).toFixed(1)}/s, main frames ${x.mainFrames.perSec}/s (rendered ${x.mainFrames.renderedPerSec})`);
			else t.log(`${cell}: NOTE the trace failed (${err}); the observer's rows are still judged`);
			t.log(`${cell}: the stage drew ${drawsPerSec.toFixed(1)} frames/s; created a second: ${list(r.created)}; child lists a second: ${list(r.lists)}; writes a second: ${list(r.writes)}; same-value writes a second: ${list(r.same)}`);
			for (const [g, m] of Object.entries(r.eg)) t.log(`${cell}: same-value writes in ${g}: ${Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${per(v)}/s`).join(', ')}`);
			if (!(r.renders > 0)) { await t.check(`${cell}: the stage drew while watched`, false, '0 draws: could not judge'); continue; }
			const created = sum(r.created, ['fx', 'trail']);
			await t.check(`${cell}: the stage creates no node at rest (outside its particles and phosphor trail)`, created === 0, `${created} nodes in ${r.secs.toFixed(1)} s: ${list(Object.fromEntries(Object.entries(r.created).filter(([g]) => g !== 'fx' && g !== 'trail')))}; particles and trail ${per((r.created.fx || 0) + (r.created.trail || 0))}/s`);
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
	await cdp.detach().catch(() => {});
}
