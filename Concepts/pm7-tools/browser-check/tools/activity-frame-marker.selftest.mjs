// Contract tests for helpers/activity-frame-marker.mjs (PM7PERF-SHIFTTAB-PREKEY-SCREENCAST, TB9 round 2): no browser,
// no film. The in-page counter and its capture-phase keydown are exercised by the check's own runs on the Mac.
// Run: node tools/activity-frame-marker.selftest.mjs [helper.mjs]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { MARKER_BOX, COUNTER_BITS, markerReading, keyFrames, handoverFault, whole } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/activity-frame-marker.mjs');

const box = { x: 10, y: 10, width: 108, height: 14 };
const WHITE = [255, 255, 255], BLACK = [0, 0, 0], GREY = [128, 128, 128];
const bandW = box.width / 9;
function image(fill, bands = null, key = BLACK, bx = box) {
  const width = 140, height = 40, data = Buffer.alloc(width * height * 4, 255), bw = bx.width / 9;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let c = fill;
    if (bands && x >= bx.x && x < bx.x + bx.width && y >= bx.y && y < bx.y + bx.height) c = x >= bx.x + 8 * bw ? key : bands[Math.floor((x - bx.x) / bw)];
    const i = 4 * (y * width + x);
    data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
  }
  return { width, height, data };
}
const painted = n => Array.from({ length: COUNTER_BITS }, (_, b) => ((n >> b) & 1 ? WHITE : BLACK));
let checks = 0;
const ax = (cond, msg) => { assert.ok(cond, msg); checks++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); checks++; };
const sides = (v) => ({ top: { share: v, median: 9 }, bottom: { share: v, median: 9 }, left: { share: v, median: 9 }, right: { share: v, median: 9 } });

// the counter a frame paints: one bit per band, band 0 the low bit, white 1 and black 0; the last band is the key
for (const n of [0, 1, 2, 5, 0b10101010, 255, 173]) eq(markerReading(image(GREY, painted(n)), box), { count: n, key: 0 }, `counter ${n} round-trips`);
eq(markerReading(image(GREY, painted(0), WHITE), box), { count: 0, key: 1 }, 'the key band reads white');
eq(markerReading(image(GREY, painted(255), WHITE), box), { count: 255, key: 1 }, 'all white reads 255 with the key band');
ax(COUNTER_BITS === 8 && bandW >= 10, 'the bands are wide enough for a frame counter');
// a band that is neither ink is unreadable, never a bit
const mid = painted(9); mid[3] = GREY;
eq(markerReading(image(GREY, mid), box), null, 'a middle-luminance counter band makes the frame unreadable');
eq(markerReading(image(GREY, painted(9), GREY), box), null, 'an unreadable key band makes the frame unreadable');
const pale = painted(9); pale[0] = [200, 200, 200];
eq(markerReading(image(GREY, pale), box).count, 9 | 1, 'a pale band above the white threshold reads 1');
// a capture scaled by maxWidth/maxHeight: the bands scale with the box (the key band is box.width / 9, not a fixed 12 px)
const half = { x: 10, y: 10, width: 54, height: 7 };
eq(markerReading(image(GREY, painted(9), WHITE, half), half), { count: 9, key: 1 }, 'a half-scale strip decodes');
eq(markerReading(image(GREY, painted(9), WHITE, half), box), null, 'the full-scale box on a half-scale strip is unreadable');
// outside the strip is not the marker
eq(markerReading(image(GREY), box), null, 'flat grey is not a counter');
eq(markerReading({ width: 20, height: 8, data: Buffer.alloc(20 * 8 * 4, 255) }, box), null, 'a frame that ends above the marker is unreadable');
// only band middles are read: the strip's edges stay the page's own
const edges = image(GREY, painted(0b01010101));
for (const [x, y] of [[10, 10], [117, 10], [10, 23], [117, 23]]) { const i = 4 * (y * 140 + x); edges.data[i] = 255; edges.data[i + 1] = 255; edges.data[i + 2] = 0; }
eq(markerReading(edges, box), { count: 0b01010101, key: 0 }, 'painted corners do not change the bands');

