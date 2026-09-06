# TestOpusPMConcpet — Onboarding + Guided Tour rebuild

**Model:** Claude Opus 5 · **Date:** 2026-09-04
**Deliverable:** `Concepts/TestOpusPMConcpet.html` (fork of `Concepts/TestPMConcept.html`)
**Source of truth:** `Concepts/TestOpusPMConcpet-src/` — the HTML is assembled, never hand-edited.

---

## What was replaced

The previous onboarding opened on a **theme picker** with a hollow wireframe illustration and a
fixed nine-dot progress wall. Both the onboarding and the guided tour were scrapped and rebuilt.

| Legacy block (in `TestPMConcept.html`) | Replaced by |
|---|---|
| `<style id="pm7-onboarding-css">` | `pmo-onboarding-css` (+ per-theme art palettes) |
| `<style id="pm7-guided-tour-css">` | `pmo-tour-css` |
| `<script id="pm7-guided-tour-js">` | `pmo-art-js` + `pmo-flow-js` |
| `<div id="pm7-onboarding">` markup | new setup-window markup |
| `<script id="pm7-onboarding-js">` | `pmo-onboarding-js` + `pmo-tour-js` |

~650 KB of legacy onboarding/tour was removed. `PM7_ONBOARDING_CINEMATIC.replay()` and
`PM7_GUIDED_TOUR.start()` are kept as thin compatibility shims so the shell's Home menu and
Settings entries drive the new system unchanged.

---

## The flow

A first-time local user sees **six screens**. Everything else is conditional.

```
Welcome → Where the work happens → What are we starting with
        → Your project (name + location + safety net on one screen)
        → Review → Create → What powers it → (Free models) → Done
```

Conditional branches, entered only when the choice requires them:

- **Another device** → pairing code → *"<name> is ready to meet your Puppet Master"* →
  **Create a new project** / Use existing work / Finish
- **Existing work** → folder · online host · another computer
- **Online** → host picker → **Sign in** *or* **Create an account**, just-in-time, GitHub-only scope
- **Another computer** → **SSH pre-selected and labelled Default**, network discovery,
  then one password → key made → key installed → connection tested
- **Restore** → backup picker
- **Start like another project** → only when a new project *and* eligible projects exist

### Specific requests from the brief

| Request | Where it landed |
|---|---|
| Sign in *or create an account* at the source step | `source-online`: both actions, plus "your project is still not created" |
| SSH default for NAS / network storage | `source-network`: SSH first, tagged **Default**, marked *Recommended* |
| Automate the SSH connection | One password → *"Making a secure key… Adding it to 192.168.1.42… Testing the connection"* → **"Secure key installed — no password needed from now on."** |
| "Create a new project" on the device-ready page | `device-ready`: first option, tagged **Recommended**, jumps straight into the project flow |
| Nothing created until the end | One `commit()`; every earlier screen writes only to a draft |

### Nothing is created before the commit

All choices live in a `pmo.onboarding.draft.v1` record. Preflight is read-only. The commit is the
only side effect: it is phase-by-phase, receipt-backed, and idempotent by key.

**Failure and recovery are demonstrated, not described.** A device last seen a while ago (`Attic Mini`)
can drop out between review and commit — reachable purely by UI choices. The failure names the
phase and the reason, states that nothing was left half-made, and offers *Try that step again* /
*Change something first*. Retry reuses the same idempotency key and succeeds. Verified:

```
attempt 1 → status failed · "Attic Mini stopped responding." · committed false
retry     → status succeeded · same idempotency key · committed true
```

---

## The art

Four **genuinely different illustration languages**, not palette swaps. A scene is a composition of
semantic primitives (`panel`, `disc`, `thread`, `figure`, `strata`, `mark`, `field`); each family
implements those primitives with its own geometry, stroke weight, fill logic and texture:

- **Friendly** — layered paper cut-outs, hand-wobbled paths, soft coloured shadow, warm gouache
- **Glass** — translucent panes, specular rims, bloom, depth through blur
- **Retro** — 8 px lattice, ordered-dither fills, hard 3 px outlines, scanline veil, star field
- **Basic** — monoline technical drawing, dashed construction geometry, registration ticks, plot grid

