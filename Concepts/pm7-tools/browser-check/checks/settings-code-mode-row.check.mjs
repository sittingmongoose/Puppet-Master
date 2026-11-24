// Tools T-191 (Jared, 2026-11-24: "is code mode an option in settings that can be turned off? If not, it needs to
// be."): the inventory row code.execution.code-mode is an ordinary Settings row. By real typing and real clicks:
// Settings Search for "Code Mode" lists a result named Code Mode; the result opens a page that draws the row with the
// inventory's label and sentence and one switch; the switch starts On (the inventory default), a click turns it Off,
// and a second click turns it On again. Judged from the row's own markup (data-setting-id / data-setting), never from
// a position on the page.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-code-mode-row.check.mjs --set page=<build>
// --set size=1440x900 changes the window.
const ID = 'code.execution.code-mode';
const ROW = (id) => {
	const sw = [...document.querySelectorAll(`.toggle[role="switch"][data-setting="${id}"], [data-setting-id="${id}"] .toggle[role="switch"]`)]
		.find((el) => el.getClientRects().length && el.checkVisibility());
	if (!sw) return { drawn: false, known: [...document.querySelectorAll(`[data-setting-id="${id}"], [data-setting="${id}"]`)].length };
	const row = sw.closest(`[data-setting-id="${id}"]`) || sw.closest('.setting-row, .pm51-row, .o55-scoped, li, tr') || sw.parentElement;
	const r = sw.getBoundingClientRect();
	return { drawn: true, checked: sw.getAttribute('aria-checked'), text: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400),
		switches: row.querySelectorAll('.toggle[role="switch"]').length, inView: r.top >= 0 && r.bottom <= innerHeight, at: [Math.round(r.left), Math.round(r.top)] };
};

export default async function (t) {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();

	const input = f.locator('#pm-settings-root [data-global-search]:visible').first();
	await input.click();
	await input.fill('');
	await input.type('Code Mode', { delay: 15 });
	const results = f.locator('.search-results[data-mode="rail"] .search-result');
	await results.first().waitFor({ state: 'visible', timeout: 5000 });
	const titles = await results.evaluateAll((els) => els.map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim()));
	t.log(`Settings Search "Code Mode" lists: ${titles.slice(0, 8).join(' | ')}`);
	const at = titles.findIndex((s) => /\bCode mode\b/i.test(s));
	await t.check('Settings Search for "Code Mode" lists a result named Code Mode', at >= 0, titles.slice(0, 8).join(' | '));
	if (at < 0) return;
	await results.nth(at).click();
	await t.settle();
	await t.page.waitForTimeout(900);

	let row = await f.evaluate(ROW, ID);
	t.log(`after the search: ${JSON.stringify(row)}`);
	await t.check('the result opens a page that draws the Code Mode row with a switch', row.drawn === true, JSON.stringify(row));
	if (!row.drawn) return;
	/* the page draws inventory labels in sentence case (Settings_System §4), so the label reads "Code mode" */
	await t.check('the row shows its label, Code Mode, and the inventory sentence', /\bCode mode\b/i.test(row.text) && /several tools in one step/.test(row.text), row.text);
	await t.check('the row has exactly one switch', row.switches === 1, String(row.switches));
	await t.check('the switch starts On, the inventory default', row.checked === 'true', String(row.checked));

	const sw = f.locator(`.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`).first();
	await sw.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
	await t.page.waitForTimeout(400);
	await sw.click();
	await t.settle();
	await t.page.waitForTimeout(900);
	row = await f.evaluate(ROW, ID);
	await t.check('a click turns Code Mode Off', row.drawn === true && row.checked === 'false', JSON.stringify(row));
	await f.locator(`.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`).first().click();
	await t.settle();
	await t.page.waitForTimeout(900);
	row = await f.evaluate(ROW, ID);
	await t.check('a second click turns it On again', row.drawn === true && row.checked === 'true', JSON.stringify(row));
}
