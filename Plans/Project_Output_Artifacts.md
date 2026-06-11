# Puppet Master — User-Project Project Plan Package Outputs (SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document is the **canonical single source of truth (SSOT)** for the user-project **Project Plan Package** outputs produced by **Puppet Master** and staged under:

`.puppet-master/project/**`

It also defines:
- **seglog canonical persistence** for these artifacts (filesystem is staging/export/cache only)
- **DRY, contract-referenced plan graph** requirements (**sharded-only plan graph**; machine-runnable, headless) with an **optional, non-canonical** derived export for convenience.

> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.

## 0. Scope (normative)
### Runtime Artifacts (GUI panel) — distinct from this document

This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Those are persisted via seglog `runtime_artifact.*` event types and redb `artifacts_index:v1:{project_id}`. The full spec (19 types, JSON schemas, task_id rule, reasoning_tokens, cost_usage, Show in Ledger/Usage, browser recordings) is in **Plans/Runtime_Artifacts_Panel.md**. Do not conflate the two: Project Plan Package = user-project deliverables; Runtime Artifacts = agent-run outputs in the Artifacts panel.

Optional runtime-analysis exports that summarize queue analysis, attempts, safe points, remediation, or blocked outcomes remain projections of canonical runtime data. When materialized, they MUST use canonical runtime identities (`scheduler_pass_id`, `attempt_id`, `safe_point_id`, `remediation_root_id`) and faithfully reflect blocked/local-work-preserved state rather than inventing separate artifact-local identity.

Debug/runtime targets are workspace-bound for Project Plan Package linkage only when PM can map them to the current project through `project_id`, `dev_session_id`, workspace preview `/browser` identity, DAP session identity, or explicit user-confirmed project binding.

### P5 project-output artifact recovery requirements

