// FO-128 (Jared, 2026-11-09, item 9: "it asks to approve a process above the composer. It should have the approval
// buttons right there in the bar to choose from"; his pick, 2026-11-10: "A and short words. Yes but in the more compact
// format."). The chat's composer dock answers what it asks, in the line, and every permission ask offers the same compact
// ladder (Permissions_System 6.1: Deny, then Allow [Once | For session | Always…]).
//   process   Query performance's Migration dry run asks "Apply 0007_normalize_units to staging? [y/N]": its line shows the
//             question whole and Activity Detail's own answers (DL-252 / D13: No, Yes, then Answer in Terminal); a real
//             press on Yes reaches PM_WORK (the process takes "> Yes" and leaves Needs input), the line goes, and the
//             keyboard lands on the next asking line or the composer, never on the page.
//   studio    the Studio's Ask permission (demo-trigger "Permission request") asks in the bar, not in the Ask Card: the
//             decision host stays empty; the ladder is in canon's order with the short words; Once goes through the app's
//             approve-permission (the decision closes) and writes "Allowed once"; Deny closes the decision and writes one
//             one-line "Denied" receipt (not the app's large card); Always opens the chooser with the suggested pattern editable
//             and no place chosen, a real press on Save is refused until a place is chosen, Escape leaves the chooser,
//             and Save writes "Always allowed" with its place.
//   places    a path ask never offers Everywhere and suggests its folder "/**"; a chat with no project hides This project.
//   grants    For session is remembered (Permissions_System 6.1, FinalGUISpec 15.7): after For session on the Studio's ask,
//             the next one never asks (the decision closes on its own, one "Allowed by this session's grant" receipt);
//             an ask its pattern doesn't match still asks; a bash grant "psql *" covers a later psql call and a pending one,
//             not pg_dump; a grant in one run never covers another run's ask in the same thread (canon's approval scope
//             with run and lane); a Deny also refuses the other pending asks that share its approval ask (and no other
//             run's), one receipt each. Each step starts from an empty bar and fails rather than throws, so every
//             assertion is reached on any build.
//   capture   browser capture's held action (Jared, 2026-11-11: "I agree"; on the 5.6 Pro chat's own page, where the hold
//             lives: --set chatPage=<build>, else built into the run folder) offers the same compact ladder on its banner,
//             in canon's order and on one row; For session lets the action run again and a later hold it covers runs at
//             once with one "Allowed by this session's grant" line and no banner; Deny clears the hold with one "Denied"
//             line and captures nothing; Always opens the chooser in the banner and Escape leaves it.
//   compose   browser capture's grants compose (sol-review-l1c C1): Screenshots and DOM granted one at a time, For session
//             or Always, in either order, let Send Now (which needs both) run with no new hold; Screenshots For session
//             with DOM Once holds DOM alone, and one more Once lets Send Now run.
//   rules     an Always rule covers by its place: This project only that project's chats (never a chat with no project
//             or another project), This computer any ask on this computer, Everywhere any computer; and on the real path
//             (no project passed: the asking chat's is read), a Studio rule saved in Query performance does not reach a
//             Batch 19 demo chat, which is its own project. Capture: the chat page's projectless thread is not offered
//             This project; a rule saved in one Batch 19 chat does not cover another's hold; an expired hold grants
//             nothing; after a banner answer the keyboard is on the capture toolbar.
//   helper    the Crew helper that waits for your OK (Rollback Auditor, recovery-collaboration) has the same ladder in its
//             card's decision row, under the command it would run shown whole, and in its dock line once the card is out of view;
//             Once from the line lets it go on and the run says so; Always from the card opens the chooser in the card.
//   looks     in all ten looks, at a 600 and a 400 px docked chat: every answer of every asking line (rest, and with the
//             Always chooser open) and of the helper card's ladder is on top at its centre (native hit test), inside its
//             line or card, at least 24 px tall, its words not clipped, the ladder one row (Deny beside the segmented
//             control), and no asking line scrolls sideways; at 400 px also with the dock scrolling (a third asking line,
//             its scrollbar showing) through a 1920x1080 -> 1390x900 -> back resize, the chat measured at 400 (C2). Each answer is
//             first scrolled into the dock's view: past its height budget the dock scrolls in place (pmx-system.css).
//             Reduced Motion alternates between reduce and no-preference by look.
//   late      a dock provider registered after the chat's first render still shows: with every DOMContentLoaded dock
//             registration held 2.5 s (a slow load's order) the Migration dry run line is in the dock, and a probe
//             provider registered with no render shows within a second (sol-recheck-b10l, loaded Nas1).
// Both surfaces (--set sandbox=0|1 picks one). On the page before FO-128 the process line has only Review: the process
// test fails at "offers No and Yes", and the others at the missing PM56_ASKS.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { LOOKS } from '../browser-check.config.mjs';

const CHAT_W = [600, 400];
const DOCK = '#pmRoot .composer > .pmx-dock';
const line = (f, key) => f.locator(`${DOCK} [data-k="${key}"]`);
const STUDIO = 'pmx-dock:perm-studio-host';

async function ready(t, surface, thread = 'query') {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return null; }
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.__PM56_BOOT_OK && window.PM56_PORT && window.PM56_PORT.ready && window.PMW && PMW.chatCol, null, { timeout: 30000 });
	await t.check(`${surface}: the dock's ask owner is loaded`, await f.evaluate(() => !!window.PM56_ASKS));
	await thread_(t, f, thread);
	return f;
}
async function thread_(t, f, id) {
	await f.evaluate((i) => { if (PM56_APP.ctx().state.selectedThread !== i) PM56_APP.switchThread(i); }, id);
	await t.until(`the ${id} thread`, (i) => PM56_APP.ctx().state.selectedThread === i, id);
	await t.page.waitForTimeout(300);
}
// The transcript keeps its own scroll custody and follows the bottom while a turn runs, so a script's scrollTop does not
// hold: a real wheel over the messages moves it, as a person scrolling would, until done() says so.
async function wheelMessages(t, f, dy, done, name) {
	const box = await f.locator('#pmRoot .transcript').boundingBox();
	const off = t.sandboxed ? await (await f.frameElement()).boundingBox() : { x: 0, y: 0 };
	await t.page.mouse.move(off.x + box.x + box.width / 2, off.y + box.y + box.height / 2);
	for (let i = 0; i < 12 && !(await f.evaluate(done)); i++) { await t.page.mouse.wheel(0, dy); await t.page.waitForTimeout(350); }
	await t.until(name, done);
}
const cardInView = () => { const d = document.querySelector('#pmRoot article[data-run-id="crew-query-perf"] .pmx-decision-acts'), tr = document.querySelector('#pmRoot .transcript'); if (!d || !tr) return false; const a = d.getBoundingClientRect(), b = tr.getBoundingClientRect(); return a.top >= b.top && a.bottom <= b.bottom; };
const openStudio = (f) => f.evaluate(() => PM56_APP.demoAction('demo-trigger', { trigger: 'Permission request' }));
const lastMsg = (f) => f.evaluate(() => { const m = PM56_APP.activeThread().messages.slice(-1)[0]; return m ? m.type + '|' + m.title + '|' + (m.detail || '') : ''; });
const focusInfo = (f) => f.evaluate(() => { const a = document.activeElement; return a ? { cls: String(a.className || ''), text: (a.textContent || '').trim().slice(0, 40), body: a === document.body } : null; });

