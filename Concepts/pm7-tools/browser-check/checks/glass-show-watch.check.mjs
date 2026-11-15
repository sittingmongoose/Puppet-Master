// E3 (pm7-perf stream, 2026-11-15): a hidden lens comes back by events, not by a 400 ms poll. glass.js now watches
// every hidden lens's strip with a per-strip ResizeObserver (showWatch): a box that goes from at most 1 px to more
// than 1 px in either axis runs the hidden-lens check once through onLayout. A 2000 ms safety-net timer remains for
// what no observer reports (a visibility-only change: inline visibility, a stylesheet visibility keyed to an
// unobserved attribute), re-armed only from inside the check and only while a lens is hidden. Spec: the share's
// 2026-11-11-pm7-performance/followups/E3-glass-poll.md, test rows 1, 2, 3, 4, 9 and 13 (the lead's QW4 budgets).
//
// Rows, per Glass look (Glass Dark and Light), both surfaces, 1920x1080:
//   1  inline display: nav.page-tabs style.display='none', lens out, then '' again: lens back within 40 ms
//      (the ResizeObserver wake; one frame plus layout). FAILS on main: no observer sees an inline style, the
//      400 ms poll answers it (up to 400 ms).
//   2  inline visibility: style.visibility='hidden' then '': lens back within 2200 ms. By design no observer sees
//      this (edit 1 of the spec was not done): the safety net answers it. Passes on main too (its poll is faster).
//   3  stylesheet visibility (case C): a temporary <style> nav.page-tabs { visibility: hidden } in <head>, then
//      removed: lens back within 2200 ms (the safety-net interval + one layout). Documents the fallback; if the
//      net is ever deleted by audit, remove this row on purpose, not leave it failing.
//   4  ancestor class: the Usage page's own hiding class (.primary-content > .page loses and regains 'active',
//      display:none via class): lens back within 40 ms. mo's class record already covered this; the row guards it.
//   9  onboarding window: opened with data-o55-solid (the visibility:hidden sheet rule at 10-window.css:27 is
//      asserted to apply), the behind-window lens out within 200 ms of the open call; on close, back within
//      200 ms of the removal of data-o55-open (the root observer's own trigger). The window's exit animation runs
//      before that removal; the wall time from the close() call is logged, not judged.
//   13 resting wake count: with one strip hidden by row 1's method, a setTimeout wrapper installed before the
//      page's scripts run counts the timers asked for from glass.js (the lg-js block's lines) with delay 400 or
//      2000 ms over 10 s: at most 6 requests and none at 400 ms. FAILS on main (about 25 requests in 10 s, all
//      400 ms: the poll re-arms 2.5 times a second for as long as any lens is hidden, and in the Glass looks some
//      strip always is). The branch's net asks about 5 in 10 s. Then the strip is shown and the lens must appear
//      within row 1's budget.
//
// WRITTEN WITHOUT A BROWSER RUN (the lead runs the checks). What the lead must confirm:
//   - Row 4's 40 ms budget is the spec's. A class change on .page alone is not HOT in glass.js's mo handler, so it
//     syncs through lazySync's 140 ms debounce (glass.js lazySync): if the row measures about 140-160 ms on BOTH
//     main and the branch, the budget needs the lead's ruling (the mo path owns this row, not the poll); the
//     measured ms is logged for that decision.
//   - The hide direction of rows 1-3 is discovered by the app's ambient writes (an inline style or a <head> sheet
//     is not observed; edit 1 was deliberately not done). If no ambient sync has put the lens out within 1200 ms,
//     the check calls PM_LG.sync() once (the spec's named hook) and logs it; the appearance budget is measured
//     from the show write either way.
//   - Timings are rAF-sampled (±1 frame) from the DOM write to the lens's inline opacity leaving '0' (or coming
//     back with visibility not hidden), the spec's measure; budgets assume the 120 fps target.
//   - Row 13's attribution is the built page's lg-js block (helpers/built-source.mjs); confirm the counts
//     (about 5 on the branch, about 25 on main) and that no other glass.js timer at 400/2000 ms fires at rest.
//   --set looks=glass-dark   --set size=1920x1080   --set settle=6000
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { pageSource, blocksOf } from '../helpers/built-source.mjs';

const LOOKS = ['glass-dark', 'glass-light'];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

/* installed before the page's scripts: counts setTimeout REQUESTS (not firings) with delay 400 or 2000 ms whose
   asking stack's innermost page frame lies in the lg-js block (glass.js). Everything else is forwarded untouched. */
