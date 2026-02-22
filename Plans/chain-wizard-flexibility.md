# Chain Wizard & Interview Flexibility — Intent-Based Workflows

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document contains:

- Intent-based workflow definitions (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR)
- GUI and flow changes to support multiple entry points and flexible requirements
- Requirements Doc Builder (Assistant → Interview handoff), Multi-Pass Review (requirements doc), and multiple requirements uploads
- Adaptive interview phases (AI-driven cut/double-down)
- Project setup and GitHub: create repo, fork (offer or user), PR flow (start and finish)
- Gaps, risks, and cross-references to other plans

## Rewrite alignment (2026-02-21)

This plan’s workflow semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Wizard/Interview/Assistant orchestration should emit and consume the **unified event model** (seglog ledger → projections)
- “Canonical requirements” artifacts should be treated as first-class **artifacts** in the event stream and projection layer
- UI implementation details should be re-expressed in Slint (not Iced) without changing user-visible flow

## Executive Summary

The current Chain wizard and Interview flow assume a single path: **start a new project** (with an optional “existing project” toggle). That does not support users who want to **fork and evolve** a repo, **enhance/rewrite/add** to an existing project that is new to Puppet Master, or **contribute a feature and open a Pull Request**. This plan defines **intent-based workflows** so the wizard, Interview, and execution path adapt to what the user is trying to do. It also expands the requirements step (multiple uploads, Requirements Doc Builder via Assistant), makes the Interview phase set **adaptive** (AI decides what to cut or double down on), and strengthens Project setup and GitHub integration (create repo, offer to create fork or let the user do it, and guide PR start/finish for first-time contributors).

**Scope:**

- **§1–§2:** Intent-based workflows and how they affect the flow.
- **§3:** GUI updates: intent selection, requirements step redesign, project setup.
- **§4:** Requirements: multiple uploads, merge/canonical input, storage.
- **§5:** Requirements Doc Builder: Assistant chat generates requirements and hands off to Interview; **§5.6** Multi-Pass Review (optional review agent + N subagents, user approves revised doc).
- **§6:** Adaptive interview phases: AI selects and weights phases by intent and context.
- **§7:** Project setup and GitHub: create repo (name + fields); fork (offer to create or user does it); PR flow (start and finish).
- **§8:** Relationship to other plans.
- **§9:** Gaps and potential problems (each with a concrete **Resolution**).
- **§10:** Implementation Readiness Checklist (concrete items for an implementation plan).

**DRY:** Reuse `platform_specs`, `docs/gui-widget-catalog.md`, rules pipeline (agent-rules-context.md), git/worktree (WorktreeGitImprovement.md, MiscPlan), subagent registry (orchestrator/interview plans), and Assistant/Interview UI patterns (assistant-chat-design.md, interview-subagent-integration.md).

---

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

---

## 1. Intent-Based Workflows

The wizard and Interview must support **four distinct intents**. Each intent changes what we ask for, how deep the Interview goes, and how we frame PRD/plan (full product vs. delta vs. feature scope).

### 1.1 New Project (greenfield)

- **User goal:** Start a new product or codebase from scratch.
- **Entry:** User selects “New project” (or equivalent). Project path may be empty or a new directory we will initialize.
- **Requirements:** User provides one or more requirements documents (upload and/or Requirements Doc Builder). No “existing codebase” context beyond optional reference docs.
- **Interview:** Full product interview (all phases available); AI may still shorten or deepen phases based on scope signals.
- **Outcome:** New repo (we may create it on GitHub), full PRD and plan, then execution.

### 1.2 Fork & Evolve

- **User goal:** Fork an existing repo and evolve it (add features, change direction, maintain a derivative). Not “start new” and not “continue the same project”—it’s a **derivative**.
- **Entry:** User selects “Fork & evolve.” We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user (via GitHub/host API or `gh repo fork`), or the user can create the fork themselves and point us at the fork path or URL.
- **Requirements:** User provides requirements that describe **what to add or change** in the fork (delta). Can be upload(s) and/or Requirements Doc Builder framed as “what are we changing/adding?”
- **Interview:** Interview is framed as **delta/evolution**: “What are you adding or changing in this fork?” Phase set can be reduced (e.g. skip or shorten Deployment if no infra change) or deepened (e.g. Architecture if major refactor). AI decides.
- **Outcome:** Fork (created by us or user), PRD/plan as **delta** over upstream, then execution on the fork.

### 1.3 Enhance / Rewrite / Add (existing project, new to Puppet Master)

- **User goal:** The project already exists; Puppet Master has never seen it. User wants to **enhance** it, **rewrite** parts, or **add** to it.
- **Entry:** User selects “Enhance/rewrite/add” and supplies **project path** (existing clone or directory). No fork required unless they later choose to contribute upstream.
- **Requirements:** User provides requirements describing the **scope of change** (what to enhance, rewrite, or add). Can be upload(s) and/or Requirements Doc Builder.
- **Interview:** Same delta framing as Fork & evolve: “What are we changing/adding?” Interview phases adapt (e.g. double down on Architecture for rewrite, skip Deployment if unchanged). Existing codebase is scanned (current codebase_scanner) to seed context.
- **Outcome:** PRD/plan as delta; execution in the existing project directory.

### 1.4 Contribute (PR)

- **User goal:** Add a feature (or fix) to someone else’s project and open a **Pull Request**. First-time PR contributors may not know the steps; we guide them.
- **Entry:** User selects “Contribute (PR).” We need **upstream repo** (URL or `owner/repo`). We **offer to create the fork** for the user, or they can create it themselves and point us at their fork.
- **Requirements:** Lightweight: feature/fix scope and acceptance criteria. Can be a short doc upload or a quick Requirements Doc Builder session (“I want to add X; acceptance: Y”).
- **Interview:** **Lighter** than full product or delta: focus on feature scope, acceptance criteria, and compatibility with upstream (e.g. style, tests). Many phases skipped or collapsed; AI decides.
- **Outcome:** Fork (if we created it or user did), **feature branch** created by us or user, work done on that branch, then we **offer to commit, push, and open the PR** (or user does it themselves). Optional in-app or linked help: “What’s a PR?” (fork → branch → push → open PR).

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
  - Which **project setup** questions we ask (e.g. “upstream URL” for Fork/PR, “project path” for Enhance, “new directory” for New).
  - Whether we **offer to create a fork** and/or **create a repo** (GitHub).
  - What **requirements prompt** we show (“Full product,” “What are you adding/changing?” or “Feature/fix scope”).
  - How the **Interview** is configured (phase set and depth) and how **PRD/plan** are framed (full vs. delta vs. feature).
