// Through the shared Concept Hub (CONCEPT_RULES 9): the folder is in the Hub's catalog, its pages load over the Hub's
// server, they follow the Hub's theme and Reduced Motion messages, and "Today" loads PMConcept7's sound for comparison.
//   python3 Concepts/ConceptHub/server.py --port 0 --no-browser --no-runtime-state   (prints its address)
//   browser-check run tools/checks/hub.check.mjs --set hub=http://127.0.0.1:<port>
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = {
	async 'hub'(t) {
		const hub = String(t.args.hub || '').replace(/\/$/, ''); if (!hub) throw new Error('--set hub=http://127.0.0.1:<port> is required');
		const cat = await (await fetch(hub + '/api/catalog')).json();
		const me = (cat.models || []).find((m) => /fable-5\.2-sound/.test(String(m.folder || m.id || '')));
		await t.check('the Hub lists the folder', !!me, JSON.stringify((cat.models || []).map((m) => m.folder).filter((f) => /onboarding/.test(f))));
		if (!me) return;
		const ids = (me.entries || []).map((e) => e.id);
		await t.check(`three concepts and the listening room in the catalog (${ids.join(', ')})`, ids.length === 3 && !!me.workspace, JSON.stringify(me).slice(0, 400));
		const base = hub + '/concepts/onboarding/fable-5.2-sound/';
		for (const [page, id] of [['concept-1.html', 'c1'], ['concept-2.html', 'c2'], ['concept-3.html', 'c3']]) {
			await t.page.goto(base + page + '?hub=1');
			await t.page.waitForFunction(() => !!(window.__ob && window.PipSound && window.__ob.stage()));
			await t.visible('[data-concept-model="Fable 5.2"]', `${page}: the model is named at the top`);
			await t.page.mouse.click(700, 500);
			await t.page.waitForFunction(() => window.PipSound.transport().playing, null, { timeout: 12000 });
			await t.equal(`${page}: plays its own concept over the Hub`, await t.page.evaluate(() => window.PipSound.concept), id);
			// what the Hub sends a page: a look and Reduced Motion
			await t.page.evaluate(() => window.postMessage({ source: 'pm-concept-hub', type: 'pm-concept-state', state: { theme: 'glass-light', reducedMotion: true } }, '*'));
			await t.page.waitForFunction(() => document.body.dataset.theme === 'glass-light' && window.__ob.stage().reduced === true && window.PipSound.kit === 'glass', null, { timeout: 6000 });
			await t.check(`${page}: follows the Hub's look and Reduced Motion (the tune changes with the look, and keeps playing)`, await t.page.evaluate(() => new Promise((r) => setTimeout(() => r(window.PipSound.transport().playing && /-glass$/.test(window.PipSound.transport().song)), 2500))));
			await t.page.evaluate(() => window.postMessage({ source: 'pm-concept-hub', type: 'pm-concept-state', state: { theme: 'friendly-dark', reducedMotion: false } }, '*'));
			await sleep(400);
		}
		// PMConcept7's sound today, for comparison
		await t.page.locator('#conceptSeg [data-concept="orig"]').click();
		await t.page.waitForFunction(() => !!window.PipSoundOriginal && window.PipSound.concept === 'orig', null, { timeout: 8000 });
		const o = await t.page.evaluate(() => ({ mine: typeof window.PipSound.setConcept, stored: (() => { try { return localStorage.getItem('pip-sound:muted'); } catch (e) { return 'n/a'; } })(), playing: window.PipSound.transport().playing }));
		await t.check('"Today" loads the Pip concept\'s sound, stops this one, and writes nothing to its storage', o.mine === 'function' && o.playing === false && (o.stored === null || o.stored === 'n/a'), JSON.stringify(o));
		await t.page.goto(base + 'index.html?hub=1');
		await t.page.waitForFunction(() => !!(window.__room && window.__room.stage()));
		await t.visible('[data-concept-model="Fable 5.2"]', 'the listening room names the model');
		// the Hub's own page shows one topic at a time: this folder is under Onboarding
		await t.page.goto(hub + '/');
		await t.page.locator('.topic-tab[data-topic="onboarding"]').click({ timeout: 15000 });
		await t.page.waitForFunction(() => /Fable 5\.2/i.test(document.body.innerText) && /listening room/i.test(document.body.innerText), null, { timeout: 15000 });
		await t.check('the Hub\'s Onboarding page shows the model and its listening room', true);
		if (t.args.shots) { await sleep(3500); await t.shot('hub-onboarding', 'the Hub\'s Onboarding topic with this folder\'s cards'); }
	}
};
