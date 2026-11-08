// FO-101, FO-102, FO-103: what a row of Files acts on, read from each command's effect (the opens PM_HOME is asked for,
// the notes shown), never from the running page's text, which the rail skin cuts in the middle to fit. The expected path of
// each row comes from the page file: a Changed or Open editors item's full path (.fm-cpath), a Recent row's authored path
// (.fm-path); a tree row's data-path.
// - FO-101: a real left click on every Recent row opens its own file as a preview, in all ten looks (the skin cuts some
//   of their paths: the log names each row's shown text).
// - FO-103 A: every Changed, Open editors and Recent row names its own full path (data-path equals the path the page file
//   shows for it), so no row is named by a bare file name (two files can share one); and File actions › Open on every
//   one of those rows, by a real right-click, opens that path, in all ten looks.
// - FO-103 B: with every Changed and Open editors item's full path text decorated at run time (' (decorated)' after it),
//   File actions › Open still acts on the row's own file, and no tab is named by the text. (A Recent row's path is the
//   rail skin's to cut, and it puts its own text back, so FO-101's cut rows stand for it.)
// - FO-103 C: a row that names its file only in its demo arg, with a note after it ('cmd.file.open -> README.md
//   (recently opened)'), is still found: File actions › Open opens README.md.
// - FO-102: on a folder, by a right-click and by Shift+F10: Open expands it in the tree (the tree's own aria-expanded) and
//   opens no editor; Open in new panel and Open to the side are unavailable (aria-disabled), a press on either says why
//   (a note naming the folder), opens nothing and leaves the menu open; a folder the tree lists without its files
//   (under node_modules) says so; and a file row's menu after a folder's has both again (Open in new panel opens it).
// - FO-105: a left click on a Recent row marks nothing: after real clicks on the last three Recent rows (two of them open
//   on base too), no Recent row carries the current-file mark (.active-file), and the tree's and Open editors' marks are
//   as they were (base marked each clicked row, so marks piled up, and cleared the tree's).
// Sizes 1920x1080, 1280x500 and 740x768, both surfaces, one test each.
//   --set size=1280x500   --set looks=glass-dark,nier-light   --set parts=105,101,103a,103b,103c,102
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZES = [[1920, 1080], [1280, 500], [740, 768]];
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-dark`, `${f}-light`]);
const PARTS = ['105', '101', '103a', '103b', '103c', '102'];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const MENU = '#fileContextMenu';
// the rows of each kind, in document order: a Changed item's row, an Open editors item's row, a Recent row (an .fm-openrow
// outside an item)
const SEL = {
	changed: '#panel-files [data-pane="changed"] .fm-changeitem > .fm-changerow',
	editors: '#panel-files [data-pane="open"] .fm-openitem > .fm-openrow',
	recent: '#panel-files [data-pane="open"] .fm-openrow:not(.fm-openitem > .fm-openrow)',
};
const TAB = { changed: 'changed', editors: 'open', recent: 'open' };

// The side panel as the page file authors it (the same file, or served page, the kit opens).
async function authoredSlot(t) {
	const page = t.args.page ? String(t.args.page) : fileURLToPath(new URL('../../../PMConcept7.html', import.meta.url));
	const served = /^https?:/i.test(page), file = /^file:/i.test(page) ? fileURLToPath(page) : served ? null : path.resolve(page);
	const html = served ? await (await fetch(page)).text() : await readFile(file, 'utf8');
	const at = html.indexOf('id="sidePanelSlot"');
	if (at < 0) return null;
	const start = html.lastIndexOf('<aside', at), re = /<(\/?)aside\b/gi;
	re.lastIndex = start;
	for (let m, depth = 0; (m = re.exec(html));) {
		depth += m[1] ? -1 : 1;
		if (!depth) return html.slice(start, html.indexOf('>', m.index) + 1);
	}
	return null;
}

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	const parts = list(t.args.parts, PARTS), looks = list(t.args.looks, LOOKS), tag = `${surface} ${w}x${h}`;
	const slot = await authoredSlot(t);
	if (!await t.check(`${tag}: the page file holds the side panel`, !!slot, '', { hard: true })) return;
	await t.viewport(w, h);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.PM_HOME && typeof PM_HOME.open === 'function', null, { timeout: 15000 });
	const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
	// Test-side recorders: the opens PM_HOME is asked for and the notes shown.
	await f.evaluate(() => {
		const fx = window.__frp = { opens: [], toasts: [] };
		const open = PM_HOME.open; PM_HOME.open = function (spec, ...a) { fx.opens.push(JSON.parse(JSON.stringify(spec || {}))); return open.apply(this, [spec, ...a]); };
		const say = window.toast; if (typeof say === 'function') window.toast = function (m, ...a) { fx.toasts.push(String(m)); return say.apply(this, [m, ...a]); };
	});
	const fx = () => f.evaluate(() => JSON.parse(JSON.stringify(window.__frp)));
	const clear = () => f.evaluate(() => { __frp.opens = []; __frp.toasts = []; });
	const until = (fn, arg, ms = 3000) => f.waitForFunction(fn, arg, { timeout: ms, polling: 50 }).then(() => true, () => false);
	// The expected path of each row, from the page file.
	const authored = await f.evaluate(([html, SEL]) => {
		const doc = new DOMParser().parseFromString(html, 'text/html'), out = {};
		for (const [k, sel] of Object.entries(SEL)) out[k] = [...doc.querySelectorAll(sel)].map((r) => {
			const item = r.closest('.fm-changeitem, .fm-openitem');
			return ((item && item.querySelector('.fm-cpath')) || r.querySelector('.fm-path'))?.textContent.trim() || null;
		});
		return out;
	}, [slot, SEL]);
	const live = await f.evaluate((SEL) => {
		const out = {};
		for (const [k, sel] of Object.entries(SEL)) out[k] = [...document.querySelectorAll(sel)].map((r, i) => { r.setAttribute('data-frp', `${k}-${i}`); return r.getAttribute('data-path'); });
		return out;
	}, SEL);
	for (const k of Object.keys(SEL))
		await t.check(`${tag}: the ${k} rows match the rows the page file authors`, authored[k].length > 0 && authored[k].length === live[k].length && authored[k].every(Boolean), JSON.stringify({ authored: authored[k], live: live[k].length }), { hard: true });
	const rows = Object.keys(SEL).flatMap((k) => authored[k].map((want, i) => ({ kind: k, i, want, id: `${k}-${i}`, own: live[k][i] })));

	// The Files panel, on the tab a row is in (and Recent, folded at first, opened by its head as a person would).
	const slotEl = f.locator('#sidePanelSlot'), icon = f.locator('#activityBar .icon[data-target="panel-files"]');
	const pane = async (tab) => {
		const shown = () => f.evaluate(() => { const s = document.getElementById('sidePanelSlot'); return !!s && s.checkVisibility() && document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id === 'panel-files'; });
		for (let n = 0; n < 3 && !await shown(); n++) { await icon.click(); await until(() => document.querySelector('#sidePanelSlot > .side-panel-view.active')?.id === 'panel-files' && document.getElementById('sidePanelSlot').checkVisibility(), null, 1500); }
		const tb = f.locator(`#panel-files .pm-segtab-item[data-tab="${tab}"]`);
		if (!await tb.evaluate((e) => e.classList.contains('active'))) { await tb.click(); await until((tab) => !document.querySelector(`#panel-files [data-pane="${tab}"]`).classList.contains('pm-hidden'), tab); }
		if (tab === 'open') {
			const head = f.locator('#panel-files [data-pane="open"] .sh-shelf:not(.open) > .sh-head[data-collapse]');
			if (await head.count()) { await head.first().click(); await until(() => !document.querySelector('#panel-files [data-pane="open"] .sh-shelf:not(.open)')); }
		}
	};
	// Where the pointer rests before a key opens a menu: off the side panel, on a point with no hover affordance.
	const restPt = async () => {
		const p = await f.evaluate(() => { const slot = document.getElementById('sidePanelSlot');
			const busy = (h) => !h || (slot && slot.contains(h)) || !!h.closest('[role="menu"], [role="dialog"], [role="tooltip"], button, a, input, textarea, select, summary, [contenteditable], [title], [role="button"], [role="tab"], [data-pm-hover-label], [data-pm-hover-kind], [aria-describedby]');
			for (const fx of [0.98, 0.9, 0.75, 0.6]) for (let y = innerHeight * 0.45; y < innerHeight - 30; y += 16) { const x = Math.round(innerWidth * fx); if (!busy(document.elementFromPoint(x, y))) return { x, y: Math.round(y) }; }
			return { x: 2, y: 2 }; });
		await t.page.mouse.move(off.x + p.x, off.y + p.y);
	};
	const isOpen = () => f.evaluate((m) => !!document.querySelector(m)?.classList.contains('is-open'), MENU);
	const shut = async () => { if (await isOpen()) { await t.page.keyboard.press('Escape'); await until((m) => !document.querySelector(m).classList.contains('is-open'), MENU); } };
	const openMenu = async (loc, input) => {
		await loc.scrollIntoViewIfNeeded();
		if (input === 'mouse') await loc.click({ button: 'right' });
		else { await restPt(); await loc.focus(); await t.page.keyboard.press('Shift+F10'); }
		return until((m) => document.querySelector(m)?.classList.contains('is-open'), MENU, 4000);
	};
	// One of the menu's Open items, by a press or, after a key opened the menu (focus on its first enabled item), by keys.
	const pick = async (which, input) => {
		// a real press at the item's centre (Playwright's click waits for an aria-disabled item to be enabled)
		// (once its box holds still for a frame: the menu sprouts open, and a press read from a moving box can land on the
		// item next to it)
		if (input === 'mouse') {
			const it = f.locator(`${MENU} [data-pmw-open="${which}"]`);
			let bb = null;
			for (let n = 0; n < 60; n++) {
				const b = await it.boundingBox();
				if (b && bb && ['x', 'y', 'width', 'height'].every((k) => Math.abs(b[k] - bb[k]) < 0.5)) break;
				bb = b; await f.evaluate(() => new Promise((res) => requestAnimationFrame(() => res())));
			}
			if (!bb) return false;
			await t.page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); return true;
		}
		for (let s = 0; s < 8; s++) {
			if (await f.evaluate((w) => document.activeElement?.getAttribute('data-pmw-open') === w, which)) { await t.page.keyboard.press('Enter'); return true; }
			await t.page.keyboard.press('ArrowDown');
		}
		return false;
	};
	const rowLoc = (r) => f.locator(`[data-frp="${r.id}"]`);
	// the demo script raises notes of its own meanwhile (usage warnings, runs finishing): only a refusal counts against a row
	const refused = (now) => now.toasts.some((m) => /not in this project/.test(m));
	const opensOnly = (now, want, mode, where) => now.opens.length === 1 && now.opens[0].kind === 'editor' && now.opens[0].path === want && (!mode || now.opens[0].mode === mode) && (now.opens[0].where || 'auto') === (where || 'auto');
	// File actions › Open on a row by a right-click: null when it opened the row's own path, else what happened.
	const menuOpen = async (r) => {
		await pane(TAB[r.kind]); await clear();
		if (!await openMenu(rowLoc(r), 'mouse')) return 'the menu did not open';
		await pick('open', 'mouse');
		await until(() => __frp.opens.length || __frp.toasts.some((m) => /not in this project/.test(m)));
		const now = await fx(); await shut();
		return opensOnly(now, r.want, null, 'auto') && !refused(now) ? null : now;
	};
	// A real left click on a Recent row: null when it opened the row's own path as a preview, else what happened.
	const leftClick = async (r) => {
		await pane(TAB[r.kind]); await clear();
		const loc = rowLoc(r); await loc.scrollIntoViewIfNeeded();
		const shown = await loc.evaluate((e) => (e.querySelector('.fm-path')?.textContent || '').trim());
		await loc.click();
		await until(() => __frp.opens.length || __frp.toasts.some((m) => /not in this project/.test(m)));
		const now = await fx();
		return { err: opensOnly(now, r.want, 'preview', 'auto') && !refused(now) ? null : now, shown };
	};

	// FO-105: Recent clicks mark nothing, and leave the tree's and Open editors' marks as they were.
	if (parts.includes('105')) {
		const marks = () => f.evaluate((SEL) => ({
			tree: [...document.querySelectorAll('#panel-files [role="tree"] .fm-row.active-file')].map((e) => e.getAttribute('data-path')),
			editors: [...document.querySelectorAll(`${SEL.editors}.active-file`)].map((e) => e.getAttribute('data-frp')),
			recent: [...document.querySelectorAll(`${SEL.recent}.active-file`)].map((e) => e.getAttribute('data-frp')),
		}), SEL);
		const before = await marks(), clicked = [];
		for (const r of rows.filter((x) => x.kind === 'recent').slice(-3)) { const c = await leftClick(r); clicked.push({ row: r.want, opened: !c.err }); }
		const after = await marks();
		await t.check(`FO-105 ${tag}: after left clicks on three Recent rows no Recent row is marked`, !after.recent.length, JSON.stringify({ clicked, ...after }));
		await t.check(`FO-105 ${tag}: after left clicks on three Recent rows the tree's and Open editors' marks are as they were`, JSON.stringify([after.tree, after.editors]) === JSON.stringify([before.tree, before.editors]), JSON.stringify({ before, after }));
	}

	// FO-103 A: each row names its own full path.
	if (parts.includes('103a')) for (const r of rows)
		await t.check(`FO-103 ${tag}: the ${r.kind} row for ${r.want} names its own full path (data-path)`, r.own === r.want, JSON.stringify({ dataPath: r.own }));

	// FO-101 and FO-103 A, in each look: a left click on every Recent row, and File actions › Open on every row.
	for (const look of looks) {
		if (!parts.includes('101') && !parts.includes('103a')) break;
		await t.app.look(look);
		await f.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))));
		if (parts.includes('101')) for (const r of rows.filter((x) => x.kind === 'recent')) {
			const c = await leftClick(r);
			await t.check(`FO-101 ${tag} ${look}: a left click on the Recent row for ${r.want} opens it${c.shown !== r.want ? ` (shown as ${c.shown})` : ''}`, !c.err, JSON.stringify(c));
		}
		if (parts.includes('103a')) for (const r of rows) {
			const err = await menuOpen(r);
			await t.check(`FO-103 ${tag} ${look}: File actions › Open on the ${r.kind} row for ${r.want} opens it`, !err, JSON.stringify(err));
		}
	}

	// FO-102: a folder in File actions.
	if (parts.includes('102')) {
		await pane('explorer');
		// a folder the tree lists without its files sits in a folder of node_modules: that folder opens by the tree's own key
		const host = await f.evaluate(() => {
			document.querySelectorAll('[data-frp-host]').forEach((e) => e.removeAttribute('data-frp-host'));
			const e = [...document.querySelectorAll('#panel-files [role="tree"] [role="treeitem"][data-kind="folder"][aria-expanded="false"]')]
				.find((x) => x.closest('.fm-node')?.querySelector(':scope > .fm-children [role="treeitem"][data-kind="folder"]:not([aria-expanded])'));
			e?.setAttribute('data-frp-host', ''); return e ? e.getAttribute('data-path') : null;
		});
		if (host) { const hl = f.locator('[data-frp-host]'); await hl.scrollIntoViewIfNeeded(); await hl.focus(); await t.page.keyboard.press('ArrowRight'); await until(() => document.querySelector('[data-frp-host]').getAttribute('aria-expanded') === 'true'); }
		const fold = await f.evaluate(() => {
			document.querySelectorAll('[data-frp-f]').forEach((e) => e.removeAttribute('data-frp-f'));
			const tree = document.querySelector('#panel-files [role="tree"]'), vis = (e) => e.checkVisibility() && e.getBoundingClientRect().width;
			const a = [...tree.querySelectorAll('[role="treeitem"][data-kind="folder"][aria-expanded]')].find(vis);
			const b = [...tree.querySelectorAll('[role="treeitem"][data-kind="folder"]:not([aria-expanded])')].find(vis);
			const c = [...tree.querySelectorAll('[role="treeitem"][data-path]:not([data-kind="folder"])')].find(vis);
			a?.setAttribute('data-frp-f', 'a'); b?.setAttribute('data-frp-f', 'b'); c?.setAttribute('data-frp-f', 'c');
			return { a: a?.getAttribute('data-path'), b: b?.getAttribute('data-path'), c: c?.getAttribute('data-path') };
		});
		await t.check(`FO-102 ${tag}: the tree shows a folder it can expand, a folder listed without its files and a file`, !!(fold.a && fold.b && fold.c), JSON.stringify({ host, ...fold }), { hard: true });
		const A = f.locator('[data-frp-f="a"]'), B = f.locator('[data-frp-f="b"]'), C = f.locator('[data-frp-f="c"]');
		for (const input of ['mouse', 'shift-f10']) {
			const T = `FO-102 ${tag} ${input}`;
			// Open on a folder the tree can expand (folded first, by the tree's own key) expands it and opens no editor
			await pane('explorer');
			if (await A.getAttribute('aria-expanded') === 'true') { await A.scrollIntoViewIfNeeded(); await A.focus(); await t.page.keyboard.press('ArrowLeft'); await until(() => document.querySelector('[data-frp-f="a"]').getAttribute('aria-expanded') === 'false'); }
			await clear();
			let up = await openMenu(A, input);
			if (up) await pick('open', input);
			const grew = await until(() => document.querySelector('[data-frp-f="a"]').getAttribute('aria-expanded') === 'true');
			await until(() => __frp.opens.length, null, 400);
			let now = await fx();
			await t.check(`${T}: File actions › Open on the folder ${fold.a} expands it in the tree and opens no editor`, up && grew && !now.opens.length && !await isOpen(), JSON.stringify({ up, expanded: grew, ...now, menuOpen: await isOpen() }));
			await shut();
			// Open in new panel and Open to the side on it: unavailable, a press says why, opens nothing, the menu stays open
			for (const [which, label] of [['panel', 'Open in new panel'], ['side', 'Open to the side']]) {
				await pane('explorer'); await clear();
				up = await openMenu(A, input);
				const dis = up && await f.evaluate((w) => document.querySelector(`#fileContextMenu [data-pmw-open="${w}"]`)?.getAttribute('aria-disabled'), which);
				const went = up && await pick(which, input);
				const said = await until((p) => __frp.toasts.some((m) => m.startsWith(p + ' is a folder')), fold.a);
				await until(() => __frp.opens.length, null, 400);
				now = await fx();
				await t.check(`${T}: ${label} on the folder ${fold.a} is unavailable, says why, opens nothing and leaves the menu open`, up && went && dis === 'true' && said && !now.opens.length && await isOpen(), JSON.stringify({ up, ariaDisabled: dis, ...now, menuOpen: await isOpen() }));
				await shut();
			}
			// Open on a folder the tree lists without its files says so and opens nothing
			await pane('explorer'); await clear();
			up = await openMenu(B, input);
			if (up) await pick('open', input);
			const told = await until((p) => __frp.toasts.some((m) => m.startsWith(p + ' is a folder')), fold.b);
			await until(() => __frp.opens.length, null, 400);
			now = await fx();
			await t.check(`${T}: File actions › Open on the folder ${fold.b} (listed without its files) says so and opens no editor`, up && told && !now.opens.length, JSON.stringify({ up, ...now }));
			await shut();
			// a file row's menu after a folder's: Open in new panel is there again and opens the file in a new panel
			await pane('explorer'); await clear();
			up = await openMenu(C, input);
			const dis = up && await f.evaluate(() => document.querySelector('#fileContextMenu [data-pmw-open="panel"]')?.getAttribute('aria-disabled'));
			if (up) await pick('panel', input);
			await until(() => __frp.opens.length || __frp.toasts.length);
			now = await fx();
			await t.check(`${T}: after a folder's menu, Open in new panel on the file ${fold.c} is available and opens it in a new panel`, up && dis == null && opensOnly(now, fold.c, null, 'panel'), JSON.stringify({ up, ariaDisabled: dis, ...now }));
			await shut();
		}
	}

	// FO-103 B: with an item's full path text decorated, File actions › Open still acts on the row's own file.
	if (parts.includes('103b')) {
		await f.evaluate(([a, b]) => {
			window.__frpText = [];
			document.querySelectorAll(`${a}, ${b}`).forEach((r) => {
				const el = r.closest('.fm-changeitem, .fm-openitem').querySelector('.fm-cpath');
				window.__frpText.push([el, el.innerHTML]);
				el.textContent = el.textContent.trim() + ' (decorated)';
			});
		}, [SEL.changed, SEL.editors]);
		for (const r of rows.filter((x) => x.kind !== 'recent')) {
			const err = await menuOpen(r);
			await t.check(`FO-103 ${tag}: with its path text decorated, File actions › Open on the ${r.kind} row for ${r.want} still opens it`, !err, JSON.stringify(err));
		}
		await f.evaluate(() => { for (const [el, html] of window.__frpText) el.innerHTML = html; delete window.__frpText; });
	}

	// FO-103 C: a row named only by its demo arg, with a note after the file, is still found.
	if (parts.includes('103c')) {
		const r = rows.filter((x) => x.kind === 'recent').find((x) => !x.want.includes('/')) || rows.find((x) => x.kind === 'recent');
		const name = r.want.split('/').pop();
		await f.evaluate(([id, name]) => {
			const e = document.querySelector(`[data-frp="${id}"]`);
			window.__frpAttr = [e.getAttribute('data-path'), e.getAttribute('data-demo-arg')];
			e.removeAttribute('data-path'); e.setAttribute('data-demo-arg', `cmd.file.open -> ${name} (recently opened)`);
		}, [r.id, name]);
		const err = await menuOpen(r);
		await t.check(`FO-103 ${tag}: a Recent row named only by its demo arg with a note ('-> ${name} (recently opened)') still opens ${r.want}`, !err, JSON.stringify(err));
		await f.evaluate((id) => {
			const e = document.querySelector(`[data-frp="${id}"]`), [p, a] = window.__frpAttr;
			if (p != null) e.setAttribute('data-path', p); if (a != null) e.setAttribute('data-demo-arg', a); delete window.__frpAttr;
		}, r.id);
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`Files rows ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
