// Share builds must work in a sandboxed iframe (opaque origin, no storage): it boots with no errors and paints.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function (t) {
	const html = path.join(t.run.dir, 'sandbox.html');
	fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style><iframe sandbox="allow-scripts" src="${t.cfg.pageUrl}${t.cfg.pageUrl.includes('?') ? '&' : '?'}cb=${Date.now()}&o55=off"></iframe>`);
	await t.goto(pathToFileURL(html).href, { settleMs: 8000 });
	await t.painted('iframe', 'page paints inside the sandboxed iframe');
	await t.noConsoleErrors('no errors in the sandboxed iframe');
}
