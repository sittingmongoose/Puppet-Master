// Pip's stage frozen at one stage time, as pixels and as its DOM, per look, screen and state (diagnostic: asserts only
// that it could write them). Two builds' folders compared with tools/stage-frames-compare.mjs say whether a change to
// the stage's drawing (js/50-59) moved a pixel (pm7-perf lane W, 2026-11-15).
//   browser-check run diagnostics/stage-frames.check.mjs --set page=<build> --set out=<dir>
//   --set looks=  (default all ten; `dark` the five Dark looks)   --set screens= (default welcome,ready,look,ai,name,where,welcome)
//   --set variants= (default base,blink,tip,quiet)   --set frames= (frames drawn frozen before a capture, default 90)
//   --set motion=reduce (the system's Reduced Motion, emulated) or motion=app (the app's own, data-motion="reduced")
//   --set repaint=1 (the stage rastered afresh before each capture: its root on a layer of its own for 6 frames, then off)
//   --set nudge=1 (Pip's hand moved half a unit for 4 frames and back before each capture, as at rest)
//   --set live=1 (no freeze: the stage as it is at rest, swaying, pictures with animations running; for how a part is
//   drawn at rest, not for comparing pixels)
//   --set unfrozen=0 (no unfrozen capture per look; default one, see below)
// How a state is frozen (the hooks the motion clock and the stage already have):
//   - O55.motion.setTimeScale(0): the motion clock stops, so the stage's loop goes on drawing every frame with dt 0 (its
//     time, Pip's physics, the typers and the faces stand still); Retro's stepped draw is let through every frame
//     (stage.frameT), so every look draws the same number of frozen frames;
//   - every CSS animation is parked through the Web Animations API (an endless one paused at --set cssT, default 1500 ms,
//     a finite one finished), and the pictures are taken with Playwright's animations 'disabled' (endless ones in their
//     base state, finite ones finished);
//   - the stage's state is set to one pose on its own object (host.__pipStage): its time t = 40 s, Pip's hand 1.5 units
//     right of and 0.8 above its spot at rest, the pendulum at 0.06 rad, eyes at (0.8, 0.4), no blink pending (or, for
//     `blink`, half way through one), idle life off, every prop at its target with its swing at 0.03 rad, particles and
//     phosphor copies cleared (asleep: one z made at the first frozen frame), NieR's brackets locked, the bubble's
//     remembered side and claim forgotten (so it is placed afresh from the pose), a note eased to its place at once.
// Variants: base (Pip's line on show), blink (half shut), tip (a note: Pip's ? note, NieR's TIPS box, with the line on
// show), quiet (the bubble put away). On the first Welcome Pip is asleep (no pointer has moved); every later screen, and the second
// Welcome (welcome-awake), is woken first by a real pointer journey. Screens are walked in an order that adds and removes props (0, 6, 1, 4, 1,
// 1-2 then 0).
// Transition variants (TOOLS-STAGEREST-K1: frozen end states alone pass a cache that misses an input it never applies):
// textsize (a font-size and line-height stylesheet on the box, as the Text size setting restates it) and resized (the
// layout change) both capture in the banner layout at 740x900, where a stale NieR box changes the drawing, and restore
// 1920x1080 after; motion (the app's Reduced Motion toggled live and back before the freeze). Ask for them in
// --set variants=; the default walk is unchanged, so a default run still compares with an archived matrix. A live look
// switch is covered by perf-onb-rest's draw oracle (TOOLS-STAGEREST-K2), which judges it at one stage time within a run.
// Writes <out>/<look>/<nn>-<screen>-<variant>.png (the stage's box; .b.png the same state 20 frames later), .dom.txt (the stage's DOM: elements with their
// attributes sorted, text, ids renamed in order of appearance) and <out>/index.json, and first <out>/matrix.json: what the
// run was asked for (the requested looks x screens x variants, named as the files are, and the freeze settings), which
// tools/stage-frames-compare.mjs judges both runs against (PM7PERF-STAGEFRAMES-EMPTY-INDEX: an empty or partial index
// compared as a pass). A file's number is its place in the matrix, so a capture that fails leaves its own name missing
// instead of renumbering the later ones; the run's last row passes only when every capture of the matrix was written.
// Unfrozen (PM7PERF-STAGEFRAMES-PIXEL-MIX): the frozen pictures are taken with animations disabled and say nothing about a
// running animation, so after its walk each look gets one capture of its last screen with the clock running and its
// animations allowed (<nn>-<screen>-unfrozen, .b.png 20 frames later), for eyes: the compare requires it in both runs
// and does not judge it. Not in a live run, where every capture is unfrozen.
// Headless; one browser.
import fs from 'node:fs';
import path from 'node:path';
import { muteSound } from '../helpers/quiet-page.mjs';

