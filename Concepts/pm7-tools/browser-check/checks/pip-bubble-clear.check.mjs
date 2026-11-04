// FO-59 (Astra's welcome review, new finding 2): Pip's speech bubble keeps off Pip, its control bar included. The bubble
// is placed clear of Pip's face and of the props (58-rig.js placeBubble); where a prop beside Pip took its usual place,
// the fallback could go up over the control bar Pip hangs from (Retro Dark's Look, 'Soft and cosy. I like it.'; Computer
// after a Server hover). The bar is now one of the bubble's obstacles.
// Astra's route, in each of the ten looks at 1920x1080: Look; Computer (Where), then a Server card hovered, then pressed,
// then This computer; Name with a name typed; Review. In each state every frame for about a second is read at its end
// (a ResizeObserver, after the frame's callbacks, the last thing before paint): the shown bubble (opacity over 0.05, with
// words; NieR's dialogue box at the stage's foot is not placed by the stage and is left out) must overlap neither Pip's
// head nor its control bar as painted (2 px tolerance). `--set looks=a,b`; `--set sandbox=1` for T3's sandbox;
// `--set motion=reduce`; `--set size=740x900` (headless). Headless or `--record`. About 3 minutes.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const FRAMES = 60;

function installSampler() {
	if (window.__pbc) return;
	const S = window.__pbc = { on: false, left: 0, frames: [] };
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	const box = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
	new ResizeObserver(() => {
		if (!S.on) return;
		const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
		const fr = { t: Math.round(performance.now()) };
		if (st && !st.dead && st.gHead && st.gHead.isConnected) {
			const b = st.bubble, cs = getComputedStyle(b);
			fr.nier = st.famName === 'nier' ? 1 : 0;
			fr.shown = +cs.opacity > 0.05 && cs.visibility !== 'hidden' && /\S/.test(b.textContent || '') ? 1 : 0;
			fr.text = (b.textContent || '').trim().slice(0, 40);
			fr.b = box(b); fr.h = box(st.gHead); fr.c = st.gCtl ? box(st.gCtl) : null;
		} else fr.none = 1;
		S.frames.push(fr);
		if (--S.left <= 0) { S.on = false; const done = S.done; S.done = null; if (done) done(S.frames); }
	}).observe(d);
}
const arm = (f, n) => f.evaluate((k) => { const S = window.__pbc; S.frames = []; S.left = k; S.on = true; S.p = new Promise((res) => { S.done = res; }); }, n);
const collect = (f) => f.evaluate(() => window.__pbc.p);
const hit = (a, b, g = 2) => !!(a && b) && a[0] + g < b[2] && b[0] + g < a[2] && a[1] + g < b[3] && b[1] + g < a[3];

export default async function (t) {
	// --set size=740x900: the narrow strip or the short one (headless: a recording keeps 1920x1080)
	const size = /^(\d+)x(\d+)$/.exec(String(t.args.size || ''));
	if (size) await t.viewport(+size[1], +size[2]);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.gHead); }, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
	await f.evaluate(installSampler);
	t.log(`window ${await t.page.evaluate(() => innerWidth + 'x' + innerHeight)}, stage layout ${await f.evaluate(() => document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.layoutName)}`);
	const quiet = () => f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});
	const go = async (id) => { await f.evaluate((sid) => window.O55.ui.go(sid, { noHistory: true }), id); await quiet(); await f.waitForTimeout(500); return f.evaluate(() => window.O55.S.sess.screen); };
	const bad = [], rows = [];
	let states = 0, shownFrames = 0;
	const watch = async (label, act) => {
		await arm(f, FRAMES);
		t.mark(label);
		if (act) await act();
		const fr = (await collect(f)).filter((x) => !x.none);
		states++;
		const over = fr.filter((x) => x.shown && !x.nier && (hit(x.b, x.h) || hit(x.b, x.c)));
		shownFrames += fr.filter((x) => x.shown && !x.nier).length;
		rows.push(`${label}: ${fr.length} frames, bubble shown in ${fr.filter((x) => x.shown).length}${over.length ? `; over Pip in ${over.length} ('${over[0].text}' bubble ${over[0].b} head ${over[0].h} bar ${over[0].c})` : ''}`);
		if (over.length) bad.push(`${label}: ${over.length} frame(s), '${over[0].text}' ${hit(over[0].b, over[0].c) ? 'over the control bar' : 'over the head'}`);
	};
	for (const look of (t.args.looks ? String(t.args.looks).split(',') : LOOKS)) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await quiet(); await f.waitForTimeout(900);
		for (const screen of ['look', 'where', 'name', 'review']) {
			const at = await go(screen);
			if (at !== screen) { rows.push(`${look} ${screen}: not opened (${at})`); continue; }
			await watch(`${look} ${screen} idle`);
			if (screen === 'where') {
				const card = f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="pick"][data-arg="server"]');
				await watch(`${look} hover Server`, async () => { await card.hover(); });
				await watch(`${look} hover Server, settled`);
				await watch(`${look} press Server`, async () => { await card.click(); });
				await watch(`${look} press Server, settled`);
				await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="pick"][data-arg="this"]').click();
				await f.waitForTimeout(600);
			}
			if (screen === 'name') await watch(`${look} name typed`, async () => { await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) input').first().fill('Orchard'); });
		}
	}
	rows.forEach((r) => t.log(r));
	await t.check(`FO-59: the bubble overlaps neither Pip's head nor its control bar in any frame (${states} states, ${shownFrames} frames with the bubble shown)`, states > 0 && shownFrames > 0 && bad.length === 0, bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` (+${bad.length - 8} more)` : ''));
}
