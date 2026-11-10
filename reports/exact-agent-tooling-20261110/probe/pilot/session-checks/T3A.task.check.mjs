// Each of the nine Activity bar items that owns a side panel can be reached with the keyboard and, with Enter,
// shows its own panel and reports aria-expanded="true". One fresh page per item, so a failure names the item.
const ITEMS = [
	['Files', 'panel-files'],
	['Search', 'panel-search'],
	['Source', 'panel-source'],
	['Pipelines', 'panel-git'],
	['Docker', 'panel-docker'],
	['Tests', 'panel-testing'],
	['Debug', 'panel-run'],
	['Agents', 'panel-agents'],
	['Artifacts', 'panel-artifacts'],
];

// Is the panel showing in the side panel area: rendered, about 240 px wide, right of the strip, and on top at its centre.
const panelShowing = ([id]) => {
	const p = document.getElementById(id);
	const bar = document.getElementById('activityBar');
	if (!p || !bar) return false;
	const r = p.getBoundingClientRect();
	const b = bar.getBoundingClientRect();
	const cs = getComputedStyle(p);
	if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
	if (r.width < 180 || r.width > 320 || r.height < 100) return false;
	if (r.left < b.right - 2 || r.left > b.right + 60) return false;
	const x = r.left + r.width / 2, y = r.top + Math.min(r.height / 2, 200);
	const hit = document.elementFromPoint(x, y);
	return !!hit && p.contains(hit);
};

function makeTest(label, panelId) {
	return async (t) => {
		await t.app.open();
		const item = t.page.locator(`#activityBar [aria-label="${label}"]`).first();
		await t.check(`${label}: the item exists in the Activity bar`, (await item.count()) === 1, `no #activityBar item labelled ${label}`);

		// Precondition: the item's own panel is not showing. If it is (Files at start), show another panel with the mouse.
		if (await t.page.evaluate(panelShowing, [panelId])) {
			const other = label === 'Search' ? 'Files' : 'Search';
			await t.page.locator(`#activityBar [aria-label="${other}"]`).first().click();
			await t.until(`${label}: its panel is hidden before the keyboard step`, (a) => !(new Function('return ' + a.fn)())(a.args), { fn: panelShowing.toString(), args: [panelId] }, { timeout: 5000 });
			await t.settle();
		}
		await t.check(`${label}: its panel is not showing before Enter`, !(await t.page.evaluate(panelShowing, [panelId])), `${panelId} was already showing`);

		// Keyboard focus: reach the item with Tab from the first Activity bar item (or from the page start).
		await t.page.locator('#activityBar [aria-label="Chat"]').first().focus().catch(() => {});
		const isFocused = () => item.evaluate((el) => document.activeElement === el);
		let reached = await isFocused();
		for (let i = 0; i < 80 && !reached; i++) { await t.page.keyboard.press('Tab'); reached = await isFocused(); }
		if (!reached) {
			// Roving-focus strips: arrow keys from the first item.
			await t.page.locator('#activityBar [aria-label="Chat"]').first().focus().catch(() => {});
			for (let i = 0; i < 15 && !reached; i++) { await t.page.keyboard.press('ArrowDown'); reached = await isFocused(); }
		}
		await t.check(`${label}: the item takes the keyboard focus`, reached, `Tab and ArrowDown never moved focus to ${label}; activeElement: ${await t.page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ' ' + (a.getAttribute('aria-label') || a.id || '') : 'none'; })}`);
		if (!reached) return;

		await t.page.keyboard.press('Enter');
		let shown = true;
		try {
			await t.page.waitForFunction(panelShowing, [panelId], { timeout: 5000 });
		} catch { shown = false; }
		await t.settle();
		shown = shown && (await t.page.evaluate(panelShowing, [panelId]));
		await t.check(`${label}: Enter shows its own panel (${panelId})`, shown, `${panelId} not showing in the side panel area after Enter`);
		if (shown) await t.visible(`#${panelId}`, `${label} panel`);
		const expanded = await item.getAttribute('aria-expanded');
		await t.check(`${label}: the item reports aria-expanded="true"`, expanded === 'true', `aria-expanded=${JSON.stringify(expanded)}`);
	};
}

export const tests = Object.fromEntries(ITEMS.map(([label, id]) => [`${label}: keyboard focus + Enter shows its panel and sets aria-expanded`, makeTest(label, id)]));
