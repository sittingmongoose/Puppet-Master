# Glossary (Canonical)

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-061: Glossary and help governance
- Coverage rows: cov-061
- Fidelity gap refs: cov-061
- Required fidelity items:
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-061: Glossary and help governance` exists in `Plans/Glossary.md`.
- Exact acceptance check: The `cov-061` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-061` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-194: Help entry template and related-concept clusters
- Coverage rows: cov-194
- Fidelity gap refs: cov-194
- Required fidelity items:
- Exact required item: Define a dedicated help-entry template and related-concept linking clusters
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-194: Help entry template and related-concept clusters` exists in `Plans/Glossary.md`.
- Exact acceptance check: The `cov-194` repair states the exact requirement: Define a dedicated help-entry template and related-concept linking clusters
- Exact acceptance check: The `cov-194` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

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

### Orchestrator rewrite terms

- **Execution Unit Context** -- the canonical runtime-facing object that names `execution_unit_id`, `execution_unit_type`, parent lineage, and the `execution_role` that owns execution.
- **Concern Record** -- the durable record for a concern lineage, including `concern_id`, `blocked_episode_id`, `blocked_sequence`, escalation frames, and recovery posture.
- **Trust State** -- the runtime trust decision for whether a route, provider, or mutation surface is readable, writable, degraded, or blocked.
- **Degraded State** -- a temporary runtime condition where read-only inspection may continue but write mutations or resumptions remain gated until recovery clears the degraded posture.
- **Inline Help** -- lightweight help rendered directly beside the active control, row, or blocked state without changing the canonical term name.
- **Context Help** -- a resolved help payload scoped to the active concern, execution context, route target, or inspector surface.
- **Canonical Help Entry** -- the durable help record keyed by canonical concern and state terms; inline help and context help both point back to this entry instead of minting new synonyms.

Use these canonical names verbatim in rewrite docs so execution objects, states, trust semantics, and help layers stay stable across Orchestrator, inspectors, and recovery surfaces.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### Runtime and routing terms

**Route Target**: A destination for output or side-effects (file://, github://, workspace://, share://, etc.). Resolved through a cascading resolver and permission checks.

**OpenSubject**: A resource or concern being opened/inspected (file, concern, help_entry, project_state, run, artifact_storage). Normalized into a shared routing model so all surfaces handle them uniformly.

**Runtime Identity**: The execution context including requested_account_id, effective_account_id, execution_role, and account_switch_lineage. Persistent across retries and restarts.

**Account Switch Lineage**: The ordered list of account IDs that the execution has switched through, with metadata (switch_reason, switch_time_utc). Used for recovery and auditing.

**Artifact**: An output or byproduct of execution (log, diff, output, input, trace). Indexed by (concern_id, route_target, artifact_type, timestamp) and tied to the execution unit that produced it.

### Projection freshness and health terms

- **Projection Freshness** -- the recency of the projection relative to the live runtime source. It answers "how old is this copy?" and is evaluated with states such as `fresh`, `warm`, `stale`, and `expired`.
- **Projection Health** -- the quality and executability of the projection. It answers "is this state safe and complete enough to act on?" and is evaluated with states such as `healthy`, `degraded`, `blocked`, or `unknown`.
- Action gating uses both axes together: a projection can be fresh-but-unhealthy or healthy-but-stale, and either condition can block a route/open or mutation surface.
- `trust_tier` is reserved for preview/browser semantics such as DOM confidence, scraper provenance, or visual inspection confidence.
- Retire `trust_tier` from action-gating terminology; route/open admissibility and mutations key from `projection_freshness` plus `projection_health` instead.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Help architecture and project status terms

- **Help Entry Architecture** -- the dedicated help-entry architecture with related-concept linking. Each help entry is keyed by canonical concern/state terms and can expose related concepts without renaming the underlying canon.
- **Project `activity_state`** -- the project-wide activity summary (`planning`, `running`, `waiting`, `blocked`, `cooling_down`, `archived`) that answers what the project is doing now.
- **Project `attention_state`** -- the project-wide urgency summary (`quiet`, `watch`, `needs_attention`, `urgent`) that answers how strongly the project should surface alerts, badges, and resurfacing reminders.
- **Blocked-owner taxonomy** -- the canonical owner classes for who must act next (`runtime_owner`, `approval_owner`, `account_owner`, `route_owner`, `policy_owner`).
- **Escalation ladder** -- the deterministic progression from inline help to context help to canonical help entry to owner-targeted remediation to explicit human escalation.
- **Resurfacing / aging rules** -- the thresholds that age unresolved blockers, raise `attention_state`, and resurface the same help entry until the blocker is resolved, dismissed, or reassigned.

This section defines project `activity_state`, project `attention_state`, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules so the same vocabulary can be reused across Orchestrator, project inspectors, and help surfaces.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

### Help-entry template and related-concept clusters

A dedicated help-entry template and related-concept linking cluster uses this canonical shape:

```text
Title
Canonical definition
When this appears
Affected execution context or surface
Recovery steps
Escalation path
Related concepts
Evidence / inspector links
```

Related-concept clusters group help entries by canonical concern/state families such as `auth`, `approval`, `route/open`, `runtime recovery`, and `projection health`. Each cluster keeps durable links between sibling help entries so inline help, context help, and full help views can pivot without inventing new terminology.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

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
