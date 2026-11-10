// Required behaviour: a real click on a file row's "Copy relative path" button shows a notification containing
// `cmd.file.copy_path -> <that row's path> (relative)`, for every file row shown at page open that has the button.
const toastIds = (t) => t.page.evaluate(() => [...document.querySelectorAll('.pmn-toast')].map((e) => e.getAttribute('data-pmn-id') || ''));

export const tests = {
	async 'copy relative path names the clicked row, for every shown file row that has the button'(t) {
		await t.app.open();

		// File rows shown when the page opens (rendered with a size, not inside a collapsed folder).
		const rows = await t.page.evaluate(() => [...document.querySelectorAll('#fmTree [role=treeitem][data-ui-element-id^="files.row#"]')]
			.filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; })
			.filter((e) => e.getAttribute('data-kind') !== 'folder' && !e.hasAttribute('aria-expanded'))
			.map((e) => ({
				key: e.dataset.uiElementId.slice('files.row#'.length),
				dataPath: e.getAttribute('data-path'),
				name: (e.querySelector('.fm-name')?.textContent || '').trim(),
				hasCopy: !!document.querySelector(`[data-ui-element-id=${JSON.stringify('files.row.copy_path#' + e.dataset.uiElementId.slice('files.row#'.length))}]`)
			})));
		const targets = rows.filter((r) => r.hasCopy);
		await t.check('the Files panel shows file rows with a "Copy relative path" button', targets.length >= 2, `found ${targets.length} of ${rows.length} shown file rows with the button`);

		for (const r of targets) {
			const path = r.key;
			await t.check(`row ${path}: its path from the root is consistent (id key, data-path, shown name)`, (r.dataPath == null || r.dataPath === path) && (!r.name || path === r.name || path.endsWith('/' + r.name)), `id key ${path}, data-path ${r.dataPath}, name ${r.name}`);
			const row = t.page.locator(`[data-ui-element-id=${JSON.stringify('files.row#' + path)}]`);
			const btn = t.page.locator(`[data-ui-element-id=${JSON.stringify('files.row.copy_path#' + path)}]`);
			await t.check(`row ${path}: exactly one row and one copy button`, (await row.count()) === 1 && (await btn.count()) === 1);
			// Let earlier copy-path notifications leave first, so a de-duplicated or merged notification cannot hide
			// what this click shows; anything copy-path on screen after the click then came from this click.
			await t.until(`row ${path}: earlier copy-path notifications have left`, () => ![...document.querySelectorAll('.pmn-toast')].some((e) => !e.classList.contains('pmn-leaving') && /cmd\.file\.copy_path/.test(e.textContent || '')) , null, { timeout: 20000 });
			await t.page.waitForFunction(() => ![...document.querySelectorAll('.pmn-toast')].some((e) => /cmd\.file\.copy_path/.test(e.textContent || '')), null, { timeout: 20000 }).catch(() => {});
			const before = new Set(await toastIds(t));
			await row.scrollIntoViewIfNeeded();
			await row.hover();
			await btn.click();
			let fresh = [];
			try {
				await t.page.waitForFunction((old) => [...document.querySelectorAll('.pmn-toast')].some((e) => !old.includes(e.getAttribute('data-pmn-id') || '') && /cmd\.file\.copy_path/.test(e.textContent || '')), [...before], { timeout: 5000 });
			} catch { /* reported below */ }
			fresh = await t.page.evaluate(() => [...document.querySelectorAll('.pmn-toast')].map((e) => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim()));
			const want = `cmd.file.copy_path -> ${path} (relative)`;
			const copyToasts = fresh.filter((s) => s.includes('cmd.file.copy_path'));
			await t.check(`row ${path}: click shows a notification "${want}"`, copyToasts.some((s) => s.includes(want)), `new notifications: ${JSON.stringify(fresh)}`);
			await t.check(`row ${path}: no new copy-path notification names another row`, copyToasts.every((s) => s.includes(want)), `new notifications: ${JSON.stringify(copyToasts)}`);
			await t.page.mouse.move(5, 1075);
		}
	}
};
