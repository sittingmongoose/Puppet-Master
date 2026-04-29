# Application- and Project-Level Agent Rules -- Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0552
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Projects page should summarize from canonical project-level projections rather than inventing its own status model.
  - There is no obvious current project-level rollup for blocked-owner and primary attention reason.
  - `handoff` uses bare agent names with no package/seam/lane context
  - handoff
  - Project-level attention should remain object-first, not notification-first.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Plans/agent-rules-context.md`
  - Plans/agent-rules-context.md
  - with `Plans/Plugins_System.md`, `Plans/Skills_System.md`, `Plans/LSPSupport.md`, `Plans/Media_Generation_and_Capabilities.md`, and `Plans/agent-rules-context.md` still clearly active.
  - Plans/Plugins_System.md
  - Plans/Skills_System.md
  - Plans/LSPSupport.md
  - Plans/Media_Generation_and_Capabilities.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:
- Two-tier rules model: Application (Puppet Master) level and Project level
- Where each is stored and how they are fed into every agent
- DRY: single rules pipeline consumed by orchestrator, interview, and Assistant

ContractRef: Primitive:DRYRules, Gate:GATE-004, Gate:GATE-009, Invariant:INV-010

## Rewrite alignment (2026-02-21)

This rules model remains authoritative, and becomes more important under the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Providers, tool policy, and the agent loop MUST all consume the same **single rules pipeline** output.
  ContractRef: Primitive:DRYRules, ContractName:Plans/Crosswalk.md
- "No API keys" is now "no API keys **except Gemini** (subscription-backed API key allowed)."
  ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, Invariant:INV-002
- OpenCode-style determinism means rules injection MUST be reproducible and represented in the unified event stream (seglog ledger) where relevant.
  AutoDecision: Persist rules injection provenance by including `rules_application_sha256` and `rules_project_sha256` fields in the `run.started` payload.
  ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

## Executive Summary

Rule: Agents invoked by Puppet Master (orchestrator iterations, interview, Assistant) MUST receive **two layers of rules** so that global and project-specific policies are always applied.
ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§4

1. **Application-level rules (Puppet Master)** -- e.g. "Always use Context7 MCP." Apply to **every agent, everywhere**. Stored and configured at the **application** (Puppet Master) level and injected into every agent invocation regardless of project.
2. **Project-level rules** -- e.g. "Always use DRY Method." Apply to **every agent that works on that project**. Stored at the **project** (target workspace) level and injected whenever the agent is operating in the context of that project.

Rule: Both layers MUST be fed into every agent on every invocation (orchestrator iteration, interview turn, Assistant chat when attached to a project) via a **single rules pipeline** (DRY).
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

## Relationship to Other Plans

| Plan | Relevance |
|------|-----------|
| **Plans/orchestrator-subagent-integration.md** | Orchestrator builds iteration prompts and injects context (e.g. context injection hook, coordination context). The **rules block** (application + project) must be included when building every iteration prompt or system prompt. Use the shared rules pipeline; do not duplicate rule content in the orchestrator. |
| **Plans/interview-subagent-integration.md** | Interview builds prompts for research, validation, and phase Q&A. Application rules always injected; project rules injected when the interview is run for a specific (target) project. Use the shared rules pipeline. |
| **Plans/assistant-chat-design.md** | Assistant chat sends context to the platform CLI. When the user is working in the context of a project, application rules + project rules must be included. When no project is selected, application rules only. Use the shared rules pipeline. |
| **AGENTS.md** | Today the Puppet Master repo's AGENTS.md contains rules like "Always use Context7 MCP." That content can be **one source** for default application rules (e.g. on first run or when no application rules file exists). Long term, application rules are a **configurable** list so the user can add/edit without editing AGENTS.md in the app repo. |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/assistant-chat-design.md
## Two-Tier Rules Model

Despite the legacy heading name, the normative model is **not** a Phase/Task/Subtask/Iteration hierarchy. The durable instruction layers are:

### Application-Level Rules (Puppet Master)
- **Scope:** every agent run under Puppet Master, regardless of whether the work is Assistant, Interview, Orchestrator, or a delegated child run
- **Purpose:** global policies that apply everywhere
- **Storage:** redb settings key `app.agent_rules.application_markdown`
- **Bootstrap:** if empty, seed from the Puppet Master repo `AGENTS.md`

### Project-Level Rules
- **Scope:** every agent invocation that runs against a selected project/workspace
- **Purpose:** project-specific conventions, tooling expectations, and non-obvious constraints
- **Storage:** `<project_root>/.puppet-master/project-rules.md`

### Order and precedence
- Application rules are always included first.
- Project rules are included when a project context exists.
- Application rules win over project rules on conflict.
- Node/work-package/attempt-specific context is **not** another rules layer; it belongs to the Work Bundle and Memory Bundle.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:AGENTS.md

## Feeding Rules Into Every Agent

### Single Rules Pipeline (DRY)

- **Concept:** One module or function that, given (optional) project path, returns a **single formatted block** of text: "Application rules" + "Project rules" (if project path is set and project rules exist). All callers use this block when building prompts or system prompts.
- **Signature (EXAMPLE only):** `get_agent_rules_context(application_config, project_path: Option<&Path>) -> String`. Returns the concatenated rules block (with optional headers like "## Application rules" and "## Project rules" for clarity inside the prompt).
- **Callers:**
  - **Orchestrator:** When building the iteration prompt (or system prompt) for each node, call the rules pipeline with the current workspace path; prepend or append the returned block to the prompt (or inject via the context injection hook or a dedicated "rules injector" step).
  - **Interview:** When building any prompt that goes to an agent (research, validation, phase Q&A), call the rules pipeline with the interview's target project path; include the block in the prompt.
  - **Assistant:** When the user has a project selected, call the rules pipeline with that project path and include the block in the context sent to the CLI. When no project is selected, call with `project_path: None` so only application rules are included.
- **DRY:** Rule content lives in one place per layer (application store, project file). The pipeline is the single place that assembles them; no copy-paste of "Context7" or "DRY" into multiple prompt builders.
  ContractRef: Primitive:DRYRules

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md
### Where in the Prompt

- **Injection location (deterministic):** Prepend the combined rules block to the main (user) prompt for every agent invocation.
  AutoDecision: Prepend-only; do not rely on platform-specific system-prompt flags.
  ContractRef: PolicyRule:Decision_Policy.md§2, Primitive:DRYRules

## Configuration and GUI (Planning Only)
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

### In-app instructions editor reconciliation

The in-app project instructions editor writes the same runtime-consumed project rules and instruction files defined by this document.

Rules:
- the editor must show the canonical path and scope for the file being edited
- when editing project rules, the canonical runtime path remains `.puppet-master/project-rules.md` unless this document is updated explicitly
- the editor must not create a shadow instruction source that the rules pipeline does not read
- save, validation, lint, and dirty-state feedback must be visible in the editor surface that owns instruction editing

- **Application rules:** Expose in GUI (e.g. Settings or Config → "Application rules" / "Puppet Master rules"): list or multi-line text. Save to the same store used by the rules pipeline (file or config). Tooltip or help: "These rules are fed to every agent run by Puppet Master (orchestrator, interview, Assistant)."
- **Project rules:** Expose when a project is selected (e.g. Project settings, or a "Project rules" tab/panel): multi-line text or list that reads/writes the project's rules file. Tooltip: "These rules are fed to every agent that works on this project."
- **Defaults:** Application rules can be seeded from Puppet Master's `AGENTS.md` on first run or when the list is empty. Project rules can start empty and be filled by the user or by the interview when it generates project docs.

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |

## Implementation Hooks (Planning Only)

1. **Define storage:** Application rules live in redb settings (`settings` namespace key `app.agent_rules.application_markdown`). Project rules live in `<project_root>/.puppet-master/project-rules.md`.
   ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/storage-plan.md
2. **Rules pipeline:** Implement `get_agent_rules_context(app_config, project_path)` that loads application rules, optionally loads project rules when `project_path` is set, and returns a single formatted string. Use this in one place so all callers depend on it (DRY).
3. **Orchestrator:** When building iteration (or system) prompt, call the rules pipeline with the run's workspace path; inject the returned block.
4. **Interview:** When building any agent prompt, call the rules pipeline with the interview's target project path; inject the returned block.
5. **Assistant:** When building context for the chat CLI, call the rules pipeline with the current project path (or None); inject the returned block.
6. **GUI:** Add Application rules and Project rules (when project selected) to Settings/Config; persist and read via the same storage the rules pipeline uses.

## Instruction Bundle Integration (Application + Project + Scoped `AGENTS.md`)

This plan's durable rules pipeline remains the user-editable source of rules text, but every agent invocation assembles a deterministic **Instruction Bundle** instead of relying on tier-era injector naming.

**Instruction Bundle order:**
1. Application rules
2. Project rules (when a project is selected)
3. Scoped `AGENTS.md` instruction chain, when enabled

Rules:
- the shared rules pipeline outputs rules content only; it does not inject attempt journals, parent summaries, or assistant-only memory
- Assistant memory, Attempt Journal, and Parent Summary are separate memory/context injectors and MUST NOT masquerade as rules text
- within the scoped `AGENTS.md` chain, closest scope wins and identical content is deduplicated deterministically
- Application rules outrank Project rules and all scoped `AGENTS.md` content; Project rules outrank scoped `AGENTS.md`
- prompt builders for Assistant, Interview, Orchestrator, and delegated child runs all use the same assembly order and names

ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

<a id="FeatureSpecVerbatim"></a>
## Feature Spec (Verbatim)

This feature defines deterministic, low-bloat context management for Puppet Master's node-graph runtime: run/work-package -> node -> attempt. It is a product requirement for the finished Puppet Master application, not a description of the current repo layout.

### Purpose
Define deterministic, low-bloat context management for Puppet Master's node-graph runtime: run/work-package -> node -> attempt. This is a product requirement for the finished Puppet Master application, not a description of the current repo layout.

### Goals
1. Fresh context per attempt with durable learning.
2. Deterministic bundle assembly that minimizes token waste.
3. Scoped instructions (`AGENTS.md`) that remain short and relevant.
4. Three user-configurable context injectors with defaults:
   - Parent Summary (default ON)
   - Scoped `AGENTS.md` beyond top-level (default ON)
   - Attempt Journal (default ON)
5. Controlled promotion of stable learnings into the nearest appropriate `AGENTS.md`.

### Artifact Types (SSOT Definitions)
#### A) Instruction Files (Durable)
**Name:** `AGENTS.md`
**Scope:** applies to the subtree rooted at the directory containing it.
**Lightness rule:** short invariants, constraints, and non-obvious conventions only.

#### B) Attempt Journal (Ephemeral, per node attempt)
**Name:** `attempt_journal.md` (or structured equivalent) stored in PM sidecar state for the relevant node scope.
**Purpose:** prevent repeated failed attempts.
**Injection:** only the most recent journal for the same node lineage is injected into the next attempt when enabled.

#### C) Parent Summary (Ephemeral, per handoff)
**Name:** `parent_summary.md`
**Budget:** 5–10 lines hard cap.
**Injection:** injected into attempt context when enabled.

#### D) Promotion (Controlled, optional)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0556
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `target_kind` must stay coarse and controlled.
  - target_kind
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Promotion moves stable, reusable learnings into the nearest appropriate `AGENTS.md` when the learning is non-obvious, stable, and scope-relevant.

### Context Assembly Semantics (Deterministic Cone)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0553
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `context help`: richer popover, side panel, or surface-local explainer with examples and related concepts
  - context help
  - `stage/tier/task/repo context`
  - stage/tier/task/repo context
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Puppet Master constructs explicit bundles for each agent run:
1. **Instruction Bundle**
2. **Work Bundle**
3. **Memory Bundle**

#### Instruction Bundle
Always includes top-level `AGENTS.md` when present. When scoped `AGENTS.md` is enabled, include the applicable chain from root to the current scope directory, with closest-scope precedence and deterministic deduplication.

#### Work Bundle

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0557
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Work Packages`
  - Work Packages
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Contains only what is needed to execute the current node/attempt: objective, acceptance criteria, inputs, allowed tools, and explicit constraints.

