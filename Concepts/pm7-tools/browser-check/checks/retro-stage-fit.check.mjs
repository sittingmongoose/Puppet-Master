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
// 'c-ready props clear of the bubble' (N1): c-ready's props off Pip's bubble and head in both Retro looks, 740 fresh and 1920 -> 740,
// and fresh at 860, 1024, 1280x800, 1920 and 1280x500. The awake guard judges movement per drawn part, on what is painted
// (FO-50, T42): the head and the hand must each change visibly on their own; 'frozen drawing negative', 'frozen rendering
// negative' and the 'frozen part' negatives (head only, hand only, a counter-transform inside or above the groups, SMIL,
// a 0.03-unit jitter) must be rejected by it.
// Both surfaces (--set sandbox picks one); --set motion=reduce runs it under Reduced Motion.
//   browser-check run Concepts/pm7-tools/browser-check/checks/retro-stage-fit.check.mjs --set page=<build>
const LOOKS = ['retro-light', 'retro-dark'];
const DOWN = [[1920, 1080], [1390, 900], [1280, 800], [1024, 768], [860, 768], [740, 768], [1280, 500]];
const SEQ = DOWN.concat(DOWN.slice(0, -1).reverse());
const FRESH = [[1920, 1080], [860, 768], [740, 768], [1280, 500]];
const NAME = 'First cancellation';

// the page, or T3's sandbox at t.openInSandbox's default flags (an opaque origin, no storage, no modals), as the kit opens it
const frameFor = async (t, mode) => {
	// T60: --set selftest=late-ready holds the window's first open (95-boot's ?o55=screen= open) back past the ready bound
	if (t.args.selftest === 'late-ready' && !t.__lateReady) { t.__lateReady = true; await t.page.addInitScript(LATE_READY, LATE_READY_HOLD_MS); }
	return t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
};
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
		const props = [...st.props.values()].filter((p) => p.state === 'out' ? +p.el.getAttribute('opacity') > .05 : p.op > .95 && +p.el.getAttribute('opacity') > .95);
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
	// FO-55, the lead's ruling: Pip is drawn smaller only where the stage's words sit over its column, and never under 80%
	// of its size (.82 in Retro Light at 740; 1 elsewhere)
	await t.check(`${at}: Pip drawn at no less than 80% of its size`, r.pipK >= .8, `scale ${r.pipK}`);
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

// the onboarding window's own ready state: open (O55.S.open, its root data-open), its session made (O55.S.sess) and its
// stage drawn. A freshly loaded page can reach the first look change before the window has opened; applyLook then read
// S.sess.drafts while S.sess was still null and threw (T43, opus-recheck-retro6). Waited on before any look is applied.
const OWNER_READY = () => {
	const O = window.O55, S = O && O.S;
	return !!(S && S.open && S.sess && S.sess.status === 'active' && S.root && S.root.getAttribute('data-open') === 'true' && O.ui && typeof O.ui.applyLook === 'function' && O.pipStage && O.pipStage.of(S.root.querySelector('.o55-stage')));
};
// T60 (TOOLBATCH4; REVIEW-kit-tb3-opus finding 4): the wait is bounded by the product's own ready time, not a flat 15 s,
// which let a window that opened up to about 16 s late pass with only a log line. The product opens the window from its
// boot, 140 ms after DOMContentLoaded (95-boot.js, start), and its opening settles within 2800 ms (60-ui-core.js, open:
// O55.motion.settled's fallback). Those are pinned here with a stated margin of 2000 ms for a loaded host: on a freshly
// loaded page the window must be ready by DOMContentLoaded + 140 + 2800 + 2000 ms; once the page has been ready before
// (a window reopened), within 2800 + 2000 ms of the wait starting. Later than that fails by name, with how long it waited.
const READY_BOOT_MS = 140, READY_OPEN_MS = 2800, READY_MARGIN_MS = 2000;
const LATE_READY_HOLD_MS = READY_BOOT_MS + READY_OPEN_MS + READY_MARGIN_MS + 1500;
// --set selftest=late-ready: the first ui.open of the page waits LATE_READY_HOLD_MS (past the bound, well inside 15 s)
const LATE_READY = (ms) => document.addEventListener('DOMContentLoaded', () => {
	const ui = window.O55 && window.O55.ui; if (!ui || typeof ui.open !== 'function' || ui.__lateReady) return;
	const orig = ui.open; let first = true; ui.__lateReady = true;
	ui.open = function (...a) { if (first) { first = false; setTimeout(() => orig.apply(this, a), ms); return undefined; } return orig.apply(this, a); };
});
const ownerReady = async (t, f, look) => {
	const at = await f.evaluate((ready) => { const nav = performance.getEntriesByType('navigation')[0], ok = (0, eval)(`(${ready})`)();
		const r = { now: performance.now(), dcl: nav ? nav.domContentLoadedEventStart : null, seen: !!window.__rsfReadySeen, ok };
		if (ok) window.__rsfReadySeen = true; return r; }, OWNER_READY.toString()).catch(() => null);
	if (at && at.ok) return { ok: true };
	const fresh = !!at && !at.seen && at.dcl > 0;
	const bound = !at ? READY_OPEN_MS + READY_MARGIN_MS : fresh ? at.dcl + READY_BOOT_MS + READY_OPEN_MS + READY_MARGIN_MS - at.now : READY_OPEN_MS + READY_MARGIN_MS;
	const t0 = Date.now(), ok = await f.waitForFunction(OWNER_READY, null, { timeout: Math.max(1, Math.round(bound)) }).then(() => true, () => false);
	const waited = Date.now() - t0;
	if (ok) await f.evaluate(() => { window.__rsfReadySeen = true; }).catch(() => {});
	const since = fresh ? ` (${Math.round(at.now - at.dcl + waited)} ms after DOMContentLoaded; the bound: ${READY_BOOT_MS} + ${READY_OPEN_MS} + ${READY_MARGIN_MS} ms)` : ` (the bound: ${READY_OPEN_MS} + ${READY_MARGIN_MS} ms from the wait's start)`;
	t.log(`the onboarding window was not ready when ${look} was to be applied: waited ${waited} ms, ${ok ? 'ready' : 'not ready within the product\'s ready time'}${since}`);
	return { ok, waited, since };
};

// the look, as the window's look menu picks it (the page's own theme switch does not reach an open setup window)
async function stageLook(t, f, look) {
	const ready = await ownerReady(t, f, look);
	if (!ready.ok) return t.check(`the onboarding window is open with its session and stage within the product's ready time before ${look} is applied`, false, `waited ${ready.waited} ms${ready.since}; ` + await f.evaluate(() => JSON.stringify({ open: !!(window.O55 && O55.S && O55.S.open), sess: !!(window.O55 && O55.S && O55.S.sess) })).catch((e) => e.message), { hard: true });
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
			// (a precondition, not a skip: Welcome before anyone arrives has Pip asleep, or this case would pass vacuously)
			await t.check(`${mode} ${look} Welcome ${w}x${h}: Pip is asleep before anyone arrives`, asleep, 'awake on Welcome');
			if (asleep) await judge(t, f, `${mode} ${look} Welcome asleep ${w}x${h}`, { sign: false });
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
// every setup screen the page defines (O55.screens.defs, read from the page: 45 today), at all seven window sizes
// (sol-review-retro-1: 21 screens at three sizes left cells unmeasured). --set sizes=740x768,1280x500 and --set looks=
// split it across browsers
const sizesArg = (t) => (t.args.sizes ? String(t.args.sizes).split(',').map((x) => x.split('x').map(Number)) : null);
async function everyScreen(t, mode) {
	const reduce = t.args.motion === 'reduce', looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	for (const look of looks) {
		for (const [w, h] of sizesArg(t) || EVERY_SIZE) {
			await t.viewport(w, h);
			const f = await frameFor(t, mode);
			await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
			await stageLook(t, f, look);
			const list = t.args.screens ? String(t.args.screens).split(',') : await f.evaluate(() => Object.keys(window.O55.screens.defs));
			if (w === (sizesArg(t) || EVERY_SIZE)[0][0] && h === (sizesArg(t) || EVERY_SIZE)[0][1]) t.log(`${mode} ${look}: ${list.length} screens: ${list.join(' ')}`);
			for (const scr of list) {
				await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), scr);
				// a screen opened straight may route on (protect without a backup place set): judged where it lands
				const ok = await f.waitForFunction(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), null, { timeout: 15000 }).then(() => true, () => false);
				if (!ok) { await t.check(`${mode} ${look} ${scr} ${w}x${h}: the screen opens on a stage`, false, 'no stage within 15 s'); continue; }
				await f.waitForTimeout(300);
				const now = await f.evaluate(() => window.O55.S.sess.screen);
				// (preconditions, not skips: Welcome has Pip asleep until someone arrives; any other screen, once the pointer has
				// arrived, has it awake)
				const tag = `${mode} ${look} ${scr}${now !== scr ? ` (opened as ${now})` : ''} ${w}x${h}`;
				if (now === 'welcome') await t.check(`${tag}: Pip is asleep before anyone arrives`, await f.evaluate(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')).sleepZ), 'awake on Welcome');
				else await t.check(`${tag}: Pip wakes on the pointer's arrival`, await arrive(t, f), 'still asleep after 4 s');
				await propsAtRest(f);
				await judge(t, f, tag, { sign: false, props: true });
			}
		}
	}
	await t.viewport(1920, 1080);
}

