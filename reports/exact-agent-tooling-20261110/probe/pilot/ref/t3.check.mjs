import { ITEMS, item, state, settled } from './lib.mjs';
export const tests = { async 'Enter on a focused Activity item opens its panel'(t) {
	await t.app.open();
	for (const id of ITEMS) {
		if ((await state(t)).expanded[id] === 'true') { await item(t, id === 'files' ? 'search' : 'files').click(); await settled(t); }
		await item(t, id).focus();
		await t.check(`${id}: takes the focus`, await item(t, id).evaluate((e) => document.activeElement === e));
		await t.page.keyboard.press('Enter'); await settled(t);
		const s = await state(t);
		await t.check(`${id}: Enter opens its panel`, s.slot > 200 && s.expanded[id] === 'true', JSON.stringify(s));
	}
} };
