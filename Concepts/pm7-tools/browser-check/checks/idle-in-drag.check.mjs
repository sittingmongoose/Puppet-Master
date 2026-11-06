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
// --set selftest=leak-usage|leak-theme|leak-census|leak-glass runs that owner's latest admitted callback once more during
// the hold through a timer, beside its parked job (astra-review-perf-3: owner work routed through another queue, which the
// scheduler's native job never sees), and the check must FAIL on that owner's callback body.
//
// --set selftest=leak-<owner>-early runs each of that owner's parked callbacks once through queueMicrotask at the moment
// the scheduler parks it for the drag (its cancelIdleCallback inside the drag, at the press); -early-promise runs it at
// the end of a three-step promise chain, -early-message through a MessageChannel. Each is capped at 6 parked jobs, and
// the check must FAIL on that owner's callback body (TOOLBATCH2 pre-check finding 1, T46).
// --set selftest=leak-<owner>-release runs, in a release handler that comes before the product's (a pointerup listener
// in the window's capture phase, installed before the page's scripts), 100 ms of release work and then up to 6 of that
// owner's parked callbacks, synchronously, while the drag class is still on; the check must FAIL on that owner's
// callback body (REVIEW-kit-t46-t47-opus finding 1, the release-work shape).
//
// Every callback body is attributed by the request it was admitted under, not by the native job running it (T39): the
// PM_BUSY.idle request binds its token to the owner that asked, there and then, so a body entered from any queue (a
// timer, a microtask, a message) is still that owner's. Every body entry inside the hold must have an owner; one
// without fails.
//
// The judged window is the product's own drag, read from its body class (T46, round 2): it opens at the press or when a
// drag class first goes on after the hold was armed, whichever is earlier (the time is taken before mouse.down()), and
// it closes when the drag class goes off after the release, never before the release (the release time is taken before
// mouse.up(), and the recorder's own observer of the body's class notes when it goes off). The product's drag and the
// scheduler's parking start at the press, and its release handler runs before the class comes off, so owner work there
// is inside the drag too. Every owner body and every fired callback that entered with the drag class on, in that
// window, is judged. (Round 1 closed the window at the end of the hand's hold plus 50 ms, read before mouse.up(): a
// release handler that ran parked owner work with the class still on passed, REVIEW-kit-t46-t47-opus finding 1.)
//
// A native idle callback is the scheduler's wrapper (PM_BUSY.idle's run), not the owner's work, so a resume is proven
// by the owner's own callback: each function an owner hands PM_BUSY.idle is wrapped, and its entry is recorded against
// the native job it ran inside. A resumed job whose owner callback never ran fails by owner. (A request made straight to
// requestIdleCallback, as owners did before PM_BUSY.idle, has the owner's function as its native callback.)
// --set repeats=N (a positive integer, default 1) is the number of holds per look, and the run must complete exactly
// that many real held drags.

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

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

// Line ranges (1-based, as a stack prints them) of each owner's source in the page under test
async function regionsOf(t) {
	const url = t.cfg.pageUrl;
	const src = /^https?:/i.test(url) ? await (await fetch(url)).text() : fs.readFileSync(fileURLToPath(new URL(url)), 'utf8');
	const lineAt = (i) => { let n = 1; for (let k = src.indexOf('\n'); k !== -1 && k < i; k = src.indexOf('\n', k + 1)) n++; return n; };
	const region = (marker) => {
		const i = src.indexOf(marker);
		if (i < 0 || src.indexOf(marker, i + 1) >= 0) return null;   // missing or ambiguous: the owner can't be told apart
		const after = i + marker.length;
		const ends = [src.indexOf('\n/* ---- ', after), src.indexOf('</script>', after)].filter((k) => k >= 0);
		return [lineAt(i), lineAt(Math.min(...ends))];
	};
	const owners = OWNERS.map((o) => ({ key: o.key, fn: o.fn || null, r: region(o.start) }));
	return { owners, admission: region(ADMISSION) };
}

