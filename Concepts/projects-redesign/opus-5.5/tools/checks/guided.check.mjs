// GUIDED-FLOWS-CHECK "Changes for P": the flows this concept carries, against current canon and onboarding.
const sess = (f, fn, arg) => f.evaluate(fn, arg);
export const tests = {
	async 'restore: Kit first, reach, unlock, then a recovery point (2.32 to 2.34)'(t) {
		const f = await t.app.open(t);
		await t.app.click(t, f, '[data-c-key="lib:new"]', { wait: 300 });
		await t.app.click(t, f, '[data-c-key="way:restore"]');
		const first = await sess(f, () => Array.from(document.querySelectorAll('[data-np-group="restore:kit"] .pjx-choice')).map((b) => b.getAttribute('data-v')));
		await t.check('the Kit file comes first, with an explicit no-Kit choice', first.join() === 'kit-loom,kit-laptop,none', first.join());
		await t.app.click(t, f, '[data-c-key="restore:kit:kit-loom"]');
		const p1 = await sess(f, () => window.PJX.np.problem(window.PJX.split.session(), 'restore').text);
		await t.check('nothing is signed in or listed before Home NAS is reached', /Reach Home NAS/.test(p1), p1);
		await t.app.click(t, f, '[data-c-key="reach"]', { wait: 1200 });
		await t.app.click(t, f, '[data-c-key="kitopen"]', { wait: 1200 });
		await t.app.until(t, f, 'the backup is listed after reach and unlock', () => !!document.querySelector('[data-np-group="restore:pick"]'), null, 8000);
		await t.app.click(t, f, '[data-c-key="restore:pick:loom"]');
		const pts = await sess(f, () => document.querySelectorAll('[data-np-group="restore:point"] .pjx-choice').length);
		await t.check('a specific copy is chosen, with what it covers', pts === 4, String(pts));
		await t.app.click(t, f, '[data-c-key="restore:point:p1"]');
		const p2 = await sess(f, () => window.PJX.np.problem(window.PJX.split.session(), 'restore'));
		await t.check('restore section is done', !p2, JSON.stringify(p2));
		await t.shot('restore', 'Restore: Kit, reached, unlocked, Project and recovery point (LOOK)');
	},
	async 'devices: pairing, SSH off, username and key states (2.07, 2.11, 2.13)'(t) {
		const f = await t.app.open(t);
		await t.app.moment(t, 'newdevice');
		await t.page.waitForTimeout(500);
		await t.app.click(t, f, '[data-c-key="device:found:garage"]');
		await t.check('a device that runs Puppet Master is paired with', await sess(f, () => !!document.querySelector('[data-c-key="pair:go"]') && !!document.querySelector('[data-c-key="pair:ssh"]')));
		await t.shot('pair', 'Pair with Garage Pi, SSH one press away (LOOK)');
		await t.app.click(t, f, '[data-c-key="device:found:den"]');
		await t.check('SSH off: the brand’s own setting, Check again and the shared folder', await sess(f, () => /Control Panel › Terminal/.test(document.querySelector('.pjx-np-device').textContent) && !!document.querySelector('[data-c-key="sshoff:again"]') && !!document.querySelector('[data-c-key="sshoff:share"]')));
		await t.app.click(t, f, '[data-c-key="device:found:office"]');
		await t.app.click(t, f, '[data-c-key="conn:yes"]');
		const before = await sess(f, () => document.querySelector('[data-np-group="conn:key"]').textContent);
		await t.check('keys wait for the username', /Type your username first/.test(before), before.slice(0, 200));
		await f.fill('[data-pjx-key="devUser"]', 'jared');
		await t.page.waitForTimeout(250);
		const after = await sess(f, () => document.querySelector('[data-np-group="conn:key"]').textContent);
		await t.check('each key as it is on Office PC', /Already works on Office PC/.test(after) && /Locked with a passphrase/.test(after), after.slice(0, 300));
		await t.shot('keys', 'Connect Office PC: username first, then each key’s state (LOOK)');
	},
	async 'contribution: getting the latest pauses on a clash, with its resolution path (6.07, F6)'(t) {
		const f = await t.app.open(t);
		await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="photo-sorter"]', { wait: 400 });
		await t.app.tick(t, f, 'pg:clashdemo');
		await t.app.click(t, f, '[data-c-key="p:getorig"]');
		await t.app.until(t, f, 'it paused on the clash', () => !!document.querySelector('[data-c-key="p:settle"]'), null, 10000);
		await t.check('the notice says it paused and offers Settle it… and Put everything back', await f.evaluate(() => /Getting the latest paused/.test(document.querySelector('.pjxc-band').textContent) && /Settle it/.test(document.querySelector('.pjxc-band').textContent) && /Put everything back/.test(document.querySelector('.pjxc-band').textContent)));
		await t.app.click(t, f, '[data-c-key="p:settle"]', { wait: 400 });
		await t.text(f.locator('.pjx-dlg').first(), /sorter\/rules\.py/);
		await t.shot('clash', 'Settle the clash in sorter/rules.py: keep yours, take the original’s, or merge by hand (LOOK: F6 after)');
		await t.app.click(t, f, '.pjx-dlg [data-c-key="cf:how:theirs"]', { noScroll: true });
		await t.app.click(t, f, f.locator('.pjx-dlg .pjx-btn', { hasText: 'Settle and continue' }), { noScroll: true, wait: 300 });
		await t.app.until(t, f, 'settled: the rest came in, nothing sent', () => !document.querySelector('[data-c-key="p:settle"]') && /4 not sent yet/.test(document.querySelector('[data-plate="online"]').textContent), null, 10000);
	},
	async 'engine rules (2.38, 3.05, 3.07, 3.12, 4.17, 5.12)'(t) {
		const f = await t.app.open(t);
		const r = await sess(f, () => {
			const NP = window.PJX.np, R = window.PJX.rules, E = window.PJX.ENV;
			const out = {};
			out.partial = NP.inspectAt('here', '~/Nowhere/never-seen').partial === true && NP.inspectAt('here', '~/Nowhere/never-seen', 1).partial !== true;
			out.label = E.kinds.find((k) => k[0] === 'notifications_usage_budgets')[1];
			const s = NP.start({ way: 'new', like: 'tastebook' });
			s.d.like.fixed = true; s.d.like.kinds = { notifications_usage_budgets: false };
			out.fixed = NP.likeSel(s).same.join(',');
			const s2 = NP.start({ way: 'new', like: 'harbor' }); s2.d.runsOn = 'homenas';
			out.copilot = (NP.accountRows(s2).find((x) => x.id === 'copilot') || {}).state;
			// (F7) every Computer allowed to do the work is checked for each account, not only the default Computer
			const s3 = NP.start({ way: 'new', like: 'tastebook' }); s3.d.work.allowed = { homenas: true };
			const codex = NP.accountRows(s3).find((x) => x.id === 'codex') || {};
			out.codex = codex.word + ' | per: ' + (codex.per || []).map((x) => x.c + '=' + x.state).join(',');
			const fo = R.visibility('forgejo', 'own', { id: 'home', label: 'home', kind: 'organization', profile: 'limited' }, null, 'git.home.arpa').map((x) => x.title);
			out.forgejo = fo.join('|');
			return out;
		});
		await t.check('an unread folder is partial until looked at again', r.partial);
		await t.check('Notifications & limits', r.label === 'Notifications & limits', r.label);
		await t.check('a cleared kind keeps its fixed values out', !/notifications/.test(r.fixed) && /assistant\.chat/.test(r.fixed), r.fixed);
		await t.check('a device-bound account cannot move', r.copilot === 'cannot_move', r.copilot);
		await t.check('accounts are checked on every allowed Computer', /Home NAS/.test(r.codex) && /here=ready_here/.test(r.codex) && /homenas=sign_in_there/.test(r.codex), r.codex);
		await t.check('Forgejo stays Public or Private', /Public/.test(r.forgejo) && !/Internal|signed in to/.test(r.forgejo), r.forgejo);
		const id = await sess(f, async () => {
			const NP = window.PJX.np, s = NP.start({ way: 'folder', folder: '~/Code/dotfiles' });
			s.d.runsOn = 'homenas'; s.d.backup.dest = 'server'; s.d.backup.sub = 'sftp';
			const res = {};
			for (const host of ['diskstation.local', 'mystery-box.local', 'backup.example.net']) {
				s.d.backup.acc = { address: 'sftp://' + host + '/backups' };
				NP.problem(s, 'backup');
				await new Promise((r) => setTimeout(r, 900));
				const p = NP.problem(s, 'backup'); res[host] = !p ? 'ok' : p.blocked ? 'blocked' : /can’t confirm/.test(p.text) ? 'unresolved' : 'other';
			}
			return res;
		});
		await t.check('NAS identity is the owner’s check: alias blocked, unknown unresolved, a remote host fine', id['diskstation.local'] === 'blocked' && id['mystery-box.local'] === 'unresolved' && /^(ok|other)$/.test(id['backup.example.net']), JSON.stringify(id));
	}
};
