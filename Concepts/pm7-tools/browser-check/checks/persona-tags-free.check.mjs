// FO-161 (Jared: "A: free tags with suggested kinds"; Plans/Personas.md P-010 / DL-474): a persona's Tags row is a
// free tag input, not a fixed multiselect. Real typing adds any tag (Enter or comma), each tag is a removable chip,
// the eight suggested kinds are offered under the box and typing filters them; an added kind leaves the suggestions.
// The tags left after removing one chip survive a Settings close/reopen, show in the persona's library row, and the
// roster filter finds the persona by a free tag and updates when that tag is removed. Literal tag text is preserved.
// Both surfaces, Basic
// Dark / Glass Light / NieR Dark / Retro Light, 1280x900 and 740x900. Visible behaviour only.
// Bite: on the 12e head the row is a fixed chip-select with the old kinds and no input, so the first assertion fails
// there and passes on the fix. --set shots=1 crops the row at 1280x900 (on a pre-FO-161 page it crops the fixed list
// instead, for the paired before/after evidence).
import { setLookBySetting, lookHeld } from '../helpers/settings-look.mjs';

const LOOKS = ['basic-dark', 'glass-light', 'nier-dark', 'retro-light'];
const SIZES = [[1280, 900], [740, 900]];
const SHOT_LOOKS = ['basic-dark', 'glass-light', 'nier-dark'];
const LAYOUT_LOOKS = ['retro-light', 'basic-dark'];
const TAGS = 'personas.library.persona-tags';
const PID = 'custom-ux';                    // Settings UX Reviewer, a seeded custom persona
const FREE = 'release-notes';               // not a suggested kind
const COMMA = 'hotfix';                     // added with a comma
const KIND = 'language', KIND_LABEL = 'Language';
const KINDS = ['Phase', 'Task', 'Subtask', 'Iteration', 'Across phases', 'Language', 'Domain', 'Framework'];
const BODY = '[data-continuous-workspace-body="personas"]';
const MOUNTED = `${BODY}[data-workspace-mounted="true"]`;

