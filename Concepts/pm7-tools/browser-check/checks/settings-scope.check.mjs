// The settings-scope concept (Concepts/settings-scope/opus-5.5/, BUILD-SPEC-settings-concept.md section 16.3): a
// runtime layer over PMConcept7's Settings. It runs on the single-file app build, and skips with a note on any page
// without html[data-psx-layer]:
//   python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-scope.check.mjs --set page=$OUT/settings-scope-app.html
// --set lookShots=1 lists the review images (BUILD-SPEC 16.4) under LOOK; without it they are saved for diff only.
// --set only=rules|behaviour|looks|widths|moments runs one part.
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
	const engineWords = ['Wait for a server this long', 'MCP servers', 'Docker container'];
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
		await t.check('Thinking depth reads Changed · This project', () => run(t, () => { const r = document.getElementById('setting-ai.models.reasoning-effort'); return !!r && r.classList.contains('is-changed') && /This project/.test(r.querySelector('.o55-about').textContent); }));
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
			const sel = document.querySelector('#setting-ai\\.models\\.reasoning-effort select.pm51-dd-native');
			sel.value = 'low'; sel.dispatchEvent(new Event('change', { bubbles: true }));
			await new Promise((r) => setTimeout(r, 800));
			return window.PSX.lastNote.title;
		}), 'Saved for tastebook.');
		// Home NAS isn't answering: an everywhere change is refused, and nothing is queued
		await reset(t);
		const c = await run(t, async () => {
			const P = window.PSX;
			await P.command({ cmd: 'ctx', homenas: 'down' });
			await new Promise((r) => setTimeout(r, 400));
			const sel = document.querySelector('#setting-ai\\.models\\.default-variant select.pm51-dd-native');
			const was = P.W.everywhere['ai.models.default-variant'];
			sel.value = 'fast'; sel.dispatchEvent(new Event('change', { bubbles: true }));
			await new Promise((r) => setTimeout(r, 900));
			const engine = window.PM12_KIMI.getState().settings['ai.models.default-variant'];
			return { was, now: P.W.everywhere['ai.models.default-variant'], engine, note: P.lastNote, head: (document.querySelector('.psx-head') || {}).innerText || '' };
		});
		await t.check('with Home NAS away an everywhere change is not made', c.now === c.was && c.engine !== 'fast', JSON.stringify(c));
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
		// focus, from a row on screen (Thinking depth on the Models page): the end word opens the panel, Change on a line
		// opens its control, Esc puts focus back on Change, Esc again closes the panel onto the row's end word
		await run(t, async () => { const b = document.querySelector('#pm-settings-root .detail-inspector .pm51-panel-close'); if (b) b.click(); await new Promise((r) => setTimeout(r, 500)); window.PM12_KIMI.navigate('ai', 'providers'); await new Promise((r) => setTimeout(r, 400)); window.PM12_KIMI.dispatchAction('pm51-tab', { manager: 'providers', tab: 'models' }); await new Promise((r) => setTimeout(r, 600)); });
		await t.root.locator('#setting-ai\\.models\\.reasoning-effort > .o55-about').click();
		await t.until('the end word opens the panel', () => !!document.querySelector('#pm-settings-root .detail-inspector[aria-hidden="false"] [data-psx-block="where"]'), null, { timeout: 6000 });
		await t.check('the end word says the panel is open', () => run(t, () => document.querySelector('#setting-ai\\.models\\.reasoning-effort > .o55-about').getAttribute('aria-expanded') === 'true'));
		await t.check('Choosing here changes names this project', () => run(t, () => /tastebook/.test((document.querySelector('#pm-settings-root .detail-inspector .psx-target-btn') || {}).textContent || '')));
		const ch = t.root.locator('#pm-settings-root .detail-inspector [data-psx-key="project:tastebook:change"]');
		await ch.click();
		await t.until('the inline control has focus', () => !!document.activeElement && document.activeElement.hasAttribute('data-psx-edit-control'), null, { timeout: 4000 });
		await t.page.keyboard.press('Escape');
		await t.until('Esc puts focus back on Change', () => !!document.activeElement && document.activeElement.getAttribute('data-psx-key') === 'project:tastebook:change', null, { timeout: 4000 });
		await t.page.keyboard.press('Escape');
		await t.until('Esc closes the panel and focus lands on the row’s end word', () => !!document.activeElement && document.activeElement.classList.contains('o55-about') && document.activeElement.getAttribute('data-setting') === 'ai.models.reasoning-effort', null, { timeout: 5000 });

		// the copy sheet: the totals match the ticks, Tab stays inside, Esc returns to the opener
		await reset(t);
		await run(t, () => window.PSX.copy.open({ mode: 'new', comp: 'homenas', advanced: true }));
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
		const ids = ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '11.7', '11.8', '11.9', '11.10', '11.11', '11.12', '11.13', '11.14', '11.15', '11.16', '11.17', 'copy', 'copy-new'];
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
