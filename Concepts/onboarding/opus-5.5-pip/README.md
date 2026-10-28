# Onboarding with Pip (Opus 5.5 concept)

A reimagining of PMConcept7's onboarding window with Pip as the mascot. The scene beside every screen
is Pip's stage: one character, a set of props, and a world that changes with the look. The words are
PMConcept7's onboarding copy; Pip's lines are new. Open `index.html` (double-click works).

## The idea

The control is you. Pip hangs from it, and every choice you make lowers something onto the stage.

- **Pip is the guide.** It reacts to what you do: while you rest on a choice it wears the face of what
  it says about it (pleased, or curious), cheers or winks when you choose, looks at what you pick, sleeps
  until you arrive, and powers up when AI is connected.
- **When something goes wrong, Pip is worried with you** (worried brows, a wobbly mouth, a bead of sweat;
  in NieR, worried eyes on its band) and says so, and the warning sound plays. Three places show it: a
  Project name you already have (type `tastebook`: Continue waits for another name); Google Antigravity's
  Sign in on the AI screen (the first try fails, as if the browser was closed; Try again works); and
  Cursor's API key (a key shorter than 20 characters is refused, in PMConcept7's words). Pip cheers when
  it is put right.
- **Hover previews, choosing commits.** Resting the pointer on a choice lowers a ghost of its prop on a
  dashed string; clicking it drops the real prop in, which swings and settles, and Pip celebrates. A
  preview waits until the pointer has rested on a choice for about 0.4 s (moving across the list to find
  your way changes nothing), stays at least 0.9 s, and holds 0.6 s when you leave, so the gaps between
  rows never flicker.
- **It is physics, not keyframes.** Pip is a pendulum on the hand: when the hand moves, Pip swings
  and settles, and both strings are solved every frame from the screw eyes on the bar to the eyes on
  its head (the same solver as the logo). Every prop hangs on its own string and swings too.
- **Pip is alive between moments.** It breathes, its eyes follow your pointer, it turns to whatever
  you point at, and now and then it fidgets: looks up at the bar, kicks into a little swing, wiggles
  or glances round. It only wakes on the Welcome screen when you really arrive (a key, or the pointer
  travelling), not when the page loads under a resting pointer.
- **Pip talks.** Every line is typed into its bubble at the pace Pip's voice says it (see Sound). The
  bubble takes the whole line's size first and the letters arrive in place; a line that changes faster
  than Pip could say it (a name being typed) waits until things are still, then types.
- **Ask Pip with ?.** Every choice has a ? at its right edge (a look tile in its corner; Light or dark,
  Project name and Free Models beside their label). Clicking it asks Pip about that one choice: Pip
  previews it, glances at its note and writes the answer out, with a small "idea" chime, in the look's
  material: a stitched paper note under Pip in Friendly, a frosted one in Glass, a dashed annotation in
  Basic, a terminal box in Retro Dark, a printed NOTE in Retro Light, and in NieR a TIPS box at the top
  right (its dialogue box already holds the foot of the stage). When the stage is only a strip (narrow
  windows), the answer opens in the form under that choice. Clicking the ? again, Esc, the note's close
  button or moving on puts it away, and focus returns to the ?. On a small stage a long note still fits:
  the hand lifts Pip to make room, as far as keeps its face in view, and its bubble steps aside meanwhile;
  on the monitor the note may run nearly the screen's width, in type sized to the screen. The answers are PMConcept7's own
  explanations, in its words where it has them (what a Server is, Git and Jujutsu, Tailscale's private
  name, "Claude plan, not the Anthropic API", the keychain). Nothing shows unless asked.

## The screens

| Screen | On Pip's stage |
|---|---|
| Welcome | Pip asleep on slack strings; it wakes when you move or press a key, and says hello |
| Pick a look | Hovering a look makes Pip try it on (it flips into that look's Pip, with that look's sound); the world follows once picked |
| The computer | A laptop, a laptop and a phone, or a server, lowered in on strings |
| Project begins | A blank page, a folder, or a restore box |
| Name | A sign that spells your Project's name as you type, sized to it: one line as large as fits, then two or three smaller ones; Pip gasps if it gets too long |
| Keep it safe | A vault; an online copy and a backup box join it when chosen |
| Away from home | A house, or a house and a globe |
| Review | A clipboard ticked off one line at a time as the review rows appear |
| Creating | Each phase is a block lowered onto a stack: it slows into its place and arrives level, takes its weight with a little squash (the blocks beneath give a touch), and its strings unhook and lift away; its sound plays at touchdown, and Creating is done when the last block is down; Pip rocks the control while it works |
| AI | One orb per provider; each lights as it connects, and Pip's strings carry power |
| Ready | Your choices return as charms, and the crew (Pips in a crown, a hard hat and glasses) takes a curtain call |

## The five worlds