- `Project_Output_Artifacts.md`, `FileManager.md`, `newtools.md`, and `assistant-memory-subsystem.md` now form a stronger artifact/event/runtime-observability gap cluster: - `validation_pass_report.pass_verdict` still conflicts with downstream `skipped` behavior. - project artifact events are under-keyed relative to the canonical EventRecord envelope and still lack project/run/thread/wizard/account lineage. - `glossary` and execution-evidence style artifact types remain unregistered in the canonical artifact-type table. - `FileManager.md`'s addendum requires open-by-identity and generated non-repo drafts, but `OpenFile { path: PathBuf }` plus root-path validation cannot satisfy it; no `OpenArtifact`-style contract, no `evidence_by_attempt` projection, and no artifact-index freshness/degraded fallback exist. - `newtools.md`, storage-plan, `/Assistant`, `/custom-headless`, `/AutoMilestone`, and assistant memory introduce uncataloged preview/build command IDs, unregistered `live.*`, `memory.gist`, `memory.gist.*`, `cmd.*`, and `/permissions` artifacts.
- Artifact / persistence / lineage owner docs still have field-family holes that downstream passes kept surfacing: - `Project_Output_Artifacts.md` is now clearly under-keyed relative to the canonical EventRecord/runtime model: artifact events and validation pass reports still omit project/thread/run/attempt/account identity details, `pass_verdict` mismatches the wizard producer doc, and interview-emitted artifact types (`glossary`, `evidence/<node_id>.json`) still do not line up with the package SSOT. - `FileManager.md` still cannot satisfy its own addendum requiring open-by-runtime-identity because its core open contract is path-only; `generated://` only covers preview restore, and `evidence_record` is still tier-keyed where attempt-native pivots are now required. - `assistant-memory-subsystem.md` and storage-plan surface a new storage-owner gap: memory event families, AutoRunBoundary/AutoMilestone tri; `/command`, `/dashboard`, and CTA routing remain part of this artifact lineage surface.
- **`Plans/plan_graph.schema.json` + `Plans/project_plan_node.schema.json` + `Plans/project_plan_graph_index.schema.json`** - **Why impacted:** These are the executable graph contracts. - **Old assumption:** Lexicographic node selection, weak dependency duality (`depends_on` vs `blockers/unblocks`), no package/seam/worktree/account identity. - **New model pressure:** Need node/package/seam/lane/promotion/safe-point fields, multi-project scoping, and alignment with scored ready-set scheduling.
- Project artifact / file-management gaps continued to deepen: - `validation_pass_report` still conflicts with workflow-required `skipped`, but GPT-5.2 also pinned missing `auto_fixes_applied[]`, a Pass-1 scope contradiction around requirements creation, and unresolved `workflow_run_id` vs canonical `run_id` identity. - `project_id` omission is now clearly a determinism problem in app-global seglog mode because artifact events cannot be partitioned safely by project otherwise. - `OpenFile { path }` is now unambiguously workspace-root-only, proving that generated/runtime opens need a separate open-by-identity router. - attempt-scoped evidence remains blocked not just by missing filters but by storage/UI keying that is still tier/node-centric instead of attempt-centric.
- `Ledger` - must be exact, but exact does not mean fully materialized at once - filtered query + paging + stable sort are required - export can retrieve more than the viewport, but normal browsing should stay slice-based
- Validation pass reports in chain-wizard require `provider` and `model`, but not the fuller runtime identity fields now needed for multi-account/shared-runtime explanation.
- The current lineage story is fragmented across multiple docs: - `chain-wizard-flexibility.md` ties reports to the three-pass sweep and wizard blocked/attention behavior - `Project_Output_Artifacts.md` owns the artifact type and `workflow_run_id` - wizard state elsewhere owns `wizard_id`, `phase_plan_ref`, staged bundle refs, and blocked report refs - no single pass-report contract currently ties those together cleanly
- State the precedence rule directly in `Contracts_V0.md`. - Reject multi-selector route payloads as non-canonical.
- Promote artifact/memory/live/runtime-observability records to full owner status: - align project-artifact events to EventRecord-level identity, - add missing artifact types, - define an `OpenArtifact`-style FileManager contract plus required supporting projections, - register `memory.*`, `live.*`, doctor/custom-headless, and handoff lifecycle events where they truly belong.
- The canonical-storage side is already disciplined: - `seglog` is canonical - JSONL mirror is derived - Project Plan Package artifacts are canonically persisted and filesystem materializations are staging/export/cache - packaged document sets already have explicit `manifest.json` ownership
- `Plans/FileSafe.md` - **Why impacted:** Defines the structure of the active plan and write scopes. - **Old assumption:** `Phase/Task/Subtask/Iteration` hierarchy is the only way to organize work; single active plan. - **New model pressure:** Needs to support "Pack" or "Seam" based scopes and potentially concurrent active contexts.
- `acknowledged` concerns should reduce repeat in-app surfacing, but they must not mask an active blocked state if the underlying condition still blocks progress.
- Source Control and artifact navigation surfaces are showing a broader object-identity problem: - `GitHub_Integration.md` still frames worktree ownership around `run/tier` - `FileManager.md` already wants identity-based artifact opening, but its open contract is still too path-first - `Runtime_Artifacts_Panel.md` is missing `attempt_id` in its canonical id set and does not yet absorb trust-tier / degraded-artifact semantics cleanly
- `workflow_run_id` links the three passes together, but it is not enough by itself to relate the sweep to `wizard_id`, staged requirements state, or the later launched run.
- Export correctness now depends on the earlier projection-trust work. - Recommended rule: - exports derived from stale/degraded projections must either: - disclose trust state in the export/manifest - or re-query from canonical/current backing data before export
- `Project_Output_Artifacts.md` is clear that canonical persistence is seglog-first and filesystem materialization under `.puppet-master/project/**` is staging/export/cache only.
- Adjacent owner reference remains `Plans/Runtime_Artifacts_Panel.md` for this recovery seam.
- Adjacent owner reference remains `Plans/Runtime_Artifacts_Panel.md` for this recovery seam.
- Reserve system notifications for sparse, high-value events. - Keep blocked-state persistence semantically stronger than dismissible warning surfaces.
- Artifact and file-opening semantics are not yet fully aligned with recovery/run-aware identity: - `FileManager.md` is moving toward identity-based opens - `Runtime_Artifacts_Panel.md` and related surfaces still need a tighter canonical id/trust/freshness contract
- acknowledged concerns must reduce noise without suppressing true blockers - recovery snapshots in wizard-driven flows need enough intent/wizard-step state to avoid restoring into the wrong execution mode
- The evidence schema cannot cleanly encode route-payload mismatch reports, alias/deprecation findings, or passthrough/correlation failures in a stable machine-readable form.
- `Runtime_Artifacts_Panel.md` also confirms that artifact surfaces are identity-native and project-scoped, but it still does not fully own the open-resolution path. It references File Manager for open-by-artifact identity, which means the open contract boundary is still under-specified.
- The current docs already contain several different export families: - config sync/export bundles (`.pm-bundle`) - render/preview exports (for example Mermaid `SVG` / `PNG`) - runtime artifact export from the Artifacts panel - Usage/Ledger CSV/JSON exports - project-output materialization and optional derived exports under `.puppet-master/project/**` - generic thread/run history export from seglog / JSONL mirror
- Validation sweep and pass-report artifacts are upstream artifacts, not execution attempts, but they must bridge `/session`, `/node/attempt`, and `/history/ledger/search` views through wizard/session lineage, staged artifact bundle refs, promoted artifact tree refs, and launched `run_id?` when execution later starts from the validated output.
- `validation-pass` reports are hard-gating canon for promotion and launch decisions, so weak identity in those upstream artifacts must block downstream export, History/Ledger, or run-handoff claims until the lineage bridge is explicit.
- Artifact lineage fields include `linked_artifact_id?` and `logical_artifact_id?` when a renderable output points at another durable artifact or a stable logical artifact identity across materializations.
- Generated and staged artifacts may enter the UI as `generated://<artifact_id>` or `artifact:<artifact_id>` non-path subjects before any backing file path exists; `artifact_id` remains the identity that open routes, previews, and manifests preserve.
- `Runtime_Artifacts_Panel.md` depends on open-by-identity behavior, so Project Output artifact records must expose enough identity and resolver metadata that surfaces do not get re-invented as per-surface open contracts.
- Project summary exports must keep `project health`, `project activity`, and `project attention` separate: health covers setup `/integrity/config`, activity covers active `/paused/queued/background` execution, and attention covers user/operator action needs.
- event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities.
- Project identity must remain stable across path moves, `/rebinds`, and worktree-aware flows; exported records carry the project identity instead of deriving it from the current filesystem path.
- CSV `/table` exports are convenience view exports, not canonical archival exports; when built from stale or `/degraded` projections they must disclose trust state or re-query canonical backing data before export.
- Artifact and record exports preserve canonical IDs and `/refs`; they must not invent export-local shadow identity for artifacts, receipts, records, or related runtime refs.
- Project display settings follow the already-emerging `app-default` plus project-specific `/override/effective` grammar so inherited defaults and effective overrides remain visible in exported state.
- Negative ID rules are part of artifact lineage: do not invent feature-local receipt IDs, do not create artifact-local cost models, and do not conflate runtime artifacts with Project Plan Package artifacts.


ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md