- **State:** Store the selected intent in app state (and optionally in `.puppet-master/` for recovery). All downstream steps (Interview, start chain, orchestrator) receive intent so they can adapt.

### 2.1 Wizard State Shape

The app must hold a single, explicit **wizard state** that drives project setup, requirements, and downstream Interview/start chain. All fields required for the four intents are defined below.

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
    /// If true, app created the fork via gh repo fork (or API); else user provided fork.
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

**Field usage by intent:**

| Field | New project | Fork & evolve | Enhance/rewrite/add | Contribute (PR) |
|-------|-------------|---------------|---------------------|-----------------|
| intent | ✓ | ✓ | ✓ | ✓ |
| wizard_step | ✓ | ✓ | ✓ | ✓ |
| project_path | ✓ (new or empty) | ✓ (fork clone path) | ✓ (existing dir) | ✓ (fork clone path) |
| create_github_repo, repo_* | ✓ if creating repo | — | — | — |
| upstream_url | — | ✓ | — | ✓ |
| fork_created_by_app, fork_url_or_path | — | ✓ | — | ✓ |
| branch_name | — | — | — | ✓ |
| uploaded_requirements_paths, builder_used, canonical_requirements_path | ✓ | ✓ | ✓ | ✓ |

**Where state is stored:**

- **App state (in memory / GUI state):** Full `ChainWizardState` so the wizard and downstream steps (Interview, start chain) can read and update it.
- **.puppet-master/ for recovery:** Persist the same shape under a single file, e.g. `.puppet-master/wizard-state.json` (or key in redb). On launch or restore, load this file so that after a crash or restart the user returns to the correct intent, step, project path, upstream, fork and branch info, and canonical requirements path. Recovery snapshot (newfeatures.md §4) should include or reference this state so that "current view and wizard step" restoration is consistent.

**Invariants:**

- `canonical_requirements_path` is set only after at least one of: uploads (merged) or Builder output (or both merged). It always points to `.puppet-master/requirements/canonical-requirements.md` when merge has been run (see §4).
- For Contribute (PR), `branch_name` is set when the user (or app) creates the feature branch; all work for that flow happens on that branch in the **main clone** (no tier worktrees — see §7).

---

## 3. GUI Updates

### 3.1 Intent Selection at Flow Start

- **Placement:** When the user starts the flow (e.g. “Start new project” or “Open project” from Dashboard, or a dedicated “Start flow” entry), present **intent selection** before or as the first step of the wizard.
- **UI:** Four options (cards, list, or radio group) with short descriptions and optional “Learn more”:
  - **New project** — Greenfield; we’ll create or use a new directory and optional GitHub repo.
  - **Fork & evolve** — You’ll work from a fork of an existing repo; we can create the fork or you can use your own.
  - **Enhance/rewrite/add** — You have an existing project (new to Puppet Master); we’ll scope changes and plan.
  - **Contribute (PR)** — You want to add a feature or fix and open a Pull Request; we’ll guide fork, branch, and PR.
- **Persistence:** Selected intent is stored in wizard/app state and passed to Interview and start chain. If the user goes back and changes intent, downstream state (e.g. requirements, interview phase) may need to be invalidated or confirmed.

### 3.2 Requirements Step Redesign

- **Single prompt:** “Provide your Requirements Document(s).”
- **Options (at least two):**
  1. **Upload your own** — Single or **multiple** files (see §4). Supported formats per REQUIREMENTS.md (md, pdf, txt, docx); store under `.puppet-master/requirements/`.
  2. **Requirements Doc Builder** — Button that opens the **Assistant chat** (§5). User describes the project (or delta, or feature); Assistant generates a requirements document and **hands it off** to the flow so the Interview continues with that doc as input. No re-upload required.
- **Framing by intent:** The exact label or helper text can vary by intent (e.g. “Describe the product” vs “Describe what you’re adding or changing” vs “Describe the feature and acceptance criteria”).
- **After requirements:** Proceed to Interview (or skip to PRD if we add “Skip interview” for advanced users later). Interview receives the canonical requirements (merged multi-doc or Builder output).

### 3.3 Project Setup Step (including GitHub)

- **When:** At the start of Project setup (wizard step 0 or equivalent), show:
  - **Project path** (new directory or existing path).
  - **Intent-specific fields:**
    - **New project:** Optional “Create GitHub repo” with **repo name** (required if creating) and any other fields needed to **actually create** the repo (visibility, description, .gitignore template, license, default branch). See §7.1.
    - **Fork & evolve / Contribute (PR):** **Upstream repo** (URL or `owner/repo`). Then: **“Create fork for me”** (we create the fork via API/CLI) or **“I’ll create the fork myself”** (user supplies fork path or clone URL after they fork). See §7.2.
  - **Existing GitHub repo (link only):** If the user already has a repo (e.g. created elsewhere or fork already exists), allow “Use existing repo” with URL or path.
- **GitHub create-repo:** The GUI must “punch in” the repo name and all fields required by the GitHub create-repo API (or `gh repo create`) so we can create the repo without a second manual step. See §7.1.

### 3.4 Navigation and Recovery

- **Back/forward:** User can go back and change intent or project setup; document behavior when intent changes mid-flow (e.g. clear requirements and interview state, or prompt “Changing intent will reset requirements and interview; continue?”).
- **Recovery:** Per newfeatures.md §4, recovery snapshot includes current view and wizard step; intent and project path should be in the snapshot so we restore to the right step and intent.

### 3.5 Agent activity and progress visibility

When the **Requirements Doc Builder** or **Multi-Pass Review** is running, the user should **see the agents working** (similar to Assistant chat), not just a spinner or “Working…” label.

**Agent activity view (embedded, non-interactive):**

- **Concept:** A **chat-like window** embedded in the page (wizard step or Interview view) that shows **streaming agent output** — prompts, model responses, subagent reports — so the user can see progress in real time.
- **Non-interactive:** This view is **read-only** during the run: no user input, no slash commands. Minimal chrome (no full Assistant toolbar/settings); it is an embedded “agent log” or “agent activity” pane.
- **Where used:**
  - **Requirements Doc Builder:** When the Assistant is generating the requirements doc, show the Builder conversation/stream in this pane (or reuse the Assistant chat surface with a “generating…” state if the Builder is the Assistant).
  - **Multi-Pass Review (requirements doc):** When the review agent and subagents are running, stream their activity (e.g. “Review agent spawning subagents…”, “Subagent 1 reviewing…”, “Subagent 1 reported back.”) into this pane.
