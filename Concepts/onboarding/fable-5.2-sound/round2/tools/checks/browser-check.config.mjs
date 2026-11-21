// browser-check config for the Pip sound concepts (Fable 5.2). Guide: browser-check guide
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ROOT = root;
export default {
	name: 'pip-sound',
	baseURL: pathToFileURL(root).href + '/',
	viewport: { width: 1440, height: 900 },
	isolate: true,
	consoleErrors: { fail: true, allow: [/favicon\.ico/] },
	failedRequests: { fail: false, allow: [] },
	helpers: {}
};
