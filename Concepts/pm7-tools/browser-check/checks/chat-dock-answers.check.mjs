// FO-128 (Jared, 2026-11-09, item 9: "it asks to approve a process above the composer. It should have the approval
// buttons right there in the bar to choose from"). The chat's composer dock answers what it asks, in the line.
//   process   Query performance's Migration dry run asks "Apply 0007_normalize_units to staging? [y/N]": its line shows the
//             question whole and Activity Detail's own answers (DL-252 / D13: No, Yes, then Answer in Terminal); a real
//             press on Yes reaches PM_WORK (the process takes "> Yes" and leaves Needs input), the line goes, and the
//             keyboard lands on the next asking line or the composer, never on the page.
//   ladder    a tool's permission ask (the prototype's Query Analyzer psql ask) offers Permissions_System 6.1's ladder in
//             its order (Deny, Once, For session, Always); Always opens the chooser with the suggested pattern editable
//             and no place chosen; a real press on Save is refused until a place is chosen; Save writes the receipt; a
//             path ask never offers Everywhere; a chat with no project hides This project; Escape leaves the chooser.
//   looks     in all ten looks, at a 600 and a 400 px docked chat, at rest and with the Always chooser open, every answer
//             is on top at its centre (native hit test), inside its line, at least 24 px tall, its words not clipped,
//             and no asking line scrolls sideways. Reduced Motion alternates between reduce and no-preference by look.
// Both surfaces (--set sandbox=0|1 picks one). On the page before FO-128 the process line has only Review: the process
// test fails at "offers No and Yes".
import { LOOKS } from '../browser-check.config.mjs';

const CHAT_W = [600, 400];
const line = (f, key) => f.locator(`#pmRoot .composer > .pmx-dock [data-k="${key}"]`);

async function ready(t, surface) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return null; }
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.__PM56_BOOT_OK && window.PM56_PORT && window.PM56_PORT.ready && window.PMW && PMW.chatCol, null, { timeout: 30000 });
	await f.evaluate(() => { const c = PM56_APP.ctx(); if (c.state.selectedThread !== 'query') PM56_APP.switchThread('query'); });
	await t.until('the Query performance thread', () => PM56_APP.ctx().state.selectedThread === 'query');
	return f;
}
const focusInfo = (f) => f.evaluate(() => { const a = document.activeElement; return a ? { cls: String(a.className || ''), tag: a.tagName, text: (a.textContent || '').trim().slice(0, 40), body: a === document.body } : null; });

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
	await t.check(`${surface}: the keyboard went to the next asking line or the composer`, !!fo && !fo.body && /pmx-dock-(ans|choice)|composer-input/.test(fo.cls), JSON.stringify(fo));
}

