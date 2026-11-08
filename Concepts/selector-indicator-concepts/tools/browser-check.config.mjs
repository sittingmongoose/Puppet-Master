// browser-check config for the selector indicator concept page (file://, self-contained). --set page=<path> tests a copy.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
export default (ctx) => {
	const url = pathToFileURL(path.resolve(ctx.args.page || path.resolve(ctx.configDir, '..', 'index.html'))).href;
	return {
	name: 'selector-concepts',
	pageUrl: url,
	helpers: { url() { return url; } },
	viewport: { width: 1920, height: 1080 },
	consoleErrors: { fail: true, allow: [] },
	failedRequests: { fail: true },
	maxStops: 120
	};
};
