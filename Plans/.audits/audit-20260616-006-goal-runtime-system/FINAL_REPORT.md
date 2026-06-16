# audit-20260616-006-goal-runtime-system

Verdict: PASS_WITH_WARNINGS

## Inferred Range

- Ledger: `pldg-20260616-001-goal-runtime-system`
- Baseline ref: `fb7dd9aee5ef21d4244deb74d151d2de15a620ab`
- Current ref: `1ec068474371044488c5ed265732ed5d9dd55234`
- Range: `fb7dd9aee5ef21d4244deb74d151d2de15a620ab..1ec068474371044488c5ed265732ed5d9dd55234`
- Earliest cycle commit: `fbb9c48c1e8bb1aff0ab70dae558d21fb68a7050`
- Evidence: `fbb9c48c1` first adds `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/`; `fb7dd9aee` is its parent. HEAD includes later semantic repair/seal changes.

## Changed Files

- Changed live Plans docs: `Plans/00-plans-index.md`, `Plans/Contracts_V0.md`, `Plans/FinalGUISpec.md`, `Plans/Goal_Runtime_System.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Permissions_System.md`, `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`
- Total changed paths in `Plans/` range: 414
- Audit writes only: `Plans/.audits/audit-20260616-006-goal-runtime-system/*`

## PlanUnit Deltas

- Added: 36
- Changed: 0
- Deleted: 0
- Added IDs: `0PI-055`, `ACD-416`, `ACD-417`, `ACD-418`, `ACD-419`, `CV-286`, `F3-393`, `GRS-001`, `GRS-002`, `GRS-003`, `GRS-004`, `GRS-005`, `GRS-006`, `GRS-007`, `GRS-008`, `GRS-009`, `GRS-010`, `GRS-011`, `GRS-012`, `GRS-013`, `GRS-014`, `GRS-015`, `GRS-016`, `GRS-017`, `GRS-018`, `GRS-019`, `GRS-020`, `GRS-021`, `GRS-022`, `GRS-023`, `GRS-024`, `GRS-025`, `MA-060`, `MS-108`, `PS-114`, `SP-214`

## Changed-Doc Fidelity

- `Plans/00-plans-index.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/Contracts_V0.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/FinalGUISpec.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=intentional_replacement
- `Plans/Goal_Runtime_System.md`: +25 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/Models_System.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/Multi-Account.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/Permissions_System.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/assistant-chat-design.md`: +4 PlanUnits, changed 0, deleted 0; fidelity=none_detected
- `Plans/storage-plan.md`: +1 PlanUnits, changed 0, deleted 0; fidelity=none_detected

Only one live-prose deletion was found: the `FinalGUISpec.md` Settings registry `Models / Providers` row was replaced to add Goal Mode worker/verifier-adjudicator selector routing. No headings, ContractRefs, or PlanUnit blocks were removed.

## Exact-Detail Losses / Drift

Exact semantic fidelity is not clean. `atom_fidelity_matrix.jsonl` contains 61 `missing_or_drift` rows after subagent review.

High-severity themes:
- Whole-goal context/source-target universe behavior is under-transferred in `GRS-004`.
- Assistant Chat exact Goal UI details are compressed in `ACD-416`, `ACD-418`, and `ACD-419`.
- Scheduler continuation/revision event fields are compressed in `GRS-006`.
- Ledger-to-Plans completion criteria are under-specific in `GRS-012`.
- Task-template completion gates are flattened in `GRS-018`.
- Autonomous ambiguity/recovery and blocked explanation details are under-transferred in `GRS-019` / `ACD-417`.

## Reciprocal Lineage

- Cross-owner PlanUnits `CV-286`, `MS-108`, `MA-060`, `PS-114`, and `SP-214` exist in current HEAD but are not reciprocally listed in source atoms' `compiled_output_plan_unit_ids` or the compile queue.
- `PS-114`, `MS-108`, and `SP-214` contain owner-doc terms or field reshaping with weak direct atom support.
- `GRS-025` cites deferred questions only while making accepted runtime-contract claims.

