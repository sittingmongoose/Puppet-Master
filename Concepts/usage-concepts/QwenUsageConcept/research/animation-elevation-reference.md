# Animation Elevation Reference — PMConcept7 audit + expert technique catalog (final)

Purpose: FINAL reference for the completed animation-elevation pass that EXCEEDS
`Concepts/PMConcept7.html`. Sections A–D are the planning audit and technique catalog,
retained as lineage; section E records what was ACTUALLY implemented and how it verified.
Line numbers in A refer to `Concepts/PMConcept7.html` (44,226 lines, rev 5 + PM8 backports).
Sibling research: `motion-synthesis.md` (P1–P12), `motion-token-map.json` (11 semantic tokens),
`motion-to-slint-map.md` (Slint 1.17.1 feasibility), `motion-source-ledger.json` (14 primary
sources).

---

## A. PMConcept7 animation audit

### A1. What it DOES (inventory, with evidence)

**Token substrate (real but thin).** `--motion-fast:120ms / --motion-med:240ms / --motion-slow:420ms`
(L179), themes retune `--motion-med` 140–320ms (L326–828). Easing pair at L180:
`--ease-out:cubic-bezier(.22,1,.36,1)`, `--ease-spring:cubic-bezier(.34,1.56,.64,1)`;
friendly/glass swap `--ease-default` to spring (L615/674). 286 `transition:` declarations,
66 `@keyframes`, 38 `requestAnimationFrame` sites, 25 delay rules.

**Genuinely good motion — almost all of it PM8 backport, not native PM7:**
- Page-tab ink: JS velocity spring, stiffness 500 / damping 35, slides+resizes a shared pill (L9505–9560).
- Directional page transitions: enter 300ms `cubic-bezier(0.25,1,0.5,1)` ±50px over a 150ms exit (L9578–9599).
- Corner-sprout popouts: non-uniform `scale3d(0.72,0.48,1)` from the trigger corner, overshoot
  `cubic-bezier(0.22,1.55,0.36,1)` 300ms, springy height `(0.22,1.72,0.36,1)` 340ms, size-bounce
  keyframes on option-count change (L13193–13312) — matched to a reference video.
- FAB menu: 45ms/item stagger, spring easing (L13184–13192).
- `pm-pop` scale .92→1.06→1 overshoot (L8450), `pm-celebrate` + expanding ring (L8464–8498).
- PM8 hover system: pointer magnet (spring 170/22) + spotlight ring + bloom proxy (L8256–8339).
- Ambient: glass float shapes `pm-float` + pointer parallax (L763, T16 note), `badgePulse` live dot (L2968).
- Data: counters 1100ms ease-out-cubic rAF (L19666), fills `.8s` ease-smooth with 50ms setTimeout
  stagger (L19680), donuts `stroke-dashoffset` 1.1s, i*120ms (L19685), chart segments i*18ms (L19692).
- Stagger helper `.pm-stagger > * { animation-delay: calc(min(var(--i),8) * 50ms) }` (L8499).

### A2. Why it's WEAK (specific, evidenced)

1. **Data refresh replays entrances instead of morphing.** Every render rebuilds `innerHTML`
   (donuts L19441, cache L19478, chart L19420) then re-runs entrance choreography via rAF.
   Counters always tween **from zero** (`target * ease`, L19674) — the spend number blanks to
   $0.00 and re-counts on every window change/tick. No value→value tween, no cancellation
   (overlapping rAF loops race on the same node), fixed 1100ms regardless of delta. This violates
   the project's own P4 (continuity) and P9 (data motion shows the value).
2. **Widget reorder has zero motion.** HTML5 DnD with the native browser drag ghost,
   bare `insertBefore` on drop (L32970) — neighbors teleport. The "picked-up" card is *dimmed*
   (`opacity:.45; scale(.98)`, L9689) rather than lifted. No FLIP anywhere in the main app
   (rect reads exist only for resizers/minimap/gear/chips).
