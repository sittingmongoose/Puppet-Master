// Which part of the built page a stack line belongs to. PMConcept7 is one HTML file: every script and style block the
// build writes carries an id (script#pm56-app-js, script#pm-o55-js, script#lg-js ...), so a line number from a stack or
// from a trace names its block, and a check can say "the chat's code" without a line range typed on the command line.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// The text of the page under test (t.cfg.pageUrl: http or file).
export async function pageSource(t) {
	const url = t.cfg.pageUrl;
	return /^https?:/i.test(url) ? await (await fetch(url)).text() : fs.readFileSync(fileURLToPath(new URL(url)), 'utf8');
}

// Every <script> and <style> block: { kind, id, from, to } with 1-based line numbers as a stack prints them.
export function blocksOf(src) {
	const lineStarts = [0]; for (let k = src.indexOf('\n'); k !== -1; k = src.indexOf('\n', k + 1)) lineStarts.push(k + 1);
	const lineAt = (i) => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (lineStarts[m] <= i) lo = m; else hi = m - 1; } return lo + 1; };
	const out = []; const re = /<(script|style)\b([^>]*)>/g; let m;
	while ((m = re.exec(src))) {
		const end = src.indexOf('</' + m[1], re.lastIndex); if (end < 0) break;
		const id = (/\bid="([^"]+)"/.exec(m[2]) || /data-pm-split-of="([^"]+)"/.exec(m[2]) || [])[1] || '';
		out.push({ kind: m[1], id, from: lineAt(m.index), to: lineAt(end) });
		re.lastIndex = end;
	}
	return out;
}

// The block a line is in, or null.
export function blockAt(blocks, line) {
	let lo = 0, hi = blocks.length - 1, hit = null;
	while (lo <= hi) { const mid = (lo + hi) >> 1; if (blocks[mid].from <= line) { hit = blocks[mid]; lo = mid + 1; } else hi = mid - 1; }
	return hit && line <= hit.to ? hit : null;
}

// The ids of the blocks the frames of a stack-site string run in, innermost first ("fn :1234:5 < fn2 :88:1").
export function blocksOfSite(blocks, site) {
	const ids = []; const re = /:(\d+):\d+/g; let m;
	while ((m = re.exec(site))) { const b = blockAt(blocks, Number(m[1])); ids.push(b ? b.id || '(' + b.kind + ')' : '?'); }
	return ids;
}

// The lines of one source file inside the built page, by the build's own file marker (`/* ---- <path> ---- */` at the
// start of a line; the next such marker or the block's end closes it). null when the marker is missing or not unique:
// the file cannot be told apart then, and a check must say so instead of guessing.
export function fileRegion(src, relPath) {
	const marker = '/* ---- ' + relPath + ' ---- */';
	const i = src.indexOf(marker);
	if (i < 0 || src.indexOf(marker, i + 1) >= 0) return null;
	const after = i + marker.length;
	const ends = [src.indexOf('\n/* ---- ', after), src.indexOf('</script>', after), src.indexOf('</style>', after)].filter((k) => k >= 0);
	const end = ends.length ? Math.min(...ends) : src.length;
	const lineAt = (k) => { let n = 1; for (let j = src.indexOf('\n'); j !== -1 && j < k; j = src.indexOf('\n', j + 1)) n++; return n; };
	return { from: lineAt(i), to: lineAt(end) };
}

// The lines of the innermost-first page frames of a stack-site string.
export function linesOfSite(site) { const out = []; const re = /:(\d+):\d+/g; let m; while ((m = re.exec(site))) out.push(Number(m[1])); return out; }
