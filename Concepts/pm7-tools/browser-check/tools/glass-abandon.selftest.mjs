// glass-lens-rest's abandoned-hold verdict (PM7PERF-GLASSLENS-ABANDON-DEAD, R45 T2), on the reviewer's frames: no browser.
// node tools/glass-abandon.selftest.mjs
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { abandonVerdict, PROBE } from '../checks/glass-lens-rest.check.mjs';

const box = { x: 10, y: 10, w: 80, h: 30 };
// R45 T2: seven abandoned frames over 600 ms, all at the original box, none bent, no held frame. Must fail.
const dead = Array.from({ length: 7 }, (_, i) => ({ t: 1000 + i * 100, ph: 'abandoned', mv: false, bend: false, b: { ...box } }));
const deadV = abandonVerdict(dead, box);
assert.equal(deadV.ok, false, 'seven abandoned frames and no held frame must fail');
assert.equal(deadV.row.abandoned, 7);
assert.equal(deadV.row.backOnChosen, true);

const away = { x: 100, y: 10, w: 80, h: 30 };
const held = Array.from({ length: 3 }, (_, i) => ({ t: 1000 + i * 16, ph: 'held', mv: true, bend: true, b: { ...away } }));
const travel = [
	{ t: 1100, ph: 'abandoned', mv: true, bend: true, b: { x: 60, y: 10, w: 80, h: 30 } },
	{ t: 1200, ph: 'abandoned', mv: true, bend: true, b: { x: 30, y: 10, w: 80, h: 30 } },
];
const rest = Array.from({ length: 8 }, (_, i) => ({ t: 1300 + i * 100, ph: 'abandoned', mv: false, bend: false, b: { ...box } }));
const good = abandonVerdict([...held, ...travel, ...rest], box);
assert.equal(good.ok, true, 'a bent hold off the original box, then a return that rests unbent, passes');
assert.equal(good.row.restBent, 0);
assert.equal(good.row.movingFlat, 0);
assert.equal(good.row.backOnChosen, true);
assert.ok(good.row.restMs >= 400);
console.log('PASS an abandoned hold needs held frames with the bend on, off the original box, then a return that rests');

// The ug1-08b main-page failure read a flat frame after mouse-up with a frame timestamp 86 ms before it.
const raf = [];
const document = new EventTarget();
const lens = { getAnimations: () => [], hasAttribute: () => false, getBoundingClientRect: () => ({ left: 0, top: 0, width: 80, height: 30 }) };
document.querySelectorAll = (selector) => selector === 'i.lg-lens' ? [lens] : [];
const clock = { now: 1200 };
let filter = 'url(#bend)';
const window = {};
runInNewContext(`(${PROBE})()`, {
	window, document, performance: { now: () => clock.now },
	requestAnimationFrame: (callback) => raf.push(callback),
	getComputedStyle: () => ({ backdropFilter: filter })
});
const probe = window.__g;
probe.watch(0);
document.dispatchEvent(new Event('pointerdown'));
clock.now = 1900;
raf.shift()(1900);
clock.now = 2000;
document.dispatchEvent(new Event('pointerup'));
filter = 'saturate(1.1)';
clock.now = 2001;
raf.shift()(1914);
const samples = probe.stop();
assert.equal(samples[0].bend, true);
assert.equal(samples[1].bend, false);
assert.ok(samples[1].t > probe.times().tUp, 'a callback that read the released lens must be outside the hold');
console.log('PASS a late frame callback reads the release on the pointer-event clock');

let animations = [];
lens.getAnimations = () => animations;
lens.classList = { contains: () => false };
lens.closest = () => null;
lens.getAttribute = () => 'lens';
lens.style = { getPropertyValue: () => filter };
lens.getBoundingClientRect = () => ({ left: 0, top: 0, right: 80, bottom: 30, width: 80, height: 30 });
const watchFrame = (callback) => raf.push(callback);
const probeWindow = {};
runInNewContext(`(${PROBE})()`, {
	window: probeWindow, document, performance: { now: () => clock.now }, requestAnimationFrame: watchFrame,
	innerWidth: 1920, innerHeight: 1080,
	getComputedStyle: () => ({ backdropFilter: filter, opacity: 1, visibility: 'visible' })
});
const movementProbe = probeWindow.__g;
const ride = {
	playState: 'running',
	effect: { composite: 'add', getComputedTiming: () => ({ duration: 100 }), getKeyframes: () => [{ translate: '8px' }, { translate: '0px' }] }
};
animations = [ride]; filter = 'url(#bend)';
const restSample = movementProbe.rest(2);
raf.splice(0).forEach((callback) => callback(clock.now));
animations = []; filter = 'saturate(1.1)';
raf.shift()(clock.now + 16);
const observedRest = await restSample;
assert.equal(observedRest.movers, 1, 'a mover in the first rest frame invalidates the entire sample');
assert.equal(observedRest.bent.length, 1, 'the rest read still records the moving lens filter');
assert.equal(observedRest.inline.length, 1, 'the rest read still records the moving lens inline filter');
console.log('PASS transient lens motion and its filter are reported in a rest sample');

movementProbe.watch(0);
document.dispatchEvent(new Event('pointerdown'));
animations = [ride];
raf.shift()(clock.now + 32);
animations = [{ ...ride, effect: { ...ride.effect, composite: 'replace', getKeyframes: () => [{ opacity: 0 }, { opacity: 1 }] } }];
raf.shift()(clock.now + 48);
const motionSamples = movementProbe.stop();
assert.equal(motionSamples[0].ph, 'held');
assert.equal(motionSamples[0].mv, true, 'a short additive translate ride is motion during the hold');
assert.equal(motionSamples[1].mv, false, 'opacity alone is not movement');
console.log('PASS a lens own mirrored movement counts during a hold');
