// Jared #12: where work runs. Auto by default; records home, default Computer and the Computers working now are separate;
// work rows say Auto → <Computer> or Chosen: <Computer> by <who>, with Why this computer (SIR-056, F3-668).
// (F3, r1b) The Project has one Computer picker, the default Computer, with two jobs: it breaks ties in Auto, and in Chosen new
// Project work runs on it (SSYS-059; pm.work_placement.project_policy.v1 requested_mode chosen requires default_computer).
// One piece of work is pinned on the work itself (Run this on…, Start a run…), a bounded run/task pin (placement_choice).
const workFacts = (f) => f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pmu-fact')).map((x) => x.textContent.trim()));
const workSub = (f) => f.evaluate(() => ((document.querySelector('[data-plate="work"] .pmu-cardsub') || {}).textContent || '').trim());
const rowTo = (f, i) => f.evaluate((i) => ((document.querySelectorAll('[data-plate="work"] .pjx-wk-row')[i] || {}).querySelector?.('.pjx-wk-to') || {}).textContent || '', i);
/* the radio groups in a box whose choices name a Computer: one is the default Computer; any other would be a second picker */
const computerPickers = (f, box) => f.evaluate((box) => {
	const root = document.querySelector(box); if (!root) return -1;
	return Array.from(root.querySelectorAll('[role="radiogroup"]')).filter((g) => /This computer|Home NAS|Studio Mac/.test(Array.from(g.querySelectorAll('[role="radio"]')).map((r) => r.textContent).join(' '))
		&& Array.from(g.querySelectorAll('[role="radio"]')).filter((r) => /^(This computer|Home NAS|Studio Mac)/.test(r.textContent.trim())).length >= 2).length;
}, box);
/* Save closes the form by giving the focus back to the button that opened it, and the browser scrolls the plate to that
   button. A press made during that scroll lands nowhere ("moving: it went 159 px during the 90 ms hover"), so a control
   is pressed only after its box and every scroller around it have held still for three frames. */
const holdStill = (f, sel, ms = 4000) => f.evaluate(async ([sel, ms]) => {
	const el = document.querySelector(sel); if (!el) return false;
	const scrollers = [];
	for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
		if (/(auto|scroll)/.test(getComputedStyle(n).overflowY)) scrollers.push(n);
	}
	const box = () => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height, ...scrollers.map((s) => s.scrollTop), document.documentElement.scrollTop, document.body.scrollTop]; };
	const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1);
	const end = performance.now() + ms;
	let prev = box(), still = 0, frames = 0;
	while (performance.now() < end) {
		await new Promise((r) => requestAnimationFrame(() => r()));
		const now = box();
		still = same(prev, now) ? still + 1 : 0; prev = now; frames++;
		if (frames >= 6 && still >= 3) return true;
	}
	return false;
}, [sel, ms]);

