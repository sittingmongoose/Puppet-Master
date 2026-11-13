// FO-176 (astra-max-12a after batch 12a): FO-159 raised Settings' 10.5 px small text to 11 px, and Jared's rule for it
// (Q1 = B) is that the change makes no new wraps. settings-min-text holds that over its walk of chapters, workspaces
// and manager tabs, but a confirm dialog only exists while it is open, so its copy was outside the walk: the "Delete
// all memories?" warning drew one line at 10.5 px on 9b212f7aa9 and two at 11 px on main (1390x900, Basic Dark).
//
// This companion opens Settings' confirm and warning dialogs and holds their copy — a plain confirm's subtitle
// (.dialog-sub) and a warning confirm's alert strip (.dialog-body .alert-strip) — to the line count the same words
// drew on the pre-FO-159 base, in all ten looks at 1920x1080, 1390x900, 1280x500, 1024x768, 860x900 and 740x900, both
// surfaces.
//   find   — the dialogs are found by real clicks: every chapter, workspace and manager tab, its danger and
//            confirm-labelled buttons and the danger/confirm rows of its "More …" menus (settings-confirm-once's walk,
//            bounded by --set buttons=3 menus=2 items=4). Each one found is measured as the click drew it.
//   replay — every look and size then reopens each found dialog through the product's own confirm (PM51.confirm,
//            which every Settings confirm goes through: confirmDialog -> openDialog), so the matrix does not repeat a
//            ten-minute walk per cell. At the walk's own cell the replayed dialog must draw the same words on the
//            same lines as the clicked one, which is what makes the replay the same dialog.
//   lines  — every copy keeps the line count its words drew on the base, keyed by title, role and words (never a
//            DOM path). The base drew every confirm's message twice (subtitle and an info or danger strip, before
//            FO-154), so a warning's strip is compared with the base's strip and a plain confirm's subtitle with the
//            base's subtitle. It must compare the item's own example in every cell.
// The baseline is checks/settings-dialog-lines.lines.json: the dialog list a walk found (--set listOut=<json>) and
// the lines that list drew on a build of 9b212f7aa9 (--set record=<json> --set dialogs=<list> --set walk=0, per
// surface; cells merge). --set lineBaseline=<json> compares against another recording; --set out=<json> keeps the
// whole comparison; --set looks= and --set sizes=1390x900,... narrow the matrix; --set shots=<looks> [--set shotTitles=<regex>]
// [--set build=<name>] crops the named dialogs at 1390x900 on the normal surface.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-dialog-lines.check.mjs --set page=<build> --set sandbox=0
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook } from '../helpers/settings-look.mjs';

/* the item's four sizes, and settings-min-text's 860 and 740 px, where the Settings panel is narrowest */
const SIZES = [[1920, 1080], [1390, 900], [1280, 500], [1024, 768], [860, 900], [740, 900]];
const WALK_SIZE = [1390, 900];
const EXAMPLE = /^delete all memories\?$/i;
const DIALOG = '.overlay section.dialog[role="dialog"]';
const MENU = '.pm51-popout[role="menu"]';
const CONFIRM_IN_PAGE = /^(delete|remove|forget|reset|disconnect|revoke|clear|sign out|turn off|roll back|clean up|claim|restart|rotate|allow|copy settings|copy the recovery|start |move workspace|back up|stop )/i;
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

