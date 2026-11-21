// Checks of the refined Settings managers (Concepts/settings-managers/fable-5.2-refine), by real clicks.
//   browser-check run Concepts/settings-managers/fable-5.2-refine/tools --set page=<refined page>
//     [--set before=<PMConcept7 page of the same base>]     needed by "nothing was dropped"
// Each test says what a person sees. A test that needs the unchanged page for comparison says so and is skipped
// without it, never passed.
const sleep = (f, ms) => f.waitForTimeout(ms);
const T = `(n) => (n ? n.textContent : '').replace(/\\s+/g, ' ').trim()`;

async function openSettings(t, size = [1600, 1000]) {
	await t.viewport(size[0], size[1]);
	const f = await t.app.open({ settleMs: 1500 });
	await f.locator('#tab-settings').click();
	await f.waitForSelector('#pm-settings-root .domain-link', { timeout: 20000 });
	await sleep(f, 600);
	return f;
}
const go = async (f, domain, ws) => { await f.evaluate(([d, w]) => window.PM51.go(d, w), [domain, ws]); await sleep(f, 1300); };
const block = (ws) => `#pm-settings-root .workspace-block[data-workspace-block="${ws}"]`;
const tab = async (f, ws, id) => { await f.locator(`${block(ws)} [role="tab"][data-action="pm51-tab"][data-tab="${id}"]`).first().click(); await sleep(f, 900); };
const shown = (f, sel) => f.evaluate((sel) => [...document.querySelectorAll(sel)].filter((n) => n.getClientRects().length && getComputedStyle(n).visibility !== 'hidden').length, sel);
async function closeAll(f) {
	for (let i = 0; i < 4; i++) {
		const b = f.locator('.pmt-cz-done:visible, .drawer-wrap:not([data-closing="1"]) .pm51-panel-close:visible, .overlay [data-action="close-overlay"]:visible').first();
		if (!(await b.count()) || !(await b.isVisible().catch(() => false))) break;
		await b.click().catch(() => {}); await sleep(f, 600);
	}
}
/* every setting row and every action of every Settings view: the page's own list of chapters and managers is walked */
async function inventory(f) {
	return f.evaluate(async () => {
		const wait = (ms) => new Promise((r) => setTimeout(r, ms));
		const ids = new Set(), actions = new Set(), views = [];
		for (const d of window.PM12_DATA.domains) for (const w of d.workspaces) {
			if (w.virtualAllSettings) continue;
			window.PM12_KIMI.navigate(d.id, w.id); await wait(1200);
			const find = () => [...document.querySelectorAll('#pm-settings-root .workspace-block')].find((b) => b.dataset.workspaceBlock === w.id);
			let b = find(); if (!b) continue;
			const tabs = [...b.querySelectorAll('[role=tablist]')].filter((n) => n.getClientRects().length)[0];
			const n = tabs ? tabs.querySelectorAll('[role=tab]').length : 1;
			for (let i = 0; i < n; i++) {
				if (tabs) { find().querySelectorAll('[role=tablist]')[0].querySelectorAll('[role=tab]')[i].click(); await wait(900); }
				b = find(); if (!b) break;
				views.push(`${d.id}/${w.id}/${i}`);
				b.querySelectorAll('[id^="setting-"], [data-setting-id]').forEach((r) => ids.add((r.id && r.id.indexOf('setting-') === 0 ? r.id.slice(8) : '') || r.getAttribute('data-setting-id')));
				b.querySelectorAll('[data-action]').forEach((x) => actions.add(x.getAttribute('data-action')));
			}
		}
		return { ids: [...ids].sort(), actions: [...actions].sort(), views };
	});
}

