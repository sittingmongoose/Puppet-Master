// Astra max review of concept B (2026-11-12, REVIEW-concept-B-max-astra.md in the share folder): four should-fix findings,
// each with checks here named "(Astra max A1)" to "(Astra max A4)". Every one fails on 751805fd5f and passes after the fix.
// Every entry point is reached by real presses: the title bar's No project row, the chat's More menu, the move's and New
// Project's own controls, the report's buttons, Start a run, the Undo dialogs, New Project's Where it lives.
//   A1  Try that file again moves the failed file by its own name, and the report, its counts and its summary are derived
//       again from the operation record; a file that fails again stays failed, with its reason (ACD-511: exact effects).
//   A2  Accepted new work ends conversion Undo on both paths, says why, and an Undo dialog opened before the work was
//       accepted cannot remove the Project when it is confirmed after (ACD-511: the boundary, checked when Undo executes).
//   A3  Undo's own preview, and the Undo itself, count the files that were picked and moved, and name the ones that stayed.
//   A4  The records home, the place that holds the files and the default work Computer stay apart, through the plan, the
//       created Project, its Where it lives plate, the library and Where work runs, with each Computer as records home.
const CHAT = 'chat-printer';
const ev = (f, fn, arg) => f.evaluate(fn, arg);
/* open "Fix the printer" the way a person does: the title bar's project menu, its No project row */
async function openPrinter(t, f) {
	await t.app.page(t, f, 'dashboard');
	await t.app.click(t, f, '#projectMenuBtn', { noScroll: true });
	await t.app.click(t, f, '#projectMenu .pjx-tb-noproj', { noScroll: true, wait: 500 });
	await t.text(f.locator('.pjx-npc .pjx-npc-title').first(), 'Fix the printer');
}
/* More › Move this chat into a project › harbor, the waiting approval allowed once, harbor's unsaved README.md saved */
async function moveIntoHarbor(t, f, { partial = false } = {}) {
	await openPrinter(t, f);
	await t.app.click(t, f, '.pjx-npc .pjx-npc-more', { noScroll: true });
	await t.app.menuPick(t, f, 'Move this chat into a project');
	await t.app.until(t, f, 'the move is open', () => !!document.querySelector('.pjxc-move'), null, 6000);
	await t.app.click(t, f, '[data-c-key="mv:target:This-computer:harbor"]');
	await t.app.click(t, f, '[data-c-key="mv:ap:once"]');
	await t.app.click(t, f, '[data-c-key="mv:unsaved:save"]');
	if (partial) await t.app.tick(t, f, 'mv:demopartial');
	await t.app.click(t, f, '[data-c-key="mv:go"]');
	await t.app.until(t, f, 'moved into harbor: its report shows', () => !!document.querySelector('.pjxc-flash .pjxc-report'), null, 30000);
}
/* More › Make a project from this chat, the waiting approval allowed once, some files left out, Create */
async function makeFromPrinter(t, f, { leaveOut = [] } = {}) {
	await openPrinter(t, f);
	await t.app.click(t, f, '.pjx-npc .pjx-npc-more', { noScroll: true });
	await t.app.menuPick(t, f, 'Make a project from this chat');
	await t.app.until(t, f, 'New Project from the chat is open', () => !!document.querySelector('.pjx-np-chat'), null, 6000);
	await t.app.click(t, f, '.pjx-np-chat [data-c-key="chat:ap:once"]');
	for (const x of leaveOut) await t.app.tick(t, f, 'chat:pick:' + x);
	await t.app.click(t, f, '[data-c-key="rv:go"]');
	await t.app.until(t, f, 'made from the chat: its report shows', () => !!document.querySelector('.pjxc-flash .pjxc-report'), null, 30000);
	return ev(f, (c) => (window.PJX.S.world.facts.converted || {})[c] || null, CHAT);
}
/* the move's operation record, and the chat's own files (the identities a record may hold) */
const moveRec = (f) => ev(f, (c) => {
	const r = window.PJX.np.moved(c), ch = window.PJX.np.chatOf(c);
	return r ? { files: r.files.slice(), failed: r.failed.slice(), list: (ch.fileList || []).slice(), ended: window.PJX.np.undoEnded(r) } : null;
}, CHAT);
/* the report as a person reads it: each family's caption and lines, the title and the summary line under it */
const report = (f) => ev(f, () => {
	const fl = document.querySelector('.pjxc-flash'); if (!fl) return null;
	const fams = {};
	fl.querySelectorAll('.pjxc-repfam').forEach((x) => { fams[x.querySelector('.pjxc-repcap').textContent.trim()] = Array.from(x.querySelectorAll('.pjx-fact-text')).map((y) => y.textContent.trim()); });
	const line = fl.querySelector('.pjxc-undoline');
	return { tone: fl.getAttribute('data-tone'), title: (fl.querySelector('.pjx-notice-title') || {}).textContent || '', text: (fl.querySelector(':scope > .pjx-notice-text') || {}).textContent || '', fams,
		retry: !!fl.querySelector('[data-c-key="f:retryfile"]'), undo: line ? { state: line.getAttribute('data-undo'), text: line.textContent.trim() } : null, all: fl.textContent };
});
/* PM Notify's toasts on screen, newest last */
const toasts = (f) => ev(f, () => Array.from(document.querySelectorAll('.pmn-toast')).map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
const dlgText = (f) => ev(f, () => { const d = document.querySelector('.pjx-dlg'); return d ? d.textContent.replace(/\s+/g, ' ').trim() : null; });
const off = (f, key) => ev(f, (k) => { const b = document.querySelector('[data-c-key="' + k + '"]'); return b ? b.getAttribute('aria-disabled') === 'true' : null; }, key);
/* Start a run… on the Project's Where work runs plate: the first task (Run the tests), under the Project's choice, Start */
async function startRun(t, f, { wait = 200 } = {}) {
	await t.app.click(t, f, '[data-plate="work"] [data-c-key="p:startrun"]', { wait: 350 });
	await t.app.until(t, f, 'Start a run is open', () => /Start a run/.test((document.querySelector('.pjx-dlg') || {}).textContent || ''), null, 6000);
	const picked = await ev(f, () => ({ what: ((document.querySelector('.pjx-dlg [data-np-group="wk:start:what"] [aria-checked="true"]') || {}).textContent || '').trim(), where: ((document.querySelector('.pjx-dlg [data-c-key^="wk:start:where:"][aria-checked="true"]') || {}).textContent || '').trim() }));
	await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { noScroll: true, wait });
	return picked;
}
const workers = (f, pid) => ev(f, (id) => { const p = window.PJX.get(id); return p ? (p.workers || []).map((x) => x.task + (x.queued ? ' (queued)' : '')) : null; }, pid);

