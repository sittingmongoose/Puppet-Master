// Narrowed Usage wheel pause (Jared, 2026-11-18): CSS hover gates, card tools/head fitting and the hover ENGINE.
// Chart and pointer-tooltip JS is main's behavior: ordinary entry/leave/scroll applies, no wheel clear or return.
// R0-R3 judge card engine lights, tools, CSS hover transitions and keyboard focus. R2 judges the pause's end against the
// host's own measured timer lateness and the return within two frames of it (a 400 ms outer cap), not a wall-clock 200 ms.
// R4 verifies ordinary 110 ms provider intent still completes during a wheel hold. R5 covers live/spare room mounts,
// hit-tested outgoing ghosts (R116 P1/T1), tools/rows/engine and one lifecycle return. Chart-selected row backgrounds
// and typed JS chart transitions are measured separately, not treated as CSS hover leakage.
// R100 covers applied provider/donut selection remaining intact, main's scroll dismissal of column readouts with no
// synthetic restoration, a sleeping engine at a scroll limit, and the fading-tool press/keyboard-focus paths.
// R107 retains pointer-departure checks; R112 retains long keyboard M/R ownership and unchanged main provider state.
// R113 rows cover main's plot-at-limit/readout and pointer-tooltip behavior, ordinary compact donut entry, neutral
// digit-strip rolls (NieR skip is explicit), released-gesture handoff and natural Live beats after real scroll cleanup.
// R116 P5: --set shortOnly=1 witnesses trusted M/R and Escape before the original rest expires. The handoff self-test
// exercises the controlled order in the authored source.
// --set looks=basic-dark,glass-light --set rm=1 --set chartOnly=1 --set r113Only=1 --set dump=<file.json>
// Fixed stopping bar: only a real check falsely passing on real input or a demonstrated product bug stops the lane;
// other tool findings go on TOOL-ISSUES.md. Native input prerequisites and reduced-motion semantics remain explicit.
import { writeFileSync } from 'node:fs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { r113Cases } from '../helpers/usage-hover-pause-r113.mjs';
import { burstState, burstWhy, REST_MS } from '../helpers/burst-rest.mjs';

// Fixed budget for the measured interval from wheelEnd entry to the marker-clear observation.
export const RETURN_WORK_MS = 16;

// the recorder, installed once in the app's frame; __uhp.start() clears it and starts a window, __uhp.stop() ends it
// (exported for tools/usage-hover-pause-probe.selftest.mjs, which runs it against a stub page and a timer queue)
export const INSTALL = () => {
	if (window.__uhp) return true;
	const sc = document.getElementById('pmuScroll');
	let board = document.getElementById('pmuBoard');
	if (!board) return false;
	const R = window.__uhp = { on: false };
	const nativeTimeout = globalThis.setTimeout;
	const timed = function (fn, delay, ...args) {
		// 42-cards.js arms this named callback for the 150 ms wheel rest.
		if (typeof fn !== 'function' || fn.name !== 'wheelEnd' || delay !== 150 || !R.probe)
			return nativeTimeout(fn, delay, ...args);
		const timer = R.timer = { inputDue: R.probe.due, armed: performance.now(), entered: null };
		return nativeTimeout(function (...values) {
			if (R.on && R.timer === timer) timer.entered = performance.now();
			return Reflect.apply(fn, this, values);
		}, delay, ...args);
	};
	const cardId = (c) => (c ? c.getAttribute('data-id') || c.getAttribute('data-card') || c.id || String([...board.children].indexOf(c)) : null);
	const cls = (el) => String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || el.tagName).slice(0, 48);
	// Measure from this window capture callback to the probe callback. Earlier window listeners can have run
	// already, and both timers share the renderer queue. This capture still precedes the scroller's wheelEnd arm.
	// 150 is literal because INSTALL is serialized into the page.
	const armProbe = (t) => { R.probe = { due: t + 150, fired: null }; clearTimeout(R.probeTimer); R.probeTimer = nativeTimeout(() => { R.probe.fired = performance.now(); }, 150); };
	const onInput = (list) => (e) => {
		if (!R.on) return;
		if (list === 'scrolls' ? e.target !== sc : !e.composedPath().includes(sc)) return;
		const t = performance.now();
		R[list].push(t); armProbe(t);
	};
	window.addEventListener('wheel', onInput('wheels'), { passive: true, capture: true });
	window.addEventListener('scroll', onInput('scrolls'), { passive: true, capture: true });
	sc.addEventListener('transitionrun', (e) => {
		if (!R.on) return;
		const t = e.target, card = t.closest && t.closest('.pmu-card');
		const under = card && card.matches(':hover');
		// R123 P-1: a head-tools slide during a hold is hover leaking (a passing card's head moving, or the held head
		// leaving its place), never approved. Only the tag-keyed four keep their ordinary hover.
		const approved = (t.matches?.('.pmu-seg button') && e.propertyName === 'color') || (t.matches?.('.pmu-stepper button') && ['color','background-color'].includes(e.propertyName)) || (t.matches?.('.pmu-sbrow .pmu-sbfill > i') && e.propertyName === 'opacity');
		const exiting = t.classList.contains('pmh-out') && !t.classList.contains('pmh-on') && ['opacity','--pmh-x','--pmh-y'].includes(e.propertyName);
		let from, to;
		if (cardId(card) === R.rest && t.matches('.pmu-cardtools,.pmu-h,.pmu-headtools,.pmu-cardtitles')) {
			try {
				const a = t.getAnimations({ subtree: !!e.pseudoElement }).find((a) => a.transitionProperty === e.propertyName &&
					a.effect?.target === t && (a.effect.pseudoElement || '') === e.pseudoElement);
				const key = e.propertyName.replace(/-([a-z])/g, (_, v) => v.toUpperCase()), frames = a?.effect?.getKeyframes();
				if (frames?.length) { from = frames[0][key] ?? frames[0][e.propertyName]; to = frames.at(-1)[key] ?? frames.at(-1)[e.propertyName]; }
			} catch (_) { /* Unknown directions remain checked. */ }
		}
		const chartControlled=(e.propertyName==='opacity'&&t.matches?.('.pmu-mark[data-prov],path[data-mark="arc"],.pmu-colstack'))||(e.propertyName==='transform'&&t.matches?.('.pmu-col'))||(['background-color','background'].includes(e.propertyName)&&R.chartRows?.has(t));
		R.trans.push({ chartControlled, t: performance.now(), prop: e.propertyName, pseudo: e.pseudoElement, cls: cls(t), card: cardId(card), under: !!under, approved: !!approved, exiting, from, to, self: !!(t.matches && t.matches(':hover')) });
	}, true);
	// These fixed layers can remain visible after a card's engine classes have changed.
	const proxies = (card) => {
		const required = card && getComputedStyle(card);
		const needsGlow = required && +required.getPropertyValue('--pmh-glow') > 0;
		const needsFrame = required && +required.getPropertyValue('--pmh-frame') > 0;
		const target = card?.getBoundingClientRect();
		const layers = [...document.querySelectorAll('#pmh-glow > i,#pmh-frame')].flatMap((el) => {
			const style = getComputedStyle(el);
			if (style.visibility !== 'visible' || style.display === 'none') return [];
			const visible = +style.opacity > 0.01, armed = el.matches('.pmh-glow-on,.pmh-frame-on');
			if (!visible && !armed) return [];
			const box = el.getBoundingClientRect();
			if (box.width <= 0 || box.height <= 0) return [];
			const matchesTarget = target && Math.abs(box.left - target.left) <= 8 && Math.abs(box.top - target.top) <= 8;
			return [{ frame: el.id === 'pmh-frame', matchesTarget, visible, armed }];
		});
		const hasProxies = (state) => (!needsGlow || layers.some((x) => !x.frame && x.matchesTarget && x[state])) &&
			(!needsFrame || layers.some((x) => x.frame && x.matchesTarget && x[state]));
		return { proxyLit: layers.some((x) => x.visible), proxyRequired: !!(needsGlow || needsFrame),
			proxyArmed: hasProxies('armed'), proxyBack: hasProxies('visible') };
	};
	const frame = () => {
		if (!R.on) return;
		board = document.getElementById('pmuBoard');
		const hc = board.querySelector(':scope > .pmu-card:hover');
		const tools = hc && hc.querySelector('.pmu-cardtools');
		R.frames.push({ t: performance.now(), top: Math.round(sc.scrollTop), card: cardId(hc), tools: tools ? Math.round(parseFloat(getComputedStyle(tools).opacity) * 100) / 100 : null,
			lit: [...board.querySelectorAll(':scope > .pmu-card.pmh-on')].map(cardId), near: [...board.querySelectorAll(':scope > .pmu-card.pmh-near')].map(cardId),
			op: board.getAttribute('data-op'), ...proxies(hc), highlights: board.querySelectorAll('.is-hl-on,.is-hl-dim,path[data-mark="arc"].is-dim,.pmu-dl-row.is-hot,.pmu-col.is-hot-col').length });
	};
	// A tiny isolated size change gives one sample during each frame's layout, after all rAF callbacks.
	const sampleBox = document.createElement('div');
	sampleBox.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(sampleBox);
	const sampler = new ResizeObserver(frame);
	let raf, width = 1;
	const tick = () => {
		if (!R.on) return;
		width = width === 1 ? 2 : 1;
		sampleBox.style.width = width + 'px';
		raf = requestAnimationFrame(tick);
	};
	// frames of 50 ms or more (Chrome's long-animation-frame entries), with their style and layout and their longest
	// scripts, logged around the pause's end
	try {
		new PerformanceObserver((l) => { if (R.on) for (const e of l.getEntries()) R.loaf.push({ t: e.startTime, d: Math.round(e.duration), sl: Math.round(e.styleAndLayoutDuration || 0), scripts: [...(e.scripts || [])].sort((a, b) => b.duration - a.duration).slice(0, 3).map((s) => `${s.invoker || s.invokerType} ${Math.round(s.duration)} ms (forced style/layout ${Math.round(s.forcedStyleAndLayoutDuration || 0)})`) }); }).observe({ type: 'long-animation-frame' });
	} catch (e) { /* no entries in this browser */ }
	// Reconstruct each write in a mutation batch, including a class-on before a same-task marker release.
	const hasLight = (value) => (value || '').split(/\s+/).includes('pmh-on');
	new MutationObserver((ms) => {
		if (!R.on) return;
		const now = performance.now(), live = document.getElementById('pmuBoard');
		const nextValues = new Map(), changes = [];
		for (let i = ms.length - 1; i >= 0; i--) {
			const { target, attributeName, oldValue } = ms[i];
			if (attributeName === 'class' && target.matches?.('.pmu-irow.is-hl-on,.pmu-dl-row.is-hot')) R.chartRows.add(target);
			const isOp = target === live && attributeName === 'data-op';
			const isCard = attributeName === 'class' && target.parentNode === live && target.classList.contains('pmu-card');
			if (!isOp && !isCard) continue;
			const value = nextValues.has(target) ? nextValues.get(target) : target.getAttribute(attributeName);
			nextValues.set(target, oldValue);
			if (isOp && value !== oldValue) changes.push({ op: value });
			if (isCard && hasLight(value) !== hasLight(oldValue)) changes.push({ card: cardId(target), on: hasLight(value) });
		}
		for (const change of changes.reverse()) {
			const record = { t: now, order: R.order++, ...change };
			('op' in change ? R.ops : R.cls).push(record);
		}
	}).observe(sc, { attributes: true, attributeFilter: ['class','data-op'], attributeOldValue: true, subtree: true });
	R.start = () => {
		const tools = document.querySelector('#pmuBoard .pmu-card:hover .pmu-cardtools');
		const fadeMs = tools ? Math.max(...getComputedStyle(tools).transitionDuration.split(',').map((v) => parseFloat(v) * (v.trim().endsWith('ms') ? 1 : 1000))) : 140;
		Object.assign(R, { on: true, chartRows:new WeakSet(board.querySelectorAll('.pmu-irow.is-hl-on,.pmu-dl-row.is-hot')), frames: [], wheels: [], scrolls: [], trans: [], loaf: [], cls: [], ops: [], order: 0, fadeMs, rest: cardId(document.querySelector('#pmuBoard .pmu-card:hover')), t0: performance.now(), probe: null, timer: null });
		globalThis.setTimeout = timed;
		sampler.observe(sampleBox);
		raf = requestAnimationFrame(tick);
	};
	R.stop = () => {
		R.on = false;
		clearTimeout(R.probeTimer);
		if (globalThis.setTimeout === timed) globalThis.setTimeout = nativeTimeout;
		cancelAnimationFrame(raf);
		sampler.disconnect();
		return { t0: R.t0, frames: R.frames, wheels: R.wheels, scrolls: R.scrolls, trans: R.trans, loaf: R.loaf,
			cls: R.cls, ops: R.ops, fadeMs: R.fadeMs, probe: R.probe, timer: R.timer };
	};
	R.state = () => { board = document.getElementById('pmuBoard'); const hc = board.querySelector(':scope > .pmu-card:hover'), tools = hc && hc.querySelector('.pmu-cardtools'); return { card: cardId(hc), lit: !!(hc && hc.classList.contains('pmh-on')), tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null }; };
	return true;
};

