#!/usr/bin/env python3
"""Listening boards and spectrograms from tools/sound_render.mjs output.

  python3 tools/sound_board.py SOUND_DIR [--events e1,e2,...] [--name NAME]
  python3 tools/sound_board.py SOUND_DIR --pip         Pip's kits (lane onb) from the same render (sound_render.mjs `pip`):
                                                     board-pip-<kit>.wav, spectrum-pip-<kit>.png and board-pip.html
  python3 tools/sound_board.py --pip-page OUT.html     Pip's listening page (SND1): every Pip sound in every look, live
                                                     through the product's own player (15-sound.js with O55.sound.pip)

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
        n, sr, ch = w.getnframes(), w.getframerate(), w.getnchannels()
        a = array.array('h', w.readframes(n))
    lim = 32767 * 10 ** (-62 / 20)
    end = 0
    for i in range(len(a) - 1, -1, -1):
        if abs(a[i]) > lim:
            end = i
            break
    return (end // ch + 1) / sr, sr  # (frames, whatever the channel count: Pip's takes are stereo)


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


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PIP_PAGE = r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pip's sounds (PMConcept7 onboarding)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{margin:0;font:14px/1.45 system-ui,sans-serif;background:#16171b;color:#e8e8ea}main{max-width:1180px;margin:0 auto;padding:24px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 8px}p{color:#b9bcc6;margin:4px 0 12px}
table{border-collapse:collapse;width:100%}th,td{padding:4px 6px;border-bottom:1px solid #2a2c33;text-align:center}th{font-weight:600}th small,td.ev small{display:block;font-weight:400;color:#8e93a0;font-size:11.5px}
td.ev{text-align:left;width:230px}tr.grp td{text-align:left;font-weight:700;padding-top:14px;color:#9ec5ff}
button{font:inherit;color:inherit;background:#23252c;border:1px solid #3a3d47;border-radius:6px;padding:4px 10px;cursor:pointer}button:hover{border-color:#6ea8fe}button.on{background:#2b4a7a}
.p{width:50px;height:28px;padding:0;font-size:12px}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}input,select{font:inherit;color:inherit;background:#23252c;border:1px solid #3a3d47;border-radius:6px;padding:4px 8px}
#line{width:420px}#typed{min-height:22px;font-weight:600;color:#fff}label{display:inline-flex;gap:6px;align-items:center;margin-right:14px}output{width:34px;display:inline-block}
.note{background:#1d2a1f;border:1px solid #2e5a37;border-radius:8px;padding:10px 12px;color:#cfe8d3}
</style></head><body><main>
<h1>Pip's sounds</h1>
<p>Every sound Pip makes on its onboarding stage, in each look's own kit, synthesised live by the same code the product runs
(<code>15-sound-pip.js</code>). Click once anywhere first: browsers keep sound off until you do.</p>
<p class="note">What to listen for, from your earlier rounds: no hums or drones (Glass's background was a buzz), no two tones a hair
apart, nothing that sounds like a speaker breaking up (Retro Light), NieR's select must not moan, and no deep thump after a NieR page
change. The music is a composed eight-bar tune per look; pick a chapter to hear it move into that chapter's key.</p>
<div class="row"><label>Chapter <select id="chapter"><option value="0">Welcome</option><option value="1">Computer</option><option value="2" selected>Project</option><option value="3">AI</option><option value="4">Ready</option></select></label>
<label>Index <input id="index" type="number" value="1" min="0" max="6" style="width:56px"></label><label>Count <input id="count" type="number" value="3" min="1" max="6" style="width:56px"></label><label>String length <input id="len" type="number" value="160" min="0" max="400" step="20" style="width:70px"></label></div>
<h2>The stage and Pip's voice</h2><table id="grid"></table>
<h2>Pip says</h2>
<div class="row"><input id="line" value="Oh! Hi. I'm Pip. Shall we set things up?"><select id="sayKit"></select><select id="mood"></select><button id="speak" type="button">Say it</button><button id="lines" type="button">Say the setup lines</button></div>
<div id="typed" aria-live="polite"></div>
<h2>A reel: one look's main moments in order</h2><div class="row"><select id="reelKit"></select><button id="reel" type="button">Play the reel</button></div>
<h2>Music and beds</h2><div class="row" id="loopKits"></div><div class="row" id="loops"></div>
</main>
<script>
/* the product's own player (O55.sound, 15-sound.js, with its voice core O55.sound.pip), on the modules it stands on;
   the page has no Settings, so the sound switch is its factory default (on) and the parts registry is absent (all on) */
__CORE__
O55.t = O55.t || ((k) => k);
O55.theme = O55.theme || (() => ({ family: 'basic', mode: 'dark', chosen: 'basic', nier: document.documentElement.getAttribute('data-o55-nier') === 'on' }));
</script>
<script>__SRC__</script>
<script>__SOUND__</script>
<script>
/* sound starts with the first click or key, as in the product */
document.addEventListener('pointerdown', () => { if (O55.sound.unlock) O55.sound.unlock(); }, { capture: true });
</script>
<script>
(function () {
  const $ = (s) => document.querySelector(s), V = O55.pipVoice;
  const NAMES = { friendly: ['Friendly', 'felt, wood, music box'], glass: ['Glass', 'glass bells, water, air'], basic: ['Basic', 'clean sines, soft clicks'], phosphor: ['Retro Dark', 'chip, the CRT'], teletype: ['Retro Light', 'teletype, celesta'], nier: ['NieR', 'YoRHa menu, glockenspiel'] };
  const THEME = { friendly: 'friendly-dark', glass: 'glass-dark', basic: 'basic-dark', phosphor: 'retro-dark', teletype: 'retro-light', nier: 'nier-dark' };
  const ABOUT = { lower: 'a prop lowered on its string', ghost: 'a preview lowers (NieR only: hover is silent elsewhere)', land: 'a prop settles', lift: 'a prop pulled away', hop: 'Pip hops', swing: 'a big swing',
    tryOn: 'Pip tries on a look (NieR only)', sparkle: 'a burst of particles', confetti: 'Ready: the celebration', tick: 'a review line ticked', block: 'a block lands (Creating)', power: 'an AI account connects',
    score: 'Retro: points', lock: 'NieR target lock', decode: 'NieR label decode', slice: 'NieR chapter glitch', degauss: 'Retro Dark chapter change', feed: 'Retro Light paper feed', powerOn: 'the stage switches on',
    powerOff: 'the stage switches off', rail: 'Pip rides the chapter rail', tip: 'Pip answers a ? (the idea chime)', key: 'a letter typed on the sign',
    wake: 'yawn and wake', sleep: 'sigh into sleep', think: 'hmm', happy: 'giggle', wink: 'hehe (once, on Ready)', alert: 'oh!', cheer: 'yay! and a flourish', crew: 'the crew cheers' };
  const GROUPS = [['The stage', ['lower', 'ghost', 'land', 'lift', 'hop', 'swing', 'tryOn', 'sparkle', 'tick', 'block', 'power', 'confetti', 'rail', 'powerOn', 'powerOff', 'tip', 'key']],
    ['Look specials', ['score', 'lock', 'decode', 'slice', 'degauss', 'feed']], ['Pip', ['wake', 'sleep', 'think', 'happy', 'wink', 'alert', 'cheer', 'crew']]];
  const opts = (kit) => ({ kit, chapter: +$('#chapter').value, index: +$('#index').value, count: +$('#count').value, len: +$('#len').value });
  /* the board plays even the events PMConcept7 keeps silent outside NieR, so they can be judged; play() asks for NieR */
  const nierOn = () => document.documentElement.setAttribute('data-o55-nier', 'on'), nierOff = () => document.documentElement.removeAttribute('data-o55-nier');
  const play = (ev, op) => { O55.sound.unlock(); nierOn(); try { return V.play(ev, op); } finally { nierOff(); } };
  let html = '<thead><tr><th></th>' + V.KITS.map((k) => `<th>${NAMES[k][0]}<small>${NAMES[k][1]}</small></th>`).join('') + '</tr></thead><tbody>';
  GROUPS.forEach(([g, evs]) => { html += `<tr class="grp"><td colspan="${V.KITS.length + 1}">${g}</td></tr>`; evs.forEach((ev) => { html += `<tr><td class="ev">${ev}<small>${ABOUT[ev] || ''}</small></td>` + V.KITS.map((k) => `<td><button type="button" class="p" data-ev="${ev}" data-kit="${k}" aria-label="${ev}, ${NAMES[k][0]}">Play</button></td>`).join('') + '</tr>'; }); });
  $('#grid').innerHTML = html + '</tbody>';
  $('#grid').addEventListener('click', (e) => { const b = e.target.closest('.p'); if (!b) return; play(b.dataset.ev, opts(b.dataset.kit)); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 300); });
  ['sayKit', 'reelKit'].forEach((id) => { $('#' + id).innerHTML = V.KITS.map((k) => `<option value="${k}">${NAMES[k][0]}</option>`).join(''); });
  $('#mood').innerHTML = ['idle', 'happy', 'watch', 'wonder', 'think', 'oops', 'sleep', 'wink'].map((m) => `<option>${m}</option>`).join('');
  let typeT = 0;
  function speak(text, kit, mood) {
    O55.sound.unlock(); V.setTheme(THEME[kit]);
    const tm = V.say(text, { kit: THEME[kit], mood });
    const el = $('#typed'); clearInterval(typeT); el.textContent = ''; let i = 0;
    typeT = setInterval(() => { i++; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typeT); }, 1000 / tm.cps);
    return tm.ms;
  }
  $('#speak').addEventListener('click', () => speak($('#line').value, $('#sayKit').value, $('#mood').value));
  $('#line').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#speak').click(); });
  const LINES = __LINES__;
  $('#lines').addEventListener('click', () => { const kit = $('#sayKit').value; let t = 0; LINES.forEach(([l, m]) => { setTimeout(() => speak(l, kit, m), t); t += V.sayTiming(l, { kit: THEME[kit], mood: m }).ms + 650; }); });
  let loopKit = 'friendly';
  $('#loopKits').innerHTML = V.KITS.map((k) => `<button type="button" data-lk="${k}" aria-pressed="${k === loopKit}">${NAMES[k][0]}</button>`).join('');
  $('#loopKits').addEventListener('click', (e) => { const b = e.target.closest('[data-lk]'); if (!b) return; loopKit = b.dataset.lk; O55.sound.unlock(); V.setTheme(THEME[loopKit]); document.querySelectorAll('[data-lk]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.lk === loopKit))); });
  $('#loops').innerHTML = V.LOOPS.map((n) => `<label>${n === 'bed' ? 'music' : n}<input type="range" min="0" max="1" step="0.01" value="0" data-loop="${n}"><output>0</output></label>`).join('');
  $('#loops').addEventListener('input', (e) => { const r = e.target.closest('[data-loop]'); if (!r) return; O55.sound.unlock(); V.setTheme(THEME[loopKit]); V.play('rail', { chapter: +$('#chapter').value, kit: THEME[loopKit] }); V.loop(r.dataset.loop, +r.value); r.nextElementSibling.textContent = (+r.value).toFixed(2); });
  $('#chapter').addEventListener('change', () => V.play('rail', { chapter: +$('#chapter').value, kit: THEME[loopKit] }));
  $('#reel').addEventListener('click', () => {
    const kit = $('#reelKit').value, th = THEME[kit]; O55.sound.unlock(); V.setTheme(th);
    const seq = [['powerOn', {}], ['wake', {}], ['ghost', {}], ['lower', {}], ['land', {}], ['cheer', {}], ['rail', { chapter: 1 }], ['tryOn', {}], ['lower', { len: 220 }], ['tick', { index: 0 }], ['tick', { index: 1 }], ['tick', { index: 2 }],
      ['block', { index: 0, count: 3 }], ['block', { index: 1, count: 3 }], ['block', { index: 2, count: 3 }], ['power', { index: 0 }], ['power', { index: 1 }], ['tip', {}], ['confetti', {}], ['crew', {}], ['wink', {}]];
    let t = 0; seq.forEach(([ev, o]) => { setTimeout(() => play(ev, Object.assign({ kit: th }, o)), t); t += ev === 'confetti' || ev === 'crew' ? 1600 : 700; });
  });
})();
</script></body></html>'''


def pip_page(out):
    """Pip's listening page (SND1): one standalone page with every sound Pip makes in onboarding, in every look, so Jared
    can listen (nobody building it can). It carries the product's own modules (namespace, util, motion, 15-sound.js with
    its voice core O55.sound.pip, and 15-sound-pip.js), so it plays exactly the product's chain: each look's stage and
    voice events, Pip saying any line in any look and mood, a reel of each look's main moments, and the loops (the music
    in each chapter's key, and the snore, work, power and swing beds). The window's own clicks are the sound library's."""
    copy = json.load(open(os.path.join(ROOT, 'src', 'copy.d', '48-pip.json'), encoding='utf8'))['pip']['say']
    picks = [('welcome', 'wake', 'happy'), ('look', 'enter', 'idle'), ('where', 'pick:this', 'happy'), ('begin', 'pick:new', 'happy'), ('name', 'empty', 'watch'), ('name', 'typing', 'wonder'),
             ('safe', 'enter', 'idle'), ('review', 'enter', 'think'), ('creating', 'folder', 'think'), ('creating', 'done', 'happy'), ('ai', 'one', 'happy'), ('ready', 'enter', 'happy')]
    lines = [[copy[s][i], m] for s, i, m in picks if s in copy and i in copy[s]]
    rd = lambda f: open(os.path.join(ROOT, 'src', 'js', f), encoding='utf8').read().replace('</script', '<\\/script')
    core = '\n'.join(rd(f) for f in ('00-namespace.js', '05-util.js', '10-motion.js'))
    page = PIP_PAGE.replace('__CORE__', core).replace('__SOUND__', rd('15-sound.js')).replace('__SRC__', rd('15-sound-pip.js')).replace('__LINES__', json.dumps(lines))
    open(out, 'w', encoding='utf8').write(page)
    print(json.dumps({'page': out, 'bytes': len(page)}))


