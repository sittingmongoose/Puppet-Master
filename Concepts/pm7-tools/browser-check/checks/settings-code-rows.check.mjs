// Stream F batch 11, lane C: PMConcept7 defects that lane-code confirmed (review/OPEN-AND-FOUND.md section F, "From the
// report of lane-code", Confirmed). Each is read on the page itself:
// - Editor & Terminal › "Keep terminal output for" shows one of its own choices, the canon ones (Plans/settings_inventory:
//   Keep Saved Scrollback | Session Only); it showed "Keep Saved Scrollback" over five other choices.
// - The label "Dim terminals I'm not in" keeps the pronoun's capital (it read "i'm").
// - A "Choose" folder dialog speaks to the person, not "The native Slint picker binds this field to the selected
//   project-scoped path."
// - Toolchain: Pyright says one word for one state in its list entry and its details ("Needs a restart"); Restart in its
//   menu restarts it ("Restarting…", then Ready / Running), and so does the "Restart language servers" steps' end.
// - Skills: a ready skill switched off reads "Off" in the list, not "Ready" beside an off switch.
// - Plugins: a plugin on the list but switched off is not a dead "Already on your list" card in the catalog: its card says
//   so and switches it on, and the list then shows it.
// - Commands: /x-quick-audit asks for a persona that does not exist: its row and its page say so, and "Use the chat's
//   persona" puts it right.
// - Guard (lane-code's "Import a color scheme does nothing" does not reproduce): Import… opens the system file chooser.
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
const text = (s) => String(s || '').replace(/\s+/g, ' ').trim();
async function tab(t, f, ws, name) {
	const b = f.locator(`[data-continuous-workspace-body="${ws}"] .manager-tab`, { hasText: new RegExp(`^\\s*${name}\\s*$`) }).first();
	if (await b.count()) { await b.click(); await t.settle(); await t.page.waitForTimeout(300); }
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const skip = async (t) => { if (t.app.surfaces().includes(surface)) return false; await t.check(`${surface} surface not asked for`, true); return true; };

	tests[`lane-code Editor & Terminal rows: its own choices, I'm, the Choose dialog, Import (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'editor-runtime');
		const keep = await f.evaluate(() => {
			const row = document.getElementById('setting-code.terminal.transcript-retention'); if (!row) return null;
			const sel = row.querySelector('select');
			return { value: sel ? sel.value : null, options: sel ? [...sel.options].map((o) => o.value) : [], shown: (row.querySelector('.pm51-dd-value') || {}).textContent || '' };
		});
		await t.check('"Keep terminal output for" offers the canon choices only', !!keep && keep.options.join(' | ') === 'Keep Saved Scrollback | Session Only', JSON.stringify(keep));
		await t.check('"Keep terminal output for" shows one of its own choices', !!keep && keep.options.includes(keep.value) && keep.options.includes(keep.shown.trim()), JSON.stringify(keep));
		const dim = await f.evaluate(() => { const l = document.querySelector('#setting-code\\.terminal\\.inactive-dim .setting-label'); return l ? [...l.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim() : null; });
		await t.check('"Dim terminals I\'m not in" keeps the capital I', /^Dim terminals I['’]m not in$/.test(dim || ''), String(dim));
		// a Choose dialog
		const ch = f.locator('#setting-code\\.terminal\\.cwd [data-action="browse-setting-path"]').first();
		if (await t.check('Start new terminals in has Choose', (await ch.count()) > 0)) {
			await ch.scrollIntoViewIfNeeded();
			await ch.click();
			const words = await f.waitForFunction(() => { const d = [...document.querySelectorAll('.modal-wrap, [role="dialog"]')].filter((n) => n.getClientRects().length && !n.closest('[aria-hidden="true"], [inert]') && /Browse ·/.test(n.textContent)); return d.length ? d[d.length - 1].textContent.replace(/\s+/g, ' ').trim() : false; }, null, { timeout: 6000 }).then((h) => h.jsonValue()).catch(() => '');
			await t.check('the Choose dialog has no developer words', !!words && !/Slint|binds this field|project-scoped/i.test(words), words.slice(0, 160));
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(400);
		}
		// guard: Import… opens the system file chooser
		const imp = f.locator('#setting-code\\.terminal\\.import-scheme button').first();
		if (await t.check('Import a color scheme has its button', (await imp.count()) > 0)) {
			await imp.scrollIntoViewIfNeeded();
			const fc = t.page.waitForEvent('filechooser', { timeout: 5000 }).then(() => true).catch(() => false);
			await imp.click();
			await t.check('Import… opens the file chooser (guard)', await fc);
		}
	};

	tests[`lane-code Toolchain: Pyright's one word, and Restart restarts it (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'toolchain');
		const pick = async () => { const r = f.locator('[data-continuous-workspace-body="toolchain"] .resource-row', { hasText: 'Pyright' }).first(); if (await r.count()) { await r.click(); await t.page.waitForTimeout(500); } return r; };
		await pick();
		const words = () => f.evaluate(() => {
			const blk = document.querySelector('[data-continuous-workspace-body="toolchain"]');
			const head = blk.querySelector('.pm51-detail .pm51-detail-title'), detail = blk.querySelector('.pm51-detail-content');
			const kvStatus = [...(detail ? detail.querySelectorAll('.pm51-row, .setting-row, .pm51-rows > *') : [])].map((r) => r.textContent.replace(/\s+/g, ' ').trim()).find((x) => /^Status/.test(x)) || '';
			return { title: head ? head.textContent.replace(/\s+/g, ' ').trim() : '', status: kvStatus };
		});
		const w0 = await words();
		await t.check('Pyright\'s details head and its Status row say the same: "Needs a restart"', /Pyright\s*Needs a restart/.test(w0.title) && /Needs a restart/.test(w0.status) && !/Needs attention/.test(w0.title), JSON.stringify(w0));
		// Restart in its menu
		const more = f.locator('[data-continuous-workspace-body="toolchain"] .pm51-detail-actions button[aria-label="More actions"]').first();
		await more.click();
		await f.locator('.pm51-popout.pm51-menu .pm51-menu-item', { hasText: /^\s*Restart\s*$/ }).first().click();
		const during = await f.waitForFunction(() => /Restarting/.test((document.querySelector('[data-continuous-workspace-body="toolchain"] .pm51-detail-title') || {}).textContent || ''), null, { timeout: 3000 }).then(() => true).catch(() => false);
		await t.check('Restart: Pyright says "Restarting…" while it restarts', during);
		await t.page.waitForTimeout(1600);
		const w1 = await words();
		await t.check('Restart: Pyright is Ready and Running afterwards', /Pyright\s*Ready/.test(w1.title) && /Running/.test(w1.status), JSON.stringify(w1));
		// a fresh page: the "Restart language servers" steps clear it too
		const g = await settings(t, surface);
		await go(t, g, 'code', 'toolchain');
		// the row's own button (run-setting-action on code.editing.lsp-restart): Toolchain carries the row in its server
		// menus, so the row itself is drawn in Projects & Sync › All project settings, found there by its words
		await go(t, g, 'projects', 'project-settings');
		const filter = g.locator('[data-continuous-workspace-body="project-settings"] input').first();
		if (await filter.count()) { await filter.fill('Restart language servers'); await t.page.waitForTimeout(1200); }
		const btn = g.locator('[data-action="run-setting-action"][data-setting="code.editing.lsp-restart"]').first();
		const opened = await btn.waitFor({ state: 'visible', timeout: 8000 }).then(async () => { await btn.scrollIntoViewIfNeeded(); await btn.click(); return true; }).catch(() => false);
		if (await t.check('"Restart language servers" opens its steps', opened)) {
			const go2 = g.locator('.pm51-panel button, aside button', { hasText: /^\s*Restart them\s*$/ }).first();
			await go2.click({ timeout: 6000 });
			await t.page.waitForTimeout(4200);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(500);
			await go(t, g, 'code', 'toolchain');
			const r = g.locator('[data-continuous-workspace-body="toolchain"] .resource-row', { hasText: 'Pyright' }).first();
			if (await r.count()) { await r.click(); await t.page.waitForTimeout(500); }
			const w2 = await g.evaluate(() => (document.querySelector('[data-continuous-workspace-body="toolchain"] .pm51-detail-title') || {}).textContent.replace(/\s+/g, ' ').trim());
			await t.check('after the steps run to their end, Pyright is Ready', /Pyright\s*Ready/.test(w2), w2);
		}
	};

	tests[`lane-code Skills: a ready skill switched off reads Off (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'skills');
		// the list shows every skill (Show: All), as it does a skill just added switched off
		await f.evaluate(() => PM12_KIMI.setSettingFromHost('extensions.skills.registry-view', 'All'));
		await t.page.waitForTimeout(500);
		const read = () => f.evaluate(() => { const n = [...document.querySelectorAll('[data-continuous-workspace-body="skills"] .pm51-item')].find((x) => /Frontend Polish/.test(x.textContent)); return n ? { status: ((n.querySelector('.pm51-status') || {}).textContent || '').trim(), on: (n.querySelector('[role="switch"]') || {}).getAttribute('aria-checked') } : null; });
		const before = await read();
		if (!(await t.check('Frontend Polish is on the list, on and Ready', !!before && /Ready/.test(before.status) && before.on === 'true', JSON.stringify(before)))) return;
		await f.locator('[data-continuous-workspace-body="skills"] .pm51-item', { hasText: 'Frontend Polish' }).first().locator('[role="switch"]').first().click();
		await t.page.waitForTimeout(700);
		const after = await read();
		await t.check('switched off in the list, its row reads Off, not Ready', !!after && after.on === 'false' && /Off/.test(after.status) && !/Ready/.test(after.status), JSON.stringify(after));
		// its page says the same, and follows its own switch
		await f.locator('[data-continuous-workspace-body="skills"] .pm51-item', { hasText: 'Frontend Polish' }).first().click();
		const hero = () => f.evaluate(() => { const p = [...document.querySelectorAll('.pm51-panel')].find((x) => /Frontend Polish/.test(x.textContent)); return p ? ((p.querySelector('.pm51-hero-status') || {}).textContent || '').trim() : null; });
		await f.waitForFunction(() => [...document.querySelectorAll('.pm51-panel')].some((x) => /Frontend Polish/.test(x.textContent)), null, { timeout: 6000 }).catch(() => null);
		const h0 = await hero();
		await t.check('its page reads Off', h0 === 'Off', String(h0));
		const psw = f.locator('.pm51-panel [data-action="pm51-skills-toggle"]').first();
		if (await psw.count()) {
			await psw.click();
			await t.page.waitForTimeout(500);
			const h1 = await hero();
			await t.check('switched on from its page, it reads Ready there', h1 === 'Ready', String(h1));
		}
		await t.page.keyboard.press('Escape');
	};

	tests[`lane-code Plugins: a switched-off plugin's catalog card switches it on (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'plugins');
		const hidden = await f.evaluate(() => String((document.querySelector('[data-continuous-workspace-body="plugins"] .o55-quiet-line') || {}).textContent || '').trim());
		await f.locator('[data-continuous-workspace-body="plugins"] [data-action="pm51-plugins-add"]').first().click();
		await f.waitForSelector('.o55g-card', { timeout: 8000 });
		await t.page.waitForTimeout(600);
		const card = f.locator('.o55g-card', { hasText: 'Calendar Connector' }).first();
		const c0 = await card.evaluate((n) => ({ text: n.textContent.replace(/\s+/g, ' ').trim(), action: n.getAttribute('data-action'), disabled: n.getAttribute('aria-disabled') }));
		await t.check('Calendar Connector (on the list, switched off) has a card that says so and can be chosen', /switched off/i.test(c0.text) && c0.disabled !== 'true' && c0.action !== 'pm51-disabled', `${JSON.stringify(c0)}; list: ${hidden}`);
		if (c0.action === 'pm51-disabled') return;
		await card.click();
		await t.page.waitForTimeout(900);
		const r = await f.evaluate(() => ({ wizard: !!document.querySelector('.o55g-card'), rows: [...document.querySelectorAll('[data-continuous-workspace-body="plugins"] .pm51-item')].map((n) => n.textContent.replace(/\s+/g, ' ').trim().slice(0, 50)) }));
		await t.check('choosing it closes the add window and the list shows Calendar Connector, on', !r.wizard && r.rows.some((x) => /Calendar Connector/.test(x)), JSON.stringify(r));
	};

	tests[`lane-code Commands: a missing persona is said and can be put right (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'code', 'commands');
		await tab(t, f, 'commands', 'Commands');
		const row = () => f.evaluate(() => { const n = [...document.querySelectorAll('[data-continuous-workspace-body="commands"] .pm51-item')].find((x) => /x-quick-audit/.test(x.textContent)); return n ? n.textContent.replace(/\s+/g, ' ').trim() : null; });
		const r0 = await row();
		if (!(await t.check('/x-quick-audit is on the list', !!r0, String(r0)))) return;
		await t.check('its row says it needs you: its persona is not available', /Needs you/.test(r0) && /Repository Auditor/.test(r0) && /not available/.test(r0), r0);
		await f.locator('[data-continuous-workspace-body="commands"] .pm51-item', { hasText: 'x-quick-audit' }).first().click();
		const fix = f.locator('[data-action="pm51-commands-persona-inherit"]').first();
		const has = await fix.waitFor({ state: 'visible', timeout: 6000 }).then(() => true).catch(() => false);
		if (!(await t.check('its page offers "Use the chat’s persona"', has))) return;
		await fix.click();
		await t.page.waitForTimeout(700);
		const after = await f.evaluate(() => {
			const w = [...document.querySelectorAll('.pm51-panel')].find((p) => p.dataset.command === 'x-quick-audit' || /x-quick-audit/.test(p.textContent));
			const sel = w && w.querySelector('.pm51-commands-overrides select[data-key="persona"]');
			return { status: w ? ((w.querySelector('.pm51-hero-status') || {}).textContent || '').trim() : '', persona: sel ? sel.value : null, note: w ? !!w.querySelector('[data-persona-missing]') : null };
		});
		await t.check('afterwards its page no longer needs you, and the persona is Inherit', after.persona === '' && !after.note && !/Needs you/.test(after.status), JSON.stringify(after));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(500);
		const r1 = await row();
		await t.check('and its row no longer says it needs you', !!r1 && !/Needs you/.test(r1), String(r1));
	};
}
