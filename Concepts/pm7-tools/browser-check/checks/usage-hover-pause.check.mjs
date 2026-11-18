// Usage pauses hover highlights while the mouse wheel turns (lane V, PERF-USAGE-HOVER, Jared's card A, 2026-11-16).
//
// When the wheel scrolls Usage's board under a resting pointer, cards and rows slide under it. Each one lit up, showed
// its tool buttons and faded again as it passed, and that restyle and repaint made the scroll drop frames. Jared chose
// to pause those highlights while the wheel turns: the board's hover effects are gated (src/css: the in-board :hover
// rules; the shell's hover engine, 18-hover.js, rests for a board with [data-op]); hit-testing is unchanged, so a click
// or a pointer move works as it always did, and the highlight under the resting pointer comes back once the wheel stops.
//
// Per look (default Basic Dark, --set looks=) and surface, TRIES windows (3): the board at its top, the pointer moved
// onto the card at the page's centre (55 % down) and left there until its hover is on (rows R0 below), then TICKS (12)
// real wheel ticks of 40 px, GAP (30) ms apart, downward, and 800 ms with the pointer still. A recorder in the app's
// frame logs each frame (the card under the pointer, the cards carrying the hover engine's light .pmh-on, the hovered
// card's tool cluster opacity) and every transitionrun inside the board, wheel and scroll event.
//   R0  could judge: at rest before the wheel, the card under the pointer is lit (.pmh-on) and shows its tools (opacity
//       above .5): both builds, every look; without it there is nothing to pause.
//   R1  from 50 ms after the first wheel through the marker's removal (including its tail): no hover-in restyle.
//       At least five sampled frames; all cards, existing chart selections and tools after their outgoing fade count.
//       A hover-in restyle is a transition that starts on an element of a card under the pointer at that moment, including
//       the starting card (approved segment/stepper/sharebar transitions excluded), or a frame with an engine/chart light (.pmh-on, or .pmh-near, its light on a card near the pointer). On
//       origin/main bb8cd0e873 (Alexis, Basic Dark) the card that slides in starts its tools', resize corner's and
//       light's transitions and takes .pmh-near: red.
//   R2  after the wheel: within BACK ms (200) of the last wheel or scroll event, the card under the resting pointer
//       carries .pmh-on and its tools visibly show (opacity above .5), with no pointer
//       move. The light's time is when the engine writes .pmh-on (a class observer: a frame sample runs before the
//       engine's frame callback and saw it a frame late, 198-233 ms for a light written at 170). Logged with both times. On origin/main the engine's .pmh-on stays on the card that was under the
//       pointer at rest and scrolled away, and the card under the pointer never gets it without a move: red too.
//   R3  keyboard focus is not paused: a card with keyboard focus keeps its focus ring and its tools while the wheel
//       turns (a guard, green on origin/main too: the board gestures' [data-op] rules hide every card's tools).
//   R4  enter a Skyline provider column, then send a real wheel tick before its 110 ms highlight intent fires. Keep
//       the pointer on that column: no is-hl-dim/is-hl-on while paused, and the provider light returns after op-end.
//       --set raceOnly=1 runs this row alone. On main use --set raceNoPause=1: assert the absence of a pause marker,
//       then explicitly SKIP R4's suppression/return verdicts, which have no pause interval to judge there.
//   R100 wheel from an already-shown provider/donut/column/card state, including a sparse sleeping engine at the
//       scroll limit and a press on a still-visible fading tool. --set chartOnly=1, chartCases=provider,donut,column,engine,tool.
//   R107 wheel over a lit column, leave #pmuScroll within the hold for the toolbar, then stay outside past return.
//       No column/provider/donut/card light may return. --set departureOnly=1 isolates the regression.
//   R112 wheel upward at the top over a lit Skyline provider, M/R on another focused card within the hold, then
//       keep that keyboard gesture past the hold and Escape. No return during the gesture; current provider returns
//       without a pointer move after release. --set keyboardOnly=1 isolates both trusted keyboard paths.
//   R5  keyboard-mount Accounts/Overview mid-burst; live-board marker, tools/rows/light suppression and live return.
//       --set mountOnly=1 isolates R5; --set mountNoPause=1 explicitly skips pause verdicts on main; rm=1 covers the spare.
// A window that did not scroll at least TICKS*40*0.6 px is taken again (twice at most); one still short fails as
// "could not judge".
//   --set looks=basic-dark,glass-dark,retro-dark,nier-dark   --set tries=3   --set ticks=12   --set gap=30
//   --set back=200   --set rm=1 (Reduced Motion)   --set settle=<ms> (20000)   --set dump=<file.json> (every window)
// Bar for this check (test-tool-bar.md, written before its first review): a finding stops work only if it is shown on
// real inputs to pass a build whose cards light up or show their tools while the wheel scrolls them under a resting
// pointer (R1), or to pass a build whose highlight does not come back without a move (R2); anything else goes on
// TOOL-ISSUES.md.
import { writeFileSync } from 'node:fs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { r113Cases } from '../helpers/usage-hover-pause-r113.mjs';

// the recorder, installed once in the app's frame; __uhp.start() clears it and starts a window, __uhp.stop() ends it
const INSTALL = () => {
	if (window.__uhp) return true;
	const sc = document.getElementById('pmuScroll');
	let board = document.getElementById('pmuBoard');
	if (!board) return false;
	const R = window.__uhp = { on: false };
	const cardId = (c) => (c ? c.getAttribute('data-id') || c.getAttribute('data-card') || c.id || String([...board.children].indexOf(c)) : null);
	const cls = (el) => String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || el.tagName).slice(0, 48);
	sc.addEventListener('wheel', () => { if (R.on) R.wheels.push(performance.now()); }, { passive: true, capture: true });
	sc.addEventListener('scroll', () => { if (R.on) R.scrolls.push(performance.now()); }, { passive: true });
	sc.addEventListener('transitionrun', (e) => {
		if (!R.on) return;
		const t = e.target, card = t.closest && t.closest('.pmu-card');
		const under = card && card.matches(':hover');
		const approved = (t.matches?.('.pmu-seg button') && e.propertyName === 'color') || (t.matches?.('.pmu-stepper button') && ['color','background-color'].includes(e.propertyName)) || (t.matches?.('.pmu-sbrow .pmu-sbfill > i') && e.propertyName === 'opacity');
		const exiting = t.classList.contains('pmh-out') && !t.classList.contains('pmh-on') && ['opacity','--pmh-x','--pmh-y'].includes(e.propertyName);
		let from, to;
		if (cardId(card) === R.rest && t.matches('.pmu-cardtools,.pmu-h,.pmu-headtools,.pmu-cardtitles')) {
			try { const a=t.getAnimations().find((a)=>a.transitionProperty===e.propertyName), k=e.propertyName.replace(/-([a-z])/g,(_,v)=>v.toUpperCase()), fs=a?.effect?.getKeyframes();
				if(fs?.length){from=fs[0][k]??fs[0][e.propertyName];to=fs.at(-1)[k]??fs.at(-1)[e.propertyName];} } catch (_) { /* unknown directions remain checked */ }
		}
		R.trans.push({ t: performance.now(), prop: e.propertyName, cls: cls(t), card: cardId(card), under: !!under, approved: !!approved, exiting, from, to, self: !!(t.matches && t.matches(':hover')) });
	}, true);
	const frame = () => {
		if (!R.on) return;
		board = document.getElementById('pmuBoard');
		const hc = board.querySelector(':scope > .pmu-card:hover');
		const tools = hc && hc.querySelector('.pmu-cardtools');
		R.frames.push({ t: performance.now(), top: Math.round(sc.scrollTop), card: cardId(hc), tools: tools ? Math.round(parseFloat(getComputedStyle(tools).opacity) * 100) / 100 : null,
			lit: [...board.querySelectorAll(':scope > .pmu-card.pmh-on')].map(cardId), near: [...board.querySelectorAll(':scope > .pmu-card.pmh-near')].map(cardId),
			op: board.getAttribute('data-op'), highlights: board.querySelectorAll('.is-hl-on,.is-hl-dim,path[data-mark="arc"].is-dim,.pmu-dl-row.is-hot,.pmu-col.is-hot-col').length });
		requestAnimationFrame(frame);
	};
	// frames of 50 ms or more (Chrome's long-animation-frame entries), with their style and layout and their longest
	// scripts, logged around the pause's end
	try {
		new PerformanceObserver((l) => { if (R.on) for (const e of l.getEntries()) R.loaf.push({ t: e.startTime, d: Math.round(e.duration), sl: Math.round(e.styleAndLayoutDuration || 0), scripts: [...(e.scripts || [])].sort((a, b) => b.duration - a.duration).slice(0, 3).map((s) => `${s.invoker || s.invokerType} ${Math.round(s.duration)} ms (forced style/layout ${Math.round(s.forcedStyleAndLayoutDuration || 0)})`) }); }).observe({ type: 'long-animation-frame' });
	} catch (e) { /* no entries in this browser */ }
	// when a card takes or drops the engine's light, timed as the class is written (the frame callbacks above run before
	// the engine's in a frame, so a frame sample sees a light one frame after the frame that drew it)
	new MutationObserver((ms) => {
		if (!R.on) return; const now = performance.now(), live = document.getElementById('pmuBoard');
		for (const m of ms) {
			if (m.target === live && m.attributeName === 'data-op') R.ops.push({t:now,op:live.getAttribute('data-op')});
			if (m.attributeName === 'class' && m.target.parentNode === live && m.target.classList.contains('pmu-card')) R.cls.push({ t: now, card: cardId(m.target), on: m.target.classList.contains('pmh-on') });
		}
	}).observe(sc, { attributes: true, attributeFilter: ['class','data-op'], subtree: true });
	R.start = () => {
		const tools = document.querySelector('#pmuBoard .pmu-card:hover .pmu-cardtools');
		const fadeMs = tools ? Math.max(...getComputedStyle(tools).transitionDuration.split(',').map((v) => parseFloat(v) * (v.trim().endsWith('ms') ? 1 : 1000))) : 140;
		Object.assign(R, { on: true, frames: [], wheels: [], scrolls: [], trans: [], loaf: [], cls: [], ops: [], fadeMs, rest: cardId(document.querySelector('#pmuBoard .pmu-card:hover')), t0: performance.now() }); requestAnimationFrame(frame);
	};
	R.stop = () => { R.on = false; return { t0: R.t0, frames: R.frames, wheels: R.wheels, scrolls: R.scrolls, trans: R.trans, loaf: R.loaf, cls: R.cls, ops: R.ops, fadeMs: R.fadeMs }; };
	R.state = () => { board = document.getElementById('pmuBoard'); const hc = board.querySelector(':scope > .pmu-card:hover'), tools = hc && hc.querySelector('.pmu-cardtools'); return { card: cardId(hc), lit: !!(hc && hc.classList.contains('pmh-on')), tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null }; };
	return true;
};

