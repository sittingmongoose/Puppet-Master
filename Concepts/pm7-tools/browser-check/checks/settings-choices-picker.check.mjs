// FO-127 (Jared's settings feedback #2, 2026-11-09): "Shouldnt the your choices list be a drop down rather than listing
// every model down the page? you could use the model selector from assistant chat." His picks: "option b" (2026-11-10)
// and "looks good, I choose all 11" (2026-11-11). In the Settings Details panel, "Your choices" of a model setting, and
// of every other single choice with more than 6 choices (the 11 long lists), is one picker (a combobox, the chat's
// model selector) whose listbox unfolds inside the panel under it; a model setting's has a strip of maker marks that
// filters it, a long list's has none. Every choice stays reachable through it, by pointer and by keys, in all ten
// looks, at a standard and a narrow width, with Reduced Motion, on either surface (--set sandbox=0/1). Short lists
// (On/Off) and lists that take several choices stay tick lists. His #1 ("that logo looks terrible", most right-side
// panels), pick icon B: the head tile of the Details panel and of every Settings side panel draws the PM glyph (PMG:
// data-nx, a glyph PMG.has) in a quiet tile with no outer glow (every box-shadow layer inset). Semantics and geometry
// only (roles, names, states, hit-tests, boxes, computed styles); no eye. Tile geometry and tick centring stay
// settings-inspector-fit's.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-choices-picker.check.mjs --set page=<build>
// --set looks=a,b narrows the looks; --set sizes=1390x900,740x900 the sizes; --set setting=<id> another model setting;
// --set lists=<id,id> narrows the long lists.
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
	return {
		inPanel: !!(insp && insp.contains(host)), panel: ib ? { left: ib.left, right: ib.right } : null,
		open: true, role: list.getAttribute('role'), label: list.getAttribute('aria-label') || '',
		total: opts.length, labels: opts.map((o) => o.textContent.trim()), selected: opts.filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.textContent.trim()),
		names: opts.map((o) => (((o.querySelector('strong') || o).firstChild || {}).textContent || '').trim()),
		host: { left: hb.left, right: hb.right, top: hb.top, bottom: hb.bottom }, vw: innerWidth, vh: innerHeight, sbTop,
		hits, searchFocused: !!search && act === search, activeDesc: search ? search.getAttribute('aria-activedescendant') : null,
		activeExists: !!(search && search.getAttribute('aria-activedescendant') && document.getElementById(search.getAttribute('aria-activedescendant'))),
		running: host.getAnimations ? host.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length : 0
	};
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
async function judgeOpen(t, f, where, b, { still = false } = {}) {
	const o = await f.evaluate(OPEN);
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
	await t.check(`${where}: the list unfolds inside the Details panel`, o.inPanel && !!o.panel && o.host.left >= o.panel.left - 0.5 && o.host.right <= o.panel.right + 0.5, JSON.stringify({ host: o.host, panel: o.panel }));
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
					await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().click();
					await t.page.waitForTimeout(450);
					await judgeOpen(t, f, where, b);
					await t.page.keyboard.press('Escape');
					await t.page.waitForTimeout(300);
					const after = await f.evaluate(() => ({ open: !!document.querySelector('#panel-settings .detail-inspector [role="combobox"][aria-expanded="true"]'), panel: !!document.querySelector('#panel-settings .detail-inspector .o55-insp-head'), focus: !!(document.activeElement && document.activeElement.matches('#panel-settings .detail-inspector [role="combobox"]')) }));
					await t.check(`${where}: Escape closes the picker, keeps the panel, and returns focus to the picker`, !after.open && after.panel && after.focus, JSON.stringify(after));
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
		const host = '#panel-settings .detail-inspector [role="group"]';
		await f.locator(`${host} button[aria-label="${maker}"]`).first().click();
		await t.page.waitForTimeout(200);
		const s1 = await f.evaluate(STRIP);
		await t.check(`keys: the ${maker} mark leaves only its section, and says it is pressed`, s1.groups.length === 1 && s1.groups[0] === maker && s1.shown >= 1 && s1.shown < s0.shown && (s1.chips.find((c) => c.label === maker) || {}).pressed === 'true', JSON.stringify(s1));
		await f.locator(`${host} button[aria-pressed]`).first().click();
		await t.page.waitForTimeout(200);
		const s2 = await f.evaluate(STRIP);
		await t.check('keys: All brings every row back', s2.shown === s0.shown && s2.groups.length === makers.length, JSON.stringify({ shown: s2.shown, before: s0.shown }));
		await f.locator('#panel-settings .detail-inspector input[type="search"][role="combobox"]').first().focus();
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
			await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().click();
			await t.page.waitForTimeout(60);
			await judgeOpen(t, f, 'reduced motion', b, { still: true });
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
				await f.locator('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]').first().focus();
				await t.page.keyboard.press('ArrowDown');
				await t.page.waitForTimeout(400);
				const o = await judgeOpen(t, f, where, b);
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
					const after = await f.evaluate(([id]) => {
						const sel = document.querySelector(`#pm-settings-root select[data-setting="${CSS.escape(id)}"]`);
						const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]');
						return { row: sel ? (sel.options[sel.selectedIndex] || {}).textContent : null, rowOffers: sel ? [...sel.options].map((o) => o.textContent.trim()) : [], expanded: c && c.getAttribute('aria-expanded'), focus: !!(c && document.activeElement === c), face: c ? (((c.querySelector('strong') || c).firstChild || {}).textContent || '').trim() : '' };
					}, [id]);
					await t.check(`${where}: Enter picks "${target.name}"; focus is back on the closed picker, which names it`, after.expanded === 'false' && after.focus && after.face === target.name, JSON.stringify(after));
					/* the row's own select follows when it offers that same choice (Theme's row offers families instead) */
					/* (a per-scope setting's row shows one scope's value, not the shared one the picker set) */
					if (!b.per && after.rowOffers.some((x) => x.startsWith(target.name))) await t.check(`${where}: the row's own control follows`, (after.row || '').trim().startsWith(target.name), `row shows "${after.row}"`);
					const reset = f.locator('#panel-settings .detail-inspector [data-action="reset-setting"]').first();
					if (b.per) await t.check(`${where}: a per-scope setting offers no single default to go back to`, !(await reset.count()), 'a reset button is shown');
					else {
						if (await reset.count()) { await reset.click(); await t.page.waitForTimeout(500); await settleLook(); }
						const back = await f.evaluate(() => { const c = document.querySelector('#panel-settings .detail-inspector .o55-insp-block [role="combobox"]'); return c ? (((c.querySelector('strong') || c).firstChild || {}).textContent || '').trim() : ''; });
						await t.check(`${where}: Go back to the default restores "${b.face.trim()}"`, back === b.face.trim(), `now "${back}"`);
					}
				}
			}
			await closeDetails(t, f);
			if (nier) await setLook(t, f, 'basic-dark');
		}
		t.log(`long lists opened: ${opened.join(', ')}; not reachable from a page in this fixture: ${unreachable.join(', ') || 'none'}`);
		await t.check(`at least 7 of the long lists open from their pages (${opened.length} of ${ids.length})`, opened.length >= Math.min(7, ids.length), `not reachable: ${unreachable.join(', ')}`);
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
		/* a list that takes several choices stays a tick list, however long ("Ways to fix, in order": 10) */
		if (!(await openDetails(t, f, 'planning.verification.repair-strategies'))) return;
		const mp = await f.evaluate(() => { const i = document.querySelector('#panel-settings .detail-inspector'); return { checks: i.querySelectorAll('.o55-insp-block [role="checkbox"]').length, combos: i.querySelectorAll('.o55-insp-block [role="combobox"]').length }; });
		await t.check(`Ways to fix (several choices): stays a tick list (${mp.checks} checkboxes)`, mp.checks > 6 && mp.combos === 0, `checkboxes ${mp.checks}, combobox ${mp.combos}`);
		await closeDetails(t, f);
	}
};
