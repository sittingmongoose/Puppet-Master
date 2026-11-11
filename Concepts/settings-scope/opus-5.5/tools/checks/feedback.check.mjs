// Jared's review of the settings-scope concept (2026-11-09, FEEDBACK.md items 3, 4, 8 and 11) and the guided-flows
// rows for this concept (GUIDED-FLOWS-CHECK "Changes for P": Copy settings 3.02-3.07, 3.12, 3.17 and Always allow
// 8.03-8.04). It runs on the single-file app build with the PuppetMaster kit's config:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
//   browser-check run Concepts/settings-scope/opus-5.5/tools/checks/feedback.check.mjs \
//     --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=$OUT/settings-scope-app.html
// --set only=strip|rows|shake|acct|head|where|detail|copy|always runs one part; --set looks=basic-dark,... narrows the looks
// (default Basic Dark, Retro Light and NieR Dark); --set lookShots=1 lists the review images under LOOK.
// `strip` opens the page with the review strip (settings-scope.html beside the app page, or --set strip=<path>); the
// account switch in `shake` is compared with bare PMConcept7 (Concepts/PMConcept7.html, or --set bare=<path>).
// "Full" is a 2560-wide window (the review strip's Full width is whatever window holds the frame).
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const want = (t, part) => !t.args.only || String(t.args.only).split(',').includes(part);
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
	'general.interaction.eli5-default': [['row', 'below'], 'Explain technical terms rewrites the descriptions on purpose']
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
	// the tab's own panel, once it has been drawn for this tab (a panel still labelled by the last tab is the last tab's)
	const panelNow = () => { const te = tabEl(); const pid = te && te.getAttribute('aria-controls'); const p = pid && [...rootNow().querySelectorAll(`[id="${pid}"]`)].find(vis); return p && p.getAttribute('aria-labelledby') === te.id ? p : null; };
	const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
	/* review A-r4 (where it stopped, fault a): no fixed wait. After a tab or a pick, wait until the condition holds and the
	   manager's detail panes have kept the same text and height for three frames in a row (4s at most) */
	const settled = async (ok) => {
		let last = null, same = 0; const t0 = performance.now();
		while (performance.now() - t0 < 4000) {
			await frame();
			if (ok && !ok()) { last = null; same = 0; continue; }
			const sig = [...rootNow().querySelectorAll('.pm51-detail-content')].filter((d) => d.getClientRects().length).map((d) => `${d.innerText.length}:${Math.round(d.getBoundingClientRect().height)}`).join(',');
			if (sig === last) { if (++same >= 3) return true; } else { same = 0; last = sig; }
		}
		return false;
	};
	const out = { n: 0, items: 0, bad: [], all: [], unsettled: [] };
	// the tab must be current and its own panel drawn first: until then the panes and picks are still the last tab's
	const tabOn = () => { const te = tabEl(); return !!te && te.getAttribute('aria-selected') === 'true' && !!panelNow(); };
	const openTab = async () => { window.PM12_KIMI.dispatchAction('pm51-tab', { manager, tab }); return settled(tabOn); };
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
	const picks = [...(panelNow() || rootNow()).querySelectorAll(sel)].filter((e) => vis(e) && e.dataset.id && (!only || name(e) === only)).map((e) => ({ id: e.dataset.id, name: name(e) }));
	if (!picks.length && !only) measure(mt, '');
	for (const p of picks) {
		const q = `${sel}[data-id="${CSS.escape(p.id)}"]`;
		// a pick can change the list (or leave the tab): the tab is opened again whenever this item isn't in its panel
		let b = (panelNow() || { querySelector: () => null }).querySelector(q);
		if (!b) { await openTab(); b = (panelNow() || { querySelector: () => null }).querySelector(q); }
		if (!b) { out.unsettled.push(`${mt} › ${p.name} (gone from the tab)`); continue; }
		b.click();
		const ok = await settled(() => { const nb = rootNow().querySelector(q); return !!nb && (nb.getAttribute('aria-current') === 'true' || nb.classList.contains('active')); });
		if (!ok) { out.unsettled.push(`${mt} › ${p.name}`); continue; }
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
		await t.check(`all ${all.n} rows: Everywhere, then ${'Computers or Devices'}, then Projects`, all.n > 800 && all.bad.length === 0, all.bad.slice(0, 6).join(' | '));
		await t.check(`${all.screen} screen rows list Devices with one plain line, and libraries are not among them`, all.screen > 10 && !all.devices.some((l) => /Your own themes|Sound library|Add a sound|Start custom themes/.test(l)), all.devices.join(', '));
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
			return { pat: [...e.querySelectorAll('[data-pat]')].map((r) => r.checked), where: [...e.querySelectorAll('[data-where]')].map((r) => r.value + ':' + r.checked), save: e.querySelector('[data-always-save]').getAttribute('aria-disabled'), note: !!e.querySelector('[data-k="noeverywhere"]'), covers: (e.querySelector('[data-k="covers"]') || {}).textContent || '', preview: (e.querySelector('[data-k="preview"]') || {}).textContent || '' };
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
			await frame.evaluate(() => { window.__psxLoad = setInterval(() => { const t0 = performance.now(); while (performance.now() - t0 < 70) { /* load */ } }, 90); });
			const seq = ['retro-dark', 'retro-light', 'glass-dark'];
			const run5 = await t.page.evaluate(async (seq) => {
				const sel = document.getElementById('look'), fr = document.getElementById('pm7');
				const painted = () => { const H = fr.contentDocument.documentElement, th = H.getAttribute('data-theme') || 'basic-dark'; return H.getAttribute('data-o55-nier') === 'on' ? 'nier-' + (/-light$/.test(th) ? 'light' : 'dark') : th; };
				const pick = (v) => { sel.disabled = false; sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true })); };
				const out = []; const t0 = performance.now(); let i = 0, nextAt = 0, settledAt = null;
				while (performance.now() - t0 < 40000) {
					const now = performance.now() - t0;
					if (i < seq.length && now >= nextAt) { pick(seq[i]); out.push({ t: Math.round(now), pick: seq[i] }); i++; nextAt = now + 1200; }
					out.push({ t: Math.round(now), sel: sel.value, dis: sel.disabled, painted: painted() });
					if (i >= seq.length && !sel.disabled && sel.value === painted() && painted() === seq[seq.length - 1]) { if (settledAt == null) settledAt = now; if (now - settledAt > 3000) break; } else settledAt = null;
					await new Promise((r) => setTimeout(r, 150));
				}
				return out;
			}, seq);
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
			await t.check('R3-5 under load: after the last pick the Look names the look painted (or, while greyed, the one asked for), never an older one for more than a moment, and it ends open on the last look picked, painted', stale.length === 0 && ends,
				(stale.slice(0, 5).join(' | ') || 'no stale sample') + ' · end: ' + samples.slice(-3).map((x) => `${x.t}:${x.sel}/${x.painted}${x.dis ? '/greyed' : ''}`).join(' '));
		}
		t.page.off('pageerror', onErr); t.page.off('console', onConsole);
		await t.check('no uncaught error and no console.error on the strip page', errors.length === 0, errors.join(' | '));
		await pic(t, 'strip-11-18', 'The strip page with Moments › 11.18 open, its caption and its sheet', null);
	});
}