def pip_board(d):
    """Pip's kits from the same render as the window's: a board and a spectrogram per look's kit, and their sheet"""
    pip = json.load(open(os.path.join(d, 'sound.json'))).get('pip')
    if not pip:
        raise SystemExit('no pip renders in %s/sound.json (run tools/sound_render.mjs without --no-pip)' % d)
    base, rows, boards = os.path.join(d, 'pip'), [], []
    for kit in pip['kits']:
        items, marks, lengths, at, sr = [], [], [], 0.0, 48000
        for r in pip['rows']:
            f = r['key'].replace(':', '-') + '.wav'
            if r['kit'] != kit or not os.path.exists(os.path.join(base, kit, f)):
                continue
            secs, sr = trimmed_seconds(os.path.join(base, kit, f))
            if secs <= 0.01:
                continue
            items.append(f); lengths.append(secs); marks.append((r['key'], at)); at += secs + 0.3
        if not items:
            continue
        b = os.path.join(d, f'board-pip-{kit}.wav')
        board(base, kit, items, b, lengths)
        boards.append(b)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', b], capture_output=True, text=True).stdout.strip())
        s = os.path.join(d, f'spectrum-pip-{kit}.png')
        spectrum(b, s, max(200, int(dur * PX_PER_S)))
        rows.append((kit, s, dur, marks, sr))
    sheet(rows, os.path.join(d, 'board-pip.html'), "Pip's kits - every stage event and loop")
    print(json.dumps({'boards': boards, 'sheet': os.path.join(d, 'board-pip.html')}))


def main():
    if '--pip-page' in sys.argv:
        return pip_page(sys.argv[sys.argv.index('--pip-page') + 1])
    if '--pip' in sys.argv:
        return pip_board(sys.argv[1])
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
