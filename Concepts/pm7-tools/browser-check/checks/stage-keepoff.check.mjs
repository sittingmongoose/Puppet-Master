// Pip's stage keeps its props off the speech box, and its effects inside the pane, in every frame of a transition (stream F
// lane stage, 2026-11-04; FO-34, FO-35, FO-39 and the NieR Creating 740 carry). A sampler reads, on each animation frame,
// every prop that shows (opacity over .05), the speech box (the bubble, or NieR's fixed box with its PIP tab) and Basic's
// confirmation ring, and fails on:
//  - NieR Light and Dark at 740x768 (the banner: NieR's box at the top over the props' column): a prop under the box or
//    its PIP tab while Safe's Add one is hovered and left, Add one is pressed and Back is pressed, Safe with an online copy
//    settles (the cloud), and Creating lowers its blocks (each went down behind the tab and the box);
//  - Glass Dark, Basic Light, Friendly Light and Retro Dark at 1920x1080, 1390x900 and 860x768: a prop under the bubble
//    on Name > Safe > Add one > Back > Review (a leaving prop rose through the bubble, or the next words' bubble moved onto
//    a prop still fading out);
//  - Glass Dark and Basic Light at 1920x1080 and 1390x900, Begins as: an existing folder picked, then New, then the folder
//    again, then New (AST3: the folder leaving went behind the new words' bubble for 11 frames);
//  - Basic Light at 1920x1080 and 1390x900: Basic's check badge or the ring spreading from it past the stage's visible
//    box (the pane, cut by its clipping parents) when a choice on Away from home is made (the globe hangs at the pane's
//    right edge; AST4's key ring was cut there).
// Geometry from the page, not pixels: films cover the motion claims (lane report). Every case also fails if it sampled
// no frames, or never saw what it is about (a leaving prop, a block, a ring). Both surfaces unless --set sandbox picks one.
// --set only=nier|leave|begin|ring runs one group. About 6 minutes per surface.
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

async function nier(t, mode) {
	for (const look of ['nier-light', 'nier-dark']) {
		const tag = `${look} 740x768 ${mode}`;
		let f = await openAt(t, mode, look, [740, 768], 'safe');
		await point(t, f, mode, 'online', null, false);            // Add one hovered: the cloud's preview comes in
		await t.page.mouse.move(4, 4, { steps: 3 }); await f.waitForTimeout(2000);
		await point(t, f, mode, 'online');                        // pressed: Safe's vault leaves, the service's mark comes in
		await point(t, f, mode, 'back');                          // and back
		// Safe with an online copy chosen (state: the draft's online copy, as the service screen's Continue leaves it)
		await f.evaluate(() => { const d = window.O55.S.sess.drafts.main; d.online_mode = 'new'; d.forge = 'github'; window.O55.ui.go('safe', { noHistory: true }); });
		await f.waitForTimeout(3500);
		let S = await result(t, f);
		await t.check(`${tag}: Safe's Add one, Back and the settled cloud: no prop under the box or the PIP tab`, S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
		f = await openAt(t, mode, look, [740, 768], 'name');
		await nameIt(t, f);
		const reached = (await next(t, f, 'review')) && (await next(t, f, 'creating'));
		await f.waitForTimeout(8000);
		S = await result(t, f);
		await t.check(`${tag}: Creating lowers its blocks clear of the box and the PIP tab`, reached && S.blocks > 0 && S.hits.length === 0, `${reached ? 'creating' : 'did not reach Creating'}, ${S.frames} frames, ${S.blocks} block samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
	}
}

async function leave(t, mode) {
	for (const look of ['glass-dark', 'basic-light', 'friendly-light', 'retro-dark']) for (const size of [[1920, 1080], [1390, 900], [860, 768]]) {
		const tag = `${look} ${size.join('x')} ${mode}`;
		const f = await openAt(t, mode, look, size, 'name');
		await nameIt(t, f);
		const ok = await next(t, f, 'safe');
		await point(t, f, mode, 'online'); await point(t, f, mode, 'back');
		await next(t, f, 'review'); await f.waitForTimeout(1500);
		const S = await result(t, f);
		await t.check(`${tag}: Name > Safe > Add one > Back > Review: no prop under the bubble`, ok && S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${ok ? '' : 'did not reach Safe; '}${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
	}
}

async function begin(t, mode) {
	for (const look of ['glass-dark', 'basic-light']) for (const size of [[1920, 1080], [1390, 900]]) {
		const tag = `${look} ${size.join('x')} ${mode}`;
		const f = await openAt(t, mode, look, size, 'begin');
		await point(t, f, mode, 'pick', 'existing'); await point(t, f, mode, 'sub', 'folder');
		await point(t, f, mode, 'pick', 'new'); await point(t, f, mode, 'pick', 'existing'); await point(t, f, mode, 'pick', 'new');
		await t.page.mouse.move(4, 4, { steps: 3 }); await f.waitForTimeout(1500);
		const S = await result(t, f);
		await t.check(`${tag}: Begins as, folder <> New: no prop under the bubble`, S.frames > 200 && S.leaving > 0 && S.hits.length === 0, `${S.frames} frames, ${S.leaving} leaving samples, ${S.hits.length} overlaps: ${S.hits.slice(0, 3).join(' ; ')}`);
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

const all = (mode) => async (t) => {
	if (want(t, 'nier')) await nier(t, mode);
	if (want(t, 'leave')) await leave(t, mode);
	if (want(t, 'begin')) await begin(t, mode);
	if (want(t, 'ring')) await ring(t, mode);
};
export const tests = {
	'stage keep-off, normal page': on('normal', all('normal')),
	'stage keep-off, sandbox': on('sandbox', all('sandbox'))
};
