## 7. Plan graph requirements (**sharded-only canonical** + optional derived export)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0449
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `view export`
  - view export
  - Optional derived `decomposition_context` can still carry:
  - decomposition_context
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Puppet Master MUST produce user-project plans as a **sharded-only plan graph** under:

ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md

`.puppet-master/project/plan_graph/`

ContractRef: SchemaID:pm.project-plan-graph-index.v1

The sharded graph is the **canonical** headless execution input. `plan.md` remains the required human-readable view.

### Policy: Sharded-only plan graph entrypoint (locked decision)

- The canonical user-project plan graph entrypoint is **always** `.puppet-master/project/plan_graph/index.json`.
- Node files live at `.puppet-master/project/plan_graph/nodes/<node_id>.json`.
- An optional edges file may live at `.puppet-master/project/plan_graph/edges.json`.
- **There is NO canonical `.puppet-master/project/plan_graph.json`.**
- If a monolithic export is materialized, it MUST be:
  - labeled as a derived/export artifact (not canonical),
  - placed at `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`,
  - validated only as a consistency check against the sharded graph (never as the canonical input for orchestration or validation).
- This is a **locked decision**; no open questions remain.

ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md

### 7.0 Node ID determinism (normative; applies to all sharded graphs)

- Node IDs MUST be **stable and deterministic** across runs given the same inputs.
  - MUST NOT depend on timestamps, randomness, session IDs, or nondeterministic ordering.
  - MUST be reproducible from a canonical representation of the node intent (so shard filenames are stable).

ContractRef: Invariant:INV-005, PolicyRule:Decision_Policy.md§2

### 7.1 `plan_graph/index.json` (required; canonical entrypoint)

- Path: `.puppet-master/project/plan_graph/index.json`
- Schema: `Plans/project_plan_graph_index.schema.json` (`pm.project-plan-graph-index.v1`)

Normative requirements:

- The graph MUST be executable headless (no reliance on GUI-only artifacts).
- `schema_version` MUST be present and MUST match the schema’s expected version for `pm.project-plan-graph-index.v1`.
- `nodes[]` MUST list every node shard and MUST include at minimum:
  - `path` as the shard-relative path: `nodes/<node_id>.json`
  - `sha256` as the SHA-256 of the referenced shard file bytes (hex)
ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md
- `entrypoints` MUST be present and MUST reference existing node IDs.
- `execution_ordering` MUST be present and MUST define deterministic readiness/selection/completion behavior.
  - `execution_ordering.node_state_source` MUST be `plan_graph/nodes/<node_id>.json`.
- `validation.targets` MUST include validation pointers sufficient to validate the graph in isolation, including at minimum:
  - `acceptance_manifest` (recommended relative path: `../acceptance_manifest.json`)
  - `contracts_index` (recommended relative path: `../contracts/index.json`)
- Overseer semantics for status transitions and auto-marking MUST follow `Plans/Executor_Protocol.md`.
- Dependency semantics are canonicalized as follows: `blockers[]` is the readiness-driving dependency list, `unblocks[]` is the forward adjacency projection, `depends_on[]` is optional compatibility metadata only, and `edges.json` (if materialized) is a derived consistency artifact rather than an authority.

ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Executor_Protocol.md

### 7.2 `plan_graph/nodes/<node_id>.json` (required; one node per file)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0452
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `node_id?`
  - node_id?
  - monotonic per `{ run_id, node_id }`
  - { run_id, node_id }
  - that `request_id` maps 1:1 to the underlying `{ run_id, node_id, blocked_sequence }`
  - request_id
  - { run_id, node_id, blocked_sequence }
  - `object_id = <node_id>`
  - object_id = <node_id>
  - `blocked_projection.{run_id}.{node_id}.{blocked_sequence}`
  - blocked_projection.{run_id}.{node_id}.{blocked_sequence}
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- Path: `.puppet-master/project/plan_graph/nodes/<node_id>.json`
- Schema: `Plans/project_plan_node.schema.json` (`pm.project-plan-node.v1`)

Required fields include (see schema for full detail):  
`node_id`, `objective`, `contract_refs`, `acceptance`, `evidence_required`, `allowed_tools`, `tool_policy_mode`,
`policy_mode`, `change_budget`, `blockers`, `unblocks`, `status`, `evidence_pointer`, `verifier_result`,
`decision_refs`, `spec_lock_requirements`.

Node completeness rules (normative; sharding requirement):

- Each node file MUST contain, at minimum:
  - `objective`
  - `contract_refs`
  - `acceptance`
  - `evidence_required`
- `allowed_tools` and policy declaration (`policy_mode` and/or `tool_policy_mode` per schema)
- `change_budget`
- `blockers` and `unblocks`
- execution lifecycle fields: `status`, `evidence_pointer`, `verifier_result`
- deterministic decision and readiness fields: `decision_refs`, `spec_lock_requirements`
ContractRef: SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md

ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-001

Integrity rules:

- In-file `node_id` MUST exactly match `<node_id>` in the filename.
- Every node MUST include `contract_refs` with at least one resolvable `ProjectContract:*` (DRY; see §5.1).
- Every node MUST include automatable `acceptance[]` criteria (no manual-only checks).
- Every node MUST declare `allowed_tools`, `tool_policy_mode`, `policy_mode`, and `change_budget` to bound autonomy and blast radius.
- Every node MUST declare `evidence_required` (reserved output path) so evidence production is enforceable.
- `evidence_required.path` is a **reserved logical output path** for execution evidence (not part of the Project Plan Package’s initial output);
  it MUST be consistent between the node shard and the acceptance manifest for that node.

ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md

### 7.3 `plan_graph/edges.json` (optional)

If present, `.puppet-master/project/plan_graph/edges.json` MUST be consistent with dependency semantics expressed in node shards
(`blockers`, `unblocks`, and optional `depends_on`).

`edges.json` MUST NOT be required for headless execution and MUST NOT override shard-local `blockers[]` readiness semantics.

ContractRef: Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md

### 7.4 Optional derived export: `plan_graph/exports/plan_graph.monolithic.json` (non-canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0453
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - monolithic plan-graph export remains derived, never canonical
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Puppet Master MAY export a monolithic graph for convenience:

- Path: `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`
- Schema: `pm.project-plan-graph.v1` (portable monolithic graph)

If present:

- It MUST be a faithful, lossless projection of the canonical shard set (same node IDs, same node fields, same `entrypoints`).
- It is **NOT** the canonical plan representation and MUST NOT be required for validation or orchestration.

ContractRef: SchemaID:pm.project-plan-graph.v1, ContractName:Plans/Project_Output_Artifacts.md