See `planunit_source_claims.jsonl` and risks `SR-011` through `SR-015`.

## Owner Routing

Current live owner placement is mostly coherent: `Goal_Runtime_System` owns runtime/control-plane behavior; `assistant-chat-design` owns chat Goal UI; `FinalGUISpec` owns Settings placement; `Contracts_V0`, `storage-plan`, `Permissions_System`, `Models_System`, and `Multi-Account` own adjacent contract/storage/permission/model/account concerns.

Owner-routing warnings remain:
- `/goal` and `/goal again` are canonicalized in Assistant Chat but absent from `UI_Command_Catalog.md`, `Commands_System.md`, and `Wiring_Matrix.md` command-owner registration.
- `Provider_OpenCode.md` is named as a provider-specific owner/consumer, but no current Goal Runtime hook was found there.
- `MS-108` and `MA-060` are marked `gui_related: true` despite backend policy/resolution ownership and source atoms marked `gui_related: false`.
- `0PI-055` owner hints omit Assistant Chat and Final GUI despite naming them in the owner split.

## Ledger / Governance

Ledger projection status: `fail_projection_drift`.

Confirmed issues:
- Registry/current/handoff/compile_queue under-report owner docs and compiled PlanUnits: they list four owner docs and 31 PlanUnits, while current HEAD adds cross-owner `CV-286`, `MS-108`, `MA-060`, `PS-114`, and `SP-214`.
- Governance/evidence text is stale: old `5036` PlanUnits / `17890` acceptance units versus current `.plan_index` `5041` / `17918`; old shard evidence `888` versus current shard check/report `892`.
- Manifest status remains `compiled` while registry/current/handoff/health represent sealed governance. This appears validator-compatible but projection-inconsistent.
- No active candidates, open questions, open blockers, or ready-for-plan-compile atoms were found. Five deferred questions are explicit and non-blocking.

## Index / Node Readiness

- PlanUnits: `5041`
- Acceptance units: `17918`
- Duplicate PlanUnit IDs: `0`
- Missing `gui_related`: `0`
- Unresolved dependency refs: `0`
- Node readiness: `blocked_compiler_contract_incomplete`
- No WorkNodes created: `true`
- NodeSeed candidate contract: absent/intentionally blocked

## Validators

All required validators passed with no tracked status mutation in the audit environment.

- `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system`: pass; mutation_detected=false
- `python3 scripts/pm-plan-index.py validate`: pass; mutation_detected=false
- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`: pass; mutation_detected=false
- `python3 scripts/pm-plans-verify.py run-gates`: pass; mutation_detected=false
- `python3 scripts/pm-shard-plans.py --check`: pass; mutation_detected=false
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`: pass; mutation_detected=false
- `python3 scripts/pm-plans-verify.py verify-spec-lock`: pass; mutation_detected=false
- `python3 scripts/pm-plans-verify.py validate-evidence`: pass; mutation_detected=false
- `git diff --check`: pass; mutation_detected=false

Environment note: YAML-dependent validators passed with `PYTHONPATH=/private/tmp/pm-py-deps` where PyYAML 6.0.3 is available. Plain `/usr/bin/python3` currently lacks `yaml`, so live reproducibility requires the repo's expected Python dependency environment.

## Forbidden Artifacts

PASS. No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, implementation files, production build tasks, Rust/Slint scaffold, or legacy Iced resurrection were found in the current tree or in `fb7dd9aee..HEAD`.

## Subagent Summary

- Atom exact-fidelity: found real losses across context handling, UI examples, scheduler/revision fields, completion criteria, task templates, ambiguity/recovery, and child-goal UI.
- Reciprocal lineage: found stale projections and one-way lineage for five cross-owner PlanUnits.
- Owner routing: live owner placement mostly coherent, but `/goal`, Provider_OpenCode, `gui_related`, and `0PI-055` owner hints need repair.
- Changed-doc fidelity: 36 added PlanUnits, no changed/deleted PlanUnits, one intentional Settings row replacement.
- Ledger/index/governance: validators pass, but ledger/evidence text under-reports current generated state.
- Forbidden artifacts: clean.
- Validator mutability: no tracked mutation; YAML dependency environment required.

