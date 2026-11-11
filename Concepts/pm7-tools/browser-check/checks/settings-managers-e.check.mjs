// Stream F batch 11, lane E: the verified defects of PMConcept7's Settings managers for Memory & Automation (Context
// & Memory, Goals, Personas & Crews, Planning), Code & tools (Testing & Debug, the Docker sections) and Notifications
// (OPEN-AND-FOUND.md section F, lanes memory, codework and notify). Every click is scoped to the manager that owns the
// control: Settings mounts every manager of a chapter on one page, so a click by text anywhere in Settings can land in
// another manager (the first audit driver's fault).
//   D1  a test profile's moment is one answer: Edit's Moment and "When tests run" agree, and so do the gate details;
//   D2  "Open Servers" on Docker on this computer opens Server & Project Location on its Servers tab (was "Open Hosts",
//       which opened the first tab);
//   D3  an empty list editor says its plural ("No categories yet.", never "No categorys yet.");
//   D4/R2 Connect Docker Hub follows "How to sign in to Docker Hub", and the access token has one home;
//   D5  "How testing works" says what happens to secrets as "Hide secrets and personal data in proof" is set;
//   D6  "Show debug permissions" lists the powers "Debugging may, without asking" offers, each as it is set;
//   D7 / notify 9  the demo's research run finishing is a notice from the chat, never a quiet toast;
//   D8 / memory 4  no "workspace" for a project or a working copy in these managers' panels and rows;
//   notify 2  every notification agent watches alerts that exist, and "Watches N alerts" counts them;
//   notify 3  quiet hours' Start and End can't be the same time;
//   notify 4  "Still reaches you › Change" sets each destination's quiet-hours choice right there;
//   notify 5-7 Upload file and Replace file need a file, and keep a sound's name and kind;
//   notify 8  a destination just added reads "Saved, not tested yet"; agents are called agents; Import events names no workspace;
//   memory 1  "Pause between rounds" is under Chat Room;
//   memory 2/3 the plan question limits point at Group work, and no help ends in a stray default "(20)" or "(25)";
//   memory 5  a rule pack that could not load is never hidden by Show and can be fixed or removed;
//   memory 7  the fade-time editor names each kind of note, never CurrentThread / Blocker / Constraint;
//   memory 9  "Pick up where it left off" steps aside while Save progress is Never.
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

