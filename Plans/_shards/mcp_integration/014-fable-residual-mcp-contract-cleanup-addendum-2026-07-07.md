# Shard 014: FABLE Residual MCP Contract Cleanup Addendum - 2026-07-07

Source: `Plans/MCP_Integration.md`

Source lines: L2082-L2582

Source SHA256: `ad675a543d57f278f123cf5194b939467ee723efd55a06e81cfd7fa6a5b7827e`

---

## FABLE Residual MCP Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High MCP rows for schema resolver rules, record persistence/versioning, and runtime-call liveness defaults. It does not implement MCP runtime behavior.

### MI-039 - Schema Resolver, Record Persistence, And Liveness Defaults

```yaml
plan_unit_id: MI-039
unit_type: schema_contract
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  MCP tool exposure uses a deterministic schema resolver and persisted record family before tools become model-visible.
  Resolver order is pinned tool override, server-declared schema, cached compatible schema, lazy discovery refresh, then
  blocked schema_unavailable. Runtime liveness defaults define initialize timeout, call timeout, heartbeat, interrupt,
  cache TTL, and synthetic settlement receipts for blocked or timed-out calls.
gui_related: false
gui_classification_reason: MCP schema resolution and liveness defaults are backend integration contracts.
depends_on: [MI-025, MI-032, MI-033, MI-034, MI-035, MI-036, MI-037, MI-038]
unblocks: []
acceptance_criteria:
  - MCPToolSchemaRecord persists record_id, server_id, tool_name, schema_version, schema_sha256, source_kind, discovered_at_ms, expires_at_ms, compatibility_state, and provider_projection_ref?.
  - Resolver returns tool_schema_ref, schema_source, compatibility_state, cache_state, refresh_attempted, blocked_reason_code?, and settlement_receipt_ref?.
  - Schema cache defaults to ttl_ms = 3600000, max_records_per_server = 1000, and eviction order expired, incompatible, least_recently_used.
  - initialize_timeout_ms defaults to 10000, tool_call_timeout_ms defaults to 120000, heartbeat_interval_ms defaults to 15000, and interrupt_grace_ms defaults to 3000.
  - Synthetic ToolSettlementReceipt is emitted for schema_unavailable, timeout, interrupted, heartbeat_lost, server_unhealthy, and provider_schema_budget_exceeded.
  - Record versioning increments schema_version on schema hash change and preserves prior schema refs for audit/replay until retention policy expires.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_mcp_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/MCP_Integration.md
  - Plans/Tools.md
node_compile_hint:
  mode: residual_mcp_schema_liveness_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1030
  - fablereport.md:1031
  - fablereport.md:1032
  - fablereport.md:1033
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "schema resolver"
  - "MCPToolSchemaRecord"
  - "runtime call timeout"
  - "heartbeat"
  - "interrupt"
  - "cache eviction"
  - "synthetic settlement"
negative_constraints:
  - Do not implement MCP server runtime, tool dispatch, WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, or runtime certification evidence.
  - Do not expose an MCP tool to the model with schema_unavailable or incompatible schema state.
owner_hints:
  - Plans/MCP_Integration.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
```

### MI-033 - P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH

```yaml
plan_unit_id: MI-033
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH (P0) is compiled as canonical Puppet Master intent for Lazy MCP/tool catalog without lossy results: Imported external-repo finding extrepo-20260703-0021 / P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH (P0). The preserved PM gap/delta is: Add explicit ToolCatalogSearch/MCPToolCatalogIndex and require eager/lazy/search-selected MCP invocations to share the same rich result parser and no-lossy settlement path. The observed external-repo signal remains source-lineage evidence: OpenCode and Cline users repeatedly report MCP schema/tool lists adding 17k-50k+ tokens before useful work; OpenCode PR #12520 centralizes tool search but review surfaced risk of lazy result paths dropping rich MCP outputs.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Five MCP servers with 100 tools stay below initial context budget
- Lazy-selected tool with image/resource/blob result matches eager invocation settlement
- Permission-filtered catalog entries show omitted/deferred/materialized receipts
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Five MCP servers with 100 tools stay below initial context budget
- Lazy-selected tool with image/resource/blob result matches eager invocation settlement
- Permission-filtered catalog entries show omitted/deferred/materialized receipts
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: p0_mcp_lazy_catalog_shared_result_path
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0025
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0025
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0021/P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH@line=21
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0021/P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0025
external_atom_id: extrepo-20260703-0021
source_row_id: P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH
priority: P0
finding_family: Lazy MCP/tool catalog without lossy results
source_repos:
- anomalyco/opencode
- cline/cline
target_docs:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
owner_hints:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Prompt_Pipeline.md
- Plans/Runtime_Artifacts_Panel.md
preserved_exact_tokens:
- extrepo-20260703-0021
- P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH
- P0
- Lazy MCP/tool catalog without lossy results
- anomalyco/opencode
- cline/cline
negative_constraints: []
observed_signal: 'OpenCode and Cline users repeatedly report MCP schema/tool lists adding 17k-50k+ tokens before useful work; OpenCode PR #12520 centralizes tool search but review surfaced risk of lazy result paths dropping rich MCP outputs.'
pm_current_coverage: Tools and MCP Integration already define central registry, MCP naming/availability/auth, schema caps, managed pooling, no-secrets adapters, degraded surfaces, and permissions.
pm_gap_or_delta: Add explicit ToolCatalogSearch/MCPToolCatalogIndex and require eager/lazy/search-selected MCP invocations to share the same rich result parser and no-lossy settlement path.
compile_disposition: create_new_planunit
```

### MI-034 - P0-MCP-TYPED-PARAM-FIDELITY

```yaml
plan_unit_id: MI-034
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  P0-MCP-TYPED-PARAM-FIDELITY (P0) is compiled as canonical Puppet Master intent for MCP tools/call native JSON type fidelity: Imported external-repo finding extrepo-20260703-0025 / P0-MCP-TYPED-PARAM-FIDELITY (P0). The preserved PM gap/delta is: Add adapter round-trip tests proving booleans/numbers/arrays/objects/nulls preserve native JSON types through all MCP transports and bridge layers. The observed external-repo signal remains source-lineage evidence: Pi MCP client bug converted booleans/numbers to strings, breaking standards-compliant MCP servers.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Boolean true arrives as boolean true at MCP server
- Number 3 arrives as number 3, not string
- Array/object payloads survive plugin/bridge hooks
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Boolean true arrives as boolean true at MCP server
- Number 3 arrives as number 3, not string
- Array/object payloads survive plugin/bridge hooks
risk_class: p0_mcp_tools_and_tool_settlement_hardening
reasoning_tier: high
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: p0_mcp_typed_param_fidelity
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0029
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0029
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0025/P0-MCP-TYPED-PARAM-FIDELITY@line=25
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0025/P0-MCP-TYPED-PARAM-FIDELITY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:5
source_atom_ids:
- atom-0029
external_atom_id: extrepo-20260703-0025
source_row_id: P0-MCP-TYPED-PARAM-FIDELITY
priority: P0
finding_family: MCP tools/call native JSON type fidelity
source_repos:
- earendil-works/pi
target_docs:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Executor_Protocol.md
owner_hints:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/CLI_Bridged_Providers.md
- Plans/Executor_Protocol.md
preserved_exact_tokens:
- extrepo-20260703-0025
- P0-MCP-TYPED-PARAM-FIDELITY
- P0
- MCP tools/call native JSON type fidelity
- earendil-works/pi
negative_constraints: []
observed_signal: Pi MCP client bug converted booleans/numbers to strings, breaking standards-compliant MCP servers.
pm_current_coverage: PM has schema caps and invalid-args pre-dispatch checks.
pm_gap_or_delta: Add adapter round-trip tests proving booleans/numbers/arrays/objects/nulls preserve native JSON types through all MCP transports and bridge layers.
compile_disposition: create_new_planunit
```

### MI-035 - P1-MCP-HEADER-SECRET-HOOKS

