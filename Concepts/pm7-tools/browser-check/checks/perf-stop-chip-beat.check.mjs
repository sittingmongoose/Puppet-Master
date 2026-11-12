// The chat's Stop chip still changes its breathing only at a loop boundary, now without the listener that woke the
// whole page (2026-11-10 performance pass, lane A, ae047049eb, 5.6 Pro/send-stop.js).
//
// While a run works the send button is a Stop square that breathes: deeper and slower while the run waits, shallow and
// quick while words arrive (data-flow="waiting" / "flowing"). The change of pace must land where the square is at full
// size, the loop's boundary, or the square jumps. The chip used to learn of each boundary from an animationiteration
// listener on the document, and one such listener anywhere makes Chrome wake the main thread at every loop boundary of
// every CSS animation on the page, for the rest of the session (perf-rest pins that the listener is gone). The chip now
// sets a timer to its own loop's next boundary. This check pins what the listener gave: with a Working run on Home the
// chip is fed words for 4 s, left for 5 s and fed again for 3 s, so its pace must switch at least twice, and every
// switch (the data-flow attribute changing on a chip that has already breathed, data-flowed) lands within --set near
// (default 40) ms of a boundary of the loop that was running. A switch in mid-loop would be hundreds of ms off.
// It passes on the page before the fix too (1-2 ms there, 1-10 ms now): it guards the behaviour, perf-rest the cost.
//
// --set looks=<a,b> (default basic-dark)   --set settle=<ms> (default 30000)
// Both surfaces. No Stop chip, or fewer than two switches seen, fails as "could not judge".
// F2 also changes Settings' Animation speed from Measured to Fast during the first flowing loop. That live change
// must retain the animation/start and rescale its duration, and every ensuing cadence change must remain near a
// boundary. --set speedOnly=1 runs only this regression for the main/rc3 controls.
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

