// Welcome's Start paints the first Look screen at once (FO-206, pm7-perf lane T, 2026-11-14).
//
// Report from another stream (main 9bfa159274, Windows RTX 3090 headless at 1694x1290 @1.5): after the press on Welcome's
// Start no frame is painted for about 295-308 ms while the first Look screen comes in (Alexis under load 450-1000 ms);
// the Look title's 500 ms slide-in is mostly over when painting resumes, so it reads as a cut. Later screen changes keep
// their gaps under 83 ms.
//
// From a cold first open (?o55=fresh), a real press (down, 90 ms, up) on Start, timed in the page: the release (the
// click's timeStamp), every animation frame (requestAnimationFrame), long tasks (PerformanceObserver 'longtask'), the new
// screen's layer appended (held) and its hold removed (the entrance starts: 60-ui-core.js transition, O55.motion.release),
// and the first animation frame after that (the new screen's first frame). Judged for Start:
//   first    the new screen's first frame within --set first=100 ms of the release;
//   tasks    no long task over --set task=50 ms from the release to the end of the entrance (its first frame + 600 ms: the
//            title's slide-in is 500 ms);
//   frames   no gap between animation frames over --set gap=50 ms in that span: a cold browser's GPU compiling the
//            new screen's programs draws no frame, on Alexis 425-513 ms right after the first one, and no task shows it;
//   fonts    no font face is loaded for the first time by Start: the five tiles carry the five looks, and each face that
//            arrived laid the whole page out again (4,034 objects, "Fonts changed", in the frame after the press).
// Welcome idle (60-ui-core.js predraw: the Look screen drawn invisibly, one or two elements a slice, so a cold browser's
// GPU compiles its programs before Start): no frame over --set pdgap=80 ms while it draws (every gap over 34 ms is
// logged: a single shape can need two programs, the lead's ruling C keeps those 50-75 ms stalls), the whole pre-draw
// within --set pdms=4000 ms (on a quiet PC), and once done nothing left (no host, marked element or listener); Start
// pressed while it runs: the Look screen comes in and it ends, leaving nothing; low-resource mode: it draws nothing once
// on. K-AA (the lead's ruling (a)), with and without Reduced Motion: the pane before and after the pre-draw is the same to
// the pixel; while it runs, Chrome rasters the page with MSAA (the pre-drawn SVG paths make it switch), so only the
// anti-aliased edges of rounded controls may differ: within 2.5 px of a curved outline, at most 40 levels, at most 120 pixels
// a control (none inside a shape, on a straight edge, away from the controls); --set aamutant=1 paints one pixel inside Get
// Started while it runs (the rows' red test); --set only=pixels runs these rows alone.
// Logged: when the new screen's title was first presented (Element Timing: the check gives the title an elementtiming
// attribute as its layer is appended; its renderTime follows the title's own staggered fade-in, so it is not the
// screen's first frame);
// and the longest gap between animation frames from the release to the new screen's first frame, and the same
// numbers for one later change (Look's Continue) and for Start again in the same browser (a second open: the GPU's shader
// cache warm), neither judged. Then, under Reduced Motion (unchanged by FO-206):
// Start shows the new screen in the click's own task (no hold, no entrance).
// Both surfaces (--set sandbox=0 and 1). About 40 s a surface.
import fs from 'node:fs';
import zlib from 'node:zlib';

