# Selected 5.6 Sol Concept — Read-Only Audit Contract

This contract adapts the user's comprehensive Puppet Master audit method to the Assistant Chat selection stage.

## Mission

Determine whether the selected concept is behaviorally complete, coherent, correctly represented, aligned with newest canon, and ready for integration planning.

This is an audit, not a redesign.

Do not edit source files, concepts, PMConcept7, Plans, commands, schemas, wiring, indexes, governance, Usage, Settings, or DRY owners. Do not create replacement concepts. Do not prescribe a preferred layout, metaphor, placement, visual language, or animation. Identify defects, omissions, conflicts, stale canon, integration risks, and failed tests with exact evidence.

## Stage interpretation

- Completed: audit implementation and specification completeness.
- In flight: distinguish tracked unfinished work from untracked omissions.
- Not started is not expected for a selected concept; if declared, audit readiness rather than reporting missing implementation as a defect.

Polish and keyword presence are not proof of completeness.

## Work method

Begin with a bounded audit worklist. Use read-only subagents heavily and in parallel for:

1. live Plans and PlanUnit canon;
2. concept/source/implementation;
3. Commands, wiring, state, schemas, persistence, Permissions/FileSafe, and DRY;
4. external product/open-source research;
5. motion and interaction research;
6. interactive, visual, responsive, theme, state, persistence, and failure testing.

Divide large owner documents by bounded sections or requirement families. Subagents return structured evidence, not the final report. Main agent reconciles conflicts and writes the report.

## Canon discipline

Use current repository state. Live canonical Plans are product canon. Generated shards, evidence bundles, pipeline artifacts, old packets, and historical concepts may provide provenance but are not automatically current requirements.

Search current names, old names, aliases, controls, states, objects, events, commands, schemas, owner and consumer surfaces, Settings, Usage, security, browser, editor, File Manager, Goal, agents, artifacts, and orchestration.

For every contract preserve exact PlanUnit ID, command ID, field/enum, ContractRef, heading, path, and evidence location.

Classify separately:

```text
Plans require behavior the concept lacks
Concept contains unspecified behavior
Plans and concept conflict
Both omit necessary behavior
Work is intentionally pending and tracked
Implementation is broken
External source offers optional comparison
```

Use newer specific supersession when clear and list old canon for retirement. Otherwise report conflict.

## Feature completeness

Inventory normal, selected, active, inactive, disabled, loading, empty, success, failure, blocked, paused, stopped, cancelled, interrupted, resumed, stale, restored, queued, offline, replay, snapshot, and terminal states.

Check first use, ordinary use, dense use, long-running use, very large content, and all meaningful optional combinations.

Test open/close/collapse/expand/resize/dock/pop-out/switch/restore/search/edit/stop/cancel/retry/resume/branch/rewind/redirect/pin/artifact operations and persistence across thread/project/app restart/crash/model change/mount changes.

Verify authoritative state ownership and relationships with providers, Usage, Settings, Goal Runtime, Orchestrator, Crew, Context/Memory/Persona, FileSafe/Permissions, browser/testing/debug, worktrees, resources, artifacts, notifications, and server sync.

For each gap state whether the later solution belongs to product specification, concept, command/event, schema, shared DRY owner, runtime, test contract, or a true user decision.

## Command, wiring, and data contract

Map every meaningful user/system action:

```text
UI source
→ command/event
→ owner
→ payload/validation/idempotency
→ permission/resource gate
→ state/persistence
→ event/receipt
→ UI/Usage/diagnostic projection
→ error/cancel/retry/restore
```

Flag missing/duplicate/conflicting IDs, stale aliases, unreachable commands, no-op concept actions, missing payload/result/error/cancellation/restore, raw enums, unreconstructable state, and duplicate truth owners. Produce a later-update register; do not repair.

## DRY and ownership

Name exact shared owner and consumers. Identify duplicated selector, popup, scrollbar, state calculation, route, persistence, progress, provider, notification, artifact, Goal, or context system. Do not make generic reuse recommendations.

## Interface standards

Audit custom scrollbars; Model/Mode popup family; human labels; SVG-only icons; no emoji; no colored left-edge accents; eight themes; reduced motion; reachable text/controls; collision-safe popups; no clipped layers; and shared behavior consistency. Do not invent accessibility scope beyond current canon, though functional keyboard/focus defects should be reported.

## Research

For a major selected-concept audit, inspect at least 25 current relevant products/projects and 25 motion/interaction sources, counting packet sources only after verifying relevance/currentness. Record source, date/version, inspected behavior, tradeoff, and classification:

```text
confirms PM requirement
likely missing PM state
implementation risk
optional comparison
unsuitable for PM
```

Research does not become canon and does not prescribe art direction.

## Motion audit

Inspect continuity, causality, timing/easing, enter/exit/replacement/reordering, expansion/collapse, loading/interruption/completion, menu origin, scroll/anchor, concurrent activity, reduced motion, performance, layout stability, focus, and whether motion is the sole carrier of meaning.

Describe behavioral defect, not your preferred animation.

## Interactive and visual test matrix

Use actual interactive concept plus automated checks and direct visual inspection.

Test all eight themes; 520/750/975/1200 plus continuous resize; rail/side-panel pressure; dock/pop-out; reduced motion; history states; artifact states; empty/ordinary/dense/very-long; Goal states; question states; offline/reconnect/replay/snapshot; and relevant combinations.

Check clipping, hierarchy, nested containers, moving targets, scroll anchors, z-index, popup collision, contrast/token drift, motion layout shifts, geometry inconsistency, native scrollbar leakage, raw terminology, emoji, colored left accents, missing states, no-op controls, persistence loss, and shallow fixture content.

Record exact configurations. Never claim untested coverage.

## Final report

Return one self-contained report:

1. Verdict: PASS | PASS WITH GAPS | NOT READY | BLOCKED.
2. Scope and declared stage.
3. Sources inspected and exact test matrix.
4. Current-state summary.
5. Requirement coverage matrix.
6. Stable-ID findings with severity, class, evidence, impact, stage interpretation, owner, later action, and product-decision flag.
7. Command/Wiring/schema/DRY register.
8. Interface-standard findings.
9. External research synthesis.
10. Motion/interaction synthesis.
11. Interactive/visual results and untested configurations.
12. Canon-update register: add/clarify/retire, IDs, wiring/schema, ContractRef/DRY work.
13. True unresolved product decisions only.
14. Exact conditions required to pass.
15. Compact integration handoff for PMConcept7, Plans, Commands, Wiring, DRY, runtime, Usage, fixtures, tests, and Slint.

Do not implement, choose another concept, or fill specification gaps with personal design preference.
