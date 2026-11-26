// Tools T-191 (Jared, 2026-11-24: "is code mode an option in settings that can be turned off? If not, it needs to
// be."): the inventory row code.execution.code-mode is an ordinary Settings row. By real typing and real clicks:
// Settings Search for "Code Mode" lists a result named Code Mode; the result opens a page that draws the row with the
// inventory's label and sentence and one switch; the switch starts On (the inventory default), a click turns it Off,
// and a second click turns it On again. In each of the three states the switch itself has to be shown (opacity-aware
// computed visibility, box inside the window and every clipping ancestor), carry the row's label as its name, and be
// drawn in the state aria-checked reports (the .on class and the knob's place); Off also has to survive leaving the
// row and finding it again by Search (max review: aria-checked alone can pass a transparent or stale-drawn switch).
// Judged from the row's own markup (data-setting-id / data-setting), never from a position on the page.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-code-mode-row.check.mjs --set page=<build>
// --set size=1440x900 changes the window. --set shots=basic-light,basic-dark also takes one picture of the row among
// its neighbours in each named look (picked through Settings' own Theme rows, after the switch is back On), for the
// by-eye comparison of switch and spacing; it asserts only that the look named is the one painted.
import { readFileSync } from 'node:fs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const ID = 'code.execution.code-mode';
/* the inventory row itself: the label and the complete sentence the page has to draw */
const INV = JSON.parse(readFileSync(new URL('../../../../Plans/settings_inventory.json', import.meta.url), 'utf8')).settings.find((s) => s.id === ID);
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
/* Tools T-191 fixes the spelling: "a toggle labelled Code Mode". The inventory is checked against that first, so the
   page comparisons below cannot pass on an inventory that itself says "Code mode" (max review). */
const CANON_LABEL = 'Code Mode';
/* Code Mode is a fixed phrase (Settings_System §4 keeps those through sentence case), so the page draws the
   inventory label letter for letter; "Code mode" fails (review 5) */
