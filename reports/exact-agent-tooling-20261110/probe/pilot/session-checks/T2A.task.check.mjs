// Activity bar: clicking the item whose side panel is showing closes the side panel
// (side panel area collapses to 0 width) and the item reports aria-expanded="false".
const ITEMS = ['Files', 'Search', 'Source', 'Pipelines', 'Docker', 'Tests', 'Debug', 'Agents', 'Artifacts'];

const SLOT = '#sidePanelSlot';

async function slotWidth(t) {
	return t.page.evaluate((sel) => {
		const el = document.querySelector(sel);
		return el ? el.getBoundingClientRect().width : null;
	}, SLOT);
}

async function waitWidth(t, pred, timeout = 4000) {
	try {
		await t.page.waitForFunction(({ sel, pred }) => {
			const el = document.querySelector(sel);
			if (!el) return false;
			const w = el.getBoundingClientRect().width;
			return pred === 'open' ? w >= 200 : w < 0.5;
		}, { sel: SLOT, pred }, { timeout });
	} catch { /* judged by the explicit checks below */ }
}

async function waitAttr(t, loc, value, timeout = 3000) {
	const handle = await loc.elementHandle();
	try {
		await t.page.waitForFunction(([el, v]) => el.getAttribute('aria-expanded') === v, [handle, value], { timeout });
	} catch { /* judged below */ }
}

function itemTest(name) {
	return async (t) => {
		await t.app.open();
		const item = t.page.locator(`[role="button"][aria-label="${name}"][aria-controls^="panel-"]`);
		const n = await item.count();
		await t.check(`${name}: exactly one Activity bar item`, n === 1, `found ${n} items named "${name}"`);
		if (n !== 1) return;
		const panelId = await item.getAttribute('aria-controls');

		// Make sure this item's side panel is showing (Files already shows at open).
		const panelShowing = () => t.page.evaluate(({ sel, id }) => {
			const slot = document.querySelector(sel);
			const p = document.getElementById(id);
			if (!slot || !p) return false;
			const sw = slot.getBoundingClientRect().width;
			const pr = p.getBoundingClientRect();
			return sw >= 200 && pr.width >= 200 && getComputedStyle(p).display !== 'none' && getComputedStyle(p).visibility !== 'hidden';
		}, { sel: SLOT, id: panelId });

		if (!(await panelShowing())) {
			await item.click();
			await waitWidth(t, 'open');
			await t.settle();
		}
		const showing = await panelShowing();
		await t.check(`${name}: its side panel is showing before the closing click`, showing,
			`side panel area width ${await slotWidth(t)}, panel #${panelId} not showing`);
		if (!showing) return;
		await t.check(`${name}: reports aria-expanded="true" while its panel shows`,
			(await item.getAttribute('aria-expanded')) === 'true', `aria-expanded=${await item.getAttribute('aria-expanded')}`);

		// One real mouse click on the same item.
		await item.click();
		await waitWidth(t, 'closed');
		await waitAttr(t, item, 'false');
		await t.settle();

		const w = await slotWidth(t);
		await t.check(`${name}: side panel area collapses to zero width`, w !== null && w < 0.5, `side panel area width is ${w}`);
		const exp = await item.getAttribute('aria-expanded');
		await t.check(`${name}: reports aria-expanded="false" after closing`, exp === 'false', `aria-expanded is ${JSON.stringify(exp)}`);
	};
}

export const tests = Object.fromEntries(
	ITEMS.map((name) => [`clicking ${name} while its panel shows closes it and sets aria-expanded=false`, itemTest(name)])
);
