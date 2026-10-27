# Onboarding with Pip (Opus 5.5 concept)

A reimagining of PMConcept7's onboarding window with Pip as the mascot. The scene beside every screen
is Pip's stage: one character, a set of props, and a world that changes with the look. The words are
PMConcept7's onboarding copy; Pip's lines are new. Open `index.html` (double-click works).

## The idea

The control is you. Pip hangs from it, and every choice you make lowers something onto the stage.

- **Pip is the guide.** It reacts to what you do: it wonders while you hover, cheers or winks when
  you choose, looks at what you pick, sleeps until you arrive, and powers up when AI is connected.
- **Hover previews, choosing commits.** Pointing at a choice lowers a ghost of its prop on a dashed
  string; clicking it drops the real prop in, which swings and settles, and Pip celebrates.
- **It is physics, not keyframes.** Pip is a pendulum on the hand: when the hand moves, Pip swings
  and settles, and both strings are solved every frame from the screw eyes on the bar to the eyes on
  its head (the same solver as the logo). Every prop hangs on its own string and swings too.
- **Pip is alive between moments.** It breathes, its eyes follow your pointer, it turns to whatever
  you point at, and now and then it fidgets: looks up at the bar, kicks into a little swing, wiggles
  or glances round. It only wakes on the Welcome screen when you really arrive (a key, or the pointer
  travelling), not when the page loads under a resting pointer.
- **Pip talks.** Every line is typed into its bubble at the pace Pip's voice says it (see Sound).

## The screens

| Screen | On Pip's stage |
|---|---|
| Welcome | Pip asleep on slack strings; it wakes when you move or press a key, and says hello |
| Pick a look | Hovering a look makes Pip try it on (it flips into that look's Pip, with that look's sound); the world follows once picked |
| The computer | A laptop, a laptop and a phone, or a server, lowered in on strings |
| Project begins | A blank page, a folder, or a restore box |
| Name | A sign that spells your Project's name as you type; Pip gasps if it gets too long |
| Keep it safe | A vault; an online copy and a backup box join it when chosen |
| Away from home | A house, or a house and a globe |
| Review | A clipboard ticked off one line at a time as the review rows appear |
| Creating | Each phase is a block lowered onto a stack; the strings drop away once a block lands; Pip rocks the control while it works |
| AI | One orb per provider; each lights as it connects, and Pip's strings carry power |
| Ready | Your choices return as charms, and the crew (Pips in a crown, a hard hat and glasses) takes a curtain call |

## The five worlds

| World | Stage | Life around Pip | Celebration | Chapter change |
|---|---|---|---|---|
| Friendly | felt diorama: stitched hills, a glow in the chapter's colour | felt clouds swaying on their threads, crumbs drifting, fireflies (dark) or paper butterflies (light) | stars, hearts and a wink | Pip hops |
| Glass | PMConcept7's Ribbons wallpaper, a glass floor with Pip's reflection | caustics moving, bubbles rising, ripples on the floor where a prop lands | glints and rising bubbles | a light sweep |
| Basic | dot grid, a ruled floor, one accent | a dot orbiting the guide circle, a plumb line from Pip and a marker riding the ruler | a ring and a check | a small hop |
| Retro Dark | a green-phosphor monitor (PMConcept7's Retro Dark terminal, PM Phosphor Green) | a phosphor graticule, a vector terrain rolling toward you, the tube's grain, flicker and rolling bar, phosphor persistence trailing Pip | phosphor pixels and glyphs, `[ OK ]` | a degauss: the picture wobbles and tints, then settles |
| Retro Light | the same machine's printout (PM Paper Teletype) on green-bar paper with tractor-feed margins | halftone props in ink with red and blue accents, faint ink persistence | printed `* + × ✓` and paper chads | the paper feeds up a page |
| NieR | parchment, graph paper, a YoRHa Pip that hovers like a Pod | a scanner ring turning, motes rising, a data column, a scan line sweeping the stage | target brackets fly in and lock with a leader line, `// CONFIRMED`, a burst of squares | a slice glitch and QUEST UPDATED |

### Retro, after PMConcept7's terminal

The Retro stage is a monitor built the way PMConcept7's terminal draws one (its Full CRT effects,
`50-fx-gl.js`, and its monitor bezel, `71-bezel.js`): a case with a sloped face in four parts lit
from above, the screen's light spilling onto it, a power LED; inside, the tube with rounded corners,
phosphor glow, scanlines, an aperture grille (dark), grain, a flicker held under 3 % (the terminal's
own cap), a rolling bar, a vignette and the glass's sheen. Retro Dark is the charcoal case and the
green phosphor; Retro Light is the putty case and the Paper Teletype printout. The tube refreshes in
steps (20 a second) and the phosphor holds the last frames of Pip while it moves. It powers on with
the classic line-then-picture (Retro Light prints itself from the top instead) and switches off to a
line and a dot when the window closes. A terminal runs on the tube: a status line with the chapter,
boot text on the Welcome screen, and a command line that types what the scene is doing
(`pip lower laptop phone --preview`, `pip vault --git --github`, `pip build history 2/4`). The faces
are VT323 (Retro Dark, as the terminal uses) and IBM Plex Mono (Retro Light).

