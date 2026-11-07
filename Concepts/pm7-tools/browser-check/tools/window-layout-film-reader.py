#!/usr/bin/env python3
"""FO-88 / FO-92 native paint oracle for window-layout-resize (T75, tool batch 5): on a GPU film of the check, does the
first frame at the new size show the app's new picture, or its old wide one clipped?

checks/window-layout-resize.check.mjs marks '<look> rep <i> 740' just before each shrink and logs WLR-FILM with the
frame's place in the window (CSS px; the film is the window at DPR 1) and its wide and narrow sizes. For each shrink the
reader decodes the film from 0.1 s before the mark for 1.45 s and finds:
  k1  the first frame where the frame's parent is narrow: every sample of the window's ground right of the narrow frame
      (inside the old wide box) is the ground the last frame shows there;
  k2  the first frame from k1 on where the frame's own picture inside the narrow box differs from the frame before k1
      (the wide picture) by more than DIFF (mean channel difference over a 5 px grid).
Every frame from k1 to k2 shows the old picture clipped to the new size. A shrink passes when k2 == k1 (the first frame at
the new size is new paint); one with old frames fails, and one whose k1 or k2 the reader cannot find is 'not proven' and
fails too. The normal surface paints its frame in the same process and should pass on FO-88's fix; the sandbox's
out-of-process frame fails until FO-92 is fixed. Usage:
  tools/window-layout-film-reader.py <film.mp4> <run folder> <out.json> [--fps 60]
  tools/window-layout-film-reader.py --selftest     (synthetic films, no browser)
"""
import json, subprocess, sys

DIFF, GROUND_TOL = 20, 12


