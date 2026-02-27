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
- **Session** -- user-facing term for one interactive run context.
  - Note: persisted events may contain a field named `thread_id` for correlation, but user-facing text MUST say "Session".
- **Provider** -- an external AI platform integration (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini).
- **Tool** -- a host capability invoked by Puppet Master (filesystem, shell, network fetch, etc) under policy.
- **UICommand** -- a stable command ID dispatched by the UI to trigger non-trivial logic.
- **ContractRef** -- a citation that binds an operational requirement to a canonical contract, schema, policy, invariant, or primitive.
- **Overseer** -- the AI foreman role inside the Orchestrator. Responsibilities (docs-only): (1) Determines readiness at tier boundaries (Phase/Task/Subtask/Iteration). (2) Selects the next unit of work (chunk/node) deterministically. (3) Spawns Builder subagents to implement work. (4) Runs deterministic verifier checks (scripts/tests/greps). (5) Performs semantic/subjective audits at the start/end of tiers: start-of-tier scans for gaps/undefined refs/drift (auto-fix if safe, else human-visible alert); end-of-tier convergence scan (if concerns, spawn 2 reviewer subagents; escalate only if reviewers agree). (6) Stops on FAIL and surfaces evidence and next action.

ContractRef: ContractName:Contracts_V0.md#UICommand, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md

---

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
The reuse-first methodology and tagging system (DRY:WIDGET, DRY:DATA, DRY:FN, DRY:HELPER) used to prevent code duplication. Canonical definition in Plans/DRY_Rules.md. Referenced by ContractRef annotations throughout plan documents.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### PatchPipeline
The Git + PR workflow pipeline covering worktrees, branches, commits, push, and hosting operations (fork, PR creation). Local git operations are owned by WorktreeGitImprovement.md; hosting operations are owned by GitHub_API_Auth_and_Flows.md per Spec_Lock.json#github_operations.

ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### SessionStore
The persistent storage boundary for sessions, runs, events, and artifacts. Implementation uses seglog (append-only event ledger), redb (durable KV state/projections), and Tantivy (full-text search). Canonical definition in Plans/storage-plan.md. Secrets are forbidden (see PolicyRule:no_secrets_in_storage).

ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage

---

## References
- `Plans/Architecture_Invariants.md`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
