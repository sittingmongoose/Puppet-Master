// FO-228 (stream F batch 15, Medium, ordinary use): in Settings › AI & Providers › Providers & Accounts › Services,
// on the account named Work Claude (work-claude), a model chosen with real clicks is lost when the Project reloads
// (the page's own PM12_KIMI.reloadProject()): the "Default model" dropdown comes back as Claude Sonnet, and the
// shared picker's "Default model for this account" loses its model while its separate depth record is kept.
// Cause: the project projection (the Settings engine's save) keeps settings, mediaRoutes and pm51.o55Custom/o55Depth,
// never the providers list, so a reload rebuilds every account from the fixture (acc.defaultModel claude-sonnet,
// acc.props without ai.accounts.default-model). The fix keeps each account's two model choices in the projection
// (accountModels, beside the depth) and the providers migration reads them back.
// At 1920x1080, by real presses, both surfaces (--set sandbox=0 and =1):
//   dropdown  the account's "Default model" dropdown picks Claude Opus; after reloadProject the dropdown and
//             getState().providers still name claude-opus
//   picker    the account's shared picker picks Claude Opus at Max depth; after reloadProject the row still names
//             Claude Opus · Max depth, acc.props keeps the pick and pm51.o55Depth keeps the record
// Fails main 3af916f4b6 (both choices back to the fixture after the reload; the depth record alone survives) and
// passes the head, both surfaces.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-account-model-reload.check.mjs --set page=<build> --set sandbox=0
const ACC_KEY = 'acc-claude-code-work-claude';
const PICK_ID = 'ai.accounts.default-model';

/* what the account holds now, read from the engine's own state (the same state reloadProject rebuilds);
   page-side readers carry their own literals: evaluate runs them in the page, not in this module */
const ACCOUNT_STATE = () => {
	const st = window.PM12_KIMI && PM12_KIMI.getState ? PM12_KIMI.getState() : null;
	const p = st && (st.providers || []).find((x) => x.id === 'claude-code');
	const acc = p && (p.accounts || []).find((x) => x.id === 'work-claude');
	if (!acc) return null;
	return { defaultModel: acc.defaultModel, pick: (acc.props || {})['ai.accounts.default-model'], depth: ((st.pm51 || {}).o55Depth || {})['ai.accounts.default-model|claude-code|work-claude'] || null };
};
const DROPDOWN_FACE = () => {
	const el = document.querySelector('.pm51-acc-item[data-acc="acc-claude-code-work-claude"] select[data-action="pm51-providers-account-model-default"]');
	const wrap = el && el.closest('.pm51-dd');
	return { value: el ? el.value : null, face: wrap ? ((wrap.querySelector('.pm51-dd-value') || {}).textContent || '').trim() : '' };
};
const PICKER_FACE = () => {
	const c = document.querySelector('.pm51-acc-item[data-acc="acc-claude-code-work-claude"] .o55-msel[data-o55-msel="ai.accounts.default-model"] [role="combobox"]');
	return { name: c ? ((c.querySelector('strong') || {}).textContent || '').trim() : '', small: c ? ((c.querySelector('small') || {}).textContent || '').trim() : '' };
};

/* Settings › AI & Providers › Providers & Accounts › Services › Claude Code › the Work Claude account, open */
async function toWorkClaude(t, f) {
	await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]').first().click();
	await t.settle();
	await f.locator('#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="providers"]').first().click().catch(() => {});
	await t.settle();
	await f.locator('#pm-settings-root .pm51-mgr .pm51-tabs [data-tab="services"]').first().click().catch(() => {});
	await t.settle();
	const row = f.locator('#pm-settings-root .resource-row[data-id="claude-code"]').first();
	if (await row.count()) await row.click({ timeout: 4000 }).catch(() => {});
	await t.settle();
	const item = f.locator(`#pm-settings-root .pm51-acc-item[data-acc="${ACC_KEY}"]`).first();
	await item.scrollIntoViewIfNeeded().catch(() => {});
	if (!(await item.evaluate((el) => el.classList.contains('is-open')).catch(() => false))) {
		await item.locator('.pm51-acc-toggle').first().click();
		await t.settle();
	}
	return item;
}

