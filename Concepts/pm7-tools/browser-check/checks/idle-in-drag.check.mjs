// SW-17: witness each named owner's real idle job before a real divider hold. The native-idle gate preserves boot work
// across fast setup; opening it during the held drag gives every queued callback a real native idle opportunity. The
// product scheduler must take them back for the drag and re-admit the identical callback after release.
// No owner job supplied by the test, no synthetic input, no fake drag marker.
//
// Owners are told apart by the source that asked, never by a shared bucket: an idle request belongs to an owner when the
// first page frame that asked for it (after the shared admission's own frames, PM_BUSY.idle's job.ask/idleWhenStill)
// lies inside that owner's source in the built page, found by the build's own file markers. Each owner is required
// separately, in a look where it queues work (Glass prewarm only exists in a Glass look), and a missing one fails by name.
//   usage   usage-redesign/src/js/40-board.js            (warm build, late bodies, prewarm, hold pass)
//   theme   onboarding/opus-5.5/src/js/12-theme-transition.js  (look covers: paint and warm)
//   census  onboarding/opus-5.5/base/script/pm-hover-tags-js.js (hover census steps)
//   glass   liquid-glass/opus-5.5/src/glass.js, function prewarmSoon (lens filter prewarm)
// Other PM_BUSY.idle jobs (sound, hover) are extra coverage: held and judged, never a setup witness.
//
// --set selftest=omit-usage|omit-theme|omit-census|omit-glass suppresses that one owner's real requests at the shared
// admission (by its function names, independently of the classifier) and the check must FAIL on that owner.
//
// A native idle callback is the scheduler's wrapper (PM_BUSY.idle's run), not the owner's work, so a resume is proven
// by the owner's own callback (attributed at admission even outside any native delivery): each function an owner hands PM_BUSY.idle is wrapped, and its entry is recorded against
// the native job it ran inside. A resumed job whose owner callback never ran fails by owner. (A request made straight to
// requestIdleCallback, as owners did before PM_BUSY.idle, has the owner's function as its native callback.)
// --set repeats=N (a positive integer, default 1) is the number of holds per look, and the run must complete exactly
// that many real held drags.
//
// The work itself (SW-17 redesign, 2026-11-05). Everything above watches the dispatch path, and every queue it watched had
// another queue next to it (a timer, a MessageChannel, a frame callback, the owner calling its own function again). So the
// judge of "owner work ran inside the drag" is the work, not the queue:
//   source witness: each owner's work entry points (WORK below: the bodies it hands the admission and the functions only
//     those bodies reach) are found in the built page by their own text and armed as DevTools breakpoints by script URL,
//     line and column, in the frame the app runs in (the sandbox's own target too). A breakpoint's condition records the
//     hit into a sealed recorder and returns false, so the page never pauses. Any execution of that code, from any queue,
//     any caller, any reference, is a hit; where the hit happened (the native idle job running, if any, and its first
//     frames inside a drag) is kept only to say how it got there.
//   effect witness: the writes an owner's work makes that nothing else makes, seen by a MutationObserver installed before
//     the page's scripts (the look covers' data-ready, data-warm being set, data-fx, style and cover creation; the Usage
//     board's first-drag pre-warm host).
// Each owner must show no work inside the held gesture by either witness, in every look; each required owner's work must be
// seen by the source witness after release (the probes are live, and the deferred work did run), and the covers' writes
// must be seen by the effect witness outside the drag. The dispatch recorder above stays for what it alone can say: the
// owner's job was pending at the press, the scheduler withheld its native delivery and resumed that same job after release,
// and the extra PM_BUSY.idle jobs that have no work sites here.

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mutations, dispatching } from '../helpers/idle-drag-negatives.mjs';

const HOLD_MS = 3000;

const OWNERS = [
	{ key: 'usage', name: 'Usage board (40-board.js)', start: '/* ---- js/40-board.js ---- */' },
	{ key: 'theme', name: 'look covers (12-theme-transition.js)', start: '/* ---- js/12-theme-transition.js ---- */' },
	{ key: 'census', name: 'hover census (pm-hover-tags-js.js)', start: '<script id="pm-hover-tags-js">' },
	{ key: 'glass', name: 'Glass prewarm (glass.js prewarmSoon)', start: '<script id="lg-js">', fn: '(?:^|\\.)prewarmSoon$', glassOnly: true }
];
const ADMISSION = '/* ---- js/11-motion-start.js ---- */';
const EXTRA = { key: 'busy', name: 'other PM_BUSY.idle jobs' };
const nameOf = (key) => (OWNERS.find((o) => o.key === key) || (key === EXTRA.key ? EXTRA : null))?.name || key;
const needed = (look) => OWNERS.filter((o) => !o.glassOnly || /^glass-/.test(look));

