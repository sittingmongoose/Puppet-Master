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
### Source control, CI, and container orchestration terms

**Source Control**
The Git-first operational surface for repository changes, history, graph, branches/stash, and worktrees.
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md

**GitHub Actions**
The GitHub-hosted workflow and admin surface for Current Branch runs, Workflows, and Settings.
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

**Docker Manager**
The operational surface for containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes.
ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md

**Operation receipt**
A canonical runtime-linked record that preserves the cross-surface identity of a run/attempt action and its resulting SCM, workflow, runtime, publish, or usage references.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Shell and workspace terms


- **workspace tab** — the primary in-window working context. Holds one active project plus local shell state such as active thread, side-panel state, browser tabs, terminal sessions, and dev-session references.
- **detached window** — a secondary top-level window linked to a parent workspace tab or detached-surface record. It is not the primary shell identity.
- **project/session browser** — a shell surface for browsing projects and their sessions/runs/threads across the app.
- **attention center** — the canonical shell surface for background, blocked, or action-needed items that must remain visible outside the currently active thread or project.

### Browser and preview terms

- **workspace_preview** — in-shell browser/preview tab linked to a project and workspace tab.
- **detached_preview** — detached browser/preview window linked to a project and workspace tab.
- **automation_session** — ephemeral browser session used for automation/tooling and not promoted automatically into the persistent shell model.
- **auth_session** — ephemeral browser session used for auth/device/browser login flows and not restored as a persistent shell browser tab.
- **shared_with_agent** — state marking that a browser/preview subject has been explicitly shared with the active agent/thread and can be revoked.

### Runtime resolution terms

- **requested state** — the configuration or selection asked for by the user, command, Persona, project, or settings surface.
- **effective state** — the configuration or capability actually resolved at runtime after platform, provider, permission, health, and policy evaluation.
- **branch lineage** — the explicit relationship between a branched thread/session and its source restore point or source thread.
- **dev session** — the canonical lifecycle record for a project-linked dev server, watcher, hot-reload, live-reload, or test-watch run.
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
