import assert from 'node:assert/strict';
import * as check from '../checks/settings-code-rows.check.mjs';

const rect = (top, bottom) => ({ left: 20, right: 150, top, bottom, width: 130, height: bottom - top });
const scroller = { getBoundingClientRect: () => rect(100, 300), clientTop: 2, clientLeft: 2, clientHeight: 196, clientWidth: 126, scrollTop: 440 };
const row = { getBoundingClientRect: () => rect(275, 315), closest: () => scroller };
const document = { getElementById: () => row, documentElement: { clientWidth: 1600, clientHeight: 1000 } };
assert.equal(check.retentionViewport(document).inside, false, 'a DOM-visible row clipped by the Settings scroller fails');
row.getBoundingClientRect = () => ({ left: 25, right: 140, top: 225, bottom: 265, width: 115, height: 40 });
assert.equal(check.retentionViewport(document).inside, true, 'the whole row fits inside the settled Settings viewport');
console.log('PASS terminal retention geometry rejects a clipped row');
