# Application- and Project-Level Agent Rules -- Plan


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:
- Two durable rule scopes: Application (Puppet Master) level and Project level
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

Rule: Agents invoked by Puppet Master (orchestrator iterations, interview, Assistant) MUST receive **two durable rule scopes** so that global and project-specific policies are always applied.
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
| **AGENTS.md** | Today the Puppet Master repo's AGENTS.md contains rules like "Always use Context7 MCP." That content can be **one source** for default application rules (e.g. on first run or when no application rules file exists). Long term, application rules are a **configurable** list so the user can add/edit without editing AGENTS.md in the app repo. Current OpenAI Codex product docs support `AGENTS.md` as a native guidance surface for Codex tasks, so PM's AGENTS-centered canonical instruction model remains aligned with Codex. |

Rules-context assembly consumes cache-friendly prompt assembly from `Plans/Prompt_Pipeline.md` and treats `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` as the external V0-to-A2A event mapping reference; this document does not re-own either contract.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/assistant-chat-design.md
<a id="two-tier-rules-model"></a>
## Rule Scope Model

The normative model is not a Phase/Task/Subtask/Iteration hierarchy and does not create runtime role policy. The durable instruction scopes are:

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

This plan's durable rules pipeline remains the user-editable source of rules text, but every agent invocation assembles a deterministic **Instruction Bundle** instead of relying on legacy injector naming.

**Instruction Bundle order:**
1. Application rules
2. Project rules (when a project is selected)
3. Scoped `AGENTS.md` instruction chain, when enabled

Rules:
- the shared rules pipeline outputs rules content only; it does not inject attempt journals, parent summaries, or assistant-only memory
- Assistant memory, Attempt Journal, and Parent Summary are separate memory/context injectors and MUST NOT masquerade as rules text
- provider cache controls such as `copilot_cache_control` and Anthropic-like cache-marker eligibility are resolved by Prompt Pipeline/provider owners using explicit provider and model-id evidence; the rules pipeline must not infer cache behavior from rule text or model-id heuristics
- within the scoped `AGENTS.md` chain, closest scope wins and identical content is deduplicated deterministically
- Application rules outrank Project rules and all scoped `AGENTS.md` content; Project rules outrank scoped `AGENTS.md`
- prompt builders for Assistant, Interview, Orchestrator, and delegated child runs all use the same assembly order and names
- provider-native instruction loaders may be configured to read equivalent context files; for Gemini, settings can override `context.fileName` so `AGENTS.md` is included alongside or instead of the native Gemini context filename

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


Promotion moves stable, reusable learnings into the nearest appropriate `AGENTS.md` when the learning is non-obvious, stable, and scope-relevant.

### Context Assembly Semantics (Deterministic Cone)


Puppet Master constructs explicit bundles for each agent run:
1. **Instruction Bundle**
2. **Work Bundle**
3. **Memory Bundle**

#### Instruction Bundle
Always includes top-level `AGENTS.md` when present. When scoped `AGENTS.md` is enabled, include the applicable chain from root to the current scope directory, with closest-scope precedence and deterministic deduplication.

#### Work Bundle


Contains only what is needed to execute the current node/attempt: objective, acceptance criteria, inputs, allowed tools, and explicit constraints.

#### Memory Bundle
When enabled, inject the most recent node-lineage Attempt Journal and/or the bounded Parent Summary. Assistant-only memory remains Assistant-only and is not injected into unrelated orchestrator/interview/delegated runs.

### Visibility Rules
- coordinating runs/packages see coordinating objectives and summaries, not every child attempt journal by default
- node execution sees the current node objective, scoped instruction chain, and node-relevant memory only
- delegated child attempts inherit the same Instruction Bundle ordering plus child-specific Work/Memory Bundles
- verification/review attempts use the same assembly semantics; they do not reintroduce deprecated execution-hierarchy vocabulary

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

Each instruction/rules target has exactly one control mode: `PM Controlled` or `Manual Override`. A `PM Controlled` target is regenerated only from the saved canonical instruction source. A target can switch from `Manual Override` back to `PM Controlled` only after the canonical instruction source is saved and the target is refreshed from that source.
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

---
## Route Context and Attention Destination Rules

The existing `resume_url` pattern is the precedent for precise recovery routes: wizard and thread flows preserve a stored deep link, and the same internal payload model must generalize beyond wizards so project-level attention objects can route to Orchestrator, Chat, Source Control, GitHub, Usage, or Settings. Agent rules context records the instruction-bundle consequences of those routes; the route contract layer owns the controlled coarse destination enum/family.

Concern-specific future record/action docs are not instruction-rule sources yet. `Plans/Orchestrator_Page.md` and `/Orchestrator_Page.md` remain `/action` consumers for concern and attention workflows, while this doc only carries the context needed for scoped instructions, route-aware recovery, and project-level handoff.

