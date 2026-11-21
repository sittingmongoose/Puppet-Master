/* Pip's sound (Fable 5.2). Concept 3, "Marionette Theatre": a wound-up waltz on a small stage.
   Drawn from two pieces Jared pointed to, without quoting either. From "Marionette's Dream" (Tennon), only its quiet
   passages: a key being wound, a clock ticking, a waltz's oom-pah-pah and a slow music-box line (not its heavy, fast
   drops). From "A Beautiful Song" (NieR:Automata), for the NieR look: D minor with its raised seventh, a lilting
   six-eight, the feeling of a voice alone on a stage; here with no voice, no choir and no drums, on a soft bell over a
   harp, and it turns to D major when the person is ready. Every look is in three: waltzes, and two slow six-eights.
   The window is a little theatre: clicks are its machinery (ratchets, pulleys, a stagehand's knock), a new chapter is
   a new act, typing a name plays the music box, and Pip's wooden jaw clacks as it talks. */
(function (G) {
  'use strict';
  const PS = G.PS5, M = PS.MODES;

  /* ---------------------------------------------------------------- Friendly: the toybox waltz */
  const friendly = {
    id: 'c3-friendly', title: 'Toybox Waltz', bpm: 138, meter: 3, tonic: 5, scale: M.major, level: 1,
    form: ['A', 'B'],
    sections: {
      A: {
        chords: 'F | F | C7 | C7 | C7 | C7 | F | F | F | F7 | Bb | Bb | Gm | C7 | F | F',
        mel: `a5 - c6 | f6 - - | e6 - d6 | c6 - - | bb5 - g5 | e5 - g5 | a5 - - | - - c5 |
              f5 - a5 | c6 - - | d6 - c6 | bb5 - - | g5 - bb5 | e5 - g5 | f5 - - | - - _`
      },
      B: {
        chords: 'Dm | Dm | A7 | A7 | Dm | Dm | G7 | C7 | F | F | Bb | Bb | Gm | C7 | F | C7',
        mel: `d6 - a5 | f5 - a5 | e5 - g5 | c#6 - - | d6 - f6 | a5 - d6 | b5 - d6 | c6 - - |
              c6 - a5 | f5 - c6 | d6 - bb5 | f5 - - | g5 - bb5 | e6 - c6 | a5 - - | g5 - -`
      }
    },
    tracks: {
      mel: { inst: 'musicbox', gain: 0.5, pan: 0.05, send: 0.5, role: 'lead', from: 0, detune: 4 },
      dbl: { inst: 'celesta', src: 'mel', oct: -1, gain: 0.16, pan: -0.15, send: 0.5, from: 3 },
      tick: { kind: 'drum', pat: 't? _ _ | T? _ _', gain: 0.16, pan: 0.3, send: 0.3, from: 0, role: 'perc' },
      bass: { kind: 'bass', inst: 'pizz', pat: 'r _ _ | F _ _', lo: 45, gain: 0.44, pan: -0.1, send: 0.35, role: 'bass', from: 1 },
      comp: { kind: 'pat', inst: 'pizz', pat: '_ x x', lo: 57, voices: 3, strum: 0.008, gain: 0.2, pan: 0.2, send: 0.4, role: 'comp', from: 1 },
      glk: { kind: 'pat', inst: 'glock', pat: "_ _ _ | _ _ _ | _ _ _ | _ 2' 3'", lo: 72, gain: 0.16, pan: -0.3, send: 0.6, from: 3, role: 'sparkle' },
      cel: { kind: 'pat', inst: 'celesta', pat: '1 2 3 2 3 2', lo: 65, gain: 0.1, pan: 0.3, send: 0.5, from: 4, role: 'arp' },
      tamb: { kind: 'drum', pat: 'g? _ _ | _ j? j? | _ _ _ | _ j? j?', gain: 0.12, pan: -0.25, send: 0.4, from: 5 },
      work: { kind: 'drum', pat: 'K? _ w | _ w W', gain: 0.18, pan: 0.2, send: 0.4, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'glock', pat: "1' 2' 3' 1'' 3' 2'", lo: 65, gain: 0.11, pan: -0.25, send: 0.6, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Glass: a carousel of struck crystal, in six */
  const glass = {
    id: 'c3-glass', title: 'Crystal Carousel', bpm: 168, meter: 6, tonic: 7, scale: M.major, level: 1,
    form: ['A', 'A', 'B', 'A'],
    sections: {
      A: {
        chords: 'G | Em | C | D | G | Bm | C D | G',
        mel: `d6 - - b5 - g5 | e6 - - - - b5 | c6 - - e6 - g6 | f#6 - - - - a5 |
              b5 - - d6 - g6 | f#6 - - d6 - b5 | e6 - c6 a5 - d6 | g5 - - - - _`,
        bel: `_ | _ | _ | _ _ _ a5 - - | _ | _ | _ | _ _ _ b5 - d6`
      },
      B: {
        chords: 'C | G/B | Am | D | C | G/B | Am D | G',
        mel: `e6 - - g6 - e6 | d6 - - b5 - g5 | c6 - - e6 - c6 | a5 - - f#5 - d5 |
              g5 - - c6 - e6 | d6 - - g6 - d6 | e6 - c6 f#6 - - | g6 - - - - _`,
        bel: `_ | _ | _ | _ _ _ d6 - - | _ | _ | _ | _ _ _ g5 - b5`
      }
    },
    tracks: {
      mel: { inst: 'glass', gain: 0.42, pan: 0.05, send: 0.6, role: 'lead', from: 0 },
      harp: { kind: 'pat', inst: 'harp', pat: "1 2 3 1' 3 2", lo: 55, gain: 0.26, pan: -0.2, send: 0.5, role: 'arp', from: 1 },
      bass: { kind: 'bass', inst: 'softbass', pat: 'r - - - - -', lo: 43, gain: 0.34, send: 0.1, role: 'bass', from: 2 },
      ting: { kind: 'drum', pat: 'g? _ _ _ _ _ | _ _ _ _ _ _', gain: 0.12, pan: 0.3, send: 0.6, from: 3, role: 'perc' },
      bel: { inst: 'softbell', gain: 0.18, pan: -0.3, send: 0.7, from: 4, role: 'sparkle' },
      cry: { kind: 'pat', inst: 'crystal', pat: "_ _ _ 3' 2' 1'", lo: 67, gain: 0.1, pan: 0.3, send: 0.7, from: 5, role: 'arp' },
      work: { kind: 'drum', pat: 't? _ _ T? _ _', gain: 0.14, pan: 0.2, send: 0.5, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'crystal', pat: "1' _ 3' _ 2' _", lo: 74, gain: 0.11, pan: -0.25, send: 0.7, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Basic: a study for piano and metronome */
  const basic = {
    id: 'c3-basic', title: 'Metronome Study', bpm: 84, meter: 3, tonic: 0, scale: M.major, level: 1,
    form: ['A', 'B', 'A'],
    sections: {
      A: {
        chords: 'Fmaj7 | Cmaj7 | Fmaj7 | Cmaj7 | Dm7 | G | Em7 | Am7 | Fmaj7 | Cmaj7 | Fmaj7 | Cmaj7 | Dm7 | G7 | Cmaj7 | Cmaj7',
        mel: `_ a5 - | g5 - e5 | _ a5 - | g5 - - | f5 - a5 | d6 - b5 | g5 - - | e5 - c5 |
              _ a5 - | b5 - g5 | _ c6 - | e6 - - | d6 - a5 | b5 - d5 | e5 - - | - - _`,
        ctr: `_ | _ | _ | _ _ e6 | _ | _ | _ | _ | _ | _ | _ | _ _ g6 | _ | _ | _ _ g5 | c6 - -`
      },
      B: {
        chords: 'Am7 | Em7 | Fmaj7 | Cmaj7 | Am7 | Em7 | Dm7 | G7',
        mel: `c6 - e6 | d6 - b5 | a5 - c6 | g5 - - | e6 - c6 | b5 - g5 | a5 - f5 | d5 - -`
      }
    },
    tracks: {
      mel: { inst: 'felt', oct: -1, gain: 0.5, pan: 0.08, send: 0.4, role: 'lead', from: 0, gate: 1.3 },
      tick: { kind: 'drum', pat: 't? T? T?', gain: 0.1, pan: -0.3, send: 0.2, from: 0, role: 'perc' },
      bass: { kind: 'bass', inst: 'felt', pat: 'r - -', lo: 40, gain: 0.36, pan: -0.08, send: 0.3, role: 'bass', from: 1, gate: 1.2 },
      comp: { kind: 'pat', inst: 'felt', pat: '_ x -', lo: 52, voices: 3, strum: 0.012, gain: 0.26, pan: -0.05, send: 0.35, role: 'comp', from: 1, gate: 1.2 },
      ctr: { inst: 'sine', gain: 0.14, pan: 0.3, send: 0.5, from: 4, role: 'sparkle' },
      work: { kind: 'drum', pat: 'i _ i?', gain: 0.14, pan: 0.25, send: 0.2, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'sine', pat: "_ 3' 1''", lo: 60, gain: 0.1, pan: 0.25, send: 0.5, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- Retro Dark: the puppet show on a chip */
  const phosphor = {
    id: 'c3-phosphor', title: '8-Bit Puppet Show', bpm: 152, meter: 3, tonic: 0, scale: M.major, level: 1,
    form: ['A', 'B'],
    sections: {
      A: {
        chords: 'C | C | G7 | G7 | G7 | G7 | C | C | C | C7 | F | F | Dm | G7 | C | C',
        mel: `e5 - g5 | c6 - - | b5 - a5 | g5 - - | f5 - d5 | b4 - d5 | e5 - - | - - g4 |
              c5 - e5 | g5 - bb5 | a5 - g5 | f5 - - | d5 - f5 | b4 - d5 | c5 - - | - - _`
      },
      B: {
        chords: 'Am | Am | E7 | E7 | Am | Am | D7 | G7 | C | C | F | F | Dm | G7 | C | G7',
        mel: `a5 - e5 | c5 - e5 | b4 - d5 | g#5 - - | a5 - c6 | e6 - c6 | a5 - f#5 | g5 - - |
              e5 - g5 | c6 - e6 | c6 - a5 | f5 - - | f5 - a5 | b5 - g5 | e5 - - | d5 - -`
      }
    },
    tracks: {
      mel: { inst: 'chip25', gain: 0.3, send: 0.3, role: 'lead', from: 0, vib: true, hum: 0 },
      tick: { kind: 'drum', pat: 'q _ _', gain: 0.24, pan: 0.3, from: 0, role: 'perc', hum: 0 },
      bass: { kind: 'bass', inst: 'chiptri', pat: 'r _ _ | F _ _', lo: 43, gain: 0.4, send: 0.1, role: 'bass', from: 1, hum: 0, gate: 0.8 },
      pah: { kind: 'pat', inst: 'chip50', pat: '_ x. x.', lo: 60, voices: 3, strum: 0, gain: 0.08, pan: -0.2, send: 0.3, role: 'comp', from: 1, hum: 0 },
      hat: { kind: 'drum', pat: '_ H H', gain: 0.16, pan: 0.25, send: 0.1, from: 3, hum: 0 },
      arp: { kind: 'pat', inst: 'chip12', pat: "1 2 3 1' 3 2", lo: 60, gain: 0.07, pan: 0.3, send: 0.3, role: 'arp', from: 4, hum: 0, gate: 0.5 },
      snr: { kind: 'drum', pat: '_ _ _ | _ _ S?', gain: 0.2, send: 0.1, from: 5, hum: 0 },
      work: { kind: 'drum', pat: 'q q _', gain: 0.28, pan: -0.2, when: 'work', role: 'perc', hum: 0 },
      power: { kind: 'pat', inst: 'chip12', pat: "1'' 3' 2'", lo: 60, gain: 0.08, pan: 0.3, send: 0.3, when: 'power', role: 'sparkle', hum: 0, gate: 0.5 }
    }
  };

  /* ---------------------------------------------------------------- Retro Light: a waltz off a paper roll */
  const teletype = {
    id: 'c3-teletype', title: 'Pianola Paper Waltz', bpm: 126, meter: 3, tonic: 7, scale: M.major, level: 1,
    form: ['A', 'B'],
    sections: {
      A: {
        chords: 'G | G | D7 | D7 | D7 | D7 | G | G | G | G7 | C | C | Am | D7 | G | G',
        mel: `d5 g5 b5 d6 b5 g5 | d6 - - - - - | c6 e6 d6 c6 a5 f#5 | a5 - - - - - |
              f#5 a5 c6 e6 c6 a5 | d6 - - c6 - a5 | b5 - - - - - | g5 - - - - d5 |
              g5 b5 d6 g6 d6 b5 | f6 - - d6 - b5 | e6 - - c6 - g5 | e5 - - - - - |
              c6 - - a5 - e5 | f#5 - - a5 - c6 | b5 - - g5 - - | g5 - - - - _`,
        bell: `_ | _ | _ | _ | _ | _ | _ | _ _ g? | _ | _ | _ | _ | _ | _ | _ | _ _ g`,
        fill: `_ | _ | _ | _ | _ | _ | _ | _ | _ | _ | _ | _ | _ | _ | _ | _ [z z] [z z]`
      },
      B: {
        chords: 'C | C | G | G | A7 | A7 | D7 | D7 | C | C | G | E7 | Am | D7 | G | D7',
        mel: `e6 - - c6 - g5 | e5 - g5 - c6 - | d6 - - b5 - g5 | d5 - g5 - b5 - |
              c#6 - - a5 - e5 | g5 - - e5 - c#5 | d5 f#5 a5 c6 a5 f#5 | d6 - - - - - |
              e6 - - g6 - e6 | c6 - - - - g5 | d6 - - g6 - d6 | b5 - - g#5 - e5 |
              c6 - - a5 - e5 | f#5 - - a5 - d6 | b5 - - g5 - - | a5 - - - - -`,
        bell: `_ | _ | _ | _ | _ | _ | _ | _ _ g? | _ | _ | _ | _ | _ | _ | _ | _ _ g`
      }
    },
    tracks: {
      mel: { inst: 'tack', gain: 0.46, pan: 0.08, send: 0.35, role: 'lead', from: 0 },
      roll: { kind: 'drum', pat: 'z? z? z?', gain: 0.12, pan: 0.3, send: 0.2, from: 0, role: 'perc' },
      bass: { kind: 'bass', inst: 'tack', pat: 'r _ _ | F _ _', lo: 43, gain: 0.4, pan: -0.12, send: 0.25, role: 'bass', from: 1, gate: 0.9 },
      comp: { kind: 'pat', inst: 'tack', pat: '_ x. x.', lo: 55, voices: 3, strum: 0.006, gain: 0.2, pan: -0.08, send: 0.3, role: 'comp', from: 1 },
      bell: { kind: 'drum', gain: 0.2, pan: 0.3, send: 0.5, from: 2 },
      toy: { kind: 'pat', inst: 'toypiano', pat: "_ 3' 2'", lo: 67, gain: 0.12, pan: 0.3, send: 0.4, from: 4, role: 'sparkle' },
      fill: { kind: 'drum', gain: 0.2, pan: 0.15, send: 0.3, from: 5 },
      work: { kind: 'drum', pat: 'y y? y', gain: 0.2, pan: -0.25, send: 0.25, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'toypiano', pat: "1' 3' 1''", lo: 67, gain: 0.12, pan: -0.25, send: 0.4, when: 'power', role: 'sparkle' }
    }
  };

  /* ---------------------------------------------------------------- NieR: an aria for a quiet stage, with nobody singing */
  const nier = {
    id: 'c3-nier', title: 'Aria for a Quiet Stage', bpm: 150, meter: 6, tonic: 2, scale: M.minor, level: 1,
    // each chapter is an act: the theme, the theme and its hopeful answer, and at Ready the same tune in D major
    form: [['A'], ['A', 'B'], ['A', 'B'], ['B', 'A'], ['C', 'C', 'B']],
    sections: {
      A: {
        chords: 'Dm | Bb | F | A7 | Dm | Gm | A7 | Dm',
        mel: `a5 - - d6 - e6 | f6 - - - - d6 | c6 - - a5 - f5 | e5 - - - - a5 |
              d6 - - f6 - a6 | g6 - - - bb5 d6 | c#6 - - e6 - g6 | f6 - - d6 - -`,
        cel: `_ | _ | _ | _ _ _ c#6 - - | _ | _ | _ | _ _ _ _ a5 d6`
      },
      B: {
        chords: 'F | C | Dm | Bb | F | C | Bb | A7',
        mel: `c6 - - f6 - a6 | g6 - - e6 - c6 | f6 - - d6 - a5 | d6 - - - - bb5 |
              a5 - - c6 - f6 | e6 - - g6 - e6 | d6 - - bb5 - f5 | a5 - - c#6 - e6`,
        cel: `_ | _ | _ | _ _ _ f5 - - | _ | _ | _ | _`
      },
      C: {
        chords: 'D | G | D/F# | A | Bm | G | A7 | D',
        mel: `f#5 - - a5 - d6 | b5 - - g5 - d6 | a5 - - d6 - f#6 | e6 - - - - c#6 |
              d6 - - f#6 - b5 | b5 - - d6 - g6 | e6 - - c#6 - a5 | d6 - - - - -`,
        cel: `_ | _ | _ | _ _ _ a5 - - | _ | _ | _ | _ _ _ f#6 a6 d7`
      }
    },
    tracks: {
      mel: { inst: 'softbell', gain: 0.44, pan: 0.05, send: 0.6, role: 'lead', from: 0 },
      harp: { kind: 'pat', inst: 'harp', pat: "1 2 3 1' 3 2", lo: 50, gain: 0.26, pan: -0.2, send: 0.5, role: 'arp', from: 1 },
      bass: { kind: 'bass', inst: 'pizz', pat: 'r _ _ f? _ _', lo: 38, gain: 0.44, pan: -0.05, send: 0.4, role: 'bass', from: 2 },
      hps: { kind: 'pat', inst: 'harpsi', pat: 'x. _ _ x.? _ _', lo: 62, voices: 3, strum: 0.01, gain: 0.08, pan: 0.25, send: 0.5, role: 'comp', from: 3 },
      cel: { inst: 'celesta', gain: 0.17, pan: 0.3, send: 0.6, from: 4, role: 'sparkle' },
      ting: { kind: 'drum', pat: 'g? _ _ _ _ _ | _ _ _ _ _ _ | _ _ _ _ _ _ | _ _ _ _ _ _', gain: 0.1, pan: -0.3, send: 0.6, from: 5 },
      work: { kind: 'drum', pat: 'i? _ _ i? _ _', gain: 0.12, pan: 0.2, send: 0.4, when: 'work', role: 'perc' },
      power: { kind: 'pat', inst: 'celesta', pat: "3' _ _ 2' _ 1''", lo: 62, gain: 0.11, pan: 0.25, send: 0.6, when: 'power', role: 'sparkle' }
    }
  };

  const CHIP = { pawl: 'nztick', knock: 'nzkick', tick: 'nztick', tock: 'nztick', click: 'nztick', clap: 'nzsnare', felt: 'nzkick', wood: 'nztick', woodlo: 'nztick', snap: 'nzhat', rim: 'nztick', tom: 'nzsnare', snare: 'nzsnare', kick: 'nzkick', shaker: 'nzhat', hat: 'nzhat', ohat: 'nzhat', tamb: 'nzhat', ting: 'nzhat', key: 'nztick', space: 'nzkick' };
  const TYPE = { tick: 'key', tock: 'key', click: 'key', knock: 'space', felt: 'space', wood: 'key', woodlo: 'space', rim: 'key', snap: 'key', tom: 'space', snare: 'key', kick: 'space', clap: 'key', shaker: 'pawl', hat: 'pawl' };
  const POD = { wood: 'click', woodlo: 'click', knock: 'felt', pawl: 'click', tick: 'click', tock: 'click', clap: 'click', tom: 'felt', snare: 'click', kick: 'felt', rim: 'click', snap: 'click', key: 'click', space: 'felt', shaker: 'click' };
  PS.DRUM_MAPS = { phosphor: CHIP, teletype: TYPE, nier: POD };

  PS.concepts.c3 = {
    id: 'c3', name: 'Marionette Theatre', title: 'Concept 3 · Marionette Theatre',
    blurb: 'A wound-up waltz on a small stage: music box, pizzicato and clockwork, with the window as theatre machinery. NieR gets a wordless stage aria that turns to major at the end.',
    gest: 'g3',
    intensity: (s) => (s.asleep ? 0 : [1, 2, 3, 4, 5][s.chapter] || 1),
    looks: {
      friendly: { song: friendly, room: 'theatre', reg: 65, motif: [4, 7, 9, 11], vox: { src: 'wood', fs: 1.26, q: 8, base: 300, gain: 0.2 }, dress: { jaw: 0.4, plink: 0.12, plinkInst: 'musicbox', tune: 0.5 },
        pal: { lead: 'musicbox', soft: 'pizz', bell: 'glock', box: 'musicbox', gliss: 'harp', low: 'pizz', string: 'pizz', tap: 'tick', thud: 'knock' },
        sig: (h, dt) => { [0, 2, 4, 7].forEach((d, i) => h.n('musicbox', h.deg(d) + 12, dt + i * 0.07, 0.34)); h.d('ting', dt + 0.28, 0.2); } },
      glass: { song: glass, room: 'crystal', reg: 67, motif: [4, 6, 7, 9], voxKind: { kind: 'struck', inst: 'crystal', gain: 0.4, root: 79, quant: [0, 2, 4, 7, 9, 12, 14, 16], blip: 3, cps: 28, key: 0, send: 0.4 }, dress: { tune: 1 },
        pal: { lead: 'glass', soft: 'harp', bell: 'crystal', box: 'crystal', gliss: 'harp', low: 'harp', string: 'harp', tap: 'tick', thud: 'felt' },
        sig: (h, dt) => { [0, 4, 7, 9, 11].forEach((d, i) => h.n('harp', h.deg(d), dt + i * 0.04, 0.3)); h.n('glass', h.deg(7) + 12, dt + 0.2, 0.3); } },
      basic: { song: basic, room: 'studio', reg: 72, motif: [2, 4, 6, 7], dress: { jaw: 0.2, jawDrums: ['tick', 'tock'], tune: 0.6 },
        pal: { lead: 'felt', soft: 'felt', bell: 'sine', box: 'sine', gliss: 'felt', low: 'softbass', string: 'felt', tap: 'tock', thud: 'felt' },
        sig: (h, dt) => { h.d('tick', dt, 0.36); h.d('tock', dt + 0.12, 0.3); h.n('felt', h.ch[0], dt + 0.12, 0.36); h.n('felt', h.ch[2], dt + 0.24, 0.4); } },
      phosphor: { song: phosphor, room: 'tube', reg: 72, motif: [2, 4, 7, 9], special: 'phosphor', vox: { wave: 'chip50' }, dress: { tune: 1 },
        pal: { lead: 'chip25', soft: 'chip50', bell: 'chip12', box: 'chip25', gliss: 'chip50', low: 'chiptri', string: 'chip50', tap: 'nztick', thud: 'nzkick' },
        sig: (h, dt) => [0, 2, 4, 7, 9].forEach((d, i) => h.n('chip25', h.deg(d), dt + i * 0.035, 0.24, { dur: 0.04 })) },
      teletype: { song: teletype, room: 'office', reg: 67, motif: [4, 7, 9, 11], special: 'teletype', vox: { inst: 'toypiano', gain: 0.46 }, dress: { tune: 1 },
        pal: { lead: 'tack', soft: 'toypiano', bell: 'bell', box: 'toypiano', gliss: 'tack', low: 'tack', string: 'tack', tap: 'key', thud: 'space' },
        sig: (h, dt) => { [0, 2, 4, 7].forEach((d, i) => h.n('toypiano', h.deg(d) + 12, dt + i * 0.06, 0.34)); h.n('bell', h.deg(4) + 12, dt + 0.26, 0.24); } },
      nier: { song: nier, room: 'opera', reg: 74, motif: [4, 7, 8, 9], special: 'nier', dress: { plink: 0.07, plinkInst: 'softbell', plinkFin: true, tune: 1 },
        pal: { lead: 'softbell', soft: 'harp', bell: 'celesta', box: 'celesta', gliss: 'harp', low: 'pizz', string: 'harp', tap: 'click', thud: 'felt' },
        sig: (h, dt) => { [0, 2, 4, 7].forEach((d, i) => h.n('harp', h.deg(d), dt + i * 0.05, 0.3)); h.n('softbell', h.deg(4) + 12, dt + 0.22, 0.3); } }
    }
  };
})(window);
