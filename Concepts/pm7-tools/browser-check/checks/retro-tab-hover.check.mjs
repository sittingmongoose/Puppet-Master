// QA-RETRO-LIGHT-HOVER (Jared 2026-11-19, "B": hover darker in Retro Light). Retro's hover cursor (25-hover-controls.css,
// the "Cursor" section) turns the label of an unchosen tab under the pointer to the chip's phosphor (--pm-switch-mark) on
// every control it shares that rule with: the title bar's page tabs, Home's panel tabs, the side panel's segment tabs and
// the project button (`:is(.page-tab, .pmw-tab, .pm-segtab-item, #projectMenuBtn).pmh-on`). In Retro Light that phosphor,
// #2F7A3D, is lighter than the unchosen words at rest (a Home tab 3.87:1 hovered against 5.29:1; opus-fo236 read 3.62 vs
// 4.98 on pixels), so hover read as faint, or disabled. Now Retro Light's hovered label is the same green a step deeper
// (--pmc-label): it reads stronger than at rest.
//
// For every control of that rule on screen (each visible Home panel strip's first unchosen tab with a label, the first
// unchosen page tab, the project button; then, with the Files side panel opened from the rail, each visible segment
// strip's first unchosen tab), its label and glyph are read at
// rest, then with a real pointer on it (a window mouse move, never a synthetic :hover; the hover engine's .pmh-on must be
// on): the computed ink against the computed ground (the control's and its ancestors' backgrounds composited until
// opaque), and the same parts on real pixels (a window screenshot; helpers/tab-face-pixels.mjs: the median of the glyph
// pixels both frames agree on against the median of the ground pixels both agree on). Retro Light must hover stronger
// than it rests; any other look read must not hover fainter (within 1 %: a tie).
//
//   --set looks=retro-light,retro-dark   --set w=1280 --set h=900   --set shots=1 (native crops and a full frame)
//   --set sandbox=0|1 (run both surfaces)
//
// Must fail f99487c0f3 (batch 13 before the fix) in Retro Light: hovered labels and glyphs fainter than at rest.
import { setLookBySetting } from '../helpers/settings-look.mjs';
import { decodePng } from '../helpers/activity-cover-pixels.mjs';
import { partMask, partContrast, contrast } from '../helpers/tab-face-pixels.mjs';

const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const PAGE_TAB = '.title-bar nav.page-tabs .page-tab';
const r2 = (v) => Math.round(v * 100) / 100;
// the looks whose hover must read stronger than rest (Jared 2026-11-19, QA-RETRO-LIGHT-HOVER "B"); the others only must not
// read fainter: a hover within 1 % of rest is a tie (Retro Dark's hover is the chip's phosphor, 9.01:1 vs 9.02:1 at rest)
const STRONGER = ['retro-light'], TIE = 0.99;