// R1 and R2 from one window's record (pure, so the verdict can be read back from a dump)
export function judge(rec, { rest, back }) {
	const first = rec.wheels[0], lastWheel = rec.wheels[rec.wheels.length - 1], lastScroll = rec.scrolls.length ? rec.scrolls[rec.scrolls.length - 1] : lastWheel;
	const end = Math.max(lastWheel, lastScroll);
	const ops = (rec.ops || []).filter((x) => x.t >= first), lastOp = ops.at(-1);
	const pauseEnd = lastOp ? lastOp.op === 'wheel' ? rec.frames.at(-1)?.t ?? end : lastOp.t : end;
	const pauseAt = (t) => {
		for (let i = ops.length - 1; i >= 0; i--) if (ops[i].t <= t) return ops[i].op === 'wheel' ? ops[i].t : null;
		return ops.length ? null : first;
	};
	const during = (x) => { const start = pauseAt(x.t); return start != null && x.t >= start + 50 && x.t < pauseEnd; };
	const active = rec.frames.filter(during);
	const neutralExit = (x) => {
		if(x.card!==rest || x.to==null) return false;
		const cs=x.cls.split(/\s+/);
		if(x.prop==='opacity'&&(cs.includes('pmu-cardtools')||cs.includes('pmu-h'))) return Number(x.from)>0&&Number(x.to)===0;
		if(x.prop==='pointer-events'&&cs.includes('pmu-cardtools')) return x.from==='auto'&&x.to==='none';
		if(x.prop==='margin-right'&&cs.includes('pmu-cardtitles')) return parseFloat(x.from)>0&&parseFloat(x.to)===0;
		return x.prop==='transform'&&cs.includes('pmu-headtools')&&x.from!=='none'&&x.to==='none';
	};
	const ins = rec.trans.filter((x) => during(x) && x.under && !x.approved && !x.exiting && !neutralExit(x));
	const litFrames = active.filter((x) => x.lit.concat(x.near || []).length > 0 || x.highlights > 0);
	const toolFrames = active.filter((x) => x.t >= pauseAt(x.t) + (rec.fadeMs ?? 140) + 50 && x.tools > 0.05);
	// R2: the card under the pointer once the wheel has stopped; its light is back when its .pmh-on is written (or it
	// still had it), its tools when a frame reads them above .5. Transition creation is logged separately.
	const after = rec.frames.filter((x) => x.t > end);
	const target = after.length ? after[after.length - 1].card : null;
	const settled = after.length && after[after.length - 1].lit.includes(target) && after[after.length - 1].tools > 0.5;
	const lastBefore = (rec.cls || []).filter((x) => x.t <= end && x.card === target).pop();
	const litAt = (rec.cls || []).find((x) => x.t > end && x.card === target && x.on);
	const lightT = !settled ? null : litAt ? litAt.t : lastBefore && lastBefore.on ? end : (after.find((x) => x.lit.includes(target)) || {}).t;
	const toolsTr = rec.trans.find((x) => x.t > end && x.card === target && x.prop === 'opacity' && /pmu-cardtools/.test(x.cls));
	const toolsFr = after.find((x) => x.card === target && x.tools > 0.5);
	const toolsT = toolsFr ? toolsFr.t : Infinity;
	const backT = lightT != null && toolsT !== Infinity ? Math.max(lightT, toolsT) : null;
	return {
		r1: { ok: active.length >= 5 && ins.length === 0 && litFrames.length === 0 && toolFrames.length === 0, toolFrames: toolFrames.length, pauseEnd, ins: ins.length, insCards: [...new Set(ins.map((x) => x.card))], insProps: [...new Set(ins.map((x) => x.prop + ' ' + x.cls.split(' ')[0]))].slice(0, 8), litFrames: litFrames.length, frames: rec.frames.filter(during).length, cardsPassed: [...new Set(rec.frames.filter(during).map((x) => x.card).filter(Boolean))].length },
		r2: { ok: backT != null && backT - end <= back, ms: backT != null ? Math.round(backT - end) : null, card: target,
			light: lightT != null ? Math.round(lightT - end) : null, tools: toolsT !== Infinity ? Math.round(toolsT - end) : null, toolsTransition: toolsTr ? Math.round(toolsTr.t - end) : null,
			long: (rec.loaf || []).filter((x) => x.t + x.d > end && x.t < end + 400).map((x) => `+${Math.round(x.t - end)} ms ${x.d} ms (style/layout ${x.sl}: ${x.scripts.join('; ') || 'no script'})`) },
		span: { wheel: Math.round(lastWheel - first), tail: Math.round(lastScroll - lastWheel), wheels: rec.wheels.length, scrolls: rec.scrolls.length }
	};
}