Historical `/current` run switching must not change layout identity. Layout scope remains project-level rather than run-level, so route context may focus a historical or current run without rewriting the instruction/rules target identity.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/agent-rules-context.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### ARC-001 - Application- and Project-Level Agent Rules Retired Source-Preserving Bridge

```yaml
plan_unit_id: ARC-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: ARC-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 114 because agent-rules-context-S0001
  through S0046 are covered by ARC-002 through ARC-035 or explicit structural, retired, and migration-coverage dispositions.
  ARC-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried
  by fine-grained agent-rules-context PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- ARC-002
- ARC-003
- ARC-004
- ARC-005
- ARC-006
- ARC-007
- ARC-008
- ARC-009
- ARC-010
- ARC-011
- ARC-012
- ARC-013
- ARC-014
- ARC-015
- ARC-016
- ARC-017
- ARC-018
- ARC-019
- ARC-020
- ARC-021
- ARC-022
- ARC-023
- ARC-024
- ARC-025
- ARC-026
- ARC-027
- ARC-028
- ARC-029
- ARC-030
- ARC-031
- ARC-032
- ARC-033
- ARC-034
- ARC-035
unblocks: []
acceptance_criteria:
- ARC-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 114.
- agent-rules-context-S0001 through S0046 coverage is owned by ARC-002 through ARC-035 or explicit structural, retired, and
  migration-coverage dispositions.
- ARC-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0045
preserved_exact_tokens:
- ARC-001
- Application- and Project-Level Agent Rules -- Plan Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- PlanUnits
- Migration Coverage
- Original hash
negative_constraints:
- ARC-001 must not re-own agent-rules-context-S0001 through S0046 after Phase 2B batch 114.
- ARC-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- ARC-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former ARC-001 residual source-preserving bridge is retired by Phase 2B batch 114.
owner_boundary_notes:
- Fine-grained PlanUnits ARC-002 through ARC-035 carry product/source coverage for agent-rules-context-S0001 through S0043;
  S0044 and S0046 are structural/metadata dispositions.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-002 - Compliance And Plan Document Boundary

```yaml
plan_unit_id: ARC-002
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: The document preserves the Application- and Project-Level Agent Rules plan title, compliance with DRY and
  Contracts references, Puppet Master naming, deterministic defaults, PLAN DOCUMENT ONLY status, no code changes, two durable
  rule scopes, and a single rules pipeline consumed by orchestrator, interview, and Assistant.
gui_related: false
gui_classification_reason: This unit covers document governance and rules-pipeline scope, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: compliance_and_plan_document_boundary
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: compliance_and_plan_document_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0002
preserved_exact_tokens:
- Application- and Project-Level Agent Rules -- Plan
- PLAN DOCUMENT ONLY
- No code changes
- Puppet Master
- two durable rule scopes
- Application (Puppet Master) level
- Project level
- single rules pipeline
- orchestrator
- interview
- Assistant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, Gate:GATE-004, Gate:GATE-009, Invariant:INV-010'
```

### ARC-003 - Rewrite Rules Provenance

```yaml
plan_unit_id: ARC-003
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Rewrite alignment preserves that providers, tool policy, and the agent loop MUST consume the same single rules
  pipeline output, no API keys now means no API keys except Gemini, and OpenCode-style determinism requires reproducible rules
  injection with rules_application_sha256 and rules_project_sha256 in the run.started payload.
gui_related: false
gui_classification_reason: This unit covers rewrite, provenance, and event metadata rules, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_rules_provenance
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: rewrite_rules_provenance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0003
preserved_exact_tokens:
- Rewrite alignment (2026-02-21)
- single rules pipeline
- No API keys
- no API keys **except Gemini**
- subscription-backed API key allowed
- OpenCode-style determinism
- rules_application_sha256
- rules_project_sha256
- run.started
- seglog ledger
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/Crosswalk.md'
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, Invariant:INV-002'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord'
```

### ARC-004 - Two Durable Rule Scopes

```yaml
plan_unit_id: ARC-004
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'Every Puppet Master agent invocation must receive Application-level rules and Project-level rules through
  the DRY single rules pipeline: application rules apply to every agent everywhere and project rules apply to every agent
  working on that project.'
gui_related: false
gui_classification_reason: This unit covers durable rules scope and injection policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: two_durable_rule_scopes
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: two_durable_rule_scopes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0004
preserved_exact_tokens:
- Executive Summary
- Application-level rules (Puppet Master)
- Project-level rules
- Always use Context7 MCP.
- Always use DRY Method.
- every agent, everywhere
- every agent that works on that project
- single rules pipeline
- DRY
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§4'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### ARC-005 - Cross-Doc Rules Ownership

