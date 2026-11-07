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
// lines. Both surfaces (--set sandbox picks one). Headless, or --record with --set looks=<one> --set screens=c-ready for
// a film of the sweep (the window's size stays, the page is held in a frame; each width is marked).
//   browser-check run Concepts/pm7-tools/browser-check/checks/window-footer-fit.check.mjs --set page=<build>
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// the footer as laid out now: its controls and how far each reaches past the window's visible box
const READ = () => {
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
		w: innerWidth, lay: root.getAttribute('data-o55-layout'), keyParts, room: Math.round(foot.getBoundingClientRect().width * 10) / 10,
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
				nl: new Set(lr.filter((q) => q.width > 0).map((q) => Math.round(q.top))).size, word: !!lab };
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
		return Math.round(w * 10) / 10;
	};
	return { full: one(null), chevron: one('chevron') };
};

async function open(t, f, screen) {
	await f.evaluate((x) => window.O55.ui.open({ fresh: true, screen: x }), screen);
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-foot'), null, { timeout: 15000 }).catch(() => {});
	await f.waitForTimeout(450);
}
const frames = (f, n) => f.evaluate((k) => new Promise((res) => { let i = 0; const s = () => (++i >= k ? res() : requestAnimationFrame(s)); requestAnimationFrame(s); }), n);

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
			/* what the footer draws: its layout, Back's word, every label's lines */
			const sig = (r) => (r.none ? 'none' : JSON.stringify([r.lay, r.ctl.map((c) => [c.name, c.word, c.nl])]));
			const LU = (x) => Math.round(x * 64); /* layout units: Chromium lays out in 1/64 px */
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
				/* Q4, exactly (no tolerance; widths in layout units, lines as drawn): Back's word drawn, no label on two lines; Back's
				   word only while the footer's controls fit on one line with it, and given up only when they don't; a label wraps
				   only when they don't fit even without it; Back's chevron alone is 40 px or more in every layout */
				const need = r.need, bk = r.ctl.find((c) => c.back), wide = r.lay !== 'narrow';
				if (bk && bk.word && wide) for (const c of r.ctl) if (c.nl > 1) fitBad.push({ w, room: r.room, ctl: c.name, nl: c.nl, why: "a label wraps while Back keeps its word" });
				if (need && bk && wide) {
					if (bk.word && LU(need.full) > LU(r.room)) fitBad.push({ w, room: r.room, need, why: 'Back keeps its word though the footer does not fit on one line' });
					if (!bk.word && LU(need.full) <= LU(r.room)) fitBad.push({ w, room: r.room, need, why: 'Back gave up its word though the footer fits on one line' });
				}
				if (bk && !bk.word && bk.back.w < 40 - 1 / 64) fitBad.push({ w, lay: r.lay, back: bk.back.w, why: "Back's chevron alone under 40 px" });
				if (need) for (const c of r.ctl) if (c.nl > 1 && LU(bk && bk.word && wide ? need.full : need.chevron) <= LU(r.room)) fitBad.push({ w, lay: r.lay, room: r.room, need, ctl: c.name, nl: c.nl, why: 'a label wraps though the footer fits on one line' });
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
