#!/usr/bin/env node
// FO-240. The recording is finalized after browser-check exits, so run this after the recorded check.
// Accepts home-agents-first-press's native-press.json or switcher-carry-steps's --set dump= output
// from a Friendly Dark Home or Files rail run with --set film=1. Use --no-pointer-marker.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { nativeStepLimit } from '../helpers/carry-frames.mjs';

const [video, runDir, observations, output] = process.argv.slice(2);
if (!video || !runDir || !observations || !output) {
	console.error('usage: home-agents-first-press-film-reader.mjs <film.mp4> <run folder> <native-press.json or sampler dump> <out.json>');
	process.exit(2);
}

const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const cmd = (name, args) => {
	const r = spawnSync(name, args, { maxBuffer: 64 * 1024 * 1024 });
	if (r.error || r.status !== 0) throw new Error(r.error?.message || r.stderr.toString().trim());
	return r.stdout;
};
const bounds = ([x, y, width, height]) => ({ x, y, width, height });
const marks = json(runDir + '/summary.json').marks || [];
const timeOf = (m) => m?.video ?? m?.videoAt ?? m?.at;
const mark = (label) => timeOf(marks.find((m) => m.label === label));
const holdLimitMs = 1000 / 60;
const samePose = (a, b) => a.left != null && a.right != null && a.left === b.left && a.right === b.right;
// Raster rounding on a fixed chip can move a solid edge by one pixel.
const atRest = (a, b) => a.left != null && a.right != null && b.left != null && b.right != null &&
	Math.abs(a.left - b.left) <= 1 && Math.abs(a.right - b.right) <= 1;

function travelHolds(frames, first, last) {
	const holds = [];
	let start = first;
	for (let i = first + 1; first >= 0 && i <= last + 1; i++) {
		if (i <= last && samePose(frames[start], frames[i])) continue;
		if (i > start + 1) {
			const from = frames[start], to = frames[i - 1];
			holds.push({ from, to, ms: (to.pts - from.pts) * 1000, intervals: to.frame - from.frame });
		}
		start = i;
	}
	return holds;
}

function firstPress(data) {
	if (data.animation) {
		if (!data.firstPress || !data.selected) throw new Error('Missing the trusted first press or its selected destination');
		const rail = data.route === 'rail';
		const { frames, dur, width: w, height: h } = data.animation;
		const kf = frames.map(({ offset: o, transform }) => {
			const m = /^translate\(([-\d.]+)px,\s*([-\d.]+)px\) rotate\(([-\d.]+)deg\) scale\(([-\d.]+),\s*([-\d.]+)\)$/.exec(transform);
			if (!m) throw new Error('The carry keyframe has no readable transform');
			const [dx, dy, r, kx, ky] = m.slice(1).map(Number);
			return { o, dx, dy, r, kx, ky };
		});
		return { from: data.homeBox, to: data.agentsBox, rail, rec: { box: { x: 0, y: 0, w, h }, kf, dur },
			start: mark(rail ? 'First Explorer to Changed press' : 'First Home to Agents press'),
			end: mark(rail ? 'Changed settled' : 'Agents settled') + 0.05 };
	}
	const eligible = (c) => c.look === 'friendly-dark' && c.mode === 'motion';
	const cell = data.cells?.find((c) => eligible(c) && c.group === 'home') ||
		data.cells?.find((c) => eligible(c) && c.group === 'rail');
	const rail = cell?.group === 'rail';
	const label = cell?.tag + ' single 1', start = mark(label);
	const press = data.pageMarks?.find((p) => p.label === label);
	if (!cell || !press) throw new Error('Missing the Friendly Dark first press');
	const strip = rail ? '#sidePanelSlot .pm-segtab' : '.pmw-strip[data-tsm]';
	const before = cell.smp.rows.findLast((r) => r.k === 'task' && r.now < press.pt && r.s[strip]?.items?.length >= 2)?.s[strip];
	const rec = cell.data.anims.find((a) => a.strip === strip && a.created >= press.pt && a.created < cell.ends[0]);
	if (!before || !rec) throw new Error('Missing the first press tab boxes or carry record');
	return { from: bounds(before.items[0]), to: bounds(before.items[1]), rail, rec: { ...rec, kf: rec.kf0, dur: rec.dur0 },
		start, end: Math.min(start + (cell.ends[0] - press.pt) / 1000, mark(cell.tag + ' single 0') - 0.08) };
}