```yaml
plan_unit_id: ARC-005
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Relationship to Other Plans preserves that orchestrator, interview, and Assistant consume the shared rules
  block without duplicating rule content; AGENTS.md may seed default application rules while long-term application rules remain
  configurable, and Prompt_Pipeline plus Provider_Stream_Mapping_External_Reference_A2A are consumed rather than re-owned.
gui_related: false
gui_classification_reason: This unit records cross-doc ownership and consumer boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_doc_rules_ownership
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: cross_doc_rules_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0005
preserved_exact_tokens:
- Relationship to Other Plans
- two-tier-rules-model
- Plans/orchestrator-subagent-integration.md
- Plans/interview-subagent-integration.md
- Plans/assistant-chat-design.md
- AGENTS.md
- Always use Context7 MCP.
- configurable
- Plans/Prompt_Pipeline.md
- Plans/Provider_Stream_Mapping_External_Reference_A2A.md
- does not re-own
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Rules-context assembly consumes Prompt Pipeline and external A2A mapping references; this doc does not re-own either contract.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md,
  ContractName:Plans/assistant-chat-design.md'
```

### ARC-006 - Application Rules Storage

```yaml
plan_unit_id: ARC-006
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Application-Level Rules apply to every agent run under Puppet Master, regardless of Assistant, Interview,
  Orchestrator, or delegated child run; they serve global policies, store in redb settings key app.agent_rules.application_markdown,
  and bootstrap from the Puppet Master repo AGENTS.md when empty.
gui_related: false
gui_classification_reason: This unit covers storage and scope for application rules, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: application_rules_storage
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: application_rules_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0007
preserved_exact_tokens:
- Rule Scope Model
- Application-Level Rules (Puppet Master)
- every agent run under Puppet Master
- Assistant
- Interview
- Orchestrator
- delegated child run
- global policies
- redb settings key
- app.agent_rules.application_markdown
- Bootstrap
- AGENTS.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-007 - Project Rules Storage

```yaml
plan_unit_id: ARC-007
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Project-Level Rules apply to every agent invocation against a selected project/workspace, carry project-specific
  conventions, tooling expectations, and non-obvious constraints, and store at <project_root>/.puppet-master/project-rules.md.
gui_related: false
gui_classification_reason: This unit covers storage and scope for project rules, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: project_rules_storage
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: project_rules_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0008
preserved_exact_tokens:
- Project-Level Rules
- selected project/workspace
- project-specific conventions
- tooling expectations
- non-obvious constraints
- <project_root>/.puppet-master/project-rules.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-008 - Rule Precedence Boundary

```yaml
plan_unit_id: ARC-008
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Rule order and precedence preserves that application rules are always included first, project rules are included
  only when project context exists, application rules win over project rules on conflict, and node/work-package/attempt-specific
  context is not another rules layer because it belongs to Work Bundle and Memory Bundle.
gui_related: false
gui_classification_reason: This unit covers precedence and context-layer boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rule_precedence_boundary
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: rule_precedence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0009
preserved_exact_tokens:
- Order and precedence
- Application rules are always included first.
- Project rules are included when a project context exists.
- Application rules win over project rules on conflict.
- Node/work-package/attempt-specific context is **not** another rules layer
- Work Bundle
- Memory Bundle
negative_constraints:
- Node/work-package/attempt-specific context is not another rules layer.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md,
  ContractName:AGENTS.md'
```

### ARC-009 - Single Rules Pipeline API

```yaml
plan_unit_id: ARC-009
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'Feeding rules into every agent uses one rules pipeline API such as get_agent_rules_context(application_config,
  project_path: Option<&Path>) -> String to return one formatted Application rules plus Project rules block; Orchestrator,
  Interview, and Assistant all call it with their project context and avoid copy-pasting Context7 or DRY into multiple prompt
  builders.'
gui_related: false
gui_classification_reason: This unit covers prompt assembly API and callers, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: single_rules_pipeline_api
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: single_rules_pipeline_api
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0011
preserved_exact_tokens:
- Feeding Rules Into Every Agent
- Single Rules Pipeline (DRY)
- 'get_agent_rules_context(application_config, project_path: Option<&Path>) -> String'
- Application rules
- Project rules
- Orchestrator
- Interview
- Assistant
- Context7
- DRY
negative_constraints:
- Rule content must not be copied into multiple prompt builders.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules'
- 'ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Prompt_Pipeline.md'
```

### ARC-010 - Deterministic Prepend Injection

```yaml
plan_unit_id: ARC-010
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'Rules injection location is deterministic: prepend the combined rules block to the main user prompt for every
  agent invocation, with AutoDecision Prepend-only and no reliance on platform-specific system-prompt flags.'
gui_related: false
gui_classification_reason: This unit covers deterministic prompt injection, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: deterministic_prepend_injection
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: deterministic_prepend_injection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0012
preserved_exact_tokens:
- Where in the Prompt
- Injection location (deterministic)
- Prepend the combined rules block
- main (user) prompt
- 'AutoDecision: Prepend-only; do not rely on platform-specific system-prompt flags.'
negative_constraints:
- Do not rely on platform-specific system-prompt flags.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§2, Primitive:DRYRules'
```

