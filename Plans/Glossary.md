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
- related concepts: `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`
- surface_examples: Orchestrator, History, Run Graph

### Runtime and routing terms
#### route_target
- canonical_name: `route_target`
- short_definition: `route_target` is the shared navigation and focus contract.
- why it matters: runtime and routing views must align on one contract instead of feature-local open payloads.
- what it is not: `route_target` is not a shell-layout or transport-only alias.
- common_related_states: navigation remains distinct from `historical`, `archived`, and `removed` state overlays.
- related concepts: `target_kind`, `object_kind`, `inspector_target`, `subject_id`, `resume_url`
- surface_examples: Search, Orchestrator, File Manager
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
