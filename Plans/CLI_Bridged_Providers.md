# CLI-Bridged Providers (Provider Facade)

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-010: Requested/effective account identity contract
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