// A screenshot's pixels (Playwright's PNGs: 8-bit RGB or RGBA, not interlaced), with nothing but zlib.
function png(buf) {
	let o = 8, w = 0, h = 0, ct = 0; const idat = [];
	while (o < buf.length) {
		const len = buf.readUInt32BE(o), type = buf.toString('latin1', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
		if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); if (d[8] !== 8 || d[12] !== 0) throw new Error('png: 8-bit, not interlaced only'); ct = d[9]; }
		else if (type === 'IDAT') idat.push(d); else if (type === 'IEND') break;
		o += 12 + len;
	}
	const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (!bpp) throw new Error('png: RGB or RGBA only');
	const raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, out = Buffer.alloc(w * h * 3), cur = Buffer.alloc(stride), prev = Buffer.alloc(stride);
	for (let y = 0, i = 0; y < h; y++) {
		const f = raw[i++];
		for (let x = 0; x < stride; x++, i++) {
			const r = raw[i], a = x >= bpp ? cur[x - bpp] : 0, u = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
			let v = r;
			if (f === 1) v = r + a; else if (f === 2) v = r + u; else if (f === 3) v = r + ((a + u) >> 1);
			else if (f === 4) { const pp = a + u - c, pa = Math.abs(pp - a), pb = Math.abs(pp - u), pc = Math.abs(pp - c); v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? u : c); }
			cur[x] = v & 255;
		}
		for (let x = 0; x < w; x++) { out[(y * w + x) * 3] = cur[x * bpp]; out[(y * w + x) * 3 + 1] = cur[x * bpp + 1]; out[(y * w + x) * 3 + 2] = cur[x * bpp + 2]; }
		cur.copy(prev);
	}
	return { w, h, px: out };
}
// FO-206 K-AA (the lead's ruling (a)): while the Look screen's pre-draw runs, Chrome rasters the page with MSAA (the pre-drawn
// SVG paths make it switch), and the anti-aliased edges of rounded shapes come out a little different. Allowed: a pixel that
// differs by at most AA_MAX levels, in the anti-aliased band of one of the pane's rounded controls (within AA_BAND pixels of
// its rounded outline, where that outline curves: a corner, or anywhere on a circle), at most AA_PER pixels a control.
// Anything else fails: inside a shape, on a straight edge, away from every control, or over AA_MAX levels.
const AA_MAX = 40, AA_PER = 120, AA_BAND = 2.5;
// a pixel centre against a box's rounded outline: its signed distance (negative inside) and whether the outline curves there
function outline(r, x, y) {
	const hw = r.w / 2, hh = r.h / 2, rad = Math.min(r.r, hw, hh), qx = Math.abs(x + 0.5 - (r.x + hw)) - (hw - rad), qy = Math.abs(y + 0.5 - (r.y + hh)) - (hh - rad);
	const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rad;
	/* (the curve's ends count to AA_BAND past the point where it meets a straight edge: the anti-aliasing there is the curve's) */
	return { sd, curved: rad > 0 && qx > -AA_BAND && qy > -AA_BAND };
}
function judgeAA(beforeBuf, duringBuf, boxes) {
	const A = png(beforeBuf), B = png(duringBuf);
	if (A.w !== B.w || A.h !== B.h) return { ok: false, why: `sizes ${A.w}x${A.h} and ${B.w}x${B.h}` };
	const per = new Map(), bad = { over: 0, inside: 0, straight: 0, outside: 0 }; let n = 0, worst = 0; const where = [];
	for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
		const i = (y * A.w + x) * 3, d = Math.max(Math.abs(A.px[i] - B.px[i]), Math.abs(A.px[i + 1] - B.px[i + 1]), Math.abs(A.px[i + 2] - B.px[i + 2]));
		if (!d) continue;
		n++; worst = Math.max(worst, d);
		let why = d > AA_MAX ? 'over' : null, hit = null;
		if (!why) {
			const near = boxes.map((r) => ({ r, o: outline(r, x, y) })).filter((c) => Math.abs(c.o.sd) <= AA_BAND).sort((p, q) => Math.abs(p.o.sd) - Math.abs(q.o.sd));
			const curved = near.find((c) => c.o.curved);
			if (curved) hit = curved.r;
			else if (near.length) why = 'straight';
			else why = boxes.some((r) => outline(r, x, y).sd < -AA_BAND) ? 'inside' : 'outside';
		}
		if (why) { bad[why]++; if (where.length < 8) where.push([x, y, d, why]); continue; }
		per.set(hit.name, (per.get(hit.name) || 0) + 1);
	}
	const crowded = [...per.entries()].filter(([, c]) => c > AA_PER);
	const ok = !bad.over && !bad.inside && !bad.straight && !bad.outside && !crowded.length;
	return { ok, n, worst, bad, perControl: Object.fromEntries(per), crowded, where };
}
// the pane's rounded controls, in the screenshot's pixels
const ROUNDED = () => {
	const pane = document.querySelector('#pm-o55-onboarding .o55-pane'), pr = pane.getBoundingClientRect(), k = window.devicePixelRatio || 1, out = [];
	pane.querySelectorAll('button, a, input, [role="radio"], .o55-card, .o55-tile, .o55-pill, .o55-tipq, .o55-banner, .o55-segmented').forEach((el, i) => {
		if (el.closest('.o55-prewarm')) return;
		const cs = getComputedStyle(el), r = el.getBoundingClientRect();
		if (!r.width || !r.height || cs.visibility === 'hidden' || parseFloat(cs.borderTopLeftRadius) <= 0) return;
		const rs = cs.borderTopLeftRadius, rad = /%$/.test(rs) ? Math.min(r.width, r.height) * parseFloat(rs) / 100 : parseFloat(rs);
		out.push({ name: (el.className && String(el.className).split(' ')[0]) + '#' + i + (el.textContent ? ':' + el.textContent.trim().slice(0, 16) : ''), x: (r.left - pr.left) * k, y: (r.top - pr.top) * k, w: r.width * k, h: r.height * k, r: rad * k });
	});
	return out;
};

