# Shard 022: PlanUnits

Source: `Plans/Provider_OpenCode.md`

Source lines: L710-L3367

Source SHA256: `d87c86177284c5689c95d0cf397d7b45fdb59b47f7390403643bff096b6f697f`

---

## PlanUnits

### PO-002 - Server-Bridged Transport Authority

```yaml
plan_unit_id: PO-002
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode is server-bridged only: Puppet Master communicates through HTTP REST plus SSE via the unified Provider facade and must not run OpenCode as a CLI-bridged runtime transport.
gui_related: false
gui_classification_reason: This unit defines provider transport authority rather than visual presentation.
split_recommended: false
depends_on:
  - "CV-090"
  - "CBP-003"
unblocks: []
acceptance_criteria:
  - "Server-Bridged Transport Authority remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_server_bridge_transport
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0003"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0004"
preserved_exact_tokens:
  - "OpenCode"
  - "server-bridged only"
  - "HTTP REST + SSE"
  - "unified Provider facade"
  - "MUST NOT run OpenCode as a CLI-bridged runtime transport"
  - "ProviderTransport = ServerBridge"
  - "transport = \"http\""
  - "server_credentials"
  - "/provider/auth"
negative_constraints:
  - "OpenCode runtime transport is not optional when OpenCode is enabled; PM must not use OpenCode as a CLI-bridged runtime transport."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#21-provider-transport-taxonomy, ContractName:Plans/CLI_Bridged_Providers.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PO-003 - PM Native Terminology Boundary

```yaml
plan_unit_id: PO-003
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  PM keeps PM-native terminology for tools, runtime identity, and provider routing; OpenCode terms may be referenced for alignment or external context but cannot replace PM canonical owner vocabulary or provider-capability ownership.
gui_related: false
gui_classification_reason: This unit defines terminology and ownership boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "PM Native Terminology Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_terminology_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0006"
preserved_exact_tokens:
  - "websearch"
  - "webfetch"
  - "requested_persona"
  - "effective_persona"
  - "/web-tool"
  - "native for all"
negative_constraints:
  - "OpenCode consumer text must not flatten provider capability differentiation to native for all or replace PM-native ownership boundaries."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Tools.md"
  - "Plans/Contracts_V0.md"
```

### PO-004 - Runtime Identity Recovery And Approval Scope Key

```yaml
plan_unit_id: PO-004
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode runtime identity recovery keeps OpenCode session IDs in provider-native correlation fields, preserves canonical thread_id, defines approval_scope_key across actor/lane/run/account or server-profile context, and carries runtime identity through shared attempt, blocked-state, usage, and handoff records.
gui_related: false
gui_classification_reason: This unit defines runtime identity and approval-scope data shape rather than visual presentation.
split_recommended: true
depends_on:
  - "PO-002"
  - "CBP-005"
unblocks: []
acceptance_criteria:
  - "Runtime Identity Recovery And Approval Scope Key remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_identity_recovery_gap
reasoning_tier: standard
context_scope: provider_opencode_identity_recovery
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_identity_recovery
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0008"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0009"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0010"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0011"
preserved_exact_tokens:
  - "approval_scope_key"
  - "actor"
  - "lane/package/run"
  - "account/server-profile context"
  - "thread_id"
  - "run_id"
  - "message_id"
  - "event_id"
  - "attempt_id"
  - "blocked_reason_code"
  - "allowed_action_ids[]"
  - "safe_point_id"
  - "replan_generation"
  - "OpenCode thread_id collision"
  - "provider-native correlation"
negative_constraints:
  - "OpenCode session IDs must live in provider-native correlation fields and never replace canonical thread_id."
preserved_contractrefs: []
compatibility_only_notes:
  - "Compatibility-era fields such as resume_url? remain drift evidence rather than canonical OpenCode runtime identity."
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/storage-plan.md"
```

### PO-005 - OpenCode Server Model And Runtime Boundary

```yaml
plan_unit_id: PO-005
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Puppet Master connects to OpenCode as a client of its local OpenAPI 3.1 HTTP API and SSE stream, treats OpenCode as provider-agnostic upstream configuration, and keeps CLI path input as launcher/discovery fallback rather than runtime transport.
gui_related: false
gui_classification_reason: This unit defines server architecture and runtime boundary rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "OpenCode Server Model And Runtime Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_server_model
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0012"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0013"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0014"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0015"
preserved_exact_tokens:
  - "opencode serve"
  - "OpenAPI 3.1"
  - "http://127.0.0.1:4096"
  - "/doc"
  - "REST endpoints"
  - "SSE event stream"
  - "Puppet Master connects to OpenCode as a client"
  - "launcher/discovery fallback only"
  - "run transport remains HTTP/SSE"
negative_constraints:
  - "Puppet Master does not use SDK launch flows or CLI run transport for OpenCode runtime calls."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-006 - Server Profile Connection Contract

```yaml
plan_unit_id: PO-006
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode connection is profile-driven with Managed Server and Attach to Existing Server modes, one-or-many connection_profile_id runtime surfaces, per-profile sidecar state, frozen profile selection before execution, and distinct PM ownership rules for launch versus attached endpoints.
gui_related: false
gui_classification_reason: This unit defines server profile connection data and ownership rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-005"
unblocks: []
acceptance_criteria:
  - "Server Profile Connection Contract remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_server_profile_connection
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0016"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0017"
preserved_exact_tokens:
  - "Server Profile"
  - "Managed Server"
  - "Attach to Existing Server"
  - "connection_profile_id"
  - "/profiles/<connection_profile_id>/"
  - "pm/state.json"
  - "pm/logs/"
  - "pm/projections/"
  - "pm/backups/"
  - "OPENCODE_CONFIG_DIR"
  - "long-lived"
  - "last-mile"
  - "attached-server"
  - "External / Not Managed"
negative_constraints:
  - "All runtime calls remain HTTP/SSE server-bridge calls regardless of whether PM launched the process."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Multi-Account.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "Plans/FinalGUISpec.md"
```

### PO-007 - Health Discovery State Machine

```yaml
plan_unit_id: PO-007
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode profile readiness evaluates connection or launch state, health check result, then discovery refresh result; profiles become Ready only after health and discovery succeed, degraded connected states preserve last-known provider/model/auth facts, and attached profiles may remain externally managed.
gui_related: false
gui_classification_reason: This unit defines backend health/discovery state semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-006"
  - "CV-125"
unblocks: []
acceptance_criteria:
  - "Health Discovery State Machine remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_health_discovery_state
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0018"
preserved_exact_tokens:
  - "Configured"
  - "Launching"
  - "Connecting"
  - "Connected"
  - "Discovering"
  - "Ready"
  - "Connected (stale discovery)"
  - "Connected (discovery failed)"
  - "Disconnected"
  - "Launch failed"
  - "ExternalNotManaged"
  - "Connected in OpenCode"
  - "stale-state"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md"
stale_retired_dispositions:
  - "Connected (stale discovery) and explicit stale-state labels preserve last-known provider/model/auth facts after failed refresh."
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-008 - Health Status Projection

```yaml
plan_unit_id: PO-008
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  GUI/status projections may label grouped provider/model/auth readiness as /models/auth or /discovery/auth and must keep explicit /stale labeling when cached discovery snapshots are reused after failed refresh.
gui_related: true
gui_classification_reason: This unit preserves GUI/status projection and stale-state labels for OpenCode profiles.
split_recommended: false
depends_on:
  - "PO-007"
