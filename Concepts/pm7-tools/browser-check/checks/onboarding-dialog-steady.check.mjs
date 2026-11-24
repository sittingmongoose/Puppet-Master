// FO-189 / FO-191 (Jared's QA, 2026-11-13, Edge on Windows at about 1694x1290 CSS px): "Going from one page to the next,
// there are some weird things happening to the dialog box animations" and "There are still issues where the dialog box
// starts too high and jumps down." Every frame of a walk through onboarding, from a cold open, is read where the page
// paints it (a requestAnimationFrame sampler put in at document start, so the window's opening is read too), and four
// things are judged:
//   window   the onboarding window never moves between its opening and its closing, and its opening never starts above
//            where it comes to rest;
//   column   on one screen the content column's laid-out top never changes (p76: it is held where the screen opened);
//   title    on one screen the title's laid-out place (offsetLeft/offsetTop in its column, no transforms) never changes,
//            and its painted box never moves more than 12 px between two frames painted 50 ms or less apart (its entrance
//            is 1-3 px a frame). A longer gap is a stall, not a jump: the entrance ran on while nothing was painted. Stalls
//            of 150 ms or more in a page change are logged with their length (pm7-perf's; the first Look after Start
//            paints nothing for 300-550 ms on main);
//   speech   Pip's speech box, while it shows one line on one screen (opacity > 0.05, visibility !== hidden, non-zero
//            painted box, and not fully clipped by clip-path such as Retro's pstBox initial inset(0px 100% 100% 0px),
//            FO214-SOL-CLIPPED-SPEECH), never moves more than 12 px from one frame to the next against Pip's head — judged
//            on both its inline translate (58-rig.js placeBubble) and its painted DOM rect's bottom-left anchor relative to
//            the stage and Pip's head (FO189-PAINTED20; bottom-left is invariant under pstBubble's scale pop around
//            transform-origin: 0 100%, and stage origin cancels shared stage translations such as Retro Light's pstFeedIn).
//            NieR's dialogue box is fixed and is left out. A new line on a new screen may take a new place, once.
// The walk, by real presses held about 90 ms: a cold first open (?o55=fresh, Basic Dark), Start, on Look the mode and
// then the family of the look (two look changes in the middle of onboarding), Continue, Continue, Back, Back, Continue.
// Main 9bfa159274 fails "speech" in every family but NieR: a prop lowered in, or lifted out, swept through the box's
// place, and the box jumped 50-100 px out of its way and back two or three times in the 0.2 s after each screen change,
// and went home 2.5 s later with the same words. The window, column and title held on main too: they guard the first
// triage's reading of the report.
// Sizes: `--set sizes=1694x1290@1.5,1440x1300@1` (the default; @ is the device pixel ratio, from a fresh context);
// looks: `--set looks=` (default all ten at the first size, friendly-light and basic-dark at the others).
// `--set sandbox=0|1` picks the surface (T3's sandbox frame keeps the window's pixel ratio of 1). Headless (a fresh context
// per walk). `--set out=<file.json>` keeps every frame.
import fs from 'node:fs';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const JUMP = 12;

