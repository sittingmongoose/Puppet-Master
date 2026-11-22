// Is this module the command that node was asked to run? Node runs the entry module from its REAL path (symlinks
// resolved), while process.argv[1] keeps the path as typed, so a lexical comparison is false when a kit tool is run
// through a symlinked directory, and the tool then silently does nothing (astra-max-17). Compare real paths.
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const real = (p) => { try { return realpathSync(p); } catch { return path.resolve(p); } };
export function isMainModule(metaUrl, argv1 = process.argv[1]) {
	if (!argv1) return false;
	return real(path.resolve(argv1)) === real(fileURLToPath(metaUrl));
}
