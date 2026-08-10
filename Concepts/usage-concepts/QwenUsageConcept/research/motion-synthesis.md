# PM Motion Synthesis — principles for the Puppet Master motion token system

Research grounded in 14 sources (see `motion-source-ledger.json`): production design systems
(Material 3, Apple HIG, Fluent, IBM Carbon, Adobe Spectrum), inspectable libraries
(Motion/Framer, react-spring source, GSAP), HCI/perception research (NN/g latency limits,
Tversky et al. on animation & comprehension, Simons & Levin on change blindness), reduced-motion
specs (MDN, W3C WCAG 2.3.3), and the implementation authority — Slint 1.17.1 (docs + source).

The prototype motion already in `Concepts/usage-concepts/_shared/` was treated as the thing to
*rationalize*, not invent over: its tokens (`--motion-fast/med/slow`, `--mo-enter/exit/panel/modal/
spring`, `--ease-out/spring/smooth/snap`), its FLIP reorder, its JS tab-ink/magnet springs, its
sprout menu, and its selective reduced-motion handling are all reconciled below against primary
sources and Slint feasibility.

---

## P1. Motion has a job; if it isn't doing it, cut it
PM is a dense, glance-heavy instrument panel (Usage/telemetry). Every animation must earn its
frames by performing one of: **orientation** (where am I / where did that go), **hierarchy**
(what matters now), **causality** (my action caused this), **continuity** (this is the same
object), **state change** (a value/status changed), or **feedback** (the system heard me).

- "Add motion purposefully… Don't add motion for the sake of adding motion. Gratuitous or
  excessive animation can distract people and may make them feel… physically uncomfortable." — Apple HIG
- "Seamless… just enough to get the intention across and no more… never slow them down." — Adobe Spectrum
- "The best interface motion may go unnoticed." / "Is your motion unobtrusive?" — IBM Carbon
- Motion's benefit "usually comes from extra information or interactivity, not from motion itself";
  decorative motion does not aid comprehension. — Tversky et al. (2002)

**PM rule:** a motion token exists only for a functional purpose above. No idle decoration on a
page users stare at all day.

## P2. Duration is derived from distance, size, and interaction type — not picked first
All five design systems converge on a non-linear ladder where *small/frequent = fast* and
*large/spatial = slower*, and where duration scales with the distance/size of the change.

- Material 3 tiers: short 50–200 / medium 250–400 / long 450–600 / extra-long 700–1000 ms, with
  pairings like selection-control 200 ms, FAB→Sheet 400 ms, Card→full-screen 500 ms.
- Carbon tokens: fast 70/110, moderate 150/240, slow 400/700 ms; "the larger the change in
  distance or size, the longer the animation"; micro-interactions 90–120 ms ease-out on input.
- Spectrum: micro 130–220 ms (hovers, accordions, tooltips), macro 250–500 ms (panel/drawer reveals).
- Fluent: 83 / 167 / 250 / 333 ms by purpose.
- NN/g sets the human ceilings: ≤0.1 s feels instantaneous/direct; ≤1 s keeps flow; animations must
  be clock-timed and a UI can be "too fast" (display inertia).

**PM core scale (derived, not invented):**

| PM tier | ms | use | anchors |
|---|---|---|---|
| `instant` | 80–120 | hover, press, focus ring, color/border fades, 1:1 drag feedback | NN/g 0.1 s; Carbon fast-01/02 70/110 + 90–120 band; Spectrum 130; Fluent 83 |
| `quick` | 150 | small expansions, tooltip, popup **close**, grid snap settle | Material short3 150; Carbon moderate-01 150; prototype `--mo-exit` 150 |
| `standard` | 220–250 | widget enter, tab select, popup **open**, panel crossfade | Material short4/medium1 200/250; Carbon moderate-02 240; Spectrum 220/250; prototype `--mo-enter` 220 / `--motion-med` 240 |
| `settle` | 300–360 | spring settle, panel reveal, focus-exit | Material medium2 300; Spectrum 300; Fluent 333; prototype `--mo-modal` 300 / `--mo-spring` 360 |
| `expressive` | 400–500 | focus-enter, large reflow, chart-range morph | Material medium4/long2 400/500; Carbon slow-01 400; Spectrum 400/500; prototype `--motion-slow` 420 |
| `data` | 800–1000 | counter roll, meter fill | prototype `us-fill .8s` / `--mo-count` 1000; kept < NN/g 1 s flow limit |
| `ambient` | 700 | background dim / scrim | Carbon slow-02 700 |

## P3. Easing carries the meaning: decelerate in, accelerate out, symmetric to move
Linear looks mechanical; the curve tells you whether something is arriving, leaving, or relocating.

- Carbon: "strictly linear appears unnatural"; entrance = decelerate-to-stop, exit = accelerate
  (implying permanent departure); **exception** — an element that leaves but stays nearby (a side
  panel) uses *standard* easing so it feels recallable. "Do not use easing curves that suggest
  bounce, stretch, or sudden stops."
