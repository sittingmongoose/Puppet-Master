// The chat's Stop chip changes its breathing pace at once and smoothly, with no loop-end listener (lane S, 2026-11-13;
// Jared's choice PERF-STOP2 = A; 5.6 Pro/send-stop.js and send-stop.css).
//
// While a run works the send button is a Stop square that breathes, quicker while words arrive (data-flow="flowing",
// 2200 ms a loop) and slower while the run waits (data-flow="waiting", 3200 ms; both times Settings' Animation speed).
// Until this change the pace changed only at a loop's end, which the chip learnt from an animationiteration listener on
// the document; one such listener makes Chrome wake the main thread at every loop end of every CSS animation on the
// page, for the page's whole life (Windows, 120 Hz, at rest: about 35 main frames a second with it, 12 without). Now
// the pace changes the moment the wanted cadence does and the loop keeps its place, so no loop end is needed.
//
// REST (fails on main 6bd8294726, where the listener exists): after the page has settled, no animationiteration
// listener on the document or the window (DevTools names them; not on the sandbox surface, where the app is a frame),
// and in a 3 s DevTools trace on Home no animationiteration event is dispatched.
// PACE, per look: a Working run on Home with the check feeding the chip's word hook (PM56_SENDSTOP.token) from a frame
// callback every 100 ms, as turn-stream.js and thought-stream.js release their words, the chip sampled every frame (its loops' place and length, the glyph's
// scale and the backlight's opacity, as the page computes them; the films show the pixels). Changes: a word while
// waiting, early in the loop and just before its end; 900 ms without a word while flowing, landing near a loop's end
// and in its middle; Settings' Animation speed set to Fast mid-loop, then a word right after it and the quiet after
// that, then Measured again. Slow (Cinematic) is a Working run of its own: the demo's run ends about 33 s after it
// starts, and on one run the chip was idle (data-ss idle, no loop) before the post-Slow .3-.4 window, which is ~3 s
// later on a 5120 ms loop (Alexis probe, 2026-11-15, qw3 run-probe1). That run sets Fast, then Slow, then Measured,
// and a finally sets Measured again if the leg stops short, so a later cell is not left at Cinematic. A word followed by a 200 ms long task before the next frame; the onboarding window opened mid-loop (it holds the app's animations; no words under it,
// so the pace turns to waiting while held), closed, then a word. For each change:
//   - at once: a word changes data-flow and the loop's length by the frame after it; the quiet one comes 900 ms after
//     the last word (the module's timer on the word's age; up to --set late=<ms>, default 150, plus the main thread's long tasks after it fell due);
//   - no jump, on what the compositor shows: at every sample (taken after each frame), the loop's place on the wall
//     clock under the timing just sampled equals its place under the timing of the sample before to within one frame
//     at the faster pace (no allowance for a sample two back) (the step the square makes when the frame hands the new timing over); the main thread's own view
//     too (place within a frame, two right after the chip re-placed its loop; scale and opacity within the fastest
//     ordinary frame of the same look), except in a frame after a long task, whose time is from before the task.
//     A new loop (a restart) at a change fails.
// Every frame from the first change on is judged the same way, not only the frames that hold a change.
// The onboarding window's open and close make every loop it holds jump by about the window's page-wide restyle (its
// pause and resume are taken by a late frame's time): the lead's call A (2026-11-13), the window's, not the chip's.
// The check samples another loop the window holds and names that restyle's frame. It waives a jump only when both of
// the chip's loops jump by the same amount in that frame (windowSpans, restyleFrame). A later jump of one loop fails.
// What it cannot see directly is the compositor; the hand-over above is computed from the timings the page reports.
// The Node model (tests/stop-chip-beat-verify.mjs) and lane S's films (share 2026-11-13-pm7-stop-chip-pace) judge it
// on a model of the compositor and on pixels.
// After the run ends nothing of the chip's is armed (PM56_SENDSTOP.debug(): no quiet timer, no speed listener, no pending frame callback).
// ONE PULSE (R40 F1, K2, K3): in every sampled frame in which both loops have a place, the backlight is at the glyph's
// place in the loop (to 0.002 of a loop): through the onboarding window (which must hold both), and through a light/dark
// change mid-run (first look, in a run of its own, as the demo's run ends about 33 s after it starts: Settings' Mode to
// the other brightness, a word and the quiet after it, and back; the backlight's loop must not be made anew).
// Failed on lane S's 5b74a3016a: the window held only the glyph and a light/dark change restarted the backlight.
// HIDDEN (first look, not the chat alone): words keep coming while the chat is hidden by display:none the way the
// Guided Tour hides it (00-host.js syncTour takes data-pm56 off #chatPanel; the check does that one step, not the tour):
// nothing of the chip's is armed while hidden (R41 F1: the quiet timer kept arming itself); shown again with words it
// is flowing at the flowing length, listening, and turns to waiting 900 ms after the last word.
// The page is opened with ?pm-still=off (a test hook, as perf-still-page uses it): main's still page (14-shell-still.js,
// PERF-3 = B) holds every endless loop 20 s after the last input, the chip's breath included, and this check sends none.
// Each look is SAVED through Settings before its run: a Settings save (the speed change) repaints the saved look, and
// with the kit's unsaved look() the page went back to Basic Dark mid-run (first runs: a look change, read as a jump).
// REDUCED (first look only): with Reduce motion on, the app's (Settings) and then the system's (prefers-reduced-motion),
// there is no loop and a word still changes data-flow; off again, the loop comes back at that cadence's length.
// Failed on main 6bd8294726: the listener (document, the chip's script), 41 loop ends dispatched in 3 s at rest, no
// change before a loop's end and a new loop at each, and Settings' speed change jumping a whole loop at the hand-over.
// Failed on lane S's 4bbe9d0551 (loops re-placed by the frame's time): the speed change jumped 0.15 of a loop.
//
// --set looks=<a,b>   default basic-dark,glass-dark,retro-dark,nier-dark,friendly-dark,basic-light
// --set parts=<a,b>   rest,pace,hidden,reduced (default all)   --set settle=<ms> (default 30000)   --set late=<ms> (default 150)
// --set chat=<url>    the chat alone (its standalone build): no Settings, no onboarding window; looks by PM56_DEMO.setTheme
// Both surfaces (--set sandbox=0 and 1). No Stop chip, or a change that did not happen, fails as "could not judge".
import { traceWindow } from '../helpers/frame-trace.mjs';
import { traceJudgeable } from '../helpers/trace-guard.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

