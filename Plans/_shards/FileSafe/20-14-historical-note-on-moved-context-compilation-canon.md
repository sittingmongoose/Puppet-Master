## 14. Historical note on moved context-compilation canon

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0224
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - graph/use pivots still rely on `tier_id` where storage/receipts have moved to `attempt_id` + `usage_event_ref`
  - tier_id
  - attempt_id
  - usage_event_ref
  - The remaining work on this research branch is now dominated by cleanup of overlapping canon, not missing concepts.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The context-compilation and token-efficiency material that previously lived in this section is no longer canonical here.

`Plans/Prompt_Pipeline.md` is now the canonical owner for:
- context compilation algorithms
- delta context selection
- cache heuristics
- marker-file / compaction-aware reread behavior
- skill bundling and prompt-compaction policy

FileSafe remains responsible only for safety checks over the fully compiled prompt and related attachments after Prompt Pipeline assembly and before provider dispatch.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

---

