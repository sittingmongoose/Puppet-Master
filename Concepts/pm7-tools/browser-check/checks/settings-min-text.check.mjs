// FO-159 (Jared, 2026-11-11: "B, use 11 px like Usage"): Settings' 10.5 px small text — choice labels, small
// buttons, segmented options, chips, key caps, row and roster meta, the manager tabs, the inspector's small
// lines — is 11 px, the size Usage's quiet text uses. Those declarations live in
// base/style/pm4-settings-css.css, base/style/pm51-settings-refresh.css, base/script/pm4-settings-js.js,
// src/settings/** and the managers' own <style> blocks; every one now reads 11 px and nothing else about them
// changed.
//
// Three parts, all on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one):
//   size  — every control this item resized, on each chapter and each manager tab, in all ten looks, reads 11 px
//          or more. Settings also paints older 9–10.3 px micro-labels the item does not name (the page index's
//          links, the rail's chapter headings and descriptions, key caps, side-card notes and health, table
//          heads, tooltips, form help): they are counted and logged under NOTE, never silently dropped, so the
//          residue is on the record. --set strict=1 asserts them too (the item's own sentence, "no visible
//          Settings text below 11 px", lands there until someone owns that call).
//   cut   — the controls whose text this item grew still hold it: no word is cut by a box that clips its own
//          overflow (hidden, clip, scroll: its scroll area against its client box, and the text's painted end
//          past that box).
//   lines — every element whose computed font size went 10.5 px -> 11 px keeps the line count it drew on main,
//          on every chapter, every workspace tab and every manager tab, in all ten looks and at 740x900,
//          860x900, 1280x500 and 1920x1080 (FO-159 round 2; round 1 changed the size and let Settings' 860 px
//          'Uncaptured state' value gain a second line). The baseline is recorded once from a build of the
//          baseline commit with --set record=<json> (run it per surface; cells merge), and compared with
//          --set lineBaseline=<json>; checks/settings-min-text.lines.json, beside this file, is that recording
//          and is used when no path is given. It holds each 10.5 px element whose fullest line was at least 90%
//          of its box (a shorter line cannot gain one: its own content still fits, so the same breaks stay
//          feasible at 11 px) and it is keyed by tag and words, not by a DOM path, because a tab swap moves
//          paths but not the words a person reads; two elements drawing the same words are compared by the
//          fuller line count on each side. Sections past the second are content-visibility:auto, so the check
//          lays all of them out (a measured line is the same wherever the scroller sits). --set out=<json>
//          keeps the whole comparison: every cell's counters and every element that gained a line.
// A control that is built to ellipsize its own text (text-overflow: ellipsis: resource names and meta) is
// exempt from the cut rule and still held to its line count.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-min-text.check.mjs --set page=<build>
// --set only=size|cut|lines, --set looks=a,b,c, --set fitLooks=a,b,c, --set widths=740x900,860x900,1280x500,
// --set strict=1, --set list=1 (logs every sub-11 px element and asserts no size),
// --set lineBaseline=<main-lines.json> [--set record=<out.json>] [--set out=<comparison.json>]
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[740, 900], [860, 900], [1280, 500]];
const FIT_LOOKS = ['basic-dark', 'retro-light', 'nier-dark'];
/* FO-159 round 2's line matrix: every look, and the fourth size the 1920 desktop paints at. */
const LINE_SIZES = [[740, 900], [860, 900], [1280, 500], [1920, 1080]];

/* A hook for pinning an individual pre-existing micro-label rule by selector; empty today, because the residue
   is reported as a whole under NOTE rather than excused rule by rule. Matched with Element.matches. */
const LEGACY = [];

