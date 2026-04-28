## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-064: Shared conversational/runtime boundary
- Coverage rows: cov-064
- Fidelity gap refs: cov-064
- Required fidelity items:
- Exact required item: Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator
- Exact required item: They remain distinct actor/run kinds rather than package/seam/node execution objects
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-064: Shared conversational/runtime boundary` exists in `Plans/assistant-chat-design.md`.
- Exact acceptance check: The `cov-064` repair states the exact requirement: Assistant/chat/interview/builder actors share provider/runtime identity semantics with Orchestrator
- Exact acceptance check: The `cov-064` repair states the exact requirement: They remain distinct actor/run kinds rather than package/seam/node execution objects
- Exact acceptance check: The `cov-064` repair is in the owner section for `Plans/assistant-chat-design.md` and is not only a downstream consumer note.

### Fidelity recovery cov-073: Canonical route payload
- Coverage rows: cov-073
- Fidelity gap refs: cov-073
- Required fidelity items:
- Exact required item: Treat resume_url as serialized transport of that route payload
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-073: Canonical route payload` exists in `Plans/assistant-chat-design.md`.
- Exact acceptance check: The `cov-073` repair states the exact requirement: Treat resume_url as serialized transport of that route payload
- Exact acceptance check: The `cov-073` repair is in the owner section for `Plans/assistant-chat-design.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