// Both trusted wheel delivery and movement of the Usage scroll pane can re-arm the same hold.
function holdInputs(wheels, scrolls) {
	const time = (input) => typeof input === 'number' ? input : input.t;
	const first = wheels.length ? time(wheels[0]) : Infinity;
	return wheels.concat(scrolls).map(time).filter((t) => Number.isFinite(t) && t >= first).sort((a, b) => a - b);
}

// R1 and R2 from one window's record (pure, so the verdict can be read back from a dump)
export function judge(rec, { rest, back }) {
	const first = rec.wheels[0], lastWheel = rec.wheels.at(-1), firstScroll = rec.scrolls.find((t) => t >= first);
	const lastScroll = rec.scrolls.at(-1) ?? lastWheel, end = Math.max(lastWheel, lastScroll);
	// Allow 2 ms between the window-capture timestamp and the scroller's re-arm in the same task.
	const due = end + REST_MS, ops = (rec.ops || []).filter((x) => x.t >= first);
	const startIndex = ops.findIndex((x) => x.op === 'wheel'), started = ops[startIndex];
	const release = startIndex < 0 ? null : ops.slice(startIndex + 1).find((x) => x.op !== 'wheel');
	const during = (x) => x.t >= firstScroll + 50 && x.t < due - 2;
	const active = rec.frames.filter(during);
	const coverage = firstScroll != null && started?.t <= firstScroll + 50 && release?.t >= due - 2 &&
		active.every((x) => x.op === 'wheel');
	const neutralExit = (x) => {
		if(x.card!==rest || x.to==null) return false;
		const cs=x.cls.split(/\s+/);
		if(x.prop==='opacity'&&(cs.includes('pmu-cardtools')||cs.includes('pmu-h'))) return Number(x.from)>0&&Number(x.to)===0;
		if(x.prop==='pointer-events'&&cs.includes('pmu-cardtools')) return x.from==='auto'&&x.to==='none';
		if(x.prop==='margin-right'&&cs.includes('pmu-cardtitles')) return parseFloat(x.from)>0&&parseFloat(x.to)===0;
		return false;
	};
	const ins = rec.trans.filter((x) => during(x) && x.under && !x.approved && !x.chartControlled && !x.exiting && !neutralExit(x));
	const litFrames = active.filter((x) => x.lit.length || x.near?.length || x.proxyLit);
	const toolFrames = active.filter((x) => x.t >= firstScroll + (rec.fadeMs ?? 140) + 50 && x.tools > 0.05);
	// R2 times the first actual return after the pause's real end. An already-lit target is an early return.
	const after = rec.frames.filter((x) => x.t >= due - 2);
	const settled = after.at(-1), target = settled?.card;
	const endT = release?.t ?? null;
	// R125 #3: the return is judged only after the marker's actual removal. The old search started at the nominal
	// deadline, so when the marker outlived it a light and tools already back in the gap counted (a negative back
	// delay), and the row passed a page that never stayed suppressed to its end. Signals before the actual end are
	// now an early return; the return itself must be seen at or after it.
	const sinceEnd = (x) => endT != null && x.t >= endT;
	const early = endT == null ? [] : after.filter((x) => x.t < endT && (x.proxyLit || (x.card === target && (x.lit.includes(target) || x.tools > 0.5))));
	const earlyClass = release && (rec.cls || []).some((x) => {
		const beforeRelease = x.t < endT || (x.t === endT && x.order < release.order);
		const afterStart = x.t > started.t || (x.t === started.t && x.order > started.order);
		return x.card === target && x.on && beforeRelease && afterStart;
	});
	const lightT = settled?.lit.includes(target) && settled.tools > 0.5 ?
		after.find((x) => sinceEnd(x) && x.card === target && x.lit.includes(target))?.t ?? null : null;
	const toolsTr = rec.trans.find((x) => sinceEnd(x) && x.card === target && x.prop === 'opacity' && /pmu-cardtools/.test(x.cls));
	const toolsFr = after.find((x) => sinceEnd(x) && x.card === target && x.tools > 0.5);
	const toolsT = toolsFr ? toolsFr.t : Infinity;
	const targetSamples = after.filter((x) => sinceEnd(x) && x.card === target);
	const proxyT = settled?.proxyRequired ? (settled.proxyBack ?
		targetSamples.find((x) => x.proxyBack)?.t ?? Infinity : Infinity) : endT;
	// A glow starts at zero opacity. Require it armed with the light and tools, plus a separate visible sample by the cap.
	const proxyStart = settled?.proxyRequired ? targetSamples.find((x) => x.proxyArmed || x.proxyBack)?.t ?? Infinity : endT;
	const backT = coverage && !litFrames.length && !toolFrames.length && !early.length && !earlyClass && lightT != null && toolsT !== Infinity && proxyStart !== Infinity ? Math.max(lightT, toolsT, proxyStart) : null;
	// A probe on the last input estimates lateness, the product callback has a bounded return interval, and the
	// first two sampled frames after marker clear must show the light and tools back. The outer cap covers the whole return.
	const probe = rec.probe && Number.isFinite(rec.probe.due) && Number.isFinite(rec.probe.fired) ? rec.probe : null;
	const late = probe ? Math.max(0, probe.fired - probe.due) : null;
	const endDelay = endT != null ? endT - end : null;
	// A shared queue can delay both callbacks. Entry delay beyond the probe is separate from the time in wheelEnd.
	// Report the residual after subtracting the 150 ms rest and observed probe lateness.
	const work = endDelay != null && late != null ? endDelay - REST_MS - late : null;
	const timer = rec.timer;
	const entry = probe && timer?.inputDue === probe.due && Number.isFinite(timer?.entered) ? timer.entered : null;
	const entryGap = entry != null ? entry - Math.max(due, probe.fired) : null;
	// R132-FOLLOWUPS 6: the probe and the product's wheelEnd are separate timer callbacks sharing the renderer
	// queue. When the product armed its 150 ms timeout at the input (armed within the same-task 2 ms of
	// inputDue - 150), a gap between the callbacks is queue scheduling, not product work, and no longer fails on
	// its own. A late arm, an early entry, work past RETURN_WORK_MS and the total endDelay bound still fail.
	const armedAtInput = timer != null && Number.isFinite(timer.armed) && timer.armed <= timer.inputDue - REST_MS + 2;
	const callbackWork = entry != null && endT != null ? endT - entry : null;
	const endOk = entryGap != null && (entryGap <= 2 || armedAtInput) && entry >= due - 2 &&
		callbackWork != null && callbackWork >= 0 && callbackWork <= RETURN_WORK_MS &&
		endDelay >= REST_MS - 2 && endDelay <= REST_MS + late + RETURN_WORK_MS + 2;
	const backDelay = backT != null && endT != null ? backT - endT : null;
	// R125 #2: the sample that first shows the return is counted, so a light first seen on the third sample after the
	// end reads 3 frames and fails; two frames means the return is on the first or the second drawn sample.
	const backFrames = backT != null && endT != null ? rec.frames.filter((x) => x.t > endT && x.t <= backT).length : null;
	const backOk = backFrames != null && backFrames <= 2;
	const capOk = backT != null && Math.max(backT, proxyT) - end <= back;
	return {
		r1: { ok: coverage && active.length >= 5 && ins.length === 0 && litFrames.length === 0 && toolFrames.length === 0, toolFrames: toolFrames.length, coverage, pauseEnd: release?.t, ins: ins.length, insCards: [...new Set(ins.map((x) => x.card))], insProps: [...new Set(ins.map((x) => x.prop + ' ' + x.cls.split(' ')[0]))].slice(0, 8), litFrames: litFrames.length, frames: rec.frames.filter(during).length, cardsPassed: [...new Set(rec.frames.filter(during).map((x) => x.card).filter(Boolean))].length },
		r2: { ok: coverage && !litFrames.length && !toolFrames.length && backT != null && endOk && backOk && capOk,
			ms: backT != null ? Math.round(backT - end) : null, card: target,
			light: lightT != null ? Math.round(lightT - end) : null, tools: toolsT !== Infinity ? Math.round(toolsT - end) : null, toolsTransition: toolsTr ? Math.round(toolsTr.t - end) : null,
			proxy: settled?.proxyRequired && Number.isFinite(proxyT) ? Math.round(proxyT - end) : null, proxyRequired: !!settled?.proxyRequired,
			end: endDelay != null ? Math.round(endDelay) : null, late: late != null ? Math.round(late) : null, work: work != null ? Math.round(work) : null,
			entryGap: entryGap != null ? Math.round(entryGap) : null, callbackWork: callbackWork != null ? Math.round(callbackWork) : null,
			back: backDelay != null ? Math.round(backDelay) : null, backFrames, early: early.length, earlyClass: !!earlyClass,
			long: (rec.loaf || []).filter((x) => x.t + x.d > end && x.t < end + 400).map((x) => `+${Math.round(x.t - end)} ms ${x.d} ms (style/layout ${x.sl}: ${x.scripts.join('; ') || 'no script'})`) },
		span: { wheel: Math.round(lastWheel - first), tail: Math.round(lastScroll - lastWheel), wheels: rec.wheels.length, scrolls: rec.scrolls.length },
		burst: burstState(holdInputs(rec.wheels, rec.scrolls)), wheelGap: burstState(rec.wheels).maxGap
	};
}

