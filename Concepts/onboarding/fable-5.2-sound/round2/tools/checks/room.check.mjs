// The listening room, round two: it loads clean and silent; a song is picked and played; the walk's six steps say what
// joins and bring it in; "Walk it for me" walks; the sound menu opens; Pip talks in each take of a voice; a busy click
// is one sound and then Pip; and the page stays inside the window at a desktop, a tablet and a phone width, with Pip's
// area upright in each.   --set shots=1 lists frames for viewing.
// --set page=file:///abs/pip-sound2-room.html checks a single-file build instead; with --sandbox, as T3's viewer shows
// it (the folder's own pages load their scripts as files, which a sandboxed frame refuses: only the single files open there).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = {
	async 'room'(t) {
		await t.goto(String(t.args.page || 'index.html'));
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
	},
	/* Nothing but the song. Every effect that actually sounds is counted from the moment the page loads (each gesture of
	   the effect set is wrapped), then a person's three ways in are tried. Found by ear (Jared, 20 Nov 2026: "a constant
	   de doo sound in the background", during a song and after Stop): on the Asleep step Pip went on snoring, two soft
	   falling notes every 3.8 s, and Play and Stop each set off the stage's chapter fanfare. */
	async 'nothing but the song'(t) {
		const open = async () => {
			await t.goto(String(t.args.page || 'index.html'));
			await t.page.waitForFunction(() => !!(window.__room && window.PipSound && window.PS5 && window.__room.stage()));
			await t.page.evaluate(() => {
				window.__heard = [];
				const wrap = (set, tag) => Object.keys(set).forEach((k) => { const f = set[k]; if (typeof f !== 'function') return; set[k] = function () { window.__heard.push(tag + k); return f.apply(this, arguments); }; });
				wrap(window.PS5.sfx.SET, ''); Object.keys(window.PS5.sfx.SPECIAL).forEach((n) => wrap(window.PS5.sfx.SPECIAL[n], n + ':'));
			});
		};
		const take = () => t.page.evaluate(() => window.__heard.splice(0));
		const silent = (ms) => t.page.evaluate(async (ms) => { const an = window.PipSound.analyser(), buf = new Uint8Array(an.fftSize); let dev = 0; const t0 = performance.now(); while (performance.now() - t0 < ms) { an.getByteTimeDomainData(buf); for (let i = 0; i < buf.length; i++) dev = Math.max(dev, Math.abs(buf[i] - 128)); await new Promise((r) => setTimeout(r, 50)); } return dev; }, ms);
		// 1. the room as it opens: Play, listen, Stop
		await open();
		await t.page.locator('#rmPlay').click();
		await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
		await sleep(9000);
		const playing = await take();
		await t.check(`Play sets off no fanfare, and Pip does not snore (heard while the song played: ${playing.join(', ') || 'only the song'})`, !playing.some((n) => /chapter|snore/.test(n)), JSON.stringify(playing));
		await t.page.locator('#rmStop').click(); await sleep(1200);
		const dev1 = await silent(8000), after1 = await take();
		await t.check(`Stop is silence: no effect follows it (${after1.join(', ') || 'none'}) and nothing reaches the output (peak ${dev1} of 128)`, after1.length === 0 && dev1 < 2, JSON.stringify({ after1, dev1 }));
		// 2. the Asleep step: Pip sleeps through the tune without a sound of its own, and after Stop too
		await open();
		await t.page.locator('#rmSteps [data-step="0"]').click(); await sleep(500);
		await t.page.locator('#rmPlay').click();
		await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
		await sleep(9000);
		const asleep = await t.page.evaluate(() => ({ z: !!window.__room.stage().sleepZ, song: window.PipSound.session.asleep })), slept = await take();
		await t.check(`on the Asleep step Pip is asleep and only the song is heard (${slept.join(', ') || 'only the song'})`, asleep.z && asleep.song === true && !slept.some((n) => /snore|chapter/.test(n)), JSON.stringify({ asleep, slept }));
		await t.page.locator('#rmStop').click(); await sleep(1200);
		const dev2 = await silent(9000), after2 = await take();
		await t.check(`after Stop on the Asleep step: no snore (${after2.join(', ') || 'none'}), a silent output (peak ${dev2} of 128)`, after2.length === 0 && dev2 < 2, JSON.stringify({ after2, dev2 }));
		// 3. changing the look while stopped: no fanfare either (the look's own signature is the page's to play)
		await t.page.locator('#rmLook').selectOption('glass-dark'); await sleep(1500);
		const looked = await take();
		await t.check(`a change of look while nothing plays sets off no fanfare (${looked.join(', ') || 'none'})`, !looked.some((n) => /chapter|snore/.test(n)), JSON.stringify(looked));
	},
	/* A level turns down what it names, echo and all. Found by ear (Jared, 21 Nov 2026: "the volume controls dont work,
	   they just make things sound more far away, not lower volume"): a sound's send to the room left before its level
	   and the room's return joined after it, so a slider took away the sound and left its echo at full. Measured two
	   ways: rendered, where a quarter of the level must be 12 dB less of everything and none must be nothing; and on
	   the page, where the menu's own sliders at nothing must leave nothing of a song in the largest room. */
	async 'a level turns it down'(t) {
		await t.goto(String(t.args.page || 'index.html'));
		await t.page.waitForFunction(() => !!(window.__room && window.PipSound && window.PS5 && window.__room.stage()));
		const r = await t.page.evaluate(async () => {
			const P = window.PipSound, MIX = window.PS5.MIX || { music: 0.85, voice: 1, sfx: 1 }, out = {};
			const rms = (b) => { let s = 0, n = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) s += d[i] * d[i]; n += d.length; } return Math.sqrt(s / n); };
			const what = { music: { kit: 'glass', seconds: 8, chapter: 4, index: 10 }, voice: { kit: 'nier', seconds: 5, music: false, script: [{ at: 0.2, say: 'Right here works great.', mood: 'happy' }] }, sfx: { kit: 'glass', seconds: 5, music: false, chapter: 2, script: [{ at: 0.2, play: 'confetti', op: { index: 1, count: 4 } }] } };
			for (const bus of Object.keys(what)) {
				const at = async (v) => rms(await P.render(Object.assign({ limit: false, vol: { [bus]: v } }, what[bus])));
				const full = await at(MIX[bus]), quarter = await at(MIX[bus] / 4), none = await at(0);
				out[bus] = { full: +full.toFixed(5), db: +(20 * Math.log10(quarter / full)).toFixed(2), none };
			}
			return out;
		});
		for (const [bus, name] of [['music', 'the music'], ['sfx', 'the effects'], ['voice', 'Pip']])
			await t.check(`${name}: a quarter of the level is ${r[bus].db} dB of the whole sound, room and all (12.04 dB less is exact), and none is silence`, r[bus].full > 0.001 && Math.abs(r[bus].db + 12.04) < 0.15 && r[bus].none < 1e-6, JSON.stringify(r[bus]));
		// on the page: a Glass song in its hall, then the menu's music slider drawn to nothing
		const level = (ms) => t.page.evaluate(async (ms) => { const an = window.PipSound.analyser(), buf = new Float32Array(an.fftSize); let s = 0, n = 0; const t0 = performance.now(); while (performance.now() - t0 < ms) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; n += buf.length; await new Promise((r) => setTimeout(r, 40)); } return Math.sqrt(s / Math.max(1, n)); }, ms);
		await t.page.locator('.rm-cell[data-k="glass"][data-song="waltz"]').click();
		await t.page.waitForFunction(() => window.PipSound.transport().playing && window.PipSound.transport().song === 'c3-glass', null, { timeout: 15000 });
		await t.page.locator('#rmSteps [data-step="5"]').click(); await sleep(5000);
		const loud = await level(4000);
		await t.page.locator('#rmSound').click();
		await t.page.waitForSelector('#psmMenu:not([hidden])');
		// (all three: while a song plays the stage has quiet sounds of its own, a string swinging, which are Effects)
		for (const k of ['music', 'sfx', 'voice']) await t.page.locator(`#psmMenu [data-psm-vol="${k}"]`).fill('0');
		await sleep(6000);   // (the hall rings for 2.3 s)
		const quiet = await level(5000), still = await t.page.evaluate(() => window.PipSound.transport().playing);
		await t.check(`the menu's three sliders at nothing leave nothing of a song still playing in Glass's hall (level ${loud.toFixed(4)} before, ${quiet.toFixed(6)} after)`, still && loud > 0.01 && quiet < loud / 1000, JSON.stringify({ loud, quiet, still }));
		await t.page.locator('#psmMenu [data-psm-vol="music"]').fill('42'); await sleep(6000);
		const half = await level(8000), db = 20 * Math.log10(half / loud);
		await t.check(`at half its starting level it is the same song about 6 dB down (${db.toFixed(1)} dB), not the same echo over less sound`, db < -3.5 && db > -9, JSON.stringify({ loud, half }));
		await t.page.keyboard.press('Escape');
		await t.page.locator('#rmStop').click();
	}
};
