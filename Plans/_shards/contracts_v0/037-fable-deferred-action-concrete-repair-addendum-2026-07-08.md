# Shard 037: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Contracts_V0.md`

Source lines: L20032-L20182

Source SHA256: `4237e1c14fbacb969e3ce54fb0ac2c5742967fe20f28cc6c0acabb7a1241d4a5`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical contract text for deferred non-runtime FABLE rows. It does not create WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not change `buildability_gate_passed`.

### Investigation Context Attachment Contract

Repairs row `sfk-7ec50090ea0b8781484ed25b`.

`InvestigationContextAttachment` fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `attachment_id` | string | yes | Stable id within the parent attempt. |
| `scope_id` | string | yes | The bounded investigation scope. |
| `instruction_scope_ref` | string | yes | Ref to the instruction subset applied to the child context. |
| `attempt_journal_ref` | string | yes | Ref to the append-only attempt journal segment. |
| `parent_summary_ref` | string | yes | Redacted parent summary used by the child. |
| `agents_policy_ref` | string | yes | Ref to the AGENTS.md/rules snapshot. |
| `included_artifact_refs` | array<string> | no | Evidence made visible to the child. |
| `excluded_reason_codes` | array<string> | no | Why candidate material was withheld. |

The four promised mechanisms are therefore concrete: instruction scoping uses `instruction_scope_ref`, attempt journaling uses `attempt_journal_ref`, parent summary uses `parent_summary_ref`, and AGENTS.md enforcement uses `agents_policy_ref`.

### Scheduler Pass Field Name

Repairs row `sfk-987077b2d8d09e719846688d`.

- The canonical wire field is `non_selected_nodes`.
- `non_selected` is a retired source-lineage alias accepted only by migration readers.
- New scheduler pass payloads must use `non_selected_nodes[]` with entries `{ node_id, exclusion_reason_code, dependency_ref?, ready_state }`.

### Usage Cost Adjustment Events

Repairs row `sfk-9e981aa42224e876d0371772`.

- Event family names are `usage.cost_adjusted` and `usage.cost_clamped`.
- `usage.cost_adjusted` payload fields are `event_id`, `project_id`, `run_id?`, `usage_record_id`, `delta_microdollars`, `reason_code`, `source_ref`, `permission_snapshot_id?`, and `created_at_utc`.
- `usage.cost_clamped` payload fields are `event_id`, `project_id`, `run_id?`, `usage_record_id`, `requested_microdollars`, `effective_microdollars`, `clamp_reason_code`, `budget_ref`, and `created_at_utc`.
- Closed `reason_code` values are `provider_reconciliation`, `rounding_correction`, `refund_credit`, `manual_admin_adjustment`, and `redaction_correction`.
- Closed `clamp_reason_code` values are `budget_limit`, `policy_ceiling`, `account_quota`, and `safety_cap`.

### Snapshot Identifier Field Names

Repairs row `sfk-80c0f018eaeeef152d592c97`.

- Persisted payloads must name the permission snapshot field `permission_snapshot_id`.
- Persisted payloads must name model capability snapshots `requested_model_snapshot_id` and `effective_model_snapshot_id`.
- Persisted payloads must name account snapshots `requested_account_snapshot_id` and `effective_account_snapshot_id` when account identity affects interpretation.
- Freeform phrases such as "effective permission snapshot identifier" are prose aliases only and must not appear as wire field names.

### Runtime Continuity And Shared Route Object Model

Repairs row `sfk-ca66bb490466433a5eb1986b`.

- The runtime-continuity contract records spec-level continuity only; it is not executable lifecycle certification.
- Event families: `runtime_continuity.actor_bound`, `runtime_continuity.route_resolved`, `runtime_continuity.redaction_applied`, and `runtime_continuity.replay_checkpointed`.
- Storage keys: `runtime_continuity_record.v1:{project_id}:{continuity_id}` and `route_object.v1:{project_id}:{route_id}`.
- `route_object` fields are `route_id`, `surface_id`, `route_kind`, `target_ref`, `owner_doc_ref`, `permission_snapshot_id?`, `requested_model_snapshot_id?`, `effective_model_snapshot_id?`, `created_at_utc`, and `schema_version`.
- `route_kind` values are `page`, `panel`, `tab`, `modal`, `toast`, `external_uri`, `artifact`, and `command`.

### Governance Runtime Records And Projection Trust

Repairs FABLE row `sfk-382a8aaadd071809899261b5`.

The governance runtime record contract owns the minimum schemas and state machines for corroboration, promotion, graph patch, and projection trust. These records are contract/storage records only; they do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, or PNC-019 evidence.