export function uninterruptedIntent({ enterIndex, overs, applied }) {
	return enterIndex != null && overs.slice(enterIndex + 1).every((t) => t > (applied ?? Infinity));
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
		const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard'), root = document.getElementById('pmuApp');
		const r = window.__uhpRace = { enter: null, enterIndex: null, overs: [], applied: null, wheel: null, end: null, pauses: [], during: [], frames: 0, moves: 0, outs: 0, startTop: sc.scrollTop,
			clean: !board.querySelector('.is-hl-dim, .is-hl-on'), marks: board.querySelectorAll('.pmu-mark[data-prov]').length };
		let target = null, running = true;
		const over = (e) => {
			const provider = e.target.closest?.('[data-prov]');
			if (!provider || !root.contains(provider) || provider.closest('.pmu-gallery')) return;
			const now = performance.now(), column = provider.closest('.pmu-skycol[data-prov]');
			if (!target && column && board.contains(column)) {
				target = column; r.enter = now; r.enterIndex = r.overs.length; r.id = provider.dataset.prov;
			}
			r.overs.push(now);
		};
		const out = (e) => { if (target && target.contains(e.target) && !target.contains(e.relatedTarget)) r.outs++; };
		const wheel = (e) => { r.wheel = performance.now(); r.wx = e.clientX; r.wy = e.clientY; };
		const move = (e) => { if (r.wheel != null && (e.clientX !== r.wx || e.clientY !== r.wy)) r.moves++; };
		const sample = (why) => {
			const lit = board.querySelectorAll('.is-hl-dim, .is-hl-on');
			if (lit.length && r.applied == null) r.applied = performance.now();
			if (board.getAttribute('data-op') !== 'wheel') return;
			r.frames++;
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
		root.addEventListener('pointerover', over, true); board.addEventListener('pointerout', out, true);
		sc.addEventListener('wheel', wheel, { capture: true, passive: true }); sc.addEventListener('pointermove', move, true);
		requestAnimationFrame(frame);
		r.stop = () => {
			running = false; mo.disconnect(); root.removeEventListener('pointerover', over, true); board.removeEventListener('pointerout', out, true);
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
	const qualified = rec.clean && rec.eligibleDim + rec.eligibleOn > 0 && gap != null && gap >= 0 && gap < 110 &&
		rec.top > rec.startTop && rec.targetHovered && !rec.moves && !rec.outs && uninterruptedIntent(rec);
	await t.check(label + 'R4 could judge: enter then wheel within 110 ms, with the same provider intent pending',
		qualified, `enter-to-wheel ${gap} ms, scroll ${rec.top - rec.startTop} px, hovered ${rec.targetHovered}, moves ${rec.moves}, leaves ${rec.outs}, over ${JSON.stringify(rec.overs)}, applied ${rec.applied}, clean ${rec.clean}, eligible dim/on ${rec.eligibleDim}/${rec.eligibleOn}`);
	if (!qualified) return rec;
	if (String(t.args.raceNoPause || '') === '1') {
		await t.check(label + 'R4 main control has no wheel marker and its ordinary provider intent completes', rec.pauses.length === 0 && rec.correct && rec.dim===rec.eligibleDim && rec.on===rec.eligibleOn && rec.dim+rec.on>0);
		t.log(label + 'R4 main control: ordinary chart behavior is judged above; marker-only checks are inapplicable');
		return rec;
	}
	await t.check(label + 'R4 main provider intent completes during the wheel hold without being cancelled or rearmed', rec.pauses.length > 0 && rec.frames > 0 && rec.during.some(x=>x.t>=rec.enter+110),
		`${rec.pauses.length} pauses, ${rec.frames} paused samples, ${rec.during.length} lit samples: ${JSON.stringify(rec.during.slice(0, 3))}`);
	await t.check(label + 'R4 main provider highlight remains after the hold without a synthetic return', rec.end != null && !rec.paused && rec.targetHovered && rec.eligibleDim + rec.eligibleOn > 0 && rec.dim === rec.eligibleDim && rec.on === rec.eligibleOn && rec.correct,
		`pause end ${rec.end}, paused ${rec.paused}, hovered ${rec.targetHovered}, dim ${rec.dim}, on ${rec.on}, correct provider ${rec.correct}`);
	return rec;
}

// R5's INPUT-DELIVERY qualification of one mount record (exported for tools/usage-hover-pause-verdict.selftest.mjs).
// A busy mount can delay event delivery past 150 ms while the already-queued wheel task precedes the timer; Chrome
// may coalesce queued wheel inputs while busy, so at least 80% must reach the page. R135-F2/R136-N1: product
// behaviour is NOT qualification — samples only push while the live board IS the destination room and targetHovered
// matches a room-exclusive selector (62-boards-data.js: overview has no provider widget, accounts no skyline), so a
// failed or wrong mount forces during [] and targetHovered false. Qualification reads only what the INPUT did:
// activation delivered, wheels delivered and trusted, burst intact, no pointer move, calibration at the top, and
// the pointer witnessed over the board's hover area BEFORE the burst. The mount outcome is judged by r5MountProduct.
export function r5MountQualified(rec, { inputs = 203, activated, burstBroke, destinationTop }) {
	return activated && rec.wheels.length >= inputs * 0.8 && rec.wheels.every((w) => w.trusted) && !burstBroke && !rec.moves && destinationTop === 0 && rec.pointerOnBoard;
}

// R5's product assertions on qualified input (R135-F2, R136-N1, R136-C2): the old board enters the wheel hold,
// the mounted room resets its scroll position, the pause ends only after the last wheel, and the board swaps to
// the live room — a mounted room the pointer is over, sampled during the burst. A fault here FAILS the run, never
// could-not-judge.
export function r5MountProduct(rec, { last, during }) {
	return rec.oldPaused && rec.mountedTop === 0 && rec.ends.every((e) => e.t > last) && rec.swaps > 0 && rec.liveRoom === rec.room && during.length > 10 && rec.targetHovered;
}

// What the single-burst assertions do with the record (PM7PERF-R5-UNQUALIFIED-RETURNS-COUNTED): once R5 rejects the
// input, delivery gaps past the 150 ms idle timer let the product's legitimate idle returns happen (TIB-FILMS' GPU
// films head+base show the tools return in each gap and fade on renewed scrolling), so they read one could-not-judge
// row, never failures. A broke burst keeps its R5-CASCADE SKIP log; only a qualified intact burst is judged.
export function r5BurstGate({ qualified, burstBroke }) {
	if (burstBroke) return 'skip';
	if (!qualified) return 'could-not-judge';
	return 'judge';
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
		// R136-N1: witness the pointer's pre-burst position from the real move events (frame coordinates), so
		// qualification can require the pointer over the board's hover area without asking the product's outcome.
		await f.evaluate(() => {
			window.__uhpPrePointer = null;
			const track = (e) => { window.__uhpPrePointer = [e.clientX, e.clientY]; };
			document.addEventListener('pointermove', track, true);
			window.__uhpPrePointerStop = () => document.removeEventListener('pointermove', track, true);
		});
		await t.page.mouse.move(at.x, at.y, { steps: 4 });
		await t.page.waitForTimeout(500);
		await f.evaluate(({ room, baseline, selector }) => {
			const sc = document.getElementById('pmuScroll'), old = document.getElementById('pmuBoard');
			const pre = window.__uhpPrePointer;
			if (window.__uhpPrePointerStop) { window.__uhpPrePointerStop(); delete window.__uhpPrePointerStop; }
			const preHit = pre && document.elementFromPoint(pre[0], pre[1]);
			const r = window.__uhpMount = { room, wheels: [], scrolls: [], keys: [], samples: [], ends: [], moves: 0, oldPaused: false, swaps: 0, mountedTop: null,
				pointerOnBoard: !!(preHit && sc.contains(preHit) && preHit.closest('.pmu-board')) };
			let running = true, last = old, position = null;
			const live = () => document.getElementById('pmuBoard');
			const mountObserver = new MutationObserver(() => queueMicrotask(() => {
				const b = live();
				if (r.mountedTop == null && b?.dataset.room === room) r.mountedTop = sc.scrollTop;
			}));
			mountObserver.observe(sc, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-room'] });
			const wheel = (e) => { r.wheels.push({ t: performance.now(), trusted: e.isTrusted }); position = [e.clientX, e.clientY]; };
			// Native input can mount the room before the next paint; witness the initial hold after its wheel handler.
			const scroll = () => r.scrolls.push(performance.now());
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
						lit: b.querySelectorAll('.pmh-on, .pmh-near').length,
						tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null,
						rows: rows.filter((row, i) => row.matches(':hover') && !row.matches('.is-hl-on,.is-hot') && baseline[i] !== getComputedStyle(row).backgroundColor).length,
						hit:inPane?{room:hitBoard.dataset.room,live:hitBoard===b,ghost:hitBoard.classList.contains('pmu-ghostboard'),op:hitBoard.getAttribute('data-op'),widget:hitCard.dataset.widget,alpha,tools:hitTools?+getComputedStyle(hitTools).opacity*alpha:null,lit:hitCard.querySelectorAll('.pmh-on,.pmh-near').length+Number(hitCard.matches('.pmh-on,.pmh-near')),rows:hitRow&&!hitRow.matches('.is-hl-on,.is-hot')&&neutral.has(hitRow)&&neutral.get(hitRow)!==getComputedStyle(hitRow).backgroundColor?1:0}:null });
				}
				requestAnimationFrame(sample);
			};
			sc.addEventListener('wheel', wheel, { capture: true, passive: true }); sc.addEventListener('wheel', held, { passive: true }); sc.addEventListener('scroll', scroll, { passive: true });
			document.addEventListener('keydown', keydown, true); sc.addEventListener('pointermove', move, true);
			document.addEventListener('pmu-op-end', end); requestAnimationFrame(sample);
			r.stop = () => {
				running = false; mountObserver.disconnect(); sc.removeEventListener('wheel', wheel, true); sc.removeEventListener('wheel', held); sc.removeEventListener('scroll', scroll); document.removeEventListener('keydown', keydown, true);
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
		const INPUTS = 203, inputs = [], sent = [];
		for (let i = 0; i < INPUTS; i++) {
			if (i === 3) inputs.push(t.page.keyboard.press(key));
			sent.push(performance.now());
			inputs.push(t.page.mouse.wheel(0, i < 3 || i % 2 ? 1 : -1));
			await new Promise((resolve) => setTimeout(resolve, 30));
		}
		await Promise.all(inputs);
		await t.page.waitForTimeout(1200);
		const rec = await f.evaluate(() => window.__uhpMount.stop());
		const first = rec.wheels[0]?.t, last = rec.wheels.at(-1)?.t;
		const during = rec.samples.filter((s) => s.t >= first && s.t <= last);
		const maxGap = burstState(rec.wheels).maxGap, driverGap = burstState(sent).maxGap;
		const burst = burstState(holdInputs(rec.wheels, rec.scrolls)), burstBroke = burst.broke, burstDetail = burstBroke ? burstWhy(burst) : null;
		const activated = rec.keys.some((k) => k.trusted && k.room === room && k.t > first && k.t < last);
		const S = label + `R5 ${room} (${rm ? 'Reduced Motion spare' : 'motion on'}, ${key}): `;
		const detail = `wheels ${rec.wheels.length}, max gap ${burst.maxGap} ms (wheel delivery ${maxGap} ms, driver ${driverGap} ms), samples ${during.length}, swaps ${rec.swaps}, moves ${rec.moves}, target ${rec.targetHovered}, calibration scroll ${destinationTop}, mounted scroll ${rec.mountedTop ?? 'unread'}`;
		t.log(S + detail + ' | return ' + JSON.stringify({ ends: rec.ends, op: rec.op, cardLit: rec.cardLit, tools: rec.tools, provider: rec.provider }));
		records.push({ room, attempt: attempt + 1, at, destinationTop, maxGap, driverGap, burst, rec });
		const qualified = r5MountQualified(rec, { inputs: INPUTS, activated, burstBroke, during, destinationTop });
		if (!qualified && attempt < 2) { t.log(S + `unjudgeable attempt ${attempt + 1}; repeat the same input route: ` + detail); continue; }
		await t.check(S + 'could judge trusted keyboard mount within one stationary wheel burst', qualified, detail);
		// PM7PERF-R5-UNQUALIFIED-RETURNS-COUNTED: the rejected input's idle returns are the product working; one
		// could-not-judge row stands in for the single-burst assertions, which cannot judge this record.
		const gate = r5BurstGate({ qualified, burstBroke });
		if (gate === 'could-not-judge') {
			await t.check(S + 'R5 suppression/restoration judges one stationary wheel burst', false,
				'could not judge: R5 rejected the input as unqualified; the idle returns in the delivery gaps are the product working, not a pause failure (TIB-FILMS GPU films head+base); ' + detail);
			break;
		}
		if (String(t.args.mountNoPause || '') === '1') {
			await t.check(S + 'main control has no pause interval', !rec.oldPaused && during.every((s) => s.op !== 'wheel'));
			t.log(S + 'SKIP R5 suppression/restoration: explicit mountNoPause control has no wheel hold');
			break;
		}
		// A broken burst lets the pause end correctly mid-burst: the could-judge row above has failed, and the rows that
		// depend on the pause surviving the burst are skipped with the gap, not failed (PM7PERF-HOVERPAUSE-R5-CASCADE).
		if (gate === 'skip') { t.log(S + 'SKIP R5 suppression/restoration: ' + burstDetail); break; }
		// R135-F2: the product assertions judge on qualified input; a fault fails, never could-not-judge.
		await t.check(S + 'R5 mount keeps the wheel hold, resets scroll, swaps to the live room and ends after the last wheel', r5MountProduct(rec, { last, during }), JSON.stringify({ oldPaused: rec.oldPaused, mountedTop: rec.mountedTop, swaps: rec.swaps, liveRoom: rec.liveRoom, room: rec.room, ends: rec.ends, last, during: during.length, targetHovered: rec.targetHovered }));
		await t.check(S + 'live board keeps its wheel marker after the mount', !burstBroke && rec.oldPaused && during.length > 0 && during.every((s) => s.op === 'wheel'), burstDetail || `${during.filter((s) => s.op !== 'wheel').length}/${during.length} live samples lost marker`);
		// Allow the first 100 ms for an already-lit reused card's outgoing fade; nothing arriving may light thereafter.
		const settled = during.length ? during.filter((s) => s.t >= during[0].t + 100) : [];
		await t.check(S + 'live card tools, CSS row backgrounds and engine lights stay paused', !burstBroke && settled.length > 10 && settled.every((s) => !s.lit && (s.tools == null || s.tools <= 0.05) && !s.rows), burstDetail || `${settled.filter((s) => s.lit || s.tools > 0.05 || s.rows).length}/${settled.length} lit samples`);
		const hitSamples=settled.filter(s=>s.hit&&s.hit.alpha>.02),ghostSamples=hitSamples.filter(s=>s.hit.ghost&&!s.hit.live);
		t.log(S+'R116 T1 hit-tested surfaces: '+JSON.stringify({samples:hitSamples.length,ghost:ghostSamples.length,bad:hitSamples.filter(s=>s.hit.tools>.05||s.hit.lit||s.hit.rows)}));
		await t.check(S+'R116 T1 hit-tested card tools, rows and light stay paused on either visible board',!burstBroke&&hitSamples.length>10&&hitSamples.every(s=>!(s.hit.tools>.05)&&!s.hit.lit&&!s.hit.rows),burstDetail || `${hitSamples.filter(s=>s.hit.tools>.05||s.hit.lit||s.hit.rows).length}/${hitSamples.length} lit hit-tested samples; ${ghostSamples.length} on outgoing ghost`);
		if(!rm)await t.check(S+'R116 P1 could judge outgoing ghost above incoming room during wheel hold',ghostSamples.length>0,`${ghostSamples.length} visible outgoing ghost hits`);
		await t.check(S + 'pause end restores the LIVE board light and tools without a move', !burstBroke && rec.ends.length === 1 && rec.ends[0].live && rec.ends[0].room === room && rec.ends[0].t > last && !rec.op && rec.oldOp !== 'wheel' && rec.cardLit && rec.tools > 0.5, burstDetail || JSON.stringify({ ends: rec.ends, op: rec.op, oldOp: rec.oldOp, cardLit: rec.cardLit, tools: rec.tools }));

		break;
		}
	}
	await park();
	return records;
}

