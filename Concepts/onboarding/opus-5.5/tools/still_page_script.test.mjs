// src/js/14-shell-still.js, the still page's script, on a stubbed page with a hand-turned clock (no browser).
// Run: node Concepts/onboarding/opus-5.5/tools/still_page_script.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const SRC = readFileSync(fileURLToPath(new URL('../src/js/14-shell-still.js', import.meta.url)), 'utf8');

function makePage({ search = '', reduced = false, sheets = {} } = {}) {
	let now = 0, seq = 0;
	const timers = new Map(), frames = new Map(), listeners = {}, observers = [];
	const attrs = new Map();
	const styleEls = [];
	const html = {
		hasAttribute: (n) => attrs.has(n),
		getAttribute: (n) => (attrs.has(n) ? attrs.get(n) : null),
		setAttribute(n, v) { const had = attrs.get(n); attrs.set(n, String(v)); if (had !== String(v)) notify(n); },
		removeAttribute(n) { if (attrs.delete(n)) notify(n); }
	};
	function notify(name) { for (const o of observers) if (!o.filter || o.filter.includes(name)) o.cb([{ attributeName: name }]); }
	const writes = [];
	const origSet = html.setAttribute, origRemove = html.removeAttribute;
	html.setAttribute = (n, v) => { if (n === 'data-pm-still') writes.push([now, v]); origSet(n, v); };
	html.removeAttribute = (n) => { if (n === 'data-pm-still' && attrs.has(n)) writes.push([now, null]); origRemove(n); };
	const document = {
		documentElement: html,
		head: { appendChild: (el) => { styleEls.push(el); el.isConnected = true; } },
		getElementById: (id) => (sheets[id] ? { sheet: sheets[id] } : null),
		createElement: () => { const rules = []; return { id: '', isConnected: false, sheet: { cssRules: rules, insertRule: (t, i) => { rules.splice(i, 0, t); return i; } } }; }
	};
	const window = {
		location: { search },
		O55: { motion: { reduced: () => reduced } },
		addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
		matchMedia: () => ({ matches: false, addEventListener() {} })
	};
	const ctx = {
		window, document, location: window.location, performance: { now: () => now },
		setTimeout: (fn, ms) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms), fn }); return id; },
		clearTimeout: (id) => timers.delete(id),
		requestAnimationFrame: (fn) => { const id = ++seq; frames.set(id, fn); return id; },
		cancelAnimationFrame: (id) => frames.delete(id),
		MutationObserver: class { constructor(cb) { this.cb = cb; } observe(_el, o) { this.filter = o.attributeFilter; observers.push(this); } },
		Array, Math, Number, Infinity, String, RegExp, Map, Set, Object
	};
	ctx.globalThis = ctx;
	vm.createContext(ctx);
	vm.runInContext(SRC, ctx);
	const api = {
		window, html, writes, styleEls,
		get now() { return now; },
		// time passes: timers due run in order; a frame every 1000/60 ms runs the frame callbacks
		advance(ms) {
			const end = now + ms;
			for (;;) {
				const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
				const nextFrame = Math.ceil((now + 0.001) / (1000 / 60)) * (1000 / 60);
				if (due && due[1].at <= nextFrame) { now = Math.max(now, due[1].at); timers.delete(due[0]); due[1].fn(); continue; }
				if (nextFrame > end) break;
				now = nextFrame;
				const fs = [...frames]; frames.clear();
				for (const [, fn] of fs) fn(now);
			}
			now = end;
		},
		input(type = 'pointermove', trusted = true) { for (const fn of listeners[type] || []) fn({ isTrusted: trusted, type }); },
		tokens: () => (attrs.has('data-pm-still') ? attrs.get('data-pm-still').split(' ').length : 0)
	};
	return api;
}

