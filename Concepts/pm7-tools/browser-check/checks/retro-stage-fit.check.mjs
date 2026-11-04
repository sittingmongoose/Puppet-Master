// FO-37 and A3-6: in the Retro looks Pip and the name's sign stay whole where a person can see them. Retro's tube slices
// the scene to fill the pane (a short window's crop left Pip's spot off the tube, and the narrow strip cut the hand at
// the top), and Retro Light's printer, its platen, bail and head, covers the paper's foot (the sign's lower line sat
// behind the roller at 740). In Retro Light and Retro Dark, on Name with a name typed, through every window layout
// (860, 1024, 1280, 1390 and 1920 wide, narrow 740, short 1280x500) resized down and back up, and loaded fresh at 1920,
// 860, 740 and 1280x500, once the tube has powered on, every frame of a short sample: Pip's painted box (hand and head)
// is inside the stage's visible crop (the tube or paper, cut by every box that clips it and by the window), Pip's head
// is above the tube's foot (Retro Light's printer, the command line), the sign is inside the crop and above that foot,
// and no resting prop covers Pip's head. Asleep Pip (Welcome before you arrive) rests above the foot at 740 and 1280x500.
// 'retro props every screen': each setup screen opened fresh at 860, 740 and 1280x500, every resting prop inside the crop,
// above the foot and off Pip's head (FO-50's c-ready server; the props Retro's crop and the foot band move).
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
	const worst = { pip: -1e9, headFoot: -1e9, sign: -1e9, signFoot: -1e9, prop: -1e9, propFoot: -1e9, propOnHead: 0, words: 0 }, seen = { sign: 0, props: 0, colWords: 0, restFrames: 0 }, who = {};
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
		// the stage's own words a person can see (Retro's title line, NieR's readouts): not Pip's bubble or note, the boot
		// text that types and goes, or the command line (the foot); Pip's hand or head over one is FO-55
		if (st.hudEl) {
			const tw = document.createTreeWalker(st.hudEl, NodeFilter.SHOW_TEXT);
			for (let nd; (nd = tw.nextNode());) {
				const p = nd.parentElement;
				if (!nd.textContent.trim() || p.closest('.pst-term-boot, .pst-ntip, .pst-term-cmd')) continue;
				let shown = true;
				for (let a = p; a && a !== st.hudEl.parentElement; a = a.parentElement) { const s = getComputedStyle(a); if (s.visibility === 'hidden' || +s.opacity < .05) { shown = false; break; } }
				if (!shown) continue;
				const rg = document.createRange(); rg.selectNodeContents(nd);
				for (const q of rg.getClientRects()) {
					const wq = { l: Math.max(q.left, c.l), t: Math.max(q.top, c.t), r: Math.min(q.right, c.r), b: Math.min(q.bottom, c.b) };
					if (wq.r - wq.l < 1 || wq.b - wq.t < 1) continue;
					if (wq.r > pip.l && wq.l < pip.r) seen.colWords++;
					for (const part of [hand, head]) {
						const ix = Math.min(part.r, wq.r) - Math.max(part.l, wq.l), iy = Math.min(part.b, wq.b) - Math.max(part.t, wq.t);
						if (ix > 0 && iy > 0 && Math.min(ix, iy) > worst.words) { worst.words = Math.min(ix, iy); who.words = `${part === hand ? 'hand' : 'head'} over "${nd.textContent.trim().slice(0, 28)}"`; }
					}
				}
			}
		}
		worst.pip = Math.max(worst.pip, out(pip, c));
		worst.headFoot = Math.max(worst.headFoot, head.b - foot);
		const props = [...st.props.values()].filter((p) => p.state !== 'out' && p.op > .95);
		// Pip in its resting pose this frame (the hand's slow sway allowed): not mid idle wiggle or swing, a nod or a hop.
		// FO-50 is about a resting prop over the resting head; those moments of life are counted, not judged
		const pr0 = st.ps, poseRest = Math.abs(pr0.tilt - pr0.tiltT) < .02 && Math.abs(pr0.th) < .02 && Math.abs(pr0.dy) < 1;
		if (poseRest) seen.restFrames++;
		for (const p of props) {
			const q = R(p.el), name = `${p.spec.kind}:${p.spec.slot || (p.spec.stack != null ? 'stack' + p.spec.stack : '')}`;
			if (p.spec.kind === 'sign') { seen.sign++; worst.sign = Math.max(worst.sign, out(q, c)); worst.signFoot = Math.max(worst.signFoot, q.b - foot); }
			seen.props++;
			const o = out(q, c), fo = q.b - foot;
			if (o > worst.prop) { worst.prop = o; who.prop = name; }
			if (fo > worst.propFoot) { worst.propFoot = fo; who.propFoot = name; }
			const ix = Math.min(q.r, head.r) - Math.max(q.l, head.l), iy = Math.min(q.b, head.b) - Math.max(q.t, head.t);
			if (poseRest && Math.abs(p.a) < .02 && Math.abs(p.av) < .05 && ix > 0 && iy > 0 && Math.min(ix, iy) > worst.propOnHead) {
				worst.propOnHead = Math.min(ix, iy); who.propOnHead = name;
				// (what Pip was doing then: its swing, tilt and hop, and the box the props keep off, in stage units)
				const ps = st.ps, r2 = (v) => Math.round(v * 100) / 100;
				who.pipState = { th: r2(ps.th), tilt: r2(ps.tilt), tiltT: r2(ps.tiltT), dy: r2(ps.dy), mood: st.moodOverride || st.curMood, keep: st.pipKeep && st.pipKeep.map(Math.round), C: [Math.round(ps.C.x), Math.round(ps.C.y)], Ct: [Math.round(ps.Ct.x), Math.round(ps.Ct.y)], prop: p.box && p.box.map(Math.round) };
			}
		}
		last = { crop: [c.l, c.t, c.r, c.b].map(Math.round), pip: [pip.l, pip.t, pip.r, pip.b].map(Math.round), foot: Math.round(foot) };
	}
	const r1 = (v) => (v < -1e8 ? null : Math.round(v * 10) / 10);
	return { theme: st.theme, layout: st.layoutName, screen: O55.S.sess.screen, asleep: !!st.sleepZ, reduced: !!st.reduced, low: !!O55.motion.lowResource, n, signFrames: seen.sign, propFrames: seen.props, pip: r1(worst.pip), headFoot: r1(worst.headFoot), sign: r1(worst.sign), signFoot: r1(worst.signFoot), prop: r1(worst.prop), propFoot: r1(worst.propFoot), propOnHead: r1(worst.propOnHead), words: r1(worst.words), colWords: seen.colWords, restFrames: seen.restFrames, pipK: st.pipK == null ? 1 : Math.round(st.pipK * 1000) / 1000, who, last };
};