- **Implementation:** Reuse the same streaming/event pipeline as Assistant chat where possible (assistant-chat-design.md); for Multi-Pass Review, feed review-agent and subagent stdout/events into a similar stream and render in the embedded pane. DRY: one “agent activity view” widget or component, used by Builder, Interview document creation, and Multi-Pass Review.

**Progress indicator:**

- **Concept:** A **progress bar or status strip** that shows **which documents (or steps) are in progress** and **how many remain**.
- **Requirements Doc Builder:** Simple case — e.g. “Generating requirements document…” with optional step (e.g. “Reviewing (pass 2 of 3)” when Multi-Pass Review is running).
- **Multi-Pass Review (requirements):** E.g. “Review pass 1 of 2 — 2 subagents active” or “Review complete; producing revised doc.”
- **Interview document creation and Multi-Pass Review (interview):** See interview-subagent-integration.md “Agent activity and progress visibility”: show which document is being written or reviewed, and how many documents remain (e.g. “Writing phase 4 document — 5 of 8 remaining”; “Reviewing document 7 of 15 — 9 subagents active”).

**Placement:** The agent activity pane sits **on the same page where the action is triggered**. That means: (1) **requirements/wizard page** when Builder or Multi-Pass Review (requirements) is triggered there; (2) **Interview page** when document creation or Multi-Pass Review (interview) runs — on the Interview page the pane is shown **in addition to** the interviewer chat (redundant; see interview-subagent-integration.md “Agent activity and progress visibility”). So the pane appears in both places. We can revisit placement (e.g. drawer, modal) later if needed.

**Pause, cancel, resume:** Provide **pause**, **cancel**, and **resume** as user options during Multi-Pass Review and during document generation (Builder, Interview). **Pause:** Takes effect at **next handoff boundary** (no new subagents spawned; in-flight subagents complete and report; review agent is not started or is paused before consuming the next report). Do not kill in-flight subagents on pause. Persist state so resume can continue from that boundary. **Resume state:** Persist at least: run phase (spawning / reviewing / producing), number of completed review tasks (and which doc/pass if applicable), any partial reports already received, and review agent input state if in producing. Resume = continue spawning or producing from that point without re-running completed tasks. **Cancel:** On cancel, **stop spawning** new subagents immediately. **Do not kill** in-flight subagents; let them complete and discard their reports. Then set state to cancelled and surface Review cancelled; no changes applied. If the review agent is already producing, cancel after it finishes the current revision (do not truncate mid-write); then discard and set `cancelled`. **Recovery after crash:** Support **resume after crash** for Multi-Pass Review when recovery state is available: on restore, if state is "in progress," show "Run was interrupted" with options **Resume** (continue from persisted state) or **Start over** (clear state and re-run from step 1). If state is missing or corrupted, show only "Start over." **Recovery** (newfeatures §4) should persist “in progress” state so that after cancel or crash, the user can see “run was interrupted” and optionally start over or (if we support it) resume.

---

**Run states (canonical):** The progress indicator and pane must support exactly these states: `idle`, `generating`, `reviewing` (include pass index and subagents active when available), `paused`, `cancelling`, `cancelled`, `interrupted`, `complete`, `error`. All user-facing text (status strip, empty state, toasts) must key off these states.

**Pause/cancel/resume UI:** Place **Pause**, **Cancel**, and **Resume** in a single control row (toolbar or footer of the agent activity pane). Order: Pause | Resume | Cancel. When running: show Pause and Cancel (Resume disabled). When paused: show Resume and Cancel (Pause disabled). **Cancel** must open a confirmation modal: "Stop this run? No changes will be applied." with "Stop run" and "Keep running." On confirm, transition to `cancelling` then `cancelled`; show toast: "Run cancelled — no changes applied." **Resume** continues from the exact checkpoint; show toast "Resuming…" then "Run resumed."

**Builder surface (decision):** Use the **embedded agent activity pane** for the Requirements Doc Builder (same as Multi-Pass Review). Do not reuse the full Assistant chat surface for Builder progress; when the doc is "generating" or Multi-Pass Review is running, show that progress in the embedded pane on the requirements/wizard page.

**Stale progress:** If no progress event is received for **30 seconds** during an active run, show a warning in the progress indicator: "Progress stalled — last update 30s ago" (amber). Do not auto-cancel; user may still pause or cancel.

**Recovery payload for in-progress runs:** Persist an optional **run checkpoint** when a doc-generation or Multi-Pass Review run is in progress. Schema: `run_type` (builder | multi_pass_review_requirements | document_creation | multi_pass_review_interview), `run_id`, `phase`, `step_index`, `document_index`, `total_documents`, `subagent_tasks_done`, `checkpoint_version`. On restore, show "Run was interrupted" with "Resume from checkpoint" and "Start over." If checkpoint is missing or invalid version, show "Cannot resume — start over" and do not offer Resume.

---

## 4. Requirements: Multiple Uploads and Storage

### 4.1 Multiple Uploads

- **UI:** In the requirements step, allow **multiple** file uploads (e.g. “Add file” or multi-file picker). Display a list of added files with optional remove/reorder.
- **Limits (exact):**
  - **Max number of uploads:** **10**. Reject or disable "Add file" when the list already has 10 entries. Show a short message: "Maximum 10 files."
  - **Max file size per file:** **5 MiB** (5 × 2^20 bytes). Reject any file larger than this before saving; show a clear error (e.g. "File X exceeds 5 MB limit").
- **Order:** Merge order is the **list order** in the UI. User can reorder (e.g. drag-and-drop or up/down); that order is the only ordering used for canonical merge (see §4.2). No "primary" vs "supplements" — list order is the precedence.
- **Formats:** Same as REQUIREMENTS.md: md, pdf, txt, docx. Per-file type validation and optional normalization (e.g. to markdown) for downstream consumption.

### 4.2 Canonical Input for Interview/PRD

**Single merge order and precedence:**

1. **User uploads multiple files ONLY (no Builder):** Merge order = **list order** in the UI. Produce one canonical doc by **concatenating** file contents in that order, with a separator between each: `\n\n--- Requirements doc N ---\n\n` where N is 1-based index (e.g. first file gets "Requirements doc 1", second "Requirements doc 2"). No AI merge; no conflict resolution. If the user wants a different order, they reorder in the UI and we re-run the merge.

