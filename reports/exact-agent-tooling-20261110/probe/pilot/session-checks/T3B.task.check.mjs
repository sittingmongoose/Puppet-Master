// Each of the nine panel-owning Activity bar items works from the keyboard:
// it takes focus (keyboard-focusable), and Enter while its panel is not showing shows its own
// side panel (~240 px, right of the strip, the only side panel showing) and sets aria-expanded="true".
const ITEMS = [
	['Files', 'activity.files', 'panel-files'],
	['Search', 'activity.search', 'panel-search'],
	['Source', 'activity.source', 'panel-source'],
	['Pipelines', 'activity.repository_automation', 'panel-git'],
	['Docker', 'activity.docker', 'panel-docker'],
	['Tests', 'activity.testing', 'panel-testing'],
	['Debug', 'activity.run', 'panel-run'],
	['Agents', 'activity.agents', 'panel-agents'],
	['Artifacts', 'activity.artifacts', 'panel-artifacts'],
];
const PANEL_IDS = ITEMS.map((i) => i[2]);

// Geometry of every side panel, plus the strip's right edge.
function panelState(ids) {
	const bar = document.querySelector('.activity-bar');
	const barRight = bar ? bar.getBoundingClientRect().right : 0;
	const out = { barRight, panels: {} };
	for (const id of ids) {
		const p = document.getElementById(id);
		if (!p) { out.panels[id] = null; continue; }
		const b = p.getBoundingClientRect();
		const cs = getComputedStyle(p);
		out.panels[id] = { w: b.width, h: b.height, x: b.left,
			shown: b.width >= 200 && b.height >= 100 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.1 };
	}
	return out;
}

function makeTest(label, uiId, panelId) {
	return async (t) => {
		await t.app.open();
		await t.settle();
		const item = await t.app.byId(uiId);

		// Make sure this item's panel is NOT showing before pressing Enter.
		let st = await t.page.evaluate(panelState, PANEL_IDS);
		if (st.panels[panelId] && st.panels[panelId].shown) {
			const other = await t.app.byId(uiId === 'activity.search' ? 'activity.docker' : 'activity.search');
			await other.click();
			await t.settle();
			st = await t.page.evaluate(panelState, PANEL_IDS);
		}
		await t.check(`${label}: its panel is not showing before Enter`, !!st.panels[panelId] && !st.panels[panelId].shown,
			`panel #${panelId}: ${JSON.stringify(st.panels[panelId])}`);

		// Keyboard focus: keyboard-focusable (tabIndex >= 0) and actually receives focus.
		const tabIndex = await item.evaluate((e) => e.tabIndex);
		await t.check(`${label}: is in the keyboard tab order`, tabIndex >= 0, `tabIndex=${tabIndex}`);
		await item.focus();
		const hasFocus = await item.evaluate((e) => document.activeElement === e);
		await t.check(`${label}: takes the keyboard focus`, hasFocus,
			`activeElement=${await t.page.evaluate(() => { const a = document.activeElement; return a ? a.outerHTML.slice(0, 120) : 'none'; })}`);

		await t.page.keyboard.press('Enter');
		await t.settle();
		try {
			await t.page.waitForFunction(([ids, pid]) => {
				const p = document.getElementById(pid);
				if (!p) return false;
				const b = p.getBoundingClientRect();
				return b.width >= 200 && b.height >= 100;
			}, [PANEL_IDS, panelId], { timeout: 3000 });
		} catch { /* judged below */ }
		await t.settle();

		st = await t.page.evaluate(panelState, PANEL_IDS);
		const own = st.panels[panelId];
		await t.check(`${label}: Enter shows its own panel (#${panelId})`, !!own && own.shown,
			`panel #${panelId}: ${JSON.stringify(own)}`);
		await t.check(`${label}: its panel is about 240 px wide beside the strip`,
			!!own && own.w >= 200 && own.w <= 600 && own.x >= st.barRight - 2 && own.x <= st.barRight + 40,
			`panel ${JSON.stringify(own)}, strip right edge ${st.barRight}`);
		const othersShown = PANEL_IDS.filter((id) => id !== panelId && st.panels[id] && st.panels[id].shown);
		await t.check(`${label}: no other item's panel shows`, othersShown.length === 0, `also showing: ${othersShown.join(', ')}`);
		if (own && own.shown) await t.visible(`#${panelId}`, `${label} panel`);

		const expanded = await item.getAttribute('aria-expanded');
		await t.check(`${label}: reports aria-expanded="true"`, expanded === 'true', `aria-expanded=${expanded}`);
		const controls = await item.getAttribute('aria-controls');
		await t.check(`${label}: aria-controls names its panel`, controls === panelId, `aria-controls=${controls}`);
	};
}

export const tests = Object.fromEntries(
	ITEMS.map(([label, uiId, panelId]) => [`${label} item opens its panel with Enter from the keyboard`, makeTest(label, uiId, panelId)])
);
