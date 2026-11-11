// FO-123 (Jared 2026-11-09 #5: "adding accounts has the drop down cut off"): the Add account dropdown in
// Settings › AI & Providers › Services › Claude lies fully on screen, no row cut off, and no ancestor or
// covering element takes its corners (elementFromPoint inside its rounded corners returns the dropdown),
// at 1920x1080, 1280x800, 1024x768 and 740x900 in all ten looks, and usable by keyboard. Each item's label is
// the full words (scrollWidth <= clientWidth, and the text's own ink inside the menu): on 11066741ab the third
// row ellipsizes "Use the sign-in already on the server". html[data-theme] is read at measurement time. NieR
// paints on Basic's slug with NieR on (data-theme stays basic-*, data-o55-nier / PM_NIER carries NieR), so a
// nier-dark cell is basic-dark with NieR on, and any other look must be that look's own slug. The bite is the
// state Jared was in: T3's short preview pane (screen 04: a 2000x546 device frame = 1000x273 CSS), where the
// trigger sits mid-viewport and neither side of it has room for the whole box — on 11066741ab the box is
// clamped to the space below the trigger and its last row is cut; both short sizes assert the whole box.
// FO-126 (Jared 2026-11-09 #10: "I added another account to settings for github. It went through the flow
// and shows 2 accounts signed in, but I cant see the second one."): after adding a second GitHub account
// under Settings › Source Control › GitHub through the real flow, the listed account rows equal the shown
// count (2), and still do after the panel is reopened. A saved state from before names were kept
// (accounts: 2, no accountNames) lists the legacy slot ("Account 2"); adding one more account keeps that
// slot and the count goes to 3, still after the panel is reopened. On 9e5656c024 the add replaces the
// legacy slot and the count stays 2. Both on the normal page and in T3's sandbox (--set sandbox=1).
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [1280, 800], [1024, 768], [740, 900]];
/* Jared's preview pane (screen 04, device 2000x546 at 2x) and one neighbour: both too short for the box
   beside the trigger once the trigger sits near the middle */
const SHORT_SIZES = [[1000, 273], [900, 280]];
const FAKE_TOKEN = 'TEST-NOT-A-REAL-TOKEN-0000';

const sleep = (f, ms) => f.waitForTimeout(ms);

/* Settings opens from the tab bar at a width where the tab bar exists; the probe itself may then run narrower */
async function openSettings(t, at = [1280, 800]) {
	await t.viewport(at[0], at[1]);
	const f = await t.app.open({ settleMs: 1500 });
	await f.locator('#tab-settings').click();
	await sleep(f, 1500);
	return f;
}

/* Opening a settings chapter races the page's own settling redraw (the fresh Settings can re-render its Home
   a moment after the chapter opens), so the open is confirmed and, if the Home took it back, made again */
async function enterManager(f, label) {
	for (let i = 0; i < 3; i++) {
		await f.getByText(label, { exact: true }).first().click();
		await f.waitForFunction(() => !!document.querySelector('[data-pm51-manager]'), null, { timeout: 6000 }).catch(() => {});
		await sleep(f, 900);
		if (await f.evaluate(() => !!document.querySelector('[data-pm51-manager]'))) return true;
	}
	return false;
}

/* Settings home › AI & Providers; Claude Code is the roster's first plan and the default detail (at widths
   where the roster pane collapses, the default detail is already Claude) */
async function toClaude(t, f) {
	await enterManager(f, 'AI & Providers');
	const row = f.locator('.resource-row[data-id="claude-code"]').first();
	if (await row.count()) await row.click({ timeout: 4000 }).catch(() => {});
	await sleep(f, 700);
	return f;
}

const addButton = (f) => f.locator('.pm51-section .pm51-section-head [data-action="pm51-providers-add-account"]').first();

/* a person reads the pane to the Accounts section: every scrollable ancestor to its bottom, the button
   fully in view; `where` picks where the button ends up ('center' reproduces the short-pane state) */
const SCROLL_BUTTON = (where) => {
	const btn = [...document.querySelectorAll('[data-action="pm51-providers-add-account"]')].find((b) => b.getBoundingClientRect().height > 0);
	if (!btn) return false;
	for (let e = btn.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) e.scrollTop = e.scrollHeight; }
	btn.scrollIntoView({ block: where === 'center' ? 'center' : 'end', behavior: 'instant' });
	if (where === 'center' && document.documentElement.scrollHeight > window.innerHeight) {
		const r = btn.getBoundingClientRect(), vh = window.innerHeight;
		window.scrollBy(0, r.top + r.height / 2 - vh / 2);
	}
	return true;
};

