// FO-155: a button that opens a popup menu or listbox must say so. Before this fix every Settings menu trigger
// (a row's "More …" icon button) carried no aria-expanded and never got one: the shared popout engine opened the
// menu without marking the trigger, so assistive tech could not tell open from closed. The engine now sets
// aria-haspopup (menu for a menu, listbox for a list) and aria-expanded="true" on the trigger when it opens, and
// leaves aria-expanded="false" when the popout closes by Escape, an outside press or a pick.
//
// The check opens and closes every menu and listbox it can reach in Settings (each chapter, each workspace, each
// manager tab: its "More …" buttons and its dropdown triggers, bounded by `--set maxMenus=` and `--set maxLists=`),
// then the app's own title-bar and look menus and the chat's More options, on the surface it is given
// (--set sandbox=0 / --set sandbox=1). It fails on main, where a Settings menu's trigger never says expanded.
const MENU = '.pm51-popout[role="menu"]';
const LIST = '.pm51-popout[role="listbox"]';

async function attrs(f, sel) {
	return f.evaluate((sel) => {
		const el = document.querySelector(sel);
		if (!el) return null;
		return {
			popup: el.getAttribute('aria-haspopup'),
			expanded: el.getAttribute('aria-expanded'),
			controls: el.getAttribute('aria-controls'),
			label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
		};
	}, sel);
}

async function popupId(f, sel) {
	return f.evaluate((sel) => {
		const el = document.querySelector(sel);
		return el ? el.id : '';
	}, sel);
}

async function waitPopup(f, sel) {
	return f.waitForFunction((sel) => {
		const el = document.querySelector(sel);
		return !!(el && el.getClientRects().length);
	}, sel, { timeout: 3000 }).then(() => true).catch(() => false);
}

async function waitGone(f) {
	return f.waitForFunction(() => !document.querySelector('.pm51-popout[role="menu"], .pm51-popout[role="listbox"]'), null, { timeout: 4000 }).then(() => true).catch(() => false);
}

async function escape(f) {
	const pop = f.locator(`${MENU}:visible, ${LIST}:visible`).first();
	if (await pop.count()) await pop.press('Escape', { timeout: 3000 }).catch(() => {});
	return waitGone(f);
}

async function outsidePress(f) {
	await f.locator('#pm-settings-root .pm51-scroll').first().click({ position: { x: 4, y: 4 }, timeout: 4000 }).catch(async () => {
		await f.locator('#pm-settings-root .workspace-tabs').first().click({ position: { x: 4, y: 4 }, timeout: 4000 }).catch(() => {});
	});
	return waitGone(f);
}

async function dismissDialog(f) {
	await f.evaluate(() => {
		document.querySelectorAll('.overlay section.dialog[role="dialog"] .dialog-footer [data-action="close-overlay"], .overlay section.dialog[role="dialog"] [data-action="close-overlay"]').forEach((b, i) => { if (i < 2) b.click(); });
	});
	await f.waitForFunction(() => !document.querySelector('.overlay section.dialog[role="dialog"]'), null, { timeout: 3000 }).catch(() => {});
}

async function triggerAt(f, list, index, attr = 'data-fo155') {
	return f.evaluate(({ list, index, attr }) => {
		document.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
		const els = [...document.querySelectorAll(list)].filter((el) => {
			if (el.closest('[inert], .overlay, .drawer-wrap, .pm51-popout')) return false;
			if (el.getAttribute('aria-disabled') === 'true') return false;
			const r = el.getBoundingClientRect();
			return r.width > 1 && r.height > 1;
		});
		const el = els[index];
		if (!el) return null;
		el.setAttribute(attr, '1');
		return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
	}, { list, index, attr });
}

async function closeAny(f) {
	await escape(f);
	await dismissDialog(f);
}

