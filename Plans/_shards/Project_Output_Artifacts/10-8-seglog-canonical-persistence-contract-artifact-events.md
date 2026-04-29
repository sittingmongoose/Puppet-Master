## 8. Seglog canonical persistence contract (artifact events)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0450
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Artifact / persistence / lineage owner docs still have field-family holes that downstream passes kept surfacing:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All Project Plan Package artifacts are **canonical in seglog**. The filesystem tree is a regenerable export/cache only.

### 8.1 Required seglog fields (per artifact event)

Each persisted artifact event MUST include:

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog

- `artifact_id`
- `artifact_type`
- `schema_version`
- `logical_path`
- `content_bytes`
- `content_hash`
- `ts`
- Correlation fields for traceability:
  - `session_id`
  - `agent_id`

Field semantics (normative):

- `logical_path` MUST be workspace-root relative (for example `.puppet-master/project/plan_graph/index.json`).
- `content_bytes` is the full artifact payload bytes (if serialized as JSON, this is base64-encoded bytes).
- `content_hash` is the SHA-256 of `content_bytes` (hex) and MUST match the materialized file bytes.
- Filesystem export MUST be reconstructible by replaying seglog events keyed by `logical_path`.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog

### 8.2 Canonical `artifact_type` values (Project Plan Package)

- `requirements` → `.puppet-master/project/requirements.md`
- `contracts_pack` → `.puppet-master/project/contracts/**` (including required `contracts/index.json`)
- `plan_human` → `.puppet-master/project/plan.md`
- `plan_graph_index` → `.puppet-master/project/plan_graph/index.json`
- `plan_graph_node` → `.puppet-master/project/plan_graph/nodes/<node_id>.json`
- `plan_graph_edges` → `.puppet-master/project/plan_graph/edges.json` (optional)
- `plan_graph_monolith` → `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` (optional; non-canonical derived export)
- `acceptance_manifest` → `.puppet-master/project/acceptance_manifest.json`
- `auto_decisions` → `.puppet-master/project/auto_decisions.jsonl`
- `ui_wiring_matrix` → `.puppet-master/project/ui/wiring_matrix.json` (optional GUI)
- `ui_command_catalog` → `.puppet-master/project/ui/ui_command_catalog.json` (optional GUI)
- `validation_pass_report` → `.puppet-master/project/validation/pass_<N>_report.json` (one per pass; N=1,2,3; see §10 for lineage, History/Ledger, and export requirements)
- `requirements_quality_report` → `.puppet-master/project/traceability/requirements_quality_report.json` (derived verification output; see §11)
- `requirements_coverage_json` → `.puppet-master/project/traceability/requirements_coverage.json` (derived verification output; see §11)
- `requirements_coverage_md` → `.puppet-master/project/traceability/requirements_coverage.md` (derived verification output; see §11)
- `quickstart_md` → `.puppet-master/project/quickstart.md` (optional derived human convenience output; see §12)

