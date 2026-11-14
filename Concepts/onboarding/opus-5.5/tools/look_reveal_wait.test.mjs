// FO-188 / review R33: the look reveal's wait (src/js/60-ui-core.js applyLook, variant B ruling (c)) on a stubbed page
// with a hand-turned clock, hand-fed frames and a View Transition whose capture, ready, skip and finish this test drives
// (no browser). The real applyLook, the document's input interruption, onKey and close() are cut from the source and run
// with every other name stubbed. What it holds:
//   R33-1  an obsolete reveal's 900 ms cap never plays its old circles (after a quick second pick, or after a press
//          skipped it), and nothing of a reveal is left playing once its transition has finished;
//   R33-2  a key during the wait ends it at once, as a press does: Escape (onKey closes the window), the Close button
//          by keyboard, close() itself; the held work is released then, not at the transition's finish;
//   R33-3  Reduced Motion or low-resource mode switched on between the press and ready skips the reveal at ready and
//          releases the held work at once.
// Run: node Concepts/onboarding/opus-5.5/tools/look_reveal_wait.test.mjs [other 60-ui-core.js, e.g. from an older commit]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC_PATH = process.argv[2] || fileURLToPath(new URL('../src/js/60-ui-core.js', import.meta.url));
const SRC = readFileSync(SRC_PATH, 'utf8');

const cut = (from, to) => {
	const a = SRC.indexOf(from), b = SRC.indexOf(to, a + 1);
	if (a < 0 || b < 0) throw new Error(`cannot cut ${JSON.stringify(from)} .. ${JSON.stringify(to)} from ${SRC_PATH}`);
	return SRC.slice(a, b);
};
// applyLook, the held resizes and the input interruption (everything up to the rail); onKey; close()
const PART = [
	cut('  function applyLook(family, mode, originEl) {', '  /* ---------------------------------------------------------------- rail */'),
	cut('  function onKey(e) {', '  function trapTab(e) {'),
	cut('  function close(reason, o) {', '  /* shared actions any screen can use */')
].join('\n');

// a stand-in for anything the cut source reaches that this test does not model: callable, and every property is one
const stub = new Proxy(function () {}, {
	get: (_t, k) => (k === 'then' ? undefined : k === Symbol.toPrimitive ? () => 0 : stub),
	apply: () => stub, construct: () => stub, set: () => true
});
const partial = (o) => new Proxy(o, { get: (t, k) => (k in t ? t[k] : k === 'then' ? undefined : stub), set: (t, k, v) => { t[k] = v; return true; } });

