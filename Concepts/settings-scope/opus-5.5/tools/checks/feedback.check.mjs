// Jared's review of the settings-scope concept (2026-11-09, FEEDBACK.md items 3, 4, 8 and 11) and the guided-flows
// rows for this concept (GUIDED-FLOWS-CHECK "Changes for P": Copy settings 3.02-3.07, 3.12, 3.17 and Always allow
// 8.03-8.04). It runs on the single-file app build with the PuppetMaster kit's config:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
//   browser-check run Concepts/settings-scope/opus-5.5/tools/checks/feedback.check.mjs \
//     --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=$OUT/settings-scope-app.html
// --set only=strip|rows|shake|acct|head|where|detail|copy|always|jared1113 runs one part (jared1113: --set j1113=models,paths,limits); --set looks=basic-dark,... narrows the looks
// (default Basic Dark, Retro Light and NieR Dark); --set lookShots=1 lists the review images under LOOK.
// `strip` opens the page with the review strip (settings-scope.html beside the app page, or --set strip=<path>); the
// account switch in `shake` is compared with bare PMConcept7 (Concepts/PMConcept7.html, or --set bare=<path>).
// "Full" is a 2560-wide window (the review strip's Full width is whatever window holds the frame).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const want = (t, part) => !t.args.only || String(t.args.only).split(',').includes(part);
/* review S1: Plans' inventory layering is the per-row authority (SSYS-059). The checks read it from the repository
   (--set inventory=<path> to read another copy) and pass each row's layering in: { id: { home, value } } */
let INVENTORY, INVENTORY_SHA = null;
const inventory = (t) => {
	if (INVENTORY !== undefined) return INVENTORY;
	try {
		const raw = fs.readFileSync(path.resolve(t.args.inventory || 'Plans/settings_inventory.json'));
		INVENTORY_SHA = crypto.createHash('sha256').update(raw).digest('hex');
		const out = {}, walk = (o) => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (typeof o.id === 'string' && o.layering) { const L = o.layering; out[o.id] = { home: L.home, value: o.default, type: o.type || null, may: L.may_differ_by || [], notOffered: L.not_offered || {}, combine: L.combine || 'most_specific', key: L.computer_key || null, careful: L.careful_order || null }; } Object.values(o).forEach(walk); } };
		walk(JSON.parse(raw.toString('utf8')));
		INVENTORY = Object.keys(out).length ? out : null;
	} catch (e) { INVENTORY = null; }
	return INVENTORY;
};
const fileUrl = (p) => (/^[a-z][a-z0-9+.-]+:/i.test(p) ? p : pathToFileURL(path.resolve(p)).href);
/* review A-r1 tool note E: move a row into view by scrolling the Settings scroller that holds it, never with
   scrollIntoView (that also scrolls overflow-hidden ancestors and left the whole root 67px up, a state no one reaches) */
const HELPERS = () => {
	window.__psxScrollTo = (el, block) => {
		if (!el) return false;
		/* every scrolling ancestor, inner to outer: a row can sit in a scroller inside another (General's rows do), and
		   only scrolling each one brings it on screen */
		const chain = [];
		for (let sc = el.parentElement; sc && sc !== document.body && sc !== document.documentElement; sc = sc.parentElement) { const cs = getComputedStyle(sc); if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 1) chain.push(sc); }
		if (!chain.length) return false;
		for (const sc of chain) {
			const sr = sc.getBoundingClientRect(), er = el.getBoundingClientRect();
			const top = Math.max(sr.top, 0), h = Math.min(sr.bottom, innerHeight) - top;
			/* review A-r3 R3-3: the Settings scroller has scroll-behavior: smooth, so a scroll set here keeps moving for up
			   to a second; a toggle measured inside that would read the probe's own scroll as the toggle's. Jump instead */
			const was = sc.style.scrollBehavior; sc.style.scrollBehavior = 'auto';
			sc.scrollTop += block === 'start' ? er.top - top - 8 : er.top - top - (h - er.height) / 2;
			sc.style.scrollBehavior = was;
		}
		return true;
	};
};
const run = (t, fn, arg) => t.root.evaluate(fn, arg);
const settle = (t, ms = 350) => t.page.waitForTimeout(ms);
const WIDTHS = [['Full', 2560], ['1920', 1920], ['1280', 1280], ['1024', 1024], ['860', 860]];
const LOOKS3 = ['basic-dark', 'retro-light', 'nier-dark'];
const looks = (t) => (t.args.looks ? String(t.args.looks).split(',') : LOOKS3);
const pic = async (t, name, why, target) => {
	if (t.args.lookShots) { if (target) await t.crop(name, target, why); else await t.shot(name, why); }
	else await t.snap(name, target || undefined);
};
async function look(t, name) {
	// a demo reset repaints its opening look a moment later; a look set inside that moment is set again
	const isOn = (n) => { const th = document.documentElement.getAttribute('data-theme') || ''; return /^nier/.test(n) ? th.endsWith(n.slice(4)) && (th.startsWith('nier') || !!(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on())) : th === n; };
	for (let i = 0; i < 3; i++) {
		await run(t, (n) => window.PSX.setLook(n), name);
		await t.root.waitForFunction(isOn, name, { timeout: 8000 }).catch(() => {});
		await settle(t, 300);
		// painted and kept: the demo world holds it too, so a later project switch paints the same look
		const kept = await run(t, (n) => { const v = String(window.PSX.resolve('general.visual.theme', window.PSX.S.ctx).value || ''); return v.toLowerCase().replace(/\s+/g, '-') === n; }, name);
		if (await run(t, isOn, name) && kept) break;
	}
	const got = await run(t, () => ({ theme: document.documentElement.getAttribute('data-theme') || '', nier: !!(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on()) }));
	const [fam, mode] = name.split('-');
	await t.check(`look ${name} applied`, fam === 'nier' ? (got.nier || got.theme.startsWith('nier')) && got.theme.endsWith('-' + mode) : !got.nier && got.theme === name, JSON.stringify(got));
	await run(t, () => window.PSX.hideNote());
}
/* a demo reset reloads the base page with the demo's opening look; wait until that has painted, so a look set next
   isn't half-applied over the reload (one click landing before it, one after) */
async function reset(t) {
	await run(t, () => window.PSX.command({ cmd: 'reset' }));
	await t.root.waitForFunction(() => { const v = window.PSX.resolve('general.visual.theme', window.PSX.S.ctx).value; const want = String(v || 'Basic Dark').toLowerCase().replace(/\s+/g, '-'); return (document.documentElement.getAttribute('data-theme') || '') === want; }, null, { timeout: 8000 }).catch(() => {});
	await settle(t, 500);
}
async function opt(t, end, changed) { await run(t, async (o) => { await window.PSX.command({ cmd: 'opt', end: o[0], changed: o[1] }); }, [end, changed]); await settle(t, 250); }
async function page(t, which) {
	await run(t, async (w) => {
		const K = window.PM12_KIMI, wait = (ms) => new Promise((r) => setTimeout(r, ms));
		K.navigate('ai', 'providers'); await wait(450);
		K.dispatchAction('pm51-tab', { manager: 'providers', tab: w === 'services' ? 'services' : 'models' }); await wait(650);
		// on Services, the selected service's account rows ("Each account") are the ones Jared's screen 03 shows
		const sc = document.querySelector(w === 'services' ? '#pm-settings-root .setting-row.o55-scoped' : '#pm-settings-root .setting-row.o55-row');
		if (sc) window.__psxScrollTo(sc, w === 'services' ? 'center' : 'start');
		await wait(200);
	}, which);
}

/* every group of rows (a setting list) with two or more rows on screen: the visible control's right edge (or left edge
   when the control sits under the copy), and the end button's left edge, are each one x */
const ROWS = () => {
	const out = { groups: 0, rows: 0, bad: [] };
	const lists = new Set([...document.querySelectorAll('#pm-settings-root .setting-row.o55-row')].filter((r) => r.getClientRects().length && r.getBoundingClientRect().width > 100).map((r) => r.parentElement));
	for (const list of lists) {
		const rows = [...list.children].filter((r) => r.matches('.setting-row.o55-row:not(.is-wide)') && r.getClientRects().length);
		if (rows.length < 2) continue;
		out.groups++; out.rows += rows.length;
		const ctl = [], ends = [], stacked = [];
		for (const r of rows) {
			const c = r.querySelector(':scope > .setting-control'); if (!c) continue;
			const kids = [...c.children].filter((k) => k.getClientRects().length);
			if (!kids.length) continue;
			const kb = kids.map((k) => k.getBoundingClientRect());
			const rb = r.getBoundingClientRect(), cb = c.getBoundingClientRect();
			const isStacked = cb.top > rb.top + 20 && Math.abs(cb.left - rb.left) < 40;
			stacked.push(isStacked);
			ctl.push({ id: r.id, x: isStacked ? Math.min(...kb.map((b) => b.left)) : Math.max(...kb.map((b) => b.right)) });
			if (Math.max(...kb.map((b) => b.right)) > rb.right + 1) out.bad.push(`${r.id}: control runs past its row`);
			const e = [...r.querySelectorAll('.o55-about')].find((x) => x.closest('.setting-row') === r);
			if (e && e.getClientRects().length) ends.push({ id: r.id, x: e.getBoundingClientRect().left });
			// review A-r1 finding 3: no end word is cut ("Each AI ser…")
			const w = e && e.querySelector('.psx-end-word');
			if (w && w.getClientRects().length && w.scrollWidth > w.clientWidth + 0.5) out.bad.push(`${r.id}: its end word “${w.textContent.trim()}” is cut (${w.scrollWidth} > ${w.clientWidth}px)`);
		}
		const spread = (a) => (a.length ? Math.max(...a.map((v) => v.x)) - Math.min(...a.map((v) => v.x)) : 0);
		const name = (list.closest('section, .o55-group') && (list.closest('section, .o55-group').querySelector('h3, h2, .o55-group-title') || {}).textContent || '').trim().slice(0, 40);
		if (stacked.some(Boolean) && stacked.some((x) => !x)) out.bad.push(`${name}: some controls sit beside the copy and some under it`);
		else if (spread(ctl) > 1.5) out.bad.push(`${name}: controls end at ${[...new Set(ctl.map((v) => Math.round(v.x)))].join(', ')}`);
		if (spread(ends) > 1.5) out.bad.push(`${name}: end words start at ${[...new Set(ends.map((v) => Math.round(v.x)))].join(', ')}`);
	}
	// and every other end word in Settings (the compact fields beside a service, a manager's rows): none is cut
	document.querySelectorAll('#pm-settings-root .o55-field .psx-end-word, #pm-settings-root .pm51-mgr .psx-end-word').forEach((w) => {
		if (!w.getClientRects().length || w.closest('.setting-row.o55-row')) return;
		if (w.scrollWidth > w.clientWidth + 0.5) { const f = w.closest('.o55-field, .setting-row'); out.bad.push(`a field’s end word “${w.textContent.trim()}” is cut (${w.scrollWidth} > ${w.clientWidth}px) in ${f ? (f.querySelector('.o55-field-label, .setting-label') || {}).textContent || f.className : 'Settings'}`); }
	});
	return out;
};

/* a toggle's change, frame by frame: the control, the end button, the row, the next row, the toolbar, the Changed mark
   and how many end buttons on screen show the base page's round "?" instead of their word; and what the browser itself
   reports as layout shifts inside Settings. Each sample is read just after a frame is painted (a task queued from
   requestAnimationFrame), so it sees what was on screen, not a state another frame callback fixed before the paint */
const TOGGLE = async (a) => {
	const [sel, o] = Array.isArray(a) ? a : [a, null];
	const tg = document.querySelector(sel); if (!tg) return { missing: sel };
	/* Settings sections from the third on are content-visibility: auto (the base page's), so a section out of view keeps
	   an estimated height until it is drawn and one jump can land anywhere: jump again until the switch is on screen */
	const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	for (let i = 0; i < 8; i++) { window.__psxScrollTo(tg, 'center'); await frame(); await new Promise((r) => setTimeout(r, 80)); const b = tg.getBoundingClientRect(); if (b.top >= 60 && b.bottom <= innerHeight - 60) break; }
	await new Promise((r) => setTimeout(r, (o && o.pre) || 600));
	const row = tg.closest('.setting-row'), lab = row.querySelector('.setting-label');
	const end = [...row.querySelectorAll('.o55-about')].find((x) => x.closest('.setting-row') === row);
	const next = row.nextElementSibling || row.closest('section').nextElementSibling;
	const bar = document.querySelector('#pm-settings-root .document-toolbar');
	const shifts = [];
	const po = new PerformanceObserver((l) => l.getEntries().forEach((e) => (e.sources || []).forEach((s) => { const n = s.node && (s.node.nodeType === 1 ? s.node : s.node.parentElement); if (n && n.closest && n.closest('#pm-settings-root') && !n.closest('.psx-note, #pm-settings-portals')) shifts.push(String(n.className || n.nodeName).slice(0, 40)); })));
	po.observe({ type: 'layout-shift', buffered: false });
	const r1 = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x * 2) / 2, Math.round(b.y * 2) / 2, Math.round(b.width * 2) / 2, Math.round(b.height * 2) / 2]; };
	const samples = []; let go = true;
	const vh = innerHeight, decided = document.documentElement.getAttribute('data-psx-end') !== 'today';
	const bare = () => (decided ? [...document.querySelectorAll('#pm-settings-root .setting-row.o55-row > .o55-about')].filter((b) => { const r = b.getBoundingClientRect(); return r.height && r.bottom > 0 && r.top < vh && !b.querySelector('.psx-end-word'); }).length : 0);
	const ch = new MessageChannel();
	const t0 = performance.now();
	ch.port1.onmessage = () => { samples.push({ t: Math.round(performance.now() - t0), conn: row.isConnected, tg: r1(tg), end: r1(end), row: r1(row), next: r1(next), bar: r1(bar), ch: lab ? lab.querySelectorAll('.o55-changed:not(.o55-needed)').length : 0, q: bare() }); if (go) requestAnimationFrame(() => ch.port2.postMessage(0)); };
	requestAnimationFrame(() => ch.port2.postMessage(0));
	await new Promise((r) => setTimeout(r, 200));
	const clickAt = Math.round(performance.now() - t0);
	const tr = tg.getBoundingClientRect(), onScreen = tr.top >= 0 && tr.bottom <= innerHeight && tr.height > 0;
	tg.click();
	await new Promise((r) => setTimeout(r, (o && o.post) || 1600));
	go = false; po.disconnect();
	// the frames while the row the click landed in is still the page's own: a whole-page redraw replaces it, and what
	// follows is a new page, judged separately (rerender)
	// judged from the last frame before the click: anything that settled before it isn't the toggle's
	const first = Math.max(0, samples.findIndex((x) => x.t >= clickAt) - 1);
	const after = samples.slice(first);
	const rerender = after.findIndex((x) => !x.conn), live = rerender < 0 ? after : after.slice(0, rerender);
	const moved = (k, i) => live.some((s) => JSON.stringify(s[k] && (i == null ? s[k] : s[k][i])) !== JSON.stringify(live[0][k] && (i == null ? live[0][k] : live[0][k][i])));
	const chs = live.map((x) => x.ch); const flips = chs.filter((v, i) => i && v !== chs[i - 1]).length;
	return { onScreen, id: row.id, label: ((lab && lab.firstChild && lab.firstChild.textContent) || (lab || {}).textContent || '').trim().slice(0, 60), clickAt, frames: samples.length, liveFrames: live.length, rerenderAt: rerender < 0 ? null : after[rerender].t, rowYs: live.map((x) => [x.t, x.row && x.row[1]]).filter((x, i, a) => !i || x[1] !== a[i - 1][1]), toggleX: moved('tg', 0), endX: moved('end', 0), endW: moved('end', 2), rowY: moved('row', 1), rowH: moved('row', 3), nextY: moved('next', 1), bar: moved('bar'), changedFlips: flips, maxChanged: Math.max(...chs), bareEnds: Math.max(...live.map((x) => x.q)), shifts };
};

/* review A-r3: the pages whose switches the shake part turns, and every visible switch on one of them */
const SHAKE_PAGES = [['Models', 'ai', 'providers', 'models'], ['General', 'general', 'app-input', null], ['Notifications', 'general', 'notifications', null]];
const SWITCHES = async ([, d, w, tab]) => {
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));
	if (window.PM_PAGES && window.PM_PAGES.current !== 'settings') { window.PM_PAGES.go('settings'); await wait(1500); }
	window.PM12_KIMI.navigate(d, w); await wait(700);
	if (tab) { window.PM12_KIMI.dispatchAction('pm51-tab', { manager: 'providers', tab }); await wait(900); }
	return [...document.querySelectorAll('#pm-settings-root .setting-row')].filter((r) => r.id && r.getClientRects().length && r.getBoundingClientRect().width > 100 && r.querySelector('.toggle')).map((r) => r.id);
};
/* switches whose job is to change the page: what each may move, and why. Everything else moves nothing but itself.
   Tokens: switch (its x), end (end words), row (its height), below (rows under it), header. The clicked row's own
   place on screen is never allowed to move */
const SHAKE_ALLOW = {
	'general.visual.reduce-animations': [['below'], 'it shows or hides Animation speed under it; bare PMConcept7 moves the rows below by the same amount'],
	'general.interaction.activity-bar-labels': [['switch', 'end', 'row', 'below', 'header'], 'names beside the activity-bar icons narrow the whole Settings page, so every row reflows; bare PMConcept7 moves the page too'],
	'general.interaction.scope-labels': [['switch', 'end', 'row', 'below'], 'it writes where each setting comes from into every row’s end word, so the end column and the rows change'],
	'general.interaction.eli5-default': [['row', 'below'], 'Explain technical terms rewrites the descriptions on purpose'],
	// main's notification page (after the rebase onto main, 2026-11-13): measured at 1920, the note is 44.5px with its margin
	'general.interaction.notifications-enabled': [['below'], 'turning Notifications off shows the base page’s own note under it (“Notifications are off. Nothing alerts you until you turn them back on…”) and turning it on takes it away; the layer’s routed change redraws the section at once, so the rows below move by the note’s height (bare PMConcept7 shows the note only at its next redraw)']
};
const shakeBad = (r, allow) => {
	if (r.missing) return ['not found'];
	if (r.onScreen === false) return ['the switch was not on screen when it was clicked (the probe could not scroll to it)'];
	const may = (allow && allow[0]) || [];
	const bad = [];
	if (r.toggleX && !may.includes('switch')) bad.push('the switch moved');
	if ((r.endX || r.endW) && !may.includes('end')) bad.push('the end word moved or changed width');
	if (r.bareEnds && !may.includes('end')) bad.push('a row showed “?” instead of its word');
	// a switch that reflows the page has its clicked row held in place; scroll positions are whole pixels at this zoom, so
	// a reflow by half a pixel can leave it half a pixel off. Only for those switches, and never more than that
	const dev = (r.rowYs || []).reduce((m, x) => Math.max(m, Math.abs(x[1] - r.rowYs[0][1])), 0);
	if (r.rowY && !(allow && dev <= 0.5)) bad.push(`the row moved on screen (by up to ${dev}px)`);
	if (r.rowH && !may.includes('row')) bad.push(`the row changed height`);
	if (r.nextY && !may.includes('below') && !may.includes('row')) bad.push('the next row moved');
	if (r.bar && !may.includes('header')) bad.push('the header moved');
	if (r.changedFlips > 1 || r.maxChanged > 1) bad.push('Changed flickered or showed twice');
	if (r.shifts.length && !may.length) bad.push(`layout shifts: ${r.shifts.slice(0, 4).join(', ')}`);
	return bad;
};

/* review A-r4 F2: every value in a detail card (a manager's list-and-detail pane) is at least as wide as its widest
   word. Measured with the element's own font; a column one letter wide (Web & Research › Browser at 860) fails */
// every Settings workspace (PMConcept7's domains): a domain draws its managers as you reach them, so each is visited
const WORKSPACES = [['general', 'app-input'], ['general', 'notifications'], ['ai', 'providers'], ['ai', 'web'], ['ai', 'media'], ['ai', 'bsd'], ['code', 'editor-runtime'], ['code', 'toolchain'], ['code', 'testing'], ['memory', 'context-memory'], ['memory', 'goals'], ['memory', 'personas'], ['memory', 'owners'], ['source', 'source-manager'], ['source', 'browser-scm'], ['projects', 'project-settings'], ['projects', 'project-sync'], ['projects', 'project-history'], ['safety', 'permissions'], ['system', 'settings-transfer'], ['system', 'backup'], ['system', 'doctor'], ['system', 'servers'], ['system', 'updates'], ['system', 'advanced']];
const DETAIL_TABS = async ([d, w]) => {
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));
	if (window.PM_PAGES && window.PM_PAGES.current !== 'settings') { window.PM_PAGES.go('settings'); await wait(1500); }
	window.PM12_KIMI.navigate(d, w); await wait(900);
	return [...new Set([...document.querySelectorAll('#pm-settings-root [data-action="pm51-tab"][data-manager][data-tab]')].filter((e) => e.getClientRects().length).map((e) => `${e.dataset.manager}:${e.dataset.tab}`))];
};
const DETAIL = async (arg) => {
	const [mt, only] = Array.isArray(arg) ? arg : [arg, null];
	const [manager, tab] = mt.split(':');
	/* only this manager's own detail panes (another manager's pane on the same page is measured under its own tab), found
	   again after every redraw: a tab or a pick redraws the manager, and a node kept from before is no longer the page */
	const vis = (e) => !!e && e.getClientRects().length > 0;
	const tabEl = () => [...document.querySelectorAll(`#pm-settings-root [data-action="pm51-tab"][data-manager="${manager}"][data-tab="${tab}"]`)].find(vis) || null;
	const rootNow = () => { const te = tabEl(); return (te && te.closest('.pm51-mgr')) || document.getElementById('pm-settings-root'); };
	const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
	/* review A-r4 (where it stopped, fault a): no fixed wait. After a tab or a pick, wait until the condition holds and the
	   manager's detail panes have kept the same text and height for three frames in a row (4s at most) */
	const settled = async (ok, limit = 4000) => {
		let last = null, same = 0; const t0 = performance.now();
		while (performance.now() - t0 < limit) {
			await frame();
			if (ok && !ok()) { last = null; same = 0; continue; }
			const sig = [...rootNow().querySelectorAll('.pm51-detail-content')].filter((d) => d.getClientRects().length).map((d) => `${d.innerText.length}:${Math.round(d.getBoundingClientRect().height)}`).join(',');
			if (sig === last) { if (++same >= 3) return true; } else { same = 0; last = sig; }
		}
		return false;
	};
	const out = { n: 0, items: 0, bad: [], all: [], unsettled: [] };
	// the tab must be current and its own panel drawn first: until then the panes and picks are still the last tab's
	const tabOn = () => { const te = tabEl(); return !!te && te.getAttribute('aria-selected') === 'true'; };
	/* the panel's content must have changed from what was there before the tab was asked for: until it does, its
	   panes and picks are the last tab's (Permissions › Rules showed Profiles' list for over 600ms on a first visit).
	   Labels can't tell: some managers keep the panel labelled for another tab when drawn (Back Seat Driver's stages,
	   Media's files, the toolchain's formatters). A tab that was already open shows the same content, so 2.5s after its
	   tab is current it counts as drawn. Then the same three still frames */
	const panelEl = () => { const te = tabEl(); const pid = te && te.getAttribute('aria-controls'); return (pid && [...rootNow().querySelectorAll(`[id="${pid}"]`)].find(vis)) || rootNow(); };
	const sigOf = () => { const p = panelEl(); const tx = p.innerText || ''; return `${tx.length}|${tx.slice(0, 400)}|${[...p.querySelectorAll('button[data-action="pm51-select"]')].map((e) => e.dataset.id).join(',')}`; };
	const openTab = async () => { const before = sigOf(); window.PM12_KIMI.dispatchAction('pm51-tab', { manager, tab }); const t0 = performance.now(); return settled(() => tabOn() && (sigOf() !== before || performance.now() - t0 > 2500), 7000); };
	if (!(await openTab())) { out.unsettled.push(`${mt} (the tab never became current)`); return out; }
	const cv = window.__psxCv || (window.__psxCv = document.createElement('canvas').getContext('2d'));
	const measure = (label, item) => {
		rootNow().querySelectorAll('.pm51-detail-content').forEach((dc) => {
			if (!dc.getClientRects().length) return;
			dc.querySelectorAll('.pm51-row-value').forEach((el) => {
				const txt = (el.innerText || '').trim(); if (!txt || !el.getClientRects().length) return;
				const cs = getComputedStyle(el); if (cs.visibility === 'hidden') return;
				cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
				const ls = parseFloat(cs.letterSpacing) || 0, up = cs.textTransform === 'uppercase';
				const widest = Math.max(...txt.split(/\s+/).map((x) => cv.measureText(up ? x.toUpperCase() : x).width + ls * x.length));
				const width = el.getBoundingClientRect().width; out.n++;
				const v = { label, item, cls: String(el.className).trim().split(/\s+/).sort().join('.'), txt: txt.slice(0, 60), w: Math.round(width), widest: Math.round(widest) };
				out.all.push(v);
				if (width + 1 < widest) out.bad.push(v);
			});
		});
	};
	const sel = `button[data-action="pm51-select"][data-manager="${manager}"]`;
	const name = (e) => (e.innerText || '').trim().split('\n')[0];
	const collect = () => [...panelEl().querySelectorAll(sel)].filter((e) => vis(e) && e.dataset.id && (!only || name(e) === only)).map((e) => ({ id: e.dataset.id, name: name(e) }));
	let picks = collect();
	if (!picks.length && !only) measure(mt, '');
	/* on a first visit some tabs (Notifications › Events, Media › Files) draw the last tab's list for a moment before
	   their own. When a pick is gone or never becomes current, the tab is opened again, given 1.5s, and its list read
	   again, once per tab: a pick missing from the new list was that passing list's, and the walk goes on with the real
	   one; a pick still listed is tried once more and then fails by name */
	const done = new Set(), retried = new Set(); let reread = false;
	out.transient = [];
	for (let i = 0; i < picks.length; i++) {
		const p = picks[i];
		if (done.has(p.id)) continue;
		const q = `${sel}[data-id="${CSS.escape(p.id)}"]`;
		let b = panelEl().querySelector(q);
		if (!b) { await openTab(); b = panelEl().querySelector(q); }
		let ok = false;
		if (b) { b.click(); ok = await settled(() => { const nb = panelEl().querySelector(q) || rootNow().querySelector(q); return !!nb && (nb.getAttribute('aria-current') === 'true' || nb.classList.contains('active')); }); }
		if (!ok) {
			if (!reread) {
				reread = true;
				await openTab(); await new Promise((r) => setTimeout(r, 1500)); await settled();
				const fresh = collect();
				if (!fresh.some((f) => f.id === p.id)) {
					out.transient.push(`${mt}: ${picks.filter((x) => !done.has(x.id) && !fresh.some((f) => f.id === x.id)).map((x) => x.name).join(', ')}`);
					// a tab with no list of its own (Notifications › Events) is measured as it is, once
					if (!fresh.length && !done.size && !only) measure(mt, '');
					picks = fresh.filter((f) => !done.has(f.id)); i = -1; continue;
				}
			}
			if (!retried.has(p.id)) { retried.add(p.id); i--; continue; }
			out.unsettled.push(`${mt} › ${p.name}${b ? '' : ' (gone from the tab)'}`);
			continue;
		}
		done.add(p.id);
		out.items++;
		measure(`${mt} › ${p.name}`, p.name);
	}
	return out;
};

