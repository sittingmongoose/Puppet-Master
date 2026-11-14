// FO-182 / FO-183 / FO-184 (Jared's Settings review, 2026-11-13, items 1, 2 and 7).
// 1 "The model selector is sometimes the correct one, sometimes the just list drop down ... It also says same as project
//   as an option...but what is the projects value here then...that makes no sense. It should be a model."
// 2 "Some model entry sections are just a blank field, like Easy, routine jobs."
// 7 "The top tabs should probably be centered. 'Providers & Accounts / Web & Research / Media & Output / Back Seat Driver'"
// Canon: every model_picker row of Plans/settings_inventory.json (read here from disk, all of them) has the
// presentation_contract "Use the shared chat model picker as an overlay, with depth inside it. Show the inherited source
// and its current model/depth."; Models_System 7.1: the depths show beside the list (inside the picker when there is no
// room) and the model and depth are saved together.
// For every inventory model row, where PMConcept7 draws it (Settings › Models, the Back Seat Driver, an account's own
// rows, the Media abilities' model fields), by real presses, in all ten looks at 1920x1080 and 740x900 (the narrowest
// Settings width the kit uses):
//   shared   its control is the shared picker (the Details panel's .o55-pick-trigger, a combobox) and a press opens the
//            shared popup (.o55-pick-pop, a fixed layer in <body>, corners and middle on top), not a plain list
//   blank    its face names a value in words: never empty and never a stored token (inherit, Default, None, auto)
//   inherit  a row whose inventory has option_labels.inherit offers that choice in those words, first, with the model it
//            resolves to now on its small line; no choice anywhere says "Same as the project"; a row with no inherit
//            label offers no "Same as …" choice
//   depth    a row of chat models has models with depths; a press on one shows its depths (Model default and its
//            levels) beside the list or inside the popup, on top, and saves nothing yet; a manager's own list of models
//            that have no depths shows none
// Then: a model and its depth save together (pointer and keys) and the rows that follow it name both; the picker's model
// settings are exactly the inventory's model_picker rows and per-lane-model is gone; and FO-184's centred top tab strip
// (its tabs' middle within 1 px of the strip's middle, one line, nothing clipped; the page tabs under it likewise in
// the middle of the page they head, under its centred title) at 1920x1080, 860x900, 740x900 and
// 1280x500 with Files docked. --set crops=1 (and --set cropDir=<dir>) writes the crops for Jared.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-model-rows.check.mjs --set page=<build> --set sandbox=0
// --set looks=a,b  --set sizes=1920x1080,740x900  --set rows=<id,id> narrow the matrix.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INVENTORY = JSON.parse(fs.readFileSync(path.resolve(HERE, '..', '..', '..', '..', 'Plans', 'settings_inventory.json'), 'utf8'));
const CANON = Object.fromEntries(INVENTORY.settings.filter((r) => r.type === 'model_picker').map((r) => [r.id, {
	label: r.label, inherit: (r.option_labels || {}).inherit || null, from: (r.model_picker || {}).inherit_from || null,
	catalog: (r.model_picker || {}).catalog || null, options: (r.options || []).filter((o) => typeof o === 'string')
}]));
const RETIRED = 'ai.models.per-lane-model';
/* where each row is drawn, as a person reaches it */
const PLACE = {
	'ai.models.default-model': 'models', 'ai.models.overseer-model': 'models', 'ai.models.worker-model': 'models', 'ai.models.low-effort-worker-model': 'models',
	'ai.models.gui-worker-model': 'models', 'ai.models.high-effort-worker-model': 'models', 'ai.models.auditor-model': 'models', 'ai.models.teach-model': 'models',
	'ai.models.thread-title-model': 'models', 'safety.approvals.bsd-model': 'bsd', 'ai.accounts.default-model': 'account',
	'media.image.model': 'media:image-generation', 'media.capabilities.video-model': 'media:video-generation', 'media.capabilities.tts-model': 'media:text-to-speech',
	'media.capabilities.music-model': 'media:audio-generation', 'media.io.vision-fallback-model': 'vision'
};
const CHAT = (id) => ['live', 'account'].includes((CANON[id] || {}).catalog);
const TOKEN = /^(inherit|default|none|auto|null|undefined)$/i;
const SIZES = '1920x1080,740x900';

