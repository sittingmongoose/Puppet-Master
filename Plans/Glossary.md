# Glossary (Canonical)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL TERMINOLOGY

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This glossary defines canonical terms used across plan documents.
It exists to prevent drift and synonym creep.

ContractRef: Primitive:Glossary

---

## 1. Canonical platform name
- **Puppet Master** -- the only correct platform name.
- **legacy naming** -- the only allowed way to refer to older platform naming.

ContractRef: Invariant:INV-010

---

## 2. Core terms
The glossary keeps one `canonical term system`, one `contextual help system`, and one `dedicated help-entry contract`.

### Orchestrator rewrite terms
#### Seams
- canonical_name: `Seams`
- short_definition: `Seams` are the rewrite-era coordination boundary between related `Feature Seam` and `Work Package` groups.
- why it matters: `Seams` are used to explain `project health`, `project activity`, and `project attention` without collapsing rewrite vocabulary.
- what it is not: `Seams` are not a replacement name for every package or lane.
- common_related_states: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, `removed`
- related_concepts: `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`
- surface_examples: Orchestrator, History, Run Graph

#### Feature Seam
- canonical_name: `Feature Seam`
- short_definition: `Feature Seam` is the named coordination boundary for a coherent feature group within a `Seam`.
- why it matters: `Feature Seam` keeps feature-group scope explicit without collapsing into `Work Package` identity.
- what it is not: `Feature Seam` is not a runtime execution unit; it is a coordination and ownership boundary only.
- common_related_states: `historical`, `archived`, `removed`
- related_concepts: `Seams`, `Work Package`, `Seam Overseer`
- surface_examples: Orchestrator, Run Graph

#### Work Package
- canonical_name: `Work Package`
- short_definition: `Work Package` is the atomic deliverable unit owned by a `Feature Seam`.
- why it matters: `Work Package` provides the granularity boundary for scheduling, retry, and acceptance within a feature group.
- what it is not: `Work Package` is not a lane or an attempt; it does not replace runtime execution identity.
- common_related_states: `historical`, `archived`, `removed`, `superseded`, `reopened`
- related_concepts: `Feature Seam`, `Package Overseer`, `Seams`
- surface_examples: Orchestrator, Run Graph

#### Package Overseer
- canonical_name: `Package Overseer`
- short_definition: `Package Overseer` is the AI role responsible for coordinating and completing one `Work Package`.
- why it matters: Explicit overseer roles keep responsibility assignment inspectable and auditable.
- what it is not: `Package Overseer` is not a user-facing label; it is a runtime coordination role.
- related_concepts: `Work Package`, `Seam Overseer`, `Seams`
- surface_examples: Orchestrator, Run Graph

#### Seam Overseer
- canonical_name: `Seam Overseer`
- short_definition: `Seam Overseer` is the AI role responsible for coordinating all `Work Package` progress within a `Feature Seam`.
- why it matters: Seam-level oversight keeps cross-package coordination traceable without collapsing into run-level identity.
- what it is not: `Seam Overseer` is not a user-facing label; it is a runtime coordination role.
- related_concepts: `Feature Seam`, `Package Overseer`, `Seams`
- surface_examples: Orchestrator, Run Graph

### Runtime and routing terms
#### route_target
- canonical_name: `route_target`
- short_definition: `route_target` is the shared navigation and focus contract.
- why it matters: runtime and routing views must align on one contract instead of feature-local open payloads.
- what it is not: `route_target` is not a shell-layout or transport-only alias.
- common_related_states: navigation remains distinct from `historical`, `archived`, and `removed` state overlays.
- related_concepts: `target_kind`, `object_kind`, `inspector_target`, `subject_id`, `resume_url`
- surface_examples: Search, Orchestrator, File Manager

#### target_kind
- canonical_name: `target_kind`
- short_definition: `target_kind` is the destination class field of `route_target`, classifying the shell surface or panel receiving the routed object.
- why it matters: consumers must know which surface class to activate before resolving object identity.
- what it is not: `target_kind` is not an object type; it describes destination surface class only.
- related_concepts: `route_target`, `object_kind`, `inspector_target`
- surface_examples: Orchestrator, File Manager, Side Panel

#### object_kind
- canonical_name: `object_kind`
- short_definition: `object_kind` classifies the domain entity being routed when a `subject_id` is not used.
- why it matters: explicit object typing keeps routing deterministic across surfaces without relying on implicit inference.
- what it is not: `object_kind` is not a `target_kind`; it classifies the domain entity, not the destination surface.
- related_concepts: `route_target`, `target_kind`, `subject_id`
- surface_examples: Orchestrator, Run Graph, Artifacts Panel