/* the open dropdown: whole (no clamped row), inside the viewport, and its rounded corners hit the dropdown */
const MENU_PROBE = () => {
	const pop = document.querySelector('.pm51-popout.pm51-menu');
	if (!pop) return { open: false };
	const r = pop.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
	const items = [...pop.querySelectorAll('.pm51-menu-item')];
	const rows = items.map((n) => n.getBoundingClientRect());
	const visible = (lr) => Math.min(1, Math.max(0, (Math.min(lr.bottom, r.bottom) - Math.max(lr.top, r.top)) / Math.max(1, lr.height)));
	const inset = (parseFloat(getComputedStyle(pop).borderRadius) || 0) + 3;
	const corners = [[inset, inset], [r.width - inset, inset], [inset, r.height - inset], [r.width - inset, r.height - inset]]
		.map(([x, y]) => { const el = document.elementFromPoint(r.left + x, r.top + y); return el ? (pop.contains(el) ? 'menu' : String(el.className).split(' ').slice(0, 2).join('.')) : 'off-page'; });
	const labels = [...pop.querySelectorAll('.pm51-menu-item .pm51-popout-label')].map((n) => {
		const range = document.createRange();
		range.selectNodeContents(n);
		const ink = [...range.getClientRects()];
		return {
			text: (n.textContent || '').trim(), sw: n.scrollWidth, cw: n.clientWidth,
			ink: ink.length > 0 && ink.every((b) => b.left >= r.left - 0.5 && b.right <= r.right + 0.5 && b.top >= r.top - 0.5 && b.bottom <= r.bottom + 0.5),
		};
	});
	const theme = document.documentElement.getAttribute('data-theme') || '';
	const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') || document.documentElement.getAttribute('data-o55-nier') === 'on';
	return { open: true, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], vw, vh,
		inside: r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh,
		cut: pop.scrollHeight - pop.clientHeight,
		items: items.length, whole: rows.every((lr) => visible(lr) === 1),
		corners, labels, theme, nier };
};

async function openAddAccount(t, f, where) {
	await f.evaluate(SCROLL_BUTTON, where);
	await addButton(f).click({ timeout: 8000 });
	await sleep(f, 650);   /* Glass's height spring (0.34s) settles before the box is measured */
	/* a look change that is still settling can scroll the pane under the just-opened menu, and a menu closes on
	   any scroll outside it (by design); one bounded re-open, the assertions still judge the open box */
	if (!(await f.locator('.pm51-popout.pm51-menu').count())) {
		await addButton(f).click({ timeout: 8000 });
		await sleep(f, 650);
	}
}

function lookHeld(look, theme, nier) {
	const [family, mode] = String(look || '').split('-');
	if (family === 'nier') return !!(nier && String(theme).endsWith('-' + mode));
	return !nier && theme === look;
}

async function assertMenu(t, f, name, look) {
	const r = await f.evaluate(MENU_PROBE);
	await t.check(`${name}: the Add account dropdown is open`, !!(r && r.open), JSON.stringify(r && r.rect));
	if (!r || !r.open) return;
	await t.check(`${name}: fully inside the viewport (${r.vw}x${r.vh})`, r.inside, JSON.stringify(r.rect));
	await t.check(`${name}: no row cut off (${r.items} items, clamp ${r.cut}px)`, r.cut === 0 && r.whole, JSON.stringify({ cut: r.cut, items: r.items, whole: r.whole }));
	await t.check(`${name}: every corner lands on the dropdown, nothing over it`, r.corners.every((c) => c === 'menu'), JSON.stringify(r.corners));
	const labels = r.labels || [];
	await t.check(`${name}: no label is clipped or ellipsised`, labels.length > 0 && labels.every((l) => l.sw <= l.cw), JSON.stringify(labels));
	await t.check(`${name}: every label's ink is inside the menu`, labels.length > 0 && labels.every((l) => l.ink), JSON.stringify(labels));
	if (look) await t.check(`${name}: measured under ${look} (painted ${r.theme}${r.nier ? ', NieR on' : ''})`, lookHeld(look, r.theme, r.nier), 'the menu opened on a different look than the cell names');
}

