// Usage pauses hover highlights while the mouse wheel turns (lane V, PERF-USAGE-HOVER, Jared's card A, 2026-11-16).
//
// When the wheel scrolls Usage's board under a resting pointer, cards and rows slide under it. Each one lit up, showed
// its tool buttons and faded again as it passed, and that restyle and repaint made the scroll drop frames. Jared chose
// to pause those highlights while the wheel turns: the board's hover effects are gated (src/css: the in-board :hover
// rules; the shell's hover engine, 18-hover.js, rests for a board with [data-op]); hit-testing is unchanged, so a click
// or a pointer move works as it always did, and the highlight under the resting pointer comes back once the wheel stops.
//
// Per look (default Basic Dark, --set looks=) and surface, TRIES windows (3): the board at its top, the pointer moved
// onto the card at the page's centre (55 % down) and left there until its hover is on (rows R0 below), then TICKS (12)
// real wheel ticks of 40 px, GAP (30) ms apart, downward, and 800 ms with the pointer still. A recorder in the app's
// frame logs each frame (the card under the pointer, the cards carrying the hover engine's light .pmh-on, the hovered
// card's tool cluster opacity) and every transitionrun inside the board, wheel and scroll event.
//   R0  could judge: at rest before the wheel, the card under the pointer is lit (.pmh-on) and shows its tools (opacity
//       above .5): both builds, every look; without it there is nothing to pause.
//   R1  while the wheel turns (from 50 ms after the first wheel event to the last scroll event): no hover-in restyle.
//       A hover-in restyle is a transition that starts on an element of a card under the pointer at that moment, other
//       than the card that was under it at rest (a card or row that slid in lit up), or a frame where a card other than
//       the resting one carries the engine's light (.pmh-on, or .pmh-near, its light on a card near the pointer). On
//       origin/main bb8cd0e873 (Alexis, Basic Dark) the card that slides in starts its tools', resize corner's and
//       light's transitions and takes .pmh-near: red.
//   R2  after the wheel: within BACK ms (180) of the last wheel or scroll event, the card under the resting pointer
//       carries .pmh-on and its tools show (opacity above .05, or their opacity transition has started), with no pointer
//       move. Logged with the time it took. On origin/main the engine's .pmh-on stays on the card that was under the
//       pointer at rest and scrolled away, and the card under the pointer never gets it without a move: red too.
// A window that did not scroll at least TICKS*40*0.6 px is taken again (twice at most); one still short fails as
// "could not judge".
//   --set looks=basic-dark,glass-dark,retro-dark,nier-dark   --set tries=3   --set ticks=12   --set gap=30
//   --set back=180   --set rm=1 (Reduced Motion)   --set settle=<ms> (20000)   --set dump=<file.json> (every window)
// Bar for this check (test-tool-bar.md, written before its first review): a finding stops work only if it is shown on
// real inputs to pass a build whose cards light up or show their tools while the wheel scrolls them under a resting
// pointer (R1), or to pass a build whose highlight does not come back without a move (R2); anything else goes on
// TOOL-ISSUES.md.
import { writeFileSync } from 'node:fs';
import { muteSound } from '../helpers/quiet-page.mjs';

