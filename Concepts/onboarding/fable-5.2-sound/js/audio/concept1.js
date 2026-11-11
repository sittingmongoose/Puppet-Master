/* Pip's sound (Fable 5.2). Concept 1, "Encore": PMConcept7's own sound, finished.
   The same six materials (felt and marimba, glass, clean tones, a chip, a typewriter and celesta, a Pod's bell), the
   same gestures, and the same tunes: each look's eight bars are kept note for note as the song's main theme (A). What
   changes is the playing: the theme now has a harmony, a bass, an inner part and a little percussion, a new bridge (B)
   makes it an AABA song, and the parts come in as the person moves through the chapters. Pip asleep is the theme
   alone, as it is today. */
(function (G) {
  'use strict';
  const PS = G.PS5;
  const MODES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixo: [0, 2, 4, 5, 7, 9, 10] };
  PS.MODES = MODES;
  PS.concepts = PS.concepts || {};
  const up = (h, inst, notes, gap, g, dt) => notes.forEach((m, i) => h.n(inst, m, (dt || 0) + i * gap, g));

  /* ---------------------------------------------------------------- Friendly: a music-box lullaby over kalimba and marimba */
  const friendly = {
    id: 'c1-friendly', title: 'Felt Lullaby', bpm: 108, meter: 4, tonic: 0, scale: MODES.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      // A is PMConcept7's own lullaby, note for note; the harmony under it, the parts and the bridge are new
      A: {
        chords: 'C | Am7 | C | G C | C | Am7 | Em | G C',
        mel: `g5 _ e5 _ c5 _ e5 _ | g5 _ a5 g5 e5 _ _ _ | g5 _ e5 _ c5 _ d5 _ | e5 _ d5 _ c5 _ _ _ |
              _ _ g5 _ e5 _ _ _ | c6 _ b5 _ g5 _ a5 _ | g5 _ e5 _ g5 _ _ _ | e5 _ d5 _ c5 _ _ _`,
        ctr: `_ | _ | _ | _ _ _ _ _ _ g6 - | _ | _ | _ | _ _ _ _ _ _ e6 g6`
      },
      B: {
        chords: 'F | G | Em | Am | Dm | G | C | G',
        mel: `a5 - - g5 f5 - a5 - | g5 - - f5 d5 - - - | g5 - - e5 b4 - e5 - | c5 - - - - - e5 - |
              f5 - - e5 d5 - f5 - | g5 - - a5 b5 - g5 - | c6 - - g5 e5 - - - | d5 - - - - - _ _`,
        ctr: `_ | _ _ _ _ _ _ b5 d6 | _ | _ | _ | _ | _ | _ _ g5 - b5 - d6 -`
      }
    },
    tracks: {
      mel: { inst: 'musicbox', oct: 1, gain: 0.5, pan: 0.06, send: 0.5, role: 'lead', from: 0, detune: 3, rest: [5, 4] },
      dbl: { inst: 'marimba', src: 'mel', gain: 0.2, pan: -0.1, send: 0.4, from: 1 },
      bass: { kind: 'bass', inst: 'woodbass', pat: 'r - - f - - r -', lo: 43, gain: 0.34, send: 0.18, role: 'bass', from: 1 },
      arp: { kind: 'pat', inst: 'kalimba', pat: '1 3 2 3 1 3 2 3', lo: 60, gain: 0.24, pan: -0.28, send: 0.45, role: 'arp', from: 2 },
      comp: { kind: 'pat', inst: 'marimba', pat: '_ _ x _ _ _ x? _', lo: 60, voices: 3, gain: 0.17, pan: 0.24, send: 0.4, from: 3 },
      shk: { kind: 'drum', pat: 'm? m? m m? m? m? m m?', gain: 0.13, pan: 0.3, send: 0.2, from: 3, role: 'perc' },
      wd: { kind: 'drum', pat: '_ _ _ _ _ _ _ _ | _ _ _ _ _ _ w? _', gain: 0.16, pan: -0.2, send: 0.3, from: 3 },
      ctr: { inst: 'glock', gain: 0.17, pan: -0.3, send: 0.6, from: 4, role: 'sparkle' },
      work: { kind: 'drum', pat: 'w _ W w _ w W _', gain: 0.17, pan: 0.15, send: 0.3, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'glock', pat: "1 _ 3 _ 2 _ 3 1'", lo: 72, gain: 0.13, pan: 0.2, send: 0.6, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Glass: struck glass in a slow, open line */
  const glass = {
    id: 'c1-glass', title: 'Open Glass', bpm: 100, meter: 4, tonic: 2, scale: MODES.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      // A is PMConcept7's own open arpeggio, note for note
      A: {
        chords: 'D | D | Bm7 | Bm7 | D/A | A | A/C# | D',
        mel: `d5 _ a5 _ d6 _ _ _ | _ _ f#6 _ d6 _ a5 _ | f#5 _ a5 _ c#6 _ _ _ | _ _ _ _ f#6 _ _ _ |
              d6 _ _ a5 _ _ f#5 _ | a5 _ _ _ _ _ _ _ | f#5 _ a5 _ e5 _ _ _ | _ _ d5 _ _ _ _ _`,
        ctr: `_ | _ | _ | _ | _ | _ _ _ _ e6 - - - | _ | _ _ _ _ _ _ a5 -`
      },
      B: {
        chords: 'Em7 | A | F#m7 | Bm7 | Em7 | A | Dmaj7 | Dmaj7',
        mel: `g5 - - - b5 - - a5 | a5 - - - e5 - - - | a5 - - - c#6 - - b5 | d6 - - - - - f#5 - |
              g5 - - - b5 - d6 - | c#6 - - - e6 - - - | f#6 - - - d6 - a5 - | f#5 - - - - - _ _`,
        ctr: `_ | _ _ _ _ c#6 - - - | _ | _ | _ | _ _ _ _ e6 - - - | _ | _ _ f#5 - a5 - d6 -`
      }
    },
    tracks: {
      mel: { inst: 'glass', gain: 0.42, pan: 0.05, send: 0.6, role: 'lead', from: 0 },
      bass: { kind: 'bass', inst: 'softbass', pat: 'r - - - - - f -', lo: 45, gain: 0.32, send: 0.15, role: 'bass', from: 1 },
      arp: { kind: 'pat', inst: 'crystal', pat: '1 _ 3 _ 2 _ 4 _', lo: 62, gain: 0.2, pan: -0.3, send: 0.6, role: 'arp', from: 2 },
      pad: { kind: 'pat', inst: 'vibes', pat: 'x - - - - - - -', lo: 57, voices: 3, gain: 0.1, pan: 0.2, send: 0.5, strum: 0.03, from: 3 },
      drops: { kind: 'pat', inst: 'drop', pat: "_ _ _ _ _ _ 3' _ | _ _ _ 2' _ _ _ _", lo: 74, gain: 0.1, pan: 0.4, send: 0.7, from: 3, role: 'perc' },
      ctr: { inst: 'softbell', gain: 0.2, pan: -0.25, send: 0.7, from: 4, role: 'sparkle' },
      work: { kind: 'drum', pat: 'i? _ _ i? _ _ i? _', gain: 0.16, pan: 0.2, send: 0.5, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'crystal', pat: "4' _ 3' _ 2' _ 3' _", lo: 74, gain: 0.12, pan: 0.25, send: 0.7, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Basic: two clean voices, question and answer */
  const basic = {
    id: 'c1-basic', title: 'Question and Answer', bpm: 94, meter: 4, tonic: 0, scale: MODES.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      // A is PMConcept7's own question and answer, note for note; the second voice answers in its rests
      A: {
        chords: 'C | Am | G | C/B | C | Am | C/G | C',
        mel: `c6 _ _ _ g6 _ _ _ | _ _ e6 _ _ _ _ _ | e6 _ _ _ d6 _ _ _ | _ _ _ _ c6 _ _ _ |
              g6 _ _ _ a6 _ g6 _ | _ _ e6 _ _ _ _ _ | e6 _ _ _ c6 _ _ _ | _`,
        ans: `_ | _ _ _ _ c5 _ e5 _ | _ | g4 _ b4 _ _ _ _ _ | _ | _ _ _ _ a4 _ c5 _ | _ | e4 _ g4 _ c5 _ _ _`,
        ctr: `_ | _ | _ | _ | _ | _ | _ | _ _ _ _ _ _ g5 c6`
      },
      B: {
        chords: 'F | C/E | Dm | G | F | C/E | Dm G | C',
        mel: `a5 - - c6 a5 - f5 - | g5 - - - e5 - - - | f5 - - a5 f5 - d5 - | d5 - - - b4 - - - |
              a5 - - c6 a5 - f5 - | g5 - - - c6 - - - | a5 - f5 - g5 - d5 - | c5 - - - - - _ _`,
        ans: `_ | _ | _ | _ _ _ _ _ _ g4 b4 | _ | _ | _ | _ _ e5 - g5 - c6 -`,
        ctr: `_ | _ _ _ _ _ _ c6 - | _ | _ | _ | _ _ _ _ _ _ e6 - | _ | _`
      }
    },
    tracks: {
      mel: { inst: 'sine', gain: 0.4, pan: -0.2, send: 0.4, role: 'lead', from: 0 },
      ans: { inst: 'sine', gain: 0.34, pan: 0.26, send: 0.4, role: 'arp', from: 1 },
      bass: { kind: 'bass', inst: 'softbass', pat: 'r - - - - - - -', lo: 45, gain: 0.3, send: 0.1, role: 'bass', from: 2 },
      comp: { kind: 'pat', inst: 'softkeys', pat: 'x - - - - - - -', lo: 55, voices: 3, gain: 0.1, send: 0.3, strum: 0.02, from: 3 },
      clk: { kind: 'drum', pat: '_ _ i? _ _ _ i? _', gain: 0.1, pan: 0.1, send: 0.2, from: 3, role: 'perc' },
      ctr: { inst: 'sine', gain: 0.14, pan: 0.1, send: 0.5, from: 4, role: 'sparkle' },
      work: { kind: 'drum', pat: 'i _ i? _ i _ i? _', gain: 0.16, send: 0.2, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'sine', pat: "1' _ _ 3' _ _ 2' _", lo: 72, gain: 0.1, pan: 0.2, send: 0.5, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Retro Dark: the terminal's idle tune */
  const phosphor = {
    id: 'c1-phosphor', title: 'Terminal Idle', bpm: 150, meter: 4, tonic: 0, scale: MODES.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      // A is PMConcept7's own idle tune, note for note
      A: {
        chords: 'C | G | C | Am | F | G | G | C',
        mel: `c5 _ e5 g5 _ g5 e5 _ | d5 _ _ _ _ _ _ _ | c5 _ e5 g5 _ c6 b5 g5 | e5 _ _ _ _ _ _ _ |
              _ | g5 _ a5 b5 _ c6 _ _ | b5 _ g5 _ e5 _ d5 _ | c5 _ _ _ _ _ _ _`
      },
      B: {
        chords: 'F | F | Em | Em | Dm | G | C | C',
        mel: `a5 - - f5 a5 - c6 - | a5 - - - f5 - - - | g5 - - e5 g5 - b5 - | g5 - - - e5 - - - |
              f5 - - d5 f5 - a5 - | g5 - b5 - d6 - b5 - | c6 - - - e6 - - - | c6 - - - _ _ _ _`
      }
    },
    tracks: {
      mel: { inst: 'chip25', gain: 0.3, send: 0.3, role: 'lead', from: 0, vib: true, hum: 0 },
      bass: { kind: 'bass', inst: 'chiptri', pat: 'r _ r _ f _ r _', lo: 41, gain: 0.4, send: 0.1, role: 'bass', from: 1, hum: 0, gate: 0.8 },
      arp: { kind: 'pat', inst: 'chip50', pat: '1 3 2 3 1 3 2 3', lo: 60, gain: 0.1, pan: -0.3, send: 0.3, role: 'arp', from: 2, hum: 0, gate: 0.5 },
      hat: { kind: 'drum', pat: '_ H _ H _ H _ H', gain: 0.2, pan: 0.25, send: 0.1, from: 3, role: 'perc', hum: 0 },
      drm: { kind: 'drum', pat: 'B _ S _ B B S _', gain: 0.24, send: 0.1, from: 4, role: 'perc', hum: 0 },
      work: { kind: 'drum', pat: 'q q _ q q _ q _', gain: 0.3, pan: -0.2, when: 'work', role: 'perc', hum: 0 },
      power: { kind: 'pat', inst: 'chip12', pat: "1' 2' 3' 2' 1'' 2' 3' 2'", lo: 60, gain: 0.08, pan: 0.3, send: 0.3, when: 'power', role: 'sparkle', hum: 0, gate: 0.5 }
    }
  };

  /* ---------------------------------------------------------------- Retro Light: a celesta kept in time by the typewriter */
  const teletype = {
    id: 'c1-teletype', title: 'Clockwork Celesta', bpm: 106, meter: 4, tonic: 7, scale: MODES.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      // A is PMConcept7's own clockwork tune, note for note
      A: {
        chords: 'G | G/D | Am/E | G | G | G | G/D D7 | G',
        mel: `g4 _ d5 _ b4 _ d5 _ | e5 _ d5 _ b4 _ _ _ | a4 _ c5 _ b4 _ a4 _ | g4 _ _ _ _ _ _ _ |
              _ _ d5 _ _ _ b4 _ | d5 _ e5 _ g5 _ e5 _ | d5 _ b4 _ c5 _ a4 _ | g4 _ _ _ _ _ _ _`,
        bell: `_ | _ | _ | _ _ _ _ _ _ g? _ | _ | _ | _ | _ _ _ _ _ _ g _`,
        fill: `_ | _ | _ | _ | _ | _ | _ | _ _ _ _ [z z] [z z] z _`
      },
      B: {
        chords: 'C | G/B | Am | D | C | G/B | Am D | G',
        mel: `e5 - - g5 e5 - c5 - | d5 - - - b4 - g4 - | c5 - - e5 c5 - a4 - | a4 - - - f#4 - a4 - |
              e5 - - g5 c6 - g5 - | d5 - - b4 g5 - d5 - | e5 - c5 - d5 - a4 - | g4 - - - - - _ _`,
        bell: `_ | _ | _ | _ _ _ _ _ _ g? _ | _ | _ | _ | _ _ _ _ _ _ g _`
      }
    },
    tracks: {
      mel: { inst: 'celesta', gain: 0.5, pan: 0.05, send: 0.45, role: 'lead', from: 0 },
      top: { inst: 'glock', src: 'mel', oct: 1, gain: 0.1, pan: 0.2, send: 0.5, from: 4 },
      bass: { kind: 'bass', inst: 'woodbass', pat: 'r - - - f - - -', lo: 43, gain: 0.32, send: 0.15, role: 'bass', from: 1 },
      arp: { kind: 'pat', inst: 'celesta', pat: '1 2 3 2 1 2 3 2', lo: 50, gain: 0.17, pan: -0.25, send: 0.4, role: 'arp', from: 2 },
      bell: { kind: 'drum', gain: 0.2, pan: 0.3, send: 0.5, from: 2 },
      keys: { kind: 'drum', pat: 'y? y y? y y? y y? y', gain: 0.17, pan: 0.2, send: 0.25, from: 3, role: 'perc' },
      spc: { kind: 'drum', pat: 'Y _ _ _ Y? _ _ _', gain: 0.2, pan: -0.1, send: 0.2, from: 3 },
      fill: { kind: 'drum', gain: 0.2, pan: 0.1, send: 0.3, from: 4 },
      work: { kind: 'drum', pat: 'y y? y y y? y y y?', gain: 0.2, pan: -0.25, send: 0.25, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'celesta', pat: "1' _ 3' 2' _ 3' 1'' _", lo: 62, gain: 0.12, pan: 0.25, send: 0.5, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- NieR: a wistful line on a soft bell, over a harp */
  const nier = {
    id: 'c1-nier', title: 'Wistful Bell', bpm: 66, meter: 4, tonic: 9, scale: MODES.minor, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      // A is PMConcept7's own wistful line, note for note; it now comes to rest on C, the brighter side of the key
      A: {
        chords: 'Am | Am | Fmaj7 | Fmaj7 | Am | Am7/E | Fmaj7 | C/G',
        mel: `e5 _ _ d5 c5 _ _ _ | a4 _ _ _ _ _ c5 _ | c5 _ _ d5 e5 _ f5 _ | e5 _ _ _ _ _ _ _ |
              _ _ _ _ a4 _ _ _ | a5 _ _ g5 e5 _ _ _ | f5 _ _ e5 c5 _ d5 _ | c5 _ _ _ _ _ _ _`,
        ctr: `_ | _ | _ | _ _ _ _ _ _ a5 - | _ | _ | _ | _ _ _ _ e6 - - -`
      },
      B: {
        chords: 'F | G | C | Am | F | G | C | E',
        mel: `a5 - - - f5 - c5 - | b5 - - - g5 - d5 - | c6 - - - g5 - e5 - | e5 - - - - - c5 - |
              a5 - - - c6 - a5 - | g5 - - - b5 - d6 - | e6 - - - c6 - g5 - | b5 - - - g#5 - - -`,
        ctr: `_ | _ | _ | _ _ _ _ a5 - - - | _ | _ | _ | _`
      }
    },
    tracks: {
      mel: { inst: 'softbell', gain: 0.44, pan: 0.05, send: 0.55, role: 'lead', from: 0 },
      arp: { kind: 'pat', inst: 'harp', pat: "1 2 3 1' 3 2 3 1'", lo: 57, gain: 0.22, pan: -0.25, send: 0.5, role: 'arp', from: 1 },
      bass: { kind: 'bass', inst: 'softbass', pat: 'r - - - - - - -', lo: 45, gain: 0.28, send: 0.1, role: 'bass', from: 2 },
      ctr: { inst: 'glock', gain: 0.12, pan: 0.3, send: 0.7, from: 4, role: 'sparkle' },
      work: { kind: 'drum', pat: 'i? _ i? _ i? _ i? _', gain: 0.12, pan: 0.2, send: 0.4, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'celesta', pat: "3' _ _ 1' _ 2' _ _", lo: 69, gain: 0.12, pan: 0.25, send: 0.6, when: 'power', role: 'sparkle' }
    }
  };

  PS.concepts.c1 = {
    id: 'c1', name: 'Encore', title: 'Concept 1 · Encore',
    blurb: "PMConcept7's own sound, finished: the same tunes, materials and gestures, in better instruments, with each tune arranged in parts that join as you go.",
    gest: 'g1',
    intensity: (s) => (s.asleep ? 0 : [1, 2, 3, 4, 5][s.chapter] || 1),
    looks: {
      friendly: { song: friendly, room: 'felt', reg: 72, motif: [7, 8, 9, 11], pal: { lead: 'marimba', soft: 'kalimba', bell: 'glock', box: 'musicbox', low: 'woodbass', string: 'harp', tap: 'wood', thud: 'woodlo' },
        sig: (h, dt) => up(h, 'kalimba', [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12].map((m) => m + 12), 0.06, 0.3, dt) },
      glass: { song: glass, room: 'glass', reg: 74, motif: [0, 4, 8, 12], pal: { lead: 'glass', soft: 'crystal', bell: 'crystal', box: 'celesta', low: 'softbass', string: 'harp', tap: 'click', tapNote: true, thud: 'felt' },
        sig: (h, dt) => { up(h, 'glass', [h.ch[0] + 24, h.ch[2] + 12, h.ch[1] + 24], 0.07, 0.3, dt); h.n('drop', h.ch[0] + 12, dt + 0.05, 0.2); } },
      basic: { song: basic, room: 'dry', reg: 72, motif: [2, 4, 6, 8], pal: { lead: 'sine', soft: 'sine', bell: 'sine', low: 'softbass', string: 'sine', tap: 'click', thud: 'felt' },
        sig: (h, dt) => { h.n('sine', h.ch[0] + 12, dt, 0.3); h.n('sine', h.ch[2] + 12, dt + 0.07, 0.34); } },
      phosphor: { song: phosphor, room: 'tube', reg: 72, motif: [0, 2, 4, 7], pal: { lead: 'chip25', soft: 'chip50', bell: 'chip12', low: 'chiptri', string: 'chip50', tap: 'nztick', thud: 'nzkick' }, special: 'phosphor',
        sig: (h, dt) => [0, 2, 4, 7, 9].forEach((d, i) => h.n('chip25', h.deg(d), dt + i * 0.035, 0.24, { dur: 0.04 })) },
      teletype: { song: teletype, room: 'office', reg: 67, motif: [0, 1, 2, 4], pal: { lead: 'celesta', soft: 'celesta', bell: 'glock', box: 'celesta', low: 'woodbass', string: 'harp', tap: 'key', thud: 'space' }, special: 'teletype',
        sig: (h, dt) => { h.d('key', dt, 0.4); h.d('key', dt + 0.06, 0.36, 1.08); h.n('bell', h.deg(4) + 12, dt + 0.13, 0.26); } },
      nier: { song: nier, room: 'ruin', reg: 69, motif: [7, 9, 11, 13], pal: { lead: 'softbell', soft: 'sine', bell: 'glock', low: 'softbass', string: 'harp', tap: 'click', thud: 'felt' }, special: 'nier',
        sig: (h, dt) => { h.tone({ f: 2640, d: 0.035, gain: 0.04, a: 0.006 }, dt); h.n('sine', h.ch[0] + 12, dt + 0.04, 0.26); h.n('sine', h.ch[2] + 12, dt + 0.1, 0.3); } }
    }
  };
})(window);
