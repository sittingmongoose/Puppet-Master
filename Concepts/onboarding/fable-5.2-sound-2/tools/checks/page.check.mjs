// The concept pages: they load clean, sound starts only after a real gesture, the tune follows the flow, Pip's mouth
// moves when it talks, and each concept dresses the stage. --set shots=1 lists crops of the window for viewing.
//   browser-check run tools/checks/page.check.mjs [--set looks=friendly-dark,nier-light] [--set shots=1]
const LOOKS = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'basic-dark', 'basic-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
const PAGES = [['c1', 'concept-1.html'], ['c2', 'concept-2.html'], ['c3', 'concept-3.html']];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = Object.fromEntries(PAGES.map(([id, page]) => [id, async (t) => {
	const looks = t.args.looks ? String(t.args.looks).split(',') : ['friendly-dark'];
	await t.goto(page);
	await t.page.waitForFunction(() => !!(window.__ob && window.PipSound && window.__ob.stage()));
	const before = await t.evaluateNoGesture(() => ({ unlocked: window.PipSound.unlocked, ctx: !!window.PipSound.ctx, concept: window.PipSound.concept }));
	await t.check('no sound before a gesture (not unlocked, no audio context)', before.unlocked === false && before.ctx === false, JSON.stringify(before));
	await t.equal('the page opens on its own concept', before.concept, id);
	await t.page.mouse.click(700, 500);
	await t.page.waitForFunction(() => window.PipSound.unlocked && window.PipSound.ctx && window.PipSound.ctx.state === 'running', null, { timeout: 8000 });
	await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
	await t.check('the tune starts after the first click', true);
	// sound really leaves the page: the analyser on the output sees a signal, and the scheduler stays ahead of the clock
	const live = await t.page.evaluate(async () => { const P = window.PipSound, an = P.analyser(), buf = new Uint8Array(an.fftSize); let dev = 0, late = 0; const t0 = performance.now(); while (performance.now() - t0 < 3000) { an.getByteTimeDomainData(buf); for (let i = 0; i < buf.length; i++) dev = Math.max(dev, Math.abs(buf[i] - 128)); const pl = P.session.player; if (pl && pl.playing && pl.barT < P.ctx.currentTime) late++; await new Promise((r) => setTimeout(r, 30)); } return { dev, late }; });
	await t.check(`the output carries the tune (analyser peak ${live.dev} of 128) and no bar was scheduled late (${live.late})`, live.dev >= 1 && live.late === 0, JSON.stringify(live));
	if (t.args.width) { await t.page.locator(`.cc [data-width="${t.args.width}"]`).click(); await sleep(900); }
	for (const look of looks) {
		await t.page.evaluate((l) => { const o = window.__ob; o.S.theme = l; o.applyTheme(); o.go('where'); }, look);
		await sleep(2600);
		const s = await t.page.evaluate(() => { const P = window.PipSound, st = window.__ob.stage(); return { tr: P.transport(), kit: P.kit, parts: P.parts().filter((p) => p.on).map((p) => p.name), px: !!st.px, deco: st.px ? st.px.gDeco.childElementCount : 0, set: st.px ? st.px.gSet.childElementCount + st.px.gFront.childElementCount : 0, intensity: P.intensity(), mouth: !!st.pxMouth }; });
		await t.check(`${look}: the look's own tune is playing (${s.tr.song})`, s.tr.playing && String(s.tr.song).startsWith(id + '-'), JSON.stringify(s.tr));
		await t.check(`${look}: the stage has its extra layers (${s.deco} backdrop pieces, ${s.set} set pieces, a talking mouth)`, s.px && s.mouth && (s.deco > 0 || look.startsWith('glass')), JSON.stringify(s));
		// Pip talks: the mouth opens while the line is said
		await t.page.evaluate(() => window.__ob.stage().sayNow('Right here works great, shall we go on?', 'happy'));
		const open = await t.page.evaluate(async () => { let m = 0; const t0 = performance.now(); while (performance.now() - t0 < 1500) { m = Math.max(m, window.PipSound.mouth().open); await new Promise((r) => setTimeout(r, 16)); } return m; });
		await t.check(`${look}: Pip's mouth opens while it talks (${open.toFixed(2)})`, open > 0.3);
		if (t.args.shots) await t.crop(`${id}-${look}-where`, '#obWin', `${id} ${look}: the window on The computer`);
		if (t.args.shots && look === looks[0]) {
			await t.page.evaluate(() => window.__ob.go('safe')); await sleep(2800);
			await t.crop(`${id}-${look}-safe`, '#obWin', `${id} ${look}: Keep your work safe`);
			await t.page.evaluate(() => window.__ob.go('ready')); await sleep(4200);
			await t.crop(`${id}-${look}-ready`, '#obWin', `${id} ${look}: Ready`);
		}
	}
	const lvl = await t.page.evaluate(() => { window.__ob.go('ready'); return new Promise((r) => setTimeout(() => r({ i: window.PipSound.intensity(), parts: window.PipSound.parts().filter((p) => p.on).length, all: window.PipSound.parts().length }), 600)); });
	await t.check(`at Ready nearly every part is in (${lvl.parts} of ${lvl.all})`, lvl.parts >= lvl.all - 3, JSON.stringify(lvl));
	// the whole flow, with the things a person does on the way: type a name, switch Reduced Motion, close and reopen,
	// try today's sound and come back, move the mixer
	const flow = await t.page.evaluate(() => window.__ob.FLOW);
	for (const sc of flow) {
		await t.page.evaluate((x) => window.__ob.go(x), sc);
		await sleep(sc === 'creating' ? 6500 : sc === 'ai' ? 4200 : sc === 'ready' ? 3800 : 1100);
		if (sc === 'name') { const f = t.page.locator('#obName'); await f.click(); await f.fill(''); await f.pressSequentially('Tastebook two', { delay: 45 }); await sleep(500); }
		if (sc === 'safe') { await t.page.locator('#reducedBtn').click(); await sleep(600); await t.page.locator('#reducedBtn').click(); }
		if (sc === 'away') { await t.page.locator('.ob-close').click(); await sleep(1200); await t.page.locator('#resumePill').click(); await sleep(1200); }
	}
	await t.page.locator('#mixer [data-vol="music"]').fill('60');
	await t.page.locator('#conceptSeg [data-concept="orig"]').click();
	await t.page.waitForFunction(() => !!window.PipSoundOriginal, null, { timeout: 8000 }); await sleep(1500);
	await t.page.evaluate(() => { window.PipSound.play('select'); window.__ob.stage().sayNow('Hello again.', 'happy'); }); await sleep(1200);
	await t.page.locator(`#conceptSeg [data-concept="${id}"]`).click();
	await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
	const faults = await t.page.evaluate(() => ({ stage: window.__ppxErrors || [], sound: window.PS5.errors, vol: window.PipSound.volume('music') }));
	await t.check(`the whole flow ran with no fault caught in the sound or the stage additions (music at ${faults.vol})`, faults.stage.length === 0 && faults.sound.length === 0 && Math.abs(faults.vol - 0.6) < 0.01, JSON.stringify(faults).slice(0, 900));
	await t.page.evaluate(() => window.PipSound.setMuted(true)); await sleep(500);
	const off = await t.page.evaluate(() => window.PipSound.transport().playing);
	await t.check('sound off stops the tune', off === false);
}]));
