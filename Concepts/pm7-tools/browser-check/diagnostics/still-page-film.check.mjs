// Film of the still page for the owner (PERF-3, Jared's choice B, 2026-11-11): Home in one look, about 32 s. The pointer
// rests where it hovers nothing; 20 s with no input (the real wait, no test hook), the endless loops hold where they
// are; a pointer move, they carry on from there. Marks: 'rest' (the last input), 'still' (data-pm-still fully on, read
// in the page), 'move' (the waking move), 'running' (every loop running again). Each mark is checked in the page too, so
// a film whose page never went still, or did not wake, fails instead of showing nothing.
//   browser-check run Concepts/pm7-tools/browser-check/diagnostics/still-page-film.check.mjs --set page=<build> \
//     --set look=glass-dark --record <dir>/still-page-glass-dark.mp4 --codec h264 [--host windows]
// --set look=<look> (default glass-dark)   --set settle=<ms> after load (default 30000: start-up work and the chat's demo)
export default async function (t) {
	const W = 1920, H = 1080;
	const f = await t.app.open({ query: 'pm-warm=0' });
	await t.app.look(String(t.args.look || 'glass-dark'));
	await f.evaluate(() => PM_PAGES.go('dashboard'));
	await t.page.mouse.move(W - 6, Math.round(H / 2));
	await t.page.waitForTimeout(Number(t.args.settle ?? 30000));
	// the rest: one last small move where nothing is hovered, then nothing for 20 s
	await t.page.mouse.move(W - 6, Math.round(H / 2) + 1);
	await t.mark('rest');
	const running = () => document.getAnimations().filter((a) => { try { return a.effect.getTiming().iterations === Infinity && a.playState === 'running'; } catch (e) { return false; } }).length;
	const r0 = await f.evaluate(running);
	await f.waitForFunction(() => (document.documentElement.getAttribute('data-pm-still') || '').split(' ').filter(Boolean).length === 4, null, { timeout: 26000, polling: 50 }).catch(() => {});
	await t.mark('still');
	const s = await f.evaluate(() => ({ still: !!(window.PM_STILL && PM_STILL.still()), since: window.PM_STILL ? Math.round(PM_STILL.since()) : -1 }));
	const r1 = await f.evaluate(running);
	await t.check('the page went still about 20 s after the last input, every loop held', s.still && s.since >= 19500 && s.since <= 22000 && r1 === 0, `still ${s.still} ${s.since} ms after the input; endless running ${r0} -> ${r1}`);
	await t.page.waitForTimeout(4000);
	await t.page.mouse.move(Math.round(W * 0.7), Math.round(H * 0.6), { steps: 12 });
	await t.mark('move');
	await f.waitForFunction(() => !document.documentElement.hasAttribute('data-pm-still'), null, { timeout: 2000, polling: 'raf' }).catch(() => {});
	await t.mark('running');
	const r2 = await f.evaluate(running);
	await t.check('one pointer move lets every loop go on', r2 >= r0 && r2 > 0, `endless running ${r2} (before the rest ${r0})`);
	await t.page.waitForTimeout(5000);
}