3. **The dominant transition vocabulary is generic filler.** `transition: all 0.2s ease` (×9),
   `background 0.15s` (×4), `color 0.2s ease` (×4), `transition: none` (×24). ~118 plain
   `ease`-family tokens vs only ~35 explicit cubic-beziers; large regions (ledger rows, tables,
   settings) animate nothing or only background-color.
4. **Entrances are one monotonous micro-fade recipe.** `fadeIn` (opacity only, L5335), `slideUp`
   10px (L5336), `acFadeIn` 6px (L2958), `pm-enter-up` 12px (L8442), `crewDebateSlide` 6px (L6954),
   `editorLineReveal` 4px (L4631), `pm-page-in` 180ms/8px (L8460), `modalFadeIn` scale(.96) (L6955).
   Same opacity+micro-translate at uniform `--motion-med`; chat messages all identical (L12824).
   No anticipation, no follow-through, no radius/blur/scale interplay, no shared choreography.
5. **Page EXIT is 150ms LINEAR** (`pm8-page-out`, L9593) — Carbon: "strictly linear appears
   unnatural"; exits should accelerate.
6. **Springs are fake and fire-and-forget.** All "spring" feel is fixed overshoot beziers
   (`0.34,1.56,0.64,1` ×18, `0.22,1.55,0.36,1` ×16) inside transitions/keyframes: no velocity
   preservation, no in-flight retarget, amplitude identical everywhere. The only real JS springs
   (tab ink, magnet) are PM8 backports, and the magnet is per-mousemove style writes — flagged as
   an HTML artifact to NOT port (PMConcept7-NOTES.md).
7. **Press feedback is a dead scale.** `.pm-press:active { scale(.97) }` (L8487) with a plain
   transition back — no squash-and-stretch, no springy release overshoot. Hover lift is 2px at
   70ms (`.pm-sheen`, L8241–8251): depth without personality.
8. **Stagger is capped and uncoordinated.** `min(var(--i),8)*50ms` — items 9+ move as a wall
   (L8499); dashboard/chart/ledger entrances otherwise unsequenced; no row/column/distance-based
   waves; nothing ties entrance choreography to where the eye should go.
9. **No ambient life outside glass.** Basic/retro/friendly/dashboard backgrounds are static;
   the only perpetual motion elsewhere is flat opacity pulsing (`badgePulse` L2968,
   `saStatusPulse` L6951, `pm6-proj-pulse` L10086) — no layered drift, no scanlines/scene,
   no living data texture.
10. **No scroll reveals, no count-up personality, no chart follow-through.** Ledger/table rows
    appear fully-formed; counters land dead at the final value (no settle tick, no odometer feel);
    series muting is an instant `opacity:.12` write (L19429); range switches redraw rather than morph.

**Root cause, one line:** PMConcept7 animates *appearances* (uniform micro-fades, entrance replays,
fixed overshoot) but not *objects* — nothing has mass, velocity, or consequence; state changes are
repaints, not transformations.

---

## B. Existing motion research (summary)

`motion-synthesis.md` distills 14 sources (Material 3, Apple HIG, Fluent, Carbon, Spectrum,
Motion/Framer, react-spring, GSAP, NN/g, Tversky, Simons & Levin, MDN/W3C, Slint 1.17.1) into
12 principles: **P1** every motion must perform orientation/hierarchy/causality/continuity/
state-change/feedback; **P2** duration derives from distance/size/type; **P3** easing carries
meaning (decelerate in, accelerate out, symmetric to move); **P4** continuity beats
remove-and-re-add (FLIP/connected animation); **P5** drag is 1:1, only the settle animates;
**P6** no gratuitous bounce (overshoot reserved, stagger ≤20ms/item, total <500ms);
**P7** interruptible/retargetable state-driven animation; **P8** popups sprout from origin,
collision-aware, exit fast; **P9** data motion shows the value fast (<1s); **P10** reduced motion
preserves state comprehension; **P11** compositor-friendly (opacity/transform; Slint: no
backdrop-blur, no CSS box-shadow, one BoxShadow per surface); **P12** one vocabulary, themes vary
intensity ±30%, never meaning.

