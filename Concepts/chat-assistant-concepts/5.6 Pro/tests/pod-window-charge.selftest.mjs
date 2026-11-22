// R133-FOLLOWUPS 5 (T92): neon-verify's rolling above-target window charged a whole observer gap to the last
// above-target sample. If the last sampled overlap is above target and the observer next runs 650 ms later, the
// product's compositor fade may have completed inside that gap: a correct page can hit the 610 ms window bound
// without having painted that exposure. The charge must end when the shy fade reached its target (shyAt + shyFade),
// not at the next sample. neon-verify.mjs is a CLI (playwright import runs it), so the pure charge function is
// extracted from its source and run here; the page tick mirrors it inline.
// node "Concepts/chat-assistant-concepts/5.6 Pro/tests/pod-window-charge.selftest.mjs"
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';

const src = readFileSync(fileURLToPath(new URL('../neon-verify.mjs', import.meta.url)), 'utf8');
const m = src.match(/export function podWindowCharge\([\s\S]*?\n}/);
assert.ok(m, 'neon-verify exports podWindowCharge (the base charged the whole gap to the last above-target sample)');
const fn = runInNewContext('(' + m[0].replace('export ', '') + ')', {});
const charge = (o) => { const r = fn(o); return r ? Array.from(r) : null; };

// an ordinary frame: the sampled state covers the interval until the next frame
assert.deepEqual(charge({ wasOpaque: true, dt: 16, now: 1000, shy: false, shyAt: null, shyFade: null }), [984, 1000]);
// no above-target sample, or no interval: nothing charged
assert.equal(charge({ wasOpaque: false, dt: 16, now: 1000, shy: false, shyAt: null, shyFade: null }), null);
assert.equal(charge({ wasOpaque: true, dt: 0, now: 1000, shy: false, shyAt: null, shyFade: null }), null);
// a long gap with no shy fade: the Pod stayed opaque, the whole interval is real exposure
assert.deepEqual(charge({ wasOpaque: true, dt: 650, now: 1000, shy: false, shyAt: null, shyFade: null }), [350, 1000]);
// T92: the last sample at 350 was above target; data-shy went on at 360 with a 150 ms fade (complete at 510);
// the observer next runs at 1000. The charge is the 160 ms actually above target, not the 650 ms gap.
assert.deepEqual(charge({ wasOpaque: true, dt: 650, now: 1000, shy: true, shyAt: 360, shyFade: 150 }), [350, 510]);
// the fade still running at the next sample: the interval up to now is charged (conservative)
assert.deepEqual(charge({ wasOpaque: true, dt: 650, now: 1000, shy: true, shyAt: 900, shyFade: 150 }), [350, 1000]);
// a fade that reached its target before the interval began charges nothing
assert.equal(charge({ wasOpaque: true, dt: 650, now: 1000, shy: true, shyAt: 100, shyFade: 150 }), null);
console.log('PASS pod window charge: an ordinary frame and a no-fade gap charge their full interval; a 650 ms observer gap whose shy fade completed inside it charges only the time actually above target (160 ms, not 650)');