// R100: wheel from a fully applied chart/card state, not merely from pending pointer intent.
async function appliedHighlights(t, f, label, park) {
	const records = [], wanted = String(t.args.chartCases || 'provider,donut,column,engine,tool').split(','), rm = String(t.args.rm || '') === '1';
	const routes = wanted.flatMap((kind)=>kind === 'tool' && rm ? [{kind,reducedTool:true},{kind,reducedTool:false}] : [{kind,reducedTool:rm}]), attempts={};
	const liveWasOn = await f.evaluate(() => { const on = PMU.live.on(); PMU.live.pause(); return on; });
	for(let route=0;route<routes.length;route++) {
		const {kind,reducedTool}=routes[route],key=kind+':'+reducedTool,attempt=attempts[key]=(attempts[key]||0)+1;
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
				readout: !!chart.querySelector('.pmu-xh-on'),ro:[...document.querySelectorAll('.pmu-readout.is-on')].map(el=>el.textContent), lit: target.classList.contains('pmh-on'), engineRunning: window.PMH?.stats?.().running });
			r.neutral = read();
			const immediate=()=>{if(kind==='tool'&&reducedTool)r.immediate=read();};
			const wheel = (e) => { r.wheels.push({ t: performance.now(), trusted: e.isTrusted }); pos = [e.clientX,e.clientY]; point = pos; };
			const scroll = () => r.scrolls.push({ t: performance.now(), top: sc.scrollTop });
			const move = (e) => { point = [e.clientX,e.clientY]; if (pos && (e.clientX !== pos[0] || e.clientY !== pos[1])) r.moves++; };
			const start = (e) => { if (e.detail?.board === b && b.getAttribute('data-op') === 'wheel') r.marked = true; };
			const end = (e) => { if (e.detail?.board === b) r.ends.push(performance.now()); };
			const sample = () => { if (!running) return; if (kind === 'engine' || b.getAttribute('data-op') === 'wheel') r.frames.push(read()); requestAnimationFrame(sample); };
			sc.addEventListener('wheel', wheel, { capture:true, passive:true }); sc.addEventListener('scroll',immediate,{passive:true}); sc.addEventListener('scroll', scroll, { passive:true }); sc.addEventListener('pointermove', move, true);
			document.addEventListener('pmu-op-start', start); document.addEventListener('pmu-op-end', end); requestAnimationFrame(sample);
			r.read = read;
			r.stop = () => { running=false; sc.removeEventListener('wheel',wheel,true); sc.removeEventListener('scroll',immediate); sc.removeEventListener('scroll',scroll); sc.removeEventListener('pointermove',move,true); document.removeEventListener('pmu-op-start',start); document.removeEventListener('pmu-op-end',end); if (r.pressListener) document.removeEventListener('pointerdown',r.pressListener,true); delete r.pressListener; return { ...r, read:undefined, stop:undefined, after:read() }; };
		}, { kind, selector, reducedTool });
		await t.page.mouse.move(at.x, at.y, { steps: 4 });
		await t.page.waitForTimeout(kind === 'engine' ? 4000 : 900);
		if (kind === 'tool') {
			const menu = target.locator('.pmu-cardmenu').first(), mb = await menu.boundingBox();
			if (!mb) { await f.evaluate(() => window.__uhpApplied.stop()); await t.check(label + 'R100 tool: menu button exists', false); continue; }
			at = { x: mb.x + mb.width / 2, y: mb.y + mb.height / 2 };
			await t.page.mouse.move(at.x, at.y); await t.page.waitForTimeout(600);
			if(!reducedTool) await f.evaluate(() => {
				const r = window.__uhpApplied;
				const down = (e) => { document.removeEventListener('pointerdown',down,true); const c = e.target.closest('.pmu-card'); const tools = c?.querySelector('.pmu-cardtools'); r.press={ trusted:e.isTrusted, tool:e.target.closest('[data-tool]')?.dataset.tool, opacity:tools ? parseFloat(getComputedStyle(tools).opacity) : null, paused:document.getElementById('pmuBoard').getAttribute('data-op') === 'wheel' }; };
				r.pressListener = down;
				document.addEventListener('pointerdown',down,true);
			});
		}
		const S = label + 'R100 ' + kind + (rm && kind === 'tool' ? (reducedTool ? ' (Reduced Motion)' : ' (motion enabled)') : '') + ': ';
		const pre = await f.evaluate(() => window.__uhpApplied.read());
		if (kind === 'tool') {
			await t.page.mouse.wheel(0, 1);
			if (!reducedTool) {
				try {
					await f.waitForFunction(() => window.__uhpApplied.marked, null, { timeout: 10000 });
				} catch (error) {
					if (error.name !== 'TimeoutError') throw error;
					const rec = await f.evaluate(() => window.__uhpApplied.stop());
					records.push({ kind, attempt, pre, rec });
					await t.check(S + 'could judge the fading-tool press: no pause marker within 10 s', false,
						JSON.stringify({ wheels: rec.wheels, scrolls: rec.scrolls }));
					await park();
					continue;
				}
				await t.page.mouse.down(); await t.page.mouse.up();
			}
		}
		else for(let i=0;i<18;i++){await t.page.mouse.wheel(0,kind==='engine'?-1:i%2?-1:1);await t.page.waitForTimeout(30);}
		await t.page.waitForTimeout(900);
		const rec = await f.evaluate(() => { const r=window.__uhpApplied.stop(); r.menuOpen=!!PMU.menu.current(); return r; });
		const last=rec.wheels.at(-1)?.t, marked=rec.frames.filter((x) => x.t >= rec.wheels[0]?.t+50);
		records.push({kind,attempt,pre,rec});
		t.log(S+JSON.stringify({pre, neutral:rec.neutral, frames:marked.length, ends:rec.ends, press:rec.press, after:rec.after}));
		if (kind === 'tool' && reducedTool) {
			await t.check(S+'could judge unfocused shown tools and trusted wheel in Reduced Motion',pre.hovered&&pre.reduced&&pre.toolOpacity>0.5&&rec.wheels.length===1&&rec.wheels[0].trusted&&rec.immediate?.op==='wheel'&&!rec.moves,JSON.stringify({pre,immediate:rec.immediate,wheels:rec.wheels,moves:rec.moves}));
			await t.check(S+'tools conceal immediately on the first wheel-driven scroll under Reduced Motion',rec.immediate?.reduced&&rec.immediate.toolOpacity===0&&rec.immediate.toolPointerEvents==='none',JSON.stringify(rec.immediate));
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
			const qualified=shown&&pre.hovered&&rec.after.hovered&&!rec.moves&&marked.length>=10&&rec.wheels.length===18&&rec.wheels.every(w=>w.trusted)&&(kind==='engine' ? pre.top===0 && rec.after.top===0 && !travel.length : rec.ends.length===1 && rec.ends[0]>last && travel.length>0);
			// Retake only an unqualified chart input window, as R5 does. A qualified wrong chart state fails at once.
			if(!qualified&&['provider','donut','column'].includes(kind)&&attempt<3){t.log(S+'unqualified native input attempt '+attempt+'; same fixture/prerequisites repeated: '+JSON.stringify({wheels:rec.wheels.length,ends:rec.ends,frames:marked.length,moves:rec.moves}));await park();route--;continue;}
			await t.check(S+'could judge already-applied state, still pointer and a sampled wheel input window',qualified,JSON.stringify({attempt,shown,pre,after:rec.after,frames:marked.length,scrolls:travel,ends:rec.ends}));
			const same=(s)=>kind==='provider'?s.hl===pre.hl:kind==='donut'?s.dim===pre.dim&&JSON.stringify(s.hotRows)===JSON.stringify(pre.hotRows)&&s.value===pre.value&&s.caption===pre.caption:kind==='column'?(rec.scrolls.length&&s.t>=rec.scrolls[0].t?!s.cols&&!s.bars&&!s.readout:s.cols===pre.cols&&s.bars===pre.bars&&s.readout===pre.readout):s.lit&&!s.op&&!s.engineRunning;
			// Main's native scroll listener dismisses an open column readout. Provider/donut selections stay applied;
			// none of these states is cleared or restored by wheel start/end. A stationary pane leaves the settled engine light alone.
			await t.check(S+(kind==='engine'?'wheel at the limit preserves the settled light without waking the engine':'main chart behavior persists throughout the complete wheel hold'),marked.length>=10&&marked.every(same),`${marked.filter(s=>!same(s)).length}/${marked.length} unexpected samples`);
			const a=rec.after,expected=same(a) && (kind!=='engine' || !rec.ends.length);
			await t.check(S+(kind==='engine'?'stationary card light and idle engine persist after input':'main chart behavior remains after hold, with no chart restoration'),!a.op&&a.hovered&&expected,JSON.stringify(a));
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
		const r = window.__uhpDeparture = { pre: b.querySelectorAll('.pmu-col.is-hot-col').length, top: sc.scrollTop, wheels: [], scrolls: [], leaves: [], ends: [], after: [] };
		let running = true, point = null;
		const read = () => ({ t: performance.now(), op: b.getAttribute('data-op'), outside: !sc.matches(':hover'),
			column: b.querySelectorAll('.pmu-col.is-hot-col,.pmu-cols.is-hot').length,
			provider: b.querySelectorAll('.is-hl-on,.is-hl-dim').length,
			donut: b.querySelectorAll('path[data-mark="arc"].is-dim,.pmu-dl-row.is-hot').length,
			card: b.querySelectorAll('.pmh-on,.pmh-near').length });
		const wheel = (e) => { point = [e.clientX,e.clientY]; r.wheels.push({t:performance.now(),trusted:e.isTrusted}); };
		const scroll = () => r.scrolls.push({t:performance.now(),top:sc.scrollTop,held:b.getAttribute('data-op')==='wheel'});
		// Capture before the scroller's own leave handler can end the pause on the fixed page.
		const leave = (e) => { if (sc.contains(e.target) && !sc.contains(e.relatedTarget)) r.leaves.push({t:performance.now(),trusted:e.isTrusted,held:b.getAttribute('data-op')==='wheel'}); };
		const end = (e) => { if (e.detail?.board === b) { const hit = point && document.elementFromPoint(...point); r.ends.push({t:performance.now(),outside:!sc.matches(':hover'),oldPointOnPlot:!!hit?.closest('.pmu-colsplot')}); } };
		const sample = () => { if (!running) return; if (r.ends.length) r.after.push(read()); requestAnimationFrame(sample); };
		sc.addEventListener('wheel',wheel,{passive:true}); sc.addEventListener('scroll',scroll,{passive:true}); document.addEventListener('pointerout',leave,true); document.addEventListener('pmu-op-end',end);
		requestAnimationFrame(sample);
		r.stop = () => { running=false; sc.removeEventListener('wheel',wheel); sc.removeEventListener('scroll',scroll); document.removeEventListener('pointerout',leave,true); document.removeEventListener('pmu-op-end',end); return {...r,stop:undefined,final:read()}; };
	});
	await t.page.mouse.wheel(0,1);
	// TB6 item 3: a loaded host can delay the wheel's scroll past the wait. Catch it and report the group as could not
	// judge instead of aborting the whole check at ~71 of 158 rows (the same class as the real VM abort at keyboardPause).
	let started = true;
	try {
		await f.waitForFunction(() => {
			const r = window.__uhpDeparture;
			return r.scrolls.some((s) => s.held && s.top > r.top);
		}, null, { timeout: 10000 });
	} catch (e) { started = false; }
	if (!started) {
		const rec = await f.evaluate(() => window.__uhpDeparture.stop());
		const why = 'could not judge: the trusted wheel never scrolled the board with its wheel marker within 10 s';
		t.log(label + 'R107 departure: ' + JSON.stringify({ start: 'the wheel never scrolled the held board', wheels: rec.wheels.length, scrolls: rec.scrolls.length, top: rec.top }));
		await t.check(label + 'R107 could judge: trusted wheel on a lit column, direct departure during the hold, old point still on the plot', false, why);
		await t.check(label + 'R107 no column, provider, donut or card light returns while the pointer remains outside the board', false, why);
		await park();
		await f.evaluate((on) => { PM7_USAGE.setRoomDetail('overview','glance'); if(on) PMU.live.resume(); },liveWasOn);
		await t.page.waitForTimeout(4500);
		return rec;
	}
	await t.page.mouse.move(outside.x,outside.y);
	await t.page.waitForTimeout(900);
	const rec = await f.evaluate(() => window.__uhpDeparture.stop());
	const firstScroll = rec.scrolls[0], gap = rec.leaves[0]?.t - firstScroll?.t;
	t.log(label + 'R107 departure: ' + JSON.stringify(rec));
	await t.check(label + 'R107 could judge: trusted wheel on a lit column, direct departure during the hold, old point still on the plot',
		rec.pre===1 && rec.wheels.length===1 && rec.wheels[0].trusted && firstScroll?.held && firstScroll.top > rec.top && rec.leaves.length===1 && rec.leaves[0].trusted && rec.leaves[0].held && gap>=0 && gap<150 && rec.ends.length===1 && rec.ends[0].outside && rec.ends[0].oldPointOnPlot && rec.after.length>=5 && rec.after.every((x)=>x.outside) && rec.final.outside && !rec.final.op,
		`departure ${gap} ms after first scroll; ${JSON.stringify({...rec,after:rec.after.length})}`);
	await t.check(label + 'R107 no column, provider, donut or card light returns while the pointer remains outside the board',
		rec.after.length>=5 && rec.after.every((x)=>x.outside && !x.column && !x.provider && !x.donut && !x.card) && rec.final.outside && !rec.final.column && !rec.final.provider && !rec.final.donut && !rec.final.card,
		`${rec.after.filter((x)=>x.column || x.provider || x.donut || x.card).length}/${rec.after.length} lit post-return frames; final ${JSON.stringify(rec.final)}`);
	await park();
	await f.evaluate((on) => { PM7_USAGE.setRoomDetail('overview','glance'); if(on) PMU.live.resume(); },liveWasOn);
	await t.page.waitForTimeout(4500);
	return rec;
}

