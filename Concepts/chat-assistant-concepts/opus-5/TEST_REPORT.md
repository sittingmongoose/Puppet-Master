# Test Report — Opus 5 Assistant Chat concept workspace

> ## Correction — reduced-motion selector audit, 2026-08-02
>
> An earlier audit reported **87 structurally inert `[data-motion="reduced"]` selectors**. That
> figure was wrong. Measured against the live DOM, the real number is **47**, and all of them were
> in `threads/*.css`.
>
> `compose.js` sets `data-motion` and `data-pmx-window`/`data-pmx-thread` on the same element, so a
> descendant combinator between them cannot match. That reasoning is correct — but every WINDOW
> concept independently re-stamps its own scope attribute on its shell
> (`data: { pmxWindow: 'w1' }`, `windows/w1-ledger.js:48` and `:137`, and the equivalent in w2–w8).
> `.wN-shell` IS a descendant of the stage, so the window half of those selectors resolved through
> it and was working all along. No thread concept does the equivalent, which is exactly why the
> thread half was dead.
>
> All 87 were converted from descendant to compound form regardless. For the 40 window selectors
> this is a no-op: match counts are identical before and after, and specificity is unchanged at
> (0,3,0), so there is no cascade shift. For the 47 thread selectors it is a real fix.
>
> **The control that proves it.** Disabling the catch-all `[data-motion="reduced"] *` rule in the
> live stylesheet and remeasuring: signature entry animations stay dead on their own
> (`animation-name: none`, `opacity: 1`, `transform: none`), and stage-wide running-animation count
> stays at 0. The converted rules do real work rather than being redundant with the catch-all.
>
> The catch-all still uniquely covers hover/press *transitions* on shared chrome (~115–120 elements)
> — pre-existing and unchanged.
>
> `shared/*.css` was verified empirically rather than assumed: 0 of its 40 reduced-motion selectors
> target a class that ever lands on the stage element itself. Leaving them alone was correct.
>
> Suite after the change: **6034 / 6034 / 0 failed**, all 16 concept stylesheets parsed with live
> rule counts matching source exactly.

> ## Latest run — 2026-08-01 (spring physics, question reveal, pinned history)
>
> ```
> Total assertions   6018
> Passed             6018
> Failed                0
> Console errors        0
> Console warnings      0
> ```
>
> Full matrix: all eight host pairings x 8 themes x 4 widths x 2 rail states, plus five feature
> states, the mount transition and the reduced-motion comparison.
>
> ### What changed
>
> **Real spring physics.** Motion now settles on `linear()` curves sampled from a damped harmonic
> oscillator (`tools/build-springs.mjs`) using PMConcept7's own per-family stiffness and damping.
> `cubic-bezier` can overshoot once and cannot oscillate; friendly genuinely rebounds past 1 and
> returns under it. Measured peak overshoot, confirmed live on concept elements:
>
> | | retro | basic | glass | friendly |
> |---|---|---|---|---|
> | damping ratio | 0.81 | 0.90 | 0.72 | 0.57 |
> | peak overshoot | 1.004 | 1.001 | 1.040 | **1.112** |
> | duration | 140ms | 200ms | 320ms | 260ms |
>
> Closing legs deliberately keep their ease-in curves — a spring on the way out overshoots INTO
> the trigger the menu is collapsing toward. Springs belong on arrivals.
>
> **Question reveal, identity-keyed.** `questionnaire.js` emits no events and rebuilds the card on
> every answer, skip *and keystroke*. Choreography is therefore keyed on `recordId + questionId`.
> Verified: clicking one option five times produced **10 rebuilds, 10 silent, 0 entrance**; moving
> to the next question produced **exactly one advance**.
>
> **Pinnable history in all eight windows**, each in its own idiom, with suspension measured
> directly (`room 700 -> active false`) and the asked-for state preserved so widening restores it.
>
> **Thread status as symbol.** Six purpose-built glyphs, all inscribed in one r=7.5 circle and
> measured concentric at (12,12). Zero state words remain; every symbol carries an `aria-label`.
>
> ### Defects found and fixed this run
>
> | Defect | Cause | Fix |
> |---|---|---|
> | 70 overflow failures in w2 | An SVG child's nearest clipping ancestor is always the `<svg>` itself, masking the real horizontal scroller above it | SVG internals excluded from the overflow check — they are painted geometry, not layout boxes |
> | Reduced-motion geometry mismatch | An *infinite* spinner has no final geometry to compare; stopping it necessarily changes its box | Infinite animations and SVG internals excluded from the layout snapshot |
> | w3/w5/w8 never mounted shared history | They declared the capability but exposed no matching `regions` entry | Both halves supplied; they now inherit status symbols and the row menu |
> | Pin toggles never reached the windows | Hooks matched the store key exactly; the store notifies coarse keys | Prefix matching, following w1's existing convention |
> | Status dots read as orbiting off-centre | The borrowed `ring` glyph is a circle **plus a heavy arc**; spinning it reads as a ball wandering | Purpose-built glyphs; arc rotates about `transform-box: view-box` at the true circle centre |
>
> Two probe artefacts were also caught and NOT "fixed": row counts climbing 18→90 and suspension
> appearing not to engage were both stale DOM from re-mounting into one reused composition.
>
> Historic results from earlier passes are preserved below.

