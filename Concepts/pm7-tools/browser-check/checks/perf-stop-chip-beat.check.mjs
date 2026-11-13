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
// PACE, per look: a Working run on Home with the check feeding the chip's word hook (PM56_SENDSTOP.token, which
// turn-stream calls for every released word), the chip sampled every frame (its loops' place and length, the glyph's
// scale and the backlight's opacity, as the page computes them; the films show the pixels). Changes: a word while
// waiting, early in the loop and just before its end; 900 ms without a word while flowing, landing near a loop's end
// and in its middle; Settings' Animation speed set to Fast mid-loop, then a word right after it and the quiet after
// that, then Measured again; the onboarding window opened mid-loop (it holds the app's animations; no words under it,
// so the pace turns to waiting while held), closed, then a word. For each change:
//   - at once: a word changes data-flow and the loop's length before the next frame; the quiet one comes 900 ms after
//     the last word (the module's timer on the word's age; up to --set late=<ms>, default 150, later on a busy page);
//   - no jump: across the frame that holds the change, the loop's place (loops run plus the way through this one, in
//     time) moves forward by no more than one frame's step at the faster pace (dt / the shorter length, 10% and 0.002
//     slack), and the glyph's scale and the backlight's opacity move by no more than the fastest ordinary frame of the
//     same look at the flowing pace (per ms, 15% and 0.002 slack). A new loop (a restart) at a change fails.
// After the run ends nothing of the chip's is armed (PM56_SENDSTOP.debug(): no quiet timer, no observer).
// Each look is SAVED through Settings before its run: a Settings save (the speed change) repaints the saved look, and
// with the kit's unsaved look() the page went back to Basic Dark mid-run (first runs: a look change, read as a jump).
// REDUCED (first look only): with Reduce motion on, the app's (Settings) and then the system's (prefers-reduced-motion),
// there is no loop and a word still changes data-flow; off again, the loop comes back at that cadence's length.
// Failed on main 6bd8294726: the listener (document, the chip's script), 41 loop ends dispatched in 3 s at rest, no
// change before a loop's end, and Settings' speed change moved the loop (place +0.87 of a loop, scale .036 in a frame).
//
// --set looks=<a,b>   default basic-dark,glass-dark,retro-dark,nier-dark,friendly-dark,basic-light
// --set parts=<a,b>   rest,pace,reduced (default all)   --set settle=<ms> (default 30000)   --set late=<ms> (default 150)
// --set chat=<url>    the chat alone (its standalone build): no Settings, no onboarding window; looks by PM56_DEMO.setTheme
// Both surfaces (--set sandbox=0 and 1). No Stop chip, or a change that did not happen, fails as "could not judge".
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