const TIMER_PROBE = (range) => {
	const P = window.__swt = { armed: false, n400: 0, n2000: 0, sites: [] };
	const real = window.setTimeout;
	const lineOf = () => {
		const lines = String(new Error().stack || '').split('\n');
		for (let i = 3; i < lines.length; i++) { const m = /:(\d+):\d+/.exec(lines[i]); if (m) return Number(m[1]); }
		return -1;
	};
	window.setTimeout = function (fn, delay, ...rest) {
		const d = delay | 0;
		if (P.armed && typeof fn === 'function' && (d === 400 || d === 2000)) {
			const l = lineOf();
			if (l >= range.from && l <= range.to) {
				if (d === 400) P.n400++; else P.n2000++;
				if (P.sites.length < 6) P.sites.push(d + 'ms@' + l);
			}
		}
		return real.call(window, fn, delay, ...rest);
	};
	P.arm = () => { P.n400 = 0; P.n2000 = 0; P.sites = []; P.armed = true; };
	P.read = () => { P.armed = false; return { n400: P.n400, n2000: P.n2000, sites: P.sites }; };
};

/* in the page: the lens over a strip's chosen item, captured while shown (its box stays when it goes out), and an
   rAF-sampled wait for its inline opacity to leave '0' or come back */
const PROBE = () => {
	const lensOver = (item) => {
		const r = item.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
		for (const l of document.querySelectorAll('i.lg-lens:not(.lg-bead)')) {
			const b = l.getBoundingClientRect();
			if (b.width < 2 || b.height < 2) continue;
			if (cx >= b.left - 1 && cx <= b.right + 1 && cy >= b.top - 1 && cy <= b.bottom + 1) return l;
		}
		return null;
	};
	window.__gsw = {
		lens: null, t0: 0, tGone: 0, tClose: 0,
		capture(sel, itemSel) {
			const strip = document.querySelector(sel);
			const item = strip && strip.querySelector(itemSel || '.active');
			this.lens = item ? lensOver(item) : null;
			return !!this.lens;
		},
		mark() { this.t0 = performance.now(); },
		out() { return !!this.lens && (!this.lens.isConnected || this.lens.style.opacity === '0'); },
		back() { return !!this.lens && this.lens.isConnected && this.lens.style.opacity !== '0' && getComputedStyle(this.lens).visibility !== 'hidden'; },
		/* ms from the last mark() (fromGone: from the recorded removal of data-o55-open instead) */
		wait(state, timeout, fromGone) {
			const want = state === 'out' ? () => this.out() : () => this.back();
			return new Promise((resolve) => {
				const start = performance.now();
				const tick = () => {
					const from = fromGone ? this.tGone : this.t0;
					if (from && want()) { resolve({ ok: true, ms: performance.now() - from }); return; }
					if (performance.now() - start > timeout) { resolve({ ok: false, ms: from ? performance.now() - from : -1 }); return; }
					requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			});
		}
	};
};

/* hide nav.page-tabs by inline display, inline visibility, or a temporary head stylesheet; wait for the lens to go
   out (ambient app writes discover the hide; PM_LG.sync() once as the fallback, logged) */
async function hideTabs(f, how) {
	await f.evaluate((h) => {
		window.__gsw.mark();
		const s = document.querySelector('nav.page-tabs');
		if (h === 'display') s.style.display = 'none';
		else if (h === 'visibility') s.style.visibility = 'hidden';
		else { const st = document.createElement('style'); st.id = 'gsw-case-c'; st.textContent = 'nav.page-tabs { visibility: hidden }'; document.head.appendChild(st); }
	}, how);
	let out = await f.evaluate(() => window.__gsw.wait('out', 1200));
	let hooked = false;
	if (!out.ok) {
		hooked = true;
		await f.evaluate(() => PM_LG.sync());
		out = await f.evaluate(() => window.__gsw.wait('out', 600));
	}
	return { ...out, hooked };
}

async function showTabs(f, how) {
	await f.evaluate((h) => {
		window.__gsw.mark();
		const s = document.querySelector('nav.page-tabs');
		if (h === 'display') s.style.display = '';
		else if (h === 'visibility') s.style.visibility = '';
		else { const st = document.getElementById('gsw-case-c'); if (st) st.remove(); }
	}, how);
}

async function cell(t, surface, W, H) {
	const src = await pageSource(t);
	const lg = blocksOf(src).find((b) => b.id === 'lg-js');
	await t.check(`the built page carries the lg-js block ${surface}`, !!lg, lg ? `lines ${lg.from}-${lg.to}` : 'no script#lg-js: glass.js timers cannot be attributed', { hard: true });
	if (!lg) return;
	await t.page.addInitScript(TIMER_PROBE, { from: lg.from, to: lg.to });
	const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
	await f.evaluate(PROBE);
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 6000));

	for (const look of list(t.args.looks, LOOKS)) {
		const tag = `${look} ${surface}`;
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(2500);
		const on = await f.evaluate((w) => document.documentElement.getAttribute('data-theme') === w && document.documentElement.getAttribute('data-lg') === 'on', look);
		await t.check(`Glass is on in ${tag}`, on, '', { hard: true });
		if (!on) continue;

		/* rows 1-3: nav.page-tabs, the lens captured while shown */
		for (const [row, how, budget] of [[1, 'display', 40], [2, 'visibility', 2200], [3, 'sheet', 2200]]) {
			const cap = await f.evaluate(() => window.__gsw.capture('nav.page-tabs', '.page-tab.active'));
			const shown = cap && await f.evaluate(() => window.__gsw.back());
			await t.check(`row ${row}: the page-tabs lens is shown before the hide ${tag}`, shown, cap ? 'lens out already' : 'no lens over the active tab: could not judge', { hard: true });
			if (!shown) continue;
			const out = await hideTabs(f, how);
			await t.check(`row ${row}: the hide puts the lens out ${tag}`, out.ok, out.ok ? `${Math.round(out.ms)} ms${out.hooked ? ' (PM_LG.sync() fallback: no ambient sync discovered the hide in 1200 ms)' : ''}` : 'lens still shown after 1200 ms and PM_LG.sync()');
			if (!out.ok) { await showTabs(f, how); continue; }
			await showTabs(f, how);
			const back = await f.evaluate((b) => window.__gsw.wait('back', b + 2000), budget);
			t.log(`row ${row} ${tag}: lens back in ${Math.round(back.ms)} ms (budget ${budget} ms)`);
			await t.check(`row ${row}: the lens appears within ${budget} ms ${tag}`, back.ok && back.ms <= budget, `${Math.round(back.ms)} ms`);
			await t.page.waitForTimeout(400);
		}

		/* row 4: the Usage page's own hiding class on .primary-content > .page (display:none via class) */
		await f.evaluate(() => PM_PAGES.go('usage'));
		await t.page.waitForTimeout(2000);
		{
			const cap = await f.evaluate(() => window.__gsw.capture('#pmuRange', ':scope > button.active'));
			const shown = cap && await f.evaluate(() => window.__gsw.back());
			await t.check(`row 4: the Usage range lens is shown ${tag}`, shown, cap ? 'lens out already' : 'no lens over the chosen range button: could not judge', { hard: true });
			if (shown) {
				await f.evaluate(() => { window.__gsw.mark(); document.querySelector('#pmuRange').closest('.primary-content > .page').classList.remove('active'); });
				const out = await f.evaluate(() => window.__gsw.wait('out', 2000));
				await t.check(`row 4: the page class hide puts the lens out ${tag}`, out.ok, `${Math.round(out.ms)} ms`);
				await f.evaluate(() => { window.__gsw.mark(); document.querySelector('#pmuRange').closest('.primary-content > .page').classList.add('active'); });
				const back = await f.evaluate(() => window.__gsw.wait('back', 2000));
				t.log(`row 4 ${tag}: lens back in ${Math.round(back.ms)} ms (budget 40 ms; a .page class change alone syncs through lazySync's 140 ms debounce, see the header)`);
				await t.check(`row 4: the ancestor class show returns the lens within 40 ms ${tag}`, back.ok && back.ms <= 40, `${Math.round(back.ms)} ms`);
			}
		}
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await t.page.waitForTimeout(1500);

		/* row 9: the onboarding window with the solid backdrop (the stylesheet visibility rule is exercised) */
		{
			/* a warm-up cycle: the first open builds the window; its cost is not the row's */
			await f.evaluate(() => O55.ui.open());
			await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000 });
			await f.waitForFunction(() => !document.getElementById('pm-o55-onboarding').classList.contains('o55-opening'), null, { timeout: 10000 });
			await f.evaluate(() => O55.ui.close());
			await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000 });
			await t.page.waitForTimeout(600);
			const cap = await f.evaluate(() => window.__gsw.capture('nav.page-tabs', '.page-tab.active'));
			const shown = cap && await f.evaluate(() => window.__gsw.back());
			await t.check(`row 9: the page-tabs lens is shown before the measured open ${tag}`, shown, cap ? 'lens out already' : 'no lens over the active tab: could not judge', { hard: true });
			if (shown) {
				await f.evaluate(() => { window.__gsw.mark(); O55.solid.set(true); O55.ui.open(); });
				const out = await f.evaluate(() => window.__gsw.wait('out', 1500));
				t.log(`row 9 ${tag}: lens out in ${Math.round(out.ms)} ms from the open call (budget 200 ms)`);
				await t.check(`row 9: the open puts the behind-window lens out within 200 ms ${tag}`, out.ok && out.ms <= 200, `${Math.round(out.ms)} ms`);
				await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-solid') && !document.getElementById('pm-o55-onboarding').classList.contains('o55-opening'), null, { timeout: 10000 });
				const solid = await f.evaluate(() => getComputedStyle(document.querySelector('nav.page-tabs')).visibility === 'hidden');
				await t.check(`row 9: the solid sheet rule hides the strip (case C exercised) ${tag}`, solid, solid ? '' : 'nav.page-tabs is not visibility:hidden under the open solid window: the row judged nothing');
				await f.evaluate(() => {
					window.__gsw.tGone = 0; window.__gsw.tClose = performance.now();
					const mo = new MutationObserver(() => { if (!document.documentElement.hasAttribute('data-o55-open')) { window.__gsw.tGone = performance.now(); mo.disconnect(); } });
					mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-o55-open'] });
					O55.ui.close();
				});
				const back = await f.evaluate(() => window.__gsw.wait('back', 4000, true));
				const wall = await f.evaluate(() => window.__gsw.tGone ? Math.round(window.__gsw.tGone - window.__gsw.tClose) : -1);
				t.log(`row 9 ${tag}: close() to data-o55-open removal ${wall} ms (the window's exit, logged not judged); lens back in ${Math.round(back.ms)} ms from the removal (budget 200 ms)`);
				await t.check(`row 9: the close returns the lens within 200 ms of data-o55-open's removal ${tag}`, back.ok && back.ms <= 200, `${Math.round(back.ms)} ms`);
			}
			await f.evaluate(() => { try { O55.solid.set(null); } catch (e) {} if (window.O55.S.open) O55.ui.close(); });
			await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000 }).catch(() => {});
			await t.page.waitForTimeout(600);
		}

		/* row 13: the resting wake count with one strip hidden (row 1's method) */
		{
			await f.evaluate(() => { const s = document.querySelector('nav.page-tabs'); s.style.display = ''; s.style.visibility = ''; const st = document.getElementById('gsw-case-c'); if (st) st.remove(); });
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(2000);
			const cap = await f.evaluate(() => window.__gsw.capture('nav.page-tabs', '.page-tab.active'));
			const shown = cap && await f.evaluate(() => window.__gsw.back());
			await t.check(`row 13: the page-tabs lens is shown before the rest count ${tag}`, shown, cap ? 'lens out already' : 'no lens over the active tab: could not judge', { hard: true });
			if (shown) {
				const out = await hideTabs(f, 'display');
				await t.check(`row 13: the strip is hidden for the rest count ${tag}`, out.ok, out.ok ? `${Math.round(out.ms)} ms${out.hooked ? ' (PM_LG.sync() fallback)' : ''}` : 'lens still shown');
				if (out.ok) {
					await f.evaluate(() => window.__swt.arm());
					await t.page.waitForTimeout(10000);
					const c = await f.evaluate(() => window.__swt.read());
					t.log(`row 13 ${tag}: glass.js show-watch timer requests in 10 s: ${c.n400} at 400 ms, ${c.n2000} at 2000 ms [${c.sites.join(', ')}]`);
					await t.check(`row 13: no 400 ms show-watch timer is asked for ${tag}`, c.n400 === 0, `${c.n400} requests at 400 ms (main asks about 25 in 10 s)`);
					await t.check(`row 13: at most 6 show-watch timer requests in 10 s ${tag}`, c.n400 + c.n2000 <= 6, `${c.n400 + c.n2000} requests (the 2000 ms net asks about 5)`);
					await showTabs(f, 'display');
					const back = await f.evaluate(() => window.__gsw.wait('back', 2040));
					t.log(`row 13 ${tag}: lens back in ${Math.round(back.ms)} ms after the count (row 1's 40 ms budget)`);
					await t.check(`row 13: the lens still appears within 40 ms once shown ${tag}`, back.ok && back.ms <= 40, `${Math.round(back.ms)} ms`);
				}
			}
		}
	}
	await parkPointer(t.page, W, H);
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`E3 glass show-watch ${surface}`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
		const [W, H] = String(t.args.size || '1920x1080').split('x').map(Number);
		await muteSound(t.page);
		await t.viewport(W, H);
		await t.emulate({ reducedMotion: 'no-preference' });
		await cell(t, surface, W, H);
	};
}
