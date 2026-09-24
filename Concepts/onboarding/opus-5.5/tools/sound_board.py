#!/usr/bin/env python3
"""Listening boards and spectrograms from tools/sound_render.mjs output.

  python3 tools/sound_board.py SOUND_DIR

For each family: board-<family>.wav (every event, trailing silence trimmed, 0.3 s apart, in the kit's event order),
spectrum-<family>.png (labelled). Also board-all.wav (the four kits in turn) and spectrum-all.png (2x2 sheet).
"""
import json
import os
import subprocess
import sys

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
FAMILIES = ['basic', 'friendly', 'glass', 'retro']


def run(cmd):
    subprocess.run(cmd, check=True)


def main():
    d = sys.argv[1]
    rep = json.load(open(os.path.join(d, 'sound.json')))
    boards = []
    for fam in FAMILIES:
        events = [e for e, v in rep['renders'][fam].items() if v]
        inputs, chains = [], []
        for i, ev in enumerate(events):
            inputs += ['-i', os.path.join(d, fam, ev + '.wav')]
            chains.append(f'[{i}:a]areverse,silenceremove=start_periods=1:start_threshold=-62dB,areverse,apad=pad_dur=0.3[a{i}]')
        graph = ';'.join(chains) + ';' + ''.join(f'[a{i}]' for i in range(len(events))) + f'concat=n={len(events)}:v=0:a=1[out]'
        board = os.path.join(d, f'board-{fam}.wav')
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[out]', board])
        boards.append(board)
        spec = os.path.join(d, f'spectrum-{fam}.png')
        label = f'{fam} kit - ' + ' '.join(events)
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', board, '-lavfi',
             f"showspectrumpic=s=1400x360:legend=1:scale=log:color=intensity,drawtext=fontfile={FONT}:text='{label}':x=10:y=8:fontsize=16:fontcolor=white", spec])
    allb = os.path.join(d, 'board-all.wav')
    inputs = []
    for b in boards:
        inputs += ['-i', b]
    graph = ''.join(f'[{i}:a]apad=pad_dur=1[p{i}];' for i in range(len(boards))) + ''.join(f'[p{i}]' for i in range(len(boards))) + f'concat=n={len(boards)}:v=0:a=1[out]'
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[out]', allb])
    specs = [os.path.join(d, f'spectrum-{f}.png') for f in FAMILIES]
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y'] + sum([['-i', s] for s in specs], []) +
        ['-filter_complex', ''.join(f'[{i}:v]' for i in range(4)) + 'vstack=inputs=4[out]', '-map', '[out]', os.path.join(d, 'spectrum-all.png')])
    dur = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', allb], capture_output=True, text=True).stdout.strip()
    print(json.dumps({'boards': boards, 'all': allb, 'seconds': float(dur), 'spectrum': os.path.join(d, 'spectrum-all.png')}))


if __name__ == '__main__':
    main()