/* Every selector whose declared size went 10.5 px -> 11 px in this item: the controls part cut measures. */
const AFFECTED = [
	'#panel-settings .search-result-meta',
	'#panel-settings .workspace-block .manager-page > .embedded-page-actions .btn',
	'#panel-settings .workspace-block .manager-page > .embedded-page-actions .icon-btn',
	'#panel-settings .btn',
	'#panel-settings .btn.small',
	'#panel-settings .badge',
	'#panel-settings .home-panel-meta',
	'#panel-settings .setup-meta',
	'#panel-settings .domain-card-desc',
	'#panel-settings .setting-description',
	'#panel-settings .segmented button',
	'#panel-settings .stepper-value',
	'#panel-settings .chip-select button',
	'#panel-settings .reorder-item',
	'#panel-settings .detail-status',
	'#panel-settings .related-links button',
	'#panel-settings .manager-tab',
	'#panel-settings .resource-row-name',
	'#panel-settings .resource-row-meta',
	'#panel-settings .resource-sub',
	'#panel-settings .stat-label',
	'#panel-settings .stat-note',
	'#panel-settings .route-card-copy span',
	'#panel-settings .sound-copy strong',
	'#panel-settings .sound-copy span',
	'#panel-settings .event-cell',
	'#panel-settings .panel-subtitle',
	'#panel-settings .panel-head-kicker',
	'#panel-settings .info-key',
	'#panel-settings .info-value',
	'#panel-settings .alert-strip',
	'#panel-settings .data-table td',
	'#panel-settings .route-desc',
	'#panel-settings .route-primary-value',
	'#panel-settings .workflow-number',
	'#panel-settings .workflow-title',
	'#panel-settings .filter-chip',
	'#panel-settings .prompt-box',
	'#panel-settings .dialog-sub',
	'#panel-settings .form-label',
	'#panel-settings .check-row',
	'#panel-settings .menu-item',
	'#panel-settings .toast-title',
	'#panel-settings .toast-message',
	'#panel-settings .details-btn',
	'#panel-settings .pm51-kbd',
	'#panel-settings .pm51-tech-inline',
	'#panel-settings .pm51-roster .roster-title',
	'#panel-settings .pm51-roster .resource-row-meta .pm51-status',
	'#panel-settings .pm51-hero-eyebrow',
	'#panel-settings .pm51-hero-facts dt',
	'#panel-settings .pm51-meter-note',
	'#panel-settings .pm51-commands-ph code',
	'#panel-settings .o55-changed',
	'#panel-settings .o55-risk',
	':is(#panel-settings, .o55nc-host) .o55nc-preset small',
	':is(#panel-settings, .o55nc-host) .o55nc-pv-dialog p',
	':is(#panel-settings, .o55nc-host) .o55nc-ghead > span',
	'.o55nc-host .o55nc .btn',
	'html[data-o55-nier] .o55nc-pop-eye',
	'html[data-o55-nier-parts~="headers"] .o55nc-pop-foot .o55nc-pop-done',
	'#panel-settings .o55-roster-group > span',
	'.o55-pick-item .o55-pick-copy small',
	'#panel-settings .o55g-recap-title',
];

/* Every visible word under Settings: its own text nodes (or a field's value/placeholder), the size it is painted
   at, and which element it belongs to. `small` is every word under 11 px that is not a documented legacy
   micro-label; `rescoped` is the part of it that this item resized (a control matching AFFECTED). Self-contained:
   serialized into the page alone. */
const SCAN = ([legacy, affected]) => {
	const roots = ['#pm-settings-root', '#pm-settings-portals', '#panel-settings']
		.flatMap((sel) => [...document.querySelectorAll(sel)]);
	const seen = new Set();
	const vis = (el) => {
		// a display:none ancestor has no client rects either, so the rect test already covers it
		if (!el.getClientRects().length) return false;
		if (el.closest('[inert], [aria-hidden="true"]')) return false;
		return getComputedStyle(el).visibility !== 'hidden';
	};
	const desc = (el) => {
		const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
		const text = (el.matches('input, textarea, select') ? `${el.value || ''} ${el.getAttribute('placeholder') || ''}` : el.textContent).replace(/\s+/g, ' ').trim().slice(0, 40);
		return `${el.tagName.toLowerCase()}${cls} "${text}"`;
	};
	const match = (el, sels) => sels.some((sel) => { try { return el.matches(sel); } catch (e) { return false; } });
	const out = { small: [], legacy: [], rescoped: [], seen: 0 };
	for (const root of roots) {
		for (const el of root.querySelectorAll('*')) {
			if (seen.has(el) || el.closest('[inert], [aria-hidden="true"]')) continue;
			seen.add(el);
			const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
			const field = el.matches('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select');
			if (!own && !field) continue;
			if (!vis(el)) continue;
			const fs = parseFloat(getComputedStyle(el).fontSize);
			out.seen++;
			if (fs >= 11) continue;
			const row = `${desc(el)} ${fs}px`;
			if (match(el, legacy)) out.legacy.push(row);
			else {
				out.small.push(row);
				if (match(el, affected)) out.rescoped.push(row);
			}
		}
	}
	return out;
};

/* The controls whose text this item grew: does each still hold its words inside its own box. Self-contained:
   serialized into the page alone. A control that lets its text show (overflow visible) is not cutting it. */
