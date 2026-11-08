// FO88-N2 (opus-recheck-b7d): every control in the onboarding window's footer stays inside the window at every width.
// A footer button with a ? of its own (Ready's Tour and Enter, Welcome's Skip) sits with it in an .o55-opt-foot wrapper,
// which the footer's shrink and wrap rules (10-window.css) did not reach: between 808 and about 950 wide, the wide window
// beside its stage, c-ready's and Ready's footer ran past the window, Take the Guided Tour cut 25-99 px and its ? outside
// it, in every look, on both surfaces (0fcd815fec and 457801b0f6 alike).
// Screens: those whose footer, laid out at 1100 wide in Retro Light (mono capitals, among the widest), needs more than
// 380 px (the footer's room in the wide window at 808 is about 397 px), and c-ready and Where always (Where's Back and
// Continue is the common footer, and under NieR's headers it also carries the key prompts); --set screens= picks some.
// In each of the ten looks, each screen opened fresh at 1280x900, the window then narrowed in 10 px steps to 380
// (--set from=, to=, step=). At each width, once laid out: every footer control (its buttons, their ?, Back) lies inside
// the window's visible box (the window cut by the viewport, 1 px), no label spills out of its button, and no footer
// button's text is drawn smaller than at the widest (the fix may wrap a label, never shrink it). FO-100: and Back keeps a
// usable width: it is drawn at its own width, never squeezed (the footer's other buttons wrap, Back cannot: on 74748ebd92
// its label ran 10-12 px past its outline at 808-950 in every look and NieR's caret was crushed to nothing), at least
// 24 px wide, and its caret (its chevron, or NieR's ::before) is drawn at its own width; and NieR's key prompts, which
// held their row open and squeezed the buttons from 948 to about 1010 (Continue's word 3 px past its outline on
// c4ba49b137), each show whole or not at all. Q4 (Jared, 2026-11-07: "A, do the change to only wrap when it doesn't
// fit"), judged against the footer's own one-line widths, measured here on a hidden copy of the footer laid out at
// max-content in the same layer (NieR's key prompts left out: they give way to everything): Back gives up its word only
// when the footer's controls no longer fit on one line with it, and a label wraps only when they still don't fit without
// it; as the footer narrows, no label returns to fewer lines and Back's word does not come back (the footer itself
// widens where the window's layout changes, at 808 and 560: there the comparison starts again, and the log names each
// such step); and Back's chevron alone is 40 px or more in every layout (NieR's was 27 in the wide window, 32 at phone
// width). Judged exactly: lines as drawn, widths in layout units (1/64 px), no tolerance; and every interval of the
// sweep in which the footer's drawing changes, or across which its room passes one of its one-line widths, is walked
// again at 1 px (Q4-K1, opus-recheck-look8: 30a9756711 kept Back's word while both labels wrapped in a 1 px band, Friendly
// Light 1092, NieR Dark 1086, Glass Light 1039, which 10 px steps and a 1 px tolerance passed). From 1280 down to 380 by
// default. Fails on c4ba49b137: Back's word hidden at a fixed 520 px footer, so Basic's labels went one, two, one, two
// lines. Each screen is read only once the window's and the screen's entrances are over (opus-recheck-look8b K-N2: a
// first width read under Friendly's entrance gave a false "footer widens" and a false 39.8 px Back), and widths are kept
// as laid out, not rounded (K-N1).
// Q4-2 (opus-recheck-look8b): the window is also opened fresh, not resized, at every width where the sweep saw the
// footer's drawing change and a pixel either side, in each look, motion on (and with Reduced Motion where Back's word
// changes): the footer is read at the start of every frame from the first that can have painted it until the window and
// the screen have settled, and every painted frame must show the footer it settles on, none Back's word beside a wrapped
// label; settled, it is judged by the same exact rules and must match what the resized window drew at that width. On
// 534629ba45, Friendly's opening keyframe (scale and a 0.6 degree turn) made fitFoot's first reading 0.1 px wide, so a
// fresh open at 1092 kept Back's word with both labels on two lines in every painted frame, Friendly Light and Dark, both
// surfaces. And c-ready reached by Back (on to Create a new Project, then Back) at either side of that footer's own
// change. --set fresh=0 skips the opens, freshRm=0 their Reduced Motion ones, backRoute=0 the Back route; --set
// freshAt=<w,...> opens only at those widths, no sweep (for a film: with --record --set film=1).
// Both surfaces (--set sandbox picks one). Headless, or --record with --set looks=<one> --set screens=c-ready for a film
// of the sweep (the window's size stays, the page is held in a frame; each width and open is marked).
//   browser-check run Concepts/pm7-tools/browser-check/checks/window-footer-fit.check.mjs --set page=<build>
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// the footer as laid out now: its controls and how far each reaches past the window's visible box
const READ = () => {
	/* (a label's lines as drawn: its fragments grouped by height, so the window's opening rotation can't split a line) */
	const LINES = (rs) => { let n = 0, end = -Infinity; for (const q of rs.filter((x) => x.width > 0).sort((a, b) => a.top - b.top)) { if ((q.top + q.bottom) / 2 > end) { n++; end = q.bottom; } else end = Math.max(end, q.bottom); } return n; };
	const root = document.getElementById('pm-o55-onboarding'), win = root && root.querySelector('.o55-win');
	const layer = root && root.querySelector('.o55-layer:not(.o55-out)'), foot = layer && layer.querySelector('.o55-foot');
	if (!foot || !win) return { none: true };
	const w = win.getBoundingClientRect(), v = [Math.max(w.left, 0), Math.max(w.top, 0), Math.min(w.right, innerWidth), Math.min(w.bottom, innerHeight)];
	const ctl = [...foot.querySelectorAll('button, a[href], [role="button"]')].filter((b) => b.getClientRects().length && b.getBoundingClientRect().width > 0 && getComputedStyle(b).visibility !== 'hidden');
	/* NieR's key prompts (Q7): each shown whole, inside the row's box, or wrapped out of it whole (FO-100) */
	const keys = foot.querySelector('.o55nw-keys'), kr = keys && keys.getClientRects().length ? keys.getBoundingClientRect() : null;
	const keyParts = kr ? [...keys.children].map((k) => k.getBoundingClientRect()).map((q) => {
		const inX = Math.max(0, Math.min(q.right, kr.right) - Math.max(q.left, kr.left)), inY = Math.max(0, Math.min(q.bottom, kr.bottom) - Math.max(q.top, kr.top));
		const seen = (inX * inY) / Math.max(1, q.width * q.height);
		return seen > 0.99 ? 'whole' : seen < 0.01 ? 'out' : 'cut';
	}) : [];
	return {
		w: innerWidth, lay: root.getAttribute('data-o55-layout'), keyParts, room: foot.getBoundingClientRect().width,
		ctl: ctl.map((b) => {
			const r = b.getBoundingClientRect();
			/* (its label's text as laid out, against the button's box: the ? beside a button is a glyph, no label) */
			/* (a label kept for screen readers only, Back's in the narrow window, is not drawn: 1 px, clipped) */
			const lab0 = b.querySelector(':scope > span'), lcs = lab0 && getComputedStyle(lab0);
			const lab = lab0 && !(lab0.getBoundingClientRect().width <= 1 || (lcs.clipPath && lcs.clipPath !== 'none')) ? lab0 : null, rg = lab && document.createRange();
			if (rg) rg.selectNodeContents(lab);
			const lr = rg ? [...rg.getClientRects()] : [];
			const spill = lr.length ? Math.max(0, ...lr.map((q) => Math.max(r.left - q.left, q.right - r.right))) : 0;
			const out = { name: (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24) || '?', past: Math.max(0, v[0] - r.left, r.right - v[2], v[1] - r.top, r.bottom - v[3]), spill: Math.round(spill * 10) / 10, font: parseFloat(getComputedStyle(b).fontSize), lines: Math.round(r.height),
				/* (Q4: the label's lines as drawn, 0 when it is not drawn; and whether it is drawn at all) */
				nl: LINES(lr), word: !!lab };
			/* FO-100: Back as laid out against its own width (laid out once more with flex: none, its style put back in the same
			   task, so nothing is painted or observed in between), and its caret: the chevron, or NieR's ::before */
			if (b.classList.contains('o55-back')) {
				const svg = b.querySelector(':scope > svg'), drawn = svg && getComputedStyle(svg).display !== 'none';
				const bef = () => { const q = getComputedStyle(b, '::before'); return q.content && q.content !== 'none' && q.display !== 'none' ? parseFloat(q.width) || 0 : 0; };
				const caret = () => (drawn ? svg.getBoundingClientRect().width : bef());
				const now = caret(), st = b.getAttribute('style');
				b.style.flex = 'none';
				const own = b.getBoundingClientRect().width, ownCaret = caret();
				if (st === null) b.removeAttribute('style'); else b.setAttribute('style', st);
				out.back = { w: Math.round(r.width * 10) / 10, squeeze: Math.round((own - r.width) * 10) / 10, caret: drawn ? 'chevron' : bef() ? 'nier' : 'none', caretW: Math.round(now * 10) / 10, caretOwn: Math.round(ownCaret * 10) / 10 };
			}
			return out;
		})
	};
};
// the footer's own width when nothing has to shrink: its padding, its controls and the gaps between them (the grow spacer
// excluded)
const NATURAL = () => {
	const layer = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out)'), foot = layer && layer.querySelector('.o55-foot');
	if (!foot) return 0;
	const cs = getComputedStyle(foot), kids = [...foot.children].filter((k) => !k.classList.contains('o55-footgrow') && k.getClientRects().length);
	const gap = parseFloat(cs.columnGap) || 0;
	return Math.round(parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + kids.reduce((a, k) => a + k.getBoundingClientRect().width, 0) + gap * Math.max(0, kids.length - 1));
};

