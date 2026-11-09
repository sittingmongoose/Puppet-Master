#!/usr/bin/env python3
"""FO-120: read every native coded frame of each steady outer-symbol interval.

Usage: python3 chat-activity-badge-film-reader.py VIDEO RUN OUT.json
The motion check supplies global capture boxes and calibrated steady/end marks.
No resizing, frame-rate conversion or re-encoding. ffmpeg only decodes/crops.
Working/waiting/failed must change actual symbol pixels; Reduced Motion must
stay still. Complete's entry is retained for visual draw-on review separately.
Stopping bar: reproduced real false passes/product bugs stop; other tool issues
are recorded on TOOL-ISSUES.md. No motion verdict without a finished GPU run,
calibrated marks, 60-fps video and at least 30 decoded frames per interval.
"""
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def decode(video, start, end, box):
    x, y = math.floor(box['x']), math.floor(box['y'])
    w = math.ceil(box['x'] + box['width']) - x
    h = math.ceil(box['y'] + box['height']) - y
    if min(x, y) < 0 or min(w, h) < 1:
        raise ValueError('invalid capture box')
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', str(video),
           '-t', str(end - start), '-vf', f'crop={w}:{h}:{x}:{y}:exact=1',
           '-fps_mode', 'passthrough', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']
    r = subprocess.run(cmd, capture_output=True, check=True)
    size = w * h * 3
    if len(r.stdout) % size:
        raise ValueError('partial decoded frame')
    return w, h, [r.stdout[k:k+size] for k in range(0, len(r.stdout), size)]


def changed(a, b, tolerance=24):
    return sum(max(abs(a[i+k] - b[i+k]) for k in range(3)) > tolerance
               for i in range(0, len(a), 3))


def main():
    video, run, out = map(Path, sys.argv[1:4])
    summary = json.loads((run/'summary.json').read_text())
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate,avg_frame_rate,nb_frames:format=duration',
        '-of', 'json', str(video)]))
    stream = probe['streams'][0]
    rate = stream['r_frame_rate'].split('/')
    fps = float(rate[0])/float(rate[1])
    if abs(fps-60) > .01:
        raise ValueError(f'expected native 60-fps video, got {fps}')
    if summary.get('stopped') or not summary.get('ok'):
        raise ValueError('recording run did not finish successfully')
    marks = {m['label']: m.get('video', m.get('videoAt')) for m in summary.get('marks', [])}
    rows = []
    for p in sorted(run.glob('fo120-motion-*.json')):
        rows.extend(json.loads(p.read_text()))
    if not rows:
        raise ValueError('no motion rows')
    results = []
    for row in rows:
        tag = row['tag']
        if not row.get('captureBox'):
            raise ValueError(f'{tag}: no global capture box')
        start, end = marks.get(tag+' steady'), marks.get(tag+' ends')
        if not isinstance(start, (int, float)) or not isinstance(end, (int, float)) or end <= start:
            raise ValueError(f'{tag}: missing calibrated steady/end marks')
        w, h, frames = decode(video, start + .05, end - .05, row['captureBox'])
        if len(frames) < 30:
            raise ValueError(f'{tag}: only {len(frames)} native frames')
        delta = [changed(frames[0], f) for f in frames]
        maximum = max(delta)
        expected = row.get('nativeExpectation', 'motion')
        ok = maximum >= 2 if expected == 'motion' else maximum <= 1
        result = dict(tag=tag, expectation=expected, start=start, end=end, frames=len(frames),
            width=w, height=h, max_changed_pixels=maximum, different_frames=sum(d > 1 for d in delta), ok=ok)
        results.append(result)
        print(f"{'PASS' if ok else 'FAIL'} {tag}: {len(frames)} native frames, max {maximum} changed pixels ({expected})")
    report = dict(video=str(video), video_sha256=digest(video), run=str(run), fps=fps,
        stream=stream, rows=results, ok=all(r['ok'] for r in results),
        limitation='Native steady-interval pixel evidence. Entry/draw-on and clearance also require the retained film/entry frames.')
    out.write_text(json.dumps(report, indent=2)+'\n')
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
