# Shard 035: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Permissions_System.md`

Source lines: L8608-L8694

Source SHA256: `f7ef4aa3ba367fa37acea6aafdcd6f0e93d0a38b9258b94fbe891e14cf51aa27`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PS-127 - P0-PLAN-ACT-PERMISSION-BOUNDARY

```yaml
plan_unit_id: PS-127
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  P0-PLAN-ACT-PERMISSION-BOUNDARY (P0) is compiled as canonical Puppet Master intent for Plan/Act/autonomy boundaries must be runtime enforced: Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed. The preserved PM gap/delta is: Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema. The observed external-repo signal remains source-lineage evidence: Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A malicious/buggy tool call with requires_approval=false is still blocked under Plan/Read-only mode.
- Pre-run terminal approval displays command, cwd, mutation class, and effective mode ceiling.
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p0_plan_act_permission_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0008
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0004/P0-PLAN-ACT-PERMISSION-BOUNDARY@line=4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0004/P0-PLAN-ACT-PERMISSION-BOUNDARY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:4
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0008
external_atom_id: extrepo-20260703-0004
source_row_id: P0-PLAN-ACT-PERMISSION-BOUNDARY
priority: P0
finding_family: Plan/Act/autonomy boundaries must be runtime enforced
source_repos:
- cline/cline
- openai/codex
- warpdotdev/warp
target_docs:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/Permissions_System.md
- Plans/Tools.md
- Plans/Run_Modes.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0004
- P0-PLAN-ACT-PERMISSION-BOUNDARY
- P0
- Plan/Act/autonomy boundaries must be runtime enforced
- cline/cline
- openai/codex
- warpdotdev/warp
negative_constraints: []
observed_signal: Cline v4 issue reports plan-mode tasks writing files and running Docker/DB schema changes; Cline issue list includes destructive shell commands running without approval when model emitted requires_approval=false; Codex and Warp both expose approvals/autonomy settings and managed permission profile evolution.
pm_current_coverage: PM has central tool policy engine, permission model, FileSafe, and terminal pre-run approval requirements.
pm_gap_or_delta: Need model-independent enforcement receipt that a plan/autonomy mode cannot be downgraded by model output or adapter schema.
proposal_or_recommendation: >-
  Add AutonomyCeilingReceipt checked after provider/tool parsing but before execution. The runtime, not the model/tool payload, decides whether mutation can proceed.
compile_disposition: create_new_planunit
```

`AutonomyCeilingReceipt` fields: `receipt_id`, `schema_version`, `attempt_id`, `run_id?`, `requested_mode`, `effective_mode`, `ceiling_source_ref`, `tool_call_ref?`, `provider_message_ref?`, `mutation_class`, `decision` (`allow`, `block`, `require_approval`), `blocked_reason_code?`, `permission_snapshot_id`, `created_at_utc`, and `enforcement_point` (`post_parse_pre_execution`). Storage location is the canonical event stream as an `autonomy.ceiling_checked` payload with redb projection by `attempt_id`. Enforcement order is provider/tool parse, schema validation, autonomy ceiling check, permission/FileSafe check, then dispatch.
