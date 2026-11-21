# Pip's sound, round two (Fable 5.2)

Round one (the folder above this one, `..`) offered three complete directions for the sound of PMConcept7's onboarding. Jared's
answer (20 Nov 2026) was to keep all of it as a choice of music and to fix ten things. This folder is that: one voice
for Pip and one set of effects in each look, four songs to choose from, a sound menu, and the stage and the listening
room polished. Everything is synthesised in the browser as it plays: no audio files, no samples.

| Page | What it is |
|---|---|
| `index.html` | The listening room: pick a song, walk through the onboarding to hear it grow, all 24 songs, Pip says anything (in each take of a voice), every sound of the window |
| `onboarding.html` | The onboarding window with this sound, the sound menu under its speaker, and the same speaker in the app's bar beside the theme picker |

`concept-1.html` to `concept-3.html` only point at `onboarding.html` (the three concepts are in the round-one folder).
`?theme=`, `?screen=`, `?width=` and `?reduced=1` work as in the Pip concept; `?audiodebug=1` shows what the sound is
doing on the page. On a phone the onboarding window starts in its squeezed layout. Both pages were tried in Safari in
the iPhone simulator (iOS 27.3): they load, the first tap starts the sound, and the sound menu fits and works.

## What Jared asked for, and what was done

| # | His note | What changed |
|---|---|---|
| 1 | Effects and transitions rough; many sounds at once | **One sound per moment.** A click's answers have a rank; two that start within a tenth of a second are one moment and the higher rank is heard. The stage's own noises (a prop lowered, set down, lifted) are quiet, one at a time, never right on top of an answer, and silent while Pip speaks. Pip's line waits for the click's answer and a breath after it (0.56 s after a chapter's fanfare, 0.32 s after a step, 0.2 s after a tick). A part that joins the song rises in through its first bar. In Retro Dark, where Pip's chip voice and the chip tune are the same kind of sound, the song steps furthest back while Pip speaks. |
| 2 | Voices | Friendly, Basic, Retro Dark and Retro Light speak with **today's sound** (rebuilt from `sound.js`) and the new phrasing, with consonants only as light as they were. Glass speaks in **struck notes** (round one's Retro Light voice) over a murmur of its old voice, close by. NieR keeps round one's voice in a small room instead of a hall. The listening room plays every take side by side. |
| 3 | The strum on every screen change; a deep thump | The House Band's and the Theatre's click sets are gone: one set of effects now (round one's Encore set, reshaped). Nothing the window or the stage plays carries anything low: they are high-passed in the mixer, and the level check fails any event with a thump. |
| 4 | The music seems to restart | It did: the player went back to bar 1 at every chapter. A new screen or chapter never starts the song again. |
| 5 | Encore's stage details, polished; the crank; performance | The music box is in every look that has a floor. Its crank is drawn edge on and turns as a side crank does. What moves in time with the song is run by the compositor; nothing is written per frame (see "The stage"). |
| 6 | Gemini 4 Neon to review all the audio | It passed a hearing test (ten clips with known flaws), reviewed round one against the notes, and judged round two **blind**, old against new (see "Heard, and measured"). |
| 7 | Keep the original music | "Original" is one of the four songs in every look: today's tune and instruments, ported note for note, lightly refined. |
| 8 | A sound menu; four songs a look; defaults; a jukebox; reworks | `js/soundmenu.js`. Defaults: Encore, except Glass (Crystal Carousel), Retro Dark (Bit Bop) and NieR (Paper Lanterns). Bubble Drift, Tidy Trio and Open Glass are rewritten; Bit Bop sleeps to a lullaby of its own hook. |
| 9 | Retro Light's printer effect breaks up | It was a ratchet of many metal clicks at an even, fast pace. Now a few spaced key taps and the margin bell. |
| 10 | The listening room | Pip's area stands upright, as in the onboarding (the wide box drew the Retro looks wrongly). The controls are two numbered blocks: 1 pick a song, 2 walk through the onboarding, each step saying what joins, with "Walk it for me". |

## The sound menu

Press the speaker and a small menu drops under it, laid out the way PMConcept7's theme picker is: a row of choices on
top, then rows to pick from, hung under its button and over the page.

- **Sound on / Off.**
- **Music, Effects, Pip:** three levels. Letting go of Effects or Pip plays a sample at the new level.
- **Song:** the four songs of the look on show. The one playing has three moving bars; "Default" marks the look's own.
- **Jukebox:** when a song has been once round, another of the four comes on, never the same twice. "Next song" moves on at once.

It remembers what was set (`localStorage`, key `pipSound.r2`: the levels, on or off, the song chosen for each look,
the jukebox). There is one menu; it hangs under whichever speaker was pressed. In PMConcept7 it belongs in the title
bar's top right beside the theme picker, and the sound button in the chat goes: `onboarding.html` shows it in both
places. It only talks to `window.PipSound`.

## The songs

Four a look. `*` is the look's default.

| Look | Encore | House Band | Marionette Theatre | Original |
|---|---|---|---|---|
| Friendly | Felt Lullaby `*` | Sunny Side Strum | Toybox Waltz | today's lullaby |
| Glass | Open Glass (rewritten) | Bubble Drift (rewritten) | Crystal Carousel `*` | today's open arpeggio |
| Basic | Question and Answer `*` | Tidy Trio (rewritten) | Metronome Study | today's question and answer |
| Retro Dark | Terminal Idle | Bit Bop `*` (new sleeping opening) | 8-Bit Puppet Show | today's idle tune |
| Retro Light | Clockwork Celesta `*` | Carriage Return Rag | Pianola Paper Waltz | today's celesta tune |
| NieR | Wistful Bell | Paper Lanterns `*` | Aria for a Quiet Stage | today's wistful line |

- **Open Glass:** the tune is still PMConcept7's, note for note. Under it: a harp in broken chords, a plucked bass that moves, a soft shaker, warmer chords, a fifth quicker, a sunlit room instead of a hall.
- **Bubble Drift:** was a sleepy lounge with no tune for half a minute. Now a quick bossa pulse, short bright chords, a springy bass, and the vibraphone has the tune from the moment Pip wakes.
- **Tidy Trio:** was a bass that stomped and no tune. Now the vibraphone has a call and its answer from the first bar, a felt piano comps lightly, the bass walks softly in two.
- **Bit Bop asleep:** was a bare arpeggio that read as a test tone. Now the hook at half speed on one soft voice, and the tune arrives at the first step.
- **House Band songs** bring their tune in one or two steps earlier than in round one, and hint at it while Pip sleeps.
- **Original:** after Welcome a soft fifth answers the bass in every bar; Glass is a little brisker and in a brighter room; Retro Dark's thin round keeps its tune; NieR's bass note is let go sooner.

## Pip's voice

The babble stays: one syllable for each group of vowels, said at the pace the bubble types it. From round one it keeps
the reading of a line (stress, little words passed over, a phrase that falls, a question that lifts, a breath at a
comma and a longer one at a full stop, vowel pairs that slide) and the mouth that follows it. What changed is whose
sound it is (`VOX` in `js/audio/voice.js`), and `ALT` there holds the other takes the listening room can play.

## The stage

`js/stage.js`, `js/worlds.js` and `js/wizard.js` are the Pip concept's files, as in round one. `js/stage-plus.js` is
rewritten to PMConcept7's performance rules (README of `../../opus-5.5`, "Performance rules", and the hand-over of 20 Nov),
so it can go into its rig without undoing that work:

- What moves in time with the song (the crank, the music box, the light under Pip, the glow behind it, the flowers) is a transform or opacity animation the compositor runs, set going once when a song starts. No script runs per frame for it.
- Nothing is written every frame. The mouth is written only while Pip speaks; the sound's own picture (a line in Basic and NieR, bars on Retro Dark's tube) about twelve times a second, in whole pixels, and only when it differs.
- The floating notes are five elements used again and again.
- Round one's parallax is gone (a write on every frame), and so is the squeeze it gave every prop on the bar.
- Sound events reach the stage on a timer set for the next one, not on a `requestAnimationFrame` loop.
- Pip's nod is a small push on this stage's springs. In PMConcept7's rig it belongs in the idle pose (drawn at its 30 Hz), so that a tune never wakes the full-rate drawing. That move is for the integration.

