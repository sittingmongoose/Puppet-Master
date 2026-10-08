#!/usr/bin/env python3
"""Level the sound kits and write the generated tables of src/js/15-sound.js from a tools/sound_render.mjs run.

  python3 tools/sound_catalog.py SOUND_DIR            report: loudness per kit and event against its tier, peaks
  python3 tools/sound_catalog.py SOUND_DIR --write    also rewrite TRIM (dB per kit and event) and DUR (seconds per
                                                      kit, event and variant) between their markers in 15-sound.js
  python3 tools/sound_catalog.py SOUND_DIR --markdown the report as a markdown table (peak and loudness per variant)

Loudness is the render's K-weighted gated RMS (`lk`, see sound_render.mjs). Each event belongs to a tier with a target
loudness, the same for every kit, so a Basic choice and a NieR choice sound equally loud and a celebration stands
above a tap in every look. The trim is the target minus the event's untrimmed loudness (the power mean of its
variants, less the trim the render already carried), rounded to 0.5 dB and held within +-15 dB. A run after --write
should show every event within about 1 dB of its tier. Variants of one event are levelled by hand in the kit; the
report flags any pool whose variants spread more than 4 dB, and any texture pool (heard many times in a row) that
spreads more than 2 dB.

The stings ('chapter' in every kit, NieR's 'quest') are rendered at every depth 0..4 (sound_render.mjs `depths`): one
trim serves all five, so the report checks that every depth, the 1-note stings included, sits within 1.5 dB of the
tier with the trim the depth-4 render (the library's preview) set.
"""
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'src', 'js', '15-sound.js')

# tier -> target loudness (K-weighted gated RMS, dBFS) and its events
TIERS = {
    'signature': (-31.0, ['commit', 'celebrate', 'finish', 'reboot']),
    # nierOn and nierOff lost their choir to 'wake' (the world opening at the reveal): the switch itself is a moment
    'moment': (-33.0, ['success', 'save', 'found', 'quest', 'chapter', 'error', 'missing', 'glitch', 'wake', 'nierOn',
                       'nierOff']),
    'beat': (-35.5, ['next', 'back', 'step', 'checkpoint', 'callout', 'select', 'open', 'close', 'reveal', 'warn',
                     'cheer', 'pod', 'pickup', 'drop', 'sheet', 'unsheet', 'interrupt', 'showInterrupt', 'toggleOn',
                     'toggleOff']),
    'light': (-39.0, ['tap', 'copy', 'arrive', 'phase', 'bow']),
    'soft': (-42.0, ['spot', 'pointer', 'showPointer', 'string']),
    'texture': (-46.0, ['type', 'move', 'decode', 'hover', 'land']),
}
TARGET = {ev: (tier, t) for tier, (t, evs) in TIERS.items() for ev in evs}
# NieR's choir moments sit a little under the tier: gentle and airy, never loud (a long pad sounds fuller than a chime);
# its switch on and off sits just under the wake that follows it
ADJUST = {'nier': {'commit': -2.0, 'celebrate': -3.0, 'finish': -3.0, 'nierOn': -1.0, 'nierOff': -1.0}}
TRIM_RE = re.compile(r'/\* TRIM:begin \*/(.*?)/\* TRIM:end \*/', re.S)
DUR_RE = re.compile(r'/\* DUR:begin \*/(.*?)/\* DUR:end \*/', re.S)


def js_obj(text):
    """The generated tables are plain JSON objects."""
    return json.loads(text) if text.strip() else {}