async function providerRace(t, f, label, park) {
	await park();
	const column = f.locator('#pmuBoard .pmu-skycol[data-prov]').first();
	if (!await column.count()) { await t.check(label + 'R4 could judge: a Skyline provider column exists', false); return; }
	await column.scrollIntoViewIfNeeded();
	await t.page.waitForTimeout(500);
	const box = await column.boundingBox(), pane = await f.locator('#pmuScroll').boundingBox();
	if (!box || !pane) { await t.check(label + 'R4 could judge: the Skyline column is visible', false); return; }
	const x = box.x + box.width / 2, top = Math.max(box.y, pane.y), bottom = Math.min(box.y + box.height, pane.y + pane.height);
	const y = (top + bottom) / 2;
	await f.evaluate(() => {
		// R99's room routes can leave the spare first in DOM order; R4 samples the live board too.
		const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
		const r = window.__uhpRace = { enter: null, wheel: null, end: null, pauses: [], during: [], frames: 0, moves: 0, outs: 0, startTop: sc.scrollTop,
			clean: !board.querySelector('.is-hl-dim, .is-hl-on'), marks: board.querySelectorAll('.pmu-mark[data-prov]').length };
		let target = null, running = true;
		const over = (e) => { const el = e.target.closest?.('.pmu-skycol[data-prov]'); if (!target && el && board.contains(el)) { target = el; r.enter = performance.now(); r.id = el.dataset.prov; } };
		const out = (e) => { if (target && target.contains(e.target) && !target.contains(e.relatedTarget)) r.outs++; };
		const wheel = (e) => { r.wheel = performance.now(); r.wx = e.clientX; r.wy = e.clientY; };
		const move = (e) => { if (r.wheel != null && (e.clientX !== r.wx || e.clientY !== r.wy)) r.moves++; };
		const sample = (why) => {
			if (board.getAttribute('data-op') !== 'wheel') return;
			r.frames++;
			const lit = board.querySelectorAll('.is-hl-dim, .is-hl-on');
			if (lit.length) r.during.push({ t: performance.now(), why, dim: board.querySelectorAll('.is-hl-dim').length, on: board.querySelectorAll('.is-hl-on').length });
		};
		const mo = new MutationObserver((ms) => {
			for (const m of ms) if (m.target === board && m.attributeName === 'data-op') {
				if (board.getAttribute('data-op') === 'wheel') r.pauses.push(performance.now());
				else if (r.pauses.length) r.end = performance.now();
			}
			sample('mutation');
		});
		mo.observe(board, { attributes: true, attributeFilter: ['class', 'data-op'], subtree: true });
		const frame = () => { if (!running) return; sample('frame'); requestAnimationFrame(frame); };
		board.addEventListener('pointerover', over, true); board.addEventListener('pointerout', out, true);
		sc.addEventListener('wheel', wheel, { capture: true, passive: true }); sc.addEventListener('pointermove', move, true);
		requestAnimationFrame(frame);
		r.stop = () => {
			running = false; mo.disconnect(); board.removeEventListener('pointerover', over, true); board.removeEventListener('pointerout', out, true);
			sc.removeEventListener('wheel', wheel, true); sc.removeEventListener('pointermove', move, true);
			const dim = [...board.querySelectorAll('.is-hl-dim')], on = [...board.querySelectorAll('.is-hl-on')];
			return { ...r, stop: undefined, top: sc.scrollTop, paused: board.getAttribute('data-op') === 'wheel', targetHovered: !!target?.matches(':hover'),
				eligibleDim: [...board.querySelectorAll('.pmu-mark[data-prov]')].filter((el) => el.dataset.prov !== r.id).length,
				eligibleOn: [...board.querySelectorAll('.pmu-irow[data-prov]')].filter((el) => el.dataset.prov === r.id).length,
				dim: dim.length, on: on.length, correct: dim.every((el) => el.dataset.prov !== r.id) && on.every((el) => el.dataset.prov === r.id) };
		};
	});
	// No round trip between these trusted inputs: the page-side recorder proves their actual interval was under 110 ms.
	await t.page.mouse.move(x, y);
	await t.page.mouse.wheel(0, 12);
	await t.page.waitForTimeout(800);
	const rec = await f.evaluate(() => window.__uhpRace.stop());
	t.log(label + 'R4 provider race: ' + JSON.stringify(rec));
	const gap = rec.enter != null && rec.wheel != null ? rec.wheel - rec.enter : null;
	await t.check(label + 'R4 could judge: enter then wheel within 110 ms, the board scrolls, pointer stays on the same provider',
		rec.clean && rec.eligibleDim + rec.eligibleOn > 0 && gap != null && gap >= 0 && gap < 110 && rec.top > rec.startTop && rec.targetHovered && !rec.moves && !rec.outs,
		`enter-to-wheel ${gap} ms, scroll ${rec.top - rec.startTop} px, hovered ${rec.targetHovered}, moves ${rec.moves}, leaves ${rec.outs}, clean ${rec.clean}, eligible dim/on ${rec.eligibleDim}/${rec.eligibleOn}`);
	if (String(t.args.raceNoPause || '') === '1') {
		await t.check(label + 'R4 main control has no wheel pause to judge', rec.pauses.length === 0);
		t.log(label + 'SKIP R4 suppression/return: explicit raceNoPause control has no wheel pause');
		return rec;
	}
	await t.check(label + 'R4 pending provider highlight cannot start during the wheel pause', rec.pauses.length > 0 && rec.frames > 0 && rec.during.length === 0,
		`${rec.pauses.length} pauses, ${rec.frames} paused samples, ${rec.during.length} lit samples: ${JSON.stringify(rec.during.slice(0, 3))}`);
	await t.check(label + 'R4 provider highlight returns after the pause without moving the pointer', rec.end != null && !rec.paused && rec.targetHovered && rec.eligibleDim + rec.eligibleOn > 0 && rec.dim === rec.eligibleDim && rec.on === rec.eligibleOn && rec.correct,
		`pause end ${rec.end}, paused ${rec.paused}, hovered ${rec.targetHovered}, dim ${rec.dim}, on ${rec.on}, correct provider ${rec.correct}`);
	return rec;
}