/* ---------- reaching a row ---------------------------------------------------------------------------------------- */
let SIZE = [1920, 1080];   // the cell's size, set by the matrix (a narrow cell picks an ability where its list shows)
async function press(t, f, sel, what) {
	/* the first one shown; a link a narrow Settings folds away (the chapter rail) is not pressed: the page is there */
	const loc = f.locator(sel).filter({ visible: true }).first();
	if (!(await loc.count())) return false;
	await loc.scrollIntoViewIfNeeded().catch(() => {});
	await loc.click({ timeout: 8000 }).catch((e) => t.log(`press ${what || sel}: ${e.message.split('\n')[0]}`));
	await t.settle();
	return true;
}
async function closeAll(t, f) {
	for (let i = 0; i < 3; i++) {
		const open = await f.evaluate(() => !!document.querySelector('.o55-pick-pop.is-open, .pm51-popout.pm51-dd-list'));
		if (!open) break;
		await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250);
	}
	const panel = f.locator('#panel-settings .pm51-panel [data-action="close-overlay"], #panel-settings .pm51-panel .pm51-panel-close').first();
	if (await panel.count() && await panel.isVisible().catch(() => false)) { await panel.click().catch(() => {}); await t.page.waitForTimeout(450); }
}
async function goPage(t, f, domain, workspace, tab) {
	await press(t, f, `#pm-settings-root [data-action="navigate-domain"][data-domain="${domain}"]`);
	await press(t, f, `#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="${workspace}"]`);
	if (tab) await press(t, f, `#pm-settings-root [data-pm51-manager] .pm51-tabs [data-tab="${tab}"], #pm-settings-root .manager-tab[data-tab="${tab}"]`);
}
/* the row's control, on whichever page or panel draws it: the shared picker's .o55-msel, else the row's own control */
const CTL = ([id, scope]) => {
	const vis = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
	const inPanel = scope === 'panel';
	const root = inPanel ? [...document.querySelectorAll('#panel-settings .pm51-panel')].filter(vis).pop() : document.querySelector('#pm-settings-root');
	if (!root) return { found: false, why: inPanel ? 'no side panel open' : 'no Settings' };
	const esc = CSS.escape(id);
	let host = [...root.querySelectorAll(`.o55-msel[data-o55-msel="${esc}"]`)].find(vis);
	if (!host && !inPanel) { const row = [...root.querySelectorAll(`[id="setting-${esc}"], [data-setting-id="${esc}"]`)].find(vis); host = row && (row.querySelector('.setting-control') || row); }
	/* a manager's own model field before FO-182: the media panels' plain list */
	if (!host && inPanel) host = [...root.querySelectorAll('.pm51-dd:has(> select.pm51-media-model), .pm51-dd:has(> select[data-action="pm51-media-fb-add"])')].find(vis);
	if (!host) return { found: false, why: 'drawn nowhere here' };
	const combo = host.querySelector('[role="combobox"]');
	const input = host.querySelector('input:not([type="hidden"]):not(.pm51-dd-native), textarea');
	const strong = combo && combo.querySelector('strong');
	const name = combo ? ((strong || combo.querySelector('.pm51-dd-value') || combo).textContent || '').trim() : input ? input.value : (host.textContent || '').trim();
	const r = (combo || input || host).getBoundingClientRect();
	return {
		found: true, shared: !!(combo && combo.classList.contains('o55-pick-trigger') && combo.getAttribute('aria-haspopup') === 'listbox'),
		kind: combo ? String(combo.className).split(' ').slice(0, 2).join('.') : input ? `a text box (value "${input.value}")` : 'no control',
		name, small: combo ? ((combo.querySelector('small') || {}).textContent || '').trim() : '', label: combo ? combo.getAttribute('aria-label') || '' : '',
		box: { left: r.left, right: r.right, top: r.top, bottom: r.bottom }, vw: innerWidth
	};
};
const ctlSel = (id, scope) => scope === 'panel'
	? `#panel-settings .pm51-panel :is(.o55-msel[data-o55-msel="${id}"], .pm51-dd:has(> select.pm51-media-model), .pm51-dd:has(> select[data-action="pm51-media-fb-add"])) [role="combobox"]`
	: `#pm-settings-root :is(.o55-msel[data-o55-msel="${id}"] [role="combobox"], [id="setting-${id}"] .setting-control [role="combobox"], [data-setting-id="${id}"] .setting-control [role="combobox"])`;

/* where each row is, reached by presses; returns the control's scope ('page' or 'panel') or null. A narrow cell folds
   the chapter rail into a menu and the abilities' list into a drawer, so the way there is pressed at 1920 and the
   cell's own size is back before the control is opened and judged. */
