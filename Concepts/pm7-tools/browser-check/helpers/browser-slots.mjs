import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { join } from 'node:path';

const run = promisify(execFile);

// R132-FOLLOWUPS 1: on a fleet run (--host alexis from another machine) the renderer's capacity is the browser
// host's, not the driver's; an attached session's renderer is elsewhere again. The line names whose capacity it
// read. Exported for tools/browser-slots-host.selftest.mjs.
export function slotsLine({ here, rows }, { host = null, attached = false } = {}) {
	const want = host ? rows.find((row) => row.machine?.name === host || row.machine?.fleet === host) : rows.find((row) => row.self || row.machine?.name === here);
	if (want?.free?.headless == null) return `host load: ${host ? `renderer host ${host}` : here || 'local host'} slots unavailable`;
	const load = `${host || here} had ${want.free.headless} free headless browsers (${want.state.browsers} in use)`;
	if (host) return `host load: renderer host ${load}`;
	if (attached) return `host load: attached session — the driver ${load}; the renderer host's own capacity is not read here`;
	return `host load: ${load}`;
}

// R135-F6: the local machine's name, by the slots CLI's own identity order (lib/fleet.mjs thisMachine):
// T3SP_FLEET_HOST first, else the hostname in the fleet file's hostnames. Unresolved keeps the whole-fleet query.
function localHostName() {
	if (process.env.T3SP_FLEET_HOST) return process.env.T3SP_FLEET_HOST;
	try {
		const share = process.env.GPU_BROWSER_SHARE || (process.platform === 'win32' ? '\\\\TRUENAS\\Cursor' : process.platform === 'darwin' ? '/Volumes/Cursor' : '/mnt/Cursor');
		const file = process.env.T3SP_OPS_FLEET || join(share, 'Tools', 't3sp-ops-fleet.json');
		const doc = JSON.parse(readFileSync(file, 'utf8'));
		const name = hostname().toLowerCase().split('.')[0];
		const m = (doc.machines || []).find((x) => (x.hostnames || []).some((h) => String(h).toLowerCase().split('.')[0] === name));
		return m ? m.name : null;
	} catch { return null; }
}

// R135-F6: ask only for the named host, or the local machine when none is named — one slow fleet host must not
// empty the readout inside the 12 s timeout (the CLI's own per-host probe budget is 36-45 s).
export function slotsArgs({ host = null } = {}) {
	const target = host || localHostName();
	return ['slots', '--json', ...(target ? ['--host', target] : [])];
}

export async function localBrowserSlots({ host = null, attached = false } = {}) {
	try {
		// browser-check runs this check in its Node CLI process. Query that same installation.
		const { stdout } = await run(process.execPath, [process.argv[1], ...slotsArgs({ host })], {
			timeout: 12000, windowsHide: true, maxBuffer: 2 * 1024 * 1024,
		});
		return slotsLine(JSON.parse(stdout), { host, attached });
	} catch (error) {
		return `host load: local browser slots unavailable (${String(error.message).split('\n')[0]})`;
	}
}
