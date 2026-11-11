// Stream F batch 11, lane A: Settings › System › Server & Project Location, the defects confirmed by the second check
// of audit A1 (EVID/review/VERIFIED-A1-A4.md, EVID = /mnt/Cursor/PuppetMaster-Evidence/tests/settings-managers-20261110).
// - B-3: More actions › Connect on a server that is not connected always ended in "Needs attention" (50-servers.js
//   hard-coded the outcome); a passing Test connection left the state and "Checked …" as they were. Now both run the same
//   checks and the server's state and last check follow them; a server signing in over SSH with no key stays Needs
//   attention and says why.
// - B-4: a route row on Away From Home did nothing when its body was clicked; device rows open. Now the row opens what its
//   own button opens (the setup for a route not set up, the route's sheet otherwise), and its own buttons keep theirs.
// - B-5: a device's Rename (and Review Access, Check device) replaced the device's panel, and after Save or Escape
//   nothing was open. Now the device's panel comes back when the sub-action closes, with the new name after a rename.
// - N-1: after Home & Location › Home server was changed, the roster still called the old server "Home server", so two
//   servers claimed it. Exactly one server is the home server, and it is the one chosen.
// - codework D2: Containers & Execution › "Open Hosts" opened Server & Project Location on Home & Location (it set the
//   retired page's state.serverTab = 'hosts', which nothing reads) and nothing there is called Hosts. "Open Servers"
//   lands on the Servers tab, where the computers are listed.
// (N-2, the developer text behind "Project details" and "Where the files are", is lane fo-b11-d's: the shared cause in
// pm7TypedConsumerResult, pm-fo-lead's ruling 1111051211.)
// Runs on the surface the switch picks (--set sandbox=1 for T3's preview).
const sleep = (f, ms) => f.waitForTimeout(ms);
const BLOCK = '.workspace-block[data-workspace-block="servers"]';
/* close whatever sheet, window or dialog is open, by its own Close (the engine's closeOverlay is not a global) */
async function closeAll(f) {
	for (let i = 0; i < 4; i++) {
		const b = f.locator('.overlay [data-action="close-overlay"], .drawer-wrap:not([data-closing="1"]) .o55g-close, .drawer-wrap:not([data-closing="1"]) .pm51-panel-close').first();
		if (!(await b.count())) break;
		await b.click().catch(() => {}); await f.waitForTimeout(450);
	}
	await f.waitForTimeout(300);
}

async function openServers(t, tab) {
	await t.viewport(1440, 900);
	const f = await t.app.open({ settleMs: 1500 });
	await f.locator('#tab-settings').click();
	await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]', { timeout: 15000 });
	await f.evaluate(() => PM51.go('system', 'servers'));
	await f.waitForSelector(`${BLOCK} [data-action="pm51-tab"][data-manager="servers"]`, { timeout: 15000 });
	await sleep(f, 900);
	if (tab) await toTab(f, tab);
	return f;
}
async function toTab(f, tab) {
	await f.locator(`${BLOCK} [role="tab"][data-action="pm51-tab"][data-manager="servers"][data-tab="${tab}"]`).first().click();
	await f.waitForFunction((tab) => PM51.tab('servers') === tab, tab, { timeout: 6000 });
	await sleep(f, 700);
}
const openTitle = (f) => f.evaluate(() => {
	const d = [...document.querySelectorAll('.drawer-wrap:not([data-closing="1"]) .pm51-panel-title, .overlay .dialog-title')].filter((e) => e.getClientRects().length);
	return d.map((e) => e.textContent.trim());
});
async function untilOpen(f, re, ms = 4000) {
	const end = Date.now() + ms; let last = [];
	while (Date.now() < end) { last = await openTitle(f); if (last.some((x) => re.test(x))) return last; await sleep(f, 120); }
	return last;
}

