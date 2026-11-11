// Settings managers, rethought (Fable 5.2): what must stay true of the concept.
//   browser-check run Concepts/settings-managers/fable-5.2/tools --set page=<out>/settings-managers-app.html
// The page is PMConcept7 with the concept's layer inside (tools/build_standalone.py writes it).
const open = async (t) => {
	const errors = [];
	t.page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
	await t.viewport(1600, 1000);
	const f = await t.app.open(t, {});
	await t.until('the redesigned Settings is mounted', () => document.documentElement.getAttribute('data-smx-layer') === 'on' && !!window.SMX && window.SMX.booted, null, { timeout: 90000, hard: true });
	return { f, errors };
};
const fail = (msg) => { throw new Error(msg); };

/* The page a person opens is the review page: PMConcept7 in a frame, with a strip above it. This test runs only when
   that file is given: --set host=<out>/settings-managers.html */
const openHost = async (t) => {
	await t.viewport(1600, 1000);
	await t.page.goto('file://' + t.args.host, { waitUntil: 'commit', timeout: 120000 });   // 39 MB with PMConcept7 inside: do not wait for load
	const deadline = Date.now() + 120000;
	for (;;) {
		const frame = t.page.frames().find((f) => f !== t.page.mainFrame());
		let ok = false;
		try { ok = !!frame && await frame.evaluate(() => !!(window.SMX && window.SMX.booted)); } catch (e) { ok = false; }
		if (ok) return frame;
		if (Date.now() > deadline) fail('the redesign did not start inside the review page within two minutes');
		await t.page.waitForTimeout(500);
	}
};

