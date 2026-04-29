## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0214
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `OpenFile { path }` is now unambiguously workspace-root-only, proving that generated/runtime opens need a separate open-by-identity router.
  - OpenFile { path }
  - subject-open / open-by-identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Acceptance carry-through
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage
- Resolve artifact open flows by artifact_id and then by linked envelope refs
