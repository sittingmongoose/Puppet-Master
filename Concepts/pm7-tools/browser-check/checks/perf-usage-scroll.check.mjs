// Usage's board scrolls on the compositor (lane V, 2026-11-15).
//
// Wheel-scrolling Usage dropped 17.5 frames a second on the owner's PC (Home 1.9, Settings 3.7) with 397 ms/s of main-
// thread work. Chrome kept the board's pane (#pmuScroll) on main-thread scrolling: it had no composited layer, so every
// wheel frame re-ran the paint lifecycle, re-layerized the page and re-rastered the layer that held the board (Glass: the
// whole app shell). src/css/20-board.css now gives the pane will-change: scroll-position, and the board gets its own
// scrolling layer.
//
// Per look (default Basic Dark) and surface:
//   1. the pane has its own scrolling layer: a layer in the DevTools layer tree whose node is #pmuScroll and which is
//      taller than the pane (its scrolled contents). Red on origin/main 1a109a026b (no layer), green after (837x1650).
//   2. main-thread paint while the wheel turns (the trace's paint + pre-paint + layerize, ms a second, helpers/frame-
//      trace.mjs): four 3 s windows of real wheel input (frame-cost's ticks, 40 px every 14 ms, with the pointer at the
//      page's centre; each window starts at the board's top and turns every 12 ticks, so it never sits at an end, where
//      frame-cost's 30 ticks measured almost nothing) in the order as built, control, control, as built. The control is the same page with the pane's hint taken away by a trial sheet (will-change: auto), which is
//      origin/main's scroll. As built must cost at most --set ratio (0.85) of the control. On origin/main both are the same
//      scroll (the ratio sits near 1); measured with the hint: Alexis Basic Dark 95-132 against 134-203 ms/s. Under
//      Reduced Motion (--set rm=1) a tick is one instant step and both builds paint about the same (55 and 56 ms/s): the
//      ratio is logged there, not judged, and check 1 carries the line.
//   3. frames fully dropped while scrolling (helpers/frame-trace.mjs fullDroppedPerSec: a DroppedFrame with no partial
//      update) as built at most half the control's plus 1 a second, judged when the control drops 4 or more a second.
//      Chrome's DroppedFrame count also holds frames that went out on time with a partial update (the scroll shown, a
//      main-thread change late); those rise with the hint and are logged, not judged: Alexis Basic Dark, 238 Hz, as built
//      3.3 and 0 fully dropped, 139 and 136 partial; control 7.9 and 10.3 fully, 59 and 61 partial.
//   4. a guard that also holds on origin/main: at rest (the pointer parked, no input, 2 s) no more than 5 rendered main
//      frames a second over the control's.
// A pane that did not scroll in a window, or a window whose trace stayed partial after two retakes (Chrome reported lost
// trace data, or the compositor drew under 30 frames a second while the wheel turned), fails as "could not judge".
// Both surfaces (the kit's sandbox switch).   --set looks=basic-dark,glass-dark   --set ratio=0.85   --set rm=1 (Reduced
// Motion)   --set settle=<ms> (25000)
// Bar for this check (test-tool-bar.md, written before its first review): it stops work only if shown on real inputs to
// pass a build whose board scrolls on the main thread, or to fail a build whose board scrolls on the compositor without a
// per-frame invalidation inside it; the guard in 4 is a diagnostic and does not stop work on its own.
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';

