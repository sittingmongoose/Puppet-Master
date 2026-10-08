#!/usr/bin/env python3
"""Listening boards and spectrograms from tools/sound_render.mjs output.

  python3 tools/sound_board.py SOUND_DIR [--events e1,e2,...] [--name NAME]

For each kit in sound.json (basic, friendly, glass, retro, nier): board-<kit>.wav (every event and every variant,
cut at its last sample above -62 dB, 0.3 s apart, in the kit's event order) and spectrum-<kit>.png (log frequency, PX_PER_S
pixels a second). Also board-all.wav (the kits in turn) and board.html, a sheet that lays the spectrograms out in rows
with every sound named at its start and guides at 300 Hz, 1, 3 and 6 kHz (photograph it with a browser; this
ffmpeg may lack drawtext). With --events, only those events (every variant) go on the boards, written as
board-<name>-<kit>.wav, spectrum-<name>-<kit>.png and board-<name>.html (default name 'pick').
"""
import html
import json
import os
import subprocess
import sys
import wave
import array
import math

PX_PER_S = 120
ROW_PX = 1800
HEIGHT = 300
# showspectrumpic's log frequency scale spans three decades below Nyquist (calibrated with sine tones): a row's height
# above the bottom, as a fraction, is log10(f / (sr / 2000)) / 3
GUIDES = [300, 1000, 3000, 6000]


def run(cmd):
    subprocess.run(cmd, check=True)


def wav_name(ev, i, n):
    return f'{ev}-{i + 1}.wav' if n > 1 else f'{ev}.wav'


def board(d, kit, items, path, lengths):
    """each sound cut at its last sample above -62 dB (the length the sheet's labels count), 0.3 s apart"""
    inputs, chains = [], []
    for i, f in enumerate(items):
        inputs += ['-i', os.path.join(d, kit, f)]
        chains.append(f'[{i}:a]atrim=0:{lengths[i]:.4f},apad=pad_dur=0.3[a{i}]')
    graph = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(len(items))) + f'concat=n={len(items)}:v=0:a=1[out]'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[out]', path])


def spectrum(src, path, width):
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-lavfi',
         f"showspectrumpic=s={width}x{HEIGHT}:legend=0:scale=log:fscale=log:color=intensity", path])


def trimmed_seconds(path):
    """the length the board keeps: up to the last sample above -62 dB"""
    with wave.open(path) as w:
        n, sr = w.getnframes(), w.getframerate()
        a = array.array('h', w.readframes(n))
    lim = 32767 * 10 ** (-62 / 20)
    end = 0
    for i in range(len(a) - 1, -1, -1):
        if abs(a[i]) > lim:
            end = i
            break
    return (end + 1) / sr, sr


def sheet(rows, path, title):
    parts = [f'<!doctype html><meta charset="utf-8"><title>{html.escape(title)}</title><style>'
             'body{margin:0;padding:16px 20px;background:#101114;color:#d8d8d8;font:12px/1.3 DejaVu Sans Mono,monospace}'
             'h2{font-size:15px;margin:18px 0 6px;color:#fff}.row{position:relative;overflow:hidden;margin:0 0 26px;border:1px solid #333}'
             '.row img{position:absolute;top:0;display:block}.g{position:absolute;left:0;right:0;border-top:1px dashed rgba(255,255,255,.28)}'
             '.g span{position:absolute;right:4px;top:-14px;color:#aaa;font-size:10px}.m{position:absolute;top:0;bottom:0;border-left:1px solid rgba(255,255,255,.45)}'
             '.m span{position:absolute;top:2px;left:3px;white-space:nowrap;color:#fff;background:rgba(0,0,0,.55);padding:0 3px;font-size:10px;transform-origin:0 0}'
             '.m:nth-child(even) span{top:16px}</style>', f'<h1 style="font-size:17px">{html.escape(title)}</h1>']
    for kit, img, total, items, sr in rows:
        width = int(total * PX_PER_S)
        parts.append(f'<h2>{html.escape(kit)} ({len(items)} sounds, {total:.1f} s)</h2>')
        for r0 in range(0, width, ROW_PX):
            w = min(ROW_PX, width - r0)
            parts.append(f'<div class="row" style="width:{w}px;height:{HEIGHT}px"><img src="{html.escape(os.path.basename(img))}" style="left:{-r0}px;width:{width}px;height:{HEIGHT}px">')
            for f in GUIDES:
                frac = math.log10(f / (sr / 2000)) / 3
                parts.append(f'<div class="g" style="top:{(1 - frac) * HEIGHT:.0f}px"><span>{f if f < 1000 else str(f // 1000) + "k"}</span></div>')
            for label, at in items:
                x = at * PX_PER_S - r0
                if 0 <= x < w:
                    parts.append(f'<div class="m" style="left:{x:.0f}px"><span>{html.escape(label)}</span></div>')
            parts.append('</div>')
    open(path, 'w', encoding='utf-8').write(''.join(parts))


def main():
    d = sys.argv[1]
    args = sys.argv[2:]
    pick = args[args.index('--events') + 1].split(',') if '--events' in args else None
    name = args[args.index('--name') + 1] if '--name' in args else 'pick'
    rep = json.load(open(os.path.join(d, 'sound.json')))
    order = rep.get('events') or []
    boards, specs, rows = [], [], []
    for kit, evs in rep['renders'].items():
        events = [e for e in (order or evs.keys()) if e in evs and (pick is None or e in pick)]
        items, marks, lengths, at, sr = [], [], [], 0.0, 44100
        for ev in events:
            vs = evs[ev]
            for i, v in enumerate(vs):
                f = wav_name(ev, i, len(vs))
                full = os.path.join(d, kit, f)
                if not v or not os.path.exists(full):
                    continue
                items.append(f)
                secs, sr = trimmed_seconds(full)
                lengths.append(secs)
                marks.append((ev + (f' {i + 1}' if len(vs) > 1 else ''), at))
                at += secs + 0.3
        if not items:
            continue
        stem = f'board-{name}-{kit}' if pick else f'board-{kit}'
        b = os.path.join(d, stem + '.wav')
        board(d, kit, items, b, lengths)
        boards.append(b)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', b], capture_output=True, text=True).stdout.strip())
        s = os.path.join(d, (f'spectrum-{name}-{kit}' if pick else f'spectrum-{kit}') + '.png')
        spectrum(b, s, max(200, int(dur * PX_PER_S)))
        specs.append(s)
        rows.append((kit, s, dur, marks, sr))
    sheet(rows, os.path.join(d, f'board-{name}.html' if pick else 'board.html'), f'O55 sound kits - {name if pick else "every event and variant"}')
    allb = os.path.join(d, f'board-{name}-all.wav' if pick else 'board-all.wav')
    inputs = []
    for b in boards:
        inputs += ['-i', b]
    graph = ''.join(f'[{i}:a]apad=pad_dur=1[p{i}];' for i in range(len(boards))) + ''.join(f'[p{i}]' for i in range(len(boards))) + f'concat=n={len(boards)}:v=0:a=1[out]'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[out]', allb])
    dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', allb], capture_output=True, text=True).stdout.strip()
    print(json.dumps({'boards': boards, 'all': allb, 'seconds': float(dur), 'sheet': os.path.join(d, f'board-{name}.html' if pick else 'board.html'), 'spectra': specs}))


if __name__ == '__main__':
    main()
