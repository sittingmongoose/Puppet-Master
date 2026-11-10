# Pip's sound: three concepts (Fable 5.2)

Three directions for the sound and music of PMConcept7's onboarding, each with a tune, a voice for Pip and a set of
sounds for all six looks (Friendly, Glass, Basic, Retro Dark, Retro Light, NieR), and an upgrade of Pip's stage on the
left of the window. Everything is synthesised in the browser as it plays: no audio files, no samples.

Open `index.html` (the listening room) to hear everything side by side, or one of the three concept pages to walk
through the onboarding window with that concept's sound. Double-click works; so does the Concept Hub.

| Page | What it is |
|---|---|
| `index.html` | The listening room: every tune by look and concept, "how far along" steps, Pip says anything, every sound of the window, and today's sound for comparison |
| `concept-1.html` | Encore, in the onboarding window |
| `concept-2.html` | House Band, in the onboarding window |
| `concept-3.html` | Marionette Theatre, in the onboarding window |

The concept bar on every page switches between the three and **Today** (the sound PMConcept7 has now, loaded from
`../opus-5.5-pip/sound.js` only when asked for), and has a mixer for music, Pip and effects. `?sound=c2` picks a concept,
`?theme=`, `?screen=`, `?width=` and `?reduced=1` work as in the Pip concept.

The window, its screens and its copy are the Pip concept's (`../opus-5.5-pip`), kept as they were, so the sound and the
stage are the only things that differ from what PMConcept7 has.

## The three directions

### 1 · Encore: today's sound, finished

The same six materials, the same gestures and the same tunes, in better instruments and a real arrangement. Each
look's eight bars are kept note for note as the theme (A); a harmony, a bass, an inner part and a little percussion are
written under it, and a new bridge (B) makes it an AABA song of 32 bars. Pip asleep is the theme alone, as it is today;
a part joins at each chapter; a counter-melody arrives with AI and everything plays at Ready.

| Look | Tune | Playing |
|---|---|---|
| Friendly | Felt Lullaby, C major, 108 BPM | music box, marimba, kalimba, wood bass, shaker, glockenspiel |
| Glass | Open Glass, D major, 100 BPM | struck glass, crystal arpeggio, vibraphone, water drops, soft bell |
| Basic | Question and Answer, C major, 94 BPM | a clean tone asking, a second one answering in its rests, soft keys, a click |
| Retro Dark | Terminal Idle, C major, 150 BPM | pulse lead, pulse arpeggio, triangle bass, noise drums |
| Retro Light | Clockwork Celesta, G major, 106 BPM | celesta, wood bass, typewriter keys and space bar, margin bell, ratchet |
| NieR | Wistful Bell, A minor, 66 BPM | soft bell, harp, soft bass, a little glockenspiel; the theme now comes to rest on C |

### 2 · House Band: a genre for each look, and you put the band together

A different direction from a quiet tune behind a window. Each look is a band. Pip plays alone while it sleeps, then a
player joins at each step the person takes: rhythm, bass, drums, the tune, the colour. Every click is a hit from the
band, moved to the next sixteenth when that is less than 0.13 s away, and always in the chord. Pip talks in the song's
key, its syllables pulled to the beat.

| Look | Tune | The band |
|---|---|---|
| Friendly | Sunny Side Strum, G major, 108 BPM, a little swing | ukulele, upright bass, kick, claps and snaps, marimba, glockenspiel |
| Glass | Bubble Drift, A major, 84 BPM | soft electric piano, soft bass, kick and rim, vibraphone, crystal |
| Basic | Tidy Trio, C major, 76 BPM, swung | electric piano, walking upright bass, brushes, vibraphone |
| Retro Dark | Bit Bop, E minor, 132 BPM | triangle bass in octaves, noise kit, pulse lead, fast pulse arpeggio |
| Retro Light | Carriage Return Rag, F major, 100 BPM | tack piano in stride, typewriter on drums, toy piano, margin bell |
| NieR | Paper Lanterns, A minor to C, 72 BPM | felt piano, soft bass, harp, music box, celesta |

### 3 · Marionette Theatre: a wound-up waltz on a small stage

