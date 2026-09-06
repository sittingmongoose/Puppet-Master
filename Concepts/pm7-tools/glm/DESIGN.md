# GLM Onboarding + Guided Tour — "The Theater of Work"

Concept-local rebuild of the onboarding and guided-tour systems in
`/Concepts/TestGLMPMConcept.html`. Sources live here; `merge.py` replaces the
four legacy blocks (`pm7-onboarding-css`, `pm7-guided-tour-css`,
`pm7-guided-tour-js`, `pm7-onboarding-js`) plus both host markup spans. The
merge is idempotent (repeat runs are byte-identical).

## Files
- `hosts_onboarding.html` / `hosts_tour.html` — host markup (`pmx-onboarding`, `pmx-tour`)
- `obx_base.css` — window, panel, controls, motion grammar
- `obx_scenes.css` — theater diorama scenes + entrance/idle keyframes
- `obx_themes_{friendly,glass,retro,basic}.css` — four distinct art materials (× light/dark)
- `obx_state.js` / `obx_screens.js` / `obx_runtime.js` — onboarding engine
- `gtx.css` / `gtx.js` — guided tour (spotlight, pointer, slate)
- `merge.py` — block replacer

## Art direction
One metaphor carried end to end: onboarding is staging a production.
- **Welcome** — curtains part in weighted arcs, the spotlight irises open, dust
  motes catch the beam, the title rises word-by-word, a seed sprouts a leaf.
- **Where** — venue vignettes (desk + machine, linked node, crate).
- **Project** — the playbill gets its name (quill / crate / film reel variants).
- **Keep** — safety net under the stage, cloud copy, SSH archive door + key.
- **Review** — the assembled route (source → pack → worker).
- **Commit** — light cue sweep, READY stamp with squash-settle + ink ring,
  fluttering paper confetti, receipt chip.
- **Power** — the power room: rack slots, charging battery, pulse.
- **Finish** — theme parade; hovering a family re-materializes the whole
  window (shutter-blink + shimmer sweep + swatch stagger) and persists the
  choice through the shell's own theme events.

Four genuinely different productions per family: Friendly storybook paper,
Glass frosted panes over the shell's aurora imagery, Retro phosphor CRT
(scanlines, chunky bezels, blink), Basic drafting-table ink (wireframe,
grid, annotations).

## Flow (newbie-first, reversible draft)
welcome → where (this computer · existing device · server under "one more
way") → checks (auto) → **device ready** (offers Create a new project /
Use existing / Just look) → project kind → new project (name, runs-on,
"start like another project?" when eligible) → keep (safety net default,
online copy with just-in-time sign-in, NAS archive with **SSH default** and
one-tap automatic connection) → review (edit links, nothing-created note) →
commit once (truthful phases + receipt) → power (detected-ready accounts
first; Sign In / Enter API Key / Install semantics per state) → free models
(optional) → finish (theme + tour handoff).

Draft persists in `pm.glm.onboarding.v1`; Close/Escape keep the draft and
offer Resume; reload re-opens an in-progress session. No project side
effects exist before the single commit click.

## Guided tour — "First Night"
Eleven steps in three acts over the real shell. Every Show Me drives the same
real handler as the user action:
1–3 Ask anything (real composer; real send streams a labeled guided-example
Teacher reply; the real ELI5 pill rewrites it),
4–5 Arrange (real drag transaction via `PM_HOME_WORKSPACE.beginDrag/
updateDrag/commitDrop`; real widget FAB + catalog),
6–11 Plan — the crown-jewel chapter: real wizard tab, real intake composer
+ send, real attach card, then the **Guided Practice panel** (deterministic
local fixture): the practice goal becomes three animated outcomes, one
consequential question with why-it-matters, per-answer consequence cards
(shared access vs simplest site), and a change-answer flow that swaps only
the consequence — ending on the real wizard's approval boundary.
The opening is a staged title sequence (curtain line, word-rise, act
chips, iris exit). Skip Tour always; replay/resume buttons; workspace
snapshot/restore.

## Verification instruments (concept-local)
- **tokencheck.py logic** — every fg/bg token pair per theme (72 checks,
  glass composited over its shell base) passes WCAG 4.5:1/3:1 math.
- **Pixel critic** — full-screenshot strip sampling across 8 themes × 6
  screens; drove the real fixes (unsized-SVG explosion, missing set-card
  styling, shell button-ink overrides, disabled-state exemptions).
- **Frame-delta analysis** — 60fps timeline-scrub captures; every hero
  sequence measured pop-free (commit: zero spikes; opening: zero spikes).
- The external vision MCP remained unavailable; contrast/spacing/overflow
  are verified by the deterministic instruments above instead.

## Motion grammar
expo-out entrances, spring arrivals, staggered layer reveals (`--i`),
scene swaps through a 240ms fade with mid-hold, low-amplitude idle loops
(paused under reduced motion, which keeps sequence via short fades).
Pointer Show Me: anticipation pull-back, arced travel, press ripple + ping.
Verified with 60fps-equivalent timeline scrubbing + wall-clock capture and
frame-delta spike analysis (no pops/teleports; intentional blink cuts only).

## Compatibility notes
- Exposed APIs keep the legacy names: `PM7_ONBOARDING_CINEMATIC`
  (open/close/skip/back/resume/replay/snapshot) and `PM7_GUIDED_TOUR`
  (start/next/skip/back/resume/replay/snapshot), so Settings/home-menu
  entry points work unchanged.
- The shell's hover-tags bridge converts native `disabled` buttons into
  event-blocked elements, so this system uses `aria-disabled` instead of
  native `disabled` on its controls.
- All iconography is inline SVG; no emoji anywhere (repo gate passes).
