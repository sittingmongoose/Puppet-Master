// Contract tests for pip_body_scan.mjs on synthetic, lossless films with real tags and witness logs (pip_scan_fixture.mjs;
// no browser, no motion evidence). Run: node pip_body_scan.selftest.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { makeFixture, CELLS, BL } from './pip_scan_fixture.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pip-scan-selftest-'));
const scanner = fileURLToPath(new URL('./pip_body_scan.mjs', import.meta.url));
const scan = (film, log, env = process.env, extra = []) => {
	const r = spawnSync(process.execPath, [scanner, film, '--witness', log, ...extra], { env, encoding: 'utf8' });
	let j = null; try { j = JSON.parse(r.stdout); } catch { /* none */ }
	return { status: r.status, j, err: r.stderr };
};
let checks = 0;
try {
	const clean = await makeFixture(root, 'clean');
	let r = scan(clean.film, clean.log);
	assert.equal(r.status, 0, JSON.stringify(r.j)); assert.equal(r.j.verdict, 'pass'); assert.equal(r.j.coverage['look-b'], 1); checks++;

	const dropB = await makeFixture(root, 'dropB', { dropB: true });
	r = scan(dropB.film, dropB.log);
	assert.equal(r.status, 1, JSON.stringify(r.j)); assert.equal(r.j.dips.length, 1); assert.equal(r.j.dips[0].look, 'look-b'); assert.deepEqual(r.j.dips[0].seqs, [dropB.v.dropAt]); assert.equal(r.j.dips[0].frames[0].part, 'head'); checks++;

	const ctlA = await makeFixture(root, 'ctlA', { dropCtlA: true });
	r = scan(ctlA.film, ctlA.log);
	assert.equal(r.status, 1); assert.equal(r.j.dips[0].look, 'look-a'); assert.equal(r.j.dips[0].len, 2); assert.equal(r.j.dips[0].frames[0].part, 'ctl'); checks++;

	const uncal = await makeFixture(root, 'uncalB', { uncalB: true });
	r = scan(uncal.film, uncal.log);
	assert.equal(r.status, 2); assert.equal(r.j.verdict, 'cannot-evaluate'); assert.match(r.j.cannotEvaluate.join(' '), /look-b: no calibration on film/); checks++;

	const insep = await makeFixture(root, 'insep', { inseparable: true });
	r = scan(insep.film, insep.log);
	assert.equal(r.status, 2); assert.match(r.j.cannotEvaluate.join(' '), /look-b head/); checks++;

	const grey = await makeFixture(root, 'greyB', { greyB: true });
	r = scan(grey.film, grey.log);
	assert.equal(r.status, 1); assert.equal(r.j.dips.length, 0); assert.ok(r.j.failures.some((x) => /untagged frames hide visible/.test(x))); checks++;

	const skip = await makeFixture(root, 'skipB', { skipB: true });
	r = scan(skip.film, skip.log);
	assert.equal(r.status, 1); assert.ok(r.j.coverage['look-b'] < 0.9 && r.j.coverage['look-a'] === 1); checks++;
	r = scan(skip.film, skip.log, process.env, ['--min-coverage', '0.7']);
	assert.equal(r.status, 0, JSON.stringify(r.j)); checks++;

	const back = await makeFixture(root, 'backwards', { backwards: true });
	r = scan(back.film, back.log);
	assert.equal(r.status, 1); assert.ok(r.j.failures.some((x) => /backwards/.test(x))); checks++;

	const noEnd = await makeFixture(root, 'noEnd', { noEnd: true });
	r = scan(noEnd.film, noEnd.log);
	assert.equal(r.status, 2); assert.match(r.j.error, /no end record/); checks++;

	/* the film goes on past the log (the page lost before its last records were read out) */
	const tail = await makeFixture(root, 'tail', { extraTail: 30 });
	r = scan(tail.film, tail.log);
	assert.equal(r.status, 2); assert.match(r.j.cannotEvaluate.join(' '), /name page frames the witness log does not have/); checks++;
	const lost = path.join(root, 'lost.jsonl'); fs.writeFileSync(lost, fs.readFileSync(clean.log, 'utf8').replace('"kind":"end"', '"kind":"end","lost":"Error: page closed"'));
	r = scan(clean.film, lost); assert.equal(r.status, 2); assert.match(r.j.error, /lost/); checks++;
	const invalid = path.join(root, 'invalid.mp4'); fs.writeFileSync(invalid, 'not a movie');
	r = scan(invalid, clean.log); assert.equal(r.status, 2); checks++;
	r = scan(path.join(root, 'missing.mp4'), clean.log); assert.equal(r.status, 2); checks++;
	/* a film of another run: no tag matches its log */
	r = scan(clean.film, (() => { const p = path.join(root, 'other.jsonl'); fs.writeFileSync(p, fs.readFileSync(clean.log, 'utf8').replace('"x":0,"y":0', '"x":40,"y":200')); return p; })());
	assert.equal(r.status, 2); assert.match(r.j.error, /no film frame carries a readable tag/); checks++;
	/* decoder faults: no decoder; a decoder that fails after one complete frame; one that leaves a partial frame */
	const bin = path.join(root, 'bin'); fs.mkdirSync(bin);
	fs.writeFileSync(path.join(bin, 'ffprobe'), `#!/bin/sh\nexec "${spawnSync('sh', ['-c', 'command -v ffprobe'], { encoding: 'utf8' }).stdout.trim()}" "$@"\n`, { mode: 0o755 });
	r = scan(clean.film, clean.log, { ...process.env, PATH: bin }); assert.equal(r.status, 2); checks++;
	for (const [bytes, exit] of [[0, 0], [(CELLS * BL) * 3 * 1000, 1], [7, 0]]) {
		fs.writeFileSync(path.join(bin, 'ffmpeg'), `#!${process.execPath}\nprocess.stdout.write(Buffer.alloc(${bytes}), () => process.exit(${exit}));\n`, { mode: 0o755 });
		r = scan(clean.film, clean.log, { ...process.env, PATH: bin }); assert.equal(r.status, 2); checks++;
	}
	console.log(`PASS ${checks}: clean (cover untagged, overlay, repeated frame), look B dropout judged by B's own reference, controller dropout, look without calibration, inseparable look, untagged visible frames, low coverage (and its threshold), backwards tags, incomplete log, film past its log, page lost, invalid and missing film, film of another log, no decoder, failed decoder, partial frame`);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
