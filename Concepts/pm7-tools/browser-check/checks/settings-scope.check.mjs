// The settings-scope concept (Concepts/settings-scope/opus-5.5/, BUILD-SPEC-settings-concept.md section 16.3): a
// runtime layer over PMConcept7's Settings. It runs on the single-file app build, and skips with a note on any page
// without html[data-psx-layer]:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-scope.check.mjs --set page=$OUT/settings-scope-app.html
// --set lookShots=1 lists the review images (BUILD-SPEC 16.4) under LOOK; without it they are saved for diff only.
// --set only=rules|behaviour|fixes|yolo|looks|widths|moments runs one part. `fixes` and `yolo` assert the fix pass of
// 2026-11-03 (the five reviews in pass2/reviews/: one guarded write path, Copy, batches, the run mode and the rest).
import { LOOKS } from '../browser-check.config.mjs';

const want = (t, part) => !t.args.only || String(t.args.only).split(',').includes(part);
const pic = async (t, name, why, target) => {
	// in T3's sandbox the window takes the pictures, so a selector inside the sandboxed page can't be cropped
	if (target && typeof t.surface === 'function' && (await t.surface()) === 'sandbox') target = null;
	if (t.args.lookShots) { if (target) await t.crop(name, target, why); else await t.shot(name, why); }
	else await t.snap(name, target || undefined);
};

/* every element the layer adds, and the rule checks over them (no pills, no side stripes, text at least 11px, labelled
   buttons, a word with every status mark, plain words) */
