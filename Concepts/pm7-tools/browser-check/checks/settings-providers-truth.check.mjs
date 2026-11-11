// Stream F batch 11, lane B: Settings › AI & Providers says what its services really are (audit A2, re-verified in
// settings-managers-20261110/review/VERIFIED-A1-A4.md; OPEN-AND-FOUND.md section C item 4).
// counters (A2 B-1, C 4): the counters on Services add up to the list's own count, and "Ready" counts only services
//   whose page reads Ready.
// ready (A2 B-2, B-4): a service whose pill reads Ready never shows "Getting it ready", and its state has every
//   readiness step done and a model on; a page never says "Version is installed" with no number.
// home (A2 B-3): each Settings Home "Needs attention" row about a service says what that service's state says (a row
//   that says "needs sign-in" names a service that is signed out), the Home and rail counts are the rows shown, and the
//   Home "AI Providers" line is the counters' words.
// groups (A2 B-5): each group heading of the services list appears once.
// console (A2 B-7): Usage & budgets › "Open the console" opens a panel that holds the quota and budget controls with
//   their values, and its Change reaches the control's own row.
// try order (A2 B-8): "Service try order" and "Service tried first" offer only the services in the list, each once.
// lanes (A2 B-9): "Service for each lane" offers every service in the list (ready ones can be picked, the others say
//   why not), and picking ChatGPT / Codex stores it.
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
async function tab(t, f, label) {
	await f.locator('[data-continuous-workspace-body="providers"] .manager-tab', { hasText: new RegExp(`^\\s*${label}\\s*$`) }).first().click();
	await t.settle();
	await t.page.waitForTimeout(500);
}
/* the services as the page lists them: name, the roster's state line, and the Settings state behind it */
const roster = (f) => f.evaluate(() => {
	const block = document.querySelector('[data-continuous-workspace-body="providers"]');
	const rows = [...block.querySelectorAll('#provider-roster .resource-row[data-provider]')].map((r) => ({
		id: r.dataset.provider, name: (r.querySelector('.resource-row-name') || r).textContent.trim(), meta: (r.querySelector('.resource-row-meta') || {}).textContent?.trim() || '',
	}));
	const st = window.PM12_KIMI && window.PM12_KIMI.getState ? window.PM12_KIMI.getState() : null;
	const ps = (st && st.providers) || [];
	rows.forEach((row) => {
		const p = ps.find((x) => x.id === row.id) || {};
		const r = p.readiness || {};
		row.status = p.status; row.signedIn = !!p.signedIn; row.models = (p.models || []).filter((m) => m.enabled).length;
		row.allDone = !!(r.installed && r.signedIn && r.accountChosen && r.modelsReady);
		row.seat = (p.accounts || []).some((a) => /seat/i.test(String(a.health || '')));
	});
	const title = (block.querySelector('#provider-roster .roster-title') || {}).textContent || '';
	const stats = [...block.querySelectorAll('.pm51-stat')].map((s) => ({ label: s.querySelector('.pm51-stat-label').textContent.trim(), value: Number(s.querySelector('.pm51-stat-value').textContent.trim()) }));
	const heads = [...block.querySelectorAll('#provider-roster .o55-roster-group > span')].map((x) => x.textContent.trim());
	return { rows, title, stats, heads };
});
const want = (cond, ok, bad) => (cond ? ok : bad);

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`A2 B-1 B-2 B-4 B-5 counters, Ready and groups (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'ai', 'providers');
		const r = await roster(f);
		const total = Number((r.title.match(/\((\d+)\)/) || [])[1]);
		const sum = r.stats.reduce((n, s) => n + s.value, 0);
		await t.check(`counters add up to the list (${r.stats.map((s) => `${s.label} ${s.value}`).join(', ')} vs ${r.title.trim()})`, total === r.rows.length && sum === total, `sum ${sum}, list ${total}, rows ${r.rows.length}`);
		const ready = r.stats.find((s) => s.label === 'Ready');
		const readyRows = r.rows.filter((x) => /^Ready\b/.test(x.meta));
		await t.check('"Ready" counts the services the list marks Ready', !!ready && ready.value === readyRows.length, `Ready ${ready && ready.value}, rows marked Ready ${readyRows.length}`);
		const hollow = readyRows.filter((x) => !(x.allDone && x.models > 0));
		await t.check('every service marked Ready has every readiness step done and a model on', hollow.length === 0, hollow.map((x) => `${x.name} (status ${x.status}, models on ${x.models})`).join('; ') || `${readyRows.length} ready services`);
		const dup = r.heads.filter((x, i) => r.heads.indexOf(x) !== i);
		await t.check(`each group heading appears once (${r.heads.join(' / ')})`, r.heads.length >= 2 && dup.length === 0, dup.join(', '));
		// every service's own page: the pill and what it says under it
		const bad = [], versionless = [], doubled = [];
		const open = (name) => f.waitForFunction((name) => {
			const det = document.querySelector('[data-continuous-workspace-body="providers"] .pm51-detail');
			const title = det && det.querySelector('.pm51-detail-title');
			return !!title && title.textContent.trim().startsWith(name);
		}, name, { timeout: 3000 }).then(() => true).catch(() => false);
		for (const row of r.rows) {
			// a click that lands while the previous page is still being drawn is pressed again (one retry)
			for (let i = 0; i < 2; i++) {
				await f.evaluate((id) => document.querySelector(`[data-continuous-workspace-body="providers"] #provider-roster .resource-row[data-provider="${id}"]`).click(), row.id);
				if (await open(row.name)) break;
			}
			const d = await f.waitForFunction((name) => {
				const det = document.querySelector('[data-continuous-workspace-body="providers"] .pm51-detail');
				const title = det && det.querySelector('.pm51-detail-title');
				if (!title || !title.textContent.trim().startsWith(name)) return false;
				const pill = title.querySelector('.pm51-status, [class*="status"]');
				const heads = [...det.querySelectorAll('.pm51-section-title, .pm51-section-head h3, .pm51-section-head .pm51-section-name')].map((x) => x.textContent.trim());
				// an action the page head offers is not offered again in the page (A2 B-11: Cursor's "Enter API Key" twice)
				const head = [...det.querySelectorAll('.pm51-detail-head [data-action^="pm51-providers-"]')].map((b) => b.dataset.action);
				const twice = head.filter((act) => [...det.querySelectorAll(`.pm51-detail-content [data-action="${act}"]`)].some((b) => b.getClientRects().length));
				return { pill: pill ? pill.textContent.trim() : title.textContent.replace(name, '').trim(), getting: heads.includes('Getting it ready'), text: det.innerText, twice };
			}, row.name, { timeout: 6000 }).then((h) => h.jsonValue()).catch(() => null);
			if (!d) { bad.push(`${row.name}: its page did not open`); continue; }
			if (/^Ready\b/.test(d.pill) && d.getting) bad.push(`${row.name}: "Ready" above "Getting it ready"`);
			if (/Version\s+(is installed|undefined)/.test(d.text)) versionless.push(row.name);
			if (d.twice.length) doubled.push(`${row.name}: ${d.twice.join(', ')}`);
		}
		await t.check('no service page offers its head\'s action again below it (A2 B-11)', doubled.length === 0, doubled.join('; '));
		await t.check(`no service page shows "Ready" above "Getting it ready" (${r.rows.length} pages)`, bad.length === 0, bad.join('; '));
		await t.check('no service page says "Version is installed" without a number', versionless.length === 0, versionless.join(', '));
	};

	tests[`A2 B-3 Home and rail say what the services say (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'ai', 'providers');
		const r = await roster(f);
		const counts = Object.fromEntries(r.stats.map((s) => [s.label, s.value]));
		await f.evaluate(() => { const b = document.querySelector('#panel-settings .side-link[data-action="home"]'); if (b) b.click(); });
		await f.waitForSelector('#panel-settings .home-page', { timeout: 10000 });
		await t.settle();
		const home = await f.evaluate(() => {
			const panels = [...document.querySelectorAll('#panel-settings .home-panel')];
			const att = panels.find((p) => /Needs attention/.test(p.querySelector('.home-panel-title')?.textContent || ''));
			const rows = att ? [...att.querySelectorAll('.attention-row')].map((b) => ({ provider: b.dataset.provider || '', label: b.querySelector('.setup-label').textContent.trim(), meta: b.querySelector('.setup-meta').textContent.trim() })) : [];
			const meta = att ? att.querySelector('.home-panel-meta').textContent.trim() : '';
			const ai = [...document.querySelectorAll('#panel-settings .home-page .setup-row[data-workspace="providers"] .setup-meta')].map((x) => x.textContent.trim())[0] || '';
			const rail = document.querySelector('#panel-settings .side-health')?.textContent.trim() || '';
			return { rows, meta, ai, rail };
		});
		const wrong = [];
		for (const row of home.rows.filter((x) => x.provider)) {
			const p = r.rows.find((x) => x.id === row.provider);
			if (!p) { wrong.push(`${row.label}: no such service`); continue; }
			if (!/^Needs/.test(p.meta)) wrong.push(`${row.label}: the service reads "${p.meta}"`);
			if (/sign-?in/i.test(row.label) && p.signedIn) wrong.push(`${row.label}: ${p.name} is signed in`);
			if (/no model/i.test(row.label) && p.models > 0) wrong.push(`${row.label}: ${p.name} has ${p.models} models on`);
			if (/seat|cannot invoke/i.test(row.label) && !p.seat) wrong.push(`${row.label}: ${p.name} has its seat`);
		}
		// a service whose list line says it waits on a seat has its own Home row that says so
		for (const p of r.rows.filter((x) => /seat/i.test(x.meta))) {
			if (!home.rows.some((x) => x.provider === p.id && /seat|cannot invoke/i.test(x.label + ' ' + x.meta))) wrong.push(`${p.name} ("${p.meta}") has no Home row about its seat`);
		}
		await t.check(`each Home service row says what its service says (${home.rows.length} rows)`, home.rows.length > 0 && wrong.length === 0, wrong.join('; ') || home.rows.map((x) => x.label).join(' | '));
		const n = Number((home.meta.match(/^(\d+)/) || [])[1]);
		await t.check(`Home's count is its rows ("${home.meta}")`, n === home.rows.length, `${home.rows.length} rows`);
		await t.check(`the rail's count is Home's ("${home.rail}")`, Number((home.rail.match(/(\d+)/) || [])[1]) === n, home.rail);
		const needs = (counts['Needs attention'] || 0);
		const line = `${counts.Ready} ready${needs ? ` · ${needs} need${needs === 1 ? 's' : ''} attention` : ''}`;
		await t.check(`Home's AI Providers line is the counters ("${home.ai}")`, home.ai.startsWith(line), `want "${line}"`);
	};

	tests[`A2 B-7 the quota and budget console opens (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'ai', 'providers');
		await tab(t, f, 'Usage & budgets');
		const btn = f.locator('[data-continuous-workspace-body="providers"] button[data-setting="ai.usage.quota-management"]').first();
		const found = await btn.count();
		if (!(await t.check('Usage & budgets has "Open the console"', found > 0))) return;
		await f.evaluate(() => { const d = document.querySelector('[data-continuous-workspace-body="providers"] button[data-setting="ai.usage.quota-management"]'); const fold = d.closest('details'); if (fold) fold.open = true; d.scrollIntoView({ block: 'center' }); });
		await t.page.waitForTimeout(300);
		await btn.click();
		const panel = await f.waitForFunction(() => {
			const rows = [...document.querySelectorAll('.o55-console-row')].filter((x) => x.getClientRects().length);
			return rows.length ? rows.map((x) => ({ id: x.dataset.settingId, label: x.querySelector('.o55-console-label').textContent.trim(), value: x.querySelector('.o55-console-value').textContent.trim() })) : false;
		}, null, { timeout: 5000 }).then((h) => h.jsonValue()).catch(() => []);
		const empty = panel.filter((x) => !x.value);
		await t.check(`"Open the console" opens the quota and budget controls (${panel.length} rows)`, panel.length >= 8 && empty.length === 0 && panel.some((x) => x.id === 'ai.accounts.hard-switch-level') && panel.some((x) => x.id === 'ai.usage.monthly-spend-limit'), panel.map((x) => `${x.label}: ${x.value}`).join('; ') || 'nothing opened');
		if (!panel.length) return;
		await f.locator('.o55-console-row[data-setting-id="ai.accounts.hard-switch-level"] [data-action="o55-reveal"]').click();
		const landed = await f.waitForFunction(() => {
			const row = document.querySelector('#setting-ai\\.accounts\\.hard-switch-level, .setting-row[data-setting-id="ai.accounts.hard-switch-level"]');
			if (!row || !row.getClientRects().length) return false;
			const b = row.getBoundingClientRect();
			return b.top >= 0 && b.bottom <= innerHeight && !document.querySelector('.o55-console-row') ? true : false;
		}, null, { timeout: 6000 }).then(() => true).catch(() => false);
		await t.check('its Change reaches the control\'s own row, and the panel closes', landed);
	};

	tests[`A2 B-8 B-9 service lists offer the services (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'ai', 'providers');
		const r = await roster(f);
		const names = r.rows.map((x) => x.name);
		const readyNames = r.rows.filter((x) => /^Ready\b/.test(x.meta)).map((x) => x.name);
		// "Service tried first": its choices are services, each once
		await tab(t, f, 'Models');
		const opts = (id) => f.evaluate((id) => {
			const sel = document.querySelector(`[data-continuous-workspace-body="providers"] select[data-setting="${id}"]`);
			return sel ? [...sel.options].map((o) => ({ value: o.value, label: o.textContent.trim(), disabled: o.disabled || o.hasAttribute('data-disabled'), why: o.getAttribute('data-disabled-reason') || o.getAttribute('data-reason') || '' })) : null;
		}, id);
		const first = await opts('ai.models.default-provider');
		if (await t.check('Models has "Service tried first"', !!first)) {
			const strange = first.filter((o) => !names.includes(o.label));
			const twice = first.map((o) => o.label).filter((x, i, l) => l.indexOf(x) !== i);
			await t.check(`"Service tried first" offers only services, each once (${first.length})`, strange.length === 0 && twice.length === 0, [...strange.map((o) => `not a service: ${o.label}`), ...twice.map((x) => `twice: ${x}`)].join('; '));
		}
		// "Service for each lane": every service, the ready ones can be picked
		const lane = await opts('ai.models.per-lane-platform');
		if (await t.check('Models has "Service for each lane"', !!lane)) {
			const offered = lane.map((o) => o.label);
			const missing = names.filter((n) => !offered.includes(n));
			await t.check(`"Service for each lane" offers every service (${lane.length} choices for ${names.length} services)`, missing.length === 0, `missing: ${missing.join(', ')}`);
			const blocked = lane.filter((o) => readyNames.includes(o.label) && o.disabled).map((o) => o.label);
			await t.check('every ready service can be picked for a lane', blocked.length === 0, blocked.join(', '));
			// pick ChatGPT / Codex through the visible dropdown
			await f.evaluate(() => { const sel = document.querySelector('[data-continuous-workspace-body="providers"] select[data-setting="ai.models.per-lane-platform"]'); let d = sel.closest('details'); while (d) { if (!d.open) d.querySelector(':scope > summary').click(); d = d.parentElement.closest('details'); } });
			await t.page.waitForTimeout(500);
			await f.evaluate(() => { const sel = document.querySelector('[data-continuous-workspace-body="providers"] select[data-setting="ai.models.per-lane-platform"]'); const tr = sel.closest('.pm51-dd').querySelector('.pm51-dd-trigger'); tr.scrollIntoView({ block: 'center' }); });
			await t.page.waitForTimeout(400);
			await f.locator('[data-continuous-workspace-body="providers"] .setting-row:has(select[data-setting="ai.models.per-lane-platform"]) .pm51-dd-trigger').first().click({ timeout: 5000 });
			const opt = f.locator('.pm51-popout [role="option"]').filter({ has: f.locator('.pm51-popout-label', { hasText: /^ChatGPT \/ Codex$/ }) }).first();
			await opt.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
			const can = await opt.count();
			if (await t.check('the lane dropdown lists ChatGPT / Codex', can > 0)) {
				await opt.click();
				await t.page.waitForTimeout(500);
				const v = await f.evaluate(() => [PM51.value('ai.models.per-lane-platform'), PM51.valueLabel('ai.models.per-lane-platform', PM51.value('ai.models.per-lane-platform'))]);
				await t.check(`picking ChatGPT / Codex stores it (${v.join(' → ')})`, v[1] === 'ChatGPT / Codex', v.join(' / '));
			} else await t.page.keyboard.press('Escape');
		}
		// "Service try order": its editor lists services and offers the rest, each once
		await tab(t, f, 'Limits & switching');
		const opened = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="providers"] [data-action="open-structured-setting"][data-setting="ai.models.provider-priority"]'); if (!b) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; });
		if (await t.check('Limits & switching has "Service try order"', opened)) {
			const ed = await f.waitForFunction(() => {
				const w = [...document.querySelectorAll('.o55-le')].find((x) => x.getClientRects().length);
				if (!w) return false;
				return { list: [...w.querySelectorAll('.o55-le-name')].map((x) => x.textContent.trim()), add: [...w.querySelectorAll('select[data-o55-le-new] option')].map((o) => o.textContent.trim()) };
			}, null, { timeout: 6000 }).then((h) => h.jsonValue()).catch(() => null);
			if (await t.check('its editor opens', !!ed)) {
				const strange = ed.list.concat(ed.add).filter((n) => !names.includes(n));
				const both = ed.list.filter((n) => ed.add.includes(n));
				const all = ed.list.concat(ed.add);
				const twice = all.filter((x, i) => all.indexOf(x) !== i);
				await t.check(`"Service try order" lists services only (${ed.list.join(', ')})`, ed.list.length > 0 && strange.length === 0, strange.map((n) => `not a service: ${n}`).join('; '));
				await t.check('its Add list offers each other service once', both.length === 0 && twice.length === 0, [...both.map((n) => `listed and offered: ${n}`), ...twice.map((n) => `twice: ${n}`)].join('; ') || `${ed.add.length} offered`);
			}
			await t.page.keyboard.press('Escape');
		}
	};
}