// FO-55 and FO-50 awake, every look: Pip whole and clear of the stage's own words (Retro's title line, NieR's readouts)
// at every window size, asleep on Welcome and awake on Name (the pointer arriving), opened fresh, and no resting prop
// over its head as it sways; where the stage's words cut its span it is drawn smaller, once (.82 in Retro Light at 740,
// 1 elsewhere), never under 80% (the lead's ruling). --set looks=retro-light,nier-dark for some.
const ALL_LOOKS = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const EVERY_SIZE = [[1920, 1080], [1390, 900], [1280, 800], [1024, 768], [860, 768], [740, 768], [1280, 500]];
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
				// (preconditions, not skips: asleep on Welcome before anyone arrives, awake on Name once the pointer has)
				if (scr === 'welcome') await t.check(`${mode} ${look} ${scr} ${w}x${h}: Pip is asleep before anyone arrives`, await f.evaluate(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')).sleepZ), 'awake on Welcome');
				else await t.check(`${mode} ${look} ${scr} ${w}x${h}: Pip wakes on the pointer's arrival`, await arrive(t, f), 'still asleep after 4 s');
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
		layout: st.layoutName, theme: st.theme, sayAt: st.sayAt || 0, saying: st.saying || '', lineId: (st.spec && st.spec.lineId) || '', preview: !!(st.spec && st.spec.mute), line: (b.querySelector('.pst-bt-on') || {}).textContent || '', on: b.classList.contains('on'), typing: b.classList.contains('typing'),
		cmd: q('.pst-term-in'), dec: q('.pst-decode'), decoding: st.decoded != null && q('.pst-decode') !== st.decoded,
		power: st.content.getAnimations().filter((x) => rx.test(x.animationName || '') && x.playState === 'running').map((x) => x.animationName),
		pop: b.getAnimations().filter((x) => rx.test(x.animationName || '') && x.playState === 'running').map((x) => x.animationName)
	};
}, ENTRANCE.source);
// the pointer rested on the stage, inside the page's frame so the page sees it, at a spot that is stage in every layout
// (page 100,150: the left pane at 1024, the banner at 740 and 1280x500). Left over the form, a layout put a suggestion chip
// under the still pointer and Pip previewed it ('Ooh, good one.'), and the next layout took it away: the line changed by
// the browser's own hover, not by the layout (the no-resize control: parked, the line never changes). Moved off the
// page from inside the sandbox's frame, the page never saw it leave.
async function restOnStage(t, f) {
	const fe = await f.frameElement().catch(() => null), off = (fe && (await fe.boundingBox())) || { x: 0, y: 0 };
	await t.page.mouse.move(off.x + 100, off.y + 150, { steps: 4 });
}
async function noReplay(t, mode) {
	const reduce = t.args.motion === 'reduce', looks = t.args.looks ? String(t.args.looks).split(',') : ALL_LOOKS;
	for (const look of looks) {
		await t.viewport(1024, 768);
		const f = await frameFor(t, mode);
		await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
		await lookAndName(t, f, look);
		await restOnStage(t, f); /* (no layout moves a choice under the pointer: restOnStage) */
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
			// (the lead's rule: a layout change does not change what Pip says: the line's text and which line it is)
			await t.check(`${tag}: Pip says the same line (text and id)`, now.saying === was.saying && now.lineId === was.lineId, JSON.stringify({ was: [was.saying, was.lineId], now: [now.saying, now.lineId] }));
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

// FO-50 awake (sol-review-retro-1): the resting-box assertion above judges the resting head; this judges the moments
// of life it leaves out. Every frame for 14 s on a screen with props beside Pip (Name, c-ready, online-details), from the
// screen's entrance on: Pip woken by the pointer's arrival (its wake hop), a name typed and a suggestion picked on Name
// (its nods, its line, a cheer), c-ready's finishing cheer, and whatever idle wiggle, swing or glance comes. Overlap is
// the painted shapes', not their boxes: where the head's and a prop's boxes meet, every 2 px point is tested against the
// visible fills and strokes of both (isPointInFill / isPointInStroke in the GPU browser's own geometry), so a
// transparent box corner is not overlap. Normal motion must stay on all the while (no Reduced Motion, no adaptive
// low-resource mode, sway and idle life on), and each cell must show Pip moving. A failure crops the stage.
// Shared by the product sampler and controlled fixtures: sampled fill/stroke intersection area in CSS px².
const INK_OVERLAP = (head, prop) => {
	const shown = (e, top) => { for (let a = e; a && a !== top.parentElement; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05) return false; } return true; };
	const shapes = (g) => [...g.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,line')].filter((e) => shown(e, g)).map((e) => {
		const c = getComputedStyle(e), m = e.getScreenCTM();
		return { e, m: m && m.inverse(), fill: c.fill !== 'none' && +c.fillOpacity > .05, stroke: c.stroke !== 'none' && parseFloat(c.strokeWidth) > 0 && +c.strokeOpacity > .05 };
	}).filter((k) => k.m && (k.fill || k.stroke));
	const ink = (list, x, y) => list.some((k) => { const p = new DOMPoint(x, y).matrixTransform(k.m); return (k.fill && k.e.isPointInFill(p)) || (k.stroke && k.e.isPointInStroke(p)); });
	const hb = head.getBoundingClientRect(), q = prop.getBoundingClientRect();
	const x0 = Math.max(hb.left, q.left), x1 = Math.min(hb.right, q.right), y0 = Math.max(hb.top, q.top), y1 = Math.min(hb.bottom, q.bottom);
	if (x1 <= x0 || y1 <= y0) return 0;
	const hs = shapes(head), ps = shapes(prop);
	let hit = 0;
	for (let y = y0 + 1; y < y1; y += 2) for (let x = x0 + 1; x < x1; x += 2) {
		if (ink(hs, x, y) && ink(ps, x, y)) hit++;
	}
	return hit * 4;
};

// Independent fixture groups; never alter the product rig or force a product collision. Run on each surface.
const PROBE_FIXTURE = (probeSource) => {
	const probe = (0, eval)(`(${probeSource})`), ns = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(ns, 'svg');
	svg.setAttribute('width', '160'); svg.setAttribute('height', '100');
	svg.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647';
	const group = (tag, attrs, transform = '') => {
		const g = document.createElementNS(ns, 'g'), e = document.createElementNS(ns, tag);
		if (transform) g.setAttribute('transform', transform);
		for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
		g.append(e); svg.append(g); return g;
	};
	const fillA = group('rect', { x: 0, y: 0, width: 20, height: 20, fill: '#000', stroke: 'none' }, 'translate(10 10)');
	const fillB = group('rect', { x: 0, y: 0, width: 20, height: 20, fill: '#000', stroke: 'none' }, 'translate(20 20)');
	// The rectangles' fill is absent; only their coincident 6 px strokes can intersect.
	const strokeA = group('rect', { x: 0, y: 0, width: 20, height: 20, fill: 'none', stroke: '#000', 'stroke-width': 6 }, 'translate(60 10)');
	const strokeB = group('rect', { x: 0, y: 0, width: 20, height: 20, fill: 'none', stroke: '#000', 'stroke-width': 6 }, 'translate(60 10)');
	document.body.append(svg);
	try { return { fill: probe(fillA, fillB), stroke: probe(strokeA, strokeB), disjoint: probe(fillA, strokeA) }; }
	finally { svg.remove(); }
};
async function probeFixture(t, f, mode) {
	const r = await f.evaluate(PROBE_FIXTURE, INK_OVERLAP.toString());
	await t.check(`${mode}: ink probe detects controlled fill overlap`, r.fill === 100, JSON.stringify(r), { hard: true });
	await t.check(`${mode}: ink probe detects controlled stroke-only overlap`, r.stroke > 4, JSON.stringify(r), { hard: true });
	await t.check(`${mode}: ink probe accepts disjoint fixture boxes`, r.disjoint === 0, JSON.stringify(r), { hard: true });
}

