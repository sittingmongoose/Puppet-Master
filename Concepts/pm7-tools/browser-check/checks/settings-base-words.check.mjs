import fs from 'node:fs';
// Stream F batch 10, base-page words in Settings (Jared's 2026-11-09 Settings feedback, handed over by stream P).
// FO-134: every placed value control on every Settings page (each chapter, page and manager tab: switches, boxes,
//   sliders, text areas, pickers, choice groups) is named by its row's own label, not the inventory's
//   ("Show Actual Model Used"), and a real hover over a switch on Providers & Accounts › Models shows that label with
//   what a press does ("Turn this setting on." / "...off."), never "Change this setting.".
// FO-134 round 3 (sol-recheck-fo134r2 K1): each roster entry is selected and each manager's inner editor panel
//   (Replace, Edit, Add and the engine's own dialogs) is opened and read too: its fields are named by their visible
//   label and nothing in a panel is left unnamed. The panels are in the same fixture, so one that stops opening fails.
// FO-134 round 4 (sol-recheck-fo134r3 K1/K2): names are Chrome's, read through CDP's Accessibility domain, never
//   worked out from attributes; the walk opens every opener by census (settings-panel-openers.json: each action a
//   Settings button carries is an editor opener, pressed and read, or listed with what it does instead; anything
//   unlisted fails by name); and a themed scope picker is judged on its visible combobox's name with its native
//   select required to stay out of the tree, not on a literal aria-label on the hidden select.
// FO-135: the Settings rail has no "Project: … · concept fixture" line; a chapter page's toolbar project button names the project.
// FO-131: the base scope pickers follow stream P's rule (batch10/fo-b10-e/SCOPE-LIST.md): a thing you add is
//   "Where it’s available: This project / Every project" (Toolchain's Edit panel, the persona scope row, a command's
//   panel, its dry run and the set-up's How it runs step, each scanned whole, with every scope picker's accessible
//   name equal to that label); Git's identity is a computer's: "Where it applies: Every project on <computer> /
//   This project", never "on this server" or "Only this project".
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

