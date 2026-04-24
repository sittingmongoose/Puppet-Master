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

### Orchestrator rewrite terms

**Execution Unit**: A discrete unit of work in the orchestrator (run, seam, package, node, overseer, or delegated subagent). Each has its own execution_unit_context, approval scope, and restart history. Not to be confused with Tier (deprecated).

**Execution Role**: The identity context (user, service account, or agent) under which a unit executes. Tied to permissions, quotas, and escalation chains.

**Concern**: An issue, error, or escalation that blocks or affects execution. Concerns form a lineage of episodes; each episode is tied to a specific execution attempt.

**Blocked Episode**: One instance of a concern being blocked (e.g., waiting for approval, encountering an error, retrying). Identified by blocked_episode_id; multiple episodes can exist within a single concern_id.

**Escalation Stack**: The chain of escalation frames showing who tried to resolve a concern, when, and what the outcome was. Escalations are not removed; they form an audit trail.

**Approval Scope**: The execution_unit_context level at which an approval decision gates further execution (run scope, node scope, delegated_subagent scope). An approval at one scope does not bypass approvals at a different scope.

**Approval Posture**: The policy for how approval decisions are handled (auto-approve, require_approval, suggest_only, or blocked). Tied to execution_unit_context or Persona settings.

### Runtime and routing terms

**Route Target**: A destination for output or side-effects (file://, github://, workspace://, share://, etc.). Resolved through a cascading resolver and permission checks.

**OpenSubject**: A resource or concern being opened/inspected (file, concern, help_entry, project_state, run, artifact_storage). Normalized into a shared routing model so all surfaces handle them uniformly.

**Runtime Identity**: The execution context including requested_account_id, effective_account_id, execution_role, and account_switch_lineage. Persistent across retries and restarts.

**Account Switch Lineage**: The ordered list of account IDs that the execution has switched through, with metadata (switch_reason, switch_time_utc). Used for recovery and auditing.

**Artifact**: An output or byproduct of execution (log, diff, output, input, trace). Indexed by (concern_id, route_target, artifact_type, timestamp) and tied to the execution unit that produced it.

### Projection freshness and health terms

**Projection Freshness**: How recently the UI's state representation was synchronized with the execution backend. A projection can be "fresh" (< 1s old), "warm" (< 30s), or "stale" (> 30s). UI updates are gated by freshness; a stale projection triggers a refresh.

**Projection Health**: A synthetic metric combining execution unit status, concern count, escalation depth, and approval pending state. Ranges from 'green' (no concerns, all units progressing) to 'yellow' (concerns present but recoverable) to 'red' (blocked or unrecoverable state).

**Help Architecture**: The system for providing contextual guidance (help entries, suggested actions, escalation advice) based on active concern, execution_unit_type, and concern_reason. Help entries are canonical and reusable across surfaces.

### Help architecture and project status terms

**Help Entry**: A reusable guidance document addressing a specific concern_reason or execution problem. Indexed by concern_class and concern_reason so the orchestrator can look up relevant help without requiring human navigation.

**Project Status**: A summary projection of all runs, concerns, and escalations for an active project. Includes breakdowns by concern_class, approval posture, and resolution state (active, resolved, dismissed).

**Suggested Action**: An auto-generated recommendation based on the active concern, historical outcomes, and available Personas or providers. Not mandatory; users can ignore or override.

### Help-entry template and related-concept clusters

**Template Structure**: Each help entry has:
```
- Title (concern_reason or execution problem name)
- Canonical Definition (what this issue means)
- Common Causes (why it happens)
- Recovery Steps (what to try, in order)
- Escalation Path (who to contact if recovery fails)
- Related Entries (other help topics that interact with this one)
- Evidence Links (where to find logs, traces, or debug info)
```

**Concept Clusters**: Help entries are grouped by concern_class (e.g., 'auth', 'timeout', 'approval', 'data') so users can browse related topics.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FinalGUISpec.md
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