unblocks: []
acceptance_criteria:
  - "Health Status Projection remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_health_status_projection
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0018"
preserved_exact_tokens:
  - "/models/auth"
  - "/discovery/auth"
  - "/stale"
  - "GUI/status projections"
  - "last-known provider/model/auth facts"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
```

### PO-009 - Server Provider Auth Realm Mapping

```yaml
plan_unit_id: PO-009
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode has separate server-level auth and provider-level auth realms: PM sends configured server credentials to OpenCode endpoints and treats upstream provider auth as OpenCode-managed provider-native auth exposed by /provider/auth and callback endpoints.
gui_related: false
gui_classification_reason: This unit defines auth realm mapping rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-006"
  - "CV-125"
unblocks: []
acceptance_criteria:
  - "Server Provider Auth Realm Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_auth_realm_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0019"
preserved_exact_tokens:
  - "Server-level auth"
  - "OPENCODE_SERVER_PASSWORD"
  - "username/password"
  - "Provider-level auth"
  - "/provider/auth"
  - "OAuth/callback endpoints"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Multi-Account.md"
```

### PO-010 - Sign-In Refresh And Version Diagnostics

```yaml
plan_unit_id: PO-010
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When a user chooses Sign in for an unconnected OpenCode provider, PM deep-links or opens OpenCode provider auth flows, refreshes provider/model discovery through GET /provider, records server version from health checks, and emits version_mismatch diagnostics when required while continuing best-effort operation.
gui_related: true
gui_classification_reason: This unit includes user-visible Sign in flow handling and diagnostics.
split_recommended: false
depends_on:
  - "PO-009"
unblocks: []
acceptance_criteria:
  - "Sign-In Refresh And Version Diagnostics remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_signin_version_diagnostics
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0019"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0020"
preserved_exact_tokens:
  - "Sign in"
  - "GET /provider"
  - "OpenCode server version"
  - "diagnostic(category=\"version_mismatch\")"
  - "best-effort operation"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-011 - Provider Envelope Identity Correlation

```yaml
plan_unit_id: PO-011
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode maps into the unified Provider facade while preserving PM lineage fields and expanded ProviderRequestEnvelope identity, including run/thread/parent/child lineage, attempt identity, execution role, requested/effective runtime descriptors, permission refs, working-directory/worktree identity, prompt parts, retry/approval context, normalized output/correlation IDs, and additive provider-native session IDs.
gui_related: false
gui_classification_reason: This unit defines provider envelope identity and correlation fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-004"
  - "CBP-005"
  - "CV-090"
unblocks: []
acceptance_criteria:
  - "Provider Envelope Identity Correlation remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_envelope_identity_correlation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0021"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "ProviderRequestEnvelope"
  - "thread_id"
  - "run_id"
  - "parent_run_id"
  - "child_run_id"
  - "attempt_id"
  - "execution role"
  - "requested/effective runtime/provider/model/account descriptors"
  - "permission/tool-policy snapshot refs"
  - "working-directory or worktree identity"
  - "provider-native session ids"
  - "setCacheKey"
negative_constraints:
  - "PM must not rewrite thread_id into an OpenCode session id."
  - "OpenCode provider-session identifiers remain provider-native correlation metadata; they never replace PM thread_id, run_id, parent_run_id, child_run_id, or attempt lineage."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Models_System.md"
  - "Plans/storage-plan.md"
```

### PO-012 - Discovered Upstream Provider Identity Facts

```yaml
plan_unit_id: PO-012
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode provider discovery records upstream provider entries as discovered OpenCode facts, keeps runtime platform opencode distinct from upstream provider/model namespaces, treats Alibaba-family, MiniMax, Z.AI, Codex, and Copilot observations as data, and does not invent provider entries absent discovery or owner contract evidence.
gui_related: false
gui_classification_reason: This unit defines provider discovery identity facts rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
unblocks: []
acceptance_criteria:
  - "Discovered Upstream Provider Identity Facts remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_discovery_identity
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "opencode"
  - "anthropic/..."
  - "google/..."
  - "anthropic/claude-sonnet-*"
  - "/claude-sonnet-"
  - "alibaba"
  - "alibaba-cn"
  - "DASHSCOPE_API_KEY"
  - "MiniMax"
  - "Z.AI"
  - "https://docs.bigmodel.cn/cn/coding-plan/overview"
  - "OpenCode-native skill tool behavior"
negative_constraints:
  - "PM must not invent a separate alibaba-coding-plan OpenCode provider entry unless discovery or an owner contract later proves it exists."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-013 - Boot Refresh Discovery Status Surface

```yaml
plan_unit_id: PO-013
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  On app boot-refresh, PM refreshes OpenCode provider/model discovery in the background, keeps last-known connected upstream models visible until refresh finishes, and reports progress or per-provider failure in the shell /status-bar without blocking runtime selection.
gui_related: true
gui_classification_reason: This unit defines visible status-bar progress and failure reporting.
split_recommended: false
depends_on:
  - "PO-012"
unblocks: []
acceptance_criteria:
  - "Boot Refresh Discovery Status Surface remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_boot_refresh_status_surface
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "boot-refresh"
  - "last-known connected upstream models"
  - "shell /status-bar"
  - "per-provider failure"
  - "runtime selection"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
```

### PO-014 - Provider Cache Metadata Boundary

```yaml
plan_unit_id: PO-014
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode cache/request metadata is adapter evidence, not PM storage canon: setCacheKey and options.setCacheKey remain session-scoped provider cache metadata, store=false does not imply durable PM storage, provider.ts request-shape behavior does not imply transcript deletion, and provider-specific cache markers remain provider evidence.
gui_related: false
gui_classification_reason: This unit defines cache/storage boundary constraints rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
unblocks: []
acceptance_criteria:
  - "Provider Cache Metadata Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_cache_metadata_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "setCacheKey"
  - "options.setCacheKey"
  - "session-scoped provider-side cache metadata"
  - "store = false"
  - "provider.ts"
  - "Azure"
  - "store=true"
  - "/content-level"
  - "#9803"
negative_constraints:
  - "PM must not infer durable PM storage from OpenCode store=false or provider request metadata."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/storage-plan.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
