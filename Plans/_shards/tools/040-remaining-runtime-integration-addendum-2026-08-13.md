# Shard 040: Remaining Runtime Integration Addendum - 2026-08-13

Source: `Plans/Tools.md`

Source lines: L12365-L12537

Source SHA256: `f184b9325f823a984b7eaf731ec462d3716de09e767f6480d03ec145027175db`

---

## Remaining Runtime Integration Addendum - 2026-08-13

This addendum compiles the corrected remaining-runtime packet into the Tools owner only. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal.

### T-176 - Progressive Capability Stages And Bounded Materialization

```yaml
plan_unit_id: T-176
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Every tool, Skill, provider, and MCP capability progresses through independently receipted installed,
  project_enabled, policy_available, selected_for_request, and invoked stages. Prompt-facing catalogs use deterministic
  L0-L3 materialization, stable schema ordering, and bounded omission receipts; no complete large catalog or all full
  schemas/instructions are injected eagerly.
gui_related: false
gui_classification_reason: Backend tool admission, prompt-materialization, and receipt contract; not GUI implementation work.
depends_on: [T-170, T-172, PP-072]
unblocks: []
acceptance_criteria:
  - A later capability stage cannot be true when an earlier stage is false, and invoked records an attempt rather than success.
  - One hundred installed capabilities materialize only the request-selected bounded slice while essential catalog search remains directly available.
  - Identical inputs produce the same materialized order and order hash regardless of connection, scan, locale, or map iteration order.
  - Omitted entries produce bounded per-entry or aggregated reason receipts with a continuation/artifact ref when capped.
  - Permission or catalog generation changes invalidate the affected slice without eagerly injecting the full catalog.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: progressive_capability_context_drift
reasoning_tier: high
context_scope: tools_capability_materialization
implementation_surfaces:
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/Skills_System.md
  - Plans/MCP_Integration.md
node_compile_hint:
  mode: progressive_capability_materialization
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md#Progressive-capability-disclosure
  - ACCOUNTABILITY_MATRIX.json:CTX-015
  - reference/HERMES_V020_SOURCE_REVIEW.md#5.4-Tool-disclosure-and-schema-cost
source_atom_ids: []
preserved_exact_tokens:
  - installed
  - project_enabled
  - policy_available
  - selected_for_request
  - invoked
  - CapabilityMaterializationReceipt
negative_constraints:
  - Do not eagerly inject the complete tool, Skill, provider, plugin, or MCP catalog.
  - Do not treat installed, enabled, selected, invoked, or omitted as synonyms.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Prompt_Pipeline.md
  - Plans/Skills_System.md
  - Plans/MCP_Integration.md
```

### T-177 - Typed Tool Recovery And Artifact Spill Contract

```yaml
plan_unit_id: T-177
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  ToolRecoveryEnvelope gives every partial, failed, truncated, or recoverable attempt typed failure, retry,
  verification, cwd, match-diagnostic, and final-outcome evidence. Complete redacted large output spills to a canonical
  artifact with bounded head/tail and exact size; blind retry and loss-shaped success are prohibited.
gui_related: false
gui_classification_reason: Backend result, retry, artifact, and verification contract; UI consumers only project its evidence.
depends_on: [T-007, T-077, T-079, T-167, T-173, T-174]
unblocks: []
acceptance_criteria:
  - Truncated terminal output retains complete redacted artifact evidence, bounded head/tail, original size, and cwd changes.
  - Already-applied patch is success/no-op only with post-read proof; ambiguous or whitespace-mismatched patch does not mutate.
  - Retention failure cannot settle as success, and policy/FileSafe/secret/schema denials cannot become transient retries.
  - Every retry is a separate attempt under one logical operation and requires a typed changed recovery condition.
  - MCP calls receive no more than the MCP owner's one additional invoke-time reconnect or noninteractive auth-refresh retry.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: typed_tool_recovery_truthfulness
reasoning_tier: high
context_scope: tool_recovery_and_artifacts
implementation_surfaces:
  - Plans/Tools.md
  - Plans/FileSafe.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: typed_tool_recovery_artifact_spill
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 03_PROVIDER_CONTEXT_TOOLS_RECOVERY_AND_COMPACTION.md#Tool-recovery-envelope
  - reference/HERMES_V020_SOURCE_REVIEW.md#5-Hermes-Tools-that-fix-themselves-source-audit
  - reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md#11-Tool-self-recovery
source_atom_ids: []
preserved_exact_tokens:
  - ToolRecoveryEnvelope
  - artifact_or_spill_ref
  - already_applied_noop
  - whitespace_mismatch
  - ambiguous_match_locations
  - verification_status
negative_constraints:
  - Do not blindly retry a failed tool call.
  - Do not expose raw secrets in output, spills, receipts, prompts, caches, or recovery hints.
  - Do not report success when full required output was not retained.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/FileSafe.md
  - Plans/Runtime_Artifacts_Panel.md
```

### T-178 - Persistent EvalSession Tool Policy Consumer Boundary

```yaml
plan_unit_id: T-178
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Persistent EvalSession may consume request-selected Puppet Master tools through the canonical policy, schema,
  deadline, FileSafe, network, recovery, and receipt path, but its kernel/session lifecycle, leases, retained variables,
  resource accounting, restart, and cleanup remain solely owned by Shared Integration Runtime.
gui_related: false
gui_classification_reason: Backend ownership and nested-tool authority boundary; not GUI implementation work.
depends_on: [T-007, T-076, T-176, T-177]
unblocks: []
acceptance_criteria:
  - A live EvalSession cannot widen its selected tool set, bypass approval/FileSafe, access raw credentials, or extend its parent deadline.
  - Nested tool attempts preserve EvalSession and logical-operation identity while local compute and external wait remain separately attributable.
  - Tools never creates a hidden global kernel or second EvalSession lifecycle store when the shared owner is unavailable.
  - EvalSession state uses canonical PM storage and no SQLite; browser calls remain PM-native Browser Program tools.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plan-index.py validate
risk_class: evalsession_owner_boundary_drift
reasoning_tier: high
context_scope: evalsession_tool_policy
implementation_surfaces:
  - Plans/Tools.md
  - Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: evalsession_tool_policy_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - 04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#Persistent-EvalSession
  - ACCOUNTABILITY_MATRIX.json:PRM-011
source_atom_ids: []
preserved_exact_tokens:
  - Persistent EvalSession
  - retained variables
  - controlled nested PM tools
  - no hidden global kernel
negative_constraints:
  - Do not move EvalSession lifecycle ownership into Tools.
  - Do not introduce raw secrets, SQLite, or a PM-owned external browser-test runtime through EvalSession.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Tools.md
  - Plans/Shared_Integration_Runtime.md
```
