# Shard 013: PlanUnits

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L179-L283

Source SHA256: `d24273041bd0358f8c0c529d8a434baca7fb88f5ea5ad322408feaf770edfa2a`

---

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

