// Stream F batch 10, base-page words in Settings (Jared's 2026-11-09 Settings feedback, handed over by stream P).
// FO-134: a switch (and every value control the row renderer draws) is named by its row's own label, not the inventory's
//   ("Show Actual Model Used"), and a real hover over a switch on Providers & Accounts › Models shows that label with
//   what a press does ("Turn this setting on." / "...off."), never "Change this setting.".
// FO-135: the Settings rail has no "Project: … · concept fixture" line; a chapter page's toolbar project button names the project.
// FO-131: the base scope pickers follow stream P's rule (batch10/fo-b10-e/SCOPE-LIST.md): a thing you add is
//   "Where it’s available: This project / Every project" (Toolchain's Edit panel, the persona scope row, a command's
//   panel, its dry run and the set-up's How it runs step, each scanned whole, with every scope picker's accessible
//   name equal to that label); Git's identity is a computer's: "Where it applies: Every project on <computer> /
//   This project", never "on this server" or "Only this project".
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

async function settings(t, surface, [w, h] = [1920, 1080]) {
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

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-134 controls are named by their row (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'ai', 'providers');
		await f.locator('[data-continuous-workspace-body="providers"] .manager-tab', { hasText: /^\s*Models\s*$/ }).first().click();
		await t.settle();
		await t.page.waitForTimeout(600);
		// every value control the row renderer draws on the page: its accessible name is the row's visible label
		const names = await f.evaluate(() => {
			const body = document.querySelector('[data-continuous-workspace-body="providers"]');
			const out = [];
			for (const row of body.querySelectorAll('.setting-row[data-setting-id], .setting-row[id^="setting-"]')) {
				if (!row.getClientRects().length) continue;
				const ctl = row.querySelector(':scope > .setting-control [aria-label][data-setting], :scope > .setting-control [aria-label] [data-setting]');
				const lab = row.querySelector(':scope > .setting-copy .setting-label');
				if (!ctl || !lab) continue;
				const own = [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
				const named = ctl.closest('[aria-label]').getAttribute('aria-label') || '';
				out.push({ id: row.dataset.settingId || row.id, own, named });
			}
			return out;
		});
		// a list's button says its count after the name ("Name: 3 items. Edit")
		const off = names.filter((x) => x.own && x.named !== x.own && !(x.named.startsWith(x.own + ': ') && x.named.endsWith('. Edit')));
		await t.check(`Models: ${names.length} drawn controls are named by their row's label`, names.length >= 5 && off.length === 0, off.slice(0, 6).map((x) => `${x.id}: "${x.named}" vs "${x.own}"`).join('; ') || `${names.length} controls`);
		// a real hover over the first switch on Models
		const sw = f.locator('[data-continuous-workspace-body="providers"] .setting-row .toggle[role="switch"][data-action="toggle-setting"]').first();
		await sw.scrollIntoViewIfNeeded();
		await t.page.waitForTimeout(300);
		const want = await sw.evaluate((el) => {
			const lab = el.closest('.setting-row').querySelector('.setting-label');
			return { label: [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(), on: el.getAttribute('aria-checked') === 'true' };
		});
		await t.page.mouse.move(5, 5);
		await sw.hover();
		const tag = await f.waitForFunction(() => {
			const tags = [...document.querySelectorAll('.pm-hover-tag')].filter((x) => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden' && parseFloat(getComputedStyle(x).opacity) > 0.5);
			return tags.length ? tags[0].textContent.replace(/\s+/g, ' ').trim() : false;
		}, null, { timeout: 6000 }).then((h) => h.jsonValue()).catch(() => '');
		const detail = want.on ? 'Turn this setting off.' : 'Turn this setting on.';
		await t.check(`Models: hovering "${want.label}" shows its label and what a press does`, !!tag && tag.includes(want.label) && tag.includes(detail) && !/Change this setting/.test(tag), `tag "${tag}"`);
	};

	tests[`FO-135 no rail project line (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		for (const size of [[1920, 1080], [860, 900]]) {
			const f = await settings(t, surface, size);
			await go(t, f, 'ai', 'providers');   // a chapter page: its toolbar carries the project button
			const r = await f.evaluate(() => ({
				line: [...document.querySelectorAll('#panel-settings .rail-project')].map((x) => x.textContent.trim()),
				fixture: /concept fixture/i.test(document.querySelector('#panel-settings .domain-rail, #panel-settings .rail-head')?.textContent || ''),
				pill: [...document.querySelectorAll('#panel-settings [data-action="project-menu"]')].filter((x) => x.getClientRects().length).map((x) => x.textContent.trim()).join(' ') || '',
			}));
			await t.check(`${size.join('x')}: the Settings rail does not repeat the project`, r.line.length === 0 && !r.fixture, r.line.join(' | '));
			await t.check(`${size.join('x')}: the toolbar's project button still names it`, r.pill.length > 0, `project button "${r.pill}"`);
		}
	};

	tests[`FO-131 base scope pickers share This project / Every project (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		const persona = await f.evaluate(() => ['project', 'global'].map((v) => PM51.valueLabel('personas.library.custom-scope', v)));
		await t.check('Personas › the persona scope: This project / Every project', persona.join(' / ') === 'This project / Every project', persona.join(' / '));
		// Toolchain › a language server's Edit panel
		await go(t, f, 'code', 'toolchain');
		const opened = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="toolchain"] [data-action="pm51-toolchain-edit-lsp"]'); if (!b) return false; b.click(); return true; });
		if (await t.check('Toolchain: a language server has Edit', opened)) {
			const got = await f.waitForFunction(() => {
				const sel = [...document.querySelectorAll('select[data-field="scope"]')].find((s) => s.closest('aside, .drawer, .pm51-panel, [role="dialog"]'));
				const lab = sel && sel.closest('.pm51-field') && sel.closest('.pm51-field').querySelector('.pm51-field-label');
				return sel ? { opts: [...sel.options].map((o) => o.textContent.trim()), label: lab ? lab.textContent.trim() : '' } : false;
			}, null, { timeout: 8000 }).then((h) => h.jsonValue()).catch(() => ({ opts: [], label: '' }));
			await t.check('Toolchain › Edit: “Where it’s available: This project / Every project”', got.label === 'Where it’s available' && got.opts.join(' / ') === 'This project / Every project', `${got.label}: ${got.opts.join(' / ') || 'no picker'}`);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(400);
		}
		// Commands: the panel, its dry run and the New command set-up's "How it runs" step. Each is scanned whole (labels,
		// headings, facts, kv keys, the accessible names of its pickers) for the retired scope words, and every scope
		// picker's accessible name must be its visible "Where it’s available" (one spelling, the curly apostrophe)
		// only: read just the innermost open sheet whose text has these words (the dry run opens over the command's panel)
		const scan = (where, only = '') => f.evaluate(([where, banned, only]) => {
			const re = new RegExp(banned, 'i'), vis = (e) => e.getClientRects().length;
			let roots = [...document.querySelectorAll('#pm-settings-portals, .drawer-wrap, aside.drawer, [role="dialog"], .o55g-win, .o55g-layer')].filter(vis);
			if (only) { const hit = [...document.querySelectorAll('aside.drawer, [role="dialog"], .drawer-wrap')].filter((r) => vis(r) && r.textContent.includes(only)); roots = hit.length ? [hit[hit.length - 1]] : []; }
			const hits = [], pickers = [];
			for (const r of roots) {
				for (const e of r.querySelectorAll('.pm51-field-label, .pm51-ps-title, .pm51-pc-head, .pm51-kv-row > span:first-child, dt, th, .o55g-lead, p, .pm51-fact-label, [class*="fact"] span, h2, h3, h4')) if (vis(e) && re.test(e.textContent)) hits.push(e.textContent.trim().slice(0, 80));
				for (const e of r.querySelectorAll('[aria-label]')) if (re.test(e.getAttribute('aria-label'))) hits.push('name: ' + e.getAttribute('aria-label'));
				for (const sel of r.querySelectorAll('select')) {
					const opts = [...sel.options].map((o) => o.textContent.trim());
					if (!opts.includes('This project') || !opts.includes('Every project')) continue;
					const trig = sel.parentElement && sel.parentElement.querySelector('.pm51-dd-trigger');
					pickers.push({ name: sel.getAttribute('aria-label') || '', trigger: trig ? trig.getAttribute('aria-label') || '' : '' });
				}
			}
			return { where, roots: roots.length, hits: [...new Set(hits)], pickers };
		}, [where, 'Available in|Where it is available|Where it\'s available|Use it in|Use it for|Where it is saved|Save new personas for|This project only|All my projects|All your projects', only]);
		const judge = async (r, wantPicker) => {
			await t.check(`Commands › ${r.where}: no retired or mixed scope words`, r.roots > 0 && r.hits.length === 0, r.roots ? r.hits.join(' | ') : 'nothing open');
			if (wantPicker) await t.check(`Commands › ${r.where}: the scope picker is named “Where it’s available”`, r.pickers.length > 0 && r.pickers.every((x) => x.name === 'Where it’s available' && (!x.trigger || x.trigger === 'Where it’s available')), JSON.stringify(r.pickers));
		};
		await go(t, f, 'code', 'commands');
		await f.evaluate(() => PM51.switchTab('commands', 'commands'));
		const cmd = await f.waitForFunction(() => { const b = document.querySelector('[data-continuous-workspace-body="commands"] [data-action="pm51-commands-open"]'); if (!b) return false; b.click(); return true; }, null, { timeout: 8000 }).then(() => true).catch(() => false);
		if (await t.check('Commands: a command opens', cmd)) {
			await f.waitForSelector('[data-action="pm51-commands-field"][data-field="scope"]', { state: 'attached', timeout: 8000 }).catch(() => {});
			await t.page.waitForTimeout(400);
			await judge(await scan('a command’s panel'), true);
			const dry = await f.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.getClientRects().length && /Preview \(dry run\)/.test(x.textContent)); if (!b) return false; b.click(); return true; });
			if (await t.check('Commands: the panel has Preview (dry run)', dry)) {
				await f.waitForFunction(() => [...document.querySelectorAll('.pm51-ps-title, .pm51-pc-head')].some((x) => x.getClientRects().length && /How it will run/.test(x.textContent)), null, { timeout: 8000 }).catch(() => {});
				await judge(await scan('the dry run', 'How it will run'), false);
			}
			for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); }
		}
		const wiz = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="commands"] [data-action="pm51-commands-new"]'); if (!b) return false; b.click(); return true; });
		if (await t.check('Commands: New command opens its set-up', wiz)) {
			// Start: the first example; Write: give it a name nobody has; then How it runs
			await f.waitForSelector('.o55g-primary', { timeout: 8000 });
			await f.evaluate(() => { const tile = [...document.querySelectorAll('[data-action="pm51-commands-example"]')].find((x) => x.getClientRects().length); if (tile) tile.click(); });
			await f.locator('.o55g-primary').first().click();
			await f.waitForSelector('.o55-cmd-name', { timeout: 8000 });
			await f.evaluate(() => { const set = (sel, v) => { const e = document.querySelector(sel); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } }; const val = (sel) => (document.querySelector(sel) || {}).value; set('.o55-cmd-name', 'fo131-check'); if (!val('.o55-cmd-desc')) set('.o55-cmd-desc', 'A check'); if (!val('.o55-cmd-text')) set('.o55-cmd-text', 'Hello'); });
			await f.locator('.o55g-primary').first().click();
			const step = await f.waitForSelector('select.o55-cmd-scope', { state: 'attached', timeout: 8000 }).then(() => true).catch(() => false);
			if (await t.check('Commands › New command reaches “How it runs”', step)) await judge(await scan('the set-up’s How it runs step'), true);
			for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); }
		}
		// Source Control › Git identity: a computer's setting
		await t.page.keyboard.press('Escape');
		await go(t, f, 'source', 'source-manager');
		await f.evaluate(() => PM51.switchTab('source-manager', 'defaults'));   // Defaults & Safety › You and sign-in › Set up Git
		const opened2 = await f.waitForFunction(() => { const b = document.querySelector('[data-continuous-workspace-body="source-manager"] [data-action="pm51-source-git-setup"]'); if (!b) return false; b.click(); return true; }, null, { timeout: 8000 }).then(() => true).catch(() => false);
		if (await t.check('Source Control: the Git identity set-up opens', opened2)) {
			const git = await f.waitForFunction(() => {
				const sel = document.querySelector('select.o55-gs-scope');
				const lab = sel && sel.closest('.pm51-field') && sel.closest('.pm51-field').querySelector('.pm51-field-label');
				return sel ? { opts: [...sel.options].map((o) => o.textContent.trim()), label: lab ? lab.textContent.trim() : '' } : false;
			}, null, { timeout: 8000 }).then((h) => h.jsonValue()).catch(() => ({ opts: [], label: '' }));
			await t.check('Source Control › Git identity: “Where it applies: Every project on <computer> / This project”', git.label === 'Where it applies' && /^Every project on \S/.test(git.opts[0] || '') && git.opts[1] === 'This project', `${git.label}: ${git.opts.join(' / ') || 'no picker'}`);
			await t.page.keyboard.press('Escape');
		}
	};
}