### ARC-011 - Instructions Editor Reconciliation

```yaml
plan_unit_id: ARC-011
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'Configuration and GUI preserves the in-app instructions editor requirements: the editor writes the same runtime-consumed
  project rules and instruction files, shows canonical path and scope, keeps project rules at .puppet-master/project-rules.md
  unless explicitly updated, must not create a shadow instruction source unread by the rules pipeline, and shows save, validation,
  lint, and dirty-state feedback while exposing Application rules and Project rules surfaces.'
gui_related: true
gui_classification_reason: This unit covers in-app editor UI, settings panels, tooltips, validation, lint, and dirty-state
  feedback.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instructions_editor_reconciliation
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: instructions_editor_reconciliation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0014
preserved_exact_tokens:
- Configuration and GUI (Planning Only)
- In-app instructions editor reconciliation
- canonical path and scope
- .puppet-master/project-rules.md
- shadow instruction source
- save, validation, lint, and dirty-state feedback
- Application rules
- Project rules
- Settings or Config
- Tooltip
- Project settings
- Project rules tab/panel
negative_constraints:
- The editor must not create a shadow instruction source that the rules pipeline does not read.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The GUI editor must write the same storage consumed by the runtime rules pipeline.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md'
```

### ARC-012 - Rule Layer Summary Table

```yaml
plan_unit_id: ARC-012
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'The Summary Table preserves the two layers: Application scope is every agent everywhere, stored in redb settings
  namespace key app.agent_rules.application_markdown, and fed to every orchestrator, interview, and Assistant invocation;
  Project scope is every agent on that project, stored at .puppet-master/project-rules.md, and fed to every invocation with
  a current project.'
gui_related: false
gui_classification_reason: This unit covers tabular rules-layer summary, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rule_layer_summary_table
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: rule_layer_summary_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0015
preserved_exact_tokens:
- Summary Table
- Application
- Every agent, everywhere
- redb settings
- settings namespace key
- app.agent_rules.application_markdown
- Project
- .puppet-master/project-rules.md
- Every invocation that has a current project
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-013 - Non-GUI Implementation Hooks

```yaml
plan_unit_id: ARC-013
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Implementation hooks define storage for application and project rules and require a shared rules pipeline
  that loads application rules, optionally loads project rules when project_path is set, returns one formatted string, and
  is called by Orchestrator, Interview, and Assistant prompt builders.
gui_related: false
gui_classification_reason: This unit covers storage and backend prompt assembly hooks, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_gui_implementation_hooks
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: non_gui_implementation_hooks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0016
preserved_exact_tokens:
- Implementation Hooks (Planning Only)
- Define storage
- redb settings
- app.agent_rules.application_markdown
- <project_root>/.puppet-master/project-rules.md
- Rules pipeline
- get_agent_rules_context(app_config, project_path)
- Orchestrator
- Interview
- Assistant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/storage-plan.md'
```

### ARC-014 - Rules Settings GUI Hook

```yaml
plan_unit_id: ARC-014
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Implementation hooks require GUI exposure of Application rules and Project rules when a project is selected
  in Settings/Config, persisted and read through the same storage used by the rules pipeline.
gui_related: true
gui_classification_reason: This unit explicitly covers Settings/Config GUI controls for rules editing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rules_settings_gui_hook
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: rules_settings_gui_hook
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0016
preserved_exact_tokens:
- GUI
- Application rules
- Project rules
- project selected
- Settings/Config
- persist and read via the same storage
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.storage, ContractName:Plans/storage-plan.md'
```

### ARC-015 - Instruction Bundle Assembly

```yaml
plan_unit_id: ARC-015
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Instruction Bundle Integration preserves that durable rules remain user-editable source text while each agent
  invocation assembles Application rules, Project rules, and scoped AGENTS.md in that order; the rules pipeline emits rules
  content only, does not inject attempt journals, parent summaries, or assistant-only memory, and must not infer cache behavior
  from rule text or model-id heuristics.
gui_related: false
gui_classification_reason: This unit covers instruction assembly and provider/cache ownership boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: instruction_bundle_assembly
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: instruction_bundle_assembly
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0017
preserved_exact_tokens:
- Instruction Bundle Integration (Application + Project + Scoped `AGENTS.md`)
- Instruction Bundle order
- Application rules
- Project rules
- Scoped `AGENTS.md`
- Assistant memory
- Attempt Journal
- Parent Summary
- MUST NOT masquerade as rules text
- copilot_cache_control
- Anthropic-like cache-marker eligibility
- closest scope wins
- deduplicated deterministically
- context.fileName
- Gemini
negative_constraints:
- Assistant memory, Attempt Journal, and Parent Summary are separate memory/context injectors and MUST NOT masquerade as rules
  text.
