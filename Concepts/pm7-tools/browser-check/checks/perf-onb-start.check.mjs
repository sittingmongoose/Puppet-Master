// Welcome's Start paints the first Look screen at once (FO-206, pm7-perf lane T, 2026-11-14).
//
// Report from another stream (main 9bfa159274, Windows RTX 3090 headless at 1694x1290 @1.5): after the press on Welcome's
// Start no frame is painted for about 295-308 ms while the first Look screen comes in (Alexis under load 450-1000 ms);
// the Look title's 500 ms slide-in is mostly over when painting resumes, so it reads as a cut. Later screen changes keep
// their gaps under 83 ms.
//
// From a cold first open (?o55=fresh), a real press (down, 90 ms, up) on Start, timed in the page: the release (the
// click's timeStamp), every animation frame (requestAnimationFrame), long tasks (PerformanceObserver 'longtask'), the new
// screen's layer appended (held) and its hold removed (the entrance starts: 60-ui-core.js transition, O55.motion.release),
// and the first animation frame after that (the new screen's first frame). Judged for Start:
//   first    the new screen's first frame within --set first=100 ms of the release;
//   tasks    no long task over --set task=50 ms from the release to the end of the entrance (its first frame + 600 ms: the
//            title's slide-in is 500 ms);
//   frames   no gap between animation frames over --set gap=50 ms in that span: a cold browser's GPU compiling the
//            new screen's programs draws no frame, on Alexis 425-513 ms right after the first one, and no task shows it;
//   fonts    no font face is loaded for the first time by Start: the five tiles carry the five looks, and each face that
//            arrived laid the whole page out again (4,034 objects, "Fonts changed", in the frame after the press).
// Welcome idle (60-ui-core.js predraw: the Look screen drawn invisibly, one or two elements a slice, so a cold browser's
// GPU compiles its programs before Start): no frame over --set pdgap=80 ms while it draws (every gap over 34 ms is
// logged: a single shape can need two programs, the lead's ruling C keeps those 50-75 ms stalls), the whole pre-draw
// within --set pdms=4000 ms (on a quiet PC), and once done nothing left (no host, marked element or listener); Start
// pressed while it runs: the Look screen comes in and it ends, leaving nothing; low-resource mode: it draws nothing once
// on; Reduced Motion: it runs and changes nothing on screen (the window's pane during it and after it, the same pixels).
// Logged: when the new screen's title was first presented (Element Timing: the check gives the title an elementtiming
// attribute as its layer is appended; its renderTime follows the title's own staggered fade-in, so it is not the
// screen's first frame);
// and the longest gap between animation frames from the release to the new screen's first frame, and the same
// numbers for one later change (Look's Continue) and for Start again in the same browser (a second open: the GPU's shader
// cache warm), neither judged. Then, under Reduced Motion (unchanged by FO-206):
// Start shows the new screen in the click's own task (no hold, no entrance).
// Both surfaces (--set sandbox=0 and 1). About 40 s a surface.
import fs from 'node:fs';

