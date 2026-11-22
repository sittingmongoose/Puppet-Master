// PM7-PERF-QUIET-PREDECESSOR: five fresh standalone Basic Dark head runs passed 7 same-value writes each while the
// same real head after the original unchanged perf-rest predecessor failed 44/40 (sol-witness-{1..5}-fix vs
// sol-prefix-1-fix, streams/F/reviews/opus-review-perf1land.md continuation; TOOL-ISSUES 2026-11-12). The isolated
// check never reached the failing state. One run must cover both: the standalone windows, then the perf-rest
// predecessor's route (its default look cycle and view visits) and the same windows again with the same bounds.
// node tools/quiet-writes-predecessor.selftest.mjs [perf-quiet-writes.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { quietPhases, PREDECESSOR_ROUTE } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/perf-quiet-writes.check.mjs');
assert.equal(typeof quietPhases, 'function', 'the check needs the explicit predecessor phase; the base measured only the standalone state');
assert.deepEqual(quietPhases(undefined), ['standalone', 'after-predecessor'], 'the default run covers the reachable predecessor state');
assert.deepEqual(quietPhases('1'), ['standalone', 'after-predecessor']);
assert.deepEqual(quietPhases('0'), ['standalone'], '--set predecessor=0 keeps the standalone-only run');
// the predecessor route is perf-rest's own default route (its looks and the two views it visits)
assert.deepEqual(PREDECESSOR_ROUTE.looks, ['basic-dark', 'glass-dark', 'retro-dark', 'nier-dark']);
assert.deepEqual(PREDECESSOR_ROUTE.views, ['settings', 'dashboard']);
assert.ok(PREDECESSOR_ROUTE.lookSettle > 0 && PREDECESSOR_ROUTE.viewSettle > 0);
console.log('PASS quiet-writes phases: the default run measures standalone and then after the perf-rest predecessor route (its four looks and two views), predecessor=0 keeps standalone only');