**Duration ladder:** instant 80–120 · quick 150 · standard 220–250 · settle 300–360 ·
expressive 400–500 · data 800–1000 · ambient 700 (ms).
**Easing set:** out `(0.22,1,0.36,1)` · in `(0.4,0,1,1)` · in-out `(0.45,0,0.4,1)` ·
spring `(0.34,1.56,0.64,1)` · smooth `(0.4,0,0.2,1)` · linear (loops only).
**Tokens:** popup-open 220 (tiny overshoot) / popup-close 150 / tab-select 250 / widget-pickup
120 / widget-drop 220 (NO overshoot) / widget-reflow 240 in-out / free-resize 150 / focus-enter
400 / focus-exit 300 / data-refresh 800 / chart-transition 400 / hover 120.
**Slint ground truth:** no native spring, no @keyframes, no backdrop-filter; overshoot via
`cubic-bezier` (y>1 supported) or Rust `Timer`/`animation-tick()` springs; FLIP via Rust-owned
x/y/w/h geometry; reduced-motion via a global bool gating `animate { enabled/duration }`.

The research RATIONALIZED the usage-concepts prototype; the elevation pass must now go past both
it and PM7 — real physics, layered secondary motion, and data personality, still inside P1/P6/P10.

---

## C. Expert technique catalog (concrete approaches + dashboard application)

### C1. Spring physics (the foundation)
- **Approach:** integrate `a = (-k·x - c·v)` (semi-implicit Euler) per tick:
  `v += (-stiffness*x - damping*v)*dt; x += v*dt;` stop when `|x|<0.001 && |v|<0.001`.
  Presets (react-spring): stiff {170,26}, wobbly {180,12}, gentle {120,14}.
  **CSS fake:** `cubic-bezier(0.34, 1.56, 0.64, 1)` ≈ ~15% overshoot settle;
  `(0.22, 1.6, 0.36, 1)` softer; higher second control point = more bounce.
- **Dashboard:** tab ink, popup sprout, widget drop-settle, panel reveals. In Slint:
  bezier-approx for one-shots; a Rust Timer spring for anything retargetable (ink, magnet).
- **PM7 gap:** only fixed beziers; no velocity-aware spring outside backported ink.

### C2. Overshoot / settle
- **Approach:** enter past the target then return (scale 0.92→1.04→1, or y lands 4px low then
  rises). Two-phase: fast approach (70% of duration to ~105%), slow settle (30%). Never on
  utilitarian grid moves (Carbon) — reserve for arrivals: popups, focus enter, new widget.
- **Dashboard:** widget first-appearance lands with 2–3% overshoot; donut needle passes the value
  then settles; toast arrival.
- **PM7 gap:** overshoot exists but is one identical bezier everywhere, including places it
  shouldn't be, and absent where it should (drop, focus).

### C3. Anticipation
- **Approach:** a tiny preparatory move OPPOSITE the main action, 60–100ms: before a card lifts,
  `scale(0.98)`/dip 1px; before a panel slides right, nudge 2–3px left; before a FAB menu opens,
  the FAB compresses. Implement as a keyframe pre-stop (`0% → 20% inverse → 100% target`) or a
  two-stage state flip.
- **Dashboard:** widget pickup (dip→lift), widget throw, chart range-morph wind-up, button launch.
- **PM7 gap:** zero — every action starts from rest toward the target (mechanical).

### C4. Follow-through & secondary motion
- **Approach:** when a parent stops, children keep moving with offset springs: give inner content
  its own spring with LOWER stiffness / HIGHER lag (e.g. shell settles in 240ms; inner list settles
  in 340ms with +40ms delay and small extra travel). CSS: nested elements with different
  `transition-duration/delay`; JS: chain a second spring on parent settle.
- **Dashboard:** page arrival — chrome lands, widget content drifts up 4px behind it; popup sprout —
  list rows trail the container; meter label rides the fill's tail; header after panel snap.
- **PM7 gap:** entrances are single rigid-body fades; nothing trails anything.

