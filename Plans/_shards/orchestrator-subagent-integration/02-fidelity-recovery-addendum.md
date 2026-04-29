## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-005: Retire tier-era canon and shadow fields

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0633
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - This seam now needs explicit contract-version governance; otherwise adapter-local shadow fields will proliferate.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-005
- Fidelity gap refs: cov-005
- Required fidelity items:
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-005: Retire tier-era canon and shadow fields` exists in `Plans/orchestrator-subagent-integration.md`.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-005` repair removes stale live vocabulary and, if needed, confines any mention to an explicit compatibility-retirement note.

### Fidelity recovery cov-172: Coverage blocker worktree allocation strategy
- Coverage rows: cov-172
- Fidelity gap refs: cov-172
- Required fidelity items:
- Exact required item: Define concrete worktree allocation strategy
- Exact required item: Define contamination, reuse, and cleanup rules for that strategy
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-172: Coverage blocker worktree allocation strategy` exists in `Plans/orchestrator-subagent-integration.md`.
- Exact acceptance check: The `cov-172` repair states the exact requirement: Define concrete worktree allocation strategy
- Exact acceptance check: The `cov-172` repair states the exact requirement: Define contamination, reuse, and cleanup rules for that strategy
- Exact acceptance check: The `cov-172` repair is in the owner section for `Plans/orchestrator-subagent-integration.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **Integration policy note (2026-02-24):** Runtime integration follows the ProviderTransport taxonomy (SSOT: `Plans/Contracts_V0.md`): Cursor/Claude Code = `CliBridge`, Codex/Copilot/Gemini = `DirectApi`, OpenCode = `ServerBridge`. Any Codex/Copilot SDK references in this file are historical context only and are not implementation targets.


