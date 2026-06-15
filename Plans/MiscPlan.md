# Misc Plan -- Agent Artifacts, Cleanup & Related Improvements


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document covers:

- Agent-left-behind artifacts (docs, tests, builds) and cleanup policy
- Runner contract implementation (prepare_working_directory, cleanup_after_execution)
- Dedicated agent output directory and evidence retention policy
- Cleanup UX (manual prune, config toggles)

Implement sections in dependency order. The **DRY Method** (AGENTS.md) applies: single implementation in a dedicated module, no duplicated logic, all new reusable items tagged.

## Rewrite alignment (2026-02-21)

This plan's cleanup/artifact retention requirements remain authoritative, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- Treat cleanup actions, retained artifacts, and evidence as first-class **artifacts/events** in the unified event model (seglog ledger)
- Prefer enforcing cleanup boundaries via the **patch/apply/verify/rollback pipeline** (worktree/sandbox lifecycle), not UI-only affordances
- Any config/file-path examples should be interpreted as projections/import-export paths in the new seglog/redb architecture
- **Artifact retention and evidence:** Emit **cleanup and evidence events** to seglog (e.g. cleanup run started/completed, evidence retained/pruned, manual 'Clean workspace' action). Use redb for retention policy, retention metadata, or rollups (e.g. last cleanup time, evidence count per run) so dashboard and retention logic can query without scanning seglog. See storage-plan.md for projectors and analytics.

**Suggested implementation order (DRY-friendly):**  
1) Add `src/cleanup/` with allowlist (DRY:DATA) and `run_git_clean_with_excludes` (DRY:FN); use shared git binary resolution from Worktree plan when available (§10.1).  
2) Implement `prepare_working_directory` and `cleanup_after_execution` (DRY:FN) in cleanup module.  
3) Add/extend runner contract with default impls delegating to cleanup.  
4) Add `run_with_cleanup` wrapper (DRY:FN) and switch all call sites to it.  
5) Document policy in AGENTS.md; add config toggles and Cleanup UX (using existing widgets); wire cleanup config via same Option B as Worktree plan (§10.1).  
6) Agent-output dir, evidence pruning, manual "Clean workspace" action (worktree list from Worktree plan if "all worktrees" desired).

**Cross-plan:** Section 10 describes how this plan depends on and impacts WorktreeGitImprovement, orchestrator-subagent-integration, and interview-subagent-integration.

