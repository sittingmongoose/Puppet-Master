// Gate composition tests: a fake browser-check that lays down a synthetic tagged film and witness log (real decode and
// scan, no browser, no motion evidence). Run: node pip-steady-gate.selftest.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { makeFixture } from '../../../onboarding/opus-5.5/tools/pip_scan_fixture.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pip-gate-selftest-'));
const gate = fileURLToPath(new URL('./pip-steady-gate.mjs', import.meta.url));
try {
	const bin = path.join(root, 'bin'); fs.mkdirSync(bin);
	fs.writeFileSync(path.join(bin, 'browser-check'), `#!${process.execPath}
const fs = require('node:fs'), path = require('node:path'), a = process.argv, at = (k) => a[a.indexOf(k) + 1];
const film = at('--record'), dir = at('--out'), s = a.find((x) => x.startsWith('sandbox=')).slice(8);
fs.mkdirSync(dir, { recursive: true });
if (process.env.FILM) fs.copyFileSync(process.env.FILM, film);
if (process.env.LOG) fs.copyFileSync(process.env.LOG, path.join(dir, 'pip-witness-' + (s === '1' ? 'sandbox' : 'normal') + '.jsonl'));
process.exit(Number(process.env.STRUCTURAL_EXIT));
`, { mode: 0o755 });
	const fx = {};
	for (const [k, v] of [['clean', {}], ['dropB', { dropB: true }], ['uncalB', { uncalB: true }]]) fx[k] = await makeFixture(root, k, v);
	const invalid = path.join(root, 'invalid.mp4'); fs.writeFileSync(invalid, 'not a movie');
	const run = (args, env) => spawnSync(process.execPath, [gate, ...args], { encoding: 'utf8', env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, ...env } });
	const cases = [
		['clean', { FILM: fx.clean.film, LOG: fx.clean.log, STRUCTURAL_EXIT: '0' }, 0],
		['structural failure', { FILM: fx.clean.film, LOG: fx.clean.log, STRUCTURAL_EXIT: '1' }, 1],
		['painted dropout in look B', { FILM: fx.dropB.film, LOG: fx.dropB.log, STRUCTURAL_EXIT: '0' }, 1],
		['look without calibration', { FILM: fx.uncalB.film, LOG: fx.uncalB.log, STRUCTURAL_EXIT: '0' }, 1],
		['no witness log', { FILM: fx.clean.film, STRUCTURAL_EXIT: '0' }, 1],
		['invalid film', { FILM: invalid, LOG: fx.clean.log, STRUCTURAL_EXIT: '0' }, 1],
		['missing film', { LOG: fx.clean.log, STRUCTURAL_EXIT: '0' }, 1]
	];
	let n = 0;
	for (const [name, env, want] of cases) {
		const out = path.join(root, 'out-' + n++);
		const r = run(['--page', 'fixture.html', '--out', out, '--sandbox', '1'], env);
		assert.equal(r.status, want, `${name}: ${r.stdout}${r.stderr}`);
		const g = JSON.parse(fs.readFileSync(path.join(out, 'gate.json'), 'utf8'));
		assert.equal(g.ok, want === 0, name);
		if (name === 'painted dropout in look B') { assert.equal(g.surfaces[0].dips.length, 1); assert.equal(g.surfaces[0].dips[0].look, 'look-b'); }
	}
	/* both surfaces in turn; then a rescan of kept films and logs */
	const both = path.join(root, 'out-both');
	assert.equal(run(['--page', 'fixture.html', '--out', both], { FILM: fx.clean.film, LOG: fx.clean.log, STRUCTURAL_EXIT: '0' }).status, 0);
	assert.equal(JSON.parse(fs.readFileSync(path.join(both, 'gate.json'), 'utf8')).surfaces.length, 2);
	assert.equal(run(['--rescan', both], {}).status, 0);
	assert.equal(run(['--rescan', path.join(root, 'out-2')], {}).status, 1);
	assert.equal(run(['--page', 'fixture.html', '--out', both], { FILM: fx.clean.film, LOG: fx.clean.log, STRUCTURAL_EXIT: '0' }).status !== 0, true, 'an existing out dir is refused');
	console.log(`PASS ${cases.length + 4} gate cases (fake browser, real decode and scan): ${cases.map((c) => c[0]).join(', ')}, both surfaces, rescan pass and fail, existing out dir refused`);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
