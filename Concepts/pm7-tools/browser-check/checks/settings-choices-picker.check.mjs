// FO-127 (Jared's settings feedback #2, 2026-11-09): "Shouldnt the your choices list be a drop down rather than listing
// every model down the page? you could use the model selector from assistant chat." His picks: "option b" (2026-11-10)
// and "looks good, I choose all 11" (2026-11-11). In the Settings Details panel, "Your choices" of a model setting, and
// of every other single choice with more than 6 choices (the 11 long lists), is one picker (a combobox, the chat's
// model selector) whose listbox unfolds inside the panel under it; a model setting's has a strip of maker marks that
// filters it, a long list's has none. Every choice stays reachable through it, by pointer and by keys, in all ten
// looks, at a standard and a narrow width, with Reduced Motion, on either surface (--set sandbox=0/1). A per-thing setting (a Goal template's
// Kind of job; a persona's Preferred model is retired by DL-476) saves on the thing it was opened from and never as a shared value;
// opened any other way its picker is read only (sol-review-l1s L1S-N2). Arrow keys keep the active row in view, the
// search box has no show/hide hover tag, and long lists Jared did not choose stay tick lists. Short lists
// (On/Off) and lists that take several choices stay tick lists. His #1 ("that logo looks terrible", most right-side
// panels), pick icon B: the head tile of the Details panel and of every Settings side panel draws the PM glyph (PMG:
// data-nx, a glyph PMG.has) in a quiet tile with no outer glow (every box-shadow layer inset). Semantics and geometry
// only (roles, names, states, hit-tests, boxes, computed styles); no eye. Tile geometry and tick centring stay
// settings-inspector-fit's.
// FO-178 (Jared's card Q6, answer A, 2026-11-13: "Pop up over the panel, like the chat picker"): the list no longer
// unfolds inside the Details panel, pushing what follows down; it pops up over the panel in a layer of its own
// (position: fixed, outside the panel), within the panel's sides, wholly on screen and on top (its corners, its middle
// and every row in view hit-test to it), right under its trigger or, without room there, right over it, at every size
// the kit uses (1920x1080, 1390x900, 1280x500, 1024x768, 860x900, 740x900). Opening it, walking it with the arrow keys
// and closing it with Escape or a press outside move nothing in the panel (its body's scroll and every block stay put),
// and it stays above the panel and a toast, with and without `isolation: isolate` on #panel-settings (FO-177's rule).
// The listbox is found through the picker's aria-controls wherever it is drawn. Fails `f8b2098608` (the inline list).
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-choices-picker.check.mjs --set page=<build>
// --set looks=a,b narrows the looks; --set sizes=1390x900,740x900 the sizes; --set setting=<id> another model setting;
// --set lists=<id,id> narrows the long lists; --set popSizes=1280x500,740x900 narrows FO-178's size sweep.
import { LOOKS } from '../browser-check.config.mjs';

const SETTING = 'ai.models.default-model';
/* the 11 long single-choice lists Jared chose (2026-11-11), each with more than 6 choices. The persona lists and Image
   service have no row in this fixture's Settings pages (no placement), so a run reports them as not reachable; NieR
   background shows only under NieR, so it is opened in NieR Dark. At least 7 must open. */
const LONG = ['code.terminal.background-image', 'code.editing.color-scheme', 'ai.models.default-provider', 'code.terminal.background-gradient', 'general.visual.theme', 'planning.verification.goal-template', 'code.terminal.bezel-material', 'personas.library.default-persona', 'personas.library.active-persona', 'general.visual.nier-background', 'media.image.provider'];

/* The look is chosen the way a person chooses it, through the Theme and Theme Mode rows' own dropdowns (the settings
   engine re-applies the saved pair on every render, applyPaint), and asserted at measurement time. */
