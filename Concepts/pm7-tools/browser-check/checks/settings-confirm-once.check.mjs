// FO-154: a Settings confirm used to say its message twice — once as the dialog subtitle and again in the alert
// box drawn in the body ("Delete all memories?" was the reported case). confirmDialog now puts the message in one
// place: a warning-tone confirm (danger) keeps it in the alert box and leaves the subtitle empty; every other
// confirm keeps it in the subtitle and has no body at all. This check opens Settings confirms by real clicks:
// every chapter, every workspace, and every manager tab of a workspace, taking its danger and confirm-labelled
// buttons and the danger/confirm rows of its "More …" menus (a press Playwright cannot land falls back to the
// page's own click, and a menu row is pressed by that click on the row itself, because a pointer press has to
// scroll to reach a row and a scroll closes the menu it is in — FO-147). It asserts the dialog's message text
// appears exactly once, in the place the tone owns, fully readable (its own box not clipped, inside the dialog), and that
// a body holding no content is absent, display:none or no taller than its own hairline — round 1 left a 34 px
// blank band of body padding in every plain confirm. It needs at least one of each tone, must reach the item's
// own example, "Delete all memories?", and must leave no confirm it set out to visit (skipped === 0). A press that
// opens an inline editor instead of a confirm closes it by the product's own controls (its footer close/cancel,
// then its Close X, then the Escape the panel owns) and asserts it is gone before the walk moves on — an editor
// left open covers the rail and ends the walk at the next chapter click (F12A-NORMAL-CONFIRM-CLOSE-20261112). Nothing here
// reads aria or a screen-reader tree: PMConcept7 has no such assertions, so the check judges what is visible —
// text shown once, the danger tone's red alert, and the box geometry. Fails on main, where both places carry the
// message, and on round 1 (ad79d847d6), where every plain confirm keeps the blank body band. Both surfaces
// (--set sandbox=0 and --set sandbox=1).
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-confirm-once.check.mjs --set page=<build>
// --set buttons=3 --set menus=2 --set items=4 bound the walk per workspace tab.
const DIALOG = '.overlay section.dialog[role="dialog"]';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
/* settings-dialog-entries.json (beside this check): dialogs a later approved design retired or draws with its own body.
   --set dialogEntries=<json>|none names another file or turns it off (the bite: without it FO-167's page fails here). */
function dialogEntries(t) {
	if (t.args.dialogEntries === 'none') return { path: 'none', retired: [], custom: [] };
	const path = t.args.dialogEntries ? String(t.args.dialogEntries) : fileURLToPath(new URL('./settings-dialog-entries.json', import.meta.url));
	const d = JSON.parse(fs.readFileSync(path, 'utf8'));
	return { path, retired: d.retired || [], custom: d.custom || [] };
}

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

async function dialogShown(f) {
	return f.waitForFunction((sel) => {
		const els = [...document.querySelectorAll(sel)];
		return els.some((e) => {
			const cs = getComputedStyle(e);
			return e.getClientRects().length > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
		});
	}, DIALOG, { timeout: 1200 }).then(() => true).catch(() => false);
}

async function dismiss(f) {
	await f.evaluate((sel) => {
		const els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length);
		const dialog = els[els.length - 1];
		if (!dialog) return;
		const cancel = dialog.querySelector('.dialog-footer [data-action="close-overlay"]') || dialog.querySelector('[data-action="close-overlay"]');
		if (cancel) cancel.click();
	}, DIALOG);
	await f.waitForFunction((sel) => !document.querySelector(sel), DIALOG, { timeout: 1500 }).catch(() => {});
}

/* A press can open an inline editor — a drawer panel, "Allowed computers" is one — instead of a confirm. That is
   not a confirm to judge, but it cannot be left open either: its modal covers the rail, and the next chapter click
   times out behind it (F12A-NORMAL-CONFIRM-CLOSE-20261112). Close it with the product's own controls — the panel's
   own footer close/cancel button, then its Close X, then the Escape the panel itself owns while it is open — and
   assert it is gone before the walk moves on. A drawer that will not close is a setup failure named here, never a
   silent catch. */
