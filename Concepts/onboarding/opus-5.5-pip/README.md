# Onboarding with Pip (Opus 5.5 concept)

A reimagining of PMConcept7's onboarding window with Pip as the mascot. The scene beside every screen
is Pip's stage: one character, a set of props, and a world that changes with the look. The words are
PMConcept7's onboarding copy; Pip's lines are new. Open `index.html` (double-click works).

## The idea

The control is you. Pip hangs from it, and every choice you make lowers something onto the stage.

- **Pip is the guide.** It reacts to what you do: thinks while you hover, cheers or winks when you
  choose, looks at what you pick, sleeps until you arrive, and powers up when AI is connected.
- **Hover previews, choosing commits.** Pointing at a choice lowers a ghost of its prop on a dashed
  string; clicking it drops the real prop in, which swings and settles, and Pip celebrates.
- **It is physics, not keyframes.** Pip is a pendulum on the hand: when the hand moves, Pip swings
  and settles, and both strings are solved every frame from the screw eyes on the bar to the eyes on
  its head (the same solver as the logo). Every prop hangs on its own string and swings too.
- **Each world moves the way its theme moves.** Friendly is bouncy, Glass glides with low damping,
  Basic is critically damped and calm, Retro is snappy at 8 frames a second, NieR holds still.

## The screens

| Screen | On Pip's stage |
|---|---|
| Welcome | Pip asleep on slack strings; it wakes when you move or press a key, and says hello |
| Pick a look | Hovering a look makes Pip try it on (it flips into that look's Pip); the world follows once picked |
| The computer | A laptop, a laptop and a phone, or a server, lowered in on strings |
| Project begins | A blank page, a folder, or a restore box |
| Name | A sign that spells your Project's name as you type; Pip worries if it gets too long |
| Keep it safe | A vault; an online copy and a backup box join it when chosen |
| Away from home | A house, or a house and a globe |
| Review | A clipboard ticked off one line at a time as the review rows appear |
| Creating | Each phase is a block lowered onto a stack; the strings drop away once a block lands; Pip rocks the control while it works |
| AI | One orb per provider; each lights as it connects, and Pip's strings carry power |
| Ready | Your choices return as charms, and the crew (Pips in a crown, a hard hat and glasses) takes a curtain call |

## The five worlds

| World | Stage | Celebration | Chapter change |
|---|---|---|---|
| Friendly | felt diorama: stitched hills, pastel crumbs, a glow in the chapter's colour | stars, hearts and a wink | Pip hops |
| Glass | PMConcept7's Ribbons wallpaper, moving light, a glass floor with Pip's reflection | glints and rising bubbles | a light sweep |
| Basic | dot grid, a ruled floor, one accent | a ring and a check | a small hop |
| Retro | true pixel art (the scene is drawn small and snapped to Retro's palette), skyline, bricks, a score that counts up | pixel burst and +100 | a stage-clear flash |
| NieR | parchment, graph paper, contours; YoRHa Pip; static scenes | target brackets lock on, `// CONFIRMED` | a slice glitch and a decoding label |

The window follows the world: Friendly and Glass take the chapter's colour (lavender, sky, mint,
butter, coral), Retro is square with hard shadows and a cursor after the title, NieR is ink on
parchment with bracketed labels and key hints. The chapter rail is a string of beads with a small Pip
riding to the current chapter.

## Sizes and motion

- Desktop and laptop: the stage is a tall pane beside the screen. Narrow windows: a strip above the
  screen. Squeezed windows: a short strip with Pip beside its bubble.
- Reduced motion (the OS setting, the Concept Hub's switch, or the toolbar): nothing swings or
  travels; props appear in place and Pip changes expression only.

## Files

```
index.html     the page: concept controls, a quiet PMConcept7 shell, the onboarding window
wizard.js      screens, flow, and the director that turns each screen's state into a scene
stage.js       Pip's stage: the rig and physics, props, effects, the speech bubble, Retro's pixel pass, NieR's HUD
worlds.js      the five worlds' backdrops and palettes, the material "pen", and the prop library
stage.css      the stage's layers, bubble and HUDs
styles.css     the window in each look
tools/build_standalone.py   writes one self-contained HTML file for sharing
```

Pip comes from `../../Icon-Concepts/Opus5.5icon/pm-logo.js` (its `kit` export), so the mascot here is
the same drawing as the logo. Fonts and Glass's wallpaper come from that folder too.