export const tests = {
	async 'N-1: after the home server changes, exactly one server is called home server, the one chosen'(t) {
		const f = await openServers(t, 'home');
		const sel = f.locator(`${BLOCK} select[data-action="pm51-servers-home"]`);
		await f.evaluate((s) => { const el = document.querySelector(s); el.value = 'this'; el.dispatchEvent(new Event('change', { bubbles: true })); }, `${BLOCK} select[data-action="pm51-servers-home"]`);
		await f.waitForFunction(() => PM51.s().serverProject.homeServer === 'this', null, { timeout: 4000 });
		await t.check('the home server choice took (Windows Workstation)', (await sel.count()) > 0 && await f.evaluate(() => PM51.s().serverProject.homeServer === 'this'), '');
		await toTab(f, 'servers');
		const roster = await f.evaluate((B) => [...document.querySelectorAll(`${B} [data-action="pm51-select"]`)].filter((e) => e.getClientRects().length).map((e) => e.innerText.replace(/\s+/g, ' ').trim()), BLOCK);
		const homes = roster.filter((x) => /Home server/.test(x));
		t.log(JSON.stringify(roster));
		await t.check('one roster line says Home server', homes.length === 1, JSON.stringify(roster));
		await t.check('it is Windows Workstation', homes.length === 1 && /Windows Workstation/.test(homes[0]), JSON.stringify(homes));
		await t.check('Home TrueNAS reads as what it is (NAS), not Home server', roster.some((x) => /Home TrueNAS/.test(x) && /\bNAS\b/.test(x) && !/Home server/.test(x)), JSON.stringify(roster));
		await f.locator(`${BLOCK} [data-action="pm51-select"]`, { hasText: 'Home TrueNAS' }).first().click(); await sleep(f, 600);
		const role = await f.evaluate((B) => { const r = [...document.querySelectorAll(`${B} .pm51-row`)].find((x) => /^\s*Role/.test(x.innerText)); return r ? r.innerText.replace(/\s+/g, ' ') : ''; }, BLOCK);
		await t.check('Home TrueNAS details: Role is NAS', /Role NAS$/.test(role.trim()), role);
		const sub = await f.evaluate((B) => (document.querySelector(`${B} .pm51-detail-sub, ${B} .pm51-ld-sub`) || {}).textContent || '', BLOCK);
		await t.check('its detail head does not say Home server', !/Home server/.test(sub), sub);
	},
	async 'B-3: Connect on a server that is not connected connects it; Test connection records what it found'(t) {
		const f = await openServers(t, 'servers');
		/* the example data has no disconnected server: Windows Workstation is made Offline, as the second check did */
		await f.evaluate(() => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'this'); s.state = 'Offline'; s.lastCheck = 'Yesterday'; PM51.setSel('servers', 'this'); PM51.refresh('servers', { swap: false }); });
		await sleep(f, 600);
		const head = f.locator(`${BLOCK} [aria-label="More actions"], ${BLOCK} [data-pm-hover-label="More actions"]`).first();
		await head.click(); await sleep(f, 400);
		const item = f.locator('.pm51-menu [role="menuitem"]').filter({ hasText: /^\s*Connect/ }).first();
		await t.check('the menu offers Connect', (await item.count()) > 0, '');
		await item.click();
		await f.waitForFunction(() => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'this'); return s.state !== 'Checking' && s.state !== 'Offline'; }, null, { timeout: 5000 }).catch(() => {});
		await sleep(f, 300);
		const st = await f.evaluate(() => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'this'); return { state: s.state, last: s.lastCheck }; });
		await t.check('Connect ends Connected, not Needs attention', st.state === 'Connected', JSON.stringify(st));
		await t.check('its last check is now', st.last === 'Just now', JSON.stringify(st));
		const pill = await f.evaluate((B) => { const p = document.querySelector(`${B} .pm51-ld-detail .pm51-status, ${B} .pm51-detail-head .pm51-status`); return p ? p.textContent.trim() : ''; }, BLOCK);
		await t.check('the detail head says Connected', /Connected/.test(pill), pill);

		/* the one failure this preview knows: SSH sign-in with no key attached */
		await f.evaluate(() => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'truenas'); s.state = 'Offline'; s.signIn = { method: 'ssh', user: 'admin' }; PM51.setSel('servers', 'truenas'); PM51.refresh('servers', { swap: false }); });
		await sleep(f, 500);
		await head.click(); await sleep(f, 400);
		await f.locator('.pm51-menu [role="menuitem"]').filter({ hasText: /^\s*Connect/ }).first().click();
		await f.waitForFunction(() => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'truenas'); return s.state !== 'Checking' && s.state !== 'Offline'; }, null, { timeout: 5000 }).catch(() => {});
		const st2 = await f.evaluate((B) => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'truenas'); const row = [...document.querySelectorAll(`${B} .pm51-row`)].find((x) => /^\s*Signs in with/.test(x.innerText)); return { state: s.state, row: row ? row.innerText.replace(/\s+/g, ' ') : '' }; }, BLOCK);
		await t.check('an SSH server with no key stays Needs attention, and its details say why', st2.state === 'Needs attention' && /no key is attached/i.test(st2.row), JSON.stringify(st2));

		/* Test connection on a server that needs attention, with its key now attached */
		await f.evaluate(() => { const S = PM51.s().serverProject, s = S.servers.find((x) => x.id === 'truenas'); s.signIn = { method: 'pair' }; s.lastCheck = 'Not checked yet'; PM51.refresh('servers', { swap: false }); });
		await sleep(f, 500);
		await f.locator(`${BLOCK} .pm51-row [data-action="pm51-servers-test"]`).first().click();
		await f.waitForFunction(() => PM51.s().serverProject.servers.find((x) => x.id === 'truenas').lastCheck === 'Just now', null, { timeout: 4000 }).catch(() => {});
		const st3 = await f.evaluate((B) => { const s = PM51.s().serverProject.servers.find((x) => x.id === 'truenas'); const row = [...document.querySelectorAll(`${B} .pm51-row`)].find((x) => /^\s*Connection/.test(x.innerText)); return { state: s.state, last: s.lastCheck, row: row ? row.innerText.replace(/\s+/g, ' ') : '' }; }, BLOCK);
		await t.check('a passing Test connection records Connected and Checked Just now', st3.state === 'Connected' && /Checked Just now/.test(st3.row), JSON.stringify(st3));
		await t.shot('servers-connect', 'Servers: Connect and Test connection record what they found');
	},
	async 'B-4: a route row opens what its own button opens; its buttons keep their own action'(t) {
		const f = await openServers(t, 'away');
		const rows = await f.evaluate((B) => [...document.querySelectorAll(`${B} .pm51-servers-route[data-route]`)].map((r) => ({ id: r.dataset.route, status: r.dataset.status, cursor: getComputedStyle(r).cursor })), BLOCK);
		t.log(JSON.stringify(rows));
		await t.check('route rows look clickable (pointer)', rows.length >= 5 && rows.every((r) => r.cursor === 'pointer'), JSON.stringify(rows));
		const lan = f.locator(`${BLOCK} .pm51-servers-route[data-route="lan"] .pm51-item-title`).first();
		await lan.click(); const a = await untilOpen(f, /Local network/i);
		await t.check('clicking the Local network row body opens its sheet', a.some((x) => /Local network/i.test(x)), JSON.stringify(a));
		await closeAll(f);
		const ts = f.locator(`${BLOCK} .pm51-servers-route[data-route="tailscale"] .pm51-item-meta`).first();
		await ts.click(); const b = await f.waitForSelector('.o55g-win, .o55g-window, [data-pm51-wizard]', { timeout: 4000 }).then(() => true).catch(() => false);
		const title = await f.evaluate(() => { const w = document.querySelector('.o55g-win, .o55g-window, [data-pm51-wizard]'); return w ? w.innerText.slice(0, 120) : ''; });
		await t.check('clicking the Tailscale row (not set up) opens its setup', b && /Tailscale/.test(title), title);
		await closeAll(f);
		/* a button inside the row keeps its own action: moving a route down changes the order and opens nothing */
		const before = await f.evaluate(() => PM51.s().serverProject.remoteAccess.routes.find((r) => r.id === 'tailscale').priority);
		await f.locator(`${BLOCK} .pm51-servers-route[data-route="tailscale"] [data-action="pm51-servers-route-move"][data-dir="down"]`).first().click(); await sleep(f, 600);
		const after = await f.evaluate(() => PM51.s().serverProject.remoteAccess.routes.find((r) => r.id === 'tailscale').priority);
		const open = await openTitle(f);
		await t.check('the row’s Try later button moves it and opens nothing', after > before && !open.length, JSON.stringify({ before, after, open }));
	},
	async 'B-5: a device’s Rename, Review Access and Check device return to the device'(t) {
		const f = await openServers(t, 'devices');
		const openMac = async () => { await f.locator(`${BLOCK} [data-action="pm51-servers-device"][data-id="mac"]`).first().click(); return untilOpen(f, /MacBook Air/); };
		let s = await openMac();
		await t.check('the MacBook Air panel opens', s.some((x) => /^MacBook Air$/.test(x)), JSON.stringify(s));
		await f.locator('.drawer-wrap [data-action="pm51-servers-device-rename"]').first().click();
		s = await untilOpen(f, /^Rename MacBook Air/);
		await t.check('Rename opens its dialog', s.some((x) => /^Rename MacBook Air/.test(x)), JSON.stringify(s));
		await t.page.keyboard.press('Escape');
		s = await untilOpen(f, /^MacBook Air$/);
		await t.check('Escape on Rename brings the device panel back', s.some((x) => /^MacBook Air$/.test(x)), JSON.stringify(s));
		await f.locator('.drawer-wrap [data-action="pm51-servers-device-rename"]').first().click();
		await untilOpen(f, /^Rename MacBook Air/);
		await f.locator('.overlay input[name="name"]').fill('Studio MacBook');
		await f.locator('.overlay button[type="submit"]').click();
		s = await untilOpen(f, /^Studio MacBook$/);
		await t.check('Save brings the panel back with the new name', s.some((x) => /^Studio MacBook$/.test(x)), JSON.stringify(s));
		const listed = await f.evaluate((B) => !!document.querySelector(`${B} [data-action="pm51-servers-device"][data-id="mac"]`) && document.querySelector(`${B} [data-action="pm51-servers-device"][data-id="mac"]`).innerText.includes('Studio MacBook'), BLOCK);
		await t.check('the list shows the new name', listed, '');
		await f.locator('.drawer-wrap:not([data-closing="1"]) [data-action="pm51-servers-device-check"]').first().click();
		s = await untilOpen(f, /^Check device/);
		await t.check('Check device opens its result', s.some((x) => /^Check device/.test(x)), JSON.stringify(s));
		await f.locator('.drawer-wrap:not([data-closing="1"]) .pm51-panel-close').first().click();
		s = await untilOpen(f, /^Studio MacBook$/);
		await t.check('closing the check returns to the device', s.some((x) => /^Studio MacBook$/.test(x)), JSON.stringify(s));
		await f.locator('.drawer-wrap:not([data-closing="1"]) [data-action="pm51-servers-device-access"]').first().click();
		await untilOpen(f, /^Access · Studio MacBook/);
		await f.locator('.drawer-wrap:not([data-closing="1"]) .pm51-panel-foot .btn.primary').first().click();
		s = await untilOpen(f, /^Studio MacBook$/);
		await t.check('Review Access › Done returns to the device', s.some((x) => /^Studio MacBook$/.test(x)), JSON.stringify(s));
		await f.locator('.drawer-wrap:not([data-closing="1"]) .pm51-panel-close').first().click(); await sleep(f, 700);
		s = await openTitle(f);
		await t.check('closing the device panel itself closes it (nothing comes back)', !s.length, JSON.stringify(s));
	},
	async 'D2: Containers & Execution › Open Servers lands on the Servers tab, where the computers are listed'(t) {
		await t.viewport(1440, 900);
		const f = await t.app.open({ settleMs: 1500 });
		await f.locator('#tab-settings').click();
		await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]', { timeout: 15000 });
		await f.evaluate(() => PM51.go('code', 'code-reference'));
		const btn = f.locator('[data-action="open-hosts-manager"]').first();
		await btn.waitFor({ state: 'attached', timeout: 10000 });
		await btn.scrollIntoViewIfNeeded(); await sleep(f, 400);
		const line = await f.evaluate(() => { const b = document.querySelector('[data-action="open-hosts-manager"]'); const w = b && b.closest('.owner-redirects'); return { label: b ? b.textContent.trim() : '', text: w ? w.innerText.replace(/\s+/g, ' ') : '' }; });
		await t.check('the button and its line name what is there: Servers, not Hosts', line.label === 'Open Servers' && !/\bHosts\b/.test(line.text) && /Servers/.test(line.text), JSON.stringify(line));
		await btn.click();
		await f.waitForFunction(() => PM51.tab('servers') === 'servers' && !!document.querySelector('.workspace-block[data-workspace-block="servers"] .pm51-roster'), null, { timeout: 6000 }).catch(() => {});
		const at = await f.evaluate((B) => ({ tab: PM51.tab('servers'), selected: (document.querySelector(`${B} [role="tab"][aria-selected="true"]`) || {}).textContent || '', roster: [...document.querySelectorAll(`${B} [data-action="pm51-select"]`)].map((e) => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 4) }), BLOCK);
		await t.check('it opens Server & Project Location on the Servers tab, with the servers listed', at.tab === 'servers' && /Servers/.test(at.selected) && at.roster.length >= 2, JSON.stringify(at));
	}
};
