# Misc Plan -- Agent Artifacts, Cleanup & Related Improvements

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Worktree / SCM / Parallelism Impacts
  - Cleanup Priorities

#### Source target target-0356
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Worktree / SCM / Parallelism Impacts
  - Cleanup Priorities
- Exact required items represented:
  - Define lane↔worktree mapping
  - Specify [retired-token-12] detection and cross-lane reuse rules
  - Define [retired-token-9] restore for lane/package context
  - Resolve [retired-token-2] vs [retired-token-1] contradiction
  - Register PM-managed worktrees in source control visibility
  - Remove legacy `[retired-token-7]` / `[retired-token-8]` drift and [retired-token-13].
  - Normalize [retired-token-9] / [retired-token-10] / [retired-token-11] / [retired-token-12] terminology into one authoritative mapping and event taxonomy.
  - Docs involved: `Orchestrator_Page.md`, `Contracts_V0.md`, related UI/runtime docs
  - Orchestrator_Page.md
  - Contracts_V0.md
  - `Plans/feature-list.md`, `Plans/newfeatures.md`, `Plans/MiscPlan.md`
  - Plans/feature-list.md
  - Plans/newfeatures.md
  - Plans/MiscPlan.md
  - `Plans/MiscPlan.md`
  - MiscPlan cleanup = cleaning files inside a workspace/worktree
  - Cleanup must be gated by more than age.
  - cleanup should reduce live clutter without erasing the historical object model
  - Re-check `FinalGUISpec.md` and related UX docs later for copy that uses informal synonyms where canonical terms are now required.
  - FinalGUISpec.md
  - This connects to the earlier lane/worktree cleanup work:
  - The missing `usage_event_ref` definition is now a hard blocker for trust-safe cross-surface navigation, not just a naming cleanup.
  - usage_event_ref
  - now clearly a schema-owner doc that will need a versioned migration, not only prose cleanup
  - `usage-feature.md` and related docs already rely on `usage_event_ref`, but no authoritative shape exists.
  - usage-feature.md
  - now clearly needs transport/upstream naming cleanup to keep requested/effective identity deterministic
  - consumer-doc cleanup for requested/effective identity fields
  - still needs transport/upstream identity cleanup to prevent projection ambiguity
  - tab/layout/help/glossary cleanup
  - This tranche is no longer just “supporting docs need cleanup.” Several owner docs are currently making false or unverifiable claims that would mislead later reconciliation or gate implementation.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `route_target` and `OpenSubject` are related primitives with different jobs.
  - route_target
  - OpenSubject
  - They should be fixed in the same pass as the surrounding owner-consumer reconciliation, not deferred as cleanup trivia.
  - Highest-priority owner cleanup set
  - owner-doc supersession cleanup
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - exact `ContractRef` / section-anchor / duplicate-number cleanup in owner docs first
  - ContractRef
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - The routing cleanup will stay weak if `Progression_Gates.md` remains flat-command-only while `Contracts_V0.md` and `UI_Command_Catalog.md` move to route/open primitives.
  - Progression_Gates.md
  - UI_Command_Catalog.md
  - `UI_Command_Catalog.md` second for command-family cleanup
  - `FinalGUISpec.md` third for visible shell/view cleanup
  - Primary consumer cleanup docs:
  - Then consumer cleanup and same-file supersession collapse.
  - summary: Final follow-up chunk audits confirmed that the remaining work is now classification cleanup and handoff, not more discovery; the blocker bundle is ready for Ledger Condenser.
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
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