// the tube powered on (the paper fed in, the line opened) and its stepped draw caught up
const settle = async (t, f) => {
	await f.waitForFunction(() => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && st.content.getAnimations().length === 0; }, null, { timeout: 8000 }).catch(() => {});
	await f.waitForTimeout(450);
};

// Pip in its resting pose (no idle wiggle or swing, nod or hop playing), up to 4 s
const poseAtRest = (f) => f.waitForFunction(() => {
	const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), ps = st && st.ps;
	return !!ps && Math.abs(ps.tilt - ps.tiltT) < .02 && Math.abs(ps.tiltv) < .1 && Math.abs(ps.th) < .02 && Math.abs(ps.thv) < .05 && Math.abs(ps.dy) < 1;
}, null, { timeout: 4000, polling: 'raf' }).catch(() => {});

async function judge(t, f, tag, { sign = true, props = false } = {}) {
	await settle(t, f);
	await poseAtRest(f);
	let r = await f.evaluate(`(${SAMPLE.toString()})()`);
	// an idle wiggle or swing that began inside the sample left too few resting frames: once Pip rests again, sample again
	if (!r.err && r.restFrames < 8) { await poseAtRest(f); const r2 = await f.evaluate(`(${SAMPLE.toString()})()`); if (!r2.err && r2.restFrames > r.restFrames) r = r2; }
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
	if (props && r.propFrames > 0) {
		await t.check(`${at}: every resting prop inside the visible crop`, r.prop <= 1, `${r.who.prop} ${r.prop} px outside; ${why}`);
		await t.check(`${at}: every resting prop above the tube's foot (printer, command line)`, r.propFoot <= 0.5, `${r.who.propFoot} ${r.propFoot} px into it; ${why}`);
	}
	await t.check(`${at}: Pip seen at rest (head-overlap frames)`, r.restFrames >= 8, `${r.restFrames}/${r.n} frames in its resting pose`);
	await t.check(`${at}: no prop over Pip's head`, r.propOnHead <= 1, `${r.who.propOnHead || ''} ${r.propOnHead} px; ${why}${r.who.pipState ? '; pip ' + JSON.stringify(r.who.pipState) : ''}`);
	await t.check(`${at}: Pip clear of the stage's words (title line, readouts)`, r.words <= 1, `${r.who.words || ''} ${r.words} px; ${why}`);
	// FO-55: drawn smaller only where the span cannot hold it (.77, Retro Light at 740, the lead's call): never under 75%
	await t.check(`${at}: Pip drawn at no less than 75% of its size`, r.pipK >= .75, `scale ${r.pipK}`);
	await t.check(`${at}: Pip drawn smaller only under the stage's words`, r.pipK >= 1 || r.colWords > 0, `scale ${r.pipK}, no words over its column`);
	if (r.pipK < 1) t.log(`${at}: Pip drawn at ${r.pipK} of its size`);
	return r;
}

