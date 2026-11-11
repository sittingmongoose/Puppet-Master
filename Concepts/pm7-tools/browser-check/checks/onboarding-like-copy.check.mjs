// FO-133 (stream F batch 11, lane A): onboarding's "Start like another Project?" against Plans/Settings_System.md
// SSYS-062 and the selector sets (GUIDED-FLOWS-CHECK.md rows 3.02, 3.04, 3.17,
// /mnt/Cursor/share/puppet-master/2026-11-09-settings-feedback/):
// - 3.02 Copy is offered whenever setup creates a new registry Project, including one that registers content: an existing
//   folder here, or a Project kept online. On the unchanged page only a brand-new Project gets the question (eligible()
//   required project_mode 'new'), so an existing folder went from its name straight to Keep your work safe.
// - 3.17 The default reads "Your usual settings" (the settings every Project shares), never "Start fresh" or
//   "Puppet Master's standard settings".
// - 3.04 Advanced chooses by kind (the eleven disjoint sets, with "Notifications & limits" and "About its own files",
//   which starts off), by single setting (the source's own values, each a switch, with a find field), by thing (each with
//   what it becomes here) and by account ("Use the same AI accounts and models", each account's readiness on the computer
//   that does the work). What comes along follows the picks, and the commit stages exactly the picked values: the
//   unchanged page only had category toggles.
// Runs in T3's sandbox by default (the onboarding window), on the normal page with --set sandbox=0.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';
import { paintedText } from '../helpers/painted-text.mjs';
import { LOOKS } from '../browser-check.config.mjs';
const LAYER = '#pm-o55-onboarding .o55-layer:not(.o55-out)';
async function open(t, at, scenario = 'returning') {
	await t.viewport(1440, 900);
	const f = await t.app.open({ sandbox: t.app.sandboxed(true), settleMs: 1500 });
	await f.evaluate(([at, sc]) => O55.studio.onboarding.screen(at, sc), [at, scenario]);
	await screen(f, at);
	return f;
}
async function screen(f, id, timeout = 20000) {
	await f.waitForFunction((x) => window.O55 && O55.S && O55.S.sess && O55.S.sess.screen === x, id, { timeout });
	await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer').length === 1, null, { timeout: 8000 }).catch(() => {});
	await f.waitForTimeout(350);
}
const next = (f) => f.locator('#pm-o55-onboarding .o55-foot [data-o55-do="next"]:visible').last().click();
const text = (f) => f.evaluate((L) => (document.querySelector(L) || {}).innerText || '', LAYER);
async function press(f, action, arg) { let sel = `${LAYER} [data-o55-do="${action}"]`; if (arg != null) sel += `[data-arg=${JSON.stringify(String(arg))}]`; await f.locator(sel).filter({ visible: true }).first().click(); await f.waitForTimeout(260); }
const toggles = (f, action) => f.evaluate(([L, a]) => [...document.querySelectorAll(`${L} .o55-sheet [data-o55-do="${a}"]`)].map((b) => ({ arg: b.getAttribute('data-arg'), on: b.getAttribute('aria-checked') === 'true', title: (b.querySelector('.o55-toggletitle') || {}).textContent || '', sub: (b.querySelector('.o55-togglesub') || {}).textContent || '' })), [LAYER, action]);
async function toLike(t, f, name) {
	await f.locator('[data-o55-bind="name"]').fill(name); await f.waitForTimeout(150);
	await next(f);
	await f.waitForFunction(() => ['like', 'safe'].includes(O55.S.sess.screen), null, { timeout: 15000 });
	await f.waitForTimeout(500);
	return f.evaluate(() => O55.S.sess.screen);
}
const KIND_TITLES = ['Look and layout', 'Assistant and chat', 'AI accounts and models', 'Planning and Goals', 'Automation', 'Tools and connections', 'Testing, browser and devices', 'Permissions and safety', 'Memory and history', 'Notifications & limits', 'About its own files'];