const ALL = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

// The screens' names in a walk: the first Welcome is Pip asleep, a later one woken (welcome-awake)
export function screenNames(screens) {
	let welcomes = 0;
	return screens.map((s) => s + (s === 'welcome' ? (welcomes++ > 0 ? '-awake' : '-asleep') : ''));
}

// A capture's file name: its place in the look's walk (screen si, variant vi of nv), the screen's name and the variant
const captureFile = (si, vi, nv, name, variant) => `${String(si * nv + vi + 1).padStart(2, '0')}-${name}-${variant}`;

// What a run is asked to capture, in its file names: per look, every screen of the walk x every variant, numbered in
// that order, then (unfrozen) one capture of the last screen with nothing frozen (exported for
// tools/stage-frames-compare.selftest.mjs)
export function captureMatrix({ looks, screens, variants, unfrozen }) {
	const names = screenNames(screens), out = [];
	for (const look of looks) {
		names.forEach((name, si) => variants.forEach((variant, vi) => out.push({ look, file: captureFile(si, vi, variants.length, name, variant), screen: name, variant })));
		if (unfrozen && names.length) out.push({ look, file: captureFile(names.length, 0, variants.length, names[names.length - 1], 'unfrozen'), screen: names[names.length - 1], variant: 'unfrozen', unfrozen: true });
	}
	return out;
}

const STAGE = () => { const host = document.querySelector('#pm-o55-onboarding .o55-stage'); return host && host.__pipStage; };

const SETTLED = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.ps) return false;
	if (st.bubble && st.bubble.classList.contains('typing')) return false;
	for (const p of st.props.values()) if (p.state === 'out' || !p.settled) return false;
	return true;
};

