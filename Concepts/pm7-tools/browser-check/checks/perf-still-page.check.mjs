// The still page (PERF-3, the owner's choice B, 2026-11-11: "pause the icons after a while without input").
//
// Before it, the page's endless decorative loops (breathing marks, spinning rings, loaders, working pulses) kept the
// compositor drawing on every refresh with nobody at the page: about 119 frames a second at 120 Hz in every look, Glass
// Dark Home 450 ms a second of GPU-thread time against 62 with them paused (pm7-perf lane E's P1). Now, after
// STILL_AFTER (20 s) with no pointer move, press, wheel, key or touch, src/js/14-shell-still.js puts data-pm-still on
// <html> and marks the element of every endless CSS animation (data-pm-held), and css/21-shell-still.css holds what is
// marked where it is, until the next input.
//
// TEST HOOK, not a product setting: the page is opened with ?pm-still=<ms> (read once by the script, as ?pm-warm=0 is)
// so a cell waits 3 s instead of 20. One cell (Basic Dark Home, --set real=0 skips it) runs without it and judges the
// real 20 s: not still at 18 s, still at 23 s.
//
// Per look and view (Settings, Home, Usage), after a real pointer move:
//   (b) before the wait is up the page is not still, nothing is marked and its endless loops run as before;
//   (a) STILL_AFTER + 3 s after the input: no endless animation is running in document.getAnimations() (the code
//       editor's caret is exempt: it is a text cursor, in a closed shadow root no page rule reaches), every mark holds
//       an endless loop (no stray mark), no finite animation is held; and, once no finite animation runs, the display
//       compositor draws at most 15 frames a second (--set drawn=) and the main thread renders at most 10 (--set main=)
//       in at least one of three 2 s traces (a toast leaving or a live update between them is not a loop). Usage shows
//       live data (its numbers tween after each demo update, the demo engine ticks every 250 ms): its frames are logged
//       with the script blocks that draw them, never judged; Home's dashboard is live too: its compositor frames are
//       judged and its main frames logged. Jared's card held the icons, not live data;
//   (c) one real pointer move wakes it in that event: every animation it held is running again within 100 ms of the
//       move, its currentTime ahead of where it was held by the time since the wake less that start (not reset, no
//       jump);
//   the toggle's own cost: the frame that holds the loops and the first frame after the waking move each restyle at
//   most 150 elements (--set toggle=; rules keyed by the loops' own selectors restyled 650-730 in a frame on the 3090);
//   the frame's length and the next frames' recalcs are logged.
// Key, window resize and a real hidden/visible tab round trip each wake from a separately asserted still state.
// Then (d) with Reduced Motion on the page never goes still, marks nothing and its running loops stay as they were;
// and (e) with the onboarding window open, and during the Guided Tour, the page never goes still: an open while still
// lets the loops go at once (the app beneath is held by the window's own rule, and the stage keeps its own loop; the
// tour shows the app and its words describe marks that move), and after the window closes the page goes still again.
//
// --set looks=<a,b|all>  default all ten; --set views=settings,dashboard,usage; --set after=<ms> (default 3000)
// --set ms=<ms>          rest trace length (default 2000)
// Runs on both surfaces (--set sandbox=0 and 1). Main's page (no still page) fails (a), (c), (e) and the 20 s cell.
import { TRACE_CATEGORIES, summarise } from '../helpers/frame-trace.mjs';
import { muteSound } from '../helpers/quiet-page.mjs';
import { pageSource, blocksOf, blockAt } from '../helpers/built-source.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];

