// F2: run the real send-stop module on a fake clock, including its stylesheet observer.
// Timing inputs are the product's 2200 ms loop / 800 ms delay and Settings' Fast=0.6.
// No browser. Run: node tests/stop-chip-beat-verify.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const ref = process.argv.indexOf('--ref');
const src = ref < 0 ? readFileSync(new URL('../send-stop.js', import.meta.url), 'utf8') : execFileSync('git', ['show', `${process.argv[ref + 1]}:Concepts/chat-assistant-concepts/5.6 Pro/send-stop.js`], { encoding: 'utf8' });

function chip({ change, notify = true, stall = false, cadence = 'flowing' } = {}) {
	let clock = 0, seq = 0, duration = cadence === 'flowing' ? 2200 : 3200, delay = 800, rate = 1, origin = 0, localOrigin = 0;
	const timers = new Map(), observers = [], switches = [], listeners = [];
	const setTimeout = (cb, ms) => { const id = ++seq; timers.set(id, { at: clock + Math.max(0, ms), cb }); return id; };
	const clearTimeout = (id) => timers.delete(id);
	const local = () => localOrigin + (clock - origin) * rate;
	const timing = () => ({ localTime: local(), duration, delay, currentIteration: local() < delay ? null : Math.floor((local() - delay) / duration) });
	const newAnimation = () => ({ animationName: cadence === 'flowing' ? 'ss-breathe' : 'ss-breathe-w', playState: 'running', get playbackRate() { return rate; }, effect: { getComputedTiming: timing } });
	let animation = newAnimation();
	const attrs = new Map();
	const b = {
		getAttribute: (n) => attrs.get(n) ?? null,
		setAttribute: (n, v) => { attrs.set(n, v); if (n === 'data-flow') { const t = timing(); switches.push({ at: clock, to: v, phase: (t.localTime - t.delay) % t.duration, duration }); } },
		querySelector: () => ({ getAnimations: () => [animation] })
	};
	const window = {};
	const document = { head: {}, documentElement: { getAttribute: () => null }, querySelector: () => b, addEventListener: (n) => listeners.push(n) };
	class MutationObserver {
		constructor(cb) { this.cb = cb; observers.push(this); }
		observe() { this.active = true; }
		disconnect() { this.active = false; }
	}
	window.MutationObserver = MutationObserver;
	vm.runInNewContext(src, { window, document, performance: { now: () => clock }, setTimeout, clearTimeout, MutationObserver });
	if (cadence === 'flowing') window.PM56_SENDSTOP.token();
	else for (let at = 1100; at <= 5500; at += 100) setTimeout(() => window.PM56_SENDSTOP.token(), at);
	const html = window.PM56_SENDSTOP.html({ busy: true, text: '', qlen: 0, tid: 'one' });
	for (const m of html.matchAll(/(data-[\w-]+)="([^"]*)"/g)) attrs.set(m[1], m[2]);
	let changed = false, stalled = false;
	for (let guard = 0; guard < 100 && switches.length === 0; guard++) {
		const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
		if (!next) break;
		if (change && !changed && next[1].at >= 1000) {
			clock = 1000; changed = true;
			if (change === 'fast') duration = cadence === 'flowing' ? 1320 : 1920;
			if (change === 'slow') duration = 3520;
			if (change === 'delay') delay = 1200;
			if (change === 'rate') { localOrigin = local(); origin = clock; rate = 2; }
			if (change === 'identity') animation = newAnimation();
			if (notify) for (const o of observers) if (o.active) o.cb([{ target: { id: 'o55-look-scale' }, addedNodes: [], removedNodes: [] }]);
			continue;
		}
		timers.delete(next[0]);
		clock = next[1].at;
		if (stall && !stalled && clock >= 2900) { clock = 3500; stalled = true; }
		next[1].cb();
	}
	assert.ok(!listeners.includes('animationiteration'), 'no document iteration listener');
	assert.equal(switches.length, 1, 'one cadence change');
	return switches[0];
}
// R5-F1 (the recheck of c7fc6dd7a3; the defect is ae047049eb's): a Stop chip shown again while the LAST chip's boundary
// timer is still pending must start its own timer. Run 1 is Stop and waiting from t=0 with no word (3200 ms loop, 800 ms
// delay): at its boundary A = 4000 its timer is armed for A + 3204. Run 1 ends at A + 20 and run 2 starts `gap` ms later
// (M) with one word, so its chip is flowing (2200 ms loop, first boundary M + 3000) and, with no more words, must turn
// to waiting AT that boundary, as main's animationiteration did. With the old timer kept, a start before A + 204 was
// first looked at after that boundary and the change came one loop (2200 ms) late.
function relay(gap) {
	let clock = 0, seq = 0;
	const timers = new Map(), switches = [], attrs = new Map(), listeners = [];
	const setTimeout = (cb, ms) => { const id = ++seq; timers.set(id, { at: clock + Math.max(0, ms), cb }); return id; };
	const clearTimeout = (id) => timers.delete(id);
	const anim = (name, duration, origin) => ({ animationName: name, playState: 'running', playbackRate: 1, origin, duration,
		effect: { getComputedTiming: () => { const lt = clock - origin; return { localTime: lt, duration, delay: 800, currentIteration: lt < 800 ? null : Math.floor((lt - 800) / duration) }; } } });
	let animation = anim('ss-breathe-w', 3200, 0);
	const b = {
		getAttribute: (n) => attrs.get(n) ?? null,
		setAttribute: (n, v) => { attrs.set(n, v); if (n === 'data-flow') switches.push({ at: clock, to: v, phase: (clock - animation.origin - 800) % animation.duration }); },
		querySelector: () => ({ getAnimations: () => [animation] })
	};
	const window = {};
	const document = { head: {}, documentElement: { getAttribute: () => null }, querySelector: () => b, addEventListener: (n) => listeners.push(n) };
	class MutationObserver { constructor(cb) { this.cb = cb; } observe() { this.active = true; } disconnect() { this.active = false; } }
	window.MutationObserver = MutationObserver;
	vm.runInNewContext(src, { window, document, performance: { now: () => clock }, setTimeout, clearTimeout, MutationObserver });
	const api = window.PM56_SENDSTOP;
	const render = (o) => { for (const m of api.html(o).matchAll(/(data-[\w-]+)="([^"]*)"/g)) attrs.set(m[1], m[2]); };
	const A = 4000, E = A + 20, M = E + gap, events = [
		[E, () => render({ busy: false, text: '', qlen: 0, tid: 'one' })],
		[M, () => { api.token(); animation = anim('ss-breathe', 2200, M); render({ busy: true, text: '', qlen: 0, tid: 'one' }); }]
	];
	render({ busy: true, text: '', qlen: 0, tid: 'one' });
	assert.equal(attrs.get('data-flow'), 'waiting', 'run 1 starts waiting');
	for (let guard = 0; guard < 200; guard++) {
		const next = [...timers].sort((x, y) => x[1].at - y[1].at)[0], ev = events[0];
		if (ev && (!next || ev[0] <= next[1].at)) { events.shift(); clock = ev[0]; ev[1](); continue; }
		if (!next || next[1].at > M + 9000) break;
		timers.delete(next[0]); clock = next[1].at; next[1].cb();
		if (switches.some((x) => x.at > M)) break;
	}
	assert.ok(!listeners.includes('animationiteration'), 'no document iteration listener');
	const after = switches.filter((x) => x.at > M);
	assert.equal(switches.length - after.length, 0, 'run 1, waiting with no word, never changes cadence');
	assert.equal(after.length, 1, 'run 2 changes cadence once');
	return { M, ...after[0] };
}
let failed = 0;
const cases = [
	['unchanged timing', {}, 3000],
	['Fast at t=1000 (R4 trigger)', { change: 'fast' }, 2120],
	['waiting Fast at t=1000 with words arriving (browser path)', { change: 'fast', cadence: 'waiting' }, 2720],
	['Cinematic at t=1000', { change: 'slow' }, 4320],
	['delay changes at t=1000', { change: 'delay' }, 3400],
	['playback rate doubles at t=1000', { change: 'rate' }, 2000],
	['animation identity changes', { change: 'identity' }, 3000],
	['unannounced duration change cannot switch mid-loop', { change: 'fast', notify: false }, 3440],
	['late timer cannot switch mid-loop', { stall: true }, 5200]
];
for (const [name, options, boundary] of cases) {
	try {
		const got = chip(options);
		console.log(`${got.at >= boundary && got.at <= boundary + 16 && got.phase <= 32 ? 'PASS' : 'FAIL'} ${name}: ${JSON.stringify(got)}; boundary ${boundary} ms`);
		assert.ok(got.at >= boundary && got.at <= boundary + 16, `change at ${got.at}, expected boundary ${boundary} (+<=16 ms)`);
		assert.ok(got.phase >= 0 && got.phase <= 32, `phase ${got.phase} ms`);
	} catch (e) { failed++; console.log(`FAIL ${name}: ${e.message}`); }
}
const relays = [[20, 'the old timer is due after the new chip\'s first boundary'], [96, 'the same'], [150, 'the same'], [300, 'control: the old timer is due before that boundary']];
for (const [gap, why] of relays) {
	const name = `a second run ${gap} ms after the first ends (${why})`;
	try {
		const got = relay(gap), boundary = got.M + 3000;
		console.log(`${got.to === 'waiting' && got.at >= boundary && got.at <= boundary + 16 && got.phase <= 32 ? 'PASS' : 'FAIL'} ${name}: ${JSON.stringify(got)}; boundary ${boundary} ms`);
		assert.equal(got.to, 'waiting');
		assert.ok(got.at >= boundary && got.at <= boundary + 16, `change at ${got.at}, expected the new chip's first boundary ${boundary} (+<=16 ms)`);
		assert.ok(got.phase >= 0 && got.phase <= 32, `phase ${got.phase} ms`);
	} catch (e) { failed++; console.log(`FAIL ${name}: ${e.message}`); }
}
console.log(`${cases.length + relays.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
