// PERF-1 film (stream F 9b-2): the onboarding stage at rest, through a swing and while new words type, one look per run, for
// a before/after comparison on 60 fps GPU films (Jared may confirm the displacement gate on them). Route: `where` at
// --set size (default 1390x900), the look applied, the pointer arriving and resting at the window's right edge, then:
//   rest   - 8 s with Pip's idle life held (no swing, wiggle or glance is started; sway, breathing and blinks go on);
//   swing  - a swing as idle life starts one (the pendulum kicked .3 rad/s), 4 s;
//   speech - a new line typed in, 4 s;
//   life   - idle life let go again, 6 s.
// Each phase is marked on the film. No assertion beyond reaching the stage; judge the films. Normal page unless
// --set sandbox=1. Example:
//   browser-check run Concepts/pm7-tools/browser-check/diagnostics/stage-rest-film.check.mjs --set page=<build> \
//     --set look=basic-dark --record /abs/film.mp4 --codec h264 --sole
const STAGE = '#pm-o55-onboarding .o55-stage';
export const tests = {
	async 'stage rest film'(t) {
		const look = String(t.args.look || 'basic-dark'), [w, h] = String(t.args.size || '1390x900').split('x').map(Number);
		await t.viewport(w, h);
		const f = await t.app.open({ onboarding: true, query: 'o55=screen=where', sandbox: String(t.args.sandbox) === '1' });
		await f.waitForFunction((s) => { const e = document.querySelector(s); return !!(e && e.__pipStage && e.__pipStage.gHead); }, STAGE, { timeout: 60000 });
		const [fam, scheme] = look.split('-');
		await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, scheme]);
		await f.waitForTimeout(3000);
		await t.page.mouse.move(w / 2, h / 2, { steps: 4 }); await t.page.mouse.move(w - 3, h / 2, { steps: 6 });
		await f.waitForTimeout(3000);
		const st = (fn) => f.evaluate(`(${fn})(document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage)`);
		await st('(st) => { st.idleNext = 1e12; st.idleLook = null; }');
		await f.waitForTimeout(2500);
		t.mark(`${look} rest`);
		await f.waitForTimeout(8000);
		t.mark(`${look} swing`);
		await st('(st) => { st.ps.thv += .3; st.kick(); }');
		await f.waitForTimeout(4000);
		t.mark(`${look} speech`);
		await st("(st) => st.say('Measuring the stage, one moment.', null, true)");
		await f.waitForTimeout(4000);
		t.mark(`${look} life`);
		await st('(st) => { st.idleNext = st.t; }');
		await f.waitForTimeout(6000);
		await t.check(`${look}: filmed rest, swing, speech and idle life`, true);
	}
};