// FO214-SOL-CLIPPED-SPEECH: returns true when a computed CSS clip-path collapses the element's painted area to <= 0.5 px
// (e.g. Retro's initial pstBox keyframe `inset(0px 100% 100% 0px)`). Partially revealed frames (e.g.
// `inset(0px calc(75% - 5px) calc(75% - 5px) 0px)`) return false.
export function clipHidden(clipPath, w, h) {
	const cp = String(clipPath || '').trim();
	if (!cp || cp === 'none') return false;
	const W = w > 0 ? w : 100, H = h > 0 ? h : 100;
	const evalDim = (expr, size) => {
		let s = String(expr || '').trim();
		if (s.startsWith('calc(') && s.endsWith(')')) s = s.slice(5, -1).trim();
		if (!s) return NaN;
		let sum = 0, i = 0, sign = 1, any = false;
		while (i < s.length) {
			while (i < s.length && /\s/.test(s[i])) i++;
			if (i >= s.length) break;
			if (s[i] === '+') { sign = 1; i++; continue; }
			if (s[i] === '-') { sign = -1; i++; continue; }
			const m = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(%|px)?/i.exec(s.slice(i));
			if (!m) return NaN;
			const val = Number(m[1]), unit = (m[2] || '').toLowerCase();
			if (unit === '%') sum += sign * (val / 100) * size;
			else if (unit === 'px' || val === 0) sum += sign * val;
			else return NaN;
			any = true; sign = 1; i += m[0].length;
		}
		return any ? sum : NaN;
	};
	const splitTop = (str) => {
		const out = []; let cur = '', depth = 0;
		for (const ch of str.trim()) {
			if (ch === '(') { depth++; cur += ch; }
			else if (ch === ')') { depth = Math.max(0, depth - 1); cur += ch; }
			else if (/\s/.test(ch) && depth === 0) { if (cur) { out.push(cur); cur = ''; } }
			else cur += ch;
		}
		if (cur) out.push(cur);
		return out;
	};
	if (cp.startsWith('inset(') && cp.endsWith(')')) {
		const inner = cp.slice(6, -1).split(/\bround\b/i)[0].trim();
		const toks = splitTop(inner);
		if (!toks.length || toks.length > 4) return false;
		const [t, r, b, l] = toks.length === 1 ? [toks[0], toks[0], toks[0], toks[0]]
			: toks.length === 2 ? [toks[0], toks[1], toks[0], toks[1]]
			: toks.length === 3 ? [toks[0], toks[1], toks[2], toks[1]]
			: toks;
		const top = evalDim(t, H), right = evalDim(r, W), bottom = evalDim(b, H), left = evalDim(l, W);
		if (![top, right, bottom, left].every(Number.isFinite)) return false;
		return (W - left - right) <= 0.5 || (H - top - bottom) <= 0.5;
	}
	if (cp.startsWith('circle(') && cp.endsWith(')')) {
		const first = splitTop(cp.slice(7, -1))[0];
		const rad = evalDim(first, Math.hypot(W, H) / Math.SQRT2);
		return Number.isFinite(rad) && rad <= 0.5;
	}
	if (cp.startsWith('ellipse(') && cp.endsWith(')')) {
		const toks = splitTop(cp.slice(8, -1));
		const rx = evalDim(toks[0], W), ry = evalDim(toks[1], H);
		return (Number.isFinite(rx) && rx <= 0.5) || (Number.isFinite(ry) && ry <= 0.5);
	}
	return false;
}

