// The 5.6 chat's Working run asks for frames only when something moves, and rests under the onboarding window
// (2026-11-10 performance pass: lane C, 2abe397798, and lane C2, 8fc3ff34ce).
//
// RUN. A Working run that the reader only watches used to keep two loops going whether or not anything moved: the held
// room's (roomFrame, every frame for as long as the run held its room) and the follow's (kickFollow, kicked by every
// patch). Lane C's own numbers on the 120 Hz host, means of 12 windows: kickFollow 63 -> 31 callbacks a second,
// roomFrame 52 -> 15, script 256 -> 63 ms a second, a frame's median 9.4 -> 6.4 ms, dropped frames 32 -> 11 a second.
// Here, on Home, with a run restarted (PM56_DEMO.startWorking()) and nobody touching the page, counted over the WHOLE
// run (its phases differ: a 4 s window gave 83 to 221 a second before and 24 to 56 after, depending on where it fell):
//   - the frame callbacks asked for by roomFrame and kickFollow together are at most --set loops (default 80) a second.
//     They are told by the asking function's name AND by where it runs: the built page's script#pm56-js, #pm56-app-js
//     and #pm56-port-js blocks (helpers/built-source.mjs). If neither name is seen at all the cell fails as not judged
//     (a renamed loop must not pass by being invisible);
//   - the run is really running (its clock advances with the wall clock and it ends), its card is being written, and a
//     transcript that was following is still at the bottom half-way through (at its end the run shows its answer
//     from the top, on both builds). Stream F's orbit-panel-hold and chat-sweep own
//     the room and the layout.
//   (Not asserted: "a tick whose card is unchanged writes nothing". In the demo's run every tick changes the card, so
//   the page before the fix shows no such write either: 29 card records a second on both builds.)
//
// REST. Under the onboarding window the chat cannot be seen and its demo clock is paused, but its run kept ticking and
// patching: 28 dropped frames a second in the window, 0.6 after. With a run in progress the window is opened
// (O55.ui.open(), what Run Onboarding Again does), held for --set hold (default 4000) ms, and closed:
//   - while it is open the run's clock and step stand still, no work tick fires, the run's loops ask for at most 3
//     frame callbacks a second between them (before: 250) and at most 2 patches land in the chat's cards and status
//     bar (a patch = one delivery of DOM records, however many nodes it rewrites; before: a patch every tick, 68
//     records in 4 s). Not zero: the chat still redraws itself whole now and then under the window (seen twice in
//     eight cells, 2026-11-11: one render, 2 and 45 card records), which is one frame's work, not a loop;
//   - at the close the clock is where it was at the opening, then carries on with the wall clock, the card updates
//     again, a following transcript is at the bottom again and a held room is still held;
//   - and, in the first look only (--set ends=all for every look), a run that was due to end while the window was open
//     has not ended under it and ends after the close, at its own end.
//
// VISIT (lane C3, the R1 review of 8fc3ff34ce: what the rest above did not reach). A short visit to the window:
//   - a chain's next run (Multi Orbit: orbitA, then orbitB 1400 ms after it) waits only for the time the window is NOT
//     open. The demo's Multi-orbit turn is started and orbitA brought to its end (PM56_DEMO.tickOnce); the moment its
//     successor's delay is armed (the app's setTimeout of that delay, told by the chat's app block) the window is opened
//     100 ms later and closed (O55.ui.close) 150 ms after that, or, the long visit, 2300 ms after that. The time from
//     the arming to orbitB's start, less the time the window was open (PM56_HOST.onRest, as the chat hears it), is the
//     delay, never more than 40 ms short and at most 300 ms over: a timer never fires early, and after the close the page
//     is busy laying itself out again, which made it fire 90-110 ms late on the 3090 (2026-11-12). The short visit has
//     to have ended before the delay would have been due (else it is not judged). The branch before lane C3 fails the
//     short visit: there the successor started on the wall clock, as early as the visit was long.
//
// --set looks=<a,b>  default basic-dark,glass-dark,retro-dark,nier-dark; looks=all for all ten
// --set parts=run,rest,visit   --set settle=<ms> (default 30000)
// Both surfaces. A run that never started, or a place missing from the page, fails as "could not judge".
import { muteSound, refreshRate, parkPointer } from '../helpers/quiet-page.mjs';
import { CALLBACK_PROBE } from '../helpers/callback-probe.mjs';
import { DOM_LISTEN, DOM_READ } from '../helpers/dom-writes.mjs';
import { pageSource, blocksOf, blocksOfSite } from '../helpers/built-source.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const CHAT = ':is(.pm56-host, #pm56-layers, #pmw-chat56)';
const PLACES = [['card', `${CHAT} :is(.working-card, .orbit-card)`], ['bar', `${CHAT} .status-bar`]];

export default async function (t) {
	const want = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark');
	const looks = want === 'all' ? ALL : want.split(',').filter(Boolean);
	const parts = String(t.args.parts || 'run,rest,visit').split(',');
	const loopsMax = Number(t.args.loops || 80), hold = Number(t.args.hold || 4000);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	await t.page.addInitScript(CALLBACK_PROBE);
	const src = await pageSource(t);
	const blocks = blocksOf(src);
	const chatBlocks = blocks.filter((b) => b.kind === 'script' && /^pm56/.test(b.id));
	// VISIT: the chat's app block
	const appBlock = blocks.find((b) => b.id === 'pm56-app-js') || null;
	await t.check('the built page has the chat\'s script blocks (script#pm56-...)', chatBlocks.length > 0, chatBlocks.map((b) => `${b.id} ${b.from}-${b.to}`).join(', ') || 'none found: the chat\'s code cannot be told apart');
	if (!chatBlocks.length) return;
	// a callback is the chat's when the innermost page frame of the stack that asked for it runs in a chat block
	const ofChat = (rows) => rows.filter(([, site]) => /^pm56/.test(blocksOfSite(blocks, site)[0] || ''));
	const perSec = (rows, secs) => rows.reduce((a, [n]) => a + n, 0) / secs;
	const show = (rows, secs) => rows.slice(0, 6).map(([n, s]) => `${(n / secs).toFixed(1)}/s ${s.slice(0, 90)}`).join(' | ') || 'none';

	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	const work = () => f.evaluate(() => { const w = window.PM56_DEMO.getState().work; return { clock: w.clock == null ? null : w.clock, step: w.step, running: !!w.running, completed: !!w.completed }; });
	const view = () => f.evaluate(() => {
		const tr = document.querySelector('.chat-stage .transcript'), root = document.getElementById('pmRoot');
		return { gap: tr ? Math.round(tr.scrollHeight - tr.clientHeight - tr.scrollTop) : null, hold: ((root && root.style.getPropertyValue('--tx-hold-min')) || document.documentElement.style.getPropertyValue('--tx-hold-min') || '').trim() };
	});
	const openWin = async () => {
		await f.evaluate(() => window.O55.ui.open());
		await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open') && window.PM56_HOST && (!window.PM56_HOST.resting || window.PM56_HOST.resting()), null, { timeout: 10000 });
	};
	const closeWin = async () => {
		await f.evaluate(() => window.O55.ui.close());
		await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000, polling: 20 });
	};
	const ready = await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.O55 && O55.ui && O55.ui.open && window.PM_PAGES), null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the chat\'s demo, the onboarding window and the pages are in the page', ready, ready ? 'PM56_DEMO, O55.ui, PM_PAGES' : 'missing after 60 s: could not judge');
	if (!ready) return;
	await t.page.waitForTimeout(Number(t.args.settle ?? 30000));

	let first = true;
	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 5000));
		const hz = await refreshRate(f);
		const card = await f.waitForFunction((sel) => !!document.querySelector(sel), PLACES[0][1], { timeout: 15000 }).then(() => true, () => false);
		if (!card) { await t.check(`${look}: the chat's Working card is on Home`, false, 'no .working-card or .orbit-card in the chat: could not judge'); continue; }

		if (parts.includes('run')) {
			await f.evaluate(() => window.PM56_DEMO.startWorking());
			await t.page.waitForTimeout(1500);
			const w0 = await work(), v0 = await view();
			await f.evaluate(() => { window.__cbp.arm(); });
			await f.evaluate(DOM_LISTEN);
			// the whole run, to its own end (60 s at most)
			// the follow is judged while rows land, half-way through; at its end the run shows its answer from the top
			const until = Date.now() + 60000; let w1 = w0, vMid = null;
			while (!w1.completed && Date.now() < until) { await t.page.waitForTimeout(500); w1 = await work(); if (!vMid && !w1.completed && (w1.clock ?? 0) >= 12) vMid = await view(); }
			const cb = await f.evaluate(() => window.__cbp.read());
			const dw = await f.evaluate(DOM_READ, PLACES);
			const adv = (w1.clock ?? 0) - (w0.clock ?? 0), ran = w0.running && w1.completed && adv >= cb.secs - 3;
			if (!ran) { await t.check(`${look} run: a Working run ran to its end while measured`, false, `clock ${w0.clock} -> ${w1.clock} in ${cb.secs.toFixed(1)} s, running ${w0.running}, completed ${w1.completed}: could not judge`); }
			else {
				const chat = ofChat(cb.raf), named = (re) => perSec(chat.filter(([, site]) => re.test(site)), cb.secs);
				const room = named(/^roomFrame\b/), follow = named(/^kickFollow\b/), pair = room + follow;
				t.log(`${look} run: ${hz.toFixed(0)} Hz, ${cb.secs.toFixed(1)} s (clock ${w0.clock} -> ${w1.clock}); frame callbacks ${perSec(cb.raf, cb.secs).toFixed(1)}/s, the chat's ${perSec(chat, cb.secs).toFixed(1)}/s: roomFrame ${room.toFixed(1)}/s, kickFollow ${follow.toFixed(1)}/s; ${show(chat, cb.secs)}`);
				t.log(`${look} run: card records ${dw.places.card.records} (${(dw.places.card.records / dw.secs).toFixed(1)}/s), same-value ${dw.places.card.same}`);
				const seen = room > 0 || follow > 0;
				await t.check(`${look} run: the room's and the follow's loops are seen by name`, seen, seen ? `roomFrame ${room.toFixed(1)}/s, kickFollow ${follow.toFixed(1)}/s` : `neither roomFrame nor kickFollow asked for a frame from the chat's blocks: could not judge (${show(chat, cb.secs)})`);
				if (seen) await t.check(`${look} run: over the whole run roomFrame and kickFollow ask for at most ${loopsMax} frame callbacks a second`, pair <= loopsMax, `${pair.toFixed(1)}/s (roomFrame ${room.toFixed(1)}, kickFollow ${follow.toFixed(1)}) over ${cb.secs.toFixed(1)} s`);
				await t.check(`${look} run: the card is being written (the run shows its progress)`, dw.places.card.found > 0 && dw.places.card.records > 0, `${dw.places.card.records} records in ${dw.secs.toFixed(1)} s`);
				if (v0.gap != null && v0.gap <= 24) await t.check(`${look} run: a following transcript is still at the bottom half-way through the run`, !!vMid && vMid.gap <= 24, vMid ? `gap ${v0.gap} px at the start, ${vMid.gap} px at 12 s of the run's clock` : 'the run never reached 12 s on its clock: could not judge');
			}
		}

		if (parts.includes('rest')) {
			// 1. mid-run: the clock stands still under the window and carries on from there
			await f.evaluate(() => window.PM56_DEMO.startWorking());
			await t.page.waitForTimeout(Number(t.args.into || 4200));
			const before = { work: await work(), view: await view() };
			const going = before.work.running && before.work.clock > 0;
			await t.check(`${look} rest: a run is in progress before the window opens`, going, JSON.stringify(before));
			if (going) {
				await openWin();
				const atOpen = { work: await work(), view: await view() };
				// a height change already running as the window opened plays out, so the count starts a second in
				await t.page.waitForTimeout(1000);
				await f.evaluate(() => { window.__cbp.arm(); });
				await f.evaluate(DOM_LISTEN);
				await t.page.waitForTimeout(hold);
				const cb = await f.evaluate(() => window.__cbp.read());
				const dw = await f.evaluate(DOM_READ, PLACES);
				const beforeClose = { work: await work(), view: await view() };
				await t.check(`${look} rest: the run's clock and step stand still while the window is open`, beforeClose.work.clock === atOpen.work.clock && beforeClose.work.step === atOpen.work.step, `clock ${atOpen.work.clock} -> ${beforeClose.work.clock}, step ${atOpen.work.step} -> ${beforeClose.work.step}`);
				// the run's own loops: the follow glide, the room, streams, overlay placing. Not the run's, and logged: Pip's
				// blink in the composer and the chat's MutationObservers answering the page's own writes into the chat
				const chatRaf = ofChat(cb.raf), own = chatRaf.filter(([, s]) => !/^(blinkTick|blinkOne|MutationObserver\.)/.test(s));
				const ticks = ofChat(cb.timers).filter(([, s]) => /workTick|armWorkTimer/.test(s));
				t.log(`${look} rest: under the window ${hold} ms: the chat's frame callbacks ${show(chatRaf, cb.secs)}; its timers ${show(ofChat(cb.timers), cb.secs)}; card ${dw.places.card.batches} patches (${dw.places.card.records} records), status bar ${dw.places.bar.batches} (${dw.places.bar.records})`);
				await t.check(`${look} rest: the run's loops ask for at most 3 frame callbacks a second while the window is open`, perSec(own, cb.secs) <= 3, `${perSec(own, cb.secs).toFixed(1)}/s: ${show(own, cb.secs)}`);
				await t.check(`${look} rest: no work tick fires while the window is open`, ticks.length === 0, show(ticks, cb.secs));
				await t.check(`${look} rest: at most 2 patches land in the chat's cards and its status bar while the window is open`, dw.places.card.found > 0 && dw.places.card.batches + dw.places.bar.batches <= 2, `card ${dw.places.card.batches} patches (${dw.places.card.records} records), status bar ${dw.places.bar.batches} (${dw.places.bar.records})${dw.places.card.found ? '' : ' (no card found: could not judge)'}`);
				await closeWin();
				const atClose = { work: await work(), view: await view() };
				await t.check(`${look} rest: at the close the clock is where it was at the opening`, atClose.work.clock >= atOpen.work.clock && atClose.work.clock - atOpen.work.clock <= 0.5 + 1e-9, `${atOpen.work.clock} -> ${atClose.work.clock}`);
				await f.evaluate(DOM_LISTEN);
				await t.page.waitForTimeout(2600);
				const after = await f.evaluate(DOM_READ, PLACES);
				const afterWork = await work(), adv = afterWork.clock - atClose.work.clock;
				await t.check(`${look} rest: the clock carries on after the close`, adv >= 2 && adv <= 3, `${atClose.work.clock} -> ${afterWork.clock} in 2.6 s`);
				await t.check(`${look} rest: the card updates again`, after.places.card.records > 0, `${after.places.card.records} records in 2.6 s`);
				await t.page.waitForTimeout(1200);
				const settled = await view();
				if (before.view.gap != null && before.view.gap <= 24) await t.check(`${look} rest: a following transcript is at the bottom again`, settled.gap <= 24, `gap before ${before.view.gap}, at close ${atClose.view.gap}, settled ${settled.gap} px`);
				if (atOpen.view.hold) await t.check(`${look} rest: a held room is still held at the close`, !!atClose.view.hold && atClose.view.hold === beforeClose.view.hold, `at opening ${atOpen.view.hold}, before close ${beforeClose.view.hold}, at close ${atClose.view.hold}`);

				// 2. a run due to end while the window is open ends after it closes, at its own end
				if (first || String(t.args.ends || '') === 'all') {
					const until = Date.now() + 90000;
					let w = await work();
					while (!w.completed && Date.now() < until) { await t.page.waitForTimeout(250); w = await work(); }
					const end = w.clock;
					await t.check(`${look} rest: the run ends on its own`, w.completed, JSON.stringify(w));
					if (w.completed) {
						await f.evaluate(() => window.PM56_DEMO.startWorking());
						w = await work();
						const until2 = Date.now() + 90000;
						while ((w.clock == null || w.clock < end - 1.5) && Date.now() < until2) { await t.page.waitForTimeout(100); w = await work(); }
						await openWin();
						const o = await work();
						await t.page.waitForTimeout(3500);
						const b = await work();
						await t.check(`${look} rest: a run due to end while the window is open has not ended under it`, !b.completed && b.clock === o.clock && o.clock >= end - 1.6, JSON.stringify({ end, atOpen: o, beforeClose: b }));
						await closeWin();
						await t.page.waitForTimeout(2600);
						const a = await work();
						await t.check(`${look} rest: it ends after the close, at its own end`, a.completed && a.clock === end, JSON.stringify({ end, after: a }));
					}
				}
			}
		}
		if (parts.includes('visit')) {
			const thread0 = await f.evaluate(() => window.PM56_DEMO.getState().selectedThread);
			// 1. a chain's next run: its delay counts only the time the window is not open
			const delay = await f.evaluate(() => { const r = window.PM56_DATA && PM56_DATA.workRuns && PM56_DATA.workRuns.orbitA; return r && r.next && r.next.run === 'orbitB' ? r.next.delayMs || 1200 : null; });
			for (const [kind, openAt, closeAt] of [['short', 100, 250], ['long', 100, 2400]]) {
				if (!delay || !appBlock) { await t.check(`${look} visit: the Multi Orbit chain and the chat's app block are in the page`, false, `orbitA -> orbitB delay ${delay}, app block ${appBlock ? appBlock.from : 'missing'}: could not judge`); break; }
				const r = await f.evaluate(async ({ delay, openAt, closeAt, app }) => {
					const D = window.PM56_DEMO, H = window.PM56_HOST, real = window.setTimeout.bind(window);
					const sleep = (ms) => new Promise((res) => real(res, ms));
					const works = () => D.snapshot().works || {};
					// what the chat hears: one listener for the page's life (onRest has no removal)
					if (!window.__c3rest) { window.__c3rest = []; H.onRest((on) => window.__c3rest.push([on, performance.now()])); }
					const out = { arm: null, start: null, err: null, rest: null };
					D.trigger('Multi-orbit turn');
					for (let i = 0; i < 100 && !(works().orbitA && works().orbitA.running); i++) await sleep(50);
					if (!(works().orbitA && works().orbitA.running)) { out.err = 'orbitA never started'; return out; }
					const prev = window.setTimeout;
					window.setTimeout = function (fn, ms, ...rest) {
						if (out.arm == null && ms === delay) {
							const m = /:(\d+):\d+/.exec(String(new Error().stack).split('\n')[2] || '');
							if (m && +m[1] >= app.from && +m[1] <= app.to) {
								out.arm = performance.now();
								real(() => window.O55.ui.open(), openAt);
								real(() => window.O55.ui.close(), closeAt);
							}
						}
						return prev.call(window, fn, ms, ...rest);
					};
					const mark = window.__c3rest.length;
					try {
						for (let i = 0; i < 600 && !works().orbitA.completed; i++) D.tickOnce();
						if (!works().orbitA.completed) { out.err = 'orbitA did not reach its end'; return out; }
						for (let i = 0; i < 400 && out.arm == null; i++) await sleep(100);
						if (out.arm == null) { out.err = 'the successor\'s delay was never armed'; return out; }
						const until = performance.now() + delay + closeAt + 8000;
						while (!works().orbitB && performance.now() < until) await sleep(4);
						if (works().orbitB) out.start = performance.now();
						while (document.documentElement.hasAttribute('data-o55-open') && performance.now() < until + 5000) await sleep(20);
					} finally { window.setTimeout = prev; }
					out.rest = window.__c3rest.slice(mark);
					return out;
				}, { delay, openAt, closeAt, app: { from: appBlock.from, to: appBlock.to } });
				if (r.err || r.start == null) { await t.check(`${look} visit ${kind}: a chain's successor is armed and starts`, false, `${r.err || 'orbitB never started'}: could not judge ${JSON.stringify(r)}`); continue; }
				// the time the window was open between the arming and the start, as the chat heard it
				let open = 0, on = null, opened = null, closed = null;
				for (const [o, at] of r.rest) { if (o && on == null) { on = at; if (opened == null) opened = at; } else if (!o && on != null) { open += Math.max(0, Math.min(at, r.start) - Math.max(on, r.arm)); on = null; closed = at; } }
				if (on != null) open += Math.max(0, r.start - Math.max(on, r.arm));
				const total = r.start - r.arm, outside = total - open;
				const visit = opened == null || closed == null ? null : [Math.round(opened - r.arm), Math.round(closed - r.arm)];
				t.log(`${look} visit ${kind}: delay ${delay} ms armed, window open ${JSON.stringify(visit)} ms after it, orbitB at +${Math.round(total)} ms: ${Math.round(outside)} ms outside the window`);
				const judged = !!visit && visit[0] > 0 && (kind === 'long' ? visit[1] > delay : visit[1] < delay - 100);
				if (!judged) { await t.check(`${look} visit ${kind}: the window opened and closed inside the delay as planned`, false, `window ${JSON.stringify(visit)} ms after the arming, delay ${delay}: could not judge`); continue; }
				await t.check(`${look} visit ${kind}: the chain's next run starts after its delay counted outside the window (${kind === 'short' ? 'the window closed before it was due' : 'the window stayed past it'})`, outside >= delay - 40 && outside <= delay + 300, `${Math.round(outside)} ms outside the window of ${Math.round(total)} ms from the arming to orbitB's start (window ${visit[0]}-${visit[1]} ms); expected ${delay - 40} to ${delay + 300}`);
			}

			await f.evaluate((id) => window.PM56_DEMO.selectThread(id), thread0);
			await t.page.waitForTimeout(1000);
		}
		first = false;
	}
}