// in the page: every control of the shared hover rule on screen, each marked data-rth=<key>, with its label and glyph boxes
const TARGETS = (which) => {
	const box = (e) => { if (!e) return null; const cs = getComputedStyle(e), b = e.getBoundingClientRect(); return b.width < 2 || b.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0' ? null : [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
	// a label's box is the box of its text (a Range over its text nodes, never an icon beside it)
	const textBox = (e) => {
		if (!e || !box(e)) return null;
		const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() && !n.parentElement.closest('svg, .pmw-kico, .pm-ico, .pmw-tmark, .pmw-tclose') ? 1 : 2) });
		let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, n;
		while ((n = w.nextNode())) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (b.width < 1) continue; x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); }
		return x1 - x0 < 2 ? null : [x0, y0, x1 - x0, y1 - y0].map((v) => Math.round(v * 10) / 10);
	};
	const kglyphBox = (k) => { if (!k || !box(k)) return null; const r = document.createRange(); r.selectNodeContents(k); const b = r.getBoundingClientRect(); return b.width < 2 ? null : [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
	const glyphOf = (el) => { const k = el.querySelector('.pmw-kglyph'); if (kglyphBox(k)) return { g: k, b: kglyphBox(k) }; const s = [...el.querySelectorAll('svg, i.pm-ico')].find((x) => box(x)); return s ? { g: s, b: box(s) } : null; };
	const labelOf = (el) => el.querySelector('.pmw-tlabel, .pm-segtab-lbl') || el;
	const out = [];
	const add = (key, kind, host, el) => { el.setAttribute('data-rth', key); const g = glyphOf(el); out.push({ key, kind, host, name: labelOf(el).textContent.trim().slice(0, 40), box: box(el), label: textBox(labelOf(el)), glyph: g ? g.b : null, glyphTag: g ? g.g.tagName.toLowerCase() + (g.g.classList.contains('pmw-kglyph') ? '.pmw-kglyph' : '') : null }); };
	// an unchosen control with a label (the side panel's segment tabs show only their icon at narrow widths: a glyph will do)
	const unchosen = (el, glyphOnly) => !el.matches('.active, .selected, [aria-selected="true"], [aria-expanded="true"], [data-active]') && box(el) && (textBox(labelOf(el)) || (glyphOnly && glyphOf(el)));
	if (which === 'main') [...document.querySelectorAll('.pmw-strip')].forEach((s, i) => {
		if (!s.getClientRects().length) return;
		const tab = [...s.querySelectorAll('.pmw-tablist .pmw-tab')].find(unchosen);
		if (tab) add(`pmw${i}`, 'Home panel tab', s.closest('#pm-home-centre') ? '#pm-home-centre' : s.closest('#pmw-overlay') ? '#pmw-overlay' : 'other', tab);
	});
	const pt = [...document.querySelectorAll('.title-bar nav.page-tabs .page-tab')].find(unchosen);
	if (pt && which === 'main') add('page', 'title-bar page tab', '.title-bar', pt);
	if (which === 'seg') [...document.querySelectorAll('.pm-segtab')].forEach((s, i) => {
		if (!box(s)) return;
		const it = [...s.querySelectorAll('.pm-segtab-item')].find((e) => unchosen(e, true));
		if (it) add(`seg${i}`, 'side-panel segment tab', s.getAttribute('aria-label') || s.className, it);
	});
	const pb = document.querySelector('#projectMenuBtn');
	if (pb && unchosen(pb) && which === 'main') add('proj', 'project button', '.title-bar', pb);
	return { targets: out, theme: document.documentElement.getAttribute('data-theme'), nier: document.documentElement.getAttribute('data-o55-nier') };
};

// in the page: one control's computed inks (label, glyph) and its computed ground, and whether the pointer is on it
const INKS = (key) => {
	const el = document.querySelector(`[data-rth="${key}"]`);
	// rgb()/rgba() in 0-255, or color(srgb r g b / a) in 0-1 (what a color-mix() token computes to)
	const rgba = (s) => {
		let m = String(s).match(/^rgba?\(([^)]+)\)/);
		if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
		m = String(s).match(/^color\(srgb ([^)]+)\)/);
		if (m) { const p = m[1].split(/[ /]+/).filter(Boolean).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1]; }
		return null;
	};
	const over = (top, under) => [0, 1, 2].map((k) => top[k] * top[3] + under[k] * (1 - top[3]));
	const layers = [];
	for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } }
	let ground = [255, 255, 255];
	for (let k = layers.length - 1; k >= 0; k--) ground = over(layers[k], ground);
	const ink = (c) => (c && c[3] > 0 ? over(c, ground).map(Math.round) : null);
	const label = el.querySelector('.pmw-tlabel, .pm-segtab-lbl') || el;
	const k = el.querySelector('.pmw-kglyph');
	let glyph = null, glyphFrom = null;
	if (k && k.getClientRects().length && getComputedStyle(k).display !== 'none') { glyph = ink(rgba(getComputedStyle(k).color)); glyphFrom = 'color'; }
	else {
		const svg = [...el.querySelectorAll('svg')].find((g) => g.getClientRects().length);
		if (svg) { const p = svg.querySelector('path, line, circle, rect, polyline') || svg; const cs = getComputedStyle(p); const st = rgba(cs.stroke), fi = rgba(cs.fill); glyph = ink(st && st[3] > 0 ? st : fi); glyphFrom = st && st[3] > 0 ? 'stroke' : 'fill'; }
		else { const i = [...el.querySelectorAll('i.pm-ico')].find((g) => g.getClientRects().length); if (i) { const cs = getComputedStyle(i), bg = rgba(cs.backgroundColor); glyph = ink(bg && bg[3] > 0 ? bg : rgba(cs.color)); glyphFrom = bg && bg[3] > 0 ? 'background' : 'color'; } }
	}
	return { hover: el.matches(':hover'), pmh: el.classList.contains('pmh-on'), label: ink(rgba(getComputedStyle(label).color)), glyph, glyphFrom, ground: ground.map(Math.round), raw: getComputedStyle(label).color, bg: getComputedStyle(el).backgroundColor };
};

