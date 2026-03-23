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
- **Feature Seam**: a first-class graph-owned integration object representing one cross-package feature boundary.
- **Work Package**: a first-class graph-owned execution/governance object representing package-local work within a seam.
- **Package Overseer**: the governance actor responsible for one work package.
- **Seam Overseer**: the governance actor responsible for cross-package integration inside one feature seam.
- **Weak Integration**: an integration-quality failure family that includes wiring problems, workflow gaps, state/contract mismatches, GUI/runtime mismatch, and architecture drift.
- **Promotion**: a governance/runtime state transition family that includes package availability and seam completion rather than a single generic “done” flag.
- **Corroboration**: deterministic major-claim acceptance using the `2-of-3` model of original claim plus two corroborators.
- **Graph Patch**: a formal structural replan that creates a new graph generation rather than mutating the prior graph in place.
- **Graph Generation**: one graph lineage generation created by original planning or later graph patching.
- **Lane**: the orchestration-facing operational identity bound to package execution and historical lineage.
- **Worktree**: the concrete Git/filesystem backing object used by Source Control and lane execution.
- **Concern**: a first-class durable issue record with its own lifecycle and lineage.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### Runtime and routing terms

- **Blocked Episode**: one runtime-owned blocked period anchored by `run_id`, `node_id`, and `blocked_sequence`.
- **Execution Role**: the actor-role identity used for runtime disclosure and audit, distinct from provider/account identity.
- **Operational Identity**: the side-effect or target-context identity used for external operations, distinct from provider/account identity.
- **Requested vs Effective**: the distinction between what was asked for and what actually ran.
- **projection_freshness**: `current | refreshing | stale`.
- **projection_health**: `healthy | degraded | unavailable`.
- **route_target**: the canonical navigation-and-focus contract.
- **OpenSubject**: the canonical identity-native source-open contract.
- **Terminal Section**: the presentation-level terminal container that owns dock/detach state and ordered terminal tabs.
- **Terminal Tab**: the terminal workspace container that owns title, pin state, order, and selected pane state.
- **Terminal Pane**: the split-tree slot inside a terminal tab that binds to exactly one live or historical terminal session at a time.
- **Terminal Session**: the canonical PTY/runtime identity for exact shell continuity.
- **Dev Session**: the higher-level dev workflow identity that may link multiple terminal, Output, Problems, Debug Console, and Ports surfaces without replacing terminal-session identity.
- **Command Block**: transcript-layer metadata anchored to one observed command invocation; it is not a replacement for the underlying terminal transcript.
- **Shell Integration Tier**: the disclosed confidence tier for command/cwd/prompt metadata (`rich | basic | opaque`).
- **Restore Outcome**: the disclosed recovery result for restored shell state (`restored_live | restored_exited | restored_disconnected | restored_without_history`).

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileManager.md

### Debug investigation terms
- **Debug Mode**: the Assistant chat workflow overlay for evidence-first automated diagnosis, fix, verification, and cleanup. It is not a runtime-mode enum value.
- **Debugger / DAP Debugger**: the classical runtime debugger surface based on DAP. It is not the same thing as Debug Mode.
- **Debug Console**: the runtime-output / debugger-adjacent console surface. It is not the same thing as Debug Mode.
- **Investigation Context**: the visible, bounded bundle of target metadata, evidence summaries, instrumentation state, and verification outcomes carried by an active investigation.
- **`investigation_id`**: the canonical cross-surface identity for one debugging investigation.
- **`instrumentation_id`**: the canonical identity for one temporary instrumentation lane or reversible debug mutation set inside an investigation.
- **`debug_target_kind`**: the canonical target enum `dev_session | browser_target | dap_session | agent_session | imported_bundle`.
- **Verification Strength**: the canonical verification-result strength `none | weak | strong`; only `strong` supports silent auto-resolution.
- **Attention Reason Code**: machine-readable reason indicating why an investigation needs explicit user awareness even when it is not hard-blocked.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileManager.md
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