// Freeze the motion clock and the CSS animations, and put the stage in one pose
const FREEZE = (o) => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (!st || !st.ps) return 'no stage';
	O55.motion.setTimeScale(0);
	const parked = window.__frzA = window.__frzA || [];
	const park = () => {
		for (const a of document.getAnimations()) {
			try {
				const tm = a.effect && a.effect.getComputedTiming();
				if (tm && tm.iterations === Infinity) { if (a.playState !== 'paused') { a.pause(); parked.push(a); } a.currentTime = o.cssT; }
				else if (a.playState !== 'finished') a.finish();
			} catch (e) { /* an animation that cannot be finished (no end) is left */ }
		}
	};
	park();
	const ps = st.ps, T0 = o.t;
	/* (and the loop's last time set to the stopped clock: left at the frame before, its first frozen frame stepped Pip
	   once by the time since, a few ms that differ run to run, and two runs of one build drew Pip 0.03 units apart) */
	st.t = T0; st.last = O55.motion.now() / 1000;
	/* H2: never let FREEZE()'s own st.kick() fire an unconsumed post-build remeasureAt -> measure() or late winRT
	   resize timer after a transition input (under st.still() / lowResource, that healed a stale nierBox) */
	st.remeasureAt = 0;
	if (st.winRT) { clearTimeout(st.winRT); st.winRT = 0; }
	ps.C.x = ps.Ct.x + 1.5; ps.C.y = ps.Ct.y - .8; ps.C.vx = 0; ps.C.vy = 0;
	ps.th = .06; ps.thv = 0; ps.dy = 0; ps.dyv = 0; ps.tilt = ps.tiltT; ps.tiltv = 0;
	ps.phi = st.work ? Math.sin(T0 * 4.2) * (st.rockMax == null ? .12 : st.rockMax) : ps.asleep ? .08 : 0;
	ps.sx = 1; ps.sy = 1; ps.sv = 0; ps.look = [.8, .4]; ps.lookT = [.8, .4]; ps.lift = 0; ps.liftT = 0;
	ps.nextBlink = 1e9; ps.blinkAt = o.blink ? T0 - .04 : null;
	st.idleNext = 1e9; st.idleLook = null; st.idleUntil = 0; st.busyT = -1e9; st.tipLook = 0;
	st.moodOverride = null; st.moodUntil = 0;
	if (st.faceOut) { st.faceOut.remove(); st.faceOut = null; }
	st.faceT0 = null; st.faceV = 1;
	if (st.faceEl) { st.faceEl.removeAttribute('visibility'); st.faceEl.querySelectorAll('.pst-part').forEach((w) => w.removeAttribute('transform')); }
	st.props.forEach((pr) => {
		const tg = st.propTarget(pr);
		pr.ax = tg.ax; pr.axv = 0; pr.len = tg.len; pr.lenv = 0; pr.a = .03; pr.av = 0; pr.op = tg.op;
		pr.scale = pr.spec.scale || 1; pr.sv = 0; pr.sq = 0; pr.sqv = 0; pr.held = false; pr.holdLen = null; pr.enterTgt = null;
		if (pr.landed) pr.landT = T0 - 5;
	});
	st.fx.forEach((p) => p.e.remove()); st.fx.length = 0;
	st.ghosts.forEach((g) => g.e.remove()); st.ghosts.length = 0; st.ghostT = T0;
	st.lastZ = st.sleepZ ? T0 - 1 : T0;
	st.tgtT = T0 - 5; st.lockT = null; st.sliceT = null; st.coT = T0 - 1;
	st.bubbleRel = null; st.bubbleRelT = 0; st.bubbleSide = null; st.bubbleClaim = null; st.bubbleKeepOff = null;
	/* (and stream F's later memory of it, FO-189/191/214/215: whether it talked on this screen, held its usual place, or
	   was placed for where Pip is going; on pages without them these are new, unread fields) */
	st.bubbleTalked = false; st.bubbleScreen = null; st.bubbleOver = false; st.bubbleFor = false; st.bubbleBoxT = null;
	st.tipXY = null; st.swT = T0;
	// every frozen frame drawn, Retro's stepped draw too, for o.frames frames; then the capture
	return new Promise((resolve) => {
		let n = 0;
		const tick = () => {
			st.frameT = -1e9; st.dirty = true; if (typeof st.kick === 'function') st.kick();
			if (n === 2) park();
			/* (repaint: the stage root on a layer of its own for a few frames, then off it, so its whole picture is rastered
			   afresh before the capture; telling a picture left from earlier frames from one drawn differently) */
			/* (nudge: Pip's hand half a unit right for a few frames and back, as its sway moves it in every frame at rest, so what
			   hangs on Pip (its strings, NieR's leader and label, Basic's protractor) is drawn afresh in either build before the
			   capture: frozen, the branch draws them once and main in every frame, and Chrome's choice of LCD or greyscale text
			   at that one raster showed as a difference in NieR Dark's label) */
			if (o.nudge && n === o.frames - 10) { st.__nudgeX = st.ps.C.x; st.ps.C.x += .5; }
			if (o.nudge && n === o.frames - 6) { st.ps.C.x = st.__nudgeX; delete st.__nudgeX; }
			if (o.repaint && n === o.frames - 12) st.root.style.willChange = 'transform';
			if (o.repaint && n === o.frames - 6) st.root.style.willChange = '';
			if (++n < o.frames) requestAnimationFrame(tick); else requestAnimationFrame(() => requestAnimationFrame(() => resolve('')));
		};
		requestAnimationFrame(tick);
	});
};