// the shell around Settings: its rail state, the left-panel resizer, and the width Settings gets
const SHELL = () => { const ma = document.querySelector('.main-area'), rz = document.getElementById('leftPanelResizer'), root = document.getElementById('pm-settings-root'); return { home: document.documentElement.getAttribute('data-pmw-home'), rail: ma && ma.getAttribute('data-pmw-rail'), resizer: rz ? getComputedStyle(rz).display : 'none', w: root ? Math.round(root.getBoundingClientRect().width * 10) / 10 : 0 }; };
const BARE_LOOK = async (id) => {
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));
	const [fam, mode] = id.split('-'), tb = document.getElementById('themeSelect');
	const painted = () => { const H = document.documentElement, th = H.getAttribute('data-theme') || ''; return fam === 'nier' ? (th.startsWith('nier') || !!(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on())) && th.endsWith('-' + mode) : th === id && !(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on()); };
	for (let i = 0; i < 3 && !painted(); i++) {
		if (tb.getAttribute('aria-expanded') !== 'true') { tb.click(); await wait(150); }
		const nierFam = !!document.querySelector('#themeMenu .pm6-tt-family[data-family="nier"]');
		const f = document.querySelector(`#themeMenu .pm6-tt-family[data-family="${fam === 'nier' && !nierFam ? 'basic' : fam}"]`); if (f) { f.click(); await wait(300); }
		const m = document.querySelector(`#themeMenu .pm6-tt-mode[data-mode-value="${mode}"]`); if (m) { m.click(); await wait(300); }
		if (fam === 'nier' && !nierFam && !painted()) { const tt = document.querySelector('#themeMenu [data-o55-nier-tt="toggle"]'); if (tt) { tt.click(); await wait(400); } }
		await wait(900);
	}
	if (tb.getAttribute('aria-expanded') === 'true') { tb.click(); await wait(200); }
	return painted();
};

/* the header: its box and the page under it, in one view */
const HEAD = () => {
	const bar = document.querySelector('#pm-settings-root .document-toolbar'), main = bar && bar.querySelector('.psx-head-main');
	const chg = bar && bar.querySelector('[data-psx-head="view"]');
	const first = document.querySelector('#pm-settings-root .document-toolbar ~ *');
	const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
	const txt = bar ? bar.innerText : '';
	const proj = (window.PSX.ctxFull(window.PSX.S.ctx).project) || 'No project';
	const visible = (sel) => [...document.querySelectorAll(sel)].some((e) => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
	return {
		bar: r(bar), main: r(main), change: r(chg), first: r(first), viewing: main ? main.getAttribute('data-viewing') : null,
		text: txt, projCount: txt.split(proj).length - 1, myView: /my view/i.test(document.getElementById('pm-settings-root').innerText),
		pill: visible('#pm-settings-root .document-toolbar .project-pill'), rail: visible('#pm-settings-root .rail-project'),
		stop: !!(bar && bar.querySelector('[data-psx-head="mine"]')),
		// review A-r1 finding 2 and tool note C: the words saying what you see never overflow, ellipsis or not
		ctxOverflow: (() => { const c = bar && bar.querySelector('.psx-head-ctx'); return c ? c.scrollWidth > c.clientWidth + 0.5 || c.scrollHeight > c.clientHeight + 0.5 : true; })(),
		ctxText: (((bar && bar.querySelector('.psx-head-ctx')) || {}).textContent || '').replace(/\u00a0/g, ' '), fit: main ? main.getAttribute('data-fit') : null
	};
};

/* ------------------------------------------------------------------ Astra max fixes (2026-11-13), in `where`
   A1: the three per_item permission rows resolve item by item by their owner's rule (SSYS-059, PS-144): the review's two
   witnesses, the rest of PS-144's answer rule, the ordered rules' own §2.4 behaviour, and what the panel, the row and the
   engine show. A4: Reduce motion is an OR of its own requests here, then the operating system's (SSYS-059): the review's
   fixture, every combination, and the panel. Found next to them: FileSafe's careful order. N1: an action names its owner,
   and opens it where it has a place of its own. Every one of these fails on 7150f6c5bc */
const OPEN_PANEL = async (i) => {
	window.PM51.revealSetting(i, { detail: true });
	for (let k = 0; k < 40; k++) { await new Promise((r) => setTimeout(r, 150)); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === i && document.querySelector('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-slot]')) break; }
	const insp = document.querySelector('#pm-settings-root .detail-inspector'), w = insp && insp.querySelector('[data-psx-block="where"]');
	const txt = (e) => (e ? e.innerText.replace(/\s+/g, ' ').trim() : '');
	return {
		code: insp && (insp.querySelector('.o55-insp-tech code') || {}).textContent, now: txt(insp && insp.querySelector('.o55-insp-now')), where: txt(w),
		owner: w && w.getAttribute('data-psx-owner'), name: w && w.getAttribute('data-psx-owner-name'), link: w && w.querySelector('[data-psx-key="owner-open"]') ? w.querySelector('[data-psx-key="owner-open"]').textContent.trim() : null,
		rules: w ? [...w.querySelectorAll('.psx-wrule')].map((x) => ({ rule: x.getAttribute('data-psx-rule'), text: txt(x) })) : [],
		change: insp ? [...insp.querySelectorAll('button')].filter((b) => b.getClientRects().length && !b.closest('.pm51-panel-head') && /^(Change|Set for|Same as everywhere|\+)/.test(b.textContent.trim())).map((b) => b.textContent.trim()) : []
	};
};
const CLOSE_PANEL = () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); };
async function astraWhere(t) {
	/* A1, on the page's own resolver with a copy of the world: per tool and per web ability, each exact key on its own */
	const a1 = await run(t, () => {
		const P = window.PSX, ctx = { project: 'tastebook', device: 'here', on: 'here' }, out = [];
		const T = 'safety.rules.per-tool-permissions', WEB = 'safety.protection.web-tool-permissions', R = 'safety.rules.rule-editor';
		const at = (id, set) => {
			const w = P.clone(P.W); delete w.everywhere[id]; delete w.computer.here[id]; delete w.project.tastebook[id];
			Object.entries(set).forEach(([l, v]) => { if (l === 'everywhere') w.everywhere[id] = v; else w[l][l === 'computer' ? 'here' : 'tastebook'][id] = v; });
			return P.resolve(id, ctx, w);
		};
		const item = (r, k) => ((r && r.items) || []).find((i) => i.key === k) || null;
		const C = (name, id, set, k, want, from) => { const r = at(id, set), i = item(r, k); out.push({ name, ok: !!r && r.combine === 'per_item' && !!r.value && r.value[k] === want && !!i && i.from.level === from, got: { combine: r && r.combine, value: r && r.value && r.value[k], item: i && i.from, row: r && r.from } }); };
		C('the review’s witness 1: bash, This computer Block and tastebook Allow give Block, from This computer', T, { computer: { bash: 'deny' }, project: { bash: 'allow' } }, 'bash', 'deny', 'computer');
		C('the review’s witness 2: webfetch, This computer Block and tastebook Allow give Block, from This computer', WEB, { computer: { webfetch: 'deny' }, project: { webfetch: 'allow' } }, 'webfetch', 'deny', 'computer');
		C('bash, This computer Ask me first and tastebook Block give tastebook’s Block', T, { computer: { bash: 'ask' }, project: { bash: 'deny' } }, 'bash', 'deny', 'project');
		C('bash, This computer Allow and tastebook Ask me first give tastebook’s Ask me first', T, { computer: { bash: 'allow' }, project: { bash: 'ask' } }, 'bash', 'ask', 'project');
		C('webcrawl, This computer Ask me first and tastebook Block give Block', WEB, { computer: { webcrawl: 'ask' }, project: { webcrawl: 'deny' } }, 'webcrawl', 'deny', 'project');
		C('bash, tastebook alone: its own Allow', T, { project: { bash: 'allow' } }, 'bash', 'allow', 'project');
		C('bash, Everywhere Block and tastebook Allow: Everywhere is a fallback, never compared, so tastebook’s Allow', T, { everywhere: { bash: 'deny' }, project: { bash: 'allow' } }, 'bash', 'allow', 'project');
		C('bash, Everywhere Allow and This computer Block: This computer’s Block', T, { everywhere: { bash: 'allow' }, computer: { bash: 'deny' } }, 'bash', 'deny', 'computer');
		C('edit, Everywhere alone: its Allow', T, { everywhere: { edit: 'allow' } }, 'edit', 'allow', 'everywhere');
		C('each key on its own: tastebook’s edit is used while This computer decides bash', T, { computer: { bash: 'deny' }, project: { bash: 'allow', edit: 'allow' } }, 'edit', 'allow', 'project');
		C('each key on its own: read, which no place sets, keeps its default', T, { computer: { bash: 'deny' }, project: { bash: 'allow' } }, 'read', 'allow', 'default');
		// the ordered rules keep their own behaviour (Permissions §2.4, §3.1): every place's rules together, the same rule from a more specific place shadowing; no careful reordering
		{ const r = at(R, { everywhere: ['github_*: allow', 'npm *: ask'], computer: ['github_*: deny', 'rm *: deny'], project: ['github_*: ask'] }), want = ['npm *: ask', 'rm *: deny', 'github_*: ask'];
		  out.push({ name: 'ordered rules: Everywhere’s, then This computer’s, then tastebook’s, last match winning; tastebook’s github_* shadows the same rule elsewhere, with no careful reordering', ok: !!r && r.combine === 'per_item' && JSON.stringify(r.value) === JSON.stringify(want) && ((r.items || []).map((i) => i.from.level).join(',') === 'everywhere,computer,project'), got: { combine: r && r.combine, value: r && r.value, from: ((r && r.items) || []).map((i) => i.from.level) } }); }
		{ const r = at(R, { everywhere: ['a_*: allow'], project: ['b_*: deny'] });
		  out.push({ name: 'ordered rules: different rules from two places both apply, the more specific place’s last', ok: !!r && r.combine === 'per_item' && JSON.stringify(r.value) === JSON.stringify(['a_*: allow', 'b_*: deny']), got: { combine: r && r.combine, value: r && r.value } }); }
		return out;
	});
	for (const c of a1) await t.check(`Astra A1 (per_item): ${c.name}`, c.ok, JSON.stringify(c.got));
	// A1 in the page: the review's first witness in the live world, the engine's own table, the row's line and the panel
	await reset(t);
	const a1p = await run(t, async (O) => {
		const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), id = 'safety.rules.per-tool-permissions', out = {};
		P.setCtx({ project: 'tastebook' }); await wait(400);
		P.apply([{ level: 'computer', key: 'here', id, value: { bash: 'deny' } }, { level: 'project', key: 'tastebook', id, value: { bash: 'allow' } }], { history: false });
		if (P.feed && P.feed.push) P.feed.push(); await wait(500);
		const eng = (window.PM12_KIMI.getState().settings || {})[id]; out.engine = eng && eng.bash;
		out.line = (P.rows && P.rows.lines ? P.rows.lines(id, P.resolve(id, P.S.ctx)) : []).map((x) => x.text);
		Object.assign(out, await (new Function('return ' + O))()(id));
		return out;
	}, OPEN_PANEL.toString());
	await t.check('Astra A1: in tastebook, the engine’s Answer for each tool gets Block for bash (This computer’s), and the row says “For safety, This computer’s Bash: Block is used”', a1p.engine === 'deny' && a1p.line.some((x) => /For safety, This computer’s Bash: Block is used/.test(x)), JSON.stringify({ engine: a1p.engine, line: a1p.line }));
	await t.check('Astra A1: the panel says tastebook asks for Bash: Allow and This computer’s Bash: Block is used, which line decides which answer, and how answers combine', a1p.code === 'safety.rules.per-tool-permissions' && /tastebook asks for Bash: Allow\. For safety, This computer’s own is used: Bash: Block\./.test(a1p.now) && /This computer Bash: Block In use here for Bash, for safety/.test(a1p.where) && /tastebook Bash: Allow Not used here for Bash: for safety This computer’s own is used\./.test(a1p.where) && /Everywhere .* the default In use here for Edit, Read, Grep and 5 more/.test(a1p.where) && a1p.rules.some((x) => x.rule === 'per-item' && /the more careful is used: Block, then Ask me first, then Allow/.test(x.text)), JSON.stringify(a1p));
	await pic(t, 'astra-a1-panel', 'Astra A1: Answer for each tool in tastebook, This computer Block and tastebook Allow for bash: Block is used, and the panel says why', '#pm-settings-root .detail-inspector');
	await run(t, CLOSE_PANEL);

	/* A4, on the page's own resolver: every combination of Everywhere, this device and this project (each absent, On or
	   Off) with the operating system's preference (off, on): 54 cases. The value is On when any own request here is On,
	   the default only when none exists; the motion in use adds the operating system's */
	const a4 = await run(t, () => {
		const P = window.PSX, id = 'general.visual.reduce-animations', out = { n: 0, bad: [], fixture: null };
		const V = [undefined, true, false];
		for (const e of V) for (const d of V) for (const p of V) for (const os of [false, true]) {
			const w = P.clone(P.W); delete w.everywhere[id]; Object.keys(w.device).forEach((k) => { delete w.device[k][id]; }); Object.keys(w.project).forEach((k) => { delete w.project[k][id]; });
			if (e !== undefined) w.everywhere[id] = e; if (d !== undefined) w.device.here[id] = d; if (p !== undefined) w.project.harbor[id] = p;
			const r = P.resolve(id, { project: 'harbor', device: 'here', on: 'here', os }, w);
			const own = [['everywhere', e], ['device', d], ['project', p]].filter(([, v]) => v !== undefined);
			const want = own.length ? own.some(([, v]) => v === true) : P.DEFAULTS[id] === true;
			const by = want ? own.filter(([, v]) => v === true).pop() : own.pop(), wantFrom = by ? by[0] : 'default';
			const inUse = r && r.motion ? r.motion.effective : undefined;
			out.n++;
			if (!r || r.value !== want || r.from.level !== wantFrom || inUse !== (want || os)) out.bad.push(`Everywhere ${e}, This computer’s screen ${d}, harbor ${p}, OS ${os}: ${r && r.value} from ${r && r.from.level}, in use ${inUse} (want ${want} from ${wantFrom}, in use ${want || os})`);
		}
		const w = P.clone(P.W); w.everywhere[id] = true; w.device.here[id] = false; delete w.project.harbor[id];
		const r = P.resolve(id, { project: 'harbor', device: 'here', on: 'here' }, w); out.fixture = { value: r.value, from: r.from, combine: r.combine };
		return out;
	});
	await t.check('Astra A4: the review’s fixture (Everywhere On, This computer’s screen Off, harbor none of its own) resolves On, from Everywhere', !!a4.fixture && a4.fixture.value === true && a4.fixture.from.level === 'everywhere', JSON.stringify(a4.fixture));
	await t.check(`Astra A4: Reduce motion is an OR in all ${a4.n} combinations of Everywhere, the device and the project (absent, On, Off) with the operating system (off, on)`, a4.n === 54 && !a4.bad.length, `${a4.bad.length} wrong: ` + a4.bad.slice(0, 8).join(' | '));
	// A4 in the page: the fixture in the live world, then the operating system on with every request Off
	await reset(t);
	const a4p = await run(t, async (O) => {
		const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), id = 'general.visual.reduce-animations', out = {};
		P.setCtx({ project: 'harbor' }); await wait(400);
		const clear = Object.keys(P.W.device).map((k) => ({ level: 'device', key: k, id, value: undefined })).concat(Object.keys(P.W.project).map((k) => ({ level: 'project', key: k, id, value: undefined })));
		P.apply(clear.concat([{ level: 'everywhere', key: null, id, value: true }, { level: 'device', key: 'here', id, value: false }]), { history: false });
		if (P.feed && P.feed.push) P.feed.push(); await wait(500);
		out.engine = (window.PM12_KIMI.getState().settings || {})[id];
		out.line = (P.rows && P.rows.lines ? P.rows.lines(id, P.resolve(id, P.S.ctx)) : []).map((x) => x.text);
		out.fixture = await (new Function('return ' + O))()(id);
		document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close') && document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close').click(); await wait(300);
		P.apply([{ level: 'everywhere', key: null, id, value: false }, { level: 'device', key: 'here', id, value: false }], { history: false });
		await P.command({ cmd: 'motion', reduced: true }); if (P.feed && P.feed.push) P.feed.push(); await wait(400);
		const r = P.resolve(id, P.S.ctx); out.os = { value: r.value, inUse: r.motion && r.motion.effective, painted: document.documentElement.getAttribute('data-motion') };
		out.osPanel = await (new Function('return ' + O))()(id);
		await P.command({ cmd: 'motion', reduced: false });
		return out;
	}, OPEN_PANEL.toString());
	await t.check('Astra A4: in harbor, the engine’s Reduce motion is On, and the row says less motion wins because Everywhere asks for it', a4p.engine === true && a4p.line.some((x) => /^Less motion wins: Everywhere asks for it$/.test(x)), JSON.stringify({ engine: a4p.engine, line: a4p.line }));
	await t.check('Astra A4: the panel says This screen asks for full motion, Everywhere for less, and less motion wins; the device line says it isn’t used; the rule names the operating system', a4p.fixture.code === 'general.visual.reduce-animations' && /This screen asks for full motion\. Everywhere asks for less, and less motion wins\./.test(a4p.fixture.now) && /Not used here: less motion wins, and Everywhere asks for it\./.test(a4p.fixture.where) && a4p.fixture.rules.some((x) => x.rule === 'motion' && /or your operating system does, motion is reduced/.test(x.text)), JSON.stringify(a4p.fixture));
	await t.check('Astra A4: with every request Off and the operating system asking for less motion, the setting reads Off, the motion in use is reduced, and the panel says the operating system asks for it', a4p.os.value === false && a4p.os.inUse === true && a4p.os.painted === 'reduced' && /Your operating system asks for less motion, so motion is reduced anyway\./.test(a4p.osPanel.now) && a4p.osPanel.rules.some((x) => x.rule === 'motion' && /Your operating system asks for it now\./.test(x.text)), JSON.stringify({ os: a4p.os, now: a4p.osPanel.now, rules: a4p.osPanel.rules }));
	await run(t, CLOSE_PANEL);

	// found with A1 and A4: FileSafe's careful order reads its true and false (7150f6c5bc compared them with "on" and "off")
	const fsx = await run(t, () => {
		const P = window.PSX, id = 'safety.protection.filesafe-integration', ctx = { project: 'tastebook', device: 'here', on: 'here' };
		const at = (c, p) => { const w = P.clone(P.W); w.computer.here[id] = c; w.project.tastebook[id] = p; const r = P.resolve(id, ctx, w); return { value: r.value, from: r.from.level, careful: !!r.careful }; };
		return { order: P.DEF[id].careful, offOn: at(false, true), onOff: at(true, false) };
	});
	await t.check('neighbour (found with A1/A4): FileSafe On is the more careful whichever place asks for Off (This computer Off and tastebook On give On)', fsx.offOn.value === true && fsx.offOn.from === 'project' && fsx.onOff.value === true && fsx.onOff.from === 'computer' && fsx.onOff.careful, JSON.stringify(fsx));

	/* N1, in real panels: the review's three actions name their owner, keep "An action, not a setting" and no Change;
	   the two with an owner of their own open it */
	await reset(t);
	for (const [id, owner, open] of [['code.execution.registry-credentials', 'your company registry list', 'code.execution.enterprise-registries'], ['general.interaction.settings-search', 'the search box at the top of Settings', 'search'], ['general.interaction.history-compare', 'each item in the History timeline', null]]) {
		const n = await run(t, async ([i, ln, O]) => {
			const out = await (new Function('return ' + O))()(i);
			if (ln) {
				const b = document.querySelector('#pm-settings-root .detail-inspector [data-psx-key="owner-open"]');
				if (b) {
					b.click();
					if (ln === 'search') { await new Promise((r) => setTimeout(r, 400)); out.landed = !!document.activeElement && document.activeElement.matches('input[data-global-search]'); }
					else { for (let k = 0; k < 30; k++) { await new Promise((r) => setTimeout(r, 150)); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === ln) break; } const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); out.landed = !!c && c.textContent.trim() === ln; }
				}
			}
			return out;
		}, [id, open, OPEN_PANEL.toString()]);
		await t.check(`Astra N1: ${id} says it is an action, names its owner (${owner}) in Where it applies, and offers no Change${open ? `; “${n.link || 'its link'}” opens ${open === 'search' ? 'the search box' : open}` : ''}`, n.code === id && n.owner === 'action' && n.name === owner && /An action, not a setting/.test(n.where) && n.where.includes(`It belongs to ${owner}.`) && !n.change.length && (!open || n.landed === true), JSON.stringify(n));
		if (id === 'code.execution.registry-credentials') { await run(t, async (O) => { await (new Function('return ' + O))()('code.execution.registry-credentials'); }, OPEN_PANEL.toString()); await pic(t, 'astra-n1-registry', 'Astra N1: Other registry sign-ins names its owner, your company registry list, and opens it', '#pm-settings-root .detail-inspector'); }
		await run(t, CLOSE_PANEL);
	}
	await reset(t);
}

/* ------------------------------------------------------------------ Astra max A2 (2026-11-13): table E2, both ways
   The check's own copy of the README's table E2 (when a command pattern is host-dependent), never the page's: each row
   with the examples the README gives, the review's five patterns that were saved Everywhere on 7150f6c5bc, every earlier
   spelling (Sol max F1's seven, the reader's fourteen, the review's six controls), the words that are not paths (a web
   address, an image or registry reference, a git ref: the lead's canon call on PS-144, the same day), the narrow
   recheck's R1 and R2 witnesses with the two docker controls, and the portable controls. Every case is typed as your own pattern on npm test (a portable step, so
   only the pattern decides), and asserts the places offered, the line saying why, and the save: a host-dependent
   pattern offers no Everywhere, the save guard keeps no Everywhere rule even when Everywhere is forced, and This computer
   is kept; a portable one offers Everywhere and keeps it */