async function offset(t, f) {
	if (f === t.page.mainFrame()) return { x: 0, y: 0 };
	const b = await (await f.frameElement()).boundingBox(); return { x: b.x, y: b.y };
}
const shift = (b, o) => (b ? [b[0] + o.x, b[1] + o.y, b[2], b[3]] : null);
const rect = (b, pad = 0) => ({ x: Math.max(0, Math.floor(b[0] - pad)), y: Math.max(0, Math.floor(b[1] - pad)), width: Math.ceil(b[2] + 2 * pad), height: Math.ceil(b[3] + 2 * pad) });

export const tests = {
	async 'Retro tab hover: an unchosen tab\'s label and glyph under the pointer read stronger than at rest in Retro Light, never fainter in Retro Dark'(t) {
		const W = Number(t.args.w || 1280), H = Number(t.args.h || 900);
		await t.viewport(W, H);
		const looks = list(t.args.looks, ['retro-light', 'retro-dark']);
		for (const look of looks) {
			const f = await t.app.open();
			await f.locator(PAGE_TAB).nth(5).click(); await t.page.waitForTimeout(1500);
			await setLookBySetting(t, f, look);
			await f.locator(PAGE_TAB).nth(0).click(); await t.page.waitForTimeout(1600);
			await t.page.mouse.move(W / 2, H - 4); await t.page.waitForTimeout(300);
			const off = await offset(t, f);
			for (const phase of ['main', 'seg']) {
			if (phase === 'seg') {
				// the side panel's segment tabs: open the Files panel from the rail (collapsed at 1280 px)
				await f.locator('#activityBar .icon[data-ab-id="files"]').click(); await t.page.waitForTimeout(900);
				await t.page.mouse.move(W / 2, H - 4); await t.page.waitForTimeout(300);
			}
			const g = await f.evaluate(TARGETS, phase);
			const kinds = new Set(g.targets.map((x) => x.kind));
			t.log(`${look}: controls of the shared hover rule (${phase}) — ${g.targets.map((s) => `${s.key} ${s.kind} (${s.host}) "${s.name}" glyph ${s.glyphTag}`).join(' | ')}`);
			const want = phase === 'main' ? ['Home panel tab', 'title-bar page tab'] : ['side-panel segment tab'];
			if (!(await t.check(`${look}: ${want.join(' and ')} on screen to hover`, g.theme === look && g.nier !== 'on' && want.every((k) => kinds.has(k)), JSON.stringify(g).slice(0, 600)))) continue;
			for (const s of g.targets) {
				const tag = `${look} ${s.key} ${s.kind} "${s.name}"`;
				const parts = { label: shift(s.label, off), glyph: shift(s.glyph, off) };
				const area = shift(s.box, off);
				// rest: the pointer away from every control (the window's lower edge, over a panel body)
				await t.page.mouse.move(W / 2, H - 4); await t.page.waitForTimeout(300);
				await t.until(`${tag}: at rest, not hovered`, (k) => { const e = document.querySelector(`[data-rth="${k}"]`); return !e.matches(':hover') && !e.classList.contains('pmh-on'); }, s.key, { timeout: 2000 });
				const restInk = await f.evaluate(INKS, s.key);
				const restImg = decodePng(await t.page.screenshot());
				if (t.args.shots) await t.crop(`${look}-${s.key}-rest`, rect(area, 6), `${tag} at rest: the unchosen label and glyph in the look's resting ink`);
				// hover: a real pointer on the label (clear of a tab's close cell), or on the glyph of an icon-only tab
				// moved in steps, as a person's pointer arrives (one synthetic move to the spot left the sandbox's frame unhovered)
				const lb = parts.label || parts.glyph, px = lb[0] + Math.min(lb[2] / 2, 12), py = area[1] + area[3] / 2;
				await t.page.mouse.move(px - 18, py, { steps: 4 }); await t.page.mouse.move(px, py, { steps: 6 });
				const on = (k) => { const e = document.querySelector(`[data-rth="${k}"]`); return e.matches(':hover') && e.classList.contains('pmh-on'); };
				if (!(await f.waitForFunction(on, s.key, { timeout: 1000 }).then(() => true, () => false))) { await t.page.mouse.move(px + 1, py + 1, { steps: 2 }); await t.page.mouse.move(px, py); }
				await t.until(`${tag}: the pointer hovers it and the hover engine marks it (.pmh-on)`, on, s.key, { timeout: 2000 });
				// past the hovered glyph's one-shot act (Retro's neon glyphs strike on .pmh-on and act for 396 ms,
				// pm7-retro-phosphor.css): the settled hover, not a frame of the act
				await t.page.waitForTimeout(700);
				const hovInk = await f.evaluate(INKS, s.key);
				const hovImg = decodePng(await t.page.screenshot());
				if (t.args.shots) {
					await t.crop(`${look}-${s.key}-hover`, rect(area, 6), `${tag} hovered: the label and glyph should read stronger than at rest, in Retro's own phosphor`);
					if (s.key === 'pmw0') await t.shot(`${look}-${s.key}-hover-frame`, `${tag} hovered, the whole ${W}x${H} window`);
				}
				const row = { look, key: s.key, kind: s.kind, host: s.host, name: s.name, inkRest: restInk.raw, inkHover: hovInk.raw, pmh: hovInk.pmh };
				for (const part of ['label', 'glyph']) {
					const b = parts[part];
					if (!b) { t.log(`NOTE ${tag}: no visible ${part}`); continue; }
					const cRest = restInk[part] ? r2(contrast(restInk[part], restInk.ground)) : null, cHov = hovInk[part] ? r2(contrast(hovInk[part], hovInk.ground)) : null;
					const m = partMask(hovImg, b, restImg);
					const pRest = m.ok ? partContrast(restImg, m) : { c: 0 }, pHov = m.ok ? partContrast(hovImg, m) : { c: 0 };
					Object.assign(row, { [`${part}ComputedRest`]: cRest, [`${part}ComputedHover`]: cHov, [`${part}InkRest`]: restInk[part] && restInk[part].join(','), [`${part}InkHover`]: hovInk[part] && hovInk[part].join(','), [`${part}PixelRest`]: pRest.c, [`${part}PixelHover`]: pHov.c, [`${part}PixelInk`]: `${pRest.ink} -> ${pHov.ink}`, [`${part}PixelGround`]: `${pRest.ground} -> ${pHov.ground}`, [`${part}GlyphPx`]: m.g.length });
					if (part === 'glyph') row.glyphFrom = hovInk.glyphFrom;
					// Retro Light must hover stronger (Jared's B); every look must not hover fainter (a tie within TIE counts as even)
					const bar = STRONGER.includes(look) ? 'stronger than' : 'at least as strong as';
					const pass = (h, r) => (STRONGER.includes(look) ? h > r : h >= r * TIE);
					await t.check(`${tag}: ${part} has glyph pixels at rest and hovered`, m.ok, `${m.g.length} glyph px, ${m.n.length} ground px`);
					if (cRest != null && cHov != null) await t.check(`${tag}: hovered ${part} (computed) ${bar} at rest (${cHov}:1 vs ${cRest}:1)`, pass(cHov, cRest), `rest ${restInk[part]} on ${restInk.ground}; hover ${hovInk[part]} on ${hovInk.ground}`);
					else await t.check(`${tag}: ${part} has a computed ink at rest and hovered`, false, JSON.stringify({ rest: restInk, hover: hovInk }).slice(0, 300));
					// a neon SVG glyph strikes on hover and runs its one-shot act (pm7-retro-phosphor.css), so its pixels move
					// either way with no change of ink (Retro Dark, VM: a terminal tab's prompt glyph 6.36 -> 5.23:1 on one
					// tab, 6.51 -> 7.15:1 on another, computed 9.02 vs 9.01 on both): in a look that only must not hover
					// fainter, those pixels are logged, and its computed ink decides; Retro Light's must still read stronger
					const svgOnly = part === 'glyph' && s.glyphTag === 'svg' && !STRONGER.includes(look);
					if (m.ok && svgOnly) t.log(`NOTE ${tag}: neon glyph pixels ${pRest.c}:1 at rest, ${pHov.c}:1 hovered (logged, not judged: its hover act moves them)`);
					else if (m.ok) await t.check(`${tag}: hovered ${part} (pixels) ${bar} at rest (${pHov.c}:1 vs ${pRest.c}:1)`, pass(pHov.c, pRest.c), `ink ${pRest.ink} -> ${pHov.ink}, ground ${pRest.ground} -> ${pHov.ground}`);
				}
				t.log('RETRO-HOVER ' + JSON.stringify(row));
			}
			}
			await t.page.mouse.move(W / 2, H - 4);
			await t.app.resetLayout();
		}
	}
};