export const tests = {
	// (A1) Before: the retry copied the report's presentation strings into the record ("label-template.svg · it was open in
	// another app, so it stayed in the chat folder" became a moved file's name), the MOVED list repeated that failure, and
	// the summary still said 12 files.
	async 'retry: the failed file moves by its own name, and the report and counts are derived again (Astra max A1)'(t) {
		const f = await t.app.open(t);
		await moveIntoHarbor(t, f, { partial: true });
		const b = await moveRec(f);
		await t.check('before: 12 files moved and label-template.svg didn’t, each by its own name', !!b && b.files.length === 12 && b.failed.join() === 'label-template.svg' && b.files.every((x) => b.list.indexOf(x) >= 0), JSON.stringify(b));
		const r0 = await report(f);
		await t.check('before: the report says 12 files moved and why label-template.svg didn’t', !!r0 && (r0.fams.Moved || []).some((x) => /^12 files · into tools\/printer\//.test(x)) && /^label-template\.svg · .*open in another app/.test((r0.fams['Didn’t move'] || [])[0] || '') && r0.retry, JSON.stringify(r0 && { fams: r0.fams, title: r0.title }));
		await t.app.click(t, f, '[data-c-key="f:retryfile"]');
		await t.app.until(t, f, 'the try again finished', (c) => { const r = window.PJX.np.moved(c); return !!r && !(window.PJX.S.ops || {}).harbor && (r.failed.length === 0 || r.files.length !== 12); }, CHAT, 10000);
		await t.page.waitForTimeout(300);
		const a = await moveRec(f);
		await t.check('after: the record holds 13 moved files, every one a file of the chat, label-template.svg once', !!a && a.files.length === 13 && a.files.every((x) => a.list.indexOf(x) >= 0) && a.files.filter((x) => x === 'label-template.svg').length === 1, JSON.stringify(a && a.files));
		await t.check('after: no moved file carries a report’s words in its name', !!a && a.files.every((x) => !/ · |open in another app/.test(x)), JSON.stringify(a && a.files.filter((x) => / · /.test(x))));
		await t.check('after: nothing is left failed', !!a && a.failed.length === 0, JSON.stringify(a && a.failed));
		const r1 = await report(f);
		const moved = (r1 && r1.fams.Moved) || [];
		await t.check('after: Moved says 13 files, from the record', moved.some((x) => /^13 files · into tools\/printer\//.test(x)) && !moved.some((x) => /^12 files/.test(x)), JSON.stringify(moved));
		await t.check('after: the report no longer explains a failure that didn’t happen', !!r1 && !/open in another app/.test(r1.all) && !r1.fams['Didn’t move'] && !r1.retry, JSON.stringify(r1 && r1.fams));
		await t.check('after: the title and summary say the whole move, 13 files', !!r1 && r1.title === 'Moved into harbor' && /13 files in tools\/printer\//.test(r1.text) && r1.tone === 'done', JSON.stringify(r1 && { title: r1.title, text: r1.text, tone: r1.tone }));
		await t.crop('a1-retry', f.locator('.pjxc-flash').first(), 'The move report after Try that file again: 13 files moved, no failure left (LOOK: Astra max A1 after)');
		await t.app.click(t, f, '[data-c-key="f:mvshow"]', { wait: 400 });
		const shown = (await toasts(f)).filter((x) => /Show the files/.test(x)).pop() || '';
		await t.check('Show the files lists label-template.svg by its name, with the other moved files', /label-template\.svg, /.test(shown + ', ') && !/open in another app/.test(shown) && (shown.match(/, /g) || []).length >= 12, shown);
		await t.app.click(t, f, '[data-c-key="f:mvundo"]', { wait: 400 });
		const ud = await dlgText(f);
		await t.check('Undo’s preview counts the same 13 files', /puts the 13 files back/.test(ud || ''), ud);
		await t.app.click(t, f, '.pjx-dlg .pjx-btn', { hasText: 'Cancel', noScroll: true });
	},
	// (A1) A retried file that fails again stays failed, with its reason; the report keeps every count from the record.
	async 'retry: a file that fails again stays failed, with its reason (Astra max A1)'(t) {
		const f = await t.app.open(t);
		await moveIntoHarbor(t, f, { partial: true });
		const has = await f.locator('[data-c-key="f:retrystill"]').count();
		await t.check('the report’s concept demo can keep the file open for the next try', has === 1, 'controls: ' + has);
		if (has !== 1) return;
		await t.app.tick(t, f, 'f:retrystill');
		await t.app.click(t, f, '[data-c-key="f:retryfile"]');
		await t.app.until(t, f, 'the second try finished', () => !(window.PJX.S.ops || {}).harbor && /still open/.test(((document.querySelector('.pjxc-flash .pjxc-report') || {}).textContent || '')), null, 10000);
		const a = await moveRec(f);
		await t.check('it stays failed: 12 moved, label-template.svg not', !!a && a.files.length === 12 && a.failed.join() === 'label-template.svg' && a.files.indexOf('label-template.svg') < 0 && a.files.every((x) => a.list.indexOf(x) >= 0), JSON.stringify(a));
		const r = await report(f);
		const failed = (r && r.fams['Didn’t move']) || [];
		await t.check('Didn’t move names it once, with the new reason', failed.length === 1 && /^label-template\.svg · .*still open in another app/.test(failed[0]), JSON.stringify(failed));
		await t.check('Moved still says 12 files; the title says 1 file didn’t move; Try again is still there', !!r && (r.fams.Moved || []).some((x) => /^12 files · into tools\/printer\//.test(x)) && /except 1 file/.test(r.title) && /12 files in tools\/printer\//.test(r.text) && r.retry && r.tone === 'attention', JSON.stringify(r && { moved: r.fams.Moved, title: r.title, text: r.text, tone: r.tone }));
		await t.crop('a1-again', f.locator('.pjxc-flash').first(), 'Try that file again while it is still open: it stays in Didn’t move, with its reason (LOOK: Astra max A1 after)');
		// closed in the other app: the next try moves it
		await t.app.tick(t, f, 'f:retrystill');
		await t.app.click(t, f, '[data-c-key="f:retryfile"]');
		await t.app.until(t, f, 'the third try finished', (c) => { const x = window.PJX.np.moved(c); return !!x && !(window.PJX.S.ops || {}).harbor && x.failed.length === 0; }, CHAT, 10000);
		await t.page.waitForTimeout(300);
		const b = await moveRec(f), r2 = await report(f);
		await t.check('closed in the other app, the next try moves it: 13 files, nothing failed', !!b && b.files.length === 13 && b.failed.length === 0 && (r2.fams.Moved || []).some((x) => /^13 files/.test(x)) && !r2.fams['Didn’t move'], JSON.stringify({ b, moved: r2 && r2.fams.Moved }));
	},
	// (A2) Before: Start appended a worker and left Undo open; confirming Undo then removed the Project with its run.
	async 'new work ends conversion Undo: a new Project made from the chat (Astra max A2)'(t) {
		const f = await t.app.open(t);
		const pid = await makeFromPrinter(t, f);
		await t.check('made: the Project from the chat, its Undo open', !!pid && (await off(f, 'f:undochat')) === false, String(pid));
		const picked = await startRun(t, f);
		await t.check('Start a run: Run the tests, under the Project’s choice', /Run the tests/.test(picked.what) && /^Project’s choice/.test(picked.where), JSON.stringify(picked));
		await t.app.until(t, f, 'the run is accepted', (id) => ((window.PJX.get(id) || {}).workers || []).some((x) => x.task === 'Run the tests'), pid, 10000);
		await t.page.waitForTimeout(300);
		const st = await ev(f, (id) => { const p = window.PJX.get(id); return { ended: window.PJX.np.undoEnded(p.fromChatRec) }; }, pid);
		await t.check('the record says Undo ended at the new work, naming it', /new work/.test(st.ended || '') && /Run the tests/.test(st.ended || ''), JSON.stringify(st));
		await t.check('Undo is off', (await off(f, 'f:undochat')) === true);
		const r = await report(f);
		await t.check('the report says why Undo ended', !!r && !!r.undo && r.undo.state === 'ended' && /^Undo has ended: new work .*Run the tests/.test(r.undo.text), JSON.stringify(r && r.undo));
		await t.crop('a2-new', f.locator('.pjxc-flash').first(), 'A Project made from the chat, after Start a run: Undo has ended, and says why (LOOK: Astra max A2 after)');
		// pressed anyway: nothing is undone (before the fix this opened Undo, and confirming it removed the Project)
		await t.app.click(t, f, '[data-c-key="f:undochat"]', { wait: 400 });
		if (await dlgText(f)) { await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { noScroll: true, wait: 400 }); await t.page.waitForTimeout(1500); }
		const after = await ev(f, ([id, c]) => ({ there: !!window.PJX.get(id), converted: (window.PJX.S.world.facts.converted || {})[c] || null }), [pid, CHAT]);
		await t.check('the Project and its run are still there, and the chat is still in it', after.there && after.converted === pid && ((await workers(f, pid)) || []).some((x) => /^Run the tests/.test(x)), JSON.stringify(after));
	},
	async 'new work ends conversion Undo: a chat moved into harbor (Astra max A2)'(t) {
		const f = await t.app.open(t);
		await moveIntoHarbor(t, f);
		await t.check('moved: Undo move is open', (await off(f, 'f:mvundo')) === false);
		await startRun(t, f);
		await t.app.until(t, f, 'harbor’s run is accepted', () => (window.PJX.get('harbor').workers || []).some((x) => x.task === 'Run the tests'), null, 10000);
		await t.page.waitForTimeout(300);
		const a = await moveRec(f);
		await t.check('the move’s record says Undo ended at the new work in harbor', !!a && /new work/.test(a.ended || '') && /harbor/.test(a.ended || '') && /Run the tests/.test(a.ended || ''), JSON.stringify(a && a.ended));
		await t.check('Undo move is off', (await off(f, 'f:mvundo')) === true);
		const r = await report(f);
		await t.check('the report says why', !!r && !!r.undo && r.undo.state === 'ended' && /^Undo has ended: new work .*Run the tests/.test(r.undo.text), JSON.stringify(r && r.undo));
		await t.app.click(t, f, '[data-c-key="f:mvundo"]', { wait: 400 });
		if (await dlgText(f)) { await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { noScroll: true, wait: 400 }); await t.page.waitForTimeout(1500); }
		const still = await ev(f, (c) => !!window.PJX.np.moved(c), CHAT);
		await t.check('the chat and its files stay in harbor', still);
	},
	// (A2) The Undo dialog opens while Start is still being accepted (starting a run takes 600 ms in normal motion); the run
	// is accepted while it is open; confirming it afterwards must not remove the Project with its run. Real presses: the
	// window is tall enough for the report's Undo and Where work runs' Start a run… to be on screen together, and Start and
	// Undo are pressed with the mouse one after the other. The page itself notes, when Undo's dialog appears, whether the
	// run had been accepted yet.
	async 'an Undo opened before the work was accepted can’t remove the Project when confirmed (Astra max A2)'(t) {
		await t.viewport(1920, 2160);
		const f = await t.app.open(t, { reduced: false });
		const pid = await makeFromPrinter(t, f);
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="p:startrun"]', { wait: 350 });
		await t.app.until(t, f, 'Start a run is open', () => /Start a run/.test((document.querySelector('.pjx-dlg') || {}).textContent || ''), null, 6000);
		await t.page.waitForTimeout(300);
		const sb = await f.locator('.pjx-dlg .pjx-btn.is-primary').first().boundingBox(), ub = await f.locator('[data-c-key="f:undochat"]').first().boundingBox();
		const vp = t.page.viewportSize();
		await t.check('Start and the report’s Undo are both on screen', !!sb && !!ub && ub.y > 0 && ub.y + ub.height < vp.height && sb.y > 0 && sb.y + sb.height < vp.height, JSON.stringify({ sb, ub, vp }));
		if (!sb || !ub) return;
		await ev(f, (id) => {
			const R = window.__a2race = { dlgAt: null, acceptedAtDlg: null, acceptedAt: null };
			const has = () => ((window.PJX.get(id) || {}).workers || []).some((x) => x.task === 'Run the tests');
			const mo = new MutationObserver(() => {
				const d = document.querySelector('.pjx-dlg');
				if (R.dlgAt == null && d && /Undo making/.test(d.textContent)) { R.dlgAt = performance.now(); R.acceptedAtDlg = has(); }
				if (R.acceptedAt == null && has()) R.acceptedAt = performance.now();
			});
			mo.observe(document.body, { childList: true, subtree: true });
		}, pid);
		await t.page.mouse.click(sb.x + sb.width / 2, sb.y + sb.height / 2);
		await t.page.mouse.click(ub.x + ub.width / 2, ub.y + ub.height / 2);
		await t.app.until(t, f, 'the run is accepted', (id) => ((window.PJX.get(id) || {}).workers || []).some((x) => x.task === 'Run the tests'), pid, 10000);
		const at = await ev(f, () => window.__a2race);
		await t.check('Undo’s dialog opened before the run was accepted', at.dlgAt != null && at.acceptedAtDlg === false && (at.acceptedAt == null || at.acceptedAt > at.dlgAt), JSON.stringify(at));
		await t.check('Undo’s dialog is still open after the run was accepted', /Undo making/.test((await dlgText(f)) || ''));
		await t.shot('a2-race-dialog', 'Undo’s dialog, opened before Run the tests was accepted, still open after (LOOK: Astra max A2)');
		await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { noScroll: true, wait: 300 });
		await t.page.waitForTimeout(2600);
		const after = await ev(f, ([id, c]) => ({ there: !!window.PJX.get(id), converted: (window.PJX.S.world.facts.converted || {})[c] || null }), [pid, CHAT]);
		await t.check('confirming it removed nothing: the Project, its run and the chat in it are still there', after.there && after.converted === pid && ((await workers(f, pid)) || []).some((x) => /^Run the tests/.test(x)), JSON.stringify(after));
		const said = (await toasts(f)).filter((x) => /Undo has ended/.test(x)).pop() || '';
		await t.check('it says why nothing was undone', /Undo has ended: new work .*Run the tests/.test(said) && /Nothing was undone/.test(said), said);
		await t.viewport(1920, 1080);
	},
	// (A3) Before: the new path's Undo said it "moves its 14 files back" after 12 of 14 were picked; the move's Undo named
	// none of the files that never moved.
	async 'Undo previews the files that moved: 12 of 14 picked, and a partial move (Astra max A3)'(t) {
		const f = await t.app.open(t);
		const pid = await makeFromPrinter(t, f, { leaveOut: ['cups-test.log', 'sample-2.png'] });
		const rec = await ev(f, (id) => window.PJX.get(id).fromChatRec.files.slice(), pid);
		await t.check('12 of 14 files were picked and moved', rec.length === 12 && rec.indexOf('cups-test.log') < 0 && rec.indexOf('sample-2.png') < 0, JSON.stringify(rec));
		await t.app.click(t, f, '[data-c-key="f:undochat"]', { wait: 400 });
		const ud = (await dlgText(f)) || '';
		await t.check('Undo’s preview moves 12 files back, not 14', /moves its 12 files back into the chat folder/.test(ud) && !/14 files/.test(ud), ud);
		await t.check('it names the 2 that never moved, and leaves them alone', /cups-test\.log and sample-2\.png/.test(ud) && /never moved/.test(ud), ud);
		await t.crop('a3-new', f.locator('.pjx-dlg').first(), 'Undo making Fix the printer, 12 of 14 files picked: 12 go back, the 2 left out are named (LOOK: Astra max A3 after)');
		await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { noScroll: true });
		await t.app.until(t, f, 'undone', (id) => !window.PJX.get(id), pid, 10000);
		const done = (await toasts(f)).filter((x) => /is back in No project/.test(x)).pop() || '';
		await t.check('the Undo itself says the 12 files went back', /12 files/.test(done) && !/14 files/.test(done), done);
		// a partial move: 12 moved, label-template.svg didn't, Makefile was the same in harbor
		const g = await t.app.open(t);
		await moveIntoHarbor(t, g, { partial: true });
		await t.app.click(t, g, '[data-c-key="f:mvundo"]', { wait: 400 });
		const um = (await dlgText(g)) || '';
		await t.check('Undo move puts the 12 moved files back', /puts the 12 files back/.test(um), um);
		await t.check('it names the files that never moved: label-template.svg (didn’t move) and Makefile (the same in harbor)', /label-template\.svg/.test(um) && /Makefile/.test(um) && /never moved/.test(um), um);
		await t.crop('a3-move', g.locator('.pjx-dlg').first(), 'Undo moving Fix the printer after a partial move: 12 go back, label-template.svg and Makefile are named (LOOK: Astra max A3 after)');
		await t.app.click(t, g, '.pjx-dlg .pjx-btn', { hasText: 'Cancel', noScroll: true });
	},
	// (A4) Before: with Studio Mac as records home the plan said server_ref "homenas", the Project's files were recorded on
	// This computer, its plate said "This computer · 212 GB free" and the library put it under THIS COMPUTER.
	async 'records home, file holder and default Computer stay apart on each Computer (Astra max A4)'(t) {
		const ON = [['here', 'This computer', '212 GB'], ['homenas', 'Home NAS', '3.1 TB'], ['studio', 'Studio Mac', '640 GB']];
		for (const [id, name, free] of ON) {
			const f = await t.app.open(t);
			const proj = name + ' records witness';
			await t.app.click(t, f, '[data-c-key="lib:new"]', { wait: 300 });
			await t.app.click(t, f, '[data-c-key="way:new"]');
			if (!(await ev(f, () => !!document.querySelector('.pjx-np-sec[data-step="where"][data-state="open"]')))) await t.app.click(t, f, '[data-c-key="sec:where"]', { wait: 300 });
			await f.fill('[data-pjx-key="name"]', proj);
			await t.page.waitForTimeout(250);
			await t.app.click(t, f, '[data-c-key="wk:np:def:here"]');
			await t.app.click(t, f, '[data-c-key="where:runsOn:' + id + '"]');
			const d = await ev(f, () => {
				const s = window.PJX.split.session(), x = window.PJX.np.toPlan(s);
				const rv = {}; document.querySelectorAll('.pjxc-review dt').forEach((dt) => { rv[dt.textContent.trim()] = dt.nextElementSibling.textContent.trim(); });
				return { plan: { records_home: x.records_home, server_mode: x.server_mode, server_ref: x.server_ref, default_computer: x.default_computer, files_holder: x.files_holder || null, local_location: x.local_location }, rv };
			});
			await t.check(name + ': the plan names the records home as its Server, apart from the default Computer', d.plan.records_home === id && d.plan.server_ref === (id === 'here' ? null : id) && d.plan.server_mode === (id === 'here' ? 'this_device' : 'existing_server') && d.plan.default_computer === 'here', JSON.stringify(d.plan));
			await t.check(name + ': the plan says which Computer holds the files', !!d.plan.files_holder && d.plan.files_holder.kind === 'computer' && d.plan.files_holder.ref === id && d.plan.files_holder.name === name, JSON.stringify(d.plan.files_holder));
			await t.check(name + ': the Review says the records home and that place’s room', Object.keys(d.rv).some((k) => /^Records home/.test(k) && d.rv[k].indexOf(name) === 0) && Object.keys(d.rv).some((k) => /^Room/.test(k) && d.rv[k].indexOf(free) === 0) && Object.keys(d.rv).some((k) => /^Default Computer/.test(k) && /^This computer/.test(d.rv[k])), JSON.stringify(d.rv));
			const pr = await ev(f, () => window.PJX.np.firstProblem(window.PJX.split.session()));
			await t.check(name + ': nothing stops Create', !pr, JSON.stringify(pr));
			await t.app.click(t, f, '[data-c-key="rv:go"]', { wait: 400 });
			await t.app.until(t, f, name + ': created', (n) => window.PJX.all().some((p) => p.name === n && p.lifecycle === 'listed') && window.PJX.split.state().mode === 'project', proj, 30000);
			await t.page.waitForTimeout(300);
			const m = await ev(f, (n) => {
				const p = window.PJX.all().find((x) => x.name === n);
				const fact = (plate, k) => ((Array.from(document.querySelectorAll('[data-plate="' + plate + '"] .pmu-fact')).find((x) => x.textContent.trim().indexOf(k) === 0) || {}).querySelector?.('.pmu-factv') || {}).textContent || '';
				const row = document.querySelector('#pjxc .pjxc-row[data-pid="' + p.id + '"]'), grp = row && row.closest('.pjxc-group');
				return { id: p.id, home: p.home, runsOn: p.runsOn, where: p.where, sub: ((document.querySelector('[data-plate="where"] .pmu-cardsub') || {}).textContent || '').trim(), kept: fact('where', 'Kept on').trim(),
					group: grp ? ((grp.querySelector('.pjxc-glabel') || {}).textContent || '').trim() : null, wkHome: fact('work', 'Records home').trim(), wkDef: fact('work', 'Default Computer').trim() };
			}, proj);
			await t.check(name + ': the created Project keeps the records home and the default Computer apart', m.home === id && m.runsOn === 'here', JSON.stringify({ home: m.home, runsOn: m.runsOn }));
			await t.check(name + ': its files are recorded on ' + name, m.where.label === name && m.where.kind === (id === 'here' ? 'local' : 'device') && (id === 'here' || m.where.device === name) && /records witness$/.test(m.where.path), JSON.stringify(m.where));
			await t.check(name + ': Where it lives says ' + name + ' and its room', m.sub.indexOf(name) === 0 && new RegExp('^' + name + ' · (.* · )?' + free.replace('.', '\\.') + ' free$').test(m.kept), JSON.stringify({ sub: m.sub, kept: m.kept }));
			await t.check(name + ': the library lists it under ' + name, (m.group || '').toLowerCase() === name.toLowerCase(), String(m.group));
			await t.check(name + ': Where work runs names the records home and the default Computer apart', m.wkHome.indexOf(name) === 0 && /^This computer/.test(m.wkDef), JSON.stringify({ home: m.wkHome, def: m.wkDef }));
			if (id === 'studio') {
				await t.crop('a4-studio-where', f.locator('[data-plate="where"]').first(), 'Studio Mac as records home: Where it lives says Studio Mac · 640 GB free (LOOK: Astra max A4 after)');
				await t.crop('a4-studio-library', f.locator('#pjxc .pjxc-group[data-device="studio"]').first(), 'The library lists Studio Mac records witness under Studio Mac (LOOK: Astra max A4 after)');
			}
		}
	}
};
