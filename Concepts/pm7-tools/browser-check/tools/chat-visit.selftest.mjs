// perf-chat-run's visit rule (PM7PERF-CHATRUN-VISIT-SHORT-LATE), on constructed timings: no browser.
// node tools/chat-visit.selftest.mjs
import assert from 'node:assert/strict';
import { visitJudged } from '../checks/perf-chat-run.check.mjs';

const delay = 1400;
assert.equal(visitJudged('short', [100, 400], delay), true, 'a short visit that closed well before the delay was due');
assert.equal(visitJudged('short', [100, 1299], delay), true);
// a short visit that really overruns stays unjudged, and its row fails as "could not judge" (main's own check on a loaded
// Alexis read windows like these, armed inside the synchronous ticks)
assert.equal(visitJudged('short', [433, 1429], delay), false, 'overran the delay');
assert.equal(visitJudged('short', [100, 1300], delay), false, 'inside the 100 ms margin');
assert.equal(visitJudged('short', null, delay), false, 'never opened or closed');
assert.equal(visitJudged('short', [0, 300], delay), false, 'open before the arming');
assert.equal(visitJudged('long', [100, 2400], delay), true, 'a long visit that stayed past the delay');
assert.equal(visitJudged('long', [100, 1400], delay), false, 'a long visit that did not stay past it');
console.log('PASS a visit is judged only when it opened after the arming and a short one closed before the delay (less 100 ms), a long one after it; an overrun stays unjudged');
