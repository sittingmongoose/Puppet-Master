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
import { freemem } from 'node:os';
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['glass-dark', 'glass-light'];
const GIB = 1024 ** 3;
const WINDOWS_MEMORY_FLOOR = 4; // The Windows RTX 3090 false fails occurred below about 4 GiB free.
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

// The read-through verdict from the plates (exported for tools/glass-backing-reflow.selftest.mjs). a1/a2: the
// surface as painted twice (its motion and the page's motion behind it do not count); b: the outside text
// transparent; c: the surface's text transparent too (its own glyphs re-rasterise a little whatever is behind
// them); c0: the surface's text transparent at the BASELINE, the page behind still painted. PM7PERF-GLASS-AGENTS-
// REFLOW: the surface's own rows can reflow between a2 and b (the docked Agents timer's plural-to-singular tick
// moved the next row 1,111 px, counted as 0.70% read-through); c0 masks the own glyphs at their baseline position
// too, so a moved own row is masked at both positions. The 0.20% bar and the read-through test are unchanged.
export function backingVerdict({ a1, a2, b, c, c0, width, height }) {
	const mask = motionMask(a1, a2);
	if (c0) { const ownBase = grow(motionMask(a2, c0), width, height, 2); for (let i = 0; i < ownBase.length; i++) if (ownBase[i]) mask[i] = 1; }
	const own = grow(motionMask(b, c), width, height, 2);
	for (let i = 0; i < own.length; i++) if (own[i]) mask[i] = 1;
	const counted = mask.reduce((s, v) => s + (v ? 0 : 1), 0);
	const m = changed(a2, b, mask);
	return { n: m.n, mx: m.mx, share: m.n / Math.max(1, counted), motion: 1 - counted / mask.length };
}

// R135-F5, R136-N2: the pane's own layout signature — its scroll state and the row boxes the plates depend on:
// the boxes carrying the surface's painted non-text content (rows, icons, controls), tracked by their offset
// top/left/height (offset positions ignore transforms, so a spinning icon is not a reflow), rounded to whole
// pixels, only where they intersect the surface's visible clip. A timer leaf's shrink-wrapped text width is not
// part of it: on the real Agents pane 22 live <i data-work-time> flex items change width every second without
// moving a row, and rows scrolled outside the clip paint nothing. When a timer row WRAPS, the row boxes below
// shift and the non-text .wk-lead/.wk-kind icons move to positions neither the baseline plate nor the own-glyph
// mask covers, counting as read-through (the sol-max-15 witness: 0.38%-1.32%).
function bcLayoutSig(s) {
	const e = document.querySelector(s); if (!e) return null;
	const b = e.getBoundingClientRect();
	const top = Math.max(0, b.top), left = Math.max(0, b.left);
	const bottom = Math.min(b.bottom, innerHeight), right = Math.min(b.right, innerWidth);
	const parts = [e.scrollTop, e.scrollHeight, e.clientWidth, e.clientHeight];
	// The row boxes: every ancestor of a non-text element up to the surface. Pure-text subtrees (timer leaves,
	// labels) are masked by the own-glyph plates, and their width jitter moves no painted box.
	const NON_TEXT = 'svg, img, canvas, video, iframe, input, select, textarea, button, hr';
	const boxes = new Set();
	for (const el of e.querySelectorAll(NON_TEXT)) for (let n = el; n && n !== e; n = n.parentElement) boxes.add(n);
	for (const el of e.querySelectorAll('*')) {
		if (!boxes.has(el) || el.offsetParent === null) continue;
		const r = el.getBoundingClientRect();
		if (r.bottom <= top || r.top >= bottom || r.right <= left || r.left >= right) continue;
		parts.push(Math.round(el.offsetTop) + ':' + Math.round(el.offsetLeft) + ':' + Math.round(el.offsetHeight));
	}
	return parts.join('|');
}

