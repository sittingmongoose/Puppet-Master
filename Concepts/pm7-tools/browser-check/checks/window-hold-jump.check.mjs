// FO-181 part 1: the app's loops under the onboarding window keep their place. The window holds the app beneath still
// (10-window.css, js/14-window-hold.js). A CSS pause takes its hold time, and a resume its start time, from the time of
// the frame that applies it; when that frame is a long one (the window's mount, the close's wake: on main ~240 ms of
// style for the hold rule on every element of the app) the compositor meanwhile moves every loop on by the wall clock,
// so each held loop jumps by about that frame's length when it is shown (pm7-perf lane S, S-REPORT.md: 230 ms in Basic
// Dark, 377 ms in NieR at the close; 280 / 472 ms at the open).
// Per look: Home with the chat working (its orbit and Activity loops, the status dots); up to 16 CSS loops of the app
// are taken before the open. A real press on Home options and on Run Onboarding Again opens the window, a real press on
// its Close button closes it, under a light DevTools trace. Every frame (requestAnimationFrame) samples each loop's
// currentTime and play state at the frame's own time; the trace gives the end of that frame's main-thread work (its
// ProxyMain::BeginMainFrame, matched by the sample's own clock through a sync mark). Judged, per loop:
//   open    the hold was taken at time X (the loop's start + its held currentTime); the frame that shows it (the first
//           whose late sample, a ResizeObserver callback after its style and layout, is paused) ended its traced main
//           frame at d. d - X is how far the compositor kept moving the loop past the place it was put back to: at
//           most one frame.
//   close   the resume was taken at X (the loop's new start + its held currentTime); d - X of the frame that shows it
//           (the first whose late sample runs) is the jump forward when it is shown: at most one frame.
//   held    no held loop advances while the window is open (currentTime the same in every held frame), and none still
//           runs once the window is on screen.
// One frame is the display's own frame time, at least 16.7 ms (one frame of a 60 fps film: the films' unit).
// Also logged: the jump as lane S measured it (the gap between the two samples around each change, less the loop's own
// advance; it cannot see a resume in a long frame), the long frames, and the style cost pm7-perf asked for: the
// largest style recalc (ms, elements) and the longest main frame in the open and in the close (not judged).
// Fails main 9bfa159274 (the hold and the resume in the long frames); passes the fix.
//   --set looks=basic-dark,nier-dark,friendly-light (default those three; all for the ten)   --set rounds=2
//   --set work=0 (Home without the chat working)   --set keepTrace=1 (the traces in the run folder; traceTasks=1 adds the
//   main thread's tasks to them)
import { LOOKS } from '../browser-check.config.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DEFAULT_LOOKS = ['basic-dark', 'nier-dark', 'friendly-light'];
const MAX_LOOPS = 16;
const FILM_FRAME = 1000 / 60;
const CATS = 'devtools.timeline,disabled-by-default-devtools.timeline.frame,blink.user_timing,cc,benchmark';