const sameLabel = (drawn) => norm(drawn) === norm(INV.label);
const ROW = ([id, label, desc]) => {
	const sw = [...document.querySelectorAll(`.toggle[role="switch"][data-setting="${id}"], [data-setting-id="${id}"] .toggle[role="switch"]`)]
		.find((el) => el.getClientRects().length && el.checkVisibility());
	if (!sw) return { drawn: false, known: [...document.querySelectorAll(`[data-setting-id="${id}"], [data-setting="${id}"]`)].length };
	const row = sw.closest(`[data-setting-id="${id}"]`) || sw.closest('.setting-row, .pm51-row, .o55-scoped, li, tr') || sw.parentElement;
	const r = sw.getBoundingClientRect();
	const lines = (row.innerText || '').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
	/* shown, not only present: the innermost element that holds exactly these words passes the computed visibility
	   checks, has a box, and lies inside the window and inside every ancestor that clips or scrolls (review 3: innerText
	   also returns clipped text). This is geometry and computed style, not a pixel reading of the words' ink. */
	const holder = (words) => [...row.querySelectorAll('*')].filter((el) => (el.innerText || '').replace(/\s+/g, ' ').trim() === words).pop();
	const shown = (el) => {
		if (!el || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false;
		const b = el.getBoundingClientRect();
		if (b.width < 1 || b.height < 1 || b.top < 0 || b.left < 0 || b.bottom > innerHeight || b.right > innerWidth) return false;
		/* the element may cut off its own words (ellipsis, line clamp): innerText still returns them all (review 8) */
		const own = getComputedStyle(el);
		if (/hidden|clip|auto|scroll/.test(own.overflowX + ' ' + own.overflowY) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) return false;
		for (let a = el.parentElement; a; a = a.parentElement) {
			const cs = getComputedStyle(a);
			if (!/hidden|clip|auto|scroll/.test(cs.overflowX + ' ' + cs.overflowY)) continue;
			const c = a.getBoundingClientRect();
			if (b.top < c.top - 1 || b.bottom > c.bottom + 1 || b.left < c.left - 1 || b.right > c.right + 1) return false;
		}
		return true;
	};
	/* the switch as drawn: shown like the words are, named, and painted in the state it reports. The knob (::after) sits
	   at its start when Off and is moved along the track when On; the .on class is what the styles key on. */
	const knob = getComputedStyle(sw, '::after').transform;
	const knobX = knob && knob !== 'none' ? Math.round(new DOMMatrixReadOnly(knob).m41) : 0;
	return { drawn: true, checked: sw.getAttribute('aria-checked'), lines: lines.slice(0, 12), text: lines.join(' ').slice(0, 600),
		labelShown: shown(holder(label)), descShown: shown(holder(desc)),
		switchShown: shown(sw) && Number(getComputedStyle(sw).opacity) > 0.5 && r.width >= 16 && r.height >= 10,
		switchName: sw.getAttribute('aria-label') || '', onClass: sw.classList.contains('on'), knobX,
		/* the setting's own value, read back from Settings, not from the switch's markup */
		stored: (typeof PM51 !== 'undefined' && PM51 && typeof PM51.value === 'function') ? PM51.value(id) : 'unreadable',
		switches: row.querySelectorAll('.toggle[role="switch"]').length, inView: r.top >= 0 && r.bottom <= innerHeight, at: [Math.round(r.left), Math.round(r.top)] };
};

export default async function (t) {
	const [w, h] = String(t.args.size || '1440x900').split('x').map(Number);
	const f = await t.app.open();
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(w, h);
	await f.locator('#tab-settings').click();
	await t.settle();

	const SW = `.toggle[role="switch"][data-setting="${ID}"]:visible, [data-setting-id="${ID}"] .toggle[role="switch"]:visible`;
	/* find the row the way a person does: type its name into Settings Search and open the result named for it */
	const findBySearch = async () => {
		const input = f.locator('#pm-settings-root [data-global-search]:visible').first();
		await input.click();
		await input.fill('');
		await input.type('Code Mode', { delay: 15 });
		const results = f.locator('.search-results[data-mode="rail"] .search-result');
		await results.first().waitFor({ state: 'visible', timeout: 5000 });
		/* a result's name is its first drawn line; the lines under it are where it lives and its help */
		const titles = await results.evaluateAll((els) => els.map((el) => ((el.innerText || '').split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)[0] || '')));
		const at = titles.findIndex(sameLabel);
		if (at < 0) return { at, titles };
		await results.nth(at).click();
		await t.settle();
		await t.page.waitForTimeout(900);
		await f.locator(SW).first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {});
		await t.page.waitForTimeout(400);
		return { at, titles };
	};
	const read = () => f.evaluate(ROW, [ID, norm(INV.label), norm(INV.desc)]);
	/* one state, judged whole: reported, shown, named and drawn alike */
	const judge = async (when, row, on) => {
		await t.check(`${when}: aria-checked says ${on ? 'On' : 'Off'}`, row.drawn === true && row.checked === String(on), JSON.stringify(row));
		if (!row.drawn) return;
		await t.check(`${when}: the setting's own value, read back from Settings, is ${on}`, row.stored === on, `PM51.value: ${JSON.stringify(row.stored)}`);
		await t.check(`${when}: the switch itself is shown (opacity-aware visibility, box inside the window and every clipping ancestor)`, row.switchShown === true, JSON.stringify(row));
		await t.check(`${when}: the switch is drawn ${on ? 'On' : 'Off'}, as aria-checked says (the .on class and the knob's place)`, row.onClass === on && (on ? row.knobX > 0 : row.knobX === 0), `class on ${row.onClass}, knob at ${row.knobX}`);
	};

	await t.check('the inventory row\'s label is spelled as Tools T-191 fixes it, "Code Mode"', INV && INV.label === CANON_LABEL, String(INV && INV.label));
	const found = await findBySearch();
	t.log(`Settings Search "Code Mode" lists results named: ${found.titles.slice(0, 8).join(' | ')}`);
	await t.check('Settings Search for "Code Mode" lists a result whose name is the inventory label', found.at >= 0, found.titles.slice(0, 8).join(' | '));
	if (found.at < 0) return;

	let row = await read();
	t.log(`after the search: ${JSON.stringify(row)}`);
	await t.check('the result opens a page that draws the Code Mode row with a switch', row.drawn === true, JSON.stringify(row));
	if (!row.drawn) return;
	await t.check('the row\'s first line is the inventory label', sameLabel(row.lines[0]), JSON.stringify(row.lines));
	await t.check('the row holds the inventory\'s complete sentence, as one of its lines', row.lines.includes(norm(INV.desc)), JSON.stringify(row.lines));
	await t.check('the label and the complete sentence pass the computed visibility checks, and their boxes fit inside the window and every scrolling or clipping ancestor', row.labelShown === true && row.descShown === true, `label ${row.labelShown}, sentence ${row.descShown}`);
	await t.check('the row has exactly one switch', row.switches === 1, String(row.switches));
	await t.check('the switch is named by the inventory label', sameLabel(row.switchName), row.switchName);
	await judge('at first, the inventory default', row, true);

	await f.locator(SW).first().click();
	await t.settle();
	await t.page.waitForTimeout(900);
	await judge('after one click', await read(), false);

	/* Off is kept, not only painted: leave the row for Settings Home, find it again by Search, and it is still Off */
	await f.locator('#pm-settings-root [data-action="home"]:visible').first().click();
	await t.settle();
	await t.page.waitForTimeout(600);
	await t.check('Settings Home is open and the row is no longer drawn', (await read()).drawn === false, JSON.stringify(await read()));
	const again = await findBySearch();
	await t.check('Search finds the row again after leaving it', again.at >= 0, again.titles.slice(0, 8).join(' | '));
	await judge('found again after leaving the row', await read(), false);

	await f.locator(SW).first().click();
	await t.settle();
	await t.page.waitForTimeout(900);
	await judge('after a second click', await read(), true);

	for (const look of (t.args.shots ? String(t.args.shots).split(',').filter(Boolean) : [])) {
		await setLookBySetting(t, f, look);
		await findBySearch();
		await t.page.waitForTimeout(800);
		await guardPaintedLook(t, f, look, `${look}: before the picture`);
		await t.shot(`code-mode-row-${look}`, `${look}: the Code Mode row among its neighbours: the same switch, the same row height and spacing, label and sentence readable`);
	}
}