// R5 (R99): a trusted keyboard room activation in an ongoing trusted wheel burst. Calibrate the destination's
// row/provider at rest, switch away, then leave the pointer at that exact position while Enter/Space mounts it again.
// Every sample resolves the LIVE board, including Reduce Motion's asynchronous spare-board adoption.
async function roomMountRace(t, f, label, park, rm) {
	const records = [];
	for (const room of ['accounts', 'overview']) {
		for (let attempt = 0; attempt < 3; attempt++) {
		const source = room === 'accounts' ? 'overview' : 'accounts', key = room === 'accounts' ? 'Enter' : 'Space';
		const nav = (r) => f.locator(`#pmuNav .pmu-navbtn[data-room="${r}"]`);
		const choose = async (r) => { await park(); await nav(r).focus(); await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(5000); };
		await choose(room);
		await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 0; });
		const selector = room === 'accounts' ? '.pmu-accrow' : '.pmu-skycol[data-prov]';
		const target = f.locator('#pmuBoard ' + selector).first();
		await target.scrollIntoViewIfNeeded();
		await t.page.waitForTimeout(500);
		const box = await target.boundingBox(), pane = await f.locator('#pmuScroll').boundingBox();
		if (!box || !pane) { await t.check(label + `R5 ${room}: could judge destination target`, false); continue; }
		const at = { x: box.x + box.width / 2, y: (Math.max(box.y, pane.y) + Math.min(box.y + box.height, pane.y + pane.height)) / 2 };
		const baseline = await f.evaluate(() => [...document.querySelectorAll('#pmuBoard .pmu-row, #pmuBoard .pmu-irow')].map((r) => getComputedStyle(r).backgroundColor));
		const destinationTop = await f.evaluate(() => document.getElementById('pmuScroll').scrollTop);
		await choose(source);
		await nav(room).focus();
		await f.evaluate(()=>{window.__uhpMountNeutralRows=new WeakMap();document.querySelectorAll('#pmuScroll .pmu-board .pmu-row,#pmuScroll .pmu-board .pmu-irow,#pmuScroll .pmu-board .pmu-accrow').forEach(row=>window.__uhpMountNeutralRows.set(row,getComputedStyle(row).backgroundColor));});
		await t.page.mouse.move(at.x, at.y, { steps: 4 });
		await t.page.waitForTimeout(500);
		await f.evaluate(({ room, baseline, selector }) => {
			const sc = document.getElementById('pmuScroll'), old = document.getElementById('pmuBoard');
			const r = window.__uhpMount = { room, wheels: [], keys: [], samples: [], ends: [], moves: 0, oldPaused: false, swaps: 0 };
			let running = true, last = old, position = null;
			const live = () => document.getElementById('pmuBoard');
			const wheel = (e) => { r.wheels.push({ t: performance.now(), trusted: e.isTrusted }); position = [e.clientX, e.clientY]; };
			// Native input can mount the room before the next paint; witness the initial hold after its wheel handler.
			const held = () => { if (old.getAttribute('data-op') === 'wheel') r.oldPaused = true; };
			const keydown = (e) => { if (e.key === 'Enter' || e.key === ' ') r.keys.push({ t: performance.now(), key: e.key, trusted: e.isTrusted, room: e.target.dataset.room }); };
			const move = (e) => { if (position && (e.clientX !== position[0] || e.clientY !== position[1])) r.moves++; };
			const end = (e) => r.ends.push({ t: performance.now(), live: e.detail?.board === live(), room: e.detail?.board?.dataset.room });
			const sample = () => {
				if (!running) return;
				const b = live(); if (b !== last) { r.swaps++; last = b; }
				if (old.getAttribute('data-op') === 'wheel') r.oldPaused = true;
				if (b && b.dataset.room === room) {
					const card = b.querySelector(':scope > .pmu-card:hover'), tools = card?.querySelector('.pmu-cardtools');
					const rows = [...b.querySelectorAll('.pmu-row, .pmu-irow')];
					// R116 T1: the outgoing board overlaps the live board and still takes pointer hits.
					const hit=position&&document.elementFromPoint(...position), hitCard=hit?.closest('.pmu-card'), hitBoard=hitCard?.closest('.pmu-board');
					const inPane=!!hitBoard&&sc.contains(hitBoard)&&!hitBoard.hidden, hitTools=inPane&&hitCard.querySelector('.pmu-cardtools');
					let alpha=1;if(inPane)for(let el=hitCard;el&&el!==sc;el=el.parentElement)alpha*=+getComputedStyle(el).opacity;
					const hitRow=inPane&&hit?.closest('.pmu-row,.pmu-irow,.pmu-accrow'), neutral=window.__uhpMountNeutralRows;
					document.querySelectorAll('#pmuScroll .pmu-board .pmu-row,#pmuScroll .pmu-board .pmu-irow,#pmuScroll .pmu-board .pmu-accrow').forEach(row=>{if(!neutral.has(row)&&!row.matches(':hover'))neutral.set(row,getComputedStyle(row).backgroundColor);});
					r.samples.push({ t: performance.now(), op: b.getAttribute('data-op'),
						lit: b.querySelectorAll('.pmh-on, .pmh-near, .is-hl-dim, .is-hl-on').length,
						tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null,
						rows: rows.filter((row, i) => row.matches(':hover') && baseline[i] !== getComputedStyle(row).backgroundColor).length,
						hit:inPane?{room:hitBoard.dataset.room,live:hitBoard===b,ghost:hitBoard.classList.contains('pmu-ghostboard'),op:hitBoard.getAttribute('data-op'),widget:hitCard.dataset.widget,alpha,tools:hitTools?+getComputedStyle(hitTools).opacity*alpha:null,lit:hitCard.querySelectorAll('.pmh-on,.pmh-near').length+Number(hitCard.matches('.pmh-on,.pmh-near')),rows:hitRow&&neutral.has(hitRow)&&neutral.get(hitRow)!==getComputedStyle(hitRow).backgroundColor?1:0}:null });
				}
				requestAnimationFrame(sample);
			};
			sc.addEventListener('wheel', wheel, { capture: true, passive: true }); sc.addEventListener('wheel', held, { passive: true });
			document.addEventListener('keydown', keydown, true); sc.addEventListener('pointermove', move, true);
			document.addEventListener('pmu-op-end', end); requestAnimationFrame(sample);
			r.stop = () => {
				running = false; sc.removeEventListener('wheel', wheel, true); sc.removeEventListener('wheel', held); document.removeEventListener('keydown', keydown, true);
				sc.removeEventListener('pointermove', move, true); document.removeEventListener('pmu-op-end', end);
				const b = live(), card = b?.querySelector(':scope > .pmu-card:hover'), tools = card?.querySelector('.pmu-cardtools');
				const hot = b?.querySelector(selector + ':hover'), id = hot?.dataset.prov;
				const dim = [...(b?.querySelectorAll('.is-hl-dim') || [])], on = [...(b?.querySelectorAll('.is-hl-on') || [])];
				return { ...r, stop: undefined, op: b?.getAttribute('data-op'), liveRoom: b?.dataset.room, oldOp: old.getAttribute('data-op'),
					targetHovered: !!hot, cardLit: !!card?.classList.contains('pmh-on'), tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null,
					provider: { id, dim: dim.length, on: on.length, expectedDim: [...(b?.querySelectorAll('.pmu-mark[data-prov]') || [])].filter((e) => e.dataset.prov !== id).length,
						expectedOn: [...(b?.querySelectorAll('.pmu-irow[data-prov]') || [])].filter((e) => e.dataset.prov === id).length,
						correct: dim.every((e) => e.dataset.prov !== id) && on.every((e) => e.dataset.prov === id) } };
			};
		}, { room, baseline, selector });
		// Real inputs at a wall-clock cadence, independent of renderer acknowledgements: serial awaiting lets the
		// mount stall the test driver and can accidentally create two bursts. Mouse coordinates never change.
		const INPUTS = 203, inputs = [];
		for (let i = 0; i < INPUTS; i++) {
			if (i === 3) inputs.push(t.page.keyboard.press(key));
			inputs.push(t.page.mouse.wheel(0, i < 3 || i % 2 ? 1 : -1));
			await new Promise((resolve) => setTimeout(resolve, 30));
		}
		await Promise.all(inputs);
		await t.page.waitForTimeout(1200);
		const rec = await f.evaluate(() => window.__uhpMount.stop());
		const first = rec.wheels[0]?.t, last = rec.wheels.at(-1)?.t;
		const during = rec.samples.filter((s) => s.t >= first && s.t <= last);
		const gaps = rec.wheels.slice(1).map((w, i) => w.t - rec.wheels[i].t), maxGap = Math.max(...gaps);
		const activated = rec.keys.some((k) => k.trusted && k.room === room && k.t > first && k.t < last);
		const S = label + `R5 ${room} (${rm ? 'Reduced Motion spare' : 'motion on'}, ${key}): `;
		const detail = `wheels ${rec.wheels.length}, max gap ${Math.round(maxGap)} ms, samples ${during.length}, swaps ${rec.swaps}, moves ${rec.moves}, target ${rec.targetHovered}, calibration scroll ${destinationTop}`;
		t.log(S + detail + ' | return ' + JSON.stringify({ ends: rec.ends, op: rec.op, cardLit: rec.cardLit, tools: rec.tools, provider: rec.provider }));
		records.push({ room, attempt: attempt + 1, at, destinationTop, maxGap, rec });
		// A busy mount can delay event delivery past 150 ms while the already-queued wheel task precedes the timer.
		// Chrome may coalesce queued wheel inputs while busy; at least 80% must reach the page. The pause must
		// actually stay alive: an end before the last tick rejects this run, regardless of that delivery gap.
		const qualified = (String(t.args.mountNoPause || '') === '1' || rec.oldPaused) && activated && rec.wheels.length >= INPUTS * 0.8 && rec.wheels.every((w) => w.trusted) && rec.ends.every((e) => e.t > last) && !rec.moves && during.length > 10 && rec.swaps > 0 && rec.liveRoom === room && rec.targetHovered && destinationTop === 0;
		if (!qualified && attempt < 2) { t.log(S + `unjudgeable attempt ${attempt + 1}; repeat the same input route: ` + detail); continue; }
		await t.check(S + 'could judge trusted keyboard mount within one stationary wheel burst', qualified, detail);
		if (String(t.args.mountNoPause || '') === '1') {
			await t.check(S + 'main control has no pause interval', !rec.oldPaused && during.every((s) => s.op !== 'wheel'));
			t.log(S + 'SKIP R5 suppression/restoration: explicit mountNoPause control has no wheel hold');
			break;
		}
		await t.check(S + 'live board keeps its wheel marker after the mount', rec.oldPaused && during.length > 0 && during.every((s) => s.op === 'wheel'), `${during.filter((s) => s.op !== 'wheel').length}/${during.length} live samples lost marker`);
		// Allow the first 100 ms for an already-lit reused card's outgoing fade; nothing arriving may light thereafter.
		const settled = during.filter((s) => s.t >= during[0].t + 100);
		await t.check(S + 'live card tools, row backgrounds and hover/provider lights stay paused', settled.length > 10 && settled.every((s) => !s.lit && (s.tools == null || s.tools <= 0.05) && !s.rows), `${settled.filter((s) => s.lit || s.tools > 0.05 || s.rows).length}/${settled.length} lit samples`);
		const hitSamples=settled.filter(s=>s.hit&&s.hit.alpha>.02),ghostSamples=hitSamples.filter(s=>s.hit.ghost&&!s.hit.live);
		t.log(S+'R116 T1 hit-tested surfaces: '+JSON.stringify({samples:hitSamples.length,ghost:ghostSamples.length,bad:hitSamples.filter(s=>s.hit.tools>.05||s.hit.lit||s.hit.rows)}));
		await t.check(S+'R116 T1 hit-tested card tools, rows and light stay paused on either visible board',hitSamples.length>10&&hitSamples.every(s=>!(s.hit.tools>.05)&&!s.hit.lit&&!s.hit.rows),`${hitSamples.filter(s=>s.hit.tools>.05||s.hit.lit||s.hit.rows).length}/${hitSamples.length} lit hit-tested samples; ${ghostSamples.length} on outgoing ghost`);
		if(!rm)await t.check(S+'R116 P1 could judge outgoing ghost above incoming room during wheel hold',ghostSamples.length>0,`${ghostSamples.length} visible outgoing ghost hits`);
		await t.check(S + 'pause end restores the LIVE board light and tools without a move', rec.ends.length === 1 && rec.ends[0].live && rec.ends[0].room === room && rec.ends[0].t > last && !rec.op && rec.oldOp !== 'wheel' && rec.cardLit && rec.tools > 0.5, JSON.stringify({ ends: rec.ends, op: rec.op, oldOp: rec.oldOp, cardLit: rec.cardLit, tools: rec.tools }));
		if (room === 'overview') {
			const p = rec.provider;
			await t.check(S + 'provider return reaches the live board', !!p.id && p.expectedDim + p.expectedOn > 0 && p.correct && p.dim === p.expectedDim && p.on === p.expectedOn, JSON.stringify(p));
		}
		break;
		}
	}
	await park();
	return records;
}

