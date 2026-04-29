## Success Criteria

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0695
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `success`
  - success
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- Users can see 5h/7d usage (and plan, where available) without running a manual "usage" command.
- Users can open a dedicated Usage view (or equivalent) to see ledger and, if implemented, analytics.
- When approaching or hitting a limit, users see a clear warning or message and a path to Usage or tier config.
- Tier/config flows show current usage when choosing a platform.
- Usage section aligns with ecosystem norms: **always-visible** 5h/7d (and plan where available), plus optional analytics/cost view (yume/openclaudecto-style).