// A disjoint pair is valid only after both groups supplied usable painted geometry.
const GEOMETRY = (e, label) => {
	if (!e || !e.isConnected) throw new Error(`${label}: missing or detached`);
	for (let a = e; a; a = a.parentElement) {
		const c = getComputedStyle(a);
		if (c.display === 'none' || c.visibility !== 'visible' || +c.opacity === 0) throw new Error(`${label}: hidden`);
	}
	const b = e.getBoundingClientRect();
	if (![b.left, b.top, b.right, b.bottom, b.width, b.height].every(Number.isFinite) || b.width <= 0 || b.height <= 0) throw new Error(`${label}: empty or invalid bounds`);
	const m = e.getScreenCTM(), box = e.getBBox();
	if (!m || ![m.a, m.b, m.c, m.d, m.e, m.f].every(Number.isFinite) || !Number.isFinite(m.a * m.d - m.b * m.c) || m.a * m.d - m.b * m.c === 0 || ![box.x, box.y, box.width, box.height].every(Number.isFinite) || box.width <= 0 || box.height <= 0) throw new Error(`${label}: invalid SVG geometry`);
	// (the matrix the browser draws the group with, read once here for the pose below)
	return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, m };
};
const MOTION = async (ms, probeSource, geometrySource, selftest, force) => {
	const overlap = (0, eval)(`(${probeSource})`), geometry = (0, eval)(`(${geometrySource})`);
	const st = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
	if (!st) return { err: 'no stage' };
	const PH = O55.pipStage.h;
	const R = (e, label) => geometry(e, label);
	const out = { n: 0, validPairs: 0, validFrames: 0, leavingPairs: 0, initialHiddenFrames: 0, geometryError: '', off: 0, offWhy: '', moving: 0, movingMs: 0, boxFrames: 0, worstBox: 0, worst: 0, at: null, kinds: { tilt: 0, swing: 0, hop: 0, cheer: 0, propKick: 0 } };
	const was = { tilt: false, swing: false, hop: false, cheer: false, kick: false };
	let rnd = null, restoreN = 0, prevV = null;
	const t0 = performance.now();
	// Pip's movement as it is painted, judged per drawn part (FO-50 guard; T42, tool batch 3). retro-c6 read the head's and
	// the hand's group matrices and counted a frame when either changed by .01 stage units: a head held still while the
	// hand moved passed (13.4 s of 'movement'), so did a hand held still, a counter-transform inside both groups that
	// kept their matrices moving while everything they contain was drawn still (13.7 s), and a 0.03-unit jitter
	// (opus-recheck-retro6). Now, for the head and for the hand separately, every frame reads the painted leaf shapes
	// INK_OVERLAP reads (shown, with a visible fill or stroke) and maps each leaf's own box corners through its rendered
	// matrix (getScreenCTM: every transform, attribute, CSS or SMIL, on it and on every group above it) into the stage
	// SVG, in CSS px, so the pane or the window moving is not Pip moving. A part has moved this frame when leaves holding
	// at least half of its painted area have each moved at least PAINT_STEP px since the part's last counted pose (slow
	// travel accumulates; a blink or a glance of the eyes alone is not the head moving). Each part must change for at
	// least 200 ms on its own; movingMs is the lesser of the two. (T65: each part must now make PART_STEPS visible steps
	// on its own; moving is the lesser count, and the parts are judged from Pip's first painted frame.)
	// T65 (TOOLBATCH4, REVIEW-kit-tb3-opus findings 1-3): a leaf is compared by what it paints, orientation-free. Its
	// signature is its axis-aligned box in the stage, in device px: a shape mirrored, or turned 180 degrees, about its own
	// centre repaints the same pixels and keeps the same box, where its corners compared one by one had 'moved' (a frozen
	// Pip whose leaves were mirrored on alternate frames passed both parts). Geometry that paints nothing is left out:
	// leaves inside defs, clipPath, mask, pattern, marker or symbol (Friendly's head counted a clip path as 42% of its
	// area); a fill or a stroke whose colour is transparent (fill: transparent computes to rgba(0, 0, 0, 0), not none);
	// and a path's empty sub-paths (a lone moveto, which getBBox counts): such a path's box is read from points along what
	// it draws instead. The step is in device px (one device pixel), not CSS px: .25 CSS px is under a device pixel at
	// DPR 1 to 3, and a frozen Pip nudged .3 CSS px back and forth passed, at DPR 2 too. The parts' net travel, from the
	// first sampled frame, is reported in device px (headTravelPx, handTravelPx) and asserted per awake cell.
	const STEP_DPX = 1, DPR = window.devicePixelRatio || 1;
	const NOPAINT = 'defs, clipPath, mask, pattern, marker, symbol';
	const alphaOf = (col) => { if (!col || col === 'none' || col === 'transparent') return 0; if (/^url\(/.test(col)) return 1; const m = /rgba?\(([^)]*)\)/.exec(col); if (!m) return 1; const v = m[1].split(/[\s,\/]+/).filter(Boolean); if (v.length < 4) return 1; return v[3].endsWith('%') ? parseFloat(v[3]) / 100 : parseFloat(v[3]); };
	const paints = (c) => (alphaOf(c.fill) * +c.fillOpacity > .05) || (alphaOf(c.stroke) * +c.strokeOpacity > .05 && parseFloat(c.strokeWidth) > 0);
	// a sub-path with nothing drawn: a moveto with one coordinate pair, followed by another moveto or the end
	const emptySub = (d) => { const tk = String(d || '').match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
		for (let i = 0; i < tk.length; i++) { if (tk[i] !== 'M' && tk[i] !== 'm') continue; let j = i + 1; while (j < tk.length && !/[A-Za-z]/.test(tk[j])) j++; if (j - i - 1 === 2 && (j >= tk.length || tk[j] === 'M' || tk[j] === 'm')) return true; }
		return false; };
	const leafShown = (e, top) => { for (let a = e; a && a !== top.parentElement; a = a.parentElement) { const c = getComputedStyle(a); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .05) return false; } return true; };
	const painted = (s, g, label) => {
		const root = s.svg.getScreenCTM();
		if (!root) throw new Error('stage SVG: no screen matrix');
		const inv = root.inverse(), k = Math.hypot(root.a, root.b) * DPR, leaves = new Map();
		for (const e of g.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,line')) {
			if (e.closest(NOPAINT) || !leafShown(e, g)) continue;
			const c = getComputedStyle(e);
			if (!paints(c)) continue;
			const m = e.getScreenCTM(); if (!m) continue;
			const r = inv.multiply(m), at = (x, y) => [(r.a * x + r.c * y + r.e) * k, (r.b * x + r.d * y + r.f) * k];
			let pts = null;
			if (e.tagName === 'path') {
				const cd0 = c.d && c.d !== 'none' ? c.d : e.getAttribute('d'), cd = (/^path\(\s*["']([\s\S]*)["']\s*\)$/.exec(cd0 || '') || [null, cd0])[1];
				if (emptySub(cd)) {
					let len = 0; try { len = e.getTotalLength(); } catch (_) { /* not rendered */ }
					if (!(len > 0)) continue;
					const n = Math.max(32, Math.min(400, Math.ceil(len * Math.hypot(r.a, r.b) * k)));
					pts = []; for (let i = 0; i <= n; i++) { const q = e.getPointAtLength(Math.min(len, Math.max(0, i / n * len))); pts.push(at(q.x, q.y)); }
				}
			}
			if (!pts) {
				let b = null; try { b = e.getBBox(); } catch (_) { /* not rendered */ }
				if (!b || !(b.width > 0 || b.height > 0)) continue;
				pts = [at(b.x, b.y), at(b.x + b.width, b.y), at(b.x, b.y + b.height), at(b.x + b.width, b.y + b.height)];
			}
			if (!pts.every((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]))) continue;
			const box = [Math.min(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[1]))];
			leaves.set(e, { box, area: Math.max(box[2] - box[0], 1) * Math.max(box[3] - box[1], 1) });
		}
		if (!leaves.size) throw new Error(`${label}: no painted shape`);
		return leaves;
	};
	const centre = (leaves) => { let a = 0, x = 0, y = 0; for (const { box, area } of leaves.values()) { x += (box[0] + box[2]) / 2 * area; y += (box[1] + box[3]) / 2 * area; a += area; } return a > 0 ? [x / a, y / a] : [0, 0]; };
	// true (moved), false (held), or null (no leaf in common with the last counted pose: the drawing was rebuilt)
	const partMoved = (now, ref) => {
		let all = 0, moved = 0;
		for (const [e, q] of now) {
			const p = ref.get(e); if (!p) continue;
			all += q.area;
			if (Math.max(...q.box.map((v, i) => Math.abs(v - p.box[i]))) >= STEP_DPX) moved += q.area;
		}
		return all > 0 ? moved >= all / 2 : null;
	};
	const parts = { head: { ref: null, last: t0, ms: 0, n: 0, first: null, travel: 0, rebuilt: 0 }, hand: { ref: null, last: t0, ms: 0, n: 0, first: null, travel: 0, rebuilt: 0 } };
	const judgePart = (P, now, tNow) => {
		const c = centre(now);
		if (!P.first) P.first = c; else P.travel = Math.max(P.travel, Math.hypot(c[0] - P.first[0], c[1] - P.first[1]));
		if (!P.ref) { P.ref = now; P.last = tNow; return; }
		const m = partMoved(now, P.ref);
		if (m === null) { P.rebuilt++; P.ref = now; return; }
		if (m) { P.n++; P.ms += Math.min(50, tNow - P.last); P.last = tNow; P.ref = now; }
	};
	const tally = () => {
		const r1 = (v) => Math.round(v * 100) / 100;
		Object.assign(out, { travelUnit: 'device px', dpr: DPR, headMs: parts.head.ms, handMs: parts.hand.ms, headMoves: parts.head.n, handMoves: parts.hand.n, headTravelPx: r1(parts.head.travel), handTravelPx: r1(parts.hand.travel), headRebuilt: parts.head.rebuilt, handRebuilt: parts.hand.rebuilt, movingMs: Math.min(parts.head.ms, parts.hand.ms), moving: Math.min(parts.head.n, parts.hand.n) });
	};
	while (performance.now() - t0 < ms) {
		await new Promise((r) => requestAnimationFrame(() => r()));
		out.n++;
		// Retro holds each distinct drawn pose for 50 ms; unchanged rAF samples contribute no motion.
		const tNow = performance.now();
		const s2 = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
		if (!s2 || !s2.ps) { out.geometryError = 'stage or physics disappeared'; break; }
		const ps = s2.ps;
		/* swing at a screen change (force: { at, r }): at ms the stage's own idle timer is made due, with its random draw
		   fixed for three frames so it picks a swing (r .75: to the right, .5: to the left); the product sizes the kick */
		if (force && !out.forced && performance.now() - t0 >= force.at) {
			out.forced = { at: Math.round(performance.now() - t0), fired: false, swung: false, wiggled: false };
			rnd = Math.random; Math.random = () => force.r; s2.idleNext = s2.t - 1e-3; s2.busyT = s2.t - 3.6; restoreN = out.n + 3;
		}
		if (out.forced && prevV && out.n <= restoreN + 1) {
			if (Math.abs(ps.thv - prevV.th) > .06) out.forced.swung = true;
			if (Math.abs(ps.tiltv - prevV.tilt) > 1.5) out.forced.wiggled = true;
		}
		prevV = { th: ps.thv, tilt: ps.tiltv };
		if (rnd && out.n >= restoreN) { Math.random = rnd; rnd = null; out.forced.fired = s2.idleNext > s2.t; }
		const nominal = !s2.reduced && !O55.motion.lowResource && PH.part('sway-and-physics') && PH.part('idle-life');
		if (!nominal) { out.off++; out.offWhy = s2.reduced ? 'reduced' : O55.motion.lowResource ? 'low-resource' : 'a Pip part off'; }
		const props = [...s2.props.values()].filter((p) => p.state === 'out' ? +p.el.getAttribute('opacity') > .05 : p.op > .95 && +p.el.getAttribute('opacity') > .95);
		const now = { tilt: Math.abs(ps.tiltv) > 1.5, swing: Math.abs(ps.thv) > .25, hop: ps.dyv < -80, cheer: s2.moodOverride === 'happy' && s2.moodUntil > s2.t, kick: props.some((p) => Math.abs(p.av) > .12) };
		for (const k of Object.keys(now)) { if (now[k] && !was[k]) out.kinds[k === 'kick' ? 'propKick' : k]++; was[k] = now[k]; }

		// T65: the parts are judged from Pip's first painted frame, not from the props' arrival: under load the props
		// finished fading in after Pip's wake hop and cheer, and the cell then held only the idle sway (2 hand steps in a
		// run on Nas1). Before the first paint a missing paint is waited out; after any valid pair it is a geometry error.
		{
			let hP = null, cP = null;
			try { hP = painted(s2, s2.gHead, 'head'); cP = painted(s2, s2.gCtl, 'hand'); }
			catch (e) { if (out.validPairs) { out.geometryError = `${e.message} at frame ${out.n}`; break; } }
			if (hP && cP) { judgePart(parts.head, hP, tNow); judgePart(parts.hand, cP, tNow); }
		}
		// No comparison is eligible during the props' entrance fade. Coverage below must still become positive.
		if (!props.length) continue;
		// A fresh screen can expose its leaving props before its head's entrance is painted.
		// Exclude only that initial unpainted interval; after positive sampling, disappearance is an error.
		if (!out.validPairs && s2.gHead && s2.gHead.isConnected) {
			let visible = true;
			for (let e=s2.gHead; e; e=e.parentElement) {
				const c=getComputedStyle(e);
				if (c.display==='none' || c.visibility!=='visible' || +c.opacity===0) { visible=false; break; }
			}
			if (!visible) { out.initialHiddenFrames++; continue; }
		}
		try {
			// Test-only controls fire after valid sampling has begun, exercising loss during a cell.
			if (selftest && out.validPairs > 0 && performance.now() - t0 > 1000) {
				if (selftest === 'head-hidden') s2.gHead.style.display = 'none';
				if (selftest === 'head-zero') s2.gHead.getBoundingClientRect = () => new DOMRect();
				if (selftest === 'head-detached') s2.gHead.remove();
			}
			const hb = R(s2.gHead, 'head');
			R(s2.gCtl, 'hand');
			if (props.length) out.validFrames++;
			for (const p of props) {
				const q = R(p.el, `prop ${p.spec.kind}:${p.spec.slot || ''}`), x0 = Math.max(hb.left, q.left), x1 = Math.min(hb.right, q.right), y0 = Math.max(hb.top, q.top), y1 = Math.min(hb.bottom, q.bottom);
				// Invoke the shared reader even for disjoint boxes; coverage is independent of intersection.
				const area = overlap(s2.gHead, p.el);
				if (!Number.isFinite(area) || area < 0) throw new Error('ink reader: invalid area');
				out.validPairs++; if (p.state === 'out') out.leavingPairs++;
				if (x1 <= x0 || y1 <= y0) continue;
				out.boxFrames++; out.worstBox = Math.max(out.worstBox, Math.min(x1 - x0, y1 - y0));
				if (area > out.worst) {
					out.worst = area;
					out.at = { prop: `${p.spec.kind}:${p.spec.slot || ''}`, t: Math.round(performance.now() - t0), tilt: Math.round(ps.tilt * 100) / 100, th: Math.round(ps.th * 100) / 100, dy: Math.round(ps.dy), state: p.state, opacity: +p.el.getAttribute('opacity'), propA: Math.round(p.a * 100) / 100,
						restBox:p.restBox||null,paintBox:p.box||null,keepHead:s2.pipKeep||null,
						restHead:s2.pipHead?s2.pipHead(0,null,true):null,
						headRect:[hb.x,hb.y,hb.width,hb.height],propRect:[q.x,q.y,q.width,q.height] };
				}
			}
		} catch (e) { out.geometryError = `${e.message} at frame ${out.n}`; break; }
	}
	tally();
	return out;
};
const MOTION_SCREENS = ['name', 'c-ready', 'online-details'];
const TRAVEL_FLOOR_DPX = 1;
// T65: a part is awake when it made at least PART_STEPS visible steps in the cell, each of at least one device pixel
// (STEP_DPX) from its last counted pose. The T42 bar was 200 ms at 50 ms a step, four steps of .25 CSS px; at one
// device pixel a step is four times coarser, and the real hand's idle sway makes a visible step about every 2.5 s
// (2 to 4 in an idle 10 s on every look, retro-stage-fit probe3 on Nas1). The real page's two full runs on Nas1 (90
// cells each, normal and sandbox) gave the hand 2 steps at the fewest (2 cells, at load 12.8 on 5 cores) and 3 in the
// sandbox run, the head 8 and 14. Every freeze the check runs, the review's and T42's, makes 0; a page built with a
// freeze can make 1, a single jump when its freeze takes hold after Pip's first paint (the review's mirror page, the
// frozen hand: 8.5 device px at 1014 ms). So the bar is two visible steps a part, beside each part's net travel of
// TRAVEL_FLOOR_DPX.
const PART_STEPS = 2;
const MOTION_SIZES = [[860, 768], [740, 768], [1280, 500]];
async function awakeMotion(t, mode) {
	if (t.args.motion === 'reduce') return t.check('not run: this case is about normal motion', true);
	const looks = t.args.looks ? String(t.args.looks).split(',') : ALL_LOOKS, total = { tilt: 0, swing: 0, hop: 0, cheer: 0, propKick: 0, boxFrames: 0 };
	const fixtureFrame = await frameFor(t, mode);
	await probeFixture(t, fixtureFrame, mode);
	for (const look of looks) {
		for (const [w, h] of sizesArg(t) || MOTION_SIZES) {
			await t.viewport(w, h);
			const f = await frameFor(t, mode);
			await t.emulate({ reducedMotion: 'no-preference' });
			await stageLook(t, f, look);
			for (const scr of t.args.screens ? String(t.args.screens).split(',') : MOTION_SCREENS) {
				await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), scr);
				const ok = await f.waitForFunction(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), null, { timeout: 15000 }).then(() => true, () => false);
				const tag = `${mode} ${look} ${scr} ${w}x${h} awake`;
				if (!ok) { await t.check(`${tag}: the screen opens on a stage`, false, 'no stage within 15 s'); continue; }
				t.mark(tag);
				// watched from the screen's entrance on, through the wake, the person's input and the idle that follows
				const watch = f.evaluate(`(${MOTION.toString()})(14000, ${JSON.stringify(INK_OVERLAP.toString())}, ${JSON.stringify(GEOMETRY.toString())}, ${JSON.stringify(t.args.selftest || "")})`);
				await f.waitForTimeout(250);
				await t.check(`${tag}: Pip wakes on the pointer's arrival`, await arrive(t, f), 'still asleep after 4 s');
				if (scr === 'name') {
					const fld = f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-bind="name"]').first();
					await fld.click().catch(() => {});
					await t.page.keyboard.press('Control+A');
					await t.page.keyboard.type('Garden notes', { delay: 40 });
					await f.waitForTimeout(1800);
					const chip = f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) button', { hasText: 'Book club website' }).first();
					if (await chip.count()) await chip.click().catch(() => {});
				}
				const r = await watch;
				if (r.err) { await t.check(`${tag}: the stage`, false, r.err); continue; }
				for (const k of Object.keys(r.kinds)) total[k] += r.kinds[k];
				total.boxFrames += r.boxFrames;
				const why = JSON.stringify({ frames: r.n, validPairs: r.validPairs, validFrames: r.validFrames, geometryError: r.geometryError, headMs: Math.round(r.headMs), handMs: Math.round(r.handMs), headMoves: r.headMoves, handMoves: r.handMoves, headTravelPx: r.headTravelPx, handTravelPx: r.handTravelPx, kinds: r.kinds, boxFrames: r.boxFrames, worstBox: Math.round(r.worstBox), at: r.at });
				await t.check(`${tag}: head and eligible props have valid visible geometry`, !r.geometryError, why, { hard: true });
				await t.check(`${tag}: positive valid measurement coverage`, r.validPairs > 0 && r.validFrames > 0, why, { hard: true });
				await t.check(`${tag}: normal motion stayed on`, r.off === 0, `${r.off}/${r.n} frames without it (${r.offWhy})`);
				/* (in time, not frames: one nod keeps Pip off its rest pose for 333 ms on the stage's tilt spring, a wiggle 467 ms,
				   at any frame rate; 20 frames were 435 ms at the VM's 46 fps, more than a nod, and 171 ms at Windows' 117 fps.
				   NieR's c-ready has one idle wiggle or nod in 14 s, by design (no swing, no hop): 13-16 frames on the VM, 45-56 on
				   Windows, retro-c4. 200 ms is stricter than 20 frames were on every Windows run, and below one nod.
				   T65: in device px the bar is PART_STEPS visible steps a part, see PART_STEPS) */
				// T42: each drawn part on its own, on what is painted (a head held still while the hand moves fails here)
				await t.check(`${tag}: Pip's drawn head changed visibly (painted, >= 1 device px) at least ${PART_STEPS === 1 ? 'once' : PART_STEPS + ' times'}`, r.headMoves >= PART_STEPS, why);
				await t.check(`${tag}: Pip's drawn hand changed visibly (painted, >= 1 device px) at least ${PART_STEPS === 1 ? 'once' : PART_STEPS + ' times'}`, r.handMoves >= PART_STEPS, why);
				// T65: the parts' net travel over the cell, a backstop beside the per-frame steps (the real page's smallest at
				// 860x768 were 5.65 px for the head and 1.98 px for the hand, REVIEW-kit-tb3-opus)
				await t.check(`${tag}: Pip's drawn head and hand each travelled at least ${TRAVEL_FLOOR_DPX} device px`, r.headTravelPx >= TRAVEL_FLOOR_DPX && r.handTravelPx >= TRAVEL_FLOOR_DPX, why);
				const okInk = r.worst <= 4;
				await t.check(`${tag}: no painted overlap of Pip's head and a prop`, okInk, `${r.worst} px² painted; ${why}`);
				if (!okInk) await t.crop(`awake-${mode}-${look}-${scr}-${w}x${h}`, '#pm-o55-onboarding .o55-stage', `${tag}: painted overlap ${r.worst} px²`);
				else t.log(`${tag}: ${why}`);
			}
		}
	}
	// the moments it was meant to cover did happen, over the case
	t.log(`awake motion totals: ${JSON.stringify(total)}`);
	await t.check(`${mode}: nods or wiggles seen`, total.tilt > 0, JSON.stringify(total));
	await t.check(`${mode}: hops (wake, cheer) seen`, total.hop > 0, JSON.stringify(total));
	await t.check(`${mode}: cheers seen`, total.cheer > 0, JSON.stringify(total));
	await t.check(`${mode}: props kicked swinging seen`, total.propKick > 0, JSON.stringify(total));
	await t.check(`${mode}: Pip swings seen`, total.swing > 0, JSON.stringify(total));
	await t.viewport(1920, 1080);
}