async function closeOpened(t, f, where) {
	const opened = await f.evaluate(() => {
		const wraps = [...document.querySelectorAll('.drawer-wrap')].filter((w) => w.isConnected && w.dataset.closing !== '1');
		const wrap = wraps[wraps.length - 1];
		if (!wrap) return null;
		const panel = wrap.querySelector('.drawer');
		const title = (((panel && panel.getAttribute('aria-label')) || (wrap.querySelector('.pm51-panel-title') || {}).textContent) || '').replace(/\s+/g, ' ').trim();
		return {
			title,
			footer: !!panel && !!panel.querySelector('.pm51-panel-foot [data-action="close-overlay"], .drawer-footer [data-action="close-overlay"]'),
			x: !!panel && !!panel.querySelector('.pm51-panel-close[data-action="close-overlay"], .dialog-head .icon-btn[data-action="close-overlay"]'),
		};
	});
	if (!opened) return;
	const gone = () => f.waitForFunction(() => !document.querySelector('.drawer-wrap'), null, { timeout: 2000 }).then(() => true).catch(() => false);
	for (const how of ['footer', 'x', 'escape']) {
		if ((how === 'footer' && !opened.footer) || (how === 'x' && !opened.x)) continue;
		await f.evaluate((how) => {
			const wraps = [...document.querySelectorAll('.drawer-wrap')].filter((w) => w.isConnected && w.dataset.closing !== '1');
			const wrap = wraps[wraps.length - 1];
			if (!wrap) return;
			const panel = wrap.querySelector('.drawer');
			if (how === 'escape') {
				/* the panel owns Escape while it is open; the key must come from inside Settings for it to count */
				const owns = window.PM7_SETTINGS_TOME && window.PM7_SETTINGS_TOME.ownsEvent;
				const at = owns && document.activeElement && owns(document.activeElement) ? document.activeElement : (panel || wrap);
				at.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
				return;
			}
			const el = how === 'footer'
				? panel && panel.querySelector('.pm51-panel-foot [data-action="close-overlay"], .drawer-footer [data-action="close-overlay"]')
				: panel && panel.querySelector('.pm51-panel-close[data-action="close-overlay"], .dialog-head .icon-btn[data-action="close-overlay"]');
			if (el) el.click();
		}, how).catch(() => {});
		if (await gone()) {
			await t.check(`closed the inline editor it opened: ${where} / ${opened.title}`, true, '');
			return;
		}
	}
	await t.check(`closed the inline editor it opened: ${where} / ${opened.title}`, false,
		'setup: the press opened this inline editor and its own footer close, Close X and Escape left it open — the walk cannot pass it; name this editor to the kit owner');
}

