// FO17-PAGEPATH-FILE-URL / COLD-BELL-WIN-DRIVE-PATH / FO-SOUNDPRIME-WINDOWS-PATH: one page argument, three spellings.
// `--set page=` carries a plain Windows path (C:\Users\...\head.html), a POSIX path (/home/.../head.html) or a
// `file:` URL (file:///C:/.../head.html). The same argument must give the same file for a read (pageFile) and the
// same document for a load (pageHref), so no caller re-invents the parse:
// - `new URL(winPath, 'file://')` reads the drive letter `C:` as a URL scheme and resolves to `c:\Users\...`
//   (an opaque path with no host), so a Windows page cannot be opened that way (COLD-BELL-WIN-DRIVE-PATH);
// - `path.resolve(fileUrl)` appends the URL to the working directory (`<kit>\file:C:\...`), so a file: page cannot be
//   read that way (FO17-PAGEPATH-FILE-URL).
// A path is resolved against the working directory exactly as `path.resolve` always did; a file: URL is converted
// with node:url's own fileURLToPath, which is the platform's (a URL host is a UNC share on Windows). The href of a
// path is pathToFileURL's, which percent-encodes it, and the href of a file: URL keeps its own search and hash.
// A Windows drive path (C:\... or C:/...) becomes its file: URL on any platform: a --host-files run parses the page
// on the caller's node and the browser loads the copy on the Windows machine, so the href must not depend on the
// caller's platform; on Windows itself it is exactly pathToFileURL's own result. Reading such a page from a POSIX
// node is refused by name (the file is on the Windows machine); sourcePage reads an http(s) page over HTTP instead.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

// A URL scheme has 2+ characters before the colon, so "C:\..." (one letter) is a path and "file:///C:/..." is a URL.
export const isPageUrl = (value) => /^[a-z][a-z0-9+.-]+:/i.test(String(value ?? ''));

// A drive letter followed by a separator is a Windows path on any platform; off Windows it can only be loaded
// (--host-files), never read.
const WIN_DRIVE = /^[a-z]:[\\/]/i;
const OFF_WIN = process.platform !== 'win32';

// The page argument as an absolute file path. `fallback` is used when no page was passed (a file: URL, absolute).
// A row that reads the built file cannot do it for an http(s) page, and says so rather than resolving `<kit>\https:...`.
// On a POSIX node a Windows drive path or Windows file: URL names a file on the Windows machine (a --host-files
// run): it cannot be read here either, and is refused by name rather than resolved to `<cwd>/C:\...` or `/C:/...`.
export function pageFile(arg, fallback) {
	const value = arg || fallback;
	if (value == null) throw new Error('no page: pass --set page=<path or file: URL>');
	if (!isPageUrl(value)) {
		if (OFF_WIN && WIN_DRIVE.test(String(value))) throw new Error(`the page is ${value}: a Windows drive path names a file on the Windows machine; this row reads the built file, so serve the page (--set page=http://...) or run the check on that machine`);
		return path.resolve(String(value));
	}
	if (!/^file:/i.test(String(value))) throw new Error(`the page is ${value}: this row reads the built file, so it must be a file: page (--set page=<path or file: URL>)`);
	const file = fileURLToPath(String(value));
	if (OFF_WIN && /^\/[a-z]:\//i.test(file)) throw new Error(`the page is ${value}: a Windows file: URL names a file on the Windows machine; this row reads the built file, so serve the page (--set page=http://...) or run the check on that machine`);
	return file;
}

// The same page as a file: URL string (what a browser loads).
export function pageHref(arg, fallback) {
	const value = arg || fallback;
	if (value == null) throw new Error('no page: pass --set page=<path or file: URL>');
	if (isPageUrl(value)) return new URL(String(value)).href;
	if (OFF_WIN && WIN_DRIVE.test(String(value))) return pathToFileURL('/' + value[0] + ':' + (value.slice(2).replace(/\\/g, '/').replace(/^\/?/, '/'))).href;
	return pathToFileURL(path.resolve(String(value))).href;
}

// The built page's own bytes, for rows that read the source instead of the rendered DOM: an http(s) page is read
// over HTTP (the bytes the server really sends, never a local lookalike), a file page from disk through pageFile's
// parse. Returns the bytes, their UTF-8 text, the sha256 of the bytes and the URL they were read from.
export async function sourcePage(arg, fallback) {
	const value = arg || fallback;
	if (value == null) throw new Error('no page: pass --set page=<path or file: URL>');
	let bytes, url;
	if (isPageUrl(value) && /^https?:/i.test(String(value))) {
		url = new URL(String(value)).href;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`the page is ${value}: HTTP ${res.status} reading the built source`);
		bytes = Buffer.from(await res.arrayBuffer());
	} else {
		const file = pageFile(arg, fallback);
		bytes = fs.readFileSync(file);
		url = pathToFileURL(file).href;
	}
	return { bytes, text: bytes.toString('utf8'), sha256: createHash('sha256').update(bytes).digest('hex'), url };
}