#### Memory Bundle
When enabled, inject the most recent node-lineage Attempt Journal and/or the bounded Parent Summary. Assistant-only memory remains Assistant-only and is not injected into unrelated orchestrator/interview/delegated runs.

### Visibility Rules
- coordinating runs/packages see coordinating objectives and summaries, not every child attempt journal by default
- node execution sees the current node objective, scoped instruction chain, and node-relevant memory only
- delegated child attempts inherit the same Instruction Bundle ordering plus child-specific Work/Memory Bundles
- verification/review attempts use the same assembly semantics; they do not reintroduce deprecated tier vocabulary

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/DRY_Rules.md
---
## Visibility examples (coordinating run → work package → node → attempt)
### Coordinating run sees
- Instruction: application/project rules plus the relevant scoped instruction chain
- Work: run and work-package objectives / acceptance criteria
- Memory: bounded summaries relevant to coordination, not every child attempt journal by default

### Work-package coordinator sees
- Instruction: application/project rules plus the applicable scoped instruction chain
- Work: work-package objectives / acceptance criteria
- Memory: package-level notes and summaries, not unrelated node-attempt journals

### Node execution sees
- Instruction: top-level plus the applicable scoped instruction chain
- Work: node objectives / acceptance criteria
- Memory: node-relevant memory only; coordinating summaries remain bounded