function sampler() {
	if (window.__fo191) return;
	const L = window.__fo191 = { f: [], step: '' };
	const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.top * 10) / 10]; };
	const tr = (s) => { const m = /(-?[\d.]+)px (-?[\d.]+)px/.exec(s || ''); return m ? [+m[1], +m[2]] : null; };
	const evalDim = (expr, size) => {
		let s = String(expr || '').trim();
		if (s.startsWith('calc(') && s.endsWith(')')) s = s.slice(5, -1).trim();
		if (!s) return NaN;
		let sum = 0, i = 0, sign = 1, any = false;
		while (i < s.length) {
			while (i < s.length && /\s/.test(s[i])) i++;
			if (i >= s.length) break;
			if (s[i] === '+') { sign = 1; i++; continue; }
			if (s[i] === '-') { sign = -1; i++; continue; }
			const m = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(%|px)?/i.exec(s.slice(i));
			if (!m) return NaN;
			const val = Number(m[1]), unit = (m[2] || '').toLowerCase();
			if (unit === '%') sum += sign * (val / 100) * size;
			else if (unit === 'px' || val === 0) sum += sign * val;
			else return NaN;
			any = true; sign = 1; i += m[0].length;
		}
		return any ? sum : NaN;
	};
	const splitTop = (str) => {
		const out = []; let cur = '', depth = 0;
		for (const ch of str.trim()) {
			if (ch === '(') { depth++; cur += ch; }
			else if (ch === ')') { depth = Math.max(0, depth - 1); cur += ch; }
			else if (/\s/.test(ch) && depth === 0) { if (cur) { out.push(cur); cur = ''; } }
			else cur += ch;
		}
		if (cur) out.push(cur);
		return out;
	};
	const isClipped = (clipPath, w, h) => {
		const cp = String(clipPath || '').trim();
		if (!cp || cp === 'none') return false;
		const W = w > 0 ? w : 100, H = h > 0 ? h : 100;
		if (cp.startsWith('inset(') && cp.endsWith(')')) {
			const inner = cp.slice(6, -1).split(/\bround\b/i)[0].trim();
			const toks = splitTop(inner);
			if (!toks.length || toks.length > 4) return false;
			const [t, r, b, l] = toks.length === 1 ? [toks[0], toks[0], toks[0], toks[0]]
				: toks.length === 2 ? [toks[0], toks[1], toks[0], toks[1]]
				: toks.length === 3 ? [toks[0], toks[1], toks[2], toks[1]]
				: toks;
			const top = evalDim(t, H), right = evalDim(r, W), bottom = evalDim(b, H), left = evalDim(l, W);
			if (![top, right, bottom, left].every(Number.isFinite)) return false;
			return (W - left - right) <= 0.5 || (H - top - bottom) <= 0.5;
		}
		if (cp.startsWith('circle(') && cp.endsWith(')')) {
			const rad = evalDim(splitTop(cp.slice(7, -1))[0], Math.hypot(W, H) / Math.SQRT2);
			return Number.isFinite(rad) && rad <= 0.5;
		}
		if (cp.startsWith('ellipse(') && cp.endsWith(')')) {
			const toks = splitTop(cp.slice(8, -1));
			const rx = evalDim(toks[0], W), ry = evalDim(toks[1], H);
			return (Number.isFinite(rx) && rx <= 0.5) || (Number.isFinite(ry) && ry <= 0.5);
		}
		return false;
	};
	const tick = () => {
		const root = document.getElementById('pm-o55-onboarding');
		if (root && !root.hidden) {
			const w = root.querySelector('.o55-win'), l = root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
			const c = l && l.querySelector('.o55-scroll > .o55-content'), h = l && l.querySelector('.o55-title');
			const sg = root.querySelector('.o55-stage'), st = sg && sg.__pipStage;
			const de = document.documentElement;
			const fr = { t: Math.round(performance.now()), step: L.step, scr: l ? l.dataset.screen : null, fam: root.dataset.family, mode: root.dataset.mode,
				lk: [root.dataset.family, root.dataset.mode, de.getAttribute('data-theme'), de.getAttribute('data-o55-nier'), de.getAttribute('data-o55-nier-parts'), de.getAttribute('data-o55-vt')].join('|'),
				open: root.classList.contains('o55-opening') ? 1 : 0, close: root.classList.contains('o55-closing') ? 1 : 0, held: root.classList.contains('o55-hold') ? 1 : 0,
				win: R(w), col: c ? c.offsetTop : null, tit: R(h), tl: h ? [h.offsetLeft, h.offsetTop] : null };
			if (st && st.bubble && !st.dead && st.famName !== 'nier' && st.H) {
				const b = st.bubble, cs = getComputedStyle(b), at = tr(b.style.translate), hp = st.toScreen(st.H);
				const br = b.getBoundingClientRect();
				const ct = st.content || st.overlay || sg;
				const cr = ct ? ct.getBoundingClientRect() : null;
				const cxf = ct ? getComputedStyle(ct).transform : 'none';
				let stageXf = 0;
				if (cxf && cxf !== 'none') {
					const m = /^matrix\(([^)]+)\)/.exec(cxf);
					if (m) {
						const v = m[1].split(',').map(Number);
						if (Math.abs(v[0] - 1) > 0.01 || Math.abs(v[1]) > 0.01 || Math.abs(v[2]) > 0.01 || Math.abs(v[3] - 1) > 0.01) stageXf = 1;
					} else stageXf = 1;
				}
				fr.say = st.saying || '';
				fr.clip = cs.clipPath || 'none';
				fr.rect = [Math.round(br.left * 10) / 10, Math.round(br.top * 10) / 10, Math.round(br.width * 10) / 10, Math.round(br.height * 10) / 10];
				if (cr) fr.ov = [Math.round(cr.left * 10) / 10, Math.round(cr.top * 10) / 10];
				if (stageXf) fr.stageXf = 1;
				fr.shown = +cs.opacity > 0.05 && cs.visibility !== 'hidden' && br.width > 0.5 && br.height > 0.5 && !isClipped(fr.clip, br.width, br.height) && b.classList.contains('on') && /\S/.test(b.textContent || '') ? 1 : 0;
				fr.off = at && hp ? [Math.round((at[0] - hp[0]) * 10) / 10, Math.round((at[1] - hp[1]) * 10) / 10] : null;
				fr.at = at ? at.map(Math.round) : null; fr.hp = hp ? hp.map(Math.round) : null;
			}
			L.f.push(fr);
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}

const sizes = (t) => String(t.args.sizes || '1694x1290@1.5,1440x1300@1').split(',').map((s, i) => {
	const m = /^(\d+)x(\d+)(?:@([\d.]+))?$/.exec(s.trim()); if (!m) throw new Error(`--set sizes: ${s}`);
	return { w: +m[1], h: +m[2], dpr: +(m[3] || 1), first: i === 0, name: s.trim() };
});
const looksFor = (t, size) => (t.args.looks ? String(t.args.looks).split(',') : size.first ? LOOKS : ['friendly-light', 'basic-dark']);