- The rules pipeline must not infer cache behavior from rule text or model-id heuristics.
compatibility_only_notes:
- The durable rules pipeline remains the user-editable source of rules text, while every invocation assembles a deterministic
  Instruction Bundle instead of relying on legacy injector naming.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#InstructionBundleAssembly, ContractName:Plans/assistant-memory-subsystem.md,
  ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md'
```

### ARC-016 - Feature Spec Runtime Purpose

```yaml
plan_unit_id: ARC-016
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: The verbatim feature spec purpose defines deterministic, low-bloat context management for Puppet Master node-graph
  runtime over run/work-package -> node -> attempt and is a product requirement for the finished application, not a description
  of the current repo layout.
gui_related: true
gui_classification_reason: The source span is marked GUI-related in the migration map and anchors later product GUI/context-injection
  requirements.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: feature_spec_runtime_purpose
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: feature_spec_runtime_purpose
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0018
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0019
preserved_exact_tokens:
- FeatureSpecVerbatim
- Feature Spec (Verbatim)
- Purpose
- deterministic, low-bloat context management
- run/work-package -> node -> attempt
- product requirement
- not a description of the current repo layout
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-017 - Context Goals And Defaults

```yaml
plan_unit_id: ARC-017
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: The context-management goals preserve fresh context per attempt with durable learning, deterministic bundle
  assembly that minimizes token waste, short relevant scoped AGENTS.md, default ON Parent Summary, default ON scoped AGENTS.md
  beyond top-level, default ON Attempt Journal, and controlled promotion of stable learnings into the nearest appropriate
  AGENTS.md.
gui_related: false
gui_classification_reason: This unit covers context-management goals and defaults, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_goals_and_defaults
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: context_goals_and_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0020
preserved_exact_tokens:
- Goals
- Fresh context per attempt with durable learning.
- Deterministic bundle assembly
- Scoped instructions (`AGENTS.md`)
- Parent Summary (default ON)
- Scoped `AGENTS.md` beyond top-level (default ON)
- Attempt Journal (default ON)
- Controlled promotion
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-018 - Durable Instruction Files

```yaml
plan_unit_id: ARC-018
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'Artifact Types define AGENTS.md as a durable instruction file that applies to the subtree rooted at the containing
  directory and follows the lightness rule: short invariants, constraints, and non-obvious conventions only.'
gui_related: false
gui_classification_reason: This unit covers durable instruction file semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: durable_instruction_files
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: durable_instruction_files
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0022
preserved_exact_tokens:
- Artifact Types (SSOT Definitions)
- A) Instruction Files (Durable)
- AGENTS.md
- Scope
- subtree rooted at the directory containing it
- Lightness rule
- short invariants, constraints, and non-obvious conventions only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-019 - Attempt Journal Contract

```yaml
plan_unit_id: ARC-019
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Attempt Journal is an ephemeral per-node-attempt artifact named attempt_journal.md or structured equivalent,
  stored in PM sidecar state for the relevant node scope, used to prevent repeated failed attempts, and only the most recent
  journal for the same node lineage is injected into the next attempt when enabled.
gui_related: false
gui_classification_reason: This unit covers attempt memory artifact semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: attempt_journal_contract
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: attempt_journal_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0023
preserved_exact_tokens:
- B) Attempt Journal (Ephemeral, per node attempt)
- attempt_journal.md
- structured equivalent
- PM sidecar state
- prevent repeated failed attempts
- most recent journal
- same node lineage
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-020 - Parent Summary Contract

```yaml
plan_unit_id: ARC-020
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Parent Summary is an ephemeral per-handoff artifact named parent_summary.md with a 5-10 line hard cap and
  is injected into attempt context when enabled.
gui_related: false
gui_classification_reason: This unit covers parent summary artifact semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: parent_summary_contract
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: parent_summary_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0024
preserved_exact_tokens:
- C) Parent Summary (Ephemeral, per handoff)
- parent_summary.md
- 5–10 lines hard cap
- injected into attempt context when enabled
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-021 - Promotion Contract

```yaml
plan_unit_id: ARC-021
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: 'Promotion is controlled and optional: stable, reusable learnings move into the nearest appropriate AGENTS.md
  only when the learning is non-obvious, stable, and scope-relevant.'
gui_related: false
gui_classification_reason: This unit covers promotion policy, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: promotion_contract
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: promotion_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0025
preserved_exact_tokens:
- D) Promotion (Controlled, optional)
- stable, reusable learnings
- nearest appropriate `AGENTS.md`
- non-obvious
- stable
- scope-relevant
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-022 - Deterministic Bundle Cone

```yaml
plan_unit_id: ARC-022
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Context Assembly Semantics require Puppet Master to construct explicit Instruction Bundle, Work Bundle, and
  Memory Bundle for each agent run; Instruction Bundle includes top-level and scoped AGENTS.md with closest-scope precedence
  and deterministic deduplication; Work Bundle contains only current node/attempt objective, acceptance criteria, inputs,
  allowed tools, and explicit constraints; Memory Bundle injects bounded Attempt Journal and/or Parent Summary only when enabled
  and keeps Assistant-only memory out of unrelated runs.
