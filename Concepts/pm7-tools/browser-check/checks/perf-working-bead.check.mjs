// The working status mark's bead turns as an svg element, not as a part inside its svg (2026-11-11 performance pass,
// lane K, after lane F2's trial).
//
// The working mark (neon-icons.js status('working'): a still ring and a bead going round it in 9 s) drew its bead as a
// part inside the mark's svg, turned by a CSS transform. A moving part inside an svg lays the svg out on every frame it
// moves, and Chrome re-runs the hover hit test after each layout: in Basic and Glass the Files footer's mark
// (#fmWatchStat) was the one glyph still laid out in every frame (lane F2: 119 partial layouts and 120 hit tests a
// second on Basic Dark Settings, 0.4 ms a frame in Basic, 0.8 to 1.2 in Glass). The bead is now drawn in a second svg of
// the same size laid over the first, and that svg element turns: the same keyframes, period, easing and delay, run by
// the compositor with no layout.
//
// Per look (default all ten), on Settings with the pointer parked, the Files footer's mark:
//   - is the ring's svg and the bead's svg, the second turning by itself (an animation on the svg element) and the bead
//     inside it still; no part inside the mark's svgs runs a transform animation of its own (NieR with its diamonds part:
//     neither turns, the diamond is drawn by the wrapper);
//   - the bead's svg lies exactly over the ring's (same centre, same size);
// then on Basic Dark and Glass Dark a 3 s trace counts layouts and hover hit tests a second (logged, the number F2
// measured). With --set snaps=<dir> it writes the mark frozen at eight moments of its turn per look (every animation in
// the mark paused at the same time of its own), for comparing builds pixel by pixel.
// --set looks=<a,b>  default all ten; --set settle=<ms> (default 40000). Both surfaces.
// F1: a freshly mounted Processes-style nx-still mark plays its finite entrance on the moving element, then rests.
// --set entranceOnly=1 runs that regression alone (including on main's single-SVG renderer).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { traceEvents } from '../helpers/frame-trace.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];

const MARK = () => {
	const st = document.querySelector('#fmWatchStat .nx-st-working');
	if (!st || !st.getClientRects().length) return null;
	const svgs = [...st.children].filter((e) => e.tagName.toLowerCase() === 'svg');
	// the layout box: its centre (a turn keeps it) and its own size (getBoundingClientRect of a turned svg is the turned
	// square's bounds, not its box)
	const box = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return [r.left + r.width / 2, r.top + r.height / 2, parseFloat(cs.width), parseFloat(cs.height)].map((v) => Math.round(v * 100) / 100); };
	const run = (a) => a.playState === 'running';
	const own = (e) => e.getAnimations().filter(run).map((a) => a.animationName || a.id || '?');
	// every running transform animation on an element inside the mark's svgs (not on an svg itself)
	const inner = [];
	for (const s of svgs) for (const a of s.getAnimations({ subtree: true })) {
		if (!run(a) || a.effect.target === s) continue;
		const kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
		if (kf.some((k) => k.transform && k.transform !== 'none')) inner.push((a.effect.target.getAttribute('class') || '') + ' ' + (a.animationName || ''));
	}
	const nierDiamond = getComputedStyle(st, '::after').content !== 'none' && getComputedStyle(st, '::after').animationName !== 'none';
	return { svgs: svgs.length, classes: svgs.map((s) => s.getAttribute('class')), boxes: svgs.map(box), own: svgs.map(own), inner, nierDiamond, visible: svgs.map((s) => getComputedStyle(s).visibility) };
};
// freeze every animation in the mark at its own time T (a status mark's loop starts when the mark is drawn, on no
// shared clock: the same T is the same pose in any build whose loop has the same keyframes, period and delay)
const FREEZE = (T) => {
	const st = document.querySelector('#fmWatchStat .nx-st-working');
	const list = st.getAnimations({ subtree: true });
	for (const a of list) { a.pause(); a.currentTime = T; }
	const r = st.getBoundingClientRect();
	return { n: list.length, clip: { x: Math.floor(r.left) - 4, y: Math.floor(r.top) - 4, width: Math.ceil(r.width) + 8, height: Math.ceil(r.height) + 8 } };
};
const THAW = () => { const st = document.querySelector('#fmWatchStat .nx-st-working'); if (st) st.getAnimations({ subtree: true }).forEach((a) => { try { a.play(); } catch (e) { /* none */ } }); };

