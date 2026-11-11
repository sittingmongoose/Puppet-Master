// Stream F batch 11, lane C: Settings menus and the look Customize screens (review/OPEN-AND-FOUND.md section C).
// FO-147: an open Settings menu is closed only by a scroll that moves its button. Any scroll used to close it: a list
//   scrolling in a box the button is not in, or on a page that is not showing (the Home editor lays itself out again
//   about 1.5 s after load). A scroll of the box that holds the button still closes it (guard).
// N-4: a detail head's "More actions" says it opens a menu and whether it is open, the same before and after a use
//   (popoutClose wrote aria-expanded="false" on a button that had never said it was expanded).
// FO-144: in Glass Dark and Light every Settings popout (a dropdown list, a menu) is mounted as a Liquid Glass menu: it
//   carries data-lg-kind="menu" and blurs what is behind it (on the CPU tier its tint is near opaque), instead of the
//   page showing through its thin plate.
// FO-145 / FO-149: a parked or prepared Customize screen (the terminal's .pmt-cz, the editor's .pmed-cz) is no open
//   modal: its dialog has no aria-modal, and the screen is inert and aria-hidden; nothing claims an open modal at rest
//   by the audit's own rule (aria-modal and checkVisibility with opacity and visibility). A shown screen claims it.
// FO-148 (and N-3): Editor & Terminal › Terminal look › Open Customize opens the terminal's Customize over Settings,
//   and Done (or Escape) gives the focus back to the button, still in Settings, not on Home.
// B-10: each Customize screen's scheme search count is a polite status, so a screen reader hears it.
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

async function settings(t, surface, [w, h] = [1600, 1000]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function go(t, f, domain, ws) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws]);
	await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}
/* Servers › the Servers tab: the detail head's More actions */
async function serversMenuButton(t, f) {
	await go(t, f, 'system', 'servers');
	await f.locator('[data-continuous-workspace-body="servers"] .manager-tab', { hasText: /^\s*Servers\s*$/ }).first().click();
	await t.settle();
	const b = f.locator('[data-continuous-workspace-body="servers"] .pm51-detail-actions button[aria-label="More actions"]').first();
	await b.waitFor({ state: 'visible', timeout: 8000 });
	await b.scrollIntoViewIfNeeded();
	await t.page.waitForTimeout(300);
	return b;
}
/* a look set through Settings' own Theme and Light or dark rows (a look set from outside is put back by Settings when
   App & Input draws) */
async function settingsLook(t, f, look) {
	const [family, mode] = look.split('-');
	await f.evaluate(([fam, m]) => { PM12_KIMI.setSettingFromHost('general.visual.theme', fam[0].toUpperCase() + fam.slice(1)); PM12_KIMI.setSettingFromHost('general.visual.theme-mode', m === 'light' ? 'Light' : 'Dark'); }, [family, mode]);
	const ok = await f.waitForFunction((want) => document.documentElement.getAttribute('data-theme') === want && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), look, { timeout: 15000 }).then(() => true).catch(() => false);
	await t.page.waitForTimeout(600);
	return t.check(`look ${look} set through Settings`, ok, await f.evaluate(() => document.documentElement.getAttribute('data-theme')));
}
const menuOpen = (f) => f.evaluate(() => { const m = document.querySelector('.pm51-popout.pm51-menu'); return !!m && m.isConnected && !m.classList.contains('is-closing'); });
const pageNow = (f) => f.evaluate(() => (document.querySelector('.page-tabs .page-tab.active') || {}).id || '');
/* the shown (not parked, not prepared) Customize screen of a kind: 'terminal' or 'editor' */
const SHOWN = { terminal: '.pmt-cz:not(.pmed-cz):not(.pmt-cz-parked):not([aria-hidden="true"])', editor: '.pmt-cz.pmed-cz:not(.pmed-prepared):not([aria-hidden="true"])' };
/* every Customize screen that is not showing: what it claims */
const parkedClaims = (f) => f.evaluate(() => [...document.querySelectorAll('.pmt-cz')].filter((r) => r.classList.contains('pmt-cz-parked') || r.classList.contains('pmed-prepared')).map((r) => {
	const d = r.querySelector('.pmt-cz-dialog');
	return { kind: r.classList.contains('pmed-cz') ? 'editor' : 'terminal', modal: d ? d.getAttribute('aria-modal') : null, inert: r.inert, hidden: r.getAttribute('aria-hidden') === 'true' };
}));
/* the audit's own rule (browser-check lib/checks.mjs): an open modal is dialog:modal or aria-modal=true that passes
   checkVisibility with opacity and visibility */
