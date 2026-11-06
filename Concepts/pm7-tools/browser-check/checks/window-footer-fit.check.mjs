// FO88-N2 (opus-recheck-b7d): every control in the onboarding window's footer stays inside the window at every width.
// A footer button with a ? of its own (Ready's Tour and Enter, Welcome's Skip) sits with it in an .o55-opt-foot wrapper,
// which the footer's shrink and wrap rules (10-window.css) did not reach: between 808 and about 950 wide, the wide window
// beside its stage, c-ready's and Ready's footer ran past the window, Take the Guided Tour cut 25-99 px and its ? outside
// it, in every look, on both surfaces (0fcd815fec and 457801b0f6 alike).
// Screens: those whose footer, laid out at 1100 wide in Retro Light (mono capitals, among the widest), needs more than
// 380 px (the footer's room in the wide window at 808 is about 397 px), and c-ready always; --set screens= picks some.
// In each of the ten looks, each screen opened fresh at 1100x900, the window then narrowed in 10 px steps to 740
// (--set from=, to=, step=). At each width, once laid out: every footer control (its buttons, their ?, Back) lies inside
// the window's visible box (the window cut by the viewport, 1 px), no label spills out of its button, and no footer
// button's text is drawn smaller than at 1100 (the fix may wrap a label, never shrink it). Both surfaces (--set sandbox
// picks one). Headless, or --record with --set looks=<one> --set screens=c-ready for a film of the sweep (the window's
// size stays, the page is held in a frame; each width is marked).
//   browser-check run Concepts/pm7-tools/browser-check/checks/window-footer-fit.check.mjs --set page=<build>
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// the footer as laid out now: its controls and how far each reaches past the window's visible box
const READ = () => {
	const root = document.getElementById('pm-o55-onboarding'), win = root && root.querySelector('.o55-win');
	const layer = root && root.querySelector('.o55-layer:not(.o55-out)'), foot = layer && layer.querySelector('.o55-foot');
	if (!foot || !win) return { none: true };
	const w = win.getBoundingClientRect(), v = [Math.max(w.left, 0), Math.max(w.top, 0), Math.min(w.right, innerWidth), Math.min(w.bottom, innerHeight)];
	const ctl = [...foot.querySelectorAll('button, a[href], [role="button"]')].filter((b) => b.getClientRects().length && b.getBoundingClientRect().width > 0 && getComputedStyle(b).visibility !== 'hidden');
	return {
		w: innerWidth, lay: root.getAttribute('data-o55-layout'),
		ctl: ctl.map((b) => {
			const r = b.getBoundingClientRect();
			return { name: (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24) || '?', past: Math.max(0, v[0] - r.left, r.right - v[2], v[1] - r.top, r.bottom - v[3]), spill: Math.max(0, b.scrollWidth - b.clientWidth), font: parseFloat(getComputedStyle(b).fontSize), lines: Math.round(r.height) };
		})
	};
};
// the footer's own width when nothing has to shrink: its padding, its controls and the gaps between them (the grow spacer
// excluded)
const NATURAL = () => {
	const layer = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out)'), foot = layer && layer.querySelector('.o55-foot');
	if (!foot) return 0;
	const cs = getComputedStyle(foot), kids = [...foot.children].filter((k) => !k.classList.contains('o55-footgrow') && k.getClientRects().length);
	const gap = parseFloat(cs.columnGap) || 0;
	return Math.round(parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + kids.reduce((a, k) => a + k.getBoundingClientRect().width, 0) + gap * Math.max(0, kids.length - 1));
};

async function open(t, f, screen) {
	await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), screen);
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot'), null, { timeout: 15000 }).catch(() => {});
	await f.waitForTimeout(450);
}
const frames = (f, n) => f.evaluate((k) => new Promise((res) => { let i = 0; const s = () => (++i >= k ? res() : requestAnimationFrame(s)); requestAnimationFrame(s); }), n);

