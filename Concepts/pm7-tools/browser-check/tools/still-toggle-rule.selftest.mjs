import assert from 'node:assert/strict';
import { toggleCost } from '../helpers/still-toggle-cost.mjs';
for (const h of [0,1,21,24,40,92]) {
 const limit=3*h+19;
 assert.equal(toggleCost(limit,h).pass,true,`allow the stated mechanism envelope at H=${h}`);
 assert.equal(toggleCost(limit,h).limit,limit);
 assert.equal(toggleCost(limit+1,h).pass,false);
}
assert.equal(toggleCost(69,24).pass,true,'the measured Settings frame has the authorized margin');
assert.equal(toggleCost(118,21).pass,false,'Usage118 remains over82, never fitted away');
for (const n of [650,670,679,687,730]) assert.equal(toggleCost(n,50).pass,false,'old generator still exceeds169 by a wide margin');
console.log('PASS exact 3H+19 envelope, Settings margin, Usage118 and historical650–730 negative controls');
