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

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0576
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - the rewrite should generalize that idea beyond wizards so project-level attention objects can route to Orchestrator, Chat, Source Control, GitHub, Usage, or Settings with the same internal payload model
  - `FinalGUISpec.md` thread search already says result clicks navigate to the exact message in its thread, but that behavior is still expressed as search-local prose rather than as one normalized route payload.
  - FinalGUISpec.md
  - `project_state:v1:{project_id}` and surface-local project-state records are adjacent restore context, not the canonical route payload.
  - project_state:v1:{project_id}
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-073
- Fidelity gap refs: cov-073
- Required fidelity items:
- Exact required item: Treat resume_url as serialized transport of that route payload
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-073: Canonical route payload` exists in `Plans/assistant-chat-design.md`.
- Exact acceptance check: The `cov-073` repair states the exact requirement: Treat resume_url as serialized transport of that route payload
- Exact acceptance check: The `cov-073` repair is in the owner section for `Plans/assistant-chat-design.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

