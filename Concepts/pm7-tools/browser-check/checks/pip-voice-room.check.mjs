// Pip's voice sits in its look's room (Jared, Q1 B): in a normal page and in a sandboxed iframe like T3's file preview
// (opaque origin, no storage). The six looks' kits (and so their rooms) are registered once the page has loaded; the
// one player's offline render has a tail with the room and none dry; a real click, then Pip's voice live, raises no
// page error.
//   browser-check run Concepts/pm7-tools/browser-check/checks/pip-voice-room.check.mjs [--set page=<build>]

// the page, or T3's sandbox at t.openInSandbox's default flags (an opaque origin, no storage, no modals), as the kit opens it
const frameFor = (t, mode) => t.app.open({ sandbox: mode === 'sandbox', settleMs: 1000 });
// a case runs on its own surface unless --set sandbox picks the other one
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

async function voiceRoom(t, mode) {
	const f = await frameFor(t, mode);
	const kits = await f.evaluate(() => (window.O55 && O55.sound && O55.sound.pip ? O55.sound.pip.kits() : []));
	await t.check('the six looks\' kits are registered (their rooms with them)', ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'].every((k) => kits.includes(k)), kits.join(' '));
	const r = await f.evaluate(async () => {
		const P = O55.sound.pip, out = {};
		for (const voice of ['glass', 'friendly', 'nier']) {
			const dry = await P.render('happy', { voice, dry: true }), room = await P.render('happy', { voice });
			const tail = (b) => { const d = b.getChannelData(0); let last = 0; for (let i = d.length - 1; i >= 0; i--) if (Math.abs(d[i]) > 0.001) { last = i; break; } return last / b.sampleRate; };
			out[voice] = { send: P.roomSend(voice), dryEnd: Math.round(tail(dry) * 100) / 100, roomEnd: Math.round(tail(room) * 100) / 100 };
		}
		return out;
	});
	t.log(JSON.stringify(r));
	await t.check('the room adds a tail (Glass, Friendly, NieR)', Object.values(r).every((v) => v.roomEnd > v.dryEnd + 0.2), JSON.stringify(r));
	await t.equal('sends', JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.send]))), JSON.stringify({ glass: 0.3, friendly: 0.35, nier: 0.16 }));
	// a real click (the first gesture), then Pip's voice live in the look's room
	const box = await f.evaluate(() => { const q = document.querySelector('#pmRoot .transcript').getBoundingClientRect(); return [q.left + 30, q.top + 30]; });
	await t.page.mouse.click(box[0], box[1]);
	await t.page.waitForTimeout(400);
	const live = await f.evaluate(async () => { const P = O55.sound.pip; const a = P.vocal('happy', { look: 'glass-dark' }); await new Promise((r) => setTimeout(r, 1200)); const s = P.say('Hello, I am Pip.', { look: 'glass-dark' }); await new Promise((r) => setTimeout(r, 1800)); return { allowed: P.allowed('setup'), vocal: a, say: s.played }; });
	t.log('live ' + JSON.stringify(live));
}

export const tests = {
	'voice room normal': on('normal', voiceRoom),
	'voice room sandbox': on('sandbox', voiceRoom)
};
