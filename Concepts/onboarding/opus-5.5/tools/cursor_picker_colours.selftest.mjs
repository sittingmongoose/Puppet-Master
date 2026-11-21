// cursor_picker_colours.check.mjs's page record (PM7PERF-PICKER-PAGE-HASH, R26 F4), on constructed pages: no browser.
// node cursor_picker_colours.selftest.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import check, { pageDigest, expected, loadJudgedPage } from './cursor_picker_colours.check.mjs';

const pages = { 'main6.html': '<!doctype html><title>main6</title>', 'm-6.html': '<!doctype html><title>m-6</title>' };
const sha = (s) => createHash('sha256').update(s).digest('hex');
const server = createServer((req, res) => { const body = pages[req.url.slice(1).split('?')[0]]; res.writeHead(body ? 200 : 404); res.end(body || ''); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
try {
	const d = await pageDigest(base + 'main6.html');
	assert.deepEqual(d, { url: base + 'main6.html', bytes: pages['main6.html'].length, sha256: sha(pages['main6.html']) }, 'the served bytes are hashed');
	assert.equal(expected('', 'main6', d), null, 'nothing expected: no verdict');
	assert.equal(expected(`main6:${d.sha256.slice(0, 16)}`, 'main6', d), true, 'the expected page by a prefix of its hash');
	assert.equal(expected(`m-6:${sha('x')},main6:${sha(pages['m-6.html']).slice(0, 12)}`, 'main6', d), false, 'another build\'s bytes under this name fail');
	assert.equal(expected(`main6:${d.sha256.toUpperCase()}`, 'main6', d), true, 'case does not matter');
	await assert.rejects(pageDigest(base + 'gone.html'), /HTTP 404/, 'a missing page is an error, not an empty hash');
	const dir = mkdtempSync(join(tmpdir(), 'picker-selftest-'));
	try { const f = join(dir, 'p.html'); writeFileSync(f, pages['m-6.html']); assert.equal((await pageDigest(pathToFileURL(f).href)).sha256, sha(pages['m-6.html']), 'file:// pages too'); }
	finally { rmSync(dir, { recursive: true, force: true }); }
	console.log('PASS each judged page is recorded by URL, size and SHA-256; --set expect fails a page that is not the named build');
} finally { server.close(); }

// PM7PERF-PICKER-DIGEST-UNBOUND (R51 F4): the default check's navigation. A basename match must not skip it, and the
// digest must be the document the page was loaded from, not a separate fetch of --set server.
const unqueried = '<!doctype html><title>right-server main6</title>';
const queried = '<!doctype html><title>the document the browser loaded</title>';
function intendedUrl(base) {
	const u = new URL('main6.html', base);
	u.searchParams.set('o55', 'off');
	u.searchParams.set('pm-warm', '0');
	return u.href;
}
async function withVaryingServer(run, firstBody = queried) {
	const hits = { unqueried: 0, query: 0 };
	const varying = createServer((req, res) => {
		const query = req.url.includes('?');
		hits[query ? 'query' : 'unqueried']++;
		const body = query ? (hits.query === 1 ? firstBody : queried) : (req.url.split('?')[0] === '/main6.html' ? unqueried : null);
		res.writeHead(body != null ? 200 : 404); res.end(body || '');
	});
	await new Promise((r) => varying.listen(0, '127.0.0.1', r));
	const base = `http://127.0.0.1:${varying.address().port}/`;
	try { await run(base, hits); }
	finally { varying.close(); }
}
async function drive(base, startUrl, expectBody, bodyError) {
	const navs = [];
	let url = startUrl;
	let handler, fulfilled;
	const browser = {
		route: async (match, capture) => { handler = capture; },
		unroute: async () => { handler = null; },
	};
	const page = {
		url: () => url,
		page: () => browser,
		addInitScript: async () => {},
		goto: async (u) => {
			navs.push(u); url = u;
			if (handler) {
				await handler({
					request: () => ({ isNavigationRequest: () => true, frame: () => page }),
					fetch: async ({ maxRedirects }) => {
						assert.equal(maxRedirects, 0);
						const response = await fetch(u, { redirect: 'manual' });
						return {
							ok: () => response.ok, status: () => response.status,
							headers: () => Object.fromEntries(response.headers),
							body: async () => Buffer.from(await response.arrayBuffer()), dispose: async () => {},
						};
					},
					fulfill: async ({ body }) => { fulfilled = body; },
					abort: async () => {},
				});
				return { body: async () => { if (bodyError) throw new Error(bodyError); return fulfilled; } };
			}
			const r = await fetch(u);
			const buf = Buffer.from(await r.arrayBuffer());
			return { ok: () => r.ok, status: () => r.status, body: async () => { if (bodyError) throw new Error(bodyError); return buf; } };
		},
		waitForFunction: async () => { throw new Error('STOP_AFTER_IDENTITY'); },
	};
	const out = join(mkdtempSync(join(tmpdir(), 'picker-bind-')), 'out.json');
	const checks = [];
	const t = {
		args: { builds: 'main6', server: base, expect: `main6:${sha(expectBody)}`, out },
		viewport: async () => {}, emulate: async () => {}, page, log: () => {},
		app: { open: async () => page },
		check: async (name, ok, details) => { checks.push({ name, ok, details: JSON.parse(details) }); },
	};
	let stopped = false;
	try { await check(t); }
	catch (e) { if (!/STOP_AFTER_IDENTITY/.test(String(e))) throw e; stopped = true; }
	finally { rmSync(dirname(out), { recursive: true, force: true }); }
	return { navs, checks, stopped, url: page.url(), fulfilled };
}
await withVaryingServer(async (base, hits) => {
	const intended = intendedUrl(base);
	const wrong = await drive(base, 'http://wrong-server.invalid/main6.html', unqueried);
	assert.equal(wrong.navs.length, 1, 'a same basename on another origin is still navigated (R51: 0 navigations)');
	assert.equal(wrong.navs[0], intended, 'navigation goes to the full intended URL');
	assert.equal(wrong.url, intended, 'the page judged is the one navigated, not wrong-server');
	assert.equal(hits.unqueried, 0, 'the digest is not a separate fetch of --set server');
	assert.equal(hits.query, 1, 'the navigation response is read once');
	assert.equal(wrong.checks.length, 1);
	assert.equal(wrong.checks[0].ok, false, 'the unqueried right-server hash must not pass for the loaded document');
	assert.equal(wrong.checks[0].details.sha256, sha(queried), 'the digest is the response the page was loaded from');
	assert.equal(wrong.checks[0].details.url, intended);
	assert.equal(wrong.stopped, false, 'a failing identity row does not go on to judge the page');
	const bound = await drive(base, 'http://wrong-server.invalid/main6.html', queried);
	assert.equal(bound.navs.length, 1);
	assert.equal(bound.url, intended);
	assert.equal(bound.checks[0].ok, true, 'expect matches the navigated document');
	assert.equal(bound.checks[0].details.sha256, sha(queried));
	assert.equal(bound.stopped, true, 'a matching page is the one the rest of the check would judge');
	const already = await drive(base, intended, unqueried);
	assert.deepEqual(already.navs, [intended], 'even a matching URL receives a new, witnessed navigation');
	assert.equal(already.checks[0].ok, false, 'the same URL does not permit guessing the document identity');
	assert.equal(already.checks[0].details.sha256, sha(queried));
	assert.equal(already.checks[0].details.url, intended);
	console.log('PASS the default check always witnesses a navigation and hashes the fulfilled document');
});

// The browser's inspector may evict a 40 MB document, but the fulfilled bytes remain the source of its identity.
const EVICTED = 'response.body: Protocol error (Network.getResponseBody): Request content was evicted from inspector cache';
await withVaryingServer(async (base, hits) => {
	const intended = intendedUrl(base);
	const big = await drive(base, 'http://wrong-server.invalid/main6.html', queried, EVICTED);
	assert.equal(big.navs.length, 1);
	assert.equal(big.url, intended);
	assert.equal(big.checks.length, 1, 'an evicted body is not the end of the check');
	assert.equal(big.checks[0].ok, true, 'the loaded document is hashed from the fulfilled response');
	assert.equal(big.checks[0].details.sha256, sha(big.fulfilled), 'the digest describes exactly the body passed to the browser');
	assert.equal(big.checks[0].details.sha256, sha(queried));
	assert.equal(big.checks[0].details.url, intended);
	assert.equal(hits.unqueried, 0, 'still not a fetch of --set server without the query');
	const wrongBig = await drive(base, 'http://wrong-server.invalid/main6.html', unqueried, EVICTED);
	assert.equal(wrongBig.checks[0].ok, false, 'the unqueried right-server hash still does not pass');
	assert.equal(hits.unqueried, 0);
	assert.equal(hits.query, 2, 'each navigation makes one request regardless of inspector eviction');
	console.log('PASS the fulfilled response still proves the navigation when the inspector has evicted it');
});

const edgeBase = 'http://127.0.0.1:1/';
const edgeUrl = intendedUrl(edgeBase);
const edgePage = (loaded, status) => {
	let url = 'about:blank';
	let capture;
	const browser = { route: async (match, handler) => { capture = handler; }, unroute: async () => {} };
	const frame = {
		url: () => url,
		page: () => browser,
		goto: async () => {
			url = loaded;
			if (status != null) await capture({
				request: () => ({ isNavigationRequest: () => true, frame: () => frame }),
				fetch: async () => ({
					ok: () => false, status: () => status, headers: () => ({ location: loaded }),
					body: async () => assert.fail('edge body was read'), dispose: async () => {},
				}),
				abort: async () => {},
			});
		},
	};
	return frame;
};
await assert.rejects(loadJudgedPage(edgePage(edgeBase + 'elsewhere.html', 302), edgeBase, 'main6'), /could not judge.*302 redirect/i);
await assert.rejects(loadJudgedPage(edgePage(edgeUrl, 304), edgeBase, 'main6'), /could not judge.*304.*cached/i);
const fileBase = pathToFileURL(tmpdir() + '/').href;
await assert.rejects(loadJudgedPage(edgePage(intendedUrl(fileBase), null), fileBase, 'main6'), /could not judge.*file:\/\/.*navigation/i);
console.log('PASS redirect, cached 304 and file navigation with no response each name the edge');

await withVaryingServer(async (base, hits) => {
	const varying = await drive(base, 'about:blank', queried, EVICTED);
	assert.equal(varying.checks[0].ok, false, 'the second response cannot certify the bytes the browser loaded');
	assert.equal(varying.checks[0].details.sha256, sha(varying.fulfilled), 'the identity row sees the same bytes as the browser');
	assert.equal(varying.fulfilled.toString(), unqueried, 'the browser received the first response');
	assert.equal(hits.query, 1, 'the tested navigation reads the server once');
	assert.equal(varying.stopped, false, 'picker judging does not start for a mismatched body');
	console.log('PASS an evicted browser body cannot be certified by a different second response');
}, unqueried);
