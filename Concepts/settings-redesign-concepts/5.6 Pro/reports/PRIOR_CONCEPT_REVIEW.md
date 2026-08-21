# Prior Assistant Concept Review

The failed work was not limited to `5-6-sol`. This sweep inventories the other assistant concept implementations called out in the review: CursorAuto, Fable, GLM 5.2, Kimi, Kimi-K3, Opus 5, Qwen 5.8, and 5-6-sol. Their source, evidence, reports, and available screenshots were treated as a requirement-recovery and failure-analysis corpus—not as a design foundation.

## Inventory

| Concept | Located path | Source files | Screenshots | Videos | Reports/data |
|---|---|---:|---:|---:|---:|
| 5-6-sol | `not found` | 0 | 0 | 0 | 0 |
| CursorAuto | `not found` | 0 | 0 | 0 | 0 |
| fable | `not found` | 0 | 0 | 0 | 0 |
| glm-5-2 | `not found` | 0 | 0 | 0 | 0 |
| kimi | `not found` | 0 | 0 | 0 | 0 |
| kimi-k3 | `not found` | 0 | 0 | 0 | 0 |
| Opus 5 | `not found` | 0 | 0 | 0 | 0 |
| Qwen 5.8 | `not found` | 0 | 0 | 0 | 0 |

## Cross-concept findings

- The earlier work optimized for independent novelty and mechanical requirement counts rather than a coherent PMConcept7-derived assistant.
- Multiple concepts introduced spatial metaphors, timelines, spines, stages, folios, or other structures that consumed scarce horizontal space and weakened ordinary transcript reading.
- Passing click/screenshot matrices did not prevent basic visual defects: clipping, incorrect overlay ownership, hover-dependent content, panel collision, and menu/submenu separation.
- Requirements were fragmented across concept-local implementations instead of one shared state and command contract, making feature parity and mix-and-match review unreliable.
- Demo fixtures often proved that a label existed rather than showing a complete user workflow with restoration, editor handoff, artifact identity, and durable state.
- The new 5.6 Pro lab therefore keeps one shared PMConcept7-derived shell and state model, isolates experimentation to seven renderer families, and gates packaging on rendered geometry, scrolling, interaction, and motion evidence.

## Feature-presence inventory (not a quality score)

| Concept | Timeline/spine | Folio/stage | Switcher | History | Work | Questions | Activity | Visuals | Motion refs |
|---|---|---|---|---|---|---|---|---|---|
| 5-6-sol | — | — | — | — | — | — | — | — | — |
| CursorAuto | — | — | — | — | — | — | — | — | — |
| fable | — | — | — | — | — | — | — | — | — |
| glm-5-2 | — | — | — | — | — | — | — | — | — |
| kimi | — | — | — | — | — | — | — | — | — |
| kimi-k3 | — | — | — | — | — | — | — | — | — |
| Opus 5 | — | — | — | — | — | — | — | — | — |
| Qwen 5.8 | — | — | — | — | — | — | — | — | — |

## Disposition

- **Retained:** useful fixture scenarios, requirement clues, reference-path corrections, and any deterministic test idea that survived independent review.
- **Reimplemented:** history, selectors, menus, Working Animation, Activity Bar, questions/decisions, artifacts, editor handoff, resizing, and demo controls under a shared contract.
- **Rejected:** unrelated application metaphors, timeline/spine transcript structures, duplicated shells, concept-local fake behavior, and tests that treated DOM presence as visual certification.
- **Deferred:** production Plan normalization and native Rust/Slint implementation until a preferred component mix is selected.

Contact sheets for any available prior screenshots are retained under `evidence/prior-concepts/` for side-by-side review.
