// The listening room, round two: it loads clean and silent; a song is picked and played; the walk's six steps say what
// joins and bring it in; "Walk it for me" walks; the sound menu opens; Pip talks in each take of a voice; a busy click
// is one sound and then Pip; and the page stays inside the window at a desktop, a tablet and a phone width, with Pip's
// area upright in each.   --set shots=1 lists frames for viewing.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = {
	async 'room'(t) {
		await t.goto('index.html');
		await t.page.waitForFunction(() => !!(window.__room && window.PipSound && window.PipSoundMenu && window.__room.stage()));
		const before = await t.evaluateNoGesture(() => ({ unlocked: window.PipSound.unlocked, cells: document.querySelectorAll('.rm-cell').length, songs: document.querySelectorAll('#rmSongs .rm-song').length, steps: [...document.querySelectorAll('#rmSteps .rm-step span')].map((n) => n.textContent), dots: document.querySelectorAll('.rm-cell .rm-dot').length }));
		await t.check('24 songs in the table (6 looks x 4), one marked as each look\'s own; 4 to pick here; silent before a gesture', before.cells === 24 && before.dots === 6 && before.songs === 4 && before.unlocked === false, JSON.stringify(before));
		await t.check(`the six steps of the walk say what joins: ${before.steps.join(' | ')}`, before.steps.length === 6 && /alone/.test(before.steps[0]) && before.steps.slice(1).some((s) => /^\+ /.test(s)), JSON.stringify(before.steps));
		await t.page.locator('#rmSongs .rm-song[data-song="waltz"]').click();
		await t.page.waitForFunction(() => window.PipSound.transport().playing && window.PipSound.transport().song === 'c3-friendly', null, { timeout: 12000 });
		await t.check('picking a song plays it', true);
		await t.text('#rmTitle', /Toybox Waltz/);
		await t.page.locator('#rmSteps [data-step="1"]').click(); await sleep(300);
		const few = await t.page.evaluate(() => window.PipSound.parts().filter((p) => p.on).length);
		await t.page.locator('#rmSteps [data-step="5"]').click(); await sleep(300);
		const many = await t.page.evaluate(() => ({ n: window.PipSound.parts().filter((p) => p.on).length, same: window.PipSound.session.player.song.id }));
		await t.check(`more parts at Ready (${many.n}) than at Welcome (${few}), and the song went on`, many.n > few && many.same === 'c3-friendly');
		// Walk it for me: back to Pip asleep, then on by itself
		await t.page.locator('#rmWalk').click(); await sleep(500);
		const w0 = await t.page.evaluate(() => ({ step: window.__room.S.step, asleep: window.PipSound.session.asleep }));
		await t.page.waitForFunction(() => window.__room.S.step >= 2, null, { timeout: 25000 });
		await t.check('"Walk it for me" starts with Pip asleep and steps on by itself', w0.step === 0 && w0.asleep === true);
		await t.page.locator('#rmWalk').click();
		// a cell in the table: another look and its song
		await t.page.locator('.rm-cell[data-k="nier"][data-song="band"]').click();
		await t.page.waitForFunction(() => window.PipSound.transport().song === 'c2-nier', null, { timeout: 15000 });
		const th = await t.page.evaluate(() => ({ theme: document.body.dataset.theme, stage: window.__room.stage().theme, songs: [...document.querySelectorAll('#rmSongs .rm-song b')].map((n) => n.textContent) }));
		await t.check(`a cell changes the look and the song (the song tiles are now NieR's: ${th.songs.join(', ')})`, /^nier-/.test(th.theme) && th.stage === th.theme && th.songs.includes('Paper Lanterns'), JSON.stringify(th));
		// the sound menu, from the top bar
		await t.page.locator('#rmSound').click();
		const menu = await t.page.evaluate(() => { const m = document.querySelector('#psmMenu'), r = m.getBoundingClientRect(); return { open: !m.hidden, songs: m.querySelectorAll('[data-psm-song]').length, inside: r.left >= 0 && r.right <= innerWidth, bg: getComputedStyle(m).backgroundColor }; });
		await t.check('the sound menu opens from the bar, on the page, with NieR\'s four songs', menu.open && menu.songs === 4 && menu.inside, JSON.stringify(menu));
		if (t.args.shots) await t.shot('room-menu', 'the listening room in NieR with the sound menu open');
		await t.page.keyboard.press('Escape');
		// Pip talks, in each take of the voice
		await t.page.locator('#rmLook').selectOption('glass-dark'); await sleep(900);
		const takes = await t.page.evaluate(() => [...document.querySelectorAll('#rmVoices [data-voice]')].map((b) => b.textContent));
		await t.check(`Glass offers its voice in ${takes.length} takes: ${takes.join(' / ')}`, takes.length === 3);
		await t.page.locator('#rmVoices [data-voice="round1"]').click();
		const open = await t.page.evaluate(async () => { let m = 0; const t0 = performance.now(); while (performance.now() - t0 < 1400) { m = Math.max(m, window.PipSound.mouth().open); await new Promise((r) => setTimeout(r, 16)); } return { m, take: window.PipSound.voices().find((v) => v.chosen).id }; });
		await t.check(`choosing a take says the line in it, and Pip's mouth opens (${open.m.toFixed(2)})`, open.m > 0.25 && open.take === 'round1', JSON.stringify(open));
		await t.page.locator('#rmVoices [data-voice=""]').click(); await sleep(2600);
		// a busy click: everything one Continue can set off
		await t.page.evaluate(() => { window.PipSound.trace = []; });
		await t.page.locator('#rmEvents [data-ev="busy"]').click(); await sleep(1500);
		const busy = await t.page.evaluate(() => { const tr = window.PipSound.trace, p = tr.filter((e) => e.kind === 'play'); return { asked: p.length, heard: p.filter((e) => e.ok).map((e) => e.name), said: tr.filter((e) => e.kind === 'say').length }; });
		await t.check(`a busy click asks for ${busy.asked} sounds and ${busy.heard.length} are heard (${busy.heard.join(', ')}), then Pip speaks`, busy.asked >= 9 && busy.heard.length <= 4 && busy.said === 1, JSON.stringify(busy));
		await t.page.locator('#rmStop').click(); await sleep(400);
		await t.check('Stop stops the song', await t.page.evaluate(() => !window.PipSound.transport().playing));
		const faults = await t.page.evaluate(() => ({ stage: window.__ppxErrors || [], sound: window.PS5.errors }));
		await t.check('no fault caught in the sound or the stage additions', faults.stage.length === 0 && faults.sound.length === 0, JSON.stringify(faults).slice(0, 900));
		for (const w of [1440, 900, 390]) {
			await t.viewport(w, 900); await sleep(700);
			// NieR's decorative data column scrolls through its clip on purpose (the PM7 kit exempts the same group)
			await t.noOverflow(`no overflow at ${w}`, { noSideways: true, ignore: ['svg.pst-svg g.st-data', 'svg.pst-svg g.st-data text'] });
			const box = await t.page.evaluate(() => { const r = document.querySelector('.rm-stagebox').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; });
			await t.check(`at ${w} px Pip's area stands upright (${box.w}x${box.h})`, box.h > box.w * 1.15 && box.w >= 240, JSON.stringify(box));
			if (t.args.shots) await t.shot(`room-${w}`, `the listening room at ${w} px`);
		}
	}
};