// every resting prop where it will stay, settled on its spring and still (its swing too: a cheer kicks the prop it is
// about, and a prop swinging through upright read as still), and Pip hanging still at its spot with no reaction playing
// (its hop, a mood held), all of it for 0.9 s on end: a cheer after the screen opens (c-ready, a finish screen) swung
// the laptop past Pip's head inside the sample
const propsAtRest = async (f) => {
	await f.evaluate(() => { window.__bcRest = 0; }).catch(() => {});
	await f.waitForFunction(() => {
		const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), ps = st && st.ps;
		const still = !!st && !!ps && [...st.props.values()].every((p) => p.state === 'out' || (p.settled && Math.abs(p.a) < .01 && Math.abs(p.av) < .03 && Math.abs(p.lenv) < 2 && Math.abs(p.axv) < 2))
			&& Math.abs(ps.C.y - ps.Ct.y) < 1 && Math.abs(ps.C.vy) < 2 && Math.abs(ps.thv) < .05 && Math.abs(ps.dyv) < 5 && !(st.moodUntil > st.t)
			&& Math.abs(ps.tilt - ps.tiltT) < .02 && Math.abs(ps.tiltv) < .1;
		if (!still) { window.__bcRest = 0; return false; }
		if (!window.__bcRest) window.__bcRest = performance.now();
		return performance.now() - window.__bcRest > 900;
	}, null, { timeout: 12000, polling: 'raf' }).catch(() => {});
};

// a person arriving: the real pointer travels over the stage, which wakes Pip (Welcome's sleep lasts until a real
// arrival). Screens past Welcome are judged with Pip awake, as a person reaches them; Welcome with Pip asleep.
async function arrive(t, f) {
	const asleep = () => f.evaluate(() => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!(st && st.sleepZ); });
	if (!(await asleep())) return true;
	const fe = await f.frameElement().catch(() => null), off = (fe && (await fe.boundingBox())) || { x: 0, y: 0 };
	const b = await f.evaluate(() => { const r = O55.S.root.querySelector('.o55-stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
	const x0 = off.x + b.x + b.w * .3, y0 = off.y + b.y + b.h * .5;
	await t.page.mouse.move(x0, y0);
	for (let i = 1; i <= 8; i++) await t.page.mouse.move(x0 + i * 8, y0 + (i % 2) * 4);
	return f.waitForFunction(() => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && !st.sleepZ; }, null, { timeout: 4000 }).then(() => true, () => false);
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

// every screen, opened fresh at the sizes where Retro's crop moves the props (860 portrait, narrow 740, short 1280x500):
// Pip whole, every resting prop inside the crop and above the foot, none over Pip's head (FO-50's c-ready server over the
// fitted compact Pip; the blocks, QR and house the printer covered at 740). --set screens=name,c-ready walks some.
const SCREENS = ['welcome', 'look', 'where', 'c-route', 'c-review', 'c-ready', 's-kind', 's-ready', 'begin', 'name', 'like', 'nas-find', 'online-service', 'online-details', 'safe', 'away', 'review', 'creating', 'protect', 'ai', 'ready'];
const CROPPED = [[860, 768], [740, 768], [1280, 500]];
async function everyScreen(t, mode) {
	const reduce = t.args.motion === 'reduce', list = t.args.screens ? String(t.args.screens).split(',') : SCREENS;
	for (const look of LOOKS) {
		for (const [w, h] of CROPPED) {
			await t.viewport(w, h);
			const f = await frameFor(t, mode);
			await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
			await stageLook(t, f, look);
			for (const scr of list) {
				await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), scr);
				// a screen opened straight may route on (protect without a backup place set): judged where it lands
				const ok = await f.waitForFunction(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), null, { timeout: 15000 }).then(() => true, () => false);
				if (!ok) { await t.check(`${mode} ${look} ${scr} ${w}x${h}: the screen opens on a stage`, false, 'no stage within 15 s'); continue; }
				await f.waitForTimeout(300);
				const now = await f.evaluate(() => window.O55.S.sess.screen);
				if (now !== 'welcome' && !(await arrive(t, f))) t.log(`${mode} ${look} ${scr} ${w}x${h}: Pip did not wake on the pointer's arrival`);
				await propsAtRest(f);
				await judge(t, f, `${mode} ${look} ${scr}${now !== scr ? ` (opened as ${now})` : ''} ${w}x${h}`, { sign: false, props: true });
			}
		}
	}
	await t.viewport(1920, 1080);
}

