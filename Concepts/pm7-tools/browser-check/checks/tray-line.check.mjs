// QA-3 (Jared, 2026-11-08): "the line under This computer down to the quick-check row is not needed, wherever the
// tray pattern is used" — a chosen card's tray (.o55-under) once drew a line from the card's mark down its tray
// with ::before (12-components.css, with quiet, Friendly and Retro variants). No tray draws it now: for every tray
// on the Where screen (This computer's quick-check tray is open there), in all ten looks, both surfaces, the
// ::before computes to no box. On b3456fac54 it computed a 2 px line in every look. A tray must be found or the
// case fails by name, so the check cannot pass on an empty screen. --set looks=a,b narrows it.
//   browser-check run Concepts/pm7-tools/browser-check/checks/tray-line.check.mjs --set page=<build>

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

const TRAYS = () => [...document.querySelectorAll('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-under')].map((el) => {
	const cs = getComputedStyle(el, '::before');
	return { content: cs.content, width: cs.width, bg: cs.backgroundColor, label: el.getAttribute('aria-label') || '' };
});

async function run(t, mode) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	await t.newContext({ viewport: { width: 1390, height: 900 }, deviceScaleFactor: 1 });
	await t.emulate({ reducedMotion: 'reduce' });
	for (const look of looks) {
		await t.step(`${look} ${mode}`, async () => {
			const f = await t.app.open(t, { sandbox: mode === 'sandbox' });
			await t.app.look(t, look);
			await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'where' }));
			await t.page.waitForTimeout(2500);
			const trays = await f.evaluate(TRAYS);
			const lined = trays.filter((x) => x.content !== 'none');
			t.check(`${look}: no line down a chosen card's tray`, trays.length > 0 && !lined.length,
				trays.length ? lined.map((x) => `${x.label}: ::before content ${x.content} width ${x.width}`).join(' | ') : 'no tray found on Where');
		});
	}
}

export const tests = {
	'no tray line (normal page)': on('normal', run),
	'no tray line (T3 sandbox)': on('sandbox', run)
};
