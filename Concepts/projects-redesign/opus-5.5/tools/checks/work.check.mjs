// Jared #12: where work runs. Auto by default; records home, default Computer and the Computers working now are separate;
// work rows say Auto → <Computer> or Chosen: <Computer> by <who>, with Why this computer (SIR-056, F3-668).
export const tests = {
	async 'Project page: Where work runs'(t) {
		const f = await t.app.open(t);
		const bad = await f.evaluate(() => (document.getElementById('pjxc').innerText.match(/[^\n]*\bworks on\b[^\n]*|Work happens on[^\n]*/g) || []));
		await t.check('no "<Project> works on <Computer>" anywhere', bad.length === 0, bad.join(' | '));
		await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="tastebook"]', { wait: 300 });
		const facts = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pmu-fact')).map((x) => x.textContent.trim()));
		await t.check('summary: records home, new work Auto, default Computer, allowed, working now', /^Records home/.test(facts[0]) && /New workAuto/.test(facts[1]) && /^Default Computer/.test(facts[2]) && /^Allowed/.test(facts[3]) && /^Working now/.test(facts[4]), facts.join(' | '));
		const rows = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pjx-wk-to')).map((x) => x.textContent));
		await t.check('work rows', rows.indexOf('Auto → Home NAS') >= 0 && rows.indexOf('Chosen: Studio Mac by Jared') >= 0, rows.join(' | '));
		await f.evaluate(() => { const el = document.querySelector('[data-plate="work"]'), sc = el.closest('.pjxc-scroll'); sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 40; });
		await t.crop('work-plate', f.locator('[data-plate="work"]'), 'Where work runs plate on tastebook (LOOK: #12 after)');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="wk:why:1"]');
		await t.page.waitForTimeout(300);
		await t.text(f.locator('.pjx-dlg').first(), /The other Computers/);
		await t.text(f.locator('.pjx-dlg').first(), /keyboard is in use/);
		await t.text(f.locator('.pjx-dlg').first(), /Preset: Balanced/);
		await t.text(f.locator('.pjx-dlg').first(), /Weights: free processing 1/);
		await t.text(f.locator('.pjx-dlg').first(), /Placement policy version 1/);
		await t.shot('why', 'Why this computer (LOOK)');
		await t.page.keyboard.press('Escape');
		await t.app.click(t, f, '[data-c-key="p:work"]');
		await t.page.waitForTimeout(200);
		await t.app.click(t, f, '[data-c-key="wk:mode:chosen"]');
		// (F3) the chosen Computer is its own answer: Studio Mac runs the work, This computer stays the default
		await t.app.click(t, f, '[data-c-key="wk:chosen:studio"]');
		const sel = await f.evaluate(() => ({ chosen: (document.querySelector('[data-c-key^="wk:chosen:"][aria-checked="true"]') || {}).textContent, def: (document.querySelector('[data-c-key^="wk:def:"][aria-checked="true"]') || {}).textContent }));
		await t.check('Chosen: Studio Mac while the default stays This computer', /^Studio Mac/.test(sel.chosen || '') && /^This computer/.test(sel.def || ''), JSON.stringify(sel));
		await t.crop('work-form', f.locator('[data-plate="work"]'), 'Change where work runs: Chosen Studio Mac, default This computer (LOOK: F3 after)');
		await t.app.click(t, f, '[data-plate="work"] [data-c-key="f:save"]');
		await t.app.until(t, f, 'saved: Chosen: Studio Mac by Jared', () => /Chosen: Studio Mac by Jared/.test((document.querySelector('[data-plate="work"] .pmu-cardsub') || {}).textContent || ''), null, 10000);
		const facts2 = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pmu-fact')).map((x) => x.textContent.trim()));
		await t.check('the default Computer stays This computer', facts2.some((x) => /^Default ComputerThis computer/.test(x)), facts2.join(' | '));
		await t.app.click(t, f, '#pjxc .pjxc-row[data-pid="loom"]', { wait: 300 });
		await t.text(f.locator('[data-plate="work"] .pmu-cardsub').first(), /Chosen: Studio Mac by Jared/);
		const lf = await f.evaluate(() => Array.from(document.querySelectorAll('[data-plate="work"] .pmu-fact')).map((x) => x.textContent.trim()));
		await t.check('loom: Chosen Studio Mac, default This computer', lf.some((x) => /^Default ComputerThis computer/.test(x)), lf.join(' | '));
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
		await t.app.click(t, f, '[data-c-key="wk:np:chosen:studio"]');
		const np = await f.evaluate(() => ({ chosen: (document.querySelector('[data-c-key^="wk:np:chosen:"][aria-checked="true"]') || {}).textContent, def: (document.querySelector('[data-c-key^="where:runsOn:"][aria-checked="true"]') || {}).textContent, rv: Array.from(document.querySelectorAll('.pjxc-review dt')).map((x) => x.textContent.trim() + '=' + x.nextElementSibling.textContent.trim()).filter((x) => /^(New work|Default Computer)/.test(x)) }));
		await t.check('New Project: Chosen Studio Mac, default This computer', /^Studio Mac/.test(np.chosen || '') && /^This computer/.test(np.def || '') && np.rv.some((x) => /^New work.*=Chosen: Studio Mac/.test(x)), JSON.stringify(np));
		const rv = await f.evaluate(() => Array.from(document.querySelectorAll('.pjxc-review dt')).map((x) => x.textContent.trim()));
		await t.check('Review names default Computer, new work, allowed and records home', ['Default Computer', 'New work', 'Allowed', 'Records home'].every((k) => rv.some((x) => x.indexOf(k) === 0)), rv.join(' | '));
		await t.shot('np-where', 'New Project › Where it lives with Where its work runs (LOOK)');
	}
};
