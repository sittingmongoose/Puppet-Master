/* Pip's sound, round two (Fable 5.2). looks.js: what each look is made of, and its four songs.
   Round one was three complete concepts. Jared's answer was to keep all of it as a choice of music: every look now
   has four songs (the Encore arrangement, the House Band song, the Marionette Theatre waltz, and the tune PMConcept7
   plays today), one voice for Pip, and one set of effects in the look's own materials.
   The three song files (concept1/2/3.js) still write the songs; this file gathers them by look. */
(function (G) {
  'use strict';
  const PS = G.PS5, C = PS.concepts;
  const KITS = ['friendly', 'glass', 'basic', 'phosphor', 'teletype', 'nier'];
  // which song a look starts with (Jared, 20 Nov): Encore everywhere, except Glass, Retro Dark and NieR
  PS.DEFAULT_SONG = { friendly: 'encore', glass: 'waltz', basic: 'encore', phosphor: 'band', teletype: 'encore', nier: 'band' };
  // Pip and the window's own sounds stay close in the two big rooms; a song keeps the hall it was written for
  const NEAR = { glass: 'glassNear', ruin: 'ruinNear' };
  // the soft pat something makes when it is set down, in each look's material (never a low thud)
  // how long a click's note may ring where the look's materials ring for seconds (glass, a soft bell): after this it is damped
  const RING = { glass: 0.6, nier: 0.85 };
  /* The highest note an effect may play in a look (a MIDI number). Retro Dark's bell is a thin pulse wave: two octaves
     up, where a sparkle, a cheer and the confetti put it, it pierced. There a note above G6 is played an octave lower. */
  const TOP = { phosphor: 91 };
  /* ... and its bell is the square wave there, not the thin pulse: lower alone moved the note and left the sting
     (a 12.5 % pulse keeps its harmonics; above 2 kHz the sparkle measured the same). */
  const PALX = { phosphor: { bell: 'chip50' } };
  const PAT = { friendly: 'wood', glass: 'click', basic: 'click', phosphor: 'nztick', teletype: 'key', nier: 'click' };
  // a look that has its own machine plays the plain percussion names on it; nothing here maps to a kick or a space bar
  PS.DRUM_MAPS = {
    phosphor: { pawl: 'nztick', knock: 'nztick', tick: 'nztick', tock: 'nztick', click: 'nztick', felt: 'nztick', wood: 'nztick', woodlo: 'nztick' },
    teletype: { tick: 'key', tock: 'key', click: 'key', knock: 'key', felt: 'key', wood: 'key', woodlo: 'key' },
    nier: { wood: 'click', woodlo: 'click', knock: 'felt', pawl: 'click', tick: 'click', tock: 'click', key: 'click', space: 'felt' }
  };
  const FAMILY = [['encore', 'c1', 'Encore'], ['band', 'c2', 'House Band'], ['waltz', 'c3', 'Marionette Theatre']];
  PS.LOOKS = {}; PS.SONGS = {};
  KITS.forEach((kit) => {
    const base = C.c1.looks[kit];
    PS.LOOKS[kit] = { room: NEAR[base.room] || base.room, pal: Object.assign({ pat: PAT[kit] }, base.pal, PALX[kit]), sig: base.sig, special: base.special || null, ring: RING[kit] || 0, top: TOP[kit] || 0 };
    PS.SONGS[kit] = FAMILY.map(([id, c, family]) => {
      const L = C[c].looks[kit], song = L.song;
      song.room = song.room || L.room;
      return { id, family, title: song.title, song, reg: L.reg, motif: L.motif, level: C[c].intensity };
    });
    // the tune PMConcept7 has today: the key and the motif are Encore's, which was built on it
    PS.SONGS[kit].push({ id: 'original', family: 'Original', title: 'Original', song: PS.orig.songs[kit], reg: base.reg, motif: base.motif, level: (s) => (s.asleep ? 0 : 1) });
  });
  PS.KITS = KITS;
})(window);
