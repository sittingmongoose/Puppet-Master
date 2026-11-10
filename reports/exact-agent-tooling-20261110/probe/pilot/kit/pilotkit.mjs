// Shared by both arms: open the page, and check after every load and at the end of every test that the page that is
// actually loaded is the build the run was started for. The identity is read from the loaded document, not from disk.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

export function makeConfig(ctx, { arm, helpers = {} }) {
	const page = path.resolve(ctx.args.page || path.join(ctx.configDir, 'page.html'));
	const sidecar = page.replace(/\.html$/, '.json');
	if (!fs.existsSync(page) || !fs.existsSync(sidecar)) throw new Error(`no page or no build record: ${page} and ${sidecar} must both exist`);
	const expected = JSON.parse(fs.readFileSync(sidecar, 'utf8')).app_build_id;
	const url = pathToFileURL(page).href;
	const receiptPath = path.resolve(ctx.args.receipt || path.join(ctx.configDir, 'receipt.json'));
	// Application build identity and what was observed of it. Test identity is added by the runner (oracle.py).
	const receipt = { schema: 'pm7-pilot.receipt.v1', arm, app: { page_path: page, expected_build_id: expected, page_file_sha256_at_start: sha(page), loads: [] }, fresh: null };
	const write = () => { receipt.fresh = receipt.app.loads.length > 0 && receipt.app.loads.every((l) => l.ok); fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 1)); };
	write();
	ctx.log(`page ${url} expected build ${expected.slice(0, 12)}`);
	let cb = 0;
	const pending = new WeakMap();
	const loadedId = (t) => t.page.evaluate(() => { const m = document.querySelector('meta[name="pm-build-id"]'); return m ? m.content : null; }).catch(() => null);
	async function verify(t, why) {
		const loaded = await loadedId(t);
		const ok = loaded === expected;
		receipt.app.loads.push({ why, url: t.page.url().replace(/[?#].*$/, ''), loaded_build_id: loaded, ok, at: new Date().toISOString() });
		write();
		return { ok, loaded };
	}
	const ready = (t) => t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
	return {
		name: 'pm7-pilot',
		viewport: { width: 1920, height: 1080 },
		consoleErrors: { fail: false },
		failedRequests: { fail: false },
		beforeEach: async (t) => {
			const list = []; pending.set(t.page, list);
			t.page.on('domcontentloaded', () => { if (!/^about:/.test(t.page.url())) list.push(verify(t, 'document loaded').catch(() => {})); });
		},
		afterEach: async (t) => {
			await Promise.all(pending.get(t.page) || []);
			const v = await verify(t, 'end of test');
			await t.check('the loaded page is the build this run expects', v.ok && receipt.app.loads.every((l) => l.ok), `expected ${expected.slice(0, 12)}, loaded ${String(v.loaded).slice(0, 12)}; ${receipt.app.loads.filter((l) => !l.ok).length} of ${receipt.app.loads.length} loads did not match`);
		},
		helpers: {
			// Load the page fresh (cache-buster, onboarding off), wait until it is ready, and refuse a wrong build.
			async open(t, { query = '' } = {}) {
				await t.goto(`${url}?cb=${Date.now()}-${++cb}&o55=off${query ? '&' + query : ''}`);
				await ready(t);
				await Promise.all(pending.get(t.page) || []);
				const v = await verify(t, 'open');
				await t.check('opened the expected build', v.ok, `expected ${expected.slice(0, 12)}, loaded ${String(v.loaded).slice(0, 12)}`, { hard: true });
				await t.settle();
			},
			async reload(t) {
				await t.page.reload();
				await ready(t);
				const v = await verify(t, 'reload');
				await t.check('reloaded the expected build', v.ok, `expected ${expected.slice(0, 12)}, loaded ${String(v.loaded).slice(0, 12)}`, { hard: true });
				await t.settle();
			},
			...helpers
		}
	};
}
