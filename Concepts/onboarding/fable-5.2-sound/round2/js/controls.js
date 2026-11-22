/* The bar above the page (Fable 5.2): what is playing now and which of its parts are in. The sound itself is set in
   the sound menu (soundmenu.js); the page's own controls (look, screen, width, motion) are the Pip concept's (wizard.js). */
(function () {
  'use strict';
  const P = window.PipSound; if (!P) return;
  const $ = (s) => document.querySelector(s);
  const now = $('#nowPlaying'), partsEl = $('#partsRow'), hint = $('#soundHint'), shTheme = $('#shTheme');
  const NAMES = { friendly: 'Friendly', glass: 'Glass', basic: 'Basic', phosphor: 'Retro Dark', teletype: 'Retro Light', nier: 'NieR' };
  const PART = { lead: 'tune', bass: 'bass', comp: 'chords', arp: 'arpeggio', drum: 'drums', perc: 'percussion', sparkle: 'bells' };
  let last = '';
  function sync() {
    const e = P.song(), song = e.song, bpm = song.meter === 6 ? Math.round(song.bpm / 3) : Math.round(song.bpm);
    if (hint) hint.hidden = P.unlocked;
    const text = P.muted ? 'Sound is off' : NAMES[e.kit] + ' · ' + (e.title === 'Original' ? 'the original tune' : '“' + e.title + '”') + ' · ' + bpm + ' BPM' + (P.jukebox ? ' · jukebox' : '');
    const seen = {}, rows = P.parts().filter((q) => q.role && PART[q.role]).filter((q) => { const k = q.role; if (seen[k] != null) { seen[k].on = seen[k].on || q.on; return false; } seen[k] = q; return true; });
    const html = rows.map((q) => '<i class="' + (q.on ? 'on' : '') + '">' + PART[q.role] + '</i>').join('');
    // (written only when it changes: a write of the same text still restyles)
    if (now && now.textContent !== text) now.textContent = text;
    if (partsEl && html !== last) { partsEl.innerHTML = html; last = html; }
    if (shTheme) { const t = /Retro/.test(NAMES[P.kit]) ? 'Retro' : NAMES[P.kit]; if (shTheme.textContent !== t) shTheme.textContent = t; }
  }
  ['progress', 'unlock', 'mute', 'music', 'song', 'jukebox', 'look'].forEach((t) => P.on(t, () => setTimeout(sync, 0)));
  sync();
})();