export const tests = {
	async 'the review page: redesign and today at the same place, what changed, everything that moved'(t) {
		if (!t.args.host) return;
		const frame = await openHost(t);
		const top = t.page;
		const state = async () => frame.evaluate(() => ({ view: window.SMX.view, route: window.SMX.route, layer: window.SMX.layerOpen || '', ws: window.PM12_KIMI.getState().workspace, home: window.PM12_KIMI.getState().home }));
		await frame.evaluate(() => window.SMX.go('computers/away'));
		await top.waitForTimeout(600);
		await top.click('#changes');
		await top.waitForTimeout(600);
		let s = await state();
		const changes = await frame.evaluate(() => (document.querySelector('#smx-root .smx-layer') || {}).textContent || '');
		if (!/Manage|Set up|way in/i.test(changes)) fail('"What changed here" showed nothing about this page: ' + changes.slice(0, 120));
		await top.keyboard.press('Escape');
		await top.click('#moved');
		await top.waitForTimeout(900);
		const moved = await frame.evaluate(() => ({ rows: document.querySelectorAll('#smx-root .smx-layer tr').length, totals: (document.querySelector('#smx-root .smx-rv-totals') || {}).textContent || '' }));
		if (!/settings in PMConcept7/.test(moved.totals) || /still have none|drawn twice/.test(moved.totals)) fail('"Everything that moved" does not say that every setting has one place: ' + moved.totals.slice(0, 200));
		if (moved.rows < 10) fail(`"Everything that moved" lists only ${moved.rows} moved settings`);
		await frame.evaluate(() => window.SMX.closeLayer());
		await top.click('#view button[data-v="today"]');
		await top.waitForTimeout(1500);
		s = await state();
		if (s.view !== 'today' || s.home || s.ws !== 'servers') fail('"Today" did not show PMConcept7\'s own manager for this page: ' + JSON.stringify(s));
		await top.click('#view button[data-v="new"]');
		await top.waitForTimeout(900);
		s = await state();
		if (s.view !== 'new' || s.route !== 'computers/away') fail('"Redesign" did not come back to the same page: ' + JSON.stringify(s));
	},
	async 'every setting has one place, and every planned row is drawn'(t) {
		const { f, errors } = await open(t);
		const r = await f.evaluate(() => ({ c: window.SMX.coverage(), undrawn: window.SMX.undrawn() }));
		if (r.c.missing.length) fail(`${r.c.missing.length} settings have no place: ${r.c.missing.slice(0, 10).join(', ')}`);
		if (r.c.twice.length) fail(`${r.c.twice.length} settings are placed twice: ${r.c.twice.slice(0, 6).map((x) => x.join(' @ ')).join('; ')}`);
		if (r.undrawn.length) fail(`${r.undrawn.length} planned rows are not drawn: ${r.undrawn.slice(0, 10).map((x) => x[0] + ' › ' + x[1]).join('; ')}`);
		if (r.c.placed < 1000) fail(`only ${r.c.placed} settings placed; PMConcept7 has over 1,000`);
		if (errors.length) fail('page errors: ' + errors.join(' | '));
	},
	async 'every page draws'(t) {
		const { f, errors } = await open(t);
		const empty = await f.evaluate(async () => {
			const out = [];
			for (const p of window.SMX.pages) {
				if (p.id.includes(':')) continue;
				window.SMX.go(p.id, { replace: true });
				await new Promise((r) => setTimeout(r, 60));
				const page = document.querySelector('#smx-root .smx-page');
				if (!page || window.SMX.route !== p.id || !page.querySelector('.smx-block') || !page.querySelector('.smx-title').textContent.trim()) out.push(p.id);
			}
			return out;
		});
		if (empty.length) fail('pages that did not draw: ' + empty.join(', '));
		if (errors.length) fail('page errors: ' + errors.join(' | '));
	},
	async 'the look example stays in view while the choices scroll'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			window.SMX.go('look');
			await new Promise((res) => setTimeout(res, 900));
			const sc = document.querySelector('#smx-root .smx-scroll');
			sc.scrollTop = 900;
			await new Promise((res) => setTimeout(res, 300));
			const ex = document.querySelector('#smx-root .smx-lk-ex-stage');
			if (!ex) return { err: 'no example on the Look page' };
			const a = ex.getBoundingClientRect(), b = sc.getBoundingClientRect();
			return { scrolled: sc.scrollTop, top: Math.round(a.top - b.top), bottom: Math.round(b.bottom - a.bottom), tiles: document.querySelectorAll('#smx-root .wpk-tile').length };
		});
		if (r.err) fail(r.err);
		if (r.scrolled < 300) fail('the Look page did not scroll, so this proves nothing');
		if (r.top < -2 || r.bottom < -2) fail(`the example left the view after scrolling (top ${r.top}, bottom ${r.bottom})`);
		if (r.tiles < 20) fail(`the wallpaper gallery is missing (${r.tiles} tiles)`);
	},
	async 'Customize keeps its example beside one group of options and names a change'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const wait = (ms) => new Promise((res) => setTimeout(res, ms));
			window.SMX.go('look/editor');
			await wait(500);
			window.PM12_KIMI.dispatchAction('pm51-o55-editor-customize', {});
			await wait(1800);
			const root = [...document.querySelectorAll('.pmt-cz.pmed-cz')].find((x) => x.checkVisibility({ visibilityProperty: true, opacityProperty: true }) && x.getBoundingClientRect().width > 50);
			if (!root) return { err: 'the editor Customize dialog did not open' };
			root.querySelector('[data-jump="caret"]').click();
			await wait(300);
			const shown = [...root.querySelectorAll('.pmt-cz-group')].filter((g) => g.getBoundingClientRect().height > 0).map((g) => g.dataset.group);
			const opt = [...root.querySelectorAll('.pmt-cz-group[data-group="caret"] [data-key="caretBlink"]')].find((b) => b.getAttribute('aria-checked') !== 'true');
			opt.click();
			await wait(900);
			const pv = root.querySelector('.pmt-cz-preview').getBoundingClientRect();
			const body = root.querySelector('.pmt-cz-body');
			return { shown, said: root.querySelector('.smx-cz-said').textContent, pvTop: Math.round(pv.top), pvBottom: Math.round(pv.bottom), win: window.innerHeight, scroll: body.scrollHeight, client: body.clientHeight };
		});
		if (r.err) fail(r.err);
		if (r.shown.join(',') !== 'caret') fail('the options are not one group at a time: ' + r.shown.join(','));
		if (r.pvTop < 0 || r.pvBottom > r.win) fail(`the example is not in view (top ${r.pvTop}, bottom ${r.pvBottom}, window ${r.win})`);
		if (!/Blink|blink/.test(r.said)) fail('the line under the example does not name the change: ' + r.said);
		if (r.scroll > r.client * 3) fail(`one group still scrolls ${r.scroll} px in a ${r.client} px window`);
	},
	/* PMConcept7 keeps the detail it is swapping out in the page for a moment. A menu borrowed in that moment used to be
	   the menu of the thing shown before (2 of 3 times in this very test, before the fix). */
	async 'a borrowed menu belongs to the thing it was pressed for'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const S = window.SMX, wait = (ms) => new Promise((res) => setTimeout(res, ms));
			const specOf = S.warmers['computers-server-more'];
			if (!specOf) return { err: 'the Computers pages no longer borrow a menu under the name computers-server-more' };
			S.go('computers/list/this');
			await wait(600);
			const title = (document.querySelector('#smx-root .smx-title') || {}).textContent || '';
			const heads = [];
			for (let round = 0; round < 3; round++) {
				// the pointer rested on another computer's button first: its manager is showing that computer
				const other = document.createElement('button'); other.setAttribute('data-id', 'truenas');
				S.warm(specOf(other));
				await wait(900);
				const b = document.querySelector('#smx-root [data-smx-do="computers-server-more"]');
				if (!b) return { err: 'no "More actions" button on computers/list/this' };
				b.click();
				await wait(700);
				const m = document.querySelector('.pm51-popout.pm51-menu.is-open');
				heads.push(m ? (m.innerText || '').trim().split('\n')[0] : 'no menu');
				try { window.PM51.closePopouts(); } catch (e) { /* none open */ }
				await wait(1500);
			}
			return { title: title.trim(), heads, route: S.route };
		});
		if (r.err) fail(r.err);
		if (!r.title) fail('the page of this computer has no title to compare the menu with');
		const wrong = r.heads.filter((h) => h.toLowerCase() !== r.title.toLowerCase());
		if (wrong.length) fail(`pressed "More actions" for "${r.title}" three times; the menus were: ${r.heads.join(' | ')}`);
		if (r.route !== 'computers/list/this') fail('the page changed while the menus were opened: ' + r.route);
	},
	/* PMConcept7 goes Home a frame or more after it is asked. With slow frames the page used to jump to the manager a
	   menu had been borrowed from (3 of 3 times in this test, before the fix). A place the engine is SENT to is still
	   followed. */
	async 'the page stays put when the engine is handed back, and still follows a link'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const S = window.SMX, wait = (ms) => new Promise((res) => setTimeout(res, ms));
			const specOf = S.warmers['computers-server-more'];
			if (!specOf) return { err: 'the Computers pages no longer borrow a menu under the name computers-server-more' };
			const other = document.createElement('button'); other.setAttribute('data-id', 'truenas');
			const stays = [];
			for (let round = 0; round < 2; round++) {
				S.go('look');
				await wait(400);
				const raf = window.requestAnimationFrame;
				window.requestAnimationFrame = (fn) => setTimeout(() => raf(fn), 250);   // frames as slow as a busy page's
				S.warm(specOf(other));
				await wait(3500 + 700);                                                  // the warm-up cools down: the engine is handed back
				window.requestAnimationFrame = raf;
				await wait(900);
				stays.push(S.route + (window.PM12_KIMI.getState().home ? '' : ' (engine not parked)') + (S.borrowing ? ' (still borrowing)' : ''));
			}
			S.go('look');
			await wait(300);
			window.PM12_KIMI.navigate('ai', 'providers');
			await wait(900);
			const followed = S.route;
			S.go('home');
			await wait(300);
			window.PM12_KIMI.navigate('general', 'app-input', { detailSetting: 'general.visual.theme' });
			await wait(900);
			return { stays, followed, pointed: S.route, home: window.PM12_KIMI.getState().home };
		});
		if (r.err) fail(r.err);
		if (r.stays.some((x) => x !== 'look')) fail('the page did not stay on Look & feel after the engine was handed back: ' + r.stays.join(' | '));
		if (r.followed !== 'ai') fail('a link to PMConcept7\'s provider manager was not followed to the AI providers page: ' + r.followed);
		if (r.pointed !== 'look') fail('a link to the Theme setting was not followed to the page that holds it: ' + r.pointed);
		if (!r.home) fail('the engine was not parked again after following a link');
	}
};