gui_related: false
gui_classification_reason: This unit covers runtime context assembly and bundle semantics, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: deterministic_bundle_cone
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: deterministic_bundle_cone
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0028
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0029
preserved_exact_tokens:
- Context Assembly Semantics (Deterministic Cone)
- Instruction Bundle
- Work Bundle
- Memory Bundle
- top-level `AGENTS.md`
- closest-scope precedence
- deterministic deduplication
- objective
- acceptance criteria
- inputs
- allowed tools
- explicit constraints
- Assistant-only memory remains Assistant-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-023 - Visibility Rules

```yaml
plan_unit_id: ARC-023
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Visibility Rules preserve that coordinating runs/packages see coordinating objectives and summaries, node
  execution sees the current node objective, scoped instruction chain, and node-relevant memory only, delegated child attempts
  inherit the same Instruction Bundle ordering plus child-specific Work/Memory Bundles, and verification/review attempts use
  the same assembly semantics without reintroducing deprecated execution-hierarchy vocabulary.
gui_related: false
gui_classification_reason: This unit covers runtime visibility and assembly boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visibility_rules
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: visibility_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0030
preserved_exact_tokens:
- Visibility Rules
- coordinating runs/packages
- coordinating objectives and summaries
- node execution
- delegated child attempts
- same Instruction Bundle ordering
- verification/review attempts
- deprecated execution-hierarchy vocabulary
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- Verification/review attempts use the same assembly semantics; they do not reintroduce deprecated execution-hierarchy vocabulary.
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/DRY_Rules.md'
```

### ARC-024 - Coordinating Visibility Examples

```yaml
plan_unit_id: ARC-024
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Visibility examples preserve that coordinating runs and work-package coordinators see application/project
  rules plus scoped instruction chain, run/work-package objectives and acceptance criteria, and bounded coordination/package
  summaries rather than every child attempt journal or unrelated node-attempt journals by default.
gui_related: false
gui_classification_reason: This unit covers examples for coordination visibility, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: coordinating_visibility_examples
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: coordinating_visibility_examples
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0031
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0033
preserved_exact_tokens:
- Visibility examples (coordinating run → work package → node → attempt)
- Coordinating run sees
- Work-package coordinator sees
- application/project rules
- scoped instruction chain
- run and work-package objectives / acceptance criteria
- not every child attempt journal by default
- not unrelated node-attempt journals
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-025 - Node And Attempt Visibility Examples

```yaml
plan_unit_id: ARC-025
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Node and attempt visibility examples preserve that node execution sees top-level plus applicable scoped instruction
  chain, node objectives and acceptance criteria, and node-relevant memory only; attempt execution sees the same applicable
  instruction chain, exact attempt objective plus acceptance criteria, latest attempt journal and parent summary when enabled,
  and excludes unrelated branches, long histories, and parent full reasoning by default.
gui_related: false
gui_classification_reason: This unit covers examples for node/attempt context visibility, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: node_and_attempt_visibility_examples
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: node_and_attempt_visibility_examples
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0035
preserved_exact_tokens:
- Node execution sees
- Attempt execution sees
- node objectives / acceptance criteria
- node-relevant memory only
- this attempt's exact objective + acceptance criteria
- latest attempt journal
- parent summary
- Excludes
- unrelated branches
- long histories
- parent full reasoning by default
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-026 - Sidecar Workspace Storage

```yaml
plan_unit_id: ARC-026
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Workspace and Storage behavior stores artifacts in a sidecar workspace by default to avoid polluting user
  repos, support lifecycle management and truncation rules, and recommends .puppet-master/workspace/<project>/<run>/<node>/
  containing AGENTS.md, parent_summary.md, attempt_journal.md, and attempt/run artifacts.
gui_related: false
gui_classification_reason: This unit covers project-facing storage behavior, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: sidecar_workspace_storage
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: sidecar_workspace_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0036
preserved_exact_tokens:
- Workspace & Storage (User-Project Facing Product Behavior)
- sidecar workspace
- prevents polluting user repos
- lifecycle management
- truncation rules
- .puppet-master/workspace/<project>/<run>/<node>/
- AGENTS.md
- parent_summary.md
- attempt_journal.md
- attempt/run artifacts
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-027 - Context Injection GUI

```yaml
plan_unit_id: ARC-027
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: GUI Requirements add Context Injection settings per project with optional per-run override for Parent Summary,
  Scoped AGENTS.md beyond top-level, and Attempt Journal defaults ON; the GUI must show Injected Context breakdown with AGENTS.md
  paths and byte counts, summary/journal inclusion byte counts, truncation occurrence and reason, and each instruction/rules
  target has exactly one control mode PM Controlled or Manual Override with refresh rules for returning to PM Controlled.
