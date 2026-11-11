// Stream F batch 11, lane D (safety, permissions, source control, recovery): the "Defects of PMConcept7" of the
// settings-managers builders lane-safety and lane-source, and audit A3 B-2, each reproduced on the page by real
// clicks where PMConcept7 reaches it (OPEN-AND-FOUND.md, sections C and F; batch11/fo-b11-d/REPORT.md).
//  kit      All five Recovery Kit actions (Save, Test, Copy key, Rotate, Re-encrypt) open their protected handoff,
//           finish on "Confirm it's you" and change what they say, with no page error ("Cannot read properties of
//           null (reading 'client')" when onboarding had not opened in the page).
//  profile  A second profile of your own, put in use, stays in use (it went back to the first Custom one).
//  owners   Permissions: a profile's rules have their owner before the manager first draws ("Its 0 rules now apply").
//  alerts   A3 B-2: no switch under a destination's "Alerts that arrive here" is on beside "this alert is off"; on
//           turns an alert that is off on and sends it there.
//  source   Adding a second account keeps the service's permissions, SSH state and push access; after Disconnect
//           no repository address reads "github.com/None/…"; every account has its own Disconnect (FO-126 kept).
//  doctor   Doctor's provider, push-access and Recovery Kit findings say what their own pages say.
//  support  "Collect support details" and the Doctor summary's copy are two things with two results.
//  reset    Reset settings to defaults offers one setting, a section or everything and lists what changes first.
//  words    No developer text in the typed-consumer drawers (Update logs, Release notes, Project details, ...); the
//           protected-path dialog explains ${projectRoot} without "workspace"; "How runs pause" does not reuse
//           "Hands-off"; Recently removed can bring an item back.
//  load     Pinned workflows and a key's uses read the same before and after Source Control first draws.
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

async function settings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.evaluate(() => {
		if (window.__b11) return;
		window.__b11 = { errors: [], toasts: [] };
		addEventListener('error', (e) => __b11.errors.push(String((e.error && e.error.message) || e.message)));
		addEventListener('unhandledrejection', (e) => __b11.errors.push(String((e.reason && e.reason.message) || e.reason)));
		const N = window.PM_TITLEBAR_NOTIFY;
		if (N && typeof N.push === 'function') {
			const push = N.push.bind(N);
			N.push = (p, ...rest) => { try { __b11.toasts.push(typeof p === 'string' ? p : [p.title, p.body].filter(Boolean).join(' — ')); } catch (e) { /* keep the toast */ } return push(p, ...rest); };
		}
	});
	return f;
}
async function go(t, f, domain, ws, tab) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws]);
	await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	if (tab) { await f.evaluate(([w, tb]) => PM51.switchTab(w, tb), [ws, tab]); await t.page.waitForTimeout(350); }
	await t.settle();
}
const body = (ws) => `[data-continuous-workspace-body="${ws}"]`;
// a real click on the first match, opening a closed "More options" fold around it first (its summary, clicked)
async function press(t, f, sel) {
	const loc = f.locator(sel).first();
	if (!(await loc.count())) return false;
	await loc.evaluate((el) => { const d = el.closest('details:not([open])'); if (d) d.querySelector(':scope > summary').click(); });
	await t.page.waitForTimeout(150);
	await loc.scrollIntoViewIfNeeded();
	await loc.click();
	await t.page.waitForTimeout(250);
	return true;
}
const dialog = (f, name) => f.locator(`.overlay [role="dialog"][aria-label="${name}"]`).last();
// a side panel (PM51.panel), never the confirm dialog that may share its title
const panelOf = (f, name) => f.locator(`.drawer-wrap aside.drawer[aria-label="${name}"]`).last();
async function submit(t, f, name) {
	const d = dialog(f, name);
	if (!(await d.count())) return false;
	await d.locator('button[type="submit"]').click();
	await t.page.waitForTimeout(350);
	return true;
}
async function closeAll(t, f) {
	for (let i = 0; i < 3; i++) {
		const n = await f.locator('.drawer-wrap, .overlay').count();
		if (!n) return;
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(300);
	}
}
const state = (f, fn, arg) => f.evaluate(fn, arg);
const errors = (f) => f.evaluate(() => (window.__b11 ? __b11.errors.slice() : []));
const toasts = (f) => f.evaluate(() => (window.__b11 ? __b11.toasts.slice() : []));

/* the look chosen the way a person chooses it (settings-choices-picker's helper): a look painted without saving is
   reset to the saved pair on the next Settings render (applyPaint; ASTRA-B10-K1) */
