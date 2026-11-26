// Selftest for helpers/page-path.mjs: one page argument, three spellings (FO17-PAGEPATH-FILE-URL,
// COLD-BELL-WIN-DRIVE-PATH, FO-SOUNDPRIME-WINDOWS-PATH). Runs on any host; the platform-specific cases assert what
// this platform's node:url and node:path do.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { isPageUrl, pageFile, pageHref, sourcePage } from '../helpers/page-path.mjs';
import { pagePath, pageUrl, sourcePage as fieldsSourcePage } from '../helpers/onboarding-fields.mjs';
import fs from 'node:fs';
import http from 'node:http';
import { createHash } from 'node:crypto';

const win = process.platform === 'win32';
// A drive letter is not a URL scheme (a URL scheme has 2+ characters before the colon): the bug in
// new URL('C:\\...', 'file://') is that it read `c:` as the scheme and produced an opaque c:\ path.
assert.equal(isPageUrl('C:\\Users\\me\\head.html'), false);
assert.equal(isPageUrl('c:\\Users\\me\\head.html'), false);
assert.equal(isPageUrl('file:///C:/Users/me/head.html'), true);
assert.equal(isPageUrl('FILE:///C:/Users/me/head.html'), true);
assert.equal(isPageUrl('/home/me/head.html'), false);
assert.equal(isPageUrl('file:///home/me/head.html'), true);
assert.equal(isPageUrl('https://nas1/head.html'), true);

// a plain path resolves as it always did, and its href is that same file as a file: URL
const plain = win ? 'C:\\Users\\me\\pm-scratch\\head.html' : '/home/me/pm-scratch/head.html';
const plainAbs = path.resolve(plain);
assert.equal(pageFile(plain), plainAbs);
assert.equal(pageHref(plain), pathToFileURL(plainAbs).href);
assert.equal(new URL(pageHref(plain)).pathname, new URL(pathToFileURL(plainAbs)).pathname);
// a POSIX path on Windows is a path too (resolved on the current drive), never a URL
if (win) assert.equal(pageFile('/home/me/head.html'), path.resolve('/home/me/head.html'));

// the same file spelled as a file: URL gives the same file path and the same href: no `<kit>\file:C:\...` ENOENT
const href = pathToFileURL(plainAbs).href;
assert.equal(pageFile(href), plainAbs);
assert.equal(pageHref(href), href);
if (win) {
	assert.equal(pageFile('file:///C:/Users/me/pm-scratch/head.html'), 'C:\\Users\\me\\pm-scratch\\head.html');
	assert.equal(pageHref('file:///C:/Users/me/pm-scratch/head.html'), 'file:///C:/Users/me/pm-scratch/head.html');
}
// a space and a percent sign are the file's own characters, encoded once in the URL and decoded once in the path
const odd = win ? 'C:\\Users\\me\\a page 100%.html' : '/home/me/a page 100%.html';
assert.equal(pageFile(pageHref(odd)), path.resolve(odd));

// the fallback page (the kit's committed page) is used only when no page was passed
const fallback = pathToFileURL(win ? 'C:\\kit\\Concepts\\PMConcept7.html' : '/kit/Concepts/PMConcept7.html').href;
assert.equal(pageHref(undefined, fallback), fallback);
assert.equal(pageFile(undefined, fallback), pageFile(fallback));
assert.equal(pageHref(plain, fallback), pageHref(plain));

// a remote page cannot be read from disk: the caller is told why, not given `<kit>\https:\...`
assert.throws(() => pageFile('https://nas1/head.html'), /must be a file:/);

// the shared adapter calls both spellings for every check that imports it
const t = { args: { page: href } };
assert.equal(pagePath(t), plainAbs);
assert.equal(pageUrl(t), href);
assert.equal(pagePath({ args: { page: plain } }), plainAbs);
// the adapter's default is the kit's committed page, read as a path and loaded as a URL
const committed = new URL('../../../PMConcept7.html', import.meta.url);
assert.equal(pagePath({ args: {} }), path.resolve(fileURLToPath(committed)));

