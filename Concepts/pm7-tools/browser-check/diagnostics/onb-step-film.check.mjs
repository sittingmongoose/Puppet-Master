// A film of Pip's onboarding stage at rest and through a swing, for Jared to compare two builds side by side (ONB-STEP:
// the resting drift drawn in 0.1 px steps, Jared 2026-11-27). Diagnostic: asserts only that each look was filmed.
//   browser-check run diagnostics/onb-step-film.check.mjs --record /abs/film.mp4 --set page=<build>
//   --set looks= (default basic-dark,glass-dark)  --set screen= (default where)  --set rest= (ms at rest, default 8000)
//   --set swing= (ms after the swing, default 6000)  --set settle= (default 15000)  --set viewSettle= (default 10000)
// Per look: the look applied, the screen opened, Pip woken by a pointer journey that ends off the window, viewSettle to
// rest, then the film's marks: '<look> rest' (rest ms with nothing done), '<look> swing' (Pip set swinging as its idle
// swing does: ps.thv += 0.5), then swing ms. Each mark also carries the stage's own draw counters when it has them.
import { muteSound } from '../helpers/quiet-page.mjs';

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark').split(',').filter(Boolean);
	const screen = String(t.args.screen || 'where');
	const W = 1920, H = 1080;
	await muteSound(t.page);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screen + '&pm-warm=0' });
	const open = await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55 && O55.ui && typeof O55.ui.applyLook === 'function', null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the onboarding window is open', open, screen);
	if (!open) return;
	await t.page.waitForTimeout(Number(t.args.settle ?? 15000));
	const gate = () => f.evaluate(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage')?.__pipStage; return st ? JSON.stringify({ renderN: st.renderN, gate: st.gate || null, t: Math.round(st.t * 100) / 100 }) : 'no stage'; });
	for (const look of looks) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await t.page.waitForTimeout(4000);
		await f.evaluate((id) => window.O55.ui.go(id, { noHistory: true }), screen);
		await t.page.waitForTimeout(1200);
		for (let i = 0; i < 12; i++) await t.page.mouse.move(700 + i * 30, 500 + (i % 2) * 40);
		await t.page.mouse.move(W - 6, Math.round(H / 2));
		await t.page.waitForTimeout(Number(t.args.viewSettle ?? 10000));
		await t.mark(`${look} rest ${await gate()}`);
		await t.page.waitForTimeout(Number(t.args.rest ?? 8000));
		await t.mark(`${look} swing ${await gate()}`);
		await f.evaluate(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; st.ps.thv += .5; });
		await t.page.waitForTimeout(Number(t.args.swing ?? 6000));
		await t.mark(`${look} end ${await gate()}`);
		await t.check(`${look}: filmed at rest and through a swing`, true, screen);
	}
}