const openModals = (f) => f.evaluate(() => [...document.querySelectorAll('[aria-modal="true"], dialog')].filter((n) => {
	try { return (n.matches('dialog:modal') || n.getAttribute('aria-modal') === 'true') && n.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }); } catch (e) { return false; }
}).map((n) => `${n.tagName.toLowerCase()}.${String(n.className).split(' ').slice(0, 2).join('.')}`));

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const skip = async (t) => { if (t.app.surfaces().includes(surface)) return false; await t.check(`${surface} surface not asked for`, true); return true; };

	tests[`FO-147 an open menu outlives scrolls that do not move its button (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		const b = await serversMenuButton(t, f);
		await b.click();
		await t.until('More actions menu open', () => !!document.querySelector('.pm51-popout.pm51-menu.is-open'), null, { timeout: 4000 });
		// boxes that scroll and do not hold the button: on a page that is not showing (where one can scroll), and in
		// Settings itself (its chapter rail and section index)
		const boxes = await f.evaluate(() => {
			const anchor = document.querySelector('[data-continuous-workspace-body="servers"] .pm51-detail-actions button[aria-label="More actions"]');
			const pop = document.querySelector('.pm51-popout');
			const out = [];
			for (const n of document.querySelectorAll('body *')) {
				if (out.length >= 6) break;
				if (n.contains(anchor) || (pop && pop.contains(n)) || n.scrollHeight <= n.clientHeight + 30) continue;
				const oy = getComputedStyle(n).overflowY; if (!/(auto|scroll)/.test(oy)) continue;
				const id = 'fo147-' + out.length; n.setAttribute('data-fo147', id);
				out.push({ id, where: n.closest('#pm-settings-root') ? 'settings' : (n.closest('.page.active') ? 'page' : 'hidden page'), name: `${n.tagName.toLowerCase()}.${String(n.className).split(' ')[0]}` });
			}
			return out;
		});
		await t.check('found boxes that scroll without holding the button', boxes.length >= 2, boxes.map((x) => `${x.name} (${x.where})`).join(', '));
		for (const box of boxes) {
			await f.evaluate((id) => { const n = document.querySelector(`[data-fo147="${id}"]`); n.scrollTop = n.scrollTop > 40 ? n.scrollTop - 40 : n.scrollTop + 40; }, box.id);
			await t.page.waitForTimeout(250);
			await t.check(`a scroll of ${box.name} (${box.where}) leaves the menu open`, await menuOpen(f));
		}
		// guard: the box that holds the button scrolls, so the button moves: the menu closes, as it should
		const moved = await f.evaluate(() => {
			const anchor = document.querySelector('[data-continuous-workspace-body="servers"] .pm51-detail-actions button[aria-label="More actions"]');
			let s = anchor.parentElement; while (s && !(s.scrollHeight > s.clientHeight + 30 && /(auto|scroll)/.test(getComputedStyle(s).overflowY))) s = s.parentElement;
			if (!s) return false;
			s.scrollTop = s.scrollTop > 80 ? s.scrollTop - 80 : s.scrollTop + 80; return true;
		});
		await t.page.waitForTimeout(400);
		if (moved) await t.check('a scroll that moves the button closes the menu (guard)', !(await menuOpen(f)));
		await f.evaluate(() => document.querySelectorAll('[data-fo147]').forEach((n) => n.removeAttribute('data-fo147')));
	};

	tests[`FO-147 a dropdown opened right after load stays open through the page settling (${surface})`] = async (t) => {
		if (await skip(t)) return;
		await t.viewport(1600, 1000);
		const f = await t.app.open({ sandbox: surface === 'sandbox', settleMs: 0 });
		// count the scrolls, outside Settings, that reach the document while the list is open
		await f.evaluate(() => { window.__fo147 = []; document.addEventListener('scroll', (e) => { if (document.querySelector('.pm51-popout') && e.target && e.target.nodeType === 1 && !e.target.closest('#pm-settings-root')) window.__fo147.push(String(e.target.className || e.target.tagName).slice(0, 40)); }, true); });
		await f.locator('#tab-settings').click();
		await go(t, f, 'general', 'app-input');
		const dd = f.locator('[data-continuous-workspace-body="app-input"] .pm51-dd button[data-action="pm51-dd-open"]').first();
		await dd.scrollIntoViewIfNeeded();
		await dd.click();
		await t.until('dropdown list open', () => !!document.querySelector('.pm51-popout.pm51-dd-list.is-open'), null, { timeout: 4000 });
		await t.page.waitForTimeout(3000);
		const r = await f.evaluate(() => ({ open: !!document.querySelector('.pm51-popout.pm51-dd-list:not(.is-closing)'), foreign: window.__fo147.length, names: [...new Set(window.__fo147)].slice(0, 4) }));
		await t.check('the dropdown list is still open 3 s later', r.open, `scrolls elsewhere while it was open: ${r.foreign} (${r.names.join(', ')})`);
		await t.page.keyboard.press('Escape');
	};

	tests[`N-4 More actions says it opens a menu, the same before and after a use (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		const b = await serversMenuButton(t, f);
		const attrs = () => b.evaluate((el) => ({ popup: el.getAttribute('aria-haspopup'), expanded: el.getAttribute('aria-expanded') }));
		const before = await attrs();
		await t.check('before its first use: a menu button, collapsed', before.popup === 'menu' && before.expanded === 'false', JSON.stringify(before));
		await b.click();
		await t.until('menu open', () => !!document.querySelector('.pm51-popout.pm51-menu.is-open'), null, { timeout: 4000 });
		const during = await attrs();
		await t.check('while its menu is open: expanded', during.expanded === 'true', JSON.stringify(during));
		// choose Update… where it can be chosen (it goes to App Updates), else close with Escape
		const upd = f.locator('.pm51-popout.pm51-menu .pm51-menu-item', { hasText: 'Update' }).first();
		const can = (await upd.count()) && (await upd.getAttribute('aria-disabled')) !== 'true';
		if (can) await upd.click(); else await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(700);
		const after = await f.evaluate(() => { const el = document.querySelector('[data-continuous-workspace-body="servers"] .pm51-detail-actions button[aria-label="More actions"]'); return el ? { popup: el.getAttribute('aria-haspopup'), expanded: el.getAttribute('aria-expanded') } : null; });
		await t.check(`after ${can ? 'Update…' : 'Escape'}: the same as before its first use`, !!after && after.popup === before.popup && after.expanded === before.expanded, `before ${JSON.stringify(before)} after ${JSON.stringify(after)}`);
	};

	tests[`FO-144 Settings popouts are Glass menus (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		for (const look of ['glass-dark', 'glass-light']) {
			if (!(await settingsLook(t, f, look))) continue;
			const read = () => f.evaluate(() => {
				const p = document.querySelector('.pm51-popout:not(.is-closing)'); if (!p) return null;
				const cs = getComputedStyle(p), html = document.documentElement;
				const tint = cs.getPropertyValue('--lg-tint-menu').trim(), a = /rgba?\(([^)]+)\)/.exec(tint), alpha = a ? Number((a[1].split(/[ ,/]+/).filter(Boolean)[3]) ?? 1) : NaN;
				return { theme: html.getAttribute('data-theme'), kind: p.getAttribute('data-lg-kind'), blur: /blur\(/.test(cs.backdropFilter || cs.webkitBackdropFilter || ''), tier: html.getAttribute('data-lg-tier'), lg: html.getAttribute('data-lg'), alpha, bf: cs.backdropFilter };
			});
			const judge = async (what) => {
				const g = await read();
				const ok = !!g && g.kind === 'menu' && (g.blur || (g.tier === 'cpu' && g.alpha >= 0.95));
				await t.check(`${look}: ${what} is a Glass menu (blurs what is behind it)`, ok, JSON.stringify(g));
			};
			await go(t, f, 'general', 'app-input');
			const dd = f.locator('[data-continuous-workspace-body="app-input"] .pm51-dd button[data-action="pm51-dd-open"]').first();
			await dd.scrollIntoViewIfNeeded();
			await dd.click();
			await t.until('dropdown list open', () => !!document.querySelector('.pm51-popout.pm51-dd-list.is-open'), null, { timeout: 4000 });
			await t.page.waitForTimeout(400);
			await judge('a dropdown list');
			await t.crop(`fo144-${look}-dropdown-${surface}`, f.locator('.pm51-popout').first(), `${look}: a Settings dropdown over the page, frosted like the app's other Glass menus`);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(300);
			const b = await serversMenuButton(t, f);
			await b.click();
			await t.until('menu open', () => !!document.querySelector('.pm51-popout.pm51-menu.is-open'), null, { timeout: 4000 });
			await t.page.waitForTimeout(400);
			await judge('a menu');
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(300);
		}
	};

	tests[`FO-145 FO-149 a parked Customize screen is no open modal (${surface})`] = async (t) => {
		if (await skip(t)) return;
		await t.viewport(1600, 1000);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		// both screens are built while the app is idle; the editor's is prepared after load
		// FO-145's case: on the bare page the terminal's screen is built and parked at idle (about 8 s after load), and
		// the editor's is prepared; wait for both
		await f.waitForFunction(() => document.querySelector('.pmt-cz.pmed-cz.pmed-prepared') && document.querySelector('.pmt-cz.pmt-cz-parked:not(.pmed-cz)'), null, { timeout: 40000 }).catch(() => null);
		const atRest = await parkedClaims(f);
		await t.check('at rest: the terminal\'s parked and the editor\'s prepared Customize screens are in the page', atRest.some((c) => c.kind === 'terminal') && atRest.some((c) => c.kind === 'editor'), JSON.stringify(atRest));
		for (const c of atRest) await t.check(`at rest: the ${c.kind}'s parked screen has no aria-modal, is inert and aria-hidden`, c.modal === null && c.inert && c.hidden, JSON.stringify(c));
		const m0 = await openModals(f);
		await t.check('at rest: nothing claims an open modal (the audit\'s rule)', m0.length === 0, m0.join(', '));
		// a visit to each screen from Settings, and back
		await f.locator('#tab-settings').click();
		await go(t, f, 'code', 'editor-runtime');
		for (const kind of ['editor', 'terminal']) {
			const b = f.locator(`[data-action="pm51-o55-${kind}-customize"]`).first();
			await b.scrollIntoViewIfNeeded();
			await b.click();
			const shown = await f.waitForFunction((sel) => document.querySelector(sel), SHOWN[kind], { timeout: 8000 }).then(() => true).catch(() => false);
			if (!(await t.check(`${kind} Customize shows`, shown))) continue;
			await t.page.waitForTimeout(500);
			const live = await f.evaluate((sel) => { const r = document.querySelector(sel), d = r.querySelector('.pmt-cz-dialog'); return { modal: d.getAttribute('aria-modal'), inert: r.inert }; }, SHOWN[kind]);
			await t.check(`${kind} Customize shown: its dialog is modal and not inert`, live.modal === 'true' && !live.inert, JSON.stringify(live));
			await t.page.keyboard.press('Escape');
			await f.waitForFunction((k) => [...document.querySelectorAll('.pmt-cz')].some((r) => (k === 'editor') === r.classList.contains('pmed-cz') && (r.classList.contains('pmt-cz-parked') || r.classList.contains('pmed-prepared'))), kind, { timeout: 6000 }).catch(() => null);
			await t.page.waitForTimeout(300);
			const after = (await parkedClaims(f)).filter((c) => c.kind === kind);
			await t.check(`after closing: the ${kind}'s parked screen has no aria-modal, is inert and aria-hidden`, after.length === 1 && after.every((c) => c.modal === null && c.inert && c.hidden), JSON.stringify(after));
			const m = await openModals(f);
			await t.check(`after closing the ${kind}'s screen: nothing claims an open modal`, m.length === 0, m.join(', '));
			// back to Settings for the next visit (the unchanged page went Home for the terminal's)
			if ((await pageNow(f)) !== 'tab-settings') { await f.locator('#tab-settings').click(); await go(t, f, 'code', 'editor-runtime'); }
		}
	};

	tests[`FO-148 Terminal look › Open Customize stays in Settings and comes back to the button (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'editor-runtime');
		for (const how of ['Done', 'Escape']) {
			if ((await pageNow(f)) !== 'tab-settings') { await f.locator('#tab-settings').click(); await go(t, f, 'code', 'editor-runtime'); }
			const b = f.locator('[data-action="pm51-o55-terminal-customize"]').first();
			await b.scrollIntoViewIfNeeded();
			await t.page.waitForTimeout(300);
			const top0 = await b.evaluate((el) => Math.round(el.getBoundingClientRect().top));
			await b.click();
			const shown = await f.waitForFunction((sel) => document.querySelector(sel), SHOWN.terminal, { timeout: 8000 }).then(() => true).catch(() => false);
			await t.check(`${how}: the terminal's Customize shows`, shown);
			await t.check(`${how}: Settings is still the page underneath`, (await pageNow(f)) === 'tab-settings', await pageNow(f));
			await t.page.waitForTimeout(600);
			if (how === 'Done') await f.locator(`${SHOWN.terminal} .pmt-cz-done`).first().click();
			else await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(900);
			const r = await f.evaluate(() => {
				const a = document.activeElement, btn = document.querySelector('#pm-settings-root [data-action="pm51-o55-terminal-customize"]');
				return { page: (document.querySelector('.page-tabs .page-tab.active') || {}).id || '', onButton: !!btn && a === btn, focus: a ? `${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]}` : '', top: btn ? Math.round(btn.getBoundingClientRect().top) : null };
			});
			await t.check(`${how}: after it closes, Settings is showing`, r.page === 'tab-settings', r.page);
			await t.check(`${how}: the focus is back on Open Customize, where it was`, r.onButton && Math.abs(r.top - top0) <= 2, `focus ${r.focus}, button top ${top0} -> ${r.top}`);
		}
	};

	tests[`B-10 the scheme search count is a polite status (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'editor-runtime');
		for (const kind of ['editor', 'terminal']) {
			if ((await pageNow(f)) !== 'tab-settings') { await f.locator('#tab-settings').click(); await go(t, f, 'code', 'editor-runtime'); }
			const b = f.locator(`[data-action="pm51-o55-${kind}-customize"]`).first();
			await b.scrollIntoViewIfNeeded();
			await b.click();
			const shown = await f.waitForFunction((sel) => document.querySelector(sel), SHOWN[kind], { timeout: 8000 }).then(() => true).catch(() => false);
			if (!(await t.check(`${kind} Customize shows`, shown))) continue;
			await t.page.waitForTimeout(500);
			await f.locator(`${SHOWN[kind]} .pmt-cz-search`).first().fill('mocha');
			await t.page.waitForTimeout(400);
			const n = await f.evaluate((sel) => { const e = document.querySelector(`${sel} [data-find-n]`); return e ? { text: e.textContent.trim(), role: e.getAttribute('role'), live: e.getAttribute('aria-live') } : null; }, SHOWN[kind]);
			await t.check(`${kind}: the count reads and is announced (role status, polite)`, !!n && /scheme/.test(n.text) && (n.role === 'status' || n.live === 'polite') && n.live !== 'off', JSON.stringify(n));
			await f.locator(`${SHOWN[kind]} .pmt-cz-done`).first().click();
			await t.page.waitForTimeout(800);
		}
	};
}