// R112: keyboard gestures need no pointer press/move, so they can take over an outstanding wheel return.
export function judgeShortHandoff(rec) {
	const wheel = rec.wheels[0], press = rec.keys.find((k) => k.key === rec.key), escape = rec.keys.find((k) => k.key === 'Escape');
	const last = rec.scrolls.filter((s) => s.t < press?.t && s.op === 'wheel').at(-1);
	const due = last ? last.t + REST_MS : null;
	const entered = rec.markers.find((x) => x.t >= press?.t && x.t < escape?.t &&
		x.gesture?.kb && x.gesture.type === rec.mode && x.dragHeld && x.op === rec.mode);
	// The body releases the drag flag at idle sync, independently of what the board writes for data-op.
	const idle = rec.markers.find((x) => x.t >= escape?.t && !x.gesture && !x.dragHeld);
	const qualified = !!(wheel?.trusted && rec.wheels.length === 1 && last && last.top > rec.pre.top &&
		press?.trusted && press.focused === 'health' && escape?.trusted && entered?.hovered &&
		idle && idle.t < due && !rec.moves);
	const held = [...rec.markers, ...rec.frames].filter((x) => x.t >= idle?.t && x.t < due - 2);
	const [end] = rec.ends;
	const ok = qualified && entered.handoff && idle.op === 'wheel' && held.every((x) => x.op === 'wheel' && x.hovered) &&
		rec.ends.length === 1 && end.live && !end.op && !end.gesture && end.t >= due - 2 && end.t <= due + 250 &&
		JSON.stringify(end.point) === JSON.stringify(rec.point) && rec.after.hovered && !rec.after.op && !rec.after.gesture;
	// PM7PERF-V6-P5-IDLE-COVERAGE: when the input setup is intact but the native idle release lands past the
	// original wheel deadline (headless Alexis defers the marker +181-228 ms and the release +341-403 ms), the host
	// cannot qualify the witness; name that limit so the coverage row reads could-not-judge, not a setup failure.
	const setup = !!(wheel?.trusted && rec.wheels.length === 1 && last && last.top > rec.pre.top && press?.trusted && press.focused === 'health' && escape?.trusted && !rec.moves);
	const deferredMarker = rec.markers.find((x) => x.t >= press?.t && x.gesture?.kb && x.gesture.type === rec.mode);
	const hostLimit = !qualified && setup && !!idle && idle.t >= due;
	return { qualified, ok, due, entered: entered?.t ?? null, idle: idle?.t ?? null,
		escape: escape?.t ?? null, press: press?.t ?? null, held: held.length,
		hostLimit, markerAfterScrollMs: deferredMarker && last ? Math.round(deferredMarker.t - last.t) : null,
		releaseAfterScrollMs: idle && last ? Math.round(idle.t - last.t) : null };
}

