// FO-60: a NieR cold opening cut short leaves nothing behind. Opened fresh under NieR Mode, the window opens cold: it
// opens from one line, the header assembles and a boot log runs (66-nier-window.js open/openGate, 11-window-nier.css's
// cold rules on #pm-o55-onboarding[data-o55nw-cold][data-o55nw-go]). When the look left NieR in the middle of that
// opening, the screen was shown in the other look and NieR's screen hook returned before it cleared the opening's
// state, so the two attributes stayed on the window. Back in NieR the cold rules matched again: under Reduced Motion the
// header's controls stayed at opacity 0 for good (Sol's welcome review N1 found it through wizard-header), and in full
// motion the cold opening played again, the window collapsing to a line, each time NieR came back.
// The user's route, on both surfaces: the page in NieR Dark, the window opened fresh (a cold opening), the look changed
// to Basic Light once the opening runs, then NieR Light again. Case 'look': in full motion; case 'motion': Reduced Motion
// switched on in the middle of the opening, then the same look change; case 'flip': Reduced Motion switched on in the
// middle of the opening and the look kept (NieR's own end of the opening clears its state). After the return to NieR, every frame for about a
// second is read at its end (a ResizeObserver): the window must carry no cold-opening state and play none of the cold
// opening's animations, and the header's controls must be on top and shown (t.visible, a hit test with opacity).
// `--set cases=look,motion,flip`; `--set sandbox=1` for T3's sandbox. Headless or `--record` (each step marked). About a minute.
const FRAMES = 60;

function installSampler() {
	if (window.__ncc) return;
	const S = window.__ncc = { on: false, left: 0, frames: [] };
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	new ResizeObserver(() => {
		if (!S.on) return;
		const r = document.querySelector('#pm-o55-onboarding'), win = r && r.querySelector('.o55-win'), ctl = r && r.querySelector('.o55-win .o55-head .o55-headctl');
		const fr = { t: Math.round(performance.now()) };
		if (r && win && ctl) {
			fr.cold = r.getAttribute('data-o55nw-cold'); fr.go = r.hasAttribute('data-o55nw-go') ? 1 : 0;
			fr.anims = win.getAnimations({ subtree: true }).filter((a) => /^o55nw-(win-)?cold/.test(a.animationName || '') && a.playState !== 'finished').map((a) => a.animationName);
			// the header controls' own opacity, through their ancestors up to the window
			let o = 1; for (let e = ctl; e && e !== r.parentElement; e = e.parentElement) o *= +getComputedStyle(e).opacity;
			fr.ctlOp = Math.round(o * 100) / 100;
			fr.vis = getComputedStyle(ctl).visibility;
		} else fr.none = 1;
		S.frames.push(fr);
		if (--S.left <= 0) { S.on = false; const done = S.done; S.done = null; if (done) done(S.frames); }
	}).observe(d);
}

export default async function (t) {
	const cases = t.args.cases ? String(t.args.cases).split(',') : ['look', 'motion', 'flip'];
	const bad = [];
	for (const kase of cases) {
		await t.emulate({ reducedMotion: 'no-preference' });
		// the page without the window, in NieR Dark (the kit's look: not kept), then the window opened fresh
		const f = await t.app.open({ onboarding: false });
		await t.app.look(t, 'nier-dark');
		await f.evaluate(installSampler);
		t.mark(`${kase}: the window opens in NieR Dark`);
		await f.evaluate(() => window.O55.ui.open({ fresh: true }));
		// the cold opening under way: its state on the window and its line released (data-o55nw-go)
		const cold = await f.waitForFunction(() => { const r = document.querySelector('#pm-o55-onboarding'); return !!(r && r.hasAttribute('data-o55nw-cold') && r.hasAttribute('data-o55nw-go')); }, null, { timeout: 15000 }).then(() => true, () => false);
		await t.check(`${kase}: the window opened cold in NieR (its opening under way)`, cold);
		if (!cold) continue;
		if (kase !== 'look') { t.mark(`${kase}: Reduced Motion on, mid-opening`); await t.emulate({ reducedMotion: 'reduce' }); }
		// the opening is over: the screen shown (it is held no longer) and every change settled
		const over = () => f.waitForFunction(() => {
			const r = document.querySelector('#pm-o55-onboarding'), L = r && r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
			return !!L && !L.classList.contains('o55-hold') && !r.classList.contains('o55-hold') && !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy());
		}, null, { timeout: 15000 }).then(() => true, () => false);
		const arm = () => f.evaluate((k) => { const S = window.__ncc; S.frames = []; S.left = k; S.on = true; S.p = new Promise((res) => { S.done = res; }); }, FRAMES);
		let fr;
		if (kase === 'flip') {
			// the opening goes on in NieR under Reduced Motion: once its screen shows, every frame for about a second
			await t.check(`${kase}: the screen shows in NieR Dark`, await over());
			t.mark(`${kase}: the opening over, in NieR`);
			await arm();
			fr = (await f.evaluate(() => window.__ncc.p)).filter((x) => !x.none);
		} else {
			t.mark(`${kase}: Basic Light, mid-opening`);
			await f.evaluate(() => window.O55.ui.applyLook('basic', 'light'));
			await t.check(`${kase}: the screen shows in Basic Light`, await over());
			const left = await f.evaluate(() => { const r = document.querySelector('#pm-o55-onboarding'); return `cold ${r.getAttribute('data-o55nw-cold')}, go ${r.hasAttribute('data-o55nw-go')}`; });
			t.log(`${kase}: in Basic Light after the cut opening: ${left}`);
			// back to NieR: every frame for about a second, from the change on
			t.mark(`${kase}: NieR Light again`);
			await arm();
			await f.evaluate(() => window.O55.ui.applyLook('nier', 'light'));
			fr = (await f.evaluate(() => window.__ncc.p)).filter((x) => !x.none);
			await t.check(`${kase}: NieR Light settles`, await over());
		}
		const stale = fr.filter((x) => x.cold != null || x.go), replay = fr.filter((x) => x.anims.length);
		const last = fr[fr.length - 1] || {};
		t.log(`${kase}: ${fr.length} frames ${kase === 'flip' ? 'after the opening' : 'after the return to NieR'}; cold state in ${stale.length}, the cold opening playing in ${replay.length}${replay.length ? ` (${[...new Set(replay.flatMap((x) => x.anims))].join(', ')})` : ''}; the header's controls at opacity ${last.ctlOp} (${last.vis}) at the end`);
		if (stale.length) bad.push(`${kase}: the window kept the cold opening's state in ${stale.length}/${fr.length} frames back in NieR (data-o55nw-cold ${stale[0].cold})`);
		if (replay.length) bad.push(`${kase}: the cold opening played again in ${replay.length}/${fr.length} frames (${[...new Set(replay.flatMap((x) => x.anims))].join(', ')})`);
		await t.check(`FO-60 ${kase}: back in NieR, the window keeps nothing of the cut opening and does not play it again (${fr.length} frames)`, fr.length > 0 && !stale.length && !replay.length, bad.filter((b) => b.startsWith(kase)).join('; '));
		await t.visible('#pm-o55-onboarding .o55-lookslot .o55-lookbtn', `FO-60 ${kase}: back in NieR, the look button is on top and shown`);
		await t.visible('#pm-o55-onboarding .o55-head .o55-headctl .o55-close', `FO-60 ${kase}: back in NieR, Close is on top and shown`);
		// nothing of this page is kept for the next check
		await t.app.resetLayout();
	}
	await t.emulate({ reducedMotion: 'no-preference' });
}