async function reach(t, f, id) {
	const place = PLACE[id] || 'models';
	/* a row already on screen (the Models page's nine) is pressed where it is */
	if (['models', 'bsd'].includes(place) && (await f.evaluate(CTL, [id, 'page'])).found) return 'page';
	const narrow = SIZE[0] < 1200;
	if (narrow) { await t.viewport(1920, 1080); await t.page.waitForTimeout(400); }
	try { return await reachAt(t, f, id, place); } finally { if (narrow) { await t.viewport(SIZE[0], SIZE[1]); await t.page.waitForTimeout(600); } }
}
async function reachAt(t, f, id, place) {
	if (place === 'models') { await goPage(t, f, 'ai', 'providers', 'models'); return 'page'; }
	if (place === 'bsd') { await goPage(t, f, 'ai', 'bsd', 'overview'); return 'page'; }
	if (place === 'account') {
		await goPage(t, f, 'ai', 'providers', 'services');
		await press(t, f, '#pm-settings-root #provider-roster .resource-row[data-provider="claude-code"]', 'Claude Code');
		const item = f.locator('#pm-settings-root .pm51-acc-item').first();
		if (await item.count() && !(await item.evaluate((n) => n.classList.contains('is-open')))) { await item.locator('.pm51-acc-toggle').first().click().catch(() => {}); await t.settle(); }
		return 'page';
	}
	if (place.startsWith('media:') || place === 'vision') {
		const route = place === 'vision' ? 'image-understanding' : place.slice(6);
		await goPage(t, f, 'ai', 'media', 'abilities');
		await press(t, f, `#pm-settings-root .pm51-roster .resource-row[data-id="${route}"]`, route);
		if (place === 'vision') {
			await press(t, f, `#pm-settings-root [data-action="pm51-media-fallbacks"][data-route="${route}"]`, 'If that fails, use › Edit');
			const mine = f.locator('#panel-settings .pm51-panel [data-action="pm51-media-vision-mode"][data-value="choose a specific model"]').first();
			if (await mine.count() && (await mine.getAttribute('aria-pressed')) !== 'true') { await mine.click().catch(() => {}); await t.settle(); }
			return 'panel';
		}
		await press(t, f, `#pm-settings-root [data-action="pm51-media-change"][data-route="${route}"]`, 'Change service');
		await f.waitForSelector('#panel-settings .pm51-panel', { timeout: 6000 }).catch(() => {});
		/* the picture panel draws its model field once a service is chosen: choose the first one that can be used */
		const has = await f.evaluate(() => !!document.querySelector('#panel-settings .pm51-panel :is(.o55-msel, select.pm51-media-model)'));
		if (!has) {
			const svc = f.locator('#panel-settings .pm51-panel .pm51-dd:has(> select.pm51-media-svc) .pm51-dd-trigger').first();
			if (await svc.count()) {
				await svc.click().catch(() => {}); await t.page.waitForTimeout(350);
				const opt = f.locator('.pm51-dd-list [role="option"]:not([aria-disabled="true"])').filter({ hasNotText: 'No service' }).first();
				if (await opt.count()) { await opt.click().catch(() => {}); await t.settle(); }
			}
		}
		return 'panel';
	}
	return null;
}

/* ---------- the open picker -------------------------------------------------------------------------------------- */
const POP = () => {
	const c = [...document.querySelectorAll('[role="combobox"][aria-expanded="true"]')].find((x) => x.getClientRects().length);
	const list = c && document.getElementById(c.getAttribute('aria-controls') || '');
	if (!list) return { open: false };
	const host = list.closest('.pm51-popout') || list;
	const hb = host.getBoundingClientRect();
	const reach = (x, y, box) => { const e = document.elementFromPoint(x, y); return e && box.contains(e) ? 'on' : e ? String(e.className || e.tagName).slice(0, 40) : 'nothing'; };
	const corners = [[hb.left + 6, hb.top + 6], [hb.right - 6, hb.top + 6], [hb.left + 6, hb.bottom - 6], [hb.right - 6, hb.bottom - 6], [(hb.left + hb.right) / 2, (hb.top + hb.bottom) / 2]].map(([x, y]) => reach(x, y, host));
	const opts = [...list.querySelectorAll('[role="option"]')].map((o) => ({
		name: (((o.querySelector('strong') || o.querySelector('.pm51-popout-label') || o).firstChild || {}).textContent || o.textContent || '').trim(),
		small: ((o.querySelector('small') || o.querySelector('.pm51-popout-meta') || {}).textContent || '').trim(),
		pre: o.dataset.pre === '1', levels: o.dataset.levels || '', index: o.dataset.index, hidden: o.hidden, selected: o.getAttribute('aria-selected') === 'true'
	}));
	const depth = [...document.querySelectorAll('[role="listbox"]')].find((l) => /^Thinking depth/.test(l.getAttribute('aria-label') || '') && l.getClientRects().length);
	let dep = null;
	if (depth) {
		const db = (depth.closest('.o55-depth') || depth).getBoundingClientRect();
		const dopts = [...depth.querySelectorAll('[role="option"]')];
		dep = { label: depth.getAttribute('aria-label'), names: dopts.map((o) => o.textContent.trim()), inside: !!depth.closest('.o55-depth-in'), on: dopts.every((o) => { const r = o.getBoundingClientRect(); return reach(r.left + r.width / 2, r.top + r.height / 2, o) === 'on'; }), box: { left: db.left, right: db.right, top: db.top, bottom: db.bottom }, focused: document.activeElement === depth };
	}
	return { open: true, shared: host.classList.contains('o55-pick-pop'), layer: host.parentElement === document.body && getComputedStyle(host).position === 'fixed', corners, kind: String(host.className).split(' ').slice(0, 3).join('.'), opts, depth: dep, host: { left: hb.left, right: hb.right, top: hb.top, bottom: hb.bottom }, vw: innerWidth, vh: innerHeight };
};
/* what the row's inherit choice should name: its source's model now (the source's own value, followed while it is the
   source's own inherit), in the page's own words for that model */
