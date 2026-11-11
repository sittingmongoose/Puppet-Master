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
//             approve-permission (the decision closes) and writes "Allowed once"; Deny goes through deny-permission (its
//             "Permission denied" receipt, no second one); Always opens the chooser with the suggested pattern editable
//             and no place chosen, a real press on Save is refused until a place is chosen, Escape leaves the chooser,
//             and Save writes "Always allowed" with its place.
//   places    a path ask never offers Everywhere and suggests its folder "/**"; a chat with no project hides This project.
//   helper    the Crew helper that waits for your OK (Rollback Auditor, recovery-collaboration) has the same ladder in its
//             card's decision row, under the command it would run shown whole, and in its dock line once the card is out of view;
//             Once from the line lets it go on and the run says so; Always from the card opens the chooser in the card.
//   looks     in all ten looks, at a 600 and a 400 px docked chat: every answer of every asking line (rest, and with the
//             Always chooser open) and of the helper card's ladder is on top at its centre (native hit test), inside its
//             line or card, at least 24 px tall, its words not clipped, the ladder one row (Deny beside the segmented
//             control), and no asking line scrolls sideways. Each answer is
//             first scrolled into the dock's view: past its height budget the dock scrolls in place (pmx-system.css).
//             Reduced Motion alternates between reduce and no-preference by look.
// Both surfaces (--set sandbox=0|1 picks one). On the page before FO-128 the process line has only Review: the process
// test fails at "offers No and Yes", and the others at the missing PM56_ASKS.
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
	// Deny: the app's own receipt, no second one
	await openStudio(f);
	await t.until(`${surface}: asked again`, (k) => !!document.querySelector(`#pmRoot .composer > .pmx-dock [data-k="${k}"]`), STUDIO);
	const before = await f.evaluate(() => PM56_APP.activeThread().messages.length);
	await line(f, STUDIO).locator('[data-value="deny"]').click();
	await t.until(`${surface}: Deny closes the decision`, () => !PM56_APP.ctx().state.decision);
	const added = await f.evaluate((n) => PM56_APP.activeThread().messages.slice(n).map((m) => m.type + '|' + m.title), before);
	await t.check(`${surface}: Deny writes the app's one receipt`, JSON.stringify(added) === '["permission|Permission denied"]', JSON.stringify(added));
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
	const ln = line(f, 'pmx-dock:crew-query-perf');
	const lq = await ln.locator('.pmx-dock-q').innerText();
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
			await f.evaluate(() => { const a = PM56_ASKS.list().find((x) => x.id === 'perm-studio-host'); if (a) a.ui.always = false; });
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
	tests[`FO-128 Studio Ask permission in the bar ${surface}`] = (t) => studioCase(t, surface);
	tests[`FO-128 Always places follow canon ${surface}`] = (t) => placesCase(t, surface);
	tests[`FO-128 Crew helper card and line ${surface}`] = (t) => helperCase(t, surface);
	tests[`FO-128 ten looks, two chat widths ${surface}`] = (t) => looksCase(t, surface);
}