async function settings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
const BODY = (ws) => `[data-continuous-workspace-body="${ws}"]`;
async function go(t, f, domain, ws) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws]);
	await f.waitForSelector(`${BODY(ws)}[data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}
// a setting's own row, reached the way search reaches it (its chapter, page and tab)
async function reveal(t, f, id) {
	await f.evaluate((i) => PM51.revealSetting(i), id);
	await f.waitForSelector(`[id="setting-${id}"]`, { state: 'attached', timeout: 15000 });
	await t.settle();
	await t.page.waitForTimeout(400);
	return f.locator(`[id="setting-${id}"]`).first();
}
async function tab(t, f, ws, label) {
	const b = f.locator(`${BODY(ws)} .pm51-tabs .manager-tab`, { hasText: new RegExp(`^\\s*${label}\\s*$`) }).first();
	await b.scrollIntoViewIfNeeded();
	await b.click();
	await t.settle();
	await t.page.waitForTimeout(500);
}
const drawer = (f) => f.locator('.drawer-wrap').last();
async function drawerText(f) { return (await drawer(f).innerText().catch(() => '')).replace(/\s+/g, ' '); }
async function closeDrawers(t, f) {
	for (let i = 0; i < 3; i++) {
		if (!(await f.locator('.drawer-wrap, .overlay').count())) return;
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(350);
	}
}
// an upgraded dropdown: its trigger, then the option by its words
async function pick(t, f, select, name) {
	const trigger = select.locator('..').locator('.pm51-dd-trigger').first();
	await trigger.scrollIntoViewIfNeeded();
	await trigger.click();
	await f.getByRole('option', { name, exact: true }).first().click({ timeout: 8000 });
	await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
	await t.settle();
	await t.page.waitForTimeout(400);
}
async function menuItem(t, f, label) {
	await f.locator('.popover .menu-item', { hasText: new RegExp(`^\\s*${label}`) }).first().click({ timeout: 8000 });
	await t.settle();
	await t.page.waitForTimeout(400);
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('D3 an empty list says its plural', async (t) => {
		const f = await settings(t, surface);
		const row = await reveal(t, f, 'code.execution.app-template-categories');
		const btn = row.locator('.o55-struct').first();
		const label = await btn.getAttribute('aria-label');
		await btn.scrollIntoViewIfNeeded();
		await btn.click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(400);
		const empty = (await drawer(f).locator('.o55-le-empty').innerText().catch(() => '')).trim();
		await t.check('Store categories: the row and its editor say "No categories yet"', /No categories yet/.test(label || '') && empty === 'No categories yet.' && !/categorys/i.test(empty + label), `row "${label}", editor "${empty}"`);
		await closeDrawers(t, f);
	});

	T('D2 Open Servers opens the computers', async (t) => {
		const f = await settings(t, surface);
		const row = await reveal(t, f, 'code.execution.container-runtime');
		const line = f.locator(`${BODY('code-reference')} .o55-owner-line`).first();
		await line.scrollIntoViewIfNeeded();
		const text = (await line.innerText()).replace(/\s+/g, ' ');
		const btn = line.locator('button', { hasText: /Open (Hosts|Servers)/ }).first();
		const btnText = (await btn.innerText()).trim();
		await btn.click();
		await f.waitForSelector(`${BODY('servers')}[data-workspace-mounted="true"]`, { timeout: 15000 });
		await t.settle();
		await t.page.waitForTimeout(800);
		const active = (await f.locator(`${BODY('servers')} .pm51-tabs .manager-tab.active`).first().innerText().catch(() => '')).trim();
		await t.check('the owner line names Servers, not Hosts', !/\bHosts\b/.test(text) && btnText === 'Open Servers', `"${text}"`);
		await t.check('Open Servers lands on Server & Project Location › Servers', active === 'Servers', `active tab "${active}"`);
		void row;
	});

	T('D1 a test profile has one moment', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'code', 'testing');
		const B = f.locator(BODY('testing'));
		await tab(t, f, 'testing', 'Profiles');
		await B.locator('[data-action="pm51-testing-pick"][data-id="thorough"]').first().click();
		await t.settle();
		await B.locator('.pm51-detail-actions [aria-label="More actions"]').first().click();
		await menuItem(t, f, 'Edit');
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await pick(t, f, drawer(f).locator('select[data-field="trigger"]'), 'After meaningful edits');
		await drawer(f).locator('.pm51-panel-foot .btn.primary').click();
		await t.settle();
		await t.page.waitForTimeout(600);
		const when = (await B.locator('.pm51-row', { has: f.locator('.pm51-row-label', { hasText: /^\s*When it runs\s*$/ }) }).first().locator('.pm51-row-value').innerText().catch(() => '')).trim();
		await tab(t, f, 'testing', 'When to test');
		const sel = async (label) => (await B.locator(`select[aria-label="${label}"]`).first().evaluate((s) => s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '').catch(() => ''));
		const after = await sel('After meaningful edits'), before = await sel('Before completion');
		const gate = await B.evaluate((b) => b.textContent.replace(/\s+/g, ' '));
		await t.check('Thorough verification set to run "After meaningful edits" in Edit', when === 'After meaningful edits', `When it runs "${when}"`);
		await t.check('When tests run agrees: After meaningful edits runs it, Before completion no longer does', after === 'Thorough verification' && before !== 'Thorough verification', `after "${after}", before "${before}"`);
		await t.check('the gate details no longer name it for completion', !/Blocks completion until Thorough verification passes/.test(gate), gate.slice(gate.indexOf('Before completion'), gate.indexOf('Before completion') + 80));
	});

	T('D4 R2 Connect Docker Hub follows the sign-in method', async (t) => {
		const f = await settings(t, surface);
		const row = await reveal(t, f, 'code.execution.dockerhub-signin');
		await row.locator('button', { hasText: 'Connect Docker Hub' }).first().click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(400);
		const tokenFirst = await drawerText(f);
		const fields = await drawer(f).locator('input[type="password"], input[data-key="username"]').count();
		await t.check('with "Paste an access token": no user name or token form of its own; it points at the token row', fields === 0 && /Docker Hub access token/.test(tokenFirst), `inputs ${fields}; "${tokenFirst.slice(0, 160)}"`);
		await drawer(f).locator('.pm51-panel-foot .btn.primary').click();          // "Add the token": the token row's own key panel
		await t.settle();
		await t.page.waitForTimeout(600);
		const keyPanel = await drawerText(f);
		const keyInput = drawer(f).locator('.o55-keyinput');
		await t.check('"Add the token" opens the "Docker Hub access token" key panel', (await keyInput.count()) === 1 && /Docker Hub access token/.test(keyPanel), keyPanel.slice(0, 120));
		if (await keyInput.count()) {
			await keyInput.fill('dckr_pat_example');
			await drawer(f).locator('.pm51-panel-foot .btn.primary').click();
			await t.settle();
			await t.page.waitForTimeout(600);
		}
		const tokenRow = f.locator('[id="setting-code.execution.dockerhub-token"]').first();
		const tokenRowText = (await tokenRow.innerText().catch(() => '')).replace(/\s+/g, ' ');
		await t.check('the token row then says the token is saved, not "Add key"', /Saved securely/.test(tokenRowText) && !/Add key/.test(tokenRowText), tokenRowText.slice(0, 120));
		await row.locator('button', { hasText: 'Connect Docker Hub' }).first().click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(400);
		const tokenSaved = await drawerText(f);
		await t.check('Connect then checks the saved token and offers to clear it', /Check the token/.test(tokenSaved) && /Clear the token/.test(tokenSaved), tokenSaved.slice(0, 200));
		await closeDrawers(t, f);
		const method = f.locator('[id="setting-code.execution.dockerhub-auth-method"]').first();
		const seg = method.locator('button', { hasText: 'Sign in in the browser' });
		if (await seg.count()) { await seg.first().click(); } else { await pick(t, f, method.locator('select').first(), 'Sign in in the browser'); }
		await t.settle();
		await t.page.waitForTimeout(500);
		await row.locator('button', { hasText: 'Connect Docker Hub' }).first().click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(400);
		const browser = await drawerText(f);
		const fields2 = await drawer(f).locator('input[type="password"], input[data-key="username"]').count();
		await t.check('with "Sign in in the browser": Connect signs in in the browser, with no token form', fields2 === 0 && /Sign in in the browser/.test(browser), `inputs ${fields2}; "${browser.slice(0, 160)}"`);
		await closeDrawers(t, f);
	});

	T('D5 How testing works follows the redaction switch', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'code', 'testing');
		const B = f.locator(BODY('testing'));
		const on = await f.evaluate(() => !!PM51.value('planning.verification.evidence-redaction'));
		await B.locator('[data-action="pm51-testing-help"]').first().click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(300);
		const text = await drawerText(f);
		await t.check(`redaction is ${on ? 'on' : 'off'}: the help says so`, on ? /hidden before any log or screenshot is saved/.test(text) : !/Secrets are hidden before/.test(text) && /hiding them is off/.test(text), text.slice(text.indexOf('Good to know'), text.indexOf('Good to know') + 160));
		await closeDrawers(t, f);
	});

	T('D6 debug permissions are the grant options', async (t) => {
		const f = await settings(t, surface);
		const row = await reveal(t, f, 'safety.approvals.debug-profile-disclosure');
		const grant = await f.evaluate(() => { const s = PM51.setting('safety.approvals.debug-grant-scope'); const v = PM51.value('safety.approvals.debug-grant-scope') || []; return { options: (s.options || []).map((o) => PM51.valueLabel(s.id, Array.isArray(o) ? o[0] : o)), on: v.map((x) => PM51.valueLabel(s.id, x)) }; });
		await row.locator('button', { hasText: /Show debug permissions/ }).first().click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(400);
		const rows = await drawer(f).locator('.pm51-row').evaluateAll((rs) => rs.map((r) => ({ label: (r.querySelector('.pm51-row-label') || {}).textContent?.trim() || '', help: (r.querySelector('.pm51-row-help') || {}).textContent?.trim() || '' })));
		const labels = rows.map((r) => r.label);
		const every = grant.options.every((o) => labels.includes(o));
		const truthful = grant.options.every((o) => { const r = rows.find((x) => x.label === o); return r && (grant.on.includes(o) ? /without asking/.test(r.help) : /Asks/.test(r.help)); });
		const stray = labels.filter((l) => !grant.options.includes(l) && !/^Riskier changes$/.test(l));
		await t.check('the list names each power "Debugging may, without asking" offers', every && stray.length === 0, `listed ${JSON.stringify(labels)}; offered ${JSON.stringify(grant.options)}`);
		await t.check('each is allowed or asks exactly as that row is set', truthful, JSON.stringify(rows));
		await closeDrawers(t, f);
	});

	T('D8 memory 4 no workspace for a project', async (t) => {
		const f = await settings(t, surface);
		const seen = [];
		const grab = async (where) => { const tx = await drawerText(f); seen.push([where, tx]); await closeDrawers(t, f); };
		// Testing › Debug › Edit
		await go(t, f, 'code', 'testing');
		const TB = f.locator(BODY('testing'));
		await tab(t, f, 'testing', 'Debug');
		await TB.locator('.pm51-detail-actions [aria-label="More actions"]').first().click();
		await menuItem(t, f, 'Edit');
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await grab('Debug › Edit');
		// Context & Memory: help, export, delete all, sources
		await go(t, f, 'memory', 'context-memory');
		const MB = f.locator(BODY('context-memory'));
		await MB.locator('[data-action="pm51-memory-help"]').first().click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await grab('How memory works');
		const memText = async (tabName) => { await tab(t, f, 'context-memory', tabName); return (await MB.innerText()).replace(/\s+/g, ' '); };
		seen.push(['Context & Memory › Sources', await memText('Sources')]);
		seen.push(['Context & Memory › Keeping & privacy', await memText('Keeping & privacy')]);
		// Personas & Crews › Helpers (the helper rows)
		await go(t, f, 'memory', 'personas');
		await tab(t, f, 'personas', 'Helpers');
		seen.push(['Personas › Helpers', (await f.locator(BODY('personas')).innerText()).replace(/\s+/g, ' ')]);
		const bad = seen.filter(([, tx]) => /\bworkspaces?\b/i.test(tx)).map(([w, tx]) => { const i = tx.search(/\bworkspaces?\b/i); return `${w}: …${tx.slice(Math.max(0, i - 50), i + 30)}…`; });
		await t.check(`${seen.length} panels and pages: no "workspace" for a project or a working copy`, bad.length === 0, bad.join(' | '));
	});

	T('D7 notify 9 research finishing is a chat notice', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications');
		// the demo's research run completes 32 s into its clock; at 4x that is 8 s of page time
		await f.evaluate(() => { if (window.PM_DEMO && PM_DEMO.clock) PM_DEMO.clock.setSpeed(4); });
		const seenQuiet = await f.evaluate(() => new Promise((res) => {
			const quiet = [];
			const stage = document.getElementById('rsStage');
			const mo = stage ? new MutationObserver(() => { stage.querySelectorAll('.pmn-toast').forEach((c) => { const tx = c.textContent || ''; if (/Research/i.test(tx) && c.getAttribute('data-level') === 'quiet') quiet.push(tx.trim().slice(0, 80)); }); }) : null;
			if (mo) mo.observe(stage, { childList: true, subtree: true });
			const t0 = Date.now();
			const tick = () => { const op = window.PM_DEMO && PM_DEMO.web && PM_DEMO.web.op('op-web-r1'); if ((op && op.state === 'completed') || Date.now() - t0 > 40000) { setTimeout(() => { if (mo) mo.disconnect(); res({ quiet, done: !!(op && op.state === 'completed') }); }, 600); } else setTimeout(tick, 200); };
			tick();
		}));
		const list = await f.evaluate(() => (window.PM_TITLEBAR_NOTIFY ? PM_TITLEBAR_NOTIFY.list() : []).filter((x) => /Research/i.test(x.title)));
		await t.check('the research run completed while Settings was open', seenQuiet.done, '');
		await t.check('no quiet toast about it (one that reads as the answer to the last click)', seenQuiet.quiet.length === 0, JSON.stringify(seenQuiet.quiet));
		await t.check('it is a notice from the chat, kept in the inbox', list.length === 1 && list[0].level === 'notice' && list[0].source === 'agents', JSON.stringify(list));
	});

	T('notify 2 agents watch alerts that exist', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications');
		const NB = f.locator(BODY('notifications'));
		await tab(t, f, 'notifications', 'Events');
		const r = await f.evaluate(() => { const n = state.notifications; const names = new Set(n.events.map((e) => e.name)); return n.agents.map((g) => ({ name: g.name, events: g.events.slice(), missing: g.events.filter((x) => !names.has(x)) })); });
		await t.check('every agent watches only alerts on the Events list', r.every((g) => g.missing.length === 0), JSON.stringify(r));
		for (const g of r) {
			await NB.locator('.pm51-item', { hasText: g.name }).first().click();
			await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
			await t.page.waitForTimeout(300);
			const facts = (await drawer(f).locator('.pm51-hero-facts').innerText().catch(() => '')).replace(/\s+/g, ' ');
			const switches = await drawer(f).locator('[data-action="pm51-notifications-group-event"][aria-checked="true"]').count();
			const n = Number((/Watches\s*(\d+)/.exec(facts) || [])[1] || 0);
			await t.check(`${g.name}: "Watches ${n}" is the number of alerts switched on in its panel`, n === switches, `facts "${facts}", switches on ${switches}`);
			await closeDrawers(t, f);
		}
	});

	T('notify 3 quiet hours need two different times', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications');
		const NB = f.locator(BODY('notifications'));
		await tab(t, f, 'notifications', 'Quiet hours');
		const startNow = await f.evaluate(() => state.notifications.quiet.start);
		await pick(t, f, NB.locator('select[data-key="end"]').first(), startNow);
		const q = await f.evaluate(() => Object.assign({}, state.notifications.quiet));
		const text = (await NB.innerText()).replace(/\s+/g, ' ');
		await t.check(`End can't be set to Start (${startNow})`, q.end !== q.start, JSON.stringify(q));
		await t.check('the page never reads "X to X"', !new RegExp(`${startNow} to ${startNow}`).test(text), text.slice(0, 200));
	});

	T('notify 4 Still reaches you › Change sets it here', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications');
		const NB = f.locator(BODY('notifications'));
		await tab(t, f, 'notifications', 'Quiet hours');
		await NB.locator('[data-action="pm51-notifications-quiet-dests"]').first().click();
		await t.settle();
		await t.page.waitForTimeout(600);
		const activeTab = (await NB.locator('.pm51-tabs .manager-tab.active').first().innerText()).trim();
		const open = await f.locator('.drawer-wrap').count();
		const selects = open ? await drawer(f).locator('select[data-action="pm51-notifications-dest-quiet"]').count() : 0;
		const dests = await f.evaluate(() => state.notifications.destinations.length);
		await t.check('Change keeps you on Quiet hours and opens the choice for every destination', activeTab === 'Quiet hours' && selects === dests && dests > 0, `tab "${activeTab}", panel ${open}, choices ${selects} of ${dests}`);
		if (selects) {
			const sel = drawer(f).locator('select[data-action="pm51-notifications-dest-quiet"]').first();
			const id = await sel.getAttribute('data-dest');
			await pick(t, f, sel, 'Always deliver');
			const now = await f.evaluate((i) => state.notifications.destinations.find((d) => d.id === i).quiet, id);
			await t.check('a choice made there is that destination\'s', now === 'always', `quiet "${now}"`);
		}
		await closeDrawers(t, f);
	});

	T('notify 5-7 Upload and Replace need a file', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications');
		const NB = f.locator(BODY('notifications'));
		await tab(t, f, 'notifications', 'Sounds');
		const before = await f.evaluate(() => ({ n: state.notifications.sounds.length, built: state.notifications.sounds.find((s) => /^Built-in/.test(String(s.source || '')) && (state.notifications.events || []).some((e) => e.sound === s.name)) }));
		// Replace file on a built-in sound that an alert uses, saved without a file
		const s = before.built;
		await NB.locator(`[data-action="pm51-notifications-sound-menu"][data-id="${s.id}"]`).first().click();
		await menuItem(t, f, 'Replace file');
		await f.locator('.overlay .dialog').last().waitFor({ state: 'visible', timeout: 8000 });
		const renameBox = await f.locator('.overlay .dialog input[name="name"]').count();
		await f.locator('.overlay .dialog .dialog-footer .btn.primary').last().click();
		await t.page.waitForTimeout(600);
		const after = await f.evaluate((id) => { const x = state.notifications.sounds.find((y) => y.id === id); return { source: x.source, name: x.name }; }, s.id);
		await t.check('Replace file offers no rename (Rename tells its alerts; this dialog did not)', renameBox === 0, `name fields ${renameBox}`);
		await t.check(`Replace file saved with no file leaves ${s.name} a built-in sound`, after.source === s.source && after.name === s.name, JSON.stringify(after));
		await closeDrawers(t, f);
		// Upload file saved with no file
		await NB.locator('[data-action="pm51-notifications-add-sound"]').first().click().catch(async () => { await f.evaluate(() => dispatchAction('pm51-notifications-add-sound', null)); });
		await t.page.waitForTimeout(300);
		if (await f.locator('.popover .menu-item', { hasText: /Upload file/ }).count()) await menuItem(t, f, 'Upload file');
		await f.locator('.overlay .dialog').last().waitFor({ state: 'visible', timeout: 8000 });
		const sourceBox = await f.locator('.overlay .dialog select[name="source"]').count();
		await f.locator('.overlay .dialog .dialog-footer .btn.primary').last().click();
		await t.page.waitForTimeout(600);
		const n = await f.evaluate(() => state.notifications.sounds.length);
		await t.check('Upload file saved with no file adds no sound, and asks no "Source"', n === before.n && sourceBox === 0, `sounds ${before.n} -> ${n}, source fields ${sourceBox}`);
		await closeDrawers(t, f);
	});

	T('notify 8 words', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications');
		const NB = f.locator(BODY('notifications'));
		const status = await f.evaluate(() => { const n = state.notifications; n.destinations.push({ id: 'b11-slack', name: 'B11 Slack', type: 'Slack', status: 'setup', address: 'https://hooks.example/x', quiet: 'hold' }); saveState(); PM51.setSel('notifications', 'b11-slack'); PM51.setTab('notifications', 'destinations'); PM51.refresh('notifications'); return true; });
		await t.settle();
		await t.page.waitForTimeout(600);
		const head = (await NB.locator('.pm51-detail-head').first().innerText().catch(() => '')).replace(/\s+/g, ' ');
		await t.check('a destination saved and not yet tested never reads "Not set up"', !/Not set up/.test(head) && /not tested/i.test(head), head);
		await tab(t, f, 'notifications', 'Quiet hours');
		const more = NB.locator('.pm51-advanced, details').first();
		if (await more.count()) { const sum = more.locator('summary, .pm51-advanced-toggle').first(); if (await sum.count()) await sum.click().catch(() => {}); }
		await t.page.waitForTimeout(400);
		const qtext = await f.evaluate((sel) => document.querySelector(sel).textContent.replace(/\s+/g, ' '), BODY('notifications'));
		await t.check('Quiet hours names notification agents, not "escalation groups"', !/escalation groups?/i.test(qtext), '');
		const sub = await f.evaluate(() => { dispatchAction('pm51-notifications-import-events', document.createElement('button')); const d = document.querySelector('.overlay .dialog-sub'); return d ? d.textContent : ''; });
		await t.check('Import events names no workspace', !!sub && !/workspace/i.test(sub), `"${sub}"`);
		await closeDrawers(t, f);
		void status;
	});

	T('memory 1 Pause between rounds is under Chat Room', async (t) => {
		const f = await settings(t, surface);
		const row = await reveal(t, f, 'branching.crew.chat-room-pause-between-rounds');
		const title = await row.evaluate((r) => { const s = r.closest('.settings-section'); const h = s && s.querySelector('.settings-section-title, .section-title, h2, h3'); return h ? h.textContent.trim() : ''; });
		await t.check('"Pause between rounds" sits in Chat Room', /^Chat Room/.test(title), `section "${title}"`);
	});

	T('memory 2-3 question limit helps', async (t) => {
		const f = await settings(t, surface);
		const helps = await f.evaluate(() => ['branching.plan.quick-question-limit', 'branching.plan.standard-question-limit', 'branching.plan.thorough-question-limit', 'branching.deep-plan.thorough-question-limit', 'branching.deep-plan.exhaustive-question-limit', 'branching.crew.brainstorm-question-limit', 'branching.crew.grill-me-question-extension'].map((id) => [id, PM51.rowHelp(PM51.setting(id))]));
		const grill = f.locator(`${BODY('personas')} .pm51-tabs .manager-tab`, { hasText: /^\s*Group work\s*$/ });
		await go(t, f, 'memory', 'personas');
		await t.check('the Group work tab exists where the plan limits point', (await grill.count()) === 1, '');
		const wrongTab = helps.filter(([, h]) => /Personas › Crews/.test(h) || (/Grill Me adds more/.test(h) && !/Group work/.test(h)));
		const stray = helps.filter(([, h]) => /\(\d+\)\.?$/.test(h.trim()));
		await t.check('the five plan limits point at Personas & Crews › Group work', wrongTab.length === 0, JSON.stringify(wrongTab));
		await t.check('no help ends in a stray default like "(20)"', stray.length === 0, JSON.stringify(stray));
		const row = await reveal(t, f, 'branching.crew.brainstorm-question-limit');
		const shown = (await row.locator('.setting-description, .setting-help').first().innerText().catch(() => '')).trim();
		await t.check('the drawn row shows that help', !/\(\d+\)\.?$/.test(shown) && shown.length > 0, `"${shown}"`);
	});

	T('memory 5 a failed rule pack shows and can be fixed', async (t) => {
		const f = await settings(t, surface);
		await go(t, f, 'memory', 'context-memory');
		const MB = f.locator(BODY('context-memory'));
		await tab(t, f, 'context-memory', 'Instructions');
		const show = await f.evaluate(() => String(PM51.value('memory.assembly.rule-pack-display') || 'active'));
		const failed = MB.locator('.pm51-row', { hasText: /Old lint rules/ });
		await t.check(`with Show "${show}": "Old lint rules" (could not load) is on the page`, (await failed.count()) > 0, '');
		const fix = failed.first().locator('button', { hasText: /^\s*Fix\s*$/ });
		await t.check('it has a Fix action', (await fix.count()) === 1, '');
		if (await fix.count()) {
			await fix.click();
			await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
			await drawer(f).locator('.pm51-memory-pack-path').fill('docs/lint-rules.md');
			await drawer(f).locator('.pm51-panel-foot .btn.primary').click();
			await t.settle();
			await t.page.waitForTimeout(600);
			const now = (await MB.locator('.pm51-row', { hasText: /Old lint rules/ }).first().innerText().catch(() => '')).replace(/\s+/g, ' ');
			await t.check('pointed at the moved file, it loads', /docs\/lint-rules\.md/.test(now) && /Loaded/.test(now), now);
		}
	});

	T('memory 7 fade times name each kind', async (t) => {
		const f = await settings(t, surface);
		const row = await reveal(t, f, 'memory.retention.half-life-by-kind');
		const btn = row.locator('.o55-struct, button').first();
		await btn.scrollIntoViewIfNeeded();
		await btn.click();
		await drawer(f).waitFor({ state: 'visible', timeout: 8000 });
		await t.page.waitForTimeout(400);
		const r = await drawer(f).evaluate((d) => ({ inputs: [...d.querySelectorAll('.o55-kv-row input')].map((i) => i.value), keys: [...d.querySelectorAll('.o55-kv-key')].map((k) => k.textContent.trim()), text: d.textContent }));
		const raw = /\b(CurrentThread|Blocker|Constraint)\b/;
		await t.check('no inner name (CurrentThread, Blocker, Constraint) is shown or editable', !r.inputs.some((v) => raw.test(v)) && !raw.test(r.text), JSON.stringify(r.inputs));
		await t.check('each kind reads as its name', r.keys.join('|') === 'What a chat is working on|Blockers|Rules the work follows', JSON.stringify(r.keys));
		await closeDrawers(t, f);
	});

	T('memory 9 pick up follows save progress', async (t) => {
		const f = await settings(t, surface);
		const cad = await reveal(t, f, 'planning.verification.goal-checkpoint-cadence');
		await pick(t, f, cad.locator('select').first(), 'Never');
		await t.page.waitForTimeout(600);
		const resume = f.locator('[id="setting-planning.verification.goal-auto-resume"]').first();
		const shown = await resume.evaluate((r) => !r.classList.contains('o55-dep-off') && r.getClientRects().length > 0 && r.getBoundingClientRect().height > 4).catch(() => false);
		await t.check('with Save progress "Never", "Pick up where it left off" steps aside', !shown, `shown ${shown}`);
		await pick(t, f, cad.locator('select').first(), 'At each milestone');
		await t.page.waitForTimeout(700);
		const back = await resume.evaluate((r) => !r.classList.contains('o55-dep-off') && r.getBoundingClientRect().height > 4).catch(() => false);
		await t.check('it comes back when progress is saved again', back, '');
	});
}
