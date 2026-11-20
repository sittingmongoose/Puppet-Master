// Stream P, Personas without "Same as the project" (Jared, 2026-11-20: "It also says same as project as an option...
// but what is the projects value here then...that makes no sense ... Same as the project should be removed"; his
// option A: a choice that follows another setting names that setting and what it resolves to now, "Same as Everyday
// model · Claude Opus 4"). The persona model (lead claude-projects-refresh, 2026-11-20, answer B): personas carry no
// model (Plans/Personas.md MD2 NEITHER, Jared 2026-11-12; DL-476 retired personas.tuning.default-model), so New
// persona asks for none and Try shows the model a persona's run uses, the Everyday model.
// Three tests on each surface asked for (normal and T3's sandbox unless --set sandbox= picks one):
//   anywhere  every chapter, workspace and manager tab of Settings with every More options open, then an editable
//             persona, every step of New persona, its Try panel and the Details panels of the persona rows that
//             follow something: no text, choice (<option>) or accessible name says "Same as the project" or "same as
//             project". The walk must reach at least 40 states and the Personas page.
//   no model  an editable persona draws no Preferred model row and no model picker; New persona's steps are Start,
//             Name, Answers (no Model step), and no step draws a model picker or a list that offers a ready model; a
//             persona made through it opens Try with "Model: Everyday model · <that row's own words on Settings ›
//             Models> (set in Settings › Models)" and no Preferred model line.
//   named     at 1280x900 and 740x900 (--set sizes=), on Settings UX Reviewer (editable): Creativity and Word choice
//             range read "<what Randomness / Word-choice focus shows on Models › How models answer> · from <that
//             row's name>"; What it may do without asking reads "Same as Profile in use · <the profile Permissions ›
//             Profiles then shows In use>" (read on Personas first, before Permissions is ever opened); Starts by's
//             face and its first choice read "Same as new agent runs · <this row's own words for the mode New agent
//             runs start in holds>", and after a real press of Plan only on that row they read "... · Planning
//             first"; Set its own on Creativity offers "Same as Randomness · <its value>" back, and a press on it
//             returns the row to following; the Details panel of Creativity lists the persona in those words. None of
//             these words is cut by its box.
// Fails cc159bba85 (the generic words on four persona rows and the New persona Model step) and passes the head.
import fs from 'node:fs';

const BODY = '[data-continuous-workspace-body="personas"]';
const MOUNTED = `${BODY}[data-workspace-mounted="true"]`;
const PID = 'custom-ux';
const S = { temp: 'personas.tuning.temperature', topp: 'personas.tuning.top-p', mode: 'personas.tuning.default-mode', perms: 'personas.tools.permission-profile', model: 'personas.tuning.default-model' };
const SRC = { temp: 'ai.models.temperature', topp: 'ai.models.top-p', mode: 'code.execution.run-mode', preset: 'safety.rules.permission-preset', model: 'ai.models.default-model' };
const RX = /same as (the )?project\b/i;
const shown = (x) => JSON.stringify(x);
const sizesOf = (t) => String(t.args.sizes || '1280x900,740x900').split(',').map((s) => s.split('x').map(Number));

