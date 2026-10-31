// Share builds must work in a sandboxed iframe (opaque origin, no storage): the app boots inside it (ready marker and
// PM_THEME in the child frame), its shell paints, and nothing errors.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function (t) {
	const html = path.join(t.run.dir, 'sandbox.html');
	fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style><iframe sandbox="allow-scripts" src="${t.cfg.pageUrl}${t.cfg.pageUrl.includes('?') ? '&' : '?'}cb=${Date.now()}&o55=off"></iframe>`);
	await t.goto(pathToFileURL(html).href, { settleMs: 500 });
	const frame = t.page.frames().find((f) => f !== t.page.mainFrame());
	const booted = !!frame && (await frame.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000 }).then(() => true, () => false));
	await t.check('app boots inside the sandboxed iframe', booted, frame ? 'no data-pmr-ready / PM_THEME in the child frame within 60 s' : 'no child frame');
	if (booted) {
		const shell = await frame.evaluate(() => { const r = document.querySelector('.app-shell')?.getBoundingClientRect(); return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; });
		await t.check('app shell laid out in the iframe', !!shell && shell.width > 100 && shell.height > 100, `shell rect ${JSON.stringify(shell)}`);
		// The iframe fills the page, so frame coordinates are page coordinates
		if (shell) await t.painted(shell, 'app shell paints inside the sandboxed iframe');
	}
	await t.noConsoleErrors('no errors in the sandboxed iframe');
}
