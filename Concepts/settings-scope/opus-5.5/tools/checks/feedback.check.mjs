// Jared's review of the settings-scope concept (2026-11-09, FEEDBACK.md items 3, 4, 8 and 11) and the guided-flows
// rows for this concept (GUIDED-FLOWS-CHECK "Changes for P": Copy settings 3.02-3.07, 3.12, 3.17 and Always allow
// 8.03-8.04). It runs on the single-file app build with the PuppetMaster kit's config:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
//   browser-check run Concepts/settings-scope/opus-5.5/tools/checks/feedback.check.mjs \
//     --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=$OUT/settings-scope-app.html
// --set only=strip|rows|shake|acct|head|where|copy|always runs one part; --set looks=basic-dark,... narrows the looks
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
		let sc = el.parentElement;
		while (sc && sc !== document.body) { const cs = getComputedStyle(sc); if (/(auto|scroll)/.test(cs.overflowY) && sc.scrollHeight > sc.clientHeight + 1) break; sc = sc.parentElement; }
		if (!sc || sc === document.body) return false;
		const sr = sc.getBoundingClientRect(), er = el.getBoundingClientRect();
		sc.scrollTop += block === 'start' ? er.top - sr.top - 8 : er.top - sr.top - (sr.height - er.height) / 2;
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
const TOGGLE = async (sel) => {
	const tg = document.querySelector(sel); if (!tg) return { missing: sel };
	window.__psxScrollTo(tg, 'center');
	await new Promise((r) => setTimeout(r, 600));
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
	tg.click();
	await new Promise((r) => setTimeout(r, 1600));
	go = false; po.disconnect();
	// the frames while the row the click landed in is still the page's own: a whole-page redraw replaces it, and what
	// follows is a new page, judged separately (rerender)
	// judged from the last frame before the click: anything that settled before it isn't the toggle's
	const first = Math.max(0, samples.findIndex((x) => x.t >= clickAt) - 1);
	const after = samples.slice(first);
	const rerender = after.findIndex((x) => !x.conn), live = rerender < 0 ? after : after.slice(0, rerender);
	const moved = (k, i) => live.some((s) => JSON.stringify(s[k] && (i == null ? s[k] : s[k][i])) !== JSON.stringify(live[0][k] && (i == null ? live[0][k] : live[0][k][i])));
	const chs = live.map((x) => x.ch); const flips = chs.filter((v, i) => i && v !== chs[i - 1]).length;
	return { id: row.id, clickAt, frames: samples.length, liveFrames: live.length, rerenderAt: rerender < 0 ? null : after[rerender].t, rowYs: live.map((x) => [x.t, x.row && x.row[1]]).filter((x, i, a) => !i || x[1] !== a[i - 1][1]), toggleX: moved('tg', 0), endX: moved('end', 0), endW: moved('end', 2), rowY: moved('row', 1), rowH: moved('row', 3), nextY: moved('next', 1), bar: moved('bar'), changedFlips: flips, maxChanged: Math.max(...chs), bareEnds: Math.max(...live.map((x) => x.q)), shifts };
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

		await t.viewport(1920, 1080);
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

	/* ------------------------------------------------------------------ guided flows 8.03-8.04: Always allow */
	if (want(t, 'always')) await t.step('guided flows 8.03-8.04: Always allow chooses the pattern and the place', async () => {
		await reset(t);
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); await window.PSX.command({ cmd: 'moment', id: '11.18' }); });
		await settle(t, 800);
		const sh = '.psx-sheet';
		const ed = async (id) => run(t, (i) => {
			const e = document.querySelector(`${'.psx-sheet'} [data-always="${i}"]`); if (!e) return null;
			return { pat: [...e.querySelectorAll('[data-pat]')].map((r) => r.checked), where: [...e.querySelectorAll('[data-where]')].map((r) => r.value + ':' + r.checked), save: e.querySelector('[data-always-save]').getAttribute('aria-disabled'), note: !!e.querySelector('[data-k="noeverywhere"]'), preview: (e.querySelector('[data-k="preview"]') || {}).textContent || '' };
		}, id);
		await t.root.locator(`${sh} [data-ask="test"][data-a="always"]`).click(); await settle(t, 300);
		let e = await ed('test');
		await t.check('8.03: Always allow opens the pattern and the place, nothing chosen', !!e && e.pat.every((x) => !x) && e.where.every((x) => /:false$/.test(x)) && e.save === 'true', JSON.stringify(e));
		await t.check('8.04: npm test is not about one computer, so Everywhere is offered', e.where.some((x) => /^everywhere/.test(x)) && !e.note, JSON.stringify(e));
		await t.root.locator(`${sh} [data-always="test"] [data-pat="1"]`).check(); await settle(t, 250);
		e = await ed('test');
		await t.check('8.03: the chosen pattern shows what it matches and what still asks', /Matches:.*npm test -- --watch/.test(e.preview) && /Still asks:.*npm run build/.test(e.preview), e.preview);
		await t.root.locator(`${sh} [data-always="test"] [data-where="project"]`).check(); await settle(t, 250);
		await pic(t, 'always-editor', 'Always allow for npm test: the pattern npm test * and In this project chosen by hand, with what it matches', '.psx-sheet');
		await t.root.locator(`${sh} [data-always-save="test"]`).click(); await settle(t, 300);
		await t.check('the rule is written with the chosen pattern and place', () => run(t, () => { const st = window.PSX.approvals.st; return st.rules.length === 1 && st.rules[0].pattern === 'npm test *' && st.rules[0].where === 'Always in loom'; }));
		// a later run: the rule allows every npm test it matches, without asking
		await run(t, () => window.PSX.approvals.draw()); await settle(t, 300);
		await t.check('a later run: your Always rule allows both npm test steps without asking', () => run(t, () => { const tx = document.querySelector('.psx-sheet').innerText; return /Run npm test\n[\s\S]*?Allowed by your rule/.test(tx) && /Run npm test again, after the fix[\s\S]*?Allowed by your rule/.test(tx); }));
		for (const id of ['release', 'outside']) {
			await t.root.locator(`${sh} [data-ask="${id}"][data-a="always"]`).click(); await settle(t, 300);
			e = await ed(id);
			await t.check(`8.04: ${id === 'release' ? 'a script by its path' : 'a folder'} never offers Everywhere, and says why`, !!e && !e.where.some((x) => /^everywhere/.test(x)) && e.note, JSON.stringify(e));
			if (id === 'release') await pic(t, 'always-host', 'Always allow for ./scripts/release.sh: Everywhere is not offered, with the reason', '.psx-sheet');
			await t.root.locator(`${sh} [data-always-cancel="${id}"]`).click(); await settle(t, 200);
		}
		// review A-r1 finding 6: your own pattern on the release step keeps Everywhere hidden, and a bare * is broad
		await t.root.locator(`${sh} [data-ask="release"][data-a="always"]`).click(); await settle(t, 300);
		await t.root.locator(`${sh} [data-always="release"] [data-pat="own"]`).check(); await settle(t, 250);
		await t.root.locator(`${sh} [data-always="release"] [data-pat-own]`).fill('*'); await settle(t, 300);
		e = await ed('release');
		await t.check('8.04: your own pattern * on the release step still never offers Everywhere, and says why', !!e && !e.where.some((x) => /^everywhere/.test(x)) && e.note, JSON.stringify(e));
		await t.check('8.03: * is flagged as broad', /This one is broad/.test(e.preview), e.preview);
		await pic(t, 'always-own-star', 'Always allow for the release script with your own pattern *: Everywhere stays hidden and * is flagged broad', '.psx-sheet');
		await t.root.locator(`${sh} [data-always-cancel="release"]`).click(); await settle(t, 200);
		const units = await run(t, () => {
			const A = window.PSX.approvals, test = { cmd: 'npm test', path: false, patterns: [['npm test'], ['npm test *'], ['npm *']] }, rel = { cmd: './scripts/release.sh v1.4.0', path: true };
			return { progLoc: A.hostDependent('/usr/local/bin/npm test', test), npmNot: !A.hostDependent('npm test *', test), relStar: A.hostDependent('*', rel),
				star: A.isBroad('*', test), bash: A.isBroad('bash -c *', test), py: A.isBroad('python3 *', test), node: A.isBroad('node *', test), npmStar: A.isBroad('npm *', test), narrow: !A.isBroad('npm test *', test),
				// review A-r2 N3: any command followed only by *
				rm: A.isBroad('rm -rf *', test), sudo: A.isBroad('sudo *', test), npx: A.isBroad('npx *', test), git: A.isBroad('git *', test), read: A.isBroad('read *', test), narrow2: !A.isBroad('git push origin *', test),
				readHost: A.hostDependent('read *', test), rmHost: A.hostDependent('rm -rf *', test), gitNotHost: !A.hostDependent('git *', test) };
		});
		await t.check('8.04: host-dependence comes from the step’s target and from the pattern (a program’s location yes, npm test * no, * on the release step yes)', units.progLoc && units.npmNot && units.relStar, JSON.stringify(units));
		await t.check('8.03: broad = a bare *, a shell or an interpreter followed by *, or the broad suggestion; npm test * is not', units.star && units.bash && units.py && units.node && units.npmStar && units.narrow, JSON.stringify(units));
		await t.check('8.03: any command followed only by * is broad (rm -rf *, sudo *, npx *, git *, read *); git push origin * is not', units.rm && units.sudo && units.npx && units.git && units.read && units.narrow2, JSON.stringify(units));
		await t.check('8.04: a rule about files (read *, rm -rf *) is host-dependent, so it never offers Everywhere; git * is not', units.readHost && units.rmHost && units.gitNotHost, JSON.stringify(units));
		/* Permissions_System 6.1 (deny, once, for session, always), PS-113 and §2 Rules 3 (a session answer is keyed to
		   the run and the run mode), §3.3 (a path outside the project still asks in YOLO). A fresh moment, no rules */
		await run(t, async () => { window.PSX.closeSheets(); await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); await window.PSX.command({ cmd: 'moment', id: '11.18' }); }); await settle(t, 800);
		// on the page: your own rm -rf * on the npm test step reads broad and hides Everywhere
		const trig = t.root.locator(`${sh} [data-ask="test2"][data-a="always"]`);
		if (await trig.count()) {
			await trig.click(); await settle(t, 300);
			await t.root.locator(`${sh} [data-always="test2"] [data-pat="own"]`).check(); await settle(t, 250);
			await t.root.locator(`${sh} [data-always="test2"] [data-pat-own]`).fill('rm -rf *'); await settle(t, 300);
			const rr = await ed('test2');
			await t.check('your own rm -rf * reads broad and offers no Everywhere', !!rr && /This one is broad/.test(rr.preview) && !rr.where.some((x) => /^everywhere/.test(x)) && rr.note, JSON.stringify(rr));
			await t.root.locator(`${sh} [data-always-cancel="test2"]`).click(); await settle(t, 200);
		} else await t.check('the npm test repeat offers Always allow', false, 'no Always allow… on test2');
		await t.root.locator(`${sh} [data-ask="test"][data-a="session"]`).click(); await settle(t, 300);
		const s1 = await run(t, () => { const tx = document.querySelector('.psx-sheet').innerText, st = window.PSX.approvals.st; return { test: /Run npm test\n[\s\S]*?Allowed for this session/.test(tx), again: /Run npm test again, after the fix[\s\S]*?Allowed for this session[\s\S]*?earlier in this run, so it didn’t ask again/.test(tx), words: /For the rest of this run in Regular; a new run or another run mode asks again\. No rule is kept\./.test(tx), doubled: /Allowed\. Allowed/.test(tx), rules: st.rules.length }; });
		await t.check('For this session covers the same request later in this run, and makes no rule', s1.test && s1.again && s1.words && s1.rules === 0, JSON.stringify(s1));
		await t.check('the session line doesn’t repeat itself (no “Allowed. Allowed”)', !s1.doubled, JSON.stringify(s1));
		await t.root.locator(`${sh} [data-ask="outside"][data-a="session"]`).click(); await settle(t, 300);
		await t.check('the outside folder can be allowed for this session in Regular, with its own report line', () => run(t, () => /Read a folder outside loom[\s\S]*?Allowed for this session[\s\S]*?Read ~\/Documents\/taxes: 3 files\./.test(document.querySelector('.psx-sheet').innerText)));
		// a switch of Run mode is a new run: the session answers end, and YOLO still asks for the outside folder
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'yolo' }); }); await settle(t, 500);
		const s2 = await run(t, () => { const tx = document.querySelector('.psx-sheet').innerText, st = window.PSX.approvals.st; return { yoloAsks: /Read a folder outside loom[\s\S]*?YOLO still asks: A path outside the project/.test(tx) && !!document.querySelector('.psx-sheet [data-ask="outside"][data-a="once"]'), sessionGone: st.session.length === 0, noCarry: !/Allowed for this session/.test(tx) }; });
		await t.check('after a switch to YOLO the outside folder asks again (PS-113, §3.3) and no session answer carries over', s2.yoloAsks && s2.sessionGone && s2.noCarry, JSON.stringify(s2));
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); }); await settle(t, 500);
		const s3 = await run(t, () => ({ outside: !!document.querySelector('.psx-sheet [data-ask="outside"][data-a="once"]'), test: !!document.querySelector('.psx-sheet [data-ask="test"][data-a="once"]'), again: !!document.querySelector('.psx-sheet [data-ask="test2"][data-a="once"]') }));
		await t.check('back in Regular it is a new run: npm test, its repeat and the outside folder ask again', s3.outside && s3.test && s3.again, JSON.stringify(s3));
		await t.root.locator(`${sh} [data-ask="test"][data-a="once"]`).click(); await settle(t, 300);
		await t.check('Allow once covers only that step: the repeat still asks', () => run(t, () => !!document.querySelector('.psx-sheet [data-ask="test2"][data-a="once"]')));
		await run(t, () => window.PSX.approvals.draw()); await settle(t, 300);
		await t.check('Run it again is a new run: nothing is allowed from the last one', () => run(t, () => !!document.querySelector('.psx-sheet [data-ask="test"][data-a="once"]') && !!document.querySelector('.psx-sheet [data-ask="outside"][data-a="once"]')));
		await t.check('a deletion on the remote is answered one at a time (no For this session)', () => run(t, () => !document.querySelector('.psx-sheet [data-ask="delete"][data-a="session"]') && !!document.querySelector('.psx-sheet [data-ask="delete"][data-a="once"]')));
		// YOLO: ordinary push and publish run without asking, and no Always rule is made
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'yolo' }); }); await settle(t, 500);
		const y = await run(t, () => { const s = document.querySelector('.psx-sheet'); const tx = s ? s.innerText : ''; return { push: /Push to GitHub[\s\S]*Ran, not asked/.test(tx), publish: /Publish the image[\s\S]*Ran, not asked/.test(tx), rules: window.PSX.approvals.st.rules.length, none: /None made/.test(tx) }; });
		await t.check('8.05-8.06: YOLO pushes and publishes without asking and makes no Always rule', y.push && y.publish && y.rules === 0, JSON.stringify(y));
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
		await t.page.click('#compareopts'); await settle(t, 300);
		await t.check('Compare options opens its row', () => t.page.evaluate(() => !document.getElementById('comparebar').hidden));
		await t.page.selectOption('#width', '860');
		// the frame animates its width (0.2s): wait for it to arrive rather than for a fixed time
		await t.until('Window width sets the frame to 860px', () => Math.round(document.getElementById('pm7').getBoundingClientRect().width) === 860, null, { timeout: 5000 });
		t.page.off('pageerror', onErr); t.page.off('console', onConsole);
		await t.check('no uncaught error and no console.error on the strip page', errors.length === 0, errors.join(' | '));
		await pic(t, 'strip-11-18', 'The strip page with Moments › 11.18 open, its caption and its sheet', null);
	});
}