// One Working run, driven and sampled inside the page; returns every frame's sample, the marks and the flips.
const PACE = async ({ speed, windowPart, themePart, themeOnly, speedOnly }) => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const frame = () => new Promise((r) => requestAnimationFrame(r));
	const SS = window.PM56_SENDSTOP, D = window.PM56_DEMO;
	const chip = () => document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
	const ids = new WeakMap(); let nid = 0;
	const idOf = (a) => { if (!ids.has(a)) ids.set(a, ++nid); return ids.get(a); };
	const rows = [], marks = [], flips = [], errors = [];
	const placeOf = (a) => { const c = a.effect.getComputedTiming(); return c.currentIteration == null ? null : c.currentIteration + c.progress; };
	const read = () => {
		const b = chip(), host = b && b.closest('[data-theme]');
		const r = { t: document.timeline.currentTime, w: performance.now(), ss: b && b.getAttribute('data-ss'), flow: b && b.getAttribute('data-flow'), th: host ? host.getAttribute('data-theme') : null, nier: document.documentElement.getAttribute('data-o55-nier'), win: document.documentElement.hasAttribute('data-o55-open') };
		if (!b) return r;
		const all = b.getAnimations({ subtree: true });
		const g = all.find((a) => /^ss-breathe/.test(a.animationName)), l = all.find((a) => /^ss-glow/.test(a.animationName));
		if (g) { const cs = getComputedStyle(b.querySelector('.ss-g')), m = cs.transform; r.ease = cs.animationTimingFunction; r.g = { id: idOf(g), name: g.animationName, dur: +g.effect.getTiming().duration, delay: +g.effect.getTiming().delay, s: g.startTime, c: g.currentTime, rate: g.playbackRate, place: placeOf(g), state: g.playState, v: m && m.startsWith('matrix(') ? parseFloat(m.slice(7)) : 1 }; }
		if (others.length) r.os = others.map((o) => ({ id: idOf(o), dur: +o.effect.getTiming().duration, delay: +o.effect.getTiming().delay, s: o.startTime, c: o.currentTime, rate: o.playbackRate, place: placeOf(o), state: o.playState, v: 0 }));
		if (l) r.b = { id: idOf(l), name: l.animationName, dur: +l.effect.getTiming().duration, delay: +l.effect.getTiming().delay, s: l.startTime, c: l.currentTime, rate: l.playbackRate, place: placeOf(l), state: l.playState, v: parseFloat((b.querySelector('.ss-blg') ? getComputedStyle(b.querySelector('.ss-blg')) : getComputedStyle(b.querySelector('.ss-bl'), '::before')).opacity) };
		return r;
	};
	let sampling = true, others = [], otherDesc = 'none';
	// sampled in a task posted from each frame callback, so after every frame callback of that frame (the chip's own
	// re-placement among them) and after the frame was handed over
	const mc = new MessageChannel();
	mc.port1.onmessage = () => { if (!sampling) return; try { rows.push(read()); } catch (e) { errors.push(String(e)); } };
	const tick = () => { if (!sampling) return; mc.port2.postMessage(0); requestAnimationFrame(tick); };
	// the main thread's long tasks (a late quiet timer is late by them: a Settings save, the onboarding window's restyle,
	// the check's own 200 ms task)
	const longs = [];
	let lto = null; try { lto = new PerformanceObserver((l) => { for (const e of l.getEntries()) longs.push({ s: e.startTime, e: e.startTime + e.duration }); }); lto.observe({ type: 'longtask', buffered: false }); } catch (e) { lto = null; }
	const mo = new MutationObserver((ms) => { for (const m of ms) { const v = m.target.getAttribute('data-flow'); if (m.attributeName === 'data-flow' && v !== m.oldValue && m.target.getAttribute('data-ss') === 'stop') flips.push({ i: rows.length, now: performance.now(), to: v }); } });
	const last = () => rows[rows.length - 1] || {};
	const frac = () => { const g = last().g; return g && g.place != null ? g.place % 1 : null; };
	const until = async (pred, ms = 9000) => { const end = performance.now() + ms; while (!pred()) { if (performance.now() > end) return false; await frame(); } return true; };
	let feeding = false, nextWord = 0, lastWord = 0, ownWord = false;
	// the page's own words (turn-stream.js and thought-stream.js call PM56_SENDSTOP.token at release), counted apart
	// from the check's
	const pageWords = [], tok = SS.token;
	SS.token = function () { if (!ownWord) pageWords.push({ at: performance.now(), tid: arguments[0] }); return tok.apply(this, arguments); };
	const word = () => { ownWord = true; try { SS.token(); } finally { ownWord = false; } lastWord = performance.now(); };
	let themeNote = null;
	const mark = (name, extra) => marks.push({ name, i: rows.length, now: performance.now(), ft: document.timeline.currentTime, frac: frac(), ...extra });
	// words are released inside a frame callback every 100 ms, as turn-stream.js:352 and thought-stream.js:229 release
	// them (R32 F4: a timer released them between frames, a path the app does not use)
	const feedTick = () => { if (!feeding) return; if (performance.now() >= nextWord) { word(); nextWord = performance.now() + 100; } requestAnimationFrame(feedTick); };
	const feedOn = () => { if (feeding) return; feeding = true; nextWord = performance.now() + 100; requestAnimationFrame(feedTick); };
	const feedOff = () => { feeding = false; };
	// a word between two frames, as a mark
	// a word inside a frame callback (the code after `await frame()` runs in that callback's microtask checkpoint)
	const wordAt = async (name) => { await frame(); mark(name, { kind: 'word' }); word(); feedOn(); };
	// the same, then a long task before the next frame (R32 F2: the change handed over by this frame was re-placed again
	// by the next one, by the old timing, and the square stepped back by the task's length times the change of rate)
	const wordThenTask = async (name, ms) => {
		await frame(); mark(name, { kind: 'word', task: ms }); word();
		setTimeout(() => { const end = performance.now() + ms; while (performance.now() < end) { /* a long task */ } }, 0);
		feedOn();
	};
	// stop the words so that the quiet change (900 ms later) lands near `target` of a loop at the flowing length
	const snap = () => {
		const r = last(), one = (x) => (x ? { dur: x.dur, place: x.place, state: x.state } : null);
		let debug = null;
		try { debug = SS.debug(); } catch (e) { debug = String(e); }
		return JSON.stringify({ ss: r.ss, flow: r.flow, nier: r.nier, g: one(r.g), b: one(r.b), debug });
	};
	let quietWhy = '';
	const quietAt = async (name, target) => {
		await sleep(400);
		const ahead = 901 / (last().g ? last().g.dur : 2200);
		const stopAt = ((target - ahead) % 1 + 1) % 1;
		if (!(await until(() => { const f = frac(); return f != null && Math.abs(f - stopAt) < 0.02; }))) { quietWhy = 'position ' + snap(); return false; }
		feedOff(); word();                                            // the last word, now
		marks.push({ name, i: -1, kind: 'quiet', wordAt: lastWord, aim: target });
		const ok = await until(() => last().flow === 'waiting', 3000);
		if (!ok) quietWhy = 'flow ' + snap();
		return ok;
	};
	const inLoop = (lo, hi) => until(() => { const f = frac(); return f != null && f >= lo && f <= hi && last().g.place >= 1; });
	// After Settings applies a speed, wait until the loops show that factor. A fixed 150 ms still had
	// no ss-breathe on the frame after the Slow word (glass-dark, the same run: flow "waiting", glyph
	// undefined). NieR hides .ss-bl (send-stop.css) and the glow element lives inside it, so only the glyph is required there.
	const expectDur = async (factor) => until(() => {
		const r = last();
		if (!r.g || !(r.g.dur > 0) || r.g.place == null) return false;
		const base = r.flow === 'flowing' ? 2200 : 3200;
		if (Math.abs(r.g.dur - base * factor) > 1) return false;
		if (r.b && r.b.dur > 0) return Math.abs(r.b.dur - base * factor) <= 1;
		return r.nier === 'on';
	}, 8000);

	try {
		D.pauseWorking(); await sleep(300);
		mo.observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-flow'] });
		requestAnimationFrame(tick);
		D.startWorking();
		if (!(await until(() => last().ss === 'stop' && last().g && last().g.place >= 1.0, 12000))) throw new Error(`no breathing Stop chip: ${JSON.stringify(last())}`);
		if (last().flow !== 'waiting') { await until(() => last().flow === 'waiting', 3000); }
		// (a run of its own for the light/dark change: the demo's run ends about 33 s after it starts, before the first
		// look's other parts are through)
		if (!themeOnly && !speedOnly) {
		// a word while waiting, early in the loop; then quiet landing near the loop's end
		if (!(await inLoop(0.2, 0.3))) throw new Error('early: the loop never reached .2-.3');
		await wordAt('word while waiting, early in the loop');
		if (!(await quietAt('quiet while flowing, landing near the loop end', 0.95))) throw new Error('quiet near the end: no change');
		// a word just before the loop's end; then quiet landing mid-loop
		if (!(await inLoop(0.955, 0.99))) throw new Error('late: the loop never reached .955-.99');
		await wordAt('word while waiting, just before the loop end');
		if (!(await quietAt('quiet while flowing, landing mid-loop', 0.5))) throw new Error('quiet mid-loop: no change');
		// a word from a frame callback, then a 200 ms long task before the next frame; then quiet again
		if (!(await inLoop(0.3, 0.4))) throw new Error('long task: the loop never reached .3-.4');
		await wordThenTask('word while waiting, then a 200 ms long task', 200);
		if (!(await quietAt('quiet after the long task', 0.6))) throw new Error('quiet after the long task: no change');
		}
		if (speed || speedOnly) {
			// Measured is put back in a finally so a throw cannot leave Cinematic on for the next cell
			// (the first failing run read 3520 and 5120 ms there, 2200 and 3200 times 1.6).
			let speedBack = false;
			const setMeasured = () => {
				const okM = window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Measured');
				if (!okM) throw new Error('Settings refused Measured');
				speedBack = true;
			};
			try {
				if (!(await inLoop(0.3, 0.4))) throw new Error('speed: the loop never reached .3-.4 (' + snap() + ')');
				await sleep(2); mark('Animation speed Fast, waiting, mid-loop', { kind: 'speed' });
				const ok = window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Fast');
				if (!ok) throw new Error('Settings refused Fast');
				// The run of its own waits until the loops show the new length. A fixed 150 ms, on the
				// long run, still had no glyph on the frame after Slow (glass-dark, Alexis, 2026-11-15).
				// The run main already had keeps that 150 ms, so it judges the same Fast hand-over.
				if (speedOnly) { if (!(await expectDur(0.6))) throw new Error('Fast did not land (' + snap() + ')'); }
				else await sleep(150);
				await wordAt('word right after the speed change');
				if (!(await quietAt('quiet after the speed change', 0.7))) throw new Error('quiet after speed: no change (' + quietWhy + ')');
				if (speedOnly) {
					// Both cadences are sampled before Measured, for judgeSpeed. This run is the only
					// one that sets Slow: the demo's ~33 s run has ended by then on the long pace.
					if (!(await inLoop(0.3, 0.4))) throw new Error('slow: the loop never reached .3-.4 (' + snap() + ')');
					await sleep(2); mark('Animation speed Slow (Cinematic), waiting, mid-loop', { kind: 'speed' });
					const okSlow = window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Cinematic');
					if (!okSlow) throw new Error('Settings refused Cinematic');
					if (!(await expectDur(1.6))) throw new Error('Slow did not land (' + snap() + ')');
					await wordAt('word right after Slow');
					if (!(await quietAt('quiet after Slow', 0.7))) throw new Error('quiet after Slow: no change (' + quietWhy + ')');
					if (!(await inLoop(0.3, 0.4))) throw new Error('speed back: the loop never reached .3-.4 (' + snap() + ')');
				} else if (!(await inLoop(0.3, 0.4))) throw new Error('speed back: the loop never reached .3-.4');
				await sleep(2); mark('Animation speed Measured, waiting, mid-loop', { kind: 'speed' });
				setMeasured();
				await sleep(300);
			} finally {
				if (!speedBack) { try { setMeasured(); } catch (e) { errors.push('speed not restored: ' + String(e && e.message || e)); } }
			}
		}
		if (windowPart) {
			await wordAt('word before the window');
			await sleep(500);
			if (!(await until(() => { const f = frac(); return f != null && f >= 0.3 && f <= 0.45; }))) throw new Error('window: the loop never reached .3-.45');
			feedOff(); word();                                            // the last word before the window
			const desc = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
			const loopOf = (state) => (a) => a.animationName && a.playState === state && a.effect && a.effect.getTiming().iterations === Infinity && a.effect.target && !a.effect.pseudoElement && !(a.effect.target.closest && (a.effect.target.closest('.sendstop') || a.effect.target.closest('#pm-o55-onboarding')));
			// the references: up to 12 running loops of the app, taken BEFORE the window opens so the open's own pause is
			// sampled; a pair in which a reference's length or delay changed (NieR restyles some as the window opens) is
			// not counted (windowSpans)
			// from the chip's own part of the page (the child of <body> it lives in), which the window holds with the chip
			let top = chip(); while (top && top.parentElement && top.parentElement !== document.body) top = top.parentElement;
			others = document.getAnimations().filter((a) => loopOf('running')(a) && top && top.contains(a.effect.target)).slice(0, 12);
			await sleep(2); mark('onboarding window opens (holds the glyph), no more words', { kind: 'window' });
			window.O55.ui.open();
			marks.push({ name: 'quiet under the window', i: -1, kind: 'quiet', wordAt: lastWord });
			// another loop the window holds, sampled with the chip as the page-wide reference for what the window's
			// close does to every held loop (an infinite CSS loop on an element of the app, not the chip)
			await until(() => document.documentElement.hasAttribute('data-o55-open'), 3000); await frame(); await frame();
			const held = others.filter((o) => o.playState === 'paused');
			otherDesc = `${held.length} of ${others.length} held: ${held.slice(0, 4).map((o) => `${o.animationName} on ${desc(o.effect.target)} (${o.effect.getTiming().duration} ms)`).join(', ')}${held.length > 4 ? ', ...' : ''}`;
			await until(() => last().flow === 'waiting', 3000);
			await sleep(1500);
			await sleep(2); mark('onboarding window closes', { kind: 'window' });
			window.O55.ui.close();
			await until(() => !document.documentElement.hasAttribute('data-o55-open'), 5000);
			await sleep(400);
			await wordAt('word after the window');
			await sleep(400); feedOff();
		}
		if (themePart) {
			// a light/dark change mid-run, through Settings (the look's cover runs over it), and back: the backlight keeps
			// its loop and its place with the glyph (K3: its keyframes were swapped, a new loop out of phase)
			await until(() => last().flow === 'waiting', 3000);
			if (!(await inLoop(0.3, 0.4))) throw new Error('light/dark: the loop never reached .3-.4');
			const light = String(last().th || '').endsWith('-light'), to = light ? 'Dark' : 'Light', back = light ? 'Light' : 'Dark';
			const pw0 = pageWords.length, t0 = performance.now();
			await sleep(2); mark(`light/dark change mid-run (to ${to})`, { kind: 'theme' });
			window.PM12_KIMI.setSettingFromHost('general.visual.theme-mode', to);
			await sleep(1500);
			// a light/dark change can set the page's own words going (first runs: no quiet change 3 s after the check's
			// last word): wait for them to stop before the check's own word and quiet
			await until(() => last().flow === 'waiting', 6000);
			const pw = pageWords.slice(pw0);
			themeNote = { pageWords: pw.length, first: pw.length ? Math.round(pw[0].at - t0) : null, last: pw.length ? Math.round(pw[pw.length - 1].at - t0) : null, tids: [...new Set(pw.map((x) => String(x.tid)))], flow: last().flow, debug: SS.debug() };
			if (last().flow === 'waiting') {
				await wordAt('word after the light/dark change');
				if (!(await quietAt('quiet after the light/dark change', 0.5))) {
					// what the chip's module finds (its own selector) against the chip the check samples
					const path = (el) => { const out = []; for (let e = el; e && e !== document.body && out.length < 8; e = e.parentElement) out.push(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.classList && e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '')); return out.join(' < '); };
					const odd = rows.filter((r) => r.w >= t0 && r.ss !== 'stop').slice(0, 6).map((r) => ({ at: Math.round(r.w - t0), ss: r.ss }));
					themeNote.quiet = { odd, flow: last().flow, debug: SS.debug(), pageWords: pageWords.length - pw0, chips: [...document.querySelectorAll('.composer-infield .sendstop')].map((x) => ({ ss: x.getAttribute('data-ss'), same: x === chip(), box: x.getClientRects().length, path: path(x) })), sampled: chip() ? path(chip()) : null };
					throw new Error(`quiet after light/dark: no change (${JSON.stringify(themeNote)})`);
				}
			}
			if (!(await inLoop(0.6, 0.7))) throw new Error('light/dark back: the loop never reached .6-.7');
			await sleep(2); mark(`light/dark change back (to ${back})`, { kind: 'theme' });
			window.PM12_KIMI.setSettingFromHost('general.visual.theme-mode', back);
			await sleep(1500);
		}
		await sleep(300);
	} catch (e) { errors.push(String(e && e.message || e)); }
	SS.token = tok;
	feedOff();
	sampling = false; mo.disconnect(); if (lto) lto.disconnect();
	await frame();
	D.pauseWorking();
	await sleep(400);
	const after = { ss: chip() && chip().getAttribute('data-ss'), debug: SS.debug() };
	// tie each quiet change to its flip
	for (const m of marks) if (m.kind === 'quiet') {
		const fl = flips.find((x) => x.to === 'waiting' && x.now >= m.wordAt);
		if (!fl) continue;
		m.i = fl.i; m.flipMs = Math.round(fl.now - m.wordAt);
		// how long the main thread was held by long tasks between the timer's due time (900 ms after the word) and the change
		const from = m.wordAt + 900, to = fl.now;
		m.blockedMs = Math.round(longs.reduce((sum, x) => sum + Math.max(0, Math.min(x.e, to) - Math.max(x.s, from)), 0));
	}
	return { rows, marks, flips, errors, after, otherDesc, themeNote, pageWords: pageWords.length };
};

