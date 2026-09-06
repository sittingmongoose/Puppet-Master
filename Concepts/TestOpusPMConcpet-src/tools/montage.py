#!/usr/bin/env python3
"""Tile arbitrary images into a grid. Unlike -pattern_type glob, this tolerates
inputs of differing sizes (the image2 demuxer stops on a size change)."""
import subprocess, sys, glob, os
pattern, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4
cw = int(sys.argv[4]) if len(sys.argv) > 4 else 440
ch = int(sys.argv[5]) if len(sys.argv) > 5 else 300
files = sorted(glob.glob(pattern))
if not files: sys.exit('no files match ' + pattern)
rows = (len(files) + cols - 1) // cols
args, filt, labels = [], [], []
for i, f in enumerate(files):
    args += ['-i', f]
    name = os.path.basename(f).rsplit('.', 1)[0].split('_')[-1]
    filt.append(
        f"[{i}:v]scale={cw}:{ch}:force_original_aspect_ratio=decrease,"
        f"pad={cw}:{ch}:(ow-iw)/2:(oh-ih)/2:color=0x141418,"
        f"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:"
        f"text='{name}':x=8:y=8:fontsize=15:fontcolor=white:box=1:boxcolor=0x000000AA:boxborderw=4[v{i}]")
    labels.append(f"[v{i}]")
layout = '|'.join(f"{(i%cols)*cw}_{(i//cols)*ch}" for i in range(len(files)))
filt.append(''.join(labels) + f"xstack=inputs={len(files)}:layout={layout}[out]")
subprocess.run(['ffmpeg','-y','-loglevel','error'] + args +
               ['-filter_complex', ';'.join(filt), '-map','[out]','-frames:v','1', out], check=True)
print(f"{out}: {len(files)} tiles, {cols}x{rows}")