// FO-55 and FO-50 awake, every look: Pip whole and clear of the stage's own words (Retro's title line, NieR's readouts)
// at every window size, asleep on Welcome and awake on Name (the pointer arriving), opened fresh, and no resting prop
// over its head as it sways; where the span is too short for Pip at rest it is drawn smaller, once (.77 in Retro Light
// at 740, 1 elsewhere), never under 75%. --set looks=retro-light,nier-dark for some.
const ALL_LOOKS = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const EVERY_SIZE = [[1920, 1080], [1390, 900], [1024, 768], [860, 768], [740, 768], [1280, 500]];
async function clearOfWords(t, mode) {
	const reduce = t.args.motion === 'reduce', looks = t.args.looks ? String(t.args.looks).split(',') : ALL_LOOKS;
	for (const look of looks) {
		for (const [w, h] of EVERY_SIZE) {
			await t.viewport(w, h);
			const f = await frameFor(t, mode);
			await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
			await stageLook(t, f, look);
			for (const scr of ['welcome', 'name']) {
				await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), scr);
				const ok = await f.waitForFunction(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), null, { timeout: 15000 }).then(() => true, () => false);
				if (!ok) { await t.check(`${mode} ${look} ${scr} ${w}x${h}: the screen opens on a stage`, false, 'no stage within 15 s'); continue; }
				await f.waitForTimeout(300);
				if (scr !== 'welcome' && !(await arrive(t, f))) await t.check(`${mode} ${look} ${scr} ${w}x${h}: Pip wakes on the pointer's arrival`, false, 'still asleep after 4 s');
				await propsAtRest(f);
				await judge(t, f, `${mode} ${look} ${scr} ${w}x${h}`, { sign: false, props: true });
			}
		}
	}
	await t.viewport(1920, 1080);
}