// Q4: the footer's one-line width with Back's word (full) and with its chevron alone (chevron): a copy of the footer,
// hidden, at max-content, in the same layer so the same rules reach it, without NieR's key prompts; gone in the same task
const NEED = () => {
	const layer = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'), foot = layer && layer.querySelector(':scope > .o55-foot');
	if (!foot) return null;
	const one = (fit) => {
		const c = foot.cloneNode(true);
		c.removeAttribute('data-o55-fit'); if (fit) c.setAttribute('data-o55-fit', fit);
		c.classList.remove('o55-st'); c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
		const k = c.querySelector('.o55nw-keys'); if (k) k.remove();
		c.setAttribute('aria-hidden', 'true'); c.inert = true;
		/* (and no size containment: c4ba49b137's footer is an inline-size container, whose max-content ignores its contents) */
		c.style.cssText += ';position:absolute;left:0;top:0;width:max-content;visibility:hidden;pointer-events:none;animation:none;transition:none;container-type:normal;contain:none';
		layer.appendChild(c); const w = c.getBoundingClientRect().width; c.remove();
		return w;
	};
	return { full: one(null), chevron: one('chevron') };
};

// the window's entrance and the screen's are over: no opening class, the screen no longer entering or held, and nothing
// finite still playing on the window or its footer (a sweep's first width was read while Friendly's 680 ms entrance still
// played: a false "footer widens" and a false 39.8 px Back; opus-recheck-look8b K-N2)
const BUSY = () => {
	const root = document.getElementById('pm-o55-onboarding'), win = root && root.querySelector('.o55-win');
	const layer = root && root.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), foot = layer && layer.querySelector(':scope > .o55-foot');
	if (!foot) return 'no footer';
	if (root.classList.contains('o55-opening') || root.classList.contains('o55-hold')) return 'window opening';
	if (layer.classList.contains('o55-entering') || layer.classList.contains('o55-hold')) return 'screen entering';
	const fin = (a) => { try { return a.playState === 'running' && Number.isFinite(a.effect.getComputedTiming().endTime); } catch (_) { return false; } };
	return win.getAnimations({ subtree: false }).some(fin) || foot.getAnimations({ subtree: true }).some(fin) ? 'animating' : '';
};
async function open(t, f, screen) {
	await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), screen);
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot'), null, { timeout: 15000 }).catch(() => {});
	await settle(f);
}
async function settle(f) {
	await f.waitForFunction(`!(${BUSY})()`, null, { timeout: 8000, polling: 'raf' }).catch(() => {});
	await frames(f, 2);
}
const frames = (f, n) => f.evaluate((k) => new Promise((res) => { let i = 0; const s = () => (++i >= k ? res() : requestAnimationFrame(s)); requestAnimationFrame(s); }), n);

