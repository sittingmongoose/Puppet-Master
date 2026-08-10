# Cozy Shelves - decisions record

Decisions taken 2026-07-26. These close the four open questions from `C2-REVIEW.md` §8.
Each entry records the decision, what it is anchored to in the existing product, the
consequences that follow, and any prerequisite that must land first.

Status: decided, not yet implemented.

---

## D1 - Type scale: keep the current sizes, add a settings option to enlarge

**Decision.** The default type scale stays as it is today (the 8-9.5px band). A setting
lets the user increase it.

**Why this is the right shape.** The small type is a large part of why the design reads
as calm, and changing the default would invalidate every fit measurement taken so far.
Making it adjustable serves legibility without paying that cost.

### Prerequisite: c2 has no type scale to adjust

This setting cannot be built against the current CSS. c2 hardcodes **ten distinct font
sizes across 41 rules**:

| size | rules | | size | rules |
|---|---|---|---|---|
| 9.5px | 13 | | 10.5px | 4 |
| 9px | 7 | | 11.5px | 3 |
| 10px | 5 | | 8.5px | 2 |
| 11px | 4 | | 8px, 7px, 15px | 1 each |

That is not a scale, it is ad hoc. A multiplier applied to it would produce fractional
pixel sizes and uneven jumps. **The sizes must first be consolidated into a token
ladder**, and every rule must consume a token instead of a literal.

Proposed ladder (5 steps, down from 10 sizes):

| token | default | used by |
|---|---|---|
| `--fs-micro` | 8px | segmented tab labels, `.sh-fam` family chips |
| `--fs-small` | 9px | pills, timestamps, log lines, `.sh-rmeta` |
| `--fs-meta` | 9.5px | `.sh-meta`, mono runs, key/value text, counts |
| `--fs-body` | 11.5px | `.sh-name` row identity |
| `--fs-head` | 10.5px | shelf labels, banner titles |

The 7px and 15px outliers are absorbed into `--fs-micro` and `--fs-head`.

### The setting

Modelled directly on the existing precedent `code.terminal.font-size`
("Terminal Text Size", type `number`, default 12, scope `["global","project"]`,
tier `simple`, src `FinalGUISpec_7.4.1`).

```
id:      general.visual.panel-text-size
label:   Panel Text Size
desc:    How big text appears in the side panels. Larger sizes fit less on screen.
type:    select
default: "default"
options: default (100%) | large (112%) | larger (125%)
scope:   ["global"]
tier:    simple
```

A **select, not a slider**, because arbitrary multipliers produce fractional pixel type
and because each step must be fit-tested. Three tested steps beat a continuum that is
broken at most of its values.

**Composition with the existing density setting.** `general.visual.interface-density`
already exists ("Interface Density": Auto / Comfortable / ..., plus a slider for internal
spacing). Text size and density are orthogonal and must both apply: density controls
padding and row height, text size controls the ladder. The new setting must not silently
duplicate or fight it.

**Consequence that must be scheduled.** Every fit measurement has to be re-run at all
three steps, not just the default. At 125% the ladder becomes 10 / 11.25 / 11.9 / 14.4 /
13.1px, which will move every truncation threshold in the review - including the Docker
tab-label figures below. A scale option that has only been tested at 100% is a promise
the layout cannot keep.

---

## D2 - Category colours: adopt PMConcept7's semantic assignment

**Decision.** Shelf accents stop being arbitrary per-panel hues and adopt PMConcept7's
semantic palette, where colour means *state*, not *which panel you are in*.

**The concrete collision this fixes.** c2 assigns categories by hand, e.g. the Compose
shelf is `--cat: var(--accent-lime)`. In `retro-dark`:

```
--accent-primary = var(--accent-lime)
```

so the Compose category colour is **pixel-identical to the theme's primary accent** -
the colour that means "selected / active / primary action". The category signal and the
selection signal become indistinguishable. `retro-light` maps `--accent-primary` to
`--accent-blue`, which collides with the four shelves currently using
`--cat: var(--accent-blue)`.

**What is adopted.** All 8 themes already define the full semantic set, so nothing new
is invented:

| token | meaning |
|---|---|
| `--graph-passed` | success, clean, healthy |
| `--graph-failed` | failure, error, conflict |
| `--graph-running` | in progress, live |
| `--graph-pending` | queued, idle, not configured |
| `--accent-warning` | warning, stale, degraded |
| `--accent-primary` | selection and primary action **only** |

**Rules that follow.**
1. `--accent-primary` is reserved for selection and primary action. No shelf may use it
   as a category colour in any theme.
2. A shelf's accent is derived from the worst state it contains, not from its topic. A
   Containers shelf with a failing container reads failed; otherwise running; otherwise
   passed.
3. `--accent-lime`, `--accent-magenta` and `--accent-orange` are dropped as *category*
   channels. They remain available for data visualisation, where hue-as-identity is
   legitimate.