/* one dropdown trigger: open, attributes open, Escape, attributes closed, and once each way of closing */
async function listCase(t, f, where, closeWay) {
	if (!(await triggerAt(f, '#pm-settings-root .pm51-dd-trigger', 0))) return false;
	const label = (await attrs(f, '[data-fo155]'))?.label || '';
	await f.locator('[data-fo155]').first().click({ timeout: 5000 });
	const opened = await waitPopup(f, LIST);
	const id = await popupId(f, LIST);
	const open = await attrs(f, '[data-fo155]');
	await t.check(`list ${where} / ${label}: opening says expanded`, opened && open?.expanded === 'true' && open?.popup === 'listbox', `opened ${opened}, aria-haspopup ${open?.popup}, aria-expanded ${open?.expanded}`);
	await t.check(`list ${where} / ${label}: points at the list it opened`, !!id && open?.controls === id, `aria-controls ${open?.controls}, list ${id}`);
	let gone = false;
	if (closeWay === 'outside') gone = await outsidePress(f);
	else if (closeWay === 'pick') {
		await f.locator(`${LIST}:visible [role="option"]:not([aria-disabled="true"])`).first().click({ timeout: 4000 }).catch(() => {});
		gone = await waitGone(f);
	} else gone = await escape(f);
	const closed = await attrs(f, '[data-fo155]');
	await t.check(`list ${where} / ${label}: ${closeWay} closes it and says so`, gone && closed?.expanded === 'false', `gone ${gone}, aria-expanded ${closed?.expanded}`);
	await dismissDialog(f);
	return true;
}