### NieR

Pip hovers like a Pod (a slow bob, a little drift), talks in a YoRHa dialogue box with its name tab,
and the stage is a unit's HUD: a unit header with a decoding label, a scanner ring, a scan line that
sweeps every few seconds, a coordinate readout, target brackets that fly in and lock with a turning
marker and a leader line labelled at its elbow, and QUEST UPDATED on a chapter change. The window
follows: the menu cursor square slides in beside whatever you point at, the chosen row fills from the
left, and screens wipe in behind an ink bar.

## The chapter rail

A string pulled taut between two screw eyes, a bead for each chapter, and Pip riding it like a zip
line: the string dips under Pip's weight, Pip slides to the current chapter on each look's own spring
and swings when it stops, the walked part of the string is in the accent, and finished beads are
filled (and jump back when clicked). Retro steps the slide; NieR's rail is a rigid track Pip glides
along.

## Sound

`sound.js` (window.PipSound) synthesises every sound with Web Audio: no files, nothing sampled. Each
look has its own kit, and Pip has a voice in each. Nothing plays before the first click or key press;
the speaker in the window's header (or the concept toolbar) turns it off. `sounds.html` is a sound
board: every kit and every event, and a box to make Pip say anything.

## Sizes and motion

- Desktop and laptop: the stage is a tall pane beside the screen. Narrow windows: a strip above the
  screen. Squeezed windows: a short strip with Pip beside its bubble.
- Reduced motion (the OS setting, the Concept Hub's switch, or the toolbar): nothing swings, travels,
  flickers or trails; props appear in place, Pip changes expression only, and the sounds that only
  describe motion are left out.

## Files

```
index.html       the page: concept controls, a quiet PMConcept7 shell, the onboarding window
wizard.js        screens, flow, the chapter rail, and the director that turns each screen's state into a scene
stage.js         Pip's stage: the rig and physics, Pip's idle life, props, effects, speech, the Retro monitor and terminal, NieR's HUD
worlds.js        the worlds' backdrops and palettes, the material "pen", and the prop library
sound.js         the sound: kits, Pip's voice, loops, and an offline renderer
sounds.html      the sound board
stage.css        the stage's layers, bubble, the monitor and CRT layers, HUDs
styles.css       the window in each look
fonts-extra.css  VT323 and PM NieR Mono, copied from PMConcept7's own font faces
tools/build_standalone.py   writes self-contained HTML files for sharing (the concept and the sound board)
tools/sound_levels.mjs      renders every kit and event offline and checks levels
```

Pip comes from `../../Icon-Concepts/Opus5.5icon/pm-logo.js` (its `kit` export), so the mascot here is
the same drawing as the logo. Fonts and Glass's wallpaper come from that folder too.