def power_mean_db(values):
    return 10 * math.log10(sum(10 ** (v / 10) for v in values) / len(values))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    d = sys.argv[1]
    rep = json.load(open(os.path.join(d, 'sound.json')))
    src = open(SRC, encoding='utf-8').read()
    trim_now = js_obj(TRIM_RE.search(src).group(1))
    trims, durs, rows, spread = {}, {}, [], []
    for kit, evs in rep['renders'].items():
        trims[kit], durs[kit] = {}, {}
        for ev, vs in evs.items():
            vs = [v for v in vs if v]
            if not vs:
                continue
            cur = (trim_now.get(kit) or {}).get(ev, 0)
            lk = power_mean_db([v['lk'] for v in vs])
            tier, target = TARGET.get(ev, ('beat', TIERS['beat'][0]))
            target += ADJUST.get(kit, {}).get(ev, 0)
            raw = lk - cur
            new = max(-15.0, min(15.0, round((target - raw) * 2) / 2))
            if abs(new) >= 0.5:
                trims[kit][ev] = new
            ds = [round(max(0.02, v['seconds'] - 0.045), 2) for v in vs]
            durs[kit][ev] = ds if len(ds) > 1 else ds[0]
            lks = [v['lk'] for v in vs]
            if max(lks) - min(lks) > 4 or (tier == 'texture' and max(lks) - min(lks) > 2):
                spread.append(f'{kit}:{ev} {min(lks):.1f}..{max(lks):.1f}')
            rows.append((kit, ev, tier, target, lk, cur, new, max(v['peakDb'] for v in vs), [v['lk'] for v in vs], [v['peakDb'] for v in vs], ds))
    # the stings at every depth, against their tier, with the trim this run carried
    depth_rows = []
    for kit, evs in (rep.get('depths') or {}).items():
        for ev, rs in evs.items():
            tier, target = TARGET.get(ev, ('beat', TIERS['beat'][0]))
            target += ADJUST.get(kit, {}).get(ev, 0)
            for r in rs:
                depth_rows.append((kit, ev, r['variant'], r['depth'], target, r['lk'], r['peakDb'], r['seconds']))
    if '--markdown' in sys.argv:
        print('| kit | event | tier | target | loudness (lk) per variant | peak dBFS per variant | seconds |')
        print('|---|---|---|---|---|---|---|')
        for kit, ev, tier, target, lk, cur, new, pk, lks, pks, ds in rows:
            print(f'| {kit} | {ev} | {tier} | {target:.1f} | ' + ' / '.join(f'{x:.1f}' for x in lks) + ' | '
                  + ' / '.join(f'{x:.1f}' for x in pks) + ' | ' + ' / '.join(f'{x:.2f}' for x in (ds if isinstance(ds, list) else [ds])) + ' |')
        if depth_rows:
            print('\n| kit | sting | take | target | loudness (lk) at depth 0 / 1 / 2 / 3 / 4 | peak dBFS at depth 0 / 1 / 2 / 3 / 4 |')
            print('|---|---|---|---|---|---|')
            keys = sorted({(r[0], r[1], r[2]) for r in depth_rows}, key=lambda x: (list(rep['renders']).index(x[0]), x[1], x[2]))
            for kit, ev, v in keys:
                rs = sorted([r for r in depth_rows if r[:3] == (kit, ev, v)], key=lambda r: r[3])
                print(f'| {kit} | {ev} | {v + 1} | {rs[0][4]:.1f} | ' + ' / '.join(f'{r[5]:.1f}' for r in rs) + ' | '
                      + ' / '.join(f'{r[6]:.1f}' for r in rs) + ' |')
    else:
        print(f"{'kit':9}{'event':12}{'tier':10}{'target':>7}{'lk':>7}{'off':>6}{'trim':>6}{'->':>6}{'peak':>7}")
        for kit, ev, tier, target, lk, cur, new, pk, lks, pks, ds in rows:
            print(f'{kit:9}{ev:12}{tier:10}{target:7.1f}{lk:7.1f}{lk - target:6.1f}{cur:6.1f}{new:6.1f}{pk:7.1f}')
        worst = max(rows, key=lambda r: r[7])
        print(f'\nloudest peak: {worst[0]}:{worst[1]} {worst[7]:.1f} dBFS; pools spreading more than 4 dB: {spread or "none"}')
        off = [r for r in rows if abs(r[4] - r[3]) > 1.5]
        print(f'events more than 1.5 dB from their tier: {len(off)} of {len(rows)}'
              + (': ' + ', '.join(f'{r[0]}:{r[1]} {r[4] - r[3]:+.1f}' for r in off) if off else ''))
        if depth_rows:
            doff = [r for r in depth_rows if abs(r[5] - r[4]) > 1.5]
            worst = max(depth_rows, key=lambda r: abs(r[5] - r[4]))
            print(f'stings by depth: {len(depth_rows)} renders, {len(doff)} more than 1.5 dB from their tier'
                  + (': ' + ', '.join(f'{r[0]}:{r[1]}#{r[2] + 1}@{r[3]} {r[5] - r[4]:+.1f}' for r in doff) if doff else '')
                  + f'; widest {worst[0]}:{worst[1]}#{worst[2] + 1}@{worst[3]} {worst[5] - worst[4]:+.1f} dB')
    if '--write' in sys.argv:
        trims = {k: v for k, v in trims.items() if v}
        t = json.dumps(trims, separators=(',', ':'))
        u = json.dumps(durs, separators=(',', ':'))
        src = TRIM_RE.sub(lambda m: f'/* TRIM:begin */{t}/* TRIM:end */', src)
        src = DUR_RE.sub(lambda m: f'/* DUR:begin */{u}/* DUR:end */', src)
        open(SRC, 'w', encoding='utf-8').write(src)
        print(f'wrote TRIM ({sum(len(v) for v in trims.values())} trims) and DUR to {os.path.relpath(SRC)}')


if __name__ == '__main__':
    main()
