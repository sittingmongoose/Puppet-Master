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

This document is the SSOT for **Project Plan Package** artifacts (user-project outputs under `.puppet-master/project/**`). A separate concept is **Runtime Artifacts**: agent-run outputs (diffs, plans, evidence, browser recordings, cost_usage, etc.) displayed in the **Artifacts panel** of the GUI. Those are persisted via seglog `runtime_artifact.*` event types and redb `artifacts_index.v1:{project_id}:{artifact_id}`. The full spec (19 types, JSON schemas, task_id rule, reasoning_tokens, cost_usage, Show in Ledger/Usage, browser recordings) is in **Plans/Runtime_Artifacts_Panel.md**. Do not conflate the two: Project Plan Package = user-project deliverables; Runtime Artifacts = agent-run outputs in the Artifacts panel.

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
   - For each pass report, `provider` and `model` match the resolved Auditor validation loop provider/model from sweep start (`Plans/assistant-chat-design.md §26`, `Plans/Models_System.md`)
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

Validation pass reports remain upstream governance artifacts, but they require stronger lineage into execution and artifact history. `validation_pass_report` is a legacy artifact family name for requirements-quality lineage; it is not a user-facing validation-pass model setting. New plans-to-code audit, verification, certification, quality-gate, and evidence-review model routing uses Auditor Model semantics, while any broad artifact-family rename remains deferred to a targeted requirements-quality cleanup.

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
- 2026-06-18: Retired fixed Pass 1 / Pass 2 / Pass 3 model settings for validation reports; provider/model parity now points to the single Auditor validation loop setting resolved at sweep start.
- 2026-02-25: Hardened validation sweep acceptance contracts: added provider/model-to-settings linkage later superseded by the single Auditor validation loop, deterministic/headless sweep provenance requirement, post-pass artifact finality requirement, and fixed `unresolved_findings[]` naming in Pass 3 write-protection invariant.
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

### POA-002 - Project Plan Package SSOT And Anti-Duplication

```yaml
plan_unit_id: POA-002
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Plans/Project_Output_Artifacts.md is the SSOT for user-project Project Plan Package outputs staged under .puppet-master/project/**, including artifact paths, sharding rules, seglog canonical persistence, DRY contract-referenced sharded headless graph requirements, and optional non-canonical derived exports.
gui_related: false
gui_classification_reason: This unit defines canonical package authority and storage semantics rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Project Plan Package SSOT And Anti-Duplication remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_output_artifact_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0002
preserved_exact_tokens:
  - "Puppet Master — User-Project Project Plan Package Outputs (SSOT)"
  - ".puppet-master/project/**"
  - "seglog canonical persistence"
  - "sharded-only plan graph"
  - "optional, non-canonical"
negative_constraints:
  - "Do not duplicate: This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them."
preserved_contractrefs: []
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-003 - Runtime Artifacts Boundary

```yaml
plan_unit_id: POA-003
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project Plan Package artifacts are distinct from GUI Runtime Artifacts; optional runtime-analysis exports are projections of canonical runtime identities, and debug/runtime targets bind to the package only through explicit project/session/runtime identity.
gui_related: true
gui_classification_reason: This unit preserves the GUI Artifacts panel boundary and user-visible runtime artifact distinctions.
split_recommended: false
depends_on:
  - POA-002
unblocks: []
acceptance_criteria:
  - "Runtime Artifacts Boundary remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Runtime artifact GUI panel semantics remain distinct from Project Plan Package outputs."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_runtime_artifact_conflation
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0003
preserved_exact_tokens:
  - "Runtime Artifacts (GUI panel) — distinct from this document"
  - "runtime_artifact.*"
  - "artifacts_index:v1:{project_id}"
  - "Plans/Runtime_Artifacts_Panel.md"
  - "scheduler_pass_id"
  - "attempt_id"
  - "safe_point_id"
  - "remediation_root_id"
  - "project_id"
  - "dev_session_id"
  - "/browser"
negative_constraints:
  - "Do not conflate the two: Project Plan Package = user-project deliverables; Runtime Artifacts = agent-run outputs in the Artifacts panel."
preserved_contractrefs: []
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
```

### POA-004 - Project Artifact Event Identity And Registration Gaps

```yaml
plan_unit_id: POA-004
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project artifact events and validation pass reports must align to EventRecord-level identity, register missing artifact and event families, and resolve pass/report lineage across project, run, thread, wizard, account, provider, model, and later launched run identity.
gui_related: false
gui_classification_reason: This unit defines artifact/event identity and lineage requirements rather than visual presentation.
split_recommended: false
depends_on:
  - POA-003
unblocks: []
acceptance_criteria:
  - "Project Artifact Event Identity And Registration Gaps remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Artifact event identity remains aligned to EventRecord-level lineage before downstream export or handoff claims."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_artifact_lineage_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0004
preserved_exact_tokens:
  - "validation_pass_report.pass_verdict"
  - "skipped"
  - "project/run/thread/wizard/account"
  - "glossary"
  - "evidence/<node_id>.json"
  - "live.*"
  - "memory.gist"
  - "memory.gist.*"
  - "cmd.*"
  - "/permissions"
  - "project_id"
  - "workflow_run_id"
  - "run_id"
  - "provider"
  - "model"
negative_constraints:
  - "Weak validation-pass identity must block downstream export, History/Ledger, or run-handoff claims until lineage is explicit."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```

### POA-005 - Identity-Native Artifact Opening And Navigation Boundary

```yaml
plan_unit_id: POA-005
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Artifact opening and navigation must be identity-native, supporting generated and staged artifacts before backing paths exist while preserving project/run-aware resolver metadata for FileManager, Runtime Artifacts, ledger/history/search, and attempt-scoped evidence views.
gui_related: true
gui_classification_reason: This unit preserves artifact opening and navigation behavior visible through FileManager, Runtime Artifacts, ledger, history, search, and attempt views.
split_recommended: false
depends_on:
  - POA-004
unblocks: []
acceptance_criteria:
  - "Identity-Native Artifact Opening And Navigation Boundary remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Generated and runtime artifact opens remain identity-native rather than path-only."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: artifact_open_identity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0004
preserved_exact_tokens:
  - "OpenFile { path: PathBuf }"
  - "OpenArtifact"
  - "evidence_by_attempt"
  - "artifact-index freshness/degraded fallback"
  - "generated://<artifact_id>"
  - "artifact:<artifact_id>"
  - "artifact_id"
  - "/session"
  - "/node/attempt"
  - "/history/ledger/search"
negative_constraints:
  - "Generated/runtime artifact opens must not be forced through path-only OpenFile { path }."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/FileManager.md
  - Plans/Runtime_Artifacts_Panel.md
```

### POA-006 - Export Trust, Aliasing, And Stable Artifact IDs

```yaml
plan_unit_id: POA-006
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Exported artifact records preserve canonical IDs and refs, disclose or refresh stale/degraded projection trust, keep compatibility aliases subordinate to canonical identities, preserve stable project identity across moves/rebinds, and keep health, activity, and attention distinct.
gui_related: false
gui_classification_reason: This unit defines export identity, trust, aliasing, and project identity constraints rather than visual presentation.
split_recommended: false
depends_on:
  - POA-004
unblocks: []
acceptance_criteria:
  - "Export Trust, Aliasing, And Stable Artifact IDs remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Exports preserve canonical IDs and trust state without inventing shadow identities."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: artifact_export_identity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0004
