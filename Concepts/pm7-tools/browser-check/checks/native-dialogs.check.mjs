// FX-1: the Terminal's workgroup and terminal paths call no native dialog (alert, confirm, prompt) and each action
// works, under T3's real file-preview flags (browser-check's t.openInSandbox default: allow-scripts allow-forms
// allow-popups allow-downloads, no allow-modals, so a confirm() answers "no" and a prompt() answers nothing, with no UI)
// and on a normal page. Rename workgroup and Rename terminal edit the name in the menu; Close workgroup and Close
// terminal ask in the app's own dialog (the Work dialog, .wk-dialog). --set looks=1 also lists the menu's name field and
// the dialog in four looks for viewing.

const LOOKS = ['basic-dark', 'glass-light', 'retro-dark', 'nier-light'];

async function watchNative(f) {
	await f.evaluate(() => {
		if (window.__fx1Native) return;
		window.__fx1Native = [];
		for (const k of ['alert', 'confirm', 'prompt']) {
			const real = window[k];
			window[k] = function () { window.__fx1Native.push(k); return real.apply(this, arguments); };
		}
	});
}
const nativeCalls = (f) => f.evaluate(() => (window.__fx1Native || []).splice(0));

async function terminal(f) {
	const tab = f.locator('[data-bottom-tab="terminal"]').first();
	if (await tab.count()) await tab.click().catch(() => {});
	await f.locator('.pm-term-wg-tab').first().waitFor({ state: 'visible', timeout: 20000 });
}
async function menuItem(f, target, label) {
	await target.click({ button: 'right' });
	const item = f.locator('.pm-term-ctx-menu button', { hasText: label }).first();
	await item.waitFor({ state: 'visible', timeout: 5000 });
	await item.click();
}

export default async function (t) {
	for (const where of ['normal page', 'sandboxed preview']) {
		let f;
		if (where === 'normal page') { await t.app.open(); f = t.page.mainFrame(); }
		else f = await t.openInSandbox(t.cfg.pageUrl + (t.cfg.pageUrl.includes('?') ? '&' : '?') + 'o55=off&cb=' + Date.now(), { ready: '.app-shell' });
		await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM7_WORK_UI, null, { timeout: 60000 });
		await watchNative(f);
		await terminal(f);
		const tag = (s) => `${where}: ${s}`;

		// Rename workgroup, in the menu
		const pill = f.locator('.pm-term-wg-tab').first();
		await menuItem(f, pill, 'Rename workgroup');
		const field = f.locator('.pm-term-ctx-menu .pm-term-ctx-field');
		await t.check(tag('Rename workgroup opens a name field in the menu'), await field.isVisible().catch(() => false));
		await field.fill('FX1 group');
		await field.press('Enter');
		await f.waitForTimeout(400);
		await t.check(tag('the workgroup takes the new name'), /FX1 group/.test(await f.locator('.pm-term-wg-tab').first().innerText().catch(() => '')));

		// Rename terminal, in the menu, with the Rename button
		const sub = f.locator('.pm-term-subtab').first();
		await menuItem(f, sub, 'Rename terminal');
		await f.locator('.pm-term-ctx-menu .pm-term-ctx-field').fill('FX1 term');
		await f.locator('.pm-term-ctx-menu .pm-term-ctx-go').click();
		await f.waitForTimeout(400);
		await t.check(tag('the terminal takes the new name'), /FX1 term/.test(await f.locator('.pm-term-subtab').first().innerText().catch(() => '')));

		// Close terminal: a running one asks in the app's dialog; Cancel keeps it, Close terminal closes it
		const subs0 = await f.locator('.pm-term-subtab').count();
		await menuItem(f, f.locator('.pm-term-subtab').first(), 'Close terminal');
		await f.waitForTimeout(400);
		const askedT = await f.locator('.wk-dialog').isVisible().catch(() => false);
		if (askedT) {
			await t.text(f.locator('.wk-dialog [data-x="go"]'), 'Close terminal');
			await f.locator('.wk-dialog [data-x="cancel"]').click(); await f.waitForTimeout(300);
			await t.check(tag('Cancel keeps the terminal'), (await f.locator('.pm-term-subtab').count()) === subs0);
			await menuItem(f, f.locator('.pm-term-subtab').first(), 'Close terminal');
			await f.locator('.wk-dialog [data-x="go"]').click(); await f.waitForTimeout(500);
		}
		await t.check(tag(`Close terminal closes it${askedT ? ' after asking' : ' (it was not running)'}`), (await f.locator('.pm-term-subtab').count()) < subs0);

		// Close workgroup: asks in the app's dialog; Cancel keeps it, Close workgroup closes it
		const pills0 = await f.locator('.pm-term-wg-tab').count();
		await menuItem(f, f.locator('.pm-term-wg-tab').last(), 'Close workgroup');
		await f.locator('.wk-dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
		const askedG = await f.locator('.wk-dialog').isVisible().catch(() => false);
		await t.check(tag('Close workgroup asks in the app dialog'), askedG);
		if (askedG) {
			await t.text(f.locator('.wk-dialog [data-x="go"]'), 'Close workgroup');
			await f.locator('.wk-dialog [data-x="cancel"]').click(); await f.waitForTimeout(300);
			await t.check(tag('Cancel keeps the workgroup'), (await f.locator('.pm-term-wg-tab').count()) === pills0);
			await menuItem(f, f.locator('.pm-term-wg-tab').last(), 'Close workgroup');
			await f.locator('.wk-dialog [data-x="go"]').click(); await f.waitForTimeout(600);
			const pills1 = await f.locator('.pm-term-wg-tab').count();
			await t.check(tag('Close workgroup closes it'), pills1 < pills0 || pills0 === 1, `${pills0} -> ${pills1}`);
		}

		const calls = await nativeCalls(f);
		await t.check(tag('no native dialog was called on these paths'), calls.length === 0, `called: ${calls.join(', ')}`);

		if (t.args.looks && where === 'normal page') {
			for (const look of LOOKS) {
				await t.app.look(look);
				await terminal(f);
				await menuItem(f, f.locator('.pm-term-wg-tab').first(), 'Rename workgroup');
				const m = await f.locator('.pm-term-ctx-menu').boundingBox();
				if (m) await t.crop(`fx1-rename-${look}`, { x: m.x - 8, y: m.y - 8, width: m.width + 16, height: m.height + 16 }, `${look}: the workgroup name edited in the menu`);
				await t.page.keyboard.press('Escape');
				await menuItem(f, f.locator('.pm-term-wg-tab').first(), 'Close workgroup');
				const d = await f.locator('.wk-dialog').boundingBox().catch(() => null);
				if (d) await t.crop(`fx1-close-${look}`, { x: d.x - 8, y: d.y - 8, width: d.width + 16, height: d.height + 16 }, `${look}: Close workgroup asks in the app's dialog`);
				await f.locator('.wk-dialog [data-x="cancel"]').click().catch(() => {});
			}
		}
	}
}