Everything is in three. Clicks are stage machinery (a ratchet and pulley for Continue, a stagehand's knock for a block,
a bell and a run of the harp for a new act), opening the window winds the key, closing it lets the music box run down,
typing a name plays the music box one tooth a letter, and Pip's wooden jaw clacks when it talks.

| Look | Tune | Playing |
|---|---|---|
| Friendly | Toybox Waltz, F major, 3/4 at 138 | music box, pizzicato oom-pah-pah, a clock's tick and tock, glockenspiel, celesta |
| Glass | Crystal Carousel, G major, 6/8 at 56 | struck glass, harp, soft bell, a triangle |
| Basic | Metronome Study, C major, 3/4 at 84 | felt piano, a metronome, one clean tone |
| Retro Dark | 8-Bit Puppet Show, C major, 3/4 at 152 | pulse lead, triangle oom, pulse pah-pah, noise tick |
| Retro Light | Pianola Paper Waltz, G major, 3/4 at 126 | tack piano, the paper roll's pawl, toy piano, margin bell |
| NieR | Aria for a Quiet Stage, D minor, 6/8 at 50 | soft bell, harp, pizzicato, harpsichord, celesta |

**Where it comes from.** Jared pointed to two pieces as inspiration. From "Marionette's Dream" (Tennon) only the quiet
passages were used as a model: a key being wound, a ticking clock, a waltz's oom-pah-pah and a slow music-box line (the
piece is a D-minor waltz at about 161 BPM between heavy sections, which were left alone). From "A Beautiful Song"
(NieR:Automata) the NieR look takes D minor with a raised seventh, a lilting six-eight and the sense of a voice alone on
a stage; here there is no voice, no choir and no drums, the theme is on a soft bell over a harp, each chapter is an act,
and at Ready the theme comes back in D major. No melody from either piece is quoted; both were analysed for key, metre,
tempo and instrumentation, not transcribed.

## Pip's voice

The babble PMConcept7 has stays: one syllable for each group of vowels, said at the pace the bubble types it, in a voice
for each look (a formant creature in Friendly and Glass, clean chirps in Basic, a chip in Retro Dark, struck notes with
a key's tick in Retro Light, a Pod's stepped tones in NieR). Added in all three concepts:

- **Consonants.** p t k pop and b d g bump, s and sh hiss, m and n hum through the nose, l r w y glide into the vowel,
  and a word's last consonant is heard. Vowel pairs slide ("ou", "ay", "oy").
- **Shape.** Words carry stress, little words are passed over lightly, a phrase falls as it goes, a question lifts, an
  exclamation jumps, and "..." trails away.
- **Breath.** A comma is a short pause and a full stop a longer one, and the typing waits with the voice: the voice
  gives the bubble the moment of every letter (`say()` returns `shown(ms)`).
- **A mouth.** Every line leaves a timeline of how open and how round the mouth is (`PipSound.mouth()`), which the
  stage draws.
- **Dress.** Per concept: in House Band the notes are drawn to the song's scale and the syllables to its sixteenths; in
  Marionette Theatre Friendly's Pip has a wooden voice and a jaw that clacks, Glass's speaks in struck crystal, Retro
  Light's on a toy piano, and NieR's ends each phrase on a soft bell.

## The stage

`js/stage.js`, `js/worlds.js` and `js/wizard.js` are the Pip concept's files, unchanged apart from a header line and,
in the wizard, `progress()`. Everything new is in `js/stage-plus.js` and `css/plus.css`:

- Pip's mouth moves with its voice; Pip nods on the beat; the light behind it swells on the bar; props give a little.
- Notes drift up from whatever plays the tune (squares in NieR).
- A pool of light under Pip, a cone above it on dark stages, and a little depth: the backdrop slides against the pointer.
- More in each world: a sun or a crescent moon, stars, bunting, trees, grass and flowers in Friendly; shafts of light and
  prisms in Glass; registration marks, a title block with the sheet and the tempo, and an oscilloscope line in Basic;
  stars and a spectrum on Retro Dark's tube; a printed tempo strip on Retro Light's paper; broken columns and a signal
  line in NieR. The analyser draws the real sound.
