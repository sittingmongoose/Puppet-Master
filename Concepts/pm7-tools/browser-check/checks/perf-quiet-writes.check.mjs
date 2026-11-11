// At rest nothing writes a value the page already holds, and nothing writes into what is not drawn (2026-11-10
// performance pass).
//
// Rewriting an attribute or a text with the value it has is not free: the element is restyled and every DOM watcher on
// the document wakes (PMConcept7 has seven document-wide MutationObservers), and their work asks for a frame. Before the
// pass the page did that about 20 times a second with nobody touching it:
//   status bar   48-work.js rewrote the bar's two work items, its work group and its stale mark every second with the
//                values they held (data-tone, data-ask, aria-expanded, the hover label, aria-label, hidden,
//                data-work-words: 14 writes a second on the first run, 2026-11-11);
//   notice age   19-notify.js rewrote the front notice's "2 m ago" every second;
//   Orchestrator pm6-js-orchestrator.js rewrote the fifteen elements of its header on every demo event, on every page,
//                while the Orchestrator page was not shown;
//   shelves      pm6-js-cozy-shelves.js counted into the Artifacts and Tests shelves' counters every second while
//                their rows were not drawn (a real new value each time, into something nobody sees).
//
// The check listens to the whole document for --set ms (default 12 s: two demo events) on Settings and on Home, with
// the pointer parked, and works out for every record the value that write left behind: an attribute or text record
// whose new value equals its old one, or a child list record that took nodes out and put the same ones back (what
// `el.textContent = same` and `el.innerHTML = same` do), is a same-value write. None may land in the three places above,
// and none at all in a shelf counter whose row has no box. Every other same-value write is listed in the log (NOTE)
// with its element and its count, so a new one is seen before it is a cost; and in a typical second (the median of
// the seconds listened to) at most --set others (default 2) of them land. The median, not the total: some redraws
// rewrite many values once (Home's Usage chart rewrote 208 path `d` attributes with the values they held in one beat,
// NieR Dark, 2026-11-11; the parked Customize screens rewrite about 170 attributes once after a look change). Those
// are logged with their totals and are on the performance list; a writer that rewrites every second, as the four
// above did, fails here. Then the Artifacts shelf is opened: the counter shows the current count in the first frame it
// is drawn and goes on counting.
//
// --set looks=<a,b>  default basic-dark,nier-dark (the writers do not depend on the look); looks=all for all ten
// --set settle=<ms>  wait after load (default 40000)
// Both surfaces. A place that is missing from the page fails as "could not judge", it does not pass.
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { DOM_LISTEN, DOM_READ } from '../helpers/dom-writes.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];

const PLACES = [
	['status', '#pm7GlobalStatusBar:has(.pm7-work-item)'],
	['notice', '.pmn-front-when'],
	['orchestrator', '#panel-orchestrator:not(.active)'],
	['art', '#artLiveElapsed'],
	['tst', '#tstLiveElapsed']
];
// which shelf counters' rows are drawn, and whether the Orchestrator page is in the page and shown
const STATE = () => {
	const drawn = (id) => { const c = document.getElementById(id), row = c && (c.closest('div') || c.parentElement); return { found: !!c, drawn: !!(row && row.getClientRects().length), text: c ? c.textContent : null }; };
	const orch = document.getElementById('panel-orchestrator');
	return { art: drawn('artLiveElapsed'), tst: drawn('tstLiveElapsed'), orchestrator: !!orch, orchestratorShown: !!(orch && orch.classList.contains('active')) };
};

