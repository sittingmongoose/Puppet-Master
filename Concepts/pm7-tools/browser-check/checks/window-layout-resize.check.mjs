// FO-88 (opus-recheck-retro6): the onboarding window takes its layout for a new size in the frame the size changes,
// before that frame is painted. Resized from 1920x1080 to 740x768 by the page that holds it (the normal surface in a
// side-by-side frame, as a film shows a window resize), the window kept its wide two-column layout on screen for
// 0.3-1.8 s (Nas1) and one or more frames on Windows: the stage column and 'Take the guided tour' were cut at the
// window's right edge. 60-ui-core.js set the layout only from the window's resize event, which a frame resized by its
// page gets a frame after the new size is laid out and painted. T3's sandbox (its own process) switched at once.
// In each of the ten looks, on c-ready (Pip awake, the tour button in the footer), the frame is resized 1920x1080 ->
// 740x768 and back, --set reps=2 times; every frame is read at its end (a ResizeObserver on a dot an animation frame
// flips: after the frame's callbacks and layout, just before paint). Fails if, at 740x768:
//  - the first frame at that size, or any later one, is laid out other than narrow;
//  - the stage, or a footer button ('Take the guided tour', 'Enter Puppet Master'), reaches past the window's visible
//    box (the window cut by the viewport), more than 1 px.
// Also judged: back at 1920x1080 the first frame is wide. Preconditions (never skips): the window was wide before the
// resize, and frames were read at 740. Fails on 457801b0f6 on the normal surface (the first 740 frame wide in every look).
// What each surface proves (sol-review-g6): the reader runs inside the page, at the end of each frame the page lays out.
//  - Normal surface: the page is a frame in the same process as the page around it, which paints the page's frame in the
//    same frame it composites; what the reader reads is what that frame paints. Its claims are about painted frames
//    (60 fps films agree: 0 wide frames at 740 on the fix, 12-27 per resize on 457801b0f6, retro-c6 fo88 films).
//  - Sandbox: T3's frame is out of process. Until the page there commits its first frame at the new size, the browser
//    shows the frame's previous picture clipped to the new size (the 1920 window cut at the frame's edge: 21-45 frames on
//    Windows, FO-92, open), and nothing inside the page can see that. Its claims are about the frames the page itself lays
//    out: its own first frame at 740 is narrow, and so is every later one. The time from the resize to that first frame is
//    logged ('own first 740 frame N ms after the resize'), not judged. Native proof of the sandbox's first painted frame
//    needs a film and its frames (tools/stale88b.py in the retro-c6 evidence), and fails on FO-92 until it is fixed.
// Both surfaces (--set sandbox picks one); --set looks=, --set reps=. Headless or --record (the frames are resized, not
// the window, so a film shows each resize; each is marked).
//   browser-check run Concepts/pm7-tools/browser-check/checks/window-layout-resize.check.mjs --set page=<build>
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// the end-of-frame reader, in the app's frame
function install() {
	const S = window.__wlr = { on: true, frames: [] };
	const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? [r.left, r.top, r.right, r.bottom] : null; };
	const dot = document.createElement('i'); dot.setAttribute('aria-hidden', 'true');
	dot.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0';
	document.body.appendChild(dot);
	new ResizeObserver(() => {
		if (!S.on) return;
		const root = document.getElementById('pm-o55-onboarding'), win = root && root.querySelector('.o55-win');
		const layer = root && root.querySelector('.o55-layer:not(.o55-out)');
		const foot = layer ? [...layer.querySelectorAll('.o55-foot button')].filter((b) => b.offsetParent && b.getBoundingClientRect().width > 0) : [];
		const st = root && window.O55 && O55.pipStage && O55.pipStage.of(root.querySelector('.o55-stage'));
		S.frames.push({ t: performance.now(), at: Date.now(), w: innerWidth, h: innerHeight, lay: root && root.getAttribute('data-o55-layout'), drawn: st ? st.layoutName : null, win: R(win), stage: R(root && root.querySelector('.o55-stage')), foot: foot.map((b) => ({ name: (b.textContent || '').trim().slice(0, 28), r: R(b) })) });
	}).observe(dot);
	const flip = () => { if (!S.on) { dot.remove(); return; } dot.style.width = dot.style.width === '1px' ? '2px' : '1px'; requestAnimationFrame(flip); };
	requestAnimationFrame(flip);
}

// how far a box reaches past the window's visible box (the window cut by the viewport), px; 0 when inside
const past = (f, r) => {
	if (!r || !f.win) return 0;
	const v = [Math.max(f.win[0], 0), Math.max(f.win[1], 0), Math.min(f.win[2], f.w), Math.min(f.win[3], f.h)];
	return Math.max(0, v[0] - r[0], r[2] - v[2], v[1] - r[1], r[3] - v[3]);
};

