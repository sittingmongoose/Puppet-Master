// FO-207 (claude-projects-refresh, 2026-11-14): the two folder rows, code.execution.projects-folder and
// code.execution.no-project-chats-folder, showed raw JSON in their box (the inventory default is a structured
// {kind: execution_host_home_relative, relative_path}). The box reads the path the default resolves to ("~/…"),
// the way every other path row reads, and a path chosen through Choose is what the box shows afterwards. The
// stored default itself is untouched: before any edit it is still the structured value, never rewritten by the fix.
// FO-213 (sol-recheck-fo207-211, 2026-11-15): with the untouched default, Choose's fallback folder dialog fills its
// Path field with that same resolved "~/…" path, never the escaped JSON; choosing and saving a path still works.
// Both surfaces (--set sandbox=0 / =1).
const ROWS = [
	{ id: 'code.execution.projects-folder', path: '~/Projects' },
	{ id: 'code.execution.no-project-chats-folder', path: '~/Puppet Master Chats' }
];
const JSON_SHAPE = /[{"':]/;

async function settings(t, surface) {
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function reveal(t, f, id) {
	await f.evaluate((i) => PM51.revealSetting(i), id);
	await f.waitForSelector(`[id="setting-${id}"]`, { state: 'attached', timeout: 15000 });
	await t.settle();
	await t.page.waitForTimeout(400);
	const row = f.locator(`[id="setting-${id}"]`).first();
	await row.scrollIntoViewIfNeeded();
	return row;
}
const READ = (id) => {
	const row = document.querySelector(`[id="setting-${id}"]`);
	const input = row && row.querySelector('.path-control input.text-control');
	return {
		box: input ? input.value : null,
		stored: JSON.stringify(window.PM51 && PM51.value ? PM51.value(id) : null)
	};
};

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('FO-207 the folder rows read as paths, not JSON, and keep their stored default', async (t) => {
		const f = await settings(t, surface);
		for (const { id, path } of ROWS) {
			const row = await reveal(t, f, id);
			const r = await f.evaluate(READ, id);
			await t.check(`${id}: the box shows the resolved path`, r.box === path, `box "${r.box}"`);
			await t.check(`${id}: the box has no JSON shape`, r.box != null && !JSON_SHAPE.test(r.box), `box "${r.box}"`);
			await t.check(`${id}: the stored default is still the structured value`, /execution_host_home_relative/.test(r.stored), r.stored);
			await row.locator('[data-action="browse-setting-path"]').first().click();
			const dlg = f.locator('.overlay .dialog').last();
			await dlg.waitFor({ state: 'visible', timeout: 8000 });
			const field = dlg.locator('input[name="path"]');
			await field.click();
			await t.page.keyboard.press('Control+A');
			await t.page.keyboard.type('/home/jared/Chosen Folder', { delay: 20 });
			await dlg.locator('button[type="submit"]').first().click();
			await f.waitForFunction((i) => { const el = document.querySelector(`[id="setting-${i}"] .path-control input`); return el && el.value === '/home/jared/Chosen Folder'; }, id, { timeout: 8000 });
			const after = await f.evaluate(READ, id);
			await t.check(`${id}: the box shows the chosen path`, after.box === '/home/jared/Chosen Folder', `box "${after.box}"`);
			await t.check(`${id}: the chosen path is the stored value`, after.stored === JSON.stringify('/home/jared/Chosen Folder'), after.stored);
			await t.check(`${id}: the chosen path has no JSON shape`, !JSON_SHAPE.test(after.box || ''), `box "${after.box}"`);
		}
	});

	T('FO-213 Choose opens the fallback dialog on the resolved path, not JSON', async (t) => {
		// untouched default: open once, clear any stored override, then load again so the boot reads the cleared
		// storage (a previous test may have saved a chosen path; the sandbox has no storage at all)
		await t.viewport(1920, 1080);
		await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await f.locator('#tab-settings').click();
		await t.settle();
		for (const { id, path } of ROWS) {
			const row = await reveal(t, f, id);
			const r = await f.evaluate(READ, id);
			await t.check(`${id}: the stored default is the structured value before Choose`, /execution_host_home_relative/.test(r.stored), r.stored);
			await row.locator('[data-action="browse-setting-path"]').first().click();
			const dlg = f.locator('.overlay .dialog').last();
			await dlg.waitFor({ state: 'visible', timeout: 8000 });
			const field = dlg.locator('input[name="path"]');
			const shown = await field.inputValue();
			await t.check(`${id}: the dialog Path shows the resolved path ("${shown}")`, shown === path, `Path "${shown}"`);
			await t.check(`${id}: the dialog Path has no JSON shape`, shown != null && !JSON_SHAPE.test(shown), `Path "${shown}"`);
			// choosing and saving a path still works
			await field.click();
			await t.page.keyboard.press('Control+A');
			await t.page.keyboard.type('/home/jared/Picked Folder', { delay: 20 });
			await dlg.locator('button[type="submit"]').first().click();
			await f.waitForFunction((i) => { const el = document.querySelector(`[id="setting-${i}"] .path-control input`); return el && el.value === '/home/jared/Picked Folder'; }, id, { timeout: 8000 });
			const after = await f.evaluate(READ, id);
			await t.check(`${id}: a chosen path still saves and shows`, after.box === '/home/jared/Picked Folder' && after.stored === JSON.stringify('/home/jared/Picked Folder'), `box "${after.box}" stored ${after.stored}`);
		}
	});
}