// Q4-2: the footer of `screen` as one frame draws it (its layout, Back's word, every label's lines, as READ reads them),
// null until that screen's footer exists, held while it is hidden; read at the start of a frame, it is what the frame
// before painted
const FRAME = (screen) => {
	const LINES = (rs) => { let n = 0, end = -Infinity; for (const q of rs.filter((x) => x.width > 0).sort((a, b) => a.top - b.top)) { if ((q.top + q.bottom) / 2 > end) { n++; end = q.bottom; } else end = Math.max(end, q.bottom); } return n; };
	const root = document.getElementById('pm-o55-onboarding'), win = root && root.querySelector('.o55-win');
	const layer = root && root.querySelector('.o55-pane > .o55-layer:not(.o55-out)'), foot = layer && layer.querySelector(':scope > .o55-foot');
	if (!foot || layer.getAttribute('data-screen') !== screen) return null;
	/* (not drawn: held, hidden, or not yet laid out; the window is not displayed for the frame its opening starts in) */
	const held = root.hidden ? 'window hidden' : root.classList.contains('o55-hold') || layer.classList.contains('o55-hold') ? 'held' : !foot.getClientRects().length || !win.getClientRects().length ? 'not laid out' : getComputedStyle(foot).visibility === 'hidden' ? 'hidden' : '';
	if (held) return { held };
	const ctl = [...foot.querySelectorAll('button, a[href], [role="button"]')].filter((b) => b.getClientRects().length && b.getBoundingClientRect().width > 0 && getComputedStyle(b).visibility !== 'hidden');
	const cw = getComputedStyle(win);
	return { lay: root.getAttribute('data-o55-layout'), fit: foot.getAttribute('data-o55-fit'), moved: cw.transform !== 'none', op: Math.round(parseFloat(cw.opacity) * parseFloat(getComputedStyle(foot).opacity) * 100) / 100,
		ctl: ctl.map((b) => {
			const lab0 = b.querySelector(':scope > span'), lcs = lab0 && getComputedStyle(lab0);
			const lab = lab0 && !(lab0.getBoundingClientRect().width <= 1 || (lcs.clipPath && lcs.clipPath !== 'none')) ? lab0 : null, rg = lab && document.createRange();
			if (rg) rg.selectNodeContents(lab);
			return { name: (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24) || '?', back: b.classList.contains('o55-back'), word: !!lab, nl: rg ? LINES([...rg.getClientRects()]) : 0 };
		}) };
};
// Q4-2: open the window fresh on `screen` (route 'fresh') or go Back to it (route 'back') in this task, and read its footer
// at the start of every frame from the first it can have been painted until the window and the screen have settled
const OPEN_REC = ([screen, route], busy, frame) => new Promise((res) => {
	const out = []; let n = 0, seen = false, quiet = 0; const t0 = performance.now();
	const tick = () => {
		n++;
		const s = frame(screen);
		if (s) { if (seen) out.push(Object.assign({ f: n, t: Math.round(performance.now() - t0) }, s)); seen = true; }
		if (seen && !busy()) { if (++quiet >= 3) return res({ frames: out, ms: Math.round(performance.now() - t0) }); } else quiet = 0;
		if (performance.now() - t0 > 8000) return res({ frames: out, ms: Math.round(performance.now() - t0), timeout: (seen && busy()) || 'footer never seen' });
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
	if (route === 'back') window.O55.ui.back(); else window.O55.ui.open({ fresh: true, screen });
});
/* (the look the window is painted in: NieR Mode paints Basic in ink, html[data-o55-nier]) */
const LOOK = () => { const r = document.getElementById('pm-o55-onboarding'); return `${document.documentElement.hasAttribute('data-o55-nier') ? 'nier' : r.getAttribute('data-family')}-${r.getAttribute('data-mode')}`; };
const record = (f, screen, route) => f.evaluate(`(${OPEN_REC})(${JSON.stringify([screen, route])}, ${BUSY}, ${FRAME})`);

// what the footer draws: its layout, Back's word, every label's lines
const sig = (r) => (r.none ? 'none' : JSON.stringify([r.lay, r.ctl.map((c) => [c.name, c.word, c.nl])]));
const LU = (x) => Math.round(x * 64); /* layout units: Chromium lays out in 1/64 px */
// Q4, exactly, on one settled reading (READ, with NEED as .need): no label wraps while Back's word is drawn; Back keeps
// its word only while the footer's controls fit on one line with it, and gives it up only when they don't; a label wraps
// only when they don't fit even without it; Back's chevron alone is 40 px or more in every layout
function q4(w, r) {
	const out = [], need = r.need, bk = r.ctl.find((c) => c.back), wide = r.lay !== 'narrow';
	if (bk && bk.word && wide) for (const c of r.ctl) if (c.nl > 1) out.push({ w, room: r.room, ctl: c.name, nl: c.nl, why: 'a label wraps while Back keeps its word' });
	if (need && bk && wide) {
		if (bk.word && LU(need.full) > LU(r.room)) out.push({ w, room: r.room, need, why: 'Back keeps its word though the footer does not fit on one line' });
		if (!bk.word && LU(need.full) <= LU(r.room)) out.push({ w, room: r.room, need, why: 'Back gave up its word though the footer fits on one line' });
	}
	if (bk && !bk.word && bk.back.w < 40 - 1 / 64) out.push({ w, lay: r.lay, back: bk.back.w, why: "Back's chevron alone under 40 px" });
	if (need) for (const c of r.ctl) if (c.nl > 1 && LU(bk && bk.word && wide ? need.full : need.chevron) <= LU(r.room)) out.push({ w, lay: r.lay, room: r.room, need, ctl: c.name, nl: c.nl, why: 'a label wraps though the footer fits on one line' });
	return out;
}
// Q4-2: the window closed, set to w x 900, then opened fresh on `screen` with motion as asked; its frames, and the footer
// once settled
async function openAt(t, f, screen, w, motion) {
	await f.evaluate(() => window.O55.ui.close && window.O55.ui.close());
	await f.waitForFunction(() => !window.O55.S.open && document.getElementById('pm-o55-onboarding').hidden, null, { timeout: 6000 }).catch(() => {});
	await t.emulate({ reducedMotion: motion });
	await t.viewport(w, 900); await frames(f, 3);
	await t.mark(`open ${screen} ${w} ${motion}`);
	const rec = await record(f, screen, 'fresh');
	await settle(f);
	const now = await f.evaluate(() => window.O55.S.sess.screen), r = await f.evaluate(READ), look = await f.evaluate(LOOK);
	if (!r.none) r.need = await f.evaluate(NEED);
	return { w, motion, route: 'fresh', rec, r, now, look };
}
// ...and reached by Back: opened fresh on `screen` at w, on to the next screen by its Create a new Project, then Back
async function backAt(t, f, screen, w) {
	await openAt(t, f, screen, w, 'no-preference');
	const went = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-do="createNew"]'); if (b) b.click(); return !!b; });
	await f.waitForFunction((s) => window.O55.S.sess.screen !== s, screen, { timeout: 5000 }).catch(() => {});
	await settle(f);
	const via = await f.evaluate(() => window.O55.S.sess.screen);
	await t.mark(`back into ${screen} ${w} from ${via}`);
	const rec = await record(f, screen, 'back');
	await settle(f);
	const now = await f.evaluate(() => window.O55.S.sess.screen), r = await f.evaluate(READ), look = await f.evaluate(LOOK);
	if (!r.none) r.need = await f.evaluate(NEED);
	return { w, motion: 'no-preference', route: `back from ${via}`, went, rec, r, now, look };
}
// what an open got wrong: a painted frame of its entrance unlike the footer it settles on, or with Back's word beside a
// wrapped label; the settled footer by Q4's rules; and, where the sweep read this width, another footer than the resize
function judgeOpen(look, screen, o, ref) {
	const out = [], vis = o.rec.frames.filter((x) => !x.held), at = { w: o.w, motion: o.motion, route: o.route };
	if (o.now !== screen) return [{ ...at, why: `ended on ${o.now}` }];
	if (o.look !== look) return [{ ...at, why: `opened in ${o.look}` }];
	if (o.r.none) return [{ ...at, why: 'no footer once settled' }];
	if (o.rec.timeout) out.push({ ...at, why: 'the entrance did not settle in 8 s', busy: o.rec.timeout });
	if (!vis.length) out.push({ ...at, why: 'no painted frame read', frames: o.rec.frames.length });
	const want = sig(o.r);
	const wrapped = vis.filter((x) => { const bk = x.ctl.find((c) => c.back); return bk && bk.word && x.lay !== 'narrow' && x.ctl.some((c) => c.nl > 1); });
	if (wrapped.length) out.push({ ...at, why: "painted frames show Back's word beside a wrapped label", frames: wrapped.length, of: vis.length, first: { f: wrapped[0].f, t: wrapped[0].t, fit: wrapped[0].fit, op: wrapped[0].op, lines: wrapped[0].ctl.map((c) => c.nl).join('/') } });
	const other = vis.filter((x) => sig(x) !== want);
	if (other.length) out.push({ ...at, why: 'painted frames of the entrance differ from the footer it settles on', frames: other.length, of: vis.length, first: { f: other[0].f, t: other[0].t, fit: other[0].fit, moved: other[0].moved, drawn: sig(other[0]) }, settled: want });
	for (const x of q4(o.w, o.r)) out.push({ ...at, ...x, settled: true });
	if (ref && !ref.none && sig(ref) !== want) out.push({ ...at, why: 'opened at this width it settles on another footer than the window resized to it', resized: sig(ref), opened: want });
	return out;
}
const firstPainted = (o) => { const x = o.rec.frames.find((y) => !y.held); return x ? { f: x.f, t: x.t, fit: x.fit, moved: x.moved, op: x.op, word: (x.ctl.find((c) => c.back) || {}).word, lines: x.ctl.filter((c) => !c.back).map((c) => c.nl).join('/') } : null; };

