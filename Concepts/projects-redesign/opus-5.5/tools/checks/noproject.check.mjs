// Jared #13: chats with no project are reachable inside the app (ACD-508, ACD-510, ACD-511), and both conversions run
// from there. Every entry point is reached by real presses: no engine call opens a path here.
const NP = (f) => f.evaluate(() => !!document.querySelector('.pjx-npc'));
const menuItems = (f) => f.evaluate(() => Array.from(document.querySelectorAll('.pmr-menu.is-open [role="menuitem"], .pmr-menu.is-open button')).map((b) => b.textContent.trim().replace(/\s+/g, ' ')));
const closeMenu = async (t) => { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(150); };
/* open "Fix the printer" the way a person does: the title bar's project menu, its No project row */
async function openPrinter(t, f) {
	await t.app.page(t, f, 'dashboard');
	await t.app.click(t, f, '#projectMenuBtn', { noScroll: true });
	await t.app.click(t, f, '#projectMenu .pjx-tb-noproj', { noScroll: true, wait: 500 });
	await t.text(f.locator('.pjx-npc .pjx-npc-title').first(), 'Fix the printer');
}
/* History from inside the no-project chat (its own History button), or from PMConcept7's chat header */
async function openHistory(t, f) {
	if (await f.evaluate(() => { const g = document.querySelector('.history-flyout .pjx-npg'); return !!(g && g.getBoundingClientRect().width > 0); })) return t.check('History is open with its No project group', true);
	const inNpc = await NP(f);
	await t.app.click(t, f, inNpc ? '.pjx-npc [data-c-key="npc:history"]' : '#pmw-chat56 .chat-header [data-action="toggle-history"]', { noScroll: true, wait: 700 });
	await t.app.until(t, f, 'History is open with its No project group', () => !!document.querySelector('.history-flyout .pjx-npg'), null, 6000);
}
export const tests = {
	async 'entry points: Home, title bar, chat header, History'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await t.visible(f.locator('#panel-dashboard .pjx-home-newmain'), 'Home has New chat');
		await t.app.click(t, f, '#panel-dashboard .pjx-home-newmain', { noScroll: true });
		const m1 = await menuItems(f);
		await t.check('Home New chat is a split: this project, no project, another project', m1.some((x) => /^In tastebook/.test(x)) && m1.some((x) => /^With no project/.test(x)) && m1.some((x) => /^harbor/.test(x)), m1.join(' / '));
		await t.shot('home-menu', 'Home New chat menu: this project, With no project, another project (LOOK: #13 after)');
		await t.app.menuPick(t, f, 'With no project');
		await t.check('With no project opens a no-project chat draft', await NP(f));
		await t.text(f.locator('.pjx-npc .pjx-npc-place').first(), /No project · This computer/);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-input', { noScroll: true, wait: 100 });
		await t.page.keyboard.type('Sort my tax receipts by year', { delay: 8 });
		await t.app.click(t, f, '.pjx-npc .pjx-npc-send', { noScroll: true, wait: 400 });
		await t.text(f.locator('.pjx-npc .pjx-npc-title').first(), 'Sort my tax receipts by');
		await t.check('the composer is empty after the first send', await f.evaluate(() => document.querySelector('.pjx-npc .pjx-npc-input').value === ''));
		await t.shot('npc-new', 'A new chat with no project after its first message (LOOK)');
		// the title bar's fixed No project row
		await t.app.click(t, f, '#projectMenuBtn', { noScroll: true });
		await t.visible(f.locator('#projectMenu .pjx-tb-noproj'), 'title-bar menu has its fixed No project row');
		await t.shot('titlebar', 'Title-bar project menu with No project (LOOK)');
		await t.app.click(t, f, '#projectMenu .pjx-tb-noproj', { noScroll: true, wait: 500 });
		await t.text(f.locator('.pjx-npc .pjx-npc-title').first(), 'Fix the printer');
		// the chat's header: Make this a project…, More with both named conversions, the Where chip
		await t.visible(f.locator('.pjx-npc .pjx-npc-make'), 'Make this a project… in the chat header');
		await t.app.click(t, f, '.pjx-npc .pjx-npc-more', { noScroll: true });
		const m2 = await menuItems(f);
		await t.check('More offers both named conversions', m2.some((x) => /Make a project from this chat/.test(x)) && m2.some((x) => /Move this chat into a project/.test(x)), m2.join(' / '));
		await closeMenu(t);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-place', { noScroll: true });
		const m3 = await menuItems(f);
		await t.check('Where chip offers both conversions', m3.some((x) => /Make a project from this chat/.test(x)) && m3.some((x) => /Move this chat into a project/.test(x)), m3.join(' / '));
		await t.check('Continue elsewhere says plainly it isn’t here', m3.some((x) => /Not in this concept yet/.test(x)), m3.join(' / '));
		await closeMenu(t);
		// Needs a project: only the Planning Wizard, PRD Builder and Orchestrator
		await t.app.click(t, f, '.pjx-npc [data-c-key="npc:need:orch"]', { noScroll: true });
		await t.text(f.locator('.pjx-npc .pjx-npc-notice').first(), /needs a project/);
		await t.check('the notice offers both conversions and Not now', (await f.locator('.pjx-npc .pjx-npc-notice .pjx-btn').count()) === 3);
		await t.shot('npc-printer', 'Fix the printer: place chip, Make this a project…, waiting approval, Needs a project notice (LOOK)');
		await openHistory(t, f);
		const grp = await f.evaluate(() => { const g = document.querySelector('.history-flyout .pjx-npg'); return g ? Array.from(g.querySelectorAll('.pjx-npg-title b')).map((b) => b.textContent) : null; });
		await t.check('History has a No project group with its chats', !!grp && grp.indexOf('Fix the printer') >= 0 && grp.indexOf('Plan a weekend in Asheville') >= 0, JSON.stringify(grp));
		await t.visible(f.locator('.history-flyout .pjx-npg-new'), 'New chat with no project in the No project group');
		await t.shot('history', 'History sidebar with the No project group (LOOK)');
		await t.page.keyboard.press('Escape');
		await f.evaluate(() => window.PJX.chat.close());
		await t.page.waitForTimeout(300);
		await t.visible(f.locator('#pmw-chat56 .chat-header .pjx-newsplit'), 'the chat header New thread is a split');
		await t.app.click(t, f, '#pmw-chat56 .chat-header .pjx-newsplit', { noScroll: true });
		const m4 = await menuItems(f);
		await t.check('the chat’s New is a split too', m4.some((x) => /^With no project/.test(x)), m4.join(' / '));
		await closeMenu(t);
		await t.audit('chat-surfaces');
	},
	async 'History row More: both conversions by real presses (F1)'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await openHistory(t, f);
		await t.app.click(t, f, '.history-flyout [data-c-key="npg:more:chat-printer"]', { wait: 300 });
		await t.visible(f.locator('.pjx-flymenu'), 'the row menu shows above the flyout');
		await t.visible(f.locator('.pjx-flymenu .pjx-flymenu-item', { hasText: 'Move this chat into a project' }), 'its Move item can be pressed', { fully: true });
		await t.shot('history-row-menu', 'History row More: Open, Make a project from this chat, Move this chat into a project (LOOK: F1 after)');
		await t.app.click(t, f, f.locator('.pjx-flymenu .pjx-flymenu-item', { hasText: 'Move this chat into a project' }), { noScroll: true, wait: 700 });
		await t.app.until(t, f, 'Move this chat into a project opens from the row', () => !!document.querySelector('.pjxc-move'), null, 6000);
		await t.app.page(t, f, 'dashboard');
		await t.check('choosing a conversion closed History', await f.evaluate(() => { const fl = document.querySelector('.history-flyout'); return !fl || fl.getBoundingClientRect().width < 10 || getComputedStyle(fl).visibility === 'hidden' || !document.querySelector('.history-flyout .pjx-npg'); }));
		await openHistory(t, f);
		await t.app.click(t, f, '.history-flyout [data-c-key="npg:more:chat-printer"]', { wait: 300 });
		await t.app.click(t, f, f.locator('.pjx-flymenu .pjx-flymenu-item', { hasText: 'Make a project from this chat' }), { noScroll: true, wait: 700 });
		await t.app.until(t, f, 'Make a project from this chat opens New Project from the row', () => !!document.querySelector('.pjx-np-chat'), null, 6000);
	},
	async 'first message: 10 times, never lost, composer cleared (F2)'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		let ok = 0; const bad = [];
		for (let i = 1; i <= 10; i++) {
			await t.app.click(t, f, '#panel-dashboard .pjx-home-newmain', { noScroll: true, wait: 150 });
			await t.app.menuPick(t, f, 'With no project');
			const msg = 'First message number ' + i;
			await t.app.click(t, f, '.pjx-npc .pjx-npc-input', { noScroll: true, wait: 60 });
			await t.page.keyboard.type(msg, { delay: 5 });
			// press Send the first five times, Enter the other five
			if (i % 2) await t.app.click(t, f, '.pjx-npc .pjx-npc-send', { noScroll: true, wait: 250 }); else { await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(250); }
			const r = await f.evaluate((m) => { const cs = window.PJX.S.world.facts.chats || [], c = cs.find((x) => x.first === m); const v = window.PJX.chat.view(); return { minted: !!c, inChat: !!(c && c.transcript.some((x) => x[0] === 'user' && x[1] === m)), shown: !!(v && c && v.id === c.id), empty: (document.querySelector('.pjx-npc .pjx-npc-input') || {}).value === '', once: cs.filter((x) => x.first === m).length }; }, msg);
			if (r.minted && r.inChat && r.shown && r.empty && r.once === 1) ok++; else bad.push(i + ':' + JSON.stringify(r));
		}
		await t.check('all 10 first messages minted their chat once, are in it, and left the composer empty', ok === 10, bad.join(' | '));
	},
	async 'palette: the title bar search offers the no-project commands'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await t.app.click(t, f, '#tbSearchInput', { noScroll: true });
		await t.page.keyboard.type('project', { delay: 20 });
		await t.page.waitForTimeout(250);
		const items = await f.evaluate(() => Array.from(document.querySelectorAll('#pjx-pal .pjx-pal-item b')).map((b) => b.textContent));
		await t.check('palette lists New chat with no project and both conversions', items.length === 3 && /Make a project from this chat/.test(items[1]) && /Move this chat into a project/.test(items[2]), items.join(' | '));
		await t.shot('palette', 'Title-bar search: the no-project commands (LOOK)');
		await t.page.keyboard.press('ArrowDown'); await t.page.keyboard.press('ArrowDown'); await t.page.keyboard.press('Enter');
		await t.page.waitForTimeout(700);
		await t.check('Enter opens Move this chat into a project', await f.evaluate(() => !!document.querySelector('.pjxc-move')));
	},
	async 'another project: switches to it and opens an empty chat (F4)'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await t.app.click(t, f, '#panel-dashboard .pjx-home-newmain', { noScroll: true });
		await t.app.menuPick(t, f, 'harbor');
		await t.page.waitForTimeout(600);
		await t.text(f.locator('#projectMenuLabel'), 'harbor');
		await t.check('no no-project chat is drawn over it', !(await NP(f)));
	},
	async 'chooser: both choices, neither preselected'(t) {
		const f = await t.app.open(t);
		await openPrinter(t, f);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-make', { noScroll: true, wait: 600 });
		const ch = await f.evaluate(() => Array.from(document.querySelectorAll('.pjx-dlg .pjx-choice')).map((b) => b.textContent.trim().slice(0, 40) + '=' + b.getAttribute('aria-checked')));
		await t.check('two choices with current labels, none checked', ch.length === 2 && /^Make a project from this chat.*=false$/.test(ch[0]) && /^Move this chat into a project.*=false$/.test(ch[1]), ch.join(' | '));
		await t.shot('chooser', 'Make this a project… chooser (LOOK)');
	},
	async 'new path: picked files, approval first, preview, report, Undo boundary (F5)'(t) {
		const f = await t.app.open(t);
		await openPrinter(t, f);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-more', { noScroll: true });
		await t.app.menuPick(t, f, 'Make a project from this chat');
		await t.app.until(t, f, 'New Project from the chat is open', () => !!document.querySelector('.pjx-np-chat'), null, 6000);
		await t.text(f.locator('.pjx-np-chat').first(), /Waiting for your answer/);
		await t.app.click(t, f, '.pjx-np-chat [data-c-key="chat:ap:once"]');
		await t.app.tick(t, f, 'chat:pick:cups-test.log');
		await t.app.tick(t, f, 'chat:pick:sample-2.png');
		await t.text(f.locator('.pjx-np-chat').first(), /12 of 14 files move/);
		const fams = await f.evaluate(() => Array.from(document.querySelectorAll('.pjx-np-chat .pjx-np-convfam')).map((x) => x.getAttribute('data-fam')));
		await t.check('preview has settings, accounts, permissions, active work, online and Undo', fams.join() === 'settings,accounts,perms,work,remote,undo', fams.join());
		await t.shot('newpath', 'New Project from a chat: picked files and the full preview (LOOK)');
		const fp = await f.evaluate(() => { const p = window.PJX.np.firstProblem(window.PJX.split.session()); return p ? p.section + ': ' + p.text : ''; });
		await t.check('nothing left to answer before Create', !fp, fp);
		await t.app.click(t, f, '[data-c-key="rv:go"]');
		await t.app.until(t, f, 'made', () => !!document.querySelector('.pjxc-flash .pjxc-report'), null, 30000);
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /12 files/);
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /held, then resumed/i);
		await t.shot('newpath-done', 'The report after making a project from a chat (LOOK)');
		// a real message in the moved chat ends Undo, and the page says why
		await t.app.click(t, f, '[data-c-key="f:openchat"]', { wait: 600 });
		await t.text(f.locator('.pjx-npc .pjx-npc-place').first(), /In Fix the printer/);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-input', { noScroll: true, wait: 60 });
		await t.page.keyboard.type('Also print the address labels', { delay: 5 });
		await t.page.keyboard.press('Enter');
		await t.page.waitForTimeout(400);
		await t.check('a real message ends Undo', await f.evaluate(() => document.querySelector('[data-c-key="f:undochat"]').getAttribute('aria-disabled') === 'true'));
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /Undo has ended: a new message was sent/);
		await t.shot('undo-ended', 'Undo ended by a real message in the moved chat (LOOK: F5 after)');
	},
	async 'existing path: blockers settled in place, preview, partial report, clock ends Undo (F5)'(t) {
		const f = await t.app.open(t);
		await openPrinter(t, f);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-place', { noScroll: true });
		await t.app.menuPick(t, f, 'Move this chat into a project');
		await t.app.until(t, f, 'the move is open', () => !!document.querySelector('.pjxc-move'), null, 6000);
		await t.app.click(t, f, '[data-c-key="mv:target:This-computer:harbor"]');
		await t.check('waiting approval blocks first', await f.evaluate(() => document.querySelector('.pjxc-mvblock') && document.querySelector('.pjxc-mvblock').getAttribute('data-block') === 'approval'));
		await t.app.click(t, f, '[data-c-key="mv:ap:once"]');
		await t.check('unsaved work in harbor blocks next', await f.evaluate(() => document.querySelector('.pjxc-mvblock') && document.querySelector('.pjxc-mvblock').getAttribute('data-block') === 'unsaved'));
		await t.shot('move-blocked', 'Move into harbor: unsaved README.md blocks, with Save and Discard in place (LOOK)');
		await t.app.click(t, f, '[data-c-key="mv:unsaved:save"]');
		await t.check('no blocker left', await f.evaluate(() => !document.querySelector('.pjxc-mvblock')));
		const fams = await f.evaluate(() => Array.from(document.querySelectorAll('.pjxc-mvreview .pjx-np-convfam')).map((x) => x.getAttribute('data-fam')));
		await t.check('move preview has every family', fams.join() === 'settings,accounts,perms,work,remote,undo', fams.join());
		await t.app.tick(t, f, 'mv:demopartial');
		await t.app.click(t, f, '[data-c-key="mv:go"]');
		await t.app.until(t, f, 'moved', () => !!document.querySelector('.pjxc-flash .pjxc-report'), null, 30000);
		await t.text(f.locator('.pjxc-flash').first(), /except 1 file/);
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /didn’t move/i);
		await t.shot('move-partial', 'Partial move report with Try again and the Undo boundary (LOOK)');
		await t.app.click(t, f, '[data-c-key="f:enddemo:clock"]');
		await t.check('the deadline passing ends Undo', await f.evaluate(() => document.querySelector('[data-c-key="f:mvundo"]').getAttribute('aria-disabled') === 'true'));
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /Undo has ended: 7 days passed/);
	},
	async 'git identity blocker on Home NAS'(t) {
		const f = await t.app.open(t);
		await openPrinter(t, f);
		await t.app.click(t, f, '[data-c-key="npc:ap:once"]', { noScroll: true });
		await t.app.click(t, f, '.pjx-npc .pjx-npc-more', { noScroll: true });
		await t.app.menuPick(t, f, 'Move this chat into a project');
		await t.app.until(t, f, 'the move is open', () => !!document.querySelector('.pjxc-move'), null, 6000);
		await t.app.click(t, f, '[data-c-key="mv:target:Home-NAS:photo-sorter"]');
		await t.check('photo-sorter on Home NAS asks for Git name and email', await f.evaluate(() => (document.querySelector('.pjxc-mvblock') || {}).getAttribute && document.querySelector('.pjxc-mvblock').getAttribute('data-block') === 'gitid'));
	}
};