const CONTROL = '#panel-usage .pmu-scroll { will-change: auto !important; }';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark').split(',').filter(Boolean);
	const ratio = Number(t.args.ratio || 0.85);
	const W = 1920, H = 1080, MS = 3000;
	await t.viewport(W, H);
	await muteSound(t.page);
	const rm = String(t.args.rm || '') === '1';
	if (rm) await t.emulate({ reducedMotion: 'reduce' });
	for (const surface of t.app.surfaces()) {
		const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
		await f.evaluate(() => document.fonts.ready.then(() => true));
		await t.page.waitForTimeout(Number(t.args.settle ?? 25000));
		const cdp = await t.page.context().newCDPSession(t.page);
		const appCdp = await t.page.context().newCDPSession(f);
		const trial = (css) => f.evaluate((css) => { let s = document.getElementById('perf-usage-scroll-trial'); if (!s) { s = document.createElement('style'); s.id = 'perf-usage-scroll-trial'; document.head.appendChild(s); } s.textContent = css; }, css);
		const park = () => t.page.mouse.move(W - 6, Math.round(H / 2));

		for (const look of looks) {
			const S = `[${surface}] ${look}: `;
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await f.evaluate(() => PM_PAGES.go('usage'));
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 8000));
			const pane = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); return s ? { client: s.clientHeight, scroll: s.scrollHeight } : null; });
			// turn before the end: 40 px ticks, at most 12 (480 px), fewer on a shorter board
			const turn = pane ? Math.max(3, Math.min(12, Math.floor((pane.scroll - pane.client) / 40) - 2)) : 12;
			if (!pane || pane.scroll - pane.client < 200) { await t.check(S + 'could judge: Usage\'s board pane is there and can scroll', false, JSON.stringify(pane)); continue; }

			// 1. the pane's own scrolling layer
			const layer = await (async () => {
				await appCdp.send('DOM.enable');
				try {
					const { root } = await appCdp.send('DOM.getDocument', { depth: 0 });
					const { nodeId } = await appCdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#pmuScroll' });
					const { node } = await appCdp.send('DOM.describeNode', { nodeId });
					const got = new Promise((resolve) => { const on = (e) => { if (e.layers) { appCdp.off('LayerTree.layerTreeDidChange', on); resolve(e.layers); } }; appCdp.on('LayerTree.layerTreeDidChange', on); setTimeout(() => resolve(null), 5000); });
					await appCdp.send('LayerTree.enable');
					const ls = await got;
					await appCdp.send('LayerTree.disable');
					if (!ls) return { error: 'no layer tree' };
					const own = ls.filter((l) => l.backendNodeId === node.backendNodeId);
					return { own: own.map((l) => `${l.width}x${l.height}${l.drawsContent ? '' : ' (draws nothing)'}`), scrolled: own.some((l) => l.drawsContent && l.height > pane.client + 40) };
				} finally { await appCdp.send('DOM.disable').catch(() => {}); }
			})().catch((e) => ({ error: String(e) }));
			await t.check(S + 'the board\'s pane has its own scrolling layer', !!layer.scrolled, layer.error || `layers of #pmuScroll: ${layer.own.join(', ') || 'none'} (pane ${pane.client} px of ${pane.scroll})`);

			// 2 and 3: as built, control, control, as built
			const windows = [];
			for (const [name, css] of [['as built', ''], ['control', CONTROL], ['control', CONTROL], ['as built', '']]) {
				await trial(css);
				await park();
				await t.page.waitForTimeout(2000);
				const rest = await traceWindow(cdp, { ms: 2000, url: f.url() });
				// a window whose trace lost data (Chrome's dataLossOccurred), or that drew under 30 frames a second while the wheel
				// turned (every whole window measured drew 60 to 240), is taken again, twice at most
				let x, at, top, lost = [];
				for (let attempt = 0; attempt < 3; attempt++) {
					// every window starts at the board's top: one that began near the end spent most of its ticks pinned there and
					// measured almost nothing (main 94 ms/s against 644 for the next one)
					at = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); s.scrollTop = 0; const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55), top: s.scrollTop, range: s.scrollHeight - s.clientHeight }; });
					await t.page.waitForTimeout(400);
					await t.page.mouse.move(at.x, at.y);
					await t.page.waitForTimeout(600);
					x = await traceWindow(cdp, {
						ms: MS, url: f.url(), keep: t.args.keep ? `${t.args.keep}/${surface}-${look}-${windows.length}-${attempt}.json` : undefined,
						// frame-cost's ticks (40 px every 14 ms), the direction turning every TURN ticks so the board never sits at an end
						during: async (until) => { let i = 0; while (Date.now() < until) { await t.page.mouse.wheel(0, (Math.floor(i++ / turn) % 2 ? -1 : 1) * 40); await new Promise((r) => setTimeout(r, 14)); } }
					});
					top = await f.evaluate(() => document.getElementById('pmuScroll').scrollTop);
					if (!x.dataLoss && x.drawn.perSec >= 30) break;
					lost.push(x.dataLoss ? 'trace lost data' : `drew ${x.drawn.perSec}/s`);
					await park(); await t.page.waitForTimeout(1500);
				}
				const whole = !x.dataLoss && x.drawn.perSec >= 30;
				const paint = (x.split.paint || 0) + (x.split.prepaint || 0) + (x.split.layerize || 0);
				const w = { name, whole, lost, renderer: x.renderer ? x.renderer.pid : null, frames: x.mainFrames.perSec, paint: Math.round(paint), main: Math.round(x.cost.main), dropped: x.frames.droppedPerSec, full: x.frames.fullDroppedPerSec, partial: x.frames.partialPerSec, drawn: x.drawn.perSec, scrolls: x.dispatched.scroll || 0, restFrames: rest.mainFrames.renderedPerSec, from: at.top, to: top };
				windows.push(w);
				t.log(`${S}${name}: paint ${w.paint} ms/s, main ${w.main} ms/s, dropped ${w.dropped}/s (fully ${w.full}, partial ${w.partial}), drawn ${w.drawn}/s, main frames ${w.frames}/s (renderer ${w.renderer}), ${w.scrolls} scroll events (${w.from} -> ${w.to} px) | at rest ${w.restFrames} rendered main frames/s${lost.length ? ' | taken again: ' + lost.join(', ') : ''}`);
			}
			await trial('');
			await park();
			const judged = windows.every((w) => w.scrolls > 0 && w.whole);
			await t.check(S + 'could judge: the wheel scrolled the board in all four windows and each trace is whole', judged, windows.map((w) => `${w.name} ${w.scrolls} scroll events${w.whole ? '' : ' (' + w.lost.join(', ') + ')'}`).join(', '));
			if (!judged) continue;
			const mean = (name, k) => { const v = windows.filter((w) => w.name === name).map((w) => w[k]); return v.reduce((a, b) => a + b, 0) / v.length; };
			const [bp, cp] = [mean('as built', 'paint'), mean('control', 'paint')];
			const detail = `as built ${Math.round(bp)} ms/s, control ${Math.round(cp)} ms/s (paint + pre-paint + layerize): ratio ${(bp / Math.max(1, cp)).toFixed(2)}`;
			// under Reduced Motion a wheel tick is one instant step, not a smooth scroll of several frames: both builds paint about
			// the same (Alexis Basic Dark: 55 and 56 ms/s), so the ratio is logged there and the layer check above carries the line
			if (rm) t.log(S + 'Reduced Motion: main-thread paint while scrolling, not judged: ' + detail);
			else await t.check(S + `main-thread paint while scrolling is at most ${ratio} of the control's`, bp <= ratio * cp, detail);
			// Chrome's DroppedFrame events count frames that went out on time with a partial update too (the scroll shown, some
			// main-thread change late): those are logged; the line is drawn on frames that showed nothing new
			const [bf, cf] = [mean('as built', 'full'), mean('control', 'full')];
			const [bpa, cpa] = [mean('as built', 'partial'), mean('control', 'partial')];
			const dd = `fully dropped: as built ${bf.toFixed(1)}/s, control ${cf.toFixed(1)}/s; on time with a partial update: as built ${bpa.toFixed(1)}/s, control ${cpa.toFixed(1)}/s`;
			if (cf >= 4) await t.check(S + 'frames fully dropped while scrolling: at most half the control\'s, plus 1 a second', bf <= cf / 2 + 1, dd);
			else t.log(S + 'the control dropped under 4 frames a second, too few to judge: ' + dd);
			const [br, cr] = [mean('as built', 'restFrames'), mean('control', 'restFrames')];
			await t.check(S + 'guard: nothing new runs at rest', br <= cr + 5, `as built ${br.toFixed(1)}, control ${cr.toFixed(1)} rendered main frames a second with the pointer parked`);
		}
		await appCdp.detach().catch(() => {});
		await cdp.detach().catch(() => {});
	}
}
