// Switching a Home panel tab (Home <-> Agents) does only the work the shown tab needs (2026-11-11 performance pass,
// lane K).
//
// Before the pass a switch to Agents cost 240 to 270 ms of main thread in its first 300 ms on a 120 Hz machine (lane I,
// trace r3c). Two parts of that were work the page did not need:
//   loaders    the Agents list's Pip loaders (glyph-system pm-loader.js) start when the tab is shown, and each start wrote
//              the loader's phase as inherited custom properties on the loader, so every element of each drawing was
//              restyled: a pixel Pip is 118 to 240 elements of which a dozen move (17 loaders, 2,132 elements, 18.5 to
//              21 ms, in one frame). The phase is registered as not inherited now and taken only by the parts that move
//              and the groups above them (pm-loader.css).
//   rebuild    the list was drawn again on every show (30-dashboard.js onShow -> 48-work.js list().refresh): new rows,
//              new loaders to arm, style and lay out. It now patches times, progress and output in place when the rows
//              are the ones it drew (as a tick does), and draws again only when they are not.
//
// Here, per look, on Home with the pointer parked: the Agents tab is shown and hidden in turn while a DevTools trace
// runs, each switch marked just before its click, and the check reads:
//   - per loader shown, how many of its elements hold the phase (computed --pml-delay): that is what a start restyles
//     (before: every element of the drawing; after: at most --set holders, default 16). NieR's loader is one part and
//     its own properties: not judged there;
//   - in the 300 ms after each switch to Agents, past the one restyle that styles the shown tab from nothing, no restyle
//     touches more than --set extra elements per loader shown (default 30): the loaders' start was one of 2,132;
//   - the list's rows are the same elements after a show, unless the work projection changed while the tab was hidden
//     (a change that is not a tick): a rebuild with nothing changed fails;
//   - every loader on screen in the list is running again after the show (data-pml-run="on").
// It logs per switch the main thread's busy time, frames, longest frame and restyle time, both directions, so what is
// left of the switch is on record (part A3 of lane K's report).
//
// --set looks=<a,b>   default basic-dark,glass-dark,retro-dark,nier-dark; looks=all for all ten
// --set settle=<ms>   wait after load (default 40000); --set rounds=<n> switches each way (default 3)
// Both surfaces (--set sandbox=0 and 1). A page without the Agents tab or its loaders fails as "could not judge".
import { traceEvents, afterMarks } from '../helpers/frame-trace.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];

