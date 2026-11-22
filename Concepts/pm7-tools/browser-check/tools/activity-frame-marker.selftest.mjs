// Contract tests for helpers/activity-frame-marker.mjs (PM7PERF-SHIFTTAB-PREKEY-SCREENCAST): no browser, no film.
// The in-page marker and its capture-phase keydown are exercised by the check's own runs on the Mac.
// Run: node tools/activity-frame-marker.selftest.mjs
import assert from 'node:assert/strict';
import { MARKER_BOX, markerState, firstMarkerFrame, handoverFault, whole } from '../helpers/activity-frame-marker.mjs';

const box = { x: 10, y: 10, width: 40, height: 14 };
function image(fill, paint = null) {
  const width = 100, height = 40, data = Buffer.alloc(width * height * 4, 255);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = 4 * (y * width + x), c = paint && x >= paint.x && x < paint.x + paint.width && y >= paint.y && y < paint.y + paint.height ? paint.ink : fill;
    data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
  }
  return { width, height, data };
}
const MAGENTA = [255, 0, 255], GREEN = [0, 255, 0], WHITE = [255, 255, 255], GREY = [128, 128, 128];
let checks = 0;
const ax = (cond, msg) => { assert.ok(cond, msg); checks++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); checks++; };
const sides = (v) => ({ top: { share: v, median: 9 }, bottom: { share: v, median: 9 }, left: { share: v, median: 9 }, right: { share: v, median: 9 } });

// the marker's colour in a decoded frame, read from its middle 7x7 pixels
eq(markerState(image(WHITE, { ...box, ink: MAGENTA }), box), 'M', 'magenta reads M');
eq(markerState(image(WHITE, { ...box, ink: GREEN }), box), 'G', 'green reads G');
eq(markerState(image(WHITE), box), '?', 'a white frame is not the marker');
eq(markerState(image(GREY), box), '?', 'grey is neither colour');
eq(markerState({ width: 100, height: 8, data: Buffer.alloc(100 * 8 * 4, 255) }, box), '?', 'a crop above the marker is not the marker');
eq(markerState(image(WHITE, { x: 10, y: 10, width: 20, height: 14, ink: MAGENTA }), box), '?', 'a marker split across two colours is not either colour');
/* only its middle is read: the box's corners stay the page's own */
const corners = image(WHITE, { ...box, ink: MAGENTA });
for (const [x, y] of [[10, 10], [49, 10], [10, 23], [49, 23]]) { const i = 4 * (y * 100 + x); corners.data[i] = 255; corners.data[i + 1] = 255; corners.data[i + 2] = 0; }
eq(markerState(corners, box), 'M', 'a clear middle reads through painted corners');

// the first frame after the trusted key, from the page's own pre-key colour
eq(firstMarkerFrame(['M', 'M', 'G', 'G'], 'M'), { at: 2, pre: 1 }, 'M,M,G,G flips at frame 3');
eq(firstMarkerFrame(['M', 'M', 'G', 'M'], 'M'), { at: 2, pre: 1 }, 'a pre-key frame delivered again after the flip is not a second flip');
eq(firstMarkerFrame(['?', 'M', 'M', 'G'], 'M'), { at: 3, pre: 2 }, 'an unreadable lead-in frame is skipped');
eq(firstMarkerFrame(['G', 'G', 'M'], 'G'), { at: 2, pre: 1 }, 'green before the flip is the old colour of the next press');
eq(firstMarkerFrame(['M', 'M', '?'], 'M').at, -1, 'no flip frame is unjudged');
ax(/no frame of 3 shows the marker's post-key colour/.test(firstMarkerFrame(['M', 'M', '?'], 'M').why), 'an unjudged film says no flip frame');
eq(firstMarkerFrame(['G', 'G'], 'M').at, 0, 'a film that starts after the flip is anchored at frame 1');
eq(firstMarkerFrame(['G', 'G'], 'M').pre, -1, 'a film that starts after the flip has no frame before it');
ax(/with no pre-key-colour frame before it/.test(firstMarkerFrame(['G', 'G'], 'M').why), 'a missing before frame says why');
eq(firstMarkerFrame(['M', '?', 'G'], 'M').pre, -1, 'an unreadable frame right before the flip leaves no readable frame before it');

// the two-frame handover rule, on the check's own 3:1 ring-side verdicts
const held = sides(1), lost = sides(0), nearly = sides(0.89);
eq(whole(held), true, 'every side whole');
eq(whole(nearly), false, 'one side at 0.89 is not whole');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: held, atSearch: lost }), null, 'the same-frame handover passes');
eq(handoverFault({ preFiles: lost, preSearch: nearly, atFiles: held, atSearch: lost }).which, 'before', 'the before frame must show the old ring');
ax(/old control's ring whole/.test(handoverFault({ preFiles: lost, preSearch: nearly, atFiles: held, atSearch: lost }).why), 'the before failure names the old ring');
eq(handoverFault({ preFiles: held, preSearch: held, atFiles: held, atSearch: lost }).which, 'before', 'the before frame must not show the new ring');
ax(/already shows the new control's ring/.test(handoverFault({ preFiles: held, preSearch: held, atFiles: held, atSearch: lost }).why), 'the early-paint failure names the new ring');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: nearly, atSearch: lost }).which, 'at', 'the flip frame must show the new ring whole');
ax(/new control's ring whole/.test(handoverFault({ preFiles: lost, preSearch: held, atFiles: nearly, atSearch: lost }).why), 'the late-handover failure names the new ring');
eq(handoverFault({ preFiles: lost, preSearch: held, atFiles: held, atSearch: held }).which, 'at', 'the flip frame must have lost the old ring');
ax(/still shows the old control's ring/.test(handoverFault({ preFiles: lost, preSearch: held, atFiles: held, atSearch: held }).why), 'the old-ring failure names the old ring');

// the default box is over the header, clear of the Activity bar's tiles (x 13..45, y 113..189 at 1920x1080)
ax(MARKER_BOX.y + MARKER_BOX.height <= 113 || MARKER_BOX.x + MARKER_BOX.width <= 13 || MARKER_BOX.x >= 45, 'the marker does not overlap the rail');
console.log(`PASS ${checks}: marker colour read, corners ignored, split and missing marker unknown, flip frame found, re-delivered pre-key frame not a flip, missing before/flip unjudged, same-frame handover, late handover, early paint, old ring kept, 0.89 side not whole`);