---

> ## Previous run — 2026-08-01 (material, motion and composer pass)
>
> ```
> Total assertions   5872
> Passed             5872
> Failed                0
> Console errors        0
> Console warnings      0
> ```
>
> Coverage widened from one pairing to **all eight host pairings** (w1+t1 … w8+t8), each across
> 8 themes × 4 widths × 2 rail states, plus four feature states and the reduced-motion comparison.
>
> **Three defects found and fixed in this run** — none of which the previous single-pairing sweep
> could have caught:
>
> | Defect | Cause | Fix |
> |---|---|---|
> | Horizontal overflow, w2 rail, 4–12px | The new `pmx-w2-rail-in` signature started the rail at `translateX(12px)`, putting it past the right edge for the first frame — a real scrollbar flash, not just a measurement artifact | Rail now enters from the inside (`-12px`) and settles outward; w7's rails likewise start pulled toward the centre and part outward, which is both safer and a truer reading of "parting" |
> | Control overlap, w8+t8 with a questionnaire | `visible()` checked only the element's own opacity. Opacity does not inherit as a computed value, so buttons inside the `opacity: 0` message hover row reported as visible and collided with the questionnaire | `visible()` now walks ancestors for `opacity: 0`. A new **pinned hover row** feature state forces every row visible and re-checks overlap, so correcting the false positive cannot mask a real one |
> | Ghosted "double image" over the rail and dashboard | The new retro 3px pixel lattice renders at 1.5px in the gallery (scale 0.5) and 0.96px on the contact sheet (scale 0.32), beating against the device pixel grid; the friendly 18px dot grid aliases the same way at 0.32 | Both textures are switched off wherever a stage is scaled down. They are 1:1 decoration and carry no information |
>
> **Two latent bugs fixed at source**, both pre-existing:
> - `PMXUtil.applyPrefixed` concatenated `data-` with the raw key, so a camelCase key such as `pmxRole`
>   landed as `data-pmxrole`. Every stylesheet rule written against `[data-pmx-role]` silently matched
>   nothing — this had killed three colour rules in t1 outright, and two thread modules carried comments
>   describing the quirk and hand-setting the attribute to dodge it. The helper now converts to kebab-case.
> - `shared/popup.js` registered no scroll or resize listener at all, so a menu opened from inside the
>   scrolling transcript stayed pinned in viewport coordinates while its trigger moved away.
>
> Historic result from the previous pass is preserved below.

---