// In the page: every animation, endless or not, with what it is; the endless ones that run are kept for (c)
const CENSUS = () => {
	const desc = (el) => { if (!el) return 'none'; const c = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || ''; return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c.trim() ? '.' + c.trim().split(/\s+/).slice(0, 3).join('.') : ''); };
	const out = { still: document.documentElement.hasAttribute('data-pm-still'), hasScript: !!window.PM_STILL, marks: document.querySelectorAll('[data-pm-held]').length, run: [], held: 0, exempt: [], finPaused: [], finRun: 0, finList: [], stray: [] };
	const keep = [];
	for (const a of document.getAnimations()) {
		let it = 1; try { it = a.effect.getTiming().iterations; } catch (e) { /* none */ }
		const el = a.effect && a.effect.target;
		const name = (a.animationName || (a.constructor && a.constructor.name) || '?') + (a.effect && a.effect.pseudoElement ? ' ' + a.effect.pseudoElement : '');
		const what = `${name} on ${desc(el)}`;
		if (it === Infinity) {
			const caret = !!(el && el.getRootNode && el.getRootNode() !== document && el.classList && el.classList.contains('pmw-ed-caret'));
			// held by the still state: paused on an element marked for the part it runs on (the page holds some loops of
			// its own, NieR's motes on Usage for one: those stay held after the wake)
			const markedPart = !!(el && el.getAttribute && (el.getAttribute('data-pm-held') || '').split(' ').includes(a.effect.pseudoElement ? a.effect.pseudoElement.replace(/^::?/, '') : 'self'));
			if (a.playState === 'running') { if (caret) out.exempt.push(what); else { out.run.push(what); keep.push(a); } }
			else if (a.playState === 'paused' && markedPart) { out.held++; keep.push(a); }
		} else if (a.playState === 'paused') out.finPaused.push(what);
		else if (a.playState === 'running') { out.finRun++; if (out.finList.length < 6) { let d = 0; try { d = Math.round(a.effect.getComputedTiming().activeDuration); } catch (e) { /* none */ } out.finList.push(`${what} (${d} ms)`); } }
	}
	window.__stillKeep = keep;
	// every mark holds an endless loop on the part it names (a stray mark could hold something finite)
	for (const el of document.querySelectorAll('[data-pm-held]')) {
		for (const p of (el.getAttribute('data-pm-held') || '').split(' ').filter(Boolean)) {
			const anims = el.getAnimations({ subtree: true }).filter((x) => x.effect && x.effect.target === el && (x.effect.pseudoElement ? x.effect.pseudoElement.replace(/^::?/, '') : 'self') === p);
			if (!anims.some((x) => { try { return x.effect.getTiming().iterations === Infinity; } catch (e) { return false; } })) out.stray.push(`${p} on ${desc(el)}`);
		}
	}
	return out;
};

// One trace of `ms`, with what `during` does, summarised, plus the marks and the style recalcs of the page's renderer
async function trace(cdp, { ms, during, url }) {
	await cdp.send('Tracing.start', { categories: TRACE_CATEGORIES, transferMode: 'ReturnAsStream', bufferUsageReportingInterval: 0 });
	const until = Date.now() + ms;
	try { if (during) await during(); } finally { const left = until - Date.now(); if (left > 0) await new Promise((r) => setTimeout(r, left)); }
	const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
	await cdp.send('Tracing.end');
	const { stream } = await complete;
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	const json = JSON.parse(parts.join(''));
	const sum = summarise(json, { url });
	const events = json.traceEvents || json;
	// the marks come from the page's own main thread: its style recalcs and main frames are those of the same thread
	const marks = {}, styles = [], frames = [];
	let pid = null, tid = null;
	for (const e of events) {
		if (e.cat && e.cat.includes('blink.user_timing') && /^pm-still:/.test(e.name) && !(e.name in marks)) { marks[e.name] = e.ts; pid = e.pid; tid = e.tid; }
	}
	for (const e of events) {
		if (e.pid !== pid || e.tid !== tid || e.ph !== 'X') continue;
		if (e.name === 'UpdateLayoutTree') styles.push({ ts: e.ts, dur: (e.dur || 0) / 1000, n: (e.args && e.args.elementCount) || 0 });
		if (e.name === 'ProxyMain::BeginMainFrame') frames.push({ ts: e.ts, dur: (e.dur || 0) / 1000 });
	}
	// the style recalcs from the mark to a few frames after it: the first (the one that carries the toggle; for a wake,
	// the first frame after the pointer move) is judged, the largest and the total are logged (a live update in Usage can
	// land in the same frames)
	const spread = (first, last) => {
		const a = marks[first], b = marks[last]; if (a === undefined) return null;
		const end = (b === undefined ? a : b) + 60000;
		const ss = styles.filter((x) => x.ts >= a && x.ts <= end).sort((p, q) => p.ts - q.ts);
		if (!ss.length) return { found: false };
		const big = ss.reduce((m, x) => (x.n > m.n ? x : m), ss[0]);
		const fr = frames.find((f) => f.ts <= ss[0].ts && f.ts + f.dur * 1000 >= ss[0].ts);
		const r2 = (x) => Math.round(x * 100) / 100;
		return { found: true, steps: ss.length, max: big.n, maxMs: r2(big.dur), total: ss.reduce((t2, x) => t2 + x.n, 0), totalMs: r2(ss.reduce((t2, x) => t2 + x.dur, 0)), first: ss[0].n, firstFrameMs: fr ? r2(fr.dur) : null, done: b !== undefined };
	};
	const after = spread;
	return { sum, after };
}

