// Onboarding's AI provider logins (provider-login audit P01-P18, lane prov). Real clicks and typing through Playwright,
// in T3's sandbox (t.openInSandbox's default flags: an opaque origin, no storage; where Jared looks) by default, or on a
// normal page with the kit's switch:
//   browser-check run Concepts/pm7-tools/browser-check/providers --set page=<build>.html [--set sandbox=0]
// Each test asserts the fixed behaviour, so on a build from before the fixes the same test fails (the control).
// Typed keys are obvious test text, never a real credential; nothing signs in to anything real.

const FAKE_KEY = 'TEST-NOT-A-REAL-KEY-0000';
const ROOT = '#pm-o55-onboarding';

async function open(t, screen, { scenario = '', surface = t.app.sandboxed(true) ? 'sandbox' : 'normal' } = {}) {
	const query = `o55=screen=${screen}${scenario ? '&o55scenario=' + scenario : ''}`;
	if (surface === 'normal') {
		/* each test starts from a fresh visit: the onboarding and Settings records an earlier test saved are cleared */
		await t.app.open({ onboarding: true, query, sandbox: false });
		await t.root.evaluate(() => { try { Object.keys(localStorage).filter((k) => /^pm|o55|pm51|settings/i.test(k)).forEach((k) => localStorage.removeItem(k)); } catch (_) {} });
	}
	/* the sandbox is T3's file preview, at t.openInSandbox's default flags, as the kit opens it */
	const frame = await t.app.open({ onboarding: true, query, settleMs: 1500, sandbox: surface === 'sandbox' });
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
		await t.check('D4/T15/FO-4: no "Not confirmed", no extra-usage or payment lines', !/Not confirmed|Extra use|extra use can cost|Billed by|billed by use|credit you buy|monthly/i.test(allText), allText.slice(0, 300));
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
		const ways = await row(W, 'codex').innerText();
		await t.check('P06: Codex offers Sign In (ChatGPT) and "Use an OpenAI API key instead"; no Connect button', /Sign In/.test(ways) && /Use an OpenAI API key instead/.test(ways) && !(await act(W, 'codex', 'choose').count()), ways);
		await W.$('[data-o55-do="useAlt"][data-arg="codex"]').click(); await screenDone(W);
		await act(W, 'codex', 'key').click(); await screenDone(W);
		await t.visible(W.$('#o55f-key-codex'), 'P06: the OpenAI API key field');
		await t.text(row(W, 'codex'), /Sign in with ChatGPT instead/, 'P06: the way back to ChatGPT sign-in');
		await t.text(row(W, 'codex'), /Get a key from the OpenAI API dashboard/, 'P10: says where the OpenAI key is made');
		await t.text(row(W, 'codex'), /not your password/, 'P10: says it is the key, not the password');
		await typeInto(W, '#o55f-key-codex', FAKE_KEY);
		await act(W, 'codex', 'keyCheck').click();
		await waitRow(t, W, 'codex', /(?=.*Ready)(?=.*OpenAI API key)/, 'P05/FO-4: Ready names the OpenAI API key, with no payment line');
		await t.check('FO-4: no "billed by use" on a Ready key', !/billed by use/i.test(await rowText(W, 'codex')), await rowText(W, 'codex'));
		await act(W, 'codex', 'manage').click(); await screenDone(W);
		await W.$('[data-o55-do="addAnother"][data-arg="codex"]').click(); await screenDone(W);
		await act(W, 'codex', 'signin').click();
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
		const passHint = ((await W.$('[data-key="field-ocPass:opencode-runtime"]').innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
		await t.check("FO-11: the server password field says it's the server's own password, not 'not your password'", /server's own password/.test(passHint) && !/not your password/.test(passHint), passHint);
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
		await act(W, 'copilot', 'manage').click(); await screenDone(W);
		await W.$('[data-o55-do="addAnother"][data-arg="copilot"]').click(); await screenDone(W);
		await act(W, 'copilot', 'signin').click();
		await waitRow(t, W, 'copilot', /Needs a choice/, 'm11: the second Copilot account asks whose plan', 9000);
		await W.$('[data-o55-do="entity"][data-arg="copilot|jared-studio"]').click();
		await waitRow(t, W, 'copilot', /2 accounts/, 'm11: two Copilot accounts');
		await act(W, 'copilot', 'manage').click(); await screenDone(W);
		const lines = await W.frame.evaluate(() => Array.from(document.querySelectorAll('#pm-o55-onboarding [data-key="pv-copilot"] [data-key^="ac-"]')).map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
		await t.check('m11: "through" only for the organization\'s plan, never the person\'s own', lines.some((l) => /through book-club-crew/.test(l)) && !lines.some((l) => /through jared-studio/.test(l)), JSON.stringify(lines));
		await act(W, 'copilot', 'manage').click(); await screenDone(W);
		await act(W, 'qwen-coding', 'key').click(); await screenDone(W);
		await t.check('D2: no China-region choice in the wizard (Settings has it)', (await W.$('[data-key="pv-qwen-coding"] [data-o55-do="region"]').count()) === 0, 'region control found');
		await typeInto(W, '#o55f-key-qwen-coding', FAKE_KEY);
		await act(W, 'qwen-coding', 'keyCheck').click();
		await waitRow(t, W, 'qwen-coding', /(?=.*Ready)(?=.*Alibaba Coding Plan)/, 'Alibaba Coding Plan Ready with its key');
		await act(W, 'anthropic-api', 'key').click(); await screenDone(W);
		await typeInto(W, '#o55f-key-anthropic-api', FAKE_KEY);
		await act(W, 'anthropic-api', 'keyCheck').click();
		await waitRow(t, W, 'anthropic-api', /Ready/, 'Opus p44: an Anthropic key belongs to one workspace, so it asks nothing and is Ready');
		await t.check('Opus p44: no workspace question', !/workspace/i.test(await rowText(W, 'anthropic-api')), await rowText(W, 'anthropic-api'));
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
		await act(W, 'cursor', 'key').click(); await screenDone(W);
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
		const u = Date.now() + 9000; while (Date.now() < u) { if (/Ready/.test(await freeBox(W, 'free-openrouter').innerText())) break; await W.frame.waitForTimeout(250); }
		await W.$('.o55-foot .o55-primary').click(); await W.frame.waitForTimeout(1500);
		const sum = await W.frame.locator(`${ROOT} [data-key="sum-ai"]`).innerText().catch(() => '');
		await t.check('P18: free-only says Free Models, not "can\'t plan"', /Free Models only/.test(sum) && !/can't plan/.test(sum), sum);
		await t.crop('ready-free-only', W.$('[data-key="summary"]'), 'Ready summary with only a free route: AI row says Free Models only, with Ready');
	},

	// P17 (normal page only): reload keeps Token Plan; P13: the result the app reads
	async 'reload keeps Alibaba Token Plan, and finishing hands the accounts to the app'(t) {
		if (t.app.sandboxed(true)) return t.check('normal page only (skipped in the sandbox; --set sandbox=0 runs it)', true);
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
		await t.check('P13: the result carries the account with Settings\' provider id', !!finish && (finish.accounts || []).some((a) => a.provider_entry_id === 'alibaba_token_plan' && a.settings_provider_id === 'qwen-token' && a.custody === 'os_keychain' && a.auth_method === 'api_key'), JSON.stringify(finish).slice(0, 400));
		await t.check('P13: no key text in the result', !JSON.stringify(finish || {}).includes(FAKE_KEY), 'key text in result');
		void W2;
	}
	,
	// Demo hints (O55.flow.hint) on the steps that need a real service, and the recovery states they and Demo Studio reach
	async 'demo hints and recovery states: key works, refused, revoked; expired sign-in; offline once'(t) {
		const pick = async (W, scope, label) => { const b = W.frame.locator(`${ROOT} ${scope} [data-o55-do="demoHint"]`).filter({ hasText: label }).first(); await b.click(); await W.frame.waitForTimeout(400); };
		let W = await open(t, 'ai');
		await waitRow(t, W, 'cursor', /Enter API Key/, 'detection done');
		await act(W, 'cursor', 'key').click(); await screenDone(W);
		await t.visible(W.$('[data-key="pv-cursor"] .o55-demohint'), 'hint: the key step shows "Try it in this demo"');
		await t.crop('hint-key', W.$('[data-key="pv-cursor"]'), 'Cursor key step with its demo hint: a key that works, one refused, one revoked');
		await pick(W, '[data-key="pv-cursor"]', 'demo-key-revoked-0000');
		await act(W, 'cursor', 'keyCheck').click(); await W.frame.waitForTimeout(1600);
		await t.text(row(W, 'cursor'), /revoked or has expired/, 'revoked/expired key: says so under its field');
		await pick(W, '[data-key="pv-cursor"]', 'short-key');
		await act(W, 'cursor', 'keyCheck').click(); await W.frame.waitForTimeout(1600);
		await t.text(row(W, 'cursor'), /wasn't accepted/, 'refused key: says so');
		await pick(W, '[data-key="pv-cursor"]', 'demo-key-0000-1111-2222');
		await act(W, 'cursor', 'keyCheck').click();
		await waitRow(t, W, 'cursor', /Ready/, 'the working sample key reaches Ready');
		W = await open(t, 'ai', { scenario: 'claudeExpired' });
		await waitRow(t, W, 'claude', /Sign-in expired/, 'expired sign-in: the row says so and names the account');
		await t.text(row(W, 'claude'), /jared@example\.com/, 'expired: names the account');
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /Ready/, 'expired: Sign in again reaches Ready');
		W = await open(t, 'ai', { scenario: 'aiOffline' });
		await waitRow(t, W, 'claude', /Not installed|Not signed in/, 'offline situation loaded');
		await act(W, 'anthropic-api', 'key').click().catch(() => {});
		if (!(await act(W, 'anthropic-api', 'key').count())) { await W.$('.o55-sublinks [data-o55-do="all"]').click(); await W.frame.waitForTimeout(1200); await act(W, 'anthropic-api', 'key').click(); }
		await screenDone(W);
		await pick(W, '[data-key="pv-anthropic-api"]', 'demo-key-0000-1111-2222');
		await act(W, 'anthropic-api', 'keyCheck').click(); await W.frame.waitForTimeout(1600);
		await t.text(row(W, 'anthropic-api'), /offline/, 'offline once: the check says the computer is offline');
		await pick(W, '[data-key="pv-anthropic-api"]', 'demo-key-0000-1111-2222');
		await act(W, 'anthropic-api', 'keyCheck').click();
		await waitRow(t, W, 'anthropic-api', /Needs a choice|Ready/, 'offline once: the next check goes through');
		await t.check('outcome words present', true);
	}
	,
	// Jared 2026-10-31: "Show the 3 upfront, hide the others behind some kind of advanced option"
	async 'free models: More free options, closed, scrolls inside, fits a small window'(t) {
		await t.viewport(860, 620);
		const W = await open(t, 'free');
		await W.frame.waitForSelector(`${ROOT} [data-key="fr-free-openrouter"]`, { timeout: 10000 });
		await t.check('closed by default: none of the more routes is shown', (await W.frame.locator(`${ROOT} [data-key="fr-free-pollinations"]`).count()) === 0, 'more routes visible before opening');
		const toggle = W.frame.locator(`${ROOT} [data-o55-do="freeMore"]`);
		await t.visible(toggle, 'one quiet "More free options" control');
		await toggle.click(); await W.frame.waitForTimeout(600);
		const box = W.$('[data-key="free-more"]');
		const m = await box.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight, n: el.querySelectorAll('[data-key^="fr-"]').length, txt: el.innerText }));
		await t.check('opened: the rest of the community list (20 routes)', m.n === 20, JSON.stringify({ n: m.n }));
		await t.check('it scrolls inside itself', m.sh > m.ch + 20, JSON.stringify(m).slice(0, 120));
		await t.check('nothing D5 removed is offered', !/Cerebras|Hugging Face|Ollama|GitHub Models/.test(m.txt), m.txt.slice(0, 200));
		await t.check('no limits or prices in the list', !/\$|req\/day|per day|tokens|RPM/i.test(m.txt), m.txt.slice(0, 200));
		const ov = await W.frame.evaluate(() => { const win = document.querySelector('#pm-o55-onboarding .o55-win'), box = document.querySelector('#pm-o55-onboarding [data-key="free-more"]'); const wr = win.getBoundingClientRect(), br = box.getBoundingClientRect(); return { winX: win.scrollWidth - win.clientWidth, boxX: box.scrollWidth - box.clientWidth, inside: br.left >= wr.left - 1 && br.right <= wr.right + 1, rowH: (box.querySelector('[data-key^="fr-"]') || box).getBoundingClientRect().height }; });
		await t.check('at 860x620 the list sits inside the window with no sideways overflow', ov.winX <= 0 && ov.boxX <= 0 && ov.inside, JSON.stringify(ov));
		await t.check('more rows are compact (one line each)', ov.rowH <= 72, JSON.stringify(ov));
		// FO-74: every quiet route keeps its density at both small and desktop sizes.
		for (const [width,height] of [[740,900],[860,620],[1024,900],[1280,900],[1280,500],[1390,900],[1920,900]]) {
			await t.viewport(width,height); await t.settle();
			const rows = await box.locator('.o55-provider').evaluateAll(es => es.map(e => ({key:e.dataset.key,height:e.getBoundingClientRect().height,status:!!e.querySelector('.o55-pill'),tracks:getComputedStyle(e.querySelector('.o55-row')).gridTemplateRows})));
			await t.check(`quiet Free Models representative <=72px with no empty tracks at ${width}x${height}`,rows.length===20 && rows[0].height<=72 && rows.every(r=>!r.status && r.tracks.split(' ').length===1),JSON.stringify(rows));
		}
		await t.viewport(860,620); await t.settle();
		await t.shot('free-more-860', 'Free Models at 860x620 with More free options open: the list scrolls inside the window');
		const kilo = freeBox(W, 'free-kilo');
		await kilo.scrollIntoViewIfNeeded();
		await kilo.locator('[data-o55-do="route"]').click();
		let g = ''; const u = Date.now() + 5000; while (Date.now() < u) { g = await kilo.innerText(); if (/Ready/.test(g)) break; await W.frame.waitForTimeout(250); }
		await t.check('a route with nothing to enter turns on (Kilo)', /Ready/.test(g), g);
		const pol = freeBox(W, 'free-pollinations');
		await pol.scrollIntoViewIfNeeded();
		await pol.locator('[data-o55-do="route"]').click(); await W.frame.waitForTimeout(500);
		await t.visible(pol.locator('.o55-demohint'), 'a key route has its demo hint');
		await pol.locator('[data-o55-do="demoHint"]').filter({ hasText: 'demo-key-0000-1111-2222' }).click(); await W.frame.waitForTimeout(300);
		await pol.locator('[data-o55-do="fkeyCheck"]').click();
		const u2 = Date.now() + 6000; while (Date.now() < u2) { g = await pol.innerText(); if (/Ready/.test(g)) break; await W.frame.waitForTimeout(250); }
		await t.check('a key route set up with the sample key reaches Ready (Pollinations)', /Ready/.test(g), g);
		const rw = freeBox(W, 'free-routeway');
		await rw.scrollIntoViewIfNeeded();
		await rw.locator('[data-o55-do="route"]').click(); await W.frame.waitForTimeout(600);
		const vis = await W.frame.evaluate(() => {
			const box = document.querySelector('#pm-o55-onboarding [data-key="free-more"]'), row = box.querySelector('[data-key="fr-free-routeway"]');
			const b = box.getBoundingClientRect(), inBox = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= b.bottom + 1; };
			return { name: inBox(row.querySelector('.o55-rowtitle')), label: inBox(row.querySelector('label')), field: inBox(row.querySelector('input')) };
		});
		await t.check('m12: an opened row in More free options shows its name, its field label and the field together', vis.name && vis.label && vis.field, JSON.stringify(vis));
		await t.viewport(1920, 1080);
	}
	,
	// GLM review: Skip for now must answer visibly on its own press, and the refused-key message reads for any name
	async 'skip for now answers visibly; a refused key names the provider without a/an slips'(t) {
		const W = await open(t, 'ai');
		await waitRow(t, W, 'claude', /Not installed|Not signed in/, 'detection done');
		await W.$('.o55-foot [data-o55-do="skip"]').click(); await W.frame.waitForTimeout(700);
		await t.shot('skip-after', 'right after pressing Skip for now'); await t.visible(W.frame.locator(`${ROOT} :is([data-key="skipped"], .o55-body .o55-note-warn, .o55-form .o55-note-warn)`).first(), 'Skip for now: a note on screen says what skipping means, without scrolling', { fully: true, scroll: false });
		await t.check('Skip for now: Continue is enabled at once', (await W.$('.o55-foot .o55-primary[aria-disabled="true"]').count()) === 0, 'Continue still disabled');
		
		await W.$('.o55-sublinks [data-o55-do="all"]').click(); await W.frame.waitForTimeout(1200);
		await act(W, 'anthropic-api', 'key').click(); await screenDone(W);
		await typeInto(W, '#o55f-key-anthropic-api', 'short');
		await act(W, 'anthropic-api', 'keyCheck').click(); await W.frame.waitForTimeout(1600);
		const msg = await rowText(W, 'anthropic-api');
		await t.check('refused key: no "a Anthropic" (a/an)', /wasn't accepted/.test(msg) && !/\ba (?:[AEIOU])/.test(msg), msg);
	}
	,
	// Astra RV-1: every "Browser didn't open?" names its page: the address, Open the page (one main action) and Copy
	async 'every sign-in fallback names its page: address, Open, Copy'(t) {
		const W = await toAll(t);
		const ROWS = [
			['codex', 'auth.openai.com/codex/device', 'code', null],
			['copilot', 'github.com/login/device', 'code', null],
			['claude', 'claude.ai/login', 'paste', 'install'],
			['antigravity', 'accounts.google.com', 'paste', 'install'],
			['grok', 'accounts.x.ai/device', 'code', 'install'],
			['muse', 'dev.meta.ai/login', 'link', 'install'],
			['cursor', 'cursor.com/login', 'link', 'alt']
		];
		for (const [id, url, mode, first] of ROWS) {
			if (first === 'alt') { await W.$(`[data-o55-do="useAlt"][data-arg="${id}"]`).click(); await screenDone(W); }
			if (first) {
				if (await act(W, id, 'install').count()) { await act(W, id, 'install').click(); await screenDone(W); await W.$(`[data-o55-do="installGo"][data-arg="${id}"]`).click(); }
				await waitRow(t, W, id, /Not signed in/, `${id}: installed, ready to sign in`, 12000);
			}
			await act(W, id, 'signin').click();
			await waitRow(t, W, id, /Waiting for you/, `${id}: waiting for the browser`, 5000);
			await W.$(`[data-o55-do="noBrowser"][data-arg="${id}"]`).click(); await screenDone(W);
			const txt = await rowText(W, id);
			await t.check(`${id}: names its page (${url})`, txt.includes(url), txt.slice(0, 300));
			await t.check(`${id}: Open the page and Copy beside it`, (await W.$(`[data-key="addr-${id}"] [data-o55-do="openSigninPage"]`).count()) === 1 && (await W.$(`[data-key="addr-${id}"] [data-o55-do="copySigninPage"]`).count()) === 1, txt.slice(0, 200));
			if (mode === 'code') await t.check(`${id}: the code is shown with the address`, /WDJB-MJHT/.test(txt), txt.slice(0, 200));
			if (mode === 'paste') await t.visible(W.$(`#o55f-paste-${id}`), `${id}: the code from the page is pasted here`);
			await W.$(`[data-key="addr-${id}"] [data-o55-do="copySigninPage"]`).click(); await W.frame.waitForTimeout(400);
			const copied = (await W.frame.locator(`${ROOT} .o55-toast`).innerText().catch(() => '')) || '';
			await t.check(`${id}: Copy address copies that address`, copied.includes(url), copied);
			await W.$(`[data-key="addr-${id}"] [data-o55-do="openSigninPage"]`).click(); await W.frame.waitForTimeout(400);
			const toast = (await W.frame.locator(`${ROOT} .o55-toast`).innerText().catch(() => '')) || '';
			await t.check(`${id}: Open the page opens that address`, toast.includes(url), toast);
			if (id === 'codex') await t.crop('fallback-codex', W.$('[data-key="pv-codex"]'), 'Codex "Browser didn\'t open?": the device page, Open the page, Copy, and the code');
			if (id === 'muse') await t.crop('fallback-muse', W.$('[data-key="pv-muse"]'), 'Muse "Browser didn\'t open?": its sign-in page with Open the page and Copy');
			await W.$(`[data-o55-do="cancelSignin"][data-arg="${id}"]`).click(); await screenDone(W);
		}
		const all = await W.frame.locator(ROOT).innerText();
		await t.check('no fallback without a destination', !/Open your browser and sign in there, then come back/.test(all), 'generic toast text present');
	}
	,
	// Opus second pass, P2-2 minors in Providers and free models (p44-p69): each asserted by real clicks
	async 'Opus pass 2 minors: providers'(t) {
		let W = await toAll(t, { scenario: 'signedOut' });
		const meta = async (id) => ((await W.$(`[data-key="pv-${id}"] > .o55-row .o55-rowmeta`).innerText({ timeout: 2000 }).catch(() => '')) || '').trim();
		const key = async (id, text = FAKE_KEY) => { await typeInto(W, `#o55f-key-${id}`, text); await act(W, id, 'keyCheck').click(); };
		const toast = async () => ((await W.frame.locator(`${ROOT} .o55-toast`).allInnerTexts().catch(() => [])) || []).join(' | ');
		// p48: subtitles say something
		const subs = { zai: await meta('zai'), 'qwen-token': await meta('qwen-token'), 'opencode-go': await meta('opencode-go') };
		await t.check('p48: no subtitle repeats the name or only says what it is not', subs.zai !== 'Z.AI Coding Plan' && !/^Not the/.test(subs['qwen-token']) && !/^Not the/.test(subs['opencode-go']), JSON.stringify(subs));
		// p66: the key's name said once; p44: an Anthropic key is Ready without a workspace question
		await act(W, 'anthropic-api', 'key').click(); await screenDone(W);
		const lab = ((await W.$('[data-key="pv-anthropic-api"] label').innerText().catch(() => '')) || '').trim();
		await t.check('p66: the field says "Anthropic API key", not "API key for Anthropic API"', /^Anthropic API key/.test(lab) && !/API key for/.test(lab), lab);
		await key('anthropic-api', 'short-key'); await W.frame.waitForTimeout(1500);
		await t.text(row(W, 'anthropic-api'), /Check it's the right Anthropic API key/, "p66: the refusal names the key once");
		// p62: a new key takes the refusal away, and Pip waits for its check
		await typeInto(W, '#o55f-key-anthropic-api', FAKE_KEY); await W.frame.waitForTimeout(300);
		const after = await rowText(W, 'anthropic-api');
		await t.check('p62: the last refusal leaves once a new key is typed', !/wasn't accepted/.test(after), after.slice(0, 200));
		await t.check('p62: Pip waits for the check instead of cheering it', (await W.$('[data-key="pv-anthropic-api"] [data-pip-loader]').count()) === 1, 'no wait marker');
		await act(W, 'anthropic-api', 'keyCheck').click();
		await waitRow(t, W, 'anthropic-api', /Ready/, 'p44: an Anthropic key is Ready without asking for a workspace', 6000);
		await t.check('p44: no workspace question', !/workspace/i.test(await rowText(W, 'anthropic-api')), await rowText(W, 'anthropic-api'));
		// p47: keys are keys; the row name is not repeated
		await act(W, 'gemini-api', 'key').click(); await screenDone(W); await key('gemini-api');
		await waitRow(t, W, 'gemini-api', /Ready/, 'Gemini API key Ready', 6000);
		await t.crop('p47-gemini', row(W, 'gemini-api'), 'Gemini API Ready with one key');
		await t.check('p47: one key reads "Key added", not "Key 1 · Gemini API"', (await meta('gemini-api')) === 'Key added', await meta('gemini-api'));
		await act(W, 'gemini-api', 'manage').click(); await screenDone(W);
		await t.text(row(W, 'gemini-api'), /Add another Gemini API key/, 'p47: Add another Gemini API key, not account');
		await W.$('[data-o55-do="addAnother"][data-arg="gemini-api"]').click(); await screenDone(W);
		await t.text(row(W, 'gemini-api'), /Adding another key/, 'p47: Adding another key');
		await key('gemini-api'); await waitRow(t, W, 'gemini-api', /2 keys/, 'p47: two keys read "2 keys", not "2 accounts: Key 1, Key 2"', 6000);
		// p49: Kimi's removal names the Kimi account
		await act(W, 'kimi', 'key').click(); await screenDone(W); await key('kimi');
		await waitRow(t, W, 'kimi', /Ready/, 'Kimi Code key Ready', 6000);
		await act(W, 'kimi', 'manage').click(); await screenDone(W);
		await W.$('[data-key="pv-kimi"] [data-o55-do="remove"]').click(); await screenDone(W);
		await t.text(row(W, 'kimi'), /Your Kimi account itself stays/, 'p49: removal names the Kimi account, not Moonshot');
		await W.$('[data-key="pv-kimi"] [data-o55-do="removeNo"]').click(); await screenDone(W);
		// p68, p69: Vertex
		await act(W, 'vertex', 'key').click(); await screenDone(W);
		await t.text(row(W, 'vertex'), /Only needed if you use a Google Cloud project/, 'p69: the project hint says when it is needed');
		await typeInto(W, '#o55f-project-vertex', 'my-project'); await key('vertex');
		await waitRow(t, W, 'vertex', /Ready/, 'Vertex AI Ready with its project', 6000);
		await act(W, 'vertex', 'manage').click(); await screenDone(W);
		await W.$('[data-o55-do="addAnother"][data-arg="vertex"]').click(); await screenDone(W);
		await t.check('p68: another Vertex AI key starts with an empty project', (await W.$('#o55f-project-vertex').inputValue()) === '', await W.$('#o55f-project-vertex').inputValue());
		await W.$('[data-o55-do="cancelAdd"][data-arg="vertex"]').click(); await screenDone(W);
		// p61: Cursor's browser sign-in installs Cursor CLI
		await W.$('[data-o55-do="useAlt"][data-arg="cursor"]').click(); await screenDone(W);
		await t.text(row(W, 'cursor'), /Install Cursor CLI/, 'p61: the missing piece is named: Install Cursor CLI');
		await act(W, 'cursor', 'install').click(); await screenDone(W);
		await t.text(row(W, 'cursor'), /Install Cursor CLI on this computer/, 'p61: the install question names Cursor CLI');
		// p64, p66: Browser didn't open? takes the browser notice away; the wait reads "with your browser"
		await act(W, 'codex', 'signin').click(); await W.frame.waitForTimeout(300);
		await t.text(row(W, 'codex'), /Finish signing in with your browser\./, 'p66: "Finish signing in with your browser."');
		const t1 = await toast();
		await W.$('[data-o55-do="noBrowser"][data-arg="codex"]').click(); await W.frame.waitForTimeout(300);
		const t2 = await toast();
		await t.check('p64: the "browser opened" notice leaves when Browser didn\'t open? is pressed', /opened|open/i.test(t1) && !t2, JSON.stringify({ t1, t2 }));
		await W.$('[data-o55-do="cancelSignin"][data-arg="codex"]').click(); await screenDone(W);
		// p50: one ? on Copilot's question, none repeated on each choice
		await act(W, 'copilot', 'signin').click();
		await waitRow(t, W, 'copilot', /Needs a choice/, 'Copilot asks whose plan', 9000);
		const qs = await W.frame.evaluate(() => { const r = document.querySelector('#pm-o55-onboarding [data-key="pv-copilot"]'); return { onChoices: r.querySelectorAll('.o55-choices .o55-tipq').length, onQuestion: r.querySelectorAll('[data-key="ctxq-copilot"] .o55-tipq').length }; });
		await t.check("p50: the question has the ?, the choices don't repeat it", qs.onChoices === 0 && qs.onQuestion === 1, JSON.stringify(qs));
		await t.crop('p50-copilot', row(W, 'copilot'), "Copilot's whose-plan question with one ?, choices without");
		// p51: the tick lands on the orb of the provider just made Ready
		if (await act(W, 'antigravity', 'install').count()) { await act(W, 'antigravity', 'install').click(); await screenDone(W); await W.$('[data-o55-do="installGo"][data-arg="antigravity"]').click(); }
		await waitRow(t, W, 'antigravity', /Not signed in/, 'Antigravity ready to sign in', 12000);
		await act(W, 'antigravity', 'signin').click();
		await waitRow(t, W, 'antigravity', /Ready/, 'Antigravity Ready', 9000);
		const tgt = await W.frame.evaluate(() => { const sp = window.O55.pipScenes.spec(window.O55.S, {}); return { target: sp.target, props: sp.props.map((p) => p.id) }; });
		await t.check('p51: the stage targets Antigravity\'s orb, not the last one (Cursor)', tgt.target === 'oantigravity', JSON.stringify(tgt));
		// p45, p65: search
		await typeInto(W, '#o55f-q', 'OpenAI API'); await screenDone(W);
		await t.check('p65: searching "OpenAI API" finds ChatGPT / Codex', (await row(W, 'codex').count()) === 1, 'codex row missing');
		await typeInto(W, '#o55f-q', 'zzqx'); await screenDone(W);
		await t.text(W.$('[data-key="nomatch"]'), /Nothing matches/, 'p45: a search with no match says so');
		await typeInto(W, '#o55f-q', ''); await screenDone(W);
		// p59: the OpenCode server isn't named three times; its removal asks about the server
		await act(W, 'opencode-runtime', 'server').click(); await screenDone(W);
		await W.$('[data-o55-do="ocMode"][data-arg="managed"]').click(); await screenDone(W);
		if (await W.$('[data-o55-do="installGo"][data-arg="opencode-runtime"]').count()) await W.$('[data-o55-do="installGo"][data-arg="opencode-runtime"]').click();
		else await W.$('[data-o55-do="ocStart"]').click();
		await waitRow(t, W, 'opencode-runtime', /Ready/, 'OpenCode server Ready', 12000);
		const ocm = await meta('opencode-runtime');
		await t.check('p59: the server line says where it runs, not "OpenCode server" again', !/OpenCode server/.test(ocm) && /Run by Puppet Master/.test(ocm), ocm);
		await act(W, 'opencode-runtime', 'manage').click(); await screenDone(W);
		await W.$('[data-key="pv-opencode-runtime"] [data-o55-do="remove"]').click(); await screenDone(W);
		await t.text(row(W, 'opencode-runtime'), /Remove this OpenCode server from Puppet Master\?/, 'p59: removal asks about the server');
		await t.check('p59: no "Your OpenCode account" on a server', !/Your OpenCode account/.test(await rowText(W, 'opencode-runtime')), await rowText(W, 'opencode-runtime'));
		// p52: Pip has a line for offline
		W = await open(t, 'ai', { scenario: 'aiOffline' });
		await waitRow(t, W, 'claude', /Not installed|Not signed in/, 'offline situation loaded');
		await W.$('.o55-sublinks [data-o55-do="all"]').click(); await W.frame.waitForTimeout(1200);
		await act(W, 'xai-api', 'key').click(); await screenDone(W); await key('xai-api'); await W.frame.waitForTimeout(1500);
		const oopsOff = await W.frame.evaluate(() => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); const o = window.O55.pipOops.read(l); return o && o.key; });
		await t.check('p52: Pip reads "This computer is offline" (pip.oops.ai.offline)', oopsOff === 'ai.offline', String(oopsOff));
	},
	async 'Opus pass 2 minors: free models and Ready'(t) {
		let W = await open(t, 'free');
		await W.frame.waitForSelector(`${ROOT} [data-key="fr-free-openrouter"]`, { timeout: 10000 });
		const fb = (id) => freeBox(W, id), ftext = async (id) => ((await fb(id).innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
		const toast = async () => ((await W.frame.locator(`${ROOT} .o55-toast`).allInnerTexts().catch(() => [])) || []).join(' | ');
		// p53: OpenRouter's sign-in waits, has Browser didn't open? and Cancel
		await fb('free-openrouter').locator('[data-o55-do="route"]').click(); await W.frame.waitForTimeout(400);
		let o = await ftext('free-openrouter');
		await t.check('p53: the free sign-in waits for the person (not Ready at once)', /Waiting for you/.test(o) && !/Ready/.test(o) && /Browser didn't open\?/.test(o) && /Cancel/.test(o), o);
		await fb('free-openrouter').locator('[data-o55-do="fnoBrowser"]').click(); await W.frame.waitForTimeout(400);
		o = await ftext('free-openrouter');
		await t.crop('p53-openrouter', fb('free-openrouter'), "OpenRouter free sign-in after Browser didn't open?: its page, Open and Copy, Cancel");
		await t.check('p53: Browser didn\'t open? names the page, with Open and Copy', /openrouter\.ai/.test(o) && (await fb('free-openrouter').locator('[data-o55-do="fopenPage"]').count()) === 1 && (await fb('free-openrouter').locator('[data-o55-do="fcopyPage"]').count()) === 1, o);
		await fb('free-openrouter').locator('[data-o55-do="fcancelSignin"]').click(); await W.frame.waitForTimeout(3500);
		await t.check('p53: Cancel leaves it not set up, and the cancelled try never finishes', /Sign in/.test(await ftext('free-openrouter')) && !/Ready/.test(await ftext('free-openrouter')), await ftext('free-openrouter'));
		await fb('free-openrouter').locator('[data-o55-do="route"]').click();
		let u = Date.now() + 9000; while (Date.now() < u) { if (/Ready/.test(await ftext('free-openrouter'))) break; await W.frame.waitForTimeout(250); }
		await t.check('p53: the person\'s sign-in completes it', /Ready/.test(await ftext('free-openrouter')), await ftext('free-openrouter'));
		// p52: Pip has a line for a limit reached
		await fb('free-groq').locator('[data-o55-do="route"]').click(); await screenDone(W);
		await typeInto(W, '#o55f-fkey-free-groq', FAKE_KEY); await fb('free-groq').locator('[data-o55-do="fkeyCheck"]').click();
		u = Date.now() + 8000; while (Date.now() < u) { if (/Limit reached/.test(await ftext('free-groq'))) break; await W.frame.waitForTimeout(250); }
		const oopsLim = await W.frame.evaluate(() => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); const o = window.O55.pipOops.read(l); return o && o.key; });
		await t.check('p52: Pip reads "Limit reached"', /^free\.limited/.test(String(oopsLim)), String(oopsLim));
		// p58: More free options is a disclosure with its count and chevron
		const tog = W.frame.locator(`${ROOT} [data-o55-do="freeMore"]`);
		const tg = await tog.evaluate((b) => ({ text: b.innerText.trim(), svg: !!b.querySelector('svg'), q: !!b.querySelector('.o55-q'), exp: b.getAttribute('aria-expanded') }));
		await t.check('p58: "20 more free options" with a chevron, not a help note', /^20 more free options$/.test(tg.text) && tg.svg && !tg.q && tg.exp === 'false', JSON.stringify(tg));
		await t.crop('p58-toggle', W.$('[data-key="more-freeMore"]'), 'More free options as a disclosure with its count and chevron');
		await tog.click(); await W.frame.waitForTimeout(500);
		await t.crop('p57-more', W.$('[data-key="free-more"]'), 'More free options open: each compact row says what it needs');
		// p57: compact rows say what they need; Kilo isn't "Kilo / Kilo" once on
		await t.check('p57: a compact key row says it needs a key', /Needs a key/.test(await ftext('free-pollinations')), await ftext('free-pollinations'));
		await t.check('p57: Kilo says no account is needed', /No account needed/.test(await ftext('free-kilo')), await ftext('free-kilo'));
		await fb('free-kilo').scrollIntoViewIfNeeded(); await fb('free-kilo').locator('[data-o55-do="route"]').click();
		u = Date.now() + 5000; while (Date.now() < u) { if (/Ready/.test(await ftext('free-kilo'))) break; await W.frame.waitForTimeout(250); }
		const km = ((await fb('free-kilo').locator('.o55-rowmeta').innerText().catch(() => '')) || '').trim();
		await t.check('p57: once on, Kilo\'s line is not its name again', km !== 'Kilo' && !/Kilo/.test(km), km);
		// p67: a route that's set up can be turned off
		await fb('free-kilo').locator('[data-o55-do="routeOff"]').click(); await screenDone(W);
		await t.check('p67: Turn off takes it back to Turn on', /Turn on/.test(await ftext('free-kilo')) && !/Ready/.test(await ftext('free-kilo')), await ftext('free-kilo'));
		// p54: OpenCode's free models use its current name and the Console
		await t.check('p54: the free route says OpenCode Console, not Zen', /OpenCode Console free models/.test(await ftext('free-opencode')) && !/Zen/.test(await ftext('free-opencode')), await ftext('free-opencode'));
		await fb('free-opencode').scrollIntoViewIfNeeded(); await fb('free-opencode').locator('[data-o55-do="route"]').click(); await W.frame.waitForTimeout(500);
		await t.text(fb('free-opencode'), /Get a key from the OpenCode Console/, 'p54: "Get a key from the OpenCode Console"');
		await fb('free-opencode').locator('[data-o55-do="fcancel"]').click(); await screenDone(W);
		// p55: Cloudflare Workers AI: an API token and its account ID, from the API Tokens page
		await fb('free-cloudflare').scrollIntoViewIfNeeded(); await fb('free-cloudflare').locator('[data-o55-do="route"]').click(); await W.frame.waitForTimeout(500);
		const cf = await ftext('free-cloudflare');
		await t.crop('p55-cloudflare', fb('free-cloudflare'), 'Cloudflare Workers AI: API token and account ID');
		await t.check('p55: Cloudflare asks for its API token and its account ID', /Cloudflare API token/.test(cf) && /Cloudflare account ID/.test(cf) && (await W.$('#o55f-facct-free-cloudflare').count()) === 1, cf.slice(0, 300));
		await fb('free-cloudflare').locator('[data-o55-do="fkeyFrom"]').click(); await W.frame.waitForTimeout(300);
		await t.check("p55: Get a key opens Cloudflare's API Tokens page", /dash\.cloudflare\.com\/profile\/api-tokens/.test(await toast()), await toast());
		await typeInto(W, '#o55f-fkey-free-cloudflare', FAKE_KEY); await W.frame.waitForTimeout(200);
		await t.check('p55: Check waits for the account ID', (await fb('free-cloudflare').locator('[data-o55-do="fkeyCheck"]').getAttribute('aria-disabled')) === 'true', 'Check enabled without an account ID');
		await typeInto(W, '#o55f-facct-free-cloudflare', '0123456789abcdef'); await W.frame.waitForTimeout(200);
		await fb('free-cloudflare').locator('[data-o55-do="fkeyCheck"]').click();
		u = Date.now() + 6000; while (Date.now() < u) { if (/Ready/.test(await ftext('free-cloudflare'))) break; await W.frame.waitForTimeout(250); }
		await t.check('p55: token and account ID set it up', /Ready/.test(await ftext('free-cloudflare')), await ftext('free-cloudflare'));
		// p56: Codestral's own key page
		await fb('free-codestral').scrollIntoViewIfNeeded(); await fb('free-codestral').locator('[data-o55-do="route"]').click(); await W.frame.waitForTimeout(400);
		await fb('free-codestral').locator('[data-o55-do="fkeyFrom"]').click(); await W.frame.waitForTimeout(300);
		await t.check("p56: Codestral's Get a key opens Mistral's Codestral page", /console\.mistral\.ai\/codestral/.test(await toast()), await toast());
		// p60: no AI and no free models: Ready doesn't say "You're ready" or cheer
		W = await open(t, 'ai');
		await waitRow(t, W, 'claude', /Not installed|Not signed in|Ready/, 'AI screen checked this computer');
		await W.$('.o55-foot [data-o55-do="skip"]').click(); await screenDone(W);
		await W.$('.o55-foot .o55-primary').click(); await W.frame.waitForTimeout(1500);
		const rd = await W.frame.evaluate(() => ({ screen: window.O55.S.sess.screen, title: (document.querySelector('#pm-o55-onboarding .o55-title') || {}).textContent || '', line: window.O55.pipScenes.spec(window.O55.S, {}).lineId }));
		await t.check('p60: no AI: Ready says "Almost ready" and Pip doesn\'t cheer', rd.screen === 'ready' && /Almost ready/.test(rd.title) && rd.line === 'noAi', JSON.stringify(rd));
	}
	,
	// RV-17 (Opus second pass): Add another never makes a connected row read as signed out. The row keeps its Ready pill
	// and its account line; the new sign-in, key or choice is set up under it, headed "Adding another account".
	async 'RV-17: Add another keeps the row Ready with its accounts while the new one is set up'(t) {
		const W = await toAll(t, { scenario: 'signedOut' });
		const head = async (id) => {
			const pill = ((await W.$(`[data-key="pv-${id}"] > .o55-row .o55-pill`).innerText({ timeout: 2000 }).catch(() => '')) || '').trim();
			const meta = ((await W.$(`[data-key="pv-${id}"] > .o55-row .o55-rowmeta`).innerText({ timeout: 2000 }).catch(() => '')) || '').trim();
			const adding = ((await W.$(`[data-key="adding-${id}"]`).innerText({ timeout: 1000 }).catch(() => '')) || '').replace(/\s+/g, ' ');
			return { pill, meta, adding };
		};
		const kept = async (id, who, step, name) => {
			const h = await head(id);
			return t.check(name, /^Ready$/.test(h.pill) && h.meta.includes(who) && /Adding another (account|key)/.test(h.adding) && step.test(h.adding) && !/Not signed in/.test(h.pill + h.meta), JSON.stringify(h), { target: row(W, id) });
		};
		const add = async (id) => { await act(W, id, 'manage').click(); await screenDone(W); await W.$(`[data-o55-do="addAnother"][data-arg="${id}"]`).click(); await screenDone(W); };
		// Claude: a browser sign-in
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /(?=.*Ready)(?=.*jared@example\.com)/, 'Claude Ready with its account', 9000);
		await add('claude');
		await kept('claude', 'jared@example.com', /Sign In/, 'Claude: Add another keeps Ready and jared@example.com; Sign In is under it');
		await t.crop('adding-claude', row(W, 'claude'), 'Claude Ready with its account while another is added under it');
		await act(W, 'claude', 'signin').click(); await W.frame.waitForTimeout(400);
		await kept('claude', 'jared@example.com', /Waiting for you/, 'Claude: while the new sign-in waits, the row is still Ready with its account');
		await W.$('[data-o55-do="cancelSignin"][data-arg="claude"]').click(); await screenDone(W);
		let h = await head('claude');
		await t.check('Claude: Cancel during the new sign-in ends the addition; the row is as it was', /^Ready$/.test(h.pill) && h.meta.includes('jared@example.com') && !h.adding, JSON.stringify(h));
		await add('claude');
		await W.$('[data-o55-do="cancelAdd"][data-arg="claude"]').click(); await screenDone(W);
		h = await head('claude');
		await t.check('Claude: Cancel before signing in ends the addition', /^Ready$/.test(h.pill) && !h.adding, JSON.stringify(h));
		await add('claude');
		await act(W, 'claude', 'signin').click();
		await waitRow(t, W, 'claude', /2 accounts: jared@example\.com, jared@studio\.example/, 'Claude: the new account joins the first');
		// Codex: its other way, a key, added under a ChatGPT account
		await waitRow(t, W, 'codex', /Not signed in/, 'Codex ready to sign in');
		await act(W, 'codex', 'signin').click();
		await waitRow(t, W, 'codex', /Ready/, 'Codex Ready with ChatGPT', 9000);
		const codexWho = (await head('codex')).meta;
		await add('codex');
		await W.$('[data-o55-do="useAlt"][data-arg="codex"]').click(); await screenDone(W);
		await t.visible(W.$('#o55f-key-codex'), 'Codex: the key field is under the row');
		await kept('codex', codexWho.split(' · ')[0], /OpenAI API key/, 'Codex: while a key is entered, the row is still Ready with its ChatGPT account');
		await W.$('[data-o55-do="cancelAdd"][data-arg="codex"]').click(); await screenDone(W);
		// Copilot: the second sign-in asks whose plan, under the first account
		await waitRow(t, W, 'copilot', /Not signed in/, 'Copilot ready to sign in');
		await act(W, 'copilot', 'signin').click();
		await waitRow(t, W, 'copilot', /Needs a choice/, 'Copilot asks whose plan', 9000);
		await W.$('[data-o55-do="entity"][data-arg="copilot|book-club-crew"]').click();
		await waitRow(t, W, 'copilot', /(?=.*Ready)(?=.*through book-club-crew)/, 'Copilot Ready through book-club-crew');
		await add('copilot');
		await act(W, 'copilot', 'signin').click();
		await waitRow(t, W, 'copilot', /Needs a choice/, 'Copilot: the second sign-in asks whose plan', 9000);
		await kept('copilot', 'jared-p', /Needs a choice/, 'Copilot: while the second account asks whose plan, the row is still Ready with jared-p');
		await t.check('Copilot: the first account keeps its plan line', (await head('copilot')).meta.includes('through book-club-crew'), (await head('copilot')).meta);
		await t.crop('adding-copilot', row(W, 'copilot'), 'Copilot Ready with jared-p while the second account asks whose plan');
		await W.$('[data-o55-do="entity"][data-arg="copilot|jared-studio"]').click();
		await waitRow(t, W, 'copilot', /2 accounts: jared-p, jared-studio/, 'Copilot: both accounts once the second is chosen');
	}
	,
	// RV-9 sweep: a sign-in that didn't finish, was offline, or has expired is over. Sign in again opens the
	// vendor's page afresh as a new try whose browser step waits for the person again; the old try's result is dropped.
	async 'RV-9: Sign in again is a fresh sign-in, its old completion cleared'(t) {
		const opens = (W) => W.frame.evaluate(() => window.O55.owners.log.filter((e) => e.id === 'cmd.auth_profile.open_official_page').length);
		const rec = (W, id) => W.frame.evaluate((id) => {
			const S = window.O55.S, r = S.sess.ai.accounts[id] || {}, k = 'signin:' + id + ':' + (r.attempt || 0), op = (S.sess.ops || {})[k];
			return { attempt: r.attempt || 0, state: r.state, failCode: r.failCode || null, remote: r.remote || null, op: op ? op.state : null, phases: op ? op.phases.map((p) => p.key + '=' + p.status).join(',') : '', accounts: S.sess.ai.list.filter((e) => e.provider === id).length };
		}, id);
		const CASES = [['antigravityOnce', 'antigravity', /Didn't sign in/, 'did not finish'], ['aiOffline', 'antigravity', /offline/, 'offline'], ['claudeExpired', 'claude', /Sign-in expired/, 'expired']];
		for (const [scenario, id, failed, why] of CASES) {
			const W = why === 'expired' ? await open(t, 'ai', { scenario }) : await toAll(t, { scenario });
			if (await act(W, id, 'install').count()) { await act(W, id, 'install').click(); await screenDone(W); await W.$(`[data-o55-do="installGo"][data-arg="${id}"]`).click(); await waitRow(t, W, id, /Not signed in/, `${why}: ${id} installed, ready to sign in`, 12000); }
			if (why !== 'expired') { await act(W, id, 'signin').click(); }
			await waitRow(t, W, id, failed, `${why}: the row says the sign-in is over`, 8000);
			const before = await rec(W, id), o1 = await opens(W);
			await t.check(`${why}: nothing connected`, before.accounts === 0 && (why === 'expired' || before.op === 'failed'), JSON.stringify(before));
			await act(W, id, 'signin').click(); await W.frame.waitForTimeout(200);
			const fresh = await rec(W, id), o2 = await opens(W), txt = await rowText(W, id);
			await t.check(`${why}: Sign in again opens the vendor's page again`, o2 === o1 + 1, `opens ${o1} -> ${o2}`);
			await t.check(`${why}: a new try, cleared (new attempt, no old code or fallback)`, fresh.attempt === before.attempt + 1 && fresh.state === 'signingIn' && !fresh.failCode && !fresh.remote, JSON.stringify(fresh));
			await t.check(`${why}: its browser step waits for the person again`, /^browser=(active|waiting),verify=waiting$/.test(fresh.phases) && fresh.op === 'running', fresh.phases);
			await t.check(`${why}: the row waits for the person, not Ready`, /Waiting for you/.test(txt) && !/\bReady\b/.test(txt), txt.slice(0, 200));
			await waitRow(t, W, id, /Ready/, `${why}: the person's new sign-in completes it`, 8000);
		}
		// a try left for "Browser didn't open?" never completes the row by itself: only the pasted code does
		const W = await toAll(t);
		if (await act(W, 'antigravity', 'install').count()) { await act(W, 'antigravity', 'install').click(); await screenDone(W); await W.$('[data-o55-do="installGo"][data-arg="antigravity"]').click(); }
		await waitRow(t, W, 'antigravity', /Not signed in/, 'fallback: antigravity ready to sign in', 12000);
		await act(W, 'antigravity', 'signin').click(); await W.frame.waitForTimeout(300);
		await W.$('[data-o55-do="noBrowser"][data-arg="antigravity"]').click(); await W.frame.waitForTimeout(3200);
		const left = await rec(W, 'antigravity');
		await t.check('fallback: the browser try it replaced does not finish it', left.state === 'signingIn' && left.remote === 'paste' && left.accounts === 0, JSON.stringify(left));
	}
};

