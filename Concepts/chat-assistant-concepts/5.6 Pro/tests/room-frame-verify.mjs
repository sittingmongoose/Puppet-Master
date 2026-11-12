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
const code = ['releaseRoom', 'roomTick', 'roomFrame', 'critStep'].map((n) => fn(n)).join('\n') + '\n' + fn('wakeRoom', true);
let failed = 0;
for (const afterLayout of [false, true]) for (const external of [false, true]) {
	let clock = 0, seq = 0, calls = 0, peak = 0;
	const pending = new Map(), after = [], floors = [];
	const inner = {}, room = { inner, on: true, rel: false, transient: true, relAt: 0, h0: 400, floorW: 400, floorAt: 400, x: null, v: 0, raf: 0, last: 0, own: 0, keep: 0 };
	const requestAnimationFrame = (cb) => { const id = ++seq; pending.set(id, cb); peak = Math.max(peak, pending.size); return id; };
	const window = afterLayout ? { PM_AFTER_LAYOUT: (cb) => after.push(cb) } : {};
	const make = new Function('window', 'room', 'rest', 'requestAnimationFrame', 'now', 'roomInner', 'naturalH', 'roomFloor', 'dropRoom', 'runHoldsRoom', 'roomQuiet', 'reduced', 'C', 'openedH', `
		const SHRINK_HOLD=700, RUN_ROOM_MAX=100, SHRINK_VMAX=200, CLOSE_STEP=10, roomSeen=null, kidRO=null;
		${code}\nreturn {releaseRoom, roomTick};`);
	const app = make(window, room, { on: false }, requestAnimationFrame, () => clock, () => inner, () => 100, (h) => { room.floorW = h; floors.push(h); }, () => { room.on = false; }, () => false, () => false, () => false, () => ({ followIfSticky: () => calls++ }), () => 0);
	if (external) { app.releaseRoom(); app.releaseRoom(); }
	// main's release didn't wake the sleeping loop; it already kept a frame pending.
	if (!room.raf) room.raf = requestAnimationFrame(app.roomTick);
	for (let frame = 0; frame < 16; frame++) {
		clock = frame * 1000 / 60;
		const batch = [...pending];
		for (const [id] of batch) pending.delete(id);
		for (const [, cb] of batch) cb(clock);
		while (after.length) after.shift()();
	}
	const detail = `${afterLayout ? 'after-layout' : 'standalone'}, ${external ? 'external release' : 'hold expiry'}: peak ${peak} pending, ${calls} follow calls (expected 1 / 16)`;
	try {
		assert.equal(peak, 1);
		assert.equal(calls, 16);
		assert.ok(floors.length > 1 && floors.at(-1) < floors[0] && floors.at(-1) > 100, 'release spring progresses');
		console.log(`PASS ${detail}`);
	} catch (e) { failed++; console.log(`FAIL ${detail}: ${e.message}`); }
}
console.log(`${4 - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
