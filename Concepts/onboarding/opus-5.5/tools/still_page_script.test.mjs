// src/js/14-shell-still.js, the still page's script, on a stubbed page with a hand-turned clock (no browser): when the
// page goes still and wakes, which elements it marks for css/21-shell-still.css, and what it leaves alone.
// Run: node Concepts/onboarding/opus-5.5/tools/still_page_script.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const SRC = readFileSync(fileURLToPath(new URL('../src/js/14-shell-still.js', import.meta.url)), 'utf8');

function makePage({ search = '', reduced = false } = {}) {
	let now = 0, seq = 0;
	const timers = new Map(), listeners = {}, observers = [];
	class CSSAnimation { constructor(o) { Object.assign(this, o); } }
	const animations = [];
	const attrsOf = (map, notify) => ({
		hasAttribute: (n) => map.has(n),
		getAttribute: (n) => (map.has(n) ? map.get(n) : null),
		setAttribute(n, v) { const had = map.get(n); map.set(n, String(v)); if (notify && had !== String(v)) notify(n); },
		removeAttribute(n) { if (map.delete(n) && notify) notify(n); }
	});
	const htmlAttrs = new Map();
	const notify = (name, target = html) => { for (const o of observers) if (o.on !== false && (!o.filter || o.filter.includes(name))) o.cb([{ attributeName: name, target }]); };
	const html = attrsOf(htmlAttrs, notify);
	const document = { documentElement: html };
	const elements = [];
	const el = (name, { inWindow = false, shadow = false } = {}) => {
		const e = { nodeType: 1, name, ...attrsOf(new Map()), getRootNode: () => (shadow ? {} : document), closest: () => (inWindow ? {} : null),
			getAnimations: () => animations.filter((a) => a.effect.target === e) };
		elements.push(e);
		return e;
	};
	const anim = (target, { name = 'loop', endless = true, pseudo = null, css = true, state = 'running' } = {}) => {
		const o = { animationName: name, playState: state, effect: { target, pseudoElement: pseudo, getTiming: () => ({ iterations: endless ? Infinity : 1 }) } };
		const a = css ? new CSSAnimation(o) : o;
		animations.push(a);
		return a;
	};
	document.getAnimations = () => animations.slice();
	document.querySelectorAll = (sel) => (sel === '[data-pm-held]' ? elements.filter((e) => e.hasAttribute('data-pm-held')) : []);
	const window = {
		location: { search }, CSSAnimation,
		O55: { motion: { reduced: () => reduced } },
		addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
		matchMedia: () => ({ matches: false, addEventListener() {} }),
		requestIdleCallback: (fn) => { const id = ++seq; timers.set(id, { at: now + 50, fn }); return id; }
	};
	const ctx = {
		window, document, location: window.location, performance: { now: () => now },
		setTimeout: (fn, ms) => { const id = ++seq; timers.set(id, { at: now + Math.max(0, ms), fn }); return id; },
		clearTimeout: (id) => timers.delete(id),
		MutationObserver: class { constructor(cb) { this.cb = cb; } observe(_el, o) { this.filter = o.attributeFilter; this.on = true; if (!observers.includes(this)) observers.push(this); } disconnect() { this.on = false; } takeRecords() { return []; } },
		Array, Math, Number, Infinity, String, RegExp, Map, Set, Object
	};
	ctx.globalThis = ctx;
	vm.createContext(ctx);
	vm.runInContext(SRC, ctx);
	return {
		window, html, el, anim, animations,
		advance(ms) {
			const end = now + ms;
			for (;;) {
				const due = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
				if (!due) break;
				now = Math.max(now, due[1].at); timers.delete(due[0]); due[1].fn();
			}
			now = end;
		},
		input(type = 'pointermove', trusted = true) { for (const fn of listeners[type] || []) fn({ isTrusted: trusted, type }); },
		fire(type, target, animationName, pseudoElement = '') { for (const fn of listeners[type] || []) fn({ type, target, animationName, pseudoElement }); },
		held: (e) => e.getAttribute('data-pm-held'),
		// another renderer patches an element in place and drops the attributes it did not write
		strip(e) { e.removeAttribute('data-pm-held'); notify('data-pm-held', e); }
	};
}

