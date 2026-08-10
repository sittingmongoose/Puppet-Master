# Visual Audit — Opus 5 Assistant Chat concept workspace

> ## Addendum — 2026-08-01, material and motion pass
>
> The previous audit passed every automated check while the concepts still read as plain. That was a
> real finding and it was correct: the workspace was verified but not designed. This pass addressed it.
>
> **What was measurably missing, and now is not:**
>
> | Before | After |
> |---|---|
> | 0 `@keyframes` across all 16 concept stylesheets (PMConcept7 has 79) | 25, each unique, one signature per concept |
> | 27–34 tokens per theme, flat palette only | Plus per-theme type metrics, elevation-on-hover, graph states, and the full glass and cozy material systems |
> | No glass pane material — a flat `rgba` fill | Four-tier translucency ladder (step-1/2/3 → plate), pane gradient, multi-layer edge lighting, screen-blend sheen |
> | No cozy system — friendly was "basic with round corners" | 15 `--pm6-cozy-*` tokens, dot-grid and corner-glow ground, `color-mix` category cards (files=mint, orchestrator=sky, lanes=lavender) |
> | Retro had hard shadows but no signature interaction | Boxes shift diagonally into their own shadow on hover; 3px pixel lattice at 1:1 |
> | All eight themes moved identically — the easing tokens existed but almost nothing animated | Verified live: retro 140ms snap, basic 200ms smooth, glass 320ms decelerating, friendly 260ms spring |
>
> **Per-theme motion personality, measured on the same element by swapping only `data-theme`:**
>
> ```
> retro-dark      0.14s  cubic-bezier(0.2, 0, 0, 1)         snap
> basic-dark      0.20s  cubic-bezier(0.4, 0, 0.2, 1)       smooth
> glass-dark      0.32s  cubic-bezier(0.22, 1, 0.36, 1)     decelerating
> friendly-dark   0.26s  cubic-bezier(0.34, 1.56, 0.64, 1)  spring, overshoots
> ```
>
> This is the point of the shared vocabulary: one declaration, four characters. No concept hardcodes a
> duration or an easing curve.
>
> **Composer**, verified by hand at 520px: the bordered box contains the chips, the text field, attach
> and send. The field has no border and no background of its own, so focus rings the whole surface
> rather than a box inside a box. The draft control is gone, and `checkRemovedControls` now fails if it
> returns. The persona/model/mode row remains a sibling below the box, as in PMConcept7.
>
> **Menus**, verified by hand: opening a menu from inside the scrolling transcript and scrolling 95px
> holds its 6px gap to the anchor exactly, and the menu dismisses once the anchor leaves its scroll
> container. Corner origin is computed against the popup's own placed box, so the sprout reads as
> growing out of the trigger even when the popup is clamped to a viewport edge — which at 520px is most
> of the time.
>
> **One defect found by eye and not by any assertion:** a ghosted second copy of the layout over the
> rail and dashboard in scaled previews. Cause and fix are recorded in `TEST_REPORT.md`; briefly, the
> new fine textures aliased against the device pixel grid at 0.5 and 0.32 scale, and are now suppressed
> wherever a stage is scaled down.
>
> **Still outstanding, stated plainly:** the systematic capture set (16 contact sheets at 520px, four at
> 1200px into `evidence/`) has not been produced. Spot checks were done across all four theme families
> at 520 and 750, and the full 8-pairing assertion matrix is green, but the archived capture set is not
> written.

---

**Reviewed 2026-07-31 in Chromium via the in-app browser.**

Automated geometry checks are not a substitute for looking at the result. Everything below was
inspected on screen. Where a judgement is subjective I say so rather than dressing it as a measurement.

---

## What was inspected

- The gallery (`index.html`) with all sixteen concepts live and interactive.
- The stage (`stage.html`) at 520 px in Friendly Dark, docked, rail open — the hardest case.
- The stage at 520 px in Glass Dark, **pop-out**, rail closed, on a different pairing.
- The eight-theme contact sheet (`contact.html`) at 520 px, which puts all eight themes side by side
  in one image.

