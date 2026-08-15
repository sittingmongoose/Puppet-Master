# Shard 015: Remaining Runtime Integration Addendum - 2026-08-13

Source: `Plans/MCP_Integration.md`

Source lines: L2620-L2798

Source SHA256: `207e8320910fd5d969dcb0c794981247d4b9d40a091019c193a6a1b57bdce257`

---

## Remaining Runtime Integration Addendum - 2026-08-13

This addendum compiles MCP lifecycle accountability row `PRM-013` and the progressive-capability portion of `CTX-015` into the canonical MCP owner. Shared session leases, resource admission, host/environment binding, and recovery coordination remain owned by `Plans/Shared_Integration_Runtime.md`; this addendum owns MCP protocol/component behavior. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

### MI-040 - MCP Component Lifecycle, Epoch, And Recovery

```yaml
plan_unit_id: MI-040
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  MCP keeps configured, auth, transport, catalog, subscription, tool_projection, and health component states
  separately. Enabled servers connect in bounded parallel background cohorts; callbacks are epoch-guarded; reconnect
  storms open a per-server breaker; and invoke-time transport/auth recovery permits exactly one additional bounded
  attempt after revalidation.
gui_related: false
gui_classification_reason: Backend MCP protocol, state-machine, epoch, and recovery contract; not GUI implementation work.
depends_on: [MI-016, MI-018, MI-019, MI-037, MI-039]
unblocks: []
acceptance_criteria:
  - McpServerLifecycleRecord uses Plans/shared_runtime_contracts.schema.json#/$defs/mcp_server_lifecycle_record while this document remains its semantic owner; Shared Integration Runtime supplies only common schema primitives, leases, admission, and recovery seams.
  - Auth, transport, catalog, subscription, projection, and health can fail or recover independently without collapsing into one connected Boolean.
  - Slow or failed servers do not block startup or unrelated servers, and reconnect demand joins one breaker-governed operation per server/runtime generation.
  - Old config, auth, connection, or catalog epoch callbacks cannot publish tools, overwrite new state, or re-arm subscriptions.
  - A disconnected or noninteractively refreshable invocation receives at most one additional attempt after config/auth/policy/schema/collision/deadline/breaker revalidation.
  - Interactive auth, permission/FileSafe/safety denial, schema mismatch, application failure, and incompatible protocol receive no automatic invoke-time retry.
validation_surfaces:
  - python3 scripts/pm-shared-runtime-contracts.py --self-test
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: mcp_lifecycle_epoch_recovery_drift
reasoning_tier: high
context_scope: mcp_runtime_lifecycle
implementation_surfaces:
  - Plans/MCP_Integration.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Tools.md
node_compile_hint:
  mode: mcp_component_lifecycle_epoch_recovery
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#MCP-lifecycle
  - ACCOUNTABILITY_MATRIX.json:PRM-013
  - reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md#Acceptance-and-stress-tests
source_atom_ids: []
preserved_exact_tokens:
  - configured
  - auth
  - transport
  - catalog
  - subscription
  - tool_projection
  - health
  - reconnect-storm breaker
  - epoch-guarded reconnect
negative_constraints:
  - Do not let generic tool recovery add retries beyond the one additional MCP invoke-time reconnect/auth attempt.
  - Do not move MCP protocol/component behavior into Shared Integration Runtime.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/MCP_Integration.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Tools.md
```

### MI-041 - Stale Catalog, Deferred Projection, And Collision Ownership

```yaml
plan_unit_id: MI-041
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  MCP catalogs use compatibility-keyed stale-while-refresh with one in-flight refresh, deterministic underscore-only
  projection order, deferred schema proxies, shared rich-result settlement, and deterministic lowest-canonical-server-id
  ownership for normalized tool-name collisions. Suppressed and omitted tools remain receipted and inspectable.
gui_related: false
gui_classification_reason: Backend MCP catalog/projection/collision contract; visible managers consume but do not own it.
depends_on: [MI-003, MI-033, MI-036, MI-038, T-176]
unblocks: []
acceptance_criteria:
  - Safe stale catalogs may remain discoverable while one refresh runs only when all server/config/auth/protocol/cache compatibility epochs match.
  - Full schema materialization occurs only for request-selected tools; complete MCP catalogs are never eagerly injected.
  - Catalog search, bootstrap, and deferred-proxy invocation converge on the same typed rich-result parser and recovery path.
  - Collision ownership and ordered projection hashes are identical after restart regardless of connection completion order or health timing.
  - Losing claimants receive collision_suppressed omission receipts and remain inspectable without entering the callable namespace.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: mcp_catalog_projection_collision_drift
reasoning_tier: high
context_scope: mcp_catalog_materialization
implementation_surfaces:
  - Plans/MCP_Integration.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: mcp_stale_catalog_deferred_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md#Progressive-capability-disclosure
  - 04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#MCP-lifecycle
  - reference/HERMES_V020_SOURCE_REVIEW.md#5.4-Tool-disclosure-and-schema-cost
source_atom_ids: []
preserved_exact_tokens:
  - stale-while-refresh
  - deferred proxies
  - deterministic tool-name collision owner
  - collision_suppressed
negative_constraints:
  - Do not use health, latency, discovery order, reconnect timing, map order, or locale as collision ownership authority.
  - Do not expose every full MCP schema eagerly.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/MCP_Integration.md
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
```

### MI-042 - Subscription Rollback And Protected MCP Boundaries

```yaml
plan_unit_id: MI-042
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  MCP resource subscription setup is transactional and rolls acquired handles back in reverse deterministic order on
  partial failure. Protocol/version/extension/auth/cache compatibility is explicit, while all config, catalog, cache,
  receipt, artifact, debug, and projection surfaces remain no-secret, no-SQLite, and outside any PM-owned external
  browser-test MCP or compatibility surface.
gui_related: false
gui_classification_reason: Backend transaction, compatibility, storage, and security boundary; not GUI implementation work.
depends_on: [MI-014, MI-035, MI-039, MI-040]
unblocks: []
acceptance_criteria:
  - Partial subscription failure rolls back acquired handles in reverse order and cannot report active.
  - Rollback receipts disclose acquired/released refs, cleanup failures, terminal state, and connection epoch without secrets.
  - Required unknown protocol/extension incompatibility blocks projection; optional unknown extensions are disabled and receipted.
  - Catalog cache keys include negotiated protocol, ordered extensions, auth profile, transport, cache format, and relevant epochs/generations.
  - MCP state introduces no raw secrets, SQLite, or PM-owned external browser-test runtime/facade/MCP/command/capture dependency.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: mcp_subscription_security_boundary_drift
reasoning_tier: high
context_scope: mcp_subscription_and_security
implementation_surfaces:
  - Plans/MCP_Integration.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: mcp_subscription_rollback_protected_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#MCP-lifecycle
  - SHARED_PROCESS_RULES.md#Shared-non-negotiable-rules
  - REFERENCE_SUPERSESSIONS.md
source_atom_ids: []
preserved_exact_tokens:
  - resource subscription rollback
  - negotiated_protocol_version
  - cache format generation
  - no secrets
  - no SQLite
negative_constraints:
  - Do not serialize raw tokens, cookies, authorization headers, client secrets, or decrypted environment values.
  - Do not introduce SQLite or a PM-owned external browser-test MCP, runtime, facade, command family, port, or capture engine.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/MCP_Integration.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/storage-plan.md
```
