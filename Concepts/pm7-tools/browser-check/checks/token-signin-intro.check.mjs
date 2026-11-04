// FO-32 and its variant: the sign-in screen's introduction says only what the screen shows, on every service with an
// access token. For Forgejo and Gitea (a token only) and for GitHub Enterprise, GitLab on its own server, Azure DevOps
// Server and Bitbucket Data Center (Use an access token instead), from Demo Studio › Onboarding › Open at one screen ›
// online-service, by real clicks: the service picked, its address from the demo hint, Continue, the token form shown.
//   token form   the introduction points below to what the token can reach, and that note is below it;
//   signed in    with the demo token: the introduction is the signed-in one, with no forward reference ("below") and no
//                service page that never opened ("'s page shows"); the same after Plain English and Expert switch.
// A browser sign-in's introduction names the service's page (GitHub.com, checked first). On main before the fix the four
// browser-first services kept "{name}'s page shows the access it asks for" over the token form and after the token
// signed in (FO-32's variant; Forgejo and Gitea were fixed by ec4c3a3b6a). Both surfaces with --set sandbox=0/1.
// About 2 minutes. --set only=gitea,gitlab runs some services.
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const CASES = [['gitea', null], ['forgejo', null], ['github_enterprise', null], ['gitlab', 'self_managed'], ['azure_devops', 'self_managed'], ['bitbucket_cloud', 'data_center']];

async function openAt(t, f, screen) {
	await f.evaluate(() => window.O55.studio.open('onboarding'));
	await f.waitForSelector('#pmds-sheet [data-pmds-do="open-screen"]', { timeout: 15000 });
	await f.click('#pmds-sheet [data-pmds-do="pick-base"][data-arg="fresh"]');
	for (let i = 0; i < 12; i++) {
		const on = f.locator('#pmds-sheet [data-pmds-do="pick-twist"][aria-checked="true"]');
		if (!(await on.count())) break;
		await on.first().click(); await t.page.waitForTimeout(150);
	}
	const row = f.locator(`#pmds-sheet [data-pmds-do="open-screen"][data-arg="${screen}"]`);
	await row.scrollIntoViewIfNeeded(); await row.click();
	return f.waitForFunction((s) => window.O55.S.open && window.O55.S.sess.screen === s, screen, { timeout: 15000 }).then(() => true, () => false);
}
/* the screen as shown: its introduction, what lies under it, and the copy it is judged against */
const READ = (L) => {
	const l = document.querySelector(L), lead = l && l.querySelector('.o55-lead'), si = window.O55.S.sess.signin || {};
	const after = lead ? [...l.querySelectorAll('.o55-note, .o55-hint')].filter((n) => lead.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING && n.getClientRects().length).map((n) => n.textContent.trim()) : [];
	const T = (k) => window.O55.t(k, { name: si.name });
	return { screen: window.O55.S.sess.screen, state: si.state, name: si.name, talk: window.O55.talk.mode(), lead: lead ? lead.textContent.trim() : null, after,
		leadToken: T('online.signin.leadToken'), leadTokenDone: T('online.signin.leadTokenDone'), leadBrowser: T('online.signin.lead'),
		/* the note of what a token made for this service reaches, in the words of the mode in use (either purpose) */
		reach: ['New', 'Existing'].map((p) => { let host = si.name; try { host = new URL(window.O55.S.sess.drafts.main.forge_instance_url).host; } catch (_) {} return window.O55.talk.t('online.signin.scopes.' + si.service + '.reach' + p, { host }); }) };
};
async function click(t, f, sel) {
	const el = f.locator(`${LAYER} ${sel}`).first();
	if (!(await el.count()) || !(await el.isVisible())) return false;
	await el.scrollIntoViewIfNeeded(); await el.click(); await t.page.waitForTimeout(450); return true;
}
/* the demo hint that works (Demo Studio's sample address or token), clicked like any button */
async function works(t, f) {
	const i = await f.evaluate((L) => { const w = window.O55.t('demoHint.outcome.works'); return [...document.querySelectorAll(L + ' [data-o55-do="demoHint"]')].findIndex((e) => (e.querySelector('.o55-demohint-o') || {}).textContent === w); }, LAYER);
	if (i < 0) return false;
	const el = f.locator(`${LAYER} [data-o55-do="demoHint"]`).nth(i);
	await el.scrollIntoViewIfNeeded(); await el.click(); await t.page.waitForTimeout(450); return true;
}
const dangles = (s) => /\bbelow\b/i.test(s) || /'s page shows/i.test(s);

