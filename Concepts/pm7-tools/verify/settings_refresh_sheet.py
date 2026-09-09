#!/usr/bin/env python3
"""Tile filmed frames into labelled contact sheets (several scenes per sheet).

Usage: settings_refresh_sheet.py <film-out-dir> <sheet.png> [scene,scene,...] [--stride N] [--cols N] [--width PX]
Labels: frame index and true motion time (ms) from frames.json.  Requires ffmpeg.
"""
import json, os, subprocess, sys, tempfile, glob

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = {a.split('=')[0]: a.split('=')[1] for a in sys.argv[1:] if a.startswith('--') and '=' in a}
film, out = args[0], args[1]
scenes = args[2].split(',') if len(args) > 2 and args[2] != 'all' else sorted(d for d in os.listdir(film) if os.path.isdir(os.path.join(film, d)))
stride, cols, width = int(opts.get('--stride', 2)), int(opts.get('--cols', 6)), int(opts.get('--width', 300))
font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
stage = tempfile.mkdtemp(prefix='pm51sheet')
n = 0
labels = []
for sc in scenes:
    meta = json.load(open(os.path.join(film, sc, 'frames.json')))
    frames = sorted(glob.glob(os.path.join(film, sc, 'f*.jpg')))
    for i, f in enumerate(frames):
        if i % stride: continue
        os.symlink(f, os.path.join(stage, f's{n:04d}.jpg'))
        labels.append(f"{sc} #{i} {meta['frames'][i]['motionMs']:.0f}ms")
        n += 1
rows = (n + cols - 1) // cols
# drawtext per frame via a sendcmd-free approach: burn labels with per-input drawtext, then tile with xstack-like tile filter
inputs, filters, refs = [], [], []
for i in range(n):
    inputs += ['-i', os.path.join(stage, f's{i:04d}.jpg')]
    txt = labels[i].replace(':', '\\:').replace("'", '')
    filters.append(f"[{i}:v]scale={width}:-1,drawtext=fontfile={font}:text='{txt}':x=6:y=6:fontsize=15:fontcolor=white:box=1:boxcolor=0x000000AA:boxborderw=4[v{i}]")
    refs.append(f"[v{i}]")
# pad the grid to a full multiple of cols with black cells
h_probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', os.path.join(stage, 's0000.jpg')], capture_output=True, text=True).stdout.strip().split(',')
w0, h0 = int(h_probe[0]), int(h_probe[1]); cell_h = round(h0 * width / w0)
layout = '|'.join(f"{(i % cols) * (width + 6)}_{(i // cols) * (cell_h + 6)}" for i in range(n))
filters.append(''.join(refs) + f"xstack=inputs={n}:layout={layout}:fill=0x101014[out]")
cmd = ['ffmpeg', '-y', '-loglevel', 'error'] + inputs + ['-filter_complex', ';'.join(filters), '-map', '[out]', '-frames:v', '1', out]
subprocess.run(cmd, check=True)
print(f"{out}: {n} cells ({len(scenes)} scenes, stride {stride}, {cols} columns)")
