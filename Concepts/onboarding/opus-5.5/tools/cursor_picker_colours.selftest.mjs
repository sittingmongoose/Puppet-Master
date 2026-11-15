// cursor_picker_colours.check.mjs's page record (PM7PERF-PICKER-PAGE-HASH, R26 F4), on constructed pages: no browser.
// node cursor_picker_colours.selftest.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pageDigest, expected } from './cursor_picker_colours.check.mjs';

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
