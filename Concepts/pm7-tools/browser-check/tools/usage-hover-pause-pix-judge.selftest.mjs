import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const judge = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL('./usage-hover-pause-pix-judge.mjs', import.meta.url));
const name = 'normal-basic-dark-park0';
const png = (red, alpha = 255) => encodePng({ width: 1, height: 1, data: Buffer.from([red, 0, 0, alpha]) });
const summary = { surface: 'normal', look: 'basic-dark', state: 'park0', judged: true, drift: 0, diff: 0, diff2: 0 };
function run(t, tags, receipt, candidate = png(255), opts = {}) {
	const dir = mkdtempSync(join(process.env.PM_HOVER_PAUSE_SCRATCH || tmpdir(), 'usage-pix-'));
	if (!process.env.PM_HOVER_PAUSE_SCRATCH) t.after(() => rmSync(dir, { recursive: true, force: true }));
	for (const tag of tags) writeFileSync(join(dir, name + '-' + tag + '.png'), tag === 'B' ? candidate : png(0));
	if (receipt) writeFileSync(join(dir, 'normal-summary.json'), JSON.stringify([receipt]));
	// R132-5: companions (or the receipt) left by an earlier capture, a minute older than this run's A1
	const old = Date.now() / 1000 - 60;
	for (const tag of opts.stale || []) utimesSync(join(dir, name + '-' + tag + '.png'), old, old);
	if (opts.staleReceipt && receipt) utimesSync(join(dir, 'normal-summary.json'), old, old);
	const result = spawnSync(process.execPath, [judge, dir], { encoding: 'utf8' });
	return { ...result, output: result.stdout + result.stderr };
}

test('one omitted companion is rejected even with a receipt', (t) => {
	for (const tags of [['A1', 'B'], ['A1', 'A2'], ['A2', 'B']]) {
		const result = run(t, tags, summary);
		assert.equal(result.status, 1, result.output);
		assert.match(result.output, /incomplete triplet/);
	}
});
test('an A1-only capture needs an exact identical receipt', (t) => {
	for (const receipt of [null, { ...summary, diff: 1 }, { ...summary, state: 'back0' }]) {
		const result = run(t, ['A1'], receipt);
		assert.equal(result.status, 1, result.output);
		assert.match(result.output, /identical capture summary/);
	}
	assert.equal(run(t, ['A1'], summary).status, 0);
});
test('a full triplet with a changed pixel is judged', (t) => {
	const result = run(t, ['A1', 'B', 'A2']);
	assert.equal(result.status, 1, result.output);
	assert.match(result.output, /1 px changed/);
});
test('an empty folder or a summary with no actual shot fails', (t) => {
	assert.equal(run(t, []).status, 1);
	assert.equal(run(t, [], summary).status, 1);
});

test('an explicitly unqualified capture cannot fall back to stale files', (t) => {
	const result = run(t, ['A1', 'A2', 'B'], { ...summary, error: 'unqualified capture' }, png(0));
	assert.equal(result.status, 1, result.output);
	assert.match(result.output, /unqualified capture/);
});
test('an alpha-only change is still a changed pixel', (t) => {
	const result = run(t, ['A1', 'A2', 'B'], null, png(0, 128));
	assert.equal(result.status, 1, result.output);
	assert.match(result.output, /1 px changed/);
});

test('the producer heatmap is not an orphaned comparison shot', (t) => {
	const result = run(t, ['A1', 'A2', 'B', 'heat-A1-B'], summary, png(0));
	assert.equal(result.status, 0, result.output);
	assert.match(result.output, /1 of 1 states/);
});

// R132-FOLLOWUPS 5: the diagnostic writes only A1 for a fresh identical state; an earlier differing triplet left
// in the same output folder keeps its B and A2. With all three names present the base judged the stale companions
// against the new A1 (old A2 matches it, old B differs) and failed a current identical capture.
test('R132-5: stale companions are not judged against a new identical A1', (t) => {
	const result = run(t, ['A1', 'B', 'A2'], summary, png(255), { stale: ['B', 'A2'] });
	assert.equal(result.status, 0, result.output);
	assert.match(result.output, /capture summary confirms identical/);
	assert.match(result.output, /stale companions/);
});
test('R132-5: stale companions without an identical receipt are named, not silently passed', (t) => {
	const result = run(t, ['A1', 'B', 'A2'], null, png(255), { stale: ['B', 'A2'] });
	assert.equal(result.status, 1, result.output);
	assert.match(result.output, /stale companions from an earlier capture/);
});
test('R132-5: a receipt older than A1 does not confirm this capture', (t) => {
	const result = run(t, ['A1'], summary, png(255), { staleReceipt: true });
	assert.equal(result.status, 1, result.output);
	assert.match(result.output, /identical capture summary/);
});
test('R132-5: a fresh full triplet is still judged (companions written with A1)', (t) => {
	const result = run(t, ['A1', 'B', 'A2'], null, png(255));
	assert.equal(result.status, 1, result.output);
	assert.match(result.output, /1 px changed/);
});