```yaml
plan_unit_id: MI-035
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  P1-MCP-HEADER-SECRET-HOOKS (P1) is compiled as canonical Puppet Master intent for Runtime-only MCP credential/header resolution hooks: Imported external-repo finding extrepo-20260703-0026 / P1-MCP-HEADER-SECRET-HOOKS (P1). The preserved PM gap/delta is: Define MCPHeaderResolutionHook: runtime-only, redacted, receipted, data-class labeled, permission-rechecked, cannot widen scope. The observed external-repo signal remains source-lineage evidence: Agent Zero PR adds resolve_mcp_server_headers and settings hooks for credential scanning; useful to avoid monkey-patching but dangerous without secret and permission controls.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Resolved Authorization header never appears in catalog/debug/log/model context
- Hook mutation triggers post-hook permission check
- Hook identity and redaction profile recorded
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Resolved Authorization header never appears in catalog/debug/log/model context
- Hook mutation triggers post-hook permission check
- Hook identity and redaction profile recorded
risk_class: p1_terminal_runtime_hardening
reasoning_tier: standard
context_scope: terminal_runtime
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/Permissions_System.md
- Plans/Plugins_System.md
- Plans/Tools.md
node_compile_hint:
  mode: p1_mcp_header_secret_hooks
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0030
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0030
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0026/P1-MCP-HEADER-SECRET-HOOKS@line=26
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0026/P1-MCP-HEADER-SECRET-HOOKS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:6
source_atom_ids:
- atom-0030
external_atom_id: extrepo-20260703-0026
source_row_id: P1-MCP-HEADER-SECRET-HOOKS
priority: P1
finding_family: Runtime-only MCP credential/header resolution hooks
source_repos:
- agent0ai/agent-zero
target_docs:
- Plans/MCP_Integration.md
- Plans/Permissions_System.md
- Plans/Plugins_System.md
- Plans/Tools.md
owner_hints:
- Plans/MCP_Integration.md
- Plans/Permissions_System.md
- Plans/Plugins_System.md
- Plans/Tools.md
preserved_exact_tokens:
- extrepo-20260703-0026
- P1-MCP-HEADER-SECRET-HOOKS
- P1
- Runtime-only MCP credential/header resolution hooks
- agent0ai/agent-zero
negative_constraints: []
observed_signal: Agent Zero PR adds resolve_mcp_server_headers and settings hooks for credential scanning; useful to avoid monkey-patching but dangerous without secret and permission controls.
pm_current_coverage: MCP Integration has no-secrets adapter projection and OAuth state; Permissions requires post-hook recheck.
pm_gap_or_delta: 'Define MCPHeaderResolutionHook: runtime-only, redacted, receipted, data-class labeled, permission-rechecked, cannot widen scope.'
compile_disposition: create_new_planunit
```

### MI-036 - P1-MCP-TOOL-CATALOG-CACHE

```yaml
plan_unit_id: MI-036
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  P1-MCP-TOOL-CATALOG-CACHE (P1) is compiled as canonical Puppet Master intent for Add lazy/searchable MCP/tool/skill catalog cache with result-path parity: Large MCP catalogs stay under context budget; lazy-selected rich outputs normalize identically to eager invocation; descriptor cache is provider/model/plugin scoped.
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Large MCP catalogs stay under context budget
- lazy-selected rich outputs normalize identically to eager invocation
- descriptor cache is provider/model/plugin scoped.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Large MCP catalogs stay under context budget
- lazy-selected rich outputs normalize identically to eager invocation
- descriptor cache is provider/model/plugin scoped.
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: p1_mcp_tool_catalog_cache
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0048
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0048
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0044/P1-MCP-TOOL-CATALOG-CACHE@line=44
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0044/P1-MCP-TOOL-CATALOG-CACHE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_context_cache_websocket_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0048
external_atom_id: extrepo-20260703-0044
source_row_id: P1-MCP-TOOL-CATALOG-CACHE
priority: P1
finding_family: Add lazy/searchable MCP/tool/skill catalog cache with result-path parity
target_docs:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Prompt_Pipeline.md
owner_hints:
- Plans/Tools.md
- Plans/MCP_Integration.md
- Plans/Prompt_Pipeline.md
preserved_exact_tokens:
- extrepo-20260703-0044
- P1-MCP-TOOL-CATALOG-CACHE
- P1
- Add lazy/searchable MCP/tool/skill catalog cache with result-path parity
negative_constraints: []
proposal_or_recommendation: Large MCP catalogs stay under context budget; lazy-selected rich outputs normalize identically to eager invocation; descriptor cache is provider/model/plugin scoped.
compile_disposition: create_new_planunit
```

