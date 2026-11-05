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
	const R = window.__pmIdleRec = { fired: [], jobs: [], gated: true };
	const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
	const inDrag = () => document.body && DRAG.some(c => document.body.classList.contains(c));
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
	const ask = j => { j.native = ric.call(window, dl => {
		pending.delete(j.handle); j.pending = false;
		const at = performance.now(), drag = inDrag();
		const was = R.running; R.running = j.owner;
		try { return j.fn(dl); } finally { R.running = was; note('idle', j.owner, j.stack, at, drag, j.id); }
	}, j.options); };
	// Delay delivery only, never execute the callback ourselves. Cancellation is honoured, and a scheduler re-admission
	// keeps the function's original identity (and owner).
	if (ric) {
		window.requestIdleCallback = function (fn, options) {
			const stack = stackOf();
			let identity = identities.get(fn);
			if (!identity) { const owner = ownerOf(stack); if (!owner || owner === 'drag') return ric.call(window, fn, options); identity = { id: ++seq, stack, owner }; identities.set(fn, identity); }
			const j = { id: identity.id, owner: identity.owner, handle: ++handle, fn, options, stack: identity.stack, pending: true, native: 0 };
			R.jobs.push(j); pending.set(j.handle, j);
			if (!R.gated) ask(j);
			return j.handle;
		};
		window.cancelIdleCallback = function (id) {
			const j = pending.get(id); if (!j) return cic.call(window, id);
			if (j.native) cic.call(window, j.native);
			j.pending = false; j.cancelled = true; pending.delete(id);
		};
	}
	R.release = () => { R.gated = false; for (const j of pending.values()) if (!j.native) ask(j);
		// Independent native deadline proves this hold actually offered idle delivery.
		ric.call(window, () => { R.opportunity = { at: performance.now(), drag: inDrag() }; }, { timeout: 500 });
	};
	R.pending = () => R.jobs.filter(j => j.pending).map(({ id, owner, stack }) => ({ id, owner, stack }));
	// a timer set by an owner's idle callback carries that idle work on: it belongs to the owner (the drag's own
	// responses to the moving divider, a width change for one, are not idle work and are not judged here)
	window.setTimeout = function (fn, ms, ...a) {
		if (typeof fn !== 'function' || !R.running) return st.call(window, fn, ms, ...a);
		const stack = stackOf(), owner = R.running;
		return st.call(window, function () { const t0 = performance.now(), drag = inDrag(), was = R.running; R.running = owner; try { return fn.apply(this, a); } finally { R.running = was; if (drag) note('timeout', owner, stack, t0, drag); } }, ms);
	};
};

// The expected-failing counterexample: one owner's real requests never reach the shared admission. Picked by the
// owner's own function names (plain text, not the classifier above), as the review's Glass omission did.
const OMIT = (key) => {
	const hit = { usage: (s) => /\bat idleStill\b/.test(s), theme: (s) => /\bat whenIdle\b/.test(s), census: (s) => /\bat censusSchedule\b/.test(s),
		glass: (s) => s.includes('prewarmSoon') && s.includes('syncStripNow') }[key];
	if (!hit || window.__pmIdleOmit) return;
	window.__pmIdleOmit = { key, count: 0 };
	let busy;
	Object.defineProperty(window, 'PM_BUSY', { configurable: true, get() { return busy; }, set(value) {
		busy = value; let idle;
		Object.defineProperty(busy, 'idle', { configurable: true, get() { return idle; }, set(real) { idle = function (...args) {
			if (hit(new Error().stack || '')) { window.__pmIdleOmit.count++; return { cancel() {} }; }
			return real.apply(this, args);
		}; } });
	} });
};

// the first page frames that asked, past the recorder's and the admission's own: "name:line" (line in the built page)
const top = (stack) => stack.split('\n').slice(1).map((l) => /^\s*at (?:(.+?) \()?(.+?):(\d+):\d+\)?\s*$/.exec(l)).filter((m) => m && m[2] !== '<anonymous>' && !/(?:^|\.)(?:ask|idleWhenStill)(?: \[as \w+\])?$/.test(m[1] || '')).slice(0, 3).map((m) => `${m[1] || '(anonymous)'}:${m[3]}`).join(' < ');
const brief = (jobs) => JSON.stringify(jobs.map((j) => ({ id: j.id, owner: j.owner, at: top(j.stack) })));