const ARM = () => {
	if (window.__pos) return;
	const P = window.__pos = { on: false, n: 0, ts: [], lt: [], click: 0, build: 0, show: 0, frame: 0, paint: 0, screen: null, shownInClick: null };
	// the font faces loaded so far (each FontFace's own status: document.fonts' status and ready would flush style and layout)
	P.loadedFaces = () => { const o = []; document.fonts.forEach((x) => { if (x.status === 'loaded') o.push([x.family, x.weight, x.style, x.unicodeRange].join('|')); }); return o; };
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.identifier === 'pos-title-' + P.n && !P.paint) P.paint = e.renderTime || e.loadTime; }).observe({ type: 'element', buffered: true }); } catch (_) { /* none */ }
	const tick = (now) => { if (P.on) P.ts.push(now); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) P.lt.push([e.startTime, e.duration]); }).observe({ entryTypes: ['longtask'] }); } catch (_) { /* none */ }
	document.addEventListener('click', (e) => { if (P.on && !P.click && e.target && e.target.closest && e.target.closest('#pm-o55-onboarding')) P.click = e.timeStamp; }, true);
	const pane = document.querySelector('#pm-o55-onboarding .o55-pane');
	new MutationObserver((list) => {
		if (!P.on) return;
		for (const m of list) {
			if (m.type === 'childList') m.addedNodes.forEach((n) => {
				if (!(n.classList && n.classList.contains('o55-layer')) || P.build) return;
				P.build = performance.now(); P.screen = n.dataset.screen;
				const h = n.querySelector('.o55-title'); if (h) h.setAttribute('elementtiming', 'pos-title-' + P.n);
				if (!n.classList.contains('o55-hold')) { P.show = P.build; P.shownInClick = true; requestAnimationFrame((ts) => { P.frame = ts; }); }
			});
			else if (P.build && !P.show && m.target.classList.contains('o55-layer') && m.oldValue && /o55-hold/.test(m.oldValue) && !m.target.classList.contains('o55-hold') && !m.target.classList.contains('o55-out')) {
				P.show = performance.now(); P.shownInClick = false; requestAnimationFrame((ts) => { P.frame = ts; });
			}
		}
	}).observe(pane, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
};
const START = () => { const P = window.__pos; Object.assign(P, { on: true, n: P.n + 1, ts: [], lt: [], click: 0, build: 0, show: 0, frame: 0, paint: 0, screen: null, shownInClick: null }); P.faces = P.loadedFaces(); };
const READ = () => {
	const P = window.__pos, c = P.click;
	P.on = false;
	if (!c) return { click: false };
	const ts = P.ts.filter((x) => x >= c - 40), d = ts.slice(1).map((x, i) => [ts[i], x - ts[i]]);
	const until = P.frame || c + 2000;
	const stall = d.filter((g) => g[0] + g[1] >= c && g[0] <= until).reduce((m, g) => Math.max(m, g[1]), 0);
	const end = (P.frame || c) + 600;
	return {
		click: true, screen: P.screen, shownInClick: P.shownInClick,
		build: P.build ? Math.round(P.build - c) : null, show: P.show ? Math.round(P.show - c) : null, first: P.frame ? Math.round(P.frame - c) : null,
		paint: P.paint ? Math.round(P.paint - c) : null,
		newFaces: P.loadedFaces().filter((k) => P.faces.indexOf(k) < 0),
		stall: Math.round(stall), lt: P.lt.filter((e) => e[0] + e[1] > c - 5 && e[0] < end).map((e) => [Math.round(e[0] - c), Math.round(e[1])]),
		gapsIn: d.filter((g) => g[0] >= (P.frame || c) && g[0] <= end && g[1] > 34).map((g) => [Math.round(g[0] - c), Math.round(g[1])]),
		gapsAll: d.filter((g) => g[0] + g[1] >= c && g[0] <= end).map((g) => [Math.round(g[0] - c), Math.round(g[1])])
	};
};

