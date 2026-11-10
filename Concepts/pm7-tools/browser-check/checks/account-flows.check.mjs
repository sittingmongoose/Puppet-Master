// FO-123 (Jared 2026-11-09 #5: "adding accounts has the drop down cut off"): the Add account dropdown in
// Settings › AI & Providers › Services › Claude lies fully on screen, no row cut off, and no ancestor or
// covering element takes its corners (elementFromPoint inside its rounded corners returns the dropdown),
// at 1920x1080, 1280x800, 1024x768 and 740x900 in all ten looks, and usable by keyboard. The bite is the
// state Jared was in: T3's short preview pane (screen 04: a 2000x546 device frame = 1000x273 CSS), where the
// trigger sits mid-viewport and neither side of it has room for the whole box — on 11066741ab the box is
// clamped to the space below the trigger and its last row is cut; both short sizes assert the whole box.
// FO-126 (Jared 2026-11-09 #10: "I added another account to settings for github. It went through the flow
// and shows 2 accounts signed in, but I cant see the second one."): after adding a second GitHub account
// under Settings › Source Control › GitHub through the real flow, the listed account rows equal the shown
// count (2), and still do after the panel is reopened. Both on the normal page and in T3's sandbox
// (--set sandbox=1).
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
	return { open: true, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], vw, vh,
		inside: r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh,
		cut: pop.scrollHeight - pop.clientHeight,
		items: items.length, whole: rows.every((lr) => visible(lr) === 1),
		corners };
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

async function assertMenu(t, f, name) {
	const r = await f.evaluate(MENU_PROBE);
	await t.check(`${name}: the Add account dropdown is open`, !!(r && r.open), JSON.stringify(r && r.rect));
	if (!r || !r.open) return;
	await t.check(`${name}: fully inside the viewport (${r.vw}x${r.vh})`, r.inside, JSON.stringify(r.rect));
	await t.check(`${name}: no row cut off (${r.items} items, clamp ${r.cut}px)`, r.cut === 0 && r.whole, JSON.stringify({ cut: r.cut, items: r.items, whole: r.whole }));
	await t.check(`${name}: every corner lands on the dropdown, nothing over it`, r.corners.every((c) => c === 'menu'), JSON.stringify(r.corners));
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
					await assertMenu(t, f, `${look} @${w}x${h}`);
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
				await openAddAccount(t, f, 'center');
				await assertMenu(t, f, `short @${w}x${h}`);
				await closeMenu(t, f, `short @${w}x${h}`);
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

		/* Add account through the real flow: a token for a second account, HTTPS for Git */
		await f.locator('[data-action="pm51-source-connect"]').first().click();
		await sleep(f, 900);
		await f.locator('[data-action="pm51-source-cw-how"][data-how="token"]').first().click();
		await sleep(f, 400);
		await f.locator('.o55-cw-acct').fill('lab-mongoose');
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
};
