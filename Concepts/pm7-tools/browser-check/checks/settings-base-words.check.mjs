// Stream F batch 10, base-page words in Settings (Jared's 2026-11-09 Settings feedback, handed over by stream P).
// FO-134: a switch (and every value control the row renderer draws) is named by its row's own label, not the inventory's
//   ("Show Actual Model Used"), and a real hover over a switch on Providers & Accounts › Models shows that label with
//   what a press does ("Turn this setting on." / "...off."), never "Change this setting.".
// FO-135: the Settings rail has no "Project: … · concept fixture" line; a chapter page's toolbar project button names the project.
// FO-131: the base scope pickers that only worded the same choice differently say This project / Every project
//   (Toolchain's Edit panel, the persona scope row), and a command's panel labels its picker "Available in" as its
//   set-up does. The list of every base picker, and those left for stream P's rule, is batch10/fo-b10-e/SCOPE-LIST.md.
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
		await t.check('Personas › Save new personas for: This project / Every project', persona.join(' / ') === 'This project / Every project', persona.join(' / '));
		// Toolchain › a language server's Edit panel: Use it in
		await go(t, f, 'code', 'toolchain');
		const opened = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="toolchain"] [data-action="pm51-toolchain-edit-lsp"]'); if (!b) return false; b.click(); return true; });
		if (await t.check('Toolchain: a language server has Edit', opened)) {
			const opts = await f.waitForFunction(() => {
				const sel = [...document.querySelectorAll('select[data-field="scope"]')].find((s) => s.closest('aside, .drawer, .pm51-panel, [role="dialog"]'));
				return sel ? [...sel.options].map((o) => o.textContent.trim()) : false;
			}, null, { timeout: 8000 }).then((h) => h.jsonValue()).catch(() => []);
			await t.check('Toolchain › Edit › Use it in: This project / Every project', opts.join(' / ') === 'This project / Every project', opts.join(' / ') || 'no picker');
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(400);
		}
		// Commands › a command's panel: the picker is labelled as in its set-up
		await go(t, f, 'code', 'commands');
		await f.evaluate(() => PM51.switchTab('commands', 'commands'));
		const cmd = await f.waitForFunction(() => { const b = document.querySelector('[data-continuous-workspace-body="commands"] [data-action="pm51-commands-open"]'); if (!b) return false; b.click(); return true; }, null, { timeout: 8000 }).then(() => true).catch(() => false);
		if (await t.check('Commands: a command opens', cmd)) {
			const label = await f.waitForFunction(() => {
				const secs = [...document.querySelectorAll('.pm51-panel-section, .pm51-panel-card')].filter((s) => /Where it is available/.test(s.textContent));
				const l = secs.length && secs[secs.length - 1].querySelector('.pm51-field-label');
				return l ? l.textContent.trim() : false;
			}, null, { timeout: 8000 }).then((h) => h.jsonValue()).catch(() => '');
			await t.check('Commands › Where it is available: the picker says "Available in"', label === 'Available in', `label "${label}"`);
		}
	};
}