// In the app's frame: the sampler. pick() takes the loops; start()/stop() run the per-frame samples.
function install(max) {
	const isCss = (a) => !!(window.CSSAnimation && a instanceof window.CSSAnimation);
	const FREE = new Set(['pm-o55-onboarding', 'pm-hover-tag-root', 'o55-demo', 'o55-open-scrim']);
	const held = (el) => {
		if (!el || el.nodeType !== 1 || el.getRootNode() !== document) return false;
		let top = el; while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
		return top.parentElement === document.body && !FREE.has(top.id) && top.tagName !== 'SCRIPT';
	};
	const desc = (a) => { const e = a.effect.target; return `${a.animationName} on ${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : ''}`; };
	const S = { loops: [], rows: [], marks: [], on: false };
	S.pick = () => {
		const all = document.getAnimations().filter((a) => isCss(a) && a.playState === 'running' && a.playbackRate === 1 && a.effect && !a.effect.pseudoElement && held(a.effect.target)
			&& a.effect.getTiming().iterations === Infinity);
		// spread over different loops: one per animation name first
		const seen = new Set(), pick = [];
		for (const a of all) if (pick.length < max && !seen.has(a.animationName)) { seen.add(a.animationName); pick.push(a); }
		for (const a of all) if (pick.length < max && !pick.includes(a)) pick.push(a);
		S.loops = pick;
		const box = (a) => { const r = a.effect.target.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
		return { total: all.length, picked: pick.map(desc), boxes: pick.map((a) => desc(a) + ' ' + box(a).join(',')) };
	};
	// a second sample late in each frame, after its style and layout: a ResizeObserver on a 1 px probe (outside <body>,
	// so the window never holds it) that each frame's first sample resizes. It sees a change made in that frame's own
	// callbacks, so the frame that shows the change is known even where a frame's time falls inside another frame
	const probe = document.createElement('div');
	probe.id = 'fo181-probe'; probe.setAttribute('aria-hidden', 'true');
	probe.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;contain:strict;';
	document.documentElement.appendChild(probe);
	new ResizeObserver(() => {
		const row = S.on && S.rows[S.rows.length - 1];
		if (row && row.v2 == null) { row.w2 = performance.now(); row.v2 = S.loops.map((a) => [a.currentTime, a.playState]); }
	}).observe(probe);
	const tick = (ts) => {
		if (!S.on) return;
		S.rows.push({ tl: document.timeline.currentTime, w: performance.now(), open: document.documentElement.hasAttribute('data-o55-open'),
			shown: !!document.querySelector('#pm-o55-onboarding[data-open="true"]:not(.o55-hold)'), v: S.loops.map((a) => [a.currentTime, a.playState]) });
		probe.style.width = (S.rows.length % 2 ? 2 : 1) + 'px';
		requestAnimationFrame(tick);
	};
	S.start = () => { S.rows = []; S.marks = []; S.on = true; requestAnimationFrame(tick); };
	S.stop = () => { S.on = false; return { rows: S.rows, marks: S.marks, loops: S.loops.map(desc) }; };
	// a mark on both clocks: the page's (performance.now) and the trace's (a user timing mark)
	S.mark = (name) => { const w = performance.now(); performance.mark('fo181:' + name, { startTime: w }); S.marks.push({ name, w }); return w; };
	window.__fo181 = S;
	return true;
}

const median = (xs) => { const s = xs.filter(Number.isFinite).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const r1 = (x) => (Number.isFinite(x) ? Math.round(x * 10) / 10 : x);

// Judge one loop's rows: its held span (paused while the window holds it) and the two changes around it.
function judgeLoop(R, k, frames) {
	const rows = R.rows, v = (r) => r.v[k], out = { loop: R.loops[k] };
	const iP = rows.findIndex((r, i) => i > 0 && v(r)[1] === 'paused' && v(rows[i - 1])[1] === 'running');
	if (iP < 0) { out.error = 'never paused'; return out; }
	let iR = -1; for (let i = iP + 1; i < rows.length; i++) if (v(rows[i])[1] === 'running' && v(rows[i - 1])[1] === 'paused') { iR = i; break; }
	if (iR < 0) { out.error = 'never resumed'; return out; }
	if (rows.slice(iP, iR).some((r) => v(r)[1] !== 'paused')) { out.error = 'not paused throughout'; return out; }
	const hold = v(rows[iP])[0];
	out.heldDrift = r1(Math.max(...rows.slice(iP, iR).map((r) => Math.abs(v(r)[0] - hold))));
	// the start before and after (timeline time at currentTime 0), from the running rows next to the changes
	const before = rows[iP - 1], after = rows[iR];
	const xOpen = before.tl - v(before)[0] + hold, xClose = after.tl - v(after)[0] + hold;
	// the frame that shows each change: the first whose late sample (after its style and layout) has the new state; its
	// traced main frame ends at d. (Not the frame X falls in: a frame's time can fall inside the long frame before it.)
	const late = (from, state) => { for (let i = from; i < rows.length; i++) { const r = rows[i]; if (r.v2 && r.v2[k][1] === state) return r; } return null; };
	const shown = (r) => (r ? frames.find((fr) => fr.b <= r.w2 + 0.05 && r.w2 <= fr.e + 0.05) : null);
	const lo = late(Math.max(0, iP - 2), 'paused'), lc = late(Math.max(iP, iR - 2), 'running');
	const fo = shown(lo), fc = shown(lc);
	if (!fo || !fc) { out.error = `no traced frame shows the ${!fo ? 'open' : 'close'}${!(fo ? lc : lo) ? ' (no late sample)' : ''}`; return out; }
	out.openLate = r1(Math.max(0, fo.e - xOpen)); out.closeLate = r1(Math.max(0, fc.e - xClose));
	out.openFrameMs = r1(fo.e - fo.b); out.closeFrameMs = r1(fc.e - fc.b);
	// lane S's measure: the gap between the samples around each change less the loop's own advance there
	out.gapOpen = r1((rows[iP].tl - before.tl) - (hold - v(before)[0]));
	out.gapClose = r1((after.tl - rows[iR - 1].tl) - (v(after)[0] - hold));
	out.heldMs = r1(xClose - xOpen);
	return out;
}

async function homeOptions(t, f) {
	// Home's options menu (Concepts/home-redesign 49-titlebar.js) and its Run Onboarding Again item
	await f.locator('[data-pm-home-top-action="home-menu"]').filter({ visible: true }).first().click({ timeout: 15000 });
	const item = f.locator('[data-pm-home-action="run-onboarding"]').filter({ visible: true }).first();
	await item.waitFor({ timeout: 5000 });
	return item;
}

async function traceDuring(t, during) {
	const cdp = await t.page.context().newCDPSession(t.page);
	await cdp.send('Tracing.start', { categories: (t.args.traceTasks === '1' ? 'toplevel,' : '') + CATS, transferMode: 'ReturnAsStream' });
	let result;
	try { result = await during(); } finally {
		const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
		await cdp.send('Tracing.end');
		var { stream } = await complete;
	}
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	await cdp.detach().catch(() => {});
	return { result, raw: parts.join('') };
}

async function episode(t, f, tag, { work }) {
	if (work) {
		await f.evaluate(() => { try { window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_DEMO.startWorking(); } catch (_) {} });
		await f.waitForTimeout(2500);
	}
	const picked = await f.evaluate((m) => window.__fo181.pick(m), MAX_LOOPS);
	t.log(`${tag}: ${picked.total} running CSS loops in the app; sampled ${picked.picked.length}: ${picked.picked.join(', ')}`);
	t.log(`${tag}: where (x,y,w,h): ${picked.boxes.join('; ')}`);
	await t.check(`${tag}: loops to sample in the app`, picked.picked.length >= 3, `${picked.picked.length} of ${picked.total}`, { hard: true });
	const item = await homeOptions(t, f);
	return traceDuring(t, async () => {
		await f.evaluate(() => { window.__fo181.start(); window.__fo181.mark('sync'); });
		await f.waitForTimeout(600);
		await f.evaluate(() => window.__fo181.mark('open'));
		t.mark(`${tag}: press Run Onboarding Again`);
		await item.click({ timeout: 5000 });
		await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open') && !!document.querySelector('#pm-o55-onboarding[data-open="true"] .o55-pane > .o55-layer[data-screen]:not(.o55-hold)'), null, { timeout: 20000 });
		await f.waitForTimeout(1800);
		const close = f.locator('#pm-o55-onboarding .o55-close').filter({ visible: true }).first();
		await f.evaluate(() => window.__fo181.mark('close'));
		t.mark(`${tag}: press Close`);
		await close.click({ timeout: 10000 });
		await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 20000 });
		await f.waitForTimeout(1500);
		await f.evaluate(() => window.__fo181.mark('end'));
		return f.evaluate(() => window.__fo181.stop());
	});
}

