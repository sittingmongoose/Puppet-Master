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
// --set shots=<dir>. Asserts only that each load came up.
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
			const at = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); s.scrollTop = 0; const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(), q = s.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55), board: [q.left, q.top, q.right, q.bottom].map(Math.round) }; });
			const fe = f === t.page.mainFrame() ? null : await f.frameElement().catch(() => null), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
			boards[look] = [at.board[0] + off.x, at.board[1] + off.y, at.board[2] + off.x, at.board[3] + off.y].map(Math.round);
			await park(); await t.page.waitForTimeout(2600); await shot(`${look}|park0`);
			await t.page.mouse.move(at.x, at.y, { steps: 6 }); await t.page.waitForTimeout(1500); await shot(`${look}|hover0`);
			for (let i = 0; i < 24; i++) { await t.page.mouse.wheel(0, i < 12 ? 40 : -40); await t.page.waitForTimeout(30); }
			await t.page.waitForTimeout(900); await shot(`${look}|back0`);
			await park(); await f.evaluate(() => { document.getElementById('pmuScroll').scrollTop = 300; }); await t.page.waitForTimeout(2600); await shot(`${look}|park300`);
		}
		await cdp.send('Animation.disable').catch(() => {});
		await cdp.detach().catch(() => {});
		await t.check(`${tag}: ${base} loaded and shot ${looks.length * 4} states`, looks.every((l) => shots[`${l}|park300`] && shots[`${l}|park300`][tag]));
	}
	const surface = sandbox ? 'sandbox' : 'normal', rows = [];
	for (const [key, s] of Object.entries(shots)) {
		if (!s.A1 || !s.B || !s.A2) continue;
		const [look, state] = key.split('|'), name = `${surface}-${look}-${state}`;
		const drift = diffPng(s.A1, s.A2), d = diffPng(s.A1, s.B), d2 = diffPng(s.A2, s.B);
		const judged = drift.rawDiffPixels === 0;
		writeFileSync(path.join(dir, `${name}-A1.png`), s.A1);
		if (d.rawDiffPixels || d2.rawDiffPixels || !judged) { writeFileSync(path.join(dir, `${name}-B.png`), s.B); writeFileSync(path.join(dir, `${name}-A2.png`), s.A2); if (d.heatmap) writeFileSync(path.join(dir, `${name}-heat-A1-B.png`), d.heatmap); }
		// where main itself varies between loads, only cells it holds still in are judged (tools/usage-hover-pause-pix-judge.mjs):
		// over the whole frame and inside the board's pane, the pause's scope
		const whole = judged ? null : stillJudge(s.A1, s.A2, s.B), board = judged ? null : stillJudge(s.A1, s.A2, s.B, boards[look]);
		const row = { surface, look, state, judged, drift: drift.rawDiffPixels, diff: d.rawDiffPixels, diff2: d2.rawDiffPixels, maxDelta: d.maxChannelDelta, bounds: d.bounds, board: boards[look],
			stillFrame: whole ? whole.changed : d.rawDiffPixels, stillFrameBoxes: whole ? whole.changedBoxes : null, stillBoard: board ? board.changed : null, stillBoardBoxes: board ? board.changedBoxes : null, varyShare: whole ? whole.varyShare : 0 };
		rows.push(row);
		t.log(`${name}: main against main ${drift.rawDiffPixels} px; pause against main ${d.rawDiffPixels} px (max channel delta ${d.maxChannelDelta}), against the second main ${d2.rawDiffPixels} px` +
			(judged ? ' | judged whole' : ` | main varies in ${whole.varyShare} % of the frame; where it holds still the pause changed ${whole.changed} px in the frame${whole.changed ? ' ' + JSON.stringify(whole.changedBoxes) : ''}, ${board.changed} px in the board ${JSON.stringify(boards[look])}${board.changed ? ' ' + JSON.stringify(board.changedBoxes) : ''}`));
	}
	writeFileSync(path.join(dir, `${surface}-summary.json`), JSON.stringify(rows, null, 1));
	const zero = (k) => rows.filter((r) => (r.judged ? r.diff : r[k]) === 0).length;
	t.log(`SUMMARY ${surface}: ${rows.filter((r) => r.judged && r.diff === 0).length} of ${rows.length} states pixel-identical to main; where main holds still between its loads, no pixel changed in ${zero('stillFrame')} of ${rows.length} frames and in ${zero('stillBoard')} of ${rows.length} boards`);
}
