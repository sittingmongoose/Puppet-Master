// SW-17: witness real owner jobs before a real divider hold. The native-idle
// gate preserves boot work across fast setup; opening it during the held drag
// gives control callbacks a real native idle opportunity. The product scheduler
// must cancel/park them and re-admit the identical callback after release.
// No owner job supplied by the test, no synthetic input, no fake drag marker.
// Missing owner work is an unexercised setup FAILURE, never a coverage pass.

const HOLD_MS = 3000;

// installed before the page's own scripts, in every frame (the sandbox's too)
const RECORDER = () => {
	if (window.__pmIdleRec) return;
	const R = window.__pmIdleRec = { fired: [], jobs: [], gated: true };
	const DRAG = ['pm-resizing', 'pm-ab-dragging', 'pmw-dragging', 'pmu-pointer-op', 'pm7u-pointer-op'];
	const inDrag = () => document.body && DRAG.some(c => document.body.classList.contains(c));
	const ric = window.requestIdleCallback, cic = window.cancelIdleCallback, st = window.setTimeout;
	const stackOf = () => { const n = Error.stackTraceLimit; Error.stackTraceLimit = 24; const s = new Error().stack || ''; Error.stackTraceLimit = n; return s; };
	const owned = s => /\bat (?:buildSliced|lateNext|prewarmSoon|prewarm|idleStill|whenIdle|paintSoon|censusSchedule|censusFrame|[\w.]*idleWhenStill|job\.ask)\b/.test(s);
	const identities = new WeakMap(), pending = new Map(); let seq = 0, handle = 1000000000;
	const note = (kind, stack, t0, drag, id) => R.fired.push({kind, stack, at:t0, ms:performance.now()-t0, drag, id});
	const ask = j => { j.native = ric.call(window, dl => {
		pending.delete(j.handle); j.pending = false;
		const at = performance.now(), drag = inDrag();
		try { return j.fn(dl); } finally { note('idle', j.stack, at, drag, j.id); }
	}, j.options); };
	// Delay delivery only, never execute the callback ourselves. Cancellation is
	// honoured, and a scheduler re-admission keeps the function's original identity.
	if (ric) {
		window.requestIdleCallback = function(fn, options) {
			const stack = stackOf();
			if (!owned(stack)) return ric.call(window, fn, options);
			let id = identities.get(fn); if (!id) { id=++seq; identities.set(fn,id); }
			const j={id, handle:++handle, fn, options, stack, pending:true, native:0};
			R.jobs.push(j); pending.set(j.handle,j);
			if (!R.gated) ask(j);
			return j.handle;
		};
		window.cancelIdleCallback = function(id) {
			const j=pending.get(id); if (!j) return cic.call(window,id);
			if(j.native) cic.call(window,j.native);
			j.pending=false; j.cancelled=true; pending.delete(id);
		};
	}
	R.release = () => { R.gated=false; for(const j of pending.values()) if(!j.native) ask(j);
		// Independent native deadline proves this hold actually offered idle delivery.
		ric.call(window, () => { R.opportunity = {at:performance.now(),drag:inDrag()}; }, {timeout:500});
	};
	R.pending = () => R.jobs.filter(j=>j.pending).map(({id,stack})=>({id,stack}));
	window.setTimeout = function (fn, ms, ...a) {
		if (typeof fn !== 'function') return st.call(window, fn, ms, ...a);
		const stack = stackOf();
		return st.call(window, function () { const t0 = performance.now(), drag = inDrag(); try { return fn.apply(this, a); } finally { if (drag) note('timeout', stack, t0, drag); } }, ms);
	};
};

