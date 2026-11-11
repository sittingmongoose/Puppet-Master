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
	},
	/* Saving one of PMConcept7's dialogs redraws its hidden page at the top of the chapter, where it names the first
	   manager. The page used to be thrown to that manager's page (Help & hints, from a sound's page). */
	async 'saving one of PMConcept7\'s dialogs keeps the page'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const S = window.SMX, wait = (ms) => new Promise((res) => setTimeout(res, ms));
			S.go('notifications/sounds');
			await wait(4500);   // the chapter makes its manager ready once, on first view
			const row = document.querySelector('#smx-root [data-smx-go^="notifications/sounds/"]');
			if (!row) return { err: 'no sound has a page of its own on notifications/sounds' };
			const route = row.getAttribute('data-smx-go');
			S.go(route);
			await wait(900);
			const edit = [...document.querySelectorAll('#smx-root button')].find((b) => /^(Attach the file again|Replace the file|Replace file|Edit)/.test(b.textContent.trim()));
			if (!edit) return { err: 'no button that opens the sound dialog on ' + route };
			edit.click();
			await wait(1200);
			const save = [...document.querySelectorAll('#pm-settings-portals .btn.primary')].find((b) => /^Save/.test(b.textContent.trim()));
			if (!save) return { err: 'the sound dialog did not open from "' + edit.textContent.trim() + '"' };
			const inp = document.querySelector('#pm-settings-portals input[type=file]');
			if (inp) { const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array(2048)], 'jingle.mp3', { type: 'audio/mpeg' })); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); }
			save.click();
			const seen = new Set();
			for (let i = 0; i < 25; i++) { await wait(100); const st = window.PM12_KIMI.getState(); seen.add(st.home ? 'home' : st.domain + '/' + st.workspace); }
			return { route, now: S.route, home: window.PM12_KIMI.getState().home, seen: [...seen] };
		});
		if (r.err) fail(r.err);
		if (r.now !== r.route) fail(`saving the sound dialog on ${r.route} threw the page to ${r.now} (the engine went through ${r.seen.join(', ')})`);
		if (!r.home) fail('the engine was not parked again after the dialog was saved: ' + r.seen.join(', '));
	},
	/* Review round 1 found a summary that said 2, the list under it 3, and chapter cards that counted differently again. */
	async 'what needs you is counted one way: Home, the chapter cards, the marks in the list, each chapter\'s own list'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const S = window.SMX, wait = (ms) => new Promise((res) => setTimeout(res, ms));
			const st = S.st(), all = S.needsAll(st), w = S.needWords(all), bad = [];
			S.go('home'); await wait(500);
			const q = (sel) => ((document.querySelector('#smx-root ' + sel) || {}).textContent || '').trim();
			if (all.length && !q('.smx-summary-lead').includes(w.title)) bad.push(`Home's first sentence does not say "${w.title}": ${q('.smx-summary-lead')}`);
			if (all.length && q('.smx-needs-title') !== w.title) bad.push(`Home's list is headed "${q('.smx-needs-title')}", the count is "${w.title}"`);
			const shown = document.querySelectorAll('#smx-root .smx-need').length, more = q('.smx-needs-more');
			if (shown !== Math.min(all.length, 5)) bad.push(`Home lists ${shown} of ${all.length} needs`);
			if (all.length > 5 && !more.startsWith(String(all.length - 5))) bad.push(`Home does not say how many more there are: "${more}"`);
			const ctx = { st, local: S.local };
			for (const c of S.chapters) {
				const mine = S.needWords(S.needsOf(c.id, st)), s = S.chapterStatus(c, ctx);
				if (mine.hard && (!s || s.text !== mine.short)) bad.push(`${c.id}: ${mine.hard} need you, its card says "${s ? s.text : ''}"`);
				const card = [...document.querySelectorAll('#smx-root .smx-chapter')].find((b) => b.getAttribute('data-smx-go') === c.id);
				if (mine.hard && card && !card.textContent.includes(mine.short)) bad.push(`${c.id}: the card on Home does not show "${mine.short}"`);
				const nav = document.querySelector(`#smx-root .smx-nav [data-smx-go="${c.id}"] .smx-nav-mark`);
				if (mine.hard && (!nav || nav.getAttribute('aria-label') !== mine.short)) bad.push(`${c.id}: the mark in the list says "${nav ? nav.getAttribute('aria-label') : 'nothing'}", not "${mine.short}"`);
			}
			const orphans = all.filter((n) => !n.chapter || !S.chapters.some((c) => c.id === n.chapter));
			if (orphans.length) bad.push('needs that belong to no chapter: ' + orphans.map((n) => n.title).join(' | '));
			// a chapter's first page: its sentence and its list say the same
			S.go('ai'); await wait(500);
			const ai = S.needWords(S.needsOf('ai', st));
			if (ai.hard + ai.soft) { if (q('.smx-needs-title') !== ai.title) bad.push(`AI providers lists "${q('.smx-needs-title')}", the count is "${ai.title}"`); if (!q('.smx-summary-lead').includes(ai.title)) bad.push('AI providers: the first sentence and the list disagree: ' + q('.smx-summary-lead')); }
			const two = [...document.querySelectorAll('#smx-root .smx-need')].filter((n) => n.querySelectorAll('button.btn').length > 1).length;
			if (two) bad.push(`${two} needs on AI providers carry two buttons`);
			return { bad, total: all.length };
		});
		if (r.bad.length) fail(r.bad.join(' || '));
	},
	async 'a provider and its accounts tell one story; a job that follows the everyday model is not counted as its own'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const S = window.SMX, wait = (ms) => new Promise((res) => setTimeout(res, ms)), bad = [];
			const st = S.st();
			for (const p of S.d.providers(st)) {
				if (S.d.providerState(p) !== 'Needs sign-in') continue;
				S.go('ai/provider/' + p.id); await wait(350);
				const page = document.querySelector('#smx-root .smx-page'), text = page.innerText;
				if (/signed in as|\b[1-9]\d* accounts? in use/i.test((page.querySelector('.smx-summary-lead') || {}).textContent || '')) bad.push(`${p.name} needs sign-in, and its first sentence says it is signed in or in use`);
				if ([...page.querySelectorAll('.smx-accounts .smx-thing')].some((x) => /\bReady\b/.test(x.textContent))) bad.push(`${p.name} needs sign-in, and one of its accounts reads "Ready"`);
				if (!text) bad.push(p.name + ' drew nothing');
			}
			S.go('ai/models'); await wait(600);
			const said = (document.querySelector('#smx-root [data-smx-block="main-jobs-head"] .smx-summary-lead') || {}).textContent || '';
			const ids = ['ai.models.overseer-model', 'ai.models.worker-model', 'ai.models.gui-worker-model', 'ai.models.high-effort-worker-model', 'ai.models.auditor-model', 'ai.models.goal-worker-model', 'ai.models.goal-verifier-model', 'ai.models.subagent-model', 'ai.models.teach-model', 'ai.models.thread-title-model'].filter(S.has);
			const own = ids.filter((id) => !/^\W*(same as|automatic|auto|default|inherit)/i.test(S.valueText(id)) && !/^\W*(same as|automatic|auto|default|inherit)/i.test(String(S.val(id) == null ? '' : S.val(id)))).length;
			const n = (said.match(/^(\d+) jobs? uses?/) || [])[1];
			if (own === 0 ? !/Every job uses the everyday model/.test(said) : Number(n) !== own) bad.push(`"Which model does what" says "${said.slice(0, 70)}", and ${own} of ${ids.length} jobs have a model of their own`);
			return { bad };
		});
		if (r.bad.length) fail(r.bad.join(' || '));
	},
	async 'a panel of PMConcept7\'s is closed by going somewhere; Escape puts the search results away from anywhere; a look chosen in the strip is the saved look'(t) {
		const { f } = await open(t);
		const r = await f.evaluate(async () => {
			const S = window.SMX, wait = (ms) => new Promise((res) => setTimeout(res, ms)), bad = [];
			const drawers = () => document.querySelectorAll('#pm-settings-portals .drawer-wrap.is-open:not([data-closing])').length;
			S.go('code/test-runs'); await wait(600);
			const run = document.querySelector('#smx-root .smx-page [data-action="pm51-testing-open-run"]');
			if (run) { run.click(); await wait(900); if (!drawers()) bad.push('a test run did not open its panel, so closing it proves nothing'); const nav = document.querySelector('#smx-root .smx-nav [data-smx-go="code/debug"]'); nav.click(); await wait(900); if (drawers()) bad.push('the panel of a test run stayed open over ' + S.route); }
			S.go('home'); await wait(300);
			const q = document.querySelector('#smx-root [data-smx-search]'); q.focus(); q.value = 'phone'; q.dispatchEvent(new Event('input', { bubbles: true })); await wait(200);
			if (S.layerOpen !== 'find') bad.push('typing in the search box showed no results');
			q.blur(); document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); await wait(200);
			if (S.layerOpen) bad.push('Escape left the search results open when the focus was not in the box');
			await S.setLook('glass-dark'); S.go('look'); await wait(900);
			if (!/^Glass/.test(String(S.val('general.visual.theme')))) bad.push('Glass chosen in the strip is not the saved look: ' + S.val('general.visual.theme'));
			if (!/Only for the Glass look|transparen/i.test(document.querySelector('#smx-root .smx-page').innerText)) bad.push('Look & feel does not show the Glass choices under Glass');
			const sw = [...document.querySelectorAll('#smx-root .smx-lk-sws button')][3]; if (sw) { sw.click(); await wait(1200); }
			if (document.documentElement.getAttribute('data-theme') !== 'glass-dark') bad.push('picking an accent threw the look back to ' + document.documentElement.getAttribute('data-theme'));
			await S.setLook('basic-dark'); await wait(500);
			if (!/^Basic/.test(String(S.val('general.visual.theme')))) bad.push('the look did not go back to Basic: ' + S.val('general.visual.theme'));
			return { bad };
		});
		if (r.bad.length) fail(r.bad.join(' || '));
	}
};