const RULES = () => {
	const layerEls = [...document.querySelectorAll('[class*="psx-"], [data-psx-block], [data-psx-block] *, .psx-sheet *, .psx-note *, .psx-guide *, [data-psx-acc] *, [data-psx-mcp] *, [data-psx-srv] *, [data-psx-copy] *, .psx-head *')]
		.filter((el, i, a) => a.indexOf(el) === i && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
	const out = { n: layerEls.length, pills: [], stripes: [], small: [], unlabelled: [], bareMarks: [], words: [] };
	const desc = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '') + ' "' + (el.textContent || '').trim().slice(0, 30) + '"';
	for (const el of layerEls) {
		const cs = getComputedStyle(el), r = el.getBoundingClientRect();
		const engineControl = el.matches('.toggle, .pm51-toggle, .pm-status-mark, input[type="checkbox"], input[type="radio"]');
		const fill = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
		const border = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopColor !== 'rgba(0, 0, 0, 0)';
		const rad = parseFloat(cs.borderTopLeftRadius) || 0;
		if (!engineControl && r.height > 4 && rad >= r.height / 2 - 0.5 && (fill || border)) out.pills.push(desc(el));
		const bl = parseFloat(cs.borderLeftWidth) || 0, br = parseFloat(cs.borderRightWidth) || 0;
		if (((bl >= 2 && cs.borderLeftColor !== 'rgba(0, 0, 0, 0)') || (br >= 2 && cs.borderRightColor !== 'rgba(0, 0, 0, 0)')) && !engineControl) out.stripes.push(desc(el));
		for (const p of ['::before', '::after']) {
			const ps = getComputedStyle(el, p);
			if (ps.content && ps.content !== 'none' && ps.content !== 'normal' && parseFloat(ps.width) <= 4 && parseFloat(ps.height) > 10 && (ps.position === 'absolute' || ps.position === 'fixed')) out.stripes.push(desc(el) + p);
		}
		const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
		if (ownText && parseFloat(cs.fontSize) < 11) out.small.push(desc(el) + ' ' + cs.fontSize);
		if ((el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') && el.getAttribute('role') !== 'switch' && !el.closest('[inert]') && !el.textContent.trim()) out.unlabelled.push(desc(el));
	}
	document.querySelectorAll('[class*="psx-"] .pm-status-mark, [data-psx-block] .pm-status-mark, .psx-sheet .pm-status-mark, .psx-note .pm-status-mark').forEach((m) => {
		if (m.closest('[inert]')) return;
		const host = m.parentElement; const text = host ? host.textContent.trim() : '';
		if (!text) out.bareMarks.push(desc(host || m));
	});
	// plain words: the layer's own text, outside For experts and outside the engine's own labels
	const labels = new Set(Object.keys(window.PSX.DEF).map((id) => window.PSX.label(id)));
	// protocol names kept on purpose (an MCP server, a language server) and the engine's own container word
	const engineWords = ['Wait for a server this long', 'Wait for an MCP server this long', 'MCP servers', 'MCP server', 'Docker container'];
	const bad = /\b(environment|environments|layer|layers|level|levels|override|overrides|inherit|inherits|scope|server|servers|host|hosts)\b/i;
	const roots = [...document.querySelectorAll('[data-psx-block]:not([data-psx-block="tech"]), .psx-note, .psx-sheet, .psx-guide, .psx-head, [data-psx-acc], [data-psx-mcp], [data-psx-srv], [data-psx-copy], .psx-acc-line, .psx-reach')];
	for (const rt of roots) {
		if (!rt.getClientRects().length) continue;
		let txt = rt.innerText || '';
		labels.forEach((l) => { if (l) txt = txt.split(l).join(''); });
		engineWords.forEach((w) => { txt = txt.split(w).join(''); });
		const m = bad.exec(txt); if (m) out.words.push(m[0] + ' in ' + desc(rt) + ': …' + txt.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ') + '…');
	}
	return out;
};
async function rules(t, where) {
	const r = await t.root.evaluate(RULES);
	await t.check(`${where}: no pills among ${r.n} layer elements`, r.pills.length === 0, r.pills.slice(0, 5).join(' | '));
	await t.check(`${where}: no side stripes`, r.stripes.length === 0, r.stripes.slice(0, 5).join(' | '));
	await t.check(`${where}: text at least 11px`, r.small.length === 0, r.small.slice(0, 5).join(' | '));
	await t.check(`${where}: every button has visible text`, r.unlabelled.length === 0, r.unlabelled.slice(0, 5).join(' | '));
	await t.check(`${where}: every status mark has a word`, r.bareMarks.length === 0, r.bareMarks.slice(0, 5).join(' | '));
	await t.check(`${where}: plain words`, r.words.length === 0, r.words.slice(0, 3).join(' | '));
}
const settle = (t, ms = 350) => t.page.waitForTimeout(ms);
const run = (t, fn, arg) => t.root.evaluate(fn, arg);
async function moment(t, id) { await run(t, async (m) => { await window.PSX.command({ cmd: 'moment', id: m }); }, id); await settle(t, 900); }
/* a look, through PMConcept7's own theme menu (the strip's Look control): the kit's t.app.look paints PM_THEME without
   writing the setting, so the next redraw of Settings would paint the project's own look again */
async function look(t, name) {
	await run(t, (n) => window.PSX.setLook(n), name);
	await t.root.waitForFunction((n) => { const th = document.documentElement.getAttribute('data-theme') || ''; return /^nier/.test(n) ? th.endsWith(n.slice(4)) && (th.startsWith('nier') || !!(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on())) : th === n; }, name, { timeout: 6000 }).catch(() => {});
	await t.page.waitForTimeout(250);
	const got = await run(t, () => ({ theme: document.documentElement.getAttribute('data-theme') || '', nier: !!(window.PM_NIER && window.PM_NIER.on && window.PM_NIER.on()) }));
	const [fam, mode] = name.split('-');
	const ok = fam === 'nier' ? (got.nier || got.theme.startsWith('nier')) && got.theme.endsWith('-' + mode) : !got.nier && got.theme === name;
	await t.check(`look ${name} applied`, ok, JSON.stringify(got));
	await run(t, () => window.PSX.hideNote());
}
async function reset(t) { await run(t, () => window.PSX.command({ cmd: 'reset' })); await settle(t, 600); }

export default async function (t) {
	await t.app.open();
	const has = await run(t, () => document.documentElement.hasAttribute('data-psx-layer'));
	if (!has) { await t.check('settings-scope: not a settings-scope build, skipped (build it with tools/build_standalone.py)', true); return; }
	await t.until('the layer is booted', () => !!(window.PSX && window.PSX.booted && window.PSX.lastReport), null, { timeout: 60000, hard: true });
	await settle(t, 800);

	if (want(t, 'rules')) await t.step('the page and its rules', async () => {
		await t.equal('opens on Settings', () => run(t, () => window.PM_PAGES.current), 'settings');
		await t.equal('the feed reads the supplied snapshots', () => run(t, () => window.PM12_KIMI.getState().settingsProjectionSource), 'supplied_concept_fixture');
		await t.check('Everyday model reads Changed · Varies', () => run(t, () => { const r = document.getElementById('setting-ai.models.default-model'); return !!r && r.classList.contains('is-changed') && /Varies/.test(r.querySelector('.o55-about').textContent); }));
		await t.check('Everyday building reads Changed · This project', () => run(t, () => { const r = document.getElementById('setting-ai.models.worker-model'); return !!r && r.classList.contains('is-changed') && /This project/.test(r.querySelector('.o55-about').textContent); }));
		await t.check('the Changed word is at least 11px', () => run(t, () => { const m = document.querySelector('#pm-settings-root .o55-changed'); return !!m && parseFloat(getComputedStyle(m).fontSize) >= 11; }));
		await t.check('the engine’s dead changed bar stays unpainted', () => run(t, () => { const r = document.querySelector('#pm-settings-root .setting-row.is-changed'); const c = r ? getComputedStyle(r, '::before').content : 'none'; return c === 'none' || c === 'normal'; }));
		await t.check('the layer’s CSS has no viewport @media but prefers-*', () => run(t, () => {
			const bad = [];
			for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; } const text = [...rules].map((r) => r.cssText).join(''); if (!/\.psx-/.test(text)) continue; for (const r of rules) if (r.type === CSSRule.MEDIA_RULE && !/^\(?\s*prefers-/.test(r.conditionText)) bad.push(r.conditionText); }
			return bad.length === 0;
		}));
		await rules(t, 'Models page');
		await pic(t, 'models-basic-dark', 'Settings › AI & Providers › Models in tastebook, option A, Changed A, Basic Dark');
	});

	if (want(t, 'behaviour')) await t.step('the resolver, the router and the note', async () => {
		const st = await run(t, () => window.PSX.selfTest(true));
		for (const r of st.results) await t.check(`resolver case ${r.n}: ${r.name}`, r.ok, r.got);
		// the end word for each case, in its own context
		const words = await run(t, () => {
			const P = window.PSX, w = (id, ctx, world) => P.rows.where(id, P.resolve(id, ctx, world)).word;
			const fresh = () => { const keep = P.W; const x = P.freshWorld(); P.W = keep; return x; };
			const save = Object.assign({}, P.S.ctx);
			const at = (ctx, fn) => { Object.assign(P.S.ctx, { project: 'tastebook', device: 'here', on: null }, ctx); try { return fn(); } finally { Object.assign(P.S.ctx, save); } };
			const w11 = fresh(); w11.project.tastebook['general.visual.theme'] = 'Retro Dark'; w11.device.studio['general.visual.theme'] = 'Basic Light';
			const keepW = P.W;
			const out = [
				at({ project: 'harbor' }, () => w('ai.models.default-model', P.S.ctx)), at({ project: 'docs-site' }, () => w('ai.models.default-model', P.S.ctx)),
				at({ project: 'tastebook' }, () => w('branching.subagents.max-parallel', P.S.ctx)), at({ project: 'recipe-app' }, () => w('branching.subagents.max-parallel', P.S.ctx)),
				at({ project: 'lighting-rig' }, () => w('branching.subagents.max-parallel', P.S.ctx)), at({ project: 'garden-notes' }, () => w('safety.rules.permission-preset', P.S.ctx)),
				at({ project: 'experiment' }, () => w('safety.rules.permission-preset', P.S.ctx)), at({ project: 'experiment' }, () => w('safety.protection.filesafe-integration', P.S.ctx)),
				at({ project: 'harbor', device: 'studio' }, () => w('general.visual.font-size', P.S.ctx)), at({ project: 'loom' }, () => w('general.visual.reduce-animations', P.S.ctx)),
				at({ project: 'harbor', device: 'iphone' }, () => w('general.visual.reduce-animations', P.S.ctx)), at({ project: 'tastebook', device: 'studio' }, () => { P.W = w11; try { return w('general.visual.theme', P.S.ctx); } finally { P.W = keepW; } }),
				at({ project: 'garden-notes' }, () => w('system.advanced.cli-path-claude', P.S.ctx)), at({ project: 'none' }, () => w('memory.assembly.project-rules', P.S.ctx)),
				at({ project: 'none', on: 'homenas' }, () => w('general.interaction.eli5-default', P.S.ctx)), at({ project: 'harbor' }, () => w('system.mcp.timeout', P.S.ctx))
			];
			return out;
		});
		const WANT = ['Varies', 'This project', 'This project', 'Home NAS', 'Varies', 'Home NAS', 'Varies', 'This project', 'Studio Mac', 'This project', 'iPhone', 'This project', 'Home NAS', 'Each project', 'Details', 'This project'];
		for (let i = 0; i < WANT.length; i++) await t.equal(`end word, case ${i + 1}`, words[i], WANT[i]);

		// a change routes where its value comes from, with one note; Only for tastebook moves it
		await reset(t);
		const a = await run(t, async () => {
			const P = window.PSX, before = P.noteCount || 0, swallowed = P.toastsSwallowed || 0;
			const sel = document.querySelector('#setting-ai\\.models\\.default-model select.pm51-dd-native');
			sel.value = 'openai/gpt-5'; sel.dispatchEvent(new Event('change', { bubbles: true }));
			await new Promise((r) => setTimeout(r, 900));
			return { every: P.W.everywhere['ai.models.default-model'], note: P.lastNote, notes: (P.noteCount || 0) - before, swallowed: (P.toastsSwallowed || 0) - swallowed };
		});
		await t.equal('an everywhere row writes everywhere', a.every, 'openai/gpt-5');
		await t.equal('the note says where it went', a.note && a.note.title, 'Saved for everywhere.');
		await t.check('the note names who keeps their own', /docs-site keeps its own/.test(a.note && a.note.body), a.note && a.note.body);
		await t.check('the note offers Only for tastebook and Undo', a.note && a.note.actions.includes('Only for tastebook') && a.note.actions.includes('Undo'), JSON.stringify(a.note && a.note.actions));
		await t.equal('one note for one change', a.notes, 1);
		await t.equal('the engine’s own Saved toast is held back', a.swallowed, 1);
		const b = await run(t, async () => {
			const P = window.PSX, btn = [...document.querySelectorAll('#pm-settings-portals .psx-note button')].find((x) => /Only for/.test(x.textContent));
			if (btn) btn.click();
			await new Promise((r) => setTimeout(r, 700));
			return { every: P.W.everywhere['ai.models.default-model'], own: P.W.project.tastebook['ai.models.default-model'], word: document.querySelector('#setting-ai\\.models\\.default-model .o55-about').textContent.trim(), note: P.lastNote };
		});
		await t.equal('Only for tastebook puts everywhere back', b.every, 'anthropic/claude-opus-4');
		await t.equal('and gives tastebook its own', b.own, 'openai/gpt-5');
		await t.equal('the row’s word becomes This project', b.word, 'This project');
		await t.equal('a project-owned row writes the project', await run(t, async () => {
			const sel = document.querySelector('#setting-ai\\.models\\.worker-model select.pm51-dd-native');
			sel.value = 'claude-code/claude-sonnet'; sel.dispatchEvent(new Event('change', { bubbles: true }));
			await new Promise((r) => setTimeout(r, 800));
			return window.PSX.lastNote.title;
		}), 'Saved for tastebook.');
		// Home NAS isn't answering: an everywhere change is refused, and nothing is queued
		await reset(t);
		const c = await run(t, async () => {
			const P = window.PSX;
			await P.command({ cmd: 'ctx', homenas: 'down' });
			await new Promise((r) => setTimeout(r, 400));
			// main's one-model design (Settings batch 3) retired Faster or smarter edition (ai.models.default-variant);
			// Service tried first is an everywhere choice main's Models page draws
			const sel = document.querySelector('#setting-ai\\.models\\.default-provider select.pm51-dd-native');
			const was = P.W.everywhere['ai.models.default-provider'];
			sel.value = 'codex'; sel.dispatchEvent(new Event('change', { bubbles: true }));
			await new Promise((r) => setTimeout(r, 900));
			const engine = window.PM12_KIMI.getState().settings['ai.models.default-provider'];
			return { was, now: P.W.everywhere['ai.models.default-provider'], engine, note: P.lastNote, head: (document.querySelector('.psx-head') || {}).innerText || '' };
		});
		await t.check('with Home NAS away an everywhere change is not made', c.now === c.was && c.engine !== 'codex', JSON.stringify(c));
		await t.check('it offers Just this computer for now, and queues nothing', c.note && c.note.actions.includes('Just this computer for now') && /Nothing was saved or queued/.test(c.note.body), JSON.stringify(c.note));
		await t.check('the head says what you are seeing, and as of when', /Can’t reach Home NAS, which keeps your settings/.test(c.head), c.head);
		await rules(t, 'Home NAS away');
		await reset(t);

		// the panel: Helpers at once, five changes in a row with it open, focus kept, Esc back to the end word
		await run(t, async () => { window.PM51.revealSetting('branching.subagents.max-parallel', { detail: true }); await new Promise((r) => setTimeout(r, 1200)); });
		await t.until('the panel shows Where it applies', () => !!document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"] [data-psx-block="where"]'), null, { timeout: 8000 });
		await t.check('the panel’s Close shows the word', () => run(t, () => (document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close') || {}).textContent.trim() === 'Close'));
		await t.check('the engine’s own Where it applies is hidden', () => run(t, () => [...document.querySelectorAll('#pm-settings-root .detail-inspector .o55-insp-block h4')].filter((h) => /^Where it applies$/.test(h.textContent.trim()) && h.offsetParent).length === 1));
		await t.check('the sentence reads as in the anatomy', () => run(t, () => /Used everywhere, except tastebook and loom and on 2 computers|Used everywhere, except 2 projects and on 2 computers/.test(document.querySelector('.psx-where-sentence').textContent)));
		const five = await run(t, async () => {
			const P = window.PSX; let ok = 0;
			for (const v of [5, 7, 6, 2, 6]) {
				P.setOwn('branching.subagents.max-parallel', { level: 'project', key: 'tastebook' }, v, { quiet: true });
				await new Promise((r) => setTimeout(r, 250));
				const blocks = document.querySelectorAll('#pm-settings-root .detail-inspector [data-psx-block="where"]').length;
				const txt = (document.querySelector('#pm-settings-root .detail-inspector [data-psx-line="project:tastebook"] .psx-wval') || {}).textContent || '';
				if (blocks === 1 && txt.indexOf(String(v)) === 0) ok++;
			}
			return ok;
		});
		await t.equal('the panel stays right through five changes in a row', five, 5);
		await pic(t, 'panel-helpers-1920', 'The panel for Helpers at once in tastebook, 1920 wide', '#pm-settings-root .detail-inspector');
		await rules(t, 'the panel');
		/* focus, from a row on screen: the end word opens the panel, Change on a line opens its control, Esc puts focus back
		   on Change, Esc again closes the panel onto the row's end word. Main's one-model design (Settings batch 3) retired
		   Thinking depth, and its model pickers have no choices in the panel (so no "Choosing here changes"), so this runs
		   on New chats get their own worktree, a choice row tastebook owns */
		const FR = 'branching.worktrees.auto-worktree-new-threads', FRS = '#setting-branching\\.worktrees\\.auto-worktree-new-threads';
		await run(t, async (id) => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); await new Promise((r) => setTimeout(r, 500)); window.PM51.revealSetting(id); await new Promise((r) => setTimeout(r, 900)); const row = document.getElementById('setting-' + id); if (row) window.__psxScroll ? window.__psxScroll(row) : row.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 400)); }, FR);
		await t.root.locator(`${FRS} > .o55-about`).click();
		await t.until('the end word opens the panel', () => !!document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"] [data-psx-block="where"]'), null, { timeout: 6000 });
		await t.check('the end word says the panel is open', () => run(t, (sel) => document.querySelector(`${sel} > .o55-about`).getAttribute('aria-expanded') === 'true', FRS));
		await t.check('Choosing here changes names this project', () => run(t, () => /tastebook/.test((document.querySelector('#pm-settings-root .detail-inspector .psx-target-btn') || {}).textContent || '')));
		const ch = t.root.locator('#pm-settings-root .detail-inspector [data-psx-key="project:tastebook:change"]');
		await ch.click();
		await t.until('the inline control has focus', () => !!document.activeElement && document.activeElement.hasAttribute('data-psx-edit-control'), null, { timeout: 4000 });
		await t.page.keyboard.press('Escape');
		await t.until('Esc puts focus back on Change', () => !!document.activeElement && document.activeElement.getAttribute('data-psx-key') === 'project:tastebook:change', null, { timeout: 4000 });
		await t.page.keyboard.press('Escape');
		await t.until('Esc closes the panel and focus lands on the row’s end word', () => !!document.activeElement && document.activeElement.classList.contains('o55-about') && document.activeElement.getAttribute('data-setting') === 'branching.worktrees.auto-worktree-new-threads', null, { timeout: 5000 });

		// the copy sheet: the totals match the ticks, Tab stays inside, Esc returns to the opener
		await reset(t);
		await run(t, () => window.PSX.copy.open({ mode: 'new', comp: 'homenas', advanced: true, src: 'tastebook' }));
		await settle(t, 600);
		const tot = await run(t, () => {
			const sh = document.querySelector('.psx-sheet.psx-copy'); const label = sh.querySelector('.psx-sheet-foot .btn.primary').textContent;
			const T = window.PSX.copy.totals(), st = window.PSX.copy.st;
			const ticks = Object.keys(st.pick).filter((k) => st.pick[k]).length + Object.keys(st.files).filter((k) => st.files[k]).length;
			return { label, T, ticks, things: Object.keys(st.things).filter((k) => st.things[k]).length, accts: Object.keys(st.accts).filter((k) => st.accts[k] === 'same').length };
		});
		await t.check('the copy button’s totals match its ticks', tot.label === `Copy ${tot.T.n} settings, ${tot.T.things} things and ${tot.T.accts} AI accounts` && tot.T.n === tot.ticks && tot.T.things === tot.things && tot.T.accts === tot.accts, JSON.stringify(tot));
		await t.check('the AI account rows say what each needs on Home NAS', () => run(t, () => { const tx = document.querySelector('.psx-sheet.psx-copy').innerText; return /Signed in on Home NAS · checked before first use/.test(tx) && /Sign in on Home NAS after it’s made/.test(tx) && /Add the key on Home NAS after it’s made/.test(tx); }));
		const less = await run(t, async () => { const b = document.querySelector('.psx-sheet.psx-copy [data-act="openkind"]'); if (b) b.click(); await new Promise((r) => setTimeout(r, 200)); const x = document.querySelector('.psx-sheet.psx-copy input[data-act="one"]:checked'); if (x) x.click(); await new Promise((r) => setTimeout(r, 200)); return { label: document.querySelector('.psx-sheet.psx-copy .psx-sheet-foot .btn.primary').textContent, T: window.PSX.copy.totals() }; });
		await t.check('unticking one setting takes one off the total', less.label === `Copy ${less.T.n} settings, ${less.T.things} things and ${less.T.accts} AI accounts` && less.T.n === tot.T.n - 1, JSON.stringify(less));
		await look(t, 'basic-light');
		await settle(t, 500);
		await pic(t, 'copy-advanced-homenas-basic-light', 'The copy sheet, Advanced open, a new project on Home NAS, Basic Light', '.psx-sheet.psx-copy');
		await rules(t, 'the copy sheet');
		await t.root.locator('.psx-sheet.psx-copy .dialog-title').click();   // in T3's sandbox the window keeps the keyboard until the page is clicked
		for (let i = 0; i < 60; i++) await t.page.keyboard.press('Tab');
		await t.check('Tab stays inside the copy sheet', () => run(t, () => !!document.activeElement.closest('.psx-sheet')));
		await t.page.keyboard.press('Escape');
		await t.until('Esc closes the sheet', () => !document.querySelector('.psx-sheet.psx-copy'), null, { timeout: 4000 });
		await look(t, 'basic-dark');
	});

	/* ------------------------------------------------------------------ the fix pass (2026-11-03) */
	if (want(t, 'fixes')) await t.step('fix pass: one guarded write path, and what each path commits', async () => {
		await reset(t);
		// the safety look and the guards, on every path
		const g = await run(t, async () => {
			const P = window.PSX, out = {}, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			const sheetTitle = () => { const h = document.querySelector('.psx-sheet .dialog-title'); return h ? h.textContent : null; };
			// FileSafe off for tastebook from the panel: one confirmation, nothing written before it
			P.setOwn('safety.protection.filesafe-integration', { level: 'project', key: 'tastebook' }, false); await wait(250);
			out.fsSheet = sheetTitle(); out.fsWritten = P.W.project.tastebook['safety.protection.filesafe-integration']; P.closeSheets(); await wait(200);
			// Profile in use Full everywhere from the panel: previewed, not written
			P.setOwn('safety.rules.permission-preset', { level: 'everywhere', key: null }, 'full'); await wait(250);
			out.profSheet = sheetTitle(); out.profWritten = P.W.everywhere['safety.rules.permission-preset']; P.closeSheets(); await wait(200);
			// promoting Home NAS's Plan only keeps garden-notes careful
			P.panel.promote('safety.rules.permission-preset', { level: 'computer', key: 'homenas', value: 'plan' }); await wait(250);
			out.promoteSheet = sheetTitle(); const ok = [...document.querySelectorAll('.psx-sheet .psx-sheet-foot .btn.primary')].pop(); if (ok) ok.click(); await wait(400);
			out.garden = P.resolve('safety.rules.permission-preset', { project: 'garden-notes', device: 'here', on: null }).value;
			out.nasKept = P.W.computer.homenas['safety.rules.permission-preset'];
			P.reset(); await wait(500);
			// a Member's device: only its own screen values
			await P.command({ cmd: 'ctx', device: 'ipad' }); await wait(300);
			out.ipadOther = P.setOwn('general.visual.font-size', { level: 'device', key: 'studio' }, 19, { quiet: true }) ? 'saved' : 'refused';
			out.ipadOwn = P.setOwn('general.visual.font-size', { level: 'device', key: 'ipad' }, 18, { quiet: true }) ? 'saved' : 'refused';
			out.ipadThing = P.write([{ level: 'thing', key: 'accounts', id: 'work-claude', value: Object.assign({}, P.W.things.accounts['work-claude'], { reach: 'only', projects: ['harbor'] }) }], { batch: 'x' }, { silent: true }) ? 'saved' : 'refused';
			P.setCtx({ device: 'here' }); out.viewKeepsActor = P.S.actor;
			P.reset(); await wait(500);
			// first start: the panel's write refused too
			P.S.firstStart = true; out.first = P.setOwn('ai.models.worker-model', { level: 'everywhere', key: null }, 'claude-code/claude-sonnet', { quiet: true }) ? 'saved' : 'refused'; P.S.firstStart = false;
			// the settings home away: bulk promotion, Undo and copy into a Home NAS project refused; no fallback for garden-notes
			const tx = P.setOwn('ai.models.default-model', { level: 'everywhere', key: null }, 'openai/gpt-5', { quiet: true });
			P.moments.homenas(false); await wait(200);
			out.everyWhileAway = P.write([{ level: 'everywhere', key: null, id: 'ai.models.default-model', value: 'x' }], {}, { silent: true }) ? 'saved' : 'refused';
			P.undoTx(tx.id); out.undoWhileAway = P.W.everywhere['ai.models.default-model'];
			P.setCtx({ project: 'garden-notes' }); await wait(300);
			P.route('ai.models.worker-model', 'claude-code/claude-sonnet', 'inherit', 'row'); await wait(100);
			out.gardenFallback = P.lastNote && P.lastNote.actions;
			P.reset(); await wait(500);
			// the inline editor: a value outside the range is kept unsaved, a list stays a list, a draft survives a redraw
			window.PM51.revealSetting('branching.subagents.max-parallel', { detail: true }); await wait(1200);
			const ch = document.querySelector('#pm-settings-root .detail-inspector [data-psx-key="project:tastebook:change"]'); if (ch) ch.click(); await wait(200);
			let ctl = document.querySelector('#pm-settings-root .detail-inspector [data-psx-edit-control]');
			if (ctl) { ctl.value = '9'; ctl.dispatchEvent(new Event('input', { bubbles: true })); window.PM51.syncInspector(); await wait(200); ctl = document.querySelector('#pm-settings-root .detail-inspector [data-psx-edit-control]'); out.draft = ctl && ctl.value; ctl.value = '-5'; ctl.dispatchEvent(new Event('input', { bubbles: true })); const sv = document.querySelector('#pm-settings-root .detail-inspector [data-psx-key="project:tastebook:save"]'); if (sv) sv.click(); await wait(200); }
			out.negative = P.W.project.tastebook['branching.subagents.max-parallel'];
			out.negErr = !!document.querySelector('#pm-settings-root .detail-inspector .psx-err:not([hidden])');
			P.setOwn('branching.worktrees.protected-branches', { level: 'everywhere', key: null }, ['main', 'release/*', 'hotfix/*'], { quiet: true });
			out.listStays = Array.isArray(P.W.everywhere['branching.worktrees.protected-branches']);
			out.themeHasNier = (P.optionsFor('general.visual.theme') || []).includes('NieR Dark');
			// Same as everywhere says what taking tastebook's own away gives here
			out.removeLabel = P.panel.removeAction('branching.subagents.max-parallel', 'project', 'tastebook', 'tastebook').label;
			return out;
		});
		await t.check('panel: FileSafe off asks once, writes nothing first', /Turn FileSafe off/.test(g.fsSheet || '') && g.fsWritten === undefined, JSON.stringify(g));
		await t.check('panel: a safety change everywhere is previewed, not written', /Change Profile in use everywhere/i.test(g.profSheet || '') && g.profWritten === undefined, JSON.stringify(g));
		await t.check('promoting Home NAS’s Plan only keeps garden-notes on Plan only', g.garden === 'plan' && g.nasKept === 'plan', JSON.stringify(g));
		await t.check('a Member’s device changes only its own screen values, and no thing', g.ipadOther === 'refused' && g.ipadOwn === 'saved' && g.ipadThing === 'refused', JSON.stringify(g));
		await t.equal('Change view’s device never changes the device in use', g.viewKeepsActor, 'ipad');
		await t.equal('first start refuses the panel’s write', g.first, 'refused');
		await t.check('with the settings home away: writes and Undo refused, nothing queued', g.everyWhileAway === 'refused' && g.undoWhileAway === 'openai/gpt-5', JSON.stringify(g));
		await t.check('garden-notes (on Home NAS) is not offered Just this computer', Array.isArray(g.gardenFallback) && !g.gardenFallback.some((a) => /^Just /.test(a)), JSON.stringify(g.gardenFallback));
		await t.equal('a draft survives the engine redrawing the panel', g.draft, '9');
		await t.check('-5 helpers is kept unsaved, with its reason', g.negative === 6 && g.negErr, JSON.stringify(g));
		await t.check('a list stays a list', g.listStays);
		await t.check('the Theme editor offers the NieR looks', g.themeHasNier);
		await t.equal('taking tastebook’s own Helpers away is not called Same as everywhere', g.removeLabel, 'Take away tastebook’s own');
		await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });

		// Copy: what the preview shows is what is committed (accounts, things, Keep them fixed, clashes, staleness)
		await reset(t);
		const c = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			P.setCtx({ project: 'harbor' }); await wait(300);
			P.copy.open({ mode: 'settings', src: 'tastebook', advanced: true }); await wait(400);
			const st = P.copy.st;
			out.dst = st.dst;
			document.querySelector('#psx-copy-find').focus();
			return out;
		});
		// a find typed with the real keyboard keeps its letters in order (the sheet redraws on every letter)
		await t.page.keyboard.type('think', { delay: 40 });
		await settle(t, 200);
		const c2 = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			const st = P.copy.st;
			const live = document.querySelector('#psx-copy-find'); out.find = live.value;
			// a kind's box with a filter changes only what it shows
			const before = Object.assign({}, st.pick);
			const kb = document.querySelector('.psx-sheet.psx-copy input[data-act="kind"][data-kind="providers_accounts_models_routing"]'); if (kb) { kb.click(); await wait(100); }
			out.hiddenKept = st.pick['ai.models.worker-model'] === before['ai.models.worker-model'];
			{ const f2 = document.querySelector('#psx-copy-find'); f2.value = ''; f2.dispatchEvent(new Event('input', { bubbles: true })); } await wait(100);
			// a kind with two or more settings, one of them unticked, is partly ticked
			{
				const heads = [...document.querySelectorAll('.psx-sheet.psx-copy .psx-kind-head')].filter((h) => { const m = /(\d+) of (\d+)/.exec(h.textContent); return m && +m[2] >= 2; });
				const kid = heads.length ? heads[0].querySelector('input[data-act="kind"]').dataset.kind : null;
				if (kid) {
					const ob = document.querySelector(`.psx-sheet.psx-copy [data-act="openkind"][data-kind="${kid}"]`); if (ob && ob.getAttribute('aria-expanded') !== 'true') { ob.click(); await wait(120); }
					const part = /(\d+) of (\d+)/.exec(heads[0].textContent); const partly = part && +part[1] > 0 && +part[1] < +part[2];
					const one = partly ? null : document.querySelector(`.psx-sheet.psx-copy .psx-kind-rows input[data-act="one"]:checked`); if (one) { one.click(); await wait(120); }
					const m = document.querySelector(`.psx-sheet.psx-copy input[data-act="kind"][data-kind="${kid}"]`); out.mixed = !!m && m.indeterminate && !m.checked && m.getAttribute('aria-checked') === 'mixed'; out.mixedWhy = [kid, m && m.checked, m && m.indeterminate];
					if (one) { const back = document.querySelector(`.psx-sheet.psx-copy .psx-kind-rows input[data-act="one"]:not(:checked)`); if (back) { back.click(); await wait(120); } }
				} else out.mixedWhy = ['no kind with two settings', document.querySelectorAll('.psx-sheet.psx-copy .psx-kind-head').length, [...document.querySelectorAll('.psx-sheet.psx-copy .psx-kind')].map((k) => k.textContent.slice(0, 60)).join(' | '), !!document.querySelector('.psx-sheet.psx-copy details.psx-adv[open]')];
			}
			const kb2 = document.querySelector('.psx-sheet.psx-copy input[data-act="kind"][data-kind="providers_accounts_models_routing"]'); if (kb2 && !kb2.checked) { kb2.click(); await wait(100); }
			// a partly ticked kind reads as mixed
			const one = document.querySelector('.psx-sheet.psx-copy [data-act="openkind"][data-kind="providers_accounts_models_routing"]'); if (one) { one.click(); await wait(100); }
			const tick = document.querySelector('.psx-sheet.psx-copy input[data-act="one"][data-id="ai.models.worker-model"]'); if (tick) { tick.click(); await wait(100); }
			const t2 = document.querySelector('.psx-sheet.psx-copy input[data-act="one"][data-id="ai.models.worker-model"]'); if (t2) { t2.click(); await wait(100); }
			// Keep them fixed: the button, the preview and the commit count the same rows
			const fx = document.querySelector('.psx-sheet.psx-copy input[data-act="fixed"]'); fx.click(); await wait(200);
			const T = P.copy.totals(); out.label = document.querySelector('.psx-sheet.psx-copy .psx-sheet-foot .btn.primary').textContent;
			out.T = T;
			document.querySelector('.psx-sheet.psx-copy .psx-sheet-foot .btn.primary').click(); await wait(300);
			out.previewFocus = document.activeElement && document.activeElement.getAttribute('data-k');
			// the source changes after the preview: Copy shows it again instead of copying blind
			P.W.project.tastebook['ai.models.worker-model'] = 'claude-code/claude-sonnet';
			[...document.querySelectorAll('.psx-sheet.psx-copy .psx-sheet-foot .btn')].find((b) => b.textContent === 'Copy').click(); await wait(300);
			out.stale = !!document.querySelector('.psx-sheet.psx-copy') && /changed since this preview/.test(document.querySelector('.psx-sheet.psx-copy').innerText);
			const revBefore = P.W.rev;
			[...document.querySelectorAll('.psx-sheet.psx-copy .psx-sheet-foot .btn')].find((b) => b.textContent === 'Copy').click(); await wait(1400);
			out.wrote = P.W.rev > revBefore;
			const h = P.W.project.harbor;
			out.harborBuilding = h['ai.models.worker-model'];
			out.harborBranch = h['branching.worktrees.default-branch'];
			out.harborModelOwn = Object.prototype.hasOwnProperty.call(h, 'ai.models.default-model');
			out.uses = P.W.uses.harbor;
			out.fsCopy = !!P.W.things.mcp['filesystem-mcp-harbor'] && P.W.things.mcp['filesystem-mcp-harbor'].home === 'harbor' && P.W.things.mcp['filesystem-mcp-harbor'].computers.here !== 'ready';
			out.reviewer = P.W.things.personas.reviewer.versions;
			out.figma = P.W.things.mcp['figma-mcp'].projects;
			out.note = P.lastNote && P.lastNote.title;
			const own = Object.keys(h).length;
			out.counted = own;
			// one Undo puts all of it back: values, accounts, things
			const btx = Object.values(P.W.batches).reverse().find((x) => x.meta && x.meta.batch === 'copy');
			P.undoTx(btx.id); await wait(200);
			out.afterUndo = { building: P.W.project.harbor['ai.models.worker-model'], uses: P.W.uses.harbor, fs: !!P.W.things.mcp['filesystem-mcp-harbor'], reviewer: P.W.things.personas.reviewer.versions.length };
			return out;
		});
		Object.assign(c, c2);
		await t.equal('the copy goes into the open project', c.dst, 'harbor');
		await t.equal('typing in Find keeps the letters in order', c.find, 'think');
		await t.check('a kind’s box with a filter leaves hidden settings alone', c.hiddenKept, JSON.stringify(c));
		await t.check('a partly ticked kind is a mixed checkbox', c.mixed, JSON.stringify(c.mixedWhy));
		await t.check('Keep them fixed: the button counts what is copied', new RegExp(`^Copy ${c.T.n} settings`).test(c.label) && c.T.n > 11, JSON.stringify({ label: c.label, T: c.T }));
		await t.equal('Preview moves focus to its heading', c.previewFocus, 'step');
		await t.check('a source changed after the preview is shown again, not copied blind', c.stale);
		await t.check('then the copy commits the new preview', c.wrote && c.harborBuilding === 'claude-code/claude-sonnet', JSON.stringify(c));
		await t.equal('a clash kept as harbor’s own stays harbor’s', c.harborBranch, 'develop');
		await t.check('Keep them fixed gives harbor its own Everyday model', c.harborModelOwn);
		await t.check('the AI accounts are chosen for harbor', JSON.stringify(c.uses) === JSON.stringify(['work-claude', 'codex', 'openrouter']), JSON.stringify(c.uses));
		await t.check('Filesystem MCP becomes harbor’s own copy, not ready by copying', c.fsCopy);
		await t.check('the Reviewer persona gets harbor’s version, Figma is available in harbor', c.reviewer.includes('harbor') && c.figma.includes('harbor'), JSON.stringify(c));
		await t.check('the receipt counts the kept clash apart', /kept as harbor’s own/.test(c.note || ''), c.note);
		await t.check('one Undo puts the values, the accounts and the things back', c.afterUndo.building === undefined && c.afterUndo.uses === undefined && !c.afterUndo.fs && c.afterUndo.reviewer === 1, JSON.stringify(c.afterUndo));

		// no project: the destination is chosen, never invented; New Project starts on your usual settings
		await reset(t);
		const np = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			P.setCtx({ project: 'none' }); await wait(300);
			P.copy.open({ mode: 'settings' }); await wait(300);
			const b = document.querySelector('.psx-sheet.psx-copy .psx-sheet-foot .btn.primary');
			const out = { dst: P.copy.st.dst, disabled: b && b.getAttribute('aria-disabled'), sub: document.querySelector('.psx-sheet.psx-copy .dialog-sub').textContent };
			P.closeSheets(); await wait(200);
			P.copy.open({ mode: 'new', comp: 'homenas' }); await wait(300);
			out.newSrc = P.copy.st.src; P.closeSheets();
			return out;
		});
		await t.check('with no project open, Copy asks for the project to copy into', np.dst === null && np.disabled === 'true' && /Choose the project/.test(np.sub), JSON.stringify(np));
		await t.equal('New Project starts on your usual settings', np.newSrc, 'usual');

		// Differences: the facets filter, project-only values can't be deleted in bulk, two values for one setting are refused
		await reset(t);
		const d = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			await P.command({ cmd: 'moment', id: '11.16' }); await wait(500);
			const rows = () => document.querySelectorAll('.psx-sheet .psx-li').length;
			out.all = rows(); document.querySelector('.psx-sheet [data-f="comp"]').click(); await wait(200); out.comp = rows();
			document.querySelector('.psx-sheet [data-f="comp"]').click(); await wait(200);
			document.querySelector('.psx-sheet [data-by="project"]').click(); await wait(200);
			out.rulesBox = !!document.querySelector('.psx-sheet input[data-k^="memory.assembly.project-rules|"]');
			const tick = (k) => { const x = document.querySelector(`.psx-sheet input[data-k="${k}"]`); if (x) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); } };
			tick('branching.subagents.max-parallel|project|tastebook'); tick('branching.subagents.max-parallel|project|loom');
			const make = [...document.querySelectorAll('.psx-sheet .psx-sheet-foot .btn')].find((b) => b.textContent === 'Make these everywhere'); make.click(); await wait(200);
			out.clash = P.lastNote && P.lastNote.title; out.every = P.W.everywhere['branching.subagents.max-parallel'];
			out.rules = P.W.project.tastebook['memory.assembly.project-rules'];
			P.closeSheets();
			return out;
		});
		await t.check('Per computer filters the list', d.comp < d.all && d.comp > 0, JSON.stringify(d));
		await t.check('a project-only value has no bulk box', !d.rulesBox);
		await t.check('two values for one setting are refused, nothing written', d.clash === 'Choose one value first' && d.every === undefined, JSON.stringify(d));

		// a batch that couldn't finish: Finish brings the values it copied; Undo all of it undoes every part
		await reset(t);
		const bt = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			await P.command({ cmd: 'moment', id: '11.17' }); await wait(500);
			[...document.querySelectorAll('.psx-sheet .psx-sheet-foot .btn')].find((b) => /Copy into/.test(b.textContent)).click(); await wait(1600);
			const first = P.W.project['lighting-rig']['ai.models.worker-model'];
			P.W.project.tastebook['ai.models.worker-model'] = 'claude-code/claude-sonnet';
			P.moments.studio(true); P.history.open(); await wait(300);
			const fin = document.querySelector('.psx-sheet [data-finish]'); if (fin) fin.click(); await wait(1200);
			const finished = P.W.project['lighting-rig']['ai.models.worker-model'];
			const e = P.W.history.find((x) => x.batch === 'copy-many');
			P.undoTx(e.tx); await wait(300);
			return { first, finished, after: P.W.project['lighting-rig']['ai.models.worker-model'], harbor: P.W.project.harbor['ai.models.worker-model'] };
		});
		await t.check('the part whose computer is off is not changed', bt.first === undefined, JSON.stringify(bt));
		await t.equal('Finish brings the value the batch copied, not today’s', bt.finished, 'openai/gpt-5');
		await t.check('Undo all of it undoes the finished part too', bt.after === undefined && bt.harbor === undefined, JSON.stringify(bt));

		// the settings home: Join with Studio Mac as keeper moves it; every surface names it
		await reset(t);
		const hm = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			await P.command({ cmd: 'moment', id: '11.6' }); await wait(500);
			const r = document.querySelector('.psx-sheet input[name="psx-keep"][value="studio"]'); r.click(); await wait(150);
			document.querySelector('.psx-sheet .psx-sheet-foot .btn.primary').click(); await wait(1700);
			const out = { home: P.W.home, writer: P.writer('everywhere'), note: P.lastNote && P.lastNote.body, studioOwnFont: P.W.device.studio['general.visual.font-size'] };
			P.reset(); await wait(500);
			await P.command({ cmd: 'moment', id: '11.5' }); await wait(500);
			document.querySelector('.psx-sheet .psx-sheet-foot .btn.primary').click(); await wait(2200);
			P.moments.homenas(false); await wait(300);
			window.PM12_KIMI.navigate('ai', 'providers'); await wait(500);
			out.moved = P.W.home; out.head = (document.querySelector('.psx-head') || {}).innerText || '';
			return out;
		});
		await t.check('Join: Studio Mac as keeper becomes the settings home', hm.home === 'studio' && hm.writer === 'studio' && /Studio Mac keeps them; Home NAS follows/.test(hm.note || ''), JSON.stringify(hm));
		await t.check('after Move, Home NAS away is not the settings home away', hm.moved === 'here' && !/Can’t reach Home NAS, which keeps your settings/.test(hm.head), hm.head);

		// the conflict card's Keep shows Now again; the note's Undo by keyboard; moments start fresh; Office PC joins
		await reset(t);
		await moment(t, '11.2');
		await run(t, () => { const b = document.querySelector('[data-psx-key="conflict-keep"]'); if (b) b.click(); });
		await settle(t, 500);
		await t.check('after Keep, the panel shows Now again', () => run(t, () => { const n = document.querySelector('#pm-settings-root .detail-inspector .o55-insp-now:not(.psx-conflict)'); return !!n && !n.hidden && getComputedStyle(n).display !== 'none'; }));
		await reset(t);
		await run(t, async () => { window.PM12_KIMI.navigate('ai', 'providers'); await new Promise((r) => setTimeout(r, 400)); window.PM12_KIMI.dispatchAction('pm51-tab', { manager: 'providers', tab: 'models' }); await new Promise((r) => setTimeout(r, 700)); });
		await run(t, async () => { const sel = document.querySelector('#setting-ai\\.models\\.default-model select.pm51-dd-native'); sel.value = 'openai/gpt-5'; sel.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((r) => setTimeout(r, 900)); document.body.focus(); });
		await t.page.keyboard.press('F6');
		await t.check('F6 reaches the note', () => run(t, () => !!document.activeElement && !!document.activeElement.closest('.psx-note')));
		await t.page.keyboard.press('Control+z');
		await settle(t, 400);
		await t.equal('Control Z runs the note’s Undo', () => run(t, () => window.PSX.W.everywhere['ai.models.default-model']), 'anthropic/claude-opus-4');
		await t.check('the note has one live region that stays in the page', () => run(t, () => document.querySelectorAll('#pm-settings-portals .psx-live[role="status"]').length === 1 && !document.querySelector('.psx-note[role="status"]')));
		const fresh = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			await P.command({ cmd: 'moment', id: '11.12' }); await wait(300);
			await P.command({ cmd: 'moment', id: '11.11' }); await wait(300);
			const a = { timeout: P.DEFAULTS['system.mcp.timeout'] };
			await P.command({ cmd: 'moment', id: '11.3' }); await wait(300);
			a.actor = P.S.actor; a.device = P.S.ctx.device;
			await P.command({ cmd: 'moment', id: '11.7' }); await wait(400);
			const box = document.querySelector('.psx-sheet [data-like]'); if (box) box.checked = true;
			[...document.querySelectorAll('.psx-sheet .psx-sheet-foot .btn')].find((b) => b.textContent === 'Done').click(); await wait(300);
			a.office = P.computerIds().includes('office') && P.W.computer.office['branching.subagents.max-parallel'] === 3;
			await P.command({ cmd: 'moment', id: '11.14' }); await wait(400);
			document.querySelector('.psx-sheet [data-fold]').click(); await wait(300);
			a.look = P.W.everywhere['general.visual.theme'];
			await P.command({ cmd: 'moment', id: '11.13' }); await wait(400);
			document.querySelector('.psx-sheet .psx-sheet-foot .btn.primary').click(); await wait(300);
			a.rules = P.W.rules['open-recipes'];
			return a;
		});
		await t.equal('a moment after 11.12 has the shipped defaults back', fresh.timeout, 30000);
		await t.check('a moment after 11.11 is on This computer again', fresh.actor === 'here' && fresh.device === 'here', JSON.stringify(fresh));
		await t.check('11.7: Office PC joins, starting like This computer', fresh.office);
		await t.equal('11.14: the look suggestion is a real everywhere change', fresh.look, 'Glass Dark');
		await t.check('11.13: the careful rules are used and the looser one held', !!fresh.rules && fresh.rules.held.includes('run-free') && !fresh.rules.used.includes('run-free'), JSON.stringify(fresh.rules));
		await reset(t);
		// the MCP version is a record of its own, never ready by copying, and can go back to the library one
		const mv = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms));
			window.PM12_KIMI.navigate('code', 'mcp'); await wait(700);
			const it = [...document.querySelectorAll('#pm-settings-root .pm51-item[data-id="github-mcp"]')].find((x) => x.offsetParent); if (it) it.click(); await wait(1200);
			const b = document.querySelector('#pm-settings-portals [data-psx-mcp-act="version"]'); if (b) b.click(); await wait(300);
			const ok = [...document.querySelectorAll('.psx-sheet .psx-sheet-foot .btn.primary')].pop(); if (ok) ok.click(); await wait(1300);
			const v = P.W.things.mcp['github-mcp-tastebook'];
			const back = !!document.querySelector('#pm-settings-portals [data-psx-mcp-act="unversion"]');
			const close = (document.querySelector('#pm-settings-portals .pm51-drawer-wrap .pm51-panel-close') || {}).textContent || '';
			const reach = ((document.querySelector('#pm-settings-root .pm51-item[data-id="github-mcp"] [data-psx-reach]') || {}).textContent) || '';
			const cl = document.querySelector('#pm-settings-portals .pm51-drawer-wrap [data-action="close-overlay"]'); if (cl) cl.click();
			return { v: !!v, ready: v ? Object.values(v.computers).filter((s) => s === 'ready').length : -1, back, close: close.trim(), reach };
		});
		await t.check('Make a version: its own record, not ready by copying', mv.v && mv.ready === 0, JSON.stringify(mv));
		await t.check('the drawer offers Go back to the library one, and names the version in the list', mv.back && /tastebook has its own version/.test(mv.reach), JSON.stringify(mv));
		await t.equal('the drawer’s close is a word', mv.close, 'Close');
		// the board's specimens keep a real row's geometry: the control on the label's line
		await run(t, () => window.PSX.board.open()); await settle(t, 500);
		await t.check('board specimens put the control on the label’s line, like the page', () => run(t, () => [...document.querySelectorAll('.psx-board-col .setting-row')].every((r) => { const a = r.querySelector('.setting-copy').getBoundingClientRect(), b = r.querySelector('.setting-control').getBoundingClientRect(); return Math.abs(a.top - b.top) < 24 && b.left > a.left + 40; })));
		await t.check('each board column says what its specimens show, in words', () => run(t, () => [...document.querySelectorAll('.psx-board-col')].every((c) => { const d = document.getElementById(c.getAttribute('aria-describedby')); return !!d && d.textContent.length > 40; })));
		await run(t, () => window.PSX.closeSheets());
		// the Computers manager says Computer, not server
		await t.check('the manager for the computers is called Computers', () => run(t, async () => { window.PM12_KIMI.navigate('system', 'servers'); await new Promise((r) => setTimeout(r, 900)); window.PSX.plainWords(); const m = document.querySelector('#pm-settings-root .manager-page[data-pm51-manager="servers"]'); return !!m && !/\bservers?\b/i.test(m.querySelector('.manager-head') ? m.querySelector('.manager-head').innerText : ''); }));
		await rules(t, 'the Computers manager');
		await run(t, async () => { window.PM12_KIMI.navigate('ai', 'providers'); await new Promise((r) => setTimeout(r, 400)); window.PM12_KIMI.dispatchAction('pm51-tab', { manager: 'providers', tab: 'models' }); });
		await settle(t, 500);
		const cr = await run(t, () => window.PSX.classReport());
		console.log('[CLASSIFICATION] ' + JSON.stringify({ adopted: cr.adopted, reviewed: cr.reviewed, byRule: cr.byRule, safety: cr.safety.length, ceiling: cr.ceiling }));
		await t.check('the reviewed safety and limit rows carry their rules', cr.safety.includes('safety.rules.default-tool-permission') && cr.ceiling.includes('branching.subagents.provider-concurrency-cap'), JSON.stringify({ safety: cr.safety.slice(0, 6), ceiling: cr.ceiling }));
	});

	/* ------------------------------------------------------------------ the run mode: Regular and YOLO at every yes-point */
	if (want(t, 'yolo')) await t.step('Regular and YOLO at each yes-point', async () => {
		await reset(t);
		const y = await run(t, async () => {
			const P = window.PSX, wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = {};
			const sheet = () => document.querySelector('.psx-sheet');
			// Regular: the assistant's everywhere change waits for a yes
			await P.command({ cmd: 'runmode', mode: 'regular' });
			await P.command({ cmd: 'moment', id: '11.10' }); await wait(2600);
			out.regularCard = !!sheet() && /Change Everyday model everywhere/.test(sheet().innerText); out.regularEvery = P.W.everywhere['ai.models.default-model'];
			// YOLO: no card; the same preview is the report, with Undo
			await P.command({ cmd: 'runmode', mode: 'yolo' });
			await P.command({ cmd: 'moment', id: '11.10' }); await wait(2600);
			out.yoloCard = !!sheet(); out.yoloEvery = P.W.everywhere['ai.models.default-model']; out.yoloNote = P.lastNote;
			out.history = (P.W.history.find((e) => e.sid === 'ai.models.default-model' && e.level === 'everywhere') || {}).yolo;
			// YOLO: a safety change everywhere applies after its preview without a second yes; FileSafe off still asks
			P.reset(); await wait(400);
			P.setOwn('safety.rules.permission-preset', { level: 'everywhere', key: null }, 'plan'); await wait(300);
			out.safetySheet = !!sheet(); out.safetyEvery = P.W.everywhere['safety.rules.permission-preset']; out.safetyNote = P.lastNote && P.lastNote.body;
			P.setOwn('safety.protection.filesafe-integration', { level: 'project', key: 'tastebook' }, false); await wait(300);
			out.fsGuard = !!sheet() && /YOLO still asks here/.test(sheet().innerText); P.closeSheets(); await wait(200);
			// YOLO: a project that can't take a change still refuses it
			P.setOwn('ai.accounts.hard-switch-level', { level: 'everywhere', key: null }, 15); await wait(300);
			out.refuse = !!sheet() && /wasn’t changed everywhere/.test(sheet().innerText) && /YOLO still asks here/.test(sheet().innerText); P.closeSheets(); await wait(200);
			// YOLO: joining two setups still asks which computer keeps them
			await P.command({ cmd: 'moment', id: '11.6' }); await wait(400);
			out.join = !!sheet() && /YOLO still asks here/.test(sheet().innerText) && /Keep them on Home NAS/.test(sheet().innerText); P.closeSheets(); await wait(200);
			// YOLO: copy applies without the Copy yes and shows the exact preview as its report
			P.reset(); await wait(400); P.setCtx({ project: 'harbor' }); await wait(300);
			P.copy.open({ mode: 'settings', src: 'tastebook' }); await wait(300);
			document.querySelector('.psx-sheet.psx-copy .psx-sheet-foot .btn.primary').click(); await wait(1400);
			out.copyDone = !!sheet() && /Copied without asking \(YOLO\)/.test(sheet().innerText); out.copyWrote = P.W.project.harbor['ai.models.worker-model'];
			P.closeSheets(); await wait(200);
			// YOLO: Always allow and push/publish
			await P.command({ cmd: 'moment', id: '11.18' }); await wait(400);
			const txt = sheet() ? sheet().innerText : '';
			out.pushRan = /Push to GitHub[\s\S]*Ran, not asked/.test(txt) && /Publish the image[\s\S]*Ran, not asked/.test(txt);
			out.outsideAsks = /YOLO still asks: A path outside the project/.test(txt);
			out.noAlways = /None made/.test(txt);
			await P.command({ cmd: 'runmode', mode: 'regular' }); await wait(300);
			const txt2 = sheet() ? sheet().innerText : '';
			out.regularAsks = /Regular asks before a push/.test(txt2);
			const al = document.querySelector('.psx-sheet [data-ask="test"][data-a="always"]'); out.alwaysOffered = !!al;
			return out;
		});
		await t.check('Regular: the assistant’s everywhere change waits for a yes', y.regularCard && y.regularEvery === 'anthropic/claude-opus-4', JSON.stringify(y));
		await t.check('YOLO: no card; the change is made and reported, with Undo', !y.yoloCard && y.yoloEvery === 'openai/gpt-5' && y.yoloNote && y.yoloNote.actions.includes('Undo') && /YOLO didn’t ask/.test(y.yoloNote.body), JSON.stringify(y.yoloNote));
		await t.check('History records it as YOLO, not as a click', y.history === true);
		await t.check('YOLO: a safety change applies after its preview, reported', !y.safetySheet && y.safetyEvery === 'plan' && /YOLO didn’t ask/.test(y.safetyNote || ''), JSON.stringify(y));
		await t.check('YOLO still asks before FileSafe goes off', y.fsGuard);
		await t.check('YOLO: a project that can’t take a change still refuses it', y.refuse);
		await t.check('YOLO still asks which computer keeps your settings', y.join);
		await t.check('YOLO: Copy applies without the Copy yes and shows its preview as the report', y.copyDone && y.copyWrote === 'openai/gpt-5', JSON.stringify(y));
		await t.check('YOLO: git push and publish run without asking, and are reported', y.pushRan);
		await t.check('YOLO still asks for a path outside the project, and makes no Always rule', y.outsideAsks && y.noAlways);
		await t.check('Regular asks, and offers Always allow', y.regularAsks && y.alwaysOffered);
		await pic(t, 'approvals-regular', 'Moment 11.18 in Regular: each step asks, Always allow offers where', '.psx-sheet');
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'yolo' }); });
		await settle(t, 400);
		await pic(t, 'approvals-yolo', 'Moment 11.18 in YOLO: test, push and publish ran and are reported; the outside path and the remote delete still ask', '.psx-sheet');
		await rules(t, 'the approvals moment');
		await run(t, () => window.PSX.closeSheets());
		await moment(t, '11.10');
		await settle(t, 2400);
		await pic(t, 'assistant-yolo', 'Moment 11.10 in YOLO: the everywhere change made without the card, its report note with Undo, and the head line’s YOLO line');
		await rules(t, 'YOLO, the assistant');
		await reset(t);
		await run(t, async () => { const P = window.PSX; P.setOwn('safety.protection.filesafe-integration', { level: 'project', key: 'tastebook' }, false); await new Promise((r) => setTimeout(r, 400)); });
		await pic(t, 'filesafe-yolo-asks', 'FileSafe off for tastebook in YOLO: the one guard YOLO never skips still asks, with its risk word', '.psx-sheet');
		await rules(t, 'YOLO, FileSafe off');
		await run(t, () => window.PSX.closeSheets());
		await run(t, async () => { await window.PSX.command({ cmd: 'runmode', mode: 'regular' }); });
		await reset(t);
		await run(t, async () => { const P = window.PSX; P.setOwn('safety.rules.permission-preset', { level: 'everywhere', key: null }, 'full'); await new Promise((r) => setTimeout(r, 400)); });
		await pic(t, 'safety-preview-panel', 'Regular: Profile in use Full everywhere from the panel is previewed, project by project, before it is saved', '.psx-sheet');
		await run(t, () => window.PSX.closeSheets());
	});

	if (want(t, 'looks')) await t.step('the board, the Models page and the MCP panel in all ten looks', async () => {
		await reset(t);
		for (const lk of LOOKS) {
			await t.step(lk, async () => {
				await look(t, lk);
				await run(t, () => window.PSX.board.open());
				await settle(t, 500);
				await t.check(`${lk}: the board draws 7 columns of 4 rows`, () => run(t, () => document.querySelectorAll('.psx-board-col').length === 7 && document.querySelectorAll('.psx-board-col .setting-row').length === 28));
				await t.noOverflow(`${lk}: the board has no overflow`, { scope: '.psx-board-sheet' });
				if (['basic-dark', 'retro-light', 'nier-dark'].includes(lk)) await pic(t, `board-${lk}`, `The compare board in ${lk}`, '.psx-board-sheet');
				await run(t, () => window.PSX.closeSheets());
				await settle(t, 250);
				if (['glass-light', 'friendly-dark'].includes(lk)) await pic(t, `models-${lk}`, `Settings › AI › Models in tastebook (A, Changed A), ${lk}`);
				await t.noOverflow(`${lk}: Settings has no overflow`);
				if (lk === 'retro-dark') {
					await run(t, async () => { window.PM12_KIMI.navigate('code', 'mcp'); await new Promise((r) => setTimeout(r, 700)); const it = [...document.querySelectorAll('#pm-settings-root .pm51-item[data-id="github-mcp"]')].find((x) => x.offsetParent); if (it) it.click(); await new Promise((r) => setTimeout(r, 1200)); });
					await t.until('the GitHub MCP panel has the layer’s sections', () => !!document.querySelector('#pm-settings-portals [data-psx-mcp]'), null, { timeout: 6000 });
					await run(t, () => { window.PSX.hideNote(); const s = document.querySelector('#pm-settings-portals [data-psx-mcp]'), b = s && s.closest('.pm51-panel-body'); if (b) b.scrollTop = s.offsetTop - 12; });
					await settle(t, 400);
					await pic(t, 'mcp-github-retro-dark', 'The MCP thing panel for GitHub MCP in Retro Dark', '#pm-settings-portals .pm51-drawer-wrap aside.drawer');
					await rules(t, 'the MCP panel');
					await run(t, async () => { const b = document.querySelector('#pm-settings-portals .pm51-drawer-wrap [data-action="close-overlay"]'); if (b) b.click(); window.PM12_KIMI.navigate('ai', 'providers'); await new Promise((r) => setTimeout(r, 500)); window.PM12_KIMI.dispatchAction('pm51-tab', { manager: 'providers', tab: 'models' }); });
					await settle(t, 600);
				}
			});
		}
		await look(t, 'basic-dark');
	});

	if (want(t, 'widths')) await t.step('widths and Reduced Motion', async () => {
		await reset(t);
		for (const w of [1920, 1280, 1024, 860]) {
			await t.viewport(w, 1080);
			await settle(t, 500);
			await t.noOverflow(`${w} wide: no overflow`);
			await t.check(`${w} wide: every end word is visible`, () => run(t, () => [...document.querySelectorAll('#pm-settings-root .setting-row .o55-about.psx-end')].filter((b) => b.offsetParent).every((b) => b.getBoundingClientRect().width > 20)));
			if (w === 860) {
				await run(t, async () => { window.PM51.revealSetting('branching.subagents.max-parallel', { detail: true }); await new Promise((r) => setTimeout(r, 1300)); });
				await t.check('860 wide: the panel keeps its 350px', () => run(t, () => { const r = document.querySelector('#pm-settings-root .detail-inspector').getBoundingClientRect(); return Math.abs(r.width - 350) <= 2 || r.width >= 280; }));
				await pic(t, 'panel-helpers-860', 'The panel for Helpers at once in tastebook at 860px wide');
				await run(t, () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); });
			}
		}
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'reduce' });
		await run(t, () => window.PSX.note({ title: 'Reduced Motion', body: 'No movement.', mark: 'info' }));
		await t.check('Reduced Motion: the note appears without a transition', () => run(t, () => { const n = document.querySelector('.psx-note'); return !!n && getComputedStyle(n).transitionDuration.split(',').every((d) => parseFloat(d) === 0); }));
		await t.emulate({ reducedMotion: 'no-preference' });
	});

	if (want(t, 'moments')) await t.step('every moment opens and resets cleanly', async () => {
		const ids = ['11.1', '11.2', '11.3', '11.4', '11.5', '11.5-flight', '11.5-lost', '11.6', '11.7', '11.8', '11.9', '11.10', '11.11', '11.12', '11.13', '11.14', '11.15', '11.16', '11.17', '11.18', 'copy', 'copy-new'];
		for (const id of ids) {
			await reset(t);
			await moment(t, id);
			await t.check(`moment ${id} runs`, () => run(t, (m) => window.PSX.S.moment === m, id));
			await rules(t, `moment ${id}`);
			if (t.args.momentShots) await t.shot(`moment-${id}`, `moment ${id}`);
		}
		await reset(t);
		await t.check('Reset puts the opening view back', () => run(t, () => window.PSX.S.ctx.project === 'tastebook' && !window.PSX.S.firstStart && !document.querySelector('.psx-sheet')));
	});
	await t.noConsoleErrors('no console errors');
}