const CUT = ([affected]) => {
	const vis = (el) => {
		if (!el.getClientRects().length) return false;
		if (el.closest('[inert], [aria-hidden="true"]')) return false;
		return getComputedStyle(el).visibility !== 'hidden';
	};
	/* The painted rects of the element's own words, never its icons: a glyph beside a label is a different box on the
	   same line, and counting it as a line made every icon button read as two. */
	const textRects = (el) => {
		const out = [];
		const walk = (n) => {
			if (n.nodeType === 3) {
				if (!n.textContent.trim()) return;
				const r = document.createRange();
				r.selectNodeContents(n);
				out.push(...r.getClientRects());
			} else if (n.nodeType === 1) for (const c of n.childNodes) walk(c);
		};
		walk(el);
		return out.filter((b) => b.width > 0.5 && b.height > 0.5);
	};
	const out = { cut: [], sampled: 0, ellipsis: 0 };
	const seen = new Set();
	for (const sel of affected) {
		for (const el of document.querySelectorAll(sel)) {
			if (seen.has(el) || !el.getClientRects().length) continue;
			seen.add(el);
			if (!vis(el)) continue;
			const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
			if (!text) continue;
			out.sampled++;
			const cs = getComputedStyle(el);
			const b = el.getBoundingClientRect();
			const padL = b.left + (parseFloat(cs.borderLeftWidth) || 0), padR = b.right - (parseFloat(cs.borderRightWidth) || 0);
			const padB = b.bottom - (parseFloat(cs.borderBottomWidth) || 0);
			const label = `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''} "${text.slice(0, 32)}"`;
			const rects = textRects(el);
			if (!rects.length) continue;
			const left = Math.min(...rects.map((r) => r.left)), right = Math.max(...rects.map((r) => r.right));
			const bottom = Math.max(...rects.map((r) => r.bottom));
			const ellipsis = cs.textOverflow === 'ellipsis';
			if (ellipsis) out.ellipsis++;
			const clipsX = cs.overflowX !== 'visible', clipsY = cs.overflowY !== 'visible';
			const scrolls = clipsX && el.scrollWidth > el.clientWidth + 1;
			const tall = clipsY && el.scrollHeight > el.clientHeight + 1;
			const past = (clipsX && right > padR + 1) || (clipsY && bottom > padB + 1);
			if (!ellipsis && (past || scrolls || tall)) out.cut.push(`${label} text ${Math.round(left)}..${Math.round(right)} in ${Math.round(padL)}..${Math.round(padR)}${scrolls ? ` scrollX ${el.scrollWidth}>${el.clientWidth}` : ''}${tall ? ` scrollY ${el.scrollHeight}>${el.clientHeight}` : ''}`);
		}
	}
	return out;
};

/* Lay out every Settings section: the level below the second is content-visibility:auto (29-navigation-motion),
   so an unscrolled page reports no boxes for it and a pass over the document would measure only its first two
   sections. Layout, not paint, is what a line count is read from. Self-contained: serialized into the page alone. */
const LAYOUT_ALL = () => {
	const id = 'pm-line-probe-layout';
	if (document.getElementById(id)) return;
	const s = document.createElement('style');
	s.id = id;
	s.textContent = '#panel-settings .workspace-block-body > .settings-section { content-visibility: visible !important; contain-intrinsic-size: auto !important; }';
	document.head.appendChild(s);
};

/* Every element that draws its own words, the lines it draws them on, the size they are painted at, and (for the
   baseline) how full its fullest line was against the box's content width. Self-contained: serialized into the
   page alone. `minRatio` keeps a line that could gain a line when its glyphs grow 4.8% (10.5 -> 11 px): a line
   shorter than that cannot, because the same breaks stay feasible. */
const LINES = ([minRatio, only, ws]) => {
	const want = only && only.length ? new Set(only) : null;
	/* The domain page keeps every workspace as a block; only the open one is mounted. Measuring the whole panel
	   would mix the others' headers (and any block a previous state left mounted) into this state's rows. */
	const stage = document.getElementById('workspace-stage');
	const root = (ws && stage && stage.querySelector(`[data-continuous-workspace-body="${ws}"]`)) || stage || document.getElementById('panel-settings');
	if (!root) return { rows: [] };
	const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
	const rectsOf = (el) => {
		const out = [];
		for (const n of el.childNodes) {
			if (n.nodeType !== 3 || !n.textContent.trim()) continue;
			const r = document.createRange();
			r.selectNodeContents(n);
			for (const b of r.getClientRects()) if (b.width > 0.5 && b.height > 0.5) out.push(b);
		}
		return out;
	};
	const linesOf = (rects) => {
		const tops = rects.map((r) => r.top).sort((a, b) => a - b);
		let n = 0, last = -1e9;
		for (const y of tops) if (y - last > 1.5) { n++; last = y; }
		return n;
	};
	const rows = [];
	for (const el of root.querySelectorAll('*')) {
		if (el.closest('[inert], [aria-hidden="true"]')) continue;
		const text = ownText(el);
		if (!text) continue;
		if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
		const rects = rectsOf(el);
		if (!rects.length) continue;
		const cs = getComputedStyle(el);
		const width = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
		const fullest = Math.max(...rects.map((r) => r.width));
		const lines = linesOf(rects);
		/* The key is the element's own tag and words, never a DOM path: one wrapper more or less in a state moved
		   every path in round 1's walk, and the words a person reads are what this check is about. */
		const p = `${el.tagName.toLowerCase()}|${text.slice(0, 90)}`;
		if (want && !want.has(p)) continue;
		rows.push({ p, t: text.slice(0, 90), f: +parseFloat(cs.fontSize).toFixed(2), n: lines, w: +width.toFixed(1), r: width > 0 ? +(fullest / width).toFixed(3) : 0 });
	}
	return { rows };
};

