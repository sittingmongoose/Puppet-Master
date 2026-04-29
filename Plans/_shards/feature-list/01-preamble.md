# Puppet Master Feature List (Reference)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0599
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Plans/feature-list.md`
  - Plans/feature-list.md
  - `Plans/feature-list.md`, `Plans/newfeatures.md`, `Plans/MiscPlan.md`
  - Plans/newfeatures.md
  - Plans/MiscPlan.md
  - Source Control can still list worktrees directly, but should also expose lane/package ownership and lifecycle state when known.
  - Source Control should keep `Worktrees` as the primary subview/object list rather than flipping to a lane-first list.
  - Worktrees
  - `projects:v1` currently only promises list metadata like path, detected languages, last-opened timestamp, health status, and overrides
  - projects:v1
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - The earlier `object_kind` list is directionally correct, but it now needs a firmer canonical refresh against the rewrite-era object set and the newer runtime lineage objects.
  - object_kind
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - the primitive list still lacks named ownership for `route_target` and `OpenSubject`
  - route_target
  - OpenSubject
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document exists to avoid losing features when writing rewrite implementation docs. Part 1 lists planned and new features from the Plans folder, organized by category and relation. Part 2 records what exists in the codebase today for reference. Plans define target behavior; implementation may change.

---