async function setLook(t, f, look) {
	const [family, mode] = look.split('-');
	await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
	await t.settle();
	for (const [setting, value] of [['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)], ['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark']]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
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
		const th = document.documentElement.getAttribute('data-theme') || '';
		const nier = !!(window.PM_NIER && PM_NIER.on()) || th.startsWith('nier');
		return fam === 'nier' ? nier && th.endsWith('-' + m) : !nier && th === fam + '-' + m;
	}, [family, mode], { timeout: 20000 }).catch(() => {});
}
async function guardLook(t, f, look, where) {
	const [family, mode] = look.split('-');
	const got = await f.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme') || '', nier: !!(window.PM_NIER && PM_NIER.on()) || (document.documentElement.getAttribute('data-theme') || '').startsWith('nier') }));
	const ok = family === 'nier' ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === look;
	await t.check(`${where}: measured under ${look} (painted ${got.theme}${got.nier ? ', NieR on' : ''})`, ok, 'the panel opened on a different look than the cell names');
}

/* The setting's own page (its chapter and tab from the placement), then its About button: the Details panel. */
async function openDetails(t, f, id, quiet = false) {
	const pl = await f.evaluate((id) => (window.PM51 && PM51.placement && PM51.placement.byId[id]) || null, id);
	if (!pl) { if (!quiet) await t.check(`${id}: the placement knows the setting`, false); return false; }
	await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${pl.domain}"]`).first().click();
	await t.settle();
	if (pl.tab) { await f.locator(`#pm-settings-root [data-tab="${pl.tab}"]`).first().click().catch(() => {}); await t.settle(); }
	const about = f.locator(`#pm-settings-root .o55-about[data-setting="${id}"]`).first();
	if (!(await about.count()) || !(await about.isVisible())) { if (!quiet) await t.check(`${id}: the row's About button exists`, false); return false; }
	await about.evaluate((el) => el.scrollIntoView({ block: 'center' }));
	await t.page.waitForTimeout(250);
	await about.click({ timeout: 15000 });
	await f.waitForSelector('#panel-settings .detail-inspector .o55-insp-head', { timeout: 8000 });
	await t.settle();
	return true;
}
const closeDetails = async (t, f) => { await f.locator('#panel-settings .detail-inspector [data-action="close-details"]').click().catch(() => {}); await t.page.waitForTimeout(350); };

/* What the panel's "Your choices" block is: its comboboxes, its old per-choice radios, and the row's own select (the
   setting's full choice list, which the picker must offer in full). */
const BLOCK = (id) => {
	const insp = document.querySelector('#panel-settings .detail-inspector');
	const block = insp && [...insp.querySelectorAll('.o55-insp-block')].find((b) => /^\s*Your choices/.test((b.querySelector('h4') || {}).textContent || ''));
	const sel = document.querySelector(`#pm-settings-root select[data-setting="${CSS.escape(id)}"]`);
	const combo = block ? [...block.querySelectorAll('[role="combobox"]')] : [];
	const c = combo[0];
	const r = c && c.getBoundingClientRect();
	return {
		block: !!block,
		radios: block ? block.querySelectorAll('[role="radio"], [role="checkbox"]').length : 0,
		combos: combo.length,
		popup: c ? c.getAttribute('aria-haspopup') : null,
		expanded: c ? c.getAttribute('aria-expanded') : null,
		name: c ? (c.getAttribute('aria-label') || c.textContent || '').trim() : '',
		text: c ? c.textContent.trim() : '',
		box: r ? { left: r.left, right: r.right, top: r.top, bottom: r.bottom, w: r.width, h: r.height } : null,
		panel: insp ? (() => { const b = insp.getBoundingClientRect(); return { left: b.left, right: b.right }; })() : null,
		choices: sel ? [...sel.options].map((o) => ({ value: o.value, label: o.textContent.trim() })) : null,
		value: sel ? sel.value : null,
		face: c ? ((c.querySelector('strong') || c).firstChild || {}).textContent || '' : '',
		mark: !!(c && c.querySelector('.o55-pick-mark')),
		/* the current value as the panel's own "now" card writes it, and the setting's choices as the settings
		   inventory names them (a row may present another list: Theme's row picks a family, its Details a look) */
		now: ((insp && insp.querySelector('.o55-insp-now-value')) || {}).textContent || '',
		/* a per-scope setting (each Goal template has its own): the now card lists each scope's value, the picker
		   sets the shared value, which may be unset, and there is no single default to go back to */
		per: !!(insp && insp.querySelector('.o55-insp-now.is-per')),
		inv: (() => { try { const st = window.PM51 && PM51.setting(id); return st && Array.isArray(st.options) ? st.options.map((o) => String(PM51.valueLabel(id, o && typeof o === 'object' ? o.value : o))) : []; } catch (e) { return []; } })()
	};
};
/* The open listbox the combobox controls, wherever it is drawn (floating or in the panel): its options, the selected
   one, the active descendant, and a hit-test of each visible option's centre (what a press there reaches). */
const OPEN = () => {
	const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
	if (!c) return { open: false };
	const list = document.getElementById(c.getAttribute('aria-controls') || '');
	if (!list) return { open: false, why: 'aria-controls names no element' };
	const host = list.closest('.pm51-popout') || list.closest('.o55-pick-inline') || list;
	const opts = [...list.querySelectorAll('[role="option"]')];
	const visible = opts.filter((o) => !o.hidden && o.getClientRects().length);
	const sb = document.querySelector('.pm7-statusbar');
	const sbTop = sb ? sb.getBoundingClientRect().top : innerHeight;
	/* the rows a person can see: inside the list, every clipping ancestor (the scroller is the popout or the list) and
	   the window, below any sticky search head */
	const clip = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
	for (let el = list; el && el !== document.documentElement; el = el.parentElement) {
		const cs = getComputedStyle(el);
		if (el !== list && cs.overflowY === 'visible' && cs.overflowX === 'visible') continue;
		const r = el.getBoundingClientRect();
		clip.left = Math.max(clip.left, r.left); clip.top = Math.max(clip.top, r.top); clip.right = Math.min(clip.right, r.right); clip.bottom = Math.min(clip.bottom, r.bottom);
	}
	const head = host.querySelector('.pm51-popout-search');
	if (head && getComputedStyle(head).position === 'sticky') clip.top = Math.max(clip.top, head.getBoundingClientRect().bottom);
	const hits = visible.filter((o) => { const r = o.getBoundingClientRect(); return r.top >= clip.top - 1 && r.bottom <= clip.bottom + 1 && r.left >= clip.left - 1 && r.right <= clip.right + 1; }).map((o) => {
		const r = o.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
		const hit = document.elementFromPoint(x, y);
		return { on: !!(hit && (hit === o || o.contains(hit))), under: hit ? hit.className && String(hit.className).slice(0, 40) : 'nothing', below: r.bottom > sbTop };
	});
	const hb = host.getBoundingClientRect();
	const search = host.querySelector('input[type="search"]');
	const act = document.activeElement;
	const insp = document.querySelector('#panel-settings .detail-inspector');
	const ib = insp ? insp.getBoundingClientRect() : null;
	/* FO-178: a popup is a layer of its own (fixed, not inside the panel); what a press at each of its corners (6 px
	   in, inside any rounded corner up to 20 px) and at its middle reaches; and where it stands by its trigger */
	const layer = !(insp && insp.contains(host)) && getComputedStyle(host).position === 'fixed';
	const pts = [[hb.left + 6, hb.top + 6], [hb.right - 6, hb.top + 6], [hb.left + 6, hb.bottom - 6], [hb.right - 6, hb.bottom - 6], [(hb.left + hb.right) / 2, (hb.top + hb.bottom) / 2]];
	const corners = pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return e && host.contains(e) ? 'popup' : e ? String(e.className || e.tagName).slice(0, 40) : 'nothing'; });
	const tb = c.getBoundingClientRect();
	const side = hb.top >= tb.bottom - 0.5 && hb.top - tb.bottom <= 10 ? 'under its trigger' : hb.bottom <= tb.top + 0.5 && tb.top - hb.bottom <= 10 ? 'over its trigger' : hb.top < tb.bottom && hb.bottom > tb.top ? 'covering its trigger' : `${Math.round(hb.top >= tb.bottom ? hb.top - tb.bottom : tb.top - hb.bottom)} px away from its trigger`;
	return {
		layer, corners, side, trig: { top: tb.top, bottom: tb.bottom }, room: { below: sbTop - 8 - tb.bottom, above: tb.top - 8 },
		inPanel: !!(insp && insp.contains(host)), panel: ib ? { left: ib.left, right: ib.right, top: ib.top, bottom: ib.bottom } : null,
		open: true, role: list.getAttribute('role'), label: list.getAttribute('aria-label') || '',
		total: opts.length, labels: opts.map((o) => o.textContent.trim()), selected: opts.filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.textContent.trim()),
		names: opts.map((o) => (((o.querySelector('strong') || o).firstChild || {}).textContent || '').trim()),
		host: { left: hb.left, right: hb.right, top: hb.top, bottom: hb.bottom }, vw: innerWidth, vh: innerHeight, sbTop,
		hits, searchFocused: !!search && act === search, activeDesc: search ? search.getAttribute('aria-activedescendant') : null,
		activeExists: !!(search && search.getAttribute('aria-activedescendant') && document.getElementById(search.getAttribute('aria-activedescendant'))),
		running: host.getAnimations ? host.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length : 0
	};
};

/* FO-178: what the Details panel shows and where: its body's scroll and the top and bottom of each of its blocks (the
   picker's own block included), so a picker that pushes the panel's content, or scrolls the panel, is seen. */
const PANEL = () => {
	const body = document.querySelector('#panel-settings .detail-inspector .o55-insp-body');
	if (!body) return null;
	return { scroll: Math.round(body.scrollTop * 10) / 10, blocks: [...body.children].map((n) => { const r = n.getBoundingClientRect(); return [Math.round(r.top * 10) / 10, Math.round(r.bottom * 10) / 10]; }) };
};
const moved = (a, b) => {
	if (!a || !b) return 'no Details panel to compare';
	const out = [];
	if (Math.abs(a.scroll - b.scroll) > 0.5) out.push(`its body scrolled ${a.scroll} → ${b.scroll}`);
	if (a.blocks.length !== b.blocks.length) out.push(`${a.blocks.length} → ${b.blocks.length} blocks`);
	a.blocks.forEach((x, i) => { const y = b.blocks[i]; if (y && (Math.abs(x[0] - y[0]) > 0.5 || Math.abs(x[1] - y[1]) > 0.5)) out.push(`block ${i + 1} ${x.join('–')} → ${y.join('–')}`); });
	return out.join('; ');
};
const PICKER = '#panel-settings .detail-inspector .o55-insp-block [role="combobox"]';
/* The picker brought into the panel's view first (a click would scroll it there anyway), then the panel as it stands:
   what opening, walking and closing the picker are compared against. */
async function beforeOpen(t, f) {
	await f.locator(PICKER).first().evaluate((el) => el.scrollIntoView({ block: 'nearest' }));
	await t.page.waitForTimeout(150);
	return f.evaluate(PANEL);
}
/* the open listbox's id (the picker's aria-controls), so its rows, search and maker strip are found wherever it is
   drawn: in the panel (FO-127) or in its popup (FO-178) */
const openListId = (f) => f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'); return c ? c.getAttribute('aria-controls') || '' : ''; });
const listSel = (id) => `[id="${id}"]`;
const searchSel = (id) => `input[type="search"][aria-controls="${id}"]`;
const POPPED = () => !!document.querySelector('.o55-pick-pop.is-open');
/* FO-178 judged on an open picker (OPEN's reading): a popup over the panel, within its sides, whole on screen and on
   top, by its trigger, and the panel unmoved since `before` */
async function judgePopup(t, where, o, before, now) {
	const over = !!o.panel && o.host.left >= o.panel.left - 0.5 && o.host.right <= o.panel.right + 0.5 && o.host.top < o.panel.bottom && o.host.bottom > o.panel.top;
	await t.check(`${where}: FO-178 the list pops up over the Details panel (a layer of its own, not inside the panel) within the panel's sides`, o.layer && over, o.layer ? JSON.stringify({ host: o.host, panel: o.panel }) : `not a popup: the list is drawn inside the panel (${JSON.stringify({ host: o.host, panel: o.panel })})`);
	await t.check(`${where}: FO-178 the whole popup is on screen and on top (its corners and middle hit-test to it)`, o.layer && o.corners.every((x) => x === 'popup'), o.layer ? JSON.stringify(o.corners) : `not a popup; corners reach ${JSON.stringify(o.corners)}`);
	const cramped = Math.max(o.room.below, o.room.above) < 200;
	await t.check(`${where}: FO-178 the popup stands right by its trigger (${o.side}), covering it only when neither side has room`, o.layer && (o.side === 'under its trigger' || o.side === 'over its trigger' || (o.side === 'covering its trigger' && cramped)), o.layer ? `${o.side}; room under ${Math.round(o.room.below)} px, over ${Math.round(o.room.above)} px` : 'not a popup');
	const m = moved(before, now);
	await t.check(`${where}: FO-178 opening the picker moves nothing in the Details panel`, !m, m);
}