**ELI5/Expert copy alignment:** Any authored tooltip/help/discoverability copy in this plan (for example shortcut/tooling hints) must provide both Expert and ELI5 variants and follow `Plans/FinalGUISpec.md` §7.4.0. App-level **Interaction Mode (Expert/ELI5)** selects variant display; chat-level **Chat ELI5** is separate and chat-only.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Cleanup Policy](#3-cleanup-policy) (includes [3.5 DRY Method](#35-dry-method-single-source-of-truth-and-reuse), [3.6 Gitignore and security](#36-gitignore-and-security-no-secrets-to-github))
4. [Runner Contract Implementation](#4-runner-contract-implementation) (includes [4.6 Call sites](#46-call-sites-orchestrator-interview-start-chain-and-conversation), [4.7 DRY module layout and tagging](#47-dry-module-layout-naming-and-tagging), [4.8 Concrete implementation details](#48-concrete-implementation-details))
5. [Agent Output Directory](#5-agent-output-directory)
6. [Evidence Retention & Pruning](#6-evidence-retention--pruning)
7. [Cleanup UX & Config](#7-cleanup-ux--config) (includes [7.5 GUI gaps and updates](#75-gui-gaps-and-updates-consolidated), [7.6 Leveraging platform CLI capabilities](#76-leveraging-platform-cli-capabilities-hooks-skills-plugins-extensions), [7.7 Desktop Shortcuts](#77-desktop-shortcuts-gui-screen), [7.8 Agent Skills](#78-agent-skills-gui), [7.9 Backend: Desktop Shortcuts](#79-backend-desktop-shortcuts), [7.10 Backend: Agent Skills](#710-backend-agent-skills), [7.11 Shortcuts and Skills: gaps, enhancements, implementation readiness](#711-shortcuts-and-skills-gaps-enhancements-implementation-readiness), [7.11.1 Shortcuts: export/import, search/filter, discoverability](#7111-shortcuts-exportimport-searchfilter-discoverability), [7.11.2 Skills: bulk permission, sort/filter, preview, last modified, validate all](#7112-skills-bulk-permission-sortfilter-preview-last-modified-validate-all))
8. [Implementation Checklist](#8-implementation-checklist) (includes [8.1 Core cleanup module](#81-core-cleanup-module-required) through [8.10 Shortcuts and Skills: export/import, search/filter, discoverability, bulk permission, sort/filter, preview, last modified, validate all](#810-shortcuts-and-skills-exportimport-searchfilter-discoverability-bulk-permission-sortfilter-preview-last-modified-validate-all), [8.7 Pre-completion](#87-pre-completion), [8.8 Desktop Shortcuts backend](#88-desktop-shortcuts-backend-77-79), [8.9 Agent Skills backend](#89-agent-skills-backend-78-710))
9. [Risks & Notes](#9-risks--notes)
10. [Cross-Plan Dependencies and Impacts](#10-cross-plan-dependencies-and-impacts)
11. [References](#11-references)

---

## 1. Executive Summary

### Goals

- **Prevent clutter:** Avoid accumulation of agent-created docs, ad-hoc tests, build artifacts, and old test builds.
- **Align with REQUIREMENTS:** Implement the runner contract (`prepare_working_directory`, `cleanup_after_execution`) and "clean working directory" / "clean up temp files" behavior.
- **Keep evidence valuable:** Retain `.puppet-master/evidence/` and other state; only clean according to an explicit policy.
- **In scope:** Dedicated agent output directory; evidence retention/pruning; user-facing Cleanup UX (config toggles, "Clean workspace now," evidence retention settings).

### Non-Goals

- Deleting or ignoring `.puppet-master/evidence/` by default (evidence remains tracked).
- Changing gitignore to blanket `*.log` or ignoring `.puppet-master/`.

### Target-project DRY (interview-seeded)

Puppet Master uses the DRY method in its own codebase (AGENTS.md). **Target projects** (projects created or managed by Puppet Master) can use the same reuse-first approach: the **interview** can seed the target project's **AGENTS.md** when it generates that file at interview completion. Seeded content includes a **DRY Method** section and a **Technology & version constraints** (or "Stack conventions") section -- e.g. "always use React 18", "always use Pydantic v2" -- born from the interview (especially Architecture & Technology phase) and optionally from convention templates for well-known stacks. That gives all agents working on the target project (during orchestrator runs or later) clear guidelines: check for existing code and docs before adding new, tag reusable items, and keep a single source of truth for config and specs. **Keep generated AGENTS.md minimal:** it is loaded into agent context; long files consume context and get skimmed, so critical rules get missed. The Interview plan §5.1 specifies: critical-first block at top, size budget (~150-200 lines), linked docs for long reference, and two-tier structure. Implementation belongs in the Interview plan and in `agents_md_generator` (or equivalent); see **Plans/interview-subagent-integration.md** §5.1 (AGENTS.md content: DRY Method and minimality). That subsection also lists **gaps and improvements**: config default for `generate_initial_agents_md`, stack parameterization, preserving the DRY section when agents update AGENTS.md, projects created without the full interview, and overwrite vs. merge if AGENTS.md already exists.

---

## 2. Problem Statement


**We should be concerned** about accumulation of agent-left-behind content: documents, tests, evidence, and builds can clutter the workspace and evidence directories if there is no cleanup policy. Agents run in fresh processes per iteration (CU-P2-T12). They can leave behind:

- **Docs:** Extra `.md` files (notes, plans, fragments), sometimes in repo root or `src/`.
- **Tests / scripts:** One-off test files, run scripts, or temporary harnesses.
- **Artifacts:** Build outputs (e.g. `target/` if not already ignored), test output dirs, installers from testing.
- **Temp files:** Editor backups, debug logs, or platform-specific temp dirs created in the workspace.

REQUIREMENTS.md specifies "Clean working directory state (git checkout to last commit)" and a runner contract with `prepare_working_directory` and `cleanup_after_execution`, but these are **not implemented** in `puppet-master-rs`. A plain `git checkout` only resets **tracked** files; **untracked** files remain. Without a cleanup policy and implementation, agent-left-behind content accumulates.

---

## 3. Cleanup Policy

### 3.1 What Must Never Be Removed


- State files: `progress.txt`, `AGENTS.md`, `prd.json`, and other state as defined in STATE_FILES.md.
- `.puppet-master/` in whole **except** where a retention/pruning policy explicitly allows pruning (e.g. old evidence per Section 6).
- Config and discovery: `.puppet-master/config.yaml`, `.puppet-master/capabilities/`, `.puppet-master/plans/`, etc., unless a future "reset config" feature explicitly does so.

### 3.2 What May Be Removed (Policy)


- **Untracked files and directories** under the workspace (or under the worktree when using worktrees), **except** allowlisted paths.
- **Allowlist (do not remove):**
  - `.puppet-master/`
  - `.gitignore` (and any path/pattern needed so cleanup never deletes it -- see §3.6).
  - Sensitive patterns so we never delete credential or key files (see §3.6).
  - Any path listed in config (e.g. `paths.workspace`, explicit "preserve" list if added).
  - When **Plans/newtools.md** custom headless GUI tool is implemented: `.puppet-master/evidence/gui-automation/` (or equivalent evidence path from that plan) so headless tool evidence is never removed.
- **Agent output directory:** `.puppet-master/agent-output/` (or equivalent) can be cleared between runs by policy while still preserving the rest of `.puppet-master/`; see Section 5.

### 3.3 Cleanup Scope


#### 3.3.1 Assistant worktree persistence

Assistant-owned worktrees (identified by `owner_thread_id`) are NOT subject to the runner contract cleanup policy that governs orchestrator-owned worktrees. They are persistent by default.

**Cleanup triggers for assistant worktrees:**
- User clicks Remove in chat header dropdown → confirmation dialog if worktree is dirty
- User deletes thread → cleanup behavior follows `branching.assistant_worktree_cleanup_default` setting: `ask` (show dialog), `keep` (unbind only, keep worktree on disk as manual), `remove` (remove worktree from disk)
- User clicks Remove in Source Control worktree row → confirmation dialog if dirty or thread-bound
- Force-remove via Doctor (orphan cleanup) — only for worktrees with no matching binding and no owner_thread_id

**App uninstall:** Worktree directories under `.puppet-master/worktrees/` are cleaned up by the uninstall process. Branches created in the main repo remain (git data is preserved).

**Completed threads:** When a thread reaches terminal/completed state, its worktree binding remains intact. The user can still merge, create PR, or remove. This allows completed work to be reviewed and integrated at the user's pace.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md


- **Main repo path:** When not using worktrees, cleanup runs in `paths.workspace` (or configured project root).
- **Worktrees, lanes, and attempts:** When execution uses a worktree, lane, or attempt-specific working directory, cleanup runs in that selected path only; it must not clean the main working tree for artifacts owned by another lane, attempt, or worktree.
- **After execution:** `cleanup_after_execution` runs in the same directory the agent used (main repo, lane workspace, attempt workspace, or worktree path).

### 3.4 Cleanup Mechanisms (Choose One or Combine)

- **Option A -- Conservative:** Remove only known temp dirs and known patterns (e.g. `target/` for Rust, a dedicated `.puppet-master/agent-output/`). No broad `git clean`.
- **Option B -- Moderate:** `git clean -fd` (untracked files/dirs) in workspace/worktree, with an exclude list so `.puppet-master/` and allowlisted paths are never touched. Optionally `git clean -fdx` to also remove ignored files (e.g. `target/`), with same excludes.
- **Option C -- Configurable:** Config flag (e.g. `cleanup.untracked: true/false`, `cleanup.ignored: true/false`) driving Option A vs B and whether to remove ignored dirs. Default: conservative.

Recommendation: **Option C** so operators can choose safety vs aggressiveness; default to conservative (Option A or B with only untracked, plus explicit exclude list).

### 3.5 DRY Method: Single source of truth and reuse


The project follows the **DRY Method** (AGENTS.md): reusable code is tagged, and no logic is duplicated. Apply it to cleanup as follows.

- **Single implementation:** All prepare/cleanup logic lives in one module. Runners and call sites **do not** reimplement git clean or allowlist logic; they call into the shared module.
- **Allowlist as data:** Paths and patterns that must never be removed are defined in **one place** (a const, a fn, or a small data type) and used by every cleanup path. No hardcoded exclude lists at call sites.
- **Tagging:** Every new public function, type, or data that is reusable gets a DRY comment:
  - `// DRY:FN:<name>` -- Reusable function (e.g. prepare_working_directory, cleanup_after_execution, run_with_cleanup, run_git_clean_with_excludes).
  - `// DRY:DATA:<name>` -- Single source of truth (e.g. cleanup allowlist / exclude patterns).
  - `// DRY:HELPER:<name>` -- Shared utility used by multiple DRY:FNs if needed.
- **Before adding code:** Check `docs/gui-widget-catalog.md` for any UI; check `src/platforms/platform_specs.rs` for platform data (do not add cleanup-related platform logic there unless it's platform-specific); grep `DRY:` in `src/git/` and `src/cleanup/` to reuse existing helpers.
- **No duplication:** Runners implement the runner contract by **delegating** to the shared cleanup module (e.g. `crate::cleanup::prepare_working_directory(path).await`). The trait can provide default implementations that call the shared module so no runner duplicates logic.
- **Widget catalog:** If any new UI is added (e.g. "Clean workspace" button, cleanup config toggles), check the widget catalog first and use existing widgets; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after changes.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

**Module placement (see §4.7):** New module `src/cleanup/` with the single implementation; allowlist and git-clean helper live there. Declare `pub mod cleanup` in the parent (e.g. `src/lib.rs` or the crate root that declares `mod git`).

### 3.6 Gitignore and security (no secrets to GitHub)

Puppet Master must **respect .gitignore** in all git operations and **never expose secrets** (API keys, tokens, private keys) in commits, logs, evidence, or when pushing to GitHub.

**Respecting .gitignore**

- **Staging (add):** The codebase uses `git add -A` (e.g. `GitManager::add_all`) for tier commits. That command stages all changes and adds untracked files that are **not** ignored by .gitignore. So by default, ignored files are not staged. **Do not introduce `git add -f` (force-add)** anywhere; force-add would allow staging files that are in .gitignore and could commit secrets.
- **Cleanup:** The cleanup allowlist and `run_git_clean_with_excludes` must **exclude** `.gitignore` (and optionally other ignore-file names if used) so we never delete the project's ignore rules. Exclude patterns: see "Sensitive patterns" below.
- **Optional safeguard:** Before committing, optionally check that no staged file matches a "sensitive pattern" (e.g. `.env`, `*.pem`, `*.key`) and abort or warn. This protects against a previously force-added secret or a repo with no .gitignore for that file.

**Sensitive patterns (never remove, never commit, never log)**

- **Cleanup allowlist / git clean excludes:** In addition to `.puppet-master/`, root-level state files `progress.txt`, `AGENTS.md`, `prd.json` (STATE_FILES.md), include patterns so we **never delete**:
  - `.gitignore`
  - `.env`, `.env.*`, `*.env` (environment and secret files)
  - `*.pem`, `*.key`, `*.crt`, `*.p12` (keys and certs)
  - `.ssh/` (or at least never delete the directory; be conservative)
  - Any path listed in a small **DRY:DATA** "sensitive patterns" list (e.g. in the cleanup module) so one place defines what must never be removed or force-added.
- **Commit / stage:** Do not force-add paths that match these patterns. If adding a "pre-commit" or staged-file check, fail or warn when a staged file matches a sensitive pattern.

**No secrets in logs, evidence, or GitHub**

- **Logs:** Do not log token values, API keys, private key contents, or the contents of credential files. `git-actions.log` currently logs action name and details (e.g. commit message). If commit messages ever come from untrusted input or could contain secrets, consider redacting or not logging the message body; at minimum, never log env vars (e.g. `GH_TOKEN`, `GITHUB_TOKEN`) or file paths that point to credential files with their contents.
- **Evidence:** Evidence artifacts (test logs, screenshots, gate reports) must not contain API keys, tokens, or key contents. When capturing command output or writing evidence, strip or redact known secret patterns (e.g. token=..., Authorization: Bearer ...) if that output is ever written to disk or sent elsewhere.
- **Prompts and PR body:** When building prompts for agents or PR title/body for GitHub, do not include environment variables, token values, or file contents that could be secrets. Use placeholders or omit; let the platform CLI use env/auth instead.
- **GitHub (API-only):** The app uses the GitHub HTTPS API for PR creation (no GitHub CLI). Authentication is OAuth device-code by default; tokens live only in the OS credential store at runtime (never in seglog/redb/Tantivy, logs, or evidence). Ensure no code path builds a PR body or title from untrusted input that could contain a secret; keep PR content to tier metadata, file lists, and acceptance criteria only. Canonical: `Plans/GitHub_API_Auth_and_Flows.md`.

**Summary**

- Use only `git add -A` (or explicit paths that are not sensitive); never `git add -f` for paths that could be secrets.
- Extend the cleanup allowlist with `.gitignore` and sensitive patterns; implement in the same DRY:DATA source as other excludes.
- Do not log, commit, or include in evidence or PR content: tokens, keys, or credential file contents.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

---

## 4. Runner Contract Implementation

### 4.1 Trait and Types

- Define (or extend) a runner contract in `puppet-master-rs` that includes:
  - `async fn prepare_working_directory(&self, path: &Path) -> Result<()>`
  - `async fn cleanup_after_execution(&self, pid: u32, work_dir: &Path) -> Result<()>`
- Path may be main workspace or worktree path; callers pass the directory the agent actually used.

### 4.2 prepare_working_directory

- **Ensure path is a valid git repo** (e.g. `git rev-parse --show-toplevel`).
- **Optional:** Reset tracked state: `git checkout -- .` and/or `git restore .` in that path (if product wants a hard reset of tracked files; document clearly).
- **Run workspace cleanup here (not after execution):** This is the only place where broad untracked cleanup (e.g. `git clean -fd` with excludes) or conservative cleanup (known temp/agent-output dirs) should run. Doing it **before** the run removes the *previous* run's cruft; doing it after would remove the current run's output (see §9.1.13). Use the allowlist from Section 3; do **not** remove `.puppet-master/` or state files.

### 4.3 cleanup_after_execution

- **Kill / terminate process** if still running (existing behavior).
- **Clean temp files** created by the runner (e.g. any temp files used for context copy, as in REQUIREMENTS 26.3).
- **Do not run broad "git clean -fd" (untracked) here.** The orchestrator commits tier progress *after* the runner returns; if we removed untracked files here we would delete the agent's new files before they are committed (§9.1.13). Optionally remove only **known build-artifact dirs** (e.g. `target/`) in `work_dir` if config allows, to reclaim space without touching untracked source or docs. Do **not** remove untracked files in the workspace in this step.
- Log cleanup result (e.g. "Runner temp files removed" or "Cleanup skipped: disabled").

### 4.4 Wiring

- **Orchestrator / execution path:** Before spawning an iteration, call `prepare_working_directory(work_dir)`. After the process ends (success or failure), call `cleanup_after_execution(pid, work_dir)`.
- **Platform runners:** Each runner implements the contract; shared logic (e.g. git clean with excludes) can live in a `git` or `cleanup` module so runners don't duplicate code.

### 4.5 Tests

- Unit tests: cleanup helper excludes `.puppet-master/` and allowlisted paths; does not delete state files.
- Integration test (optional): create untracked files and maybe a mock `target/` in a temp repo, run cleanup, assert they are removed and allowlisted paths remain.

### 4.6 Call sites: Orchestrator, Interview, Start chain, and Conversation


All code paths that invoke `runner.execute()` should use prepare and cleanup so agent-left-behind artifacts are managed consistently. The following call sites must be updated unless explicitly marked optional.

| Call site | Location | Working dir source | Update required |
|-----------|----------|--------------------|-----------------|
| **Orchestrator** | `ExecutionEngine::execute_iteration` in `core/execution_engine.rs`; invoked by `orchestrator.rs` (e.g. `execute_iteration(&context)`). | `context.working_dir` (from lane/attempt worktree selection or `config.project.working_directory`). | **Yes.** Call `prepare_working_directory(work_dir)` before building/running the request and `cleanup_after_execution(work_dir)` after `execute` returns (success or failure), for each iteration. This is the main iteration path where cleanup matters most. |
| **Interview (research)** | `interview/research_engine.rs`: `execute_research_ai_call` builds request and calls `runner.execute(&request)`. | Passed in as `working_dir: &Path`. | **Yes.** Call prepare before and cleanup after the execute so research runs don't leave cruft in the project directory. |
| **Start chain** | `start_chain/prd_generator.rs`, `requirements_interviewer.rs`, `architecture_generator.rs`, `multi_pass_generator.rs`: each builds an `ExecutionRequest` with a `working_directory` and calls `runner.execute(&request)`. | Each has its own `working_directory` (e.g. project path). | **Yes.** Use the same prepare/cleanup around each `execute` so PRD/requirements/architecture generation don't accumulate untracked files. |
| **Conversation / wizard** | `app.rs`: `execute_ai_turn` builds request with `working_dir = std::env::current_dir()` and calls `runner.execute(&request)`. | `current_dir()` (process CWD, may not be project root). | **Optional but recommended.** If the conversation runs in a known project path, use that for prepare/cleanup; otherwise use `current_dir()` with the same policy, or skip cleanup when not in a "project" context to avoid cleaning the wrong directory. |

**Implementation options**

- **Option A (per call site):** At each call site, call `runner.prepare_working_directory(&request.working_directory).await?` before `execute`, and `runner.cleanup_after_execution(&request.working_directory).await` after `execute` returns. Ensures every path is explicit but duplicates the prepare/execute/cleanup pattern.
- **Option B (wrapper):** Introduce a single helper (e.g. `run_with_cleanup(runner, request) -> Result<ExecutionResult>`) that does: prepare(work_dir) → execute(request) → cleanup(work_dir), and use it from the orchestrator, execution_engine, interview, start_chain, and (optionally) execute_ai_turn. All call sites then go through the wrapper and get consistent behavior; config (e.g. "skip cleanup for interview") can be applied inside the wrapper.

**Recommendation:** Use **Option B** so prepare/cleanup semantics live in one place and call sites (orchestrator, interviewer, start chain, conversation) are updated to call the wrapper instead of `runner.execute()` directly. The wrapper can read config to skip prepare/cleanup when desired (e.g. for one-off conversation from an arbitrary CWD).

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 4.7 DRY: Module layout, naming, and tagging

**New module: `src/cleanup/`**

- **Purpose:** Single place for workspace prepare/cleanup policy and execution. No duplicate logic in runners or call sites.
- **Files (suggested):**
  - `src/cleanup/mod.rs` -- Module root; re-exports and optional `CleanupConfig` (if config is not in a shared config crate).
  - `src/cleanup/workspace.rs` -- Prepare, cleanup, allowlist, and git-clean invocation. All DRY-tagged items below live here (or in mod.rs if small).
- **Parent declaration:** Add `pub mod cleanup;` where other top-level modules are declared (e.g. alongside `pub mod git;`).

**DRY items to add (tag in code)**

| Tag | Name | Location | Description |
|-----|------|----------|-------------|
| DRY:DATA | `CLEANUP_EXCLUDE_PATTERNS` or `cleanup_allowlist()` | `cleanup/workspace.rs` | Single source of paths/patterns to never remove: `.puppet-master`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, and sensitive patterns (`.env`, `.env.*`, `*.pem`, `*.key`, etc.) per §3.6. Used by git-clean helper (in prepare only) and any conservative cleanup. |
| DRY:FN | `prepare_working_directory` | `cleanup/workspace.rs` | Ensures path is a git repo (or skips git steps if not); optionally runs conservative clean. Called by wrapper or runners. |
| DRY:FN | `cleanup_after_execution` | `cleanup/workspace.rs` | Terminates process if needed; cleans **runner temp files** only (e.g. context copy temp). **Does not** run broad git clean (untracked) -- that runs only in prepare_working_directory (§9.1.13). Optionally removes known build-artifact dirs (e.g. `target/`) per config. Takes `work_dir` and optional config. |
| DRY:FN | `run_git_clean_with_excludes` | `cleanup/workspace.rs` | Builds and runs `git clean -fd` (or `-fdx` when configured) with `-e` exclude patterns from the allowlist. Single implementation for all callers. |
| DRY:FN | `run_with_cleanup` | `core/` or `cleanup/` | Wrapper: prepare(work_dir) → runner.execute(request) → cleanup(work_dir). All call sites (orchestrator, interview, start_chain, execute_ai_turn) use this instead of calling `runner.execute()` directly. |

**Runner contract and DRY**

- **Trait:** `PlatformRunner` gains `prepare_working_directory` and `cleanup_after_execution` (or the contract extends to include them). **Default implementations** call `crate::cleanup::prepare_working_directory(path).await` and `crate::cleanup::cleanup_after_execution(work_dir).await` so platform runners do not duplicate logic; they can override only if a platform needs special behavior.
- **Wrapper:** `run_with_cleanup` reads config (e.g. skip prepare/cleanup for conversation or when disabled), then calls the shared prepare and cleanup functions and the runner's `execute`. No per-call-site prepare/cleanup code.

**Exact git clean invocation (single helper)**

- **DRY:FN:run_git_clean_with_excludes(** `work_dir`**,** `clean_untracked: bool`**,** `clean_ignored: bool` **)**  
  - **Single source for patterns:** Does **not** take an allowlist parameter; reads from `cleanup_exclude_patterns()` (or `CLEANUP_EXCLUDE_PATTERNS`) in the same module so no caller can pass a different list (DRY).  
  - Runs `git clean -fd` when only untracked; `git clean -fdx` when ignored too. Passes `-e <pattern>` for each entry from the allowlist so `.puppet-master`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, and sensitive patterns are never removed.  
  - Document the exact patterns in the function (or in the constant) so §9.1.2 and §9.1.6 are satisfied in one place.  
  - **Use shared git binary:** Resolve the `git` executable via the same helper as GitManager/Doctor (e.g. `path_utils::resolve_executable("git")` until Worktree plan adds `resolve_git_executable()`) so cleanup works when git is in a custom or app-local path. Do not assume `Command::new("git")` is sufficient.

**Pre-implementation checklist (DRY)**

- [ ] Grep `DRY:` in `src/git/` and `src/core/` to see if any existing helper can be reused (e.g. git_manager for status; no existing workspace-clean helper expected).
- [ ] Confirm `src/cleanup/` is the right place per AGENTS.md module responsibilities (cleanup is not purely "git operations"; it's workspace hygiene, so a dedicated module is appropriate).
- [ ] After adding code: tag every new public function/data with the correct DRY comment; add no duplicate allowlist or git-clean logic elsewhere.

### 4.8 Concrete implementation details

The following gives implementers exact signatures, data, and step-by-step logic so the DRY module can be built without ambiguity.

**Allowlist (DRY:DATA) -- single source of truth**

- **Name and location:** In `src/cleanup/workspace.rs`, define a single constant or function that returns the exclude patterns used by `run_git_clean_with_excludes` and by any "sensitive path" check. Recommended: `pub fn cleanup_exclude_patterns() -> &'static [&'static str]` or `const CLEANUP_EXCLUDE_PATTERNS: &[&str]`.
- **Exact patterns (gitignore-style; one entry per `-e`):**  
  `.puppet-master`, `.puppet-master/*`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, `.env`, `.env.*`, `*.env`, `*.pem`, `*.key`, `*.crt`, `*.p12`, `.ssh`, `.ssh/*`.  
  Git clean `-e` accepts one pattern per flag; multiple `-e` flags are allowed. Use patterns that match paths relative to `work_dir` (gitignore semantics). Ensure `.puppet-master` and state files are never removed; document in the same module that this list is the single source for both cleanup and (if added) pre-commit sensitive-file checks.
- **Sensitive patterns subset:** Optionally split into `cleanup_exclude_patterns()` (all) and `sensitive_patterns()` (subset for staging checks); both in same file, no duplication of literal strings -- e.g. `sensitive_patterns()` returns a slice of the same literals used in the full list.

**DRY:FN:run_git_clean_with_excludes**

- **Signature:** `pub async fn run_git_clean_with_excludes(work_dir: &Path, clean_untracked: bool, clean_ignored: bool) -> Result<()>`.
- **DRY REQUIREMENT:** Tag with `// DRY:FN:run_git_clean_with_excludes`. MUST use `cleanup_exclude_patterns()` from the same module -- DO NOT accept allowlist as parameter or hardcode exclude patterns. MUST use shared git binary resolution (e.g. `path_utils::resolve_executable("git")` or `resolve_git_executable()` from Worktree plan) -- DO NOT hardcode `Command::new("git")`.
- **Behavior:** If `clean_untracked` is false, return `Ok(())` without running git. Otherwise run `git clean -fd` (or `-fdx` if `clean_ignored`). Resolve the git binary via the same helper used by GitManager/Doctor (e.g. `crate::platforms::path_utils::resolve_executable("git")` until Worktree plan adds `resolve_git_executable()`; then switch to that). Build the command with one `-e <pattern>` per entry from `cleanup_exclude_patterns()`. Set `Command::current_dir(work_dir)`. Do not assume `Command::new("git")` is sufficient.
- **Callers:** Only `prepare_working_directory` (and the manual "Clean workspace" action) call this; `cleanup_after_execution` does not.

**DRY:FN:prepare_working_directory**

- **Signature:** `pub async fn prepare_working_directory(work_dir: &Path, config: &CleanupConfig) -> Result<()>` (or take config from a shared app config if preferred).
- **DRY REQUIREMENT:** Tag with `// DRY:FN:prepare_working_directory`. MUST call `run_git_clean_with_excludes()` for git clean operations -- DO NOT duplicate git clean logic. MUST use `cleanup_exclude_patterns()` for allowlist -- DO NOT hardcode exclude patterns.
- **Step-by-step:**
  1. **Git check:** Run `git rev-parse --show-toplevel` with `current_dir(work_dir)`. If the command fails (non-repo or git not found), **do not fail the iteration**: log a warning (e.g. "Prepare: not a git repo or git unavailable, skipping git clean") and return `Ok(())`. Optionally run only non-git cleanup (e.g. clear agent-output dir per config) if implemented. This resolves §9.1.3 and §9.1.10 (best-effort; continue without prepare).
  2. **Optional tracked reset:** Do **not** run `git checkout -- .` or `git restore .` unless a future config flag is added and documented; see §9.1.4. For now, prepare only cleans **untracked** (and optionally ignored) files.
  3. **Untracked cleanup:** If config says run untracked cleanup (e.g. `cleanup.untracked == true`), call `run_git_clean_with_excludes(work_dir, true, config.clean_ignored)`.
  4. **Agent-output dir (optional):** If Section 5 is implemented and config says clear agent-output, delete contents of `.puppet-master/agent-output/` (or the path from DRY:DATA constant) but do not remove the directory itself.
  5. Log "Prepare completed" or "Prepare skipped (not a git repo)" as appropriate.

**DRY:FN:cleanup_after_execution**

- **Signature:** `pub async fn cleanup_after_execution(pid: u32, work_dir: &Path, config: &CleanupConfig) -> Result<()>`.
- **DRY REQUIREMENT:** Tag with `// DRY:FN:cleanup_after_execution`. MUST use `cleanup_exclude_patterns()` for any path checks -- DO NOT hardcode exclude patterns. MUST use shared git binary resolution if git operations are needed -- DO NOT hardcode `Command::new("git")`.
- **Step-by-step:**
  1. **Terminate process:** If `pid > 0`, attempt to terminate the process (e.g. `kill(pid, SIGTERM)` or platform equivalent); do not block indefinitely; log if termination fails.
  2. **Runner temp files:** Remove any temp files or dirs that the **runner** created for this execution (e.g. context copy temp dir). This requires the runner (or a shared base) to record the temp path(s) so cleanup can remove them; if no such path is stored, this step is a no-op for now. Do **not** run `run_git_clean_with_excludes` here.
  3. **Optional build-artifact dirs:** If config allows (e.g. `cleanup.remove_build_artifacts: true`), remove only known dirs such as `work_dir.join("target")` (Rust). Do not remove untracked source or docs.
  4. Log "Cleanup completed (runner temp removed)" or similar.

**DRY:FN:run_with_cleanup**

- **Placement:** Prefer `src/core/run_with_cleanup.rs` (or a helper in `src/core/execution_engine.rs`) so the execution engine can call it; alternatively `src/cleanup/run_with_cleanup.rs` if the wrapper is considered part of cleanup. Document the choice in AGENTS.md.
- **Signature:** `pub async fn run_with_cleanup<R: PlatformRunner>(runner: &R, request: &ExecutionRequest, config: &CleanupConfig) -> Result<ExecutionResult>`. Alternatively, accept an `Option<&CleanupConfig>` and skip prepare/cleanup when `None` or when config says skip (e.g. for conversation from arbitrary CWD).
- **DRY REQUIREMENT:** Tag with `// DRY:FN:run_with_cleanup`. MUST call `prepare_working_directory()` and `cleanup_after_execution()` from the cleanup module -- DO NOT duplicate prepare/cleanup logic. This wrapper ensures all call sites get consistent behavior.
- **Logic:** (1) If config says skip prepare for this context, skip to step 2. (2) Call `crate::cleanup::prepare_working_directory(&request.working_directory, config).await`; on error, log and continue (per §9.1.10: best-effort). (3) Call `runner.execute(request).await` and capture result. (4) Call `crate::cleanup::cleanup_after_execution(0, &request.working_directory, config).await` (pid may be 0 if not tracked). (5) Return execution result.
- **Call sites (concrete):**
  - **ExecutionEngine:** In `execute_iteration`, wrap `runner.execute(request).await` with `run_with_cleanup(&*runner, request, &cleanup_config).await`. The cleanup_config must be obtained from the same run config as the orchestrator (e.g. from `IterationContext` or from a shared config handle). ExecutionEngine currently has no access to config; add a way to pass cleanup config into ExecutionEngine (e.g. at construction or per execute_iteration). *(Note: `execute_with_sdk_fallback` has been removed — execution is always CLI via `runner.execute()`.)*
  - **research_engine.rs:** In `execute_research_ai_call`, wrap the existing `runner.execute(&request).await` in a call to `run_with_cleanup` so prepare runs before and cleanup after.
  - **start_chain (prd_generator, requirements_interviewer, architecture_generator, multi_pass_generator):** Each currently does `runner.execute(&request).await`; replace with `run_with_cleanup(runner, &request, &config).await`. Obtain config from the same place the start_chain gets its run config.
  - **app.rs execute_ai_turn:** Optionally use `run_with_cleanup` when `working_dir` is a known project path; otherwise call `runner.execute(&request).await` and skip prepare/cleanup to avoid cleaning the wrong directory.

**Runner contract and config**

- **Trait:** Do **not** add `prepare_working_directory` or `cleanup_after_execution` to `PlatformRunner`; all call sites use `run_with_cleanup`, so the wrapper is the only entry point. Runners keep only `execute`. This avoids every runner needing to know about cleanup and keeps the contract minimal.
- **CleanupConfig:** Introduce a struct (e.g. in `src/cleanup/mod.rs` or in the same config module as run config) with fields: `untracked: bool`, `clean_ignored: bool`, `clear_agent_output: bool`, `remove_build_artifacts: bool`, and optionally `skip_prepare_for_conversation: bool`. Populate from the same config shape that the run uses (Option B: build from gui_config at run start; add `cleanup: { untracked, clean_ignored, ... }` to that shape).

**Git binary resolution**

- Use `crate::platforms::path_utils::resolve_executable("git")` until Worktree plan Phase 3 adds a dedicated `resolve_git_executable()`; then switch to that in `run_git_clean_with_excludes` so a single helper is used everywhere (DRY).

---

## 5. Agent Output Directory

### 5.1 Purpose

- Give agents a single, well-defined place to write one-off docs, scratch plans, or debug output.
- Makes it easy to clear "agent scratch" without touching the rest of the repo or evidence.

### 5.2 Design

- **Directory:** `.puppet-master/agent-output/` (or configurable path under `.puppet-master/`). Define the default path in **one place** (e.g. a constant in the cleanup module, **DRY:DATA**) so cleanup and docs reference the same value.
- **Subdirs (optional):** e.g. `agent-output/run-<session_id>/` so each run has a folder; cleanup can delete run-specific dirs older than N days, or delete all contents between runs.
- **Prompts / AGENTS.md:** Document that agents should write disposable/scratch files only under this directory when possible. Not enforced by tooling; best-effort.

### 5.3 Cleanup

- **When:** Clear only in **prepare_working_directory** (before the run), not in cleanup_after_execution, so agent output from the current run is not deleted before commit. Per config (e.g. `cleanup.clear_agent_output: true`).
- **How:** In `prepare_working_directory`, after git clean (if any), if config says clear agent-output: list contents of `agent_output_dir()` (DRY:DATA path); remove each file and subdir; do not remove the directory itself so agents can write there immediately.
- **Concrete:** Define `pub const AGENT_OUTPUT_SUBDIR: &str = "agent-output"` and `pub fn agent_output_dir(base: &Path) -> PathBuf { base.join(".puppet-master").join(AGENT_OUTPUT_SUBDIR) }` in the cleanup module (DRY:DATA). Use the same base (e.g. work_dir or project root) as the rest of prepare so one place defines the path.

### 5.4 Docs

- STATE_FILES.md: add `.puppet-master/agent-output/` to the state hierarchy with a one-line purpose (scratch area for agent-generated files; may be cleared between runs).
- AGENTS.md: add a short bullet that disposable docs/scratch should go under `.puppet-master/agent-output/` when possible.

---

## 6. Evidence Retention & Pruning


Implementation should align with storage-plan.md: evidence lifecycle events in seglog; retention policy and pruning metadata (or indexes) in redb where useful for fast queries.

### 6.1 Purpose

- Avoid unbounded growth of `.puppet-master/evidence/` (test-logs, screenshots, gate-reports, etc.) on long-lived projects.

### 6.2 Policy

- **Retention:** Keep evidence for the last N days, or last M runs per node/lane/attempt lineage, or keep all (configurable).
- **Pruning:** A scheduled or manual job removes evidence older than the retention window. Do not remove evidence for the current run or recent runs still in progress.

### 6.3 Implementation

- **Config schema:** Add to run config (or GuiConfig-derived): `evidence.retention_days: Option<u32>` (None = retain all), `evidence.retain_last_runs: Option<u32>` (None = unused; if set, prefer defining "run" as one iteration or one subtask completion -- see §9.1.7), `evidence.prune_on_cleanup: bool` (run pruning when manual "Clean workspace" or after prepare, not in the hot path of cleanup_after_execution).
- **Concrete function:** `pub async fn prune_evidence_older_than(base_dir: &Path, config: &EvidenceRetentionConfig) -> Result<PruneResult>` in cleanup module (DRY:FN). List `.puppet-master/evidence/` recursively; for each file/dir, check mtime; if older than `retention_days` days (or if using retain_last_runs, sort by mtime and keep only the newest N "runs" -- define run as e.g. one evidence subdir or one timestamped file set), delete. Return count of removed items. Do not block the main iteration path; call from manual action or a background task.
- **Safety:** Never delete evidence for runs that are still referenced in the current prd.json or progress.txt if that's feasible; otherwise rely on retention_days only until "run" is well-defined (§9.1.7).

### 6.4 Docs

- STATE_FILES.md: document retention and that evidence may be pruned; point to config.
- AGENTS.md: note that evidence can be pruned; agents should not rely on very old evidence paths.

---

## 7. Cleanup UX & Config

Cleanup UX is required: it gives users control over workspace cleanup and evidence retention. It includes: Config → Advanced → "Workspace / Cleanup" (toggles for clean untracked, clean ignored, clear agent-output, remove build artifacts, evidence retention); "Clean workspace now" in Doctor or Advanced (resolve project path, run prepare-style cleanup with confirmation and optional dry-run); optional "Clean all worktrees"; widgets from gui-widget-catalog (styled_button, confirm_modal, toggler). See feature-list.md and newfeatures.md for alignment.

### 7.1 Config Toggles (GUI or YAML)

- **cleanup.untracked:** Run `git clean -fd` (with excludes) in work dir **before each run** (in `prepare_working_directory` only; not after execution -- see §9.1.13) (default: true if implementing Option C).
- **cleanup.ignored:** When cleaning before run, include ignored files, e.g. `git clean -fdx` (default: false).
- **cleanup.clear_agent_output:** Clear `.puppet-master/agent-output/` in prepare (default: true if Section 5 implemented).
- **cleanup.remove_build_artifacts:** In cleanup_after_execution, remove known build dirs (e.g. `target/`) only; default false.
- **evidence.retention_days / evidence.retain_last_runs:** See Section 6 (default: retain all if Section 6 not implemented).

**Config schema (concrete, DRY):** Add a single struct used at run time; do not duplicate cleanup fields in multiple shapes. Recommended: extend the config shape built from GuiConfig at run start (Option B, Worktree plan §5) with a nested `cleanup` and `evidence` block. Example (conceptual):

```yaml
# In the run config (built from GUI or file):
cleanup:
  untracked: true
  clean_ignored: false
  clear_agent_output: true
  remove_build_artifacts: false
evidence:
  retention_days: null   # null = retain all
  retain_last_runs: null
  prune_on_cleanup: false
```

Rust: `CleanupConfig { untracked: bool, clean_ignored: bool, clear_agent_output: bool, remove_build_artifacts: bool }` and optionally `skip_prepare_for_conversation: bool`. Populate from the same place as `enable_parallel`, `branching.base_branch`, etc., so one code path builds the run config and cleanup is included.

### 7.2 Manual "Prune" / "Clean Workspace" Action


- **Doctor or Config page:** Button or command: "Clean workspace now" that:
  - Runs the same **untracked cleanup** as `prepare_working_directory` (e.g. `run_git_clean_with_excludes` with allowlist) in the current workspace (and optionally in all active worktrees). This is **not** the same as `cleanup_after_execution`, which only clears runner temp files; the manual action is for removing agent-left-behind cruft, so it uses the prepare-style broad clean with excludes.
  - Optionally runs evidence pruning (Section 6) if enabled.
- **Confirmation:** For "clean ignored" or "prune evidence", show a short confirmation (e.g. "Remove untracked and ignored files in workspace?") to avoid accidents.

### 7.3 Tooltips / Docs

- Tooltip for "Clean workspace": "Removes agent-left-behind untracked files and optional temp dirs; does not remove .puppet-master/ or state files."
- Document cleanup policy in AGENTS.md and in user-facing docs (e.g. README or docs folder).

### 7.4 DRY for cleanup UX

- **Config:** Cleanup and evidence config (cleanup.untracked, cleanup.ignored, cleanup.clear_agent_output, evidence.retention_days, etc.) live in the **same** config schema and file as the rest of the app (e.g. `PuppetMasterConfig` / discovery). Do not introduce a separate cleanup-only config shape; add fields to the existing config so there is a single source of truth (see WorktreeGitImprovement.md for config wiring).
- **UI:** Use existing widgets from `docs/gui-widget-catalog.md`: e.g. `styled_button` for "Clean workspace", `confirm_modal` for confirmation, `page_header` / `refresh_button` if the action lives on Config or Doctor. Check the catalog before adding new components; run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after any widget changes.

### 7.5 GUI gaps and updates (consolidated)

The Config view remains an **8-tab** surface. Cleanup and evidence controls must live inside the existing **Advanced** tab instead of creating a cleanup-only tab; Doctor is a separate view. The following GUI updates are required or recommended so cleanup, evidence, and related behavior are visible and wired.

**Where to put cleanup and evidence UI**

- **Option A (recommended):** Add a **"Workspace" or "Cleanup" subsection** inside the **Advanced** tab. Advanced already has Execution, Checkpointing, Loop Guard, Network; add a collapsible section "Workspace / Cleanup" with toggles and the optional "Clean workspace now" action. No new tab; keeps Config tab count at 8. **GuiConfig** would gain `advanced.cleanup` (or a top-level `cleanup` block if preferred for YAML clarity) and `advanced.evidence` (or top-level `evidence`).
- **Option B:** Add a **ninth tab "Workspace"** (or "Cleanup") for cleanup and evidence only. More visible but increases tab count; consider only if Advanced becomes too crowded.
- **Recommendation:** Use Option A: add `CleanupGuiConfig` and `EvidenceRetentionGuiConfig` (or nest under `AdvancedConfig` as `advanced.cleanup` and `advanced.evidence`). When building run config from GuiConfig (Option B in Worktree §5), map these into `CleanupConfig` and evidence retention config so the run sees them.

**Concrete GUI elements to add**

| Element | Location | Purpose |
|--------|----------|---------|
| **Clean untracked before run** | Advanced → Workspace / Cleanup | Toggle: run `git clean -fd` with excludes in prepare_working_directory (default: true). Tooltip: "Remove untracked files in workspace before each iteration; .puppet-master and state files are never removed." |
| **Clean ignored files** | Same subsection | Toggle: include ignored files when cleaning (e.g. `git clean -fdx`); default false. Tooltip: "Also remove ignored files (e.g. target/); use with care." |
| **Clear agent-output dir** | Same | Toggle: clear `.puppet-master/agent-output/` in prepare when Section 5 is implemented (default: true). |
| **Remove build artifacts after run** | Same | Toggle: in cleanup_after_execution, remove known build dirs (e.g. target/) only; default false. |
| **Evidence retention (days)** | Same or separate "Evidence" subsection | Number input or "Retain all"; maps to evidence.retention_days. Optional: "Prune on manual clean" checkbox. |
| **"Clean workspace now" button** | **Doctor** (preferred) or Advanced | Runs prepare-style untracked cleanup (run_git_clean_with_excludes) for current project. Requires **project context**: use same project path as run (e.g. current project from Dashboard or config path). Confirmation modal; optional "Preview" (dry-run) that runs `git clean -fd -n` and shows list. If Doctor: add under a "Workspace" or "Git" category; if Config: under Advanced → Workspace. |
| **"Clean all worktrees"** | Same as above (optional) | When worktrees are in use, offer "Clean current only" vs "Clean all active worktrees"; requires worktree list from worktree_manager (§9.1.8). |

**Project context for Doctor and Clean workspace**

- **Gap:** Doctor checks today may not receive the "active project" path; "Clean workspace now" must run in the **project directory** the user intends (e.g. selected project in Dashboard or the directory of the loaded config). Worktree plan §7.2 and §7.3: when running Doctor or starting a run, pass `current_project.path` or config hint so operations use the correct directory. Implement: when the user clicks "Clean workspace now" from Doctor (or Config), resolve project root from the same source as the run (e.g. `discover_config_path(Some(hint))` then parent dir, or `gui_config.project.working_directory`). Do not use `std::env::current_dir()` unless it is the intended project.

**Cross-plan GUI alignment**

- **Worktree plan:** Branching tab (Enable Git, Auto PR, Branch strategy) and Advanced (Enable parallel execution) are wired via Option B. Cleanup and evidence toggles must be **added to the same GuiConfig and Option B run-config build** so one save persists all; no separate "cleanup config file."
- **Orchestrator plan:** Config has plan-mode and subagent UI (global plan-mode control for phase/task/subtask/iteration, optional "Enable plan mode for all tiers," Subagents section). Ensure cleanup subsection does not conflict with existing Advanced layout; use a clearly labeled "Workspace / Cleanup" block.
- **Interview plan:** Interview tab has its own GUI gaps (min/max questions, generate_initial_agents_md, etc.); see Interview plan §GUI gaps. No overlap with cleanup UI.
- **Providers surface alignment:** the Agent-Config or Settings `Providers` section includes boot-time model refresh indicator state plus a manual refresh action so provider readiness is visible without turning cleanup into a provider configuration surface.
- **Orchestrator and Source Control alignment:** GUI cleanup/worktree visibility must cover work package and feature seam objects, seam-level acceptance and weak-integration review, per-project `/project-summary` aggregation, project-local orchestration state, worktree `/controls`, panel-size limits, `/filtering` between orchestrator-owned and non-orchestrator worktrees, and scale-safe partitioning without collapsing all cleanup state into one global pool.
- **Source Control grouping:** terminal widget IDs and `/hostability` must be normalized before Orchestrator-owned worktree state is grouped in Source Control; source-control lane binding and historical lineage preservation are correctness requirements, not nice-to-have polish.

**Potential issues and improvements**

- **Discoverability:** If cleanup lives only in Advanced, some users may miss it. Add a one-line mention in Doctor: "Workspace cleanup runs before each iteration when enabled in Config → Advanced → Workspace."
- **Dry-run UX:** For "Clean workspace now," a "Preview" button could show a scrollable list of paths that would be removed (from `git clean -fd -n`); then "Confirm" runs the real clean. Requires parsing `git clean -n` output and showing in a modal or secondary view.
- **State after clean:** After "Clean workspace now," the UI could show a toast: "Cleaned N files/dirs" or "Nothing to clean." Improves feedback.
- **Missing project context:** When Doctor (or Config) has no project selected and no config path, "Clean workspace now" should be **disabled** with tooltip "Select a project or open a config to clean." Otherwise we might run clean in CWD or an wrong directory. Resolve project path from the same source as the run (current project, config path, or explicit selection).

### 7.6 Leveraging platform CLI capabilities (hooks, skills, plugins, extensions)

Provider integrations (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) support **hooks**, **skills**, **plugins**, **extensions**, and **MCP servers**. These can complement (not replace) Puppet Master's own prepare/cleanup and orchestration.

**Current stance**

- **Prepare and cleanup:** Puppet Master implements prepare_working_directory and cleanup_after_execution **internally** and invokes them via `run_with_cleanup` before/after each `runner.execute()`. Puppet Master does **not** rely on platform-specific hooks or scripts to perform workspace cleanup, so behavior is consistent across all supported providers and does not require the user to install or configure per-provider hooks.
- **Subagents and plan mode:** Subagent names and plan-mode flags are passed in the **prompt or CLI args** (per platform_specs and runners). Puppet Master does not require Cursor plugins or Claude hooks to define subagents; the orchestrator and interview plans define how Puppet Master invokes each platform.
- **Provider bootstrap/trust status:** `/bootstrap` copy for Cursor trust must preserve the title `Workspace trust required` and the subtext `Cursor CLI is signed in, but this workspace must be trusted before all tools and MCP servers are available`.

**Ways we might leverage CLI capabilities (optional / future)**

- **Pre-iteration hook (platform-side):** Some CLIs support a "before run" or "session start" hook. We could **document** an optional user-provided hook that runs `git clean -fd -e .puppet-master ...` in the project dir as a **backup** or for platforms we don't control (e.g. when the user runs the CLI manually). Not a replacement for our prepare_working_directory; document in AGENTS.md or user docs as "Optional: if you run the CLI outside Puppet Master, you can add a hook to clean the workspace."
- **Skills for context:** Orchestrator and Interview plans already reference platform **skills** (e.g. `.cursor/skills/`, `.codex/skills/`) for subagent-specific context. We could add a **Puppet Master-authored skill** (e.g. "puppet-master-clean-workspace" or "puppet-master-context") that agents can load when running under Puppet Master, reminding them to write scratch files under `.puppet-master/agent-output/` and to avoid leaving untracked cruft. Implement as a SKILL.md in the project or in a shared location; no change to our cleanup code.
- **Plugins / extensions:** Cursor plugins and Claude/Gemini extensions can add MCP servers, subagents, and hooks. We do not **require** any plugin for core cleanup or orchestration. If a **project** wants to use a platform plugin (e.g. a custom subagent definition), that is project-specific; our runners stay CLI-arg and prompt based. Document in platform_specs or AGENTS.md which platforms support plugins and that we do not depend on them for prepare/cleanup.
- **MCP:** We use MCP for Context7 and other tooling; platform CLIs can also connect to MCP servers. Cleanup and evidence are **not** exposed as MCP tools; they remain internal to Puppet Master. Future: optional MCP tool "clean_workspace" for external orchestration could call our run_git_clean_with_excludes, but that is out of scope for the current plan.

**Summary**

- Puppet Master implements prepare/cleanup internally; does not depend on platform hooks or plugins for workspace cleanup.
- Optionally document or provide a skill/README that tells agents to use `.puppet-master/agent-output/` and to avoid leaving untracked files.
- For full platform capabilities (hooks, plugins, skills, subagent definitions), see **Plans/orchestrator-subagent-integration.md** "Platform-Specific Capabilities & Extensions"; keep platform_specs and AGENTS.md aligned with CLI release notes.

### 7.7 Desktop Shortcuts (GUI screen)

A dedicated **GUI screen** is required to allow users to **change and customize desktop (keyboard) shortcuts** used by the application. This applies to in-app text input and composer behavior (e.g. prompt fields, chat input, any focusable text areas).

**Placement (exact UI location):** Add as a subsection under **Config**: either **Config → Advanced → Shortcuts** or a dedicated **Config → Shortcuts** tab (single canonical location; implementation chooses one). If the app has a **Settings / Preferences** area, Shortcuts may live there instead, but must be reachable from the same config surface as the rest of GuiConfig (Option B). Use existing widgets from `docs/gui-widget-catalog.md` (e.g. `styled_button`, `styled_text_input`, `page_header`); ensure shortcut keys are displayed with `selectable_label` or `selectable_label_mono` so users can copy them.

**Default shortcuts (single source of truth):** The following table defines the default bindings. The GUI must allow viewing and overriding each action's shortcut; persisted overrides live in config (e.g. `GuiConfig.shortcuts` or `~/.config/puppet-master/shortcuts.yaml`).

| Shortcut   | Action |
|------------|--------|
| `Ctrl+A`   | Move to start of current line |
| `Ctrl+E`   | Move to end of current line |
| `Ctrl+B`   | Move cursor back one character |
| `Ctrl+F`   | Move cursor forward one character |
| `Alt+B`    | Move cursor back one word |
| `Alt+F`    | Move cursor forward one word |
| `Ctrl+D`   | Delete character under cursor |
| `Ctrl+K`   | Kill to end of line |
| `Ctrl+U`   | Kill to start of line |
| `Ctrl+W`   | Kill previous word |
| `Alt+D`    | Kill next word |
| `Ctrl+T`   | Transpose characters |
| `Ctrl+G`   | Cancel popovers / abort running response |

**GUI behavior:**

- **List view:** Show each action with its current shortcut (default or user override). Use a table or list; actions and shortcuts should be selectable/copyable.
- **Edit:** "Change" or double-click opens an edit flow: user presses the new key combination; app records it and validates (no duplicate bindings for the same action; optionally warn on conflicts with system or other app shortcuts).
- **Reset:** Per-action "Reset to default" and optionally "Reset all to defaults."
- **Persistence:** Save to the same config surface as the rest of Config (Option B in Worktree §5); no separate shortcuts file unless design explicitly prefers one.
- **DRY:** Define default shortcuts in one place (e.g. `DRY:DATA:default_shortcuts` in `src/config/` or `src/gui/shortcuts.rs`); GUI and key-handling code both read from that source.

**Acceptance criteria (Shortcuts screen):**

- User can open **Config → Shortcuts** (or Config → Advanced → Shortcuts) and see a list of all actions and their current bindings.
- User can change a binding via "Change" or double-click; after recording a new key combo, binding updates and persists; if the key is already bound to another action, show error (see §7.11) and do not save.
- User can reset one action to default or reset all to defaults; persisted overrides are updated and key map is rebuilt.
- Shortcut list reflects the same key map used by Puppet Master (composer, prompt fields); changes take effect immediately after save.

**Data flow:**

- **Config field:** `GuiConfig.shortcuts` (or `keyboard_shortcuts`): map from action id (e.g. `MoveToLineStart`) to `KeyBinding`; only overrides stored; missing key = use default.
- **Key map rebuild:** When user saves a change (edit or reset), update `GuiConfig.shortcuts`, persist config, then call `build_key_map(default_shortcuts(), gui_config.shortcuts)` and store result in app state; all key handling uses this map until next change.

**Error handling:**

- **Duplicate binding (key already used by another action):** Reject with tooltip/toast "Already used by &lt;ActionName&gt;" per §7.11; do not update config.
- **Config load failure (corrupted shortcuts):** Fall back to defaults and show toast per §7.11; see §8.8 for checklist.

**Implementation notes:**

- Key handling in the GUI layer (Slint) must route key events using the configured shortcuts, not hardcoded bindings. On load, load overrides from config and merge with defaults.
- Accessibility: ensure shortcut list is keyboard-navigable and that the "record new shortcut" flow is clearly announced (e.g. "Press the new key combination").
- If the app supports multiple platforms (e.g. macOS), display and store shortcuts in a platform-appropriate form (e.g. Cmd vs Ctrl); the table above uses Ctrl/Alt as the default (Linux/Windows); document or map for macOS (Cmd, Option) in the same DRY data source.

**Checklist (for implementation):**

- [ ] Add `shortcuts` (or `keyboard_shortcuts`) to `GuiConfig` and run config projection.
- [ ] Add DRY:DATA for default shortcut table; use it in both GUI and key-event handling.
- [ ] Add Shortcuts subsection/tab under Config (or Settings); list all actions and current bindings; edit + reset.
- [ ] Persist overrides and load them when building the key map for the app.
- [ ] Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after any new widgets.

### 7.8 Agent Skills (GUI)

A **GUI screen** is required to let users **manage Agent Skills**: discover, list, add, edit, remove, and configure permissions for skills that agents can load. Skills are reusable instruction sets defined as `SKILL.md` files in folders; discovery follows project and global paths compatible with OpenCode and platform CLIs (Cursor, Codex, Claude, etc.). See [OpenCode Agent Skills](https://opencode.ai/docs/skills/) for the canonical model (frontmatter, discovery, permissions).

**Placement:** Add under **Config** (e.g. **Advanced** tab → "Skills" or a dedicated **Skills** tab), or under **Settings**. Use widgets from `docs/gui-widget-catalog.md` (e.g. `page_header`, `styled_button`, `selectable_label` / `selectable_label_mono` for skill names and paths).

**Skill model (aligned with OpenCode baseline per `Plans/OpenCode_Deep_Extraction.md` §7F):**

- **One folder per skill**, with a `SKILL.md` inside. Recognized fields in frontmatter: `name` (required), `description` (required), `license`, `compatibility`, `metadata` (optional map).
- **Discovery paths** (single source of truth in backend, §7.10):
  - Project: `.puppet-master/skills/<name>/SKILL.md`, `.claude/skills/<name>/SKILL.md`, `.agents/skills/<name>/SKILL.md` (walk up from cwd to git worktree).
  - Global: `~/.config/puppet-master/skills/<name>/SKILL.md`, `~/.claude/skills/<name>/SKILL.md`, `~/.agents/skills/<name>/SKILL.md`.
- **Name validation (OpenCode-aligned):** Regex `^[a-z0-9]+(-[a-z0-9]+)*$`, 1-64 chars, no leading/trailing `-`, no consecutive `--`; MUST match directory name. **Description:** 1-1024 chars.

**Permissions integration:**

- Skills are **permission-gated** using the `permission.skill` key in `Plans/Permissions_System.md` §5. The `skill` permission key supports per-skill patterns (e.g., `{ "my-skill": "allow", "internal-*": "deny", "*": "allow" }`).
- **Per-Persona overrides:** A Persona's `default_skill_refs` (`Plans/Personas.md` §3.2) lists skill IDs to auto-load. Per-Persona permission profiles (`Plans/Permissions_System.md` §2.4, priority 3) may further restrict or allow specific skills.
- **Disabling skill tool per Persona:** A Persona MAY set the `skill` permission key to `deny` in its permission profile to disable skill loading entirely for runs using that Persona.
- **Skills in tool description:** Skills are listed in the `skill` tool description with `<available_skills>` XML blocks containing name and description. The agent invokes a skill via `skill({ name })` which loads the skill's content on demand. Skills are also registered as invokable commands (so `/skillname` works from the command palette).
- Skill directories are automatically added to the `external_directory` allowlist for permission purposes (`Plans/Permissions_System.md` §3.3).
- Skill tool calls are protected from pruning during `/compaction`.
- If PM adopts Xeditor-inspired incremental summarization, `Plans/assistant-chat-design.md` and related `/assistant-chat-design.md` context `/compaction` shards must stay aligned with skill/tool-call preservation so incremental summaries do not drop recoverable skill lineage.

ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/OpenCode_Deep_Extraction.md

**GUI behavior:**

- **List view:** Show discovered skills (project + global) with name, description (truncated), source path, and permission. Use selectable labels for name/path so users can copy. Indicate source (project vs global).
- **Add:** "Add skill" → user chooses "Create new" (name + directory under project or global path) or "Import from path" (pick existing folder containing `SKILL.md`). Validate name and frontmatter; create or link.
- **Edit:** Open `SKILL.md` in an inline editor or external editor; validate on save (frontmatter + name match dir).
- **Remove:** "Remove" / "Disable" -- either delete the skill folder (with confirmation) or hide via permissions. Do not delete without explicit user confirmation.
- **Permissions:** Per-skill or pattern-based (allow / deny / ask), stored in config (e.g. `GuiConfig.skill_permissions` or `opencode.json`-style `permission.skill`). GUI: list skills with a permission dropdown or edit permission in a modal.
- **Refresh:** "Refresh" button to re-run discovery (e.g. after adding files on disk).

**Integration:** Backend (§7.10) provides discovery, load, and persistence; GUI consumes it. When building prompts or runner context for platforms that support skills, pass the list of allowed skills (and paths) so the platform CLI or SDK can load them (see orchestrator-subagent-integration and platform_specs).

**Acceptance criteria (summary):**

- User can open Skills from Config (Advanced tab or dedicated Skills tab) and see a list of discovered skills with name, description (truncated), source path, and permission.
- User can Add (Create new or Import from path), Edit (inline or external editor), Remove (with confirmation), set Permissions (per-skill or bulk by pattern), and Refresh the list.
- List reflects discovery path order and deduplication (first-wins); source (project vs global) is visible; selectable labels allow copy of name/path.
- Invalid frontmatter, missing SKILL.md, or permission/config write failure surface as clear errors (toast or inline) without corrupting state.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**UI location:**

- **Tab/section:** Config → Advanced → "Skills", or Config → dedicated "Skills" tab. All Skills features (list, add, edit, remove, permissions, bulk permission, sort/filter, preview, validate all) live in this same tab/section.

**Data flow:**

- **Discovery and list refresh:** List is built from `discover_skills(project_root)` using the ordered discovery paths (see §7.10). List is refreshed: (1) on opening the Skills tab; (2) after Add (Create/Import), Edit save, or Remove; (3) when user clicks "Refresh". Do not auto-refresh on a timer; user-initiated or after mutations only.
- **Permissions:** Read from `GuiConfig.skill_permissions`; writes (per-skill or bulk) update config and persist; list re-renders with resolved permission per skill.

**Error handling:**

- **Invalid frontmatter:** On load or save, if YAML frontmatter is missing or malformed, show error (e.g. "Invalid frontmatter in SKILL.md") and do not overwrite file on save; allow user to fix in editor.
- **Missing SKILL.md:** If a discovery path has a directory without `SKILL.md`, either skip it in discovery (no entry in list) or show as "Invalid: missing SKILL.md" per implementation; document in backend.
- **Permission/config write failure:** If saving `skill_permissions` to config fails (e.g. disk full, permission denied), show error toast and keep in-memory state so user can retry or save elsewhere; do not lose edits.

**Checklist (for implementation):**

- [ ] Add **Skills** subsection/tab under Config; list discovered skills; Add / Edit / Remove / Permissions / Refresh.
- [ ] Wire to backend skill discovery and permission config; persist permissions in same config surface as rest of Config.
- [ ] Run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` after any new widgets.

### 7.9 Backend: Desktop Shortcuts

Backend components required so the Desktop Shortcuts GUI (§7.7) and in-app key handling work.

**Data and types:**

- **ShortcutAction:** Enum or struct identifying each action (e.g. `MoveToLineStart`, `MoveToLineEnd`, ...). One variant per row in the default table in §7.7. Tag **DRY:DATA:shortcut_actions**.
- **Default shortcuts:** A const or fn `default_shortcuts() -> Vec<(ShortcutAction, KeyBinding)>` (or `HashMap<ShortcutAction, KeyBinding>`) as the single source of truth. **DRY:DATA:default_shortcuts.** KeyBinding represents modifier + key (e.g. Ctrl+A, Alt+F); use a type that can be serialized for config and compared for conflicts.
- **Config shape:** `GuiConfig.shortcuts` (or `keyboard_shortcuts`): map from action id (string or enum name) to user key binding. Only overrides are stored; missing key means use default.

**Key map building:**

- **build_key_map(defaults, overrides) -> KeyMap:** Merge defaults with overrides (overrides take precedence). Output a structure the GUI layer (Slint) can use to route key events to actions. Tag **DRY:FN:build_key_map**.
- **Platform mapping:** If supporting macOS, map Ctrl -> Cmd and Alt -> Option when reading/writing config or displaying in GUI; do this in one place (same DRY data or a small platform module).

**Persistence:**

- Load/save `shortcuts` with the rest of `GuiConfig` (Option B in Worktree §5). No separate shortcuts file unless design mandates it. On app startup, load GuiConfig, build key map, install into the app's key event handler.

**Wiring:**

- **App startup:** After loading GuiConfig, call `build_key_map(default_shortcuts(), gui_config.shortcuts)` and store the result in app state (e.g. `App::key_map`). All key events (e.g. in composer, prompt fields) go through this map to resolve to `ShortcutAction` then execute the corresponding behavior.
- **GUI (Shortcuts screen):** Read current binding per action from the same key map (or from defaults + overrides) so the list shows exactly what is active. On "Change", record new key combo, validate (no duplicate action binding; optional conflict check), update GuiConfig.shortcuts and persist; then rebuild key map so the new binding is active immediately.

**Conflict validation (optional but recommended):** Ensure two actions do not share the same binding; optionally warn if the new binding matches a system or well-known shortcut. Implement in a small **DRY:FN:validate_shortcut_binding**.

**Acceptance criteria (backend):**

- `ShortcutAction` and `KeyBinding` types exist; `default_shortcuts()` returns the single source of truth; `build_key_map(defaults, overrides)` merges and returns a KeyMap used by Puppet Master.
- GuiConfig has a `shortcuts` (or `keyboard_shortcuts`) field; only overrides are stored; load/save use the same config path as the rest of GuiConfig.
- On app startup: load GuiConfig; on failure or invalid shortcuts section, fall back to empty overrides and show toast (§7.11); then build key map and install into key event handling.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

**Data flow (config field names, when key map is rebuilt):**

- **Config field:** `GuiConfig.shortcuts`: type e.g. `HashMap<String, KeyBinding>` or `BTreeMap<ShortcutAction, KeyBinding>`; key = action id (string or enum name); value = user override. Only overrides stored.
- **Key map rebuild:** (1) On app startup after loading GuiConfig; (2) After user saves a change on the Shortcuts screen (edit or reset); (3) After successful import (Replace or Merge). Rebuild = `build_key_map(default_shortcuts(), gui_config.shortcuts)`; store result in `App::key_map` (or equivalent); wire to key event handler.

**Error handling:**

- **Config load:** If shortcuts section is missing, use empty overrides. If it fails to parse or is invalid, fall back to empty overrides, log warning, show toast "Shortcuts reset to defaults due to config error" (§7.11).
- **Validate on edit/import:** Use `validate_shortcut_binding` to reject duplicate action binding (same key bound to two actions); optionally warn on system shortcut.

**Checklist:** See §8.8.

### 7.10 Backend: Agent Skills
Backend skill handling follows the PM-native runtime model.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md

Required backend behavior:
- discover skills from PM roots plus compatible import roots defined by the canonical skill system.
- validate `SKILL.md` frontmatter, including `required_tool_refs` and `optional_tool_refs`; `required_tool_refs` problems block runnable `/readiness`, `optional_tool_refs` problems warn, and the Skills `GUI` surfaces the exact failing refs instead of flattening them into one generic error.
- compute runtime readiness before launch from validation state, permission state, and tool availability.
- bundle PM-selected skill content into the compiled context.
- expose the PM `skill` tool for on-demand skill retrieval during the run.
- treat provider-native skill directories and file formats as optional import/export/projection layers only.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/Multi-Account.md

Projection rules:
- import/discovery from compatible roots is always allowed when enabled by canon.
- projection/export is optional and explicit.
- projection state and drift state must be tracked per target through `projection_targets` / `projection_targets[]`; target families may include workspace `AGENTS.md`, workspace `CLAUDE.md`, workspace `GEMINI.md`, workspace `.cursor/rules/pm-generated.mdc`, workspace `cursor/rules/pm-generated.mdc`, and provider/account-local `/account-local` config references where needed.
- workspace-owned projections are tracked separately from provider-root-owned runtime state; cleanup or repair flows must not confuse workspace-owned projected files with provider-root-owned account/runtime directories.
- editing a provider-native projection target directly requires switching only that target to `Manual Override`; repair acts on the chosen target and must not silently revert sibling targets.
- a projection failure does not mean PM-native skill runtime delivery failed.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
### 7.11 Shortcuts and Skills: gaps, enhancements, implementation readiness

This subsection closes open decisions and documents gaps so an **implementation plan** can be derived without ambiguity. It also lists optional enhancements and states readiness for implementation planning.

**Desktop Shortcuts -- gaps and decisions**

| Gap / risk | Resolution or decision |
|------------|------------------------|
| **Scope of shortcut handling** | Explicitly list all views/widgets that receive shortcut handling: composer (prompt field), chat input, interview text fields, config text inputs, wizard prompts, any other focusable text. Implementation plan should enumerate and wire key map in one central place (e.g. app-level key subscription) or per-widget; prefer central so behavior is consistent. |
| **Slint key event wiring** | Key map must be consulted on every key event in focusable text areas. Slint: use a `FocusScope` (or window-level `key-pressed` handler) at the appropriate level (window or focused widget). Document in implementation plan: where key events are captured and how KeyMap is applied (e.g. `if let Some(action) = key_map.get(event) { ... }`). |
| **"Record new shortcut" flow** | Specify: (1) focus capture so only the new key combo is recorded; (2) ignore the key that opened the dialog (e.g. don't record "Ctrl+K" if user opened via Ctrl+K); (3) Escape cancels without saving; (4) if user presses a key with no modifier, either reject with tooltip "Use a modifier (Ctrl/Alt/Cmd)" or allow (e.g. F-keys). Recommend: require at least one modifier for clarity. |
| **KeyBinding serialization** | Config stores overrides; use a format that is cross-platform and stable (e.g. string `"Ctrl+A"` or structured `{ "modifiers": ["ctrl"], "key": "A" }`). Document in implementation plan; ensure backward compatibility if format changes later. |
| **Conflict validation** | "No duplicate action binding" is required. "Warn on system shortcut" is optional: maintain a small allowlist of well-known system shortcuts (e.g. Ctrl+C, Ctrl+V) and warn when user binds an action to one; or skip for v1. |
| **User presses a key already bound to another action** | **Resolution:** When recording a new shortcut, if the key combo is already bound to a *different* action, either (a) **reject** with tooltip "Already used by &lt;ActionName&gt;" and do not save, or (b) **steal** (assign to new action and remove from old); implementation must decide. **Recommendation:** (a) reject and require user to change or reset the other action first. |
| **Config file corrupted or invalid shortcuts section** | **Resolution:** On load, if `GuiConfig.shortcuts` (or the shortcuts section) fails to parse or is structurally invalid: **fall back to defaults** (empty overrides), log a warning, and **show a toast** ("Shortcuts reset to defaults due to config error"). Do not crash; key map = `build_key_map(default_shortcuts(), empty_overrides)`. Optionally persist the repaired config (defaults) on next save. |
| **Export format versioning** | **Resolution:** Export JSON must include a `version` field (e.g. `1`). On import, if `version` is missing or greater than the highest supported version, **reject** with message "Unsupported shortcut file version" (or "implementation must decide": skip unknown version and attempt to parse known fields for best-effort import). Document supported versions in code or STATE_FILES.md. |
| **Filter: empty query vs no matches** | **Resolution:** **Empty filter** = show all shortcut rows. **Non-empty filter with no matches** = show empty list and a single inline message (e.g. "No shortcuts match 'xyz'") so the user can tell "no match" from "no data." Implementation must not show "No shortcuts" when the filter is the cause. |
| **Tooltip/label when key map not yet loaded** | **Resolution:** Before first `build_key_map` (e.g. config not yet loaded or app init): show action label only, with no "(Key)" suffix, or show placeholder "(Loading...)". Once key map is built, show binding. Avoid blank or "(undefined)" in UI. |
| **Tests** | Add unit tests: `build_key_map` (defaults + overrides merge correctly); `validate_shortcut_binding` (reject duplicate action, optional conflict); round-trip (defaults → config override → build_key_map → same bindings). See §8.8.8. |

**Agent Skills -- gaps and decisions**

| Gap / risk | Resolution or decision |
|------------|------------------------|
| **Deduplication by name** | **Decision:** **First-wins by search order.** Discovery walks paths in a defined order (e.g. project paths first, then global; within each, e.g. `.puppet-master/skills` then `.claude/skills` then `.agents/skills`). First `skills/<name>/SKILL.md` found for a given `name` wins; later duplicates with the same name are skipped (or listed as "shadowed" in GUI). Document this order in DRY:DATA:skill_search_paths. |
| **Create skill: directory already exists** | **Decision:** On "Create new" skill, if the target directory (e.g. `<base>/<name>/`) already exists and contains a `SKILL.md`, **do not overwrite**. Show an error (e.g. "A skill named &lt;name&gt; already exists at this location") and do not create. User must choose a different name or remove/import the existing skill first. Implementation must decide whether to treat "dir exists but no SKILL.md" as error or as partial state (e.g. offer to create SKILL.md only). |
| **Edit: concurrent edit on disk** | **Implementation must decide:** If the user has the skill open in the GUI editor and the file is changed on disk (e.g. by another editor or process), on save: (1) overwrite and warn "File was modified on disk; your version was saved", or (2) detect mtime/content change and prompt "File changed on disk. Reload / Overwrite / Cancel", or (3) lock file for v1 (complex). Recommend (2) for clarity. |
| **Validate all: show only errors vs full table** | **Decision:** Show a **full table** (all discovered skills) with a status column: OK or Error + message. This allows users to see which skills passed and which failed in one view. Summary line: "N OK, M errors." Optional: filter toggle "Show only errors" to collapse to errors-only. Implementation plan may choose errors-only modal for v1 if full table is deferred. |
| **Permission "ask": when and where** | **Defer to later:** "Ask" means prompt user before an agent loads the skill. When implemented: user is prompted **at the moment the runner would load the skill** (e.g. when building iteration context or when platform CLI would invoke the skill)--i.e. in-app, before or at run start, not inside the platform CLI. Where: modal or toast from the app (e.g. "Allow skill 'doc-lookup' for this run?" Allow / Deny / Always / Never). Implementation plan can mark "ask" as phase 2 and leave exact UI location to implementation. |
| **Pattern precedence: explicit vs pattern** | **Decision:** **Explicit per-skill entry wins over pattern.** When resolving permission for a skill name, check explicit entries in `skill_permissions` first; if none match, then apply pattern rules (e.g. `doc-*: allow`). So a skill "doc-release" with explicit "deny" remains denied even if pattern "doc-*" is allow. Document in backend resolve logic and in bulk-permission UI. |
| **"Import from path"** | **Decision:** **Copy into a discovery path.** "Import" means: user picks an existing folder containing `SKILL.md`; we copy that folder into a chosen discovery base (e.g. `.puppet-master/skills/<name>` or `~/.config/puppet-master/skills/<name>`). We do not persist arbitrary external paths (keeps discovery simple and portable). Validate name and frontmatter after copy. |
| **Create skill when no project** | When no project is open (no project root), "Create new" skill: offer **global only** (e.g. `~/.config/puppet-master/skills/<name>`). Disable or hide "project" option when `project_root` is None. |
| **Edit: name change in frontmatter** | **Decision:** **Name in frontmatter must match directory name.** On save, if user changes `name` in frontmatter so it no longer matches the dir name: (1) reject with validation error "Name must match folder name", or (2) offer "Rename folder" to rename dir to match (then save). Prefer (1) for v1 to avoid accidental renames. |
| **How runners receive skills** | **Decision:** MVP runtime delivery uses the canonical registry + permission filter + context bundling + `skill` tool path. Provider-native formats may be documented as interoperability inputs, but implementation does not require a separate per-provider native runtime delivery matrix. |
| **Tests** | Add unit tests: `discover_skills` (mock dirs, order and deduplication); `load_skill` (valid/invalid frontmatter, name validation, dir-name match); `resolve_skill_permission` (exact + wildcard, default allow). See §8.9.7. |

**Required scope** (fleshed out below in §7.11.1 and §7.11.2)

- **Shortcuts:** Export/import shortcut set; search/filter in list; show shortcut in tooltip or menu label.
- **Skills:** Bulk set permission by pattern; sort/filter list; preview skill body; last modified / version; validate all SKILL.md on disk.

#### 7.11.1 Shortcuts: export/import, search/filter, discoverability

Required. Use existing widgets; tag new helpers with DRY.

**Acceptance (summary):** (1) User can export current overrides to a JSON file and import from file with Replace/Merge and validation. (2) User can filter the shortcut list by action or key string; empty filter = all, non-empty with no match = empty list + "No shortcuts match...". (3) Menus/buttons that trigger shortcut actions show the binding in label or tooltip; when key map not loaded, show label only or "(Loading...)".

**1. Export / import shortcut set**

- **Purpose:** Backup, restore, or share shortcut overrides across machines or with other users.
- **Export:** Button "Export..." on Shortcuts tab opens a file picker (or native save dialog). Serialize current overrides only (or full key map) to JSON. Format: e.g. `{ "version": 1, "overrides": { "MoveToLineStart": "Ctrl+A", ... } }` using the same action-id and KeyBinding serialization as config. Include a `version` field for future compatibility. Write to user-chosen path. Success toast: "Exported N shortcuts."
- **Import:** Button "Import..." opens file picker; user selects a JSON file. Parse and validate: all action ids must exist, all bindings must be valid (no duplicate action binding; optional conflict check). Then either **Replace** (set `GuiConfig.shortcuts` to imported overrides, persist) or **Merge** (imported wins on conflict; merge into existing overrides). Show confirmation modal: "Replace current shortcuts with N from file?" or "Merge N shortcuts from file?" with Cancel / Replace or Merge. On success, rebuild key map and persist; toast "Imported N shortcuts."
- **Backend:** `export_shortcuts_to_json(overrides: &ShortcutOverrides) -> String` (DRY:FN); `import_shortcuts_from_json(json: &str) -> Result<ShortcutOverrides>` with validation (DRY:FN). Reuse same serialization as GuiConfig.shortcuts so format is consistent.
- **Edge cases:** Empty overrides in file → valid (clear overrides if Replace). Unknown action id in file → skip or reject entire import; document to skip unknown and import known only, or reject with "Unknown action: X". **Invalid JSON or unparseable file:** Reject entire import with toast "Invalid shortcut file" (do not apply partial data). **Import would create duplicate binding** (same key for two actions): run `validate_shortcut_binding` after merge; if invalid, reject with "Conflict: key already used by &lt;Action&gt;" or apply and steal; implementation must decide (recommend reject). **Export format version:** Include `version: 1` in export; on import, if version &gt; supported, reject with "Unsupported shortcut file version."

**2. Search / filter in shortcut list**

- **Purpose:** When many actions exist, quickly find by action name or by key binding.
- **GUI:** Text field above the shortcut list (e.g. "Filter by action or shortcut"). As user types, filter the list: show only rows where the action label (e.g. "Move to start of current line") or the shortcut display string (e.g. "Ctrl+A") contains the filter text (case-insensitive substring). Empty filter = show all. Optional "Clear" button or clear on Escape. Use `styled_text_input`; no new widget.
- **Backend:** Filtering is in-memory on the list already built for the view. No new backend type; view holds filter string and filters the list of (ShortcutAction, KeyBinding) before rendering. Optional: `filter_shortcut_list(entries: &[(ShortcutAction, KeyBinding)], query: &str) -> Vec<...>` (DRY:FN) if used in more than one place.
- **Empty filter vs no matches:** Empty filter shows all rows. When filter is non-empty and no row matches, show empty list plus a single inline message (e.g. "No shortcuts match '...'") so the user distinguishes "no match" from "no shortcuts loaded."

**3. Show shortcut in tooltip or menu label**

- **Purpose:** Discoverability--user sees the key binding where the action is available (menus, buttons) without opening the Shortcuts tab.
- **Where:** Any UI that triggers an action that has a shortcut: e.g. menu item "Kill to end of line", button that cancels a popover. Show the binding in the label or in a tooltip: "Kill to end of line (Ctrl+K)" or tooltip "Shortcut: Ctrl+K".
- **Implementation:** When building menu or button labels for actions that have a shortcut, resolve the current binding from the key map (or defaults + overrides) and append to the label or set as tooltip. Single helper: `shortcut_label(action: ShortcutAction, key_map: &KeyMap) -> String` or `format!("{} ({})", action_label, binding_display)`. Use it everywhere we show an action that has a shortcut. DRY:FN or DRY:HELPER.
- **Edge cases:** If user removed the binding (e.g. no shortcut for that action), show only the action label with no "(...)" or show "No shortcut". Keep tooltip/label in sync with key map after changes. **When key map not yet loaded** (e.g. config not loaded at init): show action label only (no key suffix) or placeholder "(Loading...)"; never show blank or "(undefined)".

**Checklist:** See §8.10.1.

#### 7.11.2 Skills: bulk permission, sort/filter, preview, last modified, validate all

Required. Use existing widgets; tag new helpers with DRY.

**1. Bulk set permission by pattern**

- **Purpose:** Set allow/deny/ask for many skills at once (e.g. "Allow all doc-*", "Deny all internal-*").
- **Acceptance criteria:** User enters pattern (e.g. `doc-*`) and selects Allow/Deny/Ask; Apply shows confirmation with count; on confirm, config is updated and persisted; list reflects new permissions; explicit per-skill overrides pattern (see precedence below).
- **GUI:** "Bulk permission" or "Set by pattern" on Skills tab: pattern input (e.g. `doc-*`, `internal-*`) + dropdown (Allow / Deny / Ask) + "Apply" button. On Apply, resolve all discovered skills whose name matches the pattern (same wildcard semantics as `resolve_skill_permission`). Show confirmation modal: "Set Allow for 3 skills matching doc-*?" with Cancel / Apply. On confirm, update `GuiConfig.skill_permissions`: add or update pattern entry (e.g. `"doc-*": "allow"`) or set per-skill entries for each match. Persist config. Toast: "Updated permission for N skills."
- **Precedence:** **Explicit per-skill wins over pattern** (so "doc-release" with explicit "deny" is still denied when pattern "doc-*" is allow). Backend already supports this if we store both pattern and explicit entries and resolve with explicit first. Document in UI (e.g. tooltip or help).
- **Backend:** No new function required if we only add/update pattern entries in skill_permissions. Optional: `apply_bulk_permission(permissions: &mut SkillPermissions, pattern: &str, permission: Permission, discovered: &[SkillInfo])` (DRY:FN) to compute matching names and update config.
- **Error handling:** If config persist fails after Apply, show error toast; do not update in-memory state as "saved" so user can retry.

**2. Sort / filter list**

- **Purpose:** Find skills quickly and order by name, source, or permission.
- **Acceptance criteria:** User can sort by Name, Source, or Permission; filter by text (name/description), source (All / Project / Global), and permission (All / Allow / Deny / Ask); combined filters apply; sort preference persists (session or GuiConfig).
- **Sort:** Column headers or a "Sort by" dropdown: **Name** (alphabetical by skill name), **Source** (project first, then global; within each by name), **Permission** (allow, then ask, then deny; within each by name). Store last-chosen sort in session or in GuiConfig (e.g. `skills_list_sort: "name" | "source" | "permission"`) so it persists across opens.
- **Filter:** (1) Text filter: substring match on name and description (case-insensitive). (2) Source: All | Project only | Global only. (3) Permission: All | Allow | Deny | Ask. Combine filters; show only skills that match all. Use styled_text_input and dropdowns/toggles from widget catalog.
- **Backend:** Sort and filter are in-memory on `discover_skills` + permission resolve result. Optional: `sort_skills(skills: &mut [SkillInfo], by: SortBy, permissions: &SkillPermissions)` and `filter_skills(skills: &[SkillInfo], query: &str, source: Option<SkillSource>, permission: Option<Permission>) -> Vec<SkillInfo>` (DRY:FN) if reused.
- **Data flow:** List is built from `discover_skills(project_root)` then permission-resolved; sort and filter apply in-memory to that list; no re-discovery on sort/filter change.

**3. Preview skill body**

- **Purpose:** View the raw markdown body of a skill without opening the editor.
- **Acceptance criteria:** Selecting a skill in the list shows its body in a read-only pane (Skills tab); content is load-on-demand; user can copy text; "Edit" opens full editor. If load fails (missing file, invalid frontmatter), show error in pane instead of body.
- **GUI:** When user selects a skill in the list (single click or "Preview" button), show the body of `SKILL.md` in a read-only pane (e.g. right panel or bottom drawer, or modal). Content = markdown body only (no frontmatter), or full file with frontmatter collapsed. Use scrollable selectable text (or selectable_label_mono for code-like display) so user can copy. "Edit" button opens the full editor. Load on demand when selection changes; do not load all bodies up front.
- **Backend:** Reuse `load_skill(path)`; expose `.body` or equivalent on SkillInfo. If SkillInfo currently omits body to save memory, add optional `body: Option<String>` populated on demand for preview, or a separate `load_skill_body(path) -> Result<String>` (DRY:FN).
- **Error handling:** If `load_skill` fails for selected skill (e.g. file deleted on disk), show message in preview pane (e.g. "Could not load skill: ...") and optionally refresh list.

**4. Last modified / version**

- **Purpose:** See when a skill was last changed; optional version for semantics.
- **Acceptance criteria:** List shows last modified (date or relative) per skill; preview pane can show same; optional version from frontmatter if we extend it.
- **Last modified:** For each skill, get file mtime: `std::fs::metadata(path).modified()` (or use a crate for cross-platform). Store in SkillInfo as `modified: Option<DateTime<Utc>>` (or SystemTime). Display in list row: "Modified: 2026-02-22" or "Modified: 2 days ago". Show in preview pane as well.
- **Version:** If frontmatter supports an optional `version` field (or under `metadata.version`), parse and show in list or preview. Not required by OpenCode; add only if we extend frontmatter. Otherwise "version" = last modified for display.
- **Backend:** Extend SkillInfo with `modified: Option<DateTime<Utc>>`; set in discovery or in load_skill from path metadata. Optional DRY:FN `skill_modified(path: &Path) -> Option<DateTime<Utc>>`.
- **Error handling:** If mtime cannot be read for a path (e.g. permission denied), show empty or "--" in list; do not exclude skill from list.

**5. Validate all SKILL.md on disk**

- **Purpose:** Check all discovered skills for valid frontmatter, name match, and description length without opening each file.
- **Acceptance criteria:** User clicks "Validate all" on Skills tab; all discovered skills are validated; results show in a full table (all skills) with status OK or Error + message; summary "N OK, M errors"; errors are copy-pasteable (selectable labels). See §7.11 for "show only errors vs full table" decision.
- **GUI:** "Validate all" button on Skills tab. On click, run validation for every discovered skill (same rules as load_skill: frontmatter, name 1-64 chars and regex, name matches dir, description 1-1024 chars). Show results in a **full table** (all discovered skills) with status column: OK or Error + message (e.g. "my-skill: name in frontmatter does not match folder name"). Summary: "N OK, M errors." Use selectable labels for copy-paste of errors. Optional filter: "Show only errors."
- **Backend:** `validate_skill(path: &Path) -> Result<(), ValidationError>` (DRY:FN) that reads SKILL.md, parses frontmatter, checks name and description and dir-name match; returns Ok(()) or Err with message. Then for each skill: `discover_skills` then for each path call `validate_skill`. No write; read-only. Reuse validation logic from load_skill to avoid duplication.
- **Error handling:** If a skill path becomes unreadable during validate-all, show Error with message (e.g. "Could not read file"); do not abort entire run -- continue and report per-skill.

**Checklist:** See §8.10.2.

**Implementation plan readiness**

- **Ready:** The spec (§7.7-§7.10) plus this subsection (§7.11) and checklists (§8.8, §8.9) are **sufficient for an implementer to produce a detailed implementation plan** for Puppet Master. All open decisions above are resolved or scoped (with "defer" or "v1 preference" where needed).

**Implementation plan checklist** (for implementer before drafting the implementation plan)

- [ ] Read §7.7-§7.11.2 (Shortcuts and Skills spec, gaps, and enhancements) and §8.8-§8.10.2 (implementation checklist items for Shortcuts and Skills).
- [ ] Resolve project path for Skills when no project is open: "Create skill" must offer global-only path (e.g. `~/.config/puppet-master/skills/<name>`); disable or hide project option when `project_root` is None (per §7.11 "Create skill when no project").
- [ ] Define Slint key-event integration point: where key events are captured (window vs focused widget, via `FocusScope` or window-level handler) and how KeyMap is applied; document in implementation plan (per §7.11 "Slint key event wiring").
- [ ] Confirm platform_specs (or orchestrator plan) documents how each platform receives skill list (paths vs content; CLI env vs prompt injection); implementation plan references this per platform.

**Dependencies**

- **Requires:** GuiConfig and Option B run config (Worktree plan) for Shortcuts/Skills config persistence and for cleanup config wiring used by the same flows. platform_specs (or equivalent) for skill injection per platform when integrating Skills with runners.
- Shortcuts have no dependency on Skills. Skills backend can stub `list_skills_for_agent` until orchestrator and platform_specs define how runners receive the skill list.

**Recommended implementation order** (integrated with cleanup, worktree, and plan)

1. **Cleanup and run config (foundation):** Core cleanup module (§8.1), wrapper and config wiring (§8.2), GuiConfig/run config with Option B (Worktree plan) so cleanup toggles and later Shortcuts/Skills config are in the same run config shape.
2. **Shortcuts:** After GuiConfig exists, implement in order: (a) backend types and default_shortcuts (§8.8.1-8.8.2); (b) GuiConfig.shortcuts and build_key_map, including config load failure (§8.8.3-8.8.4, 8.8.7); (c) validate_shortcut_binding (§8.8.5); (d) Shortcuts GUI list/edit/reset (§8.6.5, §8.8.6); (e) key event wiring (single subscription + KeyMap, no hardcoded bindings); (f) export/import, search/filter, discoverability (§8.10.1). Tests alongside (§8.8.8).
3. **Skills:** Skills backend can start after project path resolution exists (discovery uses project_root; when None, global-only paths per §7.11). Then Skills GUI (list, add/edit/remove, permissions, refresh); then integration (runners receive skill list per platform_specs). Tests alongside.
4. **Cleanup UX and optional worktree:** Cleanup UX (§8.6), "Clean workspace now," evidence retention (§8.5); optionally "Clean all worktrees" when worktree_manager is available (§9.1.8).
5. **Shortcuts/Skills enhancements:** §8.10.1 (export/import, search/filter, discoverability), §8.10.2 (bulk permission, sort/filter, preview, last modified, validate all).
6. **Pre-completion:** §8.7 (AGENTS.md checklist, Task Status Log).

---

## 8. Implementation Checklist

**Order:** Implement in the sequence below so dependencies are satisfied. DRY: no duplicate allowlist or git-clean logic anywhere outside `src/cleanup/`.

### 8.1 Core cleanup module (required)

- [ ] **8.1.1** Add `pub mod cleanup;` to `src/lib.rs` (alongside `pub mod git;`).
- [ ] **8.1.2** Create `src/cleanup/mod.rs`: re-export `workspace::*` and define `CleanupConfig` struct (fields: `untracked`, `clean_ignored`, `clear_agent_output`, `remove_build_artifacts`); tag with DRY:DATA if config lives here.
- [ ] **8.1.3** Create `src/cleanup/workspace.rs`. Implement `cleanup_exclude_patterns()` (or `CLEANUP_EXCLUDE_PATTERNS`) with exact list from §4.8; tag DRY:DATA. Implement `run_git_clean_with_excludes(work_dir, clean_untracked, clean_ignored)` using `path_utils::resolve_executable("git")` and one `-e` per pattern; tag DRY:FN.
- [ ] **8.1.4** In same file, implement `prepare_working_directory(work_dir, config)` per §4.8 step-by-step (git check → skip if not repo; optional reset omitted; call run_git_clean_with_excludes if config.untracked; optional agent-output clear); tag DRY:FN.
- [ ] **8.1.5** In same file, implement `cleanup_after_execution(pid, work_dir, config)` per §4.8 (terminate process; runner temp only; optional build-artifact dirs); tag DRY:FN. Do **not** call run_git_clean_with_excludes here.
- [ ] **8.1.6** Section 3 and 3.6: Document cleanup policy in AGENTS.md; ensure allowlist includes `.gitignore` and sensitive patterns; no `git add -f`; document security in AGENTS.md or security notes.

### 8.2 Wrapper and config wiring (required)


- [ ] **8.2.1** Implement `run_with_cleanup(runner, request, config)` per §4.8 (prepare → execute → cleanup; on prepare error log and continue). Place in `src/core/run_with_cleanup.rs` or inside `execution_engine.rs`; tag DRY:FN.
- [ ] **8.2.2** Add `CleanupConfig` (or cleanup section) to the run config shape built from GuiConfig (Option B, Worktree §5). Ensure the orchestrator and other call sites can obtain a `CleanupConfig` when starting a run.
- [ ] **8.2.3** Extend `IterationContext` (or equivalent) with `cleanup_config: Option<CleanupConfig>` per §9.1.16. When the orchestrator builds the context, set it from run config.
- [ ] **8.2.4** In **ExecutionEngine::execute_iteration**: call `prepare_working_directory(&context.working_directory, &cleanup_config)` before the platform loop; then call `runner.execute(request)` directly (CLI-only — `execute_with_sdk_fallback` has been removed); then call `cleanup_after_execution(0, &context.working_directory, &cleanup_config)` after it returns. Obtain cleanup_config from context (e.g. `context.cleanup_config.unwrap_or_default()`). This way prepare/cleanup wrap the entire execution.
- [ ] **8.2.5** In `interview/research_engine.rs` `execute_research_ai_call`, wrap `runner.execute(&request)` in `run_with_cleanup(runner, &request, &config).await`; obtain config from research engine config or caller.
- [ ] **8.2.6** In start_chain: `prd_generator.rs`, `requirements_interviewer.rs`, `architecture_generator.rs`, `multi_pass_generator.rs` -- replace each `runner.execute(&request).await` with `run_with_cleanup(..., &request, &config).await`; pass config from caller or discovery.
- [ ] **8.2.7** In `app.rs` `execute_ai_turn`: optionally use run_with_cleanup when working_dir is a known project; otherwise keep direct execute and skip prepare/cleanup.

### 8.3 Tests and gaps (required)

- [ ] **8.3.1** Unit tests: in `src/cleanup/workspace.rs` (or `tests/`), assert cleanup_exclude_patterns contains `.puppet-master`, `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`; assert run_git_clean_with_excludes does not delete a test file matching an exclude. Optional: integration test in temp repo with untracked files and allowlisted paths.
- [ ] **8.3.2** §9.1.1: Align trait signature with REQUIREMENTS or document extension (cleanup_after_execution(pid, work_dir)); we do not add these to the trait, only use run_with_cleanup.
- [ ] **8.3.3** §9.1.6: Document exact patterns in cleanup_exclude_patterns(); test excluded paths are never removed.
- [ ] **8.3.4** §9.1.13: Confirm cleanup_after_execution never calls run_git_clean_with_excludes; only prepare_working_directory and manual "Clean workspace" do.
- [ ] **8.3.5** §9.1.14: Confirm interview, start-chain, orchestrator output paths are under `.puppet-master/` or allowlisted; add any project-root output path to allowlist if needed.
- [ ] **8.3.6** Cross-plan: Use shared git binary in run_git_clean_with_excludes (path_utils now; switch to resolve_git_executable when Worktree Phase 3 is done).

### 8.4 Agent output dir (Section 5)

- [ ] **8.4.1** Define `AGENT_OUTPUT_SUBDIR` and `agent_output_dir(base)` in cleanup module (DRY:DATA). In prepare_working_directory, if config.clear_agent_output, clear contents of agent_output_dir(work_dir) only; do not remove the dir. Document in STATE_FILES.md and AGENTS.md.

### 8.5 Evidence retention (Section 6)

- [ ] **8.5.1** Add evidence retention config (retention_days, retain_last_runs, prune_on_cleanup). Implement `prune_evidence_older_than(base_dir, config)` (DRY:FN) in cleanup module; call from manual action or background, not from cleanup_after_execution. Define "run" for retain_last_runs or prefer retention_days (§9.1.7). Document in STATE_FILES.md and AGENTS.md.

### 8.6 Cleanup UX (Section 7)

- [ ] **8.6.1** Add cleanup (and evidence) toggles to GUI: extend `GuiConfig` with cleanup and evidence blocks (e.g. under Advanced or top-level); add **Advanced → Workspace / Cleanup** subsection per §7.5 (Clean untracked, Clean ignored, Clear agent-output, Remove build artifacts, Evidence retention). Wire to same run config (Option B). Use widgets from `docs/gui-widget-catalog.md` (toggler, styled_button, confirm_modal); run generate-widget-catalog.sh and check-widget-reuse.sh after UI changes.
- [ ] **8.6.2** Add "Clean workspace now" button: place on **Doctor** (preferred) or Advanced → Workspace. Resolve **project path** from same source as run (e.g. current project or config path; not raw current_dir() unless intended). Call prepare-style run_git_clean_with_excludes with allowlist; optionally "Clean all worktrees" using worktree_manager list (§9.1.8). Confirmation modal; optional dry-run (§9.1.9) with `git clean -fd -n` and show list in modal.
- [ ] **8.6.3** Tooltips and docs: per §7.5 table; add one-line mention in Doctor that workspace cleanup runs before each iteration when enabled in Config → Advanced → Workspace.
- [ ] **8.6.4** §7.6: Document in AGENTS.md or user docs that we do not rely on platform hooks for cleanup; optional skill/README for agents to use `.puppet-master/agent-output/` and avoid leaving cruft.
- [ ] **8.6.5** §7.7: Add Shortcuts subsection/tab under Config; wire to shortcut backend (§8.8); list, edit, reset; persist in GuiConfig.
- [ ] **8.6.6** §7.8: Add Skills subsection/tab under Config; wire to skills backend (§8.9); list, add, edit, remove, permissions, refresh.

### 8.8 Desktop Shortcuts backend (§7.7, §7.9)

**Order:** Implement in sequence 8.8.1 → 8.8.2 → 8.8.3 → 8.8.4 → 8.8.5 → 8.8.6 → 8.8.7 → 8.8.8.

- [ ] **8.8.1** Define `ShortcutAction` enum and `KeyBinding` (or equivalent) in `src/config/` or `src/gui/shortcuts.rs`; tag DRY:DATA:shortcut_actions.
- [ ] **8.8.2** Define `default_shortcuts()` (or const) as single source of truth for default bindings; tag DRY:DATA:default_shortcuts. Add platform mapping (Ctrl/Cmd, Alt/Option) if supporting macOS.
- [ ] **8.8.3** Add `shortcuts` (or `keyboard_shortcuts`) to `GuiConfig`; only overrides stored; load/save with rest of config.
- [ ] **8.8.4** Implement `build_key_map(defaults, overrides) -> KeyMap`; tag DRY:FN:build_key_map. Wire app startup: after loading GuiConfig, build key map and install into key event handling.
- [ ] **8.8.5** Implement optional `validate_shortcut_binding` (no duplicate action binding; optional conflict check); tag DRY:FN if reusable.
- [ ] **8.8.6** Ensure all key handling in composer/prompt fields uses the key map (no hardcoded bindings). Shortcuts screen reads current bindings from key map and writes overrides to GuiConfig.
- [ ] **8.8.7** **Config load failure:** When loading GuiConfig, if the shortcuts section is missing, use empty overrides. If it fails to parse or is structurally invalid, fall back to empty overrides, log a warning, show toast "Shortcuts reset to defaults due to config error", and build key map from defaults only (§7.11). Do not crash.
- [ ] **8.8.8** Unit tests for shortcuts: build_key_map (defaults + overrides merge); validate_shortcut_binding (reject duplicate action, optional conflict); round-trip (defaults → override → build_key_map → same bindings). See §7.11.

### 8.9 Agent Skills backend (§7.8, §7.10)

Implement in order; discovery path order is canonical (§7.10).

- [ ] **8.9.1** Add `src/skills/` (or under `src/config/`): `mod.rs`, `discovery.rs`, `frontmatter.rs`, `permissions.rs`; declare in parent `mod.rs`.
- [ ] **8.9.2** Define discovery paths (DRY:DATA:skill_search_paths) in **canonical order**: project first (`.puppet-master/skills`, `.claude/skills`, `.agents/skills`), then global (`~/.config/puppet-master/skills`, etc.); implement `discover_skills(project_root) -> Vec<SkillInfo>` with first-wins deduplication by name; tag DRY:FN:discover_skills.
- [ ] **8.9.3** Implement `load_skill(path) -> Result<SkillInfo>` with YAML frontmatter parsing and name/description validation (length, regex, dir-name match); return clear errors for invalid frontmatter or missing file; tag DRY:FN:load_skill.
- [ ] **8.9.4** Add `skill_permissions` to GuiConfig; implement pattern-based resolve (allow/deny/ask) with wildcards; **explicit per-skill entry wins over pattern**; tag DRY:FN:resolve_skill_permission.
- [ ] **8.9.5** Implement CRUD: create skill dir + SKILL.md (if target dir already contains SKILL.md, return error and do not overwrite -- §7.11); update SKILL.md; delete (with confirmation); persist only permissions in config. On config write failure, return error to caller.
- [ ] **8.9.6** Implement `list_skills_for_agent(project_root, permissions) -> Vec<SkillInfo>` for runner/prompt integration; tag DRY:FN:list_skills_for_agent. Runtime delivery follows the canonical registry + permission filter + context bundling + `skill` tool path; provider-native formats remain interoperability inputs only.
- [ ] **8.9.7** Unit tests for skills: discover_skills (mock dirs, order and deduplication); load_skill (valid/invalid frontmatter, name validation, dir-name match); resolve_skill_permission (exact + wildcard, default allow, explicit over pattern). See §7.11.

### 8.10 Shortcuts and Skills: export/import, search/filter, discoverability, bulk permission, sort/filter, preview, last modified, validate all

Required. Implement with core Shortcuts (§8.8) and Skills (§8.9).

**8.10.1 Shortcuts: export/import, search/filter, discoverability (§7.11.1)**

**Order:** Implement after §8.8 is complete. Steps: (1) Config load failure, (2) Export/import, (3) Search/filter, (4) Discoverability.

- [ ] **8.10.1.1** **Config load failure (Shortcuts):** Handle corrupted or invalid shortcuts section on load: fall back to defaults, show toast "Shortcuts reset to defaults due to config error", rebuild key map (§7.11, §8.8.7). Ensure this is wired at app startup and when opening Config → Shortcuts.
- [ ] **8.10.1.2** **Export/import:** Add "Export..." and "Import..." buttons on **Config → Shortcuts** tab. Implement `export_shortcuts_to_json` and `import_shortcuts_from_json` (DRY:FN); validate on import (action ids, no duplicate binding per §7.11); Replace/Merge confirmation modal; on success persist and rebuild key map. Use same serialization as GuiConfig.shortcuts. Reject invalid JSON or unsupported version with toast (§7.11.1).
- [ ] **8.10.1.3** **Search/filter:** Add filter text field above shortcut list on Shortcuts tab; filter by action label or shortcut string (case-insensitive substring). Empty filter = show all; non-empty with no match = show empty list + "No shortcuts match '...'" (§7.11). Optional DRY:FN `filter_shortcut_list` if reused.
- [ ] **8.10.1.4** **Discoverability:** Where actions with shortcuts appear (menus, buttons), show binding in label or tooltip via a single helper (DRY:FN or DRY:HELPER). When key map not yet loaded, show action label only or "(Loading...)" (§7.11). Keep in sync with key map after changes.

**8.10.2 Skills: bulk permission, sort/filter, preview, last modified, validate all (§7.11.2)**

Order: implement list/sort/filter first, then preview and last modified, then bulk permission and validate all.

- [ ] **8.10.2.1** **Sort/filter:** Add sort (Name / Source / Permission) and filter (text, source, permission) on Skills tab. Apply in-memory to discovered list; persist sort preference in GuiConfig (e.g. `skills_list_sort`). Use styled_text_input and dropdowns from widget catalog.
- [ ] **8.10.2.2** **Last modified:** Extend SkillInfo with `modified: Option<DateTime<Utc>>` from path metadata (discovery or load_skill); show in list row and in preview pane. If mtime unreadable, show empty or "--"; do not drop skill from list.
- [ ] **8.10.2.3** **Preview:** On skill selection in list, show SKILL.md body in read-only pane (load on demand). Reuse load_skill or add optional body / `load_skill_body`; on load failure show error in pane. "Edit" opens full editor.
- [ ] **8.10.2.4** **Bulk permission:** Add "Bulk permission" / "Set by pattern" on Skills tab (pattern input + Allow/Deny/Ask + Apply). Confirmation modal with count; on confirm update GuiConfig.skill_permissions and persist. Document in UI that explicit per-skill wins over pattern. On persist failure show error toast; keep in-memory state for retry.
- [ ] **8.10.2.5** **Validate all:** Add "Validate all" button; run `validate_skill` (DRY:FN) for each discovered skill; show **full table** (all skills) with status OK or Error + message; summary "N OK, M errors"; selectable labels for copy. Reuse validation logic from load_skill. Optional filter "Show only errors." On per-skill read error, report that skill and continue.
- [ ] **8.10.2.6** **Create skill -- dir exists:** On "Create new" skill, if target directory already exists and contains SKILL.md, show error and do not overwrite (§7.11). User must choose different name or remove existing skill first.
- [ ] **8.10.2.7** **Edit -- concurrent edit on disk:** On save, if SKILL.md was modified on disk since open, implementation must decide: recommend detect (mtime or content) and prompt "File changed on disk. Reload / Overwrite / Cancel" (§7.11).

### 8.7 Pre-completion

- [ ] **8.7.1** Run full AGENTS.md Pre-Completion Verification Checklist (compile, DRY tagging, module organization, tests, scope); update Task Status Log when done.

---

## 9. Risks & Notes


- **Over-aggressive clean:** Using `git clean -fdx` without a correct exclude list can remove user-ignored but wanted files (e.g. local config). Prefer conservative default and explicit allowlist. **Security:** Without sensitive patterns in the allowlist (§3.6), cleanup could delete `.gitignore`, `.env`, or key files and make secrets more likely to be committed or exposed.
- **Worktree path:** Ensure `work_dir` passed to prepare/cleanup is the actual worktree path when using worktrees, not the main repo path.
- **Config wiring:** If GUI and run-time config differ (as in WorktreeGitImprovement.md), cleanup config must be read from the same config the orchestrator uses at run time.
- **Evidence pruning:** Pruning while a run is still writing evidence could remove in-use files. Run pruning after runs or on a delay; avoid deleting very recent files (e.g. last 1 hour).
- **Secrets to GitHub:** Never force-add ignored files; never log or put tokens/keys in evidence or PR body. See §3.6.

---

## 9.1 Gaps and Potential Issues

The following gaps or issues should be resolved during implementation or explicitly accepted as limitations.

### 9.1.1 Signature and contract alignment

- **REQUIREMENTS.md §26.2** specifies `prepare_working_directory(&self, path: &str)` and `cleanup_after_execution(&self, pid: u32)` with no `work_dir` on cleanup. This plan adds `work_dir: &Path` to `cleanup_after_execution` so the caller passes the directory the agent used (the runner may not know it from `pid`). Decide whether to update REQUIREMENTS to match or keep the extended signature only in code.
- Use `Path`/`PathBuf` in the trait; REQUIREMENTS use `&str` for path -- align for consistency.

### 9.1.2 Root-level state files and git clean

- **progress.txt** and **AGENTS.md** live at project root (STATE_FILES.md). If they are ever untracked, `git clean -fd` would remove them unless explicitly excluded. The allowlist must include root-level state paths (e.g. `progress.txt`, `AGENTS.md`) in addition to `.puppet-master/`, or document that these files must always be tracked so clean does not touch them.
- **Recommendation:** Add exclude patterns for `progress.txt`, `AGENTS.md`, `prd.json`, `.gitignore`, and sensitive patterns (§3.6) when invoking `git clean`, so untracked copies and credential files are never removed by mistake.

### 9.1.3 Non-git workspaces

- **prepare_working_directory** assumes a valid git repo (e.g. `git rev-parse --show-toplevel`). If the workspace is not a git repo (e.g. plain folder, or git not installed), the plan does not specify: fail the iteration, skip prepare/cleanup, or run only non-git cleanup (e.g. curated dirs).
- **Resolved:** If `git rev-parse --show-toplevel` fails in the work_dir: **do not fail the iteration**. Log a warning ("Prepare: not a git repo or git unavailable, skipping git clean") and return `Ok(())`. Optionally run only non-git cleanup (e.g. clear agent-output dir per config). Implement this in §4.8 step 1 of prepare_working_directory.

### 9.1.4 Stash and reset interaction

- REQUIREMENTS §26.3 say before iteration: "`git stash` any uncommitted changes (optional, configurable)". The plan does not mention stash. If **prepare_working_directory** resets tracked state (`git checkout -- .` / `git restore .`), uncommitted work could be lost if stash is not run first (or if user expects to keep uncommitted changes).
- **Resolved:** Prepare **does not** reset tracked state. It only cleans **untracked** (and optionally ignored) files via `run_git_clean_with_excludes`. Do not run `git checkout -- .` or `git restore .` in prepare unless a future config flag is added and documented. This avoids losing uncommitted work and keeps the contract simple. If REQUIREMENTS later require optional stash+reset, add a config flag and document order: stash → prepare (reset if enabled) → run → cleanup → stash pop (optional).

### 9.1.5 Where work_dir comes from

- In older code paths, **orchestrator** resolves `working_directory` via the legacy-named `get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)` helper (execution_engine / orchestrator path). Canonical implementation treats that as lane/attempt worktree selection before falling back to `config.project.working_directory`. In **app.rs** `execute_ai_turn`, `working_dir` is set to `std::env::current_dir()` -- i.e. process CWD, which may not be the configured project or selected execution workspace.
- **Recommendation:** Ensure prepare/cleanup use the same source as the execution request: for orchestrator-driven runs use the selected lane/attempt worktree or `config.project.working_directory`; for other flows (e.g. interview/wizard) either pass the same working_dir used for execution or document that cleanup is skipped when not using orchestrator workspace. Avoid using `current_dir()` for cleanup unless it is the intended workspace.

### 9.1.6 git clean exclude list

- `git clean -fd -e <pattern>` can exclude paths by pattern; multiple `-e` flags are allowed. The plan says "exclude list so `.puppet-master/` and allowlisted paths are never touched" but does not specify exact patterns (e.g. `-e '.puppet-master'`, `-e 'progress.txt'`, `-e 'AGENTS.md'`). Git's `-e` is a pattern (e.g. ignore pattern), not necessarily a path.
- **Recommendation:** Implement the single helper **DRY:FN:run_git_clean_with_excludes** (§4.7) that builds the command from the allowlist (DRY:DATA). Document the exact patterns there (or in `CLEANUP_EXCLUDE_PATTERNS`); test that excluded paths are never removed.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 9.1.7 Evidence retention: definition of "run"

- Section 6 uses **evidence.retain_last_runs** without defining what counts as a "run" (per iteration, per subtask, per task, global). Without a clear definition, pruning may remove evidence that is still relevant for the current run, node, lane, or attempt lineage.
- **Recommendation:** Define "run" in config/docs (e.g. one iteration, or one subtask completion) and how it is inferred from evidence paths or iteration logs; or prefer **retention_days** only until "run" is well-defined.

### 9.1.8 Clean workspace and active worktrees

- Section 7.2 says "Clean workspace now" runs cleanup "in the current workspace (and optionally in all active worktrees)". Implementing "all active worktrees" requires access to **worktree_manager** and **active_worktrees** (or equivalent) and iterating over them. The plan does not reference where this state lives (orchestrator vs app).
- **Recommendation:** In the implementation checklist, add: obtain worktree list from orchestrator or worktree_manager and run cleanup in each path; handle the case where orchestrator is not loaded (e.g. only clean main workspace).

### 9.1.9 Dry run / preview

- The plan does not mention a "dry run" or "preview" for the manual "Clean workspace" action. Users may want to see what would be removed before confirming.
- **Recommendation (optional):** Add a "Preview" or "Dry run" that lists paths that would be removed (e.g. `git clean -fd -n` plus explanation) and show that list in the confirmation dialog or a separate view.

### 9.1.10 Prepare failure policy

- If **prepare_working_directory** fails (e.g. not a git repo, permission error), the plan does not say whether the iteration is aborted or continues without prepare.
- **Resolved:** **Best-effort:** On failure (e.g. git check fails, or `run_git_clean_with_excludes` errors), log a warning and **continue** -- do not abort the iteration. The wrapper `run_with_cleanup` should catch prepare errors, log them, and proceed to `runner.execute(request)`. This avoids one bad repo or permission flake from blocking all runs. Document in AGENTS.md and in §4.8.

### 9.1.11 Worktree and .puppet-master location

- When using worktrees, the agent's cwd is the worktree path. The main repo's `.puppet-master/` may not exist inside the worktree (worktrees share .git but have their own working tree). So cleanup in the worktree path may only see untracked files in that tree; no need to exclude `.puppet-master/` inside the worktree if it is not there. The allowlist still matters for the main workspace; for worktrees, excluding `.puppet-master/` is harmless if absent.
- No change needed; note during implementation that worktree cleanup runs in the worktree root and allowlist semantics apply per directory.

### 9.1.12 Optional: concurrent runs

- If multiple orchestrator runs or tabs use the same project (or same worktrees), cleanup from one could affect another. The plan does not address this.
- **Recommendation:** Consider out of scope for v1, or add a short note that cleanup is best-effort and concurrent use may lead to races; avoid holding locks across cleanup if possible.

### 9.1.13 Critical: When to run workspace cleanup (orchestrator / commit order)

- **Current plan:** §4.3 says cleanup_after_execution "Run workspace cleanup in work_dir per policy (e.g. git clean -fd)". The call flow is: **run_with_cleanup** does prepare → execute → **cleanup** (immediately after the runner returns). The **orchestrator** then runs its legacy-named **commit_tier_progress** helper (add_all, commit) only after the iteration result is processed. So cleanup runs **before** the commit.
- **Problem:** If cleanup_after_execution runs `git clean -fd`, it would remove **all untracked files** in the workspace, including **new files the agent just created** (e.g. new source files, docs). Those files would be deleted before the orchestrator can stage and commit them. Result: loss of iteration output.
- **Fix:** **Do not run broad "git clean -fd" (untracked files) in cleanup_after_execution.** In that step, only: (1) kill/terminate process if still running, (2) clean **runner temp files** (e.g. context copy temp files). **Full workspace untracked cleanup** (git clean -fd with excludes) should run only in **prepare_working_directory** (before the run), so we remove the *previous* run's cruft, not the current run's output. Optionally in cleanup_after_execution we can remove only **known build-artifact dirs** (e.g. `target/`) if config says so, but never untracked source or docs. Document this in §4.2 and §4.3 and in the implementation.

ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002

### 9.1.14 Interview and orchestrator plan output locations

- **Interview:** The interview orchestrator writes to `output_dir` = `.puppet-master/interview/` (state, phase docs, requirements-complete.md, test-strategy, technology-matrix, AGENTS.md). Research engine writes to `.puppet-master/research/`. All under `.puppet-master/`, so already allowlisted. **No gap** as long as interview never writes final output to project root; if it does (e.g. a top-level REQUIREMENTS.md), that path must be allowlisted or cleanup must not run broad git clean in interview context.
- **Start chain / wizard:** Writes to `.puppet-master/start-chain/` (e.g. legacy-named `tier-plan.md`) and pipeline phase/task/subtask/iteration plans under paths derived from config. As long as those are under `.puppet-master/`, they are safe. If any start-chain or wizard output is written to project root, allowlist or skip broad cleanup for that flow.
- **Orchestrator / unit plans:** STATE_FILES.md places phase/task/subtask plans under `.puppet-master/plans/`. If the orchestrator or agents write unit plans there, they are safe. If an agent during an iteration writes a plan or doc to **repo root** (e.g. `PLAN.md`), it is untracked; with the fix in §9.1.13 we do not run git clean after execution, so that file would remain until the next prepare (or commit). So after the fix, we do not delete current-iteration output.
- **Recommendation:** Document that interview, start-chain, and orchestrator output locations should stay under `.puppet-master/` (or allowlisted paths) so cleanup never removes them. If any flow writes to project root by design, add that path or pattern to the allowlist.

### 9.1.15 Additional gaps and room for improvement

- **prd.json:** Ensure the allowlist (DRY:DATA) and `run_git_clean_with_excludes` exclude `prd.json` at project root; added to §3.6 and §4.7 table; §9.1.2 recommendation updated.
- **Config copy:** §7.1 previously said "cleanup.untracked" runs "after execution"; corrected to "before each run (in prepare_working_directory)". Implementors should wire the toggle to control only the **prepare** step, not cleanup_after_execution.
- **Manual "Clean workspace":** Should invoke prepare-style logic (git clean with excludes), not cleanup_after_execution; §7.2 clarified.
- **Checklist item 4.2-4.3:** The checklist says "cleanup_after_execution (... workspace cleanup with excludes)" -- implement only runner temp (and optional build-artifact dirs) in cleanup_after_execution; workspace cleanup with excludes is in prepare_working_directory only.

### 9.1.16 ExecutionEngine and CleanupConfig wiring

- **Gap:** ExecutionEngine currently has no access to run config or CleanupConfig. To use `run_with_cleanup`, the orchestrator (or whoever calls `execute_iteration`) must pass CleanupConfig into the execution path.
- **Concrete options:** (1) Add `cleanup_config: CleanupConfig` to `IterationContext` and have the orchestrator set it when building the context; (2) Add `cleanup_config: CleanupConfig` to ExecutionEngine at construction and pass it when creating the engine; (3) Use a thread-local or global "current run config" that ExecutionEngine reads (not recommended -- prefer explicit passing). Recommendation: (1) extend `IterationContext` with an optional `cleanup_config: Option<CleanupConfig>`; when building the context, the orchestrator fills it from the run config. ExecutionEngine then passes it to `run_with_cleanup`. If None, skip prepare/cleanup (backward compatible).
- **CleanupConfig default:** When `cleanup_config` is `None` or `unwrap_or_default()` is used, document the default: e.g. `CleanupConfig { untracked: true, clean_ignored: false, clear_agent_output: false, remove_build_artifacts: false }` so prepare runs untracked clean by default and we don't accidentally disable cleanup when config is missing.

### 9.1.17 ~~ExecutionEngine execute step is SDK fallback, not runner.execute only~~ (Resolved — SDK removed)

> **Note (2026):** `execute_with_sdk_fallback` has been removed. Execution is now always CLI via `runner.execute()`. The gap described below no longer applies; §8.2.4 has been updated accordingly.

- ~~**Gap:** `ExecutionEngine::execute_with_sdk_fallback` first tries `try_execute_with_sdk(request)`; only on failure does it call `runner.execute(request)`. So the "execute" step is **not** a single `runner.execute()` call--it can be SDK or runner. If we replace only `runner.execute(request).await` with `run_with_cleanup(&*runner, request, config).await`, then when the **SDK path** succeeds we would **never run prepare or cleanup** (because run_with_cleanup wouldn't be called).~~
- ~~**Resolved:** Do **not** use `run_with_cleanup` inside `execute_with_sdk_fallback`. Instead, in **execute_iteration** (or the caller of `execute_with_sdk_fallback`): (1) call `prepare_working_directory(&context.working_directory, &cleanup_config)` before the platform loop; (2) call `execute_with_sdk_fallback(...)` as today; (3) after it returns, call `cleanup_after_execution(0, &context.working_directory, &cleanup_config)`. So prepare and cleanup wrap the **entire** execution (SDK or CLI). `run_with_cleanup` remains for call sites that only do `runner.execute()` (research_engine, start_chain, app). Checklist 8.2.4 updated accordingly.~~

**Current state:** `execute_iteration` calls `runner.execute(request)` directly (always CLI). `prepare_working_directory` and `cleanup_after_execution` wrap it. `run_with_cleanup` is used at call sites that call `runner.execute()` (research_engine, start_chain, app). §8.2.4 updated accordingly.

### 9.1.18 Unwired features, GUI gaps, and implementation status (sweep)


Execution-affecting GUI settings must not remain GUI-only state.

Canonical rule:
- Option B runtime config construction at run start is the execution path for interview, orchestrator, and related execution-affecting settings
- any GUI field that changes runtime behavior must be projected into the run config snapshot
- GUI-visible but runtime-ignored fields are defects, not acceptable interim behavior

This includes, at minimum:
- interview question-limit settings
- interview architecture-confirmation and vision-provider settings
- HITL phase/task/subtask/iteration toggles
- other orchestrator execution-affecting settings already listed in the owning plans

Summary rule:
MiscPlan should summarize these as references to the owning SSOTs rather than restating an open-ended “wire later” status once the canonical behavior is fixed elsewhere.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md
### 9.1.19 Shortcuts: config load failure, key conflicts, and discoverability

- **Config load failure:** If the shortcuts section of GuiConfig is corrupted or invalid at load time, the app must not crash. **Recommendation:** Fall back to empty overrides, log a warning, show toast "Shortcuts reset to defaults due to config error", and build key map from defaults only (§7.11, §8.8.7). Wire this at app startup and when opening Config → Shortcuts.
- **Key already bound to another action:** When the user records a new shortcut that is already assigned to a different action, **recommend rejecting** with tooltip "Already used by &lt;ActionName&gt;" and not saving (§7.11). Alternative (steal binding) is implementation-defined if preferred.
- **Export/import versioning:** Export JSON must include a `version` field; reject imports with unsupported version and show clear error (§7.11). Document supported version(s) in code or STATE_FILES.md.
- **Tooltip when key map not loaded:** Before the key map is built (e.g. config not yet loaded), show action label only or "(Loading...)" where shortcut labels appear; never show blank or "(undefined)" (§7.11).

### 9.1.21 Skills: discovery, permissions, and runner wiring
Skills runtime behavior is canonicalized as registry discovery, permission filtering, readiness validation, context bundling, and on-demand `skill` tool access.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md

Runner implications:
- there is no MVP requirement to invent a separate provider-native skill runtime-delivery matrix for each provider.
- direct providers consume PM-native skill bundling and PM tool availability.
- CLI-bridged providers may receive compatibility projections only when explicitly enabled, but runtime correctness still depends on PM-native bundling plus the PM `skill` tool.
- server-bridged providers such as OpenCode remain subject to the same PM-native skill canon.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md
### 9.1.22 Shortcuts and Skills: implementation summary

**Known risks**

- **Slint key API:** Key event handling depends on Slint's key-event API (e.g. `FocusScope` `key-pressed` callback, `KeyEvent` struct). Behavior may differ by Slint version; implementer should confirm the integration point against Slint 1.15.1 docs and document it in the implementation plan.
- **Skill discovery on Windows path case:** Discovery paths (e.g. `.puppet-master/skills`, `.claude/skills`, `.agents/skills`) may behave differently on Windows (case-insensitivity, path separators). First-wins deduplication by name should account for case-normalization if needed.
- **platform_specs skill injection:** Each provider (Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, Gemini) receives the skill list through a versioned `platform_specs` injection contract that records platform_id, runner_id/runtime_identity, skill/package identity, injection timing, capability/permission boundary, environment/secret boundary, compatibility matrix, failure/fallback behavior, audit/evidence refs, override policy, and owner approval path. Runner integration must validate that contract before `list_skills_for_agent` injects skills.

**Before implementation plan**

- Confirm Slint key-event API (Slint 1.15.1): where key events are captured (window vs focused widget, via `FocusScope`) and how KeyMap is applied.
- Confirm platform_specs (or equivalent) documents skill injection for each platform so the implementation plan can wire `list_skills_for_agent` per runner.

---

## 10. Cross-Plan Dependencies and Impacts

This section ties the Misc Plan to **Plans/WorktreeGitImprovement.md**, **Plans/orchestrator-subagent-integration.md**, and **Plans/interview-subagent-integration.md**: what this plan depends on, what it impacts, and what else needs to be done so cleanup fits the rest of the system.

Cross-plan cleanup impact set:
- `Plans/FileSafe.md`, `Plans/WorktreeGitImprovement.md`, and `Plans/newtools.md` (`/FileSafe.md`, `/WorktreeGitImprovement.md`, `/newtools.md`) govern write-scope safety, side-effect repos, PM-managed worktree visibility, live-run artifacts, package-based lane pools, safe-point-aware sessions, lane-scoped evidence roots, project-root artifact paths, and ad-hoc runtime side effects.
- Routing owner docs already identified for cleanup reconciliation include `Plans/Contracts_V0.md`, `Plans/Crosswalk.md`, `/Contracts_V0.md`, and `/Crosswalk.md`.
- Cleanup lifecycle work depends on `Plans/Executor_Protocol.md`, `Plans/WorktreeGitImprovement.md`, and `Plans/orchestrator-subagent-integration.md` plus `/Executor_Protocol.md`, `/WorktreeGitImprovement.md`, and `/orchestrator-subagent-integration.md` aliases for execution, worktree, and subagent ownership.
- `Contracts_V0` and `Contracts_V0.md` provide `/alias` handling, but cleanup needs that discipline elevated into a command-catalog pattern before deprecated commands, recovery namespaces, and cleanup commands drift.
- Reconciliation cleanup covers Orchestrator retargeting from tiers to Seams and `/packages/graph`, Widget System hostability and `/persistence`, `/help` inventory expansion, UI command and route normalization, attention-center alignment, and consumer-doc cleanup for requested `/effective` identity fields.
- `orchestrator-subagent-integration` / `orchestrator-subagent-integration.md` is a consumer and `/worker-spawn` document over canonical runnable units, not a competing tier-era execution model.
- `Contracts_V0`, `Contracts_V0.md`, and `FileManager.md` split primitive shape ownership from file consumer `/realization`: file-backed document opening, `/tab/buffer` behavior, path validation, and path-target open behavior stay constrained by the owner contracts.
- per-subtask `/worktree` cleanup must not conflict with package-based lane pools: cleanup scope is selected from package-scoped lane/worktree ownership, and `FileSafe` write-scope rules stay package-scoped so cross-lane reuse cannot erase another package's live artifacts.
- Cleanup and restore flows are lane-aware. `revert-last-edit`, broad workspace cleanup, conflict worktrees, and safe-point restore require an explicit lane/worktree scope plus safe-point prerequisites before they can remove files, roll back state, or mark a lane cleanup complete.
- Export or archival status can make a live-retained object eligible for later cleanup, but it does not by itself authorize deletion of the canonical `/historical` record model or the `/worktree` lineage needed for recovery explanation.
- Cleanup reconciliation includes Orchestrator tab/page retargeting, Source Control versus Orchestrator surface cleanup, `/glossary` and `/help/view` expansion, stale consumer-doc requested and `/effective/runtime` identity cleanup, and `/search/attention/project-summary` alignment.
- Tier language is legacy decomposition/help terminology. Tier IDs and `/request-era` or tier-era state file names remain compatibility inputs only; worktrees, crews, agent coordination, route/open cleanup, blocked-identity cleanup, and runtime cleanup use node, lane, package, attempt, `/block/runtime-lineage`, and rewrite-era runtime identity instead.

### 10.1 WorktreeGitImprovement.md

**What the Worktree plan does:** Config wiring (Option B: build run config from GUI at run start), worktree create/merge/cleanup (of worktree *directories*), active_worktrees repopulation, git binary resolution, GitHub API PR creation wiring (no GitHub CLI), Branching tab GUI, Doctor worktrees check.

**Dependencies (MiscPlan depends on Worktree):**

- **Config wiring (Phase 1):** Cleanup config (cleanup.untracked, cleanup.ignored, cleanup.clear_agent_output, etc.) must live in the **same** config shape that the run receives. When implementing MiscPlan §7 (Cleanup UX & Config), add cleanup fields to that schema and ensure they are populated from the GUI (or file) the same way as other run settings. If Option B is not yet implemented, cleanup toggles in the GUI would not affect the run; implement Option B first or in parallel so cleanup config is wired.
- **Git binary resolution (Phase 3):** The Worktree plan introduces a shared helper for resolving the `git` executable: `path_utils::resolve_git_executable()`, used by both GitManager and Doctor. **MiscPlan's cleanup module** must use that same helper when running `git clean` (in `run_git_clean_with_excludes`). Do not use `Command::new("git")` alone; resolve the binary so cleanup works in environments where git is only in app-local or custom paths. See Worktree §3.1, §7.5.
- **Worktree list for "Clean workspace" (optional):** If implementing "Clean workspace now" for **all active worktrees** (§7.2), the list of worktrees must come from the same place as the orchestrator (e.g. `worktree_manager.list_worktrees()` and/or `active_worktrees`). Worktree plan §2.2 and §7.6 describe repopulation of active_worktrees; if that is not done, "clean all worktrees" may only clean the main workspace. Prefer implementing after or with Worktree Phase 2 so worktree list is reliable.

**Distinction:** Worktree plan's "cleanup" is **removing the worktree directory** after merge (`cleanup_subtask_worktree`, `remove_worktree`). MiscPlan's cleanup is **removing untracked/ignored files *inside* ** the workspace or worktree. Both apply: after an iteration, run MiscPlan's cleanup_after_execution in that worktree; when the subtask is done and merged, run Worktree's remove_worktree. No conflict.

**STATE_FILES.md:** Worktree plan adds a worktrees subsection under `.puppet-master/`; MiscPlan adds agent-output and possibly evidence retention. Both can update STATE_FILES in their own subsections.

### 10.2 orchestrator-subagent-integration.md

**What the Orchestrator plan does:** Subagent selection and invocation at Phase/Task/Subtask/Iteration, config-wiring validation, start/end verification (legacy-named `verify_tier_start`, `verify_tier_end`) at phase/task/subtask boundaries, quality verification (reviewer subagent, gate criteria), parallel execution with worktrees per subtask.

**Impacts (MiscPlan impacts Orchestrator):**

- **Single execution path:** All agent runs (main iteration and subagent runs) should go through the same prepare → execute → cleanup flow. When the orchestrator plan adds `execute_tier_with_subagents` or similar, that path must **use run_with_cleanup** (or the same prepare/execute/cleanup wrapper) so that both "main" iterations and subagent invocations get prepare_working_directory before run and cleanup_after_execution after run. Do not call `runner.execute()` directly from new orchestrator/subagent code; use the wrapper from MiscPlan §4.6.
- **Ordering with start/end verification:** Orchestrator plan's legacy-named `verify_tier_start` runs at Phase/Task/Subtask (and optionally Iteration) **entry**; `verify_tier_end` runs at Phase/Task/Subtask **completion**. MiscPlan's prepare/cleanup run at **iteration** boundaries (before and after each runner.execute). So the flow is: verify_tier_start (unit) -> ... -> prepare_working_directory (iteration) -> execute -> cleanup_after_execution (iteration) -> ... -> verify_tier_end (unit). No conflict; both apply. When implementing orchestrator start/end verification, keep iteration-level prepare/cleanup as defined in MiscPlan.
- **Parallel subtasks:** Each parallel subtask has its own worktree and working_dir. cleanup_after_execution runs in that subtask's work_dir only (per MiscPlan §3.3). Orchestrator plan's parallel execution (worktree per subtask) is compatible; no extra change needed.
- **Commit order:** The orchestrator calls its legacy-named `commit_tier_progress` helper **after** the iteration returns; run_with_cleanup runs cleanup **before** that. So cleanup_after_execution must not remove untracked files (§9.1.13); only runner temp files. Full workspace untracked clean runs in prepare_working_directory (before the run).

**Dependencies (MiscPlan depends on Orchestrator):** None. MiscPlan can be implemented first; orchestrator subagent integration should then wire its runner calls through run_with_cleanup.

### 10.3 interview-subagent-integration.md

**What the Interview plan does:** Subagent persona assignments per interview phase, research_engine enhancements (e.g. research_pre_question_with_subagent), prompt templates with subagent instructions, SubagentInvoker for platform-specific invocation, document generation and validation subagents.

**Impacts (MiscPlan impacts Interview):**

- **Research engine:** Interview plan adds or extends `research_pre_question_with_subagent` and similar. Whenever the interview flow calls the platform runner (e.g. `runner.execute(&request)` in research_engine or in subagent invocation), that call must go through **run_with_cleanup** so the interview working directory is prepared and cleaned the same way as orchestrator and start_chain. MiscPlan §4.6 already lists interview research_engine as a call site; when the interview plan adds subagent-based research, that new path must also use the wrapper (not raw runner.execute).
- **SubagentInvoker / platform invocation:** If the interview plan introduces a helper that builds a prompt and then runs the platform (e.g. for validation or research), that run should use run_with_cleanup so agent-left-behind files from interview runs are cleaned. Centralize on the single wrapper for all runner invocations from the interview flow.

**Dependencies (MiscPlan depends on Interview):** None. MiscPlan can be implemented first; interview subagent integration should then use run_with_cleanup for every runner call.

**Interview and orchestrator output:** Interview writes to `.puppet-master/interview/` and `.puppet-master/research/`; start-chain/wizard to `.puppet-master/start-chain/`; phase/task/subtask plans to `.puppet-master/plans/` (STATE_FILES). All are under `.puppet-master/` and thus allowlisted. When adding new output paths in the interview or orchestrator plans, keep them under `.puppet-master/` or add them to the cleanup allowlist so they are never removed (§9.1.14).

### 10.4 newfeatures.md

**Plans/newfeatures.md §13** (Bounded buffers and process isolation) requires that all subprocess output (runners, headless, stream consumers) use **bounded buffers** (fixed max size, drop oldest when full) and that the CLI always runs in a **separate process**. When implementing cleanup or any runner path, ensure we do not accumulate unbounded stdout/stderr; align with newfeatures §13 and document in AGENTS.md. **§2** (Background/async agents) defines output for background runs at `.puppet-master/agent-output/{run-id}/`; if that feature is implemented, the cleanup allowlist and optional "agent output" policy (§3.2, §5) should account for that path so background run output is preserved or cleared per policy.

### 10.5 Summary: what else needs to be done


| Plan | What to do so MiscPlan fits |
|------|-----------------------------|
| **WorktreeGitImprovement** | Implement Phase 1 (config wiring) so cleanup config is in the same run config; implement Phase 3 shared git binary resolution and use it in MiscPlan's run_git_clean_with_excludes; optionally Phase 2 (active_worktrees) for "Clean all worktrees." |
| **orchestrator-subagent-integration** | When adding subagent/iteration execution, use run_with_cleanup (MiscPlan) for every runner invocation; keep legacy-named verify_tier_start/verify_tier_end checks at phase/task/subtask boundaries and prepare/cleanup at iteration boundaries. |
| **interview-subagent-integration** | When adding research or subagent runs that call the platform runner, use run_with_cleanup so interview runs get the same prepare/cleanup behavior. |

---

## 10.5 Crews and Subagent Communication Enhancements for Cleanup Operations

Cleanup-operation crews, when used, must follow the current PM crew model.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

Rules:
- cleanup crews are optional overlays, not a separate persistent actor system.
- cleanup crew members remain PM child runs.
- crew coordination uses explicit shared state and crew-board messages when enabled.
- hidden memory files and active-agent side files are not canonical cleanup coordination state.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md
## 10.6 Lifecycle and Quality Enhancements for Cleanup Operations


Cleanup lifecycle and quality features must use canonical child-run and blocked-state contracts.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

Rules:
- blocked cleanup actions use canonical `blocked_reason_code` and `allowed_action_ids[]`.
- cleanup retries, reroutes, and cancellation preserve canonical lineage.
- cleanup continuity comes from canonical state and handoff reconstruction, not child-memory files.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Tools.md
## 11. References

- REQUIREMENTS.md §26 (Fresh Agent Enforcement, Runner Contract, Process Isolation Mechanics)
- STATE_FILES.md (§2 state hierarchy, evidence paths)
- AGENTS.md (evidence logs tracked; no blanket *.log; .puppet-master/ not ignored)
- Plans/WorktreeGitImprovement.md (worktree paths, config wiring, git binary resolution, Phase 1-3)
- Plans/orchestrator-subagent-integration.md (subagent execution, start/end verification, parallel worktrees)
- Plans/interview-subagent-integration.md (research engine, subagent invocation)
- [OpenCode Agent Skills](https://opencode.ai/docs/skills/) (SKILL.md format, discovery paths, frontmatter, permissions) -- reference for §7.8 and §7.10.
- Previous discussion: agent-left-behind docs, tests, artifacts, old builds; runner contract not implemented in Rust.

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** cargo check, cargo test (in puppet-master-rs).
 persists at cleanup operations; remediation loop runs when cleanup operations fail with recoverable errors.

**Cross-reference:** See orchestrator plan "Lifecycle and Quality Features" for full implementation details. See orchestrator plan "Puppet Master Crews" for how cleanup crews can coordinate workspace cleanup operations.

## 11. References

- REQUIREMENTS.md §26 (Fresh Agent Enforcement, Runner Contract, Process Isolation Mechanics)
- STATE_FILES.md (§2 state hierarchy, evidence paths)
- AGENTS.md (evidence logs tracked; no blanket *.log; .puppet-master/ not ignored)
- Plans/WorktreeGitImprovement.md (worktree paths, config wiring, git binary resolution, Phase 1-3)
- Plans/orchestrator-subagent-integration.md (subagent execution, start/end verification, parallel worktrees)
- Plans/interview-subagent-integration.md (research engine, subagent invocation)
- [OpenCode Agent Skills](https://opencode.ai/docs/skills/) (SKILL.md format, discovery paths, frontmatter, permissions) -- reference for §7.8 and §7.10.
- Previous discussion: agent-left-behind docs, tests, artifacts, old builds; runner contract not implemented in Rust.

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** cargo check, cargo test (in puppet-master-rs).

## Runner Preparation/Cleanup and Safe-Point Canonical Alignment (2026-03-08)

Any runner prepare/cleanup flow must respect runtime safe points and remediation lineage.

Required rule:
- prepare/cleanup logic must not erase or invalidate the baseline needed for `retry_from_safe_point`
- cleanup after failed runs must preserve enough state for scheduler/runtime recovery until the attempt is terminal or superseded
- temporary cleanup behavior must not collapse blocked/remediation states into generic failure cleanup
- `Plans/MiscPlan.md` / `/MiscPlan.md` cleanup states distinguish retained, cleanup_eligible, archived, and removed lane or `/worktree` states; `removed` is a backing-object or storage-presence state, while `revoked` is semantic validity state.
- Worktree plan cleanup removes worktree directories after merge or `/completion`; MiscPlan cleanup removes files inside a workspace or worktree. The `/state` model must separate lane lifecycle from cleanup actions.
- Runtime governance must preserve Architecture_Invariants, Architecture_Invariants.md, FileSafe.md, MiscPlan.md, `/crew`, `/failure`, run-scoped requested/effective snapshots, `/effective` identity, execution-role identity, graph-lock degradation boundaries, role-scoped account-pool contamination, attempt-scoped evidence retention, safe-point versus restore-point immutability, context_files write-scope constraints, remote side-effect integration, DAE enforcement, and silent-disable or bypass prevention.
- Normalized cleanup/run envelopes include `CLI_Bridged_Providers`, `CLI_Bridged_Providers.md`, `{ run_id, seq, type, payload }`, run_id, thread_id, attempt_id, node_id, snapshot IDs, remediation lineage, `/node/attempt/lineage`, `/event`, `/trust`, rewrite-era correlation, actor kind, effective account, switch reason, lane/worktree identity, and pressure/trust context.
- Live cleanup must never erase run, lane, or worktree lineage from `History`, `Ledger`, graph-linked inspection, or `/lane/worktree` records.
- Cleanup artifact boundaries are node-level, not tier-scoped; tier-era state file names such as `progress.txt`, `AGENTS.md`, and `prd.json` are compatibility inputs for `/cleanup`, not canonical scoping anchors.
- Sorting and `/grouping` defaults are explicit: `Seams` sort by most operationally problematic first, while `History` and `Ledger` sort newest first.
- Lane lifecycle verbs are separate: recover, archive, prune, remove, and `Clean all worktrees` must not blur together, and cleanup actions may expose prune or recover without implying remove.
- `persona_override_owner_id` requires owner-level cleanup so `tier_id` no longer teaches a canonical scope anchor.
- Cleanup command payloads with generic `page: string` or tier-bound filters must be constrained with native-surface ownership so they cannot undermine route/open or cleanup commands.

Acceptance criteria:
- runner cleanup and safe-point recovery are compatible
- remediation/retry lineage is not lost by generic cleanup routines
## Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)


Cleanup logic must not erase the data required to explain or resume blocked and retried work.

### Required rules
- keep safe-point metadata until the originating attempt lineage reaches terminal resolution
- keep remediation lineage metadata until the parent lineage is terminal
- cleanup may compact derived summaries, but must not destroy the canonical history needed for recovery explanation and audit

## Debug investigation instrumentation cleanup addendum (2026-03-23)

Temporary Debug instrumentation must preserve cleanup lineage and safe recovery behavior.

Required rules:
- before invasive instrumentation or temporary dependency/tooling changes, PM creates or updates a restore point backed by `runtime_artifact.restore_point` that is sufficient to revert the investigation's temporary state if cleanup fails
- every temporary debug mutation lane carries an `instrumentation_id`, declared scope, and explicit cleanup obligation
- cleanup must account for code instrumentation, temporary env flags, dev dependencies, remote host installs, browser mocks, and other reversible debug-only changes
- resolved, cancelled, and superseded investigations attempt cleanup automatically; failed cleanup transitions the investigation to `failed_cleanup` instead of pretending success
- unresolved instrumentation remnants must remain user-visible until cleaned up or explicitly accepted as follow-up work

### Investigation instrumentation lifecycle contract

Cursor-like Debug Mode remains an investigation workflow reference, not automatic MVP scope. `/blog`-sourced reference behavior is hypothesis-first: collect runtime evidence through temporary-instrumentation, local debug-server collection on the editor-side, reproduction, interpretation, small targeted patching, user re-verifies, and cleanup. The fit is regressions, timing `/races`, performance, and "reproduces but unclear from static read"; pure compile-time failures rely on build `/test` capture instead.

Instrumentation-first behavior is not grounded MVP behavior until this contract is implemented. Any temporary-instrumentation patch pipeline must declare an `instrumentation_id`, `collector_state` (`collector-state` in source-lineage/audit vocabulary), collector lifecycle transitions, the install/collect/remove sequence, debug-specific mutation rules, the evidence sink contract, and explicit write `/cleanup/rollback` semantics. Auto-cleanup is mandatory for resolved, cancelled, and superseded investigations; failed residue uses lifecycle `failed_cleanup` with `stop_reason_code = investigation.cleanup_failed`.

Cleanup is per-scope and per instrumentation lane, not just per investigation. A bundle-record must carry the cleanup_summary, including cleanup_summary.residual_items[] / residual_items, stop_reason_code, and any surviving residue. Cleanup state transitions use `superseded` when one owner supersedes another, and PM must not let two active investigations add overlapping temporary instrumentation to the same target.

Env/config activation cleanup must revert the exact temporary flag `/toggle/value` PM introduced. If the temporary change lived only in process env, cleanup occurs by stopping `/restarting` without that env. If PM edited `/config`, treat the edit under the same rollback rules as `temporary source patch instrumentation`.

Secret evidence handling must redact/hash obvious secrets `/tokens`, including `Authorization`, cookies, session IDs, API keys, passwords, private tokens, and other IDs before storage, export, or bundle handoff.

Debug-capable tooling remains shared: `Plans/Tools.md` / `Plans/newtools.md` (`/Tools.md` / `/newtools.md`) own reusable tool registry details and `/tags`, while this plan records the debug investigation roles: target discovery, evidence capture, instrumentation, verification, and bundle-export.

Debugger `/profiler` attach instrumentation must detach the temporary attach/profiler `/session`; if detach fails but no durable workspace mutation remains, keep the failure localized to runtime/session state and do not claim cleanup success.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/MiscPlan.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### M-002 - Cleanup Artifact Event Architecture Alignment

```yaml
plan_unit_id: M-002
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup actions, retained artifacts, evidence, and manual Clean workspace activity are first-class artifacts/events in the unified event model, with redb carrying retention policy, retention metadata, and rollups while cleanup boundaries align to patch/apply/verify/rollback rather than UI-only affordances.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_event_storage_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_artifact_event_architecture_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0003
preserved_exact_tokens:
- cleanup actions
- retained artifacts
- evidence
- first-class **artifacts/events**
- seglog ledger
- cleanup and evidence events
- redb
- retention policy
- last cleanup time
- evidence count per run
- patch/apply/verify/rollback pipeline
- not UI-only affordances
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact behavior while storage-plan.md owns seglog/redb storage mechanics and rewrite-tie-in-memo.md owns rewrite alignment.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-003 - Cleanup Backend Implementation Order

```yaml
plan_unit_id: M-003
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: 'Cleanup implementation proceeds in DRY-friendly order: create src/cleanup, centralize the allowlist and run_git_clean_with_excludes, implement prepare and cleanup functions, add the run_with_cleanup wrapper and call-site adoption, then add agent-output, evidence pruning, and manual Clean workspace behavior.'
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_sequence_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_backend_implementation_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0003
preserved_exact_tokens:
- Suggested implementation order
- src/cleanup/
- allowlist
- DRY:DATA
- run_git_clean_with_excludes
- DRY:FN
- prepare_working_directory
- cleanup_after_execution
- run_with_cleanup
- AGENTS.md
- config toggles
- Cleanup UX
- Agent-output dir
- evidence pruning
- manual "Clean workspace" action
- Cross-plan
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-004 - Cleanup UX Copy And Widget Reuse Gates

```yaml
plan_unit_id: M-004
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup UX changes use existing widgets, provide Expert and ELI5 copy variants for authored tooltip/help/discoverability copy, let app-level Interaction Mode choose the displayed variant, and keep Chat ELI5 separate and chat-only.
gui_related: true
gui_classification_reason: The unit covers user-visible cleanup configuration, confirmation, tooltip, or interaction behavior.
split_recommended: true
depends_on:
- M-003
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_gui_copy_widget_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_ux_copy_widget_reuse_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
preserved_exact_tokens:
- Cleanup UX
- config toggles
- existing widgets
- Expert and ELI5 variants
- Plans/FinalGUISpec.md §7.4.0
- App-level **Interaction Mode (Expert/ELI5)**
- Chat ELI5
- chat-only
- docs/gui-widget-catalog.md
- scripts/generate-widget-catalog.sh
- scripts/check-widget-reuse.sh
- styled_button
- confirm_modal
- toggler
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-005 - Target Project AGENTS DRY Seeding Handoff

```yaml
plan_unit_id: M-005
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Target project AGENTS.md may be seeded with DRY Method and technology/version constraints from the interview, but implementation ownership remains with interview-subagent-integration.md §5.1 and agents_md_generator.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: target_agents_handoff_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: target_project_agents_dry_seeding_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0008
preserved_exact_tokens:
- Target-project DRY
- interview-seeded
- AGENTS.md
- DRY Method
- Technology & version constraints
- Stack conventions
- React 18
- Pydantic v2
- critical-first block
- ~150-200 lines
- linked docs
- two-tier structure
- agents_md_generator
- preserving the DRY section
- overwrite vs. merge
negative_constraints: []
compatibility_only_notes:
- This is a handoff/consumer PlanUnit; it must not duplicate the Interview plan implementation owner.
stale_retired_dispositions: []
owner_boundary_notes:
- MiscPlan records cleanup-adjacent DRY guidance, while Plans/interview-subagent-integration.md §5.1 and agents_md_generator own target-project AGENTS.md generation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-006 - Cleanup Protection And Allowlist Policy

```yaml
plan_unit_id: M-006
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup never removes state files, .puppet-master except explicitly allowed pruning, config/discovery paths, .gitignore, sensitive credential patterns, or the headless GUI evidence path; agent-output may be cleared only by policy while preserving the rest of .puppet-master.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: destructive_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_protection_allowlist_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0017
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0023
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- progress.txt
- AGENTS.md
- prd.json
- STATE_FILES.md
- .puppet-master/
- .puppet-master/config.yaml
- .puppet-master/capabilities/
- .puppet-master/plans/
- .gitignore
- .env
- .env.*
- '*.env'
- '*.pem'
- '*.key'
- '*.crt'
- '*.p12'
- .ssh/
- .ssh/*
- .puppet-master/evidence/gui-automation/
- .puppet-master/agent-output/
- CLEANUP_EXCLUDE_PATTERNS
- cleanup_exclude_patterns()
negative_constraints:
- Cleanup must not remove state files, .puppet-master except explicit pruning, .gitignore, or sensitive credential paths.
- No cleanup caller may hardcode a divergent allowlist.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-007 - Assistant Worktree Cleanup Controls And Persistence UX

```yaml
plan_unit_id: M-007
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Assistant-owned worktrees identified by owner_thread_id are persistent by default; chat header Remove, thread delete, Source Control row Remove, Doctor orphan cleanup, app uninstall, and completed-thread behavior each have explicit cleanup semantics and confirmations.
gui_related: true
gui_classification_reason: The unit covers user-visible cleanup configuration, confirmation, tooltip, or interaction behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: assistant_worktree_cleanup_controls_persistence_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0014
preserved_exact_tokens:
- owner_thread_id
- persistent by default
- User clicks Remove in chat header dropdown
- confirmation dialog
- dirty
- branching.assistant_worktree_cleanup_default
- ask
- keep
- remove
- Source Control worktree row
- thread-bound
- Force-remove via Doctor
- orphan cleanup
- App uninstall
- Completed threads
- merge
- create PR
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-008 - Cleanup Workspace Scope Isolation

```yaml
plan_unit_id: M-008
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup runs only in the actual selected main repo, worktree, lane, attempt workspace, or worktree path used by the agent, and must not clean the main working tree for artifacts owned by another lane, attempt, or worktree.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-007
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_worktree_data_loss
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_workspace_scope_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0014
preserved_exact_tokens:
- paths.workspace
- configured project root
- worktree
- lane
- attempt-specific working directory
- selected path only
- must not clean the main working tree
- another lane, attempt, or worktree
- same directory the agent used
negative_constraints:
- Cleanup must not clean artifacts owned by another lane, attempt, or worktree.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-009 - Cleanup Mode Configuration And Conservative Defaults

```yaml
plan_unit_id: M-009
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup supports conservative, moderate, and configurable modes, with operator-controlled untracked, clean_ignored, clear_agent_output, remove_build_artifacts, and skip_prepare_for_conversation fields and conservative defaults that avoid aggressive cleanup unless configured.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_config_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_mode_configuration_conservative_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- Option A -- Conservative
- Option B -- Moderate
- Option C -- Configurable
- cleanup.untracked
- cleanup.ignored
- clean_ignored
- clear_agent_output
- remove_build_artifacts
- skip_prepare_for_conversation
- 'Default: conservative'
- git clean -fd
- git clean -fdx
- CleanupConfig
negative_constraints:
- Ignored-file cleanup must run only when configured.
- Cleanup defaults must avoid aggressive deletion.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-010 - Cleanup DRY Module And Reuse Registry

```yaml
plan_unit_id: M-010
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The src/cleanup module owns cleanup policy and execution; reusable cleanup functions, helpers, and data are DRY-tagged, parent module declaration is explicit, and pre-implementation checks prevent duplicate cleanup logic.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: duplicate_cleanup_logic_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_dry_module_reuse_registry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
preserved_exact_tokens:
- DRY Method
- single implementation
- src/cleanup/
- src/cleanup/mod.rs
- src/cleanup/workspace.rs
- pub mod cleanup
- DRY:FN
- DRY:DATA
- DRY:HELPER
- cleanup_allowlist()
- CLEANUP_EXCLUDE_PATTERNS
- prepare_working_directory
- cleanup_after_execution
- run_git_clean_with_excludes
- run_with_cleanup
- grep `DRY:`
- no duplicate allowlist or git-clean logic
negative_constraints:
- Runners and call sites must not reimplement git clean or allowlist logic.
- Call sites must not hardcode exclude lists.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-011 - Gitignore Sensitive File And No Secrets Safety

```yaml
plan_unit_id: M-011
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Git operations respect .gitignore, never introduce git add -f for paths that could be secrets, optionally guard staged sensitive files, and never log, commit, capture in evidence, or include in GitHub content tokens, keys, or credential file contents.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: no_secrets_safety_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: gitignore_sensitive_file_no_secrets_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0017
preserved_exact_tokens:
- respect .gitignore
- git add -A
- GitManager::add_all
- Do not introduce `git add -f`
- force-add
- sensitive pattern
- .env
- '*.pem'
- '*.key'
- No secrets in logs, evidence, or GitHub
- GH_TOKEN
- GITHUB_TOKEN
- 'Authorization: Bearer'
- GitHub HTTPS API
- OAuth device-code
- OS credential store
- tier metadata
- file lists
- acceptance criteria
negative_constraints:
- Do not introduce git add -f for paths that could be secrets.
- Do not log, commit, include in evidence, or include in PR content tokens, keys, or credential file contents.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-012 - Git Clean Helper And Git Binary Resolution

```yaml
plan_unit_id: M-012
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: run_git_clean_with_excludes is the only git-clean helper, reads cleanup_exclude_patterns from the cleanup module, emits one -e per exclude pattern, uses shared git binary resolution, and is called only by prepare_working_directory or manual Clean workspace.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-010
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: git_clean_helper_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: git_clean_helper_git_binary_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- DRY:FN:run_git_clean_with_excludes
- 'pub async fn run_git_clean_with_excludes(work_dir: &Path, clean_untracked: bool, clean_ignored: bool) -> Result<()>'
- cleanup_exclude_patterns()
- CLEANUP_EXCLUDE_PATTERNS
- one `-e <pattern>` per entry
- git clean -fd
- git clean -fdx
- clean_untracked
- clean_ignored
- path_utils::resolve_executable("git")
- resolve_git_executable()
- Command::new("git")
- prepare_working_directory
- manual "Clean workspace" action
negative_constraints:
- run_git_clean_with_excludes must not accept an allowlist parameter.
- Do not hardcode Command::new("git") as sufficient.
- cleanup_after_execution must not call run_git_clean_with_excludes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-013 - Prepare Working Directory Semantics

```yaml
plan_unit_id: M-013
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: prepare_working_directory performs a best-effort git repo check, skips rather than fails non-repo or git-unavailable cases, does not reset tracked files without a future explicit config, runs broad untracked cleanup only before execution, and may clear agent-output in prepare.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-009
- M-012
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prepare_working_directory_semantics_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: prepare_working_directory_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- prepare_working_directory
- git rev-parse --show-toplevel
- not a git repo or git unavailable
- skipping git clean
- git checkout -- .
- git restore .
- Do **not** run
- untracked cleanup
- before the run
- cleanup.clear_agent_output
- agent-output
- Prepare completed
- Prepare skipped
negative_constraints:
- Do not run git checkout -- . or git restore . in prepare unless a future config flag is added and documented.
- Broad untracked cleanup must run before execution, not after execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-014 - Cleanup After Execution Semantics

```yaml
plan_unit_id: M-014
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: cleanup_after_execution terminates the process if needed, removes runner temp files, may remove known build-artifact directories by config, and must not run broad untracked cleanup after execution because that would delete current-run outputs before commit.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-009
- M-012
- M-013
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_after_execution_semantics_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_after_execution_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- cleanup_after_execution
- Kill / terminate process
- pid > 0
- SIGTERM
- runner temp files
- context copy temp
- Do **not** run broad "git clean -fd"
- untracked
- orchestrator commits tier progress after the runner returns
- target/
- remove_build_artifacts
- Cleanup completed
negative_constraints:
- cleanup_after_execution must not run broad untracked cleanup.
- cleanup_after_execution must not remove current-run untracked source or docs before commit.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-015 - Run With Cleanup Wrapper And Call Site Adoption

```yaml
plan_unit_id: M-015
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The canonical implementation uses run_with_cleanup around runner.execute; orchestrator, research, and start-chain paths must adopt it, conversation is optional/project-aware, config is passed into execution paths, and PlatformRunner keeps only execute with earlier trait-extension wording retained as compatibility lineage.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: run_with_cleanup_call_site_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: run_with_cleanup_wrapper_call_site_adoption
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0022
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
preserved_exact_tokens:
- runner.execute()
- prepare and cleanup
- ExecutionEngine::execute_iteration
- core/execution_engine.rs
- interview/research_engine.rs
- start_chain/prd_generator.rs
- requirements_interviewer.rs
- architecture_generator.rs
- multi_pass_generator.rs
- app.rs
- execute_ai_turn
- Option B
- run_with_cleanup
- PlatformRunner
- Do **not** add `prepare_working_directory` or `cleanup_after_execution` to `PlatformRunner`
- execute_with_sdk_fallback has been removed
negative_constraints:
- Call sites must not duplicate prepare/cleanup logic.
- PlatformRunner must keep only execute; earlier trait-extension wording is compatibility lineage superseded by wrapper-only guidance.
compatibility_only_notes:
- Earlier trait-extension wording in §4.1 and §4.7 is retained as compatibility lineage but is superseded by the wrapper-only rule in §4.8.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-016 - Agent Output Directory And Prepare Time Clearing

```yaml
plan_unit_id: M-016
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: .puppet-master/agent-output/ is the disposable scratch area; its path is DRY data, optional run subdirectories may be used, contents may be cleared only in prepare_working_directory, and STATE_FILES.md plus AGENTS.md document the behavior.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-006
- M-013
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: agent_output_directory_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: agent_output_directory_prepare_time_clearing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0027
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0028
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0029
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0030
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0031
preserved_exact_tokens:
- .puppet-master/agent-output/
- agent-output/run-<session_id>/
- DRY:DATA
- AGENT_OUTPUT_SUBDIR
- 'pub const AGENT_OUTPUT_SUBDIR: &str = "agent-output"'
- 'pub fn agent_output_dir(base: &Path) -> PathBuf { base.join(".puppet-master").join(AGENT_OUTPUT_SUBDIR) }'
- prepare_working_directory
- cleanup.clear_agent_output
- do not remove the directory itself
- STATE_FILES.md
- AGENTS.md
negative_constraints:
- Agent output from the current run must not be deleted in cleanup_after_execution before commit.
- Do not remove the agent-output directory itself when clearing contents.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-017 - Evidence Retention And Pruning Backend

```yaml
plan_unit_id: M-017
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Evidence lifecycle aligns to seglog and redb; retention is configurable by days or runs, pruning is scheduled/manual and outside the hot cleanup_after_execution path, and current or in-progress run evidence must not be deleted when feasible.
gui_related: false
gui_classification_reason: The unit covers backend cleanup, retention, security, storage, or execution-contract behavior rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-002
- M-006
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through this fine-grained MiscPlan PlanUnit instead of broad M-001 source-preserving coverage.
- Exact tokens, examples, ContractRefs, negative constraints, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_retention_pruning_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: evidence_retention_pruning_backend
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0032
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0034
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0035
preserved_exact_tokens:
- .puppet-master/evidence/
- seglog
- redb
- 'evidence.retention_days: Option<u32>'
- 'evidence.retain_last_runs: Option<u32>'
- 'evidence.prune_on_cleanup: bool'
- 'pub async fn prune_evidence_older_than(base_dir: &Path, config: &EvidenceRetentionConfig) -> Result<PruneResult>'
- retention_days
- retain_last_runs
- removed items
- current prd.json
- progress.txt
- Do not block the main iteration path
negative_constraints:
- Evidence pruning must not delete evidence for the current run or recent runs still in progress when feasible.
- retain_last_runs semantics must be defined before relying on run-based pruning.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/artifact/retention behavior while referenced owner docs keep their ContractRef boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source window contains multiple separable cleanup, security, DRY, GUI, and retention concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### M-018 - Evidence Pruning Documentation Notices

```yaml
plan_unit_id: M-018
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Evidence retention and pruning documentation must tell users that evidence can be pruned and must warn agents not to rely on very old evidence paths.
gui_related: false
gui_classification_reason: The unit covers documentation and evidence-retention policy rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-017
unblocks: []
acceptance_criteria:
- STATE_FILES.md documents retention behavior, that evidence may be pruned, and the config controlling that retention.
- AGENTS.md notes that evidence can be pruned and agents should not rely on very old evidence paths.
- The covered source spans remain losslessly available for exact-text audit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_docs_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: evidence_pruning_documentation_notices
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0036
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0040
preserved_exact_tokens:
- STATE_FILES.md
- AGENTS.md
- evidence may be pruned
- agents should not rely on very old evidence paths
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup/evidence documentation obligations while referenced docs own their final prose.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The covered documentation notice is narrow enough for a single unit.
```

### M-019 - Cleanup Evidence Config Schema And Defaults

```yaml
plan_unit_id: M-019
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup and evidence settings must be modeled in one run/config schema with deterministic defaults and must be projected from the same GuiConfig/config path used by the rest of the app.
gui_related: false
gui_classification_reason: The unit covers backend config schema and run-config projection rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-009
- M-013
- M-017
unblocks: []
acceptance_criteria:
- A single config shape owns cleanup and evidence fields; no cleanup-only config schema is introduced.
- Runtime config includes cleanup.untracked, cleanup.ignored or clean_ignored, cleanup.clear_agent_output, cleanup.remove_build_artifacts, evidence.retention_days, evidence.retain_last_runs, and evidence.prune_on_cleanup.
- The YAML example and Rust CleanupConfig tokens remain traceable to the original source.
- Cleanup config is populated from the same place as enable_parallel and branching.base_branch.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_config_schema_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_evidence_config_schema_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0038
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0041
preserved_exact_tokens:
- cleanup.untracked
- cleanup.ignored
- cleanup.clear_agent_output
- cleanup.remove_build_artifacts
- evidence.retention_days
- evidence.retain_last_runs
- evidence.prune_on_cleanup
- 'cleanup:'
- 'clean_ignored: false'
- 'retention_days: null'
- 'retain_last_runs: null'
- 'prune_on_cleanup: false'
- 'CleanupConfig { untracked: bool, clean_ignored: bool, clear_agent_output: bool, remove_build_artifacts: bool }'
- 'skip_prepare_for_conversation: bool'
- enable_parallel
- branching.base_branch
negative_constraints:
- Do not introduce a separate cleanup-only config shape.
- Broad untracked cleanup remains prepare_working_directory-only, not cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement.md remains the referenced owner for Option B config wiring details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source spans mix GUI placement and backend schema; this unit owns only the schema/default/projection behavior.
```

### M-020 - Advanced Cleanup Controls Placement And Widget Reuse

```yaml
plan_unit_id: M-020
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup and evidence controls must be visible inside the existing Advanced config surface, preferably as a Workspace / Cleanup subsection, using existing GUI catalog widgets and the same GuiConfig projection path as other run settings.
gui_related: true
gui_classification_reason: The unit defines user-visible Config/Advanced controls, toggles, inputs, buttons, and widget reuse.
split_recommended: true
depends_on:
- M-019
unblocks: []
acceptance_criteria:
- Config remains an 8-tab surface unless Advanced becomes too crowded enough to justify the documented ninth-tab fallback.
- The recommended placement is Advanced -> Workspace / Cleanup with cleanup/evidence toggles and optional worktree cleanup controls.
- The UI uses existing widgets from docs/gui-widget-catalog.md and runs catalog checks after widget changes.
- GUI controls map into CleanupConfig and evidence retention config through the shared run-config build path.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_ux_placement_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: advanced_cleanup_controls_placement_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0038
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0042
preserved_exact_tokens:
- 8-tab
- Advanced
- Workspace / Cleanup
- Clean untracked before run
- Clean ignored files
- Clear agent-output dir
- Remove build artifacts after run
- Evidence retention (days)
- Clean all worktrees
- CleanupGuiConfig
- EvidenceRetentionGuiConfig
- GuiConfig
- styled_button
- confirm_modal
- page_header
- refresh_button
- scripts/generate-widget-catalog.sh
- scripts/check-widget-reuse.sh
negative_constraints:
- Do not create a cleanup-only config file.
- Do not create a cleanup-only tab unless the documented Advanced-crowding fallback is intentionally selected.
compatibility_only_notes:
- The documented ninth tab is a fallback, not the preferred canonical placement.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MiscPlan.md owns cleanup UX requirements; FinalGUISpec and UI catalog docs own final widget implementation conventions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Source spans combine placement, widgets, project-context safety, and cross-plan alignment; this unit owns placement/widget reuse only.
```

### M-021 - Manual Clean Workspace Action And Project Context

```yaml
plan_unit_id: M-021
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Clean workspace now must run prepare-style workspace cleanup for the intended project path, with confirmations, optional dry-run/evidence pruning, clear feedback, and disabled-state safety when no project context exists.
gui_related: true
gui_classification_reason: The unit defines user-visible manual cleanup actions, confirmation modals, previews, tooltips, toasts, and disabled states.
split_recommended: true
depends_on:
- M-013
- M-017
- M-020
unblocks: []
acceptance_criteria:
- Doctor or Config exposes Clean workspace now as a button or command.
- The action runs the same untracked cleanup as prepare_working_directory, such as run_git_clean_with_excludes with allowlist, not cleanup_after_execution.
- Clean ignored and prune evidence paths require explicit confirmation.
- The project root is resolved from the same source as the run; std::env::current_dir() is not used unless it is the intended project.
- Missing project context disables the action with an explanatory tooltip and prevents accidental CWD cleanup.
- Optional preview uses git clean -fd -n and post-clean feedback reports cleaned count or nothing to clean.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: destructive_clean_wrong_project
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: manual_clean_workspace_action_project_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0040
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0042
preserved_exact_tokens:
- Clean workspace now
- run_git_clean_with_excludes
- cleanup_after_execution
- 'Remove untracked and ignored files in workspace?'
- 'Removes agent-left-behind untracked files and optional temp dirs; does not remove .puppet-master/ or state files.'
- current_project.path
- discover_config_path(Some(hint))
- gui_config.project.working_directory
- 'std::env::current_dir()'
- 'Select a project or open a config to clean.'
- git clean -fd -n
- 'Cleaned N files/dirs'
- 'Nothing to clean.'
negative_constraints:
- The manual action must not run in an accidental process CWD.
- The manual action must not behave like cleanup_after_execution when broad untracked cleanup is intended.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Doctor and Config may host the action, but the cleanup semantics stay owned by the shared cleanup implementation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source spans mix control placement, project-root safety, preview, and docs; this unit owns the manual action and safety path.
```

### M-022 - Cleanup Cross-Plan UI And Source-Control Boundaries

```yaml
plan_unit_id: M-022
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup GUI wiring must align with Worktree, Orchestrator, Interview, Providers, and Source Control owner surfaces without collapsing per-project, per-worktree, or historical lineage state into a single global cleanup pool.
gui_related: true
gui_classification_reason: The unit governs user-visible cleanup/worktree/source-control grouping, labels, layout boundaries, and provider-readiness surface alignment.
split_recommended: true
depends_on:
- M-020
- M-021
unblocks: []
acceptance_criteria:
- Cleanup and evidence toggles are added to the same GuiConfig and Option B run-config build described by the Worktree plan.
- Cleanup UI does not conflict with Orchestrator Advanced layout, Interview GUI gaps, or Providers readiness state.
- Source Control grouping preserves terminal widget IDs, /hostability, worktree /controls, /filtering, lane binding, and historical lineage requirements.
- Cleanup state remains partitioned by project/worktree context instead of one global pool.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_cleanup_ui_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_cross_plan_ui_source_control_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0042
preserved_exact_tokens:
- Worktree plan
- Option B
- Orchestrator plan
- Interview plan
- Providers surface alignment
- Source Control grouping
- /hostability
- /controls
- /filtering
- source-control lane binding
- historical lineage preservation
- scale-safe partitioning
negative_constraints:
- Do not collapse all cleanup state into one global pool.
- Do not treat Source Control lineage and lane binding as cosmetic polish.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Referenced owner docs retain final authority for their surfaces; this unit records MiscPlan cleanup integration constraints.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit spans multiple owner surfaces and should be routed with owner-doc evidence during implementation planning.
```

### M-023 - Platform CLI Capability Non-Dependency

```yaml
plan_unit_id: M-023
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Platform hooks, skills, plugins, extensions, and MCP integrations can complement cleanup and agent context, but Puppet Master prepare/cleanup remains an internal run_with_cleanup responsibility and is not dependent on provider-native extension mechanisms.
gui_related: false
gui_classification_reason: The unit defines provider/runtime architecture and optional integration stance rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
- M-015
unblocks: []
acceptance_criteria:
- prepare_working_directory and cleanup_after_execution are implemented internally and invoked via run_with_cleanup around runner.execute().
- Provider-specific hooks, plugins, extensions, skills, and MCP servers are optional compatibility helpers only.
- Cleanup and evidence are not exposed as MCP tools in the current plan.
- Optional future clean_workspace MCP exposure remains out of scope until explicitly planned.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: provider_hook_dependency_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: platform_cli_capability_non_dependency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0043
preserved_exact_tokens:
- prepare_working_directory
- cleanup_after_execution
- run_with_cleanup
- runner.execute()
- hooks
- skills
- plugins
- extensions
- MCP servers
- clean_workspace
- out of scope
- platform_specs
- AGENTS.md
negative_constraints:
- Puppet Master must not rely on platform-specific hooks or scripts for core workspace cleanup.
- Cleanup and evidence are not MCP tools in the current plan.
compatibility_only_notes:
- A Puppet Master-authored skill or optional user hook can document cleanup expectations for users running CLIs outside Puppet Master.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider capability details remain aligned with orchestrator-subagent-integration and platform_specs.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source span includes bootstrap copy, which is isolated in M-024; this unit covers the provider non-dependency stance.
```

### M-024 - Provider Bootstrap Trust Copy

```yaml
plan_unit_id: M-024
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cursor provider bootstrap/trust status copy must preserve the exact title and subtext specified by the source span.
gui_related: true
gui_classification_reason: The unit preserves user-visible bootstrap/trust copy.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The Cursor trust title is exactly Workspace trust required.
- The Cursor trust subtext is exactly Cursor CLI is signed in, but this workspace must be trusted before all tools and MCP servers are available.
- The covered source span remains losslessly available for exact-text audit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: bootstrap_trust_copy_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: provider_bootstrap_trust_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0043
preserved_exact_tokens:
- Workspace trust required
- Cursor CLI is signed in, but this workspace must be trusted before all tools and MCP servers are available
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Provider bootstrap ownership remains with provider/runtime owner docs; MiscPlan preserves exact copy lineage.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The copy requirement is narrow enough for one unit.
```

### M-025 - Shortcuts GUI Surface Defaults And Edit Flow

```yaml
plan_unit_id: M-025
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: A Shortcuts GUI surface must show the complete default shortcut table, current bindings, change/double-click edit flow, reset controls, persistence, widget reuse, and immediate reflection of the active key map.
gui_related: true
gui_classification_reason: The unit defines a user-visible Shortcuts screen, list/table behavior, edit flow, reset controls, and copyable labels.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Users can open the Shortcuts surface from Config, Advanced, Shortcuts, Settings, or Preferences according to the single canonical UI location selected by implementation.
- The surface lists all actions and current bindings from the default/override key map.
- Users can change bindings via Change or double-click and can reset per action or reset all.
- Shortcut keys are selectable/copyable and use existing widget-catalog widgets.
- Changes persist through the same Config/GuiConfig surface and take effect immediately after save.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_surface_registry_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_gui_surface_defaults_edit_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0044
preserved_exact_tokens:
- Desktop Shortcuts (GUI screen)
- Config -> Advanced -> Shortcuts
- Config -> Shortcuts
- Settings / Preferences
- GuiConfig
- selectable_label
- selectable_label_mono
- Ctrl+A
- Ctrl+E
- Ctrl+B
- Ctrl+F
- Alt+B
- Alt+F
- Ctrl+D
- Ctrl+K
- Ctrl+U
- Ctrl+W
- Alt+D
- Ctrl+T
- Ctrl+G
- Move to start of current line
- Move to end of current line
- Move cursor back one character
- Move cursor forward one character
- Move cursor back one word
- Move cursor forward one word
- Delete character under cursor
- Kill to end of line
- Kill to start of line
- Kill previous word
- Kill next word
- Transpose characters
- Cancel popovers / abort running response
negative_constraints:
- The implementation must choose one canonical UI location for Shortcuts.
- The GUI must not show a shortcut list disconnected from the active key map.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- FinalGUISpec and UI_Command_Catalog own final surface composition and widget conventions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source span also defines backend data flow and error handling, which are split into M-026 and M-027.
```

### M-026 - Shortcut Registry Backend And Key Map Rebuild

```yaml
plan_unit_id: M-026
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcut handling must use a single registry of actions/defaults, serializable KeyBinding overrides in GuiConfig, a DRY build_key_map merge function, platform-aware display/mapping, and deterministic rebuild/install timing for all focusable text areas.
gui_related: true
gui_classification_reason: The unit defines backend shortcut data used by GUI key handling and user-visible text-input behavior.
split_recommended: true
depends_on:
- M-025
unblocks: []
acceptance_criteria:
- ShortcutAction and KeyBinding types exist for every default shortcut action.
- default_shortcuts() is the single source of truth and is tagged DRY:DATA:default_shortcuts.
- GuiConfig.shortcuts or keyboard_shortcuts stores overrides only.
- build_key_map(default_shortcuts(), gui_config.shortcuts) rebuilds app key handling at startup, after edit/reset, and after successful import.
- Slint key events in composer, chat input, interview text fields, config text inputs, wizard prompts, and other focusable text areas consult the active key map.
- Unit tests cover default/override merge, validation, and round-trip behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_keymap_serialization_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_registry_backend_key_map_rebuild
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- ShortcutAction
- KeyBinding
- default_shortcuts()
- GuiConfig.shortcuts
- keyboard_shortcuts
- build_key_map(defaults, overrides) -> KeyMap
- build_key_map(default_shortcuts(), gui_config.shortcuts)
- DRY:DATA:shortcut_actions
- DRY:DATA:default_shortcuts
- DRY:FN:build_key_map
- DRY:FN:validate_shortcut_binding
- FocusScope
- key-pressed
- App::key_map
- MoveToLineStart
- '"Ctrl+A"'
- '{ "modifiers": ["ctrl"], "key": "A" }'
negative_constraints:
- Key handling must not use hardcoded shortcut bindings outside the shared registry/key map.
- A separate shortcuts file is not used unless design explicitly mandates it.
compatibility_only_notes:
- KeyBinding serialization must remain backward-compatible if the format changes later.
stale_retired_dispositions: []
owner_boundary_notes:
- Slint wiring details belong to the GUI implementation surface, but the shortcut registry remains a shared backend/UI contract.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The unit bridges backend registry and GUI event routing; conflict/error UX is split into M-027.
```

### M-027 - Shortcut Conflict And Config Failure UX

```yaml
plan_unit_id: M-027
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcut editing/import must reject or explicitly resolve duplicate bindings, recover from invalid shortcut config with defaults and a toast, distinguish empty filters from no matches, and avoid blank or undefined labels while the key map is loading.
gui_related: true
gui_classification_reason: The unit defines user-visible validation errors, toasts, inline empty states, loading labels, and conflict behavior.
split_recommended: true
depends_on:
- M-026
unblocks: []
acceptance_criteria:
- Duplicate bindings are rejected or intentionally resolved by the implementation choice, with the recommendation to reject and show Already used by &lt;ActionName&gt;.
- Corrupt or invalid shortcuts config falls back to defaults, logs a warning, and shows Shortcuts reset to defaults due to config error.
- Unsupported import versions are rejected or explicitly handled by documented version behavior.
- Empty filter shows all rows; a non-empty no-match filter shows No shortcuts match 'xyz'.
- UI shows a label-only state or (Loading...) before the key map is loaded and never shows blank or (undefined).
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_conflict_config_failure_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_conflict_config_failure_ux
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- 'Already used by &lt;ActionName&gt;'
- 'Shortcuts reset to defaults due to config error'
- 'Unsupported shortcut file version'
- "No shortcuts match 'xyz'"
- '(Loading...)'
- '(undefined)'
- validate_shortcut_binding
- Ctrl+C
- Ctrl+V
negative_constraints:
- The UI must not show No shortcuts when the filter is the cause of an empty result.
- The UI must not show blank or (undefined) shortcut labels.
- The app must not crash on missing, corrupt, or invalid shortcut config.
compatibility_only_notes:
- Reject-vs-steal and unknown-version handling are implementation choices; the recommended stance is reject with clear copy.
stale_retired_dispositions: []
owner_boundary_notes:
- Shortcut conflict details remain coupled to M-026 registry behavior.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The source carries several implementation choices; this unit preserves the choices and recommendations as node-readiness considerations, not product blockers.
```

### M-028 - Shortcut Export Import Filter And Label Helpers

```yaml
plan_unit_id: M-028
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Shortcuts surface must support export/import of overrides, Replace/Merge confirmation, list filtering by action or key, menu/tooltip shortcut labels, and shared DRY helper functions that reuse GuiConfig shortcut serialization.
gui_related: true
gui_classification_reason: The unit defines visible export/import, filtering, confirmation, success/error toasts, and menu/tooltip labels.
split_recommended: true
depends_on:
- M-025
- M-026
- M-027
unblocks: []
acceptance_criteria:
- Export writes current overrides or full key map to JSON with a version field and success toast.
- Import parses and validates JSON, confirms Replace or Merge, rebuilds the key map, persists config, and reports success/failure without partial invalid application.
- Filtering is case-insensitive over action labels and shortcut strings, with the empty-filter/no-match behavior from M-027.
- Menus and buttons for shortcut actions display the current binding in labels or tooltips through a shared helper.
- Export/import helpers reuse the same serialization as GuiConfig.shortcuts.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_import_format_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_export_import_filter_label_helpers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0049
preserved_exact_tokens:
- Export...
- Import...
- Replace
- Merge
- '{ "version": 1, "overrides": { "MoveToLineStart": "Ctrl+A", ... } }'
- 'Exported N shortcuts.'
- 'Imported N shortcuts.'
- export_shortcuts_to_json
- import_shortcuts_from_json
- ShortcutOverrides
- Invalid shortcut file
- Unknown action: X
- 'Filter by action or shortcut'
- shortcut_label
- 'Shortcut: Ctrl+K'
- No shortcut
negative_constraints:
- Invalid JSON or unparseable files must not apply partial shortcut changes.
- Imported files with unsupported future versions must not be silently accepted.
compatibility_only_notes:
- Unknown-action handling is an implementation choice; the recommendation is to document skip-vs-reject behavior.
stale_retired_dispositions: []
owner_boundary_notes:
- This unit extends M-025/M-026 without introducing a separate shortcut ownership surface.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Export/import, filter, and label helpers are related user-facing enhancements but should remain separately addressable from the core key map.
```

### M-029 - Skills Management Surface Owner Boundary

```yaml
plan_unit_id: M-029
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: A Skills management GUI surface must exist for discover/list/add/edit/remove/permissions behavior, while final placement follows the current Skills/GUI owner docs and older Config/Settings placement wording is retained as source lineage compatibility.
gui_related: true
gui_classification_reason: The unit defines a user-visible Skills management screen and placement boundary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The product exposes one Skills management surface that is reachable from the same config/settings family as GuiConfig.
- The surface covers discover, list, add, edit, remove, and permission configuration.
- Skill names and paths are selectable/copyable through catalog widgets.
- Final placement is reconciled with Skills_System.md and FinalGUISpec rather than treating older Config/Settings wording as a competing owner decision.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_owner_surface_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_management_surface_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
preserved_exact_tokens:
- Agent Skills (GUI)
- SKILL.md
- Config
- Advanced
- Skills
- Settings
- page_header
- styled_button
- selectable_label
- selectable_label_mono
- Add / Edit / Remove / Permissions / Refresh
negative_constraints:
- Do not create multiple competing Skills GUI locations.
- Do not delete a skill without explicit user confirmation.
compatibility_only_notes:
- Config, Advanced, dedicated Skills tab, Settings, and Preferences wording is preserved as source lineage pending owner-doc placement reconciliation.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Skills_System.md and Plans/FinalGUISpec own the final Skills surface placement and system-wide skill model.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/OpenCode_Deep_Extraction.md'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: The source span also contains package model, permissions, and CRUD/error behavior split into M-030 through M-032.
```

### M-030 - Skill Package Format Discovery And Validation

```yaml
plan_unit_id: M-030
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill discovery and validation must follow the one-folder-per-skill SKILL.md package model, ordered project/global discovery roots, strict OpenCode-aligned name validation, frontmatter requirements, and required_tool_refs/optional_tool_refs readiness semantics.
gui_related: false
gui_classification_reason: The unit covers backend discovery, package validation, and readiness metadata rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-029
unblocks: []
acceptance_criteria:
- Discovery uses project and global roots from the canonical skill system and records the ordered search path.
- Each skill is one folder with SKILL.md and frontmatter fields name, description, license, compatibility, and metadata as applicable.
- Skill names match ^[a-z0-9]+(-[a-z0-9]+)*$, are 1-64 chars, have no leading/trailing or consecutive hyphens, and match the directory name.
- Descriptions are 1-1024 chars.
- required_tool_refs problems block runnable /readiness; optional_tool_refs problems warn; exact failing refs are surfaced instead of one generic error.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_schema_discovery_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_package_format_discovery_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0047
preserved_exact_tokens:
- SKILL.md
- name
- description
- license
- compatibility
- metadata
- .puppet-master/skills/<name>/SKILL.md
- .claude/skills/<name>/SKILL.md
- .agents/skills/<name>/SKILL.md
- ~/.config/puppet-master/skills/<name>/SKILL.md
- ~/.claude/skills/<name>/SKILL.md
- ~/.agents/skills/<name>/SKILL.md
- '^[a-z0-9]+(-[a-z0-9]+)*$'
- required_tool_refs
- optional_tool_refs
- /readiness
- discover_skills(project_root)
negative_constraints:
- Skill name in frontmatter must match the directory name.
- Required-tool reference failures must not be flattened into a generic error.
compatibility_only_notes:
- OpenCode-compatible import roots are compatibility inputs; PM-native runtime delivery remains canonical.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Skills_System.md owns the canonical skill system; this unit preserves MiscPlan implementation requirements and source lineage.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md'
split_recommendation_reason: Discovery and validation are separable from permissions, GUI CRUD, and runtime bundling.
```

### M-031 - Skill Permissions Persona And Tool Exposure

```yaml
plan_unit_id: M-031
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill loading is permission-gated through permission.skill, Persona default_skill_refs and permission profiles, available_skills tool descriptions, skill({ name }) on-demand retrieval, /skillname commands, external_directory allowlisting, and compaction preservation.
gui_related: false
gui_classification_reason: The unit defines permission/runtime contracts and prompt/tool exposure rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-030
unblocks: []
acceptance_criteria:
- permission.skill supports per-skill patterns such as allow, deny, ask, and wildcard entries.
- Persona default_skill_refs and permission profiles can auto-load or restrict skills.
- A Persona can deny the skill permission key to disable skill loading for that Persona.
- Tool descriptions include available skills in <available_skills> XML blocks with name and description.
- Agents invoke skills with skill({ name }) and /skillname command-palette entries.
- Skill directories are automatically included in external_directory allowlist handling, and skill tool calls survive /compaction pruning.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_permission_runtime_exposure_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_permissions_persona_tool_exposure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
preserved_exact_tokens:
- permission.skill
- default_skill_refs
- permission profiles
- '{ "my-skill": "allow", "internal-*": "deny", "*": "allow" }'
- '<available_skills>'
- skill({ name })
- /skillname
- external_directory
- /compaction
- assistant-chat-design.md
negative_constraints:
- Persona-level deny of skill must disable skill loading for runs using that Persona.
- Incremental summarization or compaction must not drop recoverable skill lineage.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Permissions_System.md, Personas.md, Prompt_Pipeline.md, and Tools.md retain their ContractRef authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md#5-tool-permission-keys, ContractName:Plans/Personas.md#PERSONA-SCHEMA, ContractName:Plans/OpenCode_Deep_Extraction.md'
split_recommendation_reason: Permission/tool exposure is independent of Skills GUI CRUD and package validation.
```

### M-032 - Skills GUI CRUD Refresh And Errors

```yaml
plan_unit_id: M-032
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills GUI must list discovered skills with source and permission state, support create/import/edit/remove/permission/refresh flows, refresh only on open/mutations/manual refresh, and surface frontmatter, missing SKILL.md, and config-write errors without corrupting state.
gui_related: true
gui_classification_reason: The unit defines user-visible Skills list, CRUD controls, refresh behavior, validation errors, and toasts.
split_recommended: true
depends_on:
- M-029
- M-030
- M-031
unblocks: []
acceptance_criteria:
- The list shows project and global skills with name, truncated description, source path, source type, and resolved permission.
- Add supports Create new or Import from path; Edit validates frontmatter/name matching; Remove or Disable requires confirmation.
- Permissions can be edited per skill or by pattern and persist to GuiConfig.skill_permissions or permission.skill-compatible config.
- Refresh runs on opening, after Add/Edit/Remove, and when the user clicks Refresh; no timer-based auto-refresh is used.
- Invalid frontmatter, missing SKILL.md, and permission/config write failures surface as clear inline errors or toasts and do not corrupt saved state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_gui_mutation_state_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_gui_crud_refresh_errors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0045
preserved_exact_tokens:
- Create new
- Import from path
- Remove
- Disable
- Do not delete without explicit user confirmation.
- GuiConfig.skill_permissions
- opencode.json-style permission.skill
- Refresh
- discover_skills(project_root)
- Do not auto-refresh on a timer
- Invalid frontmatter in SKILL.md
- Missing SKILL.md
- Permission/config write failure
negative_constraints:
- Do not delete a skill folder without explicit user confirmation.
- Do not auto-refresh the Skills list on a timer.
- Do not lose edits after a permission/config write failure.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend discovery/load/persistence remains the provider for this GUI; GUI owns presentation and mutation flow.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
split_recommendation_reason: Skills CRUD and refresh/error behavior are a coherent GUI workflow separate from backend discovery and runtime delivery.
```

### M-033 - Skill Runtime Readiness Bundling And PM Skill Tool

```yaml
plan_unit_id: M-033
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: PM-native skill runtime delivery must compute readiness from validation, permission, and tool availability; bundle selected skill content into compiled context; expose the PM skill tool for on-demand retrieval; and avoid requiring provider-native runtime delivery matrices for MVP.
gui_related: false
gui_classification_reason: The unit defines runtime readiness, prompt/context bundling, and tool delivery rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-030
- M-031
unblocks: []
acceptance_criteria:
- Runtime readiness is computed before launch from validation state, permission state, and tool availability.
- PM-selected skill content is bundled into compiled context when needed.
- PM exposes the skill tool for on-demand skill retrieval during the run.
- Provider-native directories and formats are optional import/export/projection layers, not required runtime delivery for MVP.
- Tests cover discover_skills, load_skill, and resolve_skill_permission.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_runtime_readiness_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_runtime_readiness_bundling_pm_tool
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0047
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- PM-native runtime model
- runtime readiness
- compiled context
- skill tool
- provider-native skill directories
- provider-native formats
- canonical registry
- permission filter
- context bundling
- discover_skills
- load_skill
- resolve_skill_permission
negative_constraints:
- Implementation does not require a separate per-provider native runtime delivery matrix.
compatibility_only_notes:
- Provider-native formats may be documented or used as interoperability inputs.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md, Prompt_Pipeline.md, and Tools.md own runtime skill contracts; this unit preserves MiscPlan readiness and bundling lineage.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md'
split_recommendation_reason: Runtime readiness is separate from projection target drift and GUI decisions.
```

### M-034 - Skill Projection Targets Drift And Manual Override

```yaml
plan_unit_id: M-034
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill import/discovery can read compatible roots, but projection/export is optional and explicit, tracked per projection target, separated between workspace-owned and provider-root-owned state, and direct edits move only the chosen target to Manual Override.
gui_related: true
gui_classification_reason: The unit includes user-visible projection, drift, repair, and Manual Override state.
split_recommended: true
depends_on:
- M-033
unblocks: []
acceptance_criteria:
- Import/discovery from compatible roots is allowed when canonical skill settings enable it.
- Projection/export is optional and explicit.
- Projection and drift state are tracked per target through projection_targets or projection_targets[].
- Workspace-owned projections are not confused with provider-root-owned account/runtime directories during cleanup or repair.
- Editing a provider-native projection target directly switches only that target to Manual Override; repair acts on the chosen target and does not silently revert siblings.
- Projection failure does not imply PM-native skill runtime delivery failure.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_projection_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_projection_targets_drift_manual_override
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0047
preserved_exact_tokens:
- projection_targets
- projection_targets[]
- workspace AGENTS.md
- workspace CLAUDE.md
- workspace GEMINI.md
- workspace .cursor/rules/pm-generated.mdc
- workspace cursor/rules/pm-generated.mdc
- provider/account-local
- /account-local
- Manual Override
negative_constraints:
- Cleanup or repair flows must not confuse workspace-owned projected files with provider-root-owned account/runtime directories.
- Repair must not silently revert sibling projection targets.
- A projection failure does not mean PM-native skill runtime delivery failed.
compatibility_only_notes:
- Projection/export remains optional and explicit.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md, FinalGUISpec.md, storage-plan.md, Multi-Account.md, and OpenCode_Deep_Extraction.md retain final projection and account-boundary authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/Multi-Account.md'
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
split_recommendation_reason: Projection target drift is distinct from PM-native runtime readiness and should remain independently routable.
```

### M-035 - Skills Gap Decisions And Readiness Table

```yaml
plan_unit_id: M-035
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: 'Skills implementation planning must preserve the resolved gaps table covering first-wins discovery deduplication, create-no-overwrite behavior, concurrent-edit handling recommendation, full validate-all status table, deferred ask timing, import-copy semantics, global-only create without a project, and name/folder match enforcement.'
gui_related: true
gui_classification_reason: The unit includes user-visible Skills list/status decisions, prompts, modals, and error behavior.
split_recommended: true
depends_on:
- M-030
- M-031
- M-032
- M-033
unblocks: []
acceptance_criteria:
- Deduplication by name uses first-wins by search order and can show later duplicates as shadowed in the GUI.
- Creating a skill never overwrites an existing SKILL.md.
- Concurrent edit handling preserves the recommended Reload / Overwrite / Cancel prompt option for implementation planning.
- Validate all shows a full table of discovered skills with OK or Error status and summary counts unless explicitly deferred for v1.
- Ask permission is deferred to the moment the runner would load the skill and is handled in-app before or at run start, not inside the platform CLI.
- Import copies into a discovery path instead of persisting arbitrary external paths.
- No-project creation offers global-only, and frontmatter name must match folder name.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_gap_decision_readiness_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_gap_decisions_readiness_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0048
preserved_exact_tokens:
- First-wins by search order
- DRY:DATA:skill_search_paths
- 'A skill named &lt;name&gt; already exists at this location'
- File changed on disk. Reload / Overwrite / Cancel
- 'N OK, M errors.'
- Show only errors
- Allow skill 'doc-lookup' for this run?
- Allow / Deny / Always / Never
- Explicit per-skill entry wins over pattern.
- Copy into a discovery path.
- ~/.config/puppet-master/skills/<name>
- Name must match folder name
negative_constraints:
- Create new must not overwrite an existing skill containing SKILL.md.
- Import must not persist arbitrary external paths.
- Ask permission prompts occur in-app before or at run start, not inside the platform CLI.
compatibility_only_notes:
- Some choices remain implementation-plan readiness decisions, not product blockers for this standardization batch.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md owns final skill semantics; this unit keeps the MiscPlan gap-resolution table source-preserved and atomized.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source table covers many readiness choices; this unit preserves them as one planning-readiness cluster while keeping implementation decisions explicit.
```

### M-036 - Skills Bulk Permission Pattern Control

```yaml
plan_unit_id: M-036
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills tab must support a bulk permission pattern control where users enter a wildcard pattern, select Allow/Deny/Ask, confirm the matched count, persist GuiConfig.skill_permissions, and preserve explicit per-skill precedence over patterns.
gui_related: true
gui_classification_reason: The unit defines user-visible bulk permission input, dropdown, confirmation modal, and list feedback.
split_recommended: true
depends_on:
- M-031
- M-032
- M-035
unblocks: []
acceptance_criteria:
- Users can enter patterns such as doc-* or internal-* and choose Allow, Deny, or Ask.
- Apply resolves discovered skills matching the pattern and shows a confirmation with count before persisting.
- Confirmation copy preserves the source example Set Allow for 3 skills matching doc-*?.
- On confirm, GuiConfig.skill_permissions is updated and the list reflects new resolved permissions.
- Explicit per-skill rules win over pattern rules.
- Source lines 801-866 of MiscPlan-S0050 remain residual under M-001 for the next bounded window.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_bulk_permission_pattern_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_bulk_permission_pattern_control
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Bulk permission
- Set by pattern
- doc-*
- internal-*
- Allow / Deny / Ask
- Apply
- 'Set Allow for 3 skills matching doc-*?'
- GuiConfig.skill_permissions
- Explicit per-skill wins over pattern
- apply_bulk_permission
- SkillPermissions
- Permission
- SkillInfo
negative_constraints:
- The atomized coverage for this unit is bounded to MiscPlan-S0050 lines 791-800; lines 801-866 remain residual for later handling.
- Explicit per-skill overrides must not be overridden by a broader pattern.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend wildcard semantics are shared with resolve_skill_permission and M-031.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit intentionally covers only the first bounded part of S0050; remaining sort/filter, preview, modified/version, and validate-all material stays residual.
```

### M-037 - Skills Bulk Permission Backend Save Handling

```yaml
plan_unit_id: M-037
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills bulk-permission updates must route through shared backend permission state, report config-persist failures, and leave retryable in-memory state instead of pretending unsaved changes succeeded.
gui_related: true
gui_classification_reason: The unit defines user-visible bulk-permission save feedback and retry behavior on the Skills surface.
split_recommended: false
depends_on:
- M-031
- M-032
- M-036
unblocks: []
acceptance_criteria:
- Bulk permission may use apply_bulk_permission as a DRY helper to compute matched skills and update SkillPermissions.
- Config persist failure after Apply shows an error toast.
- In-memory state is not marked as saved after a persist failure so the user can retry.
- Source lines 801-802 of MiscPlan-S0050 are covered without re-owning the earlier M-036 source lines.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_bulk_permission_save_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_bulk_permission_backend_save_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- apply_bulk_permission
- SkillPermissions
- Permission
- SkillInfo
- config persist fails
- error toast
- saved
negative_constraints:
- Failed permission config persistence must not be shown as saved.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Backend wildcard semantics remain shared with resolve_skill_permission.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit covers only the backend save/error tail of the bulk-permission source span.
```

### M-038 - Skills Sort Filter List Controls

```yaml
plan_unit_id: M-038
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills tab must support in-memory sort and combined filters over the discovered skill list without re-running discovery on sort or filter changes.
gui_related: true
gui_classification_reason: The unit defines user-visible list sorting, filtering controls, dropdowns, and persisted sort preference.
split_recommended: false
depends_on:
- M-030
- M-031
- M-032
unblocks: []
acceptance_criteria:
- Users can sort skills by Name, Source, or Permission.
- Users can filter by text, source, and permission with combined filters.
- Sort/filter applies in-memory to discover_skills plus resolved permission results and does not rediscover on every sort/filter change.
- Sort preference persists in session or GuiConfig.
- Existing widget-catalog inputs/dropdowns/toggles are reused.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_sort_filter_state_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_sort_filter_list_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Sort / filter list
- Name
- Source
- Permission
- All / Project / Global
- All / Allow / Deny / Ask
- skills_list_sort
- sort_skills
- filter_skills
- discover_skills(project_root)
negative_constraints:
- Sort and filter changes must not trigger re-discovery.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Skills discovery remains owned by the backend skill registry; this unit owns the list-control behavior.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Sort/filter list controls are a coherent GUI enhancement.
```

### M-039 - Skills Preview Body Pane

```yaml
plan_unit_id: M-039
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The Skills tab must provide an on-demand read-only SKILL.md body preview with copyable text and clear per-skill load errors.
gui_related: true
gui_classification_reason: The unit defines a visible Skills preview pane or modal, selectable text, and error display.
split_recommended: false
depends_on:
- M-030
- M-032
unblocks: []
acceptance_criteria:
- Selecting a skill loads its SKILL.md body on demand into a read-only pane, drawer, or modal.
- Preview content is copyable and may show markdown body only or full file with frontmatter collapsed.
- Edit opens the full editor.
- Load failures show an error in the preview pane and may trigger list refresh without aborting the whole surface.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_preview_body_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_preview_body_pane
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Preview skill body
- SKILL.md
- read-only pane
- selectable_label_mono
- load_skill(path)
- "body: Option<String>"
- load_skill_body(path)
- Could not load skill
negative_constraints:
- Skill bodies must be loaded on demand rather than all up front.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Preview reuses backend skill loading and must not define a competing parser.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Preview is separable from sort/filter and validation.
```

### M-040 - Skill Last Modified And Version Display

```yaml
plan_unit_id: M-040
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skill list and preview metadata must show last-modified information and may show optional version metadata when supported, while unreadable mtimes degrade to an empty or placeholder value without dropping the skill.
gui_related: true
gui_classification_reason: The unit defines user-visible skill metadata display in list rows and preview panes.
split_recommended: false
depends_on:
- M-030
unblocks: []
acceptance_criteria:
- SkillInfo can carry modified metadata from file mtime.
- The Skills list and preview pane show last modified as a date or relative time.
- Optional version can be read from frontmatter or metadata.version only if the frontmatter model extends to support it.
- Unreadable mtime shows an empty value or -- and does not remove the skill from the list.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skill_metadata_display_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skill_last_modified_version_display
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Last modified / version
- std::fs::metadata(path).modified()
- "modified: Option<DateTime<Utc>>"
- SystemTime
- "Modified: 2026-02-22"
- "Modified: 2 days ago"
- metadata.version
- "skill_modified(path: &Path)"
- --
negative_constraints:
- Mtime read failures must not exclude a discovered skill.
compatibility_only_notes:
- The version field is optional and not required by OpenCode.
stale_retired_dispositions: []
owner_boundary_notes:
- Skill metadata remains an extension of SkillInfo and does not change core discovery ownership.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Metadata display is a narrow enhancement.
```

### M-041 - Validate All Skills Read-Only Flow

```yaml
plan_unit_id: M-041
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills validation must provide a read-only Validate all flow that checks every discovered SKILL.md and reports per-skill results in a full, copyable table.
gui_related: true
gui_classification_reason: The unit defines a user-visible validation command, results table, summary line, optional error filter, and copyable errors.
split_recommended: false
depends_on:
- M-030
unblocks: []
acceptance_criteria:
- Validate all runs the same frontmatter, name, directory-name, and description checks as load_skill.
- Results show a full table for all discovered skills with OK or Error plus message.
- Summary copy preserves N OK, M errors.
- Per-skill read errors are reported and do not abort validation of later skills.
- Validation is read-only and does not write skill files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_validate_all_flow_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: validate_all_skills_read_only_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Validate all SKILL.md on disk
- Validate all
- "validate_skill(path: &Path)"
- ValidationError
- N OK, M errors
- Show only errors
- Could not read file
negative_constraints:
- Validate all must not abort the entire run when one skill becomes unreadable.
- Validate all is read-only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Validation reuses load_skill rules and must not duplicate divergent validation semantics.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Validate all is a discrete Skills quality workflow.
```

### M-042 - Shortcuts Skills Readiness And Order

```yaml
plan_unit_id: M-042
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcuts and Skills implementation planning is ready when the spec sections, checklists, project-path behavior, Slint key-event integration point, platform skill delivery, dependencies, and recommended order are reconciled.
gui_related: true
gui_classification_reason: The unit covers GUI-facing Shortcuts and Skills implementation readiness, including key-event and Skills surface sequencing.
split_recommended: true
depends_on:
- M-003
- M-019
- M-025
- M-026
- M-027
- M-028
- M-030
- M-031
- M-032
- M-033
- M-034
- M-035
- M-036
- M-037
- M-038
- M-039
- M-040
- M-041
unblocks: []
acceptance_criteria:
- The implementation plan reads sections 7.7 through 7.11.2 and checklist sections 8.8 through 8.10.2 before planning Shortcuts and Skills.
- No-project Skills creation offers global-only paths.
- Slint key event integration point is identified and documented.
- platform_specs or equivalent documents how each platform receives skills.
- Implementation order preserves cleanup/run-config foundation before Shortcuts, Skills, Cleanup UX, enhancements, and pre-completion.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_skills_readiness_order_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_skills_readiness_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0050
preserved_exact_tokens:
- Implementation plan readiness
- Implementation plan checklist
- project_root is None
- FocusScope
- KeyMap
- platform_specs
- list_skills_for_agent
- GuiConfig and Option B run config
- Recommended implementation order
- Pre-completion
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Slint API confirmation and platform skill delivery are implementation-readiness blockers, not product-decision blockers for this standardization batch.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This readiness unit coordinates several GUI/backend areas and should remain split_recommended for implementation planning.
```

### M-043 - Cleanup Checklist Core Module Guard

```yaml
plan_unit_id: M-043
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation checklist items must keep all cleanup policy, allowlist data, and git-clean execution in src/cleanup with DRY tags and no duplicated logic outside the shared module.
gui_related: false
gui_classification_reason: The unit covers backend module organization, DRY tagging, and cleanup helper implementation.
split_recommended: true
depends_on:
- M-006
- M-010
- M-012
- M-013
- M-014
- M-016
unblocks: []
acceptance_criteria:
- src/cleanup/mod.rs and src/cleanup/workspace.rs carry CleanupConfig, allowlist data, prepare_working_directory, cleanup_after_execution, and run_git_clean_with_excludes as shared implementations.
- cleanup_exclude_patterns or CLEANUP_EXCLUDE_PATTERNS includes the exact required exclusions.
- Git execution uses resolved git binary behavior rather than duplicated Command::new logic.
- prepare_working_directory never removes protected .puppet-master or root state files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_core_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_checklist_core_module_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0051
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0052
preserved_exact_tokens:
- src/cleanup/
- pub mod cleanup;
- src/lib.rs
- CleanupConfig
- cleanup_exclude_patterns()
- CLEANUP_EXCLUDE_PATTERNS
- run_git_clean_with_excludes
- path_utils::resolve_executable("git")
- DRY:DATA
- DRY:FN
negative_constraints:
- No duplicate allowlist or git-clean logic anywhere outside src/cleanup/.
- Do not call run_git_clean_with_excludes from cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree git binary resolution remains the future source for resolve_git_executable when available.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Checklist spans combine structure, helper behavior, and docs; this unit owns core module guardrails.
```

### M-044 - Cleanup Wrapper Config Wiring Checklist

```yaml
plan_unit_id: M-044
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup wrapper and config wiring must place cleanup settings in the run config snapshot, pass CleanupConfig explicitly through execution context, wrap CLI execution paths, and skip cleanup only when no intended project workspace exists.
gui_related: false
gui_classification_reason: The unit covers backend execution wiring and run-config propagation rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
- M-015
- M-019
unblocks: []
acceptance_criteria:
- run_with_cleanup is a shared DRY wrapper or equivalent prepare/execute/cleanup sequence.
- CleanupConfig is included in the run config built from GuiConfig.
- IterationContext or equivalent carries cleanup_config explicitly.
- ExecutionEngine wraps direct CLI runner.execute with prepare and cleanup.
- Interview, start_chain, and app call sites use run_with_cleanup when they have a known project working directory.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_wrapper_config_wiring_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_wrapper_config_wiring_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0053
preserved_exact_tokens:
- run_with_cleanup(runner, request, config)
- IterationContext
- "cleanup_config: Option<CleanupConfig>"
- ExecutionEngine::execute_iteration
- runner.execute(request)
- execute_ai_turn
- current_dir()
- CLI-only
negative_constraints:
- Do not use a thread-local or global current run config when explicit passing is available.
- Do not run prepare/cleanup from app.rs when current_dir is not the intended project.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- This checklist consumes Worktree Option B run-config wiring rather than owning it.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Execution wiring spans several call sites and should remain split_recommended.
```

### M-045 - Cleanup Tests Agent Output Evidence Checklist

```yaml
plan_unit_id: M-045
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation must test protected excludes, define agent-output cleanup, and implement evidence pruning as a scheduled/manual path outside cleanup_after_execution.
gui_related: false
gui_classification_reason: The unit covers backend tests, storage paths, and evidence pruning implementation.
split_recommended: true
depends_on:
- M-006
- M-011
- M-012
- M-013
- M-014
- M-015
- M-016
- M-017
- M-019
unblocks: []
acceptance_criteria:
- Tests assert that cleanup excludes .puppet-master, progress.txt, AGENTS.md, prd.json, .gitignore, and sensitive patterns.
- AGENT_OUTPUT_SUBDIR and agent_output_dir are single-source cleanup data.
- Evidence pruning config includes retention_days, retain_last_runs, and prune_on_cleanup.
- prune_evidence_older_than runs from manual action or background, not cleanup_after_execution.
- The definition of run for retain_last_runs is resolved or retention_days is preferred until then.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_tests_output_evidence_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_tests_agent_output_evidence_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0054
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0055
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0056
preserved_exact_tokens:
- .puppet-master
- progress.txt
- AGENTS.md
- prd.json
- .gitignore
- AGENT_OUTPUT_SUBDIR
- agent_output_dir(base)
- prune_evidence_older_than(base_dir, config)
- retention_days
- retain_last_runs
- prune_on_cleanup
negative_constraints:
- Evidence pruning must not run from cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- STATE_FILES.md and AGENTS.md own final documentation updates for state and evidence paths.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This checklist groups tests, agent-output, and evidence retention while preserving separate source lineage.
```

### M-046 - Cleanup UX Checklist

```yaml
plan_unit_id: M-046
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup UX checklist implementation must wire Advanced and Doctor cleanup controls, tooltips/docs, platform-hook non-dependency notes, Shortcuts config surface, and Skills config surface through existing widgets.
gui_related: true
gui_classification_reason: The unit defines user-visible cleanup controls, Doctor mention, Config tabs, Shortcuts tab, and Skills tab.
split_recommended: true
depends_on:
- M-017
- M-020
- M-021
- M-025
- M-029
unblocks: []
acceptance_criteria:
- Advanced -> Workspace / Cleanup contains cleanup and evidence toggles wired into the shared run config.
- Clean workspace now appears on Doctor or Advanced with project-root resolution, optional all-worktrees handling, confirmation, and preview.
- Tooltips and docs preserve cleanup policy and platform-hook non-dependency.
- Shortcuts and Skills subsections or tabs are added under the selected config surface.
- Widget catalog scripts run after UI widget changes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_ux_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_ux_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0057
preserved_exact_tokens:
- Advanced -> Workspace / Cleanup
- Clean workspace now
- Doctor
- git clean -fd -n
- Config -> Advanced -> Workspace
- Config -> Shortcuts
- Skills subsection/tab
- generate-widget-catalog.sh
- check-widget-reuse.sh
negative_constraints:
- Manual Clean workspace must use prepare-style logic, not cleanup_after_execution.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- UI surface details remain reconciled with FinalGUISpec and UI widget catalog ownership.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: UX checklist spans cleanup, shortcuts, and skills surfaces.
```

### M-047 - Desktop Shortcuts Backend Checklist

```yaml
plan_unit_id: M-047
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Desktop Shortcuts backend checklist implementation must define ShortcutAction, KeyBinding, defaults, GuiConfig overrides, key-map rebuild, validation, no hardcoded bindings, config-failure fallback, and unit tests.
gui_related: true
gui_classification_reason: The unit governs backend behavior directly reflected in user-visible shortcut handling and Config UI.
split_recommended: true
depends_on:
- M-025
- M-026
- M-027
- M-028
unblocks: []
acceptance_criteria:
- ShortcutAction, KeyBinding, default_shortcuts, GuiConfig.shortcuts, build_key_map, and validate_shortcut_binding are implemented in order.
- Composer and prompt fields use the key map and do not hardcode bindings.
- Missing shortcuts config uses empty overrides.
- Invalid shortcuts config falls back to defaults, logs a warning, shows Shortcuts reset to defaults due to config error, and does not crash.
- Tests cover merge, validation, and round-trip behavior.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_backend_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: desktop_shortcuts_backend_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0058
preserved_exact_tokens:
- ShortcutAction
- KeyBinding
- DRY:DATA:shortcut_actions
- DRY:DATA:default_shortcuts
- build_key_map(defaults, overrides) -> KeyMap
- DRY:FN:build_key_map
- validate_shortcut_binding
- Shortcuts reset to defaults due to config error
- Do not crash
negative_constraints:
- All key handling in composer and prompt fields uses the key map, with no hardcoded bindings.
- The app must not crash on invalid shortcuts config.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- M-026 and M-027 preserve the authoritative registry and error UX details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Checklist remains split_recommended because it combines implementation order and validation requirements.
```

### M-048 - Agent Skills Backend Checklist

```yaml
plan_unit_id: M-048
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Agent Skills backend checklist implementation must create the skills modules, canonical ordered discovery, frontmatter loading, wildcard permission resolution, safe CRUD, runner skill listing, and tests.
gui_related: false
gui_classification_reason: The unit covers backend skill discovery, loading, permissions, CRUD, runner integration, and tests.
split_recommended: true
depends_on:
- M-030
- M-031
- M-032
- M-033
- M-035
unblocks: []
acceptance_criteria:
- src/skills or equivalent modules define discovery, frontmatter, and permissions.
- DRY:DATA:skill_search_paths records canonical project-first then global discovery order.
- discover_skills, load_skill, resolve_skill_permission, and list_skills_for_agent are DRY helpers.
- Create does not overwrite a directory containing SKILL.md.
- Runtime delivery follows canonical registry plus permission filter plus context bundling plus skill tool path.
- Tests cover discovery, frontmatter validation, name matching, wildcard/default permissions, and explicit-over-pattern precedence.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_backend_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: agent_skills_backend_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0059
preserved_exact_tokens:
- src/skills/
- discovery.rs
- frontmatter.rs
- permissions.rs
- DRY:DATA:skill_search_paths
- .puppet-master/skills
- .claude/skills
- .agents/skills
- DRY:FN:discover_skills
- DRY:FN:load_skill
- DRY:FN:resolve_skill_permission
- DRY:FN:list_skills_for_agent
- explicit per-skill entry wins over pattern
negative_constraints:
- Creating a skill must not overwrite an existing SKILL.md.
- Provider-native formats remain interoperability inputs only.
compatibility_only_notes:
- Provider-native formats remain compatibility inputs, not MVP runtime-delivery owners.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md and Prompt_Pipeline.md retain runtime delivery authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Backend checklist spans modules, CRUD, runtime integration, and tests.
```

### M-049 - Shortcuts Enhancement Checklist

```yaml
plan_unit_id: M-049
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcuts enhancement checklist implementation must add config-load failure handling, export/import, search/filter, and shortcut discoverability helpers after the core shortcut backend is complete.
gui_related: true
gui_classification_reason: The unit defines user-visible Shortcuts export/import, filtering, labels, tooltips, and toasts.
split_recommended: true
depends_on:
- M-025
- M-026
- M-027
- M-028
- M-047
unblocks: []
acceptance_criteria:
- Config load failure handling is wired at app startup and when opening Config -> Shortcuts.
- Export and Import buttons use shared JSON helpers and validate imports before Replace or Merge.
- Search/filter matches action labels and shortcut strings with correct empty and no-match states.
- Shortcut labels or tooltips use a shared helper and stay synced with key-map changes.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_enhancement_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_enhancement_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0060
preserved_exact_tokens:
- Config load failure (Shortcuts)
- Export...
- Import...
- export_shortcuts_to_json
- import_shortcuts_from_json
- Replace/Merge
- filter_shortcut_list
- No shortcuts match
- (Loading...)
negative_constraints:
- Invalid JSON or unsupported shortcut versions must be rejected before applying changes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Enhancements depend on the core Shortcuts registry and Config surface.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The checklist covers multiple user-facing shortcut enhancements.
```

### M-050 - Skills Enhancement Checklist

```yaml
plan_unit_id: M-050
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills enhancement checklist implementation must add sort/filter, last-modified display, preview, bulk permission, validate-all, create-no-overwrite, and concurrent-edit handling after the core Skills backend is complete.
gui_related: true
gui_classification_reason: The unit defines user-visible Skills enhancements, prompts, metadata, validation results, and editor conflict handling.
split_recommended: true
depends_on:
- M-030
- M-031
- M-032
- M-037
- M-038
- M-039
- M-040
- M-041
- M-048
unblocks: []
acceptance_criteria:
- Sort/filter, last-modified display, preview, bulk permission, validate-all, create-no-overwrite, and concurrent-edit behavior are implemented in the documented order.
- Bulk permission persists GuiConfig.skill_permissions and documents explicit-over-pattern precedence.
- Validate all shows a full table with N OK, M errors and copyable errors.
- Existing SKILL.md directories are not overwritten.
- Concurrent edit handling preserves the File changed on disk. Reload / Overwrite / Cancel recommendation.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_enhancement_checklist_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_enhancement_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0060
preserved_exact_tokens:
- skills_list_sort
- "modified: Option<DateTime<Utc>>"
- Bulk permission
- Validate all
- N OK, M errors
- Create skill -- dir exists
- SKILL.md
- File changed on disk. Reload / Overwrite / Cancel
negative_constraints:
- Create new must not overwrite an existing skill containing SKILL.md.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md owns canonical skill semantics; this checklist preserves MiscPlan implementation sequencing.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Skills enhancements touch list, preview, persistence, validation, and editor state.
```

### M-051 - Pre-Completion Verification Checklist

```yaml
plan_unit_id: M-051
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup/Shortcuts/Skills implementation completion must run the AGENTS.md pre-completion checklist and update the Task Status Log when done.
gui_related: false
gui_classification_reason: The unit covers implementation verification workflow rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-043
- M-044
- M-045
- M-046
- M-047
- M-048
- M-049
- M-050
unblocks: []
acceptance_criteria:
- AGENTS.md pre-completion verification checklist is run for compile, DRY tagging, module organization, tests, and scope.
- Task Status Log is updated when done.
- The covered source span remains losslessly available for exact-text audit.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: precompletion_verification_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: precompletion_verification_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0061
preserved_exact_tokens:
- AGENTS.md Pre-Completion Verification Checklist
- compile
- DRY tagging
- module organization
- tests
- scope
- Task Status Log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- AGENTS.md owns the actual pre-completion checklist.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This verification step is narrow enough for a single unit.
```

### M-052 - Cleanup Risk Register

```yaml
plan_unit_id: M-052
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation must account for over-aggressive clean, worktree path correctness, config wiring, evidence pruning timing, and no-secrets GitHub behavior as a risk register.
gui_related: true
gui_classification_reason: The unit includes cleanup UX/config risks and user-facing evidence or worktree consequences.
split_recommended: true
depends_on:
- M-006
- M-008
- M-011
- M-013
- M-017
- M-019
unblocks: []
acceptance_criteria:
- Conservative defaults and explicit allowlists mitigate git clean -fdx risk.
- work_dir is the actual worktree path when worktrees are used.
- Cleanup config is read from the same runtime config used by orchestrator.
- Evidence pruning avoids files for runs still writing evidence.
- Secrets are not force-added, logged, included in evidence, or included in PR bodies.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_risk_register_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_risk_register
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0062
preserved_exact_tokens:
- Over-aggressive clean
- git clean -fdx
- Worktree path
- Config wiring
- Evidence pruning
- Secrets to GitHub
negative_constraints:
- Never force-add ignored files.
- Never log or put tokens/keys in evidence or PR body.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Security constraints remain aligned with Architecture_Invariants and GitHub auth flows.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The risk register spans cleanup, storage, security, and GUI-visible config concerns.
```

### M-053 - Cleanup Signature Alignment Gap

```yaml
plan_unit_id: M-053
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup implementation must preserve the signature-alignment gap between REQUIREMENTS.md and the extended work_dir-aware cleanup_after_execution contract until the owner contract is reconciled.
gui_related: false
gui_classification_reason: The unit covers backend contract signatures and type alignment.
split_recommended: false
depends_on:
- M-013
- M-014
- M-015
unblocks: []
acceptance_criteria:
- The REQUIREMENTS.md prepare_working_directory and cleanup_after_execution signatures remain traceable.
- The plan's work_dir-aware cleanup_after_execution extension is preserved.
- Path and PathBuf alignment is called out for consistency.
- The gap is an implementation/contract alignment issue, not a product-decision blocker for standardization.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_signature_alignment_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_signature_alignment_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0064
preserved_exact_tokens:
- REQUIREMENTS.md §26.2
- "prepare_working_directory(&self, path: &str)"
- "cleanup_after_execution(&self, pid: u32)"
- "work_dir: &Path"
- Path
- PathBuf
negative_constraints: []
compatibility_only_notes:
- REQUIREMENTS signatures are preserved as compatibility/source lineage until reconciled.
stale_retired_dispositions: []
owner_boundary_notes:
- REQUIREMENTS.md owns the original runner-contract wording.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Signature alignment is narrow enough for a single unit.
```

### M-054 - Root State Git Clean Excludes

```yaml
plan_unit_id: M-054
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Git clean exclusions must protect root-level state files, ignore rules, and sensitive files even when those files are untracked.
gui_related: false
gui_classification_reason: The unit covers backend cleanup safety and security allowlist behavior.
split_recommended: false
depends_on:
- M-006
- M-011
- M-012
unblocks: []
acceptance_criteria:
- progress.txt, AGENTS.md, prd.json, .gitignore, and sensitive patterns are excluded from git clean.
- The allowlist is implemented in DRY:DATA and consumed by run_git_clean_with_excludes.
- Cleanup does not rely on these files always being tracked.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: root_state_git_clean_excludes_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: root_state_git_clean_excludes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0065
preserved_exact_tokens:
- progress.txt
- AGENTS.md
- prd.json
- .gitignore
- DRY:DATA
- git clean -fd
negative_constraints:
- Root-level state files must not be removed just because they are untracked.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- STATE_FILES.md owns state file definitions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Root state protection is a narrow cleanup safety unit.
```

### M-055 - Non-Git Prepare Policy

```yaml
plan_unit_id: M-055
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: prepare_working_directory must treat non-git or git-unavailable workspaces as best-effort cleanup cases that warn and continue instead of failing the iteration.
gui_related: false
gui_classification_reason: The unit covers backend prepare policy and runner error handling.
split_recommended: false
depends_on:
- M-013
unblocks: []
acceptance_criteria:
- git rev-parse --show-toplevel failure does not fail the iteration.
- "The app logs Prepare: not a git repo or git unavailable, skipping git clean."
- Optional non-git cleanup such as clearing agent-output may still run.
- prepare_working_directory returns Ok(()) for non-git skip cases.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_git_prepare_policy_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: non_git_prepare_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0066
preserved_exact_tokens:
- git rev-parse --show-toplevel
- "Prepare: not a git repo or git unavailable, skipping git clean"
- Ok(())
- agent-output
negative_constraints:
- Non-git workspaces must not abort the iteration just because git clean cannot run.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Runner execution owns the actual warning/logging surface.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Non-git prepare behavior is narrow enough for one unit.
```

### M-056 - Prepare No Reset And WorkDir Source

```yaml
plan_unit_id: M-056
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: prepare_working_directory must avoid tracked-state reset by default and must use the same work_dir source as execution instead of arbitrary current_dir cleanup.
gui_related: false
gui_classification_reason: The unit covers backend workspace selection and cleanup semantics rather than visible GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-015
unblocks: []
acceptance_criteria:
- prepare_working_directory does not run git checkout -- . or git restore . unless a future documented config flag enables reset.
- Optional stash/reset behavior is deferred to a future explicit config with documented order.
- Orchestrator cleanup uses the selected lane or attempt worktree or config.project.working_directory.
- Non-orchestrator flows pass the execution working_dir or skip cleanup when the intended workspace is unknown.
- std::env::current_dir() is avoided unless it is the intended workspace.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prepare_reset_workdir_source_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: prepare_no_reset_workdir_source
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0067
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0068
preserved_exact_tokens:
- git checkout -- .
- git restore .
- git stash
- stash -> prepare (reset if enabled) -> run -> cleanup -> stash pop (optional)
- get_tier_worktree(tier_id).unwrap_or_else(|| config.project.working_directory)
- std::env::current_dir()
- config.project.working_directory
negative_constraints:
- prepare_working_directory must not reset tracked state by default.
- Cleanup must not use current_dir unless it is the intended workspace.
compatibility_only_notes:
- get_tier_worktree and tier_id remain legacy-named compatibility inputs.
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement owns canonical lane/worktree selection semantics.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit combines reset policy and work_dir selection, both sharing prepare safety.
```

### M-057 - Git Clean Exclude Helper Contract

```yaml
plan_unit_id: M-057
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: run_git_clean_with_excludes must build git clean commands from the single allowlist data source using explicit -e patterns and tests that excluded paths are never removed.
gui_related: false
gui_classification_reason: The unit covers backend git-clean command construction and security invariant compliance.
split_recommended: false
depends_on:
- M-011
- M-012
unblocks: []
acceptance_criteria:
- The helper uses one -e flag per exclude pattern.
- Exact cleanup exclude patterns are documented in cleanup_exclude_patterns or CLEANUP_EXCLUDE_PATTERNS.
- Tests verify excluded paths are never removed.
- INV-002 and no_secrets_in_storage ContractRef remains traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: git_clean_exclude_helper_contract_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: git_clean_exclude_helper_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0069
preserved_exact_tokens:
- git clean -fd -e <pattern>
- -e
- DRY:FN:run_git_clean_with_excludes
- DRY:DATA
- CLEANUP_EXCLUDE_PATTERNS
negative_constraints:
- Exclude patterns must not be hardcoded at call sites.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Architecture_Invariants.md owns the no-secrets invariant.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The helper contract is narrow enough for a single unit.
```

### M-058 - Evidence Run Definition Gap

```yaml
plan_unit_id: M-058
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Evidence retain_last_runs behavior must not be relied on until run is defined for iteration, subtask, task, global, node, lane, or attempt lineage; retention_days is preferred until then.
gui_related: false
gui_classification_reason: The unit covers backend retention semantics and documentation rather than visible GUI.
split_recommended: false
depends_on:
- M-017
- M-019
unblocks: []
acceptance_criteria:
- The meaning of run for evidence.retain_last_runs is defined before run-based pruning is used.
- Evidence path or iteration log inference is documented if retain_last_runs is implemented.
- retention_days remains the preferred policy until run is well-defined.
- Current run, node, lane, or attempt lineage evidence is not pruned by ambiguity.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_run_definition_gap
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: evidence_run_definition_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0070
preserved_exact_tokens:
- evidence.retain_last_runs
- run
- iteration
- subtask
- task
- global
- retention_days
negative_constraints:
- Do not use retain_last_runs pruning without defining what counts as a run.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- storage-plan.md and evidence docs own final run/evidence lineage definitions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The gap is narrow and documented as implementation-readiness.
```

### M-059 - Manual Clean Worktrees Dry Run Preview

```yaml
plan_unit_id: M-059
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Manual Clean workspace may clean all active worktrees only through the canonical worktree list and should offer an optional dry-run preview using git clean -fd -n.
gui_related: true
gui_classification_reason: The unit defines user-visible manual cleanup worktree scope and preview behavior.
split_recommended: true
depends_on:
- M-012
- M-021
unblocks: []
acceptance_criteria:
- Clean all active worktrees uses worktree_manager, active_worktrees, or equivalent canonical state.
- If orchestrator state is unavailable, the action cleans only the main workspace or disables all-worktrees mode.
- Preview or Dry run can list paths from git clean -fd -n before confirmation.
- Preview is optional but must explain what would be removed if implemented.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: manual_clean_worktrees_preview_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: manual_clean_worktrees_dry_run_preview
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0071
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0072
preserved_exact_tokens:
- Clean workspace now
- all active worktrees
- worktree_manager
- active_worktrees
- Preview
- Dry run
- git clean -fd -n
negative_constraints:
- All-worktrees cleanup must not invent a worktree list outside canonical state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement owns worktree list persistence and repopulation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Manual clean worktree scope and preview are related user-facing safety features.
```

### M-060 - Prepare Failure Worktree Race Limits

```yaml
plan_unit_id: M-060
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup is best-effort on prepare failures, harmless for absent .puppet-master directories in worktrees, and explicitly limited for concurrent runs or shared workspaces.
gui_related: false
gui_classification_reason: The unit covers backend cleanup failure policy, worktree path behavior, and concurrency limits.
split_recommended: true
depends_on:
- M-008
- M-013
- M-014
unblocks: []
acceptance_criteria:
- prepare_working_directory errors are logged and execution continues.
- run_with_cleanup catches prepare errors and proceeds to runner.execute.
- Worktree cleanup runs in the worktree root and .puppet-master exclusions are harmless when absent.
- Concurrent cleanup races are acknowledged as out of scope or best-effort for v1.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prepare_failure_worktree_race_limits
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: prepare_failure_worktree_race_limits
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0073
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0075
preserved_exact_tokens:
- Best-effort
- run_with_cleanup
- runner.execute(request)
- .puppet-master/
- "Optional: concurrent runs"
- out of scope for v1
negative_constraints:
- Prepare failures must not abort the iteration.
compatibility_only_notes:
- Concurrent-run locking is not part of v1 cleanup unless later explicitly planned.
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree cleanup semantics apply per directory.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Failure, worktree, and race concerns remain separable implementation risks.
```

### M-061 - Cleanup After Execution No Broad Clean

```yaml
plan_unit_id: M-061
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: cleanup_after_execution must never run broad git clean on untracked workspace files because it runs before orchestrator commit and would delete current iteration output.
gui_related: false
gui_classification_reason: The unit covers backend execution ordering and cleanup semantics rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-013
- M-014
- M-015
unblocks: []
acceptance_criteria:
- cleanup_after_execution only kills or terminates processes, cleans runner temp files, and optionally removes known build-artifact dirs.
- Full workspace untracked cleanup runs only in prepare_working_directory before the run.
- Current iteration source/docs remain available for orchestrator staging and commit.
- The legacy/current plan wording about cleanup_after_execution running git clean is preserved as compatibility lineage but superseded.
- INV-002 and no_secrets_in_storage ContractRef remains traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_after_execution_broad_clean_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_after_execution_no_broad_clean
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0076
preserved_exact_tokens:
- cleanup_after_execution
- git clean -fd
- run_with_cleanup
- prepare -> execute -> cleanup
- commit_tier_progress
- runner temp files
- known build-artifact dirs
- target/
- prepare_working_directory
negative_constraints:
- Do not run broad git clean -fd in cleanup_after_execution.
- cleanup_after_execution must never remove untracked source or docs.
compatibility_only_notes:
- The old cleanup_after_execution workspace-clean wording is superseded by prepare-only broad cleanup.
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator commit ordering remains owned by orchestrator execution docs.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: The critical ordering fix is narrow and should remain independently addressable.
```

### M-062 - Output Location Allowlist Boundary

```yaml
plan_unit_id: M-062
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Interview, start-chain, wizard, and orchestrator outputs must stay under .puppet-master or be explicitly allowlisted so cleanup never removes canonical or current-iteration output.
gui_related: false
gui_classification_reason: The unit covers backend output path safety and cleanup allowlist behavior.
split_recommended: true
depends_on:
- M-006
- M-011
- M-016
- M-061
unblocks: []
acceptance_criteria:
- Interview output_dir and research output stay under .puppet-master/interview and .puppet-master/research.
- Start-chain and wizard outputs stay under .puppet-master/start-chain or another allowlisted path.
- Orchestrator unit plans stay under .puppet-master/plans.
- Any designed project-root output must be allowlisted or broad cleanup skipped for that flow.
- Current-iteration output is not deleted after execution.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: output_location_allowlist_boundary
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: output_location_allowlist_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0077
preserved_exact_tokens:
- .puppet-master/interview/
- .puppet-master/research/
- .puppet-master/start-chain/
- tier-plan.md
- .puppet-master/plans/
- PLAN.md
- REQUIREMENTS.md
negative_constraints:
- If interview writes final output to project root, that path must be allowlisted or broad cleanup skipped.
compatibility_only_notes:
- tier-plan.md is preserved as legacy-named source lineage.
stale_retired_dispositions: []
owner_boundary_notes:
- STATE_FILES.md owns canonical state/output path definitions.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Output path constraints span multiple flows and owner docs.
```

### M-063 - Cleanup Clarifications And Explicit Config

```yaml
plan_unit_id: M-063
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup clarification gaps must preserve prd.json protection, prepare-only cleanup toggles, prepare-style manual clean, cleanup_after_execution temp-only behavior, and explicit cleanup_config passing.
gui_related: true
gui_classification_reason: The unit includes GUI cleanup toggles, manual cleanup action behavior, and runtime config projection.
split_recommended: true
depends_on:
- M-021
- M-044
- M-061
unblocks: []
acceptance_criteria:
- prd.json remains excluded by cleanup allowlist and run_git_clean_with_excludes.
- cleanup.untracked controls prepare_working_directory before each run, not cleanup_after_execution.
- Manual Clean workspace invokes prepare-style git clean with excludes.
- Checklist wording that mentions workspace cleanup after execution is interpreted as runner temp and optional build-artifact cleanup only.
- cleanup_config is passed explicitly through IterationContext or equivalent and default behavior is documented.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_clarification_config_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_clarifications_explicit_config
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0078
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0079
preserved_exact_tokens:
- prd.json
- cleanup.untracked
- before each run
- prepare_working_directory
- cleanup_after_execution
- run_git_clean_with_excludes
- "cleanup_config: Option<CleanupConfig>"
- unwrap_or_default()
- 'CleanupConfig { untracked: true, clean_ignored: false, clear_agent_output: false, remove_build_artifacts: false }'
negative_constraints:
- cleanup_after_execution must not run workspace cleanup with excludes.
- A global current run config is not recommended.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Worktree Option B owns the run-config construction pattern consumed here.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Clarifications span GUI, manual clean, and execution config.
```

### M-064 - SDK Fallback Retired Disposition

```yaml
plan_unit_id: M-064
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: The prior execute_with_sdk_fallback cleanup gap is preserved as resolved, struck compatibility lineage because execution is now always CLI via runner.execute.
gui_related: false
gui_classification_reason: The unit records backend execution history and retired SDK fallback wording.
split_recommended: false
depends_on:
- M-044
unblocks: []
acceptance_criteria:
- Struck text for execute_with_sdk_fallback remains traceable as resolved history.
- Current state states execute_iteration calls runner.execute directly and prepare/cleanup wrap it.
- run_with_cleanup remains for call sites that call runner.execute directly.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: sdk_fallback_retired_lineage_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: sdk_fallback_retired_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0080
preserved_exact_tokens:
- execute_with_sdk_fallback
- SDK removed
- always CLI
- runner.execute()
- try_execute_with_sdk(request)
- Current state
negative_constraints: []
compatibility_only_notes:
- The SDK fallback gap is resolved and retained only as historical compatibility/source lineage.
stale_retired_dispositions:
- execute_with_sdk_fallback has been removed.
owner_boundary_notes:
- Executor docs own current execution path details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This retired gap is narrow enough for a compatibility disposition.
```

### M-065 - Execution-Affecting GUI Runtime Projection

```yaml
plan_unit_id: M-065
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Execution-affecting GUI settings must be projected into the Option B runtime config snapshot at run start and must not remain GUI-only state.
gui_related: true
gui_classification_reason: The unit governs user-visible GUI settings that alter runtime behavior.
split_recommended: true
depends_on:
- M-019
unblocks: []
acceptance_criteria:
- Interview question-limit settings, architecture-confirmation settings, vision-provider settings, HITL toggles, and orchestrator execution-affecting settings are projected into runtime config.
- GUI-visible but runtime-ignored execution settings are treated as defects.
- MiscPlan summarizes these requirements by ContractRef to owner SSOTs instead of restating open-ended wire-later status.
- Worktree, orchestrator, interview, and HITL ContractRefs remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_runtime_projection_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: execution_affecting_gui_runtime_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0081
preserved_exact_tokens:
- Execution-affecting GUI settings must not remain GUI-only state.
- Option B runtime config construction
- interview question-limit settings
- HITL phase/task/subtask/iteration toggles
- GUI-visible but runtime-ignored fields are defects
negative_constraints:
- GUI-visible execution-affecting settings must not remain runtime-ignored.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement.md, orchestrator-subagent-integration.md, interview-subagent-integration.md, and human-in-the-loop.md remain owner SSOTs.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md'
split_recommendation_reason: This GUI runtime projection rule touches multiple owner docs.
```

### M-066 - Shortcut Gap Guards

```yaml
plan_unit_id: M-066
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcut gap guards must preserve startup/config failure recovery, duplicate-binding rejection recommendation, export/import versioning, and unloaded-key-map tooltip behavior.
gui_related: true
gui_classification_reason: The unit defines user-visible shortcut toasts, tooltips, import errors, and conflict behavior.
split_recommended: false
depends_on:
- M-027
- M-028
- M-047
unblocks: []
acceptance_criteria:
- Corrupted or invalid shortcut config never crashes the app and falls back to defaults with the required toast.
- New shortcut conflicts are rejected with Already used by &lt;ActionName&gt; unless implementation intentionally selects another documented resolution.
- Export JSON includes version and unsupported imports are rejected clearly.
- Unloaded key maps show action label only or (Loading...) and never blank or (undefined).
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcut_gap_guard_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcut_gap_guards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0082
preserved_exact_tokens:
- Shortcuts reset to defaults due to config error
- Already used by &lt;ActionName&gt;
- version
- unsupported version
- STATE_FILES.md
- (Loading...)
- (undefined)
negative_constraints:
- The app must not crash when shortcuts config is corrupted or invalid.
- The UI must never show blank or (undefined) shortcut labels.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Core shortcut registry behavior remains covered by M-026 and M-047.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Gap guards are a coherent shortcut safety cluster.
```

### M-067 - Skills Runtime Compatibility Boundary

```yaml
plan_unit_id: M-067
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Skills runtime behavior is PM-native registry discovery, permission filtering, readiness validation, context bundling, and on-demand skill tool access; CLI/provider-native projections are compatibility-only.
gui_related: false
gui_classification_reason: The unit covers runtime skill delivery and provider compatibility boundaries.
split_recommended: true
depends_on:
- M-033
- M-035
- M-048
unblocks: []
acceptance_criteria:
- Direct providers consume PM-native skill bundling and PM tool availability.
- CLI-bridged providers may receive compatibility projections only when explicitly enabled.
- Runtime correctness still depends on PM-native bundling plus the PM skill tool.
- OpenCode server-bridged providers remain subject to the same PM-native skill canon.
- Skills_System, FileSafe, Tools, Prompt_Pipeline, CLI_Bridged_Providers, Provider_OpenCode, and Multi-Account ContractRefs remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: skills_runtime_compatibility_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: skills_runtime_compatibility_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0083
preserved_exact_tokens:
- registry discovery
- permission filtering
- readiness validation
- context bundling
- on-demand `skill` tool access
- provider-native skill runtime-delivery matrix
- CLI-bridged providers
- PM-native bundling plus the PM `skill` tool
- OpenCode
negative_constraints:
- Do not invent a separate provider-native skill runtime-delivery matrix for MVP.
compatibility_only_notes:
- CLI-bridged provider projections are compatibility-only and optional.
stale_retired_dispositions: []
owner_boundary_notes:
- Skills_System.md, Prompt_Pipeline.md, Tools.md, FileSafe.md, CLI_Bridged_Providers.md, Provider_OpenCode.md, and Multi-Account.md retain authority.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Multi-Account.md'
split_recommendation_reason: Runtime compatibility spans multiple provider owner docs.
```

### M-068 - Shortcuts Skills Implementation Risks

```yaml
plan_unit_id: M-068
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Shortcuts and Skills implementation planning must explicitly confirm Slint 1.15.1 key-event integration, Windows path-case behavior for skill discovery, and platform_specs skill injection per provider.
gui_related: true
gui_classification_reason: The unit affects GUI key handling, Skills list behavior, and provider-visible skill integration.
split_recommended: true
depends_on:
- M-047
- M-048
unblocks: []
acceptance_criteria:
- Slint key-event capture location and KeyMap application are confirmed against Slint 1.15.1 docs.
- Skill discovery handles Windows path case and separators as needed.
- platform_specs or equivalent documents how each provider receives skill list, paths, content, environment, prompt injection, or tools.
- list_skills_for_agent remains stubbed until platform-specific delivery is defined.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: shortcuts_skills_implementation_risk_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: shortcuts_skills_implementation_risks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0084
preserved_exact_tokens:
- Slint 1.15.1
- FocusScope
- KeyEvent
- Windows path case
- platform_specs skill injection
- Cursor
- Claude Code
- OpenCode
- Codex
- GitHub Copilot
- Gemini
negative_constraints: []
compatibility_only_notes:
- Provider skill injection remains stubbed until platform_specs or equivalent defines delivery.
stale_retired_dispositions: []
owner_boundary_notes:
- Provider docs and platform_specs own provider-specific delivery details.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Risks span GUI framework, OS filesystem behavior, and provider integration.
```

### M-069 - Cross-Plan Cleanup Owner Boundaries

```yaml
plan_unit_id: M-069
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cross-plan cleanup reconciliation must preserve owner boundaries for FileSafe, Worktree, newtools, Contracts, Crosswalk, Executor, Orchestrator, command aliases, package lanes, safe-points, historical lineage, and stale tier-era terminology.
gui_related: true
gui_classification_reason: The unit includes user-visible route/open cleanup, Source Control, help/search surfaces, and orchestrator tab/page retargeting.
split_recommended: true
depends_on:
- M-006
- M-008
- M-011
- M-022
- M-061
unblocks: []
acceptance_criteria:
- Cleanup scope remains package/lane/worktree aware and cannot erase another package's live artifacts.
- FileSafe write-scope rules remain package-scoped.
- Export/archive status alone does not authorize deletion of canonical historical record or worktree lineage.
- Route/open cleanup respects Contracts_V0, Crosswalk, FileManager, and command-catalog ownership.
- Tier language remains legacy decomposition/help compatibility terminology.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cross_plan_cleanup_owner_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cross_plan_cleanup_owner_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0085
preserved_exact_tokens:
- /FileSafe.md
- /WorktreeGitImprovement.md
- /newtools.md
- /Contracts_V0.md
- /Crosswalk.md
- /packages/graph
- /alias
- /worktree
- /historical
- /block/runtime-lineage
- /effective/runtime
- Tier language is legacy decomposition/help terminology.
negative_constraints:
- Per-subtask /worktree cleanup must not conflict with package-based lane pools.
- Export or archival status alone must not authorize deletion of canonical /historical record model or /worktree lineage.
compatibility_only_notes:
- Tier IDs and /request-era or tier-era state file names remain compatibility inputs only.
stale_retired_dispositions:
- Alias, deprecated command, and cleanup-command drift notes are retained as source-lineage reconciliation warnings.
owner_boundary_notes:
- Referenced owner docs retain their contract authority; MiscPlan records cleanup reconciliation constraints.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: The source span maps many owner boundaries and stale terminology constraints.
```

### M-070 - Worktree Cleanup Dependency Distinction

```yaml
plan_unit_id: M-070
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: MiscPlan cleanup must distinguish inside-workspace git clean from Worktree plan directory removal, while sharing run-config wiring, git binary resolution, worktree lists, and STATE_FILES updates.
gui_related: true
gui_classification_reason: The unit covers user-visible worktree cleanup controls and Doctor/Config interactions.
split_recommended: true
depends_on:
- M-012
- M-019
- M-021
- M-069
unblocks: []
acceptance_criteria:
- Cleanup config uses the same Option B config shape that the Worktree plan uses.
- run_git_clean_with_excludes uses path_utils::resolve_git_executable or the shared git binary resolver once available.
- Clean all worktrees uses reliable worktree list state after or with Worktree Phase 2.
- Worktree remove_worktree and cleanup_subtask_worktree remove directories, while MiscPlan cleanup removes untracked/ignored files inside the selected workspace or worktree.
- STATE_FILES updates stay in their own subsections.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_cleanup_dependency_distinction_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: worktree_cleanup_dependency_distinction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0086
preserved_exact_tokens:
- WorktreeGitImprovement.md
- Option B
- path_utils::resolve_git_executable()
- run_git_clean_with_excludes
- worktree_manager.list_worktrees()
- active_worktrees
- cleanup_subtask_worktree
- remove_worktree
- STATE_FILES.md
negative_constraints:
- Do not use Command::new("git") alone when shared git resolution is available.
- Do not confuse removing a worktree directory with cleaning untracked files inside a worktree.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement.md owns worktree directory lifecycle and active worktree state.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: This unit crosses config, git resolution, worktree lists, and cleanup semantics.
```

### M-071 - Orchestrator Cleanup Wrapper Boundary

```yaml
plan_unit_id: M-071
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Orchestrator agent runs, including future subagent execution paths, must use the shared prepare-execute-cleanup wrapper while preserving start/end verification ordering, parallel worktree isolation, and commit-order safety.
gui_related: false
gui_classification_reason: The unit covers backend orchestrator execution ordering and runner invocation.
split_recommended: true
depends_on:
- M-015
- M-044
- M-061
- M-070
unblocks: []
acceptance_criteria:
- New orchestrator or subagent execution paths do not call runner.execute directly without prepare/cleanup wrapping.
- verify_tier_start and verify_tier_end compatibility ordering remains outside iteration-level prepare/cleanup.
- Parallel subtasks run cleanup only in their own work_dir.
- cleanup_after_execution remains temp/build-artifact-only because commit_tier_progress happens later.
- Orchestrator plan remains a consumer and not a competing execution owner for cleanup semantics.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_cleanup_wrapper_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: orchestrator_cleanup_wrapper_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0087
preserved_exact_tokens:
- execute_tier_with_subagents
- run_with_cleanup
- runner.execute()
- verify_tier_start
- verify_tier_end
- prepare_working_directory
- cleanup_after_execution
- commit_tier_progress
negative_constraints:
- Do not call runner.execute directly from new orchestrator/subagent code without the cleanup wrapper.
- cleanup_after_execution must not remove untracked files before commit_tier_progress.
compatibility_only_notes:
- verify_tier_start, verify_tier_end, and commit_tier_progress are legacy-named compatibility lineage.
stale_retired_dispositions: []
owner_boundary_notes:
- orchestrator-subagent-integration.md consumes cleanup wrapper semantics and owns orchestrator-specific invocation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Orchestrator cleanup boundary spans verification, parallel execution, and commit ordering.
```

### M-072 - Interview Cleanup Wrapper Boundary

```yaml
plan_unit_id: M-072
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Interview runner and subagent invocation paths must use run_with_cleanup when they execute in a project workspace, and their generated output paths must remain under .puppet-master or allowlisted.
gui_related: false
gui_classification_reason: The unit covers backend interview execution and output path safety rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-015
- M-044
- M-062
unblocks: []
acceptance_criteria:
- research_pre_question_with_subagent and similar interview runner calls use run_with_cleanup.
- SubagentInvoker or equivalent platform invocation helpers centralize on the same wrapper.
- Interview, research, start-chain, wizard, and orchestrator outputs stay under .puppet-master or are explicitly allowlisted.
- Interview and orchestrator plan output paths remain safe from cleanup removal.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_cleanup_wrapper_boundary_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: interview_cleanup_wrapper_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0088
preserved_exact_tokens:
- research_pre_question_with_subagent
- runner.execute(&request)
- run_with_cleanup
- SubagentInvoker
- .puppet-master/interview/
- .puppet-master/research/
- .puppet-master/start-chain/
- .puppet-master/plans/
negative_constraints:
- Interview and subagent platform runs must not bypass cleanup wrapping when a project working directory is known.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- interview-subagent-integration.md owns interview-specific subagent invocation.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Interview wrapper behavior spans runner calls, subagent invocation, and output allowlist boundaries.
```

### M-073 - Runner Output Process Isolation And Agent Output Policy

```yaml
plan_unit_id: M-073
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Runner and cleanup paths must honor Plans/newfeatures.md §13 bounded subprocess output buffers, separate CLI process execution, and .puppet-master/agent-output/{run-id}/ preservation or clearing only by cleanup policy.
gui_related: false
gui_classification_reason: The unit covers backend runner process isolation, subprocess output buffering, and agent-output cleanup policy rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-015
- M-016
- M-062
unblocks: []
acceptance_criteria:
- Runner, cleanup, headless, and stream-consumer subprocess output uses bounded buffers with fixed max size and drop-oldest behavior.
- CLI execution remains in a separate process.
- Background agent output at .puppet-master/agent-output/{run-id}/ is allowlisted or cleared only by explicit cleanup policy.
- AGENTS.md documentation remains aligned with the bounded-buffer and process-isolation requirements.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runner_output_cleanup_policy_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: runner_output_process_isolation_agent_output_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0089
preserved_exact_tokens:
- Plans/newfeatures.md §13
- Bounded buffers and process isolation
- bounded buffers
- fixed max size
- drop oldest
- separate process
- ".puppet-master/agent-output/{run-id}/"
- Background/async agents
- "agent output"
negative_constraints:
- Subprocess stdout or stderr must not accumulate unbounded buffers.
- Cleanup must not erase background run output except through explicit agent-output cleanup policy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/newfeatures.md owns bounded-buffer, background-agent-output, and process-isolation canon; MiscPlan consumes those constraints for cleanup and runner paths.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Runner output policy and agent-output cleanup interaction are narrow enough for one backend unit.
```

### M-074 - Cleanup Crew Coordination Boundary

```yaml
plan_unit_id: M-074
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup crews, when used, are optional overlays made of PM child runs; coordination uses explicit shared state and crew-board messages rather than hidden memory files or active-agent side files.
gui_related: false
gui_classification_reason: The unit covers runtime coordination and child-run state rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-069
- M-071
unblocks: []
acceptance_criteria:
- Cleanup crews are optional overlays and not a separate persistent actor system.
- Cleanup crew members remain PM child runs.
- Cleanup crew coordination uses explicit shared state and crew-board messages when enabled.
- Hidden memory files and active-agent side files are not canonical cleanup coordination state.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_crew_coordination_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_crew_coordination_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0091
preserved_exact_tokens:
- Cleanup-operation crews
- cleanup crews are optional overlays
- PM child runs
- crew-board messages
- hidden memory files
- active-agent side files
- canonical cleanup coordination state
negative_constraints:
- Hidden memory files and active-agent side files are not canonical cleanup coordination state.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Orchestrator, storage, assistant-memory, Contracts, Prompt Pipeline, and Worktree owner docs retain authority for their referenced coordination and state contracts.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md'
split_recommendation_reason: Cleanup crew coordination is a coherent runtime boundary.
```

### M-075 - Cleanup Blocked Lifecycle And Continuity Contracts

```yaml
plan_unit_id: M-075
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup lifecycle and quality features use canonical child-run, blocked-state, permission, retry, reroute, cancellation, lineage, and handoff reconstruction contracts.
gui_related: false
gui_classification_reason: The unit covers backend lifecycle, permission, state, and handoff contracts rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-069
- M-074
unblocks: []
acceptance_criteria:
- Blocked cleanup actions use canonical blocked_reason_code and allowed_action_ids[].
- Cleanup retries, reroutes, and cancellation preserve canonical lineage.
- Cleanup continuity comes from canonical state and handoff reconstruction.
- Cleanup continuity does not rely on child-memory files.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_lifecycle_continuity_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_blocked_lifecycle_continuity_contracts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0092
preserved_exact_tokens:
- Cleanup lifecycle and quality features
- canonical child-run and blocked-state contracts
- blocked_reason_code
- "allowed_action_ids[]"
- cleanup retries
- reroutes
- cancellation
- canonical lineage
- handoff reconstruction
- child-memory files
negative_constraints:
- Cleanup continuity must not come from child-memory files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Contracts, Permissions, storage, Prompt Pipeline, assistant-memory, and Tools owner docs retain authority for the concrete state shapes and handoff contracts.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Tools.md'
split_recommendation_reason: Cleanup lifecycle and continuity form one contract-consumer boundary.
```

### M-076 - Safe-Point And Remediation Cleanup Preservation

```yaml
plan_unit_id: M-076
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Runner cleanup must preserve safe-point, remediation, blocked, retry, attempt, lane, worktree, evidence, and recovery lineage until terminal or superseded resolution.
gui_related: false
gui_classification_reason: The unit covers runtime recovery, state retention, and cleanup boundaries rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-013
- M-014
- M-015
- M-017
- M-058
- M-061
- M-069
unblocks: []
acceptance_criteria:
- prepare and cleanup logic does not erase or invalidate the baseline needed for retry_from_safe_point.
- Safe-point and remediation lineage metadata remain until the originating lineage reaches terminal or superseded resolution.
- Cleanup may compact derived summaries but does not destroy canonical history needed for recovery explanation and audit.
- Live cleanup never erases run, lane, or worktree lineage from History, Ledger, graph-linked inspection, or lane/worktree records.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: safe_point_remediation_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: safe_point_remediation_cleanup_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0097
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0098
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0099
preserved_exact_tokens:
- Runner Preparation/Cleanup and Safe-Point Canonical Alignment (2026-03-08)
- retry_from_safe_point
- safe-point metadata
- remediation lineage
- blocked/remediation states
- cleanup_eligible
- History
- Ledger
- graph-linked inspection
- lane/worktree records
- Runtime Cleanup / Recovery Preservation Addendum (2026-03-09)
- canonical history needed for recovery explanation and audit
negative_constraints:
- Prepare or cleanup logic must not erase or invalidate the baseline needed for retry_from_safe_point.
- Temporary cleanup behavior must not collapse blocked or remediation states into generic failure cleanup.
- Cleanup must not destroy the canonical history needed for recovery explanation and audit.
compatibility_only_notes:
- Cleanup artifact boundaries are node-level, not tier-scoped.
- Tier-era state file names such as progress.txt, AGENTS.md, and prd.json are compatibility inputs for cleanup, not canonical scoping anchors.
stale_retired_dispositions:
- tier_id no longer teaches a canonical cleanup scope anchor.
owner_boundary_notes:
- Storage and runtime contracts own persisted recovery, safe-point, remediation, attempt, lane, and evidence schemas.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Safe-point preservation spans runtime, storage, lane, evidence, and cleanup concepts and should remain split_recommended for implementation planning.
```

### M-077 - Cleanup Lane Lifecycle And User Action Separation

```yaml
plan_unit_id: M-077
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Cleanup UI and action semantics must keep lane lifecycle verbs and cleanup commands distinct so recover, archive, prune, remove, and Clean all worktrees cannot blur together.
gui_related: true
gui_classification_reason: The unit defines user-visible cleanup actions, labels, sorting/grouping, lane lifecycle verbs, and command routing.
split_recommended: true
depends_on:
- M-021
- M-059
- M-069
- M-070
- M-076
unblocks: []
acceptance_criteria:
- retained, cleanup_eligible, archived, removed, and revoked states remain semantically separate.
- Prune and recover actions do not imply remove.
- Clean all worktrees does not blur with recover, archive, prune, or remove lifecycle verbs.
- Cleanup command payloads with generic page filters are constrained by native-surface ownership.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cleanup_lifecycle_action_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: cleanup_lane_lifecycle_user_action_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0097
preserved_exact_tokens:
- retained
- cleanup_eligible
- archived
- removed
- revoked
- recover, archive, prune, remove
- Clean all worktrees
- Seams
- History
- Ledger
- "page: string"
- route/open
- cleanup commands
negative_constraints:
- Cleanup action labels must not imply stronger lifecycle transitions than the selected action.
- Cleanup command payloads with generic page filters must not undermine route/open or cleanup-command ownership.
compatibility_only_notes:
- Tier IDs and tier-era files remain compatibility inputs only.
stale_retired_dispositions:
- tier_id no longer teaches a canonical cleanup scope anchor.
owner_boundary_notes:
- Command catalog, routing, Source Control, Orchestrator, and cleanup owner docs constrain concrete payload shapes and native-surface ownership.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Lane lifecycle, UI action labeling, sorting, and command routing are related but implementation-spanning concerns.
```

### M-078 - Debug Investigation Restore-Point And Scope Tracking

```yaml
plan_unit_id: M-078
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Temporary debug instrumentation requires a restore point, instrumentation_id, declared scope, and explicit cleanup obligation before invasive temporary mutation.
gui_related: false
gui_classification_reason: The unit covers runtime debug mutation safety, restore-point coverage, and cleanup obligation tracking rather than direct GUI presentation.
split_recommended: false
depends_on:
- M-076
unblocks: []
acceptance_criteria:
- Before invasive instrumentation or temporary dependency/tooling changes, PM creates or updates a runtime_artifact.restore_point sufficient to revert the temporary state if cleanup fails.
- Every temporary debug mutation lane carries an instrumentation_id, declared scope, and explicit cleanup obligation.
- Cleanup accounts for code instrumentation, temporary env flags, dev dependencies, remote host installs, browser mocks, and other reversible debug-only changes.
- Invasive instrumentation does not proceed without rollback coverage.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_restore_point_scope_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: debug_investigation_restore_point_scope_tracking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0100
preserved_exact_tokens:
- Debug investigation instrumentation cleanup addendum (2026-03-23)
- runtime_artifact.restore_point
- instrumentation_id
- declared scope
- explicit cleanup obligation
- temporary env flags
- dev dependencies
- remote host installs
- browser mocks
- reversible debug-only changes
negative_constraints:
- PM must not apply invasive temporary instrumentation without rollback coverage.
compatibility_only_notes:
- Cursor-like Debug Mode remains an investigation workflow reference, not automatic MVP scope.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime artifact storage owns restore-point persistence; MiscPlan records cleanup and rollback obligations.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs: []
split_recommendation_reason: Restore-point and scope tracking are a discrete debug cleanup precondition.
```

### M-079 - Temporary Instrumentation Pipeline Lifecycle

```yaml
plan_unit_id: M-079
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Instrumentation-first debug behavior is not grounded MVP behavior until the temporary-instrumentation patch pipeline declares lifecycle, collector state, evidence sink, cleanup, rollback, and failed-cleanup semantics.
gui_related: false
gui_classification_reason: The unit covers backend debug pipeline lifecycle, evidence, cleanup, and rollback contracts rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-078
unblocks: []
acceptance_criteria:
- Temporary-instrumentation patch pipeline declares an instrumentation_id, collector_state, install/collect/remove sequence, debug-specific mutation rules, evidence sink contract, and explicit write cleanup/rollback semantics.
- Resolved, cancelled, and superseded investigations attempt cleanup automatically.
- Failed residue uses lifecycle failed_cleanup with stop_reason_code = investigation.cleanup_failed.
- Instrumentation-first behavior is not treated as grounded MVP behavior until this contract exists.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: temporary_instrumentation_lifecycle_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: temporary_instrumentation_pipeline_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- Investigation instrumentation lifecycle contract
- Instrumentation-first behavior is not grounded MVP behavior
- temporary-instrumentation patch pipeline
- instrumentation_id
- collector_state
- collector-state
- install/collect/remove
- evidence sink contract
- "/cleanup/rollback"
- failed_cleanup
- stop_reason_code = investigation.cleanup_failed
negative_constraints:
- Instrumentation-first behavior must not be treated as grounded MVP behavior until this contract is implemented.
compatibility_only_notes:
- blog-sourced Cursor-like behavior is hypothesis-first reference behavior only.
stale_retired_dispositions: []
owner_boundary_notes:
- Runtime, evidence, storage, assistant-chat, and GitHub integration owner docs retain authority for concrete storage, evidence, and export mechanics.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: Temporary instrumentation lifecycle spans collector state, mutation rules, evidence, cleanup, rollback, and failed residue semantics.
```

### M-080 - Debug Cleanup Residue Visibility And Bundle Records

```yaml
plan_unit_id: M-080
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Debug cleanup is per scope and instrumentation lane; bundle records carry cleanup summary, residual items, stop reason, surviving residue, and user-visible unresolved remnants.
gui_related: true
gui_classification_reason: The unit requires unresolved instrumentation remnants and residue to remain user-visible while preserving backend cleanup bundle state.
split_recommended: false
depends_on:
- M-078
- M-079
unblocks: []
acceptance_criteria:
- Cleanup is per scope and per instrumentation lane, not just per investigation.
- Bundle records carry cleanup_summary, cleanup_summary.residual_items[] or residual_items, stop_reason_code, and surviving residue.
- Cleanup state transitions use superseded when one owner supersedes another.
- PM does not allow two active investigations to add overlapping temporary instrumentation to the same target.
- Unresolved instrumentation remnants remain user-visible until cleaned up or explicitly accepted as follow-up work.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_cleanup_residue_visibility_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: debug_cleanup_residue_visibility_bundle_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0100
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- unresolved instrumentation remnants
- cleanup_summary
- "cleanup_summary.residual_items[] / residual_items"
- stop_reason_code
- surviving residue
- superseded
- two active investigations
- overlapping temporary instrumentation
- follow-up work
negative_constraints:
- PM must not let two active investigations add overlapping temporary instrumentation to the same target.
- PM must not hide unresolved instrumentation remnants before cleanup or explicit follow-up acceptance.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Bundle export, storage, assistant-chat, and GitHub integration consumers must not redefine debug cleanup state.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: Residue visibility and bundle records form a single user-visible cleanup obligation.
```

### M-081 - Debug Env Secret Tooling And Profiler Cleanup Boundary

```yaml
plan_unit_id: M-081
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: Debug cleanup must revert exact env and config changes, redact or hash obvious secrets before storage, export, or handoff, defer reusable tool registry ownership to Tools/newtools, and detach profiler sessions without overstating cleanup success.
gui_related: false
gui_classification_reason: The unit covers security, tooling ownership, environment/config rollback, and profiler cleanup rather than direct GUI presentation.
split_recommended: true
depends_on:
- M-078
- M-079
unblocks: []
acceptance_criteria:
- Env/config activation cleanup reverts the exact temporary flag, toggle, or value PM introduced.
- Process-env cleanup occurs by stopping or restarting without the temporary env when the change lived only in process env.
- Config edits use the same rollback rules as temporary source patch instrumentation.
- Obvious secrets are redacted or hashed before storage, export, or bundle handoff.
- Debugger or profiler attach instrumentation detaches temporary attach/profiler sessions, and detach failure without durable mutation stays localized instead of claiming cleanup success.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_secret_tooling_profiler_cleanup_drift
reasoning_tier: standard
context_scope: miscplan_cleanup_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: debug_env_secret_tooling_profiler_cleanup_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0101
preserved_exact_tokens:
- "/toggle/value"
- "/config"
- Authorization
- cookies
- session IDs
- API keys
- passwords
- private tokens
- Plans/Tools.md
- Plans/newtools.md
- "/tags"
- "/profiler"
- "/session"
- do not claim cleanup success
negative_constraints:
- Obvious secrets must not be stored, exported, or handed off without redaction or hashing.
- PM must not claim cleanup success when profiler detach fails and cleanup is not complete.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Tools.md and Plans/newtools.md own reusable tool registry details and tags; MiscPlan records debug cleanup roles and boundaries.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md'
split_recommendation_reason: Env/config rollback, secret handling, tool ownership, and profiler cleanup cross several implementation owners and should remain split_recommended.
```

### M-001 - Misc Plan Retired Source-Preserving Bridge

```yaml
plan_unit_id: M-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: M-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 095 because MiscPlan-S0001 through MiscPlan-S0105 are covered by M-002 through M-081 or explicit structural, retired, and migration-coverage dispositions. M-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained MiscPlan PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- M-073
- M-074
- M-075
- M-076
- M-077
- M-078
- M-079
- M-080
- M-081
unblocks: []
acceptance_criteria:
- M-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 095.
- MiscPlan-S0001 through MiscPlan-S0105 product coverage is owned by M-002 through M-081 or explicit structural, retired, and migration-coverage dispositions.
- M-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/MiscPlan.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MiscPlan-S0104
preserved_exact_tokens:
- M-001
- Misc Plan Residual Source-Preserving Bridge
- source_preserving_planunit
- source_preserving_bridge_retired
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- M-001 must not re-own MiscPlan-S0001 through MiscPlan-S0105 after Phase 2B batch 095.
- M-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- M-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former M-001 residual source-preserving bridge is retired by Phase 2B batch 095.
owner_boundary_notes:
- M-002 through M-081 and explicit coverage dispositions own MiscPlan product coverage after bridge retirement.
- MiscPlan-S0104 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/MiscPlan.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/WorktreeGitImprovement.md'
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
split_recommendation_reason: No split remains for the retired bridge; product coverage has been atomized or structurally dispositioned.
```

## Migration Coverage

Original hash: `37d2cb724014b4aa42d8ad8efe2c6269e508f7ca0e5fbf45209a1f97fb8373c4`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 092 atomized `MiscPlan-S0003`, `S0008`, `S0011` through `S0012`, `S0014` through `S0017`, `S0019` through `S0026`, and `S0028` through `S0035` into `M-002` through `M-017`, with `MiscPlan-S0001`, `S0004`, `S0005`, `S0010`, `S0013`, `S0018`, and `S0027` structurally dispositioned and summary spans mapped to the relevant fine-grained units. `M-001` remains a narrowed residual source-preserving bridge only for `MiscPlan-S0036` onward. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Phase 2B batch 093 atomized `MiscPlan-S0036` through `S0049` and `MiscPlan-S0050` source lines 791-800 into `M-018` through `M-036`. `M-001` remains a narrowed residual source-preserving bridge only for `MiscPlan-S0050` source line 801 onward, including `MiscPlan-S0102` through `S0105`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Phase 2B batch 094 atomized `MiscPlan-S0050` source lines 801-866 and `MiscPlan-S0051` through `S0088` into `M-037` through `M-072`, with `MiscPlan-S0063` structurally dispositioned through the adjacent risk/gap units. `M-001` remains a narrowed residual source-preserving bridge only for `MiscPlan-S0089` source line 1199 through `MiscPlan-S0105`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Phase 2B batch 095 atomized `MiscPlan-S0089`, `S0091`, `S0092`, and `S0097` through `S0101` into `M-073` through `M-081`; structurally dispositioned `MiscPlan-S0090`, `S0093` through `S0096`, `S0102`, `S0103`, and `S0105`; and retired `M-001` as migration-lineage compatibility for `MiscPlan-S0104`. `Plans/MiscPlan.md` now has no residual source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-001

### M-082 - References Status And Section 9.1.20 Recovery

```yaml
plan_unit_id: M-082
unit_type: constraint
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: >-
  MiscPlan duplicate References and Implementation status sections plus missing Section 9.1.20 are structural cleanup issues. Recovery should
  deduplicate repeated section bodies, preserve source-lineage for moved text, and restore or explicitly disposition the missing 9.1.20 anchor
  without changing product behavior.
gui_related: false
gui_classification_reason: MiscPlan section cleanup is documentation structure, not GUI presentation.
depends_on: [M-001]
unblocks: []
acceptance_criteria:
  - Duplicate References and Implementation status sections have one canonical live location each.
  - Section 9.1.20 resolves or is explicitly marked non-applicable/source-lineage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual heading/anchor review
risk_class: misc_doc_structure_drift
reasoning_tier: low
context_scope: misc_plan_doc_structure
implementation_surfaces: [Plans/MiscPlan.md]
node_compile_hint: {mode: structural_heading_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0041
preserved_exact_tokens: ["References", "Implementation status", "§9.1.20"]
negative_constraints:
  - Do not change product behavior while deduplicating structural sections.
owner_hints: [Plans/MiscPlan.md]
```

## Ledger Compile Addendum - pldg-20260614-002

### M-083 - Runner Platform Specs Skill Injection Contract

```yaml
plan_unit_id: M-083
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: >-
  Skills integration with runners is governed by a versioned `platform_specs` injection contract rather
  than a stub. For each provider runner, the contract records platform_id, runner_id/runtime_identity,
  skill/package identity, injection timing, capability/permission boundary, environment/secret boundary,
  compatibility matrix, failure/fallback behavior, audit/evidence refs, override policy, and owner
  approval path. `list_skills_for_agent` may inject skills only after those fields validate for the
  target runner.
gui_related: false
gui_classification_reason: Runner skill injection, capability, environment, and audit boundaries are backend/runtime contracts, not visual presentation.
depends_on: [M-082, MGAC-092, PS-113]
unblocks: []
acceptance_criteria:
  - Runner skill injection has a per-platform contract before skills are delivered to Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, or Gemini runners.
  - Injection validates runtime identity, capability/permission, environment/secret, compatibility, fallback, audit/evidence, override, and owner approval fields.
  - Skills runner integration is not described as stubbed in live canonical prose.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: runner_skill_injection_gap
reasoning_tier: high
context_scope: runner_platform_specs_skill_injection
implementation_surfaces: [Plans/MiscPlan.md, Plans/orchestrator-subagent-integration.md, Plans/Skills_System.md]
node_compile_hint: {mode: runner_platform_specs_skill_injection, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0118
  - pldg-20260614-002-part-3-fable-cleanup:atom-0119
preserved_exact_tokens: ["per-platform skill injection for runners", "is stubbed", "platform_specs", "list_skills_for_agent", "Cursor", "Claude Code", "OpenCode", "Codex", "GitHub Copilot", "Gemini"]
negative_constraints:
  - Do not inject skills into a runner without validating the `platform_specs` injection contract.
  - Do not let skill injection bypass capability/permission, environment/secret, compatibility, fallback, audit/evidence, override, or owner approval boundaries.
owner_hints: [Plans/MiscPlan.md, Plans/orchestrator-subagent-integration.md, Plans/Skills_System.md]
```