// The trace's main frames on the page's own clock (through the sync mark), each row's frame end, and the style cost
function readTrace(t, tag, R, raw) {
	const json = JSON.parse(raw), ev = json.traceEvents || json;
	const sync = ev.find((e) => e.name === 'fo181:sync');
	if (!sync) return { error: 'no sync mark in the trace' };
	const { pid, tid } = sync, w0 = R.marks.find((m) => m.name === 'sync').w, off = sync.ts / 1000 - w0;   // trace ms = page ms + off
	const at = (e) => e.ts / 1000 - off;
	const mine = ev.filter((e) => e.pid === pid && e.tid === tid && e.ph === 'X');
	const frames = mine.filter((e) => e.name === 'ProxyMain::BeginMainFrame').map((e) => ({ b: at(e), e: at(e) + (e.dur || 0) / 1000 }));
	const styles = mine.filter((e) => e.name === 'UpdateLayoutTree').map((e) => ({ b: at(e), ms: (e.dur || 0) / 1000, n: (e.args && e.args.elementCount) || 0 }));
	let matched = 0;
	for (const r of R.rows) { const fr = frames.find((x) => x.b <= r.w + 0.05 && r.w <= x.e + 0.05); r.d = fr ? fr.e : null; if (fr) matched++; }
	const m = (name) => R.marks.find((x) => x.name === name).w;
	const span = (a, b) => {
		const ss = styles.filter((x) => x.b >= m(a) && x.b < m(b)), big = ss.reduce((p, x) => (x.ms > p.ms ? x : p), { ms: 0, n: 0 });
		const fs = frames.filter((x) => x.b >= m(a) && x.b < m(b)), long = fs.reduce((p, x) => (x.e - x.b > p.e - p.b ? x : p), { b: 0, e: 0 });
		return { styleMaxMs: r1(big.ms), styleMaxElements: big.n, styleSumMs: r1(ss.reduce((s, x) => s + x.ms, 0)), longestFrameMs: r1(long.e - long.b), longFrames: fs.filter((x) => x.e - x.b > 20).map((x) => `+${r1(x.b - m(a))}:${r1(x.e - x.b)}`).join(' ') };
	};
	const cost = { open: span('open', 'close'), close: span('close', 'end') };
	t.log(`${tag}: COST open ${JSON.stringify(cost.open)}; close ${JSON.stringify(cost.close)}`);
	return { matched, frames: frames.sort((a, b) => a.b - b.b), cost };
}