// whose request a stack is, by its function names (the built page keeps them)
const OWNERS = [
	['Usage board / Glass prewarm', /\bat (?:buildSliced|lateNext|prewarmSoon|prewarm|idleStill)\b|\bat next\b[^]*\bat slice\b/],
	['look covers (12-theme-transition.js)', /\bat (?:whenIdle|paintSoon)\b/],
	['hover census (pm-hover-tags-js.js)', /\bat (?:censusSchedule|censusFrame)\b/],
	['PM_BUSY.idle (11-motion-start.js)', /\bat (?:[\w.]*idleWhenStill|job\.ask|Object\.idleWhenStill|window\.PM_BUSY\.idle)\b|PM_BUSY\.idle/]
];
const DRAG_ITSELF = /\bat (?:opSync|opFlags|setOpFlags)\b/;
const ownerOf = (stack) => { if (DRAG_ITSELF.test(stack)) return 'drag bookkeeping'; const o = OWNERS.find(([, re]) => re.test(stack)); return o ? o[0] : null; };
const top = (stack) => stack.split('\n').slice(2, 5).map((l) => l.trim().replace(/^at /, '').replace(/\s*\(.*$/, '')).join(' < ');

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
	await t.check(`${label}: queued owner jobs witnessed before pointerdown`, queued.length > 0, JSON.stringify(queued.map(j=>({id:j.id,owner:ownerOf(j.stack)}))));
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

async function judge(t, f, label, win) {
	const rec = await f.evaluate(([a, b]) => window.__pmIdleRec.fired.filter((c) => c.at >= a && c.at <= b + 50), [win.began, win.ended]);
	const inside = rec.filter((c) => c.drag);
	const byOwner = {};
	for (const c of inside) { const o = ownerOf(c.stack) || 'other'; (byOwner[o] = byOwner[o] || []).push(c); }
	const listed = Object.entries(byOwner).map(([o, cs]) => `${o}: ${cs.filter((c) => c.kind === 'idle').length} idle, ${cs.filter((c) => c.kind === 'timeout').length} timer, ${cs.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms (${[...new Set(cs.map((c) => top(c.stack)))].slice(0, 3).join(' | ')})`).join('; ');
	t.log(`${label}: ${inside.length} callbacks inside the ${Math.round(win.ended - win.began)} ms hold. ${listed || 'none'}`);
	for (const [o] of OWNERS) {
		const idle = (byOwner[o] || []).filter((c) => c.kind === 'idle');
		await t.check(`${label}: no idle callback from ${o} inside the drag`, idle.length === 0, idle.length ? `${idle.length} callbacks, ${idle.reduce((s, c) => s + c.ms, 0).toFixed(1)} ms; first requested at ${top(idle[0].stack)}` : '0');
	}
	// a timer from those callers may fire in a drag (a delay that ends there), but it starts nothing there
	const timers = OWNERS.flatMap(([o]) => (byOwner[o] || []).filter((c) => c.kind === 'timeout' && c.ms > 2));
	await t.check(`${label}: no timer of those callers does work inside the drag`, timers.length === 0, timers.map((c) => `${c.ms.toFixed(1)} ms at ${top(c.stack)}`).join('; ') || '0');
}

export const tests = {
	async 'idle work waits out a held drag (SW-17)'(t) {
		const cdp = await t.page.context().newCDPSession(t.page);
		await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
		if(t.args.motion === 'reduce') await t.emulate({ reducedMotion: 'reduce' });
		await t.page.addInitScript(RECORDER);
		if (!t.args.film) await t.viewport(Number(t.args.width || 1390), Number(t.args.height || 900));
		for (let repeat=0; repeat<Number(t.args.repeats || 1); repeat++) {
		for (const look of String(t.args.looks || 'basic-dark').split(',')) {
		const f = await t.app.open({ settleMs: 200 });
		await t.check('recorder installed in the app frame', await f.evaluate(() => !!window.__pmIdleRec), '');
		await t.app.resetLayout();
		await t.app.look(look);
		// Keep real boot jobs queued even on fast hosts. Usage starts its own warm
		// slices; no synthetic owner callback or artificial body drag class is used.
		await f.locator('.page-tab[data-page="usage"]').click();
		await f.waitForFunction(() => !document.documentElement.hasAttribute('data-pm-page-transition'), null, {timeout:20000});
		await t.page.waitForTimeout(Number(t.args.setupDelay ?? 1500));
		const pending = await f.evaluate(() => window.__pmIdleRec.pending());
		for (const [owner] of OWNERS.slice(0,3)) {
			await t.check(`setup exercised: pending ${owner}`, pending.some(j=>ownerOf(j.stack)===owner), JSON.stringify(pending.map(j=>({id:j.id,owner:ownerOf(j.stack),stack:top(j.stack)}))));
		}
		const usage = await holdDrag(t, f, '#leftPanelResizer|#chatResizer', 'Usage');
		if (usage) {
			await judge(t, f, 'Usage', usage);
			await t.page.waitForTimeout(6000);
			const fired = await f.evaluate(() => window.__pmIdleRec.fired);
			for (const j of usage.queued) {
				await t.check(`job ${j.id} (${ownerOf(j.stack)}): same queued job resumes after release`,
					fired.some(c=>c.id===j.id && !c.drag && c.at>=usage.ended), top(j.stack));
			}
		}
		}
		}
		await cdp.detach();
	}
};