const E2 = {
	rows: [[1, 'program'], [2, 'root'], [3, 'relative'], [4, 'separator'], [5, 'flag'], [6, 'file'], [7, 'filecmd'], [8, 'wildcard']],
	// [pattern, the row the rule must name first, the word it must name]
	table: [
		['./scripts/release.sh v1.4.0', 1, './scripts/release.sh'], ['scripts/release', 1, 'scripts/release'], ['"/opt/tools/runner" test', 1, '/opt/tools/runner'], ['C:/Tools/runner test', 1, 'C:/Tools/runner'], ['\\\\nas\\share\\runner test', 1, '\\\\nas\\share\\runner'], ['$HOME/bin/runner', 1, '$HOME/bin/runner'],
		['npm --prefix=/opt/release test', 2, '/opt/release'], ['gcc -I/usr/include x', 2, '/usr/include'], ['PATH=/opt/bin npm test', 2, '/opt/bin'], ['npm --prefix ~/x test', 2, '~/x'], ['cd ~', 2, '~'], ['cd $HOME', 2, '$HOME'], ['dir C:', 2, 'C:'], ['git diff /etc/hosts', 2, '/etc/hosts'], ['curl file:///etc/hosts', 2, 'file:///etc/hosts'],
		['prettier --write .', 3, '.'], ['cd ..', 3, '..'], ['git diff ./src', 3, './src'],
		['node scripts/release', 4, 'scripts/release'], ['npm --prefix=packages/app test', 4, 'packages/app'], ['git -C repos/loom status', 4, 'repos/loom'], ['git diff -- src/app', 4, 'src/app'], ['node .venv/bin/tool', 4, '.venv/bin/tool'], ['npm install @types/node', 4, '@types/node'], ['docker push jared/loom:1.4.0', 4, 'jared/loom:1.4.0'],
		['npm --prefix=release test', 5, 'release'], ['git -C repo status', 5, 'repo'], ['git -C repo push origin feature/tags', 5, 'repo'], ['tsc -p tsconfig.json', 5, 'tsconfig.json'], ['cargo build --manifest-path Cargo.toml', 5, 'Cargo.toml'], ['docker build -f Dockerfile', 5, 'Dockerfile'],
		['python3 build.py', 6, 'build.py'], ['bash deploy.sh *', 6, 'deploy.sh'], ['release.sh', 6, 'release.sh'], ['git log deploy.sh', 6, 'deploy.sh'],
		['read *', 7, 'read'], ['rm -rf *', 7, 'rm'],
		['*', 8, '*'], ['*-cli build', 8, '*-cli']
	],
	// the review's five, saved as Everywhere rules on 7150f6c5bc
	witnesses: ['npm --prefix=packages/app test', 'git -C repos/loom status', 'node scripts/release', 'npm --prefix=release test', 'git -C repo status'],
	// every earlier spelling: Sol max F1's seven, the reader's fourteen, the review's six controls, and the units' path
	earlier: ['npm --prefix=/opt/release test', 'npm --prefix=../other test', '"/opt/tools/runner" test', '"../tools/runner" test', 'C:/Tools/runner test', '.\\tools\\runner test', '\\\\nas\\share\\runner test',
		'C:\\Tools\\runner test', 'npm --prefix ~/x test', '$HOME/bin/runner', '%USERPROFILE%\\bin\\runner.exe', 'tools/runner test', 'gcc -I/usr/include x', 'PATH=/opt/bin npm test', '//nas/share/runner', '~\\bin\\runner', 'node --require=./hook.js app', "npm --prefix='/opt/x' test", 'prettier --write .', 'tools\\runner test', 'npm --prefix="C:\\Program Files\\x" test',
		'/opt/release', '"/opt/release tools/run"', 'C:/tools/release', '.\\scripts\\release.cmd', '\\\\nas\\share\\release.cmd', '"./scripts/release.js"', '/usr/local/bin/npm test'],
	/* not a path (the README's "Not a path", the lead's canon call on PS-144): a web address, an image or registry
	   reference whose first segment is a host name, a git ref. The first four were the controls the first version of E2
	   read as paths; each is portable again */
	notAPath: [['git push origin feature/tags', 'a git ref'], ['docker push ghcr.io/jared/loom:1.4.0', 'an image reference'], ['npm publish --registry=https://registry.npmjs.org', 'a web address'], ['curl -fsSL https://bun.sh/install', 'a web address'],
		['curl https://example.com/a/b?c=d/e', 'a web address'], ['curl https://example.com/install.sh', 'a web address'], ['docker pull localhost:5000/app:dev', 'an image reference'], ['docker pull quay.io/org/app:1.0', 'an image reference'],
		['git push -f origin feature/tags', 'a git ref'], ['git rebase origin/main', 'a git ref'], ['git diff main..feature/tags', 'a git ref'], ['git checkout -b feature/x', 'a git ref'], ['git -c core.pager=less log feature/tags', 'a git ref'], ['git push origin HEAD:refs/heads/feature/x', 'a git ref']],
	// the page's own reading of single words: [word, read where an image is taken, kind or null]
	kinds: [['https://bun.sh/install', false, 'web'], ['https://registry.example.com:8443/npm/', false, 'web'], ['ghcr.io/jared/loom:1.4.0', true, 'image'], ['localhost:5000/app', true, 'image'], ['ghcr.io/jared/loom:1.4.0', false, null], ['scripts.dev/release.js', false, null], ['file:///etc/hosts', false, null], ['jared/loom:1.4.0', true, null], ['.venv/bin/tool', true, null], ['scripts.d/release', true, null], ['@types/node', false, null]],
	/* the narrow recheck (REVIEW-concept-A-astrafix-sol-high.md): R1, a host-shaped local folder was read as a registry
	   and saved Everywhere; R2, a web address with a port was split at the port. [pattern, kind, label, row, word] */
	recheck: [['node scripts.dev/release.js', 'host', 'recheck R1 witness', 4, 'scripts.dev/release.js'], ['node scripts.dev/release', 'host', 'recheck R1 witness', 4, 'scripts.dev/release'],
		['node registry.example.com/org/app.js', 'host', 'recheck R1: a registry spelling outside an image argument', 4, 'registry.example.com/org/app.js'], ['node localhost:5000/org/app', 'host', 'recheck R1: a registry spelling outside an image argument', 4, 'localhost:5000/org/app'],
		['npm publish --registry=https://registry.example.com:8443/npm/', 'portable', 'recheck R2 witness', null, null],
		['docker push registry.example.com/org/app:tag', 'portable', 'recheck R1 docker control', null, null], ['docker push localhost:5000/org/app:tag', 'portable', 'recheck R1 docker control', null, null]],
	// portable: the brief's four, then the earlier controls with no / or \, and git's -C after a subcommand
	portable: ['npm test *', 'git status', 'cargo build', 'pytest -q', 'npm test', 'git push origin *', 'npm run build', 'NODE_ENV=production npm test', 'make -j8 test', 'cargo build --profile release', 'pytest -p no:cacheprovider', 'cargo test -p mycrate', 'git commit -C HEAD']
};
async function astraAlways(t, h) {
	const { sh, open, typeOwn, ed, keptRules } = h;
	// the page's one rule has the table's rows, in its order, and names each table case's row and word
	const unit = await run(t, (T) => {
		const P = window.PSX, A = P.approvals, S = A ? Object.fromEntries(A.ASKS.map((x) => [x.id, x])) : {};
		const host = (p) => (P.paths && P.paths.host ? P.paths.host(p) : null);
		return {
			rows: P.paths && P.paths.rows ? P.paths.rows.map((r) => [r.row, r.why]) : null,
			table: T.table.map(([p, row, word]) => { const x = host(p); return { p, want: [row, word], got: x ? [x.row, x.word] : null, editor: !!A && A.hostDependent(p, S.test) }; }).filter((x) => !x.got || x.got[0] !== x.want[0] || x.got[1] !== x.want[1] || !x.editor),
			notAPath: T.notAPath.map(([p]) => p).filter((p) => !!host(p) || !A || A.hostDependent(p, S.test)),
			kinds: T.kinds.filter(([w, image, k]) => !(P.paths && P.paths.notAPath) || P.paths.notAPath(w, image) !== k),
			recheck: T.recheck.map(([p, kind, , row, word]) => { const x = host(p); return { p, kind, got: x ? [x.row, x.word] : null, want: row ? [row, word] : null, editor: !!A && A.hostDependent(p, S.test) }; }).filter((x) => JSON.stringify(x.got) !== JSON.stringify(x.want) || x.editor !== (x.kind === 'host')),
			portable: T.portable.filter((p) => !!host(p) || (A && A.hostDependent(p, S.test)))
		};
	}, E2);
	await t.check('Astra A2: the page’s one rule (PSX.paths.host) holds table E2’s eight rows, in the table’s order', JSON.stringify(unit.rows) === JSON.stringify(E2.rows), JSON.stringify(unit.rows));
	await t.check(`Astra A2: each of table E2’s ${E2.table.length} examples is host-dependent by its own row, naming its word, and the editor’s classifier agrees (git ref positions still take rows 2, 3 and 6)`, !unit.table.length, JSON.stringify(unit.table));
	await t.check(`Follow-up (not a path, PS-144): the ${E2.notAPath.length} patterns naming a web address, an image or registry reference or a git ref are host-dependent by no row, and the page reads each kind of word as the table says (${E2.kinds.length} words)`, !unit.notAPath.length && !unit.kinds.length, JSON.stringify({ notAPath: unit.notAPath, kinds: unit.kinds }));
	await t.check(`Recheck R1/R2: the page’s rule names the two R1 witnesses and their registry-spelled siblings as relative paths (row 4), and reads the R2 web address and the two docker image controls as no path (${E2.recheck.length} patterns)`, !unit.recheck.length, JSON.stringify(unit.recheck));
	await t.check(`Astra A2: the ${E2.portable.length} portable controls (npm test *, git status, cargo build, pytest -q and the earlier ones) are host-dependent by no row`, !unit.portable.length, JSON.stringify(unit.portable));
	// broad detection reads the same words: a directory flag's value counts with its flag
	const broad = await run(t, () => { const A = window.PSX.approvals, S = Object.fromEntries(A.ASKS.map((x) => [x.id, x])); return { flagThenStar: A.isBroad('git -C repo *', S.test), subcommand: A.isBroad('git -C repo status *', S.test), script: A.isBroad('node scripts/release *', S.test) }; });
	await t.check('Astra A2 (F reads E2’s words): git -C repo * is a program, flags and a flag’s folder, then *: broad; git -C repo status * and node scripts/release * name a subcommand or a script: not broad', broad.flagThenStar === true && broad.subcommand === false && broad.script === false, JSON.stringify(broad));
	// both ways, in the editor and through the save, one case at a time
	const cases = [], seen = new Set();
	const add = (p, kind, why) => { if (seen.has(p)) return; seen.add(p); cases.push([p, kind, why]); };
	E2.witnesses.forEach((p) => add(p, 'host', 'the review’s saved witness'));
	E2.table.forEach(([p, row]) => add(p, 'host', `table E2 row ${row}`));
	E2.earlier.forEach((p) => add(p, 'host', 'an earlier spelling'));
	E2.recheck.forEach(([p, kind, label]) => add(p, kind, label));
	E2.notAPath.forEach(([p, kind]) => add(p, 'portable', `not a path: ${kind}`));
	E2.portable.forEach((p) => add(p, 'portable', 'a portable control'));
	let shot = false;
	for (const [pat, kind, why] of cases) {
		await open('regular');
		await typeOwn('test', pat);
		const e = await ed('test');
		const places = e ? e.where.map((x) => x.split(':')[0]) : [];
		let admitted = {};
		if (kind === 'host') {
			/* the save guard on an editor that still shows Everywhere (as the Sol max guard check does): Everywhere chosen for
			   npm test, the pattern swapped with no redraw, Add the rule pressed; then This computer */
			await open('regular');
			await typeOwn('test', 'npm test');
			await t.root.locator(`${sh} [data-always="test"] [data-where="everywhere"]`).check(); await settle(t, 150);
			await run(t, (q) => { window.PSX.approvals.st.edit.pattern = q; const i = document.querySelector('.psx-sheet [data-pat-own]'); if (i) i.value = q; }, pat);
			await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 220);
			const g = await run(t, () => ({ rules: window.PSX.approvals.st.rules.map((r) => `${r.pattern} @ ${r.where}`), note: ((document.querySelector('.psx-note') || {}).innerText || '').replace(/\s+/g, ' ').trim() }));
			admitted.everywhere = g.rules.some((r) => / @ everywhere$/.test(r)); admitted.note = g.note;
			if (await t.root.locator(`${sh} [data-always="test"] [data-where="computer"]`).count()) { await t.root.locator(`${sh} [data-always="test"] [data-where="computer"]`).check(); await settle(t, 150); await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 220); }
			admitted.kept = await keptRules();
			const ok = !!e && JSON.stringify(places) === JSON.stringify(['project', 'computer']) && e.note && e.noteText.length > 25 && !admitted.everywhere && /Not kept/.test(admitted.note) && admitted.kept.includes(`${pat} @ computer`) && !admitted.kept.some((r) => / @ everywhere$/.test(r));
			await t.check(`Astra A2 (${why}): ${pat} offers This project and This computer only, says why, the guard keeps no Everywhere rule, and This computer is kept`, ok, JSON.stringify({ places, line: e && e.noteText, guard: admitted.note, kept: admitted.kept }));
			if (!shot && pat === E2.witnesses[0]) { shot = true; await open('regular'); await typeOwn('test', pat); await run(t, () => window.__psxScrollTo(document.querySelector('.psx-sheet [data-k="noeverywhere"]'), 'center')); await settle(t, 200); await pic(t, 'astra-a2-witness', `Astra A2: ${pat} typed on npm test: Everywhere isn’t offered, and the line says why`, '.psx-sheet'); }
		} else {
			let kept = [];
			if (places.includes('everywhere')) { await t.root.locator(`${sh} [data-always="test"] [data-where="everywhere"]`).check(); await settle(t, 150); await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 220); kept = await keptRules(); }
			await t.check(`Astra A2 (${why}): ${pat} offers This project, This computer and Everywhere with no line against it, and is kept Everywhere`, !!e && JSON.stringify(places) === JSON.stringify(['project', 'computer', 'everywhere']) && !e.note && kept.includes(`${pat} @ everywhere`), JSON.stringify({ places, line: e && e.noteText, kept }));
		}
	}
	await t.check(`Astra A2: ${cases.length} cases walked through the editor and the save (${cases.filter((c) => c[1] === 'host').length} host-dependent, ${cases.filter((c) => c[1] === 'portable').length} portable)`, cases.length === new Set([...E2.witnesses, ...E2.recheck.map((x) => x[0]), ...E2.table.map((x) => x[0]), ...E2.earlier, ...E2.notAPath.map((x) => x[0]), ...E2.portable]).size && cases.length >= 60, String(cases.length));
}

/* ------------------------------------------------------------------ Astra max A3 (2026-11-13): Keep them fixed and screens
   SSYS-062: Keep them fixed "freezes only the previewed portable values"; "computer programs, paths, screen values and
   secrets are never made portable by freezing". The review's set-up: the device in use has its own Theme (Retro Light)
   and Reduce motion (On); Copy settings tastebook into harbor, Advanced, Keep them fixed. 7150f6c5bc counted, ticked,
   previewed and wrote both into harbor. Then the source project's own Theme, which travels under its own contract */
async function astraCopy(t) {
	const TH = 'general.visual.theme', RM = 'general.visual.reduce-animations';
	for (const [where, variant] of [['settings', 'device'], ['new', 'device'], ['settings', 'own']]) {
		await reset(t);
		const r = await run(t, async ([where, variant, TH, RM]) => {
			const P = window.PSX, wait = (ms) => new Promise((res) => setTimeout(res, ms)), out = { where, variant };
			const writes = [{ level: 'device', key: 'here', id: TH, value: 'Retro Light' }, { level: 'device', key: 'here', id: RM, value: true }];
			if (variant === 'own') writes.push({ level: 'project', key: 'tastebook', id: TH, value: 'Glass Light' });
			const sh = () => document.querySelector('.psx-sheet.psx-copy');
			// a moment starts from a fresh demo, so the device's own values are set once its sheet is open (the plan is read live)
			if (where === 'settings') { P.apply(writes, { history: false }); P.setCtx({ project: 'harbor' }); await wait(500); P.copy.open({ mode: 'settings', src: 'tastebook', advanced: true }); await wait(600); }
			else { await P.command({ cmd: 'moment', id: 'copy-new' }); await wait(800); P.apply(writes, { history: false }); await wait(200); }
			out.src = P.copy.st.src; out.dst = P.copy.st.dst;
			const adv = sh().querySelector('details.psx-adv'); if (adv && !adv.open) { sh().querySelector('details.psx-adv > summary').click(); await wait(250); }
			sh().querySelector('input[data-act="fixed"]').click(); await wait(300);
			const ob = sh().querySelector('[data-act="openkind"][data-kind="appearance_workspace"]'); if (ob && ob.getAttribute('aria-expanded') !== 'true') { ob.click(); await wait(250); }
			const plan = P.copy.plan();
			out.plan = plan.rows.filter((x) => [TH, RM].includes(x.id)).map((x) => `${x.id}=${JSON.stringify(x.value)} (${x.from})`);
			out.held = (plan.held || []).map((x) => x.id).sort();
			out.ticks = [TH, RM].filter((id) => !!sh().querySelector(`input[data-id="${id}"]`));
			const m = /Copy (\d+) setting/.exec(sh().querySelector('.psx-sheet-foot .btn.primary').textContent); out.button = m ? +m[1] : -1; out.total = P.copy.totals().n;
			sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(500);
			out.preview = [...sh().querySelectorAll('li .psx-li-name')].map((x) => x.textContent.trim()).filter((x) => /^(Theme|Reduce motion):/.test(x));
			out.heldLine = ((sh().querySelector('[data-k="screenheld"]') || {}).textContent || '').replace(/\s+/g, ' ').trim();
			out.skipLine = /screen settings \(they belong to each device\)/.test(sh().innerText);
			if (where === 'settings') {
				[...sh().querySelectorAll('.psx-sheet-foot .btn')].find((b) => b.textContent === 'Copy').click(); await wait(1600);
				const now = P.W.project.harbor || {};
				out.write = { theme: now[TH], motion: now[RM] };
				out.receipt = ((document.querySelector('.psx-note') || {}).innerText || '').replace(/\s+/g, ' ').trim();
			}
			return out;
		}, [where, variant, TH, RM]);
		const W3 = where === 'new' ? 'New Project like tastebook' : 'Copy settings tastebook into harbor';
		if (variant === 'device') {
			await t.check(`Astra A3, ${W3}: Keep them fixed leaves the device’s own Theme and Reduce motion out of the plan, the ticks and the count`, !r.plan.length && JSON.stringify(r.held) === JSON.stringify([RM, TH].sort()) && !r.ticks.length && r.button === r.total, JSON.stringify(r));
			await t.check(`Astra A3, ${W3}: the preview lists neither, names them as held with the device, and its “screen settings” line is true`, !r.preview.length && /Not kept fixed: .*Reduce motion \(On\).*Theme \(Retro Light\)|Not kept fixed: .*Theme \(Retro Light\).*Reduce motion \(On\)/.test(r.heldLine) && /This computer’s own screen settings, and screen settings belong to each device/.test(r.heldLine) && r.skipLine, JSON.stringify({ preview: r.preview, held: r.heldLine }));
			if (where === 'settings') await t.check(`Astra A3, ${W3}: Copy writes neither into harbor (the committed destination, not only the preview)`, !!r.write && r.write.theme === undefined && r.write.motion === undefined && /^Copied \d+ settings/.test(r.receipt), JSON.stringify({ write: r.write, receipt: r.receipt }));
			if (where === 'new') { await run(t, () => window.__psxScrollTo(document.querySelector('.psx-sheet.psx-copy [data-k="screenheld"]'), 'center')); await settle(t, 250); }
			if (where === 'new') await pic(t, 'astra-a3-preview', 'Astra A3: New Project like tastebook, Keep them fixed: the device’s Theme and Reduce motion are held, and the preview says so', '.psx-sheet.psx-copy');
		} else {
			await t.check('Astra A3, the source project’s own Theme still travels under its own contract (an own row, ticked, previewed and written); the device’s Reduce motion is held', r.plan.length === 1 && /^general\.visual\.theme="Glass Light" \(own\)$/.test(r.plan[0]) && JSON.stringify(r.held) === JSON.stringify([RM]) && JSON.stringify(r.ticks) === JSON.stringify([TH]) && r.preview.some((x) => /^Theme: Glass Light/.test(x)) && !r.preview.some((x) => /^Reduce motion/.test(x)) && !!r.write && r.write.theme === 'Glass Light' && r.write.motion === undefined, JSON.stringify(r));
		}
		await run(t, () => window.PSX.closeSheets()); await settle(t, 300);
	}
	await reset(t);
}

/* ------------------------------------------------------------------ Jared's review, 2026-11-13 (items 1, 3 and 5)
   `--set only=jared1113` runs the three parts; `--set j1113=models,paths,limits` narrows them, `--set j1113max=N` walks
   only the first N rows of the paths part (a quick look; the proof run walks them all).
   Every expectation is read from the main control or Plans' inventory, never from the layer's own answer: a model row is
   the inventory's type model_picker with its option_labels.inherit; a row's choices are the ones its main control lists
   (PM51.settingRows draws the row the way Settings does); a number's limits are its main control's box (min and max on
   the input PM51.settingRows draws), or the main control's own number dialog's (PM51.rowMeta, then the engine setting's
   own bounds), with the inventory's range ("0.0-2.0") over them. The paths go through real presses: the end of the
   path (Change, + Set for…, the menu's place) is clicked, a value is typed, Save is pressed. */
let J_INV_ROWS;
const jInventory = (t) => {
	if (J_INV_ROWS !== undefined) return J_INV_ROWS;
	try {
		const raw = JSON.parse(fs.readFileSync(path.resolve(t.args.inventory || 'Plans/settings_inventory.json'), 'utf8'));
		J_INV_ROWS = {};
		(raw.settings || []).forEach((r) => { if (r && r.id) J_INV_ROWS[r.id] = { type: r.type || null, options: r.options || null, labels: r.option_labels || null, picker: r.model_picker || null, may: (r.layering || {}).may_differ_by || [], home: (r.layering || {}).home || null, def: r.default }; });
	} catch (e) { J_INV_ROWS = null; }
	return J_INV_ROWS;
};
// the panel's current page (a page cross-fading out, .o55-leaving, can still hold the last row's buttons for a moment)
const J_INSP = '#pm-settings-root .detail-inspector :is([data-psx-block="where"], .psx-wedit, [data-psx-block]):not(.o55-leaving *)';
const J_PANEL = '#pm-settings-root .detail-inspector';
/* Playwright brings a target into view with scrollIntoView, which also scrolls the app's overflow-hidden ancestors (tool
   note E above): a press here first scrolls only the panel's own scroller, then puts any scrolled root back */
const J_UNSCROLL = () => { for (let el = document.getElementById('pm-settings-root'); el; el = el.parentElement) { if (el.scrollTop && getComputedStyle(el).overflowY === 'hidden') el.scrollTop = 0; } if (document.scrollingElement && document.scrollingElement.scrollTop) document.scrollingElement.scrollTop = 0; };
async function jPress(t, loc) {
	await t.root.evaluate(J_UNSCROLL);
	await loc.evaluate((el) => { if (window.__psxScrollTo) window.__psxScrollTo(el, 'center'); });
	await loc.click();
}
// open one row's Details panel (programmatic, the way search and the row menu do); the presses that follow are real
async function jOpen(t, id) {
	await run(t, (i) => {
		if (window.PSX.places && window.PSX.places.close) window.PSX.places.close();
		const c = document.querySelector('#pm-settings-root .detail-inspector [data-psx-key$=":cancel"]'); if (c) c.click();
		document.querySelectorAll('.drawer-wrap.is-open [data-action="close-overlay"]').forEach((b) => b.click());
		window.PM51.revealSetting(i, { detail: true });
	}, id);
	return t.root.waitForFunction((i) => {
		const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]');
		const page = insp && (insp.querySelector(':scope > .o55-insp-page:not(.o55-leaving)') || insp);
		const code = page && page.querySelector('.o55-insp-tech code');
		return !!(code && code.textContent.trim() === i && page.querySelector('[data-psx-block="where"]') && !document.querySelector('.drawer-wrap.is-open'));
	}, id, { timeout: 8000, polling: 50 }).then(async () => { await t.root.evaluate(J_UNSCROLL); return true; }, () => false);
}
// clean up after one path: the picker, an inline edit, the row's own editor
async function jClean(t) {
	const hadRow = await run(t, () => !!document.querySelector('.drawer-wrap.is-open') || !!(window.PSX.places && window.PSX.places.editing));
	await run(t, () => {
		if (window.PSX.places && window.PSX.places.close) window.PSX.places.close();
		const c = document.querySelector('#pm-settings-root .detail-inspector [data-psx-key$=":cancel"]'); if (c) c.click();
		document.querySelectorAll('.drawer-wrap.is-open [data-action="close-overlay"]').forEach((b) => b.click());
	});
	await t.root.waitForFunction(() => !document.querySelector('.drawer-wrap.is-open, .psx-mpick') && !document.querySelector('#pm-settings-root .detail-inspector .psx-wedit') && !(window.PSX.places && window.PSX.places.editing), null, { timeout: 3000, polling: 50 }).catch(() => {});
	// the row's own editor, once closed, puts the engine back on this context a moment later (places.js endRow)
	if (hadRow) await settle(t, 450);
}
/* a path to a place, with real presses: + Set for a computer… / device… / project… and the first place it offers, or,
   when every place already has its own, that place's Change. Returns { how, key } or null */
async function jPath(t, level) {
	// the Where block is drawn a frame after the panel: wait for this level's + Set for… (or a line's Change)
	await t.root.waitForFunction((lv) => !!document.querySelector(`#pm-settings-root .detail-inspector [data-psx-block="where"]:not(.o55-leaving *) :is([data-psx-key="add:${lv}"], [data-psx-key^="${lv}:"][data-psx-key$=":change"])`), level, { timeout: 2500, polling: 50 }).catch(() => {});
	const add = t.root.locator(`${J_INSP} [data-psx-key="add:${level}"]`).first();
	if (await add.count()) {
		// the menu that is open (one closing a moment ago is still in the page, .is-closing, until it is hidden); a press
		// that landed as the panel was redrawn opens none, and is pressed once more
		const menu = () => t.root.waitForFunction(() => !!document.querySelector('.pmr-menu.is-open:not(.is-closing) .pmr-mi'), null, { timeout: 2000, polling: 50 }).then(() => true, () => false);
		await jPress(t, add);
		let ok = await menu();
		if (!ok && (await add.count())) { await jPress(t, add); ok = await menu(); }
		if (ok) {
			const item = t.root.locator('.pmr-menu.is-open:not(.is-closing)').last().locator('.pmr-mi:not([aria-disabled="true"]):not([disabled])').first();
			if (await item.count()) { const name = (await item.innerText()).split('\n')[0].trim(); await item.click(); return { how: 'add', name }; }
			await t.page.keyboard.press('Escape');
		}
	}
	// a place that has its own already (or a computer row's own line): its Change
	const ch = t.root.locator(`${J_INSP} [data-psx-key^="${level}:"][data-psx-key$=":change"]:not([aria-disabled="true"])`).first();
	if (await ch.count()) { const k = (await ch.getAttribute('data-psx-key')).split(':')[1]; await jPress(t, ch); return { how: 'change', name: k }; }
	return null;
}
/* what the path ended in: the picker over the page, the row's own editor for that place, or an inline editor */
const J_EDITOR = () => {
	const insp = document.querySelector('#pm-settings-root .detail-inspector');
	const pick = document.querySelector('.psx-mpick');
	const drawer = document.querySelector('.drawer-wrap.is-open .drawer');
	const wedit = insp && insp.querySelector('.psx-wedit');
	const line = wedit && wedit.closest('[data-psx-line]');
	const ctl = wedit && wedit.querySelector('[data-psx-edit-control]');
	const out = { pick: null, drawer: null, inline: null, line: line && line.getAttribute('data-psx-line') };
	if (pick) {
		const r = pick.getBoundingClientRect();
		out.pick = { fixed: getComputedStyle(pick).position === 'fixed', inPanel: !!(insp && insp.contains(pick)), onScreen: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1, options: [...pick.querySelectorAll('[role="option"]')].map((o) => ({ value: o.getAttribute('data-value'), text: o.textContent.trim() })), text: pick.textContent, depth: !!pick.querySelector('.psx-mpick-depth') };
	}
	if (drawer) out.drawer = { save: !!drawer.querySelector('.pm51-panel-foot .btn.primary'), place: drawer.closest('.drawer-wrap') && (drawer.querySelector('[data-psx-place-edit]') || drawer.closest('[data-psx-place-edit]') || drawer.matches('[data-psx-place-edit]')) ? (drawer.getAttribute('data-psx-place-edit') || '') : null, banner: (drawer.querySelector('.psx-place-banner') || {}).textContent || '', title: (drawer.querySelector('.pm51-panel-title') || {}).textContent || '' };
	if (wedit) {
		const sel = wedit.querySelector('select'), num = wedit.querySelector('input[type="number"]'), txt = wedit.querySelector('input[type="text"], textarea'), sw = wedit.querySelector('[role="switch"]'), boxes = [...wedit.querySelectorAll('.psx-multi input[type="checkbox"]')], trig = wedit.querySelector('[data-psx-mpick]');
		out.inline = { nicks: !!wedit.querySelector('.psx-nicks'), nickPickers: wedit.querySelectorAll('.psx-nicks [data-psx-mpick]').length, nickAdd: !!wedit.querySelector('[data-psx-nick-add]'), tag: ctl && ctl.tagName, save: !!wedit.querySelector('[data-psx-key$=":save"]'), select: sel ? [...sel.options].map((o) => o.value) : null, number: num ? { min: num.min, max: num.max, step: num.step } : null, text: txt ? txt.value : null, switch: !!sw, multi: boxes.length ? boxes.map((b) => b.value) : null, trigger: !!trig, auto: !!wedit.querySelector('[data-psx-auto]') };
	}
	return out;
};
/* the main control's own choices and limits for a row, read off the row Settings draws (PM51.settingRows) */
const J_MAIN = (id) => {
	const s = window.PM51.setting(id) || {}, m = (window.PM51.rowMeta && window.PM51.rowMeta(id)) || {};
	const tpl = document.createElement('template'); tpl.innerHTML = window.PM51.settingRows([id]) || '';
	const ctl = tpl.content.querySelector('.setting-control') || tpl.content;
	const opts = [...ctl.querySelectorAll('select option')].map((o) => o.value);
	const vals = opts.length ? opts : [...ctl.querySelectorAll('[data-value]')].map((b) => b.getAttribute('data-value'));
	const num = ctl.querySelector('input[type="number"]');
	const n = (v) => (v === '' || v == null ? NaN : Number(v));
	return { control: s.control || null, choices: [...new Set(vals)], lo: num && num.min !== '' ? n(num.min) : n(m.min != null ? m.min : s.min), hi: num && num.max !== '' ? n(num.max) : n(m.max != null ? m.max : s.max), step: n(m.step != null ? m.step : s.step), scale: Number(m.scale) || 1, minFrom: !!m.minFrom || !!m.maxFrom, def: s.value };
};
const jWant = (t, part) => !t.args.j1113 || String(t.args.j1113).split(',').includes(part);
const J_NUMERIC = ['number', 'slider', 'number-inherited', 'slider-inherited', 'stepper'];
const jRange = (opts) => { if (!Array.isArray(opts) || opts.length !== 1 || typeof opts[0] !== 'string') return null; const m = /^\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*%?\s*$/.exec(opts[0]); return m ? [Number(m[1]), Number(m[2])] : null; };
// press Save in the line, and answer a preview sheet with its own primary button when one opens (a safety row's)
async function jSave(t, line) {
	await jPress(t, t.root.locator(`${J_INSP} [data-psx-key="${line}:save"]`).first());
	await settle(t, 250);
	const sheet = t.root.locator('.psx-back:not([data-leaving]) .psx-sheet .psx-sheet-foot .btn.primary').first();
	if (await sheet.count()) { await sheet.click(); await settle(t, 300); }
}

