// Judge diagnostics/usage-hover-pause-pix's shots where main's page does not hold still between its own loads.
// For each state (<name>-A1.png main, <name>-B.png the pause's page, <name>-A2.png main again) the frame is cut into
// 16 px cells; a cell where A1 and A2 differ anywhere is a cell main's page itself varies in (live text, a toast, the
// status bar's clock), widened by one cell. The pause changed a pixel only where B differs from A1 in a cell main holds
// still in; the verdict per state is that count (0 = no pixel changed where main's page holds still), with the share of
// the frame main varies in and its boxes.
//   node tools/usage-hover-pause-pix-judge.mjs <shots dir> [--json out.json]
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
import { isMainModule } from '../helpers/is-main.mjs';

const G = 16;
export function stillJudge(a1png, a2png, bpng, rect = null) {
	const a1 = decodePng(a1png), a2 = decodePng(a2png), b = decodePng(bpng), W = a1.width, H = a1.height;
	if ([a2, b].some((img) => img.width !== W || img.height !== H)) throw new Error('triplet image dimensions differ');
	const cw = Math.ceil(W / G), ch = Math.ceil(H / G), vary = new Uint8Array(cw * ch);
	const px = (img, i) => img.data[i] | (img.data[i + 1] << 8) | (img.data[i + 2] << 16) | (img.data[i + 3] << 24);
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (px(a1, i) !== px(a2, i)) vary[Math.floor(y / G) * cw + Math.floor(x / G)] = 1; }
	const wide = new Uint8Array(cw * ch);
	for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) if (vary[cy * cw + cx]) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = cx + dx, y = cy + dy; if (x >= 0 && y >= 0 && x < cw && y < ch) wide[y * cw + x] = 1; }
	let changed = 0, maxDelta = 0, bounds = null, varyCells = 0;
	const hit = new Uint32Array(cw * ch);
	for (let k = 0; k < wide.length; k++) varyCells += wide[k];
	for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
		if (rect && (x < rect[0] || y < rect[1] || x >= rect[2] || y >= rect[3])) continue;
		if (wide[Math.floor(y / G) * cw + Math.floor(x / G)]) continue;
		const i = (y * W + x) * 4;
		if (px(a1, i) === px(b, i)) continue;
		changed++; hit[Math.floor(y / G) * cw + Math.floor(x / G)]++;
		for (let c = 0; c < 4; c++) maxDelta = Math.max(maxDelta, Math.abs(a1.data[i + c] - b.data[i + c]));
		bounds = bounds ? [Math.min(bounds[0], x), Math.min(bounds[1], y), Math.max(bounds[2], x), Math.max(bounds[3], y)] : [x, y, x, y];
	}
	// cells merged by touch into boxes, largest first: where main varies, and where the pause's page changed a pixel
	const merge = (on, weight) => {
		const seen = new Uint8Array(cw * ch), boxes = [];
		for (let k = 0; k < on.length; k++) {
			if (!on[k] || seen[k]) continue;
			const q = [k]; seen[k] = 1; let x0 = cw, y0 = ch, x1 = 0, y1 = 0, n = 0;
			while (q.length) { const c = q.pop(), cx = c % cw, cy = (c - cx) / cw; n += weight ? weight[c] : 1; x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy);
				for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = cx + dx, y = cy + dy, j = y * cw + x; if (x >= 0 && y >= 0 && x < cw && y < ch && on[j] && !seen[j]) { seen[j] = 1; q.push(j); } } }
			boxes.push({ n, box: [x0 * G, y0 * G, (x1 + 1) * G, (y1 + 1) * G] });
		}
		return boxes.sort((p, q) => q.n - p.n).slice(0, 8).map((x) => weight ? [x.n].concat(x.box) : x.box);
	};
	return { changed, maxDelta, bounds, changedBoxes: merge(hit, hit), varyShare: Math.round(varyCells / (cw * ch) * 10000) / 100, varyBoxes: merge(vary) };
}

