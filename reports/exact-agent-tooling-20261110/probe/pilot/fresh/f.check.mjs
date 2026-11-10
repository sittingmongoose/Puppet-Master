// Deterministic freshness cases. Each run picks one with --set case=. Cases 2 to 4 are expected to FAIL the run.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
export const tests = { async freshness(t) {
	const c = t.args.case;
	if (c === 'other-copy-raw-goto') {            // 4: a navigation that bypasses the helper lands on another build
		await t.app.open();
		await t.goto(`${pathToFileURL(t.args.other).href}?cb=${Date.now()}`);
		await t.until('ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1', null, { timeout: 60000 });
		await t.check('the test itself asserts nothing about the build', true);
		return;
	}
	await t.app.open();                            // 1 and 2: the helper checks the loaded document
	if (c === 'replaced-then-reload') {           // 3: the file changes on disk during the test, then a reload
		fs.copyFileSync(t.args.other, t.args.page);
		await t.app.reload();
	}
	await t.check('reached the end', true);
} };
