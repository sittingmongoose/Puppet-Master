// FO-175 (opus-recheck-fo169-170, read in code): a web-address route set up in onboarding lost its proxy choice on the
// way to Settings, so Settings showed Caddy even when NGINX was picked. The onboarding result (O55.handoff,
// pm.onboarding.result.v1) carried the route's mode, address and state but not the proxy, and Settings' servers manager
// (50-servers.js adoptOnboarding) then wrote `{ proxy: 'Proxy' }`, which its proxy picker reads as Caddy. A route the
// person said runs on a proxy of their own ("I have one already") came over as a file Puppet Master makes, for Caddy.
// Canon (DL-259 D3 A / CERT-1): onboarding's proxy_kind is exactly caddy, nginx or traefik, and neither branch silently
// substitutes a family.
//
// Each test is one choice, end to end, with real clicks from Use it away from home? on: the Server steps before it are
// left as Demo Studio's "Open at one screen" leaves them (O55.away.seedServer: a new Home NAS, claimed and trusted).
// Other ways to connect › My own web address, the address typed, Make the settings file (or I have one already),
// Which proxy › the family, the internet agreement, Continue, Create Project, Continue, the away steps (I've added it),
// Skip for now on AI, Continue, Enter Puppet Master. Then Settings › System › Server & Project Location › Away From Home,
// a real click on the Custom domain row, and on its sheet:
// - the Proxy shown is the family picked (the painted dropdown label and its value), or "Your own proxy · nothing is
//   made for it" for a proxy of the person's own;
// - the route reads "<family> at pm.example.net" in Technical details' Trusted proxy, never "Proxy at" or another family;
// - its settings file (shown, or made by a real click on Make the settings file) is that family's file (NGINX server
//   block, Traefik dynamic config, Caddyfile), the same one onboarding gave; for a proxy of the person's own, nothing
//   is offered to make.
// The surface the switch picks (`--set sandbox=1`, `--set sandbox=0`); without it, both. `--set kinds=nginx,traefik`
// picks some. Fails on main for all four choices, caddy included (its Make the settings file built an NGINX block
// there); the FO-175 hand-off fix is what makes them pass.
//
// FO-179 adds one case for the connect journey: an EXISTING Server reached by its web address. Where is this
// Puppet Master? › Connect this device, Continue, Other ways to connect › My own web address, the address typed
// (it resolves to the fixture Home NAS), Continue, Connect, the pairing's Continue, Enter Puppet Master — all real
// clicks. The hand-off must say proxy_hosting existing_proxy with no family, and Settings' Custom domain sheet must
// keep it a proxy of the person's own: Your own proxy, nothing offered to make, Trusted proxy "Your proxy at
// pm.example.net". Fails on main and on the FO-175 base d9399baa40: the connect draft's cleared proxy came over as
// null, which Settings reads as an old saved result and shows Caddy with Make the settings file. Passes with the
// FO-179 hand-off fix. `--set kinds` does not filter this case.
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const BLOCK = '.workspace-block[data-workspace-block="servers"]';
const HOST = 'pm.example.net';
const KINDS = { caddy: 'Caddy', nginx: 'NGINX', traefik: 'Traefik', existing: null };
const FILE_HEAD = { caddy: /^# Caddyfile|^pm\.example\.net\s*\{/m, nginx: /^# NGINX server block/, traefik: /^# Traefik dynamic config/ };
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const sleep = (f, ms) => f.waitForTimeout(ms);

async function walkOnboarding(t, f, kind) {
	const click = async (sel) => { const l = f.locator(sel).filter({ visible: true }).first(); await l.click({ timeout: 10000 }); await sleep(f, 450); };
	const screen = () => f.evaluate(() => O55.S.sess.screen);
	const draft = () => f.evaluate(() => (({ remote_mode, proxy_kind, proxy_hosting, proxy_hostname }) => ({ remote_mode, proxy_kind, proxy_hosting, proxy_hostname }))(O55.S.sess.drafts.main));
	/* the Server steps as Demo Studio's Open at one screen leaves them; the way in is chosen below, by hand */
	await f.evaluate(() => { O55.away.seedServer(O55.S); O55.ui.go('away'); });
	await f.waitForFunction(() => O55.S.sess.screen === 'away' && !document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-out'), null, { timeout: 15000 });
	await sleep(f, 600);
	await click(`${LAYER} [data-o55-do="more"]`);
	await click(`${LAYER} [data-o55-do="route"][data-arg="reverse_proxy"]`);
	const field = f.locator('#o55f-proxy'); await field.click(); await field.pressSequentially(HOST, { delay: 20 }); await sleep(f, 400);
	if (kind === 'existing') await click(`${LAYER} [data-o55-do="hosting"][data-arg="existing_proxy"]`);
	else {
		await click(`${LAYER} [data-o55-do="details"][data-arg="proxykind"]`);
		await click(`${LAYER} [data-o55-do="kind"][data-arg="${kind}"]`);
	}
	await click(`${LAYER} [data-o55-do="consent"]`);
	const d = await draft();
	const planned = d.remote_mode === 'reverse_proxy' && [HOST, `https://${HOST}`].includes(d.proxy_hostname)
		&& (kind === 'existing' ? d.proxy_hosting === 'existing_proxy' && !d.proxy_kind : d.proxy_hosting === 'generate_only' && d.proxy_kind === kind);
	await t.check(`onboarding: the plan holds the web address and the choice (${kind})`, planned, JSON.stringify(d));
	await click('#pm-o55-onboarding .o55-foot [data-o55-do="next"]');
	await f.waitForFunction(() => O55.S.sess.screen === 'review', null, { timeout: 15000 }); await sleep(f, 700);
	let file = '';
	for (let i = 0; i < 30; i++) {
		if (!(await f.evaluate(() => !!(O55.S && O55.S.open)))) break;
		const s = await screen();
		const prim = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-foot .o55-primary'); return b ? { do: b.getAttribute('data-o55-do'), off: b.disabled || b.getAttribute('aria-disabled') === 'true' } : null; });
		if (s === 'away-setup' && !file) file = await f.evaluate((L) => { const b = document.querySelector(`${L} [data-o55-do="copyText"]`); return b ? b.getAttribute('data-arg') || '' : ''; }, LAYER);
		if (s === 'ai' && await f.locator(`${LAYER} [data-o55-do="skip"]`).filter({ visible: true }).count()) { await click(`${LAYER} [data-o55-do="skip"]`); await sleep(f, 900); continue; }
		if (s === 'ready') { await click(`#pm-o55-onboarding [data-o55-do="enter"]`); await sleep(f, 1500); continue; }
		if (!prim || prim.off) { await sleep(f, 1200); continue; }
		await click('#pm-o55-onboarding .o55-foot .o55-primary'); await sleep(f, 1000);
	}
	await f.waitForFunction(() => !(O55.S && O55.S.open) && !!window.PM_ONBOARDING_RESULT, null, { timeout: 20000 });
	await sleep(f, 1500);
	const r = await f.evaluate(() => PM_ONBOARDING_RESULT.route);
	t.log(JSON.stringify({ kind, route: r, file: file.slice(0, 60) }));
	await t.check(`onboarding finished with the web address set up (${kind})`, !!r && r.mode === 'reverse_proxy' && r.state === 'ready', JSON.stringify(r));
	if (kind !== 'existing') await t.check(`onboarding gave the ${KINDS[kind]} settings file`, FILE_HEAD[kind].test(file), file.slice(0, 80));
}

/* FO-179: the connect journey, an existing Server reached by its web address. The Server choice (Connect this
   device), the route, the address, Connect, the pairing's Continue and Enter are real clicks; the typed address
   resolves to the fixture Home NAS (resolveAddress), as it would for a person. */
async function walkConnect(t, f) {
	const click = async (sel) => { const l = f.locator(sel).filter({ visible: true }).first(); await l.click({ timeout: 10000 }); await sleep(f, 450); };
	await f.evaluate(() => { O55.ui.go('where'); });
	await f.waitForFunction(() => O55.S.sess.screen === 'where' && !document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-out'), null, { timeout: 15000 });
	await sleep(f, 600);
	await click(`${LAYER} [data-o55-do="pick"][data-arg="connect"]`);
	await click('#pm-o55-onboarding .o55-foot [data-o55-do="next"]');
	await f.waitForFunction(() => O55.S.sess.screen === 'c-route' && O55.S.sess.active === 'connect', null, { timeout: 15000 });
	await sleep(f, 600);
	await click(`${LAYER} [data-o55-do="more"]`);
	await click(`${LAYER} [data-o55-do="route"][data-arg="reverse_proxy"]`);
	const field = f.locator('#o55f-proxy'); await field.click(); await field.pressSequentially(HOST, { delay: 20 }); await sleep(f, 400);
	const d = await f.evaluate(() => (({ server_ref, remote_mode, proxy_hostname }) => ({ server_ref, remote_mode, proxy_hostname }))(O55.S.sess.drafts.connect));
	await t.check('onboarding: the connect plan holds the existing Server and the web address', d.remote_mode === 'reverse_proxy' && !!d.server_ref && [HOST, `https://${HOST}`].includes(d.proxy_hostname), JSON.stringify(d));
	await click('#pm-o55-onboarding .o55-foot [data-o55-do="next"]');
	await f.waitForFunction(() => O55.S.sess.screen === 'c-review', null, { timeout: 15000 }); await sleep(f, 700);
	await click('#pm-o55-onboarding .o55-foot .o55-primary'); /* Connect: the review's one confirmation, then the pairing */
	await f.waitForFunction(() => O55.S.sess.screen === 'c-pair', null, { timeout: 15000 });
	await f.waitForFunction(() => { const c = O55.S.sess.connect, d = O55.S.sess.drafts.connect; return !!(c.trusts && c.trusts[d.server_ref] && d.server_trust_confirmed); }, null, { timeout: 20000 });
	await sleep(f, 600);
	await click('#pm-o55-onboarding .o55-foot [data-o55-do="next"]');
	await f.waitForFunction(() => O55.S.sess.screen === 'c-ready', null, { timeout: 15000 }); await sleep(f, 700);
	await click('#pm-o55-onboarding [data-o55-do="enter"]');
	await f.waitForFunction(() => !(O55.S && O55.S.open) && !!window.PM_ONBOARDING_RESULT, null, { timeout: 20000 });
	await sleep(f, 1500);
	const r = await f.evaluate(() => PM_ONBOARDING_RESULT.route);
	t.log(JSON.stringify({ journey: 'connect_existing', route: r }));
	await t.check('onboarding finished with the existing Server in use over its web address', !!r && r.mode === 'reverse_proxy' && r.state === 'in_use', JSON.stringify(r));
	await t.check('onboarding hands over the proxy already running at that address (existing_proxy, no family)', !!r && r.proxy_hosting === 'existing_proxy' && r.proxy_family === null, JSON.stringify(r));
}

async function readSheet(t, f, kind, surface, tag) {
	await f.locator('#tab-settings').click();
	await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]', { timeout: 15000 });
	await f.evaluate(() => PM51.go('system', 'servers'));
	await f.waitForSelector(`${BLOCK} [role="tab"][data-manager="servers"][data-tab="away"]`, { timeout: 15000 });
	await sleep(f, 700);
	await f.locator(`${BLOCK} [role="tab"][data-action="pm51-tab"][data-manager="servers"][data-tab="away"]`).first().click();
	await f.waitForFunction(() => PM51.tab('servers') === 'away', null, { timeout: 6000 }); await sleep(f, 700);
	/* Technical details sit in the Away tab's own More options fold: opened by a real click on its summary */
	const fold = f.locator(`${BLOCK} details.pm51-advanced:not([open]) > summary`).filter({ visible: true }).last();
	if (await fold.count()) { await fold.scrollIntoViewIfNeeded(); await fold.click(); await sleep(f, 600); }
	const tech = await f.evaluate((B) => { const r = [...document.querySelectorAll(`${B} .pm51-kv-row, ${B} dl > div, ${B} tr, ${B} .pm51-kv > *`)].find((x) => /Trusted proxy/.test(x.innerText) && x.innerText.length < 200); return r ? r.innerText.replace(/\s+/g, ' ').trim() : ''; }, BLOCK);
	const row = f.locator(`${BLOCK} .pm51-servers-route[data-route="domain"] .pm51-item-title`).first();
	await row.scrollIntoViewIfNeeded(); await row.click(); await sleep(f, 900);
	const sheet = f.locator('.drawer-wrap:not([data-closing]) aside.drawer').last();
	await sheet.waitFor({ state: 'visible', timeout: 6000 }); await sleep(f, 600);
	const read = () => sheet.evaluate((el) => {
		const sel = el.querySelector('select[data-action="pm51-servers-domain-proxy"]'), dd = sel ? sel.closest('.pm51-dd') : null;
		if (dd) dd.scrollIntoView({ block: 'center' });
		const shown = dd ? (dd.querySelector('.pm51-dd-value') || {}).textContent || '' : '';
		const r = dd ? dd.getBoundingClientRect() : null, top = r ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
		return { title: (el.querySelector('.pm51-panel-title') || {}).textContent || '', select: sel ? sel.value : null, shown: shown.trim(), painted: !!(dd && top && dd.contains(top)),
			config: ((el.querySelector('[data-domain-config]') || {}).innerText || '').trim(), make: !!el.querySelector('[data-action="pm51-servers-domain-generate"]'), text: el.innerText.replace(/\s+/g, ' ') };
	});
	const s = await read();
	t.log(JSON.stringify({ kind, surface, tech, sheet: { ...s, text: s.text.slice(0, 500), config: s.config.slice(0, 80) } }));
	const fam = KINDS[kind];
	await t.shot(`${tag || 'fo175'}-${kind}-${surface}`, `Settings › Away From Home › Custom domain after onboarding with ${fam || 'a proxy of my own'}`);
	await t.check(`${surface}: the Custom domain sheet opened`, /Custom domain/i.test(s.title), s.title);
	if (fam) {
		await t.check(`${surface}: Settings shows the proxy picked in onboarding, ${fam} (painted dropdown label and value)`, s.select === fam && s.shown === fam && s.painted, JSON.stringify({ select: s.select, shown: s.shown, painted: s.painted }));
		await t.check(`${surface}: Technical details › Trusted proxy reads ${fam} at ${HOST}`, tech.includes(`${fam} at ${HOST}`), tech);
		await t.check(`${surface}: the sheet names no other family's file and no bare "Proxy at"`, !/\bProxy at\b/.test(s.text) && Object.values(KINDS).filter((k) => k && k !== fam).every((k) => !new RegExp(`(settings file for|Add (it|the settings file) to) ${k}\\b`).test(s.text)), s.text.slice(0, 500));
		if (!s.config && s.make) { await sheet.locator('[data-action="pm51-servers-domain-generate"]').first().click(); await sleep(f, 700); }
		const after = await read();
		t.log(JSON.stringify({ kind, surface, after: after.config.slice(0, 160) }));
		await t.check(`${surface}: its settings file is the ${fam} one`, FILE_HEAD[kind].test(after.config), after.config.slice(0, 120));
	} else {
		await t.check(`${surface}: Settings keeps it a proxy of the person's own, nothing made for it`, /Your own proxy/.test(s.text) && !s.make && s.select === null, JSON.stringify({ make: s.make, select: s.select, text: s.text.slice(0, 300) }));
		await t.check(`${surface}: Technical details › Trusted proxy reads Your proxy at ${HOST}`, tech.includes(`Your proxy at ${HOST}`), tech);
	}
}

export const tests = {};
for (const kind of Object.keys(KINDS)) {
	tests[`FO-175: a web address set up in onboarding with ${KINDS[kind] || 'a proxy of my own'} reaches Settings as that`] = async (t) => {
		if (!list(t.args.kinds, Object.keys(KINDS)).includes(kind)) { t.log(`skipped: --set kinds leaves out ${kind}`); return; }
		for (const surface of t.app.surfaces()) {
			await t.viewport(1440, 900);
			const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: surface === 'sandbox', settleMs: 1500 });
			await f.waitForFunction(() => window.O55 && O55.S && O55.S.open, null, { timeout: 40000 });
			await walkOnboarding(t, f, kind);
			await readSheet(t, f, kind, surface);
		}
	};
}

tests['FO-179: an existing Server reached by its web address in onboarding reaches Settings as my own proxy'] = async (t) => {
	for (const surface of t.app.surfaces()) {
		await t.viewport(1440, 900);
		const f = await t.app.open({ onboarding: true, query: 'o55=fresh&o55scenario=fresh', sandbox: surface === 'sandbox', settleMs: 1500 });
		await f.waitForFunction(() => window.O55 && O55.S && O55.S.open, null, { timeout: 40000 });
		await walkConnect(t, f);
		await readSheet(t, f, 'existing', surface, 'fo179');
	}
};
