# Shard 010: PlanUnits

Source: `Plans/MCP_Integration.md`

Source lines: L194-L288

Source SHA256: `c7001ef3bf4b93c4763c60ee1373ba49a09ee331c8407410614db6c8f2498606`

---

## PlanUnits

### MI-001 - MCP Integration Source-Preserving PlanUnit

```yaml
plan_unit_id: MI-001
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Plans/MCP_Integration.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
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
- Plans/MCP_Integration.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- MCP Integration
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
- 1. Canonical naming
- 2. Requested versus effective availability
- 3. Credential binding and invalidation
- 4. Cross-surface responsibilities
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
- 5. Server config schema
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
- 6. Supported flows
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/newtools.md'
- 7. Effective tool availability and GUI surfacing
negative_constraints:
- 'The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must n'
- '- Traceability label `/effective-state` maps to this requested-versus-effective availability owner section; consumer-style paraphrases must not replace the stored enum values.'
- '- `Prompt_Pipeline` / `Prompt_Pipeline.md` remains the owner for effective-resolution schema; MCP integration must not duplicate a thinner subset of those fields directly on `TierContext`.'
- MCP OAuth state is keyed by provider/scope/client semantics rather than only by server identity. Tokens live in the shared credential store, token sharing is keyed by provider+scope rather than MCP server, and refresh uses compare-and-swap before replacing the effective token/client binding. PM owns
- MCP connection pooling is the default for managed server sessions. PM MUST NOT use a subprocess-per-call model for MCP servers except for explicitly disposable diagnostic probes; long-lived MCP sessions own lifecycle identity, refresh, health, and teardown state through `mcp_server_record` and `mcp_
compatibility_only_notes:
- Schema isolation and OAuth state are MCP-owned cross-runtime concerns. MCP schema handling tracks visited `$ref` values during resolution and breaks recursive schema cycles on revisit by substituting `{}` and logging a warning. Resolved schemas have a maximum depth of 32 and a size cap of 64 KiB; sc
stale_retired_dispositions:
- 'The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must n'
- '- MCP tool identity is underscore-only in stored and permission-facing contracts. Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract; consumer surfaces may display friendly labels but must join back to `{server_slug}_{tool_name}`.'
owner_boundary_notes:
- This document is the single-owner SSOT for PM MCP configuration, naming, availability, credential binding, and invalidation.
- '## 1. Canonical naming'
- This section defines the canonical contract for this surface.
- 'The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must n'
- '- canonical naming uses underscore form `{server_slug}_{tool_name}`'
- '- MCP tool identity is underscore-only in stored and permission-facing contracts. Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract; consumer surfaces may display friendly labels but must join back to `{server_slug}_{tool_name}`.'
- '- canonical naming'
- '- requested vs effective MCP availability remains canonical across runtime and GUI surfaces.'
- '- Traceability label `/effective-state` maps to this requested-versus-effective availability owner section; consumer-style paraphrases must not replace the stored enum values.'
- '- Traceability label `/invalidation` maps to credential invalidation here; `obl-065` is the MCP owner obligation for this auth/effective-state/naming contract family.'
- '- `Plans/newtools.md` and GUI summary surfaces reference this document as the live SSOT for MCP availability and credential vocabulary.'
- '- `Plans/interview-subagent-integration.md` / `/interview-subagent-integration.md` consumes MCP account visibility, canonical persona naming, stage-to-role mapping, and current role vocabulary when interview tooling resolves which account, persona, or provider context is effective.'
- '- `Prompt_Pipeline` / `Prompt_Pipeline.md` remains the owner for effective-resolution schema; MCP integration must not duplicate a thinner subset of those fields directly on `TierContext`.'
- '- MCP route and event consumers use canonical `/subject` vocabulary alongside blocked-action aliases, so command, tool, and integration events can route concerns without inventing another subject model.'
- This owner text closes the prior shared-listener under-specification by making listener identity, bind address, client id, provider scope, retry, and OAuth/auth-state evidence explicit.
- 'Canonical config fields include:'
- 'Canonical MCP data records:'
- 'GUI lifecycle labels are derived from the canonical availability states without creating a second enum: `Working`, `Not Configured`, `Needs Auth`, `Untrusted Folder`, `Unhealthy`, `Install Failed`, `Unsupported`, and `External / Not Managed`. `Install Failed` is a setup/install diagnostic label that'
- 'MCP resilience is part of the owner contract: PM uses lazy-load startup for enabled servers, runs pre-validation before MCP tool dispatch or provider adapter handoff, keeps cached tool lists as degraded fallback evidence, retries transient startup/health failures before eviction, and preserves stabl'
- MCP connection pooling is the default for managed server sessions. PM MUST NOT use a subprocess-per-call model for MCP servers except for explicitly disposable diagnostic probes; long-lived MCP sessions own lifecycle identity, refresh, health, and teardown state through `mcp_server_record` and `mcp_
- '- Gemini CLI remains the heaviest managed home: auth, extensions, MCP OAuth tokens, history, temp chats, and project registry can all sit under one `.gemini` tree, so PM treats those as profile-local runtime state unless a later owner contract promotes a safe overlay.'
- '- Consumer references include `Plans/Tools.md`, `Plans/newtools.md`, and `Plans/Section15_MVP_Promoted_Features_Spec.md`; slash-form trace labels may render these as `/Tools.md`, `/newtools.md`, or `/Section15_MVP_Promoted_Features_Spec.md`, but ownership stays here.'
- '- DirectApi providers (`Gemini`, `Codex`, `GitHub Copilot`, `Alibaba Coding Plan`, `MiniMax Coding Plan`, `Z.AI Coding Plan`) use PM-native MCP only; no provider-side MCP config files are canonical for `DirectApi` rows, including `MiniMax` and `Z.AI` coding-plan surfaces.'
- '- Cursor CLI evidence includes `cursor-agent` headless output modes such as `/stream-json`, auth status, MCP management, model listing, and about `/version` probing; those probes feed MCP availability instead of redefining the account boundary.'
owner_hints:
- Plans/MCP_Integration.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