Seven scenes (`marionette · workbench · origin · vault · route · constellation · curtain`)
× 4 families × light/dark = **56 authored renderings**. Ambient placement is seeded per scene so no
two plates share the same weather. Every scene's group balance is asserted in the build check.

The look picker sits in the window chrome as one quiet row — it drives the canonical
`PM_THEME.setFamily/setMode`, so the whole shell re-themes and the plate re-draws in the new
language. It is never a step of its own.

---

## The tour

Fifteen steps across three chapters, run through the **real shell**:

| Chapter | Steps |
|---|---|
| Ask and understand | Chat opens via the real command · send the example prompt · apply ELI5 |
| Make it yours | Move Assistant Chat to another dock · open Add widget · pick Approval queue |
| **Plan before building** | Open Planning Wizard · choose the kind of work · Continue · PRD Builder · read the practice idea · answer the consequential question · see the consequence · review · approval boundary |

**Planning is 9 of 15 steps = 60%** of the tour.

Every step asks the user to act on a real control and completes on a real success predicate
(`chatSurface().visible`, `surface.host !== snapshot.chatHost`, `.pm6-wiz-stage-prd.active`, …) —
never a timer. **Show Me** wraps the same handler in choreography: pre-cue → travel → arrival →
settle, measured at 90 Hz:

```
0–200ms   pre-cue, spotlight pulses, nothing moves
~400ms    the destination outline appears  (arrival reacts first)
600–870ms the object travels along a visible path
~930ms    the real command fires
1000ms+   settle, long enough to read the change
```

The planning fixture renders into the **real Wizard panels** (`.pm6-wiz-prdchat-wrap` and
`.pm6-wiz-prdpreview`), always tagged **Guided example**, and is restored on exit.

### Guide placement

The card is placed by scoring eight candidate slots against the target *and* anything the step
declares must stay readable (`keepVisible`). On the planning steps that is the live plan — the very
thing the card is telling the user to watch. Before this, the card covered it in every theme.
Measured coverage of the plan panel is now **0% across all five planning steps at 1600, 1440 and
1280 px wide**.

### Verified claims

- **Zero provider requests, zero usage attributed.** No off-`file://` request during the whole tour.
  The usage-bridge delta over a full tour is *identical* to a 60-second idle control — the drift is
  the shell's own demo clock, not the tour.
- **Only the affected plan element moves.** Measured directly:
  ```
  answer → "A few organisers":  still | still | still | ANIMATE (the new row)
  switch → "Only me":           still | still | still   (new row removed)
  the three agreed outcomes kept identical geometry: true
  ```
- **A missing target gives a recovery route, not a stuck overlay.** The card says the control is not
  on screen and offers *Take me to it*, which re-walks the real Wizard chain and re-places the guide.
- **The workspace is snapshot-backed.** Chat host, visibility and the active page are captured at
  start and restored on exit.

---

## Motion

Design tokens: expo-out travel (`cubic-bezier(.16,1,.3,1)`), a small overshoot for arrivals,
`quick 170ms · base 280ms · travel 400ms · scene 640ms`, `38ms` stagger.

Three motion defects were found by frame-by-frame review and fixed:

1. **A CSS `transform` animation replaces an SVG `transform=""` attribute** — the marionette snapped
   to the origin. Fixed with an outer anchor group in all four families.
2. **Re-rendering on every commit phase replayed the entrance**, blanking the column for 400 ms.
   Same-screen updates are now quiet; only a genuine change of beat is choreographed.
3. **Scene and beat changes cut from nothing.** The outgoing plate and the outgoing content column
   now hand over on their own layers, so neither ever goes empty between two beats.

Settle for a full beat change is ~330 ms with a readable stagger.

---

## Themes and Reduced Motion

All eight themes are authored, including per-theme art palettes and an `--pmo-art-on-accent`
colour for marks that sit on an accent fill.

