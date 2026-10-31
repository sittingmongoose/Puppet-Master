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
	// A URL scheme has 2+ letters; "C:\..." is a Windows path
	const url = /^[a-z][a-z0-9+.-]+:/i.test(page) ? page : pathToFileURL(path.resolve(page)).href;
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
			// One of the ten looks, not persisted. NieR is a theme family where PM_THEME knows it (canon after Q22),
			// else the PM_NIER switch over a light or dark mode; either way "on" is PM_NIER.on() or data-theme nier-*.
			async look(t, name) {
				const [family, mode] = name.split('-');
				await t.page.evaluate(async ([f, m]) => {
					const nier = f === 'nier';
					PM_THEME.setMode(m, { persist: false });
					if (!nier && window.PM_NIER && PM_NIER.on()) await PM_NIER.set(false, { persist: false });
					try { PM_THEME.setFamily(f, { persist: false }); } catch (e) { if (!nier) throw e; }
					if (nier && !(document.documentElement.getAttribute('data-theme') || '').startsWith('nier') && window.PM_NIER) await PM_NIER.set(true, { persist: false });
					PM_THEME.setMode(m, { persist: false });
				}, [family, mode]);
				const state = () => { const theme = document.documentElement.getAttribute('data-theme') || ''; return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') }; };
				// NieR's switch-on plays a transition first; wait for the painted state rather than a fixed time
				await t.page.waitForFunction(([want, m]) => { const theme = document.documentElement.getAttribute('data-theme') || ''; const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier'); return nier === want && theme.endsWith('-' + m); }, [family === 'nier', mode], { timeout: 20000 }).catch(() => {});
				await t.page.waitForTimeout(500);
				const got = await t.page.evaluate(state);
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
