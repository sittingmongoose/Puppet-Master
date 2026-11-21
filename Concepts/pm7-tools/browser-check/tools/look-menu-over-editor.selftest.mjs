import assert from 'node:assert/strict';
import * as check from '../checks/look-menu-over-editor.check.mjs';

let clicks = 0;
const timeout = new Error('locator.click: Timeout exceeded\nCall log');
timeout.name = 'TimeoutError';
const frame = { locator: () => ({ click: async () => { clicks++; throw timeout; } }) };
const slots = async () => 'host load: alexis had 3 free headless browsers (9 in use)';

await assert.rejects(async () => {
	await check.clickLookButton(frame, slots);
}, /locator\.click: Timeout exceeded.*alexis had 3 free headless browsers/);
assert.equal(clicks, 1, 'the real click is attempted once');
console.log('PASS a header Look click timeout includes local browser capacity');
