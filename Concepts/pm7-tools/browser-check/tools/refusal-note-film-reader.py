#!/usr/bin/env python3
"""FO87-N1 film reader: per frame, does the refusal note's box show the note's own paint?

diagnostics/refusal-note-film.check.mjs marks "press <tag>" at each press and logs FO87N1-FILM with each case's note
rect (layout, its own slide left out), its ground and ink colours, and when the entry ended after the press. For each
case the reader finds the note's first painted frame (its ground rising at least 0.40 above the box's share just
before, and to at least 0.45, searched from its
wall-clock show time mapped onto the film through the press mark: a look's first paint can lag the page's script by up
to a second) and takes every frame from 0.25 s after it (its own fade-in takes 0.21 s) to 1.75 s (before its own
fade-out at 2.13 s), and counts the share of the note's box (2 px inset) whose
pixels are within 40 of its ground (its fill; the text in its ink takes the rest). A frame is WRONG when that share is
under 0.60: something else is painted over the note. Frames are split into during the entry (before the entry ended) and after it. Usage:
  tools/refusal-note-film-reader.py <video.mp4> <run folder> <out.json>
  tools/refusal-note-film-reader.py --selftest     (synthetic films, no browser: the crop and the entry accounting)
T72 (tool batch 5; opus-recheck-b7f K-A1): the film is converted to rgb24 before it is cropped; cropping the yuv420p film
first rounded an odd crop width down (crop=111:32 gave 31680 bytes for 3 frames, not 31968), so every frame after the
first was sliced 1 px out of step and sheared.
T80 (tool batch 5; astra-review-g6 K2): a frame is in the entry when its own film time is before the entry's end on the
film (the note's script time plus the entry's length, both mapped through the press mark), not when its time after the
note's first painted frame is under the entry's length: with a 976 ms paint lag that counted 51 steady frames as entry
frames (693 entry frames against 285). The sampled window ends at the note's own hiding (hideWall, logged by the
diagnostic) or, without it, at its designed fade-out 2.13 s after it was shown, so a late-painted note's window no
longer crosses its fade-out. Rows the diagnostic marks invalid (an attempt that did not reach its screen or showed no
note, T81) are kept in the report with their reason.
"""
import json, re, subprocess, sys

START, END, OWN_T, TOL, APPEAR = 0.25, 1.75, 0.60, 40, 0.40
FADE_OUT = 2.13   # the note's own fade-out, after it was shown (when the diagnostic logged no hide time)


