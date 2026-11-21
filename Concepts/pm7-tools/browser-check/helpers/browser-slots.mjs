import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

export async function localBrowserSlots() {
	try {
		// browser-check runs this check in its Node CLI process. Query that same installation.
		const { stdout } = await run(process.execPath, [process.argv[1], 'slots', '--json'], {
			timeout: 12000, windowsHide: true, maxBuffer: 2 * 1024 * 1024,
		});
		const { here, rows } = JSON.parse(stdout);
		const local = rows.find((row) => row.self || row.machine.name === here);
		if (local?.free?.headless == null) return `host load: ${here || 'local host'} slots unavailable`;
		return `host load: ${here} had ${local.free.headless} free headless browsers (${local.state.browsers} in use)`;
	} catch (error) {
		return `host load: local browser slots unavailable (${String(error.message).split('\n')[0]})`;
	}
}
