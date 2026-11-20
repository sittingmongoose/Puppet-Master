#!/usr/bin/env node
// FO-240. The recording is finalized after browser-check exits, so run this after the recorded check.
// Accepts home-agents-first-press's native-press.json or switcher-carry-steps's --set dump= output
// from a Friendly Dark Home run with --set film=1. Both films need --no-pointer-marker.
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

function firstPress(data) {
	if (data.animation) {
		if (!data.firstPress || !data.selected) throw new Error('A trusted first press did not select Agents');
		const { frames, dur, width: w, height: h } = data.animation;
		const kf = frames.map(({ offset: o, transform }) => {
			const m = /^translate\(([-\d.]+)px,\s*([-\d.]+)px\) rotate\(([-\d.]+)deg\) scale\(([-\d.]+),\s*([-\d.]+)\)$/.exec(transform);
			if (!m) throw new Error('The carry keyframe has no readable transform');
			const [dx, dy, r, kx, ky] = m.slice(1).map(Number);
			return { o, dx, dy, r, kx, ky };
		});
		return { home: data.homeBox, agents: data.agentsBox, rec: { box: { x: 0, y: 0, w, h }, kf, dur },
			start: mark('First Home to Agents press'), end: mark('Agents settled') + 0.05 };
	}
	const cell = data.cells?.find((c) => c.look === 'friendly-dark' && c.mode === 'motion' && c.group === 'home');
	const label = cell?.tag + ' single 1', start = mark(label);
	const press = data.pageMarks?.find((p) => p.label === label);
	if (!cell || !press) throw new Error('Missing the Friendly Dark Home first press');
	const strip = '.pmw-strip[data-tsm]';
	const before = cell.smp.rows.findLast((r) => r.k === 'task' && r.now < press.pt && r.s[strip]?.items?.length >= 2)?.s[strip];
	const rec = cell.data.anims.find((a) => a.strip === strip && a.created >= press.pt && a.created < cell.ends[0]);
	if (!before || !rec) throw new Error('Missing the first press tab boxes or carry record');
	return { home: bounds(before.items[0]), agents: bounds(before.items[1]), rec: { ...rec, kf: rec.kf0, dur: rec.dur0 },
		start, end: Math.min(start + (cell.ends[0] - press.pt) / 1000, mark(cell.tag + ' single 0') - 0.08) };
}

function measure() {
	const { home, agents, rec, start, end } = firstPress(json(observations));
	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !(rec.dur > 0) || rec.kf?.length < 2) {
		throw new Error('Missing press marks or a readable motion reference');
	}
	const x = Math.floor(home.x) - 7, y = Math.floor(Math.min(home.y, agents.y)) - 10;
	const w = Math.ceil(agents.x + agents.width) - x + 7;
	const h = Math.ceil(Math.max(home.y + home.height, agents.y + agents.height)) - y + 6;
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

	// Choose the chip fill from the interior of settled Home in the actual recording.
	const colors = new Map();
	for (let j = Math.ceil(home.y - y) + 4; j < home.y - y + home.height - 4; j++) {
		for (let i = Math.ceil(home.x - x) + 4; i < home.x - x + home.width - 4; i++) {
			const rgb = raw.readUIntBE((j * w + i) * 3, 3);
			colors.set(rgb, (colors.get(rgb) || 0) + 1);
		}
	}
	const rgb = [...colors].sort((a, b) => b[1] - a[1])[0]?.[0];
	if (rgb == null) throw new Error('The Home fill is unreadable');
	const fill = [rgb >> 16, (rgb >> 8) & 255, rgb & 255];
	const frames = [];
	for (let i = lo; i <= hi; i++) {
		const columns = new Uint16Array(w);
		for (let j = 0; j < h * w; j++) {
			const p = (i - lo) * n + j * 3;
			if (fill.every((v, c) => Math.abs(v - raw[p + c]) <= 24)) columns[j % w]++;
		}
		const left = columns.findIndex((c) => c >= 3), right = columns.findLastIndex((c) => c >= 3);
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
	const complete = anchored(home, frames.slice(0, 2)) && anchored(agents, frames.slice(-2));
	const over = pairs.filter((p) => p.step > allow);
	const ok = Number.isFinite(allow) && complete && !missing.length && !!worst && !over.length;
	return { verdict: ok ? 'PASS' : 'FAIL', crop: [x, y, w, h], fill, allow, complete, missing, worst, over, frames };
}

function jsonBuffer(buffer) { return JSON.parse(buffer.toString('utf8')); }
try {
	const result = measure();
	writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
	const p = result.worst;
	console.log(`${result.verdict}: ${result.frames.length} native frames, largest right-edge step ${p?.step ?? 'unread'} px` +
		(p ? ` at F${p.from.frame}→F${p.to.frame}, bound ${result.allow.toFixed(2)} px` : '') +
		(!result.complete || result.missing.length ? ' (unread frame or missing settled endpoint)' : ''));
	process.exitCode = result.verdict === 'PASS' ? 0 : 1;
} catch (error) {
	console.error('Could not judge the recorded first press: ' + error.message);
	process.exitCode = 2;
}