```

### PO-015 - Session To Run Lifecycle Constraint

```yaml
plan_unit_id: PO-015
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode child sessions map to PM child runs without replacing them; provider task_id and parentID remain additive provider handles, adapter shorthands normalize into canonical task-tool launch paths, parent-mediated question/HITL handling stays PM-owned, and retry/reroute/resume/replacement semantics remain PM-owned.
gui_related: false
gui_classification_reason: This unit defines lifecycle ownership constraints rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
unblocks: []
acceptance_criteria:
  - "Session To Run Lifecycle Constraint remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_session_to_run_lifecycle
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0023"
preserved_exact_tokens:
  - "task_id"
  - "parentID"
  - "@agent-name"
  - "agent-name"
  - "parent-mediated question/HITL handling"
  - "/message-board"
  - "retry, reroute, resume, and replacement semantics"
  - "completed disposable children"
negative_constraints:
  - "OpenCode child-session behavior is not evidence for native peer-to-peer subagent messaging or PM message-board behavior."
  - "Completed disposable children are not durable reusable actors merely because OpenCode can reopen session history."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-016 - Normalized Event SSE Stream Mapping

```yaml
plan_unit_id: PO-016
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode response parts and SSE bus events map into PM normalized provider events for text_delta, thinking_delta, tool_use, tool_result, usage, error, and done, with PM subscribing to GET /event after prompt_async and emitting done when the session reaches completed or failed.
gui_related: false
gui_classification_reason: This unit defines event normalization rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
  - "CBP-003"
  - "CV-090"
unblocks: []
acceptance_criteria:
  - "Normalized Event SSE Stream Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_sse_event_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0024"
preserved_exact_tokens:
  - "text_delta"
  - "thinking_delta"
  - "tool_use"
  - "tool_result"
  - "usage"
  - "input_tokens"
  - "output_tokens"
  - "error"
  - "done"
  - "success"
  - "failed"
  - "GET /event"
  - "prompt_async"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-017 - Auth State Failover Mapping

```yaml
plan_unit_id: PO-017
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode emits canonical auth_state events from server and provider auth realms, maps health and provider auth failures to LoggedOut, LoggedIn, AuthFailed, or AuthExpired as appropriate, and uses PM failover reason codes without expanding the auth state enum.
gui_related: false
gui_classification_reason: This unit defines auth state and failover mappings rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-009"
  - "CV-125"
unblocks: []
acceptance_criteria:
  - "Auth State Failover Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_auth_state_failover_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0025"
preserved_exact_tokens:
  - "auth_state"
  - "LoggedOut"
  - "LoggedIn"
  - "AuthFailed"
  - "AuthExpired"
  - "GET /global/health"
  - "ProviderAuthError"
  - "rate_limited"
  - "provider_outage_or_network"
  - "hard_exhaustion_failover"
  - "rate_limit_failover"
  - "auth_failure_failover"
  - "provider_outage_failover"
  - "transport_failure_failover"
negative_constraints:
  - "Upstream rate-limit/outage errors must not expand the auth state enum."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md#AuthState"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-018 - Adapter Policy And Copilot Constraints

```yaml
plan_unit_id: PO-018
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode-specific adapter behavior preserves PM requested/effective runtime and capability disclosure, keeps provider-native agent files and invocation syntax in the interoperability lane, supports additive provider correlation, preserves prompt-cache separation, avoids fake-user replay continuity, and keeps Copilot-sensitive billing/classification metadata from weakening PM strict-deny policy.
gui_related: false
gui_classification_reason: This unit defines adapter policy and routing constraints rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
  - "PO-014"
unblocks: []
acceptance_criteria:
  - "Adapter Policy And Copilot Constraints remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_adapter_policy_constraints
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0026"
preserved_exact_tokens:
  - "provider-native agent files"
  - "provider-native invocation syntax"
  - "interoperability lane"
  - "prompt-cache-friendly separation"
  - "OpenCode PR #14203"
  - "x-initiator"
  - "Copilot-sensitive requests"
  - "strict-deny rule"
  - "Copilot-compatible"
negative_constraints:
  - "Adapter-specific billing or caching evidence from OpenCode does not satisfy the Copilot TOS constraint."
  - "OpenCode-specific behavior must preserve PM policy constraints rather than silently overriding them."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md"
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-019 - Dynamic Model Discovery Source

```yaml
plan_unit_id: PO-019
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Puppet Master discovers OpenCode models through GET /provider, including all/default/connected provider data, and preserves OpenCode compound model IDs in providerID/modelID format as the source for dynamic model discovery.
gui_related: false
gui_classification_reason: This unit defines model discovery source data rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-006"
unblocks: []
acceptance_criteria:
  - "Dynamic Model Discovery Source remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_dynamic_model_discovery
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0027"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0028"
preserved_exact_tokens:
  - "GET /provider"
  - "all"
  - "default"
  - "connected"
  - "anthropic"
  - "openai"
  - "providerID/modelID"
  - "anthropic/claude-sonnet-4-5-20250514"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-020 - OpenCode Model Picker Behavior

```yaml
plan_unit_id: PO-020
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  The OpenCode model picker fetches models on provider enable and refresh, displays only models from connected providers, groups by OpenCode provider, caches with a configurable five-minute default TTL, and uses the shared Provider-contract model selection UI without OpenCode-specific picker logic beyond the discovered source.
gui_related: true
gui_classification_reason: This unit defines GUI model picker behavior.
split_recommended: false
depends_on:
  - "PO-019"
unblocks: []
acceptance_criteria:
  - "OpenCode Model Picker Behavior remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_model_picker
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0029"
preserved_exact_tokens:
  - "model picker"
  - "GET /provider"
  - "connected"
  - "Group models by OpenCode provider"
  - "default: 5 minutes"
  - "Provider-contract model selection UI surface"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-021 - ACP Effort Capability Gate

```yaml
plan_unit_id: PO-021
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  ACP model listings may supply IDs, names, and descriptions, but PM must obtain or infer effort capability from the shared provider capability matrix before presenting effort controls as supported.
gui_related: true
gui_classification_reason: This unit governs visible effort-control eligibility.
split_recommended: false
depends_on:
  - "PO-020"
unblocks: []
acceptance_criteria:
  - "ACP Effort Capability Gate remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_effort_capability_gate
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0029"
preserved_exact_tokens:
  - "ACP model listing"
  - "IDs/names/descriptions"
  - "effort-capability"
  - "shared provider capability matrix"
  - "effort controls"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-022 - ACP Usage Update Mapping

