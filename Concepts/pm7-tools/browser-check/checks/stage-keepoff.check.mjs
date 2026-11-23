// Pip's stage keeps its props off the speech box, and its effects inside the pane, in every frame of a transition (stream F
// lane stage, 2026-11-04; FO-34, FO-35, FO-39 and the NieR Creating 740 carry). A sampler reads, on each animation frame,
// every prop that shows (opacity over .05), the speech box (the bubble, or NieR's fixed box with its PIP tab) and Basic's
// confirmation ring, and fails on:
//  - NieR Light and Dark at 740x768 (the banner: NieR's box at the top over the props' column): a prop under the box or
//    its PIP tab while Safe's Add one is hovered and left, Add one is pressed and Back is pressed, Safe with an online copy
//    settles (the cloud), and Creating lowers its blocks (each went down behind the tab and the box), with three blocks
//    and with four (an online copy signed in by the concept's stand-in owner), and the settled four-block stack stands
//    below the box and its tab;
//  - Glass Dark, Basic Light, Friendly Light, Retro Light and Retro Dark at 1920x1080, 1390x900, 860x768 and 740x768: a
//    prop under the bubble on Name > Safe > Add one > Back > Review (a leaving prop rose through the bubble, the next words'
//    bubble moved onto a prop still fading out, or, in Retro's 740 banner where no place was clear, claimed a place over
//    the leaving sign); --set leaveLooks= limits the looks;
//  - Glass Dark and Basic Light at 1920x1080 and 1390x900, Begins as: an existing folder picked, then New, then the folder
//    again, then New (AST3: the folder leaving went behind the new words' bubble for 11 frames);
//  - Basic Light at 1920x1080 and 1390x900: Basic's check badge or the ring spreading from it past the stage's visible
//    box (the pane, cut by its clipping parents) when a choice on Away from home is made (the globe hangs at the pane's
//    right edge; AST4's key ring was cut there).
//  - NieR Light and Dark at 740x768 and 1920x1080, Text size: a font-size and line-height stylesheet restating the box's
//    (as the Text size and Line spacing settings' o55PaintScales does) changes the box's size with its words, class, map
//    and fonts unchanged. Creating's settled blocks must stay clear of the resized box and its PIP tab, and the stage's
//    kept box must be re-measured against a fresh boxInScene (TOOLS-STAGEREST-K4: the nierKey gap, opus-review-stagerest
//    P1, passes the other groups). Plus the real-input reopen routes (astra-max-18, neon-max-18: close settled Creating
//    with 3 or 4 landed blocks, change Text size / Line spacing in Settings, resume from the bell) across 1920x1080 and
//    740x768, normal motion and all three still paths (OS prefers-reduced-motion, Settings > Reduce motion toggle
//    data-motion=reduced, and lowResource): the kept box re-measures, all landed blocks sit at their new targets clear
//    of the box/tab band, and resizing away and back causes no jump.
// Geometry from the page, not pixels: films cover the motion claims (lane report). Every case also fails if it sampled
// no frames, or never saw what it is about (a leaving prop, a block, a ring); a case whose sampler saw no leaving prop
// reruns its whole sequence up to twice more before failing as 'could not judge' (a slow GPU can drop every leaving
// frame; TOOL-ISSUES F13-NAS1-KEEPOFF-SAMPLES), and an overlap fails at once. Both surfaces unless --set sandbox picks one.
// --set only=nier|leave|begin|ring|textsize|textsize-astra|live-reduced runs one group. About 8 minutes per surface.
//   browser-check run Concepts/pm7-tools/browser-check/checks/stage-keepoff.check.mjs --set page=<build>

const LAYER = '#pm-o55-onboarding .o55-layer:not(.o55-out)';
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));
const want = (t, g) => !t.args.only || t.args.only.split(',').includes(g);

// the per-frame sampler, in the app's frame. It reads at the end of each frame, after every animation-frame callback (the
// rig's render included) and the frame's layout, just before paint: a ResizeObserver on a 1 px element whose width an
// animation frame toggles (a plain animation-frame read can see a state the rig rewrites before the frame is painted)
function sampler() {
	window.__sk = { frames: 0, hits: [], rings: 0, ringOut: [], leaving: 0, blocks: 0 };
	const R = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
	const meet = (a, b) => a[0] < b[2] - 0.5 && a[2] > b[0] + 0.5 && a[1] < b[3] - 0.5 && a[3] > b[1] + 0.5;
	const tick = () => {
		if (!window.__sk) return;
		const st = document.querySelector('#pm-o55-onboarding .pst'), svg = st && st.querySelector('svg'), b = st && st.querySelector('.pst-bubble');
		if (st && svg && b && window.__sk) {
			const S = window.__sk; S.frames++;
			const boxes = [];
			if (b.classList.contains('on') && (b.textContent || '').trim() && getComputedStyle(b).visibility !== 'hidden') {
				boxes.push(['speech box', R(b)]);
				const tab = b.querySelector(':scope > .pst-bn'); if (tab && tab.getBoundingClientRect().width) boxes.push(['PIP tab', R(tab)]);
			}
			const screen = window.O55 && window.O55.S.sess.screen;
			st.querySelectorAll('.pst-prop').forEach((p) => {
				const op = +p.getAttribute('opacity'); if (!(op > 0.05)) return;
				const pr = R(p); if (pr[2] - pr[0] < 1) return;
				if (p.dataset.kind === 'block') S.blocks++;
				boxes.forEach(([n, bx]) => { if (meet(pr, bx)) S.hits.push(`${screen}: ${p.dataset.kind} (opacity ${op.toFixed(2)}) under the ${n} at ${pr.map(Math.round)} vs ${bx.map(Math.round)}`); });
			});
			// leaving props: the rig marks none, so count props whose opacity falls
			st.querySelectorAll('.pst-prop').forEach((p) => { const op = +p.getAttribute('opacity'), was = +(p.dataset.skOp || 0); if (op < was - 0.01 && op > 0.05) S.leaving++; p.dataset.skOp = String(op); });
			// Basic's ring (an unfilled r 11 circle in a particle) and its badge, against the stage's visible box
			let vis = R(svg);
			for (let e = svg.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/hidden|clip|auto|scroll/.test(cs.overflowX + cs.overflowY)) { const c = R(e); vis = [Math.max(vis[0], c[0]), Math.max(vis[1], c[1]), Math.min(vis[2], c[2]), Math.min(vis[3], c[3])]; } }
			st.querySelectorAll('g.pst-p').forEach((g) => {
				const c = g.querySelector('circle[r="11"]'); if (!c || !(+g.getAttribute('opacity') > 0.02)) return;
				const ring = c.getAttribute('fill') === 'none'; if (ring) S.rings++;
				const m = (g.getAttribute('transform') || '').match(/scale\(([\d.]+)/), k = m ? +m[1] : 1, sw = (+c.getAttribute('stroke-width') || 0) * k / 2, r = R(c);
				const o = [r[0] - sw, r[1] - sw, r[2] + sw, r[3] + sw];
				if (o[0] < vis[0] - 0.5 || o[1] < vis[1] - 0.5 || o[2] > vis[2] + 0.5 || o[3] > vis[3] + 0.5) S.ringOut.push(`${screen}: ${ring ? 'ring' : 'check'} at ${o.map(Math.round)} past the visible stage ${vis.map(Math.round)}`);
			});
		}
	};
	const dot = document.createElement('i'); dot.setAttribute('aria-hidden', 'true');
	dot.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0';
	document.body.appendChild(dot);
	new ResizeObserver(() => tick()).observe(dot);
	const flip = () => { if (!window.__sk) { dot.remove(); return; } dot.style.width = dot.style.width === '1px' ? '2px' : '1px'; requestAnimationFrame(flip); };
	requestAnimationFrame(flip);
}

