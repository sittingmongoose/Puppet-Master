// FO-154: a Settings confirm used to say its message twice — once as the dialog subtitle and again in the alert
// box drawn in the body ("Delete all memories?" was the reported case). confirmDialog now puts the message in one
// place: a warning-tone confirm (danger) keeps it in the alert box and leaves the subtitle empty; every other
// confirm keeps it in the subtitle and has no body at all. This check opens Settings confirms by real clicks
// (a press Playwright cannot land falls back to the page's own click, so a covered control is still visited; a
// "More …" menu row is pressed by that click on the row itself, because a pointer press has to scroll to reach a
// row and a scroll closes the menu it is in, FO-147; each chapter, each workspace, and each of the workspace's
// manager tabs: its danger and confirm-labelled
// buttons, and the danger/confirm rows of its "More …" menus), and asserts the dialog's message text appears
// exactly once, in the place the tone owns, fully readable (its own box not clipped, inside the dialog), and that
// a body holding no content is absent, display:none or no taller than its own hairline — round 1 left a 34 px
// blank band of body padding in every plain confirm. It needs at least one of each tone, must reach the item's
// own example, "Delete all memories?", and must leave no confirm it set out to visit (skipped === 0). Nothing here
// reads aria or a screen-reader tree: PMConcept7 has no such assertions, so the check judges what is visible —
// text shown once, the danger tone's red alert, and the box geometry. Fails on main, where both places carry the
// message, and on round 1 (ad79d847d6), where every plain confirm keeps the blank body band. Both surfaces
// (--set sandbox=0 and --set sandbox=1).
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-confirm-once.check.mjs --set page=<build>
// --set buttons=3 --set menus=2 --set items=4 bound the walk per workspace tab.
const DIALOG = '.overlay section.dialog[role="dialog"]';

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

async function readDialog(f) {
	return f.evaluate((sel) => {
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
		return {
			title: text(dialog.querySelector('.dialog-title')),
			sub,
			alert,
			subBox: box(subEl),
			alertBox: box(alertEl),
			warning: !!(strip && /(^|\s)(danger|warning)(\s|$)/.test(strip.className)),
			form: !!dialog.querySelector('.dialog-body input, .dialog-body textarea, .dialog-body select, .dialog-body .form-grid'),
			body: text(dialog.querySelector('.dialog-body')),
			bodyGap,
		};
	}, DIALOG);
}

/* One reading of a shown dialog: what the caller asserts. */
function assess(info) {
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
	let info = await readDialog(f);
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
		const again = await readDialog(f);
		if (again && !again.form) { info = again; v = assess(again); }
	}
	const { msg, other, count, once, readable, noBand, label } = v;
	bag.dialogs += 1;
	if (/^delete all memories\?$/i.test(norm(info.title))) bag.example += 1;
	if (once && info.warning) bag.warning += 1;
	if (once && !info.warning) bag.plain += 1;
	const clip = (s) => JSON.stringify(s).slice(0, 160);
	await t.check(`message once: ${where}: ${label}`, once, `occurrences ${count}, warning ${info.warning}, subtitle ${clip(info.sub)}, alert ${clip(info.alert)}, other ${clip(other)}`);
	await t.check(`message readable: ${where}: ${label}`, readable, `subtitle box ${JSON.stringify(info.subBox)}, alert box ${JSON.stringify(info.alertBox)}`);
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
		else await dismiss(f);
	}
	for (let m = 0; m < limits.menus; m++) {
		const more = await pick(f, ws, tab, 'more', [...seen], 'data-fo154more');
		if (!more) break;
		seen.add(more.key);
		if (!(await press(f, 'data-fo154more'))) { bag.skipped += 1; t.log(`unvisited menu: ${place} / ${more.name.slice(0, 60)}`); break; }
		const menu = await menuOpen(f);
		if (!menu) { await dismiss(f); continue; }
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
			else await dismiss(f);
		}
		await dismiss(f);
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
	const bag = { warning: 0, plain: 0, dialogs: 0, skipped: 0, example: 0 };
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
	await t.check("the item's own confirm is visited", bag.example > 0, `"Delete all memories?" seen ${bag.example} time(s), dialogs ${bag.dialogs}`);
	await t.check('no confirm was left unvisited', bag.dialogs > 0 && bag.skipped === 0, `skipped ${bag.skipped}, dialogs ${bag.dialogs}`);
}