def frames(video, t0, t1, box):
    x, y, w, h = box
    p = subprocess.run(['ffmpeg', '-v', 'info', '-ss', f'{max(0, t0):.3f}', '-to', f'{t1:.3f}', '-i', video, '-vf', f'format=rgb24,crop={w}:{h}:{x}:{y},showinfo',
                        '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode()[-2000:])
    ts = [float(m) for m in re.findall(r'pts_time:([0-9.]+)', p.stderr.decode())]
    n = w * h * 3
    out = [p.stdout[i:i + n] for i in range(0, len(p.stdout) - n + 1, n)]
    return [(max(0, t0) + (ts[i] if i < len(ts) else i / 60), f) for i, f in enumerate(out)]


def own(buf, ground, ink):
    """share of the box in the note's ground (its fill; its ink is left out: in a light look the page's ground is close
    to the note's ink, so ink would match a box the note does not cover)"""
    n = len(buf) // 3
    k = 0
    for i in range(0, len(buf), 3):
        px = buf[i:i + 3]
        if max(abs(px[j] - ground[j]) for j in range(3)) <= TOL:
            k += 1
    return k / max(1, n)


def in_entry(ft, t_js, end):
    """T80: a frame is in the entry when its film time is before the entry's end on the film"""
    return ft < t_js + end


def window_end(t, t_js, hide):
    """T80: the sampled window ends at END after the first paint, and never past the note's own hiding"""
    return min(t + END, (t_js + hide - 0.05) if hide is not None else t_js + FADE_OUT - 0.05)


def selftest():
    import os, tempfile
    d = tempfile.mkdtemp(prefix='rnfr-')
    try:
        v = os.path.join(d, 'odd.mp4')
        # 60 frames at 60 fps, 64x48 white, a red box at x 7..43 (37 px wide, odd) and y 5..25, yuv420p as a recording is
        r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=white:s=64x48:r=60:d=1', '-vf', 'drawbox=x=7:y=5:w=37:h=21:color=red:t=fill',
                            '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '0', '-y', v], capture_output=True)
        assert r.returncode == 0, r.stderr.decode()[-500:]
        box = (9, 7, 33, 17)   # 2 px inside the red box: odd width, odd x
        fr = frames(v, 0, 1, box)
        assert 58 <= len(fr) <= 61, ('frames', len(fr))
        assert all(len(f) == 33 * 17 * 3 for _, f in fr), 'frame size'
        shares = [own(f, [255, 0, 0], [0, 0, 0]) for _, f in fr]
        assert min(shares) >= 0.99, ('the odd crop sheared', min(shares))
        # T80: a note shown at 10.0 s on the film, its entry 0.30 s long, painted 0.976 s late: no frame after 10.30 s is
        # in the entry, and the window ends before the note's fade-out
        t_js, end, t = 10.0, 0.30, 10.976
        assert in_entry(10.29, t_js, end) and not in_entry(10.31, t_js, end) and not in_entry(t + 0.25, t_js, end)
        assert abs(window_end(t, t_js, None) - (t_js + FADE_OUT - 0.05)) < 1e-9 and window_end(t, t_js, None) < t + END
        assert abs(window_end(10.0, 10.0, 1.9) - 11.75) < 1e-9 and abs(window_end(10.0, 10.0, 3.0) - 11.75) < 1e-9
        print('PASS refusal-note-film-reader selftest: an odd crop of a yuv420p film reads whole frames (%d frames, min share %.3f); entry and window bounds by film time' % (len(fr), min(shares)))
    finally:
        for n in os.listdir(d): os.unlink(os.path.join(d, n))
        os.rmdir(d)


def main():
    if sys.argv[1:2] == ['--selftest']:
        return selftest()
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
        if r.get('invalid'):
            report.append({'tag': r['tag'], 'note': False, 'invalid': r['invalid']}); print(r['tag'], 'invalid:', r['invalid']); continue
        if not r.get('rect'):
            report.append({'tag': r['tag'], 'note': False}); print(r['tag'], 'no note'); continue
        at, wall = marks[f"press {r['tag']}"]
        if r.get('noteWall') is None:
            report.append({'tag': r['tag'], 'note': False}); print(r['tag'], 'note never shown'); continue
        t_js = at + (r['noteWall'] - wall) / 1000
        x, y, w, h = r['rect']
        box = (int(round(off['x'] + x)) + 2, int(round(off['y'] + y)) + 2, int(w) - 4, int(h) - 4)
        end = ((r['endWall'] - r['noteWall']) / 1000) if r.get('endWall') is not None else 0
        # the note's first painted frame: the page can paint well after its script shows the note (a look's first, heavy
        # paint), so the window starts from paint, not from the page's clock
        t = None
        fr = frames(video, t_js - 0.25, t_js + 1.6, box)
        base = min(own(f, r['ground'], r['ink']) for _, f in fr[:6]) if fr else 0
        for ft, f in fr:
            if ft >= t_js - 0.1 and own(f, r['ground'], r['ink']) >= max(base + APPEAR, 0.45):
                t = ft; break
        if t is None:
            report.append({'tag': r['tag'], 'note': False, 'painted': False}); print(r['tag'], 'note never painted'); continue
        hide = ((r['hideWall'] - r['noteWall']) / 1000) if r.get('hideWall') is not None else None
        seq = []
        for ft, f in frames(video, t + START, window_end(t, t_js, hide), box):
            share = own(f, r['ground'], r['ink'])
            seq.append({'t': round(ft - t, 3), 'share': round(share, 3), 'entry': in_entry(ft, t_js, end), 'wrong': share < OWN_T})
        wrong = [q for q in seq if q['wrong']]
        report.append({'tag': r['tag'], 'frames': len(seq), 'entryFrames': sum(q['entry'] for q in seq), 'wrong': len(wrong),
                       'wrongInEntry': sum(q['entry'] for q in wrong), 'minShare': min((q['share'] for q in seq), default=None), 'entryAfterNoteMs': round(end * 1000), 'paintLagMs': round((t - t_js) * 1000), 'seq': seq})
        print(f"{r['tag']}: paint lag {report[-1]['paintLagMs']} ms; {len(seq)} frames ({report[-1]['entryFrames']} in the entry), WRONG {len(wrong)} ({report[-1]['wrongInEntry']} in the entry), min share {report[-1]['minShare']}")
    json.dump(report, open(out, 'w'), indent=1)


if __name__ == '__main__':
    main()
