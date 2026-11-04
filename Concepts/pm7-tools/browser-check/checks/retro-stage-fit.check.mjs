// FO-37 and A3-6: in the Retro looks Pip and the name's sign stay whole where a person can see them. Retro's tube slices
// the scene to fill the pane (a short window's crop left Pip's spot off the tube, and the narrow strip cut the hand at
// the top), and Retro Light's printer, its platen, bail and head, covers the paper's foot (the sign's lower line sat
// behind the roller at 740). In Retro Light and Retro Dark, on Name with a name typed, through every window layout
// (860, 1024, 1280, 1390 and 1920 wide, narrow 740, short 1280x500) resized down and back up, and loaded fresh at 1920,
// 860, 740 and 1280x500, once the tube has powered on, every frame of a short sample: Pip's painted box (hand and head)
// is inside the stage's visible crop (the tube or paper, cut by every box that clips it and by the window), Pip's head
// is above the tube's foot (Retro Light's printer, the command line), the sign is inside the crop and above that foot,
// and no resting prop covers Pip's head. Asleep Pip (Welcome before you arrive) rests above the foot at 740 and 1280x500.
// Both surfaces (--set sandbox picks one); --set motion=reduce runs it under Reduced Motion.
//   browser-check run Concepts/pm7-tools/browser-check/checks/retro-stage-fit.check.mjs --set page=<build>
const LOOKS = ['retro-light', 'retro-dark'];
const DOWN = [[1920, 1080], [1390, 900], [1280, 800], [1024, 768], [860, 768], [740, 768], [1280, 500]];
const SEQ = DOWN.concat(DOWN.slice(0, -1).reverse());
const FRESH = [[1920, 1080], [860, 768], [740, 768], [1280, 500]];
const NAME = 'First cancellation';

// the page, or T3's sandbox at t.openInSandbox's default flags (an opaque origin, no storage, no modals), as the kit opens it
const frameFor = (t, mode) => t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
// a case runs on its own surface unless --set sandbox picks the other one
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// every frame for about 600 ms: the worst of each measure (px; > 0 is wrong)
const SAMPLE = async () => {
	const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
	if (!st) return { err: 'no stage' };
	const R = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
	const out = (a, c) => Math.max(c.l - a.l, a.r - c.r, c.t - a.t, a.b - c.b);
	const worst = { pip: -1e9, headFoot: -1e9, sign: -1e9, signFoot: -1e9, propOnHead: 0 }, seen = { sign: 0 };
	let n = 0, last = null;
	const t0 = performance.now();
	while (performance.now() - t0 < 600) {
		await new Promise((r) => requestAnimationFrame(() => r()));
		n++;
		// the visible crop: the tube or paper, cut by every box that clips it, and by the window
		const c = R(st.screen); c.l = Math.max(c.l, 0); c.t = Math.max(c.t, 0); c.r = Math.min(c.r, innerWidth); c.b = Math.min(c.b, innerHeight);
		for (let a = st.screen.parentElement; a; a = a.parentElement) { const s = getComputedStyle(a), q = R(a); if (/hidden|clip|auto|scroll/.test(s.overflowX)) { c.l = Math.max(c.l, q.l); c.r = Math.min(c.r, q.r); } if (/hidden|clip|auto|scroll/.test(s.overflowY)) { c.t = Math.max(c.t, q.t); c.b = Math.min(c.b, q.b); } }
		// what the tube paints over its foot: Retro Light's printer (platen, bail, head) and the command line
		const pr = st.screen.querySelector('.pst-printer'), cmd = st.screen.querySelector('.pst-term-cmd');
		const feet = (pr ? [pr, ...pr.children] : []).concat(cmd ? [cmd] : []).map(R).filter((q) => q.b > q.t);
		const foot = feet.length ? Math.min(...feet.map((q) => q.t)) : c.b;
		const head = R(st.gHead), hand = R(st.gCtl), pip = { l: Math.min(head.l, hand.l), t: Math.min(head.t, hand.t), r: Math.max(head.r, hand.r), b: Math.max(head.b, hand.b) };
		worst.pip = Math.max(worst.pip, out(pip, c));
		worst.headFoot = Math.max(worst.headFoot, head.b - foot);
		const props = [...st.props.values()].filter((p) => p.state !== 'out' && p.op > .95);
		for (const p of props) {
			const q = R(p.el);
			if (p.spec.kind === 'sign') { seen.sign++; worst.sign = Math.max(worst.sign, out(q, c)); worst.signFoot = Math.max(worst.signFoot, q.b - foot); }
			const ix = Math.min(q.r, head.r) - Math.max(q.l, head.l), iy = Math.min(q.b, head.b) - Math.max(q.t, head.t);
			if (ix > 0 && iy > 0) worst.propOnHead = Math.max(worst.propOnHead, Math.min(ix, iy));
		}
		last = { crop: [c.l, c.t, c.r, c.b].map(Math.round), pip: [pip.l, pip.t, pip.r, pip.b].map(Math.round), foot: Math.round(foot) };
	}
	const r1 = (v) => (v < -1e8 ? null : Math.round(v * 10) / 10);
	return { theme: st.theme, layout: st.layoutName, asleep: !!st.sleepZ, reduced: !!st.reduced, low: !!O55.motion.lowResource, n, signFrames: seen.sign, pip: r1(worst.pip), headFoot: r1(worst.headFoot), sign: r1(worst.sign), signFoot: r1(worst.signFoot), propOnHead: r1(worst.propOnHead), last };
};