2. **User uses Requirements Doc Builder ONLY (no uploads):** Canonical input = **`.puppet-master/requirements/requirements-builder.md`**. No concatenation step; Interview and start chain read that path as the single canonical requirements doc.

3. **User has BOTH uploads and Builder:** **Uploads first** (in list order): concatenate all uploaded files with separator `\n\n--- Requirements doc N ---\n\n` (N = 1..upload count). **Then** append the Builder output with separator `\n\n--- Requirements Doc Builder ---\n\n`. Write the result to `.puppet-master/requirements/canonical-requirements.md` and set `canonical_requirements_path` to that path.

**Conflicting content:** There is no "conflicting content" merge. Merge is **always** concatenation in the order above. We do not run AI or rule-based conflict resolution. If the user wants a different order or to drop a doc, they reorder or remove files in the UI and the app regenerates `canonical-requirements.md`.

**Single source:** Interview and start chain read only from `canonical_requirements_path` (always `.puppet-master/requirements/canonical-requirements.md` after merge). Canonical artifact reference (or content hash) may be stored in redb for the current flow/session so the Interview and start chain read from the same canonical artifact as the event stream.

### 4.3 Storage

- **Seglog/redb:** Requirements uploads, merge result, and Builder output should be represented as **artifacts** in the event stream (seglog): emit an event when a requirements doc is added, merged, or set as canonical. Projectors can mirror to JSONL and maintain redb projections (e.g. current canonical requirements ref or artifact index) for fast lookup. Implementation should follow storage-plan.md (seglog writer, redb schema, projectors) so requirements artifacts are queryable and replayable like other app artifacts.
- **Path:** Per REQUIREMENTS.md, store under `.puppet-master/requirements/`.
- **Exact storage paths:**
  - **Uploaded files (one per upload):** `.puppet-master/requirements/uploaded/<sanitized_filename>`. `<sanitized_filename>`: take the original filename, remove or replace characters that are invalid or unsafe for the filesystem (e.g. path separators, control chars). Prefer a convention that keeps names unique (e.g. prepend index or hash if duplicate names). Example: `my-spec.md` → `my-spec.md`; `my spec (1).md` → `my_spec_1.md` or similar.
  - **Requirements Doc Builder output:** `.puppet-master/requirements/requirements-builder.md`.
  - **Merged canonical result (always written when merge runs):** `.puppet-master/requirements/canonical-requirements.md`.
- All paths are relative to the **project root** (where `.puppet-master/` lives). Implementation must create `.puppet-master/requirements/` and `.puppet-master/requirements/uploaded/` as needed.
- **Builder output:** When the Requirements Doc Builder produces a doc, write it to `requirements-builder.md`; merge step (when uploads + Builder) writes the concatenated result to `canonical-requirements.md` and set it as the canonical input for the next step.

### 4.4 Gaps and Edge Cases

- **Max number of uploads:** **10** (see §4.1). Enforced in UI and on add.
- **Large files:** **Max file size per file = 5 MiB** (5 × 2^20 bytes). Reject larger files with a clear error; do not store or stream them. No "reference only" or sampling for MVP.
- **Conflicting content:** Resolved. Merge is **always concatenation** in the defined order (§4.2). No AI merge. User controls order by reordering in the UI; no open questions.

---

## 5. Requirements Doc Builder (Assistant → Interview Handoff)

### 5.1 Concept

- **Requirements Doc Builder** is a **button** in the requirements step that opens the **Assistant chat** (same surface as in assistant-chat-design.md).
- User **talks** to the Assistant about the project (or delta, or feature). The Assistant **generates a requirements document** (format and template to be defined) and then **hands it off** to the flow: it becomes the “Requirements Document” for the next step, and the **Interview** starts the normal process with that doc as input.

### 5.2 Flow

1. User clicks “Requirements Doc Builder” in the requirements step.
2. App opens (or focuses) the **Assistant** chat, with **context** set: current project path (if any), selected **intent**, and optional system hint: “User is building a requirements document for the Interview; when complete, produce the document and hand off.”
3. User converses; Assistant may ask clarifying questions, suggest structure, or draft sections.
4. When the user (or Assistant) considers the doc ready, user triggers **“Done — hand off to Interview”** (or equivalent: e.g. “Generate requirements doc” button or slash command).
5. Assistant **produces** the requirements document (e.g. markdown). App **writes** it to `.puppet-master/requirements/` (e.g. `requirements-builder.md`) and sets it as the **canonical requirements** for the flow.
6. App **returns** the user to the wizard at the **requirements step** (or the next step) with the doc **pre-loaded** (no re-upload). Optionally show a short confirmation: “Requirements doc generated; continue to Interview?”
7. User continues; **Interview** runs with that doc (and any other merged uploads, if we allow Builder + uploads in the same run).

### 5.3 Handoff Contract

- **Output format:** Markdown recommended; structure (sections) must follow the **Builder output template** below so Interview and PRD generator get consistent input.
- **Single vs. multiple:** For MVP, Builder produces **one** doc per handoff. If we later allow “Builder + uploads,” merge order and precedence (Builder last vs. first) to be defined.
- **Persistence:** Handoff state (path to generated doc, “source = Builder”) stored in app state and in `.puppet-master/` if we need recovery.

**Builder output template (required):** The Assistant/Builder must emit a single Markdown document with the following **required top-level sections** (headings). Implementations may validate and warn if sections are missing.

| Section heading | Purpose |
|-----------------|--------|
| **Scope** | What is in scope for the product, delta, or feature. |
| **Goals** | High-level goals and success criteria. |
| **Out of scope** | Explicitly excluded items. |
| **Acceptance criteria** | Testable conditions of done (can be a list). |
| **Non-goals** | What we are not trying to achieve (optional but recommended). |

Additional sections (e.g. **Risks**, **Dependencies**, **Constraints**) are allowed. The PRD generator and Interview assume at least the five above; add a validation step that warns when any required section is missing.

### 5.4 Dependencies

- **Assistant chat** must be implemented (assistant-chat-design.md).
- **Project/context:** Assistant must know current project path and intent so it can tailor questions and the generated doc (e.g. “delta” vs “full product” vs “feature scope”).
- **No duplicate rules:** Use the same rules pipeline (agent-rules-context.md) for Assistant; do not duplicate interview-specific rules in the Builder prompt beyond “produce a requirements doc for handoff.”

