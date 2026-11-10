// Activity bar: one real click on an item whose side panel is not showing shows that item's own panel in the side
// panel area, the item reports aria-expanded="true" and the other eight panel items report aria-expanded="false".
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
const item = (t, label) => t.page.locator(`[data-ab-id][aria-label="${label}"]`);

// Is the panel with this id showing in the side panel area (left strip, about 240 px wide, really on top)?
async function panelState(t, id) {
	return t.page.evaluate((id) => {
		const el = document.getElementById(id);
		if (!el) return { exists: false, showing: false };
		const r = el.getBoundingClientRect();
		const cs = getComputedStyle(el);
		const inArea = r.left >= 20 && r.left <= 80 && r.width >= 200 && r.width <= 300 && r.height >= 200;
		let onTop = false;
		if (inArea && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.5) {
			const pts = [[r.left + r.width / 2, r.top + 20], [r.left + r.width / 2, r.top + r.height / 2], [r.left + 30, r.top + 60]];
			onTop = pts.every(([x, y]) => { const h = document.elementFromPoint(x, y); return !!h && el.contains(h); });
		}
		return { exists: true, showing: inArea && onTop, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], vis: cs.visibility, disp: cs.display, op: cs.opacity };
	}, id);
}

async function expectShown(t, label, id, step) {
	await t.settle();
	// Wait for the target state, but judge it only once (a timeout is not a pass).
	await t.page.waitForFunction(([lab]) => document.querySelector(`[data-ab-id][aria-label="${lab}"]`)?.getAttribute('aria-expanded') === 'true', [label], { timeout: 3000 }).catch(() => {});
	await t.settle();
	const st = await panelState(t, id);
	await t.check(`${step}: ${label} panel (#${id}) shows in the side panel area`, st.showing, JSON.stringify(st));
	for (const [other, oid] of ITEMS) {
		if (other === label) continue;
		const os = await panelState(t, oid);
		await t.check(`${step}: ${other} panel is not showing after clicking ${label}`, !os.showing, JSON.stringify(os));
	}
	const exp = {};
	for (const [l] of ITEMS) exp[l] = await item(t, l).getAttribute('aria-expanded');
	await t.check(`${step}: ${label} reports aria-expanded="true"`, exp[label] === 'true', JSON.stringify(exp));
	const wrong = ITEMS.map(([l]) => l).filter((l) => l !== label && exp[l] !== 'false');
	await t.check(`${step}: the other eight items report aria-expanded="false"`, wrong.length === 0, `not "false": ${wrong.join(', ')}; all: ${JSON.stringify(exp)}`);
}

async function clickWhenNotShowing(t, label, id, step) {
	const loc = item(t, label);
	await t.equal(`${step}: exactly one ${label} item in the Activity bar`, await loc.count(), 1);
	const pre = await panelState(t, id);
	await t.check(`${step}: precondition — ${label} panel is not showing before the click`, !pre.showing, JSON.stringify(pre));
	await loc.click();
	await expectShown(t, label, id, step);
}

export const tests = {};

// Each item from a fresh page: the Files panel shows at load, so every other item is clicked directly; Files is
// reached by first showing Search.
for (const [label, id] of ITEMS) {
	tests[`fresh page: one click on ${label} shows its own panel and sets aria-expanded`] = async (t) => {
		await t.app.open();
		await t.settle();
		const files = await panelState(t, 'panel-files');
		await t.check('at load the Files panel shows', files.showing, JSON.stringify(files));
		if (label === 'Files') {
			await item(t, 'Search').click();
			await t.settle();
		}
		await clickWhenNotShowing(t, label, id, label);
	};
}

// The same in one session, going from each item straight to the next (and back to Files at the end).
tests['one session: each item in turn shows its own panel'] = async (t) => {
	await t.app.open();
	await t.settle();
	const order = [...ITEMS.slice(1), ITEMS[0]];
	for (const [label, id] of order) await clickWhenNotShowing(t, label, id, `seq ${label}`);
};