/* (a note is put away before the clock runs again: left open for the frames between, it eased after Pip as it moved
   and kept that place, hidden, in the later captures' DOM: 25 of 280 captures of two runs of main differed by it) */
const THAW = (closeTip) => {
	if (closeTip) { const host = document.querySelector('#pm-o55-onboarding .o55-stage'); host.__pipStage.tip(null); }
	O55.motion.setTimeScale(1);
	for (const a of window.__frzA || []) { try { a.play(); } catch (e) { /* gone */ } }
	window.__frzA = [];
	/* R132-FOLLOWUPS 2: the freeze parked the blink and idle-life scheduling at 1e9; left there, the "unfrozen"
	   capture after the walk showed a stage that never blinks and has no idle life, not the stage as a person sees
	   it. Reschedule both as the product itself does (58-rig.js:1249's blink and :1106's idle life). */
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	if (st && st.ps) {
		st.ps.nextBlink = st.t + 2.2 + Math.random() * 3.4;
		st.idleNext = st.t + 7 + Math.random() * 6;
		st.idleUntil = 0; st.idleLook = null;
	}
};

// The stage's DOM: elements with sorted attributes, text, ids renamed in order of first appearance
// (exported for tools/stage-frames-compare.selftest.mjs, which runs it on a stub stage)
export const DOM = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
	const ids = new Map(), rn = (id) => { if (!ids.has(id)) ids.set(id, 'id' + ids.size); return ids.get(id); };
	/* (fragment references only: url(#id) in any attribute, and "#id" in href / xlink:href. A literal colour such as
	   fill="#211F1B" is not an id: renamed as one, a colour change between two builds vanished from the DOM comparison,
	   PM7PERF-STAGEFRAMES-HEX-AS-ID) */
	const HREF = new Set(['href', 'xlink:href']);
	const fix = (name, v) => { const u = v.replace(/url\(\s*(['"]?)#([^)'"]+)\1\s*\)/g, (m, q, id) => `url(#${rn(id)})`); return HREF.has(name) ? u.replace(/^#(\S+)$/, (m, id) => '#' + rn(id)) : u; };
	const out = [];
	const walk = (n, d) => {
		const pad = ' '.repeat(d);
		if (n.nodeType === 3) { if (n.data.length) out.push(pad + JSON.stringify(n.data)); return; }
		if (n.nodeType !== 1) return;
		const as = [...n.attributes].map((a) => [a.name, a.name === 'id' ? rn(a.value) : fix(a.name, a.value)]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
		out.push(pad + '<' + n.tagName.toLowerCase() + as.map(([k, v]) => ` ${k}=${JSON.stringify(v)}`).join('') + '>');
		for (let c = n.firstChild; c; c = c.nextSibling) walk(c, d + 1);
	};
	walk(st.root, 0);
	return out.join('\n');
};

const INFO = () => {
	const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage, r = host.getBoundingClientRect();
	return { box: { x: r.left, y: r.top, w: r.width, h: r.height }, fam: st.famName, props: [...st.props.values()].map((p) => p.spec.kind + (p.pos ? '' : '(unplaced)')), target: st.target || null, asleep: !!st.sleepZ, bubble: st.bubble.classList.contains('on'), tip: !!st.tipData, t: st.t, reduced: !!st.reduced, lowResource: !!(window.O55 && O55.motion && O55.motion.lowResource), kept: st.nierBox ? st.nierBox.map((v) => Math.round(v * 4) / 4) : null };
};

export default async function (t) {
	const out = String(t.args.out || '');
	if (!out) { await t.check('an --set out=<dir> is given', false, 'no out'); return; }
	const lookArg = String(t.args.looks || 'all');
	const looks = lookArg === 'all' ? ALL : lookArg === 'dark' ? ALL.filter((l) => l.endsWith('-dark')) : lookArg.split(',').filter(Boolean);
	const screens = String(t.args.screens || 'welcome,ready,look,ai,name,where,welcome').split(',').filter(Boolean);
	const variants = String(t.args.variants || 'base,blink,tip,quiet').split(',').filter(Boolean);
	const frames = Number(t.args.frames || 90), cssT = Number(t.args.cssT || 1500);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const motion = String(t.args.motion || '');
	if (motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
	fs.mkdirSync(out, { recursive: true });
	const live = t.args.live === '1' || t.args.live === 1, repaint = t.args.repaint === '1' || t.args.repaint === 1, nudge = t.args.nudge === '1' || t.args.nudge === 1;
	const unfrozen = !live && String(t.args.unfrozen ?? '1') !== '0';
	const plan = captureMatrix({ looks, screens, variants, unfrozen }), names = screenNames(screens);
	fs.writeFileSync(path.join(out, 'matrix.json'), JSON.stringify({ version: 1, looks, screens, variants, frames, cssT, motion, repaint, nudge, live, unfrozen, expected: plan }, null, 1));
	const index = [];
	for (const look of looks) {
		// a fresh load per look: the first Welcome then shows Pip asleep, as a person first sees it
		const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screens[0] + '&pm-warm=0' });
		const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
		if (!open) { await t.check(`${look}: the onboarding window is open`, false, 'no window after 60 s'); continue; }
		await f.evaluate(() => document.fonts.ready.then(() => true));
		if (motion === 'app') await f.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduced'));
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || '', nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		if (!ok) { await t.check(`${look}: the look is applied`, false, 'not applied'); continue; }
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 5000));
		fs.mkdirSync(path.join(out, look), { recursive: true });
		let n = 0, lastOpen = false, lastLine = '';
		for (const [si, screen] of screens.entries()) {
			const name = names[si], awake = name === 'welcome-awake';
			const at = await f.evaluate((id) => { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { return String(e); } return window.O55.S.sess.screen; }, screen);
			if (at !== screen) { await t.check(`${look} ${screen}: the screen opened`, false, String(at)); continue; }
			lastOpen = si === screens.length - 1;
			/* (Welcome puts Pip to sleep until a real arrival, and it sleeps on through later screens until one: past the first
			   Welcome every screen is woken by the same pointer journey, so Pip is awake there as a person sees it) */
			if (awake || screen !== 'welcome') {
				// a real arrival wakes Pip: a pointer journey over the window (60-ui-core.js / 59-cheer.js wake)
				await t.page.waitForTimeout(1200);
				for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
				await t.page.mouse.move(W - 6, Math.round(H / 2)); // then off the window, hovering nothing
			}
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).catch(() => t.log(`${look} ${screen}: NOTE not settled after 16 s; captured as it was`));
			// the screen's line as said, kept for the unfrozen capture: the quiet variant below puts it away (R135-F8)
			lastLine = await f.evaluate(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; return st ? (st.saying || '') : ''; });
			for (const [vi, v] of variants.entries()) {
				if (v === 'quiet') await f.evaluate(() => { const host = document.querySelector('#pm-o55-onboarding .o55-stage'); host.__pipStage.say('', null, true); });
				if (v === 'tip') await f.evaluate(() => { const host = document.querySelector('#pm-o55-onboarding .o55-stage'); host.__pipStage.tip({ id: 'stage-frames-tip', title: 'A note on this', text: 'What this choice means, written out in a few words.' }, true); });
				// transition variants (TOOLS-STAGEREST-K1): an input the caches must survive, applied before the freeze.
				// textsize and resized capture in the banner layout (740x900), where a stale NieR box changes the drawing.
				if (v === 'textsize' || v === 'resized') {
					await t.viewport(740, 900);
					await t.page.waitForTimeout(1200);
					await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).catch(() => {});
					/* H2: consume any pending post-build remeasureAt (58-rig.js build() sets now()+0.9) BEFORE #sf-textsize
					   is injected; under st.still() (Reduced Motion or lowResource), loop() parks before 0.9 s and FREEZE()'s
					   kick() would otherwise run measure() after the stylesheet and heal a stale nierBox */
					await f.waitForFunction(() => {
						const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
						if (!st || !st.remeasureAt) return true;
						if (typeof st.kick === 'function') st.kick();
						return false;
					}, null, { timeout: 5000, polling: 100 }).catch(() => {});
					const lr = await f.evaluate(() => ({ lowResource: !!(window.O55 && O55.motion && O55.motion.lowResource), remeasureAt: document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage?.remeasureAt || 0 }));
					if (lr.lowResource || lr.remeasureAt) t.log(`${look} ${name} ${v}: pre-input lowResource=${lr.lowResource} remeasureAt=${lr.remeasureAt}`);
				}
				// the stylesheet after the resize is settled: a later map change would re-measure the box and heal the
				// font staleness this variant exists to catch (the resize itself is the resized variant's input)
				if (v === 'textsize') { await f.evaluate(() => { const s = document.createElement('style'); s.id = 'sf-textsize'; s.textContent = '#pm-o55-onboarding .pst-bubble{font-size:17px !important;line-height:1.7 !important}'; document.head.appendChild(s); }); await t.page.waitForTimeout(400); }
				if (v === 'motion') {
					const readMotion = () => {
						const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
						const app = !!(window.O55 && O55.motion && O55.motion.reduced && O55.motion.reduced());
						const media = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
						const attr = document.documentElement.getAttribute('data-motion') === 'reduced';
						return { app, media, attr, stage: !!(st && st.reduced), dom: st && st.root ? st.root.dataset.reduced : null, still: !!(st && st.still && st.still()), raf: st ? st.raf || 0 : null };
					};
					const on = await f.evaluate(() => document.documentElement.getAttribute('data-motion') === 'reduced');
					await f.evaluate((on) => { const r = document.documentElement; if (on) r.removeAttribute('data-motion'); else r.setAttribute('data-motion', 'reduced'); }, on);
					await t.page.waitForTimeout(600);
					const mid = await f.evaluate(readMotion);
					const wantMid = mid.media || !on;
					await t.check(`${look} ${name} ${v}: stage reduced state matches app and browser after toggle`, mid.app === wantMid && mid.stage === mid.app && mid.dom === (mid.app ? '1' : '0') && (!mid.app || (mid.still && mid.raf === 0)), JSON.stringify(mid));
					await f.evaluate((on) => { const r = document.documentElement; if (on) r.setAttribute('data-motion', 'reduced'); else r.removeAttribute('data-motion'); }, on);
					await t.page.waitForTimeout(600);
					const back = await f.evaluate(readMotion);
					const wantBack = back.media || on;
					await t.check(`${look} ${name} ${v}: stage reduced state matches app and browser after restore`, back.app === wantBack && back.stage === back.app && back.dom === (back.app ? '1' : '0') && (!back.app || (back.still && back.raf === 0)), JSON.stringify(back));
				}
				const undo = async () => {
					if (v === 'textsize') await f.evaluate(() => { const s = document.getElementById('sf-textsize'); if (s) s.remove(); });
					if (v === 'textsize' || v === 'resized') { await t.viewport(W, H); await t.page.waitForTimeout(1200); await f.waitForFunction(SETTLED, null, { timeout: 10000, polling: 250 }).catch(() => {}); }
				};
				/* (live=1: no freeze at all, the stage as it is at rest, swaying; for how a part is drawn at rest, not for a
				   pixel comparison: two pictures of a swaying stage differ) */
				const err = live ? '' : await f.evaluate(FREEZE, { t: 40, blink: v === 'blink', frames, cssT, repaint, nudge });
				if (err) { await t.check(`${look} ${name} ${v}: frozen`, false, err); await f.evaluate(THAW); await undo(); continue; }
				const info = await f.evaluate(INFO), dom = await f.evaluate(DOM);
				const file = captureFile(si, vi, variants.length, name, v); n++;
				const b = info.box;
				/* (pictures with Playwright's animations 'disabled': every endless CSS animation drawn in its own base state and every
				   finite one finished, the same in any build. Parked at one time through the Web Animations API instead, the blinking
				   LED and cursor and the drifting motes still came out in different phases run to run: two runs of main's page with
				   the same DOM had the same pixels in 72 of 280 captures) */
				const clip = { x: Math.max(0, Math.floor(b.x)), y: Math.max(0, Math.floor(b.y)), width: Math.ceil(b.w), height: Math.ceil(b.h) };
				const png = await t.page.screenshot({ clip, animations: live ? 'allow' : 'disabled' });
				fs.writeFileSync(path.join(out, look, file + '.png'), png);
				/* (and a second picture of the same frozen state 20 frames later: the compositor's own variation, a level here
				   and there with the same DOM, as tools/stage-frames-compare.mjs reads it) */
				await f.evaluate(() => new Promise((r) => { let n = 0; const k = () => (++n < 20 ? requestAnimationFrame(k) : r()); requestAnimationFrame(k); }));
				fs.writeFileSync(path.join(out, look, file + '.b.png'), await t.page.screenshot({ clip, animations: live ? 'allow' : 'disabled' }));
				fs.writeFileSync(path.join(out, look, file + '.dom.txt'), dom);
				index.push({ look, file, screen: name, variant: v, ...info });
				if (!live) await f.evaluate(THAW, v === 'tip'); else if (v === 'tip') await f.evaluate(() => { document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.tip(null); });
				await undo();
			}
			// the screen's own line back for the next screen (the quiet variant put it away)
		}
		/* one unfrozen capture of the last screen: the clock running and the animations allowed, as a person sees it */
		const last = plan.find((e) => e.look === look && e.unfrozen);
		if (last && lastOpen) {
			// R135-F8: restore the line the quiet variant put away, whole and at once (sayKept is the product's own
			// keep-the-line across a change), so the unfrozen capture shows the live speech bubble, not a muted stage
			if (lastLine) await f.evaluate((line) => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; if (st) { st.saying = line; if (typeof st.sayKept === 'function') st.sayKept(line); else st.say(line, null, true); } }, lastLine);
			await t.page.waitForTimeout(1500);
			const info = await f.evaluate(INFO), dom = await f.evaluate(DOM), b = info.box;
			const clip = { x: Math.max(0, Math.floor(b.x)), y: Math.max(0, Math.floor(b.y)), width: Math.ceil(b.w), height: Math.ceil(b.h) };
			fs.writeFileSync(path.join(out, look, last.file + '.png'), await t.page.screenshot({ clip, animations: 'allow' }));
			await f.evaluate(() => new Promise((r) => { let n = 0; const k = () => (++n < 20 ? requestAnimationFrame(k) : r()); requestAnimationFrame(k); }));
			fs.writeFileSync(path.join(out, look, last.file + '.b.png'), await t.page.screenshot({ clip, animations: 'allow' }));
			fs.writeFileSync(path.join(out, look, last.file + '.dom.txt'), dom);
			index.push({ look, file: last.file, screen: last.screen, variant: 'unfrozen', unfrozen: true, ...info });
			n++;
		}
		const red = await f.evaluate(() => { const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage; return { app: O55.motion.reduced(), media: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches), attr: document.documentElement.getAttribute('data-motion') === 'reduced', stage: !!(st && st.reduced), dom: st && st.root ? st.root.dataset.reduced : null }; });
		t.log(`${look}: ${n} captures; Reduced Motion: app ${red.app}, stage ${red.stage}, dom ${red.dom}`);
		if (motion) await t.check(`${look}: the stage ran under Reduced Motion (${motion})`, red.app && red.stage && red.dom === '1', JSON.stringify(red));
	}
	fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
	const written = new Set(index.map((e) => `${e.look}/${e.file}`)), lost = plan.filter((e) => !written.has(`${e.look}/${e.file}`));
	await t.check('stage frames written: every capture of the matrix', index.length > 0 && !lost.length, `${index.length} of ${plan.length} captures in ${out}${lost.length ? `; not written: ${lost.slice(0, 8).map((e) => `${e.look}/${e.file}`).join(', ')}${lost.length > 8 ? ` and ${lost.length - 8} more` : ''}` : ''}`);
}
