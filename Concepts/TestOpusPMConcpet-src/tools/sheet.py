#!/usr/bin/env python3
"""Build a labelled frame-by-frame contact sheet from a film.mjs frame dir.

Usage: sheet.py <name> <ms-per-frame> [stride] [cols] [crop]
  crop: ffmpeg crop expr applied before scaling, e.g. "iw*0.45:ih*0.8:iw*0.2:ih*0.1"
"""
import subprocess, sys, pathlib, glob, os

name = sys.argv[1]
mspf = float(sys.argv[2])
stride = int(sys.argv[3]) if len(sys.argv) > 3 else 3
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
crop = sys.argv[5] if len(sys.argv) > 5 else None

SCRATCH = "/tmp/claude-1000/-mnt-Cursor-PuppetMaster/b39dbd86-951c-408b-bab8-5d2199315c1f/scratchpad"
src = f"{SCRATCH}/frames_{name}"
files = sorted(glob.glob(f"{src}/f*.jpg"))
picked = files[::stride]
rows = (len(picked) + cols - 1) // cols

stage = f"{SCRATCH}/sheet_{name}"
subprocess.run(["rm", "-rf", stage], check=False)
os.makedirs(stage, exist_ok=True)
for i, f in enumerate(picked):
    os.symlink(f, f"{stage}/s{i:04d}.jpg")

vf = []
if crop: vf.append(f"crop={crop}")
vf.append("scale=440:-1")
vf.append(
  "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
  f"text='%{{eif\\:n*{stride}\\:d}}  |  %{{eif\\:n*{stride}*{mspf}\\:d}}ms':"
  "x=6:y=6:fontsize=17:fontcolor=white:box=1:boxcolor=0x000000AA:boxborderw=5")
vf.append(f"tile={cols}x{rows}:margin=8:padding=6:color=0x101014")

out = f"evidence/{name}_sheet.png"
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "1",
       "-i", f"{stage}/s%04d.jpg", "-vf", ",".join(vf), "-frames:v", "1", out]
subprocess.run(cmd, check=True)
print(f"{out}: {len(picked)} frames (of {len(files)}), stride {stride}, "
      f"{stride*mspf:.1f}ms of real motion between cells, {cols}x{rows}")
