#!/usr/bin/env python3
"""Correlate Basic Light string pixels with encoded end-of-frame geometry.

Reads native pixels, without resizing, in a selected 60 fps film interval.
Use pip-bubble-string-anchors with --set frames=1 --set counter=1.
The kit separately judges whether each measured line passes through its rest
anchor; this reader confirms that those line coordinates were actually painted.
"""
import argparse
import gzip
import json
import math
import pathlib
import statistics
import subprocess
from fractions import Fraction
from PIL import Image

p = argparse.ArgumentParser()
p.add_argument('--film', required=True)
p.add_argument('--frames', required=True)
p.add_argument('--screen', required=True)
p.add_argument('--look', default='basic-light', choices=['basic-light'])
p.add_argument('--props', help='comma-separated solid prop IDs; dashed preview strokes need a separate predicate')
p.add_argument('--start', type=float, required=True)
p.add_argument('--seconds', type=float, default=5)
p.add_argument('--out', required=True)
a = p.parse_args()
meta = json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0',
    '-show_entries','stream=width,height,avg_frame_rate','-of','json',a.film]))['streams'][0]
fps = float(Fraction(meta['avg_frame_rate']))
if [meta['width'],meta['height']] != [1920,1080] or abs(fps-60) > .1:
    raise SystemExit('Requires a native 1920x1080, 60 fps film; no resizing or rate conversion')
selected_props = set(a.props.split(',')) if a.props else None

rows = {}
with gzip.open(a.frames, 'rt') as f:
    for line in f:
        ep = json.loads(line)
        if ep['look'] != a.look or ep['screen'] != a.screen:
            continue
        for r in ep['frames']:
            if r.get('paintSeq') and r.get('screen') == a.screen:
                rows[r['paintSeq']] = r
if not rows:
    raise SystemExit('No tagged frames for the selected case')

def points(r):
    matrix = r.get('svgCTM')
    if not matrix:
        if r['layout'] != 'portrait':
            raise RuntimeError('Older captures require Basic portrait geometry')
        # 10-window.css gives the stage a 1px right divider. The SVG fills its
        # content box, whereas the rig's helper map uses rounded offsetWidth.
        # Use the actual SVG viewport, not that different measurement frame.
        sx, sy, width, height = r['stageRect']; width -= 1
        k=min(width/400,height/560)
        matrix=[k,0,0,k,sx+(width-400*k)/2,sy+(height-560*k)/2]
    ma,mb,mc,md,me,mf=matrix
    if abs(mb)>1e-6 or abs(mc)>1e-6:
        raise RuntimeError('Reader requires an axis-aligned SVG viewport')
    y0 = (r.get('visY0') or 0) + 12
    out = []
    for prop in r.get('props', []):
        if selected_props and prop['id'] not in selected_props:
            continue
        if prop['op'] < .5 or prop['state'] == 'out' or prop.get('grounded'):
            continue
        if prop.get('dashed'):
            raise RuntimeError('Select solid props with --props; a dashed gap is not missing string ink')
        for si, ln in enumerate(prop.get('lines', [])):
            if not ln or abs(ln[3]-ln[1]) < 1:
                continue
            for dy in (0, 16, 32):
                y = y0 + dy
                if y >= ln[3] - 15:
                    continue
                py = math.floor(mf + y*md)
                # Compare on the pixel row's centre, not its upper edge.
                scene_y = (py + .5 - mf) / md
                x = ln[0] + (ln[2]-ln[0])*(scene_y-ln[1])/(ln[3]-ln[1])
                out.append((prop['id'], si, dy, me + x*ma, py))
    return out

all_points = [q for r in rows.values() for q in points(r)]
if not all_points:
    raise SystemExit('No visible string samples')
left = max(0, math.floor(min(q[3] for q in all_points))-10)
top = max(0, min(q[4] for q in all_points)-2)
right = min(1920, math.ceil(max(q[3] for q in all_points))+10)
bottom = min(1080, max(q[4] for q in all_points)+3)
width, height = right-left, bottom-top
packed_width = max(168, width)
filters = (f'[0:v]format=rgb24,split=2[t][b];[t]crop=168:8:0:0,pad={packed_width}:8:0:0[tag];'
           f'[b]crop={width}:{height}:{left}:{top},pad={packed_width}:{height}:0:0[box];[tag][box]vstack')
cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-ss', str(a.start), '-i', a.film,
       '-t', str(a.seconds), '-filter_complex', filters, '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']
proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
size = packed_width*(height+8)*3
samples, matched, missing = [], set(), []
index = 0
while True:
    raw = proc.stdout.read(size)
    if not raw:
        break
    if len(raw) != size:
        raise RuntimeError('Partial decoded frame')
    im = Image.frombytes('RGB', (packed_width, height+8), raw).convert('L')
    values = [im.getpixel((i*4+2, 4)) for i in range(42)]
    bits = [1 if v > 160 else 0 if v < 96 else -1 for v in values]
    seq = None
    if bits[:2] == [1, 0] and all(bits[2+i] >= 0 and bits[22+i] == 1-bits[2+i] for i in range(20)):
        seq = sum(bits[2+i] << i for i in range(20))
    if seq in rows:
        matched.add(seq)
        for prop, si, dy, expected, py in points(rows[seq]):
            cx = math.floor(expected)
            xs = list(range(cx-7, cx+8))
            if xs[0] < left or xs[-1] >= right or not top <= py < bottom:
                missing.append(dict(frame=index, seq=seq, prop=prop, reason='outside crop'))
                continue
            profile = [im.getpixel((x-left, py-top+8)) for x in xs]
            background = statistics.median(profile[:2]+profile[-2:])
            weights = [max(0, background-v) for v in profile]
            peak = max(weights[5:10])
            if peak < 8:
                missing.append(dict(frame=index, seq=seq, prop=prop, string=si, reason='no distinct string ink'))
                continue
            # The narrow line is the strongest dark run near the expected crossing.
            at = max(range(5, 10), key=lambda i: weights[i])
            lo = hi = at
            while lo > 0 and weights[lo-1] >= peak/2:
                lo -= 1
            while hi < 14 and weights[hi+1] >= peak/2:
                hi += 1
            native = sum((xs[i]+.5)*weights[i] for i in range(lo, hi+1))/sum(weights[lo:hi+1])
            samples.append(dict(frame=index, seconds=round(a.start+index/fps, 4), seq=seq,
                                prop=prop, string=si, row=dy, expected=expected, native=native,
                                error=abs(native-expected), contrast=peak))
    index += 1
if proc.wait() != 0:
    raise RuntimeError('ffmpeg failed')
bad = [r for r in samples if r['error'] > 1]
result = dict(ok=len(matched) >= 30 and bool(samples) and not bad and not missing, fps=fps, look=a.look, screen=a.screen,
              selectedProps=sorted(selected_props) if selected_props else 'all solid props',
              decodedFrames=index, matchedTags=len(matched), samples=len(samples),
              badSamples=len(bad), missingSamples=len(missing),
              maxError=max((r['error'] for r in samples), default=None), firstBad=bad[:8],
              firstMissing=missing[:8], crop=[left, top, width, height], rows=samples)
pathlib.Path(a.out).write_text(json.dumps(result, separators=(',', ':'), allow_nan=False))
print(json.dumps({k:v for k,v in result.items() if k != 'rows'}))
raise SystemExit(0 if result['ok'] else 1)