```yaml
plan_unit_id: PO-022
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When ACP agent streams emit usage_update, PM maps it into the shared provider usage event shape with input/output/reasoning/cache token breakdown plus cost while preserving ACP as the source protocol rather than an OpenCode-only GUI counter.
gui_related: false
gui_classification_reason: This unit defines usage event normalization rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-020"
unblocks: []
acceptance_criteria:
  - "ACP Usage Update Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_acp_usage_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0029"
preserved_exact_tokens:
  - "usage_update"
  - "input/output/reasoning/cache"
  - "cost"
  - "shared provider usage event shape"
  - "OpenCode-only GUI counter"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/usage-feature.md"
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
```

### PO-023 - No Hardcoded Fallback Models

```yaml
plan_unit_id: PO-023
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  If dynamic OpenCode model discovery fails because the server is unreachable, PM must not hardcode fallback OpenCode models and instead surfaces the configured discovery error because available models depend entirely on user OpenCode configuration and authenticated providers.
gui_related: false
gui_classification_reason: This unit defines discovery failure behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-019"
unblocks: []
acceptance_criteria:
  - "No Hardcoded Fallback Models remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_no_fallback_models
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0030"
preserved_exact_tokens:
  - "Cannot discover models — OpenCode server unreachable."
  - "DRY_Rules.md#2-dont-duplicate-canonical-contracts"
  - "Decision_Policy.md§4"
negative_constraints:
  - "Puppet Master MUST NOT hardcode fallback models for OpenCode."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, PolicyRule:Decision_Policy.md§4"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-024 - Capability SSOT And Mode Agent Mapping

```yaml
plan_unit_id: PO-024
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode capability flags stay SSOT in platform_specs; transport remains HTTP server-bridged, plan mode uses the read-only OpenCode plan agent, execute mode uses the build agent, and OpenCode-native capability aliases normalize into shared provider capability fields before routing or model-effort UI consumption.
gui_related: false
gui_classification_reason: This unit defines capability metadata and mode-agent mapping rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "Capability SSOT And Mode Agent Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_capability_mode_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0031"
preserved_exact_tokens:
  - "platform_specs.rs"
  - "transport remains http"
  - "mode=plan"
  - "plan agent"
  - "mode=execute"
  - "build agent"
  - "supportsParallelTools"
  - "supportsAssistantMessagePrefill"
  - "maxPayloadSize"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs, PolicyRule:Decision_Policy.md§4, ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-025 - Provider Tool Capability Reporting

```yaml
plan_unit_id: PO-025
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode-discovered tools from GET /provider and session tool lists report through capabilities.get with category provider_tool and the shared enabled/disabled_reason/setup_hint shape so agents and users can inspect OpenCode tools through capability introspection.
gui_related: false
gui_classification_reason: This unit defines provider-tool capability reporting rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-024"
  - "MGAC-004"
  - "MGAC-005"
  - "MGAC-011"
  - "MGAC-084"
unblocks: []
acceptance_criteria:
  - "Provider Tool Capability Reporting remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_tool_capabilities
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0031"
preserved_exact_tokens:
  - "GET /provider"
  - "session tool lists"
  - "capabilities.get"
  - "category: \"provider_tool\""
  - "enabled"
  - "disabled_reason"
  - "setup_hint"
  - "capability introspection"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-026 - Media Capability Boundary And Picker Exclusion

```yaml
plan_unit_id: PO-026
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Media generation tools remain Puppet Master internal capabilities backed by Gemini API key or Cursor-native image support; OpenCode must not expose or proxy media-generation tools, and the media capability picker dropdown excludes OpenCode tools.
gui_related: true
gui_classification_reason: This unit includes media capability picker behavior and visible tool exclusion.
split_recommended: false
depends_on:
  - "PO-024"
  - "MGAC-004"
unblocks: []
acceptance_criteria:
  - "Media Capability Boundary And Picker Exclusion remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_media_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0031"
preserved_exact_tokens:
  - "media.image"
  - "media.video"
  - "media.tts"
  - "media.music"
  - "Gemini API key"
  - "Cursor-native"
  - "OpenCode MUST NOT expose or proxy media-generation tools"
  - "media capability picker dropdown"
negative_constraints:
  - "OpenCode MUST NOT expose or proxy media-generation tools."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Media_Generation_and_Capabilities.md"
  - "Plans/FinalGUISpec.md"
```

### PO-027 - Failure Taxonomy Detection And Event Mapping

```yaml
plan_unit_id: PO-027
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode failure detection maps install, server reachability, server-auth, upstream provider-auth, version,
  provider-discovery, and session-message failures into the canonical health/auth diagnostics and normalized
  provider error/done event flow.
gui_related: false
gui_classification_reason: "This unit defines backend failure detection and normalized provider-event mapping rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-007"
  - "PO-016"
  - "PO-017"
  - "PO-023"
unblocks: []
acceptance_criteria:
  - "Failure Taxonomy Detection And Event Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_failure_mapping
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_failure_taxonomy_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0032"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0033"
preserved_exact_tokens:
  - "OpenCode not installed"
  - "`opencode` binary not found on PATH"
  - "Server not running"
  - "Health check connection refused"
  - "Server unreachable"
  - "Health check 401"
  - "ProviderAuthError"
  - "Version mismatch"
  - "diagnostic(category=\"version_mismatch\")"
  - "Provider not connected"
  - "GET /provider"
  - "Session error"
  - "normalized `error` event"
  - "done(status=failed)"
negative_constraints:
  - "Session/message API errors must map to normalized error events and done(status=failed), not an untyped provider failure."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PO-028 - Recovery Messages And Doctor Checks

```yaml
plan_unit_id: PO-028
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When opencode_enabled is true, Puppet Master surfaces the specified OpenCode recovery messages and Doctor
  checks for binary presence, GET /global/health reachability, 401 auth, connected providers from GET
  /provider, and minimum server version.
gui_related: true
gui_classification_reason: "This unit preserves user-facing recovery copy and Doctor page checks for OpenCode."
split_recommended: true
depends_on:
  - "PO-027"
  - "PO-008"
  - "PO-010"
  - "PO-017"
unblocks: []
acceptance_criteria:
  - "Recovery Messages And Doctor Checks remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_doctor_surface
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_doctor_recovery_surface
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0033"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0034"
preserved_exact_tokens:
  - "OpenCode not installed. Install from https://opencode.ai"
  - "OpenCode server not running. Start with: `opencode serve`"
  - "Cannot reach OpenCode server at {host}:{port}"
  - "OpenCode server requires authentication. Configure credentials in Settings."
  - "OpenCode provider auth error: {message}. Re-authenticate in OpenCode."
  - "No AI providers configured in OpenCode. Configure providers in OpenCode settings."
  - "Doctor page"
  - "opencode_enabled"
  - "Binary check"
  - "GET /global/health"
  - "Auth check"
  - "Provider check"
  - "GET /provider"
  - "connected"
  - "Version check"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-002, ContractName:Plans/Contracts_V0.md#AuthState"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Architecture_Invariants.md"
  - "Plans/Contracts_V0.md"
```

