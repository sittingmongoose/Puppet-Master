// FO-132 (stream F batch 11, lane A): Settings › Server & Project Location › Away From Home, the remote setup guide
// against current canon and onboarding's own away setup (GUIDED-FLOWS-CHECK.md rows 1.05-1.11,
// /mnt/Cursor/share/puppet-master/2026-11-09-settings-feedback/):
// - 1.05 Tailscale is "Built into Puppet Master", and the guide says which installation joins: the server gets its own
//   connection, each Puppet Master app signs in once on its own computer, and a browser tab cannot join (RAS D7 B).
// - 1.06 Setting Tailscale up is the owner's staged steps, each with its own answer (start, the person's sign-in,
//   Tailscale's yes, device approval, the private address, the test), as src/js/71a-screens-away.js runs them; a refused
//   or expired sign-in goes back to a fresh sign-in on Try again, an admin-approval failure asks that step again;
//   Headscale with an administrator waits for "It's approved".
// - 1.07-1.09 A web address: Puppet Master makes the settings file (Caddy, NGINX or Traefik, Caddy first) or only checks
//   a proxy you already run; it never sets up or runs Caddy, never promises a certificate, and Nginx Proxy Manager is not
//   a file it makes (Planning_Wizard.md DL-259 CERT-1; Remote_Access_System.md DL-259 D3 A).
// - 1.10 The check before a way in is called ready lists every owner check (reachability, the app and server
//   understanding each other, identity, sign-in and pairing, live updates, streams, transfers, links, callbacks).
// - 1.11 Remote Link shows the link and short code the Remote Link service issues: an https link and an opaque code,
//   nothing in them made from the server's id or name; no pm-link:// anywhere.
// On the unchanged page the guide has one "Sign in to Tailscale" button that jumps to Signed in, a "Puppet Master sets it
// up (Caddy)" choice that "gets a free certificate by itself", Nginx Proxy Manager as a file to make, four check rows and
// a pm-link://<server id>-<code> link. Runs on the surface the switch picks (--set sandbox=1 for T3's preview).
import fs from 'node:fs';
import { pagePath } from '../helpers/onboarding-fields.mjs';
import { ink } from '../helpers/text-ink.mjs';
import { LOOKS } from '../browser-check.config.mjs';

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
const WIN = '.o55g-win';

async function openAway(t) {
	await t.viewport(1440, 900);
	const f = await t.app.open({ settleMs: 1500 });
	await f.locator('#tab-settings').click();
	await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]', { timeout: 15000 });
	await f.evaluate(() => PM51.go('system', 'servers'));
	await f.waitForSelector(`${BLOCK} [role="tab"][data-tab="away"]`, { timeout: 15000 });
	await sleep(f, 800);
	await f.locator(`${BLOCK} [role="tab"][data-action="pm51-tab"][data-manager="servers"][data-tab="away"]`).first().click();
	await f.waitForFunction(() => PM51.tab('servers') === 'away', null, { timeout: 6000 });
	await sleep(f, 600);
	return f;
}
async function setUp(f, route) {
	await f.locator(`${BLOCK} .pm51-servers-route[data-route="${route}"] [data-action="pm51-servers-remote"]`).first().click();
	await f.waitForSelector(WIN, { timeout: 5000 });
	await sleep(f, 700);
}
/* (a step being drawn again keeps the outgoing pane a moment: always read the newest) */
const title = (f) => f.evaluate((W) => { const e = [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) .o55g-title`)].pop(); return e ? e.textContent.trim() : ''; }, WIN);
const main = (f) => f.evaluate((W) => { const e = [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) .o55g-main`)].pop(); return e ? e.innerText : ''; }, WIN);
async function cont(f) { await f.locator(`${WIN} .o55g-primary`).first().click(); await sleep(f, 700); }
const tsState = (f) => f.evaluate((W) => { const e = [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) [data-ts-state]`)].pop(); return e ? e.dataset.tsState : ''; }, WIN);
async function untilTs(f, want, ms = 9000) {
	const end = Date.now() + ms; let s = '';
	while (Date.now() < end) { s = await tsState(f); if (want.includes(s)) return s; await sleep(f, 150); }
	return s;
}
const phases = (f) => f.evaluate((W) => { const box = [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) [data-ts-state]`)].pop(); return (box ? [...box.querySelectorAll('.pm51-step')] : []).map((li) => ({ t: li.querySelector('.pm51-step-title').textContent.trim(), done: li.classList.contains('is-done'), s: (li.querySelector('.pm51-step-end') || {}).textContent || '' })); }, WIN);
async function press(f, label) { await f.locator(`${WIN} .o55g-layer:not(.o55g-out) .o55g-main`).last().locator('button', { hasText: label }).first().click(); await sleep(f, 300); }

