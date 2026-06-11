# GUI Rebuild Requirements Checklist (2026-02-23)


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Coverage blocker concern lifecycle owner section
> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- GUI REBUILD CHECKLIST

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## Purpose

This checklist is the single auditable summary that verifies the 2026-02-23 GUI rebuild handoff requirements are covered by canonical plan documents.

## Concern lifecycle verification checklist
- [ ] Concern lifecycle states are explicitly `active`, `acknowledged`, `resolved`, and `dismissed`.
- [ ] `resolution_kind` includes `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`.
- [ ] `accepted_risk` is verified as a resolution path and never treated as a dismissal shortcut.
- [ ] Confirmation rules distinguish acknowledge, dismiss, resolve, and lineage-edit actions, and each path records rationale plus acting authority.
- [ ] Concern identity stays distinct from blocked episodes, review findings, annotations, and graph patch requests.
- [ ] Owner, creator, and resolver roles remain separately testable so ownership reassignment does not change concern identity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

Remaining high-value Orchestrator blind spots stay in scope for checklist verification: exact Source Control/worktree handshake, widget-system hostability and persistence, command palette / shortcut / context-menu / bulk-action integration, large-graph and many-record `/performance`, multi-run behavior in one project, object `/text` search across Seams / Graph / Evidence / History / Ledger, notification `/escalation` beyond in-page alerts, accessibility for dense `/records`, and safety `/confirmation` for user-facing actions.

Orchestrator tab redesign is explicit: `Progress` is the widget-hosting operational summary; `Seams` replaces `Tiers` as seam-first, package-second, node-on-drill-in hierarchy; `Node Graph`, `Evidence`, `History`, and `Ledger` remain native tabs; `History` is the chronological runtime story and `Ledger` is structured exact-record inspection.

`Orchestrator_Page` / `Orchestrator_Page.md` must retire `Tiers`, keep only `Progress` widget-composed, treat `Evidence`, `History`, and `Ledger` as native tabs, replace `tier_id` filters with canonical node `/attempt/runtime` identity, and elevate blocked/runtime event sources over request-centric HITL and `TierChanged` assumptions.

Non-Progress Orchestrator widget layouts are retired: `/Tiers`, `Orch/Tiers`, `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, `widget_layout:v1:orchestrator:ledger`, and `widget.tier_tree` remain migration evidence only while active Orchestrator layout uses the current `widget_layout` family.

Impacted Orchestrator rebuild surfaces are `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, and `Plans/GUI_Rebuild_Requirements_Checklist.md` / `/Orchestrator_Page.md`, `/Run_Graph_View.md`, `/Widget_System.md`, and `/GUI_Rebuild_Requirements_Checklist.md`; checklist verification must ensure first-class work package, feature seam, lane, promotion, contamination, and resolution-thread surfaces rather than restoring `Tiers` as the mental model.

Exact record inspection in `Ledger` uses paging: exactness does not require eager full materialization of every record.

`Run_Graph_View` / `Run_Graph_View.md` performance verification covers 500-node render targets, 1000-node stretch targets, 60 fps pan `/zoom`, layout under 500ms at 500 nodes, and initial load under 1s at 500 nodes.

Runtime artifact and command-surface checks reference `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`, `Plans/Runtime_Artifacts_Panel.md`, `/FinalGUISpec.md`, `/UI_Command_Catalog.md`, and `/Runtime_Artifacts_Panel.md`.

Tooling and memory-adjacent checklist rows reference `Plans/newtools.md`, `Plans/assistant-memory-subsystem.md`, `/newtools.md`, and `/assistant-memory-subsystem.md`.

Container packaging checklist rows reference `Plans/Containers_Registry_and_Unraid.md`, `Plans/Document_Packaging_Policy.md`, `/Containers_Registry_and_Unraid.md`, and `/Document_Packaging_Policy.md`.