async function readDialog(f, customs = []) {
	return f.evaluate(([sel, customs]) => {
		const els = [...document.querySelectorAll(sel)];
		const shown = els.filter((e) => {
			const cs = getComputedStyle(e);
			return e.getClientRects().length > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
		});
		const dialog = shown[shown.length - 1];
		if (!dialog) return null;
		const text = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim();
		const subEl = dialog.querySelector('.dialog-sub');
		const strip = dialog.querySelector('.dialog-body .alert-strip');
		const alertEl = strip ? (strip.querySelector('div') || strip) : null;
		const sub = text(subEl);
		const alert = text(alertEl);
		const bodyEl = dialog.querySelector('.dialog-body');
		const bodyGap = !bodyEl ? null : (() => {
			const r = bodyEl.getBoundingClientRect(), cs = getComputedStyle(bodyEl);
			return {
				h: Math.round(r.height * 10) / 10,
				display: cs.display,
				pad: `${cs.paddingTop} ${cs.paddingBottom}`,
				content: text(bodyEl) !== '' || bodyEl.children.length > 0,
			};
		})();
		const box = (n) => {
			if (!n) return null;
			const r = n.getBoundingClientRect(), d = dialog.getBoundingClientRect();
			const cs = getComputedStyle(n);
			return {
				clip: n.scrollHeight > n.clientHeight + 2 || n.scrollWidth > n.clientWidth + 2,
				inside: r.top >= d.top - 1 && r.bottom <= d.bottom + 1 && r.left >= d.left - 1 && r.right <= d.right + 1,
				visible: r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none',
				font: parseFloat(cs.fontSize) || 0,
				ink: cs.color,
			};
		};
		/* a design-pinned custom confirm (settings-dialog-entries.json): its own message line, how often its words appear
		   in the whole dialog, and its contrast against the colour painted under it (its backgrounds composited upward) */
		const title = text(dialog.querySelector('.dialog-title'));
		const entry = customs.find((c) => c.title === title);
		let custom = null;
		if (entry) {
			const el = dialog.querySelector(entry.message);
			const words = text(el);
			const all = text(dialog);
			let count = 0;
			for (let i = words ? all.indexOf(words) : -1; i >= 0; i = all.indexOf(words, i + words.length)) count += 1;
			const rgba = (c) => { const m = (c || '').match(/[\d.]+/g) || []; const k = /^color\(srgb/.test(c || '') ? 255 : 1; return [(+m[0] || 0) * k, (+m[1] || 0) * k, (+m[2] || 0) * k, m[3] === undefined ? 1 : +m[3]]; };
			const lum = ([r, g, b]) => { const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b); };
			let contrast = null;
			if (el) {
				const layers = [];
				for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const c = rgba(getComputedStyle(n).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 0.999) break; }
				let under = [0, 0, 0];
				if (!layers.length || layers[layers.length - 1][3] < 0.999) under = rgba(getComputedStyle(document.body).backgroundColor).slice(0, 3);
				for (const c of layers.reverse()) under = under.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
				const ink = rgba(getComputedStyle(el).color);
				const fg = under.map((v, i) => v * (1 - ink[3]) + ink[i] * ink[3]);
				const [hi, lo] = [lum(fg), lum(under)].sort((x, y) => y - x);
				contrast = Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
			}
			custom = { selector: entry.message, words, count, box: box(el), contrast };
		}
		return {
			title,
			custom,
			sub,
			alert,
			subBox: box(subEl),
			alertBox: box(alertEl),
			warning: !!(strip && /(^|\s)(danger|warning)(\s|$)/.test(strip.className)),
			form: !!dialog.querySelector('.dialog-body input, .dialog-body textarea, .dialog-body select, .dialog-body .form-grid'),
			body: text(dialog.querySelector('.dialog-body')),
			bodyGap,
		};
	}, [DIALOG, customs]);
}

/* One reading of a shown dialog: what the caller asserts. */
function assess(info) {
	if (info.custom) {
		/* a design-pinned custom confirm: its one message line holds the message, exactly once in the whole dialog, readable
		   at 11 px or more and 4.5:1 or more, and neither the subtitle nor an alert strip repeats it */
		const c = info.custom;
		const once = !!c.words && c.count === 1 && !info.sub && !info.alert;
		const readable = !!c.box && c.box.visible && !c.box.clip && c.box.inside && c.box.font >= 11 && c.contrast !== null && c.contrast >= 4.5;
		return { msg: c.words, other: info.sub || info.alert, count: c.count, once, readable, noBand: true, label: info.title || norm(c.words).slice(0, 60), info };
	}
	const msg = info.sub.length >= info.alert.length ? info.sub : info.alert;
	const other = msg === info.sub ? info.alert : info.sub;
	const count = (msg && info.sub === msg ? 1 : 0) + (msg && info.alert === msg ? 1 : 0);
	const owner = info.warning ? info.alertBox : info.subBox;
	const once = count === 1 && (info.warning ? info.alert === msg && !info.sub : info.sub === msg && !info.alert);
	const readable = !!owner && owner.visible && !owner.clip && owner.inside && owner.font >= 10 && owner.ink !== 'rgba(0, 0, 0, 0)';
	/* a body with nothing in it must take no space: absent, display:none, or no taller than a hairline */
	const gap = info.bodyGap;
	const noBand = !gap || gap.content || gap.display === 'none' || gap.h <= 1;
	return { msg, other, count, once, readable, noBand, label: info.title || norm(msg).slice(0, 60), info };
}