// a page tab: on a narrow host the strip overflows into the More menu, so reach the tab through it when it hides
async function pageTab(t, f, page) {
	const tab = f.locator(`#tab-${page}`);
	if (await tab.isVisible().catch(() => false)) await tab.click();
	else {
		await f.locator('#pageTabsMoreBtn').click();
		await t.page.waitForTimeout(300);
		await f.locator(`#pageTabsMoreMenu .pm6-tb-menu-item[data-page="${page}"]`).first().click();
	}
	await t.settle();
}
async function settings(t, surface, [w, h]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await pageTab(t, f, 'settings');
	return f;
}
async function settled(f, ws, tabId) {
	await f.waitForFunction(([w, id]) => {
		if (document.querySelector('.tab-swap-a, .tab-swap-b')) return false;
		const page = document.querySelector(`[data-continuous-workspace-body="${w}"] .pm51-mgr`);
		if (!page) return true;
		if (page.querySelectorAll(':scope > .manager-body').length !== 1) return false;
		if (!id) return true;
		const active = page.querySelector(':scope > .pm51-tabs .manager-tab.active');
		return !!active && active.getAttribute('data-tab') === id;
	}, [ws, tabId || ''], { timeout: 4000 }).catch(() => {});
}
// open every disclosure in the Settings page (More options, Try and check), filling the lazy ones as a press does
const OPEN_ALL = () => {
	const scope = document.getElementById('pm-settings-root') || document;
	let n = 0;
	for (const d of scope.querySelectorAll('details:not([open])')) { if (window.PM51 && PM51.fillDisclosure) { try { PM51.fillDisclosure(d); } catch (e) { /* a plain disclosure */ } } d.open = true; n++; }
	return n;
};
// every place the words could be read: rendered text, a dropdown's choices, accessible names and hover words
const SCAN = ([where, rx, flags, rootSel]) => {
	const re = new RegExp(rx, flags), out = [];
	const roots = rootSel.map((s) => document.querySelector(s)).filter(Boolean);
	for (const root of roots) {
		const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		let n;
		while ((n = w.nextNode())) {
			const el = n.parentElement;
			if (!el || el.closest('script, style, template') || !re.test(n.nodeValue)) continue;
			out.push({ where, text: n.nodeValue.trim().slice(0, 90), kind: el.closest('option') ? 'choice' : el.getClientRects().length ? 'shown' : 'hidden', row: (el.closest('[data-setting-id]') || {}).dataset?.settingId || '' });
		}
		for (const el of root.querySelectorAll('[aria-label], [aria-valuetext], [title], [placeholder], [data-pm-hover-label], [data-pm-hover-detail]')) {
			for (const at of ['aria-label', 'aria-valuetext', 'title', 'placeholder', 'data-pm-hover-label', 'data-pm-hover-detail']) {
				const v = el.getAttribute(at);
				if (v && re.test(v)) out.push({ where, text: `${at}=${v.slice(0, 90)}`, kind: 'name', row: (el.closest('[data-setting-id]') || {}).dataset?.settingId || '' });
			}
		}
	}
	return out;
};
const SETTINGS_ROOTS = ['#pm-settings-root', '#panel-settings'];
const OVERLAY_ROOTS = ['#pm-settings-root', '#panel-settings', '.o55g-layer', '.drawer', '.side-panel', '#toast-stack', 'body'];
async function scan(f, where, roots = SETTINGS_ROOTS) {
	return f.evaluate(SCAN, [where, RX.source, 'i', roots]);
}
// the persona list is a drawer behind the detail head's button on a narrow host
async function goPersonas(t, f) {
	await f.evaluate(() => PM51.go('memory', 'personas'));
	await f.waitForSelector(MOUNTED, { timeout: 15000 });
	await t.settle();
	const active = (await f.locator(`${BODY} .pm51-tabs .manager-tab.active`).innerText().catch(() => '')).trim();
	if (active !== 'Personas') {
		await f.locator(`${BODY} .pm51-tabs .manager-tab`, { hasText: /^\s*Personas\s*$/ }).first().click();
		await settled(f, 'personas', 'personas');
		await t.page.waitForTimeout(300);
	}
}
async function openPersona(t, f, pid = PID) {
	// the drawer's button shows only on a narrow host (it may sit above the scrolled view: a press scrolls it in)
	const toggle = f.locator(`${BODY} .pm51-roster-toggle`).first();
	if (await toggle.isVisible().catch(() => false)) { await toggle.click(); await t.page.waitForTimeout(450); }
	const row = f.locator(`${BODY} .resource-row[data-id="${pid}"]`).first();
	await row.scrollIntoViewIfNeeded();
	await row.click();
	await t.settle();
	await t.page.waitForTimeout(400);
}
const rowOf = (f, id) => f.locator(`${BODY} .setting-row[data-setting-id="${id}"]`).first();
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
// a slider row's words while it follows (the spark line), and whether a box cuts them
const followLine = (row) => row.locator('.o55-mgp-own .o55-auto > span:last-child').first();
const ddFace = (row) => row.locator('.pm51-dd-value').first();
const cut = (loc) => loc.evaluate((el) => {
	const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
	return { cut: el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible', w: Math.round(r.width), sw: el.scrollWidth, cw: el.clientWidth, ov: cs.textOverflow };
});
// what the source row itself shows, read on its own page
async function sourceWords(t, f, id) {
	await f.evaluate((i) => PM51.revealSetting(i), id);
	await f.waitForSelector(`[id="setting-${id}"], [data-setting-id="${id}"]`, { state: 'attached', timeout: 15000 });
	await f.evaluate(OPEN_ALL);
	await t.settle();
	await t.page.waitForTimeout(300);
	return f.evaluate((i) => {
		const row = document.querySelector(`[id="setting-${i}"]`) || document.querySelector(`[data-setting-id="${i}"]`);
		const label = row && row.querySelector('.setting-label, .o55-field-label');
		const auto = row && row.querySelector('.o55-auto > span:last-child');
		const num = row && row.querySelector('input[type="number"], input[type="range"]');
		const on = row && row.querySelector('[role="radio"][aria-checked="true"], .segmented button.active, .pm51-dd-value');
		const text = (x) => (x ? x.textContent.replace(/\s+/g, ' ').trim() : '');
		// a model row's face: the model's name, and its depth when its small line names one
		const pick = row && row.querySelector('.o55-msel-trigger .o55-pick-copy strong');
		const depth = row && (text(row.querySelector('.o55-msel-trigger .o55-pick-copy small')).match(/\S+ depth/) || [''])[0];
		const value = pick ? [text(pick), depth].filter(Boolean).join(' · ') : auto ? text(auto) : num ? String(+Number(num.value).toFixed(2)) : text(on);
		return { label: text(label).replace(/Changed$/, '').trim(), value, raw: window.PM51 ? PM51.value(i) : null };
	}, id);
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('no "Same as the project" anywhere in Settings', async (t) => {
		const f = await settings(t, surface, [1920, 1080]);
		const hits = [], states = [];
		const visit = async (where) => { await f.evaluate(OPEN_ALL); await t.page.waitForTimeout(120); states.push(where); hits.push(...await scan(f, where)); };
		const domains = await f.evaluate(() => [...new Set([...document.querySelectorAll('#pm-settings-root .domain-link[data-domain]')].map((el) => el.getAttribute('data-domain')))]);
		for (const domain of domains) {
			await f.evaluate((d) => PM51.go(d, '__domain__'), domain);
			await t.page.waitForTimeout(250);
			const label = clean(await f.locator(`#pm-settings-root .domain-link[data-domain="${domain}"]`).first().innerText().catch(() => domain)).slice(0, 28);
			const workspaces = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .workspace-tab[data-workspace]')].map((el) => ({ id: el.getAttribute('data-workspace'), label: el.textContent.trim() })));
			for (const ws of workspaces) {
				await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws.id]);
				await f.waitForFunction((w) => { const b = document.querySelector(`[data-continuous-workspace-body="${w}"]`); return !!b && b.getAttribute('data-workspace-mounted') === 'true'; }, ws.id, { timeout: 15000 }).catch(() => {});
				await settled(f, ws.id);
				const where = `${label} › ${ws.label}`;
				await visit(where);
				const tabs = await f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .manager-tab[data-tab]`)].filter((b) => b.getClientRects().length).map((b) => ({ id: b.getAttribute('data-tab'), label: b.textContent.trim() })), ws.id);
				for (const tab of tabs) {
					const btn = f.locator(`[data-continuous-workspace-body="${ws.id}"] .manager-tab[data-tab="${tab.id}"]`).first();
					if (!(await btn.isVisible().catch(() => false))) continue;
					await btn.click().catch(() => {});
					await settled(f, ws.id, tab.id);
					await visit(`${where} › ${tab.label}`);
				}
			}
		}
		await t.check('the walk reached every chapter (40 or more states, Personas among them)', states.length >= 40 && states.some((s) => /Personas/.test(s)), `${states.length} states`);
		// an editable persona, its Details panels, New persona's every step and Try
		await goPersonas(t, f);
		await openPersona(t, f);
		await visit('Personas › Settings UX Reviewer');
		for (const id of [S.temp, S.topp, S.mode, S.perms]) {
			const about = rowOf(f, id).locator('.o55-about').first();
			if (!(await about.count())) continue;
			await about.scrollIntoViewIfNeeded();
			await about.click();
			await t.page.waitForTimeout(450);
			hits.push(...await scan(f, `Details of ${id}`, OVERLAY_ROOTS));
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(250);
		}
		await f.locator(`${BODY} [data-action="pm51-personas-try-open"]`).first().click();
		await t.page.waitForTimeout(450);
		hits.push(...await scan(f, 'Try Settings UX Reviewer', OVERLAY_ROOTS));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(250);
		const steps = await walkWizard(t, f, async (i, label) => { hits.push(...await scan(f, `New persona step ${i + 1} (${label})`, OVERLAY_ROOTS)); });
		await t.check('New persona was walked', steps.length >= 3, shown(steps));
		const seen = hits.map((x) => `${x.where} [${x.kind}${x.row ? ' ' + x.row : ''}]: ${x.text}`);
		await t.check('no text, choice or name says "Same as the project"', hits.length === 0, `${hits.length}: ${[...new Set(seen)].slice(0, 12).join(' | ')}`);
	});

	T('personas carry no model choice', async (t) => {
		const f = await settings(t, surface, [1920, 1080]);
		const ready = await f.evaluate(() => (PM51.readyModels ? PM51.readyModels() : []).map((m) => String(m.label || '').split(' · ')[0]).filter(Boolean));
		await t.check('the fixture has ready models to look for', ready.length > 0, `${ready.length}`);
		await goPersonas(t, f);
		await openPersona(t, f);
		const detail = f.locator(`${BODY} .pm51-detail`).first();
		const modelBits = async (scope, where) => scope.evaluate((root, [names, id]) => {
			const out = [];
			if (root.querySelector(`[data-setting-id="${id}"]`)) out.push('the Preferred model row');
			if (root.querySelector('.o55-msel, .o55-pick-trigger.is-model, .o55-pw-model')) out.push('a model picker');
			for (const el of root.querySelectorAll('.setting-label, .pm51-field-label')) if (/preferred model|which model/i.test(el.textContent)) out.push(`label "${el.textContent.trim()}"`);
			for (const sel of root.querySelectorAll('select')) { const hit = [...sel.options].find((o) => names.includes(o.textContent.trim().split(' · ')[0])); if (hit) out.push(`a list offering ${hit.textContent.trim()}`); }
			return out;
		}, [ready, S.model]).then((list) => list.map((x) => `${where}: ${x}`));
		const inDetail = await modelBits(detail, 'Settings UX Reviewer');
		await t.check('an editable persona draws no model choice', inDetail.length === 0, inDetail.join(' | '));
		const found = [];
		const steps = await walkWizard(t, f, async (i, label, n) => {
			found.push(...await modelBits(f.locator('.o55g-win').first(), `New persona step ${i + 1} (${label})`));
			if (t.args.shots && i === n - 1) await t.crop(`new-persona-last-step-${surface}`, f.locator('.o55g-win').first(), 'New persona, last step: no Model step after Answers');
		}, { finish: 'Release Scribe' });
		await t.check('New persona asks Start, Name, Answers and nothing about a model', shown(steps) === shown(['Start', 'Name', 'Answers']), shown(steps));
		await t.check('no New persona step offers a model', found.length === 0, found.join(' | '));
		// the new persona is selected; Try names the model its runs use: the Everyday model, as Settings › Models words it
		const made = await f.locator(`${BODY} .pm51-detail-title`).first().innerText().catch(() => '');
		await t.check('the persona made through New persona is open', clean(made) === 'Release Scribe', clean(made));
		const inMade = await modelBits(f.locator(`${BODY} .pm51-detail`).first(), 'Release Scribe');
		await t.check('the new persona draws no model choice', inMade.length === 0, inMade.join(' | '));
		await f.locator(`${BODY} [data-action="pm51-personas-try-open"]`).first().click();
		await t.page.waitForTimeout(450);
		if (t.args.shots) await t.crop(`try-${surface}`, f.locator('.drawer[aria-label^="Try "]').first(), 'Try on a new persona: the Model line names the Everyday model');
		const kv = await f.evaluate(() => [...document.querySelectorAll('.drawer[aria-label^="Try "] .pm51-kv-row')].filter((r) => r.getClientRects().length).map((r) => [...r.children].map((c) => c.textContent.replace(/\s+/g, ' ').trim())));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(250);
		const everyday = await sourceWords(t, f, SRC.model);
		const want = `${everyday.label} · ${everyday.value} (set in Settings › Models)`;
		const line = kv.find((r) => r[0] === 'Model');
		await t.check('Try reads "Model: Everyday model · <its model> (set in Settings › Models)"', !!line && line[1] === want, `${shown(line)} want ${want}`);
		await t.check('Try has no Preferred model line', !kv.some((r) => /preferred model/i.test(r[0])), shown(kv.map((r) => r[0])));
	});

	for (const [w, h] of [[1280, 900], [740, 900]]) {
		T(`inherit choices name their source and its value (${w}x${h})`, async (t) => {
			if (!sizesOf(t).some(([a, b]) => a === w && b === h)) { await t.check(`${w}x${h} not asked for`, true); return; }
			const f = await settings(t, surface, [w, h]);
			// read on Personas first, before Permissions has ever been opened
			await goPersonas(t, f);
			await openPersona(t, f);
			const permsFace = clean(await ddFace(rowOf(f, S.perms)).innerText().catch(() => ''));
			const modeFace = clean(await ddFace(rowOf(f, S.mode)).innerText().catch(() => ''));
			const modeFirst = await rowOf(f, S.mode).evaluate((r) => { const sel = r.querySelector('select'); const o = sel && [...sel.options].find((x) => x.value === 'inherit'); return { inherit: o ? o.textContent.trim() : null, words: sel ? Object.fromEntries([...sel.options].map((x) => [x.value, x.textContent.trim()])) : {} }; });
			const permChoices = await rowOf(f, S.perms).evaluate((r) => { const sel = r.querySelector('select'); return sel ? [...sel.options].filter((o) => o.value !== 'inherit').map((o) => o.textContent.trim()) : []; });
			const tempLine = clean(await followLine(rowOf(f, S.temp)).innerText().catch(() => ''));
			const toppLine = clean(await followLine(rowOf(f, S.topp)).innerText().catch(() => ''));
			const cuts = [];
			for (const [name, loc] of [['Starts by', ddFace(rowOf(f, S.mode))], ['What it may do', ddFace(rowOf(f, S.perms))], ['Creativity', followLine(rowOf(f, S.temp))], ['Word choice range', followLine(rowOf(f, S.topp))]]) {
				if (!(await loc.count())) continue;
				await loc.scrollIntoViewIfNeeded().catch(() => {});
				const c = await cut(loc);
				if (c.cut) cuts.push(`${name} ${shown(c)}`);
			}
			// the Details panel of Creativity lists this persona in the row's words
			const about = rowOf(f, S.temp).locator('.o55-about').first();
			await about.scrollIntoViewIfNeeded();
			await about.click();
			await t.page.waitForTimeout(500);
			const per = await f.evaluate(() => [...document.querySelectorAll('.o55-insp-per li')].filter((li) => li.getClientRects().length).map((li) => [...li.children].map((c) => c.textContent.trim())));
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(250);
			// the sources, read on their own pages
			const temp = await sourceWords(t, f, SRC.temp);
			const topp = await sourceWords(t, f, SRC.topp);
			const run = await sourceWords(t, f, SRC.mode);
			await f.evaluate(() => PM51.revealSetting('safety.rules.permission-preset'));
			await f.waitForSelector('[data-continuous-workspace-body="permissions"][data-workspace-mounted="true"]', { timeout: 15000 });
			const ptab = f.locator('[data-continuous-workspace-body="permissions"] .manager-tab[data-tab="profiles"]').first();
			if (await ptab.isVisible().catch(() => false)) { await ptab.click(); await settled(f, 'permissions', 'profiles'); }
			await t.page.waitForTimeout(400);
			const inUse = await f.evaluate(() => {
				const d = document.querySelector('[data-continuous-workspace-body="permissions"] .pm51-detail');
				const pill = d && [...d.querySelectorAll('.pm51-status')].find((x) => /In use/.test(x.textContent));
				if (!pill) return null;
				const title = d.querySelector('.pm51-detail-title').cloneNode(true);
				title.querySelectorAll('.pm51-status, .pm51-pill, .pm-status-mark').forEach((x) => x.remove());
				return title.textContent.replace(/\s+/g, ' ').trim();
			});
			const wantTemp = `${temp.value} · from ${temp.label}`, wantTopp = `${topp.value} · from ${topp.label}`;
			await t.check(`Creativity names what it follows: "${wantTemp}"`, tempLine === wantTemp && !!temp.label && !!temp.value, `shown "${tempLine}"`);
			await t.check(`Word choice range names what it follows: "${wantTopp}"`, toppLine === wantTopp && !!topp.label && !!topp.value, `shown "${toppLine}"`);
			const modeWord = modeFirst.words[String(run.raw || '').toLowerCase()];
			const wantMode = `Same as new agent runs · ${modeWord}`;
			await t.check(`Starts by's face and first choice read "${wantMode}"`, !!modeWord && modeFace === wantMode && modeFirst.inherit === wantMode, shown({ face: modeFace, choice: modeFirst.inherit, run }));
			const wantPerms = `Same as Profile in use · ${inUse}`;
			await t.check(`What it may do without asking reads "${wantPerms}", a profile it offers`, !!inUse && permsFace === wantPerms && permChoices.includes(inUse), shown({ face: permsFace, inUse, permChoices }));
			const mine = per.find((r) => r[0] === 'Settings UX Reviewer');
			await t.check('the Details panel lists the persona in the same words', !!mine && mine[1] === wantTemp, shown(per.slice(0, 6)));
			await t.check('no followed value is cut by its box', cuts.length === 0, cuts.join(' | '));
			// a real press on New agent runs start in: Plan only; Starts by follows when Personas is opened again
			const runRow = f.locator(`[id="setting-${SRC.mode}"], [data-setting-id="${SRC.mode}"]`).first();
			await f.evaluate((i) => PM51.revealSetting(i), SRC.mode);
			await t.page.waitForTimeout(400);
			const plan = runRow.getByRole('radio', { name: 'Plan only' }).first();
			if (await plan.count()) { await plan.scrollIntoViewIfNeeded(); await plan.click(); }
			else await runRow.locator('select').first().selectOption('Plan');
			await t.page.waitForTimeout(400);
			const runNow = await f.evaluate((i) => PM51.value(i), SRC.mode);
			await goPersonas(t, f);
			await openPersona(t, f);
			const modeAfter = clean(await ddFace(rowOf(f, S.mode)).innerText().catch(() => ''));
			await t.check('after Plan only, Starts by reads "Same as new agent runs · Planning first"', runNow === 'Plan' && modeAfter === 'Same as new agent runs · Planning first', shown({ runNow, modeAfter }));
			// Set its own, then the way back names what it goes back to
			await rowOf(f, S.temp).locator('[data-action="pm51-personas-own"]').first().click();
			await t.page.waitForTimeout(500);
			const back = rowOf(f, S.temp).locator('[data-action="pm51-personas-inherit"]').first();
			const backText = clean(await back.innerText().catch(() => ''));
			const wantBack = `Same as ${temp.label} · ${temp.value}`;
			await t.check(`Set its own offers "${wantBack}" back`, backText === wantBack, `shown "${backText}"`);
			await back.click();
			await t.page.waitForTimeout(500);
			const again = clean(await followLine(rowOf(f, S.temp)).innerText().catch(() => ''));
			await t.check('pressing it returns Creativity to following', again === wantTemp, `shown "${again}"`);
			if (t.args.shots) {
				await t.page.waitForTimeout(2400);
				const sec = rowOf(f, S.temp).locator('xpath=ancestor::section[1]');
				await t.crop(`personas-model-and-cost-${w}-${surface}`, sec, 'Model and cost on an editable persona: Creativity and Word choice range name what they follow');
				const sec2 = rowOf(f, S.mode).locator('xpath=ancestor::section[1]');
				await t.crop(`personas-how-it-answers-${w}-${surface}`, sec2, 'How it answers: Starts by names new agent runs and its value');
			}
			if (t.args.dump) fs.writeFileSync(`${t.args.dump}-${w}-${surface}.json`, JSON.stringify({ tempLine, toppLine, modeFace, permsFace, per, temp, topp, run, inUse }, null, 1));
		});
	}
}

