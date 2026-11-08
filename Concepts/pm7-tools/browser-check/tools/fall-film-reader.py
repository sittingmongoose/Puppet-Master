#!/usr/bin/env python3
"""Screen QA-7 main-thread rig motion using frame tags visible in a GPU film.

Tags bind sampled geometry to encoded frames. Compositor animations can keep moving while a
main-thread tag is held; those cases require direct native-pixel measurements for adjudication.

python3 fall-film-reader.py --video film.mp4 --run run-folder --out film-progress.json
Requires ffmpeg/ffprobe. Exit 1 means a painted motion/coverage failure; no third-party Python packages.
"""
import argparse
import json
import math
import subprocess
from collections import defaultdict
from fractions import Fraction
from pathlib import Path


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--video', required=True)
    ap.add_argument('--run', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    records, cases = {}, {}
    for file in args.run.glob('*.json'):
        data = json.loads(file.read_text())
        if not isinstance(data, dict) or not data.get('tag'):
            continue
        cases[file.stem] = 0
        for row in data['rows']:
            if 'paintSeq' in row:
                if row['paintSeq'] in records:
                    raise ValueError('frame sequence reused between cases')
                records[row['paintSeq']] = (file.stem, row)
    if not records:
        raise ValueError('no tagged frame records; record the updated onboarding-falls check')
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=r_frame_rate', '-of', 'json', args.video]))
    fps = float(Fraction(meta['streams'][0]['r_frame_rate']))
    proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', args.video, '-vf', 'crop=168:8:0:0',
        '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    props, effects = defaultdict(list), defaultdict(list)
    frames = tagged = 0
    while True:
        raw = proc.stdout.read(168 * 8)
        if not raw:
            break
        if len(raw) != 168 * 8:
            raise ValueError('partial decoded frame')
        bits = [1 if raw[4 * 168 + 4*i + 2] > 160 else 0 if raw[4 * 168 + 4*i + 2] < 96 else -1 for i in range(42)]
        frame = frames
        frames += 1
        if bits[:2] != [1, 0] or any(bits[2+i] < 0 or bits[22+i] != 1-bits[2+i] for i in range(20)):
            continue
        seq = sum(bits[2+i] << i for i in range(20))
        if seq not in records:
            continue
        case, row = records[seq]
        tagged += 1
        cases[case] += 1
        for p in row['props']:
            if p['state'] != 'out' and p['op'] > .1 and p.get('box'):
                # The act card is a separate six-step compositor animation, rather than a rig draw.
                draw = tuple(round(v, 2) for v in p['box']) if p['kind'] == 'act-card' else row['render']
                props[(case, p['id'])].append((frame, p, row['fps'], draw))
        for p in row['fx']:
            effects[(case, p['id'])].append((frame, p, row['render']))
    if proc.wait() != 0:
        raise RuntimeError('ffmpeg could not decode the film')
    results, failures = [], []
    for (case, ident), samples in props.items():
        if len(samples) < 4:
            continue
        y = lambda p: (p['box'][1] + p['box'][3]) / 2
        start, end = y(samples[0][1]), y(samples[-1][1])
        span = end - start
        wire_start = samples[0][1]['len']
        wire_travel = samples[-1][1]['len'] - wire_start
        if span <= 20 or wire_travel <= 20:
            continue  # a resting swing is not another descent
        speed = stall = max_stall = jump = 0
        drawn = [p for i, p in enumerate(samples) if not i or p[3] != samples[i-1][3]]
        # A 10/20 Hz rig holds its pose across several 60 Hz film frames. Measure the
        # next draw from the previous draw, while retaining every filmed hold below.
        for a, b in zip(drawn, drawn[1:]):
            dt = (b[0] - a[0]) / fps
            progress = (a[1]['len'] - wire_start) / wire_travel
            if dt > 0 and .15 < progress < .85:
                dy = abs(y(b[1]) - y(a[1]))
                speed = max(speed, dy / span / dt)
                jump = max(jump, dy)
        for a, b in zip(samples, samples[1:]):
            dt = (b[0] - a[0]) / fps
            progress = (a[1]['len'] - wire_start) / wire_travel
            if dt <= 0 or not .15 < progress < .85:
                continue
            dy = abs(y(b[1]) - y(a[1]))
            dl = b[1]['len'] - a[1]['len']
            # Count a held paint only while the spring is still travelling, including repeated filmed IDs.
            stall = stall + dt*1000 if (dl > .01 and dy < dl*.1) or a[1] is b[1] else 0
            max_stall = max(max_stall, stall)
        cadence = samples[0][2]
        limit = max(60, 1250/cadence) if cadence else 60
        result = dict(case=case, prop=ident, kind=samples[0][1]['kind'], frames=len(samples),
            span=span, maxSpeed=speed, maxJump=jump, maxStallMs=max_stall, stallLimitMs=limit)
        results.append(result)
        if speed > 15 or max_stall >= limit:
            failures.append(result)
    for (case, ident), samples in effects.items():
        if samples[0][1].get('follow'):
            continue
        samples = [p for i, p in enumerate(samples) if not i or p[2] != samples[i-1][2]]
        for a, b in zip(samples, samples[1:]):
            dt = (b[0]-a[0])/fps
            speed = math.hypot(b[1]['x']-a[1]['x'], b[1]['y']-a[1]['y'])/dt if dt > 0 else 0
            if speed >= 1600:
                failures.append(dict(case=case, effect=ident, kind=b[1]['kind'], maxSpeed=speed))
                break
    missing = [case for case, n in cases.items() if n < 5]
    output = dict(ok=bool(results) and not failures and not missing, fps=fps, filmFrames=frames, taggedFrames=tagged,
        cases=cases, missingCases=missing, descents=results, failures=failures)
    args.out.write_text(json.dumps(output, indent=2))
    print(json.dumps({k: output[k] for k in ['ok', 'fps', 'filmFrames', 'taggedFrames', 'missingCases']}))
    print(f'{len(results)} painted descents, {len(failures)} motion failures; {args.out}')
    return 0 if output['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
