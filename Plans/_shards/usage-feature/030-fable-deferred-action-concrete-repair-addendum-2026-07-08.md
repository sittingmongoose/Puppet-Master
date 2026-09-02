# Shard 030: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/usage-feature.md`

Source lines: L5815-L6180

Source SHA256: `4dea9175dadfaebb338bcd2957d53fed33cd25c26d350a63f5169c643f8e78c0`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime usage rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f5e4f21174c14fb661692c70`: legacy `UnifiedUsageRecord` import fields such as `usage_record_id`, `project_id`, `run_id?`, `thread_id?`, `provider_id`, `model_id`, `account_id?`, `input_tokens`, `output_tokens`, `cache_read_tokens?`, `cache_write_tokens?`, `estimated_cost_microdollars`, `final_cost_microdollars?`, `currency`, `usage_source`, `created_at_utc`, and `schema_version` are source-lineage/migration inputs only; active persistence, aggregation, GUI projection, and route/open drill-through normalize them to UF-085 UsageRecord fields, source_class/source_confidence/source_authority, settlement, cost, quota, and refs packets before use.
- Repairs `sfk-08907092c21fff88a8b7c871`: `UsageAnomalyGuard` computes `current_window_cost / max(median_previous_7_windows_cost, 1)` over a default 1-hour window. Default spike ratio threshold is `3.0`; confidence is `min(1.0, observed_samples / 7.0)`.
- Repairs `sfk-829f3e79121c4f7c6355204a`: refresh config key is `usage.refresh_interval_seconds` with default `300`; retention config key is `usage.retention_days` with default `90`. Enforcement occurs during usage projection compaction, not at event ingestion.

### UF-080 - P0-CACHE-USAGE-ENVELOPE

```yaml
plan_unit_id: UF-080
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P0-CACHE-USAGE-ENVELOPE (P0) is compiled as canonical Puppet Master intent for Normalize cache usage/read/write metrics: Usage records expose UF-085 cache buckets (`cache_read`, `cache_write`, and `cache_write_1h` / provider TTL-specific `cache_write_ttl` where exposed) plus cache_reporting_state and cache_miss_reason; the legacy cached_input_tokens source token is preserved only as source-lineage/import alias. UI does not show zero cache as unsupported or vice versa.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Usage records expose cache_read/cache_write/cache_write_1h-or-cache_write_ttl/cache_reporting_state/cache_miss_reason and preserve cached_input_tokens only as source-lineage/import alias.
- UI does not show zero cache as unsupported or vice versa.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Usage records expose cache_read/cache_write/cache_write_1h-or-cache_write_ttl/cache_reporting_state/cache_miss_reason and preserve cached_input_tokens only as source-lineage/import alias.
- UI does not show zero cache as unsupported or vice versa.
risk_class: p0_context_cache_hardening
reasoning_tier: high
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_cache_usage_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0043
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0043
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0039/P0-CACHE-USAGE-ENVELOPE@line=39
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0039/P0-CACHE-USAGE-ENVELOPE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0043
external_atom_id: extrepo-20260703-0039
source_row_id: P0-CACHE-USAGE-ENVELOPE
priority: P0
finding_family: Normalize cache usage/read/write metrics
target_docs:
- Plans/usage-feature.md
- Plans/storage-plan.md
owner_hints:
- Plans/usage-feature.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0039
- P0-CACHE-USAGE-ENVELOPE
- P0
- Normalize cache usage/read/write metrics
- cached_input_tokens
negative_constraints: []
proposal_or_recommendation: Usage records expose cache_read/cache_write/cache_write_1h-or-cache_write_ttl/cache_reporting_state/cache_miss_reason and preserve cached_input_tokens only as source-lineage/import alias; UI does not show zero cache as unsupported or vice versa.
compile_disposition: create_new_planunit
```

### UF-081 - P2-CACHE-OBSERVABILITY-DASHBOARD

```yaml
plan_unit_id: UF-081
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P2-CACHE-OBSERVABILITY-DASHBOARD (P2) is compiled as canonical Puppet Master intent for Add cache observability dashboard and rollups: Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
risk_class: p2_context_cache_coverage
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p2_cache_observability_dashboard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0055
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0055
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0051/P2-CACHE-OBSERVABILITY-DASHBOARD@line=51
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0051/P2-CACHE-OBSERVABILITY-DASHBOARD
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:15
source_atom_ids:
- atom-0055
external_atom_id: extrepo-20260703-0051
source_row_id: P2-CACHE-OBSERVABILITY-DASHBOARD
priority: P2
finding_family: Add cache observability dashboard and rollups
target_docs:
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/usage-feature.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0051
- P2-CACHE-OBSERVABILITY-DASHBOARD
- P2
- Add cache observability dashboard and rollups
negative_constraints: []
proposal_or_recommendation: Per-provider/model/account cache hit/miss/cost savings views expose measured vs estimated vs unsupported states.
compile_disposition: create_new_planunit
```

### UF-082 - P2-CACHE-PRIVACY-POLICY

```yaml
plan_unit_id: UF-082
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P2-CACHE-PRIVACY-POLICY (P2) is compiled as canonical Puppet Master intent for Expose provider cache retention/privacy boundaries: Cache retention policy and org/account boundary shown when available; no unsupported manual cache clearing is promised.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Cache retention policy and org/account boundary shown when available
- no unsupported manual cache clearing is promised.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Cache retention policy and org/account boundary shown when available
- no unsupported manual cache clearing is promised.
risk_class: p2_context_cache_coverage
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: p2_cache_privacy_policy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0058
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0058
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0054/P2-CACHE-PRIVACY-POLICY@line=54
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0054/P2-CACHE-PRIVACY-POLICY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:18
source_atom_ids:
- atom-0058
external_atom_id: extrepo-20260703-0054
source_row_id: P2-CACHE-PRIVACY-POLICY
priority: P2
finding_family: Expose provider cache retention/privacy boundaries
target_docs:
- Plans/Models_System.md
- Plans/usage-feature.md
- Plans/Permissions_System.md
owner_hints:
- Plans/Models_System.md
- Plans/usage-feature.md
- Plans/Permissions_System.md
preserved_exact_tokens:
- extrepo-20260703-0054
- P2-CACHE-PRIVACY-POLICY
- P2
- Expose provider cache retention/privacy boundaries
negative_constraints: []
proposal_or_recommendation: Cache retention policy and org/account boundary shown when available; no unsupported manual cache clearing is promised.
compile_disposition: create_new_planunit
```

### UF-083 - P1-USAGE-ANOMALY-QUOTA-GUARD

```yaml
plan_unit_id: UF-083
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P1-USAGE-ANOMALY-QUOTA-GUARD (P1) is compiled as canonical Puppet Master intent for Token/cost anomalies and quota protection: Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution. The preserved PM gap/delta is: PM needs anomaly detection separate from ordinary usage collection. The observed external-repo signal remains source-lineage evidence: OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Provider usage null uses estimator and marks confidence.
- Sudden token/cost jump pauses or confirms under policy.
- User sees why cost was blocked/allowed.
- Cache-miss churn on stable tasks is reported as optimization warning.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Provider usage null uses estimator and marks confidence.
- Sudden token/cost jump pauses or confirms under policy.
- User sees why cost was blocked/allowed.
- Cache-miss churn on stable tasks is reported as optimization warning.
risk_class: p1_provider_capability_and_metadata_hardening
reasoning_tier: standard
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p1_usage_anomaly_quota_guard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0069
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0069
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0065/P1-USAGE-ANOMALY-QUOTA-GUARD@line=65
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0065/P1-USAGE-ANOMALY-QUOTA-GUARD
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:11
source_atom_ids:
- atom-0069
external_atom_id: extrepo-20260703-0065
source_row_id: P1-USAGE-ANOMALY-QUOTA-GUARD
priority: P1
finding_family: Token/cost anomalies and quota protection
source_repos:
- OpenCode
- Cline
- Codex
- Agent Zero
target_docs:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/usage-feature.md
- Plans/Models_System.md
- Plans/Goal_Runtime_System.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0065
- P1-USAGE-ANOMALY-QUOTA-GUARD
- P1
- Token/cost anomalies and quota protection
- OpenCode
- Cline
- Codex
- Agent Zero
negative_constraints: []
observed_signal: OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.
pm_current_coverage: usage-feature has UsageRecord and context breakdown surfaces; Provider_OpenCode maps usage_update into normalized usage events; Goal Runtime exposes max_tokens and usage_limited.
pm_gap_or_delta: PM needs anomaly detection separate from ordinary usage collection.
proposal_or_recommendation: 'Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution.'
compile_disposition: create_new_planunit
```

### UF-084 - P2-OTEL-EXPORT-OPTIONAL-ADAPTER

```yaml
plan_unit_id: UF-084
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P2-OTEL-EXPORT-OPTIONAL-ADAPTER (P2) is compiled as canonical Puppet Master intent for Observability export interoperability: Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so. The preserved PM gap/delta is: External observability should be supported without making OTLP canonical or leaking sensitive content. The observed external-repo signal remains source-lineage evidence: Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Exporter can be disabled globally/project.
- Export failure produces degraded status only.
- Redacted projection schema is documented and validated.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Exporter can be disabled globally/project.
- Export failure produces degraded status only.
- Redacted projection schema is documented and validated.
risk_class: p2_cross_system_runtime_contracts_coverage
reasoning_tier: standard
context_scope: cross_system_runtime_contracts
implementation_surfaces:
- Plans/usage-feature.md
- Plans/storage-plan.md
- Plans/Provider_OpenCode.md
node_compile_hint:
  mode: p2_otel_export_optional_adapter
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0076
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0076
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0072/P2-OTEL-EXPORT-OPTIONAL-ADAPTER@line=72
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0072/P2-OTEL-EXPORT-OPTIONAL-ADAPTER
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:18
source_atom_ids:
- atom-0076
external_atom_id: extrepo-20260703-0072
source_row_id: P2-OTEL-EXPORT-OPTIONAL-ADAPTER
priority: P2
finding_family: Observability export interoperability
source_repos:
- Pi
- OpenCode
- Codex
target_docs:
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/Provider_OpenCode.md
owner_hints:
- Plans/storage-plan.md
- Plans/usage-feature.md
- Plans/Provider_OpenCode.md
preserved_exact_tokens:
- extrepo-20260703-0072
- P2-OTEL-EXPORT-OPTIONAL-ADAPTER
- P2
- Observability export interoperability
- Pi
- OpenCode
- Codex
negative_constraints: []
observed_signal: Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.
pm_current_coverage: "Seglog is PM\u2019s canonical source; usage/analytics rollups exist."
pm_gap_or_delta: External observability should be supported without making OTLP canonical or leaking sensitive content.
proposal_or_recommendation: 'Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so.'
compile_disposition: create_new_planunit
```
