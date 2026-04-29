# GUI Rebuild Requirements Checklist (2026-02-23)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0325
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Widget_System.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Add `resolution_kind` and rationale requirements for dismiss/resolve paths.
  - resolution_kind
  - requested/effective Persona display requirements
  - Only hard requirements should force stronger handling.
  - command discoverability does not weaken confirmation requirements
  - Requirements Builder must show effective Persona, selection reason, effective platform/model, and [retired-token-3] unsupported Persona controls for the active stage/pass
  - Add trust-state disclosure or canonical revalidation requirements for exports built from projections.
  - adapters currently have no canonical way to satisfy both requirements at once
  - Align FileManager open-by-identity requirements with the runtime-artifact envelope rather than inventing a parallel artifact-opening identity model.
  - `[retired-token-4]` still conflicts with workflow-required `[retired-token-3]`, but GPT-5.2 also pinned missing `[retired-token-1]`, a Pass-1 scope contradiction around requirements creation, and unresolved `workflow_[retired-token-2]` vs canonical `[retired-token-2]` identity.
  - [retired-token-4]
  - [retired-token-3]
  - [retired-token-1]
  - workflow_[retired-token-2]
  - [retired-token-2]
  - There is still no schema-level place to express argument-contract requirements for subject-open or route-payload commands.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - with `Plans/00-plans-index.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` important as drift-multipliers.
  - Plans/00-plans-index.md
  - with `Plans/00-plans-index.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, and `Plans/Formatters_System.md` also still clearly above the noise floor.
  - Plans/Plugins_System.md
  - Plans/Skills_System.md
  - Plans/Formatters_System.md
  - Remove `requested_persona_id` / `effective_persona_id` from consumer requirements.
  - requested_persona_id
  - effective_persona_id
  - with `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, and `Plans/LSPSupport.md` still clearly active.
  - Plans/LSPSupport.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - promoted-shell command and persistence identity ownership (`Section15`, `FinalGUISpec`, `GUI checklist`, `feature-list`, `newfeatures`)
  - Section15
  - FinalGUISpec
  - GUI checklist
  - feature-list
  - newfeatures
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `Plans/GUI_Rebuild_Requirements_Checklist.md` is now clearly a reconciliation follower, not a source:
  - `cov-034` / `obl-016` remains unresolved because the ledger requires a canonical concern-lifecycle owner section with explicit `active` / `acknowledged` / `resolved` / `dismissed` semantics, `resolution_kind` coverage including `accepted_risk`, and a concern-action confirmation matrix, but the live docs only expose fragments: `Plans/Orchestrator_Page.md:12-13` keeps concern and notification surfaces distinct from health/activity, `Plans/storage-plan.md:294` lists `concern_record.v1`, `Plans/GUI_Rebuild_Requirements_Checklist.md:31` calls for first-class concern lifecycle and lineage, and `Plans/Contracts_V0.md:649` only names `concern` as a routable object. Exact ledger evidence remains at `working_ledger.md:L3070-L3092`, `working_ledger.md:L3170-L3182`, `working_ledger.md:L5990-L6015`, and `working_ledger.md:L6442-L6490`.
  - cov-034
  - obl-016
  - active
  - acknowledged
  - resolved
  - dismissed
  - accepted_risk
  - `Plans/GUI_Rebuild_Requirements_Checklist.md:31`
  - Plans/GUI_Rebuild_Requirements_Checklist.md:31
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-166: Coverage blocker concern lifecycle owner section
- Coverage rows: cov-166
- Fidelity gap refs: cov-166
- Required fidelity items:
- Exact required item: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact required item: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-166: Coverage blocker concern lifecycle owner section` exists in `Plans/GUI_Rebuild_Requirements_Checklist.md`.
- Exact acceptance check: The `cov-166` repair states the exact requirement: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact acceptance check: The `cov-166` repair states the exact requirement: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Exact acceptance check: The `cov-166` repair is in the owner section for `Plans/GUI_Rebuild_Requirements_Checklist.md` and is not only a downstream consumer note.

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
| Docker Manager visibility | Contextual Docker Manager surface shown for Docker-related projects, with `Hide Docker Manage when not used in Project.` defaulting to enabled | `Plans/Containers_Registry_and_Unraid.md`, `Plans/FinalGUISpec.md` |
| Docker Manager breadth | Containers, images, compose, registries, build/bake, Publish / Unraid, networks/volumes/contexts, and project-focused Kubernetes | `Plans/Containers_Registry_and_Unraid.md`, `Plans/newtools.md` |
| DockerHub auth UX | Browser login plus PAT, requested-vs-effective capability display, and disabled-with-explanation controls when capability is partial | `Plans/Containers_Registry_and_Unraid.md`, `Plans/newtools.md` |
| Repo creation safety | Missing-repo creation is explicit, non-bypassable, and distinct from image-push approval | `Plans/Containers_Registry_and_Unraid.md`, `Plans/Permissions_System.md` |
| Orchestrator pivots | Orchestrator exposes `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` with preserved context | `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md` |
| Usage/Ledger linkage | cost-bearing receipts from these surfaces deep-link into canonical Usage/Ledger, not a feature-local cost view | `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

## 2026-03-09 addendum — Artifacts panel and Usage/Ledger linkage

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0326
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - follow `usage_event_ref` to canonical Usage/Ledger identity
  - usage_event_ref
  - `cost_usage` already routes to canonical Usage/Ledger identity
  - cost_usage
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
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

### Concern visibility and filtering

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0328
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - if the preferred candidate is unavailable after capability/provider/model filtering, fall through deterministically to the next candidate
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- [ ] Active concerns are visible to users with execute permission on the execution_unit_context.
- [ ] Escalation stack internals are hidden unless audit mode is active.
- [ ] Help/notification surfaces show concern_id and general guidance without exposing sensitive escalation details.
- [ ] Dismissed concerns are visually distinguished from resolved concerns (see concern_reason rationale in transfer_coverage).

### Approval scope isolation
- [ ] An approval at run scope gates the entire run; child nodes do not bypass it.
- [ ] An approval at node scope gates only that node; sibling nodes proceed independently.
- [ ] An approval at delegated_subagent scope gates the subagent call but not the parent orchestrator.
- [ ] Approval scope is tied to execution_unit_context level, not to concern_id; multiple concerns can exist within the same scope.

### Restart and recovery
- [ ] If a unit restarts (restart_count increments), the blocked_episode_id is preserved and rebound to the same concern_id.
- [ ] The escalation_stack shows all prior attempts; a UI inspection can trace the full recovery path.
- [ ] If runtime identity is unresolvable, escalate to execution_role's escalation chain; do not silently use a default identity.
- [ ] Route fallback (e.g., switching to workspace://project/concern) is logged in the concern record; do not hide route failures.

### Concern cleanup and retention

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0327
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - lane/package complete and no retention reason remains
  - `[retired-token-1]` now has a tighter cleanup contradiction: best-effort prepare/cleanup can still invalidate safe-point prerequisites and mtime-based evidence pruning can cut across attempt-lineage retention requirements.
  - [retired-token-1]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- [ ] Resolved concerns remain visible for inspection but are marked with resolution metadata (resolved_at, resolved_by, resolution_reason).
- [ ] Dismissed concerns are retained per retention policy (default: 7 days, configurable per concern_class).
- [ ] Archived concerns are moved to a separate ledger; do not delete them.
- [ ] Audit log contains a record of every concern lifecycle transition (created, escalated, approved, resolved, dismissed, archived).

ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:ConcernRecord, Primitive:ApprovalScope