**Run date:** 2026-07-31
**Runner:** `tests/runner.html`, served from `http://127.0.0.1:8790`
**Environment:** Chromium via the in-app browser. Node 22.18.0 present for syntax checks and bundle
generation; Playwright is installed nowhere on this machine and no network install was performed, per
the user's direction to use the in-app browser. Every assertion below therefore runs **in-page with
zero dependencies** and can be re-run by opening the runner and pressing "Run all suites".

---

## Headline result

```
Total assertions   5338
Passed             5338
Failed                0
Console errors        0
Console warnings      0
```

Plus a separate visual-property sweep of **704 concept/theme/width combinations** (576 in the first
pass, 128 re-run after the alignment and overlap checks were added), all clean.

Eight window concepts, eight thread concepts, 64 enumerable pairings, all registered and mounting.

---

## 1. Configuration matrix

The required matrix is **8 themes × 4 widths = 32 configurations**, each exercised with the fake
application rail **open and closed** (64 shell arrangements), for **eight host pairings**.

| Host pairing | Assertions | Result |
|---|---:|---|
| w1 Ledger + t1 Speaker Turns | 649 | PASS |
| w2 Split Desk + t5 Paired Columns | 649 | PASS |
| w3 Focus Column + t8 Reading Mode | 649 | PASS |
| w4 Stacked Panes + t2 Two-Tone Slabs | 649 | PASS |
| w5 Command Bar + t6 Work Interleave | 649 | PASS |
| w6 Docked Sheets + t7 Cards with Air | 649 | PASS |
| w7 Two-Rail + t3 Timeline Spine | 649 | PASS |
| w8 Frameless + t4 Digest | 649 | PASS |
| Structure, CSS scoping, mount smoke, behavior, popups | 146 | PASS |
| **Total** | **5338** | **PASS** |

Every window concept is covered, and every thread concept is covered in a structurally different host.
The pairing list was chosen so that each of the eight threads is tested in a window with a materially
different shape — including w3 and w8, which deliberately provide no `threadHistory` and (for w8) no
`workSurfaceHost`, so the absent-region path is exercised rather than assumed.

Themes: friendly-dark, friendly-light, retro-dark, retro-light, basic-light, basic-dark, glass-dark,
glass-light. Widths: 520, 750, 975, 1200.

## 2. All 64 pairings — mount smoke

Every one of the 64 window/thread pairings is mounted and checked for:

- module mounts without throwing
- all four required regions present and connected (`registry.js` throws otherwise)
- demo data loaded
- the shared composer actually mounted into the window's `composerHost`
- the literal model label `Opus 5` present in the rendered stage
- no uncaught console error across the whole sweep

**Result: 64 of 64 pass, 0 console errors.**

## 3. Automated assertions

Every assertion named in the testing contract is implemented and passing.

| Assertion | Where | Result |
|---|---|---|
| Horizontal overflow | every config, per pairing | pass |
| Text clipping / unintended horizontal scroller | every config | pass |
| Popup clipped by a scrolling ancestor | popup placement check | pass |
| Popup placed outside the viewport | popup placement check | pass |
| Popup hidden behind another layer | single-overlay invariant | pass |
| Operating-system scrollbar leakage | every scrollable surface must carry `pmx-scroll` | pass |
| Console errors | captured from load, across all suites | 0 |
| Broken exact-message jump | behavior suite | pass |
| Search missing stored older content | behavior suite, 3 seeded phrases | pass |
| Lost scroll anchor | anchor capture/restore across remount | pass |
| Lost state during docked/pop-out change | draft, expansion, Lens, search all verified | pass |
| Broken Send/Stop state machine | four-state machine walked explicitly | pass |
| Lost draft after simulated restart | snapshot, rehydrate into a fresh store | pass |
| Incorrect questionnaire queue order | oldest-unresolved-first verified | pass |
| Goal state loss | surfaces suite | pass |
| Emoji characters | Unicode sweep over every visible text node | pass |
| Colored left-side accent-border selectors | computed-style sweep over selected/active elements | pass |
| User-facing underscored status labels | regex sweep, file names excluded | pass |