const RESOLVED = ([id, canon]) => {
	const word = (sid, v) => { const raw = v && typeof v === 'object' ? v.model_id : v; const l = String(PM51.valueLabel(sid, raw)); const p = l.split(' · '); return p.length > 1 ? p.slice(0, -1).join(' · ') : l; };
	let from = canon[id] && canon[id].from, guard = 0;
	if (from === 'normal_defaults') from = 'ai.models.default-model';
	while (from && canon[from] && guard++ < 6) {
		const v = PM51.value(from);
		if (v === 'inherit' && canon[from].from) { from = canon[from].from; continue; }
		return word(from, v);
	}
	return null;
};

/* ---------- one row ------------------------------------------------------------------------------------------- */
async function judgeRow(t, f, id, cell) {
	const where = `${cell} ${id}`;
	const scope = await reach(t, f, id);
	const c = await f.evaluate(CTL, [id, scope]);
	if (!c.found) { await t.check(`${where}: the row is drawn where it lives (${PLACE[id]})`, false, c.why); return null; }
	await t.check(`${where}: FO-182 its control is the shared model picker (${c.kind})`, c.shared, `a ${c.kind}, not the Details panel's picker button`);
	await t.check(`${where}: FO-183 it is not blank ("${c.name}"${c.small ? ` · ${c.small}` : ''})`, !!c.name && !TOKEN.test(c.name), c.name ? `it shows the stored token "${c.name}"` : 'it shows nothing');
	if (c.box.right > c.vw + 0.5 || c.box.left < -0.5) await t.check(`${where}: its control is inside the window`, false, JSON.stringify(c.box));
	const before = await f.evaluate((id) => { try { return JSON.stringify(PM51.value(id)); } catch (e) { return ''; } }, id);
	const trig = f.locator(ctlSel(id, scope)).first();
	if (!(await trig.count())) { await t.check(`${where}: it has a control a person can press`, false); return c; }
	await trig.scrollIntoViewIfNeeded().catch(() => {});
	await trig.click({ timeout: 8000 }).catch(() => {});
	await t.page.waitForTimeout(450);
	const o = await f.evaluate(POP);
	await t.check(`${where}: FO-182 a press opens the shared picker over the page (${o.open ? o.kind : 'nothing opened'})`, o.open && o.shared && o.layer && o.corners.every((x) => x === 'on'), o.open ? `${o.kind}; layer ${o.layer}; corners ${o.corners.join(',')}` : 'no listbox opened');
	if (!o.open) return c;
	const canon = CANON[id] || {};
	const project = o.opts.filter((x) => /same as the project/i.test(x.name));
	await t.check(`${where}: FO-182 no choice says "Same as the project"`, project.length === 0, project.map((x) => x.name).join(' | '));
	if (canon.inherit) {
		const first = o.opts[0] || {};
		const want = await f.evaluate(RESOLVED, [id, CANON]);
		await t.check(`${where}: FO-182 its inherit choice comes first in its own words ("${canon.inherit}")`, first.name === canon.inherit, `first choice "${first.name}"`);
		await t.check(`${where}: FO-182 the inherit choice names the model it resolves to now ("${want}")`, !!want && first.name === canon.inherit && first.small.includes(want), `its small line "${first.small}"`);
	} else {
		const same = o.opts.filter((x) => /^same as\b/i.test(x.name));
		await t.check(`${where}: FO-182 no inherit choice is invented (the inventory names none)`, same.length === 0, same.map((x) => x.name).join(' | '));
	}
	const models = o.opts.filter((x) => !x.pre);
	/* a row of chat models lists models; a media ability's own list may hold only its service's own default model (the
	   manager offers a model beside it only when the model can do that job) */
	if (CHAT(id)) await t.check(`${where}: it lists models (${models.length})`, models.length >= 1, `${o.opts.length} choices, none a model`);
	else await t.check(`${where}: it lists its choices (${o.opts.length}: ${o.opts.slice(0, 3).map((x) => x.name).join(', ')})`, o.opts.length >= 1);
	if (CHAT(id)) {
		const deep = o.opts.find((x) => x.levels && !x.selected) || o.opts.find((x) => x.levels);
		await t.check(`${where}: FO-182 its models carry their depths (${o.opts.filter((x) => x.levels).length} with depths)`, !!deep, 'no model in the list names a depth');
		if (deep) {
			const row = f.locator(`.o55-pick-pop.is-open [role="option"][data-index="${deep.index}"]`).first();
			await row.scrollIntoViewIfNeeded().catch(() => {});
			await row.click().catch(() => {});
			await t.page.waitForTimeout(350);
			const d = await f.evaluate(POP);
			const levels = deep.levels.split('|');
			const shown = d.depth ? d.depth.names : [];
			await t.check(`${where}: FO-182 choosing ${deep.name} shows its depths in the picker (${d.depth ? (d.depth.inside ? 'inside the popup' : 'beside the list') : 'none'})`, !!d.depth && d.open && shown.length === levels.length + 1 && /default/i.test(shown[0]) && levels.every((l, i) => shown[i + 1] === l), d.depth ? JSON.stringify(shown) : 'no depth listbox');
			if (d.depth) await t.check(`${where}: FO-182 its depths are on top and on screen`, d.depth.on && d.depth.box.left >= -0.5 && d.depth.box.right <= d.vw + 0.5 && d.depth.box.top >= -0.5 && d.depth.box.bottom <= d.vh + 0.5, JSON.stringify(d.depth.box));
			const after = await f.evaluate((id) => { try { return JSON.stringify(PM51.value(id)); } catch (e) { return ''; } }, id);
			await t.check(`${where}: FO-182 choosing a model with depths saves nothing yet, the picker stays open`, d.open && after === before, `open ${d.open}; value ${before} → ${after}`);
		}
	} else {
		await t.check(`${where}: a model without depths shows none`, !o.opts.some((x) => x.levels) && !o.depth, o.depth ? 'a depth listbox opened' : 'a model names depths');
	}
	await closeAll(t, f);
	return c;
}