### PO-029 - Provider Settings Profile Controls

```yaml
plan_unit_id: PO-029
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode appears in Agent-Config and provider settings as a server-profile-driven provider with enable,
  managed/attached profile creation, endpoint/auth inputs, reconnect/restart/refresh/detach actions, and
  status badges for connection, health, discovery, and stale-cache state.
gui_related: true
gui_classification_reason: "This unit defines visible Agent-Config and provider settings controls."
split_recommended: false
depends_on:
  - "PO-006"
  - "PO-007"
  - "PO-008"
unblocks: []
acceptance_criteria:
  - "Provider Settings Profile Controls remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_settings_gui
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_settings_controls
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0035"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0036"
preserved_exact_tokens:
  - "Agent-Config"
  - "provider settings"
  - "server-profile-driven provider"
  - "Enable OpenCode"
  - "Add Managed Server"
  - "Add Attached Server"
  - "endpoint/base URL inputs"
  - "optional auth inputs"
  - "Reconnect"
  - "Restart Server"
  - "Refresh Discovery"
  - "Detach from PM control"
  - "status badges"
  - "connection, health, discovery, and stale-cache state"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Multi-Account.md"
  - "Plans/storage-plan.md"
```

### PO-030 - Settings Ownership And Reflected State Boundary

```yaml
plan_unit_id: PO-030
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode settings must label profiles rather than implied account identity, expose connection and discovery
  details, hide lifecycle actions that imply PM owns attached remote processes, and keep PM-owned
  skills/tools/runtime state separate from OpenCode-reflected server and upstream-provider state.
gui_related: true
gui_classification_reason: "This unit defines visible settings ownership labels and GUI state boundaries."
split_recommended: true
depends_on:
  - "PO-006"
  - "PO-014"
  - "PO-025"
unblocks: []
acceptance_criteria:
  - "Settings Ownership And Reflected State Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_settings_boundary
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_settings_state_ownership_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0036"
preserved_exact_tokens:
  - "profile label"
  - "not an implied account identity"
  - "connection mode"
  - "endpoint summary"
  - "discovery freshness"
  - "PM ownership mode"
  - "PM-owned canon"
  - "OpenCode-reflected state"
  - "attached profiles"
  - "lifecycle actions"
  - "PM owns the remote process"
  - "/runtime"
  - "server auth"
  - "discovered upstream auth/runtime state"
  - "server-side session residue"
  - "OpenCode skill discovery is global to the selected server-profile"
  - "OPENCODE_DISABLE_CLAUDE_CODE_SKILLS"
  - "PM still routes canonical skills/tools through the PM skill and tool contracts"
negative_constraints:
  - "Attached profiles must not expose lifecycle actions that imply PM owns the remote process."
  - "OpenCode-reflected state must not replace PM-owned canonical runtime, skills, or tool state."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/OpenCode_Deep_Extraction.md"
  - "Plans/Skills_System.md"
  - "Plans/Tools.md"
```

### PO-031 - Tier Config Dropdown And Shared Card Layout

```yaml
plan_unit_id: PO-031
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When OpenCode is enabled, it appears in the tier platform dropdown and uses the same tier config card layout
  as other providers; its only UI difference is that model selection is sourced from OpenCode HTTP discovery
  and grouped by underlying provider.
gui_related: true
gui_classification_reason: "This unit defines tier configuration UI behavior and model-list presentation."
split_recommended: false
depends_on:
  - "PO-019"
  - "PO-020"
unblocks: []
acceptance_criteria:
  - "Tier Config Dropdown And Shared Card Layout remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_tier_ui
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_tier_config_ui
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0037"
preserved_exact_tokens:
  - "platform dropdown"
  - "any tier"
  - "Model selection"
  - "models discovered from the OpenCode server"
  - "grouped by underlying provider"
  - "No special-casing in UI"
  - "same tier config card layout"
  - "HTTP API vs CLI command"
negative_constraints:
  - "OpenCode must not receive a special tier config card layout distinct from other providers."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
```

### PO-032 - CLI Path Fallback Scope

```yaml
plan_unit_id: PO-032
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode does not require CLI path input for normal runtime operation; if provided, the opencode CLI path is
  limited to local launcher/discovery fallback and installation diagnostics while run transport remains
  HTTP/SSE.
gui_related: false
gui_classification_reason: "This unit constrains launcher/discovery fallback behavior rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-005"
  - "PO-006"
unblocks: []
acceptance_criteria:
  - "CLI Path Fallback Scope remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_cli_fallback
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_cli_path_fallback_scope
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0038"
preserved_exact_tokens:
  - "does NOT require CLI path input"
  - "normal runtime operation"
  - "opencode CLI path"
  - "local launcher/discovery fallback"
  - "installation diagnostics"
  - "OpenCode run transport remains HTTP/SSE"
negative_constraints:
  - "OpenCode CLI path input must not become normal runtime transport."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PO-033 - platform_specs SSOT Constraints

```yaml
plan_unit_id: PO-033
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode must be represented in platform_specs.rs as the Platform variant OpenCode with server-bridged http
  transport, default port 4096, optional CLI path only for launcher/discovery fallback, and dynamic model
  discovery without hardcoded fallback models.
gui_related: false
gui_classification_reason: "This unit defines provider metadata SSOT constraints rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-023"
  - "PO-024"
  - "PO-032"
unblocks: []
acceptance_criteria:
  - "platform_specs SSOT Constraints remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_platform_specs
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_platform_specs_ssot
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0039"
preserved_exact_tokens:
  - "platform_specs.rs"
  - "SSOT"
  - "Platform variant: `OpenCode`"
  - "Transport: `http`"
  - "Default server port: `4096`"
  - "CLI path is **optional**"
  - "launcher/discovery fallback"
  - "No hardcoded fallback models"
  - "dynamic discovery only"
negative_constraints:
  - "platform_specs.rs must not encode hardcoded fallback OpenCode models."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, CodePath:puppet-master-rs/src/platforms/platform_specs.rs"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "puppet-master-rs/src/platforms/platform_specs.rs"
  - "Plans/DRY_Rules.md"
```

### PO-034 - Per-Iteration Session Isolation

```yaml
plan_unit_id: PO-034
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Each Puppet Master iteration creates a new OpenCode session with POST /session, sends the prompt, waits for
  completion, deletes the session with DELETE /session/:id, and never reuses sessions across iterations.
gui_related: false
gui_classification_reason: "This unit defines runtime session lifecycle isolation rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-015"
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "Per-Iteration Session Isolation remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_session_reuse_drift
reasoning_tier: standard
context_scope: provider_opencode_session_isolation
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_session_isolation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0040"
preserved_exact_tokens:
  - "Each Puppet Master iteration"
  - "new OpenCode session"
  - "POST /session"
  - "sends the prompt"
  - "waits for completion"
  - "deletes the session"
  - "DELETE /session/:id"
  - "No session reuse across iterations"
  - "fresh-process-per-iteration guarantee"
  - "session abstraction"
