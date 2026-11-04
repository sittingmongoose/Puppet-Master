/* Every-frame scan of a film for Pip's body dropping out of a painted frame (FO-30 / FO-43).
 *   node tools/pip_body_scan.mjs <film.mp4> [--crop x,y,w,h] [--color 0,86,179] [--tol 48] [--out counts.csv]
 *   node tools/pip_body_scan.mjs <film.mp4> --dump 27406,27407,27408 --dir <fresh dir> [--crop ...]
 * Decodes every frame (software decode, -fps_mode passthrough: no frame dropped or doubled, so frame n is the stream's
 * frame n) cropped to Pip's stage, and counts the pixels within --tol of Pip's body colour (Basic Light #0056B3 by
 * default). A dropout is a run of 1-3 frames under 35 % of the local median (121 frames) whose two neighbours on each
 * side are above 60 % of it. The default crop is the wizard stage of a 1920x1080 film with the window centred at
 * 1080x720 (the kit's films and final-onb's 1390x900 sandbox wrapper both put it at 422,240,452,660).
 * The crop's x and width must be even: a yuv420p crop rounds an odd width down, and a raw frame of the wrong size slices
 * every later frame across two (an earlier copy of this scanner numbered frames 452/453 of the truth that way).
 * --dump writes those frames (same decode, same numbering) as PPM files, for native viewing. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const a = process.argv.slice(2), v = a[0], opt = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
if (!v || !fs.existsSync(v)) { console.error('usage: node pip_body_scan.mjs <film.mp4> [--crop x,y,w,h] [--color r,g,b] [--tol n] [--out csv] [--dump n,n --dir d]'); process.exit(2); }
const [cx, cy, cw, ch] = opt('crop', '422,240,452,660').split(',').map(Number);
if (![cx, cy, cw, ch].every(Number.isSafeInteger) || cx < 0 || cy < 0 || cw <= 0 || ch <= 0 || cx % 2 || cw % 2 || cy % 2 || ch % 2) { console.error('crop x, y, width and height must be even (yuv420p)'); process.exit(2); }
const col = opt('color', '0,86,179').split(',').map(Number), tol = Number(opt('tol', 48));
const dump = opt('dump') ? new Set(opt('dump').split(',').map(Number)) : null, dir = opt('dir');
if (dump && !dir) { console.error('--dump needs --dir <fresh directory>'); process.exit(2); }
if (dump) fs.mkdirSync(dir, { recursive: true });
const last = dump ? Math.max(...dump) : Infinity;
const ff = spawn('ffmpeg', ['-v', 'error', '-i', v, '-vf', `crop=${cw}:${ch}:${cx}:${cy}`, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { stdio: ['ignore', 'pipe', 'inherit'] });
const FS = cw * ch * 3, counts = [];
let buf = Buffer.alloc(0), n = 0, stopped = false;
ff.stdout.on('data', (d) => {
	if (stopped) return;
	buf = buf.length ? Buffer.concat([buf, d]) : d;
	while (buf.length >= FS) {
		const f = buf.subarray(0, FS);
		if (dump) { if (dump.has(n)) fs.writeFileSync(`${dir}/f${String(n).padStart(6, '0')}.ppm`, Buffer.concat([Buffer.from(`P6\n${cw} ${ch}\n255\n`), f])); }
		else { let c = 0; for (let i = 0; i < FS; i += 3) if (Math.abs(f[i] - col[0]) <= tol && Math.abs(f[i + 1] - col[1]) <= tol && Math.abs(f[i + 2] - col[2]) <= tol) c++; counts.push(c); }
		buf = buf.subarray(FS); n++;
		if (n > last) { stopped = true; ff.kill(); return; }
	}
});
ff.on('error', (error) => { console.error(`decoder could not start: ${error.message}`); process.exitCode = 2; });
ff.on('close', (code, signal) => {
	// --dump deliberately stops after its last requested frame. Full scans must decode to a clean EOF.
	if ((!stopped && (code !== 0 || signal)) || !n || (!stopped && buf.length)) {
		console.error(JSON.stringify({ video: v, error: 'incomplete or failed decode', code, signal, frames: n, trailingBytes: buf.length }));
		process.exitCode = 2; return;
	}
	if (dump) { console.log(JSON.stringify({ video: v, dumped: [...dump].filter((k) => k < n), dir })); return; }
	const out = opt('out'); if (out) fs.writeFileSync(out, counts.map((c, i) => `${i},${c}`).join('\n') + '\n');
	const med = (i) => { const w = counts.slice(Math.max(0, i - 60), i + 61).sort((x, y) => x - y); return w[w.length >> 1]; };
	const dips = [];
	for (let i = 2; i < counts.length - 4; i++) {
		const m = med(i); if (m < 800) continue;
		if (counts[i] >= 0.35 * m || counts[i - 1] < 0.6 * m || counts[i - 2] < 0.6 * m) continue;
		let j = i; while (j < counts.length && j - i < 4 && counts[j] < 0.35 * m) j++;
		if (j - i <= 3 && counts[j] >= 0.6 * m && (counts[j + 1] || 0) >= 0.6 * m) dips.push({ frame: i, len: j - i, during: counts.slice(i, j), before: counts[i - 1], after: counts[j], median: m });
		i = j;
	}
	const lit = counts.filter((c) => c > 0).sort((x, y) => x - y);
	console.log(JSON.stringify({ video: v, frames: counts.length, median: lit[lit.length >> 1], dips }));
	process.exitCode = dips.length ? 1 : 0;
});