// FO-50 (retro-c4): an idle swing as the screen changes. Its room was measured where each prop was drawn at the kick,
// so props still being lowered in after a screen change were not counted, and a prop swung away counted too much room;
// the prop then hung, or swung back, beside a head still swinging (Glass Light, Online details, 860: 48 px² in
// retro-c3's full sandbox run). Pinned here: c-ready, then Online details opened fresh, and at each phase (ms after the
// change) the stage's own idle timer made due with its random draw fixed so it picks a swing to either side; the product
// sizes the kick, or wiggles when there is no room. 6 s sampled per case, as the awake guard samples (geometry
// preconditions, fill/stroke ink, at most 4 px²). The case fails on the build before the fix (be4766513f..24178cad2b:
// 648, 128 and 248 px² at 60, 120 and 900 ms to the right). --set looks=, --set sizes=, --set phases= pick some.
const SWING_LOOKS = ['glass-light', 'glass-dark', 'friendly-light', 'retro-dark'];
const SWING_PHASES = [60, 120, 900, 2500];
async function swingAtChange(t, mode) {
	if (t.args.motion === 'reduce') return t.check('not run: this case is about normal motion', true);
	const looks = t.args.looks ? String(t.args.looks).split(',') : SWING_LOOKS, phases = t.args.phases ? String(t.args.phases).split(',').map(Number) : SWING_PHASES;
	const n = { cases: 0, swung: 0, wiggled: 0 };
	await probeFixture(t, await frameFor(t, mode), mode);
	for (const look of looks) for (const [w, h] of sizesArg(t) || [[860, 768]]) {
		await t.viewport(w, h);
		const f = await frameFor(t, mode);
		await t.emulate({ reducedMotion: 'no-preference' });
		await stageLook(t, f, look);
		for (const at of phases) for (const [r, side] of [[.75, 'right'], [.5, 'left']]) {
			const tag = `${mode} ${look} ${w}x${h} swing ${side} ${at} ms after c-ready > online-details`;
			await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'c-ready' }));
			await f.waitForTimeout(250);
			await t.check(`${tag}: Pip is awake (the pointer arrived)`, await arrive(t, f), 'still asleep after 4 s');
			await f.waitForTimeout(2500);
			await t.mark(tag); /* (on a film, where to step through) */
			await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'online-details' }));
			const r0 = await f.evaluate(`(${MOTION.toString()})(6000, ${JSON.stringify(INK_OVERLAP.toString())}, ${JSON.stringify(GEOMETRY.toString())}, "", ${JSON.stringify({ at, r })})`);
			if (r0.err) { await t.check(`${tag}: the stage`, false, r0.err); continue; }
			const fo = r0.forced || {};
			n.cases++; if (fo.swung) n.swung++; if (fo.wiggled) n.wiggled++;
			const why = JSON.stringify({ forced: fo, geometryError: r0.geometryError, initialHiddenFrames: r0.initialHiddenFrames, frames: r0.n, validPairs: r0.validPairs, boxFrames: r0.boxFrames, at: r0.at });
			await t.check(`${tag}: the idle action came`, !!fo.fired && (fo.swung || fo.wiggled), why);
			await t.check(`${tag}: head and eligible props have valid visible geometry`, !r0.geometryError, why, { hard: true });
			await t.check(`${tag}: positive valid measurement coverage`, r0.validPairs > 0 && r0.validFrames > 0, why, { hard: true });
			await t.check(`${tag}: normal motion stayed on`, r0.off === 0, `${r0.off}/${r0.n} frames without it (${r0.offWhy})`);
			const okInk = r0.worst <= 4;
			await t.check(`${tag}: no painted overlap of Pip's head and a prop`, okInk, `${r0.worst} px² painted; ${why}`);
			if (!okInk) await t.crop(`swing-${mode}-${look}-${w}x${h}-${side}-${at}`, '#pm-o55-onboarding .o55-stage', `${tag}: painted overlap ${r0.worst} px²`);
			else t.log(`${tag}: ${why}`);
		}
	}
	// (not vacuous: the pinned idle swings did swing where there was room)
	t.log(`swing at a screen change totals: ${JSON.stringify(n)}`);
	await t.check(`${mode}: pinned idle swings swung`, n.swung > 0, JSON.stringify(n));
	await t.viewport(1920, 1080);
}