// The chat hidden by display:none with the chip still in the document, words still arriving (R41 F1): returns what the
// chip's module has armed while hidden and how it picks up when shown again.
const HIDDEN = async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const frame = () => new Promise((r) => requestAnimationFrame(r));
	const SS = window.PM56_SENDSTOP, D = window.PM56_DEMO;
	const chip = () => document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
	const cp = document.getElementById('chatPanel');
	if (!cp || cp.getAttribute('data-pm56') !== 'on') return { error: 'no hosted chat panel (#chatPanel[data-pm56="on"])' };
	const glyph = () => { const b = chip(); const a = b && b.getAnimations({ subtree: true }).find((x) => x.animationName === 'ss-breathe'); return a ? { dur: +a.effect.getTiming().duration, running: a.playState === 'running' } : null; };
	const now = () => { const b = chip(); return { ss: b && b.getAttribute('data-ss'), flow: b && b.getAttribute('data-flow'), box: b ? b.getClientRects().length : null, glyph: glyph(), debug: SS.debug() }; };
	let feeding = false, next = 0, lastWord = 0;
	const feed = () => { if (!feeding) return; if (performance.now() >= next) { SS.token(); lastWord = performance.now(); next = lastWord + 100; } requestAnimationFrame(feed); };
	const out = {};
	try {
		D.pauseWorking(); await sleep(300); D.startWorking();
		const end = performance.now() + 12000;
		while (!(now().ss === 'stop' && glyph() && glyph().running)) { if (performance.now() > end) return { error: `no breathing Stop chip: ${JSON.stringify(now())}` }; await frame(); }
		await sleep(1200);
		feeding = true; requestAnimationFrame(feed);
		await sleep(1500);
		out.before = now();
		cp.removeAttribute('data-pm56');                               // what the host does for the Guided Tour
		await sleep(1500); out.hidden1 = now();
		await sleep(1500); out.hidden2 = now();
		cp.setAttribute('data-pm56', 'on');                            // the tour has ended: shown again, words still arriving
		await sleep(400); out.shown = now();
		feeding = false;
		const t0 = performance.now();
		while (now().flow !== 'waiting' && performance.now() - t0 < 3000) await frame();
		out.quietMs = Math.round(performance.now() - lastWord); out.quiet = now();
	} finally {
		feeding = false;
		if (cp.getAttribute('data-pm56') !== 'on') cp.setAttribute('data-pm56', 'on');
		D.pauseWorking(); await sleep(400);
	}
	out.after = now();
	return out;
};