### MI-037 - P0-MCP-LIFECYCLE-RUNTIME-LIVENESS

```yaml
plan_unit_id: MI-037
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  P0-MCP-LIFECYCLE-RUNTIME-LIVENESS (P0) is compiled as canonical Puppet Master intent for MCP lifecycle plus runtime-call liveness: Imported external-repo finding extrepo-20260703-0089 / P0-MCP-LIFECYCLE-RUNTIME-LIVENESS (P0). The preserved PM gap/delta is: MCP config/readiness needs runtime call timeout, heartbeat, interrupt, and synthetic settlement receipts. The observed external-repo signal remains source-lineage evidence: OpenCode V2 MCP lifecycle work plus MCP runtime deadlock; Cline hardcoded MCP initialize timeout.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Slow init reports unavailable/configurable timeout
- Hung runtime call synthetic-fails and restores loop
- Interrupt cancels or force-settles pending tool call
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Slow init reports unavailable/configurable timeout
- Hung runtime call synthetic-fails and restores loop
- Interrupt cancels or force-settles pending tool call
risk_class: p0_terminal_runtime_hardening
reasoning_tier: high
context_scope: terminal_runtime
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: p0_mcp_lifecycle_runtime_liveness
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0093
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0093
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0089/P0-MCP-LIFECYCLE-RUNTIME-LIVENESS@line=89
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0089/P0-MCP-LIFECYCLE-RUNTIME-LIVENESS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0093
external_atom_id: extrepo-20260703-0089
source_row_id: P0-MCP-LIFECYCLE-RUNTIME-LIVENESS
priority: P0
finding_family: MCP lifecycle plus runtime-call liveness
source_repos:
- OpenCode
- Cline
preserved_exact_tokens:
- extrepo-20260703-0089
- P0-MCP-LIFECYCLE-RUNTIME-LIVENESS
- P0
- MCP lifecycle plus runtime-call liveness
- OpenCode
- Cline
negative_constraints: []
observed_signal: OpenCode V2 MCP lifecycle work plus MCP runtime deadlock; Cline hardcoded MCP initialize timeout.
pm_gap_or_delta: MCP config/readiness needs runtime call timeout, heartbeat, interrupt, and synthetic settlement receipts.
compile_disposition: create_new_planunit
```

### MI-038 - mcp_lazy_tool_exposure

```yaml
plan_unit_id: MI-038
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  mcp_lazy_tool_exposure (P1) is compiled as canonical Puppet Master intent for mcp_lazy_tool_exposure: Add MCP lazy discovery actions and schema-context budget policy The preserved PM gap/delta is: Need explicit lazy tool exposure to avoid schema prompt bloat The observed external-repo signal remains source-lineage evidence: OpenCode MCP lazy loading PR and v2 config/tool design
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Many-MCP-server context budget test
- provider schema subset tests
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Many-MCP-server context budget test
- provider schema subset tests
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: mcp_lazy_tool_exposure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0112
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0112
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0108/mcp_lazy_tool_exposure@line=108
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0108/mcp_lazy_tool_exposure
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:10
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0112
external_atom_id: extrepo-20260703-0108
source_row_id: mcp_lazy_tool_exposure
priority: P1
finding_family: mcp_lazy_tool_exposure
target_docs:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
owner_hints:
- Plans/MCP_Integration.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
preserved_exact_tokens:
- extrepo-20260703-0108
- mcp_lazy_tool_exposure
- P1
negative_constraints: []
observed_signal: OpenCode MCP lazy loading PR and v2 config/tool design
pm_current_coverage: MCP lazy-load startup and schema caps exist
pm_gap_or_delta: Need explicit lazy tool exposure to avoid schema prompt bloat
proposal_or_recommendation: Add MCP lazy discovery actions and schema-context budget policy
compile_disposition: create_new_planunit
```