async function surface(t, sandbox) {
	const tag = sandbox ? 'sandbox' : 'normal';
	const FIRST = +(t.args.first || 100), TASK = +(t.args.task || 50), GAP = +(t.args.gap || 50), PDGAP = +(t.args.pdgap || 80), PDMS = +(t.args.pdms || 4000);
	const open = async (reduced, o) => {
		await t.emulate({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ onboarding: true, query: 'o55=fresh' + (t.args.q ? '&' + t.args.q : ''), sandbox });
		// every frame from the start, so the Welcome screen's idle time (and a pre-draw in it) is seen whole
		await f.evaluate(() => { if (window.__pdf) return; window.__pdf = []; const tk = (now) => { window.__pdf.push(now); requestAnimationFrame(tk); }; requestAnimationFrame(tk); });
		await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.svg); }, null, { timeout: 60000 });
		if (o && o.early) return f;
		await f.waitForTimeout(5000);
		await f.evaluate(ARM);
		return f;
	};
	const pdState = (f) => f.evaluate(() => (window.O55.ui.prewarm && window.O55.ui.prewarm.state ? window.O55.ui.prewarm.state() : null));
	const pdLeft = (f) => f.evaluate(() => document.querySelectorAll('#pm-o55-onboarding .o55-prewarm, #pm-o55-onboarding [data-pd]').length);
	const pdRunning = (f, ms) => f.waitForFunction(() => { const s = window.O55.ui.prewarm && window.O55.ui.prewarm.state && window.O55.ui.prewarm.state(); return !!(s && s.phase === 'running' && s.slices >= 2); }, null, { timeout: ms || 20000 }).then(() => true, () => false);
	// FO-206 G: the Look screen drawn a piece at a time while Welcome is idle (60-ui-core.js predraw), waited for to its end
	const predrawn = (f) => f.evaluate(async () => {
		const st = () => (window.O55.ui.prewarm && window.O55.ui.prewarm.state ? window.O55.ui.prewarm.state() : null);
		for (let k = 0; k < 250 && st() && st().phase === 'running'; k++) await new Promise((r) => setTimeout(r, 100));
		const s0 = st(); if (!s0 || s0.phase === 'none') return { none: true };
		const ts = window.__pdf.filter((x) => x >= s0.startedAt - 20 && x <= s0.endedAt + 20), d = ts.slice(1).map((x, i) => [ts[i], x - ts[i]]);
		return Object.assign({}, s0, { ms: Math.round(s0.endedAt - s0.startedAt), frames: d.length, worstGap: Math.round(Math.max(0, ...d.map((g) => g[1]))), gaps: d.filter((g) => g[1] > 34).map((g) => [Math.round(g[0] - s0.startedAt), Math.round(g[1])]),
			left: document.querySelectorAll('#pm-o55-onboarding .o55-prewarm, #pm-o55-onboarding [data-pd]').length });
	});
	const cur = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
	const change = async (f, sel) => {
		const loc = f.locator(sel).first(); await loc.waitFor({ state: 'visible', timeout: 20000 });
		const b = await loc.boundingBox(); if (!b) throw new Error('no box ' + sel);
		await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await t.page.waitForTimeout(150);
		await f.evaluate(START);
		await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
		await f.waitForTimeout(2500);
		return f.evaluate(READ);
	};
	const say = (name, r) => t.log(`${tag}: ${name}: ${r.click ? `-> ${r.screen}: built at ${r.build} ms after the release, shown at ${r.show}, an animation frame by ${r.first}, its title presented at ${r.paint}; longest frame gap until then ${r.stall} ms; long tasks ${JSON.stringify(r.lt)}; entrance gaps over 34 ms ${JSON.stringify(r.gapsIn)}` : 'no click seen'}`);
	let f = await open(false);
	const pre = await predrawn(f);
	t.log(`${tag}: Welcome's pre-draw of the Look screen: ${JSON.stringify(pre)}`);
	if (!pre.none) {
		// every stall is logged (the lead's ruling C: a cold browser keeps two or three single-shape stalls of 50-75 ms)
		if (pre.gaps.length) t.log(`${tag}: NOTE Welcome's pre-draw: ${pre.gaps.length} frame gap(s) over 34 ms ${JSON.stringify(pre.gaps)}; long slices ${JSON.stringify(pre.long || [])}`);
		const over = pre.gaps.filter((g) => g[1] > PDGAP);
		await t.check(`${tag}: Welcome idle: the pre-draw of the Look screen holds no frame over ${PDGAP} ms`, over.length === 0, `${pre.slices} slices of ${pre.pieces} elements in ${pre.ms} ms, ended '${pre.why}'; frame gaps over 34 ms ${JSON.stringify(pre.gaps)}`);
		await t.check(`${tag}: Welcome idle: the whole pre-draw takes at most ${PDMS} ms`, pre.ms <= PDMS, `${pre.ms} ms for ${pre.slices} slices (on a loaded PC it runs longer: the frames it waits on come later)`);
		await t.check(`${tag}: Welcome idle: the pre-draw ended and left nothing (no host, no marked element, no listener)`, pre.phase === 'done' && pre.why === 'done' && pre.left === 0 && pre.listeners === 0, JSON.stringify({ phase: pre.phase, why: pre.why, left: pre.left, listeners: pre.listeners }));
	}
	const s = await change(f, `${cur} [data-o55-do="start"]`);
	say('Start', s);
	await t.check(`${tag}: Start: the press reached the window and built the Look screen`, s.click && s.screen === 'look', JSON.stringify(s));
	if (s.click && s.screen === 'look') {
		await t.check(`${tag}: Start: the Look screen's first frame within ${FIRST} ms of the release`, s.first != null && s.first <= FIRST, `first frame by ${s.first} ms (built ${s.build}, shown ${s.show}); longest frame gap until then ${s.stall} ms`);
		const over = s.lt.filter((e) => e[1] > TASK);
		await t.check(`${tag}: Start: no task over ${TASK} ms from the release to the end of the entrance`, over.length === 0, `long tasks ${JSON.stringify(s.lt)} (first frame by ${s.first} ms; entrance to ${s.first + 600})`);
		await t.check(`${tag}: Start: no font face loads for the first time (each one that arrives lays the whole page out again)`, s.newFaces.length === 0, `${s.newFaces.length} faces first loaded by Start: ${JSON.stringify(s.newFaces.slice(0, 12))}`);
		const gaps = s.gapsAll.filter((g) => g[1] > GAP);
		await t.check(`${tag}: Start: no frame gap over ${GAP} ms from the release to the end of the entrance`, gaps.length === 0, `${gaps.length} gaps: ${JSON.stringify(gaps)}`);
	}
	await f.waitForTimeout(1500);
	const later = await change(f, `${cur} .o55-primary`);
	say('Look Continue (logged, not judged)', later);
	// the same Start again in the same browser (its GPU's shader cache and font cache now warm): logged, not judged
	f = await open(false);
	const warm = await change(f, `${cur} [data-o55-do="start"]`);
	say('Start again, same browser (logged, not judged)', warm);
	// (4) Start pressed while the pre-draw runs: the rest is paid as before, nothing breaks, nothing is left
	if (!pre.none) {
		f = await open(false, { early: true });
		const running = await pdRunning(f);
		if (running) {
			await f.evaluate(ARM);
			const mid = await change(f, `${cur} [data-o55-do="start"]`);
			say('Start while the pre-draw runs', mid);
			const st = await pdState(f), left = await pdLeft(f);
			await t.check(`${tag}: Start while the pre-draw runs: the Look screen comes in, the pre-draw ends and leaves nothing`, mid.click && mid.screen === 'look' && mid.show != null && st.phase === 'done' && st.why === 'left' && st.listeners === 0 && left === 0, JSON.stringify({ screen: mid.screen, show: mid.show, phase: st.phase, why: st.why, listeners: st.listeners, left }));
		} else await t.check(`${tag}: Start while the pre-draw runs: the pre-draw was seen running`, false, JSON.stringify(await pdState(f)));
		// (5) a low-resource computer: no pre-draw (and no font host)
		f = await open(false, { early: true });
		const lr0 = await f.evaluate(() => { window.O55.motion.setLowResource(true, 'scenario'); const s = window.O55.ui.prewarm.state(); return s; });
		await f.waitForTimeout(7000);
		const lr = await pdState(f), lrLeft = await pdLeft(f);
		await f.evaluate(() => window.O55.motion.setLowResource(false, null));
		// (switched on as soon as the page is up: a pre-draw already going when it came ends there, and draws no more)
		await t.check(`${tag}: low-resource mode: no pre-draw slice once it is on, and nothing left`, !!lr && (lr.phase === 'none' || (lr.phase === 'done' && lr.slices === lr0.slices)) && lrLeft === 0, JSON.stringify({ at: { phase: lr0.phase, slices: lr0.slices }, after: { phase: lr && lr.phase, why: lr && lr.why, slices: lr && lr.slices }, left: lrLeft }));
		// Reduced Motion: the pre-draw runs (it is not motion) and nothing visible changes: the window's pane drawn during it
		// and once it has ended, pixel for pixel (the same PNG bytes)
		f = await open(true, { early: true });
		if (await pdRunning(f)) {
			const pane = f.locator('#pm-o55-onboarding .o55-pane');
			const during = await pane.screenshot();
			await f.waitForFunction(() => { const s = window.O55.ui.prewarm.state(); return s.phase === 'done'; }, null, { timeout: 30000 }).catch(() => {});
			await f.waitForTimeout(300);
			const after = await pane.screenshot();
			// (T_DIR set: both pictures are kept when they differ, to see where)
			if (!during.equals(after) && process.env.T_DIR) { fs.writeFileSync(`${process.env.T_DIR}/rm-${tag}-during.png`, during); fs.writeFileSync(`${process.env.T_DIR}/rm-${tag}-after.png`, after); }
			await t.check(`${tag}: Reduced Motion: the pre-draw changes nothing on screen (the pane during it and after it, the same pixels)`, during.equals(after), `${during.length} and ${after.length} bytes; state ${JSON.stringify(await pdState(f))}`);
		} else await t.check(`${tag}: Reduced Motion: the pre-draw was seen running`, false, JSON.stringify(await pdState(f)));
	}
	// Reduced Motion: unchanged (no hold): Start shows the new screen in the click's own task
	f = await open(true);
	const rm = await change(f, `${cur} [data-o55-do="start"]`);
	say('Reduced Motion Start', rm);
	await t.check(`${tag}: Reduced Motion: Start shows the Look screen in the click's own task (no hold, no entrance)`, rm.click && rm.screen === 'look' && rm.shownInClick === true, JSON.stringify(rm));
	await t.emulate({ reducedMotion: 'no-preference' });
}

export default async function (t) {
	for (const s of t.app.surfaces()) await surface(t, s === 'sandbox');
}
