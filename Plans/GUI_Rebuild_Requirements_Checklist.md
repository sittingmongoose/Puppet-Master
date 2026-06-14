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

### GRRC-002 - Checklist Authority, Naming, And Audit Purpose

```yaml
plan_unit_id: GRRC-002
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: The GUI rebuild checklist is the single auditable summary for verifying the 2026-02-23 GUI rebuild handoff requirements against canonical plan documents, under the canonical owner-section requirement, Puppet Master naming rule, DRY rules, Contracts_V0, and Decision_Policy defaults.
gui_related: true
gui_classification_reason: This unit governs a GUI rebuild checklist and its user-facing product verification scope, even though it is mostly authority and naming metadata.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-002 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: checklist_authority_naming_and_audit_purpose
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0004
preserved_exact_tokens:
- GUI Rebuild Requirements Checklist (2026-02-23)
- Canonical owner-section requirements
- Coverage blocker concern lifecycle owner section
- Puppet Master
- legacy naming
- single auditable summary
- 2026-02-23 GUI rebuild handoff requirements
negative_constraints: []
compatibility_only_notes:
- If older naming exists, refer to it only as "legacy naming" and do not quote older names.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md owns checklist verification coverage; referenced SSOT documents own implementation details.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- ContractName:Plans/DRY_Rules.md
- ContractName:Plans/Contracts_V0.md
- ContractName:Plans/Decision_Policy.md
```

### GRRC-003 - Concern States And Resolution Kinds

```yaml
plan_unit_id: GRRC-003
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Checklist verification must prove concern lifecycle states are explicitly active, acknowledged, resolved, and dismissed; resolution_kind includes fixed, accepted_risk, superseded, merged, split, invalidated, obsoleted_by_patch, and obsoleted_by_recovery; accepted_risk is a resolution path and never a dismissal shortcut.
gui_related: false
gui_classification_reason: This unit defines concern lifecycle state and resolution semantics, not visual presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-003 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: concern_states_and_resolution_kinds
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
preserved_exact_tokens:
- active
- acknowledged
- resolved
- dismissed
- resolution_kind
- fixed
- accepted_risk
- superseded
- merged
- split
- invalidated
- obsoleted_by_patch
- obsoleted_by_recovery
negative_constraints:
- accepted_risk must not be treated as a dismissal shortcut.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-004 - Concern Action Confirmation And Identity Boundaries

```yaml
plan_unit_id: GRRC-004
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Checklist verification must distinguish acknowledge, dismiss, resolve, and lineage-edit confirmation paths; each path records rationale and acting authority, concern identity stays distinct from blocked episodes, review findings, annotations, and graph patch requests, and owner, creator, and resolver roles remain separately testable.
gui_related: true
gui_classification_reason: This unit includes user-visible confirmation paths and concern identity behavior on GUI surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-004 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: concern_action_confirmation_and_identity_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
preserved_exact_tokens:
- acknowledge
- dismiss
- resolve
- lineage-edit
- rationale
- acting authority
- blocked episodes
- review findings
- annotations
- graph patch requests
- Owner, creator, and resolver roles
negative_constraints:
- Ownership reassignment must not change concern identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-005 - Orchestrator Blind-spot Verification Scope

