#!/usr/bin/env python3
"""FO-83 film reader: per frame, is the Look screen's Glass lens drawn on top of Adjust NieR's editor?

For each cycle the film check logs the lens rect and the panel rect, and marks pre / open / settled / close / after.
Reference: the frame at "pre" (the lens on its strip, no editor). For each frame from "open" to "settled" + 0.3 s and from
"close" - 0.1 s to "after": d_lens = mean abs difference of the lens box against the reference, d_ring = the same for a
16 px ring round it (inside the panel). The editor turning up changes the ring; a lens drawn under the editor changes
with it, a lens drawn on top keeps its reference pixels. A frame is WRONG when the ring has changed (d_ring > RING_T: the
editor is there) and the lens box has not followed (d_lens < RATIO * d_ring). That plain rule does NOT see Glass's lens:
the lens is translucent, so when the editor replaces its strip's label beneath it its pixels change on top as well (on
main 0adb197992 it read 0 wrong frames while the lens sat on the editor). Use marker films and --marker. Usage:
  tools/glass-lens-film-reader.py <video.mp4> <run folder> <out.json> [--marker]
With --marker (films recorded with --set marker=1: lenses paint solid magenta) a frame is WRONG when the editor has
arrived round the lens (d_ring > RING_T) and at least half the lens box is still pure magenta: a lens under the editor
is mixed with the rising panel and then gone; a lens on top stays pure.
"""
import json, re, subprocess, sys

RING_T, RATIO, PAD, MAG_T, MAG_WRONG = 6.0, 0.35, 16, 60, 0.5


def marks_and_rows(run):
    s = json.load(open(f'{run}/summary.json'))
    marks = {}
    for m in s.get('marks') or []:
        t = m.get('video', m.get('videoAt', m.get('at')))
        marks[m['label']] = t
    rows = None
    for line in open(f'{run}/run.log'):
        if 'FO83-FILM ' in line:
            rows = json.loads(line.split('FO83-FILM ', 1)[1])
    return s, marks, rows


def frames(video, t0, t1, box):
    x, y, w, h = box
    cmd = ['ffmpeg', '-v', 'info', '-ss', f'{max(0, t0):.3f}', '-to', f'{t1:.3f}', '-i', video, '-vf', f'crop={w}:{h}:{x}:{y},showinfo',
           '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode()[-2000:])
    ts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
    n = w * h * 3
    out = [p.stdout[i:i + n] for i in range(0, len(p.stdout) - n + 1, n)]
    return [(max(0, t0) + (ts[i] if i < len(ts) else i / 60), f) for i, f in enumerate(out)]


def diff(a, b, w, inner):
    """mean abs difference over the lens box (inner) and over the ring round it, and the share of the lens box that is
    pure marker magenta (each channel within MAG_T of #ff00ff) in frame a"""
    li = ls = ri = rs = mg = 0
    x0, y0, x1, y1 = inner
    for k in range(0, len(a), 3):
        p = k // 3
        x, y = p % w, p // w
        d = (abs(a[k] - b[k]) + abs(a[k + 1] - b[k + 1]) + abs(a[k + 2] - b[k + 2])) / 3
        if x0 <= x < x1 and y0 <= y < y1:
            ls += d; li += 1
            if 255 - a[k] <= MAG_T and a[k + 1] <= MAG_T and 255 - a[k + 2] <= MAG_T: mg += 1
        else:
            rs += d; ri += 1
    return ls / max(1, li), rs / max(1, ri), mg / max(1, li)


def main():
    global MARKER
    video, run, out = sys.argv[1:4]
    MARKER = '--marker' in sys.argv
    s, marks, rows = marks_and_rows(run)
    report = []
    for r in rows:
        tag = f"{r['look']} {r['i']}"
        lx, ly, lw, lh = r['lens']
        px, py, pw, ph = r['panel'] or r['win']
        bx, by = max(lx - PAD, px), max(ly - PAD, py)
        bx1, by1 = min(lx + lw + PAD, px + pw), min(ly + lh + PAD, py + ph)
        box = (bx, by, bx1 - bx, by1 - by)
        inner = (lx - bx + 2, ly - by + 2, lx - bx + lw - 2, ly - by + lh - 2)  # 2 px inside the lens edge
        tp, to, ts_, tc, ta = (marks[f'{k} {tag}'] for k in ('pre', 'open', 'settled', 'close', 'after'))
        ref = frames(video, tp, tp + 0.05, box)[0][1]
        pre_mag = diff(ref, ref, box[2], inner)[2]
        cyc = {'cycle': tag, 'box': box, 'preMagenta': round(pre_mag, 3), 'phases': {}}
        for phase, t0, t1 in (('open', to - 0.1, ts_ + 0.3), ('close', tc - 0.1, ta)):
            fr = frames(video, t0, t1, box)
            seq = []
            for t, f in fr:
                dl, dr, mg = diff(f, ref, box[2], inner)
                # marker films: the editor has arrived round the lens and the lens box is still pure magenta
                wrong = dr > RING_T and mg >= MAG_WRONG if MARKER else dr > RING_T and dl < RATIO * dr
                seq.append({'t': round(t, 3), 'dLens': round(dl, 1), 'dRing': round(dr, 1), 'magenta': round(mg, 3), 'wrong': wrong})
            cyc['phases'][phase] = {'frames': len(seq), 'editorFrames': sum(1 for q in seq if q['dRing'] > RING_T),
                                    'wrong': [q for q in seq if q['wrong']], 'seq': seq}
        report.append(cyc)
        o, c = cyc['phases']['open'], cyc['phases']['close']
        print(f"{tag}: pre magenta {pre_mag:.2f}; open {o['frames']} frames, editor in {o['editorFrames']}, WRONG {len(o['wrong'])}; "
              f"close {c['frames']} frames, editor in {c['editorFrames']}, WRONG {len(c['wrong'])}")
    json.dump(report, open(out, 'w'), indent=1)


if __name__ == '__main__':
    main()