/* every size the kit uses (WIDTHS 860 to 1920, the short 1280x500 and the narrow 740) */
const POP_SIZES = '1920x1080,1390x900,1280x500,1024x768,860x900,740x900';
/* A spot to press that is no control, outside the open list: on the Details panel ('panel': its title first) or on
   the Settings page beside it ('page'), in frame coordinates */
const SPOT = (place) => {
	const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
	const list = c && document.getElementById(c.getAttribute('aria-controls') || '');
	const host = list && (list.closest('.pm51-popout') || list.closest('.o55-pick-inline') || list);
	const insp = document.querySelector('#panel-settings .detail-inspector');
	const root = document.querySelector('#pm-settings-root');
	if (!insp || !root) return null;
	const ib = insp.getBoundingClientRect(), hb = host ? host.getBoundingClientRect() : null;
	const CONTROL = 'button, a, input, select, textarea, summary, label, details, [role="button"], [role="tab"], [role="link"], [role="combobox"], [role="option"], [role="switch"], [data-action], [tabindex], [contenteditable]';
	const ok = (x, y) => {
		if (hb && x >= hb.left - 4 && x <= hb.right + 4 && y >= hb.top - 4 && y <= hb.bottom + 4) return null;
		const e = document.elementFromPoint(x, y);
		if (!e || (host && host.contains(e)) || e.closest(CONTROL)) return null;
		if (place === 'panel' ? !insp.contains(e) : (insp.contains(e) || !root.contains(e) || x >= ib.left - 4)) return null;
		return { x: Math.round(x), y: Math.round(y), what: String(e.className || e.tagName).split(' ')[0] || e.tagName };
	};
	if (place === 'panel') {
		const title = insp.querySelector('.o55-insp-title');
		if (title) { const r = title.getBoundingClientRect(); const got = ok(r.left + Math.min(40, r.width / 2), r.top + r.height / 2); if (got) return Object.assign(got, { what: 'its title' }); }
	}
	const [x0, x1] = place === 'panel' ? [ib.left + 8, ib.right - 8] : [8, ib.left - 12];
	for (let y = 60; y < innerHeight - 40; y += 23) for (let x = x0; x < x1; x += 31) { const got = ok(x, y); if (got) return got; }
	return null;
};
/* FO-178's stacking reading: the open list's host, whether it is a layer of its own, what its corners and middle reach,
   and what each point it shares with the toast titled `title` reaches (the toast: the smallest card on screen, 40 to 200
   px tall and 200 px wide or more, that holds the title; it may start a few px above the window, where the title bar
   is hidden, and the notification centre keeps an empty slot above the window) */
const STACK = (title) => {
	const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
	const list = c && document.getElementById(c.getAttribute('aria-controls') || '');
	if (!list) return { open: false, corners: [], points: [] };
	const host = list.closest('.pm51-popout') || list.closest('.o55-pick-inline') || list;
	const insp = document.querySelector('#panel-settings .detail-inspector');
	const layer = !(insp && insp.contains(host)) && getComputedStyle(host).position === 'fixed';
	const hb = host.getBoundingClientRect();
	const reach = (x, y) => { const e = document.elementFromPoint(x, y); return e && host.contains(e) ? 'popup' : e ? String(e.className || e.tagName).slice(0, 40) : 'nothing'; };
	const corners = [[hb.left + 6, hb.top + 6], [hb.right - 6, hb.top + 6], [hb.left + 6, hb.bottom - 6], [hb.right - 6, hb.bottom - 6], [(hb.left + hb.right) / 2, (hb.top + hb.bottom) / 2]].map(([x, y]) => reach(x, y));
	const cards = [...document.querySelectorAll('body *')].filter((e) => !host.contains(e) && e.getClientRects().length && (e.textContent || '').includes(title))
		.map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.top > -24 && r.bottom > 20 && r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight && r.height >= 40 && r.height <= 200 && r.width >= 200)
		.sort((a, b) => a.r.width * a.r.height - b.r.width * b.r.height);
	const card = cards[0];
	const box = { left: Math.round(hb.left), top: Math.round(hb.top), right: Math.round(hb.right), bottom: Math.round(hb.bottom) };
	if (!card) return { open: true, layer, corners, points: [], toast: null, box, cards: cards.length };
	const r = card.r, ix = { left: Math.max(r.left, hb.left) + 4, right: Math.min(r.right, hb.right) - 4, top: Math.max(r.top, hb.top) + 4, bottom: Math.min(r.bottom, hb.bottom) - 4 };
	const points = ix.left < ix.right && ix.top < ix.bottom ? [[ix.left, ix.top], [ix.right, ix.top], [ix.left, ix.bottom], [ix.right, ix.bottom], [(ix.left + ix.right) / 2, (ix.top + ix.bottom) / 2]].map(([x, y]) => reach(x, y)) : [];
	return { open: true, layer, corners, points, box, toast: { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), cls: String(card.e.className || card.e.tagName).slice(0, 40) } };
};

/* A head tile: the glyph it draws (a PMG glyph carries data-nx, the registry name) and its shadow layers (an outer
   layer is any that is not inset: the old accent ring and glow were two). */
const TILE = (sel) => {
	const tile = document.querySelector(sel);
	if (!tile || !tile.getClientRects().length) return { error: `no ${sel}` };
	const svg = tile.querySelector('svg');
	const nx = svg ? svg.getAttribute('data-nx') : null;
	const sh = getComputedStyle(tile).boxShadow || 'none';
	const layers = sh === 'none' ? [] : sh.split(/,(?![^(]*\))/).map((x) => x.trim());
	return { nx, pmg: !!(nx && window.PMG && PMG.has(nx)), outer: layers.filter((l) => !/\binset\b/.test(l)), shadow: sh };
};
async function judgeTile(t, f, where, sel) {
	const m = await f.evaluate(TILE, sel);
	if (m.error) { await t.check(`${where}: the head tile is shown`, false, m.error); return; }
	await t.check(`${where}: the head tile draws a PM glyph (PMG)`, m.pmg, `data-nx ${m.nx}`);
	await t.check(`${where}: the head tile has no outer ring or glow`, m.outer.length === 0, m.shadow);
}
async function judgeClosed(t, f, where, id) {
	const b = await f.evaluate(BLOCK, id);
	await t.check(`${where}: the panel shows "Your choices"`, b.block);
	await t.check(`${where}: "Your choices" is one picker, not a column of every choice (${b.combos} combobox, ${b.radios} radios${b.choices ? ` for ${b.choices.length} choices` : ''})`, b.combos === 1 && b.radios === 0, `combobox ${b.combos}, radio/checkbox ${b.radios}`);
	if (!b.combos) return b;
	await t.check(`${where}: the picker says it opens a listbox and is closed`, b.popup === 'listbox' && b.expanded === 'false', `aria-haspopup ${b.popup}, aria-expanded ${b.expanded}`);
	const curName = (b.per ? b.face : b.now).trim().split(' · ')[0];
	await t.check(`${where}: its name and face say the current value ("${curName}", from ${b.per ? 'the shared value of a per-scope setting' : "the panel's now card"})`, !!curName && b.name.includes(curName) && b.text.includes(curName), `name "${b.name}", text "${b.text}"`);
	await t.check(`${where}: the picker sits inside the panel`, !!b.box && !!b.panel && b.box.left >= b.panel.left - 0.5 && b.box.right <= b.panel.right + 0.5 && b.box.h >= 32, JSON.stringify({ box: b.box, panel: b.panel }));
	return b;
}
async function judgeOpen(t, f, where, b, { still = false, before = null } = {}) {
	const o = await f.evaluate(OPEN);
	const now = await f.evaluate(PANEL);
	await t.check(`${where}: the picker opened a listbox it controls`, o.open && o.role === 'listbox', JSON.stringify(o).slice(0, 200));
	if (!o.open) return o;
	/* every choice: the row's own select when it offers the same long list, else the inventory's choices */
	const truth = b.choices && b.choices.length > 6 ? b.choices.map((c) => c.label) : b.inv.length > 6 ? b.inv : null;
	if (truth) {
		const want = truth.map((l) => l.split(' · ')[0]);
		const missing = want.filter((w) => !o.labels.some((l) => l.includes(w)));
		await t.check(`${where}: every choice is in the list (${o.total} of ${truth.length})`, o.total === truth.length && missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : `${o.total} vs ${truth.length}`);
	} else await t.check(`${where}: the list holds more than 6 choices (${o.total})`, o.total > 6 && o.labels.every((l) => l.length > 0), `${o.total}`);
	/* the current value is ticked when it is one of the choices; an unset value ("Not set") ticks none */
	const cur = (b.per ? b.face : b.now).trim().split(' · ')[0];
	const listed = o.names.some((n) => n === cur);
	await t.check(`${where}: ${listed ? `exactly the current choice ("${cur}") is selected` : `nothing is selected while the value ("${cur}") is not one of the choices`}`, listed ? o.selected.length === 1 && o.selected[0].startsWith(cur) : o.selected.length === 0, JSON.stringify(o.selected));
	await t.check(`${where}: focus is in its search, with an active option named`, o.searchFocused && o.activeExists, `search focused ${o.searchFocused}, active ${o.activeDesc}`);
	/* FO-178 replaces FO-127's "the list unfolds inside the Details panel" (Jared's Q6 answer A): it pops up over it */
	await judgePopup(t, where, o, before, now);
	await t.check(`${where}: the open list is inside the window and above the status bar`, o.host.left >= 0 && o.host.right <= o.vw && o.host.top >= 0 && o.host.bottom <= o.sbTop + 0.5, JSON.stringify({ host: o.host, vw: o.vw, sbTop: o.sbTop }));
	const covered = o.hits.filter((h) => !h.on);
	await t.check(`${where}: every option in view is on top (${o.hits.length} hit-tested, 3 or more)`, o.hits.length >= 3 && covered.length === 0, covered.slice(0, 3).map((h) => 'under ' + h.under).join(' | '));
	if (still) await t.check(`${where}: Reduced Motion: nothing animates as it opens`, o.running === 0, `${o.running} running animations`);
	return o;
}