Glass themes define `--surface` as `rgba()`. A bare `var(--surface)` made the whole setup window
see-through and unreadable; every floating surface now composites over an opaque base
(`linear-gradient(var(--surface), var(--surface)), var(--background)`).

Under Reduced Motion the instruction sequence and cause/effect survive and travel does not:
content is fully opaque at 120 ms and arrives in the authored order.

At constrained widths (1100×760, 880×700, 620×900) the plate becomes a band above a stacked content
column. The window fits, the footer actions stay on screen, and every screen scrolls to its end. The
plate caption is dropped in that layout — in a short band it landed on top of the drawing.

---

## Production impacts for the later port

- **Commands to reuse:** `PM_THEME.setFamily/setMode`, `PM_PAGES.go`,
  `PM_HOME_WORKSPACE.setSurfaceVisible/moveSurface`, the Wizard's own stage controls.
  Onboarding coordinates; it does not own project, settings-transfer, source, provider or remote logic.
- **Shell facts worth writing down:** pages carry a `page-<name>` class, not `data-page`;
  the theme boot no longer reads `localStorage`; there are two `.pm6-chat-input` textareas, one 0×0;
  the selected state of a Wizard chip is the class token `sel`.
- **New concept-local contracts:** `pmo.onboarding.draft.v1`, `pmo.project_commit_receipt.v1`,
  `pmo.art.scene_system.v1`, `pmo.guided_tour.controller.v1`.
- **Slint portability:** every state machine is properties + models + timers; motion is expressed as
  duration/easing tokens and staggered indices. The one browser-specific affordance is the spotlight's
  large outer box-shadow, which becomes four dimming rectangles or a mask in Slint.
- **Hover tags:** `#pm-hover-tag-root` duplicates labels inside a modal and is suppressed while the
  setup window is open. Production should give that layer a real opt-out instead.

## Later polish pass

- **The carried object in Show Me** was a flat coloured rectangle with a text label. It is now a
  miniature of the panel itself — title bar, content lines, a lift on pick-up and a slight tilt
  through the travel that settles level on arrival. Re-filmed at 90 Hz: destination outline at
  ~610 ms, object in flight 720–890 ms, real command at ~940 ms.
- **The retro guide card** was checked after looking wrong in a thumbnail. At full size it is
  correct — it uses the shell's own retro tokens (`--surface-elevated: #1e2219`,
  `--accent-blue: #9db4d0`) and reads as a terminal card. No change made.
- **`route` and `origin` were recomposed** rather than left as noted weaknesses.
  `origin` was three choices of unequal visual weight, so it did not read as "pick one"; it is now
  three equally sized cards each holding one symbol at the same scale — a shoot with a leaf, a stack,
  a wound-back dial. `route` was three anonymous rounded boxes and a wire; its three nodes are now
  the objects the user already met — the stack from `origin`, the layered vessel from `vault`, the
  machine core from `workbench` — so the review screen is a visual recap of the journey it is
  summarising. The pulse walks the new geometry and was re-verified to land on the third node.
- **Two defects the rework exposed, both fixed.** The recomposition's edit span silently swallowed
  the `vault` scene, which then fell back to `marionette` on the project screen — the build now
  asserts the seven-scene roster and fails loudly on drift. And the shell's own
  *Replay Guided Tour* control was left dead when its handler went out with the legacy module; the
  tour now adopts it, along with the legacy tour markup, which the assembler strips.

## Known limitations

- The tour's Teacher answer is rendered into the chat thread when one is reachable and falls back to
  a labelled floating card otherwise; production should use the canonical chat message model.
- The practice plan is injected into the real Wizard panels and restored on exit. Production should
  render it through the Wizard's own model rather than replacing panel content.
- Provider Install / Sign In / Enter API Key are deterministic fixtures. They produce the correct
  states and never invent external success, but they do not run a vendor installer.
- Doctor was not touched: it remains a Settings function, per the packet.
- Motion was reviewed through frame-accurate contact sheets, which prove position over time. That
  is not the same as watching it play: timing and easing are verified, felt quality is not.
