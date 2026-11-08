// QA-2 (Jared, 2026-11-08: "the question marks in the circles arent centered on each page"): every onboarding help dot
// (.o55-tipq: a choice's ?, a field label's, a link's, a footer button's, a look tile's, the header Look menu's) has its ?
// centred in its circle, read from painted pixels. For each dot: the glyph's ink box is what changes when the ? alone is
// repainted magenta (its edges at half the ink's peak, between pixel centres), the circle's centre is the intensity
// centroid of what changes when the ring alone is (a ring, round or square, is symmetric about its centre, so its
// anti-aliasing cancels; magenta, not transparent, because a part close to its ground — Basic's 1 px ring stands
// 24 levels from its card — changes too little against transparent to be found). Painted at a device scale of 1
// (--set dpr=2 emulates 2, where Chrome snaps text to whole CSS pixels, not device pixels), in shots of the window
// cut on whole pixels, each state with the layer's content, footer and header laid out 0, 1/8 ... 7/8 px further
// down inside the raster they share (vertical only: a sideways margin overflows the scroller and its scrollbar
// re-lays the column out mid-read; the ?'s sideways snap reads within 0.15 px at one position): a glyph's
// baseline snaps to the pixel grid apart from its circle's
// box, so one position alone reads a ? up to a pixel off, either way, by where it happens to sit; across the eight
// the snapping averages out and what is left is where the ? stands. A read is believed only if it could be this
// dot (ink no larger than the circle, both centres inside it); a dot must read cleanly at six of the eight.
// Tolerance: on the mean of the eight the ink's centre within 0.55 px of the circle's centre on each axis, and at
// every position less than 1.25 px: half a device pixel, the paintable bound at this scale (with the fix the span's
// centre is the button's to 0.01 px in layout, yet the painted ink still reads up to 0.52 px off by where its
// raster snaps to the device grid — Retro's pixel face in its Look menu has exactly two paintable states, -0.52
// and +0.48, a quarter-pixel set-down snapping back to the first), plus the ring centroid's own measured bias
// (a constant dx 0.07 on every Retro menu dot). One position in eight can snap a whole pixel (1.03 px read on a
// centred dot). On b3456fac54 the 19 px dots (a link's, a field label's, a footer button's) read 1.3 to 1.5 px
// high in Basic, Friendly and Glass, and the 22 px choice dots 0.4 to 0.6 px high in Friendly and Glass: the ? was
// centred as a line of its font, where ascent and descent put it, not by its ink (10-window.css trims it to cap height and
// baseline). Ten looks, the screens below (--set screens=a,b or screens=all for every screen), the header Look menu
// opened on the first; 1390x900 by default (--set size=1920x1080); both surfaces (--set sandbox picks one).
//   browser-check run Concepts/pm7-tools/browser-check/checks/help-dot-centre.check.mjs --set page=<build>
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
// one screen per kind of dot: Where (choice cards, the restore link), Look (segments, look tiles, NieR's tile), Begin
// (a tray's choice), Name (field labels), AI (provider rows), Safe, Ready (footer buttons with a ?, field labels)
const SCREENS = ['where', 'look', 'begin', 'name', 'ai', 'safe', 'ready'];
const TOL = 1.25, TOL_MEAN = 0.55, PHASES = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => k / 8);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

const diffAt = (a, b, i) => Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
/* a pixel counts only where the two normal shots agree: behind Glass's translucent pane the wallpaper keeps
   moving and Retro's tube flickers, and that motion otherwise reads as ink whole pixels from the dot */
const stableDiff = (a, b, a2, i) => (a2 && diffAt(a, a2, i) > 8 ? 0 : diffAt(a, b, i));
// the ink box of what differs between a and b inside r (device px): edges at half the peak, interpolated between pixel centres
function inkBox(a, b, r, a2) {
	const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y)), x1 = Math.min(a.width, Math.ceil(r.x + r.w)), y1 = Math.min(a.height, Math.ceil(r.y + r.h));
	const rows = new Array(y1 - y0).fill(0), cols = new Array(x1 - x0).fill(0);
	for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const d = stableDiff(a, b, a2, (y * a.width + x) * 4); if (d > rows[y - y0]) rows[y - y0] = d; if (d > cols[x - x0]) cols[x - x0] = d; }
	const peak = Math.max(0, ...rows);
	if (peak < 40) return null;
	const edge = (p, o) => {
		const h = peak / 2, f = p.findIndex((v) => v >= h), l = p.length - 1 - [...p].reverse().findIndex((v) => v >= h);
		const a0 = f > 0 ? p[f - 1] : 0, b0 = l < p.length - 1 ? p[l + 1] : 0;
		return [o + f - 0.5 + (h - a0) / Math.max(1e-6, p[f] - a0), o + l + 0.5 + (p[l] - h) / Math.max(1e-6, p[l] - b0)];
	};
	const [t, bo] = edge(rows, y0), [l, rr] = edge(cols, x0);
	return { cx: (l + rr) / 2, cy: (t + bo) / 2, w: rr - l, h: bo - t, peak };
}
// the intensity centroid of what differs between a and b inside r (device px, pixel centres at +0.5)
function centroid(a, b, r, a2) {
	const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y)), x1 = Math.min(a.width, Math.ceil(r.x + r.w)), y1 = Math.min(a.height, Math.ceil(r.y + r.h));
	let sx = 0, sy = 0, sw = 0, peak = 0;
	for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const d = stableDiff(a, b, a2, (y * a.width + x) * 4); if (d > peak) peak = d; if (d < 6) continue; sx += d * (x + 0.5); sy += d * (y + 0.5); sw += d; }
	return sw && peak >= 40 ? { cx: sx / sw, cy: sy / sw, peak } : null;
}