- Spectrum: ease-out `cubic-bezier(0,0,0.40,1)` for entering (most common), ease-in
  `cubic-bezier(0.50,0,1,1)` for exiting, ease-in-out `cubic-bezier(0.45,0,0.40,1)` for
  place-to-place (reserve for bigger movements).
- Material: emphasized.decelerate `(0.05,0.7,0.1,1)`, standard `(0.2,0,0,1)`, standard.accelerate `(0.3,0,1,1)`.
- Fluent: exits always pair with a fade; point-to-point uses `(0.55,0.55,0,1)`.

**PM easing set (all Slint-feasible as `cubic-bezier`):**
- `pm-ease-out` (enter/decelerate, the workhorse): `cubic-bezier(0.22, 1, 0.36, 1)` — the prototype's
  proven `--ease-out`; an easeOutExpo feel close to Material emphasized.decelerate and Spectrum ease-out.
- `pm-ease-in` (exit/accelerate): `cubic-bezier(0.4, 0, 1, 1)` — Spectrum/Material accelerate family.
- `pm-ease-in-out` (reflow / point-to-point): `cubic-bezier(0.45, 0, 0.4, 1)` — Spectrum ease-in-out.
- `pm-ease-spring` (restrained overshoot settle for pickup/popup): `cubic-bezier(0.34, 1.56, 0.64, 1)`
  — the prototype's `--ease-spring`; a *small* back-out overshoot. Use sparingly (P1/P6).
- `pm-ease-linear`: only for indeterminate loops (spinner, shimmer, live pulse).

## P4. Continuity beats remove-and-re-add (object identity)
Users lose track of things that vanish and reappear. Continuous transformation preserves identity.

- Simons & Levin (1997): large changes go unnoticed across a visual disruption; attention + a
  continuity cue are needed to bind before/after.
- Fluent "Connected" + Connected Animation; Carbon "Continuity via shared elements… should not
  distract"; Material connected/expressive transitions.
- Tversky: motion helps when it externalizes a spatial/temporal change.

**PM rule:** reorder, resize, add/remove, focus enter/exit, and tab switches animate the
*transformation* (FLIP / connected animation), never a blank-and-repaint. This is exactly the
prototype's FLIP path (`usage-widgets.js` capture→invert→play) and tab ink spring — keep them.

## P5. Drag is 1:1; only the settle is animated
During a pointer drag/resize the element must track the cursor with **zero** animation latency
(direct manipulation), and only the *release* gets a short, restrained settle to its grid slot.

- NN/g: ≤0.1 s for direct manipulation; the user must feel they are moving the object, not ordering
  the computer to move it.
- Motion/Framer: `drag` is direct; `dragTransition` (inertia) handles the *release* and can
  snap-to-grid (`modifyTarget`). GSAP Draggable + Inertia do the same.
- Carbon choreography: on the grid, use rounded-corner paths (stagger H/V), avoid criss-cross.

**PM rule:** `widget-pickup` = a fast lift (scale/shadow/opacity, ~120 ms); the drag body itself is
un-animated and pointer-locked; `widget-drop` / `free-resize` settle = short (~150–220 ms) decelerate
to the snapped slot, **no overshoot** (Carbon: avoid bounce on utilitarian moves). Neighbors reflow
with `widget-reflow` (~240 ms in-out), not a full re-entrance.

## P6. No gratuitous bounce / blur / noise / competing motion
Restraint is a feature on an instrument panel.

- Carbon: "Do not use easing curves that suggest bounce, stretch, or sudden stops"; avoid purely
  decorative easing.
- Apple: gratuitous/excessive motion can cause physical discomfort; avoid motion on frequent
  interactions; avoid sustained ~0.2 Hz oscillation and peripheral motion.
- Tversky: decorative motion can impede comprehension.
- NN/g: "display inertia" — too-rapid flashing stresses users.

**PM rule:** overshoot (`pm-ease-spring`) is reserved for *occasional expressive* moments (a fresh
widget pickup, a popup sprout) at low amplitude and short duration; loops (live pulse, shimmer,
spinner) are subtle, opacity-based, and the *only* perpetual motion; never run two attention-grabbing
animations in the same region at once. Stagger is ≤ ~20 ms/item and total < 500 ms (Carbon).

## P7. Interruptible, reversible, cancellable — in-flight state changes must not break
A user re-clicking a tab, re-grabbing a widget, or hitting Refresh mid-animation must get a clean
retarget, never a stuck or queued animation.

- Apple: "Let people cancel motion… don't make people wait for an animation to complete, especially
  repeated ones."
- Fluent "Responsive"; Motion/Framer springs *incorporate existing velocity* so a retarget is smooth.
- The prototype already retargets correctly: the tab-ink spring cancels its rAF and re-springs from
  the current position (`usage-tabs.js springTo`), and FLIP recomputes from live rects.

