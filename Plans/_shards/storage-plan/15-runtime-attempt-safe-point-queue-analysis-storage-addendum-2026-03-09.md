## Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0652
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - live execution mutations should stay narrow unless the runtime has an explicit safe batch semantic for that exact action
  - `attempt.started` / usage / storage / auth surfaces still lack one crisp contract for how requested/effective/provider/account identity propagates end to end
  - attempt.started
  - Storage already has the stronger blocked and attempt identities, but still preserves tier-era keys as peer canonical records.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Storage and projections MUST persist the scheduler and recovery model without SQLite.

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id` rather than only by `node_id`
- the latest blocked state must remain inspectable after app restart
- `ready_since_utc` must survive projection refresh while the node remains continuously ready
- stale attempts from an older `replan_generation` must remain queryable for history but may not be resumed as active work

### Persistence safety rules
- safe-point metadata must persist before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows
- queue-analysis records are append-only observability data; later projections may summarize them, but the canonical pass history must remain reconstructable
