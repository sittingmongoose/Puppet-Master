#!/usr/bin/env node
// FO-240. The recording is finalized after browser-check exits, so run this after the recorded check.
// Accepts home-agents-first-press's native-press.json or switcher-carry-steps's --set dump= output
// from a Friendly Dark Home or Files rail run with --set film=1. Use --no-pointer-marker.
//
// Three rules on the native frames of the first press, all of which must hold (round 6b, 2026-11-21):
//   step   no frame-to-frame step of the chip's right edge over the 60 Hz bound (nativeStepLimit, unchanged);
//   hold   no stationary run inside the travel: from the chip's first moving frame (an edge 2 px or more off its
//          start) until both edges are within REST_PX of where it comes to rest, no three or more consecutive frames
//          with both edges exactly where they were (two equal frames span one 60 Hz frame, 16.7 ms; three span two,
//          33 ms). The rest band leaves out the hop's landing squash (1.06 x 0.9 of the tab, about 3 px an edge),
//          which unwinds slowly at the end of the eased trip;
//   onset  the chip starts within one frame of the pressed tab's own first visible response: the first frame after the
//          press mark in which the tab's pixels (right of the chip's current edge) change sharply from the frame before
//          (by more than 40 levels in 7 % of the tab's pixels on Home: the press's ink flipping on the Agents label is
//          11 %, video noise and a hover transition still running stayed under 6 % on Alexis films; 3 % on the rail,
//          whose Changed tab shows only its icon then: its ink is 4.6 %, its noise 0). The chip's first moving frame may
//          come at most one frame after that one.
// An optional fifth argument names another run's judgment (landed main's, say): the result then also says how many
// frames after the press mark each chip started, and onsetVsReference fails when this chip starts more than one frame
// later than that one.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { nativeStepLimit } from '../helpers/carry-frames.mjs';

