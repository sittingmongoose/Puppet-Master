# Shard 037: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Contracts_V0.md`

Source lines: L20004-L20062

Source SHA256: `d75342a0adf56068a535bc560b486459d6bc630978d13cd73972912ee05c6462`

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
