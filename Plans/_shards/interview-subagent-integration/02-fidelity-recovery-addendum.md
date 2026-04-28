## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-065: Shared conversational/runtime boundary
- Coverage rows: cov-065
- Fidelity gap refs: cov-065
- Required fidelity items:
- Exact required item: Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator
- Exact required item: They remain distinct actor/run kinds rather than package/seam/node execution objects
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-065: Shared conversational/runtime boundary` exists in `Plans/interview-subagent-integration.md`.
- Exact acceptance check: The `cov-065` repair states the exact requirement: Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator
- Exact acceptance check: The `cov-065` repair states the exact requirement: They remain distinct actor/run kinds rather than package/seam/node execution objects
- Exact acceptance check: The `cov-065` repair is in the owner section for `Plans/interview-subagent-integration.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