// Settled Name -> Safe catches the still-painted sign throughout its exit.
async function leavingHead(t, mode) {
	await t.viewport(860,768);
	const f = await frameFor(t,mode);
	await t.emulate({reducedMotion:'no-preference'});
	await probeFixture(t,f,mode);
	for(let rep=0; rep<Number(t.args.reps || 3); rep++) {
		await lookAndName(t,f,'retro-dark'); await f.waitForTimeout(3000);
		await t.mark(`${mode} leaving sign rep ${rep}`);
		const watch=f.evaluate(`(${MOTION.toString()})(2500,${JSON.stringify(INK_OVERLAP.toString())},${JSON.stringify(GEOMETRY.toString())},"")`);
		await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot .o55-primary').last().click();
		const r=await watch, why=JSON.stringify(r);
		await t.check(`${mode} ${rep}: reached Safe`,await f.evaluate(()=>O55.S.sess.screen==='safe'),why);
		await t.check(`${mode} ${rep}: geometry valid`,!r.err&&!r.geometryError,why,{hard:true});
		await t.check(`${mode} ${rep}: visible leaving pairs measured`,r.leavingPairs>0,why,{hard:true});
		await t.check(`${mode} ${rep}: normal motion`,r.off===0,why);
		await t.check(`${mode} ${rep}: leaving sign clears drawn head`,r.worst<=4,why);
		t.log(why);
	}
}
// Deliberately freeze only Pip's drawing while physics, props and background keep running.
async function frozenDrawing(t,mode) {
	await t.viewport(860,768); const f=await frameFor(t,mode);
	await t.emulate({reducedMotion:'no-preference'}); await stageLook(t,f,'nier-light');
	await f.evaluate(()=>O55.ui.open({fresh:true,screen:'c-ready'})); await arrive(t,f); await f.waitForTimeout(3500);
	const r=await f.evaluate(async ({m,i,g})=>{
		const s=O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
		const nodes=[s.gHead,s.gCtl].flatMap(e=>[e,...e.querySelectorAll('*')]);
		const saved=nodes.map(e=>[e,e.setAttribute]);
		for(const [e] of saved) e.setAttribute=()=>{};
		try { return await (0,eval)(`(${m})`)(14000,i,g,'',{at:60,r:.1}); }
		finally { for(const [e,fn] of saved) e.setAttribute=fn; }
	},{m:MOTION.toString(),i:INK_OVERLAP.toString(),g:GEOMETRY.toString()});
	await t.check(`${mode}: frozen drawing retains valid visible geometry`,!r.err&&!r.geometryError&&r.validPairs>0,JSON.stringify(r));
	await t.check(`${mode}: frozen drawing retains nominal physics`,r.off===0&&r.forced?.fired,JSON.stringify(r));
	await t.check(`${mode}: frozen drawing rejected by the drawn-pose assertion (${PART_STEPS} visible steps a part)`,t.args.selftest === 'frozen-drawing' ? r.moving>=PART_STEPS : r.headMoves<PART_STEPS&&r.handMoves<PART_STEPS,JSON.stringify(r));
	t.log(JSON.stringify(r));
}
// sol-review-retro-5's independent negative, test-side (its frozen-rigid.html built the same freeze into the rig): the
// head's and hand's rendered matrices held by a CSS transform at what they were (with !important, over the transform
// attribute), their insides stilled (no animation, no attribute writes, no face drawn), while render() goes on writing
// the head's and hand's own transform attributes every drawn frame, and physics, props, background and the idle timer
// run on. The attribute strings change all the while; what is drawn does not. The guard must reject it: c5's reader of
// those strings counted 13.5 s of movement here. The case also proves the freeze is what it says: the attributes kept
// changing (the old reader would have passed it) and the rendered matrices did not. Passes when the guard rejects the
// freeze; --set selftest=frozen-rigid applies the acceptance predicate instead and must fail. NieR Light c-ready 860, as
// the review ran it. The built mutant reruns as: --grep "awake motion over props" --set looks=nier-light
// --set sizes=860x768 --set screens=c-ready --set page=<frozen-rigid.html>, whose c-ready cell must fail its step bar.
async function frozenRigid(t, mode) {
	await t.viewport(860, 768); const f = await frameFor(t, mode);
	await t.emulate({ reducedMotion: 'no-preference' }); await stageLook(t, f, 'nier-light');
	await f.evaluate(() => O55.ui.open({ fresh: true, screen: 'c-ready' })); await arrive(t, f); await f.waitForTimeout(3500);
	const r = await f.evaluate(async ({ m, i, g }) => {
		const s = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
		const groups = [s.gHead, s.gCtl], inner = groups.flatMap((e) => [...e.querySelectorAll('*')]);
		const freeze = () => {
			s.renderHead = () => {}; s.animFace = () => {};
			for (const e of groups) e.style.setProperty('transform', getComputedStyle(e).transform, 'important');
			for (const c of inner) { c.style.setProperty('animation', 'none', 'important'); c.style.setProperty('transition', 'none', 'important'); c.setAttribute = () => {}; }
		};
		const thaw = () => {
			delete s.renderHead; delete s.animFace;
			for (const e of groups) e.style.removeProperty('transform');
			for (const c of inner) { c.style.removeProperty('animation'); c.style.removeProperty('transition'); delete c.setAttribute; }
		};
		// what is written and what is drawn, counted beside the guard, each animation frame
		const seen = { frames: 0, attrs: new Set(), headCss: new Set(), handCss: new Set(), headCtm: new Set() };
		let on = true;
		const count = () => {
			if (!on) return;
			seen.frames++; seen.attrs.add(s.gHead.getAttribute('transform') + '|' + s.gCtl.getAttribute('transform'));
			seen.headCss.add(getComputedStyle(s.gHead).transform); seen.handCss.add(getComputedStyle(s.gCtl).transform);
			const q = s.svg.getScreenCTM().inverse().multiply(s.gHead.getScreenCTM()); seen.headCtm.add([q.a, q.b, q.c, q.d, q.e, q.f].map((v) => v.toFixed(3)).join(','));
			requestAnimationFrame(count);
		};
		freeze();
		requestAnimationFrame(count);
		try {
			const out = await (0, eval)(`(${m})`)(14000, i, g, '', { at: 60, r: .1 });
			return Object.assign(out, { written: seen.attrs.size, drawnHead: seen.headCss.size, drawnHand: seen.handCss.size, headCtm: seen.headCtm.size, counted: seen.frames });
		} finally { on = false; thaw(); }
	}, { m: MOTION.toString(), i: INK_OVERLAP.toString(), g: GEOMETRY.toString() });
	const why = JSON.stringify({ err: r.err, geometryError: r.geometryError, validPairs: r.validPairs, off: r.off, forced: r.forced, headMs: Math.round(r.headMs || 0), handMs: Math.round(r.handMs || 0), headMoves: r.headMoves, handMoves: r.handMoves, headTravelPx: r.headTravelPx, handTravelPx: r.handTravelPx, written: r.written, drawnHead: r.drawnHead, drawnHand: r.drawnHand, headCtm: r.headCtm, counted: r.counted });
	await t.check(`${mode}: rigid freeze retains valid visible geometry`, !r.err && !r.geometryError && r.validPairs > 0, why);
	await t.check(`${mode}: rigid freeze retains nominal physics`, r.off === 0 && !!(r.forced && r.forced.fired), why);
	// (the freeze is real: render() kept writing new head and hand transforms, and none of them was drawn)
	await t.check(`${mode}: rigid freeze: transform attributes kept changing`, r.written > 20 && r.counted > 100, why);
	await t.check(`${mode}: rigid freeze: rendered head and hand matrices held still`, r.drawnHead === 1 && r.drawnHand === 1 && r.headCtm === 1, why);
	await t.check(`${mode}: rigid freeze rejected by the drawn-pose assertion (${PART_STEPS} visible steps a part)`, t.args.selftest === 'frozen-rigid' ? r.moving >= PART_STEPS : r.headMoves < PART_STEPS && r.handMoves < PART_STEPS, why);
	t.log(why);
}

