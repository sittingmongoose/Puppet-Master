// helpers/burst-rest.mjs: a stationary wheel burst is judgeable only while every gap between its page events stays
// within the pause's 150 ms rest (PM7PERF-HOVERPAUSE-R5-CASCADE). The check's own test: the old code had no such
// state and each dependent row failed a pause that legitimately ended at a 238-258 ms driver gap.
import test from 'node:test';
import assert from 'node:assert/strict';
import { burstState, burstWhy, REST_MS } from '../helpers/burst-rest.mjs';

test('a 30 ms driver cadence keeps the burst', () => {
	const b = burstState([0, 30, 60, 90, 120]);
	assert.equal(REST_MS, 150);
	assert.deepEqual(b, { maxGap: 30, rest: 150, broke: false });
});

test('a 238 ms gap breaks the burst, as stream F saw on Alexis', () => {
	const b = burstState([0, 30, 60, 298, 328]);
	assert.equal(b.maxGap, 238);
	assert.equal(b.broke, true);
	assert.equal(burstWhy(b), 'could not judge: burst broke (max gap 238 ms)');
});

test('exactly the 150 ms rest still keeps the burst; one millisecond over breaks it', () => {
	assert.equal(burstState([0, 150, 300]).broke, false);
	assert.equal(burstState([0, 151, 302]).broke, true);
});

test('page recorder objects are read by their t, and no wheels is not a broken burst', () => {
	assert.deepEqual(burstState([{ t: 5 }, { t: 35 }, { t: 265 }]), { maxGap: 230, rest: 150, broke: true });
	assert.deepEqual(burstState([]), { maxGap: 0, rest: 150, broke: false });
	assert.deepEqual(burstState(null), { maxGap: 0, rest: 150, broke: false });
});

test('a single wheel has no gap to judge', () => {
	assert.deepEqual(burstState([{ t: 5 }]), { maxGap: 0, rest: 150, broke: false });
});

test('the rest can be passed for a caller that judges another rest', () => {
	assert.equal(burstState([0, 200], 250).broke, false);
	assert.match(burstWhy(burstState([0, 200], 100)), /max gap 200 ms/);
});