// Each owner's work, read from its source: the bodies it hands PM_BUSY.idle and the work functions only those bodies reach.
// A site is its own text (anchor, unique inside the owner's source in the page under test) and the statement in it that
// is armed (at). when: a local the breakpoint's condition reads in the paused frame, for code shared with a path that is
// not idle work (the board's build slices run per frame for an arrival, in idle time only for the warm build).
// Not sites, because a held drag legitimately runs them on another path: Usage's tierPass, buildLater and lateHeld (room
// build timers, the resize pass), the hover census's bind/prepare (hover and title changes), Glass's lensFilterFor (a lens
// shown at a new size), and the covers' paint() on a pick (no pick happens in this check).
const WORK = {
	theme: [
		{ key: 'paintSoon idle body', anchor: 'painting = false;\n      if (!document.body) return;', at: 'painting' },
		{ key: 'warm-second idle body', anchor: "whenIdle(() => { if (phase === 'idle') warm(second); });", at: 'if (phase' },
		{ key: 'paint()', anchor: 'const v = veilFor(mode);\n    try {', at: 'const v' },
		{ key: 'warm() past its guard', anchor: 'v.__warm = v.__key;', at: 'v.__warm' }
	],
	usage: [
		{ key: 'lateNext idle body', anchor: 'function lateNext(fn) { idleStill(function () { fn(); }', at: 'fn(); }' },
		{ key: 'late bodies job', anchor: 'lateNext(function () { lateHeld && lateHeld(false); })', at: 'lateHeld &&' },
		{ key: 'late room bodies job', anchor: 'lateNext(function () { buildLater(false); })', at: 'buildLater(false); }' },
		{ key: 'warm build slice', anchor: 'function slice(deadline) {\n        if (token !== buildToken) return;', at: 'if (token', when: 'warm' },
		{ key: 'prewarm()', anchor: 'function prewarm() {\n      var key = prewarmKey();', at: 'var key' },
		{ key: 'holdPass past its drag guard', anchor: 'if (FILM && FILM.warming && FILM.warming()) return;   /* a warm board holds at its arrival (holdSoon) */', at: 'if (FILM' },
		{ key: 'holdPass idle step', anchor: 'var step = function () {\n        if (dead || current.room !== room) { wait.cancel(); return; }', at: 'if (dead' }
	],
	census: [
		{ key: 'census idle body', anchor: 'token.h=B.idle(function(deadline){token.h=null;censusRun(token,deadline);}', at: 'token.h=null;' },
		{ key: 'censusRun past its drag guard', anchor: 'censusDeadline=deadline||null;try{token.fn();}', at: 'censusDeadline' },
		{ key: 'beginScan', anchor: 'this.ensureRoot();this.syncVisualSetting();this.preparedByElement=new WeakMap();\n    this.scanStartedAt', at: 'this.ensureRoot' },
		{ key: 'processScanBatch', anchor: 'HoverTagController.prototype.processScanBatch=function(){\n    if(!this.scanning)return;', at: 'if(!this.scanning)' },
		{ key: 'beginLive', anchor: 'HoverTagController.prototype.beginLive=function(){\n    var self=this;', at: 'var self' },
		{ key: 'processLiveBatch', anchor: 'HoverTagController.prototype.processLiveBatch=function(){\n    if(!this.liveRunning)return;', at: 'if(!this.liveRunning)' }
	],
	glass: [
		{ key: 'prewarm idle body', anchor: 'var run = function () {\n      prewarmIdle = 0; var q = Array.from(prewarmQ); prewarmQ.clear();', at: 'prewarmIdle = 0' },
		{ key: 'prewarm()', anchor: 'function prewarm(L, cfg, strip) {\n    if (!gpu() || !isGlass() || cfg.under) return;', at: 'if (!gpu()' }
	]
};
// owners whose work makes writes nothing else makes in this check (the effect witness's classifier is in RECORDER)
const EFFECTS = { theme: 'cover writes (data-ready, data-warm set, data-fx, style, a cover made)', usage: 'first-drag pre-warm host made' };

async function pageText(t) {
	const url = t.cfg.pageUrl;
	return /^https?:/i.test(url) ? await (await fetch(url)).text() : fs.readFileSync(fileURLToPath(new URL(url)), 'utf8');
}

