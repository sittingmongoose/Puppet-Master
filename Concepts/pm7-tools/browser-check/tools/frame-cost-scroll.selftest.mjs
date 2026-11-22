// PM7-FRAMECOST-SCROLL-START + PM7-FRAMECOST-HOME-NOSCROLL: the frame-cost scroll window started wherever the last
// window left the scroller and turned every 30 ticks of 40 px; Usage's 695 px board spent most ticks pinned near
// the end (94 vs 644 ms/s in one real run, ~/pm-scratch/pm7-perf/v/run-kit1-main-s0/run.log window 2 vs 3), and the
// Home window wheeled at 55% of .page.active over i.pmw-divider-line, where nothing scrolls
// (~/pm-scratch/pm7-perf/v/run-r3-basic-dark/run.log "moved: nothing scrolled"). The window must pick the view's
// main scroller, start at its top, turn at its bounds, and fail when nothing moved.
// node tools/frame-cost-scroll.selftest.mjs [frame-cost.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { pickScroller, scrollStep } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../diagnostics/frame-cost.check.mjs');
assert.equal(typeof pickScroller, 'function', 'the scroll window needs the view main scroller pick; the base wheeled over the divider line');
assert.equal(typeof scrollStep, 'function', 'the scroll window needs bound-aware turning; the base turned every 30 ticks wherever it was');
// the main scroller is the largest scrollable range (Usage's board, 695 px), ties by area
const board = { i: 0, range: 695, h: 600, area: 600 * 1200, x: 600, y: 400, name: 'pmuScroll' };
const aside = { i: 1, range: 200, h: 300, area: 300 * 300, x: 100, y: 200, name: 'aside' };
assert.equal(pickScroller([aside, board]), board);
assert.equal(pickScroller([]), null);
assert.equal(pickScroller([{ i: 0, range: 0, h: 600, area: 100 }]), null, 'a non-scrollable view has no main scroller');
assert.equal(pickScroller([{ ...aside, range: 695, area: 900000 }, board]).i, 1, 'a tie takes the larger area');
assert.equal(scrollStep({ top: 0, max: 695, dir: -1 }), 1);
assert.equal(scrollStep({ top: 695, max: 695, dir: 1 }), -1);
assert.equal(scrollStep({ top: 694, max: 695, dir: 1 }), -1, 'turn before the end, not into it');
assert.equal(scrollStep({ top: 300, max: 695, dir: 1 }), 1);
assert.equal(scrollStep({ top: 300, max: 695, dir: -1 }), -1);
// the real shape: a 695 px board wheeled 40 px a tick from the top turns at its bounds and is never pinned for
// more than the one tick that reaches the end (the base spent most of a 30-tick leg pinned)
let top = 0, dir = 1, pinned = 0, legs = 0;
for (let tick = 0; tick < 120; tick++) {
	const next = Math.max(0, Math.min(695, top + dir * 40));
	if (next === top) pinned++;
	if (next !== top && dir !== scrollStep({ top: next, max: 695, dir })) legs++;
	top = next;
	dir = scrollStep({ top, max: 695, dir });
}
assert.ok(pinned <= 4, `the bound-aware walk is pinned ${pinned} ticks of 120, not most of them`);
assert.ok(legs >= 3, 'the walk turns at both bounds several times over 120 ticks');
console.log('PASS frame-cost scroll: the main scroller is the largest scrollable range, the walk starts at its top and turns at its bounds (pinned at most the tick that reaches the end), and a view with no scroller is named');