**PM rule:** every transition is a *state-driven* animation to a target (so a new target retargets
in flight), not a fire-and-forget keyframe queue. In Slint this maps to `animate` on a property whose
target is bound to state (retargets naturally); avoid `iteration-count` queues for anything the user
can re-trigger.

## P8. Popups sprout from their origin, place without collision, and exit fast
- Fluent "Consistent": surfaces sharing an entry point invoke/dismiss the same way (taskbar flyouts
  slide up / down). Carbon exit accelerates; Material Direct Exit always fades.
- The prototype sprout already does corner-origin scale+translate with collision-aware above/below
  placement and dynamic `transform-origin` (`usage-widgets.js place()` + sprout CSS).

**PM rule:** `popup-open` = fast opacity + a short corner-origin scale/translate from the anchor
corner (~220 ms, tiny overshoot); placement is collision-aware (flip above if no room, origin tracks
the anchor corner); `popup-close` = faster (~150 ms) accelerate + fade, then dismiss. In Slint the
pop is a `PopupWindow` whose root animates opacity+scale+translate with `*-origin` set to the anchor
corner; placement (x/y, above/below) is computed in Rust; exit-then-`close()` via a Timer.

## P9. Data motion shows the value, fast, without spectacle
Counters, meters, donuts, chart-range changes and new-row flashes communicate *state change* — the
number/level is the point, not the tween.

- Carbon: data tables/viz use *productive* (subtle) motion; sequence data viz *last*.
- NN/g: keep it under the 1 s flow limit; provide progress for longer waits.
- The prototype animates counters ~1000 ms (ease-out-cubic), meter fills `.8s`, and flashes new
  ledger rows — all legitimate *state-change* signals.

**PM rule:** `data-refresh` value tween ≤ ~800 ms with a smooth decelerate; meters/donuts animate
their fill, not the whole card; `chart-transition` morphs bar/line geometry ~400 ms with a single
unified curve (no per-series stagger wars); a new row gets one brief highlight, not a re-entrance.

## P10. Reduced motion preserves *state comprehension*, it doesn't just kill everything
Disabling all motion can hide state changes. The contract is: remove the *vestibular* channels
(position/scale/parallax/large movement) but keep the *information*, ideally via low-risk channels
(color/opacity) or an instant state change.

- W3C WCAG 2.3.3: disable non-essential interaction motion unless essential; color/opacity-only
  changes (no size/shape/position change) are lower risk.
- MDN: *replace* a scale animation with an opacity-only one (the worked `pulse`→`dissolve` swap).
- Apple: make motion optional; never the only way to convey information. Carbon: always provide a
  static alternative.
- The prototype already does this well: under reduced motion the meter fill jumps to its final width
  (`width: var(--wf) !important`), the tab ink *snaps* (`snap()`), the sprout drops its transform,
  and panel *display* still toggles — so state is never lost.

**PM rule (per token):** reduced variant = drop transform/scale/position; keep an instant or
opacity-only change so the user still sees *what changed*. Essential spatial meaning (e.g. "this
widget is now focused") is preserved via an instant layout change + optional brief opacity crossfade,
never by hiding the change. Slint hook: set `animate … { enabled: !reduced }` (instant jump) or
`duration: reduced ? 0ms : <token>` driven by a global that reads the OS reduce-motion setting.

## P11. Compositor-friendly properties; respect the renderer
Animate cheap properties; avoid forcing expensive repaints on a panel that may run on modest hardware.

- Carbon adaptive guidance: not every device can run all motion smoothly; provide alternatives.
- Apple: hold 30–60 fps.
- Slint reality (source-confirmed): cheap animatable properties are `opacity`, `translate`, `scale`,
  `rotation-angle`, `width/height/x/y`; there is **no** `backdrop-filter`/live blur and **no**
  CSS `box-shadow` on a Rectangle (only a separate `BoxShadow` primitive). `will-change` has no
  meaning; use `cache-rendering-hint` for raster caching of complex subtrees.

**PM rule:** prefer opacity + transform for feedback/entrance; animate layout geometry
(x/y/width/height) only where continuity demands it (reflow, focus, resize); keep shadows to a
single simple `BoxShadow` per elevated surface; never depend on live backdrop blur (see Slint map).

## P12. One vocabulary, themed by intensity not by chaos
The same semantic token everywhere; themes vary *intensity/duration* within bounds, never the
meaning of a motion.

- Carbon semantic consistency (same meaning → same motion) and intentional inconsistency (forward =
  affirm, reverse = cancel); Fluent "Consistent".
- The prototype already themes `--motion-med`/`--ease-default` per theme (e.g. friendly springier and
  slower, basic snappier) — keep this, but bind it to the semantic tokens below so meaning never drifts.

**PM rule:** the tokens in `motion-token-map.json` are the single source of truth; a theme may scale a
duration ±~30 % and swap the default ease (smooth vs snap vs gentle-spring) but cannot redefine what
`popup-open` or `widget-reflow` *means*.
