// Captures the "Today" crops for Concepts/selector-indicator-concepts: the selected-state indicator as the product draws it
// now, in Basic, Friendly and Glass, light and dark, at device scale 2, in four places: the title bar's page tabs, the left
// rail's file tabs, the onboarding step rail (Project current) and the onboarding chosen option (Project step, "Start a new
// Project"). Run from the repository root on a private build:
//   browser-check run Concepts/selector-indicator-concepts/tools/capture-today.check.mjs \
//     --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=<build>.html --out <run folder>
// then copy <run folder>/crops/*.png to Concepts/selector-indicator-concepts/assets/today/ (tools/build.py names them).
const LOOKS = ['glass-light', 'glass-dark', 'friendly-light', 'friendly-dark', 'basic-light', 'basic-dark'];
const rectOf = (f, sels, pad) => f.evaluate(([sels, pad]) => {
	const bs = sels.map((s) => document.querySelector(s)).filter(Boolean).map((e) => e.getBoundingClientRect());
	if (!bs.length) return null;
	const l = Math.min(...bs.map((b) => b.left)), t = Math.min(...bs.map((b) => b.top)), r = Math.max(...bs.map((b) => b.right)), btm = Math.max(...bs.map((b) => b.bottom));
	return { x: Math.floor(l - pad[0]), y: Math.floor(t - pad[1]), width: Math.ceil(r - l + 2 * pad[0]), height: Math.ceil(btm - t + 2 * pad[1]) };
}, [sels, pad]);
export default async function (t) {
	await t.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
	const f = await t.app.open({ onboarding: false });
	await t.emulate({ reducedMotion: 'reduce' });
	for (const look of LOOKS) {
		await t.app.look(t, look); await t.page.waitForTimeout(1200);
		const tabs = await rectOf(f, ['.title-bar nav.page-tabs'], [6, 0]);
		await t.crop(`tabs-${look}`, tabs, `title bar page tabs, ${look}`);
		const seg = await rectOf(f, ['#sidePanelSlot .pm-segtab'], [4, 2]);
		if (seg) await t.crop(`railtabs-${look}`, seg, `left rail file tabs, ${look}`);
	}
	const g = await t.app.open({ onboarding: true, query: 'o55=screen=begin' });
	await g.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	for (const look of LOOKS) {
		const [fam, mode] = look.split('-');
		await g.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await g.waitForFunction((want) => (document.documentElement.getAttribute('data-theme') || '') === want, look, { timeout: 20000 });
		await t.page.waitForTimeout(2400);
		const rail = await rectOf(g, ['#pm-o55-onboarding .o55-raillist'], [14, 8]);
		await t.crop(`steps-${look}`, rail, `onboarding step rail (Project current), ${look}`);
		const L = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) ';
		const opts = await rectOf(g, [L + '.o55-opt:nth-of-type(1)', L + '.o55-card:not(.o55-on)'], [8, 8]);
		await t.crop(`option-${look}`, opts, `onboarding chosen option and one not chosen, ${look}`);
	}
	await t.check('captured', true);
}