/* The shown dialog's copy and the lines each part draws. Self-contained: serialized into the page alone. */
const READ = (sel) => {
	const shown = [...document.querySelectorAll(sel)].filter((e) => {
		const cs = getComputedStyle(e);
		return e.getClientRects().length > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
	});
	const d = shown[shown.length - 1];
	if (!d) return null;
	const tx = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim();
	const part = (el) => {
		if (!el || !tx(el)) return null;
		const r = document.createRange();
		r.selectNodeContents(el);
		const tops = [...r.getClientRects()].filter((b) => b.width > 0.5 && b.height > 0.5).map((b) => b.top).sort((a, b) => a - b);
		let n = 0, last = -1e9;
		for (const y of tops) if (y - last > 1.5) { n++; last = y; }
		const cs = getComputedStyle(el);
		return { n, t: tx(el), f: +parseFloat(cs.fontSize).toFixed(2), w: +el.clientWidth.toFixed(1) };
	};
	const strip = d.querySelector('.dialog-body .alert-strip');
	const body = d.querySelector('.dialog-body');
	const primary = d.querySelector('.dialog-footer button[type="submit"], .dialog-footer .btn.primary');
	return {
		title: tx(d.querySelector('.dialog-title')),
		label: tx(primary),
		danger: !!(strip && /(^|\s)(danger|warning)(\s|$)/.test(strip.className)),
		form: !!d.querySelector('.dialog-body input, .dialog-body textarea, .dialog-body select, .dialog-body .form-grid'),
		/* a body that holds more than its one strip is not a confirm PM51.confirm can redraw */
		custom: !!body && [...body.children].some((c) => c !== strip),
		dialogW: Math.round(d.getBoundingClientRect().width),
		sub: part(d.querySelector('.dialog-sub')),
		alert: part(strip ? (strip.querySelector(':scope > div') || strip) : null),
	};
};

/* Reopen every listed dialog through the product's own confirm and read it; the last one is closed by its Cancel.
   Built as one expression with READ inlined, because a function passed to the page cannot carry another. */
const replayExpr = (list) => `(() => {
	const read = ${READ.toString()};
	const sel = ${JSON.stringify(DIALOG)};
	const out = [];
	for (const it of ${JSON.stringify(list)}) {
		window.PM51.confirm(it.title, it.message, it.label, () => {}, it.danger);
		out.push({ key: it.key, got: read(sel) });
	}
	const open = [...document.querySelectorAll(sel)];
	const cancel = open.length && open[open.length - 1].querySelector('.dialog-footer [data-action="close-overlay"]');
	if (cancel) cancel.click();
	return out;
})()`;

const itemOf = (info) => {
	const message = info.danger ? (info.alert && info.alert.t) : (info.sub && info.sub.t);
	return { key: `${info.title}|${info.danger ? 'warning' : 'plain'}|${message || ''}`, title: info.title, message: message || '', label: info.label, danger: info.danger };
};
/* the copy rows a reading is held to: the part the tone owns (a warning's strip, a plain confirm's subtitle) */
const rowsOf = (info) => {
	const rows = [];
	if (info.sub) rows.push([`${info.title}|sub|${info.sub.t}`, info.sub]);
	if (info.alert) rows.push([`${info.title}|alert|${info.alert.t}`, info.alert]);
	return rows;
};

async function dialogShown(f) {
	return f.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((e) => e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none'), DIALOG, { timeout: 1200 }).then(() => true).catch(() => false);
}
async function dismiss(f) {
	await f.evaluate((sel) => {
		const els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length);
		const d = els[els.length - 1];
		const cancel = d && (d.querySelector('.dialog-footer [data-action="close-overlay"]') || d.querySelector('[data-action="close-overlay"]'));
		if (cancel) cancel.click();
	}, DIALOG).catch(() => {});
	await f.waitForFunction((sel) => !document.querySelector(sel), DIALOG, { timeout: 1500 }).catch(() => {});
}
/* a press that opened an inline editor (a drawer) instead of a confirm: closed by its own footer, Close X, then Escape */
async function closeOpened(t, f, where) {
	const open = await f.evaluate(() => !!document.querySelector('.drawer-wrap')).catch(() => false);
	if (!open) return;
	for (const how of ['footer', 'x', 'escape']) {
		await f.evaluate((how) => {
			const wraps = [...document.querySelectorAll('.drawer-wrap')].filter((w) => w.isConnected && w.dataset.closing !== '1');
			const wrap = wraps[wraps.length - 1];
			if (!wrap) return;
			const panel = wrap.querySelector('.drawer');
			if (how === 'escape') {
				const owns = window.PM7_SETTINGS_TOME && window.PM7_SETTINGS_TOME.ownsEvent;
				const at = owns && document.activeElement && owns(document.activeElement) ? document.activeElement : (panel || wrap);
				at.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
				return;
			}
			const el = panel && panel.querySelector(how === 'footer'
				? '.pm51-panel-foot [data-action="close-overlay"], .drawer-footer [data-action="close-overlay"]'
				: '.pm51-panel-close[data-action="close-overlay"], .dialog-head .icon-btn[data-action="close-overlay"]');
			if (el) el.click();
		}, how).catch(() => {});
		if (await f.waitForFunction(() => !document.querySelector('.drawer-wrap'), null, { timeout: 2000 }).then(() => true).catch(() => false)) return;
	}
	await t.check(`closed the inline editor it opened: ${where}`, false, 'setup: its footer close, Close X and Escape left it open');
}
async function expand(f, ws) {
	await f.evaluate((ws) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		if (!body) return;
		body.querySelectorAll('details:not([open]) > summary').forEach((s) => s.click());
		body.querySelectorAll('.pm51-acc-item:not(.is-open) .pm51-acc-toggle').forEach((b) => b.click());
	}, ws);
}
async function press(f, attr) {
	await f.locator(`[${attr}]`).first().scrollIntoViewIfNeeded({ timeout: 2500 }).catch(() => {});
	try { await f.locator(`[${attr}]`).first().click({ timeout: 4000 }); return true; } catch (e) { /* the page's own click below */ }
	return f.evaluate((a) => { const el = document.querySelector(`[${a}]`); if (!el) return false; el.click(); return true; }, attr).catch(() => false);
}
async function menuOpen(f, ms = 2000) {
	return f.waitForFunction((sel) => [...document.querySelectorAll(sel)].some((p) => p.getClientRects().length), MENU, { timeout: ms }).then(() => true).catch(() => false);
}
/* a menu row is pressed by the page's own click where the open menu draws it (a pointer press scrolls, and a scroll
   closes the menu it is in: FO-147) */