// R100: wheel from a fully applied chart/card state, not merely from pending pointer intent.
async function appliedHighlights(t, f, label, park) {
	const records = [], wanted = String(t.args.chartCases || 'provider,donut,column,engine,tool').split(','), rm = String(t.args.rm || '') === '1';
	const routes = wanted.flatMap((kind)=>kind === 'tool' && rm ? [{kind,reducedTool:true},{kind,reducedTool:false}] : [{kind,reducedTool:rm}]);
	const liveWasOn = await f.evaluate(() => { const on = PMU.live.on(); PMU.live.pause(); return on; });
	for (const {kind,reducedTool} of routes) {
		if(rm){await t.emulate({reducedMotion:reducedTool?'reduce':'no-preference'});await f.waitForFunction((want)=>PMU.motion.reduced()===want,reducedTool,{timeout:5000});}
		await park();
		await f.evaluate((r) => { PMU.menu.close(); PM7_USAGE.setRoomDetail(r, 'diagnostics'); }, kind === 'donut' ? 'analytics' : kind === 'column' ? 'costs' : 'overview');
		await t.page.waitForTimeout(4500);
		let sparse = null;
		if (kind === 'engine') {
			sparse = await f.evaluate(() => {
				const b = PMU.board, ids = b.visible(), c = document.querySelector('#pmuBoard .pmu-card[data-head="plate"]');
				if (!c) return null;
				const id = c.dataset.widget, rect = b.rect(id);
				ids.filter((x) => x !== id).forEach((x) => b.setVisible(x, false)); b.resize(id, { w: b.cls().tracks, h: 40 });
				return { ids, id, rect };
			});
			await t.page.waitForTimeout(4000);
		}
		const selector = kind === 'provider' ? '.pmu-skycol[data-prov]' : kind === 'donut' ? '.pmu-dl-row[data-i]' : kind === 'column' ? '.pmu-colsplot .pmu-col:not(.is-zero)' : kind === 'engine' && sparse ? `.pmu-card[data-widget="${sparse.id}"]` : '.pmu-card[data-head="plate"]';
		const target = f.locator('#pmuBoard ' + selector).first();
		if (!await target.count()) { await t.check(label + `R100 ${kind}: could judge target exists`, false); continue; }
		await target.scrollIntoViewIfNeeded();
		if (kind === 'engine' || kind === 'tool') await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 0; });
		await t.page.waitForTimeout(500);
		const box = await target.boundingBox(), pane = await f.locator('#pmuScroll').boundingBox();
		if (!box || !pane) { await t.check(label + `R100 ${kind}: could judge visible target`, false); continue; }
		let at = { x: box.x + box.width / 2, y: (Math.max(box.y, pane.y) + Math.min(box.y + box.height, pane.y + pane.height)) / 2 };
		await t.page.mouse.move(2,2); await t.page.waitForTimeout(250);
		await f.evaluate(({ kind, selector, reducedTool }) => {
			const b = document.getElementById('pmuBoard'), sc = document.getElementById('pmuScroll'), target = b.querySelector(selector);
			const chart = target.closest('.pmu-chart') || target, r = window.__uhpApplied = { kind, reducedTool, frames: [], wheels: [], scrolls: [], moves: 0, ends: [] };
			let running = true, pos = null, point = null;
			const toolState=()=>{const tools=kind==='tool'?target.querySelector('.pmu-cardtools'):null;if(!tools)return {};const cs=getComputedStyle(tools);return {toolOpacity:parseFloat(cs.opacity),toolPointerEvents:cs.pointerEvents,reduced:PMU.motion.reduced()};};
			const read = () => ({ ...toolState(), t: performance.now(), op: b.getAttribute('data-op'), top: sc.scrollTop, hovered: kind === 'column' ? chart.matches(':hover') : target.matches(':hover'),
				hl: b.querySelectorAll('.is-hl-dim,.is-hl-on').length,
				dim: chart.querySelectorAll('path[data-mark="arc"].is-dim').length, hot: chart.querySelectorAll('.pmu-dl-row.is-hot').length,
				value: chart.querySelector('.pmu-dc-v')?.textContent, caption: chart.querySelector('.pmu-dc-c')?.textContent,
				cols: chart.querySelectorAll('.pmu-col.is-hot-col').length, bars: !!chart.querySelector('.pmu-cols.is-hot'),
				hoverIndex: chart.querySelector('.pmu-dl-row[data-i]:hover,path[data-mark="arc"]:hover')?.getAttribute('data-i') ?? null,
				hotRows: [...chart.querySelectorAll('.pmu-dl-row.is-hot')].map((r)=>({index:r.getAttribute('data-i'),footer:r.classList.contains('is-rest')})),
				dimIndices: [...chart.querySelectorAll('path[data-mark="arc"].is-dim')].map((p)=>p.dataset.i), arcIndices: [...chart.querySelectorAll('path[data-mark="arc"]')].map((p)=>p.dataset.i),
				colIndices: [...chart.querySelectorAll('.pmu-col.is-hot-col')].map((c)=>c.dataset.i),
				bucket: kind === 'column' && (pos || point) ? ([...chart.querySelectorAll('.pmu-col[data-i]')].find((c)=>{const r=c.getBoundingClientRect(), x=(pos||point)[0];return x>=r.left&&x<=r.right;})?.dataset.i ?? null) : null,
				readout: !!chart.querySelector('.pmu-xh-on'), lit: target.classList.contains('pmh-on'), engineRunning: window.PMH?.stats?.().running });
			r.neutral = read();
			const immediate=()=>{if(kind==='tool'&&reducedTool)r.immediate=read();};
			const wheel = (e) => { r.wheels.push({ t: performance.now(), trusted: e.isTrusted }); pos = [e.clientX,e.clientY]; point = pos; };
			const scroll = () => r.scrolls.push({ t: performance.now(), top: sc.scrollTop });
			const move = (e) => { point = [e.clientX,e.clientY]; if (pos && (e.clientX !== pos[0] || e.clientY !== pos[1])) r.moves++; };
			const end = (e) => { if (e.detail?.board === b) r.ends.push(performance.now()); };
			const sample = () => { if (!running) return; if (b.getAttribute('data-op') === 'wheel') r.frames.push(read()); requestAnimationFrame(sample); };
			sc.addEventListener('wheel', wheel, { capture:true, passive:true }); sc.addEventListener('wheel',immediate,{passive:true}); sc.addEventListener('scroll', scroll, { passive:true }); sc.addEventListener('pointermove', move, true);
			document.addEventListener('pmu-op-end', end); requestAnimationFrame(sample);
			r.read = read;
			r.stop = () => { running=false; sc.removeEventListener('wheel',wheel,true); sc.removeEventListener('wheel',immediate); sc.removeEventListener('scroll',scroll); sc.removeEventListener('pointermove',move,true); document.removeEventListener('pmu-op-end',end); return { ...r, read:undefined, stop:undefined, after:read() }; };
		}, { kind, selector, reducedTool });
		await t.page.mouse.move(at.x, at.y, { steps: 4 });
		await t.page.waitForTimeout(kind === 'engine' ? 4000 : 900);
		if (kind === 'tool') {
			const menu = target.locator('.pmu-cardmenu').first(), mb = await menu.boundingBox();
			if (!mb) { await t.check(label + 'R100 tool: menu button exists', false); continue; }
			at = { x: mb.x + mb.width / 2, y: mb.y + mb.height / 2 };
			await t.page.mouse.move(at.x, at.y); await t.page.waitForTimeout(600);
			if(!reducedTool) await f.evaluate(() => {
				const r = window.__uhpApplied;
				const down = (e) => { document.removeEventListener('pointerdown',down,true); const c = e.target.closest('.pmu-card'); const tools = c?.querySelector('.pmu-cardtools'); r.press={ trusted:e.isTrusted, tool:e.target.closest('[data-tool]')?.dataset.tool, opacity:tools ? parseFloat(getComputedStyle(tools).opacity) : null, paused:document.getElementById('pmuBoard').getAttribute('data-op') === 'wheel' }; };
				document.addEventListener('pointerdown',down,true);
			});
		}
		const pre = await f.evaluate(() => window.__uhpApplied.read());
		if (kind === 'tool') { await t.page.mouse.wheel(0,-1); if(!reducedTool){await t.page.mouse.down(); await t.page.mouse.up();} }
		else for (let i=0;i<18;i++) { await t.page.mouse.wheel(0,kind === 'engine' ? -1 : i % 2 ? -1 : 1); await t.page.waitForTimeout(30); }
		await t.page.waitForTimeout(900);
		const rec = await f.evaluate(() => { const r=window.__uhpApplied.stop(); r.menuOpen=!!PMU.menu.current(); return r; });
		const S=label+`R100 ${kind}${rm&&kind==='tool'?(reducedTool?' (Reduced Motion)':' (motion enabled)'):''}: `, last=rec.wheels.at(-1)?.t, marked=rec.frames.filter((x) => x.t >= rec.wheels[0]?.t+50);
		records.push({kind,pre,rec});
		t.log(S+JSON.stringify({pre, neutral:rec.neutral, frames:marked.length, ends:rec.ends, press:rec.press, after:rec.after}));
		if (kind === 'tool' && reducedTool) {
			await t.check(S+'could judge unfocused shown tools and trusted wheel in Reduced Motion',pre.hovered&&pre.reduced&&pre.toolOpacity>0.5&&rec.wheels.length===1&&rec.wheels[0].trusted&&rec.immediate?.op==='wheel'&&!rec.moves,JSON.stringify({pre,immediate:rec.immediate,wheels:rec.wheels,moves:rec.moves}));
			await t.check(S+'tools conceal immediately in the wheel task under Reduced Motion',rec.immediate?.reduced&&rec.immediate.toolOpacity===0&&rec.immediate.toolPointerEvents==='none',JSON.stringify(rec.immediate));
		} else if (kind === 'tool') {
			await t.check(S+'could judge a trusted press while the previously shown tool still visibly fades', pre.hovered && rec.press?.trusted && rec.press.paused && rec.press.opacity > 0.05 && !rec.moves, JSON.stringify(rec.press));
			await t.check(S+'the visible menu tool receives the press and opens its menu', rec.press?.tool === 'menu' && rec.menuOpen, JSON.stringify({press:rec.press,menuOpen:rec.menuOpen}));
			if (rec.menuOpen) {
				const mb = await f.locator('.pmu-menu:not([aria-hidden="true"])').last().boundingBox(), cb = await target.boundingBox();
				if (mb && cb) {
					const candidates = [[mb.x+20,mb.y+mb.height-12],[mb.x+20,mb.y+12],[mb.x+mb.width-12,mb.y+mb.height-12]];
					const off = candidates.find(([x,y])=>x<cb.x||x>cb.x+cb.width||y<cb.y||y>cb.y+cb.height) || candidates[0];
					await t.page.mouse.move(off[0],off[1],{steps:4}); await t.page.waitForTimeout(400);
				}
				const hidden = await f.evaluate(()=>{const h=PMU.menu.current(), a=h?.anchor, tools=a?.closest('.pmu-cardtools');window.__uhpFocusAnchor=a;const cs=tools&&getComputedStyle(tools);return {menuFocus:!!h?.el.contains(document.activeElement),opacity:cs?parseFloat(cs.opacity):null,hitDisabled:!!cs&&(cs.visibility!=='visible'||cs.pointerEvents==='none'),pointerEvents:cs?.pointerEvents,hovered:!!tools?.closest('.pmu-card').matches(':hover'),discrete:CSS.supports('transition-behavior','allow-discrete')};});
				await t.check(S+'could judge Escape from the menu after its trigger has fully faded', hidden.menuFocus && hidden.opacity===0 && hidden.hitDisabled && !hidden.hovered, JSON.stringify(hidden));
				await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(400);
				const focus = await f.evaluate(()=>{const a=window.__uhpFocusAnchor;delete window.__uhpFocusAnchor;return {closed:!PMU.menu.current(),returned:!!a&&document.activeElement===a,visible:!!a?.matches(':focus-visible')};});
				await t.check(S+'Escape returns keyboard focus to the faded trigger', focus.closed && focus.returned && focus.visible, JSON.stringify({hidden,focus}));
			}
			await f.evaluate(() => PMU.menu.close());
		} else {
			const shown=kind === 'provider' ? pre.hl>0 : kind === 'donut' ? pre.dim>0 && pre.hot>0 && pre.value!==rec.neutral.value : kind === 'column' ? pre.cols===1 && pre.bars : pre.lit && !pre.engineRunning;
			const travel=rec.scrolls.map((s)=>s.top);
			await t.check(S+'could judge already-applied state, still pointer and a sampled complete wheel hold', shown && pre.hovered && rec.after.hovered && !rec.moves && marked.length>=10 && rec.wheels.length===18 && rec.wheels.every((w)=>w.trusted) && rec.ends.length===1 && rec.ends[0]>last && (kind === 'engine' ? pre.top===0 && rec.after.top===0 : travel.length>0), JSON.stringify({shown,pre,after:rec.after,frames:marked.length,scrolls:travel,ends:rec.ends}));
			const quiet=(s)=>kind === 'provider' ? !s.hl : kind === 'donut' ? !s.dim && !s.hot && s.value===rec.neutral.value && s.caption===rec.neutral.caption : kind === 'column' ? !s.cols && !s.bars : !s.lit;
			await t.check(S+'existing highlight clears throughout the marked interval, including its tail', marked.length>=10 && marked.every(quiet), `${marked.filter((s)=>!quiet(s)).length}/${marked.length} highlighted samples`);
			const a=rec.after, restored=kind === 'provider' ? a.hl>0 : kind === 'donut' ? a.dim>0 && a.hoverIndex!=null && a.hotRows.length===1 && a.hotRows.every((r)=>!r.footer&&r.index===a.hoverIndex) && a.dimIndices.length===a.arcIndices.length-1 && a.dimIndices.every((i)=>i!==a.hoverIndex) && a.value===pre.value && a.caption===pre.caption : kind === 'column' ? a.cols===1 && a.bars && !a.readout && a.bucket!=null && a.colIndices.length===1 && a.colIndices[0]===a.bucket : a.lit;
			await t.check(S+'current target highlight returns without pointer movement', !a.op && a.hovered && restored, JSON.stringify(a));
		}
		// Removing/re-adding panels applies real gravity and can rearrange peers. Restore this fresh fixture's room
		// defaults in one reset so R0 keeps its original fixed point and starts on the normal board, not a gap.
		if (sparse) { await park(); await f.evaluate(()=>PMU.board.reset('room')); }
		await park();
	}
	if(rm)await t.emulate({reducedMotion:'reduce'});
	await f.evaluate((on)=>{ PMU.menu.close(); document.activeElement?.blur(); PM7_USAGE.setRoomDetail('overview','glance'); if(on) PMU.live.resume(); },liveWasOn);
	await t.page.waitForTimeout(4500);
	return records;
}