async function openAt(t, mode, look, [w, h], screen) {
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screen, sandbox: mode === 'sandbox' });
	await f.waitForFunction(() => !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
	const [fam, scheme] = look.split('-');
	await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, scheme]);
	await f.waitForTimeout(4500);
	await f.evaluate(sampler);
	return f;
}
// a control of the current screen, by its action, through the real pointer (the sandbox fills the window)
async function point(t, f, mode, act, arg, click = true) {
	const r = await f.evaluate(([L, d, a]) => { const b = [...document.querySelectorAll(`${L} [data-o55-do="${d}"]${a ? `[data-arg="${a}"]` : ''}`)].find((x) => x.getBoundingClientRect().width); if (!b) return null; b.scrollIntoView({ block: 'center' }); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, [LAYER, act, arg || '']);
	if (!r) return false;
	await t.page.mouse.move(r.x, r.y, { steps: 4 });
	if (click) await t.page.mouse.click(r.x, r.y);
	await f.waitForTimeout(2400);
	return true;
}
async function next(t, f, to) {
	for (let i = 0; i < 8 && (await f.evaluate(() => window.O55.S.sess.screen)) !== to; i++) {
		await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot .o55-primary'); if (b && !b.disabled) b.click(); });
		await f.waitForTimeout(1600);
	}
	return (await f.evaluate(() => window.O55.S.sess.screen)) === to;
}
async function nameIt(t, f) {
	const inp = f.locator(`${LAYER} input`).first();
	await inp.click(); await t.page.keyboard.press('Control+A'); await t.page.keyboard.type('Book club', { delay: 25 });
}
// what the sampler saw; and a clean store for the next case's fresh load (a normal page keeps the session in localStorage:
// Safe's online copy, set below, left the next case's Review unable to create)
const result = async (t, f) => { const S = await f.evaluate(() => { const S = window.__sk; window.__sk = null; return S; }); await t.app.resetLayout(t); return S; };

// judges one of this file's keep-off assertions, each of which needs the sampler to have seen a leaving prop.
// A slow GPU can drop every frame of the leaving phase (TOOL-ISSUES F13-NAS1-KEEPOFF-SAMPLES: Nas1 head runs with
// 0 leaving samples and 0 overlaps), and such an attempt judged nothing: it must not pass, but before it fails the
// whole sequence reruns from its start, at most twice more, and the attempt that saw a leaving prop is judged. An
// overlap (S.hits) from any attempt fails the assertion at once; thresholds and the overlap rule are unchanged, and
// after three attempts with no leaving sample the assertion fails as unjudged rather than as a product defect.
async function keepoff(t, run, tag, what, fail0 = () => '') {
	let ok = true, S = null; const frames = [];
	for (let a = 0; a < 3; a++) {
		({ ok = true, S } = await run());
		if (!ok || S.hits.length || S.frames <= 200 || S.leaving > 0) break;
		frames.push(S.frames);
	}
	const title = `${tag}: ${what}`;
	return frames.length === 3
		? t.check(title, false, `could not judge: no leaving sample in 3 attempts (${frames.join(', ')} frames each)`)
		: t.check(title, ok && S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${fail0(ok)}${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
}

async function nier(t, mode) {
	for (const look of ['nier-light', 'nier-dark']) {
		const tag = `${look} 740x768 ${mode}`;
		await keepoff(t, async () => {
			const f = await openAt(t, mode, look, [740, 768], 'safe');
			await point(t, f, mode, 'online', null, false);        // Add one hovered: the cloud's preview comes in
			await t.page.mouse.move(4, 4, { steps: 3 }); await f.waitForTimeout(2000);
			await point(t, f, mode, 'online');                    // pressed: Safe's vault leaves, the service's mark comes in
			await point(t, f, mode, 'back');                      // and back
			// Safe with an online copy chosen (state: the draft's online copy, as the service screen's Continue leaves it)
			await f.evaluate(() => { const d = window.O55.S.sess.drafts.main; d.online_mode = 'new'; d.forge = 'github'; window.O55.ui.go('safe', { noHistory: true }); });
			await f.waitForTimeout(3500);
			return { S: await result(t, f) };
		}, tag, `Safe's Add one, Back and the settled cloud: no prop under the box or the PIP tab`);
		let f = await openAt(t, mode, look, [740, 768], 'name');
		await nameIt(t, f);
		const reached = (await next(t, f, 'review')) && (await next(t, f, 'creating'));
		await f.waitForTimeout(8000);
		let S = await result(t, f);
		await t.check(`${tag}: Creating lowers its blocks clear of the box and the PIP tab`, reached && S.blocks > 0 && S.hits.length === 0, `${reached ? 'creating' : 'did not reach Creating'}, ${S.frames} frames, ${S.blocks} block samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
		// Creating with four blocks: an online copy, signed in by the concept's stand-in owner (no real account), the whole
		// route sampled, then the settled stack measured (the onb lane's carried 'box over the top block by 5-7 px')
		f = await openAt(t, mode, look, [740, 768], 'name');
		await nameIt(t, f);
		let ok4 = (await next(t, f, 'safe')) && (await point(t, f, mode, 'online')) && (await point(t, f, mode, 'pick', 'github'));
		ok4 = ok4 && (await next(t, f, 'online-signin')) && (await point(t, f, mode, 'signIn'));
		ok4 = ok4 && (await f.waitForFunction(() => (window.O55.S.sess.signin || {}).state === 'done', null, { timeout: 20000 }).then(() => true, () => false));
		ok4 = ok4 && (await next(t, f, 'review')) && (await next(t, f, 'creating'));
		await f.waitForTimeout(14000);
		const set = await f.evaluate(() => {
			const st = document.querySelector('#pm-o55-onboarding .pst'), b = st.querySelector('.pst-bubble'), tab = b && b.querySelector(':scope > .pst-bn');
			const blocks = [...st.querySelectorAll('.pst-prop[data-kind="block"]')].filter((p) => +p.getAttribute('opacity') > 0.05).map((p) => p.getBoundingClientRect());
			const box = b.getBoundingClientRect(), tb = tab ? tab.getBoundingClientRect() : box, bottom = Math.max(box.bottom, tb.bottom);
			const top = blocks.length ? Math.min(...blocks.map((r) => r.top)) : null;
			return { n: blocks.length, top, bottom, left: Math.min(box.left, tb.left) };
		});
		S = await result(t, f);
		await t.check(`${tag}: Creating with an online copy (four blocks) lowers them clear of the box and the PIP tab`, ok4 && set.n >= 4 && S.hits.length === 0, `${ok4 ? 'creating' : 'the online-copy route did not reach Creating'}, ${set.n} blocks, ${S.frames} frames, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
		await t.check(`${tag}: the settled four-block stack stands below the box and its tab`, set.n >= 4 && set.top >= set.bottom - 0.5, `top block at ${set.top == null ? '-' : Math.round(set.top)} px, box and tab end at ${Math.round(set.bottom)} px`);
	}
}

async function leave(t, mode) {
	for (const look of t.args.leaveLooks ? String(t.args.leaveLooks).split(',') : ['glass-dark', 'basic-light', 'friendly-light', 'retro-light', 'retro-dark']) for (const size of [[1920, 1080], [1390, 900], [860, 768], [740, 768]]) {
		const tag = `${look} ${size.join('x')} ${mode}`;
		await keepoff(t, async () => {
			const f = await openAt(t, mode, look, size, 'name');
			await nameIt(t, f);
			const ok = await next(t, f, 'safe');
			await point(t, f, mode, 'online'); await point(t, f, mode, 'back');
			await next(t, f, 'review'); await f.waitForTimeout(1500);
			return { ok, S: await result(t, f) };
		}, tag, 'Name > Safe > Add one > Back > Review: no prop under the bubble', (ok) => ok ? '' : 'did not reach Safe; ');
	}
}

async function begin(t, mode) {
	for (const look of ['glass-dark', 'basic-light']) for (const size of [[1920, 1080], [1390, 900]]) {
		const tag = `${look} ${size.join('x')} ${mode}`;
		await keepoff(t, async () => {
			const f = await openAt(t, mode, look, size, 'begin');
			await point(t, f, mode, 'pick', 'existing'); await point(t, f, mode, 'sub', 'folder');
			await point(t, f, mode, 'pick', 'new'); await point(t, f, mode, 'pick', 'existing'); await point(t, f, mode, 'pick', 'new');
			await t.page.mouse.move(4, 4, { steps: 3 }); await f.waitForTimeout(1500);
			return { S: await result(t, f) };
		}, tag, 'Begins as, folder <> New: no prop under the bubble');
	}
}

async function ring(t, mode) {
	for (const size of [[1920, 1080], [1390, 900]]) {
		const tag = `basic-light ${size.join('x')} ${mode}`;
		const f = await openAt(t, mode, 'basic-light', size, 'away');
		await point(t, f, mode, 'pick', 'anywhere'); await f.waitForTimeout(800);
		await point(t, f, mode, 'pick', 'home'); await point(t, f, mode, 'pick', 'anywhere'); await f.waitForTimeout(1200);
		const S = await result(t, f);
		await t.check(`${tag}: Away's choices: Basic's badge and its ring stay inside the visible stage`, S.rings > 0 && S.ringOut.length === 0, `${S.frames} frames, ${S.rings} ring samples, ${S.ringOut.length} outside: ${S.ringOut.slice(0, 3).join(' ; ')}`);
	}
}


// the stage's kept NieR box against a fresh measurement, in scene units (the draw oracle's rounding)
const BOXREAD = () => {
	const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
	const r4 = (b) => (b ? b.map((v) => Math.round(v * 4) / 4).join(',') : 'null');
	return { kept: r4(st.nierBox), fresh: r4(st.boxInScene(st.bubble, 6)) };
};

// Text size: the box changes size with its words, class, map and fonts unchanged (TOOLS-STAGEREST-K4). Creating's
// blocks are settled clear of the box as it was; a font-size and line-height stylesheet (as the settings' o55PaintScales
// restates .pst-bubble) grows the box, and the kept box must be re-measured and the blocks stay clear of the live one.
async function textsize(t, mode) {
	for (const look of ['nier-light', 'nier-dark']) for (const size of [[740, 768], [1920, 1080]]) {
		const tag = `${look} ${size.join('x')} ${mode} Text size`;
		const f = await openAt(t, mode, look, size, 'name');
		await nameIt(t, f);
		const reached = (await next(t, f, 'review')) && (await next(t, f, 'creating'));
		await f.waitForTimeout(8000);
		const before = await f.evaluate(BOXREAD);
		await f.evaluate(() => { const s = document.createElement('style'); s.id = 'sk-textsize'; s.textContent = '#pm-o55-onboarding .pst-bubble{font-size:17px !important;line-height:1.7 !important}'; document.head.appendChild(s); });
		await f.waitForTimeout(2500);
		const after = await f.evaluate(BOXREAD);
		const S = await result(t, f);
		await t.check(`${tag}: the kept box is re-measured after a font-size stylesheet (words, class, map and fonts unchanged)`, reached && after.kept === after.fresh, `kept ${after.kept} vs fresh ${after.fresh}; before the stylesheet: kept ${before.kept} vs fresh ${before.fresh}`);
		await t.check(`${tag}: Creating's blocks stay clear of the resized box and the PIP tab`, reached && S.blocks > 0 && S.hits.length === 0, `${reached ? 'creating' : 'did not reach Creating'}, ${S.frames} frames, ${S.blocks} block samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
	}
}
// Read landed stack blocks, NieR's kept box vs fresh boxInScene, and any overlap against bubble/tab/kept-band (no render call).
const STACKREAD = () => {
	const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
	if (!st) return null;
	const r4 = (b) => (b ? b.map((v) => Math.round(v * 4) / 4).join(',') : 'null');
	const rect = (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; };
	const meet = (a, b) => a[0] < b[2] - 0.5 && a[2] > b[0] + 0.5 && a[1] < b[3] - 0.5 && a[3] > b[1] + 0.5;
	const b = st.bubble, tab = b && b.querySelector(':scope > .pst-bn');
	const bRect = b ? rect(b) : null, tRect = tab && tab.getBoundingClientRect().width ? rect(tab) : null;
	const uRect = bRect && tRect ? [Math.min(bRect[0], tRect[0]), Math.min(bRect[1], tRect[1]), Math.max(bRect[2], tRect[2]), Math.max(bRect[3], tRect[3])] : bRect;
	const blocks = [];
	for (const pr of st.props.values()) {
		if (pr.spec.stack == null || pr.state === 'out') continue;
		const tg = st.propTarget(pr), r = rect(pr.el);
		blocks.push({
			id: pr.spec.id, stack: pr.spec.stack, landed: !!pr.landed,
			len: pr.len, target: tg.len, diff: Math.abs(pr.len - tg.len),
			rect: r, hitBubble: !!(bRect && meet(r, bRect)), hitTab: !!(tRect && meet(r, tRect)), hitBand: !!(uRect && meet(r, uRect))
		});
	}
	blocks.sort((a, c) => a.stack - c.stack);
	return {
		open: !!(window.O55 && O55.S && O55.S.open),
		screen: window.O55 && O55.S && O55.S.sess && O55.S.sess.screen,
		reduced: !!st.reduced,
		still: !!st.still(),
		dataMotion: document.documentElement.getAttribute('data-motion'),
		lowResource: !!(window.O55 && O55.motion && O55.motion.lowResource),
		raf: st.raf || 0,
		kept: r4(st.nierBox),
		fresh: r4(st.boxInScene(b, 6)),
		scale: !!document.getElementById('o55-look-scale'),
		bubble: bRect, tab: tRect, blocks
	};
};

async function clickPrimary(f, target) {
	for (let i = 0; i < 8 && (await f.evaluate(() => window.O55.S.sess.screen)) !== target; i++) {
		const btn = f.locator(`${LAYER} .o55-foot .o55-primary`).first();
		await btn.waitFor({ state: 'visible', timeout: 10000 });
		await f.waitForFunction((L) => { const b = document.querySelector(`${L} .o55-foot .o55-primary`); return !!b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }, LAYER, { timeout: 15000 });
		await btn.click({ timeout: 10000 });
		await f.waitForTimeout(900);
	}
	return (await f.evaluate(() => window.O55.S.sess.screen)) === target;
}

async function openSettingsTab(f) {
	const tab = f.locator('#tab-settings');
	if (await tab.isVisible().catch(() => false)) {
		await tab.click({ timeout: 15000 });
	} else {
		await f.locator('#pageTabsMoreBtn').click({ timeout: 10000 });
		await f.locator('#pageTabsMoreMenu .pm6-tb-pages-more-item[data-page="settings"]').click({ timeout: 10000 });
	}
	await f.locator('#pm-settings-root').first().waitFor({ timeout: 15000 });
}

async function ensureSettingsGeneral(f, sel) {
	const target = f.locator(sel).first();
	if (await target.isVisible().catch(() => false)) return target;
	const mob = f.locator('#pm-settings-root button.mobile-menu[data-action="toggle-rail"]').first();
	if (await mob.isVisible().catch(() => false)) {
		const open = await f.evaluate(() => !!document.querySelector('#pm-settings-root .pm-shell.rail-open'));
		if (!open) { await mob.click({ timeout: 10000 }); await f.waitForTimeout(350); }
	}
	await f.locator('#pm-settings-root .domain-link[data-domain="general"]').first().click({ timeout: 10000 });
	await target.waitFor({ state: 'visible', timeout: 15000 });
	return target;
}

async function typeSettingNumber(t, f, id, val) {
	const inp = await ensureSettingsGeneral(f, `#pm-settings-root input[data-setting="${id}"]`);
	await inp.scrollIntoViewIfNeeded();
	await inp.click({ timeout: 10000 });
	await t.page.keyboard.press('Control+A');
	await t.page.keyboard.type(String(val), { delay: 25 });
	await t.page.keyboard.press('Enter');
}

// Real-input Text size / Line spacing reopen routes (astra-max-18 & neon-max-18): Creating settled and parked with 3 or 4
// landed blocks -> real Close -> Settings > Text size (and optional Line spacing / Reduce animations toggle) -> open the
// bell and choose Continue optional setup -> check kept box re-measures, all landed blocks sit at their new targets clear
// of the bubble+tab band, and resizing away and back causes no jump. No CSS injection and no manual render.
async function textsizeAstra(t, mode) {
	const cases = [
		// Astra's matrix: NieR Light & Dark x 1920x1080 & 740x768 x OS Reduced Motion on & off, Text size 22, 3 blocks
		...['nier-light', 'nier-dark'].flatMap((look) => [[1920, 1080], [740, 768]].flatMap((size) => ['reduce', 'no-preference'].map((motion) => ({
			label: `${look} ${size.join('x')} ${motion === 'reduce' ? 'os-reduced' : 'motion'} 3blk fs22`,
			look, size, motion, blocks: 3, fontSize: 22, lineHeight: null, toggleReduce: false, lowResource: false
		})))),
		// neon-max-18 routes 1-3 + opus-max-18 L1 (fs24/lh2): Text size + Line spacing across all three still paths + 4-block 740x768 + 3-block 1920x1080/740x768
		{ label: 'nier-dark 1920x1080 os-reduced 3blk fs20-lh1.8', look: 'nier-dark', size: [1920, 1080], motion: 'reduce', blocks: 3, fontSize: 20, lineHeight: 1.8, toggleReduce: false, lowResource: false, live: false },
		{ label: 'nier-dark 740x768 os-reduced 4blk fs20-lh1.8', look: 'nier-dark', size: [740, 768], motion: 'reduce', blocks: 4, fontSize: 20, lineHeight: 1.8, toggleReduce: false, lowResource: false, live: false },
		{ label: 'nier-dark 740x768 os-reduced 3blk fs24-lh2', look: 'nier-dark', size: [740, 768], motion: 'reduce', blocks: 3, fontSize: 24, lineHeight: 2, toggleReduce: false, lowResource: false, live: false, chipResume: true },
		{ label: 'nier-dark 740x768 app-reduced-toggle 4blk fs20-lh1.8', look: 'nier-dark', size: [740, 768], motion: 'no-preference', blocks: 4, fontSize: 20, lineHeight: 1.8, toggleReduce: true, lowResource: false, live: false },
		{ label: 'nier-dark 740x768 low-resource 4blk fs20-lh1.8', look: 'nier-dark', size: [740, 768], motion: 'no-preference', blocks: 4, fontSize: 20, lineHeight: 1.8, toggleReduce: false, lowResource: true, live: true },
		{ label: 'nier-dark 1920x1080 low-resource 3blk fs20-lh1.8', look: 'nier-dark', size: [1920, 1080], motion: 'no-preference', blocks: 3, fontSize: 20, lineHeight: 1.8, toggleReduce: false, lowResource: true, live: true }
	];
	const filt = String(t.args.astraFilter || '');
	try {
		for (const c of filt ? cases.filter((x) => x.label.includes(filt)) : cases) {
			const [w, h] = c.size;
			const expectStill = c.motion === 'reduce' || c.toggleReduce || c.lowResource;
			const tag = `${c.label} ${mode} Text size (${c.live ? 'live parked' : 'reopen'})`;
			await t.emulate({ reducedMotion: c.motion });
			await t.viewport(w, h);
			const f = await t.app.open({ onboarding: true, query: 'o55=screen=name', sandbox: mode === 'sandbox' });
			await f.waitForFunction(() => !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
			if (c.lowResource) await f.evaluate(() => window.O55.motion.setLowResource(true, 'probe'));
			const [fam, scheme] = c.look.split('-');
			await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, scheme]);
			await f.waitForFunction((m) => document.documentElement.getAttribute('data-o55-nier') === 'on' && (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m) && !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), scheme, { timeout: 20000 }).catch(() => {});
			await f.evaluate(() => document.fonts.ready.then(() => true));
			await f.waitForTimeout(1200);
			await nameIt(t, f);
			let reached = true;
			if (c.blocks === 4) {
				reached = (await clickPrimary(f, 'safe')) && (await point(t, f, mode, 'online')) && (await point(t, f, mode, 'pick', 'github'));
				reached = reached && (await clickPrimary(f, 'online-signin')) && (await point(t, f, mode, 'signIn'));
				reached = reached && (await f.waitForFunction(() => (window.O55.S.sess.signin || {}).state === 'done', null, { timeout: 20000 }).then(() => true, () => false));
				reached = reached && (await clickPrimary(f, 'review')) && (await clickPrimary(f, 'creating'));
			} else {
				reached = (await clickPrimary(f, 'review')) && (await clickPrimary(f, 'creating'));
			}
			// Wait until Creating's commit and reveal() finish (O55.S.settling cleared, made() done), all blocks have landed at
			// their target, and created()'s mood hold has expired so a still stage has parked (raf === 0) before Close.
			const landed = reached && (await f.waitForFunction((wantBlocks) => {
				const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
				const cm = window.O55?.S?.sess?.commit;
				if (!st || window.O55?.S?.sess?.screen !== 'creating' || !cm || cm.state !== 'done' || window.O55?.S?.settling) return false;
				const bs = [...st.props.values()].filter((p) => p.spec.stack != null && p.state !== 'out');
				if (bs.length < wantBlocks || !bs.every((p) => p.landed && Math.abs(p.len - st.propTarget(p).len) < 0.5)) return false;
				if (st.t <= (st.moodUntil || 0) + 0.3) return false;
				return !st.still() || !st.raf;
			}, c.blocks, { timeout: 30000 }).then(() => true, () => false));
			await f.waitForTimeout(300);
			let scaled = false;
			if (c.live) {
				// Parked low-resource stage stays open while Text size + Line spacing scale is applied live via the host Settings setter
				await f.evaluate(([fs, lh]) => {
					window.PM12_KIMI.setSettingFromHost('general.visual.font-size', fs);
					if (lh != null) window.PM12_KIMI.setSettingFromHost('general.visual.line-height', lh);
				}, [c.fontSize, c.lineHeight]);
				scaled = await f.waitForFunction(() => !!document.getElementById('o55-look-scale'), null, { timeout: 10000 }).then(() => true, () => false);
				await f.waitForTimeout(800);
				await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return !!st && !st.raf; }, null, { timeout: 5000 }).catch(() => {});
			} else {
				// Close onboarding through its real close button
				await f.locator('#pm-o55-onboarding .o55-close').first().click({ timeout: 10000 });
				await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open') && !!document.getElementById('pm-o55-onboarding')?.hidden, null, { timeout: 15000 });
				await f.waitForTimeout(700);
				// Open Settings and apply Text size (+ optional Line spacing and Reduce animations toggle) via real input
				await openSettingsTab(f);
				if (c.toggleReduce) {
					const tog = await ensureSettingsGeneral(f, '#pm-settings-root button[data-action="toggle-setting"][data-setting="general.visual.reduce-animations"]');
					await tog.scrollIntoViewIfNeeded();
					if ((await tog.getAttribute('aria-checked')) !== 'true') await tog.click({ timeout: 10000 });
					await f.waitForFunction(() => document.documentElement.getAttribute('data-motion') === 'reduced', null, { timeout: 10000 });
				}
				await typeSettingNumber(t, f, 'general.visual.font-size', c.fontSize);
				if (c.lineHeight != null) await typeSettingNumber(t, f, 'general.visual.line-height', c.lineHeight);
				scaled = await f.waitForFunction(() => !!document.getElementById('o55-look-scale'), null, { timeout: 10000 }).then(() => true, () => false);
				// Reopen via the Finish setting up chip (opus-max-18 L1) or the notification bell's Continue optional setup
				const chip = c.chipResume ? f.locator('#o55-resume [data-o55-chip="resume"]').first() : null;
				if (chip && await chip.isVisible().catch(() => false)) {
					await chip.click({ timeout: 10000 });
				} else {
					await f.waitForFunction(() => !!(window.O55 && O55.notify && O55.notify.list && O55.notify.list().some((x) => x.id === 'pin-o55-resume')), null, { timeout: 15000 });
					if (!(await f.evaluate(() => { const p = document.getElementById('pmnPanel'); return !!p && !p.hidden; }))) await f.locator('#pmnStack').click({ timeout: 10000 });
					const row = f.locator('#pmnPanel .pmn-item[data-id="pin-o55-resume"]').first();
					await row.waitFor({ state: 'visible', timeout: 10000 });
					if ((await row.getAttribute('data-under')) !== null) { await row.click({ timeout: 10000 }); await f.waitForTimeout(400); }
					await row.locator('[data-aid="resume_pin"]').click({ timeout: 10000 });
				}
				await f.waitForFunction(() => !!(window.O55 && O55.S && O55.S.open && !document.getElementById('pm-o55-onboarding')?.hidden && document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out):not(.o55-hold)')), null, { timeout: 15000 });
				if (expectStill) {
					await f.waitForTimeout(800);
					await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return !!st && !st.raf; }, null, { timeout: 5000 }).catch(() => {});
				} else await f.waitForTimeout(2200);
			}
			const resumed = await f.evaluate(STACKREAD);
			const away = w === 1920 ? [1390, 900] : [860, 768];
			await t.viewport(away[0], away[1]);
			await f.waitForTimeout(800);
			await t.viewport(w, h);
			await f.waitForTimeout(1000);
			if (expectStill) await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return !!st && !st.raf; }, null, { timeout: 5000 }).catch(() => {});
			const after = await f.evaluate(STACKREAD);
			const maxDiff = resumed && resumed.blocks.length ? Math.max(...resumed.blocks.map((b) => b.diff)) : Infinity;
			const overlaps = resumed ? resumed.blocks.filter((b) => b.hitBubble || b.hitTab || b.hitBand).length : -1;
			const maxJump = resumed && after && resumed.blocks.length >= c.blocks && after.blocks.length === resumed.blocks.length
				? Math.max(...resumed.blocks.map((b, i) => Math.max(...b.rect.map((v, k) => Math.abs(v - after.blocks[i].rect[k])))))
				: Infinity;
			const afterDiff = after && after.blocks.length ? Math.max(...after.blocks.map((b) => b.diff)) : Infinity;
			const pathOk = c.toggleReduce ? resumed?.dataMotion === 'reduced' && resumed?.reduced === true : c.lowResource ? resumed?.lowResource === true && resumed?.still === true && resumed?.reduced === false : resumed?.reduced === (c.motion === 'reduce');
			t.log(`${tag}: resumed kept=${resumed?.kept} fresh=${resumed?.fresh} still=${resumed?.still} reduced=${resumed?.reduced} motion=${resumed?.dataMotion} lowRes=${resumed?.lowResource} raf=${resumed?.raf} maxDiff=${maxDiff.toFixed(3)} overlaps=${overlaps} maxJump=${maxJump.toFixed(2)}px afterDiff=${afterDiff.toFixed(3)}`);
			await t.check(
				`${tag}: kept box re-measured and landed blocks sit at their new targets clear of the box`,
				landed && scaled && !!resumed && resumed.open && resumed.screen === 'creating' && pathOk && (!expectStill || resumed.raf === 0) && resumed.kept === resumed.fresh && resumed.blocks.length >= c.blocks && resumed.blocks.every((b) => b.landed) && maxDiff <= 0.5 && overlaps === 0,
				`landed=${landed}, scaled=${scaled}, pathOk=${pathOk}, still=${resumed?.still}, raf=${resumed?.raf}, kept=${resumed?.kept} vs fresh=${resumed?.fresh}, maxDiff=${maxDiff.toFixed(3)}, overlaps=${overlaps}`
			);
			await t.check(
				`${tag}: landed blocks do not jump on a resize away and back`,
				landed && scaled && !!resumed && !!after && resumed.blocks.length >= c.blocks && after.blocks.length === resumed.blocks.length && maxJump <= 1.0 && afterDiff <= 0.5,
				`maxJump=${maxJump.toFixed(2)}px (resumed top ${resumed?.blocks?.[0]?.rect?.[1]?.toFixed(2)} vs after ${after?.blocks?.[0]?.rect?.[1]?.toFixed(2)}), afterDiff=${afterDiff.toFixed(3)}`
			);
			await t.app.resetLayout(t);
		}
	} finally {
		await t.emulate({ reducedMotion: null });
	}
}
// Live Reduced Motion transition completion (FO-S3 round 3, astra-rejudge-18):
// (1) Queued speech: on 'Keep your work safe', Tab from Git to Jujutsu and turn on Reduced Motion while the Jujutsu
//     line is queued (st.sayNext != null). The queued line must be delivered at once (not discarded by sayKept).
// (2) Mid-face-change: hover 'Add one' on 'Keep your work safe' and turn on Reduced Motion while Pip's expression swap
//     is mid-transition (faceOut attached / faceEl hidden). The swap must finish cleanly (1 face, visible, no transforms).
async function liveReduced(t, mode) {
	const modes = [
		{ kind: 'os', on: () => t.emulate({ reducedMotion: 'reduce' }), off: () => t.emulate({ reducedMotion: 'no-preference' }) },
		{ kind: 'app', on: (f) => f.evaluate(() => document.documentElement.setAttribute('data-motion', 'reduced')), off: (f) => f.evaluate(() => document.documentElement.removeAttribute('data-motion')) }
	];
	try {
		for (const tr of modes) {
			// --- Route (1): Queued speech on Keep your work safe (Tab Git -> Jujutsu -> live Reduced Motion) ---
			{
				const tag = `nier-dark 1920x1080 ${mode} live-reduced (${tr.kind}) queued speech`;
				await t.emulate({ reducedMotion: 'no-preference' });
				await t.viewport(1920, 1080);
				const f = await t.app.open({ onboarding: true, query: 'o55=screen=safe', sandbox: mode === 'sandbox' });
				await f.waitForFunction(() => !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
				await f.evaluate(() => window.O55.ui.applyLook('nier', 'dark'));
				await f.waitForFunction(() => document.documentElement.getAttribute('data-o55-nier') === 'on' && !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 20000 }).catch(() => {});
				await f.evaluate(() => document.fonts.ready.then(() => true));
				await f.waitForFunction(() => {
					const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					return !!st && !!st.saying && !st.bubble.classList.contains('typing') && !st.reduced;
				}, null, { timeout: 15000 });
				await t.page.mouse.move(2, 2);
				await f.waitForTimeout(500);
				// Real keyboard Tab until Git is focused, then immediately Tab to Jujutsu so Jujutsu's line queues in st.sayNext
				let onGit = false;
				for (let i = 0; i < 40 && !onGit; i++) {
					await t.page.keyboard.press('Tab');
					await f.waitForTimeout(60);
					onGit = await f.evaluate(() => {
						const a = document.activeElement;
						return !!a && a.getAttribute('data-o55-do') === 'backend' && a.getAttribute('data-arg') === 'git';
					});
				}
				await f.waitForFunction(() => {
					const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					return !!st && /Git/i.test(st.saying || '');
				}, null, { timeout: 5000 }).catch(() => {});
				await t.page.keyboard.press('Tab');
				const pre = await f.evaluate(() => {
					const a = document.activeElement, st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					return {
						onJujutsu: !!a && a.getAttribute('data-o55-do') === 'backend' && a.getAttribute('data-arg') === 'jujutsu',
						saying: st ? st.saying : '',
						queued: st && st.sayNext ? st.sayNext[0] : ''
					};
				});
				await tr.on(f);
				const readSpeech = () => {
					const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					const onEl = st && st.bubble && st.bubble.querySelector('.pst-bt-on');
					return {
						saying: st ? st.saying : '',
						queued: st && st.sayNext ? st.sayNext[0] : null,
						shown: onEl ? onEl.textContent : '',
						typing: !!(st && st.bubble && st.bubble.classList.contains('typing')),
						app: !!(window.O55 && O55.motion && O55.motion.reduced && O55.motion.reduced()),
						reduced: !!(st && st.reduced),
						dom: st && st.root ? st.root.dataset.reduced : null,
						still: !!(st && st.still && st.still()),
						raf: st ? st.raf || 0 : null
					};
				};
				await f.waitForTimeout(300);
				await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return !!st && st.reduced && !st.raf; }, null, { timeout: 1000 }).catch(() => {});
				const atSwitch = await f.evaluate(readSpeech);
				await f.waitForTimeout(2400);
				const later = await f.evaluate(readSpeech);
				await tr.off(f);
				const wantLine = pre.queued || 'Jujutsu. Mistakes undo easily.';
				const okPre = onGit && pre.onJujutsu && /Jujutsu/i.test(pre.queued);
				const okState = (s) => s.app && s.reduced && s.dom === '1' && s.still && s.raf === 0 && !s.typing && s.queued === null && s.saying === wantLine && s.shown === wantLine;
				t.log(`${tag}: pre=${JSON.stringify({ onGit, ...pre })} switch=${JSON.stringify(atSwitch)} later=${JSON.stringify(later)}`);
				await t.check(`${tag}: queued Jujutsu line is delivered at once and persists after 2.4 s`, okPre && okState(atSwitch) && okState(later), `pre=${JSON.stringify({ onGit, ...pre })} switch=${JSON.stringify(atSwitch)} later=${JSON.stringify(later)}`);
			}
			// --- Route (2): Mid-face-change on Keep your work safe (hover Add one -> live Reduced Motion during swap) ---
			{
				const tag = `nier-dark 1920x1080 ${mode} live-reduced (${tr.kind}) face swap`;
				await t.emulate({ reducedMotion: 'no-preference' });
				await t.viewport(1920, 1080);
				const f = await t.app.open({ onboarding: true, query: 'o55=screen=safe', sandbox: mode === 'sandbox' });
				await f.waitForFunction(() => !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
				await f.evaluate(() => window.O55.ui.applyLook('nier', 'dark'));
				await f.waitForFunction(() => document.documentElement.getAttribute('data-o55-nier') === 'on' && !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 20000 }).catch(() => {});
				await f.evaluate(() => document.fonts.ready.then(() => true));
				await f.waitForFunction(() => {
					const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					return !!st && st.curMood === 'idle' && !st.faceOut && st.faceT0 == null && !st.reduced;
				}, null, { timeout: 15000 });
				await t.page.mouse.move(2, 2);
				await f.waitForTimeout(400);
				let sawMid = false;
				for (let attempt = 0; attempt < 3 && !sawMid; attempt++) {
					if (attempt > 0) {
						await tr.off(f);
						await t.page.mouse.move(2, 2);
						await f.waitForFunction(() => {
							const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
							return !!st && !st.reduced && st.curMood === 'idle' && !st.faceOut && st.faceT0 == null;
						}, null, { timeout: 5000 }).catch(() => {});
						await f.waitForTimeout(300);
					}
					const onlineBtn = f.locator(`${LAYER} [data-o55-do="online"]`).first();
					await onlineBtn.waitFor({ state: 'visible', timeout: 10000 });
					await onlineBtn.hover();
					const caught = await f.waitForFunction(() => {
						const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
						return !!st && !!st.faceOut && st.faceT0 != null && st.curMood !== 'idle' && !st.moodOverride;
					}, null, { timeout: 5000, polling: 'raf' }).then(() => true, () => false);
					if (!caught) continue;
					await tr.on(f);
					sawMid = true;
					t.log(`${tag} attempt ${attempt + 1}: caughtMidFace=true`);
				}
				const readFace = () => {
					const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage;
					const parts = st && st.faceEl ? [...st.faceEl.querySelectorAll('.pst-part')].map((w) => w.getAttribute('transform')) : [];
					return {
						cur: st ? st.curMood : null,
						app: !!(window.O55 && O55.motion && O55.motion.reduced && O55.motion.reduced()),
						reduced: !!(st && st.reduced),
						dom: st && st.root ? st.root.dataset.reduced : null,
						still: !!(st && st.still && st.still()),
						raf: st ? st.raf || 0 : null,
						faceOut: !!(st && st.faceOut),
						faceT0: st ? st.faceT0 : -1,
						faceV: st ? st.faceV : -1,
						faceCount: st && st.gHead ? st.gHead.querySelectorAll(':scope > .pst-face').length : -1,
						currentHidden: st && st.faceEl ? st.faceEl.getAttribute('visibility') : 'missing',
						partTransforms: parts
					};
				};
				await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return !!st && st.reduced && !st.raf; }, null, { timeout: 1000 }).catch(() => {});
				const atSwitch = await f.evaluate(readFace);
				await f.waitForTimeout(2000);
				const parked = await f.evaluate(readFace);
				await tr.off(f);
				const okFace = (s) => s.app && s.reduced && s.dom === '1' && s.still && s.raf === 0 && s.cur === 'watch' && !s.faceOut && s.faceT0 === null && s.faceV === 1 && s.faceCount === 1 && s.currentHidden === null && s.partTransforms.length > 0 && s.partTransforms.every((x) => x === null);
				t.log(`${tag}: sawMid=${sawMid} switch=${JSON.stringify(atSwitch)} parked=${JSON.stringify(parked)}`);
				await t.check(`${tag}: mid-swap Reduced Motion completes the face swap cleanly (1 visible face, no stale transforms) and stays settled after 2 s`, sawMid && okFace(atSwitch) && okFace(parked), `sawMid=${sawMid} switch=${JSON.stringify(atSwitch)} parked=${JSON.stringify(parked)}`);
			}
		}
	} finally {
		await t.emulate({ reducedMotion: null });
	}
}
const all = (mode) => async (t) => {
	if (want(t, 'nier')) await nier(t, mode);
	if (want(t, 'leave')) await leave(t, mode);
	if (want(t, 'begin')) await begin(t, mode);
	if (want(t, 'ring')) await ring(t, mode);
	if (want(t, 'textsize')) await textsize(t, mode);
	if (want(t, 'textsize') || want(t, 'textsize-astra')) await textsizeAstra(t, mode);
	if (want(t, 'live-reduced')) await liveReduced(t, mode);
};
export const tests = {
	'stage keep-off, normal page': on('normal', all('normal')),
	'stage keep-off, sandbox': on('sandbox', all('sandbox'))
};
