// FO-20: in Glass, a window or floating surface over the page's content must not let that content read through it.
// The DOM can't tell (a sheet's backing may be a baked frost on another element, a translucent token, a live blur), so this
// reads painted pixels: the surface is shot as painted, then again with the text of everything outside it made
// transparent; whatever differs inside the surface is content reading through. A second plain shot first measures the
// surface's own motion, which does not count. Sharp text that reads through changes pixels by far more than the
// threshold; a live blur under its tint mottles them by a few levels at most. The surface's own text is left out (shot
// once more with all text transparent): its glyphs re-rasterise a little differently whatever is behind them.
// Surfaces, in Glass Light and Glass Dark, each opened by a click as a person opens it:
// - every rail panel as the narrow window's overlay (1390 x 900: the rail folds over the centre), and docked (1920);
// - the title bar's menus and panels (theme, project, notifications, search), the chat popped out and one of its sheets;
// - Settings: a setup window (Source Control, Add account) and a dialog (Add a service).
// What each click opens is found, not named: every floating box on screen after it that was not before is measured.
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['glass-dark', 'glass-light'];
const THRESHOLD = 12;       // a channel change above this is the page reading through, even dimmed; a blur's mottle stays under it
const MAX_SHARE = 0.002;    // at most 0.2 % of the surface's pixels may change that much (anti-aliased edges, a caret)

async function shot(t, r) { return decodePng(await t.page.screenshot({ clip: r })); }
function changed(a, b, mask) {
	let n = 0, mx = 0;
	for (let i = 0, p = 0; i < a.data.length; i += 4, p++) {
		if (mask && mask[p]) continue;
		const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
		if (d > mx) mx = d;
		if (d > THRESHOLD) n++;
	}
	return { n, mx, share: n / (a.data.length / 4) };
}
function grow(m, w, h, k) { const o = new Uint8Array(m.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!m[y * w + x]) continue; for (let dy = -k; dy <= k; dy++) for (let dx = -k; dx <= k; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w) o[yy * w + xx] = 1; } } return o; }
function motionMask(a, b) { const m = new Uint8Array(a.data.length / 4); for (let i = 0, p = 0; i < a.data.length; i += 4, p++) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > THRESHOLD / 2) m[p] = 1; return m; }

