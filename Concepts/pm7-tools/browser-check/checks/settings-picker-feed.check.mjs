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

	// FO-158 r4 (astra-max-19): model and thinking depth share one scope (SSYS-059).
	// Helper: qualify and press a named depth option in the open shared picker popup.
	async function pressDepth(frame, effort, who) {
		const opt = frame.locator(`.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort="${effort}"]`);
		const n = await opt.count();
		const vis = n === 1 && await opt.first().isVisible().catch(() => false);
		await t.check(`${who}: depth option "${effort}" is shown and clickable`, n === 1 && vis, `count=${n}, visible=${vis}`);
		if (n !== 1 || !vis) return false;
		await opt.first().click();
		await t.page.waitForTimeout(250);
		const closed = await frame.evaluate(() => !document.querySelector('.o55-pick-pop.is-open'));
		await t.check(`${who}: pressing "${effort}" depth closes the picker`, closed);
		return closed;
	}
	async function readModelState(frame, id) {
		return frame.evaluate((sid) => {
			const P = window.PSX;
			const r = P.resolve(sid, P.S.ctx);
			const own = P.getAt(P.W, 'project', 'tastebook', sid);
			const h0 = P.W.history[0] || null;
			const tb = document.querySelector('.detail-inspector [data-psx-line="project:tastebook"] .psx-wval');
			const ev = document.querySelector('.detail-inspector [data-psx-line="everywhere:"] .psx-wval');
			const rowEl = document.querySelector(`#pm-settings-root .o55-msel[data-o55-msel="${CSS.escape(sid)}"]`);
			const rowCombo = rowEl ? rowEl.querySelector('[role="combobox"]') : null;
			const rowSmall = rowCombo ? rowCombo.querySelector('small') : null;
			const rowRect = rowCombo ? rowCombo.getBoundingClientRect() : null;
			const rowSetting = rowEl ? rowEl.closest('.setting-row') : null;
			return {
				resolved: r,
				model: P.modelOf(r.value),
				effort: P.effortOf(r.value),
				ownModel: own === undefined ? null : P.modelOf(own),
				ownEffort: own === undefined ? '' : P.effortOf(own),
				evModel: r.everywhere === undefined ? undefined : P.modelOf(r.everywhere),
				evEffort: r.everywhere === undefined ? '' : P.effortOf(r.everywhere),
				historyLen: P.W.history.length,
				headHist: h0,
				headBeforeModel: h0 && h0.before !== undefined ? P.modelOf(h0.before) : undefined,
				headBeforeEffort: h0 && h0.before !== undefined ? P.effortOf(h0.before) : '',
				headAfterModel: h0 && h0.after !== undefined ? P.modelOf(h0.after) : undefined,
				headAfterEffort: h0 && h0.after !== undefined ? P.effortOf(h0.after) : '',
				tastebookLine: tb ? tb.innerText.trim() : null,
				everywhereLine: ev ? ev.innerText.trim() : null,
				rowSmall: rowSmall ? rowSmall.innerText.trim() : null,
				rowPickerVisible: !!rowCombo && !!rowRect && rowRect.width > 0 && rowRect.height > 0 && getComputedStyle(rowCombo).display !== 'none',
				rowDevView: rowSetting ? rowSetting.classList.contains('psx-devview') : null,
				rowFocus: !!rowCombo && (document.activeElement === rowCombo || rowCombo.contains(document.activeElement)),
				lastNote: P.lastNote || null
			};
		}, id);
	}
	// FO-158 r5: after a depth commit the row's shared picker must still be the control (no .psx-devview words in its
	// place), its visible text must name the depth, and after a row-picker commit focus must be back on it. innerText
	// reads the same on a display:none combobox, so visibility is asserted from the box and the row's class too.
	async function checkRowPicker(st, effort, who, focusBack) {
		await t.check(
			`${who}: row picker stays visible after the depth save`,
			st.rowPickerVisible === true && st.rowDevView === false,
			JSON.stringify({ visible: st.rowPickerVisible, devview: st.rowDevView, rowSmall: st.rowSmall })
		);
		await t.check(
			`${who}: row face shows ${effort} depth`,
			new RegExp(`\\b${effort} depth\\b`, 'i').test(st.rowSmall || ''),
			String(st.rowSmall)
		);
		if (focusBack) {
			await t.check(`${who}: focus is back on the row picker`, st.rowFocus === true, JSON.stringify({ rowFocus: st.rowFocus }));
		}
	}

	// (1) Same model, depth-only change for This project (Details picker)
	await t.step('FO-158 r4 (1): same model, depth-only change for This project (Details)', async () => {
		const f1 = await t.app.open();
		await f1.waitForFunction(() => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000 });
		await f1.evaluate(() => PM51.revealSetting('ai.models.default-model', { detail: true }));
		await t.page.waitForTimeout(1600);
		const b1 = await readModelState(f1, 'ai.models.default-model');
		await f1.locator('.psx-target-btn').click();
		await f1.getByText('This project (tastebook)', { exact: true }).click();
		await f1.locator('.detail-inspector [data-action="o55-insp-pick"]').click();
		await t.page.waitForTimeout(350);
		const depthOpen = await f1.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"]').count();
		if (!depthOpen) {
			await f1.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: 'Claude Opus 4' }).first().click();
			await t.page.waitForTimeout(350);
		}
		const pressed = await pressDepth(f1, 'High', 'depth-only (Details)');
		if (!pressed) return;
		await t.page.waitForTimeout(1500);
		const a1 = await readModelState(f1, 'ai.models.default-model');
		t.log('r4-depth-only ' + JSON.stringify(a1));
		await t.check(
			'depth-only (Details): tastebook gets an override with Claude Opus 4 and High depth',
			a1.resolved.from.level === 'project' && a1.resolved.from.key === 'tastebook' && a1.model === 'anthropic/claude-opus-4' && a1.effort === 'High' && a1.ownModel === 'anthropic/claude-opus-4' && a1.ownEffort === 'High',
			JSON.stringify({ from: a1.resolved.from, model: a1.model, effort: a1.effort, ownModel: a1.ownModel, ownEffort: a1.ownEffort })
		);
		await t.check(
			'depth-only (Details): History records the project depth change',
			a1.historyLen === b1.historyLen + 1 && !!a1.headHist && a1.headHist.sid === 'ai.models.default-model' && a1.headHist.level === 'project' && a1.headHist.key === 'tastebook' && a1.headAfterModel === 'anthropic/claude-opus-4' && a1.headAfterEffort === 'High',
			JSON.stringify({ beforeLen: b1.historyLen, afterLen: a1.historyLen, headHist: a1.headHist })
		);
		await t.check(
			'depth-only (Details): Everywhere keeps its original model and depth',
			JSON.stringify(a1.resolved.everywhere) === JSON.stringify(b1.resolved.everywhere) && a1.evEffort === '' && a1.everywhereLine === b1.everywhereLine && !/\bHigh\b/i.test(a1.everywhereLine || ''),
			JSON.stringify({ beforeEv: b1.resolved.everywhere, afterEv: a1.resolved.everywhere, beforeLine: b1.everywhereLine, afterLine: a1.everywhereLine })
		);
		const tbLoc1 = f1.locator('.detail-inspector [data-psx-line="project:tastebook"] .psx-wval');
		if (await tbLoc1.count()) {
			await tbLoc1.scrollIntoViewIfNeeded();
			await t.check('depth-only (Details): Where it applies shows tastebook with Claude Opus 4 and High', /Claude Opus 4/i.test(a1.tastebookLine || '') && /\bHigh\b/i.test(a1.tastebookLine || ''), String(a1.tastebookLine));
			await t.visible(tbLoc1, 'depth-only (Details): tastebook line is visible');
		} else {
			await t.check('depth-only (Details): Where it applies shows tastebook with Claude Opus 4 and High', false, 'no project:tastebook line in Details');
		}
		await checkRowPicker(a1, 'High', 'depth-only (Details)', false);
		await t.shot('fo158-r4-depth-only', 'Same model depth-only change for tastebook in Details');
	});

	// (2) Model plus depth change for This project (GPT-5 High, then GPT-5 Low, Details picker)
	await t.step('FO-158 r4 (2): model plus depth change for This project (Details)', async () => {
		const f2 = await t.app.open();
		await f2.waitForFunction(() => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000 });
		await f2.evaluate(() => PM51.revealSetting('ai.models.default-model', { detail: true }));
		await t.page.waitForTimeout(1600);
		const b2 = await readModelState(f2, 'ai.models.default-model');
		await f2.locator('.psx-target-btn').click();
		await f2.getByText('This project (tastebook)', { exact: true }).click();
		await f2.locator('.detail-inspector [data-action="o55-insp-pick"]').click();
		await t.page.waitForTimeout(350);
		await f2.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: 'GPT-5' }).first().click();
		await t.page.waitForTimeout(350);
		const pressedHigh = await pressDepth(f2, 'High', 'model+depth (Details)');
		if (!pressedHigh) return;
		await t.page.waitForTimeout(1500);
		const a2 = await readModelState(f2, 'ai.models.default-model');
		t.log('r4-model-plus-depth-high ' + JSON.stringify(a2));
		await t.check(
			'model+depth (Details): tastebook saves both GPT-5 and High depth',
			a2.resolved.from.level === 'project' && a2.resolved.from.key === 'tastebook' && a2.model === 'openai/gpt-5' && a2.effort === 'High' && a2.ownModel === 'openai/gpt-5' && a2.ownEffort === 'High',
			JSON.stringify({ from: a2.resolved.from, model: a2.model, effort: a2.effort, ownModel: a2.ownModel, ownEffort: a2.ownEffort })
		);
		await t.check(
			'model+depth (Details): History records GPT-5 with High depth',
			a2.historyLen === b2.historyLen + 1 && !!a2.headHist && a2.headHist.sid === 'ai.models.default-model' && a2.headHist.level === 'project' && a2.headHist.key === 'tastebook' && a2.headAfterModel === 'openai/gpt-5' && a2.headAfterEffort === 'High',
			JSON.stringify({ beforeLen: b2.historyLen, afterLen: a2.historyLen, headHist: a2.headHist })
		);
		await t.check(
			'model+depth (Details): Where it applies shows tastebook with GPT-5 and High, Everywhere unchanged',
			/GPT-5/i.test(a2.tastebookLine || '') && /\bHigh\b/i.test(a2.tastebookLine || '') && JSON.stringify(a2.resolved.everywhere) === JSON.stringify(b2.resolved.everywhere) && a2.evEffort === '' && a2.everywhereLine === b2.everywhereLine,
			JSON.stringify({ tastebookLine: a2.tastebookLine, everywhereLine: a2.everywhereLine, beforeLine: b2.everywhereLine, afterEv: a2.resolved.everywhere })
		);
		await checkRowPicker(a2, 'High', 'model+depth (Details)', false);
		// Follow-up: change GPT-5 from High to Low on the same model
		await f2.locator('.detail-inspector [data-action="o55-insp-pick"]').click();
		await t.page.waitForTimeout(350);
		const pressedLow = await pressDepth(f2, 'Low', 'model+depth follow-up (Details)');
		if (!pressedLow) return;
		await t.page.waitForTimeout(1500);
		const a2b = await readModelState(f2, 'ai.models.default-model');
		t.log('r4-model-plus-depth-low ' + JSON.stringify(a2b));
		await t.check(
			'model+depth follow-up (Details): changing GPT-5 to Low saves Low depth for tastebook',
			a2b.resolved.from.level === 'project' && a2b.resolved.from.key === 'tastebook' && a2b.model === 'openai/gpt-5' && a2b.effort === 'Low' && a2b.ownModel === 'openai/gpt-5' && a2b.ownEffort === 'Low',
			JSON.stringify({ from: a2b.resolved.from, model: a2b.model, effort: a2b.effort, ownModel: a2b.ownModel, ownEffort: a2b.ownEffort })
		);
		await t.check(
			'model+depth follow-up (Details): changing GPT-5 High to Low adds a History entry',
			a2b.historyLen === a2.historyLen + 1 && !!a2b.headHist && a2b.headHist.sid === 'ai.models.default-model' && a2b.headHist.level === 'project' && a2b.headHist.key === 'tastebook' && a2b.headBeforeEffort === 'High' && a2b.headAfterModel === 'openai/gpt-5' && a2b.headAfterEffort === 'Low',
			JSON.stringify({ beforeLen: a2.historyLen, afterLen: a2b.historyLen, headHist: a2b.headHist })
		);
		await t.check(
			'model+depth follow-up (Details): Where it applies shows tastebook with GPT-5 and Low, Everywhere unchanged',
			/GPT-5/i.test(a2b.tastebookLine || '') && /\bLow\b/i.test(a2b.tastebookLine || '') && a2b.everywhereLine === b2.everywhereLine && JSON.stringify(a2b.resolved.everywhere) === JSON.stringify(b2.resolved.everywhere),
			JSON.stringify({ tastebookLine: a2b.tastebookLine, everywhereLine: a2b.everywhereLine, beforeLine: b2.everywhereLine })
		);
		await checkRowPicker(a2b, 'Low', 'model+depth follow-up (Details)', false);
		await t.shot('fo158-r4-model-plus-depth', 'Model plus depth (GPT-5 High then Low) for tastebook in Details');
	});

	// (3) Depth-only change from a row's picker (not Details): Everyday building (project:tastebook)
	await t.step('FO-158 r4 (3): depth-only change from a row picker (not Details)', async () => {
		const f3 = await t.app.open();
		await f3.waitForFunction(() => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000 });
		await t.page.waitForTimeout(800);
		const ROW_ID = 'ai.models.worker-model';
		const b3 = await readModelState(f3, ROW_ID);
		const detailsOpen = await f3.evaluate(() => !!document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]'));
		await t.check('depth-only (row picker): Details is closed before using the row picker', !detailsOpen);
		const rowTrig = f3.locator(`#pm-settings-root .o55-msel[data-o55-msel="${ROW_ID}"] [role="combobox"]`).first();
		await t.check('depth-only (row picker): Everyday building row picker is drawn', (await rowTrig.count()) === 1);
		if (!(await rowTrig.count())) return;
		await rowTrig.scrollIntoViewIfNeeded();
		await rowTrig.click();
		await t.page.waitForTimeout(400);
		const pressed = await pressDepth(f3, 'High', 'depth-only (row picker)');
		if (!pressed) return;
		await t.page.waitForTimeout(1500);
		const a3 = await readModelState(f3, ROW_ID);
		t.log('r4-row-depth ' + JSON.stringify(a3));
		await t.check(
			'depth-only (row picker): tastebook override carries the model with High depth',
			a3.resolved.from.level === 'project' && a3.resolved.from.key === 'tastebook' && a3.model === b3.model && a3.effort === 'High' && a3.ownModel === b3.model && a3.ownEffort === 'High',
			JSON.stringify({ beforeModel: b3.model, from: a3.resolved.from, model: a3.model, effort: a3.effort, ownModel: a3.ownModel, ownEffort: a3.ownEffort })
		);
		await t.check(
			'depth-only (row picker): History records the row depth change',
			a3.historyLen === b3.historyLen + 1 && !!a3.headHist && a3.headHist.sid === ROW_ID && a3.headHist.level === 'project' && a3.headHist.key === 'tastebook' && a3.headAfterModel === b3.model && a3.headAfterEffort === 'High',
			JSON.stringify({ beforeLen: b3.historyLen, afterLen: a3.historyLen, headHist: a3.headHist })
		);
		await t.check(
			'depth-only (row picker): Everywhere stays unchanged in model and depth',
			JSON.stringify(a3.resolved.everywhere) === JSON.stringify(b3.resolved.everywhere) && a3.evEffort === '',
			JSON.stringify({ beforeEv: b3.resolved.everywhere, afterEv: a3.resolved.everywhere, evEffort: a3.evEffort })
		);
		await checkRowPicker(a3, 'High', 'depth-only (row picker)', true);
		// Open Details via the row's own end button to verify Where it applies
		const aboutBtn = f3.locator(`#pm-settings-root [id="setting-${ROW_ID}"] > .o55-about`).first();
		await aboutBtn.scrollIntoViewIfNeeded();
		await aboutBtn.click();
		await f3.waitForSelector('#pm-settings-root .detail-inspector[aria-hidden="false"] [data-psx-block="where"]', { timeout: 8000 });
		await t.page.waitForTimeout(500);
		const a3d = await readModelState(f3, ROW_ID);
		await t.check(
			'depth-only (row picker): Details Where it applies shows tastebook with High and Everywhere without High',
			!!a3d.tastebookLine && /\bHigh\b/i.test(a3d.tastebookLine) && !!a3d.everywhereLine && !/\bHigh\b/i.test(a3d.everywhereLine),
			JSON.stringify({ tastebookLine: a3d.tastebookLine, everywhereLine: a3d.everywhereLine })
		);
		await t.shot('fo158-r4-row-depth', 'Depth-only change from Everyday building row picker and its Details panel');
	});

	// FO-158 r6: replay the opening click while the save receipt is still visible.
	const receiptMatrix = [
		['basic-dark', 1920, 1080], ['glass-light', 1280, 500],
		['glass-dark', 1280, 500], ['glass-dark', 740, 900],
	];
	const noteSelector = '#pm-settings-portals > .psx-note[data-open]:not([data-leaving])';
	const detailsPicker = '.detail-inspector[aria-hidden="false"] [data-action="o55-insp-pick"]';
	const rowPicker = (id) => `#pm-settings-root .o55-msel[data-o55-msel="${id}"] [role="combobox"]`;
	async function checkReceipt(frame, selector, who) {
		const hits = await frame.evaluate(({ selector, noteSelector }) => {
			const trigger = document.querySelector(selector);
			const note = document.querySelector(noteSelector);
			const undo = [...(note?.querySelectorAll('button') || [])].find((btn) => btn.textContent === 'Undo');
			const hit = (r, target) => {
				const x = r.left + r.width / 2, y = r.top + r.height / 2;
				const top = document.elementFromPoint(x, y);
				return { x, y, reaches: r.width > 0 && r.height > 0 && target.contains(top), top: top?.outerHTML.split('>')[0] };
			};
			const depth = 'High depth';
			const line = trigger?.querySelector('small')?.firstChild;
			const start = line?.nodeValue?.indexOf(depth) ?? -1;
			const letters = [];
			if (start >= 0) {
				const range = document.createRange();
				for (let i = start; i < start + depth.length; i++) {
					range.setStart(line, i);
					range.setEnd(line, i + 1);
					letters.push(hit(range.getBoundingClientRect(), trigger));
				}
			}
			return {
				visible: !!note && Number(getComputedStyle(note).opacity) > 0.9,
				centre: trigger && hit(trigger.getBoundingClientRect(), trigger), letters,
				undo: undo && hit(undo.getBoundingClientRect(), undo),
			};
		}, { selector, noteSelector });
		await t.check(`${who}: visible receipt leaves the trigger centre and every depth character exposed`,
			hits.visible && hits.centre?.reaches && hits.letters.length === 'High depth'.length && hits.letters.every((p) => p.reaches),
			JSON.stringify(hits));
		await t.check(`${who}: Undo is reachable while the receipt is visible`, hits.visible && hits.undo?.reaches, JSON.stringify(hits.undo));
	}

	for (const [look, width, height] of receiptMatrix) {
		for (const route of ['row', 'Details']) {
			const who = `receipt ${look} ${width}x${height} (${route})`;
			await t.step(who, async () => {
				await t.viewport(width, height);
				const frame = await t.app.open();
				await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });
				await frame.evaluate((look) => PSX.setLook(look), look);
				const details = route === 'Details';
				const id = details ? 'ai.models.default-model' : 'ai.models.worker-model';
				const selector = details ? detailsPicker : rowPicker(id);
				if (details) {
					await frame.locator(`[id="setting-${id}"] > .o55-about`).click({ timeout: 8000 });
					const destination = frame.locator('.psx-target-btn');
					if (!/tastebook/i.test(await destination.innerText({ timeout: 8000 }))) {
						await destination.click({ timeout: 8000 });
						await frame.getByText('This project (tastebook)', { exact: true }).click({ timeout: 8000 });
					}
				}
				const trigger = frame.locator(selector);
				await trigger.scrollIntoViewIfNeeded({ timeout: 8000 });
				const box = await trigger.boundingBox(); // Mouse input uses page coordinates on both surfaces.
				const x = box.x + box.width / 2, y = box.y + box.height / 2;
				await t.page.mouse.click(x, y);
				if (!await pressDepth(frame, 'High', who)) return;
				const note = frame.locator(noteSelector);
				await note.getByText('Saved for tastebook.', { exact: true }).waitFor({ timeout: 8000 });
				await frame.waitForFunction((selector) => document.querySelector(selector) &&
					Number(getComputedStyle(document.querySelector(selector)).opacity) > 0.9, noteSelector, { timeout: 2000 });
				const actual = await frame.evaluate(() => [document.documentElement.dataset.theme, innerWidth, innerHeight]);
				await t.equal(`${who}: look and viewport after save`, actual.join(' '), `${look} ${width} ${height}`);
				await checkReceipt(frame, selector, who);
				if (!details && (width === 1920 || look === 'glass-dark' && width === 1280)) {
					await t.shot(`fo158-receipt-${look}-${width}x${height}`, 'Save receipt and Everyday building’s High depth');
				}
				await t.page.mouse.click(x, y);
				const opened = await trigger.getAttribute('aria-expanded') === 'true';
				const st = await readModelState(frame, id);
				const replay = JSON.stringify({ x, y, opened, saved: st.ownEffort });
				t.log(`${who} replay ${replay}`);
				await t.check(`${who}: clicking the original point reopens the picker and keeps High saved`,
					opened && st.ownEffort === 'High', replay);
				if (opened) await t.page.keyboard.press('Escape');
				if (details) {
					await t.page.keyboard.press('Enter');
					const keyboardOpen = await trigger.getAttribute('aria-expanded') === 'true';
					await t.check(`${who}: Enter also reopens the picker`, keyboardOpen);
					if (keyboardOpen) await t.page.keyboard.press('Escape');
					await frame.locator('.detail-inspector [data-action="close-details"]').click({ timeout: 8000 });
					await frame.locator('.detail-scrim.is-open').waitFor({ state: 'hidden', timeout: 2000 });
					await frame.locator(rowPicker(id)).scrollIntoViewIfNeeded({ timeout: 2000 });
					await checkReceipt(frame, rowPicker(id), `${who} after closing Details`);
					if (look === 'glass-dark' && width === 1280) {
						await t.shot('fo158-receipt-glass-dark-1280x500-after-details', 'Save receipt and Everyday model’s High depth after closing Details');
					}
				}
				if (opened && !details) {
					await note.getByRole('button', { name: 'Undo', exact: true }).click({ timeout: 3000 });
					await frame.waitForFunction((id) => PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', id)) !== 'High', id, { timeout: 3000 });
					await t.check(`${who}: Undo removes the saved High depth`, true);
				}
			});
		}
	}
}
