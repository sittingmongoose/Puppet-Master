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
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// A URL scheme has 2+ characters before the colon, so "C:\..." (one letter) is a path and "file:///C:/..." is a URL.
export const isPageUrl = (value) => /^[a-z][a-z0-9+.-]+:/i.test(String(value ?? ''));

// The page argument as an absolute file path. `fallback` is used when no page was passed (a file: URL, absolute).
// A row that reads the built file cannot do it for an http(s) page, and says so rather than resolving `<kit>\https:...`.
export function pageFile(arg, fallback) {
	const value = arg || fallback;
	if (value == null) throw new Error('no page: pass --set page=<path or file: URL>');
	if (!isPageUrl(value)) return path.resolve(String(value));
	if (!/^file:/i.test(String(value))) throw new Error(`the page is ${value}: this row reads the built file, so it must be a file: page (--set page=<path or file: URL>)`);
	return fileURLToPath(String(value));
}

// The same page as a file: URL string (what a browser loads).
export function pageHref(arg, fallback) {
	const value = arg || fallback;
	if (value == null) throw new Error('no page: pass --set page=<path or file: URL>');
	return isPageUrl(value) ? new URL(String(value)).href : pathToFileURL(path.resolve(String(value))).href;
}