// the recorder, installed once in the app's frame; __uhp.start() clears it and starts a window, __uhp.stop() ends it
const INSTALL = () => {
	if (window.__uhp) return true;
	const sc = document.getElementById('pmuScroll'), board = sc && sc.querySelector('.pmu-board');
	if (!board) return false;
	const R = window.__uhp = { on: false };
	const cardId = (c) => (c ? c.getAttribute('data-id') || c.getAttribute('data-card') || c.id || String([...board.children].indexOf(c)) : null);
	const cls = (el) => String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || el.tagName).slice(0, 48);
	sc.addEventListener('wheel', () => { if (R.on) R.wheels.push(performance.now()); }, { passive: true, capture: true });
	sc.addEventListener('scroll', () => { if (R.on) R.scrolls.push(performance.now()); }, { passive: true });
	board.addEventListener('transitionrun', (e) => {
		if (!R.on) return;
		const t = e.target, card = t.closest && t.closest('.pmu-card');
		const under = card && card.matches(':hover');
		R.trans.push({ t: performance.now(), prop: e.propertyName, cls: cls(t), card: cardId(card), under: !!under, self: !!(t.matches && t.matches(':hover')) });
	}, true);
	const frame = () => {
		if (!R.on) return;
		const hc = board.querySelector(':scope > .pmu-card:hover');
		const tools = hc && hc.querySelector('.pmu-cardtools');
		R.frames.push({ t: performance.now(), top: Math.round(sc.scrollTop), card: cardId(hc), tools: tools ? Math.round(parseFloat(getComputedStyle(tools).opacity) * 100) / 100 : null,
			lit: [...board.querySelectorAll(':scope > .pmu-card.pmh-on')].map(cardId), near: [...board.querySelectorAll(':scope > .pmu-card.pmh-near')].map(cardId) });
		requestAnimationFrame(frame);
	};
	R.start = () => { Object.assign(R, { on: true, frames: [], wheels: [], scrolls: [], trans: [], t0: performance.now() }); requestAnimationFrame(frame); };
	R.stop = () => { R.on = false; return { t0: R.t0, frames: R.frames, wheels: R.wheels, scrolls: R.scrolls, trans: R.trans }; };
	R.state = () => { const hc = board.querySelector(':scope > .pmu-card:hover'), tools = hc && hc.querySelector('.pmu-cardtools'); return { card: cardId(hc), lit: !!(hc && hc.classList.contains('pmh-on')), tools: tools ? parseFloat(getComputedStyle(tools).opacity) : null }; };
	return true;
};