gui_related: true
gui_classification_reason: This unit directly covers Context Injection settings, toggles, injected-context breakdown, control
  modes, and truncation UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_injection_gui
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: context_injection_gui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0037
preserved_exact_tokens:
- GUI Requirements (Product)
- Context Injection
- per project
- override per run optional
- Parent Summary — default ON
- Scoped AGENTS.md (beyond top-level) — default ON
- Attempt Journal — default ON
- Injected Context
- paths + byte counts
- truncation occurred (and why)
- PM Controlled
- Manual Override
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Each instruction/rules target has exactly one control mode and PM Controlled targets regenerate only from saved canonical
  instruction source.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-028 - AGENTS.md Authoring Lint

```yaml
plan_unit_id: ARC-028
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: AGENTS.md Light Enforcement requires authoring-time lint when users edit AGENTS.md in Puppet Master, warning
  or erroring on directory trees, long command encyclopedias, architecture tours, redundant discoverable info, and enforcing
  budgets such as max bytes, max lines, and max headings.
gui_related: false
gui_classification_reason: This unit covers lint policy and content budgets, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agents_md_authoring_lint
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: agents_md_authoring_lint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0038
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0039
preserved_exact_tokens:
- AGENTS.md Light Enforcement (Product)
- Authoring-time lint
- directory trees
- long command encyclopedias
- architecture tours
- redundant discoverable info
- max bytes
- 6–10KB
- max lines
- '80'
- max headings
- '6'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-029 - Runtime Instruction Budget

```yaml
plan_unit_id: ARC-029
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Runtime budget enforcement computes total instruction bytes and estimated tokens before a run, warns on threshold
  exceedance, can block runs in strict mode until reduced, never truncates Work Bundle acceptance criteria, truncates examples/illustrative
  sections first, and uses deterministic truncation policy.
gui_related: false
gui_classification_reason: This unit covers runtime budget calculation and non-GUI truncation policy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_instruction_budget
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: runtime_instruction_budget
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0040
preserved_exact_tokens:
- Runtime budget enforcement
- compute total instruction bytes + estimated tokens
- warn on threshold exceed
- strict mode enabled
- block run until reduced
- deterministic truncation policy
- never truncate Work Bundle acceptance criteria
- truncate “examples/illustrative” sections first
negative_constraints:
- Work Bundle acceptance criteria must never be truncated.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-030 - Truncation Recording

```yaml
plan_unit_id: ARC-030
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Runtime budget enforcement records truncation in run metadata and UI whenever deterministic truncation occurs.
gui_related: true
gui_classification_reason: This unit covers user-visible truncation reporting in run metadata and UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: truncation_recording
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: truncation_recording
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0040
preserved_exact_tokens:
- record truncation in run metadata and UI
- truncation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Truncation reporting must be visible to the user.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-031 - Context Assembly Acceptance

```yaml
plan_unit_id: ARC-031
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Acceptance criteria require scoped AGENTS.md inclusion/exclusion according to the scoped toggle, attempt N+1
  to include only the most recent same-lineage attempt_journal when enabled, Parent Summary toggle and 10-line cap behavior,
  and promotion to require replacement/condense when AGENTS.md budget would be exceeded.
gui_related: false
gui_classification_reason: This unit covers testable runtime acceptance, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: context_assembly_acceptance
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: context_assembly_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0041
preserved_exact_tokens:
- Acceptance Criteria (Testable)
- scoped AGENTS enabled
- scoped AGENTS disabled
- attempt N+1
- most recent attempt_journal
- same node lineage
- Parent summary injection
- 10 lines
- Promotion never grows AGENTS.md beyond budget
- replacement/condense
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-032 - GUI Acceptance

```yaml
plan_unit_id: ARC-032
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Acceptance criteria require the GUI to expose the three toggles with correct defaults and display injected
  context breakdown including truncation.
gui_related: true
gui_classification_reason: This unit directly covers GUI toggles and injected-context display.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_acceptance
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: gui_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0041
preserved_exact_tokens:
- GUI exposes the three toggles
- correct defaults
- displays injected context breakdown including truncation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-033 - Lint Acceptance

```yaml
plan_unit_id: ARC-033
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Acceptance criteria require AGENTS.md lint to flag wiki-content patterns and budget violations, with strict
  mode able to block runs.
gui_related: false
gui_classification_reason: This unit covers lint acceptance and strict-mode blocking, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: lint_acceptance
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: lint_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0041
preserved_exact_tokens:
- AGENTS.md lint
- wiki-content patterns
- budget violations
- strict mode can block runs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-034 - Route-Aware Context