/* the real Add account wizard: a token, HTTPS for Git, then the connection check */
async function addGitHubAccount(f, name) {
	await f.locator('[data-action="pm51-source-connect"]').first().click();
	await sleep(f, 900);
	await f.locator('[data-action="pm51-source-cw-how"][data-how="token"]').first().click();
	await sleep(f, 400);
	await f.locator('.o55-cw-acct').fill(name);
	await f.locator('.o55-cw-token').fill(FAKE_TOKEN);
	await f.locator('.o55g-primary').click();
	await sleep(f, 900);
	await f.locator('[data-action="pm51-source-cw-via"][data-via="https"]').first().click();
	await sleep(f, 900);
	await f.locator('.o55g-primary').click();
	await sleep(f, 900);
	await f.locator('[data-action="pm51-servers-key-check"]').first().click();
	await sleep(f, 900);
	await f.locator('.o55g-primary').click();
	await sleep(f, 1400);
}

async function closeMenu(t, f, name) {
	const kb = await f.evaluate(() => {
		const pop = document.querySelector('.pm51-popout.pm51-menu');
		const first = pop && pop.querySelector('.pm51-menu-item');
		return { focused: !!(first && document.activeElement === first) };
	});
	await t.check(`${name}: the open dropdown holds the keyboard focus`, kb.focused, JSON.stringify(kb));
	await f.locator('.pm51-popout.pm51-menu .pm51-menu-item').first().press('ArrowDown');
	await sleep(f, 120);
	const moved = await f.evaluate(() => {
		const pop = document.querySelector('.pm51-popout.pm51-menu');
		return { stillFirst: !!(pop && document.activeElement === pop.querySelector('.pm51-menu-item')) };
	});
	await t.check(`${name}: ArrowDown moves inside it`, !moved.stillFirst, JSON.stringify(moved));
	await f.locator('.pm51-popout.pm51-menu .pm51-menu-item').first().press('Escape');
	await f.waitForFunction(() => !document.querySelector('.pm51-popout.pm51-menu'), null, { timeout: 4000 }).catch(() => {});
	await t.check(`${name}: Escape closes the dropdown`, !(await f.locator('.pm51-popout.pm51-menu').count()));
}

