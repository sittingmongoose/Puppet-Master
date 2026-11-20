// FO-208 (claude-projects-refresh, 2026-11-14): "Messages that can wait" (general.interaction.queue-size) accepted
// 5.5 in its main box. The box takes whole numbers only: typing 5.5 is refused with a short reason (the page's own
// notice, like the number dialog's refusals) and the box keeps the last whole value; 7 is accepted. The saved value
// is never fractional. The inventory row says nothing about fractions, so the fix refuses them (brief's default).
// Both surfaces (--set sandbox=0 / =1).
const ID = 'general.interaction.queue-size';

async function settings(t, surface) {
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.evaluate((i) => PM51.revealSetting(i), ID);
	await f.waitForSelector(`[id="setting-${ID}"]`, { state: 'attached', timeout: 15000 });
	await t.settle();
	await t.page.waitForTimeout(400);
	const row = f.locator(`[id="setting-${ID}"]`).first();
	await row.scrollIntoViewIfNeeded();
	return { f, row };
}
// watch every notice the page sends (the titlebar center when it is there, the toast stack otherwise)
const SPY = () => {
	window.__fo208 = [];
	const c = window.PM_TITLEBAR_NOTIFY;
	if (c && typeof c.push === 'function' && !c.__fo208) { const p = c.push.bind(c); c.__fo208 = true; c.push = (x) => { window.__fo208.push({ title: String(x.title || ''), body: String(x.body || '') }); return p(x); }; }
	const stack = document.getElementById('toast-stack');
	if (stack) new MutationObserver(() => { stack.querySelectorAll('.toast').forEach((x) => { const t = x.querySelector('.toast-title'), m = x.querySelector('.toast-message'); if (t && !x.__fo208) { x.__fo208 = true; window.__fo208.push({ title: t.textContent.trim(), body: m ? m.textContent.trim() : '' }); } }); }).observe(stack, { childList: true });
};
const READ = (id) => {
	const input = document.querySelector(`[id="setting-${id}"] input[data-action="input-setting"]`);
	const v = window.PM51 && PM51.value ? PM51.value(id) : null;
	return { shown: input ? input.value : null, stored: v, notices: window.__fo208 || [] };
};

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('FO-208 Messages that can wait takes whole numbers only', async (t) => {
		const { f, row } = await settings(t, surface);
		const input = row.locator('input[data-action="input-setting"]').first();
		await t.check('the box is a whole-number box (step 1, numeric keypad)', (await input.getAttribute('step')) === '1' && (await input.getAttribute('inputmode')) === 'numeric', `step=${await input.getAttribute('step')} inputmode=${await input.getAttribute('inputmode')}`);
		await f.evaluate(SPY);
		// 5.5: typed for real, then Enter and blur; it is refused and never stored
		await input.click();
		await t.page.keyboard.press('Control+A');
		await t.page.keyboard.type('5.5', { delay: 60 });
		await t.page.keyboard.press('Enter');
		await t.page.keyboard.press('Tab');
		await t.page.waitForTimeout(400);
		const no = await f.evaluate(READ, ID);
		await t.check('5.5 is refused with a short whole-number reason', no.notices.some((n) => /whole/i.test(n.title) && n.body.length > 0 && n.body.length <= 40), JSON.stringify(no.notices));
		await t.check('after 5.5 the saved value is a whole number', Number.isInteger(Number(no.stored)), JSON.stringify(no.stored));
		await t.check('after 5.5 the box shows that same whole number', no.shown === String(no.stored), `shown "${no.shown}", stored ${JSON.stringify(no.stored)}`);
		await t.check('5.5 itself was never saved', String(no.stored) !== '5.5', JSON.stringify(no.stored));
		// 7: typed for real, accepted and shown
		await f.evaluate(() => { window.__fo208 = []; });
		await input.click();
		await t.page.keyboard.press('Control+A');
		await t.page.keyboard.type('7', { delay: 60 });
		await t.page.keyboard.press('Enter');
		await t.page.waitForTimeout(400);
		const yes = await f.evaluate(READ, ID);
		await t.check('7 is saved', Number(yes.stored) === 7, JSON.stringify(yes.stored));
		await t.check('7 is what the box shows', yes.shown === '7', `shown "${yes.shown}"`);
		await t.check('7 raises no refusal', !yes.notices.some((n) => /whole/i.test(n.title)), JSON.stringify(yes.notices));
	});
}