const ARM = () => {
	if (window.__pos) return;
	const P = window.__pos = { on: false, n: 0, ts: [], lt: [], click: 0, build: 0, show: 0, frame: 0, paint: 0, screen: null, shownInClick: null };
	// the font faces loaded so far (each FontFace's own status: document.fonts' status and ready would flush style and layout)
	P.loadedFaces = () => { const o = []; document.fonts.forEach((x) => { if (x.status === 'loaded') o.push([x.family, x.weight, x.style, x.unicodeRange].join('|')); }); return o; };
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.identifier === 'pos-title-' + P.n && !P.paint) P.paint = e.renderTime || e.loadTime; }).observe({ type: 'element', buffered: true }); } catch (_) { /* none */ }
	const tick = (now) => { if (P.on) P.ts.push(now); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
	try { new PerformanceObserver((l) => { for (const e of l.getEntries()) P.lt.push([e.startTime, e.duration]); }).observe({ entryTypes: ['longtask'] }); } catch (_) { /* none */ }
	document.addEventListener('click', (e) => { if (P.on && !P.click && e.target && e.target.closest && e.target.closest('#pm-o55-onboarding')) P.click = e.timeStamp; }, true);
	const pane = document.querySelector('#pm-o55-onboarding .o55-pane');
	new MutationObserver((list) => {
		if (!P.on) return;
		for (const m of list) {
			if (m.type === 'childList') m.addedNodes.forEach((n) => {
				if (!(n.classList && n.classList.contains('o55-layer')) || P.build) return;
				P.build = performance.now(); P.screen = n.dataset.screen;
				const h = n.querySelector('.o55-title'); if (h) h.setAttribute('elementtiming', 'pos-title-' + P.n);
				if (!n.classList.contains('o55-hold')) { P.show = P.build; P.shownInClick = true; requestAnimationFrame((ts) => { P.frame = ts; }); }
			});
			else if (P.build && !P.show && m.target.classList.contains('o55-layer') && m.oldValue && /o55-hold/.test(m.oldValue) && !m.target.classList.contains('o55-hold') && !m.target.classList.contains('o55-out')) {
				P.show = performance.now(); P.shownInClick = false; requestAnimationFrame((ts) => { P.frame = ts; });
			}
		}
	}).observe(pane, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
};
const START = () => { const P = window.__pos; Object.assign(P, { on: true, n: P.n + 1, ts: [], lt: [], click: 0, build: 0, show: 0, frame: 0, paint: 0, screen: null, shownInClick: null }); P.faces = P.loadedFaces(); };
const READ = () => {
	const P = window.__pos, c = P.click;
	P.on = false;
	if (!c) return { click: false };
	const ts = P.ts.filter((x) => x >= c - 40), d = ts.slice(1).map((x, i) => [ts[i], x - ts[i]]);
	const until = P.frame || c + 2000;
	const stall = d.filter((g) => g[0] + g[1] >= c && g[0] <= until).reduce((m, g) => Math.max(m, g[1]), 0);
	const end = (P.frame || c) + 600;
	return {
		click: true, screen: P.screen, shownInClick: P.shownInClick,
		build: P.build ? Math.round(P.build - c) : null, show: P.show ? Math.round(P.show - c) : null, first: P.frame ? Math.round(P.frame - c) : null,
		paint: P.paint ? Math.round(P.paint - c) : null,
		newFaces: P.loadedFaces().filter((k) => P.faces.indexOf(k) < 0),
		stall: Math.round(stall), lt: P.lt.filter((e) => e[0] + e[1] > c - 5 && e[0] < end).map((e) => [Math.round(e[0] - c), Math.round(e[1])]),
		gapsIn: d.filter((g) => g[0] >= (P.frame || c) && g[0] <= end && g[1] > 34).map((g) => [Math.round(g[0] - c), Math.round(g[1])]),
		gapsAll: d.filter((g) => g[0] + g[1] >= c && g[0] <= end).map((g) => [Math.round(g[0] - c), Math.round(g[1])])
	};
};

async function surface(t, sandbox) {
	const tag = sandbox ? 'sandbox' : 'normal';
	const FIRST = +(t.args.first || 100), TASK = +(t.args.task || 50), GAP = +(t.args.gap || 50), PDGAP = +(t.args.pdgap || 80), PDMS = +(t.args.pdms || 4000);
	const open = async (reduced, o) => {
		await t.emulate({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
		const f = await t.app.open({ onboarding: true, query: 'o55=fresh' + (t.args.q ? '&' + t.args.q : ''), sandbox });
		// every frame from the start, so the Welcome screen's idle time (and a pre-draw in it) is seen whole
		await f.evaluate(() => { if (window.__pdf) return; window.__pdf = []; const tk = (now) => { window.__pdf.push(now); requestAnimationFrame(tk); }; requestAnimationFrame(tk); });
		await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.svg); }, null, { timeout: 60000 });
		if (o && o.early) return f;
		await f.waitForTimeout(5000);
		await f.evaluate(ARM);
		return f;
	};
	const pdState = (f) => f.evaluate(() => (window.O55.ui.prewarm && window.O55.ui.prewarm.state ? window.O55.ui.prewarm.state() : null));
	const pdLeft = (f) => f.evaluate(() => document.querySelectorAll('#pm-o55-onboarding .o55-prewarm, #pm-o55-onboarding [data-pd]').length);
	// The pane before the pre-draw (Welcome's entrance over), during it and after it (K-AA, the lead's ruling (a)): before and
	// after the same pixels; during, only anti-aliased edges of rounded controls may differ (judgeAA). --set aamutant=1 paints
	// one pixel inside Get Started while it runs: the rows' own red test.
	const pixels = async (reduced) => {
		const mode = reduced ? 'Reduced Motion' : 'motion';
		const f = await open(reduced, { early: true });
		const pane = f.locator('#pm-o55-onboarding .o55-pane');
		await f.waitForFunction(() => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); return !!l && !l.classList.contains('o55-entering') && !l.classList.contains('o55-hold'); }, null, { timeout: 15000 }).catch(() => {});
		await f.waitForTimeout(200);
		const before = await pane.screenshot(), phase0 = (await pdState(f) || {}).phase;
		if (phase0 !== 'none') { await t.check(`${tag}: ${mode}: the pane pictured before the pre-draw`, false, `the pre-draw had already begun (${phase0})`); return; }
		if (!(await pdRunning(f))) { await t.check(`${tag}: ${mode}: the pre-draw was seen running`, false, JSON.stringify(await pdState(f))); return; }
		if (t.args.aamutant) await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-primary'); const d = document.createElement('i'); d.id = 'aa-mutant'; d.style.cssText = 'position:absolute;left:50%;top:6px;width:1px;height:1px;background:#f0f;pointer-events:none'; d.dataset.pos = b.style.position; if (getComputedStyle(b).position === 'static') b.style.position = 'relative'; b.appendChild(d); });
		const boxes = await f.evaluate(ROUNDED), during = await pane.screenshot();
		if (t.args.aamutant) await f.evaluate(() => { const d = document.getElementById('aa-mutant'); if (d) { d.parentElement.style.position = d.dataset.pos || ''; d.remove(); } });
		await f.waitForFunction(() => window.O55.ui.prewarm.state().phase === 'done', null, { timeout: 30000 }).catch(() => {});
		await f.waitForTimeout(300);
		const after = await pane.screenshot();
		if (process.env.T_DIR) [['before', before], ['during', during], ['after', after]].forEach(([k, b]) => fs.writeFileSync(`${process.env.T_DIR}/aa-${tag}-${reduced ? 'rm' : 'm'}${t.args.aamutant ? '-mut' : ''}-${k}.png`, b));
		await t.check(`${tag}: ${mode}: the pane before and after the pre-draw, the same pixels`, before.equals(after), `${before.length} and ${after.length} bytes`);
		const j = judgeAA(before, during, boxes);
		await t.check(`${tag}: ${mode}: while the pre-draw runs only the anti-aliased edges of rounded controls differ (Chrome rasters with MSAA then: at most ${AA_MAX} levels, ${AA_PER} pixels a control; none inside a shape or on a straight edge; within ${AA_BAND} px of a curved outline)`,
			j.ok, JSON.stringify({ differing: j.n, worst: j.worst, failing: j.bad, perControl: j.perControl, crowded: j.crowded, where: j.where }));
	};
	const pdRunning = (f, ms) => f.waitForFunction(() => { const s = window.O55.ui.prewarm && window.O55.ui.prewarm.state && window.O55.ui.prewarm.state(); return !!(s && s.phase === 'running' && s.slices >= 2); }, null, { timeout: ms || 20000 }).then(() => true, () => false);
	// --set only=pixels: the K-AA rows alone, in both motion modes
	if (t.args.only === 'pixels') { for (const reduced of [true, false]) await pixels(reduced); await t.emulate({ reducedMotion: 'no-preference' }); return; }
	// FO-206 G: the Look screen drawn a piece at a time while Welcome is idle (60-ui-core.js predraw), waited for to its end
	const predrawn = (f) => f.evaluate(async () => {
		const st = () => (window.O55.ui.prewarm && window.O55.ui.prewarm.state ? window.O55.ui.prewarm.state() : null);
		for (let k = 0; k < 250 && st() && st().phase === 'running'; k++) await new Promise((r) => setTimeout(r, 100));
		const s0 = st(); if (!s0 || s0.phase === 'none') return { none: true };
		const ts = window.__pdf.filter((x) => x >= s0.startedAt - 20 && x <= s0.endedAt + 20), d = ts.slice(1).map((x, i) => [ts[i], x - ts[i]]);
		return Object.assign({}, s0, { ms: Math.round(s0.endedAt - s0.startedAt), frames: d.length, worstGap: Math.round(Math.max(0, ...d.map((g) => g[1]))), gaps: d.filter((g) => g[1] > 34).map((g) => [Math.round(g[0] - s0.startedAt), Math.round(g[1])]),
			left: document.querySelectorAll('#pm-o55-onboarding .o55-prewarm, #pm-o55-onboarding [data-pd]').length });
	});
	const cur = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
	const change = async (f, sel) => {
		const loc = f.locator(sel).first(); await loc.waitFor({ state: 'visible', timeout: 20000 });
		const b = await loc.boundingBox(); if (!b) throw new Error('no box ' + sel);
		await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await t.page.waitForTimeout(150);
		await f.evaluate(START);
		await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
		await f.waitForTimeout(2500);
		return f.evaluate(READ);
	};
	const say = (name, r) => t.log(`${tag}: ${name}: ${r.click ? `-> ${r.screen}: built at ${r.build} ms after the release, shown at ${r.show}, an animation frame by ${r.first}, its title presented at ${r.paint}; longest frame gap until then ${r.stall} ms; long tasks ${JSON.stringify(r.lt)}; entrance gaps over 34 ms ${JSON.stringify(r.gapsIn)}` : 'no click seen'}`);
	let f = await open(false);
	const pre = await predrawn(f);
	t.log(`${tag}: Welcome's pre-draw of the Look screen: ${JSON.stringify(pre)}`);
	if (!pre.none) {
		// every stall is logged (the lead's ruling C: a cold browser keeps two or three single-shape stalls of 50-75 ms)
		if (pre.gaps.length) t.log(`${tag}: NOTE Welcome's pre-draw: ${pre.gaps.length} frame gap(s) over 34 ms ${JSON.stringify(pre.gaps)}; long slices ${JSON.stringify(pre.long || [])}`);
		const over = pre.gaps.filter((g) => g[1] > PDGAP);
		await t.check(`${tag}: Welcome idle: the pre-draw of the Look screen holds no frame over ${PDGAP} ms`, over.length === 0, `${pre.slices} slices of ${pre.pieces} elements in ${pre.ms} ms, ended '${pre.why}'; frame gaps over 34 ms ${JSON.stringify(pre.gaps)}`);
		await t.check(`${tag}: Welcome idle: the whole pre-draw takes at most ${PDMS} ms`, pre.ms <= PDMS, `${pre.ms} ms for ${pre.slices} slices (on a loaded PC it runs longer: the frames it waits on come later)`);
		await t.check(`${tag}: Welcome idle: the pre-draw ended and left nothing (no host, no marked element, no listener)`, pre.phase === 'done' && pre.why === 'done' && pre.left === 0 && pre.listeners === 0, JSON.stringify({ phase: pre.phase, why: pre.why, left: pre.left, listeners: pre.listeners }));
	}
	const s = await change(f, `${cur} [data-o55-do="start"]`);
	say('Start', s);
	await t.check(`${tag}: Start: the press reached the window and built the Look screen`, s.click && s.screen === 'look', JSON.stringify(s));
	if (s.click && s.screen === 'look') {
		await t.check(`${tag}: Start: the Look screen's first frame within ${FIRST} ms of the release`, s.first != null && s.first <= FIRST, `first frame by ${s.first} ms (built ${s.build}, shown ${s.show}); longest frame gap until then ${s.stall} ms`);
		const over = s.lt.filter((e) => e[1] > TASK);
		await t.check(`${tag}: Start: no task over ${TASK} ms from the release to the end of the entrance`, over.length === 0, `long tasks ${JSON.stringify(s.lt)} (first frame by ${s.first} ms; entrance to ${s.first + 600})`);
		await t.check(`${tag}: Start: no font face loads for the first time (each one that arrives lays the whole page out again)`, s.newFaces.length === 0, `${s.newFaces.length} faces first loaded by Start: ${JSON.stringify(s.newFaces.slice(0, 12))}`);
		const gaps = s.gapsAll.filter((g) => g[1] > GAP);
		await t.check(`${tag}: Start: no frame gap over ${GAP} ms from the release to the end of the entrance`, gaps.length === 0, `${gaps.length} gaps: ${JSON.stringify(gaps)}`);
	}
	await f.waitForTimeout(1500);
	const later = await change(f, `${cur} .o55-primary`);
	say('Look Continue (logged, not judged)', later);
	// the same Start again in the same browser (its GPU's shader cache and font cache now warm): logged, not judged
	f = await open(false);
	const warm = await change(f, `${cur} [data-o55-do="start"]`);
	say('Start again, same browser (logged, not judged)', warm);
	// (4) Start pressed while the pre-draw runs: the rest is paid as before, nothing breaks, nothing is left
	if (!pre.none) {
		f = await open(false, { early: true });
		const running = await pdRunning(f);
		if (running) {
			await f.evaluate(ARM);
			const mid = await change(f, `${cur} [data-o55-do="start"]`);
			say('Start while the pre-draw runs', mid);
			const st = await pdState(f), left = await pdLeft(f);
			await t.check(`${tag}: Start while the pre-draw runs: the Look screen comes in, the pre-draw ends and leaves nothing`, mid.click && mid.screen === 'look' && mid.show != null && st.phase === 'done' && st.why === 'left' && st.listeners === 0 && left === 0, JSON.stringify({ screen: mid.screen, show: mid.show, phase: st.phase, why: st.why, listeners: st.listeners, left }));
		} else await t.check(`${tag}: Start while the pre-draw runs: the pre-draw was seen running`, false, JSON.stringify(await pdState(f)));
		// (5) a low-resource computer: no pre-draw (and no font host)
		f = await open(false, { early: true });
		const lr0 = await f.evaluate(() => { window.O55.motion.setLowResource(true, 'scenario'); const s = window.O55.ui.prewarm.state(); return s; });
		await f.waitForTimeout(7000);
		const lr = await pdState(f), lrLeft = await pdLeft(f);
		await f.evaluate(() => window.O55.motion.setLowResource(false, null));
		// (switched on as soon as the page is up: a pre-draw already going when it came ends there, and draws no more)
		await t.check(`${tag}: low-resource mode: no pre-draw slice once it is on, and nothing left`, !!lr && (lr.phase === 'none' || (lr.phase === 'done' && lr.slices === lr0.slices)) && lrLeft === 0, JSON.stringify({ at: { phase: lr0.phase, slices: lr0.slices }, after: { phase: lr && lr.phase, why: lr && lr.why, slices: lr && lr.slices }, left: lrLeft }));
		for (const reduced of [true, false]) await pixels(reduced);
	}
	// Reduced Motion: unchanged (no hold): Start shows the new screen in the click's own task
	f = await open(true);
	const rm = await change(f, `${cur} [data-o55-do="start"]`);
	say('Reduced Motion Start', rm);
	await t.check(`${tag}: Reduced Motion: Start shows the Look screen in the click's own task (no hold, no entrance)`, rm.click && rm.screen === 'look' && rm.shownInClick === true, JSON.stringify(rm));
	await t.emulate({ reducedMotion: 'no-preference' });
}

export default async function (t) {
	for (const s of t.app.surfaces()) await surface(t, s === 'sandbox');
}