// a page tab: on a narrow host the strip overflows into the More menu, so reach the tab through it when it hides
async function pageTab(t, f, page) {
	const tab = f.locator(`#tab-${page}`);
	if (await tab.isVisible().catch(() => false)) await tab.click();
	else {
		await f.locator('#pageTabsMoreBtn').click();
		await t.page.waitForTimeout(300);
		await f.locator(`#pageTabsMoreMenu .pm6-tb-menu-item[data-page="${page}"]`).first().click();
	}
	await t.settle();
}
// on a narrow host the domain rail is a drawer behind the topbar menu button; navigation closes it again
async function openRailIfNarrow(t, f) {
	const menu = f.locator('#panel-settings .topbar .mobile-menu[data-action="toggle-rail"]').first();
	if (await menu.isVisible().catch(() => false)) {
		await menu.click();
		await t.page.waitForTimeout(450);
	}
}
async function settings(t, surface, [w, h]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await pageTab(t, f, 'settings');
	await openRailIfNarrow(t, f);
	return f;
}
async function goPersonas(t, f) {
	await f.evaluate(() => PM51.go('memory', 'personas'));
	await f.waitForSelector(MOUNTED, { timeout: 15000 });
	await t.settle();
	const active = (await f.locator(`${BODY} .pm51-tabs .manager-tab.active`).innerText().catch(() => '')).trim();
	if (active !== 'Personas') {
		await f.locator(`${BODY} .pm51-tabs .manager-tab`, { hasText: /^\s*Personas\s*$/ }).first().click();
		await t.settle();
		await t.page.waitForTimeout(400);
	}
}
// the roster is an off-canvas drawer on a narrow host: open it behind the detail head's menu button when it shows
async function openPersona(t, f) {
	const toggle = f.locator(`${BODY} .pm51-roster-toggle`).first();
	if (await toggle.isVisible().catch(() => false)) {
		await toggle.click();
		await t.page.waitForTimeout(450);
	}
	const row = f.locator(`${BODY} .resource-row[data-id="${PID}"]`).first();
	await row.scrollIntoViewIfNeeded();
	await row.click();
	await t.settle();
	await t.page.waitForTimeout(450);
}
const tagsRow = (f) => f.locator(`${BODY} [data-setting-id="${TAGS}"]`).first();
const chipTexts = (row) => row.locator('.o55-tag-chip > span:first-child').allTextContents();
const shown = (a) => JSON.stringify(a);
// the About section the row sits in: the shot shows the control among its sibling rows, not alone
const aboutSection = (row) => row.locator('xpath=ancestor::section[1]');

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	for (const look of LOOKS) {
		for (const [w, h] of SIZES) {
			tests[`free tags (${surface}, ${look}, ${w}x${h})`] = async (t) => {
				if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
				const f = await settings(t, surface, [w, h]);
				await setLookBySetting(t, f, look);
				const painted = await f.evaluate(() => {
					const theme = document.documentElement.getAttribute('data-theme') || '';
					return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') };
				});
				await t.check(`measured under ${look}`, lookHeld(look, painted), shown(painted));
				await goPersonas(t, f);
				await openPersona(t, f);
				const row = tagsRow(f);
				await row.scrollIntoViewIfNeeded();
				const input = row.locator('.o55-tags-in');
				const isFree = (await input.count()) === 1;
				await t.check('Tags is a free tag input, not a fixed list', isFree,
					isFree ? 'input present' : `fixed control: ${(await row.locator('.setting-control').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 140)}`);
				if (!isFree) {
					if (t.args.shots && w === 1280) await t.crop(`tags-before-${look}-${surface}`, aboutSection(row), 'the About section with the fixed Tags multiselect before FO-161');
					return;
				}
				// at rest: the eight suggested kinds, none of the old fixed list
				const sug = row.locator('.o55-tag-sug');
				const restLabels = await sug.allTextContents();
				await t.check('the eight canon kinds are offered as suggestions', restLabels.length === 8 && KINDS.every(l => restLabels.includes(l)), restLabels.join(', '));
				const rowText = (await row.innerText()).replace(/\s+/g, ' ');
				await t.check('no old fixed kind remains on the row', !/\b(Seam|Package|Lane|Across seams|Other)\b/.test(rowText), rowText.slice(0, 160));
				// a free tag by Enter
				await input.fill(FREE);
				await input.press('Enter');
				await t.page.waitForTimeout(350);
				await t.check('Enter adds the free tag as a chip', (await chipTexts(row)).includes(FREE), shown(await chipTexts(row)));
				await t.check('the input clears after adding', (await input.inputValue()) === '', await input.inputValue());
				// typing filters the suggestions; picking one adds it
				await input.fill('lang');
				await t.page.waitForTimeout(250);
				const filtered = await sug.allTextContents();
				await t.check('typing filters the suggestions to Language', filtered.length === 1 && filtered[0] === KIND_LABEL, filtered.join(', '));
				await sug.first().click();
				await t.page.waitForTimeout(350);
				await t.check('the suggested kind is added as a chip', (await chipTexts(row)).includes(KIND_LABEL), shown(await chipTexts(row)));
				await t.check('an added kind is no longer suggested', (await sug.count()) === 7, `${await sug.count()} suggestions`);
				// a comma adds what is typed too
				await input.fill(COMMA);
				await input.press(',');
				await t.page.waitForTimeout(350);
				await t.check('comma adds the typed tag', (await chipTexts(row)).includes(COMMA), shown(await chipTexts(row)));
				if (t.args.shots && w === 1280 && SHOT_LOOKS.includes(look)) {
					await t.page.waitForTimeout(2400);   // let the Saved toast go, so the shot shows the rows, not the toast
					await t.crop(`tags-${look}-${surface}`, aboutSection(row), 'the About section with the free tag input: free chips, a kind chip, the input and the remaining suggestions');
				}
				// remove one chip (the suggested kind); exactly the free tags are left
				await row.locator(`.o55-tag-x[data-tag="${KIND}"]`).click();
				await t.page.waitForTimeout(350);
				const left = [FREE, COMMA];
				await t.check('removing a chip leaves exactly the others', shown(await chipTexts(row)) === shown(left), shown(await chipTexts(row)));
				const meta = (await f.locator(`${BODY} .resource-row[data-id="${PID}"] .resource-row-meta`).innerText()).replace(/\s+/g, ' ');
				await t.check('the library row shows the free tags', meta.includes(FREE) && meta.includes(COMMA), meta);
				// the row commits as it goes: close Settings, reopen, and the tags left are what shows
				await pageTab(t, f, 'dashboard');
				await pageTab(t, f, 'settings');
				await goPersonas(t, f);
				await openPersona(t, f);
				const row2 = tagsRow(f);
				await row2.scrollIntoViewIfNeeded();
				await t.check('reopen shows exactly the tags left', shown(await chipTexts(row2)) === shown(left), shown(await chipTexts(row2)));
				// the roster search finds the persona by its free tag
				const filter = f.locator(`${BODY} input[data-action="pm51-filter"]`).first();
				await filter.fill(FREE);
				await t.page.waitForTimeout(350);
				const visibleRows = f.locator(`${BODY} .resource-row:not([hidden])`);
				const visIds = await visibleRows.evaluateAll(rs => rs.map(r => r.dataset.id));
				await t.check('search by the free tag finds exactly this persona', visIds.length === 1 && visIds[0] === PID, visIds.join(', '));
				await row2.locator(`.o55-tag-x[data-tag="${FREE}"]`).click();
				const remainingIds = await visibleRows.evaluateAll(rs => rs.map(r => r.dataset.id));
				const empty = f.locator(`${BODY} .pm51-filter-empty:not([hidden])`);
				const emptyText = (await empty.allTextContents()).join(' ');
				const activeFilter = await filter.inputValue();
				await t.check('removing the only matching tag immediately empties the filtered roster',
					activeFilter === FREE && remainingIds.length === 0 && emptyText === 'No matches. Clear the filter to see everything.',
					shown({ activeFilter, remainingIds, emptyText }));
				await filter.fill('');
				await t.page.waitForTimeout(350);
				const restoredIds = await visibleRows.evaluateAll(rs => rs.map(r => r.dataset.id));
				await t.check('clearing the search brings the roster back', restoredIds.length > 1 && restoredIds.includes(PID), `${restoredIds.length} rows`);
				const literal = 'constructor';
				const input2 = row2.locator('.o55-tags-in');
				await input2.fill(literal);
				await input2.press('Enter');
				const literalChip = row2.locator(`.o55-tag-chip:has(.o55-tag-x[data-tag="${literal}"]) > span:first-child`);
				const literalText = await literalChip.allTextContents();
				await t.check('constructor renders verbatim as a free tag chip', shown(literalText) === shown([literal]), shown(literalText));
				const label = 'Across phases';
				const token = 'cross-phase';
				await row2.getByRole('button', { name: label, exact: true }).click();
				await filter.pressSequentially(label);
				const labelIds = await visibleRows.evaluateAll(rs => rs.map(r => r.dataset.id));
				const labelMeta = await f.locator(`${BODY} .resource-row[data-id="${PID}"] .resource-row-meta`).textContent();
				await t.check('Filter personas finds the Across phases suggestion by its displayed label',
					labelIds.includes(PID), shown(labelIds));
				await t.check('roster meta shows Across phases as the tag label',
					labelMeta.includes(label) && !labelMeta.includes(token), labelMeta);
				await filter.fill(token);
				const tokenIds = await visibleRows.evaluateAll(rs => rs.map(r => r.dataset.id));
				await t.check('Filter personas also finds Across phases by its stored token', tokenIds.includes(PID), shown(tokenIds));
				// Persona records are the concept's session state, like every persona field (aliases, tools): the
				// project projection the tome saves holds settings, not the roster, so a page reload re-seeds it.
				// The close/reopen above is the persistence this row shares with the other persona fields.
			};
		}
	}
	for (const look of LAYOUT_LOOKS) {
		tests[`tag input layout (${surface}, ${look}, 1280x900)`] = async (t) => {
			if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
			const f = await settings(t, surface, [1280, 900]);
			await setLookBySetting(t, f, look);
			await goPersonas(t, f);
			await openPersona(t, f);
			const row = tagsRow(f);
			await row.scrollIntoViewIfNeeded();
			const input = row.locator('.o55-tags-in');
			await input.fill('release-readiness');
			await input.press('Enter');
			await row.getByRole('button', { name: 'Framework', exact: true }).click();
			await input.fill('hotfix');
			await input.press('Enter');
			await t.equal('the layout fixture has three chips', shown(await chipTexts(row)), shown(['release-readiness', 'Framework', 'hotfix']));
			const layout = await input.evaluate(el => {
				const box = el.closest('.o55-tags-box');
				const chips = [...box.querySelectorAll('.o55-tag-chip')];
				const last = chips.at(-1);
				const boxStyle = getComputedStyle(box);
				const style = getComputedStyle(el);
				const placeholder = getComputedStyle(el, '::placeholder');
				const sample = document.createElement('span');
				sample.style.cssText = 'position:fixed;visibility:hidden;white-space:pre';
				sample.style.font = placeholder.font;
				sample.style.letterSpacing = placeholder.letterSpacing;
				sample.textContent = el.placeholder;
				document.body.append(sample);
				const textWidth = sample.getBoundingClientRect().width;
				sample.remove();
				const requiredWidth = textWidth + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
				const remainingWidth = box.clientLeft + box.clientWidth - parseFloat(boxStyle.paddingRight)
					- (last.offsetLeft - box.offsetLeft + last.offsetWidth) - parseFloat(boxStyle.columnGap);
				const center = node => node.offsetTop + node.offsetHeight / 2;
				const sameLine = chips.every(chip => Math.abs(center(chip) - center(el)) <= 1);
				return { sameLine, remainingWidth, requiredWidth, inputWidth: el.clientWidth };
			});
			await t.check('Add a tag stays on the chips line when the placeholder fits',
				layout.remainingWidth >= layout.requiredWidth && layout.sameLine && layout.inputWidth >= layout.requiredWidth, shown(layout));
			if (t.args.shots) {
				await t.page.waitForTimeout(2400);
				await t.crop(`tags-layout-${look}-${surface}`, aboutSection(row), 'three chips and the Add a tag placeholder at 1280×900');
			}
		};
	}
}