---

## Findings against the fourteen required criteria

**1. Can the user and assistant exchange be followed quickly?**
Yes in every thread concept, but by different means, which is the point of having eight. Speaker Turns
and Reading Mode are the easiest to read continuously. Digest is the easiest to *scan* — at 520 px it
shows roughly eight turns where a full transcript shows two or three. Paired Columns is the fastest for
"who said what" above 900 px and loses that advantage below it, exactly as designed.

**2. How much useful conversation is visible?**
At 520 px, measured on the stage: Speaker Turns shows about six exchanges before the fold, Digest about
eight, Cards with Air about nine after its narrow-width density was tightened. Before that fix Cards
with Air showed three or four, which was the clearest finding of the whole review: cards are legible,
but their cost is vertical, and at the minimum width that cost has to be paid back in padding and
leading rather than in separation between cards.

**3. Is the narrowest width usable?**
Yes for all sixteen. No concept requires 1200 px to make sense. w4's side-by-side mode and t5's two
columns are wide-width *enhancements* that fold cleanly, not the primary form.

**4. Does nested containment obscure hierarchy?**
This is where the concepts separate most. t6 Work Interleave has zero nested boxes by construction —
its CSS strips border, background, and radius from every descendant of a card, so a second box cannot
render even by mistake. t7 Cards with Air permits exactly one level and enforces it the same way. Both
read cleanly. The rest avoid the problem by not using containers in the transcript at all.

**5. Does metadata compete with prose?**
No. The hover row is hidden until hover or focus in every concept, and the compact row carries only
provider, model, and duration — exact timestamps live in More Info. At 620 px and below the provider
name drops out first, because model and duration carry more information per character.

**6. Do Goal, Todo, subagent, diff, and activity states collide?**
No. Surfaces render only when active, and nothing reserves permanent space. On a thread with all four
active, w1's bottom shelf grows to about 40 % of height and scrolls internally rather than pushing the
transcript off screen. On a thread with none, the shelf has zero height and the transcript is the whole
window.

**7. Do questions overcrowd the window?**
No. An active questionnaire takes the floor and the work surfaces yield; their state continues
underneath and returns intact. In w6 an open sheet steps back to peek when a question arrives.

**8. Are long-message controls understandable?**
Yes. "Show more" / "Show less" now sits persistently below every eligible message at low contrast, and
hover only raises it. On the first review the control was hover-revealed and the fade was the only
standing hint that a message could be opened at all, which was the weakest discoverability point in the
set. Fixed in all eight thread concepts.

**9. Are search focus and Context Lens selection visible?**
Yes. A jumped-to message gets a temporary highlight that fades over 1.6 s, and holds statically under
reduced motion. Lens states read as field treatments — muted at 45 % opacity, focused with a tinted
background, subcompacted in italic — never as a colored left edge.

**10. Do popups feel attached to their triggers?**
Yes. The corner-origin sprout consistently grows from the corner nearest its trigger, and the
bottom-anchored placement means a filtered list changes its top edge while the row under the pointer
stays put.

**11. Do transitions cause layout jumps?**
No jumps observed. Expanding a message above the reading position holds the viewport because the scroll
correction is applied explicitly rather than relying on native anchoring.

**12. Does every theme feel complete rather than partially themed?**
Yes, verified on the contact sheet. All eight render distinctly: Retro shows its zero-radius hard-edge
treatment, Glass its single blur, Basic its flatter surfaces, Friendly its softer radii. **This was not
true on first inspection** — every cell rendered dark because the composition overwrote the per-cell
theme. Fixed, and the sheet now shows eight genuinely different themes.