### 5.5 Gaps and Risks

- **Token usage:** Long conversations before handoff may use significant context; consider “Summarize and produce doc” step to bound length.
- **Quality:** Builder output is best-effort; Interview may still need to clarify. We don’t guarantee the doc is complete; we only guarantee it’s passed to Interview.
- **Abandonment:** If user opens Builder but never hands off, flow is stuck on requirements step until they upload or hand off. Consider “Cancel Builder” that returns to requirements step without saving.

### 5.6 Multi-Pass Review (Requirements Doc)

When the Requirements Doc Builder produces a document, an optional **Multi-Pass Review** runs before handoff to the Interview. A **review agent** spawns N **review subagents** (each can use a different model/platform) to check the document for gaps, problems, missing information, and consistency. The review agent then decides what to do with the feedback.

**When it runs:** After the Assistant produces the requirements document and before it is set as canonical input for the Interview.

**Settings (early in the flow — same page as requirements step or wizard):**

- **Multi-Pass Review:** On/off. **Default: off.** When on, review runs after the Builder produces a document and before handoff to Interview.
- **Number of reviews (additional checks):** How many subagents review the doc. Default **2**, max **10**. So with 2, the review agent spawns 2 subagents; with 10, it spawns 10 subagents.
- **Use different models:** Default **true**. When true, each subagent can use a different model (and optionally platform) from a user-configured list.
- **Model/platform list:** User can configure which models (and platforms) to use for review subagents; **cross-platform** is allowed (e.g. one subagent on Claude, one on Codex).
- **Model/platform list validation:** Minimum 1 entry; maximum 20. When "Use different models" is true and list has fewer than N entries (N = number of reviews), **cycle** through the list (assign models round-robin to subagents) and show a short UI notice: "Fewer models than reviews; some models will be reused."
- **Review agent model/platform:** The review agent (the process that consumes subagent reports and produces the revised doc) uses a **configurable** model/platform. Default: same as the primary platform used for the Builder (or Interview if unified). GUI: same model/platform list or a dedicated "Review agent" dropdown; may be the same as one of the subagent models or different.

**Flow:**

1. Requirements doc is produced by the Assistant. **Empty or minimal doc:** Before starting Multi-Pass Review, check Builder output size (e.g. character or token count). If below a minimum (e.g. &lt; 100 characters or empty), **skip** Multi-Pass Review, set the Builder output as canonical, and show a brief notice: "Document too short for review; using as-is." Minimum threshold to be defined in implementation (document in config or constants).
2. Review agent spawns N subagents (N = number of reviews). **Single document:** There is always exactly one document from the Builder. N subagents each review that same doc; no per-document batching. Whole-set pass does not apply (single doc = whole set). Each subagent receives the doc (and, for delta/feature intents, optional codebase context from codebase_scanner).
3. Subagents look for: gaps, problems, missing information, unscoped items. Depth is lighter than the Interview — the Interview will flesh details out.
4. Each subagent reports findings back to the review agent, then is terminated (no long-lived context).
5. Review agent **produces a revised requirements document** incorporating or responding to the feedback.
6. **User approves** the revised document (option **b**). **Approval UI:** Surface the revised doc and a short summary of changes. Offer three actions: **Accept** (set as canonical requirements and continue to Interview), **Reject** (discard revised doc; keep original Builder output as canonical; user can continue to Interview or re-run Builder), **Edit** (open editor on revised doc; on save, treat as revised doc and re-show Accept/Reject/Edit). No per-section approval for requirements doc; single decision per run.

**Run state:** Persist and expose for UI/recovery: `pending` → `spawning` → `reviewing` (with progress: pass/round and subagents active) → `producing` (review agent writing revised doc) → `awaiting_approval` → `complete` | `cancelled` | `failed`. On failure, set `failed` and store error reason; on cancel, set `cancelled`. Recovery snapshot (newfeatures §4) must include this state and progress so "run was interrupted" and optional resume are accurate.

**Review agent behavior:** Produce revised document; user must approve before handoff. No automatic apply without approval.

**Dependencies:** Assistant chat, review agent plus N subagents (Multi-Pass Review pattern; not the Crew feature), platform_specs for model/platform selection. For fork/PR/enhance intents, review subagents may receive codebase context so they can check feasibility against existing code. **Codebase context:** For intents **Fork & evolve**, **Enhance/rewrite/add**, and **Contribute (PR)**, always attach a **short codebase context** (e.g. from codebase_scanner: key paths, module list, tech stack summary) to each review subagent prompt when project path is set. No extra user setting; intent + project path imply inclusion.

**Error handling:**

- **Subagent crash or timeout:** Treat as one failed review; collect partial report if available. If fewer than half of the requested reviews complete, mark run as `failed` and surface "Multi-Pass Review failed (too few reviews completed)." Otherwise, continue with completed reports and log the failure.
- **Review agent fails to produce revised doc:** Mark run as `failed`. Surface error message and option to "Use original document" (set Builder output as canonical and continue) or "Retry" (re-run review agent once with same reports).
- **All subagent spawns fail:** Mark run as `failed`; surface "Could not start review subagents (check model/platform and auth)." Option "Use original document" as above.

**GUI and visibility:** See §3.5 (agent activity view and progress indicator) so the user sees the review agent and subagents working during Multi-Pass Review. **Pause, cancel, resume** are supported options (§3.5).

---

## 6. Adaptive Interview Phases

### 6.1 Goal

- The **Interview** today has a fixed set of phases (e.g. Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing). For different intents and contexts, we want the **AI Interviewer** (or phase manager) to **decide** which phases to **cut**, which to **shorten**, and which to **double down on**.
- This keeps the interview appropriate to the task: full product gets full depth; PR contribution gets a light pass; fork/evolve gets delta-focused depth where it matters.

### 6.2 Mechanism

- **Inputs to the decision:**
  - **Intent** (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR).
  - **Early context:** e.g. first answers, uploaded requirements summary, or a short “scope” question at the start.
  - **Optional:** Project context (languages, frameworks) from codebase_scanner when it’s an existing project.
