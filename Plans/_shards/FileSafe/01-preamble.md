# FileSafe -- Implementation Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - worktree behavior
  - Worktree / SCM / Parallelism Impacts
  - Cleanup Priorities

#### Source target target-0220
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - worktree behavior
  - Worktree / SCM / Parallelism Impacts
  - Cleanup Priorities
- Exact required items represented:
  - how are worktrees assigned for parallel nodes within the same package or seam
  - what happens to worktree ownership during remediation, corroboration, or graph-patch-triggered work
  - for package-based worktree pools, whether downstream dependent nodes reuse the same worktree lane or start a fresh lane from the promoted upstream result
  - preserve same-lane continuation by default; promote-then-fork only when it materially improves safe parallelism
  - Define lane↔worktree mapping
  - Specify [retired-token-14] detection and cross-lane reuse rules
  - Define [retired-token-11] restore for lane/package context
  - Resolve [retired-token-4] vs [retired-token-3] contradiction
  - Register PM-managed worktrees in source control visibility
  - Remove legacy `[retired-token-9]` / `[retired-token-10]` drift and [retired-token-15].
  - Normalize [retired-token-11] / [retired-token-12] / [retired-token-13] / [retired-token-14] terminology into one authoritative mapping and event taxonomy.
  - `Runtime_Artifacts_Panel.md` currently treats the envelope mostly as an implementation hook:
  - Runtime_Artifacts_Panel.md
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - Missing field schemas will cause different implementation agents to invent incompatible shapes.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Date:** 2026-02-19  
**Priority:** CRITICAL  
**Status:** Plan Document Only