def decode(film, t0, dur, W, H):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{max(0, t0):.3f}', '-i', film, '-t', f'{dur:.3f}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode()[-1500:])
    n = W * H * 3
    return [p.stdout[i * n:(i + 1) * n] for i in range(len(p.stdout) // n)]


def probe(film):
    p = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', film], capture_output=True, check=True)
    s = json.loads(p.stdout)['streams'][0]; a, b = s['r_frame_rate'].split('/')
    return s['width'], s['height'], float(a) / float(b)


def judge(seq, W, case):
    fx, fy = case['frame']['x'], case['frame']['y']; nw, nh = case['narrow']['w'], case['narrow']['h']; ww, wh = case['wide']['w'], case['wide']['h']
    px = lambda fr, x, y: fr[(y * W + x) * 3:(y * W + x) * 3 + 3]
    xs = [x for x in range(fx + nw + 20, min(W, fx + ww) - 10, 53)]; ys = [y for y in range(fy + 20, min(len(seq[0]) // 3 // W, fy + wh) - 10, 61)]
    if not xs or not ys:
        return {'label': case['label'], 'verdict': 'not proven', 'why': 'no ground to read right of the narrow frame'}
    g = {(x, y): px(seq[-1], x, y) for x in xs for y in ys}
    ground = lambda fr: all(max(abs(a - b) for a, b in zip(px(fr, x, y), g[(x, y)])) < GROUND_TOL for x in xs for y in ys)
    def d(a, b):
        s = c = 0
        for y in range(fy, fy + nh, 5):
            for x in range(fx, fx + nw, 5):
                i = (y * W + x) * 3; s += abs(a[i] - b[i]) + abs(a[i + 1] - b[i + 1]) + abs(a[i + 2] - b[i + 2]); c += 1
        return s / max(1, c)
    k1 = next((i for i, fr in enumerate(seq) if i > 0 and ground(fr)), None)
    if k1 is None:
        return {'label': case['label'], 'verdict': 'not proven', 'why': 'the parent never shrank on film'}
    base = seq[k1 - 1]
    k2 = next((i for i in range(k1, len(seq)) if d(seq[i], base) > DIFF), None)
    if k2 is None:
        return {'label': case['label'], 'verdict': 'not proven', 'why': 'the frame\'s picture never changed after the shrink', 'k1': k1}
    return {'label': case['label'], 'k1': k1, 'k2': k2, 'oldFrames': k2 - k1, 'verdict': 'pass' if k2 == k1 else 'fail'}


def read(film, run, out, fps=None):
    W, H, f0 = probe(film); fps = fps or f0
    s = json.load(open(f'{run}/summary.json')); marks = {m['label']: m.get('at') for m in s.get('marks') or []}
    cases = [json.loads(l.split('WLR-FILM ', 1)[1]) for l in open(f'{run}/run.log') if 'WLR-FILM ' in l]
    rep = []
    for c in cases:
        at = marks.get(c['label'])
        if at is None:
            rep.append({'label': c['label'], 'verdict': 'not proven', 'why': 'no film mark'}); continue
        r = judge(decode(film, at - 0.1, 1.45, W, H), W, c); r['mode'] = c.get('mode')
        if 'oldFrames' in r: r['oldMs'] = round(r['oldFrames'] * 1000 / fps)
        rep.append(r); print(json.dumps(r))
    bad = [r for r in rep if r['verdict'] != 'pass']
    json.dump({'fps': fps, 'cases': rep, 'pass': not bad and bool(rep)}, open(out, 'w'), indent=1)
    print(f"window-layout-film-reader: {len(rep) - len(bad)}/{len(rep)} shrinks show new paint in their first frame at the new size" + ('' if not bad else f"; {sum(r['verdict'] == 'fail' for r in bad)} show the old picture clipped, {sum(r['verdict'] == 'not proven' for r in bad)} not proven"))
    return 0 if rep and not bad else 1


def selftest():
    import os, tempfile
    W, H, fps = 200, 100, 60
    def film(path, stale):
        # a 'window' 200x100 with a grey ground; the frame at (10, 5), wide 160x80 showing blue stripes, narrow 70x60:
        # frame 6 on, the parent is narrow (ground right of it); the frame's own picture turns orange 'stale' frames later
        fr = []
        for i in range(30):
            b = bytearray([128] * (W * H * 3))
            w, h = (160, 80) if i < 6 else (70, 60)
            new = i >= 6 + stale
            for y in range(5, 5 + h):
                for x in range(10, 10 + w):
                    j = (y * W + x) * 3; b[j:j + 3] = bytes((255, 140, 0)) if new else (bytes((0, 0, 255)) if (x // 8) % 2 else bytes((0, 0, 120)))
            fr.append(bytes(b))
        p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-crf', '0', '-pix_fmt', 'yuv444p', '-y', path], input=b''.join(fr), capture_output=True)
        assert p.returncode == 0, p.stderr.decode()[-400:]
    d = tempfile.mkdtemp(prefix='wlfr-')
    try:
        case = {'label': 'x rep 1 740', 'frame': {'x': 10, 'y': 5}, 'wide': {'w': 160, 'h': 80}, 'narrow': {'w': 70, 'h': 60}}
        for stale, want in [(0, ('pass', 0)), (4, ('fail', 4))]:
            v = os.path.join(d, f's{stale}.mp4'); film(v, stale)
            r = judge(decode(v, 0, 0.5, W, H), W, case)
            assert (r['verdict'], r.get('oldFrames')) == want, (stale, r)
        # no shrink on film: not proven
        v = os.path.join(d, 'none.mp4')
        p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', f'color=c=gray:s={W}x{H}:r={fps}:d=0.5', '-pix_fmt', 'yuv444p', '-c:v', 'libx264', '-crf', '0', '-y', v], capture_output=True); assert p.returncode == 0
        assert judge(decode(v, 0, 0.5, W, H), W, case)['verdict'] == 'not proven'
        print('PASS window-layout-film-reader selftest: new paint at the first narrow frame passes, 4 old frames fail, a film with no shrink is not proven')
    finally:
        for n in os.listdir(d): os.unlink(os.path.join(d, n))
        os.rmdir(d)


if __name__ == '__main__':
    if sys.argv[1:2] == ['--selftest']:
        selftest(); sys.exit(0)
    a = sys.argv[1:]; fps = float(a[a.index('--fps') + 1]) if '--fps' in a else None
    sys.exit(read(a[0], a[1], a[2], fps))