async function keyboardPause(t, f, label, park, short = false) {
	await park();
	const liveWasOn = await f.evaluate(() => { const on = PMU.live.on(); PMU.live.pause(); PM7_USAGE.setRoomDetail('overview', 'glance'); return on; });
	await t.page.waitForTimeout(4500);
	// Keep the gesture's cards and a real provider mark. Laying out unrelated widgets can delay Chrome's second tick.
	await f.evaluate((short) => {
		const b = PMU.board, board = document.getElementById('pmuBoard');
		const provider = board.querySelector('.pmu-skycol[data-prov]')?.dataset.prov;
		const row = [...board.querySelectorAll('.pmu-irow[data-prov]')].find((el) => el.dataset.prov === provider);
		const mark = [...board.querySelectorAll('.pmu-mark[data-prov]')].find((el) => el.dataset.prov !== provider);
		const witness = !short && (row || mark)?.closest('.pmu-card')?.dataset.widget;
		const keep = new Set(['health', 'ov-skyline', witness]);
		b.visible().filter((id) => !keep.has(id)).forEach((id) => b.setVisible(id, false));
	}, short);
	await t.page.waitForTimeout(1800);
	const minHeight = await f.evaluate(() => {
		const board = document.getElementById('pmuBoard'), pane = document.getElementById('pmuScroll');
		const prior = board.style.minHeight;
		board.style.minHeight = (pane.clientHeight + 80) + 'px';
		return prior;
	});
	const records = [];
	const tries = short ? 3 : 1;
	const done = new Set();
	const cases = [['m', 'move'], ['r', 'resize']].flatMap(([key, mode]) =>
		Array.from({ length: tries }, (_, attempt) => ({ key, mode, attempt: attempt + 1 })));
	for (const { key, mode, attempt } of cases) {
		if (done.has(mode)) continue;
		const S = label + (short ? 'R116 P5 short ' : 'R112 ') + mode + ': ';
		await park();
		await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 0; });
		await f.locator('#pmuBoard > .pmu-card[data-widget="health"]').focus();
		const target = f.locator('#pmuBoard > .pmu-card[data-widget="ov-skyline"] .pmu-skycol[data-prov]').first();
		const box = await target.boundingBox(), pane = await f.locator('#pmuScroll').boundingBox();
		if (!box || !pane) { await t.check(S + 'could judge: Skyline provider and focused card exist', false); continue; }
		await t.page.mouse.move(box.x + box.width / 2, (Math.max(box.y, pane.y) + Math.min(box.y + box.height, pane.y + pane.height)) / 2);
		await t.page.waitForTimeout(900);
		await f.evaluate(({ key, mode, short }) => {
			const sc = document.getElementById('pmuScroll'), board = () => document.getElementById('pmuBoard');
			const target = board().querySelector('.pmu-card[data-widget="ov-skyline"] .pmu-skycol[data-prov]:hover');
			const track = target?.querySelector('.pmu-skytrack');
			const read = () => {
				const b = board();
				const sample = { t: performance.now(), op: b.getAttribute('data-op'), gesture: PMU.board.gesture(),
					handoff: b.hasAttribute('data-wheel-handoff'), dragHeld: document.body.classList.contains('pm-resizing'), top: sc.scrollTop,
					hovered: !!target?.isConnected && target.closest('.pmu-board') === b && target.matches(':hover') };
				// The short native route needs the idle mutation. Continuous style reads consume its idle time.
				if (short) return sample;
				const dim = [...b.querySelectorAll('.is-hl-dim')], on = [...b.querySelectorAll('.is-hl-on')];
				return { ...sample, shadow: track && getComputedStyle(track).boxShadow,
					dim: dim.length, on: on.length, correct: !!target && dim.every((el) => el.dataset.prov !== target.dataset.prov) && on.every((el) => el.dataset.prov === target.dataset.prov),
					eligibleDim: [...b.querySelectorAll('.pmu-mark[data-prov]')].filter((el) => el.dataset.prov !== target?.dataset.prov).length,
					eligibleOn: [...b.querySelectorAll('.pmu-irow[data-prov]')].filter((el) => el.dataset.prov === target?.dataset.prov).length };
			};
			const r = window.__uhpKeyboard = { key, mode, pre: read(), focused: document.activeElement?.dataset.widget, wheels: [], scrolls: [], keys: [], ends: [], moves: 0, frames: [], markers: [] };
			let running = true, point = null, notifyScroll, notifyMarker;
			const shortScroll = short && new Promise((resolve) => { notifyScroll = resolve; });
			const shortMarker = short && new Promise((resolve) => { notifyMarker = resolve; });
			if (short) r.wait = (kind) => new Promise((resolve) => {
				const timeout = setTimeout(() => resolve(false), 150);
				(kind === 'scroll' ? shortScroll : shortMarker).then(() => { clearTimeout(timeout); resolve(true); });
			});
			const wheel = (e) => {
				point = [e.clientX, e.clientY];
				r.wheels.push({t: performance.now(), trusted: e.isTrusted, ...read()});
			};
			const scroll = () => {
				const sample = { t: performance.now(), top: sc.scrollTop, op: board().getAttribute('data-op') };
				r.scrolls.push(sample);
				if (sample.op === 'wheel' && sample.top > r.pre.top) notifyScroll?.();
			};
			const keydown = (e) => { if (e.key === key || e.key === 'Escape') r.keys.push({t: performance.now(), key: e.key, trusted: e.isTrusted, focused: e.target.dataset.widget}); };
			const move = (e) => { if (point && (e.clientX !== point[0] || e.clientY !== point[1])) r.moves++; };
			const end = (e) => r.ends.push({t: performance.now(), live: e.detail?.board === board(), gesture: !!PMU.board.gesture(), op: board().getAttribute('data-op'), point: e.detail?.point});
			const frame = () => { if (!running) return; r.frames.push(read()); requestAnimationFrame(frame); };
			sc.addEventListener('wheel', wheel, {passive: true}); sc.addEventListener('scroll', scroll, {passive: true}); document.addEventListener('keydown', keydown, true); document.addEventListener('pointermove', move, true); document.addEventListener('pmu-op-end', end);
			let dragHeld = r.pre.dragHeld;
			const markers = new MutationObserver((changes) => {
				const sample = read();
				if (changes.every((change) => change.target === document.body) && sample.dragHeld === dragHeld) return;
				dragHeld = sample.dragHeld;
				r.markers.push(sample);
				if (sample.op === mode && sample.gesture?.kb) notifyMarker?.();
			});
			markers.observe(board(), { attributes: true, attributeFilter: short ? ['data-op', 'data-wheel-handoff'] : ['data-op'] });
			if (short) markers.observe(document.body, { attributes: true, attributeFilter: ['class'] });
			else requestAnimationFrame(frame);
			r.stop = () => { running = false; markers.disconnect(); sc.removeEventListener('wheel', wheel); sc.removeEventListener('scroll', scroll); document.removeEventListener('keydown', keydown, true); document.removeEventListener('pointermove', move, true); document.removeEventListener('pmu-op-end', end); return {...r, stop: undefined, wait: undefined, point, after: read()}; };
		}, { key, mode, short });
		if (short) {
			const [rolled] = await Promise.all([
				f.evaluate(() => window.__uhpKeyboard.wait('scroll')),
				t.page.mouse.wheel(0, 1)
			]);
			if (rolled) {
				const marker = f.evaluate(() => window.__uhpKeyboard.wait('marker'));
				await t.page.keyboard.press(key);
				await marker;
				await t.page.keyboard.press('Escape');
			}
			await t.page.waitForTimeout(500);
			const rec = await f.evaluate(() => window.__uhpKeyboard.stop());
			const verdict = judgeShortHandoff(rec);
			records.push({ attempt, rec, verdict });
			const detail = JSON.stringify({ attempt, wheels: rec.wheels.map((x) => x.t), scrolls: rec.scrolls, ...verdict });
			t.log(S + detail);
			if (!verdict.qualified && attempt < tries) continue;
			await t.check(S + 'could judge trusted M/R and idle release before the original wheel deadline', verdict.qualified, detail);
			if (verdict.qualified) {
				done.add(mode);
				await t.check(S + 'wheel suppression survives idle release and ends once at the original deadline', verdict.ok, detail);
			} else if (verdict.hostLimit) {
				await t.check(S + 'native early-idle release coverage on this host', false,
					`could not judge: host limit (PM7PERF-V6-P5-IDLE-COVERAGE) — the native marker arrived +${verdict.markerAfterScrollMs} ms and the idle release +${verdict.releaseAfterScrollMs} ms after the wheel scroll, past the ${REST_MS} ms deadline; coverage owed on a native-speed host; ` + detail);
			}
			continue;
		}
		await t.page.mouse.wheel(0, 1);
		// TB6 item 3: the real VM abort in stream F's batch 13 was this wait (usage-hover-pause.check.mjs:570 then), not
		// only pointerDeparture's. Catch it, mark the group could not judge, and let the rest of the check run.
		let rolled = true;
		try {
			await f.waitForFunction(() => {
				const r = window.__uhpKeyboard;
				return r.scrolls.some((s) => s.op === 'wheel' && s.top > r.pre.top);
			}, null, { timeout: 10000 });
		} catch (e) { rolled = false; }
		if (!rolled) {
			const rec = await f.evaluate(() => window.__uhpKeyboard.stop()); records.push(rec);
			const why = 'could not judge: the trusted wheel never scrolled the pane with its wheel marker within 10 s';
			t.log(S + 'the wheel never scrolled the pane: ' + JSON.stringify({ pre: rec.pre.top, scrolls: rec.scrolls.slice(0, 3), wheels: rec.wheels.length }));
			await t.check(S + 'could judge Skyline hover before its wheel deadline on a second trusted wheel inside the keyboard gesture', false, why);
			await t.check(S + 'Skyline stays visually neutral inside the keyboard gesture until the original wheel deadline', false, why);
			await t.check(S + 'could judge: applied provider, trusted wheel moves the pane, M/R on another focused card within 150 ms, gesture held past pause, trusted Escape and still pointer', false, why);
			await t.check(S + 'main provider selection stays unchanged while the keyboard gesture owns the board', false, why);
			await t.check(S + 'after Escape one lifecycle return releases the engine while main provider selection stays unchanged', false, why);
			await park();
			continue;
		}
		// Keep the second tick on the already latched axis: a horizontal tick can queue behind the keyboard work.
		await Promise.all([t.page.keyboard.down(key), t.page.mouse.wheel(0, 1)]);
		await t.page.keyboard.up(key);
		await t.page.waitForTimeout(650);
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(900);
		const rec = await f.evaluate(() => window.__uhpKeyboard.stop()); records.push(rec);
		const press = rec.keys.find((x) => x.key === key), escape = rec.keys.find((x) => x.key === 'Escape');
		const [first, follow] = rec.wheels;
		const started = rec.markers.find((x) => x.op === 'wheel');
		const firstScroll = rec.scrolls.find((x) => x.op === 'wheel' && x.top > rec.pre.top);
		const gap = press?.t - firstScroll?.t, due = firstScroll?.t + 150;
		const held = rec.frames.filter((x) => x.t >= due + 50 && x.t < escape?.t);
		const a = rec.after, p = rec.pre;
		const duringMove = [...rec.markers, ...rec.frames].filter((x) => x.t >= first?.t && x.t < due && x.op === mode && x.hovered);
		const visualInput = rec.wheels.length === 2 && first.trusted && follow.trusted && started?.op === 'wheel' &&
			follow.gesture?.kb && follow.gesture.type === mode && follow.t >= press?.t && follow.t < due &&
			p.hovered && first.hovered && follow.hovered && started.shadow !== p.shadow &&
			first.top === 0 && started.top === first.top && follow.top === firstScroll?.top && !rec.moves;
		await t.check(S + 'could judge Skyline hover before its wheel deadline on a second trusted wheel inside the keyboard gesture',
			visualInput, JSON.stringify({pre: p, started, firstScroll, wheels: rec.wheels, press, moves: rec.moves}));
		await t.check(S + 'Skyline stays visually neutral inside the keyboard gesture until the original wheel deadline',
			visualInput && follow.shadow === started.shadow && duringMove.every((x) => x.shadow === started.shadow) && a.shadow === p.shadow,
			JSON.stringify({resting: p.shadow, wheels: rec.wheels, after: a.shadow, duringMove}));
		t.log(S + JSON.stringify(rec));
		await t.check(S + 'could judge: applied provider, trusted wheel moves the pane, M/R on another focused card within 150 ms, gesture held past pause, trusted Escape and still pointer',
			p.hovered && p.dim === p.eligibleDim && p.on === p.eligibleOn && p.dim + p.on > 0 && p.correct && rec.focused === 'health' &&
			rec.wheels.length === 2 && rec.wheels.every((x) => x.trusted) && started?.op === 'wheel' && gap >= 0 && gap < 150 && press?.trusted && press.focused === 'health' && escape?.trusted &&
			escape.t - press.t >= 500 && held.length >= 5 && held.every((x) => x.gesture?.kb && x.gesture.type === mode && x.hovered && x.top >= firstScroll.top && x.top <= firstScroll.top + 1) && held.some((x) => x.op === mode) &&
			!rec.moves && a.hovered && a.top >= firstScroll.top && a.top <= firstScroll.top + 1 && !a.gesture && !a.op,
			JSON.stringify({gap, started, firstScroll, pre: p, focused: rec.focused, wheels: rec.wheels, keys: rec.keys, held: held.length, moves: rec.moves, after: a}));
		await t.check(S + 'main provider selection stays unchanged while the keyboard gesture owns the board', held.length >= 5 && held.every((x) => x.dim===p.dim&&x.on===p.on&&x.correct) && !rec.ends.some((x) => x.t < escape?.t || x.gesture || x.op), JSON.stringify({ends: rec.ends, litHeld: held.filter((x) => x.dim || x.on).length}));
		await t.check(S + 'after Escape one lifecycle return releases the engine while main provider selection stays unchanged', rec.ends.length === 1 && rec.ends[0].live && !rec.ends[0].gesture && !rec.ends[0].op && rec.ends[0].t >= escape?.t && JSON.stringify(rec.ends[0].point) === JSON.stringify(rec.point) && !a.gesture && !a.op && a.hovered && a.dim === a.eligibleDim && a.on === a.eligibleOn && a.dim + a.on > 0 && a.correct, JSON.stringify({ends: rec.ends, after: a}));
	}
	await park();
	await f.evaluate(({ on, minHeight }) => {
		document.activeElement?.blur();
		document.getElementById('pmuBoard').style.minHeight = minHeight;
		PMU.board.reset('room');
		if (on) PMU.live.resume();
	}, { on: liveWasOn, minHeight });
	return records;
}

