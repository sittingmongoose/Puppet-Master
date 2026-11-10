import { ITEMS, item, state, settled } from './lib.mjs';
export const tests = { async 'a second click closes the panel and clears expanded'(t) {
	await t.app.open();
	for (const id of ITEMS) {
		if ((await state(t)).expanded[id] !== 'true') { await item(t, id).click(); await settled(t); }
		await item(t, id).click(); await settled(t);
		const s = await state(t);
		await t.check(`${id}: panel closed`, s.slot < 1, JSON.stringify(s));
		await t.check(`${id}: says not expanded`, s.expanded[id] === 'false', JSON.stringify(s.expanded));
	}
} };