// the screen settled: no window opening, no screen entering, nothing finite still playing in the window
const BUSY = () => {
	const root = document.getElementById('pm-o55-onboarding'), win = root && root.querySelector('.o55-win');
	if (!win) return 'no window';
	if (root.classList.contains('o55-opening') || root.classList.contains('o55-hold') || root.hasAttribute('data-o55nw-cold')) return 'window opening';
	if (root.querySelector('.o55-pane > .o55-layer.o55-out, .o55-pane > .o55-layer.o55-entering')) return 'screen entering';
	/* (a row still checking moves when its answer lands: AI's provider rows; the product's own running test,
	   60-ui-core.js, also counts a waiting pill and a running op, either of which re-lays the row out) */
	if (root.querySelector('.o55-pane > .o55-layer [aria-busy="true"], .o55-pane > .o55-layer .o55-pill-wait')) return 'a row is still busy';
	try { if (Object.values(window.O55.S.sess.ops || {}).some((x) => x && x.state === 'running')) return 'an op is still running'; } catch (_) { /* no session yet */ }
	const fin = (a) => { try { return (a.playState === 'running' || a.pending) && Number.isFinite(a.effect.getComputedTiming().endTime); } catch (_) { return false; } };
	return win.getAnimations({ subtree: true }).some(fin) ? 'animating' : '';
};
// every help dot drawn in the window now (in scope), in view inside its scroller and on top at its centre, numbered
const DOTS = (scope) => {
	const root = document.getElementById('pm-o55-onboarding');
	root.querySelectorAll('[data-qa2]').forEach((q) => q.removeAttribute('data-qa2'));
	const qs = [...root.querySelectorAll(`${scope} .o55-tipq`)].filter((q) => {
		if (!q.getClientRects().length || q.closest('.o55-layer.o55-out')) return false;
		const b = q.getBoundingClientRect(), cs = getComputedStyle(q);
		if (b.width < 10 || cs.visibility === 'hidden' || +cs.opacity < 0.99) return false;
		// whole inside every clipping ancestor and the window's viewport
		for (let p = q.parentElement; p && p !== document.body; p = p.parentElement) {
			const ps = getComputedStyle(p);
			if (/(auto|scroll|hidden|clip)/.test(ps.overflowX + ps.overflowY)) { const r = p.getBoundingClientRect(); if (b.top < r.top || b.bottom > r.bottom || b.left < r.left || b.right > r.right) return false; }
		}
		if (!(b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth)) return false;
		const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
		return !!top && (top === q || q.contains(top));
	});
	qs.forEach((q, i) => q.setAttribute('data-qa2', i));
	return qs.map((q, i) => {
		const b = q.getBoundingClientRect(), prev = q.previousElementSibling, par = q.parentElement;
		const kind = q.closest('.o55-lookmenu') ? 'look menu' : (prev && prev.classList[0]) || (par && par.classList[0]) || 'dot';
		return { i, kind, key: q.getAttribute('data-key') || '', x: b.left, y: b.top, w: b.width, h: b.height };
	});
};
/* the part under read is repainted magenta, not made transparent: a part whose own colour stands close to its
   ground (Basic's 1 px ring, 24 levels from its card) changes too little against transparent to be found, where
   against magenta every part changes by a full scale and the diff is the part and nothing else */
