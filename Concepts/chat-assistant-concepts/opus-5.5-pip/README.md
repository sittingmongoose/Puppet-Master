# Pip in the chat (Opus 5.5)

The 5.6 Pro chat's sheets, menus and work panels, redrawn with Pip. **Presentation only:** Pip adds no step, message or setting to the chat. The one exception is the Pip settings, which this concept is about.

Open `index.html` through the Concept Hub or any local server. It needs http, because it loads the 5.6 Pro chat in a frame and adds Pip to it. For a file that opens by double-click, see "Single file" below.

## Where Pip appears

| Place | What changes |
|---|---|
| **Teams on stage** | The cast plates in Crew, BrainStorm, Review and Chat Room show each seat as a Pip in its seat colour, wearing its role's prop. |
| **Helper marks** | The small marks in team rows, specialist rows, chat cards and the "In your chat" previews are the same Pips. |
| **Role props** | Coordinator: crown. Builder: hard hat. Checker and Reviewer: glasses. Moderator: gavel. Critic: jester cap. Wonderer: orbit ring. Teacher: page. Architect: set square. Product: pennant. Grill Me: peeks over a kettle grill. The chat's own role table picks the prop. "You" stays the person holding the strings. |
| **Sheet hosts** | Every sheet (Memory, Teach, BrainStorm, Crew, Review, Chat Room, Schedule, Scheduled, Explain simply, New chat defaults, and the rest) has a Pip by its close button. It hangs on its control bar and holds up the sheet's own sign on a third string. |
| **Status faces in lists** | Each Scheduled row and Memory note shows Pip's face, in the colour the chat already gives that status. Sent is happy, failed says oops, held wonders, waiting sleeps, unverified thinks. |
| **Activity rows** | Each subagent in Activity Detail has its own Pip. Working shows dots, blocked says oops, queued sleeps, done is happy, retrying thinks. |
| **Working orbit** | Pip sits in the Orbit's centre with its thinking dots. The current tool is a small badge beside it. |
| **Plans** | A plan ready for review has Pip holding up the page. A build waiting for its window has Pip asleep in a hard hat. |
| **Wand menu** | Pip holds the wand at the top of Assistant capabilities. |
| **Empty lists** | A sleeping Pip where there is nothing yet. |

Faces follow the chat's own states. Working shows dots, queued sleeps, needs you wonders, done is happy, failed says oops.

## The sheet's Pip

Its faces and moves come from the onboarding, rounds 6 to 10.

- **Watch:** rest the pointer on a control for 0.42 s.
- **Wonder:** while you type in a sheet's field.
- **Oops:** when you press a main button that can't be used yet.
- **Happy and a hop:** when you press a main button that works.
- **Face changes:** the old face closes on the eye line and the new one opens. Nothing fades.
- **Blinks:** now and then, never in step with another Pip.
- **Gaze:** the eyes follow the pointer and stay at its last position. Dots, sleep and happy faces don't follow.
- **Sway and drop-in:** Pip sways on its strings and drops in when a sheet opens.
- **Retro and NieR:** Retro moves in steps. NieR changes in one cut with a flicker.

Starting something keeps the chat busy for most of a second, and nothing repaints during that time. So on a main button, Pip turns happy and starts its hop first, and the press reaches the chat two frames (about 30 ms) later. When that press closes the sheet, Pip doesn't vanish with it: a copy cheers where it hung and is lifted out of view on its strings. These moves are Web Animations on Pip's HTML box, so they keep running while the chat is busy.

## Pip settings

Open them from **wand > Preferences > Pip…**, from **Demo Studio > Pip · Parts** (beside NieR Mode's Plug-in Chips), or from the concept's **Pip settings** button.

They follow NieR Mode's Plug-in Chips:

- **Parts:** 24 parts in five groups (Where Pip appears, Faces, Motion, Look, Sound). Each part has a one-line help and a size, and switches on or off.
- **Meter:** "On N / 24".
- **Presets:**
  - **Full:** everything but the voice.
  - **Quiet:** Pip only where work is, with no reactions.
  - **Still:** nothing moves.
  - **Classic:** the chat's own puppets.
- **Live preview:** a small team. **Play: the team works** runs it from queued to done.
- **Pip's voice:** the onboarding's sound kit, in the theme's voice. It starts off.
- **Saving:** choices are saved in the browser (`pip-chat:v1`).
- **Reduced motion:** Motion parts stay still while it is on. Your choices are kept for when it is off.

## How it reaches the chat (no chat file is edited)

`index.html` frames `../5.6 Pro/index.html`, then adds four files to the chat's document, in this order:

1. `pip-chat.css`
2. `../../Icon-Concepts/Opus5.5icon/pm-logo.js` (Pip's drawing kit)
3. `../../onboarding/opus-5.5-pip/sound.js` (Pip's voice)
4. `pip-chat.js`

**Why the hook sits at parse time.** The chat renders by building markup and reconciling it into the page. `pip-chat.js` decorates at the point where markup is parsed: the `innerHTML` setter runs `decorate()` on any fragment that names a puppet, a sheet head, an Activity row and so on. That way the markup the chat compares against already has Pip in it. The reconcile finds nothing to undo, and the 500 ms work tick never tears a Pip down.

**What that requires.** Everything drawn this way is a pure function of the markup and the theme: no ids and no randomness. That is what lets two renders compare equal. Marks are flat SVG, because the chat's sheet-exit copy strips ids.

**The live sheet Pip.** It sits in a `data-pm-keep` island, which the reconcile leaves alone. Its gradients have plain fallbacks, and its box rides in its markup. Both survive the chat's exit copy, which keeps only `pmx-*` classes.

**Hooks used:** `PM56_EXT.slot('dialog')` for the Pip settings sheet, and `PM56_EXT.action(...)` for its controls. `PM56_NIER_STUDIO` is wrapped to add the Demo Studio section. The "Pip…" row is placed in the wand's Preferences group when the wand is parsed.

**Turning parts off** re-renders the chat, so a part that is off shows exactly what the chat drew.

## The concept bar

The bar at the top of the page is for reviewing, not part of the chat:

- **Open…** opens any sheet or panel the way a person would (wand, group, row).
- **Theme** switches all ten looks, NieR included.
- **Pip settings** opens the Pip settings sheet.
- **Concept Hub:** its theme and reduced-motion state are passed through to the chat.

## Single file

    python3 tools/build_standalone.py OUTDIR

This writes `OUTDIR/pip-chat.html`, about 9 MB. It carries the chat in its frame (srcdoc) with Pip already inside, so it opens anywhere with no server and no network.