4. Colour never carries meaning alone (FinalGUISpec §13.1 and the existing four-channel
   status rule): glyph shape, rail pattern, accessible label and the status word at
   >=360px continue to carry it independently.

**Known cost.** The 7% background tint currently used to signal category is below the
just-noticeable-difference threshold on all four light themes, per the theming reviewer.
Moving the signal off the tint and onto the rail plus head chip is part of this change,
not a separate one.

---

## D3 - Panel width envelope: 480px, per spec

**Decision.** Maximum panel width is **480px**, replacing `max-width: 50vw`
(`_shared/base.css:243`). Envelope is 220 min / 280 default / 480 max, matching
FinalGUISpec §12.2.

**Why it matters beyond tidiness.** `50vw` makes the maximum viewport-dependent, so
"max width" means 720px on a 1440px display and 960px on a 1920px one. No width
measurement is reproducible across machines, and the `wide` tier boundary moves with the
window. This is why one of my own measurement passes disagreed with another.

**Consequence for the Docker tabs.** Measured, fonts asserted loaded, six tabs need:

| theme | width for intact labels |
|---|---|
| friendly | 370px |
| basic / glass | 390px |
| retro | 430px |

All three now fit inside a 480px envelope - but the default is 280px, so **the
count-aware threshold fix is still required**. Setting the max to 480 does not rescue the
default width; it only guarantees there is a width at which the labels are honest.

---

## D4 - Expanded row body is the universal host. No sheet primitive. (my call)

**Decision.** The expanded row body is the one place detail and input live. A sheet or
modal primitive is **not** added, with a single narrow exception for confirmations.

### Why

**The primitive already exists and works.** 31 item-level expanders are live and
verified: Docker 9 containers (`.sh-ctr`), Tests 7 and Agents 9 runs (`.sh-run`),
Source 6 worktrees (`.sh-wt`). Promoting one working primitive to the remaining three
panels is a far smaller and safer job than introducing a second, competing one.

**A sheet in a 240-480px panel is a second screen.** It would cover the panel almost
entirely, creating a second focus context and a second authority over what the panel is
showing. The project already rejected a second tab authority for the same reason.

**Inline expansion keeps the antecedent visible.** When configuring a container you can
still see which container. A sheet takes that away exactly when it is most needed.

**It ports.** In Slint an expander is a `VerticalBox` with a bound `visible`/height
property and a property-level animation. That is a first-class construct. A modal needs
`PopupWindow` plus focus management, which is more machinery for less benefit.

### The rules

1. **Detail, secondary actions and short forms (up to ~3 fields) go in the expanded
   body.** This is where Compose service actions, Actions `workflow_dispatch` inputs and
   Search indexing controls live.
2. **The panel never becomes a text editor.** Anything needing real text editing - a
   compose YAML, a Dockerfile, a config - opens in the main editor pane. This is the
   answer to "where is the YAML": the panel shows compose *state* and hands editing to
   the editor, which is the surface built for it. It also removes the largest argument
   for a sheet.
3. **Confirmations are the one modal.** A destructive-action gate must block by
   definition, and inline confirmation inside a row that is about to disappear is
   incoherent. Use the existing `PMK.confirm` component
   (`Concepts/panel-bakeoff/_pm-components.js:498`), which is already built, wired and
   tested. This covers the 6 Discards, 4 worktree Removes and 2 stash Drops in Source
   Control alone.
4. **One expander implementation, six fixed payload slots.** Not per-panel variants.
   Slots: identity/summary, key-value facts, status detail, actions row, blocked reason,
   overflow. A panel uses the slots it needs and omits the rest.
5. **Collapsed content is out of the tab order** and the header is a real `<button>`.
   This is not optional: all 31 current expanders are `<div>` with zero `tabindex`, so
   none is keyboard-operable today. The disclosure work and the keyboard work are the
   same task and must not be split.

### What this decides downstream

- Compose gets: a compose-file source header, per-service expansion with up/down/restart/
  logs, and "Open compose.yml" handing off to the editor. No in-panel YAML editing.
- Registries and Images convert from `.sh-kvwrap` to `.sh-row` plus expansion, which also
  removes the 234px overlap bug at the default width.
- Search hits, Actions runs and Artifacts cards gain expansion - the three panels that
  have none today.

---

## Open items not covered by these four decisions

1. **File manager baseline.** `Concepts/rail-concepts/c2-cozy-shelves-files.html` was
   written after the review began. It nests DOM at about 21px per depth level. Whether
   that survives 220px, and whether it can be virtualized as a `ListView`, is being
   assessed by the file-manager deep dive.
2. **Search Replace** - second segmented tab, or in-place disclosure inside the query
   block? D4 leans toward disclosure, but this needs the Search spec review to land.
3. **The corner-scale sprout animation** (ACD-439) needs a Slint 1.17.1 spike to confirm
   `scale` and `transform-origin` are available. Every menu in the app inherits the
   answer.
