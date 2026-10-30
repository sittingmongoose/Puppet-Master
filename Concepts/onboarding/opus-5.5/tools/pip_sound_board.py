#!/usr/bin/env python3
"""Pip's sound board (SND1): one standalone page with every sound Pip makes in onboarding, in every look, so Jared can
listen (nobody building it can). It wraps the product's own src/js/15-sound-pip.js (no copy of the sounds) in a
stand-in for the one player (an AudioContext and a master gain) and lays out: each look's stage and voice events, Pip
saying any line in any look and mood, a reel of each look's main moments, and the loops (the music in each chapter's
key, and the snore, work, power and swing beds). The window's own clicks are PMConcept7's sound library (O55.sound),
not Pip's, and are not on this board.

  python3 tools/pip_sound_board.py OUT.html
"""
import html, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(HERE, 'src', 'js', '15-sound-pip.js'), encoding='utf8').read()
PAGE = r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Pip's sounds (PMConcept7 onboarding)</title>
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
def main():
    out = sys.argv[1]
    import json
    copy = json.load(open(os.path.join(HERE, 'src', 'copy.d', '48-pip.json'), encoding='utf8'))['pip']['say']
    picks = [('welcome', 'wake', 'happy'), ('look', 'enter', 'idle'), ('where', 'pick:this', 'happy'), ('begin', 'pick:new', 'happy'), ('name', 'empty', 'watch'), ('name', 'typing', 'wonder'),
             ('safe', 'enter', 'idle'), ('review', 'enter', 'think'), ('creating', 'folder', 'think'), ('creating', 'done', 'happy'), ('ai', 'one', 'happy'), ('ready', 'enter', 'happy')]
    lines = [[copy[s][i], m] for s, i, m in picks if s in copy and i in copy[s]]
    rd = lambda f: open(os.path.join(HERE, 'src', 'js', f), encoding='utf8').read().replace('</script', '<\\/script')
    core = '\n'.join(rd(f) for f in ('00-namespace.js', '05-util.js', '10-motion.js'))
    page = PAGE.replace('__CORE__', core).replace('__SOUND__', rd('15-sound.js')).replace('__SRC__', SRC.replace('</script', '<\\/script')).replace('__LINES__', json.dumps(lines))
    open(out, 'w', encoding='utf8').write(page)
    print(out, len(page))
if __name__ == '__main__':
    main()
