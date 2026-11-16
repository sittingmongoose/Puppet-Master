// The builder coverage test's filters (R53-C3, R54 F4): a --sample= that selects no builder sample fails instead of
// reporting success with no coverage; a real sample passes with positive coverage; the full run keeps its floors.
// Run: node Concepts/onboarding/opus-5.5/tools/selector_builder_coverage_filter.test.mjs [path to a
// selector_builder_coverage.test.mjs in this folder, to judge another version of it]
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const target = process.argv[2] || fileURLToPath(new URL('./selector_builder_coverage.test.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [target, ...args], { encoding: 'utf8' });
const tail = (r) => (r.stdout + r.stderr).trim().split('\n').filter((l) => /PASS|AssertionError|selects none|reached/.test(l)).slice(0, 2).join(' | ');
const typo = run('--sample=r54-no-such-builder');
assert.notEqual(typo.status, 0, `--sample= naming no builder sample must fail; it exited ${typo.status}: ${tail(typo)}`);
assert.match(typo.stdout + typo.stderr, /selects none of the builder samples/);
const real = run('--sample=renderDomainRail');
assert.equal(real.status, 0, `--sample=renderDomainRail must pass: ${tail(real)}`);
assert.match(real.stdout, /Real builder coverage: \{"\d+":[1-9]/);
const ruleRun = run('--sample=renderDomainRail', '--rule=9');
assert.equal(ruleRun.status, 0, `--sample=renderDomainRail --rule=9 must pass: ${tail(ruleRun)}`);
const ruleMiss = run('--sample=renderDomainRail', '--rule=13');
assert.notEqual(ruleMiss.status, 0, '--rule=13 on a sample that does not reach it must fail');
const full = run();
assert.equal(full.status, 0, `the full run must pass its floors: ${tail(full)}`);
console.log('PASS selector_builder_coverage filters: no-such sample fails, a real sample and a reached rule pass, an unreached rule fails, the full run passes');