// the Home panel's tab strip with a Home and an Agents tab, their centres
const TABS = () => {
	const lists = [...document.querySelectorAll('#panel-dashboard [role="tablist"]')];
	for (const l of lists) {
		const tabs = [...l.querySelectorAll('[role="tab"]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 10; });
		// the Home board's tab may be its icon alone: its name is then in its label
		const name = (e) => [e.getAttribute('aria-label'), e.getAttribute('title'), e.getAttribute('data-pmh-label'), e.textContent].filter(Boolean).join(' ').replace(/\s+/g, ' ');
		const agents = tabs.find((e) => /\bAgents\b/.test(name(e))), home = tabs.find((e) => e !== agents && /\bHome\b/.test(name(e))) || (tabs[0] !== agents ? tabs[0] : null);
		if (home && agents) {
			const c = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; };
			return { home: c(home), agents: c(agents) };
		}
	}
	return null;
};
const LIST = () => [...document.querySelectorAll('.pmw-dash-agent-list')].find((l) => l.getClientRects().length) || null;
// watch the list and the projection from now on
const WATCH = () => {
	const W = window.__kts = { rebuilds: 0, changesHidden: 0, events: [] };
	const list = () => [...document.querySelectorAll('.pmw-dash-agent-list')];
	W.mo = new MutationObserver((recs) => { for (const r of recs) if (r.type === 'childList' && list().includes(r.target) && r.removedNodes.length) W.rebuilds++; });
	list().forEach((l) => W.mo.observe(l, { childList: true }));
	try { W.off = window.PM_WORK.on('change', (why) => { if (why !== 'tick' && !(LIST_SHOWN())) W.changesHidden++; }); } catch (e) { W.err = String(e); }
	function LIST_SHOWN() { return list().some((l) => l.getClientRects().length); }
	return { lists: list().length, err: W.err || null };
};
// what the shown Agents tab holds, and its loaders
const STATE = () => {
	const l = [...document.querySelectorAll('.pmw-dash-agent-list')].find((x) => x.getClientRects().length);
	if (!l) return null;
	let body = l; for (let p = l.parentElement; p && p !== document.body; p = p.parentElement) { if (p.matches('[role="tabpanel"], .pmw-tab-body, .pmw-body')) { body = p; break; } }
	const lds = [...l.querySelectorAll('.pml-ld')].map((ld) => {
		const els = [...ld.querySelectorAll('*')];
		const holders = els.filter((e) => getComputedStyle(e).getPropertyValue('--pml-delay').trim() !== '').length;
		// on screen: inside the window and inside every scrolling box round it (the list scrolls; the loader's own watcher
		// is an IntersectionObserver, which sees those clips too)
		let r = ld.getBoundingClientRect(), box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
		for (let p = ld.parentElement; p; p = p.parentElement) { const cs = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) { const q = p.getBoundingClientRect(); box = { l: Math.max(box.l, q.left), t: Math.max(box.t, q.top), r: Math.min(box.r, q.right), b: Math.min(box.b, q.bottom) }; } }
		const on = box.r > box.l && box.b > box.t && box.b > 0 && box.t < innerHeight;
		return { run: ld.getAttribute('data-pml-run'), all: els.length, holders, nier: !!ld.querySelector('.pml-nier'), on };
	});
	const first = l.querySelector('.wk-row');
	return { bodyElements: body.getElementsByTagName('*').length + 1, rows: l.querySelectorAll('.wk-row').length, firstTagged: !!(first && first.__ktsTag), lds };
};
const TAG = () => { const l = [...document.querySelectorAll('.pmw-dash-agent-list')].find((x) => x.getClientRects().length); const r = l && l.querySelector('.wk-row'); if (r) r.__ktsTag = 1; return !!r; };