// T42 (tool batch 3): the freezes opus-recheck-retro6 found the group-matrix guard accepted, lifted from its reusable
// E/checks/review-freeze.check.mjs, each with live physics, props, background and idle timer, the head's own MOTION
// run for 14 s at NieR Light c-ready 860x768 (--set look= another look). Beside the guard it counts what is painted:
// each group's first painted leaf, its travel on screen (so the freeze is shown real where it says, and the part left
// free still moves), and the transform attributes render() keeps writing.
//   head-only       an !important CSS transform holds the head's rendered matrix, its insides stilled; the hand moves
//   hand-only       the same on the hand; the head moves
//   inner-counter   a wrapper inside each group undoes every transform write: the groups' own matrices keep moving
//                   while everything they contain is drawn still
//   parent-counter  a wrapper above each group undoes every write: the groups' own matrices stay put
//   smil            animateTransform holds both groups' poses over the written attribute
//   jitter          the CSS hold, nudged 0.03 units each frame (0.025 CSS px at 860): below anything a person sees
// T65 (TOOLBATCH4), the freezes REVIEW-kit-tb3-opus found the corner-by-corner guard accepted (its zz-rv-t42 probes),
// each on the CSS hold of both parts with their insides stilled:
//   mirror          every painted leaf mirrored left-right about its own centre on alternate frames
//   rot180          every circle, ellipse, rect and line leaf turned 180 degrees about its centre on alternate frames
//   ghost           a fill: transparent rect, half the part's painted area, moved 2 units back and forth each frame
//   defs-clip       a clip-path rect inside defs in each part, half the part's painted area, moved 2 units each frame
//   moveto          each path leaf given an empty sub-path (a lone moveto) 3 units outside its box, alternating sides
//   jitter-0.3      the CSS hold nudged .3 CSS px back and forth each frame (--set dpr=2: .6 device px)
// For moveto, the painted leaf the case measures its freeze by is read through its rendered matrix from its box at the
// start, since its box grows by the empty sub-path that paints nothing. The case passes when the guard rejects the freeze
// (each frozen part under PART_STEPS visible steps); --set selftest=freeze-<kind> applies the acceptance predicate
// instead and must fail. --set dpr=<n> runs it at that device pixel ratio.
const PART_FREEZE = async ({ m, i, g, kind }) => {
	const s = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
	const realSet = Element.prototype.setAttribute;
	const head = s.gHead, hand = s.gCtl, gPip = head.parentElement;
	const frozen = kind === 'head-only' ? [head] : kind === 'hand-only' ? [hand] : [head, hand];
	const undo = [];
	const local = (e) => { const c = e.transform.baseVal.consolidate(); const q = c ? c.matrix : null; return q ? new DOMMatrix([q.a, q.b, q.c, q.d, q.e, q.f]) : new DOMMatrix(); };
	const mstr = (q) => `matrix(${q.a} ${q.b} ${q.c} ${q.d} ${q.e} ${q.f})`;
	const cstr = (q) => `matrix(${q.a}, ${q.b}, ${q.c}, ${q.d}, ${q.e}, ${q.f})`;
	const leafOf = (grp) => [...grp.querySelectorAll('path,circle,ellipse,rect,polygon')].find((e) => { if (e.closest('defs, clipPath, mask, pattern, marker, symbol')) return false; const b = e.getBBox(); return b.width > 2 && b.height > 2; });
	const leaves = { head: leafOf(head), hand: leafOf(hand) };
	// (T65) each measured leaf's box at the start, read each frame through its rendered matrix
	const box0 = { head: leaves.head && leaves.head.getBBox(), hand: leaves.hand && leaves.hand.getBBox() };
	const NS = 'http://www.w3.org/2000/svg', every = (fn) => { const tick = () => { if (!jitterOn) return; try { fn(); } catch (e) { /* keep going */ } requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
	const shownLeaves = (grp) => [...grp.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,line')].filter((e) => { if (e.closest('defs, clipPath, mask, pattern, marker, symbol')) return false; const c = getComputedStyle(e); return (c.fill !== 'none' && !/rgba\([^)]*,\s*0\)$/.test(c.fill)) || (c.stroke !== 'none' && parseFloat(c.strokeWidth) > 0); });
	const T65 = ['mirror', 'rot180', 'ghost', 'defs-clip', 'moveto', 'jitter-0.3'];
	const still = (grp) => {
		const inner = [...grp.querySelectorAll('*')];
		for (const c of inner) { c.style.setProperty('animation', 'none', 'important'); c.style.setProperty('transition', 'none', 'important'); c.setAttribute = () => {}; }
		undo.push(() => { for (const c of inner) { c.style.removeProperty('animation'); c.style.removeProperty('transition'); delete c.setAttribute; } });
	};
	if (frozen.includes(head)) { s.renderHead = () => {}; s.animFace = () => {}; undo.push(() => { delete s.renderHead; delete s.animFace; }); }
	let jitterOn = false;
	for (const grp of frozen) {
		still(grp);
		if (T65.includes(kind)) {
			grp.style.setProperty('transform', getComputedStyle(grp).transform, 'important');
			undo.push(() => grp.style.removeProperty('transform'));
			if (!jitterOn) undo.push(() => { jitterOn = false; });
			jitterOn = true;
			if (kind === 'jitter-0.3') {
				const M = new DOMMatrix(getComputedStyle(grp).transform), p = grp.parentElement.getScreenCTM(), u = .3 / Math.hypot(p.a, p.b);
				let kk = 0; every(() => { kk ^= 1; const q = M.translate(0, 0); q.e += kk * u; grp.style.setProperty('transform', cstr(q), 'important'); });
			} else if (kind === 'mirror' || kind === 'rot180') {
				const all = shownLeaves(grp).filter((e) => kind === 'mirror' || /^(circle|ellipse|rect|line)$/.test(e.tagName));
				const base = all.map((e) => ({ e, t: e.getAttribute('transform') || '', b: e.getBBox() }));
				let kk = 0; every(() => { kk ^= 1; for (const z of base) { const cx = z.b.x + z.b.width / 2, cy = z.b.y + z.b.height / 2; realSet.call(z.e, 'transform', `${z.t} ${kk ? (kind === 'mirror' ? `translate(${cx} 0) scale(-1 1) translate(${-cx} 0)` : `rotate(180 ${cx} ${cy})`) : ''}`.trim()); } });
				undo.push(() => { for (const z of base) realSet.call(z.e, 'transform', z.t); });
			} else if (kind === 'ghost' || kind === 'defs-clip') {
				// sized as the review sized it: the part's whole painted area again, so it holds half of the part's area
				const gi = grp.getScreenCTM().inverse(), tot = shownLeaves(grp).reduce((a, e) => { const q = gi.multiply(e.getScreenCTM()), bb = e.getBBox(); return a + Math.abs(q.a * q.d - q.b * q.c) * bb.width * bb.height; }, 0);
				const b = grp.getBBox(), f = Math.sqrt(1.05 * tot / Math.max(b.width * b.height, 1e-6)), w = b.width * f, h = b.height * f, rr = document.createElementNS(NS, 'rect');
				for (const [a, v] of [['x', b.x + b.width / 2 - w / 2], ['y', b.y + b.height / 2 - h / 2], ['width', w], ['height', h]]) realSet.call(rr, a, String(v));
				let host = rr;
				if (kind === 'ghost') realSet.call(rr, 'fill', 'transparent');
				else { const d = document.createElementNS(NS, 'defs'), cp = document.createElementNS(NS, 'clipPath'); realSet.call(cp, 'id', 'zz-t65-clip-' + Math.random().toString(36).slice(2)); cp.appendChild(rr); d.appendChild(cp); host = d; }
				grp.appendChild(host); undo.push(() => host.remove());
				let kk = 0; every(() => { kk ^= 1; realSet.call(rr, 'transform', `translate(${kk * 2} 0)`); });
			} else if (kind === 'moveto') {
				const paths = [...grp.querySelectorAll('path')].filter((q) => !q.closest('defs, clipPath, mask, pattern, marker, symbol')).map((q) => ({ q, d: q.getAttribute('d') || '', b: q.getBBox() })).filter((z) => z.d);
				let kk = 0; every(() => { kk ^= 1; for (const z of paths) realSet.call(z.q, 'd', `${z.d} M${kk ? z.b.x - 3 : z.b.x + z.b.width + 3} ${z.b.y + z.b.height / 2}`); });
				undo.push(() => { for (const z of paths) realSet.call(z.q, 'd', z.d); });
			}
		} else if (kind === 'head-only' || kind === 'hand-only') {
			grp.style.setProperty('transform', getComputedStyle(grp).transform, 'important');
			undo.push(() => grp.style.removeProperty('transform'));
		} else if (kind === 'jitter') {
			const M = new DOMMatrix(getComputedStyle(grp).transform);
			grp.style.setProperty('transform', cstr(M), 'important');
			jitterOn = true; let k = 0;
			const tick = () => { if (!jitterOn) return; k ^= 1; const q = M.translate(0, 0); q.e += k * .03; grp.style.setProperty('transform', cstr(q), 'important'); requestAnimationFrame(tick); };
			requestAnimationFrame(tick);
			undo.push(() => { jitterOn = false; grp.style.removeProperty('transform'); });
		} else if (kind === 'inner-counter') {
			const w = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			while (grp.firstChild) w.appendChild(grp.firstChild);
			grp.appendChild(w);
			const L0 = local(grp);
			grp.setAttribute = function (n, v) { realSet.call(this, n, v); if (n === 'transform') realSet.call(w, 'transform', mstr(local(grp).inverse().multiply(L0))); };
			undo.push(() => { delete grp.setAttribute; while (w.firstChild) grp.insertBefore(w.firstChild, w); w.remove(); });
		} else if (kind === 'parent-counter') {
			const w = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			gPip.insertBefore(w, grp); w.appendChild(grp);
			const L0 = local(grp);
			grp.setAttribute = function (n, v) { realSet.call(this, n, v); if (n === 'transform') realSet.call(w, 'transform', mstr(L0.multiply(local(grp).inverse()))); };
			undo.push(() => { delete grp.setAttribute; gPip.insertBefore(grp, w); w.remove(); });
		} else if (kind === 'smil') {
			const M = local(grp), th = Math.atan2(M.b, M.a), sx = Math.hypot(M.a, M.b), sy = (M.a * M.d - M.b * M.c) / sx;
			const an = [['translate', `${M.e} ${M.f}`, 'replace'], ['rotate', `${th * 180 / Math.PI}`, 'sum'], ['scale', `${sx} ${sy}`, 'sum']].map(([type, val, add]) => {
				const a = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
				for (const [k, v] of [['attributeName', 'transform'], ['type', type], ['from', val], ['to', val], ['dur', '1000s'], ['fill', 'freeze'], ['additive', add], ['begin', 'indefinite']]) realSet.call(a, k, v);
				grp.appendChild(a); return a;
			});
			an.forEach((a) => a.beginElement());
			undo.push(() => an.forEach((a) => a.remove()));
		}
	}
	const seen = { frames: 0, written: new Set(), span: { head: 0, hand: 0 } };
	const first = {}; let on = true;
	const count = () => {
		if (!on) return;
		seen.frames++; seen.written.add(head.getAttribute('transform') + '|' + hand.getAttribute('transform'));
		for (const nm of ['head', 'hand']) {
			const lf = leaves[nm], b0 = box0[nm]; if (!lf || !b0) continue;
			let b = lf.getBoundingClientRect();
			if (kind === 'moveto') {   // (its box grows by the empty sub-path; the drawn shape is read through its matrix)
				const m = lf.getScreenCTM(); if (!m) continue;
				const pts = [[b0.x, b0.y], [b0.x + b0.width, b0.y], [b0.x, b0.y + b0.height], [b0.x + b0.width, b0.y + b0.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
				b = { left: Math.min(...pts.map((q) => q[0])), top: Math.min(...pts.map((q) => q[1])) };
			}
			if (!first[nm]) first[nm] = [b.left, b.top]; else seen.span[nm] = Math.max(seen.span[nm], Math.hypot(b.left - first[nm][0], b.top - first[nm][1]));
		}
		requestAnimationFrame(count);
	};
	requestAnimationFrame(count);
	try {
		const out = await (0, eval)(`(${m})`)(14000, i, g, '', { at: 60, r: .1 });
		return Object.assign(out, { kind, counted: seen.frames, written: seen.written.size, leafHeadTravelPx: Math.round(seen.span.head * 100) / 100, leafHandTravelPx: Math.round(seen.span.hand * 100) / 100, hasLeaves: !!leaves.head && !!leaves.hand });
	} finally { on = false; for (const u of undo.reverse()) { try { u(); } catch (e) { /* undone as far as it goes */ } } }
};
const PART_FREEZES = ['head-only', 'hand-only', 'inner-counter', 'parent-counter', 'smil', 'jitter', 'mirror', 'rot180', 'ghost', 'defs-clip', 'moveto', 'jitter-0.3'];
async function partFreeze(t, mode, kind) {
	const look = t.args.look || 'nier-light', dpr = Number(t.args.dpr || 1);
	if (dpr !== 1) await t.newContext({ viewport: { width: 860, height: 768 }, deviceScaleFactor: dpr });
	else await t.viewport(860, 768);
	const f = await frameFor(t, mode);
	await t.emulate({ reducedMotion: 'no-preference' }); await stageLook(t, f, look);
	await f.evaluate(() => O55.ui.open({ fresh: true, screen: 'c-ready' })); await arrive(t, f); await f.waitForTimeout(3500);
	await t.mark(`${mode} ${kind} freeze`);
	const r = await f.evaluate(PART_FREEZE, { m: MOTION.toString(), i: INK_OVERLAP.toString(), g: GEOMETRY.toString(), kind });
	const why = JSON.stringify({ err: r.err, geometryError: r.geometryError, validPairs: r.validPairs, off: r.off, forced: r.forced, headMs: Math.round(r.headMs || 0), handMs: Math.round(r.handMs || 0), headMoves: r.headMoves, handMoves: r.handMoves, headTravelPx: r.headTravelPx, handTravelPx: r.handTravelPx, travelUnit: r.travelUnit, dpr: r.dpr, written: r.written, counted: r.counted, leafHeadTravelPx: r.leafHeadTravelPx, leafHandTravelPx: r.leafHandTravelPx, hasLeaves: r.hasLeaves });
	t.log(`${mode} ${kind} freeze: ${why}`);
	const tag = `${mode} frozen part ${kind}`;
	await t.check(`${tag}: retains valid visible geometry`, !r.err && !r.geometryError && r.validPairs > 0, why);
	await t.check(`${tag}: retains nominal physics`, r.off === 0 && !!(r.forced && r.forced.fired), why);
	await t.check(`${tag}: render() kept writing`, r.written > 20 && r.counted > 100 && r.hasLeaves, why);
	const headFrozen = kind !== 'hand-only', handFrozen = kind !== 'head-only';
	// the freeze is real where it says (the painted leaf moved under half a pixel), and the part left free still moves
	await t.check(`${tag}: painted head ${headFrozen ? 'held still (< .5 px)' : 'moves (> 2 px)'}`, headFrozen ? r.leafHeadTravelPx < .5 : r.leafHeadTravelPx > 2, why);
	await t.check(`${tag}: painted hand ${handFrozen ? 'held still (< .5 px)' : 'moves (> 2 px)'}`, handFrozen ? r.leafHandTravelPx < .5 : r.leafHandTravelPx > 2, why);
	const rejected = (!headFrozen || r.headMoves < PART_STEPS) && (!handFrozen || r.handMoves < PART_STEPS);
	await t.check(`${tag}: rejected by the drawn-pose assertion (each frozen part under ${PART_STEPS} visible steps)`, t.args.selftest === `freeze-${kind}` ? r.moving >= PART_STEPS : rejected, why);
}

// N1 (astra-review-retro-3): c-ready's props keep off Pip's speech bubble, and off Pip's head. In Retro Dark at 740 the
// bubble finds no clear place and claims one beside Pip's face; the server, at the bubble's right end with Pip's head on
// its left (FO-50), the laptop on its right and the tube's foot below (A3-6), was drawn smaller and smaller under the
// bubble's end and stayed there, 9-16 px, at 2 s and after (457801b0f6). Pinned main 0adb197992 cleared the bubble only
// by hanging the server over Pip's head. Retro Light and Dark, c-ready opened fresh with Pip woken by the pointer, at 740
// loaded fresh and resized 1920 -> 740, and loaded fresh at 860, 1024, 1280x800, 1920 and 1280x500: every frame for a
// second at 2 s after the size settles and again 2.5 s later, no shown prop (opacity over .05) meets the shown bubble
// (painted boxes, more than .5 px each way), and none paints over Pip's head (the fill/stroke ink reader, 4 px² at most).
// Fails on 457801b0f6 (the bubble) and on 0adb197992 (the head). --set looks=, --set sizes= (the fresh ones) pick some.
const BUBBLE_SIZES = [[860, 768], [1024, 768], [1280, 800], [1920, 1080], [1280, 500]];
const BUBBLE_SAMPLE = async (ms, probeSource) => {
	const overlap = (0, eval)(`(${probeSource})`);
	const s = O55.pipStage.of(O55.S.root.querySelector('.o55-stage'));
	if (!s) return { err: 'no stage' };
	const R = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
	const out = { n: 0, bubbleFrames: 0, serverFrames: 0, propFrames: 0, hits: 0, worst: 0, at: null, ink: 0, inkAt: null, asleep: false, low: 0, small: [] };
	const t0 = performance.now();
	while (performance.now() - t0 < ms) {
		await new Promise((r) => requestAnimationFrame(() => r()));
		out.n++; if (O55.motion.lowResource) out.low++; if (s.sleepZ) out.asleep = true;
		const props = [...s.props.values()].filter((p) => +p.el.getAttribute('opacity') > .05);
		out.propFrames += props.length ? 1 : 0;
		if (props.some((p) => p.spec.kind === 'server')) out.serverFrames++;
		for (const p of props) {
			const a = overlap(s.gHead, p.el);
			if (a > out.ink) { out.ink = a; out.inkAt = { prop: p.spec.kind, t: Math.round(performance.now() - t0), box: p.box && p.box.map(Math.round), keep: s.pipKeep && s.pipKeep.map(Math.round) }; }
			if (p.restOff && p.restOff.g < 1 && !out.small.includes(p.spec.kind)) out.small.push(p.spec.kind);
		}
		const b = s.bubble, shown = b.classList.contains('on') && !!(b.textContent || '').trim() && getComputedStyle(b).visibility !== 'hidden' && +getComputedStyle(b).opacity > .05;
		if (!shown) continue;
		out.bubbleFrames++;
		const bb = R(b);
		for (const p of props) {
			const q = R(p.el), dx = Math.min(bb[2], q[2]) - Math.max(bb[0], q[0]), dy = Math.min(bb[3], q[3]) - Math.max(bb[1], q[1]);
			if (dx > .5 && dy > .5) {
				out.hits++;
				if (Math.min(dx, dy) > out.worst) { out.worst = Math.min(dx, dy); out.at = { prop: p.spec.kind, dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10, t: Math.round(performance.now() - t0), box: p.box && p.box.map(Math.round), keepOff: s.keepOff && s.keepOff.map(Math.round), restOff: p.restOff }; }
			}
		}
	}
	return out;
};
async function bubbleClear(t, mode) {
	const reduce = t.args.motion === 'reduce', looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const routes = [['fresh', [740, 768]], ['resize', [740, 768]]].concat((sizesArg(t) || BUBBLE_SIZES).map((s) => ['fresh', s]));
	await probeFixture(t, await frameFor(t, mode), mode);
	for (const look of looks) for (const [route, [w, h]] of routes) {
		const tag = `${mode} ${look} c-ready ${route === 'resize' ? '1920x1080 -> ' : 'fresh '}${w}x${h}`;
		await t.viewport(route === 'resize' ? 1920 : w, route === 'resize' ? 1080 : h);
		const f = await frameFor(t, mode);
		await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
		await stageLook(t, f, look);
		await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'c-ready' }));
		await f.waitForFunction(() => !!O55.pipStage.of(O55.S.root.querySelector('.o55-stage')), null, { timeout: 15000 }).catch(() => {});
		await f.waitForTimeout(1500);
		await t.check(`${tag}: Pip wakes on the pointer's arrival`, await arrive(t, f), 'still asleep after 4 s', { hard: true });
		await restOnStage(t, f);
		await f.waitForTimeout(3200);
		if (route === 'resize') await t.viewport(w, h);
		await t.mark(tag);
		await f.waitForTimeout(2000);
		for (const [when, gap] of [['at 2 s', 0], ['2.5 s later', 2500]]) {
			if (gap) await f.waitForTimeout(gap);
			const r = await f.evaluate(`(${BUBBLE_SAMPLE.toString()})(1000, ${JSON.stringify(INK_OVERLAP.toString())})`);
			if (r.err) { await t.check(`${tag} ${when}: the stage`, false, r.err); continue; }
			const why = JSON.stringify(r), at = `${tag} ${when}`;
			// (preconditions, not skips: Pip awake and talking, the server shown, frames sampled)
			await t.check(`${at}: sampled awake, the bubble and the server shown`, r.n > 5 && !r.asleep && r.bubbleFrames > 5 && r.serverFrames > 5, why);
			await t.check(`${at}: no prop under Pip's bubble`, r.hits === 0, why);
			await t.check(`${at}: no prop painted over Pip's head`, r.ink <= 4, `${r.ink} px²; ${why}`);
			if (r.hits || r.ink > 4) await t.inFrame(f, () => t.crop(`bubble-${mode}-${look}-${route}-${w}x${h}`, '#pm-o55-onboarding .o55-stage', `${at}: prop under the bubble or over Pip`));
			else t.log(`${at}: ${why}`);
		}
	}
	await t.viewport(1920, 1080);
}
// N1's film: --set film=bubble --record <mp4> (both surfaces in one film, or --set sandbox= one). A recording keeps the
// window's size, so the page sits in a frame of it resized as a window would be (the normal surface in a side-by-side
// frame, the sandbox in its own frame): c-ready opened at 740x768, and opened at 1920x1080 then resized to 740x768, in
// Retro Dark (--set look=retro-light,retro-dark for more), --set reps=3 times; each marked '<look> <route> rep <n>' as the
// size settles, then judged as above at 2 s and 2.5 s later. With --grep "clear of the bubble" (the other cases are not films).
async function filmBubble(t, mode) {
	let f, size;
	if (mode === 'normal') {
		await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
		const href = await t.root.evaluate(() => location.href);
		[f] = await t.openSideBySide([{ url: href, width: 1920, height: 1080, label: 'N1 normal: c-ready, the page in a frame resized as a window would be' }]);
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = document.getElementById('__bc_side_0'); i.style.width = w + 'px'; i.style.height = h + 'px'; }, [w, h]);
	} else {
		f = await t.app.open({ sandbox: true, onboarding: true, query: 'o55=screen=welcome' });
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = [...document.querySelectorAll('iframe')].find((x) => x.hasAttribute('sandbox')); i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.flex = 'none'; }, [w, h]);
	}
	await f.waitForFunction(() => !!window.O55 && !!O55.S && !!O55.S.root, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	const reps = +t.args.reps || 3;
	for (const look of t.args.look ? String(t.args.look).split(',') : ['retro-dark']) for (let i = 1; i <= reps; i++) for (const route of ['fresh', 'resize']) {
		const tag = `film ${mode} ${look} c-ready ${route === 'resize' ? '1920x1080 -> ' : 'fresh '}740x768 rep ${i}`;
		await size(route === 'resize' ? 1920 : 740, route === 'resize' ? 1080 : 768);
		await f.waitForTimeout(600);
		await stageLook(t, f, look);
		await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'c-ready' }));
		await f.waitForTimeout(1500);
		await t.check(`${tag}: Pip wakes on the pointer's arrival`, await arrive(t, f), 'still asleep after 4 s');
		await restOnStage(t, f);
		await f.waitForTimeout(3200);
		if (route === 'resize') await size(740, 768);
		await t.mark(`${look} ${route} rep ${i}`);
		await f.waitForTimeout(2000);
		for (const [when, gap] of [['at 2 s', 0], ['2.5 s later', 2500]]) {
			if (gap) await f.waitForTimeout(gap);
			const r = await f.evaluate(`(${BUBBLE_SAMPLE.toString()})(1000, ${JSON.stringify(INK_OVERLAP.toString())})`);
			const why = JSON.stringify(r), at = `${tag} ${when}`;
			await t.check(`${at}: sampled awake, the bubble and the server shown`, !r.err && r.n > 5 && !r.asleep && r.bubbleFrames > 5 && r.serverFrames > 5, why);
			await t.check(`${at}: no prop under Pip's bubble`, !r.err && r.hits === 0, why);
			await t.check(`${at}: no prop painted over Pip's head`, !r.err && r.ink <= 4, `${r.ink} px²; ${why}`);
			t.log(`${at}: ${why}`);
		}
	}
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