const PAINT = (mode) => {
	let st = document.getElementById('qa2-paint');
	if (!st) { st = document.createElement('style'); st.id = 'qa2-paint'; document.head.appendChild(st); }
	st.textContent = mode === 'glyph' ? '[data-qa2] > span { -webkit-text-fill-color: #f0f !important; color: #f0f !important; text-shadow: none !important; }'
		: mode === 'ring' ? '[data-qa2] { border-color: #f0f !important; outline-color: #f0f !important; }' : '';
};
/* one phase: the live layer's scrolled content and its footer are laid out p px further down and right, inside the
   raster they share (the content's own used top margin plus p, the footer's top). Moving the window does not do:
   its layer is only re-placed, the glyph inside keeps the raster it snapped to, and every phase reads the same
   offset (the first runs read -0.37 px eight times, where the span's centre is the button's to 0.01 px). */
const PHASE = (p) => {
	const L = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)');
	if (!L) return;
	const c = L.querySelector('.o55-scroll > .o55-content'), ft = L.querySelector(':scope > .o55-foot');
	/* vertical phases only: a left margin on a full-width content overflows its scroller sideways, and the
	   scrollbar coming and going re-lays the column out mid-read; the ?'s sideways snap reads within 0.15 px
	   at one position in every look measured, where its vertical snap is the whole error */
	if (c) {
		if (c.dataset.qa2m === undefined) c.dataset.qa2m = parseFloat(getComputedStyle(c).marginTop) || 0;
		c.style.marginTop = (+c.dataset.qa2m + p) + 'px';
	}
	if (ft) { ft.style.position = 'relative'; ft.style.top = p + 'px'; }
	/* the header too, for its Look menu's dots (its row is the window grid's first, so this lays the pane out
	   p lower with it: the phases only need each dot at eight fractions of a pixel, not eight named ones) */
	const hd = document.querySelector('#pm-o55-onboarding .o55-head');
	if (hd) hd.style.marginTop = p + 'px';
};

async function frameOffset(t) {
	if (t.root === t.page) return { x: 0, y: 0 };
	return t.page.evaluate(() => { const fr = document.querySelector('iframe'); if (!fr) return { x: 0, y: 0 }; const b = fr.getBoundingClientRect(); return { x: b.left + fr.clientLeft, y: b.top + fr.clientTop }; });
}
async function settle(t, f) {
	const until = Date.now() + 25000;
	let why = 'x';
	while (Date.now() < until && (why = await f.evaluate(BUSY))) await t.page.waitForTimeout(120);
	await t.page.waitForTimeout(250);
	return why;
}
// measure every dot in view at the current state, at each phase
async function measure(t, f, dpr, label, scope = '.o55-win') {
	const off = await frameOffset(t);
	const out = new Map();
	for (const p of PHASES) {
		await f.evaluate(PHASE, p);
		await t.page.waitForTimeout(120);
		const dots = await f.evaluate(DOTS, scope);
		if (!dots.length) break;
		/* the shot is cut to the window's box on whole CSS pixels (a fractional clip origin re-rasterises the page at that
		   offset); dot boxes are taken against its corner */
		const wb = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding > .o55-win').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
		const clip = { x: Math.max(0, Math.floor(off.x + wb.x) - 2), y: Math.max(0, Math.floor(off.y + wb.y) - 2) };
		clip.width = Math.ceil(off.x + wb.x + wb.w) + 2 - clip.x; clip.height = Math.ceil(off.y + wb.y + wb.h) + 2 - clip.y;
		const shot = async (mode) => { await f.evaluate(PAINT, mode); await t.page.waitForTimeout(60); return decodePng(await t.page.screenshot({ clip, animations: 'disabled', caret: 'hide' })); };
		/* A2, a second normal shot, marks the pixels that stood still across the three (see stableDiff) */
		const A = await shot(''), B = await shot('glyph'), C = await shot('ring'), A2 = await shot('');
		await f.evaluate(PAINT, '');
		/* a dot that moved while it was painted three times reads its own motion: such a position is not read */
		const after = new Map((await f.evaluate(DOTS, scope)).map((d) => [d.i, d]));
		const moved = (d) => { const e = after.get(d.i); return !e || Math.abs(e.x - d.x) > 0.01 || Math.abs(e.y - d.y) > 0.01; };
		for (const d of dots) {
			if (moved(d)) continue;
			const r = { x: (off.x + d.x - 2 - clip.x) * dpr, y: (off.y + d.y - 2 - clip.y) * dpr, w: (d.w + 4) * dpr, h: (d.h + 4) * dpr };
			const g = inkBox(A, B, r, A2), ring = centroid(A, C, r, A2);
			/* a read is believed only if it could be this dot: ink no larger than the circle and both centres inside
			   it (a phase whose shots caught a row mid-move, or a neighbour's ink at the region's edge, otherwise
			   reads a centred ? whole pixels off: Glass's Antigravity row read 2.96 px low at every phase) */
			const ccx = r.x + r.w / 2, ccy = r.y + r.h / 2, lim = (Math.max(d.w, d.h) / 2 + 3) * dpr;
			const sane = g && ring && g.w <= (d.w + 2) * dpr && g.h <= (d.h + 2) * dpr
				&& Math.abs(g.cx - ccx) <= lim && Math.abs(g.cy - ccy) <= lim && Math.abs(ring.cx - ccx) <= lim && Math.abs(ring.cy - ccy) <= lim;
			/* a dot is its data-key across phases: what stands before it can change as its row settles (a provider's
			   waiting pill gives way to its button), and keying on that split one dot's reads in two */
			const id = d.key || `${d.kind} ${d.i}`;
			if (!out.has(id)) out.set(id, { id: `${d.kind} ${id}`, w: Math.round(d.w * 10) / 10, reads: [] });
			if (sane) out.get(id).reads.push({ dx: (g.cx - ring.cx) / dpr, dy: (g.cy - ring.cy) / dpr });
		}
	}
	await f.evaluate(PHASE, 0);
	const fails = [];
	for (const o of out.values()) {
		const ok = o.reads;
		if (ok.length < 6) { fails.push(`${o.id}: read cleanly at ${ok.length} of ${PHASES.length} positions (it moved while painted, or its ink could not be found)`); continue; }
		const mx = ok.reduce((a, r) => a + r.dx, 0) / ok.length, my = ok.reduce((a, r) => a + r.dy, 0) / ok.length;
		const worst = Math.max(...ok.map((r) => Math.max(Math.abs(r.dx), Math.abs(r.dy))));
		o.mean = { dx: +mx.toFixed(2), dy: +my.toFixed(2) }; o.worst = +worst.toFixed(2);
		if (worst > TOL || Math.abs(mx) > TOL_MEAN || Math.abs(my) > TOL_MEAN) fails.push(`${o.id} (${o.w} px): ink centre off by dx ${o.mean.dx}, dy ${o.mean.dy} px on the mean, ${o.worst} px at worst`);
	}
	t.log(`${label}: ${[...out.values()].map((o) => `${o.id} ${o.mean ? `${o.mean.dx},${o.mean.dy} (worst ${o.worst})` : '-'}`).join('; ')}`);
	return { n: out.size, fails };
}

