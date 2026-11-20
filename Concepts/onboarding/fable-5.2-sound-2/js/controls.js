/* The concept bar's sound controls (Fable 5.2): which concept is playing, the mix, what is playing now and which parts
   are in. The page's own controls (look, screen, width, motion, sound on and off) are the Pip concept's (wizard.js). */
(function () {
  'use strict';
  const P = window.PipSound; if (!P) return;
  const $ = (s) => document.querySelector(s), esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const seg = $('#conceptSeg'), mix = $('#mixer'), now = $('#nowPlaying'), partsEl = $('#partsRow'), hint = $('#soundHint');
  const NAMES = { friendly: 'Friendly', glass: 'Glass', basic: 'Basic', phosphor: 'Retro Dark', teletype: 'Retro Light', nier: 'NieR' };
  const PART = { lead: 'tune', bass: 'bass', comp: 'chords', arp: 'arpeggio', drum: 'drums', perc: 'percussion', sparkle: 'bells' };
  if (seg) {
    seg.innerHTML = P.CONCEPTS().map((c, i) => `<button type="button" data-concept="${c.id}" aria-pressed="false" title="${esc(c.blurb)}">${c.id === 'orig' ? 'Today' : (i + 1) + ' ' + esc(c.name)}</button>`).join('');
    seg.addEventListener('click', (e) => { const b = e.target.closest('[data-concept]'); if (!b) return; P.unlock(); P.setConcept(b.dataset.concept); sync(); try { const u = new URL(location.href); u.searchParams.set('sound', b.dataset.concept); history.replaceState(null, '', u); } catch (err) { /* file:// */ } });
  }
  // in the window the tune sits behind the clicks and Pip's voice (about -35 LUFS with everything playing); the
  // listening room starts it louder, since there the tune is what is being listened to
  P.volume('music', 0.5);
  if (mix) {
    mix.innerHTML = [['music', 'Music'], ['voice', 'Pip'], ['sfx', 'Effects']].map(([k, l]) => `<label>${l}<input type="range" min="0" max="150" step="5" value="${Math.round(P.volume(k) * 100)}" data-vol="${k}" aria-label="${l} volume"></label>`).join('');
    mix.addEventListener('input', (e) => { const k = e.target.dataset.vol; if (k) P.volume(k, e.target.value / 100); });
  }
  function sync() {
    const c = P.concept, song = P.song();
    if (seg) seg.querySelectorAll('[data-concept]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.concept === c)));
    document.documentElement.dataset.sound = c;
    if (hint) hint.hidden = P.unlocked;
    if (now) now.textContent = c === 'orig' ? "PMConcept7's sound today, for comparison" : song ? `${NAMES[P.kit]} · “${song.title}” · ${song.meter === 6 ? Math.round(song.bpm / 3) : song.bpm} BPM in ${song.meter === 4 ? 'four' : song.meter === 3 ? 'three' : 'six-eight'}` : '';
    if (partsEl) {
      const seen = {}, rows = c === 'orig' ? [] : P.parts().filter((q) => q.role && PART[q.role]).filter((q) => { const k = q.role; if (seen[k] != null) { seen[k].on = seen[k].on || q.on; return false; } seen[k] = q; return true; });
      partsEl.innerHTML = rows.map((q) => `<i class="${q.on ? 'on' : ''}">${PART[q.role]}</i>`).join('');
    }
  }
  ['concept', 'progress', 'unlock', 'mute', 'music', 'orig'].forEach((t) => P.on(t, sync));
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const themeSel = $('#themeSel'); if (themeSel) themeSel.addEventListener('change', () => setTimeout(sync, 0));
  document.addEventListener('click', () => setTimeout(sync, 0), true);
  sync();
})();
