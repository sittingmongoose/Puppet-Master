export const tests = { async 'each file row copies its own path'(t) {
	await t.app.open();
	const paths = await t.page.evaluate(() => [...document.querySelectorAll('#fmTree .fm-row[data-path]:not([data-kind=folder])')].filter((r) => r.getBoundingClientRect().height > 0 && r.querySelector('button[title="Copy relative path"]')).map((r) => r.dataset.path));
	await t.check('some file rows with the button are shown', paths.length >= 5, String(paths.length));
	for (const p of paths) {
		const row = t.page.locator(`#fmTree .fm-row[data-path=${JSON.stringify(p)}]`);
		await t.page.evaluate(() => { for (const e of document.querySelectorAll('.pmn-toast')) e.dataset.seen = '1'; });
		await row.hover();
		await row.locator('button[title="Copy relative path"]').click();
		await t.page.waitForFunction(() => document.querySelector('.pmn-toast:not([data-seen])'), null, { timeout: 5000 }).catch(() => {});
		const texts = await t.page.evaluate(() => [...document.querySelectorAll('.pmn-toast:not([data-seen])')].map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
		await t.check(`${p}: the notification names this row`, texts.length === 1 && texts[0].includes(`cmd.file.copy_path -> ${p} (relative)`), JSON.stringify(texts));
	}
} };