async function rowPress(f, moreAttr, label) {
	let why = 'menu never opened';
	for (let attempt = 0; attempt < 2; attempt++) {
		if (!(await f.locator(`${MENU}:visible`).count())) {
			if (!(await press(f, moreAttr))) return { ok: false, why: 'the More button could not be pressed' };
			await menuOpen(f, 1500);
		}
		why = await f.evaluate(({ sel, lbl }) => {
			const pops = [...document.querySelectorAll(sel)].filter((p) => p.getClientRects().length);
			const pop = pops[pops.length - 1];
			if (!pop) return 'no menu open';
			const el = [...pop.querySelectorAll('.pm51-menu-item')].find((x) => (x.textContent || '').replace(/\s+/g, ' ').trim() === lbl);
			if (!el) return `menu open, no row reading ${lbl}`;
			el.click();
			return 'pressed';
		}, { sel: MENU, lbl: label }).catch((e) => `evaluate threw ${String(e).slice(0, 80)}`);
		if (why === 'pressed') return { ok: true };
	}
	return { ok: false, why };
}
async function pick(f, ws, tab, kind, seen, attr) {
	return f.evaluate(({ ws, tab, kind, seen, attr, pattern }) => {
		document.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		if (!body) return null;
		const rx = new RegExp(pattern, 'i');
		const nameOf = (el) => (el.getAttribute('aria-label') || el.innerText || '').replace(/\s+/g, ' ').trim();
		const els = [...body.querySelectorAll('button')].filter((el) => {
			if (el.closest('[inert], .overlay, .drawer-wrap, .pm51-popout')) return false;
			if (el.getAttribute('aria-disabled') === 'true' || el.classList.contains('pm51-dd-trigger')) return false;
			const r = el.getBoundingClientRect();
			if (!(r.width > 1 && r.height > 1)) return false;
			const name = nameOf(el);
			if (kind === 'more') return /^more\b/i.test(name);
			if (/^more\b/i.test(name)) return false;
			return el.classList.contains('danger') || rx.test(name);
		});
		for (const el of els) {
			const name = nameOf(el);
			const row = el.closest('.resource-row, .pm51-item, [data-id], [data-row]');
			const rowId = row ? (row.dataset.id || row.dataset.row || '') : '';
			const nth = els.filter((b) => nameOf(b) === name).indexOf(el);
			const key = `${kind}|${ws}|${tab}|${rowId}|${name}|${nth}`;
			if (seen.includes(key)) continue;
			el.setAttribute(attr, '1');
			return { key, name };
		}
		return null;
	}, { ws, tab, kind, seen, attr, pattern: CONFIRM_IN_PAGE.source });
}
async function openChapter(f, domain) {
	for (let i = 0; i < 3; i++) {
		await f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).click({ timeout: 8000 }).catch(() => {});
		const ok = await f.waitForFunction((d) => {
			const a = document.querySelector('#pm-settings-root .domain-link.active');
			return !!(a && a.getAttribute('data-domain') === d && document.querySelector('#pm-settings-root .workspace-tab'));
		}, domain, { timeout: 5000 }).then(() => true).catch(() => false);
		if (ok) return true;
	}
	return false;
}
async function openManagerTab(f, ws, tab) {
	const sel = `[data-continuous-workspace-body="${ws}"] .manager-tab[data-tab="${tab}"]`;
	await f.locator(sel).scrollIntoViewIfNeeded({ timeout: 2500 }).catch(() => {});
	try { await f.locator(sel).click({ timeout: 6000 }); } catch (e) {
		const pressed = await f.evaluate((s) => { const b = document.querySelector(s); if (!b) return false; b.click(); return true; }, sel).catch(() => false);
		if (!pressed) return false;
	}
	return f.waitForFunction((s) => { const b = document.querySelector(s); return !!(b && b.classList.contains('active')); }, sel, { timeout: 6000 }).then(() => true).catch(() => false);
}