// Marks the state's changes in the trace (a check-side observer: the product writes no marks)
const MARKER = () => {
	if (window.__stillMarker) return true;
	window.__stillMarker = new MutationObserver(() => { try { performance.mark(document.documentElement.hasAttribute('data-pm-still') ? 'pm-still:on' : 'pm-still:off'); } catch (e) { /* none */ } });
	window.__stillMarker.observe(document.documentElement, { attributes: true, attributeFilter: ['data-pm-still'] });
	return true;
};

// Until no finite animation runs (a toast leaving, an entrance), at most `ms`
const QUIET = (ms) => new Promise((resolve) => {
	const t0 = performance.now();
	const look = () => {
		const busy = document.getAnimations().some((a) => { try { return a.playState === 'running' && a.effect.getTiming().iterations !== Infinity; } catch (e) { return false; } });
		if (!busy || performance.now() - t0 > ms) resolve(!busy); else setTimeout(look, 200);
	};
	look();
});

export default async function (t) {
	const looks = String(t.args.looks || 'all') === 'all' ? ALL : String(t.args.looks).split(',').filter(Boolean);
	const views = String(t.args.views || 'settings,dashboard,usage').split(',').filter(Boolean);
	const after = Number(t.args.after || 3000), ms = Number(t.args.ms || 2000);
	const drawnMax = Number(t.args.drawn || 15), mainMax = Number(t.args.main || 10), toggleMax = Number(t.args.toggle || 150);
	const W = 1920, H = 1080;
	let px = 0; // the waking moves go to a new point each time, so each is a real move
	const move = async () => { px = (px + 1) % 6; await t.page.mouse.move(W - 6, Math.round(H / 2) + px * 24 - 60); };
	await t.viewport(W, H);
	await muteSound(t.page);

	// ---- the real wait: one cell without the hook ----
	if (String(t.args.real ?? '1') !== '0') {
		const f0 = await t.app.open({ query: 'pm-warm=0' });
		await t.app.look('basic-dark');
		await f0.evaluate(() => PM_PAGES.go('dashboard'));
		await move();
		await t.page.waitForTimeout(18000);
		const at18 = await f0.evaluate(CENSUS);
		await t.page.waitForTimeout(5000);
		const at23 = await f0.evaluate(CENSUS);
		await t.check('basic-dark Home, no hook: not still 18 s after the last input', !at18.still && at18.run.length > 0, `still ${at18.still}, ${at18.run.length} endless running`);
		await t.check('basic-dark Home, no hook: still 23 s after the last input, nothing endless running', at23.still && at23.run.length === 0, `still ${at23.still}${at23.hasScript ? '' : ' (no still-page script in this page)'}, ${at23.run.length} endless running${at23.run.length ? ': ' + at23.run.slice(0, 4).join('; ') : ''}`);
	}

	const f = await t.app.open({ query: `pm-warm=0&pm-still=${after}` });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await f.evaluate(MARKER);
	// Diagnostic only: if a view cannot stay still, report its spontaneous inputs and the caller of .focus().
	await f.evaluate(() => {
		window.__stillInputs = [];
		const focus = HTMLElement.prototype.focus;
		HTMLElement.prototype.focus = function (...args) {
			window.__stillFocusCaller = new Error('focus caller').stack;
			try { return focus.apply(this, args); } finally { window.__stillFocusCaller = null; }
		};
		for (const type of ['focus', 'focusin', 'resize', 'input', 'compositionstart', 'compositionupdate', 'visibilitychange']) {
			window.addEventListener(type, (e) => {
				if (!e.isTrusted) return;
				window.__stillInputs.push({ type, t: Math.round(performance.now()), target: e.target?.id || e.target?.tagName || 'window', visibility: document.visibilityState, caller: window.__stillFocusCaller });
				if (window.__stillInputs.length > 30) window.__stillInputs.shift();
			}, true);
		}
	});
	const cdp = await t.page.context().newCDPSession(t.page);
	const url = f.url();
	// the script blocks that draw while still, by the id the build gives each block
	let blocks = []; try { blocks = blocksOf(await pageSource(t)); } catch (e) { t.log('NOTE the page source could not be read: drawing scripts are named by line only'); }
	const named = (x) => (x.scripts || []).slice(0, 3).map((r) => { const m = /@(\d+):/.exec(r[0]); const blk = m && blockAt(blocks, Number(m[1])); return `${r[0]} ${blk ? '[' + blk.kind + '#' + (blk.id || '?') + '] ' : ''}${r[1]} ms/s`; }).join(', ');
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));

	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await move();
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 4000));
		for (const view of views) {
			const at = `${look} ${view === 'dashboard' ? 'home' : view}`;
			await f.evaluate((id) => PM_PAGES.go(id), view);
			await move();
			await f.evaluate(() => { window.__stillInputs = []; });
			const t0 = Date.now();
			await t.page.waitForTimeout(Math.min(1500, after / 2));

			// (b) before the wait is up
			const b = await f.evaluate(CENSUS);
			await t.check(`${at}: before ${after} ms without input the page is not still and nothing is marked`, !b.still && b.marks === 0,
				`still ${b.still}, ${b.run.length} endless running, ${b.marks} marked`);
			if (!b.run.length) t.log(`${at}: NOTE no endless animation runs in this view: (a) and (c) judge frames and the state only`);

			// going still, inside a trace: the toggle's style recalc
			await t.page.waitForTimeout(Math.max(0, after - 400 - (Date.now() - t0)));
			const tg = await trace(cdp, { ms: 1200, url });
			const on = tg.after('pm-still:on', 'pm-still:on');

			// (a) STILL_AFTER + 3 s
			await t.page.waitForTimeout(Math.max(0, after + 3000 - (Date.now() - t0)));
			const a = await f.evaluate(CENSUS);
			const newlyPaused = a.finPaused.filter((x) => !b.finPaused.includes(x));
			await t.check(`${at}: ${after + 3000} ms after the last input the page is still`, a.still, `data-pm-still ${a.still ? 'on' : 'off'}${a.hasScript ? '' : ' (no still-page script in this page)'}`);
			await t.check(`${at}: no endless animation runs while still`, a.run.length === 0, a.run.length ? `${a.run.length} running: ${a.run.slice(0, 6).join('; ')}` : `${a.held} held, ${a.marks} elements marked${a.exempt.length ? `, exempt: ${a.exempt.join('; ')}` : ''}`);
			await t.check(`${at}: every mark holds an endless loop (no stray mark)`, a.stray.length === 0, a.stray.length ? a.stray.slice(0, 6).join('; ') : `${a.marks} marks`);
			await t.check(`${at}: no finite animation is held by the state`, newlyPaused.length === 0, newlyPaused.length ? newlyPaused.slice(0, 6).join('; ') : `${a.finRun} finite running`);
			// frames while still: up to three 2 s traces, each once no finite animation runs; the quietest is judged
			const live = view === 'usage';
			let x = null; const tries = [];
			for (let k = 0; k < 3; k++) {
				const quiet = await f.evaluate(QUIET, 3000);
				const r = (await trace(cdp, { ms, url })).sum;
				tries.push(`${r.drawn.perSec}/${r.mainFrames.perSec}${quiet ? '' : ' (a finite animation still ran)'}${r.drawn.perSec > drawnMax || r.mainFrames.perSec > mainMax ? ' by ' + named(r) : ''}`);
				if (!x || r.drawn.perSec + r.mainFrames.perSec < x.drawn.perSec + x.mainFrames.perSec) x = r;
				if (r.drawn.perSec <= drawnMax && r.mainFrames.perSec <= mainMax) break;
			}
			t.log(`${at}: STILL drawn ${x.drawn.perSec}/s, main frames ${x.mainFrames.perSec}/s, main ${Math.round(x.cost.main)} ms/s, GPU ${Math.round(x.cost.gpuMain)} ms/s, viz ${Math.round(x.cost.viz)} ms/s (drawn/main per try: ${tries.join('; ')}); toggle ${on && on.found ? `${on.first} elements, ${on.firstFrameMs} ms frame` : 'not seen'}`);
			if (live) t.log(`${at}: NOTE live data (Usage): frames logged, not judged; quietest try draws ${x.drawn.perSec}/s, main ${x.mainFrames.perSec}/s, by ${named(x) || 'no script'}`);
			else {
				await t.check(`${at}: still, the compositor draws at most ${drawnMax} frames a second`, x.drawn.perSec <= drawnMax, `${x.drawn.perSec}/s in the quietest of ${tries.length} tries (${tries.join('; ')})`);
				// Home's dashboard is live too (its widgets tick with the demo engine): its main frames are logged, the loops'
				// cost is judged by what the compositor draws
				if (view === 'dashboard') t.log(`${at}: NOTE Home is live (its widgets tick): main frames ${x.mainFrames.perSec}/s logged, not judged${named(x) ? '; by ' + named(x) : ''}`);
				else await t.check(`${at}: still, the main thread renders at most ${mainMax} frames a second`, x.mainFrames.perSec <= mainMax, `${x.mainFrames.perSec}/s, ${Math.round(x.cost.main)} ms/s in the quietest try${named(x) ? '; by ' + named(x) : ''}`);
			}
			if (a.still) await t.check(`${at}: going still restyles at most ${toggleMax} elements`, !!(on && on.found) && on.first <= toggleMax, on && on.found ? `${on.first} elements in the frame that holds the loops (${on.firstFrameMs} ms frame); largest recalc in the next frames ${on.max} (${on.maxMs} ms), ${on.total} in ${on.steps}` : 'no style recalc after the state went on (or no mark): could not judge');

			const stable = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), inputs: window.__stillInputs }));
			await t.check(`${at}: the view stays still throughout its rest traces`, a.still && stable.still,
				`still ${a.still} -> ${stable.still}; new wake events ${JSON.stringify(stable.inputs)}`);

			// (c) one real move wakes it, and each held loop goes on from where it was
			const held = await f.evaluate(() => { const out = []; window.__stillKeep.forEach((an, i) => { if (an.playState === 'paused') out.push([i, an.currentTime]); }); window.__stillHeld = out; window.__stillWake = 0; window.addEventListener('pointermove', (e) => { if (!window.__stillWake) window.__stillWake = e.timeStamp; }, { capture: true, once: true }); return out.length; });
			const wk = await trace(cdp, { ms: 900, url, during: async () => { await t.page.waitForTimeout(150); await move(); } });
			const woke = await f.evaluate(() => new Promise((resolve) => {
				const w = window.__stillWake;
				const t1 = Math.max(0, w + 100 - performance.now());
				setTimeout(() => {
					const now = performance.now(), bad = [], late = [];
					let worst = 0;
					for (const [i, ct] of window.__stillHeld) {
						const an = window.__stillKeep[i];
						if (!an || an.playState === 'idle') continue; // gone with its element
						if (an.playState !== 'running') { bad.push(`${an.animationName || '?'} ${an.playState}`); continue; }
						// ahead of the held time by the time since the wake, less the moment it took to start again: a reset
						// (ahead below 0), a jump forward (ahead past the time since the wake) or a late start shows here
						const ahead = an.currentTime - ct, lag = (now - w) - ahead;
						worst = Math.max(worst, lag);
						if (ahead < 0 || lag < -20 || lag > 100) late.push(`${an.animationName || '?'} ahead ${Math.round(ahead)} ms, ${Math.round(now - w)} ms after the wake (started ${Math.round(lag)} ms late)`);
					}
					resolve({ still: document.documentElement.hasAttribute('data-pm-still'), woke: w > 0, bad, late, worst: Math.round(worst), n: window.__stillHeld.length });
				}, t1);
			}));
			const off = wk.after('pm-still:off', 'pm-still:off');
			if (a.still) t.log(`${at}: WAKE ${off && off.found ? `${off.first} elements, ${off.firstFrameMs} ms first frame` : 'no recalc seen'}; loops on again at most ${woke.worst} ms after the move; wake trace longest main frame ${wk.sum.mainFrames.max} ms, by ${named(wk.sum) || 'no script'}`);
			if (a.still) {
				await t.check(`${at}: one pointer move wakes the page and every held loop runs again within 100 ms`, woke.woke && !woke.still && woke.bad.length === 0, `${woke.n} held; ${woke.bad.length ? 'not running: ' + woke.bad.slice(0, 5).join('; ') : 'all running'}${woke.still ? '; still after the move' : ''}`);
				await t.check(`${at}: each loop goes on from where it was held (no restart, no jump)`, woke.late.length === 0, woke.late.length ? woke.late.slice(0, 5).join('; ') : `each started again at most ${woke.worst} ms after the waking move`);
				await t.check(`${at}: waking restyles at most ${toggleMax} elements`, !!(off && off.found) && off.first <= toggleMax, off && off.found ? `${off.first} elements in the first frame after the move (${off.firstFrameMs} ms frame); largest recalc in the next frames ${off.max} (${off.maxMs} ms), ${off.total} in ${off.steps}` : 'no style recalc after the wake (or no mark): could not judge');
			}
		}
	}

	// Every additional wake starts from still. No synthetic events or focus-based proxy for visibility.
	await t.app.look('basic-dark');
	await f.evaluate(() => PM_PAGES.go('settings'));
	await move();
	const stillBefore = async (name) => {
		await t.page.waitForTimeout(after + 1800);
		const state = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), inputs: window.__stillInputs }));
		await t.check(`${name}: page is still before the wake`, state.still, JSON.stringify(state));
		return state.still;
	};
	// The opaque app can be hovered while keyboard focus stays in its wrapper. Put focus in the app before the wait.
	await f.locator('#themeSelect').focus();
	await stillBefore('key');
	await f.evaluate(() => {
		window.__stillKey = null;
		window.addEventListener('keydown', (e) => { window.__stillKey = { key: e.key, trusted: e.isTrusted }; }, { capture: true, once: true });
	});
	await t.page.keyboard.press('Shift');
	const keyed = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), event: window.__stillKey, focused: document.activeElement?.id }));
	await t.check('one key wakes the still page', keyed.event?.trusted && keyed.event.key === 'Shift' && !keyed.still, JSON.stringify(keyed));
	await stillBefore('resize');
	await t.viewport(1900, 1060);
	await t.page.waitForTimeout(150);
	await t.check('one window resize wakes the still page', !(await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'))));
	await t.viewport(1920, 1080);
	await stillBefore('visibilitychange');
	await f.evaluate(() => {
		window.__stillVisibility = [];
		window.addEventListener('visibilitychange', (e) => {
			const row = { trusted: e.isTrusted, visible: document.visibilityState === 'visible', before: document.documentElement.hasAttribute('data-pm-still') };
			window.__stillVisibility.push(row);
		}, true);
		// Registered after the product's document listener: read after it handles this same event, before focus can run.
		document.addEventListener('visibilitychange', () => {
			window.__stillVisibility.at(-1).after = document.documentElement.hasAttribute('data-pm-still');
		});
	});
	// Focus emulation is per CDP session: disable the harness's own keeper, too.
	const focusCdp = await t.run.cdpFor(t.top);
	await focusCdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
	await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
	try {
		// A second headless target need not hide the first. Chromium's frozen transition calls WasHidden();
		// unfreeze while hidden to inspect it, then restore visibility with focus emulation (real browser events).
		await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
		await cdp.send('Page.setWebLifecycleState', { state: 'active' });
		await f.waitForFunction(() => document.visibilityState === 'hidden', null, { timeout: 5000, polling: 100 });
		await t.check('becoming hidden leaves the page still', await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still')));
		await focusCdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
		await f.waitForFunction(() => document.visibilityState === 'visible', null, { timeout: 5000, polling: 100 });
		const changes = await f.evaluate(() => window.__stillVisibility);
		await t.check('becoming visible itself wakes the still page', changes.some((x) => x.trusted && x.visible && x.before && x.after === false), JSON.stringify(changes));
	} finally {
		await cdp.send('Page.setWebLifecycleState', { state: 'active' });
		await focusCdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	}

	// ---- (e) the onboarding window and the tour: never still while either is open ----
	await t.app.look('basic-dark');
	await f.evaluate(() => PM_PAGES.go('dashboard'));
	await move();
	await t.page.waitForTimeout(after + 1500);
	const before = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await f.evaluate(() => O55.ui.open({ screen: 'welcome' }));
	await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).catch(() => {});
	await t.page.waitForTimeout(200);
	const opened = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await t.page.waitForTimeout(after + 2000);
	const under = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), open: document.documentElement.hasAttribute('data-o55-open') }));
	await t.check('onboarding window opened while still: the state goes off at once and stays off while it is open', before && !opened && under.open && !under.still, `still before ${before}, 200 ms after the open ${opened}, ${after + 2000} ms later ${under.still} (window open ${under.open})`);
	await f.evaluate(() => O55.ui.close('close'));
	await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 }).catch(() => {});
	await t.page.waitForTimeout(after + 2500);
	const closed = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await t.check('after the window closes, with no input, the page goes still again by itself', closed, `still ${closed}`);
	await f.evaluate(() => O55.tour.start({ fresh: true }));
	await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-tour'), null, { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(200);
	const tourAt = await f.evaluate(() => document.documentElement.hasAttribute('data-pm-still'));
	await t.page.waitForTimeout(after + 2000);
	const tour = await f.evaluate(() => ({ still: document.documentElement.hasAttribute('data-pm-still'), tour: document.documentElement.hasAttribute('data-o55-tour') }));
	await t.check('Guided Tour started while still: the state goes off at once and stays off during the tour', !tourAt && tour.tour && !tour.still, `200 ms after the start ${tourAt}, ${after + 2000} ms later ${tour.still} (tour on ${tour.tour})`);
	await f.evaluate(() => O55.tour.skip && O55.tour.skip()).catch(() => {});
	await cdp.detach().catch(() => {});

	// ---- (d) Reduced Motion: nothing changes ----
	await t.emulate({ reducedMotion: 'reduce' });
	const fr = await t.app.open({ query: `pm-warm=0&pm-still=${after}` });
	for (const look of ['basic-dark', 'glass-dark']) {
		await t.app.look(look);
		await fr.evaluate(() => PM_PAGES.go('dashboard'));
		await move();
		await t.page.waitForTimeout(1000);
		const r0 = await fr.evaluate(CENSUS);
		await t.page.waitForTimeout(after + 3000);
		const r1 = await fr.evaluate(CENSUS);
		await t.check(`${look} home, Reduced Motion: the page never goes still, marks nothing, and its running loops stay as they were`, !r1.still && r1.marks === 0 && r1.run.length === r0.run.length,
			`still ${r1.still}, endless running ${r0.run.length} -> ${r1.run.length}, ${r1.marks} marked`);
	}
	await t.emulate({ reducedMotion: 'no-preference' });
}
