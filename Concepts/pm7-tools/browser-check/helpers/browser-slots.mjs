import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

// R132-FOLLOWUPS 1: on a fleet run (--host alexis from another machine) the renderer's capacity is the browser
// host's, not the driver's; an attached session's renderer is elsewhere again. The line names whose capacity it
// read. Exported for tools/browser-slots-host.selftest.mjs.
export function slotsLine({ here, rows }, { host = null, attached = false } = {}) {
	const want = host ? rows.find((row) => row.machine?.name === host) : rows.find((row) => row.self || row.machine?.name === here);
	if (want?.free?.headless == null) return `host load: ${host ? `renderer host ${host}` : here || 'local host'} slots unavailable`;
	const load = `${host || here} had ${want.free.headless} free headless browsers (${want.state.browsers} in use)`;
	if (host) return `host load: renderer host ${load}`;
	if (attached) return `host load: attached session — the driver ${load}; the renderer host's own capacity is not read here`;
	return `host load: ${load}`;
}

export async function localBrowserSlots({ host = null, attached = false } = {}) {
	try {
		// browser-check runs this check in its Node CLI process. Query that same installation.
		const { stdout } = await run(process.execPath, [process.argv[1], 'slots', '--json'], {
			timeout: 12000, windowsHide: true, maxBuffer: 2 * 1024 * 1024,
		});
		return slotsLine(JSON.parse(stdout), { host, attached });
	} catch (error) {
		return `host load: local browser slots unavailable (${String(error.message).split('\n')[0]})`;
	}
}