// installed before the page's own scripts, in every frame (the sandbox's too)
const RECORDER = (cfg) => {
	if (window.__pmIdleRec) return;
	try { localStorage.clear(); } catch (_) { /* opaque surface */ }
	const R = window.__pmIdleRec = { fired: [], jobs: [], bodies: [], gated: true, hooked: false, armedAt: null, dragOnAt: null, offs: [], upAt: null, upDrag: null };
	const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
	const inDrag = () => document.body && DRAG.some(c => document.body.classList.contains(c));
	// T46: when a drag class first goes on after the hold is armed (the body's class, as the product's own observer reads
	// it); the judged window opens no later than this. Round 2: every time the drag classes go off after that (offs); the
	// window closes at the first one after the release (upAt, taken before mouse.up())
	R.arm = () => { R.armedAt = performance.now(); R.dragOnAt = inDrag() ? R.armedAt : null; R.offs = []; R.upAt = null; R.upDrag = null; R.wasDrag = inDrag(); return R.armedAt; };
	R.markUp = () => { R.upAt = performance.now(); R.upDrag = inDrag(); return { upAt: R.upAt, upDrag: R.upDrag }; };
	try {
		const seen = new MutationObserver(() => {
			if (R.armedAt === null) return;
			const now = performance.now(), on = inDrag();
			if (R.dragOnAt === null && on) R.dragOnAt = now;
			if (R.wasDrag && !on) R.offs.push(now);
			R.wasDrag = on;
		});
		const watchBody = () => { if (document.body) seen.observe(document.body, { attributes: true, attributeFilter: ['class'] }); };
		if (document.body) watchBody(); else document.addEventListener('DOMContentLoaded', watchBody, { once: true });
	} catch (_) { /* the press time still opens the window */ }
	const ric = window.requestIdleCallback, cic = window.cancelIdleCallback, st = window.setTimeout;
	const stackOf = () => { const n = Error.stackTraceLimit; Error.stackTraceLimit = 30; const s = new Error().stack || ''; Error.stackTraceLimit = n; return s; };
	const frames = (s) => s.split('\n').slice(1).map((l) => { const m = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?\s*$/.exec(l); return m ? { fn: m[1] || '', url: m[2], line: +m[3] } : null; }).filter((f) => f && f.url !== '<anonymous>');
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
	// an owner callback's entry, tied to the native job it runs inside and to the PM_BUSY.idle request that wrapped it
	// its owner is the one its request was admitted under (tokenOwner), whatever queue delivers it; a native callback
	// that is the owner's own function (token 0) belongs to its job's owner. jobOwner keeps the native job's view.
	const tokenOwner = new Map(), tokenFn = new Map();
	const entered = (token) => R.bodies.push({ job: R.job ? R.job.id : 0, owner: token ? (tokenOwner.get(token) ?? null) : (R.job ? R.job.owner : null), jobOwner: R.job ? R.job.owner : null, token, at: performance.now(), drag: inDrag() });
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
				/* bound at admission: the asker's owner, or the shared admission's other jobs (sound, hover) */
				const asked = ownerOf(new Error().stack || ''); tokenOwner.set(token, asked || 'busy');
				const body = function (...a) { entered(token); return fn.apply(this, a); };
				tokenFn.set(token, body);
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
			if (j.cancelDrag) leakEarly(j);
		};
	}
	// selftest leak-<owner>: once the hold is on, that owner's pending callback runs again through a timer, beside the
	// job the scheduler parked (the review's timer leak, made from the kit's side: the same wrapped owner function)
	// selftest leak-<owner>-early[-promise|-message]: at the moment the scheduler parks one of that owner's jobs for the
	// drag (its cancelIdleCallback inside the drag, at the press), run the job's wrapped owner function once through
	// that queue; capped at 6 parked jobs (the pre-check's capped mutants, made from the kit's side)
	const early = cfg.early ? { key: cfg.early.key, via: cfg.early.via, n: 0, runs: [] } : null;
	R.early = early;
	function leakEarly(j) {
		if (!early || early.n >= 6 || j.owner !== early.key || !j.token || !tokenFn.has(j.token) || j.leaked) return;
		j.leaked = true; early.n++;
		const fn = tokenFn.get(j.token), go = () => { early.runs.push({ token: j.token, at: performance.now(), drag: inDrag() }); try { fn.call(window, { didTimeout: false, timeRemaining: () => 8 }); } catch (_) { /* the owner's own error */ } };
		if (early.via === 'promise') Promise.resolve().then(() => 0).then(() => 0).then(go);
		else if (early.via === 'message') { const ch = new MessageChannel(); ch.port1.onmessage = () => { ch.port1.close(); go(); }; ch.port2.postMessage(0); }
		else queueMicrotask(go);
	}
	// selftest leak-<owner>-release: a release handler ahead of the product's (window, capture phase, installed before the
	// page's scripts) does 100 ms of release work, then runs up to 6 of that owner's parked callbacks synchronously, all
	// while the drag class is still on (the review's release-work mutant, made from the kit's side)
	const rel = cfg.release ? { key: cfg.release.key, n: 0, runs: [] } : null;
	R.rel = rel;
	if (rel) window.addEventListener('pointerup', () => {
		if (R.armedAt === null || !inDrag() || rel.n >= 6) return;
		const t0 = performance.now(); while (performance.now() - t0 < 100) { /* release work */ }
		const seenTokens = new Set();
		for (const j of R.jobs) {
			if (rel.n >= 6) break;
			if (j.owner !== rel.key || !j.cancelDrag || !j.token || !tokenFn.has(j.token) || seenTokens.has(j.token)) continue;
			seenTokens.add(j.token); rel.n++;
			rel.runs.push({ token: j.token, at: performance.now(), drag: inDrag() });
			try { tokenFn.get(j.token).call(window, { didTimeout: false, timeRemaining: () => 8 }); } catch (_) { /* the owner's own error */ }
		}
	}, true);
	R.leak = (key) => { const token = [...tokenOwner.entries()].filter(([, o]) => o === key).map(([t]) => t).pop();
		if (!token || !tokenFn.has(token)) return 0; st.call(window, () => { try { tokenFn.get(token).call(window, { didTimeout: false, timeRemaining: () => 8 }); } catch (_) { /* the owner's own error */ } }, 50); return token; };
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