// SW-23 films (sol-review-retro-1: the rebuilt head painted unposed at the stage's upper left for 1-2 frames on Retro
// Light Name 1024 -> 740): --set film=relayout --record <mp4>, on the normal surface (case 'retro stage fit normal') or
// the sandbox (case 'retro stage fit sandbox': its own frame resized from the window, as the recording keeps the
// window's size). Name with a name typed in each look (--set look=, default Retro Light and Dark, NieR Light and Dark),
// steady at 1024, then resized to 740 and back, --set reps=3 times; each resize to 740 marked '<look> rep <n> 740'.
// After each, the no-replay measures (no power-on, the line whole and not said again) and the fit are judged; the
// frames just after each mark are for every-frame review.
async function filmRelayout(t, mode) {
	let f, size;
	if (mode === 'normal') {
		await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
		const href = await t.root.evaluate(() => location.href);
		[f] = await t.openSideBySide([{ url: href, width: 1024, height: 768, label: 'SW-23 normal: Name, 1024 -> 740, the page in a frame resized as a window would be' }]);
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = document.getElementById('__bc_side_0'); i.style.width = w + 'px'; i.style.height = h + 'px'; }, [w, h]);
	} else {
		f = await t.app.open({ sandbox: true, onboarding: true, query: 'o55=screen=welcome' });
		size = (w, h) => t.window.evaluate(([w, h]) => { const i = [...document.querySelectorAll('iframe')].find((x) => x.hasAttribute('sandbox')); i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.flex = 'none'; }, [w, h]);
	}
	await f.waitForFunction(() => !!window.O55 && !!O55.S, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	const reps = +t.args.reps || 3;
	for (const look of t.args.look ? String(t.args.look).split(',') : ['retro-light', 'retro-dark', 'nier-light', 'nier-dark']) {
		await size(1024, 768);
		await f.waitForTimeout(600);
		await lookAndName(t, f, look);
		await restOnStage(t, f); /* (no layout moves a choice under the pointer: the line changes only by hover otherwise) */
		await f.waitForTimeout(2500);
		for (let i = 1; i <= reps; i++) {
			await t.mark(`${look} rep ${i} 1024`);
			await f.waitForTimeout(1500);
			const was = await stageNow(f);
			await size(740, 768);
			await t.mark(`${look} rep ${i} 740`);
			await f.waitForTimeout(2200);
			const now = await stageNow(f), tag = `film ${mode} ${look} rep ${i} 1024 -> 740 [${was.layout} -> ${now.layout}]`;
			await t.check(`${tag}: the layout changed`, now.layout !== was.layout, now.layout);
			if (/^retro/.test(look)) await t.check(`${tag}: the tube is not powered on again`, now.power.length === 0, now.power.join(', '));
			await t.check(`${tag}: Pip's line not said again`, now.sayAt === was.sayAt, `said at ${was.sayAt} then ${now.sayAt}`);
			await t.check(`${tag}: Pip says the same line (text and id)`, now.saying === was.saying && now.lineId === was.lineId, JSON.stringify({ was: [was.saying, was.lineId, was.preview], now: [now.saying, now.lineId, now.preview] }));
			await t.inFrame(f, () => judge(t, f, tag, { sign: true }));
			await size(1024, 768);
			await f.waitForTimeout(2200);
		}
	}
}

