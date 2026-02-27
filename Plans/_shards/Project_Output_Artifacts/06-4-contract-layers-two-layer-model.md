## 4. Contract layers (two-layer model)

### A) Platform Contracts (internal SSOT; not copied into user projects)

Platform Contracts define Puppet Master-internal invariants (event model, tool IDs, policy semantics, decision policy, etc.).  
They may be **referenced** from project artifacts by stable IDs (for example `PolicyRule:*`, `SchemaID:*`) but are **not embedded verbatim** in user projects.

### B) Project Contracts (generated per user project)

Project Contracts are generated per user project and stored under:

`.puppet-master/project/contracts/` (Project Contract Pack)

They are the **canonical** source for project-specific specs/boundaries, and they are referenced by stable `ProjectContract:*` IDs.

#### Required: `contracts/index.json` (Project Contract Pack index)

- Path: `.puppet-master/project/contracts/index.json`
- Schema: `Plans/contracts_index.schema.json` (`pm.project_contracts_index.schema.v1`)
- Purpose: canonical mapping from `ProjectContract:*` → `{ kind, path, sha256, ... }`
  - `contracts[].contract_id` is the canonical ID (must match `^ProjectContract:` per schema)
  - `contracts[].path` MUST be contract-pack relative (relative to `.puppet-master/project/contracts/`)

ContractRef: SchemaID:pm.project_contracts_index.schema.v1

DRY rule (normative): node shard `contract_refs` and acceptance check `contract_refs` MUST reference `contracts[].contract_id` values from this index.

ContractRef: SchemaID:pm.project_contracts_index.schema.v1, ContractName:Plans/DRY_Rules.md#7