async function holdDrag(t, f, sel, label, keys, leak = null, early = null, release = null) {
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
	// T46: the judged window opens at the press, not after the moves: the time is taken before mouse.down(), and the
	// recorder notes when a drag class first goes on after arming; the window opens at the earlier of the two
	const pressAt = await f.evaluate(() => window.__pmIdleRec.arm());
	await t.page.mouse.down();
	for (let i = 1; i <= 8; i++) { await t.page.mouse.move(...at(-i * 4)); await t.page.waitForTimeout(16); }
	const moved = await f.evaluate(() => performance.now());
	const dragOnAt = await f.evaluate(() => window.__pmIdleRec.dragOnAt);
	const began = dragOnAt === null ? pressAt : Math.min(pressAt, dragOnAt);
	t.log(`${label}: judged window opens at the press (${Math.round(pressAt)}); drag class on ${dragOnAt === null ? 'not seen by the recorder' : `${Math.round(dragOnAt - pressAt)} ms after it`}; the hand's moves ended ${Math.round(moved - pressAt)} ms after it`);
	await t.check(`${label}: the drag class went on at the press`, dragOnAt !== null && dragOnAt >= pressAt && dragOnAt <= moved, dragOnAt === null ? 'no drag class seen after arming' : `${Math.round(dragOnAt - pressAt)} ms after the press`);
	const dragOn = await f.evaluate(() => !!(window.PM_BUSY && PM_BUSY.drag && PM_BUSY.drag()) || document.body.classList.contains('pm-resizing'));
	await t.check(`${label}: the drag class is on while held`, dragOn, 'body classes ' + (await f.evaluate(() => document.body.className)));
	await f.evaluate(() => window.__pmIdleRec.release());
	if (early) { const e = await f.evaluate(() => { const x = window.__pmIdleRec.early; return { n: x.n, runs: x.runs.map((r) => ({ token: r.token, drag: r.drag, at: Math.round(r.at) })) }; });
		t.log(`SELFTEST ${label}: ${nameOf(early.key)} parked callbacks run again through ${early.via} at park time: ${e.n} (${JSON.stringify(e.runs)})`);
		await t.check(`selftest ${label}: the ${nameOf(early.key)} early leak ran a parked callback inside the drag before the moves ended`, e.runs.some((r) => r.drag && r.at >= began && r.at <= moved), JSON.stringify({ began: Math.round(began), moved: Math.round(moved), runs: e.runs })); }
	if (leak) { const tok = await f.evaluate((k) => window.__pmIdleRec.leak(k), leak); t.log(`SELFTEST ${label}: ${nameOf(leak)} callback (token ${tok}) run again through a timer during the hold`);
		await t.check(`selftest ${label}: the ${nameOf(leak)} leak found a pending callback to run`, tok > 0, String(tok)); }
	await t.mark(label + ' held');
	// held: the hand rests on the bar, with the small moves a held hand makes
	for (let k = 0; k < HOLD_MS / 100; k++) { await t.page.mouse.move(...at(-32 + (k % 2 ? 1 : -1))); await t.page.waitForTimeout(100); }
	const ended = await f.evaluate(() => performance.now());
	const remained = await t.check(`${label}: drag remains held`, await f.evaluate(() => !!(window.PM_BUSY && PM_BUSY.drag && PM_BUSY.drag())), 'the whole measurement must be a held drag');
	const offered = await t.check(`${label}: native idle delivery was eligible during hold`, await f.evaluate(() => !!window.__pmIdleRec.opportunity?.drag), 'independent native deadline inside the real held gesture');
	await t.mark(label + ' released');
	// T46 round 2: the window closes when the drag class goes off after the release, never before it. The release time
	// is taken before mouse.up(); the recorder's observer of the body's class notes when it goes off
	const up = await f.evaluate(() => window.__pmIdleRec.markUp());
	await t.page.mouse.up();
	await f.waitForFunction(() => { const R = window.__pmIdleRec; return R.offs.some((x) => x >= R.upAt); }, null, { timeout: 3000 }).catch(() => {});
	const offs = await f.evaluate(() => window.__pmIdleRec.offs);
	const off = offs.find((x) => x >= up.upAt);
	const closed = off === undefined ? await f.evaluate(() => performance.now()) : off;
	await t.check(`${label}: the drag class was on at the release and went off after it`, up.upDrag && off !== undefined, up.upDrag ? (off === undefined ? 'still on 3 s after the release' : `off ${Math.round(off - up.upAt)} ms after the release`) : 'already off at the release');
	t.log(`${label}: judged window ${Math.round(began)} to ${Math.round(closed)} (${Math.round(closed - began)} ms): the release came ${Math.round(up.upAt - ended)} ms after the hold's last move, the drag class went off ${off === undefined ? 'never (closed at the wait)' : `${Math.round(off - up.upAt)} ms after the release`}`);
	if (release) { const r = await f.evaluate(() => { const x = window.__pmIdleRec.rel; return { n: x.n, runs: x.runs.map((q) => ({ token: q.token, drag: q.drag, at: Math.round(q.at) })) }; });
		t.log(`SELFTEST ${label}: ${nameOf(release.key)} parked callbacks run in a release handler before the class goes off: ${r.n} (${JSON.stringify(r.runs)})`);
		await t.check(`selftest ${label}: the ${nameOf(release.key)} release leak ran a parked callback at the release with the drag class on`, r.runs.some((q) => q.drag && q.at >= up.upAt && q.at <= closed), JSON.stringify({ upAt: Math.round(up.upAt), closed: Math.round(closed), runs: r.runs })); }
	return { began, moved, ended, upAt: up.upAt, closed, queued, held: !!(dragOn && remained && offered) };
}