const [video, runDir, observations, output, reference] = process.argv.slice(2);
if (!video || !runDir || !observations || !output) {
	console.error('usage: home-agents-first-press-film-reader.mjs <film.mp4> <run folder> <native-press.json or sampler dump> <out.json> [reference judgment.json]');
	process.exit(2);
}
const MOVE_PX = 2, REST_PX = 4, HOLD_FRAMES = 3, ONSET_FRAMES = 1;
const RESPONSE_DIFF = 40, RESPONSE_SHARE = { home: 0.07, rail: 0.03 };

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

	// hold: stationary runs between the first moving frame and the rest band
	const first = frames[0], last = frames[frames.length - 1];
	const off = (f, g, px) => f.left == null || f.right == null || Math.abs(f.left - g.left) >= px || Math.abs(f.right - g.right) >= px;
	const moveAt = missing.length ? -1 : frames.findIndex((f) => off(f, first, MOVE_PX));
	const restAt = moveAt < 0 ? -1 : frames.findIndex((f, i) => i >= moveAt && !off(f, last, REST_PX + 1));
	const holds = [];
	if (moveAt >= 0 && restAt > moveAt) {
		for (let i = moveAt; i < restAt;) {
			let j = i;
			while (j + 1 < restAt && frames[j + 1].left === frames[i].left && frames[j + 1].right === frames[i].right) j++;
			if (j - i + 1 >= HOLD_FRAMES) holds.push({ from: frames[i].frame, to: frames[j].frame, frames: j - i + 1, ms: Math.round((frames[j].pts - frames[i].pts) * 1000), left: frames[i].left, right: frames[i].right });
			i = j + 1;
		}
	}
	const travel = moveAt >= 0 && restAt > moveAt ? { from: frames[moveAt].frame, to: frames[restAt].frame } : null;

	// onset: the pressed tab's first visible response after the press mark, against the chip's first moving frame
	const at0 = pts.findIndex((t) => t >= start) - lo;
	const tb = { x0: Math.ceil(to.x - x) + 2, x1: Math.floor(to.x + to.width - x) - 2, y0: Math.ceil(to.y - y) + 2, y1: Math.floor(to.y + to.height - y) - 2 };
	// (a step from one frame to the next: a hover's colour transition still running at the mark moves a little each
	// frame, the press's mark flips the label's ink in one)
	let responseAt = -1;
	for (let i = Math.max(1, at0); i < frames.length && responseAt < 0; i++) {
		const base = i * n, prev = (i - 1) * n, edge = frames[i].right == null ? -1 : frames[i].right - x + 4;
		let changed = 0;
		for (let j = tb.y0; j < tb.y1; j++) {
			for (let k = Math.max(tb.x0, edge + 1); k < tb.x1; k++) {
				const p = (j * w + k) * 3;
				if (Math.abs(raw[base + p] - raw[prev + p]) > RESPONSE_DIFF || Math.abs(raw[base + p + 1] - raw[prev + p + 1]) > RESPONSE_DIFF || Math.abs(raw[base + p + 2] - raw[prev + p + 2]) > RESPONSE_DIFF) changed++;
			}
		}
		if (changed >= Math.max(40, RESPONSE_SHARE[rail ? 'rail' : 'home'] * (tb.x1 - tb.x0) * (tb.y1 - tb.y0))) responseAt = i;
	}
	const markPts = pts[lo + Math.max(0, at0)];
	const since = (i) => i < 0 ? null : Math.round((frames[i].pts - markPts) * 1000);
	const onset = {
		markFrame: frames[Math.max(0, at0)]?.frame ?? null, response: responseAt < 0 ? null : frames[responseAt].frame, firstMove: moveAt < 0 ? null : frames[moveAt].frame,
		responseMs: since(responseAt), firstMoveMs: since(moveAt), frames: responseAt < 0 || moveAt < 0 ? null : moveAt - responseAt
	};
	const onsetOk = onset.frames != null && onset.frames <= ONSET_FRAMES;
	let vsReference = null;
	if (reference) {
		const ref = json(reference), refMove = ref.onset?.firstMoveMs;
		vsReference = { reference, referenceFirstMoveMs: refMove ?? null, firstMoveMs: onset.firstMoveMs,
			ok: Number.isFinite(refMove) && onset.firstMoveMs != null && onset.firstMoveMs <= refMove + 1000 / 60 + 1 };
	}
	// pane: when the chosen tab's view first shows below the strip. A band under the strip (decoded at half size), each
	// frame against the frame before the press and the settled last frame: the view has come once at least PANE_SHARE of
	// the pixels that differ between those two match the settled frame. Reported (and compared with a reference run's),
	// not one of the three rules
	const PANE_SHARE = 0.8;
	const VW = probe.streams[0]?.width || 1920, VH = probe.streams[0]?.height || 1080;
	const px0 = Math.max(0, Math.floor(rail ? from.x - 7 : from.x - 150)), px1 = Math.min(VW, Math.ceil(rail ? to.x + to.width + 7 : to.x + to.width + 450));
	const py0 = Math.min(VH - 2, Math.ceil(Math.max(from.y + from.height, to.y + to.height) + (rail ? 20 : 30))), py1 = Math.min(VH, py0 + 240);
	let pane = null;
	const pw = Math.floor((px1 - px0) / 4) * 2, ph = Math.floor((py1 - py0) / 4) * 2;
	if (pw >= 8 && ph >= 8) {
		const praw = cmd('ffmpeg', ['-v', 'error', '-threads', '2', '-i', video, '-vf',
			`select='between(n,${lo},${hi})',crop=${pw * 2}:${ph * 2}:${px0}:${py0}:exact=1,scale=${pw}:${ph}:flags=area,format=rgb24`,
			'-frames:v', String(hi - lo + 1), '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
		const pnn = pw * ph * 3;
		if (praw.length === pnn * (hi - lo + 1)) {
			const lastBase = (hi - lo) * pnn, near = (a, b) => Math.abs(praw[a] - praw[b]) <= 24 && Math.abs(praw[a + 1] - praw[b + 1]) <= 24 && Math.abs(praw[a + 2] - praw[b + 2]) <= 24;
			const changed = [];
			for (let p = 0; p < pnn; p += 3) if (!near(p, lastBase + p)) changed.push(p);
			const share = (i) => { if (!changed.length) return 0; let m = 0; for (const p of changed) if (near(i * pnn + p, lastBase + p)) m++; return m / changed.length; };
			const shares = frames.map((f, i) => Math.round(share(i) * 1000) / 1000);
			const at = shares.findIndex((v, i) => i >= Math.max(0, at0) && v >= PANE_SHARE);
			pane = { band: [px0, py0, pw * 2, ph * 2], changedPixels: changed.length, frame: at < 0 ? null : frames[at].frame, ms: since(at), share: PANE_SHARE,
				afterChipMs: at < 0 || moveAt < 0 ? null : Math.round((frames[at].pts - frames[moveAt].pts) * 1000), shares };
		}
	}
	if (vsReference) {
		const ref = json(reference), refPane = ref.pane?.ms;
		vsReference.referencePaneMs = refPane ?? null; vsReference.paneMs = pane?.ms ?? null;
		vsReference.paneOk = Number.isFinite(refPane) && pane?.ms != null && pane.ms <= refPane + 1000 / 60 + 1;
	}
	const stepOk = Number.isFinite(allow) && complete && !missing.length && !!worst && !over.length;
	const holdOk = !!travel && !holds.length;
	const ok = stepOk && holdOk && onsetOk && (!vsReference || (vsReference.ok && vsReference.paneOk));
	return { verdict: ok ? 'PASS' : 'FAIL', rules: { step: stepOk, hold: holdOk, onset: onsetOk, ...(vsReference ? { onsetVsReference: vsReference.ok, paneVsReference: vsReference.paneOk } : {}) },
		crop: [x, y, w, h], fill, allow, complete, missing, worst, over, travel, holds, onset, pane, vsReference, frames };
}

function jsonBuffer(buffer) { return JSON.parse(buffer.toString('utf8')); }
try {
	const result = measure();
	writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
	const p = result.worst, hd = result.holds.reduce((a, b) => !a || b.ms > a.ms ? b : a, null), o = result.onset;
	console.log(`${result.verdict}: ${result.frames.length} native frames, largest right-edge step ${p?.step ?? 'unread'} px` +
		(p ? ` at F${p.from.frame}→F${p.to.frame}, bound ${result.allow.toFixed(2)} px` : '') +
		(!result.complete || result.missing.length ? ' (unread frame or missing settled endpoint)' : '') +
		`; ${result.travel ? (hd ? `${result.holds.length} stationary run(s) in travel, longest ${hd.frames} frames (${hd.ms} ms) at F${hd.from}-F${hd.to}` : 'no stationary run in travel') : 'no travel read'}` +
		`; tab response F${o.response ?? '?'} (+${o.responseMs ?? '?'} ms), chip moves F${o.firstMove ?? '?'} (+${o.firstMoveMs ?? '?'} ms), onset ${o.frames ?? '?'} frame(s)` +
		`; view shows F${result.pane?.frame ?? '?'} (+${result.pane?.ms ?? '?'} ms)` +
		(result.vsReference ? `; reference chip +${result.vsReference.referenceFirstMoveMs ?? '?'} ms, view +${result.vsReference.referencePaneMs ?? '?'} ms` : '') +
		` [step ${result.rules.step ? 'ok' : 'FAIL'}, hold ${result.rules.hold ? 'ok' : 'FAIL'}, onset ${result.rules.onset ? 'ok' : 'FAIL'}` +
		(result.vsReference ? `, chip vs reference ${result.rules.onsetVsReference ? 'ok' : 'FAIL'}, view vs reference ${result.rules.paneVsReference ? 'ok' : 'FAIL'}` : '') + ']');
	process.exitCode = result.verdict === 'PASS' ? 0 : 1;
} catch (error) {
	console.error('Could not judge the recorded first press: ' + error.message);
	process.exitCode = 2;
}
