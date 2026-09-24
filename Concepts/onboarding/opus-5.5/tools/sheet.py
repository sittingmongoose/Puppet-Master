#!/usr/bin/env python3
"""Labelled contact sheets from images (ffmpeg xstack + drawtext; no PIL here).

Usage:
  python3 tools/sheet.py OUT.png --cols 3 --width 720 IMG[=label] IMG[=label] ...
  python3 tools/sheet.py OUT.png --cols 4 --glob '/tmp/o55/shots3/where--*.png'

Each cell is scaled to --width (keeping aspect, padded to the tallest cell) with its label drawn in a strip above.
Labels default to the file stem. Used for screen reviews and for film frame strips (see film tools).
"""
import argparse
import glob as globmod
import json
import os
import subprocess
import sys

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'


def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', path],
                         capture_output=True, text=True, check=True).stdout
    s = json.loads(out)['streams'][0]
    return s['width'], s['height']


def esc(text):
    return text.replace('\\', '\\\\').replace(':', '\\:').replace("'", "’").replace('%', '\\%')


def build(out, items, cols, width, strip=26, bg='0x16181c', fg='0xe8e8e8'):
    sizes = [probe(p) for p, _ in items]
    cell_h = max(int(round(h * width / w)) for w, h in sizes)
    rows = (len(items) + cols - 1) // cols
    inputs, chains, labels = [], [], []
    for i, (path, label) in enumerate(items):
        inputs += ['-i', path]
        chains.append(
            f"[{i}:v]scale={width}:-2:flags=lanczos,pad={width}:{cell_h}:0:0:color={bg},"
            f"pad={width}:{cell_h + strip}:0:{strip}:color={bg},"
            f"drawtext=fontfile={FONT}:text='{esc(label)}':x=8:y=6:fontsize=15:fontcolor={fg}[c{i}]")
        labels.append(f'[c{i}]')
    # fill the grid with blanks so xstack gets a full layout
    n = len(items)
    total = rows * cols
    for j in range(n, total):
        chains.append(f"color=c={bg}:s={width}x{cell_h + strip}:d=1[c{j}]")
        labels.append(f'[c{j}]')
    layout = '|'.join(f"{(k % cols) * width}_{(k // cols) * (cell_h + strip)}" for k in range(total))
    graph = ';'.join(chains) + ';' + ''.join(labels) + f"xstack=inputs={total}:layout={layout}:fill={bg}[out]"
    cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[out]', '-frames:v', '1', out]
    subprocess.run(cmd, check=True)
    return {'out': out, 'cells': n, 'cols': cols, 'rows': rows, 'cell': [width, cell_h + strip]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out')
    ap.add_argument('images', nargs='*')
    ap.add_argument('--cols', type=int, default=3)
    ap.add_argument('--width', type=int, default=640)
    ap.add_argument('--glob')
    a = ap.parse_args()
    items = []
    paths = sorted(globmod.glob(a.glob)) if a.glob else []
    for spec in list(a.images) + paths:
        if '=' in spec and not os.path.exists(spec):
            p, label = spec.split('=', 1)
        else:
            p, label = spec, os.path.splitext(os.path.basename(spec))[0]
        items.append((p, label))
    if not items:
        sys.exit('no images')
    print(json.dumps(build(a.out, items, a.cols, a.width)))


if __name__ == '__main__':
    main()
