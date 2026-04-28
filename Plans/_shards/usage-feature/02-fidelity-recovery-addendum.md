## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-016: Export taxonomy and manifest contract
- Coverage rows: cov-016
- Fidelity gap refs: cov-016
- Required fidelity items:
- Exact required item: Define record export, bundle export, and view export as distinct export classes
- Exact required item: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-016: Export taxonomy and manifest contract` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-016` repair states the exact requirement: Define record export, bundle export, and view export as distinct export classes
- Exact acceptance check: The `cov-016` repair states the exact requirement: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Exact acceptance check: The `cov-016` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-045: Projection trust and action gating
- Coverage rows: cov-045
- Fidelity gap refs: cov-045
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-045: Projection trust and action gating` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-045` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-045` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-045` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-089: Execution role and operational identity
- Coverage rows: cov-089
- Fidelity gap refs: cov-089
- Required fidelity items:
- Exact required item: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-089: Execution role and operational identity` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-089` repair states the exact requirement: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Exact acceptance check: The `cov-089` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-092: Account switch and pressure history
- Coverage rows: cov-092
- Fidelity gap refs: cov-092
- Required fidelity items:
- Exact required item: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-092: Account switch and pressure history` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-092` repair states the exact requirement: Let Usage, History, Ledger, and Orchestrator consume the same durable event family
- Exact acceptance check: The `cov-092` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-162: Identity and blocked-policy transfer cluster
- Coverage rows: cov-162
- Fidelity gap refs: cov-162
- Required fidelity items:
- Exact required item: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact required item: Carry usage switch-history and usage execution-role follow-through
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-162: Identity and blocked-policy transfer cluster` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-162` repair states the exact requirement: Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs
- Exact acceptance check: The `cov-162` repair states the exact requirement: Carry usage switch-history and usage execution-role follow-through
- Exact acceptance check: The `cov-162` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-184: Bridge-field precedence for attempt/provider/usage/receipt joins
- Coverage rows: cov-184
- Fidelity gap refs: cov-184
- Required fidelity items:
- Exact required item: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact required item: None of those bridge fields replace the primary local key
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-184: Bridge-field precedence for attempt/provider/usage/receipt joins` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-184` repair states the exact requirement: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact acceptance check: The `cov-184` repair states the exact requirement: None of those bridge fields replace the primary local key
- Exact acceptance check: The `cov-184` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-198: Blocked-owner eight-kind taxonomy and escalation ladder surfaces
- Coverage rows: cov-198
- Fidelity gap refs: cov-198
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-198: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-198` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-198` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

### Fidelity recovery cov-203: Artifact envelope routing preference
- Coverage rows: cov-203
- Fidelity gap refs: cov-203
- Required fidelity items:
- Exact required item: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact required item: Require runtime artifacts summarizing external operations to carry receipt linkage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-203: Artifact envelope routing preference` exists in `Plans/usage-feature.md`.
- Exact acceptance check: The `cov-203` repair states the exact requirement: Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger
- Exact acceptance check: The `cov-203` repair states the exact requirement: Require runtime artifacts summarizing external operations to carry receipt linkage
- Exact acceptance check: The `cov-203` repair is in the owner section for `Plans/usage-feature.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