const settle = (t, ms = 350) => t.page.waitForTimeout(ms);

/* The look is set the way a person sets it — the Theme and Light or dark rows' own dropdowns — because the
   Settings engine re-applies the saved pair on every render, so a look painted without saving is reset. The rows
   live on General, and the walk above ends on whichever chapter it visited last. */
async function setLookBySetting(t, f, look) {
	const [family, mode] = look.split('-');
	/* General holds the Theme and Light or dark rows. It is opened by its own id: below a 720 px host the rail is an
	   off-canvas drawer, so a press on its chapter link is swallowed and the look never changed (the 740 px cells
	   painted basic-dark under every name). */
	await f.evaluate(() => window.PM51.go('general', 'app-input'));
	await f.waitForFunction(() => !!document.querySelector('select[data-setting="general.visual.theme"]'), null, { timeout: 15000 }).catch(() => {});
	await t.page.waitForTimeout(600);
	for (const [setting, value] of [
		['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)],
		['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark'],
	]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
		if (!(await trigger.count())) return false;
		const labels = await f.locator(`select[data-setting="${setting}"] option`).allTextContents();
		const name = labels.includes(value) ? value : `${value} ${mode === 'light' ? 'Light' : 'Dark'}`;
		await trigger.first().scrollIntoViewIfNeeded();
		await trigger.first().click();
		await f.getByRole('option', { name, exact: true }).click({ timeout: 8000 });
		await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
		await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		await t.page.waitForTimeout(400);
	}
	await f.waitForFunction(([fam, m]) => {
		const theme = document.documentElement.getAttribute('data-theme') || '';
		const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier');
		return fam === 'nier' ? nier && theme.endsWith('-' + m) : !nier && theme === fam + '-' + m;
	}, [family, mode], { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(500);
}
async function guardLook(t, f, look, where) {
	const [family, mode] = look.split('-');
	const got = await f.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme') || '', nier: !!(window.PM_NIER && PM_NIER.on()) || (document.documentElement.getAttribute('data-theme') || '').startsWith('nier') }));
	const ok = family === 'nier' ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === look;
	await t.check(`${where}: measured under ${look} (painted ${got.theme}${got.nier ? ', NieR on' : ''})`, ok, 'Settings rendered a different look than the cell names');
	return ok;
}

/* Every chapter on the rail, every workspace on it and every manager tab inside one: Settings mounts a chapter's
   page lazily, so the text only exists once it is opened. A workspace is reached by its own tab (FO-159 round 2:
   round 1's walk visited only the chapter's default workspace, so most manager tabs were never measured). Returns
   the states visited and measures each after visit(). */
/* A tab press morphs the old body into the new one (o55Morph): until it lands the page holds two `.manager-body`
   trees, so a DOM path read now names a clone and a line count belongs to neither state. Wait for the morph to
   leave one body and the pressed tab to be the active one before anything is measured. */
async function settled(f, ws, tabId) {
	await f.waitForFunction(([w, id]) => {
		if (document.querySelector('.tab-swap-a, .tab-swap-b')) return false;
		const body = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
		const page = body && body.querySelector('.pm51-mgr');
		if (!page) return false;
		const bodies = page.querySelectorAll(':scope > .manager-body');
		if (bodies.length !== 1) return false;
		if (!id) return true;
		const active = page.querySelector(':scope > .pm51-tabs .manager-tab.active');
		return !!active && active.getAttribute('data-tab') === id;
	}, [ws, tabId || ''], { timeout: 4000 }).catch(() => {});
	// the morphed body's own layout, then two equal reads: a page that re-renders a strip after its first paint
	// (the sound-style segmented control does) would otherwise be measured in the narrower first state
	await f.waitForFunction((w) => {
		const b = (w && document.querySelector(`[data-continuous-workspace-body="${w}"]`)) || document.getElementById('workspace-stage');
		if (!b) return false;
		const sig = `${b.textContent.length}:${b.getBoundingClientRect().height.toFixed(1)}:${b.querySelectorAll('*').length}`;
		const prev = window.__pmLineSig;
		window.__pmLineSig = sig;
		return prev === sig;
	}, ws, { polling: 'raf', timeout: 4000 }).catch(() => {});
}

async function walkSettings(t, f, visit) {
	const states = [];
	const once = async (name, ws) => { states.push(await visit(name, ws)); };
	const home = f.locator('#pm-settings-root [data-action="home"]').first();
	if (await home.count()) { await home.click().catch(() => {}); await settle(t, 220); await once('home', ''); }
	const domains = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .domain-link[data-domain]')].map((el) => el.getAttribute('data-domain')));
	for (const domain of [...new Set(domains)]) {
		const link = f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).first();
		if (!(await link.count())) continue;
		/* The chapter is opened by its own id, not by a press: below a 720 px host the rail is an off-canvas drawer
		   and the press is swallowed, which left the 740 px cells measuring one chapter's workspaces under the
		   next chapter's name. */
		await f.evaluate((d) => window.PM51.go(d, '__domain__'), domain);
		await settle(t, 300);
		const label = ((await link.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 28) || domain;
		const workspaces = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .workspace-tab[data-workspace]')].map((el) => ({ id: el.getAttribute('data-workspace'), label: el.textContent.trim() })));
		for (const ws of workspaces) {
			await f.evaluate(([d, w]) => window.PM51.go(d, w), [domain, ws.id]);
			await f.waitForFunction((w) => { const b = document.querySelector(`[data-continuous-workspace-body="${w}"]`); return !!b && b.getAttribute('data-workspace-mounted') === 'true'; }, ws.id, { timeout: 15000 }).catch(() => {});
			await settled(f, ws.id);
			await settle(t, 120);
			const where = `${label} › ${ws.label}`;
			await once(where, ws.id);
			const tabs = await f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .manager-tab[data-tab]`)].filter((b) => b.getClientRects().length).map((b) => ({ id: b.getAttribute('data-tab'), label: b.textContent.trim() })), ws.id);
			for (const tab of tabs) {
				const btn = f.locator(`[data-continuous-workspace-body="${ws.id}"] .manager-tab[data-tab="${tab.id}"]`).first();
				if (!(await btn.count()) || !(await btn.isVisible().catch(() => false))) continue;
				await btn.click().catch(() => {});
				await settled(f, ws.id, tab.id);
				await settle(t, 120);
				await once(`${where} › ${tab.label}`, ws.id);
			}
		}
	}
	return states;
}

async function openSettings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}

const key = (surface, look, [w, h]) => `${surface}|${look}|${w}x${h}`;

/* The line baseline: for every state, the rows whose fullest line was at least `ratio` of its box (a shorter line
   cannot gain a line when the glyphs grow 4.8%) or that already drew more than one line. */
function writeBaseline(path, cells, meta) {
	fs.writeFileSync(path, JSON.stringify({ v: 1, ...meta, cells }));
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-159 Settings text is 11 px or more (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const want = (part) => !t.args.only || String(t.args.only).split(',').map((s) => s.trim()).includes(part);
		const list = !!t.args.list;
		const f = await openSettings(t, surface);
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await t.settle();
		const residue = new Map();
		const scan = async (where) => {
			const r = await f.evaluate(SCAN, [LEGACY, AFFECTED]);
			if (r.seen === 0) return { where, seen: 0 };
			for (const x of r.small) {
				const k = x.replace(/"[^"]*"/, '').replace(/\s+/g, ' ').trim();
				residue.set(k, (residue.get(k) || 0) + 1);
			}
			if (list) { t.log(`${where}: ${r.seen} words, ${r.small.length} under 11 px (${r.rescoped.length} of them FO-159's)`); r.small.forEach((x) => t.log(`  under 11: ${x}`)); }
			return { where, seen: r.seen, small: r.small, rescoped: r.rescoped };
		};
		if (want('size')) {
			let smallAll = 0;
			for (const look of looks) {
				await t.step(look, async () => {
					await setLookBySetting(t, f, look);
					const ok = await guardLook(t, f, look, `${look}`);
					const pages = await walkSettings(t, f, (where) => scan(`${look} · ${where}`));
					const bad = [];
					let words = 0;
					for (const p of pages) {
						if (!p || !p.seen) continue;
						words += p.seen;
						smallAll += (p.small || []).length;
						bad.push(...(p.rescoped || []).map((x) => `${p.where}: ${x}`));
					}
					await t.check(`${look}: the ${words > 0 ? 'controls FO-159 resized' : 'text'} are 11 px or more (${words} words on ${pages.length} pages)`, words > 0 && (list || bad.length === 0), bad.slice(0, 5).join(' | ') || 'nothing measured');
					if (!ok) return;
					t.log(`${look}: ${bad.length} of the item's controls under 11 px`);
				});
			}
			await t.check(`the ${looks.length} looks were measured`, looks.length === 10 || !!t.args.looks, `${looks.length}`);
			/* The rendered walk sees the pages a person can open. This reads the built page's own rules instead, so a
			   10.5 px declaration is caught even in a panel, picker or look the walk never opened: Settings is every
			   rule whose selector names it (or a settings-only piece: the NieR chips, the picker, the inspector, the
			   setup recap, the row badges). */
			const tenHalf = await f.evaluate(() => {
				const near = (sel) => /panel-settings|pm-settings-root|pm51-|o55-pick-|o55-insp-|o55g-|\.o55-changed|\.o55-risk/.test(sel || '');
				const bad = [];
				const walk = (list) => {
					for (const r of list) {
						if (r.cssRules) walk(r.cssRules);
						const sel = r.selectorText;
						if (!sel || !r.style) continue;
						const fs = r.style.fontSize || '', f = r.style.font || '';
						if (/^10\.5px$/.test(fs) || /(^|[\s/])10\.5px([\s/]|$)/.test(f)) if (near(sel)) bad.push(`${sel.slice(0, 70)} { ${fs || f} }`);
					}
				};
				for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch (e) { continue; } walk(rules); }
				return bad;
			});
			await t.check(`no Settings rule in the built page declares 10.5 px (${tenHalf.length} found)`, tenHalf.length === 0, tenHalf.slice(0, 6).join(' | '));
			/* FO-159 names the 10.5 px set. Settings also paints older 9–10.3 px micro-labels (the page index's
			   links, the rail's chapter headings and descriptions, key caps, side-card notes and health): they are
			   not 10.5 px text and the item changes nothing else, so the check records them here instead of
			   silently dropping them. `--set strict=1` asserts them too, which is where the item's own sentence
			   ("no visible Settings text below 11 px") lands until someone owns that call. */
			if (residue.size) {
				const top = [...residue.entries()].sort((a, b) => b[1] - a[1]);
				t.log(`NOTE: ${smallAll} Settings words across ${looks.length} look(s) still read under 11 px, in ${residue.size} kinds (not 10.5 px text; not in this item): ${top.slice(0, 8).map(([k, n]) => `${k} ×${n}`).join(' | ')}`);
				if (t.args.strict) await t.check(`strict: no visible Settings text is under 11 px (${smallAll} words, ${residue.size} kinds)`, smallAll === 0, top.slice(0, 6).map(([k, n]) => `${k} ×${n}`).join(' | '));
			}
		}
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await settle(t, 400);
		if (!list) await t.noConsoleErrors('no console errors');
	};

	tests[`FO-159 the grown controls still hold their words (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const want = (part) => !t.args.only || String(t.args.only).split(',').map((s) => s.trim()).includes(part);
		if (!want('cut')) { await t.check(`${surface} cut not asked for`, true); return; }
		const looks = String(t.args.fitLooks || FIT_LOOKS.join(',')).split(',');
		const sizes = String(t.args.widths || '').split(',').filter(Boolean).length
			? String(t.args.widths).split(',').map((s) => s.split('x').map(Number)).filter(([w, h]) => w && h)
			: SIZES;
		const f = await openSettings(t, surface);
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await t.settle();
		let cell = 0;
		for (const look of looks) {
			await setLookBySetting(t, f, look);
			for (const [w, h] of sizes) {
				cell++;
				await t.step(`${look} ${w}x${h}`, async () => {
					await t.viewport(w, h);
					await settle(t, 400);
					const ok = await guardLook(t, f, look, `${look} ${w}x${h}`);
					const cut = [];
					let sampled = 0, ellipsis = 0;
					const pages = await walkSettings(t, f, async (where) => {
						const r = await f.evaluate(CUT, [AFFECTED]);
						sampled += r.sampled; ellipsis += r.ellipsis;
						cut.push(...r.cut.map((x) => `${where}: ${x}`));
						return where;
					});
					t.log(`${look} ${w}x${h}: ${sampled} controls (${ellipsis} ellipsize by design) on ${pages.length} pages`);
					await t.check(`${look} ${w}x${h}: the grown controls hold their words (${sampled} measured)`, ok && sampled > 0 && cut.length === 0, cut.slice(0, 5).join(' | ') || 'nothing measured');
				});
			}
		}
		await t.check(`the fit matrix ran ${cell} cells`, cell === looks.length * sizes.length, `${cell}`);
		await t.noConsoleErrors('no console errors');
	};

	tests[`FO-159 every grown element keeps its line count (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const want = (part) => !t.args.only || String(t.args.only).split(',').map((s) => s.trim()).includes(part);
		if (!want('lines')) { await t.check(`${surface} lines not asked for`, true); return; }
		const record = t.args.record ? String(t.args.record) : '';
		/* The main baseline sits beside this check; --set lineBaseline= names another one (a fresh recording for
		   another baseline commit). A kit run with neither skips this part rather than failing on a missing file. */
		const own = new URL('./settings-min-text.lines.json', import.meta.url);
		const baselinePath = t.args.lineBaseline ? String(t.args.lineBaseline) : (record || !fs.existsSync(own) ? '' : fileURLToPath(own));
		if (!record && !baselinePath) { await t.check(`${surface}: line baseline not recorded yet (skipped)`, true); return; }
		const baseline = record ? null : JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
		if (baseline && !baseline.cells) return t.check(`${surface}: the line baseline is readable`, false, `${baselinePath} has no cells`);
		/* A state of the baseline that no head state matches compares nothing, so a renamed chapter or tab once went
		   uncompared while the check passed (fo-integ12b, FO-167's Memory rename). Now such a state fails, unless the
		   committed key map renames it (prefix renames only: rows are never edited) or lists it as retired with its
		   reason. --set keyMap=<json>|none and --set lineSupplement=<json>|none name other files ('none' turns one off,
		   which is how the check's bite is shown). The supplement holds states recorded on a later baseline commit
		   under the new keys (FO-167's own Memory page at 10.5 px); a supplement state replaces that state. */
		const sideFile = (arg, name) => {
			if (t.args[arg] === 'none') return '';
			if (t.args[arg]) return String(t.args[arg]);
			const u = new URL(`./${name}`, import.meta.url);
			return fs.existsSync(u) ? fileURLToPath(u) : '';
		};
		const mapPath = record ? '' : sideFile('keyMap', 'settings-min-text.keymap.json');
		const suppPath = record ? '' : sideFile('lineSupplement', 'settings-min-text.lines-fo167.json');
		const retiredStates = new Set();
		let renamed = 0, supplemented = 0;
		const mapErrors = [];
		if (baseline && mapPath) {
			const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
			for (const r of map.retired || []) retiredStates.add(r.state);
			for (const id of Object.keys(baseline.cells)) {
				const next = {};
				for (const [k, rows] of Object.entries(baseline.cells[id])) {
					if (retiredStates.has(k)) continue;
					let k2 = k;
					for (const p of map.prefixes || []) if (k2.startsWith(p.from)) k2 = p.to + k2.slice(p.from.length);
					if (k2 !== k) renamed++;
					if (next[k2]) mapErrors.push(`${id}: ${k} and another state both map to ${k2}`);
					next[k2] = rows;
				}
				baseline.cells[id] = next;
			}
		}
		if (baseline && suppPath) {
			const supp = JSON.parse(fs.readFileSync(suppPath, 'utf8'));
			for (const [id, states] of Object.entries(supp.cells || {})) {
				if (!baseline.cells[id]) { mapErrors.push(`${id}: the supplement names a cell the baseline lacks`); continue; }
				for (const [k, rows] of Object.entries(states)) { baseline.cells[id][k] = rows; supplemented++; }
			}
		}
		if (baseline) {
			t.log(`line baseline ${baselinePath}; key map ${mapPath || 'none'} (${renamed} state keys renamed, ${retiredStates.size} retired); supplement ${suppPath || 'none'} (${supplemented} states)`);
			await t.check(`${surface}: the key map and supplement apply cleanly`, mapErrors.length === 0, mapErrors.slice(0, 4).join(' | ') || `${renamed} renamed, ${supplemented} supplemented`);
		}
		const looks = String(t.args.fitLooks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const sizes = String(t.args.widths || '').split(',').filter(Boolean).length
			? String(t.args.widths).split(',').map((s) => s.split('x').map(Number)).filter(([w, h]) => w && h)
			: LINE_SIZES;
		const ratio = t.args.minRatio ? Number(t.args.minRatio) : 0.9;
		const f = await openSettings(t, surface);
		await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
		await t.settle();
		const cells = {};
		const counters = {};
		const diffs = [];
		let cellsRun = 0, cellsWithoutBaseline = 0, unmatchedAll = 0;
		for (const look of looks) {
			await setLookBySetting(t, f, look);
			for (const [w, h] of sizes) {
				cellsRun++;
				await t.step(`${look} ${w}x${h}`, async () => {
					await t.viewport(w, h);
					await settle(t, 350);
					const ok = await guardLook(t, f, look, `${look} ${w}x${h}`);
					/* The page must really be laid out at the cell's size: a sandbox wrapper that keeps an older frame size
					   measures a narrower page than the cell names, and every width below is then about that page. */
					const vp = await f.evaluate(() => ({ iw: window.innerWidth, ih: window.innerHeight, frame: window.frameElement ? [window.frameElement.clientWidth, window.frameElement.clientHeight] : null }));
					await t.check(`${look} ${w}x${h}: the page is laid out at ${w}x${h}`, Math.abs(vp.iw - w) <= 2 && Math.abs(vp.ih - h) <= 2, `inner ${vp.iw}x${vp.ih}${vp.frame ? `, frame ${vp.frame.join('x')}` : ''}`);
					await f.evaluate(LAYOUT_ALL);
					const id = key(surface, look, [w, h]);
					const states = await walkSettings(t, f, async (where, ws) => {
						await f.evaluate(LAYOUT_ALL);
						const r = await f.evaluate(LINES, [ratio, baseline && baseline.cells[id] && baseline.cells[id][where] ? baseline.cells[id][where].map((x) => x[0]) : [], ws]);
						return { where, rows: r.rows };
					});
					const mine = {};
					let measured = 0;
					for (const s of states) {
						if (!s || !s.rows || !s.rows.length) continue;
						measured += s.rows.length;
						mine[s.where] = record ? s.rows.filter((x) => Math.abs(x.f - 10.5) < 0.02 && x.r >= ratio).map((x) => [x.p, x.f, x.n, x.w]) : s.rows;
					}
					if (record) { cells[id] = mine; t.log(`${id}: ${states.length} states, ${measured} text elements, ${Object.values(mine).reduce((a, b) => a + b.length, 0)} recorded`); if (!ok) return; }
					else {
						const base = baseline.cells[id];
						if (!base) { cellsWithoutBaseline++; diffs.push({ id, why: 'no baseline cell' }); return; }
						let compared = 0, resized = 0, missing = 0, changed = 0;
						const headStates = new Set(states.filter((s) => s && s.where).map((s) => s.where));
						const unmatched = Object.keys(base).filter((k) => !headStates.has(k));
						for (const k of unmatched) diffs.push({ id, where: k, why: 'baseline state with no head match', rows: base[k].length });
						unmatchedAll += unmatched.length;
						for (const s of states) {
							if (!s || !s.rows) continue;
							const baseRows = base[s.where];
							if (!baseRows) { diffs.push({ id, where: s.where, why: 'state missing from baseline', n: s.rows.length }); continue; }
							/* Two elements can draw the same words in one state; the key holds them together and the
							   fullest line count on each side is compared, so which of them a state happens to keep
							   cannot hide a new line or invent one. */
							const now = new Map();
							for (const r of s.rows) { const prev = now.get(r.p); if (!prev || r.n > prev.n) now.set(r.p, r); }
							const was = new Map();
							for (const [p, bfs, blines, bwidth] of baseRows) { const prev = was.get(p); if (!prev || blines > prev.blines) was.set(p, { bfs, blines, bwidth }); }
							for (const [p, b] of was) {
								const cur = now.get(p);
								if (!cur) { missing++; if (t.args.probe && missing < 4) t.log(`gone: ${s.where} ${p}`); continue; }
								if (cur.t !== p.slice(p.indexOf('|') + 1)) { changed++; continue; }
								if (Math.abs(b.bfs - 10.5) > 0.02 || cur.f < b.bfs + 0.4) { if (t.args.probe) t.log(`same: ${s.where} ${p} ${b.bfs}->${cur.f}`); continue; }
								resized++; compared++;
								if (cur.n > b.blines) diffs.push({ id, where: s.where, p, text: p.slice(p.indexOf('|') + 1), look, size: `${w}x${h}`, base: b.blines, fix: cur.n, from: b.bfs, to: cur.f, width: b.bwidth, nowWidth: cur.w });
								if (t.args.probe) t.log(`kept: ${s.where} ${p} ${b.bfs}->${cur.f} ${b.blines}->${cur.n}`);
							}
						}
						counters[id] = { states: states.length, rows: measured, compared, resized, missing, changed, unmatched: unmatched.length };
						t.log(`${id}: ${states.length} states, ${measured} baseline rows seen, ${compared} of ${resized} resized elements compared, ${missing} gone, ${changed} retexted, ${unmatched.length} baseline states unmatched`);
						await t.check(`${id}: every resized element keeps its line count (${compared} compared)`, ok && compared > 0 && diffs.filter((d) => d.id === id && d.fix).length === 0, diffs.filter((d) => d.id === id && d.fix).slice(0, 6).map((d) => `${d.where} ${d.text.slice(0, 40)} ${d.base}->${d.fix} lines @${d.width}px`).join(' | ') || 'no element behind the baseline');
						await t.check(`${id}: every baseline state has its head state (${unmatched.length} unmatched)`, unmatched.length === 0, unmatched.slice(0, 4).map((k) => `${k} (${base[k].length} rows)`).join(' | ') || `${Object.keys(base).length} states matched`);
					}
				});
			}
		}
		if (record) {
			let prior = {};
			try { prior = JSON.parse(fs.readFileSync(record, 'utf8')).cells || {}; } catch (e) { prior = {}; }
			writeBaseline(record, { ...prior, ...cells }, { looks, sizes, ratio, surface });
			await t.check(`${surface}: the line baseline was recorded (${Object.keys(cells).length} cells)`, Object.keys(cells).length === cellsRun, record);
			return;
		}
		if (t.args.out) fs.writeFileSync(String(t.args.out), JSON.stringify({ surface, ratio, cellsRun, counters, diffs }, null, 1));
		const bad = diffs.filter((d) => d.fix);
		await t.check(`${surface}: no element grew a line anywhere in the matrix (${bad.length} new lines)`, bad.length === 0, bad.slice(0, 8).map((d) => `${d.id} ${d.where} ${d.text.slice(0, 40)} ${d.base}->${d.fix}`).join(' | '));
		await t.check(`${surface}: the line matrix ran its ${cellsRun} cells`, cellsRun === looks.length * sizes.length, `${cellsRun}/${looks.length * sizes.length}`);
		await t.check(`${surface}: every cell had a main baseline (${cellsRun - cellsWithoutBaseline}/${cellsRun})`, cellsWithoutBaseline === 0, `${cellsWithoutBaseline} cells missing from ${baselinePath}`);
		await t.check(`${surface}: no baseline state went uncompared (${unmatchedAll} unmatched)`, unmatchedAll === 0, diffs.filter((x) => x.why === 'baseline state with no head match').slice(0, 6).map((x) => `${x.id} ${x.where}`).join(' | ') || 'every baseline state matched');
		await t.noConsoleErrors('no console errors');
	};
}