function makePage() {
	let now = 0, seq = 0;
	const timers = new Map(), frames = [], docListeners = [], winEvents = [], anims = [], log = [];
	const attrs = new Map();
	const html = {
		setAttribute: (n, v) => attrs.set(n, String(v)), removeAttribute: (n) => attrs.delete(n), hasAttribute: (n) => attrs.has(n), getAttribute: (n) => (attrs.has(n) ? attrs.get(n) : null),
		animate(keyframes, opts) {
			const a = { keyframes, pseudo: opts.pseudoElement, duration: opts.duration, vt: page.current, state: 'running', played: 0,
				pause() { this.state = 'paused'; }, play() { this.state = 'running'; this.played++; log.push(`play ${this.vt.n} ${this.pseudo}`); },
				cancel() { this.state = 'idle'; }, finish() { this.state = 'finished'; } };
			anims.push(a); return a;
		}
	};
	const holds = { count: 0, begun: 0, released: 0 };
	const motion = { reduced: false, lowResource: false };
	const vts = [];
	const window = {
		innerWidth: 1920, innerHeight: 1080,
		CSS: { supports: () => true },
		PM_THEME: { setFamily: (f) => log.push(`family ${f}`), setMode: () => {} },
		PM_LOOK_HOLD: Object.assign(() => holds.count > 0, {
			after: () => false,
			begin() { holds.count++; holds.begun++; let open = true; return () => { if (!open) return; open = false; holds.count--; holds.released++; log.push('release'); }; }
		}),
		dispatchEvent(ev) { winEvents.push({ type: ev.type, at: now, vt: page.current && page.current.n }); return true; },
		addEventListener() {}, setTimeout: (fn, ms) => page.setTimeout(fn, ms)
	};
	const document = {
		documentElement: html, hidden: false, fonts: undefined, body: { nodeType: 1 },
		addEventListener: (type, fn, capture) => docListeners.push({ type, fn, capture: !!capture }),
		startViewTransition(update) {
			let readyOk, readyNo, finOk;
			const vt = { n: vts.length + 1, update, updated: false, skipped: 0, phase: 'capture',
				ready: new Promise((res, rej) => { readyOk = res; readyNo = rej; }),
				finished: new Promise((res) => { finOk = res; }) };
			vt.ready.catch(() => {});
			const runUpdate = () => { if (vt.updated) return; vt.updated = true; page.current = vt; update(); };
			vt.capture = () => { runUpdate(); };
			vt.makeReady = () => { if (vt.phase !== 'capture') return; vt.phase = 'animating'; readyOk(); };
			vt.finish = () => { if (vt.phase === 'done') return; vt.phase = 'done'; finOk(); };
			vt.skipTransition = () => {
				vt.skipped++; log.push(`skip ${vt.n}`);
				if (vt.phase === 'done') return;
				const wasCapture = vt.phase === 'capture';
				vt.phase = 'done';
				runUpdate();
				if (wasCapture) readyNo(new Error('AbortError'));
				finOk();
			};
			vts.push(vt); page.current = vt;
			return vt;
		}
	};
	const S = partial({
		vt: null, open: true, lookOpen: false, tip: null, sess: partial({ drafts: {}, screen: 'welcome', ui: {} }), save() {},
		root: partial({ querySelector: () => null, querySelectorAll: () => [], getAnimations: () => [], classList: stub, setAttribute() {}, getAttribute: () => null })
	});
	let theme = { family: 'basic', slug: 'basic-dark', selectedMode: 'dark' };
	const O55 = partial({
		theme: () => theme,
		draft: partial({ set() {} }),
		nierLook: null, shell: null,
		motion: partial({ quiet() {}, reduced: () => motion.reduced, get lowResource() { return motion.lowResource; }, familyCss: {},
			real: partial({ raf: (fn) => frames.push(fn), setTimeout: (fn, ms) => page.setTimeout(fn, ms) }),
			settled: () => Promise.resolve(), after: () => stub, play: () => stub })
	});
	const env = {
		S, O55, window, document, SCREENS: { defs: {} }, pendingMount: null, openGen: 0,
		innerWidth: window.innerWidth, innerHeight: window.innerHeight, CSS: window.CSS,
		askedFamily: (t) => t.family, refresh() {}, renderLook() {},
		setTimeout: (fn, ms) => page.setTimeout(fn, ms), clearTimeout: (id) => timers.delete(id),
		requestAnimationFrame: (fn) => frames.push(fn), performance: { now: () => now },
		Event: class { constructor(type) { this.type = type; } }, CustomEvent: class { constructor(type, o) { this.type = type; this.detail = o && o.detail; } },
		Promise, Object, Array, Math, Number, String, RegExp, Boolean, Error, Map, Set, WeakSet, JSON, Infinity, NaN, undefined, console
	};
	const scope = new Proxy(env, {
		has: (_t, k) => k !== Symbol.unscopables,
		get: (t, k) => (k === Symbol.unscopables ? undefined : k in t ? t[k] : stub),
		set: (t, k, v) => { t[k] = v; return true; }
	});
	// eslint-disable-next-line no-new-func
	const fns = new Function('scope', `with (scope) { ${PART}\n return { applyLook, onKey, close }; }`)(scope);
	const page = {
		current: null, vts, anims, log, holds, motion, attrs, winEvents, S, fns, doc: document,
		get now() { return now; },
		setTimeout(fn, ms) { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms || 0), fn }); return id; },
		async advance(ms) {
			const until = now + ms;
			for (;;) {
				const due = [...timers.entries()].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
				if (!due) break;
				timers.delete(due[0]); now = due[1].at; due[1].fn(); await settle();
			}
			now = until; await settle();
		},
		async frame(dt = 16.7) { now += dt; const q = frames.splice(0); q.forEach((fn) => fn(now)); await settle(); },
		async key(key, target = document.body) {
			const e = { type: 'keydown', key, target, shiftKey: false, metaKey: false, preventDefault() {}, stopPropagation() {}, closest: () => null };
			docListeners.filter((l) => l.type === 'keydown' && l.capture).forEach((l) => l.fn(e));
			await settle();
			return e;
		},
		async press(x = 100, y = 100) {
			const e = { type: 'pointerdown', clientX: x, clientY: y, target: html };
			docListeners.filter((l) => l.type === 'pointerdown' && l.capture).forEach((l) => l.fn(e));
			await settle();
		},
		pick(family) { const was = theme; theme = { family: was.family, slug: was.slug, selectedMode: 'dark' }; fns.applyLook(family, 'dark', null); theme = { family, slug: family + '-dark', selectedMode: 'dark' }; return vts[vts.length - 1]; },
		reveals: () => winEvents.filter((e) => e.type === 'o55:reveal'),
		of: (vt) => anims.filter((a) => a.vt === vt)
	};
	return page;
}
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

