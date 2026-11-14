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
// Logged: when the new screen's title was first presented (Element Timing: the check gives the title an elementtiming
// attribute as its layer is appended; its renderTime follows the title's own staggered fade-in, so it is not the
// screen's first frame);
// and the longest gap between animation frames from the release to the new screen's first frame, and the same
// numbers for one later change (Look's Continue) and for Start again in the same browser (a second open: the GPU's shader
// cache warm), neither judged. Then, under Reduced Motion (unchanged by FO-206):
// Start shows the new screen in the click's own task (no hold, no entrance).
// Both surfaces (--set sandbox=0 and 1). About 40 s a surface.
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
	const FIRST = +(t.args.first || 100), TASK = +(t.args.task || 50), GAP = +(t.args.gap || 50);
	const open = async (reduced) => {
		await t.emulate({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox });
		await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.svg); }, null, { timeout: 60000 });
		await f.waitForTimeout(5000);
		await f.evaluate(ARM);
		return f;
	};
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
