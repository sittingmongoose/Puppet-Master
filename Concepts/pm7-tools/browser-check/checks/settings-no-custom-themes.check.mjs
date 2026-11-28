// FO-254 (Jared, 2026-11-28, relayed by pm7-build; DL-2607 on stream C's branch: "We arent going to support custom themes
// outside of the controls we have in settings."): custom themes are gone from PM7's Settings. PM7 drew them as one
// action row, "Your own themes" (general.visual.manage-custom-themes: Manage your themes, a list of your themes and Add a
// theme, standing in for Plans' Open themes folder, Create theme, Import theme and Export theme), and "Start custom
// themes from" (general.visual.custom-theme-base), under App & Input's More options in a "Custom themes" section.
// Rows: (1) neither id is placed (PM51.placement.audit), and asking Settings to reveal either finds nothing and draws
// no row; (2) Settings Search, typed as a person types it, for each of the phrases below: no result names either id and
// no result's drawn text is custom-theme text; (3) App & Input, every More options opened: no row of either id, and no
// custom-theme text anywhere in the page's drawn text (Settings and the rest of the page); (4) the built-in looks stay:
// Settings' Theme row still offers Basic, Friendly, Glass, Retro and NieR.
// The page still carries both rows in its data while main's Plans/settings_inventory.json lists them (the concept's
// placement retire_ids keeps them drawn nowhere and found by no search); once DL-2607 lands they are gone from the
// data too. Both surfaces. Fails on main before 2026-11-28; passes on the FO-254 branch.
const IDS = ['general.visual.manage-custom-themes', 'general.visual.custom-theme-base'];
const PHRASES = ['custom theme', 'your own themes', 'Start custom themes from', 'Manage your themes', 'themes folder', 'theme file', 'create theme', 'import theme', 'export theme', 'Manage Custom Themes', 'Custom Theme Starting Point'];
/* custom-theme text, as the retired rows, their flow and the Plans buttons word it */
const CUSTOM = /custom[- ]?themes?|your own themes?|own theme files?|theme files?|themes folder|manage your themes|add a theme|your themes|create (a |new )?theme|import (a )?theme\b|export (a |this )?theme|open (the )?themes? folder|start custom themes/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function settings(t, surface) {
	await t.viewport(1440, 900);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click({ timeout: 15000 });
	await f.locator('#pm-settings-root').first().waitFor({ timeout: 15000 });
	await t.settle();
	await sleep(600);
	return f;
}
const drawnRow = (f, id) => f.evaluate((i) => { const el = document.querySelector(`[id="setting-${i}"], [data-setting-id="${i}"], [data-setting="${i}"]`); return el ? { tag: el.tagName, text: (el.innerText || '').slice(0, 160), shown: el.getClientRects().length > 0 } : null; }, id);

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('FO-254 custom themes are gone from Settings', async (t) => {
		const f = await settings(t, surface);
		/* (1) placement and reveal */
		const audit = await f.evaluate((ids) => { const a = window.PM51 && PM51.placement && PM51.placement.audit ? PM51.placement.audit() : null; return a ? { placed: a.placed, retiredIds: a.retiredIds.filter((x) => ids.includes(x)) } : null; }, IDS);
		t.log(`placement audit: ${JSON.stringify(audit)}`);
		for (const id of IDS) {
			const placed = await f.evaluate((i) => { try { return !!(window.PM51 && PM51.placement && PM51.placement.where && PM51.placement.where(i)); } catch (_) { return null; } }, id);
			const asked = await f.evaluate((i) => { try { return PM51.revealSetting(i); } catch (e) { return 'threw ' + e; } }, id);
			await sleep(1800);
			const row = await drawnRow(f, id);
			await t.check(`(1) Settings cannot reveal ${id}: no row is drawn`, asked !== true && !row, `revealSetting said ${JSON.stringify(asked)}; placement.where ${JSON.stringify(placed)}; row ${JSON.stringify(row)}`);
		}
		/* (2) Settings Search, typed */
		for (const phrase of PHRASES) {
			const input = f.locator('#pm-settings-root [data-global-search]:visible').first();
			await input.click();
			await input.fill('');
			await input.type(phrase, { delay: 12 });
			await sleep(700);
			const res = await f.evaluate(() => [...document.querySelectorAll('.search-results .search-result')].filter((el) => el.getClientRects().length).map((el) => ({ text: (el.innerText || '').replace(/\s+/g, ' ').trim(), payload: el.getAttribute('data-search-payload') || '' })));
			const named = res.filter((r) => IDS.some((id) => r.payload.includes(id)));
			const worded = res.filter((r) => CUSTOM.test(r.text));
			t.log(`search "${phrase}": ${res.length} results: ${res.slice(0, 5).map((r) => r.text.slice(0, 70)).join(' | ')}`);
			await t.check(`(2) Search "${phrase}": no result is a custom-theme row or says custom-theme words`, named.length === 0 && worded.length === 0, JSON.stringify({ named: named.map((r) => r.text.slice(0, 100)), worded: worded.map((r) => r.text.slice(0, 100)) }));
			await input.fill('');
			await sleep(200);
		}
		await t.page.keyboard.press('Escape').catch(() => {});
		/* (3) App & Input with every More options open, and the whole page's drawn text */
		await f.evaluate(() => PM51.revealSetting('general.visual.theme'));
		await f.waitForSelector('[id="setting-general.visual.theme"], select[data-setting="general.visual.theme"]', { state: 'attached', timeout: 15000 });
		await t.settle();
		await sleep(800);
		const opened = await f.evaluate(() => { const d = [...document.querySelectorAll('#pm-settings-root details.pm51-advanced')]; d.forEach((x) => { x.open = true; }); return d.length; });
		await sleep(800);
		const page = await f.evaluate((ids) => {
			const sc = document.querySelector('#settings-document') || document.querySelector('#pm-settings-root');
			const sections = [...(sc ? sc.querySelectorAll('h2, h3, .section-title, .pm51-section-title') : [])].map((h) => (h.innerText || '').trim()).filter(Boolean);
			return { rows: ids.filter((i) => document.querySelector(`[id="setting-${i}"], [data-setting-id="${i}"], [data-setting="${i}"]`)), sections, settingsText: sc ? sc.innerText : '', pageText: document.body.innerText };
		}, IDS);
		t.log(`App & Input: ${opened} More options opened; sections: ${page.sections.join(' | ')}`);
		await t.check('(3) App & Input has a More options to open (the walk is real)', opened > 0, String(opened), { hard: true });
		await t.check('(3) App & Input draws no custom-theme row', page.rows.length === 0, JSON.stringify(page.rows));
		const hitS = (page.settingsText.match(new RegExp('.{0,60}(' + CUSTOM.source + ').{0,60}', 'gi')) || []);
		await t.check('(3) Settings shows no custom-theme text (every More options open)', hitS.length === 0, hitS.slice(0, 6).join(' | '));
		const hitP = (page.pageText.match(new RegExp('.{0,60}(' + CUSTOM.source + ').{0,60}', 'gi')) || []);
		await t.check('(3) the whole page shows no custom-theme text', hitP.length === 0, hitP.slice(0, 6).join(' | '));
		/* (4) the built-in looks stay */
		const fams = await f.evaluate(() => [...document.querySelectorAll('select[data-setting="general.visual.theme"] option')].map((o) => o.textContent.trim()));
		await t.check('(4) the Theme row still offers Basic, Friendly, Glass, Retro and NieR', ['Basic', 'Friendly', 'Glass', 'Retro', 'NieR'].every((n) => fams.some((x) => x === n || x.startsWith(n + ' '))), fams.join(', '));
	});
}
