// Required behaviour: when an Activity bar item's side panel is showing, one real click on that same item
// closes the side panel (#sidePanelSlot collapses to zero width) and the item reports aria-expanded="false".
const ITEMS = [
	['files', 'Files'], ['search', 'Search'], ['source', 'Source'], ['repository_automation', 'Pipelines'],
	['docker', 'Docker'], ['testing', 'Tests'], ['run', 'Debug'], ['agents', 'Agents'], ['artifacts', 'Artifacts'],
];

const slotWidth = () => {
	const s = document.querySelector('#sidePanelSlot');
	if (!s) return -1;
	return s.getBoundingClientRect().width;
};

async function waitState(t, item, wantOpen, timeout = 4000) {
	try {
		await t.page.waitForFunction(({ id, wantOpen }) => {
			const el = document.querySelector(`.activity-bar [data-ui-element-id="activity.${id}"]`);
			const s = document.querySelector('#sidePanelSlot');
			if (!el || !s) return false;
			const w = s.getBoundingClientRect().width;
			const exp = el.getAttribute('aria-expanded');
			return wantOpen ? (w >= 150 && exp === 'true') : (w === 0 && exp === 'false');
		}, { id: item, wantOpen }, { timeout });
		return true;
	} catch { return false; }
}

export const tests = {};
for (const [id, label] of ITEMS) {
	tests[`${label}: one click on its own item closes its showing side panel`] = async (t) => {
		await t.app.open();
		const item = await t.app.byId('activity.' + id);
		await t.check(`${label} item has the expected name`, (await item.getAttribute('aria-label') || (await item.innerText()) || '').includes(label) || (await t.ax({ role: 'button', name: label })).length > 0, `item activity.${id} is not named ${label}`);
		// Precondition: the item's side panel is showing (open it with a real click when it is not).
		if ((await item.getAttribute('aria-expanded')) !== 'true') {
			await item.click();
		}
		const opened = await waitState(t, id, true);
		await t.settle();
		await t.check(`${label} side panel is showing before the close click`, opened,
			`slot width ${await t.page.evaluate(slotWidth)}, aria-expanded=${await item.getAttribute('aria-expanded')}`);
		if (!opened) return;
		// The behaviour: exactly one real click on the same item.
		await item.click();
		const closed = await waitState(t, id, false);
		await t.settle();
		const w = await t.page.evaluate(slotWidth);
		const exp = await item.getAttribute('aria-expanded');
		await t.check(`${label}: side panel area collapses to zero width`, closed && w === 0, `slot width after one click: ${w}px`);
		await t.check(`${label}: item reports aria-expanded="false"`, closed && exp === 'false', `aria-expanded after one click: ${exp}`);
	};
}