// R132-FOLLOWUPS 5: the diagnostic writes only A1 for a fresh identical state; an earlier differing triplet left
// in the same output folder keeps its B and A2, and with all three names present the judge read the stale
// companions against the new A1 (old A2 matches it, old B differs) and failed a current identical capture. A1 is
// written first of a triplet: B or A2 older than A1 belongs to an earlier capture, and the identical-receipt
// summary must be at least as new as A1 to confirm it. Exported for the selftest.
export function captureFresh({ a1Ms, bMs = null, a2Ms = null, summaryMs = null }) {
	const companions = bMs != null && a2Ms != null ? bMs >= a1Ms && a2Ms >= a1Ms : null;
	return { companions, summary: summaryMs != null ? summaryMs >= a1Ms : null };
}

if (isMainModule(import.meta.url)) {
	const dir = process.argv[2], out = process.argv.indexOf('--json') > 0 ? process.argv[process.argv.indexOf('--json') + 1] : null;
	const rows = [], states = new Map(), summaries = new Map();
	for (const file of readdirSync(dir).sort()) {
		if (file.endsWith('-heat-A1-B.png')) continue;
		const shot = /^(.+)-(A1|A2|B)\.png$/.exec(file);
		if (shot) {
			if (!states.has(shot[1])) states.set(shot[1], new Set());
			states.get(shot[1]).add(shot[2]);
		}
		if (!/^(normal|sandbox)-summary\.json$/.test(file)) continue;
		for (const row of JSON.parse(readFileSync(path.join(dir, file), 'utf8'))) {
			if (file !== row.surface + '-summary.json') continue;
			const name = [row.surface, row.look, row.state].join('-');
			summaries.set(name, row);
		}
	}
	for (const name of [...new Set([...states.keys(), ...summaries.keys()])].sort()) {
		const tags = states.get(name) || new Set();
		const p = (tag) => path.join(dir, name + '-' + tag + '.png');
		const row = summaries.get(name);
		if (row?.error) {
			rows.push({ name, error: row.error });
			console.error(name + ': ' + row.error);
			continue;
		}
		const mtime = (f) => { try { return statSync(f).mtimeMs; } catch (e) { return null; } };
		const a1Ms = tags.has('A1') ? mtime(p('A1')) : null;
		const fresh = a1Ms == null ? { companions: null, summary: null } : captureFresh({
			a1Ms, bMs: tags.has('B') ? mtime(p('B')) : null, a2Ms: tags.has('A2') ? mtime(p('A2')) : null,
			summaryMs: row ? mtime(path.join(dir, row.surface + '-summary.json')) : null
		});
		const stale = tags.size === 3 && fresh.companions === false;
		if (tags.size !== 3 || stale) {
			const alone = tags.has('A1') && (tags.size === 1 || stale);
			const identical = alone && row?.judged === true && row.drift === 0 && row.diff === 0 && row.diff2 === 0 && fresh.summary !== false;
			if (identical) {
				decodePng(readFileSync(p('A1')));
				rows.push({ name, identical: true });
				console.log(name + ': capture summary confirms identical A1, B and A2' + (stale ? ' (stale companions from an earlier capture left in the folder, not judged)' : ''));
			} else {
				const error = stale ? 'stale companions from an earlier capture (B/A2 older than A1)' : alone ? 'missing identical capture summary' : 'incomplete triplet (' + ([...tags].join(', ') || 'no shots') + ')';
				rows.push({ name, error });
				console.error(name + ': ' + error);
			}
			continue;
		}
		const j = stillJudge(readFileSync(p('A1')), readFileSync(p('A2')), readFileSync(p('B')));
		rows.push({ name, ...j });
		console.log(`${name}: ${j.changed} px changed where main holds still (max delta ${j.maxDelta}${j.changed ? ', boxes [px, x0, y0, x1, y1] ' + JSON.stringify(j.changedBoxes) : ''}); main varies in ${j.varyShare} % of the frame: ${JSON.stringify(j.varyBoxes)}`);
	}
	console.log(`SUMMARY: ${rows.filter((r) => r.identical || r.changed === 0).length} of ${rows.length} states: no pixel changed where main holds still`);
	if (out) writeFileSync(out, JSON.stringify(rows, null, 1));
	process.exitCode = rows.length && rows.every((r) => r.identical || r.changed === 0) ? 0 : 1;
}