### C5. Stagger (list/grid entrances)
- **Approach:** `transition-delay: calc(var(--i) * 24ms)` (Carbon ≤20–30ms/item, total <500ms);
  for grids use a distance wave: `delay = (row*40 + col*24)ms` from the origin corner/pointer, so
  the reveal propagates spatially; cap total, and skip stagger on re-render (entrance only, P4).
- **Dashboard:** widget grid cascade from top-left (or from the added widget, radiating); ledger
  rows ripple; settings shelves; chart bar cascade on first reveal ONLY.
- **PM7 gap:** one flat 50ms helper capped at index 8 (L8499); no spatial waves anywhere.

### C6. Squash & stretch (press physics)
- **Approach:** pressed = `scale(0.97, 0.94)` 70ms ease-out (squash); release = spring back with
  overshoot `scale(1.02,1.04)` then 1 via `(0.34,1.56,0.64,1)` 220ms (stretch) — volume roughly
  conserved (x down ⇒ y down less / up). Keep transform-origin at the press point for buttons.
- **Dashboard:** every button/icon-button, widget drag handle grab, tab press, FAB.
- **PM7 gap:** `.pm-press` is a dead `scale(.97)` with no stretch back (L8455/8487).

### C7. Scroll reveals
- **Approach:** IntersectionObserver (or Slint ScrollView `viewport-y` vs item y) → items below the
  fold enter once with `opacity 0→1 + translateY(14px)→0`, 260ms pm-ease-out, small stagger;
  one-shot flag so scrolling back never replays; skip entirely for content already visible.
- **Dashboard:** ledger/table rows below fold, settings long lists, chat history on scroll-up load,
  catalog items.
- **PM7 gap:** none — offscreen content pops in fully-formed when it enters view.

### C8. Count-up number personality
- **Approach:** tween VALUE→VALUE (never from zero) over 600–900ms ease-out-expo; rAF or
  Slint float-property + format binding; add (a) a brief 8% scale "tick" pulse on landing,
  (b) tabular-nums so digits don't jitter, (c) color flash only on significant delta (>5%),
  (d) duration proportional to `log10(delta)` clamped 400–900ms; (e) cancellable retarget from
  the CURRENT displayed value.
- **Dashboard:** spend counter, token/call counters, quota %, cooldown countdowns.
- **PM7 gap:** fixed 1100ms, always from 0, uncancellable, retriggered by innerHTML rebuilds
  (L19666–19678) — the single most visible animation defect.

### C9. Chart bar follow-through
- **Approach:** on range/data change, interpolate each bar's height from its OLD value (not 0) with
  a unified 400ms smooth curve; give bars a 30ms-per-index micro-trail ONLY on first reveal; on
  settle, let value labels and gridlines follow 80ms behind (secondary motion); bars can overshoot
  2% then settle when a threshold line is crossed. Series toggle cross-fades geometry (200ms), never
  instant opacity.
- **Dashboard:** usage colstack range switches (5h/24h/7d), tool mix bars, qbar fills.
- **PM7 gap:** redraw+replay via setTimeout i*18ms; mute = instant `.12` write (L19429).