// the judged pair: the frame the key arrived in (key band, counter C) and the frame before it (counter C-1)
const rd = (count, key) => ({ count, key });
eq(keyFrames([rd(10, 0), rd(11, 1), rd(12, 1)], 10), { at: 1, pre: 0, count: 11, preCount: 10 }, 'K, K+1 is judged');
eq(keyFrames([rd(10, 0), rd(11, 1), rd(12, 1)], 11), { at: 1, pre: 0, count: 11, preCount: 10 }, 'a key that landed after the frame rAF (recorded C) is judged');
eq(keyFrames([rd(0, 0), rd(0, 0), rd(1, 1), rd(2, 1)], 0), { at: 2, pre: 1, count: 1, preCount: 0 }, 'a duplicated pre-key frame (the static page captured twice) is judged on the copy beside the key frame');
eq(keyFrames([rd(10, 0), null, rd(11, 1)], 10).pre, -1, 'an unreadable frame before the key frame is unjudged');
ax(/unreadable, so counter 10 cannot be checked/.test(keyFrames([rd(10, 0), null, rd(11, 1)], 10).why), 'an unreadable pre-key frame says so');
eq(keyFrames([rd(10, 0), rd(12, 1), rd(13, 1)], 10).pre, -1, 'a dropped key frame is unjudged');
ax(/carries counter 10, not 11: the pre-key frame was dropped/.test(keyFrames([rd(10, 0), rd(12, 1)], 10).why), 'a dropped key frame names the gap');
eq(keyFrames([rd(11, 1), rd(12, 1)], 10).pre, -1, 'a capture that starts at the key frame has no K frame');
ax(/the capture starts at the key frame \(counter 11\)/.test(keyFrames([rd(11, 1)], 10).why), 'a missing K frame says so');
eq(keyFrames([rd(10, 0), rd(11, 1)], 40).pre, -1, 'a recorded counter from another key is unjudged');
ax(/the keydown recorded counter 40, but the key frame carries 11/.test(keyFrames([rd(10, 0), rd(11, 1)], 40).why), 'a foreign key names both counters');
eq(keyFrames([rd(10, 0), rd(11, 1)], null).pre, -1, 'no recorded counter is unjudged');
eq(keyFrames([rd(10, 0), rd(11, 0), rd(12, 0)], 10).pre, -1, 'a film with no key band is unjudged');
ax(/carries the key band: the frame the key arrived in was dropped/.test(keyFrames([rd(10, 0), rd(11, 0)], 10).why), 'a missing key frame says so');
eq(keyFrames([rd(255, 0), rd(0, 1)], 255), { at: 1, pre: 0, count: 0, preCount: 255 }, 'the counter wraps 255 -> 0');
eq(keyFrames([rd(0, 1), rd(1, 1)], 0), { at: 0, pre: -1, why: 'the capture starts at the key frame (counter 0), with no frame of counter 255 before it' }, 'a capture at a wrapped key frame has no K');

// the two-frame handover rule, on the check's own 3:1 ring-side verdicts
const held = sides(1), lost = sides(0), nearly = sides(0.89);
eq(whole(held), true, 'every side whole');
eq(whole(nearly), false, 'one side at 0.89 is not whole');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: held, atSearch: lost }), null, 'the same-frame handover passes');
eq(handoverFault({ preFiles: lost, preSearch: nearly, atFiles: held, atSearch: lost }).which, 'before', 'the K frame must show the old ring');
ax(/frame with counter K does not show the old control's ring whole/.test(handoverFault({ preFiles: lost, preSearch: nearly, atFiles: held, atSearch: lost }).why), 'the K failure names the old ring');
eq(handoverFault({ preFiles: held, preSearch: held, atFiles: held, atSearch: lost }).which, 'before', 'the K frame must not show the new ring');
ax(/already shows the new control's ring/.test(handoverFault({ preFiles: held, preSearch: held, atFiles: held, atSearch: lost }).why), 'the early-paint failure names the new ring');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: nearly, atSearch: lost }).which, 'at', 'a 1-frame late handover fails on K+1 (Files not whole)');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: lost, atSearch: held }).which, 'at', 'a 2-frame late handover fails on K+1 (ring still on Search)');
ax(/frame with counter K\+1 does not show the new control's ring whole/.test(handoverFault({ preFiles: lost, preSearch: held, atFiles: lost, atSearch: held }).why), 'the late-handover failure names K+1');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: held, atSearch: held }).which, 'at', 'K+1 must have lost the old ring');
ax(/still shows the old control's ring/.test(handoverFault({ preFiles: lost, preSearch: held, atFiles: held, atSearch: held }).why), 'the old-ring failure names the old ring');

// the default box is over the header, clear of the Activity bar's tiles (x 13..45, y 113..189 at 1920x1080)
ax(MARKER_BOX.y + MARKER_BOX.height <= 113 || MARKER_BOX.x + MARKER_BOX.width <= 13 || MARKER_BOX.x >= 45, 'the marker does not overlap the rail');
ax(MARKER_BOX.x + MARKER_BOX.width <= 1920, 'the marker fits the widest tested viewport');
console.log(`PASS ${checks}: counter round-trips, key band, unreadable bands, judged K/K+1 pair, duplicated pre-key frame, dropped key frame, missing K, unreadable K, foreign key, wrap, same-frame handover, 1-frame and 2-frame late handovers, early paint, old ring kept, 0.89 side not whole, marker clear of the rail`);