Assertions added in the visual-quality pass, each written because a real defect got past the
earlier suite:

| Assertion | What it catches | Result |
|---|---|---|
| No control clips its own label | a pill whose text is cut inside its own border | pass |
| Control rows share a baseline | a row of pills reading as scattered | pass |
| No two controls overlap | an absolutely-positioned row landing on another row | pass |
| Nothing escapes the chat surface | content coming off the component on any edge | pass |
| Popup paints in front | a menu occluded by concept content | pass |
| Popup is opaque, not see-through | a menu in front in z-order that content reads through | pass |
| Popup contents not clipped | a menu item cut inside the menu | pass |

Project-specific assertions added beyond the contract:

| Assertion | Result |
|---|---|
| Concept CSS scoped to its own `[data-pmx-window]` / `[data-pmx-thread]` | pass, all 16 |
| Hover row is a sibling immediately after `.pmx-msg-body`, never nested | pass |
| Resend absent from every hover row | pass |
| No per-message Stop control | pass |
| At most one transient overlay open at a time | pass |
| Reduced motion reaches the same final geometry | pass |
| No element left mid-transition under reduced motion | pass |
| At least 15 demo threads present | pass (18) |
| A large stored thread exists for long-history testing | pass (700 messages) |
| At least one thread has messages not initially rendered | pass (650 unloaded) |

## 4. Behavior verified

- **Send / Stop state machine.** Idle+empty shows Send; active+empty shows Stop; active+typed shows
  Send; clearing the draft while active returns to Stop; after Stop it returns to Send. Pressing Send
  while an agent works never stops it.
- **Search.** All three seeded phrases are found, including `canonical source history` which sits in
  unloaded older history, and `retention window nine days` which sits inside a message that is
  collapsed by default.
- **Context Lens.** Apply limit is 25 **per operation**, not thread-wide.
- **Questionnaire.** The oldest unresolved questionnaire is the active one, a second stays queued, and
  the composer reports itself locked while one is active.
- **Draft persistence.** Text written before `store.snapshot()` is recovered by `rehydrate()` into a
  brand-new store instance, which is the simulated restart.
- **Mount transition.** Draft text, long-message expansion, Lens mode and selection, and search query
  and scope all survive docked → pop-out → docked.

## 5. Defects found and fixed during this run

The first pass found six real defects; the visual-quality pass found eleven more, four of them by eye
with the whole suite green. All seventeen were fixed and re-verified; none remain.

1. **Shell layout collapse.** `shell.js` applies `pmx-shell` to the stage element, so
   `workspace.css`'s `.pmx-stage { display: block }` won the cascade and the chat host wrapped below
   the dashboard instead of sitting beside it. Fixed by raising specificity in the shell's own sheet.
2. **Theme lock ignored.** `compose.mount()` unconditionally wrote the global theme onto the stage,
   so every contact-sheet cell rendered the same theme and all eight cells looked dark. Fixed by
   honoring a per-composition theme lock.
3. **Unbound services.** Six services expose `bind(store)` and the workspace never called it, so the
   questionnaire and draft suites silently read empty state. Fixed by binding at boot and in the test
   harness identically. `questionnaire.js` named its binder `attach`; aliased rather than special-cased.
4. **Infinite recursion.** `renderQuestion` → `yieldForQuestion` → store notify → `renderQuestion`
   blew the stack. Fixed by making the setter emit only on a real change.
5. **Collapsed containers still measurable.** w6's off-canvas sheet, w7's zero-width column, and w4's
   collapsed strip each left content measurable outside their container, reading as horizontal
   overflow. Fixed by hiding rather than merely clipping.
6. **w8 capsule overflow at 520 px.** The header capsule's tool row exceeded its own width by 10 px.
   Fixed by wrapping the capsule to a second row rather than clipping a required control.