`tools/checks/page.check.mjs` counts every change the additions make to their own layers over two seconds while a song
plays: at most 8 in a look with no picture of the sound, at most 34 in one with it.

## How the sound is built

| File | What is in it |
|---|---|
| `js/audio/core.js` | The engine: three buses (the music's with a duck for when Pip speaks), a room for each look and each song, a soft limiter, the analyser, events handed to the stage when they are heard |
| `js/audio/inst.js` | The instruments (modal bars and bells, plucked strings, pianos, chips, drums and clockwork) |
| `js/audio/music.js` | How a song is written and played: bars of tokens, chords as symbols, patterns over them, parts by how far along the person is |
| `js/audio/concept1.js`, `concept2.js`, `concept3.js` | The songs of the three families (Encore, House Band, Marionette Theatre) |
| `js/audio/original.js` | Today's six tunes and their instruments, ported from the Pip concept's `sound.js` |
| `js/audio/looks.js` | Each look's materials, its four songs and which one it starts with |
| `js/audio/voice.js` | Pip's voice, and the other takes of it |
| `js/audio/sfx.js` | The one set of gestures, and what only one look does |
| `js/audio/levels.js` | Measured trims, written by `tools/checks/levels.check.mjs` |
| `js/audio/api.js` | `window.PipSound`: `play`, `say`, `hush`, `loop`, `setTheme`, `toggle`, plus `songs`, `setSong`, `setJukebox`, `skip`, `volume`, `voices`, `setVoice`, `progress`, `parts`, `on`, `mouth`, `transport`, `analyser`, `render`, `health` |
| `js/soundmenu.js`, `css/soundmenu.css` | The sound menu |

## Heard, and measured

The model that wrote this cannot hear. Gemini 4 Neon can (it takes the WAV files in as audio), so it was the listener:

1. **A hearing test first:** ten clips with known contents (a clean tune, one with a low thump, clipped, with dropouts, drowned in reverb, a dissonant strum, a buzz). It named all of them; it was weaker at counting very fast hits and at exact times.
2. **Round one against Jared's notes:** it placed the strum in the House Band's click set, the thump mainly in `land`, the printer grit in Retro Light's ratchets, and heard the restart at every chapter.
3. **Round two, blind:** old and new takes under neutral names. The new effects were chosen in all six looks; the new voices in Friendly, Glass, Basic and Retro Light; all four rewritten songs over their first versions; and it heard the restart only in the old takes. Its remaining notes were then applied (each click answer its own shape, lighter landings, a chapter as a small fanfare, the song further back under a voice of notes or a chip, NieR in a small room, a sparser harp in Open Glass).
4. **Before and after those notes, blind again:** the later effects were chosen in all six looks, and Open Glass, Bubble Drift and Paper Lanterns were heard as better. Walking through at a person's pace it scored Friendly 4 of 5, Glass 3 (bell tails over Pip) and Retro Dark 2 ("square waves on square waves"). So the chips were rounded off, Bit Bop's top parts brought down, the song set further back under a voice of notes or of a chip, and click notes in Glass and NieR let go sooner.
5. **The final takes, blind:** the final effects were chosen or level in all six looks (NieR "a lot", Glass and Retro Light a little). Terminal Idle and Bit Bop were "a lot" easier on the ear (2 to 4 of 5) without losing their character, and the walks through Glass and Retro Dark better (3 to 4); Friendly the same at 4. A last short check scored Retro Dark's busy clicks and its walk 4 of 5, "would ship". What it still flagged there, in every take, were a piercing sparkle and a sharp confetti: Retro Dark's bell was a thin pulse wave, and those sounds put it two octaves up. Playing them an octave lower moved the note and left the sting (above 2 kHz the sparkle measured the same), so the bell there is now the square wave and its effects stay at or below G6 (`PALX` and `TOP` in `js/audio/looks.js`): at equal loudness the sparkle carries about 7 dB less above 2 kHz and 11 dB less above 4 kHz. Heard blind, twice with the letters swapped: the new take chosen both times (3 to 4 of 5), "much less piercing". The walk through Retro Dark scored 3 in that round, in both takes, where the round before had given the same take 4: this listener's scores move by a point from one session to the next, so only the order inside a pair is used.
6. **What was tried and dropped:** a low-pass drawn across the song while Retro Dark's chip voice speaks. The listener preferred the plain, deeper step back, and a measurement said why: the song's room return passes neither the duck nor the filter and carries the song's edge, so the filter took 4 dB off for a quarter of a second at best.

What that listener can and cannot be asked, as found here:

- **Told which take was "the original", its first review praised it;** blind, it ranked the same file last for Retro Dark. Only blind results are relied on, and Jared's ear outranks them.
- **It hears timbre, harshness, thumps, level and a large step in reverb.** Two controls in the last check came back right: the same file under two names was "no real difference", and the same two takes of NieR's voice offered twice with the letters swapped got the same verdict both times (the close one, "a lot").
- **It does not hear a tenth of a second.** Asked to rank three takes that differed mainly in how long Pip waits after a click (0.46 against 0.56 s), it ranked the same takes in opposite orders in two sessions. Those rankings were not used; the breath after a click was set by the notes' own lengths.
- **Its letters can slip.** One chip song was called "harsher" in the take that measures 1.7 dB quieter above 3 kHz, like the two it called smoother. A verdict that contradicts a measurement is checked against the files (checksums, band levels) before it is believed.
- **NieR's voice** went dry (send 0.10), then to a hall (0.24, heard as distant both times it was offered), and stands at 0.12: close, with a little room.

```sh
node tools/lint.mjs                                                  # every song on paper: bars, each melody note against its chord, leaps
browser-check run tools/checks/levels.check.mjs                      # every event, voice and song against its target level; no event may thump
browser-check run tools/checks/levels.check.mjs --set write=1        # re-measure and rewrite js/audio/levels.js
browser-check run tools/checks/page.check.mjs --set looks=...        # the window: the song never restarts, no pile of sounds, the menu, the stage's cost
browser-check run tools/checks/page.check.mjs --set pace=5 --set trace=/abs/walk.json   # walk it as a person would and keep the walk
browser-check run tools/checks/render.check.mjs --set out=/abs/dir [--set trace=/abs/walk.json]   # render to WAV (and play a kept walk back)
node tools/measure.mjs /abs/dir                                      # loudness, peaks, hum, wobble, buzz
browser-check run tools/checks/room.check.mjs                        # the listening room, at three widths
browser-check run tools/checks/orig.check.mjs --set out=/abs/dir     # today's sound, rendered for comparison
python3 tools/build_standalone.py /abs/dir [--debug]                 # two single files that open anywhere
browser-check run tools/checks/room.check.mjs --sandbox --set page=file:///abs/dir/pip-sound2-room.html          # a single file as T3's viewer shows it (a sandboxed frame, no storage)
browser-check run tools/checks/page.check.mjs --sandbox --set page=file:///abs/dir/pip-sound2-onboarding.html    # the same for the onboarding window
browser-check run tools/checks/render.check.mjs --set out=/abs/dir --set kinds=busy --set mute=voice,sfx         # the song alone under Pip's lines, to measure how it steps back
```

Levels are matched by measurement (BS.1770): a spoken line at −26 LUFS, a full song at −30 with the music level at
85 % (the onboarding page starts it at 50 %), each event at its own target.

## Not done

- Only the onboarding window is covered: not the Guided Tour, the chat, or Settings › Notifications & Sounds.
- Nothing here is in PMConcept7 or in Plans. PMConcept7's sound is `O55.sound` (`../../opus-5.5/src/js/15-sound.js`, 49 events, shown in Settings) and `15-sound-pip.js`; putting this in means mapping those events, moving the stage additions into `58-rig.js` by its rules, placing the menu in the title bar and removing the chat's button. That is a job for the PMConcept7 build, after Jared has heard this round.
- The three `concept-N.html` pages only point at `onboarding.html`. They are leftovers of copying round one's folder; a delete was refused by a safety check and not worked around.