// One Working run, driven and sampled inside the page; returns every frame's sample, the marks and the flips.
const PACE = async ({ speed, windowPart }) => {
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
		const r = { t: document.timeline.currentTime, ss: b && b.getAttribute('data-ss'), flow: b && b.getAttribute('data-flow'), th: host ? host.getAttribute('data-theme') : null, nier: document.documentElement.getAttribute('data-o55-nier') };
		if (!b) return r;
		const all = b.getAnimations({ subtree: true });
		const g = all.find((a) => /^ss-breathe/.test(a.animationName)), l = all.find((a) => /^ss-glow/.test(a.animationName));
		if (g) { const cs = getComputedStyle(b.querySelector('.ss-g')), m = cs.transform; r.ease = cs.animationTimingFunction; r.g = { id: idOf(g), name: g.animationName, dur: +g.effect.getTiming().duration, place: placeOf(g), state: g.playState, v: m && m.startsWith('matrix(') ? parseFloat(m.slice(7)) : 1 }; }
		if (l) r.b = { id: idOf(l), name: l.animationName, dur: +l.effect.getTiming().duration, place: placeOf(l), state: l.playState, v: parseFloat(getComputedStyle(b.querySelector('.ss-bl'), '::before').opacity) };
		return r;
	};
	let sampling = true;
	const tick = () => { if (!sampling) return; try { rows.push(read()); } catch (e) { errors.push(String(e)); } requestAnimationFrame(tick); };
	const mo = new MutationObserver((ms) => { for (const m of ms) { const v = m.target.getAttribute('data-flow'); if (m.attributeName === 'data-flow' && v !== m.oldValue && m.target.getAttribute('data-ss') === 'stop') flips.push({ i: rows.length, now: performance.now(), to: v }); } });
	const last = () => rows[rows.length - 1] || {};
	const frac = () => { const g = last().g; return g && g.place != null ? g.place % 1 : null; };
	const until = async (pred, ms = 9000) => { const end = performance.now() + ms; while (!pred()) { if (performance.now() > end) return false; await frame(); } return true; };
	let feeding = 0, lastWord = 0;
	const word = () => { SS.token(); lastWord = performance.now(); };
	const mark = (name, extra) => marks.push({ name, i: rows.length, now: performance.now(), frac: frac(), ...extra });
	const feedOn = () => { if (!feeding) feeding = setInterval(word, 100); };
	const feedOff = () => { clearInterval(feeding); feeding = 0; };
	// a word between two frames, as a mark
	const wordAt = async (name) => { await sleep(2); mark(name, { kind: 'word' }); word(); feedOn(); };
	// stop the words so that the quiet change (900 ms later) lands near `target` of a loop at the flowing length
	const quietAt = async (name, target) => {
		await sleep(400);
		const ahead = 901 / (last().g ? last().g.dur : 2200);
		const stopAt = ((target - ahead) % 1 + 1) % 1;
		if (!(await until(() => { const f = frac(); return f != null && Math.abs(f - stopAt) < 0.02; }))) return false;
		feedOff(); word();                                            // the last word, now
		marks.push({ name, i: -1, kind: 'quiet', wordAt: lastWord, aim: target });
		return until(() => last().flow === 'waiting', 3000);
	};
	const inLoop = (lo, hi) => until(() => { const f = frac(); return f != null && f >= lo && f <= hi && last().g.place >= 1; });

	try {
		D.pauseWorking(); await sleep(300);
		mo.observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-flow'] });
		requestAnimationFrame(tick);
		D.startWorking();
		if (!(await until(() => last().ss === 'stop' && last().g && last().g.place >= 1.0, 12000))) throw new Error(`no breathing Stop chip: ${JSON.stringify(last())}`);
		if (last().flow !== 'waiting') { await until(() => last().flow === 'waiting', 3000); }
		// a word while waiting, early in the loop; then quiet landing near the loop's end
		if (!(await inLoop(0.2, 0.3))) throw new Error('early: the loop never reached .2-.3');
		await wordAt('word while waiting, early in the loop');
		if (!(await quietAt('quiet while flowing, landing near the loop end', 0.95))) throw new Error('quiet near the end: no change');
		// a word just before the loop's end; then quiet landing mid-loop
		if (!(await inLoop(0.955, 0.99))) throw new Error('late: the loop never reached .955-.99');
		await wordAt('word while waiting, just before the loop end');
		if (!(await quietAt('quiet while flowing, landing mid-loop', 0.5))) throw new Error('quiet mid-loop: no change');
		if (speed) {
			if (!(await inLoop(0.3, 0.4))) throw new Error('speed: the loop never reached .3-.4');
			await sleep(2); mark('Animation speed Fast, waiting, mid-loop', { kind: 'speed' });
			const ok = window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Fast');
			if (!ok) throw new Error('Settings refused Fast');
			await sleep(150);
			await wordAt('word right after the speed change');
			if (!(await quietAt('quiet after the speed change', 0.7))) throw new Error('quiet after speed: no change');
			if (!(await inLoop(0.3, 0.4))) throw new Error('speed back: the loop never reached .3-.4');
			await sleep(2); mark('Animation speed Measured, waiting, mid-loop', { kind: 'speed' });
			window.PM12_KIMI.setSettingFromHost('general.visual.animation-speed', 'Measured');
			await sleep(300);
		}
		if (windowPart) {
			await wordAt('word before the window');
			await sleep(500);
			if (!(await until(() => { const f = frac(); return f != null && f >= 0.3 && f <= 0.45; }))) throw new Error('window: the loop never reached .3-.45');
			feedOff(); word();                                            // the last word before the window
			await sleep(2); mark('onboarding window opens (holds the glyph), no more words', { kind: 'window' });
			window.O55.ui.open();
			marks.push({ name: 'quiet under the window', i: -1, kind: 'quiet', wordAt: lastWord });
			await until(() => last().flow === 'waiting', 3000);
			await sleep(1500);
			await sleep(2); mark('onboarding window closes', { kind: 'window' });
			window.O55.ui.close();
			await until(() => !document.documentElement.hasAttribute('data-o55-open'), 5000);
			await sleep(400);
			await wordAt('word after the window');
			await sleep(400); feedOff();
		}
		await sleep(300);
	} catch (e) { errors.push(String(e && e.message || e)); }
	feedOff();
	sampling = false; mo.disconnect();
	await frame();
	D.pauseWorking();
	await sleep(400);
	const after = { ss: chip() && chip().getAttribute('data-ss'), debug: SS.debug() };
	// tie each quiet change to its flip
	for (const m of marks) if (m.kind === 'quiet') { const fl = flips.find((x) => x.to === 'waiting' && x.now >= m.wordAt); if (fl) { m.i = fl.i; m.flipMs = Math.round(fl.now - m.wordAt); } }
	return { rows, marks, flips, errors, after };
};