**13. Does reduced motion reach a stable final state?**
Yes. Toggling it produces geometry identical to normal motion within a 2 px tolerance, with no element
left mid-transition. Both signals are honored, and the delay overrides matter: zeroing duration alone
leaves a closed popup lingering as a ghost, which is a bug PMConcept7 shipped and this workspace does
not.

**14. Does the fake application rail expose spacing defects?**
Yes, and that is its job. Toggling the rail at 1200 px squeezed the dashboard enough to expose a grid
that forced a 220 px column inside a narrower container. Fixed. Rail width and chat width are
independent — changing one never moves the other.

---

## Defects found by looking, not by measuring

1. **All eight contact-sheet cells rendered the same theme.** The geometry suite was fully green while
   this was true, because identical themes are geometrically identical. Only looking caught it.
2. **The chat panel was cropped out of every contact cell.** The virtual stage was wider than the cell
   could show, so the sheet displayed eight dashboards and no chat — the one thing it exists to show.
3. **The chat host wrapped below the dashboard** instead of sitting beside it, for a CSS cascade reason
   no assertion was watching.

All three are fixed. The first two are worth stating plainly because they are exactly the class of
failure the testing contract warns about: a report that passes because the page loads and nothing
overflows.

---

## Second pass — targeted visual-quality review

A second review looked specifically for clipped pills, scattered alignment, content coming off a
component, menus failing to sit in front, and theme correctness, across every concept at 520 and 1200
in all eight themes. Four more defects were found **by eye with the whole suite green**, and two more
by assertions written in response.

1. **A see-through menu.** In the glass themes the model picker was in front in z-order while the
   transcript read straight through it. Both surfaces became unreadable at once. Menus now paint the
   themed surface over an opaque base, so a menu is always readable in every theme.
2. **w6's tab row collided with two different things.** Absolutely positioned to a corner, it landed on
   the header's selector row at 1200 px and on the send button at the bottom. It now sits in normal
   flow between the transcript and the composer, where it cannot collide with anything.
3. **w8's question capsule covered the transcript tail.** Only the composer height was reserved, so an
   active question sat on top of the last turns. The reserve now follows whichever floating surfaces
   are present.
4. **The shell rail list leaked an unstyled scrollbar** and its items could overflow the rail by a few
   pixels in the wider-type themes.
5. **A ghost popup** could be stranded on screen by opening a second menu quickly.
5b. **The questionnaire never appeared in the live workspace at all.** Services were bound before the
   demo data finished loading, so the questionnaire queue seeded from nothing and every thread looked
   like it had no questions. The behaviour suite passed throughout, because its harness happens to bind
   after the load resolves — the test was exercising a differently-wired application than the one a
   reviewer opens. Found only by opening a thread that should have had a question and seeing none.
5c. **The question card then rendered twice.** Marking the work surfaces as yielded notifies the store,
   which re-enters the render mid-pass: the inner pass appended a card, the outer pass appended a
   second into a host it had already emptied. Guarded against re-entrancy in all eight threads.
6. **Pop-out centring used a transform**, which would have trapped the popup layer inside a clipping box.

### The two known issues from the first pass are now fixed

- **Long-message expansion is no longer hover-only.** The expand control is persistently visible at low
  contrast in all eight thread concepts, and hover only raises it. The fade is no longer the sole hint.
- **Cards with Air is no longer disproportionately expensive at 520 px.** Padding, leading and gap
  tighten at narrow width and the role label moves inline onto the first prose line. It now shows about
  nine turns where it previously showed three or four, which puts it in the same range as the
  typographic concepts while keeping the card treatment it exists to test.

## Known issues remaining
- **The gallery mounts sixteen live compositions at once.** It is responsive on this machine, but it is
  the heaviest page in the workspace; the stage and contact sheet are the surfaces to use for close
  inspection.
- **Per-state captured images are not exhaustive.** The 28 feature states are covered by assertions and
  by inspection at the pairings listed in `COVERAGE.md`, not by 28 × 32 individual screenshots.