// One pulse (R40 F1): in every sample in which both loops have a place and the same timing, how far the backlight's
// place in the loop is from the glyph's (both read in the same task, by the same frame's time).
function inPhase(R) {
	let n = 0, worst = 0, where = null;
	for (const r of R.rows) {
		const g = r.g, b = r.b;
		if (!g || !b || g.place == null || b.place == null || g.dur !== b.dur || g.delay !== b.delay) continue;
		n++;
		const x = (((b.place - g.place) % 1) + 1) % 1, d = Math.min(x, 1 - x);
		if (d > worst) { worst = d; where = `+${Math.round(r.w - R.rows[0].w)} ms: glyph ${g.place.toFixed(4)}, backlight ${b.place.toFixed(4)}${r.win ? ', under the window' : ''}, ${r.th}`; }
	}
	return { n, worst, where };
}

// What a person sees is the compositor's: a retimed loop reaches it only with the next frame, and until then it keeps
// moving the square on the OLD timing by the wall clock, also through a long task. So at each sample the loop's place
// is taken on the wall clock (performance.now at the sample) under the timing just sampled and under the timing of
// the sample before: the difference is the step the square makes when the frame hands the new timing over (0 when
// nothing was retimed). The main thread's own view (its place by the frame's time, the computed scale and opacity) is
// judged too, except in a frame that comes after a long task: its time is the frame's BEGINNING, from before the task.
const shownAt = (x, w) => (x.state === 'paused' || x.s == null ? (x.c - x.delay) / x.dur : ((w - x.s) * (x.rate || 1) - x.delay) / x.dur);
const medianFrame = (rows) => { const d = []; for (let i = 1; i < rows.length; i++) d.push(rows[i].w - rows[i - 1].w); d.sort((a, b) => a - b); return d[d.length >> 1] || 8.33; };
function pair(R, i, layer, maxRate, frame) {
	const r0 = R.rows[i - 1], r1 = R.rows[i], a = r0[layer], b = r1[layer];
	if (!a || !b) return null;
	if (a.id !== b.id) return { restart: true };
	const out = {};
	// Every shown frame against the frame before it (R32 F4: no allowance for a sample two back, which hid F2). A loop
	// pending its start time (just made, not yet started by a frame) has no place to judge and is skipped.
	const placed = (x) => x.state === 'paused' || x.s != null;
	if (placed(a) && placed(b)) {
		const h0 = shownAt(a, r1.w), h1 = shownAt(b, r1.w);
		if (h0 >= 0 || h1 >= 0) {
			// a change made in a frame that follows a long task can be handed over late by that task's tail, a step of at
			// most (the late time) x (the two paces' difference): the bound grows with the gap between the two samples by
			// that much (the lead's ruling, 2026-11-14: the session's first Settings save, 853 ms between samples, 0.0151)
			const gap = r1.w - r0.w, late = Math.max(0, gap - frame) * Math.abs(1 / b.dur - 1 / a.dur);
			out.hand = +Math.abs(h1 - h0).toFixed(5); out.handBound = +(frame / Math.min(a.dur, b.dur) * 1.1 + 0.002 + late).toFixed(5);
			if (gap > 100) { out.gap = Math.round(gap); out.lateAllow = +late.toFixed(5); }
		}
	}
	// the main thread's view is from the frame's own time: not judged when that time lags the wall clock by more than
	// a frame or two at the sample (a busy frame that began before a long task) or the samples are far apart; the
	// hand-over above is judged always (lane S safety net on s-4: a frame whose time lagged ~37 ms showed a just-placed
	// loop 0.0133 ahead on the main thread while the hand-over step was 0.0012)
	out.stale = r1.w - r0.w > 3 * frame || r1.w - r1.t > 3 * frame;
	if (!out.stale && a.place != null && b.place != null) {
		// a loop the chip has just re-placed is put by the wall clock, which runs up to a frame ahead of the frame's own
		// time: the main thread's view may then move up to two frames (the hand-over above stays at one)
		const dt = r1.t - r0.t, k = a.dur !== b.dur || a.delay !== b.delay || (a.s != null && b.s != null && Math.abs(a.s - b.s) > 0.5) ? 2 : 1;
		// ONLY in the frame in which a hold takes effect (running -> paused): the hold may be placed by the wall clock, as
		// the onboarding window's hold by marks (FO-181, 14-window-hold.js) puts a compositor loop where the compositor
		// shows it (performance.now() in the hold's own frame). Its place may then run ahead of the frame's own time by
		// the wall clock's lead over that time at the sample, no more (the frame's time is the hold's start; the sample
		// comes after the hold). The allowance is written in the row.
		const holdNow = a.state === 'running' && b.state === 'paused', lead = holdNow ? Math.max(0, r1.w - r1.t) : 0;
		if (holdNow) out.holdMs = +lead.toFixed(1);
		out.place = +(b.place - a.place).toFixed(5); out.placeBound = +((k * Math.max(dt, frame) + lead) / Math.min(a.dur, b.dur) * 1.1 + 0.002).toFixed(5);
		out.value = +Math.abs(b.v - a.v).toFixed(5); out.valueBound = +(maxRate * (k * Math.max(dt, frame) + lead) * 1.15 + 0.002).toFixed(5);
		// re-placed by the wall clock, the main thread's view may also sit a hair behind (its frame's time began before
		// the task that re-placed it): within the bound either way then, never backwards otherwise
		out.floor = k === 2 ? -out.placeBound : -1e-6;
	}
	out.ok = (out.hand == null || out.hand <= out.handBound) && (out.place == null || (out.place >= out.floor && out.place <= out.placeBound && out.value <= out.valueBound));
	return out;
}
function rates(R) {
	const out = {};
	for (const layer of ['g', 'b']) {
		const changes = new Set(R.marks.map((m) => m.i).filter((i) => i > 0));
		let maxRate = 0;
		for (let i = 1; i < R.rows.length; i++) {
			const a = R.rows[i - 1][layer], b = R.rows[i][layer];
			if (!a || !b || a.id !== b.id || changes.has(i) || R.rows[i - 1].flow !== 'flowing' || R.rows[i].flow !== 'flowing' || a.dur !== b.dur || a.place == null || b.place == null) continue;
			const dt = R.rows[i].t - R.rows[i - 1].t; if (dt <= 0) continue;
			maxRate = Math.max(maxRate, Math.abs(b.v - a.v) / dt);
		}
		out[layer] = maxRate;
	}
	return out;
}
// The onboarding window pauses the app's loops as it opens and resumes them as it closes, each time with a page-wide
// restyle (~240 ms on the Windows PC) in the same task: the frame after it is late, and Chrome takes the pause's hold
// (or the resume's start) by that frame's time, from before the restyle, so EVERY held loop jumps when that frame is
// handed over (back at the open, forward at the close) by about the restyle's length. The lead's call A (2026-11-13):
// the window's, not the chip's (main's page shows it for the chip and another held loop alike). The waiver is that
// restyle's own frame only, and only when BOTH of the chip's loops jump by the same amount there (PM7PERF-STOPCHIP-K1-WAIVER:
// a later jump of the backlight alone used to be named along with it). Any other jump of the chip fails.
// The reference loops (up to 12, taken before the open; pairs in which a loop's own timing changed are not counted)
// name which frame the restyle was.
function windowSpans(R, frame) {
	const out = [];
	for (const name of ['onboarding window opens (holds the glyph), no more words', 'onboarding window closes']) {
		const m = R.marks.find((x) => x.name === name);
		if (!m || m.i <= 0) continue;
		const from = m.i, until = R.rows.findIndex((r, i) => i > from && r.w - R.rows[from].w > 3000);
		const to = until < 0 ? R.rows.length : until;
		let other = 0, otherAt = null, otherI = null;
		// a pause or resume taken by a late frame's time moves a loop by at most the time between the two samples around
		// it: a reference step past that (its own timing changed: NieR restyles it) is not a measure of the window's jump
		for (let i = from; i < to; i++) {
			const r0 = R.rows[i - 1], r1 = R.rows[i];
			if (!r0.os || !r1.os) continue;
			for (let k = 0; k < Math.min(r0.os.length, r1.os.length); k++) {
				const a = r0.os[k], b = r1.os[k];
				if (a.id !== b.id || a.dur !== b.dur || a.delay !== b.delay || !(b.dur > 0)) continue;
				const h0 = shownAt(a, r1.w), h1 = shownAt(b, r1.w);
				if (!(h0 >= 0 || h1 >= 0)) continue;
				const ms = Math.abs(h1 - h0) * b.dur;
				if (ms > r1.w - r0.w + frame) continue;
				if (ms > other) { other = ms; otherAt = Math.round(r1.w - R.rows[from].w); otherI = i; }
			}
		}
		out.push({ what: /opens/.test(name) ? 'open' : 'close', from, to, otherMs: other, otherAt, otherI, limitMs: other + frame });
	}
	return out;
}
// PM7PERF-STOPCHIP-OPEN-SPAN-SHADOWS-CLOSE (R64 A1): when the window closes within 3 s of opening, both spans
// contain the close's frame, and the first match (the open) judged the close's accepted jump against the open's
// reference frame and failed it. Among the spans that contain the sample, use the one whose reference frame
// (otherI) is the nearest at or before the sample: the close's span for the close's own frame. A span whose
// reference frame is later than the sample (or missing) could not waive it anyway. Nothing else about the
// waiver changes (one jump a window, the two size caps, the NieR rules).
const spanOf = (spans, i) => {
	let best = null;
	for (const x of spans) {
		if (i < x.from || i >= x.to || x.otherI == null || x.otherI > i) continue;
		if (!best || x.otherI > best.otherI) best = x;
	}
	return best;
};
// True only on the restyle's own frame. When both loops are drawn, both must jump by more than
// one frame, by the same amount (within one frame of each other), on that frame exactly.
// NieR draws no glow (send-stop.css: .ss-bl is display:none; one pulse reads 0 frames with both
// loops). The glyph's jump is the window's. It is sometimes the next sample, not otherI:
// run-s0-1 (Alexis, 2026-11-15) named nothing while the reference jumped 373 ms at +379 ms and
// the glyph's hand-over was 0.16932 of the 2200 ms loop (372 ms). That neighbour is waived only
// when its size is the reference's, within one frame. A later jump, or a different size, fails.
// A waived jump keeps main's two caps (R62): it is no larger than the reference's jump plus a frame (wc.limitMs),
// and, on the reference's own frame, no larger than the gap between its two samples plus a frame. One jump a
// window (R62-A1): the next sample is waived only when the glyph did not jump on the reference's own frame, and
// the sample before the reference's frame never is.
function restyleFrame(R, i, frame, spans) {
	const wc = spanOf(spans, i);
	if (!wc || wc.otherI == null) return false;
	const msOf = (k, layer) => {
		if (k < 1 || k >= R.rows.length) return null;
		const row = R.rows[k][layer], prev = R.rows[k - 1][layer];
		if (!row || !prev || !(row.dur > 0)) return null;
		const x = pair(R, k, layer, 0, frame);
		if (!x || x.hand == null) return null;
		return x.hand * row.dur;
	};
	const capped = (ms) => ms <= wc.limitMs && ms <= R.rows[i].w - R.rows[i - 1].w + frame;
	const g = msOf(i, 'g'), b = msOf(i, 'b');
	if (g == null || !(g > frame)) return false;
	const glowRuns = (R.rows || []).some((r) => r && r.b && r.b.place != null && r.b.dur > 0);
	const nierRun = (R.rows || []).some((r) => r && r.nier === 'on');
	if (!glowRuns && nierRun && b == null) {
		if (i === wc.otherI) return capped(g);
		if (i !== wc.otherI + 1) return false;
		const own = msOf(wc.otherI, 'g');
		return !(own != null && own > frame) && Math.abs(g - wc.otherMs) <= frame;
	}
	if (i !== wc.otherI || b == null) return false;
	return b > frame && Math.abs(g - b) <= frame && capped(g) && capped(b);
}
// Every frame from the first change to the end, not only the frames that hold a change: the loop is never made anew,
// never jumps at a hand-over, and (outside the frames after a long task) its place never moves more than one frame at
// the faster pace (a retime that something else did at a moment no mark names shows here).
export function everyFrame(R) {
	const out = { worst: 0, where: null, restarts: [], known: [], valueFails: 0 }, frame = medianFrame(R.rows), mr = rates(R), spans = windowSpans(R, frame);
	out.spans = spans;
	// The sampling window is from the first change on. A frame before that is the only one discarded.
	// Inside the window a glyph-scale or backlight-opacity step past its bound is counted and fails the row
	// (PM7PERF-STOPCHIP-FRAME-GUARD: that comparison used to be left out of `over`).
	const first = Math.max(1, Math.min(...R.marks.map((m) => m.i).filter((i) => i > 0)));
	for (const layer of ['g', 'b']) {
		for (let i = first; i < R.rows.length; i++) {
			const x = pair(R, i, layer, mr[layer], frame); if (!x) continue;
			const t = Math.round(R.rows[i].w - R.rows[first].w);
			if (x.restart) { out.restarts.push(`${layer === 'g' ? 'glyph' : 'backlight'} +${t} ms`); continue; }
			const valueOver = x.value != null && !(x.value <= x.valueBound) ? x.value / (x.valueBound > 0 ? x.valueBound : 1e-9) : 0;
			if (valueOver > 1) out.valueFails++;
			const wc = spanOf(spans, i);
			if (valueOver <= 1 && x.hand != null && x.hand > x.handBound && restyleFrame(R, i, frame, spans)) {
				const ms = x.hand * R.rows[i][layer].dur;
				out.known.push(`${layer === 'g' ? 'glyph' : 'backlight'} ${Math.round(ms)} ms (${x.hand} of a loop) at +${Math.round(R.rows[i].w - R.rows[wc.from].w)} ms after the ${wc.what}, with the other loop`); continue;
			}
			const over = Math.max(x.hand != null ? x.hand / x.handBound : 0, x.place != null ? (x.place < x.floor ? 99 : Math.abs(x.place) / x.placeBound) : 0, valueOver);
			if (over > out.worst) { const a = R.rows[i - 1][layer], b = R.rows[i][layer]; out.worst = over; out.where = `${layer === 'g' ? 'glyph' : 'backlight'} +${t} ms: hand-over ${x.hand ?? '-'} (bound ${x.handBound ?? '-'}${x.gap != null ? `, of which ${x.lateAllow} for a late hand-over: ${x.gap} ms between samples` : ''}), main-thread place ${x.place ?? 'stale frame'} (bound ${x.placeBound ?? '-'}${x.holdMs != null ? `, of which ${x.holdMs} ms for a hold placed by the wall clock` : ''}), value ${x.value ?? '-'} (bound ${x.valueBound ?? '-'}), length ${a.dur} -> ${b.dur}, delay ${a.delay} -> ${b.delay}, start ${a.s == null ? '-' : Math.round(a.s)} -> ${b.s == null ? '-' : Math.round(b.s)}, ${a.state} -> ${b.state}, window ${R.rows[i - 1].win ? 'open' : 'closed'} -> ${R.rows[i].win ? 'open' : 'closed'}, ${Math.round(R.rows[i].w - R.rows[i - 1].w)} ms between samples, theme ${R.rows[i - 1].th} -> ${R.rows[i].th}`; }
		}
	}
	return out;
}