export default async function (t) {
	const want = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark');
	const looks = want === 'all' ? ALL : want.split(',').filter(Boolean);
	const rounds = Number(t.args.rounds || 3), holdersMax = Number(t.args.holders || 16), extraPer = Number(t.args.extra || 30);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));
	const cdp = await t.page.context().newCDPSession(t.page);
	const click = async (p, name) => { await f.evaluate((n) => performance.mark(n), name); await t.page.mouse.click(p.x, p.y); };

	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 6000));
		const tabs = await f.evaluate(TABS);
		if (!tabs) { await t.check(`${look}: could judge: Home has a Home and an Agents tab`, false, 'no tab strip with both'); continue; }
		// a first round to arm everything once (the first show of a look draws the list in it)
		await t.page.mouse.click(tabs.agents.x, tabs.agents.y); await t.page.waitForTimeout(1500);
		await t.page.mouse.click(tabs.home.x, tabs.home.y); await t.page.waitForTimeout(1500);
		await t.page.mouse.click(tabs.agents.x, tabs.agents.y); await t.page.waitForTimeout(1500);
		await f.evaluate(TAG);
		const w = await f.evaluate(WATCH);
		await t.page.mouse.click(tabs.home.x, tabs.home.y); await t.page.waitForTimeout(1500);
		await parkPointer(t.page, W, H);
		const events = await traceEvents(cdp, {
			ms: rounds * 2600 + 600,
			during: async () => {
				for (let i = 1; i <= rounds; i++) {
					await click(tabs.agents, `k:agents:${i}`); await t.page.waitForTimeout(1300);
					await click(tabs.home, `k:home:${i}`); await t.page.waitForTimeout(1300);
				}
			}
		});
		await click(tabs.agents, 'k:last'); await t.page.waitForTimeout(1500);
		const st = await f.evaluate(STATE);
		const seen = await f.evaluate(() => { const W = window.__kts; W.mo.disconnect(); if (W.off) W.off(); return { rebuilds: W.rebuilds, changesHidden: W.changesHidden }; });
		const toAgents = afterMarks(events, { prefix: 'k:agents:', span: 300 }), toHome = afterMarks(events, { prefix: 'k:home:', span: 300 });
		const fmt = (s) => `${s.mainMs} ms main, ${s.frames} frames (longest ${s.longestFrameMs} ms), ${s.styleElements} elements restyled in ${s.styleMs} ms, ${s.layouts} layouts`;
		toAgents.forEach((s) => t.log(`${look} to Agents ${s.name}: ${fmt(s)}`));
		toHome.forEach((s) => t.log(`${look} to Home ${s.name}: ${fmt(s)}`));
		if (!st || !st.lds.length) { await t.check(`${look}: could judge: the Agents list is shown with its loaders`, false, JSON.stringify(st)); continue; }
		const pip = st.lds.filter((x) => !x.nier), nier = st.lds.length - pip.length;
		const holders = pip.map((x) => x.holders), alls = pip.map((x) => x.all);
		t.log(`${look}: Agents body ${st.bodyElements} elements, ${st.rows} rows, ${st.lds.length} loaders (${nier} NieR), elements holding the phase per Pip loader ${holders.join(' ')} of ${alls.join(' ')}; rebuilds ${seen.rebuilds}, projection changes while hidden ${seen.changesHidden}; list watch ${JSON.stringify(w)}`);
		await t.check(`${look}: could judge: ${rounds} switches to Agents traced`, toAgents.length === rounds, `${toAgents.length} marks found`);
		if (pip.length) await t.check(`${look}: a loader's start restyles only its moving parts (at most ${holdersMax} elements of a loader hold the phase)`, Math.max(...holders) <= holdersMax, `per loader ${holders.join(' ')} of ${alls.join(' ')}`);
		else t.log(`${look}: NOTE the loaders are NieR's one-part loader: the phase holders are not judged here`);
		// the shown tab is styled from nothing once (the largest restyle of the switch); every other restyle of the switch
		// is the page's running animations, the strip and what the show starts: the loaders' start was one of 2,132
		const others = toAgents.map((s) => { const big = s.styles.reduce((m, x, i) => (x[1] > s.styles[m][1] ? i : m), 0); return Math.max(0, ...s.styles.filter((x, i) => i !== big).map((x) => x[1])); }), bound = extraPer * st.lds.length;
		toAgents.forEach((s) => t.log(`${look} ${s.name} restyles [ms, elements, ms]: ${JSON.stringify(s.styles.filter((x) => x[1] >= 50))}; dearest ${JSON.stringify(s.top.slice(0, 6))}`));
		await t.check(`${look}: past styling the shown tab, no restyle of a switch to Agents touches more than ${extraPer} elements per loader (${bound})`, toAgents.length > 0 && Math.max(...others) <= bound, `largest other restyle per switch ${others.join(' ')} elements (tab ${st.bodyElements} elements)`);
		await t.check(`${look}: showing Agents draws the list again only when the work changed while it was hidden`, seen.rebuilds <= seen.changesHidden && (seen.changesHidden > 0 || st.firstTagged), `${seen.rebuilds} rebuilds, ${seen.changesHidden} changes while hidden, first row kept: ${st.firstTagged}`);
		const seenLds = st.lds.filter((x) => x.on && x.run !== 'still');
		await t.check(`${look}: every loader on screen in the list runs again after the show`, seenLds.length > 0 && seenLds.every((x) => x.run === 'on'), st.lds.map((x) => x.run + (x.on ? '' : '(off screen)')).join(' '));
	}
	await cdp.detach();
}
