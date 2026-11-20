import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(process.argv[2] || new URL('../checks/perf-still-page.check.mjs', import.meta.url), 'utf8');
let judge;
if (source.includes('toggleCost(')) {
 ({ toggleCost: judge } = await import('../helpers/still-toggle-cost.mjs'));
} else {
 // Execute the check's original predicate, not a separate approximation of it.
 const predicate = source.match(/!!\(on && on\.found\) && on\.first <= toggleMax/)[0];
 const cap = Number(source.match(/toggleMax = Number\(t\.args\.toggle \|\| (\d+)\)/)[1]);
 judge = new Function('count', 'held', `const on = Number.isFinite(count) ? {found:true,first:count} : null; const toggleMax=${cap}; return {pass:${predicate},limit:toggleMax};`);
}
// Real populations: the initial 18 points plus natural Agents and a controlled 17-product-loader population.
for (const [held, restyled] of [[21,54],[24,67],[36,82],[38,87],[40,88],[92,192]]) assert.equal(judge(restyled, held).pass, true, `${held} marked elements, ${restyled} restyled`);
assert.equal(judge(140, 21).pass, false, 'the old population-independent 150 would excuse a large per-held spread');
// Recorded first-design largest frames in lane-l/proofs/run-psp-build-s0/run.log: 679,687,670.
// Fifty is the original nominal loop population used to retain its 150/50 ratio cap, not a new observed count.
for (const restyled of [650,670,679,687,730]) assert.equal(judge(restyled, 50).pass, false, 'the generated-selector design must still fail');
// Observed controlled increment: 17 unchanged product loaders add 68 marked groups.
assert.equal(judge(189, 24 + 68).pass, true);
for (const count of [null, undefined, NaN, -1, Infinity]) assert.equal(judge(count, 24).pass, false);
for (const held of [null, undefined, NaN, -1, 1.5]) assert.equal(judge(10, held).pass, false);
assert.equal(judge(0, 0).pass, true);
assert.equal(judge(19, 0).pass, true, 'the independent allowance remains when no loop is held');
assert.equal(judge(20, 0).pass, false, 'an empty population cannot excuse more than the independent allowance');
console.log('PASS calibrated populations, old 650–730 design, missing measurements and 3H+19 mechanism allowance');
