# Chain Wizard & Interview Flexibility -- Intent-Based Workflows


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Change Summary

- 2026-02-25: Hardened §12 cross-doc contract consistency with `Plans/Project_Output_Artifacts.md §10.2`: normalized pass report field names and enums (`pass_name`, `pass_verdict`, `verdict_reason`, `findings[]`, `unresolved_findings[]`), replaced legacy wording (`pass_report`, `verdict`, `violations[]`, singular `unresolved_finding`), and clarified provider/model-to-report linkage.
- 2026-02-25: Added §13 No-Wizard Project Management Flows — three project entry points (Add Existing, Create New Local, Create New GitHub Repo) with "Run Chain Wizard later" affordance; full spec in Plans/GitHub_Integration.md §D.
- 2026-06-18: Retired fixed Pass 1 / Pass 2 / Pass 3 validation provider/model settings and active process stages. The mandatory invariant sweep is now an Auditor audit-to-repair loop that repeats audit, bounded repair, and re-audit until certification or a critical block/authority boundary. Legacy pass names and `validation_pass_report` fields remain compatibility aliases only.
- 2026-02-25: Added §12 Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep): always-on, headless, post-Contract-Unification-Pass pipeline (Pass 1: Document Creation; Pass 2: Docs + Canonical Alignment; Pass 3: Canonical Systems Only). Separate from optional §5.6 Multi-Pass Review. This historical fixed-pass model was superseded by the 2026-06-18 Auditor validation loop repair; pass reports are compatibility lineage, and active behavior is the Auditor loop.
- 2026-02-24: Clarified OpenCode GUI contract coverage: provider enable/disable, connection method selection (direct server URL/port or CLI launcher/discovery fallback path), OpenCode auth/sign-in actions, and provider-contract model selection.
- 2026-02-24: Added OpenCode as a server-bridged provider in provider selection UX; referenced Plans/Provider_OpenCode.md.
- 2026-02-24: Added conditional UI wiring artifacts (`ui/wiring_matrix.json`, `ui/ui_command_catalog.json`) to the Project Contract Pack when the user project includes a GUI; updated per-phase contract fragments (§6.6.1 Product/UX), Contract Unification Pass (§6.6.2), validation (§6.6.3), and user-project output artifacts (§11). Schema: `Plans/Wiring_Matrix.schema.json`, rules: `Plans/UI_Wiring_Rules.md`.
- 2026-02-24: Updated user-project **Project Contract Pack + executable artifacts** under `.puppet-master/project/**` to make the plan graph **sharded-only and canonical** (`.puppet-master/project/plan_graph/`); removed any requirement that `.puppet-master/project/plan_graph.json` is required/canonical; monolithic export path (if materialized) is now `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json`; explicitly no user-project `Plans/` assumption.
- 2026-02-23: Added Contract Layer handoff section near Requirements Doc Builder/Interview describing Platform vs Project contracts, contract seeds, contract unification, and DRY contract-ID references (SSOT: `Plans/Project_Output_Artifacts.md`).
- 2026-02-23: Updated Requirements Doc Builder and its Multi-Pass Review to generate and review Contract Layer seed content (assumptions, constraints, glossary, non-functional budgets) alongside `requirements.md`.
- 2026-02-23: Updated Adaptive Interview Phases to require per-phase contract fragments plus a deterministic Contract Unification Pass at interview completion to produce the Project Contract Pack, sharded plan graph, and acceptance manifest.
- 2026-02-23: Added explicit dry-run validator acceptance requirements for contract-ref resolvability and acceptance-manifest coverage (SSOT: `Plans/Project_Output_Artifacts.md` Validation Rules).
- 2026-02-23: Added user-project artifact contract section requiring `.puppet-master/project/...` outputs, sharded plan graph defaults, and mandatory `plan.md`.
- 2026-02-23: Updated requirements semantics so `.puppet-master/requirements/*` remains staging while canonical downstream requirements are promoted to `.puppet-master/project/requirements.md`.
- 2026-02-23: Added relationship-table cross-reference to `Plans/Project_Output_Artifacts.md` and expanded implementation checklist with shard/index/node/seglog determinism requirements.
- 2026-02-23: Replaced prohibited platform alias text with Puppet Master naming.
- 2026-02-23: Updated artifact list and node shard contract to include `contracts/index.json`, optional `glossary.md`, execution evidence outputs, and `tool_policy_mode` + stable `ProjectContract:*` references (per `Plans/Project_Output_Artifacts.md`).

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document contains:

- Historical intent-based workflow definitions retained for source-lineage compatibility.
- Historical GUI and flow examples that current PRD Builder, Planning Wizard, Final GUI, GitHub, and source-control owner docs may consume after revalidation.
- Legacy Requirements Doc Builder, Interview, and multiple requirements upload material retained as compatibility lineage for PRD Builder and Planning Wizard owner docs.
- Historical adaptive interview, project setup, GitHub, fork, and PR-flow material retained as consumer/source-lineage inputs.
- Gaps, risks, and cross-references preserved for migration audit rather than direct current implementation authority.

## Rewrite alignment (2026-02-21)

This plan's workflow semantics are retained as historical/source-lineage compatibility. Current PRD intake and planning authority routes through `Plans/PRD_Builder.md`, `Plans/Planning_Wizard.md`, `Plans/FinalGUISpec.md`, and downstream PlanCompile/Executor owner docs before implementation:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow

## SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json` (GitHub HTTPS API-only operations)
- Canonical contracts: `Plans/Contracts_V0.md`
- Ownership boundaries (primitives): `Plans/Crosswalk.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic defaults: `Plans/Decision_Policy.md`
- GitHub auth + API flows: `Plans/GitHub_API_Auth_and_Flows.md`
- User-project output artifacts: `Plans/Project_Output_Artifacts.md` (under `.puppet-master/project/*`)
- OpenCode provider integration: `Plans/Provider_OpenCode.md`
- Wizard/interview flows consume runtime `budget-outcome` names and usage snapshot fields only after `Plans/Contracts_V0.md` confirms the `/schema` surface stays stable across `Plans/Run_Modes.md`, `Plans/usage-feature.md`, and `Plans/orchestrator-subagent-integration.md`; this document must not mint a fresh event/schema delta for those outcomes.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, PolicyRule:Decision_Policy.md§1

## Executive Summary

This legacy Chain Wizard and Interview flow assumed a single path: **start a new project** (with an optional "existing project" toggle). Its still-valid source-lineage material informs current PRD Builder intake, Planning Wizard planning, GitHub/source-control setup, and Final GUI routing only after those current owner docs accept the behavior. The current active UX is PRD Builder intake, dynamic PlanningRun topics, live topic/plan projections, audits/final integration, Approve And Build, and Orchestrator Plan Compile.

**Scope:**

- **§1-§2:** Intent-based workflows and how they affect the flow.
- **§3:** GUI updates: intent selection, requirements step redesign, project setup.
- **§4:** Requirements: multiple uploads, merge/canonical input, storage.
- **§5:** Requirements Doc Builder: Assistant chat generates requirements and hands off to Interview; **§5.6** Multi-Pass Review (optional review agent + N subagents, user approves revised doc).
- **§6:** Adaptive interview phases: AI selects and weights phases by intent and context.
- **§7:** Project setup and GitHub: create repo (name + fields); fork (offer to create or user does it); PR flow (start and finish).
- **§8:** Relationship to other plans.
- **§9:** Gaps and potential problems (each with a concrete **Resolution**).
- **§10:** Implementation Readiness Checklist (concrete items for an implementation plan).
- **§11:** User-project output artifacts (sharded-only canonical graph).
- **Change Summary:** Update record for sharded user-project output contracts.

**DRY:** Reuse `platform_specs`, `docs/gui-widget-catalog.md`, rules pipeline (agent-rules-context.md), git/worktree (WorktreeGitImprovement.md, MiscPlan), subagent registry (orchestrator/interview plans), and Assistant/Interview UI patterns (assistant-chat-design.md, interview-subagent-integration.md).

## Table of Contents

1. [Intent-Based Workflows](#1-intent-based-workflows)
2. [How Intent Affects the Flow](#2-how-intent-affects-the-flow)
3. [GUI Updates](#3-gui-updates)
4. [Requirements: Multiple Uploads and Storage](#4-requirements-multiple-uploads-and-storage)
5. [Requirements Doc Builder (Assistant → Interview Handoff)](#5-requirements-doc-builder-assistant--interview-handoff) (includes [5.6 Multi-Pass Review](#56-multi-pass-review-requirements-doc))
6. [Adaptive Interview Phases](#6-adaptive-interview-phases)
7. [Project Setup and GitHub: Create Repo, Fork, PR](#7-project-setup-and-github-create-repo-fork-pr)
8. [Relationship to Other Plans](#8-relationship-to-other-plans)
9. [Gaps and Potential Problems](#9-gaps-and-potential-problems)
10. [Implementation Readiness Checklist](#10-implementation-readiness-checklist)
11. [User-Project Output Artifacts (Sharded-Only)](#11-user-project-output-artifacts-sharded-only)
12. [Auditor Invariant Loop (Mandatory Invariant Sweep)](#12-auditor-invariant-loop-mandatory-invariant-sweep)
13. [No-Wizard Project Management Flows](#13-no-wizard-project-management-flows)
14. [Requirements Completion Contract](#14-requirements-completion-contract)
15. [Requirements Quality Escalation Semantics](#15-requirements-quality-escalation-semantics)
16. [Change Summary](#change-summary)

---

## 1. Intent-Based Workflows

The wizard and Interview must support **four distinct intents**. Each intent changes what we ask for, how deep the Interview goes, and how we frame PRD/plan (full product vs. delta vs. feature scope).

### 1.1 New Project (greenfield)

- **User goal:** Start a new product or codebase from scratch.
- **Entry:** User selects "New project" (or equivalent). Project path may be empty or a new directory we will initialize.
- **Requirements:** User provides one or more requirements documents (upload and/or Requirements Doc Builder). No "existing codebase" context beyond optional reference docs.
- **Interview:** Full product interview (all phases available); AI may still shorten or deepen phases based on scope signals.
- **Outcome:** New repo (we may create it on GitHub), full PRD and plan, then execution.

### 1.2 Fork & Evolve

- **User goal:** Fork an existing repo and evolve it (add features, change direction, maintain a derivative). Not "start new" and not "continue the same project"--it's a **derivative**.
- **Entry:** User selects "Fork & evolve." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user (via GitHub HTTPS API; see `Plans/GitHub_API_Auth_and_Flows.md`), or the user can create the fork themselves and point us at the fork path or URL.
- **Requirements:** User provides requirements that describe **what to add or change** in the fork (delta). Can be upload(s) and/or Requirements Doc Builder framed as "what are we changing/adding?"
- **Interview:** Interview is framed as **delta/evolution**: "What are you adding or changing in this fork?" Phase set can be reduced (e.g. skip or shorten Deployment if no infra change) or deepened (e.g. Architecture if major refactor). AI decides.
- **Outcome:** Fork (created by us or user), PRD/plan as **delta** over upstream, then execution on the fork.

### 1.3 Enhance / Rewrite / Add (existing project, new to Puppet Master)

- **User goal:** The project already exists; Puppet Master has never seen it. User wants to **enhance** it, **rewrite** parts, or **add** to it.
- **Entry:** User selects "Enhance/rewrite/add" and supplies **project path** (existing clone or directory). No fork required unless they later choose to contribute upstream.
- **Requirements:** User provides requirements describing the **scope of change** (what to enhance, rewrite, or add). Can be upload(s) and/or Requirements Doc Builder.
- **Interview:** Same delta framing as Fork & evolve: "What are we changing/adding?" Interview phases adapt (e.g. double down on Architecture for rewrite, skip Deployment if unchanged). Existing codebase is scanned (current codebase_scanner) to seed context.
- **Outcome:** PRD/plan as delta; execution in the existing project directory.

### 1.4 Contribute (PR)

- **User goal:** Add a feature (or fix) to someone else's project and open a **Pull Request**. First-time PR contributors may not know the steps; we guide them.
- **Entry:** User selects "Contribute (PR)." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user, or they can create it themselves and point us at their fork.
- **Requirements:** Lightweight: feature/fix scope and acceptance criteria. Can be a short doc upload or a quick Requirements Doc Builder session ("I want to add X; acceptance: Y").
- **Interview:** **Lighter** than full product or delta: focus on feature scope, acceptance criteria, and compatibility with upstream (e.g. style, tests). Many phases skipped or collapsed; AI decides.
- **Outcome:** Fork (if we created it or user did), **feature branch** created by us or user, work done on that branch, then we **offer to commit, push, and open the PR** (or user does it themselves). Optional in-app or linked help: "What's a PR?" (fork → branch → push → open PR).

### 1.5 Summary Table

| Intent              | Upstream/fork?     | Requirements framing     | Interview depth   | Outcome              |
|---------------------|--------------------|--------------------------|-------------------|----------------------|
| New project         | N/A (or create)   | Full product             | Full (adaptive)   | New repo, full PRD   |
| Fork & evolve       | Fork (offer/create)| Delta (add/change)       | Delta (adaptive)  | Fork, delta PRD      |
| Enhance/rewrite/add | N/A (existing dir)| Delta (scope of change)  | Delta (adaptive)  | Same dir, delta PRD  |
| Contribute (PR)     | Fork (offer/create)| Feature/fix scope       | Light (adaptive)  | Fork, branch, PR     |

---

## 2. How Intent Affects the Flow

- **Intent selection** happens at flow start (Dashboard or first wizard step). It drives:
  - Which **project setup** questions we ask (e.g. "upstream URL" for Fork/PR, "project path" for Enhance, "new directory" for New).
  - Whether we **offer to create a fork** and/or **create a repo** (GitHub).
  - What **requirements prompt** we show ("Full product," "What are you adding/changing?" or "Feature/fix scope").
  - How the **Interview** is configured (phase set and depth) and how **PRD/plan** are framed (full vs. delta vs. feature).
- **State:** Store the selected intent in app state (and optionally in `.puppet-master/` for recovery). All downstream steps (Interview, start chain, orchestrator) receive intent so they can adapt.

### 2.1 Wizard State Shape

Thread lifecycle references in this wizard/Interview plan use the canonical thread states `active`, `attention_required`, `blocked`, `completed`, and `failed`; permanent thread removal is a `delete` action with confirmation, and `archive` is not a thread lifecycle state.


### 2.2 Canonical wizard runtime state

The app must hold a single, explicit **wizard state** that drives project setup, requirements, and downstream Interview/start chain. The struct below captures the core form/state fields; the normative runtime fields table that follows is also required.

**Rust struct (reference; implementation may use equivalent in app state):**

```rust
/// Intent as selected at flow start.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum WizardIntent {
    NewProject,
    ForkAndEvolve,
    EnhanceRewriteAdd,
    ContributePr,
}

/// Full wizard state: project setup + requirements + fork/PR metadata.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ChainWizardState {
    // --- Intent and flow ---
    pub intent: Option<WizardIntent>,
    pub wizard_step: u32,  // 0 = project setup, 1 = requirements, 2 = interview, etc.

    // --- Project path (all intents) ---
    /// Working directory: new dir to create, or existing project path.
    pub project_path: Option<PathBuf>,

    // --- New project only ---
    /// If true, we will create a GitHub repo (name required).
    pub create_github_repo: bool,
    /// Repo name when create_github_repo is true.
    pub repo_name: Option<String>,
    /// Visibility: "public" | "private".
    pub repo_visibility: Option<String>,
    pub repo_description: Option<String>,
    pub repo_gitignore_template: Option<String>,
    pub repo_license: Option<String>,
    /// Default branch name for new repo (e.g. "main").
    pub repo_default_branch: Option<String>,

    // --- Fork & evolve / Contribute (PR) ---
    /// Upstream repo: URL or "owner/repo".
    pub upstream_url: Option<String>,
    /// If true, app created the fork via GitHub HTTPS API; else user provided fork.
    pub fork_created_by_app: bool,
    /// Clone URL or path of the fork after creation or user input.
    pub fork_url_or_path: Option<String>,

    // --- Contribute (PR) only: feature branch ---
    /// Feature branch name (e.g. feature/add-x). Work is done on this branch in the main clone.
    pub branch_name: Option<String>,

    // --- Requirements (all intents) ---
    /// Ordered list of uploaded file paths (under .puppet-master/requirements/uploaded/).
    pub uploaded_requirements_paths: Vec<PathBuf>,
    /// True if user has used Requirements Doc Builder and we have builder output.
    pub builder_used: bool,
    /// Single canonical path: merged result. Interview and start chain read only this.
    pub canonical_requirements_path: Option<PathBuf>,

    // --- Recovery / persistence ---
    /// Timestamp or session id for recovery correlation (optional).
    pub last_updated: Option<String>,
}
```

**JSON equivalent (for .puppet-master/ persistence and redb):**

```json
{
  "intent": "NewProject | ForkAndEvolve | EnhanceRewriteAdd | ContributePr",
  "wizard_step": 0,
  "project_path": "/absolute/or/relative/path",
  "create_github_repo": false,
  "repo_name": null,
  "repo_visibility": "public",
  "repo_description": null,
  "repo_gitignore_template": null,
  "repo_license": null,
  "repo_default_branch": "main",
  "upstream_url": null,
  "fork_created_by_app": false,
  "fork_url_or_path": null,
  "branch_name": null,
  "uploaded_requirements_paths": [],
  "builder_used": false,
  "canonical_requirements_path": null,
  "last_updated": "2026-02-22T12:00:00Z"
}
```

**Required runtime fields (normative, additive to the reference struct):**

| Field | Type | Purpose |
|---|---|---|
| `wizard_id` | string | Stable wizard instance ID used by recovery, Dashboard CtAs, and thread deep links. |
| `wizard_status` | enum | See canonical `wizard_status` definition below. |
| `launch_source` | enum | `dashboard | file_menu | assistant | no_wizard_add_existing | no_wizard_new_local | no_wizard_new_github`. |
| `phase_override_mode` | enum | `selector_plan | run_all | manual_checklist`. |
| `phase_plan_ref` | path/null | Canonical persisted phase-plan location used by resume and audit. |
| `has_gui` | bool/null | Interview-derived GUI flag that affects Product/UX coverage and downstream artifact generation. |
| `attention_required_report_path` | path/null | Latest blocking requirements-quality report when clarification is required. |
| `remote_repo_ref` | object/null | Credential-safe remote reference (`owner`, `repo`, `host`, `clone_transport`, `clone_url_redacted`) for GitHub/fork flows. |
| `deferred_wizard_payload_ref` | path/null | Preloaded payload created by no-wizard flows for `Run Chain Wizard later`. |

**Canonical `wizard_status` definition (normative):**

```text
wizard_status: enum {
  setup,              // wizard instance and project setup are being prepared
  requirements,       // requirements upload, Requirements Doc Builder, or canonical requirements merge is active
  interview,          // adaptive interview phase is active
  validating,         // Contract Unification and validation passes are running
  attention_required, // current clarification or review loop can still resolve the issue set
  blocked,            // automatic progress cannot continue without new input, recovery, or replan
  ready_to_execute,   // validated package is ready to launch execution
  complete,           // wizard finished successfully
  cancelled,          // user cancelled
}
```

The `wizard_status` enum is the wizard's own lifecycle. Builder bundle state, agent activity run state, and executor node status are separate state families and MUST NOT be conflated with `wizard_status`.

Canonical wizard step contracts are `PhaseSelectorContract`, `RequirementsGatheringContract`, `InterviewContract`, and `ValidationPassContract`. Implementations may store these as concrete structs or schema-backed payloads, but the lifecycle handoff must keep those contract families distinct.

For blocked wizard persistence, canonical fields use `wizard_status = blocked` with `blocked_reason_code`. Legacy blocked field names such as `is_blocked`, `blocked_info`, `blocked_state`, and `blocked_episode_ref` are non-canonical aliases and MUST NOT be introduced in new wizard state.

**Field usage by intent:**

| Field | New project | Fork & evolve | Enhance/rewrite/add | Contribute (PR) |
|-------|-------------|---------------|---------------------|-----------------|
| intent | ✓ | ✓ | ✓ | ✓ |
| wizard_step | ✓ | ✓ | ✓ | ✓ |
| project_path | ✓ (new or empty) | ✓ (fork clone path) | ✓ (existing dir) | ✓ (fork clone path) |
| create_github_repo, repo_* | ✓ if creating repo | -- | -- | -- |
| upstream_url | -- | ✓ | -- | ✓ |
| fork_created_by_app, fork_url_or_path | -- | ✓ | -- | ✓ |
| branch_name | -- | -- | -- | ✓ |
| uploaded_requirements_paths, builder_used, canonical_requirements_path | ✓ | ✓ | ✓ | ✓ |

**Where state is stored:**

- **App state (in memory / GUI state):** Full `ChainWizardState` so the wizard and downstream steps (Interview, start chain) can read and update it.
- **.puppet-master/ for recovery:** Persist the same shape under a single file, e.g. `.puppet-master/wizard-state.json` (or key in redb). On launch or restore, load this file so that after a crash or restart the user returns to the correct intent, step, project path, upstream, fork and branch info, and canonical requirements path. Recovery snapshot (newfeatures.md §4) should include or reference this state so that "current view and wizard step" restoration is consistent.

**Invariants:**

- `canonical_requirements_path` is set only after at least one of: uploads (merged) or Builder output (or both merged). For user-project execution, it points to `.puppet-master/project/requirements.md` after canonical promotion from staging (see §4 and §11).
- For Contribute (PR), `branch_name` is set when the user (or app) creates the feature branch; all work for that flow happens on that branch in the **main clone** (no node worktrees -- see §7).
- Secrets or credential-bearing GitHub URLs MUST NOT be persisted in wizard state; store redacted remote metadata + credential-store account refs only.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/GitHub_Integration.md

Wizard hands a single normalized payload to Builder handoff, Interview initialization, and start-chain kickoff.

Required fields:
- `wizard_id`
- `intent`
- `wizard_status`
- `launch_source`
- `project_path`
- `canonical_requirements_path`
- `remote_repo_ref` (when Git/GitHub is involved)
- `branch_name` (Contribute PR only)
- `phase_plan_ref` and `phase_override_mode`
- `has_gui` when already known
- `resume_checkpoint_ref` when resuming an interrupted run

Rules:
- Builder may read/write requirements-stage fields only; it must not mutate GitHub setup fields except via explicit wizard actions.
- Interview consumes the payload as read-mostly input and persists Interview-owned state separately.
- Start chain MUST read the post-validation canonical `.puppet-master/project/**` package, not wizard staging inputs.
- No-wizard flows populate the same payload shape via `deferred_wizard_payload_ref`; opening the wizard later must be reconstructible after restart.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/interview-subagent-integration.md, Primitive:SessionStore

ContractRef: Plans/Project_Output_Artifacts.md#POA-045, Plans/Project_Output_Artifacts.md#11.1 `traceability/requirements_quality_report.json` (machine-readable), Plans/Prompt_Pipeline.md#6.4 Effective resolution record

Required fields:
- workflow_run_id
- staged_bundle_ref
- requirements_quality_report_ref
- execution_role
- effective_account_id
- run_id

Canonical terms and values:
- auditor_cycle_report
- cycle_report_ref
- compatibility_only
- validation_pass_report (legacy mirror only)
- workflow_run_id
- staged_bundle_ref
- requirements_quality_report_ref
- execution_role
- effective_account_id
- run_id
- launch receipt
- promoted package ref

Labels:
- handoff contract

Behavioral rules:
- Accepted or final sweep output must bridge into launched execution through a launch receipt or promoted package ref.
- Pass reports must not masquerade as run, node, or attempt records.

Permission carry-through:
- effective runtime identity must survive downstream handoff
### 2.3 Wizard Cancellation Cleanup

When the wizard is cancelled (user clicks Cancel or closes the wizard), Puppet Master MUST execute the following cleanup sequence:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

1. All running subagents are terminated: send cancel signal, wait up to 5 seconds, then force kill any remaining processes.
2. All pending tool calls are aborted.
3. Worktree branches created by this wizard run are cleaned up **only if** no commits exist on them; if commits exist, those branches are preserved and tagged with `[cancelled]`.
4. Interview state is preserved for potential resume; it remains recoverable for 24 hours and is then pruned.
5. Any partial plan artifacts are moved to a `.cancelled/` directory within the project.
6. Usage tokens already consumed remain counted against the run budget.
7. Emit a `wizard.cancelled` event with `{ wizard_id, phase_at_cancel, resources_cleaned[], resources_preserved[], token_usage }`.

Items explicitly labeled `FUTURE FEATURE` or `OPEN QUESTION` remain open by intent and do not block the current wizard/interview contract unless a later owner decision promotes them.

**Resume behavior:** Within 24 hours, the user may resume a cancelled wizard from the last completed phase. Resume MUST reuse preserved interview state and preserved artifacts, while also respecting the branch-preservation rules above.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md

---

## 3. GUI Updates

### 3.1 Intent Selection at Flow Start

#### 3.1A Feature / enhancement entry copy addendum (2026-03-08)

The Chain Wizard start surface MUST expose an explicit user-facing CTA labeled:
ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

- **Add a new Feature or Enhancement**

Mapping rule:
- This CTA maps to existing intent `EnhanceRewriteAdd`.
- It does **not** create a new fifth intent.

Placement / reuse:
- available in the Chain Wizard start surface
- reusable as the recommendation CTA launched from Assistant Chat / Deep Plan
- reusable as a deferred-wizard shortcut when the current project is already known

Helper copy should make the scope clear:
- use this when the user is working inside an existing project and wants to add a substantial feature, major enhancement, focused rewrite, or other scoped change that benefits from interview/spec generation before orchestration

- **Placement:** When the user starts the flow (e.g. "Start new project" or "Open project" from Dashboard, or a dedicated "Start flow" entry), present **intent selection** before or as the first step of the wizard.
- **UI:** Four options (cards, list, or radio group) with short descriptions and optional "Learn more":
  - **New project** -- Greenfield; we'll create or use a new directory and optional GitHub repo.
  - **Fork & evolve** -- You'll work from a fork of an existing repo; we can create the fork or you can use your own.
  - **Enhance/rewrite/add** -- You have an existing project (new to Puppet Master); we'll scope changes and plan.
  - **Contribute (PR)** -- You want to add a feature or fix and open a Pull Request; we'll guide fork, branch, and PR.
- **Persistence:** Selected intent is stored in wizard/app state and passed to Interview and start chain. If the user goes back and changes intent, downstream state (e.g. requirements, interview phase) may need to be invalidated or confirmed.
- **OpenCode provider:** OpenCode is a first-class provider in tier configuration. Availability is controlled by the Settings enable toggle (see `Plans/Provider_OpenCode.md`). No wizard flow changes are required.

### 3.1.1 OpenCode Provider Settings Surface (GUI contract)

OpenCode is a **first-class provider backend** configured in Settings, not a wizard-specific special case.

- **Enable/disable:** Settings MUST expose a single OpenCode enable toggle.
- **Connection method selection:** Settings MUST expose OpenCode connection method:
  - **Direct server**: user supplies server host/port (or URL equivalent).
  - **CLI launcher/discovery fallback**: user-configurable `opencode` path used only for local launch/discovery fallback, not for primary HTTP runtime transport.
- **Auth/sign-in options:** Settings MUST expose server auth inputs and sign-in actions for OpenCode provider auth flows (see `Plans/Provider_OpenCode.md`).
- **Model selection:** Tier model pickers MUST source OpenCode models through the shared Provider model contract (no OpenCode-only picker behavior).

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md

### 3.2 Requirements Step Redesign

- **Single prompt:** "Provide your Requirements Document(s)."
- **Options (at least two):**
  1. **Upload your own** -- Single or **multiple** files (see §4). Supported formats per REQUIREMENTS.md (md, pdf, txt, docx); store under `.puppet-master/requirements/`.
  2. **Requirements Doc Builder** -- Button that opens Builder chat (section 5). The first Assistant message is context-sensitive per §5.1 ("What are you building?" / "What are you adding or changing?" / "What are you adding or changing in this fork?"). User describes the project (or delta, or feature); Assistant generates a requirements document after explicit user confirmation and hands it off to the flow. No re-upload required.
- **Framing by intent:** The exact label or helper text can vary by intent (e.g. "Describe the product" vs "Describe what you're adding or changing" vs "Describe the feature and acceptance criteria").
- **After requirements:** Proceed to Interview (or skip to PRD if we add "Skip interview" for advanced users later). Interview receives the canonical requirements (merged multi-doc or Builder output).

### 3.3 Project Setup Step (including GitHub)

- **When:** At the start of Project setup (wizard step 0 or equivalent), show:
  - **Project path** (new directory or existing path).
  - **Intent-specific fields:**
    - **New project:** Optional "Create GitHub repo" with **repo name** (required if creating) and any other fields needed to **actually create** the repo (visibility, description, .gitignore template, license, default branch). See §7.1.
    - **Fork & evolve / Contribute (PR):** **Upstream repo** (URL or `owner/repo`). Then: **"Create fork for me"** (we create the fork via GitHub HTTPS API) or **"I'll create the fork myself"** (user supplies fork path or clone URL after they fork). See §7.2.
  - **Existing GitHub repo (link only):** If the user already has a repo (e.g. created elsewhere or fork already exists), allow "Use existing repo" with URL or path.
- **GitHub create-repo:** The GUI must "punch in" the repo name and all fields required by the GitHub create-repo API so we can create the repo without a second manual step. See §7.1.
- **Provider readiness strip (Setup):** Show real-time provider auth status (`LoggedOut`, `LoggingIn`, `LoggedIn`, `LoggingOut`, `AuthExpired`, `AuthFailed`) and multi-account summary (active account + account count) for configured providers, with direct links to Authentication and Health/Doctor.
- **Tool readiness strip (Setup):** Show Cursor CLI, Claude CLI, and Playwright runtime install state (`Not Installed`, `Installing`, `Installed`, `Uninstalling`, `Failed`) with explicit Install/Uninstall actions. Codex/Copilot/Gemini are direct-provider integrations and do not show install buttons in this strip. Cursor/Claude rows include `Use manual path` checkbox + file picker; no manual path controls for Playwright.
- **Command contract source:** Setup actions for Cursor/Claude install/uninstall/PATH/verify MUST follow `Plans/FinalGUISpec.md` §7.15 command contract verbatim.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/chain-wizard-flexibility.md

### 3.4 Navigation and Recovery

- **Back/forward:** User can go back and change intent or project setup; document behavior when intent changes mid-flow (e.g. clear requirements and interview state, or prompt "Changing intent will reset requirements and interview; continue?").
- **Recovery:** Per newfeatures.md §4, recovery snapshot includes current view and wizard step; intent and project path should be in the snapshot so we restore to the right step and intent.

### 3.5 Agent activity and progress visibility


### 3.6 Plan/Deep Plan/TODO integration with wizard flow

When the wizard flow produces a plan or deep plan, the resulting TODO items use the normalized TODO schema defined in `Plans/assistant-chat-design.md` §8.1 and persisted per `Plans/storage-plan.md` §4.3.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Wizard → planning handoff:**
- Standard Plan and Deep Plan are workflow overlays over the `plan` runtime mode. The distinction is degree and intensity (`/intensity` lineage), not categorical.
- Deep Plan may spawn read-only research subagents (including web research) — this is permitted because plan mode allows web tools through the normal permission stack.
- The TODO auto-use heuristic (3+ actionable steps) applies to wizard-generated plans as well.
- Plan artifacts produced by the wizard use the same normalized TODO schema as agent-initiated plans.
- Wizard question prompts that require structured or multi-item answers render through the shared `/questionnaire` card contract and preserve `effective_persona` / `/effective_persona` runtime identity rather than inventing wizard-local question or persona state.
- Wizard planning and embedded activity surfaces consume `Plans/assistant-chat-design.md` for chat modes/controls, activity transparency, shared question flow, Plan/Deep Plan, TODO behavior, `/web`, `/skill`, terminal handoff, subagent defaults, assistant-facing runtime display rules, and runtime identity consumption.

**Tool access in wizard-generated plan mode:**
- Web tools resolve through the normal permission stack (default `ask`), consistent with `Plans/Run_Modes.md` §9.2 and `Plans/Permissions_System.md` §7.
- Mutating tools remain denied in plan mode regardless of wizard context.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md


When the **Requirements Doc Builder** or **Multi-Pass Review** is running, the user should **see the agents working** (similar to Assistant chat), not just a spinner or "Working..." label.

**Agent activity view (embedded, non-interactive):**

- **Concept:** A **chat-like window** embedded in the page (wizard step or Interview view) that shows **streaming agent output** -- prompts, model responses, subagent reports -- so the user can see progress in real time.
- **Non-interactive:** This view is **read-only** during the run: no user input, no slash commands. Minimal chrome (no full Assistant toolbar/settings); it is an embedded "agent log" or "agent activity" pane.
- **Where used:**
  - **Requirements Doc Builder:** When the Assistant is generating the requirements doc, show the Builder conversation/stream in this pane.
  - **Multi-Pass Review (requirements doc):** When the review agent and subagents are running, stream their activity (e.g. "Review agent spawning subagents...", "Subagent 1 reviewing...", "Subagent 1 reported back.") into this pane.
- **Implementation:** Reuse the same Provider event-stream pipeline as Assistant chat (assistant-chat-design.md); for Multi-Pass Review, feed review-agent and subagent events into the same stream and render in the embedded pane. DRY: one "agent activity view" widget or component, used by Builder, Interview document creation, and Multi-Pass Review.
- **Blocked-state mapping:** Permission blocked and FileSafe blocked activity cards use badge `blocked` plus inline recovery actions; MCP or `/Provider` unavailable states use badge `blocked` plus retry or `/config` actions; headless mode uses badge `blocked` plus an informational message instead of an unavailable GUI control.
- **Pane separation:** Agent activity pane is streaming/progress only. Document review/editing is handled by a separate embedded document pane (see section 5 and `Plans/FinalGUISpec.md`).

**Progress indicator:**

- **Concept:** A **progress bar or status strip** that shows **which documents (or steps) are in progress** and **how many remain**.
- **Requirements Doc Builder:** Simple case -- e.g. "Generating requirements document..." with optional step (e.g. "Reviewing (pass 2 of 3)" when Multi-Pass Review is running).
- **Multi-Pass Review (requirements):** E.g. "Review pass 1 of 2 -- 2 subagents active" or "Review complete; producing revised doc."
- **Interview document creation and Multi-Pass Review (interview):** See interview-subagent-integration.md "Agent activity and progress visibility": show which document is being written or reviewed, and how many documents remain (e.g. "Writing phase 4 document -- 5 of 8 remaining"; "Reviewing document 7 of 15 -- 9 subagents active").

**Placement:** The agent activity pane sits **on the same page where the action is triggered**. That means: (1) **requirements/wizard page** when Builder or Multi-Pass Review (requirements) is triggered there; (2) **Interview page** when document creation or Multi-Pass Review (interview) runs. On the Interview page the pane is shown **in addition to** interviewer chat (same event stream, redundant display).

**Pause, cancel, resume:** Provide **pause**, **cancel**, and **resume** as user options during Multi-Pass Review and during document generation (Builder, Interview). **Pause:** Takes effect at **next handoff boundary** (no new subagents spawned; in-flight subagents complete and report; review agent is not started or is paused before consuming the next report). Do not kill in-flight subagents on pause. Persist state so resume can continue from that boundary. **Resume state:** Persist at least: run phase (spawning / reviewing / producing), number of completed review tasks (and which doc/pass if applicable), any partial reports already received, and review agent input state if in producing. Resume = continue spawning or producing from that point without re-running completed tasks. **Cancel:** On cancel, **stop spawning** new subagents immediately. **Do not kill** in-flight subagents; let them complete and discard their reports. Then set state to cancelled and surface "Review cancelled; no changes applied." If the review agent is already producing, cancel after it finishes the current revision (do not truncate mid-write); then discard and set `cancelled`. **Recovery after crash:** Support **resume after crash** for Multi-Pass Review when recovery state is available: on restore, if state is "in progress," show "Run was interrupted" with options **Resume** (continue from persisted state) or **Start over** (clear state and re-run from step 1). If state is missing or corrupted, show only "Start over." Recovery persistence must support this restoration path.

---

**Run states (canonical):** The progress indicator and pane must support exactly these states: `idle`, `generating`, `reviewing` (include pass index and subagents active when available), `paused`, `cancelling`, `cancelled`, `interrupted`, `complete`, `error`. All user-facing text (status strip, empty state, toasts) must key off these states.

**Pause/cancel/resume UI:** Place **Pause**, **Cancel**, and **Resume** in a single control row (toolbar or footer of the agent activity pane). Order: Pause | Resume | Cancel. When running: show Pause and Cancel (Resume disabled). When paused: show Resume and Cancel (Pause disabled). **Cancel** must open a confirmation modal: "Stop this run? No changes will be applied." with "Stop run" and "Keep running." On confirm, transition to `cancelling` then `cancelled`; show toast: "Run cancelled -- no changes applied." **Resume** continues from the exact checkpoint; show toast "Resuming..." then "Run resumed."

**Builder surface (decision):** Use the **embedded agent activity pane** for the Requirements Doc Builder (same as Multi-Pass Review). Builder progress is shown in the embedded pane on the requirements/wizard page.

**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled -- last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.

**Recovery payload for in-progress runs:** Persist an optional **run checkpoint** when a doc-generation or Multi-Pass Review run is in progress. Schema: `run_type` (builder | multi_pass_review_requirements | document_creation | multi_pass_review_interview), `run_id`, `phase`, `step_index`, `document_index`, `total_documents`, `subagent_tasks_done`, `checkpoint_version`. On restore, show "Run was interrupted" with "Resume from checkpoint" and "Start over." If checkpoint is missing or invalid version, show "Cannot resume -- start over" and do not offer Resume.

---

## 4. Requirements: Multiple Uploads and Storage

### 4.1 Multiple Uploads

- **UI:** In the requirements step, allow **multiple** file uploads (e.g. "Add file" or multi-file picker). Display a list of added files with optional remove/reorder.
- **Limits (exact):**
  - **Max number of uploads:** **10**. Reject or disable "Add file" when the list already has 10 entries. Show a short message: "Maximum 10 files."
  - **Max file size per file:** **5 MiB** (5 × 2^20 bytes). Reject any file larger than this before saving; show a clear error (e.g. "File X exceeds 5 MB limit").
- **Order:** Merge order is the **list order** in the UI. User can reorder (e.g. drag-and-drop or up/down); that order is the only ordering used for canonical merge (see §4.2). No "primary" vs "supplements" -- list order is the precedence.
- **Formats:** Same as REQUIREMENTS.md: md, pdf, txt, docx. Per-file type validation and optional normalization (e.g. to markdown) for downstream consumption.
- **Normalization (normative):**
  - Original uploads are preserved byte-for-byte under `.puppet-master/requirements/uploaded/`.
  - Canonical merge input is the **normalized UTF-8 text projection** of each upload, never raw bytes.
  - `md` and `txt` normalize by UTF-8 decode + newline canonicalization.
  - `pdf` and `docx` normalize via deterministic text extraction into `.puppet-master/requirements/normalized/<upload_id>.md`.
  - If extraction fails, the wizard remains on the requirements step and surfaces an upload-specific error; failed files are excluded from merge until replaced or removed.

### 4.2 Canonical Input for Interview/PRD

**Single merge order and precedence:**

1. **User uploads multiple files ONLY (no Builder):** Merge order = **list order** in the UI. Produce one canonical doc by **concatenating normalized text** in that order, with a separator between each: `\n\n--- Requirements doc N ---\n\n` where N is 1-based index (e.g. first file gets "Requirements doc 1", second "Requirements doc 2"). No AI merge; no conflict resolution. If the user wants a different order, they reorder in the UI and we re-run the merge.

2. **User uses Requirements Doc Builder ONLY (no uploads):** Builder output is staged at **`.puppet-master/requirements/requirements-builder.md`**. Canonical promotion then writes **`.puppet-master/project/requirements.md`**. Interview and start chain read only `.puppet-master/project/requirements.md`.

3. **User has BOTH uploads and Builder:** **Uploads first** (in list order): concatenate all uploaded normalized texts with separator `\n\n--- Requirements doc N ---\n\n` (N = 1..upload count). **Then** append the Builder output with separator `\n\n--- Requirements Doc Builder ---\n\n`. Write the merged staging result to `.puppet-master/requirements/canonical-requirements.md`, then promote canonical user-project requirements to `.puppet-master/project/requirements.md`, and set `canonical_requirements_path` to `.puppet-master/project/requirements.md`.

**Conflicting content:** There is no "conflicting content" merge. Merge is **always** concatenation in the order above. We do not run AI or rule-based conflict resolution. If the user wants a different order or to drop a doc, they reorder or remove files in the UI and the app regenerates `canonical-requirements.md` and then re-promotes `.puppet-master/project/requirements.md`.

**Single source:** Interview and start chain read only from `canonical_requirements_path` (always `.puppet-master/project/requirements.md` after promotion). Canonical artifact reference (or content hash) may be stored in redb for the current flow/session so the Interview and start chain read from the same canonical artifact as the event stream.

### 4.3 Storage

- **Seglog/redb:** Requirements uploads, merge result, and Builder output should be represented as **artifacts** in the event stream (seglog): emit an event when a requirements doc is added, merged, or set as canonical. Projectors can mirror to JSONL and maintain redb projections (e.g. current canonical requirements ref or artifact index) for fast lookup. Implementation should follow storage-plan.md (seglog writer, redb schema, projectors) so requirements artifacts are queryable and replayable like other app artifacts.
- **Path:** Per REQUIREMENTS.md, store under `.puppet-master/requirements/`.
- **Exact storage paths:**
- **Uploaded files (one per upload):** `.puppet-master/requirements/uploaded/<sanitized_filename>`. `<sanitized_filename>`: take the original filename, remove or replace characters that are invalid or unsafe for the filesystem (e.g. path separators, control chars). Prefer a convention that keeps names unique (e.g. prepend index or hash if duplicate names). Example: `my-spec.md` → `my-spec.md`; `my spec (1).md` → `my_spec_1.md` or similar.
- **Normalized text projection (one per upload):** `.puppet-master/requirements/normalized/<two_digit_index>-<sanitized_stem>.md`. Duplicate filenames are disambiguated by the prefixed stable list index; merge and hashing operate on these normalized files.
  - **Requirements Doc Builder output:** `.puppet-master/requirements/requirements-builder.md`.
  - **Contract Layer seed pack (Builder output; staging only):** `.puppet-master/requirements/contract-seeds.md`. This is an input to the interview’s contract unification pass (§6.6) and MUST NOT be treated as the canonical project contract pack (which lives under `.puppet-master/project/contracts/`; SSOT: `Plans/Project_Output_Artifacts.md`).
    ContractRef: ContractName:Plans/Project_Output_Artifacts.md
  - **Merged staging result (always written when merge runs):** `.puppet-master/requirements/canonical-requirements.md`.
  - **Canonical user-project requirements (always written before Interview/start-chain execution):** `.puppet-master/project/requirements.md`.
- All paths are relative to the **project root** (where `.puppet-master/` lives). Implementation must create `.puppet-master/requirements/` and `.puppet-master/requirements/uploaded/` as needed.
- **Builder output:** When the Requirements Doc Builder produces a doc, write it to `requirements-builder.md`; merge step (when uploads + Builder) writes the concatenated staging result to `canonical-requirements.md`; canonical promotion then writes `.puppet-master/project/requirements.md` as the next-step input.

### 4.4 Gaps and Edge Cases

- **Max number of uploads:** **10** (see §4.1). Enforced in UI and on add.
- **Large files:** **Max file size per file = 5 MiB** (5 × 2^20 bytes). Reject larger files with a clear error; do not store or stream them. No "reference only" or sampling for MVP.
- **Conflicting content:** Resolved. Merge is **always concatenation** in the defined order (§4.2). No AI merge. User controls order by reordering in the UI; no open questions.

---

## 5. Legacy Requirements Doc Builder Compatibility Lineage (PRD Builder Current Owner)

This section is retained for historical migration and source-lineage compatibility only. Current PRD Builder behavior is owned by `Plans/PRD_Builder.md`; current Planning Wizard intake and handoff behavior is owned by `Plans/Planning_Wizard.md`.

### 5.1 Concept

- Legacy **Requirements Doc Builder** material maps to current PRD Builder behavior only after revalidation through `Plans/PRD_Builder.md`.
- The Builder is a conversation-first flow. No questionnaire appears before the first user response.
- The Builder output remains a staged artifact until the flow reaches final approval and handoff.

**Opening Prompt (Resolved):**
The Assistant MUST initiate the interview/requirements flow with an opening question. The exact phrasing depends on context:
- **New project (no existing requirements):** "What are you building?"
- **Existing project (has requirements/codebase):** "What are you adding or changing?"
- **Fork/contribute (detected from project setup):** "What are you adding or changing in this fork?"

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/chain-wizard-flexibility.md

The Assistant does NOT wait for the user to speak first. This opening question is the first message in the interview thread. After the user responds, the scope probe phase begins (see §6.2).

### 5.2 Flow

**Turn definition (required):**
- One completed turn = one Assistant message plus one user response.
- `completed_turns` increments only after the user response arrives.

**Conversation phase (required):**
1. User clicks `Requirements Doc Builder` in the requirements step.
2. Builder chat opens and sends the context-appropriate opening question (see §5.1 Opening Prompt).
3. User and Assistant converse. Assistant may ask clarifying questions, suggest structure, and draft sections.
4. Assistant may suggest generation when either condition is true:
   - It determines there is enough information, or
   - `completed_turns >= 6`
5. Suggestion text is confirmatory (for example: `Would you like me to create the requirements doc?`) and does not auto-generate.
6. If the user keeps talking or ignores the suggestion, conversation continues with no forced handoff.
7. User can continue this phase indefinitely until they explicitly confirm generation.

**Generation trigger (required):**
- Generation starts only after an explicit user confirmation (for example: `yes, make the doc`).
- Once confirmed, Builder runs qualifying questions driven by checklist state (see section 5.3), then generates staged artifacts.

### 5.3 Handoff Contract

- **Output format:** Markdown recommended; structure (sections) must follow the **Builder output template** below so Interview and PRD generator get consistent input.
- **Single vs. multiple:** Builder produces one requirements document per generation run.
- **Persistence:** Handoff state (paths, source, checklist/conversation state, approval stage) is persisted for recovery.
- **Contract Layer seed pack:** Builder also emits `.puppet-master/requirements/contract-seeds.md` as a structured seed input for the Contract Layer (§5.7, §6.6). This file is **not** the canonical project contract pack; canonical contracts live under `.puppet-master/project/contracts/` and are referenced by stable `ProjectContract:*` IDs (SSOT: `Plans/Project_Output_Artifacts.md`).
- **Document packaging policy:** Requirements Builder outputs under `.puppet-master/requirements/**` that reach packaging triggers MUST be emitted as Document Sets and verified per `Plans/Document_Packaging_Policy.md` before handoff continues.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

**Builder output template (required):** The Assistant/Builder must emit a single Markdown document with the following **required top-level sections** (headings). Implementations may validate and warn if sections are missing.

| Section heading | Purpose |
|-----------------|--------|
| **Scope** | What is in scope for the product, delta, or feature. |
| **Goals** | High-level goals and success criteria. |
| **Out of scope** | Explicitly excluded items. |
| **Acceptance criteria** | Testable conditions of done (can be a list). |
| **Non-goals** | What we are not trying to achieve. |

Additional sections (for example **Risks**, **Dependencies**, **Constraints**) are allowed. The PRD generator and Interview assume at least the five above.

**Contract seed pack template (required when Builder is used):**

The Assistant/Builder must also emit a **single** Markdown document at `.puppet-master/requirements/contract-seeds.md` with the following **required top-level sections** (headings). Implementations may validate and warn if sections are missing.

| Section heading | Purpose |
|-----------------|--------|
| **Assumptions** | Initial assumptions that materially affect design/execution (explicitly stated so they can be validated or overridden). |
| **Constraints** | Hard constraints (versions, platforms, compliance, budgets, forbidden deps) that must be enforced downstream. |
| **Glossary** | Canonical terms and naming decisions for the target project (feeds optional `.puppet-master/project/glossary.md`). |
| **Non-functional budgets** | Explicit budgets (latency, memory, cost, availability) that will become executable acceptance checks. |

**Checklist dual-state contract (required):**
- Conversation state contract: `builder_conversation_state.v1`
  - `session_id` (format `PM-YYYY-MM-DD-HH-MM-SS-NNN`)
  - `completed_turns`
  - `last_suggestion_turn`
  - `awaiting_generation_confirmation`
  - `awaiting_final_approval`
- Side structure contract: `builder_checklist_state.v1`
  - `section_id`
  - `status` (`empty | thin | filled`)
  - `source` (`requirements_doc | contract_seed_pack`)
  - `last_updated_event_id`
  - `coverage_note`

**Qualifying-question rule (required):**
- Before generation, ask qualifying questions only for checklist entries with `status=empty` or `status=thin`.
- Do not ask follow-up questions for sections already marked `filled`.

### 5.3.1 Builder handoff lifecycle and promotion

Builder runs against a staged bundle; canonical promotion happens only after the final user gate.

Required staged artifacts:
- `.puppet-master/requirements/staging/builder/<run_id>/requirements.md`
- `.puppet-master/requirements/staging/builder/<run_id>/contract-seeds.md`
- `.puppet-master/requirements/staging/builder/<run_id>/review-summary.json`

Promotion rules:
- **Accept:** promote the staged `requirements.md` to `.puppet-master/requirements/requirements-builder.md`, promote `contract-seeds.md`, update `canonical_requirements_path` via merge/promotion, then allow `Done -- hand off to Interview`.
- **Reject:** discard the staged review output and leave the last accepted Builder artifact (or no Builder artifact) unchanged.
- **Edit:** opens the revised staged bundle; user edits remain staged until the same Accept gate is completed.
- `Done -- hand off to Interview` is enabled only when the bundle state is `approved_for_handoff`; it must persist `builder_stage`, `builder_run_id`, `awaiting_final_approval`, and the accepted artifact refs.

### 5.4 Dependencies

- **Assistant chat** must be implemented (assistant-chat-design.md).
- **Project/context:** Assistant must know current project path and intent so it can tailor questions and the generated doc (e.g. "delta" vs "full product" vs "feature scope").
- **No duplicate rules:** Use the same rules pipeline (agent-rules-context.md) for Assistant; do not duplicate interview-specific rules in the Builder prompt beyond "produce a requirements doc for handoff."

### 5.5 Document review surfaces and generation order

Requirements Doc Builder bundle review now uses a unified annotation + chat-handoff model instead of a note-only loop.

#### 5.5.0 Bundle + doc state model

**Bundle-level states (canonical):**
- `idle`
- `generating` (some docs `writing…`)
- `awaiting_user_review` (generation complete; docs are `draft/needs-review`)
- `revision_running` (`Resubmit with Annotations` targeted revision pass)
- `awaiting_approvals` (user marks docs Approved/Done)
- `ready_for_final_review` (all docs approved + no open annotations)
- `final_review_running` (Multi-Pass Review)
- `final_gate` (`Accept | Reject | Edit`)
- `complete`
- `error` / `interrupted` (resume supported)

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

**Doc-level states (canonical):**
- `writing…` -> `draft` -> `approved`
- `draft` <-> `changes-requested` (open annotations or reply-only targeted revision outcomes)
- `needs-review` may be used as a doc badge when helpful

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/Crosswalk.md

#### 5.5.1 Requirements Doc Builder flow (updated)

1. Conversation phase.
2. User confirms generation.
3. Qualifying questions for `empty` and `thin` checklist sections only.
4. Builder generates staged artifacts as a **bundle**, streaming writes into the Embedded Document Pane.
5. Generation completes; docs become `draft` / `needs-review`.
6. User reviews, optionally edits, creates durable annotations, and may send bounded selections to the page-owned chat.
7. User clicks **Resubmit with Annotations** (targeted revision pass). This step can repeat as needed.
8. User resolves remaining annotations and marks each doc **Approved/Done**.
9. When all docs are Approved/Done and there are no open annotations, enable **Run Final Review**. Do not auto-run.
10. Multi-Pass Review runs once by default and ends with a single gate: **Accept | Reject | Edit**.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Hard rule:** `Resubmit with Annotations` MUST NOT trigger Multi-Pass Review.

ContractRef: ContractName:Plans/Crosswalk.md

#### 5.5.2 Resubmit with Annotations: targeted revision contract

**Input:**
- Current doc contents for docs with open durable annotations, or a user-selected subset
- All open durable annotations in deterministic order by `doc_id`, source start offset, and `annotation_id`
- Minimal context: document registry, per-doc approval state, requested/effective revision capability, and bounded provenance
- Each annotation input record includes `annotation_id`, `operation = comment | replace | insert_after | remove`, `intent_kind = question | change_request | both`, selected anchor context, and `operation_payload`.
- `operation_payload` uses the canonical shapes `{ body }`, `{ replacement_text, rationale? }`, `{ insert_text, rationale? }`, or `{ rationale? }`.
- Structured revision input is source-of-truth anchored to source text, not the rendered visual tree: preview-mode selections must map back to source offsets when deterministic, and when deterministic mapping is unavailable, `Send selection to chat` may use quote/provenance while durable structured change-request annotations are disabled or downgraded to comment-only.
- Revision input records also preserve `anchor.text_position`, `anchor.text_quote`, bounded `selected_text`, `provenance` (`path`, `source_surface`, bounded excerpt), `conflict_state`, and `staleness_state`.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

**Output:**
- Updated doc text for modified docs
- Replies for question/comment annotations
- One result record per input annotation, in the same order, with `outcome = addressed | still_open | cannot_apply`, `addressed_explanation`, `updated_anchor?`, and `failure_code?`
- Output records remain per-annotation and must preserve the input order; partial success is represented per annotation rather than by a bundle-level vague success.
- Revision output must be machine-validated before status transitions; the runtime, not the model, is authoritative for marking annotations addressed, still_open, cannot_apply, or unresolved.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/Crosswalk.md

**Hard rules:**
- MUST NOT trigger Multi-Pass Review
- MAY answer questions without changing docs
- Conflicting or stale mutating annotations are excluded from automatic revision until resolved
- Allow one automatic retry on structured validation failure; then degrade or fail explicitly
- Requested/effective revision capability must be visible when it differs. The effective capability is `schema_enforced_structured_revision`, `validated_structured_revision`, or `chat_handoff_only`.
- `schema_enforced_structured_revision` requires transport-native `/structured-output`; `validated_structured_revision` requires local validation of shape, ids, `/order/shape`, and anchor applicability; `chat_handoff_only` means durable annotations remain but mutating revision is forwarded to chat/manual follow-up.
- Remaining non-blocking buckets are tagged explicitly as `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.
- V1 keeps note-based embedded-document review upgraded into structured annotations and does not introduce direct `patch-apply` semantics.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

#### 5.5.3 Acceptance criteria (workflow-level)

- The selection palette appears on supported docs and creates durable annotations for `Comment`, `Replace`, `Insert after`, and `Remove`.
- `Send selection to chat` creates a thread-scoped composer chip in the owning chat surface for the next turn.
- Durable annotations persist and re-anchor deterministically; `anchor_not_found` remains explicit and never silent.
- `Resubmit with Annotations` performs a targeted pass and never invokes Multi-Pass Review.
- `Resubmit with Notes` is a legacy UI label for the same targeted pass; it consumes open durable annotations, or a user-selected subset, and maps the output into the `open -> addressed -> resolved` lifecycle.
- Final review cannot run until all docs are Approved/Done and no annotations remain open.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### 5.6 Multi-Pass Review (Requirements Doc)

Multi-Pass Review is the **final-review** step for the Requirements Doc Builder bundle. Cheap iteration happens through durable annotations plus `Resubmit with Annotations`, not by repeatedly running Multi-Pass Review.

**Trigger (hard gate):**
- Enabled only when all docs in the bundle are marked **Approved/Done**.
- Enabled only when there are **no open annotations**; question/comment annotations count as open until the user resolves them.
- User must explicitly click **Run Final Review**.
- Must not auto-run when conditions become true.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/storage-plan.md

**Separation rules:**
- `Send selection to chat` chips do not satisfy or bypass the final-review gate.
- Targeted revision and final review remain separate runtime actions with separate audit trails.
- Interrupted targeted revision cleanup must preserve safe-point lineage and unresolved annotations until terminal resolution.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/storage-plan.md

### 5.7 Contract Layer (Requirements → Contracts → Plan → Execution)

This flow must insert an explicit **Contract Layer** between requirements and plans so large, parallel agent execution stays deterministic and DRY:

`requirements.md` → `Project Contract Pack` → `plan.md` + `plan_graph/` (sharded plan graph; canonical) → execution

**Purpose (why the Contract Layer exists):**

- Requirements text is human-oriented and often ambiguous; a contract layer converts key statements into **stable, citable IDs**.
- When many agents work in parallel, contract IDs prevent drift: plan nodes reference `ProjectContract:*` IDs instead of copying prose.

**Two-layer contract model (do not mix them):**

1. **Platform Contracts (Puppet Master SSOT; referenced by name/ID only):** Canonical event model, tool schemas/policy semantics, provider capability interface, patch pipeline contracts, session storage envelopes, UI command contracts. These live in SSOT docs such as:
   - `Plans/Contracts_V0.md` (event envelopes, UICommand, auth)
   - `Plans/Tools.md` (tool registry + permission semantics)
   - `Plans/CLI_Bridged_Providers.md` (provider normalized streams)
   - `Plans/Crosswalk.md` (ownership boundaries)
   - `Plans/DRY_Rules.md` (ContractRef enforcement)
   - **Rule:** Do **not** copy these internal `Plans/` schemas/docs into user projects. In user-project artifacts, Platform Contracts are referenced only by stable name/ID (e.g. `ContractName:*`, `SchemaID:*`), and user projects are not expected to have a `Plans/` folder.

2. **Project Contracts (generated per user project):** The **Project Contract Pack** under `.puppet-master/project/contracts/`, indexed by required `contracts/index.json`, and referenced by stable `ProjectContract:*` IDs (SSOT: `Plans/Project_Output_Artifacts.md`).

**Where the Contract Layer artifacts live (filesystem materialization):**

- The required user-project artifact set is materialized under `.puppet-master/project/` (see §11 for the full list; SSOT: `Plans/Project_Output_Artifacts.md`).
- The Requirements Doc Builder seed file `.puppet-master/requirements/contract-seeds.md` is a **staging input** used by the interview’s contract unification step (§6.6). It is not part of the canonical `.puppet-master/project/` artifact set.

**Storage and referencing semantics (canonical):**

- **Canonical source of truth is seglog**: artifacts are persisted as full-content artifact events (chunked deterministically when needed) with `sha256` integrity. Filesystem copies are materializations/cache and must be regenerable from seglog.
- redb projections and Tantivy indexing must make these artifacts discoverable by logical path, artifact type, contract IDs, and content search.

**DRY rule (critical):**

- Execution nodes must reference project contracts via `contract_refs: ["ProjectContract:..."]` (resolvable via `contracts/index.json`) and must not embed contract content inline.
- If plan.md repeats explanatory text for readability, it must include a pointer like `Canonical source: ProjectContract:<...>` so the canonical contract is unambiguous.

**Acceptance criteria (testable; no manual checks):**

A dry-run validator must be able to parse the `.puppet-master/project/` artifact set and verify (SSOT: `Plans/Project_Output_Artifacts.md` Validation Rules):

- Every node shard contains `contract_refs` and references at least one resolvable `ProjectContract:*` ID (via `contracts/index.json`).
- Every node shard `acceptance[].check_id` is present in `acceptance_manifest.json`.
- Evidence outputs are defined and point to `.puppet-master/project/evidence/<node_id>.json` (schema `pm.evidence.schema.v1`).
- Orchestrator can execute in headless mode from `.puppet-master/project/` artifacts alone; when HITL blocks some nodes, the scheduler continues other non-blocked work where dependencies allow.

ContractRef: SchemaID:contracts_index.schema.json, SchemaID:acceptance_manifest.schema.json, SchemaID:project_plan_graph_index.schema.json, SchemaID:project_plan_node.schema.json, SchemaID:evidence.schema.json, ContractName:Contracts_V0.md#EventRecord

---

## 6. Adaptive Interview Phases

### 6.1 Goal

- The **Interview** today has a fixed set of phases (e.g. Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing). For different intents and contexts, we want the **AI Interviewer** (or phase manager) to **decide** which phases to **cut**, which to **shorten**, and which to **double down on**.
- This keeps the interview appropriate to the task: full product gets full depth; PR contribution gets a light pass; fork/evolve gets delta-focused depth where it matters.

### 6.2 Mechanism

- **Inputs to the decision:**
  - **Intent** (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR).
  - **Early context:** e.g. first answers, uploaded requirements summary, or a short "scope" question at the start.
  - **Optional:** Project context (languages, frameworks) from codebase_scanner when it's an existing project.
- **Output:** A **phase plan** for this run: which phase IDs to include, optional **depth** or **weight** per phase (e.g. "Architecture: deep," "Deployment: skip"), and optionally reorder.
- **Implementation:** Extend the **phase manager** (interview-subagent-integration.md) to support:
  - A **pre-interview step** (phase 0) that runs a mandatory scope probe, then calls a **phase selector** that returns the phase plan.
  - The rest of the interview runs only the selected phases, with depth enforcement per phase.

**Pre-Interview Scope Probe (Resolved):**
Phase 0 is a mandatory scope probe that runs before the adaptive phase selector:
- **Max 2 questions:** (1) Opening question (see above), (2) "Any constraints, preferences, or specific technologies you want to use?"
- After receiving answers to both (or after the user signals readiness), the phase selector is called with the scope context.
- Trigger: always runs as phase 0. Not skippable.
- Config: `interview.scope_probe.max_questions`, default `2`.

**Depth Hints (Resolved):**
Depth is enforced as a **soft cap** based on question count (not token budget):
- **Short:** max 2 questions, no research tool calls. If the agent signals phase-complete at count ≤ 2, accept.
- **Full:** all questions in the phase template, plus research tool calls when needed. No artificial cap.
- **Skip:** phase is not run at all.
- **Enforcement:** If the agent has asked `max` questions and has not signaled phase-complete, send a "Please wrap up this phase" instruction. If the agent asks one more question (grace: `max + 1`), force-complete the phase with a `phase.force_completed` seglog event.
- Config per phase: `interview.phases.{phase_name}.depth` (default `"full"`), `interview.phases.{phase_name}.max_questions` (default: phase-template-defined).
- Compatibility note: legacy source references to `phase.config.max_questions` normalize to `interview.phases.{phase_name}.max_questions` or the global `interview.max_questions_per_phase`; they do not define a separate phase-config schema.

### 6.3 Phase Selector Contract

**Input (Rust struct or JSON):**

- `intent`: enum -- `NewProject` | `ForkAndEvolve` | `EnhanceRewriteAdd` | `ContributePr`
- `requirements_summary`: `String` -- first 2000 characters of the canonical requirements document (after merge/Builder)
- `codebase_summary`: `Option<String>` -- from codebase_scanner when project path exists and is an existing project; `None` for new project or when scanner not run
- `has_gui`: `Option<bool>`

**Canonical phase registry (ordered):**
1. `scope_goals`
2. `architecture_technology`
3. `product_ux`
4. `data_persistence`
5. `security_secrets`
6. `deployment_environments`
7. `performance_reliability`
8. `testing_verification`

**Output (normalized plan):**

- `phase_plan`: `Vec<PhasePlanEntry>` where each entry is:
  - `phase_id`: one value from the registry above
  - `depth`: `Full | Short | Skip`

Normalization / ordering rules:
- array order is the **execution order**
- duplicate `phase_id` values are invalid and cause selector failure fallback
- unknown `phase_id` values are invalid and cause selector failure fallback
- omitted registry phases are normalized to `Skip` before persistence so resume always has a complete 8-entry plan
- selector/provider-specific hints are advisory only; the persisted plan is the phase manager’s normalized output

**Selector runtime:**
- MVP source of truth is the **local phase manager normalizer** using intent + scope probe + available context
- implementations MAY obtain an AI recommendation, but the persisted plan MUST still be normalized by the local phase manager
- no separate selector-only provider/model contract is required for MVP

ContractRef: ContractName:Plans/interview-subagent-integration.md, PolicyRule:Decision_Policy.md§2

**Depth semantics:**

- **Full:** Run full phase -- all questions for that phase, research if configured.
- **Short:** Run abbreviated phase -- maximum 2 questions for that phase, no research.
- **Skip:** Do not run phase questions, research, or document generation for that phase.

**Fallback when selector fails or returns empty:**

Use rule-based default (do not re-invoke selector):
- **NewProject** → all phases `Full`
- **ForkAndEvolve** → all phases `Full`
- **EnhanceRewriteAdd** → all phases `Full`
- **ContributePr** → `scope_goals=Short`, `architecture_technology=Short`, `testing_verification=Short`; all others `Skip`

**Storage:** Persist the normalized 8-entry `phase_plan` in interview state. Path: `.puppet-master/interview/phase_plan.json` (or include in existing interview state file if one exists). Also persist `phase_override_mode` and `phase_plan_source` (`selector | fallback | run_all | manual_checklist`) for audit/replay.

**Resume:** When resuming an interview, load `phase_plan` from stored state; do **not** re-run the phase selector. Run only the phases and depths already in the loaded plan.

**User override -- "Run all phases":** Add a GUI checkbox **"Run all phases"** (default **off**). When **on**, ignore stored/generated `phase_plan` and run all registry phases at **Full** depth. This overrides both selector output and fallback.

**User override -- Phase checklist:** Show the ordered registry with checkboxes. Checked = run the phase (use stored depth unless Run all phases is on). Unchecked = force `Skip`. Manual edits persist as the next normalized `phase_plan`.

### 6.4 Relationship to interview-subagent-integration.md

- Phase **subagents** (product-manager, architect-reviewer, etc.) remain; we only **select** which phases run and at what depth.
- **Document generation** and **research/validation** subagents still apply to the phases that are run.
- **New subsection** in that plan: "Adaptive phases: intent and context drive phase selection and depth; phase manager implements phase selector and runs only selected phases."

### 6.5 Gaps and Risks

- **Determinism:** Phase selection is AI-driven; two runs with same intent might get different phase sets. Consider caching by (intent, requirements_hash) or making selection rule-based with optional AI override.
- **User override:** Should the user be able to "force full interview" or "skip phase X"? If so, add a simple override in GUI (e.g. "Run all phases" checkbox or phase checklist).

### 6.6 Contract fragments + Contract Unification Pass (Project Contract Pack)

Adaptive interview phases are responsible not only for collecting answers, but for producing the **project contract layer** required for autonomous execution (§5.7; SSOT: `Plans/Project_Output_Artifacts.md`).

#### 6.6.1 Per-phase contract fragments (incremental)

Each interview phase contributes **contract fragments** (structured, citable statements) that are later unified into the Project Contract Pack:

- **Scope & Goals:** scope boundaries, success metrics, out-of-scope constraints (feeds contract seeds and acceptance checks).
- **Architecture & Technology:** module boundaries, external interfaces, build/run commands, version pins (feeds API/module/command contracts).
- **Product / UX:** user journeys, UI invariants, role/permission surface, accessibility requirements (feeds interface and acceptance contracts). **When the user project includes a GUI:** also produces UI wiring fragments — interactive-element inventory, preliminary `UICommandID` assignments, and UI-to-handler mapping seeds — that feed the UI wiring matrix and UI command catalog generated during unification (§6.6.2).
- **Data & Persistence:** schemas, migrations, consistency rules, indexing/search expectations (feeds data-model and integration contracts).
- **Security & Secrets:** authn/authz model, threat controls, secret handling, error taxonomy constraints (feeds security + error taxonomy contracts).
- **Deployment & Environments:** environment matrix, CI/CD commands, configuration keys, rollout constraints (feeds command + integration contracts).
- **Performance & Reliability:** budgets (latency/memory), availability targets, observability requirements (feeds NFR budgets and acceptance checks).
- **Testing & Verification:** acceptance checks, how to run tests/commands, required evidence outputs (feeds `acceptance_manifest.json` + node acceptance arrays).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:contracts_index.schema.json, SchemaID:acceptance_manifest.schema.json

#### 6.6.2 Contract Unification Pass (deterministic, end-of-interview)

The **wizard pipeline** owns the Contract Unification Pass. It is not owned by the interview loop and it is not a post-processing afterthought: it runs **after the interview phase completes** and **before plan generation begins**.

Trigger and ownership rules:

- **Trigger:** the interview status transitions to `completed`.
- **Owner:** wizard pipeline.
- **Primary responsibility:** merge all contract fragments emitted across interview rounds/phases into a single coherent contract.
- **Required output:** unified contract document plus conflict resolution notes.
- **Failure mode:** if contract conflicts cannot be resolved deterministically, the wizard transitions to `blocked` with `blocked_reason = contract_conflict`.

At interview completion, a single deterministic **Contract Unification Pass** must run to:

1. Deduplicate overlapping fragments across phases (single canonical statement per contract).
2. Assign stable `ProjectContract:*` IDs (namespaced, deterministic; see `Plans/Project_Output_Artifacts.md` "Project contract IDs (stable)").
3. Materialize required user-project artifacts under `.puppet-master/project/` exactly per `Plans/Project_Output_Artifacts.md`:
   - `contracts/` + required `contracts/index.json`
   - canonical sharded `plan_graph/` (`index.json` + `nodes/<node_id>.json`; optional `edges.json`)
   - `acceptance_manifest.json`
   - `plan.md` (human-readable view, contract-ID referenced)
4. Ensure every plan node includes at least one resolvable `ProjectContract:*` in `contract_refs`.
5. Optional derived export handling: `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` may be materialized for convenience only; it is non-canonical and validators/orchestrator MUST use sharded `plan_graph/` as the execution source of truth.
6. **When the user project includes a GUI:** Generate UI wiring artifacts under `.puppet-master/project/ui/`:
   - `ui/wiring_matrix.json` — maps every interactive UI element to its `UICommandID`, handler, expected events, acceptance checks, and evidence requirements. MUST validate against a project-local adaptation of `Plans/Wiring_Matrix.schema.json` (same schema shape; `handler_location` and `ui_location` reflect user-project module paths, not Puppet Master internals).
   - `ui/ui_command_catalog.json` — stable registry of all `UICommandID` values for the user project, with descriptions and handler references.
    - Plan graph nodes that involve UI work (creating screens, adding interactive elements, wiring handlers) MUST include `contract_refs` entries pointing to the relevant wiring matrix entries and/or command catalog IDs.
    - GUI detection: The project is considered to have a GUI if the Architecture or Product/UX interview phases identify a graphical interface (desktop, web, or mobile). The `has_gui` flag is set during the interview and persisted in interview state.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

Large-output handling:

- Contract pack may be chunked across multiple files under `contracts/`; `contracts/index.json` remains the single canonical index for resolvability.
- Seglog artifact persistence must support deterministic chunking of large artifacts with `sha256` integrity events (see `Plans/Project_Output_Artifacts.md` "Seglog Canonical Persistence Contract").

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:contracts_index.schema.json, SchemaID:project_plan_graph_index.schema.json, SchemaID:project_plan_node.schema.json, SchemaID:acceptance_manifest.schema.json

#### 6.6.3 Validation (dry-run, before execution)

After the Contract Unification Pass, run the dry-run validator defined by `Plans/Project_Output_Artifacts.md` before execution begins.

Validation here is intentionally DRY:

- enforce SSOT checks for artifact presence, schema validity, deterministic node IDs, `ProjectContract:*` resolvability, and acceptance-manifest coverage
- if `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is materialized, validate it only as a derived consistency export (never canonical)
- enforce **UI wiring completeness** when `has_gui` is true (no unbound actions; catalog↔matrix coverage; UI-scope nodes carry wiring-related `contract_refs`)

ContractRef: ContractName:Plans/Project_Output_Artifacts.md

---

## 7. Project Setup and GitHub: Create Repo, Fork, PR

### 7.1 Create Repository (New Project)

- **Requirement:** At Project setup, GitHub controls must support **actually creating** a repo, not only linking an existing one.
- **Fields (minimum):**
  - **Repository name** (required when "Create GitHub repo" is checked). Pre-fill from project name when possible; user can edit.
  - **Visibility:** Public / Private (and any org-level options if applicable).
  - **Description:** Optional.
  - **Other fields (optional):** .gitignore template, license, default branch name (when supported by the GitHub API contract used).
- **Action:** On "Create," call GitHub HTTPS API create-repo flow per `Plans/GitHub_API_Auth_and_Flows.md`; then set the remote (e.g. `origin`) and optionally push an initial commit so the project is ready.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### 7.2 Fork: Offer to Create or User Does It

- **Requirement:** For intents **Fork & evolve** and **Contribute (PR)**, we **offer** to create the fork for the user, but **allow the user to create the fork themselves**.
- **Offer to create:**
  - User supplies **upstream repo** (URL or `owner/repo`).
  - Button or link: **"Create fork for me."** We call the GitHub HTTPS API fork/create flow. Fork destination defaults to the authenticated user's account. Organization forks require an explicit organization destination selector, `read:org` or equivalent scope disclosure, permission preflight, and a blocked outcome when the authenticated account cannot fork into the selected organization.
  - After creation, we resolve the fork clone URL via GitHub API, **clone** the fork to the chosen project path, set that as the working project, and optionally set `upstream` remote to the original repo. Set `fork_created_by_app: true` and store `fork_url_or_path` in wizard state.
- **User does it themselves:**
  - Option: **"I'll create the fork myself."** We show brief instructions (e.g. "Fork the repo on GitHub, then paste your fork URL or clone path below") and a field for **fork URL** or **local path** after they clone. We use that as the working project and do **not** call any fork/create API. Set `fork_created_by_app: false`. Validate path/URL is a valid git repo; optionally check for `upstream` or `origin` pointing to the expected repo.
- **Validation:** If user chose "Create fork for me," verify fork exists and we have clone URL before proceeding. If "I'll do it myself," verify the path or URL is a valid git repo and optionally that it has an `upstream` or origin pointing to the expected repo.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### 7.3 PR Flow: Start (Fork, Clone, Branch)

- **Goal:** For "Contribute (PR)," we do (or guide) the standard **start** of a PR: fork → clone → create a **feature branch**.
- **Steps we offer:**
  1. **Fork** -- Already covered in §7.2 (offer to create or user does it).
  2. **Clone** -- If we created the fork, we clone it to the chosen path. If user provided fork path/URL, we use it (or clone if URL).
  3. **Branch** -- Create a **feature branch** (e.g. `feature/add-x` or `fix/issue-42`). User can name it or we suggest from intent/requirements (e.g. "feature/" + slug from first line of requirements). All work happens on this branch.
- **Worktree vs feature branch (Contribute PR):** For **Contribute (PR)** we do **not** create node worktrees (no per-node worktree branches). All work happens on a **single feature branch** in the **main clone** (the fork clone at `project_path`). Steps: fork → clone to project path → create one feature branch in that clone → run Interview and orchestrator work on that branch. No separate worktrees for subtasks for this intent.
- **UI:** After fork/clone, show "Create feature branch" with optional branch name input; on confirm, run `git checkout -b <branch>` (or equivalent). Then proceed to requirements and Interview.

### 7.4 PR Flow: Finish (Commit, Push, Open PR)

- **Goal:** After the orchestrator (or user) has made changes, we **offer** to commit, push the branch to the fork, and open the Pull Request. User can also do these steps themselves.
- **Steps we offer:**
  1. **Commit** -- Gather changed files (or use a suggested list from last run). User provides **commit message** (or we suggest one from task/phase). Run `git add` and `git commit`.
  2. **Push** -- Push the current branch to the fork (`origin` or user's fork remote). Auth must be sourced from SSH or OS credential store at runtime; do not embed tokens in remotes or logs. Surface push errors (permission/network).
  3. **Open PR** -- Create the Pull Request via GitHub HTTPS API: **from** current branch on the fork **to** the default branch of **upstream**. Do **not** assume upstream default branch is `main` or `master`; fetch `default_branch` via GitHub API before creating the PR. Link to the new PR in the UI.
- **User does it themselves:** Option "I'll commit and open the PR myself" with short instructions (commit, push, open PR on GitHub) and optional link to GitHub "Compare & pull request" for their branch.
- **Help for first-time contributors:** Optional in-app blurb or link: "What's a PR? You work on a branch of your fork; we push it and open a request for the upstream repo to merge your changes."

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md, PolicyRule:no_secrets_in_storage

### 7.5 Integration with WorktreeGitImprovement and MiscPlan

- **Branch naming:** Reuse sanitization and strategy from WorktreeGitImprovement.md (branch naming, no invalid refs).
- **PR creation:** PR creation uses the GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md`. For "Contribute (PR)" finish flow, we may use a different PR body template (e.g. "Feature: ..." + acceptance summary) but must sanitize secrets.
- **GitHub auth:** Fork creation and PR creation require GitHub OAuth token in OS credential store; do not store tokens in seglog/redb/Tantivy or logs.

**Required GitHub auth scopes (MVP):** **repo** (full) -- required for create repo, fork, push branch, open PR. **read:org** is required when organization-fork destination discovery or permission preflight is enabled. Document these in Doctor/Setup and in user-facing docs. On permission errors (e.g. 403), show: "Permission denied: ensure your GitHub token has the **repo** scope (and **read:org** if using organization fork)." with a link to token/settings.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md, PolicyRule:no_secrets_in_storage

### 7.6 Gaps and Risks

- **Non-GitHub hosts:** Fork/PR flow is implemented for **GitHub** in MVP. GitLab and Bitbucket return typed unsupported-host outcomes with recovery/help actions and owner docs named for later host-specific expansion; they must not appear as silent placeholders or generic future scope.
- **Org vs. user fork:** Fork destination is an active typed path. The authenticated user account remains the default destination, and **Fork to organization** requires explicit destination selection, scope disclosure, `read:org` when organization discovery or permission checks are enabled, permission preflight, and blocked outcomes when the account cannot fork into the selected organization.
- **Rate limits:** Creating repo/fork and opening PR use GitHub API; respect rate limits and surface "too many requests" (or equivalent) to the user.

---

## 8. Relationship to Other Plans

| Plan | Relevance |
|------|-----------|
| **REQUIREMENTS.md §5** | Start Chain steps: ingest requirements, PRD, plan, validate. This plan extends **ingest** (multiple uploads, Builder) and **how** we get to the chain (intent, project setup, fork/PR). |
| **Plans/newfeatures.md** | §4 Recovery (snapshot includes wizard step and intent). §8 Restore points (rollback to phase). §14 redb (resume interview). Intent and requirements handoff are new entry-point flexibility. |
| **Plans/assistant-chat-design.md** | Requirements Doc Builder **is** the Assistant chat with a specific handoff contract. Add subsection or reference: "Requirements Doc Builder: generate requirements and hand off to Chain/Interview." |
| **Plans/interview-subagent-integration.md** | Adaptive phases (§6) extend the interview: add "Phase selection and depth by intent and context." Subagents and phase assignments unchanged; only which phases run and depth. |
| **Plans/orchestrator-subagent-integration.md** | Config and tier config apply to runs started from any intent. No change to tier/subtask execution; only how we **enter** the flow (intent, requirements, project setup). |
| **Plans/Project_Output_Artifacts.md** | Single source of truth for required user-project artifacts under `.puppet-master/project/` (requirements, contracts, `plan.md`, sharded `plan_graph/`, acceptance manifest, and `auto_decisions.jsonl`) and canonical seglog persistence contract. |
| **Plans/agent-rules-context.md** | Application and project rules apply to Assistant (Builder), Interview, and orchestrator. Same rules pipeline for all. |
| **Plans/WorktreeGitImprovement.md** | Branch naming, PR creation, worktree lifecycle. Fork creation and "PR start/finish" are **additional** GUI and flow steps; reuse branch/PR tooling where possible. |
| **Plans/MiscPlan.md** | Git ignore, no secrets in PR body, cleanup allowlist. `.puppet-master/requirements/` (staging) and `.puppet-master/project/` (canonical outputs) must be allowlisted. |
| **Plans/usage-feature.md** | No direct change; usage tracking applies to Builder, Interview, and orchestrator runs as today. |
| **Plans/Provider_OpenCode.md** | OpenCode appears as a first-class provider in tier config. No wizard flow changes; provider selection is managed in Settings. |
| **Plans/newtools.md** | MCP and tools apply to Assistant and Interview; Builder can use same tool set. |

---

## 9. Gaps and Potential Problems

### 9.1 Flow and State

- **Intent change mid-flow:** If user switches intent after entering requirements or interview, we need a clear policy: reset requirements and interview state, or prompt and allow keep/discard. Recommend: "Changing intent will clear requirements and interview progress; continue?" and then reset.
  **Resolution:** Show modal: "Changing intent will clear requirements and interview progress. Continue?" [Continue] [Cancel]. On Continue: clear requirements list, canonical path, Builder handoff flag, interview state; set wizard step to project setup; keep project_path and intent (new value). On Cancel: close modal, no change.

- **Recovery with intent:** Recovery snapshot (newfeatures §4) must include `intent` and `wizard_step` so we don't restore to "New project" when the user was in "Contribute (PR)."
  **Resolution:** Recovery snapshot schema includes `intent` (enum) and `wizard_step` (step index or id). Restore logic uses these when rehydrating; never default to New project when snapshot has Contribute (PR).

- **Builder and Interview in one session:** If user opens Builder, hands off, then we go to Interview, ensure project path and intent are still set when Interview starts (no stale "no project" state).
  **Resolution:** On handoff from Builder, persist project_path and intent in the same state used by Interview. When transitioning to Interview step, pass or read that state; Interview initialization must not overwrite with empty/default. Add assertion or guard: if handoff occurred, project_path and intent are required.

### 9.2 Requirements and Builder

- **Multiple uploads + Builder:** If we allow both "upload 2 files" and "Builder output," merge order and precedence must be defined (e.g. uploads first, Builder last, or "Builder replaces" for MVP).
  **Resolution:** Merge order: uploaded files first (in list order), then Builder output appended. Single canonical doc = merge(uploads, builder_path) → path. Precedence: later in merge order wins on conflicting sections if we do semantic merge; for MVP concatenate with section separators and document "uploads first, Builder last."

- **Builder output format:** Template for Builder output (sections, headings) should be defined so PRD generator and Interview can rely on structure. Otherwise we risk inconsistent parsing.
  **Resolution:** Define and document a single Builder output template: required top-level sections (e.g. Scope, Goals, Out of scope, Acceptance criteria, Non-goals). Assistant/Builder prompt and any post-processing must emit this structure. PRD generator and Interview assume this template; add a validation step that warns if sections are missing.

- **Abandonment:** Builder opened but never "hand off" leaves requirements step incomplete. Consider timeout or "Cancel and return to requirements" with no save.
  **Resolution:** Provide explicit "Cancel and return to requirements" control (no save). Optionally: after a configured idle timeout (e.g. 30 minutes), show a prompt "Return to requirements without saving?" [Yes] [No]. No automatic save or handoff.

### 9.3 Interview and Phases

- **Phase selector failure:**

**Phase Selector Failure Fallback (Resolved):**
If the selector returns an invalid/empty plan or fails to respond:
1. Use the deterministic per-intent fallback from §6.3 (all phases Full for New/Fork/Enhance; Contribute = Scope + Architecture + Testing at Short depth).
2. Log the failure as a `phase_selector.fallback` seglog event with the original error and the normalized fallback plan.
3. Surface a warning in the interview UI: "Phase selection used fallback. You can manually adjust the phase checklist if needed."
4. Never synthesize an ad-hoc phase subset outside the canonical fallback table.
5. If fallback phases also fail to execute, surface an error to the user and halt the interview.

- **Depth semantics:** "Short" vs "full" depth must be defined per phase (e.g. "short = 1-2 questions") so the Interview agent has clear instructions.
  **Resolution:** Full = all questions for phase, research if configured. Short = max 2 questions for that phase, no research. Skip = do not run phase. Document in phase manager and interviewer prompt; enforce cap in phase runner (e.g. question count or token budget for Short).

- **Resume with adaptive phases:** If we add "resume interview" (newfeatures §14), stored state must include the **phase plan** so we don't re-run phase selection and change the set on resume.
  **Resolution:** Interview state (and/or `.puppet-master/interview/phase_plan.json`) stores `phase_plan`. On resume, load phase_plan from state and run only those phases/depths; do not call phase selector again.

### 9.4 GitHub and Fork/PR

- **Auth scope:** Fork creation and PR creation may require different scopes (e.g. `repo`, `workflow`). Document required scopes and surface "Permission denied" clearly.
  **Resolution:** Document required GitHub scopes (e.g. `repo` for fork/create/PR; add to Doctor/Setup or docs). On API permission errors, show user-facing message: "Permission denied: ensure GitHub token has repo (and workflow if needed) scope" with link to token settings.

- **Upstream default branch:** We assume upstream default branch is `main` or `master`; we should detect it (GitHub API: `GET /repos/{owner}/{repo}` → `default_branch`) when opening the PR so we target the correct branch.
  **Resolution:** Before opening PR, call GitHub API `GET /repos/{owner}/{repo}` and use the returned `default_branch` as PR target. Do not hardcode `main` or `master`.

- **Conflict with WorktreeGitImprovement:** Orchestrator may create worktrees and branches for nodes/packages; "Contribute (PR)" uses a single feature branch. Ensure we don't create a worktree that clashes with the user's feature branch.
  **Resolution:** Contribute (PR) flow uses the main clone's feature branch for user work. Node/package worktree orchestration (if any) uses separate worktrees or branches; document that PR branch is the user-facing branch and is not replaced by orchestrator worktrees. Implementation: PR branch is the checked-out branch in the single clone; worktrees for subtasks (if used) are distinct and do not replace the PR branch ref.

### 9.5 GUI and UX

- **Wizard length:** Adding intent selection and more project setup may make the wizard feel longer. Consider **progress indicator** (e.g. "Step 1 of N") and optional **skip** for advanced users.
  **Resolution:** Add a progress indicator showing current step index and total (e.g. "Step 2 of 6"). Skip-to-execution ("I already have requirements and prd.json") is deferred to a later phase; document as future work.

- **IDE-grade complexity risk:** The wizard may borrow selectively from IDEs and IDE-grade workspace/project models, but it must not import a high-complexity project shell that causes hangs, heavy navigation regressions, terminal-cwd friction, or cross-tool `/source-resolution` bugs.
  **Resolution:** Prefer legible project setup, file-tree ergonomics, and visible immediate `/test/share/apply` workflows over abstract flexibility; any cross-surface handoff must preserve the exact source, project, terminal cwd, and file context.

- **Agent activity and progress (§3.5):** Implement embedded **agent activity view** and **progress indicator** for Requirements Doc Builder and Multi-Pass Review.
  **Resolution:** Implement one shared "agent activity view" component (non-interactive, streaming). Use it on the requirements/wizard page for Builder and Multi-Pass Review (requirements), and on the Interview page for document creation and Multi-Pass Review (interview). Progress indicator shows current document/step and remaining count. Provide pause, cancel, resume; persist "in progress" in recovery so user sees "interrupted" and can resume or start over.
- **Agent activity pane (layout and a11y):** Minimum pane height: 120px when embedded in wizard or Interview. Max visible lines in stream: 500 (then virtualize or "Show older"). Use monospace font for stream content. Progress bar or status strip must have `aria-live="polite"` and `role="progressbar"` with `aria-valuenow` / `aria-valuemax` when determinate; announce state changes (e.g. "Review pass 2 of 3") to screen readers. Pause/Cancel/Resume buttons must be keyboard-focusable and have clear labels for assistive tech. When reduced-motion is preferred, do not animate progress bar fill; use instant updates.

- **Accessibility:** Intent selection and new buttons (Builder, Create fork, Open PR) must be keyboard-accessible and screen-reader friendly.
  **Resolution:** Use existing widget catalog and patterns; ensure focus order, labels, and ARIA where needed. All new controls must be focusable and activatable via keyboard; screen reader text for intent options and primary actions.

- **i18n:** New strings (intent labels, buttons, help text) should be in a place that supports future localization.
  **Resolution:** Put all new user-facing strings in a single module or resource file (e.g. `strings.rs` or locale files) keyed by id; no inline hardcoded strings in view code for these features.

### 9.6 Security and Safety

- **No secrets in handoff:** Requirements doc and Builder output must not be used to pass tokens or secrets; Interview and PR body must not include them (MiscPlan §3.6).
  **Resolution:** Builder and Interview do not accept or embed tokens/secrets in generated docs. PR body template (WorktreeGitImprovement/MiscPlan) must not include secrets; sanitize or exclude sensitive fields before opening PR. Add checklist item in implementation: no secrets in requirements doc, Builder output, or PR body.

- **Fork/PR from untrusted upstream:** We don't execute code from upstream; we only clone and create a branch.
  **Resolution:** Document clearly: we only clone and create a branch; we do not run upstream scripts or hooks during fork/clone. No execution of code from upstream; low risk. No code change required beyond documentation.

### 9.7 Summary of Gaps to Resolve in Implementation

- Define **merge order and precedence** for multiple uploads + Builder.
  **Resolution:** See §9.2 (merge order: uploads first, Builder last; canonical = merge result).

- Define **Builder output template** (sections).
  **Resolution:** See §9.2 (required sections: Scope, Goals, Out of scope, Acceptance criteria, Non-goals).

- Define **phase selector** output schema and **depth** semantics per phase.
  **Resolution:** See §6.3 (PhasePlanEntry, depth Full/Short/Skip, fallback by intent).

- Define **fallback** when phase selector fails.
  **Resolution:** See §6.3 and §9.3 (rule-based by intent, no re-invoke).

- Document **GitHub auth scopes** and **upstream default branch** detection.
  **Resolution:** See §9.4 (scopes in docs/Doctor; detect default branch via GitHub API `GET /repos/{owner}/{repo}`).

- Add **intent** and **wizard_step** to recovery snapshot.
  **Resolution:** See §9.1 (recovery schema includes intent and wizard_step).

- Define **"intent change mid-flow"** policy and UI.
  **Resolution:** See §9.1 (modal Continue/Cancel; clear requirements and interview state on Continue).

- Implement **agent activity view** and **progress indicator** (§3.5); **pause, cancel, resume** and recovery.
  **Resolution:** See §9.5 (single shared component, placement, pause/cancel/resume, recovery state).

---

## 10. Implementation Readiness Checklist

Before implementation, an implementation agent must complete or have clear specs for the following. Use this list to derive implementation tasks; order may be adjusted by dependency.

1. Add **WizardIntent** enum to app state: `NewProject | ForkAndEvolve | EnhanceRewriteAdd | ContributePr`.
2. Persist **intent** in wizard/app state and in recovery snapshot (with `wizard_step`).
3. Implement **merge_canonical_requirements(uploads, builder_path) → Path**: merge order uploads then Builder, write canonical doc, return path.
4. Add **phase_plan** to interview state schema (e.g. `.puppet-master/interview/phase_plan.json` or embedded in existing interview state file).
5. Define **PhasePlanEntry** (phase_id, depth: Full | Short | Skip) in types and JSON schema.
6. Implement **phase selector** input (intent, requirements_summary first 2000 chars, codebase_summary Option, has_gui Option) and output (normalized Vec<PhasePlanEntry> over the canonical 8-phase registry); call from pre-interview step.
7. Implement **rule-based fallback** when phase selector fails or returns empty (per-intent defaults from §6.3).
8. On **resume interview**, load phase_plan from state and do not re-run selector.
9. Add GUI checkbox **"Run all phases"** (default off); when on, ignore phase_plan and run all phases Full.
10. Add **phase checklist** (optional): list phases with checkboxes; unchecked = force-skip.
11. Enforce **depth semantics** in phase runner: Full = all questions + research; Short = max 2 questions, no research; Skip = omit.
12. **Intent change mid-flow:** modal "Changing intent will clear requirements and interview progress. Continue?" [Continue] [Cancel]; on Continue clear requirements list, canonical path, Builder handoff flag, interview state; set wizard step to project setup; keep project_path and intent (new value).
13. **Recovery:** Include intent and wizard_step in snapshot; restore without defaulting to New project when snapshot says Contribute (PR).
14. **Builder handoff:** Ensure project_path and intent are passed to Interview and not overwritten by empty/default.
15. **Builder output template:** Define required sections (Scope, Goals, Out of scope, Acceptance criteria, Non-goals); add validation warning if missing.
16. **Cancel Builder:** "Cancel and return to requirements" (no save); optional idle timeout with "Return to requirements without saving?" prompt.
17. **GitHub create repo:** Add GUI fields and GitHub API create-repo call with repo name, visibility, description, .gitignore template, license, default branch per §7.1.
18. **Fork:** "Create fork for me" (GitHub API fork endpoint) and "I'll create the fork myself" path/URL input; validate fork exists or path is valid repo.
19. **PR start:** Fork → clone → create feature branch; branch name input or suggest from requirements slug.
20. **PR finish:** Commit, push branch, open PR via GitHub API; detect upstream default branch via GitHub API (`GET /repos/{owner}/{repo}` → `default_branch`); prefill title/body from task; link to PR in UI.
21. **GitHub auth:** Document required scopes; surface "Permission denied" with token-scope message and link.
22. **Contribute (PR) vs worktrees:** Document and implement so PR branch is main clone's feature branch; orchestrator worktrees (if any) do not replace it.
23. **Agent activity view:** One shared non-interactive streaming component; use on requirements page (Builder, Multi-Pass Review) and Interview page (document creation, Multi-Pass Review).
24. **Progress indicator:** Current document/step and remaining count; pause, cancel, resume; persist "in progress" in recovery for resume or start over.
25. **Accessibility:** All new controls keyboard-accessible and screen-reader labeled; use widget catalog.
26. **i18n:** New strings in central module/resource file keyed by id.
27. **No secrets:** Sanitize requirements doc, Builder output, and PR body; checklist item for implementation.
28. **Document:** Fork/PR we only clone and create branch; no execution of upstream code.
29. **Required user-project artifacts:** Emit the canonical `.puppet-master/project/` artifact set exactly as specified in `Plans/Project_Output_Artifacts.md` (no local schema/path restatement).
30. **Plan graph materialization (sharded-only):** Treat `.puppet-master/project/plan_graph/index.json` + referenced `nodes/<node_id>.json` shards (optional `edges.json`) as the only canonical execution graph; `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is optional derived export only.
31. **Schema + field contracts:** Enforce `pm.project-plan-graph-index.v1` and `pm.project-plan-node.v1` requirements via SSOT/schema validation (do not duplicate field lists in this plan).
32. **Deterministic integrity:** Enforce SSOT deterministic node-ID + shard-hash integrity rules; no randomness and no nondeterministic ordering.
33. **Human-readable view:** Keep `.puppet-master/project/plan.md` mandatory as the operator-facing summary.
34. **Contract/acceptance coverage:** Enforce resolvable `ProjectContract:*` references and acceptance-manifest coverage via the dry-run validator.
35. **Canonical seglog persistence:** Persist required artifacts as full-content artifact events with deterministic chunking and final integrity hash, per SSOT.
36. **Filesystem materialization contract:** Treat filesystem files as reproducible projections of canonical seglog content.
37. **Contract seed pack (Builder):** When Requirements Doc Builder is used, write `.puppet-master/requirements/contract-seeds.md` and include it in Multi-Pass Review (§5.6). Treat it as staging input and reconcile it during the Contract Unification Pass (§6.6); do not treat it as the canonical Project Contract Pack.
38. **Contract Unification Pass:** Implement the deterministic unification step (§6.6) to materialize SSOT-defined canonical artifacts and ensure every plan node references at least one resolvable `ProjectContract:*`.
39. **Dry-run validator:** Run the SSOT-defined validator rules before execution begins; surface failures as gating errors (no manual verification).
40. **Builder opener:** Ensure first Builder Assistant message is the context-sensitive opener from §5.1 (new project / existing project / fork).
41. **Turn counter + 6-turn suggestion:** Implement completed-turn semantics (Assistant message + user response) and suggest generation when `completed_turns >= 6` or earlier if enough info exists; suggestion does not auto-generate.
42. **Checklist dual state:** Implement `builder_checklist_state.v1` and `builder_conversation_state.v1` and keep them synchronized.
43. **Qualifying questions:** Ask only for checklist sections marked `empty` or `thin` before generation.
44. **Post-generation confirmation:** Ask `Do you want to make any more changes or talk about it more?` before Multi-Pass/handoff.
45. **Three-location review:** After generation/revision, open in File Editor, show clickable canonical path, and show document pane entry; chat must not render full document bodies.
46. **Findings summary surfaces:** Show Multi-Pass findings summary in chat and in the wizard preview section before final approval.
47. **Single final approval gate:** Capture one final decision (`accept | reject | edit`) per Multi-Pass run with `findings_summary_shown=true` precondition.
48. **Document pane recovery:** Persist `document_pane_state.v1` and restorable `document_checkpoint.v1` so recovery restores selected document/view and approval stage.
49. **Auditor invariant loop (§12):** Implement as a post-Contract-Unification Auditor loop that audits the provisional project pack, applies bounded deterministic repairs where allowed, re-audits, and repeats until certified or stopped by a critical block/authority boundary.
50. **Initial audit cycle:** Verify all required `.puppet-master/project/` artifacts are generated, validate requirements-quality and canonical contract coverage, and emit an Auditor cycle report. Legacy `validation_pass_report` / Pass 1 fields may be mirrored only when `compatibility_only: true` and `cycle_report_ref` points to the Auditor cycle report.
51. **Bounded repair cycle:** Compare artifacts against Project Contract Pack and platform canonicals, apply allowed deterministic fixes, record findings, changes, diff_pointers, and unresolved findings, then re-audit. Legacy Pass 2 fields are compatibility aliases only.
52. **Certification/block cycle:** Enforce DRY/SSOT, plan graph integrity, wiring matrix, evidence/invariants, and deterministic decisions without modifying requirements.md, plan.md, or other user-intent-derived content. Legacy Pass 3 fields are compatibility aliases only.
53. **Auditor loop provider/model:** Read the single Auditor validation loop provider+model from app settings (see assistant-chat-design.md §26 and Models_System.md); apply deterministic defaults when not configured.
54. **Headless execution:** Auditor audit, bounded repair, and re-audit cycles MUST run headless with no GUI requirement and no user approval gates inside the loop.
55. **Failure surfacing:** Critical blocks, unresolved user-clarification needs, authority boundaries, or exhausted repair budgets stop the loop and surface unresolved findings while preserving the corrected-but-blocked artifact set.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/assistant-chat-design.md

---

## 11. User-Project Output Artifacts (Sharded-Only)

Interviewer/Wizard outputs for user projects MUST follow the canonical artifact, sharding, and persistence contract in `Plans/Project_Output_Artifacts.md`.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

This section is intentionally flow-specific and does not restate SSOT schema fields.

Flow-specific requirements:

- Uploads and builder output remain staging inputs under `.puppet-master/requirements/*`.
- Before Interview/start-chain execution, canonical promotion MUST write `.puppet-master/project/requirements.md`.
- Contract Unification Pass MUST materialize canonical outputs under `.puppet-master/project/` exactly per SSOT (contracts/index, `plan.md`, sharded `plan_graph/`, acceptance manifest, execution-time decisions/evidence, optional glossary).
- Canonical execution graph is sharded-only: `.puppet-master/project/plan_graph/index.json` + referenced `nodes/<node_id>.json` shards (optional `edges.json`).
- `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is optional derived export only (non-canonical; never required).
- When `has_gui` is true, generate `.puppet-master/project/ui/wiring_matrix.json` and `.puppet-master/project/ui/ui_command_catalog.json`, and ensure UI-scope nodes carry wiring-related `contract_refs`.
- Persist planning artifacts canonically in seglog; filesystem copies are regenerable projections.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

### 11.1 Plan-Graph Handling (Flow-Specific)

- Validators and orchestrator MUST use only the canonical sharded graph for scheduling/execution inputs.
- Field-level schema requirements, deterministic node-ID rules, contract/acceptance coverage, and evidence requirements are defined in `Plans/Project_Output_Artifacts.md` and enforced by the dry-run validator.
- If `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is materialized, validate it only as a consistency export; never treat it as canonical input.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

### 11.2 Autonomy + HITL (deterministic ambiguity handling)

- **Deterministic defaults:** When ambiguity remains, apply deterministic defaults per Decision Policy and record each automatic decision to `.puppet-master/project/auto_decisions.jsonl` (and canonically in seglog) with `{node_id, decision_id, chosen, reason, contract_refs[]}`.
- **HITL optional:** Nodes may require approvals (`tool_policy_mode = ask`) without blocking the entire run; if a node is waiting on approval, the scheduler continues other runnable nodes whose dependencies allow.

---

> **Compliance:** Follows `Plans/DRY_Rules.md`, `Plans/Contracts_V0.md`, and `Plans/Decision_Policy.md`. Naming: "Puppet Master" only. All decisions deterministic; no open questions.

ContractRef: Gate:GATE-001, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2

## 12. Auditor Invariant Loop (Mandatory Invariant Sweep)

### 12.1 Context

This section defines an **always-on mandatory Auditor invariant loop** that runs immediately after the Contract Unification Pass (§6.6) produces the **provisional** canonical project artifact pack. It is **separate** from the optional §5.6 Multi-Pass Review (which is user-facing and off by default). The invariant loop **cannot be disabled** and always runs even when other review features are present or enabled.

The Auditor loop enforces canonical system integrity, DRY/SSOT compliance, plan graph structural correctness, requirements-quality coverage, and deterministic decision logging without requiring human intervention or a running GUI. It repeats audit, bounded repair, and re-audit until the project pack is certified or a critical block, repair-budget limit, unresolved user-clarification need, or authority boundary stops the loop. Legacy Pass 1 / Pass 2 / Pass 3 names are compatibility aliases for older report fields only; they are not active process stages.

### 12.2 Auditor Audit-To-Repair Loop

Each Auditor cycle receives the artifact set as corrected by earlier cycles. The loop records findings, allowed repairs, unresolved findings, and certification/block status in Auditor cycle reports. `validation_pass_report`, `pass_number`, and legacy Pass 1 / Pass 2 / Pass 3 labels may be mirrored for import/export/search compatibility only when `compatibility_only: true` and `cycle_report_ref` points to the Auditor cycle report, but active scheduling and settings use Auditor loop cycle semantics.

---

#### Initial Audit Cycle

**Purpose:** Validate and complete the provisional artifact pack produced by Contract Unification. The initial audit cycle may materialize missing deterministic projections, but it is not the first author of requirements or contract fragments.

**Scope:** All required project artifacts under `.puppet-master/project/` per `Plans/Project_Output_Artifacts.md §2`.

**Produces:**
- The first validation snapshot of the provisional `.puppet-master/project/` pack, plus any missing deterministic projections required for the full package.
- An Auditor cycle report stored in seglog. Legacy exports may mirror `artifact_type: validation_pass_report` with:
  - `compatibility_only: true`
  - `cycle_report_ref`: reference to the canonical Auditor cycle report
  - `pass_number: 1`
  - `pass_name: "document_creation"`
  - `pass_verdict`: `"pass"`, `"fail"`, or `"skipped"`
  - `verdict_reason`: human-readable reason
  - `changes_applied_summary`: list of artifact paths written
  - `diff_pointers`: empty for the initial audit cycle when it records generation rather than correction
- A `requirements_quality_report` artifact (schema: `pm.requirements_quality_report.schema.v1`) stored at `.puppet-master/project/traceability/requirements_quality_report.json`: for each requirement, checks coverage against the Requirements Completion Contract (§14). The initial audit cycle report is **read-only** for requirements intent — it identifies issues and classifies each as `auto_fixable: true/false`. No edits to requirements intent are made in the initial audit cycle.

**Verdict rules:**
- Auditor cycle terminal status records whether all required artifacts were present or deterministically completed, failed validation, were skipped through a compatibility mirror, or stopped on a critical block.
- Legacy `pass_verdict` mirrors may use `"pass"`, `"fail"`, or `"skipped"` only when `compatibility_only: true` and `cycle_report_ref` links back to the canonical Auditor cycle report.

---

#### Bounded Repair And Canonical Alignment Cycle

**Purpose:** Checks requirements and plan artifacts against the Project Contract Pack and Puppet Master's internal canonical system references. Finds gaps and contradictions, proposes fixes, and applies those fixes to the artifact set.

**Scope:** The following artifacts are compared against the listed canonical references:

| Artifact | Canonical References |
|---|---|
| `requirements.md` | `ProjectContract:*` references, `Plans/Contracts_V0.md` |
| Contracts pack (`contracts/index.json` + entries) | `Plans/Contracts_V0.md`, `Plans/Architecture_Invariants.md` |
| `plan_graph/` nodes | `Plans/DRY_Rules.md`, `Plans/Architecture_Invariants.md` |
| `acceptance_manifest.json` | `Plans/Project_Output_Artifacts.md`, `Plans/Decision_Policy.md` |

**Actions:** For each gap or contradiction found:

1. Record in `findings[]`.
2. Apply fix to the relevant artifact.
3. Record fix in `changes_applied_summary` with a `diff_pointer` (artifact path + before/after summary).
4. When no fix is possible (e.g., an inherent conflict requiring product-level decision), record an entry in `unresolved_findings[]`.
5. Apply auto-fixes from the requirements quality report: for each issue in the `requirements_quality_report` where `auto_fixable == true`, apply the fix and record in `auto_fixes_applied[]`. Re-validate each fixed requirement after applying its autofix. Update the `requirements_quality_report` artifact in-place with the final post-fix state. If unresolved blocking issues remain after all autofixes, they are escalated via the semantics defined in §15; the bounded repair cycle does not escalate directly, it only updates the quality report artifact for certification/block handling.

**Produces:**
- Updated artifact set with all resolvable fixes applied.
- Auditor repair-cycle report stored in seglog. Legacy exports may mirror `validation_pass_report` fields:
  - `compatibility_only: true`
  - `cycle_report_ref`: reference to the canonical Auditor cycle report
  - `pass_number: 2`
  - `pass_name: "canonical_alignment"`
  - `findings[]`: list of all gaps and contradictions detected
  - `changes_applied_summary`: list of fixes applied, each with `diff_pointer`
  - `unresolved_findings[]`: items where no fix could be applied
  - `auto_fixes_applied[]`: list of requirement quality issues auto-fixed in this pass (each entry: `{ issue_id, criterion, fix_applied, diff_pointer }`)
  - `pass_verdict`: `"pass"`, `"fail"`, or `"skipped"`
  - `verdict_reason`: human-readable reason (including unresolved findings when fail)

---

#### Certification Or Critical-Block Cycle

**Purpose:** Focuses on final canonical system integrity before certification. **Never edits product requirements** (`requirements.md`, `plan.md`, or any user-intent-derived content). Only enforces structural and canonical invariants or blocks certification.

**Scope (normative — strictly limited to):**

- **DRY/SSOT compliance:** No platform data hardcoded outside `platform_specs`; no schema fields duplicated across artifacts.
- **Plan graph integrity:** `node_id` determinism; shard hash correctness (sha256 in `index.json` matches node file bytes); entrypoints resolve; edge consistency; `execution_ordering` completeness.
- **Wiring matrix (if GUI project):** `ui/wiring_matrix.json` and `ui/ui_command_catalog.json` present and internally consistent; every `UICommandID` referenced in plan nodes resolves in `ui_command_catalog.json`.
- **Evidence/invariants alignment:** Every plan node's `evidence_required.path` is consistent between the node shard and the acceptance manifest; acceptance `check_id`s are present in the manifest.
- **Deterministic decisions/autonomy compliance:** `auto_decisions.jsonl` entries conform to `Plans/auto_decisions.schema.json`; every ambiguity is logged; no human-required blocking decisions remain unresolved.

**Actions:**

- Flag canonical violations as `findings[]` entries. Legacy exports may preserve `pass_3_violation:` finding prefixes for compatibility.
- For structural violations that can be corrected **without touching product requirements** (e.g., a missing sha256 in `index.json`, a missing `UICommandID` entry in the catalog): apply the correction and record in `changes_applied_summary` with `diff_pointer`.
- For violations that require human input or product-level decisions: record an entry in `unresolved_findings[]` and set `pass_verdict` to `"fail"`.

**Produces:**
- Final artifact set with all structural corrections applied.
- Auditor certification-cycle report stored in seglog. Legacy exports may mirror `validation_pass_report` fields:
  - `compatibility_only: true`
  - `cycle_report_ref`: reference to the canonical Auditor cycle report
  - `pass_number: 3`
  - `pass_name: "canonical_systems"`
  - `findings[]`: list of all pass-3 canonical violations detected
  - `changes_applied_summary`: list of structural corrections applied, each with `diff_pointer`
  - `unresolved_findings[]`: violations requiring human or product-level resolution
  - `pass_verdict`: `"pass"`, `"fail"`, or `"skipped"`
  - `verdict_reason`: human-readable reason

> **Invariant (normative):** The Auditor certification cycle MUST NOT modify `requirements.md`, `plan.md`, or any artifact whose content is driven by user intent or product scope. It enforces structural/canonical invariants, certifies the pack, or stops on a critical block.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/chain-wizard-flexibility.md

---

### 12.3 Execution Model

- Auditor loop cycles run **deterministically without human intervention** until certification or critical block.
- Each cycle runs **headless** — no GUI is required; no user approval gate exists inside the loop.
- Audit, bounded repair, and re-audit cycles run serially over the corrected artifact set until certified or blocked.
- The Auditor validation loop provider and model are configurable once for the whole sweep (see `Plans/assistant-chat-design.md §26` and `Plans/Models_System.md`); defaults are deterministic and safe when not explicitly configured.
- Each Auditor cycle report MUST include `provider` and `model` values matching the resolved Auditor validation loop provider/model from loop start (see `Plans/assistant-chat-design.md §26` and `Plans/Project_Output_Artifacts.md §10.2`). Legacy `validation_pass_report` exports mirror the same values.
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/Models_System.md
- One or more Auditor cycle reports are emitted per sweep. Legacy three-pass report rows may be produced only for compatibility/search/import and must not drive active scheduling.
- The **final project artifacts** reflect all corrections applied by bounded repair cycles before certification or block.
- **If the initial audit fails without an allowed deterministic repair:** the loop stops and surfaces the failure.
- **If a repair cycle ends with non-empty `needs_user_clarification[]`:** transition the wizard to the clarification/resume path and preserve the corrected-but-blocked artifact set for resume.
- **If certification fails** for unresolved findings, authority boundaries, or critical blocks: surface the blocker and preserve all resolvable fixes already applied.

Artifact distinction (normative):

- `needs_user_clarification[]`: questions the wizard needs answered by the user before proceeding. Schema: `{ question_id, question_text, context, priority, category }`
- `unresolved_findings[]`: issues discovered during analysis that could not be auto-resolved. Schema: `{ finding_id, finding_type, description, severity, suggested_resolution?, blocking: bool }`

These are distinct artifacts. `needs_user_clarification` drives the interview UI; `unresolved_findings` drives the review/resolution UI.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Project_Output_Artifacts.md

### 12.4 Acceptance Criteria (normative)

The following criteria are required for a conformant implementation of this workflow:

- [ ] Auditor loop cycles run deterministically without human intervention until certified or critically blocked.
- [ ] Each cycle can be executed headless (no GUI required; no approval gates inside the loop).
- [ ] Certification cycles never edit `requirements.md`, `plan.md`, or user-intent-derived content; they only enforce canonical system integrity, certify, or block.
- [ ] Each cycle emits an Auditor cycle report stored in seglog; legacy `validation_pass_report` / Pass 1 / Pass 2 / Pass 3 rows are compatibility aliases only with `compatibility_only: true` and `cycle_report_ref`.
- [ ] The loop emits enough reports to prove audit, repair, re-audit, and terminal certification/block status; it does not require exactly three active process stages.
- [ ] The final project artifacts reflect all corrections applied by bounded repair cycles.
- [ ] A single Auditor loop provider + model selection is exposed in the GUI settings (see `Plans/assistant-chat-design.md §26`).

### 12.5 SSOT References (DRY)

| Concern | SSOT Reference |
|---|---|
| Artifact paths and artifact types | `Plans/Project_Output_Artifacts.md` |
| Platform contracts | `Plans/Contracts_V0.md` |
| Architecture invariants | `Plans/Architecture_Invariants.md` |
| DRY rules | `Plans/DRY_Rules.md` |
| Decision policy | `Plans/Decision_Policy.md` |
| Auditor loop provider/model settings GUI | `Plans/assistant-chat-design.md §26` |
| Auto-decisions schema | `Plans/auto_decisions.schema.json` |
| UI wiring rules and schema | `Plans/UI_Wiring_Rules.md`, `Plans/Wiring_Matrix.schema.json` |

---

ContractRef: Plans/Project_Output_Artifacts.md#POA-045

Required fields:
- workflow_run_id
- phase_plan_ref
- staged_bundle_ref
- requirements_quality_report_ref
- run_id

Canonical terms and values:
- workflow_run_id
- phase_plan_ref
- staged_bundle_ref
- requirements_quality_report_ref
- run_id

Labels:
- Auditor cycle report
- validation pass report compatibility mirror

Behavioral rules:
- Auditor cycle reports must emit lineage-rich report records that can explain what was evaluated and what execution was seeded; legacy validation pass reports may mirror this lineage for compatibility only.
- `pass_verdict` must support `skipped`.

Permission carry-through:
- effective runtime identity must survive validation into launch handoff
## 13. No-Wizard Project Management Flows

Full specification for these flows is in `Plans/GitHub_Integration.md §D`. This section provides the chain-wizard-flexibility cross-reference and entry-point wiring.

ContractRef: Plans/GitHub_Integration.md §D, Plans/DRY_Rules.md, Plans/Decision_Policy.md

### 13.1 Overview

Three project management flows are available that do **not** require the Chain Wizard. Users can reach them from the File menu → "Project" or from the Dashboard. All three flows surface a "Run Chain Wizard later" affordance on their finish screen, pre-loading the wizard with the newly added/created project context.

| Flow | Entry point | Git repo | GitHub API required |
|------|------------|----------|-------------------|
| Add Existing Project | File → Add Existing Project | Optional (auto-detected) | Optional (link only) |
| Create New Local Project | File → New Project → Local Only | Optional (default: on) | No |
| Create New GitHub Repo + Project | File → New Project → On GitHub | Created on GitHub | Yes (device-code) |

### 13.2 Add Existing Project (no wizard)


- Entry: File menu → "Add Existing Project" OR Dashboard → "Add Project"
- User selects a local folder (native OS picker) OR picks an SSH remote + path
- Puppet Master auto-detects: git repo presence, language/framework, suggested project name
- Optional: "Link to GitHub" (device-code auth if needed)
- Finish: project opens in File Manager + editor; "Run Chain Wizard later" button
- Full spec: Plans/GitHub_Integration.md §D.1

ContractRef: Plans/GitHub_Integration.md §D.1, Plans/GitHub_API_Auth_and_Flows.md

### 13.3 Create New Local Project (no wizard)

- Entry: File menu → "New Project" → "Local Only" OR Dashboard → "New Project"
- Inputs: project name, parent folder, git-init toggle (default on), optional language/framework preset
- Finish: project created and opened; "Run Chain Wizard later" button
- Full spec: Plans/GitHub_Integration.md §D.2

ContractRef: Plans/GitHub_Integration.md §D.2

### 13.4 Create New GitHub Repo + Project (no wizard)

- Entry: File menu → "New Project" → "On GitHub" OR Dashboard → "New Project" → "On GitHub"
- Requires `github_api` auth (device-code launched inline if not yet authed)
- Inputs: repo name, description, visibility (default Private), README/gitignore/license toggles, local clone path
- Puppet Master creates GitHub repo via API and clones locally
- Finish: project added and opened; "Run Chain Wizard later" button
- Full spec: Plans/GitHub_Integration.md §D.3

ContractRef: Plans/GitHub_Integration.md §D.3, Plans/GitHub_API_Auth_and_Flows.md

### 13.5 "Run Chain Wizard Later" Affordance

All three flows show a `Run Chain Wizard later` button on their finish screen. Clicking it:
- dispatches the canonical wizard-launch command from the no-wizard flow (`Plans/GitHub_Integration.md`)
- navigates to the Chain Wizard / Interview flow
- pre-fills project context (name, path, language, GitHub remote if linked)
- restores a persisted deferred payload after restart when the wizard was not launched immediately

Default preload mapping:
- **Add Existing Project** → `EnhanceRewriteAdd`
- **Create New Local Project** → `NewProject`
- **Create New GitHub Repo + Project** → `NewProject`

Deferred payload minimum fields:
- `wizard_id`
- `launch_source`
- `default_intent`
- `project_name`
- `project_path`
- `detected_language_frameworks[]`
- `remote_repo_ref` (if linked/created)
- `created_repo_but_clone_failed` flag for recovery/error copy

The wizard opens at **Project Setup review**, not at a blank intent picker, when launched from a deferred payload.

This satisfies the requirement that no wizard step is mandatory for basic project setup. The wizard remains the recommended path for AI-assisted requirements gathering; it is not the only path.

ContractRef: Plans/chain-wizard-flexibility.md §1 (intent-based workflows), Plans/GitHub_Integration.md §D

---

## 14. Requirements Completion Contract

> **Compliance:** Normative and machine-checkable. Follows `Plans/Decision_Policy.md §6` for unknown resolution. Naming: "Puppet Master" only.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/requirements_quality_report.schema.json, PolicyRule:Decision_Policy.md§6

This section defines the minimum criteria every requirement MUST satisfy before it can leave the Chain Wizard/Interview phase. The Auditor invariant loop (§12) enforces these criteria automatically: the initial audit identifies issues, bounded repair cycles apply deterministic fixes where possible, and certification blocks or escalates remaining blocking issues per §15.

Each requirement MUST satisfy ALL of the following coverage criteria:

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§6

---

### C-1: Scenario Coverage

- At minimum: **1 positive (happy-path) scenario** + **1 negative/failure scenario**
- Scenarios must be in structured form: `{given, when, then}` or equivalent
- Blocking issue type: `missing_scenarios`

---

### C-2: Boundary Declaration

- Explicit **in-scope** statement (what the feature covers)
- Explicit **out-of-scope** statement (what is explicitly excluded)
- May not use deferred placeholder text (for example: "later" or unresolved marker text), or similar deferral language
- Blocking issue type: `missing_boundary`

---

### C-3: Implementation Anchor

At least one of:

- A `ProjectContract:*` reference that pins the implementing spec
- An explicit "research node required" annotation (which creates a blocking research node in the plan graph before implementation can start)

Blocking issue type: `missing_anchor`

---

### C-4: Executable Verification

- At least one acceptance check command path that will appear in the acceptance manifest
- Format: `verify: <command-or-gate-id>` inline in the requirement, OR referenced via a named verification gate (`Gate:GATE-XXX`)
- Blocking issue type: `missing_acceptance`

---

### C-5: Unknown Resolution

All unknowns must become either:

- **(a) A blocking research node** — creates a graph dependency; implementation cannot start until research resolves it
- **(b) A deterministic auto-decision** — only when it is truly a choice between equally valid options, not missing user intent (see `Plans/Decision_Policy.md §6`)

Open unknowns that do not fit (a) or (b) MUST become `needs_user_clarification[]` entries in the quality report.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§6

Blocking issue type: `missing_research` (for unresolved unknowns)

---

### 14.1 Quality Report Artifact

The `requirements_quality_report` artifact produced during the initial Auditor audit cycle (§12) captures the per-requirement evaluation against C-1 through C-5. After bounded repair autofixes, the report is updated in-place. Schema: `pm.requirements_quality_report.schema.v1` (`ContractName:Plans/requirements_quality_report.schema.json`).

Key fields:

| Field | Description |
|---|---|
| `verdict` | Overall report verdict: `PASS` \| `FAIL` |
| `requirements_touched[]` | Requirement IDs inspected in this quality analysis pass |
| `issues[]` | Detected issues (`issue_id`, `category`, `requirement_id`, `severity`, `auto_fixable`, etc.) |
| `auto_fixes_applied[]` | Deterministic fixes applied in bounded Auditor repair cycles (each references `issue_id` and `requirement_id`) |
| `needs_user_clarification[]` | Clarification questions that require user input (each references `issue_id` and `requirement_id`) |

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/requirements_quality_report.schema.json

### 14.2 Deterministic report shaping

The `requirements_quality_report` artifact MUST be stable across equivalent reruns.

Deterministic shaping rules:
- `requirements_touched[]` MUST follow canonical requirement order from `requirements.md`.
- `issues[]` MUST be ordered by `(requirement_id, category, description)` using normalized lexicographic comparison.
- `issue_id` values MUST be emitted as zero-padded ordinals in report order: `ISS-0001`, `ISS-0002`, ...
- `auto_fixes_applied[]` MUST be ordered by referenced `issue_id`; `fix_id` values MUST be emitted as `FIX-0001`, `FIX-0002`, ...
- `needs_user_clarification[]` MUST be ordered by referenced `issue_id`; `question_id` values MUST be emitted as `Q-0001`, `Q-0002`, ...
- Re-running the Auditor audit and bounded repair loop with unchanged requirement content and unchanged user answers MUST preserve byte-stable ordering for these arrays.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Invariant:INV-005, PolicyRule:Decision_Policy.md§2

---

## 15. Requirements Quality Escalation Semantics

> **Compliance:** Follows §14 (Requirements Completion Contract) and §12 (Auditor Invariant Loop). Naming: "Puppet Master" only. All decisions deterministic.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md

This section defines how blocking issues in the `requirements_quality_report` that are not resolved by bounded Auditor repair autofixes are surfaced to the user. The Auditor certification cycle (§12) never edits product requirements; instead it reads the quality report and triggers the escalation path defined here.

---

### 15.1 Escalation Trigger

Escalation fires when:

- `needs_user_clarification[]` in the final (post-Pass-2) `requirements_quality_report` is **non-empty**

No escalation fires if all blocking issues were resolved by bounded Auditor repair autofixes.

---

### 15.2 Wizard State Transition

When escalation fires:

- Wizard state becomes: `attention_required`
- The "Proceed" / "Start Run" button is disabled
- A lock icon or warning badge appears on the wizard step that triggered the issue

The wizard returns to its normal state only when all `needs_user_clarification[]` entries are answered and the Auditor audit/repair loop re-runs with the user's answers injected to produce a quality report with `verdict: "PASS"` and `needs_user_clarification[]` empty.

---

### 15.3 UI Surfaces (Mandatory — Both Required)


#### Surface 1: Thread Badge + In-Thread Clarification Message

In the relevant chat thread (the thread for this chain/wizard instance), a system message is posted with:

- `type: "clarification_request"`
- `questions[]`: the full `needs_user_clarification[]` array from the quality report
- `wizard_step`: the exact step name/ID that triggered the issue
- `resume_url`: deep-link to resume the wizard at that step

The thread list entry for this thread shows a badge (count of unanswered questions).

#### Surface 2: Dashboard CtA Card

A card appears on the Dashboard under a dedicated "Attention Required" section:

| Card Field | Value |
|---|---|
| `title` | `"Requirements need your input"` |
| `reason` | Human-readable summary of the blocking issues |
| `wizard_id` | ID of the wizard instance |
| `wizard_step` | Name/ID of the step that triggered escalation |
| `question_count` | Count of unanswered questions |
| `resume_url` | Deep-link to resume the wizard at the blocked step |

Card actions:

- **"Resume Wizard"** — deep-links to the wizard at the blocked step
- **"View in Thread"** — opens the thread where the clarification_request message was posted

The Dashboard card is dismissed automatically when all questions are answered and wizard state returns to non-`attention_required`.

---

### 15.4 Clarification Payload Storage

- The `requirements_quality_report` artifact is stored at:
  `.puppet-master/project/traceability/requirements_quality_report.json`
- The wizard record (in the app database) gains a field `attention_required_report_path` pointing to the latest quality report file
- When the user answers all clarification questions, the wizard is re-run through the Auditor audit/repair loop with the answers injected; the canonical quality report file is regenerated at the same path and `attention_required_report_path` is updated to that canonical path

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md, Plans/Project_Output_Artifacts.md

### 15.5 Clarification round cap

A clarification cycle is one complete sequence of:
1. a report with non-empty `needs_user_clarification[]`,
2. user answer submission,
3. automatic re-run of the Auditor audit/repair loop.

The maximum clarification cycles for one wizard instance is **3**.

- Cycles 1-2: the wizard remains in the active clarification path when follow-up questions remain.
- After cycle 3 still produces non-empty `needs_user_clarification[]`, wizard state becomes `blocked`.
- `blocked` disables "Proceed" and "Start Run" exactly like the clarification hold state, but the UI copy MUST explain that repeated clarification attempts did not resolve the requirements set.
- In `blocked`, Puppet Master MUST preserve the latest canonical quality report and MUST NOT auto-rewrite requirements further without new explicit user input.
- User override: the UI MUST offer an explicit override to continue with a manual user decision only when the user acknowledges the remaining risk and the downstream gate permits override for that category. That override must be recorded as evidence.
ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

### 15.6 Shared questionnaire alignment

Wizard clarification uses the shared `question` / `/questionnaire` contract and `QuestionItem` item shape rather than a wizard-local prompt schema or wizard-local status model.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

Alignment rules:
- one clarification request may hold one `QuestionItem` or many `QuestionItem` entries in the shared questionnaire envelope
- the wizard consumes `QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values}` without adding wizard-only field names
- `question_id` remains stable across thread, wizard, and stored report state
- per-question display text is `question`; `prompt` is allowed only on the envelope/header side and must not become the per-question field
- `source?: "option" | "other" | "freeform"` may be mirrored when wizard answer payloads preserve answer origin
- required questions gate submit, and missing required answers keep the shared question-card flow incomplete
- dismiss pauses the flow and resume restores the outstanding questionnaire from PM-managed `draft_value` / draft state or its submitted outcome; the wizard does not invent alternate `status` or draft/resume names
## Requirements Builder Persona Strategy Addendum (2026-03-06)

This addendum defines Persona behavior for the Requirements Builder / chain wizard flow.

### Builder stages requiring explicit Persona strategy


Requirements Builder and related wizard generation/review work should distinguish at least these stages:
- intake / clarification
- drafting
- domain-specialized fragment generation
- quality review
- final review / multi-pass review

### Default stage Personas

Wizard-stage defaults:

- **Interview stage:** uses the interview persona.
- **Planning stage:** uses the planning / architect persona.
- **Execution stage:** uses the executor persona.
- **Review stage:** uses the reviewer persona.

These are the default persona assignments for top-level wizard stages. Builder-specific substage defaults remain defined below for drafting and review internals.

### Deterministic Builder Persona resolver

Requirements Builder MUST resolve Personas in this order:

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors

1. explicit stage/pass override for the current Builder execution, if present
2. configured stage/pass mapping from Builder Persona settings
3. stage default from this addendum
4. `general-purpose` as the final fallback when no valid mapping/default is available

Additional rules:
- Intake/clarification MUST bias toward `collaborator` unless the user explicitly overrides it.
  ContractRef: ContractName:Plans/Personas.md
- Review passes MUST NOT silently reuse the drafting Persona when a reviewer Persona mapping exists.
  ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
- Automatic resolution may return only IDs valid in `persona_registry` (`Plans/Personas.md` §7).

### Builder Persona config contract
### Review-pass identifier contract

`review_pass_personas` MUST use canonical ordinal keys:

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors

- `pass_1`
- `pass_2`
- `pass_3`
- `pass_4`
- `pass_5`

Rules:
- Keys map to the numbered Multi-Pass Review passes configured for the Builder run.
- If a configured run uses fewer passes than a stored key set, extra keys are ignored.
- If a run uses more passes than are explicitly mapped, unmapped passes fall back to the deterministic reviewer-selection rules in §5.6.
- GUI labels may display `Pass 1`, `Pass 2`, etc. only when labeling legacy/imported Multi-Pass Review compatibility rows; new active UI copy uses reviewer-pass ordinal wording, and persistence MUST use the canonical key names above.
- `review_pass_personas` maps review passes only; the final synthesis/writer step remains governed by the Builder workflow and is not implicitly overwritten by reviewer-pass mappings.

Builder Persona settings MUST persist a canonical config object with at least:

ContractRef: ContractName:Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors, ContractName:Plans/Personas.md

- `mode` (`manual | auto | hybrid`)
- `stage_personas` (map of Builder stage -> Persona ID)
- `review_pass_personas` (map of pass identifier -> Persona ID)
- optional per-mapping platform/model overrides
- optional explicit override for the next eligible Builder execution

This config is the runtime backing store for the mapping editor required by `Plans/FinalGUISpec.md` §17.8.

### Builder requested/effective runtime visibility contract

For every Builder stage/pass execution, persist and expose:
- `requested_persona`
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `effective_platform`
- `effective_model`
- `applied_persona_controls[]`
- `skipped_persona_controls[]`
- `requested_model_provider_id` / `effective_model_provider_id` when provider-specific runtime IDs are available alongside the resolved requested/effective model record

Builder activity/status UIs may render this compactly, but they MUST use the same canonical requested/effective record as other surfaces.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/FinalGUISpec.md

#### 1. Intake / clarification
Default Persona: `collaborator`

Behavior:
- asks clarifying questions,
- engaged and collaborative,
- suggests options and tradeoffs,
- more willing to talk than execution Personas.

#### 2. Drafting
Default Persona: workflow-resolved drafting Persona. `technical-writer` MAY be used only when retained as an available specialty or explicitly configured for the Builder drafting stage; otherwise the resolver falls through the configured mapping and final `general-purpose` fallback above. Drafting MUST NOT require or recreate a protected core `document-writer` Persona.

#### 3. Domain-specialized fragment generation
Use domain or language Personas as needed, for example:
- `security-engineer`
- `devops-engineer`
- `ux-researcher`
- `rust-engineer`
- `frontend-developer`

#### 4. Quality review
Default Persona: `requirements-quality-reviewer`

#### 5. Final review / Multi-Pass
Use reviewer Personas such as:
- `requirements-quality-reviewer`
- `code-reviewer`
- `security-auditor`
- `architect-reviewer`

### Per-stage and Auditor-loop platform/model control

Requirements Builder settings must allow platform/model selection per stage. Validation sweep pass reports use the single Auditor validation loop provider/model from `Plans/assistant-chat-design.md §26`, and these settings must still pass through provider capability filtering.

### Requested vs effective visibility


Requirements Builder UI should display:
- effective Persona,
- selection reason,
- effective platform/model,
- and skipped unsupported Persona controls for the active builder stage or Auditor loop.

### Acceptance criteria addendum

- Requirements Builder must support Persona selection by stage/pass.
- Collaborator is the default intake/clarification Persona.
- Drafting does not require a protected core Document Writer; `technical-writer` is specialty-scoped and may be used only when retained/configured for that stage.
- Reviewer Personas are distinct from drafting Personas for review passes.
- Builder UI must expose effective Persona/model/platform and any skipped unsupported Persona controls.

## 17. Assistant / Deep Plan Escalation into Chain Wizard (2026-03-08)

### 17.1 Purpose

This section defines how Assistant Chat and Deep Plan escalate larger feature/enhancement work into the Chain Wizard / Interview flow without losing already-collected context.

The goal is to avoid cold-starting the interviewer when substantial planning or scoping already happened in chat.

### 17.2 Recommendation sources

The Chain Wizard recommendation may originate from:
- Assistant Chat natural-language detection of feature/enhancement / major-change intent
- Deep Plan post-plan escalation check
- explicit user request to move the work into the wizard/interview flow

Recommendation semantics:
- recommendation is user-facing and optional
- the user may accept or decline
- decline keeps the user in the current chat/planning flow with no hidden redirect

### 17.3 Handoff target intent

When the recommendation is accepted for feature/enhancement work, the canonical target intent is:

- `EnhanceRewriteAdd`

This remains true even when the user entered via the friendlier CTA copy **Add a new Feature or Enhancement**.

A typed handoff payload MUST be created when Assistant Chat or Deep Plan launches the Chain Wizard.
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Project_Output_Artifacts.md

Required fields:
- `handoff_source` (`assistant_chat` | `deep_plan`)
- `handoff_reason` (deterministic enum; examples: `feature_request`, `major_change`, `deep_plan_recommendation`, `user_explicit`)
- `origin_thread_id`
- `origin_message_id`
- `default_intent`
- `project_id` when available
- `project_path` when available
- `user_goal`
- `requirements_summary`
- `scope_summary`
- `codebase_summary`
- `has_gui_hint`
- `plan_artifact_ref` when available
- `plan_todo_snapshot[]`
- `open_questions[]`
- `assumptions[]`
- `chat_excerpt_refs[]`

Optional but useful fields:
- `recommended_phase_hints[]`
- `effective_persona`
- `effective_platform`
- `effective_model`

ContractRef: Plans/assistant-chat-design.md#29.4 Accepting the recommendation: handoff to Chain Wizard / Interview

Required fields:
- node_id
- attempt_id
- lane_id
- package_id
- execution_role
- effective_account_id
- operational_identity
- workflow_run_id
- run_id

Canonical terms and values:
- auditor_cycle_report
- cycle_report_ref
- compatibility_only
- node_id
- attempt_id
- lane_id
- package_id
- execution_role
- effective_account_id
- operational_identity
- validation_pass_report (legacy mirror only)
- workflow_run_id
- run_id

Labels:
- validation lineage

Behavioral rules:
- Wizard handoff must carry runtime attribution and validation lineage explicitly rather than by implication.

Permission carry-through:
- effective account and execution role must survive wizard handoff payloads
### 17.5 Wizard state additions

`ChainWizardState` (or equivalent persisted state) should gain fields sufficient to preserve this handoff.

Required additions:
- `assistant_handoff_ref`
- `assistant_handoff_source`
- `assistant_handoff_reason`
- `imported_plan_ref`
- `imported_has_gui_hint`
- `imported_context_summary_ref`

Rules:
- these fields are persisted for recovery/resume
- they are auditable and user-visible
- they do not replace canonical requirements/interview artifacts; they seed them

### 17.6 Launch behavior after user acceptance

If current project context is already known:
- open the Chain Wizard in a preloaded `EnhanceRewriteAdd` path with imported assistant/deep-plan context available immediately
- land in the requirements/interview-ready path rather than a blank intent picker

If project context is still missing:
- open the Chain Wizard with imported context preserved
- land on the project-setup review path first

In both cases:
- show that the wizard was opened from Assistant Chat / Deep Plan
- keep imported context visible/auditable
- imported bundles must preserve `redaction_state`, `truncation_state`, and omission metadata rather than flattening evidence quality during wizard handoff
- allow the user to continue into the interview with the imported materials in scope

### 17.7 Interview behavior after handoff

The Interview flow still owns scoping and adaptive phase selection.

Required behavior:
- phase 0 scope probe still runs; imported assistant context does not bypass it
- the interviewer receives the imported handoff bundle before the first question
- the imported plan, when present, acts as additional context rather than as an already-approved project artifact
- the phase selector uses imported context as input but the normalized `phase_plan` remains the source of truth

### 17.8 Adaptive phase-pruning guidance for imported feature/enhancement work

The adaptive phase selector already exists and must continue to apply across **all** chain-wizard intents, not only the new feature/enhancement CTA.

Deterministic guidance for imported feature/enhancement handoffs:
- if `has_gui = false` or strong evidence indicates **no UI impact**, `product_ux` should default to `Skip` unless the user explicitly asks for UX/UI work
- if the imported context indicates **no data/persistence change**, `data_persistence` should default to `Short` or `Skip`
- if the imported context indicates **no deployment/environment impact**, `deployment_environments` should default to `Short` or `Skip`
- `testing_verification` should remain at least `Short` for feature/enhancement work unless the change is purely non-functional documentation with no runtime effect
- imported plan recommendations may suggest phase hints, but the local phase-manager normalizer remains authoritative

This pruning logic applies to:
- `NewProject`
- `ForkAndEvolve`
- `EnhanceRewriteAdd`
- `ContributePr`

### 17.9 Acceptance criteria

- The Chain Wizard exposes `Add a new Feature or Enhancement` as entry copy while still mapping to canonical intent `EnhanceRewriteAdd`.
- Accepting an Assistant/Deep Plan recommendation launches the Chain Wizard with a structured imported handoff payload.
- Imported context survives recovery/resume.
- The interviewer does not start cold; it receives imported context before questioning begins.
- The mandatory scope probe still runs after handoff.
- Adaptive phase pruning continues to apply across all intents and can skip `product_ux` when the imported scope is clearly non-GUI.

## Clarification Escalation and Draft Decomposition Addendum (2026-03-08)

### 1. Canonical wizard state correction

See canonical `wizard_status` definition in §2.1.

### 2. attention_required vs blocked

Required distinction:
- `attention_required`: the current clarification cycle can continue; answering the current questions may unblock progress
- `blocked`: clarification rounds are exhausted or otherwise cannot progress automatically; the system must preserve the latest report and stop auto-rewrite/auto-advance until new explicit user input is provided
- For Debug investigation handoff, a budget trip may surface as `failed` or `attention_required` depending on whether user recovery is meaningful, but the machine-readable `stop_reason_code` remains `investigation.budget_exhausted` and MUST carry `budget_kind`.

Required `blocked` rules:
- `Proceed` and `Start Run` remain disabled
- UI copy must explicitly explain that repeated clarification attempts did not resolve the issue set
- the latest canonical quality report remains preserved
- no further automatic rewrite of requirements may happen without new explicit user input

### 3. Dashboard / thread / resume behavior


The wizard packet must support both:
- `wizard_attention_required`
- `wizard_blocked`

Required shared fields:
- `wizard_id`
- `wizard_step`
- `report_ref`
- `resume_url`
- `thread_id?`
- `status`

### 4. Draft decomposition degradation boundary

This wizard/interview planning surface owns the pre-canonical degradation allowance.

Required rule:
- if adaptive decomposition or dependency extraction produces invalid/cyclic output before canonical graph lock, the system may degrade to deterministic flat draft sequencing
- such degradation must emit warning evidence and a degradation record
- once the canonical sharded graph is locked, no silent degradation is allowed

### 5. Acceptance criteria

- `blocked` appears everywhere `wizard_status` is canonically defined.
- Wizard blocked and attention_required use distinct semantics and user copy.
- Resume/deep-link behavior works for both states.
- Draft decomposition degradation is allowed only before canonical graph lock and is evidence-backed.
## Draft Decomposition Fallback / Wizard Blocked-State Addendum (2026-03-09)

Wizard planning and draft decomposition must align with the runtime packet.

### Draft fallback boundary
Deterministic flat draft fallback is allowed only before graph lock. The fallback output MUST be tagged as degraded draft structure, emit warning evidence, and preserve the reason for degradation.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md

### Post-lock integrity rule
After graph lock, invalid canonical decomposition is a blocking integrity problem, not a graceful fallback case. The wizard MUST stop forward execution and surface a repair/replan path.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/interview-subagent-integration.md

### Wizard state contract additions
Persist:
- `attention_required_reason`
- `blocked_reason_code`
- `decomposition_degraded` boolean
- degradation reason
- active `replan_generation`
- attempted recovery actions

### UX rule
The wizard must differentiate:
- clarification still pending (`attention_required`)
- blocked on user correction / auth / approval / integrity (`blocked`)
- degraded but still usable draft structure before lock
## Canonical Wizard Blocked-State Canonical Alignment (2026-03-09)

See canonical `wizard_status` definition in §2.1.

### Escalation rule
Remain in `attention_required` while the current clarification/review loop can still resolve the issue set inside the current flow.

Escalate to `blocked` when either condition is met:
- `clarification_round_count` reaches `3` without clearing the blocking issues, or
- the next required action can no longer be completed inside the current flow (for example auth recovery, explicit user correction outside the inline form, or replan approval)

### Persisted blocked fields
Persist:
- `blocked_reason_code`
- `clarification_round_count`
- `latest_quality_report_ref`
- `resume_url`
- `attempted_recovery_actions[]`
- `decomposition_degraded`
- degradation reason
- active `replan_generation`
## Wizard Escalation Degradation and Blocked-State Consolidation Addendum (2026-03-09)

This section defines canonical Wizard Blocked Lifecycle.

### Canonical `wizard_status`
See canonical `wizard_status` definition in §2.1.

### Canonical blocked state
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
A wizard blocked record MUST persist:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `clarification_round_count`
- `report_ref`
- `resume_url?`
- `decomposition_degraded`
- `degradation_reason?`
- `replan_generation?`
- `attempted_recovery_action_ids[]`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### Blocked clear rule
A wizard leaves `blocked` only when:
- materially new user input creates a new issue set
- the external prerequisite named by `blocked_reason_code` is actually resolved
- a new `replan_generation` begins for the wizard context
- the wizard is cancelled

Reopening the same blocked wizard without one of those changes does not clear blocked state and does not reset `clarification_round_count`.
## Canonical Wizard Blocked Lifecycle


### Canonical `wizard_status`
See canonical `wizard_status` definition in §2.1.

### Canonical blocked state
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
A wizard blocked record MUST persist:
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md
- `wizard_id`
- `wizard_step`
- `blocked_reason_code`
- `clarification_round_count`
- `report_ref`
- `resume_url?`
- `decomposition_degraded`
- `degradation_reason?`
- `replan_generation?`
- `attempted_recovery_action_ids[]`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### Blocked clear rule
A wizard leaves `blocked` only when:
- materially new user input creates a new issue set
- the external prerequisite named by `blocked_reason_code` is actually resolved
- a new `replan_generation` begins for the wizard context
- the wizard is cancelled

Reopening the same blocked wizard without one of those changes does not clear blocked state and does not reset `clarification_round_count`.
## Wizard Status Enum Correction Addendum

### Canonical `wizard_status` enum

See canonical `wizard_status` definition in §2.1.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

## Runtime Identity, Route, and Audit Refinement Rules

Wizard planning output must carry the same runtime identity fields consumed by execution and storage owners. `Contracts_V0.md`, `Contracts_V0`, `Executor_Protocol.md`, `Executor_Protocol`, `Prompt_Pipeline.md`, `Prompt_Pipeline`, `storage-plan.md`, `storage-plan`, and `/storage` references require `node_id`, `package_id`, `seam_id`, `lane_id`, `attempt_id`, `effective_identity`, node-identity, and tier-identity reconciliation. `workflow_run_id` may link sweep passes, but the wizard must also preserve enough `/model` and `/runtime` context to explain which wizard/runtime state produced a sweep and what later execution it seeded.

Audit refinement passes are canonical only when their exact counters and lineage are preserved. `supersedes_prior`, wave-one, `gap-007`, `gap-003`, `gap-004`, `gap-005`, exact-missing, consumer-propagation, blocker-family, affected-doc, broken-anchor, zero-finding, sixty-two, fifty-four, `canon_inventory`, `canon_inventory.json`, `Ledger Condenser`, restore points, `Plans/WorktreeGitImprovement.md`, `/WorktreeGitImprovement.md`, follow-up waves, planning_blockers, `planning_blockers = 0`, fix_backlog_items, `fix_backlog_items = 8`, total_gaps, `total_gaps = 8`, docs_affected, `docs_affected = 20`, underlying_gap_evidence_count, and `underlying_gap_evidence_count = 62` are audit values, not broad summary labels.

Audit lineage that sets `supersedes_prior` can refine unresolved items without clearing material blockers: later condensation must keep the compact blocker bundle aligned to sharper live-doc evidence. `bundle-level` precision remains explicit when `gap-001` was under-reporting Interview as an affected consumer, when `gap-004` needs a Usage drill-through anchor recorded as exact-missing, and when `gap-008` removes an overstated exact-missing item while tightening identity-carrythrough. `gap-005` is resolved by the versioned blocked-packet payload contract carrying packet identity, blocker reason, source stage/surface, target action, affected inputs/outputs, actor/runtime_identity, lane/account/project/worktree scope, permission/capability impact, recoverability, required user/agent action, evidence refs, retry/override policy, stale/expiration behavior, and UI display/interaction requirements. Source model-pass labels such as `GPT-5.3-Codex` are preserved as audit lineage for carrying the full tranche into the final pass, not as wizard runtime model requirements.

Early broader-second-sweep and jumbo-doc read labels are likewise audit lineage for coverage breadth, not wizard runtime states or generated project artifacts.

`Plans/Provider_OpenCode.md` and `/Provider_OpenCode.md` remain `/session` identity correction references. The planning-to-runtime handoff carries `wizard_step`, `blocked_reason_code`, `clarification_round_count`, `report_ref`, `replan_generation`, `/degraded`, execution-unit context, and account/role linkage. The remaining exact breakage is owner-routing plus field `/command/schema` mismatch, not a new broad conceptual seam.

FinalGUISpec thread search and wizard blocked state must normalize to shared route payloads. `FinalGUISpec.md` result clicks are search-local prose until they become normalized route payloads; `resume_url`, `attention_required`, `blocked`, `blocked_reason_code`, `allowed_action_ids`, and `allowed_action_ids[]` are shared by Chat, Interview, and Wizard. Thread archival `/deletion`, attempts `/generations`, blocked `/recovery` records, wizard blocked state, and annotation lifecycle `open -> addressed -> resolved` remain distinct lifecycle vocabularies.

Gate-registry integrity must keep `GATE-007`, `GATE-008`, `GATE`, and `/reserved` tombstone handling visible. `GATE-012` must not collapse `attention_required` and true wizard `blocked` escalation into one evidence path; `attention_required` needs a persisted shape parallel to `blocked_notice`, append-only corrections, `/interview` alignment, and machine-verifiable expectations.

Project-level attention summaries stay compact: show one `primary attention reason` or `primary blocked reason`, plus an optional count badge for additional issues, rather than trying to summarize every problem. Owner clarity matters as much as field choice; if execution-core ownership is not explicit before reconciling UI, `/storage/help`, Usage, Authentication, or Orchestrator seams, the same seam reopens under different names.

Selectors are typed. `wizard_step` and `usage_event_ref` are not primary selectors; `object_kind = wizard`, `object_id = <wizard_id>`, `object_id`, `wizard_id`, `/detail`, and serialized `resume_url` carry wizard resume detail. `target_kind = primary_view`, `project_id = <project_id>`, `thread_id = <thread_id>`, `primary_view`, and `/step` restore wizard or thread focus without preserving unrelated current surface state.

Persona and attention models must stay explicit. Overseer personas are settings-owned roles; worker personas/provider/model remain overrideable through `/provider/model` and `/type`. Historical mode disables live pause/resume/cancel, live retry/remediation, approval `/recovery`, and commands that mutate current runtime state. Severity semantics are `info`, `warning`, `attention_required`, `blocked`, and `system_notification`: `info` stays in-app local `/history`, `warning` can use an in-app banner `/card/badge`, `attention_required` means user input helpful `/needed`, `blocked` is action-blocking until a required `/precondition` changes, and `system_notification` is an out-of-app signal.

Usage and command schemas must use first-class runtime objects: `/usage`, `/graph`, `seam_id`, `lane_id`, `tier_id`, `package_id`, `attempt_id`, `node_id`, `/commands`, and governance hooks. Non-wizard routes must follow the same model: `FinalGUISpec.md` / `Plans/FinalGUISpec.md` cards such as `Resume Wizard`, `View in Thread`, and CtA cards restore through shared navigation objects rather than special-case fields. Deep links keep `URL`, `puppet-master://wizard/`, `//wizard/`, `puppet-master`, `/thread`, and `resume_url` as serialized anchors, not as a separate routing schema.

Wizard planning and `/document` systems are subject-first: the first-class identity is the staged or `/generated` artifact, and the filesystem path is a later materialization or backing-document assignment.

Route targets carry enough subfocus for the destination, not just "open object X": Node Graph may need detail-panel or subsection focus, document panes may need history or approval-stage context, wizard resume may need a step plus clarification focus, chat or `/thread` search may need a specific message, and file opens may need line `/range`. The concrete wizard clarification deep-link remains `puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify`; its `puppet-master`, `wizard_id`, `wizard_step_id`, `//wizard/`, `/step/`, and `/clarify` components are serialized anchors. Wizard/thread blocked records preserve `/runtime` identity where applicable on `wizard_id`, `wizard_step`, and `thread_id`, while short cards may deep-link to Usage, `/Authentication/Orchestrator`, or other owner surfaces rather than repeating their full data.

Wizard/interview output must converge on graph-native planning. `chain-wizard-flexibility` and `chain-wizard-flexibility.md` produce plan-graph output for Orchestrator/GUI consumption, while older `/Task/Subtask/Iteration` and `/Interview` vocabulary is compatibility context. The compact status model is `Activity`: `idle | running | paused | queued | background_active`; `Attention`: `none | attention_required | blocked | degraded`; and `Health`: setup `/config/repo` integrity. Conversational `/document-production` surfaces expose runtime-identity, effective-runtime, effective platform `/model`, skipped-control disclosure, `/pass` stage context, `/task/runtime` identity in-thread, and requested/effective visibility fields.

Provider/account identity fields remain concrete: `effective_auth_mode`, `effective_account_id`, `effective_project_id`, and `operational_identity`. Cross-surface explanation must account for `/work-type` biases without dumping internals. Shared actions include `Show in Usage`, `Show in Ledger`, `Resume Wizard`, message deep links, `wizard_id`, `wizard_step`, `message_id`, `artifact_id`, `document_id`, and `usage_event_ref`. Coverage notes preserve re-audited, six-pass, `39`, `22`, `Plans/*.md`, and top-level counts without treating them as planning blockers.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/chain-wizard-flexibility.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CWF-001 - Chain Wizard & Interview Flexibility Source-Preserving Bridge Retired

```yaml
plan_unit_id: CWF-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The former doc-level source-preserving bridge is retired in place after Phase
  2B atomized chain-wizard-flexibility-S0001 through
  chain-wizard-flexibility-S0154 into CWF-002 through CWF-147. CWF-001 remains
  only as migration lineage for the retired bridge span and must not re-own
  atomized source coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage and no longer owns GUI or product behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- CWF-001 no longer uses the source-preserving PlanUnit compile hint.
- Prior source coverage remains carried by CWF-002 through CWF-147.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
- Coverage for the retired bridge is recorded in the Phase 2B batch 021 coverage map.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
- Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0011
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0012
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0013
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0014
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0015
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0016
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0017
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0018
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0019
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0020
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0021
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0022
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0023
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0024
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0025
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0026
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0027
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0028
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0029
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0030
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0031
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0032
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0033
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0034
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0035
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0036
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0037
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0038
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0039
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0040
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0041
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0042
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0043
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0044
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0045
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0046
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0047
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0048
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0049
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0050
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0051
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0052
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0053
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0054
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0055
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0056
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0057
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0058
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0059
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0060
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0061
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0062
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0063
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0064
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0065
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0066
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0067
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0068
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0069
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0070
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0071
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0072
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0073
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0074
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0075
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0076
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0077
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0078
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0079
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0080
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0081
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0082
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0083
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0084
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0085
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0086
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0087
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0088
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0089
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0090
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0091
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0092
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0093
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0094
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0095
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0096
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0097
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0098
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0099
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0100
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0101
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0102
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0103
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0104
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0105
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0106
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0107
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0108
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0109
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0110
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0111
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0112
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0113
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0114
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0115
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0116
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0117
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0118
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0119
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0120
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0121
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0122
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0123
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0124
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0125
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0126
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0127
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0128
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0129
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0130
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0131
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0132
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0133
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0134
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0135
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0136
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0137
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0138
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0139
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0140
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0141
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0142
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0143
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0144
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0145
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0146
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0147
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0148
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0149
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0150
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0151
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0152
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0153
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
- Chain Wizard & Interview Flexibility -- Intent-Based Workflows
- Change Summary
- Plan Document Status
- Rewrite alignment (2026-02-21)
- SSOT references (DRY)
- 'ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, PolicyRule:Decision_Policy.md§1'
- Executive Summary
- Table of Contents
- 1. Intent-Based Workflows
- 1.1 New Project (greenfield)
- 1.2 Fork & Evolve
- 1.3 Enhance / Rewrite / Add (existing project, new to Puppet Master)
- 1.4 Contribute (PR)
- 1.5 Summary Table
- 2. How Intent Affects the Flow
- 2.1 Wizard State Shape
- 2.2 Canonical wizard runtime state
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/GitHub_Integration.md'
- 'ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/interview-subagent-integration.md, Primitive:SessionStore'
- 'ContractRef: Plans/Project_Output_Artifacts.md#POA-045, Plans/Project_Output_Artifacts.md#11.1 `traceability/requirements_quality_report.json` (machine-readable), Plans/Prompt_Pipeline.md#6.4 Effective resolution record'
- 2.3 Wizard Cancellation Cleanup
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md'
- 3. GUI Updates
negative_constraints:
- '- Wizard/interview flows consume runtime `budget-outcome` names and usage snapshot fields only after `Plans/Contracts_V0.md` confirms the `/schema` surface stays stable across `Plans/Run_Modes.md`, `Plans/usage-feature.md`, and `Plans/orchestrator-subagent-integration.md`; this document must not min'
- The `wizard_status` enum is the wizard's own lifecycle. Builder bundle state, agent activity run state, and executor node status are separate state families and MUST NOT be conflated with `wizard_status`.
- For blocked wizard persistence, canonical fields use `wizard_status = blocked` with `blocked_reason_code`. Legacy blocked field names such as `is_blocked`, `blocked_info`, `blocked_state`, and `blocked_episode_ref` are non-canonical aliases and MUST NOT be introduced in new wizard state.
- '- Secrets or credential-bearing GitHub URLs MUST NOT be persisted in wizard state; store redacted remote metadata + credential-store account refs only.'
- '- Builder may read/write requirements-stage fields only; it must not mutate GitHub setup fields except via explicit wizard actions.'
- '- Pass reports must not masquerade as run, node, or attempt records.'
- '**Pause, cancel, resume:** Provide **pause**, **cancel**, and **resume** as user options during Multi-Pass Review and during document generation (Builder, Interview). **Pause:** Takes effect at **next handoff boundary** (no new subagents spawned; in-flight subagents complete and report; review agent'
- '**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled -- last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.'
- '- **Contract Layer seed pack (Builder output; staging only):** `.puppet-master/requirements/contract-seeds.md`. This is an input to the interview’s contract unification pass (§6.6) and MUST NOT be treated as the canonical project contract pack (which lives under `.puppet-master/project/contracts/`; '
- '| **Non-goals** | What we are not trying to achieve. |'
- '| **Constraints** | Hard constraints (versions, platforms, compliance, budgets, forbidden deps) that must be enforced downstream. |'
- '- Do not ask follow-up questions for sections already marked `filled`.'
- 9. When all docs are Approved/Done and there are no open annotations, enable **Run Final Review**. Do not auto-run.
- '**Hard rule:** `Resubmit with Annotations` MUST NOT trigger Multi-Pass Review.'
- '- MUST NOT trigger Multi-Pass Review'
- '- Execution nodes must reference project contracts via `contract_refs: ["ProjectContract:..."]` (resolvable via `contracts/index.json`) and must not embed contract content inline.'
- '- **Skip:** Do not run phase questions, research, or document generation for that phase.'
- '**Resolution:** On handoff from Builder, persist project_path and intent in the same state used by Interview. When transitioning to Interview step, pass or read that state; Interview initialization must not overwrite with empty/default. Add assertion or guard: if handoff occurred, project_path and i'
- '**Resolution:** Define and document a single Builder output template: required top-level sections (e.g. Scope, Goals, Out of scope, Acceptance criteria, Non-goals). Assistant/Builder prompt and any post-processing must emit this structure. PRD generator and Interview assume this template; add a vali'
- '**Resolution:** Before opening PR, call GitHub API `GET /repos/{owner}/{repo}` and use the returned `default_branch` as PR target. Do not hardcode `main` or `master`.'
- '- **IDE-grade complexity risk:** The wizard may borrow selectively from IDEs and IDE-grade workspace/project models, but it must not import a high-complexity project shell that causes hangs, heavy navigation regressions, terminal-cwd friction, or cross-tool `/source-resolution` bugs.'
- '- **No secrets in handoff:** Requirements doc and Builder output must not be used to pass tokens or secrets; Interview and PR body must not include them (MiscPlan §3.6).'
- '**Resolution:** Builder and Interview do not accept or embed tokens/secrets in generated docs. PR body template (WorktreeGitImprovement/MiscPlan) must not include secrets; sanitize or exclude sensitive fields before opening PR. Add checklist item in implementation: no secrets in requirements doc, Bu'
- '**Resolution:** See §9.2 (required sections: Scope, Goals, Out of scope, Acceptance criteria, Non-goals).'
compatibility_only_notes:
- '- 2026-02-25: Hardened §12 cross-doc contract consistency with `Plans/Project_Output_Artifacts.md §10.2`: normalized pass report field names and enums (`pass_name`, `pass_verdict`, `verdict_reason`, `findings[]`, `unresolved_findings[]`), replaced legacy wording (`pass_report`, `verdict`, `violation'
- '- **Interview:** **Lighter** than full product or delta: focus on feature scope, acceptance criteria, and compatibility with upstream (e.g. style, tests). Many phases skipped or collapsed; AI decides.'
- For blocked wizard persistence, canonical fields use `wizard_status = blocked` with `blocked_reason_code`. Legacy blocked field names such as `is_blocked`, `blocked_info`, `blocked_state`, and `blocked_episode_ref` are non-canonical aliases and MUST NOT be introduced in new wizard state.
- '**Pause/cancel/resume UI:** Place **Pause**, **Cancel**, and **Resume** in a single control row (toolbar or footer of the agent activity pane). Order: Pause | Resume | Cancel. When running: show Pause and Cancel (Resume disabled). When paused: show Resume and Cancel (Pause disabled). **Cancel** must'
- '- `Resubmit with Notes` is a legacy UI label for the same targeted pass; it consumes open durable annotations, or a user-selected subset, and maps the output into the `open -> addressed -> resolved` lifecycle.'
- '- Compatibility note: legacy source references to `phase.config.max_questions` normalize to `interview.phases.{phase_name}.max_questions` or the global `interview.max_questions_per_phase`; they do not define a separate phase-config schema.'
- '- **If Pass 2 ends with non-empty `needs_user_clarification[]`:** transition the wizard to the clarification/resume path, emit Pass 3 as `skipped`, and preserve the corrected-but-blocked artifact set for resume.'
- '### 15.2 Wizard State Transition'
- Wizard/interview output must converge on graph-native planning. `chain-wizard-flexibility` and `chain-wizard-flexibility.md` produce plan-graph output for Orchestrator/GUI consumption, while older `/Task/Subtask/Iteration` and `/Interview` vocabulary is compatibility context. The compact status mode
stale_retired_dispositions:
- '**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled -- last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.'
- '- Revision input records also preserve `anchor.text_position`, `anchor.text_quote`, bounded `selected_text`, `provenance` (`path`, `source_surface`, bounded excerpt), `conflict_state`, and `staleness_state`.'
- '- Conflicting or stale mutating annotations are excluded from automatic revision until resolved'
- '- Remaining non-blocking buckets are tagged explicitly as `/future-phase`, `/risk`, `/providers`, `/conflicts`, `revision-prompt`, `thread-target`, `send-to-chat`, `sensitivity-aware`, `/stale`, and `/degradation`.'
- '- **Builder and Interview in one session:** If user opens Builder, hands off, then we go to Interview, ensure project path and intent are still set when Interview starts (no stale "no project" state).'
owner_boundary_notes:
- '> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.'
- '- 2026-02-25: Added §12 Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep): always-on, headless, post-Contract-Unification-Pass pipeline (Pass 1: Document Creation; Pass 2: Docs + Canonical Alignment; Pass 3: Canonical Systems Only). Separate from optional §5.6 Multi-Pass Review. P'
- '- 2026-02-24: Updated user-project **Project Contract Pack + executable artifacts** under `.puppet-master/project/**` to make the plan graph **sharded-only and canonical** (`.puppet-master/project/plan_graph/`); removed any requirement that `.puppet-master/project/plan_graph.json` is required/canoni'
- '- 2026-02-23: Added Contract Layer handoff section near Requirements Doc Builder/Interview describing Platform vs Project contracts, contract seeds, contract unification, and DRY contract-ID references (SSOT: `Plans/Project_Output_Artifacts.md`).'
- '- 2026-02-23: Added explicit dry-run validator acceptance requirements for contract-ref resolvability and acceptance-manifest coverage (SSOT: `Plans/Project_Output_Artifacts.md` Validation Rules).'
- '- 2026-02-23: Updated requirements semantics so `.puppet-master/requirements/*` remains staging while canonical downstream requirements are promoted to `.puppet-master/project/requirements.md`.'
- '- "Canonical requirements" artifacts should be treated as first-class **artifacts** in the event stream and projection layer'
- '## SSOT references (DRY)'
- '- Canonical contracts: `Plans/Contracts_V0.md`'
- '- Canonical terms: `Plans/Glossary.md`'
- '- **§4:** Requirements: multiple uploads, merge/canonical input, storage.'
- '- **§11:** User-project output artifacts (sharded-only canonical graph).'
- 12. [Auditor Invariant Loop (Mandatory Invariant Sweep)](#12-auditor-invariant-loop-mandatory-invariant-sweep) (legacy three-pass anchor is a compatibility alias only)
- '- **Entry:** User selects "Fork & evolve." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user (via GitHub HTTPS API; see `Plans/GitHub_API_Auth_and_Flows.md`), or the user can create the fork themselves and point us at the fork path or URL.'
- '- **Entry:** User selects "Contribute (PR)." We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user, or they can create it themselves and point us at their fork.'
- Thread lifecycle references in this wizard/Interview plan use the canonical thread states `active`, `attention_required`, `blocked`, `completed`, and `failed`; permanent thread removal is a `delete` action with confirmation, and `archive` is not a thread lifecycle state.
- '### 2.2 Canonical wizard runtime state'
- '/// Upstream repo: URL or "owner/repo".'
- '/// Single canonical path: merged result. Interview and start chain read only this.'
- '| `wizard_status` | enum | See canonical `wizard_status` definition below. |'
- '| `phase_plan_ref` | path/null | Canonical persisted phase-plan location used by resume and audit. |'
- '| `remote_repo_ref` | object/null | Credential-safe remote reference (`owner`, `repo`, `host`, `clone_transport`, `clone_url_redacted`) for GitHub/fork flows. |'
- '**Canonical `wizard_status` definition (normative):**'
- requirements,       // requirements upload, Requirements Doc Builder, or canonical requirements merge is active
owner_hints:
- Plans/chain-wizard-flexibility.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

### CWF-002 - Document Compliance, Status, and Rewrite Alignment

```yaml
plan_unit_id: CWF-002
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Chain Wizard & Interview Flexibility remains a plan-only canonical workflow
  document that follows DRY/Contracts/Decision Policy requirements and aligns
  wizard, Interview, Assistant, artifact, event-stream, projection, and Slint
  implementation semantics with the rewrite without changing user-visible flow.
gui_related: true
gui_classification_reason: The covered spans include GUI and flow changes plus Slint UI implementation alignment.
split_recommended: false
depends_on: []
unblocks: [CWF-003, CWF-004, CWF-010]
acceptance_criteria:
  - The document preserves Puppet Master naming and deterministic-default compliance.
  - The plan-only status is preserved and does not imply code changes.
  - Wizard, Interview, and Assistant orchestration target the unified event model.
  - Canonical requirements remain first-class artifacts in the event stream and projection layer.
  - UI implementation details are re-expressed in Slint, not Iced, without changing user-visible flow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: rewrite_alignment
reasoning_tier: standard
context_scope: wizard_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: chain_wizard_document_compliance_rewrite_alignment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0004
preserved_exact_tokens:
  - "Chain Wizard & Interview Flexibility -- Intent-Based Workflows"
  - "PLAN DOCUMENT ONLY"
  - "No code changes have been made"
  - "unified event model"
  - "seglog ledger"
  - "first-class artifacts"
  - "Slint"
  - "not Iced"
negative_constraints:
  - "Do not treat this plan document as an implementation patch."
  - "Do not change user-visible flow while re-expressing UI implementation details in Slint."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-003 - Change Summary and SSOT Guardrails

```yaml
plan_unit_id: CWF-003
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The change summary and SSOT guardrails preserve validation pass field names,
  sharded-only user-project plan graph output, GitHub HTTPS API-only operations,
  provider/OpenCode references, output artifact ownership, and the prohibition
  on minting fresh budget-outcome schema deltas.
gui_related: true
gui_classification_reason: The covered change-summary span includes GUI provider selection, settings, wiring artifacts, and GUI-conditioned project contract pack behavior.
split_recommended: false
depends_on: [CWF-002]
unblocks: [CWF-004, CWF-016]
acceptance_criteria:
  - Validation pass field names and enum names remain normalized to Project_Output_Artifacts ownership.
  - User-project plan graph output remains sharded-only under .puppet-master/project/plan_graph/.
  - No user-project Plans/ assumption is introduced.
  - GitHub operations follow Spec Lock and GitHub auth/API flow owners.
  - Wizard/interview flows do not mint fresh budget-outcome event or schema deltas.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ssot_drift
reasoning_tier: high
context_scope: cross_doc_contracts
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: chain_wizard_change_summary_ssot_guardrails
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0005
preserved_exact_tokens:
  - "pass_name"
  - "pass_verdict"
  - "verdict_reason"
  - "findings[]"
  - "unresolved_findings[]"
  - "validation_pass_report"
  - ".puppet-master/project/plan_graph/"
  - "plan_graph.monolithic.json"
  - "no user-project `Plans/` assumption"
  - "Spec_Lock.json#locked_decisions.github_operations"
  - "budget-outcome"
negative_constraints:
  - "Do not require or canonicalize .puppet-master/project/plan_graph.json."
  - "Do not mint a fresh event/schema delta for budget-outcome surfaces."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-004 - Executive Scope and Navigation

```yaml
plan_unit_id: CWF-004
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The plan scope and navigation preserve intent-based workflows, GUI/flow
  support, requirements uploads and Builder handoff, adaptive Interview, project
  setup and GitHub/fork/PR flow, no-wizard flows, validation workflow, and
  readiness checklist navigation.
gui_related: true
gui_classification_reason: The covered summary and table of contents describe GUI and flow changes, user-visible entry points, and navigation sections.
split_recommended: false
depends_on: [CWF-002, CWF-003]
unblocks: [CWF-005, CWF-010, CWF-018]
acceptance_criteria:
  - The four workflow intents remain visible in scope.
  - Requirements uploads, Requirements Doc Builder, adaptive Interview, GitHub setup, fork, and PR flows remain in scope.
  - Sections 12 and 13 remain navigable for mandatory validation and no-wizard flows.
  - DRY references to platform specs, GUI catalog, rules pipeline, git/worktree, subagent registry, and Assistant/Interview UI patterns remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_navigation_drift
reasoning_tier: standard
context_scope: wizard_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_executive_scope_navigation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0007
preserved_exact_tokens:
  - "Intent-based workflow definitions"
  - "GUI and flow changes"
  - "Requirements Doc Builder"
  - "Adaptive interview phases"
  - "Project setup and GitHub"
  - "Three-Pass Canonical Validation Workflow"
  - "No-Wizard Project Management Flows"
  - "Change Summary"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-005 - Intent Model Overview and Summary Matrix

```yaml
plan_unit_id: CWF-005
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The wizard and Interview support four distinct intents, with each intent changing requirements framing, Interview depth, upstream/fork handling, and resulting PRD or plan shape as shown in the summary matrix.
gui_related: false
gui_classification_reason: Intent taxonomy and outcome matrix are workflow model requirements; user-facing GUI labels are covered by later GUI sections.
split_recommended: false
depends_on: [CWF-004]
unblocks: [CWF-006, CWF-007, CWF-008, CWF-009, CWF-010]
acceptance_criteria:
  - The four intents remain New project, Fork & evolve, Enhance/rewrite/add, and Contribute (PR).
  - Each intent can alter setup questions, requirements framing, Interview depth, and outcome shape.
  - The summary matrix preserves upstream/fork, requirements framing, Interview depth, and outcome columns.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_model_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_intent_model_overview
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0013
preserved_exact_tokens:
  - "four distinct intents"
  - "Upstream/fork?"
  - "Requirements framing"
  - "Interview depth"
  - "Outcome"
  - "Full product"
  - "Delta"
  - "Feature/fix scope"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-006 - New Project Intent

```yaml
plan_unit_id: CWF-006
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: New Project supports greenfield products or codebases from scratch, with optional new directory initialization, optional GitHub repo creation, full-product requirements, full adaptive Interview, and full PRD/plan outcome.
gui_related: false
gui_classification_reason: This span defines intent semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012]
acceptance_criteria:
  - New project remains the greenfield intent.
  - Project path may be empty or a new directory to initialize.
  - Requirements are full-product requirements rather than delta requirements.
  - Interview may use all phases while still adapting to scope signals.
  - Outcome is new repo, full PRD, full plan, then execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_semantics
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_new_project_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0009
preserved_exact_tokens:
  - "New Project"
  - "greenfield"
  - "Start a new product or codebase from scratch"
  - "Full product interview"
  - "New repo"
  - "full PRD and plan"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-007 - Fork & Evolve Intent

```yaml
plan_unit_id: CWF-007
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Fork & Evolve supports derivative work from an upstream repo, offers GitHub HTTPS API fork creation or user-provided forks, frames requirements and Interview as delta/evolution, and produces a delta PRD/plan over upstream.
gui_related: false
gui_classification_reason: This span defines fork/evolution workflow semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012, CWF-015]
acceptance_criteria:
  - Upstream repo may be supplied as URL or owner/repo.
  - Puppet Master offers to create the fork through GitHub HTTPS API or accepts a user-created fork.
  - Requirements describe what to add or change in the fork.
  - Interview is framed as delta/evolution and adapts phase depth to context.
  - Outcome is fork plus delta PRD/plan then execution on the fork.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fork_flow_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: chain_wizard_fork_evolve_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0010
preserved_exact_tokens:
  - "Fork & evolve"
  - "upstream repo"
  - "URL or `owner/repo`"
  - "offer to create the fork"
  - "GitHub HTTPS API"
  - "delta/evolution"
  - "delta PRD"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-008 - Enhance / Rewrite / Add Intent

```yaml
plan_unit_id: CWF-008
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Enhance, Rewrite, or Add supports existing projects new to Puppet Master, uses an existing project path without requiring a fork, frames requirements and Interview as scoped delta work, scans the current codebase for context, and executes in the existing project directory.
gui_related: false
gui_classification_reason: This span defines existing-project intent semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012]
acceptance_criteria:
  - The project already exists and is new to Puppet Master.
  - The user supplies an existing clone or directory path.
  - No fork is required unless the user later chooses upstream contribution.
  - Requirements describe scoped enhancement, rewrite, or add work.
  - Existing codebase scanning seeds Interview context.
  - Outcome is delta PRD/plan and execution in the existing project directory.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: existing_project_flow_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_enhance_rewrite_add_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0011
preserved_exact_tokens:
  - "Enhance / Rewrite / Add"
  - "existing project, new to Puppet Master"
  - "project path"
  - "existing clone or directory"
  - "codebase_scanner"
  - "delta PRD/plan"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-009 - Contribute PR Intent

```yaml
plan_unit_id: CWF-009
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Contribute PR supports feature or fix contributions to someone else's project, guides fork and feature-branch setup, keeps requirements lightweight, focuses Interview on scope/acceptance/upstream compatibility, and offers commit, push, and pull-request completion.
gui_related: false
gui_classification_reason: This span defines PR contribution workflow semantics rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005]
unblocks: [CWF-010, CWF-012, CWF-015]
acceptance_criteria:
  - Upstream repo may be supplied as URL or owner/repo.
  - Puppet Master offers to create the fork or accepts a user-created fork.
  - Requirements are feature/fix scope plus acceptance criteria.
  - Interview is lighter and focuses on scope, acceptance, style, tests, and upstream compatibility.
  - Work happens on a feature branch and Puppet Master offers commit, push, and PR opening.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pr_flow_drift
reasoning_tier: standard
context_scope: wizard_intent
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: chain_wizard_contribute_pr_intent
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0012
preserved_exact_tokens:
  - "Contribute (PR)"
  - "feature/fix scope"
  - "Pull Request"
  - "feature branch"
  - "commit, push, and open the PR"
  - "What's a PR?"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-010 - Intent-Driven Flow Adaptation

```yaml
plan_unit_id: CWF-010
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Intent selection happens at flow start and drives project setup questions, fork/repo creation offers, requirements prompt copy, Interview phase/depth configuration, PRD/plan framing, and downstream state handoff through app state and optional .puppet-master recovery state.
gui_related: false
gui_classification_reason: The covered span defines flow-state adaptation; the visible start-surface controls are covered by later GUI sections.
split_recommended: false
depends_on: [CWF-006, CWF-007, CWF-008, CWF-009]
unblocks: [CWF-012, CWF-015]
acceptance_criteria:
  - Intent selection happens at Dashboard or the first wizard step.
  - Intent drives upstream URL, fork/repo creation, project path, requirements prompt, Interview configuration, and PRD/plan framing.
  - Selected intent is stored in app state and optionally in .puppet-master for recovery.
  - Changing intent after downstream state exists requires invalidation or confirmation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_state_drift
reasoning_tier: standard
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_intent_driven_flow_adaptation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0014
preserved_exact_tokens:
  - "Intent selection"
  - "flow start"
  - "project setup"
  - "offer to create a fork"
  - "create a repo"
  - "requirements prompt"
  - "Interview"
  - "full vs. delta vs. feature"
  - ".puppet-master/"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-011 - Wizard Thread Lifecycle Boundary

```yaml
plan_unit_id: CWF-011
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard and Interview thread lifecycle references use active, attention_required, blocked, completed, and failed as canonical thread states; permanent removal is a delete action with confirmation, and archive is not a lifecycle state.
gui_related: false
gui_classification_reason: Thread lifecycle vocabulary is state-contract behavior, not GUI implementation work.
split_recommended: false
depends_on: [CWF-010]
unblocks: [CWF-013, CWF-014]
acceptance_criteria:
  - Canonical thread states are active, attention_required, blocked, completed, and failed.
  - Permanent removal is modeled as delete with confirmation.
  - archive is not introduced as a thread lifecycle state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lifecycle_vocab_drift
reasoning_tier: standard
context_scope: runtime_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_thread_lifecycle_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0015
preserved_exact_tokens:
  - "active"
  - "attention_required"
  - "blocked"
  - "completed"
  - "failed"
  - "delete"
  - "archive"
negative_constraints:
  - "archive is not a thread lifecycle state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-012 - Canonical Wizard State Shape

```yaml
plan_unit_id: CWF-012
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: ChainWizardState captures intent, wizard_step, project path, new-repo fields, fork/upstream fields, PR branch, requirements upload/Builder/canonical path fields, and recovery correlation in Rust and JSON-equivalent forms.
gui_related: true
gui_classification_reason: Wizard state drives project setup, requirements, downstream Interview/start chain, and GUI recovery behavior.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers only the state-shape subset.
depends_on: [CWF-006, CWF-007, CWF-008, CWF-009, CWF-010]
unblocks: [CWF-013, CWF-015]
acceptance_criteria:
  - WizardIntent preserves NewProject, ForkAndEvolve, EnhanceRewriteAdd, and ContributePr.
  - ChainWizardState preserves intent, wizard_step, project_path, repo fields, upstream/fork fields, branch_name, requirements paths, builder_used, canonical_requirements_path, and last_updated.
  - The JSON equivalent preserves the same fields for persistence and recovery.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_state_shape
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_canonical_state_shape
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "WizardIntent"
  - "ChainWizardState"
  - "NewProject"
  - "ForkAndEvolve"
  - "EnhanceRewriteAdd"
  - "ContributePr"
  - "project_path"
  - "upstream_url"
  - "branch_name"
  - "canonical_requirements_path"
  - "JSON equivalent"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-013 - Wizard Runtime Fields and Lifecycle

```yaml
plan_unit_id: CWF-013
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard runtime state adds required fields including wizard_id, wizard_status, launch_source, phase override and plan references, GUI flag, attention report reference, remote repo reference, deferred payload reference, and the canonical wizard_status lifecycle enum without conflating state families.
gui_related: true
gui_classification_reason: Runtime fields include GUI launch sources, Dashboard CTAs, thread deep links, and wizard user-visible lifecycle state.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers only runtime fields and lifecycle.
depends_on: [CWF-012]
unblocks: [CWF-014, CWF-015, CWF-017]
acceptance_criteria:
  - Required runtime fields include wizard_id, wizard_status, launch_source, phase_override_mode, phase_plan_ref, has_gui, attention_required_report_path, remote_repo_ref, and deferred_wizard_payload_ref.
  - wizard_status values preserve setup, requirements, interview, validating, attention_required, blocked, ready_to_execute, complete, and cancelled.
  - Wizard lifecycle, Builder bundle state, agent activity run state, and executor node status remain separate state families.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_lifecycle_drift
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_runtime_fields_lifecycle
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "wizard_id"
  - "wizard_status"
  - "launch_source"
  - "phase_override_mode"
  - "phase_plan_ref"
  - "has_gui"
  - "remote_repo_ref"
  - "deferred_wizard_payload_ref"
  - "ready_to_execute"
  - "cancelled"
negative_constraints:
  - "Builder bundle state, agent activity run state, and executor node status MUST NOT be conflated with wizard_status."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-014 - Wizard Contracts and Blocked Persistence Aliases

```yaml
plan_unit_id: CWF-014
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard step contracts remain PhaseSelectorContract, RequirementsGatheringContract, InterviewContract, and ValidationPassContract, and blocked wizard persistence uses wizard_status=blocked with blocked_reason_code while rejecting legacy blocked field aliases.
gui_related: true
gui_classification_reason: Wizard contracts and blocked persistence drive user-visible wizard flow and recovery surfaces.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers contract families and blocked alias rules.
depends_on: [CWF-011, CWF-013]
unblocks: [CWF-015, CWF-017]
acceptance_criteria:
  - Canonical wizard step contracts remain PhaseSelectorContract, RequirementsGatheringContract, InterviewContract, and ValidationPassContract.
  - Implementations may store contracts as structs or schema-backed payloads while keeping lifecycle handoff families distinct.
  - Blocked wizard persistence uses wizard_status = blocked with blocked_reason_code.
  - New wizard state does not introduce is_blocked, blocked_info, blocked_state, or blocked_episode_ref.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state_alias_drift
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_contracts_blocked_aliases
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "PhaseSelectorContract"
  - "RequirementsGatheringContract"
  - "InterviewContract"
  - "ValidationPassContract"
  - "blocked_reason_code"
  - "is_blocked"
  - "blocked_info"
  - "blocked_state"
  - "blocked_episode_ref"
negative_constraints:
  - "Legacy blocked field names must not be introduced in new wizard state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-015 - Wizard Persistence and Handoff Payload

```yaml
plan_unit_id: CWF-015
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard state persists in app state and .puppet-master recovery storage, preserves credential-safe remote metadata, promotes canonical requirements before execution, and hands one normalized payload to Builder handoff, Interview initialization, and start-chain kickoff.
gui_related: true
gui_classification_reason: Persistence and handoff payloads drive GUI recovery, Dashboard CTAs, wizard resume, and user-visible flow continuity.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers persistence and handoff payload rules.
depends_on: [CWF-012, CWF-013, CWF-014]
unblocks: [CWF-016, CWF-017]
acceptance_criteria:
  - Full ChainWizardState remains available in app state and persists under .puppet-master or redb for recovery.
  - canonical_requirements_path is set only after upload merge, Builder output, or both, and points to promoted .puppet-master/project/requirements.md for execution.
  - Contribute PR work happens on branch_name in the main clone.
  - Secrets or credential-bearing GitHub URLs are not persisted in wizard state.
  - Builder may mutate requirements-stage fields only; Interview consumes read-mostly input; Start chain reads the post-validation canonical .puppet-master/project package.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_persistence_drift
reasoning_tier: high
context_scope: wizard_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_persistence_handoff_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - ".puppet-master/wizard-state.json"
  - "redb"
  - "canonical_requirements_path"
  - ".puppet-master/project/requirements.md"
  - "no_secrets_in_storage"
  - "redacted remote metadata"
  - "deferred_wizard_payload_ref"
  - "resume_checkpoint_ref"
  - ".puppet-master/project/**"
negative_constraints:
  - "Secrets or credential-bearing GitHub URLs MUST NOT be persisted in wizard state."
  - "Builder must not mutate GitHub setup fields except via explicit wizard actions."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-016 - Validation Report Bridge and Runtime Identity Carry-Through

```yaml
plan_unit_id: CWF-016
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Validation report bridge fields and canonical auditor_cycle_report terms must carry accepted or final sweep output into launched execution through a launch receipt or promoted package ref while preserving effective runtime identity; validation_pass_report may appear only as a legacy mirror with compatibility_only true and cycle_report_ref, and pass reports must not masquerade as run, node, or attempt records.
gui_related: true
gui_classification_reason: Validation bridge and runtime identity visibility feed wizard handoff, launch receipts, and user-visible validation/report surfaces.
split_recommended: true
split_recommendation_reason: Source span S0016 contains several distinct runtime contracts; this PlanUnit covers validation bridge and runtime identity carry-through.
depends_on: [CWF-003, CWF-015]
unblocks: []
acceptance_criteria:
  - Required bridge fields include workflow_run_id, staged_bundle_ref, requirements_quality_report_ref, execution_role, effective_account_id, and run_id.
  - Canonical terms include auditor_cycle_report, launch receipt, and promoted package ref.
  - validation_pass_report is allowed only as a legacy mirror with compatibility_only true and cycle_report_ref.
  - Accepted or final sweep output bridges into launched execution through a launch receipt or promoted package ref.
  - Pass reports do not masquerade as run, node, or attempt records.
  - Effective runtime identity survives downstream handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_report_identity_drift
reasoning_tier: high
context_scope: validation_handoff
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: chain_wizard_validation_report_runtime_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0016
preserved_exact_tokens:
  - "workflow_run_id"
  - "staged_bundle_ref"
  - "requirements_quality_report_ref"
  - "execution_role"
  - "effective_account_id"
  - "run_id"
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "compatibility_only"
  - "cycle_report_ref"
  - "launch receipt"
  - "promoted package ref"
negative_constraints:
  - "Pass reports must not masquerade as run, node, or attempt records."
compatibility_only_notes:
  - "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-017 - Wizard Cancellation Cleanup and Resume

```yaml
plan_unit_id: CWF-017
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard cancellation terminates subagents, aborts tool calls, conditionally cleans up or preserves branches, preserves Interview state for a 24-hour resume window, moves partial artifacts to .cancelled, counts consumed usage, emits wizard.cancelled, and keeps FUTURE FEATURE or OPEN QUESTION labels non-blocking unless promoted.
gui_related: false
gui_classification_reason: Cancellation cleanup and resume behavior are runtime lifecycle and recovery rules; GUI controls are covered by later GUI sections.
split_recommended: false
depends_on: [CWF-013, CWF-014, CWF-015]
unblocks: []
acceptance_criteria:
  - Running subagents receive cancel, wait up to five seconds, then force kill remaining processes.
  - Pending tool calls are aborted.
  - Worktree branches created by the wizard are removed only if no commits exist; committed branches are preserved and tagged [cancelled].
  - Interview state remains recoverable for 24 hours.
  - Partial plan artifacts move to .cancelled/.
  - Consumed usage tokens remain counted and wizard.cancelled is emitted.
  - FUTURE FEATURE and OPEN QUESTION labels do not block current contracts unless later promoted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cancellation_cleanup
reasoning_tier: high
context_scope: wizard_runtime
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_cancellation_cleanup_resume
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0017
preserved_exact_tokens:
  - "Wizard Cancellation Cleanup"
  - "5 seconds"
  - "[cancelled]"
  - "24 hours"
  - ".cancelled/"
  - "wizard.cancelled"
  - "FUTURE FEATURE"
  - "OPEN QUESTION"
negative_constraints:
  - "Do not clean up wizard-created branches when commits exist."
  - "FUTURE FEATURE or OPEN QUESTION labels do not block the current wizard/interview contract unless promoted."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-018 - GUI Updates Boundary

```yaml
plan_unit_id: CWF-018
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The GUI Updates and Intent Selection headings are preserved as structural boundaries for the next GUI-specific window; batch 016 does not pull the 3.1A Feature/enhancement entry copy body into this PlanUnit.
gui_related: true
gui_classification_reason: The headings establish the GUI updates section and intent-selection surface boundary.
split_recommended: false
depends_on: [CWF-010]
unblocks: []
acceptance_criteria:
  - The 3. GUI Updates heading remains preserved.
  - The 3.1 Intent Selection at Flow Start heading remains preserved.
  - Content from 3.1A and later GUI subsections is not claimed by this batch.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: structural_boundary
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_gui_updates_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0019
preserved_exact_tokens:
  - "3. GUI Updates"
  - "3.1 Intent Selection at Flow Start"
negative_constraints:
  - "Do not infer or claim the 3.1A body content in batch 016."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-019 - Feature Enhancement CTA and Intent Selection Copy

```yaml
plan_unit_id: CWF-019
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The Chain Wizard start surface exposes Add a new Feature or Enhancement as a user-facing CTA that maps to EnhanceRewriteAdd without creating a fifth intent, preserves the four intent options, and can be reused from Assistant Chat, Deep Plan, and deferred-wizard shortcuts.
gui_related: true
gui_classification_reason: This unit defines user-facing CTA text, start-surface placement, and intent option copy.
split_recommended: false
depends_on: [CWF-005, CWF-008, CWF-018]
unblocks: [CWF-020, CWF-022]
acceptance_criteria:
  - The start surface exposes Add a new Feature or Enhancement.
  - The CTA maps to existing intent EnhanceRewriteAdd and does not create a fifth intent.
  - Intent selection appears before or as the first wizard step.
  - The four option labels New project, Fork & evolve, Enhance/rewrite/add, and Contribute (PR) remain preserved.
  - Selected intent persists into wizard/app state and downstream Interview/start-chain handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_intent_copy_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_feature_enhancement_cta_intent_copy
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0020
preserved_exact_tokens:
  - "Add a new Feature or Enhancement"
  - "EnhanceRewriteAdd"
  - "does not create a new fifth intent"
  - "New project"
  - "Fork & evolve"
  - "Enhance/rewrite/add"
  - "Contribute (PR)"
  - "Assistant Chat / Deep Plan"
negative_constraints:
  - "Do not create a new fifth intent."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-020 - OpenCode Provider Settings Surface

```yaml
plan_unit_id: CWF-020
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: OpenCode is configured as a first-class provider backend in Settings, with enable toggle, Direct server and CLI launcher/discovery fallback connection methods, auth/sign-in options, and shared Provider model selection without OpenCode-only picker behavior.
gui_related: true
gui_classification_reason: This unit defines Settings controls, auth actions, and provider model picker behavior.
split_recommended: false
depends_on: [CWF-003, CWF-019]
unblocks: [CWF-022]
acceptance_criteria:
  - Settings exposes a single OpenCode enable toggle.
  - Settings exposes Direct server and CLI launcher/discovery fallback connection methods.
  - opencode path is used only for local launch/discovery fallback, not primary HTTP runtime transport.
  - Server auth inputs and sign-in actions are exposed for OpenCode provider auth flows.
  - Tier model pickers source OpenCode models through the shared Provider model contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_settings_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Provider_OpenCode.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: chain_wizard_opencode_provider_settings_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0021
preserved_exact_tokens:
  - "OpenCode Provider Settings Surface"
  - "first-class provider backend"
  - "Direct server"
  - "CLI launcher/discovery fallback"
  - "opencode"
  - "not for primary HTTP runtime transport"
  - "no OpenCode-only picker behavior"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-021 - Requirements Step Entry and Builder Option

```yaml
plan_unit_id: CWF-021
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: The requirements step prompts users to provide Requirements Document(s), supports uploading one or multiple files under .puppet-master/requirements, and offers Requirements Doc Builder as a no-reupload Assistant-generated requirements path into Interview.
gui_related: true
gui_classification_reason: This unit defines requirements-step labels, upload options, and Builder button behavior.
split_recommended: false
depends_on: [CWF-019]
unblocks: [CWF-028, CWF-029, CWF-032]
acceptance_criteria:
  - The prompt remains Provide your Requirements Document(s).
  - Upload your own supports one or multiple files.
  - Requirements Doc Builder opens Builder chat from the requirements step.
  - Builder output can hand off without re-upload.
  - Helper text can vary by intent while preserving the same canonical requirements handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_entry_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_requirements_entry_builder_option
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0022
preserved_exact_tokens:
  - "Provide your Requirements Document(s)."
  - "Upload your own"
  - "multiple"
  - "Requirements Doc Builder"
  - ".puppet-master/requirements/"
  - "No re-upload required"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-022 - Project Setup GitHub Fields and Readiness Strips

```yaml
plan_unit_id: CWF-022
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Project setup collects project path, intent-specific GitHub create/fork/existing repo fields, provider auth readiness, tool install readiness, manual Cursor/Claude paths, and command-contract actions from FinalGUISpec.
gui_related: true
gui_classification_reason: This unit defines wizard setup controls, readiness strips, install-state labels, and manual path controls.
split_recommended: false
depends_on: [CWF-019, CWF-020]
unblocks: [CWF-023, CWF-028]
acceptance_criteria:
  - Project setup shows project path and intent-specific fields.
  - New project create-repo flow captures repo name and fields needed for GitHub create-repo API.
  - Fork and Contribute flows capture Upstream repo and Create fork for me or I'll create the fork myself.
  - Existing repo URL/path is supported as link-only input.
  - Provider readiness strip preserves provider auth states and account summary.
  - Tool readiness strip preserves Cursor CLI, Claude CLI, and Playwright state/action rules.
  - Cursor/Claude manual path controls use Use manual path checkbox plus file picker; Playwright has no manual path controls.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: setup_ui_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_project_setup_github_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0023
preserved_exact_tokens:
  - "Create GitHub repo"
  - "repo name"
  - "Upstream repo"
  - "Create fork for me"
  - "I'll create the fork myself"
  - "Use existing repo"
  - "LoggedOut"
  - "AuthExpired"
  - "Not Installed"
  - "Use manual path"
  - "Plans/FinalGUISpec.md §7.15"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-023 - Navigation and Recovery Reset Semantics

```yaml
plan_unit_id: CWF-023
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard navigation permits back/forward changes while requiring documented reset or confirmation behavior when intent changes, and recovery snapshots include current view, wizard step, intent, and project path.
gui_related: true
gui_classification_reason: This unit covers user-visible navigation, reset confirmation, and recovery restoration behavior.
split_recommended: false
depends_on: [CWF-022]
unblocks: [CWF-026, CWF-027]
acceptance_criteria:
  - Users can go back and change intent or setup fields.
  - Intent changes mid-flow clear downstream requirements/interview state or prompt for confirmation.
  - Recovery snapshots preserve current view, wizard step, intent, and project path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: recovery_state_drift
reasoning_tier: standard
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_navigation_recovery_reset
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0024
preserved_exact_tokens:
  - "Back/forward"
  - "Changing intent will reset requirements and interview; continue?"
  - "Recovery"
  - "current view"
  - "wizard step"
  - "intent"
  - "project path"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-024 - Wizard Plan Deep Plan TODO Handoff and Permission Boundary

```yaml
plan_unit_id: CWF-024
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Wizard-produced Plan and Deep Plan artifacts use the normalized TODO schema, treat Plan and Deep Plan as intensity variants of plan runtime mode, may use read-only research subagents and web tools through normal permissions, and keep mutating tools denied in plan mode.
gui_related: true
gui_classification_reason: This unit covers wizard planning surfaces, questionnaire cards, runtime identity display, and user-visible Plan/Deep Plan/TODO handoff.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers plan/deep-plan/TODO and permission boundaries.
depends_on: [CWF-021]
unblocks: [CWF-025]
acceptance_criteria:
  - Wizard-generated plans use the normalized TODO schema from assistant-chat-design and storage-plan.
  - Plan and Deep Plan are intensity variants, not categorical runtime modes.
  - Deep Plan may spawn read-only research subagents including web research.
  - Wizard questions render through the shared questionnaire card and preserve effective_persona.
  - Web tools use the normal permission stack and mutating tools remain denied in plan mode.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_mode_permission_drift
reasoning_tier: high
context_scope: wizard_planning
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Run_Modes.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: chain_wizard_plan_deep_plan_todo_permission_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "plan"
  - "/intensity"
  - "read-only research subagents"
  - "TODO auto-use heuristic"
  - "/questionnaire"
  - "effective_persona"
  - "/web"
  - "/skill"
  - "default `ask`"
  - "Mutating tools remain denied"
negative_constraints:
  - "Mutating tools remain denied in plan mode regardless of wizard context."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-025 - Embedded Agent Activity Pane and Progress Placement

```yaml
plan_unit_id: CWF-025
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Builder, Multi-Pass Review, Interview document creation, and review work show a same-page embedded read-only agent activity pane with streaming agent output, blocked-state badges/actions, progress status, and separate document review/editing pane.
gui_related: true
gui_classification_reason: This unit defines embedded user-visible progress/activity panes, blocked cards, and same-page placement.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers activity pane and progress placement.
depends_on: [CWF-024]
unblocks: [CWF-026, CWF-027]
acceptance_criteria:
  - Agent activity pane is chat-like, embedded, read-only, and streams prompts, model responses, and subagent reports.
  - The pane has no user input, no slash commands, and minimal chrome.
  - Permission, FileSafe, MCP, Provider, config, and headless blocked states map to blocked badge and recovery/informational behavior.
  - Document review/editing is handled by a separate embedded document pane.
  - The pane appears on the same page where Builder, Multi-Pass Review, Interview document creation, or review is triggered.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: activity_visibility_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_embedded_agent_activity_pane
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "chat-like window"
  - "streaming agent output"
  - "read-only"
  - "no user input"
  - "no slash commands"
  - "blocked"
  - "/Provider"
  - "/config"
  - "same page"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-026 - Pause Cancel Resume Runtime Semantics

```yaml
plan_unit_id: CWF-026
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Multi-Pass Review and document generation expose pause, cancel, and resume controls whose runtime semantics preserve handoff boundaries, avoid killing in-flight subagents on pause/cancel, discard cancelled reports, and support crash recovery choices.
gui_related: true
gui_classification_reason: This unit covers user-visible pause/cancel/resume controls and runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers pause/cancel/resume runtime semantics.
depends_on: [CWF-023, CWF-025]
unblocks: [CWF-027]
acceptance_criteria:
  - Pause takes effect at the next handoff boundary and does not kill in-flight subagents.
  - Resume continues from persisted handoff state.
  - Cancel stops spawning immediately, lets in-flight subagents complete, discards reports, and surfaces no changes applied.
  - If review agent is producing, cancel waits for current revision to finish, discards it, and sets cancelled.
  - Crash recovery offers Resume or Start over when state is restorable, and Start over only when state is missing or corrupted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pause_cancel_resume_drift
reasoning_tier: high
context_scope: runtime
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_pause_cancel_resume_runtime
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "pause"
  - "cancel"
  - "resume"
  - "next handoff boundary"
  - "Do not kill in-flight subagents"
  - "stop spawning"
  - "discard their reports"
  - "Resume"
  - "Start over"
negative_constraints:
  - "Do not kill in-flight subagents on pause or cancel."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-027 - Run States Control Row Stale Progress and Checkpoint Payload

```yaml
plan_unit_id: CWF-027
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Agent activity progress uses the canonical run-state enum, a Pause Resume Cancel control row, confirmation modal/toasts, stale-progress warning after 30 seconds, and a recoverable checkpoint payload with run type, run id, phase, step/document indexes, subagent task count, and checkpoint version.
gui_related: true
gui_classification_reason: This unit defines user-facing run states, controls, modal/toast copy, stale progress warning, and recovery prompt behavior.
split_recommended: true
split_recommendation_reason: Source span S0026 contains several distinct GUI/runtime contracts; this unit covers run states and checkpoint payload.
depends_on: [CWF-026]
unblocks: []
acceptance_criteria:
  - Run states are idle, generating, reviewing, paused, cancelling, cancelled, interrupted, complete, and error.
  - Control row order is Pause, Resume, Cancel.
  - Cancel confirmation and resume/cancel toasts preserve the specified text.
  - Stale progress warning appears after 30 seconds without auto-cancel.
  - Recovery checkpoint preserves run_type, run_id, phase, step_index, document_index, total_documents, subagent_tasks_done, and checkpoint_version.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: progress_checkpoint_drift
reasoning_tier: high
context_scope: gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_run_states_control_checkpoint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0026
preserved_exact_tokens:
  - "idle"
  - "generating"
  - "reviewing"
  - "paused"
  - "cancelling"
  - "cancelled"
  - "interrupted"
  - "complete"
  - "error"
  - "Pause | Resume | Cancel"
  - "Progress stalled -- last update 30s ago"
  - "checkpoint_version"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-028 - Requirements Upload UI and Normalization

```yaml
plan_unit_id: CWF-028
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements uploads allow up to ten ordered files, enforce a five MiB per-file limit, preserve originals byte-for-byte, normalize each upload into deterministic UTF-8 text projections, and exclude failed extraction files until replaced or removed.
gui_related: true
gui_classification_reason: Upload controls, list ordering, rejection messages, and file errors are user-visible requirements-step behavior.
split_recommended: false
depends_on: [CWF-021]
unblocks: [CWF-029, CWF-030, CWF-031]
acceptance_criteria:
  - Multiple file upload supports Add file plus remove/reorder controls.
  - Max upload count is 10.
  - Max file size per file is 5 MiB.
  - Merge order is UI list order with no primary/supplements distinction.
  - Original uploads are preserved byte-for-byte.
  - Canonical merge input is normalized UTF-8 text projection and never raw bytes.
  - PDF and DOCX extraction failures stay on the requirements step and exclude failed files until replaced or removed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: upload_normalization_drift
reasoning_tier: high
context_scope: requirements
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_requirements_upload_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0028
preserved_exact_tokens:
  - "10"
  - "5 MiB"
  - "list order"
  - "No \"primary\" vs \"supplements\""
  - "byte-for-byte"
  - "normalized UTF-8 text projection"
  - "never raw bytes"
  - "pdf"
  - "docx"
negative_constraints:
  - "Canonical merge input is never raw bytes."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-029 - Canonical Requirements Merge and Single Source

```yaml
plan_unit_id: CWF-029
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements merging always concatenates normalized uploads and/or Builder output into canonical staging and promotion paths, uses exact separators and list order, performs no AI or rule-based conflict resolution, and makes Interview/start chain read only canonical_requirements_path.
gui_related: true
gui_classification_reason: Merge order, Builder combination, conflict handling, and canonical requirements status are user-visible wizard behavior.
split_recommended: false
depends_on: [CWF-028]
unblocks: [CWF-030, CWF-034]
acceptance_criteria:
  - Upload-only merge concatenates normalized text in UI list order.
  - Builder-only output promotes requirements-builder.md into project requirements.
  - Uploads plus Builder append Builder output after all uploads.
  - The exact separators for Requirements doc N and Requirements Doc Builder are preserved.
  - There is no conflicting-content merge and no AI/rule conflict resolution.
  - Interview and start chain read only canonical_requirements_path after promotion.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_merge_drift
reasoning_tier: high
context_scope: requirements
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_canonical_requirements_merge_single_source
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0029
preserved_exact_tokens:
  - "--- Requirements doc N ---"
  - "--- Requirements Doc Builder ---"
  - "uploads first"
  - "Builder output"
  - "canonical-requirements.md"
  - ".puppet-master/project/requirements.md"
  - "canonical_requirements_path"
negative_constraints:
  - "No AI merge."
  - "No rule-based conflict resolution."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-030 - Requirements Artifact Storage Paths

```yaml
plan_unit_id: CWF-030
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements artifacts are represented in seglog/redb, stored under .puppet-master/requirements and .puppet-master/project paths with exact upload, normalized, Builder, contract seed, merge, and canonical requirements locations, while contract-seeds.md remains staging input and not the canonical project contract pack.
gui_related: false
gui_classification_reason: Storage events, paths, redb projections, and artifact ownership are backend storage contracts.
split_recommended: false
depends_on: [CWF-029]
unblocks: [CWF-034]
acceptance_criteria:
  - Requirements added, merged, or set canonical emit artifact events.
  - Projectors can mirror to JSONL and maintain redb projections.
  - Uploads, normalized projections, Builder output, contract seed pack, merged staging result, and canonical project requirements use the exact prescribed paths.
  - contract-seeds.md is staging input and not the canonical project contract pack.
  - Canonical project contracts live under .puppet-master/project/contracts/.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_storage_drift
reasoning_tier: high
context_scope: storage
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_requirements_artifact_storage_paths
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0030
preserved_exact_tokens:
  - "seglog"
  - "redb"
  - ".puppet-master/requirements/uploaded/<sanitized_filename>"
  - ".puppet-master/requirements/normalized/<two_digit_index>-<sanitized_stem>.md"
  - ".puppet-master/requirements/requirements-builder.md"
  - ".puppet-master/requirements/contract-seeds.md"
  - ".puppet-master/requirements/canonical-requirements.md"
  - ".puppet-master/project/requirements.md"
  - ".puppet-master/project/contracts/"
negative_constraints:
  - "contract-seeds.md MUST NOT be treated as the canonical project contract pack."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-031 - Upload Limits and Merge Edge Constraints

```yaml
plan_unit_id: CWF-031
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements upload edge cases are resolved by enforcing ten files, five MiB per file, upload-specific errors, no reference-only or sampling fallback, and always-concatenation merge semantics controlled by user ordering.
gui_related: true
gui_classification_reason: Limit rejection messages, upload-specific errors, and user-controlled reorder behavior are visible in the requirements UI.
split_recommended: false
depends_on: [CWF-028, CWF-029]
unblocks: []
acceptance_criteria:
  - Maximum number of uploads is 10 and shows Maximum 10 files.
  - Maximum file size is 5 MiB and oversized files are rejected before saving.
  - No reference-only or sampling mode exists for MVP.
  - Merge is always concatenation in defined order.
  - Users resolve content/order issues by reordering or removing files.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: upload_edge_case_drift
reasoning_tier: standard
context_scope: requirements
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_upload_limits_merge_edges
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0031
preserved_exact_tokens:
  - "Maximum 10 files."
  - "5 MiB"
  - "reference only"
  - "sampling"
  - "always concatenation"
negative_constraints:
  - "No reference-only or sampling fallback for MVP."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-032 - Builder Concept and Opening Prompts

```yaml
plan_unit_id: CWF-032
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Doc Builder is a conversation-first button in the requirements step with no questionnaire before first response, staged output until approval/handoff, and context-dependent opening prompts that the Assistant sends first.
gui_related: true
gui_classification_reason: Builder launch, opening prompts, and conversation-first flow are user-visible wizard and Assistant behavior.
split_recommended: false
depends_on: [CWF-021]
unblocks: [CWF-033, CWF-034]
acceptance_criteria:
  - Requirements Doc Builder opens Builder chat on the requirements/wizard page.
  - No questionnaire appears before the first user response.
  - Builder output remains staged until final approval and handoff.
  - Opening prompts preserve What are you building?, What are you adding or changing?, and What are you adding or changing in this fork?
  - The Assistant does not wait for the user to speak first.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_prompt_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_builder_concept_opening_prompts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0032
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0033
preserved_exact_tokens:
  - "Requirements Doc Builder"
  - "conversation-first flow"
  - "No questionnaire"
  - "What are you building?"
  - "What are you adding or changing?"
  - "What are you adding or changing in this fork?"
  - "does NOT wait"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-033 - Builder Conversation and Generation Trigger

```yaml
plan_unit_id: CWF-033
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder conversation counts completed turns only after Assistant message plus user response, may suggest generation when enough information exists or completed_turns reaches six, never auto-generates, and starts generation only after explicit user confirmation.
gui_related: false
gui_classification_reason: Turn counting and generation trigger semantics are conversation/runtime state rules rather than GUI layout or presentation.
split_recommended: false
depends_on: [CWF-032]
unblocks: [CWF-034, CWF-036]
acceptance_criteria:
  - One completed turn is one Assistant message plus one user response.
  - completed_turns increments only after user response arrives.
  - Assistant may suggest generation when it has enough information or completed_turns >= 6.
  - Suggestion text is confirmatory and does not auto-generate.
  - User can continue indefinitely until explicitly confirming generation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_trigger_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_conversation_generation_trigger
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0034
preserved_exact_tokens:
  - "completed_turns"
  - "completed_turns >= 6"
  - "Would you like me to create the requirements doc?"
  - "does not auto-generate"
  - "explicit user confirmation"
negative_constraints:
  - "Generation starts only after explicit user confirmation."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-034 - Builder Handoff Artifacts and Packaging Gate

```yaml
plan_unit_id: CWF-034
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder handoff emits one requirements document plus a staging-only contract seed pack, persists paths/source/checklist/conversation/approval state, and packages qualifying .puppet-master/requirements outputs as verified Document Sets before handoff continues.
gui_related: false
gui_classification_reason: Builder output, handoff persistence, and packaging gate behavior are artifact and governance contracts.
split_recommended: true
split_recommendation_reason: Source span S0035 contains output format, seed template, state, and qualifying-question contracts; this unit covers artifact and packaging gate rules.
depends_on: [CWF-029, CWF-030, CWF-032, CWF-033]
unblocks: [CWF-035, CWF-036, CWF-037]
acceptance_criteria:
  - Builder produces one requirements document per generation run.
  - Builder emits .puppet-master/requirements/contract-seeds.md as staging input.
  - contract-seeds.md is not the canonical project contract pack.
  - Handoff state persists paths, source, checklist/conversation state, and approval stage.
  - Packaging triggers emit Document Sets and verify them per Document_Packaging_Policy before handoff continues.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_handoff_artifact_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Document_Packaging_Policy.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_builder_handoff_artifacts_packaging_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0035
preserved_exact_tokens:
  - ".puppet-master/requirements/contract-seeds.md"
  - "not the canonical project contract pack"
  - "ProjectContract:*"
  - "Document Sets"
  - "Gate:GATE-014"
negative_constraints:
  - "Builder contract-seeds.md must not be treated as the canonical project contract pack."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-035 - Builder Output and Contract Seed Templates

```yaml
plan_unit_id: CWF-035
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder output and contract seed pack templates require named top-level sections for requirements and contract seeds while allowing additional sections and validation warnings for missing required headings.
gui_related: false
gui_classification_reason: Template heading requirements are artifact structure and validation rules, not GUI presentation.
split_recommended: true
split_recommendation_reason: Source span S0035 contains output format, seed template, state, and qualifying-question contracts; this unit covers template heading requirements.
depends_on: [CWF-034]
unblocks: [CWF-036]
acceptance_criteria:
  - Requirements output preserves Scope, Goals, Out of scope, Acceptance criteria, and Non-goals headings.
  - Contract seed pack preserves Assumptions, Constraints, Glossary, and Non-functional budgets headings.
  - Additional sections such as Risks, Dependencies, and Constraints are allowed.
  - Implementations may validate and warn when required sections are missing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_template_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_templates
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0035
preserved_exact_tokens:
  - "Scope"
  - "Goals"
  - "Out of scope"
  - "Acceptance criteria"
  - "Non-goals"
  - "Assumptions"
  - "Constraints"
  - "Glossary"
  - "Non-functional budgets"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-036 - Builder State Contracts and Qualifying Questions

```yaml
plan_unit_id: CWF-036
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder tracks separate conversation and checklist state contracts, uses empty/thin/filled section statuses and requirements_doc or contract_seed_pack sources, and asks qualifying questions only for empty or thin checklist entries.
gui_related: false
gui_classification_reason: Builder state contracts and qualifying-question rules are backend conversation/checklist state behavior.
split_recommended: true
split_recommendation_reason: Source span S0035 contains output format, seed template, state, and qualifying-question contracts; this unit covers state contracts and question rules.
depends_on: [CWF-033, CWF-035]
unblocks: [CWF-037]
acceptance_criteria:
  - builder_conversation_state.v1 preserves session_id, completed_turns, last_suggestion_turn, awaiting_generation_confirmation, and awaiting_final_approval.
  - session_id format is PM-YYYY-MM-DD-HH-MM-SS-NNN.
  - builder_checklist_state.v1 preserves section_id, status, source, last_updated_event_id, and coverage_note.
  - Status values remain empty, thin, and filled.
  - Source values remain requirements_doc and contract_seed_pack.
  - Qualifying questions are asked only for empty or thin sections, not filled sections.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_state_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_state_contracts_questions
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0035
preserved_exact_tokens:
  - "builder_conversation_state.v1"
  - "PM-YYYY-MM-DD-HH-MM-SS-NNN"
  - "builder_checklist_state.v1"
  - "empty | thin | filled"
  - "requirements_doc | contract_seed_pack"
  - "empty"
  - "thin"
  - "filled"
negative_constraints:
  - "Do not ask follow-up questions for sections already marked filled."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-037 - Builder Staged Bundle Promotion Lifecycle

```yaml
plan_unit_id: CWF-037
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder promotion operates on staged bundle artifacts, with Accept, Reject, and Edit gates controlling promotion to accepted Builder artifacts and enabling Done -- hand off to Interview only when the bundle state is approved_for_handoff.
gui_related: false
gui_classification_reason: Promotion gates and staged bundle paths are artifact lifecycle behavior, not GUI layout.
split_recommended: false
depends_on: [CWF-034, CWF-036]
unblocks: [CWF-039, CWF-040]
acceptance_criteria:
  - Staged requirements, contract-seeds, and review-summary paths preserve the builder run_id directory.
  - Accept promotes staged requirements and contract seeds, updates canonical_requirements_path, and allows handoff.
  - Reject discards staged review output and preserves the last accepted Builder artifact.
  - Edit keeps user edits staged until the same Accept gate completes.
  - Done -- hand off to Interview is enabled only when bundle state is approved_for_handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_promotion_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_builder_staged_bundle_promotion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0036
preserved_exact_tokens:
  - ".puppet-master/requirements/staging/builder/<run_id>/requirements.md"
  - ".puppet-master/requirements/staging/builder/<run_id>/contract-seeds.md"
  - ".puppet-master/requirements/staging/builder/<run_id>/review-summary.json"
  - "Accept"
  - "Reject"
  - "Edit"
  - "approved_for_handoff"
  - "Done -- hand off to Interview"
  - "builder_stage"
  - "builder_run_id"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-038 - Builder Dependencies and No Duplicate Rules

```yaml
plan_unit_id: CWF-038
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Doc Builder depends on Assistant chat plus current project path and intent, uses the shared rules pipeline, and does not duplicate interview-specific rules beyond producing a requirements document for handoff.
gui_related: false
gui_classification_reason: Dependencies and prompt-rule reuse are backend workflow and DRY constraints.
split_recommended: false
depends_on: [CWF-032]
unblocks: [CWF-039]
acceptance_criteria:
  - Assistant chat is implemented before Builder.
  - Assistant knows current project path and intent.
  - Builder uses the same rules pipeline as Assistant.
  - Builder prompt does not duplicate interview-specific rules beyond requirements-doc handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_rules_drift
reasoning_tier: standard
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/agent-rules-context.md
node_compile_hint:
  mode: chain_wizard_builder_dependencies_no_duplicate_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0037
preserved_exact_tokens:
  - "Assistant chat"
  - "current project path"
  - "intent"
  - "same rules pipeline"
  - "do not duplicate interview-specific rules"
negative_constraints:
  - "Do not duplicate interview-specific rules in the Builder prompt beyond producing a requirements doc for handoff."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-039 - Builder Bundle and Doc State Model

```yaml
plan_unit_id: CWF-039
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Builder document review uses canonical bundle-level and doc-level states for generation, review, targeted revision, approvals, final gate, completion, errors/interruption, and doc approval/revision badges.
gui_related: false
gui_classification_reason: Bundle/doc state model is runtime state contract; GUI rendering of later flows is covered by adjacent PlanUnits.
split_recommended: false
depends_on: [CWF-037, CWF-038]
unblocks: [CWF-040, CWF-041]
acceptance_criteria:
  - Bundle states preserve idle, generating, awaiting_user_review, revision_running, awaiting_approvals, ready_for_final_review, final_review_running, final_gate, complete, error, and interrupted.
  - Doc states preserve writing... to draft to approved plus draft to/from changes-requested.
  - needs-review may be used as a doc badge when helpful.
  - Bundle/doc state model uses storage-plan, FinalGUISpec, TargetedRevisionPass, and Crosswalk ContractRefs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_doc_state_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: chain_wizard_builder_bundle_doc_state_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0039
preserved_exact_tokens:
  - "idle"
  - "generating"
  - "awaiting_user_review"
  - "revision_running"
  - "awaiting_approvals"
  - "ready_for_final_review"
  - "final_review_running"
  - "final_gate"
  - "writing… -> draft -> approved"
  - "draft <-> changes-requested"
  - "needs-review"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-040 - Updated Builder Review Flow and Final Review Gate

```yaml
plan_unit_id: CWF-040
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements Doc Builder review generates staged artifacts as a bundle, supports durable annotations and Resubmit with Annotations targeted revision, enables Run Final Review only after all docs are Approved/Done and no annotations remain open, and ends final review with Accept, Reject, or Edit.
gui_related: true
gui_classification_reason: This unit defines document-pane review flow, user buttons, final review gate, and workflow acceptance behavior.
split_recommended: false
depends_on: [CWF-039]
unblocks: [CWF-041, CWF-044]
acceptance_criteria:
  - Builder generates staged artifacts as a bundle into the Embedded Document Pane.
  - User can edit, create durable annotations, and run Resubmit with Annotations.
  - User marks each doc Approved/Done.
  - Run Final Review is enabled only when all docs are Approved/Done and no open annotations remain.
  - Multi-Pass Review runs once by default and ends with Accept, Reject, or Edit.
  - Resubmit with Annotations does not trigger Multi-Pass Review.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_review_gate_drift
reasoning_tier: high
context_scope: builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_builder_review_flow_final_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0040
preserved_exact_tokens:
  - "Resubmit with Annotations"
  - "Approved/Done"
  - "Run Final Review"
  - "Accept | Reject | Edit"
  - "MUST NOT trigger Multi-Pass Review"
negative_constraints:
  - "Resubmit with Annotations MUST NOT trigger Multi-Pass Review."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-041 - Targeted Revision Input Contract

```yaml
plan_unit_id: CWF-041
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Resubmit with Annotations accepts current docs plus open durable annotations in deterministic order, structured annotation operations and payloads, source-text anchors, bounded provenance, and preview-mode downgrade behavior when deterministic source mapping is unavailable.
gui_related: true
gui_classification_reason: Targeted revision input comes from document selection palettes, annotations, preview mode, and chat handoff UI.
split_recommended: true
split_recommendation_reason: Source span S0041 contains input, output, validation, and hard-rule contracts; this unit covers input shape.
depends_on: [CWF-040]
unblocks: [CWF-042, CWF-043]
acceptance_criteria:
  - Inputs include current doc contents and open durable annotations in deterministic order.
  - Annotation records include annotation_id, operation, intent_kind, selected anchor context, and operation_payload.
  - Operation values preserve comment, replace, insert_after, and remove.
  - Payload shapes preserve body, replacement_text, insert_text, and rationale forms.
  - Structured revision input is anchored to source text, not rendered visual tree.
  - Preview-mode unavailable source mapping downgrades durable structured changes to comment-only or chat/provenance flow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_input_drift
reasoning_tier: high
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Prompt_Pipeline.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_targeted_revision_input_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0041
preserved_exact_tokens:
  - "annotation_id"
  - "operation = comment | replace | insert_after | remove"
  - "intent_kind = question | change_request | both"
  - "operation_payload"
  - "source-of-truth anchored to source text"
  - "preview-mode selections"
  - "anchor.text_position"
  - "anchor.text_quote"
  - "provenance"
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-042 - Targeted Revision Output and Validation Contract

```yaml
plan_unit_id: CWF-042
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Targeted revision output returns updated doc text, replies, and one ordered result record per input annotation, with runtime validation authoritative for addressed, still_open, cannot_apply, or unresolved transitions.
gui_related: true
gui_classification_reason: Targeted revision results drive visible annotation lifecycle, document updates, and status transitions.
split_recommended: true
split_recommendation_reason: Source span S0041 contains input, output, validation, and hard-rule contracts; this unit covers output and validation.
depends_on: [CWF-041]
unblocks: [CWF-043, CWF-044]
acceptance_criteria:
  - Output includes updated doc text for modified docs and replies for question/comment annotations.
  - One result record is returned per input annotation in the same order.
  - Outcome values preserve addressed, still_open, and cannot_apply.
  - Output records preserve addressed_explanation, updated_anchor, and failure_code fields.
  - Runtime, not the model, is authoritative for status transitions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_output_drift
reasoning_tier: high
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: chain_wizard_targeted_revision_output_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0041
preserved_exact_tokens:
  - "addressed | still_open | cannot_apply"
  - "addressed_explanation"
  - "updated_anchor?"
  - "failure_code?"
  - "same order"
  - "runtime, not the model"
negative_constraints:
  - "Partial success is represented per annotation rather than by a bundle-level vague success."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-043 - Targeted Revision Hard Rules and Capability Modes

```yaml
plan_unit_id: CWF-043
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Targeted revision may answer questions without changing docs, must not trigger Multi-Pass Review, excludes conflicting or stale mutating annotations, allows one retry on structured validation failure, exposes requested/effective capability, preserves non-blocking tags, and does not introduce direct patch-apply semantics.
gui_related: true
gui_classification_reason: Revision hard rules and capability disclosure affect document review UI, annotation handling, and chat handoff behavior.
split_recommended: true
split_recommendation_reason: Source span S0041 contains input, output, validation, and hard-rule contracts; this unit covers hard rules and capability modes.
depends_on: [CWF-041, CWF-042]
unblocks: [CWF-044]
acceptance_criteria:
  - Targeted revision does not trigger Multi-Pass Review.
  - It may answer questions without changing docs.
  - Conflicting or stale mutating annotations are excluded until resolved.
  - One automatic retry is allowed on structured validation failure before explicit degrade/fail.
  - Capability modes preserve schema_enforced_structured_revision, validated_structured_revision, and chat_handoff_only.
  - Non-blocking tags and no direct patch-apply semantics are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: targeted_revision_hard_rule_drift
reasoning_tier: high
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: chain_wizard_targeted_revision_hard_rules_capabilities
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0041
preserved_exact_tokens:
  - "MUST NOT trigger Multi-Pass Review"
  - "MAY answer questions"
  - "Conflicting or stale mutating annotations"
  - "one automatic retry"
  - "schema_enforced_structured_revision"
  - "validated_structured_revision"
  - "chat_handoff_only"
  - "/structured-output"
  - "/order/shape"
  - "patch-apply"
negative_constraints:
  - "Do not introduce direct patch-apply semantics."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-044 - Workflow Acceptance and Legacy Label Compatibility

```yaml
plan_unit_id: CWF-044
unit_type: validation_rule
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Document review workflow acceptance preserves selection-palette operations, Send selection to chat chips, deterministic re-anchoring with explicit anchor_not_found, Resubmit with Annotations targeted revision, Resubmit with Notes as a legacy label for the same pass, and the final-review gate.
gui_related: true
gui_classification_reason: This unit defines user-visible selection palette, chat chip, legacy label, annotation lifecycle, and final review gating behavior.
split_recommended: false
depends_on: [CWF-040, CWF-041, CWF-042, CWF-043]
unblocks: []
acceptance_criteria:
  - Selection palette creates durable annotations for Comment, Replace, Insert after, and Remove.
  - Send selection to chat creates a thread-scoped composer chip in the owning chat surface.
  - Durable annotations persist and re-anchor deterministically.
  - anchor_not_found remains explicit and never silent.
  - Resubmit with Notes is a legacy UI label for the same targeted pass.
  - Final review cannot run until all docs are Approved/Done and no annotations remain open.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_workflow_acceptance
reasoning_tier: standard
context_scope: targeted_revision
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_review_acceptance_legacy_label
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0042
preserved_exact_tokens:
  - "Comment"
  - "Replace"
  - "Insert after"
  - "Remove"
  - "Send selection to chat"
  - "anchor_not_found"
  - "Resubmit with Notes"
  - "open -> addressed -> resolved"
  - "Final review cannot run"
compatibility_only_notes:
  - "Resubmit with Notes is a legacy UI label for the same targeted pass."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-045 - Multi-Pass Final Review Gate

```yaml
plan_unit_id: CWF-045
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Multi-Pass Review is the Requirements Doc Builder final-review action,
  enabled only when all bundle docs are Approved/Done, no annotations remain
  open, and the user explicitly clicks Run Final Review; it never auto-runs or
  replaces targeted revision.
gui_related: true
gui_classification_reason: This unit defines the user-visible Run Final Review gate and document-review controls.
split_recommended: false
depends_on: [CWF-040, CWF-044]
unblocks: []
acceptance_criteria:
  - Run Final Review is enabled only after all docs are Approved/Done.
  - Question/comment annotations count as open until the user resolves them.
  - The user must explicitly click Run Final Review.
  - Multi-Pass Review must not auto-run when conditions become true.
  - Send selection to chat chips do not satisfy or bypass the final-review gate.
  - Targeted revision and final review keep separate runtime actions and audit trails.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_gate_drift
reasoning_tier: high
context_scope: requirements_builder_review
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/MiscPlan.md
node_compile_hint:
  mode: chain_wizard_multipass_final_review_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0043
preserved_exact_tokens:
  - "Multi-Pass Review"
  - "final-review"
  - "Approved/Done"
  - "no open annotations"
  - "Run Final Review"
  - "Must not auto-run"
  - "Send selection to chat"
  - "safe-point lineage"
negative_constraints:
  - "Multi-Pass Review must not auto-run when gate conditions become true."
  - "Send selection to chat chips do not satisfy or bypass the final-review gate."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/MiscPlan.md
```

### CWF-046 - Contract Layer Two-Layer Boundary

```yaml
plan_unit_id: CWF-046
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The wizard inserts a Contract Layer between requirements and execution, with
  Platform Contracts referenced only by stable names or IDs and Project
  Contracts generated per user project under Project Contract Pack IDs.
gui_related: false
gui_classification_reason: Contract routing and owner boundaries are backend/governance behavior, not GUI implementation work.
split_recommended: true
split_recommendation_reason: Source span S0044 contains boundary, artifact, storage, and validation rules; this unit covers only the two-layer contract boundary.
depends_on: [CWF-035]
unblocks: [CWF-047, CWF-048, CWF-056, CWF-057]
acceptance_criteria:
  - Requirements flow through Project Contract Pack before plan.md, plan_graph, and execution.
  - Platform Contracts remain Puppet Master SSOT docs referenced by stable name or ID only.
  - User-project artifacts do not copy internal Plans schemas or docs into the user project.
  - Project Contracts are generated per user project under .puppet-master/project/contracts/ and referenced by stable ProjectContract IDs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: contract_layer
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_contract_layer_two_layer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0044
preserved_exact_tokens:
  - "Contract Layer"
  - "requirements.md"
  - "Project Contract Pack"
  - "plan.md"
  - "plan_graph/"
  - "Platform Contracts"
  - "Project Contracts"
  - "ProjectContract:*"
  - "ContractName:*"
  - "SchemaID:*"
negative_constraints:
  - "Do not copy internal Plans schemas/docs into user projects."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

### CWF-047 - Contract Artifact Materialization and Storage

```yaml
plan_unit_id: CWF-047
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Project contract artifacts materialize under .puppet-master/project/, while
  .puppet-master/requirements/contract-seeds.md remains staging input and seglog
  remains the canonical source with regenerable filesystem projections.
gui_related: false
gui_classification_reason: Artifact materialization and storage projection rules are backend persistence behavior.
split_recommended: true
split_recommendation_reason: Source span S0044 contains boundary, artifact, storage, and validation rules; this unit covers artifact location and storage semantics.
depends_on: [CWF-046]
unblocks: [CWF-048, CWF-058, CWF-060]
acceptance_criteria:
  - Required user-project artifacts materialize under .puppet-master/project/.
  - .puppet-master/requirements/contract-seeds.md remains a staging input for contract unification.
  - Canonical artifact truth is persisted in seglog with full-content artifact events and sha256 integrity.
  - Filesystem copies are materializations or cache and must be regenerable from seglog.
  - redb projections and Tantivy indexing expose artifacts by logical path, artifact type, contract IDs, and content search.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_storage_drift
reasoning_tier: high
context_scope: project_artifact_storage
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_contract_artifact_materialization_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0044
preserved_exact_tokens:
  - ".puppet-master/project/"
  - ".puppet-master/requirements/contract-seeds.md"
  - "staging input"
  - "Canonical source of truth is seglog"
  - "sha256"
  - "redb"
  - "Tantivy"
  - "materializations/cache"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
```

### CWF-048 - Contract DRY Validation Gate

```yaml
plan_unit_id: CWF-048
unit_type: validation_rule
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Execution nodes reference resolvable ProjectContract IDs through
  contract_refs, acceptance checks resolve through acceptance_manifest.json,
  evidence outputs use schema IDs, and headless execution must work from project
  artifacts alone.
gui_related: false
gui_classification_reason: Contract reference validation is backend/governance behavior.
split_recommended: true
split_recommendation_reason: Source span S0044 contains boundary, artifact, storage, and validation rules; this unit covers DRY validation gates.
depends_on: [CWF-046, CWF-047]
unblocks: [CWF-058, CWF-060]
acceptance_criteria:
  - Every plan node contains contract_refs with at least one resolvable ProjectContract ID via contracts/index.json.
  - Every node shard acceptance check_id is present in acceptance_manifest.json.
  - Evidence outputs point to .puppet-master/project/evidence/<node_id>.json with schema pm.evidence.schema.v1.
  - Orchestrator can execute headlessly from .puppet-master/project/ artifacts alone.
  - HITL-blocked nodes do not prevent non-blocked schedulable work from continuing where dependencies allow.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dry_contract_drift
reasoning_tier: high
context_scope: project_contract_validation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_contract_dry_validation_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0044
preserved_exact_tokens:
  - "contract_refs: [\"ProjectContract:...\"]"
  - "contracts/index.json"
  - "Canonical source: ProjectContract:<...>"
  - "acceptance[].check_id"
  - "acceptance_manifest.json"
  - "pm.evidence.schema.v1"
  - ".puppet-master/project/evidence/<node_id>.json"
negative_constraints:
  - "Execution nodes must not embed contract content inline."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

### CWF-049 - Adaptive Interview Phase Selection Goal

```yaml
plan_unit_id: CWF-049
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive Interview chooses which phases to cut, shorten, or double down on so
  New Project, Fork & Evolve, Enhance/Rewrite/Add, and Contribute PR receive
  appropriate depth.
gui_related: false
gui_classification_reason: Interview phase selection goals are workflow behavior rather than GUI presentation.
split_recommended: false
depends_on: [CWF-005, CWF-010]
unblocks: [CWF-050, CWF-051, CWF-052]
acceptance_criteria:
  - Adaptive Interview can cut phases.
  - Adaptive Interview can shorten phases.
  - Adaptive Interview can double down on phases where more depth is appropriate.
  - Full products, PR contributions, and fork/evolve work receive intent-appropriate interview depth.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: interview_depth_drift
reasoning_tier: standard
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_adaptive_interview_phase_goal
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0046
preserved_exact_tokens:
  - "Adaptive Interview Phases"
  - "cut"
  - "shorten"
  - "double down on"
  - "full product"
  - "PR contribution"
  - "fork/evolve"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-050 - Scope Probe and Depth Enforcement

```yaml
plan_unit_id: CWF-050
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Phase 0 always runs a mandatory max-two-question scope probe before phase
  selection, and phase depth enforces Full, Short, or Skip using question-count
  caps and force-complete behavior.
gui_related: false
gui_classification_reason: Scope probe and depth enforcement are interview runtime behavior, not GUI presentation.
split_recommended: true
split_recommendation_reason: Source spans S0047 and S0066 contain mechanism plus gap-resolution details; this unit covers scope-probe and depth enforcement.
depends_on: [CWF-049]
unblocks: [CWF-051, CWF-052]
acceptance_criteria:
  - Phase 0 is mandatory and not skippable.
  - Scope probe asks at most two questions before phase selector invocation.
  - Short means max 2 questions and no research tool calls.
  - Full means all questions in the phase template plus research tool calls when needed.
  - Skip means phase questions, research, and document generation are not run.
  - If max is reached without phase completion, the runner asks the agent to wrap up and may force-complete with phase.force_completed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: phase_enforcement_drift
reasoning_tier: high
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_scope_probe_depth_enforcement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0047
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0066
preserved_exact_tokens:
  - "phase 0"
  - "interview.scope_probe.max_questions"
  - "Short"
  - "Full"
  - "Skip"
  - "phase.force_completed"
  - "Please wrap up this phase"
  - "max + 1"
compatibility_only_notes:
  - "Legacy source references to phase.config.max_questions normalize to interview.phases.{phase_name}.max_questions or the global interview.max_questions_per_phase."
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-051 - Phase Selector Contract and Normalization

```yaml
plan_unit_id: CWF-051
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The phase selector consumes intent, requirements summary, optional codebase
  summary, and has_gui, then persists a normalized ordered eight-entry
  Vec<PhasePlanEntry> with invalid duplicate or unknown phases falling back
  safely.
gui_related: false
gui_classification_reason: Phase selector input/output and normalization are runtime contract behavior.
split_recommended: true
split_recommendation_reason: Source span S0048 contains selector contract, fallback, persistence, resume, and UI override controls; this unit covers selector schema and normalization.
depends_on: [CWF-049, CWF-050]
unblocks: [CWF-052, CWF-053]
acceptance_criteria:
  - Selector input preserves intent, requirements_summary, codebase_summary, and has_gui.
  - Phase registry preserves the ordered eight canonical phase IDs.
  - Output uses phase_plan as Vec<PhasePlanEntry> with phase_id and depth.
  - Array order is execution order.
  - Duplicate and unknown phase IDs are invalid and cause selector failure fallback.
  - Omitted registry phases normalize to Skip before persistence.
  - Persisted plan is the phase manager normalizer output, even when an AI recommendation is obtained.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: selector_schema_drift
reasoning_tier: high
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_phase_selector_contract_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0048
preserved_exact_tokens:
  - "NewProject"
  - "ForkAndEvolve"
  - "EnhanceRewriteAdd"
  - "ContributePr"
  - "requirements_summary"
  - "first 2000 characters"
  - "codebase_summary"
  - "has_gui"
  - "Vec<PhasePlanEntry>"
  - "Full | Short | Skip"
negative_constraints:
  - "No separate selector-only provider/model contract is required for MVP."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-052 - Phase Plan Persistence Fallback and Resume

```yaml
plan_unit_id: CWF-052
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Phase plans persist with source and override metadata, selector failures use
  the canonical fallback table without re-invocation, resume never reruns
  selection, and failures emit phase_selector.fallback.
gui_related: false
gui_classification_reason: Phase plan persistence, fallback, and resume are runtime state behavior.
split_recommended: true
split_recommendation_reason: Source spans S0048 and S0066 contain persistence, fallback, and resume behavior; this unit covers deterministic replay.
depends_on: [CWF-050, CWF-051]
unblocks: [CWF-053]
acceptance_criteria:
  - ContributePr fallback uses Short for scope_goals, architecture_technology, and testing_verification and Skip for all other phases.
  - NewProject, ForkAndEvolve, and EnhanceRewriteAdd fallback to all phases Full.
  - Phase plan persists in interview state or .puppet-master/interview/phase_plan.json.
  - phase_override_mode and phase_plan_source persist for audit and replay.
  - Resume loads the stored phase_plan and does not rerun the phase selector.
  - Selector failures log phase_selector.fallback with original error and normalized fallback plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: resume_nondeterminism
reasoning_tier: high
context_scope: adaptive_interview_state
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_phase_plan_persistence_fallback_resume
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0048
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0066
preserved_exact_tokens:
  - ".puppet-master/interview/phase_plan.json"
  - "phase_override_mode"
  - "phase_plan_source"
  - "selector | fallback | run_all | manual_checklist"
  - "phase_selector.fallback"
  - "Never synthesize an ad-hoc phase subset outside the canonical fallback table."
negative_constraints:
  - "Do not re-invoke selector when fallback is selected."
  - "Do not rerun phase selection on resume."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-053 - Phase Override Controls

```yaml
plan_unit_id: CWF-053
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The Interview UI exposes a default-off Run all phases checkbox and an ordered
  phase checklist whose manual edits persist into the normalized phase plan.
gui_related: true
gui_classification_reason: This unit defines user-visible checkbox and checklist controls for Interview phase overrides.
split_recommended: true
split_recommendation_reason: Source spans S0048, S0050, and S0066 mix runtime phase persistence with user override controls; this unit covers the GUI override surface.
depends_on: [CWF-051, CWF-052]
unblocks: []
acceptance_criteria:
  - Run all phases is a GUI checkbox.
  - Run all phases defaults off.
  - When Run all phases is on, all registry phases run at Full depth.
  - Phase checklist shows the ordered registry with checkboxes.
  - Unchecked checklist entries force Skip.
  - Manual edits persist as the next normalized phase_plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: override_ui_drift
reasoning_tier: standard
context_scope: adaptive_interview_ui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_phase_override_controls
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0048
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0066
preserved_exact_tokens:
  - "Run all phases"
  - "default off"
  - "ordered registry"
  - "checkboxes"
  - "Unchecked = force `Skip`"
  - "Manual edits persist"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/interview-subagent-integration.md
```

### CWF-054 - Interview Subagent Compatibility Boundary

```yaml
plan_unit_id: CWF-054
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive phases select which existing Interview subagents and
  document/research subagents run without changing subagent ownership or phase
  assignment semantics.
gui_related: false
gui_classification_reason: This is a subagent ownership and compatibility boundary, not GUI presentation.
split_recommended: false
depends_on: [CWF-049, CWF-051]
unblocks: []
acceptance_criteria:
  - Phase subagents remain in place.
  - Document generation subagents still apply to phases that run.
  - Research and validation subagents still apply to phases that run.
  - interview-subagent-integration.md records adaptive phases as intent and context driven phase selection and depth.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_boundary_drift
reasoning_tier: standard
context_scope: interview_subagents
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_interview_subagent_compatibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0049
preserved_exact_tokens:
  - "product-manager"
  - "architect-reviewer"
  - "Document generation"
  - "research/validation"
  - "Adaptive phases: intent and context drive phase selection and depth"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-055 - Adaptive Selection Determinism Risk

```yaml
plan_unit_id: CWF-055
unit_type: risk
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive phase selection must surface determinism risk and may be cached by
  intent plus requirements_hash or made rule-based with optional AI
  recommendation.
gui_related: false
gui_classification_reason: Determinism and caching strategy are runtime policy concerns.
split_recommended: false
depends_on: [CWF-051, CWF-052]
unblocks: []
acceptance_criteria:
  - Determinism risk remains explicit for AI-driven phase selection.
  - Same intent and requirements_hash may be used as a cache key.
  - Rule-based selection with optional AI override remains an allowed mitigation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: nondeterministic_phase_plan
reasoning_tier: standard
context_scope: adaptive_interview
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_adaptive_selection_determinism_risk
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0050
preserved_exact_tokens:
  - "Determinism"
  - "AI-driven"
  - "(intent, requirements_hash)"
  - "rule-based with optional AI override"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-056 - Per-Phase Contract Fragments

```yaml
plan_unit_id: CWF-056
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive Interview phases emit structured contract fragments for scope,
  architecture, product/UX, data, security, deployment, performance, and
  testing, including UI wiring fragments when the user project has a GUI.
gui_related: true
gui_classification_reason: Product/UX phases may emit UI wiring fragments for user-project GUI surfaces.
split_recommended: false
depends_on: [CWF-046, CWF-049]
unblocks: [CWF-057, CWF-058, CWF-059]
acceptance_criteria:
  - Each adaptive interview phase can contribute structured, citable contract fragments.
  - Scope & Goals feeds contract seeds and acceptance checks.
  - Architecture & Technology feeds API, module, and command contracts.
  - Product / UX feeds interface and acceptance contracts.
  - GUI projects also emit UI wiring fragments with interactive-element inventory, preliminary UICommandID assignments, and UI-to-handler mapping seeds.
  - Testing & Verification feeds acceptance_manifest.json and node acceptance arrays.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fragment_coverage_drift
reasoning_tier: high
context_scope: adaptive_interview_contracts
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chain_wizard_per_phase_contract_fragments
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0051
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0052
preserved_exact_tokens:
  - "contract fragments"
  - "Scope & Goals"
  - "Architecture & Technology"
  - "Product / UX"
  - "Data & Persistence"
  - "Security & Secrets"
  - "Deployment & Environments"
  - "Performance & Reliability"
  - "Testing & Verification"
  - "UICommandID"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-057 - Contract Unification Ownership and Conflict Handling

```yaml
plan_unit_id: CWF-057
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The wizard pipeline owns the deterministic Contract Unification Pass after
  Interview completion and before plan generation, merging fragments or blocking
  with blocked_reason equal to contract_conflict.
gui_related: false
gui_classification_reason: Contract unification ownership and conflict handling are pipeline behavior.
split_recommended: true
split_recommendation_reason: Source span S0053 contains ownership, artifact materialization, GUI wiring, and large-output rules; this unit covers ownership and conflict handling.
depends_on: [CWF-056]
unblocks: [CWF-058, CWF-059, CWF-060]
acceptance_criteria:
  - Contract Unification Pass runs after interview status transitions to completed.
  - Contract Unification Pass runs before plan generation begins.
  - Wizard pipeline owns the pass.
  - The pass merges fragments into one coherent contract document with conflict resolution notes.
  - Unresolved deterministic conflicts transition the wizard to blocked with blocked_reason = contract_conflict.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unification_phase_boundary
reasoning_tier: high
context_scope: contract_unification
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_contract_unification_ownership_conflict
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
preserved_exact_tokens:
  - "Contract Unification Pass"
  - "wizard pipeline"
  - "interview status transitions to `completed`"
  - "blocked_reason = contract_conflict"
  - "not a post-processing afterthought"
negative_constraints:
  - "The Contract Unification Pass is not owned by the interview loop."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-058 - Project Artifact Pack and Sharded Graph Materialization

```yaml
plan_unit_id: CWF-058
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contract Unification materializes required .puppet-master/project/ artifacts
  exactly per Project_Output_Artifacts, including contracts, sharded plan_graph,
  acceptance manifest, and contract-referenced plan.md.
gui_related: false
gui_classification_reason: User-project artifact pack and sharded graph materialization are backend artifact contracts.
split_recommended: true
split_recommendation_reason: Source span S0053 contains ownership, artifact materialization, GUI wiring, and large-output rules; this unit covers project artifact materialization.
depends_on: [CWF-047, CWF-048, CWF-057]
unblocks: [CWF-059, CWF-060]
acceptance_criteria:
  - Contract unification assigns stable namespaced deterministic ProjectContract IDs.
  - Required output includes contracts/ and contracts/index.json.
  - Required output includes canonical sharded plan_graph/ with index.json and nodes/<node_id>.json.
  - acceptance_manifest.json is materialized.
  - plan.md remains a human-readable view that references contract IDs.
  - plan_graph.monolithic.json may be materialized only as an optional non-canonical convenience export.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: sharded_graph_drift
reasoning_tier: high
context_scope: project_artifact_pack
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_project_artifact_pack_sharded_graph
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
preserved_exact_tokens:
  - "ProjectContract:*"
  - "contracts/index.json"
  - "plan_graph/"
  - "index.json"
  - "nodes/<node_id>.json"
  - "edges.json"
  - "acceptance_manifest.json"
  - "plan_graph.monolithic.json"
compatibility_only_notes:
  - "plan_graph.monolithic.json is optional, derived, and non-canonical."
negative_constraints:
  - "Validators and orchestrator MUST use sharded plan_graph/ as the execution source of truth."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-059 - GUI Project Wiring Artifacts

```yaml
plan_unit_id: CWF-059
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  When has_gui is true, Contract Unification emits
  .puppet-master/project/ui/wiring_matrix.json and ui_command_catalog.json, and
  UI-scope plan nodes carry wiring or catalog ContractRefs.
gui_related: true
gui_classification_reason: This unit defines generated UI wiring artifacts and GUI-scope validation for user projects with graphical interfaces.
split_recommended: true
split_recommendation_reason: Source spans S0053 and S0054 mix project artifact materialization, GUI wiring, and validation gates; this unit covers GUI wiring artifacts.
depends_on: [CWF-056, CWF-058]
unblocks: [CWF-060]
acceptance_criteria:
  - has_gui true causes Contract Unification to generate .puppet-master/project/ui/wiring_matrix.json.
  - has_gui true causes Contract Unification to generate ui/ui_command_catalog.json.
  - wiring_matrix entries map interactive UI elements to UICommandID, handler, expected events, acceptance checks, and evidence requirements.
  - Project-local schema adaptation preserves Wiring_Matrix schema shape while using project module paths for handler_location and ui_location.
  - UI-scope plan graph nodes include contract_refs for relevant wiring matrix entries or command catalog IDs.
  - Dry-run validation enforces catalog-matrix coverage and no unbound actions when has_gui is true.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ui_wiring_gap
reasoning_tier: high
context_scope: user_project_gui_wiring
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: chain_wizard_gui_project_wiring_artifacts
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0054
preserved_exact_tokens:
  - ".puppet-master/project/ui/"
  - "ui/wiring_matrix.json"
  - "ui/ui_command_catalog.json"
  - "UICommandID"
  - "handler_location"
  - "ui_location"
  - "desktop, web, or mobile"
  - "catalog↔matrix coverage"
negative_constraints:
  - "When has_gui is true, dry-run validation must not allow unbound actions."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
```

### CWF-060 - Large Output and Dry-Run Validation

```yaml
plan_unit_id: CWF-060
unit_type: validation_rule
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contract packs may be chunked with contracts/index.json as the resolver,
  seglog chunking preserves sha256 integrity, and dry-run validation gates
  execution on schema, deterministic ID, contract, graph, and acceptance
  coverage.
gui_related: false
gui_classification_reason: Large-output chunking and dry-run validation are backend artifact validation behavior.
split_recommended: true
split_recommendation_reason: Source spans S0053 and S0054 contain large-output handling and validation rules; this unit covers non-GUI validation.
depends_on: [CWF-047, CWF-048, CWF-058]
unblocks: []
acceptance_criteria:
  - Contract pack chunks remain resolvable through contracts/index.json.
  - Seglog artifact persistence supports deterministic chunking with sha256 integrity events.
  - Dry-run validation enforces artifact presence and schema validity.
  - Dry-run validation enforces deterministic node IDs.
  - Dry-run validation enforces ProjectContract resolvability and acceptance-manifest coverage.
  - Derived monolithic graph exports validate only as consistency exports and never as canonical sources.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_false_pass
reasoning_tier: high
context_scope: project_artifact_validation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_large_output_dry_run_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0053
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0054
preserved_exact_tokens:
  - "contracts/index.json"
  - "deterministic chunking"
  - "sha256"
  - "dry-run validator"
  - "ProjectContract:* resolvability"
  - "acceptance-manifest coverage"
negative_constraints:
  - "If plan_graph.monolithic.json is materialized, validate it only as a derived consistency export and never canonical."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-061 - GitHub Create Repo Setup Flow

```yaml
plan_unit_id: CWF-061
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Project setup for New Project supports actual GitHub repository creation with
  repo name, visibility, optional metadata, HTTPS API create flow, remote setup,
  and optional initial push.
gui_related: true
gui_classification_reason: Repository setup fields and Create action are user-visible wizard controls.
split_recommended: false
depends_on: [CWF-006, CWF-022]
unblocks: [CWF-065]
acceptance_criteria:
  - New Project setup includes an optional Create GitHub repo step.
  - Required field is repository name.
  - Visibility supports Public and Private.
  - Optional fields include description, .gitignore template, license, and default branch name where supported by the GitHub API contract.
  - Create action calls the GitHub HTTPS API create-repo flow.
  - Successful creation sets the remote and may push an initial commit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: github_create_flow_drift
reasoning_tier: standard
context_scope: github_setup
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_github_create_repo_setup
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0055
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0056
preserved_exact_tokens:
  - "Create GitHub repo"
  - "Repository name"
  - "Public | Private"
  - ".gitignore template"
  - "license"
  - "default branch name"
  - "origin"
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
```

### CWF-062 - Fork Creation vs User-Provided Fork

```yaml
plan_unit_id: CWF-062
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Fork & Evolve and Contribute PR offer Create fork for me through GitHub API
  or I'll create the fork myself with fork URL or path validation and explicit
  fork_created_by_app state.
gui_related: true
gui_classification_reason: Fork choice, buttons, instructions, and URL/path fields are user-visible wizard controls.
split_recommended: false
depends_on: [CWF-007, CWF-009, CWF-022]
unblocks: [CWF-063, CWF-064, CWF-065]
acceptance_criteria:
  - User supplies upstream repo as URL or owner/repo.
  - Create fork for me calls the GitHub HTTPS API fork/create flow.
  - App-created fork resolves clone URL, clones to chosen project path, sets working project, optionally sets upstream remote, and stores fork_created_by_app true.
  - I'll create the fork myself shows instructions, accepts fork URL or local path, avoids fork/create API, and stores fork_created_by_app false.
  - User-provided fork path or URL is validated as a git repo.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: fork_path_drift
reasoning_tier: standard
context_scope: github_fork_flow
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_fork_creation_user_provided_fork
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0057
preserved_exact_tokens:
  - "Fork & evolve"
  - "Contribute (PR)"
  - "URL or `owner/repo`"
  - "Create fork for me"
  - "I'll create the fork myself"
  - "fork_url_or_path"
  - "fork_created_by_app: true"
  - "fork_created_by_app: false"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-063 - PR Start Feature Branch Flow

```yaml
plan_unit_id: CWF-063
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contribute PR starts by resolving fork, clone, and one feature branch in the
  main fork clone, with user-provided or suggested branch naming before
  Interview or orchestrator work begins.
gui_related: true
gui_classification_reason: Feature branch creation is exposed through user-visible wizard controls and branch-name input.
split_recommended: true
split_recommendation_reason: Source span S0058 covers both PR start UI and worktree boundary rules; this unit covers start and branch creation.
depends_on: [CWF-062]
unblocks: [CWF-064, CWF-066]
acceptance_criteria:
  - Contribute PR start offers fork, clone, and feature branch setup.
  - If the app created the fork, it clones the fork to the chosen path.
  - If the user provided fork path or URL, the app uses or clones that source.
  - Feature branch name may be user-provided or suggested from intent and requirements.
  - Create feature branch control runs git checkout -b or equivalent before continuing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: pr_start_drift
reasoning_tier: standard
context_scope: pr_start_flow
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/WorktreeGitImprovement.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_pr_start_feature_branch
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0058
preserved_exact_tokens:
  - "fork -> clone -> create a feature branch"
  - "feature/add-x"
  - "fix/issue-42"
  - "feature/"
  - "Create feature branch"
  - "git checkout -b <branch>"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/WorktreeGitImprovement.md
```

### CWF-064 - PR Finish and Default Branch Targeting

```yaml
plan_unit_id: CWF-064
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  PR finish offers commit, push, and Open PR via GitHub HTTPS API, fetching
  upstream default_branch instead of assuming main or master, and linking the
  created PR.
gui_related: true
gui_classification_reason: Commit, push, Open PR, self-service instructions, and PR links are user-visible controls and outputs.
split_recommended: true
split_recommendation_reason: Source spans S0059 and S0067 cover PR finish controls, API behavior, and default branch gap resolution; this unit covers finish and target branch selection.
depends_on: [CWF-063]
unblocks: [CWF-065]
acceptance_criteria:
  - Finish flow offers commit with user-provided or suggested commit message.
  - Finish flow offers push to current branch on the fork remote.
  - Open PR uses GitHub HTTPS API from the fork branch to upstream default branch.
  - Upstream default_branch is fetched through GitHub API before creating the PR.
  - UI links to the created PR.
  - User may choose to commit and open the PR themselves with instructions and optional Compare & pull request link.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wrong_pr_target
reasoning_tier: high
context_scope: pr_finish_flow
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_pr_finish_default_branch_target
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0067
preserved_exact_tokens:
  - "Commit"
  - "Push"
  - "Open PR"
  - "GET /repos/{owner}/{repo}"
  - "default_branch"
  - "Do not hardcode `main` or `master`."
  - "Compare & pull request"
  - "What's a PR?"
negative_constraints:
  - "Do not assume upstream default branch is main or master."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-065 - GitHub Auth Scopes Rate Limits and Host Scope

```yaml
plan_unit_id: CWF-065
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  GitHub create, fork, and PR flows require documented scopes,
  OS-credential-store auth, permission and rate-limit surfacing, GitHub-only MVP
  scope, explicit organization-fork destination selection and preflight, and typed unsupported-host
  outcomes for GitLab or Bitbucket. The retired source-lineage phrase `MVP = user fork only` no
  longer constrains the active organization-fork path; `read:org` is required when organization fork
  destination discovery or permission checks are enabled.
gui_related: true
gui_classification_reason: Permission errors, rate-limit messages, setup/doctor documentation, and future host options are user-visible surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0059-S0061 and S0067 mix auth, no-secret, host-scope, rate-limit, and branch-targeting details; this unit covers auth and host scope.
depends_on: [CWF-061, CWF-062, CWF-064]
unblocks: []
acceptance_criteria:
  - Push and PR creation source auth from SSH or OS credential store at runtime.
  - Tokens are not embedded in remotes or logs.
  - Required GitHub scopes include repo for MVP create repo, fork, push branch, and open PR.
  - Organization fork destination selection requires explicit preflight and `read:org` when organization discovery or permission checks are enabled.
  - Permission errors surface a message naming required scopes.
  - Non-GitHub hosts return typed unsupported-host outcomes with owner docs and recovery/help actions; they are not silent placeholders.
  - Rate limits are respected and surfaced to the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_scope_drift
reasoning_tier: high
context_scope: github_auth_scope
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/MiscPlan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_github_auth_scope_rate_limit_host_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0061
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0067
  - pldg-20260614-002-part-3-fable-cleanup:atom-0027
preserved_exact_tokens:
  - "repo"
  - "read:org"
  - "workflow"
  - "Permission denied"
  - "OS credential store"
  - "do not embed tokens in remotes or logs"
  - "GitHub only"
  - "MVP = user fork only"
  - "organization-fork preflight"
  - "typed unsupported-host outcomes"
  - "Rate limits"
compatibility_only_notes:
  - "`MVP = user fork only` is preserved as stale source lineage only; active canon requires a typed organization-fork path with preflight and scoped `read:org` behavior when organization forks are enabled."
negative_constraints:
  - "Do not store tokens in seglog/redb/Tantivy or logs."
  - "Do not preserve `MVP = user fork only` as a blocker to organization-fork destination selection and preflight."
  - "Do not implement non-GitHub repository hosts silently; return typed unsupported-host outcomes with owner docs and recovery/help actions."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/MiscPlan.md
```

### CWF-066 - PR Branch and Worktree Boundary

```yaml
plan_unit_id: CWF-066
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Contribute PR uses the main clone feature branch as the user-facing branch,
  while any orchestrator worktrees remain distinct and must not replace the PR
  branch ref.
gui_related: false
gui_classification_reason: Branch/worktree separation is runtime and git workflow behavior rather than GUI presentation.
split_recommended: true
split_recommendation_reason: Source spans S0058, S0060, and S0067 mix PR start and worktree collision boundaries; this unit covers branch/worktree separation.
depends_on: [CWF-063]
unblocks: []
acceptance_criteria:
  - Contribute PR uses one feature branch in the main fork clone.
  - Contribute PR does not create node worktrees or per-node worktree branches for that intent.
  - Branch naming reuses WorktreeGitImprovement sanitization and invalid-ref handling.
  - If orchestrator subtask worktrees are used, they are distinct and do not replace the PR branch ref.
  - PR branch remains the checked-out user-facing branch in the single clone.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_pr_collision
reasoning_tier: high
context_scope: git_worktree_boundary
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/WorktreeGitImprovement.md
  - Plans/MiscPlan.md
node_compile_hint:
  mode: chain_wizard_pr_branch_worktree_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0067
preserved_exact_tokens:
  - "single feature branch"
  - "main clone"
  - "no per-node worktree branches"
  - "WorktreeGitImprovement.md"
  - "no invalid refs"
  - "PR branch is the user-facing branch"
negative_constraints:
  - "Contribute (PR) does not create node worktrees or per-node worktree branches."
  - "Orchestrator worktrees must not replace the PR branch ref."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/WorktreeGitImprovement.md
```

### CWF-067 - Adjacent Plan Owner Map

```yaml
plan_unit_id: CWF-067
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The Relationship table records adjacent owner and consumer docs for
  requirements, Builder, Interview, Project_Output_Artifacts,
  WorktreeGitImprovement, MiscPlan, usage, providers, and tools without
  re-owning those contracts.
gui_related: false
gui_classification_reason: Owner map routing is documentation/governance behavior, not GUI implementation work.
split_recommended: false
depends_on: [CWF-046, CWF-056, CWF-061]
unblocks: []
acceptance_criteria:
  - REQUIREMENTS.md remains a referenced source for Start Chain steps.
  - assistant-chat-design.md remains the Assistant/Builder handoff consumer.
  - interview-subagent-integration.md remains the adaptive Interview consumer.
  - Project_Output_Artifacts.md remains the SSOT for required user-project artifacts and canonical seglog persistence.
  - WorktreeGitImprovement.md remains the branch, PR creation, and worktree lifecycle owner.
  - MiscPlan remains the git-ignore, no-secrets, and cleanup allowlist companion.
  - usage-feature, Provider_OpenCode, and newtools remain adjacent consumers without direct wizard flow ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_map_drift
reasoning_tier: standard
context_scope: cross_doc_owner_map
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: chain_wizard_adjacent_plan_owner_map
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0062
preserved_exact_tokens:
  - "Plans/Project_Output_Artifacts.md"
  - "Single source of truth"
  - ".puppet-master/project/"
  - "WorktreeGitImprovement.md"
  - "additional GUI and flow steps"
  - "No direct change"
  - "Provider_OpenCode.md"
negative_constraints:
  - "The Relationship table does not re-own adjacent contracts."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/00-plans-index.md
```

### CWF-068 - Intent Change Recovery and Builder-Interview State Guard

```yaml
plan_unit_id: CWF-068
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Intent changes after downstream state require the exact confirmation modal and
  reset behavior, recovery snapshots preserve intent and wizard_step, and
  Builder handoff must carry project_path and intent into Interview without
  empty/default overwrite.
gui_related: true
gui_classification_reason: This unit includes the user-visible confirmation modal and recovery/resume effects on wizard screens.
split_recommended: true
split_recommendation_reason: Source spans S0063 and S0064 contain section boundary plus multiple flow-state resolutions; this unit covers flow-state recovery guards.
depends_on: [CWF-010, CWF-015, CWF-023]
unblocks: []
acceptance_criteria:
  - Intent changes after requirements or interview show the exact confirmation modal.
  - Continue clears requirements list, canonical path, Builder handoff flag, and interview state.
  - Continue sets wizard step to project setup and keeps project_path plus the new intent value.
  - Cancel closes the modal without changing state.
  - Recovery snapshots preserve intent and wizard_step.
  - Builder-to-Interview handoff persists project_path and intent and guards against empty/default overwrite.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: state_reset_loss
reasoning_tier: high
context_scope: wizard_state_recovery
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/newfeatures.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_intent_change_recovery_builder_interview_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0063
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0064
preserved_exact_tokens:
  - "Changing intent will clear requirements and interview progress. Continue?"
  - "[Continue] [Cancel]"
  - "intent"
  - "wizard_step"
  - "project_path"
  - "no stale \"no project\" state"
negative_constraints:
  - "Interview initialization must not overwrite handoff project_path and intent with empty/default values."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/newfeatures.md
  - Plans/FinalGUISpec.md
```

### CWF-069 - Requirements Merge Template and Builder Abandonment Resolutions

```yaml
plan_unit_id: CWF-069
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements and Builder gap resolutions fix merge order, required Builder
  sections, and abandonment controls, with uploads first, Builder last,
  validation warnings for missing sections, and no automatic save or handoff on
  cancel or timeout.
gui_related: true
gui_classification_reason: Cancel, return, timeout, and warning controls are user-visible Builder and requirements UI behavior.
split_recommended: false
depends_on: [CWF-029, CWF-031, CWF-035, CWF-037]
unblocks: []
acceptance_criteria:
  - Multiple uploads plus Builder output merge uploaded files first and Builder output last.
  - MVP may concatenate with section separators while documenting uploads first and Builder last.
  - Builder output template includes required top-level sections.
  - Assistant/Builder prompt and post-processing emit the single Builder output template.
  - PRD generator and Interview assume the Builder output template and warn when sections are missing.
  - Cancel and return to requirements saves nothing.
  - Idle-timeout prompt does not automatically save or hand off Builder output.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_gap_regression
reasoning_tier: high
context_scope: requirements_builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_requirements_merge_template_builder_abandonment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0065
preserved_exact_tokens:
  - "uploads first, Builder last"
  - "Scope"
  - "Goals"
  - "Out of scope"
  - "Acceptance criteria"
  - "Non-goals"
  - "Cancel and return to requirements"
  - "30 minutes"
  - "No automatic save or handoff"
negative_constraints:
  - "Do not automatically save or hand off Builder output on cancel or timeout."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### CWF-070 - Wizard Progress Indicator and Deferred Skip-to-Execution

```yaml
plan_unit_id: CWF-070
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard length is mitigated with a visible step/total progress indicator while
  skip-to-execution for users who already have requirements and prd.json remains
  future work only.
gui_related: true
gui_classification_reason: Progress indicators and skip affordances are user-visible wizard UX.
split_recommended: true
split_recommendation_reason: Source span S0068 contains several GUI/UX resolutions; this unit covers wizard length and deferred skip-to-execution only.
depends_on: [CWF-018, CWF-025]
unblocks: []
acceptance_criteria:
  - Wizard UI shows current step index and total.
  - Progress indicator copy can use examples such as Step 2 of 6.
  - Skip-to-execution for already available requirements and prd.json is deferred to later phase.
  - Deferred skip-to-execution is documented as future work rather than current implementation scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_length
reasoning_tier: standard
context_scope: wizard_gui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_progress_indicator_deferred_skip
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "Step 2 of 6"
  - "I already have requirements and prd.json"
  - "deferred to a later phase"
  - "future work"
negative_constraints:
  - "Do not implement skip-to-execution in the current phase."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-071 - Legible Project Shell Complexity Guard

```yaml
plan_unit_id: CWF-071
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The wizard may borrow selectively from IDE workspace models but must avoid a
  high-complexity project shell and prefer legible setup, file-tree ergonomics,
  and immediate /test/share/apply workflows.
gui_related: true
gui_classification_reason: Project shell complexity, navigation, and file-tree ergonomics are user-visible GUI concerns.
split_recommended: true
split_recommendation_reason: Source span S0068 contains several GUI/UX resolutions; this unit covers visible project shell complexity.
depends_on: [CWF-018]
unblocks: [CWF-072]
acceptance_criteria:
  - Wizard can borrow selectively from IDE workspace or project models.
  - Wizard does not import a high-complexity project shell.
  - GUI avoids hangs, heavy navigation regressions, terminal-cwd friction, and cross-tool source-resolution bugs.
  - Project setup, file-tree ergonomics, and visible immediate test/share/apply workflows are preferred over abstract flexibility.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ide_complexity_regression
reasoning_tier: high
context_scope: wizard_gui_shell
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
node_compile_hint:
  mode: chain_wizard_legible_project_shell_complexity_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "IDE-grade complexity risk"
  - "hangs"
  - "terminal-cwd friction"
  - "/source-resolution"
  - "/test/share/apply"
negative_constraints:
  - "Do not import a high-complexity project shell."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
```

### CWF-072 - Cross-Surface Source Context Preservation

```yaml
plan_unit_id: CWF-072
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Cross-surface handoffs must preserve exact source, project, terminal cwd, and file context so source resolution does not drift between tools.
gui_related: false
gui_classification_reason: Source/project/cwd/file handoff identity is runtime context preservation, not visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0068 mixes GUI complexity with runtime handoff identity; this unit covers context preservation.
depends_on: [CWF-071]
unblocks: []
acceptance_criteria:
  - Cross-surface handoff preserves exact source identity.
  - Cross-surface handoff preserves project identity.
  - Cross-surface handoff preserves terminal cwd.
  - Cross-surface handoff preserves file context.
  - Source resolution does not drift between tools.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_context_drift
reasoning_tier: high
context_scope: cross_surface_handoff
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
node_compile_hint:
  mode: chain_wizard_cross_surface_source_context_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "exact source"
  - "project"
  - "terminal cwd"
  - "file context"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FileManager.md
```

### CWF-073 - Agent Activity Pane Accessibility and Stream Bounds

```yaml
plan_unit_id: CWF-073
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The shared agent activity pane keeps bounded, readable, accessible streaming
  output with fixed minimum height, stream virtualization, progressbar semantics,
  keyboard controls, and reduced-motion behavior.
gui_related: true
gui_classification_reason: The activity pane, stream, progressbar, and buttons are visible interactive UI surfaces.
split_recommended: true
split_recommendation_reason: Source span S0068 contains several GUI/UX resolutions; this unit covers activity pane layout and accessibility.
depends_on: [CWF-025, CWF-026, CWF-027]
unblocks: []
acceptance_criteria:
  - Shared agent activity view is non-interactive and streaming.
  - Minimum embedded pane height is 120px in wizard or Interview.
  - Stream shows at most 500 visible lines before virtualization or Show older.
  - Stream content uses monospace font.
  - Progress bar or status strip uses aria-live polite and role progressbar with values when determinate.
  - Pause, Cancel, and Resume buttons are keyboard focusable and clearly labeled for assistive tech.
  - Reduced-motion preference disables animated progress bar fill.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: agent_activity_a11y_drift
reasoning_tier: high
context_scope: agent_activity_ui
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_agent_activity_pane_a11y_stream_bounds
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "120px"
  - "500"
  - "Show older"
  - "aria-live=\"polite\""
  - "role=\"progressbar\""
  - "aria-valuenow"
  - "Review pass 2 of 3"
negative_constraints:
  - "When reduced-motion is preferred, do not animate progress bar fill."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-074 - New Wizard Control Accessibility

```yaml
plan_unit_id: CWF-074
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Intent selection and Builder, Create fork, and Open PR controls must preserve focus order, labels, keyboard activation, ARIA where needed, and screen-reader text.
gui_related: true
gui_classification_reason: Intent selection and new action buttons are visible wizard controls.
split_recommended: true
split_recommendation_reason: Source span S0068 contains multiple GUI/UX concerns; this unit covers control accessibility.
depends_on: [CWF-019, CWF-061, CWF-062, CWF-064]
unblocks: []
acceptance_criteria:
  - Intent selection is keyboard-accessible and screen-reader friendly.
  - Builder controls are keyboard-accessible and screen-reader friendly.
  - Create fork controls are keyboard-accessible and screen-reader friendly.
  - Open PR controls are keyboard-accessible and screen-reader friendly.
  - Existing widget catalog and patterns are used for focus order, labels, and ARIA where needed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: a11y_regression
reasoning_tier: high
context_scope: wizard_controls
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: chain_wizard_new_control_accessibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "Intent selection"
  - "Builder"
  - "Create fork"
  - "Open PR"
  - "focus order"
  - "ARIA"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
```

### CWF-075 - Centralized User-Facing Wizard Strings

```yaml
plan_unit_id: CWF-075
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: New intent labels, buttons, and help text are stored in a centralized string module or locale resource keyed by ID, with no inline hardcoded strings in view code.
gui_related: true
gui_classification_reason: User-facing labels, buttons, and help text are visible GUI copy.
split_recommended: true
split_recommendation_reason: Source span S0068 contains multiple GUI/UX concerns; this unit covers i18n and string ownership.
depends_on: [CWF-019, CWF-061, CWF-062, CWF-064]
unblocks: []
acceptance_criteria:
  - Intent labels are stored in a central string module or locale resource.
  - Button labels are stored in a central string module or locale resource.
  - Help text is stored in a central string module or locale resource.
  - Strings are keyed by stable IDs.
  - View code does not inline hardcoded strings for these features.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: i18n_drift
reasoning_tier: standard
context_scope: wizard_i18n
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_centralized_user_facing_strings
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0068
preserved_exact_tokens:
  - "strings.rs"
  - "locale files"
  - "keyed by id"
  - "no inline hardcoded strings"
negative_constraints:
  - "Do not inline hardcoded strings in view code for these features."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-076 - Handoff and PR Body Secret Exclusion

```yaml
plan_unit_id: CWF-076
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Requirements docs, Builder output, Interview handoff, and PR body generation must not accept, embed, or propagate tokens/secrets and must sanitize sensitive fields before PR creation.
gui_related: false
gui_classification_reason: Secret exclusion and sanitization are security/data-handling requirements, not GUI presentation.
split_recommended: true
split_recommendation_reason: Source span S0069 contains multiple security resolutions; this unit covers no-secrets behavior.
depends_on: [CWF-034, CWF-064, CWF-065]
unblocks: []
acceptance_criteria:
  - Requirements doc does not accept or embed tokens/secrets.
  - Builder output does not accept or embed tokens/secrets.
  - Interview handoff does not include tokens/secrets.
  - PR body template excludes or sanitizes sensitive fields before opening PR.
  - Implementation checklist includes no secrets in requirements doc, Builder output, or PR body.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_leak
reasoning_tier: high
context_scope: wizard_security
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/MiscPlan.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: chain_wizard_handoff_pr_body_secret_exclusion
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0069
preserved_exact_tokens:
  - "No secrets in handoff"
  - "requirements doc"
  - "Builder output"
  - "PR body"
  - "sanitize"
negative_constraints:
  - "Requirements doc and Builder output must not be used to pass tokens or secrets."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/MiscPlan.md
  - Plans/WorktreeGitImprovement.md
```

### CWF-077 - Untrusted Upstream Clone No-Execution Boundary

```yaml
plan_unit_id: CWF-077
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Fork/PR setup from untrusted upstreams may clone and create a branch but must not run upstream scripts, hooks, or code during fork/clone.
gui_related: false
gui_classification_reason: Avoiding upstream code execution is security/runtime behavior.
split_recommended: true
split_recommendation_reason: Source span S0069 contains multiple security resolutions; this unit covers untrusted upstream behavior.
depends_on: [CWF-062, CWF-063]
unblocks: []
acceptance_criteria:
  - Fork/PR flow may clone upstream-derived repositories.
  - Fork/PR flow may create a branch.
  - Fork/PR flow does not run upstream scripts during fork or clone.
  - Fork/PR flow does not run upstream hooks during fork or clone.
  - Documentation clearly states that setup does not execute code from upstream.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: untrusted_code_execution
reasoning_tier: high
context_scope: github_security
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: chain_wizard_untrusted_upstream_no_execution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0069
preserved_exact_tokens:
  - "Fork/PR from untrusted upstream"
  - "only clone and create a branch"
  - "do not run upstream scripts or hooks"
  - "No execution of code from upstream"
negative_constraints:
  - "Do not run upstream scripts, hooks, or code during fork/clone."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-078 - User-Project Artifact Consumer Boundary

```yaml
plan_unit_id: CWF-078
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Chain Wizard consumes Plans/Project_Output_Artifacts.md for exact user-project artifact, sharding, and persistence contracts, while keeping CWF flow-specific and avoiding local schema restatement.
gui_related: false
gui_classification_reason: Artifact owner/consumer boundaries are governance and backend artifact behavior.
split_recommended: true
split_recommendation_reason: Source span S0072 contains artifact owner boundary plus sharded artifact requirements; this unit covers owner boundary and staging promotion.
depends_on: [CWF-047, CWF-058]
unblocks: [CWF-079]
acceptance_criteria:
  - Interviewer and Wizard outputs follow Project_Output_Artifacts canonical artifact, sharding, and persistence contract.
  - Chain Wizard remains flow-specific and does not restate SSOT schema fields.
  - Uploads and Builder output remain staging inputs under .puppet-master/requirements/*.
  - Before Interview/start-chain execution, canonical promotion writes .puppet-master/project/requirements.md.
  - Contract Unification materializes canonical outputs under .puppet-master/project/ exactly per SSOT.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_owner_boundary_drift
reasoning_tier: high
context_scope: project_artifact_pack
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
node_compile_hint:
  mode: chain_wizard_user_project_artifact_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0072
preserved_exact_tokens:
  - "flow-specific"
  - "does not restate SSOT schema fields"
  - ".puppet-master/requirements/*"
  - ".puppet-master/project/requirements.md"
negative_constraints:
  - "Do not restate SSOT schema fields in this plan."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Document_Packaging_Policy.md
```

### CWF-079 - Sharded Project Graph Execution Input Boundary

```yaml
plan_unit_id: CWF-079
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Validators and orchestrator use only the canonical sharded plan_graph as scheduling/execution input; monolithic graph export is optional, derived, and consistency-only.
gui_related: false
gui_classification_reason: Sharded plan graph scheduling input rules are backend artifact validation behavior.
split_recommended: false
depends_on: [CWF-058, CWF-060, CWF-078]
unblocks: []
acceptance_criteria:
  - Canonical execution graph is sharded-only.
  - Scheduling/execution input uses .puppet-master/project/plan_graph/index.json and referenced nodes/<node_id>.json shards.
  - optional edges.json remains optional.
  - plan_graph.monolithic.json is optional derived export only.
  - Validators and orchestrator never treat monolithic graph export as canonical input.
  - Field-level schema, deterministic node-ID, contract/acceptance coverage, and evidence requirements stay owned by Project_Output_Artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: sharded_graph_execution_input_drift
reasoning_tier: high
context_scope: project_plan_graph
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_sharded_project_graph_execution_input
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0072
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0073
preserved_exact_tokens:
  - "sharded-only"
  - "plan_graph/index.json"
  - "nodes/<node_id>.json"
  - "edges.json"
  - "plan_graph.monolithic.json"
  - "non-canonical"
  - "never required"
compatibility_only_notes:
  - "plan_graph.monolithic.json is optional derived export only."
negative_constraints:
  - "Validators and orchestrator MUST use only the canonical sharded graph for scheduling/execution inputs."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-080 - Project Auto-Decisions and HITL Scheduling

```yaml
plan_unit_id: CWF-080
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Ambiguity uses deterministic defaults with auto-decision records in project artifacts and seglog, while tool_policy_mode ask approvals do not block unrelated runnable scheduler work.
gui_related: false
gui_classification_reason: Automatic decisions, HITL policy, and scheduler continuation are runtime/governance behavior.
split_recommended: false
depends_on: [CWF-058, CWF-060]
unblocks: []
acceptance_criteria:
  - Remaining ambiguity applies deterministic defaults per Decision Policy.
  - Each automatic decision records node_id, decision_id, chosen, reason, and contract_refs.
  - Automatic decisions are written to .puppet-master/project/auto_decisions.jsonl and canonically in seglog.
  - Nodes may require approvals with tool_policy_mode = ask.
  - A node waiting on approval does not block other runnable nodes whose dependencies allow scheduling.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_scheduler_drift
reasoning_tier: high
context_scope: autonomy_hitl
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_project_auto_decisions_hitl_scheduling
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0074
preserved_exact_tokens:
  - "auto_decisions.jsonl"
  - "{node_id, decision_id, chosen, reason, contract_refs[]}"
  - "tool_policy_mode = ask"
  - "without blocking the entire run"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
```

### CWF-081 - Mandatory Headless Invariant Sweep Boundary

```yaml
plan_unit_id: CWF-081
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The always-on Auditor invariant loop runs immediately after Contract
  Unification on the provisional project pack, is separate from optional §5.6
  Multi-Pass Review, cannot be disabled, and repeats audit, bounded repair,
  and re-audit until certification or critical block without human intervention
  or GUI.
gui_related: false
gui_classification_reason: The invariant sweep is a headless validation pipeline; the GUI is mentioned only as absent.
split_recommended: true
split_recommendation_reason: Source spans S0075-S0076 introduce the sweep and legacy pass ordering; this unit covers the boundary and current Auditor loop sequencing.
depends_on: [CWF-057, CWF-060]
unblocks: [CWF-082, CWF-083, CWF-084, CWF-085]
acceptance_criteria:
  - Auditor invariant loop runs immediately after Contract Unification Pass produces provisional canonical project artifact pack.
  - Auditor invariant loop is separate from optional user-facing §5.6 Multi-Pass Review.
  - Auditor invariant loop cannot be disabled.
  - Auditor invariant loop runs even when other review features are present or enabled.
  - Loop cycles repeat audit, bounded repair, and re-audit until certified or critically blocked.
  - Loop requires no human intervention and no running GUI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_bypass
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_mandatory_headless_invariant_sweep
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0075
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0076
preserved_exact_tokens:
  - "always-on mandatory invariant sweep"
  - "provisional"
  - "cannot be disabled"
  - "without requiring human intervention or a running GUI"
  - "Pass 1 → Pass 2 → Pass 3"
  - "Auditor audit-to-repair loop"
negative_constraints:
  - "The invariant sweep cannot be disabled."
  - "Do not treat Pass 1 / Pass 2 / Pass 3 as active process stages; they are compatibility aliases only."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-082 - Legacy Pass 1 Alias And Initial Auditor Quality Report

```yaml
plan_unit_id: CWF-082
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The initial Auditor audit cycle validates and completes the provisional
  artifact pack, may mirror legacy Pass 1 / validation_pass_report fields for
  document_creation compatibility, and writes a read-only
  requirements_quality_report without authoring requirements or contract
  fragments.
gui_related: false
gui_classification_reason: Initial Auditor report generation and artifact validation are backend validation behavior.
split_recommended: false
depends_on: [CWF-081]
unblocks: [CWF-083, CWF-085]
acceptance_criteria:
  - Initial Auditor audit validates and completes the provisional artifact pack produced by Contract Unification.
  - Initial Auditor audit may materialize missing derived artifacts or deterministic projections.
  - Initial Auditor audit is not the first author of requirements or contract fragments.
  - Legacy Pass 1 validation_pass_report fields may be mirrored with pass_number 1 and pass_name document_creation only when compatibility_only is true and cycle_report_ref points to the canonical Auditor cycle report.
  - Initial Auditor audit writes requirements_quality_report at .puppet-master/project/traceability/requirements_quality_report.json.
  - requirements_quality_report is read-only for requirements intent and classifies auto_fixable true/false without editing requirements.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auditor_initial_quality_report_drift
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_auditor_initial_quality_report
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0077
preserved_exact_tokens:
  - "pass_name: \"document_creation\""
  - "diff_pointers"
  - "requirements_quality_report"
  - "pm.requirements_quality_report.schema.v1"
  - "auto_fixable"
negative_constraints:
  - "Pass 1 is a compatibility alias only."
  - "Initial Auditor audit does not edit requirements."
  - "Initial Auditor audit is not the first author of requirements or contract fragments."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-083 - Legacy Pass 2 Alias And Bounded Auditor Repair

```yaml
plan_unit_id: CWF-083
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Bounded Auditor repair compares project artifacts against contracts and canon,
  applies resolvable fixes, applies auto_fixable requirement-quality fixes,
  updates reports, and records unresolved findings without treating legacy Pass
  2 as an active process stage.
gui_related: false
gui_classification_reason: Bounded Auditor correction and report behavior are backend validation pipeline behavior.
split_recommended: false
depends_on: [CWF-081, CWF-082]
unblocks: [CWF-084, CWF-085, CWF-086]
acceptance_criteria:
  - Bounded Auditor repair compares requirements, contract pack, plan_graph nodes, and acceptance_manifest against canonical references.
  - For each gap or contradiction, bounded Auditor repair records findings and applies fixes where possible.
  - Bounded Auditor repair records diff_pointer information for applied fixes.
  - Bounded Auditor repair records unresolved_findings when no fix is possible.
  - Bounded Auditor repair applies auto-fixes from requirements_quality_report where auto_fixable == true.
  - Bounded Auditor repair updates requirements_quality_report in place with final post-fix state.
  - Bounded Auditor repair does not escalate directly; it updates the quality report artifact for certification/block semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_alignment_false_pass
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Contracts_V0.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_auditor_bounded_repair_auto_fixes
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0078
preserved_exact_tokens:
  - "canonical_alignment"
  - "findings[]"
  - "changes_applied_summary"
  - "unresolved_findings[]"
  - "auto_fixes_applied[]"
  - "auto_fixable == true"
negative_constraints:
  - "Pass 2 is a compatibility alias only."
  - "Bounded Auditor repair does not escalate directly."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-084 - Legacy Pass 3 Alias And Auditor Certification Gate

```yaml
plan_unit_id: CWF-084
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The Auditor certification gate enforces DRY/SSOT, plan graph, wiring,
  evidence, and deterministic decision invariants while never modifying
  requirements.md, plan.md, or user-intent-derived content; legacy Pass 3 fields
  are compatibility aliases only.
gui_related: false
gui_classification_reason: Auditor certification validates artifacts, including GUI wiring when present, but does not implement GUI presentation.
split_recommended: false
depends_on: [CWF-081, CWF-083]
unblocks: [CWF-085, CWF-086]
acceptance_criteria:
  - Auditor certification focuses on canonical system integrity before certifying or blocking.
  - Auditor certification enforces DRY/SSOT compliance.
  - Auditor certification enforces plan graph integrity.
  - Auditor certification enforces wiring matrix consistency when the user project has a GUI.
  - Auditor certification enforces evidence/invariants alignment.
  - Auditor certification enforces deterministic decisions/autonomy compliance.
  - Auditor certification never modifies requirements.md, plan.md, or user-intent-derived artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_systems_sweep_drift
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/DRY_Rules.md
  - Plans/Wiring_Matrix.schema.json
node_compile_hint:
  mode: chain_wizard_auditor_certification_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0079
preserved_exact_tokens:
  - "canonical_systems"
  - "DRY/SSOT"
  - "UICommandID"
  - "pass_3_violation:"
  - "MUST NOT modify"
negative_constraints:
  - "Pass 3 is a compatibility alias only."
  - "Auditor certification MUST NOT modify requirements.md, plan.md, or any artifact whose content is driven by user intent or product scope."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-085 - Validation Sweep Execution Settings and Report Emission

```yaml
plan_unit_id: CWF-085
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The sweep runs deterministically and headlessly, uses one Auditor validation
  loop provider/model setting for all Auditor cycle reports, emits enough
  reports to prove audit/repair/re-audit/certification or block, and treats
  legacy pass reports as compatibility rows only.
gui_related: false
gui_classification_reason: Sweep execution settings and report emission are backend validation behavior.
split_recommended: true
split_recommendation_reason: Source spans S0080 and S0081 mix execution settings, report rules, acceptance criteria, and failure routing; this unit covers execution/report emission.
depends_on: [CWF-081, CWF-082, CWF-083, CWF-084]
unblocks: [CWF-086, CWF-087]
acceptance_criteria:
  - Auditor loop cycles run deterministically without human intervention.
  - Each cycle runs headless with no GUI and no approval gate inside the loop.
  - Auditor validation loop provider and model are configurable through app settings.
  - Defaults are deterministic and safe when not explicitly configured.
  - Each Auditor cycle report includes provider and model matching the resolved Auditor validation loop provider/model from sweep start.
  - The loop emits enough reports to prove audit, bounded repair, re-audit, and certified or critical-block terminal state.
  - Legacy validation_pass_report rows and pass_verdict skipped values may be emitted only as compatibility mirrors with compatibility_only true and cycle_report_ref.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_report_emission_drift
reasoning_tier: high
context_scope: validation_sweep
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_validation_sweep_execution_settings_reports
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0080
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0081
preserved_exact_tokens:
  - "model_roles.auditor.provider"
  - "model_roles.auditor.model"
  - "Auditor validation loop"
  - "Exactly three pass reports"
  - "pass_verdict: \"skipped\""
  - "certified or critical-block terminal state"
negative_constraints:
  - "No GUI is required and no user approval gate exists between passes."
  - "Do not expose fixed Pass 1 / Pass 2 / Pass 3 model settings."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-086 - Validation Failure Routing and Finding Artifact Split

```yaml
plan_unit_id: CWF-086
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Auditor loop blocks route to user-visible clarification or resolution
  surfaces using distinct needs_user_clarification and unresolved_findings
  artifacts while preserving corrected-but-blocked artifacts for resume.
gui_related: true
gui_classification_reason: Failure routing drives user-visible Interview clarification and review/resolution UI surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0080 and S0081 mix backend report semantics with user-visible clarification/review routing; this unit covers routing and artifact split.
depends_on: [CWF-083, CWF-084, CWF-085]
unblocks: []
acceptance_criteria:
  - Initial Auditor audit failure without allowed deterministic repair halts and surfaces failure to the user.
  - If bounded Auditor repair produces non-empty needs_user_clarification, wizard transitions to clarification/resume path.
  - Auditor certification is blocked when clarification or authority boundaries block progress.
  - Corrected-but-blocked artifact set is preserved for resume.
  - unresolved_findings is distinct from needs_user_clarification.
  - needs_user_clarification drives interview UI.
  - unresolved_findings drives review/resolution UI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_routing_drift
reasoning_tier: high
context_scope: validation_failure_routing
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_validation_failure_routing_finding_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0080
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0081
preserved_exact_tokens:
  - "needs_user_clarification[]"
  - "unresolved_findings[]"
  - "question_id"
  - "finding_id"
  - "corrected-but-blocked artifact set"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

### CWF-087 - Auditor Cycle Report Lineage and Runtime Identity Carry-Through

```yaml
plan_unit_id: CWF-087
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Auditor cycle reports carry lineage fields and skipped-verdict support, legacy validation_pass_report mirrors may expose the same data only with compatibility_only true and cycle_report_ref, and effective runtime identity survives validation into launch handoff.
gui_related: false
gui_classification_reason: Validation report lineage and runtime identity handoff are backend/report semantics.
split_recommended: false
depends_on: [CWF-016, CWF-085]
unblocks: []
acceptance_criteria:
  - Auditor cycle reports include workflow_run_id.
  - Auditor cycle reports include phase_plan_ref.
  - Auditor cycle reports include staged_bundle_ref.
  - Auditor cycle reports include requirements_quality_report_ref.
  - Auditor cycle reports include run_id.
  - Auditor validation cycles emit lineage-rich cycle reports explaining what was evaluated and what execution was seeded.
  - Legacy validation_pass_report mirrors carry compatibility_only true and cycle_report_ref.
  - pass_verdict supports skipped.
  - Effective runtime identity survives validation into launch handoff.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_lineage_identity_drift
reasoning_tier: high
context_scope: validation_report_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: chain_wizard_validation_report_lineage_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0082
preserved_exact_tokens:
  - "workflow_run_id"
  - "phase_plan_ref"
  - "staged_bundle_ref"
  - "requirements_quality_report_ref"
  - "run_id"
  - "lineage-rich pass reports"
  - "pass_verdict"
  - "skipped"
  - "effective runtime identity"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-088 - No-Wizard Flow Owner Boundary

```yaml
plan_unit_id: CWF-088
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: CWF records no-wizard entry-point wiring and cross-references, while the full flow specification remains owned by Plans/GitHub_Integration.md §D.
gui_related: false
gui_classification_reason: This unit is an owner/consumer boundary and cross-reference, not GUI implementation.
split_recommended: false
depends_on: [CWF-067]
unblocks: [CWF-089, CWF-090, CWF-091, CWF-092]
acceptance_criteria:
  - Full no-wizard flow specification remains in GitHub_Integration.md §D.
  - CWF only records cross-reference and entry-point wiring.
  - DRY and Decision Policy constraints still apply.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: no_wizard_owner_boundary_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: chain_wizard_no_wizard_flow_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0083
preserved_exact_tokens:
  - "No-Wizard Project Management Flows"
  - "Plans/GitHub_Integration.md §D"
  - "entry-point wiring"
negative_constraints:
  - "CWF does not re-own the full no-wizard flow specification."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
```

### CWF-089 - No-Wizard Entry Points and Later-Wizard Preload Overview

```yaml
plan_unit_id: CWF-089
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Three project management flows are reachable from File menu Project or Dashboard and each finishes with a Run Chain Wizard later affordance that preloads the new project context.
gui_related: true
gui_classification_reason: File menu, Dashboard entry points, and finish-screen affordance are user-visible GUI surfaces.
split_recommended: false
depends_on: [CWF-088]
unblocks: [CWF-090, CWF-091, CWF-092]
acceptance_criteria:
  - Add Existing Project flow is available without requiring Chain Wizard.
  - Create New Local Project flow is available without requiring Chain Wizard.
  - Create New GitHub Repo + Project flow is available without requiring Chain Wizard.
  - Users can reach no-wizard flows from File menu Project or Dashboard.
  - Each no-wizard flow surfaces Run Chain Wizard later on its finish screen.
  - Run Chain Wizard later preloads the newly added or created project context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: no_wizard_entry_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_no_wizard_entry_points_preload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0084
preserved_exact_tokens:
  - "Add Existing Project"
  - "Create New Local Project"
  - "Create New GitHub Repo + Project"
  - "Run Chain Wizard later"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
```

### CWF-090 - Add Existing Project No-Wizard Flow

```yaml
plan_unit_id: CWF-090
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Add Existing Project lets users pick a local folder or SSH remote path, auto-detects repo/language/framework/project name, optionally links GitHub, opens File Manager/editor, and offers Run Chain Wizard later.
gui_related: true
gui_classification_reason: Add Existing Project is a user-visible project-add flow with picker, dashboard/menu entry, and finish action.
split_recommended: false
depends_on: [CWF-088, CWF-089]
unblocks: []
acceptance_criteria:
  - Entry is File menu -> Add Existing Project or Dashboard -> Add Project.
  - User selects a local folder through native OS picker or picks an SSH remote and path.
  - Puppet Master auto-detects git repo presence, language/framework, and suggested project name.
  - Optional Link to GitHub uses device-code auth if needed.
  - Finish opens the project in File Manager and editor.
  - Finish offers Run Chain Wizard later.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: add_existing_project_flow_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_add_existing_project_no_wizard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0085
preserved_exact_tokens:
  - "File menu → \"Add Existing Project\""
  - "Dashboard → \"Add Project\""
  - "native OS picker"
  - "SSH remote + path"
  - "Link to GitHub"
  - "File Manager + editor"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-091 - Create New Local Project No-Wizard Flow

```yaml
plan_unit_id: CWF-091
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Create New Local Project collects project name, parent folder, default-on git-init, and optional language/framework preset, then creates/opens the project and offers Run Chain Wizard later.
gui_related: true
gui_classification_reason: Create New Local Project is a visible project creation flow with form controls and finish action.
split_recommended: false
depends_on: [CWF-088, CWF-089]
unblocks: []
acceptance_criteria:
  - Entry is File menu -> New Project -> Local Only or Dashboard -> New Project.
  - Inputs include project name and parent folder.
  - git-init toggle defaults on.
  - Optional language/framework preset can be selected.
  - Finish creates and opens the project.
  - Finish offers Run Chain Wizard later.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: create_local_project_flow_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_create_local_project_no_wizard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0086
preserved_exact_tokens:
  - "File menu → \"New Project\" → \"Local Only\""
  - "project name"
  - "parent folder"
  - "git-init toggle (default on)"
  - "language/framework preset"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
```

### CWF-092 - Create New GitHub Repo Project No-Wizard Flow

```yaml
plan_unit_id: CWF-092
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: Create New GitHub Repo + Project requires github_api auth, launches inline device-code if needed, collects repo/visibility/README/gitignore/license/local clone inputs, creates via API, clones locally, and offers Run Chain Wizard later.
gui_related: true
gui_classification_reason: Create New GitHub Repo + Project is a visible project creation flow with auth, form controls, and finish action.
split_recommended: false
depends_on: [CWF-088, CWF-089, CWF-065]
unblocks: []
acceptance_criteria:
  - Entry is File menu -> New Project -> On GitHub or Dashboard -> New Project -> On GitHub.
  - Flow requires github_api auth.
  - Device-code auth launches inline when the user is not authenticated.
  - Inputs include repo name, description, visibility default Private, README/gitignore/license toggles, and local clone path.
  - Puppet Master creates the GitHub repo via API and clones locally.
  - Finish adds and opens the project.
  - Finish offers Run Chain Wizard later.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: create_github_project_flow_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_create_github_repo_project_no_wizard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0087
preserved_exact_tokens:
  - "github_api"
  - "device-code"
  - "visibility (default Private)"
  - "README/gitignore/license toggles"
  - "local clone path"
  - "creates GitHub repo via API and clones locally"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/GitHub_API_Auth_and_Flows.md
```

### CWF-093 - Deferred Chain Wizard Later Affordance and Payload

```yaml
plan_unit_id: CWF-093
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  No-wizard project-management finish screens expose Run Chain Wizard later,
  launch the canonical no-wizard wizard command, preload project context and
  default intent, persist the deferred payload for restart recovery, and open
  at Project Setup review rather than a blank intent picker.
gui_related: true
gui_classification_reason: Finish-screen action, wizard navigation, and Project Setup review are visible flow behavior.
split_recommended: true
split_recommendation_reason: Source span S0088 mixes visible finish-screen behavior, launch payload fields, recovery state, and backend default-intent mapping.
depends_on: [CWF-089, CWF-090, CWF-091, CWF-092]
unblocks: []
acceptance_criteria:
  - All three no-wizard flows show Run Chain Wizard later on their finish screen.
  - The action dispatches the canonical wizard-launch command from the no-wizard flow owner.
  - Project context includes name, path, language/frameworks, and GitHub remote when linked.
  - Default intent maps Add Existing Project to EnhanceRewriteAdd and both new-project flows to NewProject.
  - Deferred payloads include wizard_id, launch_source, default_intent, project_name, project_path, detected_language_frameworks[], remote_repo_ref, and created_repo_but_clone_failed when relevant.
  - Deferred launches open at Project Setup review, not at a blank intent picker.
  - Basic project setup remains possible without a mandatory wizard step.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: deferred_wizard_launch_drift
reasoning_tier: standard
context_scope: no_wizard_flows
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_deferred_later_affordance_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0088
preserved_exact_tokens:
  - "Run Chain Wizard later"
  - "EnhanceRewriteAdd"
  - "NewProject"
  - "created_repo_but_clone_failed"
  - "Project Setup review"
negative_constraints:
  - "The wizard opens at Project Setup review, not at a blank intent picker, when launched from a deferred payload."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/GitHub_Integration.md
```

### CWF-094 - Requirements Completion Contract Gate

```yaml
plan_unit_id: CWF-094
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Every requirement must satisfy C-1 through C-5 before leaving the Chain
  Wizard/Interview phase, with the Auditor invariant loop identifying, fixing,
  and escalating blocking issues under the requirements quality report schema
  and Decision Policy section 6.
gui_related: false
gui_classification_reason: Requirements completion and schema enforcement are backend validation semantics.
split_recommended: false
depends_on: [CWF-081]
unblocks: [CWF-095, CWF-096, CWF-097, CWF-098, CWF-099, CWF-100]
acceptance_criteria:
  - Requirements cannot leave Chain Wizard/Interview until all C-1 through C-5 criteria are met.
  - Initial Auditor audit identifies issues.
  - Bounded Auditor repair auto-fixes where possible.
  - Auditor certification blocks or escalates remaining blocking issues.
  - SchemaID pm.requirements_quality_report.schema.v1 and ContractName Plans/requirements_quality_report.schema.json are preserved.
  - Unknown resolution follows Decision_Policy.md section 6.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_completion_gate_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_requirements_completion_contract_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0089
preserved_exact_tokens:
  - "pm.requirements_quality_report.schema.v1"
  - "PolicyRule:Decision_Policy.md§6"
  - "Three-Pass Canonical Validation Workflow"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
```

### CWF-095 - C-1 Scenario Coverage

```yaml
plan_unit_id: CWF-095
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement includes at least one happy-path scenario and one
  negative/failure scenario in given/when/then or equivalent structure, with
  missing coverage reported as missing_scenarios.
gui_related: false
gui_classification_reason: Scenario coverage is requirement-quality validation, not visual presentation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - At least one positive happy-path scenario is present.
  - At least one negative/failure scenario is present.
  - Scenarios use {given, when, then} or equivalent structured form.
  - Missing scenario coverage emits missing_scenarios.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scenario_coverage_drift
reasoning_tier: standard
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_c1_scenario_coverage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0090
preserved_exact_tokens:
  - "1 positive (happy-path) scenario"
  - "1 negative/failure scenario"
  - "{given, when, then}"
  - "missing_scenarios"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-096 - C-2 Boundary Declaration

```yaml
plan_unit_id: CWF-096
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement declares explicit in-scope and out-of-scope boundaries and
  rejects deferred placeholder or unresolved marker language.
gui_related: false
gui_classification_reason: Boundary declaration is requirement-quality validation, not visual presentation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - Each requirement has an explicit in-scope statement.
  - Each requirement has an explicit out-of-scope statement.
  - Deferred placeholder text such as later is rejected.
  - Similar unresolved marker text is rejected.
  - Missing boundary coverage emits missing_boundary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_boundary_drift
reasoning_tier: standard
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_c2_boundary_declaration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0091
preserved_exact_tokens:
  - "in-scope"
  - "out-of-scope"
  - "missing_boundary"
negative_constraints:
  - "May not use deferred placeholder text or similar deferral language."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-097 - C-3 Implementation Anchor

```yaml
plan_unit_id: CWF-097
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement carries either a ProjectContract reference that pins the
  implementing spec or an explicit research-node-required annotation before
  implementation can start.
gui_related: false
gui_classification_reason: Implementation anchoring is traceability and dependency validation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - A ProjectContract:* reference satisfies the implementation anchor.
  - An explicit research node required annotation satisfies the implementation anchor.
  - Research-required annotations create a blocking graph dependency before implementation can start.
  - Missing implementation anchor emits missing_anchor.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: implementation_anchor_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_c3_implementation_anchor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0092
preserved_exact_tokens:
  - "ProjectContract:*"
  - "research node required"
  - "missing_anchor"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-098 - C-4 Executable Verification Reference

```yaml
plan_unit_id: CWF-098
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Each requirement includes at least one acceptance check command path or named
  verification gate reference that will appear in the acceptance manifest.
gui_related: false
gui_classification_reason: Verification references and acceptance manifest linkage are backend validation semantics.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100]
acceptance_criteria:
  - Each requirement has at least one acceptance check command path.
  - Inline verification uses verify: <command-or-gate-id>.
  - Named gate verification uses Gate:GATE-XXX.
  - Verification references appear in the acceptance manifest.
  - Missing acceptance verification emits missing_acceptance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: acceptance_verification_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_c4_executable_verification_reference
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0093
preserved_exact_tokens:
  - "verify: <command-or-gate-id>"
  - "Gate:GATE-XXX"
  - "missing_acceptance"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-099 - C-5 Unknown Resolution

```yaml
plan_unit_id: CWF-099
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Unknowns become blocking research dependencies, deterministic auto-decisions
  only when Decision Policy permits, or needs_user_clarification entries in the
  requirements quality report.
gui_related: false
gui_classification_reason: Unknown resolution is requirements-quality and decision-policy validation.
split_recommended: false
depends_on: [CWF-094]
unblocks: [CWF-100, CWF-102]
acceptance_criteria:
  - Blocking research nodes create graph dependencies.
  - Implementation cannot start until blocking research resolves.
  - Deterministic auto-decisions are used only for equally valid options.
  - Missing user intent is not treated as an auto-decision.
  - Remaining open unknowns become needs_user_clarification[] entries.
  - Unresolved unknowns emit missing_research.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unknown_resolution_policy_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_c5_unknown_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0094
preserved_exact_tokens:
  - "blocking research node"
  - "deterministic auto-decision"
  - "needs_user_clarification[]"
  - "missing_research"
negative_constraints:
  - "Deterministic auto-decision is allowed only when it is truly a choice between equally valid options, not missing user intent."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Decision_Policy.md
```

### CWF-100 - Requirements Quality Report Artifact

```yaml
plan_unit_id: CWF-100
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Initial Auditor audit produces and bounded Auditor repair updates a requirements_quality_report artifact
  that evaluates requirements against C-1 through C-5 using the canonical schema
  and required top-level arrays.
gui_related: false
gui_classification_reason: Quality report artifact shape is machine-readable validation output.
split_recommended: false
depends_on: [CWF-094, CWF-095, CWF-096, CWF-097, CWF-098, CWF-099]
unblocks: [CWF-101, CWF-102]
acceptance_criteria:
  - The artifact is named requirements_quality_report.
  - The artifact captures per-requirement evaluation against C-1 through C-5.
  - Bounded Auditor repair updates the report in place after autofixes.
  - Required fields include verdict, requirements_touched[], issues[], auto_fixes_applied[], and needs_user_clarification[].
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requirements_quality_report_schema_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_requirements_quality_report_artifact
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0095
preserved_exact_tokens:
  - "requirements_quality_report"
  - "pm.requirements_quality_report.schema.v1"
  - "requirements_touched[]"
  - "auto_fixes_applied[]"
  - "needs_user_clarification[]"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
```

### CWF-101 - Deterministic Quality Report Shaping

```yaml
plan_unit_id: CWF-101
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements quality reports are stable across equivalent reruns by ordering
  touched requirements, issues, fixes, and clarification questions
  deterministically and emitting zero-padded IDs.
gui_related: false
gui_classification_reason: Deterministic ordering and identifier shaping are backend artifact invariants.
split_recommended: false
depends_on: [CWF-100]
unblocks: [CWF-102]
acceptance_criteria:
  - requirements_touched[] follows canonical requirement order from requirements.md.
  - issues[] is ordered by requirement_id, category, and description.
  - issue_id values are zero-padded report-order ordinals.
  - auto_fixes_applied[] and needs_user_clarification[] are ordered by referenced issue_id.
  - fix_id values use FIX-0001 style.
  - question_id values use Q-0001 style.
  - Equivalent reruns preserve byte-stable ordering.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: quality_report_determinism_drift
reasoning_tier: high
context_scope: requirements_quality
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
  - Plans/Decision_Policy.md
node_compile_hint:
  mode: chain_wizard_deterministic_quality_report_shaping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0096
preserved_exact_tokens:
  - "ISS-0001"
  - "FIX-0001"
  - "Q-0001"
  - "byte-stable ordering"
  - "Invariant:INV-005"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-102 - Requirements Quality Escalation Trigger

```yaml
plan_unit_id: CWF-102
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Auditor certification reads the post-repair requirements_quality_report and triggers user
  escalation only when needs_user_clarification is non-empty, while never
  editing product requirements.
gui_related: false
gui_classification_reason: Escalation trigger evaluation is backend validation and state transition logic.
split_recommended: false
depends_on: [CWF-083, CWF-100, CWF-101]
unblocks: [CWF-103, CWF-104, CWF-105, CWF-106]
acceptance_criteria:
  - Auditor certification reads the quality report and triggers only the escalation path defined here.
  - Auditor certification never edits product requirements.
  - Escalation fires when final post-repair needs_user_clarification[] is non-empty.
  - No escalation fires when bounded Auditor repair autofixes resolve all blocking issues.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: quality_escalation_trigger_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/requirements_quality_report.schema.json
node_compile_hint:
  mode: chain_wizard_quality_escalation_trigger
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0097
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0098
preserved_exact_tokens:
  - "Requirements Quality Escalation Semantics"
  - "needs_user_clarification[]"
  - "No escalation fires"
negative_constraints:
  - "Pass 3 never edits product requirements."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-103 - Attention Required Wizard State

```yaml
plan_unit_id: CWF-103
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Quality escalation moves the wizard to attention_required, disables proceed
  actions, marks the triggering step, and returns to normal only after answers
  produce a passing quality report with no clarification entries.
gui_related: true
gui_classification_reason: Disabled buttons and lock or warning badge are visible wizard state and control behavior.
split_recommended: false
depends_on: [CWF-102]
unblocks: [CWF-104, CWF-105, CWF-106]
acceptance_criteria:
  - Escalation sets wizard state to attention_required.
  - Proceed and Start Run are disabled while attention is required.
  - A lock icon or warning badge appears on the triggering wizard step.
  - Normal state resumes only after all clarification entries are answered.
  - Auditor audit/repair cycles rerun with injected answers.
  - The resumed report has verdict PASS and empty needs_user_clarification[].
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_required_state_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_attention_required_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0099
preserved_exact_tokens:
  - "attention_required"
  - "Proceed"
  - "Start Run"
  - "lock icon or warning badge"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-104 - Thread Clarification Surface

```yaml
plan_unit_id: CWF-104
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements clarification appears in the relevant chain/wizard chat thread
  as a clarification_request system message with full questions, wizard step,
  and resume URL, while the thread list shows unanswered-question count.
gui_related: true
gui_classification_reason: Thread message and thread-list badge are user-visible chat UI surfaces.
split_recommended: false
depends_on: [CWF-102, CWF-103]
unblocks: [CWF-109]
acceptance_criteria:
  - Both mandatory UI surfaces exist.
  - The relevant chain/wizard thread receives a system message.
  - The message type is clarification_request.
  - The message carries questions[], wizard_step, and resume_url.
  - The thread list entry shows a badge count of unanswered questions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_clarification_surface_drift
reasoning_tier: standard
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_thread_clarification_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0100
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0101
preserved_exact_tokens:
  - "Mandatory — Both Required"
  - "clarification_request"
  - "questions[]"
  - "wizard_step"
  - "resume_url"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### CWF-105 - Dashboard Attention Required Card

```yaml
plan_unit_id: CWF-105
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements clarification also appears on the Dashboard under Attention
  Required as a card with canonical fields, Resume Wizard and View in Thread
  actions, and automatic dismissal when the wizard leaves attention_required.
gui_related: true
gui_classification_reason: Dashboard card fields, section placement, and actions are user-visible UI behavior.
split_recommended: false
depends_on: [CWF-102, CWF-103]
unblocks: [CWF-109]
acceptance_criteria:
  - A Dashboard card appears under Attention Required.
  - The card title is Requirements need your input.
  - The card carries reason, wizard_id, wizard_step, question_count, and resume_url.
  - Resume Wizard deep-links to the wizard at the blocked step.
  - View in Thread opens the thread containing the clarification_request message.
  - The card dismisses automatically when all questions are answered and wizard state is no longer attention_required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dashboard_attention_card_drift
reasoning_tier: standard
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_dashboard_attention_required_card
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0100
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0102
preserved_exact_tokens:
  - "Attention Required"
  - "Requirements need your input"
  - "Resume Wizard"
  - "View in Thread"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-106 - Clarification Payload Storage

```yaml
plan_unit_id: CWF-106
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  The canonical requirements quality report is stored under project traceability,
  linked from the wizard record through attention_required_report_path, and
  regenerated at the same path after clarification answers are injected.
gui_related: false
gui_classification_reason: Clarification payload storage is artifact and database state behavior.
split_recommended: false
depends_on: [CWF-102, CWF-103]
unblocks: [CWF-107, CWF-108]
acceptance_criteria:
  - The report is stored at .puppet-master/project/traceability/requirements_quality_report.json.
  - The wizard record gains attention_required_report_path.
  - Answer submission reruns Auditor audit/repair cycles with answers injected.
  - The canonical quality report file is regenerated at the same path and the pointer is updated.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_storage_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_clarification_payload_storage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0103
preserved_exact_tokens:
  - ".puppet-master/project/traceability/requirements_quality_report.json"
  - "attention_required_report_path"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-107 - Clarification Round Cap

```yaml
plan_unit_id: CWF-107
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  A clarification cycle is report, answer submission, and automatic Auditor
  audit/repair rerun; each wizard instance is capped at three cycles and becomes
  blocked if questions remain after the third cycle.
gui_related: false
gui_classification_reason: Cycle counting and blocked transition are backend wizard-state rules.
split_recommended: true
split_recommendation_reason: Source span S0104 mixes round-cap state rules with visible blocked copy and override evidence.
depends_on: [CWF-106]
unblocks: [CWF-108]
acceptance_criteria:
  - A cycle includes a report with non-empty needs_user_clarification[].
  - A cycle includes user answer submission.
  - A cycle includes automatic Auditor audit/repair rerun.
  - Maximum clarification cycles for one wizard instance is 3.
  - Cycles 1 and 2 remain in active clarification when follow-up questions remain.
  - After cycle 3 still produces non-empty needs_user_clarification[], wizard state becomes blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clarification_cycle_cap_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_clarification_round_cap
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0104
preserved_exact_tokens:
  - "maximum clarification cycles"
  - "3"
  - "blocked"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-108 - Blocked Clarification Override Evidence

```yaml
plan_unit_id: CWF-108
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Blocked clarification disables proceed actions, explains repeated failure to
  resolve requirements, preserves the latest canonical quality report, forbids
  further automatic requirement rewrites without explicit user input, and allows
  override only with risk acknowledgement, gate permission, and evidence.
gui_related: true
gui_classification_reason: Blocked copy, disabled actions, and override affordance are user-visible wizard behavior backed by evidence policy.
split_recommended: true
split_recommendation_reason: Source span S0104 mixes backend cycle cap with visible blocked and override semantics.
depends_on: [CWF-107]
unblocks: []
acceptance_criteria:
  - blocked disables Proceed and Start Run exactly like the clarification hold state.
  - UI copy explains that repeated clarification attempts did not resolve the requirements set.
  - Puppet Master preserves the latest canonical quality report.
  - Puppet Master does not auto-rewrite requirements further without new explicit user input.
  - Override is offered only after risk acknowledgement and downstream gate permission.
  - Override is recorded as evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_override_evidence_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_blocked_clarification_override_evidence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0104
preserved_exact_tokens:
  - "MUST preserve the latest canonical quality report"
  - "MUST NOT auto-rewrite requirements further without new explicit user input"
  - "recorded as evidence"
negative_constraints:
  - "Puppet Master MUST NOT auto-rewrite requirements further without new explicit user input."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```

### CWF-109 - Shared Questionnaire Alignment

```yaml
plan_unit_id: CWF-109
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard clarification uses the shared question and /questionnaire contract plus
  QuestionItem shape, preserving stable IDs, shared answer fields, draft/resume
  behavior, and prohibiting wizard-local prompt, status, or draft names.
gui_related: false
gui_classification_reason: Questionnaire envelope and item-shape alignment are shared contract semantics consumed by UI surfaces.
split_recommended: false
depends_on: [CWF-104, CWF-105]
unblocks: []
acceptance_criteria:
  - Clarification uses the shared question / /questionnaire contract.
  - Clarification uses QuestionItem rather than a wizard-local prompt schema.
  - Wizard consumes question_id, question, options[], required, multi_select, allow_freeform, and default_values.
  - question_id remains stable across thread, wizard, and stored report state.
  - Per-question display text is question and prompt is only envelope/header side.
  - Required questions gate submit.
  - Dismiss pauses the flow and resume restores outstanding questionnaire from PM-managed draft state or submitted outcome.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: questionnaire_contract_drift
reasoning_tier: high
context_scope: requirements_quality_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_shared_questionnaire_alignment
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0105
preserved_exact_tokens:
  - "QuestionItem"
  - "question_id"
  - "draft_value"
negative_constraints:
  - "The wizard does not invent alternate status or draft/resume names."
  - "prompt is allowed only on the envelope/header side and must not become the per-question field."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
```

### CWF-110 - Builder Stage Taxonomy and Default Personas

```yaml
plan_unit_id: CWF-110
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder and related wizard generation/review work distinguish
  intake, drafting, domain-specialized fragment generation, quality review, and
  final review stages, with default top-level wizard personas for Interview,
  Planning, Execution, and Review.
gui_related: false
gui_classification_reason: Builder stage taxonomy and default persona selection are orchestration semantics.
split_recommended: false
depends_on: []
unblocks: [CWF-111, CWF-115, CWF-116]
acceptance_criteria:
  - Builder stages include intake / clarification, drafting, domain-specialized fragment generation, quality review, and final review / multi-pass review.
  - Interview stage uses the interview persona by default.
  - Planning stage uses the planning / architect persona by default.
  - Execution stage uses the executor persona by default.
  - Review stage uses the reviewer persona by default.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_persona_stage_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_builder_stage_taxonomy_default_personas
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0106
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0107
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0108
preserved_exact_tokens:
  - "Requirements Builder Persona Strategy Addendum (2026-03-06)"
  - "domain-specialized fragment generation"
  - "planning / architect persona"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-111 - Deterministic Builder Persona Resolver

```yaml
plan_unit_id: CWF-111
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder resolves Personas in deterministic priority order from
  explicit override to configured mapping, stage default, and general-purpose
  fallback, with collaborator intake bias, reviewer-pass separation, and
  persona_registry validity.
gui_related: false
gui_classification_reason: Persona resolution is runtime selection logic rather than visible presentation.
split_recommended: false
depends_on: [CWF-110]
unblocks: [CWF-112, CWF-113, CWF-114, CWF-115, CWF-116]
acceptance_criteria:
  - Explicit stage/pass override has highest priority when present.
  - Configured stage/pass mapping is used before stage default.
  - general-purpose is the final fallback.
  - Intake and clarification bias toward collaborator unless explicitly overridden.
  - Review passes do not silently reuse the drafting Persona when a reviewer Persona mapping exists.
  - Automatic resolution returns only IDs valid in persona_registry.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_persona_resolution_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
node_compile_hint:
  mode: chain_wizard_deterministic_builder_persona_resolver
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0109
preserved_exact_tokens:
  - "general-purpose"
  - "collaborator"
  - "persona_registry"
negative_constraints:
  - "Review passes MUST NOT silently reuse the drafting Persona when a reviewer Persona mapping exists."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
```

### CWF-112 - Review Pass Persona Key Contract

```yaml
plan_unit_id: CWF-112
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  review_pass_personas persists canonical ordinal pass_1 through pass_5 keys,
  treats extra or unmapped keys deterministically, may display human labels in
  the GUI, and does not override final synthesis or writer behavior.
gui_related: true
gui_classification_reason: The unit preserves persistence key rules plus compatibility-limited GUI label handling for review-pass persona mapping.
split_recommended: false
depends_on: [CWF-111]
unblocks: [CWF-113, CWF-114]
acceptance_criteria:
  - review_pass_personas uses canonical ordinal keys pass_1 through pass_5.
  - Extra keys are ignored when a configured run uses fewer passes.
  - Unmapped passes fall back to deterministic reviewer-selection rules in section 5.6.
  - GUI labels may display Pass 1, Pass 2, and similar labels only for legacy/imported Multi-Pass Review compatibility rows; active UI copy uses reviewer-pass ordinal wording, and persistence uses canonical keys.
  - Final synthesis/writer step is not implicitly overwritten by reviewer-pass mappings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_pass_persona_key_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
node_compile_hint:
  mode: chain_wizard_review_pass_persona_key_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0110
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0111
preserved_exact_tokens:
  - "review_pass_personas"
  - "pass_1"
  - "pass_5"
  - "Pass 1"
negative_constraints:
  - "The final synthesis/writer step remains governed by the Builder workflow and is not implicitly overwritten by reviewer-pass mappings."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
```

### CWF-113 - Builder Persona Settings Config

```yaml
plan_unit_id: CWF-113
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Builder Persona settings persist a canonical config object with mode,
  stage_personas, review_pass_personas, optional platform/model overrides, and
  optional next-execution override as the backing store for the mapping editor.
gui_related: true
gui_classification_reason: The persisted config backs the Builder Persona mapping editor required by the GUI spec.
split_recommended: false
depends_on: [CWF-111, CWF-112]
unblocks: [CWF-114, CWF-117]
acceptance_criteria:
  - Config mode is one of manual, auto, or hybrid.
  - Config includes stage_personas and review_pass_personas.
  - Config supports optional per-mapping platform/model overrides.
  - Config supports an optional explicit override for the next eligible Builder execution.
  - The config backs the FinalGUISpec section 17.8 mapping editor.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_persona_config_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md#178-interviewbuilderorchestrator-mapping-editors
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_builder_persona_settings_config
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0111
preserved_exact_tokens:
  - "manual | auto | hybrid"
  - "stage_personas"
  - "review_pass_personas"
  - "mapping editor"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-114 - Builder Requested Effective Runtime Record

```yaml
plan_unit_id: CWF-114
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Every Builder stage or pass persists and exposes requested/effective Persona,
  selection, platform, model, control, and provider identity fields using the
  same canonical requested/effective record as other surfaces.
gui_related: true
gui_classification_reason: The record is exposed to Builder activity/status UIs, even though the canonical record is shared runtime state.
split_recommended: false
depends_on: [CWF-111, CWF-113]
unblocks: [CWF-118]
acceptance_criteria:
  - Each stage/pass persists requested_persona, effective_persona, persona_selection_source, and selection_reason.
  - Each stage/pass persists effective_platform and effective_model.
  - applied_persona_controls[] and skipped_persona_controls[] are exposed.
  - requested_model_provider_id and effective_model_provider_id are included when provider-specific runtime IDs are available.
  - Builder activity/status UIs use the same canonical requested/effective record as other surfaces.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_runtime_identity_drift
reasoning_tier: high
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_builder_requested_effective_runtime_record
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0112
preserved_exact_tokens:
  - "requested_persona"
  - "effective_persona"
  - "persona_selection_source"
  - "skipped_persona_controls[]"
  - "requested_model_provider_id"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Prompt_Pipeline.md
```

### CWF-115 - Intake and Drafting Persona Behavior

```yaml
plan_unit_id: CWF-115
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Intake defaults to collaborator-style clarification behavior, while drafting
  uses workflow-resolved drafting Personas and may use technical-writer only
  when retained or explicitly configured without requiring a protected core
  document-writer Persona.
gui_related: false
gui_classification_reason: Intake and drafting Persona behavior is prompt/runtime behavior, not visual presentation.
split_recommended: false
depends_on: [CWF-110, CWF-111]
unblocks: [CWF-118]
acceptance_criteria:
  - Intake / clarification default Persona is collaborator.
  - Intake asks clarifying questions and suggests options and tradeoffs.
  - Drafting uses the workflow-resolved drafting Persona.
  - technical-writer may be used only when retained as an available specialty or explicitly configured for drafting.
  - Drafting does not require or recreate protected core document-writer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_intake_drafting_persona_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_intake_drafting_persona_behavior
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0113
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0114
preserved_exact_tokens:
  - "collaborator"
  - "technical-writer"
  - "document-writer"
negative_constraints:
  - "Drafting MUST NOT require or recreate a protected core document-writer Persona."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-116 - Specialized and Review Persona Defaults

```yaml
plan_unit_id: CWF-116
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Domain-specialized fragment generation may use domain or language Personas,
  quality review defaults to requirements-quality-reviewer, and final
  review/Multi-Pass uses reviewer Personas such as requirements, code, security,
  and architect reviewers.
gui_related: false
gui_classification_reason: Specialized and review Persona defaults are runtime/persona routing behavior.
split_recommended: false
depends_on: [CWF-110, CWF-111]
unblocks: [CWF-118]
acceptance_criteria:
  - Domain-specialized fragment generation can use domain or language Personas as needed.
  - Preserved examples include security-engineer, devops-engineer, ux-researcher, rust-engineer, and frontend-developer.
  - Quality review defaults to requirements-quality-reviewer.
  - Final review / Multi-Pass can use requirements-quality-reviewer, code-reviewer, security-auditor, and architect-reviewer.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_review_persona_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
node_compile_hint:
  mode: chain_wizard_specialized_review_persona_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0115
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0116
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0117
preserved_exact_tokens:
  - "security-engineer"
  - "requirements-quality-reviewer"
  - "security-auditor"
  - "architect-reviewer"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-117 - Stage And Auditor Loop Platform Model Filtering

```yaml
plan_unit_id: CWF-117
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder settings allow platform and model selection per stage and
  use the Auditor validation loop for sweep pass reports while still enforcing
  provider capability filtering.
gui_related: false
gui_classification_reason: Provider capability filtering is runtime selection behavior.
split_recommended: false
depends_on: [CWF-113]
unblocks: [CWF-118]
acceptance_criteria:
  - Builder settings allow platform/model selection per stage.
  - Validation sweep pass reports use the Auditor validation loop provider/model.
  - Per-stage selections and Auditor loop selection pass through provider capability filtering.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_provider_filtering_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Provider_OpenCode.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: chain_wizard_stage_auditor_platform_model_filtering
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0118
preserved_exact_tokens:
  - "platform/model selection per stage"
  - "Auditor validation loop"
  - "provider capability filtering"
negative_constraints:
  - "Do not keep independent provider/model settings per validation pass."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Provider_OpenCode.md
```

### CWF-118 - Builder Requested Effective UI Visibility

```yaml
plan_unit_id: CWF-118
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Builder UI exposes effective Persona, selection reason, effective
  platform/model, and skipped unsupported controls for the active stage or Auditor loop,
  while acceptance preserves stage/pass Persona selection, collaborator intake,
  non-required Document Writer, distinct reviewer Personas, and visibility.
gui_related: true
gui_classification_reason: This unit describes visible Builder UI runtime identity and control-skip disclosure.
split_recommended: false
depends_on: [CWF-114, CWF-115, CWF-116, CWF-117]
unblocks: []
acceptance_criteria:
  - Builder UI displays effective Persona, selection reason, effective platform/model, and skipped unsupported Persona controls.
  - Builder supports Persona selection by stage/pass.
  - Collaborator is the default intake/clarification Persona.
  - Drafting does not require a protected core Document Writer.
  - Reviewer Personas are distinct from drafting Personas for review passes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: builder_runtime_visibility_drift
reasoning_tier: standard
context_scope: builder_personas
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_builder_requested_effective_ui_visibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0119
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0120
preserved_exact_tokens:
  - "effective Persona"
  - "selection reason"
  - "skipped unsupported Persona controls"
  - "Acceptance criteria addendum"
negative_constraints:
  - "Drafting does not require a protected core Document Writer."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-119 - Assistant Deep Plan Chain Wizard Escalation Optionality

```yaml
plan_unit_id: CWF-119
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Assistant Chat and Deep Plan may recommend escalation into Chain Wizard /
  Interview for larger work without losing collected context; the
  recommendation can come from intent detection, post-plan escalation, or
  explicit user request, remains user-facing and optional, and decline keeps the
  current flow with no hidden redirect.
gui_related: true
gui_classification_reason: User-facing recommendation, accept/decline choice, and no-hidden-redirect behavior are visible flow semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant Chat can escalate larger feature/enhancement work without cold-starting the interviewer.
  - Deep Plan can escalate larger feature/enhancement work without losing collected context.
  - Recommendation sources include Assistant Chat detection, Deep Plan post-plan escalation check, and explicit user request.
  - The recommendation is user-facing and optional.
  - The user may accept or decline.
  - Decline keeps the user in the current chat/planning flow with no hidden redirect.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_deep_plan_escalation_drift
reasoning_tier: standard
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_assistant_deep_plan_escalation_optionality
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0121
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0122
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0123
preserved_exact_tokens:
  - "Assistant / Deep Plan Escalation into Chain Wizard (2026-03-08)"
  - "without losing already-collected context"
  - "Assistant Chat natural-language detection"
  - "Deep Plan post-plan escalation check"
  - "user-facing and optional"
  - "no hidden redirect"
negative_constraints:
  - "Decline keeps the user in the current chat/planning flow with no hidden redirect."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### CWF-120 - Feature Enhancement CTA Intent Mapping

```yaml
plan_unit_id: CWF-120
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Accepted Assistant Chat or Deep Plan recommendations for feature/enhancement
  work map friendly CTA copy to the canonical EnhanceRewriteAdd intent without
  minting a new intent.
gui_related: true
gui_classification_reason: The Add a new Feature or Enhancement CTA is user-facing entry copy.
split_recommended: false
depends_on: [CWF-119]
unblocks: [CWF-121, CWF-124]
acceptance_criteria:
  - Accepted feature/enhancement recommendations target EnhanceRewriteAdd.
  - Add a new Feature or Enhancement remains friendly CTA copy only.
  - CTA copy does not create or rename the canonical intent enum.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: intent_alias_drift
reasoning_tier: standard
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_feature_enhancement_cta_intent_mapping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0124
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "Add a new Feature or Enhancement"
  - "EnhanceRewriteAdd"
negative_constraints:
  - "Do not create a new canonical intent for the friendly CTA copy."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-121 - Assistant Deep Plan Typed Handoff Payload

```yaml
plan_unit_id: CWF-121
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Assistant Chat and Deep Plan create a typed handoff payload with source,
  reason, origin refs, project context, summaries, GUI hint, plan refs, TODO
  snapshot, questions, assumptions, excerpt refs, and optional phase/runtime
  hints.
gui_related: false
gui_classification_reason: Typed handoff payload shape is backend orchestration state.
split_recommended: false
depends_on: [CWF-120]
unblocks: [CWF-122, CWF-123, CWF-124, CWF-126]
acceptance_criteria:
  - Payload includes handoff_source and handoff_reason.
  - Payload includes origin_thread_id and origin_message_id.
  - Payload includes default_intent, project_id or project_path when available, user_goal, requirements_summary, scope_summary, codebase_summary, and has_gui_hint.
  - Payload includes plan_artifact_ref when available, plan_todo_snapshot[], open_questions[], assumptions[], and chat_excerpt_refs[].
  - Optional fields may include recommended_phase_hints[], effective_persona, effective_platform, and effective_model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_handoff_payload_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_assistant_deep_plan_typed_handoff_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0124
preserved_exact_tokens:
  - "handoff_source"
  - "handoff_reason"
  - "assistant_chat"
  - "deep_plan"
  - "has_gui_hint"
  - "plan_todo_snapshot[]"
  - "chat_excerpt_refs[]"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-122 - Handoff Runtime Attribution and Permission Lineage

```yaml
plan_unit_id: CWF-122
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard handoff carries runtime attribution, validation lineage, and permission
  identity explicitly rather than by implication, preserving effective account
  and execution role across the handoff.
gui_related: false
gui_classification_reason: Runtime attribution and permission carry-through are backend lineage semantics.
split_recommended: false
depends_on: [CWF-121]
unblocks: [CWF-139]
acceptance_criteria:
  - Handoff payload includes node_id, attempt_id, lane_id, package_id, execution_role, effective_account_id, operational_identity, workflow_run_id, and run_id.
  - Canonical terms include auditor_cycle_report.
  - validation_pass_report is allowed only as a legacy mirror with compatibility_only true and cycle_report_ref.
  - Handoff explicitly carries validation lineage.
  - effective account and execution role survive wizard handoff payloads.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_lineage_permission_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_handoff_runtime_attribution_permission_lineage
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0124
preserved_exact_tokens:
  - "node_id"
  - "attempt_id"
  - "lane_id"
  - "package_id"
  - "execution_role"
  - "effective_account_id"
  - "operational_identity"
  - "auditor_cycle_report"
  - "validation_pass_report"
  - "compatibility_only"
  - "cycle_report_ref"
negative_constraints: []
compatibility_only_notes:
  - "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-123 - Imported Handoff State Persistence

```yaml
plan_unit_id: CWF-123
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  ChainWizardState persists assistant handoff fields for recovery, resume,
  audit, and user visibility while using imported context only to seed canonical
  requirements and interview artifacts.
gui_related: true
gui_classification_reason: The persisted fields are auditable and user-visible even though they are stored state.
split_recommended: true
split_recommendation_reason: Source span S0125 mixes backend recovery state with user-visible audit expectations.
depends_on: [CWF-121]
unblocks: [CWF-124, CWF-126]
acceptance_criteria:
  - ChainWizardState or equivalent state includes assistant_handoff_ref, assistant_handoff_source, assistant_handoff_reason, imported_plan_ref, imported_has_gui_hint, and imported_context_summary_ref.
  - These fields persist for recovery and resume.
  - These fields are auditable and user-visible.
  - These fields seed canonical requirements/interview artifacts and do not replace them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: imported_handoff_state_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_imported_handoff_state_persistence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0125
preserved_exact_tokens:
  - "assistant_handoff_ref"
  - "assistant_handoff_source"
  - "assistant_handoff_reason"
  - "imported_plan_ref"
  - "imported_has_gui_hint"
  - "imported_context_summary_ref"
negative_constraints:
  - "Imported handoff fields do not replace canonical requirements/interview artifacts; they seed them."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-124 - Context Aware Wizard Launch After Acceptance

```yaml
plan_unit_id: CWF-124
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Accepted assistant/deep-plan handoffs open a preloaded EnhanceRewriteAdd path
  when project context is known or project-setup review when it is missing,
  never a blank intent picker, with imported context visible and in scope.
gui_related: true
gui_classification_reason: Wizard launch route, visible origin, and imported context visibility are user-facing flow behavior.
split_recommended: false
depends_on: [CWF-120, CWF-121, CWF-123]
unblocks: [CWF-125, CWF-126]
acceptance_criteria:
  - Known project context opens a preloaded EnhanceRewriteAdd path.
  - Known project context lands in the requirements/interview-ready path rather than a blank intent picker.
  - Missing project context opens with imported context preserved and lands on project-setup review first.
  - The wizard shows it was opened from Assistant Chat / Deep Plan.
  - The user can continue into the interview with imported materials in scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_aware_launch_drift
reasoning_tier: standard
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_context_aware_launch_after_acceptance
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0126
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "EnhanceRewriteAdd"
  - "project-setup review path"
  - "Assistant Chat / Deep Plan"
negative_constraints:
  - "Accepted handoffs do not land on a blank intent picker."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-125 - Handoff Evidence Quality Preservation

```yaml
plan_unit_id: CWF-125
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Imported handoff bundles preserve redaction, truncation, and omission metadata
  instead of flattening evidence quality during wizard handoff.
gui_related: false
gui_classification_reason: Evidence quality preservation is artifact metadata behavior.
split_recommended: false
depends_on: [CWF-121, CWF-124]
unblocks: [CWF-126, CWF-140]
acceptance_criteria:
  - Imported bundles preserve redaction_state.
  - Imported bundles preserve truncation_state.
  - Imported bundles preserve omission metadata.
  - Imported context remains visible and auditable without flattening evidence quality.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_evidence_quality_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_handoff_evidence_quality_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0126
preserved_exact_tokens:
  - "redaction_state"
  - "truncation_state"
  - "omission metadata"
negative_constraints:
  - "Imported bundles must not flatten evidence quality during wizard handoff."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-126 - Interview Ownership After Handoff

```yaml
plan_unit_id: CWF-126
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  After assistant/deep-plan handoff, Interview still owns scoping and adaptive
  phase selection; imported context informs the first question and phase
  selector but the normalized phase_plan remains the source of truth.
gui_related: false
gui_classification_reason: Interview ownership and phase-plan authority are orchestration semantics.
split_recommended: false
depends_on: [CWF-121, CWF-124, CWF-125]
unblocks: [CWF-127]
acceptance_criteria:
  - Phase 0 scope probe still runs.
  - The interviewer receives the imported handoff bundle before the first question.
  - Imported plan context is not treated as an already-approved project artifact.
  - The phase selector may use imported context as input.
  - The normalized phase_plan remains the source of truth.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: interview_ownership_handoff_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_interview_ownership_after_handoff
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0127
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "phase 0 scope probe"
  - "phase_plan"
  - "source of truth"
negative_constraints:
  - "Imported plans act as context, not as already-approved project artifacts."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
```

### CWF-127 - Adaptive Phase Pruning Across Intents

```yaml
plan_unit_id: CWF-127
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Adaptive phase pruning applies across all chain-wizard intents, using imported
  feature/enhancement evidence to skip or shorten irrelevant UX, persistence,
  and deployment phases while keeping testing at least Short except pure
  non-runtime documentation and keeping the local normalizer authoritative.
gui_related: true
gui_classification_reason: Phase pruning affects user-visible interview flow, especially product_ux skipping.
split_recommended: false
depends_on: [CWF-126]
unblocks: []
acceptance_criteria:
  - Pruning applies to NewProject, ForkAndEvolve, EnhanceRewriteAdd, and ContributePr.
  - product_ux defaults to Skip when has_gui = false or strong evidence indicates no UI impact unless the user asks for UX/UI work.
  - data_persistence and deployment_environments may default to Short or Skip when imported context shows no impact.
  - testing_verification remains at least Short except purely non-functional documentation with no runtime effect.
  - Imported plan recommendations may suggest phase hints.
  - The local phase-manager normalizer remains authoritative.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: adaptive_phase_pruning_drift
reasoning_tier: high
context_scope: assistant_wizard_escalation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_adaptive_phase_pruning_across_intents
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0128
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0129
preserved_exact_tokens:
  - "product_ux"
  - "Skip"
  - "Short"
  - "testing_verification"
  - "NewProject"
  - "ForkAndEvolve"
  - "ContributePr"
negative_constraints:
  - "Imported phase hints do not override the local phase-manager normalizer."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-128 - Wizard Status Reference Consolidation

```yaml
plan_unit_id: CWF-128
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Later blocked-state and enum addenda defer to the canonical wizard_status
  definition in section 2.1 and preserve cross-doc ContractRefs without
  duplicating enum semantics.
gui_related: false
gui_classification_reason: This is a compatibility/reference consolidation, not GUI behavior.
split_recommended: false
depends_on: [CWF-010]
unblocks: [CWF-129, CWF-137, CWF-138]
acceptance_criteria:
  - Clarification Escalation and Draft Decomposition Addendum references canonical wizard_status in section 2.1.
  - Canonical Wizard Blocked-State Canonical Alignment references canonical wizard_status in section 2.1.
  - Canonical Wizard Blocked Lifecycle references canonical wizard_status in section 2.1.
  - Wizard Status Enum Correction Addendum references canonical wizard_status in section 2.1.
  - ContractRefs to Contracts_V0.md, FinalGUISpec.md, and assistant-chat-design.md are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_status_duplicate_drift
reasoning_tier: standard
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_status_reference_consolidation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0130
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0131
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0141
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0145
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0148
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0149
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0152
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0153
preserved_exact_tokens:
  - "wizard_status"
  - "See canonical `wizard_status` definition in §2.1."
negative_constraints:
  - "Do not duplicate or fork the canonical wizard_status enum semantics outside section 2.1."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-129 - Attention Required Versus Blocked Semantics

```yaml
plan_unit_id: CWF-129
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  attention_required means the current clarification cycle can still resolve the
  issue set, while blocked means automatic progress is exhausted or impossible;
  Debug budget trips preserve investigation.budget_exhausted with budget_kind.
gui_related: false
gui_classification_reason: State semantics and stop_reason_code preservation are runtime contract behavior.
split_recommended: false
depends_on: [CWF-128]
unblocks: [CWF-130, CWF-131, CWF-136]
acceptance_criteria:
  - attention_required means current clarification can continue.
  - blocked means clarification rounds are exhausted or automatic progress cannot continue.
  - Debug investigation budget trips may surface as failed or attention_required depending on recovery usefulness.
  - Machine-readable stop_reason_code remains investigation.budget_exhausted.
  - Budget exhaustion carries budget_kind.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_blocked_semantics_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_attention_required_blocked_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0132
preserved_exact_tokens:
  - "attention_required"
  - "blocked"
  - "stop_reason_code"
  - "investigation.budget_exhausted"
  - "budget_kind"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-130 - Blocked Controls Copy and Rewrite Stop

```yaml
plan_unit_id: CWF-130
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Blocked state disables proceed actions, explains unresolved repeated
  clarification, preserves the latest canonical quality report, and stops
  automatic requirement rewrites unless new explicit user input arrives.
gui_related: true
gui_classification_reason: Disabled controls and explanatory copy are user-visible wizard behavior.
split_recommended: false
depends_on: [CWF-129]
unblocks: [CWF-131, CWF-136]
acceptance_criteria:
  - Proceed remains disabled in blocked state.
  - Start Run remains disabled in blocked state.
  - UI copy explains repeated clarification attempts did not resolve the issue set.
  - Latest canonical quality report remains preserved.
  - No further automatic rewrite of requirements happens without new explicit user input.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_copy_rewrite_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_blocked_controls_copy_rewrite_stop
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0132
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
preserved_exact_tokens:
  - "Proceed"
  - "Start Run"
  - "no further automatic rewrite"
negative_constraints:
  - "No further automatic rewrite of requirements may happen without new explicit user input."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-131 - Wizard Attention Blocked Resume Packet

```yaml
plan_unit_id: CWF-131
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard packets support both wizard_attention_required and wizard_blocked with
  shared resume/deep-link fields so dashboard, thread, and resume behavior works
  for both states.
gui_related: false
gui_classification_reason: Packet field shape is shared runtime contract semantics.
split_recommended: false
depends_on: [CWF-129, CWF-130]
unblocks: [CWF-141]
acceptance_criteria:
  - Wizard packet supports wizard_attention_required.
  - Wizard packet supports wizard_blocked.
  - Shared fields include wizard_id, wizard_step, report_ref, resume_url, thread_id?, and status.
  - Resume/deep-link behavior works for attention_required and blocked.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_packet_resume_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_attention_blocked_resume_packet
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0133
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
preserved_exact_tokens:
  - "wizard_attention_required"
  - "wizard_blocked"
  - "resume_url"
  - "thread_id?"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### CWF-132 - Pre Lock Draft Decomposition Degradation

```yaml
plan_unit_id: CWF-132
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Before canonical graph lock, invalid or cyclic adaptive decomposition may
  degrade to deterministic flat draft sequencing only when the degraded draft
  structure is tagged, warning evidence is emitted, and the degradation reason is
  preserved.
gui_related: false
gui_classification_reason: Draft decomposition degradation is graph/draft planning behavior.
split_recommended: false
depends_on: []
unblocks: [CWF-133, CWF-134, CWF-135]
acceptance_criteria:
  - Pre-canonical invalid or cyclic decomposition may degrade to deterministic flat draft sequencing.
  - Degraded fallback output is tagged as degraded draft structure.
  - Warning evidence is emitted.
  - The reason for degradation is preserved.
  - Draft decomposition degradation is evidence-backed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prelock_degradation_drift
reasoning_tier: high
context_scope: draft_decomposition
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Executor_Protocol.md
  - Plans/interview-subagent-integration.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: chain_wizard_prelock_draft_decomposition_degradation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0134
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0136
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0137
preserved_exact_tokens:
  - "deterministic flat draft sequencing"
  - "degraded draft structure"
  - "warning evidence"
  - "ContractName:Plans/Executor_Protocol.md"
negative_constraints:
  - "Deterministic flat draft fallback is allowed only before graph lock."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Executor_Protocol.md
```

### CWF-133 - Post Lock Decomposition Integrity Block

```yaml
plan_unit_id: CWF-133
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  After graph lock, invalid canonical decomposition is a blocking integrity
  problem rather than a graceful fallback, and the wizard stops forward
  execution while surfacing repair or replan.
gui_related: false
gui_classification_reason: Post-lock integrity handling is planning/runtime gate behavior.
split_recommended: false
depends_on: [CWF-132]
unblocks: [CWF-134]
acceptance_criteria:
  - After graph lock, invalid canonical decomposition is blocking.
  - After graph lock, invalid decomposition is not treated as graceful fallback.
  - Wizard forward execution stops.
  - The wizard surfaces a repair/replan path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: postlock_integrity_fallback_drift
reasoning_tier: high
context_scope: draft_decomposition
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Executor_Protocol.md
  - Plans/Decision_Policy.md
  - Plans/interview-subagent-integration.md
node_compile_hint:
  mode: chain_wizard_postlock_decomposition_integrity_block
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0135
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0138
preserved_exact_tokens:
  - "blocking integrity problem"
  - "repair/replan path"
negative_constraints:
  - "After graph lock, invalid canonical decomposition is not a graceful fallback case."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Decision_Policy.md
```

### CWF-134 - Degradation and Recovery State Fields

```yaml
plan_unit_id: CWF-134
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard state persists attention, blocked, report, resume, recovery,
  degradation, and replan fields needed to audit blocked/degraded lifecycle and
  recovery attempts.
gui_related: false
gui_classification_reason: Persisted recovery and degradation fields are storage/runtime contract semantics.
split_recommended: false
depends_on: [CWF-132, CWF-133]
unblocks: [CWF-137]
acceptance_criteria:
  - State persists attention_required_reason and blocked_reason_code.
  - State persists clarification_round_count and latest_quality_report_ref.
  - State persists resume_url and attempted_recovery_actions[].
  - State persists decomposition_degraded, degradation reason, and active replan_generation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: degradation_recovery_field_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_degradation_recovery_state_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0139
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0143
preserved_exact_tokens:
  - "attention_required_reason"
  - "blocked_reason_code"
  - "latest_quality_report_ref"
  - "attempted_recovery_actions[]"
  - "decomposition_degraded"
  - "replan_generation"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-135 - Wizard Status UX Differentiation

```yaml
plan_unit_id: CWF-135
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard UX differentiates clarification still pending, blocked on correction,
  auth, approval, or integrity, and degraded-but-usable draft structure before
  lock.
gui_related: true
gui_classification_reason: This unit defines visible state differentiation in the wizard.
split_recommended: false
depends_on: [CWF-129, CWF-132]
unblocks: [CWF-136]
acceptance_criteria:
  - UI distinguishes clarification still pending as attention_required.
  - UI distinguishes blocked on user correction, auth, approval, or integrity as blocked.
  - UI distinguishes degraded but still usable draft structure before lock.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_status_ux_drift
reasoning_tier: standard
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_status_ux_differentiation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0140
preserved_exact_tokens:
  - "clarification still pending"
  - "blocked on user correction / auth / approval / integrity"
  - "degraded but still usable draft structure before lock"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-136 - Block Escalation Thresholds

```yaml
plan_unit_id: CWF-136
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard remains attention_required while the current loop can resolve the issue
  set and escalates to blocked after three unresolved clarification rounds or
  when the next action cannot be completed inside the current flow.
gui_related: true
gui_classification_reason: Escalation changes visible wizard attention or blocked state.
split_recommended: false
depends_on: [CWF-129, CWF-130, CWF-135]
unblocks: [CWF-137, CWF-138]
acceptance_criteria:
  - Wizard remains attention_required while the current clarification/review loop can still resolve the issue set.
  - Wizard escalates to blocked when clarification_round_count reaches 3 without clearing blocking issues.
  - Wizard escalates to blocked when the next required action needs auth recovery outside the current flow.
  - Wizard escalates to blocked when explicit user correction outside the inline form or replan approval is required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_escalation_threshold_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_block_escalation_thresholds
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0142
preserved_exact_tokens:
  - "clarification_round_count"
  - "3"
  - "auth recovery"
  - "replan approval"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-137 - Canonical Wizard Blocked Record Payload

```yaml
plan_unit_id: CWF-137
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Canonical blocked records persist wizard identity, step, reason, round count,
  report and resume refs, degradation fields, replan generation, and attempted
  recovery action IDs, preserving repeated cross-doc contract ownership.
gui_related: false
gui_classification_reason: Blocked record payload shape is storage/runtime contract semantics.
split_recommended: false
depends_on: [CWF-128, CWF-134, CWF-136]
unblocks: [CWF-138, CWF-141]
acceptance_criteria:
  - Blocked records persist wizard_id and wizard_step.
  - Blocked records persist blocked_reason_code and clarification_round_count.
  - Blocked records persist report_ref and resume_url?.
  - Blocked records persist decomposition_degraded, degradation_reason?, replan_generation?, and attempted_recovery_action_ids[].
  - ContractRefs to Contracts_V0.md, storage-plan.md, and assistant-chat-design.md remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_record_payload_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_canonical_blocked_record_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0144
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0146
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0148
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0150
preserved_exact_tokens:
  - "wizard_id"
  - "wizard_step"
  - "blocked_reason_code"
  - "report_ref"
  - "resume_url?"
  - "attempted_recovery_action_ids[]"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-138 - Blocked Clear and Counter Preservation Rules

```yaml
plan_unit_id: CWF-138
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  A wizard leaves blocked only when materially new input, resolved external
  prerequisites, new replan generation, or cancellation changes the blocked
  condition; reopening the same blocked wizard does not clear state or reset the
  clarification counter.
gui_related: false
gui_classification_reason: Blocked clear conditions and counter preservation are lifecycle contract semantics.
split_recommended: false
depends_on: [CWF-137]
unblocks: []
acceptance_criteria:
  - Materially new user input creating a new issue set can clear blocked.
  - Resolution of the external prerequisite named by blocked_reason_code can clear blocked.
  - A new replan_generation for the wizard context can clear blocked.
  - Wizard cancellation can clear blocked.
  - Reopening the same blocked wizard without those changes does not clear state.
  - Reopening the same blocked wizard without those changes does not reset clarification_round_count.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_clear_counter_drift
reasoning_tier: high
context_scope: blocked_lifecycle
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: chain_wizard_blocked_clear_counter_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0147
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0151
preserved_exact_tokens:
  - "materially new user input"
  - "external prerequisite"
  - "replan_generation"
  - "does not reset `clarification_round_count`"
negative_constraints:
  - "Reopening the same blocked wizard without a material change does not clear blocked state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-139 - Runtime Identity Carry Through For Wizard Planning

```yaml
plan_unit_id: CWF-139
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard planning output carries execution, lane, package, seam, attempt,
  node/tier, model/runtime, account, role, and operational identity fields so
  sweep and execution lineage can be explained.
gui_related: false
gui_classification_reason: Runtime identity carry-through is backend lineage and storage behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes runtime identity, routes, audit lineage, gates, GUI summaries, and compatibility vocabulary; this unit covers runtime identity only.
depends_on: [CWF-122]
unblocks: [CWF-141, CWF-146, CWF-147]
acceptance_criteria:
  - Planning output carries node_id, package_id, seam_id, lane_id, attempt_id, and tier_id where applicable.
  - Planning output preserves effective_identity, node-identity, tier-identity, /model, and /runtime context.
  - Handoff carries wizard_step, blocked_reason_code, clarification_round_count, report_ref, replan_generation, /degraded, execution-unit context, and account/role linkage.
  - Provider/account identity fields include effective_auth_mode, effective_account_id, effective_project_id, and operational_identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_drift
reasoning_tier: high
context_scope: runtime_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chain_wizard_runtime_identity_carry_through
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "seam_id"
  - "tier_id"
  - "effective_identity"
  - "effective_auth_mode"
  - "effective_account_id"
  - "effective_project_id"
negative_constraints: []
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Contracts_V0.md
```

### CWF-140 - Audit Lineage Exact Value Preservation

```yaml
plan_unit_id: CWF-140
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Audit refinement tokens, gap IDs, exact counters, source model pass labels,
  and sweep labels are preserved as audit lineage, not broad summary labels,
  runtime model requirements, or new planning blockers.
gui_related: false
gui_classification_reason: Audit lineage exact-value preservation is governance memory, not GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes dense audit lineage with active runtime and GUI route requirements; this unit isolates audit-only preservation.
depends_on: [CWF-125]
unblocks: []
acceptance_criteria:
  - Exact tokens such as supersedes_prior, wave-one, gap-007, gap-003, gap-004, gap-005, and gap-008 remain preserved.
  - Exact counters planning_blockers = 0, fix_backlog_items = 8, total_gaps = 8, docs_affected = 20, and underlying_gap_evidence_count = 62 remain audit lineage.
  - Source model-pass labels such as GPT-5.3-Codex are audit lineage, not wizard runtime model requirements.
  - Early broader-second-sweep and jumbo-doc read labels remain coverage lineage, not runtime states or generated project artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: audit_lineage_value_loss
reasoning_tier: high
context_scope: audit_lineage
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: chain_wizard_audit_lineage_exact_value_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "supersedes_prior"
  - "planning_blockers = 0"
  - "fix_backlog_items = 8"
  - "total_gaps = 8"
  - "docs_affected = 20"
  - "underlying_gap_evidence_count = 62"
  - "GPT-5.3-Codex"
negative_constraints:
  - "Audit labels are not wizard runtime model requirements or broad summary labels."
owner_hints:
  - Plans/chain-wizard-flexibility.md
```

### CWF-141 - Shared Route Payloads and Typed Selectors

```yaml
plan_unit_id: CWF-141
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard, thread, search, card, and deep-link navigation normalize to shared
  route payloads and typed selectors, with serialized URLs used as anchors
  rather than a separate routing schema.
gui_related: true
gui_classification_reason: Route payloads drive visible navigation from cards, search results, threads, and wizard resume links.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes route selectors with runtime identity, severity, gates, and compatibility vocabulary.
depends_on: [CWF-131, CWF-137, CWF-139]
unblocks: [CWF-147]
acceptance_criteria:
  - FinalGUISpec search clicks and wizard blocked state normalize to shared route payloads.
  - Shared route fields include resume_url, attention_required, blocked, blocked_reason_code, allowed_action_ids, and allowed_action_ids[].
  - wizard_step and usage_event_ref are not primary selectors.
  - Typed selectors include object_kind = wizard, object_id = <wizard_id>, target_kind = primary_view, project_id = <project_id>, and thread_id = <thread_id>.
  - Deep links preserve puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify as serialized anchors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_payload_selector_drift
reasoning_tier: high
context_scope: route_navigation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chain_wizard_shared_route_payloads_typed_selectors
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "allowed_action_ids[]"
  - "object_kind = wizard"
  - "object_id = <wizard_id>"
  - "target_kind = primary_view"
  - "puppet-master://wizard/<wizard_id>/step/<wizard_step_id>/clarify"
negative_constraints:
  - "wizard_step and usage_event_ref are not primary selectors."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-142 - Gate Registry and Attention Evidence Separation

```yaml
plan_unit_id: CWF-142
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Gate registry integrity keeps reserved gate/tombstone handling visible and
  preserves separate machine-verifiable evidence paths for attention_required
  and true blocked escalation.
gui_related: false
gui_classification_reason: Gate registry and evidence separation are validation/governance behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes gate evidence with routes, UI summaries, and runtime identity.
depends_on: [CWF-136]
unblocks: []
acceptance_criteria:
  - GATE-007, GATE-008, GATE, and /reserved tombstone handling remain visible.
  - GATE-012 does not collapse attention_required and true wizard blocked escalation into one evidence path.
  - attention_required has a persisted shape parallel to blocked_notice.
  - Attention evidence supports append-only corrections, /interview alignment, and machine-verifiable expectations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gate_attention_evidence_drift
reasoning_tier: high
context_scope: governance_validation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: chain_wizard_gate_attention_evidence_separation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "GATE-007"
  - "GATE-008"
  - "GATE-012"
  - "blocked_notice"
  - "machine-verifiable expectations"
negative_constraints:
  - "GATE-012 must not collapse attention_required and true wizard blocked escalation into one evidence path."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Progression_Gates.md
```

### CWF-143 - Project Attention Summaries and Severity Model

```yaml
plan_unit_id: CWF-143
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Project-level attention summaries remain compact and severity semantics stay
  distinct across info, warning, attention_required, blocked, and
  system_notification.
gui_related: true
gui_classification_reason: Primary attention/blocked summaries, count badges, banners, cards, and notifications are user-visible presentation behavior.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes GUI summary rules with runtime route and identity constraints.
depends_on: [CWF-136]
unblocks: [CWF-147]
acceptance_criteria:
  - Project summaries show one primary attention reason or primary blocked reason.
  - Project summaries may show an optional count badge for additional issues.
  - Severity values are info, warning, attention_required, blocked, and system_notification.
  - info stays in-app local /history.
  - warning can use an in-app banner /card/badge.
  - blocked is action-blocking until a required /precondition changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_summary_severity_drift
reasoning_tier: standard
context_scope: route_navigation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_project_attention_summaries_severity_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "primary attention reason"
  - "primary blocked reason"
  - "count badge"
  - "system_notification"
negative_constraints:
  - "Project-level attention summaries should not summarize every problem."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

### CWF-144 - Persona Historical Mode and Mutable Command Boundaries

```yaml
plan_unit_id: CWF-144
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Persona ownership and Historical mode boundaries remain explicit: overseer
  personas are settings-owned, worker runtime identity remains overrideable, and
  Historical mode disables live controls and current-runtime mutation commands.
gui_related: false
gui_classification_reason: Persona and Historical mode boundaries are runtime/control policy, not direct presentation.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes persona/mode policy with route, UI summary, and audit lineage.
depends_on: [CWF-113, CWF-117]
unblocks: []
acceptance_criteria:
  - Overseer personas are settings-owned roles.
  - Worker persona/provider/model remain overrideable through /provider/model and /type.
  - Historical mode disables live pause/resume/cancel.
  - Historical mode disables live retry/remediation and approval /recovery.
  - Historical mode disables commands that mutate current runtime state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_mode_boundary_drift
reasoning_tier: standard
context_scope: runtime_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: chain_wizard_persona_historical_mode_mutable_command_boundaries
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "Overseer personas"
  - "Historical mode"
  - "/provider/model"
  - "/type"
  - "/recovery"
negative_constraints:
  - "Historical mode disables commands that mutate current runtime state."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Personas.md
```

### CWF-145 - Subject First Document Identity

```yaml
plan_unit_id: CWF-145
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard planning and document systems identify the staged or generated artifact
  first; filesystem paths are later materialization or backing-document
  assignments.
gui_related: false
gui_classification_reason: Subject-first document identity is artifact identity semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - The first-class identity is the staged artifact or generated artifact.
  - Filesystem path is a later materialization or backing-document assignment.
  - /document systems remain subject-first.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: document_identity_drift
reasoning_tier: standard
context_scope: document_identity
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
node_compile_hint:
  mode: chain_wizard_subject_first_document_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "/document"
  - "/generated"
negative_constraints:
  - "Filesystem path is not the first-class document identity."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Project_Output_Artifacts.md
```

### CWF-146 - Graph Native Planning Output and Compatibility Vocabulary

```yaml
plan_unit_id: CWF-146
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard/interview output converges on graph-native planning for
  Orchestrator/GUI consumption while older Task/Subtask/Iteration and Interview
  vocabulary remains compatibility context only, and compact status separates
  Activity, Attention, and Health.
gui_related: true
gui_classification_reason: Graph-native output is consumed by Orchestrator/GUI, and compact status affects visible state presentation.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes GUI consumption and compatibility vocabulary with runtime identity and audit lineage.
depends_on: [CWF-139]
unblocks: []
acceptance_criteria:
  - chain-wizard-flexibility produces plan-graph output for Orchestrator/GUI consumption.
  - Older /Task/Subtask/Iteration and /Interview vocabulary is compatibility context.
  - Activity values are idle, running, paused, queued, and background_active.
  - Attention values are none, attention_required, blocked, and degraded.
  - Health covers setup /config/repo integrity.
  - Conversational /document-production surfaces expose runtime identity, effective runtime, effective platform /model, skipped-control disclosure, /pass stage context, /task/runtime identity in-thread, and requested/effective visibility.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_native_output_compatibility_drift
reasoning_tier: high
context_scope: graph_native_planning
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chain_wizard_graph_native_planning_output_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "/Task/Subtask/Iteration"
  - "Activity"
  - "Attention"
  - "Health"
  - "background_active"
negative_constraints:
  - "Older /Task/Subtask/Iteration and /Interview vocabulary is compatibility context only."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
```

### CWF-147 - Cross Surface Actions and Work Type Explanation

```yaml
plan_unit_id: CWF-147
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Cross-surface actions and explanation fields remain shared across Usage,
  Ledger, Wizard, thread, message, artifact, document, and usage-event surfaces,
  with work-type bias explained without dumping internals.
gui_related: true
gui_classification_reason: Shared actions and deep links are user-visible cross-surface controls.
split_recommended: true
split_recommendation_reason: Source span S0154 mixes shared actions with runtime identity, route selectors, and audit lineage.
depends_on: [CWF-141, CWF-143]
unblocks: []
acceptance_criteria:
  - Shared actions include Show in Usage, Show in Ledger, Resume Wizard, and message deep links.
  - Shared action identifiers include wizard_id, wizard_step, message_id, artifact_id, document_id, and usage_event_ref.
  - Cross-surface explanation accounts for /work-type biases without dumping internals.
  - Coverage notes preserve re-audited, six-pass, 39, 22, Plans/*.md, and top-level counts without treating them as planning blockers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_surface_action_drift
reasoning_tier: standard
context_scope: route_navigation
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: chain_wizard_cross_surface_actions_work_type_explanation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:chain-wizard-flexibility-S0154
preserved_exact_tokens:
  - "Show in Usage"
  - "Show in Ledger"
  - "Resume Wizard"
  - "usage_event_ref"
  - "/work-type"
  - "six-pass"
negative_constraints:
  - "Cross-surface explanation must account for /work-type biases without dumping internals."
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/FinalGUISpec.md
```

## Migration Coverage

Original hash: `cc79ae779c15a06767c13c358168a8fc9684c7fe399ab8927c48063e9370c833`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B atomized `chain-wizard-flexibility-S0001` through `chain-wizard-flexibility-S0154` into fine-grained PlanUnits `CWF-002` through `CWF-147`. `CWF-001` is retained only as a retired migration-lineage bridge and must not re-own atomized source coverage. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### CWF-148 - Section 12 Parent And Blocked Addenda Deduplication

```yaml
plan_unit_id: CWF-148
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  chain-wizard-flexibility must restore the missing Section 12 top-level parent for existing 12.x subsections and deduplicate the five
  overlapping wizard-blocked addenda that repeat the same blocked-record list. Blocked lifecycle authority remains with Contracts, storage,
  HITL, and Executor owner records; chain wizard consumes those records for wizard-facing flow.
gui_related: true
gui_classification_reason: Chain Wizard blocked flows are user-visible wizard behavior and screens, even though this unit is structural cleanup.
depends_on: [CWF-001]
unblocks: []
acceptance_criteria:
  - Section 12.x subsections have a live Section 12 parent or explicit alias.
  - Repeated blocked-record addenda are collapsed to one canonical chain-wizard consumer section with source-lineage notes.
  - Blocked lifecycle fields stay owned by Contracts/storage/HITL/Executor, not chain-wizard prose.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/deduplication review
risk_class: wizard_blocked_duplicate_canon
reasoning_tier: standard
context_scope: chain_wizard_doc_structure
implementation_surfaces: [Plans/chain-wizard-flexibility.md, Plans/Contracts_V0.md, Plans/storage-plan.md]
node_compile_hint: {mode: wizard_blocked_structural_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0042
preserved_exact_tokens: ["§12", "§12.x", "wizard-blocked", "blocked-record list"]
negative_constraints:
  - Do not duplicate blocked lifecycle canon inside chain-wizard-flexibility.
owner_hints: [Plans/chain-wizard-flexibility.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/assistant-chat-design.md]
```

## Ledger Compile Addendum - pldg-20260614-002

### CWF-149 - Wizard Blocked Packet Payload Contract

```yaml
plan_unit_id: CWF-149
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard `gap-005` is resolved by a versioned blocked-packet payload contract carrying packet_id,
  blocker type/reason, source stage/surface, target action, affected inputs/outputs, actor/runtime_identity,
  lane/account/project/worktree scope, permission/capability impact, recoverability classification,
  required user/agent action, evidence refs, retry/override policy, stale/expiration behavior, and UI
  display/interaction requirements. Wizard blocked-state UI derives its actions and copy from this
  structured payload rather than heading precision or free-form blocker text.
gui_related: true
gui_classification_reason: Wizard blocked-state copy, actions, retry/override controls, and interaction requirements are user-visible wizard UI behavior.
depends_on: [CWF-148, CV-281, CV-283]
unblocks: []
acceptance_criteria:
  - Blocked packets carry packet identity, blocker reason, source/target, affected data, runtime identity, scope, permission/capability impact, recoverability, evidence, retry/override, stale/expiration, and UI requirements.
  - Wizard blocked UI derives allowed actions from the payload.
  - "`gap-005` no longer remains open due to under-specified blocked-packet payloads."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: wizard_blocked_payload_gap
reasoning_tier: high
context_scope: wizard_blocked_packet_payload
implementation_surfaces: [Plans/chain-wizard-flexibility.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: wizard_blocked_packet_payload_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0112
  - pldg-20260614-002-part-3-fable-cleanup:atom-0113
preserved_exact_tokens: ["gap-005", "blocked-packet payload", "remains open", "blocked_reason_code", "allowed_action_ids", "UI display/interaction requirements"]
negative_constraints:
  - Do not derive wizard blocked actions from heading text alone.
  - Do not leave `gap-005` as an open blocked-packet payload design gap.
owner_hints: [Plans/chain-wizard-flexibility.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
```

### CWF-150 - Fork Destination And Unsupported Host Active Contract

```yaml
plan_unit_id: CWF-150
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Chain Wizard fork and PR setup must not use future-scope placeholders for organization forks or
  non-GitHub hosts. Organization fork support is an active typed path requiring destination selection,
  scope disclosure such as `read:org` when needed, permission preflight, and blocked outcomes when the
  authenticated account cannot fork into the selected organization. Non-GitHub hosts return typed
  unsupported-host outcomes with owner docs and recovery/help actions, not silent placeholders.
gui_related: true
gui_classification_reason: Fork destination selection, host-support messages, and blocked outcomes are user-visible wizard setup UI.
depends_on: [CWF-061, CWF-149]
unblocks: []
acceptance_criteria:
  - Organization forks require explicit destination, scope disclosure, preflight, and blocked outcomes.
  - Non-GitHub hosts produce typed unsupported-host outcomes.
  - The wizard contains no canonical future-scope placeholder language for fork destinations or hosts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - PlanUnit-aware scan of live canonical_text and acceptance_criteria outside CWF-150's own placeholder-ban definition for "future scope|future-scope", excluding source_lineage, preserved_exact_tokens, compatibility_only_notes, negative_constraints, and stale/retired-token fields.
risk_class: wizard_host_scope_placeholder_drift
reasoning_tier: standard
context_scope: chain_wizard_fork_host_scope
implementation_surfaces: [Plans/chain-wizard-flexibility.md, Plans/GitHub_API_Auth_and_Flows.md]
node_compile_hint: {mode: wizard_fork_host_scope_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0027
preserved_exact_tokens: ["Nothing in the plans is future scope at all.", "org forks are future scope", "Non-GitHub hosts remain future scope for MVP", "read:org"]
stale_retired_dispositions:
  - "`org forks are future scope` is retired source-lineage wording; organization fork support is an active typed path with destination selection and preflight."
  - "`Non-GitHub hosts remain future scope for MVP` is retired source-lineage wording; non-GitHub hosts return typed unsupported-host outcomes with owner docs and recovery/help actions."
negative_constraints:
  - Do not leave organization forks or non-GitHub hosts as future scope placeholders.
  - Do not silently hide unsupported host outcomes.
owner_hints: [Plans/chain-wizard-flexibility.md, Plans/GitHub_API_Auth_and_Flows.md]
```

## Ledger Compile Addendum - pldg-20260616-002

### CWF-151 - PRD Builder Legacy Compatibility Ledger To Invisible Goal Flow

```yaml
plan_unit_id: CWF-151
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  PRD Builder uses a conversational v2 ledger phase to co-shape and preserve requirements intent; Requirements Doc Builder survives here only as a compatibility/source-lineage label for the same migrated product surface. After the user accepts the ledger-ready state, an invisible Goal Mode conversion may produce requirements docs, Plans, work-graph preparation artifacts, and conversion audit evidence, with any work-graph preparation artifact boundary routed through Plan_To_Node_Compilation/PNC-009. The conversational phase is not a Goal run by default, and the invisible conversion is not a default Orchestrator WorkNode unless the user explicitly asks to hand it to Orchestrator.
gui_related: true
gui_classification_reason: PRD Builder conversation, readiness, handoff, and status behavior are user-visible builder UI.
depends_on:
  - CWF-150
  - GRS-003
  - CW-008
  - PNC-009
unblocks: []
acceptance_criteria:
  - PRD Builder preserves user intent in a v2 ledger before invisible conversion.
  - Requirements Doc Builder appears only as a compatibility/source-lineage label for the migrated PRD Builder surface.
  - The user-visible readiness state distinguishes conversational ledger capture from invisible Goal conversion.
  - Invisible conversion can emit requirements docs, Plans, work-graph preparation artifacts, and conversion audit evidence.
  - Work-graph preparation artifacts route through the Plan_To_Node_Compilation compiler boundary and do not become executable WorkNodes by default.
  - Orchestrator handoff is explicit rather than the default execution identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future PRD Builder legacy compatibility flow review
risk_class: prd_builder_legacy_runtime_drift
reasoning_tier: high
context_scope: prd_builder_legacy_compatibility
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/chain-wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: prd_builder_legacy_ledger_to_invisible_goal
  create_worknodes: false
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0001
  - pldg-20260618-001-prd-planning-wizard:atom-0002
  - pldg-20260618-001-prd-planning-wizard:atom-0004
  - pldg-20260618-001-prd-planning-wizard:atom-0158
  - pldg-20260618-001-prd-planning-wizard:atom-0159
  - pldg-20260618-001-prd-planning-wizard:atom-0160
  - pldg-20260618-001-prd-planning-wizard:atom-0161
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0007
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0028
preserved_exact_tokens:
  - "Requirements Doc Builder"
  - "ledger system"
  - "conversational"
  - "invisible Goal Mode"
  - "requirements docs"
  - "work-graph preparation artifacts"
  - "Plan_To_Node_Compilation"
  - "not a default Orchestrator WorkNode"
compatibility_only_notes:
  - "'Requirements Doc Builder' is retained in this PlanUnit only as the former label for PRD Builder."
stale_retired_dispositions:
  - Requirements Doc Builder is not the active finished-product name; PRD Builder is current.
negative_constraints:
  - Do not use Requirements Doc Builder as an active current-product name.
  - Do not treat conversational ledger capture as Goal execution by default.
  - Do not bypass ledger preservation, readiness, or audit evidence.
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/chain-wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CWF-152 - PRD Builder And Planning Wizard Semantic Migration

```yaml
plan_unit_id: CWF-152
unit_type: constraint
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: 'The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md are legacy compatibility/source-lineage consumers for material now owned by PRD Builder, Planning Wizard, Final GUI, and downstream PlanCompile/Executor owners. PMConcept and FinalGUISpec replace the old fixed Project Setup through Start Chain sequence with PRD Builder intake, dynamic Planning Run topics, live topic and plan projections, audits, Approve And Build, and Orchestrator Plan Compile navigation. Existing role styling, collapsible navigation, phase rows, live document panes, thread differentiation,
  activity indicators, worktree context, and selection-based chat context where compatible with the new architecture.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/chain-wizard-flexibility.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0156
- pldg-20260618-001-prd-planning-wizard:atom-0157
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0001
- atom-0002
- atom-0159
- atom-0156
- atom-0157
decision_refs:
- dec-0001
- dec-0029
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- Start Chain
- Approve And Build
- collapsible navigation
- live document pane
- selection context
negative_constraints:
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
- Do not retain the old nine-step linear wizard as canonical UX.
compatibility_only_notes:
- Chain Wizard, Plan Wizard, Requirements Doc Builder, Run Chain Wizard later, and Start Chain are retained only for historical migration, source-lineage, and search compatibility.
- Current product prose must use PRD Builder, Planning Wizard, Approve PRD for Planning Wizard, and Approve And Build.
- Still-valid legacy details in this doc are consumer/source-lineage inputs and must route through current owner docs before implementation.
stale_retired_dispositions:
- Active Chain Wizard and Plan Wizard ownership is retired.
- The old fixed Project Setup through Start Chain sequence is retired as canonical UX.
- Current UX is PRD Builder intake -> dynamic PlanningRun topics -> live topic/plan projections -> audits/final integration -> Approve And Build -> Orchestrator Plan Compile.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Concepts/PMConcept.html
- Plans/assistant-chat-design.md
```
