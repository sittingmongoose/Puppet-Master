# CLI-Bridged Providers (Provider Facade)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0068
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - session approval carryover and reject-cascade semantics are still effectively single-session/single-lane even though the rewrite requires parallel actors sharing provider runtime
  - still too weak to support canonical account identity, switch-reason disclosure, or conversational-actor routing through the provider facade
  - `CLI_Bridged_Providers.md` requires direct providers to declare multi-account/switch capability surfaces, but bridged providers are exempt by omission even though `Multi-Account.md` expects bridged routing support.
  - CLI_Bridged_Providers.md
  - Multi-Account.md
  - still rely on mutable provider identity and thin degraded-capability UX even though per-realm stable account identity is now required
  - `honored/skipped/clamped` from provider capability handling
  - honored/skipped/clamped
  - `Reason: provider does not support effort on this model`
  - Reason: provider does not support effort on this model
  - `Provider fallback from preferred persona model`
  - Provider fallback from preferred persona model
  - shared provider runtime does not imply shared execution ontology
  - `Warning: provider pressure high`
  - Warning: provider pressure high
  - Source-qualified usage wording still matters for Gemini and other estimate-only providers; that requirement should survive the broader identity rewrite
  - but canonical contracts want stable internal `account_id` plus display-only provider identity
  - account_id
  - `GitHub_API_Auth_and_Flows.md` still uses login-derived credential identity while multi-account/storage contracts require stable internal `account_id` plus disclosure-only provider metadata.
  - GitHub_API_Auth_and_Flows.md
  - still encode single-session/single-actor assumptions that break under shared provider runtime, multi-lane orchestration, and server-bridged transport
  - `storage-plan.md` still models durable provider account snapshots for runs but not for other actor classes that use the same provider runtime.
  - storage-plan.md
  - Actor/runtime unification must preserve ontology separation: chat/interview/wizard actors share provider runtime but are not orchestration nodes.
  - Actor/runtime unification must preserve ontology separation: conversational actors share provider runtime without becoming orchestration-node objects.
  - direct providers must expose capability metadata like multi-account support, switch boundary, quota signal sources/confidence, and role-scoped pools
  - that means multi-account routing and pressure interpretation are currently stronger on paper for direct providers than for bridged providers
  - but not requested/effective auth/account fields, upstream provider identity ownership, or switch attribution
  - auth/account health, switch pressure, provider confidence, and projection freshness still do not flow through one reusable trust/concern contract
  - now show a concrete parity gap on auth/account disclosure for conversational actors sharing provider runtime
  - Bridged providers still lack the capability metadata already required of direct providers.
  - Shared degraded-trust / concern escalation remains absent across provider, permissions, widgets, and conversational surfaces.
  - The rewrite now needs one explicit **operational identity** layer in addition to provider-account identity:
  - `Models_System.md` still contains a concrete naming collision between **transport host** and **upstream provider**:
  - Models_System.md
  - canonical model IDs treat `provider_id` as upstream provider slug
  - provider_id
  - `Models_System.md` still mixes transport host and upstream provider in one `provider_id` vocabulary.
  - GPT-5.2 also sharpened that bridged/provider docs still lack a legal place for opaque-but-real provider continuity fields like `provider_attempt_ref?`, which means reconnect/replay semantics remain under-specified even before account-switch history is added
  - provider_attempt_ref?
  - Provider continuity fields like `provider_attempt_ref?` are named but still not owned by a stable schema slot.
  - If provider continuity remains opaque, the docs need an explicit opaque contract instead of silent omission.
  - `Models_System.md` still needs one explicit split between **transport host identity** and **upstream provider identity**, or requested/effective identity renderers will keep colliding those concepts
  - Transport-vs-upstream provider identity remains ambiguous in model/runtime examples.
  - Split transport host identity from upstream provider identity in model/provider contracts and downstream projection payloads.
  - Research Progress - 2026-03-16 - GPT-5.3-Codex Provider / Permission Closure
  - The provider boundary still lacks a legal place for rewrite-era correlation and pressure semantics:
  - Provider continuity can stay opaque, but only if opacity is explicit and projected as such.
  - Artifact provenance/trust needs to work even when the live worktree or provider session is gone.
  - provenance metadata currently requires `source_stage`, `source_phase_ids[]`, `persona_id`, `provider`, `model`, `timestamp`, which is useful but still weaker than the shared runtime identity grammar elsewhere
  - source_stage
  - source_phase_ids[]
  - persona_id
  - provider
  - model
  - timestamp
  - Validation pass reports in chain-wizard require `provider` and `model`, but not the fuller runtime identity fields now needed for multi-account/shared-runtime explanation.
  - required to include `pass_number`, `pass_name`, `pass_verdict`, `verdict_reason`, and `provider` / `model`
  - pass_number
  - pass_name
  - pass_verdict
  - verdict_reason
  - Validation-pass reports require `provider` and `model`, but not the fuller requested/effective runtime identity fields that other provider-using artifacts are now expected to expose.
  - `attempt.started` and the immutable provider handoff bundle should be isomorphic enough that one can be projected from the other without inventing new fields.
  - attempt.started
  - Those should not be collapsed into provider account identity because the same provider account may drive multiple operational targets, and the same operational target may be accessed by different provider accounts over time.
  - `Orchestrator_Page.md` still uses a weak worker identity row (`requested_persona_id`, `effective_persona_id`, provider, model, attempt_id, session_id?`) that does not expose `execution_role` or operational target context.
  - Orchestrator_Page.md
  - requested_persona_id
  - effective_persona_id
  - ) that does not expose
  - which provider attempt and effective account/runtime identity it used
  - `provider_attempt_ref` appears on `attempt_record` and is the closest thing to a provider/runtime execution trace handle.
  - provider_attempt_ref
  - attempt_record
  - Contribute(PR) vs DAE isolation is now a three-way collision between PR branch ownership, worktree/jail isolation, and provider execution context.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Provider / Model`
  - Provider / Model
  - `00-plans-index.md` still under-routes rewrite-critical owner docs, especially around Multi-Account, Provider, and Orchestrator packet ownership.
  - 00-plans-index.md
  - `OpenCode_Coverage_Matrix.md` and `OpenCode_Deep_Extraction.md` now pin more exact OpenCode limits: session identity must stay provider-native, SSE correlation fields remain under-specified, and requested/effective identity parity is still weaker for server-bridged providers than for direct providers.
  - OpenCode_Coverage_Matrix.md
  - OpenCode_Deep_Extraction.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - Slint rewrite, seglog/redb/Tantivy, and Provider terminology are already locked
  - tools / permissions / provider / identity integration
  - storage-plan still lacks the practical join model from attempt → provider → usage → receipt
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-010: Requested/effective account identity contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0069
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - requested/effective reviewer identity
  - Requested/effective must remain runtime-facing and auditable.
  - it carries requested/effective model IDs and permission snapshots
  - Permission snapshots still do not satisfy rewrite-era requested/effective disclosure:
  - Permission snapshots still omit requested state and identity context despite rewrite-era requested/effective disclosure needs.
  - Upgrade permission snapshots to include requested/effective values, downgrade reasons, and identity context.
  - requested/effective capability state is required conceptually
  - Permission snapshots still do not project requested/effective identity richly enough for blocked/approval truth.
  - Upgrade permission snapshots to carry requested/effective values, downgrade reasons, and identity context.
  - still needs scope-keyed approvals and richer requested/effective permission snapshots
  - requested/effective persona refs or embedded snapshot refs
  - requested/effective persona snapshot ref
  - requested/effective permission snapshot ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-010
- Fidelity gap refs: cov-010
- Required fidelity items:
- Exact required item: Add requested_account_id alongside requested_account_policy
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact required item: Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-010: Requested/effective account identity contract` exists in `Plans/CLI_Bridged_Providers.md`.
- Exact acceptance check: The `cov-010` repair states the exact requirement: Add requested_account_id alongside requested_account_policy
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-010` repair states the exact requirement: Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-010` repair is in the owner section for `Plans/CLI_Bridged_Providers.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Purpose
Define the **Provider facade** used by Puppet Master to run **bridged providers** (CLI-bridged and server-bridged) with a single, uniform contract for:

- **Structured request envelopes** (deterministic, replayable runs)
- **Normalized streaming events** (one consumer; no UI special-casing)
- **Tool-call correlation + reconciliation** (CLI oddities tolerated)
- **Authentication / UX-state detection** (logged out, expired or invalid, rate limit, outage)
- **Stream resilience** (bounded retry, replay safety, and circuit breaking)

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

This document owns bridged-provider transport normalization only. PM-internal child orchestration, crew control, runtime ceilings, and parent/child lineage remain owned by `Plans/orchestrator-subagent-integration.md` and `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md

Canonical mapping SSOT for upstream external-framework and A2A bridge concepts is `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. That document is external-reference guidance for adapter implementors. It MUST NOT be interpreted as approval to move PM-internal orchestration or child-run control onto A2A semantics.

ContractRef: ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/orchestrator-subagent-integration.md

## Canonical data-shape reconciliation

### Required data shape

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0070
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - But these are not all the same kind of data, and they should not all become first-class target identity.
  - provider/account disclosure data
  - data model still carries `hitl_request_id`
  - hitl_request_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The `BRIDGE_INVOKE_OPTIONS` record passed through the shell command line MUST preserve these fields:

```typescript
BRIDGE_INVOKE_OPTIONS {
  persona: string;            // Which Persona is active
  model: string;              // AI model requested (no provider precompute)
  model_variant?: string;     // Optional variant (effort, reasoning, etc.)
  provider_override?: string; // Explicitly requested provider
  run_mode: string;           // 'automate' | 'interactive' | 'diagnostic'
  trace_level: string;        // 'none' | 'summary' | 'detailed' | 'debug'
  account_id?: string;        // Requested GitHub account context
  dag_input?: string;         // Serialized DAG for this stage
  execution_role: string;     // Executor identity for permission/quota/logs
  shell_env?: Record;         // Safe shell environment snapshot
  worktree_id?: string;       // Assigned worktree for this node
  approve_mode?: string;      // 'auto_approve' | 'require_approval' | 'suggest_only'
  approval_id?: string;       // ID for prior approval context if resuming
  mutation_policy: string;    // 'conservative' | 'standard' | 'aggressive'
  timeout_ms?: number;        // Explicit timeout if scoped
  retry_policy?: string;      // 'backoff' | 'immediate' | 'custom'
  max_retries?: number;       // Retry ceiling for this provider
}
```

ContractRef: Primitive:Provider, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