Usage artifact checklist rows reference `Plans/FinalGUISpec.md`, `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`, `/FinalGUISpec.md`, `/usage-feature.md`, and `/Runtime_Artifacts_Panel.md`.

Orchestrator artifact checklist rows reference `Plans/FinalGUISpec.md`, `Plans/Orchestrator_Page.md`, `Plans/Runtime_Artifacts_Panel.md`, `/FinalGUISpec.md`, `/Orchestrator_Page.md`, and `/Runtime_Artifacts_Panel.md`.

## Verification Table

| Area | Required canonical state | Verification status rule |
|---|---|---|
| Orchestrator tabs | `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger` | Fail if `Tiers` remains canonical or if non-Progress tabs remain widget canvases |
| Widget hostability | Dashboard, Usage, and Orchestrator `Progress` only | Fail if `Seams`, `Node Graph`, `Evidence`, `History`, or `Ledger` are still treated as widgetized |
| Runtime approval identity | blocked-episode identity with `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`, `allowed_action_ids[]` | Fail if `request_id`, `tier_id`, or `allowed_actions[]` remain primary |
| Runtime identity display | inherited/overridden, requested/effective, honored/skipped/clamped | Fail if compact or detailed surfaces collapse these states |
| Projection state | `projection_freshness` and `projection_health` | Fail if trust is still modeled as one overloaded field |
| Usage correlation | `usage_event_ref` and runtime attribution fields | Fail if Orchestrator/Graph/Usage still correlate primarily by `tier_id` |
| Source-open behavior | `route_target`, `OpenSubject`, `OpenFile` split | Fail if path-only open is still treated as universal |
| Source Control boundary | narrow worktree-first Source Control; operational lane/package/seam Orchestrator | Fail if Source Control becomes lane-first canon or Orchestrator duplicates raw worktree inventory |
| Graph lineage | graph patches create new generations and retain superseded visible paths | Fail if graph patching still rewrites in place conceptually |
| Instant Grep rebuild concurrency | Regex-index rebuilds write to a new generation directory and publish the live snapshot through one `ArcSwap::store()` pointer swap; reader queries remain wait-free and continue on their held snapshot | Fail if an index rebuild mutates the current generation in place, blocks live queries, or bypasses the `Plans/storage-plan.md` and `Plans/Wiring_Matrix.md` publication contract |
| Concern model | first-class concern lifecycle and lineage | Fail if concerns remain buried in reviews/alerts only |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md
## Command Catalog Coverage Check

The following command groups introduced by the 2026-02-23 docs are now listed in the canonical command registry:

- `cmd.widget.*`
- `cmd.graph.*`
- `cmd.orchestrator.*`
- `cmd.orchestrator.preview_open`
- `cmd.orchestrator.preview_stop`
- `cmd.orchestrator.open_preview_artifact`
- `cmd.orchestrator.build_run`
- `cmd.orchestrator.open_build_artifact`
- `cmd.chat.compact_context`
- `cmd.chat.open_usage_popout`
- `cmd.chat.close_usage_popout`

REF: `Plans/UI_Command_Catalog.md` sections 2.3 through 2.6.

## Completion Criteria

This checklist is complete when all rows in the verification table are `PASS` and verifier gates pass.

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md

## 2026-03-07 addendum — DockerHub / Unraid GUI requirements

