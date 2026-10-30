// browser-check config for PuppetMaster's published page (Concepts/PMConcept7.html), per the PM7 plan's browser rules:
// file:// (agent-browser's Chrome can't reliably reach a local http.server), a cache-buster on every load, ?o55=off,
// reduced motion re-applied and confirmed after each navigation, one browser per run.
//   browser-check run Concepts/pm7-tools/browser-check/checks
//   browser-check run Concepts/pm7-tools/browser-check/checks --set page=/tmp/private-build.html
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-dark`, `${f}-light`]);
export const WIDTHS = [860, 1024, 1280, 1390, 1920];

export default (ctx) => {
	const page = ctx.args.page || path.resolve(ctx.configDir, '..', '..', 'PMConcept7.html');
	const url = /^[a-z]+:/i.test(page) ? page : pathToFileURL(path.resolve(page)).href;
	if (!/^file:/.test(url) || fs.existsSync(new URL(url))) ctx.log(`page ${url}`);
	else throw new Error(`no built page at ${page}; build it (tools/build.py --publish-pm7) or pass --set page=<path>`);
	let cb = 0;
	return {
		name: 'puppetmaster',
		pageUrl: url,
		viewport: { width: 1920, height: 1080 },
		consoleErrors: { fail: true, allow: [] },
		failedRequests: { fail: false },
		helpers: {
			// Load the page fresh: cache-buster, onboarding off unless asked, settled
			async open(t, { onboarding = false, query = '', settleMs = 3000 } = {}) {
				const sep = url.includes('?') ? '&' : '?';
				await t.goto(`${url}${sep}cb=${Date.now()}-${++cb}${onboarding ? '' : '&o55=off'}${query ? '&' + query : ''}`, { settleMs });
				return t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 30000, hard: true });
			},
			// One of the ten looks, not persisted. NieR is its own switch (PM_NIER) over a light or dark mode.
			async look(t, name) {
				const [family, mode] = name.split('-');
				await t.page.evaluate(async ([f, m]) => {
					const nier = f === 'nier';
					if (window.PM_NIER) await PM_NIER.set(nier, { persist: false });
					if (!nier) PM_THEME.setFamily(f, { persist: false });
					PM_THEME.setMode(m, { persist: false });
				}, [family, mode]);
				// NieR's switch-on plays a transition first; wait for the painted state rather than a fixed time
				await t.page.waitForFunction(([nier, m]) => !!(window.PM_NIER && PM_NIER.on()) === nier && (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), [family === 'nier', mode], { timeout: 20000 }).catch(() => {});
				await t.page.waitForTimeout(500);
				const got = await t.page.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), nier: !!(window.PM_NIER && PM_NIER.on()) }));
				const ok = family === 'nier' ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === name;
				return t.check(`look ${name} applied`, ok, `data-theme ${got.theme}, NieR ${got.nier ? 'on' : 'off'}`);
			},
			// Home panels write localStorage on unload: block that and clear, so the next load starts from defaults
			async resetLayout(t) {
				await t.page.evaluate(() => { Storage.prototype.setItem = () => {}; localStorage.clear(); });
			}
		}
	};
};