async function setLook(t, f, look) {
	const [family, mode] = look.split('-');
	await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
	await t.settle();
	for (const [setting, value] of [['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)], ['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark']]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
		const labels = await f.locator(`select[data-setting="${setting}"] option`).allTextContents();
		const name = labels.includes(value) ? value : `${value} ${mode === 'light' ? 'Light' : 'Dark'}`;
		await trigger.first().scrollIntoViewIfNeeded();
		await trigger.first().click();
		await f.getByRole('option', { name, exact: true }).click({ timeout: 8000 });
		await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
		await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy()), null, { timeout: 15000 }).catch(() => {});
		await t.page.waitForTimeout(400);
	}
	await f.waitForFunction(([fam, m]) => {
		const th = document.documentElement.getAttribute('data-theme') || '';
		const nier = !!(window.PM_NIER && PM_NIER.on()) || th.startsWith('nier');
		return fam === 'nier' ? nier && th.endsWith('-' + m) : !nier && th === fam + '-' + m;
	}, [family, mode], { timeout: 20000 }).catch(() => {});
}
async function guardLook(t, f, look, where) {
	const [family, mode] = look.split('-');
	const got = await f.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme') || '', nier: !!(window.PM_NIER && PM_NIER.on()) || (document.documentElement.getAttribute('data-theme') || '').startsWith('nier') }));
	const ok = family === 'nier' ? got.nier && got.theme.endsWith('-' + mode) : !got.nier && got.theme === look;
	await t.check(`${where}: measured under ${look} (painted ${got.theme}${got.nier ? ', NieR on' : ''})`, ok, 'the panel opened on a different look than the cell names');
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const skip = async (t) => { if (t.app.surfaces().includes(surface)) return false; await t.check(`${surface} surface not asked for`, true); return true; };

	tests[`kit: all five Recovery Kit actions finish their protected handoff (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'system', 'backup', 'backup');
		const B = body('backup');
		// [button, dialog to confirm first (or ''), handoff title, what the state must say once it finished]
		const steps = [
			['pm51-backup-kit-save', 'Save Recovery Kit', 'Save Recovery Kit', (k) => k.saved === true],
			['pm51-backup-kit-test', '', 'Test Recovery Kit', (k) => k.tested === true],
			['pm51-backup-key-copy', 'Copy the recovery key?', 'Copy Recovery Key', null],
			['pm51-backup-key-rotate', 'Rotate the recovery key slot?', 'Rotate key slot', (k) => !!k.rotatedAt],
			['pm51-backup-key-reencrypt', 'Key may be compromised?', 'New domain and re-encryption', (k) => !!k.reencryptedAt]
		];
		for (const [action, ask, title, done] of steps) {
			const before = (await errors(f)).length, toastsBefore = (await toasts(f)).length;
			const pressed = await press(t, f, `${B} [data-action="${action}"]:not([aria-disabled="true"])`);
			if (!(await t.check(`${title}: its button is on the Backup tab and can be pressed`, pressed))) continue;
			if (ask) await submit(t, f, ask);
			const panel = panelOf(f, title);
			const opened = await panel.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
			await t.check(`${title}: the protected handoff opens`, opened, opened ? 'open' : `no panel; page errors: ${(await errors(f)).slice(before).join(' | ') || 'none'}`);
			if (opened) {
				await panel.locator('[data-action="pm51-backup-handoff-stepup"]').click();
				const hero = await f.waitForFunction((name) => {
					const p = [...document.querySelectorAll('.drawer-wrap aside.drawer')].reverse().find((x) => x.getAttribute('aria-label') === name);
					const s = p && p.querySelector('.pm51-hero-status');
					return s && /finished|did not finish|missing|Waiting/i.test(s.textContent) ? s.textContent.trim() : false;
				}, title, { timeout: 6000 }).then((x) => x.jsonValue()).catch(() => '');
				await t.check(`${title}: "Confirm it's you" finishes the handoff`, /Handoff finished/.test(hero), hero || 'no answer');
			}
			const kit = await state(f, () => JSON.parse(JSON.stringify(PM51.s().backup.recoveryKit || {})));
			if (done) await t.check(`${title}: the kit's state follows`, done(kit), JSON.stringify(kit));
			const got = (await toasts(f)).slice(toastsBefore);
			await t.check(`${title}: its finishing toast`, got.length > 0, got.join(' | ') || 'no toast');
			const errs = (await errors(f)).slice(before);
			await t.check(`${title}: no page error`, errs.length === 0, errs.join(' | '));
			await closeAll(t, f);
		}
	};

	tests[`profile: a second profile of your own stays in use (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'safety', 'permissions', 'profiles');
		const B = body('permissions');
		const pick = async (name) => { await f.locator(`${B} .resource-row[data-manager="permissions"]`, { hasText: name }).first().click(); await t.page.waitForTimeout(350); };
		const dup = async () => {
			await f.locator(`${B} .pm51-detail-actions [aria-label="More actions"]`).first().click();
			await f.locator('.pm51-popout [role="menuitem"]', { hasText: /^\s*Duplicate/ }).first().click();
			await t.page.waitForTimeout(400);
		};
		await pick('Review-first'); await dup();
		await pick('Review-first copy'); await dup();
		const names = await state(f, () => PM12_KIMI.getState().permissionProfiles.map((p) => p.name));
		if (!(await t.check('two profiles of your own were made', names.includes('Review-first copy') && names.includes('Review-first copy copy'), names.join(', ')))) return;
		const use = async (name) => {
			await f.locator(`${B} .resource-row[data-manager="permissions"]`, { hasText: new RegExp(`^\\s*\\S*\\s*${name.replace(/ /g, '\\s')}\\s*$`) }).first().click().catch(async () => pick(name));
			await t.page.waitForTimeout(300);
			await f.locator(`${B} .pm51-detail-actions [data-action="pm51-permissions-profile-use"]`).first().click();
			await t.page.waitForTimeout(500);
		};
		const inUse = () => state(f, () => (PM12_KIMI.getState().permissionProfiles.find((p) => p.status === 'default') || {}).name || '');
		const pill = () => state(f, () => document.querySelector('[data-continuous-workspace-body="permissions"] .pm51-detail-title')?.textContent.replace(/\s+/g, ' ').trim() || '');
		await use('Review-first copy');
		await t.check('the first copy is in use', (await inUse()) === 'Review-first copy', await inUse());
		// the second one: select it by its exact name, then Use this profile
		await f.evaluate(() => { const r = [...document.querySelectorAll('[data-continuous-workspace-body="permissions"] .resource-row[data-manager="permissions"]')].find((x) => x.querySelector('.resource-row-name')?.textContent.trim() === 'Review-first copy copy'); if (r) r.scrollIntoView({ block: 'center' }); });
		const second = f.locator(`${B} .resource-row[data-manager="permissions"]`).filter({ has: f.locator('.resource-row-name', { hasText: /^Review-first copy copy$/ }) }).first();
		await second.click();
		await t.page.waitForTimeout(350);
		await f.locator(`${B} .pm51-detail-actions [data-action="pm51-permissions-profile-use"]`).first().click();
		await t.page.waitForTimeout(600);
		const now = await inUse(), head = await pill();
		await t.check('the second copy is in use after "Use this profile"', now === 'Review-first copy copy', `in use: ${now}`);
		await t.check('its detail says In use', /Review-first copy copy/.test(head) && /In use/.test(head), head);
		// and it stays in use through a redraw of the tab
		await f.evaluate(() => PM51.refresh('permissions', { swap: false }));
		await t.page.waitForTimeout(400);
		await t.check('it is still in use after the page redraws', (await inUse()) === 'Review-first copy copy', await inUse());
	};

	tests[`owners: a profile's rules count before Permissions first draws (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		// Permissions has not drawn in this page: press "Use this profile" for Review-first through the Settings action
		// router (the same path a button takes), from a button placed in the Settings area
		const drawn = await state(f, () => !!document.querySelector('[data-continuous-workspace-body="permissions"][data-workspace-mounted="true"]'));
		await t.check('Permissions has not drawn yet', !drawn);
		await f.evaluate(() => {
			const b = document.createElement('button'); b.type = 'button'; b.id = 'b11-use'; b.dataset.action = 'pm51-permissions-profile-use'; b.dataset.id = 'review-first'; b.textContent = 'Use Review-first';
			b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647';
			document.getElementById('pm-settings-root').appendChild(b);
		});
		const before = (await toasts(f)).length;
		await f.locator('#b11-use').click();
		await t.page.waitForTimeout(500);
		const got = (await toasts(f)).slice(before).join(' | ');
		await f.evaluate(() => document.getElementById('b11-use')?.remove());
		await go(t, f, 'safety', 'permissions', 'profiles');
		const shown = await state(f, () => PM12_KIMI.getState().permissionRules.filter((r) => r.profile === 'review-first').length);
		await t.check('the toast counts the rules the profile shows', shown > 0 && got.includes(`Its ${shown} rule${shown === 1 ? '' : 's'} now apply`), `toast "${got}", the profile shows ${shown}`);
	};

	tests[`alerts: a destination never shows an alert that is off as arriving (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'general', 'notifications', 'destinations');
		const B = body('notifications');
		await f.locator(`${B} .resource-row[data-manager="notifications"]`, { hasText: 'In-app' }).first().click().catch(() => {});
		await t.page.waitForTimeout(400);
		const rows = () => f.evaluate(() => {
			const sec = [...document.querySelectorAll('[data-continuous-workspace-body="notifications"] .pm51-section, [data-continuous-workspace-body="notifications"] section')].find((s) => /Alerts that arrive here/.test(s.textContent) && s.querySelector('[role="switch"]'));
			if (!sec) return null;
			return [...sec.querySelectorAll('.setting-row, .pm51-row, [class*="row"]')].filter((r) => r.querySelector(':scope [role="switch"]') && r.querySelectorAll('[role="switch"]').length === 1).map((r) => ({ text: r.textContent.replace(/\s+/g, ' ').trim(), on: r.querySelector('[role="switch"]').getAttribute('aria-checked') === 'true', label: r.querySelector('[role="switch"]').getAttribute('aria-label') }));
		});
		const list = await rows();
		if (!(await t.check('In-app lists the alerts that arrive there', !!list && list.length >= 5, list ? `${list.length} rows` : 'no list'))) return;
		const bad = list.filter((r) => /this alert is off/i.test(r.text) && r.on);
		await t.check('no switch is on beside "this alert is off"', bad.length === 0, bad.map((r) => r.text).join(' | '));
		// the off alert Update available: switching it on here turns it on and sends it here
		const sw = f.locator(`${B} [role="switch"][aria-label="Send Update available to In-app"]`).first();
		if (!(await t.check('Update available has its switch here', (await sw.count()) > 0))) return;
		await sw.scrollIntoViewIfNeeded();
		await sw.click();
		await t.page.waitForTimeout(500);
		const ev = await state(f, () => { const e = (PM12_KIMI.getState().notifications || {}).events || []; const u = e.find((x) => x.id === 'update-available') || {}; return { enabled: !!u.enabled, dests: u.destinations || [] }; }).catch(() => null);
		const after = (await rows()) || [];
		const row = after.find((r) => /Update available/.test(r.text)) || {};
		await t.check('switching it on here turns the alert on and sends it here', row.on === true && !/this alert is off/i.test(row.text || ''), JSON.stringify({ row, ev }));
		const bad2 = after.filter((r) => /this alert is off/i.test(r.text) && r.on);
		await t.check('still no switch on beside "this alert is off"', bad2.length === 0, bad2.map((r) => r.text).join(' | '));
	};

	tests[`source: a second account keeps the service's access; Disconnect keeps addresses (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'source', 'source-manager', 'services');
		const B = body('source-manager');
		await f.locator(`${B} .resource-row[data-id="github"]`).first().click().catch(() => {});
		await t.page.waitForTimeout(300);
		const gh = () => state(f, () => { const g = (PM12_KIMI.getState().sourceControl.forges || []).find((x) => x.id === 'github'); return JSON.parse(JSON.stringify({ status: g.status, accounts: g.accountNames, scopes: g.scopes, ssh: g.ssh, pushAccess: g.pushAccess, pushVia: g.pushVia ?? null, pushKeyId: g.pushKeyId ?? null })); });
		const g0 = await gh();
		// Add another account: the set-up window, by its own buttons (account-flows' recipe: a token, HTTPS, check, add)
		const opened = await press(t, f, `${B} [data-action="pm51-source-connect"]`);
		if (!(await t.check('Add another account opens its set-up', opened && (await f.locator('.o55g-primary').count()) > 0))) return;
		await t.page.waitForTimeout(600);
		await f.locator('[data-action="pm51-source-cw-how"][data-how="token"]').first().click();
		await t.page.waitForTimeout(400);
		await f.locator('.o55-cw-acct').fill('lab-mongoose');
		await f.locator('.o55-cw-token').fill('ghp_exampleExampleExample0000');
		await f.locator('.o55g-primary').click();
		await t.page.waitForTimeout(800);
		await f.locator('[data-action="pm51-source-cw-via"][data-via="https"]').first().click();
		await t.page.waitForTimeout(800);
		await f.locator('.o55g-primary').click();
		await t.page.waitForTimeout(800);
		await f.locator('[data-action="pm51-servers-key-check"]').first().click();
		await t.page.waitForTimeout(800);
		await f.locator('.o55g-primary').click();
		await t.page.waitForTimeout(1400);
		const g1 = await gh();
		await t.check('the account was added', (g1.accounts || []).length === (g0.accounts || []).length + 1, `${(g0.accounts || []).join(', ')} → ${(g1.accounts || []).join(', ')}`);
		for (const k of ['scopes', 'ssh', 'pushAccess', 'pushVia', 'pushKeyId']) await t.check(`adding it keeps the service's ${k}`, JSON.stringify(g1[k]) === JSON.stringify(g0[k]), `${JSON.stringify(g0[k])} → ${JSON.stringify(g1[k])}`);
		// FO-126 kept: two accounts listed, each with its own Disconnect
		const per = await f.locator(`${B} [data-action="pm51-source-account-disconnect"]`).count();
		await t.check('each signed-in account has its own Disconnect', per === (g1.accounts || []).length, `${per} buttons for ${(g1.accounts || []).length} accounts`);
		await closeAll(t, f);
		// Disconnect the whole service, then read the repositories
		await f.locator(`${B} .pm51-detail-actions [aria-label="More actions"]`).first().click();
		await f.locator('.pm51-popout [role="menuitem"]', { hasText: /^\s*Disconnect/ }).first().click();
		await t.page.waitForTimeout(300);
		await t.check('Disconnect asks first', await submit(t, f, 'Disconnect GitHub?'));
		await go(t, f, 'source', 'source-manager', 'repos');
		// Puppet-Master (a GitHub repository with no saved address in the fixture): its panel's Address
		await press(t, f, `${B} button[data-action="pm51-source-repo"][data-name="Puppet-Master"]`);
		const repo = panelOf(f, 'Puppet-Master');
		const text = (await repo.waitFor({ state: 'visible', timeout: 3000 }).then(() => repo.textContent()).catch(() => '')) || '';
		await t.check('Puppet-Master\'s panel opens with its address', /Address/.test(text) && /github\.com\//.test(text), text.replace(/\s+/g, ' ').slice(0, 160));
		await t.check('no repository address names "None" after Disconnect', !/\/None\//.test(text), (text.match(/\S*\/None\/\S*/g) || []).join(' ') || 'github address kept');
		await closeAll(t, f);
	};

	tests[`doctor: findings about other pages say what those pages say (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'system', 'doctor');
		const read = () => state(f, () => {
			const row = (key) => { const r = document.querySelector(`[data-continuous-workspace-body="doctor"] [data-row="${key}"]`); return r ? r.textContent.replace(/\s+/g, ' ').trim() : ''; };
			const S = PM12_KIMI.getState();
			const prov = (S.providers || []).find((p) => p.id === 'antigravity') || {};
			const gh = ((S.sourceControl || {}).forges || []).find((x) => x.id === 'github') || {};
			const kit = (PM51.s().backup || {}).recoveryKit || {};
			return { ag: row('ai:antigravity'), push: row('code:push'), kit: row('backups:kit'), agReady: prov.status === 'active', pushReady: gh.status === 'active' && gh.pushAccess === 'Ready', kitTested: !!kit.tested, kitSaved: !!kit.saved };
		});
		const r = await read();
		await t.check('Google Antigravity: Doctor and AI Providers agree', r.agReady ? /Antigravity ready/i.test(r.ag) && !/signed out|needs attention|has no/i.test(r.ag) : /signed out|needs attention|not installed|turned off|has no/i.test(r.ag), JSON.stringify({ doctor: r.ag, providerReady: r.agReady }));
		await t.check('Doctor uses the provider\'s current name', !/Antigravity CLI/.test(r.ag), r.ag);
		await t.check('GitHub push access: Doctor and Source Control agree', r.pushReady ? /push access ready/i.test(r.push) : /missing|not connected/i.test(r.push), JSON.stringify({ doctor: r.push, sourceReady: r.pushReady }));
		await t.check('Recovery Kit: Doctor and Backup & Restore agree', r.kitTested ? /tested/i.test(r.kit) && !/not tested/i.test(r.kit) : r.kitSaved ? /not tested/i.test(r.kit) : /not saved/i.test(r.kit), JSON.stringify({ doctor: r.kit, tested: r.kitTested, saved: r.kitSaved }));
		// change one owner by its own page (GitHub push access off by Disconnect) and come back
		await go(t, f, 'source', 'source-manager', 'services');
		await f.locator(`${body('source-manager')} .resource-row[data-id="github"]`).first().click().catch(() => {});
		await t.page.waitForTimeout(300);
		await f.locator(`${body('source-manager')} .pm51-detail-actions [aria-label="More actions"]`).first().click();
		await f.locator('.pm51-popout [role="menuitem"]', { hasText: /^\s*Disconnect/ }).first().click();
		await t.page.waitForTimeout(300);
		await t.check('Disconnect asks first', await submit(t, f, 'Disconnect GitHub?'));
		await go(t, f, 'system', 'doctor');
		const r2 = await read();
		await t.check('after GitHub is disconnected Doctor says so', !r2.pushReady && /not connected|missing/i.test(r2.push) && !/push access ready/i.test(r2.push), r2.push);
	};

	tests[`support: Collect support details and the checkup summary are two things (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'system', 'doctor');
		const B = body('doctor');
		const before = (await toasts(f)).length;
		const row = `${B} [data-setting="system.health.platform-diagnostics"], ${B} #setting-system\\.health\\.platform-diagnostics button`;
		const pressed = await press(t, f, row);
		if (!(await t.check('Collect support details is on the page', pressed))) return;
		const panel = panelOf(f, 'Support details');
		const opened = await panel.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
		let a = (await toasts(f)).slice(before).join(' | ');
		if (opened) {
			const txt = (await panel.textContent()).replace(/\s+/g, ' ');
			await t.check('it lists the computer and install details it collects', /Computer/.test(txt) && /Puppet Master/.test(txt) && /Left out/.test(txt), txt.slice(0, 200));
			await panel.locator('.drawer-footer button.primary, button.btn.primary').last().click();
			await t.page.waitForTimeout(400);
			a = (await toasts(f)).slice(before).join(' | ');
		}
		await closeAll(t, f);
		const mid = (await toasts(f)).length;
		const copy = await press(t, f, `${B} [data-action="pm51-doctor-copy"]`);
		const b = (await toasts(f)).slice(mid).join(' | ');
		await t.check('the two buttons give two different results', copy && a && b && a.split(' — ')[0] !== b.split(' — ')[0], `support: "${a}" / summary: "${b}"`);
		await t.check('the support copy names computer and install details', /computer|install/i.test(a), a);
	};

	tests[`reset: one setting, a section or everything, seen first (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		// change two settings in two sections, by their own rows
		// (set-up, not under test: two settings in two sections changed from their defaults)
		const pair = await f.evaluate(() => {
			const out = [];
			for (const id of ['system.health.readiness-badges', 'code.terminal.copy-on-select']) { const v = PM51.value(id); if (typeof v === 'boolean') out.push([id, v]); }
			const S = PM12_KIMI.getState(); S.settings = S.settings || {}; S.changed = S.changed || {};
			for (const [id, v] of out) { S.settings[id] = !v; S.changed[id] = true; }
			PM12_KIMI.setState(S);
			return out;
		});
		await t.check('two settings in two sections are changed', pair.length === 2, JSON.stringify(pair));
		await go(t, f, 'system', 'advanced');
		const ok = await press(t, f, `${body('advanced')} [data-setting="system.advanced.reset-defaults"]`);
		if (!(await t.check('Reset settings to defaults has its button', ok))) return;
		const d = dialog(f, 'Reset settings to defaults');
		await d.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
		const what = await d.locator('select[name="what"]').count() ? await d.locator('select[name="what"] option').allTextContents() : [];
		await t.check('it offers one setting, a section or everything', what.join('/') === 'One setting/A section/Everything', what.join('/') || 'no choice: one confirmation for everything');
		if (!what.length) { await closeAll(t, f); return; }
		// One setting: pick the first seeded one; the list shows that one only
		await d.locator('select[name="id"]').selectOption(pair[0][0]);
		await t.page.waitForTimeout(200);
		const listed = await d.locator('.o55-reset-list li').evaluateAll((li) => li.map((x) => x.dataset.settingId));
		await t.check('it lists what would change before anything happens', listed.length === 1 && listed[0] === pair[0][0], listed.join(', '));
		await d.locator('select[name="what"]').selectOption('everything');
		const all = await d.locator('.o55-reset-list li').evaluateAll((li) => li.map((x) => x.dataset.settingId));
		await t.check('Everything lists every changed setting', pair.every(([id]) => all.includes(id)), all.join(', '));
		await d.locator('select[name="what"]').selectOption('one');
		await d.locator('select[name="id"]').selectOption(pair[0][0]);
		await t.page.waitForTimeout(200);
		const one = pair[0][0];
		await d.locator('button[type="submit"]').click();
		await t.page.waitForTimeout(500);
		const left = await f.evaluate((ids) => { const S = PM12_KIMI.getState(); return ids.map((id) => [id, !!(S.changed || {})[id]]); }, pair.map((p) => p[0]));
		await t.check('only the one setting went back to its default', left.every(([id, ch]) => (id === one ? !ch : ch)), JSON.stringify(left));
	};

	tests[`words: plain drawers, protected paths, run pauses (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		const dev = /Typed owner-local|owner mutation|Native binding|EventRecord|Runtime receipt|Concept simulation only|Exact return|handler_unavailable|Local action/;
		const drawer = async (label) => {
			const okp = await press(t, f, `button.pm7-server-gap-consumer:has-text("${label}")`);
			if (!okp) return null;
			const d = f.locator('.drawer-wrap aside.drawer').last();
			await d.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
			const r = { name: await d.getAttribute('aria-label'), text: ((await d.textContent()) || '').replace(/\s+/g, ' ') };
			await closeAll(t, f);
			return r;
		};
		await go(t, f, 'system', 'updates');
		for (const label of ['Update logs', 'Release notes', 'Content update details']) {
			const r = await drawer(label);
			if (await t.check(`Updates › ${label} opens`, !!r)) await t.check(`Updates › ${label}: plain words, named by its button`, r.name === label && !dev.test(r.text), `${r.name}: ${r.text.slice(0, 160)}`);
		}
		await go(t, f, 'system', 'servers', 'home');
		for (const label of ['Project details', 'Where the files are']) {
			const r = await drawer(label);
			if (await t.check(`Server & Project Location › ${label} opens`, !!r)) await t.check(`${label}: plain words, named by its button`, r.name === label && !dev.test(r.text), `${r.name}: ${r.text.slice(0, 160)}`);
		}
		await go(t, f, 'safety', 'permissions', 'protected');
		const add = await press(t, f, `${body('permissions')} [data-action="pm51-permissions-path-add"]`);
		if (await t.check('Protected Files › Add path opens', add)) {
			const d = dialog(f, 'Add protected path');
			const sub = ((await d.locator('.dialog-sub').textContent().catch(() => '')) || '').trim();
			await t.check('the dialog explains ${projectRoot} without "workspace"', !/workspace/i.test(sub) && /\$\{projectRoot\} stands for/.test(sub), sub);
			await closeAll(t, f);
		}
		const pause = await f.evaluate(() => [PM51.valueLabel('safety.approvals.autonomy-mode', 'hands-off'), PM12_KIMI.getState().permissionProfiles.map((p) => p.name)]);
		await t.check('"How runs pause" does not reuse a profile\'s word', !pause[1].some((n) => n.split(' ')[0] === pause[0] || n.startsWith(pause[0])), `${pause[0]} vs ${pause[1].join(', ')}`);
		// canon (SSYS-051, DL-182): Keep Saved Scrollback (the default) or Session Only; the value is always one of the choices
		const ret = await f.evaluate(() => { const f0 = PM12_REFERENCE && Object.values(PM12_REFERENCE.byCat || {}).flatMap((c) => c.settings || []).find((r) => r.id === 'code.terminal.transcript-retention'); return { v: PM51.value('code.terminal.transcript-retention'), options: f0 ? f0.options : [] }; });
		await t.check('Keep terminal output for holds one of its own choices', ret.options.includes(ret.v), JSON.stringify(ret));
		await t.check('its choices are canon\'s two', JSON.stringify(ret.options) === JSON.stringify(['Keep Saved Scrollback', 'Session Only']), JSON.stringify(ret.options));
	};

	tests[`removed: Recently removed brings an item back (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await go(t, f, 'projects', 'project-history', 'cleanup');
		const B = body('project-history');
		if (!(await t.check('Cleanup has items to review', await press(t, f, `${B} [data-action="pm51-history-cleanup-review"]`)))) return;
		const review = panelOf(f, 'Cleanup review');
		const first = await review.locator('[data-action="pm51-history-cleanup-delete"]').first().getAttribute('data-id');
		await review.locator('[data-action="pm51-history-cleanup-delete"]').first().click();
		await t.page.waitForTimeout(350);
		await f.locator('.overlay [role="dialog"] button[type="submit"]').last().click();
		await t.page.waitForTimeout(500);
		const gone = await f.evaluate((id) => !(PM51.s().historyCleanup || []).some((g) => g.id === id), first);
		await t.check('the group left the review', gone);
		const back = await press(t, f, `${B} [data-action="pm51-history-restore"]`);
		await t.check('Recently removed has Bring back', back);
		const again = await f.evaluate((id) => (PM51.s().historyCleanup || []).some((g) => g.id === id) && !(PM51.s().historyQuarantine || []).length, first);
		await t.check('Bring back returns it to the review', again);
	};

	tests[`labels: a caller's own row label is the visible label and the control's name (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		// R6 (API, no PMConcept7 row shows it today: its two callers pass the rows.json label): PM51.bound.row and
		// PM51.settingRows with a label override drew rows.json's label and named the control with the override
		const r = await f.evaluate(() => {
			const read = (html) => { const d = document.createElement('div'); d.innerHTML = html; const lab = d.querySelector('.setting-label'); const ctl = d.querySelector('[aria-label][data-setting], [role="switch"][aria-label]'); return { visible: lab ? [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim() : '', name: ctl ? ctl.getAttribute('aria-label') : '', help: (d.querySelector('.setting-help, .setting-desc, .setting-description') || {}).textContent || '' }; };
			return { bound: read(PM51.bound.row('ai.accounts.opencode-enable', { label: 'Probe label B', help: 'Probe help B.' })), rows: read(PM51.settingRows(['ai.accounts.opencode-enable'], { overrides: { 'ai.accounts.opencode-enable': { label: 'Probe label S' } } })) };
		});
		await t.check('PM51.bound.row: the visible label is the caller\'s', r.bound.visible === 'Probe label B' && r.bound.name === 'Probe label B', JSON.stringify(r.bound));
		await t.check('PM51.bound.row: the help is the caller\'s', /Probe help B/.test(r.bound.help), JSON.stringify(r.bound));
		await t.check('PM51.settingRows override: the visible label is the caller\'s', r.rows.visible === 'Probe label S' && r.rows.name === 'Probe label S', JSON.stringify(r.rows));
	};

	tests[`choices: a row whose default changed by decision holds a value among its choices (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		// the rows whose canon default and choices changed together (settings_layer._canon_defaults): the page's
		// reference row offers canon's choices and the row's value is one of them
		const rows = await f.evaluate(() => {
			const ref = Object.values(PM12_REFERENCE.byCat || {}).flatMap((c) => c.settings || []);
			return ['code.terminal.transcript-retention', 'code.terminal.theme', 'code.terminal.font-family', 'ai.accounts.soft-warning-level', 'ai.accounts.hard-switch-level'].map((id) => {
				const r = ref.find((x) => x.id === id) || {};
				return { id, value: PM51.value(id), default: r.default, options: r.options || [] };
			});
		});
		for (const r of rows) {
			const opts = r.options.map(String);
			await t.check(`${r.id}: its default is one of its choices`, opts.includes(String(r.default)), JSON.stringify({ default: r.default, options: r.options.slice(0, 8) }));
			await t.check(`${r.id}: its value is one of its choices`, opts.includes(String(r.value)), JSON.stringify({ value: r.value, options: r.options.slice(0, 8) }));
		}
	};

	tests[`looks: the new panels fit and are on top in all ten looks (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const LOOKS = t.args.looks ? String(t.args.looks).split(',') : ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
		for (const look of LOOKS) {
			await t.step(look, async () => {
				const f = await settings(t, surface, [1390, 900]);
				await setLook(t, f, look);
				const fits = async (what, sel, buttons) => {
					const box = f.locator(sel).last();
					if (!(await t.check(`${look} ${what}: open`, await box.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false)))) return;
					await t.page.waitForTimeout(450);
					await guardLook(t, f, look, `${look} ${what}`);
					await t.noOverflow(`${look} ${what}: no overflow or clipped text`, { scope: sel });
					for (const b of buttons) await t.visible(f.locator(sel).last().locator(b).first(), `${look} ${what}: ${b} is on top`);
				};
				await go(t, f, 'system', 'advanced');
				await press(t, f, `${body('advanced')} [data-setting="system.advanced.reset-defaults"]`);
				await fits('Reset settings to defaults', '.overlay [role="dialog"][aria-label="Reset settings to defaults"]', ['select[name="what"]', 'button[type="submit"]']);
				await closeAll(t, f);
				await go(t, f, 'system', 'doctor');
				await press(t, f, `${body('doctor')} [data-setting="system.health.platform-diagnostics"]`);
				await fits('Support details', '.drawer-wrap aside.drawer[aria-label="Support details"]', ['button.primary']);
				await closeAll(t, f);
				await go(t, f, 'system', 'updates');
				await press(t, f, 'button.pm7-server-gap-consumer:has-text("Release notes")');
				await fits('Release notes', '.drawer-wrap aside.drawer[aria-label="Release notes"]', []);
				await closeAll(t, f);
				await go(t, f, 'system', 'backup', 'backup');
				await press(t, f, `${body('backup')} [data-action="pm51-backup-kit-test"]:not([aria-disabled="true"])`);
				await fits('Test Recovery Kit', '.drawer-wrap aside.drawer[aria-label="Test Recovery Kit"]', ['[data-action="pm51-backup-handoff-stepup"]']);
				await closeAll(t, f);
			});
		}
	};

	tests[`load: pins and key uses read the same before Source Control draws (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		const PIN = 'branching.worktrees.github-pinned-workflows';
		const before = await f.evaluate((id) => JSON.stringify(PM51.value(id) || []), PIN);
		await go(t, f, 'system', 'servers', 'servers');
		const usesBefore = await f.evaluate(() => [...document.querySelectorAll('[data-continuous-workspace-body="servers"] .o55-srv-keys .pm51-item')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
		await go(t, f, 'source', 'source-manager', 'actions');
		await go(t, f, 'source', 'source-manager', 'defaults');
		const after = await f.evaluate((id) => JSON.stringify(PM51.value(id) || []), PIN);
		await t.check('Pinned workflows read the same before and after the Actions tab draws', before === after, `${before} → ${after}`);
		await go(t, f, 'system', 'servers', 'servers');
		const usesAfter = await f.evaluate(() => [...document.querySelectorAll('[data-continuous-workspace-body="servers"] .o55-srv-keys .pm51-item')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
		await t.check('a key lists GitHub (Git) before Source Control has drawn', /GitHub \(Git\)/.test(usesAfter) ? /GitHub \(Git\)/.test(usesBefore) : true, `before: ${usesBefore.slice(0, 200)} / after: ${usesAfter.slice(0, 200)}`);
		await t.check('the key list was read', usesBefore.length > 0, usesBefore.slice(0, 120));
	};
}
