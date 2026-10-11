# PM7 hover: stationary-return repair, owner verdict (pm7-hover, 2026-10-11)

pm7-hover is the original owner of the PMH source (`Concepts/onboarding/opus-5.5/src/js/18-hover.js`), working in its
claude_me Opus 5.5 xhigh slot. This is landing preparation only: no lock, no main or shared-checkout edits, no landing.

## Verdict

- **The original approved fixes** (`0f1b96f3ba`, `49bcb9841c`; stable source patch ID `f7ae33b54e5708078368340a43b30f4b6ee51f65`)
  are confirmed, carried unchanged. Their patch ID is identical after the rebase onto current main.
- **The proposed supplement** (`hover-return.patch`, SHA-256 `b995077969a1…`, stable patch ID
  `b5d26b9a05f04590bf0cc7b189eef47bbd39c7f6`, authored by pm7-glyphs) is **correct but not sufficient**. It is kept
  unchanged, and its cause analysis (the idle loop; the outgoing page) is right. It misses a third gap, the Usage room's
  entrance moment.
- **The owner repair** is commit `6e14caabf4` ("PMH looks again when a rest ends"), on top of the supplement. It closes
  the gap within the contract the approved source already states: "after a click, a key or a pointerdown the page may
  have changed under a resting pointer ... the next frame looks again at what is under the pointer".
- **Result on current main `cc2371eb29`:** every reached functional check passes, all 7 stationary returns included.
  There are no new census diagnostics. The census stays non-green as on main (see the adjudication below).

## Root cause (measured, not inferred)

