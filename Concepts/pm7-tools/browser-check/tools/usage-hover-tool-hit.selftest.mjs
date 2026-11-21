import assert from 'node:assert/strict';
import { interruptedFadeQualifies } from '../checks/usage-hover-tool-hit.check.mjs';

const wheel = { trusted: true, hover: true, hit: true, op: null, opacity: 0.45, t: 300, top: 0 };
const down = { trusted: true, hover: true, overMenu: true, op: 'wheel', opacity: 0, t: 380, top: 1 };
const fadeDuration = 210;

// First show that the real-input judge still accepts a press in the useful window.
assert.equal(interruptedFadeQualifies(wheel, down, fadeDuration), true);
assert.equal(interruptedFadeQualifies({ ...wheel, opacity: 0.98 }, down, fadeDuration), false,
	'a nearly complete entry leaves too little of the interrupted fade to judge');
assert.equal(interruptedFadeQualifies(wheel, { ...down, t: wheel.t + fadeDuration }, fadeDuration), false,
	'a press after the full hit-retention delay would miss the defect');
assert.equal(interruptedFadeQualifies(wheel, { ...down, overMenu: false }, fadeDuration), false,
	'a press outside the current menu box cannot prove that the menu rejects hits');
assert.equal(interruptedFadeQualifies(wheel, { ...down, returned: true }, fadeDuration), false,
	'a later wheel hold cannot stand in for the interrupted one');
assert.equal(interruptedFadeQualifies({ ...wheel, opacity: 0 }, down, fadeDuration), false);
assert.equal(interruptedFadeQualifies(wheel, { ...down, trusted: false }, fadeDuration), false);

console.log('usage hover tool hit: 7 cases pass');