### Second pass — visual-quality review

A further six defects were found, four of them **by eye, with the whole suite green**:

7. **A see-through menu.** In the glass themes `--surface-elevated` is translucent, so a popup was in
   front in z-order while the transcript read straight through it — legible neither as menu nor as
   transcript. Fixed by painting the themed surface over an opaque base. Found by looking.
8. **A ghost popup.** Opening a second menu before the first had finished its open frame left the
   closed one with `is-open` re-applied by a pending callback, stranding an overlay nothing owned.
   Found by the new popup suite.
9. **w6 tab row colliding with the header.** Absolutely positioned to a corner, it landed on the
   selector row at wide width and on the send button at the bottom. Moved into normal flow. Found by eye.
10. **w8 question capsule overlaying the transcript tail.** Only the composer height was reserved, so
    an active question covered the last turns. Found by the new overlap assertion.
11. **The shell rail list was not opted into the Puppet Master scrollbar**, and its list items could
    overflow the rail by a few pixels in the wider-type themes.
12. **Pop-out centring used a transform**, which establishes a containing block and would have trapped
    the popup overlay root inside an `overflow: hidden` box. Changed to auto-margin centring.
13. **Services were bound before the demo data loaded**, so the questionnaire queue seeded from nothing
    and no thread ever showed a question in the live workspace. The behaviour suite passed the whole
    time because its harness binds after the load resolves — it was testing a differently-wired
    application. Found by opening a thread that should have had a question.
14. **The question card rendered twice.** `yieldForQuestion` notifies the store, re-entering the render
    mid-pass so two cards landed in a host that had been emptied once. Guarded in all eight threads.
15. **A translucent covering surface in five more places** — w1's history drawer, w5's command palette,
    w6's sheet, w7's overlay column, w8's full overlay — each of which would have let the transcript
    read through it in the glass themes. Found by a delegated static audit looking for the pattern.
16. **w6's side panel painted over the header** at wide width. Replaced with a two-column grid so the
    panel has its own track.
17. **w8's question capsule was pinned a hardcoded 78px above the bottom**, which a multi-line composer
    grows straight through. Both capsules now stack in real flow.

Two failures turned out to be **bugs in my own checker**, not in the concepts, and were corrected:

- an element with `text-overflow: ellipsis` legitimately reports `scrollWidth > clientWidth`, and was
  being counted as overflow;
- a deliberate static opacity (a muted separator at `.6`) was being reported as "stuck mid-transition".
  The check now looks for genuinely running animations instead;
- a fixed-position popup was treated as clipped by every `overflow: hidden` ancestor, ignoring the rule
  that only a transformed ancestor establishes a containing block for it;
- controls scrolled out of the transcript still report a rect, so the overlap check "found" collisions
  between a message button below the fold and the composer beneath it. Rects are now clipped to every
  scrolling ancestor before being compared;
- the test runner's own sticky toolbar was counted as occluding a popup. Only occluders inside the
  workspace count now.

## 6. How to reproduce

```bash
cd "Concepts/chat-assistant-concepts/opus-5" && py -m http.server 8790
```

Open `http://127.0.0.1:8790/tests/runner.html` and press **Run all suites**. The default host pairing
is w1+t1; the per-pairing sweep in this report was driven by calling
`PMXSuites.runMatrix({windowId, threadId})` for each of the eight pairings in turn.

## 7. Honest limits of this report

- Automated geometry checks are not a substitute for visual review. See `VISUAL_AUDIT.md`.
- The 28 required feature states are covered by assertions and by inspection, but not every one of them
  has a dedicated captured image at all 32 configurations; the contact sheet exists so that one image
  covers eight configurations at a time. Evidence mapping is in `COVERAGE.md`.
- No headless browser matrix was run, because Playwright is not installed and no install was performed.
  Everything above was executed in a real Chromium via the in-app browser.