export const tests = {
	'leaving sign head normal': on('normal',leavingHead),
	'leaving sign head sandbox': on('sandbox',leavingHead),
	'frozen drawing negative normal': on('normal',frozenDrawing),
	'frozen drawing negative sandbox': on('sandbox',frozenDrawing),
	'frozen rendering negative normal': on('normal', frozenRigid),
	'frozen rendering negative sandbox': on('sandbox', frozenRigid),
	...Object.fromEntries(PART_FREEZES.flatMap((k) => ['normal', 'sandbox'].map((mode) => [`frozen part ${k} negative ${mode}`, (t) => (t.args.film ? t.check('not run under film', true) : on(mode, (t2, md) => partFreeze(t2, md, k))(t))]))),
	'ink overlap probe normal': on('normal', async (t, mode) => probeFixture(t, await frameFor(t, mode), mode)),
	'ink overlap probe sandbox': on('sandbox', async (t, mode) => probeFixture(t, await frameFor(t, mode), mode)),
	'retro stage fit normal': (t) => (t.args.film === 'relayout' ? on('normal', filmRelayout)(t) : t.args.film === 'bubble' ? t.check('not run: the bubble film is its own case', true) : t.args.film ? film(t) : on('normal', fit)(t)),
	'retro stage fit sandbox': (t) => (t.args.film === 'relayout' ? on('sandbox', filmRelayout)(t) : t.args.film ? t.check('not run: the film is of the normal surface', true) : on('sandbox', fit)(t)),
	'retro props every screen normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', everyScreen)(t)),
	'retro props every screen sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', everyScreen)(t)),
	'pip clear of the stage words every look normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', clearOfWords)(t)),
	'pip clear of the stage words every look sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', clearOfWords)(t)),
	'layout change replays nothing normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', noReplay)(t)),
	'layout change replays nothing sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', noReplay)(t)),
	'awake motion over props normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', awakeMotion)(t)),
	'awake motion over props sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', awakeMotion)(t)),
	'swing at a screen change normal': (t) => (t.args.film ? t.check('not run under film', true) : on('normal', swingAtChange)(t)),
	'swing at a screen change sandbox': (t) => (t.args.film ? t.check('not run under film', true) : on('sandbox', swingAtChange)(t)),
	'c-ready props clear of the bubble normal': (t) => (t.args.film === 'bubble' ? on('normal', filmBubble)(t) : t.args.film ? t.check('not run under film', true) : on('normal', bubbleClear)(t)),
	'c-ready props clear of the bubble sandbox': (t) => (t.args.film === 'bubble' ? on('sandbox', filmBubble)(t) : t.args.film ? t.check('not run under film', true) : on('sandbox', bubbleClear)(t))
};
