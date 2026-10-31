// Onboarding's AI provider logins (provider-login audit P01-P18, lane prov). Real clicks and typing through Playwright,
// in a sandboxed iframe with an opaque origin and no storage (where Jared looks) by default, or on a normal page:
//   browser-check run Concepts/pm7-tools/browser-check/providers --set page=<build>.html [--set surface=normal]
// Each test asserts the fixed behaviour, so on a build from before the fixes the same test fails (the control).
// Typed keys are obvious test text, never a real credential; nothing signs in to anything real.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const FAKE_KEY = 'TEST-NOT-A-REAL-KEY-0000';
const ROOT = '#pm-o55-onboarding';

async function open(t, screen, { scenario = '', surface = t.args.surface || 'sandbox' } = {}) {
	const q = `cb=${Date.now()}&o55=screen=${screen}${scenario ? '&o55scenario=' + scenario : ''}`;
	const src = `${t.cfg.pageUrl}${t.cfg.pageUrl.includes('?') ? '&' : '?'}${q}`;
	if (surface === 'sandbox') {
		const html = path.join(t.run.dir, `sandbox-${Date.now()}.html`);
		fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style><iframe sandbox="allow-scripts allow-downloads allow-popups" src="${src}"></iframe>`);
		await t.goto(pathToFileURL(html).href, { settleMs: 1500 });
		await t.page.waitForFunction(() => document.querySelector('iframe') && document.querySelector('iframe').contentWindow, null, { timeout: 15000 });
	} else await t.goto(src, { settleMs: 1500 });
	const frame = surface === 'sandbox' ? t.page.frames().find((f) => f !== t.page.mainFrame()) : t.page.mainFrame();
	await frame.waitForFunction(() => window.O55 && window.O55.S && window.O55.S.open && document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 30000 });
	const W = { frame, $: (sel) => frame.locator(`${ROOT} ${sel}`).first(), all: (sel) => frame.locator(`${ROOT} ${sel}`) };
	const info = await frame.evaluate(() => {
		let storage = 'available';
		try { localStorage.getItem('x'); } catch (_) { storage = 'throws'; }
		return { origin: self.origin, storage, persistent: window.O55.store.persistent, theme: document.documentElement.getAttribute('data-theme'), family: (document.querySelector('#pm-o55-onboarding') || {}).getAttribute && document.querySelector('#pm-o55-onboarding').getAttribute('data-family') };
	});
	if (surface === 'sandbox') await t.check('sandboxed: opaque origin, no storage', info.origin === 'null' && info.storage === 'throws' && info.persistent === false, JSON.stringify(info));
	else await t.check('normal page: storage persists', info.persistent === true, JSON.stringify(info));
	await t.check(`look applied (${info.theme})`, !!info.theme, JSON.stringify(info));
	return W;
}
const row = (W, id) => W.$(`[data-key="pv-${id}"]`);
const act = (W, id, name) => W.$(`[data-key="pv-${id}"] [data-o55-do="${name}"]`);
const rowText = async (W, id) => ((await row(W, id).innerText({ timeout: 3000 }).catch(() => '')) || '').replace(/\s+/g, ' ');
async function waitRow(t, W, id, re, name, ms = 12000) {
	const until = Date.now() + ms; let got = '';
	while (Date.now() < until) { got = await rowText(W, id); if (re.test(got)) break; await t.page.waitForTimeout(250); }
	return t.check(name, re.test(got), `row ${id}: "${got.slice(0, 220)}"`, { target: row(W, id) });
}
async function typeInto(W, sel, text) { const i = W.$(sel); await i.click(); await i.fill(''); await i.pressSequentially(text, { delay: 8 }); }
async function screenDone(W) { await W.frame.waitForTimeout(400); }
// All providers the way a person gets there: the AI screen, its detection, then See all providers
async function toAll(t, opts) {
	const W = await open(t, 'ai', opts);
	await waitRow(t, W, 'claude', /Not installed|Not signed in|Ready/, 'AI screen checked this computer');
	await W.$('.o55-sublinks [data-o55-do="all"]').click(); await W.frame.waitForTimeout(1200);
	return W;
}
// a Free Models route's box: its wrapper on the fixed build, its row on the old one
const freeBox = (W, id) => W.frame.locator(`${ROOT} :is([data-key="fr-${id}"], [data-key="row-${id}"])`).first();

export const tests = {
	// P01, P02, P03, P04: the Free Models list
	async 'free models: nothing closed or paid is called free; each route sets up through its own provider'(t) {
		const W = await open(t, 'free');
		await W.frame.waitForSelector(`${ROOT} :is([data-key="fr-free-openrouter"], [data-key="row-free-openrouter"])`, { timeout: 10000 }).catch(() => {});
		await W.frame.waitForTimeout(600);
		const listText = ((await W.frame.locator(ROOT).innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
		await t.check('P01: GitHub Models (retired 2026-07-30) is not offered', !/GitHub Models/.test(listText), listText.slice(0, 300));
		await t.check('P02/P03 (D5): Cerebras and Hugging Face are not offered as free', !/Cerebras|Hugging Face/.test(listText), listText.slice(0, 400));
		await t.check('D5: the free list is OpenRouter, Groq and NVIDIA (free-coding-models v0.6.0)', /OpenRouter free models/.test(listText) && /Groq free plan/.test(listText) && /NVIDIA free models/.test(listText), listText.slice(0, 400));
		// P04: Groq's Set up asks for Groq's own key, says where to get it, refuses a short one, and a limit is Retry now
		const groq = freeBox(W, 'free-groq');
		await groq.locator('[data-o55-do="route"]').click();
		await screenDone(W);
		await t.visible(W.$('#o55f-fkey-free-groq'), 'P04: Groq Set up shows a key field for Groq');
		await t.text(groq, /Get a key from Groq's console/, 'P04: the row says where the key is made');
		await t.text(groq, /Groq · no account connected yet/, 'P04: underlying provider and its state shown before setup');
		await typeInto(W, '#o55f-fkey-free-groq', 'short');
		await groq.locator('[data-o55-do="fkeyCheck"]').click();
		await W.frame.waitForTimeout(1500);
		await t.text(groq, /wasn't accepted/, 'P04: a short key is refused under its field');
		await typeInto(W, '#o55f-fkey-free-groq', FAKE_KEY);
		await groq.locator('[data-o55-do="fkeyCheck"]').click();
		const until = Date.now() + 8000; let g = '';
		while (Date.now() < until) { g = await groq.innerText(); if (/Limit reached/.test(g)) break; await W.frame.waitForTimeout(250); }
		await t.check('P04/P12: a limit reached is "Limit reached · Retry now", not a reconnect', /Limit reached/.test(g) && /Retry now/.test(g) && !/Reconnect/.test(g), g);
		await groq.locator('[data-o55-do="retry"]').click();
		const u2 = Date.now() + 6000; while (Date.now() < u2) { g = await groq.innerText(); if (/Ready/.test(g)) break; await W.frame.waitForTimeout(250); }
		await t.check('P04: Retry now reaches Ready', /Ready/.test(g), g);
		const saved = await W.frame.evaluate(() => JSON.stringify(window.O55.store.scrub(window.O55.S.sess, 'onboarding')));
		await t.check('no typed key in the saved session', !saved.includes(FAKE_KEY) && !saved.includes('short'), 'key text found in the saved record');
		await t.shot('free-models', 'Free Models: OpenRouter, Groq and NVIDIA; Groq set up through its key and back from its limit');
	},

	// P05, P14, P15: All providers grouped by what pays; gated Z.AI; current names
	async 'all providers: billing groups, gated Z.AI, current names in search'(t) {
		const W = await toAll(t);
		const groups = await W.frame.evaluate(() => Array.from(document.querySelectorAll('#pm-o55-onboarding .o55-group')).map((g) => ({ title: (g.querySelector('.o55-grouptitle') || {}).textContent, ids: Array.from(g.querySelectorAll('[data-key^="pv-"]')).map((r) => r.getAttribute('data-key').slice(3)) })));
		const plans = (groups.find((g) => /included usage/.test(g.title || '')) || { ids: [] }).ids, use = (groups.find((g) => /Pay for what you use/.test(g.title || '')) || { ids: [] }).ids;
		await t.check('P05: Token Plan (a monthly-credit subscription) is with the plans', plans.includes('qwen-token') && !use.includes('qwen-token'), JSON.stringify(groups));
		await t.check('P05: Cursor (bills the user\'s plan) is with the plans', plans.includes('cursor'), JSON.stringify(groups));
		await t.check('P07: OpenCode server is not with the monthly plans', !plans.includes('opencode-runtime'), JSON.stringify(groups));
		const allText = await W.frame.locator(ROOT).innerText();
		await t.check('D4/T15: no "Not confirmed" and no extra-usage wording', !/Not confirmed|Extra use|extra use can cost/i.test(allText), allText.slice(0, 300));
		const z = await rowText(W, 'zai');
		await t.check('D4: Z.AI gets ordinary key setup, with no caveat', !/Not confirmed/.test(z) && (await act(W, 'zai', 'key').count()) === 1, z);
		await t.check('P15: MiniMax shows its current name, M Plan', /MiniMax M Plan/.test(await rowText(W, 'minimax')), await rowText(W, 'minimax'));
		await typeInto(W, '#o55f-q', 'Zen');
		await W.frame.waitForTimeout(400);
		await t.check('P15: searching the old name Zen finds OpenCode Console', /OpenCode Console/.test(await rowText(W, 'opencode-zen')), await rowText(W, 'opencode-zen'));
		await typeInto(W, '#o55f-q', 'Qwen');
		await W.frame.waitForTimeout(400);
		await t.check('P15: searching Qwen finds the Alibaba Coding Plan', /Alibaba Coding Plan/.test(await rowText(W, 'qwen-coding')), await rowText(W, 'qwen-coding'));
		await typeInto(W, '#o55f-q', '');
		await t.shot('all-providers', 'All providers: plans with included usage, pay for what you use, your own setup; Z.AI with ordinary key setup');
	},

	// P06, P08, P10, P16: Codex's two families, a second account, the right key, truthful billing line
	async 'codex: ChatGPT or an OpenAI API key, each its own account'(t) {
		const W = await open(t, 'ai');
		await waitRow(t, W, 'codex', /Not signed in/, 'detection done');
		await act(W, 'codex', 'choose').click(); await screenDone(W);
		const cards = await row(W, 'codex').innerText();
		await t.check('P06: Codex offers Sign in with ChatGPT and Use an OpenAI API key', /Sign in with ChatGPT/.test(cards) && /Use an OpenAI API key/.test(cards) && /ChatGPT plan limits/.test(cards), cards);
		await W.$('[data-o55-do="way"][data-arg="codex|alt"]').click(); await screenDone(W);
		await t.visible(W.$('#o55f-key-codex'), 'P06: the OpenAI API key field');
		await t.text(row(W, 'codex'), /Get a key from the OpenAI API dashboard/, 'P10: says where the OpenAI key is made');
		await t.text(row(W, 'codex'), /not your password/, 'P10: says it is the key, not the password');
		await typeInto(W, '#o55f-key-codex', FAKE_KEY);
		await act(W, 'codex', 'keyCheck').click();
		await waitRow(t, W, 'codex', /(?=.*Ready)(?=.*OpenAI API key · OpenAI API, billed by use)/, 'P05/P16: Ready says OpenAI API, billed by use (not "Charged to your ChatGPT plan")');
		await act(W, 'codex', 'manage').click(); await screenDone(W);
		await W.$('[data-o55-do="addAnother"][data-arg="codex"]').click(); await screenDone(W);
		await W.$('[data-o55-do="way"][data-arg="codex|main"]').click();
		await waitRow(t, W, 'codex', /2 accounts: OpenAI API key, jared@example\.com/, 'P08: a second Codex account of the other family is its own row entry', 9000);
		await t.shot('codex-two-accounts', 'Codex Ready with an OpenAI API key and a ChatGPT account');
	},

	// P07: OpenCode as a server profile
	async 'opencode: a server profile, never a website sign-in'(t) {
		const W = await toAll(t);
		await waitRow(t, W, 'opencode-runtime', /Not set up/, 'OpenCode row ready to set up');
		await act(W, 'opencode-runtime', 'server').click(); await screenDone(W);
		const txt = await row(W, 'opencode-runtime').innerText();
		await t.check('P07: Managed and Attach choices, as Settings has them', /Let Puppet Master run it/.test(txt) && /Use a server I already run/.test(txt) && !/opencode\.ai/.test(txt), txt);
		await W.$('[data-o55-do="ocMode"][data-arg="attached"]').click(); await screenDone(W);
		await typeInto(W, '#o55f-ocaddr', 'http://127.0.0.1:4096');
		await typeInto(W, '#o55f-ocpass', 'TEST-SERVER-PASSWORD');
		await W.$('[data-o55-do="ocConnect"]').click();
		await waitRow(t, W, 'opencode-runtime', /(?=.*Ready)(?=.*Your server at http:\/\/127\.0\.0\.1:4096)/, 'P07: attached server Ready by its address');
		const saved = await W.frame.evaluate(() => JSON.stringify(window.O55.store.scrub(window.O55.S.sess, 'onboarding')));
		await t.check('P07: the server password is not saved', !saved.includes('TEST-SERVER-PASSWORD'), 'password text found in the saved record');
		const official = await W.frame.evaluate(() => (window.O55.owners.log || []).length);
		await t.check('owner log reachable', official >= 0, '');
	},

	// P08, P12: Claude: a second account, the same account twice, wrong account removed, sign-in cancelled
	async 'claude: add another, same account twice, remove, cancel'(t) {
		const W = await open(t, 'ai', { scenario: 'signedOut' });
		await waitRow(t, W, 'claude', /Not signed in/, 'Claude installed, signed out');
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /Waiting for you/, 'sign-in waits');
		await t.text(row(W, 'claude'), /Browser didn't open\?/, 'P11: Browser didn\'t open? is offered');
		await W.$('[data-o55-do="cancelSignin"][data-arg="claude"]').click();
		await waitRow(t, W, 'claude', /Not signed in/, 'P12: Cancel leaves nothing connected', 4000);
		await W.frame.waitForTimeout(3200);
		await t.check('P12: the cancelled wait never completes later', /Not signed in/.test(await rowText(W, 'claude')), await rowText(W, 'claude'));
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /(?=.*Ready)(?=.*jared@example\.com · Claude Pro)/, 'P08/P12: Ready names the account and the plan it reports');
		await act(W, 'claude', 'manage').click(); await screenDone(W);
		await W.$('[data-o55-do="addAnother"][data-arg="claude"]').click(); await screenDone(W);
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /2 accounts: jared@example\.com, jared@studio\.example/, 'P08: a second Claude account');
		await act(W, 'claude', 'manage').click(); await screenDone(W);
		await W.$('[data-o55-do="addAnother"][data-arg="claude"]').click(); await screenDone(W);
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /already connected/, 'P08: signing in with an account already here says so');
		await act(W, 'claude', 'manage').click(); await screenDone(W);
		const rm = W.frame.locator(`${ROOT} [data-key="pv-claude"] [data-o55-do="remove"]`).last();
		await rm.click(); await screenDone(W);
		await t.text(row(W, 'claude'), /Remove jared@studio\.example from Puppet Master\?/, 'P08: removing asks first');
		await W.$('[data-o55-do="removeGo"]').click();
		await waitRow(t, W, 'claude', /(?=.*Ready)(?=.*jared@example\.com · Claude Pro)/, 'P08: the wrong account is gone, the other stays');
		await t.shot('claude-accounts', 'Claude Ready with its account after a second one was added and removed');
	},

	// P09, P12: what an account still needs: Copilot's billing entity, region for plan keys, Vertex project
	async 'context: Copilot billing entity, plan region, Anthropic workspace'(t) {
		const W = await toAll(t);
		await waitRow(t, W, 'copilot', /Not signed in/, 'Copilot ready to sign in');
		await act(W, 'copilot', 'signin').click();
		await waitRow(t, W, 'copilot', /Needs a choice/, 'P09/P12: signed in is not Ready: Copilot asks whose plan', 9000);
		await t.text(row(W, 'copilot'), /book-club-crew \(organization\)/, 'P09: the organization is offered');
		await W.$('[data-o55-do="entity"][data-arg="copilot|book-club-crew"]').click();
		await waitRow(t, W, 'copilot', /(?=.*Ready)(?=.*through book-club-crew)/, 'P09: Ready with the chosen billing entity');
		await act(W, 'qwen-coding', 'key').click(); await screenDone(W);
		await t.check('D2: no China-region choice in the wizard (Settings has it)', (await W.$('[data-key="pv-qwen-coding"] [data-o55-do="region"]').count()) === 0, 'region control found');
		await typeInto(W, '#o55f-key-qwen-coding', FAKE_KEY);
		await act(W, 'qwen-coding', 'keyCheck').click();
		await waitRow(t, W, 'qwen-coding', /(?=.*Ready)(?=.*Alibaba Coding Plan)/, 'Alibaba Coding Plan Ready with its key');
		await act(W, 'anthropic-api', 'key').click(); await screenDone(W);
		await typeInto(W, '#o55f-key-anthropic-api', FAKE_KEY);
		await act(W, 'anthropic-api', 'keyCheck').click();
		await waitRow(t, W, 'anthropic-api', /Needs a choice/, 'P09: a key that works in two workspaces asks which pays');
		await W.$('[data-o55-do="workspace"]').click();
		await waitRow(t, W, 'anthropic-api', /Ready/, 'P09: Ready once the workspace is chosen');
		await act(W, 'vertex', 'key').click(); await screenDone(W);
		await t.visible(W.$('#o55f-project-vertex'), 'P09: Vertex asks for its project (optional)');
	},

	// P11, P12: a remote Server: where the AI works, where sign-ins and keys are kept, the code-return path
	async 'remote server: which computer does what'(t) {
		const W = await open(t, 'c-ready', { scenario: 'remoteAi' });
		const go = async (label) => { const b = W.frame.locator(`${ROOT} button`).filter({ hasText: label }).first(); await b.click(); await W.frame.waitForTimeout(700); };
		await go('Create a new Project');
		for (let i = 0; i < 16; i++) {
			const scr = await W.frame.evaluate(() => window.O55.S.sess.screen);
			if (scr === 'ai') break;
			if (scr === 'name') { const n = W.$('#o55f-name'); if (await n.count()) { await n.fill('Remote AI test'); } }
			if (scr === 'begin') { const c = W.$('[data-o55-do="pick"][data-arg="new"]'); if (await c.count()) await c.click(); }
			if (scr === 'creating') { await W.frame.waitForFunction(() => window.O55.S.sess.screen !== 'creating' || !document.querySelector('#pm-o55-onboarding .o55-foot .o55-primary[aria-disabled="true"]'), null, { timeout: 30000 }).catch(() => {}); }
			const pri = W.$('.o55-foot .o55-primary:not([aria-disabled="true"])');
			if (await pri.count()) await pri.click(); else break;
			await W.frame.waitForTimeout(1600);
		}
		const scr = await W.frame.evaluate(() => window.O55.S.sess.screen);
		await t.check('reached AI on Home NAS through Project creation', scr === 'ai', 'stopped at ' + scr);
		if (scr !== 'ai') return;
		await t.text(W.$('[data-key="where"]'), /The AI works on Home NAS\. Sign-ins open here on this device, and are kept on Home NAS\./, 'P11: two-line host summary');
		await waitRow(t, W, 'claude', /Install on Home NAS|Not installed|Not signed in/, 'Claude on Home NAS');
		await act(W, 'cursor', 'choose').click(); await screenDone(W);
		await W.$('[data-o55-do="way"][data-arg="cursor|main"]').click(); await screenDone(W);
		await t.text(row(W, 'cursor'), /Kept in the keychain on Home NAS/, 'P11: a key is kept on the computer that does the work');
		await t.shot('remote-key', 'Home NAS: host summary, Cursor key kept on Home NAS');
	},

	// P10, P16, P18: no account yet; free-only is an AI
	async 'no account yet, and free-only completion'(t) {
		const W = await open(t, 'ai');
		await waitRow(t, W, 'claude', /Not installed|Not signed in/, 'AI screen ready');
		await W.$('.o55-sublinks [data-o55-do="none"]').click(); await W.frame.waitForTimeout(1200);
		const txt = await W.frame.locator(ROOT).innerText();
		await t.check('P16: a monthly plan is not sold as one price', !/One price each month/.test(txt) && /A plan you subscribe to/.test(txt), txt.slice(0, 400));
		await W.$('[data-o55-do="pick"][data-arg="api"]').click(); await screenDone(W);
		await W.$('.o55-foot .o55-primary').click(); await W.frame.waitForTimeout(1200);
		const first = await W.frame.evaluate(() => Array.from(document.querySelectorAll('#pm-o55-onboarding [data-key^="pv-"]')).slice(0, 2).map((r) => r.getAttribute('data-key')));
		await t.check('P10: back on AI, the Pay as you go providers are first', JSON.stringify(first) === JSON.stringify(['pv-anthropic-api', 'pv-gemini-api']), JSON.stringify(first));
		await W.$('.o55-foot [data-o55-do="skip"]').click(); await screenDone(W);
		await W.$('[data-o55-do="free"]').click(); await W.frame.waitForTimeout(900);
		await freeBox(W, 'free-openrouter').locator('[data-o55-do="route"]').click();
		const u = Date.now() + 6000; while (Date.now() < u) { if (/Ready/.test(await freeBox(W, 'free-openrouter').innerText())) break; await W.frame.waitForTimeout(250); }
		await W.$('.o55-foot .o55-primary').click(); await W.frame.waitForTimeout(1500);
		const sum = await W.frame.locator(`${ROOT} [data-key="sum-ai"]`).innerText().catch(() => '');
		await t.check('P18: free-only says Free Models, not "can\'t plan"', /Free Models only/.test(sum) && !/can't plan/.test(sum), sum);
		await t.crop('ready-free-only', W.$('[data-key="summary"]'), 'Ready summary with only a free route: AI row says Free Models only, with Ready');
	},

	// P17 (normal page only): reload keeps Token Plan; P13: the result the app reads
	async 'reload keeps Alibaba Token Plan, and finishing hands the accounts to the app'(t) {
		if ((t.args.surface || 'sandbox') !== 'normal') return t.check('normal page only (skipped in the sandbox)', true);
		const W = await toAll(t, { surface: 'normal' });
		await waitRow(t, W, 'qwen-token', /Enter API Key/, 'Token Plan row');
		await act(W, 'qwen-token', 'key').click(); await screenDone(W);
		await typeInto(W, '#o55f-key-qwen-token', FAKE_KEY);
		await act(W, 'qwen-token', 'keyCheck').click();
		await waitRow(t, W, 'qwen-token', /Ready/, 'Token Plan Ready');
		await t.page.reload(); await t.page.waitForFunction(() => window.O55 && window.O55.S && window.O55.S.open, null, { timeout: 30000 }).catch(() => {});
		await t.page.waitForTimeout(1500);
		const W2 = { frame: t.page.mainFrame(), $: (sel) => t.page.locator(`${ROOT} ${sel}`).first() };
		const kept = await t.page.evaluate(() => { const s = window.O55.store.get('onboarding', {}); return { acc: !!(s.ai && s.ai.accounts && s.ai.accounts['qwen-token']), list: ((s.ai && s.ai.list) || []).map((e) => e.provider) }; });
		await t.check('P17: after a reload the saved session still has Token Plan', kept.acc && kept.list.includes('qwen-token'), JSON.stringify(kept));
		const finish = await t.page.evaluate(() => { const r = window.O55.handoff && window.O55.handoff.build ? window.O55.handoff.build(window.O55.S, {}) : null; return r ? { accounts: r.accounts, free: r.free_routes } : null; });
		await t.check('P13: the result carries the account with Settings\' provider id', !!finish && (finish.accounts || []).some((a) => a.provider_entry_id === 'qwen-token' && a.custody === 'os_keychain' && a.auth_method === 'api_key'), JSON.stringify(finish).slice(0, 400));
		await t.check('P13: no key text in the result', !JSON.stringify(finish || {}).includes(FAKE_KEY), 'key text in result');
		void W2;
	}
};