// R107 P1: a trusted move straight to the toolbar must invalidate the old wheel location.
async function pointerDeparture(t, f, label, park) {
	await park();
	const liveWasOn = await f.evaluate(() => { const on = PMU.live.on(); PMU.live.pause(); PM7_USAGE.setRoomDetail('costs', 'diagnostics'); return on; });
	await t.page.waitForTimeout(4500);
	const target = f.locator('#pmuBoard .pmu-colsplot .pmu-col:not(.is-zero)').first();
	if (!await target.count()) { await t.check(label + 'R107 could judge: a column exists', false); return; }
	await target.scrollIntoViewIfNeeded();
	await t.page.waitForTimeout(500);
	const box = await target.boundingBox(), pane = await f.locator('#pmuScroll').boundingBox();
	if (!box || !pane) { await t.check(label + 'R107 could judge: column and board are visible', false); return; }
	const at = { x: box.x + box.width / 2, y: (Math.max(box.y, pane.y) + Math.min(box.y + box.height, pane.y + pane.height)) / 2 };
	const outside = { x: pane.x + pane.width / 2, y: Math.max(2, pane.y - 18) };
	await t.page.mouse.move(at.x, at.y);
	await t.page.waitForTimeout(900);
	await f.evaluate(() => {
		const b = document.getElementById('pmuBoard'), sc = document.getElementById('pmuScroll');
		const r = window.__uhpDeparture = { pre: b.querySelectorAll('.pmu-col.is-hot-col').length, wheels: [], leaves: [], ends: [], after: [] };
		let running = true, point = null;
		const read = () => ({ t: performance.now(), op: b.getAttribute('data-op'), outside: !sc.matches(':hover'),
			column: b.querySelectorAll('.pmu-col.is-hot-col,.pmu-cols.is-hot').length,
			provider: b.querySelectorAll('.is-hl-on,.is-hl-dim').length,
			donut: b.querySelectorAll('path[data-mark="arc"].is-dim,.pmu-dl-row.is-hot').length,
			card: b.querySelectorAll('.pmh-on,.pmh-near').length });
		const wheel = (e) => { point = [e.clientX,e.clientY]; r.wheels.push({t:performance.now(),trusted:e.isTrusted,held:b.getAttribute('data-op')==='wheel'}); };
		// Capture before the scroller's own leave handler can end the pause on the fixed page.
		const leave = (e) => { if (sc.contains(e.target) && !sc.contains(e.relatedTarget)) r.leaves.push({t:performance.now(),trusted:e.isTrusted,held:b.getAttribute('data-op')==='wheel'}); };
		const end = (e) => { if (e.detail?.board === b) { const hit = point && document.elementFromPoint(...point); r.ends.push({t:performance.now(),outside:!sc.matches(':hover'),oldPointOnPlot:!!hit?.closest('.pmu-colsplot')}); } };
		const sample = () => { if (!running) return; if (r.ends.length) r.after.push(read()); requestAnimationFrame(sample); };
		sc.addEventListener('wheel',wheel,{passive:true}); document.addEventListener('pointerout',leave,true); document.addEventListener('pmu-op-end',end);
		requestAnimationFrame(sample);
		r.stop = () => { running=false; sc.removeEventListener('wheel',wheel); document.removeEventListener('pointerout',leave,true); document.removeEventListener('pmu-op-end',end); return {...r,stop:undefined,final:read()}; };
	});
	// No intervening page round trip: the page timestamps prove departure precedes the 150 ms rest.
	await t.page.mouse.wheel(0,1);
	await t.page.mouse.move(outside.x,outside.y);
	await t.page.waitForTimeout(900);
	const rec = await f.evaluate(() => window.__uhpDeparture.stop());
	const gap = rec.leaves[0]?.t - rec.wheels[0]?.t;
	t.log(label + 'R107 departure: ' + JSON.stringify(rec));
	await t.check(label + 'R107 could judge: trusted wheel on a lit column, direct departure during the hold, old point still on the plot',
		rec.pre===1 && rec.wheels.length===1 && rec.wheels[0].trusted && rec.wheels[0].held && rec.leaves.length===1 && rec.leaves[0].trusted && rec.leaves[0].held && gap>=0 && gap<150 && rec.ends.length===1 && rec.ends[0].outside && rec.ends[0].oldPointOnPlot && rec.after.length>=5 && rec.after.every((x)=>x.outside) && rec.final.outside && !rec.final.op,
		`departure ${gap} ms after wheel; ${JSON.stringify({...rec,after:rec.after.length})}`);
	await t.check(label + 'R107 no column, provider, donut or card light returns while the pointer remains outside the board',
		rec.after.length>=5 && rec.after.every((x)=>x.outside && !x.column && !x.provider && !x.donut && !x.card) && rec.final.outside && !rec.final.column && !rec.final.provider && !rec.final.donut && !rec.final.card,
		`${rec.after.filter((x)=>x.column || x.provider || x.donut || x.card).length}/${rec.after.length} lit post-return frames; final ${JSON.stringify(rec.final)}`);
	await park();
	await f.evaluate((on) => { PM7_USAGE.setRoomDetail('overview','glance'); if(on) PMU.live.resume(); },liveWasOn);
	await t.page.waitForTimeout(4500);
	return rec;
}