function measure() {
	const { from, to, rail, rec, start, end } = firstPress(json(observations));
	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !(rec.dur > 0) || rec.kf?.length < 2) {
		throw new Error('Missing press marks or a readable motion reference');
	}
	const x = Math.floor(from.x) - 7, y = Math.floor(Math.min(from.y, to.y)) - 10;
	const w = Math.ceil(to.x + to.width) - x + 7;
	const h = Math.ceil(Math.max(from.y + from.height, to.y + to.height)) - y + 6;
	// Use packet presentation times for source-frame ordinals. Decode the matching frames in
	// presentation order without resampling or filling gaps with synthetic images.
	const probe = jsonBuffer(cmd('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_packets', '-show_streams',
		'-show_entries', 'stream=r_frame_rate:packet=pts_time', '-of', 'json', video]));
	if (probe.streams[0]?.r_frame_rate !== '60/1') throw new Error('Expected a 60 fps native recording');
	const pts = probe.packets.map((p) => Number(p.pts_time)).sort((a, b) => a - b);
	const lo = pts.findIndex((t) => t >= start - 0.17), hi = pts.findIndex((t) => t >= end);
	if (lo < 0 || hi - lo < 4) throw new Error('The recording does not cover the press');
	const n = w * h * 3;
	const raw = cmd('ffmpeg', ['-v', 'error', '-threads', '2', '-i', video, '-vf',
		`select='between(n,${lo},${hi})',format=rgb24,crop=${w}:${h}:${x}:${y}:exact=1`,
		'-frames:v', String(hi - lo + 1), '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
	if (raw.length !== n * (hi - lo + 1)) throw new Error('The decoder did not yield all frames in the press');

	// Choose the chip fill from the settled starting tab in the actual recording.
	const colors = new Map();
	for (let j = Math.ceil(from.y - y) + 4; j < from.y - y + from.height - 4; j++) {
		for (let i = Math.ceil(from.x - x) + 4; i < from.x - x + from.width - 4; i++) {
			const rgb = raw.readUIntBE((j * w + i) * 3, 3);
			colors.set(rgb, (colors.get(rgb) || 0) + 1);
		}
	}
	const rgb = [...colors].sort((a, b) => b[1] - a[1])[0]?.[0];
	if (rgb == null) throw new Error('The starting chip fill is unreadable');
	const fill = [rgb >> 16, (rgb >> 8) & 255, rgb & 255];
	// The rail's focus outline and shadow are distinct from its solid fill.
	const matches = rail ? (p) => fill.reduce((sum, v, c) => sum + (v - raw[p + c]) ** 2, 0) <= 20 ** 2
		: (p) => fill.every((v, c) => Math.abs(v - raw[p + c]) <= 24);
	const frames = [];
	const mask = new Uint8Array(w * h), stack = new Int32Array(w * h);
	for (let i = lo; i <= hi; i++) {
		const base = (i - lo) * n;
		mask.fill(0);
		for (let j = 0; j < w * h; j++) if (matches(base + j * 3)) mask[j] = 1;
		// The chip is the largest connected region of its own colour, and only its solid columns
		// count: stray pixels, a motion fringe or the rail's 1-2 px focus outline are separate
		// islands and rings that never carry a column of the solid fill's height.
		let columns = null, largest = 0;
		for (let s = 0; s < w * h; s++) {
			if (!mask[s]) continue;
			let top = 0, size = 0;
			stack[top++] = s, mask[s] = 0;
			const cols = new Uint16Array(w);
			while (top) {
				const q = stack[--top], qx = q % w, qy = (q - qx) / w;
				size++, cols[qx]++;
				if (qx > 0 && mask[q - 1]) stack[top++] = q - 1, mask[q - 1] = 0;
				if (qx < w - 1 && mask[q + 1]) stack[top++] = q + 1, mask[q + 1] = 0;
				if (qy > 0 && mask[q - w]) stack[top++] = q - w, mask[q - w] = 0;
				if (qy < h - 1 && mask[q + w]) stack[top++] = q + w, mask[q + w] = 0;
			}
			if (size > largest) { largest = size; columns = cols; }
		}
		const solid = 5, left = columns?.findIndex((c) => c >= solid) ?? -1, right = columns?.findLastIndex((c) => c >= solid) ?? -1;
		frames.push({ frame: i, pts: pts[i], left: left < 0 ? null : x + left, right: right < 0 ? null : x + right });
	}
	const allow = nativeStepLimit(rec);
	const pairs = frames.slice(1).flatMap((to, i) => {
		const from = frames[i];
		return from.right == null || to.right == null ? [] : [{ from, to, step: Math.abs(to.right - from.right) }];
	});
	const worst = pairs.reduce((a, b) => !a || b.step > a.step ? b : a, null);
	const missing = frames.filter((f) => f.right == null);
	const anchored = (box, slice) => slice.every((f) => f.right != null && Math.abs(f.right - (box.x + box.width)) <= 5);
	const complete = anchored(from, frames.slice(0, 2)) && anchored(to, frames.slice(-2));
	const over = pairs.filter((p) => p.step > allow);
	const first = frames.findIndex((f) => !atRest(f, frames[0]));
	const last = frames.findLastIndex((f) => !atRest(f, frames.at(-1)));
	const holds = travelHolds(frames, first, last);
	// The recorder can express 60 Hz presentation ticks as alternating 16 and 17 ms timestamps.
	const longHolds = holds.filter((hold) => hold.intervals > 1 || hold.ms > Math.ceil(holdLimitMs) + 1e-6);
	const longestHold = holds.reduce((worst, hold) => !worst || hold.ms > worst.ms ? hold : worst, null);
	const ok = Number.isFinite(allow) && complete && !missing.length && !!worst && !over.length && !longHolds.length;
	return { verdict: ok ? 'PASS' : 'FAIL', crop: [x, y, w, h], fill, allow, complete, missing, worst, over,
		pressMark: start, firstMoving: frames[first], rest: frames[last + 1], holdLimitMs, longestHold, longHolds, frames };
}

function jsonBuffer(buffer) { return JSON.parse(buffer.toString('utf8')); }
try {
	const result = measure();
	writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
	const p = result.worst, hold = result.longestHold;
	console.log(`${result.verdict}: ${result.frames.length} native frames, largest right-edge step ${p?.step ?? 'unread'} px` +
		(p ? ` at F${p.from.frame}→F${p.to.frame}, bound ${result.allow.toFixed(2)} px` : '') +
		(hold ? `; longest stationary run in travel ${hold.ms.toFixed(2)} ms at F${hold.from.frame}→F${hold.to.frame}` : '; no stationary run in travel') +
		(!result.complete || result.missing.length ? ' (unread frame or missing settled endpoint)' : ''));
	process.exitCode = result.verdict === 'PASS' ? 0 : 1;
} catch (error) {
	console.error('Could not judge the recorded first press: ' + error.message);
	process.exitCode = 2;
}
