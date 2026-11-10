import { ITEMS, item, state, settled } from './lib.mjs';
export const tests = { async 'every Activity item opens its panel on a click'(t) {
	await t.app.open();
	for (const id of ITEMS) {
		const target = await item(t, id).getAttribute('aria-controls');
		if ((await state(t)).expanded[id] === 'true') { await item(t, id === 'files' ? 'search' : 'files').click(); await settled(t); }
		await item(t, id).click(); await settled(t);
		const s = await state(t);
		await t.check(`${id}: panel shows`, s.slot > 200 && s.active.includes(target), JSON.stringify(s));
		await t.check(`${id}: says expanded, the others do not`, s.expanded[id] === 'true' && ITEMS.every((o) => o === id || s.expanded[o] === 'false'), JSON.stringify(s.expanded));
	}
} };