// how much of the page's content reads through the surface sel (null when it isn't on screen). R135-F5: the plates
// are acquired with the pane's layout signature; an own-pane reflow during any plate reacquires the whole sequence
// (bounded attempts), then a named could-not-judge result — never a pass, and never the icons' false read-through.
async function readThrough(t, f, sel, { rerenderAgents = false } = {}) {
	const r = await f.evaluate((s) => {
		const e = document.querySelector(s); if (!e) return null;
		const b = e.getBoundingClientRect(), x = Math.max(0, b.left), y = Math.max(0, b.top);
		const w = Math.min(b.right, innerWidth) - x, h = Math.min(b.bottom, innerHeight) - y;
		return w >= 40 && h >= 40 && getComputedStyle(e).visibility !== 'hidden' ? { x: Math.round(x) + 2, y: Math.round(y) + 2, width: Math.round(w) - 4, height: Math.round(h) - 4 } : null;
	}, sel);
	if (!r) return null;
	await f.waitForTimeout(400);
	const ACQUISITIONS = 3;
	for (let attempt = 1; ; attempt++) {
		// R136-N3, R137-F1, R138-H1: sample on both sides of each shot. A wrap can start in the wait
		// between plates and end during a slow capture, leaving two equal post-shot samples around
		// a plate that painted shifted rows. Compare every sample to the first.
		const sigStart = await f.evaluate(bcLayoutSig, sel);
		if (sigStart === null) return null;
		const sigs = [sigStart];
		const sampleLayout = async () => { sigs.push(await f.evaluate(bcLayoutSig, sel)); };
		const capture = async () => {
			await sampleLayout();
			const plate = await shot(t, r);
			await sampleLayout();
			return plate;
		};
		const a1 = await shot(t, r);
		await sampleLayout();
		await f.waitForTimeout(300);
		const a2 = await capture();
		await f.evaluate((s) => {
			const e = document.querySelector(s);
			let oldStyle = e.getAttribute('style');
			const c = getComputedStyle(e);
			// R135-F3: getComputedStyle is live. Snapshot the strings BEFORE the transparent rule is appended:
			// reading them in __bcOutsideOnly while `${s}, ${s} *` is active pinned transparent text on the
			// surface for shot b (every surface's text matched shot c, and selftest=rerender passed vacuously).
			const saved = ['color', '-webkit-text-fill-color', 'text-shadow', 'caret-color'].map((p) => [p, c.getPropertyValue(p)]);
			const st = document.createElement('style');
			st.id = 'bc-through';
			// Match the live subtree so text added between shots still belongs to the surface (T71).
			const transparent = '{ color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; transition: none !important; caret-color: transparent !important; }';
			st.__bcRestore = () => {
				if (oldStyle === undefined) return;
				if (oldStyle === null) e.removeAttribute('style');
				else e.setAttribute('style', oldStyle);
				oldStyle = undefined;
			};
			st.__bcOutsideOnly = () => {
				for (const [property, value] of saved) e.style.setProperty(property, value, 'important');
				st.textContent = `body *:not(:is(${s}, ${s} *)) ${transparent}`;
			};
			st.__bcHideSurface = () => {
				st.__bcRestore();
				st.textContent += ` ${s}, ${s} * ${transparent}`;
			};
			// the baseline own-glyph plate first: only the surface's text transparent, the page behind still painted
			st.textContent = `${s}, ${s} * ${transparent}`;
			document.head.appendChild(st);
		}, sel);
		try {
			await f.waitForTimeout(350);
			const c0 = await capture();
			await f.evaluate(() => document.getElementById('bc-through').__bcOutsideOnly());
			if (rerenderAgents) {
				// Replace text leaves only. Rewriting the list's HTML also rebuilt its animated and painted descendants (T142).
				const replaced = await f.evaluate(() => {
					const labels = [...document.querySelectorAll('#panel-agents [data-work-rail] :is(.sh-hlabel, .wk-copy strong, .wk-copy .wk-sub, .wk-right b)')]
						.filter((n) => n.childElementCount === 0 && n.textContent.trim() && n.checkVisibility({ visibilityProperty: true }));
					for (const label of labels) label.replaceWith(label.cloneNode(true));
					return labels.length;
				});
				if (replaced === 0) throw new Error('Glass backing rerender did not find visible Agents text leaves');
				t.log(`Glass backing rerender: replaced ${replaced} Agents text elements before shot b`);
			}
			await f.waitForTimeout(350);
			const b = await capture();
			// Exclude the surface's own glyphs, grown by 2 px to cover re-rasterisation against another backdrop.
			await f.evaluate(() => document.getElementById('bc-through').__bcHideSurface());
			await f.waitForTimeout(350);
			const c = await capture();
			if (sigs.every((s) => s !== null && s === sigStart)) return { rect: r, ...backingVerdict({ a1, a2, b, c, c0, width: r.width, height: r.height }) };
		} finally {
			await f.evaluate(() => {
				const st = document.getElementById('bc-through');
				st.remove();
				st.__bcRestore();
			});
		}
		if (attempt >= ACQUISITIONS) return { rect: r, reflowed: true, attempts: attempt };
		t.log(`Glass backing ${sel}: own pane reflowed between the baseline and read-through plates (acquisition ${attempt}/${ACQUISITIONS}); reacquiring`);
		await f.waitForTimeout(400);
	}
}