async function processCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	await t.emulate({ reducedMotion: 'reduce' });
	await f.evaluate(() => PMW.chatCol.setWidth(400));
	const ln = line(f, 'pmx-dock:work:p-migrate');
	await t.until('the Migration dry run line is in the dock', () => !!document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:work:p-migrate"]'));
	const ans = await ln.locator('[data-work-act="answer"]').evaluateAll((bs) => bs.map((b) => b.textContent.trim()));
	await t.check(`${surface}: the line offers No and Yes, safe answer first`, JSON.stringify(ans) === '["No","Yes"]', JSON.stringify(ans));
	await t.check(`${surface}: and Answer in Terminal`, await ln.locator('[data-work-act="terminal"]').count() === 1);
	const q = await ln.evaluate((el) => { const p = el.querySelector('.pmx-dock-q'); return p ? { text: p.textContent, clipped: p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1 } : null; });
	await t.check(`${surface}: the question shows whole`, !!q && q.text.includes('Apply 0007_normalize_units to staging? [y/N]') && !q.clipped, JSON.stringify(q));
	for (const label of ['No', 'Yes']) await t.visible(ln.locator(`[data-work-act="answer"][data-value="${label}"]`), `${surface}: ${label} on top`);
	await ln.locator('[data-work-act="answer"][data-value="Yes"]').click();
	await t.until(`${surface}: PM_WORK took Yes`, () => { const it = PM_WORK.item('p-migrate'); return it && it.state !== 'waiting' && (it.tail || []).includes('> Yes'); });
	await t.until(`${surface}: the line left the dock`, () => !document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:work:p-migrate"]'));
	await t.page.waitForTimeout(450);
	const fo = await focusInfo(f);
	await t.check(`${surface}: the keyboard went to the next asking line or the composer`, !!fo && !fo.body && /pmx-dock-ans|composer-input/.test(fo.cls), JSON.stringify(fo));
}

async function studioCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	await t.emulate({ reducedMotion: 'no-preference' });
	await f.evaluate(() => PMW.chatCol.setWidth(600));
	// Once
	await openStudio(f);
	await t.until(`${surface}: the Studio's Ask permission asks in the bar`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	await t.check(`${surface}: and not in the Ask Card`, await f.evaluate(() => { const h = document.querySelector('#pmRoot .decision-host'); return !!h && h.classList.contains('empty') && !h.querySelector('button'); }));
	let ln = line(f, STUDIO);
	const ladder = await ln.locator('[data-action="perm-answer"]').evaluateAll((bs) => bs.map((b) => b.dataset.value + '=' + b.textContent.trim() + '/' + b.getAttribute('aria-label')));
	await t.check(`${surface}: canon's ladder, short words, in its order`, JSON.stringify(ladder) === JSON.stringify(['deny=Deny/Deny', 'once=Once/Allow once', 'session=For session/Allow for this session', 'always=Always…/Always allow…']), JSON.stringify(ladder));
	await t.check(`${surface}: Once, For session and Always are one segmented control after "Allow"`, await ln.locator('.pmx-ask-seg .pmx-ask-lead').innerText() === 'Allow' && await ln.locator('.pmx-ask-seg-in [data-action="perm-answer"]').count() === 3);
	await ln.locator('[data-value="once"]').click();
	await t.until(`${surface}: Once closes the decision`, () => !PM56_APP.ctx().state.decision && !PM56_ASKS.list().some((a) => a.id === 'perm-studio-host'));
	let rec = await lastMsg(f);
	await t.check(`${surface}: Once writes its receipt`, /^permission-answer\|Allowed once: reconnect the Windows execution host/.test(rec), rec);
	// Deny: one line, like the other answers
	await openStudio(f);
	await t.until(`${surface}: asked again`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	const before = await f.evaluate(() => PM56_APP.activeThread().messages.length);
	await line(f, STUDIO).locator('[data-value="deny"]').click();
	await t.until(`${surface}: Deny closes the decision`, () => !PM56_APP.ctx().state.decision);
	const added = await f.evaluate((n) => PM56_APP.activeThread().messages.slice(n).map((m) => m.type + '|' + m.title), before);
	await t.check(`${surface}: Deny writes one one-line receipt`, JSON.stringify(added) === '["permission-answer|Denied: reconnect the Windows execution host"]', JSON.stringify(added));
	// Always
	await openStudio(f);
	await t.until(`${surface}: asked a third time`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	ln = line(f, STUDIO);
	await ln.locator('[data-value="always"]').click();
	await t.until(`${surface}: the pattern field takes the keyboard`, () => document.activeElement && document.activeElement.matches('[data-perm-pattern]'));
	const ch = await ln.evaluate((el) => ({ pattern: el.querySelector('[data-perm-pattern]').value, places: [...el.querySelectorAll('[data-action="perm-place"]')].map((b) => b.dataset.value + ':' + b.getAttribute('aria-pressed')) }));
	await t.check(`${surface}: the suggested pattern is editable`, ch.pattern === 'Windows execution host', ch.pattern);
	await t.check(`${surface}: three places, none chosen`, JSON.stringify(ch.places) === '["project:false","computer:false","everywhere:false"]', JSON.stringify(ch.places));
	await t.page.keyboard.press('Escape');
	await t.until(`${surface}: Escape leaves the chooser`, () => !document.querySelector('#pmRoot .composer > .pmx-dock .pmx-ask-always'));
	await ln.locator('[data-value="always"]').click();
	await t.until(`${surface}: the chooser is back`, () => !!document.querySelector('#pmRoot .composer > .pmx-dock .pmx-ask-always'));
	await t.quickClick(ln.locator('[data-action="perm-save"]'));
	await t.page.waitForTimeout(200);
	await t.check(`${surface}: Save is refused until a place is chosen`, await f.evaluate(() => PM56_ASKS.list().some((a) => a.id === 'perm-studio-host')));
	await ln.locator('[data-action="perm-place"][data-value="computer"]').click();
	await t.check(`${surface}: This computer is chosen`, await ln.locator('[data-value="computer"][aria-pressed="true"]').count() === 1);
	await ln.locator('[data-action="perm-save"]').click();
	await t.until(`${surface}: Save answers it`, () => !PM56_APP.ctx().state.decision && !PM56_ASKS.list().some((a) => a.id === 'perm-studio-host'));
	rec = await lastMsg(f);
	await t.check(`${surface}: the receipt says what was allowed and where`, /^permission-answer\|Always allowed: Windows execution host\|A rule for this computer/.test(rec), rec);
}

async function placesCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	const r = await f.evaluate(() => {
		const out = {};
		const show = (spec) => { const i = PM56_ASKS.ask(spec, true); const a = PM56_ASKS.list().find((x) => x.id === i); a.ui.always = true; PM56_APP.render(); const p = [...document.querySelectorAll(`#pmRoot [data-k="pmx-dock:${i}"] [data-action="perm-place"]`)].map((b) => b.dataset.value); PM56_ASKS.drop(i); return { s: a.suggested, p }; };
		out.path = show({ tool: 'edit', target: 'web/src/routes/recipes.ts', who: 'Schema Reviewer' });
		out.noProject = show({ tool: 'bash', target: 'ls -la', who: 'The agent', project: false });
		out.web = show({ tool: 'webfetch', target: 'https://docs.example.com/guide/x', who: 'The agent' });
		PM56_APP.render();
		return out;
	});
	await t.check(`${surface}: a path suggests its folder and never offers Everywhere`, r.path.s === 'web/src/routes/**' && JSON.stringify(r.path.p) === '["project","computer"]', JSON.stringify(r.path));
	await t.check(`${surface}: a chat with no project hides This project`, r.noProject.s === 'ls *' && JSON.stringify(r.noProject.p) === '["computer","everywhere"]', JSON.stringify(r.noProject));
	await t.check(`${surface}: a page suggests its origin`, r.web.s === 'https://docs.example.com/*', JSON.stringify(r.web));
}

// Press an answer in an ask's dock line, or fail (not throw) when the line is not there, so every later step still runs
async function press(t, f, key, value, name) {
	const loc = line(f, key).locator(`[data-value="${value}"]`);
	const n = await loc.count();
	await t.check(`${name}: its line is in the dock`, n === 1, key);
	if (n === 1) await loc.click();
	return n === 1;
}
// Clear every pending ask of dock-asks' own (not a helper's) and render, so a step starts from an empty bar
const clearAsks = (f) => f.evaluate(() => { PM56_ASKS.list().forEach((a) => { if (!a.external) PM56_ASKS.drop(a.id); }); PM56_APP.render(); });

async function grantsCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	await t.emulate({ reducedMotion: 'reduce' });
	await f.evaluate(() => PMW.chatCol.setWidth(600));
	const titlesAfter = (n) => f.evaluate((n) => PM56_APP.activeThread().messages.slice(n).map((m) => m.type + '|' + m.title), n);
	const count = () => f.evaluate(() => PM56_APP.activeThread().messages.length);
	const pendingIds = () => f.evaluate(() => PM56_ASKS.list().map((a) => a.id));
	// the Studio's ask: For session, then asked again
	await openStudio(f);
	await t.until(`${surface}: the Studio asks`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	await press(t, f, STUDIO, 'session', `${surface}: the Studio's For session`);
	await t.until(`${surface}: For session closes the decision`, () => !PM56_APP.ctx().state.decision && !PM56_ASKS.list().some((a) => a.id === 'perm-studio-host'));
	let n = await count();
	await f.evaluate(() => { window.__fo128Seen = 0; window.__fo128Watch = setInterval(() => { if (document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:perm-studio-host"]')) window.__fo128Seen++; }, 16); });
	await openStudio(f);
	await t.until(`${surface}: the second Studio ask closes on its own`, () => !PM56_APP.ctx().state.decision);
	await t.page.waitForTimeout(400);
	const seen = await f.evaluate(() => { clearInterval(window.__fo128Watch); return window.__fo128Seen; });
	await t.check(`${surface}: the second matching ask never asked in the bar`, seen === 0, `seen ${seen} times`);
	let added = await titlesAfter(n);
	await t.check(`${surface}: and wrote one line saying the session's grant allowed it`, JSON.stringify(added) === '["permission-answer|Allowed by this session’s grant: reconnect the Windows execution host"]', JSON.stringify(added));
	await f.evaluate(() => { const c = PM56_APP.ctx(); if (c.state.decision) { c.state.decision = null; PM56_APP.render(); } });
	// an ask the grant does not match still asks
	await clearAsks(f);
	const other = await f.evaluate(() => PM56_ASKS.ask({ tool: 'host', target: 'Reconnect to Linux container and resume the rehearsal', pattern: 'Linux container', who: 'The agent', verb: 'reconnect the Linux container' }));
	await t.check(`${surface}: a non-matching ask asks`, !!other && await line(f, `pmx-dock:${other}`).count() === 1, String(other));
	// bash: a psql grant covers a pending and a later psql call, not pg_dump
	await clearAsks(f);
	const ids = await f.evaluate(() => [
		PM56_ASKS.ask({ tool: 'bash', target: 'psql "$STAGING_DATABASE_URL" -c "EXPLAIN ANALYZE SELECT 1"', who: 'Query Analyzer' }, true),
		PM56_ASKS.ask({ tool: 'bash', target: 'psql "$STAGING_DATABASE_URL" -c "SELECT count(*) FROM recipes"', who: 'Query Analyzer' }, true),
		PM56_ASKS.ask({ tool: 'bash', target: 'pg_dump --schema-only tastebook', who: 'Schema Reviewer' }, true)]);
	await f.evaluate(() => PM56_APP.render());
	await press(t, f, `pmx-dock:${ids[0]}`, 'session', `${surface}: psql For session`);
	await t.page.waitForTimeout(300);
	let pend = await pendingIds();
	await t.check(`${surface}: the pending psql ask is allowed with it, pg_dump still asks`, !pend.includes(ids[1]) && pend.includes(ids[2]), JSON.stringify(pend));
	n = await count();
	const later = await f.evaluate(() => PM56_ASKS.ask({ tool: 'bash', target: 'psql -c "SELECT 2"', who: 'Query Analyzer' }));
	await t.page.waitForTimeout(300);
	added = await titlesAfter(n);
	await t.check(`${surface}: a later psql call is allowed without asking`, later === null && JSON.stringify(added) === '["permission-answer|Allowed by this session’s grant: run a command"]', JSON.stringify({ later, added }));
	// parallel runs in one thread (canon: approval scope must not become same-session across lanes): a For session in one
	// run never covers another run's ask, pending or later
	await clearAsks(f);
	const runs = await f.evaluate(() => [
		PM56_ASKS.ask({ tool: 'bash', target: 'pg_restore -d rehearsal_a snapshots/0007_pre.dump', who: 'Rollback Auditor', runId: 'run-a', laneId: 'auditor' }, true),
		PM56_ASKS.ask({ tool: 'bash', target: 'pg_restore -d rehearsal_b snapshots/0007_pre.dump', who: 'Rollback Auditor', runId: 'run-b', laneId: 'auditor' }, true)]);
	await f.evaluate(() => PM56_APP.render());
	await press(t, f, `pmx-dock:${runs[0]}`, 'session', `${surface}: run A's For session`);
	await t.page.waitForTimeout(300);
	pend = await pendingIds();
	await t.check(`${surface}: run B's pending ask still asks`, pend.includes(runs[1]), JSON.stringify(pend));
	const laterA = await f.evaluate(() => PM56_ASKS.ask({ tool: 'bash', target: 'pg_restore -d rehearsal_a snapshots/0008_pre.dump', who: 'Rollback Auditor', runId: 'run-a', laneId: 'auditor' }));
	const laterB = await f.evaluate(() => PM56_ASKS.ask({ tool: 'bash', target: 'pg_restore -d rehearsal_b snapshots/0008_pre.dump', who: 'Rollback Auditor', runId: 'run-b', laneId: 'auditor' }));
	await t.check(`${surface}: a later ask in run A is covered, one in run B asks`, laterA === null && !!laterB, JSON.stringify({ laterA, laterB }));
	// Deny refuses the pending asks that share its approval ask, and no other run's; its own fresh asks, so it runs on any build
	await clearAsks(f);
	const deny = await f.evaluate(() => [
		PM56_ASKS.ask({ tool: 'bash', target: 'pg_dump --schema-only tastebook', who: 'Schema Reviewer' }, true),
		PM56_ASKS.ask({ tool: 'bash', target: 'pg_dump --data-only tastebook', who: 'Schema Reviewer' }, true),
		PM56_ASKS.ask({ tool: 'bash', target: 'pg_dump --data-only tastebook', who: 'Schema Reviewer', runId: 'run-c', laneId: 'reviewer' }, true)]);
	await f.evaluate(() => PM56_APP.render());
	n = await count();
	await press(t, f, `pmx-dock:${deny[0]}`, 'deny', `${surface}: pg_dump Deny`);
	await t.page.waitForTimeout(300);
	pend = await pendingIds();
	added = await titlesAfter(n);
	await t.check(`${surface}: Deny answers both pg_dump asks of its scope, not run C's`, !pend.includes(deny[0]) && !pend.includes(deny[1]) && pend.includes(deny[2]), JSON.stringify(pend));
	await t.check(`${surface}: one Denied line each`, JSON.stringify(added) === '["permission-answer|Denied: run a command","permission-answer|Denied: run a command"]', JSON.stringify(added));
	await clearAsks(f);
}

// An Always rule covers by its place (Permissions_System 6.1): This project only that project's chats, never a chat with
// no project; This computer every ask on this computer, project or not; Everywhere every ask
async function rulesCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	await t.emulate({ reducedMotion: 'reduce' });
	await f.evaluate(() => PMW.chatCol.setWidth(600));
	const always = async (spec, place, name) => {
		await clearAsks(f);
		const id = await f.evaluate((s) => PM56_ASKS.ask(s), spec);
		if (!(await press(t, f, `pmx-dock:${id}`, 'always', name))) return;
		const pl = line(f, `pmx-dock:${id}`).locator(`[data-action="perm-place"][data-value="${place}"]`);
		await t.check(`${name}: offers ${place}`, await pl.count() === 1);
		if (await pl.count() !== 1) return;
		await pl.click();
		await line(f, `pmx-dock:${id}`).locator('[data-action="perm-save"]').click();
		await t.until(`${name}: saved`, (i) => !PM56_ASKS.list().some((a) => a.id === i), id);
	};
	const asksAgain = (spec) => f.evaluate((s) => { const i = PM56_ASKS.ask(s, true); if (i) PM56_ASKS.drop(i); PM56_APP.render(); return i !== null; }, spec);
	await always({ tool: 'bash', target: 'ls -la web', who: 'The agent' }, 'project', `${surface}: an ls rule for This project`);
	await t.check(`${surface}: This project covers a later ask in the project`, !(await asksAgain({ tool: 'bash', target: 'ls -l api', who: 'The agent' })));
	await t.check(`${surface}: but never a chat with no project`, await asksAgain({ tool: 'bash', target: 'ls -l /tmp', who: 'The agent', project: false }));
	await t.check(`${surface}: nor another project`, await asksAgain({ tool: 'bash', target: 'ls -l', who: 'The agent', projectId: 'pantry' }));
	await always({ tool: 'bash', target: 'du -sh web', who: 'The agent' }, 'computer', `${surface}: a du rule for This computer`);
	await t.check(`${surface}: This computer covers a chat with no project on this computer`, !(await asksAgain({ tool: 'bash', target: 'du -sh /tmp', who: 'The agent', project: false })));
	await t.check(`${surface}: but not a call that runs on another computer`, await asksAgain({ tool: 'bash', target: 'du -sh /data', who: 'The agent', computer: 'gpu-box' }));
	// the real path: the Studio's ask names no project, so the asking chat's is used. A This project rule saved in Query
	// performance (bound to the host project) does not reach a Batch 19 demo chat, which is its own project
	await clearAsks(f);
	await openStudio(f);
	await t.until(`${surface}: the Studio asks in Query performance`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	const host = await f.evaluate(() => (PM56_ASKS.list().find((a) => a.id === 'perm-studio-host') || {}).projectId || '');
	if (await press(t, f, STUDIO, 'always', `${surface}: the Studio's Always`)) {
		await line(f, STUDIO).locator('[data-action="perm-place"][data-value="project"]').click();
		await line(f, STUDIO).locator('[data-action="perm-save"]').click();
	}
	await t.until(`${surface}: the This project rule is saved`, () => !PM56_APP.ctx().state.decision);
	await f.evaluate(() => PM56_APP.demoAction('b19-start', { flow: 'intake' }));
	await t.until(`${surface}: a Batch 19 chat is open`, () => /^batch19-/.test(PM56_APP.ctx().state.selectedThread));
	const b19 = await f.evaluate(() => PM56_APP.activeThread().projectId || '');
	await openStudio(f);
	await t.until(`${surface}: the Studio asks again in the Batch 19 chat (${b19}), not allowed by the rule from ${host}`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	await t.check(`${surface}: the two chats are different projects`, !!host && !!b19 && host !== b19, JSON.stringify({ host, b19 }));
	await f.evaluate(() => { const c = PM56_APP.ctx(); c.state.decision = null; PM56_APP.render(); PM56_APP.switchThread('query'); });
	await t.until(`${surface}: back in Query performance`, () => PM56_APP.ctx().state.selectedThread === 'query');
	await always({ tool: 'bash', target: 'df -h', who: 'The agent' }, 'everywhere', `${surface}: a df rule for Everywhere`);
	await t.check(`${surface}: Everywhere covers another computer with no project`, !(await asksAgain({ tool: 'bash', target: 'df -h /data', who: 'The agent', computer: 'gpu-box', project: false })));
	await clearAsks(f);
}

// Browser capture's hold lives in the 5.6 Pro chat's own page: in PMConcept7 its dialog becomes the Home Browser tab,
// which holds nothing (pm7-port/js/63-surfaces-browser.js). The page is --set chatPage=<build>, else built here from this
// checkout (5.6 Pro/build.py, under a second).
function chatPageUrl(t) {
	let p = t.args.chatPage;
	if (!p) {
		p = path.join(t.run.dir, 'chat56-fo128.html');
		if (!fs.existsSync(p)) execFileSync('python3', [fileURLToPath(new URL('../../../chat-assistant-concepts/5.6 Pro/build.py', import.meta.url)), '--out', p], { stdio: 'pipe' });
	}
	return pathToFileURL(path.resolve(p)).href + '?cb=' + Date.now();
}
async function captureCase(t, surface) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(1440, 900);
	await t.emulate({ reducedMotion: 'reduce' });
	const url = chatPageUrl(t);
	const f = surface === 'sandbox' ? await t.openInSandbox(url, { settleMs: 300 }) : (await t.page.goto(url), t.page);
	await f.waitForFunction(() => window.PM56_EXT && PM56_EXT.ctx && window.PM56_ASKS && window.PM56_BROWSER, null, { timeout: 30000 });
	const BANNER = '[data-k="bc-allow-banner"]';
	const act = (name) => f.evaluate((n) => { const b = document.createElement('button'); b.type = 'button'; b.hidden = true; if (n === 'b19-start-intake') { b.setAttribute('data-action', 'b19-start'); b.setAttribute('data-flow', 'intake'); } else b.setAttribute('data-action', n); document.body.appendChild(b); b.click(); b.remove(); }, name);
	const shoot = async () => { await f.locator('.bc-toolbar [data-action="bc-full-shot"]').first().click(); await t.page.waitForTimeout(400); };
	const titlesAfter = (n) => f.evaluate((n) => PM56_EXT.ctx().thread.messages.slice(n).map((m) => m.type + '|' + m.title), n);
	const count = () => f.evaluate(() => PM56_EXT.ctx().thread.messages.length);
	const render = () => f.evaluate(() => PM56_EXT.ctx().renderApp());
	await act('bc-open');
	await t.until(`${surface}: the internal browser is open`, () => !!document.querySelector('.bc-toolbar [data-action="bc-full-shot"]'));
	await f.evaluate(() => { const st = PM56_BROWSER.state(); st.policy = Object.assign({}, st.policy || {}, { screenshots: 'ask' }); });
	await render();
	// held: the ladder, in order, one row
	await shoot();
	await t.until(`${surface}: Full Screenshot is held`, (b) => !!document.querySelector(b), BANNER);
	const banner = f.locator(BANNER);
	const ladder = await banner.locator('[data-action="perm-answer"]').evaluateAll((bs) => bs.map((b) => b.dataset.value + '=' + b.textContent.trim() + '/' + b.getAttribute('aria-label')));
	await t.check(`${surface}: the hold offers canon's ladder, short words, in order`, JSON.stringify(ladder) === JSON.stringify(['deny=Deny/Deny', 'once=Once/Allow once', 'session=For session/Allow for this session', 'always=Always…/Always allow…']), JSON.stringify(ladder));
	const row = await banner.evaluate((b) => { const d = b.querySelector('[data-value="deny"]'), o = b.querySelector('[data-value="once"]'); return d && o ? Math.abs(d.getBoundingClientRect().top - o.getBoundingClientRect().top) : 99; });
	await t.check(`${surface}: one compact row`, row <= 1, `rows apart ${row}`);
	for (const v of ['deny', 'once', 'session', 'always']) await t.visible(banner.locator(`[data-value="${v}"]`), `${surface}: ${v} on top`);
	await t.page.screenshot({ path: path.join(t.run.dir, `capture-held-${surface}.png`) }).catch(() => {});
	// Always opens the chooser in the banner; Escape leaves it
	await banner.locator('[data-value="always"]').click();
	await t.until(`${surface}: the banner's Always opens its chooser`, () => !!document.querySelector('[data-k="bc-allow-banner"] .pmx-ask-always'));
	// the chat page's ordinary thread has no project (only PMConcept7 binds one), so This project is not offered
	const places = await banner.locator('[data-action="perm-place"]').evaluateAll((bs) => bs.map((b) => b.dataset.value + ':' + b.getAttribute('aria-pressed')));
	await t.check(`${surface}: a chat with no project: This computer and Everywhere, none chosen`, JSON.stringify(places) === '["computer:false","everywhere:false"]', JSON.stringify(places));
	await t.page.keyboard.press('Escape');
	await t.until(`${surface}: Escape leaves the chooser`, () => !document.querySelector('[data-k="bc-allow-banner"] .pmx-ask-always') && !!document.querySelector('[data-k="bc-allow-banner"] [data-value="session"]'));
	// an expired hold (permissions changed since it was held) grants nothing: For session on it stores no grant, writes no
	// allowing line, and the next run holds afresh
	let n = await count();
	const perm0 = await f.evaluate(() => { const st = PM56_EXT.ctx().state, was = st.permissions; st.permissions = was === 'Ask' ? 'Auto' : 'Ask'; return was; });
	await banner.locator('[data-value="session"]').click();
	await t.until(`${surface}: For session on an expired hold clears it`, (b) => !document.querySelector(b), BANNER);
	let added = await titlesAfter(n);
	await t.check(`${surface}: an expired hold writes no allowing line and stores no grant`, !added.some((x) => /^permission-answer\|Allowed/.test(x)) && await f.evaluate(() => !PM56_ASKS.grants().some((g) => g.pattern === 'screenshots') && !(PM56_BROWSER.state().allowOnce || {}).screenshots), JSON.stringify(added));
	await shoot();
	await t.until(`${surface}: the next run holds afresh`, (b) => !!document.querySelector(b), BANNER);
	await f.evaluate((p) => { PM56_EXT.ctx().state.permissions = p; }, perm0);
	await shoot();
	await t.until(`${surface}: held under the restored permissions`, (b) => !!document.querySelector(b), BANNER);
	// For session: the hold clears, the keyboard goes to the capture toolbar, the action runs again, and a later hold runs at once
	n = await count();
	const sess = f.locator(BANNER).locator('[data-value="session"]');
	if (await sess.count() === 1) { await sess.focus(); await t.page.keyboard.press('Enter'); }
	else await t.check(`${surface}: the hold to answer by keyboard is there`, false);
	await t.until(`${surface}: For session clears the hold`, (b) => !document.querySelector(b), BANNER);
	await t.until(`${surface}: the keyboard goes to the capture toolbar, not the page`, () => document.activeElement && document.activeElement.matches('.bc-toolbar .bc-tool-btn'));
	added = await titlesAfter(n);
	await t.check(`${surface}: For session writes one line`, added.filter((x) => x.startsWith('permission-answer|')).length === 1 && added.includes('permission-answer|Allowed for this session: screenshots'), JSON.stringify(added));
	await shoot();
	await t.check(`${surface}: the action runs again without a hold`, await f.locator(BANNER).count() === 0 && await f.evaluate(() => !PM56_BROWSER.state().pendingAllow));
	n = await count();
	await shoot();
	added = await titlesAfter(n);
	await t.check(`${surface}: a later hold runs at once, one line saying the session's grant allowed it`, await f.locator(BANNER).count() === 0 && added.includes('permission-answer|Allowed by this session’s grant: use browser capture: Screenshots / recording'), JSON.stringify(added));
	// Deny: a DOM hold, cleared with one line, nothing granted
	await f.evaluate(() => { const st = PM56_BROWSER.state(); st.policy = Object.assign({}, st.policy, { dom: 'ask' }); st.pendingAllow = { capability: 'dom', capabilities: ['dom'], actionLabel: 'Send with browser references', at: new Date().toISOString(), permissions: PM56_EXT.ctx().state.permissions, policy: 'ask', policies: { dom: 'ask' } }; PM56_EXT.ctx().renderApp(); });
	await t.until(`${surface}: the DOM hold shows`, (b) => !!document.querySelector(b), BANNER);
	n = await count();
	await f.locator(BANNER).locator('[data-value="deny"]').click();
	await t.until(`${surface}: Deny clears the hold`, (b) => !document.querySelector(b), BANNER);
	added = await titlesAfter(n);
	await t.check(`${surface}: Deny writes one Denied line and grants nothing`, JSON.stringify(added) === '["permission-answer|Denied: use browser capture: DOM and components"]' && await f.evaluate(() => !(PM56_BROWSER.state().allowOnce || {}).dom), JSON.stringify(added));
	// a This project rule stays in its project, on the real path: Batch 19's demo chats are each their own project
	const b19 = async () => { await act('b19-start-intake'); await t.page.waitForTimeout(600); await act('bc-open'); await t.until(`${surface}: the internal browser reopens`, () => !!document.querySelector('.bc-toolbar [data-action="bc-full-shot"]')); };
	await f.evaluate(() => { const st = PM56_BROWSER.state(); st.policy = Object.assign({}, st.policy, { screenshots: 'ask' }); PM56_BROWSER.state().pendingAllow = null; });
	await b19();
	const p1 = await f.evaluate(() => PM56_EXT.ctx().thread.projectId || '');
	await shoot();
	await t.until(`${surface}: held in the first Batch 19 chat (${p1})`, (b) => !!document.querySelector(b), BANNER);
	if (await f.locator(BANNER).count() === 1) await f.locator(BANNER).locator('[data-value="always"]').click();
	await t.until(`${surface}: its chooser offers This project`, () => !!document.querySelector('[data-k="bc-allow-banner"] [data-action="perm-place"][data-value="project"]'));
	if (await f.locator(BANNER).locator('[data-action="perm-place"][data-value="project"]').count() === 1) {
		await f.locator(BANNER).locator('[data-action="perm-place"][data-value="project"]').click();
		await f.locator(BANNER).locator('[data-action="perm-save"]').click();
	}
	await t.until(`${surface}: the This project rule is saved`, (b) => !document.querySelector(b), BANNER);
	await b19();
	const p2 = await f.evaluate(() => PM56_EXT.ctx().thread.projectId || '');
	n = await count();
	await shoot();
	added = await titlesAfter(n);
	await t.check(`${surface}: another project's chat (${p2}) is held, not allowed by the rule`, p1 && p2 && p1 !== p2 && await f.locator(BANNER).count() === 1 && !added.some((x) => x.startsWith('permission-answer|Allowed by your rule')), JSON.stringify({ p1, p2, added }));
}

// A dock provider that registers after the chat's first render still shows (sol-recheck-b10l, loaded Nas1: the work dock
// waited for DOMContentLoaded, which came after the first render, and nothing re-rendered the composer). The page loads
// with that order forced: an init script holds every DOMContentLoaded listener named provideDock until 2.5 s after the
// event, as a slow load does; the Migration dry run line must still be in the dock. Then a probe provider registered
// with no render must show within a second.
async function lateCase(t, surface) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.context.addInitScript(() => {
		const add = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function (type, fn, opts) {
			if (type === 'DOMContentLoaded' && fn && fn.name === 'provideDock') {
				window.__lateHeld = (window.__lateHeld || 0) + 1;
				return add.call(this, type, function (e) { setTimeout(() => fn.call(this, e), 2500); }, opts);
			}
			return add.call(this, type, fn, opts);
		};
	});
	const f = await ready(t, surface);
	if (!f) return;
	const held = await f.evaluate(() => window.__lateHeld || 0);
	t.log(`${surface}: DOMContentLoaded dock registrations held late: ${held}`);
	await t.page.waitForTimeout(3000);
	const shown = await f.evaluate(async () => {
		const t0 = performance.now();
		while (performance.now() - t0 < 4000) {
			if (document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:work:p-migrate"]')) return true;
			await new Promise((r) => setTimeout(r, 50));
		}
		return false;
	});
	await t.check(`${surface}: with the late order forced, the Migration dry run line is in the dock`, shown, `held ${held}`);
	const probe = await f.evaluate(async () => {
		const S = PM56_SHELL;
		const off = PM56_PMX.dock.provide(() => [{ key: 'late-probe', tone: 'needs', at: Date.now() + 1e6, html: S.pmxDockLine({ key: 'pmx-dock:late-probe', tone: 'needs', kindWord: 'Probe', sentence: 'registered after the first render' }) }]);
		const t0 = performance.now();
		let ms = -1;
		while (performance.now() - t0 < 1500) {
			if (document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:late-probe"]')) { ms = Math.round(performance.now() - t0); break; }
			await new Promise((r) => requestAnimationFrame(r));
		}
		off(); PM56_APP.render();
		return ms;
	});
	await t.check(`${surface}: a provider registered after the first render shows at once, with no other render`, probe >= 0 && probe < 1000, `${probe} ms`);
}

// Browser capture's grants compose (sol-review-l1c C1): a Screenshots grant and a DOM grant made one at a time, For
// session or Always, in either order, together let Send Now (which needs both) run with no new hold; with Screenshots
// For session and DOM Once, Send Now holds DOM alone (not the pair), and one more Once lets it run. Real buttons on the
// chat page, a fresh page per case.
async function composeCase(t, surface) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(1440, 900);
	await t.emulate({ reducedMotion: 'reduce' });
	const BANNER = '[data-k="bc-allow-banner"]';
	let f;
	const act = (name, data = {}) => f.evaluate(([n, d]) => { const b = document.createElement('button'); b.type = 'button'; b.hidden = true; b.setAttribute('data-action', n); Object.entries(d).forEach(([k, v]) => b.setAttribute('data-' + k, v)); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);
	const fresh = async () => {
		const url = chatPageUrl(t);
		f = surface === 'sandbox' ? await t.openInSandbox(url, { settleMs: 300 }) : (await t.page.goto(url), t.page);
		await f.waitForFunction(() => window.PM56_EXT && PM56_EXT.ctx && window.PM56_ASKS && window.PM56_BROWSER, null, { timeout: 30000 });
		await act('bc-open');
		await f.waitForSelector('.bc-toolbar [data-action="bc-full-shot"]');
		await f.evaluate(() => { const p = PM56_BROWSER.state(); p.policy = Object.assign({}, p.policy || {}, { screenshots: 'ask', dom: 'ask' }); PM56_EXT.ctx().renderApp(); });
	};
	const held = () => f.evaluate(() => { const h = PM56_BROWSER.state().pendingAllow; return h ? (h.capabilities || [h.capability]).slice().sort().join('+') : ''; });
	const answer = async (how, name) => {
		const b = f.locator(BANNER);
		const ok = await b.count() === 1;
		await t.check(`${name}: held`, ok);
		if (!ok) return;
		await b.locator(`[data-value="${how}"]`).click();
		if (how === 'always') {
			await b.locator('[data-action="perm-place"][data-value="computer"]').click();
			await b.locator('[data-action="perm-save"]').click();
		}
		await t.page.waitForTimeout(300);
	};
	const shot = async () => { await f.locator('.bc-toolbar [data-action="bc-full-shot"]').first().click(); await t.page.waitForTimeout(300); };
	const pick = async () => {
		// arming toggles: arm only while no component is offered
		if (await f.locator('[data-action="bc-pick-el"]').count() === 0) { await act('bc-arm-component'); await t.page.waitForTimeout(200); }
		const el = f.locator('[data-action="bc-pick-el"]').first();
		if (await el.count() === 1) await el.click();
		await t.page.waitForTimeout(300);
		return await el.count() === 1;
	};
	const sendNow = async () => {
		const run = f.locator('[data-action="bc-prompt-run"]');
		if (await run.count() !== 1) return { ran: false, reason: 'no Send Now' };
		const n = await f.evaluate(() => PM56_BROWSER.state().captures.length);
		await run.click();
		await t.page.waitForTimeout(500);
		return f.evaluate((n) => { const p = PM56_BROWSER.state(); return { ran: true, captured: p.captures.length - n, pending: p.pendingAllow ? (p.pendingAllow.capabilities || [p.pendingAllow.capability]).slice().sort().join('+') : '' }; }, n);
	};
	for (const [how, order] of [['session', ['shot', 'dom']], ['session', ['dom', 'shot']], ['always', ['shot', 'dom']], ['always', ['dom', 'shot']]]) {
		const name = `${surface}: ${how === 'session' ? 'For session' : 'Always'}, ${order[0] === 'shot' ? 'Screenshots then DOM' : 'DOM then Screenshots'}`;
		await fresh();
		for (const step of order) {
			if (step === 'shot') { await shot(); await answer(how, `${name}: Screenshots`); }
			else { await t.check(`${name}: a real component is pickable`, await pick()); await answer(how, `${name}: DOM`); }
		}
		await pick();
		const r = await sendNow();
		await t.check(`${name}: Send Now runs on the two grants, with no new hold`, r.ran && r.captured === 1 && !r.pending, JSON.stringify(r));
	}
	// mixed: Screenshots For session, DOM Once
	const mix = `${surface}: Screenshots For session with DOM Once`;
	await fresh();
	await shot(); await answer('session', `${mix}: Screenshots`);
	await pick(); await answer('once', `${mix}: DOM`);
	await pick();
	let r = await sendNow();
	await t.check(`${mix}: the pick spent DOM's Once, so Send Now holds DOM alone, not the pair`, r.ran && r.captured === 0 && r.pending === 'dom', JSON.stringify(r));
	await answer('once', `${mix}: DOM again`);
	r = await sendNow();
	await t.check(`${mix}: one more Once lets Send Now run, and the Once is spent`, r.ran && r.captured === 1 && !r.pending && await f.evaluate(() => !(PM56_BROWSER.state().allowOnce || {}).dom), JSON.stringify(r));
}

async function helperCase(t, surface) {
	const f = await ready(t, surface, 'recovery-collaboration'); if (!f) return;
	await t.emulate({ reducedMotion: 'reduce' });
	await f.evaluate(() => PMW.chatCol.setWidth(600));
	const card = f.locator('#pmRoot article[data-run-id="crew-query-perf"]');
	await wheelMessages(t, f, -400, cardInView, `${surface}: the Crew card's ladder is in view`);
	const dec = card.locator('.pmx-decision');
	const say = await dec.evaluate((d) => { const q = d.querySelector('.pmx-decision-q'); return { say: d.querySelector('.pmx-decision-say').innerText, q: q ? q.textContent : '', clipped: q ? q.scrollWidth > q.clientWidth + 1 || q.scrollHeight > q.clientHeight + 1 : true }; });
	await t.check(`${surface}: the card says the helper wants to run a command, and shows it whole`, /Rollback Auditor needs your OK to run a command\./.test(say.say) && say.q === 'pg_restore --clean --if-exists -d tastebook_rehearsal snapshots/0007_pre.dump' && !say.clipped, JSON.stringify(say));
	const ladder = await dec.locator('[data-action="perm-answer"]').evaluateAll((bs) => bs.map((b) => b.dataset.value + '=' + b.textContent.trim()));
	await t.check(`${surface}: the card has the compact ladder`, JSON.stringify(ladder) === '["deny=Deny","once=Once","session=For session","always=Always…"]' && await dec.locator('.pmx-ask-seg-in [data-action="perm-answer"]').count() === 3, JSON.stringify(ladder));
	await t.check(`${surface}: and keeps Details`, await dec.locator('[data-action="collab-open-participant"]').count() === 1);
	// the card's Always opens the chooser in the card, Back returns
	await dec.locator('[data-value="always"]').click();
	await t.until(`${surface}: the card's Always opens its chooser`, () => !!document.querySelector('#pmRoot article[data-run-id="crew-query-perf"] .pmx-decision .pmx-ask-always'));
	const pat = await card.locator('[data-perm-pattern]').inputValue();
	await t.check(`${surface}: the helper's pattern is its command's first word`, pat === 'pg_restore *', pat);
	await card.locator('[data-action="perm-back"]').click();
	await t.until(`${surface}: Back returns the ladder`, () => !document.querySelector('#pmRoot article[data-run-id="crew-query-perf"] .pmx-ask-always') && !!document.querySelector('#pmRoot article[data-run-id="crew-query-perf"] [data-value="always"]'));
	// out of view: the dock line carries it
	// scrolled down past the card, its line carries the ladder
	await wheelMessages(t, f, 400, () => !!document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:crew-query-perf"][data-ask]'), `${surface}: the helper's line is in the dock`);
	// one more step takes the card clearly out of view (the line shows as soon as any of the card is hidden), then the
	// line's question row is read once it is there, without throwing
	await t.page.mouse.wheel(0, 400);
	await t.page.waitForTimeout(400);
	await t.until(`${surface}: the helper's line carries its question`, () => !!document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:crew-query-perf"] .pmx-dock-q'));
	const ln = line(f, 'pmx-dock:crew-query-perf');
	const lq = await f.evaluate(() => { const q = document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:crew-query-perf"] .pmx-dock-q'); return q ? q.textContent : ''; });
	await t.check(`${surface}: the line shows the command whole`, lq.includes('pg_restore --clean --if-exists -d tastebook_rehearsal snapshots/0007_pre.dump'), lq);
	await ln.locator('[data-value="once"]').click();
	await t.until(`${surface}: Once lets the helper go on`, () => !PM56_ASKS.list().some((a) => a.id.startsWith('collab:crew-query-perf:')) && !document.querySelector('#pmRoot article[data-run-id="crew-query-perf"] [data-action="perm-answer"]'));
	await t.until(`${surface}: the line leaves the dock`, () => !document.querySelector('#pmRoot .composer > .pmx-dock [data-k="pmx-dock:crew-query-perf"][data-ask]'));
	const said = await f.evaluate(() => { const c = document.querySelector('#pmRoot article[data-run-id="crew-query-perf"]'); return c ? c.textContent : ''; });
	t.log(`${surface}: card after Once: ${said.replace(/\s+/g, ' ').slice(0, 240)}`);
}

async function looksCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	let n = 0;
	const measure = (sel) => f.evaluate((sel) => {
		const out = { boxes: 0, buttons: 0, bad: [] };
		document.querySelectorAll(sel).forEach((box) => {
			out.boxes++;
			if (box.matches('.pmx-dock-line') && box.scrollWidth > box.clientWidth + 1) out.bad.push(`${box.dataset.k} scrolls sideways ${box.scrollWidth}>${box.clientWidth}`);
			box.querySelectorAll('.pmx-dock-body button, .pmx-dock-body input, .pmx-decision-acts button, .pmx-ask-always button, .pmx-ask-always input').forEach((b) => {
				if (b.closest('.pmx-act-extra') || getComputedStyle(b).display === 'none') return;
				out.buttons++;
				b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
				const lb = box.getBoundingClientRect(), r = b.getBoundingClientRect(), name = `${box.dataset.k || box.className.split(' ')[0]} "${(b.textContent || b.value || '').trim()}"`;
				if (r.height < 24) out.bad.push(`${name} ${r.height.toFixed(1)} px tall`);
				if (r.left < lb.left - 0.5 || r.right > lb.right + 0.5 || r.top < lb.top - 0.5 || r.bottom > lb.bottom + 0.5) out.bad.push(`${name} outside its box`);
				if (b.tagName === 'BUTTON' && b.scrollWidth > b.clientWidth + 1) out.bad.push(`${name} words clipped`);
				const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
				if (!hit || (hit !== b && !b.contains(hit))) out.bad.push(`${name} covered by ${hit ? hit.tagName + '.' + String(hit.className).slice(0, 40) : 'nothing'}`);
			});
			// the compact ladder is one row: Deny and the segmented control share their line (Jared: "the more compact format")
			const deny = box.querySelector('[data-action="perm-answer"][data-value="deny"]'), once = box.querySelector('[data-action="perm-answer"][data-value="once"]');
			if (deny && once && !box.querySelector('.pmx-ask-always') && Math.abs(deny.getBoundingClientRect().top - once.getBoundingClientRect().top) > 1) out.bad.push(`${box.dataset.k || box.className.split(' ')[0]} ladder wraps: Deny at ${Math.round(deny.getBoundingClientRect().top)}, Once at ${Math.round(once.getBoundingClientRect().top)}`);
		});
		return out;
	}, sel);
	for (const look of LOOKS) {
		await t.emulate({ reducedMotion: n++ % 2 ? 'no-preference' : 'reduce' });
		await t.app.look(look);
		for (const w of CHAT_W) {
			await f.evaluate((cw) => PMW.chatCol.setWidth(cw), w);
			await thread_(t, f, 'query');
			await f.evaluate(() => { if (!(PM56_APP.ctx().state.decision && PM56_APP.ctx().state.decision.type === 'permission')) PM56_APP.demoAction('demo-trigger', { trigger: 'Permission request' }); });
			for (const state of ['rest', 'always']) {
				await f.evaluate((st) => { const a = PM56_ASKS.list().find((x) => x.id === 'perm-studio-host'); if (a) { a.ui.always = st === 'always'; a.ui.place = null; } PM56_APP.render(); }, state);
				await t.page.waitForTimeout(350);
				const r = await measure('#pmRoot .composer > .pmx-dock .pmx-dock-line[data-ask]');
				await t.check(`${surface} ${look} ${w} bar ${state}: every answer on top and whole`, r.boxes >= 2 && r.buttons >= 7 && !r.bad.length, JSON.stringify(r));
			}
			await f.evaluate(() => { const a = PM56_ASKS.list().find((x) => x.id === 'perm-studio-host'); if (a) a.ui.always = false; PM56_APP.render(); });
			if (w === 400) {
				// sol-review-l1c C2: the dock scrolls (a third asking line) and the window goes 1920x1080 -> 1390x900 -> back
				// with the chat measured at 400 px: the ladder stays one row with the dock's scrollbar showing, in every look,
				// and no scrollbar/height feedback keeps it wrapped after widening back
				const extra = await f.evaluate(() => PM56_ASKS.ask({ tool: 'bash', target: 'pg_dump --schema-only tastebook', who: 'Schema Reviewer' }));
				for (const [vw, vh] of [[1920, 1080], [1390, 900], [1920, 1080]]) {
					await t.viewport(vw, vh);
					await f.evaluate(() => PMW.chatCol.setWidth(400));
					await t.page.waitForTimeout(600);
					const st = await f.evaluate(() => { const d = document.querySelector('#pmRoot .composer > .pmx-dock'), p = document.getElementById('chatPanel'); return { chat: p ? Math.round(p.getBoundingClientRect().width) : null, scroll: d ? d.scrollHeight > d.clientHeight + 1 : false, bar: d ? d.offsetWidth - d.clientWidth : 0 }; });
					const r = await measure('#pmRoot .composer > .pmx-dock .pmx-dock-line[data-ask]');
					await t.check(`${surface} ${look} 400 at ${vw}x${vh}, dock scrolling: the ladder stays one row`, st.chat === 400 && st.scroll && !r.bad.some((b) => /ladder wraps/.test(b)), JSON.stringify({ st, wraps: r.bad.filter((b) => /ladder wraps/.test(b)) }));
				}
				await f.evaluate((i) => { PM56_ASKS.drop(i); PM56_APP.render(); }, extra);
			}
			await thread_(t, f, 'recovery-collaboration');
			await wheelMessages(t, f, -400, cardInView, `${look} ${w}: the Crew card's ladder is in view`);
			await t.page.waitForTimeout(150);
			const c = await measure('#pmRoot article[data-run-id="crew-query-perf"] .pmx-decision');
			await t.check(`${surface} ${look} ${w} helper card: its ladder on top and whole`, c.boxes === 1 && c.buttons >= 4 && !c.bad.length, JSON.stringify(c));
		}
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-128 process prompt answers in the bar ${surface}`] = (t) => processCase(t, surface);
	tests[`FO-128 a dock provider registered late still shows ${surface}`] = (t) => lateCase(t, surface);
	tests[`FO-128 Studio Ask permission in the bar ${surface}`] = (t) => studioCase(t, surface);
	tests[`FO-128 Always places follow canon ${surface}`] = (t) => placesCase(t, surface);
	tests[`FO-128 For session is remembered, Deny covers its ask ${surface}`] = (t) => grantsCase(t, surface);
	tests[`FO-128 Always rules cover by their place ${surface}`] = (t) => rulesCase(t, surface);
	tests[`FO-128 browser capture's hold has the ladder ${surface}`] = (t) => captureCase(t, surface);
	tests[`FO-128 browser capture's grants compose ${surface}`] = (t) => composeCase(t, surface);
	tests[`FO-128 Crew helper card and line ${surface}`] = (t) => helperCase(t, surface);
	tests[`FO-128 ten looks, two chat widths ${surface}`] = (t) => looksCase(t, surface);
}
