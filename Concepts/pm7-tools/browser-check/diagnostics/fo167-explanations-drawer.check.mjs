// FO-167 evidence for settings-home-row-inset (fo-integ12b, 2026-11-13): General › App & Input › "Show all explanations"
// opened by real clicks on the surface asked for (--set sandbox=0|1) at 1390x900 in the page's default look. Logs every
// drawer row as "section | label | lines" (diff two builds' logs to see which rows one adds) and captures natively the
// section card that holds the rows named by --set labels=<a|b> (default: every card), plus the whole drawer.
// Not a gate: it asserts only that the drawer opened and was captured.
//   browser-check run diagnostics/fo167-explanations-drawer.check.mjs --set page=<build> --set sandbox=0|1 --set out=<dir>
import fs from 'node:fs';
import path from 'node:path';

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-167 App & Input explanations drawer, rows and capture (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const out = String(t.args.out || t.dir);
		fs.mkdirSync(out, { recursive: true });
		await t.viewport(1390, 900);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
		await t.settle();
		await f.evaluate(() => window.PM51.go('general', 'app-input'));
		const opt = f.locator('#pm-settings-root [data-action="page-options"]').first();
		await opt.waitFor({ state: 'visible', timeout: 10000 });
		await opt.click();
		const item = f.getByText('Show all explanations', { exact: true }).first();
		await item.waitFor({ state: 'visible', timeout: 8000 });
		await item.click();
		await f.waitForFunction(() => [...document.querySelectorAll('#panel-settings .panel-card > .setup-row')].some((r) => r.checkVisibility()), null, { timeout: 8000 });
		await t.page.waitForTimeout(900);
		const rows = await f.evaluate(() => [...document.querySelectorAll('#panel-settings .panel-card > .setup-row')].filter((r) => r.checkVisibility()).map((row, i) => {
			const card = row.closest('.panel-card');
			const label = row.querySelector('.setup-label');
			const lines = (el) => { if (!el) return 0; const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].filter((b) => b.width > 0.5).map((b) => Math.round(b.top))).size; };
			card.setAttribute('data-fo167-card', String([...document.querySelectorAll('#panel-settings .panel-card')].indexOf(card)));
			return { section: (card.querySelector('.panel-title') || {}).textContent || '?', label: label ? label.textContent.trim() : '?', lines: lines(label) + lines(row.querySelector('.setup-meta')), card: card.getAttribute('data-fo167-card') };
		}));
		for (const r of rows) t.log(`row | ${r.section} | ${r.label} | ${r.lines}`);
		t.log(`${rows.length} rows, ${rows.reduce((n, r) => n + r.lines, 0)} lines`);
		const want = t.args.labels ? String(t.args.labels).split('|') : null;
		const cards = [...new Set(rows.filter((r) => !want || want.includes(r.label)).map((r) => r.card))];
		for (const c of cards) {
			const loc = f.locator(`[data-fo167-card="${c}"]`).first();
			await loc.scrollIntoViewIfNeeded().catch(() => {});
			await t.page.waitForTimeout(300);
			const bb = await loc.boundingBox();
			if (bb) await t.page.screenshot({ path: path.join(out, `drawer-${surface}-card${c}.png`), clip: { x: Math.max(0, bb.x - 8), y: Math.max(0, bb.y - 8), width: bb.width + 16, height: bb.height + 16 } });
		}
		/* each named row in view with its section card's edges and a row either side of it */
		for (const [i, label] of (want || []).entries()) {
			const row = f.locator('#panel-settings .panel-card > .setup-row').filter({ has: f.locator('.setup-label', { hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) }).first();
			if (!(await row.count())) { t.log(`row not found: ${label}`); continue; }
			await row.scrollIntoViewIfNeeded().catch(() => {});
			await t.page.waitForTimeout(300);
			const rb = await row.boundingBox();
			const cb = await row.locator('xpath=ancestor::*[contains(@class,"panel-card")][1]').boundingBox();
			if (rb && cb) await t.page.screenshot({ path: path.join(out, `drawer-${surface}-row${i + 1}.png`), clip: { x: Math.max(0, cb.x - 8), y: Math.max(0, rb.y - 90), width: cb.width + 16, height: rb.height + 180 } });
		}
		await t.page.screenshot({ path: path.join(out, `drawer-${surface}-full.png`) });
		await t.check(`${surface}: the drawer opened (${rows.length} rows) and ${cards.length} card(s) were captured`, rows.length > 0 && cards.length > 0, out);
	};
}