export const tests = {
	async '1.05 + 1.06: Tailscale is built in, says which installation joins, and runs the owner’s staged steps'(t) {
		const f = await openAway(t);
		await setUp(f, 'tailscale');
		const details = await main(f);
		await t.check('Details: Built into Puppet Master, nothing extra to install', /Built into Puppet Master/.test(details) && /nothing extra to install/i.test(details), details.slice(0, 300));
		await t.check('Details: the server gets its own connection; each app signs in once; a browser tab can’t join', /its own private connection/.test(details) && /signs in once/.test(details) && /browser tab can.t join/.test(details), details.slice(0, 400));
		await cont(f);
		await t.check('Connect step is the setup, not one sign-in button', /Setting up Tailscale for/.test(await title(f)), await title(f));
		let ph = await phases(f);
		t.log(JSON.stringify(ph.map((p) => p.t)));
		const want = [/^Starting Puppet Master.s connection/, /^Signing in to Tailscale/, /^Waiting for Tailscale to say yes/, /^Waiting for device approval/, /^Creating the private address/, /^Testing the web page, the app and the live connection/];
		await t.check('six staged steps in the owner’s order', ph.length === 6 && want.every((re, i) => re.test(ph[i].t)), JSON.stringify(ph.map((p) => p.t)));
		await cont(f);
		const err = await f.evaluate((W) => (document.querySelector(`${W} .o55g-error`) || {}).textContent || '', WIN);
		await t.check('Continue waits until the steps have run', /Press Start first/.test(err) && /Setting up Tailscale/.test(await title(f)), err);
		await press(f, 'Start');
		let s = await untilTs(f, ['waiting']);
		ph = await phases(f);
		await t.check('it starts, then waits for the person’s own sign-in', s === 'waiting' && ph[0].done && /Waiting for you/.test(ph[1].s), JSON.stringify({ s, ph }));
		await t.check('nothing past the sign-in is done yet', ph.slice(1).every((p) => !p.done), JSON.stringify(ph));
		await press(f, 'Sign in to Tailscale');
		s = await untilTs(f, ['running']);
		const mid = await phases(f);
		await t.check('each later step reports In progress while it runs', mid.some((p) => /In progress/.test(p.s)), JSON.stringify(mid));
		s = await untilTs(f, ['done']);
		ph = await phases(f);
		const done = await main(f);
		await t.check('all six answered, in order', s === 'done' && ph.every((p) => p.done), JSON.stringify({ s, ph }));
		await t.check('the result says which installation is connected', /Which installation is connected/.test(done) && /the server/.test(done) && /signs in once there/.test(done), done.slice(0, 400));
		await t.shot('away-tailscale-done', 'Tailscale set up: six owner steps answered, the installation named');
		await cont(f);
		await t.check('then Check', /Does it work from here/.test(await title(f)), await title(f));
	},
	async '1.06: each answer updates the step where it stands: no redraw, no entrance replay, focus and scroll kept'(t) {
		/* (batch 11 lane A recheck: every answer used to draw the whole step again with its step-change entrance, the pane
		   back at its top and focus on the title; 1280x500 so the step scrolls) */
		await t.viewport(1280, 500);
		const f = await t.app.open({ settleMs: 1500 });
		await f.locator('#tab-settings').click();
		await f.waitForSelector('#pm-settings-root .domain-link[data-domain="system"]', { timeout: 15000 });
		await f.evaluate(() => PM51.go('system', 'servers')); await sleep(f, 800);
		await f.locator(`${BLOCK} [role="tab"][data-action="pm51-tab"][data-manager="servers"][data-tab="away"]`).first().click(); await sleep(f, 600);
		await setUp(f, 'tailscale'); await cont(f);
		await press(f, 'Start'); await untilTs(f, ['waiting']);
		/* watch the step: its content node, outgoing copies and entrance replays, from here to the end of the run */
		await f.evaluate((W) => {
			const win = document.querySelector(W), pane = win.querySelector('.o55g-pane'), main = win.querySelector('.o55g-layer:not(.o55g-out) .o55g-main');
			main.__tsMark = true; window.__tsWatch = { outs: 0, entrances: 0 };
			window.__tsObs = new MutationObserver((ms) => { for (const m of ms) { if (m.type === 'childList') m.addedNodes.forEach((n) => { if (n.classList && n.classList.contains('o55g-out')) window.__tsWatch.outs++; }); if (m.type === 'attributes' && m.target === pane && pane.classList.contains('o55g-entering')) window.__tsWatch.entrances++; } });
			window.__tsObs.observe(pane, { childList: true, attributes: true, attributeFilter: ['class'] });
		}, WIN);
		await press(f, 'Sign in to Tailscale');
		await untilTs(f, ['running']);
		const before = await f.evaluate((W) => { const layer = document.querySelector(`${W} .o55g-layer:not(.o55g-out)`); layer.scrollTop = layer.scrollHeight; const a = document.activeElement; a.__tsFocus = true; return { scroll: layer.scrollTop, max: layer.scrollHeight - layer.clientHeight, focus: a.tagName + '.' + a.className + (a.hasAttribute('data-ts-steps') ? '[steps]' : '') }; }, WIN);
		const s = await untilTs(f, ['done']);
		const after = await f.evaluate((W) => { const layer = document.querySelector(`${W} .o55g-layer:not(.o55g-out)`), main = document.querySelector(`${W} .o55g-layer:not(.o55g-out) .o55g-main`), a = document.activeElement; window.__tsObs.disconnect(); return { sameStep: !!(main && main.__tsMark), outs: window.__tsWatch.outs, entrances: window.__tsWatch.entrances, scroll: layer.scrollTop, sameFocus: !!a.__tsFocus, focus: a.tagName + '.' + a.className, title: a.classList.contains('o55g-title') }; }, WIN);
		t.log(JSON.stringify({ before, after }));
		await t.check('the run finished', s === 'done', s);
		await t.check('the step was never drawn again: the same content, no outgoing copy, no entrance replay', after.sameStep && after.outs === 0 && after.entrances === 0, JSON.stringify(after));
		await t.check('focus stayed where it was (never moved to the title)', after.sameFocus && !after.title, JSON.stringify({ before: before.focus, after: after.focus }));
		await t.check('the pane kept its scroll (no jump to the top)', before.scroll > 0 && after.scroll >= before.scroll - 2, JSON.stringify({ before: before.scroll, after: after.scroll }));
		/* a demo answer pressed keeps its button and its focus */
		await closeAll(f); await setUp(f, 'tailscale'); await cont(f); await press(f, 'Start'); await untilTs(f, ['waiting']);
		const chip = f.locator(`${WIN} .o55g-layer:not(.o55g-out) [data-action="pm51-servers-ts-demo"][data-code="denied"]`);
		await chip.focus(); await chip.press('Enter'); await sleep(f, 300);
		const kept = await f.evaluate((W) => { const a = document.activeElement; return { code: a.getAttribute('data-code'), pressed: a.getAttribute('aria-pressed') }; }, WIN);
		await t.check('a demo answer pressed by keyboard keeps focus and shows it is chosen', kept.code === 'denied' && kept.pressed === 'true', JSON.stringify(kept));
	},
	async '1.06 + 1.11: a refusal under Continue goes away once the step it names has moved on'(t) {
		/* (recheck F1 on 10da46a5ea: the in-place update left "Press Start first.", "Wait for the steps to finish." and
		   "Create the link first." under steps that had moved on; the full redraw before it had cleared them) */
		const refusal = (f) => f.evaluate((W) => { const e = document.querySelector(`${W} .o55g-layer:not(.o55g-out) .o55g-error`); return e ? { text: e.textContent.trim(), shown: !e.hidden && !!e.textContent.trim() && e.getClientRects().length > 0 } : { text: '', shown: false }; }, WIN);
		const f = await openAway(t);
		await setUp(f, 'tailscale'); await cont(f);
		await cont(f);
		let r = await refusal(f);
		await t.check('Continue before Start is refused: Press Start first.', r.shown && /Press Start first/.test(r.text), JSON.stringify(r));
		await press(f, 'Start');
		await untilTs(f, ['running', 'waiting']);
		r = await refusal(f);
		await t.check('once Start is pressed, "Press Start first." is gone', !r.shown && !/Press Start first/.test(r.text), JSON.stringify(r));
		await untilTs(f, ['waiting']);
		await cont(f);
		r = await refusal(f);
		await t.check('Continue while the steps wait is refused: Wait for the steps to finish.', r.shown && /Wait for the steps to finish/.test(r.text), JSON.stringify(r));
		await press(f, 'Sign in to Tailscale');
		await untilTs(f, ['running']);
		r = await refusal(f);
		await t.check('at the next answer "Wait for the steps to finish." is gone', !r.shown && !/Wait for the steps/.test(r.text), JSON.stringify(r));
		await untilTs(f, ['done']);
		r = await refusal(f);
		const body = await main(f);
		await t.check('and it stays gone under the finished Signed in', !r.shown && /Signed in/.test(body), JSON.stringify(r));
		await closeAll(f);
		await setUp(f, 'remote-link'); await cont(f);
		await cont(f);
		r = await refusal(f);
		await t.check('Continue before the link is made is refused: Create the link first.', r.shown && /Create the link first/.test(r.text), JSON.stringify(r));
		await press(f, 'Create link');
		await f.waitForFunction((W) => /https:\/\//.test((document.querySelector(`${W} .o55g-layer:not(.o55g-out) .o55g-main`) || {}).innerText || ''), WIN, { timeout: 5000 }).catch(() => {});
		r = await refusal(f);
		const link = await main(f);
		await t.check('once the link is issued, "Create the link first." is gone', /https:\/\//.test(link) && !r.shown && !/Create the link first/.test(r.text), JSON.stringify(r));
	},
	async '1.06: a refused or expired sign-in goes back to a fresh sign-in; an approval failure asks again'(t) {
		const f = await openAway(t);
		for (const [hint, words] of [['Tailscale says no', /didn.t allow it/], ['Sign-in runs out', /ran out before it finished/]]) {
			await setUp(f, 'tailscale'); await cont(f);
			await press(f, 'Start'); await untilTs(f, ['waiting']);
			await press(f, hint);
			await press(f, 'Sign in to Tailscale');
			const s = await untilTs(f, ['failed']);
			const body = await main(f), ph = await phases(f);
			await t.check(`${hint}: the step fails with its own words`, s === 'failed' && words.test(body) && /Didn.t work/.test(ph[2].s), JSON.stringify({ s, ph, body: body.slice(0, 300) }));
			await press(f, 'Try again');
			const s2 = await untilTs(f, ['waiting']), ph2 = await phases(f);
			await t.check(`${hint}: Try again goes back to a fresh sign-in`, s2 === 'waiting' && ph2[0].done && !ph2[1].done && /Waiting for you/.test(ph2[1].s), JSON.stringify({ s2, ph2 }));
			await closeAll(f);
		}
		await setUp(f, 'tailscale'); await cont(f);
		await press(f, 'Start'); await untilTs(f, ['waiting']);
		await press(f, 'Needs an admin’s approval');
		await press(f, 'Sign in to Tailscale');
		let s = await untilTs(f, ['failed']);
		let ph = await phases(f), body = await main(f);
		await t.check('approval: fails at device approval, with what to do', s === 'failed' && ph[1].done && ph[2].done && /Didn.t work/.test(ph[3].s) && /administrator to approve/.test(body), JSON.stringify({ s, ph }));
		await press(f, 'Try again');
		s = await untilTs(f, ['done']); ph = await phases(f);
		await t.check('approval: Try again asks that step again, the sign-in kept, and it finishes', s === 'done' && ph.every((p) => p.done), JSON.stringify({ s, ph }));
	},
	async '1.06: Headscale with an administrator waits for It’s approved'(t) {
		const f = await openAway(t);
		await setUp(f, 'tailscale');
		await f.locator(`${WIN} [data-action="pm51-servers-w-flavor"]`, { hasText: 'My own Headscale server' }).first().click(); await sleep(f, 600);
		await f.locator(`${WIN} .o55-aw-hs`).fill('https://headscale.example.net');
		await f.evaluate((W) => { const el = document.querySelector(`${W} select.o55-aw-hsreg`); el.value = 'Ask administrator'; el.dispatchEvent(new Event('change', { bubbles: true })); }, WIN);
		await cont(f);
		const ph = await phases(f);
		await t.check('Headscale steps: start, ask the Headscale server, the administrator, address, test', ph.length === 5 && /Asking your Headscale server/.test(ph[1].t) && /Headscale administrator/.test(ph[2].t), JSON.stringify(ph.map((p) => p.t)));
		await press(f, 'Start');
		const s = await untilTs(f, ['waiting']);
		await t.check('it waits for the administrator', s === 'waiting' && /Waiting for you/.test((await phases(f))[2].s), s);
		await press(f, 'It’s approved');
		await t.check('then finishes', (await untilTs(f, ['done'])) === 'done', '');
	},
	async '1.07-1.09: a web address: Puppet Master makes the file or checks yours; no Caddy run for you, no certificate promise'(t) {
		const f = await openAway(t);
		await setUp(f, 'domain');
		const opts = await f.evaluate((W) => ({ host: [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) select.o55-aw-host option`)].map((o) => o.textContent.trim()), proxy: [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) select.o55-aw-proxy option`)].map((o) => o.textContent.trim()) }), WIN);
		let body = await main(f);
		await t.check('Who runs it: Make the settings file, or I have one already', JSON.stringify(opts.host) === JSON.stringify(['Make the settings file', 'I have one already']), JSON.stringify(opts.host));
		await t.check('the file is for Caddy, NGINX or Traefik, Caddy first; no Nginx Proxy Manager file', JSON.stringify(opts.proxy) === JSON.stringify(['Caddy', 'NGINX', 'Traefik']), JSON.stringify(opts.proxy));
		await t.check('no promise that Puppet Master runs Caddy or gets a certificate', !/Puppet Master sets it up|free certificate|gets a free certificate by itself/i.test(body), body.slice(0, 400));
		await t.check('certificates stay on your side', /Certificates stay on your side/.test(body) && /Nginx Proxy Manager\? Choose I have one already/.test(body), body.slice(0, 500));
		await f.locator(`${WIN} .o55-aw-dom`).fill('pm.example.com');
		await f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="forwarded"]`).first().click();
		await cont(f);
		body = await main(f);
		await t.check('Connect: the settings file for Caddy, to add yourself', /The settings file for Caddy/.test(body) && /reverse_proxy/.test(body) && !/Puppet Master sets up Caddy|runs next to Puppet Master/.test(body), body.slice(0, 500));
		await cont(f);
		const err = await f.evaluate((W) => (document.querySelector(`${W} .o55g-error`) || {}).textContent || '', WIN);
		await t.check('it waits until you say you added it', /Add the settings file to Caddy first/.test(err), err);
		await f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="added"]`).first().click();
		await cont(f);
		await t.check('then Check', /Does it work from here/.test(await title(f)), await title(f));
		await closeAll(f);
		await setUp(f, 'domain');
		await f.evaluate((W) => { const el = document.querySelector(`${W} select.o55-aw-host`); el.value = 'existing'; el.dispatchEvent(new Event('change', { bubbles: true })); }, WIN);
		await sleep(f, 600);
		const own = await f.evaluate((W) => ({ proxy: !!document.querySelector(`${W} .o55g-layer:not(.o55g-out) select.o55-aw-proxy`), text: (document.querySelector(`${W} .o55g-layer:not(.o55g-out) .o55g-main`) || {}).innerText || '' }), WIN);
		await t.check('I have one already: no proxy kind to pick, nothing made for it', !own.proxy && /Nothing is made for your proxy/.test(own.text), JSON.stringify({ proxy: own.proxy, text: own.text.slice(0, 300) }));
		await f.locator(`${WIN} .o55-aw-dom`).fill('pm.example.com');
		await f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="forwarded"]`).first().click();
		await cont(f);
		const conn = await main(f);
		await t.check('its Connect step makes no file and promises no certificate', /Your proxy/.test(conn) && !/reverse_proxy|server_name|certificate/i.test(conn), conn.slice(0, 300));
	},
	async 'FO-180: the Custom domain sheet’s summary follows who runs the proxy'(t) {
		/* the sheet the route row opens after the guide saves, not the guide window itself: its summary is the
		   panel's .pm51-hero-summary; a proxy of the person's own must not be promised a settings file */
		const OWN_SUMMARY = 'Your own address through a reverse proxy you already run. Nothing is made for it; your proxy sends it here. It is a public address, so sign-in is still required.';
		const FILE_SUMMARY = 'Your own address through your own reverse proxy. Puppet Master makes its settings file; your proxy runs it. It is a public address, so sign-in is still required.';
		const sheetSummary = (f) => f.evaluate(() => { const w = [...document.querySelectorAll('.drawer-wrap:not([data-closing="1"])')].find((x) => { const ti = x.querySelector('.pm51-panel-title'); return ti && ti.textContent.trim() === 'Custom domain'; }); const s = w && w.querySelector('.pm51-hero-summary'); return s ? s.textContent.trim() : ''; });
		const openSheet = async (f) => {
			await f.locator(`${BLOCK} .pm51-servers-route[data-route="domain"] .pm51-item-title`).first().click();
			await f.waitForFunction(() => { const w = [...document.querySelectorAll('.drawer-wrap:not([data-closing="1"])')].find((x) => { const ti = x.querySelector('.pm51-panel-title'); return ti && ti.textContent.trim() === 'Custom domain'; }); return !!(w && w.querySelector('.pm51-hero-summary')); }, null, { timeout: 6000 });
			await sleep(f, 400);
		};
		/* Check step: run the check, then Continue to the Recap and Save; the guide closes itself */
		const saveWizard = async (f) => {
			await f.locator(`${WIN} [data-action="pm51-servers-key-check"]`).first().click(); await sleep(f, 700);
			await cont(f); await cont(f);
			await f.waitForFunction((W) => !document.querySelector(W), WIN, { timeout: 6000 });
			await sleep(f, 600);
		};
		const f = await openAway(t);
		/* a proxy the person already runs: the guide's I have one already path, by real clicks */
		await setUp(f, 'domain');
		await f.locator(`${WIN} select.o55-aw-host`).selectOption('existing'); await sleep(f, 600);
		await f.locator(`${WIN} .o55-aw-dom`).fill('pm.example.com');
		await f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="forwarded"]`).first().click();
		await cont(f); /* Connect: nothing is made for a proxy of your own */
		await cont(f); /* Check */
		await saveWizard(f);
		await openSheet(f);
		let sum = await sheetSummary(f);
		await t.check('own proxy: the summary says nothing is made for it and the proxy sends it here', sum === OWN_SUMMARY, sum);
		await t.check('own proxy: the summary does not say Puppet Master makes its settings file', !/makes its settings file/.test(sum), sum);
		await t.shot('fo180-domain-own-summary', 'Custom domain sheet with a proxy of your own: the summary says nothing is made for it');
		/* Caddy: Puppet Master makes the settings file; the summary keeps the original text */
		await f.locator('.drawer-wrap:not([data-closing="1"]) [data-action="pm51-servers-route-redo"]').first().click();
		await f.waitForSelector(WIN, { timeout: 6000 }); await sleep(f, 700);
		await f.locator(`${WIN} select.o55-aw-host`).selectOption('file'); await sleep(f, 600);
		await f.locator(`${WIN} select.o55-aw-proxy`).selectOption('Caddy'); await sleep(f, 300);
		await f.locator(`${WIN} .o55-aw-dom`).fill('pm.example.com');
		const fwd = f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="forwarded"]`).first();
		if ((await fwd.getAttribute('aria-checked')) !== 'true') { await fwd.click(); await sleep(f, 300); }
		await cont(f); /* Connect: the Caddy settings file */
		await f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="added"]`).first().click();
		await cont(f); /* Check */
		await saveWizard(f);
		await openSheet(f);
		sum = await sheetSummary(f);
		await t.check('Caddy: the summary keeps the original text, Puppet Master makes its settings file', sum === FILE_SUMMARY, sum);
	},
	async '1.10: the check lists every owner check before a way in is called ready'(t) {
		const f = await openAway(t);
		await setUp(f, 'vpn');
		await f.locator(`${WIN} .o55-aw-vpnaddr`).fill('10.8.0.2');
		await cont(f);
		await f.locator(`${WIN} [data-action="pm51-servers-w-aflag"][data-key="vpnOn"]`).first().click();
		await cont(f);
		await f.locator(`${WIN} [data-action="pm51-servers-key-check"]`).first().click(); await sleep(f, 700);
		const rows = await f.evaluate((W) => [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out) .o55g-main .pm51-step-title`)].map((e) => e.textContent.trim()), WIN);
		t.log(JSON.stringify(rows));
		const need = [/reachable/i, /understand each other/i, /your server/i, /Sign-in and pairing/i, /Live updates/i, /stream/i, /upload and download/i, /Links open/i, /Sign-in pages return/i];
		await t.check('reachability, protocol, identity, sign-in and pairing, live updates, streams, transfers, links, callbacks', need.every((re) => rows.some((r) => re.test(r))), JSON.stringify(rows));
		await t.check('no certificate is called valid', !rows.some((r) => /certificate/i.test(r)), JSON.stringify(rows));
		await closeAll(f);
		/* the row's own Check route reports the same checks */
		await f.evaluate(() => { const r = PM51.s().serverProject.remoteAccess.routes.find((x) => x.id === 'vpn'); r.status = 'ready'; r.enabled = true; PM51.s().serverProject.remoteAccess.vpn = { kind: 'WireGuard', address: '10.8.0.2' }; PM51.refresh('servers', { swap: false }); });
		await sleep(f, 400);
		await f.locator(`${BLOCK} .pm51-servers-route[data-route="vpn"] [data-action="pm51-servers-route-check"]`).first().click();
		await f.waitForFunction(() => [...document.querySelectorAll('.drawer-wrap')].some((e) => /Check route/.test(e.innerText)), null, { timeout: 5000 }).catch(() => {});
		const rows2 = await f.evaluate(() => { const w = [...document.querySelectorAll('.drawer-wrap')].find((e) => /Check route/.test(e.innerText)); return w ? [...w.querySelectorAll('.pm51-step-title')].map((e) => e.textContent.trim()) : []; });
		await t.check('Check route on the row reports the same checks', need.every((re) => rows2.some((r) => re.test(r))), JSON.stringify(rows2));
	},
	async '1.11: Remote Link shows the service’s https link and short code, nothing made from the server'(t) {
		const f = await openAway(t);
		await setUp(f, 'remote-link');
		await cont(f);
		await press(f, 'Create link');
		await f.waitForFunction((W) => /https:\/\//.test((document.querySelector(`${W} .o55g-layer:not(.o55g-out) .o55g-main`) || {}).innerText || ''), WIN, { timeout: 5000 }).catch(() => {});
		const body = await main(f);
		const link = (body.match(/https:\/\/\S+/) || [''])[0], code = (body.match(/\b[A-Z0-9]{4}-[A-Z0-9]{4}\b/) || [''])[0];
		const S = await f.evaluate(() => { const s = PM51.s().serverProject, h = s.servers.find((x) => x.id === s.homeServer); return { id: h.id, slug: h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }; });
		t.log(JSON.stringify({ link, code }));
		await t.check('an https link from the Remote Link service', /^https:\/\//.test(link) && /Remote Link service/.test(body), body.slice(0, 300));
		await t.check('and a short code', !!code, body.slice(0, 300));
		await t.check('nothing in them comes from the server’s id or name', !link.toLowerCase().includes(S.id) && !link.toLowerCase().includes(S.slug) && !/pm-link:/.test(body), JSON.stringify({ link, S }));
		await t.check('pairing stays its own step', /still asks you to approve it/.test(body), body.slice(0, 400));
	},
	async 'the built page: none of the retired promises remain in the Server manager'(t) {
		const html = fs.readFileSync(pagePath(t), 'utf8');
		const PATS = { 'pm-link://': /pm-link:\/\//, 'Puppet Master sets it up (Caddy)': /Puppet Master sets it up \(Caddy\)/, 'gets a free certificate by itself': /gets a free certificate by itself/, 'Caddy (free certificate, simplest)': /Caddy \(free certificate, simplest\)/, 'Nginx Proxy Manager file (SSL: Request a new certificate)': /SSL: Request a new certificate/ };
		const found = Object.entries(PATS).filter(([, rx]) => rx.test(html)).map(([k]) => k);
		await t.check('the built page carries none of them', !found.length, found.join(', '));
	},
	async 'every look: the staged steps, their states and the demo answers paint inside the window'(t) {
		const f = await openAway(t);
		await setUp(f, 'tailscale'); await cont(f);
		await press(f, 'Start'); await untilTs(f, ['waiting']);
		for (const look of LOOKS) {
			await t.app.look(look); await sleep(f, 300);
			const live = f.locator(`${WIN} .o55g-layer:not(.o55g-out)`).last();
			const chip = live.locator('.pm51-servers-demo-c').first(), step = live.locator('[data-ts-state] .pm51-step-title').nth(1), state = live.locator('[data-ts-state] .pm51-step-end').nth(1);
			const box = await f.evaluate((W) => { const w = document.querySelector(`${W}`).getBoundingClientRect(), live = [...document.querySelectorAll(`${W} .o55g-layer:not(.o55g-out)`)].pop(); const cs = [...live.querySelectorAll('.pm51-servers-demo-c')]; return { n: cs.length, inside: cs.every((c) => { const r = c.getBoundingClientRect(); return r.left >= w.left - 1 && r.right <= w.right + 1 && c.scrollWidth <= c.clientWidth + 1; }) }; }, WIN);
			const [pc, ps, pst] = [await ink(chip), await ink(step), await ink(state)];
			await t.check(`${look}: the demo answers sit whole inside the window`, box.n >= 2 && box.inside, JSON.stringify(box));
			await t.check(`${look}: a demo answer, a step and its Waiting for you state paint readable ink (contrast >= 3)`, [pc, ps, pst].every((x) => x.n >= 30 && x.contrast >= 3), JSON.stringify({ chip: pc, step: ps, state: pst }));
		}
	}
};
