## 2. Required artifact set (SSOT) — Project Plan Package

These are the **required artifacts** (staging paths in the user workspace) and **must be persisted canonically in seglog**:

1) `.puppet-master/project/requirements.md`  
2) `.puppet-master/project/contracts/` (Project Contract Pack)  
3) `.puppet-master/project/plan.md`  
4) `.puppet-master/project/plan_graph/` (**canonical; sharded plan graph**) containing:
   - `index.json` (entrypoints, subgraph listing, schema version, validation pointers)
   - `nodes/<node_id>.json` (one node per file)
   - optional `edges.json`
5) `.puppet-master/project/acceptance_manifest.json`  
6) `.puppet-master/project/auto_decisions.jsonl`  
7) Optional (non-canonical derived export):
   - `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` (monolithic export; NOT required; NOT canonical)
8) Optional (GUI):
    - `.puppet-master/project/ui/wiring_matrix.json`
    - `.puppet-master/project/ui/ui_command_catalog.json`
9) Required (derived verification outputs — non-canonical with respect to planning decisions; canonical with respect to verification outputs):
    - `.puppet-master/project/traceability/requirements_quality_report.json` (machine-readable; schema: `pm.requirements_quality_report.schema.v1`)
    - `.puppet-master/project/traceability/requirements_coverage.json` (machine-readable; schema: `pm.requirements_coverage.schema.v1`)
    - `.puppet-master/project/traceability/requirements_coverage.md` (human-readable projection; MUST match JSON counts/IDs exactly)
10) Optional (human convenience derived output; non-canonical):
    - `.puppet-master/project/quickstart.md` (deterministic command quickstart; AI correctness and validator correctness MUST NOT depend on this file)

**GUI artifact trigger rule (normative):**
- If the generated project includes interactive GUI surfaces that dispatch `UICommand` IDs, Puppet Master MUST emit both `.puppet-master/project/ui/wiring_matrix.json` and `.puppet-master/project/ui/ui_command_catalog.json`.
- If no interactive GUI surface is in scope, both files MAY be absent.
- A project MUST NOT emit only one of the two GUI artifacts.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

### 2.1 Canonical staging tree

```text
.puppet-master/project/
  requirements.md
  contracts/
    index.json
    ... contract files (pack members) ...
  plan.md
  plan_graph/                # canonical sharded plan graph
    index.json
    nodes/
      <node_id>.json
    edges.json               # optional
    exports/
      plan_graph.monolithic.json  # optional derived export (non-canonical)
  acceptance_manifest.json
  auto_decisions.jsonl
  ui/                        # optional (GUI)
    wiring_matrix.json       # optional (GUI)
    ui_command_catalog.json  # optional (GUI)
  traceability/                          # required derived verification outputs (see §11)
    requirements_quality_report.json     # machine-readable (pm.requirements_quality_report.schema.v1)
    requirements_coverage.json           # machine-readable (pm.requirements_coverage.schema.v1)
    requirements_coverage.md             # human-readable projection (matches JSON counts/IDs)
  quickstart.md                          # optional derived human convenience file (see §12; non-canonical)
```

### 2.2 Non-canonical execution workspace (sidecar) — `.puppet-master/workspace/**`

The **Project Plan Package** (this document) is staged under `.puppet-master/project/**`.

Separately, Puppet Master maintains an execution **workspace sidecar** (ephemeral, non-canonical) under:

`.puppet-master/workspace/<project>/<phase>/<task>/<subtask>/`

This sidecar exists to support deterministic, low-bloat context management without polluting user repos.

Rule: Puppet Master MUST store Attempt Journal and Parent Summary artifacts in the workspace sidecar by default, and MUST treat them as execution-time artifacts (not part of the canonical Project Plan Package).

ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

Reserved runtime subtree note:
- `.puppet-master/state/**` is reserved for project-local runtime state such as optional local seglog/mirror/backups when enabled by `Plans/storage-plan.md`.
- `.puppet-master/project/**` remains the canonical staged Project Plan Package tree.
- `.puppet-master/workspace/**` remains the non-canonical execution sidecar and MUST NOT be repurposed as canonical storage.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md

Recommended contents (non-exhaustive):
- `AGENTS.md` (scoped instruction file for this subtree; managed or user-owned depending on mode)
- `parent_summary.md`
- `attempt_journal.md`
- Iteration run artifacts (logs, snapshots, per-iteration output)

Rule: Promotion of stable learnings into scoped `AGENTS.md` MUST follow Promotion rules and MUST preserve `AGENTS.md` lightness budgets.

ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement

### 2.3 Document Set packaging for large Markdown/text artifacts

When Markdown/text artifacts under `.puppet-master/**` reach configured size triggers, Puppet Master MUST package them as Document Sets per `Plans/Document_Packaging_Policy.md` and MUST run the required packaging audits before run completion.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014, SchemaID:pm.project-plan-graph-index.v1

**On-disk path convention:** When packaging triggers are reached for a Markdown/text artifact, the canonical packaged form is a `.docset/` directory adjacent to the original file path (e.g. `.puppet-master/project/requirements.md.docset/`). The original file path MUST remain present as a deterministic pointer stub (derived artifact) pointing to the Document Set entrypoint. Full convention defined in `Plans/Document_Packaging_Policy.md §7`.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014

**Canonical truth:** For any large Markdown/text artifact, the artifact inventory recognizes either:
- the file path as canonical (when no `.docset/` exists), or
- the `.docset/` directory as canonical with the file path as a derived pointer stub (when packaging has occurred).

ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014

### Canonical persistence for packaged Document Sets

When packaging occurs for a logical Markdown/text artifact:
- `<logical_artifact_path>.docset/00-index.md` is canonical.
- `<logical_artifact_path>.docset/manifest.json` is canonical.
- shard files under `<logical_artifact_path>.docset/` are canonical.
- audit outputs under `<logical_artifact_path>.docset/evidence/` are canonical verification artifacts.
- `<logical_artifact_path>` remains present only as a derived pointer stub.

Generated `.docset/**` contents are packaging outputs, not new packaging inputs; verifiers and generators MUST NOT recurse and package Document Set members again.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014

The plan graph contract remains unchanged: canonical user-project plan graph is still sharded JSON at `.puppet-master/project/plan_graph/index.json` with node shards under `nodes/<node_id>.json`.

ContractRef: SchemaID:pm.project-plan-graph-index.v1

