#!/usr/bin/env python3
"""FO87-N1 film reader: per frame, does the refusal note's box show the note's own paint?

diagnostics/refusal-note-film.check.mjs marks "press <tag>" at each press and logs FO87N1-FILM with each case's note
rect (layout, its own slide left out), its ground and ink colours, and when the entry ended after the press. For each
case the reader takes every frame from 0.30 s after the note was shown (its own fade-in takes 0.21 s) to 1.85 s (before
its own fade-out at 2.13 s); the note's and the entry's wall-clock times are mapped onto the film through the press
mark's wall time, and counts the share of the note's box (2 px inset) whose
pixels are within 48 of its ground or its ink. A frame is WRONG when that share is under 0.85: something else is painted
over the note. Frames are split into during the entry (before the entry ended) and after it. Usage:
  tools/refusal-note-film-reader.py <video.mp4> <run folder> <out.json>
"""
import json, re, subprocess, sys

START, END, OWN_T, TOL = 0.30, 1.85, 0.85, 48


def frames(video, t0, t1, box):
    x, y, w, h = box
    p = subprocess.run(['ffmpeg', '-v', 'info', '-ss', f'{max(0, t0):.3f}', '-to', f'{t1:.3f}', '-i', video, '-vf', f'crop={w}:{h}:{x}:{y},showinfo',
                        '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode()[-2000:])
    ts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
    n = w * h * 3
    out = [p.stdout[i:i + n] for i in range(0, len(p.stdout) - n + 1, n)]
    return [(max(0, t0) + (ts[i] if i < len(ts) else i / 60), f) for i, f in enumerate(out)]


def own(buf, ground, ink):
    n = len(buf) // 3
    k = 0
    for i in range(0, len(buf), 3):
        px = buf[i:i + 3]
        if max(abs(px[j] - ground[j]) for j in range(3)) <= TOL or max(abs(px[j] - ink[j]) for j in range(3)) <= TOL:
            k += 1
    return k / max(1, n)


def main():
    video, run, out = sys.argv[1:4]
    s = json.load(open(f'{run}/summary.json'))
    marks = {m['label']: (m.get('at'), m.get('wall')) for m in s.get('marks') or []}
    log = None
    for line in open(f'{run}/run.log'):
        if 'FO87N1-FILM ' in line:
            log = json.loads(line.split('FO87N1-FILM ', 1)[1])
    off = log['off']
    report = []
    for r in log['rows']:
        if not r.get('rect'):
            report.append({'tag': r['tag'], 'note': False}); print(r['tag'], 'no note'); continue
        at, wall = marks[f"press {r['tag']}"]
        if r.get('noteWall') is None:
            report.append({'tag': r['tag'], 'note': False}); print(r['tag'], 'note never shown'); continue
        t = at + (r['noteWall'] - wall) / 1000
        x, y, w, h = r['rect']
        box = (int(round(off['x'] + x)) + 2, int(round(off['y'] + y)) + 2, int(w) - 4, int(h) - 4)
        end = ((r['endWall'] - r['noteWall']) / 1000) if r.get('endWall') is not None else 0
        seq = []
        for ft, f in frames(video, t + START, t + END, box):
            share = own(f, r['ground'], r['ink'])
            seq.append({'t': round(ft - t, 3), 'share': round(share, 3), 'entry': (ft - t) < end, 'wrong': share < OWN_T})
        wrong = [q for q in seq if q['wrong']]
        report.append({'tag': r['tag'], 'frames': len(seq), 'entryFrames': sum(q['entry'] for q in seq), 'wrong': len(wrong),
                       'wrongInEntry': sum(q['entry'] for q in wrong), 'minShare': min((q['share'] for q in seq), default=None), 'entryAfterNoteMs': round(end * 1000), 'seq': seq})
        print(f"{r['tag']}: {len(seq)} frames ({report[-1]['entryFrames']} in the entry), WRONG {len(wrong)} ({report[-1]['wrongInEntry']} in the entry), min share {report[-1]['minShare']}")
    json.dump(report, open(out, 'w'), indent=1)


if __name__ == '__main__':
    main()
