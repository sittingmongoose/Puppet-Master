// A kit tool that is run as a command decides "am I the entry module" by comparing process.argv[1] with its own
// module URL. Node runs the main module from its REAL path (symlinks resolved), so a comparison against the lexical
// argv path is false when the tool is invoked through a symlinked kit directory: the tool then exits 0, prints
// nothing and writes nothing (astra-max-17, batch 17: a real false pass of usage-hover-pause-pix-judge). These cases
// invoke the tools through a symlinked directory and fail if the command does not run.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, symlinkSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
import { isMainModule } from '../helpers/is-main.mjs';

const tools = dirname(fileURLToPath(import.meta.url));
const scratch = () => mkdtempSync(join(process.env.PM_HOVER_PAUSE_SCRATCH || tmpdir(), 'kit-main-'));
const linked = (t) => {
	const root = scratch();
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const link = join(root, 'kit-tools');
	symlinkSync(tools, link, 'dir');
	return { root, link };
};

test('isMainModule: the same file through a symlinked directory is the main module; another file is not', (t) => {
	const { link } = linked(t);
	const self = new URL(import.meta.url).href;
	assert.equal(isMainModule(self, join(link, 'kit-main-module.selftest.mjs')), true);
	assert.equal(isMainModule(self, fileURLToPath(import.meta.url)), true);
	assert.equal(isMainModule(self, join(link, 'usage-hover-pause-pix-judge.mjs')), false);
	assert.equal(isMainModule(self, ''), false, 'no entry path is never the main module');
});

test('usage-hover-pause-pix-judge run through a symlinked kit path still judges and fails a changed pixel', (t) => {
	const { root, link } = linked(t);
	const shots = join(root, 'shots'); mkdirSync(shots);
	const png = (red) => encodePng({ width: 1, height: 1, data: Buffer.from([red, 0, 0, 255]) });
	const name = 'normal-basic-dark-park0';
	writeFileSync(join(shots, name + '-A1.png'), png(0));
	writeFileSync(join(shots, name + '-A2.png'), png(0));
	writeFileSync(join(shots, name + '-B.png'), png(255));
	const r = spawnSync(process.execPath, [join(link, 'usage-hover-pause-pix-judge.mjs'), shots], { encoding: 'utf8' });
	const out = r.stdout + r.stderr;
	assert.equal(r.status, 1, `exit ${r.status}, output: ${JSON.stringify(out)}`);
	assert.ok(out.trim().length > 0, 'the judge printed nothing');
});

test('pip-steady-mutants run through a symlinked kit path without arguments prints its usage (exit 2)', (t) => {
	const { link } = linked(t);
	const r = spawnSync(process.execPath, [join(link, 'pip-steady-mutants.mjs')], { encoding: 'utf8' });
	assert.equal(r.status, 2, `exit ${r.status}, output: ${JSON.stringify(r.stdout + r.stderr)}`);
	assert.match(r.stderr, /usage: pip-steady-mutants/);
});
