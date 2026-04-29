## 5. DRY enforcement (contract-referenced graph)

### 5.1 Node shards MUST reference Project Contract IDs

- Every plan node shard (`plan_graph/nodes/<node_id>.json`) MUST include `contract_refs` with **at least one**
  `ProjectContract:*` entry (required by schema).
- Node shards MUST NOT repeat or inline the contract pack’s canonical specifications; use `contract_refs` instead.

ContractRef: SchemaID:pm.project-plan-node.v1, ContractName:Plans/DRY_Rules.md#7

### 5.2 Acceptance is cross-referenced, not duplicated

- `acceptance_manifest.json` MUST reference:
  - node IDs via `nodes[].node_id`
  - project contract IDs via `nodes[].checks[].contract_refs` (include relevant `ProjectContract:*` entries)
- Acceptance manifest checks MUST cover node checks:
  - Every node shard `acceptance[].check_id` MUST appear under that same `node_id` in `acceptance_manifest.json`.

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md

### 5.3 Human plan may repeat summary, but must point to canonical contracts

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0451
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - workers may nominate but should not mint canonical concerns directly
  - Current settings/inheritance may still be shown elsewhere, but must not overwrite history.
  - should be chronological but windowed
  - Those may overlap, but they are not the same field.
  - but not an equally canonical `requested_account_id`
  - requested_account_id
  - But it should not try to encode:
  - Owner docs were updated, but **consumer docs were not canon-collapsed**.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

`plan.md` is for humans; it may summarize for readability, but any repeated spec text MUST include a canonical pointer:

ContractRef: ContractName:Plans/DRY_Rules.md#7

`Canonical source: ProjectContract:<...>`

ContractRef: ContractName:Plans/DRY_Rules.md#7