```yaml
plan_unit_id: GRRC-005
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Remaining high-value Orchestrator blind spots stay in checklist scope, including Source Control/worktree handshake, widget-system hostability and persistence, command palette, shortcut, context-menu, bulk-action integration, large-graph and many-record performance, multi-run behavior, object text search, escalation beyond in-page alerts, dense records accessibility, and safety confirmation.
gui_related: true
gui_classification_reason: This unit verifies GUI workflows, command surfaces, accessibility, performance, and confirmation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-005 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: orchestrator_blind_spot_verification_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
preserved_exact_tokens:
- Source Control/worktree handshake
- widget-system hostability
- command palette
- shortcut
- context-menu
- bulk-action
- /performance
- multi-run
- /text
- /escalation
- /records
- /confirmation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-006 - Orchestrator Tab Redesign And Tiers Retirement

```yaml
plan_unit_id: GRRC-006
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: 'The Orchestrator tab redesign is explicit: Progress is the widget-hosting operational summary; Seams replaces Tiers as seam-first, package-second, node-on-drill-in hierarchy; Node Graph, Evidence, History, and Ledger remain native tabs; non-Progress Orchestrator widget layouts and Tiers-era identifiers remain migration evidence only.'
gui_related: true
gui_classification_reason: This unit directly governs GUI navigation, tabs, widget hostability, and retired Orchestrator layout behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-006 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: orchestrator_tab_redesign_and_tiers_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
preserved_exact_tokens:
- Progress
- Seams
- Node Graph
- Evidence
- History
- Ledger
- Tiers
- tier_id
- TierChanged
- /Tiers
- Orch/Tiers
- widget_layout:v1:orchestrator:tiers
- widget.tier_tree
- work package
- feature seam
- lane
- promotion
- contamination
- resolution-thread
negative_constraints:
- Orchestrator_Page must retire Tiers and must not restore Tiers as the mental model.
compatibility_only_notes: []
stale_retired_dispositions:
- Non-Progress Orchestrator widget layouts are retired; /Tiers, Orch/Tiers, widget_layout:v1:orchestrator:tiers, widget_layout:v1:orchestrator:evidence, widget_layout:v1:orchestrator:history, widget_layout:v1:orchestrator:ledger, and widget.tier_tree remain migration evidence only.
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-007 - Ledger Paging And Run Graph Performance Targets