// a press as a person makes it: the pointer moves there, rests, goes down, holds about 90 ms, comes up
async function press(t, f, sel, what) {
	const loc = f.locator(sel).first();
	await loc.waitFor({ state: 'visible', timeout: 20000 });
	await loc.scrollIntoViewIfNeeded().catch(() => {});
	const b = await loc.boundingBox();
	if (!b) throw new Error(`no box for ${what}`);
	await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
	await t.page.waitForTimeout(120);
	await f.evaluate((s) => { window.__fo191.step = s; }, what);
	await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
}
const cur = (d, arg) => `#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-do="${d}"]${arg ? `[data-arg="${arg}"]` : ''}`;
const quiet = (f) => f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy())
	&& !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});

// the four judgements over one walk's frames; each returns its bad frames, named by step and frame index
export function judge(F) {
	const bad = { window: [], column: [], title: [], speech: [], stalls: [] };
	// window: one resting top between its opening and its closing; an opening never starts above it
	const rest = F.filter((x) => x.win && !x.open && !x.close && !x.held);
	const top0 = rest.length ? rest[0].win[1] : null;
	rest.forEach((x) => { if (Math.abs(x.win[1] - top0) > 0.5) bad.window.push(`#${F.indexOf(x)} ${x.step || 'open'} ${x.scr}: window top ${x.win[1]} (rests at ${top0})`); });
	if (top0 != null) { const first = F.find((x) => x.win && x.open && !x.held); if (first && first.win[1] < top0 - 0.5) bad.window.push(`opening starts at ${first.win[1]}, above its rest ${top0}`); }
	const isShown = (x) => Boolean(x.shown) && !(x.clip && clipHidden(x.clip, x.rect ? x.rect[2] : 100, x.rect ? x.rect[3] : 100));
	// FO189-PAINTED20: painted bottom-left anchor relative to stage origin (ov || win || [0,0]) and Pip's head hp.
	// Bottom-left is invariant under pstBubble's scale pop (transform-origin: 0 100%), and subtracting stage origin and hp
	// preserves Pip's pose/sway and shared stage translations (e.g. Retro Light pstFeedIn) while catching rect-only hops.
	const paintedOff = (x) => {
		if (!x.rect || !x.hp) return null;
		const o = x.ov || x.win || [0, 0];
		return [x.rect[0] - o[0] - x.hp[0], (x.rect[1] + x.rect[3]) - o[1] - x.hp[1]];
	};
	for (let i = 1; i < F.length; i++) {
		/* (a look change lays the screen out again in the new look's type and sizes: the frames across one are not compared) */
		const a = F[i - 1], b = F[i], same = a.scr && a.scr === b.scr && a.lk === b.lk;
		if (same && a.col != null && b.col != null && a.col !== b.col && !b.open && !a.close) bad.column.push(`#${i} ${b.step} ${b.scr}: column top ${a.col} -> ${b.col}`);
		if (same && a.tl && b.tl && (a.tl[0] !== b.tl[0] || a.tl[1] !== b.tl[1])) bad.title.push(`#${i} ${b.step} ${b.scr}: title laid out at ${a.tl} -> ${b.tl}`);
		if (same && a.tit && b.tit && !b.held && !a.held && b.t - a.t <= 50) { const d = Math.hypot(b.tit[0] - a.tit[0], b.tit[1] - a.tit[1]); if (d > JUMP && !b.open && !b.close) bad.title.push(`#${i} ${b.step} ${b.scr}: title moved ${d.toFixed(1)} px in a frame`); }
		if (b.t - a.t >= 150 && b.step) bad.stalls.push(`${b.step} ${a.scr}->${b.scr} ${b.t - a.t} ms`);
		if (same && isShown(a) && isShown(b) && a.say === b.say && a.fam === b.fam) {
			let flagged = false;
			if (a.off && b.off) {
				const dx = b.off[0] - a.off[0], dy = b.off[1] - a.off[1];
				if (Math.abs(dx) > JUMP || Math.abs(dy) > JUMP) {
					bad.speech.push(`#${i} t${b.t} ${b.step} ${b.scr} ${b.fam}-${b.mode}: speech box moved ${dx.toFixed(0)},${dy.toFixed(0)} px against Pip in a frame (box ${a.at} -> ${b.at}, Pip's head ${a.hp} -> ${b.hp}; "${b.say.slice(0, 24)}")`);
					flagged = true;
				}
			}
			if (!flagged && !a.open && !b.open && !a.close && !b.close && !a.held && !b.held && !a.stageXf && !b.stageXf) {
				const pa = paintedOff(a), pb = paintedOff(b);
				if (pa && pb) {
					const pdx = pb[0] - pa[0], pdy = pb[1] - pa[1];
					if (Math.abs(pdx) > JUMP || Math.abs(pdy) > JUMP) {
						bad.speech.push(`#${i} t${b.t} ${b.step} ${b.scr} ${b.fam}-${b.mode}: painted speech box moved ${pdx.toFixed(0)},${pdy.toFixed(0)} px against Pip in a frame (rect ${a.rect.map(Math.round)} -> ${b.rect.map(Math.round)}, Pip's head ${a.hp} -> ${b.hp}; "${b.say.slice(0, 24)}")`);
					}
				}
			}
		}
	}
	return bad;
}