async function holdDrag(t, f, sel, label) {
	const box = await f.evaluate((s) => {
		const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none'; };
		const e = s.split('|').map((q) => [...document.querySelectorAll(q)].find(vis)).find(Boolean);
		if (!e) return null;
		const r = e.getBoundingClientRect();
		return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, id: e.id || e.className };
	}, sel);
	if (!(await t.check(`${label}: a divider to hold`, !!box, sel))) return null;
	const axisX = box.h >= box.w;   // a tall bar moves sideways
	const at = (d) => (axisX ? [box.x + d, box.y] : [box.x, box.y + d]);
	const queued = await f.evaluate(() => window.__pmIdleRec.pending());
	await t.page.mouse.move(...at(0)); await t.page.waitForTimeout(120);
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
	await t.check(`${label}: drag remains held`, await f.evaluate(() => !!(window.PM_BUSY && PM_BUSY.drag && PM_BUSY.drag())), 'the whole measurement must be a held drag');
	await t.check(`${label}: native idle delivery was eligible during hold`, await f.evaluate(() => !!window.__pmIdleRec.opportunity?.drag), 'independent native deadline inside the real held gesture');
	await t.mark(label + ' released');
	await t.page.mouse.up();
	return { began, ended, queued };
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
	// a timer an owner's idle work set may fire in a drag (a delay that ends there), but it starts nothing there
	const timers = [...owners, EXTRA].flatMap((o) => (byOwner[o.key] || []).filter((c) => c.kind === 'timeout' && c.ms > 2));
	await t.check(`${label}: no timer of those owners does work inside the drag`, timers.length === 0, timers.map((c) => `${nameOf(c.owner)} ${c.ms.toFixed(1)} ms at ${top(c.stack)}`).join('; ') || '0');
}

export const tests = {
	async 'idle work waits out a held drag (SW-17)'(t) {
		const looks = String(t.args.looks || 'glass-dark,basic-dark').split(',');
		const selftest = String(t.args.selftest || '');
		const omit = /^omit-(usage|theme|census|glass)$/.exec(selftest)?.[1] || null;
		if (selftest) await t.check(`selftest ${selftest} is a known omission`, !!omit, 'omit-usage | omit-theme | omit-census | omit-glass');
		// Glass prewarm is queued only in a Glass look: a run without one leaves that owner unexercised
		await t.check('a Glass look is in this run (Glass prewarm owner)', looks.some((l) => /^glass-/.test(l)), `looks ${looks.join(',')}`);
		const map = await regionsOf(t);
		for (const o of OWNERS) await t.check(`${o.name}: its source is found once in the page`, !!map.owners.find((m) => m.key === o.key).r, `marker ${o.start}`);
		await t.check('shared admission (11-motion-start.js) source is found once in the page', !!map.admission, ADMISSION);
		t.log('owner source lines ' + JSON.stringify(Object.fromEntries(map.owners.map((m) => [m.key, m.r]))) + ' admission ' + JSON.stringify(map.admission));
		const cdp = await t.page.context().newCDPSession(t.page);
		await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
		if (t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		if (omit) await t.page.addInitScript(OMIT, omit);
		await t.page.addInitScript(RECORDER, map);
		if (!t.args.film) await t.viewport(Number(t.args.width || 1390), Number(t.args.height || 900));
		for (let repeat = 0; repeat < Number(t.args.repeats || 1); repeat++) {
		for (const look of looks) {
		const owners = needed(look);
		const f = await t.app.open({ settleMs: 200 });
		await t.check('recorder installed in the app frame', await f.evaluate(() => !!window.__pmIdleRec), '');
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
		const pending = await f.evaluate(() => window.__pmIdleRec.pending());
		if (omit) {
			const n = await f.evaluate(() => window.__pmIdleOmit?.count || 0);
			t.log(`SELFTEST ${look}: ${n} real ${nameOf(omit)} requests suppressed at the shared admission`);
			await t.check(`selftest ${look}: the ${nameOf(omit)} omission actually suppressed real requests`, n > 0, String(n));
		}
		for (const o of owners) {
			const mine = pending.filter((j) => j.owner === o.key);
			await t.check(`${look}: ${o.name} has a real idle job pending before the hold`, mine.length > 0, mine.length ? brief(mine) : `none; pending ${brief(pending)}`);
		}
		const usage = await holdDrag(t, f, '#leftPanelResizer|#chatResizer', `${look} Usage`);
		if (usage) {
			await judge(t, f, `${look} Usage`, usage, owners);
			await t.page.waitForTimeout(6000);
			const fired = await f.evaluate(() => window.__pmIdleRec.fired);
			const during = (j) => fired.filter((c) => c.id === j.id && c.at >= usage.began && c.at <= usage.ended + 50);
			const after = (j) => fired.some((c) => c.id === j.id && !c.drag && c.at > usage.ended);
			for (const o of owners) {
				const mine = usage.queued.filter((j) => j.owner === o.key);
				const ran = mine.filter((j) => during(j).length);
				await t.check(`${look}: ${o.name}'s pending jobs are withheld through the hold`, mine.length > 0 && ran.length === 0, mine.length ? (ran.length ? `ran inside: ${brief(ran)}` : `${mine.length} withheld`) : 'no pending job to withhold');
				const lost = mine.filter((j) => !after(j));
				await t.check(`${look}: ${o.name}'s same pending jobs resume after release`, mine.length > 0 && lost.length === 0, mine.length ? (lost.length ? `never resumed: ${brief(lost)}` : `${mine.length} resumed: ids ${mine.map((j) => j.id).join(', ')}`) : 'no pending job to resume');
			}
			for (const j of usage.queued.filter((q) => q.owner === EXTRA.key)) {
				await t.check(`${look}: job ${j.id} (${EXTRA.name}): same queued job resumes after release`, after(j), top(j.stack));
			}
		}
		}
		}
		await cdp.detach();
	}
};
