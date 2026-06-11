---
name: pm-bootstrap-planning-ledger
description: Use when Jared says Start/Continue/Use PM ledger, spec a feature with the ledger, compile a ledger to Plans, standardize Plans, generate PlanUnit indexes, generate node-readiness reports, or seal governance. Keeps long planning conversations durable without making the ledger canon.
---

# PM Bootstrap Planning Ledger Skill

## Purpose
Use the v2 file-backed Bootstrap Planning Ledger while Puppet Master's native Chain Wizard / Goal Mode ledger service is not built yet.

The ledger is durable planning/source memory for long feature-spec conversations. It is not assistant memory, not Plan Mode, not canonical Plans prose, and not a replacement for `Plans/**` canon.

## Read order
For normal continuation, read only:
1. `Plans/ledgers/v2/ledger_registry.json`
2. `Plans/ledgers/v2/<ledger_id>/state/handoff.json`
3. `Plans/ledgers/v2/<ledger_id>/state/current.json`
4. `Plans/ledgers/v2/<ledger_id>/state/open_items.json`
5. `Plans/ledgers/v2/<ledger_id>/state/operating_capsule.json`

Do not read full `events.jsonl`, legacy `working_ledger.md`, or source shards unless a state file points to a specific source_ref that must be inspected.

## New feature-spec conversation
When Jared starts a feature spec with the ledger:
1. Allocate `ledger_id = pldg-YYYYMMDD-NNN-<slug>`.
2. Create `Plans/ledgers/v2/<ledger_id>/` from the v2 file layout.
3. Ask/answer normally in chat; Goal Mode is not required for the conversational design phase.
4. After every substantive turn, update `events.jsonl`, touched `records/*.jsonl`, and `state/*.json` projections.
5. Preserve exact tokens, negative constraints, examples, owner hints, stale/retired terms, compatibility-only terms, and user corrections.
6. Automatically classify every design atom as `gui_related: true|false`. Jared does not need to identify GUI work.

`gui_related=true` means the item involves GUI, UI, screens, pages, panels, forms, layout, styling, visual components, icons, SVGs, images, screenshots, or user-visible visual presentation. Use `false` for backend/router/governance/docs logic, even when the logic mentions GUI routing but is not itself GUI implementation work.

## Compile ledger to Plans
Use Goal Mode for compile/audit/migration phases. Before compiling:
1. Validate the ledger.
2. Refuse false completion if open blockers, unresolved high-level questions, unclassified candidates, or unresolved contradictions remain.
3. Convert accepted design atoms into PlanUnits.
4. Every PlanUnit must include `gui_related: true|false`.
5. Write/update live non-pipeline `Plans/**` docs only.
6. Keep source evidence as ledger/source refs; canonical evidence must point to live Plans docs after the edit.
7. Do not update Spec Lock or generated governance artifacts until explicit governance seal.

## Plan standardization and node readiness
Plan docs must become layout-standardized and PlanUnit-addressable without losing content. PlanUnits are the bridge:

`ledger design atom -> PlanUnit -> PlanUnit index -> node-readiness report -> future NodeSeed/WorkNode compiler`

The current bootstrap may generate a PlanUnit index and node-readiness report. It must not create WorkNodes or executable build tasks. NodeSeed candidates wait until `Plans/Plan_To_Node_Compilation.md` defines that contract.

## Required stop conditions
Stop and write exact blockers if:
- lossless conversion cannot be proven;
- a validator cannot be repaired safely;
- Spec Lock/governance would be touched before the seal phase;
- content would be deleted or semantically changed without source coverage;
- WorkNodes would be created before the WorkNode compiler contract exists;
- a true product decision is needed.