export default async function (t) {
	const only = t.args.only ? String(t.args.only).split(',') : null;
	await t.step('github.com (browser)', async () => {
		const f = await t.app.open();
		if (!(await openAt(t, f, 'online-service'))) return t.check('online-service opens from its row', false, 'not opened', { hard: true });
		await t.page.waitForTimeout(600);
		await click(t, f, '[data-o55-do="pick"][data-arg="github"]');
		await click(t, f, '.o55-primary');
		await f.waitForFunction(() => window.O55.S.sess.screen === 'online-signin', null, { timeout: 10000 }).catch(() => {});
		await t.page.waitForTimeout(700);
		const r = await f.evaluate(READ, LAYER);
		await t.check('github.com: the browser sign-in names the service page', r.screen === 'online-signin' && r.lead === r.leadBrowser, JSON.stringify(r));
	});
	for (const [svc, variant] of CASES) {
		if (only && !only.includes(svc) && !only.includes(svc.split('_')[0])) continue;
		const name = svc + (variant ? ' ' + variant : '');
		await t.step(name, async () => {
			const f = await t.app.open();
			if (!(await openAt(t, f, 'online-service'))) return t.check(`${name}: online-service opens from its row`, false, 'not opened', { hard: true });
			await t.page.waitForTimeout(600);
			if (!(await click(t, f, `[data-o55-do="pick"][data-arg="${svc}"]`))) { await click(t, f, '[data-o55-do="others"]'); await click(t, f, `[data-o55-do="pick"][data-arg="${svc}"]`); }
			if (variant) await click(t, f, `[data-o55-do="variant"][data-arg="${variant}"]`);
			await works(t, f);
			await click(t, f, '.o55-primary');
			const there = await f.waitForFunction(() => window.O55.S.sess.screen === 'online-signin', null, { timeout: 10000 }).then(() => true, () => false);
			if (!(await t.check(`${name}: reaches the sign-in`, there, 'screen ' + (await f.evaluate(() => window.O55.S.sess.screen)), { hard: true }))) return;
			await t.page.waitForTimeout(700);
			/* a service that also signs in in the browser: its token form, by its own link */
			await click(t, f, '[data-o55-do="tokenOn"]');
			let r = await f.evaluate(READ, LAYER);
			const field = await f.evaluate((L) => !!document.querySelector(L + ' [data-o55-bind="token"]'), LAYER);
			await t.check(`${name}: the token form is on show`, field, JSON.stringify(r));
			await t.check(`${name}: over the token form the introduction points to what the token reaches, and that note is below it`,
				r.lead === r.leadToken && r.after.some((x) => r.reach.includes(x)), `lead "${r.lead}"; below: ${JSON.stringify(r.after.slice(0, 3))}`);
			await works(t, f);
			const signed = await f.waitForFunction(() => (window.O55.S.sess.signin || {}).state === 'done', null, { timeout: 10000 }).then(() => true, () => false);
			await t.page.waitForTimeout(600);
			r = await f.evaluate(READ, LAYER);
			await t.check(`${name}: signed in with the token`, signed, JSON.stringify(r));
			await t.check(`${name}: signed in: the introduction is the signed-in one, with no reference to anything not shown`, r.lead === r.leadTokenDone && !dangles(r.lead), `lead "${r.lead}" (${r.talk})`);
			/* Plain English and Expert: the introduction has one version (DL-126), so it holds after the switch */
			await f.locator('#pm-o55-onboarding button.o55-talk').first().click();
			await t.page.waitForTimeout(600);
			const r2 = await f.evaluate(READ, LAYER);
			await t.check(`${name}: signed in, after ${r.talk} › ${r2.talk}: still the signed-in introduction`, r2.talk !== r.talk && r2.lead === r2.leadTokenDone && !dangles(r2.lead), `lead "${r2.lead}" (${r2.talk})`);
		});
	}
}