// R112: keyboard gestures need no pointer press/move, so they can take over an outstanding wheel return.
async function keyboardPause(t, f, label, park) {
	await park();
	const liveWasOn = await f.evaluate(() => { const on = PMU.live.on(); PMU.live.pause(); PM7_USAGE.setRoomDetail('overview', 'glance'); return on; });
	await t.page.waitForTimeout(4500);
	const records = [];
	for (const [key, mode] of [['m', 'move'], ['r', 'resize']]) {
		const S = label + `R112 ${mode}: `;
		await park();
		await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 0; });
		await f.locator('#pmuBoard > .pmu-card[data-widget="health"]').focus();
		const target = f.locator('#pmuBoard > .pmu-card[data-widget="ov-skyline"] .pmu-skycol[data-prov]').first();
		const box = await target.boundingBox(), pane = await f.locator('#pmuScroll').boundingBox();
		if (!box || !pane) { await t.check(S + 'could judge: Skyline provider and focused card exist', false); continue; }
		await t.page.mouse.move(box.x + box.width / 2, (Math.max(box.y, pane.y) + Math.min(box.y + box.height, pane.y + pane.height)) / 2);
		await t.page.waitForTimeout(900);
		await f.evaluate(({key, mode}) => {
			const sc = document.getElementById('pmuScroll'), board = () => document.getElementById('pmuBoard');
			const target = board().querySelector('.pmu-card[data-widget="ov-skyline"] .pmu-skycol[data-prov]:hover');
			const read = () => {
				const b = board(), dim = [...b.querySelectorAll('.is-hl-dim')], on = [...b.querySelectorAll('.is-hl-on')];
				return { t: performance.now(), op: b.getAttribute('data-op'), gesture: PMU.board.gesture(), top: sc.scrollTop,
					hovered: !!target?.isConnected && target.closest('.pmu-board') === b && target.matches(':hover'),
					dim: dim.length, on: on.length, correct: !!target && dim.every((el) => el.dataset.prov !== target.dataset.prov) && on.every((el) => el.dataset.prov === target.dataset.prov),
					eligibleDim: [...b.querySelectorAll('.pmu-mark[data-prov]')].filter((el) => el.dataset.prov !== target?.dataset.prov).length,
					eligibleOn: [...b.querySelectorAll('.pmu-irow[data-prov]')].filter((el) => el.dataset.prov === target?.dataset.prov).length };
			};
			const r = window.__uhpKeyboard = { key, mode, pre: read(), focused: document.activeElement?.dataset.widget, wheels: [], keys: [], ends: [], moves: 0, frames: [] };
			let running = true, point = null;
			const wheel = (e) => { point = [e.clientX, e.clientY]; r.wheels.push({t: performance.now(), trusted: e.isTrusted, held: board().getAttribute('data-op') === 'wheel'}); };
			const keydown = (e) => { if (e.key === key || e.key === 'Escape') r.keys.push({t: performance.now(), key: e.key, trusted: e.isTrusted, focused: e.target.dataset.widget}); };
			const move = (e) => { if (point && (e.clientX !== point[0] || e.clientY !== point[1])) r.moves++; };
			const end = (e) => r.ends.push({t: performance.now(), live: e.detail?.board === board(), gesture: !!PMU.board.gesture(), op: board().getAttribute('data-op'), point: e.detail?.point});
			const frame = () => { if (!running) return; r.frames.push(read()); requestAnimationFrame(frame); };
			sc.addEventListener('wheel', wheel, {passive: true}); document.addEventListener('keydown', keydown, true); document.addEventListener('pointermove', move, true); document.addEventListener('pmu-op-end', end);
			requestAnimationFrame(frame);
			r.stop = () => { running = false; sc.removeEventListener('wheel', wheel); document.removeEventListener('keydown', keydown, true); document.removeEventListener('pointermove', move, true); document.removeEventListener('pmu-op-end', end); return {...r, stop: undefined, point, after: read()}; };
		}, {key, mode});
		// Consecutive trusted inputs; the in-page timestamps qualify entry before the 150 ms deadline.
		await t.page.mouse.wheel(0, -1);
		await t.page.keyboard.press(key);
		await t.page.waitForTimeout(650);
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(900);
		const rec = await f.evaluate(() => window.__uhpKeyboard.stop()); records.push(rec);
		const press = rec.keys.find((x) => x.key === key), escape = rec.keys.find((x) => x.key === 'Escape');
		const gap = press?.t - rec.wheels[0]?.t, held = rec.frames.filter((x) => x.t >= rec.wheels[0]?.t + 200 && x.t < escape?.t);
		const a = rec.after, p = rec.pre;
		t.log(S + JSON.stringify(rec));
		await t.check(S + 'could judge: applied provider, trusted wheel at top, M/R on another focused card within 150 ms, gesture held past pause, trusted Escape and still pointer',
			p.hovered && p.dim === p.eligibleDim && p.on === p.eligibleOn && p.dim + p.on > 0 && p.correct && rec.focused === 'health' &&
			rec.wheels.length === 1 && rec.wheels[0].trusted && rec.wheels[0].held && gap >= 0 && gap < 150 && press?.trusted && press.focused === 'health' && escape?.trusted &&
			escape.t - press.t >= 500 && held.length >= 5 && held.every((x) => x.gesture?.kb && x.gesture.type === mode && x.hovered && x.top === 0) && held.some((x) => x.op === mode) &&
			!rec.moves && a.hovered && a.top === 0 && !a.gesture && !a.op,
			JSON.stringify({gap, pre: p, focused: rec.focused, wheels: rec.wheels, keys: rec.keys, held: held.length, moves: rec.moves, after: a}));
		await t.check(S + 'no chart return fires while the keyboard gesture owns the board', held.length >= 5 && held.every((x) => !x.dim && !x.on) && !rec.ends.some((x) => x.t < escape?.t || x.gesture || x.op), JSON.stringify({ends: rec.ends, litHeld: held.filter((x) => x.dim || x.on).length}));
		await t.check(S + 'after Escape one return restores the current hovered provider without moving the pointer', rec.ends.length === 1 && rec.ends[0].live && !rec.ends[0].gesture && !rec.ends[0].op && rec.ends[0].t >= escape?.t && JSON.stringify(rec.ends[0].point) === JSON.stringify(rec.point) && !a.gesture && !a.op && a.hovered && a.dim === a.eligibleDim && a.on === a.eligibleOn && a.dim + a.on > 0 && a.correct, JSON.stringify({ends: rec.ends, after: a}));
	}
	await park();
	await f.evaluate((on) => { document.activeElement?.blur(); if (on) PMU.live.resume(); }, liveWasOn);
	return records;
}

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark').split(',').filter(Boolean);
	// BACK: the pause ends 150 ms after the last wheel or scroll event; light and tools were back at 168-185 ms on Alexis
	const TRIES = Number(t.args.tries || 3), TICKS = Number(t.args.ticks || 12), GAP = Number(t.args.gap || 30), BACK = Number(t.args.back || 200);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const rm = String(t.args.rm || '') === '1';
	if (rm) await t.emulate({ reducedMotion: 'reduce' });
	const dump = [];
	for (const surface of t.app.surfaces()) {
		const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
		await f.evaluate(() => document.fonts.ready.then(() => true));
		await t.page.waitForTimeout(Number(t.args.settle ?? 20000));
		const park = () => t.page.mouse.move(W - 6, Math.round(H / 2), { steps: 4 });
		for (const look of looks) {
			const S = `[${surface}] ${look}: `;
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await f.evaluate(() => PM_PAGES.go('usage'));
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 8000));
			if (!['chartOnly','raceOnly','mountOnly','departureOnly','keyboardOnly'].some((key)=>String(t.args[key] || '')==='1')) {
				const r113=await r113Cases(t,f,S,park);dump.push({surface,look,r113});
				if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump));
				if(String(t.args.r113Only || '')==='1') continue;
			}
			if (!['chartOnly','raceOnly','mountOnly','departureOnly'].some((key)=>String(t.args[key] || '')==='1')) {
				const keyboard=await keyboardPause(t,f,S,park); dump.push({surface,look,keyboard});
				if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump));
				if(String(t.args.keyboardOnly || '')==='1') continue;
			}
			if (!['chartOnly','raceOnly','mountOnly'].some((key)=>String(t.args[key] || '')==='1')) {
				const departure=await pointerDeparture(t,f,S,park); dump.push({surface,look,departure});
				if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump));
				if(String(t.args.departureOnly || '')==='1') continue;
			}
			if (String(t.args.chartOnly || '') === '1') {
				const applied = await appliedHighlights(t, f, S, park); dump.push({surface,look,applied});
				if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump));
				continue;
			}
			let mounts;
			if (String(t.args.raceOnly || '') !== '1') {
				mounts = await roomMountRace(t, f, S, park, rm);
				dump.push({ surface, look, mounts });
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
				if (String(t.args.mountOnly || '') === '1') continue;
			}
			if (String(t.args.raceOnly || '') !== '1') { const applied=await appliedHighlights(t,f,S,park); dump.push({surface,look,applied}); if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump)); }
			const ok = await f.evaluate(INSTALL);
			const range = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); return s ? s.scrollHeight - s.clientHeight : 0; });
			if (!ok || range < TICKS * 40 + 80) { await t.check(S + 'could judge: Usage\'s board is there and scrolls ' + (TICKS * 40 + 80) + ' px', false, `range ${range}`); continue; }
			const race = await providerRace(t, f, S, park);
			dump.push({ surface, look, race });
			if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
			if (String(t.args.raceOnly || '') === '1') { await park(); continue; }
			const res = { r0: [], r1: [], r2: [] };
			const at0 = await f.evaluate(() => { const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55) }; });
			for (let w = 0; w < TRIES; w++) {
				let rec, rest, at, j, short = [];
				for (let attempt = 0; attempt < 3; attempt++) {
					await park();
					await t.page.waitForTimeout(500);
					at = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); s.scrollTop = 0; const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55) }; });
					await t.page.waitForTimeout(400);
					await t.page.mouse.move(at.x, at.y, { steps: 6 });
					await t.page.waitForTimeout(1200);
					rest = await f.evaluate(() => window.__uhp.state());
					await f.evaluate(() => window.__uhp.start());
					for (let i = 0; i < TICKS; i++) { await t.page.mouse.wheel(0, 40); await t.page.waitForTimeout(GAP); }
					await t.page.waitForTimeout(800);
					rec = await f.evaluate(() => window.__uhp.stop());
					const moved = rec.frames.length ? rec.frames[rec.frames.length - 1].top - rec.frames[0].top : 0;
					if (rec.wheels.length && moved >= TICKS * 40 * 0.6) break;
					short.push(`scrolled ${moved} px, ${rec.wheels.length} wheel events`);
				}
				const moved = rec.frames.length ? rec.frames[rec.frames.length - 1].top - rec.frames[0].top : 0;
				if (!rec.wheels.length || moved < TICKS * 40 * 0.6) { await t.check(`${S}window ${w + 1}: could judge: the wheel scrolled the board`, false, short.join('; ')); continue; }
				j = judge(rec, { rest: rest.card, back: BACK });
				dump.push({ surface, look, window: w + 1, rest, at, judged: j, rec });
				res.r0.push(!!(rest.card && rest.lit && rest.tools > 0.5));
				res.r1.push(j.r1); res.r2.push(j.r2);
				t.log(`${S}window ${w + 1}: at rest card ${rest.card} lit ${rest.lit} tools ${rest.tools} | wheel ${j.span.wheels} events over ${j.span.wheel} ms, scroll ${j.span.scrolls} events ending ${j.span.tail} ms after the last wheel, ${moved} px | during: ${j.r1.cardsPassed} cards under the pointer, ${j.r1.ins} hover-in transitions (${j.r1.insProps.join(', ') || 'none'}) on ${j.r1.insCards.join(',') || 'no card'}, ${j.r1.litFrames} of ${j.r1.frames} frames retain a card/chart light, ${j.r1.toolFrames} retain shown tools | after: back in ${j.r2.ms === null ? 'never (800 ms)' : j.r2.ms + ' ms'} on ${j.r2.card} (light ${j.r2.light ?? 'never'}, tools ${j.r2.tools ?? 'never'})${j.r2.long.length ? ' | long frames after: ' + j.r2.long.join(' / ') : ''}${short.length ? ' | taken again: ' + short.join('; ') : ''}`);
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
			}
			await park();
			const n = res.r1.length;
			await t.check(S + `could judge: at rest the card under the pointer is lit and shows its tools (${res.r0.filter(Boolean).length} of ${res.r0.length} windows)`, n === TRIES && res.r0.every(Boolean), `windows judged ${n} of ${TRIES}`);
			await t.check(S + 'while the wheel turns, no card or row that slides under the resting pointer lights up or shows its tools', n > 0 && res.r1.every((r) => r.ok),
				res.r1.map((r, i) => `w${i + 1}: ${r.ins} hover-in transitions, ${r.litFrames} lit frames, ${r.toolFrames} shown-tool frames, ${r.frames} sampled frames, ${r.cardsPassed} cards passed`).join('; '));
			await t.check(S + `after the wheel, the highlight under the resting pointer comes back within ${BACK} ms without a move`, n > 0 && res.r2.every((r) => r.ok),
				res.r2.map((r, i) => `w${i + 1}: ${r.ms === null ? 'never' : r.ms + ' ms'} (${r.card}: light ${r.light ?? 'never'}, tools ${r.tools ?? 'never'})`).join('; '));

			// R3: keyboard focus is not paused. The board's first card takes keyboard focus (a key pressed first, so the
			// browser draws its focus ring); the pointer rests at the centre and TICKS wheel ticks scroll the board. Before,
			// half-way and 400 ms after, the card still matches :focus-visible, its ring (outline and box-shadow) is the one
			// it had before, and its tools stay shown (opacity .99 or more): the pause gates hover only.
			await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 0; });
			await t.page.mouse.move(at0.x, at0.y, { steps: 4 });
			await t.page.waitForTimeout(300);
			await t.page.keyboard.press('Shift');
			const ring = () => f.evaluate(() => { const c = document.querySelector('#pmuScroll .pmu-board > .pmu-card.pmu-kbprobe'); if (!c) return null; const cs = getComputedStyle(c), tools = c.querySelector('.pmu-cardtools'); return { fv: c.matches(':focus-visible'), ring: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} | ${cs.boxShadow}`, tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null }; });
			await f.evaluate(() => { const c = document.querySelector('#pmuScroll .pmu-board > .pmu-card'); if (!c) return; c.classList.add('pmu-kbprobe'); try { c.focus({ focusVisible: true, preventScroll: true }); } catch (e) { c.focus(); } });
			await t.page.waitForTimeout(600);
			const k0 = await ring();
			let k1 = null;
			for (let i = 0; i < TICKS; i++) { await t.page.mouse.wheel(0, 40); await t.page.waitForTimeout(GAP); if (i === Math.floor(TICKS / 2)) k1 = await ring(); }
			await t.page.waitForTimeout(400);
			const k2 = await ring();
			await f.evaluate(() => { const c = document.querySelector('.pmu-kbprobe'); if (c) { c.classList.remove('pmu-kbprobe'); c.blur(); } });
			const same = (k) => !!(k && k0 && k.fv && k.ring === k0.ring && k.tools >= 0.99);
			await t.check(S + 'while the wheel turns, a card with keyboard focus keeps its focus ring and its tools', !!(k0 && k0.fv) && same(k1) && same(k2),
				`before ${JSON.stringify(k0)} | half-way ${JSON.stringify(k1)} | after ${JSON.stringify(k2)}`);
			await park();
		}
	}
}
