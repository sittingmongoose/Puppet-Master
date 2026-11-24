// FO-158: choose a destination in Details, then change a value with the Details picker.
export default async function (t) {
	await t.viewport(1920, 1080);
	const f = await t.app.open();
	const layered = await f.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'));
	if (!layered) {
		await t.check('settings-picker-feed: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
		return;
	}
	await f.waitForFunction(() => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000 });
	await f.evaluate(() => PM51.revealSetting('ai.models.default-model', { detail: true }));
	await t.page.waitForTimeout(1600);
	t.log(JSON.stringify(await f.evaluate(() => ({
		target: document.querySelector('.psx-target-btn')?.textContent,
		choices: [...document.querySelectorAll('.detail-inspector h4')].map((e) => e.textContent)
	}))));
	const hasTarget = await f.locator('.psx-target-btn').count();
	await t.check('Details offers a destination for picker choices', hasTarget === 1);
	if (!hasTarget) {
		await t.shot('fo158-missing-destination', 'The new picker has no destination control');
		return;
	}
	const everywhere = f.locator('.detail-inspector [data-psx-line="everywhere:"] .psx-wval');
	const beforeText = await everywhere.innerText();
	const before = await f.evaluate(() => PSX.resolve('ai.models.default-model', PSX.S.ctx).everywhere);
	await f.locator('.psx-target-btn').click();
	await f.getByText('This project (tastebook)', { exact: true }).click();
	const trigger = f.locator('.detail-inspector [data-action="o55-insp-pick"]');
	await trigger.click();
	const listId = await f.evaluate(() => {
		const c = document.querySelector('.detail-inspector [data-action="o55-insp-pick"][aria-expanded="true"]');
		return c ? c.getAttribute('aria-controls') || '' : '';
	});
	const list = listId ? f.locator(`[id="${listId}"]`) : f.locator('.o55-pick-pop.is-open, .o55-pick-inline');
	const option = list.locator('[role="option"]').filter({ hasText: 'GPT-5' }).first();
	await option.click();
	await t.page.waitForTimeout(350);
	// FO-182: models with thinking depths stay open for a depth choice before saving.
	const depthOpt = f.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"]').first();
	if (await depthOpt.count()) await depthOpt.click();
	await t.page.waitForTimeout(1500);
	const got = await f.evaluate(() => ({
		resolved: PSX.resolve('ai.models.default-model', PSX.S.ctx),
		history: PSX.W.history.slice(0, 3),
		text: document.querySelector('.detail-inspector').innerText
	}));
	t.log(JSON.stringify(got));
	await t.check('picker choice reaches the selected project feed', got.resolved.from.level === 'project' && got.resolved.from.key === 'tastebook' && /gpt-5/i.test(JSON.stringify(got.resolved)), JSON.stringify(got));
	await t.check('Everywhere value stays unchanged', got.resolved.everywhere === before, JSON.stringify({ before, after: got.resolved.everywhere }));
	const project = f.locator('.detail-inspector [data-psx-line="project:tastebook"] .psx-wval');
	if (await project.count()) {
		await project.scrollIntoViewIfNeeded();
		await t.text(project, 'GPT-5');
		await t.visible(project, 'tastebook shows the picked model');
	} else {
		await t.check('tastebook shows the picked model', false, 'no project:tastebook line in Details');
	}
	await everywhere.scrollIntoViewIfNeeded();
	await t.text(everywhere, beforeText);
	await t.visible(everywhere, 'Everywhere still shows its original model');
	await t.shot('fo158-feed', 'Details picker and selected project result');

	// FO-158 r3 (neon-max-19): Change on a place in "Where it applies" opens that place's own model picker inside the
	// Where block; "Choosing here changes" must stay with Your choices and never move into the Where block.
	const g = await t.app.open();
	await g.waitForFunction(() => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000 });
	await g.evaluate(() => PM51.revealSetting('ai.models.default-model', { detail: true }));
	await t.page.waitForTimeout(1600);
	const where = g.locator('.detail-inspector [data-psx-block="where"]');
	const change = where.getByRole('button', { name: /^Change\b/ }).first();
	const canChange = (await where.count()) > 0 && (await change.count()) > 0;
	await t.check('Where it applies offers Change on a place', canChange, JSON.stringify(await g.evaluate(() => [...document.querySelectorAll('.detail-inspector [data-psx-block="where"] button')].map((b) => b.textContent.trim()).slice(0, 12))));
	if (!canChange) return;
	await change.scrollIntoViewIfNeeded();
	await change.click();
	await t.page.waitForTimeout(900);
	const placed = await g.evaluate(() => {
		const tgt = document.querySelector('.detail-inspector .psx-target');
		const sec = tgt && tgt.closest('section');
		return {
			editorOpen: !!document.querySelector('.detail-inspector [data-psx-block="where"] .o55-pick-trigger'),
			target: !!tgt,
			inWhere: !!(tgt && tgt.closest('[data-psx-block="where"]')),
			section: sec ? ((sec.querySelector('h4') || {}).textContent || '') : null
		};
	});
	t.log(JSON.stringify(placed));
	await t.check('a place\'s Change opens its model picker in Where it applies', placed.editorOpen, JSON.stringify(placed));
	await t.check('Choosing here changes stays out of Where it applies after a place\'s Change', placed.target && !placed.inWhere, JSON.stringify(placed));
	if (!placed.target || placed.inWhere) await t.shot('fo158-target-in-where', 'Choosing here changes moved into Where it applies');
}
