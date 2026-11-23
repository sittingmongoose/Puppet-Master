// Selftest for helpers/page-path.mjs: one page argument, three spellings (FO17-PAGEPATH-FILE-URL,
// COLD-BELL-WIN-DRIVE-PATH, FO-SOUNDPRIME-WINDOWS-PATH). Runs on any host; the platform-specific cases assert what
// this platform's node:url and node:path do.
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { isPageUrl, pageFile, pageHref } from '../helpers/page-path.mjs';
import { pagePath, pageUrl } from '../helpers/onboarding-fields.mjs';

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
assert.equal(pageUrl({ args: {} }), committed.href);
console.log('PASS one page argument: plain Windows path, POSIX path and file: URL give one file path and one file URL; drive letters are not schemes; a remote page is refused by name');