```yaml
plan_unit_id: ARC-034
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Route Context and Attention Destination Rules preserve resume_url as the precedent for precise recovery routes,
  generalize internal payload routes to Orchestrator, Chat, Source Control, GitHub, Usage, or Settings, keep concern-specific
  future record/action docs out of instruction-rule sources, and require historical /current run switching not to change project-level
  layout identity.
gui_related: true
gui_classification_reason: This unit covers user-visible attention destinations, Chat/Source Control/GitHub/Usage/Settings
  routes, and layout identity.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_aware_context
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: route_aware_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0042
preserved_exact_tokens:
- Route Context and Attention Destination Rules
- resume_url
- deep link
- Orchestrator
- Chat
- Source Control
- GitHub
- Usage
- Settings
- controlled coarse destination enum/family
- concern-specific future record/action docs
- /action
- /current
- must not change layout identity
- project-level rather than run-level
negative_constraints:
- Historical /current run switching must not change layout identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The route contract layer owns the controlled coarse destination enum/family.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs: []
```

### ARC-035 - Owner Consumer Boundary

```yaml
plan_unit_id: ARC-035
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: The Owner / Consumer Map preserves that source-preserving standardization keeps original owner and consumer
  boundaries, Plans/agent-rules-context.md remains owner for the behavior described by its preserved sections, and cross-doc
  ownership follows ContractRefs and boundary notes already present in the source text.
gui_related: false
gui_classification_reason: This unit records standardization owner/consumer boundaries, not GUI behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered rules-context fact is represented by a fine-grained PlanUnit instead of only the residual source-preserving
  bridge.
- Plans/agent-rules-context.md remains the owner for application/project rules context while referenced owners retain their
  own contracts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_consumer_boundary
reasoning_tier: standard
context_scope: agent_rules_context_standardization
implementation_surfaces:
- Plans/agent-rules-context.md
node_compile_hint:
  mode: owner_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:agent-rules-context-S0043
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/agent-rules-context.md
- ContractRefs
- boundary notes
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/agent-rules-context.md remains the owner doc for preserved rules-context behavior while cross-doc ownership follows
  ContractRefs and boundary notes.
owner_hints:
- Plans/agent-rules-context.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
```


## Migration Coverage

Original hash: `7815be0dff378aa826fab1ec2295a7c1e1f87c5580142922ed5b3c64a58698de`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batches 113 and 114 atomized source spans `agent-rules-context-S0001` through `agent-rules-context-S0043` into fine-grained PlanUnits `ARC-002` through `ARC-035`, except for structural and migration-lineage dispositions. `agent-rules-context-S0044` is the PlanUnits heading, `agent-rules-context-S0045` is the retired `ARC-001` bridge disposition, and `agent-rules-context-S0046` is Migration Coverage metadata. `ARC-001` is retired to migration-lineage compatibility only and no longer uses `source_preserving_planunit` compile mode. These batches did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and they did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Agent Rules Context owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### ARC-036 - Application-Level Default DRY Guard

```yaml
plan_unit_id: ARC-036
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: >-
  PM applies the DRY Method as an application-level default guard through the shared rules pipeline and Instruction
  Bundle. The setting key is `app.agent_rules.dry_method_default_guard`, stored as enabled or disabled_by_user, with
  enabled as the default. Disabling it turns off only the default DRY guard and DRY-specific caveat/block behavior;
  explicit user/project instructions, safety, secrets, source authority, governance phase boundaries, permissions,
  and source-control hygiene remain active.
gui_related: false
gui_classification_reason: Defines application rules behavior and default guard semantics rather than visual presentation.
depends_on: []
unblocks: [PP-057, DR-036, DP-063, CV-299, F3-406, ATS-018]
acceptance_criteria:
  - DRY Method is default-on unless the user explicitly disables the default guard.
  - The disable path cannot bypass non-DRY authority boundaries.
  - The rule is injected through the shared Instruction Bundle route, not copied into local prompt builders.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method rules-context fixtures
risk_class: dry_method_default_guard_drift
reasoning_tier: high
context_scope: dry_method_agent_rules_context
implementation_surfaces:
  - Plans/agent-rules-context.md
  - future application rules pipeline
node_compile_hint:
  mode: dry_method_application_default_guard
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-004
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0054, atom-0073, atom-0083]
decision_refs: [dec-0016]
preserved_exact_tokens:
  - "DRY Method"
  - "default"
  - "the user can turn it off"
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "Instruction Bundle"
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not make DRY impossible to disable.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not create shadow instruction sources.
owner_hints:
  - Plans/agent-rules-context.md
  - Plans/Prompt_Pipeline.md
  - Plans/DRY_Rules.md
```