// the tube powered on (the paper fed in, the line opened) and its stepped draw caught up
const settle = async (t, f) => {
	await f.waitForFunction(() => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && st.content.getAnimations().length === 0; }, null, { timeout: 8000 }).catch(() => {});
	await f.waitForTimeout(450);
};

async function judge(t, f, tag, { sign = true } = {}) {
	await settle(t, f);
	const r = await f.evaluate(`(${SAMPLE.toString()})()`);
	if (r.err) return t.check(`${tag}: the stage`, false, r.err);
	const at = `${tag} [${r.theme} ${r.layout}${r.asleep ? ', asleep' : ''}${r.low ? ', low-resource' : ''}${r.reduced ? ', reduced' : ''}]`;
	const why = JSON.stringify(r.last);
	await t.check(`${at}: Pip's hand and head inside the visible crop`, r.pip <= 1, `${r.pip} px outside; ${why}`);
	await t.check(`${at}: Pip's head above the tube's foot`, r.headFoot <= 0.5, `${r.headFoot} px into it; ${why}`);
	if (sign) {
		await t.check(`${at}: the name's sign is on stage`, r.signFrames > 0, `${r.signFrames}/${r.n} frames`);
		await t.check(`${at}: the sign inside the visible crop`, r.sign <= 1, `${r.sign} px outside; ${why}`);
		await t.check(`${at}: the sign above the tube's foot (printer, command line)`, r.signFoot <= 0.5, `${r.signFoot} px into it; ${why}`);
	}
	await t.check(`${at}: no prop over Pip's head`, r.propOnHead <= 1, `${r.propOnHead} px; ${why}`);
	return r;
}

// the look, as the window's look menu picks it (the page's own theme switch does not reach an open setup window)
async function stageLook(t, f, look) {
	await f.evaluate(([fam, m]) => window.O55.ui.applyLook(fam, m), look.split('-'));
	await f.waitForFunction((lk) => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && st.theme === lk; }, look, { timeout: 15000 }).catch(() => {});
	const th = await f.evaluate(() => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return st ? st.theme : 'no stage'; });
	return t.check(`the stage is in ${look}`, th === look, th, { hard: true });
}