- **Output:** A **phase plan** for this run: which phase IDs to include, optional **depth** or **weight** per phase (e.g. “Architecture: deep,” “Deployment: skip”), and optionally reorder.
- **Implementation:** Extend the **phase manager** (interview-subagent-integration.md) to support:
  - A **pre-interview step** (or first phase) that asks 1–2 scope questions and/or reads the requirements summary, then calls a **phase selector** (or the same agent with a structured prompt) that returns the phase plan.
  - The rest of the interview runs only the selected phases, with depth hints (e.g. “ask 2–3 questions” vs “full phase”) where applicable.

### 6.3 Phase Selector Contract

**Input (Rust struct or JSON):**

- `intent`: enum — `NewProject` | `ForkEvolve` | `EnhanceRewriteAdd` | `ContributePR`
- `requirements_summary`: `String` — first 2000 characters of the canonical requirements document (after merge/Builder)
- `codebase_summary`: `Option<String>` — from codebase_scanner when project path exists and is an existing project; `None` for new project or when scanner not run

**Output:**

- `phase_plan`: `Vec<PhasePlanEntry>` where each entry is:
  - `phase_id`: `String` (e.g. `"scope_goals"`, `"architecture"`, `"ux"`, `"data"`, `"security"`, `"deployment"`, `"performance"`, `"testing"`, or other phase IDs from interview-subagent-integration.md)
  - `depth`: enum — `Full` | `Short` | `Skip`

**Depth semantics:**

- **Full:** Run full phase — all questions for that phase, research if configured.
- **Short:** Run abbreviated phase — maximum 2 questions for that phase, no research.
- **Skip:** Do not run this phase; omit from interview run.

**Fallback when selector fails or returns empty:**

Use rule-based default (do not re-invoke selector):

- **NewProject** → all phases `Full`
- **ForkEvolve** → all phases `Full`
- **EnhanceRewriteAdd** → all phases `Full`
- **ContributePR** → only `scope_goals` (Short), `testing` (Short); all other phases `Skip`

**Storage:** Persist `phase_plan` in interview state. Path: `.puppet-master/interview/phase_plan.json` (or include in existing interview state file if one exists). Schema must allow round-trip of `Vec<PhasePlanEntry>` (phase_id + depth).

**Resume:** When resuming an interview, load `phase_plan` from stored state; do **not** re-run the phase selector. Run only the phases and depths already in the loaded plan.

**User override — "Run all phases":** Add a GUI checkbox **"Run all phases"** (default **off**). When **on**, ignore stored/generated `phase_plan` and run all phases at **Full** depth. This overrides both selector output and fallback.

**User override — Phase checklist (optional):** Show a list of phases with checkboxes. Checked = run the phase (use depth from `phase_plan` or Full when "Run all phases" is on). Unchecked = force-skip that phase regardless of plan. If "Run all phases" is on, all checkboxes default checked; user can uncheck to skip specific phases.

### 6.4 Relationship to interview-subagent-integration.md

- Phase **subagents** (product-manager, architect-reviewer, etc.) remain; we only **select** which phases run and at what depth.
- **Document generation** and **research/validation** subagents still apply to the phases that are run.
- **New subsection** in that plan: “Adaptive phases: intent and context drive phase selection and depth; phase manager implements phase selector and runs only selected phases.”

### 6.5 Gaps and Risks

- **Determinism:** Phase selection is AI-driven; two runs with same intent might get different phase sets. Consider caching by (intent, requirements_hash) or making selection rule-based with optional AI override.
- **User override:** Should the user be able to “force full interview” or “skip phase X”? If so, add a simple override in GUI (e.g. “Run all phases” checkbox or phase checklist).

---

## 7. Project Setup and GitHub: Create Repo, Fork, PR

### 7.1 Create Repository (New Project)

- **Requirement:** At Project setup, GitHub controls must support **actually creating** a repo, not only linking an existing one.
- **Fields (minimum):**
  - **Repository name** (required when “Create GitHub repo” is checked). Pre-fill from project name when possible; user can edit.
  - **Visibility:** Public / Private (and any org-level options if applicable).
  - **Description:** Optional.
  - **Other fields** required by the create-repo API or `gh repo create`: e.g. .gitignore template, license, default branch name. Document the exact list per integration (GitHub API vs `gh` CLI).
- **Exact fields for `gh repo create` (GitHub CLI):** When "Create GitHub repo" is checked, the GUI must collect and pass the following. All are passed to `gh repo create` (or equivalent API) so the repo is created in one step.

  | Field | Required | Values / notes |
  |-------|----------|----------------|
  | **name** | Yes (if creating repo) | Repository name; pre-fill from project name when possible. |
  | **visibility** | Yes | `public` or `private`. |
  | **description** | No | Short description string. |
  | **gitignore** | No | Template name (e.g. `Node`, `Rust`, `Python`). Use `gh repo create --help` / template list for allowed values. |
  | **license** | No | License identifier (e.g. `mit`, `apache-2.0`, `gpl-3.0`). |
  | **default branch** | No | Branch name for initial commit (e.g. `main`). Default if omitted: `main`. |

  **CLI example:** `gh repo create <name> --public|--private [--description "…"] [--gitignore <template>] [--license <id>] [--source .]` (Exact flags may vary by `gh` version; implementation must use the current `gh repo create` contract and pass the above fields.)
- **Action:** On "Create," call `gh repo create` (or GitHub API) with these values; set the remote (e.g. `origin`) and optionally push initial commit so the project is ready. Use existing GitHub auth (Doctor/Setup; `gh auth status` or token).

### 7.2 Fork: Offer to Create or User Does It

- **Requirement:** For intents **Fork & evolve** and **Contribute (PR)**, we **offer** to create the fork for the user, but **allow the user to create the fork themselves**.
- **Offer to create:**
  - User supplies **upstream repo** (URL or `owner/repo`).
  - Button or link: **“Create fork for me.”** We call **`gh repo fork <upstream>`** where `<upstream>` is the upstream repo (URL or `owner/repo`). Do **not** pass an org flag for MVP; the fork is created in the **authenticated user’s account**. (“Fork to organization” is **future**: allow choosing an organization as fork destination when we support it.)
  - After creation, we have the fork clone URL (e.g. from `gh repo view` or fork API). We **clone** the fork to the chosen project path, set that as the working project, and optionally set `upstream` remote to the original repo. Set `fork_created_by_app: true` and store `fork_url_or_path` in wizard state.
- **User does it themselves:**
  - Option: **“I’ll create the fork myself.”** We show brief instructions (e.g. “Fork the repo on GitHub, then paste your fork URL or clone path below”) and a field for **fork URL** or **local path** after they clone. We use that as the working project and do **not** call `gh repo fork`. Set `fork_created_by_app: false`. Validate path/URL is a valid git repo; optionally check for `upstream` or `origin` pointing to the expected repo.