// Settings' Animation speed (17-look.js): Fast 0.6, Slow is Cinematic 1.6, Measured 1. The unscaled loops are
// 2200 ms while words arrive and 3200 ms while the run waits. The last sample of each cadence between one speed
// mark and the next is the one the speed has settled on (the mark is taken before Settings applies it).
export const SPEED_FACTOR = { Fast: 0.6, Slow: 1.6, Cinematic: 1.6, Measured: 1 };
export const LOOP_BASE = { flowing: 2200, waiting: 3200 };
export function judgeSpeed(R) {
	const marks = (R.marks || []).filter((m) => m.kind === 'speed' && m.i >= 0);
	const bad = [];
	const seen = [];
	// Judge each pace's terminal sample. NieR hides the backlight on restyle, so a glyph-only
	// NieR sample is allowed even when that pace or another pace earlier showed a glow.
	for (let s = 0; s < marks.length; s++) {
		const m = marks[s];
		const speed = /Fast/.test(m.name) ? 'Fast' : /Slow|Cinematic/.test(m.name) ? 'Slow' : null;
		if (!speed) continue;
		const factor = SPEED_FACTOR[speed];
		const end = s + 1 < marks.length ? marks[s + 1].i : R.rows.length;
		const lastRow = {};
		for (let i = m.i; i < end && i < R.rows.length; i++) {
			const r = R.rows[i];
			if (!r || (r.flow !== 'waiting' && r.flow !== 'flowing')) continue;
			lastRow[r.flow] = r;
		}
		seen.push(speed);
		for (const flow of ['waiting', 'flowing']) {
			const term = lastRow[flow], glyph = term?.g, backlight = term?.b;
			const want = LOOP_BASE[flow] * factor;
			if (!(glyph?.dur > 0)) bad.push({ speed, flow, layer: 'glyph', missing: true });
			else if (Math.abs(glyph.dur - want) > 1) bad.push({ speed, flow, layer: 'glyph', dur: glyph.dur, want });
			if (backlight?.dur > 0) {
				if (Math.abs(backlight.dur - want) > 1) bad.push({ speed, flow, layer: 'backlight', dur: backlight.dur, want });
			} else if (term?.nier !== 'on') bad.push({ speed, flow, layer: 'backlight', missing: true });
		}
	}
	if (!seen.includes('Fast') || !seen.includes('Slow')) bad.push({ missing: ['Fast', 'Slow'].filter((x) => !seen.includes(x)) });
	return { ok: bad.length === 0, bad };
}

