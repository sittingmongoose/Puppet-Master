// PERF-1 (Jared's signed card vm.pm7-perf--P1, answer A; stream F batch 9b-2): Pip's stage draws only when something
// drawn has moved. Before the change the stage loop redrew everything every frame to move Pip about 0.011 px, keeping
// a core 60-86% busy in the onboarding window in every look but Retro. Jared's rule: redraw only when Pip has moved at
// least a tenth of a pixel; swings, speech and anything fast still every frame.
//
// Per look (default the eight smooth looks; Retro draws in steps by design and is not judged here), on `where` at
// 1390x900, the pointer parked at the window's edge and Pip's idle life held (no swing or wiggle is started while
// measuring; blinks, breathing and the sway go on):
//  - rest: Pip settled, every frame for 4 s read at its end (a task queued from an animation frame, after paint). A
//    frame in which the stage changed its drawing (a mutation anywhere under the stage root) must show a painted change:
//    some drawn part moved at least 0.08 px since the stage's previous drawn frame (the tenth of a pixel less the
//    renderer's .01-unit rounding: each part's local box corners mapped through its screen matrix, the bubble's box and
//    its tail position), or new words or parts, or a changed opacity. A frame that changed nothing visible is a redraw
//    with Pip still, and fails. Parts are matched by where they are in the drawing, not by element, so a part rebuilt
//    identically (innerHTML every frame) has not moved. A frame is a draw when the stage wrote what a draw writes
//    (transform, d, opacity, positions, the bubble's style and side, nodes or text); a class flip (the typer's caret, a
//    hover) is not a draw.
//  - rest, frames: the stage asks for no animation frame it does not draw in (its loop's frame callbacks are counted:
//    at most the drawn frames plus 2 a second, for frame timing: the stage keeps its frame loop only while Pip moves
//    8 px/s or more, when the next frame's draw is due).
//  - rest, swing and speech: a draw that follows skipped frames moved at most 0.5 px since the previous draw: the tenth
//    of a pixel that makes a draw due, plus at most 50 ms of drift under 8 px/s (below that speed the stage waits on its
//    16 ms timer and asks for a frame once a draw is due). Anything faster is drawn every frame, so a held-back swing or
//    fall shows as a larger jump (1.9-2.8 px when a swing's frame was skipped). The head's own shape (blink, face, breathing's .01 scale steps) and the
//    bubble's placement are left out; Pip's motion is judged on its strings' ends and its control.
//  - swing: a swing as idle life starts one (the pendulum's speed kicked by .3 rad/s): during its first half second the
//    stage draws on at least half the frames (a frame at a turn of the swing, moving under a tenth of a pixel, may go
//    undrawn), none jumps as above and no drawn frame is still.
//  - speech: a new line typed in: no still frame while it types.
// It also reports, normal surface, the renderer's main-thread time in ms per second at rest (CDP Performance metrics:
// TaskDuration, with script, layout and style), read over its own window with nothing read per frame, and the loop's
// frames and timer ticks a second, into stage-rest-draws.json in the run folder. Fails on main 77bae0c636 (every frame drawn, almost all of them still).
// --set looks=, --set screen=where, --set size=1390x900, --set secs=4, --set sandbox=0|1 (default both).
import fs from 'node:fs';
import path from 'node:path';

const LOOKS = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'nier-dark', 'nier-light'];
const STAGE = '#pm-o55-onboarding .o55-stage';
const STILL_PX = 0.08, JUMP_PX = 0.5, SPARE_FRAMES = 2;