// New persona from the Personas page's add menu: Blank start, then every step to the end. Returns the step names.
// With `finish`, it names the persona and creates it; otherwise it closes the window on the last step.
async function walkWizard(t, f, onStep, { finish } = {}) {
	await f.locator(`${BODY} [data-action="pm51-personas-add"]`).first().click();
	await t.page.waitForTimeout(350);
	await f.locator('.o55-mgp-menu [role="menuitem"], .o55-mgp-menu button', { hasText: /^\s*New persona/ }).first().click();
	await f.waitForSelector('.o55g-win', { timeout: 8000 });
	await t.page.waitForTimeout(500);
	const labels = (await f.locator('.o55g-win .o55g-raillabel').allTextContents()).map((s) => s.trim());
	for (let i = 0; i < labels.length; i++) {
		await t.page.waitForTimeout(450);
		await onStep(i, labels[i], labels.length);
		if (i === 0) { await f.locator('.o55g-win .o55g-card', { hasText: /^\s*Blank/ }).first().click(); continue; }   // a card moves on by itself
		if (labels[i] === 'Name') await f.locator('.o55g-win .o55-pw-name').fill(finish || 'Step Walker');
		if (i === labels.length - 1 && !finish) break;
		await f.locator('.o55g-win .o55g-primary').first().click();
	}
	if (!finish) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(400); }
	else { await f.waitForSelector('.o55g-win', { state: 'detached', timeout: 8000 }).catch(() => {}); await t.settle(); await t.page.waitForTimeout(500); }
	return labels;
}