async function judge(t, f, label, win, owners) {
	// the window: from the press (or the drag class going on) to the drag class going off after the release (T46 round 2)
	const rec = await f.evaluate(([a, b]) => window.__pmIdleRec.fired.filter((c) => c.at >= a && c.at <= b), [win.began, win.closed]);
	const inside = rec.filter((c) => c.drag);
	const byOwner = {};
	for (const c of inside) { const o = c.owner || 'other'; (byOwner[o] = byOwner[o] || []).push(c); }
	const listed = Object.entries(byOwner).map(([o, cs]) => `${nameOf(o)}: ${cs.filter((c) => c.kind === 'idle').length} idle, ${cs.filter((c) => c.kind === 'timeout').length} timer, ${cs.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms (${[...new Set(cs.map((c) => top(c.stack)))].slice(0, 3).join(' | ')})`).join('; ');
	t.log(`${label}: ${inside.length} callbacks inside the ${Math.round(win.closed - win.began)} ms drag. ${listed || 'none'}`);
	for (const o of [...owners, EXTRA]) {
		const idle = (byOwner[o.key] || []).filter((c) => c.kind === 'idle');
		await t.check(`${label}: no idle callback from ${o.name} inside the drag`, idle.length === 0, idle.length ? `${idle.length} callbacks (jobs ${[...new Set(idle.map((c) => c.id))].join(', ')}), ${idle.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms; first requested at ${top(idle[0].stack)}` : '0');
	}
	// the owners' own callbacks: none entered inside the drag (whatever native callback carried them)
	const bodies = await f.evaluate(([a, b]) => window.__pmIdleRec.bodies.filter((c) => c.drag && c.at >= a && c.at <= b), [win.began, win.closed]);
	for (const o of [...owners, EXTRA]) {
		const mine = bodies.filter((c) => c.owner === o.key);
		await t.check(`${label}: no ${o.name} callback body entered inside the drag`, mine.length === 0, mine.length ? `${mine.length} entries (${mine.map((c) => c.job ? `job ${c.job}` : `no native job, token ${c.token}`).join(', ')})` : '0');
	}
	// every body entered inside the hold is attributed, whatever queue delivered it (T39): an entry with no owner fails
	const orphan = bodies.filter((c) => !c.owner);
	await t.check(`${label}: every callback body entered inside the drag has an owner`, orphan.length === 0, orphan.length ? `${orphan.length} unattributed entries: ${JSON.stringify(orphan.slice(0, 4))}` : '0');
	const drag = bodies.filter((c) => c.owner === 'drag');
	if (drag.length) t.log(`${label}: ${drag.length} callback bodies of the drag's own bookkeeping inside the drag (not idle work, not judged)`);
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
		const leak = /^leak-(usage|theme|census|glass)$/.exec(selftest)?.[1] || null;
		const em = /^leak-(usage|theme|census|glass)-early(?:-(promise|message))?$/.exec(selftest);
		const early = em ? { key: em[1], via: em[2] || 'microtask' } : null;
		const rm = /^leak-(usage|theme|census|glass)-release$/.exec(selftest);
		const release = rm ? { key: rm[1] } : null;
		if (selftest) await t.check(`selftest ${selftest} is a known omission or leak`, !!omit || !!leak || !!early || !!release, 'omit-<owner> | leak-<owner> | leak-<owner>-early | leak-<owner>-early-promise | leak-<owner>-early-message | leak-<owner>-release (owner: usage, theme, census, glass)');
		// Glass prewarm is queued only in a Glass look: a run without one leaves that owner unexercised
		await t.check('a Glass look is in this run (Glass prewarm owner)', looks.some((l) => /^glass-/.test(l)), `looks ${looks.join(',')}`);
		const map = await regionsOf(t);
		for (const o of OWNERS) await t.check(`${o.name}: its source is found once in the page`, !!map.owners.find((m) => m.key === o.key).r, `marker ${o.start}`);
		await t.check('shared admission (11-motion-start.js) source is found once in the page', !!map.admission, ADMISSION);
		t.log('owner source lines ' + JSON.stringify(Object.fromEntries(map.owners.map((m) => [m.key, m.r]))) + ' admission ' + JSON.stringify(map.admission));
		const cdp = await t.page.context().newCDPSession(t.page);
		await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		await t.page.addInitScript(RECORDER, { ...map, omit, early, release });
		if (!t.args.film) await t.viewport(Number(t.args.width || 1390), Number(t.args.height || 900));
		const holds = Object.fromEntries(looks.map((l) => [l, 0]));
		for (let repeat = 0; repeat < repeats; repeat++) {
		for (const look of looks) {
		const owners = needed(look);
		const f = await t.app.open({ settleMs: 200 });
		await t.check('recorder installed in the app frame', await f.evaluate(() => !!window.__pmIdleRec), '');
		await t.check('owner callback witness installed on PM_BUSY.idle in the app frame', await f.evaluate(() => !!(window.__pmIdleRec && window.__pmIdleRec.hooked && window.PM_BUSY && typeof PM_BUSY.idle === 'function')), '');
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
		const usage = await holdDrag(t, f, '#leftPanelResizer|#chatResizer', `${look} Usage`, keys, leak && keys.includes(leak) ? leak : null, early && keys.includes(early.key) ? early : null, release && keys.includes(release.key) ? release : null);
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
			await t.page.waitForTimeout(6000);
			const { fired, bodies } = await f.evaluate(() => ({ fired: window.__pmIdleRec.fired, bodies: window.__pmIdleRec.bodies }));
			const during = (j) => fired.filter((c) => c.id === j.id && c.at >= usage.began && c.at <= usage.closed);
			const after = (j) => fired.some((c) => c.id === j.id && !c.drag && c.at > usage.closed);
			// the owner's own callback entered inside this job's native delivery after release (and, when the job's first
			// request was witnessed, it is the function that request wrapped)
			const work = (j) => bodies.some((b) => b.job === j.id && !b.drag && b.at > usage.closed && (!j.token || b.token === j.token));
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
		}
		}
		}
		for (const look of looks) await t.check(`${look}: ${repeats} real held drag${repeats > 1 ? 's' : ''} completed`, holds[look] === repeats, `${holds[look]} of ${repeats}`);
		await cdp.detach();
	}
};