// R121 P1: the fixed layers have their own opacity and viewport position, independent of the card's classes.
async function wheelProxies(t, f, label, park) {
	const live = await f.evaluate(() => { const on = PMU.live.on(); PMU.live.pause(); PM7_USAGE.setRoomDetail('overview', 'glance'); return on; });
	await f.waitForFunction(() => !document.querySelector('#pmuScroll .pmu-ghostboard'));
	const records = [];
	for (const kind of ['settled glow', 'already fading glow']) {
		await park();
		await f.evaluate(() => { document.activeElement?.blur(); document.getElementById('pmuScroll').scrollTop = 0; });
		await t.page.waitForTimeout(500);
		const points = await f.evaluate(() => {
			const pane = document.getElementById('pmuScroll').getBoundingClientRect();
			return [...document.querySelectorAll('#pmuBoard > .pmu-card[data-head="plate"]')].map((card) => {
				const r = card.getBoundingClientRect(), x = r.x + r.width / 2, y = (Math.max(r.top, pane.top) + Math.min(r.bottom, pane.bottom)) / 2;
				return y >= pane.top + 30 && y <= pane.bottom - 180 && card.contains(document.elementFromPoint(x, y)) ? { x, y, widget: card.dataset.widget } : null;
			}).filter(Boolean).slice(0, 2);
		});
		const S = label + 'R121 ' + kind + ': ';
		if (points.length < 2) { await t.check(S + 'could judge two visible card targets', false, JSON.stringify(points)); continue; }
		const [old, next] = points;
		await t.page.mouse.move(old.x, old.y);
		await t.page.waitForTimeout(650);
		await f.evaluate(() => {
			const sc = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
			const r = window.__usageProxies = { wheels: [], scrolls: [], frames: [] };
			let raf;
			const layer = (el) => {
				const box = el.getBoundingClientRect(), cs = getComputedStyle(el);
				return { x: box.x, y: box.y, w: box.width, h: box.height,
					opacity: cs.visibility === 'visible' && cs.display !== 'none' ? +cs.opacity : 0,
					on: el.matches('.pmh-glow-on,.pmh-frame-on') };
			};
			const read = () => ({ t: performance.now(), top: sc.scrollTop, op: board.getAttribute('data-op'),
				card: board.querySelector(':scope > .pmu-card:hover')?.dataset.widget,
				layers: [...document.querySelectorAll('#pmh-glow > i,#pmh-frame')].map(layer) });
			const sample = () => { r.frames.push(read()); raf = requestAnimationFrame(sample); };
			const wheel = (e) => r.wheels.push({ trusted: e.isTrusted, ...read() });
			const scroll = () => r.scrolls.push({ t: performance.now(), top: sc.scrollTop });
			sc.addEventListener('wheel', wheel, { capture: true, passive: true });
			sc.addEventListener('scroll', scroll, { passive: true });
			raf = requestAnimationFrame(sample);
			r.stop = () => {
				cancelAnimationFrame(raf); sc.removeEventListener('wheel', wheel, true); sc.removeEventListener('scroll', scroll);
				return { ...r, stop: undefined };
			};
		});
		if (kind === 'already fading glow') {
			await t.page.mouse.move(next.x, next.y);
			// TB6 item 3: the same uncaught wait class; on a loaded host the next card's glow can fade before 2 s.
			let fading = true;
			try {
				await f.waitForFunction(() => [...document.querySelectorAll('#pmh-glow > i:not(.pmh-glow-on)')]
					.some((el) => +getComputedStyle(el).opacity > 0.15), null, { timeout: 2000 });
			} catch (e) { fading = false; }
			if (!fading) {
				await f.evaluate(() => window.__usageProxies.stop());
				const why = 'could not judge: no fading glow appeared at the next card within 2 s';
				await t.check(S + 'could judge visible proxy opacity before trusted real scroll with the pointer still', false, why);
				await t.check(S + 'no fixed glow or frame proxy remains visible in the moving hold', false, why);
				await t.check(S + 'hover glow returns at the card now under the pointer', false, why);
				continue;
			}
		}
		// Stay within the chosen card while moving enough to distinguish the fixed old box from the scrolling one.
		for (const delta of [24, 24, 24, 24, 24, 24]) {
			await t.page.mouse.wheel(0, delta);
			await t.page.waitForTimeout(30);
		}
		await t.page.waitForTimeout(650);
		const r = await f.evaluate(() => window.__usageProxies.stop());
		const first = r.wheels[0], moved = r.scrolls.find((s) => s.top > first?.top);
		const last = Math.max(r.wheels.at(-1)?.t, r.scrolls.at(-1)?.t);
		const burst = burstState(holdInputs(r.wheels, r.scrolls)), burstDetail = burst.broke ? burstWhy(burst) : null;
		const held = r.frames.filter((s) => s.top > first?.top && s.t >= moved?.t && s.t < last + 130);
		const before = first?.layers.filter((l) => l.opacity > 0.05 && l.on === (kind === 'settled glow')) || [];
		const bright = held.flatMap((s) => s.layers.filter((l) => l.opacity > 0.01).map((l) => ({ ...l, t: s.t, top: s.top })));
		const returned = r.frames.find((s) => s.t > last + 150 && !s.op && s.layers.some((l) => l.on && l.opacity > 0.5));
		const detail = JSON.stringify({ before, wheels: r.wheels.length, scrolls: r.scrolls.length, held: held.length,
			moved, firstBright: bright[0], visibleSamples: bright.length, returned });
		records.push({ kind, ...r });
		t.log(S + detail);
		await t.check(S + 'could judge visible proxy opacity before trusted real scroll with the pointer still',
			first?.card === (kind === 'settled glow' ? old.widget : next.widget) && before.length > 0 &&
			r.wheels.length === 6 && r.wheels.every((w) => w.trusted) && !burst.broke && held.length >= 5 && !!moved,
			`${detail} (max gap ${burst.maxGap} ms)`);
		if (burst.broke) { t.log(S + 'SKIP proxy hold and return rows: ' + burstDetail); continue; }
		await t.check(S + 'no fixed glow or frame proxy remains visible in the moving hold',
			!burst.broke && held.length >= 5 && held.every((s) => s.op === 'wheel') && bright.length === 0, burstDetail || detail);
		await t.check(S + 'hover glow returns at the card now under the pointer', !burst.broke && !!returned, burstDetail || detail);
	}
	await park();
	await f.evaluate((on) => { if (on) PMU.live.resume(); }, live);
	return records;
}