- **Validation:** If user chose “Create fork for me,” verify fork exists and we have clone URL before proceeding. If “I’ll do it myself,” verify the path or URL is a valid git repo and optionally that it has an `upstream` or origin pointing to the expected repo.

### 7.3 PR Flow: Start (Fork, Clone, Branch)

- **Goal:** For “Contribute (PR),” we do (or guide) the standard **start** of a PR: fork → clone → create a **feature branch**.
- **Steps we offer:**
  1. **Fork** — Already covered in §7.2 (offer to create or user does it).
  2. **Clone** — If we created the fork, we clone it to the chosen path. If user provided fork path/URL, we use it (or clone if URL).
  3. **Branch** — Create a **feature branch** (e.g. `feature/add-x` or `fix/issue-42`). User can name it or we suggest from intent/requirements (e.g. “feature/” + slug from first line of requirements). All work happens on this branch.
- **Worktree vs feature branch (Contribute PR):** For **Contribute (PR)** we do **not** create tier worktrees (no per-tier worktree branches). All work happens on a **single feature branch** in the **main clone** (the fork clone at `project_path`). Steps: fork → clone to project path → create one feature branch in that clone → run Interview and orchestrator work on that branch. No separate worktrees for subtasks for this intent.
- **UI:** After fork/clone, show “Create feature branch” with optional branch name input; on confirm, run `git checkout -b <branch>` (or equivalent). Then proceed to requirements and Interview.

### 7.4 PR Flow: Finish (Commit, Push, Open PR)

- **Goal:** After the orchestrator (or user) has made changes, we **offer** to commit, push the branch to the fork, and open the Pull Request. User can also do these steps themselves.
- **Steps we offer:**
  1. **Commit** — Gather changed files (or use a suggested list from last run). User provides **commit message** (or we suggest one from task/phase). Run `git add` and `git commit`.
  2. **Push** — Push the current branch to the fork (`origin` or user’s fork remote). Handle auth (e.g. `gh auth` or token); surface push errors (e.g. permission, network).
  3. **Open PR** — Create the Pull Request: **from** current branch on the fork **to** default branch of **upstream**. Do **not** assume upstream default branch is `main` or `master`. Before opening the PR, **always** run: `gh repo view <upstream> --json defaultBranchRef -q .defaultBranchRef.name` and use the returned branch name as the **target** of the PR (e.g. `gh pr create --base <that_name>`). User can edit **title** and **body** (or we prefill from commit message and/or task summary). Use `gh pr create` or GitHub API. Link to the new PR in the UI.
- **User does it themselves:** Option “I’ll commit and open the PR myself” with short instructions (commit, push, open PR on GitHub) and optional link to GitHub “Compare & pull request” for their branch.
- **Help for first-time contributors:** Optional in-app blurb or link: “What’s a PR? You work on a branch of your fork; we push it and open a request for the upstream repo to merge your changes.”

### 7.5 Integration with WorktreeGitImprovement and MiscPlan

- **Branch naming:** Reuse sanitization and strategy from WorktreeGitImprovement.md (branch naming, no invalid refs).
- **PR creation:** Existing `PrManager` and `gh` usage (MiscPlan §3.6: no secrets in PR body; use tier metadata, file lists, acceptance criteria). For “Contribute (PR)” finish flow, we may use a **different** PR body template (e.g. “Feature: …” and link to requirements or task). Document which template is used when.
- **Git auth:** Fork creation, push, and PR creation all require GitHub auth; use existing Doctor/Setup checks and `gh auth status`. Do not store tokens in code; use env or system auth.

**Required GitHub auth scopes (MVP):** **repo** (full) — required for create repo, fork, push branch, open PR. **read:org** — optional for MVP; required only if we add "Fork to organization." Document these in Doctor/Setup and in user-facing docs. On permission errors (e.g. 403), show: "Permission denied: ensure your GitHub token has the **repo** scope (and **read:org** if using organization fork)." with a link to token/settings.

### 7.6 Gaps and Risks

- **Non-GitHub hosts:** Fork/PR flow is specified for **GitHub** only (e.g. `gh repo create`, `gh repo fork`, `gh pr create`). **Future:** GitLab (e.g. `glab` CLI) and Bitbucket (e.g. `bb` CLI) will be stubbed with the same UX (create repo, fork, MR/PR); implementation will use the appropriate CLI/API per host. No implementation for non-GitHub in MVP.
- **Org vs. user fork:** **MVP = user fork only.** We use `gh repo fork <upstream>` with no org flag; fork is created in the authenticated user's account. **"Fork to organization"** is a future option; when added, document the flag or API (e.g. `--org`) and required scopes.
- **Rate limits:** Creating repo/fork and opening PR use GitHub API/CLI; respect rate limits and surface "too many requests" (or equivalent) to the user.

---

## 8. Relationship to Other Plans

| Plan | Relevance |
|------|-----------|
| **REQUIREMENTS.md §5** | Start Chain steps: ingest requirements, PRD, plan, validate. This plan extends **ingest** (multiple uploads, Builder) and **how** we get to the chain (intent, project setup, fork/PR). |
| **Plans/newfeatures.md** | §4 Recovery (snapshot includes wizard step and intent). §8 Restore points (rollback to phase). §14 redb (resume interview). Intent and requirements handoff are new entry-point flexibility. |
| **Plans/assistant-chat-design.md** | Requirements Doc Builder **is** the Assistant chat with a specific handoff contract. Add subsection or reference: “Requirements Doc Builder: generate requirements and hand off to Chain/Interview.” |
| **Plans/interview-subagent-integration.md** | Adaptive phases (§6) extend the interview: add “Phase selection and depth by intent and context.” Subagents and phase assignments unchanged; only which phases run and depth. |
| **Plans/orchestrator-subagent-integration.md** | Config and tier config apply to runs started from any intent. No change to tier/subtask execution; only how we **enter** the flow (intent, requirements, project setup). |
| **Plans/agent-rules-context.md** | Application and project rules apply to Assistant (Builder), Interview, and orchestrator. Same rules pipeline for all. |
| **Plans/WorktreeGitImprovement.md** | Branch naming, PR creation, worktree lifecycle. Fork creation and “PR start/finish” are **additional** GUI and flow steps; reuse branch/PR tooling where possible. |
| **Plans/MiscPlan.md** | Git ignore, no secrets in PR body, cleanup allowlist. `.puppet-master/requirements/` and any new paths under `.puppet-master/` must be allowlisted. |
| **Plans/usage-feature.md** | No direct change; usage tracking applies to Builder, Interview, and orchestrator runs as today. |
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