export default async function (t) {
	const want = String(t.args.looks || 'basic-dark,nier-dark');
	const looks = want === 'all' ? ALL : want.split(',').filter(Boolean);
	const ms = Number(t.args.ms || 12000), othersMax = Number(t.args.others || 2);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));

	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		// 14 s, not 5: the terminal's and the editor's parked Customize screens redraw themselves, unseen, 3 to 10 s after a
		// look change (their settle, then an idle moment or their 10 s backstop), and that one redraw rewrites about 170
		// attributes with the values they hold (tabindex, hidden, the sliders' outputs: first run, 2026-11-11). It is a
		// burst per look change, not a rate at rest, so it must be over before the listening starts. It is logged by
		// --set lookSettle=5000 and is on the performance list as a fix of its own.
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 14000));
		for (const [view, pageId] of [['settings', 'settings'], ['home', 'dashboard']]) {
			await f.evaluate((id) => PM_PAGES.go(id), pageId);
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 5000));
			const st = await f.evaluate(STATE);
			await f.evaluate(DOM_LISTEN);
			await t.page.waitForTimeout(ms);
			const r = await f.evaluate(DOM_READ, PLACES);
			const at = `${look} ${view}`, per = (n) => (n / r.secs).toFixed(1) + '/s', P = r.places;
			t.log(`${at}: ${r.records} DOM records in ${r.secs.toFixed(1)} s (${per(r.records)}), ${r.same} same-value: status bar ${P.status.same}, notice age ${P.notice.same}, Orchestrator page ${P.orchestrator.same}, elsewhere ${r.otherSame} (per second ${r.otherPerSecond.join(' ')})`);
			for (const [k, n] of r.others) t.log(`  NOTE same-value write elsewhere x${n}: ${k}`);
			await t.check(`${at}: nothing in the status bar is rewritten with the value it holds`, P.status.found > 0 && P.status.same === 0, P.status.found ? `${P.status.same} same-value writes (${per(P.status.same)}) ${P.status.eg.join('; ')}` : 'no #pm7GlobalStatusBar with a .pm7-work-item: could not judge');
			await t.check(`${at}: the front notice's age is not rewritten with the text it holds`, P.notice.found > 0 && P.notice.same === 0, P.notice.found ? `${P.notice.same} same-value writes (${per(P.notice.same)}) ${P.notice.eg.join('; ')}` : 'no .pmn-front-when: could not judge');
			await t.check(`${at}: the Orchestrator page, not shown, is not rewritten with the values it holds`, st.orchestrator && !st.orchestratorShown && P.orchestrator.same === 0, !st.orchestrator ? 'no #panel-orchestrator: could not judge' : st.orchestratorShown ? 'the Orchestrator page is shown here: could not judge' : `${P.orchestrator.same} same-value writes (${per(P.orchestrator.same)}) ${P.orchestrator.eg.join('; ')}`);
			await t.check(`${at}: in a typical second at most ${othersMax} same-value writes land anywhere else`, r.otherMedian <= othersMax, `median ${r.otherMedian} a second; per second ${r.otherPerSecond.join(' ')}; ${r.otherSame} in all`);
			for (const [key, id] of [['art', 'artLiveElapsed'], ['tst', 'tstLiveElapsed']]) {
				const s = st[key];
				if (!s.found) { await t.check(`${at}: the shelf counter #${id} could be judged`, false, 'not in the page'); continue; }
				if (s.drawn) { t.log(`${at}: NOTE #${id}'s row is drawn here (${P[key].records} writes, text ${s.text}): the hidden-row rule is not judged in this view`); continue; }
				await t.check(`${at}: the shelf counter #${id} is not written while its row is not drawn`, P[key].records === 0, `${P[key].records} writes in ${r.secs.toFixed(1)} s, text ${s.text}`);
			}
		}
	}

	// the counter is current in the first frame its row is drawn, and counts on (lane A's zz-a-shelf, as a kit check)
	const r = await f.evaluate(() => new Promise((done) => {
		const el = document.getElementById('artLiveElapsed'), row = el && (el.closest('div') || el.parentElement);
		const icon = document.querySelector('[data-target="panel-artifacts"]');
		if (!el || !icon) return done({ err: !el ? 'no #artLiveElapsed' : 'no Artifacts rail icon' });
		const before = { text: el.textContent, drawn: !!(row && row.getClientRects().length) };
		const t0 = performance.getEntriesByType('navigation')[0].domContentLoadedEventStart, at = performance.now();
		icon.click();
		// the first painted frame: read in a task queued from the frame callback, after that frame's style, layout, observers and paint
		requestAnimationFrame(() => { const ch = new MessageChannel(); ch.port1.onmessage = () => {
			const first = el.textContent, drawn = !!(row && row.getClientRects().length);
			setTimeout(() => done({ before, first, drawn, later: el.textContent, sinceLoad: (at - t0) / 1000 }), 2200);
		}; ch.port2.postMessage(0); });
	}));
	if (r.err) await t.check('the Artifacts shelf counter could be judged', false, r.err);
	else {
		const n = (s) => parseFloat(s), expect = 18 + Math.floor(r.sinceLoad);
		t.log(`shelf: hidden text ${r.before.text} (row drawn ${r.before.drawn}), first drawn frame ${r.first}, 2.2 s later ${r.later}, ${r.sinceLoad.toFixed(1)} s since load (count starts at 18)`);
		await t.check('the Artifacts shelf opens on a click of its rail icon', r.drawn === true, `row drawn ${r.drawn}`);
		await t.check('its counter is current in the first frame it is drawn (within 2 s of the count since load)', Math.abs(n(r.first) - expect) <= 2, `first ${r.first}, expected about ${expect}.0s`);
		await t.check('and goes on counting while shown', n(r.later) - n(r.first) >= 1, `${r.first} then ${r.later}`);
	}
}