const tests = {
	'goes still after 20 s without input, one group a frame'() {
		const p = makePage();
		p.advance(19900);
		assert.equal(p.tokens(), 0, 'not before 20 s');
		assert.equal(p.window.PM_STILL.still(), false);
		p.advance(300);
		assert.equal(p.window.PM_STILL.still(), true);
		assert.equal(p.tokens(), 4);
		assert.equal(p.html.getAttribute('data-pm-still'), '1 2 3 4');
		// the first group at the timer (20 s after the input), each next one in a later frame
		const at = p.writes.map(([t]) => t);
		assert.ok(Math.abs(at[0] - 20000) < 1, `first group at ${at[0]} ms`);
		for (let i = 1; i < at.length; i++) assert.ok(at[i] - at[i - 1] >= 1000 / 60 - 1 && at[i] - at[i - 1] <= 1000 / 60 * 1.5, `group ${i + 1} one frame after the last (${(at[i] - at[i - 1]).toFixed(1)} ms)`);
		const steps = p.writes.map(([, v]) => v);
		assert.deepEqual(steps, ['1', '1 2', '1 2 3', '1 2 3 4']);
	},
	'one trusted input wakes it in that event, the rest one a frame'() {
		const p = makePage();
		p.advance(21000);
		assert.equal(p.tokens(), 4);
		p.input('pointermove');
		assert.equal(p.window.PM_STILL.still(), false);
		assert.equal(p.tokens(), 3, 'one group off inside the event');
		p.advance(17); assert.equal(p.tokens(), 2);
		p.advance(17); assert.equal(p.tokens(), 1);
		p.advance(17); assert.equal(p.tokens(), 0);
		assert.equal(p.html.hasAttribute('data-pm-still'), false);
	},
	'an untrusted event does nothing'() {
		const p = makePage();
		p.advance(21000);
		p.input('pointermove', false);
		assert.equal(p.tokens(), 4);
		assert.equal(p.window.PM_STILL.still(), true);
	},
	'every kind of input restarts the wait'() {
		for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart']) {
			const p = makePage();
			p.advance(15000);
			p.input(type);
			p.advance(15000);
			assert.equal(p.tokens(), 0, `${type}: not still 15 s after it`);
			p.advance(5100);
			assert.equal(p.window.PM_STILL.still(), true, `${type}: still 20 s after it`);
		}
	},
	'an input while going still turns it round'() {
		const p = makePage();
		p.advance(20001);
		const at = p.tokens();
		assert.ok(at >= 1 && at < 4);
		p.input('keydown');
		assert.equal(p.tokens(), at - 1);
		p.advance(200);
		assert.equal(p.tokens(), 0);
		p.advance(19000);
		assert.equal(p.tokens(), 0, 'the wait starts again from that input');
	},
	'never under Reduced Motion'() {
		const p = makePage({ reduced: true });
		p.advance(60000);
		assert.equal(p.tokens(), 0);
		assert.equal(p.window.PM_STILL.still(), false);
	},
	'the onboarding window or the tour opening while still wakes it, and it waits while they are open'() {
		for (const attr of ['data-o55-open', 'data-o55-tour']) {
			const p = makePage();
			p.advance(21000);
			p.html.setAttribute(attr, '');
			assert.equal(p.window.PM_STILL.still(), false, `${attr}: woken`);
			p.advance(100);
			assert.equal(p.tokens(), 0);
			p.advance(60000);
			assert.equal(p.tokens(), 0, `${attr}: never still while it is open`);
			p.html.removeAttribute(attr);
			p.advance(21000);
			assert.equal(p.window.PM_STILL.still(), true, `${attr}: still again after it closes, with no input`);
		}
	},
	'test hook ?pm-still=<ms> and ?pm-still=off'() {
		const p = makePage({ search: '?o55=off&pm-still=3000' });
		assert.equal(p.window.PM_STILL.after, 3000);
		p.advance(2900); assert.equal(p.tokens(), 0);
		p.advance(200); assert.ok(p.tokens() >= 1);
		const q = makePage({ search: '?pm-still=off' });
		q.advance(120000);
		assert.equal(q.tokens(), 0);
	},
	'a run-time sheet\'s endless rules are mirrored into group 1 once'() {
		const rule = (sel, anim) => ({ type: 1, selectorText: sel, style: { getPropertyValue: (p) => (p === 'animation' ? anim : '') } });
		const sheet = { cssRules: [rule('[data-pml-run="on"] .pml-k-a .pml-ctl', 'pml-a-c var(--pml-dur) linear var(--pml-delay,0s) infinite var(--pml-ps,running)'), rule('.pml-k-a .pml-ctl', '')] };
		const p = makePage({ sheets: { 'pm-logo-anim': sheet } });
		p.window.PM_STILL_SHEETS = ['pm-logo-anim'];
		p.advance(21000);
		assert.equal(p.window.PM_STILL.mirrored(), 1);
		const written = p.styleEls[0].sheet.cssRules;
		assert.deepEqual(written, ['html[data-pm-still~="1"] [data-pml-run="on"] .pml-k-a .pml-ctl, html[data-pm-still~="1"][data-pml-run="on"] .pml-k-a .pml-ctl { animation-play-state: paused !important; }']);
		p.input(); p.advance(100); p.advance(21000);
		assert.equal(p.window.PM_STILL.mirrored(), 1, 'no rule written twice');
	}
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
	try { fn(); console.log('ok   ' + name); } catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + (e && e.message)); }
}
console.log(failed ? `${failed} failed` : `all ${Object.keys(tests).length} passed`);
process.exit(failed ? 1 : 0);