// Q4-2: the opens at each [width, motion], judged (judgeOpen), with the first painted footer of each logged; and for
// c-ready, the same reached by Back from the screen after it (opus-recheck-look8b: never reached), at its own change
async function fresh(t, f, tag, look, screen, cases, samples, flips) {
	const bad = [], log = [];
	for (const [w, motion] of cases) {
		const o = await openAt(t, f, screen, w, motion);
		bad.push(...judgeOpen(look, screen, o, motion === 'no-preference' ? samples.get(w) : null));
		log.push([w, motion === 'reduce' ? 'rm' : 'motion', o.rec.frames.length, firstPainted(o), o.r.none ? null : (o.r.ctl.find((c) => c.back) || {}).word]);
	}
	await t.emulate({ reducedMotion: 'no-preference' });
	t.log(`${tag}: Q4-2 opened fresh at ${cases.length} widths (width, motion, frames read, first painted footer, Back's word once settled): ${JSON.stringify(log)}`);
	await t.check(`${tag}: Q4-2 opened fresh at each width where the footer changes and a pixel either side (motion on; Reduced Motion too where Back's word changes): every painted frame shows the footer it settles on, none Back's word beside a wrapped label, and it settles exactly, as the resized window does`,
		cases.length > 0 && bad.length === 0, JSON.stringify({ opens: cases.length, failures: bad.length, first: bad.slice(0, 4) }));
	if (screen !== 'c-ready' || t.args.backRoute === '0') return;
	/* the Back route: where its footer's one-line width falls against the room the sweep read (the same footer as opened
	   fresh, or another: then its own change, found from the rooms read at each width), and a pixel or two either side */
	const flip = (flips || []).find((x) => x.lay === 'wide->wide' && x.gap === 1);
	const w0 = flip ? +flip.at.split('->')[0] : cases.length ? cases[0][0] : 1092;
	const first = await backAt(t, f, screen, w0);
	const nb = first.r.none || !first.r.need ? null : first.r.need.full;
	const rooms = [...samples.entries()].filter(([, r]) => !r.none && r.lay !== 'narrow').sort((p, q) => q[0] - p[0]);
	let ws = [w0];
	if (nb != null && rooms.length) {
		let hi = null, lo = null;
		for (const [w, r] of rooms) { if (LU(r.room) >= LU(nb)) hi = [w, r.room]; else { lo = [w, r.room]; break; } }
		if (hi && lo) {
			const per = (hi[1] - lo[1]) / (hi[0] - lo[0]), cut = hi[0] - lo[0] === 1 ? lo[0] : Math.min(hi[0] - 1, Math.max(lo[0] + 1, lo[0] + Math.ceil((nb - lo[1]) / per)));
			ws = [cut + 2, cut + 1, cut, cut - 1, cut - 2].filter((w) => w <= hi[0] + 1 && w >= lo[0] - 1);
		}
	}
	const res = [first.w === ws[0] ? first : null].filter(Boolean);
	for (const w of ws) if (!res.some((o) => o.w === w)) res.push(await backAt(t, f, screen, w));
	const bbad = res.flatMap((o) => judgeOpen(look, screen, o, null)), words = new Set(res.filter((o) => !o.r.none).map((o) => (o.r.ctl.find((c) => c.back) || {}).word));
	const blog = res.map((o) => [o.w, o.route, o.went, o.rec.frames.length, firstPainted(o), o.r.none ? null : (o.r.ctl.find((c) => c.back) || {}).word, o.r.need && Math.round(o.r.need.full * 64) / 64]);
	t.log(`${tag}: Q4-2 reached by Back (one-line width ${nb}; fresh ${flip && samples.get(w0) && samples.get(w0).need ? samples.get(w0).need.full : '?'}) at ${JSON.stringify(blog)}`);
	await t.check(`${tag}: Q4-2 reached by Back from the screen after it, at either side of its own change: every painted frame shows the footer it settles on, none Back's word beside a wrapped label, and it settles exactly`,
		res.every((o) => o.went) && words.size === 2 && bbad.length === 0, JSON.stringify({ widths: ws, bothSides: words.size === 2, failures: bbad.length, first: bbad.slice(0, 4) }));
}