async function run(t, mode) {
	let f, size;
	if (mode === 'normal') {
		await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
		const href = await t.root.evaluate(() => location.href);
		[f] = await t.openSideBySide([{ url: href, width: 1920, height: 1080, label: 'FO-88 normal: the page in a frame resized as a window would be' }]);
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = document.getElementById('__bc_side_0'); i.style.width = w + 'px'; i.style.height = h + 'px'; return Date.now(); }, [w, h]);
	} else {
		f = await t.app.open({ sandbox: true, onboarding: true, query: 'o55=screen=welcome' });
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = [...document.querySelectorAll('iframe')].find((x) => x.hasAttribute('sandbox')); i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.flex = 'none'; return Date.now(); }, [w, h]);
	}
	await f.waitForFunction(() => !!window.O55 && !!O55.S && !!O55.S.root, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
	const reps = +t.args.reps || 2;
	for (const look of t.args.looks ? String(t.args.looks).split(',') : LOOKS) {
		await size(1920, 1080);
		await f.waitForTimeout(500);
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), look.split('-'));
		await f.waitForTimeout(900);
		await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'c-ready' }));
		await f.waitForTimeout(2500);
		for (let i = 1; i <= reps; i++) {
			const tag = `${mode} ${look} c-ready rep ${i}`;
			await f.evaluate(install);
			await f.waitForTimeout(150);
			await t.mark(`${look} rep ${i} 740`);
			const sizedAt = await size(740, 768);
			await f.waitForTimeout(1500);
			await t.mark(`${look} rep ${i} 1920`);
			await size(1920, 1080);
			await f.waitForTimeout(1200);
			const fr = await f.evaluate(() => { const S = window.__wlr; S.on = false; return S.frames; });
			const before = fr.filter((x) => x.w === 1920), at = fr.filter((x) => x.w === 740), i740 = fr.findIndex((x) => x.w === 740);
			const back = fr.slice(i740 + 1).filter((x) => x.w === 1920);
			const wrong = at.filter((x) => x.lay !== 'narrow');
			/* (and Pip's stage drawn for it in the same frame: the stage's own layout, banner over a narrow window; a redraw a
			   frame late showed the tall stage's scene in the banner, FO88-N1) */
			const stale = at.filter((x) => x.drawn !== 'banner');
			const cut = at.map((x) => ({ x, s: past(x, x.stage), b: Math.max(0, ...x.foot.map((q) => past(x, q.r))), who: x.foot.filter((q) => past(x, q.r) > 1).map((q) => q.name) })).filter((c) => c.s > 1 || c.b > 1);
			/* (how long after the resize, wall clock, the page laid out its own first frame at 740: before it, the sandbox's
			   out-of-process frame shows its old picture clipped, FO-92; logged, not judged) */
			const ownFirst = at[0] ? Math.round(at[0].at - sizedAt) : null;
			const why = JSON.stringify({ frames: fr.length, at740: at.length, ownFirstMs: ownFirst, first740: at[0] && { lay: at[0].lay, win: at[0].win && at[0].win.map(Math.round), stage: at[0].stage && at[0].stage.map(Math.round) }, wrongLayout: wrong.length, staleStage: stale.length, firstDrawn: at[0] && at[0].drawn, cut: cut.length, worstCut: cut[0] && { stage: Math.round(cut[0].s), button: Math.round(cut[0].b), who: cut[0].who, lay: cut[0].x.lay }, backFirst: back[0] && back[0].lay, footButtons: at[0] ? at[0].foot.map((q) => q.name) : [] });
			// (preconditions: wide before, frames read at 740, the footer's buttons there)
			await t.check(`${tag}: wide at 1920x1080 before the resize`, before.length > 0 && before[before.length - 1].lay === 'wide', why);
			await t.check(`${tag}: frames read at 740x768`, at.length > 1 && at[0].foot.length > 0 && !!at[0].stage, why); /* (a loaded film machine paints few: 2-17 frames in 1.5 s on the VM while it recorded) */
			/* (the claim each surface can make: painted frames in the same process; the page's own frames out of process, where
			   the browser's clipped old picture before them is FO-92 and not seen here) */
			const F = mode === 'normal' ? { first: 'the first frame painted', every: 'every frame painted' } : { first: "the page's own first frame laid out (the clipped old picture shown before it is FO-92, not judged)", every: 'every frame the page lays out' };
			await t.check(`${tag}: ${F.first} at 740x768 is narrow`, !!at[0] && at[0].lay === 'narrow', why);
			await t.check(`${tag}: ${F.every} at 740x768 is narrow`, wrong.length === 0, why);
			await t.check(`${tag}: Pip's stage drawn for the narrow window (banner) in ${F.every} at 740x768`, stale.length === 0, why);
			await t.check(`${tag}: the stage and the footer buttons inside the window in ${F.every} at 740x768`, cut.length === 0, why);
			await t.check(`${tag}: ${F.first.replace(' (the clipped old picture shown before it is FO-92, not judged)', '')} back at 1920x1080 is wide`, !!back[0] && back[0].lay === 'wide', why);
			if (mode === 'sandbox') t.log(`${tag}: own first 740 frame ${ownFirst} ms after the resize`);
			t.log(`${tag}: ${why}`);
		}
	}
}

export const tests = {
	'layout on resize normal': on('normal', run),
	'layout on resize sandbox': on('sandbox', run)
};
