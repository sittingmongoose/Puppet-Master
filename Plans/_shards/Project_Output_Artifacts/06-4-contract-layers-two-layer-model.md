## 4. Contract layers (two-layer model)

### A) Platform Contracts (internal SSOT; not copied into user projects)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0454
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `projects:v1` is too thin
  - projects:v1
  - `projects:v1` as overloaded status blobs
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Platform Contracts define Puppet Master-internal invariants (event model, tool IDs, policy semantics, decision policy, etc.).  
They may be **referenced** from project artifacts by stable IDs (for example `PolicyRule:*`, `SchemaID:*`) but are **not embedded verbatim** in user projects.

### B) Project Contracts (generated per user project)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0455
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `attention` = does this project currently need user attention
  - attention
  - one current `project_summary` row per project
  - project_summary
  - many `project_attention_item` rows per project
  - project_attention_item
  - artifact-backed `generated://<artifact_id>`
  - generated://<artifact_id>
  - `generated://...`
  - generated://...
  - transient `generated://<artifact_id>` source buffer
  - transient `generated://<artifact_id>` source buffers are a realization detail, not the canonical identity
  - `generated://<artifact_id>`
  - otherwise it resolves to transient `generated://<artifact_id>` source opening
  - Keep `generated://<artifact_id>` as resolver output, not canonical subject identity.
  - Keep `preview_subject_id` and `generated://<artifact_id>` where they belong:
  - preview_subject_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Project Contracts are generated per user project and stored under:

`.puppet-master/project/contracts/` (Project Contract Pack)

They are the **canonical** source for project-specific specs/boundaries, and they are referenced by stable `ProjectContract:*` IDs.

#### Required: `contracts/index.json` (Project Contract Pack index)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0457
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `meta.json` now uses `pm.work_item_meta.v2`.
  - meta.json
  - pm.work_item_meta.v2
  - `current_state.md`, `canon_inventory.json`, and `open_gaps.json` now use the v2 shapes.
  - current_state.md
  - canon_inventory.json
  - open_gaps.json
  - `canon_inventory.json` now lags the sharpened audit wording again, so the next useful stage is `Ledger Condenser`.
  - Ledger Condenser
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- Path: `.puppet-master/project/contracts/index.json`
- Schema: `Plans/contracts_index.schema.json` (`pm.project_contracts_index.schema.v1`)
- Purpose: canonical mapping from `ProjectContract:*` → `{ kind, path, sha256, ... }`
  - `contracts[].contract_id` is the canonical ID (must match `^ProjectContract:` per schema)
  - `contracts[].path` MUST be contract-pack relative (relative to `.puppet-master/project/contracts/`)

ContractRef: SchemaID:pm.project_contracts_index.schema.v1

DRY rule (normative): node shard `contract_refs` and acceptance check `contract_refs` MUST reference `contracts[].contract_id` values from this index.

ContractRef: SchemaID:pm.project_contracts_index.schema.v1, ContractName:Plans/DRY_Rules.md#7