async function run(t, mode) {
	const from = +t.args.from || 1280, to = +t.args.to || 380, step = +t.args.step || 10;
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	await t.viewport(from, 900);
	let f = await t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	// the screens with wide footers, chosen in Retro Light at the widest size
	let screens = t.args.screens ? String(t.args.screens).split(',') : null;
	if (!screens) {
		await f.evaluate(() => window.O55.ui.applyLook('retro', 'light')); await f.waitForTimeout(800);
		screens = ['c-ready', 'where'];
		for (const s of await f.evaluate(() => Object.keys(window.O55.screens.defs))) {
			await open(t, f, s);
			const now = await f.evaluate(() => window.O55.S.sess.screen), n = await f.evaluate(NATURAL);
			if (now === s && n > 380 && !screens.includes(s)) screens.push(s);
		}
		t.log(`${mode}: screens with wide footers (over 380 px at ${from} in Retro Light): ${screens.join(' ')}`);
	}
	await t.check(`${mode}: screens to judge`, t.args.screens ? screens.length > 0 : screens.length > 1, screens.join(' '));
	for (const look of looks) {
		await t.viewport(from, 900);
		f = await t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
		await t.emulate({ reducedMotion: 'no-preference' });
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), look.split('-'));
		await f.waitForTimeout(800);
		for (const screen of screens) {
			await t.viewport(from, 900);
			await open(t, f, screen);
			const now = await f.evaluate(() => window.O55.S.sess.screen);
			const tag = `${mode} ${look} ${screen}`;
			if (now !== screen) { await t.check(`${tag}: opens as itself`, false, `opened as ${now}`); continue; }
			if (t.args.freshAt) { await fresh(t, f, tag, look, screen, String(t.args.freshAt).split(',').map(Number).map((w) => [w, t.args.freshRm === '1' ? 'reduce' : 'no-preference']), new Map(), null); continue; }
			const base = await f.evaluate(READ);
			const font = Object.fromEntries((base.ctl || []).map((c) => [c.name, c.font]));
			const bad = [], backBad = [], fitBad = [], monoBad = [], widens = [];
			let widths = 0, prev = null, refined = 0;
			/* one width: laid out, then read (and the footer's one-line widths, Q4) */
			const sample = async (w) => {
				await t.viewport(w, 900);
				await t.mark(`${look} ${screen} ${w}`);
				await frames(f, 2);
				const r = await f.evaluate(READ);
				if (!r.none) r.need = await f.evaluate(NEED);
				return r;
			};
			const samples = new Map();
			for (let w = from; w >= to; w -= step) { const r = await sample(w); samples.set(w, r); if (!r.none) widths++; }
			/* Q4-K1 (opus-recheck-look8): every interval of the coarse sweep in which the footer's drawing changes, or across which
			   its room passes one of its one-line widths, is walked again at 1 px, so a band narrower than the step (Back's word
			   kept while both labels wrap, 1 px wide at Friendly Light 1092 on 30a9756711) is read; the points come from the page */
			const coarse = [...samples.keys()];
			for (let i = 1; i < coarse.length; i++) {
				const a = samples.get(coarse[i - 1]), b = samples.get(coarse[i]);
				if (a.none || b.none) continue;
				const crosses = (k) => a.need && b.need && Math.sign(LU(a.need[k]) - LU(a.room)) !== Math.sign(LU(b.need[k]) - LU(b.room));
				if (sig(a) === sig(b) && !crosses('full') && !crosses('chevron')) continue;
				for (let w = coarse[i - 1] - 1; w > coarse[i]; w--) { samples.set(w, await sample(w)); refined++; }
			}
			for (const w of [...samples.keys()].sort((x, y) => y - x)) {
				const r = samples.get(w);
				if (r.none) { bad.push({ w, err: 'no footer' }); continue; }
				if (r.keyParts.includes('cut')) bad.push({ w, lay: r.lay, ctl: 'NieR key prompts', keys: r.keyParts.join(' ') });
				/* Q4, exactly (no tolerance; widths in layout units, lines as drawn): q4() */
				const bk = r.ctl.find((c) => c.back);
				fitBad.push(...q4(w, r));
				/* ...and as the footer narrows nothing goes back: no label to fewer lines, Back's word not back */
				if (prev && LU(r.room) > LU(prev.room)) widens.push({ w, prevW: prev.w, from: prev.room, to: r.room, lay: `${prev.lay}->${r.lay}`,
					unwrapped: r.ctl.filter((c) => prev.nl[c.name] > 0 && c.nl > 0 && c.nl < prev.nl[c.name]).map((c) => `${c.name} ${prev.nl[c.name]}->${c.nl}`) });
				else if (prev && LU(r.room) < LU(prev.room)) {
					for (const c of r.ctl) { const p0 = prev.nl[c.name]; if (p0 > 0 && c.nl > 0 && c.nl < p0) monoBad.push({ w, ctl: c.name, lines: `${p0}->${c.nl}`, room: `${prev.room}->${r.room}` }); }
					if (bk && bk.word && prev.back === false && r.lay === prev.lay) monoBad.push({ w, ctl: 'Back', why: 'its word came back', room: `${prev.room}->${r.room}` });
				}
				prev = { w, room: r.room, lay: r.lay, back: bk ? bk.word : null, nl: Object.fromEntries(r.ctl.map((c) => [c.name, c.nl])) };
				for (const c of r.ctl) {
					const smaller = font[c.name] != null && c.font < font[c.name] - .01;
					if (c.past > 1 || c.spill > 1 || smaller) bad.push({ w, lay: r.lay, ctl: c.name, past: Math.round(c.past), spill: c.spill, font: smaller ? `${c.font} < ${font[c.name]}` : undefined });
					/* FO-100: Back drawn at its own width, at least 24 px, its caret whole */
					const k = c.back;
					if (k && (k.squeeze > 0.5 || k.w < 24 || k.caret === 'none' || k.caretW < k.caretOwn - 0.3)) backBad.push({ at: w, lay: r.lay, ...k });
				}
			}
			/* (where Back gives up its word, read at 1 px: the last width with it and the first without, and the footer's room) */
			const seq = [...samples.keys()].sort((x, y) => y - x).map((w) => [w, samples.get(w)]).filter(([, r]) => !r.none);
			const flips = seq.slice(1).map(([w, r], i) => [seq[i], [w, r]]).filter(([[, a], [, b]]) => { const x = a.ctl.find((c) => c.back), y = b.ctl.find((c) => c.back); return x && y && x.word !== y.word; })
				.map(([[wa, a], [wb, b]]) => ({ at: `${wa}->${wb}`, gap: wa - wb, word: `${a.ctl.find((c) => c.back).word}->${b.ctl.find((c) => c.back).word}`, room: `${a.room}->${b.room}`, need: b.need && b.need.full, lay: `${a.lay}->${b.lay}` }));
			t.log(`${tag}: ${widths} widths at ${step} px, ${refined} more at 1 px where the footer changes; Back's word changes ${JSON.stringify(flips)}`);
			const why = JSON.stringify({ widths, failures: bad.length, first: bad.slice(0, 4), controls: (base.ctl || []).map((c) => c.name) });
			await t.check(`${tag}: footer read at every width ${from}-${to}`, widths === Math.floor((from - to) / step) + 1, why);
			await t.check(`${tag}: every footer control inside the window, its label inside its button, at its own size, ${from}-${to} wide`, bad.length === 0, why);
			if ((base.ctl || []).some((c) => c.back)) await t.check(`${tag}: Back at its own width (never squeezed), 24 px or more, its caret whole, ${from}-${to} wide (FO-100)`, backBad.length === 0,
				JSON.stringify({ widths, failures: backBad.length, first: backBad.slice(0, 4), narrowestBack: backBad.length ? Math.min(...backBad.map((b) => b.w)) : undefined }));
			await t.check(`${tag}: Q4 exactly: no label wraps while Back keeps its word, Back gives it up only when the footer does not fit on one line, a label wraps only when it still doesn't, Back's chevron 40 px or more, ${from}-${to} wide (1 px where it changes)`, fitBad.length === 0,
				JSON.stringify({ widths, refined, failures: fitBad.length, first: fitBad.slice(0, 4) }));
			await t.check(`${tag}: Q4 as the footer narrows no label returns to fewer lines and Back's word does not come back, ${from}-${to} wide (1 px where it changes)`, monoBad.length === 0,
				JSON.stringify({ widths, failures: monoBad.length, first: monoBad.slice(0, 4), footerWidens: widens }));
			/* (the footer may widen as the window narrows only where the window's own layout changes: at 808 the stage leaves
			   its side, at 560 the window's margin drops to 8 px; labels that unwrap there do so because it is wider) */
			const odd = widens.filter((x) => { const [was, now] = x.lay.split('->'); return !(was !== now || (x.prevW > 560 && x.w <= 560)); });
			await t.check(`${tag}: Q4 the footer widens as the window narrows only where the window's layout changes (808, 560)`, odd.length === 0, JSON.stringify({ widens }));
			t.log(`${tag}: the footer widens as the window narrows at ${JSON.stringify(widens)}`);
			if (bad.length) { await t.viewport(bad[0].w, 900); await frames(f, 2); await t.inFrame(f, () => t.crop(`foot-${mode}-${look}-${screen}-${bad[0].w}`, '#pm-o55-onboarding .o55-win', `${tag} at ${bad[0].w}: ${bad[0].ctl} ${bad[0].past} px past the window`)); }
			else t.log(`${tag}: ${why}`);
			/* Q4-2 (opus-recheck-look8b): opened fresh, not resized, at every width where the sweep saw the footer's drawing
			   change and a pixel either side, motion on (and with Reduced Motion where Back's word changes) */
			if (t.args.fresh !== '0') {
				const at = new Set(), flipAt = new Set();
				for (let i = 1; i < seq.length; i++) {
					const [wa, a] = seq[i - 1], [wb, b] = seq[i];
					if (wa - wb !== 1 || sig(a) === sig(b)) continue;
					const near = [wa + 1, wa, wb, wb - 1].filter((w) => w <= from && w >= to), x = a.ctl.find((c) => c.back), y = b.ctl.find((c) => c.back);
					near.forEach((w) => at.add(w));
					if (x && y && x.word !== y.word) near.forEach((w) => flipAt.add(w));
				}
				const cases = [...at].sort((p, q) => q - p).map((w) => [w, 'no-preference']).concat(t.args.freshRm === '0' ? [] : [...flipAt].sort((p, q) => q - p).map((w) => [w, 'reduce']));
				await fresh(t, f, tag, look, screen, cases, samples, flips);
			}
		}
	}
	// what it looks like where it was cut (the wide window at 860 and 810): for review
	if (!t.args.film) for (const [w, look] of [[860, looks[0]], [810, looks[looks.length - 1]]]) {
		await t.viewport(w, 900);
		f = await t.app.open({ sandbox: mode === 'sandbox', onboarding: true, query: 'o55=screen=welcome', settleMs: 1000 });
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), look.split('-')); await f.waitForTimeout(800);
		await open(t, f, 'c-ready');
		if (mode === 'normal') await t.inFrame(f, () => t.crop(`c-ready-foot-${look}-${w}`, '#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot', `${look} c-ready footer at ${w}x900`));
	}
	await t.viewport(1920, 1080);
}

export const tests = {
	'footer fits normal': on('normal', run),
	'footer fits sandbox': on('sandbox', run)
};
