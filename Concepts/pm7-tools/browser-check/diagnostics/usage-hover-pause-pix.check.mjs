// Does PERF-USAGE-HOVER (the wheel pause, card A) change any pixel of Usage at rest? A diagnostic for the pause's pixel
// proof: origin/main's page (--set main=<url>) and the pause's page (--set page=<url>) loaded in turn in the same browser,
// main, pause, main (A1, B, A2), the clock fixed (Playwright clock.setFixedTime, so "resets in ..." and every other date
// text reads the same in all three loads), Live off (pmu-live=off), the animation clock held (DevTools) for each shot.
// Per look (default basic-dark,glass-dark,retro-dark,nier-dark) the states, each shot after its own settle:
//   park0    the board at its top, the pointer parked at the window's right edge
//   hover0   the pointer moved onto the card at the page's centre (55 % down) and left there 1.5 s: its hover at rest
//   back0    from hover0, 12 wheel ticks of 40 px down and 12 up (30 ms apart), the pointer still, 900 ms: the
//            highlight under a pointer that rested through a scroll (the pause's end on the pause's page)
//   park300  the board at 300 px, the pointer parked
// A1 against A2 says whether main's page itself differs between loads; B against A1 what the pause changed. Where main
// varies between its loads (the title bar's notification ticker, the status bar, a pill's live count), only the 16 px
// cells it holds still in are judged (tools/usage-hover-pause-pix-judge.mjs), over the whole frame and inside the board's
// pane (#pmuScroll, the pause's scope). Shots are taken with Playwright's animations disabled. Shots and heat maps go to
// --set shots=<dir>. Requires the named hit-tested states and actual travel of the Usage pane.
//   NODE_OPTIONS=--max-old-space-size=8192 browser-check run diagnostics/usage-hover-pause-pix.check.mjs --host alexis \
//     --set page=http://192.168.50.179:18644/vh-<n>.html --set main=http://192.168.50.179:18644/vh-main.html \
//     --set sandbox=0|1 --set shots=<dir> --out <run folder>   [--set looks=...] [--set rm=1] [--set fixed=0]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { diffPng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { stillJudge } from '../tools/usage-hover-pause-pix-judge.mjs';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark').split(',').filter(Boolean);
	const W = 1920, H = 1080, sandbox = t.app.surfaces()[0] === 'sandbox';
	const dir = String(t.args.shots || t.dir || process.cwd());
	mkdirSync(dir, { recursive: true });
	await t.viewport(W, H);
	await muteSound(t.page);
	if (String(t.args.rm || '') === '1') await t.emulate({ reducedMotion: 'reduce' });
	if (String(t.args.fixed ?? '1') !== '0') await t.page.context().clock.setFixedTime(new Date('2026-11-17T15:00:00-05:00'));
	const pages = [['A1', String(t.args.main)], ['B', String(t.args.page)], ['A2', String(t.args.main)]];
	const states = ['park0', 'hover0', 'back0', 'park300'];
	const shots = {};   // `${look}|${state}` -> { A1, B, A2 }
	const boards = {};  // look -> the board pane's rect in the screenshot (#pmuScroll)
	let n = 0;
	for (const [tag, base] of pages) {
		const u = `${base}${base.includes('?') ? '&' : '?'}cb=${Date.now()}-${++n}&o55=off&pm-warm=0&pmu-live=off`;
		if (sandbox) await t.openInSandbox(u, { settleMs: 300 }); else await t.goto(u, { settleMs: 300 });
		await t.until('page ready', () => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000, hard: true });
		const f = t.root === t.page ? t.page.mainFrame() : t.root;
		await f.evaluate(() => document.fonts.ready.then(() => true));
		await t.page.waitForTimeout(Number(t.args.settle ?? 20000));
		let cdp;
		try { cdp = await t.page.context().newCDPSession(f === t.page.mainFrame() ? t.page : f); } catch (e) { cdp = await t.page.context().newCDPSession(t.page); }
		await cdp.send('Animation.enable');
		const frames = (k) => f.evaluate((k) => new Promise((r) => { let i = 0; const s = () => (++i >= k ? r(true) : requestAnimationFrame(s)); requestAnimationFrame(s); }), k);
		const shot = async (key) => {
			await frames(3);
			await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 });
			await t.page.waitForTimeout(150);
			// (endless CSS animations in their base state, finite ones finished: a status icon's spin or a pill's pulse caught
			// at another phase in each load read as a change in the first runs)
			const png = await t.page.screenshot({ type: 'png', animations: 'disabled' });
			await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 });
			(shots[key] = shots[key] || {})[tag] = png;
		};
		const park = () => t.page.mouse.move(W - 6, Math.round(H / 2), { steps: 4 });
		for (const look of looks) {
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await f.evaluate(() => PM_PAGES.go('usage'));
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 8000));
			const at = await f.evaluate(() => {
				const pane = document.getElementById('pmuScroll');
				pane.scrollTop = 0;
				const page = (document.querySelector('.page.active') || document.body).getBoundingClientRect();
				const q = pane.getBoundingClientRect();
				return { x: Math.round(page.left + page.width / 2), y: Math.round(page.top + page.height * 0.55),
					board: [q.left, q.top, q.right, q.bottom] };
			});
			const pane = await f.locator('#pmuScroll').boundingBox();
			if (!pane) {
				await t.check(tag + ' ' + look + ': could judge the Usage pane is visible', false);
				continue;
			}
			const dx = pane.x - at.board[0], dy = pane.y - at.board[1];
			boards[look] = at.board.map((edge, i) => Math.round(edge + (i % 2 ? dy : dx)));
			const read = () => f.evaluate(({ x, y }) => {
				const pane = document.getElementById('pmuScroll'), board = document.getElementById('pmuBoard');
				const hit = document.elementFromPoint(x, y), card = hit?.closest('.pmu-card');
				return { top: pane.scrollTop, range: pane.scrollHeight - pane.clientHeight, inPane: pane.contains(hit),
					card: card?.parentNode === board && card.matches(':hover') ? card.dataset.widget : null };
			}, at);
			const capture = async (state, qualified, evidence) => {
				if (qualified) await shot(look + '|' + state);
				else await t.check(tag + ' ' + look + ' ' + state + ': could judge the Usage capture', false, JSON.stringify(evidence));
			};
			await park(); await t.page.waitForTimeout(2600);
			const parked = await read();
			await capture('park0', parked.inPane && parked.top === 0 && !parked.card, parked);

			await t.page.mouse.move(at.x + dx, at.y + dy, { steps: 6 }); await t.page.waitForTimeout(1500);
			const hover = await read();
			await capture('hover0', !!hover.card && hover.top === 0, hover);
			let down, back;
			if (hover.card) {
				for (const direction of [1, -1]) {
					for (let i = 0; i < 12; i++) { await t.page.mouse.wheel(0, direction * 40); await t.page.waitForTimeout(30); }
					if (direction === 1) down = await read();
				}
				await t.page.waitForTimeout(900);
				back = await read();
			}
			const travel = Math.min(hover.range, 12 * 40) * 0.6;
			await capture('back0', !!hover.card && back?.card === hover.card && travel > 0 &&
				down.top - hover.top >= travel && down.top - back.top >= travel && Math.abs(back.top - hover.top) <= 1,
				{ hover, down, back });
			await park(); await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 300; }); await t.page.waitForTimeout(2600);
			const away = await read();
			await capture('park300', away.inPane && Math.abs(away.top - 300) <= 1 && !away.card, away);
		}
		await cdp.send('Animation.disable').catch(() => {});
		await cdp.detach().catch(() => {});
		await t.check(`${tag}: ${base} loaded and shot ${looks.length * 4} states`, looks.every((look) => states.every((state) => shots[look + '|' + state]?.[tag])));
	}
	const surface = sandbox ? 'sandbox' : 'normal', rows = [];
	for (const look of looks) for (const state of states) {
		const s = shots[look + '|' + state], name = [surface, look, state].join('-');
		if (!s?.A1 || !s.B || !s.A2) {
			rows.push({ surface, look, state, error: 'unqualified capture' });
			continue;
		}
		const drift = diffPng(s.A1, s.A2), d = diffPng(s.A1, s.B), d2 = diffPng(s.A2, s.B);
		const judged = drift.rawDiffPixels === 0;
		writeFileSync(path.join(dir, `${name}-A1.png`), s.A1);
		if (d.rawDiffPixels || d2.rawDiffPixels || !judged) { writeFileSync(path.join(dir, `${name}-B.png`), s.B); writeFileSync(path.join(dir, `${name}-A2.png`), s.A2); if (d.heatmap) writeFileSync(path.join(dir, `${name}-heat-A1-B.png`), d.heatmap); }
		// where main itself varies between loads, only cells it holds still in are judged (tools/usage-hover-pause-pix-judge.mjs):
		// over the whole frame and inside the board's pane, the pause's scope
		const whole = judged ? null : stillJudge(s.A1, s.A2, s.B), board = stillJudge(s.A1, s.A2, s.B, boards[look]);
		const row = { surface, look, state, judged, drift: drift.rawDiffPixels, diff: d.rawDiffPixels, diff2: d2.rawDiffPixels, maxDelta: d.maxChannelDelta, bounds: d.bounds, board: boards[look],
			stillFrame: whole ? whole.changed : d.rawDiffPixels, stillFrameBoxes: whole ? whole.changedBoxes : null, stillBoard: board.changed, stillBoardBoxes: board.changedBoxes, varyShare: whole ? whole.varyShare : 0 };
		rows.push(row);
		t.log(`${name}: main against main ${drift.rawDiffPixels} px; pause against main ${d.rawDiffPixels} px (max channel delta ${d.maxChannelDelta}), against the second main ${d2.rawDiffPixels} px` +
			(judged ? ' | judged whole; ' + board.changed + ' px changed in the board' : ` | main varies in ${whole.varyShare} % of the frame; where it holds still the pause changed ${whole.changed} px in the frame${whole.changed ? ' ' + JSON.stringify(whole.changedBoxes) : ''}, ${board.changed} px in the board ${JSON.stringify(boards[look])}${board.changed ? ' ' + JSON.stringify(board.changedBoxes) : ''}`));
	}
	writeFileSync(path.join(dir, `${surface}-summary.json`), JSON.stringify(rows, null, 1));
	const zero = (k) => rows.filter((r) => r[k] === 0).length;
	t.log(`SUMMARY ${surface}: ${rows.filter((r) => r.judged && r.diff === 0).length} of ${rows.length} states pixel-identical to main; where main holds still between its loads, no pixel changed in ${zero('stillFrame')} of ${rows.length} frames and in ${zero('stillBoard')} of ${rows.length} boards`);
}
