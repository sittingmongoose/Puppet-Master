// The dashboard's cooldown clock rests under the onboarding window (2026-11-11 performance pass, lane I).
//
// The ambient usage card's countdown (base/script/pm6-js-dashboard.js: a 1 s interval writing #pm6DashCooldown) kept
// writing while the onboarding window was open over Home. The app under the window is inert and its loops rest
// (onboarding README, Performance rules, 6), yet each write woke six document-wide MutationObservers and restyled
// #dashboardView and main.primary-content through their :has() rules: a 0.1-0.4 ms task a second (Windows, Basic and
// Glass Dark, before the change). The countdown now keeps its schedule (its value goes on falling every second) and
// only the write waits; the window's close writes the current value.
//
// Here: the page opens with the onboarding window over Home. For --set secs (default 5) a MutationObserver on
// #pm6DashCooldown counts its writes while html[data-o55-open] is set: there must be none (main: one a second). Then
// the window closes (O55.ui.close('close')): 1.5 s later the clock shows a value that fell by about the time since the
// first read (the schedule held; 3 s of slack). A page without the clock, or a window that never opened over Home,
// fails as "could not judge".
// Both surfaces.   --set secs=<s>
import { muteSound } from '../helpers/quiet-page.mjs';

const parse = (s) => { const m = /^(\d+):(\d+):(\d+)$/.exec(String(s || '').trim()); return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : NaN; };

export default async function (t) {
	const secs = Number(t.args.secs || 5);
	await muteSound(t.page);
	for (const surface of t.app.surfaces()) {
		const S = `[${surface}] `;
		const f = await t.app.open({ onboarding: true, query: 'o55=screen=where&pm-warm=0', sandbox: surface === 'sandbox' });
		const ready = await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open') && !!document.getElementById('pm6DashCooldown'), null, { timeout: 60000 }).then(() => true, () => false);
		const start = ready ? await f.evaluate(() => {
			const el = document.getElementById('pm6DashCooldown');
			window.__cdWrites = 0;
			window.__cdMO = new MutationObserver((recs) => { if (document.documentElement.hasAttribute('data-o55-open')) window.__cdWrites += recs.length; });
			window.__cdMO.observe(el, { childList: true, characterData: true, subtree: true });
			return { text: el.textContent, at: performance.now(), page: (document.querySelector('.page.active') || {}).id || '' };
		}) : null;
		const judged = !!start && start.page === 'panel-dashboard' && Number.isFinite(parse(start.text));
		await t.check(S + 'could judge: the clock is in the page and the window is open over Home', judged, start ? `page ${start.page}, clock "${start.text}"` : 'no clock or no window');
		if (!judged) continue;
		await t.page.waitForTimeout(secs * 1000);
		const under = await f.evaluate(() => window.__cdWrites);
		await t.check(S + `no cooldown write under the window in ${secs} s`, under === 0, `${under} writes`);
		await f.evaluate(() => { try { O55.ui.close('close'); } catch (e) { document.documentElement.removeAttribute('data-o55-open'); } });
		const gone = await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).then(() => true, () => false);
		await t.check(S + 'the window closed', gone);
		await t.page.waitForTimeout(1500);
		const after = await f.evaluate(() => { window.__cdMO.disconnect(); return { text: document.getElementById('pm6DashCooldown').textContent, at: performance.now() }; });
		const open = (after.at - start.at) / 1000, fell = parse(start.text) - parse(after.text);
		await t.check(S + 'the clock shows the current value once the window has closed', Number.isFinite(fell) && Math.abs(fell - open) <= 3, `${start.text} -> ${after.text}: fell ${fell} s in ${open.toFixed(1)} s`);
	}
}