```yaml
plan_unit_id: GRRC-007
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Exact record inspection in Ledger uses paging rather than eager full materialization, and Run_Graph_View performance verification covers 500-node render targets, 1000-node stretch targets, 60 fps pan/zoom, layout under 500ms at 500 nodes, and initial load under 1s at 500 nodes.
gui_related: true
gui_classification_reason: This unit defines visible Ledger inspection and Run Graph interaction performance targets.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-007 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: ledger_paging_and_run_graph_performance_targets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
preserved_exact_tokens:
- Ledger
- paging
- exactness
- 500-node render targets
- 1000-node stretch targets
- 60 fps pan
- /zoom
- layout under 500ms
- initial load under 1s
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-008 - Cross-doc Checklist Reference Surfaces

```yaml
plan_unit_id: GRRC-008
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Checklist rows preserve cross-doc references for runtime artifacts, command surfaces, tools and memory-adjacent requirements, container packaging, usage artifacts, and Orchestrator artifacts through both Plans/*.md paths and slash aliases.
gui_related: false
gui_classification_reason: This unit is a cross-document reference and ownership-routing requirement rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-008 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: cross_doc_checklist_reference_surfaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0005
preserved_exact_tokens:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/newtools.md
- Plans/assistant-memory-subsystem.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Document_Packaging_Policy.md
- Plans/usage-feature.md
- /FinalGUISpec.md
- /Runtime_Artifacts_Panel.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Referenced owner docs own implementation details; this checklist verifies their coverage without becoming an alternate owner.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-009 - Orchestrator Tabs And Widget-hostability Verification

```yaml
plan_unit_id: GRRC-009
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: The verification table fails if Tiers remains canonical, if non-Progress Orchestrator tabs remain widget canvases, or if widget hostability extends beyond Dashboard, Usage, and Orchestrator Progress.
gui_related: true
gui_classification_reason: This unit verifies visible Orchestrator tabs and widget-hosting behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-009 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: orchestrator_tabs_and_widget_hostability_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0006
preserved_exact_tokens:
- Orchestrator tabs
- Progress
- Seams
- Node Graph
- Evidence
- History
- Ledger
- Tiers
- Widget hostability
- Dashboard
- Usage
- Orchestrator Progress
negative_constraints:
- Fail if Tiers remains canonical or if Seams, Node Graph, Evidence, History, or Ledger are still treated as widgetized.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-010 - Runtime Identity, Projection, Usage, And Source-open Verification

```yaml
plan_unit_id: GRRC-010
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Verification fails unless runtime approval identity uses run_id, node_id, blocked_sequence, optional attempt_id, and allowed_action_ids; runtime identity display preserves inherited/overridden, requested/effective, honored/skipped/clamped states; projection_freshness and projection_health remain separate; usage correlates by usage_event_ref and runtime attribution; source-open behavior preserves route_target and OpenSubject/OpenFile split.
gui_related: true
gui_classification_reason: This unit verifies user-visible runtime identity, projection state, usage correlation, and source-open behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-010 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: runtime_identity_projection_usage_and_source_open_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0006
preserved_exact_tokens:
- run_id
- node_id
- blocked_sequence
- attempt_id?
- allowed_action_ids[]
- request_id
- tier_id
- allowed_actions[]
- inherited/overridden
- requested/effective
- honored/skipped/clamped
- projection_freshness
- projection_health
- usage_event_ref
- route_target
- OpenSubject
- OpenFile
negative_constraints:
- Fail if request_id, tier_id, or allowed_actions[] remain primary.
- Fail if compact or detailed surfaces collapse runtime identity states.
- Fail if trust is modeled as one overloaded field.
- Fail if path-only open is treated as universal.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-011 - Source Control Boundary And Graph Lineage Verification

```yaml
plan_unit_id: GRRC-011
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Verification preserves a narrow worktree-first Source Control boundary, operational lane/package/seam Orchestrator ownership, and graph patch lineage where patches create new generations and retain superseded visible paths rather than rewriting in place.
gui_related: true
gui_classification_reason: This unit covers user-facing Source Control and graph lineage verification behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-011 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: source_control_boundary_and_graph_lineage_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0006
preserved_exact_tokens:
- Source Control boundary
- narrow worktree-first Source Control
- operational lane/package/seam Orchestrator
- Graph lineage
- graph patches
- new generations
- superseded visible paths
negative_constraints:
- Fail if Source Control becomes lane-first canon or Orchestrator duplicates raw worktree inventory.
- Fail if graph patching still rewrites in place conceptually.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-012 - Instant Grep Rebuild Concurrency Verification

```yaml
plan_unit_id: GRRC-012
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Instant Grep rebuild verification requires regex-index rebuilds to write to a new generation directory, publish the live snapshot through one ArcSwap::store() pointer swap, keep reader queries wait-free on held snapshots, and follow storage-plan and Wiring_Matrix publication contracts.
gui_related: false
gui_classification_reason: This unit defines indexing concurrency and publication semantics, not GUI layout.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-012 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: instant_grep_rebuild_concurrency_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0006
preserved_exact_tokens:
- Instant Grep rebuild concurrency
- Regex-index rebuilds
- new generation directory
- ArcSwap::store()
- reader queries remain wait-free
- Plans/storage-plan.md
- Plans/Wiring_Matrix.md
negative_constraints:
- Fail if an index rebuild mutates the current generation in place, blocks live queries, or bypasses the publication contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-013 - First-class Concern Model Verification

```yaml
plan_unit_id: GRRC-013
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Verification fails if the concern model remains buried in reviews or alerts only; the concern lifecycle and lineage must be first-class.
gui_related: false
gui_classification_reason: This unit defines concern-model verification semantics rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-013 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: first_class_concern_model_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0006
preserved_exact_tokens:
- Concern model
- first-class concern lifecycle
- lineage
- reviews/alerts only
negative_constraints:
- Fail if concerns remain buried in reviews/alerts only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-014 - Command Catalog Coverage

```yaml
plan_unit_id: GRRC-014
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: The command groups introduced by the 2026-02-23 docs must remain listed in the canonical command registry, including widget, graph, Orchestrator preview/open/build, and chat usage popout commands, with coverage in UI_Command_Catalog sections 2.3 through 2.6.
gui_related: true
gui_classification_reason: This unit covers user-facing command palette, shortcut, context-menu, and command registry behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-014 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: command_catalog_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0007
preserved_exact_tokens:
- cmd.widget.*
- cmd.graph.*
- cmd.orchestrator.*
- cmd.orchestrator.preview_open
- cmd.orchestrator.preview_stop
- cmd.orchestrator.open_preview_artifact
- cmd.orchestrator.build_run
- cmd.orchestrator.open_build_artifact
- cmd.chat.compact_context
- cmd.chat.open_usage_popout
- cmd.chat.close_usage_popout
- Plans/UI_Command_Catalog.md
- 2.3 through 2.6
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/UI_Command_Catalog.md owns command registry details; this checklist verifies coverage.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-015 - Checklist Completion Criteria

```yaml
plan_unit_id: GRRC-015
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: The GUI rebuild checklist is complete only when every verification-table row is PASS and verifier gates pass.
gui_related: false
gui_classification_reason: This unit defines checklist completion and validation criteria, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-015 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: checklist_completion_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0008
preserved_exact_tokens:
- Completion Criteria
- PASS
- verifier gates pass
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md'
```

### GRRC-016 - Source Control And GitHub Actions Surface Separation

```yaml
plan_unit_id: GRRC-016
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: 'Source Control and GitHub Actions are separate first-class surfaces: Source Control owns Changes, History, Graph, Worktrees, Branches, and Stash; GitHub Actions owns Current Branch, Workflows, Settings, rerun, cancel, pin, and secrets/variables/environments CRUD.'
gui_related: true
gui_classification_reason: This unit governs visible source-control and hosted-workflow surfaces.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-016 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: source_control_and_github_actions_surface_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- Source Control surface
- Changes
- History
- Graph
- Worktrees
- Branches / Stash
- not merged into GitHub Actions
- GitHub Actions surface
- Current Branch
- Workflows
- Settings
- rerun/cancel/pin
- secrets/variables/environments CRUD
negative_constraints:
- Source Control must not be merged into GitHub Actions.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-017 - Docker Manager Visibility, Breadth, And Ownership

```yaml
plan_unit_id: GRRC-017
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Docker Manager is the contextual canonical container-runtime surface for Docker-related projects, covers containers, images, compose, registries, build/bake, Publish/Unraid, networks, volumes, contexts, and project-focused Kubernetes, and treats the older Hide Docker Manage spelling as a migration alias only.
gui_related: true
gui_classification_reason: This unit directly governs the visible Docker Manager surface and its project-context behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-017 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: docker_manager_visibility_breadth_and_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- Docker Manager
- Hide Docker Manager when not used in Project.
- Hide Docker Manage when not used in Project.
- containers
- images
- compose
- registries
- build/bake
- Publish / Unraid
- networks/volumes/contexts
- project-focused Kubernetes
- container-runtime
- container-related
negative_constraints: []
compatibility_only_notes:
- The older Hide Docker Manage when not used in Project. key is a migration alias only.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns Docker Manager/container-runtime behavior; GUI checklist verifies visibility and breadth.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-018 - DockerHub Auth UX And Repo Creation Safety

```yaml
plan_unit_id: GRRC-018
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: DockerHub auth UX includes browser login plus PAT, requested-vs-effective capability display, and disabled-with-explanation controls for partial capability; missing-repo creation is explicit, non-bypassable, and distinct from image-push approval.
gui_related: true
gui_classification_reason: This unit governs user-visible authentication, disabled-state, and confirmation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-018 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: dockerhub_auth_ux_and_repo_creation_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- DockerHub auth UX
- Browser login plus PAT
- requested-vs-effective capability display
- disabled-with-explanation controls
- partial capability
- Missing-repo creation
- explicit
- non-bypassable
- image-push approval
negative_constraints:
- Missing-repo creation must remain distinct from image-push approval.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-019 - Orchestrator Pivots And Usage/Ledger Deep Links

```yaml
plan_unit_id: GRRC-019
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Orchestrator exposes Open in Source Control, Open in GitHub Actions, and Open in Docker Manager with preserved context, and cost-bearing receipts from these surfaces deep-link into canonical Usage/Ledger rather than feature-local cost views.
gui_related: true
gui_classification_reason: This unit defines visible Orchestrator pivot actions and Usage/Ledger navigation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-019 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: orchestrator_pivots_and_usage_ledger_deep_links
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- Open in Source Control
- Open in GitHub Actions
- Open in Docker Manager
- preserved context
- Usage/Ledger linkage
- cost-bearing receipts
- Show in Ledger
- Show in Usage
- canonical Usage/Ledger
- feature-local cost view
negative_constraints:
- Cost-bearing receipts must not route only to a feature-local cost view.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-020 - GitHub Auth Boundary And Actions Readiness

```yaml
plan_unit_id: GRRC-020
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Git transport auth and GitHub API auth remain separate; github_api tokens never transfer to SSH remotes, GitHub API auth failure is a canonical blocked/runtime condition, and Actions readiness re-evaluates on relevant branch, workflow, settings, dispatch, and secrets/variables/environments events through event-driven plus bounded refresh semantics.
gui_related: true
gui_classification_reason: This unit covers user-visible GitHub auth failure, readiness, and Actions-gated surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-020 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: github_auth_boundary_and_actions_readiness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- Git transport auth
- GitHub API auth
- github_api
- SSH remotes
- canonical blocked/runtime condition
- GitHub Actions > Current Branch
- dispatch forms
- GitHub Actions > Settings
- workflow-file saves
- branch/worktree changes
- secrets/variables/environments CRUD
- event-driven plus bounded refresh
- stale snapshots cannot authorize
negative_constraints:
- github_api tokens never transfer to SSH remotes.
- Stale snapshots cannot authorize Actions-gated Orchestrator steps.
- Readiness is not timer-only or manual-only.
compatibility_only_notes: []
stale_retired_dispositions:
- Actions readiness must be event-driven plus bounded refresh; stale snapshots cannot authorize Actions-gated Orchestrator steps.
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-021 - Runtime Payload Lineage And Legacy Runtime Aliases

```yaml
plan_unit_id: GRRC-021
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Runtime-analysis exports, receipts, artifacts, and runtime blocked payloads reuse scheduler attempt/safe-point/remediation identities and canonical route payload shapes; docker_manage_surface_state migrates into Docker Manager state, allowed_action_ids replaces legacy recovery_options, and legacy runtime aliases remain compatibility evidence only.
gui_related: false
gui_classification_reason: This unit governs runtime payload identity and migration aliases, not visible layout.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-021 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: runtime_payload_lineage_and_legacy_runtime_aliases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- /attempt/safe-point/remediation
- /payload
- docker_manage_surface_state
- allowed_action_ids[]
- recovery_options[]
- runtime-analysis exports
- receipts
- artifacts
negative_constraints:
- Runtime-analysis exports must not create feature-local receipt IDs when canonical attempt/payload identity is available.
compatibility_only_notes:
- 'Runtime payload lineage rows are compatibility-sensitive: legacy recovery_options[] is a migration alias only when it conflicts with allowed_action_ids[].'
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-022 - Stale Proof Text And IA Migration Dispositions

```yaml
plan_unit_id: GRRC-022
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Stale checklist proof text is not a readiness signal; checklist consumers must use first-class Source Control, GitHub Actions, and Docker Manager surfaces, runtime consumers must not become alternate owners, persona references use requested_persona and effective_persona, and older generated-actions-settings, combined Git/GitHub, Docker Manage, and side-panel occupant lists are migration evidence only.
gui_related: false
gui_classification_reason: This unit records stale/compatibility IA dispositions and owner boundaries rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-022 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: stale_proof_text_and_ia_migration_dispositions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0009
preserved_exact_tokens:
- Stale checklist proof text is not a readiness signal
- Source Control
- GitHub Actions
- Docker Manager
- requested_persona
- effective_persona
- generated-actions-settings
- combined Git/GitHub
- Docker Manage
- side-panel occupant lists
- migration evidence only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale checklist proof text is not a readiness signal.
- Older generated-actions-settings, combined Git/GitHub, Docker Manage, and side-panel occupant lists are migration evidence only when they conflict with accepted IA.
owner_boundary_notes:
- Run_Graph_View.md, Orchestrator_Page.md, and GUI_Rebuild_Requirements_Checklist.md are runtime consumers of Source Control, GitHub Actions, and Docker Manager owner docs rather than alternate owners.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md'
split_recommendation_reason: The source span contains multiple checklist atoms with different implementation and GUI surfaces; repeated source lineage preserves exact source provenance without inventing subspans.
```

### GRRC-023 - Derived Evidence Regeneration Constraint

```yaml
plan_unit_id: GRRC-023
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Plans/.evidence/** is not live canon; after GUI rebuild checklist verification, evidence artifacts under Plans/.evidence/** and /.evidence/ must be regenerated from current SSOT docs rather than edited or cited as canonical requirements.
gui_related: false
gui_classification_reason: This unit defines governance/evidence regeneration constraints, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-023 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: derived_evidence_regeneration_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0010
preserved_exact_tokens:
- Plans/.evidence/**
- not live canon
- GUI rebuild checklist verification
- /.evidence/
- re-generate
- re-generated
- current SSOT docs
- edited or cited as canonical requirements
negative_constraints:
- Plans/.evidence/** must not be edited or cited as canonical requirements.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Evidence artifacts are governance outputs; live canon remains in SSOT plan docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-024 - Artifacts Panel And Usage/Ledger Linkage

```yaml
plan_unit_id: GRRC-024
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: The rebuilt GUI checklist verifies the Artifacts panel in view inventory and panel system, single side-panel slot toggling for Git, Docker, Source Control, Unraid, Artifacts, Chat, and Files with last-click wins behavior, and Usage/Ledger linkage from cost_usage artifacts through Show in Ledger and Show in Usage actions.
gui_related: true
gui_classification_reason: This unit governs visible panel inventory, side-panel toggling, and user-facing Usage/Ledger actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-024 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: artifacts_panel_and_usage_ledger_linkage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0011
preserved_exact_tokens:
- Artifacts panel
- FinalGUISpec §7.1
- §4.1
- §5
- Git
- Docker
- Source Control
- Unraid
- Artifacts
- Chat
- Files
- single side-panel slot
- last-click wins
- cost_usage
- Show in Ledger
- Show in Usage
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-025 - Concern Creation, Stable IDs, Episodes, And Escalation Stack

```yaml
plan_unit_id: GRRC-025
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Before shipping the rebuilt Orchestrator GUI, concern lifecycle verification must prove that blocking conditions create concerns, concern_id remains stable across restarts and re-entries unless root cause changes, blocked_episode_id increments monotonically, escalation_stack frames are append-only, and Dismiss /resolve paths record resolution_kind, rationale, and explicit cross-links.
gui_related: false
gui_classification_reason: This unit defines lifecycle identity and audit semantics, not visible presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-025 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: concern_creation_stable_ids_episodes_and_escalation_stack
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0013
preserved_exact_tokens:
- Before shipping the rebuilt Orchestrator GUI
- concern_id
- blocked_episode_id
- escalation_stack
- root-cause changes
- monotonically
- frames are never removed or reordered
- Dismiss `/resolve`
- resolution_kind
- rationale
- explicit cross-linking
negative_constraints:
- A new concern_id is minted only for root-cause changes.
- Escalation stack frames are never removed or reordered.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-026 - Concern Visibility, Filtering, Notification, And Visual Distinction

```yaml
plan_unit_id: GRRC-026
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Before shipping the rebuilt Orchestrator GUI, active concerns must be visible to users with execute permission on execution_unit_context, escalation internals are hidden unless audit mode is active, help/notification surfaces show concern_id and general guidance without sensitive escalation details, and dismissed concerns are visually distinguished from resolved concerns.
gui_related: true
gui_classification_reason: This unit governs visible concern filtering, help/notification surfaces, and visual distinction between dismissed and resolved concerns.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-026 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: concern_visibility_filtering_notification_and_visual_distinction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0014
preserved_exact_tokens:
- active concerns
- execute permission
- execution_unit_context
- audit mode
- Help/notification surfaces
- concern_id
- sensitive escalation details
- Dismissed concerns
- visually distinguished
- resolved concerns
- concern_reason
- transfer_coverage
negative_constraints:
- Escalation stack internals stay hidden unless audit mode is active.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-027 - Approval Scope Isolation And HITL Key Shape

```yaml
plan_unit_id: GRRC-027
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Before shipping the rebuilt Orchestrator GUI, approval scope isolation must prove run-scope approvals gate the entire run, node-scope approvals gate only that node, delegated_subagent approvals gate the subagent call but not the parent orchestrator, approval scope is tied to execution_unit_context, and HITL checkpoint keys are not only checkpoints.hitl.{run_id} or checkpoints.hitl.
gui_related: false
gui_classification_reason: This unit defines approval identity and HITL key semantics, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-027 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: approval_scope_isolation_and_hitl_key_shape
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0015
preserved_exact_tokens:
- run scope
- node scope
- delegated_subagent scope
- execution_unit_context
- concern_id
- checkpoints.hitl.{run_id}
- checkpoints.hitl
- run_id
- approval/blocked scope
negative_constraints:
- HITL checkpoints do not use checkpoints.hitl.{run_id} or checkpoints.hitl as the sole key.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-028 - Restart, Recovery Inspection, Identity Escalation, And Route Fallback

```yaml
plan_unit_id: GRRC-028
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Before shipping the rebuilt Orchestrator GUI, restart and recovery behavior must preserve and rebind blocked_episode_id when restart_count increments, allow UI inspection to trace the full recovery path, escalate unresolvable runtime identity to execution_role escalation, and log route fallback such as workspace://project/concern in the concern record.
gui_related: true
gui_classification_reason: This unit includes UI inspection and visible recovery/fallback behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-028 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: restart_recovery_inspection_identity_escalation_and_route_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0016
preserved_exact_tokens:
- restart_count
- blocked_episode_id
- UI inspection
- full recovery path
- runtime identity
- execution_role
- workspace://project/concern
- route fallback
- concern record
- do not hide route failures
negative_constraints:
- Do not silently use a default identity when runtime identity is unresolvable.
- Do not hide route failures.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

### GRRC-029 - Concern Cleanup, Retention, Archive, And Audit Log

```yaml
plan_unit_id: GRRC-029
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: Before shipping the rebuilt Orchestrator GUI, resolved concerns remain inspectable with resolved_at, resolved_by, and resolution_reason metadata; dismissed concerns are retained by policy with default seven-day configurable retention; archived concerns move to a separate ledger rather than being deleted; and the audit log records every lifecycle transition.
gui_related: false
gui_classification_reason: This unit defines retention and audit-log semantics rather than GUI layout.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through GRRC-029 instead of broad GRRC-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_rebuild_checklist_drift
reasoning_tier: standard
context_scope: gui_rebuild_requirements_checklist_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: concern_cleanup_retention_archive_and_audit_log
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0017
preserved_exact_tokens:
- resolved_at
- resolved_by
- resolution_reason
- dismissed concerns
- 'default: 7 days'
- configurable per concern_class
- Archived concerns
- separate ledger
- do not delete
- Audit log
- created
- escalated
- approved
- resolved
- dismissed
- archived
negative_constraints:
- Archived concerns are moved to a separate ledger; do not delete them.
compatibility_only_notes:
- Audit lifecycle transition wording is preserved for compatibility with the source checklist.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/GUI_Rebuild_Requirements_Checklist.md remains the checklist owner for this verification requirement while implementation ownership follows the referenced owner docs.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:ConcernRecord, Primitive:ApprovalScope'
```

### GRRC-001 - GUI Rebuild Requirements Checklist Retired Source-Preserving Bridge

```yaml
plan_unit_id: GRRC-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: GRRC-001 is retained only as migration-lineage compatibility disposition for the retired GUI_Rebuild_Requirements_Checklist source-preserving bridge. Product coverage has been atomized into GRRC-002 through GRRC-029 or structurally dispositioned, and GRRC-001 must not re-own checklist product spans or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained GRRC PlanUnits.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- GRRC-001 no longer uses source_preserving_planunit compile mode.
- GRRC-002 through GRRC-029 own product coverage for atomized GUI rebuild checklist spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by GRRC-001.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:GUI_Rebuild_Requirements_Checklist-S0020
preserved_exact_tokens:
- GRRC-001
- source_preserving_planunit
- source_preserving_bridge_retired
- GUI Rebuild Requirements Checklist (2026-02-23)
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
- GUI_Rebuild_Requirements_Checklist-S0020
negative_constraints:
- GRRC-001 must not re-own atomized GUI_Rebuild_Requirements_Checklist product coverage.
- GRRC-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- GRRC-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former GRRC-001 source-preserving bridge is retired by Phase 2B batch 080.
owner_boundary_notes:
- GRRC-002 through GRRC-029 own atomized GUI rebuild checklist product coverage.
- GUI_Rebuild_Requirements_Checklist-S0020 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

## Migration Coverage

Original hash: `d24273041bd0358f8c0c529d8a434baca7fb88f5ea5ad322408feaf770edfa2a`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 080 atomized `GUI_Rebuild_Requirements_Checklist-S0001` through `GUI_Rebuild_Requirements_Checklist-S0017` into `GRRC-002` through `GRRC-029`, with dense concern lifecycle, verification-table, and DockerHub/Unraid GUI addendum spans split where safe. `GUI_Rebuild_Requirements_Checklist-S0018`, `GUI_Rebuild_Requirements_Checklist-S0019`, and `GUI_Rebuild_Requirements_Checklist-S0021` are structural owner-map, PlanUnits heading, and Migration Coverage dispositions. `GRRC-001` is retired as migration-lineage compatibility coverage for `GUI_Rebuild_Requirements_Checklist-S0020`; this document has no residual source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### GRRC-030 - Concern Lifecycle Verification Coverage Compile Addendum

```yaml
plan_unit_id: GRRC-030
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  GUI_Rebuild_Requirements_Checklist consumes concern lifecycle, concern routing, approval scope, blocked owner taxonomy, projection trust,
  and action gating as verification coverage. It must not own the implementation contract for concern records or lifecycle fields; those remain
  with Contracts, Orchestrator, storage, HITL, and Final GUI owner docs.
gui_related: true
gui_classification_reason: This checklist verifies GUI rebuild surfaces and user-visible concern lifecycle behavior.
depends_on: [CV-279, OP-020, F3-387]
unblocks: []
acceptance_criteria:
  - Checklist items point to owner docs for concern lifecycle behavior.
  - Verification coverage does not duplicate implementation ownership.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual checklist owner-reference review
risk_class: checklist_owner_drift
reasoning_tier: standard
context_scope: gui_rebuild_verification_coverage
implementation_surfaces: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: verification_coverage_only, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0071
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
preserved_exact_tokens: ["concern lifecycle", "verification coverage", "not implementation ownership", "GUI_Rebuild_Requirements_Checklist"]
negative_constraints:
  - Do not make the checklist the implementation owner for concern lifecycle or blocked-state fields.
owner_hints: [Plans/GUI_Rebuild_Requirements_Checklist.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md]
```