negative_constraints:
  - "OpenCode sessions must not be reused across Puppet Master iterations."
preserved_contractrefs:
  - "ContractRef: PolicyRule:CU-P2-T12"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Executor_Protocol.md"
```

### PO-035 - Synchronous Invocation Sequence

```yaml
plan_unit_id: PO-035
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  The synchronous OpenCode run sequence performs GET /global/health, POST /session, POST /session/{id}/message
  with providerID/modelID, build agent, and text parts, parses response parts into normalized events, and
  deletes the session.
gui_related: false
gui_classification_reason: "This unit defines HTTP invocation sequencing rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-019"
  - "PO-024"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Synchronous Invocation Sequence remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_sync_invocation
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_sync_invocation_sequence
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0041"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0042"
preserved_exact_tokens:
  - "Invocation Shape (Normative)"
  - "Synchronous Run"
  - "GET /global/health"
  - "healthy: true"
  - "version"
  - "POST /session"
  - "PM-2026-02-24-19-30-00-001"
  - "session-uuid"
  - "POST /session/{id}/message"
  - "providerID"
  - "modelID"
  - "claude-sonnet-4-5-20250514"
  - "agent"
  - "build"
  - "parts"
  - "Parse response parts"
  - "normalized events"
  - "DELETE /session/{id}"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Executor_Protocol.md"
```

### PO-036 - Asynchronous SSE Invocation Sequence

```yaml
plan_unit_id: PO-036
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  The asynchronous OpenCode run sequence subscribes to GET /event, sends POST /session/{id}/prompt_async with
  the same request body as the synchronous path, maps SSE events to normalized events, emits done on
  completion, and deletes the session.
gui_related: false
gui_classification_reason: "This unit defines asynchronous transport sequencing rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-035"
unblocks: []
acceptance_criteria:
  - "Asynchronous SSE Invocation Sequence remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_async_sse
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_async_sse_invocation_sequence
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0041"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0043"
preserved_exact_tokens:
  - "Asynchronous Run (SSE)"
  - "GET /event"
  - "SSE stream"
  - "POST /session/{id}/prompt_async"
  - "same as sync"
  - "204 No Content"
  - "Receive SSE events"
  - "map to normalized events"
  - "emit done"
  - "delete session"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Contracts_V0.md"
```

### PO-037 - Cancellation And Abort Contract

```yaml
plan_unit_id: PO-037
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode cancellation is a first-class provider control distinct from ordinary failure: PM cancels the
  active transport, retains received partial tokens, marks completion_reason cancelled, distinguishes timeout
  from user cancel, manages connection-pool health, and emits provider.request_cancelled.
gui_related: false
gui_classification_reason: "This unit defines runtime cancellation semantics rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Cancellation And Abort Contract remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_cancellation
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_cancel_abort_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0044"
preserved_exact_tokens:
  - "Cancellation and abort contract"
  - "first-class provider control"
  - "distinct from ordinary request failure"
  - "closing the HTTP stream"
  - "canceling the SSE subscription"
  - "abort signal"
  - "partial output tokens"
  - "completion_reason: cancelled"
  - "timeout and cancel are distinct"
  - "request_timeout_ms"
  - "connection pool"
  - "provider.request_cancelled"
  - "tokens_received"
  - "reason: \"user\" | \"timeout\" | \"budget\" | \"error\""
negative_constraints:
  - "Timeout and cancel must remain distinct runtime outcomes."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/storage-plan.md"
```

### PO-038 - Provider-Account Scoped Concurrency

```yaml
plan_unit_id: PO-038
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode dispatch is queue-backed and provider-account scoped: sequential by default, parallel only when
  explicitly enabled, configurable per-account concurrency, FIFO queueing, queue_timeout_ms expiry,
  independent account queues, and provider.request_queued emission.
gui_related: false
gui_classification_reason: "This unit defines provider dispatch and queueing semantics rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-006"
  - "PO-012"
unblocks: []
acceptance_criteria:
  - "Provider-Account Scoped Concurrency remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_concurrency
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_account_queueing
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0045"
preserved_exact_tokens:
  - "Concurrency model"
  - "queue-backed"
  - "provider-account scoped"
  - "default mode is sequential"
  - "parallel mode is allowed only when explicitly enabled"
  - "subagent execution"
  - "orchestrator-controlled fan-out flows"
  - "concurrency limit"
  - "default = `1`"
  - "FIFO queue"
  - "queue_timeout_ms"
  - "default `30000ms`"
  - "different accounts"
  - "independent concurrency limits"
  - "provider.request_queued"
  - "queue_position"
  - "queue_depth"
negative_constraints:
  - "Parallel OpenCode dispatch must not be enabled implicitly."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Multi-Account.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
```

### PO-039 - Streaming Error Recovery And Budget Handling

```yaml
plan_unit_id: PO-039
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode streaming recovery retains already-received output, marks stream errors, optionally reconnects with
  partial_response context, avoids fabricated seamless continuation when unsupported, handles HTTP 429
  retry/backoff, and records length or budget_exceeded completion reasons.
gui_related: false
gui_classification_reason: "This unit defines streaming recovery policy rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-037"
  - "PO-038"
unblocks: []
acceptance_criteria:
  - "Streaming Error Recovery And Budget Handling remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_streaming_recovery
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_streaming_recovery_policy
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0046"
preserved_exact_tokens:
  - "Streaming error recovery"
  - "retain all tokens received so far"
  - "completion_reason: stream_error"
  - "auto_retry_stream: true"
  - "partial_response"
  - "provider supports continuation from partial output"
  - "without fabricating a seamless continuation"
  - "HTTP `429`"
  - "Retry-After"
  - "exponential backoff `1s -> 2s -> 4s`"
  - "maximum rate-limit retries = `3`"
  - "failure_class: rate_limited"
  - "completion_reason: length"
  - "budget_exceeded"
negative_constraints:
  - "PM must not fabricate a seamless continuation when the provider does not support continuation from partial output."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
```

### PO-040 - Seglog Event Persistence Mapping

```yaml
plan_unit_id: PO-040
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode runs persist to seglog using the shared provider event types: run.started with run_id, thread_id,
  platform opencode, mode, and http transport; tool.invoked/tool.denied from response parts; usage.event from
  message metadata; and run.completed on session completion.
gui_related: false
gui_classification_reason: "This unit defines persistence event mapping rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-016"
  - "PO-022"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Seglog Event Persistence Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_seglog_mapping
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_seglog_event_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0047"
preserved_exact_tokens:
  - "Persistence Mapping (seglog)"
  - "seglog"
  - "run.started"
  - "run_id"
  - "thread_id"
  - "platform: \"opencode\""
  - "mode"
  - "transport: \"http\""
  - "tool.invoked"
  - "tool.denied"
  - "OpenCode response parts"
  - "usage.event"
  - "message metadata"
  - "input/output tokens"
  - "run.completed"
  - "status"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