#### inspector_target
- canonical_name: `inspector_target`
- short_definition: `inspector_target` is the focus refinement field of `route_target` that specifies which inspector tab or subsurface to activate after identity is resolved.
- why it matters: deep-linking into artifact details, usage, lineage, and evidence requires a stable sub-surface selector.
- what it is not: `inspector_target` is not an identity field; it refines focus after the primary selector resolves.
- related_concepts: `route_target`, `target_kind`, `subject_id`
- surface_examples: Artifacts Panel, Run Graph, Orchestrator

#### subject_id
- canonical_name: `subject_id`
- short_definition: `subject_id` is the canonical primary selector for renderable or openable content in `route_target`.
- why it matters: document and artifact families share one selector namespace; routing surfaces must not invent parallel identity fields.
- what it is not: `subject_id` is not a general entity selector; it is bounded to `doc:` and `artifact:` families only.
- related_concepts: `route_target`, `object_kind`, `inspector_target`
- surface_examples: File Manager, Artifacts Panel

#### resume_url
- canonical_name: `resume_url`
- short_definition: `resume_url` is the serialized transport form of `route_target`, used for deep-linking and cross-surface handoff.
- why it matters: a stable serialized form of route identity enables bookmark, share, and session-restore without reimplementing routing semantics.
- what it is not: `resume_url` is not a stronger parallel primitive; it decodes to `route_target` and carries no additional routing authority.
- related_concepts: `route_target`, `subject_id`, `target_kind`
- surface_examples: Session restore, deep-link handoff, Orchestrator-to-Assistant handoff
## 3. Anti-drift documents
- **Spec Lock** -- `Plans/Spec_Lock.json`; locked decisions that MUST NOT drift.
- **Crosswalk** -- `Plans/Crosswalk.md`; ownership boundaries for primitives.
- **Progression gates** -- `Plans/Progression_Gates.md`; deterministic verification requirements.

ContractRef: SchemaID:Spec_Lock.json, Gate:GATE-003, Gate:GATE-009, PolicyRule:Decision_Policy.md§1

---

## 4. Evidence
- **Evidence bundle** -- a structured record of commands/checks/artifacts that demonstrates a requirement is met.

ContractRef: SchemaID:evidence.schema.json

---

## 5. Secret handling
- **Secret** -- any credential/token or material that could authenticate/authorize.
- **Credential store** -- OS-backed keychain/credential manager; the only allowed persistence for secrets.

ContractRef: Invariant:INV-002

---

## 6. Primitives

### DRYRules
The reuse-first methodology and tagging system (`DRY:WIDGET`, `DRY:DATA`, `DRY:FN`, `DRY:HELPER`) used to prevent code duplication. Canonical definition in `Plans/DRY_Rules.md`.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### PatchPipeline
The Git + PR workflow pipeline covering worktrees, branches, commits, push, and hosting operations. Local git operations are owned by `Plans/WorktreeGitImprovement.md`; hosting operations are owned by `Plans/GitHub_API_Auth_and_Flows.md`.

ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### SessionStore
The persistent storage boundary for sessions, runs, events, and artifacts. Implementation uses seglog (append-only event ledger), redb (durable KV state/projections), and Tantivy (full-text search). Secrets are forbidden.

ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage

### InstantGrep
The promoted feature name for transparent regex-grep acceleration. Instant Grep is not a second tool name and not a separate index family; it is the user-facing name for the SparseNgramIndex plus its `grep` and Search-panel integration.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### SparseNgramIndex
The per-project sparse n-gram regex index that transparently accelerates `grep` and Search-panel regex queries. Build time extracts all sparse n-grams from normalized content; query time extracts only a minimal covering set. Posting lists are Roaring Bitmaps keyed by xxh3 hashes; snapshots live in generation-numbered directories and publish via ArcSwap. The index narrows candidate files only; ripgrep verifies final correctness.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### DirtyLayer
The generation-aware in-memory map of dirty paths used by the SparseNgramIndex freshness model. PM-mediated writes update DirtyLayer synchronously before returning success. External file changes arrive via the file watcher. Dirty entries are always considered during verification, and generation-stamped clearing prevents long-running rebuilds from dropping new changes.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### SearchDomainSplit
`grep` owns raw regex matching over file content, accelerated by SparseNgramIndex when possible. `codesearch` owns Tantivy and LSP-backed keyword, snippet, and symbol retrieval. File Manager search remains a local tree filter, and LSP symbol/reference surfaces keep their own semantics.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

## References
- `Plans/Architecture_Invariants.md`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
