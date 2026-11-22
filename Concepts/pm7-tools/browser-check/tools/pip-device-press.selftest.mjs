// PM7PERF-PIP-DEVICE-OFFSCREEN: the Retro Dark Begin route pressed the device option's full-rectangle centre
// (1209, 840) below the scroll pane's y826 edge, under the fixed footer; Continue stayed disabled and the check
// timed out. Real geometry: /mnt/Cursor/PuppetMaster-Evidence/tests/sol-max-15/kit-pip-device-native-0-head/
// device-route.json (SHA-256 a28d4724db5df5ce2de7ecbcd3baa053efb53a0a40d42a6ac621e40065a083d8): option
// 992.078125,790.90625 434.921875x98.34375; pane 874.078125,241 622.921875x585 (bottom 826, scrollHeight 816);
// hit at the centre FOOTER.o55-foot.o55-st, optionHit false. One trusted 96 px wheel at the pane centre
// (1185, 533) moved the option to y694.90625 (centre 744.08), the hit became BUTTON.o55-card sub/device, and the
// press enabled Continue. The press path must wheel the card into view and hit-test before pressing; an
// unreachable target is a setup result, not a press.
// node tools/pip-device-press.selftest.mjs [pip-steady.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { devicePressStep } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/pip-steady.check.mjs');
const pane = { x: 874.078125, y: 241, w: 622.921875, h: 585, top: 241, bottom: 826 };
const before = { center: { x: 1209.5390625, y: 840.078125 }, pane, optionHit: false, wheels: 0 };
assert.equal(typeof devicePressStep, 'function', 'the device press needs a scroll/hit-test plan; the base pressed the footer at (1209, 840)');
// the real before state: wheel +96 at the pane centre, exactly the repair the native trace recorded
assert.deepEqual(devicePressStep(before), { action: 'wheel', dy: 96, at: { x: 1185.5390625, y: 533.5 } });
// after the real 96 px wheel (scrollTop 96): the centre hits the card, press
assert.equal(devicePressStep({ center: { x: 1209.5390625, y: 744.078125 }, pane, optionHit: true, wheels: 1 }).action, 'press');
// a centre above the pane's top wheels up
assert.equal(devicePressStep({ center: { x: 1209, y: 200 }, pane, optionHit: false, wheels: 0 }).dy, -96);
// still covered after six wheels: a setup result, never a press
assert.equal(devicePressStep({ ...before, wheels: 6 }).action, 'setup');
// covered with no scroll pane: a setup result
assert.equal(devicePressStep({ center: before.center, pane: null, optionHit: false, wheels: 0 }).action, 'setup');
console.log('PASS the clipped device centre (840.08 vs the pane bottom 826) wheels +96 at the pane centre, the revealed centre (744.08) presses, an above-pane centre wheels up, and a target still covered after six wheels or without a pane is a setup result, not a press');