```

### PO-041 - Cost Certainty And Provider-Local Persistence Boundary

```yaml
plan_unit_id: PO-041
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode cost and persistence evidence remains provider-local reference state: PM must not copy OpenCode
  visuals, overclaim cost certainty, treat estimated-cost as provider-authoritative pricing without evidence,
  or use OpenCode SQLite/snapshot/NFS-incompatible state as PM canonical ledger, event log, or recovery
  source.
gui_related: false
gui_classification_reason: "This unit defines cost and persistence authority boundaries rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-014"
  - "PO-040"
unblocks: []
acceptance_criteria:
  - "Cost Certainty And Provider-Local Persistence Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_persistence_authority_drift
reasoning_tier: standard
context_scope: provider_opencode_persistence_boundary
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_persistence_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0047"
preserved_exact_tokens:
  - "Do not copy OpenCode visuals directly"
  - "overclaim OpenCode-derived cost certainty"
  - "provider-cache and provider-normalization caveats"
  - "estimated-cost"
  - "provider-authoritative pricing"
  - "raw/debug evidence"
  - "upstream cache/input reporting caveat"
  - "provider-local reference state"
  - "not PM canonical state"
  - "non-atomic writes"
  - "shared snapshot indexes"
  - "SQLite stores"
  - "NFS-incompatible filesystem assumptions"
  - "authoritative PM ledger, event log, or recovery source"
negative_constraints:
  - "OpenCode visuals must not be copied directly into PM canonical surfaces."
  - "OpenCode SQLite, snapshot, and NFS-incompatible provider-local state must not become the authoritative PM ledger, event log, or recovery source."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
```

### PO-042 - Testable Acceptance Bundle

```yaml
plan_unit_id: PO-042
unit_type: acceptance
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode acceptance requires reachable enabled sessions, provider/model discovery and GUI model picker
  display, health/auth user-facing errors, normalized provider events, per-iteration session deletion,
  enabled-only tier visibility, Doctor checks, credential-store secrets, and unified Provider facade behavior
  without consumer branching.
gui_related: true
gui_classification_reason: "This unit includes GUI model picker, tier dropdown, Doctor page, and user-facing auth/error acceptance surfaces."
split_recommended: false
depends_on:
  - "PO-027"
  - "PO-028"
  - "PO-029"
  - "PO-030"
  - "PO-031"
  - "PO-032"
  - "PO-033"
  - "PO-034"
  - "PO-035"
  - "PO-036"
  - "PO-037"
  - "PO-038"
  - "PO-039"
  - "PO-040"
  - "PO-041"
unblocks: []
acceptance_criteria:
  - "Testable Acceptance Bundle remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_acceptance
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_acceptance_matrix
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0048"
preserved_exact_tokens:
  - "Acceptance Criteria (Testable)"
  - "opencode_enabled"
  - "create a session"
  - "send a prompt"
  - "receive a response"
  - "delete the session"
  - "Model discovery via `GET /provider`"
  - "GUI model picker"
  - "Health check failures"
  - "auth state changes"
  - "user-facing error messages"
  - "normalized events"
  - "text_delta"
  - "tool_use"
  - "tool_result"
  - "usage"
  - "done"
  - "no session reuse"
  - "tier config platform dropdown"
  - "Doctor page"
  - "Secrets (password)"
  - "OS credential store"
  - "unified Provider facade"
  - "consumers do not branch on OpenCode vs CLI providers"
negative_constraints:
  - "Consumers must not branch on OpenCode vs CLI providers for accepted Provider facade behavior."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Contracts_V0.md"
```

### PO-043 - Runtime Identity Correlation Bundle

```yaml
plan_unit_id: PO-043
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Each OpenCode-backed attempt preserves the shared runtime identity and correlation bundle in local
  correlation state and attaches it to normalized provider events, storage records, and retry/recovery
  decisions even when fields are not transmitted to OpenCode HTTP endpoints.
gui_related: false
gui_classification_reason: "This unit defines runtime identity and local correlation fields rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-004"
  - "PO-011"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Runtime Identity Correlation Bundle remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_runtime_identity
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_runtime_identity_bundle
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0050"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0051"
preserved_exact_tokens:
  - "OpenCode Runtime Retry / Blocked-State / Packet Canonical Alignment (2026-03-09)"
  - "canonical runtime scheduler"
  - "retry taxonomy"
  - "safe-point contract"
  - "remediation lineage"
  - "runtime packet"
  - "usage pipeline"
  - "run_id"
  - "thread_id"
  - "node_id"
  - "attempt_id"
  - "retry_count"
  - "requested/effective model identifiers"
  - "requested/effective permission snapshot identifiers"
  - "replan_generation"
  - "mutation_capable"
  - "safe_point_id?"
  - "remediation_root_id?"
  - "remediation_parent_attempt_id?"
  - "remediation_generation?"
  - "local correlation state"
  - "normalized provider events"
  - "storage records"
  - "retry/recovery decisions"
negative_constraints:
  - "OpenCode HTTP endpoint shape must not be used as an excuse to drop canonical runtime identity fields from local correlation and normalized records."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/storage-plan.md"
```

### PO-044 - Retry Ownership And Attempt Lineage

```yaml
plan_unit_id: PO-044
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode reconnect and retry behavior must preserve canonical attempt identity: reconnect only observes an
  existing attempt, accepted requests retry only through the canonical runtime scheduler and failure taxonomy,
  recovery creates a new attempt snapshot, safe_point_id persists across mutation-capable attempts, restore
  reruns use new attempt_id lineage, and stale replan_generation attempts do not resume silently.
gui_related: false
gui_classification_reason: "This unit defines scheduler retry ownership and attempt lineage rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-039"
  - "PO-043"
unblocks: []
acceptance_criteria:
  - "Retry Ownership And Attempt Lineage remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_retry_ownership_drift
reasoning_tier: standard
context_scope: provider_opencode_retry_lineage
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_retry_lineage_scheduler
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0052"
preserved_exact_tokens:
  - "OpenCode transport reconnect logic"
  - "reconnect only to observe an existing attempt"
  - "MUST NOT silently resubmit prompts"
  - "reset attempt identity"
  - "invent provider-local fallback loops"
  - "canonical runtime scheduler"
  - "failure taxonomy"
  - "canonical scheduler wake"
  - "new attempt snapshot"
  - "safe_point_id"
  - "mutation-capable OpenCode attempt"
  - "new `attempt_id`"
  - "lineage references"
  - "replan invalidation"
  - "replan_generation"
  - "stale attempts"
  - "OpenCode-local retry wording is superseded by canonical runtime retry ownership"
