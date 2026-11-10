// Jared #13: chats with no project are reachable inside the app (ACD-508, ACD-510), and both conversions run from there.
const NP = (f) => f.evaluate(() => !!document.querySelector('#pmw-chat56 .chat-stage > .pjx-npc'));
const menuItems = (f) => f.evaluate(() => Array.from(document.querySelectorAll('.pmr-menu.is-open [role="menuitem"], .pmr-menu.is-open button')).map((b) => b.textContent.trim().replace(/\s+/g, ' ')));
const closeMenu = async (t) => { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(150); };
export const tests = {
	async 'entry points: Home, title bar, chat header, History'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await t.shot('home-before-click', 'Home board bar with New chat and With no project (LOOK: #13 after)');
		await t.visible(f.locator('#panel-dashboard .pjx-home-newmain'), 'Home has New chat');
		await t.app.click(t, f, '#panel-dashboard .pjx-home-newmain');
		await t.page.waitForTimeout(250);
		const m1 = await menuItems(f);
		await t.check('Home New chat is a split: this project, no project, another project', m1.some((x) => /^In tastebook/.test(x)) && m1.some((x) => /^With no project/.test(x)) && m1.some((x) => /^harbor/.test(x)), m1.join(' / '));
		await t.shot('home-menu', 'Home New chat menu: this project, With no project, another project (LOOK: #13 after)');
		await t.app.menuPick(t, f, 'With no project');
		await t.check('With no project opens a no-project chat draft', await NP(f));
		await t.text(f.locator('.pjx-npc .pjx-npc-place').first(), /No project · This computer/);
		await f.fill('.pjx-npc .pjx-npc-input', 'Sort my tax receipts by year');
		await t.app.click(t, f, '.pjx-npc .pjx-npc-send', { wait: 400 });
		await t.page.waitForTimeout(300);
		await t.text(f.locator('.pjx-npc .pjx-npc-title').first(), 'Sort my tax receipts by');
		await t.shot('npc-new', 'A new chat with no project after its first message (LOOK)');
		// the title bar's fixed No project row
		await t.app.click(t, f, '#projectMenuBtn');
		await t.page.waitForTimeout(250);
		await t.visible(f.locator('#projectMenu .pjx-tb-noproj'), 'title-bar menu has its fixed No project row');
		await t.shot('titlebar', 'Title-bar project menu with No project (LOOK)');
		await t.app.click(t, f, '#projectMenu .pjx-tb-noproj');
		await t.page.waitForTimeout(400);
		await t.text(f.locator('.pjx-npc .pjx-npc-title').first(), 'Fix the printer');
		// the chat's header: Make this a project…, More with both named conversions, the Where chip
		await t.visible(f.locator('.pjx-npc .pjx-npc-make'), 'Make this a project… in the chat header');
		await t.app.click(t, f, '.pjx-npc .pjx-npc-more');
		await t.page.waitForTimeout(250);
		const m2 = await menuItems(f);
		await t.check('More offers both named conversions', m2.some((x) => /Make a project from this chat/.test(x)) && m2.some((x) => /Move this chat into a project/.test(x)), m2.join(' / '));
		await closeMenu(t);
		await t.app.click(t, f, '.pjx-npc .pjx-npc-place');
		await t.page.waitForTimeout(250);
		const m3 = await menuItems(f);
		await t.check('Where chip offers both conversions', m3.some((x) => /Make a project from this chat/.test(x)) && m3.some((x) => /Move this chat into a project/.test(x)), m3.join(' / '));
		await closeMenu(t);
		// Needs a project: only the Planning Wizard, PRD Builder and Orchestrator
		await t.app.click(t, f, '.pjx-npc [data-c-key="npc:need:orch"]');
		await t.page.waitForTimeout(200);
		await t.text(f.locator('.pjx-npc .pjx-npc-notice').first(), /needs a project/);
		await t.check('the notice offers both conversions and Not now', (await f.locator('.pjx-npc .pjx-npc-notice .pjx-btn').count()) === 3);
		await t.shot('npc-printer', 'Fix the printer: place chip, Make this a project…, waiting approval, Needs a project notice (LOOK)');
		// History: the No project group and its rows' More
		await t.app.click(t, f, '.pjx-npc [data-c-key="npc:history"]', { wait: 700 });
		await t.page.waitForTimeout(600);
		const grp = await f.evaluate(() => { const g = document.querySelector('.history-flyout .pjx-npg'); return g ? Array.from(g.querySelectorAll('.pjx-npg-title b')).map((b) => b.textContent) : null; });
		await t.check('History has a No project group with its chats', !!grp && grp.indexOf('Fix the printer') >= 0 && grp.indexOf('Plan a weekend in Asheville') >= 0, JSON.stringify(grp));
		await t.visible(f.locator('.history-flyout .pjx-npg-new'), 'New chat with no project in the No project group');
		await t.shot('history', 'History sidebar with the No project group (LOOK)');
		await t.page.keyboard.press('Escape');
		await f.evaluate(() => window.PJX.chat.close());
		await t.page.waitForTimeout(300);
		await t.visible(f.locator('#pmw-chat56 .chat-header .pjx-newsplit'), 'the chat header New thread is a split');
		await t.app.click(t, f, '#pmw-chat56 .chat-header .pjx-newsplit');
		const m4 = await menuItems(f);
		await t.check('the chat’s New is a split too', m4.some((x) => /^With no project/.test(x)), m4.join(' / '));
		await closeMenu(t);
		await t.audit('chat-surfaces');
	},
	async 'palette: the title bar search offers the no-project commands'(t) {
		const f = await t.app.open(t);
		await t.app.page(t, f, 'dashboard');
		await t.app.click(t, f, '#tbSearchInput');
		await t.page.keyboard.type('project', { delay: 20 });
		await t.page.waitForTimeout(250);
		const items = await f.evaluate(() => Array.from(document.querySelectorAll('#pjx-pal .pjx-pal-item b')).map((b) => b.textContent));
		await t.check('palette lists New chat with no project and both conversions', items.length === 3 && /Make a project from this chat/.test(items[1]) && /Move this chat into a project/.test(items[2]), items.join(' | '));
		await t.shot('palette', 'Title-bar search: the no-project commands (LOOK)');
		await t.page.keyboard.press('ArrowDown'); await t.page.keyboard.press('ArrowDown'); await t.page.keyboard.press('Enter');
		await t.page.waitForTimeout(700);
		await t.check('Enter opens Move this chat into a project', await f.evaluate(() => !!document.querySelector('.pjxc-move')));
	},
	async 'chooser: both choices, neither preselected'(t) {
		const f = await t.app.open(t);
		await f.evaluate(() => window.PJX.chat.go('chooser', 'chat-printer'));
		await t.page.waitForTimeout(500);
		const ch = await f.evaluate(() => Array.from(document.querySelectorAll('.pjx-dlg .pjx-choice')).map((b) => b.textContent.trim().slice(0, 40) + '=' + b.getAttribute('aria-checked')));
		await t.check('two choices with current labels, none checked', ch.length === 2 && /^Make a project from this chat.*=false$/.test(ch[0]) && /^Move this chat into a project.*=false$/.test(ch[1]), ch.join(' | '));
		await t.shot('chooser', 'Make this a project… chooser (LOOK)');
	},
	async 'new path: picked files, approval first, preview, report, Undo boundary'(t) {
		const f = await t.app.open(t);
		await f.evaluate(() => window.PJX.chat.go('new', 'chat-printer'));
		await t.page.waitForTimeout(600);
		await t.text(f.locator('.pjx-np-chat').first(), /Answer|Waiting for your answer/);
		await t.app.click(t, f, '.pjx-np-chat [data-c-key="chat:ap:once"]');
		await t.page.waitForTimeout(150);
		await t.app.tick(t, f, 'chat:pick:cups-test.log');
		await t.app.tick(t, f, 'chat:pick:sample-2.png');
		await t.page.waitForTimeout(150);
		await t.text(f.locator('.pjx-np-chat').first(), /12 of 14 files move/);
		const fams = await f.evaluate(() => Array.from(document.querySelectorAll('.pjx-np-chat .pjx-np-convfam')).map((x) => x.getAttribute('data-fam')));
		await t.check('preview has settings, accounts, permissions, active work, online and Undo', fams.join() === 'settings,accounts,perms,work,remote,undo', fams.join());
		await t.shot('newpath', 'New Project from a chat: picked files and the full preview (LOOK)');
		await f.evaluate(() => { const s = window.PJX.split.session(); window.PJX.np.set(s, 'backup.dest', 'none'); });
		const fp = await f.evaluate(() => { const p = window.PJX.np.firstProblem(window.PJX.split.session()); return p ? p.section + ': ' + p.text : ''; });
		await t.check('nothing left to answer before Create', !fp, fp);
		await t.app.click(t, f, '[data-c-key="rv:go"]');
		await t.app.until(t, f, 'made', () => !!document.querySelector('.pjxc-flash .pjxc-report'), null, 30000);
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /12 files/);
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /held, then resumed/i);
		await t.shot('newpath-done', 'The report after making a project from a chat (LOOK)');
		await t.app.click(t, f, '[data-c-key="f:enddemo:msg"]');
		await t.page.waitForTimeout(200);
		await t.check('Undo ends at the first new message', await f.evaluate(() => document.querySelector('[data-c-key="f:undochat"]').getAttribute('aria-disabled') === 'true'));
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /Undo has ended: a new message was sent/);
	},
	async 'existing path: blockers settled in place, preview, partial report'(t) {
		const f = await t.app.open(t);
		await f.evaluate(() => window.PJX.chat.go('move', 'chat-printer'));
		await t.page.waitForTimeout(600);
		await t.app.click(t, f, '[data-c-key="mv:target:This-computer:harbor"]');
		await t.page.waitForTimeout(200);
		await t.check('waiting approval blocks first', await f.evaluate(() => document.querySelector('.pjxc-mvblock') && document.querySelector('.pjxc-mvblock').getAttribute('data-block') === 'approval'));
		await t.app.click(t, f, '[data-c-key="mv:ap:once"]');
		await t.page.waitForTimeout(200);
		await t.check('unsaved work in harbor blocks next', await f.evaluate(() => document.querySelector('.pjxc-mvblock') && document.querySelector('.pjxc-mvblock').getAttribute('data-block') === 'unsaved'));
		await t.shot('move-blocked', 'Move into harbor: unsaved README.md blocks, with Save and Discard in place (LOOK)');
		await t.app.click(t, f, '[data-c-key="mv:unsaved:save"]');
		await t.page.waitForTimeout(200);
		await t.check('no blocker left', await f.evaluate(() => !document.querySelector('.pjxc-mvblock')));
		const fams = await f.evaluate(() => Array.from(document.querySelectorAll('.pjxc-mvreview .pjx-np-convfam')).map((x) => x.getAttribute('data-fam')));
		await t.check('move preview has every family', fams.join() === 'settings,accounts,perms,work,remote,undo', fams.join());
		await t.app.tick(t, f, 'mv:demopartial');
		await t.page.waitForTimeout(150);
		await t.app.click(t, f, '[data-c-key="mv:go"]');
		await t.app.until(t, f, 'moved', () => !!document.querySelector('.pjxc-flash .pjxc-report'), null, 30000);
		await t.text(f.locator('.pjxc-flash').first(), /except 1 file/);
		await t.text(f.locator('.pjxc-flash .pjxc-report').first(), /didn’t move/i);
		await t.shot('move-partial', 'Partial move report with Try again and the Undo boundary (LOOK)');
	},
	async 'git identity blocker on Home NAS'(t) {
		const f = await t.app.open(t);
		await f.evaluate(() => { window.PJX.S.world.facts.approvals['a-lpadmin'] = 'allowed'; window.PJX.chat.go('move', 'chat-printer'); });
		await t.page.waitForTimeout(600);
		await t.app.click(t, f, '[data-c-key="mv:target:Home-NAS:photo-sorter"]');
		await t.page.waitForTimeout(200);
		await t.check('photo-sorter on Home NAS asks for Git name and email', await f.evaluate(() => (document.querySelector('.pjxc-mvblock') || {}).getAttribute && document.querySelector('.pjxc-mvblock').getAttribute('data-block') === 'gitid'));
		await t.app.click(t, f, '[data-c-key="mv:gid:set"]');
	}
};