async function run(t, mode) {
	const from = +t.args.from || 1100, to = +t.args.to || 740, step = +t.args.step || 10;
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	await t.viewport(from, 900);
	let f = await t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	// the screens with wide footers, chosen in Retro Light at the widest size
	let screens = t.args.screens ? String(t.args.screens).split(',') : null;
	if (!screens) {
		await f.evaluate(() => window.O55.ui.applyLook('retro', 'light')); await f.waitForTimeout(800);
		screens = ['c-ready'];
		for (const s of await f.evaluate(() => Object.keys(window.O55.screens.defs))) {
			await open(t, f, s);
			const now = await f.evaluate(() => window.O55.S.sess.screen), n = await f.evaluate(NATURAL);
			if (now === s && n > 380 && !screens.includes(s)) screens.push(s);
		}
		t.log(`${mode}: screens with wide footers (over 380 px at ${from} in Retro Light): ${screens.join(' ')}`);
	}
	await t.check(`${mode}: screens to judge`, screens.length > 1, screens.join(' '));
	for (const look of looks) {
		await t.viewport(from, 900);
		f = await t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
		await t.emulate({ reducedMotion: 'no-preference' });
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), look.split('-'));
		await f.waitForTimeout(800);
		for (const screen of screens) {
			await t.viewport(from, 900);
			await open(t, f, screen);
			const now = await f.evaluate(() => window.O55.S.sess.screen);
			const tag = `${mode} ${look} ${screen}`;
			if (now !== screen) { await t.check(`${tag}: opens as itself`, false, `opened as ${now}`); continue; }
			const base = await f.evaluate(READ);
			const font = Object.fromEntries((base.ctl || []).map((c) => [c.name, c.font]));
			const bad = [];
			let widths = 0;
			for (let w = from; w >= to; w -= step) {
				await t.viewport(w, 900);
				await t.mark(`${look} ${screen} ${w}`);
				await frames(f, 2);
				const r = await f.evaluate(READ);
				if (r.none) { bad.push({ w, err: 'no footer' }); continue; }
				widths++;
				for (const c of r.ctl) {
					const smaller = font[c.name] != null && c.font < font[c.name] - .01;
					if (c.past > 1 || c.spill > 1 || smaller) bad.push({ w, lay: r.lay, ctl: c.name, past: Math.round(c.past), spill: c.spill, font: smaller ? `${c.font} < ${font[c.name]}` : undefined });
				}
			}
			const why = JSON.stringify({ widths, failures: bad.length, first: bad.slice(0, 4), controls: (base.ctl || []).map((c) => c.name) });
			await t.check(`${tag}: footer read at every width ${from}-${to}`, widths === Math.floor((from - to) / step) + 1, why);
			await t.check(`${tag}: every footer control inside the window, its label inside its button, at its own size, ${from}-${to} wide`, bad.length === 0, why);
			if (bad.length) { await t.viewport(bad[0].w, 900); await frames(f, 2); await t.inFrame(f, () => t.crop(`foot-${mode}-${look}-${screen}-${bad[0].w}`, '#pm-o55-onboarding .o55-win', `${tag} at ${bad[0].w}: ${bad[0].ctl} ${bad[0].past} px past the window`)); }
			else t.log(`${tag}: ${why}`);
		}
	}
	// what it looks like where it was cut (the wide window at 860 and 810): for review
	if (!t.args.film) for (const [w, look] of [[860, looks[0]], [810, looks[looks.length - 1]]]) {
		await t.viewport(w, 900);
		f = await t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), look.split('-')); await f.waitForTimeout(800);
		await open(t, f, 'c-ready');
		if (mode === 'normal') await t.inFrame(f, () => t.crop(`c-ready-foot-${look}-${w}`, '#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot', `${look} c-ready footer at ${w}x900`));
	}
	await t.viewport(1920, 1080);
}

export const tests = {
	'footer fits normal': on('normal', run),
	'footer fits sandbox': on('sandbox', run)
};