Shared envelope fields for every record family:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `record_id` | string | yes | Stable id for the concrete record. |
| `record_family` | enum | yes | `corroboration`, `promotion`, `graph_patch`, or `projection_trust`. |
| `project_id` | string | yes | Project scope. |
| `run_id` | string | no | Runtime run scope when applicable. |
| `target_ref` | object | yes | `{ object_kind, object_id, owner_doc_ref }`. |
| `created_by_ref` | string | yes | Actor, worker, verifier, or system ref. |
| `created_at_utc` | string | yes | RFC3339 UTC. |
| `status` | string | yes | Family state from the table below. |
| `evidence_refs` | array<string> | no | Canonical evidence refs. |
| `artifact_refs` | array<string> | no | Artifact refs when the record points to rendered or generated material. |
| `source_refs` | array<string> | no | Source/doc/event refs used to form the record. |
| `superseded_by_record_id` | string | no | Present only after lineage-changing supersession. |
| `schema_version` | string | yes | `pm.governance_runtime_record.v1`. |

Family payloads and state machines:

| Family | Required payload fields | States | Transitions |
| --- | --- | --- | --- |
| `corroboration` | `corroboration_id`, `claim_ref`, `policy_ref`, `required_reviewer_count`, `supporting_reviewer_refs[]`, `dissenting_reviewer_refs[]`, `verdict`, `confidence`, `concern_refs[]?` | `requested`, `collecting`, `confirmed`, `denied`, `downgraded`, `escalated`, `superseded` | `requested -> collecting -> confirmed|denied|downgraded|escalated`; any terminal state may move to `superseded` with lineage. |
| `promotion` | `promotion_id`, `promotion_class`, `source_scope_ref`, `target_scope_ref`, `gate_verdict_ref`, `required_evidence_refs[]`, `hitl_required`, `promotion_receipt_ref?` | `draft`, `eligible`, `paused_hitl`, `approved`, `rejected`, `revoked`, `superseded` | `draft -> eligible -> approved|rejected|paused_hitl`; `paused_hitl -> approved|rejected`; approved records may move to `revoked` or `superseded` only by compensating record. |
| `graph_patch` | `graph_patch_id`, `graph_generation_id`, `patch_kind`, `requested_change_ref`, `affected_node_refs[]`, `decision_ref`, `state_transition_report_ref?`, `concern_refs[]?` | `requested`, `validated`, `applied`, `rejected`, `rolled_back`, `superseded` | `requested -> validated -> applied|rejected`; `applied -> rolled_back|superseded` only with a decision and transition report. |
| `projection_trust` | `projection_id`, `projection_freshness`, `projection_health`, `generation_match`, `canonical_revalidation_required`, `last_revalidated_at_utc?`, `fallback_route_ref?` | `current`, `refreshing`, `stale`, `degraded`, `unavailable` | `current -> refreshing|stale|degraded|unavailable`; non-current states return to `current` only after canonical revalidation evidence. |

Trust-state aliases resolve to `projection_trust` and must not mint a separate state family. Graph-patch, promotion, and corroboration records may nominate or update concerns, but they do not replace concern lifecycle states.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md

### CV-315 - Governance Runtime Record Schemas And State Machines

```yaml
plan_unit_id: CV-315
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Governance runtime records define schemas and state machines for corroboration, promotion, graph_patch, and projection_trust.
  Each record uses a shared governance_runtime_record envelope, family-specific payload fields, closed status values, and
  explicit transitions. Trust-state aliases resolve to projection_trust, and these records remain contract/storage
  specifications rather than runtime certification or WorkNode generation.
gui_related: false
gui_classification_reason: Defines backend governance/runtime records and state machines consumed by GUI/runtime views.
depends_on: [CV-309, CV-314]
unblocks: [N-006, RGV-008]
acceptance_criteria:
  - Corroboration, promotion, graph_patch, and projection_trust each have required payload fields.
  - Each family has closed states and allowed transitions.
  - trust-state aliases resolve to projection_trust rather than a new state family.
  - The contract creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, final manifests, or PNC-019 evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
risk_class: governance_runtime_record_schema_gap
reasoning_tier: high
context_scope: fable_newfeatures_governance_records
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: governance_runtime_record_schema_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1179
  - Plans/.audits/fable-20260706/final_fable_action_state.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "corroboration"
  - "promotion"
  - "graph-patch"
  - "trust state"
negative_constraints:
  - Do not treat these records as PNC-019 runtime lifecycle or clean-room certification evidence.
  - Do not create implementation files, WorkNodes, NodeSeeds, queues, runtime launches, final manifests, or production build tasks.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
```