export const tests = {
	/* All ten looks at each size, for the model setting and for Theme (the long list whose look matters most): the
	   panel shows one closed picker, a click opens the whole list on top, Escape closes the picker and not the panel,
	   and focus is back on the picker. */
	'FO-127 model choices are one picker, all looks and sizes': async (t) => {
		const id = String(t.args.setting || SETTING);
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		const sizes = (t.args.sizes ? String(t.args.sizes) : '1390x900,740x900').split(',').map((s) => s.split('x').map(Number));
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		for (const look of looks) {
			await t.viewport(1390, 900);
			await setLook(t, f, look);
			for (const [w, h] of sizes) for (const sid of [id, 'general.visual.theme']) {
				await t.viewport(1390, 900);
				if (!(await openDetails(t, f, sid))) continue;
				if (w !== 1390 || h !== 900) { await t.viewport(w, h); await t.page.waitForTimeout(500); }
				const where = `${look} ${w}x${h} ${sid === id ? 'model' : 'Theme'}`;
				await guardLook(t, f, look, where);
				const b = await judgeClosed(t, f, where, sid);
				if (sid === id) await judgeTile(t, f, `${where} Details`, '#panel-settings .detail-inspector .o55-insp-icon');
				if (b.combos) {
					const before = await beforeOpen(t, f);
					await f.locator(PICKER).first().click();
					await t.page.waitForTimeout(450);
					const o = await judgeOpen(t, f, where, b, { before });
					await t.page.keyboard.press('Escape');
					await t.page.waitForTimeout(300);
					const after = await f.evaluate(() => ({ open: !!document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'), panel: !!document.querySelector('#panel-settings .detail-inspector .o55-insp-head'), focus: !!(document.activeElement && document.activeElement.matches('#panel-settings .detail-inspector [role="combobox"]')) }));
					await t.check(`${where}: Escape closes the picker, keeps the panel, and returns focus to the picker`, !after.open && after.panel && after.focus, JSON.stringify(after));
					/* FO-178: Escape folds the popup away (none is left open over the panel) and the panel stands as it did */
					const gone = await f.evaluate(POPPED), m = moved(before, await f.evaluate(PANEL));
					await t.check(`${where}: FO-178 Escape closes the popup over the panel, focus on the picker, the panel where it stood before it opened`, !!(o && o.layer) && !gone && !after.open && after.focus && !m, !(o && o.layer) ? 'it never popped up over the panel (the list was inside it)' : gone ? 'a popup is still open' : m || JSON.stringify(after));
				}
				await closeDetails(t, f);
			}
		}
	},

	/* The keyboard path, one look: Arrow Down opens, typing narrows to a maker, Enter picks, the row's own select
	   follows, focus is back on the closed picker, which now names the pick; Go back to the default restores it. */
	'FO-127 keys pick a model and the row follows': async (t) => {
		const id = String(t.args.setting || SETTING);
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		if (!(await openDetails(t, f, id))) return;
		const b = await judgeClosed(t, f, 'keys', id);
		if (!b.combos) return;
		const target = b.choices.find((c) => c.value !== b.value && /kimi/i.test(c.label)) || b.choices.find((c) => c.value !== b.value);
		const word = target.label.split(' · ')[0];
		await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().focus();
		await t.page.keyboard.press('ArrowDown');
		await t.page.waitForTimeout(400);
		const o = await f.evaluate(OPEN);
		await t.check('keys: Arrow Down opens the picker with focus in its search', o.open && o.searchFocused, JSON.stringify({ open: o.open, search: o.searchFocused }));
		/* the maker strip: one mark per maker plus All; a maker leaves only its own section, All brings every row back */
		const STRIP = () => {
			const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
			const list = c && document.getElementById(c.getAttribute('aria-controls'));
			const host = list && (list.closest('.o55-pick-inline') || list.parentElement);
			const chips = host ? [...host.querySelectorAll('[role="group"] button[aria-pressed]')] : [];
			const groups = list ? [...list.querySelectorAll('[role="presentation"]')].filter((g) => !g.hidden && g.getClientRects().length).map((g) => g.textContent.trim()) : [];
			return { chips: chips.map((b) => ({ label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed') })), groups, shown: list ? [...list.querySelectorAll('[role="option"]')].filter((n) => !n.hidden).length : 0 };
		};
		const s0 = await f.evaluate(STRIP);
		const makers = s0.groups;
		await t.check(`keys: the maker strip has All and one mark per maker (${makers.length} makers)`, s0.chips.length === makers.length + 1 && s0.chips[0].pressed === 'true' && makers.every((m) => s0.chips.some((c) => c.label === m)), JSON.stringify(s0.chips));
		const maker = makers[makers.length - 1];
		/* the strip sits beside the list, in the panel (FO-127) or in its popup (FO-178) */
		const host = `:is(#panel-settings .detail-inspector, .o55-pick-pop.is-open) [role="group"][aria-label="Show models from"]`;
		await f.locator(`${host} button[aria-label="${maker}"]`).first().click();
		await t.page.waitForTimeout(200);
		const s1 = await f.evaluate(STRIP);
		await t.check(`keys: the ${maker} mark leaves only its section, and says it is pressed`, s1.groups.length === 1 && s1.groups[0] === maker && s1.shown >= 1 && s1.shown < s0.shown && (s1.chips.find((c) => c.label === maker) || {}).pressed === 'true', JSON.stringify(s1));
		await f.locator(`${host} button[aria-pressed]`).first().click();
		await t.page.waitForTimeout(200);
		const s2 = await f.evaluate(STRIP);
		await t.check('keys: All brings every row back', s2.shown === s0.shown && s2.groups.length === makers.length, JSON.stringify({ shown: s2.shown, before: s0.shown }));
		await f.locator(searchSel(await openListId(f))).first().focus();
		await t.page.keyboard.type(word);
		await t.page.waitForTimeout(250);
		const shown = await f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'); const l = c && document.getElementById(c.getAttribute('aria-controls')); return l ? [...l.querySelectorAll('[role="option"]')].filter((n) => !n.hidden).map((n) => n.textContent.trim()) : []; });
		await t.check(`keys: typing "${word}" narrows the list to it`, shown.length >= 1 && shown.every((s) => s.toLowerCase().includes(word.toLowerCase())), JSON.stringify(shown));
		await t.page.keyboard.press('Enter');
		await t.page.waitForTimeout(600);
		const after = await f.evaluate(([id]) => {
			const sel = document.querySelector(`#pm-settings-root select[data-setting="${CSS.escape(id)}"]`);
			const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]');
			return { value: sel && sel.value, expanded: c && c.getAttribute('aria-expanded'), focus: !!(c && document.activeElement === c), text: c && c.textContent.trim() };
		}, [id]);
		await t.check(`keys: Enter picks ${word}; the row's own control follows`, after.value === target.value, `${after.value} vs ${target.value}`);
		await t.check('keys: focus is back on the closed picker, which names the pick', after.expanded === 'false' && after.focus && (after.text || '').includes(word), JSON.stringify(after));
		const reset = f.locator('#panel-settings .detail-inspector [data-action="reset-setting"]').first();
		if (await reset.count()) { await reset.click(); await t.page.waitForTimeout(500); }
		const back = await f.evaluate((id) => { const s = document.querySelector(`#pm-settings-root select[data-setting="${CSS.escape(id)}"]`); return s && s.value; }, id);
		await t.check('keys: Go back to the default restores it', back === b.value, `${back} vs ${b.value}`);
	},

	/* Reduced Motion (asked for, not assumed): the picker opens with nothing animating, every choice still there. */
	'FO-127 Reduced Motion': async (t) => {
		const id = String(t.args.setting || SETTING);
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'reduce' });
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		if (!(await openDetails(t, f, id))) return;
		const b = await judgeClosed(t, f, 'reduced motion', id);
		if (b.combos) {
			const before = await beforeOpen(t, f);
			await f.locator(PICKER).first().click();
			await t.page.waitForTimeout(60);
			await judgeOpen(t, f, 'reduced motion', b, { still: true, before });
			await t.page.keyboard.press('Escape');
		}
		await closeDetails(t, f);
		await t.emulate({ reducedMotion: 'no-preference' });
	},

	/* Each of the 11 long lists that opens from its page: one picker with no maker mark or strip, the whole list on
	   top; Arrow Down opens it, typing a choice's name narrows the list to it, Enter picks it, focus is back on the
	   closed picker naming it, the row's own control follows, and Go back to the default restores it. */
	'FO-127 the 11 long lists are one picker each': async (t) => {
		const ids = t.args.lists ? String(t.args.lists).split(',') : LONG;
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		const settleLook = () => f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		const opened = [], unreachable = [];
		for (const id of ids) {
			const nier = id === 'general.visual.nier-background';
			if (nier) await setLook(t, f, 'nier-dark');
			if (!(await openDetails(t, f, id, true))) { unreachable.push(id); if (nier) await setLook(t, f, 'basic-dark'); continue; }
			opened.push(id);
			const where = `long list ${id}`;
			const b = await judgeClosed(t, f, where, id);
			if (b.combos) {
				await t.check(`${where}: its picker has no maker mark`, !b.mark);
				const before = await beforeOpen(t, f);
				await f.locator(PICKER).first().focus();
				await t.page.keyboard.press('ArrowDown');
				await t.page.waitForTimeout(400);
				const o = await judgeOpen(t, f, where, b, { before });
				const rows = await f.evaluate(() => {
					const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
					const list = c && document.getElementById(c.getAttribute('aria-controls'));
					const host = list && (list.closest('.o55-pick-inline') || list.parentElement);
					return { strip: host ? host.querySelectorAll('[role="group"] button[aria-pressed]').length : -1, rows: list ? [...list.querySelectorAll('[role="option"]')].map((n) => ({ name: (((n.querySelector('strong') || n).firstChild || {}).textContent || '').trim(), sel: n.getAttribute('aria-selected') === 'true', off: n.getAttribute('aria-disabled') === 'true' })) : [] };
				});
				await t.check(`${where}: no maker strip`, rows.strip === 0, `${rows.strip} maker marks`);
				const names = rows.rows.map((r) => r.name.toLowerCase());
				const target = rows.rows.find((r) => r.name && !r.sel && !r.off && names.filter((n) => n.includes(r.name.toLowerCase())).length === 1);
				if (!target) { await t.check(`${where}: a choice with a name of its own to type`, false, JSON.stringify(rows.rows.slice(0, 6))); }
				else {
					await t.page.keyboard.type(target.name);
					await t.page.waitForTimeout(250);
					const shown = await f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'); const l = c && document.getElementById(c.getAttribute('aria-controls')); return l ? [...l.querySelectorAll('[role="option"]')].filter((n) => !n.hidden).map((n) => n.textContent.trim()) : []; });
					await t.check(`${where}: typing "${target.name}" narrows the list to it`, shown.length >= 1 && shown.every((x) => x.toLowerCase().includes(target.name.toLowerCase())), JSON.stringify(shown));
					await t.page.keyboard.press('Enter');
					await t.page.waitForTimeout(600);
					await settleLook();
					await t.page.waitForTimeout(400);
					const after = await f.evaluate(([id]) => {
						const sel = document.querySelector(`#pm-settings-root select[data-setting="${CSS.escape(id)}"]`);
						const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]');
						return { row: sel ? (sel.options[sel.selectedIndex] || {}).textContent : null, rowOffers: sel ? [...sel.options].map((o) => o.textContent.trim()) : [], expanded: c && c.getAttribute('aria-expanded'), focus: !!(c && document.activeElement === c), face: c ? (((c.querySelector('strong') || c).firstChild || {}).textContent || '').trim() : '' };
					}, [id]);
					await t.check(`${where}: Enter picks "${target.name}"; focus is back on the closed picker, which names it`, after.expanded === 'false' && after.focus && after.face === target.name, JSON.stringify(after));
					/* the row's own select follows when it offers that same choice (Theme's row offers families instead) */
					/* opened from its row, a per-thing setting saves on that thing, so its row follows too (L1S-N2) */
					if (after.rowOffers.some((x) => x.startsWith(target.name))) await t.check(`${where}: the row's own control follows`, (after.row || '').trim().startsWith(target.name), `row shows "${after.row}"`);
					const reset = f.locator('#panel-settings .detail-inspector [data-action="reset-setting"]').first();
					if (b.per) {
						await t.check(`${where}: a per-thing setting offers no single default to go back to`, !(await reset.count()), 'a reset button is shown');
						/* put the thing's own value back through the same picker */
						await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().focus();
						await t.page.keyboard.press('ArrowDown'); await t.page.waitForTimeout(300);
						await t.page.keyboard.type(b.face.trim()); await t.page.waitForTimeout(200);
						await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(500);
						const again = await f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]'); return c ? (((c.querySelector('strong') || c).firstChild || {}).textContent || '').trim() : ''; });
						await t.check(`${where}: picking "${b.face.trim()}" again puts its value back`, again === b.face.trim(), `now "${again}"`);
					}
					else {
						/* the default as the settings inventory names it (an earlier test may have left a saved value
						   that is not the default: Theme on the last look of the all-looks pass) */
						const def = await f.evaluate((id) => { try { const st = PM51.setting(id); return String(PM51.valueLabel(id, st.value)).split(' · ')[0]; } catch (e) { return ''; } }, id);
						if (await reset.count()) { await reset.click(); await t.page.waitForTimeout(500); await settleLook(); }
						const back = await f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]'); return c ? (((c.querySelector('strong') || c).firstChild || {}).textContent || '').trim() : ''; });
						await t.check(`${where}: Go back to the default restores the default ("${def}")`, !!def && back === def, `now "${back}"`);
					}
				}
			}
			await closeDetails(t, f);
			if (nier) await setLook(t, f, 'basic-dark');
		}
		t.log(`long lists opened: ${opened.join(', ')}; not reachable from a page in this fixture: ${unreachable.join(', ') || 'none'}`);
		await t.check(`at least 7 of the long lists open from their pages (${opened.length} of ${ids.length})`, opened.length >= Math.min(7, ids.length), `not reachable: ${unreachable.join(', ')}`);
	},

	/* sol-review-l1s L1S-N2: a per-thing setting picked in Details is stored on the thing it was opened from, through
	   that thing's own row: a Goal template's Kind of job (a persona's Preferred model was the other, until DL-476
	   retired it). The thing's row and its line in the Now list change, the shared setting does not, and
	   picking its first value again puts it back. Opened any other way (here, as the "Next to it" links open it) the
	   picker is read only: "What it can be", every choice unavailable, and a pick saves nothing anywhere. */
	'FO-127 a per-thing setting saves on its thing': async (t) => {
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		const SNAP = (id) => {
			const row = [...document.querySelectorAll('#pm-settings-root .o55-scoped')].find((r) => r.dataset.settingId === id && r.getClientRects().length);
			const sel = row && row.querySelector('select[data-scope]');
			const now = [...document.querySelectorAll('#panel-settings .detail-inspector .o55-insp-per li')].map((li) => li.textContent.replace(/\s+/g, ' ').trim());
			const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]');
			const block = c && c.closest('.o55-insp-block'), head = block && block.querySelector('h4');
			return { owner: sel ? sel.value : null, ownerLabel: sel ? ((sel.options[sel.selectedIndex] || {}).textContent || '').trim() : null, shared: JSON.stringify(window.PM51 && PM51.value ? PM51.value(id) : null), now, face: c ? (((c.querySelector('strong') || c).firstChild || {}).textContent || '').trim() : '', head: head && head.firstChild ? head.firstChild.textContent.trim() : '' };
		};
		const pickByName = async (name) => {
			await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().focus();
			await t.page.keyboard.press('ArrowDown'); await t.page.waitForTimeout(300);
			await t.page.keyboard.type(name); await t.page.waitForTimeout(250);
			await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(600);
		};
		/* the persona's own model (personas.tuning.default-model) is retired by Settings batch 3 (DL-476, MD2 'neither') */
		for (const [id, thing, prefer] of [['planning.verification.goal-template', 'template', null]]) {
			const pl = await f.evaluate((id) => PM51.placement.byId[id] || null, id);
			if (!pl) { await t.check(`${thing}: ${id} is placed`, false); continue; }
			await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${pl.domain}"]`).first().click(); await t.settle();
			if (pl.tab) { await f.locator(`#pm-settings-root [data-tab="${pl.tab}"]`).first().click().catch(() => {}); await t.settle(); }
			if (prefer) { const r = f.locator('#pm-settings-root .resource-row').filter({ hasText: prefer }).first(); if (await r.count()) { await r.click(); await t.settle(); } }
			await f.evaluate((id) => { const row = [...document.querySelectorAll('#pm-settings-root .o55-scoped')].find((r) => r.dataset.settingId === id); const d = row && row.closest('details:not([open])'); if (d) d.open = true; }, id);
			const about = f.locator(`#pm-settings-root .o55-scoped[data-setting-id="${id}"] .o55-about`).first();
			if (!(await about.count()) || !(await about.isVisible())) { await t.check(`${thing}: its own ${id} row is shown`, false, 'no visible scoped row to open Details from'); continue; }
			const before = await f.evaluate(SNAP, id);
			await about.evaluate((el) => el.scrollIntoView({ block: 'center' })); await about.click();
			await f.waitForSelector('#panel-settings .detail-inspector .o55-insp-now.is-per', { timeout: 8000 }); await t.settle();
			const opened = await f.evaluate(SNAP, id);
			await t.check(`${thing}: opened from its row, the picker shows that ${thing}'s own value ("${before.ownerLabel}")`, !!before.ownerLabel && opened.face === before.ownerLabel && opened.head === 'Your choices', JSON.stringify({ face: opened.face, head: opened.head }));
			const target = await f.evaluate(([id, cur]) => {
				const row = [...document.querySelectorAll('#pm-settings-root .o55-scoped')].find((r) => r.dataset.settingId === id && r.getClientRects().length);
				const sel = row.querySelector('select[data-scope]');
				const all = [...sel.options].filter((o) => o.dataset.disabled !== '1').map((o) => ({ value: o.value, label: o.textContent.trim() }));
				const own = (o) => all.filter((x) => x.label.toLowerCase().includes(o.label.toLowerCase())).length === 1;
				const cand = all.filter((o) => o.value !== cur && own(o));
				return cand.find((o) => /claude opus/i.test(o.label)) || cand[0] || null;
			}, [id, before.owner]);
			if (!target) { await t.check(`${thing}: a choice to pick`, false); continue; }
			/* the picker shows a model's name, its service on the line under it */
			await pickByName(target.label.split(' · ')[0]);
			const after = await f.evaluate(SNAP, id);
			await t.check(`${thing}: picking "${target.label}" stores it on that ${thing} (its row now ${target.value})`, after.owner === target.value, `row value ${after.owner}`);
			await t.check(`${thing}: the shared ${id} is not written`, after.shared === before.shared, `${before.shared} became ${after.shared}`);
			const changed = after.now.filter((x, i) => x !== opened.now[i]);
			await t.check(`${thing}: exactly that ${thing}'s line in the Now list changes, to "${target.label}"`, changed.length === 1 && changed[0].includes(target.label.split(' · ')[0]), JSON.stringify(changed));
			await t.check(`${thing}: the picker names the ${thing}'s new value`, after.face === target.label.split(' · ')[0], `face "${after.face}"`);
			await pickByName(before.ownerLabel);
			const back = await f.evaluate(SNAP, id);
			await t.check(`${thing}: picking "${before.ownerLabel}" again puts it back, and the Now list with it`, back.owner === before.owner && JSON.stringify(back.now) === JSON.stringify(opened.now) && back.shared === before.shared, JSON.stringify({ owner: back.owner, shared: back.shared }));
			await closeDetails(t, f);
			/* opened as the "Next to it" links open it: not from the thing's row, so read only */
			await f.evaluate(([id, pl]) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.action = 'setting-details'; b.dataset.setting = id; b.dataset.workspace = pl.workspace || ''; b.dataset.section = pl.section || ''; document.querySelector('#pm-settings-root').appendChild(b); b.click(); b.remove(); }, [id, pl]);
			await f.waitForSelector('#panel-settings .detail-inspector .o55-insp-head', { timeout: 8000 }); await t.settle();
			const ro = await f.evaluate(SNAP, id);
			await t.check(`${thing}: opened elsewhere, its picker is read only ("What it can be", no value of its own)`, ro.head === 'What it can be' && /^See the \d+ choices$/.test(ro.face), JSON.stringify({ head: ro.head, face: ro.face }));
			const trig = f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first();
			if (await trig.count()) {
				await trig.click(); await t.page.waitForTimeout(400);
				const opts = await f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'); const l = c && document.getElementById(c.getAttribute('aria-controls')); const o = l ? [...l.querySelectorAll('[role="option"]')] : []; return { n: o.length, off: o.filter((x) => x.getAttribute('aria-disabled') === 'true').length, sel: o.filter((x) => x.getAttribute('aria-selected') === 'true').length }; });
				await t.check(`${thing}: read only, every one of its ${opts.n} choices is unavailable and none is selected`, opts.n > 1 && opts.off === opts.n && opts.sel === 0, JSON.stringify(opts));
				const first = f.locator(`${listSel(await openListId(f))} [role="option"]`).first();
				/* a click on an unavailable choice (Playwright will not press a disabled one, so the event is sent) */
				if (await first.count()) await first.dispatchEvent('click');
				await t.page.waitForTimeout(400);
				await t.page.keyboard.press('Escape');
			}
			const still = await f.evaluate((id) => JSON.stringify(window.PM51 && PM51.value ? PM51.value(id) : null), id);
			await t.check(`${thing}: read only, a pick saves nothing`, still === before.shared, `${before.shared} became ${still}`);
			await closeDetails(t, f);
		}
	},

	/* opus-recheck-b10d127 F1 (and its 1280x500 follow-up): walking the unfolded list with Page Down, Arrow Up, Page Up
	   and Arrow Down keeps the active row (the search box's aria-activedescendant) wholly visible after every key (inside
	   the list, the Details panel's scrolled view, the window and above the status bar), in a model setting and two long
	   lists, at 1390x900, 1280x500 and 740x900 (--set arrowSizes=), with motion and under Reduced Motion. The old scroll used offsetTop against
	   another box: Arrow Up hid the row, and under Reduced Motion every step did. FO-178: the walk happens in the popup
	   over the panel (its list is its own scroll box), and nothing in the Details panel moves from before the picker
	   opened to the last key (FO-127's inline list scrolled the panel to show the row at 1280x500). */
	'FO-127 arrow keys keep the active row in view': async (t) => {
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		const VIS = () => {
			const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
			const list = c && document.getElementById(c.getAttribute('aria-controls'));
			const host = list && (list.closest('.o55-pick-inline') || list.parentElement);
			const search = host && host.querySelector('input[type="search"]');
			const id = search && search.getAttribute('aria-activedescendant');
			const n = id && document.getElementById(id);
			if (!list || !n) return { ok: false, why: 'no open list or no active option' };
			/* what a person can see: the list, every scroller that holds it (the Details panel's body), the window,
			   and above the status bar */
			const clip = { top: 0, bottom: innerHeight, by: 'window' };
			for (let el = list; el && el !== document.documentElement; el = el.parentElement) {
				const cs = getComputedStyle(el);
				if (el !== list && cs.overflowY === 'visible' && cs.overflowX === 'visible') continue;
				const r = el.getBoundingClientRect();
				if (r.top > clip.top) { clip.top = r.top; clip.byTop = el.className.split(' ')[0] || el.tagName; }
				if (r.bottom < clip.bottom) { clip.bottom = r.bottom; clip.by = el.className.split(' ')[0] || el.tagName; }
			}
			const sb = document.querySelector('.pm7-statusbar');
			if (sb) { const b = sb.getBoundingClientRect(); if (b.height > 0 && b.top < clip.bottom) { clip.bottom = b.top; clip.by = 'status bar'; } }
			const nr = n.getBoundingClientRect();
			return { ok: nr.top >= clip.top - 0.5 && nr.bottom <= clip.bottom + 0.5, top: Math.round(nr.top - clip.top), bottom: Math.round(clip.bottom - nr.bottom), by: nr.bottom > clip.bottom + 0.5 ? clip.by : clip.byTop, name: n.textContent.trim().slice(0, 30), focus: document.activeElement === search };
		};
		const KEYS = [...Array(8).fill('PageDown'), ...Array(20).fill('ArrowUp'), ...Array(3).fill('PageUp'), ...Array(20).fill('ArrowDown')];
		const sizes = (t.args.arrowSizes ? String(t.args.arrowSizes) : '1390x900,1280x500,740x900').split(',').map((x) => x.split('x').map(Number));
		for (const [w, h] of sizes) for (const motion of ['no-preference', 'reduce']) {
			await t.emulate({ reducedMotion: motion });
			for (const id of ['code.terminal.background-image', SETTING, 'code.editing.color-scheme']) {
				await t.viewport(1390, 900);
				if (!(await openDetails(t, f, id))) continue;
				if (w !== 1390 || h !== 900) { await t.viewport(w, h); await t.page.waitForTimeout(500); }
				const before = await beforeOpen(t, f);
				await f.locator(PICKER).first().focus();
				await t.page.keyboard.press('ArrowDown');
				await t.page.waitForTimeout(350);
				const o = await f.evaluate(OPEN);
				const misses = [], shifts = [];
				let lostFocus = 0;
				for (const k of KEYS) {
					await t.page.keyboard.press(k);
					const v = await f.evaluate(VIS);
					if (!v.ok) misses.push(`${k}: ${v.why || `top ${v.top}, bottom ${v.bottom}, cut by ${v.by} (${v.name})`}`);
					if (!v.focus) lostFocus++;
					const m = moved(before, await f.evaluate(PANEL)); if (m) shifts.push(`${k}: ${m}`);
				}
				await t.check(`arrows ${w}x${h} ${motion} ${id}: the active row stays wholly in view (list, Details panel, window, above the status bar) over ${KEYS.length} keys`, misses.length === 0, `${misses.length} out of view: ${misses.slice(0, 4).join(' | ')}`);
				await t.check(`arrows ${w}x${h} ${motion} ${id}: focus stays in the search box while walking`, lostFocus === 0, `${lostFocus} keys left focus elsewhere`);
				await t.check(`arrows ${w}x${h} ${motion} ${id}: FO-178 the walk stays in the popup over the panel (its own list scrolls) and the Details panel never moves`, !!o.layer && shifts.length === 0, !o.layer ? 'not a popup: the list is inside the panel' : `${shifts.length} of ${KEYS.length} keys moved the panel: ${shifts.slice(0, 3).join(' | ')}`);
				await t.page.keyboard.press('Escape');
				await closeDetails(t, f);
			}
		}
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1390, 900);
	},

	/* opus-recheck-b10d127 F3: the picker's search box is a menu's search field, not a show/hide toggle: hovering it
	   shows no "Hide the related choices" tag. */
	'FO-127 the search box has no show/hide hover tag': async (t) => {
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		if (!(await openDetails(t, f, 'code.terminal.background-image'))) return;
		await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().click();
		await t.page.waitForTimeout(400);
		const search = f.locator(searchSel(await openListId(f))).first();
		await search.hover();
		await t.page.waitForTimeout(1200);
		/* what a person sees (the visible tag) and what a screen reader hears (the box's own description) */
		const tag = await f.evaluate(() => {
			const v = document.getElementById('pm-hover-tag-visual');
			const shown = v && v.getClientRects().length && getComputedStyle(v).visibility !== 'hidden' && getComputedStyle(v).opacity !== '0' ? v.textContent.replace(/\s+/g, ' ').trim() : '';
			const c = document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]');
			const s = c && document.querySelector(`input[type="search"][aria-controls="${c.getAttribute('aria-controls')}"]`);
			const desc = s ? (s.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).map((id) => (document.getElementById(id) || {}).textContent || '').join(' ') : '';
			return { shown, desc };
		});
		await t.check('hovering the search box shows no "Hide the related choices" tag', !/related choices/i.test(tag.shown), `visible tag "${tag.shown.slice(0, 120)}"`);
		await t.check('the search box is not described as a show/hide toggle', !/related choices/i.test(tag.desc), `described as "${tag.desc.slice(0, 120)}"`);
		await t.page.keyboard.press('Escape');
		await closeDetails(t, f);
	},

	/* Every Settings side panel's head (PM51.panel, the one builder they all use: sign-in, Check connection, the
	   managers' sheets), opened here with the builder itself; the ready tone too, all ten looks. */
	'FO-127 side panel head tile, all looks': async (t) => {
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		for (const look of looks) {
			await setLook(t, f, look);
			for (const tone of ['', 'ready']) {
				await f.evaluate((tone) => PM51.panel({ title: 'Check connection', subtitle: 'Claude', icon: 'test', tone, body: PM51.panelSection('What happens', '<p>One short request.</p>'), primaryLabel: 'Check now', onPrimary: () => false }), tone);
				await f.waitForSelector('#panel-settings .pm51-panel .pm51-hero-icon', { timeout: 8000 });
				await t.page.waitForTimeout(500);
				await guardLook(t, f, look, `${look} side panel${tone ? ' ' + tone : ''}`);
				await judgeTile(t, f, `${look} side panel${tone ? ' ' + tone : ''}`, '#panel-settings .pm51-panel .pm51-hero-icon');
				await f.locator('#panel-settings .pm51-panel [data-action="close-overlay"]').first().click().catch(() => {});
				await t.page.waitForTimeout(450);
			}
		}
	},

	/* Every other list stays a list: an On/Off setting's two radios, and a list that takes several choices. */
	'FO-127 other lists stay lists': async (t) => {
		const f = await t.app.open();
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		if (!(await openDetails(t, f, 'general.interaction.question-cards'))) return;
		const b = await f.evaluate(BLOCK, 'general.interaction.question-cards');
		await t.check('On/Off: "Your choices" keeps its two radios and no picker', b.block && b.radios === 2 && b.combos === 0, `radios ${b.radios}, combobox ${b.combos}`);
		await closeDetails(t, f);
		/* opus-recheck-b10d127 F2: long single-choice lists Jared did not choose stay tick lists (the picker goes on
		   exactly the 13 model settings and the 11 he chose, by id). At least 3 of these 5 must open here. */
		let others = 0;
		for (const id of ['code.terminal.theme', 'code.terminal.font-family', 'safety.approvals.bsd-persona', 'safety.approvals.bsd-model', 'ai.accounts.soft-warning-level']) {
			if (!(await openDetails(t, f, id, true))) { t.log(`${id}: no Details reachable from its page here`); continue; }
			others++;
			const o = await f.evaluate(() => { const i = document.querySelector('#panel-settings .detail-inspector'); return { radios: i.querySelectorAll('.o55-insp-block [role="radio"]').length, combos: i.querySelectorAll('.o55-insp-block [role="combobox"]').length }; });
			await t.check(`${id} (not chosen by Jared): stays a tick list (${o.radios} radios)`, o.radios > 6 && o.combos === 0, `radios ${o.radios}, combobox ${o.combos}`);
			await closeDetails(t, f);
		}
		await t.check(`at least 3 of the 5 long lists Jared did not choose open here (${others})`, others >= 3, `${others} opened`);
		/* a list that takes several choices stays a tick list, however long ("Ways to fix, in order": 10) */
		if (!(await openDetails(t, f, 'planning.verification.repair-strategies'))) return;
		const mp = await f.evaluate(() => { const i = document.querySelector('#panel-settings .detail-inspector'); return { checks: i.querySelectorAll('.o55-insp-block [role="checkbox"]').length, combos: i.querySelectorAll('.o55-insp-block [role="combobox"]').length }; });
		await t.check(`Ways to fix (several choices): stays a tick list (${mp.checks} checkboxes)`, mp.checks > 6 && mp.combos === 0, `checkboxes ${mp.checks}, combobox ${mp.combos}`);
		await closeDetails(t, f);
	},

	/* FO-178 (Jared's Q6, answer A): at every size the kit uses, the list pops up over the Details panel, inside the
	   panel's sides, whole on screen and on top, right by its trigger (under it, or over it when there is no room under
	   it), and opening it moves nothing in the panel. A model setting, Theme (a short list) and Editor colors (the
	   longest), Basic Dark, either surface. --set popSizes= narrows the sizes. */
	'FO-178 the picker pops up over the panel at every size': async (t) => {
		const sizes = (t.args.popSizes ? String(t.args.popSizes) : POP_SIZES).split(',').map((x) => x.split('x').map(Number));
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		for (const [w, h] of sizes) for (const id of [SETTING, 'general.visual.theme', 'code.editing.color-scheme']) {
			await t.viewport(1390, 900);
			if (!(await openDetails(t, f, id))) continue;
			if (w !== 1390 || h !== 900) { await t.viewport(w, h); await t.page.waitForTimeout(500); }
			const where = `popup ${w}x${h} ${id}`;
			const b = await judgeClosed(t, f, where, id);
			if (b.combos) {
				const before = await beforeOpen(t, f);
				await f.locator(PICKER).first().click();
				await t.page.waitForTimeout(450);
				await judgeOpen(t, f, where, b, { before });
				await t.page.keyboard.press('Escape');
				await t.page.waitForTimeout(300);
			}
			await closeDetails(t, f);
		}
		await t.viewport(1390, 900);
	},

	/* FO-178: a press outside the popup closes it. On the Details panel's own title (or, where the popup covers it,
	   another spot of the panel with no control): the popup closes, the panel stays open, focus is not left in the closed
	   popup, and nothing in the panel moved. On the Settings page beside the panel (a spot with no control): the popup
	   closes. The model setting at 1390x900 (the popup under its trigger) and 1280x500 (over it), either surface. */
	'FO-178 a press outside closes the popup': async (t) => {
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		const STATE = () => ({ open: !!document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'), popped: !!document.querySelector('.o55-pick-pop.is-open'), panel: !!document.querySelector('#panel-settings .detail-inspector .o55-insp-head'), inPop: !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.o55-pick-pop, .o55-pick-inline')) });
		for (const [w, h] of [[1390, 900], [1280, 500]]) {
			await t.viewport(1390, 900);
			if (!(await openDetails(t, f, SETTING))) continue;
			if (w !== 1390 || h !== 900) { await t.viewport(w, h); await t.page.waitForTimeout(500); }
			const where = `outside ${w}x${h}`;
			for (const place of ['panel', 'page']) {
				const before = await beforeOpen(t, f);
				await f.locator(PICKER).first().click();
				await t.page.waitForTimeout(450);
				const o = await f.evaluate(OPEN);
				const spot = await f.evaluate(SPOT, place);
				if (!spot) { await t.check(`${where}: a spot of the ${place} with no control, outside the open list`, false, 'none found'); await t.page.keyboard.press('Escape'); continue; }
				await f.locator('html').click({ position: { x: spot.x, y: spot.y }, force: true });
				await t.page.waitForTimeout(350);
				const after = await f.evaluate(STATE), m = moved(before, await f.evaluate(PANEL));
				if (place === 'panel') await t.check(`${where}: FO-178 a press on the Details panel outside the popup (${spot.what}) closes the popup and keeps the panel, unmoved`, !!o.layer && !after.open && !after.popped && after.panel && !after.inPop && !m, !o.layer ? 'it never popped up over the panel (the list was inside it)' : m || JSON.stringify(after));
				else await t.check(`${where}: FO-178 a press on the Settings page beside the panel (${spot.what}) closes the popup`, !!o.layer && !after.open && !after.popped && !after.inPop, !o.layer ? 'it never popped up over the panel (the list was inside it)' : JSON.stringify(after));
				if (after.open) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); }
				if (!after.panel) break;
			}
			await closeDetails(t, f);
		}
		await t.viewport(1390, 900);
	},

	/* FO-178: the popup sits above the panel and above a toast (Settings' toasts appear near the top of the window, where
	   the popup reaches when it opens over its trigger), with and without FO-177's `isolation: isolate` on
	   #panel-settings: its corners, its middle and every point it shares with the toast reach the popup. The model
	   setting at 1280x500 and 1920x1080, the toast raised just before the picker opens; at least one cell must have the
	   toast and the popup overlap. */
	'FO-178 the popup sits above the panel and a toast': async (t) => {
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1390, 900);
		await f.locator('#tab-settings').click();
		await t.settle();
		let overlapped = 0;
		for (const iso of [false, true]) for (const [w, h] of [[1280, 500], [1920, 1080]]) {
			await f.evaluate((iso) => { let st = document.getElementById('fo178-isolation'); if (iso && !st) { st = document.createElement('style'); st.id = 'fo178-isolation'; st.textContent = '#panel-settings { isolation: isolate; }'; document.head.appendChild(st); } if (!iso && st) st.remove(); }, iso);
			await t.viewport(1390, 900);
			if (!(await openDetails(t, f, SETTING))) continue;
			if (w !== 1390 || h !== 900) { await t.viewport(w, h); await t.page.waitForTimeout(500); }
			const where = `stacking ${w}x${h}${iso ? ', #panel-settings isolated' : ''}`;
			const isolated = await f.evaluate(() => getComputedStyle(document.getElementById('panel-settings')).isolation);
			await t.check(`${where}: the panel's isolation is ${iso ? 'isolate' : 'as the page has it'}`, iso ? isolated === 'isolate' : true, isolated);
			/* a toast on screen first (the notification centre holds a new one back while focus is in a search box, so
			   it is raised before the picker opens), then the popup opens over it */
			const title = `FO-178 toast ${w}x${h}${iso ? ' isolated' : ''}`;
			await f.evaluate((title) => PM51.toast(title, 'A toast under the picker', 'info'), title);
			const shown = await f.waitForFunction((title) => [...document.querySelectorAll('body *')].some((e) => { if (!(e.textContent || '').includes(title) || !e.getClientRects().length) return false; const r = e.getBoundingClientRect(); return r.top > -24 && r.bottom > 20 && r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight && r.height >= 40 && r.height <= 200 && r.width >= 200; }), title, { timeout: 6000, polling: 100 }).then(() => true, () => false);
			await t.check(`${where}: the toast is on screen`, shown, 'no toast card on screen within 6 s');
			await f.locator(PICKER).first().click();
			await t.page.waitForTimeout(450);
			const r = await f.evaluate(STACK, title);
			t.log(`${where}: popup ${JSON.stringify(r.box)}, toast ${JSON.stringify(r.toast)}, ${r.points.length} shared points`);
			if (r.points.length) overlapped++;
			const off = r.corners.concat(r.points).filter((x) => x !== 'popup');
			await t.check(`${where}: FO-178 the popup is on top of the panel and the toast (its corners, its middle and ${r.points.length} points it shares with the toast reach it)`, r.open && r.layer && off.length === 0, !r.open ? 'no open list' : !r.layer ? 'not a popup: the list is inside the panel' : `reached instead: ${off.slice(0, 4).join(' | ')}; toast ${JSON.stringify(r.toast)}`);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(300);
			await closeDetails(t, f);
		}
		await f.evaluate(() => { const st = document.getElementById('fo178-isolation'); if (st) st.remove(); });
		await t.check(`FO-178 a toast overlapped the popup in at least one cell (${overlapped} of 4)`, overlapped >= 1, 'the toast never met the popup, so its stacking was not tested');
		await t.viewport(1390, 900);
	}
};