- Each concept dresses the stage: Encore sets a music box on the floor whose crank turns with the tune; House Band hangs
  an instrument for each player, which comes down when the player joins and moves when it plays; Marionette Theatre
  closes the stage in with drapes, a valance, footlights that follow the beat, and a music box with a key that turns in
  time. A new chapter draws the drapes in and parts them again.
- All of it is drawn with each world's own pen, so it is felt, glass, a diagram, phosphor, print or ink line art.
- Under Reduced Motion the pieces are shown and nothing moves. Reduced Motion never mutes.

## How the sound is built

| File | What is in it |
|---|---|
| `js/audio/core.js` | The engine: three buses (music, effects, voice), a room for each look built in code, a soft limiter, the analyser, and events handed to the stage when they are heard |
| `js/audio/inst.js` | The instruments. Bars, tines and glasses are sums of decaying partials at the ratios real ones ring at; strings are a tuned Karplus-Strong loop with a body; pianos are stretched harmonics under a hammer; drums and clockwork are short buffers |
| `js/audio/music.js` | How a tune is written and played: bars of tokens, chords as symbols, patterns over the chords, sections by chapter, parts by intensity. Also the paper check (`lint`) |
| `js/audio/voice.js` | Pip's voice |
| `js/audio/sfx.js` | The three sets of gestures (`g1` Encore, `g2` House Band, `g3` Marionette Theatre) and what only one look does |
| `js/audio/concept1.js`, `concept2.js`, `concept3.js` | The scores, palettes and voices of each concept |
| `js/audio/levels.js` | Measured trims, written by `tools/checks/levels.check.mjs` |
| `js/audio/api.js` | `window.PipSound`: the Pip concept's calls (`play`, `say`, `hush`, `loop`, `setTheme`, `toggle`) plus `setConcept`, `volume`, `progress`, `parts`, `on('beat' / 'note')`, `mouth`, `transport`, `analyser`, `render` |

A tune is text. `e5 - - g5 e5 - c5 -` is a bar: its tokens share the bar equally, `-` holds the note before it, `_` is
a rest, `[a b]` splits a slot. Chords are symbols (`Dm G`), and the accompaniment is patterns over them (`r` the root,
`f` the fifth, `1 2 3` the chord's notes from the bottom, `x` the whole chord), so a part follows the harmony by itself.

Kept from earlier listening, as rules: nothing is held (no hum), no two tones a hair apart (no wobble), nothing switched
on and off fast (no buzz), no low thump on a page change, no moaning vowels in NieR. Nothing sounds before the first
click or key. Hovering is silent outside NieR.

## Checked by measurement

The model that made this cannot hear, so it was checked the ways it could be:

```sh
node tools/lint.mjs                                                  # every tune on paper: bars, each melody note against its chord
browser-check run tools/checks/render.check.mjs --set out=/abs/dir   # render what the pages play to WAV
node tools/measure.mjs /abs/dir                                      # loudness, peaks, hum, wobble, buzz
browser-check run tools/checks/levels.check.mjs                      # every event, voice and tune against its target level
browser-check run tools/checks/levels.check.mjs --set write=1        # re-measure and rewrite js/audio/levels.js
browser-check run tools/checks/page.check.mjs --set looks=...        # the three pages: gesture gate, tune follows the flow, mouth, set
browser-check run tools/checks/room.check.mjs                        # the listening room
```

Levels are matched across the eighteen looks by measurement (BS.1770): a spoken line at −26 LUFS, a full tune at −30
with the music slider at 85 % (the listening room's setting; the onboarding pages start it at 50 %, about −35, so
clicks and Pip stay in front of it), and each event at its own target, with short clicks also held under a peak. How it actually sounds is for a person to
judge; the numbers only say that no look is louder than its neighbour and that nothing hums, wobbles or buzzes.

## Not done

- Only the onboarding window is covered: not the Guided Tour, the chat, or Settings › Notifications & Sounds.
- Nothing here is in PMConcept7 or in Plans. If one direction is chosen, its engine would replace Pip's kits, voice and
  music in `Concepts/onboarding/opus-5.5/src/js/15-sound-pip.js` and the stage additions would go into `58-rig.js`.