/* one "More …" menu button: open, attributes open, close the given way, attributes closed */
async function menuCase(t, f, where, closeWay) {
	if (!(await triggerAt(f, '#pm-settings-root button[aria-label^="More"]', 0))) return false;
	const label = (await attrs(f, '[data-fo155]'))?.label || '';
	await f.locator('[data-fo155]').first().click({ timeout: 5000 });
	const opened = await waitPopup(f, MENU);
	const id = await popupId(f, MENU);
	const open = await attrs(f, '[data-fo155]');
	await t.check(`menu ${where} / ${label}: opening says expanded`, opened && open?.expanded === 'true' && open?.popup === 'menu', `opened ${opened}, aria-haspopup ${open?.popup}, aria-expanded ${open?.expanded}`);
	await t.check(`menu ${where} / ${label}: points at the menu it opened`, !!id && open?.controls === id, `aria-controls ${open?.controls}, menu ${id}`);
	let gone = false;
	if (closeWay === 'outside') gone = await outsidePress(f);
	else if (closeWay === 'pick') {
		await f.locator(`${MENU}:visible .pm51-menu-item:not([aria-disabled="true"])`).first().click({ timeout: 4000 }).catch(() => {});
		gone = await waitGone(f);
	} else gone = await escape(f);
	const closed = await attrs(f, '[data-fo155]');
	await t.check(`menu ${where} / ${label}: ${closeWay} closes it and says so`, gone && closed?.expanded === 'false', `gone ${gone}, aria-expanded ${closed?.expanded}`);
	await closeAny(f);
	return true;
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

async function expand(f, ws) {
	await f.evaluate((ws) => {
		const body = document.querySelector(`[data-continuous-workspace-body="${ws}"]`);
		if (!body) return;
		body.querySelectorAll('details:not([open]) > summary').forEach((s) => s.click());
		body.querySelectorAll('.pm51-acc-item:not(.is-open) .pm51-acc-toggle').forEach((b) => b.click());
	}, ws);
}

export default async function (t) {
	await t.viewport(1440, 900);
	const maxMenus = Number(t.args.maxMenus || 4);
	const maxLists = Number(t.args.maxLists || 4);
	const f = await t.app.open({ settleMs: 800 });
	await f.locator('#tab-settings').click();
	await f.locator('#pm-settings-root .domain-link').first().waitFor({ state: 'visible', timeout: 20000 });

	const bag = { menus: 0, lists: 0 };
	const domains = await f.locator('#pm-settings-root .domain-link').evaluateAll((els) => els.map((e) => e.getAttribute('data-domain')).filter(Boolean));
	let firstMenu = true, firstList = true, pickDone = false;
	for (const domain of domains) {
		if (!(await openChapter(f, domain))) {
			await t.check(`opened chapter ${domain}`, false, 'the chapter link did not stay open');
			continue;
		}
		const tabs = await f.locator('#pm-settings-root .workspace-tab').evaluateAll((els) => els.map((e) => e.getAttribute('data-workspace')).filter(Boolean));
		for (const ws of tabs) {
			await f.locator(`#pm-settings-root .workspace-tab[data-workspace="${ws}"]`).click({ timeout: 8000 }).catch(() => {});
			const mounted = await f.waitForFunction((id) => {
				const body = document.querySelector(`[data-continuous-workspace-body="${id}"]`);
				return !!(body && body.getAttribute('data-workspace-mounted') === 'true');
			}, ws, { timeout: 8000 }).then(() => true).catch(() => false);
			if (!mounted) continue;
			await expand(f, ws);
			const managerTabs = await f.evaluate((id) => {
				const body = document.querySelector(`[data-continuous-workspace-body="${id}"]`);
				if (!body) return [];
				return [...body.querySelectorAll('.manager-tab')].map((b) => b.getAttribute('data-tab')).filter(Boolean);
			}, ws);
			for (const tab of (managerTabs.length ? managerTabs : ['']).slice(0, 3)) {
				if (tab) {
					const tabBtn = f.locator(`[data-continuous-workspace-body="${ws}"] .manager-tab[data-tab="${tab}"]`);
					if (await tabBtn.count()) {
						await tabBtn.scrollIntoViewIfNeeded().catch(() => {});
						await tabBtn.click({ timeout: 5000 }).catch(() => {});
						await f.waitForTimeout(120);
					}
				}
				await expand(f, ws);
				const place = `${domain}/${ws}${tab ? '/' + tab : ''}`;
				for (let i = 0; i < maxMenus; i++) {
					const way = firstMenu ? 'escape' : 'outside';
					if (!(await menuCase(t, f, `${place} #${i + 1}`, way))) break;
					if (!pickDone) pickDone = await menuCase(t, f, `${place} pick`, 'pick');
					firstMenu = false;
					bag.menus += 1;
				}
				for (let i = 0; i < maxLists; i++) {
					const way = firstList ? 'escape' : 'outside';
					if (!(await listCase(t, f, `${place} #${i + 1}`, way))) break;
					firstList = false;
					bag.lists += 1;
				}
			}
		}
	}
	await t.check('opened a Settings menu', bag.menus > 0, `menus ${bag.menus}`);
	await t.check('opened a Settings list', bag.lists > 0, `lists ${bag.lists}`);
	/* a pick closes the menu it was in: the engine closes the popout before the item runs */
	await t.check('a Settings menu opens for the pick case', pickDone, 'no "More …" button was reachable for the pick case');

	/* the app's own menus: the title bar's Project box, the look menu, and the chat's More options */
	await dismissDialog(f);
	await f.locator('#tab-dashboard').click().catch(async () => { await f.locator('#tab-home').click().catch(() => {}); });
	await t.page.waitForTimeout(300);
	await f.locator('#projectMenuBtn').click({ timeout: 8000 });
	const projectOpen = await f.locator('#projectMenu.is-open').count().then((n) => n > 0);
	const projectAttr = await attrs(f, '#projectMenuBtn');
	await t.check('title-bar Project menu: opening says expanded', projectOpen && projectAttr?.expanded === 'true' && projectAttr?.popup === 'menu', `open ${projectOpen}, aria-haspopup ${projectAttr?.popup}, aria-expanded ${projectAttr?.expanded}`);
	await f.locator('#projectMenuBtn').press('Escape').catch(() => {});
	await t.page.waitForTimeout(250);
	const projectClosed = await attrs(f, '#projectMenuBtn');
	await t.check('title-bar Project menu: Escape says closed', projectClosed?.expanded === 'false', `aria-expanded ${projectClosed?.expanded}`);

	const look = f.locator('button.o55-lookbtn').first();
	if (await look.count()) {
		await look.click({ timeout: 5000 }).catch(() => {});
		const lookAttr = await attrs(f, 'button.o55-lookbtn');
		await t.check('look menu: opening says expanded', lookAttr?.expanded === 'true', `aria-expanded ${lookAttr?.expanded}`);
		await look.press('Escape').catch(() => {});
		await t.page.waitForTimeout(250);
		const lookClosed = await attrs(f, 'button.o55-lookbtn');
		await t.check('look menu: Escape says closed', lookClosed?.expanded === 'false', `aria-expanded ${lookClosed?.expanded}`);
	} else t.log('no look menu button on this page');

	const more = f.locator('.pm6-chat-more-btn:visible').first();
	if (await more.count()) {
		await more.click({ timeout: 5000 }).catch(() => {});
		const moreAttr = await attrs(f, '.pm6-chat-more-btn');
		const moreOpen = await f.locator('.pm6-chat-more-menu').first().isVisible().catch(() => false);
		await t.check('chat More options: opening says expanded', moreOpen && moreAttr?.expanded === 'true', `open ${moreOpen}, aria-expanded ${moreAttr?.expanded}`);
		await t.page.mouse.click(6, 6);
		await t.page.waitForTimeout(300);
		const moreClosed = await attrs(f, '.pm6-chat-more-btn');
		await t.check('chat More options: an outside press says closed', moreClosed?.expanded === 'false', `aria-expanded ${moreClosed?.expanded}`);
	} else t.log('no chat More options button visible');
}