async function lookAndName(t, f, look) {
	await stageLook(t, f, look);
	await f.evaluate(() => { try { window.O55.ui.go('name', { noHistory: true }); } catch (e) { window.O55.ui.open({ screen: 'name' }); } });
	await f.waitForFunction(() => window.O55.S.sess.screen === 'name' && !!document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]'), null, { timeout: 15000 });
	await f.waitForTimeout(900);
	// typed, as a person does: Pip wakes, says its line, and the sign takes the name
	await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]').first().click();
	await t.page.keyboard.press('Control+A');
	await t.page.keyboard.type(NAME, { delay: 12 });
	await f.waitForTimeout(1200);
}

async function fit(t, mode) {
	const reduce = t.args.motion === 'reduce';
	for (const look of LOOKS) {
		// asleep: Welcome before anyone arrives, in the narrow and short layouts
		await t.viewport(740, 768);
		let f = await frameFor(t, mode);
		await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
		await stageLook(t, f, look);
		for (const [w, h] of [[740, 768], [1280, 500]]) {
			await t.viewport(w, h);
			const asleep = await f.evaluate(() => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!(st && st.sleepZ); });
			if (asleep) await judge(t, f, `${mode} ${look} Welcome asleep ${w}x${h}`, { sign: false });
			else t.log(`${mode} ${look} ${w}x${h}: Pip was awake on Welcome, the asleep case not measured`);
		}
		// Name, resized down through every layout and back up
		await t.viewport(1920, 1080);
		await lookAndName(t, f, look);
		let prev = null;
		for (const [w, h] of SEQ) {
			await t.viewport(w, h);
			await judge(t, f, `${mode} ${look} Name ${prev ? prev + ' -> ' : ''}${w}x${h}`);
			prev = `${w}x${h}`;
		}
		// Name, loaded fresh at each size
		for (const [w, h] of FRESH) {
			await t.viewport(w, h);
			f = await frameFor(t, mode);
			await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
			await lookAndName(t, f, look);
			const r = await judge(t, f, `${mode} ${look} Name fresh ${w}x${h}`);
			if (mode === 'normal' && (w === 740 || h === 500) && !reduce) await t.crop(`${look}-${w}x${h}`, '#pm-o55-onboarding .o55-stage', `${look} at ${w}x${h}, Name: Pip whole on the ${r.layout} stage, the sign whole above the printer and command line`);
		}
	}
	await t.viewport(1920, 1080);
}

// --set film=1: for a recording (which refuses viewport changes), the page in one frame of the window, resized by its
// frame: Name in each Retro look (--set look=retro-light for one), down through the layouts and back up, each size marked
// and held, the same measures judged once it settles. Normal surface only.
//   browser-check run <kit>/checks/retro-stage-fit.check.mjs --set film=1 --set page=<build> --record /abs/film.mp4
const FILM = [[1920, 1056], [1390, 900], [1024, 768], [860, 768], [740, 768], [1280, 500], [740, 768], [860, 768], [1390, 900], [1920, 1056]];
async function film(t) {
	await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	const href = await t.root.evaluate(() => location.href);
	const [f] = await t.openSideBySide([{ url: href, width: 1920, height: 1056, label: 'Retro stage fit: the page in a frame resized as a window would be' }]);
	await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.O55 && !!O55.S, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
	const size = (w, h) => t.window.evaluate(([w, h]) => { const i = document.getElementById('__bc_side_0'); i.style.width = w + 'px'; i.style.height = h + 'px'; }, [w, h]);
	for (const look of t.args.look ? String(t.args.look).split(',') : LOOKS) {
		await size(1920, 1056);
		await lookAndName(t, f, look);
		let prev = null;
		for (const [w, h] of FILM) {
			await size(w, h);
			await t.mark(`${look} ${w}x${h}`);
			await f.waitForTimeout(2600);
			await t.inFrame(f, () => judge(t, f, `film ${look} Name ${prev ? prev + ' -> ' : ''}${w}x${h}`));
			prev = `${w}x${h}`;
		}
	}
}

export const tests = {
	'retro stage fit normal': (t) => (t.args.film ? film(t) : on('normal', fit)(t)),
	'retro stage fit sandbox': (t) => (t.args.film ? t.check('not run: the film is of the normal surface', true) : on('sandbox', fit)(t))
};
