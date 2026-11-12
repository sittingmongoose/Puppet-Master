// Test the real hold helper and its use at both measurement sites.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../checks/perf-hover-restyle.check.mjs', import.meta.url), 'utf8');
assert.match(source, /withAnimationHold/, 'measured hover and press windows must exclude existing animation work');
const { withAnimationHold } = await import('../helpers/animation-hold.mjs');
const calls = [];
const cdp = { async send(name, args) { calls.push([name, args]); return name === 'Animation.getPlaybackRate' ? { playbackRate: 1 } : {}; } };
const frame = { async waitForTimeout(ms) { calls.push(['settle', ms]); } };
const value = await withAnimationHold(cdp, frame, async () => { calls.push(['measure']); return 42; });
assert.equal(value, 42);
assert.deepEqual(calls.map((x) => x[0]), ['Animation.enable', 'Animation.getPlaybackRate', 'Animation.setPlaybackRate', 'settle', 'measure', 'Animation.setPlaybackRate', 'Animation.disable']);
assert.deepEqual(calls.filter((x) => x[0] === 'Animation.setPlaybackRate').map((x) => x[1].playbackRate), [0, 1]);
calls.length = 0;
await assert.rejects(withAnimationHold(cdp, frame, async () => { throw new Error('input failed'); }), /input failed/);
assert.deepEqual(calls.slice(-2), [['Animation.setPlaybackRate', { playbackRate: 1 }], ['Animation.disable', undefined]], 'a failed input also restores playback and disables the domain');
assert.equal((source.match(/withAnimationHold\(animationCdp, f,/g) || []).length, 2, 'hover/tab/notice and press both hold');
assert.equal((source.match(/const animationCdp = await t.page.context\(\).newCDPSession\(f\)/g) || []).length, 2, 'both holds target the app frame, including an opaque OOPIF');
assert.doesNotMatch(readFileSync(new URL('../helpers/animation-hold.mjs', import.meta.url), 'utf8'), /\.pause\(|\.play\(/, 'the hold must not change WAAPI play state');
// A broad hover's measured subtree must retain its full count while the actual hold wrapper is active.
// Synthetic trace input, not a substitute for the browser CSS trial: it catches accidental subtraction/clamping.
const start = source.indexOf('function restyled('), end = source.indexOf('// in the page: mark', start);
const { restyled, median } = new Function(source.slice(start, end) + '\nreturn { restyled, median };')();
const bounds = new Function(source.match(/const BOUND = \{[^;]+;/)[0] + '\nreturn BOUND;')();
assert.deepEqual(bounds, { usage: 190, files: 160, rail: 180, titlebar: 180, tab: 400, notify: 300, press: 150 }, 'no budget changes');
const events = Array.from({ length: 4 }, (_, i) => [
 { cat: 'blink.user_timing', name: `jr:subtree:${i}`, ts: i * 100000, pid: 1, tid: 1 },
 { name: 'UpdateLayoutTree', ph: 'X', ts: i * 100000 + 1000, dur: 1000, pid: 1, tid: 1, args: { elementCount: 640 } }
]).flat();
calls.length = 0;
const subtreeMedian = await withAnimationHold(cdp, frame, async () => {
 assert.equal(calls.filter((x) => x[0] === 'Animation.setPlaybackRate').at(-1)[1].playbackRate, 0);
 return median(restyled(events, 'jr:subtree:'), 4);
});
assert.equal(subtreeMedian, 640);
assert.ok(subtreeMedian >= bounds.usage, 'a broad measured subtree still fails while the hold is on');
console.log('PASS actual measurement sites hold through CDP, restore on success/failure, and never override WAAPI play state');
console.log('PASS held-window subtree negative retains median 640 against unchanged Usage bound 190 (synthetic trace)');