export const tests = {
	async '3.17: the default reads Your usual settings'(t) {
		const f = await open(t, 'name');
		const at = await toLike(t, f, 'Notes');
		await t.check('a new Project with Projects to copy asks', at === 'like', at);
		const body = await text(f);
		const card = await f.evaluate((L) => { const b = document.querySelector(`${L} [data-o55-do="pick"][data-arg="fresh"]`); return b ? { title: b.querySelector('.o55-cardtitle').textContent, sub: (b.querySelector('.o55-cardsub') || {}).textContent, on: b.getAttribute('aria-checked') } : null; }, LAYER);
		await t.check('the default card is Your usual settings, the settings every Project shares, chosen', card && card.title === 'Your usual settings' && card.sub === 'The settings every Project shares' && card.on === 'true', JSON.stringify(card));
		await t.check('no Start fresh or standard settings anywhere on the screen', !/Start fresh|standard settings|begin fresh/i.test(body), body.slice(0, 300));
		const review = await f.evaluate(() => O55.t('review.fresh'));
		await t.check('Review says Your usual settings too', review === 'Your usual settings', review);
	},
	async '3.02: an existing folder and a Project kept online are offered the copy; a restore is not'(t) {
		/* through Begin, as a person goes: an existing folder on this computer */
		let A = onboardingApp(t); await A.boot({ scenario: 'returning' });
		await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'existing'); await A.click('sub', 'folder');
		await A.click('next', undefined, 'ex-folder'); await A.click('pick', '~/Desktop/garden notes');
		await A.waitEnabled('next'); await A.click('next', undefined, 'name');
		await A.fill('o55f-name', 'Garden notes'); await A.click('next'); await A.sleep(700);
		let s = await A.snap();
		await t.check('an existing folder (registered now) is asked Start like another Project?', s.screen === 'like' && s.draft.project_mode === 'existing_local', JSON.stringify({ screen: s.screen, mode: s.draft.project_mode }));
		/* a Project kept online */
		A = onboardingApp(t); await A.boot({ scenario: 'returning' });
		await A.click('pick', 'this'); await A.click('next', undefined, 'begin'); await A.click('pick', 'existing'); await A.click('sub', 'online');
		await A.click('next', undefined, 'online-service'); await A.service('github', 'hosted');
		/* (the returning world is already signed in to GitHub: the account is offered, or a sign-in runs) */
		if (await A.has('signIn')) { await A.click('signIn'); await A.waitFor(() => O55.S.sess.signin.state === 'done', null, 15000); }
		await A.waitEnabled('next'); await A.click('next', undefined, 'ex-repos');
		const repo = (await A.snap()).buttons.find((b) => b.action === 'pick'); await A.click('pick', repo.arg); await A.click('next', undefined, 'name');
		await A.click('next'); await A.sleep(700);
		s = await A.snap();
		await t.check('a Project kept online (registered now) is asked too', s.screen === 'like' && s.draft.project_mode === 'existing_online', JSON.stringify({ screen: s.screen, mode: s.draft.project_mode }));
		const f = A.frame();
		const rules = await f.evaluate(() => { const d = O55.S.sess.drafts.main, was = d.project_mode; const out = {}; for (const m of ['restore', 'later', 'new', 'existing_local', 'existing_online']) { d.project_mode = m; out[m] = O55.like.registers(O55.S); } d.project_mode = was; return out; });
		await t.check('a restore and Later carry no copy; new, folder and online do', !rules.restore && !rules.later && rules.new && rules.existing_local && rules.existing_online, JSON.stringify(rules));
		const cleared = await f.evaluate(() => { const d = JSON.parse(JSON.stringify(O55.S.sess.drafts.main)); d.settings_transfer = Object.assign({}, d.settings_transfer, { mode: 'copy_from_project', source_project_id: 'tastebook' }); d.project_mode = 'restore'; O55.draft.normalize(d); return d.settings_transfer.mode; });
		await t.check('a plan that becomes a restore drops a copy it held', cleared === 'start_fresh', cleared);
	},
	async '3.04: Advanced chooses by kind, by setting, by thing and by account, and the commit copies exactly that'(t) {
		const f = await open(t, 'name');
		await toLike(t, f, 'Picked copy');
		/* Tastebook's saved settings are the ones in use now (your usual ones), so only its things and accounts come along */
		await press(f, 'pick', 'tastebook');
		let body = await text(f);
		await t.check('a source whose settings are your usual ones says none come along, and still names its things and accounts', /None of its settings come along/.test(body) && /Its own things: Filesystem MCP and Reviewer/.test(body) && /AI accounts and models it uses: Claude/.test(body), body.slice(0, 600));
		await press(f, 'pick', 'harbor');
		body = await text(f);
		await t.check('Harbor: what comes along names its own settings, things and accounts', /Its \d+ settings that differ from your usual ones/.test(body) && /Its own things: Figma MCP and Release Notes/.test(body) && /AI accounts and models it uses: Claude and /.test(body), body.slice(0, 600));
		await t.check('an account not signed in here keeps the account and says you sign in later', /isn't signed in on this computer/.test(body), body.slice(0, 800));
		await press(f, 'choose');
		const kinds = await toggles(f, 'cat');
		t.log(JSON.stringify(kinds.map((k) => [k.title, k.on, k.sub])));
		await t.check('eleven kinds, in the owner’s words', JSON.stringify(kinds.map((k) => k.title)) === JSON.stringify(KIND_TITLES), JSON.stringify(kinds.map((k) => k.title)));
		await t.check('About its own files starts off; the ten kinds start on', kinds.every((k) => k.on === (k.title !== 'About its own files')), JSON.stringify(kinds.map((k) => [k.title, k.on])));
		let rows = await toggles(f, 'pickrow');
		await t.check('single settings: each of its own values is a switch, usual beside its value', rows.length > 0 && rows.every((r) => r.on && /Usual: .+ → Harbor: .+/.test(r.sub)), JSON.stringify(rows.slice(0, 3)));
		const things = await toggles(f, 'thing');
		await t.check('its own things, each with what it becomes here', things.length === 2 && things.every((x) => x.on && x.sub.length > 10), JSON.stringify(things));
		const acct = await f.evaluate((L) => { const b = document.querySelector(`${L} .o55-sheet [data-o55-do="accts"]`); return { on: b && b.getAttribute('aria-checked'), rows: [...document.querySelectorAll(`${L} .o55-sheet .o55-row`)].map((r) => r.innerText.replace(/\s+/g, ' ')) }; }, LAYER);
		await t.check('Use the same AI accounts and models is on, with each account’s readiness here', acct.on === 'true' && acct.rows.some((r) => /Claude/.test(r) && /Ready on this computer/.test(r)) && acct.rows.some((r) => !/Claude/.test(r) && /Sign in on this computer after it.s made/.test(r)), JSON.stringify(acct));
		const n0 = await f.evaluate(() => O55.like.selection(O55.S).count);
		/* a kind off: its values leave the list and the count */
		const tk = kinds.find((k) => k.on && k.title !== 'AI accounts and models' && /different/.test(k.sub));
		await press(f, 'cat', tk.arg);
		const n1 = await f.evaluate(() => O55.like.selection(O55.S).count), drop = Number((tk.sub.match(/\d+/) || [0])[0]);
		await t.check(`${tk.title} off takes its ${drop} values out`, n1 === n0 - drop, JSON.stringify({ n0, n1, drop }));
		/* one value off */
		rows = await toggles(f, 'pickrow');
		const one = rows[0];
		await press(f, 'pickrow', one.arg);
		const sel = await f.evaluate(() => O55.like.selection(O55.S));
		await t.check('one setting off takes exactly that one out', sel.count === n1 - 1 && sel.excluded.includes(one.arg), JSON.stringify({ count: sel.count, out: sel.excluded.includes(one.arg) }));
		/* find a setting */
		const word = (rows[1] || rows[0]).title.split(/\s+/)[0];
		await f.locator(`${LAYER} [data-o55-bind="likeFind"]`).fill(word); await f.waitForTimeout(400);
		const found = await toggles(f, 'pickrow');
		await t.check('Find a setting narrows the list to matching names', found.length > 0 && found.length <= rows.length && found.every((r) => (r.title + ' ' + r.arg).toLowerCase().includes(word.toLowerCase())), JSON.stringify({ word, n: found.length, of: rows.length }));
		await f.locator(`${LAYER} [data-o55-bind="likeFind"]`).fill(''); await f.waitForTimeout(300);
		/* a thing off, then the accounts off */
		await press(f, 'thing', 'release-notes');
		await press(f, 'accts');
		const after = await f.evaluate(() => O55.like.selection(O55.S));
		const aiLeft = await f.evaluate(() => O55.like.plan(O55.S, 'harbor').rows.filter((x) => x.kind === 'providers_accounts_models_routing').length);
		await t.check('accounts off: no AI account or model value comes along, and no account', aiLeft === 0 && after.accounts.length === 0, JSON.stringify({ aiLeft, accounts: after.accounts }));
		await t.check('the thing switched off stays behind', JSON.stringify(after.things) === JSON.stringify(['figma-mcp']), JSON.stringify(after.things));
		await t.shot('like-advanced', 'Advanced: kinds, single settings, things and accounts');
		await press(f, 'sheet-close');
		body = await text(f);
		await t.check('what comes along follows the picks', new RegExp(`Its ${after.count} settings that differ`).test(body) && /Its own things: Figma MCP\./.test(body) && !/AI accounts and models it uses/.test(body), body.slice(0, 500));
		/* the commit stages exactly the picked values */
		const want = await f.evaluate(() => { const s = O55.like.selection(O55.S); return { count: s.count, ids: O55.like.plan(O55.S, 'harbor').rows.map((x) => x.id) }; });
		await next(f); await screen(f, 'safe'); await next(f); await screen(f, 'review');
		await f.locator('[data-o55-do="commit"]').click(); await screen(f, 'creating');
		await f.waitForFunction(() => { const cm = O55.S.sess.commit; return cm && (cm.settingsCount != null || cm.settingsError); }, null, { timeout: 30000 }).catch(() => {});
		const cm = await f.evaluate(() => { const cm = O55.S.sess.commit; return { count: cm.settingsCount, err: cm.settingsError || null }; });
		await t.check('the commit copies exactly the values left picked', cm.count === want.count && !cm.err, JSON.stringify({ cm, want: want.count }));
	},
	async '3.04: a copy whose picks carry no setting value (only things and accounts) still creates the Project'(t) {
		const f = await open(t, 'name');
		await toLike(t, f, 'Things only');
		await press(f, 'pick', 'tastebook');
		const sel = await f.evaluate(() => O55.like.selection(O55.S));
		await t.check('Tastebook brings no setting value, only its things and account', sel.count === 0 && sel.things.length === 2 && sel.accounts.length === 1, JSON.stringify(sel));
		await next(f); await screen(f, 'safe'); await next(f); await screen(f, 'review');
		await f.locator('[data-o55-do="commit"]').click(); await screen(f, 'creating');
		const ok = await f.waitForSelector('#pm-o55-onboarding .o55-foot [data-o55-do="next"]:not([disabled]):not([aria-disabled="true"])', { timeout: 30000 }).then(() => true, () => false);
		const cm = await f.evaluate(() => { const cm = O55.S.sess.commit; return { state: cm.state, settings: cm.receipts && cm.receipts.settings, publishError: cm.settingsPublishError || null, project: cm.projectId || null }; });
		await t.check('the Project is created and listed; nothing is staged and nothing is missing', ok && !cm.publishError && cm.settings === 'no-change' && !!cm.project, JSON.stringify(cm));
	},
	async 'every look: Advanced’s kinds, single settings, things and accounts paint readable ink'(t) {
		const f = await open(t, 'name');
		await toLike(t, f, 'Looks');
		await press(f, 'pick', 'harbor'); await press(f, 'choose');
		for (const look of LOOKS) {
			await t.app.look(look); await f.waitForTimeout(350);
			for (const [what, sel] of [['a kind', '.o55-like-kinds .o55-toggletitle'], ['a kind’s count', '.o55-like-kinds .o55-togglesub'], ['a single setting', '.o55-like-single .o55-togglesub'], ['a thing', '.o55-like-things .o55-toggletitle'], ['an account’s readiness', '.o55-like-accts .o55-rowmeta']]) {
				const el = f.locator(`${LAYER} .o55-sheet ${sel}`).first();
				await el.scrollIntoViewIfNeeded().catch(() => {});
				const p = await paintedText(el);
				await t.check(`${look}: ${what} paints readable ink`, p.paintedCount >= 10, JSON.stringify([p.count, p.paintedCount, p.minimum]));
			}
		}
	}
};
