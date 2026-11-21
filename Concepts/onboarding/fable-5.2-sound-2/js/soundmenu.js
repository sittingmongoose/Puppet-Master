/* Pip's sound, round two (Fable 5.2). soundmenu.js: the sound menu.
   Press the speaker and a small menu drops under it, built the way PMConcept7's theme picker is (a row of choices on
   top, then rows to pick from, hung under its button and over the page): sound on or off, the levels of the music, the
   effects and Pip, the four songs of the look on show, and the jukebox. There is one menu; it hangs under whichever
   speaker was pressed (the window's, or the app's beside the theme picker). It only talks to window.PipSound, and it
   keeps nothing itself: PipSound remembers what was set. */
(function (G) {
  'use strict';
  const LOOK = { friendly: 'Friendly', glass: 'Glass', basic: 'Basic', phosphor: 'Retro Dark', teletype: 'Retro Light', nier: 'NieR' };
  const svg = (d, sz) => `<svg width="${sz || 16}" height="${sz || 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 14),
    juke: svg('<path d="M4 7h3.5c5 0 5 10 10 10H20"/><path d="M4 17h3.5c1.6 0 2.7-1 3.6-2.4M14 9.4C14.9 8 16 7 17.5 7H20"/><path d="M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5"/>'),
    next: svg('<path d="M6 5l9 7-9 7z"/><path d="M18 5v14"/>', 14),
    bars: '<span class="psm-bars" aria-hidden="true"><i></i><i></i><i></i></span>'
  };
  let el = null, anchor = null, shown = false;
  const P = () => G.PipSound;
  const pct = (v) => Math.round(Math.max(0, Math.min(1, v)) * 100);

  function build() {
    el = document.createElement('div');
    el.className = 'psm-menu'; el.id = 'psmMenu'; el.hidden = true;
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Sound');
    el.innerHTML = `
      <div class="psm-seg" role="radiogroup" aria-label="Sound">
        <button type="button" role="radio" data-psm-sound="on">Sound on</button>
        <button type="button" role="radio" data-psm-sound="off">Off</button>
      </div>
      <div class="psm-divider" aria-hidden="true"></div>
      ${[['music', 'Music'], ['sfx', 'Effects'], ['voice', 'Pip']].map(([k, t]) => `<label class="psm-slider"><span>${t}</span><input type="range" min="0" max="100" step="1" data-psm-vol="${k}" aria-label="${t} volume"></label>`).join('')}
      <div class="psm-divider" aria-hidden="true"></div>
      <div class="psm-head"><span>Song</span><span data-psm-look></span></div>
      <div data-psm-songs role="radiogroup" aria-label="Song"></div>
      <div class="psm-divider" aria-hidden="true"></div>
      <button type="button" class="psm-item psm-juke" role="switch" data-psm-juke>${IC.juke}<span class="psm-name">Jukebox</span><span class="psm-meta" data-psm-juke-state></span></button>
      <button type="button" class="psm-item psm-skip" data-psm-skip hidden>${IC.next}<span class="psm-name">Next song</span></button>`;
    document.body.appendChild(el);
    el.addEventListener('click', onClick);
    el.addEventListener('input', (e) => { const k = e.target.dataset && e.target.dataset.psmVol; if (k) P().volume(k, +e.target.value / 100); });
    // let go of a slider and hear what it now sounds like: a click's answer for Effects, a word from Pip for Pip
    el.addEventListener('change', (e) => { const k = e.target.dataset && e.target.dataset.psmVol; if (k === 'sfx') P().play('select'); else if (k === 'voice') P().say('Like this?', { mood: 'wonder' }); });
    document.addEventListener('pointerdown', (e) => { if (shown && !el.contains(e.target) && !(anchor && anchor.contains(e.target))) hide(); }, true);
    document.addEventListener('keydown', (e) => { if (shown && e.key === 'Escape') { e.stopPropagation(); hide(true); } }, true);
    G.addEventListener('resize', () => { if (shown) place(); });
    ['mute', 'song', 'jukebox', 'look', 'music', 'volume', 'unlock'].forEach((t) => P().on(t, () => { if (shown) sync(); }));
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const S = P();
    if (b.dataset.psmSound) { S.unlock(); S.setMuted(b.dataset.psmSound === 'off'); if (!S.muted) S.play('toggleOn'); }
    else if (b.dataset.psmSong) { S.unlock(); S.setSong(b.dataset.psmSong); }
    else if (b.dataset.psmJuke != null) { S.unlock(); S.setJukebox(!S.jukebox); S.play(S.jukebox ? 'toggleOn' : 'toggleOff'); }
    else if (b.dataset.psmSkip != null) { S.skip(); }
    sync();
  }
  /* bring the menu into line with PipSound */
  function sync() {
    if (!el) return;
    const S = P(), on = !S.muted;
    el.querySelectorAll('[data-psm-sound]').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.psmSound === 'on') === on)));
    el.querySelectorAll('[data-psm-vol]').forEach((r) => { const v = pct(S.volume(r.dataset.psmVol)); if (+r.value !== v && document.activeElement !== r) r.value = v; r.style.setProperty('--psm-fill', v + '%'); });
    el.querySelector('[data-psm-look]').textContent = LOOK[S.kit] || '';
    const list = S.songs(), playing = on && list.find((s) => s.playing);
    el.querySelector('[data-psm-songs]').innerHTML = list.map((s) => `<button type="button" class="psm-item psm-song" role="radio" aria-checked="${s.chosen}" data-psm-song="${s.id}"${s.playing && on ? ' data-playing' : ''}><span class="psm-mark">${s.playing && on ? IC.bars : s.chosen ? IC.check : ''}</span><span class="psm-name">${s.title}</span>${s.isDefault ? '<span class="psm-meta">Default</span>' : ''}</button>`).join('');
    const j = el.querySelector('[data-psm-juke]'); j.setAttribute('aria-checked', String(S.jukebox)); el.querySelector('[data-psm-juke-state]').textContent = S.jukebox ? 'On' : '';
    el.querySelector('[data-psm-skip]').hidden = !S.jukebox;
    el.toggleAttribute('data-off', !on);
    void playing;
  }
  /* under its button, its right edge on the button's right edge, kept on the page */
  function place() {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    const left = Math.max(8, Math.min(vw - w - 8, r.right - w)), top = r.bottom + 6 + h > vh - 8 ? Math.max(8, r.top - h - 6) : r.bottom + 6;
    el.style.left = Math.round(left) + 'px'; el.style.top = Math.round(top) + 'px';
    el.style.setProperty('--psm-ox', Math.round(((r.left + r.width / 2 - left) / w) * 100) + '%');
  }
  function show(a) {
    if (!el) build();
    if (anchor && anchor !== a) anchor.setAttribute('aria-expanded', 'false');
    anchor = a; shown = true; el.hidden = false; sync(); place();
    a.setAttribute('aria-expanded', 'true'); a.setAttribute('aria-controls', 'psmMenu');
    const S = P(); S.unlock(); S.play('tap');
  }
  function hide(focus) {
    if (!el || !shown) return;
    shown = false; el.hidden = true;
    if (anchor) { anchor.setAttribute('aria-expanded', 'false'); if (focus) try { anchor.focus(); } catch (e) { /* gone */ } }
  }
  G.PipSoundMenu = { toggle(a) { if (shown && anchor === a) hide(); else show(a); }, open: show, close: hide, sync, get isOpen() { return shown; } };
})(window);