async function run(t, mode) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const [W, H] = String(t.args.size || '1390x900').split('x').map(Number);
	const dpr = +(t.args.dpr || 1);
	await t.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dpr });
	await t.emulate({ reducedMotion: 'reduce' });
	let total = 0;
	for (const look of looks) {
		await t.step(`${look} ${mode}`, async () => {
			const f = await t.app.open(t, { sandbox: mode === 'sandbox' });
			await t.app.look(t, look);
			let screens = t.args.screens ? String(t.args.screens).split(',') : SCREENS;
			if (screens[0] === 'all') screens = await f.evaluate(() => Object.keys(window.O55.screens.defs));
			await t.page.mouse.move(1, 1);
			for (const [si, screen] of screens.entries()) {
				await f.evaluate((x) => { if (document.activeElement) document.activeElement.blur(); window.O55.ui.open({ fresh: true, screen: x }); }, screen);
				const why = await settle(t, f);
				if (why) { t.check(`${look} ${screen}: the screen settled`, false, why); continue; }
				await f.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
				const m = await measure(t, f, dpr, `${look} ${screen}`);
				total += m.n;
				t.check(`${look} ${screen}: every ? centred in its circle (${m.n} dots, ${TOL} px each offset, ${TOL_MEAN} px mean)`, !m.fails.length, m.fails.slice(0, 8).join(' | '));
				// the header's Look menu, once per look
				if (si === 0) {
					const opened = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-head [data-o55-do="lookMenu"], #pm-o55-onboarding .o55-head .o55-lookbtn'); if (!b) return false; b.click(); return true; });
					if (opened) {
						await t.page.waitForTimeout(500);
						await settle(t, f);
						const lm = await measure(t, f, dpr, `${look} look menu`, '.o55-lookmenu');
						total += lm.n;
						t.check(`${look} header Look menu: every ? centred in its circle (${lm.n} dots)`, lm.n > 0 && !lm.fails.length, lm.n ? lm.fails.slice(0, 8).join(' | ') : 'the menu showed no ?');
						await t.page.keyboard.press('Escape');
						await t.page.waitForTimeout(300);
					}
				}
			}
		});
	}
	t.check(`${mode}: dots measured`, total > 0, `${total}`);
}

export const tests = {
	'help dots centred (normal page)': on('normal', run),
	'help dots centred (T3 sandbox)': on('sandbox', run)
};