preserved_exact_tokens:
  - "seglog"
  - "JSONL mirror"
  - "stale/degraded"
  - "/degraded"
  - "compatibility aliases"
  - "linked_artifact_id?"
  - "logical_artifact_id?"
  - "/refs"
  - "project health"
  - "project activity"
  - "project attention"
  - "app-default"
  - "/override/effective"
negative_constraints:
  - "Acknowledged concerns must not mask active blocked state."
  - "Exports must not invent shadow IDs, feature-local receipt IDs, artifact-local cost models, or conflate runtime artifacts with Project Plan Package artifacts."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md"
compatibility_only_notes:
  - "Event aliasing discipline applies to artifact event families: compatibility aliases may exist only as declared aliases to canonical event/artifact types, never as independent persistence identities."
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
```

### POA-007 - Seglog Canonical Persistence And Filesystem Staging

```yaml
plan_unit_id: POA-007
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project Plan Package artifacts are canonical in seglog; filesystem materialization under .puppet-master/project/** is staging/export/cache and must be regenerable with byte-identical hash verification.
gui_related: false
gui_classification_reason: This unit defines persistence and staging semantics rather than visual presentation.
split_recommended: false
depends_on:
  - POA-002
unblocks: []
acceptance_criteria:
  - "Seglog Canonical Persistence And Filesystem Staging remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Filesystem materialization remains staging/export/cache rather than canonical storage."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: canonical_persistence_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0005
preserved_exact_tokens:
  - "seglog"
  - "usage_event"
  - "usage_event_ref"
  - "artifact_id"
  - "logical_path"
  - ".puppet-master/project/**"
  - "GATE-001"
negative_constraints:
  - "usage_event is not a rename target for seglog references; usage_event_ref never replaces artifact_id, logical_path, or seglog event identity."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-008 - Required Project Plan Package Artifacts And Verification Outputs

```yaml
plan_unit_id: POA-008
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Puppet Master must persist the required Project Plan Package artifact set canonically in seglog, with sharded graph paths, required traceability outputs, optional non-canonical quickstart, and a staging tree matching the listed paths.
gui_related: false
gui_classification_reason: This unit defines required artifact outputs and verification files rather than visual presentation.
split_recommended: false
depends_on:
  - POA-007
unblocks: []
acceptance_criteria:
  - "Required Project Plan Package Artifacts And Verification Outputs remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "The required artifact set and staging tree remain aligned to the Project Plan Package SSOT."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_package_artifact_omission
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0007
preserved_exact_tokens:
  - "requirements.md"
  - "contracts/"
  - "plan.md"
  - "plan_graph/"
  - "index.json"
  - "nodes/<node_id>.json"
  - "acceptance_manifest.json"
  - "auto_decisions.jsonl"
  - "requirements_quality_report.json"
  - "requirements_coverage.json"
  - "requirements_coverage.md"
  - "quickstart.md"
negative_constraints:
  - "AI correctness and validator correctness must not depend on quickstart.md."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-009 - Optional GUI Artifact Pair Trigger

```yaml
plan_unit_id: POA-009
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  If the generated project includes interactive GUI surfaces dispatching UICommand IDs, Puppet Master emits both GUI artifacts; when no interactive GUI surface is in scope, both may be absent.
gui_related: true
gui_classification_reason: This unit governs optional GUI wiring and command catalog artifacts for generated interactive GUI surfaces.
split_recommended: false
depends_on:
  - POA-008
unblocks: []
acceptance_criteria:
  - "Optional GUI Artifact Pair Trigger remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Interactive GUI output emits both optional GUI artifacts or neither when no interactive GUI surface is in scope."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: gui_artifact_pair_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0007
preserved_exact_tokens:
  - "Optional (GUI)"
  - ".puppet-master/project/ui/wiring_matrix.json"
  - ".puppet-master/project/ui/ui_command_catalog.json"
  - "UICommand"
negative_constraints:
  - "A project MUST NOT emit only one of the two GUI artifacts."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-010 - Non-Canonical Execution Workspace Sidecar

```yaml
plan_unit_id: POA-010
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Execution-time Attempt Journal, Parent Summary, AGENTS, and iteration artifacts live in the non-canonical workspace sidecar, while .puppet-master/project/** remains package staging and .puppet-master/state/** remains reserved for project-local runtime state.
gui_related: false
gui_classification_reason: This unit defines execution workspace and storage boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - POA-007
unblocks: []
acceptance_criteria:
  - "Non-Canonical Execution Workspace Sidecar remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - ".puppet-master/workspace/** remains non-canonical sidecar storage."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: canonical_workspace_boundary_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0008
preserved_exact_tokens:
  - ".puppet-master/workspace/<project>/<phase>/<task>/<subtask>/"
  - "Attempt Journal"
  - "Parent Summary"
  - ".puppet-master/state/**"
  - "AGENTS.md"
  - "Promotion rules"
  - "AGENTS.md lightness budgets"
negative_constraints:
  - ".puppet-master/workspace/** remains the non-canonical execution sidecar and must not be repurposed as canonical storage."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#AttemptJournal, ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md#PromotionRules, ContractName:Plans/Contracts_V0.md#AgentsMdLightEnforcement"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### POA-011 - Document Set Packaging Trigger And Pointer Stub

```yaml
plan_unit_id: POA-011
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Markdown/text artifacts under .puppet-master/** that reach packaging triggers become adjacent .docset/ Document Sets per policy, with the original path retained as a deterministic derived pointer stub.
gui_related: true
gui_classification_reason: This unit preserves Document Set packaging behavior for user-visible Markdown/text artifacts and pointer stubs.
split_recommended: false
depends_on:
  - POA-008
unblocks: []
acceptance_criteria:
  - "Document Set Packaging Trigger And Pointer Stub remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Packaging trigger behavior remains aligned to Document Packaging Policy and Gate:GATE-014."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: document_set_packaging_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0009
preserved_exact_tokens:
  - "Plans/Document_Packaging_Policy.md"
  - ".docset/"
  - ".puppet-master/project/requirements.md.docset/"
  - "deterministic pointer stub"
  - "Gate:GATE-014"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014, SchemaID:pm.project-plan-graph-index.v1"
  - "ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
```

### POA-012 - Packaged Document Set Canonical Members And No Recursion

```yaml
plan_unit_id: POA-012
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Packaged Document Sets make index, manifest, shards, and evidence canonical for the logical artifact while the original path remains only a derived pointer stub; sharded plan graph identity remains unchanged.
gui_related: false
gui_classification_reason: This unit defines packaging output and recursion constraints rather than visual presentation.
split_recommended: false
depends_on:
  - POA-011
unblocks: []
acceptance_criteria:
  - "Packaged Document Set Canonical Members And No Recursion remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Generated Document Set contents do not recursively become new packaging inputs."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: document_set_recursion_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0010
preserved_exact_tokens:
  - "<logical_artifact_path>.docset/00-index.md"
  - "manifest.json"
  - "evidence/"
  - "<logical_artifact_path>"
  - "plan_graph/index.json"
  - "nodes/<node_id>.json"
negative_constraints:
  - "Generated .docset/** contents are packaging outputs, not new packaging inputs; verifiers and generators must not recurse and package Document Set members again."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Document_Packaging_Policy.md#7, Gate:GATE-014"
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
```

### POA-013 - Schema Alignment Exact Field Names

```yaml
plan_unit_id: POA-013
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The listed Puppet Master internal schemas and exact field names are authoritative; this document owns paths, sharding, DRY requirements, and cross-file integrity rules.
gui_related: false
gui_classification_reason: This unit defines schema and field-name requirements rather than visual presentation.
split_recommended: false
depends_on:
  - POA-008
unblocks: []
acceptance_criteria:
  - "Schema Alignment Exact Field Names remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Exact schema IDs and field names remain stable and are not renamed during implementation."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: schema_field_name_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0011
preserved_exact_tokens:
  - "pm.project-plan-graph-index.v1"
  - "pm.project-plan-node.v1"
  - "pm.project-plan-graph.v1"
  - "pm.project_contracts_index.schema.v1"
  - "pm.acceptance_manifest.schema.v1"
  - "pm.auto_decisions.schema.v1"
  - "pm.requirements_quality_report.schema.v1"
  - "nodes[].path"
  - "nodes[].sha256"
  - "contract_refs"
  - "depends_on"
negative_constraints:
  - "Do not rename fields."
preserved_contractrefs: []
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-014 - Platform And Project Contract Pack Index Layers

```yaml
plan_unit_id: POA-014
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Internal Platform Contracts are referenced by stable IDs, while generated Project Contracts live in the Project Contract Pack; contracts/index.json is the canonical mapping from ProjectContract:* IDs to kind, path, sha256, and related metadata.
gui_related: false
gui_classification_reason: This unit defines contract layering and project contract index semantics rather than visual presentation.
split_recommended: false
depends_on:
  - POA-013
unblocks: []
acceptance_criteria:
  - "Platform And Project Contract Pack Index Layers remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Platform Contracts remain referenced rather than embedded in generated user projects."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: contract_pack_index_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0014
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0015
preserved_exact_tokens:
  - "Platform Contracts"
  - "Project Contracts"
  - "PolicyRule:*"
  - "SchemaID:*"
  - "ProjectContract:*"
  - ".puppet-master/project/contracts/index.json"
  - "contracts[].contract_id"
  - "contracts[].path"
  - "^ProjectContract:"
  - "pm.project_contracts_index.schema.v1"
negative_constraints:
  - "Platform Contracts are referenced from project artifacts but not embedded verbatim in user projects."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project_contracts_index.schema.v1"
  - "ContractRef: SchemaID:pm.project_contracts_index.schema.v1, ContractName:Plans/DRY_Rules.md#7"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/DRY_Rules.md
```

### POA-015 - DRY Graph And Acceptance Cross-References

```yaml
plan_unit_id: POA-015
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node shards and acceptance manifests cross-reference Project Contract IDs instead of duplicating specifications, and human plan.md summaries must point to canonical ProjectContract sources.
gui_related: false
gui_classification_reason: This unit defines DRY graph and acceptance cross-reference rules rather than visual presentation.
split_recommended: false
depends_on:
  - POA-014
unblocks: []
acceptance_criteria:
  - "DRY Graph And Acceptance Cross-References remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Node shards and acceptance manifests reference contract IDs rather than inlining canonical specifications."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: dry_contract_duplication
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0019
preserved_exact_tokens:
  - "contract_refs"
  - "ProjectContract:*"
  - "acceptance_manifest.json"
  - "nodes[].node_id"
  - "nodes[].checks[].contract_refs"
  - "acceptance[].check_id"
  - "Canonical source: ProjectContract:<...>"
negative_constraints:
  - "Node shards must not repeat or inline the contract pack canonical specifications; use contract_refs instead."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-node.v1, ContractName:Plans/DRY_Rules.md#7"
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: ContractName:Plans/DRY_Rules.md#7"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/DRY_Rules.md
```

### POA-016 - Autonomous Decision Logging Projection

```yaml
plan_unit_id: POA-016
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Puppet Master applies deterministic defaults autonomously, records valid ambiguities to user-project auto_decisions.jsonl, keeps internal SSOT decisions separate, and supports optional HITL approval-boundary nodes through tool_policy_mode: "ask".
gui_related: false
gui_classification_reason: This unit defines decision logging and autonomy behavior rather than visual presentation.
split_recommended: false
depends_on:
  - POA-007
unblocks: []
acceptance_criteria:
  - "Autonomous Decision Logging Projection remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "User-project decision projections stay separate from internal Plans/auto_decisions.jsonl."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: decision_log_projection_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0020
preserved_exact_tokens:
  - "Plans/Decision_Policy.md"
  - ".puppet-master/project/auto_decisions.jsonl"
  - "Plans/auto_decisions.jsonl"
  - "pm.auto_decisions.schema.v1"
  - "tool_policy_mode: \"ask\""
  - "pm.project-plan-node.v1"
negative_constraints:
  - "Human ambiguity resolution is not required for continued execution; decision logging is traceability, not gating."
preserved_contractrefs:
  - "ContractRef: `PolicyRule:Decision_Policy.md`"
  - "ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§4"
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Decision_Policy.md
```

### POA-017 - Sharded-Only Plan Graph Root

```yaml
plan_unit_id: POA-017
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Puppet Master produces user-project plans as a canonical sharded-only graph under .puppet-master/project/plan_graph/, while plan.md remains the required human-readable view.
gui_related: true
gui_classification_reason: This unit preserves the user-visible human plan view boundary while defining the sharded headless graph root.
split_recommended: false
depends_on:
  - POA-013
  - POA-015
unblocks: []
acceptance_criteria:
  - "Sharded-Only Plan Graph Root remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "The sharded graph remains canonical headless input and plan.md remains the human-readable view."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: plan_graph_entrypoint_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0021
preserved_exact_tokens:
  - "sharded-only plan graph"
  - ".puppet-master/project/plan_graph/"
  - "canonical headless execution input"
  - "plan.md"
  - "pm.project-plan-graph-index.v1"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-018 - Locked Plan Graph Entrypoint And Noncanonical Monolithic Export

```yaml
plan_unit_id: POA-018
unit_type: decision
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The canonical graph entrypoint is always plan_graph/index.json; node files live under nodes/, optional edges.json is allowed, and any monolithic graph is a labeled derived export only.
gui_related: false
gui_classification_reason: This unit defines canonical graph file authority and derived export disposition rather than visual presentation.
split_recommended: false
depends_on:
  - POA-017
unblocks: []
acceptance_criteria:
  - "Locked Plan Graph Entrypoint And Noncanonical Monolithic Export remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "No canonical .puppet-master/project/plan_graph.json is introduced."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: plan_graph_monolith_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: decision
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0022
preserved_exact_tokens:
  - ".puppet-master/project/plan_graph/index.json"
  - "nodes/<node_id>.json"
  - "edges.json"
  - "NO canonical .puppet-master/project/plan_graph.json"
  - "plan_graph/exports/plan_graph.monolithic.json"
  - "locked decision"
  - "no open questions remain"
negative_constraints:
  - "There is no canonical .puppet-master/project/plan_graph.json; monolithic export is never canonical input for orchestration or validation."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
stale_retired_dispositions:
  - "2026-02-24: Marked .puppet-master/project/plan_graph/exports/plan_graph.monolithic.json as an optional, non-canonical derived export."
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-019 - Deterministic Node IDs

```yaml
plan_unit_id: POA-019
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node IDs must be stable and reproducible from canonical node intent for identical inputs so shard filenames remain deterministic.
gui_related: false
gui_classification_reason: This unit defines deterministic identity constraints rather than visual presentation.
split_recommended: false
depends_on:
  - POA-017
unblocks: []
acceptance_criteria:
  - "Deterministic Node IDs remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Node IDs do not depend on nondeterministic inputs."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: node_id_nondeterminism
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0023
preserved_exact_tokens:
  - "stable and deterministic"
  - "timestamps"
  - "randomness"
  - "session IDs"
  - "canonical representation of the node intent"
  - "Invariant:INV-005"
  - "PolicyRule:Decision_Policy.md§2"
negative_constraints:
  - "Node IDs must not depend on timestamps, randomness, session IDs, or nondeterministic ordering."
preserved_contractrefs:
  - "ContractRef: Invariant:INV-005, PolicyRule:Decision_Policy.md§2"
owner_hints:
  - Plans/Project_Output_Artifacts.md
```

### POA-020 - Canonical Plan Graph Index Requirements

```yaml
plan_unit_id: POA-020
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  plan_graph/index.json is the required canonical graph entrypoint with schema version, node shard listing and hashes, entrypoints, deterministic execution ordering, validation targets, Executor Protocol status semantics, and canonical dependency semantics driven by blockers[].
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map because it preserves user-visible plan graph entrypoint and validation target semantics alongside headless execution rules.
split_recommended: false
depends_on:
  - POA-018
  - POA-019
unblocks: []
acceptance_criteria:
  - "Canonical Plan Graph Index Requirements remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "Index requirements preserve canonical dependency semantics and Executor Protocol status alignment."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: plan_graph_index_schema_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0024
preserved_exact_tokens:
  - "schema_version"
  - "nodes[]"
  - "nodes/<node_id>.json"
  - "sha256"
  - "entrypoints"
  - "execution_ordering"
  - "execution_ordering.node_state_source"
  - "validation.targets"
  - "acceptance_manifest"
  - "contracts_index"
  - "blockers[]"
  - "unblocks[]"
  - "depends_on[]"
  - "edges.json"
  - "Plans/Executor_Protocol.md"
negative_constraints:
  - "Graph execution must not rely on GUI-only artifacts."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes:
  - "depends_on[] is optional compatibility metadata only, and edges.json is a derived consistency artifact rather than authority."
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Executor_Protocol.md
```

### POA-021 - Plan Graph Node Shard Required Fields

```yaml
plan_unit_id: POA-021
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node shards under plan_graph/nodes/<node_id>.json must conform to pm.project-plan-node.v1, include all required lifecycle, policy, evidence, dependency, decision, and readiness fields, and keep filename node_id, ProjectContract:*, acceptance[], and evidence_required.path integrity aligned.
gui_related: false
gui_classification_reason: This unit defines sharded node schema and integrity behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-020"
unblocks: []
acceptance_criteria:
  - "Plan Graph Node Shard Required Fields remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: project_plan_node_schema_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0025
preserved_exact_tokens:
  - "node_id"
  - "objective"
  - "contract_refs"
  - "acceptance"
  - "evidence_required"
  - "allowed_tools"
  - "tool_policy_mode"
  - "policy_mode"
  - "change_budget"
  - "blockers"
  - "unblocks"
  - "status"
  - "evidence_pointer"
  - "verifier_result"
  - "decision_refs"
  - "spec_lock_requirements"
negative_constraints:
  - "No manual-only acceptance checks are allowed."
  - "evidence_required.path is reserved execution evidence, not initial Project Plan Package output."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-node.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-001"
  - "ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-022 - Optional Edges Consistency Artifact

```yaml
plan_unit_id: POA-022
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  plan_graph/edges.json is optional and, if present, must be consistent with shard dependency semantics.
gui_related: false
gui_classification_reason: This unit defines optional dependency projection behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-021"
unblocks: []
acceptance_criteria:
  - "Optional Edges Consistency Artifact remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: optional_edges_authority_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0026
preserved_exact_tokens:
  - "edges.json"
  - "blockers"
  - "unblocks"
  - "depends_on"
negative_constraints:
  - "edges.json must not be required for headless execution and must not override shard-local blockers[]."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-023 - Noncanonical Monolithic Graph Export

```yaml
plan_unit_id: POA-023
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  plan_graph/exports/plan_graph.monolithic.json may exist only as a faithful, lossless, noncanonical derived export.
gui_related: false
gui_classification_reason: This unit defines derived export disposition rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-018"
  - "POA-021"
unblocks: []
acceptance_criteria:
  - "Noncanonical Monolithic Graph Export remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: noncanonical_export_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0027
preserved_exact_tokens:
  - "pm.project-plan-graph.v1"
  - "same node IDs"
  - "same node fields"
  - "same entrypoints"
negative_constraints:
  - "The monolithic graph is not canonical and must not be required for validation or orchestration."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-024 - Seglog Artifact Event Persistence Fields

```yaml
plan_unit_id: POA-024
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project Plan Package artifacts are canonical in seglog, with filesystem as regenerable export/cache and required artifact-event fields sufficient for hash-verified reconstruction.
gui_related: false
gui_classification_reason: This unit defines persistence event fields and reconstruction semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-007"
unblocks: []
acceptance_criteria:
  - "Seglog Artifact Event Persistence Fields remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: seglog_artifact_event_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0029
preserved_exact_tokens:
  - "artifact_id"
  - "artifact_type"
  - "schema_version"
  - "logical_path"
  - "content_bytes"
  - "content_hash"
  - "ts"
  - "session_id"
  - "agent_id"
  - "workspace-root relative"
  - "SHA-256"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-025 - Canonical Project Plan Package Artifact Types

```yaml
plan_unit_id: POA-025
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The canonical artifact_type registry maps Project Plan Package artifact types to their required, optional, GUI, validation, traceability, and quickstart logical paths.
gui_related: true
gui_classification_reason: The source span includes optional GUI artifact types and user-visible package artifact registry entries.
split_recommended: false
depends_on:
  - "POA-024"
unblocks: []
acceptance_criteria:
  - "Canonical Project Plan Package Artifact Types remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: artifact_type_registry_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0030
preserved_exact_tokens:
  - "requirements"
  - "contracts_pack"
  - "plan_human"
  - "plan_graph_index"
  - "plan_graph_node"
  - "plan_graph_edges"
  - "plan_graph_monolith"
  - "acceptance_manifest"
  - "auto_decisions"
  - "ui_wiring_matrix"
  - "ui_command_catalog"
  - "validation_pass_report"
  - "requirements_quality_report"
  - "requirements_coverage_json"
  - "requirements_coverage_md"
  - "quickstart_md"
negative_constraints:
  - "plan_graph_monolith remains optional and noncanonical."
preserved_contractrefs: []
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-026 - Validator Graph Integrity And Headless Execution

```yaml
plan_unit_id: POA-026
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validators must prove sharded graph validity, shard hashes, contract references, acceptance coverage, seglog hash matching, headless orchestration, and optional monolithic export consistency.
gui_related: true
gui_classification_reason: The source span includes validation behavior that explicitly excludes reliance on GUI artifacts while preserving GUI-artifact boundary checks.
split_recommended: false
depends_on:
  - "POA-021"
  - "POA-025"
unblocks: []
acceptance_criteria:
  - "Validator Graph Integrity And Headless Execution remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validator_graph_integrity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "plan_graph/index.json"
  - "nodes[].path"
  - "nodes[].sha256"
  - "ProjectContract:*"
  - "contracts/index.json"
  - "acceptance_manifest.json"
  - "content_hash"
  - "plan.md"
  - "GUI artifacts"
  - "plan_graph.monolithic.json"
negative_constraints:
  - "Headless orchestration must not depend on plan.md, GUI artifacts, or optional monolithic exports."
preserved_contractrefs:
  - "ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: Gate:GATE-001, Gate:GATE-005, Gate:GATE-009"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-027 - Validation Sweep Completeness And Post-Pass Finality

```yaml
plan_unit_id: POA-027
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validation sweeps must produce exactly three pass reports tied by workflow_run_id, preserve provider/model provenance, remain deterministic/headless, and validate post-pass corrected artifacts.
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map and covers user-visible validation sweep provenance and corrected output finality.
split_recommended: false
depends_on:
  - "POA-026"
unblocks: []
acceptance_criteria:
  - "Validation Sweep Completeness And Post-Pass Finality remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validation_sweep_finality_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "validation_pass_report"
  - "pass_number 1, 2, 3"
  - "workflow_run_id"
  - "changes_applied_summary"
  - "requirements.md"
  - "plan.md"
  - "quickstart.md"
  - "provider"
  - "model"
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
negative_constraints:
  - "Pass 3 summary contains no write-protected requirements.md or plan.md."
  - "No human approval gates occur between Pass 1, Pass 2, and Pass 3."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-graph-index.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-028 - Traceability And Quickstart Validator Integrity

```yaml
plan_unit_id: POA-028
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validators must enforce requirements quality and coverage JSON integrity, Markdown/JSON ID parity, and optional quickstart command, count, and size constraints.
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map and includes human-readable traceability and quickstart validation outputs.
split_recommended: false
depends_on:
  - "POA-026"
unblocks: []
acceptance_criteria:
  - "Traceability And Quickstart Validator Integrity remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_quickstart_validation_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "summary.total_requirements"
  - "uncovered_requirements[]"
  - "orphaned_node_requirement_refs[]"
  - "uncovered_acceptance[]"
  - "requirements_coverage.md"
  - "nodes[].checks[].commands[].cmd"
  - "<= 20"
  - "<= 16384 bytes"
negative_constraints:
  - "Orchestration, planning, and validator correctness must not depend on quickstart.md."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-029 - Validation Pass Report Lineage Bridge

```yaml
plan_unit_id: POA-029
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validation pass reports remain upstream artifacts but must bridge backward to planning/wizard state and forward to launched execution through explicit lineage and runtime/account identity fields. The legacy `validation_pass_report` artifact family name is not a fixed validation-pass model selector; plans-to-code audit, verification, certification, quality gates, and evidence review route to Auditor Model, and broad artifact-family rename remains deferred.
gui_related: true
gui_classification_reason: The source span is GUI-related in the migration map and preserves History/Ledger/export lineage for validation pass reports.
split_recommended: false
depends_on:
  - "POA-027"
unblocks: []
acceptance_criteria:
  - "Validation Pass Report Lineage Bridge remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "validation_pass_report remains an artifact-family lineage name, not a user-facing validation-pass model selector."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validation_pass_lineage_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0031
preserved_exact_tokens:
  - "project_id"
  - "wizard_id?"
  - "thread_id?"
  - "phase_plan_ref?"
  - "staged bundle refs"
  - "requirements_quality_report_ref?"
  - "promoted artifact refs"
  - "workflow_run_id"
  - "requested/effective runtime identity snapshot refs"
  - "effective_account_id?"
  - "execution_role"
  - "run_id?"
  - "pass_verdict"
  - "skipped"
negative_constraints:
  - "Validation pass reports do not become runtime attempts."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
  - "ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: Plans/Contracts_V0.md#3.3 Requirements quality events, Plans/chain-wizard-flexibility.md#12. Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-030 - Traceability Outputs Classification

```yaml
plan_unit_id: POA-030
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Traceability outputs are derived, noncanonical for planning decisions, and canonical for verification outputs.
gui_related: false
gui_classification_reason: This unit defines traceability output authority and classification rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-028"
unblocks: []
acceptance_criteria:
  - "Traceability Outputs Classification remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_classification_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0032
preserved_exact_tokens:
  - "derived"
  - "non-canonical"
  - "canonical"
  - "requirements quality"
  - "coverage reports"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-031 - Requirements Quality Report Artifact

```yaml
plan_unit_id: POA-031
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  requirements_quality_report.json is the machine-readable requirements quality artifact, validates against pm.requirements_quality_report.schema.v1, and is verification-canonical but noncanonical for planning decisions.
gui_related: false
gui_classification_reason: This unit defines a derived verification artifact path and schema rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-030"
unblocks: []
acceptance_criteria:
  - "Requirements Quality Report Artifact remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: requirements_quality_report_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0033
preserved_exact_tokens:
  - ".puppet-master/project/traceability/requirements_quality_report.json"
  - "pm.requirements_quality_report.schema.v1"
  - "verification-canonical"
  - "non-canonical for planning decisions"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-032 - Requirements Coverage JSON And Requirement Extraction

```yaml
plan_unit_id: POA-032
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  requirements_coverage.json validates against pm.requirements_coverage.schema.v1 and is generated by extracting authoritative requirement IDs from requirements.md into requirements[] with initial uncovered coverage state.
gui_related: false
gui_classification_reason: This unit defines machine-readable traceability extraction rules rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-030"
unblocks: []
acceptance_criteria:
  - "Requirements Coverage JSON And Requirement Extraction remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: requirements_coverage_extraction_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0035
preserved_exact_tokens:
  - ".puppet-master/project/traceability/requirements_coverage.json"
  - "pm.requirements_coverage.schema.v1"
  - "FR-[0-9]{3,}"
  - "NFR-[0-9]{3,}"
  - "REQ-[0-9]{3,}"
  - "requirements[]"
  - "node_ids: []"
  - "acceptance_check_ids: []"
  - "coverage_status: \"uncovered\""
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-033 - Node Requirement Refs Coverage Mapping

```yaml
plan_unit_id: POA-033
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Node shard requirement_refs map known requirement IDs to node_ids[] and record unknown refs in orphaned_node_requirement_refs[] with the req_id_not_in_requirements_md sentinel.
gui_related: false
gui_classification_reason: This unit defines coverage mapping logic rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-032"
unblocks: []
acceptance_criteria:
  - "Node Requirement Refs Coverage Mapping remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: node_requirement_ref_mapping_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0036
preserved_exact_tokens:
  - "requirement_refs: string[]"
  - "orphaned_node_requirement_refs[]"
  - "req_id_not_in_requirements_md"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.project-plan-node.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-034 - Acceptance Manifest Requirement Mapping

```yaml
plan_unit_id: POA-034
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Acceptance manifest req_id fields map acceptance check IDs to known requirements while checks without req_id do not contribute and unknown req_id checks are ignored for uncovered_acceptance[] computation.
gui_related: false
gui_classification_reason: This unit defines acceptance coverage mapping semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-032"
unblocks: []
acceptance_criteria:
  - "Acceptance Manifest Requirement Mapping remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: acceptance_requirement_mapping_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0037
preserved_exact_tokens:
  - ".puppet-master/project/acceptance_manifest.json"
  - "req_id"
  - "check_id"
  - "acceptance_check_ids[]"
  - "uncovered_acceptance[]"
negative_constraints:
  - "Checks with no req_id do not contribute to coverage."
  - "Acceptance checks with unknown req_id are ignored for uncovered_acceptance[] computation."
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-035 - Coverage Status And Uncovered Acceptance Rules

```yaml
plan_unit_id: POA-035
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Coverage status is computed as covered, partially_covered, or uncovered from node and acceptance mappings, and uncovered_acceptance[] records only requirements with node coverage but no mapped acceptance checks.
gui_related: false
gui_classification_reason: This unit defines coverage computation semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-033"
  - "POA-034"
unblocks: []
acceptance_criteria:
  - "Coverage Status And Uncovered Acceptance Rules remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: coverage_status_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0039
preserved_exact_tokens:
  - "\"covered\""
  - "\"partially_covered\""
  - "\"uncovered\""
  - "no_acceptance_check_maps_to_this_requirement"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/requirements_coverage.schema.json"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-036 - Requirements Coverage Summary Computation

```yaml
plan_unit_id: POA-036
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The requirements_coverage summary object is computed after all mapping steps and reports total, covered, partially covered, uncovered, orphaned_refs, and uncovered_acceptance_count values from the generated collections.
gui_related: false
gui_classification_reason: This unit defines summary computation rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-035"
unblocks: []
acceptance_criteria:
  - "Requirements Coverage Summary Computation remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: coverage_summary_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0040
preserved_exact_tokens:
  - "total_requirements"
  - "covered"
  - "partially_covered"
  - "uncovered"
  - "orphaned_refs"
  - "uncovered_acceptance_count"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-037 - Human-Readable Requirements Coverage Markdown

```yaml
plan_unit_id: POA-037
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  requirements_coverage.md is regenerated deterministically from requirements_coverage.json and must match JSON counts and IDs exactly while listing covered, partially covered, uncovered, orphaned, and uncovered acceptance entries.
gui_related: false
gui_classification_reason: This unit defines human-readable verification output generation but not GUI layout or styling.
split_recommended: false
depends_on:
  - "POA-036"
unblocks: []
acceptance_criteria:
  - "Human-Readable Requirements Coverage Markdown remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: requirements_coverage_markdown_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0041
preserved_exact_tokens:
  - "requirements_coverage.md"
  - "regenerated deterministically"
  - "exact counts and IDs"
  - "covered"
  - "partially covered"
  - "uncovered"
  - "orphaned node requirement_refs"
  - "uncovered acceptance requirements"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-038 - Traceability Verifier Integrity Checks

```yaml
plan_unit_id: POA-038
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The verifier must enforce deterministic traceability integrity checks including summary count equality, uncovered and orphaned lengths, Markdown ID parity, and JSON schema validation.
gui_related: false
gui_classification_reason: This unit defines verifier checks rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-031"
  - "POA-037"
unblocks: []
acceptance_criteria:
  - "Traceability Verifier Integrity Checks remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_verifier_integrity_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0042
preserved_exact_tokens:
  - "summary.total_requirements"
  - "len(requirements[])"
  - "len(uncovered_requirements[])"
  - "len(orphaned_node_requirement_refs[])"
  - "len(uncovered_acceptance[])"
  - "requirements_coverage.md"
  - "Plans/requirements_coverage.schema.json"
  - "Plans/requirements_quality_report.schema.json"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1"
  - "ContractRef: SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011"
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1"
  - "ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-039 - Traceability Outputs Seglog Persistence

```yaml
plan_unit_id: POA-039
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Traceability outputs persist to seglog as requirements_quality_report, requirements_coverage_json, and requirements_coverage_md artifact types, with filesystem files regenerable from seglog.
gui_related: false
gui_classification_reason: This unit defines persistence for traceability outputs rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-024"
  - "POA-038"
unblocks: []
acceptance_criteria:
  - "Traceability Outputs Seglog Persistence remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: traceability_seglog_persistence_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0043
preserved_exact_tokens:
  - "requirements_quality_report"
  - "requirements_coverage_json"
  - "requirements_coverage_md"
  - "Contracts_V0.md#EventRecord"
  - "Primitive:Seglog"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, Primitive:Seglog"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-040 - Optional Quickstart Derived Convenience Contract

```yaml
plan_unit_id: POA-040
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  quickstart.md is an optional derived convenience output and is noncanonical for planning and orchestration.
gui_related: false
gui_classification_reason: This unit defines human convenience output authority rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-028"
unblocks: []
acceptance_criteria:
  - "Optional Quickstart Derived Convenience Contract remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: quickstart_authority_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0044
preserved_exact_tokens:
  - ".puppet-master/project/quickstart.md"
  - "derived convenience output"
  - "non-canonical for planning and orchestration"
negative_constraints:
  - "AI correctness, planning correctness, and validator correctness must not depend on quickstart.md."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.acceptance_manifest.schema.v1"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-041 - Quickstart Deterministic Generation Rules

```yaml
plan_unit_id: POA-041
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  quickstart.md is generated deterministically from acceptance_manifest commands using manifest traversal order, fixed count and byte limits, verbatim command membership, and the exact truncation note.
gui_related: false
gui_classification_reason: This unit defines deterministic file generation rules rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-040"
unblocks: []
acceptance_criteria:
  - "Quickstart Deterministic Generation Rules remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: quickstart_generation_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0045
preserved_exact_tokens:
  - "nodes[].checks[].commands[].cmd"
  - "no synthesis, normalization, aliasing, interpolation, or reformatting"
  - "manifest traversal order"
  - "max_commands = 20"
  - "max_file_size_bytes = 16384"
  - "... truncated; see .puppet-master/project/acceptance_manifest.json for complete checks"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-042 - Quickstart Validation Rules

```yaml
plan_unit_id: POA-042
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  If quickstart.md is present, validators enforce file size, executable command count, verbatim command membership in acceptance_manifest, and absence of commands not present in the manifest command set.
gui_related: false
gui_classification_reason: This unit defines validation rules for a derived convenience file rather than visual presentation.
split_recommended: false
depends_on:
  - "POA-041"
unblocks: []
acceptance_criteria:
  - "Quickstart Validation Rules remains addressable as a fine-grained Project Output Artifacts PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: quickstart_validation_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0046
preserved_exact_tokens:
  - "<= 16384 bytes"
  - "<= 20"
  - "nodes[].checks[].commands[].cmd"
  - "no command appears that is absent from the manifest command set"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: SchemaID:pm.acceptance_manifest.schema.v1, ContractName:Plans/Project_Output_Artifacts.md"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-043 - Change Summary Source-Lineage Map

```yaml
plan_unit_id: POA-043
unit_type: source_lineage_disposition
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  The change summary is source-lineage coverage only: it records historical additions for document packaging, traceability outputs, validation sweep hardening, validation_pass_report typing, sharded-only plan graph, noncanonical monolithic export, Project Plan Package SSOT replacement, seglog persistence, DRY contract references, and schema terminology alignment without overriding implementation-facing PlanUnits.
gui_related: false
gui_classification_reason: This unit preserves source lineage, runtime evidence, or validation artifact lineage rather than GUI implementation or visual presentation.
split_recommended: false
depends_on:
  - "POA-011"
  - "POA-018"
  - "POA-024"
  - "POA-032"
  - "POA-038"
  - "POA-042"
unblocks: []
acceptance_criteria:
  - "Change Summary Source-Lineage Map remains addressable as a fine-grained Project Output Artifacts PlanUnit or disposition."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner/consumer boundaries, and source lineage remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: source_lineage_changelog_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: source_lineage_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0047
preserved_exact_tokens:
  - ".docset/"
  - "pointer stub"
  - "requirements_quality_report.json"
  - "pm.requirements_quality_report.schema.v1"
  - "orphaned_node_requirement_refs[].reason"
  - "uncovered_acceptance[]"
  - "single Auditor validation loop"
  - "model_roles.auditor.*"
  - "unresolved_findings[]"
  - "validation_pass_report"
  - "sharded-only"
  - ".puppet-master/project/plan_graph/index.json"
  - "plan_graph/exports/plan_graph.monolithic.json"
  - "optional, non-canonical"
  - ".puppet-master/project/**"
  - "seglog"
  - "ProjectContract:*"
negative_constraints:
  - "This changelog/source-lineage coverage must not override implementation-facing POA-002 through POA-042."
preserved_contractrefs:
  - "Cross-ref: Plans/Document_Packaging_Policy.md §7"
  - "ContractRefs: SchemaID:pm.requirements_coverage.schema.v1, SchemaID:pm.project-plan-node.v1, SchemaID:pm.acceptance_manifest.schema.v1, Gate:GATE-011"
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-044 - Runtime Evidence Projection Consumer Boundary

```yaml
plan_unit_id: POA-044
unit_type: constraint
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Runtime evidence projections remain downstream consumers of the storage-owned receipt packet.
gui_related: false
gui_classification_reason: This unit preserves source lineage, runtime evidence, or validation artifact lineage rather than GUI implementation or visual presentation.
split_recommended: false
depends_on:
  - "POA-006"
  - "POA-024"
unblocks: []
acceptance_criteria:
  - "Runtime Evidence Projection Consumer Boundary remains addressable as a fine-grained Project Output Artifacts PlanUnit or disposition."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner/consumer boundaries, and source lineage remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: runtime_evidence_projection_boundary_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0048
preserved_exact_tokens:
  - "Runtime Evidence and Degradation Artifact Addendum (2026-03-08)"
  - "Runtime evidence projections"
  - "downstream consumers"
  - "storage-owned receipt packet"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
  - "Plans/storage-plan.md"
```

### POA-045 - Validation Artifact Lineage Required Fields

```yaml
plan_unit_id: POA-045
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Validation artifact lineage requires validation_pass_report, workflow_run_id, pass_verdict, phase_plan_ref, and requirements_quality_report_ref; validation lineage stays concrete and inspectable, and pass reports remain upstream artifacts rather than local replacement identifiers.
gui_related: false
gui_classification_reason: This unit preserves source lineage, runtime evidence, or validation artifact lineage rather than GUI implementation or visual presentation.
split_recommended: false
depends_on:
  - "POA-029"
  - "POA-031"
  - "POA-038"
unblocks: []
acceptance_criteria:
  - "Validation Artifact Lineage Required Fields remains addressable as a fine-grained Project Output Artifacts PlanUnit or disposition."
  - "ContractRefs, anchors, exact tokens, negative constraints, owner/consumer boundaries, and source lineage remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: validation_artifact_lineage_drift
reasoning_tier: standard
context_scope: project_output_artifacts
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0049
preserved_exact_tokens:
  - "validation_pass_report"
  - "workflow_run_id"
  - "pass_verdict"
  - "phase_plan_ref"
  - "requirements_quality_report_ref"
  - "Validation lineage stays concrete and inspectable."
  - "Pass reports remain upstream artifacts rather than local replacement identifiers."
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

### POA-001 - Project Output Artifacts Retired Source-Preserving Bridge

```yaml
plan_unit_id: POA-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  POA-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 152. Project_Output_Artifacts-S0001 through Project_Output_Artifacts-S0046 are covered by POA-002 through POA-042, Project_Output_Artifacts-S0047 through Project_Output_Artifacts-S0049 are covered by POA-043 through POA-045, S0050/S0051/S0053 are generated structural/audit dispositions, and S0052 is retired bridge lineage. POA-001 must not re-own or override implementation-facing PlanUnits and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map.
split_recommended: false
depends_on:
  - "POA-002"
  - "POA-003"
  - "POA-004"
  - "POA-005"
  - "POA-006"
  - "POA-007"
  - "POA-008"
  - "POA-009"
  - "POA-010"
  - "POA-011"
  - "POA-012"
  - "POA-013"
  - "POA-014"
  - "POA-015"
  - "POA-016"
  - "POA-017"
  - "POA-018"
  - "POA-019"
  - "POA-020"
  - "POA-021"
  - "POA-022"
  - "POA-023"
  - "POA-024"
  - "POA-025"
  - "POA-026"
  - "POA-027"
  - "POA-028"
  - "POA-029"
  - "POA-030"
  - "POA-031"
  - "POA-032"
  - "POA-033"
  - "POA-034"
  - "POA-035"
  - "POA-036"
  - "POA-037"
  - "POA-038"
  - "POA-039"
  - "POA-040"
  - "POA-041"
  - "POA-042"
  - "POA-043"
  - "POA-044"
  - "POA-045"
unblocks: []
acceptance_criteria:
  - "POA-001 does not override POA-002 through POA-045 for Project_Output_Artifacts-S0001 through Project_Output_Artifacts-S0049."
  - "Generated Owner / Consumer Map, PlanUnits heading, retired bridge, and Migration Coverage spans remain available for exact-text audit."
  - "Plans/Project_Output_Artifacts.md has no residual source_preserving_planunit product coverage after this bridge retirement."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: project_output_artifacts_residual_bridge
implementation_surfaces:
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Project_Output_Artifacts-S0052
preserved_exact_tokens:
  - "POA-001"
  - "Project Output Artifacts Residual Source-Preserving Bridge"
  - "Project Output Artifacts Retired Source-Preserving Bridge"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Migration Coverage"
  - "POA-002"
  - "POA-045"
  - "Project_Output_Artifacts-S0052"
negative_constraints:
  - "POA-001 must not be used as implementation-ready product coverage for spans now mapped to POA-002 through POA-045."
  - "Do not remap Project_Output_Artifacts-S0001 through Project_Output_Artifacts-S0049 product coverage back to POA-001."
  - "POA-001 must not re-enter source_preserving_planunit mode after phase2b-152."
owner_hints:
  - "Plans/Project_Output_Artifacts.md"
```

## Migration Coverage

Original hash: `873ad4ab0fac4327e921959abc15ad6271f04bd544a04c7ca7ff4dc01ef5ac80`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Original spans from `Project_Output_Artifacts-S0001` through `Project_Output_Artifacts-S0046` are preserved in place and atomized into fine-grained PlanUnits `POA-002` through `POA-042`; `Project_Output_Artifacts-S0047` through `Project_Output_Artifacts-S0049` are covered by `POA-043` through `POA-045`. Generated structural/audit spans `Project_Output_Artifacts-S0050` through `Project_Output_Artifacts-S0053` are explicitly dispositioned; `POA-001` is retired as bridge lineage and no residual `source_preserving_planunit` product coverage remains for `Plans/Project_Output_Artifacts.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

## Ledger Compile Addendum - pldg-20260614-002

### POA-046 - Project Artifact Open By Identity Consumer Boundary

```yaml
plan_unit_id: POA-046
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project output artifact opens consume the shared artifact identity/index contract without re-owning
  runtime artifact indexing. The storage-owned runtime artifact row key family remains
  `artifacts_index.v1:{project_id}:{artifact_id}`; project output artifacts may reference resolved
  artifact identity but must not redefine that index or collapse it to a project-only key. A project
  artifact open request must carry artifact identity, project owner/output family, storage ref,
  trust/freshness state, permissions/visibility boundary, lifecycle/integrity context, and desired
  open mode; FileManager handles file-backed realization only after the artifact identity boundary
  resolves whether the target is a workspace file, generated object, record-backed preview, or
  owner-surface route.
gui_related: true
gui_classification_reason: Opening project artifacts and routing to FileManager or preview surfaces is user-visible artifact behavior.
depends_on: [RAP-026]
unblocks: []
acceptance_criteria:
  - Project output artifacts do not redefine `artifacts_index.v1:{project_id}:{artifact_id}` or the older `artifacts_index:v1:{project_id}` source shorthand.
  - FileManager open actions receive resolved target type and trust/freshness state, not only a path-like string.
  - Runtime artifact identity and project output ownership remain distinct.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: project_artifact_open_boundary_drift
reasoning_tier: standard
context_scope: project_artifact_open_by_identity
implementation_surfaces: [Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/FileManager.md]
node_compile_hint: {mode: project_artifact_identity_consumer, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0040
  - pldg-20260614-002-part-3-fable-cleanup:atom-0051
  - pldg-20260614-002-part-3-fable-cleanup:atom-0097
  - pldg-20260614-002-part-3-fable-cleanup:atom-0098
preserved_exact_tokens: ["Project_Output_Artifacts.md:50", "artifacts_index.v1:{project_id}:{artifact_id}", "artifacts_index:v1:{project_id}", "open-by-artifact-identity", "FileManager", "artifact identity", "permissions/visibility boundary", "lifecycle status", "integrity/version data", "FileManager open-by-artifact-identity resolution semantics"]
compatibility_only_notes:
  - "`artifacts_index:v1:{project_id}` is source-lineage shorthand only; the storage-owned row key family remains `artifacts_index.v1:{project_id}:{artifact_id}`."
negative_constraints:
  - Do not collapse runtime artifact identity into project output ownership.
  - Do not pass unresolved artifact identity to FileManager as if it were a workspace path.
  - Do not drop artifact_id row identity or re-own runtime artifact indexing from Project_Output_Artifacts.
owner_hints: [Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/FileManager.md]
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### POA-047 - Plans-To-Code Receipt Artifact Families

```yaml
plan_unit_id: POA-047
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project_Output_Artifacts owns packaged output references for plans-to-code receipt families: PlanCompile receipt, ExecutorIntakeReport, worknode_dispatch_receipt, source_control_preflight_receipt, safe_point_receipt, worknode_change_receipt, test_run_receipt, auditor_verification_receipt, repair_attempt_receipt, merge_or_promotion_receipt, worknode_completion_receipt, source-control finalization receipt, model resolution receipt, and GoalCompletionReceipt. Artifact records preserve source artifact, destination artifact, owner, validator, receipt, retry route, rollback route, user escalation condition, evidence refs, changed artifacts, test artifacts, source-control refs, model receipts, and final certification status without becoming the runtime source of truth.
  Receipt artifact families preserve canonical evidence as a separate truth layer and include source_artifact, destination_artifact, retry_route, and rollback_route for handoff rows.
gui_related: false
gui_classification_reason: Receipt artifact packaging and references are evidence/artifact contracts, not visual presentation.
depends_on: [POA-046, EP-103, PNC-014]
unblocks: [POA-048, RAP-029, CV-289]
acceptance_criteria:
  - Receipt artifact families are named and discoverable in project output packages.
  - Artifacts preserve handoff, evidence, test, source-control, model, and final certification refs.
  - Project output artifacts package receipt references without replacing runtime, storage, or contract authority.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future receipt artifact package validation
risk_class: missing_completion_evidence
reasoning_tier: high
context_scope: plans_to_code_receipt_artifacts
implementation_surfaces: [Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: plans_to_code_receipt_artifacts, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0039
  - pldg-20260617-001-plans-to-code-handoff:atom-0040
  - pldg-20260617-001-plans-to-code-handoff:atom-0041
  - pldg-20260617-001-plans-to-code-handoff:atom-0055
  - pldg-20260617-001-plans-to-code-handoff:dec-0016
  - pldg-20260617-001-plans-to-code-handoff:dec-0017
preserved_exact_tokens:
  - "source_control_preflight_receipt"
  - "safe_point_receipt"
  - "worknode_change_receipt"
  - "merge_or_promotion_receipt"
  - "worknode_dispatch_receipt"
  - "test_run_receipt"
  - "auditor_verification_receipt"
  - "repair_attempt_receipt"
  - "worknode_completion_receipt"
  - "source evidence"
  - "canonical evidence"
  - "process evidence"
  - "governance evidence"
  - "test evidence"
  - "source-control evidence"
negative_constraints:
  - Do not make project output artifacts the runtime source of truth for receipt state.
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
```

### POA-048 - GoalCompletionReceipt Artifact Contract

```yaml
plan_unit_id: POA-048
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  GoalCompletionReceipt package entries must prove all_worknodes_terminal, all_tests_passed_or_dispositioned, source_control_receipts_valid, no_active_blockers, rollback and safe-point requirements satisfied, Auditor passed, no stale Plan/WorkGraph/currentness mismatch, final source state clean or intentionally preserved, final summary/evidence written, and final certifier decision. The receipt links to child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, evidence refs, unresolved risks, source-control receipts, test receipts, and model resolution receipts.
  GoalCompletionReceipt packages preserve all WorkNodes terminal, all automated tests passed or dispositioned, canonical evidence, and final certification evidence as explicit fields.
gui_related: false
gui_classification_reason: Completion receipt package fields are evidence contracts, not visual presentation.
depends_on: [POA-047, GRS-030, EP-103]
unblocks: [RAP-029, CV-289]
acceptance_criteria:
  - GoalCompletionReceipt fields are sufficient to prove code-complete criteria.
  - Worker prose cannot substitute for missing receipts, test dispositions, source-control validity, or Auditor pass.
  - Completion receipt references preserve separate evidence truth layers.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future GoalCompletionReceipt schema validation
risk_class: false_completion
reasoning_tier: high
context_scope: goal_completion_artifact
implementation_surfaces: [Plans/Project_Output_Artifacts.md, Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: goal_completion_receipt_artifact, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:atom-0055
  - pldg-20260617-001-plans-to-code-handoff:dec-0018
  - pldg-20260617-001-plans-to-code-handoff:dec-0023
preserved_exact_tokens:
  - "GoalCompletionReceipt"
  - "all WorkNodes terminal"
  - "all automated tests passed"
  - "canonical evidence"
  - "no active blockers"
  - "final certification"
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Project_Output_Artifacts.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
```

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md
