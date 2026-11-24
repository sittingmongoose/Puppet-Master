// browser-check config for PuppetMaster's published page (Concepts/PMConcept7.html), per the PM7 plan's browser rules:
// file:// (the page is self-contained), a cache-buster on every load, ?o55=off,
// Explicit t.emulate media requests are re-applied by browser-check after navigation.
// No Reduced Motion default: checks must request reduce (or no-preference) themselves; one browser per run.
//   browser-check run Concepts/pm7-tools/browser-check/checks
//   browser-check run Concepts/pm7-tools/browser-check/checks --set page=/tmp/private-build.html
import fs from 'node:fs';
import path from 'node:path';
import { pageHref } from './helpers/page-path.mjs';

export const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-dark`, `${f}-light`]);
export const WIDTHS = [860, 1024, 1280, 1390, 1920];

// How look() paints (PM7PERF-CHATRUN-NIER-AFTER-VISIT). persist:false is not a Settings write, so a lingering
// onboarding preview (PM_NIER.previewing().loose) stays painted. A loose preview, or an explicit save, goes through
// Settings. Exported for tools/chat-look-visit.selftest.mjs.
export function lookRoute(name, preview, opts = {}) {
	const loose = !!(preview && preview.loose);
	const save = loose || !!(opts && opts.save);
	return { save, note: loose ? 'PM_NIER.previewing() is loose: the lingering onboarding preview is ended by a Settings write' : null, name };
}
// The same rule as look()'s "applied" row: NieR is on and the mode matches, otherwise data-theme is the name and NieR is off.
export function paintedLookHeld(name, got) {
	if (!got) return false;
	const [family, mode] = String(name || '').split('-');
	return family === 'nier' ? !!(got.nier && String(got.theme || '').endsWith('-' + mode)) : !got.nier && got.theme === name;
}

export default (ctx) => {
	const page = ctx.args.page || path.resolve(ctx.configDir, '..', '..', 'PMConcept7.html');
	// One parse (helpers/page-path.mjs): a URL scheme has 2+ letters; "C:\..." is a Windows path and becomes its
	// file: URL on any platform, so a --host-files run can load the copy on the browser's machine.
	const url = pageHref(page);
	if (/^file:/.test(url)) {
		if (ctx.fleet && !ctx.hostFiles) throw new Error('--host: a browser on another machine can\'t open this machine\'s file:// page. Use ssh and a checkout of the branch on that machine.');
		if (ctx.hostFiles) ctx.log(`page ${url} (--host-files: the file is on the browser's machine)`);
		else if (fs.existsSync(new URL(url))) ctx.log(`page ${url}`);
		else throw new Error(`no built page at ${page}; build it (python3 Concepts/onboarding/opus-5.5/tools/build.py --out <path>) and pass --set page=<path>`);
	} else ctx.log(`page ${url}`);
	let cb = 0;
	// One viewport for the run's config and for every check that does not ask for a size itself.
	const defaultViewport = { width: 1920, height: 1080 };
	// Set true when this test has asked for a size (t.viewport, page.setViewportSize, or t.newContext({viewport})).
	// Reset at each test; the default page's setViewportSize is wrapped once.
	let viewportChosen = false;
	let sizeWrapped = false;
	// True until this test's first t.app.open(): only that open resets the saved look and the viewport. Later
	// opens in the same test keep both, so a reopen/reload stand-in still sees what the check saved.
	let firstOpen = true;
	// One init script per context. A test's first open sets __pmBcFresh on the outgoing document; the next
	// document clears its own localStorage before any page script (the boot snippet reads the saved look there),
	// which also removes the look the outgoing page saved on pagehide. A later open does not set the flag, so a
	// check that saves and reloads still sees its write. The sandbox has no storage to clear.
	const freshContexts = new WeakSet();
	const armFresh = async (t) => {
		if (!freshContexts.has(t.context)) {
			freshContexts.add(t.context);
			await t.context.addInitScript(() => {
				try {
					if (sessionStorage.getItem('__pmBcFresh') === '1') {
						sessionStorage.removeItem('__pmBcFresh');
						localStorage.clear();
					}
				} catch (e) { /* the sandbox: no storage */ }
			});
		}
		const frames = [];
		if (t.root) frames.push(t.root);
		const main = t.page && t.page.mainFrame();
		if (main && main !== t.root) frames.push(main);
		for (const frame of frames) {
			await frame.evaluate(() => { try { sessionStorage.setItem('__pmBcFresh', '1'); } catch (e) { /* no storage */ } }).catch(() => {});
		}
	};
	// The one sandbox switch. --set sandbox=1: every check runs its page as T3's file preview shows it, inside
	// t.openInSandbox at its default flags (allow-scripts allow-forms allow-popups allow-downloads: an opaque origin, no
	// storage, no modals). --set sandbox=0: every check on a normal page, the provider checks too. Unset: each check's own
	// default (a normal page; the provider checks in the sandbox; a check's own sandbox case in the sandbox).
	let sandboxArg = ctx.args.sandbox === undefined || ctx.args.sandbox === '' ? null : !/^(0|false|no|off)$/i.test(String(ctx.args.sandbox));
	// the provider checks' old --set surface=normal|sandbox still means the same, by the new name
	if (sandboxArg === null && /^(normal|sandbox)$/.test(String(ctx.args.surface || ''))) { sandboxArg = ctx.args.surface === 'sandbox'; ctx.log(`--set surface=${ctx.args.surface} is the old name: use --set sandbox=${sandboxArg ? 1 : 0}`); }
	// Silent by default: see prepareContext below.
	const audible = /^(1|true|yes|on)$/i.test(String(ctx.args.audible || ''));
	const silenced = new WeakSet();
	const silence = async (context) => {
		if (audible || !context || silenced.has(context)) return;
		silenced.add(context);
		await context.addInitScript(() => {
				if (window.__bcSilent) return;
				const silent = window.__bcSilent = { routed: 0 };
				const AN = window.AudioNode && window.AudioNode.prototype;
				if (AN && window.AudioDestinationNode) {
					const connect = AN.connect, disconnect = AN.disconnect, quiet = new WeakMap();
					AN.connect = function (dest, ...rest) {
						if (dest instanceof window.AudioDestinationNode && dest.context && !(window.OfflineAudioContext && dest.context instanceof window.OfflineAudioContext)) {
							let g = quiet.get(dest);
							if (!g) { g = dest.context.createGain(); g.gain.value = 0; connect.call(g, dest); quiet.set(dest, g); }
							silent.routed++;
							connect.call(this, g, ...rest);
							return dest;
						}
						return connect.call(this, dest, ...rest);
					};
					// The reroute must keep disconnect's own semantics: disconnect(destination) translates to the
					// quiet gain it actually went through (ASTRA-L1C-K1), so it neither throws InvalidAccessError
					// nor leaks the direct wire back in; the index forms pass through the same way.
					AN.disconnect = function (dest, ...rest) {
						if (dest instanceof window.AudioDestinationNode && quiet.has(dest)) return disconnect.call(this, quiet.get(dest), ...rest);
						return disconnect.call(this, dest, ...rest);
					};
				}
				const ME = window.HTMLMediaElement && window.HTMLMediaElement.prototype;
				if (ME) {
					const play = ME.play; ME.play = function (...a) { this.muted = true; return play.apply(this, a); };
					// A native start (the autoplay attribute) never calls play(): catch it as it begins, on the
					// capture-phase play event every media element fires, and mute it there too (ASTRA-L1C-K2).
					document.addEventListener('play', (e) => { if (e.target instanceof window.HTMLMediaElement) e.target.muted = true; }, true);
				}
			});
	};
	return {
		name: 'puppetmaster',
		pageUrl: url,
		viewport: defaultViewport,
		consoleErrors: { fail: true, allow: [] },
		failedRequests: { fail: false },
		// Silent by default (Jared, 2026-11-10: test runs on his PC played the onboarding sounds). Every frame of every
		// context, sandboxed ones included, routes live Web Audio output (not offline renders) through a gain of 0 just before the speakers and
		// mutes media elements (a JS play() at the call, a native autoplay start at its play event). The audio engine itself still runs: contexts, unlock, logs, taps and analysers
		// ahead of the destination behave as before, so sound checks keep measuring. `--set audible=1` restores the speakers.
		prepareContext: async (t, context) => { await silence(context); },
		// A size the check asks for (t.viewport, page.setViewportSize, or t.newContext({viewport})) is kept.
		// Anything left by the previous check is not: the test's first open() puts the config viewport back
		// when this test has not asked for a size. The previous check's media emulation is cleared here too:
		// t.emulate persists run-wide and is re-applied after every navigation, and a leaked Reduced Motion
		// removes the onboarding transition's hold (screen-change-hold). A check requests its own motion itself.
		beforeEach: async (t) => {
			await silence(t.context);
			viewportChosen = false;
			firstOpen = true;
			t.run.media = null;
			await t.page.emulateMedia({ reducedMotion: null, colorScheme: null }).catch(() => {});
			const orig = t.viewport.bind(t);
			t.viewport = async (w, h) => { viewportChosen = true; return orig(w, h); };
			const newContext = t.newContext.bind(t);
			t.newContext = async (opts = {}) => { if (opts && 'viewport' in opts) viewportChosen = true; return newContext(opts); };
			if (!sizeWrapped) {
				sizeWrapped = true;
				const setSize = t.page.setViewportSize.bind(t.page);
				t.page.setViewportSize = async (size) => { viewportChosen = true; return setSize(size); };
			}
		},
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
				// Boundary between checks: only this test's first open starts from the default saved look and the
				// config viewport. Later opens keep both, so a reopen/reload stand-in still sees what the check
				// saved (the product saves on pagehide). A look asked for after the load is unchanged.
				if (firstOpen) {
					firstOpen = false;
					if (!viewportChosen) await t.viewport(defaultViewport.width, defaultViewport.height);
					await armFresh(t);
				}
				const sep = url.includes('?') ? '&' : '?';
				const u = `${url}${sep}cb=${Date.now()}-${++cb}${onboarding ? '' : '&o55=off'}${query ? '&' + query : ''}`;
				if (sandbox === true || sandboxArg === true) await t.openInSandbox(u, { settleMs });
				else await t.goto(u, { settleMs });
				await t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
				return t.root === t.page ? t.page.mainFrame() : t.root;
			},
			// One of the ten looks. Not persisted, unless a lingering onboarding preview would ignore that paint, or the
			// caller passes { save: true } (perf-chat-run re-applies the look under test after the window closes).
			// NieR is a theme family where PM_THEME knows it (canon after Q22), else the PM_NIER switch over a light or
			// dark mode; either way "on" is PM_NIER.on() or data-theme nier-*.
			async look(t, name, opts) {
				const [family, mode] = name.split('-');
				const f0 = t.root;
				const preview = await f0.evaluate(() => {
					const pv = window.PM_NIER && typeof PM_NIER.previewing === 'function' ? PM_NIER.previewing() : null;
					return pv ? { loose: !!pv.loose, on: !!pv.on } : null;
				}).catch(() => null);
				const route = lookRoute(name, preview, opts || {});
				if (route.note) t.log('NOTE look ' + name + ': ' + route.note);
				const via = await f0.evaluate(async ([f, m, save]) => {
					if (save && window.PM12_KIMI && typeof PM12_KIMI.setSettingFromHost === 'function') {
						PM12_KIMI.setSettingFromHost('general.visual.theme', f === 'nier' ? 'NieR' : f[0].toUpperCase() + f.slice(1));
						PM12_KIMI.setSettingFromHost('general.visual.theme-mode', m === 'light' ? 'Light' : 'Dark');
						return 'settings';
					}
					const nier = f === 'nier';
					PM_THEME.setMode(m, { persist: false });
					if (!nier && window.PM_NIER && PM_NIER.on()) await PM_NIER.set(false, { persist: false });
					try { PM_THEME.setFamily(f, { persist: false }); } catch (e) { if (!nier) throw e; }
					if (nier && !(document.documentElement.getAttribute('data-theme') || '').startsWith('nier') && window.PM_NIER) await PM_NIER.set(true, { persist: false });
					PM_THEME.setMode(m, { persist: false });
					return 'persist';
				}, [family, mode, route.save]);
				if (route.save && via !== 'settings') t.log('NOTE look ' + name + ': Settings host missing, painted with persist:false');
				const state = () => { const theme = document.documentElement.getAttribute('data-theme') || ''; return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') }; };
				// NieR's switch-on plays a transition first; wait for the painted state rather than a fixed time
				await f0.waitForFunction(([want, m]) => { const theme = document.documentElement.getAttribute('data-theme') || ''; const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier'); return nier === want && theme.endsWith('-' + m); }, [family === 'nier', mode], { timeout: 20000 }).catch(() => {});
				await t.page.waitForTimeout(500);
				// The painted look can come before the page takes input back: the NieR reboot's plate is pointer-transparent
				// over the page and holds trusted presses until its reveal, so a click sent in between is swallowed while a
				// hit-test already lands on the control (KIT-LOOKCOVER). Wait for the page's own cover signal — the same
				// task that releases the hold sets the plate's pointer-events to none — and fail loudly if it never clears.
				const coverMs = 20000, coverAt = Date.now();
				try {
					await f0.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: coverMs });
				} catch (e) {
					const cover = await f0.evaluate(() => {
						const say = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return `#${el.id || el.className || el.tagName}${el.id ? '' : '.' + String(el.className?.baseVal ?? el.className)} at ${[b.left, b.top, b.width, b.height].map((v) => Math.round(v)).join(',')}${el.style && el.style.pointerEvents ? `, pointer-events ${el.style.pointerEvents}` : ', pointer-events not released'}`; };
						const plate = document.getElementById('o55np-reboot'), calm = document.getElementById('o55np-calm');
						const busy = !!(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy());
						return { theme: document.documentElement.getAttribute('data-theme') || '', busy, plate: say(plate), calm: say(calm) };
					}).catch(() => null);
					const held = cover ? [cover.plate && 'the NieR reboot plate ' + cover.plate, cover.calm && 'the calm cover ' + cover.calm, cover.busy && 'PM_THEME_TRANSITION.busy()'].filter(Boolean).join('; ') : '';
					await t.check(`look ${name} cover clears`, false, `PM_LOOK_COVERED() stayed true for ${coverMs} ms with the pointer held${held ? ' by ' + held : ''}${cover && cover.theme ? ` (data-theme ${cover.theme})` : ''}; a press sent now would be lost`, { hard: true });
				}
				t.log(`look ${name}: cover clear (PM_LOOK_COVERED() false) ${Date.now() - coverAt} ms after the painted state`);
				const got = await f0.evaluate(state);
				const ok = paintedLookHeld(name, got);
				return t.check(`look ${name} applied`, ok, `data-theme ${got.theme}, NieR ${got.nier ? 'on' : 'off'}`);
			},
			// Home panels write localStorage as the page goes away (pagehide, which fires once the document is already
			// hidden): clear what they wrote and drop only the going-away window's writes, so saves the rest of the
			// page's life still work (OPUS-FO163-T1: with setItem a no-op for good, the FO-163 reset flows could not
			// verify a single write). The sandbox has no storage to clear.
			async resetLayout(t) {
				await t.root.evaluate(() => {
					const proto = Storage.prototype, orig = proto.setItem;
					if (typeof orig === 'function' && !orig.__pmResetLayout) {
						proto.setItem = function (k, v) { return document.visibilityState === 'hidden' ? undefined : orig.call(this, k, v); };
						proto.setItem.__pmResetLayout = true;
					}
					try { localStorage.clear(); } catch (e) { /* the sandbox: no storage */ }
				});
			}
		}
	};
};
