#!/usr/bin/env node
// FO-229 film reader: every native frame of each Home tab press in a home-retro-tab-face film, judged with the check's own
// rule (helpers/tab-face-pixels.mjs). The film is recorded with
//   browser-check run checks/home-retro-tab-face.check.mjs --set film=1 --record <video.mp4> --no-pointer-marker ...
// (the pointer ring and the press pulse sit on the label being judged, so the film carries neither). For each press the run
// logs an FO229-FILM row (both tabs' label and glyph boxes, window pixels) and marks "press <tag>" and "settled <tag>". Every
// frame from the press mark to the settled mark is decoded at its own size (ffmpeg crop, rgb24, passthrough timing); the
// frames at the settled mark and at the press mark (before the press reached the page) are the references, a part's glyph
// pixels those that are glyph in both (FO-236); a part is painted when strictly more than half (> 50%) of each group's
// settled core reads 1.8:1 or more from the frame's ground (helpers/tab-face-pixels.mjs). Expected parts (Home glyph,
// Agents label and Agents glyph; Home's icon-only label exception preserved) must be present before and after every press
// (FO229-MISSING-PARTS).
// The verdict is FAIL when any frame of any press leaves a part blank or an expected part is missing/unread, and lists them
// by film frame number (pts x 60).
//   node tools/home-retro-tab-face-film-reader.mjs <video.mp4> <run folder> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { partMask, partContrast, missingTabParts, PAINTED } from '../helpers/tab-face-pixels.mjs';

const [video, run, out] = process.argv.slice(2);
if (!video || !run || !out) { console.error('usage: home-retro-tab-face-film-reader.mjs <video.mp4> <run folder> <out.json>'); process.exit(2); }
const summary = JSON.parse(readFileSync(`${run}/summary.json`, 'utf8'));
const marks = {};
for (const m of summary.marks || []) marks[m.label] = m.video ?? m.videoAt ?? m.at;
const rows = readFileSync(`${run}/run.log`, 'utf8').split('\n').filter((l) => l.includes('FO229-FILM ')).map((l) => JSON.parse(l.split('FO229-FILM ')[1]));
const FPS = 60;

function frames(t0, t1, box) {
	const [x, y, w, h] = box;
	const p = spawnSync('ffmpeg', ['-v', 'info', '-ss', Math.max(0, t0).toFixed(3), '-to', t1.toFixed(3), '-i', video, '-vf', `crop=${w}:${h}:${x}:${y},showinfo`,
		'-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 30 });
	if (p.status) { console.error(String(p.stderr).slice(-2000)); process.exit(2); }
	const ts = [...String(p.stderr).matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1])), n = w * h * 3, list = [];
	for (let i = 0, k = 0; i + n <= p.stdout.length; i += n, k++) list.push({ t: Math.max(0, t0) + (ts[k] ?? k / FPS), img: { width: w, height: h, channels: 3, data: p.stdout.subarray(i, i + n) } });
	return list;
}

const report = { video, run, rule: `painted >= ${PAINTED}:1`, presses: [], blank: 0, frames: 0, unread: [] };
for (const r of rows) {
	const tag = `${r.look} ${r.i} ${r.name}`, tp = marks[`press ${tag}`], ts = marks[`settled ${tag}`];
	if (tp == null || ts == null) { report.unread.push(`${tag}: marks missing`); continue; }
	const missBefore = r.before ? missingTabParts(r.before) : [];
	const missAfter = missingTabParts(r.after);
	for (const miss of new Set([...missBefore, ...missAfter])) report.unread.push(`${tag}: ${miss} missing`);
	const parts = [];
	for (const n of ['Home', 'Agents']) for (const part of ['label', 'glyph']) { const b = r.after && r.after[n] && r.after[n][part]; if (b) parts.push({ name: `${n} ${part}`, b: [b[0] + r.off.x, b[1] + r.off.y, b[2], b[3]] }); }
	if (!parts.length) continue;
	// one crop round both tabs, 4 px of margin; the parts' boxes in its pixels
	const x0 = Math.floor(Math.min(...parts.map((p) => p.b[0])) - 4), y0 = Math.floor(Math.min(...parts.map((p) => p.b[1])) - 4);
	const x1 = Math.ceil(Math.max(...parts.map((p) => p.b[0] + p.b[2])) + 4), y1 = Math.ceil(Math.max(...parts.map((p) => p.b[1] + p.b[3])) + 4);
	const crop = [x0, y0, (x1 - x0) & ~1, (y1 - y0) & ~1];
	const list = frames(tp, ts + 0.02, crop);
	if (list.length < 2) { report.unread.push(`${tag}: ${list.length} frames`); continue; }
	const ref = list[list.length - 1].img, pre = list[0].img, masks = [];
	for (const p of parts) { const m = partMask(ref, [p.b[0] - x0, p.b[1] - y0, p.b[2], p.b[3]], pre); m.name = p.name; if (m.ok) masks.push(m); else report.unread.push(`${tag}: ${p.name} (${m.g.length} glyph px in both the settled frame and the press-mark frame, ${m.groupsKept}/${m.groupsSettled} of its dot and stroke groups kept)`); }
	const bad = [];
	for (const { t, img } of list) {
		const worst = masks.map((m) => ({ part: m.name, ...partContrast(img, m) })).filter((x) => x.c < PAINTED);
		if (worst.length) bad.push({ frame: Math.round(t * FPS), t: Math.round(t * 1000) / 1000, parts: worst.map((x) => `${x.part} ${x.c}:1`) });
	}
	report.frames += list.length; report.blank += bad.length;
	report.presses.push({ tag, firstFrame: Math.round(tp * FPS), lastFrame: Math.round((ts + 0.02) * FPS), frames: list.length, parts: masks.map((m) => m.name), blankFrames: bad });
}
report.verdict = report.presses.length && !report.unread.length && report.blank === 0 ? 'PASS' : 'FAIL';
writeFileSync(out, JSON.stringify(report, null, 1));
console.log(`${report.verdict}: ${report.presses.length} presses, ${report.frames} native frames judged, ${report.blank} with a blank part${report.unread.length ? `, ${report.unread.length} unread` : ''}`);
for (const p of report.presses) if (p.blankFrames.length) console.log(`  ${p.tag}: frames ${p.blankFrames.map((b) => b.frame).join(',')}`);
process.exit(report.verdict === 'PASS' ? 0 : 1);