// Line ranges (1-based, as a stack prints them) of each owner's source in the page under test, and its work sites (0-based
// line and column in the page document, as DevTools addresses an inline script)
async function regionsOf(t) {
	const src = await pageText(t);
	const nl = []; for (let k = src.indexOf('\n'); k !== -1; k = src.indexOf('\n', k + 1)) nl.push(k);
	const line0 = (i) => { let lo = 0, hi = nl.length; while (lo < hi) { const m = (lo + hi) >> 1; if (nl[m] < i) lo = m + 1; else hi = m; } return lo; };
	const lineAt = (i) => line0(i) + 1;
	const colAt = (i) => { const l = line0(i); return i - (l ? nl[l - 1] + 1 : 0); };
	const span = (marker) => {
		const i = src.indexOf(marker);
		if (i < 0 || src.indexOf(marker, i + 1) >= 0) return null;   // missing or ambiguous: the owner can't be told apart
		const after = i + marker.length;
		const ends = [src.indexOf('\n/* ---- ', after), src.indexOf('</script>', after)].filter((k) => k >= 0);
		return [i, Math.min(...ends)];
	};
	const region = (marker) => { const s = span(marker); return s && [lineAt(s[0]), lineAt(s[1])]; };
	const owners = OWNERS.map((o) => ({ key: o.key, fn: o.fn || null, r: region(o.start) }));
	const sites = [];
	for (const o of OWNERS) {
		const s = span(o.start), text = s ? src.slice(s[0], s[1]) : '';
		for (const w of WORK[o.key]) {
			const n = s ? text.split(w.anchor).length - 1 : 0, off = w.anchor.indexOf(w.at);
			const site = { owner: o.key, key: w.key, n, when: w.when || null };
			if (n === 1) {
				const at = s[0] + text.indexOf(w.anchor) + off, eol = w.anchor.indexOf('\n', off);
				Object.assign(site, { line: line0(at), col: colAt(at), colEnd: colAt(at) + (eol < 0 ? w.anchor.length : eol) - off });
			}
			sites.push(site);
		}
	}
	// the app document's scripts, whatever cache-buster or query a load adds
	const base = t.cfg.pageUrl.replace(/[?#].*$/, '');
	const urlRegex = '^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:[?#].*)?$';
	return { owners, admission: region(ADMISSION), sites, urlRegex };
}

// The source witness for one load: a DevTools session on the frame the app runs in (the sandbox iframe is its own target
// when the browser isolates it; otherwise the page's), with one never-pausing breakpoint per work site
const probeCondition = (s) => `${s.when ? `(typeof ${s.when}==='undefined'||!!${s.when})&&` : ''}!!globalThis.__pmIdleWork&&globalThis.__pmIdleWork.hit(${JSON.stringify(s.owner)},${JSON.stringify(s.key)})`;
const armedAt = (a) => a.locations.length > 0 && a.locations.every((l) => l.lineNumber === a.line && l.columnNumber >= a.col && l.columnNumber <= a.colEnd);
// A script compiled after arming (an eval, a Function, an injected script) is searched for the work sites' own text before
// it first runs, and every copy found is armed the same way: an owner's function copied at run time (eval of its source,
// which keeps its scope) is still the owner's code. The kit's own evaluations are let through unsearched.
const OWN_SCRIPT = /^(?:__playwright|__puppeteer|pptr:)/;
async function armCopies(session, probe, scriptId) {
	const { scriptSource: text } = await session.send('Debugger.getScriptSource', { scriptId });
	const nl = []; for (let k = text.indexOf('\n'); k !== -1; k = text.indexOf('\n', k + 1)) nl.push(k);
	const pos = (i) => { let l = 0; while (l < nl.length && nl[l] < i) l++; return { line: l, col: i - (l ? nl[l - 1] + 1 : 0) }; };
	for (const o of OWNERS) for (const w of WORK[o.key]) {
		for (let i = text.indexOf(w.anchor); i >= 0; i = text.indexOf(w.anchor, i + 1)) {
			const p = pos(i + w.anchor.indexOf(w.at)), s = { owner: o.key, key: w.key + ' (run-time copy)', when: w.when || null };
			const r = await session.send('Debugger.setBreakpoint', { location: { scriptId, lineNumber: p.line, columnNumber: p.col }, condition: probeCondition(s) }).catch((e) => ({ error: String(e.message || e) }));
			probe.copies.push({ ...s, scriptId, armed: !r.error });
		}
	}
}
async function armWork(t, f, map) {
	let session, scope = 'frame';
	try { session = await t.page.context().newCDPSession(f); } catch (_) { session = await t.page.context().newCDPSession(t.page); scope = 'page'; }
	const probe = { session, scope, paused: [], armed: [], copies: [], searched: 0, kinds: {}, skipped: 0 };
	const scripts = new Map(), known = new Set(), clean = new Set(), page = new RegExp(map.urlRegex);
	// the page document's own inline scripts are armed by URL, line and column; a script with the page's URL that starts at
	// 0:0 was put in later (an injected script element), so it is searched like an eval. Scripts in another world than the
	// page's (the kit's isolated world) can't run the page's code, and a text already searched and found clean (Playwright
	// compiles the same drag helpers on every held mouse move) is not searched again: those go on at once.
	session.on('Debugger.scriptParsed', (e) => scripts.set(e.scriptId, { url: e.url || '', hash: e.hash || '', doc: page.test(e.url || '') && (e.startLine > 0 || e.startColumn > 0), world: !(e.executionContextAuxData && e.executionContextAuxData.isDefault === false) }));
	const needs = (s) => !!s && !s.doc && s.world && !OWN_SCRIPT.test(s.url) && !(s.hash && clean.has(s.hash));
	const search = async (id) => {
		const s = scripts.get(id) || { url: '', hash: '', doc: false, world: true };
		if (!needs(s)) { probe.skipped++; return; }
		const kind = s.url ? (page.test(s.url) ? 'the page URL, put in later' : s.url.slice(0, 60)) : 'no URL (eval, Function)';
		probe.kinds[kind] = (probe.kinds[kind] || 0) + 1; probe.searched++;
		const before = probe.copies.length;
		await armCopies(session, probe, id).catch(() => { probe.copies.push({ scriptId: id, armed: false }); });
		if (probe.copies.length === before && s.hash) clean.add(s.hash);
	};
	// a condition never pauses. The one pause these probes ask for is before a new script runs (to search it); should
	// anything else pause the page while they are on, it goes on at once and is reported
	session.on('Debugger.paused', async (ev) => {
		const id = ev.reason === 'instrumentation' && ev.data && ev.data.scriptId;
		if (!id) probe.paused.push(ev.reason);
		else if (!known.has(id)) { known.add(id); await search(id); }
		session.send('Debugger.resume').catch(() => {});
	});
	await session.send('Debugger.enable');
	// scripts compiled before these probes armed (a copy made while the page booted) are searched now
	for (const id of [...scripts.keys()]) { known.add(id); await search(id); }
	for (const s of map.sites) {
		if (s.n !== 1) { probe.armed.push({ ...s, locations: [] }); continue; }
		const r = await session.send('Debugger.setBreakpointByUrl', { urlRegex: map.urlRegex, lineNumber: s.line, columnNumber: s.col, condition: probeCondition(s) }).catch((e) => ({ locations: [], error: String(e.message || e) }));
		probe.armed.push({ ...s, locations: r.locations || [], error: r.error || null });
	}
	await session.send('Debugger.setInstrumentationBreakpoint', { instrumentation: 'beforeScriptExecution' });
	return probe;
}

// installed before the page's own scripts, in every frame (the sandbox's too)
const RECORDER = (cfg) => {
	if (window.__pmIdleRec) return;
	try { localStorage.clear(); } catch (_) { /* opaque surface */ }
	const R = window.__pmIdleRec = { fired: [], jobs: [], bodies: [], gated: true, hooked: false };
	const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
	const inDrag = () => document.body && DRAG.some(c => document.body.classList.contains(c));
	const ric = window.requestIdleCallback, cic = window.cancelIdleCallback, st = window.setTimeout;
	const stackOf = () => { const n = Error.stackTraceLimit; Error.stackTraceLimit = 30; const s = new Error().stack || ''; Error.stackTraceLimit = n; return s; };
	const frames = (s) => s.split('\n').slice(1).map((l) => { const m = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?\s*$/.exec(l); return m ? { fn: m[1] || '', url: m[2], line: +m[3] } : null; }).filter((f) => f && f.url !== '<anonymous>');
	// The work witnesses' recorder, sealed before any page script runs: the page can neither replace nor read through it, and
	// the clock and drag test it uses are the platform's own, taken now
	const now = performance.now.bind(performance), has = DOMTokenList.prototype.contains;
	const bodyOf = Object.getOwnPropertyDescriptor(Document.prototype, 'body').get, classesOf = Object.getOwnPropertyDescriptor(Element.prototype, 'classList').get;
	const held = () => { const b = bodyOf.call(document); if (!b) return false; const cl = classesOf.call(b); for (const c of DRAG) if (has.call(cl, c)) return true; return false; };
	const hits = [], effects = [];
	const where = () => frames(stackOf()).filter((f) => f.fn !== 'eval' && !/playwright|__puppeteer|pptr:/.test(f.url)).slice(0, 4).map((f) => `${f.fn || '(anonymous)'}:${f.line}`).join(' < ');
	Object.defineProperty(window, '__pmIdleWork', { configurable: false, enumerable: false, writable: false, value: Object.freeze({
		// a work site ran (from a breakpoint condition): which owner, which site, when, inside a drag or not, the native idle job
		// running at the time (0: none, another queue carried it) and, inside a drag, the first frames that got it there
		hit(owner, site) { try { const drag = held(); hits[hits.length] = { owner, site, at: now(), drag, job: R.job ? R.job.id : 0, from: drag ? where() : '' }; } catch (_) { /* never in the page's way */ } return false; },
		read() { return { hits: hits.map((h) => Object.assign({}, h)), effects: effects.map((e) => Object.assign({}, e)) }; }
	}) });
	// effect witness: delivered at the end of the task that wrote, so its time and drag state are that task's
	const fx = (owner, effect) => { effects[effects.length] = { owner, effect, at: now(), drag: held() }; };
	const isVeil = (n) => n && n.nodeType === 1 && has.call(classesOf.call(n), 'pm-look-veil');
	const veilStyle = new MutationObserver((rs) => { for (let k = 0; k < rs.length; k++) fx('theme', 'cover style'); });
	new MutationObserver((rs) => {
		for (const r of rs) {
			if (r.type === 'childList') {
				for (const n of r.addedNodes) {
					if (isVeil(n)) { fx('theme', 'cover made'); veilStyle.observe(n, { attributes: true, attributeFilter: ['style'] }); }
					else if (n.nodeType === 1 && n.hasAttribute('data-pmu-prewarm')) fx('usage', 'pre-warm host made');
				}
			} else if (isVeil(r.target)) {
				// data-warm going away ends a warm that began earlier; only its start is the work
				if (r.attributeName === 'data-warm' && r.oldValue !== null) continue;
				fx('theme', 'cover ' + r.attributeName);
			}
		}
	}).observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-ready', 'data-warm', 'data-fx'] });
	const inR = (r, line) => !!r && line >= r[0] && line <= r[1];
	const admitting = (f) => inR(cfg.admission, f.line) && /(?:^|\.)(?:ask|idleWhenStill)$/.test(f.fn.replace(/ \[as \w+\]$/, ''));
	// the owner of a request: the first page frame that asked, past the shared admission's own frames
	const ownerOf = (s) => {
		const fs = frames(s), asker = fs.find((f) => !admitting(f));
		if (asker && /(?:^|\.)(?:opSync|opLater|opFlags|setOpFlags)$/.test(asker.fn)) return 'drag';   // the drag's own bookkeeping
		if (asker) for (const o of cfg.owners) if (inR(o.r, asker.line) && (!o.fn || new RegExp(o.fn).test(asker.fn.replace(/ \[as \w+\]$/, '')))) return o.key;
		return fs.some(admitting) ? 'busy' : null;
	};
	R.ownerOf = ownerOf;
	const identities = new WeakMap(), pending = new Map(); let seq = 0, handle = 1000000000;
	const note = (kind, owner, stack, t0, drag, id) => R.fired.push({ kind, owner, stack, at: t0, ms: performance.now() - t0, drag, id });
	// Ownership follows the admission token even through another queue or another owner's native job.
	// Keep native job identity separately: only the matching original delivery proves resumption.
	const tokenOwners = new Map();
	const entered = (token) => R.bodies.push({ job: R.job ? R.job.id : 0, owner: token ? tokenOwners.get(token) : (R.job ? R.job.owner : null), token, at: performance.now(), drag: inDrag() });
	const ask = j => { j.native = ric.call(window, dl => {
		pending.delete(j.handle); j.pending = false;
		const at = performance.now(), drag = inDrag();
		const was = R.running, wasJob = R.job; R.running = j.owner; R.job = j;
		try { if (!j.via) entered(0); return j.fn(dl); } finally { R.running = was; R.job = wasJob; note('idle', j.owner, j.stack, at, drag, j.id); }
	}, j.options); };
	// PM_BUSY.idle: wrap the owner's function to witness its entry (the scheduler's handling is untouched), and, for a
	// selftest, drop one owner's real requests there, picked by the owner's own function names (plain text, not the
	// classifier above), as the review's Glass omission did
	const omitHit = { usage: (s) => /\bat idleStill\b/.test(s), theme: (s) => /\bat whenIdle\b/.test(s), census: (s) => /\bat censusSchedule\b/.test(s),
		glass: (s) => s.includes('prewarmSoon') && s.includes('syncStripNow') }[cfg.omit] || null;
	if (omitHit) window.__pmIdleOmit = { key: cfg.omit, count: 0 };
	let tokens = 0, busy;
	Object.defineProperty(window, 'PM_BUSY', { configurable: true, enumerable: true, get() { return busy; }, set(value) {
		busy = value;
		if (!value || (typeof value !== 'function' && typeof value !== 'object')) return;
		let idle;
		Object.defineProperty(value, 'idle', { configurable: true, enumerable: true, get() { return idle; }, set(real) {
			if (typeof real !== 'function') { idle = real; return; }
			R.hooked = true;
			idle = function (fn, ...rest) {
				if (omitHit && omitHit(new Error().stack || '')) { window.__pmIdleOmit.count++; return { cancel() {} }; }
				if (typeof fn !== 'function') return real.call(this, fn, ...rest);
				const token = ++tokens;
				// Unlisted callers still belong to the shared admission's existing extra-work bucket.
				tokenOwners.set(token, ownerOf(stackOf()) || 'busy');
				const body = function (...a) { entered(token); return fn.apply(this, a); };
				const was = R.admitting; R.admitting = token;
				try { return real.call(this, body, ...rest); } finally { R.admitting = was; }
			};
		} });
	} });
	// Delay delivery only, never execute the callback ourselves. Cancellation is honoured, and a scheduler re-admission
	// keeps the function's original identity (and owner).
	if (ric) {
		window.requestIdleCallback = function (fn, options) {
			const stack = stackOf();
			let identity = identities.get(fn);
			if (!identity) {
				const owner = ownerOf(stack); if (!owner || owner === 'drag') return ric.call(window, fn, options);
				// via: asked by the shared admission, so the native callback is its wrapper and the owner's entry is witnessed
				// inside it; token: the PM_BUSY.idle request it was first asked under (0 for a re-admission of a job parked
				// before it ever reached requestIdleCallback)
				identity = { id: ++seq, stack, owner, via: !!R.admitting || frames(stack).some(admitting), token: R.admitting || 0 };
				identities.set(fn, identity);
			}
			const j = { id: identity.id, owner: identity.owner, via: identity.via, token: identity.token, handle: ++handle, fn, options, stack: identity.stack, pending: true, native: 0 };
			R.jobs.push(j); pending.set(j.handle, j);
			if (!R.gated) ask(j);
			return j.handle;
		};
		window.cancelIdleCallback = function (id) {
			const j = pending.get(id); if (!j) return cic.call(window, id);
			if (j.native) cic.call(window, j.native);
			// who took it back: the scheduler for a drag (inside one), or the owner itself (outside any drag)
			j.pending = false; j.cancelled = true; j.cancelDrag = inDrag(); j.cancelAt = performance.now(); pending.delete(id);
		};
	}
	R.release = () => { R.gated = false; for (const j of pending.values()) if (!j.native) ask(j);
		// Independent native deadline proves this hold actually offered idle delivery.
		ric.call(window, () => { R.opportunity = { at: performance.now(), drag: inDrag() }; }, { timeout: 500 });
	};
	R.pending = () => R.jobs.filter(j => j.pending).map(({ id, handle, owner, stack, via, token }) => ({ id, handle, owner, stack, via, token }));
	// jobs an owner withdrew itself, outside any drag (a census torn down, a scan superseded): not the drag's doing
	R.withdrawn = (handles) => R.jobs.filter((j) => handles.includes(j.handle) && j.cancelled && !j.cancelDrag).map((j) => j.handle);
	// a timer set by an owner's idle callback carries that idle work on: it belongs to the owner (the drag's own
	// responses to the moving divider, a width change for one, are not idle work and are not judged here)
	window.setTimeout = function (fn, ms, ...a) {
		if (typeof fn !== 'function' || !R.running) return st.call(window, fn, ms, ...a);
		const stack = stackOf(), owner = R.running;
		return st.call(window, function () { const t0 = performance.now(), drag = inDrag(), was = R.running; R.running = owner; try { return fn.apply(this, a); } finally { R.running = was; if (drag) note('timeout', owner, stack, t0, drag); } }, ms);
	};
};

// the first page frames that asked, past the recorder's and the admission's own: "name:line" (line in the built page)
const top = (stack) => stack.split('\n').slice(1).map((l) => /^\s*at (?:(.+?) \()?(.+?):(\d+):\d+\)?\s*$/.exec(l)).filter((m) => m && m[2] !== '<anonymous>' && !/(?:^|\.)(?:ask|idleWhenStill)(?: \[as \w+\])?$/.test(m[1] || '')).slice(0, 3).map((m) => `${m[1] || '(anonymous)'}:${m[3]}`).join(' < ');
const brief = (jobs) => JSON.stringify(jobs.map((j) => ({ id: j.id, owner: j.owner, at: top(j.stack) })));

async function holdDrag(t, f, sel, label, keys) {
	// where the divider is now, and what a press there would land on
	const measure = () => f.evaluate((s) => {
		const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none'; };
		const e = s.split('|').map((q) => [...document.querySelectorAll(q)].find(vis)).find(Boolean);
		if (!e) return null;
		const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, hit = document.elementFromPoint(x, y);
		return { x, y, w: r.width, h: r.height, id: e.id || e.className, hit: hit && e.contains(hit) ? 'the divider' : hit ? (hit.id ? '#' + hit.id : hit.tagName.toLowerCase() + '.' + String(hit.className).split(' ').join('.')) : 'nothing' };
	}, sel);
	let box = await measure();
	if (!(await t.check(`${label}: a divider to hold`, !!box, sel))) return null;
	// The witness is what is pending at the press itself: an owner may withdraw and re-ask its own job during setup, so
	// wait (bounded) until every owner of this look has one queued, then press at once. The divider can move while the
	// Usage board and chat column settle (a press at its first place once landed on chat text), so it is measured again
	// and hovered where it is now, and the press waits for it to hold still there.
	const full = (p) => keys.every((k) => p.some((j) => j.owner === k));
	let queued = [];
	for (let tries = 0; tries < 4; tries++) {
		await t.page.mouse.move(box.x, box.y); await t.page.waitForTimeout(120);
		queued = await f.evaluate(() => window.__pmIdleRec.pending());
		const now = await measure();
		const still = !!now && Math.abs(now.x - box.x) < 1 && Math.abs(now.y - box.y) < 1;
		if (now && !still) t.log(`${label}: the divider moved from ${Math.round(box.x)},${Math.round(box.y)} to ${Math.round(now.x)},${Math.round(now.y)} before the press`);
		if (now) box = now;
		if (still && full(queued)) break;
		if (!full(queued)) await f.waitForFunction((ks) => { const p = window.__pmIdleRec.pending(); return ks.every((k) => p.some((j) => j.owner === k)); }, keys, { timeout: 5000 }).catch(() => {});
	}
	t.log(`${label}: holding ${box.id} at ${Math.round(box.x)},${Math.round(box.y)} (${Math.round(box.w)}x${Math.round(box.h)})`);
	if (!(await t.check(`${label}: the press lands on the divider`, box.hit === 'the divider', `under the pointer: ${box.hit}`))) return null;
	const axisX = box.h >= box.w;   // a tall bar moves sideways
	const at = (d) => (axisX ? [box.x + d, box.y] : [box.x, box.y + d]);
	const pressAt = await f.evaluate(() => performance.now());   // the work witnesses judge the whole gesture, press to release
	await t.page.mouse.down();
	for (let i = 1; i <= 8; i++) { await t.page.mouse.move(...at(-i * 4)); await t.page.waitForTimeout(16); }
	const began = await f.evaluate(() => performance.now());
	const dragOn = await f.evaluate(() => !!(window.PM_BUSY && PM_BUSY.drag && PM_BUSY.drag()) || document.body.classList.contains('pm-resizing'));
	await t.check(`${label}: the drag class is on while held`, dragOn, 'body classes ' + (await f.evaluate(() => document.body.className)));
	await f.evaluate(() => window.__pmIdleRec.release());
	await t.mark(label + ' held');
	// held: the hand rests on the bar, with the small moves a held hand makes
	for (let k = 0; k < HOLD_MS / 100; k++) { await t.page.mouse.move(...at(-32 + (k % 2 ? 1 : -1))); await t.page.waitForTimeout(100); }
	const ended = await f.evaluate(() => performance.now());
	const remained = await t.check(`${label}: drag remains held`, await f.evaluate(() => !!(window.PM_BUSY && PM_BUSY.drag && PM_BUSY.drag())), 'the whole measurement must be a held drag');
	const offered = await t.check(`${label}: native idle delivery was eligible during hold`, await f.evaluate(() => !!window.__pmIdleRec.opportunity?.drag), 'independent native deadline inside the real held gesture');
	await t.mark(label + ' released');
	await t.page.mouse.up();
	const releasedAt = await f.evaluate(() => performance.now());
	return { began, ended, pressAt, releasedAt, queued, held: !!(dragOn && remained && offered) };
}

// The work witnesses, for one hold. Inside: anything during the whole held gesture (press to release) with the drag on as
// it ran, and anything at all between the held drag's first and last measured moments (the drag is on throughout there,
// so the drag test can't be dodged by taking the class off for a moment). That contains the dispatch judge's window.
const inHold = (win) => (h) => (h.drag && h.at >= win.pressAt && h.at <= win.releasedAt) || (h.at >= win.began && h.at <= win.ended);
const whereFrom = (hs) => [...new Set(hs.map((h) => `${h.site} (${h.job ? 'native idle job ' + h.job : 'no native idle job'}${h.from ? '; ' + h.from : ''})`))].slice(0, 4).join(' | ');
async function witnessWork(t, f, label, win, probe) {
	const { hits, effects } = await f.evaluate(() => window.__pmIdleWork.read());
	const inside = inHold(win);
	const summary = OWNERS.map((o) => { const mine = hits.filter((h) => h.owner === o.key); return `${o.key} ${mine.filter((h) => h.at < win.pressAt).length}/${mine.filter(inside).length}/${mine.filter((h) => h.at > win.releasedAt).length}`; }).join(', ');
	t.log(`${label}: work site hits before / inside / after the hold so far: ${summary}; effects inside ${effects.filter(inside).length}`);
	for (const o of OWNERS) {
		const mine = hits.filter((h) => h.owner === o.key && inside(h));
		await t.check(`${label}: no ${o.name} work executed inside the drag (source witness)`, mine.length === 0, mine.length ? `${mine.length} work site hits: ${whereFrom(mine)}` : `0 hits at ${probe.armed.filter((a) => a.owner === o.key).length} sites`);
		if (!EFFECTS[o.key]) continue;
		const wrote = effects.filter((e) => e.owner === o.key && inside(e));
		await t.check(`${label}: no ${o.name} work effect inside the drag (effect witness)`, wrote.length === 0, wrote.length ? `${wrote.length}: ${[...new Set(wrote.map((e) => e.effect))].join(', ')}` : '0');
	}
}

async function judge(t, f, label, win, owners) {
	const rec = await f.evaluate(([a, b]) => window.__pmIdleRec.fired.filter((c) => c.at >= a && c.at <= b + 50), [win.began, win.ended]);
	const inside = rec.filter((c) => c.drag);
	const byOwner = {};
	for (const c of inside) { const o = c.owner || 'other'; (byOwner[o] = byOwner[o] || []).push(c); }
	const listed = Object.entries(byOwner).map(([o, cs]) => `${nameOf(o)}: ${cs.filter((c) => c.kind === 'idle').length} idle, ${cs.filter((c) => c.kind === 'timeout').length} timer, ${cs.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms (${[...new Set(cs.map((c) => top(c.stack)))].slice(0, 3).join(' | ')})`).join('; ');
	t.log(`${label}: ${inside.length} callbacks inside the ${Math.round(win.ended - win.began)} ms hold. ${listed || 'none'}`);
	for (const o of [...owners, EXTRA]) {
		const idle = (byOwner[o.key] || []).filter((c) => c.kind === 'idle');
		await t.check(`${label}: no idle callback from ${o.name} inside the drag`, idle.length === 0, idle.length ? `${idle.length} callbacks (jobs ${[...new Set(idle.map((c) => c.id))].join(', ')}), ${idle.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms; first requested at ${top(idle[0].stack)}` : '0');
	}
	// the owners' own callbacks: none entered inside the drag (whatever native callback carried them)
	const bodies = await f.evaluate(([a, b]) => window.__pmIdleRec.bodies.filter((c) => c.drag && c.at >= a && c.at <= b + 50), [win.began, win.ended]);
	for (const o of [...owners, EXTRA]) {
		const mine = bodies.filter((c) => c.owner === o.key);
		await t.check(`${label}: no ${o.name} callback body entered inside the drag`, mine.length === 0, mine.length ? `${mine.length} entries (jobs ${[...new Set(mine.map((c) => c.job))].join(', ')})` : '0');
	}
	// a timer an owner's idle work set may fire in a drag (a delay that ends there), but it starts nothing there
	const timers = [...owners, EXTRA].flatMap((o) => (byOwner[o.key] || []).filter((c) => c.kind === 'timeout' && c.ms > 2));
	await t.check(`${label}: no timer of those owners does work inside the drag`, timers.length === 0, timers.map((c) => `${nameOf(c.owner)} ${c.ms.toFixed(1)} ms at ${top(c.stack)}`).join('; ') || '0');
}

export const tests = {
	async 'idle work waits out a held drag (SW-17)'(t) {
		const looks = String(t.args.looks || 'glass-dark,basic-dark').split(',');
		// holds per look: a positive integer, or nothing is exercised (repeats=0 once ran no hold and passed)
		const repeats = t.args.repeats === undefined ? 1 : Number(String(t.args.repeats).trim() === '' ? NaN : t.args.repeats);
		if (!(await t.check('repeats is a positive whole number of holds per look', Number.isInteger(repeats) && repeats >= 1, `repeats=${JSON.stringify(t.args.repeats)}`))) return;
		const selftest = String(t.args.selftest || '');
		const omit = /^omit-(usage|theme|census|glass)$/.exec(selftest)?.[1] || null;
		const mutation = mutations[selftest];
		if (selftest && !(await t.check(`selftest ${selftest} is known`, !!omit || !!mutation, 'omit-usage | omit-theme | omit-census | omit-glass | ' + Object.keys(mutations).join(' | ')))) return;
		// Source mutations are private build fixtures generated by the selftest helper; never product edits.
		if (mutation) {
			const url = t.cfg.pageUrl;
			const src = /^https?:/i.test(url) ? await (await fetch(url)).text() : fs.readFileSync(fileURLToPath(new URL(url)), 'utf8');
			if (!(await t.check(`selftest ${selftest}: mutated fixture loaded`, src.includes(`<!-- idle-drag-selftest:${selftest} -->`), 'generate with helpers/idle-drag-negatives.mjs'))) return;
		}
		// Glass prewarm is queued only in a Glass look: a run without one leaves that owner unexercised
		await t.check('a Glass look is in this run (Glass prewarm owner)', looks.some((l) => /^glass-/.test(l)), `looks ${looks.join(',')}`);
		const map = await regionsOf(t);
		for (const o of OWNERS) await t.check(`${o.name}: its source is found once in the page`, !!map.owners.find((m) => m.key === o.key).r, `marker ${o.start}`);
		await t.check('shared admission (11-motion-start.js) source is found once in the page', !!map.admission, ADMISSION);
		t.log('owner source lines ' + JSON.stringify(Object.fromEntries(map.owners.map((m) => [m.key, m.r]))) + ' admission ' + JSON.stringify(map.admission));
		for (const o of OWNERS) {
			const lost = map.sites.filter((s) => s.owner === o.key && s.n !== 1);
			await t.check(`${o.name}: each work site is found once in its source`, lost.length === 0, lost.length ? lost.map((s) => `${s.key}: ${s.n} times`).join('; ') : map.sites.filter((s) => s.owner === o.key).map((s) => `${s.key} ${s.line + 1}:${s.col + 1}`).join('; '));
		}
		const cdp = await t.page.context().newCDPSession(t.page);
		await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		await t.page.addInitScript(RECORDER, { ...map, omit });
		if (!t.args.film) await t.viewport(Number(t.args.width || 1390), Number(t.args.height || 900));
		const holds = Object.fromEntries(looks.map((l) => [l, 0]));
		for (let repeat = 0; repeat < repeats; repeat++) {
		for (const look of looks) {
		const owners = needed(look);
		const f = await t.app.open({ settleMs: 200 });
		await t.check('recorder installed in the app frame', await f.evaluate(() => !!window.__pmIdleRec), '');
		await t.check('owner callback witness installed on PM_BUSY.idle in the app frame', await f.evaluate(() => !!(window.__pmIdleRec && window.__pmIdleRec.hooked && window.PM_BUSY && typeof PM_BUSY.idle === 'function')), '');
		await t.check('work recorder sealed in the app frame', await f.evaluate(() => { const d = Object.getOwnPropertyDescriptor(window, '__pmIdleWork'); return !!d && !d.configurable && !d.writable && Object.isFrozen(d.value); }), '');
		const probe = await armWork(t, f, map);
		for (const o of OWNERS) {
			const mine = probe.armed.filter((a) => a.owner === o.key), off = mine.filter((a) => !armedAt(a));
			await t.check(`${look}: ${o.name}: every work site armed in the app frame`, mine.length > 0 && off.length === 0, off.length ? off.map((a) => `${a.key}: ${a.error || JSON.stringify(a.locations)} (wanted ${a.line}:${a.col}-${a.colEnd})`).join('; ') : `${mine.length} sites, ${probe.scope} session`);
		}
		await t.app.resetLayout();
		await t.app.look(look);
		// Keep real boot jobs queued even on fast hosts. Usage starts its own warm slices; no synthetic owner callback or
		// artificial body drag class is used.
		await f.locator('.page-tab[data-page="usage"]').click();
		await f.waitForFunction(() => !document.documentElement.hasAttribute('data-pm-page-transition'), null, { timeout: 20000 });
		await t.page.waitForTimeout(Number(t.args.setupDelay ?? 1500));
		// Ask through the owners' own entry points: a previous Usage visit in this context may legitimately have finished
		// its initial scan, and GPU discovery may skip opportunistic boot prewarming on a loaded host.
		await f.evaluate(() => {
			PMU.board.mount(PMU.board.state.room, { warm: true });
			window.PM_HOVER_TAG_CONTROLLER.scheduleScan(document.querySelector('#panel-usage'));
		});
		const keys = owners.map((o) => o.key);
		await f.waitForFunction((ks) => { const p = window.__pmIdleRec.pending(); return ks.every((k) => p.some((j) => j.owner === k)); }, keys, { timeout: 15000 }).catch(() => {});
		if (omit && owners.some((o) => o.key === omit)) {   // only where that owner queues work (Glass: a Glass look)
			const n = await f.evaluate(() => window.__pmIdleOmit?.count || 0);
			t.log(`SELFTEST ${look}: ${n} real ${nameOf(omit)} requests suppressed at the shared admission`);
			await t.check(`selftest ${look}: the ${nameOf(omit)} omission actually suppressed real requests`, n > 0, String(n));
		}
		const usage = await holdDrag(t, f, '#leftPanelResizer|#chatResizer', `${look} Usage`, keys);
		if (usage && usage.held) holds[look]++;
		if (usage) {
			// an owner's own withdrawal outside the drag (after the press snapshot, before the drag class) is not judged;
			// every owner still needs at least one witnessed job the drag itself had to hold back
			const gone = await f.evaluate((hs) => window.__pmIdleRec.withdrawn(hs), usage.queued.map((j) => j.handle));
			if (gone.length) t.log(`${look}: withdrawn by their owners outside the drag: ${brief(usage.queued.filter((j) => gone.includes(j.handle)))}`);
			usage.queued = usage.queued.filter((j) => !gone.includes(j.handle));
			for (const o of owners) {
				const mine = usage.queued.filter((j) => j.owner === o.key);
				await t.check(`${look}: ${o.name} has a real idle job pending at the press`, mine.length > 0, mine.length ? brief(mine) : `none; pending ${brief(usage.queued)}`);
			}
			await judge(t, f, `${look} Usage`, usage, owners);
			await witnessWork(t, f, `${look} Usage`, usage, probe);
			if (dispatching.has(selftest)) {
				const sent = await f.evaluate((w) => (window.__reviewDispatch || []).concat(window.__reviewLeaks || []).filter((e) => e.drag && e.at >= w.pressAt && e.at <= w.releasedAt).map((e) => e.path || 'park/timer'), usage);
				t.log(`SELFTEST ${look}: the mutation dispatched owner work inside the held drag through ${sent.join(', ') || 'nothing'}`);
				await t.check(`selftest ${selftest} ${look}: the mutated path dispatched owner work inside the held drag`, sent.length > 0, sent.join(', ') || '0');
			}
			await t.page.waitForTimeout(6000);
			const { fired, bodies } = await f.evaluate(() => ({ fired: window.__pmIdleRec.fired, bodies: window.__pmIdleRec.bodies }));
			const during = (j) => fired.filter((c) => c.id === j.id && c.at >= usage.began && c.at <= usage.ended + 50);
			const after = (j) => fired.some((c) => c.id === j.id && !c.drag && c.at > usage.ended);
			// the owner's own callback entered inside this job's native delivery after release (and, when the job's first
			// request was witnessed, it is the function that request wrapped)
			const work = (j) => bodies.some((b) => b.job === j.id && !b.drag && b.at > usage.ended && (!j.token || b.token === j.token));
			for (const o of owners) {
				const mine = usage.queued.filter((j) => j.owner === o.key);
				const ran = mine.filter((j) => during(j).length);
				await t.check(`${look}: ${o.name}'s pending jobs are withheld through the hold`, mine.length > 0 && ran.length === 0, mine.length ? (ran.length ? `ran inside: ${brief(ran)}` : `${mine.length} withheld`) : 'no pending job to withhold');
				const lost = mine.filter((j) => !after(j));
				await t.check(`${look}: ${o.name}'s same pending jobs resume after release`, mine.length > 0 && lost.length === 0, mine.length ? (lost.length ? `never resumed: ${brief(lost)}` : `${mine.length} resumed: ids ${mine.map((j) => j.id).join(', ')}`) : 'no pending job to resume');
				const idle = mine.filter((j) => !work(j));
				await t.check(`${look}: ${o.name}'s own callback runs for each resumed job`, mine.length > 0 && idle.length === 0, mine.length ? (idle.length ? `resumed without the owner's callback: ${brief(idle)}` : `${mine.length} ran: ids ${mine.map((j) => j.id).join(', ')}`) : 'no pending job to run');
			}
			for (const j of usage.queued.filter((q) => q.owner === EXTRA.key)) {
				await t.check(`${look}: job ${j.id} (${EXTRA.name}): same queued job resumes after release`, after(j), top(j.stack));
				await t.check(`${look}: job ${j.id} (${EXTRA.name}): its own callback runs after release`, work(j), top(j.stack));
			}
			// the work witnesses are live in this load: each required owner's deferred work is seen at its own sites after
			// release, and the covers' writes are seen outside the drag
			const { hits, effects } = await f.evaluate(() => window.__pmIdleWork.read());
			const inside = inHold(usage);
			for (const o of owners) {
				const later = hits.filter((h) => h.owner === o.key && !h.drag && h.at > usage.releasedAt);
				await t.check(`${look}: ${o.name} work runs after release (source witness live)`, later.length > 0, later.length ? `${later.length} hits: ${[...new Set(later.map((h) => h.site))].join(', ')}` : `no hit at ${probe.armed.filter((a) => a.owner === o.key).map((a) => a.key).join(', ')}`);
			}
			const covers = effects.filter((e) => e.owner === 'theme' && !inside(e));
			await t.check(`${look}: the effect witness sees the look covers' writes outside the drag`, covers.length > 0, covers.length ? `${covers.length}: ${[...new Set(covers.map((e) => e.effect))].join(', ')}` : '0');
		}
		t.log(`${look}: work probes: ${probe.armed.length} sites armed in the ${probe.scope} session; ${probe.searched} other scripts searched (${Object.entries(probe.kinds).map(([k, n]) => `${n} ${k}`).join(', ') || 'none'}), ${probe.skipped} let through (the kit's world, or a text already searched); ${probe.copies.length} run-time copies of work sites found (${[...new Set(probe.copies.map((c) => c.key))].join(', ') || 'none'})`);
		await t.check(`${look}: the work probes never paused the page`, probe.paused.length === 0, (probe.paused.join(', ') || '0') + `; ${probe.searched} other scripts searched, ${probe.copies.filter((c) => c.armed).length} run-time copies of work sites armed${probe.copies.some((c) => !c.armed) ? ', ' + probe.copies.filter((c) => !c.armed).length + ' NOT armed' : ''}`);
		await t.check(`${look}: every run-time copy of a work site is armed`, probe.copies.every((c) => c.armed), probe.copies.filter((c) => !c.armed).map((c) => c.key || 'script ' + c.scriptId).join('; ') || String(probe.copies.length));
		await probe.session.detach().catch(() => {});
		}
		}
		for (const look of looks) await t.check(`${look}: ${repeats} real held drag${repeats > 1 ? 's' : ''} completed`, holds[look] === repeats, `${holds[look]} of ${repeats}`);
		await cdp.detach();
	}
};