| World | Stage | Life around Pip | Celebration | Chapter change |
|---|---|---|---|---|
| Friendly | felt diorama: stitched hills, a glow in the chapter's colour | felt clouds swaying on their threads, crumbs drifting, fireflies (dark) or paper butterflies (light) | stars, hearts and a wink | Pip hops |
| Glass | PMConcept7's Ribbons wallpaper, a glass floor with Pip's reflection | caustics moving, bubbles rising, ripples on the floor where a prop lands | glints and rising bubbles | a light sweep |
| Basic | dot grid, a ruled floor, one accent | a protractor under the hand reading Pip's swing in degrees, a plumb line from Pip and a marker riding the ruler | a check badge on the prop's corner, a ring spreading from it | a small hop |
| Retro Dark | a green-phosphor monitor (PMConcept7's Retro Dark terminal, PM Phosphor Green) | a phosphor graticule, a vector terrain rolling toward you, the tube's grain, flicker and rolling bar, phosphor persistence trailing Pip | phosphor pixels and glyphs, `[ OK ]` | a degauss: the picture wobbles and tints, then settles |
| Retro Light | the same machine's printout (PM Paper Teletype): green-bar paper with tractor-feed margins rising out of the printer, no screen | halftone props in ink with red and blue accents, the print head riding the line it prints | printed `* + × ✓` and paper chads | the paper feeds up a page |
| NieR | parchment, graph paper, a YoRHa Pip that hovers like a Pod | a scanner ring turning, motes rising, a data column, a scan line sweeping the stage | target brackets fly in and lock with a leader line, `// CONFIRMED`, a burst of squares | two bands of the picture slip sideways, and QUEST UPDATED |

### Retro, after PMConcept7's terminal

Retro Dark is a monitor built the way PMConcept7's terminal draws one (its Full CRT effects,
`50-fx-gl.js`, and its monitor bezel, `71-bezel.js`): a charcoal case with a sloped face in four parts
lit from above, the screen's light spilling onto it, a power LED; inside, the tube with rounded corners,
phosphor glow, scanlines, an aperture grille, grain, a flicker held under 3 % (the terminal's own cap),
a rolling bar, a vignette and the glass's sheen. The tube refreshes in steps (20 a second) and the
phosphor holds the last frames of Pip while it moves. It powers on with the classic line-then-picture
and switches off to a line and a dot when the window closes.

Retro Light is the same machine's printout, so it has no screen at all: a sheet of green-bar continuous
form rises out of the printer at the foot of the stage, held to the platen by the bail bar, with the
print head riding the line it prints. Opening the window feeds the paper in; a chapter change feeds it
up a page; closing it tears it off.

On both, a terminal runs: a status line with the chapter, boot text on the Welcome screen, and a
command line that types what the scene is doing (`pip lower laptop phone --preview`,
`pip vault --git --github`, `pip build history 2/4`). The faces are VT323 (Retro Dark, as the
terminal uses) and IBM Plex Mono (Retro Light).

### NieR

Pip hovers like a Pod (a slow bob, a little drift); at rest two eyes show through its blindfold and
blink, and its other moods light the band up. It talks in a YoRHa dialogue box with its name tab,
and the stage is a unit's HUD: a unit header with a decoding label, a scanner ring, a scan line that
sweeps every few seconds, a coordinate readout, target brackets that fly in and lock with a turning
marker and a leader line labelled at its elbow, and on a chapter change QUEST UPDATED and a glitch in
which two bands of the whole picture slip sideways for a moment. The window
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

| Look | Material | Pip's voice | While the window is open |
|---|---|---|---|
| Friendly | marimba, kalimba, music box, woodblocks, felt | warm, bouncy babble | a music-box lullaby over a soft kalimba |
| Glass | glass bells, wine-glass tones, water drops, air | breathy, with a shimmer | glass struck in a slow, open arpeggio |
| Basic | clean sines, soft clicks | polite chirps | a few clean notes, question and answer, over soft low notes |
| Retro Dark | chip beeps, the CRT's relay, static and degauss | text blips | the terminal's idle tune: a square lead, a triangle bass |
| Retro Light | key clacks, platen ratchet, carriage-return zip, margin bell, a small motor, celesta | struck notes with a key's tick | a celesta tune, a clockwork of a song |
| NieR | soft menu ticks, two-tone confirms, glitch grains, a soft pad, glockenspiel | a Pod's flat, stepped bleeps | a slow, wistful line on a soft bell, in A minor |

The music follows the chapters: each has a chord (I, IV, V, vi, then I an octave up), and a chapter
change adds a note of the motif until Ready resolves it. Each look's background is a composed tune of
eight bars in steady time, with phrases and short rests, that moves into the chapter's key by scale steps
(so it stays in key); the power arpeggio on the AI screen is a sixteen-step phrase in the same chord. Nothing holds a tone: a held drone, or two tones a hair apart, reads as a hum, and a
tone switched on and off fast reads as a speaker breaking up. `tools/sound_texture.mjs` measures both.

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
tools/sound_texture.mjs     renders them again and measures buzz, wobble and drones
```

Pip comes from `../../Icon-Concepts/Opus5.5icon/pm-logo.js` (its `kit` export), so the mascot here is
the same drawing as the logo. Fonts and Glass's wallpaper come from that folder too.
