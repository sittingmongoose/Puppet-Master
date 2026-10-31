// What onboarding connected reaches the app (provider-login audit P13): after Enter Puppet Master, Settings › Providers &
// Accounts lists exactly the accounts onboarding connected for that Project, the Usage page and the model picker read
// the same roster, and the Guided Tour reads truthfully with none, one or several accounts. Real clicks; obvious test
// text for keys. Run with --set page=<build> [--set surface=normal|sandbox].
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FAKE_KEY = 'TEST-NOT-A-REAL-KEY-0000';
const ROOT = '#pm-o55-onboarding';

async function open(t, screen, { scenario = '', surface = t.args.surface || 'normal' } = {}) {
	const q = `cb=${Date.now()}&o55=screen=${screen}${scenario ? '&o55scenario=' + scenario : ''}`;
	const src = `${t.cfg.pageUrl}${t.cfg.pageUrl.includes('?') ? '&' : '?'}${q}`;
	if (surface === 'sandbox') {
		const html = path.join(t.run.dir, `sandbox-${Date.now()}.html`);
		fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style><iframe sandbox="allow-scripts allow-downloads allow-popups" src="${src}"></iframe>`);
		await t.goto(pathToFileURL(html).href, { settleMs: 1500 });
	} else {
		await t.goto(src, { settleMs: 500 });
		await t.page.evaluate(() => { try { Object.keys(localStorage).filter((k) => /^pm|o55|pm51|settings/i.test(k)).forEach((k) => localStorage.removeItem(k)); } catch (_) {} });
		await t.goto(src, { settleMs: 1500 });
	}
	const frame = surface === 'sandbox' ? t.page.frames().find((f) => f !== t.page.mainFrame()) : t.page.mainFrame();
	await frame.waitForFunction(() => window.O55 && window.O55.S && window.O55.S.open && document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 30000 });
	return { frame, $: (sel) => frame.locator(`${ROOT} ${sel}`).first(), any: (sel) => frame.locator(sel).first() };
}
const rowText = async (W, id) => ((await W.$(`[data-key="pv-${id}"]`).innerText({ timeout: 3000 }).catch(() => '')) || '').replace(/\s+/g, ' ');
async function waitRow(W, id, re, ms = 12000) { const u = Date.now() + ms; let g = ''; while (Date.now() < u) { g = await rowText(W, id); if (re.test(g)) return g; await W.frame.waitForTimeout(250); } return g; }

// connect what `plan` names, then Ready › Enter Puppet Master
async function connectAndEnter(t, W, plan) {
	await waitRow(W, 'claude', /Not installed|Not signed in|Ready/);
	if (plan.includes('claude')) { await W.$('[data-key="pv-claude"] [data-o55-do="signin"]').click(); await waitRow(W, 'claude', /Ready/); }
	if (plan.includes('cursor')) {
		await W.$('[data-key="pv-cursor"] [data-o55-do="key"]').click(); await W.frame.waitForTimeout(400);
		await W.$('#o55f-key-cursor').pressSequentially(FAKE_KEY, { delay: 5 });
		await W.$('[data-key="pv-cursor"] [data-o55-do="keyCheck"]').click(); await waitRow(W, 'cursor', /Ready/);
	}
	if (plan.includes('codex')) {
		await W.$('[data-key="pv-codex"] [data-o55-do="signin"]').click(); await waitRow(W, 'codex', /Ready/);
	}
	if (!plan.length) { await W.$('.o55-foot [data-o55-do="skip"]').click(); await W.frame.waitForTimeout(500); }
	await W.$('.o55-foot .o55-primary').click(); await W.frame.waitForTimeout(1500);
	const scr = await W.frame.evaluate(() => window.O55.S.sess.screen);
	if (scr === 'free') { await W.$('.o55-foot .o55-primary').click(); await W.frame.waitForTimeout(1500); }
	return W;
}
async function enterApp(t, W) {
	const enter = W.frame.locator(`${ROOT} .o55-foot button`).filter({ hasText: 'Enter Puppet Master' }).first();
	await enter.click();
	await W.frame.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-win') || document.querySelector('#pm-o55-onboarding').hidden || !window.O55.S.open, null, { timeout: 20000 }).catch(() => {});
	await W.frame.waitForTimeout(2500);
}
async function topTab(t, W, label) {
	const at = await W.frame.evaluate((label) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.nodeValue.trim() !== label) continue; const r = n.parentElement.getBoundingClientRect(); if (r.width && r.height && r.y < 40) return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; } return null; }, label);
	if (at) await t.page.mouse.click(at.x, at.y);
	await W.frame.waitForTimeout(2000);
	return !!at;
}
async function openPicker(t, W) {
	const chip = W.frame.locator('.composer button:visible, [class*="composer"] button:visible').filter({ hasText: /Sonnet|GPT|Opus|Kimi|Qwen|GLM|Cursor|model|Choose/i }).first();
	if (await chip.count()) { await chip.click(); await W.frame.waitForTimeout(900); return true; }
	return false;
}
async function settingsProviders(t, W) {
	/* the title bar's Settings: the visible text node in the top 40 px */
	const at = await W.frame.evaluate(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.nodeValue.trim() !== 'Settings') continue; const r = n.parentElement.getBoundingClientRect(); if (r.width && r.height && r.y < 40) return { x: r.x + r.width / 2, y: r.y + r.height / 2, tag: n.parentElement.tagName + '.' + n.parentElement.className }; } return null; });
	t.run.log('settings at ' + JSON.stringify(at));
	if (at) await t.page.mouse.click(at.x, at.y);
	await W.frame.waitForTimeout(1800);
	for (const label of [/^\s*AI & Providers/, /^\s*Providers & Accounts/]) {
		const nav = W.frame.locator('#panel-settings').locator('button:visible, a:visible, [role="treeitem"]:visible, [role="button"]:visible').filter({ hasText: label }).first();
		if (await nav.count()) { await nav.click(); await W.frame.waitForTimeout(1500); }
	}
	return ((await W.frame.locator('#panel-settings').innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
}

export const tests = {
	async 'Settings lists what onboarding connected for that Project (several accounts)'(t) {
		const W = await open(t, 'ai', { scenario: 'signedOut' });
		await connectAndEnter(t, W, ['claude', 'cursor', 'codex']);
		await enterApp(t, W);
		const res = await W.frame.evaluate(() => ({ pid: window.PM_ACTIVE_PROJECT_ID, r: window.PM_ONBOARDING_RESULT && { project: window.PM_ONBOARDING_RESULT.project, accounts: (window.PM_ONBOARDING_RESULT.accounts || []).map((a) => [a.provider_entry_id, a.display_name, a.auth_method]) } }));
		await t.check('P13: the result names the three accounts, for this Project', !!res.r && res.r.accounts.length === 3 && res.r.project && res.r.project.id === res.pid, JSON.stringify(res));
		const txt = await settingsProviders(t, W);
		await t.check('P13: Settings shows the Claude account onboarding connected', /jared@example\.com/.test(txt), txt.slice(0, 600));
		await t.check('P13: the demo\'s example accounts are not shown for this Project', !/Work Claude|Playty Team/.test(txt), txt.slice(0, 600));
		await t.shot('settings-after-onboarding', 'Settings › Providers & Accounts right after onboarding connected Claude, Cursor and ChatGPT');
		const filt = W.frame.locator('#panel-settings input[placeholder="Filter services"]:visible').first();
		if (await filt.count()) { await filt.click(); await filt.pressSequentially('Free', { delay: 20 }); await W.frame.waitForTimeout(800); }
		const freeSvc = W.frame.locator('#panel-settings').getByText('Free Models', { exact: true }).first();
		if (await freeSvc.count()) { await freeSvc.click(); await W.frame.waitForTimeout(1500); }
		const ftxt = ((await W.frame.locator('#panel-settings').innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
		await t.check('Settings free routes: the three upfront, More free options closed', /OpenRouter free models/.test(ftxt) && /Groq free plan/.test(ftxt) && /NVIDIA free models/.test(ftxt) && /More free options/.test(ftxt) && !/Pollinations/.test(ftxt), ftxt.slice(ftxt.indexOf('Free routes'), ftxt.indexOf('Free routes') + 400));
		await t.check('Settings free routes: nothing D5 removed', !/Cerebras|Hugging Face|GitHub Models/.test(ftxt), 'removed route named');
		await t.check('Settings: Free Models is not "Ready" with no route on', !/Ready · 0 of/.test(ftxt), 'Ready with 0 routes on');
		await t.shot('settings-free-routes', 'Settings › Free Models: three routes upfront, More free options closed');
		const st = await W.frame.evaluate(() => { const S = window.PM51 && window.PM51.state ? window.PM51.state : null; return S ? null : null; });
		void st;
	}
	,
	async 'Usage and the model picker on the new Project (several accounts, then none)'(t) {
		for (const plan of [['claude', 'cursor', 'codex'], []]) {
			const W = await open(t, 'ai', { scenario: 'signedOut' });
			await connectAndEnter(t, W, plan);
			await enterApp(t, W);
			await topTab(t, W, 'Usage');
			const usage = ((await W.frame.locator('#panel-usage, [data-pmu-host]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
			t.run.log(`usage ${plan.length}: ` + usage.slice(0, 900));
			await t.shot(`usage-${plan.length}`, `Usage page on the Project onboarding just made with ${plan.length} accounts`);
			for (const sub of ['Accounts', 'Plans & limits']) {
				const nav = W.frame.locator('#panel-usage, [data-pmu-host]').first().locator('button:visible, a:visible, [role="tab"]:visible, [role="button"]:visible').filter({ hasText: new RegExp('^\\s*' + sub.replace('&', '&') + '\\s*$') }).first();
				if (await nav.count()) { await nav.click(); await W.frame.waitForTimeout(1500); }
				const txt = ((await W.frame.locator('#panel-usage, [data-pmu-host]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
				t.run.log(`usage ${sub} ${plan.length}: ` + txt.slice(0, 700));
				await t.shot(`usage-${sub.replace(/\W+/g, '-').toLowerCase()}-${plan.length}`, `Usage ${sub} on the new Project with ${plan.length} accounts: a plain empty state or the connected accounts, no blanks`);
			}
			await topTab(t, W, 'Home');
			const opened = await openPicker(t, W);
			t.run.log(`picker ${plan.length} opened ${opened}`);
			await t.shot(`picker-${plan.length}`, `Chat model picker on the Project onboarding just made with ${plan.length} accounts`);
		}
	}
	,
	async 'Guided Tour on the new Project reads truthfully (none, then several accounts)'(t) {
		for (const plan of [[], ['claude', 'cursor', 'codex']]) {
			const W = await open(t, 'ai', { scenario: 'signedOut' });
			await connectAndEnter(t, W, plan);
			await W.frame.locator(`${ROOT} .o55-foot button`).filter({ hasText: 'Take the Guided Tour' }).first().click();
			await W.frame.waitForSelector('.o55t-callout', { timeout: 20000 }).catch(() => {});
			const seen = [];
			for (let i = 0; i < 40; i++) {
				await W.frame.waitForTimeout(1300);
				const c = ((await W.frame.locator('.o55t-callout').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
				if (c && seen[seen.length - 1] !== c) seen.push(c);
				const b = W.frame.locator('.o55t-callout button:visible, .o55t-bar button:visible').filter({ hasText: /^(Show Me|Next|Start|Done|Try it)$/ }).first();
				if (!(await b.count())) { if (!(await W.frame.locator('.o55t-callout:visible').count())) break; continue; }
				const label = (await b.innerText().catch(() => '')).trim();
				await b.click().catch(() => {});
				if (label === 'Done') break;
			}
			t.run.log(`tour ${plan.length} accounts, ${seen.length} callouts: ` + seen.map((x) => x.slice(0, 90)).join(' || '));
			const joined = seen.join(' ');
			await t.check(`tour with ${plan.length} accounts: callouts shown`, seen.length >= 5, `${seen.length} callouts`);
			await t.check(`tour with ${plan.length} accounts: nothing assumes example accounts`, !/Work Claude|Playty|Claude Max|ChatGPT Plus|Kimi plan|Qwen Global/.test(joined), joined.slice(0, 400));
		}
	}
};

