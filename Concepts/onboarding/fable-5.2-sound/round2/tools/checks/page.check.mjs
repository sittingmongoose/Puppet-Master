// The onboarding window with round two's sound. It loads clean; sound starts only after a real gesture; the song goes
// on across every screen and chapter and never starts again; one click never sets off a pile of sounds; the sound menu
// does what it shows; the stage's additions write next to nothing while they move; Pip's mouth moves when it talks.
//   browser-check run tools/checks/page.check.mjs [--set looks=friendly-dark,nier-light] [--set shots=1] [--set trace=/abs/walk.json] [--set pace=5]
// trace: writes the walk it made (every sound the page asked for, with its moment) as a render spec, so
// render.check.mjs --set trace=... can play the same walk back offline, for measuring and for a listener.
import fs from 'node:fs';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KIT = (look) => (look === 'retro-dark' ? 'phosphor' : look === 'retro-light' ? 'teletype' : look.split('-')[0]);
export const tests = {
	async 'onboarding'(t) {
		const looks = t.args.looks ? String(t.args.looks).split(',') : ['friendly-dark'];
		// --set page=file:///abs/pip-sound2-onboarding.html checks a single-file build (with --sandbox, as T3's viewer shows it)
		await t.goto(String(t.args.page || 'onboarding.html'));
		await t.page.waitForFunction(() => !!(window.__ob && window.PipSound && window.PipSoundMenu && window.__ob.stage()));
		const before = await t.evaluateNoGesture(() => ({ unlocked: window.PipSound.unlocked, ctx: !!window.PipSound.ctx }));
		await t.check('no sound before a gesture (not unlocked, no audio context)', before.unlocked === false && before.ctx === false, JSON.stringify(before));
		await t.page.evaluate(() => { window.__starts = []; window.PipSound.on('music', (m) => { if (m.on) window.__starts.push(m.song); }); });
		await t.page.mouse.click(700, 500);
		await t.page.waitForFunction(() => window.PipSound.unlocked && window.PipSound.ctx && window.PipSound.ctx.state === 'running', null, { timeout: 8000 });
		await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
		await t.check('the tune starts after the first click', true);
		// sound really leaves the page: the analyser on the output sees a signal, and the scheduler stays ahead of the clock
		const live = await t.page.evaluate(async () => { const P = window.PipSound, an = P.analyser(), buf = new Uint8Array(an.fftSize); let dev = 0, late = 0; const t0 = performance.now(); while (performance.now() - t0 < 3000) { an.getByteTimeDomainData(buf); for (let i = 0; i < buf.length; i++) dev = Math.max(dev, Math.abs(buf[i] - 128)); const pl = P.session.player; if (pl && pl.playing && pl.barT < P.ctx.currentTime) late++; await new Promise((r) => setTimeout(r, 30)); } return { dev, late }; });
		await t.check(`the output carries the tune (analyser peak ${live.dev} of 128) and no bar was scheduled late (${live.late})`, live.dev >= 1 && live.late === 0, JSON.stringify(live));

		/* ---- the walk: every screen, with the things a person does on the way. One song, from the first bar to the last. */
		const look0 = looks[0];
		await t.page.evaluate((l) => { const o = window.__ob; o.S.theme = l; o.applyTheme(); o.go('welcome', { back: true }); }, look0);
		await sleep(1600);
		await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
		const start = await t.page.evaluate(() => { const P = window.PipSound; window.__p0 = P.session.player; window.__starts.length = 0; P.trace = []; return { t0: P.ctx.currentTime, song: P.song().id, bar0: P.session.player.barN, kit: P.kit, index: P.session.index, chapter: P.session.chapter, asleep: P.session.asleep }; });
		const flow = await t.page.evaluate(() => window.__ob.FLOW);
		// how long the person stays on a screen: a second and a half to get through quickly; --set pace=5 walks as a person would
		const pace = t.args.pace ? +t.args.pace * 1000 : 1500;
		for (const sc of flow) {
			if (sc === 'look') continue;                              // (choosing another look changes the song, on purpose: checked below)
			await t.page.evaluate((x) => window.__ob.go(x), sc);
			await sleep(sc === 'creating' ? 6500 : sc === 'ai' ? 4200 : sc === 'ready' ? 3800 : pace);
			const choice = t.page.locator('#obMain .ob-choice[aria-checked="false"]').first();
			if (await choice.count()) { await choice.click(); await sleep(Math.max(1300, pace * 0.6)); }
			if (sc === 'name') { const f = t.page.locator('#obName'); await f.click(); await f.fill(''); await f.pressSequentially('Tastebook two', { delay: 45 }); await sleep(500); }
		}
		const walk = await t.page.evaluate(() => { const P = window.PipSound, p = P.session.player; return { same: p === window.__p0, playing: p && p.playing, barN: p ? p.barN : -1, starts: window.__starts.slice(), trace: P.trace.slice(), t1: P.ctx.currentTime, faults: { stage: window.__ppxErrors || [], sound: window.PS5.errors.slice() } }; });
		await t.check(`the song went on through all ${flow.length - 1} screens: the same player, ${walk.barN - start.bar0} bars on, never started again (starts: ${walk.starts.length})`, walk.same && walk.playing && walk.starts.length === 0 && walk.barN > start.bar0 + 8, JSON.stringify({ same: walk.same, starts: walk.starts, barN: walk.barN }));
		// one sound per moment: how many of the window's and the stage's sounds began inside any 0.3 s
		const plays = walk.trace.filter((e) => e.kind === 'play' && e.ok && !/^(key|hover|decode|score|lock|swing|snore)$/.test(e.name));
		let worst = 0, at = null; plays.forEach((e, i) => { let n = 0; for (let j = i; j < plays.length && plays[j].t - e.t < 0.3; j++) n++; if (n > worst) { worst = n; at = plays.slice(i, i + n).map((x) => x.name).join('+') + ' @' + (e.t - start.t0).toFixed(1) + ' s'; } });
		const asked = walk.trace.filter((e) => e.kind === 'play').length, dropped = walk.trace.filter((e) => e.kind === 'play' && !e.ok).length;
		await t.check(`no pile of sounds: at most ${worst} began inside any 0.3 s (${at}); of ${asked} asked for, ${dropped} gave way to a more important one`, worst <= 3, at);
		await t.check('the walk ran with no fault caught in the sound or the stage additions', walk.faults.stage.length === 0 && walk.faults.sound.length === 0, JSON.stringify(walk.faults).slice(0, 900));
		if (t.args.trace) {
			const script = [{ at: 0, index: start.index, chapter: start.chapter, asleep: start.asleep }];
			walk.trace.forEach((e) => { const at = +(e.t - start.t0 + 0.6).toFixed(3); if (e.kind === 'play') script.push({ at, play: e.name, op: e.op }); else if (e.kind === 'say') script.push({ at, say: e.text, mood: e.mood }); else script.push({ at, index: e.index, chapter: e.chapter, asleep: e.asleep }); });
			fs.writeFileSync(String(t.args.trace), JSON.stringify({ name: `${start.kit}-walk`, kit: start.kit, song: start.song, seconds: Math.ceil(walk.t1 - start.t0 + 3), chapter: start.chapter, index: start.index, asleep: start.asleep, vol: { music: 0.5, voice: 1, sfx: 1 }, script }));
			t.log(`wrote the walk: ${script.length} events over ${(walk.t1 - start.t0).toFixed(0)} s`);
		}

		/* ---- the sound menu */
		await t.page.evaluate(() => window.__ob.go('where', { back: true })); await sleep(1500);
		await t.page.locator('.ob-head .ob-sound').click();
		await t.page.waitForSelector('#psmMenu:not([hidden])');
		const menu = await t.page.evaluate(() => { const m = document.querySelector('#psmMenu'), r = m.getBoundingClientRect(), a = document.querySelector('.ob-head .ob-sound').getBoundingClientRect(); return { songs: [...m.querySelectorAll('[data-psm-song]')].map((b) => ({ id: b.dataset.psmSong, name: b.querySelector('.psm-name').textContent, chosen: b.getAttribute('aria-checked') === 'true', def: !!b.querySelector('.psm-meta') })), sliders: [...m.querySelectorAll('[data-psm-vol]')].map((x) => x.dataset.psmVol + '=' + x.value), under: r.top >= a.bottom - 1 && Math.abs(r.right - a.right) < 40, inside: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, expanded: document.querySelector('.ob-head .ob-sound').getAttribute('aria-expanded'), w: Math.round(r.width) }; });
		await t.check(`the speaker drops the menu under itself, on the page (${menu.w} px wide)`, menu.under && menu.inside && menu.expanded === 'true', JSON.stringify(menu));
		await t.check(`it lists the look's four songs, the default chosen: ${menu.songs.map((s) => s.name + (s.chosen ? '*' : '')).join(', ')}`, menu.songs.length === 4 && menu.songs.filter((s) => s.chosen).length === 1 && menu.songs.find((s) => s.chosen).def, JSON.stringify(menu.songs));
		await t.check(`three levels: ${menu.sliders.join(', ')}`, menu.sliders.length === 3 && menu.sliders[0] === 'music=50');
		if (t.args.shots) { await sleep(450); /* the menu has finished dropping in */ } if (t.args.shots) await t.shot('menu-open', `the sound menu open under the window's speaker (${look0})`);
		const other = menu.songs.find((s) => !s.chosen);
		await t.page.locator(`#psmMenu [data-psm-song="${other.id}"]`).click();
		await t.page.waitForFunction((id) => window.PipSound.song().id === id && window.PipSound.transport().playing, other.id, { timeout: 12000 });
		await sleep(900);
		const picked = await t.page.evaluate(() => ({ id: window.PipSound.song().id, marked: document.querySelector('#psmMenu [data-psm-song][aria-checked="true"]').dataset.psmSong, bars: !!document.querySelector('#psmMenu [data-playing] .psm-bars') }));
		await t.check(`choosing “${other.name}” puts it on and marks it`, picked.id === other.id && picked.marked === other.id && picked.bars, JSON.stringify(picked));
		await t.page.locator('#psmMenu [data-psm-vol="music"]').fill('30');
		await t.page.locator('#psmMenu [data-psm-juke]').click();
		const set = await t.page.evaluate(() => ({ vol: window.PipSound.volume('music'), juke: window.PipSound.jukebox, skip: !document.querySelector('#psmMenu [data-psm-skip]').hidden, stored: (() => { try { return JSON.parse(localStorage.getItem('pipSound.r2') || '{}'); } catch (e) { return null; } })() }));
		// (in T3's sandboxed frame there is no storage to remember in: there the choice has to hold for the visit, and nothing may throw)
		const kept = set.stored === null ? !!t.sandboxed : set.stored.jukebox === true && Math.abs(set.stored.vol.music - 0.3) < 0.01;
		await t.check(`the music slider and the jukebox switch set what they say, and it is ${set.stored === null ? 'kept for the visit (no storage in a sandboxed frame)' : 'remembered'}`, Math.abs(set.vol - 0.3) < 0.01 && set.juke === true && set.skip && kept, JSON.stringify(set));
		await t.page.locator('#psmMenu [data-psm-skip]').click();
		await t.page.waitForFunction((id) => window.PipSound.song().id !== id && window.PipSound.transport().playing, other.id, { timeout: 12000 });
		await t.check('Next song moves the jukebox on', true);
		await t.page.locator('#psmMenu [data-psm-juke]').click();
		await t.page.locator('#psmMenu [data-psm-sound="off"]').click(); await sleep(400);
		const off = await t.page.evaluate(() => ({ playing: window.PipSound.transport().playing, muted: window.PipSound.muted }));
		await t.check('Off stops the tune', off.muted && off.playing === false);
		await t.page.locator('#psmMenu [data-psm-sound="on"]').click();
		await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
		await t.page.keyboard.press('Escape');
		await t.check('Escape closes the menu', await t.page.evaluate(() => document.querySelector('#psmMenu').hidden && document.querySelector('.ob-head .ob-sound').getAttribute('aria-expanded') === 'false'));
		// the app's own speaker, beside the theme picker, opens the same menu once the window is closed
		await t.page.locator('.ob-close').click(); await sleep(900);
		await t.page.locator('.sh-tools .ob-sound').click();
		const app = await t.page.evaluate(() => { const m = document.querySelector('#psmMenu'), r = m.getBoundingClientRect(), a = document.querySelector('.sh-tools .ob-sound').getBoundingClientRect(); return { open: !m.hidden, under: r.top >= a.bottom - 1, right: Math.abs(r.right - a.right) < 40, songs: m.querySelectorAll('[data-psm-song]').length }; });
		await t.check('in the app\'s bar, beside the theme picker, the speaker opens the same menu', app.open && app.under && app.right && app.songs === 4, JSON.stringify(app));
		if (t.args.shots) { await sleep(450); } if (t.args.shots) await t.shot('menu-app', 'the sound menu under the app\'s speaker, beside the theme picker');
		await t.page.keyboard.press('Escape');
		await t.page.locator('#resumePill').click(); await sleep(1200);
		await t.page.evaluate(() => { window.PipSound.setSong(window.PS5.DEFAULT_SONG[window.PipSound.kit]); window.PipSound.volume('music', 0.5); });

		/* ---- every look: its own song, its stage, what the additions cost, and Pip's mouth */
		for (const look of looks) {
			await t.page.evaluate((l) => { const o = window.__ob; o.S.theme = l; o.applyTheme(); o.go('where', { back: true }); }, look);
			await t.page.waitForFunction((k) => { const P = window.PipSound, tr = P.transport(); return P.kit === k && tr.playing && String(tr.song).endsWith('-' + k); }, KIT(look), { timeout: 15000 });
			await sleep(2600);
			const s = await t.page.evaluate(async () => {
				const P = window.PipSound, st = window.__ob.stage(), X = st.px;
				// what the additions write while a song plays: every change to their own layers for two seconds
				let writes = 0; const mo = new MutationObserver((list) => { writes += list.length; });
				[X.gDeco, X.gLight, X.gSet, X.gFront, X.gNotes].forEach((g) => mo.observe(g, { subtree: true, attributes: true, childList: true, characterData: true }));
				await new Promise((r) => setTimeout(r, 2000)); mo.disconnect();
				const crank = document.querySelector('.ppx-crank');
				return { tr: P.transport(), song: P.song().id, def: window.PS5.DEFAULT_SONG[P.kit], deco: X.gDeco.childElementCount, box: !!crank, crankTurns: crank ? crank.getAnimations().length : 0, running: X.anims.filter((a) => a.playState === 'running').length, writes, mouth: !!st.pxMouth, viz: !!(X.scope || X.spec) };
			});
			await t.check(`${look}: its default song is on (${s.tr.song})`, s.tr.playing && s.song === s.def, JSON.stringify(s.tr));
			await t.check(`${look}: the stage has its extra layers${s.box ? ', the music box and a turning crank' : ''} (${s.running} animations in time with the song)`, s.mouth && (s.deco > 0 || look.startsWith('glass')) && s.running >= 1 && (!s.box || s.crankTurns === 1), JSON.stringify(s));
			// a floating note changes a fill now and then; the sound's own picture is redrawn about twelve times a second
			await t.check(`${look}: the additions wrote ${s.writes} times in two seconds${s.viz ? ' (the sound\'s own line or bars are redrawn)' : ''}`, s.writes <= (s.viz ? 34 : 8), JSON.stringify(s));
			await t.page.evaluate(() => window.__ob.stage().sayNow('Right here works great, shall we go on?', 'happy'));
			const open = await t.page.evaluate(async () => { let m = 0; const t0 = performance.now(); while (performance.now() - t0 < 1500) { m = Math.max(m, window.PipSound.mouth().open); await new Promise((r) => setTimeout(r, 16)); } return m; });
			await t.check(`${look}: Pip's mouth opens while it talks (${open.toFixed(2)})`, open > 0.3);
			if (t.args.shots) await t.crop(`${look}-where`, '#obWin', `${look}: the window on The computer`);
			if (t.args.shots) await t.crop(`${look}-stage`, '#obStage', `${look}: Pip's stage`);
			if (t.args.shots && s.box) {
				// the music box four times over, large, with its crank at four moments of one turn (up, half up, half down, down)
				await t.page.evaluate(() => {
					const box = document.querySelector('.ppx-box'), svg = box.ownerSVGElement, NS = 'http://www.w3.org/2000/svg', o = document.createElementNS(NS, 'svg');
					o.id = 'ppxLook'; o.setAttribute('viewBox', '-45 -50 420 80'); o.setAttribute('style', 'position:fixed;left:20px;top:60px;width:1260px;height:240px;z-index:99999;background:' + (getComputedStyle(document.body).getPropertyValue('--bg') || '#222'));
					const defs = svg.querySelector('defs'); if (defs) o.appendChild(defs.cloneNode(true));
					[1, 0.5, -0.5, -1].forEach((sy, i) => { const c = box.cloneNode(true); c.setAttribute('transform', 'translate(' + (i * 105) + ' 0)'); const k = c.querySelector('.ppx-crank'), kn = c.querySelector('.ppx-knob'); k.getAnimations().forEach((a) => a.cancel()); kn.getAnimations().forEach((a) => a.cancel()); k.style.transform = 'scaleY(' + sy + ')'; kn.style.transform = 'translateY(' + (12 - 12 * sy) + 'px)'; const pl = c.querySelector('.ppx-pulse'); if (pl) pl.style.transform = 'none'; o.appendChild(c); });
					document.body.appendChild(o);
				});
				await t.crop(`${look}-box`, '#ppxLook', `${look}: the music box, its crank at four moments of a turn (up, half up, half down, down)`);
				await t.page.evaluate(() => document.querySelector('#ppxLook').remove());
			}
		}
		const faults = await t.page.evaluate(() => ({ stage: window.__ppxErrors || [], sound: window.PS5.errors }));
		await t.check('no fault caught in the sound or the stage additions', faults.stage.length === 0 && faults.sound.length === 0, JSON.stringify(faults).slice(0, 900));
	}
};
