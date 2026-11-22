// R132-FOLLOWUPS 1: helpers/browser-slots.mjs read the CLI's here/self row, so a fleet run (--host alexis from
// another machine) named the DRIVER's headless capacity in the LOOKMENU-EDITOR-CLICK-ONCE and editor-build
// timeouts, not the renderer host's (R132-REPORT.md). The line must name the renderer host's capacity when the
// browser host is passed, and say so for attached sessions.
// R135-F6: the fleet ALIAS must match too (the VM is machine.name 'vm', machine.fleet 'ubuntuserver'; the slots
// CLI matches both), and the query must ask only for the named host — or the local machine when none is named —
// so one slow fleet host cannot empty the readout inside the 12 s timeout.
// node tools/browser-slots-host.selftest.mjs [browser-slots.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir, hostname } from 'node:os';
const { slotsLine, slotsArgs } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../helpers/browser-slots.mjs');
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
// R135-F6 RED: the fleet alias names the same machine (the real fleet config: vm / ubuntuserver)
const fleetRows = [
	{ self: true, machine: { name: 'vm', fleet: 'ubuntuserver' }, free: { headless: 2 }, state: { browsers: 1 } },
	{ machine: { name: 'alexis', fleet: 'alexis' }, free: { headless: 0 }, state: { browsers: 12 } }
];
assert.match(slotsLine({ here: 'vm', rows: fleetRows }, { host: 'ubuntuserver' }), /renderer host ubuntuserver had 2 free headless browsers \(1 in use\)/);
assert.match(slotsLine({ here: 'vm', rows: fleetRows }, { host: 'vm' }), /renderer host vm had 2 free headless browsers \(1 in use\)/);
// R135-F6 RED: the query asks only for the named host
assert.deepEqual(slotsArgs({ host: 'alexis' }), ['slots', '--json', '--host', 'alexis']);
// no host: the local machine, by the slots CLI's own identity order (T3SP_FLEET_HOST first)
const savedFleetHost = process.env.T3SP_FLEET_HOST, savedFleetFile = process.env.T3SP_OPS_FLEET;
try {
	process.env.T3SP_FLEET_HOST = 'vm';
	assert.deepEqual(slotsArgs({}), ['slots', '--json', '--host', 'vm']);
	delete process.env.T3SP_FLEET_HOST;
	// else the hostname in the fleet file's hostnames
	const dir = mkdtempSync(join(tmpdir(), 'bc-slots-selftest-'));
	const fleetFile = join(dir, 'fleet.json');
	writeFileSync(fleetFile, JSON.stringify({ machines: [{ name: 'thisbox', hostnames: [hostname().toLowerCase().split('.')[0]] }] }));
	process.env.T3SP_OPS_FLEET = fleetFile;
	assert.deepEqual(slotsArgs({}), ['slots', '--json', '--host', 'thisbox']);
	// an unreadable fleet file leaves the identity unresolved: the whole-fleet query is kept
	process.env.T3SP_OPS_FLEET = join(dir, 'absent.json');
	assert.deepEqual(slotsArgs({}), ['slots', '--json']);
} finally {
	if (savedFleetHost === undefined) delete process.env.T3SP_FLEET_HOST; else process.env.T3SP_FLEET_HOST = savedFleetHost;
	if (savedFleetFile === undefined) delete process.env.T3SP_OPS_FLEET; else process.env.T3SP_OPS_FLEET = savedFleetFile;
}
console.log('PASS a fleet run names the renderer host capacity (alexis 0 free/12 in use, not the driver vm), the fleet alias ubuntuserver matches the vm row, the query asks only for the named or local host, an unknown renderer is named unavailable, an attached session labels the driver read, and the local wording is unchanged');