negative_constraints:
  - "OpenCode reconnect logic must not silently resubmit prompts, reset attempt identity, or invent provider-local fallback loops."
  - "Stale attempts from an older replan_generation must not resume silently."
  - "Any OpenCode-local retry wording is superseded by canonical runtime retry ownership."
preserved_contractrefs: []
stale_retired_dispositions:
  - "Stale attempts from an older `replan_generation` must not resume silently."
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
```

### PO-045 - Canonical Blocked Signal Normalization For UI And Orchestration

```yaml
plan_unit_id: PO-045
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode auth, transient, structured-output, and tool-denial signals must normalize into canonical
  blocked_reason_code or failure_class values before orchestration or UI consumes them, preserving
  server-vs-provider auth realms and refusing to collapse permission, FileSafe, or external-side-effect blocks
  into generic provider errors.
gui_related: true
gui_classification_reason: "This unit includes blocked-state classifications consumed by orchestration and UI recovery surfaces."
split_recommended: true
depends_on:
  - "PO-017"
  - "PO-027"
  - "PO-043"
  - "PO-044"
unblocks: []
acceptance_criteria:
  - "Canonical Blocked Signal Normalization For UI And Orchestration remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_blocked_signal_drift
reasoning_tier: standard
context_scope: provider_opencode_blocked_signal_normalization
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_blocked_failure_ui_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0052"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0053"
preserved_exact_tokens:
  - "blocked_reason_code"
  - "failure_class"
  - "before orchestration or UI consumes them"
  - "auth_expired"
  - "server realm"
  - "provider realm"
  - "provider_transient"
  - "structured_output_invalid"
  - "permission_denied"
  - "filesafe_blocked"
  - "external_side_effect_blocked"
  - "generic `error`"
  - "provider_failed"
  - "canonical failure and blocked mapping"
  - "Surface blocked recovery"
  - "wait for auth recovery"
  - "Runtime retry/backoff policy applies"
  - "structured-output remediation / retry policy"
negative_constraints:
  - "The adapter MUST NOT collapse permission_denied, filesafe_blocked, external_side_effect_blocked, or other already-determined canonical runtime classes to generic error or provider_failed."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/FileSafe.md"
```

### PO-046 - Capability And Usage Runtime Alignment

```yaml
plan_unit_id: PO-046
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode capability reporting declares server-bridged HTTP/SSE transport, normalized streaming support,
  canonical tool-policy snapshot use, split server/upstream auth realms, and no hidden retries; unsupported
  runtime controls are recorded as unsupported/skipped, and Session.getUsage message usage maps to normalized
  usage.event persistence and Ledger/Usage consumption.
gui_related: false
gui_classification_reason: "This unit defines runtime capability and usage mapping rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-017"
  - "PO-022"
  - "PO-024"
  - "PO-025"
  - "PO-040"
unblocks: []
acceptance_criteria:
  - "Capability And Usage Runtime Alignment remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_capability_usage
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_capability_usage_alignment
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0054"
preserved_exact_tokens:
  - "server-bridged HTTP/SSE"
  - "supports streaming normalized events"
  - "canonical tool-policy snapshot"
  - "split auth realms"
  - "server credentials vs upstream provider auth"
  - "performs no hidden runtime retries"
  - "unsupported/skipped"
  - "effective runtime state"
  - "OpenCode server returns message-level usage"
  - "usage.event"
  - "Persistence and Ledger/Usage consumption"
  - "storage-plan.md"
  - "usage-feature.md"
  - "Session.getUsage"
  - "processor finish-step"
  - "terminology should not drift"
negative_constraints:
  - "OpenCode must not perform hidden runtime retries."
  - "Unsupported runtime controls must be recorded as unsupported/skipped rather than silently ignored."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Models_System.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
```

### PO-001 - Provider OpenCode Retired Source-Preserving Bridge

```yaml
plan_unit_id: PO-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  PO-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 158.
  Provider_OpenCode-S0001 through Provider_OpenCode-S0031 are covered by PO-002 through PO-026 or structural
  dispositions, Provider_OpenCode-S0032 through Provider_OpenCode-S0054 are covered by PO-027 through PO-046
  or structural/reference dispositions, and Provider_OpenCode-S0055 through Provider_OpenCode-S0058 are
  generated structural/audit dispositions. PO-001 must not re-own or override implementation-facing PlanUnits
  and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: "The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map."
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-003"
  - "PO-004"
  - "PO-005"
  - "PO-006"
  - "PO-007"
  - "PO-008"
  - "PO-009"
  - "PO-010"
  - "PO-011"
  - "PO-012"
  - "PO-013"
  - "PO-014"
  - "PO-015"
  - "PO-016"
  - "PO-017"
  - "PO-018"
  - "PO-019"
  - "PO-020"
  - "PO-021"
  - "PO-022"
  - "PO-023"
  - "PO-024"
  - "PO-025"
  - "PO-026"
  - "PO-027"
  - "PO-028"
  - "PO-029"
  - "PO-030"
  - "PO-031"
  - "PO-032"
  - "PO-033"
  - "PO-034"
  - "PO-035"
  - "PO-036"
  - "PO-037"
  - "PO-038"
  - "PO-039"
  - "PO-040"
  - "PO-041"
  - "PO-042"
  - "PO-043"
  - "PO-044"
  - "PO-045"
  - "PO-046"
unblocks: []
acceptance_criteria:
  - "Generated-tail structural and audit spans remain available for exact-text audit."
  - "Provider_OpenCode-S0001 through Provider_OpenCode-S0054 remain mapped to PO-002 through PO-046 or explicit structural/reference dispositions rather than PO-001."
  - "Provider_OpenCode-S0055 through Provider_OpenCode-S0058 are structurally dispositioned as generated tail/audit material."
  - "PO-001 no longer uses node_compile_hint.mode=source_preserving_planunit."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: provider_opencode_retired_bridge
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0055"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0056"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0057"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0058"
preserved_exact_tokens:
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Provider OpenCode Residual Source-Preserving Bridge"
  - "Provider OpenCode Residual Generated-Tail Bridge"
  - "Provider OpenCode Retired Source-Preserving Bridge"
  - "Migration Coverage"
  - "Provider_OpenCode-S0055"
  - "Provider_OpenCode-S0058"
negative_constraints:
  - "PO-001 must not provide product implementation coverage for Provider_OpenCode-S0001 through Provider_OpenCode-S0054."
  - "PO-001 must not override PO-002 through PO-046 or structural/reference dispositions."
  - "PO-001 must not use source_preserving_planunit compile mode after Phase 2B batch 158."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
compatibility_only_notes:
  - "The retired bridge remains only as migration-lineage compatibility metadata."
stale_retired_dispositions:
  - "source_preserving_bridge_retired"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```
