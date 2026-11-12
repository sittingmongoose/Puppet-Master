// GUIDED-FLOWS-CHECK "Changes for P": the flows this concept carries, against current canon and onboarding.
const sess = (f, fn, arg) => f.evaluate(fn, arg);
/* open a guided section by its head, only if it isn't open already (pressing an open head folds it) */
async function openSec(t, f, id) {
	const st = await f.evaluate((id) => ((document.querySelector('.pjx-np-sec[data-step="' + id + '"]') || {}).getAttribute?.('data-state')) || null, id);
	if (st !== 'open') await t.app.click(t, f, '[data-c-key="sec:' + id + '"]');
	await t.app.until(t, f, 'section ' + id + ' is open', (id) => ((document.querySelector('.pjx-np-sec[data-step="' + id + '"]') || {}).getAttribute?.('data-state')) === 'open', id, 8000);
}
/* the Review's row by its label */
const rvRow = (f, label) => f.evaluate((label) => { const dt = Array.from(document.querySelectorAll('.pjxc-review dt')).find((x) => x.textContent.trim().indexOf(label) === 0); return dt && dt.nextElementSibling ? dt.nextElementSibling.textContent : null; }, label);
/* (Sol max S4) what the copy-settings Advanced shows against what the copy selection holds */
const likeState = (f) => f.evaluate(() => {
	const s = window.PJX.split.session(), NP = window.PJX.np, sel = NP.likeSel(s), c = NP.likeCounts(s);
	const inp = (k) => document.querySelector('input[data-c-key="' + k + '"]');
	const sub = (k) => { const i = inp(k); const x = i && i.closest('label').querySelector('.pjx-np-check-sub'); return x ? x.textContent : ''; };
	const on = (k) => { const i = inp(k); return !!i && i.checked && !i.disabled; };
	// every checked, enabled setting row on screen must be in the copy, and nothing else
	const shownOwn = Array.from(document.querySelectorAll('input[data-c-key^="like:id:"]')).filter((i) => i.checked && !i.disabled).map((i) => i.getAttribute('data-c-key').slice(8));
	const shownSame = Array.from(document.querySelectorAll('input[data-c-key^="like:same:"]')).filter((i) => i.checked && !i.disabled).map((i) => i.getAttribute('data-c-key').slice(10));
	const tot = ((document.querySelector('.pjx-np-totals') || {}).textContent || ''), n = /(\d+) settings?\b/.exec(tot);
	return { theme: on('like:id:general.visual.theme'), themeIn: sel.settings.indexOf('general.visual.theme') >= 0, kind: on('like:kind:appearance_workspace'), kindMixed: !!(inp('like:kind:appearance_workspace') || {}).indeterminate, kindSub: sub('like:kind:appearance_workspace'),
		runFin: on('like:same:notifications.desktop.run-finished'), runFinIn: sel.same.indexOf('notifications.desktop.run-finished') >= 0, nKind: on('like:kind:notifications_usage_budgets'), nKindSub: sub('like:kind:notifications_usage_budgets'),
		shownOwn: shownOwn.sort().join(), selOwn: sel.settings.slice().sort().join(), shownSame: shownSame.sort().join(), selSame: sel.same.slice().sort().join(), totals: n ? Number(n[1]) : null, own: c.own, fromComputer: c.fromComputer };
});
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
		// (r1b) a part with nothing to say is left out, never written as the text "null" (photo-sorter is Git: no Jujutsu line)
		const nulls = await f.evaluate(() => { const out = [], tw = document.createTreeWalker(document.querySelector('.pjx-dlg'), NodeFilter.SHOW_TEXT); for (let n = tw.nextNode(); n; n = tw.nextNode()) if (/^\s*(null|undefined)\s*$/.test(n.nodeValue)) out.push(n.parentElement.className || n.parentElement.tagName); return out; });
		await t.check('the clash dialog has no text node reading "null"', nulls.length === 0, nulls.join(' | '));
		const gaps = await f.evaluate(() => { const kids = Array.from(document.querySelector('.pjx-dlg .pjx-dlg-body > div').children).filter((e) => e.getBoundingClientRect().height > 0); return kids.slice(1).map((e, i) => Math.round(e.getBoundingClientRect().top - kids[i].getBoundingClientRect().bottom)); });
		await t.check('the lead, the choices and Nothing is sent… stand apart', gaps.length >= 2 && gaps.every((g) => g >= 8), JSON.stringify(gaps));
		await t.shot('clash', 'Settle the clash in sorter/rules.py: keep yours, take the original’s, or merge by hand (LOOK: F6 after)');
		await t.app.click(t, f, '.pjx-dlg [data-c-key="cf:how:theirs"]', { noScroll: true });
		await t.app.click(t, f, f.locator('.pjx-dlg .pjx-btn', { hasText: 'Settle and continue' }), { noScroll: true, wait: 300 });
		await t.app.until(t, f, 'settled: the rest came in, nothing sent', () => !document.querySelector('[data-c-key="p:settle"]') && /4 not sent yet/.test(document.querySelector('[data-plate="online"]').textContent), null, 10000);
	},
	async 'Check the Recovery Kit: no part reads "null" (r1b)'(t) {
		const f = await t.app.open(t);
		await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="tastebook"]', { wait: 400 });
		await t.app.click(t, f, '[data-plate="backup"] [data-c-key="p:kit"]', { wait: 400 });
		await t.text(f.locator('.pjx-dlg').first(), /Recovery Kit|kit/i);
		const nulls = await f.evaluate(() => { const out = [], tw = document.createTreeWalker(document.querySelector('.pjx-dlg'), NodeFilter.SHOW_TEXT); for (let n = tw.nextNode(); n; n = tw.nextNode()) if (/^\s*(null|undefined)\s*$/.test(n.nodeValue)) out.push(n.parentElement.className || n.parentElement.tagName); return out; });
		await t.check('the Check the Kit dialog has no text node reading "null"', nulls.length === 0, nulls.join(' | '));
		await t.page.keyboard.press('Escape');
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
	},
	// (Sol max S2, 2026-11-12) PWIZ-025, BRS-019: the copy the person chose, and what it covers, is the copy restored. It
	// reaches the folded section, the Review, the plan, the steps and the result; it clears when its source changes, and
	// nothing falls back to the newest copy by itself.
	async 'restore: the chosen copy reaches the summary, Review, plan and result (Sol max S2)'(t) {
		const f = await t.app.open(t);
		await t.app.click(t, f, '[data-c-key="lib:new"]', { wait: 300 });
		await t.app.click(t, f, '[data-c-key="way:restore"]');
		await t.app.click(t, f, '[data-c-key="restore:kit:kit-loom"]');
		await t.app.click(t, f, '[data-c-key="reach"]', { wait: 1200 });
		await t.app.click(t, f, '[data-c-key="kitopen"]', { wait: 1200 });
		await t.app.until(t, f, 'the backup is listed', () => !!document.querySelector('[data-np-group="restore:pick"]'), null, 8000);
		await t.app.click(t, f, '[data-c-key="restore:pick:loom"]');
		await t.app.click(t, f, '[data-c-key="restore:point:p3"]');
		// a change of source clears the choice: another Project's copies are other copies
		await t.app.click(t, f, '[data-c-key="restore:pick:tastebook"]');
		const cleared = await sess(f, () => { const s = window.PJX.split.session(); return { point: s.d.restore.point, plan: (window.PJX.np.toPlan(s).restore_point || null), checked: !!document.querySelector('[data-np-group="restore:point"] [aria-checked="true"]') }; });
		await t.check('choosing another Project clears the chosen copy', cleared.point === null && cleared.plan === null && !cleared.checked, JSON.stringify(cleared));
		await t.app.click(t, f, '[data-c-key="restore:pick:loom"]');
		await t.app.click(t, f, '[data-c-key="restore:point:p3"]');
		await t.app.click(t, f, '[data-c-key="sec:restore:go"]', { wait: 300 });
		const sum = await sess(f, () => ((document.querySelector('.pjx-np-sec[data-step="restore"] .pjx-np-sum') || {}).textContent || ''));
		await t.check('the folded restore section names the chosen copy, never the newest', /Sep 30 · kept monthly/.test(sum) && !/Today, 3:00 AM/.test(sum), sum);
		const begins = await rvRow(f, 'Begins'), copy = await rvRow(f, 'Copy');
		await t.check('the Review says which copy and what it covers', /Sep 30 · kept monthly/.test(begins || '') && /Sep 30 · kept monthly/.test(copy || '') && /history up to then/.test(copy || ''), begins + ' || ' + copy);
		const plan = await sess(f, () => { const s = window.PJX.split.session(), NP = window.PJX.np; return { point: NP.toPlan(s).restore_point || null, steps: NP.phases(s).map((x) => x.label) }; });
		await t.check('the plan carries the chosen copy and its coverage', !!plan.point && plan.point.id === 'p3' && plan.point.when === 'Sep 30 · kept monthly' && /history up to then/.test(plan.point.covers || '') && plan.point.project === 'loom', JSON.stringify(plan.point));
		await t.check('the restore steps name the chosen copy', plan.steps.some((x) => /Sep 30 · kept monthly/.test(x)) && !plan.steps.some((x) => /Today, 3:00 AM/.test(x)), plan.steps.join(' | '));
		await t.crop('s2-section', f.locator('.pjx-np-sec[data-step="restore"]').first(), 'The folded restore section names the chosen copy, Sep 30 · kept monthly (LOOK: Sol max S2 after)');
		await t.crop('s2-review', f.locator('.pjxc-review .pjxc-rgroup').first(), 'The Review’s Project group: Begins as and Copy name Sep 30 · kept monthly and what it covers (LOOK: Sol max S2 after)');
		await t.app.click(t, f, '[data-c-key="rv:go"]', { wait: 400 });
		await t.app.until(t, f, 'restored', () => { const c = window.PJX.split.state(); return c && c.mode === 'project' && !c.commit && !!window.PJX.get(c.sel) && window.PJX.get(c.sel).fresh; }, null, 30000);
		const res = await sess(f, () => { const c = window.PJX.split.state(), p = window.PJX.get(c.sel), fl = (c.flash || {})[p.id] || {}; return { restored: p.restored || null, activity: (p.activity || {}).text, flash: (fl.title || '') + ' | ' + (fl.text || ''), page: document.querySelector('#pjxc .pjxc-body') ? document.querySelector('#pjxc .pjxc-body').textContent : '' }; });
		await t.check('the restored Project records the chosen copy and its coverage', !!res.restored && res.restored.point === 'p3' && res.restored.when === 'Sep 30 · kept monthly' && /history up to then/.test(res.restored.covers || ''), JSON.stringify(res.restored));
		await t.check('the restore result says which copy came back', /Sep 30 · kept monthly/.test(res.activity || '') && /Sep 30 · kept monthly/.test(res.flash) && !/Today, 3:00 AM/.test(res.flash), res.activity + ' || ' + res.flash);
		await t.crop('s2-result', f.locator('#pjxc .pjxc-band').first(), 'The restored Project says it came back from Sep 30 · kept monthly (LOOK: Sol max S2 after)');
	},
	// (Sol max S3, 2026-11-12) BRS-015: a chosen time zone is part of the backup policy: kept in the created Project and the
	// plan, said in the summary and the Review, and still chosen in a later edit. The Computer's own zone only when that
	// default is the choice.
	async 'backup: the chosen time zone is kept in the created Project and the plan (Sol max S3)'(t) {
		const f = await t.app.open(t);
		await t.app.click(t, f, '[data-c-key="lib:new"]', { wait: 300 });
		await t.app.click(t, f, '[data-c-key="way:new"]');
		await openSec(t, f, 'where');
		await f.fill('[data-pjx-key="name"]', 'Timezone witness');
		await t.page.waitForTimeout(300);
		await openSec(t, f, 'backup');
		await t.app.click(t, f, '[data-c-key="bk:dest:nas"]');
		await t.app.click(t, f, '[data-c-key="disc:bk-adv"]');
		await f.selectOption('[data-pjx-key="bk:tz"]', 'UTC');
		await t.page.waitForTimeout(300);
		const draft = await sess(f, () => { const s = window.PJX.split.session(), NP = window.PJX.np; return { tz: s.d.backup.tz, sum: NP.summary(s, 'backup'), plan: NP.toPlan(s).backup_schedule || null, line: Array.from(document.querySelectorAll('.pjx-np-sec[data-step="backup"] .pjx-np-line')).map((x) => x.textContent).find((x) => /Every day at/.test(x)) || '' }; });
		await t.check('the draft holds UTC', draft.tz === 'UTC', JSON.stringify(draft));
		await t.check('the section says the chosen zone', /2:00 AM UTC/.test(draft.line) && /2:00 AM UTC/.test(draft.sum), draft.line + ' || ' + draft.sum);
		await t.check('the plan carries the chosen zone', !!draft.plan && draft.plan.time === '2:00 AM' && draft.plan.time_zone === 'UTC' && draft.plan.time_zone_source === 'chosen', JSON.stringify(draft.plan));
		const rvBk = await rvRow(f, 'Backup');
		await t.check('the Review says the chosen zone', /every day at 2:00 AM UTC/.test(rvBk || ''), rvBk);
		await t.crop('s3-review', f.locator('.pjxc-review .pjxc-rgroup').nth(2), 'The Review’s Keeping it safe group: Backup every day at 2:00 AM UTC (LOOK: Sol max S3 after)');
		const pr = await sess(f, () => window.PJX.np.firstProblem(window.PJX.split.session()));
		await t.check('nothing stops Create', !pr, JSON.stringify(pr));
		await t.app.click(t, f, '[data-c-key="rv:go"]', { wait: 400 });
		await t.app.until(t, f, 'created', () => window.PJX.all().some((p) => p.name === 'Timezone witness' && p.lifecycle === 'listed') && window.PJX.split.state().mode === 'project', null, 30000);
		const made = await sess(f, () => { const p = window.PJX.all().find((x) => x.name === 'Timezone witness'); return { tz: p.backup.tz, time: p.backup.time, when: ((Array.from(document.querySelectorAll('[data-plate="backup"] .pmu-fact')).find((x) => /^When/.test(x.textContent)) || {}).textContent || '') }; });
		await t.check('the created Project’s backup has the chosen zone', made.tz === 'UTC' && made.time === '2:00 AM', JSON.stringify(made));
		await t.check('its Backup plate says the zone', /2:00 AM UTC/.test(made.when), made.when);
		await t.crop('s3-plate', f.locator('[data-plate="backup"]').first(), 'Timezone witness’s Backup plate: When every day at 2:00 AM UTC (LOOK: Sol max S3 after)');
		await t.app.click(t, f, '[data-plate="backup"] [data-c-key="p:bkchange"]', { wait: 300 });
		await t.app.click(t, f, '[data-plate="backup"] [data-c-key="disc:bk-adv"]');
		const edit = await sess(f, () => { const el = document.querySelector('[data-plate="backup"] [data-pjx-key="bk:tz"]'); return el ? el.value : null; });
		await t.check('a later edit still has UTC chosen', edit === 'UTC', String(edit));
		await t.app.click(t, f, '[data-plate="backup"] [data-c-key="f:cancel"]');
		// the default: the Computer's own clock, said as such, with no zone of its own in the policy
		const def = await sess(f, () => {
			const NP = window.PJX.np, s = NP.start({ way: 'new' });
			s.d.name = 'Clock witness'; s.d.nameTouched = true; NP.set(s, 'backup.dest', 'nas');
			return { made: NP.makeProject(s, 'listed').backup.tz, plan: NP.toPlan(s).backup_schedule, rv: (NP.review(s).find((g) => g.id === 'safe').rows.find((r) => r.k === 'Backup') || {}).v };
		});
		await t.check('with the default, the policy has no zone of its own and says it follows the Computer', def.made === null && !!def.plan && def.plan.time_zone === null && def.plan.time_zone_source === 'computer' && def.plan.computer_time_zone === 'America/New_York', JSON.stringify(def));
		await t.check('with the default, the Review names the Computer’s clock', /This computer’s time \(America\/New_York\)/.test(def.rv || ''), def.rv);
	},
	// (Sol max S4, 2026-11-12) a checked, enabled setting is in the copy, and its category's count and the total agree with
	// it: re-checking a setting under a cleared category brings that category back in, for that setting only.
	async 'copy settings: a setting re-checked under a cleared category is copied (Sol max S4)'(t) {
		const f = await t.app.open(t);
		await t.app.click(t, f, '[data-c-key="lib:new"]', { wait: 300 });
		await t.app.click(t, f, '[data-c-key="way:new"]');
		await openSec(t, f, 'like');
		await t.app.click(t, f, '[data-c-key="like:source:tastebook"]');
		await t.app.until(t, f, 'tastebook’s settings are read', () => !!document.querySelector('[data-c-key="disc:like-adv"]'), null, 8000);
		await t.app.click(t, f, '[data-c-key="disc:like-adv"]');
		const all = await likeState(f);
		await t.check('to start, every setting is copied', all.theme && all.themeIn && all.totals === 13 && all.own === 13, JSON.stringify(all));
		await t.app.tick(t, f, 'like:kind:appearance_workspace');
		const off = await likeState(f);
		await t.check('clearing Look and layout clears Theme, its count and the total', !off.theme && !off.themeIn && !off.kind && /^0 of 1/.test(off.kindSub) && off.totals === 12, JSON.stringify(off));
		await t.app.tick(t, f, 'like:id:general.visual.theme');
		const back = await likeState(f);
		await t.check('re-checked, Theme is in the copy', back.theme && back.themeIn, JSON.stringify(back));
		await t.check('Look and layout’s checkbox and count agree with Theme', back.kind && !back.kindMixed && /^1 of 1/.test(back.kindSub), JSON.stringify({ kind: back.kind, mixed: back.kindMixed, sub: back.kindSub }));
		await t.check('the total agrees with the copy: 13 settings', back.totals === 13 && back.own === 13, JSON.stringify({ totals: back.totals, own: back.own }));
		await t.check('every checked setting on screen is in the copy, and nothing else', back.shownOwn === back.selOwn, back.shownOwn + ' || ' + back.selOwn);
		await t.crop('s4-like', f.locator('.pjx-np-kind[data-kind="appearance_workspace"]').first(), 'Look and layout cleared, then Theme ticked again: 1 of 1, copied (LOOK: Sol max S4 after)');
		// the same for a value kept fixed: clear its category, tick the value again
		await t.app.tick(t, f, 'like:fixed');
		await t.app.tick(t, f, 'like:kind:notifications_usage_budgets');
		const fx0 = await likeState(f);
		await t.check('clearing Notifications & limits keeps its fixed value out', !fx0.runFin && !fx0.runFinIn && !fx0.nKind, JSON.stringify(fx0));
		await t.app.tick(t, f, 'like:same:notifications.desktop.run-finished');
		const fx = await likeState(f);
		await t.check('re-checked, the fixed value is in the copy and its category agrees', fx.runFin && fx.runFinIn && fx.nKind, JSON.stringify(fx));
		await t.crop('s4-fixed', f.locator('.pjx-np-kind[data-kind="notifications_usage_budgets"]').first(), 'Notifications & limits cleared, then its fixed value ticked again: 1 of 1 kept fixed, copied (LOOK: Sol max S4 after)');
		await t.check('every checked fixed value on screen is in the copy, and the total counts it', fx.shownSame === fx.selSame && fx.totals === fx.own && fx.own === fx.shownOwn.split(',').filter(Boolean).length + fx.shownSame.split(',').filter(Boolean).length + fx.fromComputer, JSON.stringify({ shownSame: fx.shownSame, selSame: fx.selSame, totals: fx.totals, own: fx.own }));
	},
};
