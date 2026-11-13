// The Stop chip's pace (lane S, Jared's choice PERF-STOP2 = A, 2026-11-13): run the REAL send-stop.js in a small model of
// the browser's CSS animations and check that the breathe changes pace at once, keeping its place in the loop, with no
// listener for any animation event and nothing left armed once Stop has gone.
//
// The model: the chip's two loops (the glyph's and the backlight's) are made from send-stop.css itself (each loop's
// name, length and delay are read from the rules that match the chip's attributes, the theme's brightness, NieR Mode
// and Reduced Motion), Settings' Animation speed multiplies every length and delay (#o55-look-scale, FO-153), a style
// change of the same name keeps the Animation and its start time (as Chrome does), a change of name starts a new one,
// and the onboarding window holds the glyph's loop (its rule matches elements, not the backlight's ::before). Frames run
// at 120 Hz; timers fire at their due time between frames.
//
// "Keeps its place": across every frame, the loop's position (loops run plus the way through this one, in time) moves
// by no more than one frame's step at the faster pace. A loop that restarts (a new Animation) is reported on its own.
//
// Run: node "tests/stop-chip-beat-verify.mjs"            (this tree's send-stop.js and send-stop.css)
//      node "tests/stop-chip-beat-verify.mjs" --ref origin/main   (both files as they are at a git revision)
// Exits 1 when any case fails, listing each.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const DIR = 'Concepts/chat-assistant-concepts/5.6 Pro';
const at = process.argv.indexOf('--ref');
const ref = at < 0 ? null : process.argv[at + 1];
const read = (f) => (ref ? execFileSync('git', ['show', `${ref}:${DIR}/${f}`], { encoding: 'utf8', maxBuffer: 1 << 26 }) : readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const SRC = read('send-stop.js');
const CSS = read('send-stop.css');

/* ---------------------------------------------------------------- the CSS, read from the file */
const LD = Number((/--ss-ld:\s*(\d+)ms/.exec(CSS) || [])[1]);
const RULES = [];
// top-level rules only: the @media (Reduced Motion) and @keyframes blocks are left out (the model has its own Reduced Motion)
const FLAT = CSS.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@[\w-]+[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
for (const m of FLAT.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
	const sels = m[1].split(',').map((s) => s.trim()).filter(Boolean);
	const decl = Object.fromEntries(m[2].split(';').map((d) => d.split(':')).filter((p) => p.length >= 2).map(([k, ...v]) => [k.trim(), v.join(':').trim()]));
	RULES.push({ sels, decl });
}
// which loop layer a selector styles, and whether it matches the chip's state ({ss, flow, flowed, light, nier, snap})
const layerOf = (s) => (/\.ss-g$/.test(s) ? 'g' : /\.ss-bl::before$/.test(s) ? 'bl' : null);
function matches(s, st) {
	if (!/^(body\[data-theme\$="-light"\] )?\.sendstop/.test(s)) return false;           // NieR, Reduced Motion: below
	if (/^body\[data-theme\$="-light"\]/.test(s) && !st.light) return false;
	if (/\.sendstop\.ss-|:hover|:active|\[data-launch|\[data-hold/.test(s)) return false;
	for (const [, k, v] of s.matchAll(/\[(data-[\w-]+)(?:="([^"]*)")?\]/g)) {
		if (k === 'data-ss' && v !== st.ss) return false;
		if (k === 'data-flow' && v !== st.flow) return false;
		if (k === 'data-flowed' && !st.flowed) return false;
		if (!['data-ss', 'data-flow', 'data-flowed'].includes(k)) return false;
	}
	return true;
}
const ms = (v) => (/^var\(--ss-ld\)$/.test(v) ? LD : /^-?[\d.]+ms$/.test(v) ? parseFloat(v) : /^-?[\d.]+s$/.test(v) ? parseFloat(v) * 1000 : NaN);
function loopSpec(layer, st, k) {
	if (st.ss !== 'stop' || st.reduced || st.snap || !st.shown) return null;
	if (layer === 'bl' && st.nier) return null;                                             // NieR: .ss-bl { display: none }
	let name = null, duration = NaN, delay = 0;
	for (const r of RULES) {
		if (!r.sels.some((s) => layerOf(s) === layer && matches(s, st))) continue;
		if (r.decl.animation) {
			const w = r.decl.animation.split(/\s+(?![^(]*\))/);
			name = w[0]; duration = ms(w[1]); delay = ms(w[3]);
		}
		if (r.decl['animation-name']) name = r.decl['animation-name'];
		if (r.decl['animation-duration']) duration = ms(r.decl['animation-duration']);
		if (r.decl['animation-delay']) delay = ms(r.decl['animation-delay']);
	}
	return name && duration > 0 ? { name, duration: duration * k, delay: delay * k } : null;
}

/* ---------------------------------------------------------------- the browser */
const FRAME = 1000 / 120;
function world({ clockApi = true } = {}) {
	const W = { clock: 0, k: 1, listeners: [], restarts: [], log: [] };
	let seq = 0;
	const timers = new Map();
	let rafs = [];
	const setTimeout = (cb, t) => { const id = ++seq; timers.set(id, { at: W.clock + Math.max(0, +t || 0), cb }); return id; };
	const clearTimeout = (id) => { timers.delete(id); };
	const requestAnimationFrame = (cb) => { rafs.push(cb); return rafs.length; };
	const st = { ss: null, flow: null, flowed: false, light: false, nier: false, reduced: false, snap: false, shown: true, held: false };
	const attrs = new Map(), cls = new Set();
	let anims = [];
	class Anim {
		constructor(layer, spec) {
			Object.assign(this, { layer, animationName: spec.name, t: { duration: spec.duration, delay: spec.delay }, startTime: W.clock, hold: null, playbackRate: 1 });
			if (layer === 'g' && st.held) this.hold = 0;
			const self = this;
			this.effect = {
				getTiming: () => ({ duration: self.t.duration, delay: self.t.delay, iterations: Infinity }),
				getComputedTiming: () => { const lt = self.currentTime, a = lt - self.t.delay; if (a < 0) return { localTime: lt, currentIteration: null, progress: null }; const i = Math.floor(a / self.t.duration); return { localTime: lt, currentIteration: i, progress: (a - i * self.t.duration) / self.t.duration }; }
			};
		}
		get currentTime() { return this.hold != null ? this.hold : (W.clock - this.startTime) * this.playbackRate; }
		set currentTime(v) { W.log.push({ at: W.clock, set: this.layer, v }); if (this.hold != null) this.hold = v; else this.startTime = W.clock - v / this.playbackRate; }
		place() { const c = this.effect.getComputedTiming(); return c.currentIteration == null ? null : c.currentIteration + c.progress; }
	}
	// style: what the rules say now, applied to the running loops (same name: retimed in place; new name: a new loop)
	function flush() {
		for (const layer of ['g', 'bl']) {
			const spec = loopSpec(layer, st, W.k), a = anims.find((x) => x.layer === layer);
			if (!spec) { if (a) anims = anims.filter((x) => x !== a); continue; }
			if (a && a.animationName === spec.name) { a.t.duration = spec.duration; a.t.delay = spec.delay; continue; }
			if (a) anims = anims.filter((x) => x !== a);
			anims.push(new Anim(layer, spec));
			W.restarts.push({ at: W.clock, layer, name: spec.name, duration: spec.duration });
		}
	}
	const syncState = () => { st.ss = attrs.get('data-ss') ?? null; st.flow = attrs.get('data-flow') ?? null; st.flowed = attrs.has('data-flowed'); st.snap = cls.has('ss-snap'); };
	const chip = {
		classList: { contains: (c) => cls.has(c), remove: (c) => { cls.delete(c); syncState(); }, add: (c) => { cls.add(c); syncState(); } },
		getAttribute: (n) => (attrs.has(n) ? attrs.get(n) : null),
		hasAttribute: (n) => attrs.has(n),
		setAttribute: (n, v) => { attrs.set(n, String(v)); syncState(); },
		removeAttribute: (n) => { attrs.delete(n); syncState(); },
		getAnimations: () => { flush(); return anims.slice(); },
		get offsetWidth() { flush(); return 24; },
		closest: () => chip
	};
	const observers = [];
	class MutationObserver {
		constructor(cb) { this.cb = cb; this.on = false; observers.push(this); }
		observe(node, opts) { this.on = true; this.node = node; this.opts = opts; }
		disconnect() { this.on = false; }
	}
	const document = {
		head: { nodeName: 'HEAD' },
		body: { classList: { contains: () => false } },
		documentElement: { getAttribute: (n) => (n === 'data-motion' && st.reduced ? 'reduced' : null) },
		timeline: { get currentTime() { return W.clock; } },
		querySelector: () => (st.shown ? chip : null),
		addEventListener: (type) => W.listeners.push(type)
	};
	const window = {
		matchMedia: () => ({ matches: false }),
		addEventListener: (type) => W.listeners.push(type),
		PM56_STREAM: { active: () => [] }
	};
	if (clockApi) window.PM56_CLOCK = {
		now: () => W.clock, ms: (x) => x,
		after(t, fn) { const h = { done: false, t: 0 }; h.t = setTimeout(() => { if (!h.done) { h.done = true; fn(); } }, t); return h; },
		cancel(h) { if (h) { h.done = true; clearTimeout(h.t); } }
	};
	vm.runInNewContext(SRC, { window, document, performance: { now: () => W.clock }, setTimeout, clearTimeout, requestAnimationFrame, MutationObserver });
	const api = window.PM56_SENDSTOP;
	assert.ok(api && typeof api.html === 'function', 'the module defines PM56_SENDSTOP');

	// a patch of the chip from the module's markup (pmSyncAttrs: data attributes and the class list follow the markup)
	W.render = (o) => {
		const html = api.html({ busy: false, text: '', qlen: 0, tid: 'one', ...o });
		const tag = /<button([^>]*)>/.exec(html)[1];
		for (const k of [...attrs.keys()]) if (k.startsWith('data-')) attrs.delete(k);
		for (const m of tag.matchAll(/(data-[\w-]+)="([^"]*)"/g)) attrs.set(m[1], m[2]);
		cls.clear(); for (const c of (/class="([^"]*)"/.exec(tag) || [, ''])[1].split(/\s+/).filter(Boolean)) cls.add(c);
		syncState();
	};
	W.rebuild = () => { anims = []; };                                   // the chip's element is made anew: its loops go with it
	// the glyph's loop (and the backlight's), and one frame: due timers at their own time, style, frame callbacks
	W.glyph = () => anims.find((a) => a.layer === 'g') || null;
	W.glow = () => anims.find((a) => a.layer === 'bl') || null;
	W.advance = (to) => {
		for (;;) {
			const next = [...timers].filter(([, x]) => x.at <= to).sort((a, b) => a[1].at - b[1].at)[0];
			if (!next) break;
			timers.delete(next[0]); W.clock = Math.max(W.clock, next[1].at); next[1].cb();
		}
		W.clock = to;
	};
	W.frames = [];
	W.frame = () => {
		W.advance(W.clock + FRAME);
		flush();
		const cbs = rafs; rafs = []; for (const cb of cbs) cb(W.clock);
		const g = W.glyph(), b = W.glow();
		W.frames.push({ t: W.clock, flow: st.flow, g: g && { a: g, place: g.place(), dur: g.t.duration }, b: b && { a: b, place: b.place(), dur: b.t.duration } });
	};
	W.run = (msLong, each) => { const end = W.clock + msLong; while (W.clock + FRAME <= end + 1e-9) { W.frame(); if (each) each(); } };
	W.until = (pred, limit = 30000) => { const end = W.clock + limit; while (!pred()) { if (W.clock > end) throw new Error('model: waited too long'); W.frame(); } };
	// Settings' Animation speed: #o55-look-scale is rewritten, then the observers hear of it (a microtask, before any frame)
	W.speed = (k) => {
		W.k = k;
		for (const o of observers) if (o.on) o.cb([{ type: 'childList', target: { nodeName: 'STYLE', id: 'o55-look-scale' }, addedNodes: [{ nodeType: 3, nodeName: '#text', parentNode: { nodeName: 'STYLE' } }], removedNodes: [] }], o);
	};
	W.hold = (on) => { st.held = on; const g = W.glyph(); if (!g) return; if (on && g.hold == null) g.hold = g.currentTime; if (!on && g.hold != null) { g.startTime = W.clock - g.hold; g.hold = null; } };
	W.set = (k, v) => { st[k] = v; };
	W.armed = () => ({ timers: timers.size, rafs: rafs.length, observing: observers.filter((o) => o.on).length });
	W.api = api; W.attrs = attrs; W.st = st;
	return W;
}

/* ---------------------------------------------------------------- the checks */
// No frame moves the loop further than one frame at the faster pace (both loops), from frame index i0 on. A frame in
// which a loop was made anew is not counted here (restarts are asserted by the case).
function smooth(W, i0 = 0, what = 'g') {
	const fast = Math.min(...[2200, 3200].map((d) => d * W.k));
	let worst = 0, where = null;
	for (let i = Math.max(1, i0); i < W.frames.length; i++) {
		const p = W.frames[i - 1][what], c = W.frames[i][what];
		if (!p || !c || p.a !== c.a || p.place == null || c.place == null) continue;
		const step = c.place - p.place, dt = W.frames[i].t - W.frames[i - 1].t, bound = dt / Math.min(fast, p.dur, c.dur) + 1e-9;
		const over = Math.abs(step) / bound;
		if (over > worst) { worst = over; where = { i, t: Math.round(W.frames[i].t), step: +step.toFixed(5), bound: +bound.toFixed(5), from: p.dur, to: c.dur }; }
	}
	assert.ok(worst <= 1, `${what === 'g' ? 'the glyph' : 'the backlight'}'s loop moved more than one frame at the faster pace in one frame: ${JSON.stringify(where)}`);
	return worst;
}
const feed = (W, msLong, every = 100) => { const end = W.clock + msLong; let next = W.clock; while (W.clock < end) { if (W.clock >= next) { W.api.token('one'); next += every; } W.frame(); } };
// enter Stop: flowing (a word just arrived) or waiting (none)
function start(opts = {}, flowing = true) {
	const W = world(opts);
	W.render({ busy: false });
	if (flowing) W.api.token('one');
	W.render({ busy: true });
	return W;
}
const pace = (W) => W.glyph() && W.glyph().t.duration;

const CASES = {
	'no listener for any animation or transition event': () => {
		const W = start();
		feed(W, 3000); W.run(4000); W.render({ busy: false }); W.run(500);
		const bad = W.listeners.filter((t) => /^(webkit)?(animation|transition)/i.test(t));
		assert.deepEqual(bad, [], `listeners: ${bad.join(', ')}`);
		return `listeners added: ${W.listeners.join(', ') || 'none'}`;
	},
	'waiting -> flowing at once and in place (a word arrives: early, mid, late in the loop)': () => {
		const out = [];
		for (const target of [0.1, 0.5, 0.97]) {
			const W = start({}, false);
			assert.equal(W.attrs.get('data-flow'), 'waiting', 'starts waiting with no word');
			W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1 + target; });
			const before = W.glyph().place(), i0 = W.frames.length;
			W.advance(W.clock + 3); W.api.token('one');                     // between two frames
			const g = W.glyph();
			assert.equal(W.attrs.get('data-flow'), 'flowing', 'the word turns it to flowing in the same task');
			assert.equal(g.t.duration, 2200, 'the loop is at the flowing length at once');
			assert.ok(Math.abs(g.place() - (before + 3 / 3200)) < 1e-9, `the loop kept its place: ${g.place()} vs ${before + 3 / 3200}`);
			W.run(400);
			const w = smooth(W, i0 - 1); smooth(W, i0 - 1, 'b');
			out.push(`${target}: kept ${before.toFixed(4)}, worst step ${(w * 100).toFixed(0)}% of a frame at 2200 ms`);
		}
		return out.join('; ');
	},
	'flowing -> waiting 900 ms after the last word, in place (early, mid, late in the loop)': () => {
		const out = [];
		for (const target of [0.1, 0.5, 0.97]) {
			const W = start({}, true);
			let last = W.clock;
			W.until(() => { if (W.clock - last >= 100) { W.api.token('one'); last = W.clock; } const g = W.glyph(); return g && g.place() != null && g.place() + 901 / 2200 >= 1 + target; });
			W.api.token('one'); last = W.clock;
			const i0 = W.frames.length;
			W.until(() => W.attrs.get('data-flow') === 'waiting', 3000);
			const sw = W.log.filter((x) => x.set === 'g').pop();
			assert.ok(sw && Math.abs(sw.at - (last + 901)) < 1e-6, `the change came 901 ms after the last word: ${sw && sw.at - last}`);
			assert.equal(W.glyph().t.duration, 3200, 'the loop is at the waiting length');
			W.run(400);
			const w = smooth(W, i0); smooth(W, i0, 'b');
			out.push(`${target}: changed at ${(((sw.v - LD) / 3200) % 1).toFixed(3)} of the loop, worst step ${(w * 100).toFixed(0)}%`);
		}
		return out.join('; ');
	},
	"Settings' Animation speed changed mid-loop, then a cadence change right after": () => {
		const out = [];
		for (const [flowing, k] of [[true, 0.6], [false, 0.6], [false, 1.6], [true, 1.6]]) {
			const W = start({}, flowing);
			let last = W.clock;
			const keep = () => { if (flowing && W.clock - last >= 100) { W.api.token('one'); last = W.clock; } };
			W.until(() => { keep(); const g = W.glyph(); return g && g.place() != null && g.place() >= 1.37; });
			const before = W.glyph().place(), i0 = W.frames.length;
			W.speed(k);
			const g = W.glyph();
			assert.ok(Math.abs(g.t.duration - (flowing ? 2200 : 3200) * k) < 1e-9, 'the new length applies');
			assert.ok(Math.abs(g.place() - before) < 1e-9, `the speed change kept the loop's place: ${g.place()} vs ${before}`);
			assert.ok(Math.abs(W.glow().place() - W.glyph().place()) < 1e-9, 'the backlight stays with the glyph');
			assert.ok(Math.abs(W.api.debug().speed - k) < 1e-9, `the module reads the speed from the loop: ${W.api.debug().speed}`);
			W.run(200, keep);
			if (flowing) W.until(() => W.attrs.get('data-flow') === 'waiting', 3000);   // no more words
			else W.api.token('one');
			W.run(400);
			const w = smooth(W, i0 - 1); smooth(W, i0 - 1, 'b');
			out.push(`${flowing ? 'flowing' : 'waiting'} x${k}: worst step ${(w * 100).toFixed(0)}%`);
		}
		return out.join('; ');
	},
	"Settings' speed changed while the loop waits out its delay: still at rest, then starts": () => {
		const W = start({}, true);
		W.run(300);
		assert.equal(W.glyph().place(), null, 'in the 800 ms delay');
		W.speed(0.6);
		assert.equal(W.glyph().place(), null, 'still in the delay after the change');
		W.until(() => W.glyph().place() != null, 2000);
		assert.ok(W.clock <= 300 + 500 * 0.6 + FRAME + 1e-6, `starts within the delay's rescaled rest: at ${W.clock}`);
		return `started at ${Math.round(W.clock)} ms`;
	},
	'the onboarding window holds the glyph: a cadence change under it keeps its place, and it carries on after': () => {
		const W = start({}, true);
		let last = W.clock;
		W.until(() => { if (W.clock - last >= 100) { W.api.token('one'); last = W.clock; } const g = W.glyph(); return g && g.place() != null && g.place() >= 1.2; });
		W.hold(true);
		const held = W.glyph().place(), i0 = W.frames.length;
		W.run(1500);                                                  // no words under the window: waiting, while held
		assert.equal(W.attrs.get('data-flow'), 'waiting');
		assert.ok(Math.abs(W.glyph().place() - held) < 1e-9, `the held loop did not move: ${W.glyph().place()} vs ${held}`);
		W.hold(false);
		W.run(300);
		assert.ok(Math.abs(W.glyph().place() - (held + 300 / 3200)) < FRAME / 3200 + 1e-9, 'carries on from where it was held, at the waiting pace');
		const w = smooth(W, i0); smooth(W, i0, 'b');
		W.api.token('one'); W.run(300); smooth(W, i0); smooth(W, i0, 'b');
		return `held at ${held.toFixed(3)}, worst step ${(w * 100).toFixed(0)}%`;
	},
	'nothing armed once Stop has gone, nor at rest; words at rest arm nothing': () => {
		const W = start({}, true);
		feed(W, 1500);
		assert.ok(W.armed().observing === 1 && W.armed().timers >= 1, `armed while Stop shows and words arrive: ${JSON.stringify(W.armed())}`);
		W.render({ busy: false });
		W.run(1000);
		assert.deepEqual(W.armed(), { timers: 0, rafs: 0, observing: 0 }, 'nothing armed after Stop');
		W.api.token('one'); W.run(1500);
		assert.deepEqual(W.armed(), { timers: 0, rafs: 0, observing: 0 }, 'a word with no Stop chip arms nothing');
		const W2 = start({}, false);                                // a run that only waits: the observer, no timer
		W2.run(4000);
		assert.deepEqual(W2.armed(), { timers: 0, rafs: 0, observing: 1 }, 'waiting with no word: no timer');
		return 'ok';
	},
	'a run that ends and the next that starts; the chip hidden and shown; a rebuilt chip: right pace with no script': () => {
		const W = start({}, true);
		W.run(3000);                                                  // no words: waiting
		assert.equal(pace(W), 3200);
		W.render({ busy: false }); W.run(100);
		W.api.token('one'); W.render({ busy: true });                 // the next run, words arriving
		W.run(50);
		assert.equal(W.attrs.get('data-flow'), 'flowing'); assert.equal(pace(W), 2200);
		W.run(2000);                                                  // waiting again
		W.set('shown', false); W.run(100); W.set('shown', true); W.run(100);
		assert.equal(pace(W), 3200, 'shown again: the waiting length');
		W.rebuild(); W.render({ busy: true }); W.run(50);
		assert.equal(pace(W), 3200, 'a rebuilt chip: the waiting length');
		return 'ok';
	},
	'Reduced Motion on mid-run (no loops), a change of cadence under it, then off again': () => {
		const W = start({}, true);
		W.run(1200);
		W.set('reduced', true); W.run(50);
		assert.equal(W.glyph(), null, 'no loop under Reduced Motion');
		W.run(1000);
		assert.equal(W.attrs.get('data-flow'), 'waiting', 'the cadence still follows the words');
		W.api.token('one');
		assert.equal(W.attrs.get('data-flow'), 'flowing');
		W.set('reduced', false); W.run(50);
		assert.equal(pace(W), 2200, 'off again: the loop at the flowing length');
		return 'ok';
	},
	'a light/dark change: the glyph keeps its place, the backlight starts its own keyframes at the right length': () => {
		const W = start({}, false);
		W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1.3; });
		const i0 = W.frames.length;
		W.set('light', true); W.run(100);
		smooth(W, i0 - 1);
		const b = W.glow();
		assert.ok(b && b.t.duration === 3200, `backlight at the waiting length: ${b && b.animationName} ${b && b.t.duration}`);
		W.set('nier', true); W.run(100);
		assert.equal(W.glow(), null, 'NieR Mode: no backlight');
		W.set('nier', false); W.run(50);
		assert.equal(W.glow().t.duration, 3200, 'NieR Mode off: the backlight comes back at the right length');
		return `backlight ${b.animationName}`;
	},
	"another thread's words do not change the pace": () => {
		const W = start({}, false);
		W.run(1500);
		W.api.token('two'); W.run(50);
		assert.equal(W.attrs.get('data-flow'), 'waiting');
		return 'ok';
	},
	'the same with no PM56_CLOCK (plain timers)': () => {
		const W = start({ clockApi: false }, true);
		feed(W, 1000);
		W.until(() => W.attrs.get('data-flow') === 'waiting', 3000);
		W.render({ busy: false }); W.run(200);
		assert.deepEqual(W.armed(), { timers: 0, rafs: 0, observing: 0 });
		return 'ok';
	}
};

let failed = 0;
console.log(`send-stop pace model: ${ref ? `files at ${ref}` : 'this tree'}; --ss-ld ${LD} ms`);
for (const [name, fn] of Object.entries(CASES)) {
	try { console.log(`PASS ${name}: ${fn()}`); } catch (e) { failed++; console.log(`FAIL ${name}: ${e.message.split('\n')[0]}`); }
}
console.log(failed ? `${failed} of ${Object.keys(CASES).length} failed` : `all ${Object.keys(CASES).length} passed`);
process.exit(failed ? 1 : 0);