export const tests = {
	'FO-228 the account Default model dropdown keeps its choice through a project reload': async (t) => {
		const f = await t.app.open();
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		const item = await toWorkClaude(t, f);
		const dd = item.locator('.pm51-dd:has(select[data-action="pm51-providers-account-model-default"])').first();
		await t.check('FO-228 the Work Claude account has a Default model dropdown', (await dd.count()) > 0);
		if (!(await dd.count())) return;
		await dd.locator('.pm51-dd-trigger').scrollIntoViewIfNeeded();
		await dd.locator('.pm51-dd-trigger').click();
		await t.page.waitForTimeout(450);
		const opt = f.locator('.pm51-popout [role="option"]').filter({ hasText: 'Claude Opus' }).first();
		await t.check('FO-228 the dropdown offers Claude Opus', (await opt.count()) > 0);
		if (!(await opt.count())) { await t.page.keyboard.press('Escape'); return; }
		await opt.click();
		await t.page.waitForTimeout(700);
		const before = await f.evaluate(DROPDOWN_FACE);
		const beforeState = await f.evaluate(ACCOUNT_STATE);
		await t.check(`FO-228 the press saved Claude Opus ("${before.face}")`, before.value === 'claude-opus' && /Claude Opus/.test(before.face) && !!beforeState && beforeState.defaultModel === 'claude-opus', JSON.stringify({ before, beforeState }));
		await f.evaluate(() => window.PM12_KIMI.reloadProject());
		await t.settle();
		await toWorkClaude(t, f);
		const after = await f.evaluate(DROPDOWN_FACE);
		const afterState = await f.evaluate(ACCOUNT_STATE);
		await t.check(`FO-228 after the reload the dropdown still names Claude Opus ("${after.face}")`, after.value === 'claude-opus' && /Claude Opus/.test(after.face), JSON.stringify(after));
		await t.check('FO-228 after the reload the account still holds claude-opus', !!afterState && afterState.defaultModel === 'claude-opus', JSON.stringify(afterState));
	},
	'FO-228 the account shared picker keeps its model and depth through a project reload': async (t) => {
		const f = await t.app.open();
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		const item = await toWorkClaude(t, f);
		const wrap = item.locator(`.o55-msel[data-o55-msel="${PICK_ID}"]`).first();
		await t.check('FO-228 the Work Claude account has the shared model picker', (await wrap.count()) > 0);
		if (!(await wrap.count())) return;
		const trig = wrap.locator('[role="combobox"]');
		await trig.scrollIntoViewIfNeeded();
		await trig.click();
		await t.page.waitForTimeout(450);
		const opt = f.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: 'Claude Opus' }).first();
		await t.check('FO-228 the shared picker offers Claude Opus', (await opt.count()) > 0);
		if (!(await opt.count())) { await t.page.keyboard.press('Escape'); return; }
		await opt.click();
		await t.page.waitForTimeout(350);
		await f.locator('[role="listbox"][aria-label^="Thinking depth"] [role="option"]').filter({ hasText: 'Max' }).first().click();
		await t.page.waitForTimeout(700);
		const before = await f.evaluate(PICKER_FACE);
		const beforeState = await f.evaluate(ACCOUNT_STATE);
		await t.check(`FO-228 the presses saved Claude Opus at Max depth ("${before.small}")`, /Claude Opus/.test(before.name) && before.small.includes('Max depth') && !!beforeState && beforeState.pick === 'claude-code/claude-opus' && !!beforeState.depth && beforeState.depth.effort === 'Max', JSON.stringify({ before, beforeState }));
		await f.evaluate(() => window.PM12_KIMI.reloadProject());
		await t.settle();
		await toWorkClaude(t, f);
		const after = await f.evaluate(PICKER_FACE);
		const afterState = await f.evaluate(ACCOUNT_STATE);
		await t.check(`FO-228 after the reload the picker still names Claude Opus at Max depth ("${after.small}")`, /Claude Opus/.test(after.name) && after.small.includes('Max depth'), JSON.stringify(after));
		await t.check('FO-228 after the reload the account keeps the pick and the depth record', !!afterState && afterState.pick === 'claude-code/claude-opus' && !!afterState.depth && afterState.depth.model === 'claude-code/claude-opus' && afterState.depth.effort === 'Max', JSON.stringify(afterState));
	}
};