const WATCH = () => {
	const R = window.__beat = { recs: [], last: null };
	const chip = () => document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
	const anim = () => {
		const b = chip(), g = b && b.querySelector('.ss-g'), a = g && g.getAnimations().find((x) => /^ss-breathe/.test(x.animationName));
		return a && a.startTime != null ? { name: a.animationName, start: a.startTime, delay: a.effect.getTiming().delay || 0, dur: Number(a.effect.getTiming().duration) } : null;
	};
	R.poll = setInterval(() => { const a = anim(); if (a) R.last = a; }, 100);
	R.mo = new MutationObserver((ms) => {
		for (const m of ms) {
			const b = m.target; if (!b.classList || !b.classList.contains('sendstop')) continue;
			const v = b.getAttribute(m.attributeName); if (v === m.oldValue) continue;
			const now = document.timeline.currentTime, a = R.last; let err = null;
			// how far the loop that was running is from its nearest boundary at the moment of the switch
			if (a && a.dur > 0 && m.attributeName === 'data-flow') { const p = ((now - a.start - a.delay) % a.dur + a.dur) % a.dur; err = Math.round(p > a.dur / 2 ? p - a.dur : p); }
			R.recs.push({ t: Math.round(now), attr: m.attributeName, from: m.oldValue, to: v, loop: a && a.name, dur: a && a.dur, errMs: err, flowed: b.hasAttribute('data-flowed') });
		}
	});
	R.mo.observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-flow', 'data-ss'] });
	const b = chip();
	return b ? { ss: b.getAttribute('data-ss'), flow: b.getAttribute('data-flow'), feed: !!(window.PM56_SENDSTOP && window.PM56_SENDSTOP.token) } : null;
};

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark').split(',').filter(Boolean);
	const near = Number(t.args.near || 40);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	const ready = await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP && window.PM_PAGES), null, { timeout: 60000 }).then(() => true, () => false);
	await t.check('the chat\'s demo and its send button module are in the page', ready, ready ? 'PM56_DEMO, PM56_SENDSTOP' : 'missing after 60 s: could not judge');
	if (!ready) return;
	await t.page.waitForTimeout(Number(t.args.settle ?? 30000));

	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(3000);
		await t.check(`${look}: Settings accepts Measured animation speed`, await f.evaluate(() => PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Measured', false, false)));
		await f.evaluate(() => PM56_DEMO.pauseWorking());
		await t.page.waitForTimeout(250);
		await f.evaluate(WATCH);
		const speed = await f.evaluate(async () => {
			PM56_SENDSTOP.token(); PM56_DEMO.startWorking();
			await new Promise((r) => setTimeout(r, 100));
			const b = document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
			const a = b?.querySelector('.ss-g')?.getAnimations().find((x) => x.animationName === 'ss-breathe');
			if (!a) return { error: 'no flowing animation after start' };
			const initial = { flow: b.getAttribute('data-flow'), ...a.effect.getTiming() };
			await new Promise((r) => setTimeout(r, Math.max(0, 1000 - Number(a.currentTime))));
			const changedAt = document.timeline.currentTime;
			const accepted = PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Fast', false, false);
			await new Promise((r) => setTimeout(r, 100));
			const current = b.querySelector('.ss-g').getAnimations().find((x) => x.animationName === 'ss-breathe');
			const changed = current && { sameAnimation: current === a, ...current.effect.getTiming() };
			await new Promise((r) => setTimeout(r, 5500));
			return { initial, changedAt, accepted, changed };
		});
		const live = await f.evaluate(() => { const R = window.__beat; clearInterval(R.poll); R.mo.disconnect(); return R.recs; });
		t.log(`${look} live Animation speed change: ${JSON.stringify(speed)}; records ${JSON.stringify(live)}`);
		await t.check(`${look}: live Fast setting rescales the flowing animation in place`, speed.accepted && speed.initial?.flow === 'flowing' && speed.initial.duration === 2200 && speed.initial.delay === 800 && speed.changed?.sameAnimation && speed.changed.duration === 1320 && speed.changed.delay === 800, JSON.stringify(speed));
		const changes = live.filter((r) => r.attr === 'data-flow' && r.errMs != null && r.flowed && r.t >= speed.changedAt);
		await t.check(`${look}: a cadence change is seen after live Animation speed changes`, changes.length > 0, JSON.stringify(changes));
		await t.check(`${look}: every cadence change after live Animation speed stays within ${near} ms of a boundary`, changes.length > 0 && changes.every((r) => Math.abs(r.errMs) <= near), JSON.stringify(changes));
		await f.evaluate(() => PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Measured', false, false));
		if (String(t.args.speedOnly || '0') === '1') continue;
		await f.evaluate(() => PM56_DEMO.pauseWorking());
		await t.page.waitForTimeout(250);
		await f.evaluate(() => window.PM56_DEMO.startWorking());
		await t.page.waitForTimeout(1500);
		const init = await f.evaluate(WATCH);
		const stop = !!init && init.ss === 'stop' && init.feed;
		await t.check(`${look}: with a Working run the send button is the Stop chip`, stop, init ? JSON.stringify(init) : 'no .sendstop in the chat: could not judge');
		if (!stop) { await f.evaluate(() => { const R = window.__beat; if (R) { clearInterval(R.poll); R.mo.disconnect(); } }); continue; }
		// words for 4 s, nothing for 5 s, words for 3 s
		await f.evaluate(() => new Promise((done) => {
			const feed = (ms) => new Promise((r) => { const iv = setInterval(() => window.PM56_SENDSTOP.token(), 100); setTimeout(() => { clearInterval(iv); r(); }, ms); });
			const wait = (ms) => new Promise((r) => setTimeout(r, ms));
			(async () => { await feed(4000); await wait(5000); await feed(3000); await wait(2500); done(true); })();
		}));
		const R = await f.evaluate(() => { const R = window.__beat; clearInterval(R.poll); R.mo.disconnect(); return { recs: R.recs, chip: (() => { const b = document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop'); return b ? b.getAttribute('data-ss') : null; })() }; });
		for (const r of R.recs) t.log(`${look}: t=${r.t} ${r.attr} ${r.from} -> ${r.to}${r.attr === 'data-flow' ? ` (loop ${r.loop} ${r.dur} ms, ${r.errMs} ms from a boundary, had breathed ${r.flowed})` : ''}`);
		const left = R.recs.find((r) => r.attr === 'data-ss' && r.from === 'stop');
		const sw = R.recs.filter((r) => r.attr === 'data-flow' && r.errMs != null && r.flowed && (!left || r.t < left.t));
		const worst = Math.max(0, ...sw.map((r) => Math.abs(r.errMs)));
		await t.check(`${look}: the chip's pace switched at least twice while it was Stop`, sw.length >= 2, `${sw.length} switches${left ? `; the chip left Stop at t=${left.t}` : ''}${sw.length >= 2 ? '' : ': could not judge'}`);
		if (sw.length >= 2) await t.check(`${look}: every switch of pace lands within ${near} ms of a loop boundary`, worst <= near, `worst ${worst} ms of ${sw.length} switches: ${sw.map((r) => `${r.from}->${r.to} ${r.errMs} ms`).join(', ')}`);
	}
}
