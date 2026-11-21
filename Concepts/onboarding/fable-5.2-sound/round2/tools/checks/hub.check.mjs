// Through the shared Concept Hub (CONCEPT_RULES 9): the folder is in the Hub's catalog, its pages load over the Hub's
// server, and they follow the Hub's theme and Reduced Motion messages.
//   python3 -u Concepts/ConceptHub/server.py --port 0 --no-browser --no-runtime-state   (prints its address)
//   browser-check run tools/checks/hub.check.mjs --set hub=http://127.0.0.1:<port>
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = {
	async 'hub'(t) {
		const hub = String(t.args.hub || '').replace(/\/$/, ''); if (!hub) throw new Error('--set hub=http://127.0.0.1:<port> is required');
		const cat = await (await fetch(hub + '/api/catalog')).json();
		const me = (cat.models || []).find((m) => /fable-5\.2-sound/.test(String(m.folder || m.id || '')));
		await t.check('the Hub lists the folder', !!me, JSON.stringify((cat.models || []).map((m) => m.folder).filter((f) => /onboarding/.test(f))));
		if (!me) return;
		// one folder for the model, both rounds in its one manifest: round two's listening room is the folder's workspace,
		// its onboarding window an entry, and round one's four pages stay listed beside them
		const ids = (me.entries || []).map((e) => e.id), ws = me.workspace || {};
		const r1 = ['sound-round-1-room', 'sound-1-encore', 'sound-2-house-band', 'sound-3-marionette-theatre'];
		await t.check(`round two's listening room is the workspace (${ws.path}) and its onboarding window an entry; round one's four pages are still listed (${ids.join(', ')})`,
			ws.path === 'round2/index.html' && ids.includes('sound-round-2-onboarding') && r1.every((id) => ids.includes(id)) && ids.length === 5 && me.broken === false && !(me.entries || []).some((e) => e.broken), JSON.stringify(me).slice(0, 600));
		const base = hub + '/concepts/onboarding/fable-5.2-sound/round2/';
		await t.page.goto(base + 'onboarding.html?hub=1');
		await t.page.waitForFunction(() => !!(window.__ob && window.PipSound && window.PipSoundMenu && window.__ob.stage()));
		await t.visible('[data-concept-model="Fable 5.2"]', 'the onboarding page names the model at the top');
		await t.page.mouse.click(700, 500);
		await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
		await t.check('the song plays over the Hub', true);
		// what the Hub sends a page: a look and Reduced Motion
		await t.page.evaluate(() => window.postMessage({ source: 'pm-concept-hub', type: 'pm-concept-state', state: { theme: 'glass-light', reducedMotion: true } }, '*'));
		await t.page.waitForFunction(() => document.body.dataset.theme === 'glass-light' && window.__ob.stage().reduced === true && window.PipSound.kit === 'glass', null, { timeout: 6000 });
		await t.page.waitForFunction(() => { const tr = window.PipSound.transport(); return tr.playing && /-glass$/.test(tr.song); }, null, { timeout: 15000 });
		await t.check('it follows the Hub\'s look and Reduced Motion: Glass\'s song comes on, and nothing in time with it moves', await t.page.evaluate(() => window.__ob.stage().px.anims.length === 0));
		await t.page.evaluate(() => window.postMessage({ source: 'pm-concept-hub', type: 'pm-concept-state', state: { theme: 'friendly-dark', reducedMotion: false } }, '*'));
		await t.page.goto(base + 'index.html?hub=1');
		await t.page.waitForFunction(() => !!(window.__room && window.__room.stage()));
		await t.visible('[data-concept-model="Fable 5.2"]', 'the listening room names the model');
		// the Hub's own page shows one topic at a time: this folder is under Onboarding
		await t.page.goto(hub + '/');
		await t.page.locator('.topic-tab[data-topic="onboarding"]').click({ timeout: 15000 });
		await t.page.waitForFunction(() => /round two/i.test(document.body.innerText) && /listening room/i.test(document.body.innerText), null, { timeout: 15000 });
		await t.check('the Hub\'s Onboarding page shows round two and its listening room', true);
		if (t.args.shots) { await sleep(3500); await t.shot('hub-onboarding', 'the Hub\'s Onboarding topic with this folder\'s cards'); }
	}
};