async function judge(t, f, bag, where) {
	let info = await readDialog(f, bag.entries.custom);
	if (!info) return false;
	/* an editor/creation dialog reached from a "More" menu is not a confirm: its subtitle is a description, not a message */
	if (info.form) {
		await dismiss(f);
		return false;
	}
	let v = assess(info);
	/* a dialog pressed in the page can be read a frame before its text has a box: one re-read settles that */
	if (!v.readable) {
		await f.waitForTimeout(200);
		const again = await readDialog(f, bag.entries.custom);
		if (again && !again.form) { info = again; v = assess(again); }
	}
	const { msg, other, count, once, readable, noBand, label } = v;
	bag.dialogs += 1;
	if (/^delete all memories\?$/i.test(norm(info.title))) bag.example += 1;
	if (bag.entries.retired.some((r) => r.title === norm(info.title))) bag.retiredSeen.push(`${where}: ${info.title}`);
	if (info.custom) bag.customSeen[info.title] = (bag.customSeen[info.title] || 0) + 1;
	else if (once && info.warning) bag.warning += 1;
	else if (once && !info.warning) bag.plain += 1;
	const clip = (s) => JSON.stringify(s).slice(0, 160);
	await t.check(`message once: ${where}: ${label}`, once, `occurrences ${count}, warning ${info.warning}, subtitle ${clip(info.sub)}, alert ${clip(info.alert)}, other ${clip(other)}`);
	await t.check(`message readable: ${where}: ${label}`, readable, info.custom ? `custom ${info.custom.selector} box ${JSON.stringify(info.custom.box)}, contrast ${info.custom.contrast}` : `subtitle box ${JSON.stringify(info.subBox)}, alert box ${JSON.stringify(info.alertBox)}`);
	await t.check(`no empty body band: ${where}: ${label}`, noBand, `body ${v.info.bodyGap ? JSON.stringify(v.info.bodyGap) : 'absent'}`);
	await dismiss(f);
	return true;
}

async function expand(f, ws) {
	await f.evaluate((ws) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		if (!body) return;
		body.querySelectorAll('details:not([open]) > summary').forEach((s) => s.click());
		body.querySelectorAll('.pm51-acc-item:not(.is-open) .pm51-acc-toggle').forEach((b) => b.click());
	}, ws);
}

/* Direct buttons (danger, or a confirm-labelled name), then the danger/confirm rows of each "More …" menu. */
const CONFIRM_IN_PAGE = /^(delete|remove|forget|reset|disconnect|revoke|clear|sign out|turn off|roll back|clean up|claim|restart|rotate|allow|copy settings|copy the recovery|start |move workspace|back up|stop )/i;

/* A press that still opens the dialog when Playwright's own click cannot land (a covered or just re-rendered
   control): the page's own click reaches the button's listener, which is what opens the confirm. */
async function press(f, attr) {
	await f.locator(`[${attr}]`).first().scrollIntoViewIfNeeded({ timeout: 2500 }).catch(() => {});
	try { await f.locator(`[${attr}]`).first().click({ timeout: 4000 }); return true; } catch (e) { /* fall back below */ }
	return f.evaluate((a) => { const el = document.querySelector(`[${a}]`); if (!el) return false; el.click(); return true; }, attr).catch(() => false);
}

const MENU = '.pm51-popout[role="menu"]';

/* A row is pressed where the open menu draws it, by the page's own click on that row. A pointer press has to
   bring the row into view first, and a menu closes when the box holding its anchor scrolls that anchor away
   (FO-147) — the memory row menu shuts between a second item's press and its pointer press for exactly that
   reason. The page's click opens the same confirm the pointer would, and that dialog is what this check judges. */
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