// SW-23: a new layout shows what the stage already showed, finished, and plays no entrance again (Retro Light's paper
// fed in anew and Retro Dark's tube switched on anew on every resize past a layout's edge; Pip's line was typed and
// voiced again on the new bubble, Retro's command line typed again, NieR's label left blank). Every look, Name with a
// name typed, the window open 3 s, then resized 1024 -> 740 -> 1280x500 -> 860: after each layout change the tube is
// not powering on, Pip's line is whole on its box, not typing, not said again and its box not popping in, the command
// line and NieR's label read as before. Then a new line after the resize is typed and said as usual, and a look switch
// still plays the entrances (none under Reduced Motion).
const ENTRANCE = /^(pstOn|pstFeedIn|pstBubble|pstBox|pstDlg)$/;
const stageNow = (f) => f.evaluate((re) => {
	const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
	if (!st) return null;
	const rx = new RegExp(re), b = st.bubble, q = (sel) => { const n = st.hudEl && st.hudEl.querySelector(sel); return n ? n.textContent : null; };
	return {
		layout: st.layoutName, theme: st.theme, sayAt: st.sayAt || 0, line: (b.querySelector('.pst-bt-on') || {}).textContent || '', on: b.classList.contains('on'), typing: b.classList.contains('typing'),
		cmd: q('.pst-term-in'), dec: q('.pst-decode'), decoding: st.decoded != null && q('.pst-decode') !== st.decoded,
		power: st.content.getAnimations().filter((x) => rx.test(x.animationName || '') && x.playState === 'running').map((x) => x.animationName),
		pop: b.getAnimations().filter((x) => rx.test(x.animationName || '') && x.playState === 'running').map((x) => x.animationName)
	};
}, ENTRANCE.source);
async function noReplay(t, mode) {
	const reduce = t.args.motion === 'reduce', looks = t.args.looks ? String(t.args.looks).split(',') : ALL_LOOKS;
	for (const look of looks) {
		await t.viewport(1024, 768);
		const f = await frameFor(t, mode);
		await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
		await lookAndName(t, f, look);
		await f.waitForTimeout(3000);
		let was = await stageNow(f), prev = '1024x768';
		for (const [w, h] of [[740, 768], [1280, 500], [860, 768]]) {
			await t.viewport(w, h);
			await f.waitForFunction((l) => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && st.layoutName !== l; }, was.layout, { timeout: 2500 }).catch(() => {});
			await f.waitForTimeout(120);
			const now = await stageNow(f), tag = `${mode} ${look} Name ${prev} -> ${w}x${h} [${was.layout} -> ${now.layout}]`;
			prev = `${w}x${h}`;
			if (now.layout === was.layout) { t.log(`${tag}: the layout did not change, nothing to judge`); continue; }
			if (/^retro/.test(look)) await t.check(`${tag}: the tube is not powered on again`, now.power.length === 0, now.power.join(', '));
			await t.check(`${tag}: Pip's line whole on its box, not typed again`, now.on && !now.typing && now.line === was.line && !!was.line, JSON.stringify({ was: was.line, now: now.line, on: now.on, typing: now.typing }));
			await t.check(`${tag}: Pip's line not said again`, now.sayAt === was.sayAt, `said at ${was.sayAt} then ${now.sayAt}`);
			await t.check(`${tag}: Pip's box does not pop in again`, now.pop.length === 0, now.pop.join(', '));
			if (/^retro/.test(look)) await t.check(`${tag}: the command line reads as before`, now.cmd === was.cmd && !!was.cmd, JSON.stringify({ was: was.cmd, now: now.cmd }));
			if (/^nier/.test(look)) await t.check(`${tag}: NieR's label reads as before, decoded`, now.dec === was.dec && !!was.dec && !now.decoding, JSON.stringify({ was: was.dec, now: now.dec, decoding: now.decoding }));
			was = now;
		}
		// a new line after the resize is typed and said as usual
		const fld = f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]').first();
		await fld.click();
		await t.page.keyboard.press('End');
		await t.page.keyboard.type(' two', { delay: 12 });
		const said = await f.waitForFunction((x) => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && (st.sayAt || 0) !== x; }, was.sayAt, { timeout: 5000 }).then(() => true, () => false);
		const nl = await stageNow(f);
		await t.check(`${mode} ${look} Name 860x768: a new line after the resize is said`, said, JSON.stringify({ said, line: nl.line }));
		if (!reduce) await t.check(`${mode} ${look} Name 860x768: and typed`, said && nl.typing, `typing ${nl.typing}`);
		// a look switch still plays the look's entrances
		await f.waitForTimeout(1500);
		const before = await stageNow(f), other = look.replace(/-(light|dark)$/, (m, x) => (x === 'light' ? '-dark' : '-light'));
		await f.evaluate(([fam, m]) => window.O55.ui.applyLook(fam, m), other.split('-'));
		await f.waitForFunction((lk) => { const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage')); return !!st && st.theme === lk; }, other, { timeout: 15000 }).catch(() => {});
		await f.waitForTimeout(60);
		const sw = await stageNow(f), at = `${mode} ${look} -> ${other}`;
		if (/^retro/.test(look)) await t.check(`${at}: the look switch powers the tube on${reduce ? ' (not under Reduced Motion)' : ''}`, reduce ? sw.power.length === 0 : sw.power.length > 0, sw.power.join(', ') || 'none');
		if (/^nier/.test(look)) await t.check(`${at}: the look switch decodes NieR's label${reduce ? ' at once under Reduced Motion' : ''}`, reduce ? !sw.decoding : sw.decoding, JSON.stringify({ dec: sw.dec, decoding: sw.decoding }));
		await t.check(`${at}: the look switch says Pip's line in the new look`, sw.sayAt !== before.sayAt, `said at ${before.sayAt} then ${sw.sayAt}`);
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
	'retro stage fit sandbox': (t) => (t.args.film ? t.check('not run: the film is of the normal surface', true) : on('sandbox', fit)(t)),
	'retro props every screen normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', everyScreen)(t)),
	'retro props every screen sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', everyScreen)(t)),
	'pip clear of the stage words every look normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', clearOfWords)(t)),
	'pip clear of the stage words every look sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', clearOfWords)(t)),
	'layout change replays nothing normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', noReplay)(t)),
	'layout change replays nothing sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', noReplay)(t))
};
