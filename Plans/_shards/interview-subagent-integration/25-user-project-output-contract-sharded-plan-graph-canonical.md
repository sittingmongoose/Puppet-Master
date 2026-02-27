## User-Project Output Contract (Sharded plan_graph/ canonical)

For user projects, Interviewer/Wizard outputs must target `.puppet-master/project/` and not rely on any user-project `Plans/` directory.

Required artifact set:

- `.puppet-master/project/requirements.md`
- `.puppet-master/project/contracts/` (includes required `contracts/index.json`)
- `.puppet-master/project/plan.md`
- `.puppet-master/project/glossary.md` (optional, recommended)
- `.puppet-master/project/plan_graph/` (canonical sharded graph: required `index.json` + `nodes/<node_id>.json`; optional `edges.json`)
- `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` (optional derived export only; MUST match shards if present)
- `.puppet-master/project/acceptance_manifest.json`
- `.puppet-master/project/auto_decisions.jsonl`
- `.puppet-master/project/evidence/<node_id>.json` (produced during execution; schema `pm.evidence.schema.v1`)

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

Canonical rules:

- Plan graph output MUST include the canonical sharded entrypoint `.puppet-master/project/plan_graph/index.json` plus referenced node shards under `.puppet-master/project/plan_graph/nodes/`; this is the only canonical execution input.
- `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is optional and non-canonical; if materialized, it MUST be consistent with the sharded graph.
- `plan.md` remains mandatory as the human-readable summary for operators.
- Contract pack uses stable `ProjectContract:*` IDs resolved via `contracts/index.json`; every node must reference at least one project contract ID.
- All artifacts above must be persisted canonically in seglog as full-content artifact events.
- Interview-generated Markdown/text artifacts under `.puppet-master/**` that reach packaging triggers MUST comply with `Plans/Document_Packaging_Policy.md` and pass its full audit set.
- Field-level schema requirements, deterministic node-ID rules, and validation pointers are defined in `Plans/Project_Output_Artifacts.md` (SSOT).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### Contract Layer Crosswalk (User Project)

| Concern | Contract |
|---|---|
| Canonical requirements | `.puppet-master/project/requirements.md` |
| Contract pack | `.puppet-master/project/contracts/` + `contracts/index.json` |
| Human plan summary | `.puppet-master/project/plan.md` |
| Project glossary (optional) | `.puppet-master/project/glossary.md` |
| Machine plan graph | `.puppet-master/project/plan_graph/index.json` + `plan_graph/nodes/<node_id>.json` (optional `plan_graph/edges.json`; optional derived export `plan_graph/exports/plan_graph.monolithic.json`) |
| Acceptance index | `.puppet-master/project/acceptance_manifest.json` |
| Deterministic decision stream | `.puppet-master/project/auto_decisions.jsonl` |
| Execution evidence (per node) | `.puppet-master/project/evidence/<node_id>.json` |

Authoritative schema and persistence contract: `Plans/Project_Output_Artifacts.md`.

### Event Model Update: `interview.artifact.generated`

`interview.artifact.generated` must cover each required artifact type under `.puppet-master/project/...`.

Required payload fields:

- `run_id`
- `artifact_type`
- `logical_path`
- `content_type`
- `content` (full content or chunk payload)
- `sha256`
- `chunk_index` (required for chunked payloads)
- `chunk_count` (required for chunked payloads)
- `integrity_finalized` (true on final integrity event)

Allowed `artifact_type` values for user-project planning output:

- `requirements`
- `contracts_pack`
- `plan_human`
- `plan_graph_index`
- `plan_graph_node`
- `plan_graph_edges`
- `acceptance_manifest`
- `auto_decisions`
- `glossary` (optional)

Large payload handling:

- Emit deterministic chunk sequence events.
- Emit final integrity event with canonical `sha256` for reconstructed content.

### Execution-Critical Validation References

Execution-critical node requirements (required fields, determinism, evidence, and policy constraints) and deterministic decision logging (`.puppet-master/project/auto_decisions.jsonl`) are defined by `Plans/Project_Output_Artifacts.md` and enforced via the dry-run validator.