export default async function (t) {
	await t.app.open();
	const has = await run(t, () => document.documentElement.hasAttribute('data-psx-layer'));
	if (!has) { await t.check('not a settings-scope build, skipped (build it with tools/build_standalone.py)', true); return; }
	await t.until('the layer is booted', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
	await run(t, HELPERS);
	await settle(t, 800);

	/* ------------------------------------------------------------------ #3 rows line up */
	if (want(t, 'rows')) await t.step('#3: every control and end word in a section lines up', async () => {
		const CONFIGS = [['origin', 'outline', 'decided'], ['mark', 'outline', 'end B'], ['line', 'outline', 'end C'], ['more', 'outline', 'end D'], ['today', 'outline', 'end Today'], ['origin', 'word', 'Changed B'], ['origin', 'frame', 'Changed C'], ['origin', 'today', 'Changed Today']];
		for (const lk of looks(t)) {
			await look(t, lk);
			for (const [wname, w] of WIDTHS) {
				await t.viewport(w, w >= 1920 ? 1080 : 900);
				await settle(t, 400);
				for (const pg of ['models', 'services']) {
					await page(t, pg);
					for (const [end, changed, name] of CONFIGS) {
						await opt(t, end, changed);
						const r = await run(t, ROWS);
						await t.check(`${lk} · ${wname} · ${pg} · ${name}: ${r.rows} rows in ${r.groups} groups line up`, r.groups > 0 && r.bad.length === 0, r.bad.slice(0, 4).join(' | '));
					}
					await opt(t, 'origin', 'outline');
					if (pg === 'models') await pic(t, `rows-${lk}-${wname}`, `Models, decided design, ${lk}, ${wname}: each section's controls end at one x and the end words start at one x`, '#pm-settings-root .workspace-block, #pm-settings-root main');
				}
			}
		}
		await t.viewport(1920, 1080);
		await look(t, 'basic-dark');
		await page(t, 'services');
		await pic(t, 'rows-services-account', 'Services › Claude, an account open: Each account rows line up with the rest', null);
	});

	/* ------------------------------------------------------------------ #4 toggling doesn't shake the page */
	if (want(t, 'shake')) await t.step('#4: a toggle moves nothing but itself', async () => {
		await reset(t);
		for (const [wname, w] of [['1920', 1920], ['1024', 1024], ['860', 860]]) {
			await t.viewport(w, w >= 1920 ? 1080 : 900);
			for (const [end, changed] of [['origin', 'outline'], ['more', 'outline'], ['today', 'outline']]) {
				await opt(t, end, changed);
				await page(t, 'models');
				for (const sel of ['#setting-general\\.interaction\\.provider-disclosure .toggle', '#setting-general\\.interaction\\.provider-disclosure .toggle', '#setting-ai\\.usage\\.auto-refresh-discovery .toggle']) {
					const r = await run(t, TOGGLE, sel);
					const where = `${wname} · ${end} · ${r.id || sel}`;
					await t.check(`${where}: the switch stays put (${r.frames} frames)`, !r.missing && !r.toggleX, JSON.stringify(r));
					await t.check(`${where}: the end word neither moves nor changes width`, !r.endX && !r.endW, JSON.stringify(r));
					await t.check(`${where}: no frame shows a row’s “?” instead of its word`, !r.bareEnds, JSON.stringify(r));
					await t.check(`${where}: the row, the next row and the header keep their place`, !r.rowY && !r.rowH && !r.nextY && !r.bar, JSON.stringify(r));
					await t.check(`${where}: Changed appears or goes once, never on, off and on`, r.changedFlips <= 1 && r.maxChanged <= 1, JSON.stringify(r));
					await t.check(`${where}: the browser saw no layout shift in Settings`, r.shifts.length === 0, r.shifts.join(', '));
				}
				await run(t, () => window.PSX.hideNote());
			}
		}
		// a screen row on General (Play sounds), routed to this device, and a demo row routed to everywhere
		await t.viewport(1920, 1080);
		await opt(t, 'origin', 'outline');
		await reset(t);
		for (const id of ['general.interaction.show-tooltips', 'general.interaction.eli5-default', 'ai.models.interleaved-thinking']) {
			await run(t, async (i) => { window.PM51.revealSetting(i); await new Promise((r) => setTimeout(r, 1200)); }, id);
			const r = await run(t, TOGGLE, `#setting-${id.replace(/\./g, '\\.')} .toggle`);
			if (r.missing) { await t.check(`${id} is drawn with a switch`, false, 'not drawn'); continue; }
			// Explain technical terms rewrites the descriptions on purpose, so the rows below may move; nothing else may
			const reflows = id === 'general.interaction.eli5-default';
			await t.check(`${r.id}: nothing moves but the switch${reflows ? ' (its new wording may move the rows below)' : ''}`, !r.toggleX && !r.endX && !r.endW && !r.rowY && !r.bar && !r.bareEnds && r.changedFlips <= 1 && (reflows || (!r.rowH && !r.nextY && r.shifts.length === 0)), JSON.stringify(r));
		}
		await t.check('no row ever shows Changed twice', () => run(t, () => [...document.querySelectorAll('#pm-settings-root .setting-label')].every((l) => l.querySelectorAll('.o55-changed:not(.o55-needed)').length <= 1)));

		/* review A-r3 R3-2, R3-3 and tool note T2: every switch on Models and on General (App & Input, Notifications &
		   Sounds), turned on and back off, in Basic Dark, Retro Light and NieR Dark, at 1920, 1024 and 860. Nothing may
		   move but the switch: not its row's height, not the rows below, not the end word, not the header. A switch whose
		   job is to change the page is listed in SHAKE_ALLOW with what it may move and why; a row the base page redraws
		   is judged until the redraw, and the redraw is checked on bare PMConcept7 below */
		const redrawn = new Set();
		for (const lk of looks(t)) {
			await reset(t); await run(t, HELPERS);
			await look(t, lk);
			for (const [wname, w] of String(t.args.shakeWidths || '1920,1024,860').split(',').map((x) => [x, +x])) {
				await t.viewport(w, w >= 1920 ? 1080 : 900); await settle(t, 400);
				const seen = new Set();
				for (const pg of SHAKE_PAGES) {
					const ids = (await run(t, SWITCHES, pg)).filter((id) => !seen.has(id));
					ids.forEach((id) => seen.add(id));
					for (const id of ids) {
						for (const dir of ['on', 'off']) {
							const r = await run(t, TOGGLE, [`[id="${id}"] .toggle`, { pre: 400, post: 1300 }]);
							const allow = SHAKE_ALLOW[id.replace(/^setting-/, '')];
							if (r.rerenderAt != null) redrawn.add(id);
							const bad = shakeBad(r, allow);
							await t.check(`${lk} · ${wname} · ${pg[0]} · ${r.label || id} ${dir}: nothing moves but the switch${allow ? ` (${allow[1]})` : ''}${r.rerenderAt != null ? `, until the base page redraws the section at ${r.rerenderAt} ms` : ''}`, !r.missing && !bad.length, (bad.join('; ') || '') + ' ' + JSON.stringify(r).slice(0, 600));
						}
					}
				}
				await run(t, () => window.PSX.hideNote());
			}
		}
		await t.viewport(1920, 1080);
		// the rows the base page redraws when switched: the same click redraws them on bare PMConcept7 too (stream F's)
		if (redrawn.size) {
			const bareUrl = fileUrl(t.args.bare || new URL('../../../../PMConcept7.html', import.meta.url).pathname);
			await t.goto(`${bareUrl}${bareUrl.includes('?') ? '&' : '?'}o55=off&cb=${Date.now()}`);
			await t.until('bare PMConcept7 is ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM12_KIMI, null, { timeout: 60000 });
			await run(t, HELPERS); await settle(t, 1200);
			for (const pg of SHAKE_PAGES) {
				const ids = (await run(t, SWITCHES, pg)).filter((id) => redrawn.has(id));
				for (const id of ids) {
					const b = await run(t, TOGGLE, `[id="${id}"] .toggle`);
					await run(t, TOGGLE, `[id="${id}"] .toggle`);
					await t.check(`${b.label || id}: the section redraw after its switch happens on bare PMConcept7 too (at ${b.rerenderAt} ms): the base page’s own, handed to stream F`, !b.missing && b.rerenderAt != null, JSON.stringify(b).slice(0, 400));
					redrawn.delete(id);
				}
			}
			await t.check('every row the layer saw redrawn was found on bare PMConcept7', redrawn.size === 0, [...redrawn].join(', '));
			await t.app.open();
			await t.until('the layer is booted again', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
			await run(t, HELPERS); await settle(t, 800);
		}
	});

	/* ------------------------------------------------------------------ #4 on Services: an account's own switch */
	if (want(t, 'acct')) await t.step('#4 on Services: an account switch, with the layer and on bare PMConcept7', async () => {
		/* review A-r1 finding 4 and tool note B: an account's own switch on Services (Jared's screen 03). PMConcept7
		   redraws the whole Settings page after it, with a fade and a small drop; that is the base page's own (stream F).
		   The layer must add nothing before that redraw, and the redraw must happen on bare PMConcept7 too. */
		const ACCT = async () => {
			const K = window.PM12_KIMI, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			if (window.PM_PAGES && window.PM_PAGES.current !== 'settings') { window.PM_PAGES.go('settings'); await wait(1500); }
			K.navigate('ai', 'providers'); await wait(500);
			K.dispatchAction('pm51-tab', { manager: 'providers', tab: 'services' }); await wait(900);
			document.querySelectorAll('[data-psx-probe]').forEach((n) => n.removeAttribute('data-psx-probe'));
			const row = [...document.querySelectorAll('#pm-settings-root .setting-row')].find((r) => r.getClientRects().length && /^Use this (service|account)/.test(((r.querySelector('.setting-label') || {}).textContent || '').trim()) && r.querySelector('.toggle'));
			if (!row) return false;
			row.setAttribute('data-psx-probe', 'acct');
			return ((row.querySelector('.setting-label') || {}).textContent || '').trim();
		};
		for (const [wname, w] of [['1920', 1920], ['860', 860]]) {
			await t.viewport(w, w >= 1920 ? 1080 : 900);
			await reset(t); await run(t, HELPERS);
			const which = await run(t, ACCT);
			const lay = which ? await run(t, TOGGLE, '[data-psx-probe="acct"] .toggle') : { missing: true };
			await t.check(`${wname} · Services · ${which || 'an account switch'}, with the layer: until the base page redraws the page, the switch and the end word stay put, no “?” shows, Changed changes at most once`, !lay.missing && !lay.toggleX && !lay.endX && !lay.endW && !lay.bareEnds && lay.changedFlips <= 1, JSON.stringify(lay));
			// the same click on bare PMConcept7
			const bareUrl = fileUrl(t.args.bare || new URL('../../../../PMConcept7.html', import.meta.url).pathname);
			await t.goto(`${bareUrl}${bareUrl.includes('?') ? '&' : '?'}o55=off&cb=${Date.now()}`);
			await t.until('bare PMConcept7 is ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM12_KIMI, null, { timeout: 60000 });
			await run(t, HELPERS); await settle(t, 1200);
			const whichBare = await run(t, ACCT);
			const bare = whichBare ? await run(t, TOGGLE, '[data-psx-probe="acct"] .toggle') : { missing: true };
			// the row and the rows under it may move before the redraw only as they do on bare PMConcept7 (its own fade and drop)
			await t.check(`${wname} · Services · account switch: the row moves before the redraw only if it does on bare PMConcept7 too`, !lay.rowY || !!bare.rowY, JSON.stringify({ layer: lay.rowYs, bare: bare.rowYs, layerRedraw: lay.rerenderAt, bareRedraw: bare.rerenderAt }));
			await t.check(`${wname} · Services · account switch: ${lay.rerenderAt != null ? `the whole-page redraw (at ${lay.rerenderAt} ms with the layer) happens on bare PMConcept7 too (at ${bare.rerenderAt} ms): the base page’s own, handed to stream F` : 'no whole-page redraw with the layer'}`, lay.rerenderAt == null || (!bare.missing && bare.rerenderAt != null), JSON.stringify({ layer: lay, bare }));
			await t.app.open();
			await t.until('the layer is booted again', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
			await run(t, HELPERS); await settle(t, 800);
		}
		await t.viewport(1920, 1080);
	});

	/* ------------------------------------------------------------------ #11 the header */
	if (want(t, 'head')) await t.step('#11: one calm header that never moves', async () => {
		const VIEWS = [
			['own', { cmd: 'reset' }],
			['harbor', { project: 'harbor', on: null, device: 'here' }],
			['no project', { project: 'none', on: null, device: 'here' }],
			['tastebook on Home NAS', { project: 'tastebook', on: 'homenas', device: 'here' }],
			['iPhone screen', { project: 'tastebook', on: null, device: 'iphone' }],
			['harbor on Studio Mac with iPhone', { project: 'harbor', on: 'studio', device: 'iphone' }],
			// review A-r2 N2: the worst case, a long project on a third computer, used from a device with a long name
			['lighting-rig on Home NAS from Sam’s iPad', { strip: { cmd: 'ctx', device: 'ipad', project: 'lighting-rig', on: 'homenas' } }]
		];
		for (const lk of looks(t)) {
			for (const [wname, w] of WIDTHS) {
				await t.viewport(w, w >= 1920 ? 1080 : 900);
				await reset(t);
				// a reset brings back the demo's opening look, so the look is set after it
				await look(t, lk);
				await page(t, 'models');
				if (wname === '1920' || wname === '860') await pic(t, `head-own-${lk}-${wname}`, `The header in your own view, ${lk}, ${wname}`, '#pm-settings-root .document-toolbar');
				const seen = [];
				for (const [name, ctx] of VIEWS) {
					if (ctx.cmd) { await reset(t); await look(t, lk); await page(t, 'models'); } else if (ctx.strip) { await run(t, async (m) => { await window.PSX.command(m); }, ctx.strip); await settle(t, 700); } else { await run(t, (c) => window.PSX.setCtx(c), ctx); await settle(t, 600); }
					// a look's own font may still be arriving: measure once it has, two frames later
					await run(t, async () => { if (document.fonts) await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
					const h = await run(t, HEAD);
					seen.push([name, h]);
					const viewing = /Home NAS|iPhone|Studio Mac/.test(name);
					await t.check(`${lk} · ${wname} · ${name}: the project is named once`, h.projCount === 1, h.text);
					await t.check(`${lk} · ${wname} · ${name}: viewing is ${viewing ? 'shown, with Stop viewing' : 'not shown'}`, (h.viewing === '1') === viewing && h.stop === viewing, JSON.stringify([h.viewing, h.stop, h.text]));
					await t.check(`${lk} · ${wname} · ${name}: no “my view”, no second project button, no rail project line`, !h.myView && !h.pill && !h.rail, JSON.stringify(h));
					const c0 = ctx.strip || ctx;
					const names = [c0.project && c0.project !== 'none' ? c0.project : name === 'no project' ? 'No project' : 'tastebook', c0.on === 'homenas' ? 'Home NAS' : c0.on === 'studio' ? 'Studio Mac' : 'This computer'].concat(c0.device === 'iphone' ? ['iPhone'] : c0.device === 'ipad' ? ['Sam’s iPad'] : []);
					await t.check(`${lk} · ${wname} · ${name}: every name shows whole, nothing cut (wording ${h.fit})`, !h.ctxOverflow && names.every((n) => h.ctxText.includes(n)), JSON.stringify([h.ctxText, names, h.ctxOverflow]));
					if (name.startsWith('harbor on Studio Mac') && (wname === '1920' || wname === '860')) await pic(t, `head-viewing-${lk}-${wname}`, `Viewing harbor on Studio Mac with iPhone's screen, ${lk}, ${wname}: same box, framed, Stop viewing`, '#pm-settings-root .document-toolbar');
					if (ctx.strip && (wname === '860' || wname === '1280')) await pic(t, `head-worst-${lk}-${wname}`, `lighting-rig on Home NAS, used from Sam’s iPad, ${lk}, ${wname}: every name whole`, '#pm-settings-root .document-toolbar');
				}
				const base = seen[0][1];
				for (const [name, h] of seen.slice(1)) {
					// Sam's iPad is a Member's device: its notice line sits under the header (a change of device, not of view), so
					// for that view the header row and Change are compared, not the toolbar under them
					const actorView = /Sam’s iPad/.test(name);
					await t.equal(`${lk} · ${wname} · ${name}: the header ${actorView ? 'row' : 'box'} is where it was`, JSON.stringify(actorView ? [h.main] : [h.bar, h.main]), JSON.stringify(actorView ? [base.main] : [base.bar, base.main]));
					await t.equal(`${lk} · ${wname} · ${name}: Change is where it was`, JSON.stringify(h.change), JSON.stringify(base.change));
					if (!actorView) await t.equal(`${lk} · ${wname} · ${name}: the page under it is where it was`, JSON.stringify(h.first && h.first.slice(1, 2)), JSON.stringify(base.first && base.first.slice(1, 2)));
				}
				await run(t, async () => { await window.PSX.command({ cmd: 'ctx', device: 'here' }); });
			}
		}
		// Stop viewing goes back, and the keyboard stays on the header
		await t.viewport(1920, 1080);
		await look(t, 'basic-dark');
		await reset(t);
		await run(t, () => window.PSX.setCtx({ on: 'homenas' })); await settle(t, 500);
		await t.root.locator('#pm-settings-root [data-psx-head="mine"]').click();
		await settle(t, 600);
		const back = await run(t, HEAD);
		await t.check('Stop viewing goes back to tastebook on This computer', back.viewing === '0' && /tastebook on This computer/.test(back.text), back.text);
		await t.check('focus lands on Change after Stop viewing', () => run(t, () => (document.activeElement || {}).getAttribute && document.activeElement.getAttribute('data-psx-head') === 'view'));
		// the Change menu: a project, another computer, another device's screen, everything at once
		await t.root.locator('#pm-settings-root [data-psx-head="view"]').click();
		await settle(t, 400);
		const menu = await run(t, () => document.body.innerText);
		await t.check('Change offers a project, another computer and another device’s screen', /Look at another computer/i.test(menu) && /Look at another device’s screen/i.test(menu) && /All the differences/i.test(menu), 'menu not found');
		await t.page.keyboard.press('Escape');
		// YOLO and the settings home away: still one header row; the notice goes under it
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'yolo' }); }); await settle(t, 500);
		const y = await run(t, HEAD);
		await t.equal('YOLO keeps the header row in place', JSON.stringify([y.main, y.change]), JSON.stringify([back.main, back.change]));
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); await window.PSX.command({ cmd: 'ctx', homenas: 'down' }); }); await settle(t, 500);
		const away = await run(t, HEAD);
		await t.check('with Home NAS away the header row stays and the notice is a line under it', JSON.stringify(away.main) === JSON.stringify(back.main) && /Can’t reach Home NAS, which keeps your settings/.test(away.text), away.text);
		await reset(t);
	});

	/* ------------------------------------------------------------------ #8 Where it applies is the same everywhere */
	if (want(t, 'where')) await t.step('#8: every Where it applies has the same parts, Devices only on screen rows', async () => {
		await reset(t);
		const all = await run(t, () => {
			const P = window.PSX, out = { n: 0, bad: [], screen: 0, devices: [] };
			for (const id of Object.keys(P.DEF)) {
				const def = P.DEF[id]; let sec;
				try { sec = P.panel.whereBlock(id, P.resolve(id, P.S.ctx), { context: 'check' }); } catch (e) { out.bad.push(id + ': ' + e.message); continue; }
				out.n++;
				const slots = [...sec.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot'));
				const wantMid = def.screen ? 'device' : 'computer';
				if (JSON.stringify(slots.slice(0, 3)) !== JSON.stringify(['everywhere', wantMid, 'project'])) out.bad.push(`${id}: parts ${slots.join(', ')}`);
				const mid = sec.querySelector(':scope > [data-psx-slot="device"]');
				if (def.screen) { out.screen++; out.devices.push(P.label(id)); if (!mid || !mid.querySelector('.psx-wwhy') || !/so it can differ per device\./.test(mid.querySelector('.psx-wwhy').textContent)) out.bad.push(`${id}: Devices without its plain line`); }
				if (!def.screen && /Set for a device|Devices/.test(sec.textContent)) out.bad.push(`${id}: a device choice on a row that isn't about a screen`);
				sec.querySelectorAll(':scope > [data-psx-slot]').forEach((g) => { if (!g.querySelector('.psx-wline, .psx-wnot, .psx-wrest, .psx-add')) out.bad.push(`${id}: part ${g.getAttribute('data-psx-slot')} is empty`); });
			}
			return out;
		});
		await t.check(`all ${all.n} rows: Everywhere, then ${'Computers or Devices'}, then Projects`, all.n > 600 && all.bad.length === 0, all.bad.slice(0, 6).join(' | '));
		/* inventory alignment: "Start custom themes from" is a value, and Plans' inventory gives it Everywhere and Device
		   (round A-r1 had made it same-everywhere with the libraries); the libraries themselves are owner-held actions */
		await t.check(`${all.screen} screen rows list Devices with one plain line, and libraries are not among them`, all.screen > 10 && !all.devices.some((l) => /Your own themes|Sound library|Add a sound/.test(l)), all.devices.join(', '));
		const left = await run(t, () => {
			const P = window.PSX, off = P.offLadder;
			return Object.keys(window.PM51.placement.byId).filter((id) => {
				const s = window.PM51.setting(id); if (!s || /^(resource|action)$/.test(String(s.control || ''))) return false;
				if (P.DEF[id] || off.look.test(id) || off.credential.test(id) || off.thing.includes(id) || (off.library || []).includes(id)) return false;
				const sc = ((P.REF || {})[id] || {}).scope || [];
				return !(sc.length && sc.some((x) => ['account', 'provider', 'persona'].includes(x)) && !sc.includes('global'));
			});
		});
		await t.check('every Settings row is on the ladder, or is a look detail, a key, or one thing’s own', left.length === 0, left.slice(0, 12).join(', '));
		await t.check('the four rows Jared named are screen rows', () => run(t, () => ['general.visual.font-size', 'general.visual.theme', 'general.interaction.sound-effects', 'general.visual.reduce-animations'].every((id) => window.PSX.DEF[id].screen)));
		await t.check('the row menu offers “Set for this screen” only on screen rows', () => run(t, () => {
			const P = window.PSX; let ok = true;
			for (const id of ['ai.models.default-model', 'general.interaction.eli5-default', 'safety.rules.permission-preset']) { const d = P.DEF[id]; if ((d.may || []).includes('device')) ok = false; }
			return ok && (P.DEF['general.visual.font-size'].may || []).includes('device');
		}));
		// real panels, one of each kind, and an account's own row
		const IDS = ['ai.models.default-model', 'general.visual.font-size', 'general.visual.theme', 'system.advanced.cli-path-claude', 'memory.assembly.project-rules', 'general.interaction.scope-labels', 'system.advanced.auto-update', 'general.interaction.submit-key', 'branching.subagents.max-parallel', 'safety.rules.permission-preset', 'general.visual.theme-mode', 'general.visual.wallpaper', 'ai.accounts.github-token'];
		for (const id of IDS) {
			const p = await run(t, async (i) => {
				window.PM51.revealSetting(i, { detail: true });
				for (let k = 0; k < 30; k++) { await new Promise((r) => setTimeout(r, 150)); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === i && document.querySelector('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-slot]')) break; }
				const insp = document.querySelector('#pm-settings-root .detail-inspector');
				const heads = [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length;
				const w = insp.querySelector('[data-psx-block="where"]');
				return { heads, slots: w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [], code: (insp.querySelector('.o55-insp-tech code') || {}).textContent };
			}, id);
			await t.check(`panel ${id}: one Where it applies, in three parts`, p.code === id && p.heads === 1 && p.slots.length >= 3, JSON.stringify(p));
			if (['general.visual.font-size', 'system.advanced.cli-path-claude', 'general.interaction.scope-labels', 'ai.models.default-model'].includes(id)) await pic(t, `where-${id}`, `Where it applies for ${id}: the same three parts`, '#pm-settings-root .detail-inspector [data-psx-block="where"]');
		}
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		// an account's own row: the base page's per-account list stays, the three parts follow it
		await page(t, 'services');
		const per = await run(t, async () => {
			const b = [...document.querySelectorAll('#pm-settings-root .o55-about')].find((x) => /Each account/.test(x.textContent) && x.getClientRects().length); if (!b) return null;
			b.click(); await new Promise((r) => setTimeout(r, 1100));
			const insp = document.querySelector('#pm-settings-root .detail-inspector');
			const heads = [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length;
			const w = insp.querySelector('[data-psx-block="where"]');
			return { heads, per: !!insp.querySelector('.o55-insp-now.is-per'), slots: w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [], text: w ? w.innerText : '' };
		});
		await t.check('an account’s own row: one Where it applies, in the same three parts', !!per && per.per && per.heads === 1 && JSON.stringify(per.slots) === JSON.stringify(['everywhere', 'computer', 'project']), JSON.stringify(per));
		if (per) await pic(t, 'where-per-account', 'An account’s own row (Each account): the base page’s list, then the same three parts', '#pm-settings-root .detail-inspector');
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		// review A-r1 finding 5: a library (a button, not a value) has the three parts with reasons only
		for (const id of ['general.visual.manage-custom-themes', 'general.interaction.sound-catalog', 'general.interaction.sound-management']) {
			const lib = await run(t, async (i) => {
				window.PM51.revealSetting(i, { detail: true });
				for (let k = 0; k < 30; k++) { await new Promise((r) => setTimeout(r, 150)); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === i && document.querySelector('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-slot]')) break; }
				const insp = document.querySelector('#pm-settings-root .detail-inspector'), w = insp && insp.querySelector('[data-psx-block="where"]');
				const code = (insp.querySelector('.o55-insp-tech code') || {}).textContent;
				return { code, slots: w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [], lines: w ? w.querySelectorAll('.psx-wline, .psx-wval').length : -1, change: w ? [...w.querySelectorAll('button')].map((x) => x.textContent.trim()) : [], now: ((insp.querySelector('.o55-insp-now') || {}).innerText || '').replace(/\s+/g, ' ').trim(), heads: [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length };
			}, id);
			await t.check(`library ${id}: three parts with reasons only, no value line, no Change, Now says it is your library`, lib.code === id && lib.heads === 1 && JSON.stringify(lib.slots) === JSON.stringify(['everywhere', 'computer', 'project']) && lib.lines === 0 && lib.change.length === 0 && /^Your library Kept with your settings$/.test(lib.now), JSON.stringify(lib));
			if (id === 'general.visual.manage-custom-themes') await pic(t, 'where-library', 'Your own themes: Your library, kept with your settings; the three parts with their reasons, no value and no Change', '#pm-settings-root .detail-inspector');
		}
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		/* inventory alignment (2026-11-13): Plans' inventory layering is the per-row authority (SSYS-059), and the page
		   reads the tree's own Plans/settings_inventory.json. Every row Settings draws is checked against it: its offered
		   places are the inventory's may_differ_by (none for an owner-held row), its reasons for the places it doesn't offer
		   are the inventory's not_offered, and its combine and Computer key are the inventory's. An owner-held row (home:
		   thing) is off the ladder, takes no write at an ordinary level, and its panel names its owner (an action says it
		   isn't a setting). The look details the engine paints keep their Theme view, with the inventory's places. Rows the
		   inventory doesn't list are named, not checked. 556c7042e5 (and e81d95d829, the same code on main) failed this */
		const INVA = inventory(t);
		const align = await run(t, (inv) => {
			const P = window.PSX, byId = (window.PM51.placement || {}).byId || {}, L = ['everywhere', 'computer', 'device', 'project'], off = P.offLadder || {};
			const out = { source: P.layering ? P.layering.source : null, drawn: 0, checked: 0, owner: 0, ladder: 0, look: [], notListed: [], perItem: [], actions: 0, bad: [] };
			if (!P.layering || !P.ownerHeld || !(P.panel && P.panel.ownerFacts)) { out.bad.push('the page has no inventory layering, owner rule or owner view'); }
			const key = (l) => (l === 'project' ? 'tastebook' : l === 'everywhere' ? null : 'here');
			for (const id of Object.keys(byId)) {
				const s = window.PM51.setting(id); if (!s) continue;
				out.drawn++;
				const I = inv && inv[id]; if (!I) { out.notListed.push(id); continue; }
				out.checked++;
				const want = I.home === 'thing' ? [] : L.filter((l) => I.may.includes(l));
				if (off.look && off.look.test(id)) { out.look.push(id); continue; }
				const d = P.DEF[id];
				if (I.home === 'thing') {
					out.owner++;
					if (d) { out.bad.push(`${id}: owner-held in the inventory, on the ladder here (${L.filter((l) => P.offered(d)[l]).join('+')})`); continue; }
					if (!P.ownerHeld || !P.ownerHeld(id)) { out.bad.push(`${id}: owner-held in the inventory, not held by its owner here`); continue; }
					const takes = L.filter((l) => !P.guard.why({ level: l, key: key(l), id, value: 'x' }));
					if (takes.length) out.bad.push(`${id}: owner-held, yet ${takes.join(', ')} takes a write`);
					const f = P.panel.ownerFacts(id);
					if (!f || !f.sentence || !f.everywhere || !f.computer || !f.project) out.bad.push(`${id}: no owner view`);
					/* Astra max N1: an action names its owner too (the review: registry credentials, Settings search and History
					   compare said only "An action, not a setting"), by name from the panel's own table, never the generic "its owner" */
					else if (f.kind === 'action' ? !(/not a setting/.test(f.sentence) && !!f.owner && f.sentence.includes(f.owner) && !/^its owner/.test(f.owner) && !!(P.panel.ACTION_OWNERS || {})[id]) : !(f.owner && f.sentence.includes(f.owner))) out.bad.push(`${id}: its panel doesn’t name its owner (${f.sentence})`);
					else if (I.type === 'action' && f.kind !== 'action') out.bad.push(`${id}: an action in the inventory, not shown as one`);
					if (f && f.kind === 'action') out.actions++;
					else if (I.may.includes('project') !== /^A project can choose its own/.test(f.project)) out.bad.push(`${id}: its project line doesn’t follow the inventory (${f.project})`);
					continue;
				}
				out.ladder++;
				if (!d) { out.bad.push(`${id}: on the ladder in the inventory (${want.join('+')}), off it here`); continue; }
				const o = P.offered(d), got = L.filter((l) => o[l]);
				if (got.join('+') !== want.join('+')) { out.bad.push(`${id}: offers ${got.join('+')} (inventory ${want.join('+')})`); continue; }
				const r = P.reasons(d);
				L.forEach((l) => { if (!o[l] && I.notOffered[l] && r[l] != null && r[l] !== I.notOffered[l]) out.bad.push(`${id}: ${l} isn’t offered because ${r[l]} (inventory ${I.notOffered[l]})`); });
				/* Astra max A1: the inventory's combine, exactly (7150f6c5bc's check read per_item as most_specific, and so passed a
				   resolver that dropped it). A per_item row also needs its owner's own rule for its items (PSX.PER_ITEM) */
				if (I.combine === 'per_item') { out.perItem.push(id); if (!(P.PER_ITEM && P.PER_ITEM[id])) out.bad.push(`${id}: per_item, with no owner rule for its items`); }
				if ((d.combine || 'most_specific') !== I.combine) out.bad.push(`${id}: combines ${d.combine || 'most_specific'} (inventory ${I.combine})`);
				// found with A1 and A4: a careful order is made of the values the row holds (FileSafe's on and off are true and false)
				if (I.combine === 'more_careful') { const c = d.careful || [], dv = P.DEFAULTS[id], opts = P.optionsFor(id); if (c.length !== (I.careful || []).length || c.some((v) => (typeof dv === 'boolean' ? typeof v !== 'boolean' : opts && opts.length ? !opts.some((o) => P.same(o, v)) : false))) out.bad.push(`${id}: careful order ${JSON.stringify(c)} isn’t made of its values (inventory ${JSON.stringify(I.careful)})`); }
				if (!!d.host !== (I.key === 'execution_host')) out.bad.push(`${id}: its Computer key is ${d.host ? 'the execution host' : 'the server'} (inventory ${I.key})`);
			}
			return out;
		}, INVA);
		await t.check(`inventory alignment: the page reads this tree’s Plans/settings_inventory.json (${align.source ? `${align.source.rows} rows, schema ${align.source.schema_version}` : 'none'})`, !!INVA && !!align.source && align.source.sha256 === INVENTORY_SHA, JSON.stringify({ page: align.source, tree: INVENTORY_SHA }));
		await t.check(`inventory alignment: all ${align.checked} drawn rows the inventory lists follow it, its combine exactly (${align.ladder} on the ladder, ${align.perItem.length} of them per_item; ${align.owner} owner-held, ${align.actions} of them actions naming their owner; ${align.look.length} engine-painted look details keep their Theme view; ${align.notListed.length} not listed: ${align.notListed.join(', ')})`, !!INVA && align.checked > 800 && align.bad.length === 0 && align.perItem.length === 3 && align.actions > 60, `${align.bad.length} mismatched: ` + align.bad.slice(0, 25).join(' | '));
		await astraWhere(t);
		// real panels, one owner-held row of each kind: an action, a field kept by its owner, a key, the Rules file, a row a project can choose inside its owner
		for (const kind of ['action', 'owned', 'secret', 'projection', 'project']) {
			const ids = await run(t, ([k, inv]) => {
				const P = window.PSX, byId = (window.PM51.placement || {}).byId || {}, cred = (P.offLadder || {}).credential;
				if (!P.panel || !P.panel.ownerFacts) return [];
				return Object.keys(byId).filter((id) => inv[id] && inv[id].home === 'thing' && window.PM51.setting(id) && !((P.offLadder || {}).library || []).includes(id)).filter((id) => {
					const f = P.panel.ownerFacts(id), I = inv[id], sec = !!(cred && cred.test(id));
					return k === 'action' ? f.kind === 'action' : k === 'owned' ? f.kind === 'owned' && !sec && !I.may.includes('project') : k === 'secret' ? f.kind === 'owned' && sec : k === 'projection' ? f.kind === 'projection' : f.kind === 'owned' && I.may.includes('project');
				}).slice(0, 6);
			}, [kind, INVA || {}]);
			let opened = null;
			for (const id of ids) {
				const p = await run(t, async (i) => {
					window.PM51.revealSetting(i, { detail: true });
					for (let k = 0; k < 24; k++) { await new Promise((r) => setTimeout(r, 150)); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === i && document.querySelector('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-slot]')) break; }
					const insp = document.querySelector('#pm-settings-root .detail-inspector'), w = insp && insp.querySelector('[data-psx-block="where"]');
					return { id: i, code: insp && (insp.querySelector('.o55-insp-tech code') || {}).textContent, owner: w && w.getAttribute('data-psx-owner'), name: w && w.getAttribute('data-psx-owner-name'), slots: w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [], where: w ? w.innerText.replace(/\s+/g, ' ').trim() : '', heads: insp ? [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length : 0, buttons: insp ? [...insp.querySelectorAll('button')].filter((b) => b.getClientRects().length && !b.closest('.pm51-panel-head') && /^(Change|Set for|Same as everywhere|\+)/.test(b.textContent.trim())).map((b) => b.textContent.trim()) : [], choices: insp ? [...insp.querySelectorAll('.o55-insp-choice, .o55-pick-trigger, .o55-pick-inline')].filter((x) => x.getClientRects().length).length : -1 };
				}, id);
				if (p.code === id && p.slots.length) { opened = p; break; }
			}
			await t.check(`inventory alignment: a real panel for an owner-held ${kind} row (${opened ? opened.id : `none of ${ids.length} opened: ${ids.join(', ')}`}) names its owner in the same three parts, with no Change`,
				!!opened && opened.heads === 1 && JSON.stringify(opened.slots) === JSON.stringify(['everywhere', 'computer', 'project']) && !!opened.owner && (kind !== 'action' || /not a setting/.test(opened.where)) && !!opened.name && opened.where.toLowerCase().includes(opened.name.toLowerCase()) && !opened.buttons.length && (kind === 'secret' || opened.choices === 0) && (kind !== 'project' || /A project can choose its own/.test(opened.where)) && (kind !== 'secret' || /stays on the computer where you entered it/.test(opened.where)),
				JSON.stringify(opened || ids));
			if (opened) await pic(t, `owner-${kind}`, `Inventory alignment: ${opened.id}, owner-held (${kind}): its owner in the same three parts, no Change`, '#pm-settings-root .detail-inspector');
		}
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		/* review S1 (Sol-high recheck of the Sol max fixes): every row whose value is an absolute path follows Plans'
		   inventory layering, the per-row authority (SSYS-059: owner-held rows are classified before host paths). The
		   Rules file is home: thing there, with every ordinary level set_inside_a_thing, and Permissions_System §9 / PS-144
		   make ~/.config/puppet-master/permissions.toml a read-only projection of the Everywhere rules. So it stays off
		   the ladder, no ordinary level takes a write, and its panel says where the rules are kept and that the file is a
		   read-only copy, with the same three parts and no Change. 620fd69052 made it an ordinary Computer value */
		const INV = inventory(t);
		const ABS_INV = INV ? Object.keys(INV).filter((i) => typeof INV[i].value === 'string' && /^(\/|~[\w.-]*([\\/]|$)|[A-Za-z]:[\\/]|\\\\|file:)/i.test(INV[i].value.trim())) : [];
		await t.check(`S1: Plans’ inventory is read (${INV ? Object.keys(INV).length : 0} rows; ${ABS_INV.length} with an absolute-path value: ${ABS_INV.join(', ')})`, !!INV && ABS_INV.length > 0, String(t.args.inventory || 'Plans/settings_inventory.json'));
		for (const i of ABS_INV) {
			const s1 = await run(t, async ([id, home]) => {
				const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = { id, home };
				out.def = P.DEF[id] ? { home: P.DEF[id].home || null, may: P.DEF[id].may || null, reason: P.DEF[id].reason || null } : null;
				out.ownerHeld = ((P.offLadder || {}).thing || []).includes(id);
				out.levels = Object.fromEntries(['everywhere', 'computer', 'device', 'project'].map((l) => [l, !P.guard.why({ level: l, key: l === 'project' ? 'tastebook' : l === 'everywhere' ? null : 'here', id, value: '/tmp/elsewhere.toml' })]));
				window.PM51.revealSetting(id, { detail: true });
				for (let k = 0; k < 30; k++) { await wait(150); const c = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-tech code'); if (c && c.textContent.trim() === id && document.querySelector('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-slot]')) break; }
				const insp = document.querySelector('#pm-settings-root .detail-inspector'), w = insp && insp.querySelector('[data-psx-block="where"]');
				out.code = insp && (insp.querySelector('.o55-insp-tech code') || {}).textContent;
				out.heads = insp ? [...insp.querySelectorAll('.o55-insp-block h4')].filter((h) => h.offsetParent && /^Where it applies$/.test(h.textContent.trim())).length : 0;
				out.slots = w ? [...w.querySelectorAll(':scope > [data-psx-slot]')].map((g) => g.getAttribute('data-psx-slot')) : [];
				out.where = w ? w.innerText.replace(/\s+/g, ' ').trim() : '';
				out.now = insp ? ((insp.querySelector('.o55-insp-now') || {}).innerText || '').replace(/\s+/g, ' ').trim() : '';
				// every button the panel shows but Close: an owner-held row offers no Change, no Set for, no Same as everywhere
				out.buttons = insp ? [...insp.querySelectorAll('button')].filter((b) => b.getClientRects().length && !b.closest('.pm51-panel-head') && !/^Close$/.test(b.textContent.trim())).map((b) => b.textContent.trim()) : [];
				return out;
			}, [i, INV[i].home]);
			if (INV[i].home === 'thing') {
				await t.check(`S1: ${i} is ${INV[i].home} in the inventory: off the ladder, no ordinary level takes a write, and its panel says where the rules are kept and that the file is a read-only copy, in three parts with no Change`,
					!s1.def && s1.ownerHeld && Object.values(s1.levels).every((x) => !x) && s1.code === i && s1.heads === 1 && JSON.stringify(s1.slots) === JSON.stringify(['everywhere', 'computer', 'project']) && /read-only copy/.test(s1.where) && /kept by Permissions/i.test(s1.where) && !/Each computer has its own/.test(s1.where + ' ' + s1.now) && /Kept by Permissions/.test(s1.now) && !s1.buttons.some((b) => /^(Change|Set for|Same as everywhere|\+)/.test(b)),
					JSON.stringify(s1));
				await pic(t, 'where-rules-file', `S1: ${i}, kept by Permissions: the three parts say where the rules are kept and that the file is a read-only copy; no Change`, '#pm-settings-root .detail-inspector');
			} else await t.check(`S1: ${i} is ${INV[i].home} in the inventory, and so it is here`, !!s1.def && (s1.def.home || 'everywhere') === INV[i].home, JSON.stringify(s1));
		}
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
		// the control: an ordinary row (not owner-held) whose value is an absolute path is still each computer's own
		const ctl = await run(t, () => {
			const f = window.PSX.feed && window.PSX.feed.classify; if (!f) return { exposed: false };
			const r = f({ id: 'psx.check.ordinary-file', scope: ['global', 'project'] }, { id: 'psx.check.ordinary-file', control: 'text', value: '/opt/tools/settings.toml' });
			const own = f({ id: 'safety.rules.storage-format', scope: ['global', 'project'] }, { id: 'safety.rules.storage-format', control: 'text', value: '~/.config/puppet-master/permissions.toml' });
			return { exposed: true, ordinary: r, owner: own };
		});
		await t.check('S1 control: an ordinary row whose value is an absolute path still goes to each computer (names_a_path); the owner-held one is never classified onto the ladder', ctl.exposed && !!ctl.ordinary && ctl.ordinary.home === 'computer' && ctl.ordinary.reason === 'names_a_path' && ctl.owner === null, JSON.stringify(ctl));
		// the base page's own scope words where the layer has its block: MCP servers
		const mcp = await run(t, async () => {
			const p = window.PM51.placement.byId['system.mcp.server-scope']; window.PM12_KIMI.navigate(p.domain, p.workspace); await new Promise((r) => setTimeout(r, 1000));
			const items = [...document.querySelectorAll('#pm-settings-root .pm51-item[data-action="pm51-mcp-open"]')];
			const metaWords = items.filter((i) => [...i.querySelectorAll('.pm51-item-meta:not([data-psx-reach])')].some((m) => / · (This project only|Managed by Puppet Master|Outside service)\s*$/.test(m.textContent.trim()))).length;
			const reach = items.filter((i) => i.querySelector('[data-psx-reach]')).length;
			const it = items.find((i) => /GitHub/.test(i.textContent)); if (it) it.click(); await new Promise((r) => setTimeout(r, 1200));
			const aside = document.querySelector('aside.drawer');
			const engineWhere = aside ? [...aside.querySelectorAll('.pm51-kv-row')].filter((r) => /^Where it applies$/.test((r.firstElementChild || {}).textContent || '') && r.getClientRects().length).length : -1;
			const layerWhere = aside ? !!aside.querySelector('[data-psx-mcp]') && /Where it’s available/.test(aside.innerText) : false;
			return { items: items.length, metaWords, reach, engineWhere, layerWhere };
		});
		await t.check('MCP list: the layer’s line says where each server is available, the base page’s scope word is gone', mcp.items > 0 && mcp.reach === mcp.items && mcp.metaWords === 0, JSON.stringify(mcp));
		await t.check('MCP server panel: only the layer’s Where it’s available, the base page’s Where it applies hidden', mcp.engineWhere === 0 && mcp.layerWhere, JSON.stringify(mcp));
		await pic(t, 'where-mcp-drawer', 'GitHub MCP’s panel: How it connects without a second Where it applies; the layer’s Where it’s available', 'aside.drawer');
		await run(t, () => { const b = document.querySelector('#pm-settings-portals [data-action="close-overlay"]'); if (b) b.click(); });
	});

	/* ------------------------------------------------------------------ review A-r4 F2: detail cards
	   Every value in a detail card, in every Settings workspace, manager tab and list item, in the three looks at 1024,
	   860 and 640, is at least as wide as its widest word. A value that isn't is measured again on bare PMConcept7 in the
	   same look and width: it passes only when bare gives it no more room (the base page's own, handed to stream F) */
	if (want(t, 'detail')) await t.step('F2: every value in a detail card is at least as wide as its widest word', async () => {
		await reset(t); await run(t, HELPERS);
		let cards = 0;
		const results = [], layerShell = {}, bareShell = {}, unsettled = [];
		for (const lk of looks(t)) {
			await look(t, lk);
			for (const w of String(t.args.detailWidths || '1024,860,640').split(',').map(Number)) {
				await t.viewport(w, 900); await settle(t, 400);
				const done = new Set();
				for (const ws of WORKSPACES) {
					const tabs = (await run(t, DETAIL_TABS, ws)).filter((x) => !done.has(x));
					if (!layerShell[w]) layerShell[w] = await run(t, SHELL);
					for (const mt of tabs) {
						done.add(mt);
						const r = await run(t, DETAIL, mt);
						r.unsettled.forEach((u) => unsettled.push(`${lk} · ${w} · ${u}`));
						(r.transient || []).forEach((u) => t.log(`a passing list, read again: ${lk} · ${w} · ${u}`));
						if (!r.n) continue;
						cards += r.items || 1;
						results.push({ lk, w, ws, mt, r });
					}
				}
			}
		}
		// the same values on bare PMConcept7, where the layer's value was narrower than its widest word
		const misses = results.filter((x) => x.r.bad.length);
		const bareOf = {};
		if (misses.length) {
			const bareUrl = fileUrl(t.args.bare || new URL('../../../../PMConcept7.html', import.meta.url).pathname);
			await t.goto(`${bareUrl}${bareUrl.includes('?') ? '&' : '?'}o55=off&cb=${Date.now()}`);
			await t.until('bare PMConcept7 is ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM12_KIMI, null, { timeout: 60000 });
			await settle(t, 1200);
			for (const lk of [...new Set(misses.map((x) => x.lk))]) {
				const painted = await run(t, BARE_LOOK, lk);
				for (const x of misses.filter((m) => m.lk === lk)) {
					await t.viewport(x.w, 900); await settle(t, 300);
					await run(t, DETAIL_TABS, x.ws);
					if (!bareShell[x.w]) bareShell[x.w] = await run(t, SHELL);
					// the whole tab on bare: the same value under the same item, and the widest value of the same kind
					const br = await run(t, DETAIL, x.mt);
					for (const b of br.all) {
						bareOf[`${lk}|${x.w}|${x.mt}|${b.item}|${b.txt}`] = painted ? b.w : null;
						const ck = `${lk}|${x.w}|${x.mt}|cls:${b.cls}`;
						if (painted) bareOf[ck] = Math.max(bareOf[ck] || 0, b.w);
					}
				}
			}
			await t.app.open();
			await t.until('the layer is booted again', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
			await run(t, HELPERS); await settle(t, 800);
		}
		for (const { lk, w, mt, r } of results) {
			/* the layer's own when bare PMConcept7 gives the same value more room than the shell's own difference in the
			   width Settings gets. That difference is measured at this width on both pages: the base page hides its
			   left-panel resizer only with data-pmw-home="on" and a folded rail, and its rail state can differ between
			   the two pages, which is outside Settings and outside the layer (up to 4px is taken as the shell's) */
			const allow = layerShell[w] && bareShell[w] ? Math.min(4, Math.max(0, bareShell[w].w - layerShell[w].w)) : 0;
			/* the same value under the same item on bare; where the two pages' demo data differ (a path one shows and the
			   other doesn't), the widest value of the same kind (the same classes) in the same card on bare */
			const exact = (b) => `${lk}|${w}|${mt}|${b.item}|${b.txt}`, byKind = (b) => `${lk}|${w}|${mt}|cls:${b.cls}`;
			const key = (b) => (bareOf[exact(b)] != null ? exact(b) : byKind(b));
			const own = r.bad.filter((b) => { const bw = bareOf[key(b)]; return bw == null || bw > b.w + allow + 0.5; });
			const base = r.bad.filter((b) => !own.includes(b));
			const why = base.map((b) => `excluded, the base page’s own: ${lk} · ${w} · ${b.label}: “${b.txt}” ${b.w}px here, ${bareOf[key(b)]}px on bare PMConcept7 (its widest word ${b.widest}px; the shell’s own difference ${allow}px)`);
			why.forEach((x) => t.log(x));
			await t.check(`${lk} · ${w} · ${mt}: ${r.n} values in ${r.items || 1} detail card${(r.items || 1) === 1 ? '' : 's'} are each as wide as their widest word${base.length ? `, except ${base.length} the base page gives no more room on bare PMConcept7 (stream F)` : ''}`, own.length === 0,
				own.slice(0, 4).map((b) => `${b.label}: “${b.txt}” is ${b.w}px, its widest word ${b.widest}px; bare: ${bareOf[key(b)] == null ? 'not found' : bareOf[key(b)] + 'px'}`).concat(why.slice(0, 6)).join(' | '));
		}
		await t.check('every tab and list item settled before it was measured (no fixed wait)', unsettled.length === 0, unsettled.slice(0, 8).join(' | '));
		t.log(`the shell around Settings, layer vs bare PMConcept7: ${JSON.stringify({ layer: layerShell, bare: bareShell })}`);
		await t.check('detail cards were found and measured', cards > 20, String(cards));
		await t.viewport(1920, 1080);
	});

	/* ------------------------------------------------------------------ guided flows 3.x: Copy settings */
	if (want(t, 'copy')) await t.step('guided flows 3.02-3.07, 3.12, 3.17: Copy settings', async () => {
		await reset(t);
		const c = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			await P.command({ cmd: 'moment', id: 'copy-new' }); await wait(700);
			const sh = () => document.querySelector('.psx-sheet.psx-copy');
			out.label = /Notifications & limits/.test(sh().innerText) && !/Notifications and limits/.test(sh().innerText);
			out.cannot = !!sh().querySelector('[data-outcome="cannot_move"]') && /Can’t be used on Home NAS/.test(sh().innerText) && /It belongs to one device\. It stays this Project’s intended choice, and nothing replaces it\./.test(sh().innerText);
			out.identities = /Only which accounts, in their order: no sign-in, key or token is copied\./.test(sh().innerText);
			out.defaultsOff = !P.copy.st.fixed && !P.copy.st.fromComp && Object.values(P.copy.st.files).every((v) => !v);
			// Keep them fixed follows the kinds you chose and the rows you unticked
			const fixed = sh().querySelector('input[data-act="fixed"]'); fixed.click(); await wait(300);
			const plan1 = P.copy.plan(); const fixedKinds = [...new Set(plan1.rows.filter((x) => x.fixed).map((x) => P.copy.kindOf(x.id)))];
			out.fixedOn = plan1.rows.filter((x) => x.fixed).length;
			const kid = fixedKinds[0]; out.kid = kid;
			const kbox = sh().querySelector(`input[data-act="kind"][data-kind="${kid}"]`); if (kbox && kbox.checked) kbox.click(); else if (kbox) { kbox.click(); await wait(200); sh().querySelector(`input[data-act="kind"][data-kind="${kid}"]`).click(); }
			await wait(300);
			out.kindGone = !P.copy.plan().rows.some((x) => x.fixed && P.copy.kindOf(x.id) === kid);
			// turning Keep them fixed off and on again doesn't bring the deselected kind back
			sh().querySelector('input[data-act="fixed"]').click(); await wait(200); sh().querySelector('input[data-act="fixed"]').click(); await wait(300);
			out.kindStaysGone = !P.copy.plan().rows.some((x) => x.fixed && P.copy.kindOf(x.id) === kid);
			// one fixed row unticked by itself
			const other = fixedKinds.find((k) => k !== kid);
			if (other) {
				const ob = sh().querySelector(`[data-act="openkind"][data-kind="${other}"]`); if (ob && ob.getAttribute('aria-expanded') !== 'true') { ob.click(); await wait(200); }
				const one = sh().querySelector(`input[data-act="onefixed"][data-kind="${other}"]`);
				out.oneId = one && one.dataset.id; if (one) { one.click(); await wait(250); }
				out.oneGone = !!out.oneId && !P.copy.plan().rows.some((x) => x.id === out.oneId);
			}
			P.closeSheets(); await wait(300);
			// the destination is checked again at the moment of the copy: Work Claude expires on Home NAS after the preview
			P.setCtx({ project: 'garden-notes' }); await wait(500);
			P.copy.open({ mode: 'settings', src: 'tastebook' }); await wait(500);
			sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(400);
			out.preview = /garden-notes gets/.test(sh().innerText);
			const before = JSON.stringify(P.W.project['garden-notes']);
			P.W.things.accounts['work-claude'].on.homenas = 'expired';
			sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(500);
			out.reshown = !!sh() && !!sh().querySelector('[data-psx-stale="accounts"]') && /Expired on Home NAS/.test(sh().innerText);
			out.nothingWritten = JSON.stringify(P.W.project['garden-notes']) === before;
			return out;
		});
		await t.check('3.05: the kind reads Notifications & limits', c.label);
		await t.check('3.12: a device-bound account says Can’t be used on Home NAS, and stays the intended choice', c.cannot, JSON.stringify(c));
		await t.check('3.03: account identities only, never a sign-in, key or token', c.identities);
		await t.check('3.06: About its own files, Keep them fixed and Copy what it gets from its computer start off', c.defaultsOff);
		await t.check('3.07: a deselected kind adds no fixed rows', c.fixedOn > 0 && c.kindGone, JSON.stringify(c));
		await t.check('3.07: turning Keep them fixed off and on doesn’t bring it back', c.kindStaysGone, JSON.stringify(c));
		await t.check('3.07: a fixed row unticked by itself stays out', c.oneGone, JSON.stringify(c));
		await t.check('3.14: Copy checks the destination again and shows the preview again when an account changed there', c.preview && c.reshown && c.nothingWritten, JSON.stringify(c));
		await pic(t, 'copy-reshown', 'Copy into garden-notes: Work Claude expired on Home NAS after the preview, so the preview is shown again', '.psx-sheet.psx-copy');
		await run(t, () => window.PSX.closeSheets());
		await reset(t);
		await run(t, () => window.PSX.command({ cmd: 'moment', id: 'copy-new' }));
		await settle(t, 900);
		await pic(t, 'copy-new-homenas', 'New Project › Start like tastebook on Home NAS: Copilot can’t be used there; accounts only, never secrets', '.psx-sheet.psx-copy');
		await run(t, () => window.PSX.closeSheets());

		/* review Sol max F2 (guided flows 3.07), under SSYS-062 as the lead reads it (follow-up, 2026-11-13): "project_only_rows
		   is off by default, as are copied instructions/build files/remotes and Computer-effective freeze". So Keep them fixed
		   alone freezes nothing the source gets from its computer (Helpers at once, Profile in use and FileSafe come from
		   Home NAS for recipe-app); only "Copy what recipe-app gets from Home NAS" brings them. Sol max F2's accepted design,
		   in which Keep them fixed froze FileSafe already, is overturned. The walk: Keep them fixed (none of the three in the
		   plan, the ticks, the count or the preview, which names them), then the Automation kind unticked, then the opt-in
		   (the three listed), then Profile in use unticked there, then Keep them fixed off and on and the opt-in off and on:
		   the row and the kind stay out of the plan, the ticks, the counts and the preview, and in Settings out of the write;
		   FileSafe, which nobody unticked, comes with the opt-in. Then the other order: the opt-in first, Profile in use
		   unticked there, then Keep them fixed, then the opt-in off */
		const F2 = { row: 'safety.rules.permission-preset', kind: 'orchestrator_automation', fs: 'safety.protection.filesafe-integration', help: 'branching.subagents.max-parallel' };
		const f2walk = async (where) => run(t, async ([F, where]) => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = { where };
			const sh = () => document.querySelector('.psx-sheet.psx-copy');
			const THREE = [F.row, F.fs, F.help];
			if (where === 'new') {
				await P.command({ cmd: 'moment', id: 'copy-new' }); await wait(700);
				const more = sh().querySelector('[data-act="more"]'); if (more) { more.click(); await wait(250); }
				const r = sh().querySelector('input[name="psx-src"][value="recipe-app"]'); if (r) { r.click(); await wait(300); }
			} else {
				// a destination with none of the three as its own, so every one of them would be a change
				const dst = P.PROJECTS.map((p) => p.id).find((p) => p !== 'recipe-app' && !THREE.some((id) => P.has(P.W.project[p], id)));
				out.dst = dst; P.setCtx({ project: dst }); await wait(500);
				P.copy.open({ mode: 'settings', src: 'recipe-app' }); await wait(500);
			}
			const adv = sh().querySelector('details.psx-adv'); if (adv && !adv.open) { sh().querySelector('details.psx-adv > summary').click(); await wait(250); }
			out.src = P.copy.st.src;
			const click = async (sel) => { const el = sh().querySelector(sel); if (!el) return false; el.click(); await wait(250); return true; };
			const openKind = async (k) => { const b = sh().querySelector(`[data-act="openkind"][data-kind="${k}"]`); if (b && b.getAttribute('aria-expanded') !== 'true') { b.click(); await wait(220); } };
			const btnN = () => { const m = /Copy (\d+) setting/.exec(sh().querySelector('.psx-sheet-foot .btn.primary').textContent); return m ? +m[1] : -1; };
			const kindBox = (k) => { const b = sh().querySelector(`input[data-act="kind"][data-kind="${k}"]`); const m = b && /(\d+) of (\d+)/.exec(b.closest('label').textContent); return b ? { of: m ? [+m[1], +m[2]] : null, checked: b.checked, mixed: b.indeterminate } : null; };
			const ids = () => P.copy.plan().rows.map((x) => x.id);
			const inKind = (list, k) => list.filter((id) => P.copy.kindOf(id) === k);
			const ticks = () => THREE.filter((id) => !!sh().querySelector(`input[data-id="${id}"]`));
			const preview = async () => {
				sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(400);
				const names = [...sh().querySelectorAll('li .psx-li-name')].map((x) => x.textContent.trim());
				const o = { rows: names.length, row: names.some((x) => x.startsWith(P.label(F.row) + ':')), help: names.some((x) => x.startsWith(P.label(F.help) + ':')), kind: names.filter((x) => inKind(Object.keys(P.DEF), F.kind).some((id) => x.startsWith(P.label(id) + ':'))), fs: names.some((x) => x.startsWith(P.label(F.fs) + ':')), left: ((sh().querySelector('[data-k="leftout"]') || {}).textContent || '').trim(), compHeld: ((sh().querySelector('[data-k="compheld"]') || {}).textContent || '').replace(/\s+/g, ' ').trim() };
				return o;
			};
			const back = async () => { const b = [...sh().querySelectorAll('.psx-sheet-foot .btn')].find((x) => x.textContent.trim() === 'Back'); if (b) { b.click(); await wait(350); } const a2 = sh().querySelector('details.psx-adv'); if (a2 && !a2.open) { sh().querySelector('details.psx-adv > summary').click(); await wait(250); } };
			// 1. Keep them fixed alone: none of the three from Home NAS is frozen, and the preview names them
			await click('input[data-act="fixed"]');
			await openKind('permissions_security'); await openKind(F.kind);
			const p0 = P.copy.plan();
			out.fixedOnly = { labels: THREE.map((id) => P.label(id)), plan: p0.rows.filter((x) => THREE.includes(x.id)).map((x) => `${x.id} (${x.from})`), held: (p0.compHeld || []).map((x) => x.id).sort(), ticks: ticks(), n: btnN(), T: P.copy.totals().n, fixedLabel: ((sh().querySelector('input[data-act="fixed"]') || { closest: () => null }).closest('label') || {}).textContent || '' };
			out.fixedOnly.preview = await preview(); await back();
			// 2. the Automation kind unticked
			await openKind(F.kind);
			const kb0 = sh().querySelector(`input[data-act="kind"][data-kind="${F.kind}"]`); out.kindWasOn = !!kb0 && kb0.checked;
			if (kb0 && !kb0.checked) await click(`input[data-act="kind"][data-kind="${F.kind}"]`);
			await click(`input[data-act="kind"][data-kind="${F.kind}"]`);
			const i0 = ids();
			out.before = { n: btnN(), T: P.copy.totals().n, kind: inKind(i0, F.kind).length, three: i0.filter((id) => THREE.includes(id)) };
			// 3. the computer's values, then Profile in use unticked among them
			await click('input[data-act="fromcomp"]');
			await openKind(F.kind); await openKind('permissions_security');
			const rb0 = sh().querySelector(`input[data-id="${F.row}"]`); out.rowListed = !!rb0; out.rowWasOn = !!rb0 && rb0.checked;
			if (rb0 && rb0.checked) await click(`input[data-id="${F.row}"]`);
			// 4. Keep them fixed off and on, the opt-in off and on: the ticks hold
			await click('input[data-act="fixed"]'); await click('input[data-act="fixed"]');
			await click('input[data-act="fromcomp"]'); await click('input[data-act="fromcomp"]');
			await openKind(F.kind); await openKind('permissions_security');
			const i1 = ids(), p1 = P.copy.plan();
			out.after = { n: btnN(), T: P.copy.totals().n, row: i1.includes(F.row), kind: inKind(i1, F.kind), fs: i1.includes(F.fs), fromComp: p1.rows.filter((x) => x.from === 'computer').map((x) => x.id) };
			const rb1 = sh().querySelector(`input[data-id="${F.row}"]`); out.rowBox = rb1 ? rb1.checked : 'not listed';
			const hb = sh().querySelector(`input[data-id="${F.help}"]`); out.helpBox = hb ? hb.checked : 'not listed';
			out.kindBox = kindBox(F.kind); out.permBox = kindBox('permissions_security');
			out.permOn = inKind(i1, 'permissions_security').length;
			out.compAfter = [...sh().querySelectorAll('input[data-act="fromcomp"]')].map((x) => x.closest('label').textContent.replace(/\s+/g, ' ').trim())[0] || '';
			// 5. the preview, then in Settings the write
			out.preview = await preview();
			if (where === 'settings') {
				const before = JSON.parse(JSON.stringify(P.W.project[out.dst] || {}));
				sh().querySelector('.psx-sheet-foot .btn.primary').click(); await wait(1600);
				const now = P.W.project[out.dst] || {};
				out.write = { row: P.has(now, F.row), help: P.has(now, F.help), kind: inKind(Object.keys(now), F.kind).filter((id) => !P.has(before, id)), fs: P.has(now, F.fs), n: Object.keys(now).filter((id) => !P.has(before, id)).length };
			}
			return out;
		}, [F2, where]);
		for (const where of ['new', 'settings']) {
			await reset(t);
			const w = await f2walk(where);
			const W2 = where === 'new' ? 'New Project › Like recipe-app' : `Copy settings into ${w.dst} from recipe-app`;
			const fo = w.fixedOnly;
			await t.check(`Follow-up (SSYS-062: Computer-effective freeze is off by default), ${W2}: Keep them fixed alone freezes nothing recipe-app gets from Home NAS: Helpers at once, Profile in use and FileSafe are out of the plan, the ticks, the count and the preview, the preview names them as coming only with Copy what recipe-app gets from Home NAS, and Keep them fixed’s own line says so`,
				!fo.plan.length && JSON.stringify(fo.held) === JSON.stringify([F2.help, F2.row, F2.fs].sort()) && !fo.ticks.length && fo.n === fo.T && !fo.preview.row && !fo.preview.fs && !fo.preview.help && /^Not kept fixed: /.test(fo.preview.compHeld) && /recipe-app gets them from Home NAS, and only “Copy what recipe-app gets from Home NAS” brings them\./.test(fo.preview.compHeld) && fo.labels.every((l) => fo.preview.compHeld.includes(l)) && /comes only with the next choice/.test(fo.fixedLabel), JSON.stringify(fo));
			await t.check(`F2 (Sol max, under SSYS-062), ${W2}: the walk reached its controls (Automation was selected; with Copy what recipe-app gets from Home NAS on, Profile in use was listed and ticked)`, w.src === 'recipe-app' && w.kindWasOn && w.before.kind === 0 && !w.before.three.length && w.rowListed && w.rowWasOn, JSON.stringify({ kindWasOn: w.kindWasOn, before: w.before, rowListed: w.rowListed, rowWasOn: w.rowWasOn }));
			await t.check(`F2 (Sol max, under SSYS-062), ${W2}: through Keep them fixed off and on and the opt-in off and on, the unticked Profile in use and the unticked Automation kind stay out of the plan; FileSafe comes, from Home NAS, with the opt-in only`, !w.after.row && !w.after.kind.length && w.after.fs && JSON.stringify(w.after.fromComp) === JSON.stringify([F2.fs]), JSON.stringify(w.after));
			await t.check(`F2 (Sol max, under SSYS-062), ${W2}: the ticks agree: Profile in use and Helpers at once unticked, Automation unticked, Permissions’ count is what the plan holds`, w.rowBox === false && w.helpBox === false && !!w.kindBox && !w.kindBox.checked && !w.kindBox.mixed && w.kindBox.of && w.kindBox.of[0] === 0 && !!w.permBox && w.permBox.of && w.permBox.of[0] === w.permOn, JSON.stringify({ rowBox: w.rowBox, helpBox: w.helpBox, kindBox: w.kindBox, permBox: w.permBox, permOn: w.permOn }));
			await t.check(`F2 (Sol max, under SSYS-062), ${W2}: the counts: the button and the plan agree, and the opt-in added exactly FileSafe; the opt-in says what stays as usual`, w.after.n === w.after.T && w.after.n === w.before.n + 1 && /Profile in use/.test(w.compAfter) && /stays as usual, as you chose/.test(w.compAfter), JSON.stringify({ before: w.before, after: { n: w.after.n, T: w.after.T }, comp: w.compAfter }));
			await t.check(`F2 (Sol max, under SSYS-062), ${W2}: the preview lists neither Profile in use nor an Automation setting, lists FileSafe, names what stays as usual, and holds nothing back from Home NAS`, w.preview.rows > 0 && !w.preview.row && !w.preview.kind.length && w.preview.fs && /Profile in use/.test(w.preview.left) && !w.preview.compHeld, JSON.stringify(w.preview));
			if (where === 'settings') await t.check(`F2 (Sol max, under SSYS-062), ${W2}: Copy writes neither Profile in use nor an Automation setting into ${w.dst}, and writes FileSafe`, !!w.write && !w.write.row && !w.write.help && !w.write.kind.length && w.write.fs && w.write.n === w.after.T, JSON.stringify(w.write));
			if (where === 'new') await pic(t, 'f2-preview', 'F2 under SSYS-062: New Project like recipe-app, Keep them fixed, Automation unticked, then the Home NAS values with Profile in use unticked: the preview brings FileSafe only and says what stays as usual', '.psx-sheet.psx-copy');
			await run(t, () => window.PSX.closeSheets()); await settle(t, 300);
		}
		// the other order: the computer's values first, Profile in use unticked among them, then Keep them fixed, then the opt-in off
		await reset(t);
		const rev = await run(t, async (F) => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			const sh = () => document.querySelector('.psx-sheet.psx-copy');
			await P.command({ cmd: 'moment', id: 'copy-new' }); await wait(700);
			const more = sh().querySelector('[data-act="more"]'); if (more) { more.click(); await wait(250); }
			const r = sh().querySelector('input[name="psx-src"][value="recipe-app"]'); if (r) { r.click(); await wait(300); }
			const adv = sh().querySelector('details.psx-adv'); if (adv && !adv.open) { sh().querySelector('details.psx-adv > summary').click(); await wait(250); }
			sh().querySelector('input[data-act="fromcomp"]').click(); await wait(250);
			const ob = sh().querySelector('[data-act="openkind"][data-kind="permissions_security"]'); if (ob && ob.getAttribute('aria-expanded') !== 'true') { ob.click(); await wait(220); }
			const rb = sh().querySelector(`input[data-id="${F.row}"]`); out.listed = !!rb; out.wasOn = !!rb && rb.checked;
			if (rb && rb.checked) { rb.click(); await wait(250); }
			out.afterUntick = P.copy.plan().rows.some((x) => x.id === F.row);
			sh().querySelector('input[data-act="fixed"]').click(); await wait(250);
			out.afterFixed = P.copy.plan().rows.some((x) => x.id === F.row);
			const rb2 = sh().querySelector(`input[data-id="${F.row}"]`); out.box = rb2 ? rb2.checked : 'not listed';
			// the opt-in off again, Keep them fixed still on: none of the three is frozen
			sh().querySelector('input[data-act="fromcomp"]').click(); await wait(250);
			out.afterCompOff = P.copy.plan().rows.filter((x) => [F.row, F.fs, F.help].includes(x.id)).map((x) => `${x.id} (${x.from})`);
			return out;
		}, F2);
		await t.check('F2 (Sol max), the other order: the Home NAS values list Profile in use with its own tick; unticked there, turning Keep them fixed on doesn’t bring it back', rev.listed && rev.wasOn && !rev.afterUntick && !rev.afterFixed && rev.box === false, JSON.stringify(rev));
		await t.check('Follow-up (SSYS-062), the other order: with Keep them fixed still on, turning Copy what recipe-app gets from Home NAS off takes all three of its values out of the plan (Keep them fixed doesn’t freeze them)', Array.isArray(rev.afterCompOff) && !rev.afterCompOff.length, JSON.stringify(rev));
		/* the same rule inside one kind: Keep them fixed on, the Automation kind unticked, then one of its rows ticked by
		   itself. Only that row joins; the old build re-selected the whole kind, bringing back every row in it */
		await reset(t);
		const one = await run(t, async (F) => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			const sh = () => document.querySelector('.psx-sheet.psx-copy');
			await P.command({ cmd: 'moment', id: 'copy-new' }); await wait(700);
			const more = sh().querySelector('[data-act="more"]'); if (more) { more.click(); await wait(250); }
			const r = sh().querySelector('input[name="psx-src"][value="recipe-app"]'); if (r) { r.click(); await wait(300); }
			const adv = sh().querySelector('details.psx-adv'); if (adv && !adv.open) { sh().querySelector('details.psx-adv > summary').click(); await wait(250); }
			sh().querySelector('input[data-act="fixed"]').click(); await wait(250);
			const inKind = () => P.copy.plan().rows.filter((x) => P.copy.kindOf(x.id) === F.kind).map((x) => x.id);
			out.inKindBefore = inKind().length;
			const kb = sh().querySelector(`input[data-act="kind"][data-kind="${F.kind}"]`); if (kb && kb.checked) { kb.click(); await wait(250); }
			out.afterKindOff = inKind().length;
			const ob = sh().querySelector(`[data-act="openkind"][data-kind="${F.kind}"]`); if (ob && ob.getAttribute('aria-expanded') !== 'true') { ob.click(); await wait(220); }
			const box = sh().querySelector(`.psx-kind-rows input[data-kind="${F.kind}"]:not(:checked)`); out.ticked = box && box.dataset.id;
			if (box) { box.click(); await wait(250); }
			out.after = inKind();
			return out;
		}, F2);
		await t.check('F2: in a deselected kind, ticking one row brings only that row; the rest of the kind stays out', one.inKindBefore > 1 && one.afterKindOff === 0 && !!one.ticked && one.after.length === 1 && one.after[0] === one.ticked, JSON.stringify(one));
		// found while proving F2's write: a setting with no value can't be kept fixed, so it is never counted or previewed
		const noValue = await run(t, () => window.PSX.copy.plan().rows.filter((x) => x.fixed && x.value === undefined).map((x) => x.id));
		await t.check('F2: Keep them fixed counts, previews and writes no setting that has no value (each one it counts is written)', !noValue.length, noValue.join(', '));
		await run(t, () => window.PSX.closeSheets());
		await astraCopy(t);
	});

	/* ------------------------------------------------------------------ guided flows 8.03-8.04: Always allow
	   Round A-r3: 11.18 was rebuilt from one rule model (README "Always allow: the rule model"). This part keeps its own
	   copy of that model's tables and walks every step × every answer it offers × Regular and YOLO × the same run, a new
	   run and a switch of Run mode, asserting the state of every step each time. The r1-r2 one-off session and YOLO probes
	   asserted behaviour the walk now covers. Round A-r4 adds PS-145's home read (FileSafe on and off), cross-kind cases
	   generated from table D, and the two copy guards r3 dropped */
	const AM = {
		// A and B: each step's kind, and what each kind offers; whether YOLO still asks
		steps: [['test', 'command'], ['release', 'command'], ['push', 'remote'], ['publish', 'remote'], ['outside', 'path'], ['home', 'path'], ['test2', 'command'], ['delete', 'remote-delete']],
		offers: { command: ['once', 'session', 'always', 'no'], path: ['once', 'session', 'always', 'no'], remote: ['once', 'session', 'no'], 'remote-delete': ['once', 'no'] },
		yoloAsks: { command: false, path: true, remote: false, 'remote-delete': true },
		// B, review A-r4 F1: PS-145's exception. With FileSafe on, a task-needed, listed, non-secret home-folder read doesn't
		// ask, in either mode; the team-share folder is outside home, so it never qualifies
		home: ['home'],
		// D: the one rule kind that may cover each step kind; a push, a publish and a deletion take none
		ruleKind: { command: 'command', path: 'path', remote: null, 'remote-delete': null },
		// each step's target, the text a rule's pattern is matched against
		target: { test: 'npm test', release: './scripts/release.sh v1.4.0', push: 'git push origin feature/tags', publish: 'docker push ghcr.io/jared/loom:1.4.0', outside: '/mnt/team-share/release-notes', home: '~/Documents/release-checklist.md', test2: 'npm test', delete: 'git push origin --delete old-ui' },
		// C: the state an answer leaves on its own step
		own: { once: 'once', session: 'session', always: 'always', no: 'no' },
		// the same request as another step (For this session covers it later in the run)
		same: { test: 'test2', test2: 'test' },
		// D: the rule Always allow makes with the middle suggestion, and every step that rule covers (by kind and match)
		rule: { test: ['npm test *', ['test', 'test2']], test2: ['npm test *', ['test', 'test2']], release: ['./scripts/release.sh *', ['release']], outside: ['/mnt/team-share/release-notes/**', ['outside']], home: ['~/Documents/*.md', ['home']] }
	};
	const order = AM.steps.map((x) => x[0]), kindOf = Object.fromEntries(AM.steps);
	/* what every step should read: `answered` is [step, answer] in the run being looked at, or null in a later run;
	   `fs` is loom's FileSafe as the run started */
	const expect = (mode, answered, rule, fs = true) => Object.fromEntries(order.map((y, i) => {
		const k = kindOf[y];
		if (fs && AM.home.includes(y)) return [y, 'filesafe'];
		if (mode === 'yolo' && !AM.yoloAsks[k]) return [y, 'mode'];
		if (answered && answered[0] === y) return [y, AM.own[answered[1]]];
		const after = answered ? i > order.indexOf(answered[0]) : true;
		if (rule && rule[1].includes(y) && after) return [y, 'rule'];
		if (answered && answered[1] === 'session' && AM.same[answered[0]] === y && after) return [y, 'session'];
		return [y, 'asks'];
	}));
	/* what a person sees on each row: the step by its name, its status word, or the answers it offers. The page's own
	   data-state is only a cross-check, so the walk judges any build by what it shows */
	const STATES = () => {
		const s = document.querySelector('.psx-back:not([data-leaving]) .psx-sheet'); if (!s) return null;
		const NAMES = { 'Run npm test': 'test', 'Run the release script': 'release', 'Push to GitHub': 'push', 'Publish the image': 'publish', 'Read a folder outside loom': 'outside', 'Read your release checklist': 'home', 'Run npm test again, after the fix': 'test2', 'Delete a branch on GitHub': 'delete' };
		const WORDS = { 'Allowed once': 'once', 'Allowed for this session': 'session', 'Allowed, rule kept': 'always', 'Not allowed': 'no', 'Ran, not asked': 'mode', 'Allowed by your rule': 'rule', 'Read, not asked': 'filesafe' };
		// review A-r4 T3: the two copy guards dropped in r3 are back: no line says "Allowed. Allowed", and the kept rule
		// is listed with its kind and its place
		const out = { undef: /undefined/.test(s.innerText), doubled: /Allowed\. Allowed/.test(s.innerText), steps: {}, rules: [] };
		s.querySelectorAll('.psx-ask > li').forEach((li) => {
			const id = NAMES[((li.querySelector('.psx-li-name') || {}).textContent || '').trim()]; if (!id) return;
			const offers = [...li.querySelectorAll('[data-ask]')].map((b) => b.dataset.a);
			const word = ((li.querySelector('.psx-li-end') || {}).innerText || '').trim();
			const state = offers.length ? 'asks' : WORDS[word] || `“${word}”`;
			out.steps[id] = { state, hook: li.dataset.state || null, offers, sub: (li.querySelector('.psx-li-sub') || {}).textContent || '' };
		});
		const h = [...s.querySelectorAll('.psx-h')].find((x) => /^Always rules$/.test(x.textContent.trim()));
		const list = h && h.nextElementSibling && h.nextElementSibling.matches('ul') ? h.nextElementSibling : null;
		if (list) out.rules = [...list.querySelectorAll('li')].map((li) => li.innerText.replace(/\s+/g, ' ').trim());
		return out;
	};
	const PLACE_LABEL = { project: 'In this project', computer: 'On this computer', everywhere: 'Everywhere' };
	/* compare one look at the sheet with the table: every step's state, the answers an asking step offers, the words
	   that go with its state, no "undefined" and no "Allowed. Allowed" anywhere, and the kept rule with its place */
	const same = (got, want, mode, kept) => {
		const bad = [];
		if (!got) return ['the sheet is gone'];
		if (got.undef) bad.push('a row reads “undefined”');
		if (got.doubled) bad.push('a line reads “Allowed. Allowed”');
		if (kept && !got.rules.some((r) => r.startsWith(kept.pattern + ' ') && r.includes(`${kept.kind === 'path' ? 'Folder' : 'Command'} rule · ${PLACE_LABEL[kept.where]}`))) bad.push(`the rule ${kept.pattern} isn’t listed as a ${kept.kind === 'path' ? 'folder' : 'command'} rule ${PLACE_LABEL[kept.where]} (${got.rules.join(' / ') || 'none listed'})`);
		for (const y of order) {
			const g = got.steps[y] || {}, w = want[y], k = kindOf[y];
			if (g.state !== w) { bad.push(`${y}: ${g.state} (table: ${w})`); continue; }
			if (g.hook && g.hook !== w) bad.push(`${y}: shows ${w} but its data-state says ${g.hook}`);
			if (w === 'asks' && g.offers.join(',') !== AM.offers[k].join(',')) bad.push(`${y} offers ${g.offers.join(',')} (table: ${AM.offers[k].join(',')})`);
			if (w !== 'asks' && g.offers.length) bad.push(`${y} still shows answers`);
			if (w === 'asks' && mode === 'yolo' && !/YOLO still asks:/.test(g.sub)) bad.push(`${y} asks in YOLO without saying YOLO still asks`);
			if (w === 'rule' && !/Your (command|folder) rule .+ allowed it\./.test(g.sub)) bad.push(`${y}: no line naming the rule`);
			if (w === 'session' && !/(For the rest of this run in (Regular|YOLO); a new run or another run mode asks again\. No rule is kept\.|allowed for this session earlier in this run, so it didn’t ask again\.)/.test(g.sub)) bad.push(`${y}: no session line`);
			if (w === 'no' && !/nothing is kept, so the next request asks again/.test(g.sub)) bad.push(`${y}: no refusal line`);
			if (w === 'filesafe' && !/FileSafe is on, and this home-folder read is one the task needs and not a secret, so it didn’t ask\. It is listed in Activity\./.test(g.sub)) bad.push(`${y}: no line saying FileSafe’s home read didn’t ask`);
		}
		return bad;
	};
	if (want(t, 'always')) await t.step('guided flows 8.03-8.04: Always allow chooses the pattern and the place', async () => {
		await reset(t);
		const sh = '.psx-sheet';
		const open = async (mode) => { await run(t, async (m) => { window.PSX.closeSheets(); await new Promise((r) => setTimeout(r, 220)); await window.PSX.command({ cmd: 'runmode', mode: m }); await window.PSX.command({ cmd: 'moment', id: '11.18' }); }, mode); await t.root.waitForFunction(() => document.querySelectorAll('.psx-back').length === 1 && !!document.querySelector('.psx-back:not([data-leaving]) .psx-sheet li[data-step]'), null, { timeout: 8000 }).catch(() => {}); await settle(t, 250); };
		const states = () => run(t, STATES);
		const ed = async (id) => run(t, (i) => {
			const e = document.querySelector(`.psx-sheet [data-always="${i}"]`); if (!e) return null;
			return { pat: [...e.querySelectorAll('[data-pat]')].map((r) => r.checked), where: [...e.querySelectorAll('[data-where]')].map((r) => r.value + ':' + r.checked), save: e.querySelector('[data-always-save]').getAttribute('aria-disabled'), note: !!e.querySelector('[data-k="noeverywhere"]'), noteText: (e.querySelector('[data-k="noeverywhere"]') || {}).textContent || '', cleared: ((e.querySelector('[data-k="cleared"]') || {}).textContent || '').replace(/\s+/g, ' ').trim(), covers: (e.querySelector('[data-k="covers"]') || {}).textContent || '', preview: (e.querySelector('[data-k="preview"]') || {}).textContent || '' };
		}, id);
		// a step or an answer the page doesn't offer fails its case and the walk goes on (an older build has no home read)
		const has = async (sel) => (await t.root.locator(sel).count()) > 0;
		const makeRule = async (id, pat, where) => {
			if (!(await has(`${sh} [data-ask="${id}"][data-a="always"]`))) return false;
			await t.root.locator(`${sh} [data-ask="${id}"][data-a="always"]`).click(); await settle(t, 200);
			if (typeof pat === 'number') await t.root.locator(`${sh} [data-always="${id}"] [data-pat="${pat}"]`).check();
			else { await t.root.locator(`${sh} [data-always="${id}"] [data-pat="own"]`).check(); await settle(t, 150); await t.root.locator(`${sh} [data-always="${id}"] [data-pat-own]`).fill(pat); }
			await settle(t, 200);
			await t.root.locator(`${sh} [data-always="${id}"] [data-where="${where}"]`).check(); await settle(t, 150);
			await t.root.locator(`${sh} [data-always-save="${id}"]`).click(); await settle(t, 250);
			return true;
		};
		const again = async () => { await t.root.locator(`${sh} .psx-sheet-foot button`, { hasText: 'Run it again' }).first().click().catch(async () => { await run(t, () => window.PSX.approvals.draw()); }); await settle(t, 250); };
		const mode = async (m) => { await run(t, async (x) => { await window.PSX.command({ cmd: 'runmode', mode: x }); }, m); await settle(t, 300); };
		// loom's FileSafe in the demo world; the next run starts with it (a run keeps the snapshot it started with)
		const fileSafe = async (on) => { await run(t, (v) => { window.PSX.apply([{ level: 'project', key: 'loom', id: 'safety.protection.filesafe-integration', value: v }], { history: false }); window.PSX.feed && window.PSX.feed.push && window.PSX.feed.push(); }, on); await settle(t, 150); };

		/* the editor (8.03, 8.04) */
		await open('regular');
		await t.root.locator(`${sh} [data-ask="test"][data-a="always"]`).click(); await settle(t, 300);
		let e = await ed('test');
		await t.check('8.03: Always allow opens the pattern and the place, nothing chosen', !!e && e.pat.every((x) => !x) && e.where.every((x) => /:false$/.test(x)) && e.save === 'true', JSON.stringify(e));
		await t.check('8.04: npm test is not about one computer, so Everywhere is offered', e.where.some((x) => /^everywhere/.test(x)) && !e.note, JSON.stringify(e));
		await t.check('D: the editor says a command rule covers commands only, never a path, a push, a publish or a deletion', /covers only the commands it matches: never a path outside the project, a push, a publish or a deletion on the remote/.test(e.covers), e.covers);
		await t.root.locator(`${sh} [data-always="test"] [data-pat="1"]`).check(); await settle(t, 250);
		e = await ed('test');
		await t.check('8.03: the chosen pattern shows what it matches and what still asks', /Matches:.*npm test -- --watch/.test(e.preview) && /Still asks:.*npm run build/.test(e.preview) && !/broad/.test(e.preview), e.preview);
		await t.root.locator(`${sh} [data-always="test"] [data-where="project"]`).check(); await settle(t, 250);
		await pic(t, 'always-editor', 'Always allow for npm test: the pattern npm test * and In this project chosen by hand, with what it matches', '.psx-sheet');
		await t.root.locator(`${sh} [data-always-cancel="test"]`).click(); await settle(t, 200);
		for (const id of ['release', 'outside']) {
			await t.root.locator(`${sh} [data-ask="${id}"][data-a="always"]`).click(); await settle(t, 300);
			if (id === 'release') { await t.root.locator(`${sh} [data-always="release"] [data-pat="1"]`).check(); await settle(t, 250); }
			e = await ed(id);
			await t.check(`8.04: ${id === 'release' ? 'a script by its path' : 'a folder rule'} never offers Everywhere, and says why`, !!e && !e.where.some((x) => /^everywhere/.test(x)) && e.note, JSON.stringify(e));
			if (id === 'release') {
				await t.check('R3-4: the release step’s own ./scripts/release.sh * is not broad', /Matches:.*release\.sh v1\.5\.0/.test(e.preview) && !/broad/.test(e.preview), e.preview);
				await pic(t, 'always-host', 'Always allow for ./scripts/release.sh *: not broad, and Everywhere is not offered, with the reason', '.psx-sheet');
			} else await t.check('D: the editor says a folder rule goes on the outside-folder list and never covers a command', /outside-folder list.*never a command/.test(e.covers), e.covers);
			await t.root.locator(`${sh} [data-always-cancel="${id}"]`).click(); await settle(t, 200);
		}
		await t.root.locator(`${sh} [data-ask="release"][data-a="always"]`).click(); await settle(t, 300);
		await t.root.locator(`${sh} [data-always="release"] [data-pat="own"]`).check(); await settle(t, 250);
		await t.root.locator(`${sh} [data-always="release"] [data-pat-own]`).fill('*'); await settle(t, 300);
		e = await ed('release');
		await t.check('8.04: your own pattern * on the release step never offers Everywhere, and says why; * reads broad', !!e && !e.where.some((x) => /^everywhere/.test(x)) && e.note && /This one is broad/.test(e.preview), JSON.stringify(e));
		await pic(t, 'always-own-star', 'Always allow for the release script with your own pattern *: Everywhere stays hidden and * is flagged broad', '.psx-sheet');
		// review A-r4 N2: Everywhere follows what the pattern is about, not the step it is typed on
		await t.root.locator(`${sh} [data-always="release"] [data-pat-own]`).fill('git push origin *'); await settle(t, 300);
		e = await ed('release');
		await t.check('N2: git push origin * typed on the release step is about git, not a path, so Everywhere is offered (PS-144: what the rule is about)', !!e && e.where.some((x) => /^everywhere/.test(x)) && !e.note, JSON.stringify(e));
		await t.root.locator(`${sh} [data-always-cancel="release"]`).click(); await settle(t, 200);

		/* review Sol max F1: seven spellings offered Everywhere on b5e34f24a5 (a path behind =, a quoted path, a drive
		   written C:/, a relative backslash path, a UNC share) and one was saved there. Each is typed as your own pattern
		   on npm test, a step whose own target is portable, so only the pattern can hide Everywhere. It must be hidden,
		   with a line naming the path; and on a build that still offers it, choosing it and Add the rule (the reviewer's
		   save) must keep no Everywhere rule */
		const HOST7 = [['npm --prefix=/opt/release test', '/opt/release'], ['npm --prefix=../other test', '../other'], ['"/opt/tools/runner" test', '/opt/tools/runner'], ['"../tools/runner" test', '../tools/runner'], ['C:/Tools/runner test', 'C:/Tools/runner'], ['.\\tools\\runner test', '.\\tools\\runner'], ['\\\\nas\\share\\runner test', '\\\\nas\\share\\runner']];
		const typeOwn = async (id, pat) => {
			if (!(await has(`${sh} [data-always="${id}"]`))) { await t.root.locator(`${sh} [data-ask="${id}"][data-a="always"]`).click(); await settle(t, 200); }
			if (!(await t.root.locator(`${sh} [data-always="${id}"] [data-pat="own"]`).isChecked())) { await t.root.locator(`${sh} [data-always="${id}"] [data-pat="own"]`).check(); await settle(t, 150); }
			await t.root.locator(`${sh} [data-always="${id}"] [data-pat-own]`).fill(pat); await settle(t, 220);
		};
		const keptRules = () => run(t, () => window.PSX.approvals.st.rules.map((r) => `${r.pattern} @ ${r.where}`));
		for (const [pat, word] of HOST7) {
			await open('regular');
			await typeOwn('test', pat);
			e = await ed('test');
			const offered = !!e && e.where.some((x) => /^everywhere/.test(x));
			let saved = [];
			if (offered) {
				await t.root.locator(`${sh} [data-always="test"] [data-where="everywhere"]`).check(); await settle(t, 150);
				await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 250);
				saved = (await keptRules()).filter((r) => / @ everywhere$/.test(r));
				if (pat === HOST7[0][0]) { await run(t, () => window.__psxScrollTo(document.querySelector('.psx-sheet [data-k="rules"]'), 'center')); await settle(t, 200); await pic(t, 'f1-before-saved-everywhere', `F1 on a build that offers it: ${pat} kept as a command rule Everywhere`, '.psx-sheet'); }
			} else if (pat === HOST7[0][0]) { await run(t, () => window.__psxScrollTo(document.querySelector('.psx-sheet [data-k="noeverywhere"]'), 'center')); await settle(t, 200); await pic(t, 'f1-host-no-everywhere', `F1: ${pat} typed on npm test: Everywhere hidden, and the line names /opt/release`, '.psx-sheet'); }
			await t.check(`F1 (Sol max): ${pat} on npm test hides Everywhere, the line names ${word}, and no Everywhere rule can be kept`, !!e && !offered && e.note && e.noteText.includes(word) && !saved.length, JSON.stringify({ where: e && e.where, line: e && e.noteText, saved }));
		}
		/* the save guard on its own: Everywhere chosen for the portable npm test, then the pattern swapped for each
		   spelling with no redraw (an editor still showing Everywhere) and Add the rule pressed. The guard reads the exact
		   pattern with the editor's classifier: it keeps nothing, clears the place and says why */
		for (const [pat, word] of HOST7) {
			await open('regular');
			await typeOwn('test', 'npm test');
			await t.root.locator(`${sh} [data-always="test"] [data-where="everywhere"]`).check(); await settle(t, 150);
			await run(t, (p) => { window.PSX.approvals.st.edit.pattern = p; const i = document.querySelector('.psx-sheet [data-pat-own]'); if (i) i.value = p; }, pat);
			await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 250);
			const g = await run(t, () => ({ rules: window.PSX.approvals.st.rules.map((r) => `${r.pattern} @ ${r.where}`), note: ((document.querySelector('.psx-note') || {}).innerText || '').replace(/\s+/g, ' ').trim(), cleared: !!document.querySelector('.psx-sheet [data-always="test"] [data-k="cleared"]') }));
			await t.check(`F1 (Sol max): the save guard keeps no Everywhere rule for ${pat} from an editor that still showed Everywhere, clears the place and says why`, !g.rules.some((r) => / @ everywhere$/.test(r)) && /Not kept/.test(g.note) && g.note.includes(word) && g.cleared, JSON.stringify(g));
			if (pat === HOST7[0][0]) await pic(t, 'f1-guard', 'F1: the save guard refused Everywhere for npm --prefix=/opt/release test and said why', null);
		}
		/* controls: portable patterns still offer Everywhere with no line against them. A web address is not a path (the old
		   reader took .sh in https://bun.sh/install for a script), nor is an image reference or a git ref: the lead's canon call on
		   PS-144 (2026-11-13) put back the four controls the first version of table E2 had read as paths; one is kept Everywhere */
		const PORTABLE = ['npm test', 'npm test *', 'git push origin *', 'npm run build', 'git push origin feature/tags', 'docker push ghcr.io/jared/loom:1.4.0', 'npm publish --registry=https://registry.npmjs.org', 'NODE_ENV=production npm test', 'make -j8 test', 'curl -fsSL https://bun.sh/install'];
		await open('regular');
		for (const pat of PORTABLE) {
			await typeOwn('test', pat);
			e = await ed('test');
			await t.check(`F1 control: ${pat} still offers Everywhere, with no line against it`, !!e && e.where.some((x) => /^everywhere/.test(x)) && !e.note, JSON.stringify(e));
		}
		await typeOwn('test', 'npm test *');
		await t.root.locator(`${sh} [data-always="test"] [data-where="everywhere"]`).check(); await settle(t, 150);
		await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 250);
		{ const got = await states(); const bad = same(got, Object.assign(expect('regular', ['test', 'always'], ['npm test *', ['test', 'test2']]), {}), 'regular', { pattern: 'npm test *', kind: 'command', where: 'everywhere' }); await t.check('F1 control: npm test * is kept Everywhere and listed as a command rule Everywhere; it covers the repeat', !bad.length, bad.join(' | ')); }
		/* a place the pattern no longer allows is cleared, and the editor says so and why: Everywhere chosen for npm test,
		   then the pattern becomes one of the seven, and /usr/local/bin/npm test (a path the old reader saw too, where the
		   place was cleared without a word). Choosing a place again takes the line away */
		for (const [pat, word] of [['npm --prefix=/opt/release test', '/opt/release'], ['/usr/local/bin/npm test', '/usr/local/bin/npm']]) {
			await open('regular');
			await typeOwn('test', 'npm test');
			await t.root.locator(`${sh} [data-always="test"] [data-where="everywhere"]`).check(); await settle(t, 150);
			await t.root.locator(`${sh} [data-always="test"] [data-pat-own]`).fill(pat); await settle(t, 250);
			e = await ed('test');
			await t.check(`F1 (Sol max): npm test changed to ${pat} clears the chosen Everywhere, says so and why, and Add the rule waits for a place`, !!e && e.where.every((x) => /:false$/.test(x)) && !e.where.some((x) => /^everywhere/.test(x)) && /Everywhere, was cleared/.test(e.cleared) && e.noteText.includes(word) && e.save === 'true', JSON.stringify(e));
			if (pat === '/usr/local/bin/npm test') await pic(t, 'f1-cleared', `F1: Everywhere was chosen for npm test; the pattern became ${pat}, so Everywhere was cleared, with the reason`, '.psx-sheet');
			await t.root.locator(`${sh} [data-always="test"] [data-where="computer"]`).check(); await settle(t, 150);
			e = await ed('test');
			await t.check(`F1: after ${pat}, choosing On this computer takes the cleared line away and Add the rule is ready`, !!e && !e.cleared && e.save !== 'true', JSON.stringify(e));
		}
		/* the one reader, read through the page's own functions: every place that asks "is this a path?" (E, the save
		   guard's classifier, F's named script, D's folder matching and B's home read) */
		const reader = await run(t, () => {
			const A = window.PSX.approvals, S = Object.fromEntries(A.ASKS.map((x) => [x.id, x]));
			const MORE = ['C:\\Tools\\runner test', 'npm --prefix ~/x test', '$HOME/bin/runner', '%USERPROFILE%\\bin\\runner.exe', 'tools/runner test', 'gcc -I/usr/include x', 'PATH=/opt/bin npm test', '//nas/share/runner', '~\\bin\\runner', 'node --require=./hook.js app', "npm --prefix='/opt/x' test", 'prettier --write .', 'tools\\runner test', 'npm --prefix="C:\\Program Files\\x" test'];
			const out = { hostMissed: MORE.filter((p) => !A.hostDependent(p, S.test)) };
			out.hostOfMatches = typeof A.hostOf === 'function' ? MORE.concat(['npm test *', 'git *']).filter((p) => !!A.hostOf(p, S.test) !== A.hostDependent(p, S.test)) : ['no hostOf'];
			// F: a package runner after NAME=value is still a package runner then *
			out.broadMissed = ['NODE_ENV=production npm *', 'env CI=1 npx *'].filter((p) => !A.isBroad(p, S.test));
			// D: a folder rule written with a trailing separator or in quotes covers the folder it names
			out.foldMissed = ['/mnt/team-share/release-notes/', '"/mnt/team-share/release-notes"', '/mnt//team-share/release-notes'].filter((p) => !A.test(p, '/mnt/team-share/release-notes', true));
			out.foldWrong = ['/mnt/team-share/release-notes-old', '"/mnt/team-share"'].filter((p) => A.test(p, '/mnt/team-share/release-notes', true));
			// B: the home read is a home-folder path, read by the same reader
			out.homeRead = [A.MODEL.homeRead(S.home, true), A.MODEL.homeRead(Object.assign({}, S.home, { target: '/mnt/team-share/release-checklist.md' }), true), A.MODEL.homeRead(S.home, false)];
			return out;
		});
		await t.check('F1: the one reader also catches C:\\ paths, ~ and $HOME, %USERPROFILE%, a program run by its location, a flag’s glued path, NAME=/path, //host and quoted Windows paths', !reader.hostMissed.length && !reader.hostOfMatches.length, JSON.stringify(reader));
		await t.check('F1: broad detection reads the program past NAME=value and env, so NODE_ENV=production npm * is broad', !reader.broadMissed.length, JSON.stringify(reader.broadMissed));
		await t.check('F1: folder-rule matching reads paths the same way: a trailing separator, quotes or a doubled separator still cover the folder, and nothing wider or other', !reader.foldMissed.length && !reader.foldWrong.length, JSON.stringify(reader));
		await t.check('F1: the home read takes PS-145’s exception only for a home-folder path, read by the same reader', JSON.stringify(reader.homeRead) === '[true,false,false]', JSON.stringify(reader.homeRead));
		/* the same weakness in Settings: a row whose value is a place on one computer must be that computer's own (or the
		   project's), whatever its control. The check's own oracle, not the page's reader: an absolute path. Review S1 (the
		   recheck's tool note): Plans' inventory layering comes first (SSYS-059), so a row the inventory keeps inside its
		   owner (home: thing) must stay off the ladder, held by its owner; the old oracle passed the Rules file as Computer.
		   Every Settings row is read, not only the adopted ones, so an owner-held row can't drop out of the count */
		const INV1 = inventory(t);
		const valuePaths = await run(t, (inv) => {
			const P = window.PSX, ABS = /^(\/|~[\w.-]*([\\/]|$)|[A-Za-z]:[\\/]|\\\\|file:)/i, out = { rows: [], bad: [] };
			const ids = [...new Set(Object.keys(P.DEF).concat(Object.keys((window.PM51.placement || {}).byId || {})))];
			for (const id of ids) {
				const s = window.PM51.setting(id), v = s && typeof s.value === 'string' ? s.value.trim() : '';
				if (!ABS.test(v)) continue;
				const d = P.DEF[id], home = inv && inv[id] ? inv[id].home : null; out.rows.push(`${id}${home ? ` (inventory: ${home})` : ''}`);
				if (home === 'thing') { if (d || !((P.offLadder || {}).thing || []).includes(id)) out.bad.push(`${id} = ${v}: the inventory keeps it inside its owner, here ${d ? d.home || (d.may || []).join('+') : 'not held by its owner'}`); }
				else if (!d || (d.home !== 'computer' && d.home !== 'project')) out.bad.push(`${id} = ${v} (${d ? d.home || (d.may || []).join('+') : 'off the ladder'})`);
			}
			return out;
		}, INV1);
		await t.check(`F1, the same weakness in Settings: each of the ${valuePaths.rows.length} rows whose value is an absolute path follows Plans’ inventory first (owner-held stays with its owner), and otherwise belongs to each computer or the project, never an everywhere value`, !!INV1 && valuePaths.rows.length > 0 && !valuePaths.bad.length, JSON.stringify(valuePaths));
		// F (broad) and E (host-dependent), on the page's own functions with its own steps
		const units = await run(t, () => {
			const A = window.PSX.approvals;
			if (!A || !A.ASKS) return { broad: ['the page has no rule model (PSX.approvals.ASKS)'], narrow: [], host: [], notHost: [] };
			const S = Object.fromEntries(A.ASKS.map((x) => [x.id, x])), b = (p, s) => !!S[s] && A.isBroad(p, S[s]), h = (p, s) => !!S[s] && A.hostDependent(p, S[s]), missing = ['home'].filter((x) => !S[x]).map((x) => `no ${x} step`);
			return {
				broad: missing.concat(['*', 'bash -c *', 'python3 *', 'node *', 'npm *', 'npx *', 'git *', 'rm -rf *', 'read *', 'sudo *', 'sudo apt install *'].filter((p) => !b(p, 'test'))).concat(['./scripts/*', '*'].filter((p) => !b(p, 'release'))).concat(['/mnt/team-share/**', '/mnt/**', '*'].filter((p) => !b(p, 'outside'))).concat(['~/Documents/**', '~/Documents/*.md'].filter((p) => !b(p, 'home'))),
				narrow: ['npm test *', 'git push origin *', 'python3 tools/build.py *', 'npm test'].filter((p) => b(p, 'test')).concat(['./scripts/release.sh *'].filter((p) => b(p, 'release'))).concat(['/mnt/team-share/release-notes', '/mnt/team-share/release-notes/**'].filter((p) => b(p, 'outside'))).concat(['~/Documents/release-checklist.md'].filter((p) => b(p, 'home'))),
				host: [['./scripts/release.sh *', 'release'], ['*', 'release'], ['*', 'test'], ['read *', 'test'], ['rm -rf *', 'test'], ['/usr/local/bin/npm test', 'test'], ['/mnt/team-share/release-notes/**', 'outside']].filter(([p, s]) => !h(p, s)).map((x) => x.join(' on ')),
				notHost: [['npm test *', 'test'], ['git *', 'test'], ['git push origin *', 'test'], ['git push origin *', 'release'], ['npm test *', 'release']].filter(([p, s]) => h(p, s)).map((x) => x.join(' on '))
			};
		});
		await t.check('F: broad = a wildcard program, sudo with *, a shell or interpreter running *, or one program word then *; a folder rule reaching past its file or folder', !units.broad.length, 'not flagged: ' + units.broad.join(' | '));
		await t.check('F: a named script or subcommand then * is not broad (./scripts/release.sh *, npm test *, git push origin *), nor a folder rule inside its file or folder', !units.narrow.length, 'flagged: ' + units.narrow.join(' | '));
		await t.check('E: host-dependent = a pattern naming a path or script, a file command or a wildcard program, whatever step it is typed on (N2); never Everywhere', !units.host.length && !units.notHost.length, JSON.stringify(units));
		await astraAlways(t, { sh, open, typeOwn, ed, keptRules });

		/* fresh runs: FileSafe on (the demo's), then off */
		for (const fs of [true, false]) for (const m of ['regular', 'yolo']) {
			await open(m);
			if (!fs) { await fileSafe(false); await again(); }
			const fresh = await states();
			const bad = same(fresh, expect(m, null, null, fs), m);
			await t.check(`B: a fresh run in ${m === 'yolo' ? 'YOLO' : 'Regular'}, FileSafe ${fs ? 'on' : 'off'}: every step asks or runs as the table says${fs ? '; the home read doesn’t ask (PS-145) and the team-share folder does' : '; the home read asks like any outside path'}`, !bad.length, bad.join(' | ') || JSON.stringify(Object.fromEntries(Object.entries(fresh.steps).map(([k, v]) => [k, v.state]))));
		}

		/* the table walk: every step × every answer it offers × Regular and YOLO × the same run, a new run and a switch.
		   With FileSafe on the home read never asks; with it off, the home read is walked too */
		let walked = 0, cases = 0;
		for (const fs of [true, false]) for (const m of ['regular', 'yolo']) for (const [y, k] of AM.steps) {
			if (m === 'yolo' && !AM.yoloAsks[k]) continue;
			if (fs === AM.home.includes(y)) continue;          // FileSafe on: every step but the home read; off: the home read
			cases += AM.offers[k].length;
		}
		for (const fs of [true, false]) for (const m of ['regular', 'yolo']) {
			const other = m === 'yolo' ? 'regular' : 'yolo', M = m === 'yolo' ? 'YOLO' : 'Regular';
			for (const [y, k] of AM.steps) {
				if (m === 'yolo' && !AM.yoloAsks[k]) continue;
				if (fs === AM.home.includes(y)) continue;
				for (const x of AM.offers[k]) {
					await open(m);
					if (!fs) { await fileSafe(false); await again(); }
					const rule = x === 'always' ? AM.rule[y] : null, kept = rule ? { pattern: rule[0], kind: AM.ruleKind[k], where: 'project' } : null;
					let offered = true;
					if (x === 'always') offered = await makeRule(y, 1, 'project');
					else if (await has(`${sh} [data-ask="${y}"][data-a="${x}"]`)) { await t.root.locator(`${sh} [data-ask="${y}"][data-a="${x}"]`).click(); await settle(t, 250); }
					else offered = false;
					if (!offered) { await t.check(`C/D: ${y} answered ${x} in ${M}, FileSafe ${fs ? 'on' : 'off'}: this run, Run it again, and a switch to ${other === 'yolo' ? 'YOLO' : 'Regular'} each match the table`, false, `the page offers no ${x} on ${y}`); walked++; continue; }
					const s1 = same(await states(), expect(m, [y, x], rule, fs), m, kept);
					await again();
					const s2 = same(await states(), expect(m, null, rule, fs), m, kept);
					await mode(other);
					const s3 = same(await states(), expect(other, null, rule, fs), other, kept);
					await t.check(`C/D: ${y} answered ${x} in ${M}, FileSafe ${fs ? 'on' : 'off'}: this run, Run it again, and a switch to ${other === 'yolo' ? 'YOLO' : 'Regular'} each match the table`, !s1.length && !s2.length && !s3.length, ['same run: ' + (s1.join('; ') || 'ok'), 'new run: ' + (s2.join('; ') || 'ok'), 'switch: ' + (s3.join('; ') || 'ok')].join(' | '));
					walked++;
				}
			}
		}
		await t.check(`the walk covered all ${cases} step × answer × run-mode cases the table gives (FileSafe on, and the home read with it off)`, walked === cases && cases > 30, `${walked} of ${cases}`);

		/* review A-r4 T2: cross-kind coverage, generated from table D. For each rule kind, a rule made on a step of that
		   kind whose own pattern is exactly another kind's target (so the text matches), then a new run in Regular and in
		   YOLO: that step is not covered. And the widest rule, *, covers every step of its own kind and nothing else */
		const CROSS = [];
		for (const R of ['command', 'path']) {
			const maker = order.find((id) => AM.ruleKind[kindOf[id]] === R && !AM.home.includes(id));
			const seen = new Set();
			for (const y of order) {
				if (AM.ruleKind[kindOf[y]] === R || seen.has(AM.target[y])) continue;
				seen.add(AM.target[y]);
				CROSS.push([R, maker, AM.target[y], order.filter((z) => AM.ruleKind[kindOf[z]] === R && AM.target[z] === AM.target[y])]);
			}
			CROSS.push([R, maker, '*', order.filter((z) => AM.ruleKind[kindOf[z]] === R)]);
		}
		// R3-1's own case: git push origin *, made on the release step
		CROSS.push(['command', 'release', 'git push origin *', []]);
		for (const [R, maker, pat, cov] of CROSS) {
			await open('regular');
			if (!(await makeRule(maker, pat, 'project'))) { await t.check(`D (cross-kind): a ${R === 'path' ? 'folder' : 'command'} rule ${pat} made on ${maker}`, false, `the page offers no Always allow on ${maker}`); continue; }
			await again();
			const kept = { pattern: pat, kind: R, where: 'project' };
			const r1 = same(await states(), expect('regular', null, [pat, cov]), 'regular', kept);
			await mode('yolo');
			const r2 = same(await states(), expect('yolo', null, [pat, cov]), 'yolo', kept);
			if (pat === 'git push origin *') await pic(t, 'always-r3-1-yolo', 'R3-1: after the rule git push origin *, a new run in YOLO: the deletion on the remote still asks', '.psx-sheet');
			const others = order.filter((z) => AM.ruleKind[kindOf[z]] !== R).join(', ');
			await t.check(`D (cross-kind): a ${R === 'path' ? 'folder' : 'command'} rule ${pat} made on ${maker} covers ${cov.length ? cov.join(', ') : 'no step'} and never ${others}, in a new run in Regular and in YOLO`, !r1.length && !r2.length, ['Regular: ' + (r1.join('; ') || 'ok'), 'YOLO: ' + (r2.join('; ') || 'ok')].join(' | '));
		}
		// the session picture (Regular): For this session on npm test covers its repeat; the outside folder for this session
		await open('regular');
		await t.root.locator(`${sh} [data-ask="test"][data-a="session"]`).click(); await settle(t, 250);
		await t.root.locator(`${sh} [data-ask="outside"][data-a="session"]`).click(); await settle(t, 250);
		await pic(t, 'always-session-regular', '11.18 in Regular: For this session on npm test covers its repeat; the team-share folder allowed for this session; the home read didn’t ask (FileSafe on)', '.psx-sheet');
		await mode('yolo');
		await pic(t, 'always-after-yolo', '11.18 after a switch to YOLO: a new run, so the team-share folder asks again and the deletion still asks', '.psx-sheet');
		const y = await run(t, () => ({ rules: window.PSX.approvals.st.rules.length, none: /None made/.test(document.querySelector('.psx-sheet').innerText) }));
		await t.check('8.05-8.06: YOLO makes no Always rule of its own', y.rules === 0 && y.none, JSON.stringify(y));
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); window.PSX.closeSheets(); });
	});

	/* ------------------------------------------------------------------ the page Jared opens: the review strip
	   (review A-r1 finding 1 and tool note A: a script error in the strip passed every check that loaded only the app) */
	/* ------------------------------------------------------------------ Jared's review, 2026-11-13: items 1, 3 and 5 */
	if (want(t, 'jared1113') && jWant(t, 'models')) await t.step('Jared 1113 #1: every model row’s Change and Set for… open the shared model picker over the page, with its inherit words, and set a model there', async () => {
		const inv = jInventory(t);
		await t.check('Plans’ inventory is read', !!inv, String(t.args.inventory || 'Plans/settings_inventory.json'));
		if (!inv) return;
		await reset(t); await run(t, HELPERS);
		const ids = Object.keys(inv).filter((id) => inv[id].type === 'model_picker');
		const FROM = Object.fromEntries(ids.map((id) => [id, inv[id].picker && inv[id].picker.inherit_from]));
		const tally = { rows: ids.length, held: [], paths: 0, picker: 0, inherit: 0, saved: 0 };
		for (const id of ids) {
			const r = inv[id];
			if (r.home === 'thing' || !(r.may || []).length) {
				const info = await run(t, (i) => ({ onLadder: !!window.PSX.DEF[i], held: window.PSX.ownerHeld ? !!window.PSX.ownerHeld(i) : null }), id);
				await t.check(`${id}: Plans’ inventory keeps it inside its owner (home: thing, no level), so it has no Set for… path and stays off the ladder`, !info.onLadder, JSON.stringify(info));
				tally.held.push(id); continue;
			}
			if (!(await jOpen(t, id))) { await t.check(`${id}: its Details panel opens`, false, 'not opened'); continue; }
			for (const level of ['everywhere'].concat(r.may.filter((l) => l !== 'everywhere'))) {
				let p;
				if (level === 'everywhere') {
					const ch = t.root.locator(`${J_INSP} [data-psx-key="everywhere::change"]`).first();
					if (!(await ch.count())) { await t.check(`${id} · Everywhere has a Change`, false, 'no Change'); continue; }
					await jPress(t, ch); p = { how: 'change', name: 'Everywhere' };
				} else p = await jPath(t, level);
				if (!p) { await t.check(`${id} · ${level}: a Set for… path ends somewhere`, false, 'no path'); continue; }
				tally.paths++;
				await t.root.waitForFunction(() => !!document.querySelector('.psx-mpick') || !!document.querySelector('#pm-settings-root .detail-inspector .psx-wedit'), null, { timeout: 3000, polling: 50 }).catch(() => {});
				await settle(t, 260);
				const e = await run(t, J_EDITOR);
				const where = `${id} · ${p.how === 'add' ? `+ Set for a ${level}… › ${p.name}` : `${p.name}’s Change`}`;
				const pk = e.pick;
				await t.check(`${where}: the shared model picker opens over the page (fixed, outside the panel, inside the window), never a plain list or a text box`, !!pk && pk.fixed && !pk.inPanel && pk.onScreen && !(e.inline && (e.inline.select || e.inline.text !== null)), JSON.stringify({ pick: pk && { fixed: pk.fixed, inPanel: pk.inPanel, onScreen: pk.onScreen, n: pk.options.length }, inline: e.inline }));
				if (!pk) { await jClean(t); continue; }
				tally.picker++;
				// the inherit choice: the inventory's words and the model the named source resolves to at that place
				const lab = r.labels && r.labels.inherit;
				const want = await run(t, ([i, from, line]) => {
					const P = window.PSX, [lvl, key] = String(line || 'everywhere:').split(':');
					const ctx = lvl === 'project' ? { project: key, device: P.S.ctx.device, on: null } : lvl === 'computer' ? { project: 'none', device: P.S.ctx.device, on: key } : P.S.ctx;
					let src = i, v = 'inherit', n = 0;
					while (v === 'inherit' && n++ < 6) { src = from[src]; if (!src) return null; if (lvl === 'everywhere') { const ev = P.getAt(P.W, 'everywhere', null, src); v = ev !== undefined ? ev : P.DEFAULTS[src]; } else { const rr = P.DEF[src] ? P.resolve(src, ctx) : null; v = rr ? rr.value : P.DEFAULTS[src]; } }
					return v === 'inherit' ? null : String(P.vt(src, v && typeof v === 'object' ? v.model : v)).split(' · ')[0];
				}, [id, FROM, e.line]);
				if (lab) {
					const row = pk.options.find((o) => o.value === 'inherit');
					const ok = !!row && row.text.includes(lab) && !!want && row.text.includes(want);
					if (ok) tally.inherit++;
					await t.check(`${where}: its inherit choice reads “${lab}” with the model it is here (${want})`, ok, JSON.stringify(row || pk.options.slice(0, 2)));
				}
				await t.check(`${where}: no choice says “Same as the project”`, !/Same as the project/.test(pk.text), pk.text.slice(0, 160));
				const ownWords = (r.options || []).filter((o) => typeof o === 'string' && !/^<|choose a specific/i.test(o));
				const models = pk.options.filter((o) => o.value && o.value.includes('/'));
				const onlyOwn = /^media\.capabilities\.(video|tts|music)-model$/.test(id);
				await t.check(`${where}: it lists the row’s own choices (${ownWords.join(', ') || 'none'})${onlyOwn ? '' : ' and the models you can use'}, with the thinking depth inside it`, ownWords.every((w) => pk.options.some((o) => o.value === w)) && (onlyOwn || models.length > 0) && pk.depth, JSON.stringify({ own: ownWords, models: models.length, depth: pk.depth }));
				// a place's own: choose a model (and a depth when it has one), Done, Save; the value lands at that place
				if (level !== 'everywhere' && e.line) {
					const target = models[models.length - 1] || pk.options.find((o) => o.value !== 'inherit') || pk.options[0];
					await t.root.locator(`.psx-mpick [role="option"][data-value="${target.value}"]`).first().click();
					await settle(t, 120);
					const dp = t.root.locator('.psx-mpick [data-depth]:not([data-depth=""])').last();
					let effort = '';
					if (await dp.count()) { effort = await dp.getAttribute('data-depth'); await dp.click(); await settle(t, 100); }
					await t.root.locator('.psx-mpick [data-psx-mpick-done]').first().click();
					await settle(t, 120);
					await jSave(t, e.line);
					const got = await run(t, ([lvl, key, i]) => JSON.stringify(window.PSX.getAt(window.PSX.W, lvl, key || null, i)), [...e.line.split(':'), id]);
					const exp = JSON.stringify(effort ? { model: target.value, effort } : target.value);
					if (got === exp) tally.saved++;
					await t.check(`${where}: choosing ${target.value}${effort ? ` with ${effort} thinking` : ''} and Save keeps it for that place`, got === exp, `${got} (wanted ${exp})`);
				}
				await jClean(t);
			}
		}
		/* Plans batch 4 (DL-479): when the inventory makes Model nicknames one per_item map, a project's line is set with a
		   nickname and a model from the shared picker; a second line that normalizes the same is refused; each nickname
		   resolves on its own */
		const NK = 'ai.models.model-alias';
		if (inv[NK] && inv[NK].type === 'keyvalue') {
			await run(t, () => { window.PSX.setOwn('ai.models.model-alias', { level: 'everywhere', key: null }, { quick: 'anthropic/claude-sonnet-4', deep: 'anthropic/claude-opus-4' }, { quiet: true, confirmed: true }); });
			if (await jOpen(t, NK)) {
				const p = await jPath(t, 'project');
				await t.root.waitForFunction(() => !!document.querySelector('#pm-settings-root .detail-inspector .psx-nicks'), null, { timeout: 3000, polling: 50 }).catch(() => {});
				const e = await run(t, J_EDITOR);
				await t.check(`${NK} (batch 4) · + Set for a project… › ${p && p.name}: a nickname list whose model side is the shared picker`, !!e.inline && e.inline.nicks && e.inline.nickAdd, JSON.stringify(e.inline));
				if (e.inline && e.inline.nicks && e.line) {
					const W0 = `${J_PANEL} .psx-wedit:not(.o55-leaving *)`;
					await jPress(t, t.root.locator(`${W0} [data-psx-nick-add]`).first());
					await t.root.locator(`${W0} .psx-nick-name`).last().fill('Deep');
					await jPress(t, t.root.locator(`${W0} .psx-nick [data-psx-mpick]`).last());
					await t.root.waitForFunction(() => !!document.querySelector('.psx-mpick'), null, { timeout: 3000, polling: 50 }).catch(() => {});
					await settle(t, 200);
					const pk = await run(t, J_EDITOR);
					const opt = (pk.pick && pk.pick.options.find((o) => o.value === 'anthropic/claude-sonnet-4')) || (pk.pick && pk.pick.options.find((o) => o.value && o.value.includes('/')));
					await t.check(`${NK} (batch 4): the model side opens the shared picker over the page, with no depth to set`, !!pk.pick && pk.pick.fixed && !pk.pick.inPanel && !!opt && /no depth|presets keep/i.test(pk.pick.text), JSON.stringify(pk.pick && { n: pk.pick.options.length, text: pk.pick.text.slice(-120) }));
					if (opt) { await t.root.locator(`.psx-mpick [role="option"][data-value="${opt.value}"]`).first().click(); await t.root.locator('.psx-mpick [data-psx-mpick-done]').first().click(); await settle(t, 150); }
					await jSave(t, e.line);
					const [lvl, key] = e.line.split(':');
					const got = await run(t, ([a, b]) => ({ own: window.PSX.getAt(window.PSX.W, a, b, 'ai.models.model-alias'), used: window.PSX.resolve('ai.models.model-alias', { project: b, device: 'here', on: null }).value }), [lvl, key]);
					await t.check(`${NK} (batch 4): Save keeps ${key}’s own “Deep” line, and in ${key} “Deep” is its own while “quick” still comes from everywhere (per_item)`, !!got.own && got.own.Deep === (opt && opt.value) && got.used && got.used.Deep === (opt && opt.value) && got.used.quick === 'anthropic/claude-sonnet-4' && !('deep' in got.used && 'Deep' in got.used), JSON.stringify(got));
					const dup = await run(t, ([b]) => { const P = window.PSX; return { tx: !!P.write([{ level: 'project', key: b, id: 'ai.models.model-alias', value: { 'fast model': 'anthropic/claude-opus-4', 'Fast-Model': 'anthropic/claude-sonnet-4' } }], {}, { silent: true }), why: (P.guard.why({ level: 'project', key: b, id: 'ai.models.model-alias', value: { 'fast model': 'anthropic/claude-opus-4', 'Fast-Model': 'anthropic/claude-sonnet-4' } }) || {}).text, hide: (P.guard.why({ level: 'everywhere', key: null, id: 'ai.models.model-alias', value: { 'anthropic/claude-opus-4': 'anthropic/claude-sonnet-4' } }) || {}).text, notModel: (P.guard.why({ level: 'everywhere', key: null, id: 'ai.models.model-alias', value: { zz: 'psx/not-a-model' } }) || {}).text }; }, [key]);
					await t.check(`${NK} (batch 4): PSX.write refuses two nicknames that normalize the same, a nickname that is a model’s own name, and a model you can’t use`, !dup.tx && /already a nickname/.test(dup.why || '') && /hide that model/.test(dup.hide || '') && /isn’t a model/.test(dup.notModel || ''), JSON.stringify(dup));
				}
				await jClean(t);
			} else await t.check(`${NK} (batch 4): its Details panel opens`, false, 'not opened');
		}
		await t.check(`${tally.rows} model rows in Plans’ inventory: ${tally.paths} Change and Set for… paths, ${tally.picker} opened the picker, ${tally.inherit} inherit choices named their model, ${tally.saved} places kept the chosen model; held by their owner: ${tally.held.join(', ') || 'none'}`, tally.rows >= 16 && tally.paths > 0 && tally.picker === tally.paths, JSON.stringify(tally));
	});

	if (want(t, 'jared1113') && jWant(t, 'paths')) await t.step('Jared 1113 #3: every adopted row’s Set for a computer… / device… / project… ends in an editor that can set that row’s value', async () => {
		const inv = jInventory(t) || {};
		await reset(t); await run(t, HELPERS);
		const rows = await run(t, () => {
			const P = window.PSX, order = Object.keys(window.PM51.placement.byId);
			const ids = Object.keys(P.DEF).filter((id) => P.DEF[id].adopted || P.DEF[id].inventory).sort((a, b) => order.indexOf(a) - order.indexOf(b));
			return ids.map((id) => { const off = P.offered(P.DEF[id]); return { id, levels: ['computer', 'device', 'project'].filter((l) => off[l]), home: P.DEF[id].home || null }; }).filter((r) => r.levels.length);
		});
		const max = Number(t.args.j1113max) || rows.length;
		const walk = rows.slice(0, max);
		const bad = { open: [], none: [], kind: [], save: [] }, kinds = {}, proved = {};
		let paths = 0;
		for (const row of walk) {
			const { id } = row;
			if (!(await jOpen(t, id))) { bad.open.push(id); continue; }
			const main = await run(t, J_MAIN, id);
			const r = inv[id] || {};
			for (const level of row.levels) {
				const p = await jPath(t, level);
				if (!p) { bad.none.push(`${id} · ${level}: no + Set for… and no Change`); continue; }
				paths++;
				await t.root.waitForFunction(() => !!document.querySelector('.psx-mpick, .drawer-wrap.is-open .drawer') || !!document.querySelector('#pm-settings-root .detail-inspector .psx-wedit'), null, { timeout: 3000, polling: 50 }).catch(() => {});
				await settle(t, 100);
				const e = await run(t, J_EDITOR);
				const d = main.def;
				const objectish = (d && typeof d === 'object' && !Array.isArray(d)) || (Array.isArray(d) && !d.every((x) => typeof x === 'string')) || r.type === 'keyvalue' || main.control === 'keyvalue';
				const numeric = !Array.isArray(d) && (J_NUMERIC.includes(main.control) || r.type === 'number' || r.type === 'slider');
				let kind, ok, why = '';
				const inl = e.inline;
				if (r.type === 'model_picker') { kind = 'model'; ok = !!e.pick && !(inl && (inl.select || inl.text !== null)); }
				// Plans batch 4 (DL-479): the one Model nicknames list, a map whose value side is a model (the shared picker)
				else if (id === 'ai.models.model-alias' && r.type === 'keyvalue') { kind = 'nicknames'; ok = !!inl && inl.nicks && inl.nickAdd && inl.save; why = JSON.stringify(inl); }
				else if (objectish) { kind = 'row’s own editor'; ok = !!e.drawer && e.drawer.save && e.drawer.place === `${level}:${(e.drawer.place || '').split(':')[1] || ''}` && /own value|everywhere value/.test(e.drawer.banner); why = JSON.stringify(e.drawer || inl); }
				else if (numeric) { kind = 'number'; ok = !!inl && !!inl.number && inl.save; why = JSON.stringify(inl); }
				else if (main.control === 'toggle' || typeof d === 'boolean') { kind = 'switch'; ok = !!inl && inl.switch && inl.save; }
				else if (main.control === 'multiselect') { kind = 'several choices'; const got = inl && inl.multi ? inl.multi.map((v) => String(JSON.parse(v))).sort() : null; ok = !!got && JSON.stringify(got) === JSON.stringify(main.choices.map(String).sort()) && inl.save; why = JSON.stringify({ got, main: main.choices }); }
				else if (['select', 'segmented', 'radio', 'swatches'].includes(main.control) && main.choices.length >= 2 && id !== 'general.visual.theme') { kind = 'a choice'; const got = inl && inl.select ? inl.select.map((v) => String(JSON.parse(v))).sort() : null; ok = !!got && JSON.stringify(got) === JSON.stringify(main.choices.map(String).sort()) && inl.save; why = JSON.stringify({ got: got && got.slice(0, 8), main: main.choices.slice(0, 8) }); }
				else { kind = 'words'; ok = !!inl && inl.save && (inl.text !== null || !!inl.select || !!inl.switch) && !/\[object Object\]/.test(String(inl.text)); why = JSON.stringify(inl); }
				kinds[kind] = (kinds[kind] || 0) + 1;
				if (!ok) bad.kind.push(`${id} · ${level} (${kind}): ${why.slice(0, 160)}`);
				// the first three paths of each kind are carried through: a value is set there and kept at that place
				if (ok && (proved[kind] || 0) < 3 && kind !== 'model' && kind !== 'nicknames') {
					const res = await (async () => {
						if (kind === 'row’s own editor') { await t.root.locator('.drawer-wrap.is-open .pm51-panel-foot .btn.primary').first().click(); await settle(t, 600); const sh = t.root.locator('.psx-back:not([data-leaving]) .psx-sheet .psx-sheet-foot .btn.primary').first(); if (await sh.count()) { await sh.click(); await settle(t, 300); } const pl = e.drawer.place.split(':'); return run(t, ([lvl, key, i]) => window.PSX.getAt(window.PSX.W, lvl, key || null, i) !== undefined, [pl[0], pl[1], id]); }
						const [lvl, key] = e.line.split(':');
						const before = await run(t, ([a, b, i]) => JSON.stringify(window.PSX.getAt(window.PSX.W, a, b || null, i)), [lvl, key, id]);
						const W0 = `${J_PANEL} .psx-wedit:not(.o55-leaving *)`;
						if (kind === 'switch') await t.root.locator(`${W0} [role="switch"]`).first().click();
						else if (kind === 'number') { const auto = t.root.locator(`${W0} [data-psx-auto]`).first(); if ((await auto.count()) && (await auto.isChecked())) await auto.click(); const lo = Number.isFinite(main.lo) ? main.lo : 1; await t.root.locator(`${W0} input[type="number"]`).first().fill(String(Number.isFinite(main.hi) ? Math.min(main.hi, Math.max(lo, lo + (main.step > 0 ? main.step : 1))) : lo + 1)); }
						else if (kind === 'several choices') await t.root.locator(`${W0} .psx-multi input[type="checkbox"]`).first().click();
						else if (kind === 'a choice') { const opts = await t.root.locator(`${W0} select option`).evaluateAll((os) => os.map((o) => ({ v: o.value, s: o.selected }))); const other = opts.find((o) => !o.s); if (other) await t.root.locator(`${W0} select`).first().selectOption(other.v); }
						else { const box = t.root.locator(`${W0} input[type="text"], ${W0} textarea`).first(); if (await box.count()) await box.fill('psx-check-' + level); }
						await jSave(t, e.line);
						const after = await run(t, ([a, b, i]) => JSON.stringify(window.PSX.getAt(window.PSX.W, a, b || null, i)), [lvl, key, id]);
						return after !== undefined && after !== before && after !== 'undefined';
					})();
					if (res) proved[kind] = (proved[kind] || 0) + 1; else bad.save.push(`${id} · ${level} (${kind})`);
				}
				await jClean(t);
			}
		}
		await t.check(`${walk.length} of ${rows.length} adopted rows with a place to set: every Details panel opens`, bad.open.length === 0, bad.open.slice(0, 8).join(' | '));
		await t.check(`${paths} Set for… paths: each reaches + Set for… or a place’s Change`, bad.none.length === 0, bad.none.slice(0, 8).join(' | '));
		await t.check(`${paths} paths end in an editor of the row’s own kind that can set its value (${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(', ')}): models in the shared picker, maps and lists of records in the row’s own editor for that place, numbers in a number box, lists in their own choices`, bad.kind.length === 0, `${bad.kind.length} wrong: ` + bad.kind.slice(0, 6).join(' | '));
		await t.check(`set through the editor and kept at that place: ${Object.entries(proved).map(([k, n]) => `${n} ${k}`).join(', ')}`, bad.save.length === 0 && Object.keys(proved).length >= 5, bad.save.slice(0, 8).join(' | '));
	});

	if (want(t, 'jared1113') && jWant(t, 'limits')) await t.step('Jared 1113 #5: every bounded row refuses a value outside its main control’s limits, through the per-place editor and through PSX.write', async () => {
		const inv = jInventory(t) || {};
		await reset(t); await run(t, HELPERS);
		const cands = await run(t, () => Object.keys(window.PSX.DEF).filter((id) => window.PM51.setting(id)));
		const rows = [];
		for (const id of cands) {
			const r = inv[id] || {};
			const main = await run(t, J_MAIN, id);
			const numeric = !Array.isArray(main.def) && (J_NUMERIC.includes(main.control) || r.type === 'number' || r.type === 'slider');
			if (!numeric) continue;
			let lo = main.lo, hi = main.hi;
			const rg = jRange(r.options);
			if (rg) { lo = Number.isFinite(lo) ? Math.max(lo, rg[0] / main.scale) : rg[0] / main.scale; hi = Number.isFinite(hi) ? Math.min(hi, rg[1] / main.scale) : rg[1] / main.scale; }
			if (!Number.isFinite(lo) && !Number.isFinite(hi)) continue;
			rows.push({ id, lo, hi, scale: main.scale, step: main.step, def: main.def, range: !!rg });
		}
		// PSX.write, at every place each row offers: a value past its limits is refused with the reason, and nothing changes
		const wr = await run(t, (rows) => {
			const P = window.PSX, out = { n: 0, bad: [] };
			const KEY = { everywhere: null, computer: 'homenas', device: 'iphone', project: 'harbor' };
			for (const r of rows) {
				const off = P.offered(P.DEF[r.id]);
				const outside = Number.isFinite(r.hi) ? r.hi + Math.max(1, Math.abs(r.hi)) : r.lo - Math.max(1, Math.abs(r.lo));
				const sfx = typeof r.def === 'string' ? (/^\s*-?\d+(?:\.\d+)?\s*(\D+)$/.exec(r.def) || [])[1] || '' : '';
				const stored = sfx ? `${outside * r.scale}${sfx.trim()}` : (typeof r.def === 'string' && /^\s*-?\d/.test(r.def) ? String(outside * r.scale) : outside * r.scale);
				for (const lvl of ['everywhere', 'computer', 'device', 'project']) {
					if (!off[lvl] || (lvl === 'everywhere' && P.DEF[r.id].home === 'computer')) continue;
					const key = KEY[lvl], before = JSON.stringify(P.getAt(P.W, lvl, key, r.id));
					const why = P.guard.why({ level: lvl, key, id: r.id, value: stored });
					const tx = P.write([{ level: lvl, key, id: r.id, value: stored }], {}, { silent: true });
					out.n++;
					const after = JSON.stringify(P.getAt(P.W, lvl, key, r.id));
					if (tx || after !== before || !why || why.kind !== 'invalid') out.bad.push(`${r.id} at ${lvl}${key ? ' ' + key : ''}: ${JSON.stringify(stored)} ${tx ? 'was written' : 'not written'}, guard said ${why ? why.text : 'nothing'}`);
				}
			}
			return out;
		}, rows);
		await t.check(`${rows.length} bounded rows (${rows.filter((r) => r.range).length} with a range in Plans’ inventory, Randomness 0.0-2.0 among them), ${wr.n} places: PSX.write refuses a value past the limits with the reason and changes nothing`, rows.length > 50 && rows.some((r) => r.id === 'ai.models.temperature') && wr.bad.length === 0, `${wr.bad.length} let through: ` + wr.bad.slice(0, 6).join(' | '));
		// a list keeps to its choices, a model row to its models: PSX.write refuses anything else
		const ch = await run(t, () => {
			const P = window.PSX, out = { n: 0, bad: [] };
			const KEY = { everywhere: null, computer: 'homenas', device: 'iphone', project: 'harbor' };
			for (const id of Object.keys(P.DEF)) {
				const s = window.PM51.setting(id) || {};
				const isList = ['select', 'segmented', 'radio'].includes(s.control) && Array.isArray(s.options) && s.options.length >= 2;
				const isMulti = s.control === 'multiselect' && Array.isArray(s.options) && s.options.length;
				const isModel = P.layering && P.layering.types[id] === 'model_picker';
				if (!isList && !isMulti && !isModel) continue;
				const off = P.offered(P.DEF[id]), lvl = ['project', 'computer', 'device', 'everywhere'].find((l) => off[l]); if (!lvl) continue;
				const value = isMulti ? ['psx-not-a-choice'] : isModel ? 'psx/not-a-model' : 'psx-not-a-choice';
				const tx = P.write([{ level: lvl, key: KEY[lvl], id, value }], {}, { silent: true });
				out.n++;
				if (tx) out.bad.push(`${id} at ${lvl}`);
			}
			return out;
		});
		await t.check(`${ch.n} lists and model rows: PSX.write refuses a value that isn’t one of the main control’s choices`, ch.n > 100 && ch.bad.length === 0, `${ch.bad.length} let through: ` + ch.bad.slice(0, 8).join(' | '));
		// the per-place editor, with real presses: type a value past the limits and press Save; then one inside them
		const bad = [], kept = [];
		let n = 0;
		const max = Number(t.args.j1113max) || rows.length;
		for (const r of rows.slice(0, max)) {
			if (!(await jOpen(t, r.id))) { bad.push(`${r.id}: panel didn’t open`); continue; }
			const levels = await run(t, (i) => { const off = window.PSX.offered(window.PSX.DEF[i]); return ['project', 'computer', 'device'].filter((l) => off[l]); }, r.id);
			let p;
			if (levels.length) p = await jPath(t, levels[0]);
			else { const c = t.root.locator(`${J_INSP} [data-psx-key="everywhere::change"]`).first(); if (await c.count()) { await jPress(t, c); p = { how: 'change', name: 'Everywhere' }; } }
			if (!p) { bad.push(`${r.id}: no path`); continue; }
			await t.root.waitForFunction(() => !!document.querySelector('#pm-settings-root .detail-inspector .psx-wedit'), null, { timeout: 3000, polling: 50 }).catch(() => {});
			const e = await run(t, J_EDITOR);
			if (!e.inline || !e.line) { bad.push(`${r.id}: no inline editor (${JSON.stringify(e).slice(0, 80)})`); await jClean(t); continue; }
			n++;
			const W0 = `${J_PANEL} .psx-wedit:not(.o55-leaving *)`;
			const auto = t.root.locator(`${W0} [data-psx-auto]`).first();
			if ((await auto.count()) && (await auto.isChecked())) await auto.click();
			const box = t.root.locator(`${W0} input[type="number"], ${W0} input[type="text"]`).first();
			const [lvl, key] = e.line.split(':');
			const before = await run(t, ([a, b, i]) => JSON.stringify(window.PSX.getAt(window.PSX.W, a, b || null, i)), [lvl, key, r.id]);
			const outside = Number.isFinite(r.hi) ? r.hi + Math.max(1, Math.abs(r.hi)) : r.lo - Math.max(1, Math.abs(r.lo));
			await box.fill(String(+outside.toFixed(6)));
			await jPress(t, t.root.locator(`${J_INSP} [data-psx-key="${e.line}:save"]`).first());
			await settle(t, 200);
			const res = await run(t, ([a, b, i]) => ({ after: JSON.stringify(window.PSX.getAt(window.PSX.W, a, b || null, i)), err: ((document.querySelector('#pm-settings-root .detail-inspector .psx-err:not([hidden])') || {}).textContent || '').trim() }), [lvl, key, r.id]);
			if (res.after !== before || !/can’t be|has to be/.test(res.err)) bad.push(`${r.id} at ${e.line}: typed ${+outside.toFixed(6)} → ${res.after === before ? 'not kept' : 'KEPT ' + res.after}, ${res.err ? '“' + res.err + '”' : 'no reason shown'}`);
			// one inside them is kept, so the editor still sets the value
			if (kept.length < 12 && res.after === before) {
				const inside = Number.isFinite(r.lo) ? r.lo : r.hi;
				const b2 = t.root.locator(`${W0} input[type="number"], ${W0} input[type="text"]`).first();
				if (await b2.count()) { await b2.fill(String(inside)); await jSave(t, e.line); const after2 = await run(t, ([a, b, i]) => JSON.stringify(window.PSX.getAt(window.PSX.W, a, b || null, i)), [lvl, key, r.id]); if (after2 !== before && after2 !== undefined) kept.push(r.id); else bad.push(`${r.id}: ${inside}, inside the limits, was not kept (${after2})`); }
			}
			await jClean(t);
		}
		await t.check(`${n} bounded rows through the per-place editor (real presses): a value past the limits stays unsaved with its reason; ${kept.length} values inside them were kept`, n > 50 && bad.length === 0 && kept.length >= 8, `${bad.length} wrong: ` + bad.slice(0, 6).join(' | '));
	});

	if (want(t, 'strip')) await t.step('the review strip on settings-scope.html works', async () => {
		const stripPath = t.args.strip || String(t.args.page || '').replace(/settings-scope-app\.html$/, 'settings-scope.html');
		if (!stripPath || !/settings-scope\.html$/.test(stripPath)) { await t.check('the strip page is given (--set strip=<path to settings-scope.html>)', false, stripPath); return; }
		const errors = [];
		const onErr = (e) => errors.push(String(e && e.message || e));
		// review A-r2 T3: a console.error in the page or its frame fails it too
		const onConsole = (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); };
		t.page.on('pageerror', onErr); t.page.on('console', onConsole);
		await t.goto(`${fileUrl(stripPath)}?cb=${Date.now()}`);
		await t.until('the strip says what is shown', () => /The decided design/.test((document.getElementById('note') || {}).textContent || ''), null, { timeout: 30000 });
		const frame = t.page.frames().find((f) => f !== t.page.mainFrame());
		await t.check('the strip frames PMConcept7', !!frame);
		if (frame) await frame.waitForFunction(() => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 90000 }).catch(() => {});
		await t.check('the layer is booted inside the strip’s frame', !!frame && await frame.evaluate(() => !!(window.PSX && window.PSX.booted)).catch(() => false));
		await t.page.selectOption('#moment', '11.18');
		await t.until('Moments › 11.18 shows its caption', () => /11\.18 What asks you/.test((document.getElementById('note') || {}).textContent || ''), null, { timeout: 10000 });
		const sheet = frame ? await frame.waitForFunction(() => { const s = document.querySelector('.psx-sheet'); return !!s && /What asks you/.test(s.textContent); }, null, { timeout: 15000 }).then(() => true).catch(() => false) : false;
		await t.check('Moments › 11.18 opens its sheet in the frame', sheet);
		// review A-r3 R3-6: the next moment's caption shows at once and stays; the last one never comes back
		await t.page.selectOption('#moment', '11.4');
		const caps = await t.page.evaluate(async () => { const out = []; const t0 = performance.now(); while (performance.now() - t0 < 3000) { out.push(((document.getElementById('note') || {}).textContent || '').slice(0, 40)); await new Promise((r) => setTimeout(r, 100)); } return out; });
		await t.check('R3-6: after 11.18, Moments › 11.4 shows its own caption at once and for the next 3s (sampled every 100ms)', caps.length > 10 && caps.every((c) => /^11\.4 /.test(c)), [...new Set(caps)].join(' | '));
		await t.page.click('#compareopts'); await settle(t, 300);
		await t.check('Compare options opens its row', () => t.page.evaluate(() => !document.getElementById('comparebar').hidden));
		await t.page.selectOption('#width', '860');
		// the frame animates its width (0.2s): wait for it to arrive rather than for a fixed time
		await t.until('Window width sets the frame to 860px', () => Math.round(document.getElementById('pm7').getBoundingClientRect().width) === 860, null, { timeout: 5000 });
		/* review A-r4, R3-5 under load: the strip's Look names the look that is painted. A busy loop holds the frame's main
		   thread about 75% of the time while three looks are picked 1.2s apart (past the greyed Look, as a fast hand or a
		   script can). Every 150ms: the Look, whether it is greyed, and the look painted in the frame */
		if (frame) {
			/* three loads and spacings, so the race shows on a fast machine as well as a slow one (the RTX 3090 didn't
			   reproduce it at the lightest): busy 70 of every 90ms with picks 1.2s apart, then 150 of every 170ms with picks
			   600ms and 250ms apart, each from a different look */
			const CASES = [[70, 90, 1200, ['retro-dark', 'retro-light', 'glass-dark']], [150, 170, 600, ['friendly-dark', 'glass-light', 'retro-dark']], [150, 170, 250, ['basic-light', 'nier-dark', 'glass-dark']]];
			for (const [busy, period, gap, seq] of CASES) {
				await frame.evaluate(([b, p]) => { window.__psxLoad = setInterval(() => { const t0 = performance.now(); while (performance.now() - t0 < b) { /* load */ } }, p); }, [busy, period]);
				const run5 = await t.page.evaluate(async ([seq, gap]) => {
					const sel = document.getElementById('look'), fr = document.getElementById('pm7');
					const painted = () => { const H = fr.contentDocument.documentElement, th = H.getAttribute('data-theme') || 'basic-dark'; return H.getAttribute('data-o55-nier') === 'on' ? 'nier-' + (/-light$/.test(th) ? 'light' : 'dark') : th; };
					const pick = (v) => { sel.disabled = false; sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true })); };
					const out = []; const t0 = performance.now(); let i = 0, nextAt = 0, settledAt = null;
					while (performance.now() - t0 < 60000) {
						const now = performance.now() - t0;
						if (i < seq.length && now >= nextAt) { pick(seq[i]); out.push({ t: Math.round(now), pick: seq[i] }); i++; nextAt = now + gap; }
						out.push({ t: Math.round(now), sel: sel.value, dis: sel.disabled, painted: painted() });
						if (i >= seq.length && !sel.disabled && sel.value === painted() && painted() === seq[seq.length - 1]) { if (settledAt == null) settledAt = now; if (now - settledAt > 3000) break; } else settledAt = null;
						await new Promise((r) => setTimeout(r, 150));
					}
					return out;
				}, [seq, gap]);
				await frame.evaluate(() => clearInterval(window.__psxLoad));
				const samples = run5.filter((x) => x.sel), last = samples[samples.length - 1] || {};
				const lastPickAt = Math.max(...run5.filter((x) => x.pick).map((x) => x.t));
				// a greyed Look shows the latest pick; an open one shows the painted look, within one sample of a repaint
				const stale = []; let since = null;
				for (const x of samples) {
					if (x.t < lastPickAt) continue;
					const ok = x.dis ? x.sel === seq[seq.length - 1] : x.sel === x.painted;
					if (!ok) { if (since == null) since = x.t; if (x.t - since > 450) stale.push(`${x.t}ms: Look ${x.sel}${x.dis ? ' (greyed)' : ''}, painted ${x.painted}`); } else since = null;
				}
				const ends = !last.dis && last.sel === last.painted && last.painted === seq[seq.length - 1];
				await t.check(`R3-5 under load (busy ${busy} of every ${period}ms, picks ${gap}ms apart, ${seq.join(' → ')}): after the last pick the Look names the look painted (or, while greyed, the one asked for), never an older one for more than a moment, and it ends open on the last look picked, painted`, stale.length === 0 && ends,
					(stale.slice(0, 5).join(' | ') || 'no stale sample') + ' · end: ' + samples.slice(-3).map((x) => `${x.t}:${x.sel}/${x.painted}${x.dis ? '/greyed' : ''}`).join(' '));
			}
		}
		t.page.off('pageerror', onErr); t.page.off('console', onConsole);
		await t.check('no uncaught error and no console.error on the strip page', errors.length === 0, errors.join(' | '));
		await pic(t, 'strip-11-18', 'The strip page with Moments › 11.18 open, its caption and its sheet', null);
	});
}