### C10. Hover depth (translateY + shadow + content response)
- **Approach:** three-layer hover, 120ms ease-out in / 200ms ease-out out (asymmetric — fast
  response, slow release): `translateY(-3px)`, shadow blur+offset grow (Slint: animate one
  BoxShadow's blur/offset-y/alpha), border/ring accent tint, plus ONE content micro-response
  (icon scale 1.06 with spring, chevron nudge, value emphasis). Press collapses to translateY(-1px)
  + shadow shrink (C6 squash) for a full lift/press cycle.
- **Dashboard:** widget cards, catalog items, ledger row action reveal, rail items, tab hover.
- **PM7 gap:** sheen = 2px lift + shadow at flat 70ms both ways; no content response beyond icon;
  no asymmetric in/out.

### C11. Ambient / living background
- **Approach:** 1–3 SLOW (20–60s), transform-only, low-amplitude layers — drifting radial tints,
  a barely-there grain/scene sweep, live-status "breathing" glow tied to real state (pulse rate
  maps to activity). All opacity/translate (compositor), all halt under reduced motion, all dim
  behind focused content. No more than one attention channel active at a time (P6).
- **Dashboard:** live-feed glow intensity = event rate; theme-specific ambience (retro: scanline
  sweep; friendly: warm drift; basic: subtle value breathing on live dots) instead of glass-only life.
- **PM7 gap:** only glass floats/parallax; other themes are dead; pulses are flat opacity loops
  unrelated to data.

### C12. Tab ink spring (shared-element continuity)
- **Approach:** one indicator element whose x/width are velocity-spring targets (stiffness ~500,
  damping ~35); retarget in-flight from current position+velocity so rapid tab-mashing produces a
  continuous glide; stretch the pill mid-flight (width leads, x lags → rubber-band feel); panel
  content crossfades directionally (in 200ms over out 120ms, ±12px).
- **Dashboard:** page tabs, dashboard sub-tabs, usage window pills (5h/24h/7d selector!), settings
  category rail, bottom-panel tabs.
- **PM7 gap:** only the backported page-tab ink; every other tab strip is an instant
  background swap.

### C13. Popup corner-sprout with overshoot
- **Approach:** `transform-origin` at the anchor corner; from `scale(0.7,0.5) translate(nudge)`
  with NON-UNIFORM axes (grow tall faster than wide = "fill out"), 300ms overshoot bezier
  `(0.22,1.55,0.36,1)`; opacity lands early (140ms) so shape reads; close = 150–220ms accelerate
  collapse into the SAME corner, near-opaque until the end. Placement collision-aware (flip
  above/below; origin tracks the anchor). Height changes get their own stronger spring so list
  resizing bounces.
- **Dashboard:** every menu/popout/tooltip/context panel — PM7's sprout (L13193+) is the file's
  best motion and the floor to exceed (add: content rows trail the container — C4).
- **PM7 gap:** exists for chat popouts only; most header menus/modals are flat fades
  (`modalFadeIn` scale .96, L6955).

### C14. FLIP reorder / connected geometry
- **Approach:** capture rects → invert with transform (no transition) → play 240ms in-out
  `(0.45,0,0.4,1)`; neighbors MOVE, never blink; the dragged item lifts (scale 1.02 + shadow,
  120ms) then settles to slot 220ms decelerate with NO overshoot; drop target gaps open with the
  same reflow curve. In Slint: Rust-owned grid geometry, animate x/y/w/h (slint-map row 9).
- **Dashboard:** widget reorder/add/remove/resize reflow — the flagship interaction of a
  widget dashboard.
- **PM7 gap:** none (bare insertBefore + native ghost, L32962–32973). Highest-impact single fix.

### C15. Interruptibility & velocity handoff
- **Approach:** every animation is state→target, retargetable mid-flight; springs carry velocity
  across retargets; CSS fallback: transitions on state-bound properties (never keyframe queues for
  retriggerable things); cancel-and-continue, never queue.
- **Dashboard:** rapid tab switching, mid-drag retarget, refresh during morph, popup re-open.
- **PM7 gap:** counter loops race; keyframe entrances restart on class churn (the L9600–9607
  "fadeIn kill-switch" saga is the scar tissue of exactly this).

### C16. Exit choreography (asymmetric out)
- **Approach:** exits 1.5–2× faster than entrances, accelerating (`(0.4,0,1,1)`), usually with a
  fade; "leaving but recallable" panels use standard easing (Carbon exception); exit toward origin
  (shrink to anchor, slide to parent). Never linear.
- **Dashboard:** popups collapse to anchor, panels retract to rail, toasts, page exit (fix the
  LINEAR 150ms, L9593).
- **PM7 gap:** exits are linear, symmetric, or absent.

### C17. Threshold/threshold-crossing reactions
- **Approach:** when a value crosses warn/hot thresholds, the state change gets a one-shot
  signature: fill color morphs (not swaps), a single halo pulse radiates (`box-shadow 0→6px→0`,
  600ms), the label does C8's tick. Calm when calm; loud once, then quiet.
- **Dashboard:** quota bars crossing 80/95%, budget donut tones, alert chips, rate-limit cooldown
  completion (a satisfying "unlock" spring).
- **PM7 gap:** tone classes swap instantly on re-render; pulses loop regardless of state.

---

## D. Elevation pass — priority gap table (PM7 → target)

| # | Surface | PM7 today | Target | Primary techniques |
|---|---|---|---|---|
| 1 | Widget reorder/add/remove | teleport + native ghost | lift → 1:1 drag → settle + neighbor reflow | C14, C3, C6 |
| 2 | Counters | from-zero 1100ms, racy | value→value 400–900ms + landing tick, retargetable | C8, C15 |
| 3 | Chart/fill updates | innerHTML replay | geometry morph from old values + label follow-through | C9, C4 |
| 4 | Entrances everywhere | uniform micro-fades | spatial stagger waves + content trailing chrome | C5, C4 |
| 5 | Press/hover | dead scale / 2px lift | squash-stretch cycle; 3-layer asymmetric hover depth | C6, C10 |
| 6 | Tabs/segmented controls | instant swap (except page tabs) | velocity-spring ink with stretch, all tab strips | C12 |
| 7 | Popups/menus | flat fade for most | universal corner-sprout + trailing content | C13, C4 |
| 8 | Exits | linear/symmetric | fast accelerating, toward origin | C16 |
| 9 | Thresholds/state changes | instant class swap | one-shot halo + tick + color morph | C17, C8 |
| 10 | Ambient life | glass-only floats | per-theme state-driven ambience, data-linked glow | C11 |
| 11 | Scroll content | pops in formed | one-shot scroll reveals | C7 |
| 12 | Retargeting | keyframe restarts/races | state-driven, velocity-carrying | C15 |

**Character target:** PM7 feels like *fades applied to repaints*. The elevation pass should make
PM feel like *an instrument panel of physical objects*: everything has mass (springs), nothing
teleports (FLIP/morph), actions have wind-up and consequence (anticipation/follow-through), data
has temperament (count-up personality, threshold signatures), and the whole thing breathes just
enough to feel live — inside P1 (every motion earns its frames) and P10 (state survives
reduced-motion).

**Status:** this character target was met — the gap table's target column is now implemented,
expert-audited, and visually witnessed. See section E.

---

## E. What was ACTUALLY implemented (the elevation pass, U3–U9) — FINAL

The pass shipped and is verified. U1/U2 remain frozen and excluded. Everything below is
implemented in the prototypes (shared layer in `_shared/`), not proposed.

### E1. Shared spring/personality token layer

One token vocabulary drives the whole set: `--mo-spring`, `--mo-settle`, `--mo-antic`,
`--mo-follow`, `--mo-stagger`, `--mo-press`, `--mo-reveal`, `--mo-bounce` — each a
duration + easing pair with a `-r` reduced-motion twin — all scaled by the per-theme
`--pm-motion-k` intensity multiplier: retro **0.58**, basic **0.83**, friendly **1.08**,
glass **1.33** (`_shared/themes.css`). Reduced-motion is token-level, so every behavior below
collapses to an instant, state-complete swap. Implemented on top of that substrate:

- **Counters tween value→value** with a landing tick and in-flight retarget — never from $0,
  never re-counted on revisit (C8, C15).
- **Meters and donuts overshoot then settle** to target (C2). Donut transitions run on the
  kebab-case `stroke-dashoffset` property — a camelCase `strokeDashoffset` transition-property
  bug was caught by a witness and fixed, so donuts now spring (`donut-spring-results.json`).
- **Chart bars stagger and morph from their previous values** rather than replaying an
  entrance (C9).
- **Sparklines draw on** via stroke-dash reveal.
- **Widgets enter in a stagger wave** with a 3-layer hover lift (translate + shadow + content
  response) and a spring-back press; menu items cascade out of a sprouting container
  (C5, C6, C10, C13).
- **Popups spring with content follow-through** and a state-linked (heat) ring pulse
  (C4, C13, C17).
- **More Details sections stagger**, with a Curated↔Raw cross-slide.
- **Scroll reveal** (`.pm-rev`) is wired through a one-shot IntersectionObserver with stagger —
  reveals play once and never replay on scroll-back (C7).

### E2. Per-concept signature personalities

Same tokens, different choreographies — each concept carries a distinct movement signature:

- **U3 Cockpit — instrument power-on.** Needle sweep with overshoot, LED strikes, threshold
  flashes, a bench ticker; instruments power on as they reveal.
- **U4 Focus — calm depth.** Pane transitions where the outgoing pane recedes a layer and the
  incoming pane rises from depth, direction-aware; a springing rail indicator.
- **U5 Cozy Console — hearth.** A spend-linked lub-dub heartbeat, shelves that settle, ambient
  breathing (desynced, polyrhythmic warmth).
- **U6 Workspace — triage.** Directional dossier swap, springing rail indicator, pressure
  pulses on hot meters.
- **U7 Board — bench.** Module power-on cascade, a diagnostic scan band, odometer module
  numbers, value acknowledgements on interaction.
- **U8 Canvas — tactile.** Bouncy tile settle, pointer-tracked 3D tilt, spine glow, a breathing
  hero wash.
- **U9 Deck — curated deck.** Slide depth with content follow-through, hero count-up,
  direction-aware readout flip, springing tab ink.

### E3. Outcome & verification

- **Expert motion audit: EXPERT-LEVEL.** An independent expert pass measured (not asserted)
  overshoot, follow-through, and stagger across all seven concepts — **66/66 checks passed**,
  personalities verified distinct, **reduced-motion fully compliant on all 7**
  (`verification/audit-motion-final.md`; cross-check `motion-expert-harness.mjs` 13/13).
- **Visually witnessed in a live browser, all 8 themes.** Every concept's animations were
  watched running — per-frame trajectories plus timed screenshot frame-sequences per theme
  (`verification/witness-u3.md` … `witness-u9.md`; frames in
  `verification/screenshots-witness/<concept>/<theme>/`, reduced-motion under
  `.../reduced-motion/`).
- **Regression gates stayed green.** Base matrix **280/280**; data-unit **1003/1003**; the U4
  interactive-state re-run passed **59/59** after a pane-switch busy-lock regression was found
  and fixed — incoming transitions now pre-empt in-flight ones instead of dropping
  (`witness-u4.md`).
- **vs PMConcept7: exceeds decisively.** PMConcept7 animates only flat appearances — teleport
  reorders, from-$0 counters, identical 240ms fades, a dead press scale, a linear page exit.
  The concepts now move objects: lifted-clone FLIP reorders, value→value counter tweens,
  staggered springs, live press physics (contrast in §A2; `audit-motion-final.md` §8).

Honest residuals are recorded in `verification/known-limitations.md`: two "idle" U3 donuts hold
their start value (a pre-existing render-timing nuance, not the snap bug), and the shared
`.pm6-tb-menu` pops in instantly app-wide (cosmetic — its close is cut at 150ms against the
220ms transform).

## F. Sources
Primary (via `motion-source-ledger.json`): Material 3 Motion, Apple HIG Motion, Microsoft Fluent
Movement, IBM Carbon Motion, Adobe Spectrum Motion, NN/g response-time limits, Motion (Framer) +
react-spring spring models, GSAP, Tversky et al. 2002, Simons & Levin 1997, W3C WCAG 2.3.3 / MDN
prefers-reduced-motion, Slint 1.17.1 docs+source. Technique lineage also: Thomas & Johnston's 12
principles as applied to UI motion (anticipation, follow-through, squash-and-stretch, secondary
action), FLIP (Lewis et al., "Inverting your transitions"), spring presets (motion.dev/react-spring
docs), bezier overshoot conventions `(0.34,1.56,0.64,1)` / `(0.175,0.885,0.32,1.275)` (easeOutBack).
