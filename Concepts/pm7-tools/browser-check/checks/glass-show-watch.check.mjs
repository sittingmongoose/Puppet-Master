// E3 (pm7-perf stream, 2026-11-15): a hidden lens comes back by events, not by a 400 ms poll. glass.js watches
// every hidden lens's strip with a per-strip ResizeObserver (showWatch): a box that goes from at most 1 px to more
// than 1 px in either axis runs the hidden-lens check once through onLayout. A 2000 ms safety-net timer remains for
// what no observer reports (a visibility-only change: inline visibility, a stylesheet visibility keyed to an
// unobserved attribute), armed only while a lens is hidden. The wake and the tick share one queued check (showHold):
// the queued check drops any pending tick before it looks and arms the next interval itself, so a sync that lands
// while the check waits for layout cannot make it skip its look (5ea1e87906, verified in a browser by QW6: one net
// tick per show, no re-arm race). Since 34b45edf15 such a sync does arm a tick of its own (awaitShow), and a tick
// that still finds a check queued two seconds later queues again: a net for a queued check that is ever lost.
// Spec: the share's 2026-11-11-pm7-performance/followups/E3-glass-poll.md, test rows 1, 2, 3, 4, 9 and 13.
//
// Each look's pass must run in that look (R77 T1): the onboarding window paints its draft's look and leaves it
// painted, so row 9's warm-up starts a fresh session (the draft takes the look on screen) and rows 9 and 13 assert
// that the look under test is still painted (after the warm-up, after the measured cycle, before the rest count).
// Before 2026-11-16 the warm-up resumed the first pass's draft and the second pass's rows 9 and 13 ran in the
// first look: runs older than that read glass-light's rows 9 and 13 as a second Glass Dark sample.
//
// Rows, per Glass look (Glass Dark and Light), both surfaces, 1920x1080. Budgets are QW6's, from measurements on
// alexis (loaded host, RTX 3080): 5 full runs per surface on the branch page (qw6.html, 5ea1e87906) and on main
// (v-main.html), plus row 2 x20 per surface on the branch page twice (the lead's queue and QW6's own). Ranges are
// min-max over both looks.
//   1  inline display: nav.page-tabs style.display='none', lens out, then '' again: lens back within 150 ms
//      (the ResizeObserver wake; one frame plus layout). Branch measured 18-88 ms. The old 400 ms poll should
//      miss the budget: showTabsLocked waits for the queued check's re-arm before showing. The old page read
//      about 350-420 ms with the original lock; its free-phase tail reached 114 ms (an ambient
//      sync or the PM_LG.sync() fallback can discover the hide at any poll phase), which no bound above the
//      branch's 88 ms could fail every run; the lock makes the separation deterministic. The measured time is
//      from the show write either way; the branch has no 400 ms timer, so its show is never delayed.
//   2  inline visibility: style.visibility='hidden' then '': lens back within 2200 ms. By design no observer sees
//      this (edit 1 of the spec was not done): the safety net answers it. The design guarantee is one 2000 ms
//      interval plus one layout; wall time adds the loaded host's scheduling: the slowest of the 180 repetitions
//      (the lead's queue 80, QW6's own 80, the full runs' 20) was 2110 ms (sandbox, Glass Dark) = 2000 + a
//      callback 60 ms late (dt2060) + 43 ms to the queued check + 14 ms rAF sampling, one tick and one look, no
//      race. Branch measured 1357-2110 ms (the short reps are phase luck: the pending tick was already part-way
//      through its interval); main 72-446 ms (its poll is faster). Passes on main too.
//   3  stylesheet visibility (case C): a temporary <style> nav.page-tabs { visibility: hidden } in <head>, then
//      removed: lens back within 2200 ms (the same net; branch measured 856-2025 ms, main 181-350 ms). Documents
//      the fallback; if the net is ever deleted by audit, remove this row on purpose, not leave it failing.
//   4  ancestor class: the Usage page's own hiding class (.primary-content > .page loses and regains 'active',
//      display:none via class): lens back within 600 ms. A .page class change alone is not HOT in glass.js's mo
//      handler: it syncs through lazySync's 140 ms debounce plus the page's own transition, measured 216-478 ms on
//      the branch and 156-380 ms on main. This change does not touch that path; the budget is main's worst x1.5
//      rounded up, a regression guard, not the spec's 40 ms (which neither page meets).
//   9  onboarding window: opened with data-o55-solid (the visibility:hidden sheet rule at 10-window.css:27 is
//      asserted to apply), the behind-window lens out within 700 ms of the open call (branch 181-451 ms, main
//      159-434 ms: the window-open path, which this change does not touch; main's worst x1.5 rounded up); on close,
//      back within 200 ms of the removal of data-o55-open (the root observer's own trigger; branch 8-24 ms, main
//      7-27 ms, the spec's budget kept). The window's exit animation runs before that removal; the wall time from
//      the close() call is logged, not judged (532-1062 ms seen).
//   13 resting wake count: with one strip hidden by row 1's method, a setTimeout wrapper installed before the
//      page's scripts run counts show-watch timer requests by their glass.js call sites at any delay in a fixed
//      10 s page-clock window (driver read delay cannot extend it),
//      and counts the callbacks that fire: only 2000 ms is allowed, at most 6 FIRE (the cost: one
//      tick per 2000 ms is 5, 6 on a window edge) and at most 12 are asked. Keep at most one pending tick, account
//      for fires and cancellations across the window edges, and only accept the wake and queued-check clear sites.
//      Requests are not wakes: since
//      34b45edf15 a sync that lands while a check is queued arms a tick which that check drops, and each wake
//      drops and re-arms one, so the count of requests moves with ambient syncs (5 on the normal surface, 5-7
//      on the sandboxed one over the lead's runs, where 7 failed the earlier bound of 6 requests on a page that
//      fired 5); 12 is two per interval. Main asks and fires 24-25, all at 400 ms: FAILS on main (the 400 ms row
//      and the fire count). Then the strip is shown (with row 1's lock) and the lens must appear
//      within 150 ms (branch 20-44 ms; main's free-phase tail reached 13 ms, so without the lock this assertion
//      could pass on main — the counts above are row 13's unconditional separation).
//
// QW5: --set only=1,2,3,4,9,13 runs those rows and no others; --set repeat=<n> runs each of them n times
// (default 1). Row 2 keeps a trace, times relative to the show write: each attributed show-watch timer
// (ask, fire, and clear — a clear is the ResizeObserver wake, or the queued check, dropping the pending tick),
// and each change of the captured lens's inline opacity. An ask's g is its line inside the lg-js block, which is
// glass.js's own line (the block is that file). At 5ea1e87906 the ask sites are awaitShow (g2081, only when no
// tick is pending and no check is waiting for layout), the queued check's document.hidden re-arm (g2095), the
// tick's document.hidden re-arm (g2105, inFire and docHidden), and the re-arm at the bottom of the check (g2126;
// inFire when onLayout ran the check at once inside the timer callback). fire dt is ms from that ask to the
// callback: a dt well over 2000 is a late callback; a fire near +2000 whose ask is near the show is one interval;
// a clear after the show followed by an awaitShow ask (g2081) would be the old re-arm race, fixed by showHold.
//
// Measured facts (QW6's runs, replacing QW4's written-without-a-browser notes):
//   - The hide direction of rows 1-3 is discovered by the app's ambient writes (an inline style or a <head> sheet
//     is not observed; edit 1 was deliberately not done). When no ambient sync puts the lens out within 1200 ms,
//     the check calls PM_LG.sync() once (the spec's named hook) and logs it: 5 of the 20 row-2 hides in the
//     branch's full runs used it, 3 of 40 in each queue run. The appearance budget is measured from the show
//     write either way.
//   - A page-side rAF sampler arms before each write and saves its first good sample. A frame gap spanning the
//     budget leaves the timing unverified and is reported separately from a lens still out after the deadline.
//     On the loaded host one sampling gap measured 63 ms and one timer callback ran 60 ms late (2067 and 2110 ms).
//   - Row 13 resolves show-watch call sites inside the built page's lg-js block (helpers/built-source.mjs).
//   --set looks=glass-dark   --set size=1920x1080   --set settle=6000   --set only=2   --set repeat=20
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { pageSource, blocksOf } from '../helpers/built-source.mjs';

