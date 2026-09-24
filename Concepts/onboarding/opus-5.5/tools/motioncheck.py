#!/usr/bin/env python3
"""Automatic motion checks for a film directory (f###.jpg + frames.json), using ffmpeg signalstats only.

  python3 tools/motioncheck.py FILM_DIR [FILM_DIR ...] [--json out.json]

Per film it reports:
  luma      mean luminance per frame (0-255)
  energy    mean absolute difference to the previous frame (0-255): the motion curve
  flash     frames whose luminance spikes away from both neighbours (a one-frame blank or flash) -> fail
  dip       the lowest luminance during the change as a share of the settled luminance; a transition that goes
            through an empty frame drops far below 85 % -> fail (not applied to open/close films)
  settle    motion time of the last frame with visible change (energy above the noise floor)
  frozen    for a freeze film (rate 0): every energy value must be ~0
"""
import json
import os
import re
import subprocess
import sys

def stats(dirpath, diff=False):
    vf = ('tblend=all_mode=difference,' if diff else '') + 'signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-'
    cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(dirpath, 'f%03d.jpg'), '-vf', vf, '-f', 'null', '-']
    outp = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    return [float(v) for v in re.findall(r'lavfi\.signalstats\.YAVG=([0-9.]+)', outp)]

def check(dirpath):
    meta = json.load(open(os.path.join(dirpath, 'frames.json')))
    frames = meta['frames']
    luma = stats(dirpath)
    energy = [0.0] + stats(dirpath, diff=True)
    n = min(len(luma), len(frames))
    luma, energy = luma[:n], energy[:n]
    noise = 0.12
    flashes = []
    for i in range(1, n - 1):
        a, b, c = luma[i - 1], luma[i], luma[i + 1]
        spike = min(abs(b - a), abs(b - c))
        if spike > 6 and abs(a - c) < spike * 0.5:
            flashes.append({'frame': i, 'ms': frames[i]['motionMs'], 'spike': round(spike, 2)})
    settled = luma[-1] if n else 0
    start = luma[0] if n else 0
    lo = min(luma) if n else 0
    ref = min(settled, start) or 1
    dip = lo / ref if ref else 1
    moving = [i for i in range(n) if energy[i] > noise]
    settle_ms = frames[moving[-1]]['motionMs'] if moving else 0.0
    first_ms = frames[moving[0]]['motionMs'] if moving else None
    scene = meta.get('scene', '')
    res = {
        'film': dirpath, 'scene': scene, 'theme': meta.get('theme'), 'rate': meta.get('rate'), 'frames': n,
        'firstChangeMs': first_ms, 'settleMs': settle_ms, 'peakEnergy': round(max(energy), 2) if n else 0,
        'dip': round(dip, 3), 'flashes': flashes,
        'curve': [round(e, 2) for e in energy],
    }
    fails = []
    if meta.get('rate') == 0:
        res['frozen'] = all(e <= noise for e in energy[1:])
        if not res['frozen']:
            fails.append('pixels changed while the clock was frozen')
    else:
        if flashes:
            fails.append('one-frame flash or blank at ' + ', '.join(str(f['frame']) for f in flashes))
        if scene not in ('open', 'close') and dip < 0.85:
            fails.append('luminance dipped to %.0f%% of settled (empty frame between screens?)' % (dip * 100))
    res['fails'] = fails
    return res

def main():
    args = sys.argv[1:]
    out = None
    if '--json' in args:
        k = args.index('--json'); out = args[k + 1]; del args[k:k + 2]
    results = [check(d) for d in args]
    for r in results:
        print('%-12s %-16s settle %7.1f ms  first %s  peak %5.2f  dip %.2f  %s' % (
            r['theme'], r['scene'], r['settleMs'], r['firstChangeMs'], r['peakEnergy'], r['dip'], 'FAIL: ' + '; '.join(r['fails']) if r['fails'] else 'ok'))
    if out:
        json.dump(results, open(out, 'w'), indent=1)
    sys.exit(1 if any(r['fails'] for r in results) else 0)

if __name__ == '__main__':
    main()