- This spec applies **ONLY** to **user projects generated by Puppet Master**.
- User projects **DO NOT** contain a `Plans/` folder.
  - Any `Plans/*.schema.json` and `Plans/*.md` references in this document refer to **Puppet Master internal** schemas/contracts and are **not copied into user projects**.
## 1. Canonical persistence vs filesystem staging

- **Canonical persistence:** seglog is the canonical store for Project Plan Package artifacts (see §8).
- `seglog` is the storage-layer append-only event log for artifact persistence; `usage_event` remains a usage-domain object identity and is not a rename target for seglog references. When an artifact also has cost/accounting lineage, the bridge is `usage_event_ref`; that bridge never replaces `artifact_id`, `logical_path`, or the seglog event identity.
- **Filesystem under `.puppet-master/project/**`:** staging/export/cache only.
  - It MUST be **regenerable** by replaying seglog artifact events.
  - A validator MUST be able to verify byte-identical reconstruction via hashes (see §9).

ContractRef: SchemaID:pm.project-plan-graph-index.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md

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

## 3. Schema alignment (critical; do not rename fields)

This document uses the exact terminology/field names of the canonical schemas under `Plans/`:

- `Plans/project_plan_graph_index.schema.json` (`pm.project-plan-graph-index.v1`)
  - index `nodes[].path`, `nodes[].sha256`
  - index `schema_version`, `entrypoints`, `execution_ordering`, `validation.targets`
- `Plans/project_plan_node.schema.json` (`pm.project-plan-node.v1`)
  - node `contract_refs`, `evidence_required`, `allowed_tools`, `tool_policy_mode`, `policy_mode`, `change_budget`,
    `blockers`, `unblocks`, `status`, `evidence_pointer`, `verifier_result`, `decision_refs`, `spec_lock_requirements`
    (and optional `depends_on`)
- `pm.project-plan-graph.v1` (optional derived monolithic export)
  - `plan_graph/exports/plan_graph.monolithic.json` is a monolithic wrapper over the same node object fields as `pm.project-plan-node.v1` (inlined nodes), plus graph-level `graph_id`, `entrypoints`, and `validation.targets`.
- `Plans/contracts_index.schema.json` (`pm.project_contracts_index.schema.v1`)
- `Plans/acceptance_manifest.schema.json` (`pm.acceptance_manifest.schema.v1`)
- `Plans/auto_decisions.schema.json` (`pm.auto_decisions.schema.v1`)
- `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`)

The schemas are authoritative; this doc defines **paths, sharding, DRY requirements, and cross-file integrity rules**.

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

## 6. Autonomy + decision logging (no human-required decisions)

- Deterministic defaults are defined in `Plans/Decision_Policy.md` and MUST be applied autonomously.
  - ContractRef: `PolicyRule:Decision_Policy.md`
- All ambiguities (where multiple valid options exist) MUST be recorded to `.puppet-master/project/auto_decisions.jsonl`
  (newline-delimited JSON; each row conforms to `Plans/auto_decisions.schema.json`).
- `.puppet-master/project/auto_decisions.jsonl` is the canonical user-project decision log only; Puppet Master internal SSOT maintenance decisions continue to use `Plans/auto_decisions.jsonl`.
- User-project auto-decision rows MUST conform to `pm.auto_decisions.schema.v1` exactly.
- For user-project outputs, canonical persistence remains seglog first; decision rows are projected to `.puppet-master/project/auto_decisions.jsonl` as a regenerable filesystem artifact.
- Puppet Master MUST continue execution without requiring humans to resolve ambiguities (the log is for traceability, not gating).

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§4

- Optional HITL approvals are supported at approval-boundary nodes but are not required:
  - use node `tool_policy_mode: "ask"` (schema: `pm.project-plan-node.v1`) to mark approval boundaries.

## 7. Plan graph requirements (**sharded-only canonical** + optional derived export)


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


Puppet Master MAY export a monolithic graph for convenience:

- Path: `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`
- Schema: `pm.project-plan-graph.v1` (portable monolithic graph)

If present:

- It MUST be a faithful, lossless projection of the canonical shard set (same node IDs, same node fields, same `entrypoints`).
- It is **NOT** the canonical plan representation and MUST NOT be required for validation or orchestration.

ContractRef: SchemaID:pm.project-plan-graph.v1, ContractName:Plans/Project_Output_Artifacts.md

## 8. Seglog canonical persistence contract (artifact events)


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

