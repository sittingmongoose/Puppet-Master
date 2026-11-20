// Jared's Settings review of 2026-11-20, on stream F's new base (BRIEF-jared-1120-fixes.md in the share folder): the
// four failures this layer caused in F's settings-model-rows and settings-model-nicknames checks, Jared's choice for
// how a model field that follows another reads (option A), and his scroll-highlight case in Abilities. Each of the
// first five fails on the layer at 3af916f4b6 and passes after the fix; J1120-6 is a coverage walk that also runs on
// plain PMConcept7 (the control). It runs on the single-file app build with the PuppetMaster kit's config:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT --inventory Plans/settings_inventory.json
//   browser-check run Concepts/settings-scope/opus-5.5/tools/checks/jared1120.check.mjs \
//     --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=$OUT/settings-scope-app.html
// --grep J1120-<n> runs one. The tests:
//   J1120-1 nicknames  F's Model nicknames list (FO-186) is shown, not hidden behind the layer's "No nicknames yet":
//                      its Add line is on top where it is drawn, and typing a nickname, choosing its model and pressing
//                      Add saves the line, and the layer routes it (layer/world.js holds)
//   J1120-2 depth      a model row's thinking depth survives PM12_KIMI.reloadProject when only the depth changed: the
//                      reload reads the layer's project copy, refreshed first (layer/feed.js guardReload)
//   J1120-3 inherit    Everyday building's picker lists its inherit choice first, "Same as Everyday model" naming the
//                      model it gives now, and no choice reads "Not in the list now" (the demo's tastebook value is a
//                      model this page lists, layer/world.js)
//   J1120-4 740        at 740x900 every model control and Settings itself stay inside the window, the header's words
//                      are not squeezed away and its Change can be pressed (layer/rows.js headLine, rows.css)
//   J1120-5 option A   the per-place editor's inherit choice and a Where it applies line read "Same as Everyday model ·
//                      <model>" (no "… here", no "(…)"), and nothing in the panel or the picker says "Same as the project"
//   J1120-6 Abilities  AI & Providers › Media abilities › Abilities walked by real wheel steps: the index lights the
//                      section in view at every judged step (F's settings-index-spy rule), and "For the whole project"
//                      never lights while another section is in view
const ID_NICK = 'ai.models.model-alias';
const layered = (t) => t.root.evaluate(() => document.documentElement.hasAttribute('data-psx-layer'));
async function boot(t, w = 1920, h = 1080) {
	const f = await t.app.open();
	await t.viewport(w, h);
	if (await layered(t)) await t.until('the layer is booted', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function press(t, f, sel) {
	const loc = f.locator(sel).filter({ visible: true }).first();
	if (!(await loc.count())) return false;
	await loc.click({ timeout: 8000 }).catch(() => {});
	await t.settle();
	return true;
}
async function toModels(t, f) {
	await press(t, f, '#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]');
	await press(t, f, '#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="providers"]');
	await press(t, f, '#pm-settings-root .pm51-mgr .pm51-tabs [data-tab="models"]');
}
async function skipUnlessLayered(t) {
	if (await layered(t)) return false;
	await t.check('not a settings-scope build, skipped (build it with tools/build_standalone.py)', true);
	return true;
}
/* the open shared picker of a row (F's .o55-pick-pop) as a person reads it */
const POP = () => {
	const p = document.querySelector('.o55-pick-pop.is-open');
	if (!p) return null;
	return [...p.querySelectorAll('[role="option"]')].map((o) => ({ index: o.dataset.index, name: (((o.querySelector('strong') || o).firstChild || {}).textContent || '').trim(), small: ((o.querySelector('small') || {}).textContent || '').trim(), selected: o.getAttribute('aria-selected') === 'true', pre: o.dataset.pre === '1', levels: o.dataset.levels || '' }));
};
const FACE = (id) => {
	const c = document.querySelector(`#pm-settings-root .o55-msel[data-o55-msel="${CSS.escape(id)}"] [role="combobox"]`);
	return c ? { name: ((c.querySelector('strong') || {}).textContent || '').trim(), small: ((c.querySelector('small') || {}).textContent || '').trim() } : null;
};
async function closePickers(t, f) {
	for (let i = 0; i < 3 && (await f.evaluate(() => !!document.querySelector('.o55-pick-pop.is-open, .psx-mpick'))); i++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(200); }
}
/* FO-239: a resize lands a frame after viewport() returns; wait for the focus host and #panel-settings to agree */
async function settingsAt(t, f, w, h) {
	await t.viewport(w, h);
	await f.evaluate(async () => {
		const panel = document.getElementById('panel-settings'), host = window.PM7_SYSTEMS_INTEGRATION, t0 = performance.now();
		let last = -1, same = 0;
		while (performance.now() - t0 < 8000) {
			const p = host && host.host_projection ? host.host_projection() : null;
			const expect = !!(p && p.settings_active && p.shell_width > 0 && p.projected_with_chat < p.threshold);
			const width = panel ? Math.round(panel.getBoundingClientRect().width) : -1;
			if (p && width > 0 && document.body.classList.contains('pm7-settings-focus-host') === expect) { same = width === last ? same + 1 : 1; last = width; if (same >= 3) return; } else same = 0;
			await new Promise(requestAnimationFrame);
		}
	});
	await t.page.waitForTimeout(400);
}

export const tests = {
	'J1120-1 nicknames: F’s list is shown and its Add line saves a line': async (t) => {
		const f = await boot(t);
		if (await skipUnlessLayered(t)) return;
		await toModels(t, f);
		await f.locator(`#pm-settings-root [id="setting-${ID_NICK}"]`).first().scrollIntoViewIfNeeded().catch(() => {});
		await t.page.waitForTimeout(400);
		const s0 = await f.evaluate((id) => {
			const row = document.querySelector(`#pm-settings-root [id="setting-${CSS.escape(id)}"]`);
			const list = row && row.querySelector('.o55-nick'), inp = row && row.querySelector('.o55-nick-input');
			const r = inp && inp.getBoundingClientRect();
			const at = r && r.width ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
			return { row: !!row, list: !!list && list.getClientRects().length > 0, words: !!(row && row.querySelector(':scope > .setting-control > .psx-devval')), devview: !!(row && row.classList.contains('psx-devview')), onTop: !!at && at === inp, changed: !!(row && (row.classList.contains('is-changed') || row.querySelector('.o55-changed:not(.o55-needed)'))) };
		}, ID_NICK);
		await t.check('J1120-1 the Model nicknames row is drawn', s0.row);
		await t.check('J1120-1 F’s list of nicknames is shown, not the layer’s words in its place', s0.list && !s0.words && !s0.devview, JSON.stringify(s0));
		await t.check('J1120-1 the Add line’s nickname box is on top where it is drawn', s0.onTop, JSON.stringify(s0));
		await t.check('J1120-1 with no lines of your own the row starts at its default, not marked Changed', !s0.changed, JSON.stringify(s0));
		if (!s0.onTop) return;
		const row = f.locator(`#pm-settings-root [id="setting-${ID_NICK}"]`);
		await row.locator('.o55-nick-input').click({ timeout: 4000 });
		await t.page.keyboard.type('quick');
		await row.locator('.o55-nick-add [role="combobox"]').click({ timeout: 4000 });
		await t.page.waitForTimeout(450);
		const opt = f.locator('.o55-pick-pop.is-open [role="option"]').filter({ hasText: 'Claude Haiku' }).first();
		await t.check('J1120-1 the Add line’s picker offers Claude Haiku', (await opt.count()) > 0);
		if (await opt.count()) { await opt.click(); await t.page.waitForTimeout(350); }
		await closePickers(t, f);
		await row.locator('[data-action="pm51-nick-add"]').click({ timeout: 4000 });
		await t.page.waitForTimeout(900);
		const s1 = await f.evaluate((id) => {
			const v = window.PM51.value(id), w = window.PSX.resolve(id, window.PSX.S.ctx);
			return { page: v && typeof v === 'object' ? v.quick || null : null, world: w && w.value && typeof w.value === 'object' ? w.value.quick || null : null, line: !!document.querySelector(`#pm-settings-root [id="setting-${CSS.escape(id)}"] .o55-nick-line[data-nick="quick"]`), note: window.PSX.lastNote ? window.PSX.lastNote.title : '' };
		}, ID_NICK);
		await t.check(`J1120-1 Add saves “quick” meaning Claude Haiku and shows its line (${s1.page})`, /haiku/i.test(String(s1.page)) && s1.line, JSON.stringify(s1));
		await t.check(`J1120-1 the layer routes the new line where the value comes from (${s1.note})`, /haiku/i.test(String(s1.world)), JSON.stringify(s1));
		/* removing the last line of your own: the page goes back to its default, and so does the place the line was kept */
		await f.locator(`#pm-settings-root [id="setting-${ID_NICK}"] .o55-nick-line[data-nick="quick"] [data-action="pm51-nick-remove"]`).click({ timeout: 4000 }).catch(() => {});
		await t.page.waitForTimeout(1200);
		const s2 = await f.evaluate((id) => {
			const row = document.querySelector(`#pm-settings-root [id="setting-${CSS.escape(id)}"]`), P = window.PSX;
			return { own: row ? row.querySelectorAll('.o55-nick-line:not(.is-builtin)').length : -1, changed: !!(row && (row.classList.contains('is-changed') || row.querySelector('.o55-changed:not(.o55-needed)'))), everywhere: JSON.stringify(P.getAt(P.W, 'everywhere', null, id)), layerChanged: P.resolve(id, P.S.ctx).changed };
		}, ID_NICK);
		await t.check('J1120-1 removing the last line puts the row back to its default: no line of your own, not Changed, nothing kept Everywhere', s2.own === 0 && !s2.changed && !s2.layerChanged && s2.everywhere === undefined, JSON.stringify(s2));
	},

	'J1120-2 depth: a model row keeps its thinking depth through a project reload': async (t) => {
		const f = await boot(t);
		if (await skipUnlessLayered(t)) return;
		await toModels(t, f);
		const ID = 'ai.models.default-model';
		const trig = f.locator(`#pm-settings-root .o55-msel[data-o55-msel="${ID}"] [role="combobox"]`).first();
		await trig.scrollIntoViewIfNeeded().catch(() => {});
		await trig.click({ timeout: 8000 }); await t.page.waitForTimeout(450);
		const opts = (await f.evaluate(POP)) || [];
		/* the model the row has now: only its depth changes, so the setting's value does not move */
		const mine = opts.find((o) => o.selected && o.levels);
		await t.check('J1120-2 the Everyday model’s picker offers its own model with depths', !!mine, JSON.stringify(opts.slice(0, 3)));
		if (!mine) { await closePickers(t, f); return; }
		const level = mine.levels.split('|').includes('Max') ? 'Max' : mine.levels.split('|').slice(-1)[0];
		const before0 = await f.evaluate((id) => JSON.stringify(window.PM51.value(id)), ID);
		await f.locator(`.o55-pick-pop.is-open [role="option"][data-index="${mine.index}"]`).first().click();
		await t.page.waitForTimeout(350);
		await f.locator('[role="listbox"][aria-label^="Thinking depth"] [role="option"]').filter({ hasText: level }).first().click();
		await t.page.waitForTimeout(800);
		const read = (id) => ({ face: (() => { const c = document.querySelector(`#pm-settings-root .o55-msel[data-o55-msel="${CSS.escape(id)}"] [role="combobox"] small`); return c ? c.textContent.trim() : ''; })(), effort: (window.PM51.modelResolve(id) || {}).effort || '', value: JSON.stringify(window.PM51.value(id)) });
		const b = await f.evaluate(read, ID);
		await t.check(`J1120-2 the presses saved ${mine.name} at ${level} depth, the value unchanged ("${b.face}")`, b.effort === level && b.face.includes(`${level} depth`) && b.value === before0, JSON.stringify({ b, before0 }));
		await f.evaluate(() => window.PM12_KIMI.reloadProject());
		await t.settle();
		await toModels(t, f);
		const a = await f.evaluate(read, ID);
		await t.check(`J1120-2 after PM12_KIMI.reloadProject the row still names ${level} depth ("${a.face}")`, a.face.includes(`${level} depth`) && a.effort === level && a.value === b.value, JSON.stringify(a));
	},

	'J1120-3 inherit: Everyday building lists its inherit choice first, naming the model it gives': async (t) => {
		const f = await boot(t);
		if (await skipUnlessLayered(t)) return;
		await toModels(t, f);
		const ID = 'ai.models.worker-model';
		const face = await f.evaluate(FACE, ID);
		const ready = await f.evaluate((id) => { const v = window.PM51.value(id); return v === 'inherit' || (window.PM51.readyModels() || []).some((m) => m.value === v); }, ID);
		await t.check('J1120-3 its value is its inherit choice or a model this page lists', ready, JSON.stringify(face));
		await t.check(`J1120-3 its face never says “Not in the list now” (“${face && face.name} · ${face && face.small}”)`, !!face && !/not in the list/i.test(face.small), JSON.stringify(face));
		await f.locator(`#pm-settings-root .o55-msel[data-o55-msel="${ID}"] [role="combobox"]`).first().click({ timeout: 8000 });
		await t.page.waitForTimeout(450);
		const opts = (await f.evaluate(POP)) || [];
		const want = await f.evaluate(() => { const l = String(window.PM51.valueLabel('ai.models.default-model', window.PM51.value('ai.models.default-model'))).split(' · '); return l.length > 1 ? l.slice(0, -1).join(' · ') : l[0]; });
		const first = opts[0] || {};
		await t.check(`J1120-3 its first choice is “Same as Everyday model” naming ${want} (“${first.name} · ${first.small}”)`, first.name === 'Same as Everyday model' && first.small.includes(want), JSON.stringify(opts.slice(0, 2)));
		await t.check('J1120-3 no choice reads “Not in the list now”', !opts.some((o) => /not in the list/i.test(o.small)), JSON.stringify(opts.filter((o) => /not in the list/i.test(o.small))));
		await closePickers(t, f);
	},

	'J1120-4 740: model controls, Settings and the header stay inside a 740x900 window': async (t) => {
		const f = await boot(t);
		if (await skipUnlessLayered(t)) return;
		await toModels(t, f);
		await settingsAt(t, f, 740, 900);
		const m = await f.evaluate(() => {
			const vw = innerWidth, host = document.getElementById('panel-settings').getBoundingClientRect();
			const doc = document.getElementById('settings-document').getBoundingClientRect();
			const out = [];
			document.querySelectorAll('#pm-settings-root .o55-msel').forEach((x) => {
				if (!x.getClientRects().length) return;
				const r = (x.querySelector('[role="combobox"]') || x).getBoundingClientRect();
				if (r.right > vw + 0.5 || r.left < -0.5) out.push(`${x.dataset.o55Msel} ${Math.round(r.left)}..${Math.round(r.right)}`);
			});
			const head = document.querySelector('#pm-settings-root .document-toolbar > .psx-head');
			const ctx = head && head.querySelector('.psx-head-ctx'), btn = head && head.querySelector('[data-psx-head="view"]');
			const br = btn && btn.getBoundingClientRect();
			const at = br && br.width ? document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2) : null;
			return { vw, host: Math.round(host.width), doc: Math.round(doc.width), n: document.querySelectorAll('#pm-settings-root .o55-msel').length, out, head: !!head, ctxW: ctx ? Math.round(ctx.getBoundingClientRect().width) : 0, ctxText: ctx ? ctx.textContent.trim() : '', changeOnTop: !!(at && btn.contains(at)), pad: head ? head.style.paddingRight : '' };
		});
		await t.check(`J1120-4 Settings is no wider than its place (${m.doc} px in ${m.host} px)`, m.doc <= m.host + 0.5, JSON.stringify(m));
		await t.check(`J1120-4 every model control on Models is inside the window (${m.n} drawn)`, m.n > 0 && m.out.length === 0, m.out.slice(0, 6).join(' | '));
		await t.check(`J1120-4 the header’s words keep their room (“${m.ctxText}”, ${m.ctxW} px, padding ${m.pad})`, m.head && m.ctxW >= 40, JSON.stringify(m));
		await t.check('J1120-4 the header’s Change is on top where it is drawn', m.changeOnTop, JSON.stringify(m));
		await settingsAt(t, f, 1920, 1080);
	},

	'J1120-5 option A: the per-place editor and its lines name the setting followed and its model': async (t) => {
		const f = await boot(t);
		if (await skipUnlessLayered(t)) return;
		await toModels(t, f);
		const ID = 'ai.models.worker-model';
		await f.evaluate((i) => window.PM51.revealSetting(i, { detail: true }), ID);
		await f.waitForFunction((i) => { const insp = document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"]'); const code = insp && insp.querySelector('.o55-insp-tech code'); return !!(code && code.textContent.trim() === i && insp.querySelector('[data-psx-block="where"]')); }, ID, { timeout: 8000, polling: 50 }).catch(() => {});
		await t.page.waitForTimeout(400);
		const want = await f.evaluate(() => { const v = window.PSX.getAt(window.PSX.W, 'everywhere', null, 'ai.models.default-model'); return String(window.PSX.vt('ai.models.default-model', v !== undefined ? v : window.PSX.DEFAULTS['ai.models.default-model'])).split(' · ')[0]; });
		const line = await f.evaluate(() => { const l = document.querySelector('#pm-settings-root .detail-inspector [data-psx-line^="everywhere"] .psx-wval'); return l ? l.textContent.trim() : null; });
		/* the line may go on ("· the default"); it never names the model in brackets or as "… here" */
		await t.check(`J1120-5 the Everywhere line reads “Same as Everyday model · ${want}” (“${line}”)`, !!line && line.startsWith(`Same as Everyday model · ${want}`) && !/[()]| here\b/.test(line), String(line));
		const ch = f.locator('#pm-settings-root .detail-inspector [data-psx-block="where"] [data-psx-key="everywhere::change"]').first();
		await t.check('J1120-5 Everywhere has a Change', (await ch.count()) > 0);
		if (!(await ch.count())) return;
		await ch.evaluate((el) => el.scrollIntoView({ block: 'center' }));
		await ch.click({ timeout: 8000 });
		await f.waitForFunction(() => !!document.querySelector('.psx-mpick'), null, { timeout: 4000 }).catch(() => {});
		await t.page.waitForTimeout(300);
		const pk = await f.evaluate(() => {
			const p = document.querySelector('.psx-mpick');
			if (!p) return null;
			const o = p.querySelector('[role="option"][data-value="inherit"]');
			const trig = document.querySelector('#pm-settings-root .detail-inspector .psx-mtrigger');
			return { name: o ? ((o.querySelector('strong') || {}).textContent || '').trim() : null, small: o ? ((o.querySelector('small') || {}).textContent || '').trim() : null, trig: trig ? trig.textContent.trim() : null, text: p.textContent + ' ' + (document.querySelector('#pm-settings-root .detail-inspector') || {}).textContent };
		});
		await t.check('J1120-5 Change opens the shared picker over the page', !!pk);
		if (!pk) return;
		await t.check(`J1120-5 its inherit choice is “Same as Everyday model” with “${want}” under it, nothing else (“${pk.small}”)`, pk.name === 'Same as Everyday model' && pk.small === want, JSON.stringify({ name: pk.name, small: pk.small }));
		await t.check('J1120-5 nothing in the panel or the picker says “Same as the project”', !/Same as the project/i.test(pk.text), pk.text.slice(0, 200));
		await closePickers(t, f);
		await f.evaluate(() => { const c = document.querySelector('#pm-settings-root .detail-inspector [data-psx-key$=":cancel"]'); if (c) c.click(); if (window.PSX && window.PSX.places) window.PSX.places.close(); });
	},

	'J1120-6 Abilities: the index lights the section in view while scrolling': async (t) => {
		const f = await boot(t);
		await t.emulate({ reducedMotion: 'no-preference' });
		await press(t, f, '#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]');
		await press(t, f, '#pm-settings-root .workspace-tabs [data-action="jump-workspace"][data-workspace="media"]');
		await press(t, f, '#pm-settings-root [data-workspace-block="media"] .pm51-tabs [data-tab="abilities"]');
		await t.page.waitForTimeout(600);
		/* F's settings-index-spy rule (the section in view is the last one whose top reached the readable top, under a
		   stuck tab strip, plus 30 px; a step with a section within 40 px of that line is not judged) */
		const VIEW = () => {
			const sc = document.querySelector('#settings-document'); if (!sc) return null;
			const b = sc.getBoundingClientRect();
			const shown = (el) => el.getClientRects().length > 0 && !el.closest('details:not([open]), [hidden], [inert], .o55-sec-off, .o55-leaving');
			const firsts = new Set();
			const anchors = [...sc.querySelectorAll('[data-workspace-block] [data-section-id]')].filter(shown).map((el) => {
				const block = el.closest('[data-workspace-block]'), first = !firsts.has(block);
				firsts.add(block);
				const top = el.getBoundingClientRect().top, bt = block.getBoundingClientRect().top;
				const strip = block.querySelector('.pm51-mgr.has-manager-tabs > .pm51-tabs');
				const under = strip && strip.checkVisibility() && !strip.contains(el) && !el.contains(strip) && top > strip.getBoundingClientRect().top ? strip.offsetHeight + 12 : 0;
				return first && bt <= top ? { id: el.getAttribute('data-section-id'), ws: block.getAttribute('data-workspace-block'), top: bt, line: b.top + 30 } : { id: el.getAttribute('data-section-id'), ws: block.getAttribute('data-workspace-block'), top, line: b.top + under + 30 };
			});
			const max = sc.scrollHeight - sc.clientHeight, atEnd = max > 0 && sc.scrollTop >= max - 4;
			let want = null;
			for (const a of anchors) if (a.top <= a.line || (atEnd && a.top < b.top + sc.clientHeight * 0.5)) want = a;
			const near = anchors.filter((a) => Math.abs(a.top - a.line) < 40).map((a) => a.id);
			const links = [...document.querySelectorAll('#pm-settings-root .page-index-card .index-link')];
			const lit = links.filter((l) => l.classList.contains('is-active')).map((l) => ({ id: l.dataset.section, ws: l.dataset.workspace, text: l.textContent.trim() }));
			const listed = want ? links.some((l) => l.dataset.section === want.id) : false;
			const whole = links.find((l) => /^For the whole project$/i.test(l.textContent.trim()));
			return { top: Math.round(sc.scrollTop), atEnd, want: want && want.id, wantWs: want && want.ws, near, lit, listed, whole: whole ? whole.dataset.section : null, media: links.filter((l) => l.dataset.workspace === 'media').map((l) => l.textContent.trim()), mid: { x: b.left + b.width / 2, y: b.top + b.height / 2 } };
		};
		const v0 = await f.evaluate(VIEW);
		await t.check('J1120-6 the Abilities tab and the page index are drawn', !!v0 && v0.media.length > 0, JSON.stringify(v0));
		if (!v0) return;
		t.log(`index entries for Media abilities: ${v0.media.join(' | ')}; "For the whole project" ${v0.whole ? `is an entry (${v0.whole})` : 'is no entry'}`);
		let ox = 0, oy = 0;
		if (f !== t.page.mainFrame()) { const el = await f.frameElement().catch(() => null); const fb = el && (await el.boundingBox()); if (fb) { ox = fb.x; oy = fb.y; } }
		await t.page.mouse.move(v0.mid.x + ox, v0.mid.y + oy);
		let judged = 0, last = -1;
		const wrong = [], wholeWrong = [], walk = [];
		for (let n = 0; n < 80; n++) {
			await t.page.mouse.wheel(0, 90);
			let prev = -2;
			for (let k = 0; k < 30; k++) { await t.page.waitForTimeout(60); const now = await f.evaluate(() => (document.querySelector('#settings-document') || {}).scrollTop); if (Math.abs(now - prev) < 0.5) break; prev = now; }
			await f.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 60)))));
			const v = await f.evaluate(VIEW);
			walk.push(`${v.top}:${v.lit.map((x) => x.text).join('+') || 'none'}`);
			if (v.whole && v.lit.some((x) => x.id === v.whole) && v.want !== v.whole && !v.near.length) wholeWrong.push(`${v.top}px: For the whole project lit, ${v.want} in view`);
			if (v.wantWs === 'media' && v.want && !v.near.length && v.listed) {
				judged++;
				if (!v.lit.some((x) => x.id === v.want)) wrong.push(`${v.top}px: ${v.lit.map((x) => x.text).join(',') || 'none'} lit, ${v.want} in view`);
			}
			if (v.wantWs && v.wantWs !== 'media') break;
			if (v.top === last || v.atEnd) break;
			last = v.top;
		}
		t.log(`walk: ${walk.join(' ')}`);
		await t.check(`J1120-6 every judged step in Media abilities lights the section in view (${judged - wrong.length} of ${judged})`, judged >= 5 && wrong.length === 0, wrong.slice(0, 6).join(' | '));
		await t.check('J1120-6 “For the whole project” never lights while another section is in view', wholeWrong.length === 0, wholeWrong.slice(0, 4).join(' | '));
	}
};