export const tests = {
	async 'Project page: Where work runs'(t) {
		const f = await t.app.open(t);
		const bad = await f.evaluate(() => (document.getElementById('pjxc').innerText.match(/[^\n]*\bworks on\b[^\n]*|Work happens on[^\n]*/g) || []));
		await t.check('no "<Project> works on <Computer>" anywhere', bad.length === 0, bad.join(' | '));
		await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="tastebook"]', { wait: 300 });
		const facts = await workFacts(f);
		await t.check('summary: records home, new work Auto, default Computer, allowed, working now', /^Records home/.test(facts[0]) && /New workAuto/.test(facts[1]) && /^Default Computer/.test(facts[2]) && /^Allowed/.test(facts[3]) && /^Working now/.test(facts[4]), facts.join(' | '));
		await t.check('the default Computer breaks ties in Auto', /^Default ComputerThis computer · breaks ties/.test(facts[2]), facts[2]);
		const rows = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pjx-wk-to')).map((x) => x.textContent));
		await t.check('work rows', rows.indexOf('Auto → Home NAS') >= 0 && rows.indexOf('Chosen: Studio Mac by Jared') >= 0 && rows.indexOf('Auto · picks a Computer when it starts') >= 0, rows.join(' | '));
		await f.evaluate(() => { const el = document.querySelector('[data-plate="work"]'), sc = el.closest('.pjxc-scroll'); sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 40; });
		await t.crop('work-plate', f.locator('[data-plate="work"]'), 'Where work runs plate on tastebook, with Run this on… per row (LOOK: #12 after)');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:1"]');
		await t.page.waitForTimeout(300);
		const dlg = f.locator('.pjx-dlg').first();
		await t.text(dlg, /The other Computers/);
		await t.text(dlg, /keyboard is in use/);
		await t.text(dlg, /Studio Mac: left out\. Its level is Only when I choose it/);
		await t.text(dlg, /Preset: Balanced/);
		await t.text(dlg, /Weights: free processing 1/);
		await t.text(dlg, /Placement policy version 1/);
		await t.shot('why', 'Why this computer (LOOK)');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(250);

		// one piece of work, pinned on the work itself, while tastebook stays Auto with This computer as its default
		await t.check('started work keeps its Computer: Run this on… is off on a running row', await f.evaluate(() => document.querySelector('[data-plate="work"] [data-c-key="wk:pin:0"]').getAttribute('aria-disabled') === 'true'));
		// a menu trigger is pressed where it already shows: PMConcept7's menus close on a scroll that moves their trigger, so
		// the row is brought into the Project page's own scroller first and pressed without the helper's scroll reset
		await f.evaluate(() => { const el = document.querySelector('[data-plate="work"] [data-c-key="wk:pin:3"]'), sc = el.closest('.pjxc-scroll'); sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 2; document.documentElement.scrollTop = 0; document.body.scrollTop = 0; });
		await t.page.waitForTimeout(250);
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:pin:3"]', { wait: 350, noScroll: true });
		const menu = await f.evaluate(() => Array.from(document.querySelectorAll('.pmr-menu.is-open [role="menuitem"]')).map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
		await t.check('Run this on… offers the Project’s choice and every allowed Computer, Studio Mac at Only when I choose it', menu.length === 4 && /^Project’s choice/.test(menu[0]) && menu.some((x) => /^Studio Mac.*Only when I choose it/.test(x)), menu.join(' | '));
		await t.app.menuPick(t, f, 'Studio Mac');
		await t.app.until(t, f, 'the queued row reads Chosen: Studio Mac by Jared', () => /Chosen: Studio Mac by Jared/.test(((document.querySelectorAll('[data-plate="work"] .pjx-wk-row')[3] || {}).textContent) || ''), null, 10000);
		const after = { sub: await workSub(f), facts: await workFacts(f), mode: await f.evaluate(() => window.PJX.get('tastebook').work.mode), def: await f.evaluate(() => window.PJX.get('tastebook').runsOn) };
		await t.check('the pin leaves the Project Auto with This computer as its default', /^Auto/.test(after.sub) && after.mode === 'auto' && after.def === 'here' && /^Default ComputerThis computer · breaks ties/.test(after.facts[2]) && /New workAuto/.test(after.facts[1]), JSON.stringify(after));
		await t.crop('work-pin', f.locator('[data-plate="work"]'), 'A single-work pin: Lane docs Chosen: Studio Mac by Jared while tastebook stays Auto (LOOK: F3 r1b)');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:3"]');
		await t.page.waitForTimeout(300);
		await t.text(dlg, /Why Studio Mac/);
		await t.text(dlg, /Jared chose Studio Mac for this task/);
		await t.text(dlg, /A person’s choice wins/);
		await t.text(dlg, /tastebook’s own work choice \(Auto\) is unchanged/);
		await t.text(dlg, /Studio Mac is set to Only when I choose it, so Auto never picks it\. A person’s pin can\./);
		await t.shot('why-pin', 'Why Studio Mac on a pinned piece of work (LOOK)');
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(250);

		// starting work: a Computer for this run only
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="p:startrun"]', { wait: 350 });
		await t.text(dlg, /tastebook’s new work: Auto/);
		await t.app.click(t, f, '.pjx-dlg [data-c-key="wk:start:where:studio"]');
		await t.text(dlg, /This run only: Chosen: Studio Mac by Jared/);
		await t.shot('start-run', 'Start a run with Studio Mac for this run only (LOOK)');
		await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { hasText: 'Start', noScroll: true });
		await t.app.until(t, f, 'the started run reads Chosen: Studio Mac by Jared', () => Array.from(document.querySelectorAll('[data-plate="work"] .pjx-wk-row')).some((r) => /Run the tests/.test(r.textContent) && /Chosen: Studio Mac by Jared/.test(r.textContent)), null, 10000);
		const after2 = { sub: await workSub(f), mode: await f.evaluate(() => window.PJX.get('tastebook').work.mode), def: await f.evaluate(() => window.PJX.get('tastebook').runsOn) };
		await t.check('starting a pinned run leaves the Project Auto with This computer as its default', /^Auto/.test(after2.sub) && after2.mode === 'auto' && after2.def === 'here', JSON.stringify(after2));

		// (N1) a person's pin to a Computer the Project stops allowing waits with its reason; nothing moves by itself
		await t.app.click(t, f, '[data-c-key="p:work"]');
		await t.page.waitForTimeout(200);
		await t.app.tick(t, f, 'wk:allow:studio');
		await t.text(f.locator('[data-plate="work"] .pjxc-form').first(), /Lane docs · build the site is pinned to Studio Mac\. If Studio Mac isn’t allowed, it waits/);
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="f:save"]');
		await t.app.until(t, f, 'saved: Studio Mac is no longer allowed', () => /^This computer and Home NAS$/.test(((Array.from(document.querySelectorAll('[data-plate="work"] .pmu-fact')).find((x) => /^Allowed/.test(x.textContent)) || {}).querySelector?.('.pmu-factv') || {}).textContent || ''), null, 10000);
		const stale = await f.evaluate(() => { const r = document.querySelectorAll('[data-plate="work"] .pjx-wk-row'); const at = (i) => ({ state: r[i].getAttribute('data-state'), text: r[i].querySelector('.pjx-wk-where').textContent }); return { lane: at(3), photos: at(2), lw: window.PJX.get('tastebook').workers[3] }; });
		await t.check('the pinned row waits, says why, and still shows what was asked for', stale.lane.state === 'waiting' && /^Chosen: Studio Mac by Jared · Waiting: Studio Mac is no longer allowed for tastebook$/.test(stale.lane.text) && stale.lw.c === 'studio' && stale.lw.queued === true, JSON.stringify(stale));
		await t.check('started work on Studio Mac keeps it and says so', stale.photos.state === 'kept' && /no longer allowed for new work; this task started there and keeps it/.test(stale.photos.text), JSON.stringify(stale.photos));
		await f.evaluate(() => { const el = document.querySelector('[data-plate="work"] [data-c-key="wk:pin:3"]'), sc = el.closest('.pjxc-scroll'); sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 2; document.documentElement.scrollTop = 0; document.body.scrollTop = 0; });
		await t.page.waitForTimeout(250);
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:pin:3"]', { wait: 350, noScroll: true });
		const menu2 = await f.evaluate(() => Array.from(document.querySelectorAll('.pmr-menu.is-open [role="menuitem"]')).map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
		await t.check('pinning it elsewhere offers only the Computers still allowed', menu2.length === 3 && !menu2.some((x) => /Studio Mac/.test(x)), menu2.join(' | '));
		await t.page.keyboard.press('Escape');
		await t.page.waitForTimeout(250);
		await t.crop('stale-pin', f.locator('[data-plate="work"]'), 'Lane docs waits: Studio Mac is no longer allowed for tastebook (LOOK: N1 after)');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:3"]');
		await t.page.waitForTimeout(300);
		await t.text(dlg, /Why this waits/);
		await t.text(dlg, /Jared pinned this to Studio Mac, and Studio Mac is no longer allowed for tastebook\. So it waits/);
		await t.text(dlg, /never moves a pinned task to another Computer by itself/);
		await t.check('a waiting pin’s Why doesn’t say the pin wins', !/A person’s choice wins/.test(await dlg.textContent()));
		await t.shot('why-stale', 'Why this waits: pinned to a Computer no longer allowed (LOOK: N1 after)');
		await t.app.click(t, f, '.pjx-dlg .pjx-btn', { hasText: 'Follow the Project’s choice (Auto)', noScroll: true });
		await t.app.until(t, f, 'following the Project’s choice, it no longer waits', () => { const r = document.querySelectorAll('[data-plate="work"] .pjx-wk-row')[3]; return !!r && !r.getAttribute('data-state') && /Auto · picks a Computer when it starts/.test(r.textContent); }, null, 10000);

		// the Project form: one Computer picker, the default, with its two jobs in plain words
		await t.app.click(t, f, '[data-c-key="p:work"]');
		await t.page.waitForTimeout(200);
		await t.check('the Project form has one Computer picker (Auto)', (await computerPickers(f, '[data-plate="work"] .pjxc-form')) === 1 && (await f.locator('[data-plate="work"] [data-c-key^="wk:chosen:"]').count()) === 0);
		await t.app.click(t, f, '[data-c-key="wk:mode:chosen"]');
		const form = await f.evaluate(() => ({ title: ((document.querySelector('[data-c-key="wk:mode:chosen"]') || {}).textContent || '').trim(), text: document.querySelector('[data-plate="work"] .pjxc-form').textContent }));
		await t.check('the Project form has no second Computer picker (Chosen)', (await computerPickers(f, '[data-plate="work"] .pjxc-form')) === 1 && (await f.locator('[data-plate="work"] [data-c-key^="wk:chosen:"]').count()) === 0);
		await t.check('Chosen names the default Computer', /^Chosen: This computer/.test(form.title) && /New Project work runs on the default Computer, This computer/.test(form.text), form.title);
		await t.check('the default’s two jobs are said in plain words', /This computer has two jobs\. In Auto it breaks ties\. In Chosen, new Project work runs on it\./.test(form.text));
		await t.app.click(t, f, '[data-c-key="wk:def:studio"]');
		await t.text(f.locator('[data-c-key="wk:mode:chosen"]').first(), /Chosen: Studio Mac/);
		await t.check('the form’s fact lines keep their mark beside their words', await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pjxc-form > .pjx-np-line')).every((l) => { const m = l.querySelector('.pjx-np-mk'), x = l.querySelector('.pjx-np-text'); return m && x && Math.abs(m.getBoundingClientRect().top - x.getBoundingClientRect().top) < 8; })));
		await t.crop('work-form', f.locator('[data-plate="work"]'), 'Change where work runs: one Computer picker; Chosen: Studio Mac is the default Computer (LOOK: F3 r1b)');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="f:save"]');
		await t.app.until(t, f, 'saved: Chosen: Studio Mac by Jared', () => /Chosen: Studio Mac by Jared/.test((document.querySelector('[data-plate="work"] .pmu-cardsub') || {}).textContent || ''), null, 10000);
		const facts2 = await workFacts(f);
		await t.check('Chosen: the default Computer is where new work goes', facts2.some((x) => /^Default ComputerStudio Mac · new work goes here/.test(x)), facts2.join(' | '));
		await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="loom"]', { wait: 300 });
		await t.text(f.locator('[data-plate="work"] .pmu-cardsub').first(), /Chosen: Studio Mac by Jared/);
		const lf = await workFacts(f);
		await t.check('loom: Chosen Studio Mac, and Studio Mac is its default Computer', lf.some((x) => /^Default ComputerStudio Mac · new work goes here/.test(x)), lf.join(' | '));
		// (N3) work started under loom's Chosen keeps its Computer, and its Why says so after the default moves
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="p:startrun"]', { wait: 350 });
		await t.app.click(t, f, '.pjx-dlg .pjx-btn.is-primary', { hasText: 'Start', noScroll: true });
		await t.app.until(t, f, 'loom’s run started on Studio Mac', () => /Run the tests/.test(((document.querySelectorAll('[data-plate="work"] .pjx-wk-row')[0]) || {}).textContent || ''), null, 10000);
		await t.app.click(t, f, '[data-c-key="p:work"]');
		await t.page.waitForTimeout(200);
		await t.app.click(t, f, '[data-c-key="wk:def:here"]');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="f:save"]');
		await t.app.until(t, f, 'loom saved: Chosen: This computer', () => /Chosen: This computer by Jared/.test((document.querySelector('[data-plate="work"] .pmu-cardsub') || {}).textContent || ''), null, 10000);
		// the form's close returned the focus, and with it a scroll, to the button that opened it: press Why once it holds still
		await holdStill(f, '[data-plate="work"] [data-c-key="wk:why:0"]');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:0"]');
		await t.page.waitForTimeout(300);
		const lw = await dlg.textContent();
		await t.check('Why names where it was sent and the choice in force then', /Why Studio Mac/.test(lw) && /It started on Studio Mac when loom’s new work was Chosen: Studio Mac by Jared\. Started work keeps its Computer\./.test(lw) && /loom’s new work is now Chosen: This computer by Jared\. That applies to work that hasn’t started\./.test(lw), lw.slice(0, 400));
		await t.check('Why on project-chosen work never says “for this task only” or restates the new default as the old one', !/for this task only/.test(lw) && !/because loom’s new work is Chosen/.test(lw) && !/A person’s choice wins/.test(lw), lw.slice(0, 400));
		await t.shot('why-loom', 'loom after its default moved: Why on work started under the old Chosen (LOOK: N3 after)');
		await t.page.keyboard.press('Escape');
	},
	async 'New Project: Where it lives offers the work choice, Auto by default'(t) {
		const f = await t.app.open(t);
		await t.app.act(t, 'new');
		await t.app.click(t, f, '[data-c-key="way:new"]', { wait: 300 });
		// Where it lives opens by its own heading (unless the guided page already opened it)
		if (!(await f.evaluate(() => !!document.querySelector('.pjx-np-sec[data-step="where"][data-state="open"]')))) await t.app.click(t, f, '[data-c-key="sec:where"]', { wait: 300 });
		await t.check('Auto is chosen by default', await f.evaluate(() => document.querySelector('[data-c-key="wk:np:mode:auto"]').getAttribute('aria-checked') === 'true'));
		await t.visible(f.locator('[data-c-key="wk:np:allow:homenas"]'), 'allowed Computers are a person’s choice');
		await t.app.click(t, f, '[data-c-key="wk:np:mode:chosen"]');
		const np = await f.evaluate(() => ({ title: ((document.querySelector('[data-c-key="wk:np:mode:chosen"]') || {}).textContent || '').trim(), def: (document.querySelector('[data-c-key^="wk:np:def:"][aria-checked="true"]') || {}).textContent, text: (document.querySelector('.pjx-wk-np') || {}).textContent || '', rv: Array.from(document.querySelectorAll('.pjxc-review dt')).map((x) => x.textContent.trim() + '=' + x.nextElementSibling.textContent.trim()).filter((x) => /^(New work|Default Computer)/.test(x)) }));
		await t.check('New Project has no second Computer picker', (await computerPickers(f, '.pjx-wk-np')) === 1 && (await f.locator('[data-c-key^="wk:np:chosen"]').count()) === 0);
		await t.check('New Project: Chosen is the default Computer, This computer', /^Chosen: This computer/.test(np.title) && /^This computer/.test(np.def || '') && np.rv.some((x) => /^New work.*=Chosen: This computer/.test(x)), JSON.stringify(np));
		await t.check('New Project says the default’s two jobs', /This computer has two jobs\. In Auto it breaks ties\. In Chosen, new Project work runs on it\./.test(np.text));
		// (N2) the Default Computer is its own answer: picking Studio Mac leaves the records home on This computer
		await t.app.click(t, f, '[data-c-key="wk:np:def:studio"]');
		const n2 = await f.evaluate(() => ({ home: (document.querySelector('[data-c-key^="where:runsOn:"][aria-checked="true"]') || {}).textContent, homeCap: ((document.querySelector('[data-c-key^="where:runsOn:"]') || {}).closest?.('.pjx-np-field')?.querySelector('.pjx-np-cap') || {}).textContent, rv: Array.from(document.querySelectorAll('.pjxc-review dt')).map((x) => x.textContent.trim() + '=' + x.nextElementSibling.textContent.trim()).filter((x) => /^(New work|Default Computer|Records home)/.test(x)) }));
		await t.check('records home stays This computer when the Default Computer is Studio Mac', /^This computer/.test(n2.home || '') && /^Records home/.test(n2.homeCap || '') && n2.rv.some((x) => /^Default Computer.*=Studio Mac/.test(x)) && n2.rv.some((x) => /^New work.*=Chosen: Studio Mac/.test(x)) && n2.rv.some((x) => /^Records home.*=This computer/.test(x)), JSON.stringify(n2));
		const plan = await f.evaluate(() => { const s = window.PJX.split.session(); if (!s) return null; const x = window.PJX.np.toPlan(s); return { default_computer: x.default_computer, records_home: x.records_home }; });
		await t.check('the plan keeps them apart too', !!plan && plan.default_computer === 'studio' && plan.records_home === 'here', JSON.stringify(plan));
		const rv = await f.evaluate(() => Array.from(document.querySelectorAll('.pjxc-review dt')).map((x) => x.textContent.trim()));
		await t.check('Review names default Computer, new work, allowed and records home', ['Default Computer', 'New work', 'Allowed', 'Records home'].every((k) => rv.some((x) => x.indexOf(k) === 0)), rv.join(' | '));
		await t.shot('np-where', 'New Project › Where it lives with Where its work runs: one Computer picker (LOOK)');
	}
};