const tests = {
	'goes still after 20 s without input and marks exactly the endless CSS loops'() {
		const p = makePage();
		const glyph = p.el('glyph'), ring = p.el('ring'), pulse = p.el('pulse'), entrance = p.el('entrance'), scripted = p.el('scripted'), win = p.el('stage', { inWindow: true }), caret = p.el('caret', { shadow: true }), paused = p.el('paused');
		p.anim(glyph); p.anim(ring); p.anim(pulse, { pseudo: '::before' }); p.anim(entrance, { endless: false });
		p.anim(scripted, { css: false }); p.anim(win); p.anim(caret); p.anim(paused, { state: 'paused' });
		p.advance(19900);
		assert.equal(p.window.PM_STILL.still(), false);
		assert.equal(p.held(glyph), null, 'nothing before 20 s');
		p.advance(200);
		assert.equal(p.window.PM_STILL.still(), true);
		assert.equal(p.html.hasAttribute('data-pm-still'), true);
		assert.equal(p.held(glyph), 'self');
		assert.equal(p.held(ring), 'self');
		assert.equal(p.held(pulse), 'before', 'a pseudo-element loop marks its element with the pseudo-element');
		for (const [e, why] of [[entrance, 'a finite animation'], [scripted, 'a script animation'], [win, 'the onboarding window'], [caret, 'a shadow root'], [paused, 'a loop already held by the page']]) assert.equal(p.held(e), null, why);
		assert.equal(p.window.PM_STILL.held(), 3);
	},
	'one trusted input wakes it in that event and lets every mark go'() {
		const p = makePage();
		const a = p.el('a'), b = p.el('b');
		p.anim(a); p.anim(b, { pseudo: '::after' });
		p.advance(21000);
		assert.equal(p.held(a), 'self');
		p.input('pointermove');
		assert.equal(p.window.PM_STILL.still(), false);
		assert.equal(p.html.hasAttribute('data-pm-still'), false);
		assert.equal(p.held(a), null);
		assert.equal(p.held(b), null);
		assert.equal(p.window.PM_STILL.held(), 0);
	},
	'an untrusted event does nothing; every kind of input restarts the wait'() {
		const p = makePage();
		p.anim(p.el('a'));
		p.advance(21000);
		p.input('pointermove', false);
		assert.equal(p.window.PM_STILL.still(), true);
		for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart']) {
			const q = makePage();
			q.advance(15000); q.input(type); q.advance(15000);
			assert.equal(q.window.PM_STILL.still(), false, `${type}: not still 15 s after it`);
			q.advance(5100);
			assert.equal(q.window.PM_STILL.still(), true, `${type}: still 20 s after it`);
		}
	},
	'an element running a finite animation is marked only once it has ended'() {
		const p = makePage();
		const e = p.el('row');
		p.anim(e); const one = p.anim(e, { name: 'enter', endless: false });
		p.advance(21000);
		assert.equal(p.held(e), null, 'its entrance is running: not marked');
		one.playState = 'finished';
		p.advance(4100);
		assert.equal(p.held(e), 'self', 'marked at the next look');
	},
	'a transition running on an element never delays its mark (the play state does not reach transitions)'() {
		const p = makePage();
		p.advance(21000);
		const item = p.el('item');
		p.anim(item, { name: 'breathe' }); p.anim(item, { name: 'color', endless: false, css: false });
		p.fire('animationstart', item, 'breathe');
		assert.equal(p.held(item), 'self');
	},
	'a loop that starts while still is marked; a one-shot starting on a marked element lets it go'() {
		const p = makePage();
		p.advance(21000);
		const loader = p.el('loader');
		p.anim(loader, { name: 'spin' });
		p.fire('animationstart', loader, 'spin');
		assert.equal(p.held(loader), 'self');
		p.anim(loader, { name: 'done', endless: false });
		p.fire('animationstart', loader, 'done');
		assert.equal(p.held(loader), null, 'the one-shot plays');
		const gone = p.el('gone'); const g = p.anim(gone); p.advance(4100);
		assert.equal(p.held(gone), 'self');
		g.playState = 'idle'; p.fire('animationcancel', gone, 'loop');
		assert.equal(p.held(gone), null, 'its loop was cancelled: let go');
	},
	'a loop the page lets run while still (a hidden row shown) is marked at the next look'() {
		const p = makePage();
		const row = p.el('row'); const a = p.anim(row, { state: 'paused' });
		p.advance(21000);
		assert.equal(p.held(row), null);
		a.playState = 'running';
		p.advance(4100);
		assert.equal(p.held(row), 'self');
	},
	'never under Reduced Motion'() {
		const p = makePage({ reduced: true });
		const e = p.el('a'); p.anim(e);
		p.advance(60000);
		assert.equal(p.window.PM_STILL.still(), false);
		assert.equal(p.held(e), null);
	},
	'the onboarding window or the tour opening while still wakes it, and it waits while they are open'() {
		for (const attr of ['data-o55-open', 'data-o55-tour']) {
			const p = makePage();
			const e = p.el('a'); p.anim(e);
			p.advance(21000);
			p.html.setAttribute(attr, '');
			assert.equal(p.window.PM_STILL.still(), false, `${attr}: woken`);
			assert.equal(p.held(e), null);
			p.advance(60000);
			assert.equal(p.window.PM_STILL.still(), false, `${attr}: never still while it is open`);
			p.html.removeAttribute(attr);
			p.advance(21000);
			assert.equal(p.window.PM_STILL.still(), true, `${attr}: still again after it closes, with no input`);
		}
	},
	'a copy of a marked element made while still is let go after the wake'() {
		const p = makePage();
		const e = p.el('a'); p.anim(e);
		p.advance(21000);
		const copy = p.el('copy'); copy.setAttribute('data-pm-held', 'self');
		p.input();
		assert.equal(copy.getAttribute('data-pm-held'), 'self');
		p.advance(100);
		assert.equal(copy.getAttribute('data-pm-held'), null);
	},
	'a mark a renderer takes away while still is put back at once; after the wake nothing is put back'() {
		const p = makePage();
		const g = p.el('glyph'); p.anim(g);
		p.advance(21000);
		assert.equal(p.held(g), 'self');
		p.strip(g);
		assert.equal(p.held(g), 'self', 'put back in the same turn');
		p.input();
		assert.equal(p.held(g), null);
		p.strip(g);
		assert.equal(p.held(g), null, 'awake: the observer is off');
	},
	'test hook ?pm-still=<ms> and ?pm-still=off'() {
		const p = makePage({ search: '?o55=off&pm-still=3000' });
		assert.equal(p.window.PM_STILL.after, 3000);
		p.advance(2900); assert.equal(p.window.PM_STILL.still(), false);
		p.advance(200); assert.equal(p.window.PM_STILL.still(), true);
		const q = makePage({ search: '?pm-still=off' });
		q.advance(120000);
		assert.equal(q.window.PM_STILL.still(), false);
	}
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
	try { fn(); console.log('ok   ' + name); } catch (e) { failed++; console.log('FAIL ' + name + '\n     ' + (e && e.message)); }
}
console.log(failed ? `${failed} failed` : `all ${Object.keys(tests).length} passed`);
process.exit(failed ? 1 : 0);