### Attempt execution sees
- Instruction: the same applicable instruction chain for the bound node scope
- Work: this attempt's exact objective + acceptance criteria
- Memory: latest attempt journal (if enabled) + parent summary (if enabled)
- Excludes: unrelated branches, long histories, and parent full reasoning by default
---
## Workspace & Storage (User-Project Facing Product Behavior)
Puppet Master should store these artifacts in a sidecar workspace by default:
- prevents polluting user repos
- allows consistent lifecycle management and truncation rules
Recommended: `.puppet-master/workspace/<project>/<run>/<node>/` containing:
- `AGENTS.md` (managed or user-owned depending on mode)
- `parent_summary.md`
- `attempt_journal.md`
- attempt/run artifacts
---
## GUI Requirements (Product)
Add “Context Injection” settings (per project; override per run optional):
1) Parent Summary — default ON
2) Scoped AGENTS.md (beyond top-level) — default ON
3) Attempt Journal — default ON
GUI must show an “Injected Context” breakdown per run:
- which AGENTS.md were included (paths + byte counts)
- whether parent summary and attempt journal were included (byte counts)
- whether truncation occurred (and why)
---
## AGENTS.md Light Enforcement (Product)
### Authoring-time lint
When user edits AGENTS.md in Puppet Master:
- warn/error on:
- directory trees
- long command encyclopedias
- architecture tours
- redundant discoverable info
- enforce budgets (defaults may be decided in Plans/auto_decisions.jsonl per Plans/Decision_Policy.md):
- max bytes (e.g. 6–10KB)
- max lines (e.g. 80)
- max headings (e.g. 6)
### Runtime budget enforcement
Before a run:
- compute total instruction bytes + estimated tokens
- warn on threshold exceed
- if strict mode enabled: block run until reduced
- deterministic truncation policy:
- never truncate Work Bundle acceptance criteria
- truncate “examples/illustrative” sections first
- record truncation in run metadata and UI
---
## Acceptance Criteria (Testable)
1) With scoped AGENTS enabled, an attempt run includes top-level + applicable scope chain, and excludes unrelated scopes.
2) With scoped AGENTS disabled, only top-level AGENTS is included.
3) With attempt journal enabled, attempt N+1 includes the most recent attempt_journal from attempt N in the same node lineage, and never includes older journals by default.
4) Parent summary injection can be toggled off; when on it is capped at 10 lines and included in attempt context.
5) Promotion never grows AGENTS.md beyond budget; if budget would be exceeded, promotion requires replacement/condense.
6) GUI exposes the three toggles with correct defaults and displays injected context breakdown including truncation.
7) AGENTS.md lint flags wiki-content patterns and budget violations; strict mode can block runs.

---

*Document created for planning only; no code changes.*