// R1 and R2 from one window's record (pure, so the verdict can be read back from a dump)
export function judge(rec, { rest, back }) {
	const first = rec.wheels[0], lastWheel = rec.wheels[rec.wheels.length - 1], lastScroll = rec.scrolls.length ? rec.scrolls[rec.scrolls.length - 1] : lastWheel;
	const end = Math.max(lastWheel, lastScroll), from = first + 50;
	const during = (x) => x.t >= from && x.t <= end;
	const ins = rec.trans.filter((x) => during(x) && x.under && x.card !== rest);
	const litFrames = rec.frames.filter((x) => during(x) && x.lit.concat(x.near || []).some((c) => c !== rest));
	const after = rec.frames.filter((x) => x.t > end);
	const toolsStart = (card) => rec.trans.find((x) => x.t > end && x.card === card && x.prop === 'opacity' && /pmu-cardtools/.test(x.cls));
	const back1 = after.find((x) => x.card && x.lit.includes(x.card) && (x.tools > 0.05 || toolsStart(x.card)));
	return {
		r1: { ok: ins.length === 0 && litFrames.length === 0, ins: ins.length, insCards: [...new Set(ins.map((x) => x.card))], insProps: [...new Set(ins.map((x) => x.prop + ' ' + x.cls.split(' ')[0]))].slice(0, 8), litFrames: litFrames.length, frames: rec.frames.filter(during).length, cardsPassed: [...new Set(rec.frames.filter(during).map((x) => x.card).filter(Boolean))].length },
		r2: { ok: !!back1 && back1.t - end <= back, ms: back1 ? Math.round(back1.t - end) : null, card: back1 ? back1.card : (after.length ? after[after.length - 1].card : null) },
		span: { wheel: Math.round(lastWheel - first), tail: Math.round(lastScroll - lastWheel), wheels: rec.wheels.length, scrolls: rec.scrolls.length }
	};
}

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark').split(',').filter(Boolean);
	const TRIES = Number(t.args.tries || 3), TICKS = Number(t.args.ticks || 12), GAP = Number(t.args.gap || 30), BACK = Number(t.args.back || 180);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const rm = String(t.args.rm || '') === '1';
	if (rm) await t.emulate({ reducedMotion: 'reduce' });
	const dump = [];
	for (const surface of t.app.surfaces()) {
		const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
		await f.evaluate(() => document.fonts.ready.then(() => true));
		await t.page.waitForTimeout(Number(t.args.settle ?? 20000));
		const park = () => t.page.mouse.move(W - 6, Math.round(H / 2), { steps: 4 });
		for (const look of looks) {
			const S = `[${surface}] ${look}: `;
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await f.evaluate(() => PM_PAGES.go('usage'));
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 8000));
			const ok = await f.evaluate(INSTALL);
			const range = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); return s ? s.scrollHeight - s.clientHeight : 0; });
			if (!ok || range < TICKS * 40 + 80) { await t.check(S + 'could judge: Usage\'s board is there and scrolls ' + (TICKS * 40 + 80) + ' px', false, `range ${range}`); continue; }
			const res = { r0: [], r1: [], r2: [] };
			for (let w = 0; w < TRIES; w++) {
				let rec, rest, at, j, short = [];
				for (let attempt = 0; attempt < 3; attempt++) {
					await park();
					await t.page.waitForTimeout(500);
					at = await f.evaluate(() => { const s = document.getElementById('pmuScroll'); s.scrollTop = 0; const p = document.querySelector('.page.active') || document.body, r = p.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height * 0.55) }; });
					await t.page.waitForTimeout(400);
					await t.page.mouse.move(at.x, at.y, { steps: 6 });
					await t.page.waitForTimeout(1200);
					rest = await f.evaluate(() => window.__uhp.state());
					await f.evaluate(() => window.__uhp.start());
					for (let i = 0; i < TICKS; i++) { await t.page.mouse.wheel(0, 40); await t.page.waitForTimeout(GAP); }
					await t.page.waitForTimeout(800);
					rec = await f.evaluate(() => window.__uhp.stop());
					const moved = rec.frames.length ? rec.frames[rec.frames.length - 1].top - rec.frames[0].top : 0;
					if (rec.wheels.length && moved >= TICKS * 40 * 0.6) break;
					short.push(`scrolled ${moved} px, ${rec.wheels.length} wheel events`);
				}
				const moved = rec.frames.length ? rec.frames[rec.frames.length - 1].top - rec.frames[0].top : 0;
				if (!rec.wheels.length || moved < TICKS * 40 * 0.6) { await t.check(`${S}window ${w + 1}: could judge: the wheel scrolled the board`, false, short.join('; ')); continue; }
				j = judge(rec, { rest: rest.card, back: BACK });
				dump.push({ surface, look, window: w + 1, rest, at, judged: j, rec });
				res.r0.push(!!(rest.card && rest.lit && rest.tools > 0.5));
				res.r1.push(j.r1); res.r2.push(j.r2);
				t.log(`${S}window ${w + 1}: at rest card ${rest.card} lit ${rest.lit} tools ${rest.tools} | wheel ${j.span.wheels} events over ${j.span.wheel} ms, scroll ${j.span.scrolls} events ending ${j.span.tail} ms after the last wheel, ${moved} px | during: ${j.r1.cardsPassed} cards under the pointer, ${j.r1.ins} hover-in transitions (${j.r1.insProps.join(', ') || 'none'}) on ${j.r1.insCards.join(',') || 'no card'}, ${j.r1.litFrames} of ${j.r1.frames} frames light another card | after: back in ${j.r2.ms === null ? 'never (800 ms)' : j.r2.ms + ' ms'} on ${j.r2.card}${short.length ? ' | taken again: ' + short.join('; ') : ''}`);
				if (t.args.dump) writeFileSync(String(t.args.dump), JSON.stringify(dump));
			}
			await park();
			const n = res.r1.length;
			await t.check(S + `could judge: at rest the card under the pointer is lit and shows its tools (${res.r0.filter(Boolean).length} of ${res.r0.length} windows)`, n === TRIES && res.r0.every(Boolean), `windows judged ${n} of ${TRIES}`);
			await t.check(S + 'while the wheel turns, no card or row that slides under the resting pointer lights up or shows its tools', n > 0 && res.r1.every((r) => r.ok),
				res.r1.map((r, i) => `w${i + 1}: ${r.ins} hover-in transitions, ${r.litFrames} lit frames, ${r.cardsPassed} cards passed`).join('; '));
			await t.check(S + `after the wheel, the highlight under the resting pointer comes back within ${BACK} ms without a move`, n > 0 && res.r2.every((r) => r.ok),
				res.r2.map((r, i) => `w${i + 1}: ${r.ms === null ? 'never' : r.ms + ' ms'} (${r.card})`).join('; '));
		}
	}
}