async function ladderCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	await t.emulate({ reducedMotion: 'no-preference' });
	await f.evaluate(() => PMW.chatCol.setWidth(600));
	const id = await f.evaluate(() => (PM56_ASKS.list().filter((a) => a.thread === 'query')[0] || {}).id);
	await t.check(`${surface}: the demo permission ask is in Query performance`, !!id, String(id));
	const ln = line(f, `pmx-dock:${id}`);
	const order = await ln.locator('[data-action="perm-answer"]').evaluateAll((bs) => bs.map((b) => b.dataset.value));
	await t.check(`${surface}: canon's ladder, in its order`, JSON.stringify(order) === '["deny","once","session","always"]', JSON.stringify(order));
	await ln.locator('[data-action="perm-answer"][data-value="always"]').click();
	await t.until(`${surface}: the pattern field takes the keyboard`, () => document.activeElement && document.activeElement.matches('[data-perm-pattern]'));
	const ch = await ln.evaluate((el) => ({ pattern: el.querySelector('[data-perm-pattern]').value, places: [...el.querySelectorAll('[data-action="perm-place"]')].map((b) => b.dataset.value + ':' + b.getAttribute('aria-pressed')) }));
	await t.check(`${surface}: the suggested pattern is the command's first word`, ch.pattern === 'psql *', ch.pattern);
	await t.check(`${surface}: three places, none chosen`, JSON.stringify(ch.places) === '["project:false","computer:false","everywhere:false"]', JSON.stringify(ch.places));
	await t.quickClick(ln.locator('[data-action="perm-save"]'));
	await t.page.waitForTimeout(200);
	await t.check(`${surface}: Save is refused until a place is chosen`, await f.evaluate((i) => !!PM56_ASKS.list().find((a) => a.id === i), id));
	await ln.locator('[data-action="perm-place"][data-value="computer"]').click();
	await t.check(`${surface}: This computer is chosen`, await ln.locator('[data-value="computer"][aria-pressed="true"]').count() === 1);
	await ln.locator('[data-action="perm-save"]').click();
	await t.until(`${surface}: the ask is answered`, (i) => !PM56_ASKS.list().find((a) => a.id === i), id);
	const rec = await f.evaluate(() => { const m = PM56_APP.activeThread().messages.slice(-1)[0]; return m ? m.type + '|' + m.title + '|' + m.detail : ''; });
	await t.check(`${surface}: the receipt says what was allowed and where`, /^permission-answer\|Always allowed: psql \*\|A rule for this computer/.test(rec), rec);
	// a path never offers Everywhere; no project hides This project; Escape leaves the chooser; Deny
	const pathPlaces = await f.evaluate(() => { const i = PM56_ASKS.ask({ tool: 'edit', target: 'web/src/routes/recipes.ts', who: 'Schema Reviewer' }); const a = PM56_ASKS.list().find((x) => x.id === i); a.ui.always = true; PM56_APP.render(); return { i, s: a.suggested, p: [...document.querySelectorAll(`#pmRoot [data-k="pmx-dock:${i}"] [data-action="perm-place"]`)].map((b) => b.dataset.value) }; });
	await t.check(`${surface}: a path suggests its folder and never offers Everywhere`, pathPlaces.s === 'web/src/routes/**' && JSON.stringify(pathPlaces.p) === '["project","computer"]', JSON.stringify(pathPlaces));
	await line(f, `pmx-dock:${pathPlaces.i}`).locator('[data-perm-pattern]').focus();
	await t.page.keyboard.press('Escape');
	await t.until(`${surface}: Escape leaves the chooser`, (i) => !PM56_ASKS.list().find((a) => a.id === i).ui.always, pathPlaces.i);
	await line(f, `pmx-dock:${pathPlaces.i}`).locator('[data-action="perm-answer"][data-value="deny"]').click();
	await t.until(`${surface}: Deny answers it`, (i) => !PM56_ASKS.list().find((a) => a.id === i), pathPlaces.i);
	const noProject = await f.evaluate(() => { const i = PM56_ASKS.ask({ tool: 'bash', target: 'ls', who: 'The agent', project: false }); const a = PM56_ASKS.list().find((x) => x.id === i); a.ui.always = true; PM56_APP.render(); const p = [...document.querySelectorAll(`#pmRoot [data-k="pmx-dock:${i}"] [data-action="perm-place"]`)].map((b) => b.dataset.value); a.ui.always = false; return p; });
	await t.check(`${surface}: a chat with no project hides This project`, JSON.stringify(noProject) === '["computer","everywhere"]', JSON.stringify(noProject));
}

async function looksCase(t, surface) {
	const f = await ready(t, surface); if (!f) return;
	let n = 0;
	for (const look of LOOKS) {
		await t.emulate({ reducedMotion: n++ % 2 ? 'no-preference' : 'reduce' });
		await t.app.look(look);
		for (const w of CHAT_W) {
			await f.evaluate((cw) => PMW.chatCol.setWidth(cw), w);
			for (const state of ['rest', 'always']) {
				await f.evaluate((st) => { const a = PM56_ASKS.list()[0]; if (a) { a.ui.always = st === 'always'; a.ui.place = null; } PM56_APP.render(); }, state);
				await t.page.waitForTimeout(350);
				const r = await f.evaluate(() => {
					const out = { lines: 0, buttons: 0, bad: [] };
					document.querySelectorAll('#pmRoot .composer > .pmx-dock .pmx-dock-line[data-ask]:not([data-folded])').forEach((ln) => {
						out.lines++;
						const lb = ln.getBoundingClientRect();
						if (ln.scrollWidth > ln.clientWidth + 1) out.bad.push(`${ln.dataset.k} scrolls sideways ${ln.scrollWidth}>${ln.clientWidth}`);
						ln.querySelectorAll('.pmx-dock-body button, .pmx-dock-body input').forEach((b) => {
							out.buttons++;
							const r = b.getBoundingClientRect(), name = `${ln.dataset.k} "${(b.textContent || b.value || '').trim()}"`;
							if (r.height < 24) out.bad.push(`${name} ${r.height.toFixed(1)} px tall`);
							if (r.left < lb.left - 0.5 || r.right > lb.right + 0.5 || r.top < lb.top - 0.5 || r.bottom > lb.bottom + 0.5) out.bad.push(`${name} outside its line`);
							if (b.tagName === 'BUTTON' && b.scrollWidth > b.clientWidth + 1) out.bad.push(`${name} words clipped`);
							const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
							if (!hit || (hit !== b && !b.contains(hit))) out.bad.push(`${name} covered by ${hit ? hit.tagName + '.' + String(hit.className).slice(0, 40) : 'nothing'}`);
						});
					});
					return out;
				});
				await t.check(`${surface} ${look} ${w} ${state}: every answer on top and whole`, r.lines >= 1 && r.buttons >= 4 && !r.bad.length, JSON.stringify(r));
			}
		}
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-128 process prompt answers in the bar ${surface}`] = (t) => processCase(t, surface);
	tests[`FO-128 permission ladder ${surface}`] = (t) => ladderCase(t, surface);
	tests[`FO-128 ten looks, two chat widths ${surface}`] = (t) => looksCase(t, surface);
}