// FO20-L1 / NM19-PERFSTALLS-FILE-URL: a Windows drive path becomes its file: URL on ANY platform (a --host-files
// run parses the page on the caller's node; the browser loads the copy on the Windows machine). On Windows it is
// exactly pathToFileURL's own result; on POSIX it is the same URL, not `<cwd>/C:\...`.
const winPath = 'C:\\Users\\me\\pm-scratch\\head.html';
const winHref = 'file:///C:/Users/me/pm-scratch/head.html';
if (win) {
	assert.equal(pageHref(winPath), pathToFileURL(path.resolve(winPath)).href);
	assert.equal(pageFile(winPath), path.resolve(winPath));
	assert.equal(pageFile('file:///C:/Users/me/pm-scratch/head.html'), 'C:\\Users\\me\\pm-scratch\\head.html');
} else {
	assert.equal(pageHref(winPath), winHref);
	assert.equal(pageHref('c:\\Users\\me\\head.html'), 'file:///c:/Users/me/head.html');
	assert.equal(pageHref('C:/Users/me/head.html'), 'file:///C:/Users/me/head.html');
	// the file's own characters are encoded once, exactly as Windows pathToFileURL writes them
	assert.equal(pageHref('C:\\Users\\me\\a page 100%.html'), 'file:///C:/Users/me/a%20page%20100%25.html');
	assert.equal(pageHref('C:\\Users\\me\\a#b.html'), 'file:///C:/Users/me/a%23b.html');
	// reading a Windows file from a POSIX node is refused by name, never resolved to `<cwd>/C:\...` or `/C:/...`
	assert.throws(() => pageFile(winPath), /Windows machine/);
	assert.throws(() => pageFile('file:///C:/Users/me/head.html'), /Windows machine/);
	await assert.rejects(() => sourcePage(winPath), /Windows machine/);
}
// a POSIX path is still resolved natively on either platform (unchanged)
assert.equal(pageHref('/home/me/head.html'), pathToFileURL('/home/me/head.html').href);

// FO216-SOL-HTTP-STATIC-PATH: sourcePage reads the built source — a file page from disk, an http(s) page over
// HTTP, byte for byte (the sha256 is of the bytes read, never of a local lookalike).
const selfBytes = fs.readFileSync(fileURLToPath(import.meta.url));
const selfSha = createHash('sha256').update(selfBytes).digest('hex');
const fromFile = await sourcePage(import.meta.url);
	assert.equal(fromFile.bytes.equals(selfBytes), true);
assert.equal(fromFile.sha256, selfSha);
assert.equal(fromFile.url, new URL(import.meta.url).href);
assert.equal(fromFile.text, selfBytes.toString('utf8'));
assert.equal((await sourcePage(undefined, import.meta.url)).sha256, selfSha);
assert.equal((await fieldsSourcePage({ args: { page: import.meta.url } })).sha256, selfSha);
assert.equal(pagePath({ args: { page: import.meta.url } }), fileURLToPath(import.meta.url));

// a served page: the bytes the server really sends, including one invalid UTF-8 byte; a one-byte change changes
// the sha (the no-false-pass shape); a missing page is refused by name
const served = Buffer.concat([Buffer.from('<!doctype html><title>fo20-l1 sourcePage</title>\n<p>é</p>\n'), Buffer.from([0xff]), Buffer.from('\nend\n')]);
let current = served;
const server = http.createServer((req, res) => {
	if (req.url === '/head.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(current); }
	else { res.writeHead(404); res.end('not here'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
try {
	const url = `http://127.0.0.1:${server.address().port}/head.html`;
	const got = await sourcePage(url);
	assert.equal(got.bytes.equals(served), true);
	assert.equal(got.sha256, createHash('sha256').update(served).digest('hex'));
	assert.equal(got.url, url);
	current = Buffer.from(served); current[10] ^= 1;
	const changed = await sourcePage(url);
	assert.equal(changed.bytes.equals(served), false);
	assert.notEqual(changed.sha256, got.sha256);
	await assert.rejects(() => sourcePage(`http://127.0.0.1:${server.address().port}/missing.html`), /HTTP 404/);
} finally {
	server.close();
}
assert.equal(pageUrl({ args: {} }), committed.href);
console.log('PASS one page argument: plain Windows path, POSIX path and file: URL give one file path and one file URL; drive letters are not schemes and become file: URLs on any platform; a remote or cross-machine page is refused by name; sourcePage reads file and served bytes with their sha256');
