// FO-167 evidence for settings-confirm-once and settings-dialog-lines (fo-integ12b, 2026-11-13): a native capture of
// the quiet Memory page's delete confirm, "Delete this memory?", opened by a real click, on the surface asked for
// (--set sandbox=0|1), at 1390x900 in the page's default look. Not a gate: it asserts only that the dialog opened and
// was captured, and logs its title, message line, subtitle and alert strip so the image can be read against them.
//   browser-check run diagnostics/fo167-delete-confirm.check.mjs --set page=<build> --set sandbox=0|1 --set out=<dir>
import fs from 'node:fs';
import path from 'node:path';

const WS = 'context-memory';
const BODY = `[data-continuous-workspace-body="${WS}"]`;
const DIALOG = '#pm-settings-portals .overlay .dialog';

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-167 delete confirm, native capture (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const out = String(t.args.out || t.dir);
		fs.mkdirSync(out, { recursive: true });
		await t.viewport(1390, 900);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click({ timeout: 15000 }).catch(() => f.evaluate(() => document.getElementById('tab-settings').click()));
		await t.settle();
		await f.evaluate((ws) => PM51.go('memory', ws), WS);
		await f.waitForSelector(`${BODY}[data-workspace-mounted="true"]`, { timeout: 15000 });
		await t.settle();
		await f.locator(`${BODY} .mm-row[data-mm-note] [data-action="pm51-memory-delete"]`).first().click();
		await f.waitForSelector(DIALOG, { timeout: 8000 });
		await t.page.waitForTimeout(900);
		const info = await f.evaluate((sel) => {
			const d = document.querySelector(sel);
			const tx = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
			return { title: tx(d.querySelector('.dialog-title')), line: tx(d.querySelector('.mm-confirm-line')), sub: tx(d.querySelector('.dialog-sub')), alert: tx(d.querySelector('.dialog-body .alert-strip')), all: tx(d) };
		}, DIALOG);
		t.log(`dialog: ${JSON.stringify(info)}`);
		const bb = await f.locator(DIALOG).boundingBox();
		const file = path.join(out, `fo167-delete-confirm-${surface}-1390x900.png`);
		if (bb) await t.page.screenshot({ path: file, clip: { x: Math.max(0, bb.x - 12), y: Math.max(0, bb.y - 12), width: bb.width + 24, height: bb.height + 24 } });
		await t.page.screenshot({ path: path.join(out, `fo167-delete-confirm-${surface}-1390x900-full.png`) });
		await t.check(`${surface}: the delete confirm opened and was captured`, info.title === 'Delete this memory?' && !!bb && fs.existsSync(file), file);
	};
}