export const tests = {
	async 'FO-123: whole on screen at four sizes, all ten looks'(t) {
		for (const [w, h] of SIZES) {
			await t.step(`${w}x${h}`, async () => {
				const f = await openSettings(t);
				await toClaude(t, f);
				await t.viewport(w, h);
				await sleep(f, 400);
				for (const look of LOOKS) {
					await t.app.look(look);
					await sleep(f, 350);
					await openAddAccount(t, f, 'end');
					await assertMenu(t, f, `${look} @${w}x${h}`, look);
					await closeMenu(t, f, `${look} @${w}x${h}`);
				}
			});
		}
	},

	async 'FO-123: whole beside its trigger in a short viewport (the bite)'(t) {
		for (const [w, h] of SHORT_SIZES) {
			await t.step(`${w}x${h}`, async () => {
				const f = await openSettings(t);
				await toClaude(t, f);
				await t.viewport(w, h);
				await sleep(f, 400);
				/* the ten-look test runs first in this file and can leave NieR in storage; name the look here so the
				   bite is measured under Basic Dark, the look Jared's screen 04 is in */
				await t.app.look('basic-dark');
				await sleep(f, 350);
				await openAddAccount(t, f, 'center');
				await assertMenu(t, f, `short @${w}x${h}`, 'basic-dark');
				await closeMenu(t, f, `short @${w}x${h}`);
			});
		}
	},

	/* Batch 10 landing (2026-11-11): the Add account menu closed just after it opened whenever another scroller moved,
	   because a menu closed on any scroll outside it. The chat's transcript following its stream (FO-128's dock asks)
	   did that mid-step, so the ten-look test failed about 2 in 3 on the combined head in the sandbox. A scroll elsewhere
	   (the chat's transcript, a stand-in scroller outside Settings) must leave the open menu open and in place; a scroll
	   of the Settings page under it still closes it, as designed. Both surfaces. */
	async 'FO-123: a scroll elsewhere leaves the open menu open'(t) {
		for (const surface of t.app.surfaces()) {
			await t.step(surface, async () => {
				await t.viewport(1280, 800);
				const f = await t.app.open({ settleMs: 1500, sandbox: surface === 'sandbox' });
				await f.locator('#tab-settings').click();
				await sleep(f, 1500);
				await toClaude(t, f);
				await t.viewport(1920, 1080);
				await sleep(f, 400);
				await openAddAccount(t, f, 'end');
				const before = await f.evaluate(() => { const p = document.querySelector('.pm51-popout.pm51-menu.is-open'); return p ? p.getBoundingClientRect().top : null; });
				await t.check(`${surface}: the Add account menu is open`, before !== null);
				if (before === null) return;
				const moved = await f.evaluate(async () => {
					const out = [];
					const tr = [...document.querySelectorAll('#pmRoot .transcript, #chatPanel .transcript')].find((x) => x.scrollHeight > x.clientHeight + 4);
					if (tr) { tr.scrollTop = tr.scrollTop > 40 ? tr.scrollTop - 40 : tr.scrollTop + 40; out.push('chat transcript'); }
					const box = document.createElement('div'); box.id = 'fo123-elsewhere';
					box.style.cssText = 'position:fixed;left:0;bottom:0;width:120px;height:40px;overflow:auto;opacity:0;pointer-events:none';
					box.innerHTML = '<div style="height:400px"></div>'; document.body.appendChild(box); box.scrollTop = 120; out.push('stand-in scroller');
					await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
					await new Promise((r) => setTimeout(r, 300));
					box.remove();
					const p = document.querySelector('.pm51-popout.pm51-menu');
					return { scrolled: out, open: !!(p && p.classList.contains('is-open') && !p.classList.contains('is-closing')), top: p ? p.getBoundingClientRect().top : null };
				});
				await t.check(`${surface}: a scroll elsewhere (${moved.scrolled.join(', ')}) leaves the menu open, in place`, moved.open && Math.abs(moved.top - before) < 1, JSON.stringify({ before, ...moved }));
				const closed = await f.evaluate(async () => {
					// the scroller that holds the Add account button (the page under the menu), moved the way it has room
					const btn = [...document.querySelectorAll('[data-action="pm51-providers-add-account"]')].find((b) => b.getBoundingClientRect().height > 0);
					let sc = null; for (let e = btn && btn.parentElement; e; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) { sc = e; break; } }
					if (!sc) return { closed: null, why: 'no scroller holds the button' };
					const was = sc.scrollTop; sc.scrollTo({ top: was > 60 ? was - 60 : was + 60, behavior: 'instant' });
					await new Promise((r) => setTimeout(r, 400));
					const p = document.querySelector('.pm51-popout.pm51-menu');
					return { closed: !(p && p.classList.contains('is-open') && !p.classList.contains('is-closing')), scroller: (sc.id || sc.className).toString().slice(0, 40), from: Math.round(was), to: Math.round(sc.scrollTop) };
				});
				await t.check(`${surface}: a scroll of the Settings page under it still closes it`, !!closed && closed.closed === true, JSON.stringify(closed));
			});
		}
	},

	async 'FO-126: every signed-in GitHub account is listed, matching the count'(t) {
		const f = await openSettings(t);
		await t.check('Source Control opens', await enterManager(f, 'Source Control'));
		await sleep(f, 300);
		await f.locator('.resource-row[data-id="github"]').first().click();
		await sleep(f, 900);

		const read = async () => await f.evaluate(() => {
			const panel = document.querySelector('#panel-settings .resource-detail') || document.querySelector('#panel-settings');
			const accountsRow = [...(panel || document).querySelectorAll('.pm51-row')].find((n) => { const l = n.querySelector('.pm51-row-label'); return l && l.textContent.trim() === 'Accounts'; });
			return {
				count: accountsRow ? String((accountsRow.querySelector('.pm51-row-value') || {}).textContent || '').trim() : '',
				accounts: [...(panel || document).querySelectorAll('.pm51-source-accounts .pm51-item')].map((n) => ((n.querySelector('.pm51-item-title') || {}).textContent || '').trim()),
				text: (panel ? panel.innerText : '').slice(0, 400),
			};
		});

		const before = await read();
		await t.check('at first: one account, counted 1, its name shown', before.count === '1' && /sittingmongoose/.test(before.text), JSON.stringify(before));

		await addGitHubAccount(f, 'lab-mongoose');

		const after = await read();
		await t.check('after the add: the count says 2', after.count === '2', JSON.stringify(after));
		await t.check('after the add: two account rows are listed, both by name', after.accounts.length === 2 && after.accounts.includes('sittingmongoose') && after.accounts.includes('lab-mongoose'), JSON.stringify(after));
		await t.check('after the add: the listed rows equal the count', after.accounts.length === Number(after.count), JSON.stringify(after));

		/* reopening the panel reads the saved state again */
		await f.locator('.resource-row[data-id="gitlab"]').first().click();
		await sleep(f, 900);
		await f.locator('.resource-row[data-id="github"]').first().click();
		await sleep(f, 900);
		const reopened = await read();
		await t.check('reopened: the count still says 2', reopened.count === '2', JSON.stringify(reopened));
		await t.check('reopened: both accounts still listed, rows equal the count', reopened.accounts.length === 2 && reopened.accounts.includes('sittingmongoose') && reopened.accounts.includes('lab-mongoose') && reopened.accounts.length === Number(reopened.count), JSON.stringify(reopened));
	},

	async 'FO-126: a legacy count with no names is kept when another account is added'(t) {
		const f = await openSettings(t);
		const seeded = await f.evaluate(() => {
			const api = window.PM12_KIMI;
			if (!api || typeof api.getState !== 'function' || typeof api.setState !== 'function') return { ok: false, why: 'no PM12_KIMI' };
			const s = api.getState();
			const gh = ((s.sourceControl || {}).forges || []).find((x) => x.id === 'github');
			if (!gh) return { ok: false, why: 'no github' };
			gh.status = 'active';
			gh.accounts = 2;
			gh.defaultAccount = 'sittingmongoose';
			delete gh.accountNames;
			api.setState(s);
			const again = api.getState();
			const kept = ((again.sourceControl || {}).forges || []).find((x) => x.id === 'github') || {};
			return { ok: true, accounts: kept.accounts, names: kept.accountNames || null, def: kept.defaultAccount };
		});
		await t.check('seeded accounts=2 with no names', !!(seeded && seeded.ok && seeded.accounts === 2 && !seeded.names), JSON.stringify(seeded));
		await t.check('Source Control opens', await enterManager(f, 'Source Control'));
		await sleep(f, 300);
		await f.locator('.resource-row[data-id="github"]').first().click();
		await sleep(f, 900);

		const read = async () => await f.evaluate(() => {
			const panel = document.querySelector('#panel-settings .resource-detail') || document.querySelector('#panel-settings');
			const accountsRow = [...(panel || document).querySelectorAll('.pm51-row')].find((n) => { const l = n.querySelector('.pm51-row-label'); return l && l.textContent.trim() === 'Accounts'; });
			return {
				count: accountsRow ? String((accountsRow.querySelector('.pm51-row-value') || {}).textContent || '').trim() : '',
				accounts: [...(panel || document).querySelectorAll('.pm51-source-accounts .pm51-item')].map((n) => ((n.querySelector('.pm51-item-title') || {}).textContent || '').trim()),
			};
		});

		const before = await read();
		await t.check('before the add: count 2, sittingmongoose and the legacy slot', before.count === '2' && before.accounts.length === 2 && before.accounts[0] === 'sittingmongoose' && before.accounts[1] === 'Account 2', JSON.stringify(before));
		await addGitHubAccount(f, 'lab-third');
		const after = await read();
		await t.check('after the add: the count says 3', after.count === '3', JSON.stringify(after));
		await t.check('after the add: the legacy slot is kept and the new account is appended', JSON.stringify(after.accounts) === JSON.stringify(['sittingmongoose', 'Account 2', 'lab-third']) && after.accounts.length === Number(after.count), JSON.stringify(after));

		await f.locator('.resource-row[data-id="gitlab"]').first().click();
		await sleep(f, 900);
		await f.locator('.resource-row[data-id="github"]').first().click();
		await sleep(f, 900);
		const reopened = await read();
		await t.check('reopened: the count still says 3', reopened.count === '3', JSON.stringify(reopened));
		await t.check('reopened: three rows, the legacy slot still there, rows equal the count', JSON.stringify(reopened.accounts) === JSON.stringify(['sittingmongoose', 'Account 2', 'lab-third']) && reopened.accounts.length === Number(reopened.count), JSON.stringify(reopened));
	},
};