/* The walk: every confirm a real click reaches, each read as the click drew it. */
async function walk(t, f, limits) {
	const found = new Map();
	const bag = { dialogs: 0, skipped: 0, warning: 0, plain: 0, custom: [] };
	const seen = new Set();
	const take = async (where) => {
		const info = await f.evaluate(READ, DIALOG).catch(() => null);
		if (!info || info.form) { await dismiss(f); return; }
		bag.dialogs += 1;
		if (info.custom) bag.custom.push(`${where}: ${info.title}`);
		else {
			const it = itemOf(info);
			if (!found.has(it.key)) found.set(it.key, { ...it, where, clicked: info });
			if (info.danger) bag.warning += 1; else bag.plain += 1;
		}
		await dismiss(f);
	};
	const scan = async (ws, tab, place) => {
		for (let i = 0; i < limits.buttons; i++) {
			const picked = await pick(f, ws, tab, 'button', [...seen], 'data-fo176btn');
			if (!picked) break;
			seen.add(picked.key);
			if (!(await press(f, 'data-fo176btn'))) { bag.skipped += 1; t.log(`unvisited confirm: ${place} / ${picked.name.slice(0, 60)}`); break; }
			if (await dialogShown(f)) await take(`${place} / ${picked.name.slice(0, 50)}`);
			else { await dismiss(f); await closeOpened(t, f, `${place} / ${picked.name.slice(0, 50)}`); }
		}
		for (let m = 0; m < limits.menus; m++) {
			const more = await pick(f, ws, tab, 'more', [...seen], 'data-fo176more');
			if (!more) break;
			seen.add(more.key);
			if (!(await press(f, 'data-fo176more'))) { bag.skipped += 1; t.log(`unvisited menu: ${place} / ${more.name.slice(0, 60)}`); break; }
			if (!(await menuOpen(f))) { await dismiss(f); await closeOpened(t, f, `${place} / ${more.name.slice(0, 50)}`); continue; }
			const items = await f.evaluate(({ pattern, sel }) => {
				const rx = new RegExp(pattern, 'i');
				const pops = [...document.querySelectorAll(sel)].filter((p) => p.getClientRects().length);
				const pop = pops[pops.length - 1];
				if (!pop) return [];
				return [...pop.querySelectorAll('.pm51-menu-item')].map((el) => ({ label: (el.textContent || '').replace(/\s+/g, ' ').trim(), danger: el.classList.contains('is-danger'), off: el.getAttribute('aria-disabled') === 'true' }))
					.filter((it) => !it.off && (it.danger || rx.test(it.label)));
			}, { pattern: CONFIRM_IN_PAGE.source, sel: MENU });
			for (const item of items.slice(0, limits.items)) {
				const row = await rowPress(f, 'data-fo176more', item.label);
				if (!row.ok) { bag.skipped += 1; t.log(`unvisited menu row: ${place} / ${item.label.slice(0, 40)} (${row.why})`); continue; }
				if (await dialogShown(f)) await take(`${place} / ${more.name.slice(0, 40)} / ${item.label.slice(0, 40)}`);
				else { await dismiss(f); await closeOpened(t, f, `${place} / ${item.label.slice(0, 40)}`); }
			}
			await dismiss(f);
			await closeOpened(t, f, place);
		}
	};
	const domains = await f.locator('#pm-settings-root .domain-link').evaluateAll((els) => els.map((e) => e.getAttribute('data-domain')).filter(Boolean));
	for (const domain of domains) {
		if (!(await openChapter(f, domain))) { await t.check(`opened chapter ${domain}`, false, 'the chapter link did not stay open'); continue; }
		const tabs = await f.locator('#pm-settings-root .workspace-tab').evaluateAll((els) => els.map((e) => e.getAttribute('data-workspace')).filter(Boolean));
		for (const ws of tabs) {
			await f.locator(`#pm-settings-root .workspace-tab[data-workspace="${ws}"]`).click({ timeout: 8000 }).catch(() => {});
			const mounted = await f.waitForFunction((id) => {
				const body = document.querySelector(`[data-continuous-workspace-body="${id}"]`);
				return !!(body && body.getAttribute('data-workspace-mounted') === 'true');
			}, ws, { timeout: 8000 }).then(() => true).catch(() => false);
			if (!mounted) { await t.check(`mounted ${domain}/${ws}`, false, 'the workspace body never mounted'); continue; }
			const managers = await f.locator(`[data-continuous-workspace-body="${ws}"] .manager-tab`).evaluateAll((els) => els.map((e) => e.getAttribute('data-tab')).filter(Boolean));
			for (const tab of [null, ...managers]) {
				if (tab && !(await openManagerTab(f, ws, tab))) { await t.check(`opened manager tab ${domain}/${ws}/${tab}`, false, 'the tab never became the drawn one'); continue; }
				await expand(f, ws);
				await scan(ws, tab, `${domain}/${ws}${tab ? `/${tab}` : ''}`);
			}
		}
	}
	await dismiss(f);
	return { found, bag };
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
/* A recording holds each copy row's words once (`rows`) and every cell as its line counts in that order (null: the
   cell drew no such row), so 120 cells do not repeat 106 sentences each. */
const unpack = (rec) => {
	if (!rec || !Array.isArray(rec.rows)) return rec;
	const cells = {};
	for (const [id, counts] of Object.entries(rec.cells || {})) {
		cells[id] = {};
		counts.forEach((n, i) => { if (n !== null) cells[id][rec.rows[i]] = n; });
	}
	return { ...rec, cells };
};
const pack = (rec) => {
	const rows = [...new Set(Object.values(rec.cells).flatMap((c) => Object.keys(c)))].sort();
	const cells = {};
	for (const id of Object.keys(rec.cells).sort()) cells[id] = rows.map((k) => (k in rec.cells[id] ? rec.cells[id][k] : null));
	return { ...rec, rows, cells };
};
const cellKey = (surface, look, [w, h]) => `${surface}|${look}|${w}x${h}`;

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-176 Settings confirm and warning copy keeps the base's lines (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const limits = { buttons: Number(t.args.buttons || 3), menus: Number(t.args.menus || 2), items: Number(t.args.items || 4) };
		const looks = String(t.args.looks || LOOKS.join(',')).split(',').map((s) => s.trim()).filter(Boolean);
		const sizes = t.args.sizes ? String(t.args.sizes).split(',').map((s) => s.split('x').map(Number)) : SIZES;
		const record = t.args.record ? String(t.args.record) : '';
		const fixturePath = t.args.lineBaseline ? String(t.args.lineBaseline) : fileURLToPath(new URL('./settings-dialog-lines.lines.json', import.meta.url));
		const fixture = fs.existsSync(fixturePath) ? unpack(readJson(fixturePath)) : null;
		const doWalk = !/^(0|false|no|off)$/i.test(String(t.args.walk ?? '1'));

		await t.viewport(...WALK_SIZE);
		const f = await t.app.open({ sandbox: surface === 'sandbox', settleMs: 800 });
		await t.app.resetLayout();
		await f.locator('#tab-settings').click();
		await f.locator('#pm-settings-root .domain-link').first().waitFor({ state: 'visible', timeout: 20000 });
		await t.settle();

		/* the list to replay: what this page's walk finds, plus the recorded list (a dialog the walk misses keeps its row) */
		const list = new Map();
		const given = t.args.dialogs ? readJson(String(t.args.dialogs)) : (fixture && fixture.dialogs) || [];
		let walked = null;
		if (doWalk) {
			await t.step('walk', async () => {
				walked = await walk(t, f, limits);
				const { bag, found } = walked;
				t.log(`walk: ${bag.dialogs} confirms opened (${bag.warning} warning, ${bag.plain} plain), ${found.size} distinct, ${bag.skipped} unvisited, ${bag.custom.length} with a custom body`);
				for (const c of bag.custom) t.log(`custom body (measured only as clicked): ${c}`);
				await t.check('the walk opened a warning confirm and a plain confirm', bag.warning > 0 && bag.plain > 0, `warning ${bag.warning}, plain ${bag.plain}`);
				await t.check("the walk reached the item's own example, \"Delete all memories?\"", [...found.values()].some((x) => EXAMPLE.test(x.title)), `${found.size} distinct`);
				await t.check('the walk left no confirm it set out to visit', bag.skipped === 0, `skipped ${bag.skipped}`);
				await t.check('every confirm found is one PM51.confirm draws (no custom body)', bag.custom.length === 0, bag.custom.slice(0, 4).join(' | '));
				for (const [k, v] of found) list.set(k, v);
			});
		}
		for (const it of given) if (!list.has(it.key)) list.set(it.key, it);
		const items = [...list.values()].map(({ key, title, message, label, danger }) => ({ key, title, message, label, danger }));
		await t.check(`${items.length} dialogs to measure`, items.length > 0 && items.some((x) => EXAMPLE.test(x.title)), `${items.length}`);
		if (t.args.listOut) {
			const p = String(t.args.listOut);
			const prior = fs.existsSync(p) ? readJson(p) : [];
			const merged = new Map(prior.map((x) => [x.key, x]));
			for (const it of items) if (!merged.has(it.key)) merged.set(it.key, it);
			fs.writeFileSync(p, JSON.stringify([...merged.values()].sort((a, b) => a.key.localeCompare(b.key)), null, 1));
		}

		const cells = {};
		const diffs = [];
		let cellsRun = 0;
		const out = { surface, cells: {} };
		for (const look of looks) {
			/* the Theme rows are pressed on General by its rail link: below a 720 px host the rail is an off-canvas drawer
			   that swallows the press, so the look is set at the walk's size and each cell's size comes after it */
			await t.viewport(...WALK_SIZE);
			await t.page.waitForTimeout(300);
			await setLookBySetting(t, f, look);
			for (const size of sizes) {
				const id = cellKey(surface, look, size);
				await t.step(`${look} ${size.join('x')}`, async () => {
					await t.viewport(...size);
					await t.page.waitForTimeout(350);
					const held = await guardPaintedLook(t, f, look, id);
					const got = await f.evaluate(replayExpr(items));
					const rows = {};
					let broken = 0;
					for (const { key, got: info } of got) {
						if (!info) { broken += 1; continue; }
						for (const [k, part] of rowsOf(info)) rows[k] = Math.max(rows[k] || 0, part.n);
						out.cells[id] = out.cells[id] || {};
						out.cells[id][key] = { dialogW: info.dialogW, sub: info.sub, alert: info.alert };
					}
					await t.check(`${id}: every listed dialog opened through PM51.confirm`, broken === 0, `${broken} of ${got.length} drew no dialog`);
					/* the replay is the clicked dialog: at the walk's own cell, same words on the same lines */
					if (walked && look === 'basic-dark' && size[0] === WALK_SIZE[0] && size[1] === WALK_SIZE[1]) {
						const miss = [];
						for (const { key, got: info } of got) {
							const clicked = walked.found.get(key) && walked.found.get(key).clicked;
							if (!clicked || !info) continue;
							const a = JSON.stringify(rowsOf(clicked).map(([k, p]) => [k, p.n]));
							const b = JSON.stringify(rowsOf(info).map(([k, p]) => [k, p.n]));
							if (a !== b) miss.push(`${clicked.title}: clicked ${a} replayed ${b}`);
						}
						await t.check(`${id}: each replayed dialog draws what its click drew (${walked.found.size} compared)`, miss.length === 0, miss.slice(0, 3).join(' | '));
					}
					cells[id] = rows;
					/* --set shots=<looks> [--set shotTitles=<regex>]: a native crop of each named dialog at 1390x900, normal surface
					   only (a crop cannot reach into the sandbox's frame), held open past its 300 ms entrance */
					const shotLooks = t.args.shots ? String(t.args.shots).split(',').map((s) => s.trim()) : [];
					if (surface === 'normal' && shotLooks.includes(look) && size[0] === 1390 && size[1] === 900) {
						const rx = new RegExp(String(t.args.shotTitles || EXAMPLE.source), 'i');
						for (const it of items.filter((x) => rx.test(x.title))) {
							await f.evaluate((x) => window.PM51.confirm(x.title, x.message, x.label, () => {}, x.danger), it);
							await t.page.waitForTimeout(700);
							const slug = it.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
							await t.crop(`${t.args.build || 'page'}-${look}-1390x900-${slug}`, f.locator(DIALOG).last(), 'the dialog copy: one line more than the base is the FO-176 wrap; the dialog keeps its look');
							await dismiss(f);
						}
					}
					if (!record) {
						const base = fixture && fixture.cells && fixture.cells[id];
						let compared = 0, nobase = 0, example = 0;
						const grew = [];
						for (const [k, n] of Object.entries(rows)) {
							const b = base ? base[k] : undefined;
							if (b === undefined) { nobase += 1; continue; }
							compared += 1;
							if (EXAMPLE.test(k.split('|')[0])) example += 1;
							if (n > b) { grew.push({ id, k, base: b, now: n }); diffs.push({ id, k, base: b, now: n }); }
						}
						if (nobase) t.log(`${id}: ${nobase} copy rows have no base row (new or reworded since the base)`);
						await t.check(`${id}: the item's own example is compared`, example > 0, `"Delete all memories?" rows compared: ${example}`);
						await t.check(`${id}: every dialog's copy keeps the base's line count (${compared} compared)`, held && !!base && compared > 0 && grew.length === 0,
							!base ? 'no baseline cell' : grew.slice(0, 5).map((d) => `${d.k.slice(0, 70)} ${d.base}->${d.now}`).join(' | ') || (held ? 'nothing compared' : 'look not held'));
					}
					cellsRun += 1;
				});
			}
		}
		if (record) {
			const prior = fs.existsSync(record) ? unpack(readJson(record)) : {};
			const allDialogs = new Map((prior.dialogs || []).map((x) => [x.key, x]));
			for (const it of items) if (!allDialogs.has(it.key)) allDialogs.set(it.key, it);
			fs.writeFileSync(record, JSON.stringify(pack({ v: 2, base: t.args.baseSha || prior.base || '', looks, sizes, dialogs: [...allDialogs.values()].sort((a, b) => a.key.localeCompare(b.key)), cells: { ...(prior.cells || {}), ...cells } })));
			t.log(`recorded ${Object.keys(cells).length} cells for ${surface} into ${record}`);
		} else {
			await t.check(`${surface}: no dialog copy drew more lines than on the base anywhere in the matrix (${diffs.length} grew)`, diffs.length === 0, diffs.slice(0, 8).map((d) => `${d.id} ${d.k.slice(0, 60)} ${d.base}->${d.now}`).join(' | '));
		}
		if (t.args.out) {
			const p = String(t.args.out);
			const prior = fs.existsSync(p) ? readJson(p) : {};
			fs.writeFileSync(p, JSON.stringify({ ...prior, [surface]: { ...out, diffs } }, null, 1));
		}
		await t.check(`${surface}: the matrix ran its ${looks.length * sizes.length} cells`, cellsRun === looks.length * sizes.length, `${cellsRun}`);
	};
}
