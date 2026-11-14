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
	if (!/^(body\[data-theme\$="-light"\] )?(\.send-button)?\.sendstop/.test(s)) return false;     // NieR, Reduced Motion: below
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
// the chip's own custom properties (rules on the chip itself, by its attributes) and its inline style
const chipSel = (s) => /^(body\[data-theme\$="-light"\] )?(\.send-button)?\.sendstop(\[[^\]]+\])*$/.test(s);
function varsOf(st, inline) {
	const v = {};
	for (const r of RULES) if (r.sels.some((s) => chipSel(s) && matches(s, st))) for (const [k, x] of Object.entries(r.decl)) if (k.startsWith('--')) v[k] = x;
	return Object.assign(v, inline);
}
// a value with var() and calc() of times and numbers: ms for a time
function evalv(x, vars) {
	let s = String(x).trim(), prev;
	for (let n = 0; n < 20 && s !== prev; n++) { prev = s; s = s.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/, (m, name, fb) => (vars[name] != null ? vars[name] : fb != null ? fb : 'NaN')); }
	const e = s.replace(/calc\(/g, '(').replace(/(-?[\d.]+)ms\b/g, '$1').replace(/(-?[\d.]+)s\b/g, (m, n) => String(parseFloat(n) * 1000));
	return /^[\d.\s*+\-/()]+$/.test(e) ? Function(`return (${e})`)() : NaN;
}
// Settings' look scale sheet (17-look.js, FO-153) at Animation speed k: in an animation shorthand a time and a var()
// or calc() that holds one are scaled, one that carries a *speed var is left alone; animation-duration always scales
const TIME_VARS = new Set(RULES.flatMap((r) => Object.entries(r.decl).filter(([n, v]) => n.startsWith('--') && /^-?[\d.]+m?s$/.test(v)).map(([n]) => n)));
function sheetWord(w, k, vars) {
	const v = evalv(w, vars);
	if (k === 1 || !(v > 0)) return v;
	if (/^-?[\d.]+m?s$/.test(w)) return v * k;
	if (!/^(?:var|calc)\(/.test(w) || /--[\w-]*speed\b/.test(w)) return v;
	const timed = (w.match(/var\(\s*--[\w-]+/g) || []).some((x) => TIME_VARS.has(x.replace(/^var\(\s*/, ''))) || /(?:^|[\s(,])-?(?:\d+\.?\d*|\.\d+)m?s\b/.test(w.replace(/^var\(\s*--[\w-]+\s*,?/, ''));
	return timed ? v * k : v;
}
// a shorthand's words, split at white space outside parentheses (as 17-look.js o55Words)
const words = (v) => { const out = []; let depth = 0, cur = ''; for (const ch of v) { if (ch === '(') depth++; if (ch === ')') depth--; if (/\s/.test(ch) && !depth) { if (cur) out.push(cur); cur = ''; } else cur += ch; } if (cur) out.push(cur); return out; };
function loopSpec(layer, st, k, inline) {
	if (st.ss !== 'stop' || st.reduced || st.snap || !st.shown) return null;
	if (layer === 'bl' && st.nier) return null;                                             // NieR: .ss-bl { display: none }
	const vars = varsOf(st, inline);
	let name = null, duration = NaN, delay = 0;
	for (const r of RULES) {
		if (!r.sels.some((s) => layerOf(s) === layer && matches(s, st))) continue;
		if (r.decl.animation) {
			const w = words(r.decl.animation);
			name = w[0]; duration = sheetWord(w[1], k, vars); delay = sheetWord(w[3], k, vars);
		}
		if (r.decl['animation-name']) name = r.decl['animation-name'];
		if (r.decl['animation-duration']) duration = evalv(r.decl['animation-duration'], vars) * k;
		if (r.decl['animation-delay']) delay = evalv(r.decl['animation-delay'], vars);
	}
	return name && duration > 0 ? { name, duration, delay } : null;
}
const LD = evalv('var(--ss-ld)', varsOf({ ss: 'stop', flow: 'flowing' }, {}));

/* ---------------------------------------------------------------- the browser */
const FRAME = 1000 / 120;
function world({ clockApi = true } = {}) {
	// clock: the wall clock (performance.now, timers, the compositor); ft: the last frame's time, which the document
	// timeline and every Animation's current time read during a task (Chrome's frame clock)
	const W = { clock: 0, ft: 0, k: 1, kAnim: 1, listeners: [], restarts: [], log: [], jumps: [], shown: new Map() };
	let seq = 0;
	const timers = new Map();
	let rafs = [];
	const setTimeout = (cb, t) => { const id = ++seq; timers.set(id, { at: W.clock + Math.max(0, +t || 0), cb }); return id; };
	const clearTimeout = (id) => { timers.delete(id); };
	let rafId = 0;
	const requestAnimationFrame = (cb) => { rafs.push({ id: ++rafId, cb }); return rafId; };
	const cancelAnimationFrame = (id) => { rafs = rafs.filter((x) => x.id !== id); };
	const st = { ss: null, flow: null, flowed: false, light: false, nier: false, reduced: false, snap: false, shown: true, held: false };
	const attrs = new Map(), cls = new Set();
	let anims = [];
	class Anim {
		constructor(layer, spec) {
			Object.assign(this, { layer, animationName: spec.name, t: { duration: spec.duration, delay: spec.delay }, _start: W.ft, hold: null, playbackRate: 1 });
			if (layer === 'g' && st.held) this.hold = 0;
			const self = this;
			this.effect = {
				getTiming: () => ({ duration: self.t.duration, delay: self.t.delay, iterations: Infinity }),
				getComputedTiming: () => { const lt = self.currentTime, a = lt - self.t.delay; if (a < 0) return { localTime: lt, currentIteration: null, progress: null }; const i = Math.floor(a / self.t.duration); return { localTime: lt, currentIteration: i, progress: (a - i * self.t.duration) / self.t.duration }; }
			};
		}
		// as the Web Animations API has it: a held (paused) loop has a hold time and no start time
		get playState() { return this.hold != null ? 'paused' : 'running'; }
		get startTime() { return this.hold != null ? null : this._start; }
		set startTime(v) { this._start = v; W.log.push({ at: W.clock, set: this.layer, v: this.currentTime }); }
		get currentTime() { return this.hold != null ? this.hold : (W.ft - this._start) * this.playbackRate; }
		set currentTime(v) { W.log.push({ at: W.clock, set: this.layer, v }); if (this.hold != null) this.hold = v; else this._start = W.ft - v / this.playbackRate; }
		place() { const c = this.effect.getComputedTiming(); return c.currentIteration == null ? null : c.currentIteration + c.progress; }
	}
	// style: what the rules say now, applied to the running loops (same name: retimed in place; new name: a new loop)
	function flush() {
		for (const layer of ['g', 'bl']) {
			const spec = loopSpec(layer, st, W.k, inlineVars()), a = anims.find((x) => x.layer === layer);
			if (!spec) { if (a) anims = anims.filter((x) => x !== a); continue; }
			if (a && a.animationName === spec.name) { a.t.duration = spec.duration; a.t.delay = spec.delay; continue; }
			if (a) anims = anims.filter((x) => x !== a);
			anims.push(new Anim(layer, spec));
			W.restarts.push({ at: W.clock, layer, name: spec.name, duration: spec.duration });
		}
	}
	const inlineVars = () => Object.fromEntries(String(attrs.get('style') || '').split(';').map((d) => d.split(':')).filter((p) => p.length === 2 && p[0].trim().startsWith('--')).map(([n, v]) => [n.trim(), v.trim()]));
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
		timeline: { get currentTime() { return W.ft; } },
		querySelector: () => (st.shown ? chip : null),
		addEventListener: (type) => W.listeners.push(type),
		// Element.animate as 17-look.js patches it: a script's duration times Animation speed (the module's speed probe)
		createElement: () => ({ animate: (kf, o) => ({ effect: { getTiming: () => ({ duration: o.duration * W.kAnim }) }, cancel() {} }) })
	};
	const handlers = [];
	const window = {
		matchMedia: () => ({ matches: false }),
		addEventListener: (type, fn) => { W.listeners.push(type); handlers.push({ type, fn }); },
		removeEventListener: (type, fn) => { const i = handlers.findIndex((h) => h.type === type && h.fn === fn); if (i >= 0) handlers.splice(i, 1); },
		PM56_STREAM: { active: () => W.streams || [] }
	};
	if (clockApi) window.PM56_CLOCK = {
		now: () => W.clock, ms: (x) => x,
		after(t, fn) { const h = { done: false, t: 0 }; h.t = setTimeout(() => { if (!h.done) { h.done = true; fn(); } }, t); return h; },
		cancel(h) { if (h) { h.done = true; clearTimeout(h.t); } }
	};
	vm.runInNewContext(SRC, { window, document, performance: { now: () => W.clock }, setTimeout, clearTimeout, requestAnimationFrame, cancelAnimationFrame, MutationObserver });
	const api = window.PM56_SENDSTOP;
	assert.ok(api && typeof api.html === 'function', 'the module defines PM56_SENDSTOP');

	// a patch of the chip from the module's markup (pmSyncAttrs: data attributes and the class list follow the markup)
	W.render = (o) => {
		const html = api.html({ busy: false, text: '', qlen: 0, tid: 'one', ...o });
		const tag = /<button([^>]*)>/.exec(html)[1];
		for (const k of [...attrs.keys()]) if (k.startsWith('data-') || k === 'style') attrs.delete(k);
		for (const m of tag.matchAll(/(data-[\w-]+|style)="([^"]*)"/g)) attrs.set(m[1], m[2]);
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
	// the compositor shows each loop by the timing it was handed at the last commit, on the wall clock
	const shown = (x, T) => (x.hold != null ? (x.hold - x.l) / x.d : (T - x.start - x.l) / x.d);
	W.frame = () => {
		W.advance(W.clock + FRAME);
		W.ft = W.clock;
		flush();
		const cbs = rafs; rafs = []; for (const x of cbs) x.cb(W.ft);
		flush();
		// the commit: what the square showed just before and shows just after, at this moment
		for (const a of anims) {
			const now = { start: a._start, hold: a.hold, d: a.t.duration, l: a.t.delay }, was = W.shown.get(a);
			if (was) { const before = shown(was, W.clock), after = shown(now, W.clock); if (before >= 0 && after >= 0) W.jumps.push({ i: W.frames.length, t: W.clock, layer: a.layer, before, after, d: Math.min(was.d, now.d) }); }
			W.shown.set(a, now);
		}
		const g = W.glyph(), b = W.glow();
		W.frames.push({ t: W.clock, flow: st.flow, g: g && { a: g, place: g.place(), dur: g.t.duration }, b: b && { a: b, place: b.place(), dur: b.t.duration } });
	};
	W.run = (msLong, each) => { const end = W.clock + msLong; while (W.clock + FRAME <= end + 1e-9) { W.frame(); if (each) each(); } };
	W.until = (pred, limit = 30000) => { const end = W.clock + limit; while (!pred()) { if (W.clock > end) throw new Error('model: waited too long'); W.frame(); } };
	// Settings' Animation speed: #o55-look-scale is rewritten, then the observers hear of it (a microtask, before any frame)
	W.speed = (k) => {
		if (k !== W.k) { W.kAnim = k; for (const h of handlers.filter((x) => x.type === 'pm-animation-speed')) h.fn({ type: 'pm-animation-speed', detail: { factor: k } }); }
		W.k = k;
		for (const o of observers) if (o.on) o.cb([{ type: 'childList', target: { nodeName: 'STYLE', id: 'o55-look-scale' }, addedNodes: [{ nodeType: 3, nodeName: '#text', parentNode: { nodeName: 'STYLE' } }], removedNodes: [] }], o);
	};
	W.hold = (on) => { st.held = on; const g = W.glyph(); if (!g) return; if (on && g.hold == null) g.hold = g.currentTime; if (!on && g.hold != null) { g._start = W.ft - g.hold; g.hold = null; } };
	// where the compositor shows a loop now (by what it was handed last) and where it will show it once handed this
	W.shownNow = (a) => shown(W.shown.get(a), W.clock);
	W.handedNow = (a) => shown({ start: a._start, hold: a.hold, d: a.t.duration, l: a.t.delay }, W.clock);
	// a long task: the wall clock moves on with no frame and no timer (the compositor keeps drawing what it was handed)
	W.task = (ms, fn) => { W.clock += ms; if (fn) fn(); };
	// run fn inside the next frame's callbacks, as turn-stream.js and thought-stream.js release their words (a frame
	// callback that the module registers from there runs in the frame after, as in the browser)
	W.inFrame = (fn) => { rafs.push({ id: ++rafId, cb: () => fn() }); };
	W.set = (k, v) => { st[k] = v; };
	W.armed = () => ({ timers: timers.size, rafs: rafs.length, observing: observers.filter((o) => o.on).length + handlers.filter((h) => h.type === 'pm-animation-speed').length });
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
	// what a person sees: at every hand-over the square shown just after is where it was shown just before
	const hand = W.jumps.filter((j) => j.i >= i0 && j.layer === what).map((j) => ({ ...j, over: Math.abs(j.after - j.before) / (FRAME / Math.min(fast, j.d) + 1e-9) }));
	const bad = hand.sort((x, y) => y.over - x.over)[0];
	assert.ok(!bad || bad.over <= 1, `${what === 'g' ? 'the glyph' : 'the backlight'} jumped when a frame handed it to the compositor: ${bad && JSON.stringify({ t: Math.round(bad.t), before: +bad.before.toFixed(4), after: +bad.after.toFixed(4) })}`);
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
			W.frame();                                                       // the cadence Stop starts in shows by its first frame
			assert.equal(W.attrs.get('data-flow'), 'waiting', 'starts waiting with no word');
			W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1 + target; });
			const before = W.glyph().place(), i0 = W.frames.length;
			W.advance(W.clock + 3);                                          // between two frames
			W.api.token('one');
			W.frame();                                                       // the next frame makes the change
			const g = W.glyph();
			assert.equal(W.attrs.get('data-flow'), 'flowing', 'the word turns it to flowing by the next frame');
			assert.equal(g.t.duration, 2200, 'the loop is at the flowing length by the next frame');
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
			const sw = W.log.find((x) => x.set === 'g' && x.at > last);    // the first re-placement after the last word
			assert.ok(sw && sw.at - (last + 901) >= -1e-6 && sw.at - (last + 901) <= FRAME + 1e-6, `the change came in the first frame after 901 ms without a word: ${sw && sw.at - last}`);
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
			W.frame();                                                       // the next frame makes the change
			const g = W.glyph();
			assert.ok(Math.abs(g.t.duration - (flowing ? 2200 : 3200) * k) < 1e-9, `the new length applies by the next frame: ${g.t.duration}`);
			assert.ok(Math.abs(g.place() - before) <= FRAME / Math.min(g.t.duration, (flowing ? 2200 : 3200)) + 1e-9, `the speed change kept the loop's place to within a frame: ${g.place()} vs ${before}`);
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
		assert.ok(W.clock <= 300 + 500 * 0.6 + 2 * FRAME + 1e-6, `starts within the delay's rescaled rest (a frame either way): at ${W.clock}`);
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
		W.api.token('one'); W.frame();
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
	'a Stop chip missing for a moment (the quiet timer and the observer stop) is watched again from the next render': () => {
		const W = start({}, true);
		W.run(200);
		W.set('shown', false); W.run(1200);                          // the quiet timer fires, finds no chip, switches all off
		assert.deepEqual(W.armed(), { timers: 0, rafs: 0, observing: 0 }, 'off while no chip');
		W.set('shown', true); W.render({ busy: true }); W.run(50);    // still Stop: the same run
		assert.equal(W.armed().observing, 1, 'the observer is back');
		W.until(() => W.attrs.get('data-flow') === 'waiting', 3000);  // no words since: the quiet timer came back too
		W.until(() => W.glyph() && W.glyph().place() != null && W.glyph().place() >= 0.3, 4000);
		const before = W.glyph().place();
		W.speed(0.6);
		assert.ok(Math.abs(W.glyph().place() - before) < 1e-9, 'a speed change after it keeps the place');
		return 'ok';
	},
	"Settings' speed changed at the end of a 260 ms long task (as Settings' save is): no jump when the frame hands it over": () => {
		const out = [];
		for (const flowing of [false, true]) {
			const W = start({}, flowing);
			let last = W.clock;
			const keep = () => { if (flowing && W.clock - last >= 100) { W.api.token('one'); last = W.clock; } };
			W.until(() => { keep(); const g = W.glyph(); return g && g.place() != null && g.place() >= 1.3; });
			const i0 = W.frames.length;
			W.task(260, () => W.speed(0.6));                             // the sheet is written at the task's end
			W.run(600, keep);
			smooth(W, i0); smooth(W, i0, 'b');
			const j = W.jumps.filter((x) => x.i >= i0 && x.layer === 'g').map((x) => Math.abs(x.after - x.before));
			out.push(`${flowing ? 'flowing' : 'waiting'}: largest hand-over step ${Math.max(...j).toFixed(5)} of a loop`);
		}
		return out.join('; ');
	},
	'a word, then a 300 ms long task: no jump when the frame hands it over': () => {
		const W = start({}, false);
		W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1.4; });
		const i0 = W.frames.length;
		W.advance(W.clock + 3);
		W.task(300, () => {}); W.api.token('one');                    // the word comes at the end of a long task
		W.task(300, () => {});                                       // and another long task before the frame
		W.run(400);
		smooth(W, i0); smooth(W, i0, 'b');
		return 'ok';
	},
	'a word released inside a frame callback (the app\'s word path), with 0, 50 and 300 ms of long task before the next frame: no jump at any hand-over': () => {
		// R32 F2: the cadence change made inside frame N's callbacks was handed over by frame N, then re-placed again in
		// frame N+1 by the old timing: the square stepped back by the time between the two frames times the change of rate
		const out = [];
		for (const gap of [0, 50, 300]) {
			const W = start({}, false);
			W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1.3; });
			const i0 = W.frames.length;
			W.inFrame(() => W.api.token('one'));
			W.frame();                                                   // the frame that releases the word
			W.task(gap);                                                 // a long task before the next frame
			W.run(400);
			assert.equal(W.attrs.get('data-flow'), 'flowing', 'the word turned it to flowing');
			smooth(W, i0); smooth(W, i0, 'b');
			const j = W.jumps.filter((x) => x.i >= i0 && x.layer === 'g').map((x) => x.after - x.before);
			out.push(`${gap} ms: largest hand-over step ${Math.max(...j.map(Math.abs)).toFixed(5)}`);
		}
		return out.join('; ');
	},
	"Animation speed changed while the chip has no loops, then again while it breathes, before any cadence change: no jump": () => {
		// R32 F1: a speed the module stored went stale while the chip had no loops, and the next change re-placed the loop
		// from it. Three routes: Reduced Motion on, the chip missing, and the first run of the session under Reduced Motion.
		const out = [];
		const breathe = (W) => W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 0.5; }, 8000);
		for (const route of ['reduced', 'missing', 'first-run-reduced']) {
			const W = route === 'first-run-reduced' ? world({}) : start({}, false);
			if (route === 'first-run-reduced') { W.set('reduced', true); W.render({ busy: false }); W.render({ busy: true }); W.run(1500); }
			else { W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1.3; }); }
			const k1 = route === 'first-run-reduced' ? 1.6 : 2, k2 = route === 'first-run-reduced' ? 1 : 1;
			if (route === 'reduced') { W.set('reduced', true); W.run(50); W.speed(k1); W.run(50); W.set('reduced', false); W.run(50); }
			if (route === 'missing') { W.set('shown', false); W.run(50); W.speed(k1); W.run(50); W.set('shown', true); W.render({ busy: true }); W.run(50); }
			if (route === 'first-run-reduced') { W.set('reduced', false); W.run(50); }
			breathe(W);
			const i0 = W.frames.length;
			if (route === 'first-run-reduced') W.speed(k1); else W.speed(k2);  // while it breathes, before any cadence change
			W.run(500);
			try {
				assert.equal(W.attrs.get('data-flow'), 'waiting', 'no word: still waiting');
				smooth(W, i0); smooth(W, i0, 'b');
				out.push(`${route}: ok`);
			} catch (e) { out.push(`${route}: FAIL ${e.message.split('\n')[0]}`); }
		}
		assert.ok(out.every((x) => /: ok$/.test(x)), out.join('; '));
		return out.join('; ');
	},
	'a Stop -> Send -> Stop flip inside one task with the loops surviving it: the markup never changes their length (R32 F5)': () => {
		// R32 F5: Stop starting again recomputed the cadence into the markup, so loops that survived a flip inside one task
		// (no style flush between) got the other length from CSS with no re-place
		const W = start({}, false);
		W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1.3; });
		const i0 = W.frames.length;
		W.streams = [{ tid: 'one' }];                                    // a stream is active: Stop starts again "flowing"
		W.render({ busy: false }); W.render({ busy: true });             // one task, no style flush between
		W.run(400);
		smooth(W, i0); smooth(W, i0, 'b');
		assert.equal(W.restarts.filter((r) => r.at > W.frames[i0].t - 1).length, 0, 'the loops survived the flip');
		return `cadence after the flip: ${W.attrs.get('data-flow')}`;
	},
	"Settings' speed changed at the end of a 2.5 s task: placed by the wall clock still (R32 F6)": () => {
		// R32 F6: after a task of 2 s or more the clock choice switched to the timeline's time, from before the task
		const W = start({}, false);
		W.until(() => { const g = W.glyph(); return g && g.place() != null && g.place() >= 1.3; });
		const i0 = W.frames.length;
		W.task(2500, () => W.speed(0.6));
		W.run(400);
		smooth(W, i0); smooth(W, i0, 'b');
		return 'ok';
	},
	'a Settings speed change missed while the chip was missing and unwatched is taken when Stop is shown again (R34 F1)': () => {
		// R34 F1: the quiet timer found no chip and switched the speed listener off; a speed change then was missed, and
		// showing Stop again for the same run put the listener back without reading the speed (3200 ms where 1920 is due)
		const W = start({}, true);
		W.run(200);
		W.set('shown', false); W.run(1200);                          // the quiet timer fires with no chip: listener off
		assert.equal(W.api.debug().watching, false, 'unwatched while missing');
		W.speed(0.6);                                                // missed: nobody listens
		W.set('shown', true); W.render({ busy: true });              // Stop again, the same run
		const i0 = W.frames.length;
		W.run(6000);
		assert.equal(pace(W), 1920, `the waiting length at Fast: ${pace(W)}`);
		smooth(W, i0); smooth(W, i0, 'b');
		return `glyph ${pace(W)} ms`;
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
	try { console.log(`PASS ${name}: ${fn()}`); } catch (e) { failed++; console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`); if (process.env.TRACE) console.log(e.stack); }
}
console.log(failed ? `${failed} of ${Object.keys(CASES).length} failed` : `all ${Object.keys(CASES).length} passed`);
process.exit(failed ? 1 : 0);
