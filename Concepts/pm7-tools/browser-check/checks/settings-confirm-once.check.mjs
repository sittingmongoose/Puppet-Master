// FO-154: a Settings confirm used to show its message twice, once as the dialog subtitle and again in the
// alert box (confirmDialog). A warning-tone confirm (danger) keeps the alert and leaves the subtitle empty.
// Every other confirm keeps the subtitle and leaves the body empty. The same rule comes from that one
// function. This check opens every Settings confirm it can reach (each chapter, workspace, manager tab,
// disclosure, list row, More menu, and confirm-labelled or danger button), cancels it, and asserts the
// message text is in exactly one of those two places. It must open at least one warning confirm and one
// plain confirm. Fails on main, where both places carry the message. Both surfaces (--set sandbox=0 and
// --set sandbox=1).
const CONFIRM = /^(delete|remove|forget|reset|disconnect|revoke|clear|sign out|turn off|dismiss|roll back|clean up|claim|restart|rotate|allow(?:\s|$)|copy settings|copy the recovery|start history|start version|start restore|move workspace|back up|stop managing|stop [“"])/i;

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

function confirmish(name) {
	return CONFIRM.test(norm(name));
}

async function dismiss(f) {
	await f.evaluate(() => {
		const dialog = document.querySelector('.overlay section.dialog[role="dialog"]');
		if (dialog) {
			const cancel = dialog.querySelector('.dialog-footer [data-action="close-overlay"]') || dialog.querySelector('[data-action="close-overlay"]');
			if (cancel) cancel.click();
		}
		document.querySelectorAll('.drawer-wrap [data-action="close-overlay"]').forEach((b) => b.click());
	});
	const menu = f.locator('.pm51-popout[role="menu"]:visible');
	if (await menu.count()) await menu.first().press('Escape').catch(() => {});
	await f.waitForFunction(() => {
		const shown = (el) => !!(el && el.getClientRects().length);
		return !shown(document.querySelector('.overlay section.dialog')) && !shown(document.querySelector('.pm51-popout[role="menu"]')) && !shown(document.querySelector('.drawer-wrap:not([data-closing])'));
	}, null, { timeout: 2500 }).catch(() => {});
}

async function waitKind(f) {
	const handle = await f.waitForFunction(() => {
		const shown = (sel) => {
			const el = document.querySelector(sel);
			return !!(el && el.getClientRects().length);
		};
		if (shown('.overlay section.dialog[role="dialog"]')) return 'dialog';
		if (shown('.pm51-popout[role="menu"]')) return 'menu';
		if (shown('.drawer-wrap:not([data-closing])')) return 'drawer';
		return false;
	}, null, { timeout: 2000 }).catch(() => null);
	return handle ? handle.jsonValue() : '';
}

async function readDialog(f) {
	return f.evaluate(() => {
		const dialog = document.querySelector('.overlay section.dialog[role="dialog"]');
		if (!dialog) return null;
		const text = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim();
		const sub = text(dialog.querySelector('.dialog-sub'));
		const strip = dialog.querySelector('.dialog-body .alert-strip');
		const alert = strip ? text(strip.querySelector('div') || strip) : '';
		const title = text(dialog.querySelector('.dialog-title'));
		const warning = !!(strip && /(^|\s)(danger|warning)(\s|$)/.test(strip.className));
		const form = !!dialog.querySelector('.dialog-body input, .dialog-body textarea, .dialog-body select, .dialog-body .form-grid');
		return { sub, alert, title, warning, form };
	});
}

async function judge(t, f, bag, where) {
	const info = await readDialog(f);
	if (!info) return false;
	if (info.form && info.sub !== info.alert) {
		await dismiss(f);
		return false;
	}
	const same = !!(info.sub && info.alert && (info.sub === info.alert || info.sub.includes(info.alert) || info.alert.includes(info.sub)));
	const msg = same ? (info.sub.length <= info.alert.length ? info.sub : info.alert) : (info.sub || info.alert);
	const count = same ? 2 : (msg ? 1 : 0);
	const once = count === 1 && ((info.warning && !info.sub && info.alert === msg) || (!info.warning && !info.alert && info.sub === msg));
	bag.dialogs += 1;
	if (once && info.warning) bag.warning += 1;
	if (once && !info.warning) bag.plain += 1;
	const clip = (s) => JSON.stringify(s).slice(0, 180);
	await t.check(`message once: ${where}: ${info.title || msg}`, once, `count ${count}, warning ${info.warning}, subtitle ${clip(info.sub)}, alert ${clip(info.alert)}`);
	await dismiss(f);
	return true;
}

async function nextControl(f, ws, place, doneList) {
	return f.evaluate(({ ws, place, doneList }) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`) || document.querySelector('#workspace-stage');
		if (!body) return null;
		document.querySelectorAll('[data-fo154]').forEach((el) => el.removeAttribute('data-fo154'));
		const done = new Set(doneList);
		const vis = (el) => {
			if (el.closest('[inert], .overlay, .drawer-wrap, .pm51-popout')) return false;
			if (el.getAttribute('aria-disabled') === 'true' || el.dataset.pm51Disabled) return false;
			const r = el.getBoundingClientRect();
			return r.width > 1 && r.height > 1;
		};
		const nameOf = (el) => (el.getAttribute('aria-label') || el.innerText || '').replace(/\s+/g, ' ').trim();
		const confirmish = (name) => /^(delete|remove|forget|reset|disconnect|revoke|clear|sign out|turn off|dismiss|roll back|clean up|claim|restart|rotate|allow(?:\s|$)|copy settings|copy the recovery|start history|start version|start restore|move workspace|back up|stop managing|stop [“"])/i.test(name);
		const row = body.querySelector('.resource-row[aria-current="true"], .resource-row.active');
		const buttons = [...body.querySelectorAll('button')];
		for (const el of buttons) {
			if (!vis(el)) continue;
			if (el.classList.contains('pm51-dd-trigger') || el.classList.contains('pm51-acc-toggle') || el.classList.contains('manager-tab') || el.classList.contains('workspace-tab') || el.classList.contains('domain-link')) continue;
			const name = nameOf(el);
			const more = /^more\b/i.test(name);
			const danger = el.classList.contains('danger');
			if (!more && !danger && !confirmish(name)) continue;
			const data = [...el.attributes].filter((a) => a.name.startsWith('data-') && !['data-callback', 'data-fo154', 'data-pm-hover-label', 'data-pm-hover-detail', 'data-pm-hover-exempt'].includes(a.name)).map((a) => `${a.name}=${a.value}`).sort().join(',');
			const nth = buttons.filter((b) => nameOf(b) === name).indexOf(el);
			const inDetail = !!el.closest('.pm51-detail, .resource-detail');
			const key = [place, inDetail && row ? row.dataset.id || '' : '', name, el.getAttribute('data-action') || '', data, nth].join('|');
			if (done.has(key)) continue;
			el.setAttribute('data-fo154', 'go');
			return { key, name, more };
		}
		return null;
	}, { ws, place, doneList });
}

async function clickMarked(f) {
	const btn = f.locator('[data-fo154="go"]').first();
	await btn.scrollIntoViewIfNeeded({ timeout: 3000 });
	await btn.click({ timeout: 5000 });
}

async function ensureMenu(f) {
	if (await f.locator('.pm51-popout[role="menu"]:visible').count()) return true;
	await clickMarked(f);
	return f.locator('.pm51-popout[role="menu"]').waitFor({ state: 'visible', timeout: 2500 }).then(() => true).catch(() => false);
}

async function harvest(t, f, ws, place, bag, done) {
	for (let n = 0; n < 80; n++) {
		await dismiss(f);
		const found = await nextControl(f, ws, place, [...done]);
		if (!found) return;
		if (found.more) {
			let opened = false;
			try {
				opened = await ensureMenu(f);
			} catch (e) {
				bag.skipped += 1;
				t.log(`unreachable menu ${place}: ${found.name}`);
				done.add(found.key);
				await dismiss(f);
				continue;
			}
			if (!opened) {
				const kind = await waitKind(f);
				if (kind === 'dialog') await judge(t, f, bag, `${place} / ${found.name}`);
				else await dismiss(f);
				done.add(found.key);
				continue;
			}
			const items = await f.locator('.pm51-popout[role="menu"] .pm51-menu-item').evaluateAll((els) => els.map((el) => ({
				index: el.getAttribute('data-index'),
				label: ((el.querySelector('.pm51-popout-label') || el).textContent || '').replace(/\s+/g, ' ').trim(),
				danger: el.classList.contains('is-danger'),
				off: el.getAttribute('aria-disabled') === 'true',
			})));
			let any = false;
			for (const item of items) {
				if (item.off || !item.index) continue;
				if (!item.danger && !confirmish(item.label)) continue;
				const itemKey = `${found.key}::${item.label}`;
				if (done.has(itemKey)) continue;
				done.add(itemKey);
				any = true;
				if (!(await f.locator('.pm51-popout[role="menu"]:visible').count())) {
					try { if (!(await ensureMenu(f))) break; } catch (e) { break; }
				}
				const menuItem = f.locator(`.pm51-popout[role="menu"] .pm51-menu-item[data-index="${item.index}"]`);
				try { await menuItem.click({ timeout: 4000 }); } catch (e) { bag.skipped += 1; continue; }
				const kind = await waitKind(f);
				if (kind === 'dialog') await judge(t, f, bag, `${place} / ${found.name} / ${item.label}`);
				else await dismiss(f);
			}
			if (!any) await dismiss(f);
			done.add(found.key);
			continue;
		}
		done.add(found.key);
		try {
			await clickMarked(f);
		} catch (e) {
			bag.skipped += 1;
			t.log(`unreachable ${place}: ${found.name}`);
			await dismiss(f);
			continue;
		}
		const kind = await waitKind(f);
		if (kind === 'dialog') await judge(t, f, bag, `${place} / ${found.name}`);
		else if (kind === 'menu') {
			done.delete(found.key);
			// A confirm-labelled control opened a menu. Treat it as a menu on the next pass by renaming is not
			// possible from here; walk its items now.
			const items = await f.locator('.pm51-popout[role="menu"] .pm51-menu-item').evaluateAll((els) => els.map((el) => ({
				index: el.getAttribute('data-index'),
				label: ((el.querySelector('.pm51-popout-label') || el).textContent || '').replace(/\s+/g, ' ').trim(),
				danger: el.classList.contains('is-danger'),
				off: el.getAttribute('aria-disabled') === 'true',
			})));
			for (const item of items) {
				if (item.off || (!item.danger && !confirmish(item.label))) continue;
				const itemKey = `${found.key}::${item.label}`;
				if (done.has(itemKey)) continue;
				done.add(itemKey);
				if (!(await f.locator('.pm51-popout[role="menu"]:visible').count())) {
					try { await clickMarked(f); } catch (e) { break; }
				}
				try { await f.locator(`.pm51-popout[role="menu"] .pm51-menu-item[data-index="${item.index}"]`).click({ timeout: 4000 }); } catch (e) { continue; }
				const next = await waitKind(f);
				if (next === 'dialog') await judge(t, f, bag, `${place} / ${found.name} / ${item.label}`);
				else await dismiss(f);
			}
			done.add(found.key);
			await dismiss(f);
		} else await dismiss(f);
	}
}

async function expand(f, ws) {
	await f.evaluate((ws) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		if (!body) return;
		body.querySelectorAll('details:not([open]) > summary').forEach((s) => s.click());
		body.querySelectorAll('.pm51-acc-item:not(.is-open) .pm51-acc-toggle').forEach((b) => b.click());
	}, ws);
}

async function walkRows(t, f, ws, place, bag, done) {
	const ids = await f.evaluate((ws) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		if (!body) return [];
		return [...body.querySelectorAll('.resource-row')].filter((r) => r.getClientRects().length && r.getAttribute('aria-disabled') !== 'true').map((r) => r.dataset.id || '');
	}, ws);
	for (const id of ids) {
		const rk = `row|${place}|${id}`;
		if (done.has(rk)) continue;
		done.add(rk);
		const marked = await f.evaluate(({ ws, id }) => {
			document.querySelectorAll('[data-fo154-row]').forEach((el) => el.removeAttribute('data-fo154-row'));
			const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
			const row = body && [...body.querySelectorAll('.resource-row')].find((r) => (r.dataset.id || '') === id);
			if (!row) return false;
			row.setAttribute('data-fo154-row', '1');
			return row.getAttribute('aria-current') === 'true';
		}, { ws, id });
		if (marked === false && !(await f.locator('[data-fo154-row="1"]').count())) continue;
		if (marked !== true) {
			try {
				await f.locator('[data-fo154-row="1"]').click({ timeout: 4000 });
				await f.waitForFunction((want) => {
					const row = document.querySelector('[data-fo154-row="1"]');
					return !row || row.getAttribute('aria-current') === 'true' || (row.dataset.id || '') === want;
				}, id, { timeout: 3000 }).catch(() => {});
			} catch (e) {
				bag.skipped += 1;
			}
		}
		await expand(f, ws);
		await harvest(t, f, ws, place, bag, done);
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

export default async function (t) {
	await t.viewport(1440, 900);
	const f = await t.app.open({ settleMs: 800 });
	await f.locator('#tab-settings').click();
	await f.locator('#pm-settings-root .domain-link').first().waitFor({ state: 'visible', timeout: 20000 });
	const bag = { warning: 0, plain: 0, dialogs: 0, skipped: 0 };
	const done = new Set();
	await harvest(t, f, '', 'home', bag, done);
	const domains = await f.locator('#pm-settings-root .domain-link').evaluateAll((els) => els.map((e) => e.getAttribute('data-domain')).filter(Boolean));
	for (const domain of domains) {
		if (!(await openChapter(f, domain))) {
			await t.check(`opened chapter ${domain}`, false, 'the chapter link did not stay open');
			continue;
		}
		const tabs = await f.locator('#pm-settings-root .workspace-tab').evaluateAll((els) => els.map((e) => e.getAttribute('data-workspace')).filter(Boolean));
		t.log(`${domain}: ${tabs.length} workspaces`);
		for (const ws of tabs) {
			await f.locator(`#pm-settings-root .workspace-tab[data-workspace="${ws}"]`).click({ timeout: 8000 });
			await f.waitForFunction((id) => {
				const body = document.querySelector(`[data-continuous-workspace-body="${id}"]`);
				return !!(body && body.getAttribute('data-workspace-mounted') === 'true');
			}, ws, { timeout: 8000 });
			await expand(f, ws);
			const managerTabs = await f.evaluate((id) => {
				const body = document.querySelector(`[data-continuous-workspace-body="${id}"]`);
				if (!body) return [];
				return [...body.querySelectorAll('.manager-tab')].map((b) => b.getAttribute('data-tab')).filter(Boolean);
			}, ws);
			const passes = managerTabs.length ? managerTabs : [''];
			for (const tab of passes) {
				if (tab) {
					const tabBtn = f.locator(`[data-continuous-workspace-body="${ws}"] .manager-tab[data-tab="${tab}"]`);
					if (await tabBtn.count()) {
						await tabBtn.scrollIntoViewIfNeeded().catch(() => {});
						await tabBtn.click({ timeout: 5000 }).catch(() => {});
						await f.waitForTimeout(200);
					}
				}
				await expand(f, ws);
				const place = `${domain}/${ws}${tab ? '/' + tab : ''}`;
				await harvest(t, f, ws, place, bag, done);
				await walkRows(t, f, ws, place, bag, done);
			}
		}
	}
	await dismiss(f);
	await t.check('opened at least one Settings confirm', bag.dialogs > 0, `dialogs ${bag.dialogs}, skipped ${bag.skipped}`);
	await t.check('a warning-tone confirm keeps only its alert', bag.warning > 0, `warning ${bag.warning}, dialogs ${bag.dialogs}`);
	await t.check('a plain confirm keeps only its subtitle', bag.plain > 0, `plain ${bag.plain}, dialogs ${bag.dialogs}`);
}