const results = [];
async function test(name, fn) {
	try { await fn(); results.push({ name, ok: true }); console.log(`PASS  ${name}`); }
	catch (e) { results.push({ name, ok: false }); console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const waitingAt = async (page, family) => { const vt = page.pick(family); vt.capture(); await settle(); vt.makeReady(); await settle(); return vt; };

console.log(`source: ${SRC_PATH}`);

await test('baseline: the circle starts on the third frame on time in a row, once, and nothing of it is left after finished', async () => {
	const p = makePage();
	const vt = await waitingAt(p, 'friendly');
	expect(p.of(vt).some((a) => a.state === 'paused'), 'the circles wait paused at ready');
	await p.frame(); await p.frame(); await p.frame();
	expect(p.reveals().length === 1, `one o55:reveal after three frames on time (saw ${p.reveals().length})`);
	vt.finish(); await settle();
	expect(p.holds.released === p.holds.begun, 'the held work is released at finished');
	await p.advance(2000);
	expect(p.reveals().length === 1, 'no second reveal later');
	expect(p.S.vt === null, 'S.vt is cleared at finished');
});

await test('R33-1a: a quick second pick: the first reveal\'s 900 ms cap never plays its circles inside the second reveal', async () => {
	const p = makePage();
	const a = await waitingAt(p, 'friendly'); // waiting, frames not flowing (none fed): its cap is set for +900 ms
	await p.advance(100);
	const b = await waitingAt(p, 'glass'); // the second pick skips the first
	expect(a.skipped > 0, 'the second pick skips the first transition');
	await p.advance(850); // past the first's cap (+900 ms from its ready), before the second's
	const stale = p.of(a).filter((x) => x.played > 0);
	expect(stale.length === 0, `the first reveal's cap played ${stale.length} of its animations during the second reveal (${stale.map((x) => x.pseudo).join(', ')})`);
	expect(p.reveals().length === 0, `o55:reveal was sent ${p.reveals().length} time(s) by an obsolete reveal`);
	expect(p.of(a).every((x) => x.state === 'idle'), `the first reveal's paused circles and corner clips are cancelled (states: ${p.of(a).map((x) => x.state).join(', ')})`);
	await p.advance(200); // the second's own cap
	expect(p.reveals().length === 1 && p.of(b).some((x) => x.played > 0), 'the second reveal still plays on its own cap');
});

await test('R33-1b: a press skips a waiting reveal: its cap never fires afterwards', async () => {
	const p = makePage();
	const a = await waitingAt(p, 'retro');
	await p.press();
	expect(a.skipped > 0, 'the press skips the transition');
	await p.advance(1500);
	expect(p.of(a).every((x) => x.played === 0), 'no circle of the skipped reveal plays after its cap');
	expect(p.reveals().length === 0, `o55:reveal was sent ${p.reveals().length} time(s) after the skip`);
});

await test('R33-1c: finished ends the wait: a cap still pending at finished does nothing', async () => {
	const p = makePage();
	const a = await waitingAt(p, 'friendly');
	a.finish(); await settle(); // a transition finished by the browser itself while its circle still waited
	await p.advance(1500);
	expect(p.of(a).every((x) => x.played === 0), 'no circle plays after finished');
	expect(p.reveals().length === 0, 'no o55:reveal after finished');
});

await test('R33-2a: a key during the wait ends it at once, as a press does, and releases the held work then', async () => {
	const p = makePage();
	const a = await waitingAt(p, 'glass');
	await p.key('Tab');
	expect(a.skipped > 0, 'a key skips the transition');
	expect(p.holds.released === p.holds.begun, 'the held work is released at the key, not when the transition finishes');
	expect(p.of(a).every((x) => x.state === 'idle'), 'the circles and corner clips are cancelled');
	expect(!p.attrs.has('data-o55-vt-still'), 'the app beneath is shown again (data-o55-vt-still removed)');
	await p.advance(1500);
	expect(p.reveals().length === 0, 'no o55:reveal later');
	const q = makePage();
	const b = await waitingAt(q, 'glass');
	await q.key('Shift');
	expect(b.skipped === 0, 'a lone modifier does not end it (as a moment\'s snap ignores it)');
});

await test('R33-2b: Escape during the wait closes the window with the reveal ended, never under the old window\'s picture', async () => {
	const p = makePage();
	const a = await waitingAt(p, 'friendly');
	const e = await p.key('Escape'); // the document's capture listeners first, then the window's own keys (onKey)
	p.fns.onKey(e); await settle();
	expect(p.S.open === false, 'Escape closed the window');
	expect(a.skipped > 0, 'the reveal was skipped when the window closed');
	expect(p.holds.released === p.holds.begun, 'the held work was released');
	await p.advance(1500);
	expect(p.reveals().length === 0, 'no o55:reveal after the close');
});

await test('R33-2c: close() (the Close button by keyboard, Skip, the tour) during the wait ends the reveal first', async () => {
	const p = makePage();
	const a = await waitingAt(p, 'friendly');
	p.fns.close('close'); await settle();
	expect(a.skipped > 0, 'close() skipped the transition');
	expect(p.holds.released === p.holds.begun, 'the held work was released at the close');
	expect(p.of(a).every((x) => x.state === 'idle'), 'the paused circles and corner clips are cancelled');
	await p.advance(1500);
	expect(p.of(a).every((x) => x.played === 0) && p.reveals().length === 0, 'nothing of the reveal plays after the close');
});

for (const [label, turnOn] of [['Reduced Motion', (p) => { p.motion.reduced = true; }], ['low-resource mode', (p) => { p.motion.lowResource = true; }]]) {
	await test(`R33-3: ${label} switched on between the press and ready: skipped at ready, held work released at once`, async () => {
		const p = makePage();
		const a = p.pick('friendly');
		a.capture(); await settle();
		turnOn(p);
		a.makeReady(); await settle();
		expect(a.skipped > 0, 'the transition is skipped at ready');
		expect(p.holds.released === p.holds.begun, 'the held work is released at ready, not after a circle');
		expect(!p.attrs.has('data-o55-vt-still'), 'the app beneath is shown at once');
		await p.frame(); await p.frame(); await p.frame(); await p.advance(1500);
		expect(p.of(a).every((x) => x.played === 0), 'no circle plays');
		expect(p.reveals().length === 0, 'no o55:reveal');
	});
}

await test('a hidden page plays the circle at once (unchanged)', async () => {
	const p = makePage();
	const a = p.pick('friendly');
	a.capture(); await settle();
	p.doc.hidden = true;
	a.makeReady(); await settle();
	expect(p.reveals().length === 1 && p.of(a).some((x) => x.played > 0), 'the circle plays at ready on a hidden page');
});

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length} of ${results.length} passed`);
process.exit(bad.length ? 1 : 0);