// Judge one look's samples at its changes.
function judge(R, look) {
	const out = [], frame = medianFrame(R.rows), mr = rates(R), spans = windowSpans(R, frame);
	for (const layer of ['g', 'b']) {
		for (const m of R.marks) {
			if (m.i <= 0 || m.i >= R.rows.length) continue;
			const r0 = R.rows[m.i - 1], r1 = R.rows[m.i], a = r0[layer], b = r1[layer];
			if (!a && !b) continue;
			const themes = [...new Set(R.rows.slice(Math.max(0, m.i - 2), m.i + 3).map((r) => `${r.th}${r.nier === 'on' ? '+nier' : ''} ${r.ease}`))].join(' > ');
			const row = { look, layer: layer === 'g' ? 'glyph' : 'backlight', name: m.name, kind: m.kind, themes, frac: a && a.place != null ? +(a.place % 1).toFixed(3) : null, dt: +(r1.w - r0.w).toFixed(1), from: a && a.dur, to: b && b.dur, flowTo: r1.flow, flipMs: m.flipMs };
			const x = pair(R, m.i, layer, mr[layer], frame);
			if (!x || x.restart) { row.restart = true; out.push(row); continue; }
			Object.assign(row, x);
			// the page-wide jump around the window's open and close (windowSpans): named, not failed, when the rest is fine
			if (!row.ok && row.hand > row.handBound && restyleFrame(R, m.i, frame, spans) && (row.place == null || (row.place >= row.floor && row.place <= row.placeBound && row.value <= row.valueBound))) { row.ok = true; row.known = true; }
			out.push(row);
		}
	}
	return out;
}

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark,friendly-dark,basic-light').split(',').filter(Boolean);
	const parts = new Set(String(t.args.parts || 'rest,pace,hidden,reduced').split(','));
	const late = Number(t.args.late || 150);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	// the chat alone (its standalone build, `--set chat=<url>`): no Settings, no onboarding window, no pages
	const alone = !!t.args.chat;
	let f;
	if (alone) { await t.goto(String(t.args.chat)); f = t.page.mainFrame(); } else f = await t.app.open({ query: 'pm-warm=0&pm-still=off' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	const ready = alone
		? await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP), null, { timeout: 60000 }).then(() => true, () => false)
		: await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP && window.PM_PAGES && window.PM12_KIMI && window.O55 && O55.ui), null, { timeout: 60000 }).then(() => true, () => false);
	await t.check(alone ? 'the standalone chat\'s demo and its send button module are in the page' : 'the chat\'s demo, its send button module, Settings and the onboarding window are in the page', ready, ready ? 'ok' : 'missing after 60 s: could not judge');
	if (!ready) return;
	await t.page.waitForTimeout(Number(t.args.settle ?? (alone ? 8000 : 30000)));
	const sandbox = f !== t.page.mainFrame();
	const home = () => (alone ? Promise.resolve() : f.evaluate(() => PM_PAGES.go('dashboard')));
	// Measured is the default. A pace leg that already put it back does not write again (a second
	// save rebuilds Settings). A leg that threw is put back here too, before the next look.
	const restoreMeasured = async () => {
		if (alone) return;
		await f.evaluate(() => {
			const K = window.PM12_KIMI;
			if (!K || typeof K.getState !== 'function' || typeof K.setSettingFromHost !== 'function') return;
			let cur = null;
			try { cur = K.getState().settings['general.visual.animation-speed']; } catch (e) { return; }
			if (cur && cur !== 'Measured') K.setSettingFromHost('general.visual.animation-speed', 'Measured');
		}).catch(() => {});
	};

	if (parts.has('rest')) {
		const cdp = await t.page.context().newCDPSession(t.page);
		if (!sandbox) {
			const heard = [];
			for (const expr of ['document', 'window']) {
				const { result } = await cdp.send('Runtime.evaluate', { expression: expr, objectGroup: 'stop-beat' });
				const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
				for (const l of listeners) if (/^(webkit)?animationiteration$/i.test(l.type)) heard.push(`${expr} script ${l.scriptId} line ${l.lineNumber}`);
			}
			await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'stop-beat' }).catch(() => {});
			await t.check('rest: no animationiteration listener on the document or the window', heard.length === 0, heard.length ? heard.join('; ') : 'none');
		} else t.log('NOTE sandbox surface: the app is a frame, whose listeners DevTools does not name here; the dispatch count judges');
		await home();
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(4000);
		let x = null, err = '';
		try { x = await traceWindow(cdp, { ms: 3000, url: f.url() }); } catch (e) { err = String(e && e.message || e); }
		// A trace that names no renderer main thread reads 0 dispatched animationiteration events, and the row would PASS
		// without measuring (PM7PERF-STOPCHIP-NO-RENDERER-READS-ZERO, TB6 item 4): could not judge, never a pass.
		const guard = traceJudgeable(x);
		const it = guard.ok ? ((x.dispatched && x.dispatched.animationiteration) || 0) : null;
		await t.check('rest: no animationiteration event is dispatched on Home in 3 s', guard.ok && it === 0,
			!guard.ok ? `${guard.why}${err ? ' (' + err + ')' : ''}` : `${it} dispatched in ${x.secs} s (main frames ${x.mainFrames.perSec}/s)`);
		await cdp.detach().catch(() => {});
	}

	// The look is SAVED through Settings first: a Settings save (the speed change below) repaints the saved look, and
	// the kit's look() alone is not saved, so the page went back to Basic Dark in the middle of the run (first runs).
	const savedLook = async (look) => {
		if (alone) { await f.evaluate((id) => window.PM56_DEMO.setTheme(id), look); await t.page.waitForTimeout(800); return; }
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => { PM12_KIMI.setSettingFromHost('general.visual.theme', fm === 'nier' ? 'NieR' : fm[0].toUpperCase() + fm.slice(1)); PM12_KIMI.setSettingFromHost('general.visual.theme-mode', m === 'light' ? 'Light' : 'Dark'); }, [fam, mode]);
		await t.page.waitForTimeout(800);
		await t.app.look(look);
	};
	if (parts.has('pace')) {
		for (const [n, look] of looks.entries()) {
			try {
			await savedLook(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await home();
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(3000);
			const R = await f.evaluate(PACE, { speed: !alone, windowPart: !alone && (n === 0 || look.startsWith('nier')) });
			const rows = judge(R, look);
			for (const e of R.errors) t.log(`${look}: ${e}`);
			t.log(`${look}: NOTE the page's own words during the run: ${R.pageWords}${R.themeNote ? `; after the light/dark change: ${JSON.stringify(R.themeNote)}` : ''}`);
			await t.check(`${look}: the run went through every change`, R.errors.length === 0 && R.rows.length > 60, R.errors.join('; ') || `${R.rows.length} frames sampled`);
			for (const r of rows) t.log(`${look} ${r.layer}: ${r.name}${r.frac != null ? ` at ${r.frac} of the loop` : ''}: ${r.restart ? 'NEW LOOP' : `hand-over ${r.hand ?? '-'} (bound ${r.handBound ?? '-'}${r.gap != null ? `, of which ${r.lateAllow} for a late hand-over: ${r.gap} ms between samples` : ''}), ${r.stale ? 'main thread: a frame after a long task, not judged' : `main-thread place +${r.place} (bound ${r.placeBound}${r.holdMs != null ? `, of which ${r.holdMs} ms for a hold placed by the wall clock` : ''}), value ${r.value} (bound ${r.valueBound})`}`}, length ${r.from} -> ${r.to}, ${r.dt} ms between samples, theme ${r.themes}${r.flipMs != null ? `, ${r.flipMs} ms after the last word` : ''}`);
			const bad = rows.filter((r) => r.restart || (r.ok === false));
			await t.check(`${look}: no change makes the loop jump (at the hand-over within a frame at the faster pace; on the main thread place within a frame, scale and opacity within the fastest ordinary frame)`, rows.length > 0 && bad.length === 0,
				bad.length ? bad.map((r) => `${r.layer} ${r.name}: ${r.restart ? 'a new loop' : `hand-over ${r.hand}/${r.handBound}, place ${r.place ?? 'stale'}/${r.placeBound ?? '-'}, value ${r.value ?? '-'}/${r.valueBound ?? '-'}`}`).join('; ') : `${rows.length} changes judged`);
			const ev = everyFrame(R);
			t.log(`${look}: every frame from the first change on: worst step ${(ev.worst * 100).toFixed(0)}% of its bound${ev.where ? ` (${ev.where})` : ''}; new loops: ${ev.restarts.join(', ') || 'none'}`);
			for (const sp of ev.spans) t.log(`${look}: NOTE the onboarding window's ${sp.what}: the other held loops (${R.otherDesc}) jumped up to ${Math.round(sp.otherMs)} ms at +${sp.otherAt} ms after it (the restyle's own frame). A jump of both chip loops by that same amount in that frame is named, not failed; any other jump, including a later one of the backlight alone, fails`);
			if (ev.spans.length) t.log(`${look}: NOTE the chip's jumps named as the window's: ${ev.known.join('; ') || 'none'}`);
			await t.check(`${look}: in every frame from the first change on, the loop is never made anew and never jumps (hand-over, main-thread place, and glyph scale / backlight opacity)`, ev.restarts.length === 0 && ev.worst <= 1,
				`${ev.restarts.length ? 'new loops ' + ev.restarts.join(', ') + '; ' : ''}${ev.valueFails ? ev.valueFails + ' in-window scale/opacity failure' + (ev.valueFails === 1 ? '' : 's') + '; ' : ''}worst ${(ev.worst * 100).toFixed(0)}%${ev.where ? ': ' + ev.where : ''}`);
			const ph = inPhase(R), nier = look.startsWith('nier');
			t.log(`${look}: one pulse: ${ph.n} frames with both loops, worst ${ph.worst.toFixed(5)} of a loop${ph.where ? ` (${ph.where})` : ''}`);
			await t.check(`${look}: one pulse: in every frame the backlight is at the glyph's place in the loop (to 0.002 of a loop)${R.marks.some((m) => m.kind === 'window') ? ', through the onboarding window' : ''}${R.marks.some((m) => m.kind === 'theme') ? ', through a light/dark change' : ''}`,
				nier ? ph.n === 0 || ph.worst <= 0.002 : ph.n > 60 && ph.worst <= 0.002,
				ph.n ? `${ph.n} frames, worst ${ph.worst.toFixed(4)} of a loop${ph.where ? ` (${ph.where})` : ''}` : (nier ? 'no backlight (NieR Mode)' : 'no frame with both loops: could not judge'));
			// at once: a word -> flowing with the flowing length in the next frame; the quiet change on time
			const words = R.marks.filter((m) => m.kind === 'word' && m.i > 0 && m.i < R.rows.length);
			// a word released inside frame N's callbacks shows by frame N + 1: the first sample taken after a frame later than
			// the word's own (by frame time, not by counting samples: after a long task Chrome runs frames back to back and a
			// sample posted from frame N - 1 can run after frame N, which put the count one sample early; s-5, Basic Dark)
			const by = (m) => R.rows.find((r, i) => i >= m.i && m.ft != null && r.t > m.ft) || R.rows[R.rows.length - 1];
			const slow = words.filter((m) => { const p = R.rows[m.i - 1], r = by(m); if (!p.g || !r.g) return true; const want = p.flow === 'waiting' ? p.g.dur * 2200 / 3200 : p.g.dur; return r.flow !== 'flowing' || Math.abs(r.g.dur - want) > 1; });
			await t.check(`${look}: a word turns the pace to flowing by the next frame`, words.length >= (alone ? 2 : 3) && slow.length === 0, slow.length ? slow.map((m) => { const r = by(m); return `${m.name}: the frame after ${JSON.stringify(r.flow)} ${r.g ? r.g.dur : 'could not judge'}`; }).join('; ') : `${words.length} words`);
			const quiet = R.marks.filter((m) => m.kind === 'quiet');
			// allowed: `late` ms after 900, plus the time the main thread was held by long tasks after the timer fell due
			// (R32 H3; the onboarding window's restyle made it 1093 ms in NieR and the check's own 200 ms task 1075 ms)
			const off = quiet.filter((m) => m.flipMs == null || m.flipMs < 880 || m.flipMs > 900 + late + (m.blockedMs || 0));
			await t.check(`${look}: 900 ms without a word turns it to waiting (within ${late} ms after, plus any long task after it fell due)`, quiet.length >= 2 && off.length === 0, quiet.map((m) => `${m.name}: ${m.flipMs == null ? 'no change' : m.flipMs + ' ms'}${m.blockedMs ? ` (${m.blockedMs} ms of long tasks after it fell due)` : ''}`).join('; '));
			const d = R.after.debug || {};
			await t.check(`${look}: once the run has ended nothing of the chip's is armed`, R.after.ss !== 'stop' && d.quiet === false && d.watching === false && d.pending !== true, JSON.stringify(R.after));
			if (!alone) {
				// Fast and Slow on a fresh Working run. The pace above is the one main already judged
				// (Fast, then Measured). Slow does not fit in it: the demo ends about 33 s after
				// startWorking, and the chip was idle before the post-Slow window (run-probe1).
				await home();
				await parkPointer(t.page, W, H);
				await t.page.waitForTimeout(1500);
				const S = await f.evaluate(PACE, { speedOnly: true });
				for (const e of S.errors) t.log(`${look} speed: ${e}`);
				await t.check(`${look}: the speed run went through Fast, Slow and back to Measured`, S.errors.length === 0 && S.rows.length > 60, S.errors.join('; ') || `${S.rows.length} frames sampled`);
				const srows = judge(S, look);
				const sbad = srows.filter((r) => r.restart || r.ok === false);
				await t.check(`${look}: Fast, Slow and Measured do not make the loop jump`, srows.length > 0 && sbad.length === 0,
					sbad.length ? sbad.map((r) => `${r.layer} ${r.name}: ${r.restart ? 'a new loop' : `hand-over ${r.hand}/${r.handBound}, place ${r.place ?? 'stale'}/${r.placeBound ?? '-'}, value ${r.value ?? '-'}/${r.valueBound ?? '-'}`}`).join('; ') : `${srows.length} changes judged`);
				const sev = everyFrame(S);
				await t.check(`${look}: in every frame of the speed run, the loop is never made anew and never jumps (hand-over, main-thread place, and glyph scale / backlight opacity)`, sev.restarts.length === 0 && sev.worst <= 1,
					`${sev.restarts.length ? 'new loops ' + sev.restarts.join(', ') + '; ' : ''}${sev.valueFails ? sev.valueFails + ' in-window scale/opacity failure' + (sev.valueFails === 1 ? '' : 's') + '; ' : ''}worst ${(sev.worst * 100).toFixed(0)}%${sev.where ? ': ' + sev.where : ''}`);
				const spj = judgeSpeed(S);
				const missed = spj.bad.some((x) => x.missing);
				await t.check(`${look}: Animation speed Fast and Slow scale both loops by that speed's factor`, spj.ok,
					spj.ok ? 'Fast 0.6 and Slow (Cinematic) 1.6 against the unscaled 2200 ms flowing and 3200 ms waiting' : (missed ? 'could not judge: ' : '') + JSON.stringify(spj.bad.slice(0, 6)));
				const sby = (m) => S.rows.find((r, i) => i >= m.i && m.ft != null && r.t > m.ft) || S.rows[S.rows.length - 1];
				const swords = S.marks.filter((m) => m.kind === 'word' && m.i > 0 && m.i < S.rows.length);
				const sslow = swords.filter((m) => { const p = S.rows[m.i - 1], r = sby(m); if (!p.g || !r.g) return true; const want = p.flow === 'waiting' ? p.g.dur * 2200 / 3200 : p.g.dur; return r.flow !== 'flowing' || Math.abs(r.g.dur - want) > 1; });
				await t.check(`${look}: a word after Fast and after Slow turns the pace to flowing by the next frame`, swords.length >= 2 && sslow.length === 0, sslow.length ? sslow.map((m) => { const r = sby(m); return `${m.name}: the frame after ${JSON.stringify(r.flow)} ${r.g ? r.g.dur : 'could not judge'}`; }).join('; ') : `${swords.length} words`);
				const squiet = S.marks.filter((m) => m.kind === 'quiet');
				const soff = squiet.filter((m) => m.flipMs == null || m.flipMs < 880 || m.flipMs > 900 + late + (m.blockedMs || 0));
				await t.check(`${look}: 900 ms without a word after Fast and after Slow turns it to waiting (within ${late} ms after, plus any long task after it fell due)`, squiet.length >= 2 && soff.length === 0, squiet.map((m) => `${m.name}: ${m.flipMs == null ? 'no change' : m.flipMs + ' ms'}${m.blockedMs ? ` (${m.blockedMs} ms of long tasks after it fell due)` : ''}`).join('; '));
			}
			if (!alone && n === 0 && !look.startsWith('nier')) {
				// a light/dark change mid-run (K3), in a run of its own
				await home(); await parkPointer(t.page, W, H); await t.page.waitForTimeout(3000);
				const T = await f.evaluate(PACE, { speed: false, windowPart: false, themePart: true, themeOnly: true });
				for (const e of T.errors) t.log(`${look} light/dark: ${e}`);
				t.log(`${look} light/dark: NOTE the page's own words: ${T.pageWords}; ${JSON.stringify(T.themeNote)}`);
				await t.check(`${look} light/dark: the run went through the light/dark change, a word, the quiet and the change back`, T.errors.length === 0 && T.marks.filter((m) => m.kind === 'theme').length === 2 && T.rows.length > 60, T.errors.join('; ') || `${T.rows.length} frames sampled`);
				const tr = judge(T, look);
				for (const r of tr) t.log(`${look} light/dark ${r.layer}: ${r.name}${r.frac != null ? ` at ${r.frac} of the loop` : ''}: ${r.restart ? 'NEW LOOP' : `hand-over ${r.hand ?? '-'} (bound ${r.handBound ?? '-'}), main-thread place ${r.place ?? 'stale'} (bound ${r.placeBound ?? '-'}${r.holdMs != null ? `, of which ${r.holdMs} ms for a hold placed by the wall clock` : ''})`}, length ${r.from} -> ${r.to}, theme ${r.themes}`);
				const tb = tr.filter((r) => r.restart || r.ok === false);
				await t.check(`${look} light/dark: no change makes either loop jump or start anew (the light/dark change, the word and the quiet after it, the change back)`, tr.length > 0 && tb.length === 0,
					tb.length ? tb.map((r) => `${r.layer} ${r.name}: ${r.restart ? 'a new loop' : `hand-over ${r.hand}/${r.handBound}, place ${r.place ?? 'stale'}/${r.placeBound ?? '-'}`}`).join('; ') : `${tr.length} changes judged`);
				const te = everyFrame(T);
				await t.check(`${look} light/dark: in every frame from the light/dark change on, neither loop is made anew or jumps (hand-over, place, and glyph scale / backlight opacity)`, te.restarts.length === 0 && te.worst <= 1, `${te.restarts.length ? 'new loops ' + te.restarts.join(', ') + '; ' : ''}${te.valueFails ? te.valueFails + ' in-window scale/opacity failure' + (te.valueFails === 1 ? '' : 's') + '; ' : ''}worst ${(te.worst * 100).toFixed(0)}%${te.where ? ': ' + te.where : ''}`);
				const tp = inPhase(T);
				t.log(`${look} light/dark: one pulse: ${tp.n} frames with both loops, worst ${tp.worst.toFixed(5)} of a loop${tp.where ? ` (${tp.where})` : ''}`);
				await t.check(`${look} light/dark: one pulse: in every frame the backlight is at the glyph's place in the loop (to 0.002 of a loop), through the light/dark change and back`, tp.n > 60 && tp.worst <= 0.002, `${tp.n} frames, worst ${tp.worst.toFixed(4)} of a loop${tp.where ? ` (${tp.where})` : ''}`);
			}
			} finally { await restoreMeasured(); }
		}
	}

	if (parts.has('hidden') && !alone) {
		const look = looks[0];
		await savedLook(look);
		await home();
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(2000);
		const x = await f.evaluate(HIDDEN);
		t.log(`hidden ${look}: ${JSON.stringify(x)}`);
		if (x.error) { await t.check(`hidden ${look}: the chat hidden with words arriving`, false, `${x.error}: could not judge`); }
		else {
			const off = (s) => s && s.box === 0 && s.debug.quiet === false && s.debug.watching === false && s.debug.pending === false;
			await t.check(`hidden ${look}: while the chat is hidden (display:none, the Guided Tour's route) and words keep arriving, nothing of the chip's is armed (R41 F1)`,
				x.before.debug.watching === true && off(x.hidden1) && off(x.hidden2), JSON.stringify({ before: x.before.debug, hidden1: x.hidden1, hidden2: x.hidden2 }));
			const k = x.shown.debug.speed || 1;
			await t.check(`hidden ${look}: shown again with words arriving, it is flowing at the flowing length, listening, its quiet timer armed`,
				x.shown.flow === 'flowing' && x.shown.glyph && Math.abs(x.shown.glyph.dur - 2200 * k) < 1 && x.shown.debug.watching === true && x.shown.debug.quiet === true, JSON.stringify(x.shown));
			await t.check(`hidden ${look}: then 900 ms without a word turns it to waiting (within ${late} ms after)`, x.quiet.flow === 'waiting' && x.quietMs >= 880 && x.quietMs <= 900 + late + 100, `${x.quietMs} ms: ${JSON.stringify(x.quiet)}`);
		}
	}

	if (parts.has('reduced')) {
		const look = looks[0];
		await savedLook(look);
		await home();
		await t.page.waitForTimeout(2000);
		// one Reduced Motion route at a time: the app's own (Settings' Reduce motion; not in the chat alone), then the
		// system's (prefers-reduced-motion)
		const routes = alone ? ['system'] : ['app', 'system'];
		for (const route of routes) {
			const step = (what) => f.evaluate(async ([what, route]) => {
				const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
				const chip = () => document.querySelector('.pm56-host .sendstop, #pmRoot .sendstop');
				const loops = () => { const b = chip(); return b ? b.getAnimations({ subtree: true }).filter((a) => /^ss-(breathe|glow)/.test(a.animationName)).map((a) => `${a.animationName} ${a.effect.getTiming().duration}`) : null; };
				const D = window.PM56_DEMO, SS = window.PM56_SENDSTOP, K = window.PM12_KIMI;
				const now = () => ({ ss: chip() && chip().getAttribute('data-ss'), flow: chip() && chip().getAttribute('data-flow'), loops: loops() });
				if (what === 'start') { D.pauseWorking(); await sleep(300); D.startWorking(); await sleep(1500); return now(); }
				if (what === 'on' && route === 'app') { const ok = K.setSettingFromHost('general.visual.reduce-animations', true); await sleep(600); return { set: ok, ...now() }; }
				if (what === 'off' && route === 'app') { K.setSettingFromHost('general.visual.reduce-animations', false); await sleep(600); return now(); }
				if (what === 'word') { SS.token(); await sleep(50); return now(); }
				if (what === 'end') { D.pauseWorking(); await sleep(300); return now(); }
				await sleep(600); return now();
			}, [what, route]);
			const out = { before: await step('start') };
			if (route === 'system') await t.emulate({ reducedMotion: 'reduce' });
			out.on = await step('on');
			out.word = await step('word');
			if (route === 'system') await t.emulate({ reducedMotion: 'no-preference' });
			out.off = await step('off');
			await step('end');
			t.log(`reduced (${route}) ${look}: ${JSON.stringify(out)}`);
			await t.check(`reduced (${route}) ${look}: with Reduce motion on the chip has no loop and a word still turns it to flowing`, out.on.set !== false && out.on.ss === 'stop' && Array.isArray(out.on.loops) && out.on.loops.length === 0 && out.word.flow === 'flowing', JSON.stringify({ on: out.on, word: out.word }));
			const want = out.off.flow === 'flowing' ? 2200 : 3200;
			await t.check(`reduced (${route}) ${look}: off again, the loops come back at the ${out.off.flow} length`, Array.isArray(out.off.loops) && out.off.loops.length >= 1 && out.off.loops.every((x) => Number(x.split(' ')[1]) === want), JSON.stringify(out.off));
		}
	}
}
