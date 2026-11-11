// The 5.6 chat's Working run asks for frames only when something moves, and rests under the onboarding window
// (2026-11-10 performance pass: lane C, 2abe397798, and lane C2, 8fc3ff34ce).
//
// RUN. A Working run that the reader only watches used to keep two loops going on every screen refresh (the held
// room's and the follow's: about 1.25 frame callbacks per refresh between them) and re-patched its card on every work
// tick whether or not anything in it had changed. Measured on the 120 Hz host: script 256 -> 63 ms a second, a frame's
// median 9.4 -> 6.4 ms, dropped frames 32 -> 11 a second. Here, on Home, with a run restarted (PM56_DEMO.startWorking())
// and nobody touching the page:
//   - the frame callbacks asked for by the chat's own code are at most --set chat (default 30) percent of the screen's
//     refresh rate. "The chat's own code" is told by where the asking stack runs: the built page's script#pm56-js,
//     #pm56-app-js and #pm56-port-js blocks (helpers/built-source.mjs), never by a line range typed here;
//   - nothing in the chat's Working card or Orbit card is rewritten with the value it holds;
//   - the run is really running (its clock advances with the wall clock), and a transcript that was following is still
//     at the bottom at the end. Stream F's orbit-panel-hold and chat-sweep own the room and the layout.
//
// REST. Under the onboarding window the chat cannot be seen and its demo clock is paused, but its run kept ticking and
// patching: 28 dropped frames a second in the window, 0.6 after. With a run in progress the window is opened
// (O55.ui.open(), what Run Onboarding Again does), held for --set hold (default 4000) ms, and closed:
//   - while it is open the run's clock and step stand still, none of the run's loops asks for a frame, no work tick
//     fires and nothing in the chat's cards or its status bar is written;
//   - at the close the clock is where it was at the opening, then carries on with the wall clock, the card updates
//     again, a following transcript is at the bottom again and a held room is still held;
//   - and, in the first look only (--set ends=all for every look), a run that was due to end while the window was open
//     has not ended under it and ends after the close, at its own end.
//
// --set looks=<a,b>  default basic-dark,glass-dark,retro-dark,nier-dark; looks=all for all ten
// --set parts=run,rest   --set settle=<ms> (default 30000)
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
	const parts = String(t.args.parts || 'run,rest').split(',');
	const chatPct = Number(t.args.chat || 30), ms = Number(t.args.ms || 4000), hold = Number(t.args.hold || 4000);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	await t.page.addInitScript(CALLBACK_PROBE);
	const blocks = blocksOf(await pageSource(t));
	const chatBlocks = blocks.filter((b) => b.kind === 'script' && /^pm56/.test(b.id));
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
			await t.page.waitForTimeout(ms);
			const cb = await f.evaluate(() => window.__cbp.read());
			const dw = await f.evaluate(DOM_READ, PLACES);
			const w1 = await work(), v1 = await view();
			const adv = (w1.clock ?? 0) - (w0.clock ?? 0), ran = w0.running && adv >= cb.secs - 1.5;
			if (!ran) { await t.check(`${look} run: a Working run is in progress while measured`, false, `clock ${w0.clock} -> ${w1.clock} in ${cb.secs.toFixed(1)} s, running ${w0.running}/${w1.running}: could not judge`); }
			else {
				const chat = ofChat(cb.raf), rate = perSec(chat, cb.secs), pct = rate / hz * 100;
				t.log(`${look} run: ${hz.toFixed(0)} Hz; frame callbacks ${perSec(cb.raf, cb.secs).toFixed(1)}/s, the chat's ${rate.toFixed(1)}/s (${pct.toFixed(0)}%): ${show(chat, cb.secs)}`);
				t.log(`${look} run: card records ${dw.places.card.records} (${(dw.places.card.records / dw.secs).toFixed(1)}/s), same-value ${dw.places.card.same}; clock ${w0.clock} -> ${w1.clock}`);
				await t.check(`${look} run: the chat asks for at most ${chatPct}% of the refresh rate in frame callbacks`, pct <= chatPct, `${rate.toFixed(1)}/s of ${hz.toFixed(0)} Hz = ${pct.toFixed(0)}%: ${show(chat, cb.secs)}`);
				await t.check(`${look} run: nothing in the Working card is rewritten with the value it holds`, dw.places.card.found > 0 && dw.places.card.same === 0, `${dw.places.card.same} same-value writes of ${dw.places.card.records} records: ${dw.places.card.eg.join('; ')}`);
				await t.check(`${look} run: the card is still being written (the run shows its progress)`, dw.places.card.records > 0, `${dw.places.card.records} records in ${dw.secs.toFixed(1)} s`);
				if (v0.gap != null && v0.gap <= 24) await t.check(`${look} run: a following transcript is still at the bottom`, v1.gap <= 24, `gap ${v0.gap} -> ${v1.gap} px`);
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
				t.log(`${look} rest: under the window ${hold} ms: the chat's frame callbacks ${show(chatRaf, cb.secs)}; its timers ${show(ofChat(cb.timers), cb.secs)}; card records ${dw.places.card.records}, status bar ${dw.places.bar.records}`);
				await t.check(`${look} rest: none of the run's loops asks for a frame while the window is open`, own.length === 0, show(own, cb.secs));
				await t.check(`${look} rest: no work tick fires while the window is open`, ticks.length === 0, show(ticks, cb.secs));
				await t.check(`${look} rest: nothing is written in the chat's cards or its status bar while the window is open`, dw.places.card.found > 0 && dw.places.card.records === 0 && dw.places.bar.records === 0, `card ${dw.places.card.records} records, status bar ${dw.places.bar.records}${dw.places.card.found ? '' : ' (no card found: could not judge)'}`);
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
		first = false;
	}
}