## 9. Acceptance criteria (validator requirements)

A validator MUST be able to verify, at minimum:

ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009, ContractName:Plans/Project_Output_Artifacts.md

1) **Sharded graph validity (canonical headless input)**
   - `.puppet-master/project/plan_graph/index.json` validates (`pm.project-plan-graph-index.v1`)
   - all `nodes[].path` resolve to `plan_graph/nodes/<node_id>.json`
   - `entrypoints` refer to existing node IDs
2) **Shard integrity**
   - each `nodes[].sha256` matches the referenced node shard bytes
3) **Contract reference validity (DRY)**
   - `.puppet-master/project/contracts/index.json` validates (`pm.project_contracts_index.schema.v1`)
   - every `ProjectContract:*` referenced by any node `contract_refs` resolves via `contracts/index.json`
4) **Acceptance coverage**
   - `.puppet-master/project/acceptance_manifest.json` validates (`pm.acceptance_manifest.schema.v1`)
   - each node’s `acceptance[].check_id` is present in the manifest under that node
   - acceptance checks include relevant `ProjectContract:*` references via `contract_refs`
5) **Seglog hash matches**
   - seglog `content_hash` matches the SHA-256 of the materialized artifact bytes for each `logical_path`
   - plan graph shard hashes in `index.json` (`nodes[].sha256`) match the same materialized bytes
6) **Headless orchestration from sharded plan graph**
   - orchestration can run headless from `plan_graph/index.json` + referenced node shards alone
   - no dependency on `plan.md`, GUI artifacts, or optional monolithic exports for ordering/policy enforcement

ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009

7) **Optional derived export consistency (if present)**
   - `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` validates (`pm.project-plan-graph.v1`)
   - it is consistent with the canonical sharded graph (same node IDs, same node fields, same `entrypoints`)

8) **Validation sweep artifact completeness (see §10)**
   - Exactly three `validation_pass_report` events in seglog for each validation sweep run (pass_number 1, 2, 3 sharing the same `workflow_run_id`)
   - Pass 3 report `changes_applied_summary` contains no write-protected artifact paths (no requirements.md, plan.md); derived outputs such as `quickstart.md` may be regenerated
   - All pass report `content_hash` values match the SHA-256 of their `content_bytes`
   - For each pass number `N`, report `provider` and `model` match resolved app settings keys `validation_sweep.passN.provider` and `validation_sweep.passN.model` from sweep start (`Plans/assistant-chat-design.md §26`)
   - Reports come from a deterministic, headless sweep with no human approval gates between Pass 1, Pass 2, and Pass 3 (`Plans/chain-wizard-flexibility.md §12`)

9) **Post-pass artifact finality**
   - The canonical `.puppet-master/project/**` artifact tree validated by this document MUST represent the post-sweep artifact set (after Pass 2 and Pass 3 corrections for the associated `workflow_run_id`)
   - Validator hash checks apply to post-pass corrected bytes, not pre-sweep intermediates
ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md

10) **Traceability output integrity (see §11)**
    - `.puppet-master/project/traceability/requirements_quality_report.json` validates against `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`)
    - `.puppet-master/project/traceability/requirements_coverage.json` validates against `Plans/requirements_coverage.schema.json` (`pm.requirements_coverage.schema.v1`)
    - `summary.total_requirements` == `len(requirements[])`
    - `summary.covered` + `summary.partially_covered` + `summary.uncovered` == `summary.total_requirements`
    - `len(uncovered_requirements[])` == `summary.uncovered`
    - `len(orphaned_node_requirement_refs[])` == `summary.orphaned_refs`
    - `len(uncovered_acceptance[])` == `summary.uncovered_acceptance_count`
    - `requirements_coverage.md` requirement ID lists match `requirements_coverage.json` exactly
11) **Quickstart integrity (if present — see §12)**
    - `.puppet-master/project/quickstart.md` is derived convenience output only
    - orchestration, planning, and validator correctness MUST NOT depend on `quickstart.md`
    - each executable command line in `quickstart.md` MUST exist verbatim in `.puppet-master/project/acceptance_manifest.json` (`nodes[].checks[].commands[].cmd`)
    - `quickstart.md` command count MUST be <= 20 and file size MUST be <= 16384 bytes

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

Validation pass reports remain upstream governance artifacts, but they require stronger lineage into execution and artifact history.

Required lineage fields include:
- `project_id`
- `wizard_id?`
- `thread_id?`
- `phase_plan_ref?`
- staged bundle refs
- `requirements_quality_report_ref?`
- promoted artifact refs
- `workflow_run_id`
- requested/effective runtime identity snapshot refs when a provider/model executed the pass
- `effective_account_id?`
- `execution_role`
- launched `run_id?` when execution later starts from the validated output

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Rules:
- validation pass reports do not become runtime attempts
- validation reports must be traceable both backward to planning/wizard state and forward to launched execution when that bridge exists
- pass reports remain first-class records in History/Ledger and first-class export members in manifests

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

ContractRef: Plans/Contracts_V0.md#3.3 Requirements quality events, Plans/chain-wizard-flexibility.md#12. Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)

Required fields:
- pass_number
- pass_name
- pass_verdict
- verdict_reason
- staged_bundle_ref