async function menuOpen(f, ms = 2000) {
	return f.waitForFunction((sel) => {
		const pops = [...document.querySelectorAll(sel)].filter((p) => p.getClientRects().length);
		return pops.length > 0;
	}, MENU, { timeout: ms }).then(() => true).catch(() => false);
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

async function scan(t, f, ws, tab, place, bag, seen, limits) {
	for (let i = 0; i < limits.buttons; i++) {
		const picked = await pick(f, ws, tab, 'button', [...seen], 'data-fo154btn');
		if (!picked) break;
		seen.add(picked.key);
		if (!(await press(f, 'data-fo154btn'))) { bag.skipped += 1; t.log(`unvisited confirm: ${place} / ${picked.name.slice(0, 60)}`); break; }
		if (await dialogShown(f)) await judge(t, f, bag, `${place} / ${picked.name.slice(0, 50)}`);
		else { await dismiss(f); await closeOpened(t, f, `${place} / ${picked.name.slice(0, 50)}`); }
	}
	for (let m = 0; m < limits.menus; m++) {
		const more = await pick(f, ws, tab, 'more', [...seen], 'data-fo154more');
		if (!more) break;
		seen.add(more.key);
		if (!(await press(f, 'data-fo154more'))) { bag.skipped += 1; t.log(`unvisited menu: ${place} / ${more.name.slice(0, 60)}`); break; }
		const menu = await menuOpen(f);
		if (!menu) { await dismiss(f); await closeOpened(t, f, `${place} / ${more.name.slice(0, 50)}`); continue; }
		const items = await f.evaluate(({ pattern, sel }) => {
			const rx = new RegExp(pattern, 'i');
			const pops = [...document.querySelectorAll(sel)].filter((p) => p.getClientRects().length);
			const pop = pops[pops.length - 1];
			if (!pop) return [];
			return [...pop.querySelectorAll('.pm51-menu-item')].map((el, i) => ({ i, label: (el.textContent || '').replace(/\s+/g, ' ').trim(), danger: el.classList.contains('is-danger'), off: el.getAttribute('aria-disabled') === 'true' }))
				.filter((it) => !it.off && (it.danger || rx.test(it.label)));
		}, { pattern: CONFIRM_IN_PAGE.source, sel: MENU });
		for (const item of items.slice(0, limits.items)) {
			const row = await rowPress(f, 'data-fo154more', item.label);
			if (!row.ok) { bag.skipped += 1; t.log(`unvisited menu row: ${place} / ${more.name.slice(0, 40)} / ${item.label.slice(0, 40)} (${row.why})`); continue; }
			if (await dialogShown(f)) await judge(t, f, bag, `${place} / ${more.name.slice(0, 40)} / ${item.label.slice(0, 40)}`);
			else { await dismiss(f); await closeOpened(t, f, `${place} / ${more.name.slice(0, 40)} / ${item.label.slice(0, 40)}`); }
		}
		await dismiss(f);
		await closeOpened(t, f, place);
	}
}

async function openChapter(f, domain) {
	for (let i = 0; i < 3; i++) {
		await f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).click({ timeout: 8000 });
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
		/* a manager tab whose press Playwright cannot land still switches by the page's own click */
		const pressed = await f.evaluate(([w, id]) => {
			const body = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
			const btn = body && body.querySelector(`.manager-tab[data-tab="${id}"]`);
			if (!btn) return false;
			btn.click();
			return true;
		}, [ws, tab]).catch(() => false);
		if (!pressed) return false;
	}
	return f.waitForFunction(([w, id]) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
		const btn = body && body.querySelector(`.manager-tab[data-tab="${id}"]`);
		return !!(btn && btn.classList.contains('active'));
	}, [ws, tab], { timeout: 6000 }).then(() => true).catch(() => false);
}

