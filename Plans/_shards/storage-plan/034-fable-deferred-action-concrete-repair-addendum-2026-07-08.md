# Shard 034: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/storage-plan.md`

Source lines: L16648-L16759

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical storage spec text for deferred non-runtime FABLE rows. It does not certify runtime lifecycle behavior, does not create WorkNodes, NodeSeeds, queues, implementation files, runtime artifacts, build tasks, final manifests, or PNC-019 receipts, and does not mark `buildability_gate_passed` true.

### GUI Startup Restore Keys

Repairs row `sfk-047b362fce3b487a9bce5d6b`.

- Canonical startup restore keys are `hotreload_state.v1:{project_id}` and `onboarding_state.v1:{project_id}`.
- Compatibility aliases `hotreload_state:v1:{project_id}` and `onboarding:v1` may be read only during migration and must be rewritten to the canonical dotted-version keys on the next successful settings save.
- `hotreload_state.v1` fields are `project_id`, `workspace_tab_id?`, `last_successful_reload_at_utc?`, `reload_generation`, `watched_root_refs[]`, `last_error_code?`, and `schema_version`.
- `onboarding_state.v1` fields are `project_id`, `onboarding_version`, `completed_step_ids[]`, `dismissed_prompt_ids[]`, `provider_setup_state`, `first_run_completed_at_utc?`, and `schema_version`.
- These keys are GUI state and onboarding state only; they cannot carry runtime liveness, certification, or PNC-019 evidence.

### Terminal Storage Family Reconciliation

Repairs row `sfk-6e2bf4e4dd077d9ae2743668`.

- The terminal key families listed as required for promoted terminal behavior are materialized in `Plans/storage_value_registry.json` as later GUI/feature projection storage contracts, not as launch-critical buildability evidence.
- Minimum canonical family names are `terminal_workspace_state.v1`, `terminal_section_record.v1`, `terminal_tab_record.v1`, `terminal_pane_record.v1`, `terminal_leaf_pane_record.v1`, `terminal_workgroup_record.v1`, `editor_terminal_panel_state.v1`, `terminal_session_record.v1`, and `terminal_command_block.v1`.
- Each family has a materialized registry row, an inline closed value schema, a schema ref, retention/compaction text, and a no-secret redaction rule.
- These rows restore layout, session identity refs, and historical command-block metadata only. They do not prove terminal process liveness, do not authorize runtime reuse without revalidation, and do not close PNC-019 or any buildability gate by themselves.

### Retired Unversioned Baseline Keys

Repairs row `sfk-a01710fdfad63d1badf4fbaf`.

- Unversioned baseline keys such as `run:<run_id>`, `node:<node_id>`, and `attempt:<attempt_id>` are retired compatibility aliases.
- New canonical storage keys must use `{family}.v1:{scope}:{id}` or a more specific versioned key named by the owning value family.
- Reads of an unversioned alias must produce `alias_read = true`, `canonical_key`, and `migration_required = true`; writes to unversioned aliases are forbidden outside a migration test fixture.

### Permission Snapshot Storage Retention

Repairs row `sfk-64e6f7bf2d7cc266e318d39b`.

- `permission_snapshot_record.v1:{project_id}:{snapshot_id}` stores immutable permission evidence for attempts and blocked episodes.
- Storage owns retention only; nested permission fields and enums remain owned by `Plans/Permissions_System.md`.
- Retention rule: keep all snapshots referenced by live `attempt_record`, `blocked_projection`, HITL receipts, or audit receipts indefinitely; keep unreferenced snapshots for at least 90 days; after 90 days they may be compacted only into a redacted hash summary preserving `snapshot_id`, `created_at_utc`, `policy_hash`, and `decision_summary`.
- A snapshot referenced by `attempt_record.permission_snapshot_id` must never be hard-deleted while that attempt record remains queryable.

### Governance Runtime Record Storage

Repairs FABLE row `sfk-382a8aaadd071809899261b5`.

Governance runtime records persist the contract families defined by `Plans/Contracts_V0.md#CV-315`.

Canonical storage keys:

- `governance_record.v1:{project_id}:corroboration:{corroboration_id}`
- `governance_record.v1:{project_id}:promotion:{promotion_id}`
- `governance_record.v1:{project_id}:graph_patch:{graph_patch_id}`
- `projection_trust_record.v1:{project_id}:{projection_id}`

Storage rules:
- records are append-verified through seglog before redb projection updates
- redb projections may expose current summaries, but mutation authority requires either `projection_trust.status = current` or direct canonical revalidation
- `projection_freshness` and `projection_health` remain the storage-owned trust fields; `trust-state` is a compatibility alias for the combined `projection_trust` record
- graph-patch application history preserves `graph_generation_id`, `decision_ref`, and `state_transition_report_ref` so previous generations remain historical rather than erased
- promotion, corroboration, graph-patch, and projection-trust records can reference concern records, but they do not replace concern lifecycle ownership

### SP-233 - Governance Runtime Record Storage Binding

```yaml
plan_unit_id: SP-233
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage binds governance runtime records from Contracts_V0 CV-315 to durable keys for corroboration, promotion,
  graph_patch, and projection_trust. Seglog remains the source of truth; redb projections expose current summaries.
  trust-state is a compatibility alias for projection_trust, and non-current trust states require direct canonical
  revalidation before mutation/export authority.
gui_related: false
gui_classification_reason: Defines backend storage keys and projection trust, not visual layout.
depends_on: [CV-315]
unblocks: [N-006, RGV-008]
acceptance_criteria:
  - Corroboration, promotion, graph_patch, and projection_trust have versioned storage keys.
  - Seglog is the source of truth and redb projections are derived.
  - Stale, degraded, or unavailable projection trust blocks mutation/export authority until direct canonical revalidation.
  - The storage binding creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, final manifests, or PNC-019 evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
risk_class: governance_runtime_storage_gap
reasoning_tier: high
context_scope: fable_newfeatures_governance_records
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: governance_runtime_record_storage_binding
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
  - Do not treat these storage keys as runtime lifecycle certification or clean-room proof.
  - Do not create implementation files, WorkNodes, NodeSeeds, queues, runtime launches, final manifests, or production build tasks.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
