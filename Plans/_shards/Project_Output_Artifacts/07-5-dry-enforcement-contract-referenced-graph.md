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

`plan.md` is for humans; it may summarize for readability, but any repeated spec text MUST include a canonical pointer:

ContractRef: ContractName:Plans/DRY_Rules.md#7

`Canonical source: ProjectContract:<...>`

ContractRef: ContractName:Plans/DRY_Rules.md#7

