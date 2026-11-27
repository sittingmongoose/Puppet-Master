// FO-158: choose a destination in Details, then change a value with the Details picker.
export default async function (t) {
	const noteSelector = '#pm-settings-portals > .psx-note[data-open]:not([data-leaving])';
	const rowPicker = (id) => `#pm-settings-root .o55-msel[data-o55-msel="${id}"] [role="combobox"]`;
	const detailsBody = '.detail-inspector[aria-hidden="false"] .detail-body';
	const detailsPicker = '.detail-inspector[aria-hidden="false"] [data-action="o55-insp-pick"]';
	const closeDetails = '.detail-inspector[aria-hidden="false"] [data-action="close-details"]';
	const onlyOpen = t.args.only === 'open-position';
	const onlyReceiptClose = t.args.only === 'receipt-close';
	const onlyClickThrough = t.args.only === 'click-through';
	const onlyExperts = t.args.only === 'experts';
	const onlyHoverPause = t.args.only === 'hover-pause';

	async function closeDetailsIfOpen(frame) {
		await frame.evaluate(() => window.PM_TITLEBAR_NOTIFY?.clearAll?.());
		const isOpen = await frame.evaluate(() => {
			const insp = document.querySelector('#pm-settings-root .detail-inspector');
			return !!insp && insp.getAttribute('aria-hidden') === 'false' && insp.style.display !== 'none';
		});
		if (!isOpen) return;
		await frame.locator(closeDetails).click({ timeout: 8000 });
		await frame.waitForFunction(() => {
			const insp = document.querySelector('#pm-settings-root .detail-inspector');
			return !insp || (insp.getAttribute('aria-hidden') === 'true' && insp.style.display === 'none' && !insp.firstElementChild);
		}, null, { timeout: 5000 });
	}

	async function revealRow(frame, id) {
		const about = frame.locator(`#pm-settings-root [id="setting-${id}"] > .o55-about`).first();
		if (!await about.isVisible().catch(() => false)) {
			await frame.evaluate((sid) => PM51.revealSetting(sid), id);
			await about.waitFor({ state: 'visible', timeout: 8000 });
			await t.page.waitForTimeout(250);
		}
		await about.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
		await t.page.waitForTimeout(200);
		return about;
	}

	async function waitForDetailsOpen(frame, id) {
		await frame.waitForFunction((sid) => {
			const insp = document.querySelector('#pm-settings-root .detail-inspector');
			if (!insp || insp.getAttribute('aria-hidden') !== 'false' || insp.style.display === 'none') return false;
			if (insp.querySelector(':scope > .o55-leaving')) return false;
			const page = insp.querySelector(':scope > .o55-insp-page:not(.o55-leaving)') || insp;
			const code = page.querySelector('.o55-insp-tech code');
			if (!code || code.textContent.trim() !== sid) return false;
			return !!page.querySelector(':scope > .detail-body > [data-psx-block="where"]');
		}, id, { timeout: 8000 });
		await frame.waitForFunction(() => {
			const insp = document.querySelector('#pm-settings-root .detail-inspector');
			return !!insp && insp.classList.contains('is-settled') && !insp.querySelector(':scope > .o55-leaving');
		}, null, { timeout: 4000 }).catch(() => {});
		await t.page.waitForTimeout(350);
	}

	function readOpenPosition(frame) {
		return frame.evaluate(() => {
			const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]');
			const page = insp?.querySelector(':scope > .o55-insp-page:not(.o55-leaving)') || insp;
			const pane = page?.querySelector(':scope > .detail-body');
			if (!pane) return null;
			const body = pane.getBoundingClientRect();
			const rel = (el) => {
				const r = el?.getBoundingClientRect();
				if (!r || !r.width || !r.height) return null;
				return {
					top: Math.round(r.top - body.top),
					bottom: Math.round(r.bottom - body.top),
					visible: r.top >= body.top - 1 && r.bottom <= body.bottom + 1,
				};
			};
			const now = rel(pane.querySelector(':scope > .o55-insp-now'));
			const whereEl = pane.querySelector(':scope > [data-psx-block="where"]');
			const whereHeadEl = whereEl?.querySelector('h4');
			const whereHead = rel(whereHeadEl);
			const where = rel(whereEl);
			return {
				id: page.querySelector('.o55-insp-tech code')?.textContent.trim() || null,
				scrollTop: pane.scrollTop,
				maxScroll: pane.scrollHeight - pane.clientHeight,
				paneH: Math.round(body.height),
				now,
				whereHeadText: whereHeadEl?.textContent.trim() || null,
				whereHead,
				whereVisible: !!where && where.top >= -1 && where.top < body.height,
			};
		});
	}

	async function assertOpenedAtTop(frame, id, who, shotName = null) {
		await waitForDetailsOpen(frame, id);
		const pos = await readOpenPosition(frame);
		t.log(`${who} ${JSON.stringify(pos)}`);
		const ok = !!pos && pos.id === id && pos.scrollTop === 0 &&
			!!pos.now?.visible && pos.whereHeadText === 'Where it applies' &&
			!!pos.whereHead?.visible && pos.whereVisible;
		await t.check(`${who}: Details opens at its top with value card and Where it applies visible`, ok, JSON.stringify(pos));
		if (shotName) await t.shot(shotName, who);
	}

	async function runOpenPosition() {
		const openMatrix = [['basic-dark', 1920, 1080], ['glass-dark', 740, 900]];
		const openRows = [
			{ id: 'ai.models.default-model', kind: 'model' },
			{ id: 'ai.models.worker-model', kind: 'model override' },
			{ id: 'ai.models.high-effort-worker-model', kind: 'effort model' },
			{ id: 'ai.models.default-provider', kind: 'list picker' },
			{ id: 'general.interaction.provider-disclosure', kind: 'toggle' },
			{ id: 'ai.models.interleaved-thinking', kind: 'thinking toggle' },
			{ id: 'ai.models.max-output-tokens', kind: 'number' },
			{ id: 'planning.interview.plan-default-depth', kind: 'depth choice' },
		];
		const switchPairs = [
			{ from: 'ai.models.default-provider', to: 'ai.models.default-model', kind: 'list-to-model switch' },
			{ from: 'ai.models.worker-model', to: 'ai.models.high-effort-worker-model', kind: 'model-to-model switch' },
		];
		for (const [look, width, height] of openMatrix) {
			await t.viewport(width, height);
			const frame = await t.app.open();
			if (!await frame.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'))) {
				await t.check('settings-picker-feed: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
				return;
			}
			await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });
			await frame.evaluate((l) => PSX.setLook(l), look);
			for (const row of openRows) {
				for (const how of ['mouse', 'keyboard']) {
					const who = `open-top ${look} ${width}x${height} ${row.kind} (${row.id}) ${how}`;
					await t.step(who, async () => {
						await closeDetailsIfOpen(frame);
						const about = await revealRow(frame, row.id);
						if (how === 'mouse') await about.click({ timeout: 8000 });
						else { await about.focus(); await t.page.keyboard.press('Enter'); }
						const shotName = row.id === 'ai.models.default-model' && how === 'mouse' ? `fo158-open-${look}-${width}x${height}` : null;
						await assertOpenedAtTop(frame, row.id, who, shotName);
					});
				}
			}
			for (const pair of switchPairs) {
				for (const how of ['mouse', 'keyboard']) {
					const who = `open-top ${look} ${width}x${height} ${pair.kind} (${pair.from} -> ${pair.to}) ${how}`;
					await t.step(who, async () => {
						await closeDetailsIfOpen(frame);
						const about = await revealRow(frame, pair.from);
						await about.click({ timeout: 8000 });
						await waitForDetailsOpen(frame, pair.from);
						const nextBtn = frame.locator(`.detail-inspector[aria-hidden="false"] .o55-insp-near [data-action="setting-details"][data-setting="${pair.to}"]`).first();
						await nextBtn.scrollIntoViewIfNeeded({ timeout: 8000 });
						if (how === 'mouse') await nextBtn.click({ timeout: 8000 });
						else { await nextBtn.focus(); await t.page.keyboard.press('Enter'); }
						await assertOpenedAtTop(frame, pair.to, who);
					});
				}
			}
			await closeDetailsIfOpen(frame);
		}
	}

	if (onlyOpen) {
		await runOpenPosition();
		return;
	}
	if (onlyReceiptClose) {
		await runReceiptClose();
		return;
	}
	if (onlyClickThrough) {
		await runClickThrough();
		return;
	}
	if (onlyExperts) {
		await runExpertsCase();
		return;
	}
	if (onlyHoverPause) {
		await runHoverPause();
		return;
	}

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
	// place), its text content must name the depth, and after a row-picker commit focus must be back on it.
	async function checkRowPicker(st, effort, who, focusBack) {
		await t.check(
			`${who}: row picker stays visible after the depth save`,
			st.rowPickerVisible === true && st.rowDevView === false,
			JSON.stringify({ visible: st.rowPickerVisible, devview: st.rowDevView, rowSmall: st.rowSmall })
		);
		await t.check(
			`${who}: row face text includes ${effort} depth`,
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
		const hits = await readReceiptHits(f3, rowPicker(ROW_ID));
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
		await t.check('depth-only (row picker): every High depth character is exposed during the receipt',
			hits.visible && depthIsExposed(hits), JSON.stringify(hits));
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

	// FO-158 r6 / r6g: replay the opening click on Models rows while the save receipt is visible, and check
	// Details receipt clearance and post-close row clearance (Details scroll keep reverted in r6g -> FO-244).
	const receiptMatrix = [
		['basic-dark', 1920, 1080], ['glass-light', 1280, 500],
		['glass-dark', 1280, 500], ['glass-dark', 740, 900],
	];
	async function checkReceiptBounds(frame, selector, name) {
		const geometry = await frame.evaluate(({ selector, noteSelector }) => {
			const note = document.querySelector(noteSelector);
			const box = (el) => {
				const rect = el?.getBoundingClientRect();
				return rect?.width > 0 && rect.height > 0 ? rect.toJSON() : null;
			};
			const receipt = box(note);
			const control = box(document.querySelector(selector));
			const overlap = receipt && control ? {
				width: Math.max(0, Math.min(receipt.right, control.right) - Math.max(receipt.left, control.left)),
				height: Math.max(0, Math.min(receipt.bottom, control.bottom) - Math.max(receipt.top, control.top)),
			} : null;
			return { visible: !!note && Number(getComputedStyle(note).opacity) > 0.9, receipt, control, overlap };
		}, { selector, noteSelector });
		await t.check(name, Boolean(geometry.visible && geometry.overlap &&
			(geometry.overlap.width === 0 || geometry.overlap.height === 0)), JSON.stringify(geometry));
	}
	function readReceiptHits(frame, selector) {
		return frame.evaluate(({ selector, noteSelector }) => {
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
	}
	function depthIsExposed(hits) {
		return hits.letters.length === 'High depth'.length && hits.letters.every((p) => p.reaches);
	}
	async function checkReceipt(frame, selector, who) {
		const hits = await readReceiptHits(frame, selector);
		await t.check(`${who}: visible receipt leaves the trigger centre and every depth character exposed`,
			hits.visible && hits.centre?.reaches && depthIsExposed(hits),
			JSON.stringify(hits));
		await t.check(`${who}: Undo is reachable while the receipt is visible`, hits.visible && hits.undo?.reaches, JSON.stringify(hits.undo));
		// The receipt can cover the chevron even when the centre and every character remain exposed.
		await checkReceiptBounds(frame, selector, `${who}: visible receipt leaves the full picker trigger clear`);
	}

	async function openReceiptFrame(look, width, height, id, details) {
		await t.viewport(width, height);
		const frame = await t.app.open();
		await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });
		await frame.evaluate((look) => PSX.setLook(look), look);
		if (details) {
			await frame.locator(`[id="setting-${id}"] > .o55-about`).click({ timeout: 8000 });
			await waitForDetailsOpen(frame, id);
			const destination = frame.locator('.psx-target-btn');
			await destination.waitFor({ timeout: 8000 });
			if (!/tastebook/i.test(await destination.innerText({ timeout: 8000 }))) {
				const opt = frame.getByText('This project (tastebook)', { exact: true });
				for (let attempt = 0; attempt < 2; attempt++) {
					await destination.scrollIntoViewIfNeeded({ timeout: 8000 });
					await destination.click({ timeout: 8000 });
					if (await opt.waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false)) break;
				}
				await opt.click({ timeout: 8000 });
			}
		}
		return frame;
	}

	async function waitForSaveReceipt(frame) {
		const note = frame.locator(noteSelector);
		await note.getByText('Saved for tastebook.', { exact: true }).waitFor({ timeout: 8000 });
		await frame.waitForFunction((selector) => document.querySelector(selector) &&
			Number(getComputedStyle(document.querySelector(selector)).opacity) > 0.9, noteSelector, { timeout: 2000 });
		return note;
	}

	for (const [look, width, height] of receiptMatrix) {
		for (const route of ['row', 'Details']) {
			const who = `receipt ${look} ${width}x${height} (${route})`;
			await t.step(who, async () => {
				const details = route === 'Details';
				const id = details ? 'ai.models.default-model' : 'ai.models.worker-model';
				const selector = details ? detailsPicker : rowPicker(id);
				const frame = await openReceiptFrame(look, width, height, id, details);
				const trigger = frame.locator(selector);
				await trigger.scrollIntoViewIfNeeded({ timeout: 8000 });
				const box = await trigger.boundingBox(); // Mouse input uses page coordinates on both surfaces.
				const x = box.x + box.width / 2, y = box.y + box.height / 2;
				await t.page.mouse.click(x, y);
				if (!await pressDepth(frame, 'High', who)) return;
				const note = await waitForSaveReceipt(frame);
				const actual = await frame.evaluate(() => [document.documentElement.dataset.theme, innerWidth, innerHeight]);
				await t.equal(`${who}: look and viewport after save`, actual.join(' '), `${look} ${width} ${height}`);
				if (details) {
					// r6g: Details scroll keep is reverted (FO-244), so scroll the Details picker into view to check
					// receipt clearance, keyboard reopen, Close clearance, and post-close row clearance.
					await trigger.scrollIntoViewIfNeeded({ timeout: 8000 });
					await checkReceipt(frame, selector, who);
					const curBox = await trigger.boundingBox();
					await t.page.mouse.click(curBox.x + curBox.width / 2, curBox.y + curBox.height / 2);
					const reopened = await trigger.getAttribute('aria-expanded') === 'true';
					const st = await readModelState(frame, id);
					await t.check(`${who}: Details picker reopens with High kept`, reopened && st.ownEffort === 'High', JSON.stringify({ reopened, saved: st.ownEffort }));
					if (reopened) await t.page.keyboard.press('Escape');
					await t.page.keyboard.press('Enter');
					const keyboardOpen = await trigger.getAttribute('aria-expanded') === 'true';
					await t.check(`${who}: Enter also reopens the picker`, keyboardOpen);
					if (keyboardOpen) await t.page.keyboard.press('Escape');
					await checkReceiptBounds(frame, closeDetails, `${who}: visible receipt leaves Details Close clear`);
					await frame.locator(closeDetails).click({ timeout: 8000 });
					await frame.locator('.detail-scrim.is-open').waitFor({ state: 'hidden', timeout: 2000 });
					await frame.locator(rowPicker(id)).scrollIntoViewIfNeeded({ timeout: 2000 });
					await checkReceipt(frame, rowPicker(id), `${who} after closing Details`);
					if (look === 'glass-dark' && width === 1280) {
						await t.shot('fo158-receipt-glass-dark-1280x500-after-details', 'Save receipt and Everyday model’s High depth after closing Details');
					}
				} else {
					await checkReceipt(frame, selector, who);
					if (width === 1920 || look === 'glass-dark' && width === 1280) {
						await t.shot(`fo158-receipt-${look}-${width}x${height}`, 'Save receipt and Everyday building’s High depth');
					}
					await t.page.mouse.click(x, y);
					const opened = await trigger.getAttribute('aria-expanded') === 'true';
					const st = await readModelState(frame, id);
					const replay = JSON.stringify({ x, y, opened, saved: st.ownEffort });
					t.log(`${who} replay ${replay}`);
					await t.check(`${who}: clicking the original point reopens the picker and keeps High saved`,
						opened && st.ownEffort === 'High', replay);
					if (opened) {
						await t.page.keyboard.press('Escape');
						await note.getByRole('button', { name: 'Undo', exact: true }).click({ timeout: 3000 });
						await frame.waitForFunction((id) => PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', id)) !== 'High', id, { timeout: 3000 });
						await t.check(`${who}: Undo removes the saved High depth`, true);
					}
				}
			});
		}
	}
	// FO-158 r6f: opening a different setting's Details (or switching Details) dismisses any saved receipt so Close is
	// never covered; saving inside Details keeps the receipt and its Undo working.
	async function clickRealCenter(locator) {
		await locator.evaluate((el) => {
			if (!el.closest('.pm51-popout, .o55-pick-pop, .psx-mpick, .psx-note, .pmr-menu')) {
				el.scrollIntoView({ block: 'center', inline: 'nearest' });
			}
		});
		await t.page.waitForTimeout(80);
		const box = await locator.boundingBox();
		if (!box || box.width <= 0 || box.height <= 0) throw new Error('Target has no bounding box');
		const x = box.x + box.width / 2, y = box.y + box.height / 2;
		await t.page.mouse.click(x, y);
		return { x, y, box };
	}

	async function clickUntilVisible(triggerLoc, targetLoc) {
		for (let attempt = 0; attempt < 2; attempt++) {
			await clickRealCenter(triggerLoc);
			if (await targetLoc.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false)) return;
			await t.page.waitForTimeout(350);
		}
		await targetLoc.waitFor({ state: 'visible', timeout: 8000 });
	}

	async function waitForAnySavedReceipt(frame) {
		const sel = `${noteSelector}[data-kind="saved"]`;
		const note = frame.locator(sel);
		await note.waitFor({ state: 'visible', timeout: 8000 });
		await frame.waitForFunction((s) => {
			const el = document.querySelector(s);
			return !!el && Number(getComputedStyle(el).opacity) > 0.9;
		}, sel, { timeout: 2000 });
		return note;
	}

	function readCloseState(frame) {
		return frame.evaluate(() => {
			const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]');
			const close = insp?.querySelector('[data-action="close-details"]');
			const note = document.querySelector('#pm-settings-portals > .psx-note');
			const closeRect = close?.getBoundingClientRect() || null;
			const noteRect = note?.getBoundingClientRect() || null;
			let closeHit = null;
			if (closeRect && closeRect.width > 0 && closeRect.height > 0) {
				const cx = closeRect.left + closeRect.width / 2;
				const cy = closeRect.top + closeRect.height / 2;
				const top = document.elementFromPoint(cx, cy);
				closeHit = {
					x: cx, y: cy,
					reachesClose: !!top && (top === close || close.contains(top)),
					inReceipt: !!top && !!top.closest?.('.psx-note'),
					top: top ? top.outerHTML.split('>')[0] : null,
				};
			}
			const page = insp?.querySelector(':scope > .o55-insp-page:not(.o55-leaving)') || insp;
			return {
				detailsOpen: !!insp && insp.style.display !== 'none',
				settingId: page?.querySelector('.o55-insp-tech code')?.textContent.trim() || null,
				receiptPresent: !!note,
				receiptVisible: !!note && !note.hasAttribute('data-leaving') && Number(getComputedStyle(note).opacity) > 0.1,
				receiptKind: note?.dataset.kind || null,
				receiptRect: noteRect ? noteRect.toJSON() : null,
				closeRect: closeRect ? closeRect.toJSON() : null,
				closeHit,
			};
		});
	}

	async function openReceiptCloseFrame(look, width, height) {
		await t.viewport(width, height);
		const frame = await t.app.open();
		if (!await frame.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'))) {
			await t.check('settings-picker-feed: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
			return null;
		}
		await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });
		await frame.evaluate((l) => {
			try { localStorage.removeItem('psx.settings-scope.v1'); } catch (e) { /* opaque sandbox */ }
			if (window.PSX?.S) window.PSX.S.tipShown = false;
			return PSX.setLook(l);
		}, look);
		return frame;
	}

	async function assertCloseWorksAtOnce(frame, expectedId, who, shotName = null) {
		await waitForDetailsOpen(frame, expectedId);
		const before = await readCloseState(frame);
		if (shotName) await t.shot(shotName, who);
		const closeLoc = frame.locator(closeDetails);
		const box = await closeLoc.boundingBox();
		let closed = false;
		if (box && box.width > 0 && box.height > 0) {
			await t.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
			closed = await frame.waitForFunction(() => {
				const insp = document.querySelector('#pm-settings-root .detail-inspector');
				return !insp || insp.getAttribute('aria-hidden') === 'true' || insp.style.display === 'none';
			}, null, { timeout: 1500 }).then(() => true, () => false);
		}
		const after = await readCloseState(frame);
		const witness = JSON.stringify({ before, box, closed, after });
		t.log(`${who} ${witness}`);
		await t.check(`${who}: saved receipt is dismissed when Details opens or switches`, !before.receiptPresent, witness);
		await t.check(
			`${who}: hit test at Close centre finds Close (not receipt) and real mouse click closes Details`,
			Boolean(before.closeHit?.reachesClose && !before.closeHit?.inReceipt && closed),
			witness
		);
	}

	async function runReceiptClose() {
		const matrix = [['basic-dark', 1920, 1080], ['glass-dark', 740, 900]];
		for (const [look, width, height] of matrix) {
			// 1. Model setting save -> open a DIFFERENT setting's Details -> Close at once
			await t.step(`receipt-close ${look} ${width}x${height} model`, async () => {
				const who = `receipt-close ${look} ${width}x${height} model`;
				const frame = await openReceiptCloseFrame(look, width, height);
				if (!frame) return;
				const modelOpt = frame.locator('.o55-pick-pop.is-open .o55-pick-list [role="option"]:not([aria-selected="true"]):not([aria-disabled="true"]):not([data-pre="1"])').first();
				await clickUntilVisible(frame.locator(rowPicker('ai.models.default-model')).first(), modelOpt);
				await clickRealCenter(modelOpt);
				await t.page.waitForTimeout(300);
				const depthDef = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort=""]').first();
				if (await depthDef.count()) await clickRealCenter(depthDef);
				await waitForAnySavedReceipt(frame);
				const otherAbout = await revealRow(frame, 'ai.models.worker-model');
				await clickRealCenter(otherAbout);
				await assertCloseWorksAtOnce(frame, 'ai.models.worker-model', who);
			});

			// 2. Effort/depth save (exact Astra repro: Everyday building High -> Varies on Everyday model) -> Close at once
			await t.step(`receipt-close ${look} ${width}x${height} effort/depth`, async () => {
				const who = `receipt-close ${look} ${width}x${height} effort/depth`;
				const frame = await openReceiptCloseFrame(look, width, height);
				if (!frame) return;
				const depthOpt = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort="High"]').first();
				await clickUntilVisible(frame.locator(rowPicker('ai.models.worker-model')).first(), depthOpt);
				await clickRealCenter(depthOpt);
				await waitForAnySavedReceipt(frame);
				const otherAbout = await revealRow(frame, 'ai.models.default-model');
				await clickRealCenter(otherAbout);
				const shot = look === 'basic-dark' && width === 1920 ? 'fo158-r6f-effort-close-basic-1920'
					: look === 'glass-dark' && width === 740 ? 'fo158-r6f-effort-close-glass-740' : null;
				await assertCloseWorksAtOnce(frame, 'ai.models.default-model', who, shot);
			});

			// 3. Toggle save -> open a DIFFERENT setting's Details -> Close at once
			await t.step(`receipt-close ${look} ${width}x${height} toggle`, async () => {
				const who = `receipt-close ${look} ${width}x${height} toggle`;
				const frame = await openReceiptCloseFrame(look, width, height);
				if (!frame) return;
				await revealRow(frame, 'general.interaction.provider-disclosure');
				const sw = frame.locator('#pm-settings-root [id="setting-general.interaction.provider-disclosure"] [role="switch"]').first();
				await clickRealCenter(sw);
				await waitForAnySavedReceipt(frame);
				const otherAbout = await revealRow(frame, 'ai.models.default-model');
				await clickRealCenter(otherAbout);
				await assertCloseWorksAtOnce(frame, 'ai.models.default-model', who);
			});

			// 4. List/choice save -> open a DIFFERENT setting's Details -> Close at once
			await t.step(`receipt-close ${look} ${width}x${height} list/choice`, async () => {
				const who = `receipt-close ${look} ${width}x${height} list/choice`;
				const frame = await openReceiptCloseFrame(look, width, height);
				if (!frame) return;
				await revealRow(frame, 'ai.models.default-provider');
				const dd = frame.locator('#pm-settings-root [id="setting-ai.models.default-provider"] .pm51-dd-trigger').first();
				const opt = frame.locator('.pm51-popout.pm51-dd-list.is-open [role="option"][aria-selected="false"]:not([aria-disabled="true"])').first();
				await clickUntilVisible(dd, opt);
				await clickRealCenter(opt);
				await waitForAnySavedReceipt(frame);
				const otherAbout = await revealRow(frame, 'ai.models.default-model');
				await clickRealCenter(otherAbout);
				await assertCloseWorksAtOnce(frame, 'ai.models.default-model', who);
			});

			// 5. Save inside Details -> switch Details to another setting via Next to it -> receipt dismissed & Close works
			await t.step(`receipt-close ${look} ${width}x${height} switch inside Details`, async () => {
				const who = `receipt-close ${look} ${width}x${height} switch inside Details`;
				const frame = await openReceiptFrame(look, width, height, 'ai.models.default-model', true);
				await frame.evaluate(() => {
					try { localStorage.removeItem('psx.settings-scope.v1'); } catch (e) { /* opaque sandbox */ }
					if (window.PSX?.S) window.PSX.S.tipShown = false;
				});
				const depthOpt = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort="High"]').first();
				await clickUntilVisible(frame.locator(detailsPicker).first(), depthOpt);
				await clickRealCenter(depthOpt);
				await waitForSaveReceipt(frame);
				const nextBtn = frame.locator('.detail-inspector[aria-hidden="false"] .o55-insp-near [data-action="setting-details"]').first();
				const nextId = await nextBtn.getAttribute('data-setting');
				await clickRealCenter(nextBtn);
				await assertCloseWorksAtOnce(frame, nextId, who);
			});

			// 6. Save inside Details -> receipt and Undo stay visible and Undo works
			await t.step(`receipt-close ${look} ${width}x${height} save inside Details keeps Undo`, async () => {
				const who = `receipt-close ${look} ${width}x${height} save inside Details keeps Undo`;
				const frame = await openReceiptFrame(look, width, height, 'ai.models.default-model', true);
				const depthOpt = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort="High"]').first();
				await clickUntilVisible(frame.locator(detailsPicker).first(), depthOpt);
				await clickRealCenter(depthOpt);
				const note = await waitForSaveReceipt(frame);
				const hits = await readReceiptHits(frame, detailsPicker);
				const stillOpen = await frame.evaluate(() => {
					const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]');
					const code = insp?.querySelector('.o55-insp-tech code');
					return !!insp && insp.style.display !== 'none' && code?.textContent.trim() === 'ai.models.default-model';
				});
				const savedHigh = await frame.evaluate(() => PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', 'ai.models.default-model')));
				await t.check(
					`${who}: Details save keeps the saved receipt and Undo reachable`,
					Boolean(stillOpen && savedHigh === 'High' && hits.visible && hits.undo?.reaches),
					JSON.stringify({ stillOpen, savedHigh, hits })
				);
				const undoBtn = note.getByRole('button', { name: 'Undo', exact: true });
				await clickRealCenter(undoBtn);
				const undone = await frame.waitForFunction(() =>
					PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', 'ai.models.default-model')) !== 'High',
				null, { timeout: 3000 }).then(() => true, () => false);
				await t.check(`${who}: Undo inside Details restores the previous value`, undone);
			});
		}
	}

	// FO-158 r6g: click-through saved receipts across every save path, viewport (740x900, 1280x500, 1920x1080),
	// and look (Basic light/dark, Glass light/dark), plus Undo and Astra's expanded 'For experts' case.
	async function resetLookState(frame, look) {
		await frame.evaluate(async (l) => {
			try { localStorage.removeItem('psx.settings-scope.v1'); } catch (e) { /* opaque sandbox */ }
			await window.PSX.command({ cmd: 'reset' });
			if (window.PSX?.S) window.PSX.S.tipShown = false;
			window.PSX.hideNote && window.PSX.hideNote({ immediate: true });
			window.PM_TITLEBAR_NOTIFY?.clearAll?.();
			window.PSX.setLook(l);
		}, look);
		await frame.waitForFunction((l) => document.documentElement.getAttribute('data-theme') === l, look, { timeout: 6000 }).catch(() => {});
		await t.page.waitForTimeout(350);
		await frame.evaluate(() => window.PSX.hideNote && window.PSX.hideNote({ immediate: true }));
		await closeDetailsIfOpen(frame);
	}

	async function wheelControlUnderReceipt(frame, ctrlSel, scrollerSel) {
		const plan = await frame.evaluate(({ ctrlSel, scrollerSel, noteSelector }) => {
			const note = document.querySelector(`${noteSelector}[data-kind="saved"]`);
			const ctrl = document.querySelector(ctrlSel);
			const pane = document.querySelector(scrollerSel);
			if (!note || !ctrl || !pane) return { ok: false, why: 'missing', hasNote: !!note, hasCtrl: !!ctrl, hasPane: !!pane };
			const nR = note.getBoundingClientRect();
			const cR = ctrl.getBoundingClientRect();
			const pR = pane.getBoundingClientRect();
			const btns = [...note.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
			const btnTop = btns.length ? Math.min(...btns.map((r) => r.top)) : nR.bottom;
			const bodyTop = nR.top + 4, bodyBot = Math.max(bodyTop + 6, btnTop - 4);
			const visTop = Math.max(cR.top, pR.top, 0), visBot = Math.min(cR.bottom, pR.bottom, innerHeight);
			const ovX = Math.min(cR.right, nR.right) - Math.max(cR.left, nR.left);
			const ovBodyY = Math.min(visBot, bodyBot) - Math.max(visTop, bodyTop);
			if (ovX < 4) return { ok: false, why: 'no-x-overlap', cR: cR.toJSON(), nR: nR.toJSON() };
			if (ovBodyY >= 4) return { ok: true, already: true };
			const targetY = (bodyTop + bodyBot) / 2;
			const curY = (cR.top + cR.bottom) / 2;
			const dy = curY - targetY; // wheel deltaY > 0 moves content UP (decreases cR.top)
			const maxScroll = pane.scrollHeight - pane.clientHeight;
			const targetScroll = Math.round(pane.scrollTop + dy);
			if (targetScroll < 0 || targetScroll > maxScroll) {
				return { ok: false, why: 'scroll-out-of-range', scrollTop: pane.scrollTop, targetScroll, maxScroll, cR: cR.toJSON(), nR: nR.toJSON() };
			}
			return { ok: true, already: false, dy: targetScroll - pane.scrollTop, targetScroll };
		}, { ctrlSel, scrollerSel, noteSelector });
		if (!plan.ok || plan.already) return plan;
		const paneBox = await frame.locator(scrollerSel).first().boundingBox();
		if (!paneBox) return { ok: false, why: 'no-pane-box' };
		await t.page.mouse.move(paneBox.x + paneBox.width / 2, paneBox.y + Math.min(paneBox.height / 2, 120));
		await t.page.mouse.wheel(0, plan.dy);
		await frame.waitForFunction(({ scrollerSel, target }) => {
			const p = document.querySelector(scrollerSel);
			return !!p && Math.abs(p.scrollTop - target) <= 3;
		}, { scrollerSel, target: plan.targetScroll }, { timeout: 2500 }).catch(() => {});
		await t.page.waitForTimeout(100);
		return { ok: true, scrolled: true, dy: plan.dy };
	}

	async function probeReceiptBodyClick(frame, ctrlSel, scrollerSel = null) {
		const info = await frame.evaluate(({ ctrlSel, scrollerSel, noteSelector }) => {
			const note = document.querySelector(`${noteSelector}[data-kind="saved"]`);
			const ctrl = document.querySelector(ctrlSel);
			if (!note || !ctrl) return { ok: false, why: 'missing', hasNote: !!note, hasCtrl: !!ctrl };
			const nR = note.getBoundingClientRect();
			const cR = ctrl.getBoundingClientRect();
			const pR = scrollerSel ? document.querySelector(scrollerSel)?.getBoundingClientRect() : null;
			const clipL = Math.max(0, pR ? pR.left : 0);
			const clipR = Math.min(innerWidth, pR ? pR.right : innerWidth);
			const clipT = Math.max(0, pR ? pR.top : 0);
			const clipB = Math.min(innerHeight, pR ? pR.bottom : innerHeight);
			const vL = Math.max(cR.left, clipL), vR = Math.min(cR.right, clipR);
			const vT = Math.max(cR.top, clipT), vB = Math.min(cR.bottom, clipB);
			const btns = [...note.querySelectorAll('button')].map((b) => ({
				text: b.textContent.trim(),
				rect: b.getBoundingClientRect().toJSON(),
			}));
			const buttonOverlaps = [];
			for (const b of btns) {
				const bw = Math.min(vR, b.rect.right) - Math.max(vL, b.rect.left);
				const bh = Math.min(vB, b.rect.bottom) - Math.max(vT, b.rect.top);
				if (bw > 0.5 && bh > 0.5) {
					buttonOverlaps.push({
						button: b.text,
						buttonRect: b.rect,
						controlRect: cR.toJSON(),
						overlap: { width: +bw.toFixed(2), height: +bh.toFixed(2) },
					});
				}
			}
			const oL = Math.max(vL, nR.left), oR = Math.min(vR, nR.right);
			const oT = Math.max(vT, nR.top), oB = Math.min(vB, nR.bottom);
			if (oR - oL < 4 || oB - oT < 4) {
				return { ok: false, why: 'no-overlap', noteRect: nR.toJSON(), ctrlRect: cR.toJSON(), buttonOverlaps };
			}
			const inBtn = (x, y) => btns.some((b) =>
				x >= b.rect.left - 2 && x <= b.rect.right + 2 && y >= b.rect.top - 2 && y <= b.rect.bottom + 2);
			let chosen = null;
			// Prefer a point inside the receipt body (not on any receipt button), scanning the overlap rectangle.
			const padX = Math.min(3, (oR - oL) / 4), padY = Math.min(3, (oB - oT) / 4);
			const xs = [0.5, 0.25, 0.75, 0.15, 0.85].map((f) => oL + padX + (oR - oL - 2 * padX) * f);
			const ys = [0.5, 0.25, 0.75, 0.15, 0.85].map((f) => oT + padY + (oB - oT - 2 * padY) * f);
			for (const y of ys) {
				for (const x of xs) {
					if (!inBtn(x, y)) { chosen = { x, y }; break; }
				}
				if (chosen) break;
			}
			if (!chosen) {
				return { ok: false, why: 'only-under-receipt-buttons', noteRect: nR.toJSON(), ctrlRect: cR.toJSON(), buttonOverlaps };
			}
			const top = document.elementFromPoint(chosen.x, chosen.y);
			return {
				ok: true,
				point: chosen,
				noteRect: nR.toJSON(),
				ctrlRect: cR.toJSON(),
				notePointerEvents: getComputedStyle(note).pointerEvents,
				buttonOverlaps,
				hitResolvesToControl: !!top && (top === ctrl || ctrl.contains(top)),
				hitInReceipt: !!top && !!top.closest?.('.psx-note'),
				hitTag: top ? top.outerHTML.split('>')[0] : null,
			};
		}, { ctrlSel, scrollerSel, noteSelector });
		if (!info.ok) return info;
		const box = await frame.locator(ctrlSel).first().boundingBox();
		if (!box) return { ...info, ok: false, why: 'no-locator-box' };
		const pageX = box.x + (info.point.x - info.ctrlRect.x);
		const pageY = box.y + (info.point.y - info.ctrlRect.y);
		return { ...info, pageX, pageY };
	}

	async function verifyUndoWorks(frame, verifyReverted, who) {
		const note = frame.locator(`${noteSelector}[data-kind="saved"]`);
		const undoBtn = note.getByRole('button', { name: 'Undo', exact: true });
		const hit = await frame.evaluate((sel) => {
			const n = document.querySelector(`${sel}[data-kind="saved"]`);
			const b = [...(n?.querySelectorAll('button') || [])].find((x) => x.textContent.trim() === 'Undo');
			if (!b) return null;
			const r = b.getBoundingClientRect();
			const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return { rect: r.toJSON(), reaches: !!top && (top === b || b.contains(top)), top: top?.outerHTML.split('>')[0] };
		}, noteSelector);
		await t.check(`${who}: receipt Undo button is hit-testable`, Boolean(hit?.reaches), JSON.stringify(hit));
		if (!hit?.reaches) return;
		await clickRealCenter(undoBtn);
		const reverted = await verifyReverted();
		await t.check(`${who}: clicking Undo restores the previous value`, reverted);
	}

	async function runClickThrough() {
		const sizes = [[740, 900], [1280, 500], [1920, 1080]];
		const looks = ['basic-dark', 'basic-light', 'glass-light', 'glass-dark'];
		const allButtonOverlaps = [];

		for (const [width, height] of sizes) {
			await t.viewport(width, height);
			const frame = await t.app.open();
			if (!await frame.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'))) {
				await t.check('settings-picker-feed: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
				return;
			}
			await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });

			for (const look of looks) {
				const tag = `click-through ${look} ${width}x${height}`;

				// 1. Where-it-applies project Change (Astra finding #1: Everyday building -> tastebook -> Change -> High -> Done -> Save)
				await t.step(`${tag} project-change`, async () => {
					const who = `${tag} project-change`;
					await resetLookState(frame, look);
					const about = await revealRow(frame, 'ai.models.worker-model');
					await clickRealCenter(about);
					await waitForDetailsOpen(frame, 'ai.models.worker-model');
					const chSel = '.detail-inspector[aria-hidden="false"] [data-psx-line="project:tastebook"] [data-psx-key$=":change"]';
					await clickRealCenter(frame.locator(chSel));
					await t.page.waitForTimeout(250);
					if (!await frame.locator('.psx-mpick').isVisible().catch(() => false)) {
						await clickRealCenter(frame.locator('.detail-inspector [data-psx-block="where"] .o55-pick-trigger'));
					}
					await clickRealCenter(frame.locator('.psx-mpick .psx-seg button[data-depth="High"]'));
					await clickRealCenter(frame.locator('.psx-mpick .psx-mpick-foot button', { hasText: 'Done' }));
					await clickRealCenter(frame.locator('.detail-inspector [data-psx-key="project:tastebook:save"]'));
					await waitForAnySavedReceipt(frame);

					// At 740x900 Change is naturally covered; at 1280x500 wheel Details so Change is under the receipt;
					// at 1920x1080 Change sits above the receipt (scrollTop=0), so wheel Details picker under the receipt.
					let targetSel = chSel;
					let expectKind = 'inline-editor';
					const wRes = await wheelControlUnderReceipt(frame, chSel, detailsBody);
					if (!wRes.ok) {
						targetSel = detailsPicker;
						expectKind = 'details-picker';
						await wheelControlUnderReceipt(frame, detailsPicker, detailsBody);
					}
					const probe = await probeReceiptBodyClick(frame, targetSel, detailsBody);
					if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: expectKind, overlaps: probe.buttonOverlaps });
					if (width === 740 && look === 'glass-dark') {
						await t.shot('fo158-r6g-project-change-glass-dark-740', 'Where-it-applies Change under saved receipt body');
					}
					let acted = false;
					if (probe.ok) {
						await t.page.mouse.click(probe.pageX, probe.pageY);
						await t.page.waitForTimeout(250);
						if (expectKind === 'inline-editor') {
							acted = await frame.evaluate(() => !!document.querySelector('.detail-inspector [data-psx-block="where"] .o55-pick-trigger'));
							if (acted) {
								await frame.evaluate(() => { window.PSX?.places?.close && window.PSX.places.close(); });
								const cancelBtn = frame.locator('.detail-inspector [data-psx-key="project:tastebook:cancel"]');
								if (await cancelBtn.count()) await cancelBtn.click().catch(() => {});
							}
						} else {
							acted = await frame.evaluate(() => !!document.querySelector('.o55-pick-pop.is-open'));
							if (acted) await t.page.keyboard.press('Escape');
						}
					}
					const witness = JSON.stringify({ expectKind, wRes, probe, acted });
					t.log(`${who} ${witness}`);
					await t.check(`${who}: receipt body click-through hits ${expectKind} and activates it`,
						Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && acted), witness);
					// Verify Undo after a Details save (for tastebook project Change)
					if (width === 740 || width === 1920) {
						await verifyUndoWorks(
							frame,
							() => frame.waitForFunction(() => PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', 'ai.models.worker-model')) !== 'High', null, { timeout: 3000 }).then(() => true, () => false),
							`${who} Undo`
						);
					}
				});

				// 2. Dropdown/choice: "Service tried first" (Astra finding #2) — plus "Prompt caching" when Service tried first
				// sits above the bottom receipt band at 740x900 / 1920x1080.
				await t.step(`${tag} service-dropdown`, async () => {
					const who = `${tag} service-dropdown`;
					await resetLookState(frame, look);
					await revealRow(frame, 'ai.models.default-provider');
					const beforeProvider = await frame.evaluate(() => PSX.resolve('ai.models.default-provider', PSX.S.ctx).value);
					const ddSel = '#pm-settings-root [id="setting-ai.models.default-provider"] .pm51-dd-trigger';
					const opt = frame.locator('.pm51-popout.pm51-dd-list.is-open [role="option"][aria-selected="false"]:not([aria-disabled="true"])').first();
					for (let attempt = 0; attempt < 2; attempt++) {
						await clickRealCenter(frame.locator(ddSel).first());
						if (await opt.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false)) break;
						await t.page.waitForTimeout(350);
					}
					await opt.waitFor({ state: 'visible', timeout: 8000 });
					await clickRealCenter(opt);
					await waitForAnySavedReceipt(frame);

					const scrollerSel = '#pm-settings-root .document-scroll';
					const wRes = await wheelControlUnderReceipt(frame, ddSel, scrollerSel);
					if (wRes.ok) {
						// Direct overlap on Service tried first (1280x500): click through receipt body onto dropdown
						const probe = await probeReceiptBodyClick(frame, ddSel, scrollerSel);
						if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: 'service-dd', overlaps: probe.buttonOverlaps });
						if (width === 1280 && look === 'glass-dark') {
							await t.shot('fo158-r6g-service-dd-glass-dark-1280', 'Service tried first under saved receipt body');
						}
						let opened = false;
						if (probe.ok) {
							await t.page.mouse.click(probe.pageX, probe.pageY);
							opened = await frame.locator('.pm51-popout.pm51-dd-list.is-open').waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false);
							if (opened) await t.page.keyboard.press('Escape');
						}
						const witness = JSON.stringify({ wRes, probe, opened });
						t.log(`${who} ${witness}`);
						await t.check(`${who}: receipt body click-through hits Service tried first and opens its menu`,
							Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && opened), witness);

						// Also explicitly hit-test and click the chevron SVG region under the receipt (Astra finding #2)
						const chevInfo = await frame.evaluate(({ ddSel, noteSelector }) => {
							const note = document.querySelector(`${noteSelector}[data-kind="saved"]`);
							const dd = document.querySelector(ddSel);
							const chev = dd?.querySelector('svg, .pm51-dd-chev, .chev');
							if (!note || !dd || !chev) return null;
							const nR = note.getBoundingClientRect(), cR = chev.getBoundingClientRect(), dR = dd.getBoundingClientRect();
							const cx = cR.left + cR.width / 2, cy = cR.top + cR.height / 2;
							const insideNote = cx >= nR.left && cx <= nR.right && cy >= nR.top && cy <= nR.bottom;
							const btns = [...note.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
							const onBtn = btns.some((b) => cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom);
							const top = document.elementFromPoint(cx, cy);
							return { cx, cy, insideNote, onBtn, dR: dR.toJSON(), reaches: !!top && (top === dd || dd.contains(top)), inReceipt: !!top?.closest?.('.psx-note'), top: top?.outerHTML.split('>')[0] };
						}, { ddSel, noteSelector });
						if (chevInfo?.insideNote && !chevInfo.onBtn) {
							const ddBox = await frame.locator(ddSel).first().boundingBox();
							const px = ddBox.x + (chevInfo.cx - chevInfo.dR.x), py = ddBox.y + (chevInfo.cy - chevInfo.dR.y);
							await t.page.mouse.click(px, py);
							const chevOpened = await frame.locator('.pm51-popout.pm51-dd-list.is-open').waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false);
							if (chevOpened) await t.page.keyboard.press('Escape');
							await t.check(`${who}: chevron under receipt resolves to dropdown and opens menu`,
								Boolean(chevInfo.reaches && !chevInfo.inReceipt && chevOpened), JSON.stringify({ chevInfo, chevOpened }));
						}
					} else {
						// Tall viewport (740x900, 1920x1080): Service tried first sits at top above bottom receipt.
						// Try a non-advanced dropdown lower in Providers (ai.usage.chart-type) then Prompt caching (ai.models.cache-strategy).
						let chosenId = null, w2 = null, probe = null, ddTarget = null;
						for (const candId of ['ai.usage.chart-type', 'ai.models.cache-strategy']) {
							await resetLookState(frame, look);
							await revealRow(frame, candId);
							const candSel = `#pm-settings-root [id="setting-${candId}"] .pm51-dd-trigger`;
							const opt2 = frame.locator('.pm51-popout.pm51-dd-list.is-open [role="option"][aria-selected="false"]:not([aria-disabled="true"])').first();
							for (let attempt = 0; attempt < 2; attempt++) {
								await clickRealCenter(frame.locator(candSel).first());
								if (await opt2.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false)) break;
								await t.page.waitForTimeout(350);
							}
							await opt2.waitFor({ state: 'visible', timeout: 8000 });
							await clickRealCenter(opt2);
							await waitForAnySavedReceipt(frame);
							w2 = await wheelControlUnderReceipt(frame, candSel, scrollerSel);
							if (w2.ok) {
								chosenId = candId;
								ddTarget = candSel;
								probe = await probeReceiptBodyClick(frame, candSel, scrollerSel);
								break;
							}
						}
						if (!probe) {
							// Fallback if neither dropdown overlaps receipt X: test the active row's Details trigger under the receipt.
							chosenId = 'ai.models.cache-strategy (details)';
							ddTarget = '#pm-settings-root [id="setting-ai.models.cache-strategy"] > .o55-about';
							w2 = await wheelControlUnderReceipt(frame, ddTarget, scrollerSel);
							probe = await probeReceiptBodyClick(frame, ddTarget, scrollerSel);
						}
						if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: chosenId, overlaps: probe.buttonOverlaps });
						let opened = false;
						if (probe.ok) {
							await t.page.mouse.click(probe.pageX, probe.pageY);
							if (chosenId.endsWith('(details)')) {
								opened = await frame.waitForFunction(() => {
									const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]');
									return !!insp && insp.style.display !== 'none';
								}, null, { timeout: 2000 }).then(() => true, () => false);
							} else {
								opened = await frame.locator('.pm51-popout.pm51-dd-list.is-open').waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false);
								if (opened) await t.page.keyboard.press('Escape');
							}
						}
						const witness = JSON.stringify({ chosenId, w2, probe, opened });
						t.log(`${who} (${chosenId}) ${witness}`);
						await t.check(`${who}: receipt body click-through hits edited dropdown and opens its menu`,
							Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && opened), witness);
					}
					// Verify Undo after row dropdown save on representative size
					if (width === 1280 && wRes.ok) {
						await verifyUndoWorks(
							frame,
							() => frame.waitForFunction((prev) => PSX.resolve('ai.models.default-provider', PSX.S.ctx).value === prev, beforeProvider, { timeout: 3000 }).then(() => true, () => false),
							`${who} Undo`
						);
					}
				});

				// 3. List setting: "Service try order" (ai.models.provider-priority)
				await t.step(`${tag} list`, async () => {
					const who = `${tag} list`;
					await resetLookState(frame, look);
					await revealRow(frame, 'ai.models.provider-priority');
					const listSel = '#pm-settings-root [id="setting-ai.models.provider-priority"] .o55-struct';
					const addBtn = frame.locator('.o55-le [data-o55-le="add"]').first();
					await clickUntilVisible(frame.locator(listSel).first(), addBtn);
					await t.page.waitForTimeout(250);
					await clickRealCenter(addBtn);
					await t.page.waitForTimeout(150);
					await clickRealCenter(frame.locator('.pm51-panel-foot .btn.primary, [data-action="panel-primary"]').first());
					await waitForAnySavedReceipt(frame);
					const scrollerSel = '#pm-settings-root .document-scroll';
					const wRes = await wheelControlUnderReceipt(frame, listSel, scrollerSel);
					const probe = await probeReceiptBodyClick(frame, listSel, scrollerSel);
					if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: 'list-struct', overlaps: probe.buttonOverlaps });
					let opened = false;
					if (probe.ok) {
						await t.page.mouse.click(probe.pageX, probe.pageY);
						opened = await frame.locator('.o55-le').first().waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false);
						if (opened) await t.page.keyboard.press('Escape');
					}
					const witness = JSON.stringify({ wRes, probe, opened });
					t.log(`${who} ${witness}`);
					await t.check(`${who}: receipt body click-through hits edited list button and opens list editor`,
						Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && opened), witness);
				});

				// 4. Toggle setting: "Move to another service when one is down" (ai.models.provider-fallback)
				await t.step(`${tag} toggle`, async () => {
					const who = `${tag} toggle`;
					await resetLookState(frame, look);
					await revealRow(frame, 'ai.models.provider-fallback');
					const swSel = '#pm-settings-root [id="setting-ai.models.provider-fallback"] [role="switch"]';
					const aboutSel = '#pm-settings-root [id="setting-ai.models.provider-fallback"] > .o55-about';
					await clickRealCenter(frame.locator(swSel).first());
					await waitForAnySavedReceipt(frame);
					const afterFirst = await frame.locator(swSel).first().getAttribute('aria-checked');
					const scrollerSel = '#pm-settings-root .document-scroll';
					// In 2-column Basic 1920x1080 the switch itself overlaps receipt X; in narrow/Glass stacked rows the switch
					// sits left of the receipt so test that row's Details button (.o55-about) directly under the receipt body.
					const wSw = await wheelControlUnderReceipt(frame, swSel, scrollerSel);
					let targetSel = swSel, expectKind = 'switch';
					if (!wSw.ok) {
						targetSel = aboutSel;
						expectKind = 'row-details';
						await wheelControlUnderReceipt(frame, aboutSel, scrollerSel);
					}
					const probe = await probeReceiptBodyClick(frame, targetSel, scrollerSel);
					if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: expectKind, overlaps: probe.buttonOverlaps });
					let acted = false;
					if (probe.ok) {
						await t.page.mouse.click(probe.pageX, probe.pageY);
						await t.page.waitForTimeout(250);
						if (expectKind === 'switch') {
							const afterSecond = await frame.locator(swSel).first().getAttribute('aria-checked');
							acted = afterSecond !== afterFirst;
						} else {
							acted = await frame.waitForFunction(() => {
								const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]');
								return !!insp && insp.style.display !== 'none';
							}, null, { timeout: 2000 }).then(() => true, () => false);
						}
					}
					const witness = JSON.stringify({ expectKind, wSw, probe, acted });
					t.log(`${who} ${witness}`);
					await t.check(`${who}: receipt body click-through hits ${expectKind} and activates it`,
						Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && acted), witness);
				});

				// 5. Model row picker (ai.models.default-model): receipt placed at top under bell; verify click-through on
				// a live control covered by the receipt body (Media & Output workspace tab) activates it.
				await t.step(`${tag} model-row`, async () => {
					const who = `${tag} model-row`;
					await resetLookState(frame, look);
					await revealRow(frame, 'ai.models.default-model');
					const mpSel = rowPicker('ai.models.default-model');
					const mOpt = frame.locator('.o55-pick-pop.is-open .o55-pick-list [role="option"]:not([aria-selected="true"]):not([aria-disabled="true"]):not([data-pre="1"])').first();
					await clickUntilVisible(frame.locator(mpSel).first(), mOpt);
					await clickRealCenter(mOpt);
					await t.page.waitForTimeout(250);
					const dDef = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort=""]').first();
					if (await dDef.count()) await clickRealCenter(dDef);
					await waitForAnySavedReceipt(frame);
					await frame.evaluate(() => window.PM_TITLEBAR_NOTIFY?.clearAll?.());
					// Find an inactive workspace tab covered by the model receipt's non-button body
					const tabSel = '#pm-settings-root button.workspace-tab[data-action="jump-workspace"][data-workspace="media"]';
					const probe = await probeReceiptBodyClick(frame, tabSel, null);
					if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: 'workspace-tab-media', overlaps: probe.buttonOverlaps });
					let switched = false;
					if (probe.ok) {
						await t.page.mouse.click(probe.pageX, probe.pageY);
						switched = await frame.waitForFunction(() => {
							const b = document.querySelector('#pm-settings-root button.workspace-tab[data-workspace="media"]');
							return !!b && (b.classList.contains('active') || b.classList.contains('is-current'));
						}, null, { timeout: 2000 }).then(() => true, () => false);
					}
					const witness = JSON.stringify({ probe, switched });
					t.log(`${who} ${witness}`);
					await t.check(`${who}: model receipt body click-through hits covered tab and activates it`,
						Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && switched), witness);
				});

				// 6. Effort/depth save (ai.models.worker-model High): receipt placed at top under bell; verify click-through
				// hits covered tab AND Undo still works on row effort save.
				await t.step(`${tag} effort-depth`, async () => {
					const who = `${tag} effort-depth`;
					await resetLookState(frame, look);
					await revealRow(frame, 'ai.models.worker-model');
					const efSel = rowPicker('ai.models.worker-model');
					const hOpt = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort="High"]').first();
					await clickUntilVisible(frame.locator(efSel).first(), hOpt);
					await clickRealCenter(hOpt);
					await waitForAnySavedReceipt(frame);
					await frame.evaluate(() => window.PM_TITLEBAR_NOTIFY?.clearAll?.());
					const tabSel = '#pm-settings-root button.workspace-tab[data-action="jump-workspace"][data-workspace="media"]';
					const probe = await probeReceiptBodyClick(frame, tabSel, null);
					if (probe.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: 'workspace-tab-media', overlaps: probe.buttonOverlaps });
					let switched = false;
					if (probe.ok) {
						await t.page.mouse.click(probe.pageX, probe.pageY);
						switched = await frame.waitForFunction(() => {
							const b = document.querySelector('#pm-settings-root button.workspace-tab[data-workspace="media"]');
							return !!b && (b.classList.contains('active') || b.classList.contains('is-current'));
						}, null, { timeout: 2000 }).then(() => true, () => false);
					}
					const witness = JSON.stringify({ probe, switched });
					t.log(`${who} ${witness}`);
					await t.check(`${who}: effort/depth receipt body click-through hits covered tab and activates it`,
						Boolean(probe.ok && probe.hitResolvesToControl && !probe.hitInReceipt && switched), witness);
					if (width === 740 || width === 1920) {
						await verifyUndoWorks(
							frame,
							() => frame.waitForFunction(() => PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', 'ai.models.worker-model')) !== 'High', null, { timeout: 3000 }).then(() => true, () => false),
							`${who} Undo`
						);
					}
				});

				// 7. Settings header project Change button during project switching (Astra 6f final report):
				// save, click header Change (through receipt where covered) to switch project to harbor, then immediately
				// click header Change through the still-visible receipt at once.
				await t.step(`${tag} header-change`, async () => {
					const who = `${tag} header-change`;
					await resetLookState(frame, look);
					await revealRow(frame, 'ai.models.worker-model');
					const efSel = rowPicker('ai.models.worker-model');
					const hOpt = frame.locator('.o55-pick-pop.is-open [role="listbox"][aria-label^="Thinking depth"] [role="option"][data-effort="High"]').first();
					await clickUntilVisible(frame.locator(efSel).first(), hOpt);
					await clickRealCenter(hOpt);
					await waitForAnySavedReceipt(frame);
					await frame.evaluate(() => window.PM_TITLEBAR_NOTIFY?.clearAll?.());

					const headSel = '#pm-settings-root .document-toolbar > .psx-head button[data-psx-head="view"]';
					const menuLoc = frame.locator('[role="menu"][aria-label="Change"]').first();
					const probe1 = await probeReceiptBodyClick(frame, headSel, null);
					if (probe1.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: 'header-change-before-switch', overlaps: probe1.buttonOverlaps });

					let opened1 = false, switchedHarbor = false, receiptStillOpen = false, probe2 = null, opened2 = false;
					if (probe1.ok) {
						await t.page.mouse.click(probe1.pageX, probe1.pageY);
					} else {
						await clickRealCenter(frame.locator(headSel).first());
					}
					opened1 = await menuLoc.waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false);
					if (opened1) {
						const harborOpt = menuLoc.locator('[role="menuitem"]').filter({ hasText: 'harbor' }).first();
						await harborOpt.waitFor({ state: 'visible', timeout: 2500 });
						await clickRealCenter(harborOpt);
						switchedHarbor = await frame.waitForFunction(() => window.PSX?.S?.ctx?.project === 'harbor', null, { timeout: 3000 }).then(() => true, () => false);
						await t.page.waitForTimeout(150);
						receiptStillOpen = await frame.locator(`${noteSelector}[data-kind="saved"]`).isVisible().catch(() => false);
						if (width === 1920 && look === 'glass-dark') {
							await t.shot('fo158-r6g-header-change-glass-dark-1920', 'Settings header Change under saved receipt right after switching project');
						}
						probe2 = await probeReceiptBodyClick(frame, headSel, null);
						if (probe2.buttonOverlaps?.length) allButtonOverlaps.push({ who, target: 'header-change-after-switch', overlaps: probe2.buttonOverlaps });
						if (probe2.ok) {
							await t.page.mouse.click(probe2.pageX, probe2.pageY);
						} else {
							await clickRealCenter(frame.locator(headSel).first());
						}
						opened2 = await menuLoc.waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false);
						if (opened2) await t.page.keyboard.press('Escape');
					}
					const witness = JSON.stringify({ probe1, opened1, switchedHarbor, receiptStillOpen, probe2, opened2 });
					t.log(`${who} ${witness}`);
					const mustOverlap = width === 1920;
					const firstOk = probe1.ok ? (probe1.hitResolvesToControl && !probe1.hitInReceipt && opened1) : (!mustOverlap && opened1);
					const secondOk = probe2?.ok ? (probe2.hitResolvesToControl && !probe2.hitInReceipt && opened2) : (!mustOverlap && opened2);
					await t.check(`${who}: header Change works through saved receipt during and right after project switch`,
						Boolean(firstOk && switchedHarbor && receiptStillOpen && secondOk), witness);
				});
			}
		}
		t.log(`BUTTON_OVERLAPS_SUMMARY ${JSON.stringify(allButtonOverlaps)}`);
	}

	// FO-158 r6g: Astra's expanded 'For experts' case in Glass dark 740x900.
	// With round 6's Details scroll keep reverted, saving High from a ~5 px top sliver must behave as round 5 does
	// and must not shift the destination button under the repeat click or open the destination menu by surprise.
	async function runExpertsCase() {
		const who = 'experts glass-dark 740x900 (ai.models.worker-model)';
		await t.step(who, async () => {
			await t.viewport(740, 900);
			const frame = await t.app.open();
			if (!await frame.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'))) {
				await t.check('settings-picker-feed: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
				return;
			}
			await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });
			await resetLookState(frame, 'glass-dark');
			const id = 'ai.models.worker-model';
			const about = await revealRow(frame, id);
			await clickRealCenter(about);
			await waitForDetailsOpen(frame, id);

			// Three ordinary prior project edits (matches Astra's repro so Recent changes has 3 rows)
			for (const eff of ['High', 'Low', '']) {
				const ch = frame.locator('.detail-inspector[aria-hidden="false"] [data-psx-line="project:tastebook"] [data-psx-key$=":change"]');
				await clickRealCenter(ch);
				await t.page.waitForTimeout(250);
				if (!await frame.locator('.psx-mpick').isVisible().catch(() => false)) {
					await clickRealCenter(frame.locator('.detail-inspector [data-psx-block="where"] .o55-pick-trigger'));
				}
				await clickRealCenter(frame.locator(`.psx-mpick .psx-seg button[data-depth="${eff}"]`));
				await clickRealCenter(frame.locator('.psx-mpick .psx-mpick-foot button', { hasText: 'Done' }));
				await clickRealCenter(frame.locator('.detail-inspector [data-psx-key="project:tastebook:save"]'));
				const n = await waitForAnySavedReceipt(frame);
				await clickRealCenter(n.locator('[data-close]'));
				await t.page.waitForTimeout(250);
			}

			// Expand 'For experts'
			const expSummary = frame.locator('.detail-inspector[aria-hidden="false"] details.o55-insp-tech > summary');
			await clickRealCenter(expSummary);
			await t.page.waitForTimeout(250);

			// Wheel until about 5 px of the Details model picker shows at the top of .detail-body
			const beforeWheel = await frame.evaluate(({ detailsBody, detailsPicker }) => {
				const pane = document.querySelector(detailsBody);
				const trig = document.querySelector(detailsPicker);
				const b = pane.getBoundingClientRect();
				const p = trig.getBoundingClientRect();
				const targetScroll = Math.min(
					pane.scrollHeight - pane.clientHeight,
					Math.round(pane.scrollTop + (p.bottom - b.top) - 5)
				);
				return { scrollTop: pane.scrollTop, maxScroll: pane.scrollHeight - pane.clientHeight, targetScroll, expertOpen: !!document.querySelector('.detail-inspector details.o55-insp-tech')?.open };
			}, { detailsBody, detailsPicker });
			const paneBox = await frame.locator(detailsBody).boundingBox();
			await t.page.mouse.move(paneBox.x + paneBox.width / 2, paneBox.y + paneBox.height / 2);
			await t.page.mouse.wheel(0, beforeWheel.targetScroll - beforeWheel.scrollTop);
			await frame.waitForFunction(({ detailsBody, target }) =>
				Math.abs(document.querySelector(detailsBody).scrollTop - target) <= 2,
			{ detailsBody, target: beforeWheel.targetScroll }, { timeout: 3000 }).catch(() => {});
			await t.page.waitForTimeout(150);

			const placed = await frame.evaluate(({ detailsBody, detailsPicker }) => {
				const pane = document.querySelector(detailsBody);
				const trig = document.querySelector(detailsPicker);
				const b = pane.getBoundingClientRect();
				const p = trig.getBoundingClientRect();
				const top = Math.max(p.top, b.top), bottom = Math.min(p.bottom, b.bottom);
				const pt = { x: p.left + p.width / 2, y: (top + bottom) / 2 };
				const hit = document.elementFromPoint(pt.x, pt.y);
				return {
					scrollTop: pane.scrollTop, maxScroll: pane.scrollHeight - pane.clientHeight,
					exposed: bottom - top, pt, hitSelf: trig.contains(hit),
					picker: p.toJSON(), pane: b.toJSON(),
					expertOpen: !!document.querySelector('.detail-inspector details.o55-insp-tech')?.open,
					historyRows: document.querySelectorAll('.detail-inspector .psx-rline').length,
				};
			}, { detailsBody, detailsPicker });

			const trigBox = await frame.locator(detailsPicker).boundingBox();
			const clickX = trigBox.x + (placed.pt.x - placed.picker.x);
			const clickY = trigBox.y + (placed.pt.y - placed.picker.y);
			await t.check(`${who}: ~5 px top sliver is clickable with For experts open`,
				Boolean(placed.hitSelf && placed.expertOpen && placed.exposed >= 3 && placed.exposed <= 8),
				JSON.stringify(placed));
			if (!placed.hitSelf) return;

			await t.page.mouse.click(clickX, clickY);
			if (!await pressDepth(frame, 'High', who)) return;
			await waitForAnySavedReceipt(frame);
			await t.page.waitForTimeout(250);

			const afterSave = await frame.evaluate(({ detailsBody, detailsPicker, pt }) => {
				const pane = document.querySelector(detailsBody);
				const trig = document.querySelector(detailsPicker);
				const top = document.elementFromPoint(pt.x, pt.y);
				return {
					scrollTop: pane.scrollTop, maxScroll: pane.scrollHeight - pane.clientHeight,
					picker: trig?.getBoundingClientRect().toJSON() || null,
					expertOpen: !!document.querySelector('.detail-inspector details.o55-insp-tech')?.open,
					hitAtPoint: top ? {
						tag: top.tagName, cls: top.className,
						text: (top.innerText || top.textContent || '').trim().slice(0, 60),
						isTargetBtn: !!top.closest?.('.psx-target-btn'),
						isPicker: !!top.closest?.(detailsPicker),
						inReceipt: !!top.closest?.('.psx-note'),
						outer: top.outerHTML.split('>')[0],
					} : null,
					savedEffort: PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', 'ai.models.worker-model')),
				};
			}, { detailsBody, detailsPicker, pt: placed.pt });

			// Repeat press at exact same point
			await t.page.mouse.click(clickX, clickY);
			await t.page.waitForTimeout(250);
			const afterRepeat = await frame.evaluate(() => {
				const destMenu = document.querySelector('.pmr-menu-list, .pm51-popout.pm51-menu.is-open, [role="menu"][aria-label="Choosing here changes"]');
				const targetExpanded = document.querySelector('.psx-target-btn')?.getAttribute('aria-expanded') || null;
				const menuVisible = !!destMenu && getComputedStyle(destMenu).display !== 'none';
				return {
					menuVisible, targetExpanded,
					menuLabel: destMenu?.getAttribute('aria-label') || null,
					savedEffort: PSX.effortOf(PSX.getAt(PSX.W, 'project', 'tastebook', 'ai.models.worker-model')),
				};
			});
			const witness = JSON.stringify({ beforeWheel, placed, clickX, clickY, afterSave, afterRepeat });
			t.log(`EXPERTS_CASE ${witness}`);
			await t.check(`${who}: repeat press does not hit destination button or open destination menu`,
				Boolean(afterSave.savedEffort === 'High' && afterRepeat.savedEffort === 'High' &&
					!afterSave.hitAtPoint?.isTargetBtn && !afterRepeat.menuVisible && afterRepeat.targetExpanded !== 'true'),
				witness);
		});
	}

	// FO-158 r6h (recheck7 L2): resting the real mouse on the saved receipt's click-through text pauses its 6 s
	// lifetime past 7 s with Undo and Ctrl+Z still working, and moving the mouse away closes it within its lifetime.
	async function runHoverPause() {
		const matrix = [['basic-dark', 1920, 1080], ['glass-dark', 1280, 500]];
		const id = 'ai.models.provider-fallback';
		const swSel = `#pm-settings-root [id="setting-${id}"] [role="switch"]`;
		const savedNoteSel = `${noteSelector}[data-kind="saved"]`;

		async function readAwayPoint(frame) {
			const rootBox = await frame.locator('#pm-settings-root').boundingBox();
			const noteBox = await frame.locator(savedNoteSel).first().boundingBox().catch(() => null);
			const cand = [
				{ x: rootBox.x + 24, y: rootBox.y + 24 },
				{ x: rootBox.x + 24, y: rootBox.y + Math.min(rootBox.height - 24, 200) },
			];
			for (const pt of cand) {
				if (!noteBox || pt.x < noteBox.x - 8 || pt.x > noteBox.x + noteBox.width + 8 ||
					pt.y < noteBox.y - 8 || pt.y > noteBox.y + noteBox.height + 8) {
					return pt;
				}
			}
			return cand[0];
		}

		async function saveAndHoverText(frame, sw) {
			const awayBefore = await readAwayPoint(frame);
			await t.page.mouse.move(awayBefore.x, awayBefore.y, { steps: 2 });
			const beforeVal = await frame.evaluate((sid) => PSX.resolve(sid, PSX.S.ctx).value, id);
			await clickRealCenter(sw);
			await waitForAnySavedReceipt(frame);
			const savedVal = await frame.evaluate((sid) => PSX.resolve(sid, PSX.S.ctx).value, id);
			const textInfo = await frame.evaluate((sel) => {
				const note = document.querySelector(sel);
				const title = note?.querySelector('.psx-note-title');
				if (!note || !title) return null;
				const nR = note.getBoundingClientRect();
				const tR = title.getBoundingClientRect();
				const cx = tR.left + tR.width / 2, cy = tR.top + tR.height / 2;
				const btns = [...note.querySelectorAll('button')].map((b) => b.getBoundingClientRect());
				const onButton = btns.some((b) => cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom);
				const top = document.elementFromPoint(cx, cy);
				return {
					noteRect: nR.toJSON(),
					titleRect: tR.toJSON(),
					cx, cy,
					insideNote: cx >= nR.left && cx <= nR.right && cy >= nR.top && cy <= nR.bottom,
					onButton,
					notePointerEvents: getComputedStyle(note).pointerEvents,
					hitInReceipt: !!top && !!top.closest?.('.psx-note'),
				};
			}, savedNoteSel);
			const titleBox = await frame.locator(`${savedNoteSel} .psx-note-title`).first().boundingBox();
			const hoverX = titleBox.x + titleBox.width / 2;
			const hoverY = titleBox.y + titleBox.height / 2;
			await t.page.mouse.move(hoverX, hoverY, { steps: 4 });
			await t.page.waitForTimeout(7500);
			const afterHold = await frame.evaluate((sel) => {
				const note = document.querySelector(sel);
				const active = document.activeElement;
				return {
					stillOpen: !!note && Number(getComputedStyle(note).opacity) > 0.9,
					activeTag: active ? active.tagName : null,
				};
			}, savedNoteSel);
			return { beforeVal, savedVal, changed: savedVal !== beforeVal, textInfo, hoverPt: { x: hoverX, y: hoverY }, ...afterHold };
		}

		for (const [look, width, height] of matrix) {
			const who = `hover-pause ${look} ${width}x${height}`;
			await t.step(who, async () => {
				await t.viewport(width, height);
				const frame = await t.app.open();
				if (!await frame.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'))) {
					await t.check('settings-picker-feed: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
					return;
				}
				await frame.waitForFunction(() => !!window.PSX?.lastReport, null, { timeout: 60000 });
				await resetLookState(frame, look);
				await revealRow(frame, id);
				const sw = frame.locator(swSel).first();

				// 1. Rest on receipt text > 7 s -> still open, and clicking Undo restores the previous value.
				const p1 = await saveAndHoverText(frame, sw);
				let undoWorked = false;
				if (p1.stillOpen) {
					const undoBtn = frame.locator(savedNoteSel).getByRole('button', { name: 'Undo', exact: true }).first();
					await clickRealCenter(undoBtn);
					undoWorked = await frame.waitForFunction(({ sid, prev }) =>
						PSX.resolve(sid, PSX.S.ctx).value === prev,
					{ sid: id, prev: p1.beforeVal }, { timeout: 3000 }).then(() => true, () => false);
				}
				await frame.evaluate(() => window.PSX.hideNote && window.PSX.hideNote({ immediate: true }));
				await t.page.waitForTimeout(150);

				// 2. Rest on receipt text > 7 s -> still open, and Ctrl+Z still restores the previous value.
				const p2 = await saveAndHoverText(frame, sw);
				let ctrlZWorked = false;
				if (p2.stillOpen) {
					await t.page.keyboard.press('Control+z');
					ctrlZWorked = await frame.waitForFunction(({ sid, prev }) =>
						PSX.resolve(sid, PSX.S.ctx).value === prev,
					{ sid: id, prev: p2.beforeVal }, { timeout: 3000 }).then(() => true, () => false);
				}
				await frame.evaluate(() => window.PSX.hideNote && window.PSX.hideNote({ immediate: true }));
				await t.page.waitForTimeout(150);

				// 3. Rest on receipt text > 7 s -> still open, then moving mouse away closes it within its normal lifetime.
				const p3 = await saveAndHoverText(frame, sw);
				let closedAfterLeave = false, closedAfterLeaveMs = null;
				if (p3.stillOpen) {
					const away = await readAwayPoint(frame);
					const leaveAt = Date.now();
					await t.page.mouse.move(away.x, away.y, { steps: 4 });
					closedAfterLeave = await frame.waitForFunction(() =>
						!document.querySelector('#pm-settings-portals > .psx-note'),
					null, { timeout: 7500 }).then(() => true, () => false);
					closedAfterLeaveMs = Date.now() - leaveAt;
				}
				const closedInLifetime = closedAfterLeave && closedAfterLeaveMs >= 1000 && closedAfterLeaveMs <= 7500;
				const textOk = (p) => Boolean(p.changed && p.textInfo?.insideNote && !p.textInfo?.onButton &&
					p.textInfo?.notePointerEvents === 'none' && !p.textInfo?.hitInReceipt && p.stillOpen);
				const ok = textOk(p1) && undoWorked && textOk(p2) && ctrlZWorked && textOk(p3) && closedInLifetime;
				const witness = JSON.stringify({ p1, undoWorked, p2, ctrlZWorked, p3, closedAfterLeave, closedAfterLeaveMs, closedInLifetime });
				t.log(`HOVER_PAUSE ${who} ${witness}`);
				await t.check(`${who}: hovering receipt text pauses past 7 s with Undo and Ctrl+Z working, and moving away closes it in its lifetime`, ok, witness);
			});
		}
	}

	await runOpenPosition();
	await runReceiptClose();
	await runClickThrough();
	await runExpertsCase();
	await runHoverPause();
}