Canonical terms and values:
- validation_pass_report
- pass_number
- pass_name
- pass_verdict
- verdict_reason
- staged_bundle_ref
- skipped

Behavioral rules:
- Validation pass reports remain upstream artifacts.
- Pass reports must bridge into launchable execution through explicit lineage fields.

Permission carry-through:
- effective runtime/account identity must survive from pass report into downstream execution handoff
## 11. Traceability outputs

This section defines the **normative generation rules and integrity requirements** for derived verification outputs under `.puppet-master/project/traceability/`. These files are:
- **derived** (not planning inputs)
- **non-canonical** with respect to planning decisions
- **canonical** with respect to verification outputs (requirements quality + coverage reports)

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011

### 11.1 `traceability/requirements_quality_report.json` (machine-readable)

- Path: `.puppet-master/project/traceability/requirements_quality_report.json`
- Schema: `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`)
- This artifact is derived from requirements quality analysis and is verification-canonical (non-canonical for planning decisions).

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1

### 11.2 `traceability/requirements_coverage.json` (machine-readable)

- Path: `.puppet-master/project/traceability/requirements_coverage.json`
- Schema: `Plans/requirements_coverage.schema.json` (`pm.requirements_coverage.schema.v1`)

ContractRef: SchemaID:pm.requirements_coverage.schema.v1

**Generation procedure (normative; executed in order):**

#### Step 1 — Requirements source: `.puppet-master/project/requirements.md`

- Requirement ID extraction rule: any line matching  
  `^\s*[-*]?\s*(FR-[0-9]{3,}|NFR-[0-9]{3,}|REQ-[0-9]{3,})\b`  
  OR a heading matching  
  `^#+\s*(FR-[0-9]{3,}|NFR-[0-9]{3,}|REQ-[0-9]{3,})\b`
- The **first capture group** is the requirement ID; the remainder of the line (trimmed) is the description.
- The extracted ID set is the **authoritative set of known requirements** for this coverage run.
- Each extracted requirement is recorded in `requirements[]` with initial `node_ids: []`, `acceptance_check_ids: []`, `coverage_status: "uncovered"`.

ContractRef: SchemaID:pm.requirements_coverage.schema.v1

#### Step 2 — Node `requirement_refs` source: `.puppet-master/project/plan_graph/nodes/*.json`

- Each node shard (schema: `pm.project-plan-node.v1`) MAY contain an optional `requirement_refs: string[]` field.
- For each `req_id` in a node's `requirement_refs`:
  - If `req_id` appears in the requirements set from Step 1: add the node's `node_id` to that requirement's `node_ids[]`.
  - If `req_id` does NOT appear in the requirements set: record it in `orphaned_node_requirement_refs[]` as  
    `{ "req_id": "<req_id>", "node_id": "<node_id>", "reason": "req_id_not_in_requirements_md" }`.

ContractRef: SchemaID:pm.project-plan-node.v1

#### Step 3 — Acceptance mapping source: `.puppet-master/project/acceptance_manifest.json`

- Each acceptance check entry MUST declare `req_id` when that check is intended to provide requirement coverage evidence.
- If `req_id` exists in the requirements set, add the check's `check_id` to that requirement's `acceptance_check_ids[]`.
- Checks with no `req_id` are allowed, but they do not contribute to requirements coverage.

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md

- Schema: `pm.acceptance_manifest.schema.v1`.
- For each acceptance check that contains a `req_id` field: if `req_id` exists in the Step 1 requirements set, add the check's ID to that requirement's `acceptance_check_ids[]`.
- Checks with no `req_id` field are not included in coverage mapping (this is not an error).
- Acceptance checks with a `req_id` that does not appear in the requirements set MUST be ignored for `uncovered_acceptance[]` computation (schema semantics for `uncovered_acceptance[]` are requirement-centric, not unknown-check-centric).

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

#### Coverage status determination (normative)

For each requirement in `requirements[]`:

| Condition | `coverage_status` |
|-----------|-------------------|
| `len(node_ids) >= 1` AND `len(acceptance_check_ids) >= 1` | `"covered"` |
| `len(node_ids) >= 1` AND `len(acceptance_check_ids) == 0` | `"partially_covered"` |
| `len(node_ids) == 0` | `"uncovered"` |

#### `uncovered_acceptance[]` population rule (normative; schema-aligned)

After coverage statuses are computed, `uncovered_acceptance[]` MUST contain exactly the requirements where:
- `len(node_ids) >= 1`
- `len(acceptance_check_ids) == 0`

ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

Each entry MUST be:
`{ "req_id": "<req_id>", "node_ids": [ ... ], "reason": "no_acceptance_check_maps_to_this_requirement" }`.

ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/requirements_coverage.schema.json

#### Summary block (normative)

The `summary` object MUST be computed after all three steps:

- `total_requirements`: `len(requirements[])`
- `covered`: count of requirements with `coverage_status == "covered"`
- `partially_covered`: count of requirements with `coverage_status == "partially_covered"`
- `uncovered`: count of requirements with `coverage_status == "uncovered"`
- `orphaned_refs`: `len(orphaned_node_requirement_refs[])`
- `uncovered_acceptance_count`: `len(uncovered_acceptance[])`
ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