export default async function (t) {
	const keep = [];
	let precedingContext = null;
	for (const size of sizes(t)) {
		for (const look of looksFor(t, size)) {
			const [fam, mode] = look.split('-');
			const label = `${size.name} ${look}`;
			/* (a walk takes about 30 s; one that has not ended in 4 minutes is failed and the next walk starts in a fresh context:
			   a page load on a loaded host that never answered held a whole run for 20 minutes) */
			let guard = null;
			await t.step(label, () => Promise.race([new Promise((_, no) => { guard = setTimeout(() => no(new Error(`${label}: the walk did not end in 240 s`)), 240000); }), (async () => {
				/* A completed walk no longer needs its page: retire its sampler before starting the next. */
				if (precedingContext) await precedingContext.close();
				const opened = await t.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr });
				precedingContext = opened.context;
				await t.context.addInitScript(sampler);
				await t.emulate({ reducedMotion: 'no-preference' });
				const f = await t.app.open({ onboarding: true, query: 'o55=fresh', settleMs: 0 });
				await f.waitForSelector('#pm-o55-onboarding .o55-layer[data-screen="welcome"]', { timeout: 60000 });
				await f.waitForFunction(() => { const s = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(s && s.__pipStage && s.__pipStage.gHead); }, null, { timeout: 60000 });
				await t.page.waitForTimeout(2500);
				await press(t, f, cur('start'), 'start'); await t.page.waitForTimeout(2200);
				await press(t, f, cur('pickMode', mode), 'mode ' + mode); await quiet(f); await t.page.waitForTimeout(1500);
				await press(t, f, cur('pickFamily', fam), 'look ' + fam); await quiet(f); await t.page.waitForTimeout(2500);
				for (const [d, n] of [['next', 'continue 1'], ['next', 'continue 2'], ['back', 'back 1'], ['back', 'back 2'], ['next', 'continue 3']]) {
					await press(t, f, cur(d), n); await quiet(f); await t.page.waitForTimeout(2300);
				}
				const F = await f.evaluate(() => window.__fo191.f);
				const got = await f.evaluate(() => { const r = document.getElementById('pm-o55-onboarding'), th = document.documentElement.getAttribute('data-theme') || ''; return { fam: th.startsWith('nier') || document.documentElement.getAttribute('data-o55-nier') === 'on' ? 'nier' : r.dataset.family, mode: r.dataset.mode, theme: th, dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight }; });
				/* (T3's opaque sandbox frame is drawn at the window's own pixel ratio: a context's deviceScaleFactor does not reach it) */
				const dprOk = f !== t.page.mainFrame() || Math.abs(got.dpr - size.dpr) < 0.01;
				await t.check(`${label}: the walk ran in the look and size asked`, got.fam === fam && got.mode === mode && got.vw === size.w && got.vh === size.h && dprOk, JSON.stringify(got));
				const shown = F.filter((x) => x.shown).length;
				await t.check(`${label}: frames read (${F.length}; speech box shown in ${shown})`, F.length > 600 && (fam === 'nier' || shown > 300), `${F.length} frames, ${shown} with the speech box shown`);
				const bad = judge(F);
				for (const k of ['window', 'column', 'title', 'speech']) {
					if (k === 'speech' && fam === 'nier') continue;
					await t.check(`${label}: ${k} steady`, bad[k].length === 0, `${bad[k].length} frames: ${bad[k].slice(0, 6).join('; ')}`);
				}
				t.log(`${label}: ${F.length} frames; window ${bad.window.length}, column ${bad.column.length}, title ${bad.title.length}, speech ${bad.speech.length}; stalls (no frame painted) ${bad.stalls.join(', ') || 'none'}`);
				if (t.args.out) keep.push({ size: size.name, look, frames: F, bad });
			})()]).finally(() => clearTimeout(guard)));
		}
	}
	if (t.args.out) fs.writeFileSync(String(t.args.out), JSON.stringify(keep));
}