## Semantic Risks

- `SR-001` (high): Whole-goal context and source/target universe behavior is under-transferred.
- `SR-002` (high): Assistant Chat Goal UI exact details are compressed.
- `SR-003` (medium): Chain Wizard invisible-goal examples and legacy-flow correction wording are compressed.
- `SR-004` (high): Scheduler continuation and revision-event fields are compressed.
- `SR-005` (medium_high): Weak-agent risk trigger vocabulary is incomplete.
- `SR-006` (high): Ledger-to-Plans and completion-certification criteria are under-specific.
- `SR-007` (medium_high): Progress fingerprint and child-goal state fields are missing.
- `SR-008` (high): Task-template completion gates are flattened.
- `SR-009` (high): Autonomous ambiguity, recovery, and blocked explanation details are under-transferred.
- `SR-010` (high): Ledger projections under-report actual current owner docs and PlanUnits.
- `SR-011` (high): Cross-owner PlanUnits cite atoms one-way; atoms do not reciprocally list those PlanUnit outputs.
- `SR-012` (medium_high): Some cross-owner PlanUnits import owner-doc terms or reshape fields without direct atom support.
- `SR-013` (medium): Adjacent model/account PlanUnits are marked gui_related true despite backend policy ownership.
- `SR-014` (medium): Provider-specific Goal Runtime owner routing is asserted but not backed by Provider_OpenCode PlanUnits.
- `SR-015` (medium): GRS-025 cites deferred questions only while making accepted runtime-contract claims.
- `SR-016` (low): Node readiness remains blocked by the intentionally incomplete compiler contract.
- `SR-017` (low): Manifest status remains compiled while sealed governance is represented elsewhere.
- `SR-018` (high): /goal activation is canonicalized without command-owner registration.
- `SR-019` (medium_high): Goal event payload schema remains under-specified for implementation readiness.
- `SR-020` (high): Governance/evidence text is stale relative to current generated artifacts.
- `SR-021` (low_medium): 0PI-055 owner_hints omit Assistant Chat and Final GUI despite naming them in the owner split.
- `SR-022` (medium): YAML-dependent validators require the PyYAML environment used by this audit.

## Next Safe Action

Run a narrow semantic/projection repair for `SR-001` through `SR-022`, then regenerate `.plan_index`, migration summaries, shards, evidence, Spec Lock, auto_decisions, and plan_graph through repo scripts only. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

## Compact Repair Prompt

```text
Repair audit audit-20260616-006-goal-runtime-system for ledger pldg-20260616-001-goal-runtime-system. Do not widen into implementation. Fix semantic fidelity risks SR-001..SR-022: restore exact Goal Runtime context/source-target universe behavior; Assistant Chat exact Goal UI labels/examples/pre-goal shaping; Chain Wizard status examples and legacy-flow correction terms; scheduler/revision event fields; weak-agent trigger vocabulary; ledger-to-Plans completion criteria; progress fingerprint and child-goal identity fields; per-template completion gates; autonomous ambiguity/recovery/blocked explanation details; ledger projection owner/PlanUnit counts including CV-286/MS-108/MA-060/PS-114/SP-214; reciprocal atom compiled_output_plan_unit_ids; PS-114/MS-108/SP-214 overclaims/field shape; MS-108/MA-060 gui_related classification; Provider_OpenCode routing hook or narrowing; GRS-025 atom lineage; /goal command owner registration; Goal event payload schema deferral or registration; stale evidence counts; 0PI-055 owner_hints; YAML validator environment. Regenerate generated artifacts only via scripts and rerun validators. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.
```