const only = (v, all) => (v === 'all' ? all : v ? String(v).split(',').map((s) => s.trim()).filter((x) => all.includes(x)) : DEFAULT_LOOKS);

export const tests = Object.fromEntries(LOOKS.map((look) => [look, async (t) => {
	if (!only(t.args.looks, LOOKS).includes(look)) return;
	const rounds = Math.max(1, Number(t.args.rounds || 2)), work = t.args.work !== '0';
	const f = await t.app.open({ query: 'pm-still=off&pm-warm=0', settleMs: 1500 });
	await t.app.look(look);
	await f.evaluate(install, MAX_LOOPS);
	const worst = { open: 0, close: 0, held: 0, gapOpen: 0, gapClose: 0, styleOpen: 0, styleClose: 0 };
	for (let n = 1; n <= rounds; n++) {
		const tag = `${look} round ${n}`;
		const { result: R, raw } = await episode(t, f, tag, { work });
		if (t.args.keepTrace === '1' && t.run && t.run.dir) writeFileSync(join(t.run.dir, `trace-${tag.replace(/[^a-z0-9]+/gi, '-')}.json.gz`), gzipSync(raw));
		const T = readTrace(t, tag, R, raw);
		await t.check(`${tag}: the trace has the page's frames`, !T.error && T.matched >= R.rows.length * 0.9, T.error || `${T.matched} of ${R.rows.length} samples in a traced main frame (${T.frames.length} frames)`, { hard: true });
		const theme = await f.evaluate(() => document.documentElement.getAttribute('data-theme'));
		const rows = R.rows, display = median(rows.slice(1).map((r, i) => r.tl - rows[i].tl)), bound = Math.max(display, FILM_FRAME);
		t.log(`${tag}: ${rows.length} frames, display frame ${r1(display)} ms (bound ${r1(bound)} ms), theme after ${theme}`);
		// none still running once the window is on screen
		const shownRows = rows.filter((r) => r.open && r.shown);
		const running = R.loops.filter((_, k) => shownRows.slice(3).some((r) => r.v[k][1] === 'running'));
		const verdicts = R.loops.map((_, k) => judgeLoop(R, k, T.frames)), judged = verdicts.filter((x) => !x.error);
		for (const x of verdicts) t.log(`${tag}: ${x.loop}: ${x.error ? 'not judged: ' + x.error : JSON.stringify(x)}`);
		await t.check(`${tag}: no loop of the app still runs once the window is on screen`, running.length === 0, running.length ? running.join('; ') : `${shownRows.length} frames shown`);
		// every loop runs again after the close (a hold that never lets go, or a placement that took the loop out of CSS's hands)
		const last = rows[rows.length - 1], still = R.loops.filter((_, k) => last.v[k][1] === 'paused');
		await t.check(`${tag}: every sampled loop runs again after the close`, still.length === 0, still.length ? still.join('; ') : `${R.loops.length} running`);
		await t.check(`${tag}: loops judged`, judged.length >= 3, `${judged.length} of ${verdicts.length} (${verdicts.filter((x) => x.error).map((x) => x.loop + ': ' + x.error).join('; ') || 'all'})`);
		const max = (key) => judged.reduce((p, x) => Math.max(p, x[key] ?? 0), 0);
		const worstOf = (key) => { const x = judged.reduce((p, y) => ((y[key] ?? 0) > (p[key] ?? -1) ? y : p), {}); return x.loop ? `${x.loop}: ${x[key]} ms (its frame's work ${x[key === 'openLate' ? 'openFrameMs' : 'closeFrameMs']} ms)` : '-'; };
		worst.open = Math.max(worst.open, max('openLate')); worst.close = Math.max(worst.close, max('closeLate')); worst.held = Math.max(worst.held, max('heldDrift'));
		worst.gapOpen = Math.max(worst.gapOpen, max('gapOpen')); worst.gapClose = Math.max(worst.gapClose, max('gapClose'));
		worst.styleOpen = Math.max(worst.styleOpen, T.cost.open.styleMaxMs); worst.styleClose = Math.max(worst.styleClose, T.cost.close.styleMaxMs);
		await t.check(`${tag}: held loops keep their place while the window is open (currentTime unchanged)`, max('heldDrift') <= 0.5, worstOf('heldDrift'));
		await t.check(`${tag}: open: each loop is held at most one frame (${r1(bound)} ms) before the frame that shows it`, max('openLate') <= bound, `worst ${worstOf('openLate')}; lane S's gap measure up to ${max('gapOpen')} ms`);
		await t.check(`${tag}: close: each loop resumes at most one frame (${r1(bound)} ms) before the frame that shows it`, max('closeLate') <= bound, `worst ${worstOf('closeLate')}; lane S's gap measure up to ${max('gapClose')} ms`);
		await f.waitForTimeout(1500);
	}
	t.log(`${look}: SUMMARY worst over ${rounds} round(s): open ${worst.open} ms, close ${worst.close} ms, held drift ${worst.held} ms; lane S's gap open ${worst.gapOpen} ms, close ${worst.gapClose} ms; largest style recalc open ${worst.styleOpen} ms, close ${worst.styleClose} ms`);
}]));