export const tests = {
	async 'Servers & Remote Access is a chapter of its own, and old ways in still arrive'(t) {
		const f = await openSettings(t);
		const rail = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .domain-list .domain-link .domain-name')].map((n) => n.textContent.trim()));
		const at = rail.indexOf('Servers & Remote Access');
		await t.check('the chapter list names it, right under AI & Providers', at > 0 && rail[at - 1] === 'AI & Providers', rail.join(' | '));
		await f.locator('#pm-settings-root .domain-link', { hasText: 'Servers & Remote Access' }).first().click();
		await sleep(f, 1300);
		const tabs = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} [role="tab"][data-action="pm51-tab"]`)].map((n) => n.textContent.trim()), block('servers'));
		await t.check('it is the same manager with its five tabs', tabs.join('|') === 'Home & Location|Servers|Devices|Away From Home|Move & Copy', tabs.join('|'));
		await t.check('a chapter with one manager has no chapter tab strip', (await shown(f, '#pm-settings-root .workspace-tabs .workspace-tab')) === 0);
		await f.locator('#pm-settings-root .domain-link', { hasText: 'System' }).first().click(); await sleep(f, 1300);
		const sys = await f.evaluate(() => [...document.querySelectorAll('#pm-settings-root .workspace-tabs .workspace-tab')].map((n) => n.textContent.trim()));
		await t.check('System no longer lists it', sys.length >= 4 && !sys.some((x) => /Server/.test(x)), sys.join(' | '));
		await f.evaluate(() => window.PM51.go('system', 'servers')); await sleep(f, 1300);
		const st = await f.evaluate(() => { const s = window.PM12_KIMI.getState(); return { domain: s.domain, ws: s.workspace }; });
		await t.check('an old link to System › servers lands on the new chapter', st.domain === 'servers-access' && st.ws === 'servers', JSON.stringify(st));
	},

	async 'Explain: sentences are asked for, and the choice is kept'(t) {
		const f = await openSettings(t);
		await go(f, 'servers-access', 'servers');
		const help = `${block('servers')} .pm51-row-help`;
		await t.check('there are sentences to show', (await f.locator(help).count()) > 0);
		await t.check('off at first: a row is its name and its control', (await shown(f, help)) === 0);
		await f.locator('#pm-settings-root [data-action="pm51-rf-explain"]').first().click(); await sleep(f, 400);
		await t.check('on: the sentences show', (await shown(f, help)) > 0);
		await t.check('the button says it is on', (await f.locator('#pm-settings-root [data-action="pm51-rf-explain"]').first().getAttribute('aria-pressed')) === 'true');
		await go(f, 'general', 'app-input');
		await t.check('it stays on on another page', (await shown(f, `${block('app-input')} .setting-description`)) > 0);
		await f.locator('#pm-settings-root [data-action="pm51-rf-explain"]').first().click(); await sleep(f, 400);
		await t.check('off again: none show', (await shown(f, `${block('app-input')} .setting-description`)) === 0);
		await t.check('the row\'s own About button is still there', (await shown(f, `${block('app-input')} .o55-about`)) > 10);
	},

	async 'left as Jared asked: the tab strips are centred and the side column lists the chapter'(t) {
		const f = await openSettings(t, [1920, 1080]);
		await go(f, 'ai', 'providers');
		const got = await f.evaluate((sel) => {
			const mid = (r) => r.left + r.width / 2;
			const strip = document.querySelector('#pm-settings-root .workspace-tabs'), tabs = [...strip.querySelectorAll('.workspace-tab')];
			const first = tabs[0].getBoundingClientRect(), last = tabs[tabs.length - 1].getBoundingClientRect(), sr = strip.getBoundingClientRect();
			const page = document.querySelector(`${sel} .pm51-mgr > .pm51-tabs`), body = document.querySelector(`${sel} .pm51-mgr`);
			const index = document.querySelector('#pm-settings-root .page-index');
			return { top: Math.round((first.left + last.right) / 2 - mid(sr)), page: Math.round(mid(page.getBoundingClientRect()) - mid(body.getBoundingClientRect())),
				index: !!index && index.getClientRects().length > 0, groups: [...document.querySelectorAll('#pm-settings-root .page-index .pm51-index-group')].filter((n) => n.getClientRects().length).length };
		}, block('providers'));
		await t.check('the chapter\'s tab strip is centred (FO-184)', Math.abs(got.top) <= 3, `${got.top} px off`);
		await t.check('the manager\'s tab strip is centred (FO-184)', Math.abs(got.page) <= 3, `${got.page} px off`);
		await t.check('the side column is there on a manager with tabs, with every manager of the chapter (FO-185)', got.index && got.groups === 4, JSON.stringify(got));
	},

	async 'Servers › Home & Location: facts on one line, then the three choices'(t) {
		const f = await openSettings(t);
		await go(f, 'servers-access', 'servers'); await tab(f, 'servers', 'home');
		const got = await f.evaluate((sel) => {
			const b = document.querySelector(sel), T = (n) => (n ? n.textContent : '').replace(/\s+/g, ' ').trim();
			return { facts: [...b.querySelectorAll('.rf-facts .rf-fact')].map(T), rows: [...b.querySelectorAll('.pm51-section .pm51-row-label')].filter((n) => !n.closest('details')).map(T) };
		}, block('servers'));
		await t.check('the facts line says how it is connected and which device this is', got.facts.length >= 3 && /Connected/.test(got.facts[0]) && got.facts.some((x) => /This device/.test(x)), got.facts.join(' | '));
		await t.check('the rows are Home server, Runs on and Files', got.rows.join('|') === 'Home server|Runs on|Files', got.rows.join('|'));
	},

	async 'Limits & switching is the one home of a service\'s switching rules'(t) {
		const f = await openSettings(t);
		await go(f, 'ai', 'providers'); await tab(f, 'providers', 'limits');
		const rows = await f.evaluate((sel) => [...document.querySelectorAll(`${sel} .rf-policy-row`)].map((r) => ({ name: r.querySelector('.setting-label').textContent.trim(), toggles: r.querySelectorAll('.toggle').length, fields: r.querySelectorAll('.pm51-dd').length })), block('providers'));
		await t.check('each service with two accounts has a line', rows.length >= 2, JSON.stringify(rows));
		await t.check('each line has its switch and its three rules', rows.every((r) => r.toggles === 1 && r.fields === 3), JSON.stringify(rows));
		const first = f.locator(`${block('providers')} .rf-policy-row`).first();
		const was = await first.locator('.toggle').getAttribute('aria-checked');
		await first.locator('.toggle').click(); await sleep(f, 700);
		const now = await f.locator(`${block('providers')} .rf-policy-row`).first().locator('.toggle').getAttribute('aria-checked');
		await t.check('its switch works here', was !== now, `${was} -> ${now}`);
		await t.check('a service with its own rule offers the shared one back', (await f.locator(`${block('providers')} .rf-policy-row`).first().locator('.rf-policy-reset').count()) === 1);
		await f.locator(`${block('providers')} .rf-policy-row`).first().locator('.rf-policy-reset').click(); await sleep(f, 700);
		const back = await f.locator(`${block('providers')} .rf-policy-row`).first().locator('.toggle').getAttribute('aria-checked');
		await t.check('and taking it puts the switch back', back === was, `${now} -> ${back}`);
		await tab(f, 'providers', 'services');
		await t.check('the service\'s own page does not repeat them', (await f.locator(`${block('providers')} .o55-policy-fields`).count()) === 0);
	},

	async 'Editor and Terminal Customize: the example stays beside the options and names the change'(t) {
		const f = await openSettings(t);
		for (const [name, action] of [['Editor', 'pm51-o55-editor-customize'], ['Terminal', 'pm51-o55-terminal-customize']]) {
			await go(f, 'code', 'editor-runtime');
			const btn = f.locator(`#pm-settings-root [data-action="${action}"]`).first();
			await btn.scrollIntoViewIfNeeded(); await btn.click();
			/* the editor's and the terminal's dialogs can both be in the page: the one showing is the one at the middle of the window */
			await f.waitForFunction(() => { const at = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return !!(at && at.closest('.pmt-cz-dialog')); }, null, { timeout: 15000 }); await sleep(f, 1800);
			const read = () => f.evaluate(() => {
				const at = document.elementFromPoint(innerWidth / 2, innerHeight / 2), d = at && at.closest('.pmt-cz-dialog'); if (!d) return null;
				const body = d.querySelector('.pmt-cz-body'), pv = d.querySelector('.pmt-cz-top > .pmt-cz-preview'), dock = d.querySelector('.pmt-cz-dock');
				const br = body.getBoundingClientRect(), pr = pv.getBoundingClientRect();
				return { width: Math.round(d.getBoundingClientRect().width), scrollTop: Math.round(body.scrollTop), max: body.scrollHeight - body.clientHeight,
					inView: pr.top >= br.top - 2 && pr.bottom <= br.bottom + 2 && pr.height > 150, right: pr.left > br.left + br.width * 0.45,
					dock: !!(dock && dock.getClientRects().length), line: (d.querySelector('.rf-changed') || {}).textContent || '' };
			});
			const top = await read();
			await t.check(`${name}: the dialog is wide enough for two columns`, !!top && top.width >= 1040, JSON.stringify(top));
			await t.check(`${name}: the example is in the right column`, !!top && top.right && top.inView);
			await f.evaluate(() => { const b = document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('.pmt-cz-dialog').querySelector('.pmt-cz-body'); b.style.scrollBehavior = 'auto'; b.scrollTop = b.scrollHeight; });
			await sleep(f, 900);
			const end = await read();
			await t.check(`${name}: at the end of the options the example is still whole and in view`, !!end && end.scrollTop > 1000 && end.inView, JSON.stringify(end));
			await t.check(`${name}: no small copy floats over the options`, !!end && !end.dock);
			await f.evaluate(() => { const b = document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('.pmt-cz-dialog').querySelector('.pmt-cz-body'); b.scrollTop = 0; });
			await sleep(f, 600);
			const tile = f.locator('.pmt-cz-dialog .pmt-cz-body .pmt-cz-tile[aria-checked="false"]:visible').first();
			const tname = (await tile.locator('.pmt-cz-tname').first().textContent()).trim();
			await tile.scrollIntoViewIfNeeded(); await tile.click(); await sleep(f, 500);
			const after = await read();
			await t.check(`${name}: the line under the example names what was changed`, !!after && /^Changed/.test(after.line) && after.line.includes(tname), `${tname} / ${after && after.line}`);
			await closeAll(f); await sleep(f, 600);
			await t.check(`${name}: closing leaves you in Settings`, (await f.evaluate(() => window.PM_PAGES.current)) === 'settings');
		}
	},

	async 'Customize Pip and Adjust NieR: the picture stays, and Pip shows where it appears'(t) {
		const f = await openSettings(t);
		await go(f, 'general', 'app-input');
		await f.evaluate(() => window.PM_PIP_EDITOR.open()); await f.waitForSelector('.pipe-panel .pipe', { timeout: 15000 }); await sleep(f, 1200);
		const read = (panel, pic) => f.evaluate(([panel, pic]) => {
			const p = document.querySelector(panel), body = p.querySelector('.pm51-panel-body'), s = p.querySelector(pic);
			const br = body.getBoundingClientRect(), sr = s.getBoundingClientRect();
			return { width: Math.round(p.getBoundingClientRect().width), scrollTop: Math.round(body.scrollTop), inView: sr.top >= br.top - 2 && sr.bottom <= br.bottom + 2 && sr.height > 60, right: sr.left > br.left + br.width * 0.5 };
		}, [panel, pic]);
		const end = async (panel) => { await f.evaluate((panel) => { const b = document.querySelector(panel + ' .pm51-panel-body'); b.style.scrollBehavior = 'auto'; b.scrollTop = b.scrollHeight; }, panel); await sleep(f, 800); };
		await end('.pipe-panel');
		const pip = await read('.pipe-panel', '.pipe-top .pipe-stage');
		await t.check('Pip: scrolled to the last part, the team is still whole and in view, on the right', pip.scrollTop > 300 && pip.inView && pip.right, JSON.stringify(pip));
		await t.check('Pip: no small copy floats over the parts', (await shown(f, '.pipe-panel .pipe-dock')) === 0);
		const scenes = await f.evaluate(() => [...document.querySelectorAll('.pipe-panel .rf-where-tile')].map((x) => ({ id: x.dataset.rfWhere, on: x.classList.contains('is-on'), pip: !!x.querySelector('.rf-where-pip') && x.querySelector('.rf-where-pip').getClientRects().length > 0 })));
		await t.check('Pip: six scenes show where Pip appears', scenes.length === 6, JSON.stringify(scenes));
		await t.check('Pip: Pip is in a scene exactly while that part is on', scenes.every((s) => s.on === s.pip), JSON.stringify(scenes));
		await f.evaluate(() => { document.querySelector('.pipe-panel .pm51-panel-body').scrollTop = 0; }); await sleep(f, 400);
		const chip = f.locator('.pipe-panel .pipe-chip[data-pipe-part="working-orbit"]');
		const before = await chip.getAttribute('aria-checked');
		await chip.scrollIntoViewIfNeeded(); await chip.click(); await sleep(f, 500);
		const s2 = await f.evaluate(() => { const x = document.querySelector('.pipe-panel .rf-where-tile[data-rf-where="working-orbit"]'); return { on: x.classList.contains('is-on'), pip: x.querySelector('.rf-where-pip').getClientRects().length > 0, line: (document.querySelector('.pipe-panel .rf-changed') || {}).textContent || '' }; });
		await t.check('Pip: switching Working orbit changes its scene', s2.on === (before !== 'true') && s2.pip === s2.on, JSON.stringify(s2));
		await t.check('Pip: the line names it', /Working orbit/.test(s2.line), s2.line);
		await chip.click(); await sleep(f, 400);
		await closeAll(f);
		await f.evaluate(() => window.PM_NIER_CHIPS.open()); await f.waitForSelector('.o55nc-panel .o55nc', { timeout: 15000 }); await sleep(f, 1200);
		await end('.o55nc-panel');
		const nier = await read('.o55nc-panel', '.o55nc-top > :first-child');
		await t.check('NieR: scrolled to the last chip, the picture is still whole and in view, on the right', nier.scrollTop > 300 && nier.inView && nier.right, JSON.stringify(nier));
		await closeAll(f);
	},

	async 'nothing was dropped: every setting and every action of the unchanged page is still on a page'(t) {
		if (!t.args.before) { t.log('SKIPPED: pass --set before=<the unchanged PMConcept7 page of the same base> to run this comparison'); await t.check('needs --set before=<page>', false, 'not run'); return; }
		const f = await openSettings(t);
		const mine = await inventory(f);
		/* the unchanged page is opened the way the kit opens the page under test: fresh, with the first-run setup off */
		await t.goto(`${t.args.before}${t.args.before.includes('?') ? '&' : '?'}cb=${Date.now()}&o55=off`, { settleMs: 1500 });
		await t.until('the unchanged page is ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
		const f2 = t.root === t.page ? t.page.mainFrame() : t.root;
		await f2.locator('#tab-settings').click(); await f2.waitForSelector('#pm-settings-root .domain-link', { timeout: 20000 }); await sleep(f2, 800);
		const theirs = await inventory(f2);
		const lostIds = theirs.ids.filter((x) => !mine.ids.includes(x));
		/* actions that left with a repeat (README, "Removed because it was there twice"): the arrow that only opened a
		   service from Limits & switching; nothing else */
		const allowed = new Set(['pm51-providers-policy-open']);
		const lostActions = theirs.actions.filter((x) => !mine.actions.includes(x) && !allowed.has(x));
		t.log(`views ${theirs.views.length} -> ${mine.views.length}; setting ids ${theirs.ids.length} -> ${mine.ids.length}; actions ${theirs.actions.length} -> ${mine.actions.length}`);
		await t.check('the same number of views', theirs.views.length === mine.views.length, `${theirs.views.length} / ${mine.views.length}`);
		await t.check('every setting is still drawn somewhere', lostIds.length === 0, lostIds.join(', '));
		await t.check('every action is still offered somewhere', lostActions.length === 0, lostActions.join(', '));
	}
};
