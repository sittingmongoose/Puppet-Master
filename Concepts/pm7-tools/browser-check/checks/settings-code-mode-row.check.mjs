// Tools T-191 (Jared, 2026-11-24: "is code mode an option in settings that can be turned off? If not, it needs to
// be."): the inventory row code.execution.code-mode is an ordinary Settings row. By real typing and real clicks:
// Settings Search for "Code Mode" lists a result named Code Mode; the result opens a page that draws the row with the
// inventory's label and sentence and one switch; the switch starts On (the inventory default), a click turns it Off,
// and a second click turns it On again. Judged from the row's own markup (data-setting-id / data-setting), never from
// a position on the page.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-code-mode-row.check.mjs --set page=<build>
// --set size=1440x900 changes the window.
import { readFileSync } from 'node:fs';

const ID = 'code.execution.code-mode';
/* the inventory row itself: the label and the complete sentence the page has to draw */
const INV = JSON.parse(readFileSync(new URL('../../../../Plans/settings_inventory.json', import.meta.url), 'utf8')).settings.find((s) => s.id === ID);
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
/* the page draws inventory labels in sentence case (Settings_System §4), so "Code Mode" reads "Code mode" */
const sameLabel = (drawn) => norm(drawn).toLowerCase() === norm(INV.label).toLowerCase();
const ROW = ([id, label, desc]) => {
	const sw = [...document.querySelectorAll(`.toggle[role="switch"][data-setting="${id}"], [data-setting-id="${id}"] .toggle[role="switch"]`)]
		.find((el) => el.getClientRects().length && el.checkVisibility());
	if (!sw) return { drawn: false, known: [...document.querySelectorAll(`[data-setting-id="${id}"], [data-setting="${id}"]`)].length };
	const row = sw.closest(`[data-setting-id="${id}"]`) || sw.closest('.setting-row, .pm51-row, .o55-scoped, li, tr') || sw.parentElement;
	const r = sw.getBoundingClientRect();
	const lines = (row.innerText || '').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
	/* painted, not only present: the innermost element that holds exactly these words is visible, has a box, and lies
	   inside the window and inside every ancestor that clips or scrolls (review 3: innerText also returns clipped text) */
	const holder = (words) => [...row.querySelectorAll('*')].filter((el) => (el.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase() === words.toLowerCase()).pop();
	const shown = (el) => {
		if (!el || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false;
		const b = el.getBoundingClientRect();
		if (b.width < 1 || b.height < 1 || b.top < 0 || b.left < 0 || b.bottom > innerHeight || b.right > innerWidth) return false;
		for (let a = el.parentElement; a; a = a.parentElement) {
			const cs = getComputedStyle(a);
			if (!/hidden|clip|auto|scroll/.test(cs.overflowX + ' ' + cs.overflowY)) continue;
			const c = a.getBoundingClientRect();
			if (b.top < c.top - 1 || b.bottom > c.bottom + 1 || b.left < c.left - 1 || b.right > c.right + 1) return false;
		}
		return true;
	};
	return { drawn: true, checked: sw.getAttribute('aria-checked'), lines: lines.slice(0, 12), text: lines.join(' ').slice(0, 600),
		labelShown: shown(holder(label)), descShown: shown(holder(desc)),
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
	/* a result's name is its first drawn line; the lines under it are where it lives and its help */
	const titles = await results.evaluateAll((els) => els.map((el) => ((el.innerText || '').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)[0] || '')));
	t.log(`Settings Search "Code Mode" lists results named: ${titles.slice(0, 8).join(' | ')}`);
	const at = titles.findIndex(sameLabel);
	await t.check('Settings Search for "Code Mode" lists a result whose name is the inventory label', at >= 0, titles.slice(0, 8).join(' | '));
	if (at < 0) return;
	await results.nth(at).click();
	await t.settle();
	await t.page.waitForTimeout(900);

	await f.locator(`.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`).first()
		.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {});
	await t.page.waitForTimeout(400);
	let row = await f.evaluate(ROW, [ID, norm(INV.label), norm(INV.desc)]);
	t.log(`after the search: ${JSON.stringify(row)}`);
	await t.check('the result opens a page that draws the Code Mode row with a switch', row.drawn === true, JSON.stringify(row));
	if (!row.drawn) return;
	await t.check('the row\'s first line is the inventory label', sameLabel(row.lines[0]), JSON.stringify(row.lines));
	await t.check('the row holds the inventory\'s complete sentence, as one of its lines', row.lines.includes(norm(INV.desc)), JSON.stringify(row.lines));
	await t.check('the label and the sentence are painted: visible, inside the window and inside every clipping ancestor', row.labelShown === true && row.descShown === true, `label ${row.labelShown}, sentence ${row.descShown}`);
	await t.check('the row has exactly one switch', row.switches === 1, String(row.switches));
	await t.check('the switch starts On, the inventory default', row.checked === 'true', String(row.checked));

	const sw = f.locator(`.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`).first();
	await sw.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
	await t.page.waitForTimeout(400);
	await sw.click();
	await t.settle();
	await t.page.waitForTimeout(900);
	row = await f.evaluate(ROW, [ID, norm(INV.label), norm(INV.desc)]);
	await t.check('a click turns Code Mode Off', row.drawn === true && row.checked === 'false', JSON.stringify(row));
	await f.locator(`.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`).first().click();
	await t.settle();
	await t.page.waitForTimeout(900);
	row = await f.evaluate(ROW, [ID, norm(INV.label), norm(INV.desc)]);
	await t.check('a second click turns it On again', row.drawn === true && row.checked === 'true', JSON.stringify(row));
}