async function settingsAt(t, f, w, h) {
	await t.viewport(w, h); await t.page.waitForTimeout(500);
}
const ROWS = (t) => (t.args.rows ? String(t.args.rows).split(',') : Object.keys(CANON)).filter((id) => PLACE[id]);

export const tests = {
	'FO-182/183 every model row is the shared picker, all looks': async (t) => {
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		const sizes = String(t.args.sizes || SIZES).split(',').map((s) => s.split('x').map(Number));
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		await t.check(`the inventory holds the model rows this check covers (${Object.keys(CANON).length})`, Object.keys(CANON).length >= 16 && Object.keys(CANON).every((id) => PLACE[id]), Object.keys(CANON).filter((id) => !PLACE[id]).join(', '));
		const table = {};
		for (const look of looks) {
			await t.viewport(1920, 1080);
			await setLookBySetting(t, f, look);
			for (const [w, h] of sizes) {
				const cell = `${look} ${w}x${h}`;
				await t.step(cell, async () => {
					SIZE = [w, h];
					await settingsAt(t, f, w, h);
					await guardPaintedLook(t, f, look, cell);
					for (const id of ROWS(t)) {
						const c = await judgeRow(t, f, id, cell);
						if (look === looks[0] && w === sizes[0][0]) table[id] = c ? { control: c.kind, shows: c.name, small: c.small } : { control: 'not drawn' };
					}
				});
			}
		}
		t.log('ROWS ' + JSON.stringify(table));
	},

	/* the save: a model and its depth together, by pointer and by keys, and a row that follows it names both */
	'FO-182 a model and its depth save together': async (t) => {
		const f = await t.app.open();
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		await goPage(t, f, 'ai', 'providers', 'models');
		const ID = 'ai.models.worker-model', FOLLOWER = 'ai.models.low-effort-worker-model';
		const trig = f.locator(ctlSel(ID, 'page')).first();
		await t.check('Everyday building has a control to press', (await trig.count()) > 0);
		if (!(await trig.count())) return;
		await trig.click(); await t.page.waitForTimeout(450);
		const o = await f.evaluate(POP);
		const deep = o.open ? o.opts.find((x) => x.levels && x.levels.split('|').length >= 2 && !x.selected) : null;
		await t.check('pointer: the picker offers a model with two or more depths', !!(o.shared && deep), o.open ? `${o.kind}; ${o.opts.filter((x) => x.levels).length} with depths` : 'no picker');
		if (!deep) { await closeAll(t, f); return; }
		const level = deep.levels.split('|').slice(-1)[0];
		await f.locator(`.o55-pick-pop.is-open [role="option"][data-index="${deep.index}"]`).first().click();
		await t.page.waitForTimeout(350);
		await f.locator('[role="listbox"][aria-label^="Thinking depth"] [role="option"]').filter({ hasText: level }).first().click();
		await t.page.waitForTimeout(700);
		const got = await f.evaluate(([id, follower, name]) => {
			const c = document.querySelector(`.o55-msel[data-o55-msel="${id}"] [role="combobox"]`), fc = document.querySelector(`.o55-msel[data-o55-msel="${follower}"] [role="combobox"]`);
			return { open: !!document.querySelector('.o55-pick-pop.is-open'), name: c ? c.querySelector('strong').textContent.trim() : '', small: c ? (c.querySelector('small') || {}).textContent || '' : '', follower: fc ? (fc.querySelector('small') || {}).textContent || '' : '', focus: document.activeElement === c, value: PM51.value(id), valueText: PM51.valueText(PM51.setting(id), PM51.value(id)) };
		}, [ID, FOLLOWER, deep.name]);
		await t.check(`pointer: ${deep.name} at ${level} depth is saved in one step and the picker closes`, !got.open && got.name === deep.name && got.small.includes(`${level} depth`), JSON.stringify(got));
		await t.check(`pointer: "Easy, routine jobs" (Same as Everyday building) now names ${deep.name} at ${level} depth`, got.follower.includes(deep.name) && got.follower.includes(`${level} depth`), `its small line "${got.follower}"`);
		await t.check('pointer: focus is back on the picker', got.focus);
		/* keys: Arrow Down opens, Enter on a model with depths moves into them, Arrow Down and Enter save */
		const K = 'ai.models.overseer-model';
		await f.locator(ctlSel(K, 'page')).first().focus();
		await t.page.keyboard.press('ArrowDown'); await t.page.waitForTimeout(450);
		const k0 = await f.evaluate(POP);
		const kdeep = k0.open ? k0.opts.find((x) => x.levels && x.levels.split('|').length >= 2 && !x.selected) : null;
		await t.check('keys: Arrow Down opens the shared picker', k0.open && k0.shared, k0.kind || 'nothing');
		if (kdeep) {
			await t.page.keyboard.type(kdeep.name); await t.page.waitForTimeout(250);
			await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(350);
			const k1 = await f.evaluate(POP);
			await t.check(`keys: Enter on ${kdeep.name} moves into its depths and saves nothing`, k1.open && k1.depth && k1.depth.focused, JSON.stringify(k1.depth));
			await t.page.keyboard.press('ArrowDown'); await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(600);
			const want = kdeep.levels.split('|')[0];
			const k2 = await f.evaluate((id) => { const c = document.querySelector(`.o55-msel[data-o55-msel="${id}"] [role="combobox"]`); return { open: !!document.querySelector('.o55-pick-pop.is-open'), name: c.querySelector('strong').textContent.trim(), small: (c.querySelector('small') || {}).textContent || '', focus: document.activeElement === c }; }, K);
			await t.check(`keys: Arrow Down and Enter save ${kdeep.name} at ${want} depth, focus on the picker`, !k2.open && k2.name === kdeep.name && k2.small.includes(`${want} depth`) && k2.focus, JSON.stringify(k2));
		}
		/* back: the inherit choice, by a press, saves the row's own inherit again */
		for (const id of [ID, K]) {
			await f.locator(ctlSel(id, 'page')).first().click(); await t.page.waitForTimeout(400);
			await f.locator('.o55-pick-pop.is-open [role="option"][data-pre="1"]').first().click(); await t.page.waitForTimeout(500);
			const back = await f.evaluate((id) => PM51.value(id), id);
			await t.check(`${id}: a press on its inherit choice saves it ("inherit")`, back === 'inherit', JSON.stringify(back));
		}
	},

	'FO-183 the picker covers exactly the inventory model rows, per-lane-model is gone': async (t) => {
		const f = await t.app.open();
		await f.locator('#tab-settings').click();
		await t.settle();
		const got = await f.evaluate(() => {
			const src = [...document.scripts].map((s) => s.textContent).find((x) => x.includes('O55_PICK_MODELS')) || '';
			const m = /const O55_PICK_MODELS = new Set\((\[[^\]]*\])\)/.exec(src);
			let literal = null; try { literal = m ? JSON.parse(m[1].replace(/'/g, '"')) : null; } catch (e) { literal = null; }
			return { ids: window.PM51 && typeof PM51.modelRowIds === 'function' ? PM51.modelRowIds() : null, literal };
		});
		const ids = got.ids || got.literal || [];
		await t.check(`per-lane-model is not one of the picker's model settings (${got.ids ? 'PM51.modelRowIds' : 'the O55_PICK_MODELS literal'})`, ids.length > 0 && !ids.includes(RETIRED), JSON.stringify(ids));
		const want = Object.keys(CANON).sort(), have = [...ids].sort();
		await t.check(`the picker's model settings are the inventory's ${want.length} model_picker rows`, JSON.stringify(want) === JSON.stringify(have), `missing ${want.filter((x) => !have.includes(x)).join(', ') || 'none'}; extra ${have.filter((x) => !want.includes(x)).join(', ') || 'none'}`);
		await goPage(t, f, 'ai', 'providers', 'models');
		const drawn = await f.evaluate((id) => !!document.querySelector(`[data-setting="${CSS.escape(id)}"], [id="setting-${CSS.escape(id)}"]`), RETIRED);
		await t.check('no per-lane-model row is drawn on Settings › Models', !drawn);
	},

	/* FO-184: the top tab strip stands in the middle of Settings, on one line, nothing cut off */
	'FO-184 the top tabs are centred': async (t) => {
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
		const f = await t.app.open();
		await t.emulate({ reducedMotion: 'no-preference' });
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		const TABS = () => {
			const nav = [...document.querySelectorAll('#pm-settings-root .workspace-tabs')].find((n) => n.checkVisibility());
			if (!nav) return null;
			const tabs = [...nav.querySelectorAll(':scope > .workspace-tab')].filter((b) => b.getClientRects().length);
			const nb = nav.getBoundingClientRect(), a = tabs[0].getBoundingClientRect(), z = tabs[tabs.length - 1].getBoundingClientRect();
			const page = [...document.querySelectorAll('#pm-settings-root .pm51-mgr > .pm51-tabs')].find((n) => n.checkVisibility());
			/* the page tabs (Services / Models / ...): their middle against the middle of the page they head (the manager's
			   content box, where its centred title stands) */
			let pageTabs = null;
			if (page) {
				const pt = [...page.querySelectorAll('.manager-tab')].filter((b) => b.getClientRects().length);
				const mgr = page.parentElement, mb = mgr.getBoundingClientRect(), ms = getComputedStyle(mgr), pb = page.getBoundingClientRect();
				const mid = (mb.left + parseFloat(ms.paddingLeft) + mb.right - parseFloat(ms.paddingRight)) / 2;
				if (pt.length) pageTabs = {
					labels: pt.map((b) => b.textContent.trim()), off: Math.round(((pt[0].getBoundingClientRect().left + pt[pt.length - 1].getBoundingClientRect().right) / 2 - mid) * 100) / 100,
					lines: new Set(pt.map((b) => Math.round(b.getBoundingClientRect().top))).size,
					clipped: pt.filter((b) => { const r = b.getBoundingClientRect(); return r.left < pb.left - 0.5 || r.right > pb.right + 0.5 || b.scrollWidth > b.clientWidth + 1; }).map((b) => b.textContent.trim())
				};
			}
			return {
				labels: tabs.map((b) => b.textContent.trim()), off: Math.round(((a.left + z.right) / 2 - (nb.left + nb.right) / 2) * 100) / 100,
				lines: new Set(tabs.map((b) => Math.round(b.getBoundingClientRect().top))).size, scroll: nav.scrollWidth - nav.clientWidth,
				clipped: tabs.filter((b) => { const r = b.getBoundingClientRect(); return r.left < nb.left - 0.5 || r.right > nb.right + 0.5 || b.scrollWidth > b.clientWidth + 1; }).map((b) => b.textContent.trim()),
				pageTabs
			};
		};
		const sizes = [{ id: '1920x1080', w: 1920, h: 1080 }, { id: '860x900', w: 860, h: 900 }, { id: '740x900', w: 740, h: 900 }, { id: '1280x500', w: 1280, h: 500, docked: true }];
		const DOCKED = () => { const s = document.getElementById('sidePanelSlot'); if (!s || !s.checkVisibility() || document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id !== 'panel-files') return false; return document.getElementById('panel-settings').getBoundingClientRect().left >= s.getBoundingClientRect().right - 2; };
		for (const look of looks) {
			await t.viewport(1920, 1080);
			await setLookBySetting(t, f, look);
			const icon = f.locator('#activityBar .icon[data-target="panel-files"]');
			for (let n = 0; n < 4 && !(await f.evaluate(DOCKED)); n++) { await icon.click().catch(() => {}); await t.page.waitForTimeout(900); }
			const which = look === looks[0] || ['basic-dark', 'glass-light', 'nier-dark'].includes(look) ? sizes : sizes.slice(0, 1);
			for (const size of which) {
				await settingsAt(t, f, size.w, size.h);
				for (const [domain, ws] of [['ai', 'providers'], ['general', null]]) {
					await press(t, f, `#pm-settings-root [data-action="navigate-domain"][data-domain="${domain}"]`);
					if (ws) await press(t, f, `#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="${ws}"]`);
					await t.page.waitForTimeout(300);
					const m = await f.evaluate(TABS);
					const cell = `${look} ${size.id}${size.docked ? ' docked' : ''} ${domain}`;
					if (size.docked) await t.check(`${cell}: Files is docked beside Settings`, await f.evaluate(DOCKED));
					if (!m) { await t.check(`${cell}: the top tab strip is drawn`, false); continue; }
					await t.check(`${cell}: FO-184 the top tabs stand in the middle of their strip (${m.off} px off; ${m.labels.join(' / ')})`, Math.abs(m.off) <= 1, `${m.off} px`);
					await t.check(`${cell}: FO-184 the top tabs are one line, nothing clipped`, m.lines === 1 && m.scroll <= 1 && !m.clipped.length, `lines ${m.lines}, overflow ${m.scroll} px, clipped ${m.clipped.join(', ') || 'none'}`);
					if (ws && m.pageTabs) {
						await t.check(`${cell}: FO-184 the page tabs stand in the middle of their page (${m.pageTabs.off} px off; ${m.pageTabs.labels.join(' / ')})`, Math.abs(m.pageTabs.off) <= 1, `${m.pageTabs.off} px`);
						await t.check(`${cell}: FO-184 the page tabs are one line, nothing clipped`, m.pageTabs.lines === 1 && !m.pageTabs.clipped.length, `lines ${m.pageTabs.lines}, clipped ${m.pageTabs.clipped.join(', ') || 'none'}`);
					}
					t.log(`TABS ${cell} top ${m.off} page ${m.pageTabs ? m.pageTabs.off : '-'}`);
				}
			}
		}
	},

	/* --set crops=1: the crops for Jared (Models with the picker and its depths open, the inherit choice, "Easy, routine
	   jobs", and both tab strips), in Basic Dark, Glass Light and NieR Dark at 1920x1080 and 1280x500 with Files docked */
	'FO-182/184 crops': async (t) => {
		if (String(t.args.crops || '') !== '1') { await t.check('crops are written only with --set crops=1', true); return; }
		const dir = String(t.args.cropDir || path.join(t.run.dir, 'crops'));
		fs.mkdirSync(dir, { recursive: true });
		const tag = String(t.args.tag || 'page');
		const f = await t.app.open();
		await t.viewport(1920, 1080);
		await f.locator('#tab-settings').click();
		await t.settle();
		const offset = async () => { if (f === t.page.mainFrame()) return { x: 0, y: 0 }; const el = await f.frameElement().catch(() => null); const b = el && (await el.boundingBox()); return b ? { x: b.x, y: b.y } : { x: 0, y: 0 }; };
		const shoot = async (name, rect, pad = 10) => {
			if (!rect) return;
			const o = await offset(), vp = t.page.viewportSize();
			const x = Math.max(0, Math.floor(rect.left + o.x - pad)), y = Math.max(0, Math.floor(rect.top + o.y - pad));
			const clip = { x, y, width: Math.min(vp.width - x, Math.ceil(rect.right - rect.left + pad * 2)), height: Math.min(vp.height - y, Math.ceil(rect.bottom - rect.top + pad * 2)) };
			if (clip.width > 4 && clip.height > 4) fs.writeFileSync(path.join(dir, `${tag}-${name}.png`), await t.page.screenshot({ clip }));
		};
		const box = (sel) => f.evaluate((sel) => { const els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length); if (!els.length) return null; const rs = els.map((e) => e.getBoundingClientRect()); return { left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)), right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)) }; }, sel);
		const DOCKED = () => { const s = document.getElementById('sidePanelSlot'); if (!s || !s.checkVisibility() || document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id !== 'panel-files') return false; return document.getElementById('panel-settings').getBoundingClientRect().left >= s.getBoundingClientRect().right - 2; };
		for (const look of String(t.args.looks || 'basic-dark,glass-light,nier-dark').split(',')) {
			await t.viewport(1920, 1080);
			await setLookBySetting(t, f, look);
			const icon = f.locator('#activityBar .icon[data-target="panel-files"]');
			for (let n = 0; n < 4 && !(await f.evaluate(DOCKED)); n++) { await icon.click().catch(() => {}); await t.page.waitForTimeout(900); }
			for (const [w, h, sz] of [[1920, 1080, '1920'], [1280, 500, '1280x500-docked']]) {
				await settingsAt(t, f, w, h);
				await goPage(t, f, 'ai', 'providers', 'models');
				await t.page.waitForTimeout(400);
				const k = `${look}-${sz}`;
				await shoot(`${k}-tabs`, await box('#pm-settings-root .workspace-tabs, #pm-settings-root .pm51-mgr > .pm51-tabs'), 6);
				const easy = '#pm-settings-root [id="setting-ai.models.low-effort-worker-model"]';
				await f.locator(easy).first().scrollIntoViewIfNeeded().catch(() => {});
				await t.page.waitForTimeout(300);
				await shoot(`${k}-easy-routine-jobs`, await box(easy), 6);
				const plan = '#pm-settings-root [id="setting-ai.models.overseer-model"]';
				await f.locator(plan).first().scrollIntoViewIfNeeded().catch(() => {});
				await shoot(`${k}-inherit-row`, await box(plan), 6);
				const trig = f.locator(ctlSel('ai.models.overseer-model', 'page')).first();
				if (await trig.count()) {
					await trig.click().catch(() => {}); await t.page.waitForTimeout(600);
					await shoot(`${k}-picker-open`, await box(`${plan}, .o55-pick-pop.is-open, .pm51-popout.pm51-dd-list, .o55-depth-side`), 12);
					const o = await f.evaluate(POP);
					const deep = o.open ? o.opts.find((x) => x.levels) : null;
					if (deep) {
						await f.locator(`.o55-pick-pop.is-open [role="option"][data-index="${deep.index}"]`).first().click().catch(() => {});
						await t.page.waitForTimeout(450);
						await shoot(`${k}-picker-depth`, await box(`${plan}, .o55-pick-pop.is-open, .o55-depth-side`), 12);
					}
					await closeAll(t, f);
				}
			}
		}
		await t.check(`crops written to ${dir}`, fs.readdirSync(dir).some((n) => n.startsWith(tag)));
	}
};
