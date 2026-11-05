// browser-check config for PuppetMaster's published page (Concepts/PMConcept7.html), per the PM7 plan's browser rules:
// file:// (the page is self-contained), a cache-buster on every load, ?o55=off,
// Explicit t.emulate media requests are re-applied by browser-check after navigation.
// No Reduced Motion default: checks must request reduce (or no-preference) themselves; one browser per run.
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
	else throw new Error(`no built page at ${page}; build it (python3 Concepts/onboarding/opus-5.5/tools/build.py --out <path>) and pass --set page=<path>`);
	if (ctx.fleet && /^file:/.test(url)) throw new Error('--host: a browser on another machine can\'t open this machine\'s file:// page. Use ssh and a checkout of the branch on that machine.');
	let cb = 0;
	// The one sandbox switch. --set sandbox=1: every check runs its page as T3's file preview shows it, inside
	// t.openInSandbox at its default flags (allow-scripts allow-forms allow-popups allow-downloads: an opaque origin, no
	// storage, no modals). --set sandbox=0: every check on a normal page, the provider checks too. Unset: each check's own
	// default (a normal page; the provider checks in the sandbox; a check's own sandbox case in the sandbox).
	let sandboxArg = ctx.args.sandbox === undefined || ctx.args.sandbox === '' ? null : !/^(0|false|no|off)$/i.test(String(ctx.args.sandbox));
	// the provider checks' old --set surface=normal|sandbox still means the same, by the new name
	if (sandboxArg === null && /^(normal|sandbox)$/.test(String(ctx.args.surface || ''))) { sandboxArg = ctx.args.surface === 'sandbox'; ctx.log(`--set surface=${ctx.args.surface} is the old name: use --set sandbox=${sandboxArg ? 1 : 0}`); }
	return {
		name: 'puppetmaster',
		pageUrl: url,
		viewport: { width: 1920, height: 1080 },
		consoleErrors: { fail: true, allow: [] },
		failedRequests: { fail: false },
		helpers: {
			// Whether this check runs in the sandbox: the switch when it is given, else the check's own default
			sandboxed(t, own = false) { return sandboxArg === null ? own : sandboxArg; },
			// The surfaces a check that covers both runs: both unless the switch picks one
			surfaces() { return sandboxArg === null ? ['normal', 'sandbox'] : sandboxArg ? ['sandbox'] : ['normal']; },
			// Load the page fresh: cache-buster, onboarding off unless asked, settled. In the sandbox when the switch says so,
			// or when the check asks (sandbox: true, its own sandbox case; sandbox: false, its normal-page case, which the
			// switch at 1 also puts in the sandbox). Returns the frame the app is in, which t.root (what t.until, t.css and the
			// other checks look at) also is: the page's main frame, or the sandbox's.
			async open(t, { onboarding = false, query = '', settleMs = 300, sandbox } = {}) {
				const sep = url.includes('?') ? '&' : '?';
				const u = `${url}${sep}cb=${Date.now()}-${++cb}${onboarding ? '' : '&o55=off'}${query ? '&' + query : ''}`;
				if (sandbox === true || sandboxArg === true) await t.openInSandbox(u, { settleMs });
				else await t.goto(u, { settleMs });
				await t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
				return t.root === t.page ? t.page.mainFrame() : t.root;
			},
			// One of the ten looks, not persisted. NieR is a theme family where PM_THEME knows it (canon after Q22),
			// else the PM_NIER switch over a light or dark mode; either way "on" is PM_NIER.on() or data-theme nier-*.
			async look(t, name) {
				const [family, mode] = name.split('-');
				const f0 = t.root;
				await f0.evaluate(async ([f, m]) => {
					const nier = f === 'nier';
					PM_THEME.setMode(m, { persist: false });
					if (!nier && window.PM_NIER && PM_NIER.on()) await PM_NIER.set(false, { persist: false });
					try { PM_THEME.setFamily(f, { persist: false }); } catch (e) { if (!nier) throw e; }
					if (nier && !(document.documentElement.getAttribute('data-theme') || '').startsWith('nier') && window.PM_NIER) await PM_NIER.set(true, { persist: false });
					PM_THEME.setMode(m, { persist: false });
				}, [family, mode]);
				const state = () => { const theme = document.documentElement.getAttribute('data-theme') || ''; return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') }; };
				// NieR's switch-on plays a transition first; wait for the painted state rather than a fixed time
				await f0.waitForFunction(([want, m]) => { const theme = document.documentElement.getAttribute('data-theme') || ''; const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier'); return nier === want && theme.endsWith('-' + m); }, [family === 'nier', mode], { timeout: 20000 }).catch(() => {});
				await t.page.waitForTimeout(500);
				const got = await f0.evaluate(state);
				const ok = family === 'nier' ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === name;
				return t.check(`look ${name} applied`, ok, `data-theme ${got.theme}, NieR ${got.nier ? 'on' : 'off'}`);
			},
			// Home panels write localStorage on unload: block that and clear, so the next load starts from defaults (the
			// sandbox has no storage to clear)
			async resetLayout(t) {
				await t.root.evaluate(() => { Storage.prototype.setItem = () => {}; try { localStorage.clear(); } catch (e) { /* the sandbox: no storage */ } });
			}
		}
	};
};