### 11.3 `traceability/requirements_coverage.md` (human-readable)

- Path: `.puppet-master/project/traceability/requirements_coverage.md`

The Markdown file MUST:

1. Be **regenerated deterministically from `requirements_coverage.json`** (not separately edited).
2. **Match all counts and IDs** from `requirements_coverage.json` exactly.
ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md
3. Include, at minimum:
   - A summary table with covered / partially covered / uncovered counts.
   - A list or table of **covered** requirements (IDs + descriptions).
   - A list or table of **partially covered** requirements (IDs + descriptions; note: planned but not acceptance-tested).
   - A list or table of **uncovered** requirements (IDs + descriptions).
   - A list of **orphaned node `requirement_refs`** (req_ids referenced by nodes but not present in requirements.md).
   - A list of **uncovered acceptance requirements** (requirements with node coverage but no mapped acceptance checks).

### 11.4 Integrity requirements (normative; verifier MUST enforce)

The verifier MUST enforce all of the following checks deterministically:
ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

1. `summary.total_requirements` == `len(requirements[])` — ContractRef: SchemaID:pm.requirements_coverage.schema.v1
2. `summary.covered` + `summary.partially_covered` + `summary.uncovered` == `summary.total_requirements`
3. `len(uncovered_requirements[])` == `summary.uncovered`
4. `len(orphaned_node_requirement_refs[])` == `summary.orphaned_refs`
5. `len(uncovered_acceptance[])` == `summary.uncovered_acceptance_count`
6. Every `req_id` in `uncovered_requirements[]` appears in `requirements[]` with `coverage_status == "uncovered"`
7. `requirements_coverage.md` requirement ID lists MUST match `requirements_coverage.json` exactly (verified by extracting IDs from the Markdown and comparing to the JSON) — ContractRef: SchemaID:pm.requirements_coverage.schema.v1
8. `requirements_coverage.json` MUST validate against `Plans/requirements_coverage.schema.json` (`pm.requirements_coverage.schema.v1`) — ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011
9. `requirements_quality_report.json` MUST validate against `Plans/requirements_quality_report.schema.json` (`pm.requirements_quality_report.schema.v1`) — ContractRef: SchemaID:pm.requirements_quality_report.schema.v1

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011

### 11.5 Seglog persistence (traceability outputs)

Traceability outputs MUST be persisted to seglog as `artifact_type` values `requirements_quality_report`, `requirements_coverage_json`, and `requirements_coverage_md` (see §8.2) following the standard seglog field contract (§8.1). The filesystem files under `.puppet-master/project/traceability/` are regenerable from seglog.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog

## 12. Optional derived `quickstart.md` contract (human convenience only)

- Path: `.puppet-master/project/quickstart.md`
- Classification: derived convenience output; non-canonical for planning and orchestration.
- AI correctness, planning correctness, and validator correctness MUST NOT depend on `quickstart.md`.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.acceptance_manifest.schema.v1

### 12.1 Deterministic generation rules (normative)

`quickstart.md` MUST be generated deterministically from `.puppet-master/project/acceptance_manifest.json` using the following rules:

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

1. **Verbatim source of truth:** command text comes only from `nodes[].checks[].commands[].cmd`.
2. **Allowed command set:** the allowed set is exactly the set of manifest `cmd` strings (no synthesis, normalization, aliasing, interpolation, or reformatting).
3. **Verbatim membership:** every executable command line emitted in `quickstart.md` MUST exist verbatim in the acceptance manifest command set.
4. **Deterministic ordering:** commands are emitted in manifest traversal order: `nodes[]` order, then `checks[]` order, then `commands[]` order.
5. **Deterministic defaults:** `max_commands = 20`; `max_file_size_bytes = 16384`.
6. **Deterministic truncation:** when command count or byte-size limits are reached, generation stops at the last fully included command and appends this exact note line:  
   `... truncated; see .puppet-master/project/acceptance_manifest.json for complete checks`

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

### 12.2 Validation rules (normative)

If `quickstart.md` is present, validator checks MUST enforce:
- file size <= `16384` bytes,
- executable command count <= `20`,
- each executable command appears verbatim in `.puppet-master/project/acceptance_manifest.json` (`nodes[].checks[].commands[].cmd`),
- no command appears that is absent from the manifest command set.

ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md

## Change Summary