export default async function (t) {
	const want = String(t.args.looks || 'all');
	const looks = want === 'all' ? ALL : want.split(',').filter(Boolean);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));
	await t.app.look('basic-dark');
	await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 });
	const entrance = await f.evaluate(async () => {
		const host = document.createElement('span');
		host.style.cssText = 'position:fixed;left:60px;top:60px;z-index:999999';
		host.innerHTML = PM56_NEON.status('working', 14, 'nx-still');
		document.body.appendChild(host);
		try {
			const mover = host.querySelector('svg.nx-st-spin') || host.querySelector('.nx-p');
			const list = mover.getAnimations().filter((a) => a.playState === 'running');
			const timing = list.map((a) => ({ name: a.animationName, ...a.effect.getTiming() }));
			// CSSAnimation reports the effect's easing as linear; CSS applies its timing function to the keyframes.
			const easing = getComputedStyle(mover).animationTimingFunction;
			await Promise.race([Promise.all(list.map((a) => a.finished)), new Promise((r) => setTimeout(r, 3000))]);
			await new Promise(requestAnimationFrame);
			return { timing, easing, resting: host.getAnimations({ subtree: true }).every((a) => a.playState !== 'running'), transform: getComputedStyle(mover).transform };
		} finally { host.remove(); }
	});
	t.log(`still working entrance: ${JSON.stringify(entrance)}`);
	await t.check('still Working: one finite entrance runs on the moving element immediately after mount', entrance.timing.length === 1 && entrance.timing[0].name === 'nx-st-working-0A' && entrance.timing[0].iterations === 1 && entrance.timing[0].duration === 440 && entrance.timing[0].fill === 'backwards' && entrance.easing.replaceAll(' ', '') === 'cubic-bezier(0.2,0.75,0.25,1)', JSON.stringify(entrance));
	await t.check('still Working: the entrance ends at rest', entrance.resting && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(entrance.transform), JSON.stringify(entrance));
	if (String(t.args.entranceOnly || '0') === '1') return;
	const snaps = t.args.snaps ? path.resolve(String(t.args.snaps)) : null;
	if (snaps) mkdirSync(snaps, { recursive: true });
	const cdp = await t.page.context().newCDPSession(t.page);
	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('settings'));
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 5000));
		const m = await f.evaluate(MARK);
		if (!m) { await t.check(`${look}: could judge: the Files footer shows a working mark`, false, 'no #fmWatchStat .nx-st-working with a box'); continue; }
		t.log(`${look}: ${JSON.stringify(m)}`);
		const nier = look.startsWith('nier') && m.nierDiamond;
		await t.check(`${look}: the working mark is the ring's svg and the bead's svg`, m.svgs === 2 && /\bnx-st-spin\b/.test(m.classes[1] || ''), m.classes.join(' | '));
		await t.check(`${look}: no part inside the mark's svgs turns by a transform of its own`, m.inner.length === 0, m.inner.join('; ') || 'none');
		if (nier) await t.check(`${look}: NieR's diamond is drawn and neither svg turns`, m.own.every((x) => x.length === 0), JSON.stringify(m.own));
		else await t.check(`${look}: the bead's svg turns as an element and the ring's svg holds still`, m.own[0]?.length === 0 && (m.own[1] || []).length === 1, JSON.stringify(m.own));
		await t.check(`${look}: the bead's svg lies exactly over the ring's (same centre and size)`, m.boxes.length === 2 && m.boxes[0].every((v, i) => Math.abs(v - m.boxes[1][i]) <= 0.02), JSON.stringify(m.boxes));
		if (snaps && !nier) {
			for (let i = 0; i < 8; i++) {
				const fr = await f.evaluate(FREEZE, 90000 + i * 1125);
				await t.page.waitForTimeout(120);
				writeFileSync(path.join(snaps, `${look}-bead-${i}.png`), await t.page.screenshot({ clip: fr.clip, caret: 'hide' }));
			}
			await f.evaluate(THAW);
		}
		if (look === 'basic-dark' || look === 'glass-dark') {
			const ev = await traceEvents(cdp, { ms: 3000 });
			const names = new Map(); for (const e of ev) if (e.ph === 'M' && e.name === 'thread_name') names.set(e.pid + ':' + e.tid, e.args.name);
			const per = new Map(); for (const e of ev) { const k = e.pid + ':' + e.tid; if (names.get(k) !== 'CrRendererMain') continue; per.set(k, (per.get(k) || 0) + 1); }
			const main = [...per].sort((a, b) => b[1] - a[1])[0]?.[0];
			let layouts = 0, whole = 0, hits = 0, t0 = Infinity, t1 = -Infinity;
			for (const e of ev) { if (!e.ts) continue; t0 = Math.min(t0, e.ts); t1 = Math.max(t1, e.ts); if (e.pid + ':' + e.tid !== main) continue; if (e.name === 'Layout' && (e.ph === 'X' || e.ph === 'B')) { layouts++; if (e.args?.beginData?.partialLayout === false) whole++; } else if (e.name === 'HitTest' && (e.ph === 'X' || e.ph === 'B')) hits++; }
			const s = (t1 - t0) / 1e6;
			t.log(`${look} settings, 3 s trace: ${(layouts / s).toFixed(1)} layouts a second (${(whole / s).toFixed(1)} whole-document), ${(hits / s).toFixed(1)} hover hit tests a second`);
		}
	}
	await cdp.detach();
}