async function settings(t, surface, [w, h] = [1920, 1080]) {
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function go(t, f, domain, ws) {
	await f.evaluate(([d, w]) => PM51.go(d, w), [domain, ws]);
	await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
	await t.settle();
}

/* FO-134 round 4 (sol-recheck-fo134r3 K1): a name read here is Chrome's own, from the Accessibility domain. Round 3
   worked the name out from aria-labelledby, aria-label, labels, text and title in the page, and passed a control
   Chrome names "Add a backup model" while the screen says "Service and model": the generated combobox trigger had
   no aria-label of its own, and the row attribute the checker read sat on the field. The tree read here is the same
   one a screen reader gets. `selector` must match exactly one element in the app's frame. */
async function axRead(cdp, selector) {
	return axReadExpr(cdp, `document.querySelector(${JSON.stringify(selector)})`);
}
/* The same read for an expression the caller builds: an element found and read without an attribute being set on it,
   which a re-render would drop between the two calls. */
async function axReadExpr(cdp, expression) {
	const obj = await cdp.send('Runtime.evaluate', { expression, objectGroup: 'fo134' });
	if (!obj.result || !obj.result.objectId) return null;
	/* the element's backend node id, the way the round-3 review's focused script read this stack; the object is
	   released only after the tree has been read from it */
	const node = (await cdp.send('DOM.describeNode', { objectId: obj.result.objectId })).node;
	if (!node || !node.backendNodeId) { await cdp.send('Runtime.releaseObject', { objectId: obj.result.objectId }).catch(() => {}); return null; }
	const nodes = (await cdp.send('Accessibility.getPartialAXTree', { backendNodeId: node.backendNodeId, fetchRelatives: false })).nodes;
	await cdp.send('Runtime.releaseObject', { objectId: obj.result.objectId }).catch(() => {});
	const ax = nodes && nodes[0];
	return ax ? { name: String((ax.name && ax.name.value) || ''), role: String((ax.role && ax.role.value) || ''), ignored: !!ax.ignored } : null;
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`FO-134 controls are named by their row (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		await go(t, f, 'ai', 'providers');
		await f.locator('[data-continuous-workspace-body="providers"] .manager-tab', { hasText: /^\s*Models\s*$/ }).first().click();
		await t.settle();
		await t.page.waitForTimeout(600);
		// every value control the row renderer draws on the page: Chrome's accessible name is the row's visible label
		const rows = await f.evaluate(() => {
			document.querySelectorAll('[data-fo134-row]').forEach((e) => e.removeAttribute('data-fo134-row'));
			const body = document.querySelector('[data-continuous-workspace-body="providers"]');
			const out = [];
			let n = 0;
			for (const row of body.querySelectorAll('.setting-row[data-setting-id], .setting-row[id^="setting-"]')) {
				if (!row.getClientRects().length) continue;
				const ctl = row.querySelector(':scope > .setting-control [aria-label][data-setting], :scope > .setting-control [aria-label] [data-setting]');
				const lab = row.querySelector(':scope > .setting-copy .setting-label');
				if (!ctl || !lab) continue;
				const own = [...lab.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join('').trim();
				/* the control a person works is the themed trigger of an upgraded select; the native select it hides
				   behind is out of the tree */
				const vis = ctl.matches('.pm51-dd-native') ? ctl.closest('.pm51-dd').querySelector('.pm51-dd-trigger') : ctl.closest('[aria-label]');
				if (!vis || !vis.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) continue;
				vis.setAttribute('data-fo134-row', String(++n));
				out.push({ mark: n, id: row.dataset.settingId || row.id, own });
			}
			return out;
		});
		const rowCdp = await t.page.context().newCDPSession(f);
		const names = [];
		for (const x of rows) { const ax = await axRead(rowCdp, `[data-fo134-row="${x.mark}"]`).catch(() => null); names.push({ id: x.id, own: x.own, named: ax ? ax.name : '' }); }
		await rowCdp.detach().catch(() => {});
		// a list's button says its count after the name ("Name: 3 items. Edit")
		const off = names.filter((x) => x.own && !x.named.toLowerCase().includes(x.own.toLowerCase()));
		await t.check(`Models: ${names.length} drawn controls are named by their row's label`, names.length >= 5 && off.length === 0, off.slice(0, 6).map((x) => `${x.id}: "${x.named}" vs "${x.own}"`).join('; ') || `${names.length} controls`);
		// a real hover over the first switch on Models
		const sw = f.locator('[data-continuous-workspace-body="providers"] .setting-row .toggle[role="switch"][data-action="toggle-setting"]').first();
		await sw.scrollIntoViewIfNeeded();
		await t.page.waitForTimeout(300);
		const want = await sw.evaluate((el) => {
			const lab = el.closest('.setting-row').querySelector('.setting-label');
			return { label: [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(), on: el.getAttribute('aria-checked') === 'true' };
		});
		await t.page.mouse.move(5, 5);
		await sw.hover();
		const tag = await f.waitForFunction(() => {
			const tags = [...document.querySelectorAll('.pm-hover-tag')].filter((x) => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden' && parseFloat(getComputedStyle(x).opacity) > 0.5);
			return tags.length ? tags[0].textContent.replace(/\s+/g, ' ').trim() : false;
		}, null, { timeout: 6000 }).then((h) => h.jsonValue()).catch(() => '');
		const detail = want.on ? 'Turn this setting off.' : 'Turn this setting on.';
		await t.check(`Models: hovering "${want.label}" shows its label and what a press does`, !!tag && tag.includes(want.label) && tag.includes(detail) && !/Change this setting/.test(tag), `tag "${tag}"`);
	};

	/* FO-134 / sol-review-l1s L1S-N1: every placed value control on every Settings page, not just Models: each
	   chapter, each page in it (mounted), each manager tab. A row that places a setting (data-setting-id) names its value
	   controls (a text or number box, a text area, a slider, a select or its dropdown, a switch, a choice group) by its
	   own visible label: the accessible name contains it ("Name: 3 items. Edit" counts). The name is Chrome's own,
	   read through CDP's Accessibility domain (round 4), and never one this file works out from attributes.
	   Controls are not pre-selected by having a name. --set chapters=ai,code */
	tests[`FO-134 every placed value control is named by its row (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		const domains = t.args.chapters ? String(t.args.chapters).split(',') : await f.evaluate(() => [...new Set([...document.querySelectorAll('#pm-settings-root [data-action="navigate-domain"]')].map((b) => b.dataset.domain))]);
		const all = [], seen = new Set();
		let panelsOpened = 0;
		/* The page says which elements are the row's value controls and what the row's label says; Chrome says what
		   each control is called. Round 3 worked the name out in the page and passed a control Chrome names "Add a
		   backup model" while the screen says "Service and model" (sol-recheck-fo134r3 K1). */
		const cdp = await t.page.context().newCDPSession(f);
		const namedByChrome = async (cands) => {
			for (const x of cands) {
				if (x.kind === 'coverage') continue;
				const ax = await axRead(cdp, `[data-fo134-el="${x.mark}"]`).catch(() => null);
				x.name = ax ? ax.name : '';
				x.role = ax ? ax.role : '';
				x.ignored = ax ? ax.ignored : true;
				/* A node Chrome ignores is not exposed at all, so it has no name to get wrong; a value control that is
				   ignored has been taken out of the tree a screen reader reads, which is its own failure. */
				/* an ignored node has no name to get wrong when it is painted out or inert; an ignored control that the
				   page is showing has been taken out of the tree a screen reader reads, which is its own failure */
				x.ok = x.ignored ? (x.faded || !x.widget) : (!!x.name && (x.expected === 'any' || x.name.toLowerCase().includes(x.label.toLowerCase())));
			}
			return cands;
		};
		/* The page pass: what a row or field holds, marked for the Accessibility read. Nothing here decides a name.
		   The page is loaded again for each workspace state, so the selector and the helpers are installed here, on
		   every pass, and never read from a global a reload has dropped. */
		const READ = () => {
			/* the kinds a row's value controls come in; inlined because this function is evaluated in the page */
			const VALUE = 'a[href], button, [role="button"], [role="radio"], [role="checkbox"], input:not([type="hidden"]), textarea, select, [role="switch"], [role="slider"], [role="combobox"], .pm51-dd-trigger, [role="radiogroup"], [role="group"], [role="spinbutton"], [role="textbox"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
			const own = (lab) => lab ? [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim() : '';
			const kind = (e) => (e.getAttribute('role') || e.tagName.toLowerCase()) + (e.type && e.tagName === 'INPUT' ? ':' + e.type : '');
			/* a widget is a control the browser must expose: a native control, a link, or an ARIA widget role */
			const widget = (e) => e.matches('input, select, textarea, button, a[href]') || /^(button|switch|slider|combobox|spinbutton|textbox|checkbox|radio|radiogroup|group|listbox)$/.test(e.getAttribute('role') || '');
			/* painted out (opacity 0) or inert: Chrome leaves it out of the tree, so there is no name to get wrong */
			const faded = (e) => !!e.closest('[inert]') || !e.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true });
			document.querySelectorAll('[data-fo134-el]').forEach((e) => e.removeAttribute('data-fo134-el'));
			let mark = 0;
			const out = [];
			const ROWS = ['.setting-row', '.o55-field'].map((x) => '#panel-settings [data-continuous-workspace-body] ' + x).join(', ');
			for (const row of document.querySelectorAll(ROWS)) {
				if (row.closest('[aria-hidden="true"]')) continue;
				const id = row.getAttribute('data-setting-id') || row.id.replace(/^setting-/, '') || (row.closest('[data-continuous-workspace-body]').dataset.continuousWorkspaceBody + ': ' + own(row.querySelector('.setting-label, .o55-field-label')));
				const label = own(row.querySelector('.setting-label, .o55-field-label'));
				const box = row.querySelector(':scope > .setting-control') || row;
				if (!label) continue;
				const expected = [...box.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable="true"], [role]')].filter(e =>
					!e.closest('[aria-hidden="true"]') && e.closest('.setting-row, .o55-field') === row &&
					!e.matches('.details-btn, [data-action="setting-details"], [role="option"], [role="menuitem"], input[type="hidden"]') &&
					(e.matches('a[href], button, input, select, textarea, [contenteditable="true"]') || e.tabIndex >= 0 || /^(button|switch|slider|combobox|spinbutton|textbox|checkbox|radio|radiogroup|group)$/.test(e.getAttribute('role'))));
				for (const e of expected) if (!e.matches(VALUE)) out.push({ id, label, kind: 'coverage', index: expected.indexOf(e), name: 'interactive control omitted by selector', ok: false });
				if (!expected.length && row.dataset.o55Kind && row.dataset.o55Kind !== 'status') out.push({ id, label, kind: 'coverage', index: -1, name: 'value row has no control', ok: false });
				for (const e of box.querySelectorAll(VALUE)) {
					if (e.closest('[aria-hidden="true"]') || (e.tagName === 'INPUT' && /^hidden$/.test(e.type))) continue;
					if (!e.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) continue;   /* not rendered: nowhere in the tree, nothing to name */
					if (e.closest('.setting-row, .o55-field') !== row) continue;   /* a row nested inside this one names its own */
					if (e.matches('[role="option"], [role="menuitem"]')) continue;
					if (e.matches('.details-btn, [data-action="setting-details"]')) continue;
					e.setAttribute('data-fo134-el', String(++mark));
					out.push({ mark, id, label, kind: kind(e), widget: widget(e), faded: faded(e), index: [...box.querySelectorAll(VALUE)].indexOf(e), expected: 'label' });
				}
			}
			window.__fo134 = { VALUE, own, kind, widget, faded };
			return out;
		};
		const take = async (where) => {
			for (const x of await namedByChrome(await f.evaluate(READ))) {
				const k = x.id + '|' + x.kind + '|' + x.index + '|' + x.name;
				if (seen.has(k)) continue;
				seen.add(k); all.push(Object.assign({ where }, x));
			}
		};
		/* FO-134 round 3 (sol-recheck-fo134r2 K1): a manager's inner editor panels (Replace, Edit, Add and the like)
		   hold fields the page never shows. The Discord replacement field read "New address" beside a visible
		   "Webhook address" while this walk passed, because it never opened one. Every open panel is read here: a
		   control inside a field must carry that field's visible label in its name, and a control outside one must
		   still have a name. The opener that was pressed names the census entry, so a panel that stops opening
		   shows up as missing controls. */
		const PANEL_READ = (open) => {
			const S = window.__fo134;
			const roots = [...document.querySelectorAll('.pm51-drawer-wrap.is-open .pm51-panel, .o55g-win, .overlay .dialog[role="dialog"]')].filter((e) => e.getClientRects().length);
			document.querySelectorAll('[data-fo134-el]').forEach((e) => e.removeAttribute('data-fo134-el'));
			let mark = 0;
			const out = [];
			for (const root of roots) {
				const where = open + (root.matches('.o55g-win') ? ' (set-up)' : '');
				for (const field of root.querySelectorAll('.pm51-field, .o55-field, .form-field')) {
					const label = S.own(field.querySelector(':scope > .pm51-field-label, :scope > div > .o55-field-label, .o55-field-label, :scope > .form-label'));
					if (!label) continue;
					for (const e of field.querySelectorAll(S.VALUE)) {
						if (e.closest('.pm51-field, .o55-field, .form-field') !== field) continue;
						if (e.closest('[aria-hidden="true"]') || (e.tagName === 'INPUT' && /^hidden$/.test(e.type))) continue;
						if (!e.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) continue;
						if (e.matches('[role="option"], [role="menuitem"], .details-btn, [data-action="setting-details"]')) continue;
						/* a field's value controls are named by it; a button in the field (Play, Browse…) names its own action */
						const value = e.matches('input, textarea, select, .pm51-dd-trigger, [role="combobox"], [role="slider"], [role="spinbutton"], [role="radiogroup"], [role="group"], [role="switch"]');
						e.setAttribute('data-fo134-el', String(++mark));
						out.push({ mark, id: `panel:${where}:${label}`, label, kind: S.kind(e), widget: S.widget(e), faded: S.faded(e), expected: value ? 'label' : 'any' });
					}
				}
				for (const e of root.querySelectorAll(S.VALUE)) {
					if (e.closest('.pm51-field, .o55-field, .form-field') || e.closest('[aria-hidden="true"]') || (e.tagName === 'INPUT' && /^hidden$/.test(e.type))) continue;
					if (!e.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) continue;
					if (e.matches('[role="option"], [role="menuitem"], .details-btn, [data-action="setting-details"], [data-action="close-overlay"], .pm51-panel-close')) continue;
					/* a container of named controls (a picker row, a step rail) is not a field: its own controls carry names */
					if (e.matches('[role="group"], [role="radiogroup"], [role="listbox"], [role="list"]')) continue;
					e.setAttribute('data-fo134-el', String(++mark));
					out.push({ mark, id: `panel:${where}:`, label: '', kind: S.kind(e), widget: S.widget(e), faded: S.faded(e), expected: 'any' });
				}
			}
			return out;
		};
		/* A sheet, a wizard or an open dropdown left behind by an opener would hide the chapter rail from the next
		   click. Everything is dismissed and Settings is brought back before the walk moves on. */
		const settleScreen = async () => {
			for (let k = 0; k < 4; k++) {
				const any = await f.evaluate(() => !![...document.querySelectorAll('.drawer-wrap, .o55g-layer, .overlay')].find((e) => e.getClientRects().length)).catch(() => false);
				if (!any) break;
				await t.page.keyboard.press('Escape');
				await t.page.waitForTimeout(240);
			}
			await f.evaluate(() => { try { if (typeof closeOverlay === 'function') closeOverlay(false); } catch (e) { /* no overlay */ } }).catch(() => {});
			await t.page.waitForTimeout(120);
		};
		const ensureSettings = async () => {
			await settleScreen();
			const on = await f.evaluate(() => {
				const tab = document.querySelector('#tab-settings');
				return !!(tab && tab.getAttribute('aria-selected') === 'true' && document.querySelector('#panel-settings') && document.querySelector('#panel-settings').getClientRects().length);
			}).catch(() => false);
			if (!on) {
				await settleScreen();
				await f.locator('#tab-settings').click({ timeout: 5000 }).catch(() => {});
				await t.settle().catch(() => {});
			}
		};
		const panelTake = async (action) => {
			for (const x of await namedByChrome(await f.evaluate(PANEL_READ, action))) {
				const k = x.id + '|' + x.kind + '|' + x.name;
				if (seen.has(k)) continue;
				seen.add(k); all.push(Object.assign({ where: 'panel' }, x));
			}
		};
		/* FO-134 round 4 (sol-recheck-fo134r3 K1): the opener list is a positive census, not a pattern. Round 3's
		   regex left out pm51-web-fallbacks, so AI › Web Search › If the model fails › Edit was never opened and the
		   checker passed a control Chrome names "Add a backup model". settings-panel-openers.json names, for every
		   action a Settings page draws on a button, whether pressing it opens an editor (and the panel is read) or what
		   it does instead. A control in neither list fails the walk by name, so a new opener cannot be skipped in
		   silence; it has to be classified here before the run passes. --set openersOut=<file> writes the census
		   observed on this build (a diagnostic: it does not press anything unclassified). */
		const OPENER_DOC = JSON.parse(fs.readFileSync(new URL('./settings-panel-openers.json', import.meta.url), 'utf8'));
		const OPENS = new Set(OPENER_DOC.opens || []);
		/* `other` maps each action to what it does instead; a plain list also reads, for actions with nothing to say */
		const OTHER = new Set(Array.isArray(OPENER_DOC.other) ? OPENER_DOC.other : Object.keys(OPENER_DOC.other || {}));
		const unclassified = new Set();
		const pressedOpeners = new Set();
		const openedBy = {};
		const observedActions = {};
		/* --set openersProbe=1: the evidence run that classifies the census. Every action a button carries is pressed
		   once (bar the ones that destroy a fixture row or sign something out) and whether an editor opened is
		   recorded, so the fixture's two lists come from what the build does, not from what its names look like.
		   A diagnostic: it presses controls the committed census does not, so its verdict is not a result. */
		const PROBE = /^(1|true|yes|on)$/i.test(String(t.args.openersProbe || ''));
		const PROBE_SKIP = /(delete|remove|sign-?out|disconnect|clear|reset|rotate|reencrypt|uninstall)/;
		const probeResult = {};
		const pressedIn = new Set();
		const openPanels = async (d, ws, tab) => {
			if (/^(0|false|no|off)$/i.test(String(t.args.panels || ''))) return;
			const body = (s) => `[data-continuous-workspace-body="${ws}"]${s ? ' ' + s : ''}`;
			const rows = await f.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => e.dataset.id), body('.resource-row[data-id]'));
			for (const rowId of rows) {
				await f.evaluate(([sel, id]) => { const r = [...document.querySelectorAll(sel)].find((e) => e.dataset.id === id && e.getClientRects().length); if (r) r.click(); }, [body('.resource-row[data-id]'), rowId]);
				/* a roster click selects and the detail cross-fades: read the next panel only after the row says it is current */
				await f.waitForFunction(([sel, id]) => { const r = [...document.querySelectorAll(sel)].find((e) => e.dataset.id === id); return !!(r && r.getAttribute('aria-current') === 'true'); }, [body('.resource-row[data-id]'), rowId], { timeout: 4000 }).catch(() => {});
				await t.settle().catch(() => {});
				await t.page.waitForTimeout(180);
				/* Every action a button on this page carries: dropdown parts and native selects excluded (they open a
				   list, not an editor), and every roster row read, not the first few. */
				const actions = await f.evaluate((sel) => {
					const out = new Set();
					for (const e of document.querySelectorAll(sel)) {
						if (!e.getClientRects().length) continue;
						const a = e.dataset.action;
						if (!a || a === 'pm51-disabled' || a === 'pm51-noop') continue;
						if (e.matches('select, option, .pm51-dd-trigger, .pm51-dd-native')) continue;
						if (!e.matches('button, [role="button"], a[href], .pm51-link, .pm51-item, summary')) continue;
						out.add(a);
					}
					return [...out];
				}, body('[data-action]'));
				const where0 = `${d}/${ws}${tab ? '/' + tab : ''}`;
				for (const a of actions) {
					observedActions[where0] = observedActions[where0] || [];
					observedActions[where0].push(a);
					if (!OPENS.has(a) && !OTHER.has(a)) unclassified.add(`${where0}: ${a}`);
				}
				const press = PROBE ? actions.filter((a) => !PROBE_SKIP.test(a)) : actions.filter((a) => OPENS.has(a));
				for (const action of press) {
					/* the probe asks each action once, in the first state it shows in: what is wanted is whether pressing it
					   opens an editor at all, not every place it appears. The walk reads each panel once per workspace,
					   keyed by the opener: a panel's fields are its own, not the selected row's. */
					if (PROBE && probeResult[action]) continue;
					if (!PROBE && pressedIn.has(`${ws}|${action}`)) continue;
					const pressed = await f.evaluate(([sel, a]) => { const e = [...document.querySelectorAll(sel)].find((x) => x.dataset.action === a && x.getClientRects().length); if (!e) return false; e.click(); return true; }, [body('[data-action]'), action]).catch(() => false);
					if (!pressed) continue;
					if (!PROBE) { pressedOpeners.add(action); pressedIn.add(`${ws}|${action}`); }
					const showed = await f.waitForFunction(() => [...document.querySelectorAll('.pm51-drawer-wrap.is-open .pm51-panel, .o55g-win, .overlay .dialog[role="dialog"]')].some((e) => e.getClientRects().length), null, { timeout: PROBE ? 900 : 2500 }).then(() => true).catch(() => false);
					if (showed) { panelsOpened++; openedBy[action] = true; }
					if (PROBE) probeResult[action] = { opened: (probeResult[action] && probeResult[action].opened) || showed, where: where0 };
					await t.settle().catch(() => {});
					await panelTake(action);
					for (let k = 0; k < 3; k++) {
						const still = await f.evaluate(() => [...document.querySelectorAll('.pm51-drawer-wrap.is-open .pm51-panel, .o55g-win, .overlay')].some((e) => e.getClientRects().length));
						if (!still) break;
						await t.page.keyboard.press('Escape');
						await f.evaluate(() => { try { if (typeof closeOverlay === 'function') closeOverlay(false); } catch (e) { /* no overlay */ } }).catch(() => {});
						await t.page.waitForTimeout(260);
					}
					// an opener that left the tab (a route, a panel that took the page) is undone before the next one
					const back = await f.evaluate(([dd, w, tb]) => {
						const b = document.querySelector(`[data-continuous-workspace-body="${w}"][data-workspace-mounted="true"]`);
						return !!(b && b.querySelector(`.manager-tab.active[data-tab="${tb}"]`));
					}, [d, ws, tab]).catch(() => false);
					if (!back) {
						await settleScreen();
						await ensureSettings();
						await f.evaluate(([dd, w]) => PM51.go(dd, w), [d, ws]).catch(() => {});
						await t.page.waitForTimeout(300);
						if (tab) await f.evaluate(([w, tb]) => PM51.switchTab(w, tb), [ws, tab]).catch(() => {});
						await t.page.waitForTimeout(300);
					}
				}
			}
		};
		/* Every workspace state is read on a page it reached without an earlier press having touched it. A Settings
		   page keeps one demo-state object, and pressing an opener changes what later pages draw (a service switched
		   on, a row removed), so a walk that reads on through those presses reports a different census every run. The
		   page is reloaded for each state instead; presses still run in that state, and each opener is pressed once per
		   workspace. */
		const loadState = async (d, ws, tab) => {
			await settings(t, surface);
			await f.evaluate(([dd, w]) => PM51.go(dd, w), [d, ws]);
			await f.waitForSelector(`[data-continuous-workspace-body="${ws}"][data-workspace-mounted="true"]`, { timeout: 15000 });
			await t.settle();
			if (!tab) return;
			await f.evaluate(([w, tb]) => {
				const old = document.querySelector(`[data-continuous-workspace-body="${w}"] .pm51-mgr > .manager-body:not(.o55-leaving)`);
				if (old) old.setAttribute('data-fo134-old-body', 'true');
				PM51.switchTab(w, tb);
			}, [ws, tab]);
			// Tab content is replaced after a presented frame; sandbox frames can take longer than 700 ms.
			// Wait for the old body to leave instead of moving on and cancelling the pending switch.
			await f.waitForFunction(([w, tb]) => {
				const b = document.querySelector(`[data-continuous-workspace-body="${w}"]`);
				return b && !b.querySelector('[data-fo134-old-body]') && b.querySelector(`.manager-tab.active[data-tab="${tb}"]`);
			}, [ws, tab], { timeout: 15000 }).catch(() => {});
			await t.settle();
		};
		for (const d of domains) {
			await settings(t, surface);
			await f.locator(`#pm-settings-root [data-action="navigate-domain"][data-domain="${d}"]`).first().click({ timeout: 10000 });
			await f.waitForSelector(`#pm-settings-root .domain-link.active[data-domain="${d}"]`, { timeout: 15000 });
			await t.settle();
			const wss = await f.evaluate(() => [...document.querySelectorAll('[data-continuous-workspace-body]')].map((b) => b.dataset.continuousWorkspaceBody));
			for (const ws of wss) {
				await loadState(d, ws, null);
				const active = await f.evaluate((w) => (document.querySelector(`[data-continuous-workspace-body="${w}"] .manager-tab.active[data-tab]`) || { dataset: {} }).dataset.tab || '', ws);
				const tabs = await f.evaluate((w) => [...document.querySelectorAll(`[data-continuous-workspace-body="${w}"] .pm51-tabs .manager-tab[data-tab]`)].map((b) => b.dataset.tab), ws);
				await take(`${d}/${ws}`);
				await openPanels(d, ws, active);
				for (const tab of tabs) {
					await loadState(d, ws, tab);
					await take(`${d}/${ws}/${tab}`);
					await openPanels(d, ws, tab);
				}
			}
		}
		// Full-walk floor includes the 778 value controls independently inventoried in the FO-134 recheck.
		// The per-row census above also fails if VALUE misses a newly introduced interactive kind.
		const bad = all.filter((x) => !x.ok);
		const kinds = {}; for (const x of all) kinds[x.kind] = (kinds[x.kind] || 0) + 1;
		const census = {}; for (const x of all) { const key = x.id + '|' + x.kind; census[key] = (census[key] || 0) + 1; }
		if (t.args.namesCensus) fs.writeFileSync(String(t.args.namesCensus), JSON.stringify(census, null, 2) + '\n');
		if (t.args.openersOut) fs.writeFileSync(String(t.args.openersOut), JSON.stringify(observedActions, null, 2) + '\n');
		if (t.args.probeOut) fs.writeFileSync(String(t.args.probeOut), JSON.stringify(probeResult, null, 2) + '\n');
		const fixture = new URL('./settings-value-controls.json', import.meta.url);
		if (!t.args.chapters && !t.args.namesCensus) await t.check('the expected-control census fixture exists', fs.existsSync(fixture));
		const panelsOff = /^(0|false|no|off)$/i.test(String(t.args.panels || ''));
		if (fs.existsSync(fixture) && !t.args.chapters) {
			const expected = JSON.parse(fs.readFileSync(fixture, 'utf8'));
			const missing = Object.entries(expected).filter(([key, n]) => !(panelsOff && key.startsWith('panel:')) && (census[key] || 0) < n);
			await t.check('every expected row contributes all its value controls', !missing.length,
				missing.map(([key, n]) => `${key}: expected ${n}, walked ${census[key] || 0}`).join('; '));
		}
		t.log(`walked ${domains.length} chapters: ${all.length} value controls on ${new Set(all.map((x) => x.id)).size} placed rows; kinds ${JSON.stringify(kinds)}`);
		const inPanels = all.filter((x) => x.id.startsWith('panel:'));
		t.log(`opened ${panelsOpened} inner editor panels: ${inPanels.length} controls in them`);
		if (!panelsOff)
			await t.check(`every manager's inner editor panels open and their fields are read (${panelsOpened} panels, ${inPanels.length} controls)`, !t.args.chapters ? panelsOpened >= 20 && inPanels.length >= 40 : panelsOpened >= 1, `${panelsOpened} panels, ${inPanels.length} controls`);
		const ignored = all.filter((x) => x.ignored);
		t.log(`Chrome ignored ${ignored.length} of ${all.length} (none of them a value control: ${ignored.filter((x) => x.widget).length} were)`);
		const quiet = [...pressedOpeners].filter((a) => !openedBy[a]);
		if (quiet.length) t.log(`known openers that opened no panel in this walk (check the census): ${quiet.join(', ')}`);
		/* The positive opener census (round 4). A page action in neither list is a control this walk did not open,
		   so it fails here by name instead of being passed over. */
		if (!panelsOff && !PROBE) await t.check(`every Settings page action is a known opener or a known non-opener (${OPENS.size} openers)`,
			unclassified.size === 0, unclassified.size ? `${unclassified.size} unclassified: ${[...unclassified].slice(0, 12).join('; ')}` : `${pressedOpeners.size} openers pressed of ${OPENS.size} known`);
		if (bad.length) t.log('unnamed or misnamed: ' + JSON.stringify(bad.map((x) => `${x.where} ${x.id} ${x.kind} "${x.name}" vs "${x.label}"${x.ignored ? ' (ignored by Chrome)' : ''}`)));
		await t.check(`every placed value control on every Settings page is named by its row (${all.length} controls)`, (t.args.chapters ? all.length > 0 : all.length >= 778) && bad.length === 0, `${bad.length} not: ` + bad.slice(0, 20).map((x) => `${x.id} ${x.kind} "${x.name}" vs "${x.label}"${x.ignored ? ' (ignored)' : ''}`).join('; '));
	};

	tests[`FO-135 no rail project line (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		for (const size of [[1920, 1080], [860, 900]]) {
			const f = await settings(t, surface, size);
			await go(t, f, 'ai', 'providers');   // a chapter page: its toolbar carries the project button
			const r = await f.evaluate(() => ({
				line: [...document.querySelectorAll('#panel-settings .rail-project')].map((x) => x.textContent.trim()),
				fixture: /concept fixture/i.test(document.querySelector('#panel-settings .domain-rail, #panel-settings .rail-head')?.textContent || ''),
				pill: [...document.querySelectorAll('#panel-settings [data-action="project-menu"]')].filter((x) => x.getClientRects().length).map((x) => x.textContent.trim()).join(' ') || '',
			}));
			await t.check(`${size.join('x')}: the Settings rail does not repeat the project`, r.line.length === 0 && !r.fixture, r.line.join(' | '));
			await t.check(`${size.join('x')}: the toolbar's project button still names it`, r.pill.length > 0, `project button "${r.pill}"`);
		}
	};

	tests[`FO-131 base scope pickers share This project / Every project (${surface})`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; }
		const f = await settings(t, surface);
		const persona = await f.evaluate(() => ['project', 'global'].map((v) => PM51.valueLabel('personas.library.custom-scope', v)));
		await t.check('Personas › the persona scope: This project / Every project', persona.join(' / ') === 'This project / Every project', persona.join(' / '));
		// Toolchain › a language server's Edit panel
		await go(t, f, 'code', 'toolchain');
		const opened = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="toolchain"] [data-action="pm51-toolchain-edit-lsp"]'); if (!b) return false; b.click(); return true; });
		if (await t.check('Toolchain: a language server has Edit', opened)) {
			const got = await f.waitForFunction(() => {
				const sel = [...document.querySelectorAll('select[data-field="scope"]')].find((s) => s.closest('aside, .drawer, .pm51-panel, [role="dialog"]'));
				const lab = sel && sel.closest('.pm51-field') && sel.closest('.pm51-field').querySelector('.pm51-field-label');
				return sel ? { opts: [...sel.options].map((o) => o.textContent.trim()), label: lab ? lab.textContent.trim() : '' } : false;
			}, null, { timeout: 8000 }).then((h) => h.jsonValue()).catch(() => ({ opts: [], label: '' }));
			await t.check('Toolchain › Edit: “Where it’s available: This project / Every project”', got.label === 'Where it’s available' && got.opts.join(' / ') === 'This project / Every project', `${got.label}: ${got.opts.join(' / ') || 'no picker'}`);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(400);
		}
		// Commands: the panel, its dry run and the New command set-up's "How it runs" step. Each is scanned whole (labels,
		// headings, facts, kv keys, the accessible names of its pickers) for the retired scope words, and every scope
		// picker's accessible name must be its visible "Where it’s available" (one spelling, the curly apostrophe)
		// only: read just the innermost open sheet whose text has these words (the dry run opens over the command's panel)
		const scan = (where, only = '') => f.evaluate(([where, banned, only]) => {
			const re = new RegExp(banned, 'i'), vis = (e) => e.getClientRects().length;
			let roots = [...document.querySelectorAll('#pm-settings-portals, .drawer-wrap, aside.drawer, [role="dialog"], .o55g-win, .o55g-layer')].filter(vis);
			if (only) { const hit = [...document.querySelectorAll('aside.drawer, [role="dialog"], .drawer-wrap')].filter((r) => vis(r) && r.textContent.includes(only)); roots = hit.length ? [hit[hit.length - 1]] : []; }
			const hits = [], pickers = [];
			for (const r of roots) {
				for (const e of r.querySelectorAll('.pm51-field-label, .pm51-ps-title, .pm51-pc-head, .pm51-kv-row > span:first-child, dt, th, .o55g-lead, p, .pm51-fact-label, [class*="fact"] span, h2, h3, h4')) if (vis(e) && re.test(e.textContent)) hits.push(e.textContent.trim().slice(0, 80));
				for (const e of r.querySelectorAll('[aria-label]')) if (re.test(e.getAttribute('aria-label'))) hits.push('name: ' + e.getAttribute('aria-label'));
				for (const sel of r.querySelectorAll('select')) {
					const opts = [...sel.options].map((o) => o.textContent.trim());
					if (!opts.includes('This project') || !opts.includes('Every project')) continue;
					/* FO-134 round 4 (sol-recheck-fo134r3 K2): note which picker this is; its name is read from Chrome's
					   accessibility tree once this scan returns, and the picker is found again by this key for the read, so
					   nothing depends on an attribute surviving between the two. The native select is a dropdown's hidden
					   twin (aria-hidden, tabindex -1) and has no name to check. */
					pickers.push({ key: [(sel.dataset.action || ''), (sel.dataset.field || ''), (typeof sel.className === 'string' ? sel.className : '')].join('\u0001'), trigger: !!(sel.parentElement && sel.parentElement.querySelector('.pm51-dd-trigger')) });
				}
			}
			return { where, roots: roots.length, hits: [...new Set(hits)], pickers };
		}, [where, 'Available in|Where it is available|Where it\'s available|Use it in|Use it for|Where it is saved|This project only|All my projects|All your projects', only]);
		/* FO-134 round 4 (sol-recheck-fo134r3 K2): a scope picker is a themed combobox trigger, and the native select
		   under it is hidden from the tree a screen reader reads. What the picker is called is Chrome's answer for the
		   visible trigger; round 3 demanded a literal aria-label on the hidden select and failed the product for not
		   having one. */
		const judge = async (r, wantPicker) => {
			await t.check(`Commands › ${r.where}: no retired or mixed scope words`, r.roots > 0 && r.hits.length === 0, r.roots ? r.hits.join(' | ') : 'nothing open');
			if (!wantPicker) return;
			const cdp131 = await t.page.context().newCDPSession(f);
			const got = [];
			for (const p of r.pickers) {
				if (!p.key) { got.push({ diag: p.diag }); continue; }
				const find = (part) => `(() => { const all = [...document.querySelectorAll('#pm-settings-portals select, .drawer-wrap select, aside.drawer select, [role="dialog"] select, .o55g-win select')].filter((s) => s.options.length > 1); const sel = all.find((s) => ${JSON.stringify(p.key)} === [(s.dataset.action || ''), (s.dataset.field || ''), (typeof s.className === 'string' ? s.className : '')].join('\\u0001')); if (!sel) return null; return ${part}; })()`;
				const trig = await axReadExpr(cdp131, find("sel.parentElement && sel.parentElement.querySelector('.pm51-dd-trigger')")).catch(() => null);
				const sel = await axReadExpr(cdp131, find('sel')).catch(() => null);
				got.push({ key: p.key, trigger: trig, select: sel });
			}
			await cdp131.detach().catch(() => {});
			const ok = got.length > 0 && got.every((x) => x.trigger && !x.trigger.ignored && x.trigger.name === 'Where it’s available' && (!x.select || x.select.ignored));
			await t.check(`Commands › ${r.where}: the scope picker's combobox is named “Where it’s available” and its native select is hidden from the tree`, ok,
				JSON.stringify(got.map((x) => x.diag ? x : { trigger: x.trigger && x.trigger.name, triggerRole: x.trigger && x.trigger.role, triggerIgnored: !!x.trigger?.ignored, selectIgnored: x.select ? !!x.select.ignored : 'not in tree' })));
		};
		await go(t, f, 'code', 'commands');
		await f.evaluate(() => PM51.switchTab('commands', 'commands'));
		const cmd = await f.waitForFunction(() => { const b = document.querySelector('[data-continuous-workspace-body="commands"] [data-action="pm51-commands-open"]'); if (!b) return false; b.click(); return true; }, null, { timeout: 8000 }).then(() => true).catch(() => false);
		if (await t.check('Commands: a command opens', cmd)) {
			await f.waitForSelector('[data-action="pm51-commands-field"][data-field="scope"]', { state: 'attached', timeout: 8000 }).catch(() => {});
			await t.page.waitForTimeout(400);
			await judge(await scan('a command’s panel'), true);
			const dry = await f.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.getClientRects().length && /Preview \(dry run\)/.test(x.textContent)); if (!b) return false; b.click(); return true; });
			if (await t.check('Commands: the panel has Preview (dry run)', dry)) {
				await f.waitForFunction(() => [...document.querySelectorAll('.pm51-ps-title, .pm51-pc-head')].some((x) => x.getClientRects().length && /How it will run/.test(x.textContent)), null, { timeout: 8000 }).catch(() => {});
				await judge(await scan('the dry run', 'How it will run'), false);
			}
			for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); }
		}
		const wiz = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="commands"] [data-action="pm51-commands-new"]'); if (!b) return false; b.click(); return true; });
		if (await t.check('Commands: New command opens its set-up', wiz)) {
			// Start: the first example; Write: give it a name nobody has; then How it runs
			await f.waitForSelector('.o55g-primary', { timeout: 8000 });
			await f.evaluate(() => { const tile = [...document.querySelectorAll('[data-action="pm51-commands-example"]')].find((x) => x.getClientRects().length); if (tile) tile.click(); });
			// a card picks and may move on by itself: press Continue only while the Start step still shows
			const shown = (sel) => f.evaluate((sel) => [...document.querySelectorAll(sel)].some((x) => x.getClientRects().length), sel);
			await t.page.waitForTimeout(700);
			if (!(await shown('.o55-cmd-name'))) await f.locator('.o55g-primary').first().click();
			await f.waitForFunction(() => [...document.querySelectorAll('.o55-cmd-name')].some((x) => x.getClientRects().length), null, { timeout: 8000 });
			await f.evaluate(() => { const set = (sel, v) => { const e = document.querySelector(sel); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } }; const val = (sel) => (document.querySelector(sel) || {}).value; set('.o55-cmd-name', 'fo131-check'); if (!val('.o55-cmd-desc')) set('.o55-cmd-desc', 'A check'); if (!val('.o55-cmd-text')) set('.o55-cmd-text', 'Hello'); });
			await f.locator('.o55g-primary').first().click();   // Write → How it runs, once
			const step = await f.waitForFunction(() => [...document.querySelectorAll('select.o55-cmd-scope')].some((x) => x.parentElement && x.parentElement.getClientRects().length), null, { timeout: 8000 }).then(() => true).catch(() => false);
			if (await t.check('Commands › New command reaches “How it runs”', step)) {
				// the step cross-fades in: read again until its picker is inside an open sheet (up to 4 s)
				let r = await scan('the set-up’s How it runs step');
				for (let k = 0; k < 20 && !r.pickers.length; k++) { await t.page.waitForTimeout(200); r = await scan('the set-up’s How it runs step'); }
				if (!r.pickers.length) r.pickers = [{ diag: await f.evaluate(() => [...document.querySelectorAll('select.o55-cmd-scope')].map((x) => { const anc = []; for (let e = x.parentElement; e && anc.length < 8; e = e.parentElement) anc.push((e.tagName + '.' + String(e.className).split(' ').slice(0, 2).join('.')).slice(0, 40)); return { vis: x.getClientRects().length, opts: [...x.options].map((o) => o.textContent.trim()), anc }; })) }];
				await judge(r, true);
			}
			for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(250); }
		}
		// P's rule on the recheck's four notes: the persona scope is a setting row and keeps its inventory label; the
		// Permissions summary row is a value, "Where it applies"; the Details panel says a global value applies
		// "Everywhere, …". (Skills' review lead is wording inside the add-skill wizard, read in code review.)
		for (let k = 0; k < 3; k++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(200); }
		const plabel = await f.evaluate(() => PM51.rowLabel(PM51.setting('personas.library.custom-scope')));
		await t.check('Personas › the persona scope row keeps its label “Save new personas for”', plabel === 'Save new personas for', plabel);
		await go(t, f, 'safety', 'permissions');
		const perm = await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="permissions"]'); const labs = b ? [...b.querySelectorAll('.pm51-row-label')].filter((x) => x.getClientRects().length).map((x) => x.textContent.trim()) : []; return { where: labs.includes('Where it applies'), applies: labs.includes('Applies') }; });
		await t.check('Safety › Permissions › In short: “Where it applies”, not “Applies”', perm.where && !perm.applies, JSON.stringify(perm));
		const ins = await f.evaluate(async () => {
			const ref = window.PM12_REFERENCE, ids = [];
			if (ref && ref.byCat) for (const c of Object.values(ref.byCat)) for (const r of c.settings || []) if (Array.isArray(r.scope) && r.scope.length === 1 && r.scope[0] === 'global') ids.push(r.id);
			for (const id of ids.slice(0, 40)) {
				try { PM51.revealSetting(id); } catch (e) { continue; }
				for (let i = 0; i < 30; i++) {
					await new Promise((r) => setTimeout(r, 100));
					const b = [...document.querySelectorAll(`.details-btn[data-setting="${CSS.escape(id)}"]`)].find((x) => x.getClientRects().length);
					if (!b) continue;
					b.click();
					for (let j = 0; j < 30; j++) {
						await new Promise((r) => setTimeout(r, 100));
						const h = [...document.querySelectorAll('.o55-insp-block h4')].find((x) => x.getClientRects().length && x.textContent.trim() === 'Where it applies');
						if (h) return { id, text: h.parentElement.querySelector('p').textContent.trim() };
					}
					break;
				}
			}
			return { id: null, text: '' };
		});
		await t.check('Details panel › a global value: “Where it applies: Everywhere, unless a project sets its own.”', /^Everywhere, unless a project sets its own/.test(ins.text), JSON.stringify(ins));
		await t.page.keyboard.press('Escape');
		// Source Control › Git identity: a computer's setting
		await t.page.keyboard.press('Escape');
		await go(t, f, 'source', 'source-manager');
		await f.evaluate(() => PM51.switchTab('source-manager', 'defaults'));   // Defaults & Safety › You and sign-in › Set up Git
		const opened2 = await f.waitForFunction(() => { const b = document.querySelector('[data-continuous-workspace-body="source-manager"] [data-action="pm51-source-git-setup"]'); if (!b) return false; b.click(); return true; }, null, { timeout: 8000 }).then(() => true).catch(() => false);
		if (await t.check('Source Control: the Git identity set-up opens', opened2)) {
			const git = await f.waitForFunction(() => {
				const sel = document.querySelector('select.o55-gs-scope');
				const lab = sel && sel.closest('.pm51-field') && sel.closest('.pm51-field').querySelector('.pm51-field-label');
				return sel ? { opts: [...sel.options].map((o) => o.textContent.trim()), label: lab ? lab.textContent.trim() : '' } : false;
			}, null, { timeout: 8000 }).then((h) => h.jsonValue()).catch(() => ({ opts: [], label: '' }));
			await t.check('Source Control › Git identity: “Where it applies: Every project on <computer> / This project”', git.label === 'Where it applies' && /^Every project on \S/.test(git.opts[0] || '') && git.opts[1] === 'This project', `${git.label}: ${git.opts.join(' / ') || 'no picker'}`);
			await t.page.keyboard.press('Escape');
		}
	};
}
