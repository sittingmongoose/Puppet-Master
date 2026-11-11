import fs from 'node:fs';
// Stream F batch 10, base-page words in Settings (Jared's 2026-11-09 Settings feedback, handed over by stream P).
// FO-134: every placed value control on every Settings page (each chapter, page and manager tab: switches, boxes,
//   sliders, text areas, pickers, choice groups) is named by its row's own label, not the inventory's
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
		const off = names.filter((x) => x.own && !x.named.toLowerCase().includes(x.own.toLowerCase()));
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

	/* FO-134 / sol-review-l1s L1S-N1: every placed value control on every Settings page, not just Models: each
	   chapter, each page in it (mounted), each manager tab. A row that places a setting (data-setting-id) names its value
	   controls (a text or number box, a text area, a slider, a select or its dropdown, a switch, a choice group) by its
	   own visible label: the accessible name contains it ("Name: 3 items. Edit" counts). The name is computed as a
	   screen reader does for these elements: aria-labelledby, aria-label, a <label for>, then the text of an enclosing
	   <label> (a slider's "80"), button text, then title. Controls are not pre-selected by having a name. --set chapters=ai,code */
	tests[`FO-134 every placed value control is named by its row (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		const domains = t.args.chapters ? String(t.args.chapters).split(',') : await f.evaluate(() => [...new Set([...document.querySelectorAll('#pm-settings-root [data-action="navigate-domain"]')].map((b) => b.dataset.domain))]);
		const all = [], seen = new Set();
		const READ = () => {
			const VALUE = 'a[href], button, [role="button"], [role="radio"], [role="checkbox"], input:not([type="hidden"]), textarea, select, [role="switch"], [role="slider"], [role="combobox"], .pm51-dd-trigger, [role="radiogroup"], [role="group"], [role="spinbutton"], [role="textbox"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
			const own = (lab) => lab ? [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim() : '';
			const txt = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim();
			const nameOf = (e) => {
				const by = e.getAttribute('aria-labelledby');
				if (by) return by.split(/\s+/).map((id) => { const n = document.getElementById(id); return n ? txt(n) : ''; }).join(' ').trim();
				const al = e.getAttribute('aria-label'); if (al && al.trim()) return al.trim();
				if (e.id && /^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)) { const l = document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if (l) return txt(l); }
				const wrap = /^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) && e.closest('label'); if (wrap) return txt(wrap);
				if (e.matches('input[type="button"], input[type="submit"], input[type="reset"]')) return e.value;
				if (e.matches('input[type="image"]') && e.alt) return e.alt;
				if (e.matches('a[href], button, [role="button"], [role="radio"], [role="checkbox"], [role="switch"]') && txt(e)) return txt(e);
				if (e.getAttribute('title')) return e.getAttribute('title').trim();
				return '';
			};
			const out = [];
			const ROWS = ['.setting-row', '.o55-field'].map((x) => '#panel-settings [data-continuous-workspace-body] ' + x).join(', ');
			for (const row of document.querySelectorAll(ROWS)) {
				if (row.closest('[aria-hidden="true"]')) continue;
				const id = row.getAttribute('data-setting-id') || row.id.replace(/^setting-/, '') || (row.closest('[data-continuous-workspace-body]').dataset.continuousWorkspaceBody + ': ' + own(row.querySelector('.setting-label, .o55-field-label')));
				const label = own(row.querySelector('.setting-label, .o55-field-label'));
				const box = row.querySelector(':scope > .setting-control') || row;
				if (!label) continue;
				const expected = [...box.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"], [role]')].filter(e =>
					!e.closest('[aria-hidden="true"]') && e.closest('.setting-row, .o55-field') === row &&
					!e.matches('.details-btn, [data-action="setting-details"], [role="option"], [role="menuitem"], input[type="hidden"]') &&
					(e.matches('a[href], button, input, select, textarea, [contenteditable="true"]') || e.tabIndex >= 0 || /^(button|switch|slider|combobox|spinbutton|textbox|checkbox|radio|radiogroup|group)$/.test(e.getAttribute('role'))));
				for (const e of expected) if (!e.matches(VALUE)) out.push({ id, label, kind: 'coverage', index: expected.indexOf(e), name: 'interactive control omitted by selector', ok: false });
				if (!expected.length && row.dataset.o55Kind && row.dataset.o55Kind !== 'status') out.push({ id, label, kind: 'coverage', index: -1, name: 'value row has no control', ok: false });
				for (const e of box.querySelectorAll(VALUE)) {
					if (e.closest('[aria-hidden="true"]') || (e.tagName === 'INPUT' && /^hidden$/.test(e.type))) continue;
					if (e.closest('.setting-row, .o55-field') !== row) continue;   /* a row nested inside this one names its own */
					if (e.matches('[role="option"], [role="menuitem"]')) continue;
					if (e.matches('.details-btn, [data-action="setting-details"]')) continue;
					const name = nameOf(e);
					out.push({ id, label, kind: (e.getAttribute('role') || e.tagName.toLowerCase()) + (e.type && e.tagName === 'INPUT' ? ':' + e.type : ''), index: [...box.querySelectorAll(VALUE)].indexOf(e), name, ok: name.toLowerCase().includes(label.toLowerCase()) });
				}
			}
			return out;
		};
		const take = async (where) => { for (const x of await f.evaluate(READ)) { const k = x.id + '|' + x.kind + '|' + x.index + '|' + x.name; if (seen.has(k)) continue; seen.add(k); all.push(Object.assign({ where }, x)); } };
		for (const d of domains) {
			await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${d}"]`).first().click();
			await f.waitForSelector(`#pm-settings-root .domain-link.active[data-domain="${d}"]`, { timeout: 15000 });
			await t.settle();
			const wss = await f.evaluate(() => [...document.querySelectorAll('[data-continuous-workspace-body]')].map((b) => b.dataset.continuousWorkspaceBody));
			for (const ws of wss) {
				await f.evaluate(([dd, w]) => PM51.go(dd, w), [d, ws]);
				await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
				await t.settle();
				await take(`${d}/${ws}`);
				const tabs = await f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .pm51-tabs .manager-tab[data-tab]`)].map((b) => b.dataset.tab), ws);
				for (const tab of tabs) {
					await f.evaluate(([w, tb]) => {
						const old = document.querySelector(`[data-continuous-workspace-body="${w}"] .pm51-mgr > .manager-body:not(.o55-leaving)`);
						if (old) old.setAttribute('data-fo134-old-body', 'true');
						PM51.switchTab(w, tb);
					}, [ws, tab]);
					// Tab content is replaced after a presented frame; sandbox frames can take longer than 700 ms.
					// Wait for the old body to leave instead of moving on and cancelling the pending switch.
					await f.waitForFunction(([w, tb]) => {
						const b = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
						return b && !b.querySelector('[data-fo134-old-body]') && b.querySelector(`.manager-tab.active[data-tab="${tb}"]`);
					}, [ws, tab], { timeout: 15000 });
					await t.settle();
					await take(`${d}/${ws}/${tab}`);
				}
			}
		}
		// Full-walk floor includes the 778 value controls independently inventoried in the FO-134 recheck.
		// The per-row census above also fails if VALUE misses a newly introduced interactive kind.
		const bad = all.filter((x) => !x.ok);
		const kinds = {}; for (const x of all) kinds[x.kind] = (kinds[x.kind] || 0) + 1;
		const census = {}; for (const x of all) { const key = x.id + '|' + x.kind; census[key] = (census[key] || 0) + 1; }
		if (t.args.namesCensus) fs.writeFileSync(String(t.args.namesCensus), JSON.stringify(census, null, 2) + '\n');
		const fixture = new URL('./settings-value-controls.json', import.meta.url);
		if (!t.args.chapters && !t.args.namesCensus) await t.check('the expected-control census fixture exists', fs.existsSync(fixture));
		if (fs.existsSync(fixture) && !t.args.chapters) {
			const expected = JSON.parse(fs.readFileSync(fixture, 'utf8'));
			const missing = Object.entries(expected).filter(([key, n]) => (census[key] || 0) < n);
			await t.check('every expected row contributes all its value controls', !missing.length,
				missing.map(([key, n]) => `${key}: expected ${n}, walked ${census[key] || 0}`).join('; '));
		}
		t.log(`walked ${domains.length} chapters: ${all.length} value controls on ${new Set(all.map((x) => x.id)).size} placed rows; kinds ${JSON.stringify(kinds)}`);
		if (bad.length) t.log('unnamed or misnamed: ' + JSON.stringify(bad.map((x) => `${x.where} ${x.id} ${x.kind} "${x.name}" vs "${x.label}"`)));
		await t.check(`every placed value control on every Settings page is named by its row (${all.length} controls)`, (t.args.chapters ? all.length > 0 : all.length >= 778) && bad.length === 0, `${bad.length} not: ` + bad.slice(0, 8).map((x) => `${x.id} ${x.kind} "${x.name}" vs "${x.label}"`).join('; '));
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
		}, [where, 'Available in|Where it is available|Where it\'s available|Use it in|Use it for|Where it is saved|This project only|All my projects|All your projects', only]);
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
			// a card picks and may move on by itself: press Continue only while the Start step still shows
			const shown = (sel) => f.evaluate((sel) => [...document.querySelectorAll(sel)].some((x) => x.getClientRects().length), sel);
			await t.page.waitForTimeout(700);
			if (!(await shown('.o55-cmd-name'))) await f.locator('.o55g-primary').first().click();
			await f.waitForFunction(() => [...document.querySelectorAll('.o55-cmd-name')].some((x) => x.getClientRects().length), null, { timeout: 8000 });
			await f.evaluate(() => { const set = (sel, v) => { const e = document.querySelector(sel); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } }; const val = (sel) => (document.querySelector(sel) || {}).value; set('.o55-cmd-name', 'fo131-check'); if (!val('.o55-cmd-desc')) set('.o55-cmd-desc', 'A check'); if (!val('.o55-cmd-text')) set('.o55-cmd-text', 'Hello'); });
			await f.locator('.o55g-primary').first().click();   // Write → How it runs, once
			const step = await f.waitForFunction(() => [...document.querySelectorAll('select.o55-cmd-scope')].some((x) => x.parentElement && x.parentElement.getClientRects().length), null, { timeout: 8000 }).then(() => true).catch(() => false);
			if (await t.check('Commands › New command reaches “How it runs”', step)) {
				// the step cross-fades in: read again until its picker is inside an open sheet (up to 4 s)
				let r = await scan('the set-up’s How it runs step');
				for (let k = 0; k < 20 && !r.pickers.length; k++) { await t.page.waitForTimeout(200); r = await scan('the set-up’s How it runs step'); }
				if (!r.pickers.length) r.pickers = [{ diag: await f.evaluate(() => [...document.querySelectorAll('select.o55-cmd-scope')].map((x) => { const anc = []; for (let e = x.parentElement; e && anc.length < 8; e = e.parentElement) anc.push((e.tagName + '.' + String(e.className).split(' ').slice(0, 2).join('.')).slice(0, 40)); return { vis: x.getClientRects().length, opts: [...x.options].map((o) => o.textContent.trim()), anc }; })) }];
				await judge(r, true);
			}
			for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); }
		}
		// P's rule on the recheck's four notes: the persona scope is a setting row and keeps its inventory label; the
		// Permissions summary row is a value, "Where it applies"; the Details panel says a global value applies
		// "Everywhere, …". (Skills' review lead is wording inside the add-skill wizard, read in code review.)
		for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(200); }
		const plabel = await f.evaluate(() => PM51.rowLabel(PM51.setting('personas.library.custom-scope')));
		await t.check('Personas › the persona scope row keeps its label “Save new personas for”', plabel === 'Save new personas for', plabel);
		await go(t, f, 'safety', 'permissions');
		const perm = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="permissions"]'); const labs = b ? [...b.querySelectorAll('.pm51-row-label')].filter((x) => x.getClientRects().length).map((x) => x.textContent.trim()) : []; return { where: labs.includes('Where it applies'), applies: labs.includes('Applies') }; });
		await t.check('Safety › Permissions › In short: “Where it applies”, not “Applies”', perm.where && !perm.applies, JSON.stringify(perm));
		const ins = await f.evaluate(async () => {
			const ref = window.PM12_REFERENCE, ids = [];
			if (ref && ref.byCat) for (const c of Object.values(ref.byCat)) for (const r of c.settings || []) if (Array.isArray(r.scope) && r.scope.length === 1 && r.scope[0] === 'global') ids.push(r.id);
			for (const id of ids.slice(0, 40)) {
				try { PM51.revealSetting(id); } catch (e) { continue; }
				for (let i = 0; i < 30; i++) {
					await new Promise((r) => setTimeout(r, 100));
					const b = [...document.querySelectorAll(`.details-btn[data-setting="${CSS.escape(id)}"]`)].find((x) => x.getClientRects().length);
					if (!b) continue;
					b.click();
					for (let j = 0; j < 30; j++) {
						await new Promise((r) => setTimeout(r, 100));
						const h = [...document.querySelectorAll('.o55-insp-block h4')].find((x) => x.getClientRects().length && x.textContent.trim() === 'Where it applies');
						if (h) return { id, text: h.parentElement.querySelector('p').textContent.trim() };
					}
					break;
				}
			}
			return { id: null, text: '' };
		});
		await t.check('Details panel › a global value: “Where it applies: Everywhere, unless a project sets its own.”', /^Everywhere, unless a project sets its own/.test(ins.text), JSON.stringify(ins));
		await t.page.keyboard.press('Escape');
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