- 2026-02-27: Updated §2.3 to declare `.docset/` canonical packaging convention and pointer stub behavior for large Markdown/text artifacts; re-asserted plan graph sharded JSON contract unchanged. Cross-ref: `Plans/Document_Packaging_Policy.md §7`.
- 2026-02-25: Added required derived verification contract for `.puppet-master/project/traceability/requirements_quality_report.json` (schema: `pm.requirements_quality_report.schema.v1`), added optional derived `.puppet-master/project/quickstart.md` contract, added deterministic quickstart generation/validation rules, aligned requirements coverage generation rules with `Plans/requirements_coverage.schema.json` (`orphaned_node_requirement_refs[].reason` sentinel and schema-aligned `uncovered_acceptance[]` semantics), updated validator acceptance checks, and clarified Pass 3 write-protection interaction (requirements/plan protected; quickstart may be regenerated as derived output).
- 2026-07-24: Added §11 Traceability outputs (requirements_coverage.json + requirements_coverage.md under `.puppet-master/project/traceability/`); added item 9 in §2 required artifact set; added `traceability/` to §2.1 staging tree; added `requirements_coverage_json` and `requirements_coverage_md` `artifact_type` values to §8.2; added acceptance criterion item 10 in §9. ContractRefs: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011.
- 2026-02-25: Hardened validation sweep acceptance contracts: added provider/model-to-settings linkage (`validation_sweep.passN.*`), deterministic/headless sweep provenance requirement, post-pass artifact finality requirement, and fixed `unresolved_findings[]` naming in Pass 3 write-protection invariant.
- 2026-02-25: Added `validation_pass_report` artifact typing in §8.2 and §10 Validation Pass Report Artifacts, including execution-bridge lineage and validation-sweep acceptance requirements. Updated §9 acceptance criteria with item 8 for validation sweep artifact completeness.
- 2026-02-24: Locked decision: user-project plan graph is **sharded-only**; canonical entrypoint is `.puppet-master/project/plan_graph/index.json`; monolithic export (if materialized) lives at `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`.
- 2026-02-24: Marked `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` as an **optional, non-canonical** derived export (may be generated, but must not be required; path was previously `.puppet-master/project/plan_graph.json`).
- 2026-02-24: Replaced this document to be the canonical SSOT for user-project **Project Plan Package** outputs under `.puppet-master/project/**`.
- 2026-02-24: Defined seglog canonical persistence as the source of truth (filesystem is staging/export/cache only) with required artifact-event fields.
- 2026-02-24: Tightened DRY rules: node shards reference `ProjectContract:*`; acceptance manifest references node IDs + contract refs; repeated prose must point to contract pack canon.
- 2026-02-24: Aligned terminology/field names with existing schemas in `Plans/` (graph index/node, contracts index, acceptance manifest, auto decisions).

## Runtime Evidence and Degradation Artifact Addendum (2026-03-08)
Runtime evidence projections remain downstream consumers of the storage-owned receipt packet.