// in the app's frame: per-frame records of what the stage changed and how far its drawn parts moved
function install() {
	const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
	if (window.__srd) window.__srd.stop();
	const W = window.__srd = { box: new Map(), on: false, rows: [], pend: { attrs: 0, content: 0, opacity: 0, names: [] }, ticks: 0, timerTicks: 0, last: null, lastTx: null };
	const loop0 = st.loop; st.loop = function () { if (W.on) W.ticks++; return loop0.apply(st, arguments); };
	const tick0 = st.tick; if (typeof tick0 === 'function') st.tick = function () { if (W.on) W.timerTicks++; return tick0.apply(st, arguments); };
	// what a draw writes (render, placeProp, placeBubble, placeTip, the HUD): a class flip by the typer or a hover is no draw
	const DRAWN = new Set(['transform', 'd', 'opacity', 'rx', 'ry', 'cx', 'cy', 'x', 'y', 'height', 'display', 'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'style', 'data-side', 'visibility']);
	const mo = new MutationObserver((recs) => {
		if (!W.on) return;
		for (const r of recs) {
			if (r.type === 'attributes') { if (DRAWN.has(r.attributeName)) { W.pend.attrs++; if (W.pend.names.length < 8) W.pend.names.push(`${r.attributeName}@${r.target.getAttribute('class') || r.target.tagName}`); } }
			else W.pend.content++;
		}
	});
	mo.observe(st.root, { attributes: true, attributeOldValue: true, childList: true, characterData: true, subtree: true });
	// every drawn part, keyed by where it is in the drawing (not by element: a part rebuilt identically each frame, as
	// innerHTML did, is the same part and has not moved)
	const refs = () => {
		const L = [], add = (k, e) => { if (e && e.isConnected) L.push([k, e]); };
		add('ctl', st.gCtl); add('head', st.gHead); if (st.gHead) st.gHead.querySelectorAll('.pe,.pb,.pst-part').forEach((e, i) => add(`head.${i}.${e.getAttribute('class')}`, e));
		(st.pstrs || []).forEach((e, i) => add('str' + i, e));
		st.props.forEach((p, id) => { add('prop:' + id, p.el); p.strs.forEach((e, i) => add(`prop:${id}:str${i}`, e)); });
		[['shadow', st.gShadow], ['fx', st.gFx], ['hud', st.gHud], ['trail', st.gTrail]].forEach(([n, g]) => g && g.querySelectorAll('*').forEach((e, i) => add(`${n}.${i}.${e.tagName}`, e)));
		return L;
	};
	// a part's box corners on screen through the transforms the stage WRITES (transform attributes, read without changing
	// them), not CSS: a CSS animation (NieR's turning marker) moves by itself and is not the loop's drawing
	// (a group is measured by the box it had when the phase began, so only its own written transform moves it: a blink
	// shrinking the eyes inside the head, or NieR's marker turning by CSS inside its group, is not the group moving; a
	// leaf by its present geometry, which is what a draw writes)
	const corners = (e, svgM, key) => {
		try {
			let b = e.tagName === 'g' ? W.box.get(key) : null;
			if (!b) { b = e.getBBox(); if (e.tagName === 'g') W.box.set(key, { x: b.x, y: b.y, width: b.width, height: b.height }); }
			let m = svgM;
			const chain = []; for (let n = e; n && n !== st.svg; n = n.parentNode) chain.push(n);
			for (let i = chain.length - 1; i >= 0; i--) { const tl = chain[i].transform && chain[i].transform.baseVal; if (tl) for (let j = 0; j < tl.numberOfItems; j++) { const q = tl.getItem(j).matrix; m = m.multiply(new DOMMatrix([q.a, q.b, q.c, q.d, q.e, q.f])); } }
			return [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
		} catch (e2) { return null; }
	};
	const TEXT = new Set(['text', 'tspan']);
	const snap = () => {
		const m = new Map(), c0 = st.svg.getScreenCTM(), svgM = c0 ? new DOMMatrix([c0.a, c0.b, c0.c, c0.d, c0.e, c0.f]) : new DOMMatrix();
		for (const [k, e] of refs()) m.set(k, { c: corners(e, svgM, k), w: TEXT.has(e.tagName) ? e.textContent : null, o: e.getAttribute('opacity') });
		// the bubble where the stage put it (its written translate and tail), not its box mid pop-in
		const b = st.bubble, t = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(b.style.translate || '') || [0, 0, 0], x = +t[1], y = +t[2];
		m.set('bubble', { c: [[x, y], [x + b.offsetWidth, y + b.offsetHeight], [parseFloat(b.style.getPropertyValue('--tx')) || 0, parseFloat(b.style.getPropertyValue('--ty')) || 0]], w: b.innerHTML, o: null }); /* (its markup: the typer moves letters from the hidden span to the shown one) */
		return m;
	};
	// the largest move of any part's corner in px; Infinity when a part came or went or its words changed; a changed
	// opacity is reported apart
	// (dp, for the jump rule, leaves out the head's own shape: a blink, a change of face, and breathing, whose scale the
	// stage writes to .01 so the head's top steps about 0.85 px at once, on the same frames as before PERF-1. Pip's motion
	// is still in dp through its strings' ends and its control, which those leave where they are. The bubble is left out
	// too: it follows the head's speech point, and its placement steps are the QA-4 checks' to judge)
	const moved = (a, b) => {
		let d = 0, dp = 0, op = false, at = ''; const parts = [];
		for (const [k, p] of b) {
			const q = a.get(k); if (!q || !p.c || !q.c || q.c.length !== p.c.length || q.w !== p.w) return { d: Infinity, dp: Infinity, op };
			if (q.o !== p.o) op = true;
			const ev = k === 'head' || k.startsWith('head.') || k === 'bubble';
			let pv = 0;
			for (let i = 0; i < p.c.length; i++) { const v = Math.hypot(p.c[i][0] - q.c[i][0], p.c[i][1] - q.c[i][1]); pv = Math.max(pv, v); d = Math.max(d, v); if (!ev && v > dp) { dp = v; at = k; } }
			if (pv > .05) parts.push([k, +pv.toFixed(3)]);
		}
		for (const k of a.keys()) if (!b.has(k)) return { d: Infinity, dp: Infinity, op };
		return { d, dp, op, at, parts: parts.sort((x, y) => y[1] - x[1]).slice(0, 6) };
	};
	let raf = 0;
	const ch = new MessageChannel();
	ch.port1.onmessage = () => {
		if (!W.on) return;
		const p = W.pend; W.pend = { attrs: 0, content: 0, opacity: 0, names: [] };
		const row = { t: performance.now(), drawn: p.attrs + p.content > 0, attrs: p.attrs, nodes: p.content, names: p.names };
		if (row.drawn) { const s = snap(), mv = W.last ? moved(W.last, s) : { d: Infinity, dp: Infinity, op: false }; row.disp = mv.d; row.dispPos = mv.dp; row.at = mv.at; row.parts = mv.parts; row.opacity = mv.op; row.content = mv.d === Infinity; W.last = s; }
		W.rows.push(row);
	};
	const frame = () => { raf = requestAnimationFrame(frame); ch.port2.postMessage(0); };
	// (the per-frame reader runs only while a phase is read, so the cost reading sees the page alone)
	W.start = () => { W.box = new Map(); W.rows = []; W.ticks = 0; W.timerTicks = 0; W.pend = { attrs: 0, content: 0, opacity: 0, names: [] }; W.last = snap(); W.on = true; if (!raf) raf = requestAnimationFrame(frame); };
	W.end = () => { W.on = false; cancelAnimationFrame(raf); raf = 0; return { rows: W.rows, ticks: W.ticks, timerTicks: W.timerTicks }; };
	W.count = () => { W.ticks = 0; W.timerTicks = 0; W.on = true; };
	W.uncount = () => { W.on = false; return { ticks: W.ticks, timerTicks: W.timerTicks }; };
	W.stop = () => { W.on = false; cancelAnimationFrame(raf); raf = 0; mo.disconnect(); st.loop = loop0; if (typeof tick0 === 'function') st.tick = tick0; };
	return true;
}

// Pip settled and its idle life held: no swing, wiggle or glance starts while it is measured
async function settle(f) {
	return f.evaluate(async () => {
		const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
		const t0 = performance.now();
		let why = '';
		const calm = () => { const ps = st.ps; st.idleNext = 1e12; st.idleLook = null; const c = { fx: !st.fx.length, face: st.faceT0 == null && !st.faceOut, swing: Math.abs(ps.thv) < .01, hand: Math.hypot(ps.C.x - ps.Ct.x, ps.C.y - ps.Ct.y) < (st.fam.sway || 0) * 1.5 + 3, tilt: Math.abs(ps.tiltv) < .05, props: [...st.props.values()].every((p) => p.state === 'out' || p.settled || (p.spec.ground && p.landed)), words: !st.bubble.classList.contains('typing') }; why = Object.keys(c).filter((k) => !c[k]).join(','); return !why; };
		let since = 0;
		while (performance.now() - t0 < 15000) {
			await new Promise((r) => setTimeout(r, 100));
			if (calm()) { if (!since) since = performance.now(); if (performance.now() - since > 1500) return { ok: true, ms: Math.round(performance.now() - t0) }; } else since = 0;
		}
		return { ok: false, ms: Math.round(performance.now() - t0), why };
	});
}

const summarize = (rows, secs) => {
	const drawn = rows.filter((r) => r.drawn), still = drawn.filter((r) => !r.content && !r.opacity && r.disp < STILL_PX);
	const disps = drawn.map((r) => r.disp).filter((d) => Number.isFinite(d)).sort((a, b) => a - b);
	// a draw after skipped frames shows what moved while they were skipped: over JUMP_PX means motion was held back
	let run = 0, maxRun = 0; const late = [];
	for (const r of rows) { if (r.drawn) { if (run && !r.content && r.dispPos > JUMP_PX) late.push(`${r.dispPos.toFixed(3)} (${r.at}, after ${run})`); run = 0; } else { run++; maxRun = Math.max(maxRun, run); } }
	return { frames: rows.length, drawn: drawn.length, still: still.length, maxUndrawnRun: maxRun, late: late.length, lateDisp: late.slice(0, 5), perSec: +(drawn.length / secs).toFixed(1), framesPerSec: +(rows.length / secs).toFixed(1), stillDisp: still.slice(0, 5).map((r) => +r.disp.toFixed(4)), stillWrites: still.slice(0, 3).map((r) => r.names.join(' ')), dispP50: disps.length ? +disps[Math.floor(disps.length / 2)].toFixed(3) : null };
};

async function surface(t, sandbox) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const [w, h] = String(t.args.size || '1390x900').split('x').map(Number), secs = +(t.args.secs || 4), screen = t.args.screen || 'where';
	await t.viewport(w, h);
	const out = [];
	for (const look of looks) {
		const tag = `${look} ${w}x${h} ${screen} ${sandbox ? 'sandbox' : 'normal'}`;
		await t.step(tag, async () => {
			const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screen, sandbox });
			await f.waitForFunction((s) => { const e = document.querySelector(s); return !!(e && e.__pipStage && e.__pipStage.gHead); }, STAGE, { timeout: 60000 });
			const [fam, scheme] = look.split('-');
			await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, scheme]);
			await f.waitForTimeout(3000);
			// a pointer that has arrived (Pip awake, looking at it) and then rests at the window's right edge
			await t.page.mouse.move(w / 2, h / 2, { steps: 4 }); await t.page.mouse.move(w - 3, h / 2, { steps: 6 });
			await f.waitForFunction((s) => !document.querySelector(s).__pipStage.sleepZ, STAGE, { timeout: 8000 }).catch(() => {});
			await f.evaluate(install);
			const calm = await settle(f);
			await t.check(`${tag}: Pip settles with idle life held`, calm.ok, `${calm.ms} ms${calm.why ? ', still moving: ' + calm.why : ''}`);
			const cdp = sandbox ? null : await t.page.context().newCDPSession(t.page);
			const metric = async () => { if (!cdp) return null; const m = (await cdp.send('Performance.getMetrics')).metrics, g = (n) => (m.find((x) => x.name === n) || {}).value || 0; return { task: g('TaskDuration'), script: g('ScriptDuration'), layout: g('LayoutDuration'), style: g('RecalcStyleDuration') }; };
			if (cdp) await cdp.send('Performance.enable', { timeDomain: 'threadTicks' });
			// the page's own cost at rest, nothing read per frame (only the stage's loop and timer calls counted)
			await f.evaluate(() => window.__srd.count());
			const m0 = await metric();
			await f.waitForTimeout(secs * 1000);
			const m1 = await metric();
			const quiet = await f.evaluate(() => window.__srd.uncount());
			if (cdp) { await cdp.send('Performance.disable'); await cdp.detach(); }
			// rest, every frame read
			await f.evaluate(() => window.__srd.start());
			await f.waitForTimeout(secs * 1000);
			const rest = await f.evaluate(() => window.__srd.end());
			const R = summarize(rest.rows, secs), cost = m0 && m1 ? Object.fromEntries(Object.keys(m0).map((k) => [k, +((m1[k] - m0[k]) * 1000 / secs).toFixed(1)])) : null;
			if (cost) { cost.loopFramesPerSec = +(quiet.ticks / secs).toFixed(1); cost.timerTicksPerSec = +(quiet.timerTicks / secs).toFixed(1); }
			R.loopFramesPerSec = +(rest.ticks / secs).toFixed(1); R.timerTicksPerSec = +(rest.timerTicks / secs).toFixed(1);
			t.log(`${tag} rest: ${R.perSec} draws/s of ${R.framesPerSec} frames/s, loop frames ${R.loopFramesPerSec}/s, timer ticks ${R.timerTicksPerSec}/s, still ${R.still}, median move ${R.dispP50} px${cost ? `, main ${cost.task} ms/s (script ${cost.script}, layout ${cost.layout}, style ${cost.style})` : ''}`);
			await t.check(`${tag}: at rest, no frame redraws the stage while every drawn part moved under ${STILL_PX} px`, R.frames > secs * 20 && R.still === 0, `${R.still} of ${R.drawn} drawn frames still (of ${R.frames}), e.g. ${R.stillDisp.join(', ')} px, writing ${R.stillWrites.join(' | ')}`);
			await t.check(`${tag}: at rest, no draw after skipped frames jumps over ${JUMP_PX} px`, R.late === 0, `${R.late} late draws ${R.lateDisp.join(', ')} px`);
			await t.check(`${tag}: at rest, the stage asks for no frame it does not draw in (spare ${SPARE_FRAMES} a second)`, rest.ticks <= R.drawn + SPARE_FRAMES * secs, `${rest.ticks} loop frames, ${R.drawn} drawn`);
			// a swing: drawn every frame while it moves
			await f.evaluate(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; window.__srd.start(); st.ps.thv += .3; st.kick(); });
			await f.waitForTimeout(500);
			const sw = summarize((await f.evaluate(() => window.__srd.end())).rows, .5);
			await t.check(`${tag}: a swing is drawn as it moves: no draw after skipped frames jumps over ${JUMP_PX} px, none still`, sw.frames >= 10 && sw.drawn >= sw.frames / 2 && sw.late === 0 && sw.still === 0, `${sw.drawn} of ${sw.frames} frames drawn, longest undrawn run ${sw.maxUndrawnRun}, ${sw.late} late draws ${sw.lateDisp.join(', ')} px, ${sw.still} still`);
			// new words: no still frame while they type
			await f.waitForTimeout(1500);
			await f.evaluate(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; window.__srd.start(); st.say('Measuring the stage, one moment.', null, true); });
			await f.waitForTimeout(1500);
			const sp = summarize((await f.evaluate(() => window.__srd.end())).rows, 1.5);
			await t.check(`${tag}: while new words type, no drawn frame is still and none jumps after skipped frames`, sp.drawn > 5 && sp.still === 0 && sp.late === 0, `${sp.drawn} drawn of ${sp.frames}, ${sp.still} still (${sp.stillWrites.join(' | ')}), ${sp.late} late ${sp.lateDisp.join(', ')} px`);
			await f.evaluate(() => window.__srd.stop());
			out.push({ look, size: [w, h], screen, surface: sandbox ? 'sandbox' : 'normal', rest: R, cost, swing: sw, speech: sp, lateRows: rest.rows.filter((r, i) => r.drawn && !r.content && r.dispPos > JUMP_PX && i && !rest.rows[i - 1].drawn).slice(0, 12) });
		});
	}
	const file = path.join(t.run.dir, 'stage-rest-draws.json');
	const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
	fs.writeFileSync(file, JSON.stringify(prev.concat(out), null, 1));
}

export const tests = {
	async 'stage draws at rest only when something drawn moved, normal page'(t) { if (!t.app.surfaces().includes('normal')) return t.check('not run: --set sandbox=1', true); await surface(t, false); },
	async 'stage draws at rest only when something drawn moved, sandbox'(t) { if (!t.app.surfaces().includes('sandbox')) return t.check('not run: --set sandbox=0', true); await surface(t, true); }
};