export default async function (t) {
	const local = !t.run.host && t.run.session?.kind !== 'cdp';
	let minFreeGiB = Infinity;
	const sampleMemory = (phase) => {
		if (!local) return;
		const freeGiB = freemem() / GIB;
		minFreeGiB = Math.min(minFreeGiB, freeGiB);
		if (process.platform === 'win32' && freeGiB < WINDOWS_MEMORY_FLOOR) {
			throw new Error(`Glass backing inconclusive ${phase}: Windows has ${freeGiB.toFixed(2)} GiB free (floor ${WINDOWS_MEMORY_FLOOR} GiB). Rerun when memory is available.`);
		}
	};
	sampleMemory('before opening the page');
	t.log(local ? `Glass backing: local host has ${minFreeGiB.toFixed(2)} GiB free before the run`
		: 'Glass backing: free memory on the remote or attached browser host is unavailable');
	// --set lgtier=cpu: Glass's low-power tier (no live blur; the floating tint is heavier there)
	const tierQuery = t.args.lgtier ? `lgtier=${t.args.lgtier}` : '';
	let f = await t.app.open({ query: tierQuery });
	const rows = [], bad = [];
	const measure = async (sel, options) => {
		sampleMemory(`before measuring ${sel}`);
		const result = await readThrough(t, f, sel, options);
		sampleMemory(`after measuring ${sel}`);
		return result;
	};
	const judge = (look, name, m) => {
		if (!m) { bad.push(`${look} ${name}: not on screen`); rows.push(`${look} ${name}: not on screen`); return; }
		if (m.reflowed) {
			const why = `${look} ${name}: could not judge: the surface's own layout reflowed between the baseline and read-through plates on all ${m.attempts} acquisitions (PM7PERF-GLASS-AGENTS-REFLOW, R135-F5)`;
			bad.push(why); rows.push(why); return;
		}
		const pct = (m.share * 100).toFixed(2);
		rows.push(`${look} ${name}: ${pct}% of its pixels show the page through it (max change ${m.mx}; its own text and motion left out: ${(m.motion * 100).toFixed(1)}%) ${m.rect.width}x${m.rect.height}`);
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
		if (name === 'notifications') {
			// The stage can place a toast late, and the inbox can start its own opening animation on a delayed frame.
			await f.waitForFunction(() => {
				const stageMoving = document.querySelector('#rsStage .pmn-toast:is(.pmn-entering, .pmn-leaving, .pmn-flying)');
				const panel = document.querySelector('#pmnPanel[data-open]');
				return !stageMoving && panel && !panel.getAnimations({ subtree: true }).some((a) =>
					(a.pending || a.playState === 'running') && Number.isFinite(a.effect?.getComputedTiming().endTime));
			}, null, { timeout: 5000 });
		}
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
		for (const x of top) judge(look, `${name} (${x.label})`, await measure(`[data-bc-float="${x.id}"]`));
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
				const rerenderAgents = t.args.selftest === 'rerender' && target === 'panel-agents';
				judge(look, `rail ${target.replace('panel-', '')} (${mode})`, await measure('#sidePanelSlot', { rerenderAgents }));
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
	if (local) t.log(`Glass backing: lowest sampled local free memory ${minFreeGiB.toFixed(2)} GiB`);
	rows.forEach((r) => t.log(r));
	await t.check(`no Glass window or floating surface lets the page read through it (${rows.length} surfaces, ${looks.join(', ')}${tierQuery ? ', ' + tierQuery : ''})`, bad.length === 0, bad.slice(0, 12).join('; ') + (bad.length > 12 ? ` (+${bad.length - 12} more)` : ''));
}