P1000 timeline, Glass, exact candidate `f8f85e936c` page (SHA-256 `8e5d976de8ba…`, the worker's artifact). Stationary
pointer on `ov-skyline`'s menu button; Settings by keyboard, then Usage by keyboard. Times are ms after the probe start:

| t (ms) | event | PMH |
|---:|---|---|
| 2159 | `data-pm-page-transition=running` (slide in) | the re-check frame meets the outgoing page |
| 2192 | `data-pmu-moment=arrive` (the Usage room's entrance) | rest (`gestureRest()` true) |
| 2772 | page transition ends: the supplement's re-check | still inside the moment: rest, no hover |
| 4083 | moment ends | **nothing looks again**; the root observer restarted only `if (hover \|\| springs.size)` |
| 7085 | end | hover null, running false, pointer moves 0 |

That is the glyph addendum's hypothesis, now measured. A second, smaller gap: a re-check only re-resolved when the
element under the pointer changed (`under !== hit`). A look taken during a rest therefore kept "no target" for that
same element.

## The repair (`18-hover.js`, +33/-16 against the supplemented file)

1. **A page transition is a rest too** (`html[data-pm-page-transition]`). Nothing hovers while a page slides, and the
   outgoing or sliding page is never hovered at a wrong rect.
2. **When any rest ends** (the moment, the page transition, a body gesture class), the scope and rects are marked
   dirty and one frame looks again (`restEnded()`). The supplement's standalone transition observer is folded into the
   existing root observer, which now also watches `data-pm-page-transition`.
3. **A re-check always re-resolves** the element under the pointer.
4. **`pointerup` re-checks too.** A drag or board operation ends with no click.
5. **The supplement's always-start is kept**, with one refinement: a printable character typed into an input, a
   textarea or a contenteditable starts no frame (no Ctrl, Alt or Meta). Enter, Escape, Tab, shortcuts and keys on
   anything else still re-check, so the keyboard page switch is unchanged. Measured over 40 typed characters with the
   pointer resting on a card: supplement 40-41 frames, about 250 ms total; repair 3 frames, 26 ms; main `cc2371eb29`
   4 frames, 34 ms. Over nothing: repair 0 frames.

No look, effect, timing, token, exemption, tag or build change. The header comment's Rests paragraph now states the
re-check after a rest.

## Results on current main `cc2371eb29` (P1000 GPU, normal admission, one private headless session)

The driver is the worker's own `compare-functional.mjs`, adapted only to open its browser through the shared GPU
helper, take the file names as arguments, and run every check instead of stopping at the first failure. Renderer:
ANGLE (NVIDIA Quadro P1000). Page errors: 0 on both.

| | main `cc2371eb29` (`322fc257b7e6…`) | candidate `e811d7f260` page (`7d4c1b159baa…`) |
|---|---|---|
| Stationary returns: Glass, Retro, NieR, Basic, Friendly, Reduced Basic, Reduced Glass | no hover in all 7, pointer delta 0 | **hover on `ov-skyline` in all 7**, pointer delta 0 |
| Ordinary tag under the actual panel exemption (Glass, Retro, NieR) | pass | pass |
| Menu suppression at a stationary trigger (Glass, Retro, NieR) | **fail** (card stays hovered) | pass |
| Exempt menu row: no tag, no PMH (Glass, Retro, NieR) | pass | pass |
| Settings API writes (4) and UI toggles (2) with the show-tooltips cache | pass (no cache on main) | pass (cache correct) |
| Actual labelled-field exemption | pass | pass |
| Checks | 16 pass, 3 fail | **26 pass, 0 fail** |

Historical, retained: the same matrix against old main `2f91e7a622` gave the identical split (main 7/7 returns
without hover, 3 menu failures; candidate 26/26). Builds on this branch all pass:
- `build.py --publish-pm7` and `--check`;
- `build_rail.py` and `--check`;
- rail `parity.py` (Files 87, Source Control 114, Docker 149, none missing);
- `boards.py --check`, `node --check`, `git diff --check`.

## Census adjudication under the existing contract

The census predicate (`global_hover_tags_source.py` audit) is unchanged by this work. It fails an exemption that is
missing from the registry (`undocumented_exemption`). It also fails any exemption on an actionable control
(`actionable_exemption`): every actionable control must be bound and carry its tag.

| Sample | main `cc2371eb29` | candidate |
|---|---|---|
| Usage menu, each of Glass, Retro and NieR (7 controls) | 7 undocumented + 7 actionable | 7 actionable |
| Settings labelled-field Name input (1) | 1 undocumented + 1 actionable | 1 actionable |
| General Settings dropdowns (18) | 18 undocumented + 18 actionable | 18 undocumented + 18 actionable |

- **No new diagnostic.** The candidate is a strict subset of main's failures. It removes the 22 `undocumented`
  failures that the approved registry entries for `menu` and `labelled-field` were meant to remove (7 per menu sample
  and the 1 field).
- **The remaining failures are pre-existing contract conflicts, owned elsewhere. They are not this change's
  regressions, and no waiver is granted.**
  - The `actionable` failures for `menu` (Usage, `src/js/45-menu.js`) and `labelled-field` (Settings,
    `kit.d/16-pages.js`) exist because those owners exempt actionable controls on purpose, to avoid tags that repeat
    a visible name. That is exactly what the census forbids.
  - `dropdown` is set by the Settings kit (`src/settings/kit.js:100`, `data-pm-hover-exempt="dropdown"` on every
    combobox). It is both undocumented and actionable.
- **Only Jared can resolve these, through the planner,** because either way changes the hover-tag rule or its census
  contract:
  - (a) bind those controls so they carry their own visible names as tags (no exemption), or
  - (b) amend the census contract so a documented exemption may sit on an actionable control that already shows its
    name (`menu`, `labelled-field`, and `dropdown` once registered).

  Owner recommendation: (b), because the reasons in the registry text are what the exemptions were for. That is a
  canon/policy decision. It is not made here.
- **For this landing:** the only census criterion this change can be held to is "no new diagnostics against main",
  and that is met. The census stays non-green before and after.

## Provenance

| Item | Value |
|---|---|
| Base (current main) | `cc2371eb29f3ad227b2f28260bd758c48dcd4560` |
| Branch / head | `fix/pm7-hover-return-20261011` (head: see git log; source repair `6e14caabf4`, pages `e811d7f260`) |
| Original source subset patch ID | `f7ae33b54e5708078368340a43b30f4b6ee51f65` (unchanged) |
| Supplement patch ID | `b5d26b9a05f04590bf0cc7b189eef47bbd39c7f6` (unchanged) |
| Repair patch ID (18-hover.js) | `d26a37e4e968cd9b8008ca94d97eeca739acf981` |
| Full source diff vs `cc2371eb29`, patch ID | `3a5a2c9f95e0c3f569c54384af56e82dd483a679` |
| `18-hover.js` blob / SHA-256 | `c73c6f4d2814d9d4b1b1542c01bb3b9df7d6bb8c` / `56baf1218e4cad1bbd7dedf2bf060620a324a84874988576000c9d1e70737df6` |
| PMConcept7 + TestOpus5.5 (identical) | 18566596 bytes, `7d4c1b159baa85c4974253b332b025ed21a116b0d9f6a50793e245c3898a5814` |
| Evidence | `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-hover-return-20261011/owner-20261011T220644Z/`, `SHA256SUMS` `0bf6ff03989b88c4b3d113c1f2bde98bd4bd6723786a46c06ba6da37ca228424` |

The evidence holds the timeline probe (`diag.mjs`) with the supplement-failure and final timelines, the adapted
matrix driver and its three runs (current main against the final build, plus the two historical runs against
`2f91e7a622`), and the typing-cost probe with its results.

## Remaining before landing

- Planner go and the landing lock, which is the planner's to give.
- The landing check on a full tree at the then-current main. Regenerate the pages if main has moved, and never
  text-merge them.
- The census decision above, which goes to Jared and does not block this change.

Not done here: a governance reseal, canon edits, or any look or effect change.