- **Phase selector failure:** If the phase selector (AI or rule) fails or returns empty, fallback to "all phases" or "minimal safe set" (e.g. Scope + one technical phase) and log.
  **Resolution:** Use rule-based fallback per §6.3: by intent, NewProject/ForkEvolve/EnhanceRewriteAdd → all phases Full; ContributePR → scope_goals (Short), testing (Short). Log selector failure and applied fallback. Do not re-invoke selector.

- **Depth semantics:** "Short" vs "full" depth must be defined per phase (e.g. "short = 1–2 questions") so the Interview agent has clear instructions.
  **Resolution:** Full = all questions for phase, research if configured. Short = max 2 questions for that phase, no research. Skip = do not run phase. Document in phase manager and interviewer prompt; enforce cap in phase runner (e.g. question count or token budget for Short).

- **Resume with adaptive phases:** If we add "resume interview" (newfeatures §14), stored state must include the **phase plan** so we don't re-run phase selection and change the set on resume.
  **Resolution:** Interview state (and/or `.puppet-master/interview/phase_plan.json`) stores `phase_plan`. On resume, load phase_plan from state and run only those phases/depths; do not call phase selector again.

### 9.4 GitHub and Fork/PR

- **Auth scope:** Fork creation and PR creation may require different scopes (e.g. `repo`, `workflow`). Document required scopes and surface "Permission denied" clearly.
  **Resolution:** Document required GitHub scopes (e.g. `repo` for fork/create/PR; add to Doctor/Setup or docs). On API/CLI permission errors, show user-facing message: "Permission denied: ensure GitHub token has repo (and workflow if needed) scope" with link to token settings.

- **Upstream default branch:** We assume upstream default branch is `main` or `master`; we should detect it (e.g. `gh repo view --json defaultBranchRef`) when opening the PR so we target the correct branch.
  **Resolution:** Before opening PR, call `gh repo view <upstream> --json defaultBranchRef` (or equivalent); use returned branch name as PR target. Do not hardcode `main` or `master`.

- **Conflict with WorktreeGitImprovement:** Orchestrator may create worktrees and branches for tiers; "Contribute (PR)" uses a single feature branch. Ensure we don't create a worktree that clashes with the user's feature branch.
  **Resolution:** Contribute (PR) flow uses the main clone's feature branch for user work. Tier/worktree orchestration (if any) uses separate worktrees or branches; document that PR branch is the user-facing branch and is not replaced by orchestrator worktrees. Implementation: PR branch is the checked-out branch in the single clone; worktrees for subtasks (if used) are distinct and do not replace the PR branch ref.

### 9.5 GUI and UX

- **Wizard length:** Adding intent selection and more project setup may make the wizard feel longer. Consider **progress indicator** (e.g. "Step 1 of N") and optional **skip** for advanced users.
  **Resolution:** Add a progress indicator showing current step index and total (e.g. "Step 2 of 6"). Skip-to-execution ("I already have requirements and prd.json") is deferred to a later phase; document as future work.

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
  **Resolution:** See §9.4 (scopes in docs/Doctor; detect default branch via `gh repo view`).

- Add **intent** and **wizard_step** to recovery snapshot.
  **Resolution:** See §9.1 (recovery schema includes intent and wizard_step).

- Define **"intent change mid-flow"** policy and UI.
  **Resolution:** See §9.1 (modal Continue/Cancel; clear requirements and interview state on Continue).

- Implement **agent activity view** and **progress indicator** (§3.5); **pause, cancel, resume** and recovery.
  **Resolution:** See §9.5 (single shared component, placement, pause/cancel/resume, recovery state).

---

## 10. Implementation Readiness Checklist

Before implementation, an implementation agent must complete or have clear specs for the following. Use this list to derive implementation tasks; order may be adjusted by dependency.

1. Add **FlowIntent** enum to app state: `NewProject | ForkEvolve | EnhanceRewriteAdd | ContributePR`.
2. Persist **intent** in wizard/app state and in recovery snapshot (with `wizard_step`).
3. Implement **merge_canonical_requirements(uploads, builder_path) → Path**: merge order uploads then Builder, write canonical doc, return path.
4. Add **phase_plan** to interview state schema (e.g. `.puppet-master/interview/phase_plan.json` or embedded in existing interview state file).
5. Define **PhasePlanEntry** (phase_id, depth: Full | Short | Skip) in types and JSON schema.
6. Implement **phase selector** input (intent, requirements_summary first 2000 chars, codebase_summary Option) and output (Vec<PhasePlanEntry>); call from pre-interview step.
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
17. **GitHub create repo:** Add GUI fields and **gh repo create** (or API) call with repo name, visibility, description, .gitignore template, license, default branch per §7.1.
18. **Fork:** "Create fork for me" (gh repo fork or Fork API) and "I'll create the fork myself" path/URL input; validate fork exists or path is valid repo.
19. **PR start:** Fork → clone → create feature branch; branch name input or suggest from requirements slug.
20. **PR finish:** Commit, push branch, open PR (gh pr create or API); detect upstream default branch via `gh repo view --json defaultBranchRef`; prefill title/body from task; link to PR in UI.
21. **GitHub auth:** Document required scopes; surface "Permission denied" with token-scope message and link.
22. **Contribute (PR) vs worktrees:** Document and implement so PR branch is main clone's feature branch; orchestrator worktrees (if any) do not replace it.
23. **Agent activity view:** One shared non-interactive streaming component; use on requirements page (Builder, Multi-Pass Review) and Interview page (document creation, Multi-Pass Review).
24. **Progress indicator:** Current document/step and remaining count; pause, cancel, resume; persist "in progress" in recovery for resume or start over.
25. **Accessibility:** All new controls keyboard-accessible and screen-reader labeled; use widget catalog.
26. **i18n:** New strings in central module/resource file keyed by id.
27. **No secrets:** Sanitize requirements doc, Builder output, and PR body; checklist item for implementation.
28. **Document:** Fork/PR we only clone and create branch; no execution of upstream code.

---


*This document is part of the RWM Puppet Master plan set. Update it as the design evolves or implementation reveals new gaps.*