// T71 (opus-recheck-b7f K-B1, a REAL false stop): the surface's nodes were marked once, so a surface that replaced some of
// them before shot b (the Agents list re-rendering) lost the mark on the new nodes, its own text went transparent with
// the page's, and counted as read-through (11.80% in Glass Light docked agents, on main and on the fix alike; the own-text
// share collapsed from 31-36% to 1.8%). Now a MutationObserver marks every node added inside the surface while the
// measurement runs, and before shot b and shot c every text-bearing node inside the surface is checked for its mark;
// one left unmarked is marked and the shot retaken (at most twice), and the count is reported. --set selftest=rerender
// rebuilds a list inside each rail panel (its markup again, without the marks) 100 ms after the marking, as the Agents
// list's re-render did; the check must still pass, where the base reads the panel's own text as read-through.
const unmarked = (f, sel) => f.evaluate((s) => { const e = document.querySelector(s); if (!e) return 0; let n = 0;
	for (const x of [e, ...e.querySelectorAll('*')]) if (!x.hasAttribute('data-bc-in')) { x.setAttribute('data-bc-in', ''); if ([...x.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) n++; }
	return n; }, sel);
// how much of the page's content reads through the surface sel (null when it isn't on screen)
async function readThrough(t, f, sel) {
	const r = await f.evaluate((s) => {
		const e = document.querySelector(s); if (!e) return null;
		const b = e.getBoundingClientRect(), x = Math.max(0, b.left), y = Math.max(0, b.top);
		const w = Math.min(b.right, innerWidth) - x, h = Math.min(b.bottom, innerHeight) - y;
		return w >= 40 && h >= 40 && getComputedStyle(e).visibility !== 'hidden' ? { x: Math.round(x) + 2, y: Math.round(y) + 2, width: Math.round(w) - 4, height: Math.round(h) - 4 } : null;
	}, sel);
	if (!r) return null;
	await f.waitForTimeout(400);
	const a1 = await shot(t, r); await f.waitForTimeout(300); const a2 = await shot(t, r);
	const mask = motionMask(a1, a2);
	await f.evaluate((s) => {
		// the surface and all it holds are marked one by one: the text of everything else goes transparent
		// the properties set below are inherited: the surface keeps its own, so what it holds keeps theirs
		const e = document.querySelector(s), c = getComputedStyle(e); e.__bcStyle = e.getAttribute('style');
		e.style.setProperty('color', c.color, 'important'); e.style.setProperty('-webkit-text-fill-color', c.webkitTextFillColor, 'important');
		e.style.setProperty('text-shadow', c.textShadow, 'important'); e.style.setProperty('caret-color', c.caretColor, 'important');
		[e, ...e.querySelectorAll('*')].forEach((n) => n.setAttribute('data-bc-in', ''));
		// T71: nodes the surface adds while it is measured are marked as they come
		const mo = window.__bcMO = new MutationObserver((recs) => { for (const r of recs) for (const a of r.addedNodes) if (a.nodeType === 1) [a, ...a.querySelectorAll('*')].forEach((n) => n.setAttribute('data-bc-in', '')); });
		mo.observe(e, { childList: true, subtree: true });
		const st = document.createElement('style'); st.id = 'bc-through';
		st.textContent = 'body *:not([data-bc-in]) { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; caret-color: transparent !important; }';
		document.head.appendChild(st);
	}, sel);
	if (t.args.selftest === 'rerender' && sel === '#sidePanelSlot') await f.evaluate((s) => setTimeout(() => {
		const e = document.querySelector(s); if (!e) return;
		const list = [...e.querySelectorAll('*')].filter((x) => x.children.length >= 3 && x.checkVisibility() && x.textContent.trim().length > 40).pop();
		if (!list) return; window.__bcRerendered = (window.__bcRerendered || 0) + 1;
		list.innerHTML = list.innerHTML.replace(/ data-bc-in=""/g, '');   /* the markup again, as a re-render writes it: no marks */
	}, 100), sel);
	await f.waitForTimeout(350);
	let b = await shot(t, r), remarked = 0;
	for (let k = 0, n; k < 2 && (n = await unmarked(f, sel)) > 0; k++) { remarked += n; await f.waitForTimeout(150); b = await shot(t, r); }
	// the surface's own text: where it is drawn, its re-rasterised glyphs differ a little whatever is behind; those pixels
	// (grown by 2 px) are not counted
	await f.evaluate((s) => { const e = document.querySelector(s); ['color', '-webkit-text-fill-color', 'text-shadow'].forEach((k) => e.style.removeProperty(k)); document.getElementById('bc-through').textContent += ' [data-bc-in] { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; }'; }, sel);
	await f.waitForTimeout(350);
	let c = await shot(t, r);
	for (let k = 0, n; k < 2 && (n = await unmarked(f, sel)) > 0; k++) { remarked += n; await f.waitForTimeout(150); c = await shot(t, r); }
	const own = grow(motionMask(b, c), r.width, r.height, 2);
	for (let i = 0; i < own.length; i++) if (own[i]) mask[i] = 1;
	await f.evaluate((s) => { if (window.__bcMO) { window.__bcMO.disconnect(); window.__bcMO = null; } const st = document.getElementById('bc-through'); if (st) st.remove(); document.querySelectorAll('[data-bc-in]').forEach((n) => n.removeAttribute('data-bc-in')); const e = document.querySelector(s); if (e) { if (e.__bcStyle == null) e.removeAttribute('style'); else e.setAttribute('style', e.__bcStyle); } }, sel);
	const counted = mask.reduce((s, v) => s + (v ? 0 : 1), 0);
	const m = changed(a2, b, mask);
	return { rect: r, n: m.n, mx: m.mx, share: m.n / Math.max(1, counted), motion: 1 - counted / mask.length, remarked };
}

export default async function (t) {
	// --set lgtier=cpu: Glass's low-power tier (no live blur; the floating tint is heavier there)
	const tierQuery = t.args.lgtier ? `lgtier=${t.args.lgtier}` : '';
	let f = await t.app.open({ query: tierQuery });
	const rows = [], bad = [];
	const judge = (look, name, m) => {
		if (!m) { bad.push(`${look} ${name}: not on screen`); rows.push(`${look} ${name}: not on screen`); return; }
		const pct = (m.share * 100).toFixed(2);
		rows.push(`${look} ${name}: ${pct}% of its pixels show the page through it (max change ${m.mx}; its own text and motion left out: ${(m.motion * 100).toFixed(1)}%${m.remarked ? `; ${m.remarked} text nodes the surface replaced during the shots marked again and the shot retaken` : ''}) ${m.rect.width}x${m.rect.height}`);
		if (m.share > MAX_SHARE) bad.push(`${look} ${name}: ${pct}% reads through`);
	};
	const click = async (sel) => {
		const p = await f.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return b.width ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null; }, sel);
		if (!p) return false;
		await t.page.mouse.click(p.x, p.y); await f.waitForTimeout(900); await t.page.mouse.move(2, 2); return true;
	};
	const escape = async () => { await t.page.keyboard.press('Escape'); await f.waitForTimeout(600); };
	// what a click opens, found rather than named: every floating box (fixed or absolute, at least 120 x 40) on screen
	// after it that was not before; each is measured (a surface nobody named is caught too)
	const floating = () => f.evaluate(() => {
		const out = [];
		for (const e of document.querySelectorAll('body *')) {
			const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'absolute') continue;
			const b = e.getBoundingClientRect(); if (b.width < 120 || b.height < 40 || b.right <= 0 || b.bottom <= 0 || b.left >= innerWidth || b.top >= innerHeight) continue;
			// a surface takes the pointer; a layer that doesn't (a chart's drawing, a glow) is content, not a surface
			if (c.visibility === 'hidden' || +c.opacity < 0.5 || c.pointerEvents === 'none' || e.closest('[aria-hidden="true"], [inert], .lg-lenses-local, #lg-lenses, #lg-optics')) continue;
			if (!e.__bcId) e.__bcId = 'f' + Math.random().toString(36).slice(2, 8);
			e.setAttribute('data-bc-float', e.__bcId); out.push(e.__bcId);
		}
		return out;
	});
	const opened = async (look, name, open) => {
		const before = new Set(await floating());
		if ((await open()) === false) { bad.push(`${look} ${name}: could not open`); return; }
		await f.waitForTimeout(900); await t.page.mouse.move(2, 2);
		const now = (await floating()).filter((id) => !before.has(id));
		// the outermost new ones only (a sheet's own inner boxes are part of it)
		// a box over most of the window is a backdrop that dims the page on purpose: the surfaces are the painted boxes in it
		const top = await f.evaluate((ids) => {
			const el = (id) => document.querySelector(`[data-bc-float="${id}"]`);
			const outer = ids.filter((id) => { const e = el(id); return e && !ids.some((o) => o !== id && el(o) && el(o).contains(e)); });
			const painted = (e) => { const c = getComputedStyle(e), m = /rgba?\(([^)]+)\)/.exec(c.backgroundColor), a = m ? (m[1].split(/[ ,/]+/).filter(Boolean)[3] ?? 1) : 1; return +a > 0.02 || c.backgroundImage !== 'none' || (c.backdropFilter && c.backdropFilter !== 'none'); };
			const big = (e) => { const b = e.getBoundingClientRect(); return b.width >= 120 && b.height >= 40; };
			const label = (e) => (e.id ? '#' + e.id : e.tagName.toLowerCase()) + '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.');
			const out = [];
			for (const id of outer) {
				const e = el(id), b = e.getBoundingClientRect();
				if (b.width * b.height < 0.7 * innerWidth * innerHeight) { out.push({ id, label: label(e) }); continue; }
				const found = [];
				(function walk(n) { for (const k of n.children) { if (big(k) && painted(k) && getComputedStyle(k).visibility !== 'hidden') found.push(k); else walk(k); } })(e);
				found.forEach((k) => { if (!k.__bcId) k.__bcId = 'f' + Math.random().toString(36).slice(2, 8); k.setAttribute('data-bc-float', k.__bcId); out.push({ id: k.__bcId, label: label(k) + ' in a backdrop' }); });
			}
			return out;
		}, now);
		if (!top.length) { bad.push(`${look} ${name}: nothing new on screen`); rows.push(`${look} ${name}: nothing new on screen`); return; }
		for (const x of top) judge(look, `${name} (${x.label})`, await readThrough(t, f, `[data-bc-float="${x.id}"]`));
	};
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;   // --set looks=glass-dark: one look per run
	for (const look of looks) {
		if (look !== looks[0]) f = await t.app.open({ query: tierQuery });
		// the rail's panels: as the overlay of a narrow window, then docked
		for (const [w, h, mode] of [[1390, 900, 'overlay'], [1920, 1080, 'docked']]) {
			await t.viewport(w, h);
			await f.evaluate(() => document.getElementById('tab-dashboard').click());
			await t.app.look(look);
			await f.waitForTimeout(1200);
			const targets = await f.evaluate(() => [...document.querySelectorAll('#activityBar .icon[data-target]')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getAttribute('data-target')));
			for (const target of targets) {
				await click(`#activityBar .icon[data-target="${target}"]`);
				await f.waitForTimeout(800);
				const fold = await f.evaluate(() => document.getElementById('sidePanelSlot').getAttribute('data-pm-rail-fold') || 'docked');
				if ((mode === 'overlay') !== (fold === 'overlay')) { rows.push(`${look} rail ${target} (${mode}): the rail is ${fold}`); if (mode === 'overlay') bad.push(`${look} rail ${target}: no overlay at ${w}x${h} (${fold})`); continue; }
				judge(look, `rail ${target.replace('panel-', '')} (${mode})`, await readThrough(t, f, '#sidePanelSlot'));
			}
		}
		await t.viewport(1390, 900);
		// the title bar's menus and panels
		for (const [name, btn] of [['theme menu', '#themeSelect'], ['project menu', '#projectMenuBtn'], ['notifications', '#notifySlot button, #notifySlot [role="button"]']]) {
			await opened(look, name, () => click(btn));
			await escape();
		}
		// the search pop exists while the title bar folds its search into a button (the button, or its own open)
		await opened(look, 'search', async () => { if (!(await click('#tbSearchBtn'))) return f.evaluate(() => { if (!window.PM_TB_SEARCH) return false; PM_TB_SEARCH.open(); }); });
		await escape();
		// the chat: popped out over the page, and one of its sheets
		await opened(look, 'chat popped out', () => f.evaluate(() => { if (!window.PMW || !PMW.chatCol || !PMW.chatCol.popOut) return false; PMW.chatCol.popOut(); }));
		await f.evaluate(() => { try { const ma = document.querySelector('.main-area'); if (ma) ma.removeAttribute('data-pmw-chat-float'); if (window.PMW && PMW.chatCol && PMW.chatCol.dockBack) PMW.chatCol.dockBack(); } catch (e) { /* docked by the next load */ } });
		await opened(look, 'chat sheet', () => f.evaluate(() => { if (!window.PM56_EXT) return false; const b = document.createElement('button'); b.dataset.kind = 'crew'; b.dataset.auto = '0'; PM56_EXT.run('collab-open-configure', b, new Event('click')); const c = PM56_EXT.ctx(); if (c.renderOverlays) c.renderOverlays(); }));
		await escape();
		// Settings: a setup window and a dialog, over Source Control's page
		await f.evaluate(() => document.getElementById('tab-settings').click());
		await f.waitForTimeout(2200);
		await f.evaluate(() => document.querySelector('#pm-settings-root .domain-link[data-domain="source"]').click());
		await f.waitForTimeout(1800);
		await t.app.look(look);   // Settings puts back the saved look; this one is not saved
		await f.waitForTimeout(1200);
		await opened(look, 'setup window', () => click('[data-action="pm51-source-connect"]'));
		await escape();
		await opened(look, 'Settings dialog', () => click('[data-action="pm51-source-add-service"]'));
		await escape();
		await f.evaluate(() => document.getElementById('tab-dashboard').click());
		await f.waitForTimeout(1200);
	}
	await t.viewport(1920, 1080);
	rows.forEach((r) => t.log(r));
	await t.check(`no Glass window or floating surface lets the page read through it (${rows.length} surfaces, ${looks.join(', ')}${tierQuery ? ', ' + tierQuery : ''})`, bad.length === 0, bad.slice(0, 12).join('; ') + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ''));
}
