/* Pip's sound (Fable 5.2). Concept 2, "House Band": every look has its own band, and you put it together.
   A different direction from a quiet tune behind a window: here each look is a genre with players (a ukulele trio,
   a dream-pop group, a jazz trio, a chiptune, a typewriter rag, a piano and music box), and the players join one by
   one as the person makes choices: Pip alone while it sleeps, then a rhythm part, a bass, drums, the tune, the
   colour. Every click is a hit from the band, placed on the next beat and in the chord, and Pip talks in the key
   and the time of the song. */
(function (G) {
  'use strict';
  const PS = G.PS5, M = PS.MODES;
  const strumSig = (inst) => (h, dt) => { [h.ch[0], h.ch[1], h.ch[2], h.ch[0] + 12].forEach((m, i) => h.n(inst, m, dt + i * 0.014, 0.34)); h.n(h.P.bell, h.ch[2] + 24, dt + 0.1, 0.2); };

  /* ---------------------------------------------------------------- Friendly: a ukulele trio in the sun */
  const friendly = {
    id: 'c2-friendly', title: 'Sunny Side Strum', bpm: 108, meter: 4, tonic: 7, scale: M.major, swing: 0.07, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'G | Em | C | D | G | Em | C D | G',
        mel: `b4 d5 - g5 - e5 d5 - | e5 - - g5 - - b4 - | c5 e5 - g5 - e5 c5 - | a4 - - - _ _ d5 e5 |
              g5 - - b5 - g5 e5 - | e5 - - g5 - b5 - - | c6 - b5 - a5 - f#5 - | g5 - - - - - _ _`,
        glk: `_ | _ | _ | _ _ _ _ a5 - d6 - | _ | _ | _ | _ _ b5 - d6 - g6 -`
      },
      B: {
        chords: 'C | D | Bm | Em | C | D | G | D',
        mel: `e5 g5 - c6 - g5 e5 - | f#5 a5 - d6 - a5 f#5 - | d5 f#5 - b5 - f#5 d5 - | e5 - - g5 - - b5 - |
              c6 - - e6 - c6 g5 - | d6 - - a5 - f#5 a5 - | b5 - g5 - d5 - g5 - | a5 - - - - - _ _`,
        glk: `_ | _ | _ | _ _ _ _ _ _ e6 - | _ | _ | _ | _ _ f#5 - a5 - d6 -`
      }
    },
    tracks: {
      pick: { kind: 'pat', inst: 'uke', pat: '1 _ 3 _ 2 _ 3 _', lo: 62, gain: 0.3, pan: -0.1, send: 0.4, role: 'comp', at: [0] },
      uke: { kind: 'pat', inst: 'uke', pat: 'x _ x x? _ x? x x?', lo: 62, voices: 4, strum: 0.016, gain: 0.26, pan: -0.22, send: 0.35, role: 'comp', from: 1 },
      bass: { kind: 'bass', inst: 'upright', pat: 'r - - - f - r -', lo: 40, gain: 0.4, send: 0.12, role: 'bass', from: 2 },
      kick: { kind: 'drum', pat: 'k _ _ _ k _ _ k?', gain: 0.3, send: 0.1, from: 3, role: 'drum' },
      clap: { kind: 'drum', pat: '_ _ n _ _ _ c _', gain: 0.22, pan: 0.15, send: 0.3, from: 3, role: 'perc' },
      shk: { kind: 'drum', pat: 'm? m m? m m? m m? m', gain: 0.12, pan: 0.32, send: 0.2, from: 3 },
      mel: { inst: 'marimba', gain: 0.5, pan: 0.1, send: 0.4, role: 'lead', from: 4 },
      glk: { inst: 'glock', gain: 0.17, pan: 0.3, send: 0.55, from: 5, role: 'sparkle' },
      stab: { kind: 'pat', inst: 'vibes', pat: '_ _ _ x? _ _ _ _ | _ _ _ _ _ x? _ _', lo: 67, voices: 3, gain: 0.12, pan: 0.25, send: 0.5, from: 6 },
      tamb: { kind: 'drum', pat: '_ _ j? _ _ _ j _', gain: 0.14, pan: -0.3, send: 0.3, from: 7 },
      work: { kind: 'drum', pat: 'w _ w W _ w _ W', gain: 0.18, pan: 0.2, send: 0.3, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'glock', pat: "1' _ 2' 3' _ 2' 1'' _", lo: 67, gain: 0.12, pan: -0.25, send: 0.55, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Glass: a slow dream-pop group under water */
  const glass = {
    id: 'c2-glass', title: 'Bubble Drift', bpm: 84, meter: 4, tonic: 9, scale: M.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'Amaj7 | F#m7 | Dmaj7 | E | Amaj7 | F#m7 | Dmaj7 | E',
        mel: `c#5 - e5 - - - a5 - | a5 - - f#5 - - c#5 - | f#5 - a5 - - - c#6 - | b5 - - - g#5 - e5 - |
              c#5 - e5 - - - a5 - | a5 - - c#6 - - a5 - | f#5 - - a5 - - d6 - | e6 - - - b5 - - -`,
        bel: `_ | _ | _ | _ _ _ _ _ _ b5 - | _ | _ | _ | _ _ _ _ _ _ e6 -`
      },
      B: {
        chords: 'Dmaj7 | E | C#m7 | F#m7 | Dmaj7 | E | Amaj7 | Amaj7',
        mel: `f#5 - - a5 - - d6 - | e6 - - b5 - - g#5 - | e5 - - g#5 - - b5 - | a5 - - - c#5 - - - |
              f#5 - - a5 - - c#6 - | b5 - - g#5 - - e5 - | c#5 - - e5 - - a5 - | e5 - - - - - _ _`,
        bel: `_ | _ | _ | _ _ _ _ _ _ c#6 - | _ | _ | _ | _ _ c#6 - e6 - a6 -`
      }
    },
    tracks: {
      pick: { kind: 'pat', inst: 'crystal', pat: '1 _ _ 3 _ _ 2 _', lo: 69, gain: 0.26, send: 0.7, role: 'arp', at: [0] },
      keys: { kind: 'pat', inst: 'softkeys', pat: 'x - - - - - - -', lo: 57, voices: 4, strum: 0.024, gain: 0.26, pan: -0.15, send: 0.45, role: 'comp', from: 1, gate: 0.92 },
      bass: { kind: 'bass', inst: 'softbass', pat: 'r - - - - r? f -', lo: 45, gain: 0.34, send: 0.1, role: 'bass', from: 2 },
      kick: { kind: 'drum', pat: 'k _ _ _ _ k? _ _', gain: 0.28, send: 0.1, from: 3, role: 'drum' },
      rim: { kind: 'drum', pat: '_ _ _ _ r _ _ _', gain: 0.2, pan: 0.15, send: 0.5, from: 3, role: 'perc' },
      shk: { kind: 'drum', pat: 'm? m? m m? m? m? m m?', gain: 0.1, pan: 0.3, send: 0.3, from: 3 },
      mel: { inst: 'vibes', gain: 0.4, pan: 0.08, send: 0.55, role: 'lead', from: 4 },
      arp: { kind: 'pat', inst: 'crystal', pat: '1 2 3 4 3 2 3 4', lo: 69, gain: 0.13, pan: 0.3, send: 0.7, role: 'arp', from: 5 },
      bel: { inst: 'softbell', gain: 0.17, pan: -0.3, send: 0.7, from: 6, role: 'sparkle' },
      hat: { kind: 'drum', pat: '_ _ h? _ _ _ h? h?', gain: 0.1, pan: -0.25, send: 0.3, from: 7 },
      work: { kind: 'drum', pat: 'r? _ _ r? _ _ r? _', gain: 0.16, pan: -0.2, send: 0.5, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'glass', pat: "4' _ _ 2' _ _ 3' _", lo: 69, gain: 0.12, pan: -0.2, send: 0.7, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Basic: a tidy jazz trio */
  const basic = {
    id: 'c2-basic', title: 'Tidy Trio', bpm: 76, meter: 4, tonic: 0, scale: M.major, swing: 0.14, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'Cmaj7 | Am7 | Dm7 | G7 | Em7 | A7 | Dm7 G7 | Cmaj7',
        mel: `e5 - - g5 - - b4 - | c5 - - e5 - - g5 - | f5 - - a5 - - c5 - | d5 - - b4 - - - - |
              g5 - - e5 - - d5 - | c#5 - - e5 - - g5 - | f5 - a5 - f5 - d5 - | e5 - - - - - _ _`,
        ctr: `_ | _ | _ | _ _ _ _ _ g5 f5 d5 | _ | _ | _ | _ _ _ g5 - b5 - -`
      },
      B: {
        chords: 'Fmaj7 | Fm6 | Em7 | A7 | Dm7 | G7 | Cmaj7 | G7',
        mel: `a5 - - c6 - - e5 - | ab5 - - c6 - - f5 - | g5 - - b5 - - d5 - | e5 - - c#5 - - a4 - |
              f5 - - a5 - - c6 - | b5 - - g5 - - f5 - | e5 - - g5 - - c6 - | d5 - - - - - _ _`,
        ctr: `_ | _ | _ | _ | _ | _ | _ | _ _ _ b4 - d5 - f5`
      }
    },
    tracks: {
      pick: { kind: 'pat', inst: 'softkeys', pat: 'x - - - - - - -', lo: 55, voices: 4, strum: 0.03, gain: 0.3, send: 0.35, role: 'comp', at: [0], gate: 0.9 },
      keys: { kind: 'pat', inst: 'softkeys', pat: 'x - - x? - - - -', lo: 55, voices: 4, strum: 0.012, gain: 0.28, pan: -0.2, send: 0.3, role: 'comp', from: 1, gate: 0.85 },
      bass: { kind: 'bass', inst: 'upright', pat: 'r f t a', lo: 40, gain: 0.4, send: 0.1, role: 'bass', from: 2, gate: 0.9 },
      ride: { kind: 'drum', pat: 'h? _ h? h? h? _ h? h?', gain: 0.1, pan: 0.3, send: 0.25, from: 3, role: 'perc' },
      brsh: { kind: 'drum', pat: '_ _ b _ _ _ b _', gain: 0.26, pan: 0.1, send: 0.3, from: 3, role: 'drum' },
      mel: { inst: 'vibes', gain: 0.4, pan: 0.12, send: 0.4, role: 'lead', from: 4 },
      kick: { kind: 'drum', pat: 'e? _ _ _ _ _ _ _', gain: 0.24, send: 0.1, from: 5 },
      ctr: { inst: 'sine', gain: 0.16, pan: -0.3, send: 0.4, from: 6, role: 'sparkle' },
      work: { kind: 'drum', pat: 'r? _ _ r? _ r? _ _', gain: 0.16, pan: -0.2, send: 0.3, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'vibes', pat: "_ _ 4' _ _ 3' _ _", lo: 60, gain: 0.12, pan: -0.25, send: 0.5, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Retro Dark: a chiptune that wants to dance */
  const phosphor = {
    id: 'c2-phosphor', title: 'Bit Bop', bpm: 132, meter: 4, tonic: 4, scale: M.minor, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'Em | C | G | D | Em | C | G | D',
        mel: `e5 _ g5 b5 - g5 e5 _ | e5 _ g5 c6 - g5 e5 _ | d5 _ g5 b5 - g5 d5 _ | d5 _ f#5 a5 - - _ _ |
              e6 - - b5 g5 - e5 - | e6 - - c6 g5 - e5 - | d6 - b5 - g5 - b5 - | a5 - - - f#5 - d5 -`
      },
      B: {
        chords: 'C | D | Em | Em | C | D | G | B7',
        mel: `c6 - - g5 e5 - g5 - | d6 - - a5 f#5 - a5 - | e6 - - - b5 - g5 - | e5 g5 b5 e6 - - _ _ |
              c6 - - e6 c6 - g5 - | d6 - - f#6 d6 - a5 - | g6 - - d6 b5 - g5 - | f#5 - - b5 d#5 - - -`
      }
    },
    tracks: {
      pick: { kind: 'pat', inst: 'chip50', pat: '1 _ 3 _ 2 _ 3 _', lo: 64, gain: 0.16, send: 0.3, role: 'arp', at: [0], hum: 0, gate: 0.5 },
      bass: { kind: 'bass', inst: 'chiptri', pat: 'r o r o r o r o', lo: 40, gain: 0.38, send: 0.08, role: 'bass', from: 1, hum: 0, gate: 0.7 },
      kick: { kind: 'drum', pat: 'B _ B _ B _ B _', gain: 0.26, send: 0.05, from: 2, role: 'drum', hum: 0 },
      hat: { kind: 'drum', pat: '_ H _ H _ H _ H', gain: 0.2, pan: 0.25, send: 0.1, from: 2, role: 'perc', hum: 0 },
      snr: { kind: 'drum', pat: '_ _ S _ _ _ S _', gain: 0.24, send: 0.1, from: 3, hum: 0 },
      mel: { inst: 'chip25', gain: 0.3, send: 0.3, role: 'lead', from: 4, vib: true, hum: 0 },
      arp: { kind: 'pat', inst: 'chip12', pat: "1 2 3 1' 3 2 1 2 3 1' 3 2 1 2 3 1'", lo: 64, gain: 0.08, pan: -0.3, send: 0.3, role: 'arp', from: 5, hum: 0, gate: 0.5 },
      echo: { kind: 'pat', inst: 'chip50', pat: '_ _ _ _ x? _ _ _', lo: 64, voices: 3, strum: 0, gain: 0.08, pan: 0.3, send: 0.4, from: 6, hum: 0, gate: 0.3 },
      work: { kind: 'drum', pat: 'q q _ q _ q q _', gain: 0.3, pan: -0.2, when: 'work', role: 'perc', hum: 0 },
      power: { kind: 'pat', inst: 'chip12', pat: "1'' _ 3' _ 2' _ 3' _", lo: 64, gain: 0.08, pan: 0.3, send: 0.3, when: 'power', role: 'sparkle', hum: 0, gate: 0.5 }
    }
  };

  /* ---------------------------------------------------------------- Retro Light: a rag, with the typewriter on drums */
  const teletype = {
    id: 'c2-teletype', title: 'Carriage Return Rag', bpm: 100, meter: 4, tonic: 5, scale: M.major, swing: 0.09, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'F | D7 | Gm | C7 | F | D7 | Gm C7 | F',
        mel: `a5 c6 - a5 f5 - a5 - | f#5 a5 - c6 d6 - a5 - | g5 bb5 - d6 bb5 - g5 - | e5 g5 - bb5 c6 - - - |
              a5 c6 - f6 c6 - a5 - | d6 c6 - a5 f#5 - a5 - | bb5 - g5 - e5 - g5 - | f5 - - - - - _ _`,
        bell: `_ | _ | _ | _ _ _ _ _ _ g? _ | _ | _ | _ | _ _ _ _ g _ _ _`,
        fill: `_ | _ | _ | _ | _ | _ | _ | _ _ _ _ _ _ [z z] [z z]`
      },
      B: {
        chords: 'Bb | F | C7 | F | Bb | F | G7 | C7',
        mel: `d6 - - bb5 f5 - bb5 - | c6 - - a5 f5 - a5 - | bb5 - - g5 e5 - g5 - | a5 - - - f5 - a5 - |
              d6 - f6 - d6 - bb5 - | c6 - f6 - c6 - a5 - | b5 - - d6 g5 - b5 - | c6 - - - e5 - g5 -`,
        bell: `_ | _ | _ | _ _ _ _ _ _ g? _ | _ | _ | _ | _ _ _ _ _ _ g _`
      }
    },
    tracks: {
      pick: { kind: 'bass', inst: 'tack', pat: 'r - - - F - - -', lo: 41, gain: 0.34, send: 0.3, role: 'bass', at: [0] },
      lh: { kind: 'bass', inst: 'tack', pat: 'r - _ _ F - _ _', lo: 41, gain: 0.4, pan: -0.15, send: 0.25, role: 'bass', from: 1, gate: 0.9 },
      lhc: { kind: 'pat', inst: 'tack', pat: '_ _ x. _ _ _ x. _', lo: 53, voices: 3, strum: 0.006, gain: 0.22, pan: -0.1, send: 0.3, role: 'comp', from: 1 },
      keys: { kind: 'drum', pat: 'y? y y? y y? y y? y', gain: 0.17, pan: 0.25, send: 0.25, from: 2, role: 'perc' },
      spc: { kind: 'drum', pat: 'Y _ _ _ Y? _ _ _', gain: 0.22, pan: 0.1, send: 0.2, from: 3, role: 'drum' },
      bell: { kind: 'drum', gain: 0.2, pan: 0.3, send: 0.5, from: 3 },
      mel: { inst: 'tack', gain: 0.46, pan: 0.12, send: 0.35, role: 'lead', from: 4 },
      toy: { kind: 'pat', inst: 'toypiano', pat: "_ _ _ _ _ _ 3' 1''", lo: 65, gain: 0.14, pan: 0.3, send: 0.4, from: 5, role: 'sparkle' },
      fill: { kind: 'drum', gain: 0.2, pan: 0.15, send: 0.3, from: 6 },
      work: { kind: 'drum', pat: 'y y y? y y y? y y', gain: 0.2, pan: -0.25, send: 0.25, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'toypiano', pat: "1' _ 2' 3' _ 2' 1'' _", lo: 65, gain: 0.12, pan: -0.25, send: 0.4, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- NieR: a piano and a music box, by lantern light */
  const nier = {
    id: 'c2-nier', title: 'Paper Lanterns', bpm: 72, meter: 4, tonic: 9, scale: M.minor, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'Am | F | C | G | Am | F | G | C',
        mel: `e5 - - - a5 - - g5 | f5 - - - c5 - - - | e5 - - g5 - - c6 - | b5 - - - g5 - d5 - |
              c6 - - - a5 - e5 - | a5 - - - f5 - c5 - | b5 - - d6 - - g5 - | e5 - - - - - _ _`,
        cel: `_ | _ | _ | _ _ _ _ _ _ d6 - | _ | _ | _ | _ _ g5 - c6 - e6 -`
      },
      B: {
        chords: 'F | G | Em | Am | F | G | C | G',
        mel: `a5 - - c6 - - f5 - | g5 - - b5 - - d5 - | g5 - - e5 - - b4 - | c5 - - e5 - - a5 - |
              a5 - - f5 - - c6 - | b5 - - g5 - - d6 - | e6 - - c6 - - g5 - | d5 - - - - - _ _`,
        cel: `_ | _ | _ | _ | _ | _ | _ | _ _ _ _ g5 - b5 -`
      }
    },
    tracks: {
      pick: { kind: 'pat', inst: 'felt', pat: "1 - 3 - 2 - 3 -", lo: 48, gain: 0.34, send: 0.5, role: 'comp', at: [0], gate: 1.4 },
      pno: { kind: 'pat', inst: 'felt', pat: "1 2 3 2 1' 2 3 2", lo: 48, gain: 0.3, pan: -0.15, send: 0.45, role: 'comp', from: 1, gate: 1.5 },
      bass: { kind: 'bass', inst: 'softbass', pat: 'r - - - - - - -', lo: 45, gain: 0.28, send: 0.1, role: 'bass', from: 2 },
      harp: { kind: 'pat', inst: 'harp', pat: "_ _ _ _ 1 2 3 1'", lo: 64, gain: 0.16, pan: 0.3, send: 0.6, role: 'arp', from: 3 },
      drum: { kind: 'drum', pat: 'e? _ _ _ _ _ i? _', gain: 0.2, send: 0.4, from: 3, role: 'drum' },
      mel: { inst: 'musicbox', oct: 1, gain: 0.42, pan: 0.1, send: 0.55, role: 'lead', from: 4, detune: 3 },
      cel: { inst: 'celesta', gain: 0.16, pan: -0.3, send: 0.6, from: 5, role: 'sparkle' },
      work: { kind: 'drum', pat: 'i? _ _ i? _ _ i? _', gain: 0.12, pan: 0.2, send: 0.4, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'celesta', pat: "3' _ _ 2' _ _ 1'' _", lo: 69, gain: 0.12, pan: 0.25, send: 0.6, when: 'power', role: 'sparkle' }
    }
  };

  const Q = { select: 0.25, next: 0.25, back: 0.25, open: 0.5, chapter: 0.5, toggleOn: 0.25, toggleOff: 0.25, confetti: 0.5, tick: 0.25, block: 0.25, power: 0.25, cheer: 0.25, crew: 0.5, tip: 0.25, land: 0.25, sparkle: 0.25, warn: 0.25 };
  const dress = { tune: 0.85, grid: 0.25 };
  PS.concepts.c2 = {
    id: 'c2', name: 'House Band', title: 'Concept 2 · House Band',
    blurb: 'Every look is a band with its own genre. Players join as you make choices, every click lands on the beat and in the chord, and Pip talks in the key of the song.',
    gest: 'g2', quant: Q, quantMax: 0.13,
    // who is playing: Pip alone asleep, then one more player for each step taken
    intensity: (s) => (s.asleep ? 0 : [1, 1, 2, 3, 4, 5, 5, 5, 5, 6, 7][s.index] || 1),
    looks: {
      friendly: { song: friendly, room: 'club', reg: 67, motif: [4, 5, 7, 9], dress, pal: { lead: 'uke', soft: 'marimba', bell: 'glock', low: 'upright', string: 'uke', tap: 'snap', snap: 'snap', kick: 'kick', tom: 'tom', hit: 'snare', stick: 'rim', crash: 'tamb', thud: 'woodlo' }, sig: strumSig('uke') },
      glass: { song: glass, room: 'lounge', reg: 69, motif: [0, 4, 6, 9], dress, pal: { lead: 'vibes', soft: 'softkeys', bell: 'crystal', low: 'softbass', string: 'harp', tap: 'rim', snap: 'rim', kick: 'kick', tom: 'tom', hit: 'rim', stick: 'rim', crash: 'ting', thud: 'felt' }, sig: strumSig('vibes') },
      basic: { song: basic, room: 'studio', reg: 72, motif: [2, 4, 6, 8], dress, pal: { lead: 'softkeys', soft: 'softkeys', bell: 'vibes', low: 'upright', string: 'softkeys', tap: 'click', snap: 'snap', kick: 'felt', tom: 'tom', hit: 'brush', stick: 'rim', crash: 'ting', thud: 'felt' }, sig: strumSig('softkeys') },
      phosphor: { song: phosphor, room: 'tube', reg: 64, motif: [0, 2, 4, 7], dress, special: 'phosphor', pal: { lead: 'chip25', soft: 'chip50', bell: 'chip12', low: 'chiptri', string: 'chip50', tap: 'nztick', snap: 'nzhat', kick: 'nzkick', tom: 'nzsnare', hit: 'nzsnare', stick: 'nztick', crash: 'nzhat', thud: 'nzkick' },
        sig: (h, dt) => [0, 2, 4, 7, 9].forEach((d, i) => h.n('chip25', h.deg(d), dt + i * 0.035, 0.24, { dur: 0.04 })) },
      teletype: { song: teletype, room: 'office', reg: 65, motif: [0, 2, 4, 7], dress, special: 'teletype', pal: { lead: 'tack', soft: 'tack', bell: 'bell', low: 'tack', string: 'tack', tap: 'key', snap: 'key', kick: 'space', tom: 'key', hit: 'space', stick: 'key', crash: 'ting', thud: 'space' }, sig: strumSig('tack') },
      nier: { song: nier, room: 'ruin', reg: 69, motif: [0, 2, 4, 6], dress, special: 'nier', pal: { lead: 'felt', soft: 'harp', bell: 'celesta', low: 'softbass', string: 'harp', tap: 'click', snap: 'click', kick: 'felt', tom: 'felt', hit: 'click', stick: 'click', crash: 'ting', thud: 'felt' }, sig: strumSig('harp') }
    }
  };
})(window);