// R125 #4: 400 ms is the hard ceiling on the return from the last input; --set back= may only lower it, so a runner
// cannot widen the rule it is running. (Non-numbers and non-positive values fall back to the ceiling.)
export const RETURN_CAP_MS = 400;
export const outerCap = (back) => {
	const n = Number(back);
	return Number.isFinite(n) && n > 0 ? Math.min(RETURN_CAP_MS, n) : RETURN_CAP_MS;
};

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark').split(',').filter(Boolean);
	// BACK: the hard outer cap on the return from the last input (TB6 item 2: 400 ms, R125 #4: clamped, never raised);
	// the judged return is the pause's own end (150 ms rest plus the host's measured timer lateness) and two frames after.
	const TRIES = Number(t.args.tries || 3), TICKS = Number(t.args.ticks || 12), GAP = Number(t.args.gap || 30), BACK = outerCap(t.args.back ?? 400);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const rm = String(t.args.rm || '') === '1', holdOnly = String(t.args.holdOnly || '') === '1';
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
			if (String(t.args.shortOnly || '') === '1') {
				const short = await keyboardPause(t, f, S, park, true);
				dump.push({ surface, look, short });
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
				continue;
			}
			const proxyOnly = String(t.args.proxyOnly || '') === '1';
			if (!holdOnly && !rm && /^(basic|friendly|glass)-/.test(look) && (proxyOnly ||
				!['narrowOnly', 'chartOnly', 'raceOnly', 'mountOnly', 'departureOnly', 'keyboardOnly', 'r113Only'].some((key) => String(t.args[key] || '') === '1'))) {
				const proxies = await wheelProxies(t, f, S, park);
				dump.push({ surface, look, proxies });
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
			}
			if (proxyOnly) continue;
			if(String(t.args.narrowOnly||'')==='1') {
				const r113=await r113Cases(t,f,S,park),applied=await appliedHighlights(t,f,S,park);
				dump.push({surface,look,r113,applied});if(t.args.dump)writeFileSync(String(t.args.dump),JSON.stringify(dump));continue;
			}
			if (!holdOnly && !['chartOnly','raceOnly','mountOnly','departureOnly','keyboardOnly'].some((key)=>String(t.args[key] || '')==='1')) {
				const r113=await r113Cases(t,f,S,park);dump.push({surface,look,r113});
				if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump));
				if(String(t.args.r113Only || '')==='1') continue;
			}
			if (!holdOnly && !['chartOnly','raceOnly','mountOnly','departureOnly'].some((key)=>String(t.args[key] || '')==='1')) {
				const keyboard=await keyboardPause(t,f,S,park); dump.push({surface,look,keyboard});
				if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump));
				if(String(t.args.keyboardOnly || '')==='1') continue;
			}
			if (!holdOnly && !['chartOnly','raceOnly','mountOnly'].some((key)=>String(t.args[key] || '')==='1')) {
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
			if (!holdOnly && String(t.args.raceOnly || '') !== '1') {
				mounts = await roomMountRace(t, f, S, park, rm);
				dump.push({ surface, look, mounts });
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
				if (String(t.args.mountOnly || '') === '1') continue;
			}
			if (!holdOnly && String(t.args.raceOnly || '') !== '1') { const applied=await appliedHighlights(t,f,S,park); dump.push({surface,look,applied}); if(t.args.dump) writeFileSync(String(t.args.dump),JSON.stringify(dump)); }
			const ok = await f.evaluate(INSTALL);
			const range = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); return s ? s.scrollHeight - s.clientHeight : 0; });
			if (!ok || range < TICKS * 40 + 80) { await t.check(S + 'could judge: Usage\'s board is there and scrolls ' + (TICKS * 40 + 80) + ' px', false, `range ${range}`); continue; }
			if (!holdOnly) {
				const race = await providerRace(t, f, S, park);
				dump.push({ surface, look, race });
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
				if (String(t.args.raceOnly || '') === '1') { await park(); continue; }
			}
			const res = { r0: [], r1: [], r2: [], burst: [] };
			const at0 = await f.evaluate(() => { const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55) }; });
			for (let w = 0; w < TRIES; w++) {
				let rec, rest, at, j, driverGap, short = [];
				for (let attempt = 0; attempt < 3; attempt++) {
					await park();
					await t.page.waitForTimeout(500);
					at = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); s.scrollTop = 0; const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55) }; });
					await t.page.waitForTimeout(400);
					await t.page.mouse.move(at.x, at.y, { steps: 6 });
					await t.page.waitForTimeout(1200);
					rest = await f.evaluate(() => window.__uhp.state());
					await f.evaluate(() => window.__uhp.start());
					const sent = [];
					for (let i = 0; i < TICKS; i++) {
						sent.push(performance.now());
						await t.page.mouse.wheel(0, 40);
						await t.page.waitForTimeout(GAP);
					}
					driverGap = burstState(sent).maxGap;
					await t.page.waitForTimeout(800);
					rec = await f.evaluate(() => window.__uhp.stop());
					const moved = rec.frames.length ? rec.frames[rec.frames.length - 1].top - rec.frames[0].top : 0;
					if (rec.wheels.length && moved >= TICKS * 40 * 0.6) break;
					short.push(`scrolled ${moved} px, ${rec.wheels.length} wheel events`);
				}
				const moved = rec.frames.length ? rec.frames[rec.frames.length - 1].top - rec.frames[0].top : 0;
				if (!rec.wheels.length || moved < TICKS * 40 * 0.6) { await t.check(`${S}window ${w + 1}: could judge: the wheel scrolled the board`, false, short.join('; ')); continue; }
				j = judge(rec, { rest: rest.card, back: BACK });
				dump.push({ surface, look, window: w + 1, rest, at, judged: j, driverGap, rec });
				res.r0.push(!!(rest.card && rest.lit && rest.tools > 0.5));
				res.r1.push(j.r1); res.r2.push(j.r2); res.burst.push(j.burst);
				t.log(`${S}window ${w + 1}: at rest card ${rest.card} lit ${rest.lit} tools ${rest.tools} | wheel ${j.span.wheels} events over ${j.span.wheel} ms, max gap ${j.burst.maxGap} ms (wheel delivery ${j.wheelGap} ms, driver ${driverGap} ms), scroll ${j.span.scrolls} events ending ${j.span.tail} ms after the last wheel, ${moved} px | during: ${j.r1.cardsPassed} cards under the pointer, ${j.r1.ins} hover-in transitions (${j.r1.insProps.join(', ') || 'none'}) on ${j.r1.insCards.join(',') || 'no card'}, ${j.r1.litFrames} of ${j.r1.frames} frames retain a card engine light or visible proxy, ${j.r1.toolFrames} retain shown tools | after: back in ${j.r2.ms === null ? 'never (800 ms)' : j.r2.ms + ' ms'} on ${j.r2.card} (light ${j.r2.light ?? 'never'}, tools ${j.r2.tools ?? 'never'}, proxy ${j.r2.proxyRequired ? j.r2.proxy ?? 'never' : 'n/a'}; pause end ${j.r2.end ?? 'never'} ms after the rest, host timer late ${j.r2.late ?? '?'} ms, excess ${j.r2.work ?? '?'} ms, timer entry gap ${j.r2.entryGap ?? '?'} ms, callback to marker clear ${j.r2.callbackWork ?? '?'} ms, back ${j.r2.back ?? 'never'} ms = ${j.r2.backFrames ?? '?'} drawn frames)${j.r2.long.length ? ' | long frames after: ' + j.r2.long.join(' / ') : ''}${short.length ? ' | taken again: ' + short.join('; ') : ''}`);
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
			}
			await park();
			const n = res.r1.length;
			await t.check(S + `could judge: at rest the card under the pointer is lit and shows its tools (${res.r0.filter(Boolean).length} of ${res.r0.length} windows)`, n === TRIES && res.r0.every(Boolean), `windows judged ${n} of ${TRIES}`);
			// A gap in delivered pause inputs longer than the rest lets the pause end correctly mid-burst. The burst row FAILS
			// (could not judge), and the rows that depend on the pause surviving the whole burst are skipped with the gap
			// in a SKIP log line, so one host-timing miss reads as one failure, not five.
			await t.check(S + `could judge: each wheel burst kept the pause alive (no gap over the ${REST_MS} ms rest)`, n === TRIES && res.burst.length === TRIES && res.burst.every((b) => !b.broke),
				res.burst.map((b, i) => `w${i + 1}: max gap ${b.maxGap} ms`).join('; ') || 'no judged window');
			const burstBroke = res.burst.find((b) => b.broke);
			const burstDetail = burstBroke ? burstWhy(burstBroke) : '';
			if (burstBroke) t.log(S + 'SKIP R1/R2 hold and return rows: ' + burstDetail + ' (' + res.burst.map((b, i) => `w${i + 1} max gap ${b.maxGap} ms`).join('; ') + ')');
			else {
				await t.check(S + 'while the wheel turns, no card or row that slides under the resting pointer lights up or shows its tools', !burstBroke && n > 0 && res.r1.every((r) => r.ok),
					burstBroke ? `${burstDetail} (${res.burst.map((b, i) => `w${i + 1} max gap ${b.maxGap} ms`).join('; ')})` :
					res.r1.map((r, i) => `w${i + 1}: ${r.ins} hover-in transitions, ${r.litFrames} lit frames, ${r.toolFrames} shown-tool frames, marker coverage ${r.coverage}, ${r.frames} sampled frames, ${r.cardsPassed} cards passed`).join('; '));
				await t.check(S + `after the wheel, the pause ends at its ${REST_MS} ms rest and the highlight is back within two frames without a move (outer cap ${BACK} ms)`, !burstBroke && n > 0 && res.r2.every((r) => r.ok),
					burstBroke ? burstDetail :
					res.r2.map((r, i) => `w${i + 1}: ${r.ms === null ? 'never' : r.ms + ' ms'} (${r.card}: light ${r.light ?? 'never'}, tools ${r.tools ?? 'never'}, proxy ${r.proxyRequired ? r.proxy ?? 'never' : 'n/a'}; pause end ${r.end ?? 'never'} ms, host timer late ${r.late ?? '?'} ms, excess ${r.work ?? '?'} ms, entry gap ${r.entryGap ?? '?'} ms, callback work ${r.callbackWork ?? '?'} ms, back ${r.back ?? 'never'} ms = ${r.backFrames ?? '?'} drawn frames${r.early ? `, and ${r.early} samples showed the return before the end` : ''})`).join('; '));
			}

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