### validation artifact lineage
Required fields:
- `validation_pass_report`
- `workflow_run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- Validation lineage stays concrete and inspectable.
- Pass reports remain upstream artifacts rather than local replacement identifiers.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Project_Output_Artifacts.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### POA-001 - Puppet Master — User-Project Project Plan Package Outputs (SSOT) Source-Preserving PlanUnit

```yaml
plan_unit_id: POA-001
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: Plans/Project_Output_Artifacts.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Project_Output_Artifacts-S0049
preserved_exact_tokens:
- Puppet Master — User-Project Project Plan Package Outputs (SSOT)
- 0. Scope (normative)
- Runtime Artifacts (GUI panel) — distinct from this document
- P5 project-output artifact recovery requirements
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md'
- 1. Canonical persistence vs filesystem staging
- 'ContractRef: SchemaID:pm.project-plan-graph-index.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md'
- 2. Required artifact set (SSOT) — Project Plan Package
- 'ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md'
- 2.1 Canonical staging tree
- 2.2 Non-canonical execution workspace (sidecar) — `.puppet-master/workspace/**`
- 'ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement'
- 2.3 Document Set packaging for large Markdown/text artifacts
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014, SchemaID:pm.project-plan-graph-index.v1'
- 'ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014'
- Canonical persistence for packaged Document Sets
- 'ContractRef: SchemaID:pm.project-plan-graph-index.v1'
- 3. Schema alignment (critical; do not rename fields)
- 4. Contract layers (two-layer model)
- A) Platform Contracts (internal SSOT; not copied into user projects)
- B) Project Contracts (generated per user project)
- 'Required: `contracts/index.json` (Project Contract Pack index)'
negative_constraints:
- '> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.'
- 'This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Th'
- '- `acknowledged` concerns should reduce repeat in-app surfacing, but they must not mask an active blocked state if the underlying condition still blocks progress.'
- '- Artifact and record exports preserve canonical IDs and `/refs`; they must not invent export-local shadow identity for artifacts, receipts, records, or related runtime refs.'
- '- `.puppet-master/project/quickstart.md` (deterministic command quickstart; AI correctness and validator correctness MUST NOT depend on this file)'
- '- A project MUST NOT emit only one of the two GUI artifacts.'
- '- `.puppet-master/workspace/**` remains the non-canonical execution sidecar and MUST NOT be repurposed as canonical storage.'
- Generated `.docset/**` contents are packaging outputs, not new packaging inputs; verifiers and generators MUST NOT recurse and package Document Set members again.
- '- Node shards MUST NOT repeat or inline the contract pack’s canonical specifications; use `contract_refs` instead.'
- '- MUST NOT depend on timestamps, randomness, session IDs, or nondeterministic ordering.'
- '`edges.json` MUST NOT be required for headless execution and MUST NOT override shard-local `blockers[]` readiness semantics.'
- '- It is **NOT** the canonical plan representation and MUST NOT be required for validation or orchestration.'
- '- orchestration, planning, and validator correctness MUST NOT depend on `quickstart.md`'
- '- AI correctness, planning correctness, and validator correctness MUST NOT depend on `quickstart.md`.'
- '- 2026-02-24: Marked `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` as an **optional, non-canonical** derived export (may be generated, but must not be required; path was previously `.puppet-master/project/plan_graph.json`).'
compatibility_only_notes:
- '- event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities.'
- '- Dependency semantics are canonicalized as follows: `blockers[]` is the readiness-driving dependency list, `unblocks[]` is the forward adjacency projection, `depends_on[]` is optional compatibility metadata only, and `edges.json` (if materialized) is a derived consistency artifact rather than an au'
stale_retired_dispositions:
- '- Export correctness now depends on the earlier projection-trust work. - Recommended rule: - exports derived from stale/degraded projections must either: - disclose trust state in the export/manifest - or re-query from canonical/current backing data before export'
- '- CSV `/table` exports are convenience view exports, not canonical archival exports; when built from stale or `/degraded` projections they must disclose trust state or re-query canonical backing data before export.'
owner_boundary_notes:
- '# Puppet Master — User-Project Project Plan Package Outputs (SSOT)'
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- 'This document is the **canonical single source of truth (SSOT)** for the user-project **Project Plan Package** outputs produced by **Puppet Master** and staged under:'
- '- **seglog canonical persistence** for these artifacts (filesystem is staging/export/cache only)'
- '- **DRY, contract-referenced plan graph** requirements (**sharded-only plan graph**; machine-runnable, headless) with an **optional, non-canonical** derived export for convenience.'
- '> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.'
- 'This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Th'
- Optional runtime-analysis exports that summarize queue analysis, attempts, safe points, remediation, or blocked outcomes remain projections of canonical runtime data. When materialized, they MUST use canonical runtime identities (`scheduler_pass_id`, `attempt_id`, `safe_point_id`, `remediation_root_
- '- `Project_Output_Artifacts.md`, `FileManager.md`, `newtools.md`, and `assistant-memory-subsystem.md` now form a stronger artifact/event/runtime-observability gap cluster: - `validation_pass_report.pass_verdict` still conflicts with downstream `skipped` behavior. - project artifact events are under-'
- '- Artifact / persistence / lineage owner docs still have field-family holes that downstream passes kept surfacing: - `Project_Output_Artifacts.md` is now clearly under-keyed relative to the canonical EventRecord/runtime model: artifact events and validation pass reports still omit project/thread/run'
- '- Project artifact / file-management gaps continued to deepen: - `validation_pass_report` still conflicts with workflow-required `skipped`, but GPT-5.2 also pinned missing `auto_fixes_applied[]`, a Pass-1 scope contradiction around requirements creation, and unresolved `workflow_run_id` vs canonical'
- '- State the precedence rule directly in `Contracts_V0.md`. - Reject multi-selector route payloads as non-canonical.'
- '- Promote artifact/memory/live/runtime-observability records to full owner status: - align project-artifact events to EventRecord-level identity, - add missing artifact types, - define an `OpenArtifact`-style FileManager contract plus required supporting projections, - register `memory.*`, `live.*`,'
- '- The canonical-storage side is already disciplined: - `seglog` is canonical - JSONL mirror is derived - Project Plan Package artifacts are canonically persisted and filesystem materializations are staging/export/cache - packaged document sets already have explicit `manifest.json` ownership'
- '- Source Control and artifact navigation surfaces are showing a broader object-identity problem: - `GitHub_Integration.md` still frames worktree ownership around `run/tier` - `FileManager.md` already wants identity-based artifact opening, but its open contract is still too path-first - `Runtime_Arti'
- '- Export correctness now depends on the earlier projection-trust work. - Recommended rule: - exports derived from stale/degraded projections must either: - disclose trust state in the export/manifest - or re-query from canonical/current backing data before export'
- '- `Project_Output_Artifacts.md` is clear that canonical persistence is seglog-first and filesystem materialization under `.puppet-master/project/**` is staging/export/cache only.'
- '- Adjacent owner reference remains `Plans/Runtime_Artifacts_Panel.md` for this recovery seam.'
- '- Artifact and file-opening semantics are not yet fully aligned with recovery/run-aware identity: - `FileManager.md` is moving toward identity-based opens - `Runtime_Artifacts_Panel.md` and related surfaces still need a tighter canonical id/trust/freshness contract'
- '- `Runtime_Artifacts_Panel.md` also confirms that artifact surfaces are identity-native and project-scoped, but it still does not fully own the open-resolution path. It references File Manager for open-by-artifact identity, which means the open contract boundary is still under-specified.'
- '- event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities.'
- '- CSV `/table` exports are convenience view exports, not canonical archival exports; when built from stale or `/degraded` projections they must disclose trust state or re-query canonical backing data before export.'
- '- Artifact and record exports preserve canonical IDs and `/refs`; they must not invent export-local shadow identity for artifacts, receipts, records, or related runtime refs.'
- '## 1. Canonical persistence vs filesystem staging'
owner_hints:
- Plans/Project_Output_Artifacts.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `873ad4ab0fac4327e921959abc15ad6271f04bd544a04c7ca7ff4dc01ef5ac80`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Project_Output_Artifacts-S0001` through `Project_Output_Artifacts-S0049` are preserved in place and mapped in `coverage_map.jsonl` to `POA-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