| Requirement | Canonical expectation | Source |
|---|---|---|
| Source Control surface | Separate first-class Source Control surface with Changes, History, Graph, Worktrees, and Branches / Stash; not merged into GitHub Actions | `Plans/GitHub_Integration.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FinalGUISpec.md` |
| GitHub Actions surface | Separate first-class GitHub Actions surface with Current Branch, Workflows, Settings, rerun/cancel/pin, and secrets/variables/environments CRUD | `Plans/GitHub_Integration.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/newtools.md` |
| Docker Manager visibility | Contextual Docker Manager surface shown for Docker-related projects, with `Hide Docker Manager when not used in Project.` defaulting to enabled; the older `Hide Docker Manage when not used in Project.` key is a migration alias only | `Plans/Containers_Registry_and_Unraid.md`, `Plans/FinalGUISpec.md` |
| Docker Manager breadth | Containers, images, compose, registries, build/bake, Publish / Unraid, networks/volumes/contexts, and project-focused Kubernetes | `Plans/Containers_Registry_and_Unraid.md`, `Plans/newtools.md` |
| DockerHub auth UX | Browser login plus PAT, requested-vs-effective capability display, and disabled-with-explanation controls when capability is partial | `Plans/Containers_Registry_and_Unraid.md`, `Plans/newtools.md` |
| Repo creation safety | Missing-repo creation is explicit, non-bypassable, and distinct from image-push approval | `Plans/Containers_Registry_and_Unraid.md`, `Plans/Permissions_System.md` |
| Orchestrator pivots | Orchestrator exposes `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` with preserved context | `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md` |
| Usage/Ledger linkage | cost-bearing receipts from these surfaces deep-link into canonical Usage/Ledger, not a feature-local cost view | `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md` |
| GitHub auth boundary | Git transport auth and GitHub API auth are separate; `github_api` tokens never transfer to SSH remotes, and GitHub API auth failure is a canonical blocked/runtime condition rather than a panel-local refresh | `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md`, `Plans/Permissions_System.md` |
| Actions readiness | Opening `GitHub Actions > Current Branch`, dispatch forms, `GitHub Actions > Settings`, workflow-file saves, branch/worktree changes, and secrets/variables/environments CRUD re-evaluate readiness; readiness is event-driven plus bounded refresh, not timer-only or manual-only, and stale snapshots cannot authorize Actions-gated Orchestrator steps | `Plans/GitHub_Integration.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md` |
| Runtime payload lineage | Runtime-analysis exports, receipts, and artifacts reuse scheduler `/attempt/safe-point/remediation` identities and canonical route `/payload` shapes rather than feature-local receipt IDs; `docker_manage_surface_state` migrates into Docker Manager state, and runtime blocked payloads use `allowed_action_ids[]` rather than legacy `recovery_options[]` | `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/Containers_Registry_and_Unraid.md` |
| Container-runtime ownership | Docker Manager is the canonical `container-runtime` surface for Docker, Podman, Compose, Build / Bake, Registries, Publish / Unraid, and project-focused Kubernetes; a project is `container-related` when any of those owner inputs or persisted runtime receipts exist | `Plans/Containers_Registry_and_Unraid.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

Stale checklist proof text is not a readiness signal. Checklist consumers must use the first-class `Source Control`, `GitHub Actions`, and `Docker Manager` surfaces; `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/GUI_Rebuild_Requirements_Checklist.md` are runtime consumers of those owner docs rather than alternate owners. Persona-related checklist references use canonical `requested_persona` and `effective_persona` naming from runtime contracts. Older generated-actions-settings, combined Git/GitHub, `Docker Manage`, and side-panel occupant lists are migration evidence only when they conflict with the accepted IA above.

## Derived evidence regeneration

`Plans/.evidence/**` is not live canon. After GUI rebuild checklist verification, evidence artifacts under `Plans/.evidence/**` / `/.evidence/` must be re-generate / re-generated from the current SSOT docs rather than edited or cited as canonical requirements.

## 2026-03-09 addendum — Artifacts panel and Usage/Ledger linkage


- [ ] Artifacts panel in view inventory and panel system (FinalGUISpec §7.1, §4.1, §5).
- [ ] Panel toggling: Git, Docker, Source Control, Unraid, Artifacts, Chat, Files (single side-panel slot, last-click wins).
- [ ] Usage/Ledger linkage from cost_usage artifact (Show in Ledger / Show in Usage actions).

## Concern lifecycle verification checklist

Before shipping the rebuilt Orchestrator GUI, verify the following concern lifecycle behaviors:

### Basic concern creation and update
- [ ] A concern is created when an execution unit enters a blocking condition (approval, manual input, error).
- [ ] The concern_id is stable across restarts and re-entries; a new concern_id is only minted for root-cause changes.
- [ ] The blocked_episode_id increments monotonically for each episode within a concern_id.
- [ ] The escalation_stack accumulates frames; frames are never removed or reordered.
- [ ] Dismiss `/resolve` paths record `resolution_kind` and rationale while keeping concerns separate from review findings, annotations, blocked episodes, and recovery records, with explicit cross-linking where relationships exist.

### Concern visibility and filtering


- [ ] Active concerns are visible to users with execute permission on the execution_unit_context.
- [ ] Escalation stack internals are hidden unless audit mode is active.
- [ ] Help/notification surfaces show concern_id and general guidance without exposing sensitive escalation details.
- [ ] Dismissed concerns are visually distinguished from resolved concerns (see concern_reason rationale in transfer_coverage).

### Approval scope isolation
- [ ] An approval at run scope gates the entire run; child nodes do not bypass it.
- [ ] An approval at node scope gates only that node; sibling nodes proceed independently.
- [ ] An approval at delegated_subagent scope gates the subagent call but not the parent orchestrator.
- [ ] Approval scope is tied to execution_unit_context level, not to concern_id; multiple concerns can exist within the same scope.
- [ ] HITL checkpoints do not use `checkpoints.hitl.{run_id}` or `checkpoints.hitl` as the sole key; approval identity includes run_id plus the finer approval/blocked scope.

### Restart and recovery
- [ ] If a unit restarts (restart_count increments), the blocked_episode_id is preserved and rebound to the same concern_id.
- [ ] The escalation_stack shows all prior attempts; a UI inspection can trace the full recovery path.
- [ ] If runtime identity is unresolvable, escalate to execution_role's escalation chain; do not silently use a default identity.
- [ ] Route fallback (e.g., switching to workspace://project/concern) is logged in the concern record; do not hide route failures.

### Concern cleanup and retention


- [ ] Resolved concerns remain visible for inspection but are marked with resolution metadata (resolved_at, resolved_by, resolution_reason).
- [ ] Dismissed concerns are retained per retention policy (default: 7 days, configurable per concern_class).
- [ ] Archived concerns are moved to a separate ledger; do not delete them.
- [ ] Audit log contains a record of every concern lifecycle transition (created, escalated, approved, resolved, dismissed, archived).

ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:ConcernRecord, Primitive:ApprovalScope

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/GUI_Rebuild_Requirements_Checklist.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### GRRC-001 - GUI Rebuild Requirements Checklist (2026-02-23) Source-Preserving PlanUnit

```yaml
plan_unit_id: GRRC-001
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Plans/GUI_Rebuild_Requirements_Checklist.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0017
preserved_exact_tokens:
- GUI Rebuild Requirements Checklist (2026-02-23)
- Canonical owner-section requirements
- Coverage blocker concern lifecycle owner section
- Purpose
- Concern lifecycle verification checklist
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- Verification Table
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md'
- Command Catalog Coverage Check
- Completion Criteria
- 'ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
- 2026-03-07 addendum — DockerHub / Unraid GUI requirements
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
- Derived evidence regeneration
- 2026-03-09 addendum — Artifacts panel and Usage/Ledger linkage
- Basic concern creation and update
- Concern visibility and filtering
- Approval scope isolation
- Restart and recovery
- Concern cleanup and retention
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:ConcernRecord, Primitive:ApprovalScope'
negative_constraints: []
compatibility_only_notes:
- '- If older naming exists, refer to it only as "legacy naming" (do not quote it).'
- '| Runtime payload lineage | Runtime-analysis exports, receipts, and artifacts reuse scheduler `/attempt/safe-point/remediation` identities and canonical route `/payload` shapes rather than feature-local receipt IDs; `docker_manage_surface_state` migrates into Docker Manager state, and runtime blocke'
- '- [ ] Audit log contains a record of every concern lifecycle transition (created, escalated, approved, resolved, dismissed, archived).'
stale_retired_dispositions:
- 'Non-Progress Orchestrator widget layouts are retired: `/Tiers`, `Orch/Tiers`, `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, `widget_layout:v1:orchestrator:ledger`, and `widget.tier_tree` remain migration evidence only while '
- '| Actions readiness | Opening `GitHub Actions > Current Branch`, dispatch forms, `GitHub Actions > Settings`, workflow-file saves, branch/worktree changes, and secrets/variables/environments CRUD re-evaluate readiness; readiness is event-driven plus bounded refresh, not timer-only or manual-only, an'
- Stale checklist proof text is not a readiness signal. Checklist consumers must use the first-class `Source Control`, `GitHub Actions`, and `Docker Manager` surfaces; `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/GUI_Rebuild_Requirements_Checklist.md` are runtime consumers of th
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '### Coverage blocker concern lifecycle owner section'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- This checklist is the single auditable summary that verifies the 2026-02-23 GUI rebuild handoff requirements are covered by canonical plan documents.
- '- [ ] Owner, creator, and resolver roles remain separately testable so ownership reassignment does not change concern identity.'
- '`Orchestrator_Page` / `Orchestrator_Page.md` must retire `Tiers`, keep only `Progress` widget-composed, treat `Evidence`, `History`, and `Ledger` as native tabs, replace `tier_id` filters with canonical node `/attempt/runtime` identity, and elevate blocked/runtime event sources over request-centric '
- '| Area | Required canonical state | Verification status rule |'
- '| Orchestrator tabs | `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger` | Fail if `Tiers` remains canonical or if non-Progress tabs remain widget canvases |'
- '| Source Control boundary | narrow worktree-first Source Control; operational lane/package/seam Orchestrator | Fail if Source Control becomes lane-first canon or Orchestrator duplicates raw worktree inventory |'
- 'The following command groups introduced by the 2026-02-23 docs are now listed in the canonical command registry:'
- '| Requirement | Canonical expectation | Source |'
- '| Usage/Ledger linkage | cost-bearing receipts from these surfaces deep-link into canonical Usage/Ledger, not a feature-local cost view | `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md` |'
- '| GitHub auth boundary | Git transport auth and GitHub API auth are separate; `github_api` tokens never transfer to SSH remotes, and GitHub API auth failure is a canonical blocked/runtime condition rather than a panel-local refresh | `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md'
- '| Runtime payload lineage | Runtime-analysis exports, receipts, and artifacts reuse scheduler `/attempt/safe-point/remediation` identities and canonical route `/payload` shapes rather than feature-local receipt IDs; `docker_manage_surface_state` migrates into Docker Manager state, and runtime blocke'
- '| Container-runtime ownership | Docker Manager is the canonical `container-runtime` surface for Docker, Podman, Compose, Build / Bake, Registries, Publish / Unraid, and project-focused Kubernetes; a project is `container-related` when any of those owner inputs or persisted runtime receipts exist | `'
- Stale checklist proof text is not a readiness signal. Checklist consumers must use the first-class `Source Control`, `GitHub Actions`, and `Docker Manager` surfaces; `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/GUI_Rebuild_Requirements_Checklist.md` are runtime consumers of th
- '`Plans/.evidence/**` is not live canon. After GUI rebuild checklist verification, evidence artifacts under `Plans/.evidence/**` / `/.evidence/` must be re-generate / re-generated from the current SSOT docs rather than edited or cited as canonical requirements.'
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `a4ece25385dcb97fb5de5ab2468b904bf50611f61b2d81fa365045b0417a4ce4`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `GUI_Rebuild_Requirements_Checklist-S0001` through `GUI_Rebuild_Requirements_Checklist-S0017` are preserved in place and mapped in `coverage_map.jsonl` to `GRRC-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
