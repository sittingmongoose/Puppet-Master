// R132-FOLLOWUPS 1: helpers/browser-slots.mjs read the CLI's here/self row, so a fleet run (--host alexis from
// another machine) named the DRIVER's headless capacity in the LOOKMENU-EDITOR-CLICK-ONCE and editor-build
// timeouts, not the renderer host's (R132-REPORT.md). The line must name the renderer host's capacity when the
// browser host is passed, and say so for attached sessions.
// node tools/browser-slots-host.selftest.mjs [browser-slots.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { slotsLine } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/browser-slots.mjs');
assert.equal(typeof slotsLine, 'function', 'the slots line needs the browser host; the base named the driver on a fleet run');
const rows = [
	{ self: true, machine: { name: 'vm' }, free: { headless: 2 }, state: { browsers: 1 } },
	{ machine: { name: 'alexis' }, free: { headless: 0 }, state: { browsers: 12 } }
];
// the fleet run: the renderer is alexis (0 free, 12 in use), not the driver vm (2 free)
const fleet = slotsLine({ here: 'vm', rows }, { host: 'alexis' });
assert.match(fleet, /renderer host alexis had 0 free headless browsers \(12 in use\)/);
assert.ok(!fleet.includes('vm had'), 'the driver capacity must not stand in for the renderer');
// a renderer host the slots listing does not know
assert.match(slotsLine({ here: 'vm', rows }, { host: 'nas1' }), /renderer host nas1 slots unavailable/);
// an attached session without --host: the driver's read is labelled the driver's, not the renderer's
const attached = slotsLine({ here: 'vm', rows }, { attached: true });
assert.match(attached, /attached session/);
assert.match(attached, /driver vm had 2 free headless browsers \(1 in use\)/);
// the local run keeps its exact old wording
assert.equal(slotsLine({ here: 'vm', rows }), 'host load: vm had 2 free headless browsers (1 in use)');
assert.equal(slotsLine({ here: 'vm', rows: [] }), 'host load: vm slots unavailable');
console.log('PASS a fleet run names the renderer host capacity (alexis 0 free/12 in use, not the driver vm), an unknown renderer is named unavailable, an attached session labels the driver read, and the local wording is unchanged');
