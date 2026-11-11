// PERF-2 (Jared's choice B, 2026-11-11: "plain dimmed background on every computer"): while the onboarding window is
// open the app beneath it is not drawn; the scrim lies over the page's own ground (the solid backdrop, 60-ui-core.js,
// 10-window.css). Before, only a computer measured too slow over the window's first opening got it, and every redraw of
// Pip re-sorted the layers of the whole app beneath (pm7-perf lane G's in-page trial: layer work 214 -> 54 ms a second in
// Basic, 259 -> 86 in Glass). On a computer with a GPU main keeps the live app beneath, so main fails here.
//
// All ten looks (the window's own look, O55.ui.applyLook), on Welcome, 1920x1080, both surfaces:
//   open    once the opening has settled: data-o55-solid is on <html>, every part of the app beneath (body >
//           [data-o55-held]) computes visibility: hidden, and no element inside one computes visibility: visible with a
//           box (one that set visibility: visible would still be drawn);
//   close   in the first frame after the window starts to close the app is drawn again (data-o55-solid gone, the parts
//           visible), and nothing of it stays hidden once the window has gone;
//   tour    the Guided Tour, whose subject is the app, never has it: no data-o55-solid while the tour runs.
// --set looks=<a,b>   default all ten
// --set selftest=live  turns the solid backdrop off through O55.solid.set(false) before each opening: must fail
const ALL = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

const BENEATH = () => {
	const parts = [...document.querySelectorAll('body > [data-o55-held]')];
	let drawn = 0; const eg = [];
	for (const p of parts) {
		if (getComputedStyle(p).visibility !== 'hidden') { drawn++; if (eg.length < 4) eg.push(p.id || p.className || p.tagName); continue; }
		for (const el of p.querySelectorAll('*')) {
			if (getComputedStyle(el).visibility === 'hidden') continue;
			const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
			drawn++; if (eg.length < 4) eg.push((el.id ? '#' + el.id : el.tagName.toLowerCase()) + (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\s+/)[0] : ''));
			if (drawn > 40) break;
		}
	}
	return { solid: document.documentElement.hasAttribute('data-o55-solid'), open: document.documentElement.hasAttribute('data-o55-open'), parts: parts.length, drawn, eg };
};

export default async function (t) {
	const looks = t.args.looks ? String(t.args.looks).split(',').filter(Boolean) : ALL;
	for (const surface of t.app.surfaces()) {
		await t.viewport(1920, 1080);
		const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome&pm-warm=0', sandbox: surface === 'sandbox' });
		await f.waitForFunction(() => window.O55?.S?.open, null, { timeout: 30000 });
		const settled = () => f.waitForFunction(() => { const r = document.querySelector('#pm-o55-onboarding'); return r && !r.classList.contains('o55-opening') && !r.classList.contains('o55-hold') && !(window.O55.nierLook && O55.nierLook.busy && O55.nierLook.busy()); }, null, { timeout: 20000 }).catch(() => {});
		for (const look of looks) {
			const at = `${look} ${surface}`;
			// the window opened again in this look: closed, the look chosen, opened
			await f.evaluate(() => { if (O55.S.open) O55.ui.close('close'); });
			await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).catch(() => {});
			if (t.args.selftest === 'live') await f.evaluate(() => O55.solid.set(false));
			await f.evaluate(() => O55.ui.open({ screen: 'welcome' }));
			await f.waitForFunction(() => window.O55?.S?.open && document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 });
			await f.evaluate((v) => { O55.S.lookOpen = false; O55.ui.applyLook(...v); }, look.split('-'));
			await t.page.waitForTimeout(1200);
			await settled();
			const o = await f.evaluate(BENEATH);
			await t.check(`${at}: with the window open the app beneath is not drawn`, o.open && o.solid && o.parts > 0 && o.drawn === 0,
				`data-o55-solid ${o.solid ? 'on' : 'off'}, ${o.parts} parts beneath, ${o.drawn} drawn${o.eg.length ? ': ' + o.eg.join(', ') : ''}`);
			// close: the frame after the close starts, and after the window has gone
			await f.evaluate(`window.__plainBeneath = ${BENEATH.toString()};`);
			const c = await f.evaluate(() => new Promise((resolve) => { O55.ui.close('close'); requestAnimationFrame(() => resolve(window.__plainBeneath())); }));
			await t.check(`${at}: the app is drawn again in the first frame after the window starts to close`, !c.solid && (c.parts === 0 || c.drawn > 0),
				`data-o55-solid ${c.solid ? 'on' : 'off'}, ${c.parts} parts still marked, ${c.drawn} drawn`);
			await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).catch(() => {});
			const gone = await f.evaluate(() => ({ solid: document.documentElement.hasAttribute('data-o55-solid'), held: document.querySelectorAll('body > [data-o55-held]').length, hidden: [...document.querySelectorAll('body > *')].filter((e) => getComputedStyle(e).visibility === 'hidden' && e.id !== 'pm-o55-onboarding' && e.getBoundingClientRect().width > 0).length }));
			await t.check(`${at}: once the window has gone nothing of the app stays hidden`, !gone.solid && gone.held === 0, `data-o55-solid ${gone.solid ? 'on' : 'off'}, ${gone.held} parts still marked, ${gone.hidden} top-level boxes hidden`);
			if (t.args.selftest === 'live') await f.evaluate(() => O55.solid.set(null));
		}
		// the Guided Tour never has it
		await f.evaluate(() => O55.tour.start({ fresh: true }));
		await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-tour'), null, { timeout: 20000 }).catch(() => {});
		await t.page.waitForTimeout(1500);
		const tour = await f.evaluate(() => ({ tour: document.documentElement.hasAttribute('data-o55-tour'), solid: document.documentElement.hasAttribute('data-o55-solid') }));
		await t.check(`${surface}: the Guided Tour runs over the app drawn (no solid backdrop)`, tour.tour && !tour.solid, `tour ${tour.tour ? 'on' : 'off'}, data-o55-solid ${tour.solid ? 'on' : 'off'}`);
		await f.evaluate(() => O55.tour.skip && O55.tour.skip()).catch(() => {});
	}
}