const LOOKS = ['glass-dark', 'glass-light'];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const wanted = (v) => {
	if (v == null || String(v).trim() === '') return null;
	const s = new Set();
	for (const part of String(v).split(',')) {
		const n = Number(part.trim());
		if (Number.isFinite(n)) s.add(n);
	}
	return s.size ? s : null;
};
const repeatCount = (v) => {
	const n = Number(v || 1);
	return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};
const tagOf = (look, surface, rep, reps) => `${look} ${surface}` + (reps > 1 ? ` rep ${rep}` : '');

/* Read call sites from the exact build being tested, including the pre-event 400 ms implementation. */
export function showWatchSites(src, range) {
	const asks = {};
	const clears = {};
	let owner = '';
	for (const [offset, line] of src.split('\n').slice(range.from - 1, range.to).entries()) {
		const declaration = /^  function (\w+)\(/.exec(line);
		if (declaration) owner = declaration[1];
		if (/^  var showWatch\s*=/.test(line)) owner = 'showWatch';
		if (/\bshowT\s*=\s*setTimeout\s*\(\s*checkShown\b/.test(line)) asks[range.from + offset] = owner;
		if (/\bclearTimeout\s*\(\s*showT\s*\)/.test(line)) clears[range.from + offset] = owner;
	}
	return { asks, clears };
}

export function restAttribution(c) {
	if (c.unattributed) return `${c.unattributed} show-watch timer calls could not be attributed to the built source`;
	if (!c.asked && !c.fired) return 'no matching show-watch timers were observed';
	return '';
}

export function restChurn(c) {
	const problems = [];
	if (c.pendingAtStart + c.asked - c.cleared !== c.fired + c.pending) problems.push('timer lifecycle did not balance');
	if (c.peakPending > 1) problems.push(`${c.peakPending} timers were pending at once`);
	if (c.badAsks.length) problems.push(`unexpected request sites ${c.badAsks.join(', ')}`);
	if (c.badClears.length) problems.push(`unexpected cancellation sites ${c.badClears.join(', ')}`);
	// R132-FOLLOWUPS 4: balanced clear/rearm churn at approved sites stays under the caps and the lifecycle
	// balance (five redundant queueShown clear/rearms, four fires, nine asks, one pending at both edges). Each
	// clear followed by a re-arm without an intervening fire is one rearm cycle; a healthy window rearms at most
	// once per completed interval (the wake/queued-check drops the header counts), so more rearms than fires is
	// redundant churn, not the ambient syncs' own drops.
	const rearms = c.rearms || 0;
	if (rearms > c.fired) problems.push(`${rearms} redundant clear/rearm cycles for ${c.fired} fires (at most one per interval)`);
	return problems.join('; ');
}

/* Installed before page scripts. Read the immediate caller, and use the owner's callback name to detect stack
   attribution failures even when they would otherwise produce a plausible zero. */
export const TIMER_PROBE = (range) => {
	const P = window.__swt = { until: 0, events: [], seq: 1, byId: new Map(), depth: 0 };
	const realSet = window.setTimeout;
	const realClear = window.clearTimeout;
	const counting = (now) => now < P.until;
	const askOwners = new Set(['awaitShow', 'checkShown', 'queueShown', 'checkShownNow']);
	const clearOwners = new Set(['showWatch', 'queueShown']);
	const lineOf = () => {
		const caller = String(new Error().stack || '').split('\n')[3] || '';
		const match = /:(\d+):\d+\)?$/.exec(caller);
		return match && caller.slice(0, match.index).endsWith(location.href) ? Number(match[1]) : -1;
	};
	const push = (e) => {
		P.events.push(e);
		if (P.events.length > 800) P.events.splice(0, P.events.length - 800);
	};
	/* inline styles only: a layout read here would change the timing this trace exists to measure */
	const snap = () => {
		const s = document.querySelector('nav.page-tabs');
		const lens = window.__gsw && window.__gsw.lens;
		return { vis: s ? s.style.visibility : '', op: lens && lens.isConnected ? lens.style.opacity : '' };
	};
	P.note = (k) => {
		const s = snap();
		push({ k, at: Math.round(performance.now()), vis: s.vis, op: s.op, t0: window.__gsw ? Math.round(window.__gsw.t0) : 0 });
	};
	window.setTimeout = function (fn, delay, ...rest) {
		const now = performance.now();
		const l = lineOf();
		const site = range.asks[l];
		if (!site || typeof fn !== 'function') {
			if (counting(now) && (site || fn?.name === 'checkShown')) P.unattributed++;
			return realSet.call(window, fn, delay, ...rest);
		}
		const d = Number(delay);
		const meta = { n: P.seq++, d, asked: Math.round(now), line: l, g: l - range.from, site };
		let id = 0;
		const wrapped = function (...a) {
			const at = performance.now();
			if (counting(at)) { P.fired++; P.pending--; P.delays.add(d); P.afterClear = false; }
			P.byId.delete(id);
			const s = snap();
			push({ k: 'fire', n: meta.n, d: meta.d, at: Math.round(at), asked: meta.asked, g: meta.g, vis: s.vis, op: s.op, hidden: document.hidden });
			P.depth++;
			try { return fn.apply(this, a); }
			finally { P.depth--; }
		};
		id = realSet.call(window, wrapped, delay, ...rest);
		P.byId.set(id, meta);
		const s = snap();
		push({ k: 'ask', n: meta.n, d, at: meta.asked, g: meta.g, site, vis: s.vis, op: s.op, inFire: P.depth > 0, hidden: document.hidden });
		if (counting(now)) {
			P.asked++;
			P.pending++;
			P.peakPending = Math.max(P.peakPending, P.pending);
			if (!askOwners.has(site)) P.badAsks.add(`${site}@${l}`);
			P.delays.add(d);
			if (P.sites.length < 14) P.sites.push(d + 'ms@' + l);
			// R132-FOLLOWUPS 4: a clear followed by a re-arm without an intervening fire is one rearm cycle
			if (P.afterClear) P.rearms++;
			P.afterClear = false;
		}
		return id;
	};
	window.clearTimeout = function (id) {
		const meta = P.byId.get(id);
		if (meta) {
			const now = performance.now();
			if (counting(now)) {
				const l = lineOf();
				const site = range.clears[l];
				P.cleared++;
				P.pending--;
				if (!clearOwners.has(site)) P.badClears.add(`${site || 'unknown'}@${l}`);
				P.afterClear = true;
			}
			const s = snap();
			push({ k: 'clear', n: meta.n, d: meta.d, at: Math.round(now), asked: meta.asked, g: meta.g, vis: s.vis, op: s.op });
			P.byId.delete(id);
		}
		return realClear.call(window, id);
	};
	P.arm = (ms = 10000) => {
		P.asked = 0; P.fired = 0; P.cleared = 0; P.unattributed = 0; P.rearms = 0; P.afterClear = false;
		P.pendingAtStart = P.pending = P.peakPending = P.byId.size;
		P.delays = new Set(); P.badAsks = new Set(); P.badClears = new Set(); P.sites = [];
		P.until = performance.now() + ms;
	};
	P.read = () => {
		const complete = performance.now() >= P.until;
		P.until = 0;
		return {
			complete, asked: P.asked, fired: P.fired, cleared: P.cleared, unattributed: P.unattributed, rearms: P.rearms,
			pendingAtStart: P.pendingAtStart, pending: P.pending, peakPending: P.peakPending,
			badAsks: [...P.badAsks], badClears: [...P.badClears], delays: [...P.delays], sites: P.sites.slice(),
		};
	};
	P.between = (a, b) => P.events.filter((e) => e.at >= a && e.at <= b);
};

/* in the page: the lens over a strip's chosen item, captured while shown (its box stays when it goes out), and an
   rAF-sampled wait for its inline opacity to leave '0' or come back */
export const PROBE = () => {
	const lensOver = (item) => {
		const r = item.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
		for (const l of document.querySelectorAll('i.lg-lens:not(.lg-bead)')) {
			const b = l.getBoundingClientRect();
			if (b.width < 2 || b.height < 2) continue;
			if (cx >= b.left - 1 && cx <= b.right + 1 && cy >= b.top - 1 && cy <= b.bottom + 1) return l;
		}
		return null;
	};
	window.__gsw = {
		lens: null, t0: 0, tGone: 0, tClose: 0,
		capture(sel, itemSel) {
			const strip = document.querySelector(sel);
			const item = strip && strip.querySelector(itemSel || '.active');
			this.lens = item ? lensOver(item) : null;
			this.watch();
			return !!this.lens;
		},
		/* inline opacity only; the observer fires after the write, in the same turn's microtasks */
		watch() {
			if (this.opMo) this.opMo.disconnect();
			this.opMo = null;
			if (!this.lens || !window.__swt) return;
			const lens = this.lens;
			let prev = lens.style.opacity;
			window.__swt.note('op');
			this.opMo = new MutationObserver(() => {
				const op = lens.style.opacity;
				if (op === prev) return;
				prev = op;
				window.__swt.note('op');
			});
			this.opMo.observe(lens, { attributes: true, attributeFilter: ['style'] });
		},
		mark() { this.t0 = performance.now(); },
		arm(state, timeout, fromGone = false) { this.sample = this.wait(state, timeout, fromGone); },
		showTabs(how, timeout) {
			if (timeout !== undefined) this.arm('back', timeout);
			this.mark();
			const s = document.querySelector('nav.page-tabs');
			if (how === 'display') s.style.display = '';
			else if (how === 'visibility') s.style.visibility = '';
			else document.getElementById('gsw-case-c')?.remove();
			window.__swt.note('show');
		},
		out() { return !!this.lens && (!this.lens.isConnected || this.lens.style.opacity === '0'); },
		back() { return !!this.lens && this.lens.isConnected && this.lens.style.opacity !== '0' && getComputedStyle(this.lens).visibility !== 'hidden'; },
		/* ms from the last mark() (fromGone: from the recorded removal of data-o55-open instead) */
		wait(state, timeout, fromGone) {
			const want = state === 'out' ? () => this.out() : () => this.back();
			return new Promise((resolve) => {
				const start = performance.now();
				let lastMissMs = 0;
				let previous = start;
				let maxGapMs = 0;
				const tick = () => {
					const from = fromGone ? this.tGone : this.t0;
					const ok = !!from && want();
					const now = performance.now();
					const ms = from ? now - from : -1;
					if (from) maxGapMs = Math.max(maxGapMs, now - Math.max(previous, from));
					if (!ok && from) lastMissMs = ms;
					if (ok || now - start > timeout) { resolve({ ok, ms, lastMissMs, maxGapMs }); return; }
					previous = now;
					requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			});
		}
	};
};

export function appearanceVerdict(sample, budget) {
	if (sample.ok && sample.ms <= budget) return 'pass';
	if (sample.ms < 0) return 'missing origin';
	return sample.lastMissMs >= budget ? 'late' : 'sampling gap';
}

async function checkAppearance(t, label, sample, budget, trace = '') {
	const verdict = appearanceVerdict(sample, budget);
	const fmt = (ms) => `${Math.round(ms)} ms`;
	const detail = `${fmt(sample.ms)} from the write, max sampling gap ${fmt(sample.maxGapMs)}${trace ? `; ${trace}` : ''}`;
	if (verdict === 'sampling gap') {
		await t.check(`${label} (sampling gap)`, false, `last miss at ${fmt(sample.lastMissMs)}; ${detail}`);
	} else {
		await t.check(label, verdict === 'pass', verdict === 'missing origin' ? 'measurement origin was never observed' : detail);
	}
}

/* hide nav.page-tabs by inline display, inline visibility, or a temporary head stylesheet; wait for the lens to go
   out (ambient app writes discover the hide; PM_LG.sync() once as the fallback, logged) */
function formatTrace(events, origin) {
	const rel = (at) => { const d = at - origin; return (d >= 0 ? '+' : '') + d; };
	const vis = (v) => (v === 'hidden' ? 'hidden' : v ? v : 'clear');
	return events.map((e) => {
		const op = e.op === '' ? "''" : e.op;
		if (e.k === 'ask') return `ask#${e.n}@${rel(e.at)} ${e.d}ms g${e.g}${e.inFire ? ' inFire' : ''}${e.hidden ? ' docHidden' : ''} vis=${vis(e.vis)} op=${op}`;
		if (e.k === 'fire') return `fire#${e.n}@${rel(e.at)} dt${e.at - e.asked} g${e.g}${e.hidden ? ' docHidden' : ''} vis=${vis(e.vis)} op=${op}`;
		if (e.k === 'clear') return `clear#${e.n}@${rel(e.at)} dt${e.at - e.asked} g${e.g} vis=${vis(e.vis)} op=${op}`;
		if (e.k === 'op') return `op@${rel(e.at)} ${op}`;
		return `${e.k}@${rel(e.at)} vis=${vis(e.vis)} op=${op}`;
	}).join(' | ');
}

async function showTrace(f) {
	return f.evaluate(() => {
		const ev = window.__swt.events;
		let show = null, hide = null;
		for (let i = ev.length - 1; i >= 0; i--) {
			if (!show && ev[i].k === 'show') show = ev[i];
			if (!hide && ev[i].k === 'hide') hide = ev[i];
			if (show && hide) break;
		}
		const origin = show ? (show.t0 || show.at) : 0;
		const a = (hide ? hide.at : origin) - 4000;
		const b = Math.round(performance.now()) + 20;
		return { origin, events: window.__swt.between(a, b) };
	});
}

async function hideTabs(f, how) {
	await f.evaluate((h) => {
		window.__gsw.arm('out', 1200);
		window.__gsw.mark();
		const s = document.querySelector('nav.page-tabs');
		if (h === 'display') s.style.display = 'none';
		else if (h === 'visibility') s.style.visibility = 'hidden';
		else { const st = document.createElement('style'); st.id = 'gsw-case-c'; st.textContent = 'nav.page-tabs { visibility: hidden }'; document.head.appendChild(st); }
		if (window.__swt) window.__swt.note('hide');
	}, how);
	let out = await f.evaluate(() => window.__gsw.sample);
	let hooked = false;
	if (!out.ok) {
		hooked = true;
		await f.evaluate(() => { window.__gsw.arm('out', 600); window.__swt.note('sync'); PM_LG.sync(); });
		out = await f.evaluate(() => window.__gsw.sample);
	}
	return { ...out, hooked };
}

export const showTabs = (f, how, timeout) => f.evaluate(([h, ms]) => window.__gsw.showTabs(h, ms), [how, timeout]);

/* A poll fire queues layout work. Keep the strip hidden until checkShownNow itself requests the next poll,
   then write in the same evaluation so a driver round trip can't spend the interval we just established. */
export async function showTabsLocked(f, how, timeout) {
	return f.evaluate(async ([h, ms]) => {
		const P = window.__swt;
		const show = () => window.__gsw.showTabs(h, ms);
		const hiddenAt = P.events.findLast((e) => e.k === 'hide')?.at ?? performance.now();
		const pendingPolls = () => [...P.byId.values()].filter((m) => m.d === 400);
		const polledWhileHidden = P.events.some((e) => e.d === 400 && e.at >= hiddenAt);
		if (!polledWhileHidden && !pendingPolls().length) {
			show();
			return { ok: true, detail: 'no 400 ms poll observed' };
		}
		const until = performance.now() + 700;
		while (performance.now() < until) {
			const fire = P.events.findLast((e) => e.k === 'fire' && e.d === 400 && !e.hidden && e.at >= hiddenAt);
			const next = fire && pendingPolls().find((m) => m.site === 'checkShownNow' && m.n > fire.n);
			if (next && performance.now() - next.asked < 240) {
				show();
				return { ok: true, detail: `poll #${fire.n} completed and re-armed #${next.n}` };
			}
			await new Promise((r) => setTimeout(r, 8));
		}
		window.__gsw.showTabs(h); // Restore the strip so the next row can run.
		return { ok: false, detail: 'no fresh 400 ms re-arm from the queued check within 700 ms' };
	}, [how, timeout]);
}

async function cell(t, surface, W, H) {
	const only = wanted(t.args.only);
	const reps = repeatCount(t.args.repeat);
	const runRow = (row) => !only || only.has(row);
	const src = await pageSource(t);
	const lg = blocksOf(src).find((b) => b.id === 'lg-js');
	await t.check(`the built page carries the lg-js block ${surface}`, !!lg, lg ? `lines ${lg.from}-${lg.to}` : 'no script#lg-js: glass.js timers cannot be attributed', { hard: true });
	if (!lg) return;
	const sites = showWatchSites(src, lg);
	const knownSites = Object.values(sites.asks);
	await t.check(`show-watch timer attribution is available ${surface}`, knownSites.includes('awaitShow') && knownSites.includes('checkShownNow'), 'expected showT setTimeout sites in awaitShow and checkShownNow', { hard: true });
	await t.page.addInitScript(TIMER_PROBE, { ...lg, ...sites });
	const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
	await f.evaluate(PROBE);
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.page.waitForTimeout(Number(t.args.settle ?? 6000));
	if (only || reps > 1) t.log(`glass-show-watch ${surface}: rows ${only ? [...only].sort((a, b) => a - b).join(',') : 'all'} x${reps}`);

	for (const look of list(t.args.looks, LOOKS)) {
		const base = `${look} ${surface}`;
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await f.evaluate(() => PM_PAGES.go('dashboard'));
		await parkPointer(t.page, W, H);
		await t.page.waitForTimeout(2500);
		const painted = () => f.evaluate(() => `${document.documentElement.getAttribute('data-theme')} lg=${document.documentElement.getAttribute('data-lg')}`);
		const on = (await painted()) === `${look} lg=on`;
		await t.check(`Glass is on in ${base}`, on, '', { hard: true });
		if (!on) continue;

		/* rows 1-3: nav.page-tabs, the lens captured while shown */
		for (const [row, how, budget] of [[1, 'display', 150], [2, 'visibility', 2200], [3, 'sheet', 2200]]) {
			if (!runRow(row)) continue;
			for (let rep = 1; rep <= reps; rep++) {
				const tag = tagOf(look, surface, rep, reps);
				const cap = await f.evaluate(() => window.__gsw.capture('nav.page-tabs', '.page-tab.active'));
				const shown = cap && await f.evaluate(() => window.__gsw.back());
				await t.check(`row ${row}: the page-tabs lens is shown before the hide ${tag}`, shown, cap ? 'lens out already' : 'no lens over the active tab: could not judge', { hard: reps === 1 });
				if (!shown) continue;
				const out = await hideTabs(f, how);
				await t.check(`row ${row}: the hide puts the lens out ${tag}`, out.ok, out.ok ? `${Math.round(out.ms)} ms${out.hooked ? ' (PM_LG.sync() fallback: no ambient sync discovered the hide in 1200 ms)' : ''}` : 'lens still shown after 1200 ms and PM_LG.sync()');
				if (!out.ok) {
					await showTabs(f, how);
					if (row === 2) {
						const traced = await showTrace(f);
						t.log(`row 2 ${tag}: hide did not put the lens out; ${formatTrace(traced.events, traced.origin)}`);
					}
					continue;
				}
				if (row === 1) {
					const phase = await showTabsLocked(f, how, budget + 2000);
					await t.check(`row 1: the show phase is established ${tag}`, phase.ok, phase.detail);
					if (!phase.ok) continue;
				} else await showTabs(f, how, budget + 2000);
				const back = await f.evaluate(() => window.__gsw.sample);
				let trace = '';
				if (row === 2) {
					const traced = await showTrace(f);
					trace = formatTrace(traced.events, traced.origin);
					t.log(`row 2 ${tag}: lens back in ${Math.round(back.ms)} ms (budget ${budget} ms)${out.hooked ? '; hide used PM_LG.sync()' : ''}; ${trace}`);
				} else t.log(`row ${row} ${tag}: lens back in ${Math.round(back.ms)} ms (budget ${budget} ms)`);
				await checkAppearance(t, `row ${row}: the lens appears within ${budget} ms ${tag}`, back, budget, trace);
				if (reps > 1 && !back.ok) {
					await f.evaluate(() => PM_LG.sync());
					const again = await f.evaluate(() => window.__gsw.wait('back', 2500));
					t.log(`row ${row} ${tag}: lens was still out after the budget wait; PM_LG.sync() recovery ${again.ok ? Math.round(again.ms) + ' ms' : 'failed'}`);
				}
				await t.page.waitForTimeout(400);
			}
		}

		/* row 4: the Usage page's own hiding class on .primary-content > .page (display:none via class) */
		if (runRow(4)) {
			await f.evaluate(() => PM_PAGES.go('usage'));
			await t.page.waitForTimeout(2000);
			for (let rep = 1; rep <= reps; rep++) {
				const tag = tagOf(look, surface, rep, reps);
				const cap = await f.evaluate(() => window.__gsw.capture('#pmuRange', ':scope > button.active'));
				const shown = cap && await f.evaluate(() => window.__gsw.back());
				await t.check(`row 4: the Usage range lens is shown ${tag}`, shown, cap ? 'lens out already' : 'no lens over the chosen range button: could not judge', { hard: reps === 1 });
				if (!shown) continue;
				await f.evaluate(() => { window.__gsw.arm('out', 2000); window.__gsw.mark(); document.querySelector('#pmuRange').closest('.primary-content > .page').classList.remove('active'); });
				const out = await f.evaluate(() => window.__gsw.sample);
				await t.check(`row 4: the page class hide puts the lens out ${tag}`, out.ok, `${Math.round(out.ms)} ms`);
				await f.evaluate(() => { window.__gsw.arm('back', 2000); window.__gsw.mark(); document.querySelector('#pmuRange').closest('.primary-content > .page').classList.add('active'); });
				const back = await f.evaluate(() => window.__gsw.sample);
				t.log(`row 4 ${tag}: lens back in ${Math.round(back.ms)} ms (budget 600 ms; a .page class change alone syncs through lazySync's 140 ms debounce, see the header)`);
				await checkAppearance(t, `row 4: the ancestor class show returns the lens within 600 ms ${tag}`, back, 600);
			}
		}
		if (runRow(4) && (runRow(9) || runRow(13))) {
			await f.evaluate(() => PM_PAGES.go('dashboard'));
			await t.page.waitForTimeout(1500);
		}

		/* row 9: the onboarding window with the solid backdrop (the stylesheet visibility rule is exercised) */
		if (runRow(9)) for (let rep = 1; rep <= reps; rep++) {
			const tag = tagOf(look, surface, rep, reps);
			/* a warm-up cycle: the first open builds the window; its cost is not the row's. It starts a FRESH
			   onboarding session (Run Onboarding Again: its draft takes the look on screen): a resumed draft
			   repaints the look it was made in, the other pass's (R77 T1). The measured open below then resumes
			   this pass's own draft, as a reopened window does */
			await f.evaluate(() => O55.ui.open({ fresh: true }));
			await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000 });
			await f.waitForFunction(() => !document.getElementById('pm-o55-onboarding').classList.contains('o55-opening'), null, { timeout: 10000 });
			await f.evaluate(() => O55.ui.close());
			await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000 });
			await t.page.waitForTimeout(600);
			/* the window paints its draft's look and leaves it painted: a draft made in another look would turn this
			   pass into that look's (R77 T1); the row judges nothing unless the look under test is still on screen */
			const warm = await painted();
			await t.check(`row 9: ${look} is still painted after the warm-up cycle ${tag}`, warm === `${look} lg=on`, `${warm}: the onboarding window repainted another look; the row would judge that look`, { hard: true });
			if (warm !== `${look} lg=on`) continue;
			const cap = await f.evaluate(() => window.__gsw.capture('nav.page-tabs', '.page-tab.active'));
			const shown = cap && await f.evaluate(() => window.__gsw.back());
			await t.check(`row 9: the page-tabs lens is shown before the measured open ${tag}`, shown, cap ? 'lens out already' : 'no lens over the active tab: could not judge', { hard: reps === 1 });
			if (shown) {
				await f.evaluate(() => { window.__gsw.arm('out', 1500); window.__gsw.mark(); O55.solid.set(true); O55.ui.open(); });
				const out = await f.evaluate(() => window.__gsw.sample);
				t.log(`row 9 ${tag}: lens out in ${Math.round(out.ms)} ms from the open call (budget 700 ms)`);
				await checkAppearance(t, `row 9: the open puts the behind-window lens out within 700 ms ${tag}`, out, 700);
				await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-solid') && !document.getElementById('pm-o55-onboarding').classList.contains('o55-opening'), null, { timeout: 10000 });
				const solid = await f.evaluate(() => getComputedStyle(document.querySelector('nav.page-tabs')).visibility === 'hidden');
				await t.check(`row 9: the solid sheet rule hides the strip (case C exercised) ${tag}`, solid, solid ? '' : 'nav.page-tabs is not visibility:hidden under the open solid window: the row judged nothing');
				await f.evaluate(() => {
					window.__gsw.tGone = 0; window.__gsw.tClose = performance.now();
					const mo = new MutationObserver(() => { if (!document.documentElement.hasAttribute('data-o55-open')) { window.__gsw.tGone = performance.now(); mo.disconnect(); } });
					mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-o55-open'] });
					window.__gsw.arm('back', 4000, true);
					window.__gsw.sample.then(() => mo.disconnect());
					O55.ui.close();
				});
				const back = await f.evaluate(() => window.__gsw.sample);
				const wall = await f.evaluate(() => window.__gsw.tGone ? Math.round(window.__gsw.tGone - window.__gsw.tClose) : -1);
				t.log(`row 9 ${tag}: close() to data-o55-open removal ${wall} ms (the window's exit, logged not judged); lens back in ${Math.round(back.ms)} ms from the removal (budget 200 ms)`);
				await checkAppearance(t, `row 9: the close returns the lens within 200 ms of data-o55-open's removal ${tag}`, back, 200);
			}
			await f.evaluate(() => { try { O55.solid.set(null); } catch (e) {} if (window.O55.S.open) O55.ui.close(); });
			await f.waitForFunction(() => !document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 10000 }).catch(() => {});
			await t.page.waitForTimeout(600);
			const after = await painted();
			await t.check(`row 9: ${look} is still painted after the measured cycle ${tag}`, after === `${look} lg=on`, `${after}: the measured open and close ran in another look`);
		}

		/* row 13: the resting wake count with one strip hidden (row 1's method) */
		if (runRow(13)) for (let rep = 1; rep <= reps; rep++) {
			const tag = tagOf(look, surface, rep, reps);
			await f.evaluate(() => { const s = document.querySelector('nav.page-tabs'); s.style.display = ''; s.style.visibility = ''; const st = document.getElementById('gsw-case-c'); if (st) st.remove(); });
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(2000);
			const now = await painted();
			await t.check(`row 13: ${look} is painted for the rest count ${tag}`, now === `${look} lg=on`, `${now}: the count would be another look's`, { hard: true });
			if (now !== `${look} lg=on`) continue;
			const cap = await f.evaluate(() => window.__gsw.capture('nav.page-tabs', '.page-tab.active'));
			const shown = cap && await f.evaluate(() => window.__gsw.back());
			await t.check(`row 13: the page-tabs lens is shown before the rest count ${tag}`, shown, cap ? 'lens out already' : 'no lens over the active tab: could not judge', { hard: reps === 1 });
			if (!shown) continue;
			const out = await hideTabs(f, 'display');
			await t.check(`row 13: the strip is hidden for the rest count ${tag}`, out.ok, out.ok ? `${Math.round(out.ms)} ms${out.hooked ? ' (PM_LG.sync() fallback)' : ''}` : 'lens still shown');
			if (!out.ok) continue;
			await f.evaluate(() => window.__swt.arm());
			await t.page.waitForTimeout(10000);
			const c = await f.evaluate(() => window.__swt.read());
			const attribution = restAttribution(c);
			const lifecycle = `${c.pendingAtStart} pending at start, ${c.asked} requests, ${c.cleared} clears, ${c.fired} fires, ${c.pending} pending at end`;
			t.log(`row 13 ${tag}: ${lifecycle} [${c.sites.join(', ')}]; ${c.unattributed} unattributed`);
			await t.check(`row 13: the full 10 s rest window was observed ${tag}`, c.complete, 'the driver read the counter before its page-clock deadline');
			await t.check(`row 13: show-watch timer activity is attributed ${tag}`, !attribution, attribution);
			if (c.complete && !attribution) {
				await t.check(`row 13: only 2000 ms show-watch timers are used ${tag}`, c.delays.every((d) => d === 2000), `observed delays: ${c.delays.join(', ')} ms`);
				await t.check(`row 13: at most 6 show-watch timers fire in 10 s ${tag}`, c.fired <= 6, `${c.fired} fired (the 2000 ms net fires about 5; the old poll about 25)`);
				await t.check(`row 13: at most 12 show-watch timer requests in 10 s ${tag}`, c.asked <= 12, `${c.asked} requests (one after each tick, and one more for each wake or sync that lands while a check is queued: 5-7 measured)`);
				const churn = restChurn(c);
				await t.check(`row 13: show-watch requests and clears follow the timer lifecycle ${tag}`, !churn, churn ? `${churn}; ${lifecycle}` : lifecycle);
			}
			const phase = await showTabsLocked(f, 'display', 2040);
			await t.check(`row 13: the show phase is established ${tag}`, phase.ok, phase.detail);
			if (!phase.ok) continue;
			const back = await f.evaluate(() => window.__gsw.sample);
			t.log(`row 13 ${tag}: lens back in ${Math.round(back.ms)} ms after the count (row 1's 150 ms budget)`);
			await checkAppearance(t, `row 13: the lens still appears within 150 ms once shown ${tag}`, back, 150);
		}
	}
	await parkPointer(t.page, W, H);
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	tests[`E3 glass show-watch ${surface}`] = async (t) => {
		if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
		const [W, H] = String(t.args.size || '1920x1080').split('x').map(Number);
		await muteSound(t.page);
		await t.viewport(W, H);
		await t.emulate({ reducedMotion: 'no-preference' });
		await cell(t, surface, W, H);
	};
}