export default async function (t) {
	await t.viewport(1440, 900);
	const limits = { buttons: Number(t.args.buttons || 3), menus: Number(t.args.menus || 2), items: Number(t.args.items || 4) };
	const f = await t.app.open({ settleMs: 800 });
	await f.locator('#tab-settings').click();
	await f.locator('#pm-settings-root .domain-link').first().waitFor({ state: 'visible', timeout: 20000 });
	const entries = dialogEntries(t);
	t.log(`dialog entries: ${entries.path} (${entries.retired.length} retired, ${entries.custom.length} custom)`);
	const bag = { warning: 0, plain: 0, dialogs: 0, skipped: 0, example: 0, entries, retiredSeen: [], customSeen: {} };
	const seen = new Set();
	const domains = await f.locator('#pm-settings-root .domain-link').evaluateAll((els) => els.map((e) => e.getAttribute('data-domain')).filter(Boolean));
	for (const domain of domains) {
		if (!(await openChapter(f, domain))) {
			await t.check(`opened chapter ${domain}`, false, 'the chapter link did not stay open');
			continue;
		}
		const tabs = await f.locator('#pm-settings-root .workspace-tab').evaluateAll((els) => els.map((e) => e.getAttribute('data-workspace')).filter(Boolean));
		t.log(`${domain}: ${tabs.length} workspaces`);
		for (const ws of tabs) {
			await f.locator(`#pm-settings-root .workspace-tab[data-workspace="${ws}"]`).click({ timeout: 8000 }).catch(() => {});
			const mounted = await f.waitForFunction((id) => {
				const body = document.querySelector(`[data-continuous-workspace-body="${id}"]`);
				return !!(body && body.getAttribute('data-workspace-mounted') === 'true');
			}, ws, { timeout: 8000 }).then(() => true).catch(() => false);
			if (!mounted) { await t.check(`mounted ${domain}/${ws}`, false, 'the workspace body never mounted'); continue; }
			/* a workspace's manager tabs each draw their own confirms; the drawn-tab first, then every other */
			const managers = await f.locator(`[data-continuous-workspace-body="${ws}"] .manager-tab`).evaluateAll((els) => els.map((e) => e.getAttribute('data-tab')).filter(Boolean));
			for (const tab of [null, ...managers]) {
				if (tab && !(await openManagerTab(f, ws, tab))) {
					await t.check(`opened manager tab ${domain}/${ws}/${tab}`, false, 'the tab never became the drawn one');
					continue;
				}
				const place = `${domain}/${ws}${tab ? `/${tab}` : ''}`;
				await expand(f, ws);
				await scan(t, f, ws, tab, place, bag, seen, limits);
			}
		}
	}
	await dismiss(f);
	await t.check('opened at least one Settings confirm', bag.dialogs > 0, `dialogs ${bag.dialogs}, skipped ${bag.skipped}`);
	await t.check('a warning-tone confirm keeps only its alert', bag.warning > 0, `warning ${bag.warning}, dialogs ${bag.dialogs}`);
	await t.check('a plain confirm keeps only its subtitle', bag.plain > 0, `plain ${bag.plain}, dialogs ${bag.dialogs}`);
	/* FO-154's own example: visited, unless an explicit entry retires it; then it must be unreachable */
	const exampleRetired = entries.retired.some((r) => /^delete all memories\?$/i.test(r.title));
	if (exampleRetired) await t.check("the item's own example is retired and no click reaches it", bag.example === 0, `"Delete all memories?" seen ${bag.example} time(s), dialogs ${bag.dialogs}; ${entries.retired.find((r) => /^delete all memories\?$/i.test(r.title)).why}`);
	else await t.check("the item's own confirm is visited", bag.example > 0, `"Delete all memories?" seen ${bag.example} time(s), dialogs ${bag.dialogs}`);
	await t.check('no retired dialog is reachable', bag.retiredSeen.length === 0, bag.retiredSeen.slice(0, 4).join(' | ') || `${entries.retired.length} retired`);
	for (const c of entries.custom) await t.check(`the design-pinned confirm "${c.title}" was visited and judged by its own line`, (bag.customSeen[c.title] || 0) > 0, `seen ${bag.customSeen[c.title] || 0} time(s)`);
	await t.check('no confirm was left unvisited', bag.dialogs > 0 && bag.skipped === 0, `skipped ${bag.skipped}, dialogs ${bag.dialogs}`);
}
