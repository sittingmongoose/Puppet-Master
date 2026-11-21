// browser-check exec -- node tools/settings-confirm-once.selftest.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { openManagerTab } from '../checks/settings-confirm-once.check.mjs';

const { BROWSER_CHECK_CDP, BROWSER_CHECK_RELEASE_HOME, BROWSER_CHECK_RELEASE } = process.env;
assert.ok(BROWSER_CHECK_CDP, 'run this self-test through browser-check exec');
const runtime = BROWSER_CHECK_RELEASE
	? path.join(path.dirname(BROWSER_CHECK_RELEASE_HOME), `${path.basename(BROWSER_CHECK_RELEASE_HOME)}-releases`, BROWSER_CHECK_RELEASE)
	: process.cwd();
const { chromium } = createRequire(path.join(runtime, 'package.json'))('playwright-core');
const browser = await chromium.connectOverCDP(BROWSER_CHECK_CDP);
try {
	const page = await browser.newPage();
	for (const swap of [false, true]) {
		await page.setContent(`
			<div data-continuous-workspace-body="tools">
				<div class="pm51-mgr">
					<nav class="pm51-tabs">
						<button class="manager-tab active" data-tab="testing">Testing</button>
						<button class="manager-tab" data-tab="debug">Debug</button>
					</nav>
					<div class="manager-body">Testing controls</div>
				</div>
			</div>
		`);
		await page.evaluate((swap) => {
			const manager = document.querySelector('.pm51-mgr');
			const outgoing = manager.querySelector('.manager-body');
			const debug = manager.querySelector('[data-tab="debug"]');
			let polls = 0;
			const query = manager.querySelector.bind(manager);
			manager.querySelector = (selector) => {
				if (selector === ':scope > .manager-body' && debug.classList.contains('active') && ++polls === 1 && swap) {
					// Make the first real polling call see the outgoing body, even on a busy host.
					requestAnimationFrame(() => setTimeout(() => {
						const incoming = outgoing.cloneNode();
						incoming.innerHTML = '<button>Reset debug settings</button>';
						outgoing.replaceWith(incoming);
					}, 0));
				}
				return query(selector);
			};
			debug.addEventListener('click', () => {
				manager.querySelector('.manager-tab.active').classList.remove('active');
				debug.classList.add('active');
			});
			Object.defineProperty(manager, 'pollCount', { get: () => polls });
		}, swap);
		let predicateValue;
		const frame = {
			locator: page.locator.bind(page),
			evaluateHandle: page.evaluateHandle.bind(page),
			async waitForFunction(predicate, arg, options) {
				const handle = await page.waitForFunction(predicate, arg, { ...options, timeout: 1000 });
				predicateValue = await handle.jsonValue();
				return handle;
			},
		};
		const ready = await openManagerTab(frame, 'tools', 'debug');
		const state = await page.locator('.pm51-mgr').evaluate((manager) => ({
			polls: manager.pollCount,
			body: manager.querySelector('.manager-body').textContent,
		}));
		assert.equal(ready, swap, `readiness with swap=${swap}: ${JSON.stringify({ ...state, predicateValue, ready })}`);
		assert.ok(state.polls > 1, 'Playwright must poll again after seeing the outgoing body');
		assert.equal(state.body, swap ? 'Reset debug settings' : 'Testing controls');
	}
	console.log('Settings manager readiness rejects a stalled swap and waits for a delayed replacement');
} finally {
	await browser.close();
}
