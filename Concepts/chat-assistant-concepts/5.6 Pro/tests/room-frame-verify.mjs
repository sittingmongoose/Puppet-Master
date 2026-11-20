// F3: play the real room scheduler with an expiring hold at 60 Hz, without a browser.
// --ref origin/main runs the identical fixture against main for the follow-call control.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const path = 'Concepts/chat-assistant-concepts/5.6 Pro/turn-stream.js';
const ref = process.argv.indexOf('--ref');
const src = ref < 0 ? readFileSync(new URL('../turn-stream.js', import.meta.url), 'utf8') : execFileSync('git', ['show', `${process.argv[ref + 1]}:${path}`], { encoding: 'utf8' });
function fn(name, optional = false) {
	const head = `function ${name}(`, i = src.indexOf(head);
	if (i < 0 && optional) return '';
	assert.ok(i >= 0 && src.indexOf(head, i + 1) < 0, `exactly one ${name}`);
	let depth = 0, end = src.indexOf('{', i);
	for (; end < src.length; end++) { if (src[end] === '{') depth++; else if (src[end] === '}' && --depth === 0) break; }
	return src.slice(i, end + 1);
}
const code = ['releaseRoom', 'roomTick', 'roomFrame', 'critStep', 'dropRoom'].map((n) => fn(n)).join('\n') + '\n' + fn('wakeRoom', true);
let failed = 0;
// R5-F3 (the recheck of 034a0616f3; the defect is 2abe397798's): `tall` plays a hold that expires in the frame in which
// the content already reaches the floor (natural height 500 over the 400 floor), so the room is dropped in that same
// frame. The wake that releaseRoom queued a moment earlier must not outlive the room: one frame runs, as on main, not two.
for (const afterLayout of [false, true]) for (const [external, tall] of [[false, false], [true, false], [false, true]]) {
	let clock = 0, seq = 0, calls = 0, peak = 0, ran = 0;
	const pending = new Map(), after = [], floors = [];
	const inner = {}, room = { inner, on: true, rel: false, transient: true, relAt: 0, h0: 400, floorW: 400, floorAt: 400, x: null, v: 0, raf: 0, last: 0, own: 0, keep: 0 };
	const requestAnimationFrame = (cb) => { const id = ++seq; pending.set(id, cb); peak = Math.max(peak, pending.size); return id; };
	const window = afterLayout ? { PM_AFTER_LAYOUT: (cb) => after.push(cb) } : {};
	const cancelAnimationFrame = (id) => { pending.delete(id); };
	const make = new Function('window', 'room', 'rest', 'requestAnimationFrame', 'cancelAnimationFrame', 'now', 'roomInner', 'naturalH', 'roomFloor', 'runHoldsRoom', 'roomQuiet', 'reduced', 'C', 'openedH', `
		const SHRINK_HOLD=700, RUN_ROOM_MAX=100, SHRINK_VMAX=200, CLOSE_STEP=10, roomSeen=null, kidRO=null;
		${code}\nreturn {releaseRoom, roomTick};`);
	const app = make(window, room, { on: false }, requestAnimationFrame, cancelAnimationFrame, () => clock, () => inner, () => (tall ? 500 : 100), (h) => { room.floorW = h; floors.push(h); }, () => false, () => false, () => false, () => ({ followIfSticky: () => calls++ }), () => 0);
	if (external) { app.releaseRoom(); app.releaseRoom(); }
	// main's release didn't wake the sleeping loop; it already kept a frame pending.
	if (!room.raf) room.raf = requestAnimationFrame(app.roomTick);
	for (let frame = 0; frame < 16; frame++) {
		clock = frame * 1000 / 60;
		const batch = [...pending];
		for (const [id] of batch) pending.delete(id);
		for (const [, cb] of batch) { ran++; cb(clock); }
		while (after.length) after.shift()();
	}
	if (tall) {
		const d = `${afterLayout ? 'after-layout' : 'standalone'}, hold expiry with the content already at the floor: ${ran} frames run, ${pending.size} left pending, room ${room.on ? 'on' : 'dropped'}, ${calls} follow calls (expected 1 frame, 0 pending, dropped, 1 call)`;
		try {
			assert.equal(room.on, false); assert.equal(ran, 1); assert.equal(pending.size, 0); assert.equal(room.raf, 0); assert.equal(calls, 1);
			console.log(`PASS ${d}`);
		} catch (e) { failed++; console.log(`FAIL ${d}: ${e.message}`); }
		continue;
	}
	const detail = `${afterLayout ? 'after-layout' : 'standalone'}, ${external ? 'external release' : 'hold expiry'}: peak ${peak} pending, ${calls} follow calls (expected 1 / 16)`;
	try {
		assert.equal(peak, 1);
		assert.equal(calls, 16);
		assert.ok(floors.length > 1 && floors.at(-1) < floors[0] && floors.at(-1) > 100, 'release spring progresses');
		console.log(`PASS ${detail}`);
	} catch (e) { failed++; console.log(`FAIL ${detail}: ${e.message}`); }
}
console.log(`${6 - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