// Judge one look's samples.
function judge(R, look) {
	const out = [];
	const rows = R.rows;
	for (const layer of ['g', 'b']) {
		// the fastest ordinary frame at the flowing pace: same loop, no change in between, both flowing
		const changes = new Set(R.marks.map((m) => m.i).filter((i) => i > 0));
		let maxRate = 0;
		for (let i = 1; i < rows.length; i++) {
			const a = rows[i - 1][layer], b = rows[i][layer];
			if (!a || !b || a.id !== b.id || changes.has(i) || rows[i - 1].flow !== 'flowing' || rows[i].flow !== 'flowing' || a.dur !== b.dur || a.place == null || b.place == null) continue;
			const dt = rows[i].t - rows[i - 1].t; if (dt <= 0) continue;
			maxRate = Math.max(maxRate, Math.abs(b.v - a.v) / dt);
		}
		for (const m of R.marks) {
			if (m.i <= 0 || m.i >= rows.length) continue;
			const r0 = rows[m.i - 1], r1 = rows[m.i], a = r0[layer], b = r1[layer];
			if (!a && !b) continue;
			const dt = r1.t - r0.t;
			const themes = [...new Set(rows.slice(Math.max(0, m.i - 2), m.i + 3).map((r) => `${r.th}${r.nier === 'on' ? '+nier' : ''} ${r.ease}`))].join(' > ');
			const row = { look, layer: layer === 'g' ? 'glyph' : 'backlight', name: m.name, kind: m.kind, themes, frac: a && a.place != null ? +(a.place % 1).toFixed(3) : null, dt: +dt.toFixed(1), from: a && a.dur, to: b && b.dur, flowTo: r1.flow, flipMs: m.flipMs };
			if (!a || !b || a.id !== b.id) { row.restart = true; out.push(row); continue; }
			if (a.place == null || b.place == null) { row.held = 'delay'; out.push(row); continue; }
			const bound = dt / Math.min(a.dur, b.dur);
			row.place = +(b.place - a.place).toFixed(5); row.placeBound = +(bound * 1.1 + 0.002).toFixed(5);
			row.value = +Math.abs(b.v - a.v).toFixed(5); row.valueBound = +(maxRate * dt * 1.15 + 0.002).toFixed(5);
			row.ok = row.place >= -1e-6 && row.place <= row.placeBound && row.value <= row.valueBound;
			out.push(row);
		}
	}
	return out;
}

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark,friendly-dark,basic-light').split(',').filter(Boolean);
	const parts = new Set(String(t.args.parts || 'rest,pace,reduced').split(','));
	const late = Number(t.args.late || 150);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	// the chat alone (its standalone build, `--set chat=<url>`): no Settings, no onboarding window, no pages
	const alone = !!t.args.chat;
	let f;
	if (alone) { await t.goto(String(t.args.chat)); f = t.page.mainFrame(); } else f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	const ready = alone
		? await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP), null, { timeout: 60000 }).then(() => true, () => false)
		: await f.waitForFunction(() => !!(window.PM56_DEMO && window.PM56_DEMO.startWorking && window.PM56_SENDSTOP && window.PM_PAGES && window.PM12_KIMI && window.O55 && O55.ui), null, { timeout: 60000 }).then(() => true, () => false);
	await t.check(alone ? 'the standalone chat\'s demo and its send button module are in the page' : 'the chat\'s demo, its send button module, Settings and the onboarding window are in the page', ready, ready ? 'ok' : 'missing after 60 s: could not judge');
	if (!ready) return;
	await t.page.waitForTimeout(Number(t.args.settle ?? (alone ? 8000 : 30000)));
	const sandbox = f !== t.page.mainFrame();
	const home = () => (alone ? Promise.resolve() : f.evaluate(() => PM_PAGES.go('dashboard')));

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
		const it = x && x.dispatched ? (x.dispatched.animationiteration || 0) : null;
		await t.check('rest: no animationiteration event is dispatched on Home in 3 s', it === 0, x ? `${it} dispatched in ${x.secs} s (main frames ${x.mainFrames.perSec}/s)` : `no trace: ${err}: could not judge`);
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
			await savedLook(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await home();
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(3000);
			const R = await f.evaluate(PACE, { speed: !alone, windowPart: !alone && (n === 0 || look.startsWith('nier')) });
			const rows = judge(R, look);
			for (const e of R.errors) t.log(`${look}: ${e}`);
			await t.check(`${look}: the run went through every change`, R.errors.length === 0 && R.rows.length > 60, R.errors.join('; ') || `${R.rows.length} frames sampled`);
			for (const r of rows) t.log(`${look} ${r.layer}: ${r.name}${r.frac != null ? ` at ${r.frac} of the loop` : ''}: ${r.restart ? 'NEW LOOP' : r.held ? 'in its delay' : `place +${r.place} (bound ${r.placeBound}), value ${r.value} (bound ${r.valueBound})`}, length ${r.from} -> ${r.to}, dt ${r.dt} ms, theme ${r.themes}${r.flipMs != null ? `, ${r.flipMs} ms after the last word` : ''}`);
			const bad = rows.filter((r) => r.restart || (r.ok === false));
			await t.check(`${look}: no change makes the loop jump (place within a frame at the faster pace, scale and opacity within the fastest ordinary frame)`, rows.length > 0 && bad.length === 0,
				bad.length ? bad.map((r) => `${r.layer} ${r.name}: ${r.restart ? 'a new loop' : `place ${r.place}/${r.placeBound}, value ${r.value}/${r.valueBound}`}`).join('; ') : `${rows.length} changes judged`);
			// at once: a word -> flowing with the flowing length in the next frame; the quiet change on time
			const words = R.marks.filter((m) => m.kind === 'word' && m.i > 0 && m.i < R.rows.length);
			const slow = words.filter((m) => { const p = R.rows[m.i - 1], r = R.rows[m.i]; if (!p.g || !r.g) return true; const want = p.flow === 'waiting' ? p.g.dur * 2200 / 3200 : p.g.dur; return r.flow !== 'flowing' || Math.abs(r.g.dur - want) > 1; });
			await t.check(`${look}: a word turns the pace to flowing before the next frame`, words.length >= 3 && slow.length === 0, slow.length ? slow.map((m) => `${m.name}: next frame ${JSON.stringify(R.rows[m.i].flow)} ${R.rows[m.i].g && R.rows[m.i].g.dur}`).join('; ') : `${words.length} words`);
			const quiet = R.marks.filter((m) => m.kind === 'quiet');
			const off = quiet.filter((m) => m.flipMs == null || m.flipMs < 880 || m.flipMs > 900 + late);
			await t.check(`${look}: 900 ms without a word turns it to waiting (within ${late} ms after)`, quiet.length >= 2 && off.length === 0, quiet.map((m) => `${m.name}: ${m.flipMs == null ? 'no change' : m.flipMs + ' ms'}`).join('; '));
			const d = R.after.debug || {};
			await t.check(`${look}: once the run has ended nothing of the chip's is armed`, R.after.ss !== 'stop' && d.quiet === false && d.watching === false, JSON.stringify(R.after));
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
